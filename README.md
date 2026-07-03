# meteor/meteor#12772 — no Content-Length on built JS/CSS (breaks CDN/proxy compression models)

Built JS/CSS bundle assets are served **without a `Content-Length` header** because Meteor's webapp
compresses them, and the `compression` middleware removes `Content-Length` and switches to chunked
transfer. Some CDN/proxy setups want the origin to serve uncompressed-with-Content-Length and do the
compression themselves; today there is no way to opt out per-response.

## Root cause
`packages/webapp/webapp_server.js` `shouldCompress()` uses the default content-type filter, which
compresses JS/CSS. When `compression` compresses a response it sets `Content-Encoding` and calls
`res.removeHeader('Content-Length')` — so the hashed bundle assets (which the static middleware had
given a `Content-Length`) go out chunked with no length.

## Fix (opt-in)
A new opt-in setting `Meteor.settings.packages.webapp.skipCompressionWithContentLength` (default off,
same pattern as `alwaysReturnContent` / `includeVaryUserAgent`): when enabled, `shouldCompress`
returns false for any response that already has a `Content-Length`, leaving it uncompressed so the
header survives. Default behavior is unchanged.

## Reproduce
Run any Meteor app (`meteor run`) and request a built asset asking for gzip:
```
curl -sI -H 'Accept-Encoding: gzip' http://localhost:3000/<hashed-bundle>.js
```
- **Default / setting off:** response has `content-encoding: gzip` and **no** `content-length`.
- **With `skipCompressionWithContentLength: true` in settings.json** (`{ "packages": { "webapp": { "skipCompressionWithContentLength": true } } }`, run with `meteor run --settings settings.json`): response keeps `content-length` and is **not** gzipped.

Covered by a Tinytest in `packages/webapp/webapp_tests.js`
(`webapp - skipCompressionWithContentLength setting keeps Content-Length`).
