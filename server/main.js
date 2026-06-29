import { Meteor } from "meteor/meteor";

// A unique-ish id per process instance so we can tell leaked instances apart
// in the logs. (Math.random is fine here; this is app code, not the harness.)
const instanceId = Math.random().toString(36).slice(2, 6);
let ticks = 0;

// Tick forever. If a leaked instance survives a dev-server restart, its ticks
// keep showing up in the logs interleaved with the new instance's.
Meteor.setInterval(() => {
  console.log(`[repro] instance ${instanceId} alive — tick ${ticks++}`);
}, 1000);

Meteor.startup(() => {
  // The trigger: register a SIGTERM handler that does NOT call process.exit().
  // This overrides Node's default "terminate on SIGTERM" behavior, so the
  // dev runner's `proc.kill()` (SIGTERM) no longer stops this process.
  process.on("SIGTERM", () => {
    console.log(`[repro] instance ${instanceId} received SIGTERM but is NOT exiting`);
  });
  console.log(`[repro] instance ${instanceId} started; SIGTERM handler installed`);
});
