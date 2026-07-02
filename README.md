# Repro — meteor/meteor#12172

**The Meteor installer creates `~/.bash_profile` when it's absent, which makes a
bash login shell stop sourcing the user's existing `~/.profile`.**

Upstream issue: https://github.com/meteor/meteor/issues/12172

## Root cause

`npm-packages/meteor-installer/install.js` → `setupExecPath()`, for non-zsh
shells, does:

```js
await appendPathToFile('.bashrc');
await appendPathToFile('.bash_profile');   // fs.appendFile CREATES it if absent
```

A bash **login** shell reads the *first* it finds of `~/.bash_profile`,
`~/.bash_login`, `~/.profile`. Many users keep their PATH/env in `~/.profile`
and have no `~/.bash_profile`. By creating `~/.bash_profile` (containing only the
Meteor PATH line), the installer makes bash source that instead of `~/.profile`,
silently dropping whatever the user configured there.

## Reproduce

```bash
node repro.js
```

[`repro.js`](repro.js) replicates the installer's exact `appendFile` behavior
against throwaway HOME directories (a user with `~/.profile` and no
`~/.bash_profile`), for the current logic vs. the fix.

## Evidence — BEFORE (bug)

```
== BEFORE (current installer logic) ==
  .bash_profile  EXISTS  "export PATH=/Users/x/.meteor:$PATH"
  .profile       EXISTS  "export PATH=/user/custom/bin:$PATH"
  => bash login shell reads: ~/.bash_profile
  => login PATH includes .meteor: true; user's ~/.profile still the login file: false
BEFORE: created ~/.bash_profile = true => user's ~/.profile no longer sourced by bash login => BUG
```

## The fix

`setupExecPath()` appends the Meteor PATH to a bash login file **only if one
already exists** (`~/.bash_profile`, then `~/.bash_login`); otherwise it appends
to `~/.profile` — the file bash would source anyway — instead of creating
`~/.bash_profile` and shadowing it.

## Evidence — AFTER (fix)

```
== AFTER (fixed logic) ==
  .bash_profile  absent
  .profile       EXISTS  "...\nexport PATH=/Users/x/.meteor:$PATH"
  => bash login shell reads: ~/.profile
AFTER : created ~/.bash_profile = false ; login PATH has .meteor = true ; ~/.profile still the login file = true => FIXED
```
