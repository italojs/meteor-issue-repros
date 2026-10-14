import { createRoot } from "react-dom/client";
import { Meteor } from "meteor/meteor";
import { App } from "/imports/ui/App";
import "/imports/ui/styles.css";

Meteor.startup(() => {
  const container = document.getElementById("react-target");
  const root = createRoot(container);
  root.render(<App />);
});

const tag = (strings) => strings[0];
console.log(tag`tagged template literal`);
window.__issue14397 = tag`tagged template literal`;
