# Repro — meteor/meteor#12029

**A native MongoDB driver `ObjectId` returned from a method reaches the client
as an unusable object, not as a `Mongo.ObjectID`.**

Upstream issue: https://github.com/meteor/meteor/issues/12029

## Root cause

`Mongo.ObjectID` (package `mongo-id`) is registered as the EJSON type `oid`
(`typeName() -> 'oid'`, `toJSONValue() -> hex`). The **native** driver ObjectId
(`bson`'s `ObjectId`, which you get from `rawCollection()`/`aggregate()`) is not
an EJSON type, so when a method returns one it is serialized generically.

`packages/mongo/mongo_common.js` already converts native ObjectId ->
`Mongo.ObjectID` inside `replaceMongoAtomWithMeteor`, but that only runs for
`find()` results — **not** for arbitrary method return values. So a native
ObjectId returned by a method bypasses it and reaches the client unusable.

With older `bson` the object arrived empty (`{}`, the reported symptom); with the
current `bson` it arrives as `{ buffer: {...} }` — either way the client cannot
recover the id.

## App

[`app/`](app/) is `meteor create` (default). [`server/main.js`](app/server/main.js)
has a method that returns a native ObjectId from `rawCollection().insertOne`;
[`client/main.jsx`](app/client/main.jsx) calls it and reports what arrived.

## Reproduce

```bash
cd app && meteor run
# open http://localhost:3100/ and read the verdict / console [oid-probe]
```

## Evidence — BEFORE (bug, on `devel` @ ebbdd065dd)

```json
{
  "serverConstructor": "ObjectId",
  "serverHex": "6a46ce40157967d541f377a0",
  "clientType": "object",
  "clientKeys": ["buffer"],
  "clientHex": null,
  "roundTrips": false
}
```

Verdict: **BUG: client cannot recover the ObjectId (keys=["buffer"], hex=null)**

## The fix

`packages/mongo/mongo_common.js` (server-only) teaches EJSON to serialize a
native driver ObjectId as the same `oid` type used by `Mongo.ObjectID`, so it
round-trips to a `Mongo.ObjectID` on the client. A Tinytest is added in
`packages/mongo/tests/collection_tests.js`.

## Evidence — AFTER (fix)

The method's native ObjectId now arrives as a usable `Mongo.ObjectID`
(`clientKeys: ["_str"]`, `clientHex === serverHex`):

```json
{
  "serverConstructor": "ObjectId",
  "clientKeys": ["_str"],
  "clientHex": "6a46cf5c3fcf361416cfa337",
  "roundTrips": true
}
```

Verdict: **OK: client received a usable ObjectId (…)**

Regression: a normal `Mongo.ObjectID` from `find()` still round-trips
(`OK (regression): find() ObjectID round-trips (…)`) — the fix only affects
native ObjectIds, which were previously unusable anyway.
