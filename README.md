# Repro: meteor/meteor#13490 — SIGTERM listener leaks dev server instances

Upstream issue: https://github.com/meteor/meteor/issues/13490

## The bug

Registering a `process.on('SIGTERM', ...)` handler in a Meteor app's server code
prevents the dev server from stopping the old app instance when it restarts (on a
file change). The old process keeps running — it leaks across restarts and keeps
holding the port, which can turn into a crash loop for the new instance.

Root cause: `tools/runners/run-app.js` `AppProcess.stop()` only calls
`self.proc.kill()`, which sends the default **SIGTERM**. An app that installs its
own `SIGTERM` handler and does not call `process.exit()` overrides Node's default
"terminate on SIGTERM" behavior, so the process survives. There is no escalation
to `SIGKILL` (unlike `run-mongo.js`, which already does SIGTERM→SIGKILL).

## Reproduction

`server/main.js`:

- ticks every second, logging a per-process random `instanceId`, and
- in `Meteor.startup`, registers a `SIGTERM` handler that logs but does **not** exit.

```bash
meteor run --port 3100
# wait for "App running", then edit server/main.js (any change) to trigger a restart
```

### Observed (bug)

After one restart, **two** app processes are alive and both keep ticking:

```
=> Server modified -- restarting...   [repro] instance j71z received SIGTERM but is NOT exiting
[repro] instance xc8b alive — tick 18
[repro] instance j71z alive — tick 74     <-- OLD instance, should be dead
[repro] instance xc8b alive — tick 19
[repro] instance j71z alive — tick 75
...
# distinct instance ids ticking simultaneously:
#   15 instance j71z   (leaked)
#   15 instance xc8b   (new)
# app node processes for this app: 2
```

### Expected

The old instance should be stopped when the dev server restarts — exactly one app
process should be alive afterwards.

## After the fix

With `run-app.js` escalating SIGTERM→SIGKILL after a short grace period, the same
restart leaves only the new instance alive; the old one stops ticking and is gone:

```
[repro] instance 1l7f received SIGTERM but is NOT exiting
[repro] instance f2yq alive — tick 18
[repro] instance 1l7f alive — tick ...   <-- old instance, killed after the grace period
[repro] instance f2yq alive — tick 19
...
# after the SIGKILL grace period, only the new instance keeps ticking:
[repro] instance f2yq alive — tick 29
[repro] instance f2yq alive — tick 30
# app node processes for this app: 1
```

The old instance receives SIGTERM, ignores it, and is force-killed after the grace
period — no leaked process, port freed for the new instance.
