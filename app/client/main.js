// Repro for meteor/meteor#12759
// The client bundle emits a top-level `var require = meteorInstall(...)` (and,
// historically, `var exports = require(...)`). Because the bundle is served as a
// classic <script> (not a module), those top-level `var`s become properties of
// the global object, leaking `require`/`exports`/`module` to every page.
//
// NOTE: inside this file the identifiers `require`/`exports`/`module` are the
// module-closure params, so we must read them off `window`/`globalThis`
// explicitly to observe the LEAK.

const probe = {
  windowRequire: typeof window.require,
  windowExports: typeof window.exports,
  windowModule: typeof window.module,
  globalThisRequire: typeof globalThis.require,
  globalThisExports: typeof globalThis.exports,
};

// A UMD/CommonJS feature-detect, as a real third-party bundle would run it at
// the top level of the page. If Meteor leaked these globals, the script wrongly
// concludes it is in a CommonJS environment.
const looksLikeCommonJS =
  typeof window.require === 'function' && typeof window.exports === 'object';

console.log('[leak-probe]', JSON.stringify(probe));
console.log('[leak-probe] looksLikeCommonJS =', looksLikeCommonJS);

function render() {
  const pre = document.createElement('pre');
  pre.id = 'leak-probe';
  pre.textContent = JSON.stringify(probe, null, 2);
  document.body.appendChild(pre);

  const verdict = document.createElement('div');
  verdict.id = 'leak-verdict';
  verdict.textContent = looksLikeCommonJS
    ? 'LEAK: page looks like a CommonJS environment'
    : 'OK: no CommonJS globals leaked';
  document.body.appendChild(verdict);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
