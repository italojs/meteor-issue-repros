import { Meteor } from "meteor/meteor";

// Show what public settings this freshly-connected client actually received.
Meteor.startup(() => {
  const el = document.getElementById("dump");
  if (el) el.textContent = JSON.stringify(Meteor.settings.public, null, 2);
});
