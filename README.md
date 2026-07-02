# Repro — meteor/meteor#12421

**iOS Mobile Safari's version is parsed from the (stale) Safari `Version/` token
instead of the iOS OS version, so iOS 10.3.x devices are wrongly served the
legacy bundle.**

Upstream issue: https://github.com/meteor/meteor/issues/12421

## Root cause

`WebAppInternals.identifyBrowser` (`packages/webapp/webapp_server.js`) takes the
browser version straight from the useragent library:

```js
var userAgent = lookupUserAgent(userAgentString);
return { name: camelCase(userAgent.family), major: +userAgent.major, minor: +userAgent.minor, patch: +userAgent.patch };
```

For an iOS Mobile Safari UA the library reports the Safari `Version/` token
(e.g. `Version/10.0` → `10.0.0`), **not** the iOS OS version (`OS 10_3_1` →
`10.3.1`). The modern minimum for `mobile_safari` is `[10, 3]`
(`npm-packages/babel-preset-meteor/modern.js`), so `isModern([10,0,0])` is
`false` and an iOS 10.3.x device — which is modern — is served the **legacy**
bundle.

## Reproduce

```bash
npm install     # useragent-ng@2.4.4, the version Meteor pins
node repro.js
```

[`repro.js`](repro.js) uses the real `useragent-ng` and replicates
`identifyBrowser` (current vs. fixed) and modern-browsers' `isModern` comparison.

## Evidence — BEFORE / AFTER

```
iOS 10.3.1 (should be MODERN)
  useragent-ng: browser 10.0.0, os iOS 10.3.1
  BEFORE identifyBrowser -> 10.0.0  isModern=false     <- BUG (served legacy)
  AFTER  identifyBrowser -> 10.3.1  isModern=true       <- fixed (modern)

iOS 15.4 (should be MODERN)
  BEFORE -> 15.4.0 isModern=true ; AFTER -> 15.4.0 isModern=true   (no regression)

iOS 9.3 (should be LEGACY)
  BEFORE -> 9.0.0 isModern=false ; AFTER -> 9.3.0 isModern=false   (stays legacy)
```

## The fix

`identifyBrowser` — for iOS Mobile Safari, use the OS version (`userAgent.os`)
for major/minor/patch, since iOS Safari's effective version tracks the OS. This
promotes iOS 10.3.x to modern (and gives WKWebViews their real iOS version
instead of `0.0.0`), is a no-op for modern iOS, and does not over-promote older
iOS. Tinytest cases are added in `packages/webapp/webapp_tests.js`.
