# Repro: meteor/meteor#13489 — `Meteor.settings.public` runtime updates not sent to new clients

Upstream issue: https://github.com/meteor/meteor/issues/13489

## What the docs promise

The [`Meteor.settings` docs](https://docs.meteor.com/api/meteor.html#Meteor-settings) state
that changes made to `Meteor.settings.public` at runtime are picked up by **new client
connections**. A contributor confirmed this worked in Meteor v2.0 and regressed around
v2.14 (after Fibers were dropped). It still reproduces on the current `devel` branch.

## The bug

Mutations to `Meteor.settings.public` that happen **after server startup has finished**
never reach newly-connecting clients. They are visible on the server, but the
`__meteor_runtime_config__.PUBLIC_SETTINGS` blob embedded in the HTML served to clients
is frozen to whatever the settings were when the boilerplate was first generated at
startup.

## Reproduction

This is a minimal Meteor app. `server/main.js` mutates `Meteor.settings.public` at three
points:

1. `fooFirst` — at top level (before startup completes)
2. `fooSecond` — synchronously inside a `Meteor.startup()` callback
3. `fooThird` — **3s after startup**, inside a `Meteor.setTimeout`

```bash
meteor run --port 3100
# wait for "App running", then ~3s for fooThird to be set
curl -s http://localhost:3100/ | grep -o 'fooThird' || echo 'fooThird NOT served'
```

### Observed (bug)

Server log confirms all three values are set on the server:

```
[repro] server Meteor.settings.public is now: {"fooFirst":"set-at-top-level","fooSecond":"set-in-startup","fooThird":"set-after-startup"}
```

But the runtime config served to a fresh client only contains the first two:

```
__meteor_runtime_config__ = JSON.parse(decodeURIComponent("...
  "PUBLIC_SETTINGS":{"fooFirst":"set-at-top-level","fooSecond":"set-in-startup"} ...
```

Presence check against the served HTML:

```
fooFirst:  PRESENT
fooSecond: PRESENT
fooThird:  ABSENT   <-- bug: set after startup, never sent to new clients
```

### Expected

`fooThird` should be present in `PUBLIC_SETTINGS` for any client that connects after it
was set — that is what the documentation guarantees.

## Root cause

`packages/webapp/webapp_server.js` encodes `meteorRuntimeConfig` (which embeds
`PUBLIC_SETTINGS`) **once**, inside `generateBoilerplateInstance` at startup, and caches
the resulting `Boilerplate` in `boilerplateByArch[arch]`. `getBoilerplateAsync` then serves
the cached `boilerplate.baseData.meteorRuntimeConfig` to every request, so post-startup
mutations of `Meteor.settings.public` are never re-encoded for new connections.

<!-- AFTER-FIX evidence appended below once the fix is verified against this app. -->
