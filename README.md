# meteor/meteor#14594 — Invalid URL crashes the server via the SockJS transport

**Issue:** https://github.com/meteor/meteor/issues/14594
**Affected:** `packages/ddp-server/transports/sockjs.js` (Meteor 3.5.0 / ddp-server 3.3.0)
**Status:** ✅ reproduced — a malformed request URL takes the whole server process down.

## Summary

Meteor's SockJS transport rewrites `/websocket` requests to `/sockjs/websocket`.
To run *before* the connect/webapp stack, it removes every existing
`'request'`/`'upgrade'` listener from the HTTP server and reinstalls its own
wrapper (`redirectWebsocketEndpoint` → `newListener`). That wrapper does:

```js
var parsedUrl = new URL(request.url, 'http://localhost');
```

`new URL()` throws `TypeError: Invalid URL` for request targets such as `//` or
`//%5Cexample.com`. Because `newListener` is a plain `EventEmitter` listener —
**not** connect middleware — the throw is **uncaught** and crashes the process.

Anyone can send these requests (`curl`, a crawler, a bad link), so this is an
unauthenticated remote crash / DoS. A fresh `meteor create` app reproduces it.

> Note: `packages/webapp/webapp_server.js` uses the very same
> `new URL(request.url, 'http://localhost')` pattern, but there it runs inside a
> connect middleware, so a throw becomes a 500 instead of crashing. Only the
> SockJS listener crashes the process.

## What's in here

| File | Purpose |
|------|---------|
| `sockjs-redirect.js` | Standalone copy of `redirectWebsocketEndpoint`, with a `fixed` flag toggling the current devel behavior vs. the proposed try/catch fix. |
| `repro.js` | Real `http.Server` + the sockjs listener, driven by **raw TCP** so `//` reaches the server un-normalized (browsers send it raw). |
| `run.sh` | Runs both modes and prints exit codes. |

## Reproduce

```bash
node repro.js buggy   # current devel  -> uncaught TypeError, process exits 1
node repro.js fixed   # proposed fix   -> both requests answered, exits 0
# or both at once:
bash run.sh
```

No dependencies — plain Node (tested on Node v24.17.0).

## Evidence

### Before (current `devel` behavior) — CRASH

```
[buggy] listening on 127.0.0.1:61845
[buggy] --> GET //
node:internal/url:840
      href = bindingUrl.parse(input, base, true);
                        ^

TypeError: Invalid URL
    at new URL (node:internal/url:840:25)
    at Server.newListener (sockjs-redirect.js:46:27)
    at Server.emit (node:events:509:28)
    at parserOnIncoming (node:_http_server:1226:12)
    at HTTPParser.parserOnHeadersComplete (node:_http_common:125:17) {
  code: 'ERR_INVALID_URL',
  input: '//',
  base: 'http://localhost'
}
exit code: 1
```

This matches the stack trace in the issue exactly (`new URL` →
`Server.newListener` → `Server.emit` → `parserOnIncoming` →
`HTTPParser.parserOnHeadersComplete`, `code: 'ERR_INVALID_URL'`, `input: '//'`).
The second malformed URL never even runs — the first one already killed the
process.

### After (proposed fix — try/catch around the parse/rewrite) — SURVIVES

```
[fixed] listening on 127.0.0.1:61847
[fixed] --> GET //
[fixed] <-- HTTP/1.1 404 Not Found
[fixed] --> GET //%5Cexample.com
[fixed] <-- HTTP/1.1 404 Not Found
[fixed] ✅ all 2 malformed requests handled — server still alive
exit code: 0
```

Malformed URLs are left untouched and fall through to the normal request stack,
which responds normally (404 here) instead of crashing.

## Fix

Wrap the URL parse + rewrite in `try/catch` inside `redirectWebsocketEndpoint`.
If `request.url` can't be parsed, skip the rewrite and let the downstream
listeners handle the request. Tracked in the PR linked from the index.
