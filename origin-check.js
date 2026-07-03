// Standalone demonstration of the cross-origin guard used to fix
// meteor/meteor#13653. The autoupdate client must SKIP subscribing to
// meteor_autoupdate_clientVersions when DDP_DEFAULT_CONNECTION_URL points at a
// different origin than the page — otherwise the remote server's version docs
// never match this page and it reloads forever.
function isCrossOrigin(pageHref, ddpUrl) {
  if (!ddpUrl) return false;
  try {
    const pageOrigin = new URL(pageHref).origin;
    return new URL(ddpUrl, pageHref).origin !== pageOrigin;
  } catch (e) {
    return false;
  }
}

const page = 'http://localhost:3000/';
const cases = [
  [undefined, false],                        // unset -> subscribe normally
  ['http://localhost:3000', false],          // same origin -> subscribe
  ['http://localhost:3000/', false],         // same origin (trailing slash)
  ['http://other.example.com', true],        // different host -> SKIP
  ['http://localhost:4000', true],           // different port -> SKIP
  ['https://localhost:3000', true],          // different protocol -> SKIP
  ['//other.example.com', true],             // protocol-relative, different host -> SKIP
];
let ok = true;
for (const [ddp, expected] of cases) {
  const got = isCrossOrigin(page, ddp);
  const pass = got === expected;
  if (!pass) ok = false;
  console.log((pass ? 'PASS' : 'FAIL'), 'page=' + page, 'ddp=' + ddp, '-> crossOrigin=' + got);
}
console.log(ok ? 'ALL PASS' : 'SOME FAIL');
process.exit(ok ? 0 : 1);
