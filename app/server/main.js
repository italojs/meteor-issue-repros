import { Meteor } from "meteor/meteor";
import { onPageLoad } from "meteor/server-render";

Meteor.startup(() => {
  // Code to run on server startup.
  console.log(`Greetings from ${module.id}!`);
});

onPageLoad(sink => {
  // Code to run on every request.
  sink.renderIntoElementById(
    "server-render-target",
    `Server time: ${new Date}`
  );
});

// Repro for meteor/meteor#12164: the 'meteor' package IS installed, but this
// file within it does not exist. The error should say the MODULE is missing,
// not that the package is missing.
import 'meteor/meteor/this-file-does-not-exist';
