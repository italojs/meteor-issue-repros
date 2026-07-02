'use strict';
// Repro for meteor/meteor#13245
//
// standard-minifier-js computes an optional bundle-size "module sizes tree" from
// the MINIFIED code (used by bundle-visualizer). It parses the minified source
// with acorn and, if acorn throws, falls back to Meteor's Babel parser. If that
// ALSO throws, `extractModuleSizesTree` throws — and in
// standard-minifier-js/plugin/minify-js.js the call is OUTSIDE the try/catch
// around minification, so a stats parse failure aborts the whole production
// build ("While minifying app code: Unexpected token, expected ':'").
//
// This script reproduces the exact failing parse step using the same acorn
// (8.10) and @babel/parser (7.29) versions and the same options Meteor uses,
// against real-world syntax an npm package can ship: import assertions.

const acorn = require('acorn');
const babelParser = require('@babel/parser');

// Options copied verbatim from standard-minifier-js/plugin/stats.js
const ACORN_OPTIONS = {
  ecmaVersion: 'latest',
  sourceType: 'script',
  allowAwaitOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true,
  checkPrivateFields: false,
};

// Plugin list copied from @meteorjs/reify/lib/parsers/babel.js (used by
// meteor/babel-compiler's Babel.parse — note: no "importAssertions").
const BABEL_OPTIONS = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowUndeclaredExports: true,
  plugins: [
    '*', 'flow', 'jsx', 'asyncGenerators', 'bigInt', 'classPrivateMethods',
    'classPrivateProperties', 'classProperties', 'doExpressions', 'dynamicImport',
    'exportDefaultFrom', 'exportExtensions', 'exportNamespaceFrom', 'functionBind',
    'functionSent', 'importMeta', 'nullishCoalescingOperator', 'numericSeparator',
    'objectRestSpread', 'optionalCatchBinding', 'optionalChaining',
    ['pipelineOperator', { proposal: 'minimal' }], 'throwExpressions', 'topLevelAwait',
  ],
  sourceType: 'module',
  strictMode: false,
};

// Minified-style bundle: matches stats.js's meteorInstallRegExp AND carries
// import-assertion syntax, as untranspiled node_modules code would.
const source =
  'var x=Package.modules.meteorInstall({"node_modules":{}});\n' +
  'import data from "./data.json" assert { type: "json" };\n';

// --- current behavior (bug) -------------------------------------------------
function extractModuleSizesTree_BEFORE(src) {
  let ast;
  try {
    ast = acorn.parse(src, ACORN_OPTIONS);
  } catch (e) {
    // stats.js falls back to Babel with no further guard:
    ast = babelParser.parse(src, BABEL_OPTIONS); // <-- throws => breaks the build
  }
  return ast;
}

// --- fixed behavior ---------------------------------------------------------
function extractModuleSizesTree_AFTER(src) {
  let ast;
  try {
    ast = acorn.parse(src, ACORN_OPTIONS);
  } catch (acornError) {
    try {
      ast = babelParser.parse(src, BABEL_OPTIONS);
    } catch (babelError) {
      // Optional bundle stats must not fail the build: skip the tree.
      return undefined;
    }
  }
  return ast;
}

console.log('== BEFORE (current stats.js logic) ==');
try {
  extractModuleSizesTree_BEFORE(source);
  console.log('  parsed OK (no repro)');
} catch (e) {
  console.log('  THREW: ' + e.message.split('\n')[0]);
  console.log('  => in minify-js.js this call is outside try/catch => the whole');
  console.log('     production build aborts with this error.');
}

console.log('\n== AFTER (non-fatal stats) ==');
const result = extractModuleSizesTree_AFTER(source);
console.log('  returned: ' + result + '  (build proceeds; stats fall back to byte length)');
