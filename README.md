# Meteor 3.5 change-stream `ChangeStreamHistoryLost` restart-loop repro

Reproduces an infinite restart loop in Meteor 3.5's change-stream observe
driver (`packages/mongo/shared_change_stream.js`): when the stored resume
token falls out of the MongoDB oplog, any stream error/close triggers a
restart that re-sends the same stale `startAfter` token. The server rejects
it with error 286 (`ChangeStreamHistoryLost`, label
`NonResumableChangeStreamError`), the driver never clears the token, and the
error → restart → error loop runs forever (~10x/sec) until the app process is
restarted.

This was observed in production after Mongo Atlas auto-scaling

## Run

```bash
cd app
meteor run --settings settings.json
```

`settings.json` forces the change-stream reactivity driver:

```json
{ "packages": { "mongo": { "reactivity": ["changeStreams"] } } }
```

The dev MongoDB that `meteor run` starts is a single-node replica set with an
8MB oplog (`--oplogSize 8`), which makes the oplog easy to roll.

## Steps (buttons in the UI)

1. **Insert quiet doc** — the server opened an observe on the `quiet`
   collection at startup; this produces one change event so the shared change
   stream stores a resume token. The collection then goes quiet, so the token
   only gets older. 
   This is the same pattern we observed in production with our "MaintenanceWindow" 
   notifier collection which triggered this issue.

2. **Roll the oplog** — bulk-writes ~100KB docs to an unrelated `noise`
   collection in paced batches until the oldest oplog entry is newer than the
   stored token. (Paced, because WiredTiger truncates the capped oplog lazily
   on a background thread that only catches up between writes — a tight write
   loop grows the oplog far past its cap without ever trimming the head.)
   Takes ~1 minute. The status table shows "Resume token rolled out of
   oplog: true" when done.

3. **Kill change-stream cursor** — finds the change-stream cursor on `quiet`
   via `$currentOp` and kills it with `killCursors`, forcing the driver to
   resume with the now-unresumable token.

## Expected result

The **server console** immediately enters a permanent loop:

```
ChangeStream error: { collectionName: 'quiet', resumeTokenPresent: true,
  error: MongoServerError ... code: 286, codeName: 'ChangeStreamHistoryLost',
  errorLabelSet: Set(1) { 'NonResumableChangeStreamError' } }
ChangeStream restart begin: { collectionName: 'quiet', resumeTokenPresent: true }
ChangeStream restart done:  { collectionName: 'quiet' }
ChangeStream closed unexpectedly, scheduling restart: ...
(repeats forever)
```

"restart done" logs each cycle because `collection.watch()` itself succeeds —
the 286 error only surfaces on the first getMore, which schedules the next
restart with the same stale token.

## Controls

- Restart the Meteor server mid-loop → loop stops (the token is in-memory
  only), confirming nothing environmental is wrong.
- Edit `settings.json` to `..."reactivity": ["oplog", "polling"]...`   → no loop.

Step 3 is just a deterministic stand-in for what any primary election,
network blip, or cursor timeout does in production. In a real deployment the
trap arms silently: a quiet-but-observed collection's token ages past the
oplog window, and the next transient stream hiccup starts the loop on every
app server at once.

## Fix suggestion

In `SharedChangeStream`'s error handling, detect `error.code === 286` /
`error.errorLabelSet.has('NonResumableChangeStreamError')`, clear
`this._resumeToken` before restarting (falling back to
`startAtOperationTime` = now), and force attached observe drivers to re-run
their initial query since events in the lost window were missed.

## Headless verification

`server/main.js` also ships a headless driver: run with `REPRO_AUTO=1` and the
whole sequence (insert quiet → roll oplog → kill cursor → watch 15s) runs on
startup and prints a machine-readable verdict, counting change-stream restart
cycles over the window. The bug loops ~10x/sec; a healthy stream restarts a
couple of times and settles.

```bash
cd app
REPRO_AUTO=1 meteor run --settings settings.json --port 3210
```

### Before (stock Meteor 3.5 — bug present)

```
[repro-auto] step 4: killCursor
[repro-auto] observing the stream for 15s…
[repro-auto] RESULT restarts-in-15s=144 historyLostErrors-in-15s=144
[repro-auto] VERDICT: BUG REPRODUCED — change stream is stuck in a restart loop
```

The server console floods with `code: 286 ChangeStreamHistoryLost` and every
`ChangeStream restart begin` logs `resumeTokenPresent: true` — the stale token
is re-sent forever.

### After (with the fix — healthy)

Run the same app against a Meteor checkout that carries the fix
(`REPRO_AUTO=1 /path/to/checkout/meteor run --settings settings.json`):

```
ChangeStream error: { … code: 286, codeName: 'ChangeStreamHistoryLost' }
ChangeStream restart begin: { collectionName: 'quiet', resumeTokenPresent: true }
ChangeStream restart done:  { collectionName: 'quiet' }
ChangeStream restart begin: { collectionName: 'quiet', resumeTokenPresent: false }
ChangeStream restart done:  { collectionName: 'quiet' }
[repro-auto] RESULT restarts-in-15s=2 historyLostErrors-in-15s=1
[repro-auto] VERDICT: HEALTHY — change stream recovered, no restart loop
```

The 286 fires once; the next restart logs `resumeTokenPresent: false` (the
token was dropped), the stream reopens from `startAtOperationTime`, and the
loop is gone.
