# Meteor + Rspack + TypeScript 6/7 + ESLint

Local reproduction of the coexistence setup discussed in [Meteor Forum topic 64823](https://forums.meteor.com/t/meteor-with-rspack-and-eslint/64823). Tested on 2026-10-14 using the TypeScript scaffold from Meteor 3.6-rc.0.

TS6 provides the compiler API used by ESLint. TS7 performs type checking, both explicitly and through the Rspack checker. This demonstrates coexistence; it does not establish that the original reporter's restart problem is resolved.

## Run

With Meteor installed, from this directory:

```sh
meteor npm ci --registry=https://registry.npmjs.org
meteor npm start
```

Open http://127.0.0.1:3360. Meteor uses the pinned release in `.meteor/release`; both the app and Rspack dev server bind to loopback. If that port is occupied, choose separate app and Rspack ports:

```sh
RSPACK_DEVSERVER_PORT=18390 meteor run --port 127.0.0.1:3390
```

## Check

```sh
meteor npm run typecheck:ts6
meteor npm run typecheck:ts7
meteor npm run lint
```

`package-lock.json` fixes npm versions and integrity hashes; `.meteor/versions` fixes Meteor packages. All npm tarballs resolve to the official npm registry.

## Versions tested

| Package | Version |
| --- | --- |
| Meteor | 3.6-rc.0 (release candidate) |
| Meteor's embedded Node | 26.10.0 |
| @meteorjs/rspack | 3.0.0-rc.0 |
| @rspack/core / @rspack/cli | 2.2.9 |
| ts-checker-rspack-plugin | 1.7.1 |
| typescript alias | npm:@typescript/typescript6@6.0.2 |
| Effective TS6 compiler | 6.0.3, reexported by the compatibility package |
| @typescript/native alias | npm:typescript@7.0.2 (stable; no native-preview) |
| ESLint / typescript-eslint | 10.12.0 / 8.70.0 |
| React / React DOM | 19.3.0 |

## Necessary configuration

The aliases in `package.json` are:

```json
"typescript": "npm:@typescript/typescript6@6.0.2",
"@typescript/native": "npm:typescript@7.0.2"
```

The scripts explicitly call `node_modules/typescript/bin/tsc6` and `node_modules/@typescript/native/bin/tsc`, so they do not depend on `.bin/tsc` selection. In the tested installation, `.bin/tsc` belongs to TS7 and `.bin/tsc6` to TS6.

The scaffold enables `TsCheckerRspackPlugin` with `tsgo: true`. It does not discover the TS7 alias automatically. `rspack.config.ts` uses its documented `typescriptPath` option:

```ts
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

new TsCheckerRspackPlugin({
  typescript: {
    tsgo: true,
    typescriptPath: require.resolve("@typescript/native/package.json"),
  },
});
```

Without that path, the default checker rejected the dual-alias setup and tried the default TS7/legacy preview resolution. `eslint.config.mjs` enables `recommendedTypeChecked`, `projectService` and `no-floating-promises`; it continues to load the TS6 API through `typescript`.

## Observed results and limits

- Startup, lockfile reinstall, TS6, TS7 and typed ESLint passed. Intentional type errors and floating promises were detected.
- Pointing the package named `typescript` to TS7 made typescript-eslint explicitly reject TS7.0.
- No restart loop was observed during about 12 minutes idle.
- CSS updates preserved the counter, document identity and server PID.
- Editing the TSX component reloaded the page, reset the counter and restarted the server; the server restart was reproduced with a second isolated TSX edit. State-preserving component HMR is therefore a limitation of this tested setup.
- A server edit caused a restart and returned the updated revision. With an intentional type error, the service remained reachable, but restarts still occurred.

To inspect changes, click the counter, edit the label in `imports/ui/App.tsx`, change `client/main.css`, or edit `revision` in `server/main.ts`. The UI displays document identity and server PID/boot time; the server logs `[DEMO_BOOT]` on startup.

Testing covered macOS arm64. Production builds, IDE behavior, other platforms and the original author's native-preview configuration were not tested. The local warehouse, logs, caches, generated build outputs and machine-specific launcher are deliberately excluded from this reproduction.
