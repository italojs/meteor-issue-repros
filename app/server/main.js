import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

// Repro for meteor/meteor#12029
// A method returns a native MongoDB driver ObjectId (as you get from
// rawCollection()/aggregate()). It should reach the client as a usable id, not
// as an empty object {}.
const Things = new Mongo.Collection("things12029");

// Regression check: a normal Meteor collection with ObjectID _ids must still
// round-trip its _id as a Mongo.ObjectID (this path never touches a native
// ObjectId via EJSON, so the fix must not change it).
const MongoIdThings = new Mongo.Collection("mongoIdThings12029", {
  idGeneration: "MONGO",
});

Meteor.methods({
  async getNativeOid() {
    const raw = Things.rawCollection();
    // The native driver generates a native ObjectId for insertedId.
    const { insertedId } = await raw.insertOne({ v: 1 });
    return {
      oid: insertedId,
      serverConstructor: insertedId?.constructor?.name,
      serverHex: insertedId?.toHexString?.(),
    };
  },

  async getFindOid() {
    if ((await MongoIdThings.find().countAsync()) === 0) {
      await MongoIdThings.insertAsync({ v: 1 });
    }
    const doc = await MongoIdThings.findOneAsync();
    return {
      id: doc._id,
      idConstructor: doc._id?.constructor?.name,
      idHex: doc._id?.toHexString?.() || doc._id?._str,
    };
  },
});
