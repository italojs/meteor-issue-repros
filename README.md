# Repro — meteor/meteor#12718

**Extensionless imports resolve `Foo.css` instead of `Foo.tsx` when both exist.**

Upstream issue: https://github.com/meteor/meteor/issues/12718

## Summary

Meteor's classic (isobuild) import resolver tries a list of file extensions in
order and returns the **first** file that exists. That list
(`importExtensions`) is built by appending each extension as source files are
scanned, in resource-scan order, so an asset extension like `.css` can end up
**before** a source extension like `.tsx`:

```
[".js", ".json", ".html", ".d.ts", ".d.ts.map", ".mjs", ".ts", ".css", ".tsx"]
                                                                 ^^^^^^  ^^^^^^
                                                                 tried before .tsx
```

So `import { Hello } from './Hello'` — with both `Hello.tsx` (a React
component) and `Hello.css` present — resolves to `Hello.css`, and the named
export `Hello` is missing.

## App

[`app/`](app/) is `meteor create --typescript` with the `rspack` package removed
(so it uses the classic isobuild build, which is where the resolver bug lives).
It has both [`imports/ui/Hello.tsx`](app/imports/ui/Hello.tsx) and
[`imports/ui/Hello.css`](app/imports/ui/Hello.css);
[`client/main.tsx`](app/client/main.tsx) imports `/imports/ui/Hello`
extensionless and reports which file it resolved to.

## Steps to reproduce

```bash
cd app
meteor remove rspack     # already removed in this repro
meteor run --port 3100
# open http://localhost:3100/ and read the verdict, or check the console:
#   [resolve-probe] {"helloExportType":"undefined","moduleKeys":["default"],"resolvedTo":"Hello.css (BUG)"}
```

## Evidence — BEFORE (bug present, on `devel` @ ebbdd065dd)

Extensions array in the served `/app/app.js` (`.css` before `.tsx`):

```json
[".js", ".json", ".html", ".d.ts", ".d.ts.map", ".mjs", ".ts", ".css", ".tsx"]
```

Browser probe (`http://localhost:3100/`):

```json
{
  "helloExportType": "undefined",
  "moduleKeys": ["default"],
  "resolvedTo": "Hello.css (BUG)"
}
```

Verdict: **BUG: extensionless import resolved to Hello.css**

## Evidence — AFTER (fix applied)

_(filled in once the fix is verified — see the PR)_
