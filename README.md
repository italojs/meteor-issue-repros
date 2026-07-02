# Repro — meteor/meteor#13245

**A parse failure while computing *optional* bundle-size stats aborts the whole
production build.**

Upstream issue: https://github.com/meteor/meteor/issues/13245
(`While minifying app code: Unexpected token, expected ":" (1056:150096)`)

## Root cause

`standard-minifier-js/plugin/stats.js` → `extractModuleSizesTree(minified)` parses
the **minified** bundle to build a module-size tree (used only by
bundle-visualizer). It parses with `acorn`; if acorn throws it falls back to
Meteor's Babel parser — with **no further guard**:

```js
try { ast = acorn.parse(source, {...}); }
catch (e) { ast = Babel.parse(source); }   // if this throws too, it propagates
```

In `plugin/minify-js.js`, `extractModuleSizesTree(minified.code)` is called
**outside** the `try/catch` that wraps minification, so when both parsers fail
the error aborts the entire `meteor build` / production build.

Both parsers fail on real-world syntax that npm packages ship — e.g. **import
assertions** (`import x from "./d.json" assert { type: "json" }`): acorn 8.10
rejects it, and Meteor's Babel parser (plugins include `flow`/`jsx` but **not**
`importAssertions`) rejects it too. (The original report hit the same failure
mode via Flow-ambiguous minified code from `cheerio`.)

## Reproduce

```bash
npm install      # acorn@8.10.0 + @babel/parser@7.29.7 (the versions Meteor uses)
node repro.js
```

[`repro.js`](repro.js) replicates `extractModuleSizesTree`'s exact parse step
(same acorn/babel versions and options) and shows the current logic vs. the fix.

## Evidence — BEFORE (bug)

```
== BEFORE (current stats.js logic) ==
  THREW: The `assert` keyword in import attributes is deprecated ... (2:31)
  => in minify-js.js this call is outside try/catch => the whole
     production build aborts with this error.
```

## Evidence — AFTER (fix)

`extractModuleSizesTree` catches the fallback parse failure and returns
`undefined`, so `minify-js.js` records byte-length stats for that file and the
build proceeds:

```
== AFTER (non-fatal stats) ==
  returned: undefined  (build proceeds; stats fall back to byte length)
```

Fix: `tools`/`packages/standard-minifier-js/plugin/stats.js` — make the optional
stats parse non-fatal (and declare `ast` with `let`).
