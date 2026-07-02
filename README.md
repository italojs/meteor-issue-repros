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

## The fix

`tools/isobuild/linker.js` — the unwrapped client app bundle now wraps only the
module-system bootstrap (`var require = meteorInstall(...)` and the eager
`require(...)` calls) in an IIFE, while bare `/client/compatibility` files stay
at the top level:

```js
// bare files stay global (top level)
(function () {
  var require = meteorInstall({ /* module tree */ });
  require("/client/main.js");
}).call(this);
```

## Evidence — AFTER (fix applied)

Served `/app/app.js`:

```js
(function () {
var require = meteorInstall({"client":{"main.js":function module(require,exports,module){
  ...
}}}, { ... });

require("/client/main.js");
}).call(this);
```

Browser global probe (`http://localhost:3100/`):

```json
{
  "windowRequire": "undefined",
  "hasOwnRequire": false,
  "globalThisRequire": "undefined",
  "windowExports": "undefined"
}
```

And a real top-level classic `<script>` injected on the page now sees
`typeof require === "undefined"` (the `let`-only approach would not — a
top-level `let` is still a global lexical binding visible to sibling scripts).
`window.meteorInstall` stays a function (that global is intentional and is not
part of this bug); the app renders normally.

### Bare `/client/compatibility` files still work

With `meteor.mainModule.client` removed so an eager bare file is included, a
`client/compatibility/legacy-global.js` containing `var LEGACY_COMPAT_GLOBAL =
'i-am-global'` is emitted **outside** the IIFE, and `window.LEGACY_COMPAT_GLOBAL
=== 'i-am-global'` while `window.require` stays `undefined`.

### Self-tests

Both module self-tests pass against the checkout with the fix (each asserts
`SERVER FAILURES: 0` / `CLIENT FAILURES: 0`, and includes a
`client/compatibility` bare-file assertion and many `require(...)` calls):

```
modules - test modern app ... ✓ ok!
modules - test legacy app  ... ✓ ok!
```
