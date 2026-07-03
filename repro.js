// Standalone repro of meteor/meteor#11918 (RangeError [ERR_OUT_OF_RANGE] "Adding Package").
//
// Meteor's tools/fs/files.ts readBufferWithLengthAndOffset() reads a slice of a
// file (used by tools/isobuild/unibuild.js to load isopack resources that are
// concatenated into one file, each at a byte offset). It calls fs.readSync like:
//
//     fs.readSync(fd, buffer, { position: 0, length, offset })
//
// but for fs.readSync the option `offset` is the offset INSIDE THE BUFFER and
// `position` is the offset in the FILE. Since the buffer is exactly `length`
// bytes, any resource with a file offset > 0 writes past the end of the buffer
// and throws ERR_OUT_OF_RANGE (and, before that, would read from the wrong file
// position). Correct is: { offset: 0, length, position: offset }.
const fs = require('fs');
const os = require('os');
const path = require('path');

const file = path.join(os.tmpdir(), 'meteor-11918.bin');
fs.writeFileSync(file, 'AAAABBBB'); // two 4-byte "resources"
const fd = fs.openSync(file, 'r');
const length = 4;
const fileOffset = 4; // read the second resource ("BBBB")
const buffer = Buffer.alloc(length);

try {
  // What files.ts currently does:
  fs.readSync(fd, buffer, { position: 0, length, offset: fileOffset });
  console.log('read (buggy args):', JSON.stringify(buffer.toString()));
} catch (e) {
  console.log('THREW with buggy args:', e.code, '-', e.message);
}

// What it should do:
const fixed = Buffer.alloc(length);
fs.readSync(fd, fixed, { offset: 0, length, position: fileOffset });
console.log('read (correct args):', JSON.stringify(fixed.toString()), fixed.toString() === 'BBBB' ? '(correct)' : '(WRONG)');
fs.closeSync(fd);
fs.unlinkSync(file);
