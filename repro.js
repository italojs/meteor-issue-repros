'use strict';
// Repro for meteor/meteor#12172
//
// The Meteor installer's setupExecPath() (npm-packages/meteor-installer/install.js)
// does, for non-zsh shells:
//     appendPathToFile('.bashrc');
//     appendPathToFile('.bash_profile');
// where appendPathToFile === fsPromises.appendFile(`${HOME}/${file}`, exportCmd).
//
// fs.appendFile CREATES the target if it does not exist. A bash *login* shell
// reads the FIRST it finds of ~/.bash_profile, ~/.bash_login, ~/.profile. So by
// creating ~/.bash_profile (when the user only had ~/.profile), the installer
// makes bash stop sourcing ~/.profile — silently dropping whatever PATH/env the
// user set there.
//
// This script reproduces the exact appendFile behavior against a throwaway HOME,
// with the current logic and the proposed fix.

const fs = require('fs');
const os = require('os');
const path = require('path');

const EXPORT = 'export PATH=/Users/x/.meteor:$PATH\n';

function freshHome(label) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), `repro-12172-${label}-`));
  // A typical user: PATH configured in ~/.profile, NO ~/.bash_profile.
  fs.writeFileSync(path.join(home, '.profile'), 'export PATH=/user/custom/bin:$PATH\n');
  return home;
}

function report(home, title) {
  const has = f => fs.existsSync(path.join(home, f));
  const read = f => (has(f) ? fs.readFileSync(path.join(home, f), 'utf8').trim() : '(absent)');
  console.log(`\n== ${title} ==`);
  for (const f of ['.bashrc', '.bash_profile', '.bash_login', '.profile']) {
    console.log(`  ${f.padEnd(14)} ${has(f) ? 'EXISTS' : 'absent'}  ${has(f) ? JSON.stringify(read(f).slice(0, 60)) : ''}`);
  }
  const bashLoginFile = has('.bash_profile') ? '.bash_profile'
    : has('.bash_login') ? '.bash_login'
      : '.profile';
  const loginGetsMeteor = read(bashLoginFile).includes('.meteor');
  const profileStillSourced = bashLoginFile === '.profile';
  console.log(`  => bash login shell reads: ~/${bashLoginFile}`);
  console.log(`  => login PATH includes .meteor: ${loginGetsMeteor}; user's ~/.profile still the login file: ${profileStillSourced}`);
  return { createdBashProfile: has('.bash_profile'), loginGetsMeteor, profileStillSourced };
}

// ---- CURRENT behavior (the bug) --------------------------------------------
function currentLogic(home) {
  fs.appendFileSync(path.join(home, '.bashrc'), EXPORT);
  fs.appendFileSync(path.join(home, '.bash_profile'), EXPORT); // creates it!
}

// ---- FIXED behavior --------------------------------------------------------
function fixedLogic(home) {
  const has = f => fs.existsSync(path.join(home, f));
  fs.appendFileSync(path.join(home, '.bashrc'), EXPORT);
  // Only touch a bash login file that already exists; otherwise fall back to
  // ~/.profile so we don't shadow the user's existing login-shell config.
  const loginFile = has('.bash_profile') ? '.bash_profile'
    : has('.bash_login') ? '.bash_login'
      : '.profile';
  fs.appendFileSync(path.join(home, loginFile), EXPORT);
}

const before = freshHome('before');
currentLogic(before);
const b = report(before, 'BEFORE (current installer logic)');

const after = freshHome('after');
fixedLogic(after);
const a = report(after, 'AFTER (fixed logic)');

console.log('\n--- VERDICT ---');
console.log('BEFORE: created ~/.bash_profile =', b.createdBashProfile,
  '=> user\'s ~/.profile no longer sourced by bash login =>', !b.profileStillSourced ? 'BUG' : 'ok');
console.log('AFTER : created ~/.bash_profile =', a.createdBashProfile,
  '; login PATH has .meteor =', a.loginGetsMeteor,
  '; ~/.profile still the login file =', a.profileStillSourced,
  '=>', (!a.createdBashProfile && a.loginGetsMeteor && a.profileStillSourced) ? 'FIXED' : 'still broken');
