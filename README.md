# Repro — meteor/meteor#12759

**Meteor creates an unwanted global `require` (and historically `exports`) on the client.**

Upstream issue: https://github.com/meteor/meteor/issues/12759

## Summary

On the client, Meteor's build serves the app's JS bundle (`/app/app.js`) as a
classic `<script>`, and the bundle starts with a top-level

```js
var require = meteorInstall({ /* module tree */ });
...
require("/client/main.js");
```

Because a top-level `var` in a classic script becomes a property of the global
object, `require` leaks to `window`/`globalThis`. Any UMD/CommonJS bundle loaded
on the page can then wrongly feature-detect a CommonJS environment (e.g.
`typeof require === 'function'`) and break.

(In older Meteor the eager main module was emitted as `var exports = require(...)`,
which additionally leaked a global `exports`. Modern Meteor emits `require(...)`
without the assignment, so on `devel` the remaining leak is `require`.)

Only the **client app bundle** leaks: package bundles are wrapped in
`Package["core-runtime"].queue(name, function () { ... })`, so their internal
`var require` is function-scoped. The app's client bundle is intentionally left
unwrapped (to keep `/client/compatibility` bare files at global scope), so its
top-level `var require` leaks.

## App

A minimal (`meteor create --minimal`) app lives in [`app/`](app/). Its
[`client/main.js`](app/client/main.js) probes the globals and renders a verdict.

## Steps to reproduce

```bash
cd app
meteor run --port 3100
# open http://localhost:3100/ and check window.require in the console
```

Or headless — evaluate on the loaded page:

```js
({
  windowRequire: typeof window.require,      // "function"  <- LEAK
  ownRequire: Object.prototype.hasOwnProperty.call(window, 'require'), // true
  windowExports: typeof window.exports,      // "undefined"
})
```

## Evidence — BEFORE (bug present, on `devel` @ ebbdd065dd)

Served `/app/app.js` (top of file, column 0, unwrapped):

```js
var require = meteorInstall({"client":{"main.js":function module(require,exports,module){
  ...
}}},{ "extensions": [ ".js", ".json", ".html", ".mjs", ".ts", ".css" ] });

require("/client/main.js");
```

Browser (`http://localhost:3100/`) global probe:

```json
{
  "windowRequire": "function",
  "windowExports": "undefined",
  "windowModule": "undefined",
  "globalThisRequire": "function",
  "globalThisExports": "undefined",
  "hasOwnRequire": true
}
```

`window.require` is present as an own property of the global object -> **leak confirmed.**

## Evidence — AFTER (fix applied)

_(filled in once the fix is verified — see the PR)_
