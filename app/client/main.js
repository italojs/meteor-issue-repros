import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

// Repro for meteor/meteor#12688 — subscribe to the positional-projection
// publication and report whether it becomes ready and delivers data.
const Things = new Mongo.Collection("things12688");

const state = { ready: false, error: null, doc: null, changedVal: null };

function render() {
  const pre = document.getElementById("probe") || document.createElement("pre");
  pre.id = "probe";
  pre.textContent = JSON.stringify(state, null, 2);
  document.body.appendChild(pre);

  const v = document.getElementById("verdict") || document.createElement("div");
  v.id = "verdict";
  v.textContent = state.ready
    ? "OK: subscription ready; doc=" + JSON.stringify(state.doc)
    : "BUG: subscription not ready" + (state.error ? " (error: " + state.error + ")" : "");
  document.body.appendChild(v);
}

Meteor.startup(() => {
  render();
  Meteor.subscribe("positional", {
    onReady() {
      state.ready = true;
      state.doc = Things.findOne("doc1");
      render();
      // trigger a reactive update to confirm change delivery
      Things.find("doc1").observeChanges({
        changed(id, fields) {
          if (fields.myArray) state.changedVal = JSON.stringify(fields.myArray);
          render();
        },
      });
      Meteor.call("bump");
    },
    onStop(err) {
      state.error = err ? (err.reason || err.message || String(err)) : "stopped";
      render();
    },
  });
});
