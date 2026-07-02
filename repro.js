'use strict';
// Repro for meteor/meteor#12421
//
// WebAppInternals.identifyBrowser (packages/webapp/webapp_server.js) derives the
// browser version from the useragent library, which for iOS Mobile Safari
// reports the (stale) Safari `Version/` token, not the iOS OS version. The
// modern minimum for mobile_safari is [10, 3] (babel-preset-meteor). So an
// iOS 10.3.x device (which IS modern) is parsed as Safari 10.0 and served the
// LEGACY bundle.

const { lookup } = require('useragent-ng');

const MIN_MOBILE_SAFARI = [10, 3]; // babel-preset-meteor modern.js

// From webapp_server.js
function camelCase(name) {
  const parts = name.split(' ');
  parts[0] = parts[0].toLowerCase();
  for (let i = 1; i < parts.length; ++i) {
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
  }
  return parts.join('');
}

// CURRENT identifyBrowser
function identifyBrowser(ua) {
  return { name: camelCase(ua.family), major: +ua.major, minor: +ua.minor, patch: +ua.patch };
}

// FIXED identifyBrowser: iOS Mobile Safari tracks the OS version.
function identifyBrowserFixed(ua) {
  let major = +ua.major, minor = +ua.minor, patch = +ua.patch;
  if (/^mobile safari/i.test(ua.family) && ua.os && ua.os.family === 'iOS') {
    const om = +ua.os.major, on = +ua.os.minor, op = +ua.os.patch;
    if (!Number.isNaN(om)) major = om;
    if (!Number.isNaN(on)) minor = on;
    if (!Number.isNaN(op)) patch = op;
  }
  return { name: camelCase(ua.family), major, minor, patch };
}

// modern-browsers greaterThanOrEqualTo(a,b) = !greaterThan(b,a); lexicographic.
function greaterThan(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0, y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}
function isModern(browser) {
  if (browser.major === 0 && browser.minor === 0 && browser.patch === 0) return 'unknown(WKWebView)';
  return !greaterThan(MIN_MOBILE_SAFARI, [browser.major, browser.minor, browser.patch]);
}

const CASES = {
  'iOS 10.3.1 (should be MODERN)': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E8301 Safari/602.1',
  'iOS 15.4 (should be MODERN)':   'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
  'iOS 9.3 (should be LEGACY)':    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E188 Safari/601.1',
};

for (const [label, uaStr] of Object.entries(CASES)) {
  const ua = lookup(uaStr);
  const cur = identifyBrowser(ua), fix = identifyBrowserFixed(ua);
  console.log(`\n${label}`);
  console.log(`  useragent-ng: browser ${ua.major}.${ua.minor}.${ua.patch}, os ${ua.os.family} ${ua.os.major}.${ua.os.minor}.${ua.os.patch}`);
  console.log(`  BEFORE identifyBrowser -> ${cur.major}.${cur.minor}.${cur.patch}  isModern=${isModern(cur)}`);
  console.log(`  AFTER  identifyBrowser -> ${fix.major}.${fix.minor}.${fix.patch}  isModern=${isModern(fix)}`);
}
