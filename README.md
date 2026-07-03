# meteor/meteor#11918 — `Adding Package: RangeError [ERR_OUT_OF_RANGE]`

Adding certain packages fails with `RangeError [ERR_OUT_OF_RANGE]: The value of "length" is out of range`.

## Root cause
`tools/fs/files.ts` `readBufferWithLengthAndOffset(filename, length, offset)` reads a slice of a
file. It is called by `tools/isobuild/unibuild.js` to load isopack **resources concatenated into a
single file**, each stored at a byte `offset` with a `length`. The function calls:

```js
read(fd, data, { position: 0, length, offset }); // read === fs.readSync
```

For `fs.readSync(fd, buffer, options)`, `offset` is the offset **inside the buffer** and `position`
is the offset **in the file**. The buffer is exactly `length` bytes, so any resource with a file
offset > 0 (i.e. the 2nd+ resource in a unibuild) writes past the end of the buffer →
`ERR_OUT_OF_RANGE` (and would also read from the wrong file position). Introduced by commit
`5ea682449e` (2020, "fixes ts error on files.ts").

The correct call is `{ offset: 0, length, position: offset }`.

## Reproduce
```
node repro.js
```
Output:
```
THREW with buggy args: ERR_OUT_OF_RANGE - ...
read (correct args): "BBBB" (correct)
```
`repro.js` demonstrates the exact `fs.readSync` argument swap standalone. The same call in the real
`files.ts` throws `ERR_OUT_OF_RANGE` for any unibuild resource with offset > 0 (verified against the
checkout's `readBufferWithLengthAndOffset`).
