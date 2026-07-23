Package["core-runtime"].queue("minifyStdCSS",function () {/* Imports */
var CssTools = Package['minifier-css'].CssTools;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"minifyStdCSS":{"plugin":{"minify-css.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minifyStdCSS/plugin/minify-css.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {let sourcemap;module.link("source-map",{default(v){sourcemap=v}},0);let createHash;module.link("crypto",{createHash(v){createHash=v}},1);let LRUCache;module.link("lru-cache",{default(v){LRUCache=v}},2);let loadPostCss,watchAndHashDeps,usePostCss;module.link('./postcss.js',{loadPostCss(v){loadPostCss=v},watchAndHashDeps(v){watchAndHashDeps=v},usePostCss(v){usePostCss=v}},3);let Log;module.link('meteor/logging',{Log(v){Log=v}},4);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}





const { argv, env: { DEBUG_CSS } } = process;
const verbose = DEBUG_CSS !== "false" && DEBUG_CSS !== "0" && (DEBUG_CSS || argv.indexOf('--verbose') > -1 || argv.indexOf('--debug') > -1);
Plugin.registerMinifier({
    extensions: [
        "css"
    ],
    archMatching: "web"
}, function() {
    const minifier = new CssToolsMinifier();
    return minifier;
});
class CssToolsMinifier {
    beforeMinify() {
        this.depsHashCache = Object.create(null);
    }
    formatSize(bytes) {
        return bytes < 1024 ? `${bytes} bytes` : `${Math.round(bytes / 1024)}k`;
    }
    watchAndHashDeps(deps, file) {
        const cacheKey = JSON.stringify(deps);
        if (cacheKey in this.depsHashCache) {
            return this.depsHashCache[cacheKey];
        }
        let hash = watchAndHashDeps(deps, (filePath)=>{
            return file.readAndWatchFileWithHash(filePath).hash;
        });
        this.depsHashCache[cacheKey] = hash;
        return hash;
    }
    minifyFiles(files, mode, postcssConfig) {
        return _async_to_generator(function*() {
            const cacheKey = createCacheKey(files, mode);
            const cachedResult = this.cache.get(cacheKey);
            if (cachedResult && cachedResult.depsCacheKey === this.watchAndHashDeps(cachedResult.deps, files[0])) {
                if (verbose && !this.haveHitAnyCache) {
                    this.haveHitAnyCache = true;
                    setTimeout(()=>{
                        const stats = [
                            `minifyStdCSS: Total CSS ${this.formatSize(this.totalSize)}`
                        ];
                        if (this.totalMinifiedSize !== 0) {
                            stats.push(`minified ${this.formatSize(this.totalMinifiedSize)}`);
                            stats.push(`reduction ${Math.round(100 - this.totalMinifiedSize * 100 / this.totalSize)}%`);
                        }
                        console.log(stats.join(", "));
                    }, 500);
                }
                return cachedResult.stylesheets;
            }
            let result = [];
            if (verbose) process.stdout.write(` > Merging [ ${files.map(({ _source: { targetPath } })=>targetPath).join(' ')} ]`);
            const merged = yield mergeCss(files, postcssConfig);
            if (verbose) {
                process.stdout.write(` > ${this.formatSize(merged.code.length)}`);
                this.totalSize += merged.code.length;
            }
            if (mode === 'development') {
                result = [
                    {
                        data: merged.code,
                        sourceMap: merged.sourceMap,
                        path: 'merged-stylesheets.css'
                    }
                ];
            } else {
                if (verbose) process.stdout.write(` > minifying`);
                const minifiedFiles = yield CssTools.minifyCssAsync(merged.code);
                result = minifiedFiles.map((minified)=>({
                        data: minified
                    }));
                if (verbose) {
                    const minifiedSize = minifiedFiles.reduce((sum, minifiedFile)=>sum + minifiedFile.length, 0);
                    process.stdout.write(` > ${this.formatSize(minifiedSize)}`);
                    this.totalMinifiedSize += minifiedSize;
                }
            }
            if (verbose) process.stdout.write('\n');
            this.cache.set(cacheKey, {
                stylesheets: result,
                deps: merged.deps,
                depsCacheKey: this.watchAndHashDeps(merged.deps, files[0])
            });
            return result;
        }).call(this);
    }
    processFilesForBundle(_0, _1) {
        return _async_to_generator(function*(files, { minifyMode }) {
            if (!files.length) return;
            const { error, postcssConfig } = yield loadPostCss();
            if (error) {
                if (verbose) Log.error('processFilesForBundle loadPostCss error', error);
                files[0].error(error);
                return;
            }
            const stylesheets = yield this.minifyFiles(files, minifyMode, postcssConfig);
            stylesheets.forEach((stylesheet, i)=>{
                if (verbose && !this.haveHitAnyCache) process.stdout.write(`Adding CSS${i === 0 ? '' : ' ' + i + 1}`);
                files[0].addStylesheet(stylesheet);
            });
        }).apply(this, arguments);
    }
    constructor(){
        this.cache = new LRUCache({
            max: 100
        });
        this.depsHashCache = Object.create(null);
        this.totalSize = 0;
        this.totalMinifiedSize = 0;
        this.haveHitAnyCache = false; // once we hit the cache, there's no point in showing 'Adding CSS', we know it will be fine and floods the terminal needlessly.
    }
}
const createCacheKey = Profile("createCacheKey", function(files, minifyMode) {
    const hash = createHash("sha1");
    hash.update(minifyMode).update("\0");
    files.forEach((f)=>{
        hash.update(f.getSourceHash()).update("\0");
    });
    return hash.digest("hex");
});
function disableSourceMappingURLs(css) {
    return css.replace(/# sourceMappingURL=/g, "# sourceMappingURL_DISABLED=");
}
// Lints CSS files and merges them into one file, fixing up source maps and
// pulling any @import directives up to the top since the CSS spec does not
// allow them to appear in the middle of a file.
const mergeCss = Profile("mergeCss", function(css, postcssConfig) {
    return _async_to_generator(function*() {
        // Filenames passed to AST manipulator mapped to their original files
        const originals = {};
        const deps = [];
        const astPromises = css.map(function(file) {
            return _async_to_generator(function*() {
                const filename = file.getPathInBundle();
                originals[filename] = file;
                let ast;
                try {
                    let content = disableSourceMappingURLs(file.getContentsAsString());
                    if (usePostCss(file, postcssConfig)) {
                        const result = yield postcssConfig.postcss(postcssConfig.plugins).process(content, {
                            from: Plugin.convertToOSPath(file.getSourcePath()),
                            parser: postcssConfig.options.parser
                        });
                        result.warnings().forEach((warning)=>{
                            warnCb(filename, warning.toString());
                        });
                        result.messages.forEach((message)=>{
                            if ([
                                'dependency',
                                'dir-dependency'
                            ].includes(message.type)) {
                                deps.push(message);
                            }
                        });
                        content = result.css;
                    }
                    const parseOptions = {
                        source: filename,
                        position: true
                    };
                    ast = CssTools.parseCss(content, parseOptions);
                    ast.filename = filename;
                } catch (e) {
                    if (e.reason) {
                        file.error({
                            message: e.reason,
                            line: e.line,
                            column: e.column
                        });
                    } else {
                        // Just in case it's not the normal error the library makes.
                        file.error({
                            message: e.stack
                        });
                    }
                    return {
                        type: "stylesheet",
                        stylesheet: {
                            rules: []
                        },
                        filename
                    };
                }
                return ast;
            })();
        });
        const cssAsts = yield Promise.all(astPromises);
        const mergedCssAst = CssTools.mergeCssAsts(cssAsts, warnCb);
        // Overwrite the CSS files list with the new concatenated file
        const stringifiedCss = CssTools.stringifyCss(mergedCssAst, {
            sourcemap: true,
            // don't try to read the referenced sourcemaps from the input
            inputSourcemaps: false
        });
        if (!stringifiedCss.code) {
            return {
                code: '',
                deps
            };
        }
        // Add the contents of the input files to the source map of the new file
        stringifiedCss.map.sourcesContent = stringifiedCss.map.sources.map(function(filename) {
            const file = originals[filename] || null;
            return file && file.getContentsAsString();
        });
        // Compose the concatenated file's source map with source maps from the
        // previous build step if necessary.
        const newMap = yield Profile.time("composing source maps", function() {
            return _async_to_generator(function*() {
                const newMap = new sourcemap.SourceMapGenerator();
                const concatConsumer = yield new sourcemap.SourceMapConsumer(stringifiedCss.map);
                // Create a dictionary of source map consumers for fast access
                const consumers = Object.create(null);
                yield Promise.all(Object.entries(originals).map(([name, file])=>_async_to_generator(function*() {
                        const sourceMap = file.getSourceMap();
                        if (sourceMap) {
                            try {
                                consumers[name] = yield new sourcemap.SourceMapConsumer(sourceMap);
                            } catch (err) {
                            // If we can't apply the source map, silently drop it.
                            //
                            // XXX This is here because there are some less files that
                            // produce source maps that throw when consumed. We should
                            // figure out exactly why and fix it, but this will do for now.
                            }
                        }
                    })()));
                // Maps each original source file name to the SourceMapConsumer that
                // can provide its content.
                const sourceToConsumerMap = Object.create(null);
                // Find mappings from the concatenated file back to the original files
                concatConsumer.eachMapping((mapping)=>{
                    let { source } = mapping;
                    const consumer = consumers[source];
                    let original = {
                        line: mapping.originalLine,
                        column: mapping.originalColumn
                    };
                    // If there is a source map for the original file, e.g., if it has been
                    // compiled from Less to CSS, find the source location in the original's
                    // original file. Otherwise, use the mapping of the concatenated file's
                    // source map.
                    if (consumer) {
                        const newOriginal = consumer.originalPositionFor(original);
                        // Finding the original position should always be possible (otherwise,
                        // one of the source maps would have incorrect mappings). However, in
                        // case there is something wrong, use the intermediate mapping.
                        if (newOriginal.source !== null) {
                            original = newOriginal;
                            source = original.source;
                            if (source) {
                                // Since the new consumer provided a different
                                // original.source, we should ask it for the original source
                                // content instead of asking the concatConsumer.
                                sourceToConsumerMap[source] = consumer;
                            }
                        }
                    }
                    if (source && !sourceToConsumerMap[source]) {
                        // If we didn't set sourceToConsumerMap[source] = consumer above,
                        // use the concatConsumer to determine the original content.
                        sourceToConsumerMap[source] = concatConsumer;
                    }
                    // Add a new mapping to the final source map
                    newMap.addMapping({
                        generated: {
                            line: mapping.generatedLine,
                            column: mapping.generatedColumn
                        },
                        original,
                        source
                    });
                });
                // The consumer.sourceContentFor and newMap.setSourceContent methods
                // are relatively fast, but not entirely trivial, so it's better to
                // call them only once per source, rather than calling them every time
                // we call newMap.addMapping in the loop above.
                Object.entries(sourceToConsumerMap).forEach(([source, consumer])=>{
                    const content = consumer.sourceContentFor(source);
                    newMap.setSourceContent(source, content);
                });
                concatConsumer.destroy();
                Object.values(consumers).forEach((consumer)=>consumer.destroy());
                return newMap;
            })();
        });
        return {
            code: stringifiedCss.code,
            sourceMap: newMap.toString(),
            deps
        };
    })();
});
function warnCb(filename, msg) {
    // XXX make this a buildmessage.warning call rather than a random log.
    //     this API would be like buildmessage.error, but wouldn't cause
    //     the build to fail.
    Log.warn(`${filename}: warn: ${msg}`);
}
;
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"postcss.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/plugin/postcss.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({loadPostCss:()=>loadPostCss,usePostCss:()=>usePostCss});module.export({watchAndHashDeps:()=>watchAndHashDeps},true);let createHash;module.link("crypto",{createHash(v){createHash=v}},0);let micromatch;module.link('micromatch',{default(v){micromatch=v}},1);let performance;module.link('perf_hooks',{performance(v){performance=v}},2);



var fs = Plugin.fs;
var path = Plugin.path;

const DEBUG_CACHE = process.env.DEBUG_METEOR_POSTCSS_DEP_CACHE === 'true';

let postcssConfig;
let loaded = false;

const missingPostCssError = new Error([
    '',
    `The postcss npm package could not be found in your node_modules`,
    'directory. Please run the following command to install it:',
    '    meteor npm install postcss@8',
    'or disable postcss by removing the postcss config.',
    '',
  ].join('\n'));

async function loadPostCss() {
  if (loaded) {
    return { postcssConfig };
  }

  let loadConfig;
  try {
    loadConfig = require('postcss-load-config');
  } catch (e) {
    // The app doesn't have this package installed
    // Assuming the app doesn't use PostCSS
    loaded = true;

    return {};
 }

  let config;
  try {
    config = await loadConfig({ meteor: true });
  } catch (e) {
    if (e.message.includes('No PostCSS Config found in')) {
      // PostCSS is not used by this app
      loaded = true;

      return {};
    }

    if (e.message.includes('Cannot find module \'postcss\'')) {
      return { error: missingPostCssError };
    }

    e.message = `While loading postcss config: ${e.message}`;
    return {
      error: e,
    };
  }

  let postcss;
  try {
    postcss = require('postcss');
  } catch (e) {
    return { error: missingPostCssError };
  }

  const postcssVersion = require('postcss/package.json').version;
  const major = parseInt(postcssVersion.split('.')[0], 10);
  if (major !== 8) {
    // TODO: should this just be a warning instead?
    const error = new Error([
      '',
      `Found version ${postcssVersion} of postcss in your node_modules`,
      'directory. standard-minifier-css is only compatible with',
      'version 8 of PostCSS. Please restart Meteor after installing',
      'a supported version of PostCSS',
      '',
    ].join('\n'));

    return { error };
  }

  loaded = true;
  config.postcss = postcss;
  postcssConfig = config;

  return { postcssConfig };
}

function usePostCss(file, postcssConfig) {
  if (!postcssConfig) {
    return false;
  }

  const excludedPackages = postcssConfig.options.excludedMeteorPackages || [];
  const path = file.getPathInBundle();

  const excluded = excludedPackages.some(name => {
    return path.includes(`packages/${name.replace(':', '_')}`);
  });

  return !excluded;
}

const watchAndHashDeps = Profile(
  'watchAndHashDeps',
  function (deps, hashAndWatchFile) {
    const hash = createHash('sha1');
    const globsByDir = Object.create(null);
    let fileCount = 0;
    let folderCount = 0;
    let start = performance.now();

    deps.forEach(dep => {
      if (dep.type === 'dependency') {
        fileCount += 1;
        const fileHash = hashAndWatchFile(dep.file);
        hash.update(fileHash || 'deleted').update('\0');
      } else if (dep.type === 'dir-dependency') {
        if (dep.dir in globsByDir) {
          globsByDir[dep.dir].push(dep.glob || '**');
        } else {
          globsByDir[dep.dir] = [dep.glob || '**'];
        }
      }
    });


    Object.entries(globsByDir).forEach(([parentDir, globs]) => {
      const matchers = globs.map(glob => micromatch.matcher(glob));

      function walk(relDir) {
        const absDir = path.join(parentDir, relDir);
        hash.update(absDir).update('\0');
        folderCount += 1;

        const entries = fs.readdirWithTypesSync(absDir);
        for (const entry of entries) {
          const relPath = path.join(relDir, entry.name);

          if (entry.isFile() && matchers.some(isMatch => isMatch(relPath))) {
            const absPath = path.join(absDir, entry.name);
            fileCount += 1;
            hash.update(hashAndWatchFile(absPath)).update('\0');
          } else if (
            entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.meteor'
          ) {
            walk(relPath);
          }
        }
      }

      walk('./');
    });

    let digest = hash.digest('hex');

    if (DEBUG_CACHE) {
      console.log('--- PostCSS Cache Info ---');
      console.log('Glob deps', JSON.stringify(globsByDir, null, 2));
      console.log('File dep count', fileCount);
      console.log('Walked folders', folderCount);
      console.log('Created dep cache key in', performance.now() - start, 'ms');
      console.log('--------------------------');
    }

    return digest;
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"source-map":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/source-map/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "source-map",
  "version": "0.7.4",
  "main": "./source-map.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"source-map.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/source-map/source-map.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lru-cache":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/lru-cache/package.json                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lru-cache",
  "version": "6.0.0",
  "main": "index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/lru-cache/index.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"micromatch":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/micromatch/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "micromatch",
  "version": "4.0.5",
  "main": "index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdCSS/node_modules/micromatch/index.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/minifyStdCSS/plugin/minify-css.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/minifyStdCSS_plugin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaWZ5U3RkQ1NTL3BsdWdpbi9taW5pZnktY3NzLmpzIl0sIm5hbWVzIjpbImFyZ3YiLCJlbnYiLCJERUJVR19DU1MiLCJwcm9jZXNzIiwidmVyYm9zZSIsImluZGV4T2YiLCJQbHVnaW4iLCJyZWdpc3Rlck1pbmlmaWVyIiwiZXh0ZW5zaW9ucyIsImFyY2hNYXRjaGluZyIsIm1pbmlmaWVyIiwiQ3NzVG9vbHNNaW5pZmllciIsImJlZm9yZU1pbmlmeSIsImRlcHNIYXNoQ2FjaGUiLCJPYmplY3QiLCJjcmVhdGUiLCJmb3JtYXRTaXplIiwiYnl0ZXMiLCJNYXRoIiwicm91bmQiLCJ3YXRjaEFuZEhhc2hEZXBzIiwiZGVwcyIsImZpbGUiLCJjYWNoZUtleSIsIkpTT04iLCJzdHJpbmdpZnkiLCJoYXNoIiwiZmlsZVBhdGgiLCJyZWFkQW5kV2F0Y2hGaWxlV2l0aEhhc2giLCJtaW5pZnlGaWxlcyIsImZpbGVzIiwibW9kZSIsInBvc3Rjc3NDb25maWciLCJjcmVhdGVDYWNoZUtleSIsImNhY2hlZFJlc3VsdCIsImNhY2hlIiwiZ2V0IiwiZGVwc0NhY2hlS2V5IiwiaGF2ZUhpdEFueUNhY2hlIiwic2V0VGltZW91dCIsInN0YXRzIiwidG90YWxTaXplIiwidG90YWxNaW5pZmllZFNpemUiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJzdHlsZXNoZWV0cyIsInJlc3VsdCIsInN0ZG91dCIsIndyaXRlIiwibWFwIiwiX3NvdXJjZSIsInRhcmdldFBhdGgiLCJtZXJnZWQiLCJtZXJnZUNzcyIsImNvZGUiLCJsZW5ndGgiLCJkYXRhIiwic291cmNlTWFwIiwicGF0aCIsIm1pbmlmaWVkRmlsZXMiLCJDc3NUb29scyIsIm1pbmlmeUNzc0FzeW5jIiwibWluaWZpZWQiLCJtaW5pZmllZFNpemUiLCJyZWR1Y2UiLCJzdW0iLCJtaW5pZmllZEZpbGUiLCJzZXQiLCJwcm9jZXNzRmlsZXNGb3JCdW5kbGUiLCJtaW5pZnlNb2RlIiwiZXJyb3IiLCJsb2FkUG9zdENzcyIsIkxvZyIsImZvckVhY2giLCJzdHlsZXNoZWV0IiwiaSIsImFkZFN0eWxlc2hlZXQiLCJMUlVDYWNoZSIsIm1heCIsIlByb2ZpbGUiLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZiIsImdldFNvdXJjZUhhc2giLCJkaWdlc3QiLCJkaXNhYmxlU291cmNlTWFwcGluZ1VSTHMiLCJjc3MiLCJyZXBsYWNlIiwib3JpZ2luYWxzIiwiYXN0UHJvbWlzZXMiLCJmaWxlbmFtZSIsImdldFBhdGhJbkJ1bmRsZSIsImFzdCIsImNvbnRlbnQiLCJnZXRDb250ZW50c0FzU3RyaW5nIiwidXNlUG9zdENzcyIsInBvc3Rjc3MiLCJwbHVnaW5zIiwiZnJvbSIsImNvbnZlcnRUb09TUGF0aCIsImdldFNvdXJjZVBhdGgiLCJwYXJzZXIiLCJvcHRpb25zIiwid2FybmluZ3MiLCJ3YXJuaW5nIiwid2FybkNiIiwidG9TdHJpbmciLCJtZXNzYWdlcyIsIm1lc3NhZ2UiLCJpbmNsdWRlcyIsInR5cGUiLCJwYXJzZU9wdGlvbnMiLCJzb3VyY2UiLCJwb3NpdGlvbiIsInBhcnNlQ3NzIiwiZSIsInJlYXNvbiIsImxpbmUiLCJjb2x1bW4iLCJzdGFjayIsInJ1bGVzIiwiY3NzQXN0cyIsIlByb21pc2UiLCJhbGwiLCJtZXJnZWRDc3NBc3QiLCJtZXJnZUNzc0FzdHMiLCJzdHJpbmdpZmllZENzcyIsInN0cmluZ2lmeUNzcyIsInNvdXJjZW1hcCIsImlucHV0U291cmNlbWFwcyIsInNvdXJjZXNDb250ZW50Iiwic291cmNlcyIsIm5ld01hcCIsInRpbWUiLCJTb3VyY2VNYXBHZW5lcmF0b3IiLCJjb25jYXRDb25zdW1lciIsIlNvdXJjZU1hcENvbnN1bWVyIiwiY29uc3VtZXJzIiwiZW50cmllcyIsIm5hbWUiLCJnZXRTb3VyY2VNYXAiLCJlcnIiLCJzb3VyY2VUb0NvbnN1bWVyTWFwIiwiZWFjaE1hcHBpbmciLCJtYXBwaW5nIiwiY29uc3VtZXIiLCJvcmlnaW5hbCIsIm9yaWdpbmFsTGluZSIsIm9yaWdpbmFsQ29sdW1uIiwibmV3T3JpZ2luYWwiLCJvcmlnaW5hbFBvc2l0aW9uRm9yIiwiYWRkTWFwcGluZyIsImdlbmVyYXRlZCIsImdlbmVyYXRlZExpbmUiLCJnZW5lcmF0ZWRDb2x1bW4iLCJzb3VyY2VDb250ZW50Rm9yIiwic2V0U291cmNlQ29udGVudCIsImRlc3Ryb3kiLCJ2YWx1ZXMiLCJtc2ciLCJ3YXJuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFtQztBQUNDO0FBQ0g7QUFDd0M7QUFDcEM7QUFFckMsTUFBTSxFQUFFQSxJQUFJLEVBQUVDLEtBQUksRUFBRUMsU0FBUyxFQUFFLEVBQUUsR0FBR0M7QUFDcEMsTUFBTUMsVUFBV0YsY0FBWSxXQUFXQSxjQUFZLE9BQ2xEQSxjQUFhRixLQUFLSyxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUtMLEtBQUtLLE9BQU8sQ0FBQyxhQUFhLENBQUM7QUFHNUVDLE9BQU9DLGdCQUFnQixDQUFDO0lBQ3RCQyxZQUFZO1FBQUM7S0FBTTtJQUNuQkMsY0FBYztBQUNoQixHQUFHO0lBQ0QsTUFBTUMsV0FBVyxJQUFJQztJQUNyQixPQUFPRDtBQUNUO0FBRUEsTUFBTUM7SUFZSkMsZUFBZTtRQUNiLElBQUksQ0FBQ0MsYUFBYSxHQUFHQyxPQUFPQyxNQUFNLENBQUM7SUFDckM7SUFFQUMsV0FBV0MsS0FBSyxFQUFFO1FBQ2hCLE9BQU9BLFFBQVEsT0FBTyxHQUFHQSxNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUdDLEtBQUtDLEtBQUssQ0FBQ0YsUUFBTSxNQUFNLENBQUMsQ0FBQztJQUN2RTtJQUVBRyxpQkFBaUJDLElBQUksRUFBRUMsSUFBSSxFQUFFO1FBQzNCLE1BQU1DLFdBQVdDLEtBQUtDLFNBQVMsQ0FBQ0o7UUFFaEMsSUFBSUUsWUFBWSxJQUFJLENBQUNWLGFBQWEsRUFBRTtZQUNsQyxPQUFPLElBQUksQ0FBQ0EsYUFBYSxDQUFDVSxTQUFTO1FBQ3JDO1FBRUEs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LFNBQVNVLGdCQUFnQixDQUFDM0M7b0JBQzFDb0IsT0FBT3dCLGdCQUFnQixDQUFDNUMsUUFBUW5CO2dCQUNsQztnQkFFQTBDLGVBQWVzQixPQUFPO2dCQUN0QmpKLE9BQU9rSixNQUFNLENBQUNyQixXQUFXaEUsT0FBTyxDQUFDd0UsWUFBWUEsU0FBU1ksT0FBTztnQkFFN0QsT0FBT3pCO1lBQ1Q7O1FBRUEsT0FBTztZQUNMOUUsTUFBTXdFLGVBQWV4RSxJQUFJO1lBQ3pCRyxXQUFXMkUsT0FBTzFCLFFBQVE7WUFDMUJ2RjtRQUNGO0lBQ0Y7O0FBRUEsU0FBU3NGLE9BQVFmLFFBQVEsRUFBRXFFLEdBQUc7SUFDNUIsc0VBQXNFO0lBQ3RFLG9FQUFvRTtJQUNwRSx5QkFBeUI7SUFDekJ2RixJQUFJd0YsSUFBSSxDQUFDLEdBQUd0RSxTQUFTLFFBQVEsRUFBRXFFLEtBQUs7QUFDdEMiLCJmaWxlIjoiL3BhY2thZ2VzL21pbmlmeVN0ZENTU19wbHVnaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc291cmNlbWFwIGZyb20gXCJzb3VyY2UtbWFwXCI7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0IExSVUNhY2hlIGZyb20gXCJscnUtY2FjaGVcIjtcbmltcG9ydCB7IGxvYWRQb3N0Q3NzLCB3YXRjaEFuZEhhc2hEZXBzLCB1c2VQb3N0Q3NzIH0gZnJvbSAnLi9wb3N0Y3NzLmpzJztcbmltcG9ydCB7IExvZyB9IGZyb20gJ21ldGVvci9sb2dnaW5nJztcblxuY29uc3QgeyBhcmd2LCBlbnY6eyBERUJVR19DU1MgfSB9ID0gcHJvY2VzcztcbmNvbnN0IHZlcmJvc2UgPSAoREVCVUdfQ1NTIT09XCJmYWxzZVwiICYmIERFQlVHX0NTUyE9PVwiMFwiICYmIChcbiAgREVCVUdfQ1NTIHx8IGFyZ3YuaW5kZXhPZignLS12ZXJib3NlJykgPiAtMSB8fCBhcmd2LmluZGV4T2YoJy0tZGVidWcnKSA+IC0xXG4pKTtcblxuUGx1Z2luLnJlZ2lzdGVyTWluaWZpZXIoe1xuICBleHRlbnNpb25zOiBbXCJjc3NcIl0sXG4gIGFyY2hNYXRjaGluZzogXCJ3ZWJcIixcbn0sIGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgbWluaWZpZXIgPSBuZXcgQ3NzVG9vbHNNaW5pZmllcigpO1xuICByZXR1cm4gbWluaWZpZXI7XG59KTtcblxuY2xhc3MgQ3NzVG9vbHNNaW5pZmllciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2FjaGUgPSBuZXcgTFJVQ2FjaGUoe1xuICAgICAgbWF4OiAxMDAsXG4gICAgfSk7XG5cbiAgICB0aGlzLmRlcHNIYXNoQ2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMudG90YWxTaXplID0gMDtcbiAgICB0aGlzLnRvdGFsTWluaWZpZWRTaXplID0gMDtcbiAgICB0aGlzLmhhdmVIaXRBbnlDYWNoZSA9IGZhbHNlOyAvLyBvbmNlIHdlIGhpdCB0aGUgY2FjaGUsIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gc2hvd2luZyAnQWRkaW5nIENTUycsIHdlIGtub3cgaXQgd2lsbCBiZSBmaW5lIGFuZCBmbG9vZHMgdGhlIHRlcm1pbmFsIG5lZWRsZXNzbHkuXG4gIH1cblxuICBiZWZvcmVNaW5pZnkoKSB7XG4gICAgdGhpcy5kZXBzSGFzaENhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuXG4gIGZvcm1hdFNpemUoYnl0ZXMpIHtcbiAgICByZXR1cm4gYnl0ZXMgPCAxMDI0ID8gYCR7Ynl0ZXN9IGJ5dGVzYCA6IGAke01hdGgucm91bmQoYnl0ZXMvMTAyNCl9a2A7XG4gIH1cblxuICB3YXRjaEFuZEhhc2hEZXBzKGRlcHMsIGZpbGUpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IEpTT04uc3RyaW5naWZ5KGRlcHMpO1xuXG4gICAgaWYgKGNhY2hlS2V5IGluIHRoaXMuZGVwc0hhc2hDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVwc0hhc2hDYWNoZVtjYWNoZUtleV07XG4gICAgfVxuXG4gICAgbGV0IGhhc2ggPSB3YXRjaEFuZEhhc2hEZXBzKGRlcHMsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgcmV0dXJuIGZpbGUucmVhZEFuZFdhdGNoRmlsZVdpdGhIYXNoKGZpbGVQYXRoKS5oYXNoO1xuICAgIH0pO1xuICAgIHRoaXMuZGVwc0hhc2hDYWNoZVtjYWNoZUtleV0gPSBoYXNoO1xuXG4gICAgcmV0dXJuIGhhc2g7XG4gIH1cblxuICBhc3luYyBtaW5pZnlGaWxlcyAoZmlsZXMsIG1vZGUsIHBvc3Rjc3NDb25maWcpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGNyZWF0ZUNhY2hlS2V5KGZpbGVzLCBtb2RlKTtcbiAgICBjb25zdCBjYWNoZWRSZXN1bHQgPSB0aGlzLmNhY2hlLmdldChjYWNoZUtleSk7XG5cbiAgICBpZiAoXG4gICAgICBjYWNoZWRSZXN1bHQgJiZcbiAgICAgIGNhY2hlZFJlc3VsdC5kZXBzQ2FjaGVLZXkgPT09IHRoaXMud2F0Y2hBbmRIYXNoRGVwcyhjYWNoZWRSZXN1bHQuZGVwcywgZmlsZXNbMF0pXG4gICAgKSB7XG4gICAgICBpZiAodmVyYm9zZSAmJiAhdGhpcy5oYXZlSGl0QW55Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5oYXZlSGl0QW55Q2FjaGUgPSB0cnVlO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IC8vIHdlIHVzZSBhIHRpbWVvdXQgdG8gZ2l2ZSBhbGwgZmlsZXMgYSBjaGFuY2UgdG8gZmluaXNoIGJlaW5nIG1pbmlmaWVkXG4gICAgICAgICAgY29uc3Qgc3RhdHMgPSBbYG1pbmlmeVN0ZENTUzogVG90YWwgQ1NTICR7dGhpcy5mb3JtYXRTaXplKHRoaXMudG90YWxTaXplKX1gXTtcbiAgICAgICAgICBpZiAodGhpcy50b3RhbE1pbmlmaWVkU2l6ZSE9PTApIHtcbiAgICAgICAgICAgIHN0YXRzLnB1c2goYG1pbmlmaWVkICR7dGhpcy5mb3JtYXRTaXplKHRoaXMudG90YWxNaW5pZmllZFNpemUpfWApO1xuICAgICAgICAgICAgc3RhdHMucHVzaChgcmVkdWN0aW9uICR7TWF0aC5yb3VuZCgxMDAtdGhpcy50b3RhbE1pbmlmaWVkU2l6ZSoxMDAvdGhpcy50b3RhbFNpemUpfSVgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coc3RhdHMuam9pbihcIiwgXCIpKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWNoZWRSZXN1bHQuc3R5bGVzaGVldHM7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIGlmICh2ZXJib3NlKSBwcm9jZXNzLnN0ZG91dC53cml0ZShgID4gTWVyZ2luZyBbICR7ZmlsZXMubWFwKCAoeyBfc291cmNlOnsgdGFyZ2V0UGF0aCB9IH0pID0+IHRhcmdldFBhdGggKS5qb2luKCcgJyl9IF1gKTtcbiAgICBjb25zdCBtZXJnZWQgPSBhd2FpdCBtZXJnZUNzcyhmaWxlcywgcG9zdGNzc0NvbmZpZyk7XG4gICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGAgPiAke3RoaXMuZm9ybWF0U2l6ZShtZXJnZWQuY29kZS5sZW5ndGgpfWApO1xuICAgICAgdGhpcy50b3RhbFNpemUgKz0gbWVyZ2VkLmNvZGUubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChtb2RlID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICByZXN1bHQgPSBbe1xuICAgICAgICBkYXRhOiBtZXJnZWQuY29kZSxcbiAgICAgICAgc291cmNlTWFwOiBtZXJnZWQuc291cmNlTWFwLFxuICAgICAgICBwYXRoOiAnbWVyZ2VkLXN0eWxlc2hlZXRzLmNzcycsXG4gICAgICB9XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZlcmJvc2UpIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGAgPiBtaW5pZnlpbmdgKTtcblxuICAgICAgY29uc3QgbWluaWZpZWRGaWxlcyA9IGF3YWl0IENzc1Rvb2xzLm1pbmlmeUNzc0FzeW5jKG1lcmdlZC5jb2RlKTtcbiAgICAgIHJlc3VsdCA9IG1pbmlmaWVkRmlsZXMubWFwKCBtaW5pZmllZCA9PiAoeyBkYXRhOm1pbmlmaWVkIH0pICk7XG5cbiAgICAgIGlmICh2ZXJib3NlKSB7XG4gICAgICAgIGNvbnN0IG1pbmlmaWVkU2l6ZSA9IG1pbmlmaWVkRmlsZXMucmVkdWNlKCAoc3VtLCBtaW5pZmllZEZpbGUpID0+IHN1bSArIG1pbmlmaWVkRmlsZS5sZW5ndGgsIDApO1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgID4gJHt0aGlzLmZvcm1hdFNpemUobWluaWZpZWRTaXplKX1gKTtcbiAgICAgICAgdGhpcy50b3RhbE1pbmlmaWVkU2l6ZSArPSBtaW5pZmllZFNpemU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZlcmJvc2UpIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKTtcblxuICAgIHRoaXMuY2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgICBzdHlsZXNoZWV0czogcmVzdWx0LFxuICAgICAgZGVwczogbWVyZ2VkLmRlcHMsXG4gICAgICBkZXBzQ2FjaGVLZXk6IHRoaXMud2F0Y2hBbmRIYXNoRGVwcyhtZXJnZWQuZGVwcywgZmlsZXNbMF0pLFxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzRmlsZXNGb3JCdW5kbGUoZmlsZXMsIHsgbWluaWZ5TW9kZSB9KSB7XG4gICAgaWYgKCEgZmlsZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBjb25zdCB7IGVycm9yLCBwb3N0Y3NzQ29uZmlnIH0gPSBhd2FpdCBsb2FkUG9zdENzcygpO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBpZiAodmVyYm9zZSkgTG9nLmVycm9yKCdwcm9jZXNzRmlsZXNGb3JCdW5kbGUgbG9hZFBvc3RDc3MgZXJyb3InLCBlcnJvcik7XG4gICAgICBmaWxlc1swXS5lcnJvcihlcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzaGVldHMgPSBhd2FpdCB0aGlzLm1pbmlmeUZpbGVzKGZpbGVzLCBtaW5pZnlNb2RlLCBwb3N0Y3NzQ29uZmlnKTtcblxuICAgIHN0eWxlc2hlZXRzLmZvckVhY2goIChzdHlsZXNoZWV0LGkpID0+IHtcbiAgICAgIGlmICh2ZXJib3NlICYmICF0aGlzLmhhdmVIaXRBbnlDYWNoZSkgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYEFkZGluZyBDU1Mke2k9PT0wPycnOicgJytpKzF9YCk7XG4gICAgICBmaWxlc1swXS5hZGRTdHlsZXNoZWV0KHN0eWxlc2hlZXQpO1xuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IGNyZWF0ZUNhY2hlS2V5ID0gUHJvZmlsZShcImNyZWF0ZUNhY2hlS2V5XCIsIGZ1bmN0aW9uIChmaWxlcywgbWluaWZ5TW9kZSkge1xuICBjb25zdCBoYXNoID0gY3JlYXRlSGFzaChcInNoYTFcIik7XG4gIGhhc2gudXBkYXRlKG1pbmlmeU1vZGUpLnVwZGF0ZShcIlxcMFwiKTtcbiAgZmlsZXMuZm9yRWFjaChmID0+IHtcbiAgICBoYXNoLnVwZGF0ZShmLmdldFNvdXJjZUhhc2goKSkudXBkYXRlKFwiXFwwXCIpO1xuICB9KTtcbiAgcmV0dXJuIGhhc2guZGlnZXN0KFwiaGV4XCIpO1xufSk7XG5cbmZ1bmN0aW9uIGRpc2FibGVTb3VyY2VNYXBwaW5nVVJMcyhjc3MpIHtcbiAgcmV0dXJuIGNzcy5yZXBsYWNlKC8jIHNvdXJjZU1hcHBpbmdVUkw9L2csXG4gICAgICAgICAgICAgICAgICAgICBcIiMgc291cmNlTWFwcGluZ1VSTF9ESVNBQkxFRD1cIik7XG59XG5cbi8vIExpbnRzIENTUyBmaWxlcyBhbmQgbWVyZ2VzIHRoZW0gaW50byBvbmUgZmlsZSwgZml4aW5nIHVwIHNvdXJjZSBtYXBzIGFuZFxuLy8gcHVsbGluZyBhbnkgQGltcG9ydCBkaXJlY3RpdmVzIHVwIHRvIHRoZSB0b3Agc2luY2UgdGhlIENTUyBzcGVjIGRvZXMgbm90XG4vLyBhbGxvdyB0aGVtIHRvIGFwcGVhciBpbiB0aGUgbWlkZGxlIG9mIGEgZmlsZS5cbmNvbnN0IG1lcmdlQ3NzID0gUHJvZmlsZShcIm1lcmdlQ3NzXCIsIGFzeW5jIGZ1bmN0aW9uIChjc3MsIHBvc3Rjc3NDb25maWcpIHtcbiAgLy8gRmlsZW5hbWVzIHBhc3NlZCB0byBBU1QgbWFuaXB1bGF0b3IgbWFwcGVkIHRvIHRoZWlyIG9yaWdpbmFsIGZpbGVzXG4gIGNvbnN0IG9yaWdpbmFscyA9IHt9O1xuICBjb25zdCBkZXBzID0gW107XG5cbiAgY29uc3QgYXN0UHJvbWlzZXMgPSBjc3MubWFwKGFzeW5jIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBmaWxlLmdldFBhdGhJbkJ1bmRsZSgpO1xuICAgIG9yaWdpbmFsc1tmaWxlbmFtZV0gPSBmaWxlO1xuXG4gICAgbGV0IGFzdDtcbiAgICB0cnkge1xuICAgICAgbGV0IGNvbnRlbnQgPSBkaXNhYmxlU291cmNlTWFwcGluZ1VSTHMoZmlsZS5nZXRDb250ZW50c0FzU3RyaW5nKCkpO1xuXG4gICAgICBpZiAodXNlUG9zdENzcyhmaWxlLCBwb3N0Y3NzQ29uZmlnKSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb3N0Y3NzQ29uZmlnLnBvc3Rjc3MoXG4gICAgICAgICAgcG9zdGNzc0NvbmZpZy5wbHVnaW5zXG4gICAgICAgICkucHJvY2Vzcyhjb250ZW50LCB7XG4gICAgICAgICAgZnJvbTogUGx1Z2luLmNvbnZlcnRUb09TUGF0aChmaWxlLmdldFNvdXJjZVBhdGgoKSksXG4gICAgICAgICAgcGFyc2VyOiBwb3N0Y3NzQ29uZmlnLm9wdGlvbnMucGFyc2VyLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXN1bHQud2FybmluZ3MoKS5mb3JFYWNoKHdhcm5pbmcgPT4ge1xuICAgICAgICAgIHdhcm5DYihmaWxlbmFtZSwgd2FybmluZy50b1N0cmluZygpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc3VsdC5tZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgIGlmIChbJ2RlcGVuZGVuY3knLCAnZGlyLWRlcGVuZGVuY3knXS5pbmNsdWRlcyhtZXNzYWdlLnR5cGUpKSB7XG4gICAgICAgICAgICBkZXBzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29udGVudCA9IHJlc3VsdC5jc3M7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlT3B0aW9ucyA9IHsgc291cmNlOiBmaWxlbmFtZSwgcG9zaXRpb246IHRydWUgfTtcbiAgICAgIGFzdCA9IENzc1Rvb2xzLnBhcnNlQ3NzKGNvbnRlbnQsIHBhcnNlT3B0aW9ucyk7XG4gICAgICBhc3QuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5yZWFzb24pIHtcbiAgICAgICAgZmlsZS5lcnJvcih7XG4gICAgICAgICAgbWVzc2FnZTogZS5yZWFzb24sXG4gICAgICAgICAgbGluZTogZS5saW5lLFxuICAgICAgICAgIGNvbHVtbjogZS5jb2x1bW4sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSnVzdCBpbiBjYXNlIGl0J3Mgbm90IHRoZSBub3JtYWwgZXJyb3IgdGhlIGxpYnJhcnkgbWFrZXMuXG4gICAgICAgIGZpbGUuZXJyb3Ioe21lc3NhZ2U6IGUuc3RhY2t9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJzdHlsZXNoZWV0XCIsIHN0eWxlc2hlZXQ6IHsgcnVsZXM6IFtdIH0sIGZpbGVuYW1lIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzdDtcbiAgfSk7XG5cbiAgY29uc3QgY3NzQXN0cyA9IGF3YWl0IFByb21pc2UuYWxsKGFzdFByb21pc2VzKTtcblxuICBjb25zdCBtZXJnZWRDc3NBc3QgPSBDc3NUb29scy5tZXJnZUNzc0FzdHMoY3NzQXN0cywgd2FybkNiKTtcblxuICAvLyBPdmVyd3JpdGUgdGhlIENTUyBmaWxlcyBsaXN0IHdpdGggdGhlIG5ldyBjb25jYXRlbmF0ZWQgZmlsZVxuICBjb25zdCBzdHJpbmdpZmllZENzcyA9IENzc1Rvb2xzLnN0cmluZ2lmeUNzcyhtZXJnZWRDc3NBc3QsIHtcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgLy8gZG9uJ3QgdHJ5IHRvIHJlYWQgdGhlIHJlZmVyZW5jZWQgc291cmNlbWFwcyBmcm9tIHRoZSBpbnB1dFxuICAgIGlucHV0U291cmNlbWFwczogZmFsc2UsXG4gIH0pO1xuXG4gIGlmICghIHN0cmluZ2lmaWVkQ3NzLmNvZGUpIHtcbiAgICByZXR1cm4geyBjb2RlOiAnJywgZGVwcyB9O1xuICB9XG5cbiAgLy8gQWRkIHRoZSBjb250ZW50cyBvZiB0aGUgaW5wdXQgZmlsZXMgdG8gdGhlIHNvdXJjZSBtYXAgb2YgdGhlIG5ldyBmaWxlXG4gIHN0cmluZ2lmaWVkQ3NzLm1hcC5zb3VyY2VzQ29udGVudCA9XG4gICAgc3RyaW5naWZpZWRDc3MubWFwLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChmaWxlbmFtZSkge1xuICAgICAgY29uc3QgZmlsZSA9IG9yaWdpbmFsc1tmaWxlbmFtZV0gfHwgbnVsbDtcbiAgICAgIHJldHVybiBmaWxlICYmIGZpbGUuZ2V0Q29udGVudHNBc1N0cmluZygpO1xuICAgIH0pO1xuXG4gIC8vIENvbXBvc2UgdGhlIGNvbmNhdGVuYXRlZCBmaWxlJ3Mgc291cmNlIG1hcCB3aXRoIHNvdXJjZSBtYXBzIGZyb20gdGhlXG4gIC8vIHByZXZpb3VzIGJ1aWxkIHN0ZXAgaWYgbmVjZXNzYXJ5LlxuICBjb25zdCBuZXdNYXAgPSBhd2FpdCBQcm9maWxlLnRpbWUoXCJjb21wb3Npbmcgc291cmNlIG1hcHNcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5ld01hcCA9IG5ldyBzb3VyY2VtYXAuU291cmNlTWFwR2VuZXJhdG9yKCk7XG4gICAgY29uc3QgY29uY2F0Q29uc3VtZXIgPSBhd2FpdCBuZXcgc291cmNlbWFwLlNvdXJjZU1hcENvbnN1bWVyKHN0cmluZ2lmaWVkQ3NzLm1hcCk7XG4gICAgLy8gQ3JlYXRlIGEgZGljdGlvbmFyeSBvZiBzb3VyY2UgbWFwIGNvbnN1bWVycyBmb3IgZmFzdCBhY2Nlc3NcbiAgICBjb25zdCBjb25zdW1lcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoT2JqZWN0LmVudHJpZXMob3JpZ2luYWxzKS5tYXAoYXN5bmMgKFtuYW1lLCBmaWxlXSkgPT4ge1xuICAgICAgY29uc3Qgc291cmNlTWFwID0gZmlsZS5nZXRTb3VyY2VNYXAoKTtcblxuICAgICAgaWYgKHNvdXJjZU1hcCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN1bWVyc1tuYW1lXSA9IGF3YWl0IG5ldyBzb3VyY2VtYXAuU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgLy8gSWYgd2UgY2FuJ3QgYXBwbHkgdGhlIHNvdXJjZSBtYXAsIHNpbGVudGx5IGRyb3AgaXQuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBYWFggVGhpcyBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgYXJlIHNvbWUgbGVzcyBmaWxlcyB0aGF0XG4gICAgICAgICAgLy8gcHJvZHVjZSBzb3VyY2UgbWFwcyB0aGF0IHRocm93IHdoZW4gY29uc3VtZWQuIFdlIHNob3VsZFxuICAgICAgICAgIC8vIGZpZ3VyZSBvdXQgZXhhY3RseSB3aHkgYW5kIGZpeCBpdCwgYnV0IHRoaXMgd2lsbCBkbyBmb3Igbm93LlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgLy8gTWFwcyBlYWNoIG9yaWdpbmFsIHNvdXJjZSBmaWxlIG5hbWUgdG8gdGhlIFNvdXJjZU1hcENvbnN1bWVyIHRoYXRcbiAgICAvLyBjYW4gcHJvdmlkZSBpdHMgY29udGVudC5cbiAgICBjb25zdCBzb3VyY2VUb0NvbnN1bWVyTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIC8vIEZpbmQgbWFwcGluZ3MgZnJvbSB0aGUgY29uY2F0ZW5hdGVkIGZpbGUgYmFjayB0byB0aGUgb3JpZ2luYWwgZmlsZXNcbiAgICBjb25jYXRDb25zdW1lci5lYWNoTWFwcGluZygobWFwcGluZykgPT4ge1xuICAgICAgbGV0IHsgc291cmNlIH0gPSBtYXBwaW5nO1xuICAgICAgY29uc3QgY29uc3VtZXIgPSBjb25zdW1lcnNbc291cmNlXTtcblxuICAgICAgbGV0IG9yaWdpbmFsID0ge1xuICAgICAgICBsaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgY29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgfTtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBzb3VyY2UgbWFwIGZvciB0aGUgb3JpZ2luYWwgZmlsZSwgZS5nLiwgaWYgaXQgaGFzIGJlZW5cbiAgICAgIC8vIGNvbXBpbGVkIGZyb20gTGVzcyB0byBDU1MsIGZpbmQgdGhlIHNvdXJjZSBsb2NhdGlvbiBpbiB0aGUgb3JpZ2luYWwnc1xuICAgICAgLy8gb3JpZ2luYWwgZmlsZS4gT3RoZXJ3aXNlLCB1c2UgdGhlIG1hcHBpbmcgb2YgdGhlIGNvbmNhdGVuYXRlZCBmaWxlJ3NcbiAgICAgIC8vIHNvdXJjZSBtYXAuXG4gICAgICBpZiAoY29uc3VtZXIpIHtcbiAgICAgICAgY29uc3QgbmV3T3JpZ2luYWwgPSBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yKG9yaWdpbmFsKTtcblxuICAgICAgICAvLyBGaW5kaW5nIHRoZSBvcmlnaW5hbCBwb3NpdGlvbiBzaG91bGQgYWx3YXlzIGJlIHBvc3NpYmxlIChvdGhlcndpc2UsXG4gICAgICAgIC8vIG9uZSBvZiB0aGUgc291cmNlIG1hcHMgd291bGQgaGF2ZSBpbmNvcnJlY3QgbWFwcGluZ3MpLiBIb3dldmVyLCBpblxuICAgICAgICAvLyBjYXNlIHRoZXJlIGlzIHNvbWV0aGluZyB3cm9uZywgdXNlIHRoZSBpbnRlcm1lZGlhdGUgbWFwcGluZy5cbiAgICAgICAgaWYgKG5ld09yaWdpbmFsLnNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIG9yaWdpbmFsID0gbmV3T3JpZ2luYWw7XG4gICAgICAgICAgc291cmNlID0gb3JpZ2luYWwuc291cmNlO1xuXG4gICAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5ldyBjb25zdW1lciBwcm92aWRlZCBhIGRpZmZlcmVudFxuICAgICAgICAgICAgLy8gb3JpZ2luYWwuc291cmNlLCB3ZSBzaG91bGQgYXNrIGl0IGZvciB0aGUgb3JpZ2luYWwgc291cmNlXG4gICAgICAgICAgICAvLyBjb250ZW50IGluc3RlYWQgb2YgYXNraW5nIHRoZSBjb25jYXRDb25zdW1lci5cbiAgICAgICAgICAgIHNvdXJjZVRvQ29uc3VtZXJNYXBbc291cmNlXSA9IGNvbnN1bWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc291cmNlICYmICEgc291cmNlVG9Db25zdW1lck1hcFtzb3VyY2VdKSB7XG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBzZXQgc291cmNlVG9Db25zdW1lck1hcFtzb3VyY2VdID0gY29uc3VtZXIgYWJvdmUsXG4gICAgICAgIC8vIHVzZSB0aGUgY29uY2F0Q29uc3VtZXIgdG8gZGV0ZXJtaW5lIHRoZSBvcmlnaW5hbCBjb250ZW50LlxuICAgICAgICBzb3VyY2VUb0NvbnN1bWVyTWFwW3NvdXJjZV0gPSBjb25jYXRDb25zdW1lcjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGEgbmV3IG1hcHBpbmcgdG8gdGhlIGZpbmFsIHNvdXJjZSBtYXBcbiAgICAgIG5ld01hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgbGluZTogbWFwcGluZy5nZW5lcmF0ZWRMaW5lLFxuICAgICAgICAgIGNvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4sXG4gICAgICAgIH0sXG4gICAgICAgIG9yaWdpbmFsLFxuICAgICAgICBzb3VyY2UsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBjb25zdW1lci5zb3VyY2VDb250ZW50Rm9yIGFuZCBuZXdNYXAuc2V0U291cmNlQ29udGVudCBtZXRob2RzXG4gICAgLy8gYXJlIHJlbGF0aXZlbHkgZmFzdCwgYnV0IG5vdCBlbnRpcmVseSB0cml2aWFsLCBzbyBpdCdzIGJldHRlciB0b1xuICAgIC8vIGNhbGwgdGhlbSBvbmx5IG9uY2UgcGVyIHNvdXJjZSwgcmF0aGVyIHRoYW4gY2FsbGluZyB0aGVtIGV2ZXJ5IHRpbWVcbiAgICAvLyB3ZSBjYWxsIG5ld01hcC5hZGRNYXBwaW5nIGluIHRoZSBsb29wIGFib3ZlLlxuICAgIE9iamVjdC5lbnRyaWVzKHNvdXJjZVRvQ29uc3VtZXJNYXApLmZvckVhY2goKFtzb3VyY2UsIGNvbnN1bWVyXSkgPT4ge1xuICAgICAgY29uc3QgY29udGVudCA9IGNvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlKTtcbiAgICAgIG5ld01hcC5zZXRTb3VyY2VDb250ZW50KHNvdXJjZSwgY29udGVudCk7XG4gICAgfSk7XG5cbiAgICBjb25jYXRDb25zdW1lci5kZXN0cm95KCk7XG4gICAgT2JqZWN0LnZhbHVlcyhjb25zdW1lcnMpLmZvckVhY2goY29uc3VtZXIgPT4gY29uc3VtZXIuZGVzdHJveSgpKTtcblxuICAgIHJldHVybiBuZXdNYXA7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgY29kZTogc3RyaW5naWZpZWRDc3MuY29kZSxcbiAgICBzb3VyY2VNYXA6IG5ld01hcC50b1N0cmluZygpLFxuICAgIGRlcHMsXG4gIH07XG59KTtcblxuZnVuY3Rpb24gd2FybkNiIChmaWxlbmFtZSwgbXNnKSB7XG4gIC8vIFhYWCBtYWtlIHRoaXMgYSBidWlsZG1lc3NhZ2Uud2FybmluZyBjYWxsIHJhdGhlciB0aGFuIGEgcmFuZG9tIGxvZy5cbiAgLy8gICAgIHRoaXMgQVBJIHdvdWxkIGJlIGxpa2UgYnVpbGRtZXNzYWdlLmVycm9yLCBidXQgd291bGRuJ3QgY2F1c2VcbiAgLy8gICAgIHRoZSBidWlsZCB0byBmYWlsLlxuICBMb2cud2FybihgJHtmaWxlbmFtZX06IHdhcm46ICR7bXNnfWApO1xufTtcbiJdfQ==
