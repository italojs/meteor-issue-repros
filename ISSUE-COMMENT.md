I verified the minimal tagged-template reproduction against the **published Meteor 3.6-rc.0 release**, and it now works without the `externalHelpers: false` workaround.

Repro and evidence: [demo repository](https://github.com/italojs/meteor-issue-repros/tree/codex/issue-14397).

To try it:

```sh
git clone --branch codex/issue-14397 https://github.com/italojs/meteor-issue-repros.git
cd meteor-issue-repros/apps/meteor-3.6-rc.0
meteor npm ci
RSPACK_DEVSERVER_PORT=18370 meteor run --production --exclude-archs web.cordova --port 3370
```

Open `http://localhost:3370` in Chrome. In DevTools → More tools → Network conditions, disable the default user agent, set it to `example`, and reload.

The app renders successfully. In the console:

```js
Meteor.release                         // "METEOR@3.6-rc.0"
__meteor_runtime_config__.isModern      // false
window.__issue14397                    // "tagged template literal"
```

The demo contains the exact tagged-template snippet from the reproduction. `isModern: false` confirms that the legacy bundle was actually served.

Results:

- **3.5.2 control:** reproduced `Cannot find module '@swc/helpers/_/_tagged_template_literal'` twice with a blank page.
- **3.6-rc.0:** passed for `example`, the IE11 user agent, and `Googlebot`, with no browser page errors.
- **3.6-rc.0 deployment bundle:** the same checks passed after `meteor build --directory` and running the generated server.
- Default modern Chrome passed on both releases.

The repo includes both apps, lockfiles, an automated browser check, JSON results, screenshots, and deployment-bundle instructions. The shipped helper fix is included in [PR #14776](https://github.com/meteor/meteor/pull/14776).

These checks use Chromium with overridden user agents; they do not claim actual IE11-engine compatibility or a Galaxy deployment. The concrete missing-helper reproduction is fixed in 3.6-rc.0.
