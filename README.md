# Meteor #14397: legacy SWC helpers — fixed in 3.6-rc.0

This demo reproduces [meteor/meteor#14397](https://github.com/meteor/meteor/issues/14397) on **Meteor 3.5.2** and verifies the same scenario on the published **Meteor 3.6-rc.0** release.

Both apps are unmodified React scaffolds apart from this reproduction appended to `client/main.jsx`:

```js
const tag = (strings) => strings[0];
console.log(tag`tagged template literal`);
window.__issue14397 = tag`tagged template literal`;
```

No `externalHelpers: false` workaround or legacy-only custom entry point is used. `@swc/helpers` remains installed. The `window` assignment exposes the result for verification.

| Published release | Modern Chrome | Legacy bundle selected by `example`, IE11 UA, or `Googlebot` |
| --- | --- | --- |
| 3.5.2 | App renders | Blank page; missing `_tagged_template_literal` helper |
| 3.6-rc.0, production simulation | App renders | App renders; no JavaScript errors |
| 3.6-rc.0, deployment bundle | App renders | App renders; no JavaScript errors |

## Get the demo

Install the Meteor CLI before running these commands. Each app's `.meteor/release` selects its published release; Meteor downloads the tool and packages if needed.

```sh
git clone --branch codex/issue-14397 https://github.com/italojs/meteor-issue-repros.git
cd meteor-issue-repros
```

## Verify the fixed release manually

In the first terminal:

```sh
cd apps/meteor-3.6-rc.0
meteor npm ci
RSPACK_DEVSERVER_PORT=18370 meteor run --production --exclude-archs web.cordova --port 3370
```

1. Open <http://localhost:3370> in Chrome. The page should display **Welcome to Meteor!** and the counter should work.
2. Open DevTools, then **More tools → Network conditions**.
3. Under **User agent**, disable **Use browser default** and enter `example`.
4. Reload. The page should still render, without a missing-helper error.
5. Evaluate this in the console:

```js
({
  release: Meteor.release,
  isModern: __meteor_runtime_config__.isModern,
  result: window.__issue14397,
})
```

Expected:

```js
{
  release: "METEOR@3.6-rc.0",
  isModern: false,
  result: "tagged template literal"
}
```

`isModern: false` confirms that the legacy bundle really loaded. Repeat with `Googlebot` or this IE11 user agent:

```text
Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko
```

The run option `--exclude-archs web.cordova` takes precedence over the modern-only development setting and ensures that the legacy program is built for this reproduction.

## Compare with the broken release

From the repository root, in a separate terminal:

```sh
cd apps/meteor-3.5.2
meteor npm ci
RSPACK_DEVSERVER_PORT=18380 meteor run --production --exclude-archs web.cordova --port 3380
```

Open <http://localhost:3380>, repeat the user-agent steps, and observe:

```text
Cannot find module '@swc/helpers/_/_tagged_template_literal'
```

Default modern Chrome renders the same app successfully. With `example`, the legacy program returns HTTP 200 but the React target is blank. The original control was repeated twice with identical results.

## Automated browser checks

Keep the servers running. From the repository root:

```sh
npm ci
npx playwright install chromium
npm run check -- http://127.0.0.1:3370 fixed-release
```

The check opens fresh Chromium contexts for the default user agent, `example`, IE11, and `Googlebot`. It requires `METEOR@3.6-rc.0`, the correct modern/legacy architecture, successful execution, a rendered page, and no page errors. JSON results and screenshots are saved under `artifacts/`. **Expected exit code: 0.**

To reproduce the old failure:

```sh
EXPECTED_RELEASE=METEOR@3.5.2 npm run check -- http://127.0.0.1:3380 broken-control
```

**Expected exit code: 1**, because the three legacy cases fail. The modern case must pass. `pass` in the JSON means the app booted; it does not mean a failure was successfully reproduced.

## Verify a deployment bundle

The RC was also verified after `meteor build`, not just with `run --production`.

Keep the RC server on port 3370 running so its disposable MongoDB remains available on port 3371. From another terminal at the repository root:

```sh
cd apps/meteor-3.6-rc.0
meteor build --directory ../../artifacts/deploy
METEOR_NODE="$(meteor node -p 'process.execPath')"
METEOR_BIN="$(dirname "$METEOR_NODE")"
(
  cd ../../artifacts/deploy/bundle/programs/server
  PATH="$METEOR_BIN:$PATH" "$METEOR_BIN/npm" install --omit=dev
)
(
  cd ../../artifacts/deploy/bundle
  PORT=3373 ROOT_URL=http://127.0.0.1:3373 MONGO_URL=mongodb://127.0.0.1:3371/meteor "$METEOR_NODE" main.js
)
```

This uses the RC's Node 26 runtime. In another terminal at the repository root:

```sh
npm run check -- http://127.0.0.1:3373 built-release
```

**Expected exit code: 0.** The bundle's `star.json` must include both `web.browser` and `web.browser.legacy`. `meteor build` does not accept `--exclude-archs`; the command above omits that run-only option.

Stop all servers with Ctrl+C when finished.

## Evidence and scope

See [REPORT.md](REPORT.md) for versions, results, and the source changes shipped in the RC. [Original validation evidence](evidence/original-validation/) contains JSON and screenshots captured before packaging. [ISSUE-COMMENT.md](ISSUE-COMMENT.md) is a ready-to-post comment.

These checks use Chromium with overridden user agents to exercise Meteor's legacy bundle selection. They do **not** establish actual IE11-engine compatibility, nor was a Galaxy deployment performed. The concrete missing-helper reproduction works in the published 3.6-rc.0 release.
