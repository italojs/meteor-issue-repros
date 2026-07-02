# Repro — meteor/meteor#12688

**A publication using a positional (`$`) field projection crashes the whole
subscription on Meteor 3.5 (Change Streams), instead of falling back to polling.**

Upstream issue: https://github.com/meteor/meteor/issues/12688

## Root cause

On Meteor 3.5 the default reactivity order is `['changeStreams', 'oplog',
'polling']` (`packages/mongo/mongo_connection.js`). The Change Streams
availability check validates `skip`/`limit` and the selector, but **not** the
projection. So for `{ fields: { 'myArray.$': 1 } }` it reports Change Streams as
available, `ChangeStreamObserveDriver` is constructed, and its constructor calls
`LocalCollection._compileProjection(projection)` which **throws**
`MinimongoError: Minimongo doesn't support $ operator in projections yet` — the
subscription errors out and never becomes ready.

The **oplog** driver already guards this: `OplogObserveDriver.cursorSupported`
(`packages/mongo/oplog_observe_driver.js`) runs `_checkSupportedProjection` and
returns `false` for `$` projections, so selection falls through to polling
(which projects server-side in MongoDB and works). The Change Streams path is
missing the equivalent guard.

## App

[`app/`](app/) is `meteor create --minimal` + `meteor add mongo` (no rspack; the
bug is in server-side driver selection). [`server/main.js`](app/server/main.js)
publishes `Things.find({ 'myArray.foo': 1 }, { fields: { 'myArray.$': 1 } })`;
[`client/main.js`](app/client/main.js) subscribes and reports readiness.

## Reproduce

```bash
cd app && meteor run    # dev_bundle Mongo runs as a replica set → Change Streams
# open http://localhost:3100/
```

## Evidence — BEFORE (bug, on `devel` @ fe7d26b0f9)

Server log:

```
Exception from sub positional id ... MinimongoError: Minimongo doesn't support $ operator in projections yet.
    at LocalCollection._checkSupportedProjection (packages/minimongo/local_collection.js:1127:23)
    at LocalCollection._compileProjection (packages/minimongo/local_collection.js:1161:19)
```

Client verdict:

```
BUG: subscription not ready (error: Internal server error)
{ "ready": false, "error": "Internal server error", "doc": null }
```

## Evidence — AFTER (fix)

_(filled in once the fix is verified — see the PR)_
