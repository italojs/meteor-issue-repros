# Repro — meteor/meteor#12164

**Importing a non-existent file from an *installed* Meteor package reports the
wrong error: "Cannot find package X" instead of "the module is missing".**

Upstream issue: https://github.com/meteor/meteor/issues/12164

## Root cause

`packages/modules-runtime/errors/cannotFindMeteorPackage.js` (used on the
client) and the inline copy in `packages/modules-runtime/server.js` both do:

```js
var packageName = id.split('/', 2)[1];
throw new Error(`Cannot find package "${packageName}". Try "meteor add ${packageName}".`);
```

So for `import 'meteor/mongo/x'` — where the package `mongo` IS installed but the
file `x` is not — the error claims the *package* is missing and tells you to
`meteor add mongo` (which is already added). The package name is taken from the
id regardless of whether the id points at a sub-module of an installed package.

## App

[`app/`](app/) is `meteor create --minimal`. Its [`server/main.js`](app/server/main.js)
imports a file that does not exist inside the (always-installed) `meteor`
package:

```js
import 'meteor/meteor/this-file-does-not-exist';
```

## Reproduce

```bash
cd app
meteor run
```

## Evidence — BEFORE (bug, on `devel` @ ebbdd065dd)

The server crashes at startup with a misleading message — `meteor` is a core
package that can't be "added":

```
Error: Cannot find package "meteor". Try "meteor add meteor".
    at makeInstallerOptions.fallback (packages/modules-runtime.js:704:13)
    ...
    at module (server/main.js:1:1)
```

## Evidence — AFTER (fix)

_(filled in once the fix is verified — see the PR)_
