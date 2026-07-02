# Repro — meteor/meteor#13276

**`meteor build` crashes with `RangeError [ERR_FS_FILE_TOO_LARGE]` when the app
bundle contains a file larger than 2 GiB (e.g. a large asset in an npm
dependency).**

Upstream issue: https://github.com/meteor/meteor/issues/13276

## Root cause

`tools/isobuild/builder.js` `_copyDirectory` copies each file by reading its
whole contents into a Buffer — first to hash it (`optimisticHashOrNull`, line
798), then to write it (`optimisticReadFile`, line 801). Node's synchronous
`fs.readFileSync` refuses files larger than ~2 GiB (`ERR_FS_FILE_TOO_LARGE`), so
any bundled file over 2 GiB aborts the whole build.

## Reproduce

`app/` is `meteor create --minimal` with a prod dependency `bigasset` that ships
a >2 GiB file, imported from `server/main.js`. Recreate the (git-ignored, sparse)
asset:

```bash
cd app
mkdir -p node_modules/bigasset
printf '{ "name": "bigasset", "version": "1.0.0", "main": "index.js" }' > node_modules/bigasset/package.json
echo 'module.exports = {};' > node_modules/bigasset/index.js
truncate -s 2200M node_modules/bigasset/model.bin   # sparse, 0 bytes on disk
meteor build /tmp/out --directory --server-only
```

## Evidence — BEFORE (bug, on `devel` @ fe7d26b0f9)

```
RangeError [ERR_FS_FILE_TOO_LARGE]: File size (2306867200) is greater than 2 GiB
    at Object.readFileSync (node:fs:456:14)
    at /tools/fs/files.ts:1534:23
    at walk (/tools/isobuild/builder.js:798:24)
    at Builder._copyDirectory (/tools/isobuild/builder.js:825:5)
```
Build fails; no bundle is produced.

## The fix

`tools/isobuild/builder.js` `_copyDirectory` — for files larger than Node's
single-read limit (~2 GiB), skip the read+hash+write path and copy the file
directly with `files.copyFile` (which uses `fs.copyFileSync`, no 2 GiB limit).
Incremental rebuilds key off size+mtime for such files since their contents
can't be hashed.

## Evidence — AFTER (fix)

_(filled in once the fix is verified — see the PR)_
