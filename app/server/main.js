import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

// Repro for meteor/meteor#12688
// A publication that uses a positional ($) projection. On Meteor 3.5 the default
// reactivity driver is Change Streams, whose availability check does NOT validate
// the projection, so the ChangeStreamObserveDriver constructor throws on the "$"
// projection and the subscription crashes (never becomes ready).
const Things = new Mongo.Collection("things12688");

Meteor.startup(async () => {
  if ((await Things.find().countAsync()) === 0) {
    await Things.insertAsync({
      _id: "doc1",
      myArray: [
        { foo: 1, val: "a" },
        { foo: 2, val: "b" },
      ],
    });
  }
});

Meteor.publish("positional", function () {
  // Only the matched array element should be projected (positional $).
  return Things.find({ "myArray.foo": 1 }, { fields: { "myArray.$": 1 } });
});

Meteor.methods({
  async bump() {
    await Things.updateAsync(
      { "myArray.foo": 1 },
      { $set: { "myArray.$.val": "x" + Date.now() } }
    );
    return true;
  },
});
