# meteor/meteor#11808 — installer should repair PATH even if Meteor is already installed

Re-running `npx meteor install` (or the installer binary) when Meteor is already installed just prints
"Meteor is already installed" and exits — so if the user's shell `PATH` is missing `~/.meteor`, there
is no way to fix it via the installer. Additionally, `setupExecPath` appended `export PATH=...` to the
shell rc file unconditionally, so repeated installs could add duplicate lines.

## Root cause
`npm-packages/meteor-installer/install.js`:
- the `fs.existsSync(meteorPath)` branch calls `process.exit()` without ever calling `setupExecPath()`;
- `setupExecPath` appended the export line with no "already present" check.

## Fix
- On the already-installed path, when `shouldSetupExecPath()` and `~/.meteor` is not on `process.env.PATH`, call `setupExecPath()` (now idempotent) and tell the user to open a new terminal.
- `setupExecPath` uses `appendLineIfMissing`, skipping the write when the export line is already in the rc file. The PATH check and idempotent append are extracted to `exec-path.js` and unit-tested.

## Reproduce
`node repro.js` demonstrates the two behaviors:
```
meteor already on a good PATH?  true (no repair needed)
meteor missing from PATH?       true (repair triggers)
first append wrote line?        true
second append skipped (idemp)?  true
line count in rc:               1 (exactly 1)
```
End-to-end: with Meteor installed but `~/.meteor` removed from your shell PATH, re-running the installer
now appends the export (once) and prints the "open a new terminal" note instead of doing nothing.

Covered by `npm-packages/meteor-installer/exec-path.test.js` (`node --test`).
