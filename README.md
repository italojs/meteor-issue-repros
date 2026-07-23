# meteor/meteor#14600 — change-stream fence test CI regression (release-3.5.1)

Upstream issue: https://github.com/meteor/meteor/issues/14600

This is a **CI regression on the `release-3.5.1` branch**, not an app-level bug,
so the reproduction is "run the change-stream tinytests on `release-3.5.1`" —
there is no separate app to build.

## Symptom

The `test-packages (changeStreams,polling)` job fails deterministically:

```
tinytest - changestream- _waitUntilCaughtUp still waits for its own connection (#14600) : FAIL
  details: { type: "string_equal",
             message: "a ts for our own connection and collection must still block the wait",
             expected: "still-waiting", actual: "resolved" }
```

Green on 2026-07-20/07-21, red from 2026-07-22 onward.

## Which change broke it

Two upstream PRs interact:

- **#14602** (merged 07-20) added the test + the fence-key-by-connection fix for
  issue #14600. The test asserts `_waitUntilCaughtUp(ownFence)` still **blocks**
  on a target ts one hour in the future, built as a plain `{ t, i }` object.
- **#14564** (merged 07-22, "change-stream fence/multiplexer queue deadlock")
  added a caught-up-floor **seed**: on driver start it pings the server and
  `_setLastProcessedOperationTime(pingRes.operationTime)`.

Before #14564, `_lastProcessedOperationTime` was `null` at this point, so the
guard `if (this._lastProcessedOperationTime && compare(...) >= 0) return;` was
skipped and the wait parked (→ "still-waiting"). The seed makes the field
non-null, so the comparison now runs — and exposes the root-cause bug.

## Root cause

`compareOperationTimes(a, b)` in `packages/mongo/mongo_common.js` was:

```js
new MongoDB.Timestamp(a).compare(b);   // only `a` wrapped
```

`MongoDB.Timestamp#compare` never reads `.t`/`.i` off a **plain object**, so a
`{ t, i }` second operand mis-compares. The function's own JSDoc documents
`{t,i}` as an accepted form for `opTime2`, so this violates its contract.

Empirically (mongodb 6.16.0 bson), with `now = Math.floor(Date.now()/1000)`:

```
compareOperationTimes(Timestamp(now), { t: now+3600, i: 1 })      = 1    // ≥0 → resolves early (BUG)
compareOperationTimes(Timestamp(now), Timestamp({t: now+3600}))   = -1   // <0 → blocks (correct)
```

Production is unaffected: real fence target ts values are always BSON
`Timestamp`s (`session.operationTime`), and all four callers pass real
Timestamps. Only the test passes the documented `{t,i}` object form.

## How to reproduce locally

Requires a `meteor/meteor` checkout. The dev_bundle Mongo 7 runs as a
single-node replica set, so change streams work locally out of the box.

```bash
# 1. Check out release-3.5.1 (7422f270d9 at time of writing) in a worktree,
#    symlinking dev_bundle from a built checkout:
git worktree add --detach /tmp/cs-repro origin/release-3.5.1
ln -s /path/to/built/meteor-source/dev_bundle /tmp/cs-repro/dev_bundle
cd /tmp/cs-repro

# 2. Run the mongo package tests under the change-streams reactivity order
#    (the changestream_*_tests self-skip unless METEOR_REACTIVITY_ORDER
#    starts with changeStreams):
METEOR_REACTIVITY_ORDER=changeStreams METEOR_HEADLESS=true METEOR_NO_DEPRECATION=true \
  ./packages/test-in-console/run.sh mongo
```

Watch for:

```
changestream- _waitUntilCaughtUp still waits for its own connection (#14600) : FAIL
```

## Fix and after-evidence

One-line change in `packages/mongo/mongo_common.js` — wrap both operands:

```js
new MongoDB.Timestamp(opTime1).compare(new MongoDB.Timestamp(opTime2));
```

Re-running the same suite with the fix applied:

```
changestream- _waitUntilCaughtUp returns fast when fence ts is already processed  : OK
changestream- _waitUntilCaughtUp ignores annotation from another connection (#14600) : OK
changestream- _waitUntilCaughtUp still waits for its own connection (#14600)       : OK   ← was FAIL
changestream- a second connection annotates its own fence key (#14600)            : OK
changestream- stop() releases a fence waiter parked in _waitUntilCaughtUp (#14452) : OK
=> 0 change-stream failures
```

Real-vs-real Timestamp comparisons are byte-identical before/after, so there is
no production behavior change.
