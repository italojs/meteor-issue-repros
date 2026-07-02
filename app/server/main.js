import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

// Repro for meteor/meteor#12029
// A method returns a native MongoDB driver ObjectId (as you get from
// rawCollection()/aggregate()). It should reach the client as a usable id, not
// as an empty object {}.
const Things = new Mongo.Collection("things12029");

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
});
