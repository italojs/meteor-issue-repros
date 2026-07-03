// Standalone demonstration of the meteor/meteor#11808 fix logic.
//
// Bug: when Meteor is already installed, `meteor install` prints "already
// installed" and exits WITHOUT repairing a missing PATH entry. And setupExecPath
// appended `export PATH=...` to the shell rc file unconditionally, so re-running
// could add duplicate lines. The fix (a) repairs PATH on the already-installed
// path when meteor is not on PATH, and (b) makes the rc-file append idempotent.
const fs = require('fs');
const os = require('os');
const path = require('path');

function isMeteorOnPath(pathEnv, meteorPath, delimiter) {
  return (pathEnv || '').split(delimiter).filter(Boolean).includes(meteorPath);
}
function appendLineIfMissing(file, line) {
  let existing = '';
  try { existing = fs.readFileSync(file, 'utf8'); } catch (e) {}
  if (existing.includes(line)) return false;
  fs.appendFileSync(file, `${line}\n`);
  return true;
}

const meteor = '/home/u/.meteor';
console.log('meteor already on a good PATH? ', isMeteorOnPath(`/usr/bin:${meteor}`, meteor, ':'), '(no repair needed)');
console.log('meteor missing from PATH?      ', !isMeteorOnPath('/usr/bin:/bin', meteor, ':'), '(repair triggers)');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repro11808-'));
const rc = path.join(dir, '.bashrc');
fs.writeFileSync(rc, '# rc\n');
const line = `export PATH=${meteor}:$PATH`;
console.log('first append wrote line?       ', appendLineIfMissing(rc, line));
console.log('second append skipped (idemp)? ', appendLineIfMissing(rc, line) === false);
console.log('line count in rc:              ', fs.readFileSync(rc, 'utf8').split(line).length - 1, '(exactly 1)');
fs.rmSync(dir, { recursive: true, force: true });
