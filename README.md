# meteor/meteor#13653 — infinite reload loop with `DDP_DEFAULT_CONNECTION_URL` to another origin

Setting `__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL` (or the `DDP_DEFAULT_CONNECTION_URL`
env var) to a **different origin** makes the page reload endlessly.

## Root cause
`packages/autoupdate/autoupdate_client.js` subscribes to `meteor_autoupdate_clientVersions` over
`Meteor.connection` **unconditionally**. When `DDP_DEFAULT_CONNECTION_URL` points at a different
server, that connection is the remote server, whose client-version hashes describe a *different app*
and never match this page's baked-in `autoupdateVersions`. So `checkNewVersionDocument` sees
`versionNonRefreshable` mismatch and calls `Package.reload.Reload._reload()`. After the reload the
same page loads, subscribes again, mismatches again → **infinite reload loop**.

## Fix
Skip the subscription when the DDP connection is cross-origin: add
`Autoupdate._isCrossOriginConnection()` (compares `DDP_DEFAULT_CONNECTION_URL`'s origin to
`window.location.origin`, client-only) and early-return from `Autoupdate._retrySubscription()` when it
is true. Cordova is unaffected (it uses `WebAppLocalServer.onNewVersionReady`, not this subscription).

## Reproduce (two apps, cross-origin)
1. App B (the DDP server): `meteor create serverB && cd serverB && meteor run --port 3100`.
2. App A (the page): `meteor create appA && cd appA`, then run pointing DDP at B:
   `DDP_DEFAULT_CONNECTION_URL=http://localhost:3100 meteor run --port 3000`.
3. Open `http://localhost:3000` — **before the fix** the page reloads in a loop (watch the browser
   reloading repeatedly / the network tab re-fetching the document). **After the fix** it loads once
   and stays (autoupdate simply skips its version subscription for the cross-origin server).

## Guard logic (standalone)
`node origin-check.js` demonstrates the exact origin comparison the fix uses across same-origin,
different-host, different-port, different-protocol and protocol-relative URLs.
