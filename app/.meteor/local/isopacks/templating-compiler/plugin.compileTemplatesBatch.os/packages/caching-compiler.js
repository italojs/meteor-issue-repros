Package["core-runtime"].queue("caching-compiler",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var CachingCompilerBase, CachingCompiler, MultiFileCachingCompiler;

var require = meteorInstall({"node_modules":{"meteor":{"caching-compiler":{"caching-compiler.js":function module(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/caching-compiler/caching-compiler.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const fs = Plugin.fs;
const path = Plugin.path;
const createHash = Npm.require('crypto').createHash;
const assert = Npm.require('assert');
const LRUCache = Npm.require('lru-cache');
// Base class for CachingCompiler and MultiFileCachingCompiler.
CachingCompilerBase = class CachingCompilerBase1 {
    // Your subclass must override this method to define the key used to identify
    // a particular version of an InputFile.
    //
    // Given an InputFile (the data type passed to processFilesForTarget as part
    // of the Plugin.registerCompiler API), returns a cache key that represents
    // it. This cache key can be any JSON value (it will be converted internally
    // into a hash).  This should reflect any aspect of the InputFile that affects
    // the output of `compileOneFile`. Typically you'll want to include
    // `inputFile.getDeclaredExports()`, and perhaps
    // `inputFile.getPathInPackage()` or `inputFile.getDeclaredExports` if
    // `compileOneFile` pays attention to them.
    //
    // Note that for MultiFileCachingCompiler, your cache key doesn't need to
    // include the file's path, because that is automatically taken into account
    // by the implementation. CachingCompiler subclasses can choose whether or not
    // to include the file's path in the cache key.
    getCacheKey(inputFile) {
        throw Error('CachingCompiler subclass should implement getCacheKey!');
    }
    // Your subclass must override this method to define how a CompileResult
    // translates into adding assets to the bundle.
    //
    // This method is given an InputFile (the data type passed to
    // processFilesForTarget as part of the Plugin.registerCompiler API) and a
    // CompileResult (either returned directly from compileOneFile or read from
    // the cache).  It should call methods like `inputFile.addJavaScript`
    // and `inputFile.error`.
    addCompileResult(inputFile, compileResult) {
        throw Error('CachingCompiler subclass should implement addCompileResult!');
    }
    // Your subclass must override this method to define the size of a
    // CompilerResult (used by the in-memory cache to limit the total amount of
    // data cached).
    compileResultSize(compileResult) {
        throw Error('CachingCompiler subclass should implement compileResultSize!');
    }
    // Your subclass may override this method to define an alternate way of
    // stringifying CompilerResults.  Takes a CompileResult and returns a string.
    stringifyCompileResult(compileResult) {
        return JSON.stringify(compileResult);
    }
    // Your subclass may override this method to define an alternate way of
    // parsing CompilerResults from string.  Takes a string and returns a
    // CompileResult.  If the string doesn't represent a valid CompileResult, you
    // may want to return null instead of throwing, which will make
    // CachingCompiler ignore the cache.
    parseCompileResult(stringifiedCompileResult) {
        return this._parseJSONOrNull(stringifiedCompileResult);
    }
    _parseJSONOrNull(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            if (e instanceof SyntaxError) return null;
            throw e;
        }
    }
    _cacheDebug(message) {
        if (!this._cacheDebugEnabled) return;
        console.log(`CACHE(${this._compilerName}): ${message}`);
    }
    setDiskCacheDirectory(diskCache) {
        if (this._diskCache) throw Error('setDiskCacheDirectory called twice?');
        this._diskCache = diskCache;
    }
    // Since so many compilers will need to calculate the size of a SourceMap in
    // their compileResultSize, this method is provided.
    sourceMapSize(sm) {
        if (!sm) return 0;
        // sum the length of sources and the mappings, the size of
        // metadata is ignored, but it is not a big deal
        return sm.mappings.length + (sm.sourcesContent || []).reduce(function(soFar, current) {
            return soFar + (current ? current.length : 0);
        }, 0);
    }
    // Called by the compiler plugins system after all linking and lazy
    // compilation has finished.
    afterLink() {
        return _async_to_generator(function*() {
            for (const callback of this._afterLinkCallbacks.splice(0)){
                yield callback();
            }
        }).call(this);
    }
    // Borrowed from another MIT-licensed project that benjamn wrote:
    // https://github.com/reactjs/commoner/blob/235d54a12c/lib/util.js#L136-L168
    _deepHash(val) {
        const hash = createHash('sha1');
        let type = typeof val;
        if (val === null) {
            type = 'null';
        }
        hash.update(type + '\0');
        switch(type){
            case 'object':
                const keys = Object.keys(val);
                // Array keys will already be sorted.
                if (!Array.isArray(val)) {
                    keys.sort();
                }
                keys.forEach((key)=>{
                    if (typeof val[key] === 'function') {
                        // Silently ignore nested methods, but nevertheless complain below
                        // if the root value is a function.
                        return;
                    }
                    hash.update(key + '\0').update(this._deepHash(val[key]));
                });
                break;
            case 'function':
                assert.ok(false, 'cannot hash function objects');
                break;
            default:
                hash.update('' + val);
                break;
        }
        return hash.digest('hex');
    }
    // Write the file atomically.
    _writeFile(filename, contents) {
        const tempFilename = filename + '.tmp.' + Random.id();
        try {
            fs.writeFileSync(tempFilename, contents);
            fs.renameSync(tempFilename, filename);
        } catch (e) {
            // ignore errors, it's just a cache
            this._cacheDebug(e);
        }
    }
    // Helper function. Returns the body of the file as a string, or null if it
    // doesn't exist.
    _readFileOrNull(filename) {
        try {
            return fs.readFileSync(filename, 'utf8');
        } catch (e) {
            if (e && e.code === 'ENOENT') return null;
            throw e;
        }
    }
    constructor({ compilerName, defaultCacheSize, maxParallelism = 20 }){
        this._compilerName = compilerName;
        this._maxParallelism = maxParallelism;
        const compilerNameForEnvar = compilerName.toUpperCase().replace('/-/g', '_').replace(/[^A-Z0-9_]/g, '');
        const envVarPrefix = 'METEOR_' + compilerNameForEnvar + '_CACHE_';
        const debugEnvVar = envVarPrefix + 'DEBUG';
        this._cacheDebugEnabled = !!process.env[debugEnvVar];
        const cacheSizeEnvVar = envVarPrefix + 'SIZE';
        this._cacheSize = +process.env[cacheSizeEnvVar] || defaultCacheSize;
        this._diskCache = null;
        // For testing.
        this._callCount = 0;
        // Callbacks that will be called after the linker is done processing
        // files, after all lazy compilation has finished.
        this._afterLinkCallbacks = [];
    }
};
// CachingCompiler is a class designed to be used with Plugin.registerCompiler
// which implements in-memory and on-disk caches for the files that it
// processes.  You should subclass CachingCompiler and define the following
// methods: getCacheKey, compileOneFile, addCompileResult, and
// compileResultSize.
//
// CachingCompiler assumes that files are processed independently of each other;
// there is no 'import' directive allowing one file to reference another.  That
// is, editing one file should only require that file to be rebuilt, not other
// files.
//
// The data that is cached for each file is of a type that is (implicitly)
// defined by your subclass. CachingCompiler refers to this type as
// `CompileResult`, but this isn't a single type: it's up to your subclass to
// decide what type of data this is.  You should document what your subclass's
// CompileResult type is.
//
// Your subclass's compiler should call the superclass compiler specifying the
// compiler name (used to generate environment variables for debugging and
// tweaking in-memory cache size) and the default cache size.
//
// By default, CachingCompiler processes each file in "parallel". That is, if it
// needs to yield to read from the disk cache, or if getCacheKey,
// compileOneFile, or addCompileResult yields, it will start processing the next
// few files. To set how many files can be processed in parallel (including
// setting it to 1 if your subclass doesn't support any parallelism), pass the
// maxParallelism option to the superclass constructor.
//
// For example (using ES2015 via the ecmascript package):
//
//   class AwesomeCompiler extends CachingCompiler {
//     constructor() {
//       super({
//         compilerName: 'awesome',
//         defaultCacheSize: 1024*1024*10,
//       });
//     }
//     // ... define the other methods
//   }
//   Plugin.registerCompile({
//     extensions: ['awesome'],
//   }, () => new AwesomeCompiler());
//
// XXX maybe compileResultSize and stringifyCompileResult should just be methods
// on CompileResult? Sort of hard to do that with parseCompileResult.
CachingCompiler = class CachingCompiler1 extends CachingCompilerBase {
    // Your subclass must override this method to define the transformation from
    // InputFile to its cacheable CompileResult).
    //
    // Given an InputFile (the data type passed to processFilesForTarget as part
    // of the Plugin.registerCompiler API), compiles the file and returns a
    // CompileResult (the cacheable data type specific to your subclass).
    //
    // This method is not called on files when a valid cache entry exists in
    // memory or on disk.
    //
    // On a compile error, you should call `inputFile.error` appropriately and
    // return null; this will not be cached.
    //
    // This method should not call `inputFile.addJavaScript` and similar files!
    // That's what addCompileResult is for.
    compileOneFile(inputFile) {
        throw Error('CachingCompiler subclass should implement compileOneFile!');
    }
    // The processFilesForTarget method from the Plugin.registerCompiler API. If
    // you have processing you want to perform at the beginning or end of a
    // processing phase, you may want to override this method and call the
    // superclass implementation from within your method.
    processFilesForTarget(inputFiles) {
        return _async_to_generator(function*() {
            const cacheMisses = [];
            const arches = this._cacheDebugEnabled && Object.create(null);
            for (const inputFile of inputFiles){
                if (arches) {
                    arches[inputFile.getArch()] = 1;
                }
                const getResult = ()=>_async_to_generator(function*() {
                        const cacheKey = this._deepHash(this.getCacheKey(inputFile));
                        let compileResult = this._cache.get(cacheKey);
                        if (!compileResult) {
                            compileResult = this._readCache(cacheKey);
                            if (compileResult) {
                                this._cacheDebug(`Loaded ${inputFile.getDisplayPath()}`);
                            }
                        }
                        if (!compileResult) {
                            cacheMisses.push(inputFile.getDisplayPath());
                            compileResult = yield this.compileOneFile(inputFile);
                            if (!compileResult) {
                                // compileOneFile should have called inputFile.error.
                                //  We don't cache failures for now.
                                return;
                            }
                            // Save what we've compiled.
                            this._cache.set(cacheKey, compileResult);
                            this._writeCacheAsync(cacheKey, compileResult);
                        }
                        return compileResult;
                    }).call(this);
                if (this.compileOneFileLater && inputFile.supportsLazyCompilation) {
                    yield this.compileOneFileLater(inputFile, getResult);
                } else {
                    const result = yield getResult();
                    if (result) {
                        yield this.addCompileResult(inputFile, result);
                    }
                }
            }
            if (this._cacheDebugEnabled) {
                this._afterLinkCallbacks.push(()=>{
                    cacheMisses.sort();
                    this._cacheDebug(`Ran (#${++this._callCount}) on: ${JSON.stringify(cacheMisses)} ${JSON.stringify(Object.keys(arches).sort())}`);
                });
            }
        }).call(this);
    }
    _cacheFilename(cacheKey) {
        // We want cacheKeys to be hex so that they work on any FS and never end in
        // .cache.
        if (!/^[a-f0-9]+$/.test(cacheKey)) {
            throw Error('bad cacheKey: ' + cacheKey);
        }
        return path.join(this._diskCache, cacheKey + '.cache');
    }
    // Load a cache entry from disk. Returns the compileResult object
    // and loads it into the in-memory cache too.
    _readCache(cacheKey) {
        if (!this._diskCache) {
            return null;
        }
        const cacheFilename = this._cacheFilename(cacheKey);
        const compileResult = this._readAndParseCompileResultOrNull(cacheFilename);
        if (!compileResult) {
            return null;
        }
        this._cache.set(cacheKey, compileResult);
        return compileResult;
    }
    _writeCacheAsync(cacheKey, compileResult) {
        if (!this._diskCache) return;
        const cacheFilename = this._cacheFilename(cacheKey);
        const cacheContents = this.stringifyCompileResult(compileResult);
        this._writeFile(cacheFilename, cacheContents);
    }
    // Returns null if the file does not exist or can't be parsed; otherwise
    // returns the parsed compileResult in the file.
    _readAndParseCompileResultOrNull(filename) {
        const raw = this._readFileOrNull(filename);
        return this.parseCompileResult(raw);
    }
    constructor({ compilerName, defaultCacheSize, maxParallelism = 20 }){
        super({
            compilerName,
            defaultCacheSize,
            maxParallelism
        });
        // Maps from a hashed cache key to a compileResult.
        this._cache = new LRUCache({
            max: this._cacheSize,
            length: (value)=>this.compileResultSize(value)
        });
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"multi-file-caching-compiler.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/caching-compiler/multi-file-caching-compiler.js                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const path = Plugin.path;
const LRUCache = Npm.require('lru-cache');
// MultiFileCachingCompiler is like CachingCompiler, but for implementing
// languages which allow files to reference each other, such as CSS
// preprocessors with `@import` directives.
//
// Like CachingCompiler, you should subclass MultiFileCachingCompiler and define
// the following methods: getCacheKey, compileOneFile, addCompileResult, and
// compileResultSize.  compileOneFile gets an additional allFiles argument and
// returns an array of referenced import paths in addition to the CompileResult.
// You may also override isRoot and getAbsoluteImportPath to customize
// MultiFileCachingCompiler further.
MultiFileCachingCompiler = class MultiFileCachingCompiler1 extends CachingCompilerBase {
    // Your subclass must override this method to define the transformation from
    // InputFile to its cacheable CompileResult).
    //
    // Arguments:
    //   - inputFile is the InputFile to process
    //   - allFiles is a a Map mapping from absolute import path to InputFile of
    //     all files being processed in the target
    // Returns an object with keys:
    //   - compileResult: the CompileResult (the cacheable data type specific to
    //     your subclass).
    //   - referencedImportPaths: an array of absolute import paths of files
    //     which were refererenced by the current file.  The current file
    //     is included implicitly.
    //
    // This method is not called on files when a valid cache entry exists in
    // memory or on disk.
    //
    // On a compile error, you should call `inputFile.error` appropriately and
    // return null; this will not be cached.
    //
    // This method should not call `inputFile.addJavaScript` and similar files!
    // That's what addCompileResult is for.
    compileOneFile(inputFile, allFiles) {
        throw Error('MultiFileCachingCompiler subclass should implement compileOneFile!');
    }
    // Your subclass may override this to declare that a file is not a "root" ---
    // ie, it can be included from other files but is not processed on its own. In
    // this case, MultiFileCachingCompiler won't waste time trying to look for a
    // cache for its compilation on disk.
    isRoot(inputFile) {
        return true;
    }
    // Returns the absolute import path for an InputFile. By default, this is a
    // path is a path of the form "{package}/path/to/file" for files in packages
    // and "{}/path/to/file" for files in apps. Your subclass may override and/or
    // call this method.
    getAbsoluteImportPath(inputFile) {
        if (inputFile.getPackageName() === null) {
            return '{}/' + inputFile.getPathInPackage();
        }
        return '{' + inputFile.getPackageName() + '}/' + inputFile.getPathInPackage();
    }
    // The processFilesForTarget method from the Plugin.registerCompiler API.
    processFilesForTarget(inputFiles) {
        return _async_to_generator(function*() {
            const allFiles = new Map;
            const cacheKeyMap = new Map;
            const cacheMisses = [];
            const arches = this._cacheDebugEnabled && Object.create(null);
            inputFiles.forEach((inputFile)=>{
                const importPath = this.getAbsoluteImportPath(inputFile);
                allFiles.set(importPath, inputFile);
                cacheKeyMap.set(importPath, this._getCacheKeyWithPath(inputFile));
            });
            for (const inputFile of inputFiles){
                if (arches) {
                    arches[inputFile.getArch()] = 1;
                }
                const getResult = ()=>_async_to_generator(function*() {
                        const absoluteImportPath = this.getAbsoluteImportPath(inputFile);
                        const cacheKey = cacheKeyMap.get(absoluteImportPath);
                        let cacheEntry = this._cache.get(cacheKey);
                        if (!cacheEntry) {
                            cacheEntry = this._readCache(cacheKey);
                            if (cacheEntry) {
                                this._cacheDebug(`Loaded ${absoluteImportPath}`);
                            }
                        }
                        if (!(cacheEntry && this._cacheEntryValid(cacheEntry, cacheKeyMap))) {
                            cacheMisses.push(inputFile.getDisplayPath());
                            const compileOneFileReturn = yield this.compileOneFile(inputFile, allFiles);
                            if (!compileOneFileReturn) {
                                // compileOneFile should have called inputFile.error.
                                // We don't cache failures for now.
                                return;
                            }
                            const { compileResult, referencedImportPaths } = compileOneFileReturn;
                            cacheEntry = {
                                compileResult,
                                cacheKeys: {
                                    // Include the hashed cache key of the file itself...
                                    [absoluteImportPath]: cacheKeyMap.get(absoluteImportPath)
                                }
                            };
                            // ... and of the other referenced files.
                            referencedImportPaths.forEach((path)=>{
                                if (!cacheKeyMap.has(path)) {
                                    throw Error(`Unknown absolute import path ${path}`);
                                }
                                cacheEntry.cacheKeys[path] = cacheKeyMap.get(path);
                            });
                            // Save the cache entry.
                            this._cache.set(cacheKey, cacheEntry);
                            this._writeCacheAsync(cacheKey, cacheEntry);
                        }
                        return cacheEntry.compileResult;
                    }).call(this);
                if (this.compileOneFileLater && inputFile.supportsLazyCompilation) {
                    if (!this.isRoot(inputFile)) {
                        // If this inputFile is definitely not a root, then it must be
                        // lazy, and this is our last chance to mark it as such, so that
                        // the rest of the compiler plugin system can avoid worrying
                        // about the MultiFileCachingCompiler-specific concept of a
                        // "root." If this.isRoot(inputFile) returns true instead, that
                        // classification may not be trustworthy, since returning true
                        // used to be the only way to get the file to be compiled, so
                        // that it could be imported later by a JS module. Now that
                        // files can be compiled on-demand, it's safe to pass all files
                        // that might be roots to this.compileOneFileLater.
                        inputFile.getFileOptions().lazy = true;
                    }
                    yield this.compileOneFileLater(inputFile, getResult);
                } else if (this.isRoot(inputFile)) {
                    const result = yield getResult();
                    if (result) {
                        yield this.addCompileResult(inputFile, result);
                    }
                }
            }
            if (this._cacheDebugEnabled) {
                this._afterLinkCallbacks.push(()=>{
                    cacheMisses.sort();
                    this._cacheDebug(`Ran (#${++this._callCount}) on: ${JSON.stringify(cacheMisses)} ${JSON.stringify(Object.keys(arches).sort())}`);
                });
            }
        }).call(this);
    }
    // Returns a hash that incorporates both this.getCacheKey(inputFile) and
    // this.getAbsoluteImportPath(inputFile), since the file path might be
    // relevant to the compiled output when using MultiFileCachingCompiler.
    _getCacheKeyWithPath(inputFile) {
        return this._deepHash([
            this.getAbsoluteImportPath(inputFile),
            this.getCacheKey(inputFile)
        ]);
    }
    _cacheEntryValid(cacheEntry, cacheKeyMap) {
        return Object.keys(cacheEntry.cacheKeys).every((path)=>cacheEntry.cacheKeys[path] === cacheKeyMap.get(path));
    }
    // The format of a cache file on disk is the JSON-stringified cacheKeys
    // object, a newline, followed by the CompileResult as returned from
    // this.stringifyCompileResult.
    _cacheFilename(cacheKey) {
        return path.join(this._diskCache, cacheKey + ".cache");
    }
    // Loads a {compileResult, cacheKeys} cache entry from disk. Returns the whole
    // cache entry and loads it into the in-memory cache too.
    _readCache(cacheKey) {
        if (!this._diskCache) {
            return null;
        }
        const cacheFilename = this._cacheFilename(cacheKey);
        const raw = this._readFileOrNull(cacheFilename);
        if (!raw) {
            return null;
        }
        // Split on newline.
        const newlineIndex = raw.indexOf('\n');
        if (newlineIndex === -1) {
            return null;
        }
        const cacheKeysString = raw.substring(0, newlineIndex);
        const compileResultString = raw.substring(newlineIndex + 1);
        const cacheKeys = this._parseJSONOrNull(cacheKeysString);
        if (!cacheKeys) {
            return null;
        }
        const compileResult = this.parseCompileResult(compileResultString);
        if (!compileResult) {
            return null;
        }
        const cacheEntry = {
            compileResult,
            cacheKeys
        };
        this._cache.set(cacheKey, cacheEntry);
        return cacheEntry;
    }
    _writeCacheAsync(cacheKey, cacheEntry) {
        if (!this._diskCache) {
            return null;
        }
        const cacheFilename = this._cacheFilename(cacheKey);
        const cacheContents = JSON.stringify(cacheEntry.cacheKeys) + '\n' + this.stringifyCompileResult(cacheEntry.compileResult);
        this._writeFile(cacheFilename, cacheContents);
    }
    constructor({ compilerName, defaultCacheSize, maxParallelism }){
        super({
            compilerName,
            defaultCacheSize,
            maxParallelism
        });
        // Maps from cache key to { compileResult, cacheKeys }, where
        // cacheKeys is an object mapping from absolute import path to hashed
        // cacheKey for each file referenced by this file (including itself).
        this._cache = new LRUCache({
            max: this._cacheSize,
            // We ignore the size of cacheKeys here.
            length: (value)=>this.compileResultSize(value.compileResult)
        });
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      CachingCompiler: CachingCompiler,
      MultiFileCachingCompiler: MultiFileCachingCompiler
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/caching-compiler/caching-compiler.js",
    "/node_modules/meteor/caching-compiler/multi-file-caching-compiler.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/caching-compiler.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvY2FjaGluZy1jb21waWxlci9jYWNoaW5nLWNvbXBpbGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9jYWNoaW5nLWNvbXBpbGVyL211bHRpLWZpbGUtY2FjaGluZy1jb21waWxlci5qcyJdLCJuYW1lcyI6WyJmcyIsIlBsdWdpbiIsInBhdGgiLCJjcmVhdGVIYXNoIiwiTnBtIiwicmVxdWlyZSIsImFzc2VydCIsIkxSVUNhY2hlIiwiQ2FjaGluZ0NvbXBpbGVyQmFzZSIsImdldENhY2hlS2V5IiwiaW5wdXRGaWxlIiwiRXJyb3IiLCJhZGRDb21waWxlUmVzdWx0IiwiY29tcGlsZVJlc3VsdCIsImNvbXBpbGVSZXN1bHRTaXplIiwic3RyaW5naWZ5Q29tcGlsZVJlc3VsdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJzZUNvbXBpbGVSZXN1bHQiLCJzdHJpbmdpZmllZENvbXBpbGVSZXN1bHQiLCJfcGFyc2VKU09OT3JOdWxsIiwianNvbiIsInBhcnNlIiwiZSIsIlN5bnRheEVycm9yIiwiX2NhY2hlRGVidWciLCJtZXNzYWdlIiwiX2NhY2hlRGVidWdFbmFibGVkIiwiY29uc29sZSIsImxvZyIsIl9jb21waWxlck5hbWUiLCJzZXREaXNrQ2FjaGVEaXJlY3RvcnkiLCJkaXNrQ2FjaGUiLCJfZGlza0NhY2hlIiwic291cmNlTWFwU2l6ZSIsInNtIiwibWFwcGluZ3MiLCJsZW5ndGgiLCJzb3VyY2VzQ29udGVudCIsInJlZHVjZSIsInNvRmFyIiwiY3VycmVudCIsImFmdGVyTGluayIsImNhbGxiYWNrIiwiX2FmdGVyTGlua0NhbGxiYWNrcyIsInNwbGljZSIsIl9kZWVwSGFzaCIsInZhbCIsImhhc2giLCJ0eXBlIiwidXBkYXRlIiwia2V5cyIsIk9iamVjdCIsIkFycmF5IiwiaXNBcnJheSIsInNvcnQiLCJmb3JFYWNoIiwia2V5Iiwib2siLCJkaWdlc3QiLCJfd3JpdGVGaWxlIiwiZmlsZW5hbWUiLCJjb250ZW50cyIsInRlbXBGaWxlbmFtZSIsIlJhbmRvbSIsImlkIiwid3JpdGVGaWxlU3luYyIsInJlbmFtZVN5bmMiLCJfcmVhZEZpbGVPck51bGwiLCJyZWFkRmlsZVN5bmMiLCJjb2RlIiwiY29tcGlsZXJOYW1lIiwiZGVmYXVsdENhY2hlU2l6ZSIsIm1heFBhcmFsbGVsaXNtIiwiX21heFBhcmFsbGVsaXNtIiwiY29tcGlsZXJOYW1lRm9yRW52YXIiLCJ0b1VwcGVyQ2FzZSIsInJlcGxhY2UiLCJlbnZWYXJQcmVmaXgiLCJkZWJ1Z0VudlZhciIsInByb2Nlc3MiLCJlbnYiLCJjYWNoZVNpemVFbnZWYXIiLCJfY2FjaGVTaXplIiwiX2NhbGxDb3VudCIsIkNhY2hpbmdDb21waWxlciIsImNvbXBpbGVPbmVGaWxlIiwicHJvY2Vzc0ZpbGVzRm9yVGFyZ2V0IiwiaW5wdXRGaWxlcyIsImNhY2hlTWlzc2VzIiwiYXJjaGVzIiwiY3JlYXRlIiwiZ2V0QXJjaCIsImdldFJlc3VsdCIsImNhY2hlS2V5IiwiX2NhY2hlIiwiZ2V0IiwiX3JlYWRDYWNoZSIsImdldERpc3BsYXlQYXRoIiwicHVzaCIsInNldCIsIl93cml0ZUNhY2hlQXN5bmMiLCJjb21waWxlT25lRmlsZUxhdGVyIiwic3VwcG9ydHNMYXp5Q29tcGlsYXRpb24iLCJyZXN1bHQiLCJfY2FjaGVGaWxlbmFtZSIsInRlc3QiLCJqb2luIiwiY2FjaGVGaWxlbmFtZSIsIl9yZWFkQW5kUGFyc2VDb21waWxlUmVzdWx0T3JOdWxsIiwiY2FjaGVDb250ZW50cyIsInJhdyIsIm1heCIsInZhbHVlIiwiTXVsdGlGaWxlQ2FjaGluZ0NvbXBpbGVyIiwiYWxsRmlsZXMiLCJpc1Jvb3QiLCJnZXRBYnNvbHV0ZUltcG9ydFBhdGgiLCJnZXRQYWNrYWdlTmFtZSIsImdldFBhdGhJblBhY2thZ2UiLCJNYXAiLCJjYWNoZUtleU1hcCIsImltcG9ydFBhdGgiLCJfZ2V0Q2FjaGVLZXlXaXRoUGF0aCIsImFic29sdXRlSW1wb3J0UGF0aCIsImNhY2hlRW50cnkiLCJfY2FjaGVFbnRyeVZhbGlkIiwiY29tcGlsZU9uZUZpbGVSZXR1cm4iLCJyZWZlcmVuY2VkSW1wb3J0UGF0aHMiLCJjYWNoZUtleXMiLCJoYXMiLCJnZXRGaWxlT3B0aW9ucyIsImxhenkiLCJldmVyeSIsIm5ld2xpbmVJbmRleCIsImluZGV4T2YiLCJjYWNoZUtleXNTdHJpbmciLCJzdWJzdHJpbmciLCJjb21waWxlUmVzdWx0U3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BQU1BLEtBQUtDLE9BQU9ELEVBQUU7QUFDcEIsTUFBTUUsT0FBT0QsT0FBT0MsSUFBSTtBQUN4QixNQUFNQyxhQUFhQyxJQUFJQyxPQUFPLENBQUMsVUFBVUYsVUFBVTtBQUNuRCxNQUFNRyxTQUFTRixJQUFJQyxPQUFPLENBQUM7QUFDM0IsTUFBTUUsV0FBV0gsSUFBSUMsT0FBTyxDQUFDO0FBRTdCLCtEQUErRDtBQUMvREcsc0JBQXNCLE1BQU1BO0lBNEIxQiw2RUFBNkU7SUFDN0Usd0NBQXdDO0lBQ3hDLEVBQUU7SUFDRiw0RUFBNEU7SUFDNUUsMkVBQTJFO0lBQzNFLDRFQUE0RTtJQUM1RSw4RUFBOEU7SUFDOUUsbUVBQW1FO0lBQ25FLGdEQUFnRDtJQUNoRCxzRUFBc0U7SUFDdEUsMkNBQTJDO0lBQzNDLEVBQUU7SUFDRix5RUFBeUU7SUFDekUsNEVBQTRFO0lBQzVFLDhFQUE4RTtJQUM5RSwrQ0FBK0M7SUFDL0NDLFlBQVlDLFNBQVMsRUFBRTtRQUNyQixNQUFNQyxNQUFNO0lBQ2Q7SUFFQSx3RUFBd0U7SUFDeEUsK0NBQStDO0lBQy9DLEVBQUU7SUFDRiw2REFBNkQ7SUFDN0QsMEVBQTBFO0lBQzFFLDJFQUEyRTtJQUMzRSxxRUFBcUU7SUFDckUseUJBQXlCO0lBQ3pCQyxpQkFBaUJGLFNBQVMsRUFBRUcsYUFBYSxFQUFFO1FBQ3pDLE1BQU1GLE1BQU07SUFDZDtJQUVBLGtFQUFrRTtJQUNsRSwyRUFBMkU7SUFDM0UsZ0JB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LElBQUksQ0FBQ0ssa0JBQWtCLENBQUN3SDtRQUM5QyxJQUFJLENBQUU3SCxlQUFlO1lBQ25CLE9BQU87UUFDVDtRQUVBLE1BQU1nSCxhQUFhO1lBQUNoSDtZQUFlb0g7UUFBUztRQUM1QyxJQUFJLENBQUNsQyxNQUFNLENBQUNLLEdBQUcsQ0FBQ04sVUFBVStCO1FBQzFCLE9BQU9BO0lBQ1Q7SUFFQXhCLGlCQUFpQlAsUUFBUSxFQUFFK0IsVUFBVSxFQUFFO1FBQ3JDLElBQUksQ0FBRSxJQUFJLENBQUM1RixVQUFVLEVBQUU7WUFDckIsT0FBTztRQUNUO1FBQ0EsTUFBTTJFLGdCQUFnQixJQUFJLENBQUNILGNBQWMsQ0FBQ1g7UUFDMUMsTUFBTWdCLGdCQUNKOUYsS0FBS0MsU0FBUyxDQUFDNEcsV0FBV0ksU0FBUyxJQUFJLE9BQ3ZDLElBQUksQ0FBQ2xILHNCQUFzQixDQUFDOEcsV0FBV2hILGFBQWE7UUFDdEQsSUFBSSxDQUFDK0MsVUFBVSxDQUFDZ0QsZUFBZUU7SUFDakM7SUFqUEEsWUFBWSxFQUNWdkMsWUFBWSxFQUNaQyxnQkFBZ0IsRUFDaEJDLGNBQWMsRUFDZixDQUFFO1FBQ0QsS0FBSyxDQUFDO1lBQUNGO1lBQWNDO1lBQWtCQztRQUFjO1FBRXJELDZEQUE2RDtRQUM3RCxxRUFBcUU7UUFDckUscUVBQXFFO1FBQ3JFLElBQUksQ0FBQ3NCLE1BQU0sR0FBRyxJQUFJeEYsU0FBUztZQUN6QnlHLEtBQUssSUFBSSxDQUFDN0IsVUFBVTtZQUNwQix3Q0FBd0M7WUFDeEM5QyxRQUFRLENBQUM0RSxRQUFVLElBQUksQ0FBQ25HLGlCQUFpQixDQUFDbUcsTUFBTXBHLGFBQWE7UUFDL0Q7SUFDRjtBQW1PRiIsImZpbGUiOiIvcGFja2FnZXMvY2FjaGluZy1jb21waWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gUGx1Z2luLmZzO1xuY29uc3QgcGF0aCA9IFBsdWdpbi5wYXRoO1xuY29uc3QgY3JlYXRlSGFzaCA9IE5wbS5yZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoO1xuY29uc3QgYXNzZXJ0ID0gTnBtLnJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3QgTFJVQ2FjaGUgPSBOcG0ucmVxdWlyZSgnbHJ1LWNhY2hlJyk7XG5cbi8vIEJhc2UgY2xhc3MgZm9yIENhY2hpbmdDb21waWxlciBhbmQgTXVsdGlGaWxlQ2FjaGluZ0NvbXBpbGVyLlxuQ2FjaGluZ0NvbXBpbGVyQmFzZSA9IGNsYXNzIENhY2hpbmdDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgY29tcGlsZXJOYW1lLFxuICAgIGRlZmF1bHRDYWNoZVNpemUsXG4gICAgbWF4UGFyYWxsZWxpc20gPSAyMCxcbiAgfSkge1xuICAgIHRoaXMuX2NvbXBpbGVyTmFtZSA9IGNvbXBpbGVyTmFtZTtcbiAgICB0aGlzLl9tYXhQYXJhbGxlbGlzbSA9IG1heFBhcmFsbGVsaXNtO1xuICAgIGNvbnN0IGNvbXBpbGVyTmFtZUZvckVudmFyID0gY29tcGlsZXJOYW1lLnRvVXBwZXJDYXNlKClcbiAgICAgIC5yZXBsYWNlKCcvLS9nJywgJ18nKS5yZXBsYWNlKC9bXkEtWjAtOV9dL2csICcnKTtcbiAgICBjb25zdCBlbnZWYXJQcmVmaXggPSAnTUVURU9SXycgKyBjb21waWxlck5hbWVGb3JFbnZhciArICdfQ0FDSEVfJztcblxuICAgIGNvbnN0IGRlYnVnRW52VmFyID0gZW52VmFyUHJlZml4ICsgJ0RFQlVHJztcbiAgICB0aGlzLl9jYWNoZURlYnVnRW5hYmxlZCA9ICEhIHByb2Nlc3MuZW52W2RlYnVnRW52VmFyXTtcblxuICAgIGNvbnN0IGNhY2hlU2l6ZUVudlZhciA9IGVudlZhclByZWZpeCArICdTSVpFJztcbiAgICB0aGlzLl9jYWNoZVNpemUgPSArcHJvY2Vzcy5lbnZbY2FjaGVTaXplRW52VmFyXSB8fCBkZWZhdWx0Q2FjaGVTaXplO1xuXG4gICAgdGhpcy5fZGlza0NhY2hlID0gbnVsbDtcblxuICAgIC8vIEZvciB0ZXN0aW5nLlxuICAgIHRoaXMuX2NhbGxDb3VudCA9IDA7XG5cbiAgICAvLyBDYWxsYmFja3MgdGhhdCB3aWxsIGJlIGNhbGxlZCBhZnRlciB0aGUgbGlua2VyIGlzIGRvbmUgcHJvY2Vzc2luZ1xuICAgIC8vIGZpbGVzLCBhZnRlciBhbGwgbGF6eSBjb21waWxhdGlvbiBoYXMgZmluaXNoZWQuXG4gICAgdGhpcy5fYWZ0ZXJMaW5rQ2FsbGJhY2tzID0gW107XG4gIH1cblxuICAvLyBZb3VyIHN1YmNsYXNzIG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGVmaW5lIHRoZSBrZXkgdXNlZCB0byBpZGVudGlmeVxuICAvLyBhIHBhcnRpY3VsYXIgdmVyc2lvbiBvZiBhbiBJbnB1dEZpbGUuXG4gIC8vXG4gIC8vIEdpdmVuIGFuIElucHV0RmlsZSAodGhlIGRhdGEgdHlwZSBwYXNzZWQgdG8gcHJvY2Vzc0ZpbGVzRm9yVGFyZ2V0IGFzIHBhcnRcbiAgLy8gb2YgdGhlIFBsdWdpbi5yZWdpc3RlckNvbXBpbGVyIEFQSSksIHJldHVybnMgYSBjYWNoZSBrZXkgdGhhdCByZXByZXNlbnRzXG4gIC8vIGl0LiBUaGlzIGNhY2hlIGtleSBjYW4gYmUgYW55IEpTT04gdmFsdWUgKGl0IHdpbGwgYmUgY29udmVydGVkIGludGVybmFsbHlcbiAgLy8gaW50byBhIGhhc2gpLiAgVGhpcyBzaG91bGQgcmVmbGVjdCBhbnkgYXNwZWN0IG9mIHRoZSBJbnB1dEZpbGUgdGhhdCBhZmZlY3RzXG4gIC8vIHRoZSBvdXRwdXQgb2YgYGNvbXBpbGVPbmVGaWxlYC4gVHlwaWNhbGx5IHlvdSdsbCB3YW50IHRvIGluY2x1ZGVcbiAgLy8gYGlucHV0RmlsZS5nZXREZWNsYXJlZEV4cG9ydHMoKWAsIGFuZCBwZXJoYXBzXG4gIC8vIGBpbnB1dEZpbGUuZ2V0UGF0aEluUGFja2FnZSgpYCBvciBgaW5wdXRGaWxlLmdldERlY2xhcmVkRXhwb3J0c2AgaWZcbiAgLy8gYGNvbXBpbGVPbmVGaWxlYCBwYXlzIGF0dGVudGlvbiB0byB0aGVtLlxuICAvL1xuICAvLyBOb3RlIHRoYXQgZm9yIE11bHRpRmlsZUNhY2hpbmdDb21waWxlciwgeW91ciBjYWNoZSBrZXkgZG9lc24ndCBuZWVkIHRvXG4gIC8vIGluY2x1ZGUgdGhlIGZpbGUncyBwYXRoLCBiZWNhdXNlIHRoYXQgaXMgYXV0b21hdGljYWxseSB0YWtlbiBpbnRvIGFjY291bnRcbiAgLy8gYnkgdGhlIGltcGxlbWVudGF0aW9uLiBDYWNoaW5nQ29tcGlsZXIgc3ViY2xhc3NlcyBjYW4gY2hvb3NlIHdoZXRoZXIgb3Igbm90XG4gIC8vIHRvIGluY2x1ZGUgdGhlIGZpbGUncyBwYXRoIGluIHRoZSBjYWNoZSBrZXkuXG4gIGdldENhY2hlS2V5KGlucHV0RmlsZSkge1xuICAgIHRocm93IEVycm9yKCdDYWNoaW5nQ29tcGlsZXIgc3ViY2xhc3Mgc2hvdWxkIGltcGxlbWVudCBnZXRDYWNoZUtleSEnKTtcbiAgfVxuXG4gIC8vIFlvdXIgc3ViY2xhc3MgbXVzdCBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBkZWZpbmUgaG93IGEgQ29tcGlsZVJlc3VsdFxuICAvLyB0cmFuc2xhdGVzIGludG8gYWRkaW5nIGFzc2V0cyB0byB0aGUgYnVuZGxlLlxuICAvL1xuICAvLyBUaGlzIG1ldGhvZCBpcyBnaXZlbiBhbiBJbnB1dEZpbGUgKHRoZSBkYXRhIHR5cGUgcGFzc2VkIHRvXG4gIC8vIHByb2Nlc3NGaWxlc0ZvclRhcmdldCBhcyBwYXJ0IG9mIHRoZSBQbHVnaW4ucmVnaXN0ZXJDb21waWxlciBBUEkpIGFuZCBhXG4gIC8vIENvbXBpbGVSZXN1bHQgKGVpdGhlciByZXR1cm5lZCBkaXJlY3RseSBmcm9tIGNvbXBpbGVPbmVGaWxlIG9yIHJlYWQgZnJvbVxuICAvLyB0aGUgY2FjaGUpLiAgSXQgc2hvdWxkIGNhbGwgbWV0aG9kcyBsaWtlIGBpbnB1dEZpbGUuYWRkSmF2YVNjcmlwdGBcbiAgLy8gYW5kIGBpbnB1dEZpbGUuZXJyb3JgLlxuICBhZGRDb21waWxlUmVzdWx0KGlucHV0RmlsZSwgY29tcGlsZVJlc3VsdCkge1xuICAgIHRocm93IEVycm9yKCdDYWNoaW5nQ29tcGlsZXIgc3ViY2xhc3Mgc2hvdWxkIGltcGxlbWVudCBhZGRDb21waWxlUmVzdWx0IScpO1xuICB9XG5cbiAgLy8gWW91ciBzdWJjbGFzcyBtdXN0IG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGRlZmluZSB0aGUgc2l6ZSBvZiBhXG4gIC8vIENvbXBpbGVyUmVzdWx0ICh1c2VkIGJ5IHRoZSBpbi1tZW1vcnkgY2FjaGUgdG8gbGltaXQgdGhlIHRvdGFsIGFtb3VudCBvZlxuICAvLyBkYXRhIGNhY2hlZCkuXG4gIGNvbXBpbGVSZXN1bHRTaXplKGNvbXBpbGVSZXN1bHQpIHtcbiAgICB0aHJvdyBFcnJvcignQ2FjaGluZ0NvbXBpbGVyIHN1YmNsYXNzIHNob3VsZCBpbXBsZW1lbnQgY29tcGlsZVJlc3VsdFNpemUhJyk7XG4gIH1cblxuICAvLyBZb3VyIHN1YmNsYXNzIG1heSBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBkZWZpbmUgYW4gYWx0ZXJuYXRlIHdheSBvZlxuICAvLyBzdHJpbmdpZnlpbmcgQ29tcGlsZXJSZXN1bHRzLiAgVGFrZXMgYSBDb21waWxlUmVzdWx0IGFuZCByZXR1cm5zIGEgc3RyaW5nLlxuICBzdHJpbmdpZnlDb21waWxlUmVzdWx0KGNvbXBpbGVSZXN1bHQpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY29tcGlsZVJlc3VsdCk7XG4gIH1cbiAgLy8gWW91ciBzdWJjbGFzcyBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGVmaW5lIGFuIGFsdGVybmF0ZSB3YXkgb2ZcbiAgLy8gcGFyc2luZyBDb21waWxlclJlc3VsdHMgZnJvbSBzdHJpbmcuICBUYWtlcyBhIHN0cmluZyBhbmQgcmV0dXJucyBhXG4gIC8vIENvbXBpbGVSZXN1bHQuICBJZiB0aGUgc3RyaW5nIGRvZXNuJ3QgcmVwcmVzZW50IGEgdmFsaWQgQ29tcGlsZVJlc3VsdCwgeW91XG4gIC8vIG1heSB3YW50IHRvIHJldHVybiBudWxsIGluc3RlYWQgb2YgdGhyb3dpbmcsIHdoaWNoIHdpbGwgbWFrZVxuICAvLyBDYWNoaW5nQ29tcGlsZXIgaWdub3JlIHRoZSBjYWNoZS5cbiAgcGFyc2VDb21waWxlUmVzdWx0KHN0cmluZ2lmaWVkQ29tcGlsZVJlc3VsdCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJzZUpTT05Pck51bGwoc3RyaW5naWZpZWRDb21waWxlUmVzdWx0KTtcbiAgfVxuICBfcGFyc2VKU09OT3JOdWxsKGpzb24pIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBTeW50YXhFcnJvcilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZURlYnVnKG1lc3NhZ2UpIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlRGVidWdFbmFibGVkKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGBDQUNIRSgkeyB0aGlzLl9jb21waWxlck5hbWUgfSk6ICR7IG1lc3NhZ2UgfWApO1xuICB9XG5cbiAgc2V0RGlza0NhY2hlRGlyZWN0b3J5KGRpc2tDYWNoZSkge1xuICAgIGlmICh0aGlzLl9kaXNrQ2FjaGUpXG4gICAgICB0aHJvdyBFcnJvcignc2V0RGlza0NhY2hlRGlyZWN0b3J5IGNhbGxlZCB0d2ljZT8nKTtcbiAgICB0aGlzLl9kaXNrQ2FjaGUgPSBkaXNrQ2FjaGU7XG4gIH1cblxuICAvLyBTaW5jZSBzbyBtYW55IGNvbXBpbGVycyB3aWxsIG5lZWQgdG8gY2FsY3VsYXRlIHRoZSBzaXplIG9mIGEgU291cmNlTWFwIGluXG4gIC8vIHRoZWlyIGNvbXBpbGVSZXN1bHRTaXplLCB0aGlzIG1ldGhvZCBpcyBwcm92aWRlZC5cbiAgc291cmNlTWFwU2l6ZShzbSkge1xuICAgIGlmICghIHNtKSByZXR1cm4gMDtcbiAgICAvLyBzdW0gdGhlIGxlbmd0aCBvZiBzb3VyY2VzIGFuZCB0aGUgbWFwcGluZ3MsIHRoZSBzaXplIG9mXG4gICAgLy8gbWV0YWRhdGEgaXMgaWdub3JlZCwgYnV0IGl0IGlzIG5vdCBhIGJpZyBkZWFsXG4gICAgcmV0dXJuIHNtLm1hcHBpbmdzLmxlbmd0aFxuICAgICAgKyAoc20uc291cmNlc0NvbnRlbnQgfHwgW10pLnJlZHVjZShmdW5jdGlvbiAoc29GYXIsIGN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHNvRmFyICsgKGN1cnJlbnQgPyBjdXJyZW50Lmxlbmd0aCA6IDApO1xuICAgICAgfSwgMCk7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgdGhlIGNvbXBpbGVyIHBsdWdpbnMgc3lzdGVtIGFmdGVyIGFsbCBsaW5raW5nIGFuZCBsYXp5XG4gIC8vIGNvbXBpbGF0aW9uIGhhcyBmaW5pc2hlZC5cbiAgYXN5bmMgYWZ0ZXJMaW5rKCkge1xuICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgdGhpcy5fYWZ0ZXJMaW5rQ2FsbGJhY2tzLnNwbGljZSgwKSkge1xuICAgICAgYXdhaXQgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICAvLyBCb3Jyb3dlZCBmcm9tIGFub3RoZXIgTUlULWxpY2Vuc2VkIHByb2plY3QgdGhhdCBiZW5qYW1uIHdyb3RlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmVhY3Rqcy9jb21tb25lci9ibG9iLzIzNWQ1NGExMmMvbGliL3V0aWwuanMjTDEzNi1MMTY4XG4gIF9kZWVwSGFzaCh2YWwpIHtcbiAgICBjb25zdCBoYXNoID0gY3JlYXRlSGFzaCgnc2hhMScpO1xuICAgIGxldCB0eXBlID0gdHlwZW9mIHZhbDtcblxuICAgIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICAgIHR5cGUgPSAnbnVsbCc7XG4gICAgfVxuICAgIGhhc2gudXBkYXRlKHR5cGUgKyAnXFwwJyk7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZhbCk7XG5cbiAgICAgIC8vIEFycmF5IGtleXMgd2lsbCBhbHJlYWR5IGJlIHNvcnRlZC5cbiAgICAgIGlmICghIEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXlzLnNvcnQoKTtcbiAgICAgIH1cblxuICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWxba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIFNpbGVudGx5IGlnbm9yZSBuZXN0ZWQgbWV0aG9kcywgYnV0IG5ldmVydGhlbGVzcyBjb21wbGFpbiBiZWxvd1xuICAgICAgICAgIC8vIGlmIHRoZSByb290IHZhbHVlIGlzIGEgZnVuY3Rpb24uXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzaC51cGRhdGUoa2V5ICsgJ1xcMCcpLnVwZGF0ZSh0aGlzLl9kZWVwSGFzaCh2YWxba2V5XSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgYXNzZXJ0Lm9rKGZhbHNlLCAnY2Fubm90IGhhc2ggZnVuY3Rpb24gb2JqZWN0cycpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaGFzaC51cGRhdGUoJycgKyB2YWwpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc2guZGlnZXN0KCdoZXgnKTtcbiAgfVxuXG4gIC8vIFdyaXRlIHRoZSBmaWxlIGF0b21pY2FsbHkuXG4gIF93cml0ZUZpbGUoZmlsZW5hbWUsIGNvbnRlbnRzKSB7XG4gICAgY29uc3QgdGVtcEZpbGVuYW1lID0gZmlsZW5hbWUgKyAnLnRtcC4nICsgUmFuZG9tLmlkKCk7XG5cbiAgICB0cnkge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wRmlsZW5hbWUsIGNvbnRlbnRzKTtcbiAgICAgIGZzLnJlbmFtZVN5bmModGVtcEZpbGVuYW1lLCBmaWxlbmFtZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gaWdub3JlIGVycm9ycywgaXQncyBqdXN0IGEgY2FjaGVcbiAgICAgIHRoaXMuX2NhY2hlRGVidWcoZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uLiBSZXR1cm5zIHRoZSBib2R5IG9mIHRoZSBmaWxlIGFzIGEgc3RyaW5nLCBvciBudWxsIGlmIGl0XG4gIC8vIGRvZXNuJ3QgZXhpc3QuXG4gIF9yZWFkRmlsZU9yTnVsbChmaWxlbmFtZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlICYmIGUuY29kZSA9PT0gJ0VOT0VOVCcpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQ2FjaGluZ0NvbXBpbGVyIGlzIGEgY2xhc3MgZGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIFBsdWdpbi5yZWdpc3RlckNvbXBpbGVyXG4vLyB3aGljaCBpbXBsZW1lbnRzIGluLW1lbW9yeSBhbmQgb24tZGlzayBjYWNoZXMgZm9yIHRoZSBmaWxlcyB0aGF0IGl0XG4vLyBwcm9jZXNzZXMuICBZb3Ugc2hvdWxkIHN1YmNsYXNzIENhY2hpbmdDb21waWxlciBhbmQgZGVmaW5lIHRoZSBmb2xsb3dpbmdcbi8vIG1ldGhvZHM6IGdldENhY2hlS2V5LCBjb21waWxlT25lRmlsZSwgYWRkQ29tcGlsZVJlc3VsdCwgYW5kXG4vLyBjb21waWxlUmVzdWx0U2l6ZS5cbi8vXG4vLyBDYWNoaW5nQ29tcGlsZXIgYXNzdW1lcyB0aGF0IGZpbGVzIGFyZSBwcm9jZXNzZWQgaW5kZXBlbmRlbnRseSBvZiBlYWNoIG90aGVyO1xuLy8gdGhlcmUgaXMgbm8gJ2ltcG9ydCcgZGlyZWN0aXZlIGFsbG93aW5nIG9uZSBmaWxlIHRvIHJlZmVyZW5jZSBhbm90aGVyLiAgVGhhdFxuLy8gaXMsIGVkaXRpbmcgb25lIGZpbGUgc2hvdWxkIG9ubHkgcmVxdWlyZSB0aGF0IGZpbGUgdG8gYmUgcmVidWlsdCwgbm90IG90aGVyXG4vLyBmaWxlcy5cbi8vXG4vLyBUaGUgZGF0YSB0aGF0IGlzIGNhY2hlZCBmb3IgZWFjaCBmaWxlIGlzIG9mIGEgdHlwZSB0aGF0IGlzIChpbXBsaWNpdGx5KVxuLy8gZGVmaW5lZCBieSB5b3VyIHN1YmNsYXNzLiBDYWNoaW5nQ29tcGlsZXIgcmVmZXJzIHRvIHRoaXMgdHlwZSBhc1xuLy8gYENvbXBpbGVSZXN1bHRgLCBidXQgdGhpcyBpc24ndCBhIHNpbmdsZSB0eXBlOiBpdCdzIHVwIHRvIHlvdXIgc3ViY2xhc3MgdG9cbi8vIGRlY2lkZSB3aGF0IHR5cGUgb2YgZGF0YSB0aGlzIGlzLiAgWW91IHNob3VsZCBkb2N1bWVudCB3aGF0IHlvdXIgc3ViY2xhc3Mnc1xuLy8gQ29tcGlsZVJlc3VsdCB0eXBlIGlzLlxuLy9cbi8vIFlvdXIgc3ViY2xhc3MncyBjb21waWxlciBzaG91bGQgY2FsbCB0aGUgc3VwZXJjbGFzcyBjb21waWxlciBzcGVjaWZ5aW5nIHRoZVxuLy8gY29tcGlsZXIgbmFtZSAodXNlZCB0byBnZW5lcmF0ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZm9yIGRlYnVnZ2luZyBhbmRcbi8vIHR3ZWFraW5nIGluLW1lbW9yeSBjYWNoZSBzaXplKSBhbmQgdGhlIGRlZmF1bHQgY2FjaGUgc2l6ZS5cbi8vXG4vLyBCeSBkZWZhdWx0LCBDYWNoaW5nQ29tcGlsZXIgcHJvY2Vzc2VzIGVhY2ggZmlsZSBpbiBcInBhcmFsbGVsXCIuIFRoYXQgaXMsIGlmIGl0XG4vLyBuZWVkcyB0byB5aWVsZCB0byByZWFkIGZyb20gdGhlIGRpc2sgY2FjaGUsIG9yIGlmIGdldENhY2hlS2V5LFxuLy8gY29tcGlsZU9uZUZpbGUsIG9yIGFkZENvbXBpbGVSZXN1bHQgeWllbGRzLCBpdCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgdGhlIG5leHRcbi8vIGZldyBmaWxlcy4gVG8gc2V0IGhvdyBtYW55IGZpbGVzIGNhbiBiZSBwcm9jZXNzZWQgaW4gcGFyYWxsZWwgKGluY2x1ZGluZ1xuLy8gc2V0dGluZyBpdCB0byAxIGlmIHlvdXIgc3ViY2xhc3MgZG9lc24ndCBzdXBwb3J0IGFueSBwYXJhbGxlbGlzbSksIHBhc3MgdGhlXG4vLyBtYXhQYXJhbGxlbGlzbSBvcHRpb24gdG8gdGhlIHN1cGVyY2xhc3MgY29uc3RydWN0b3IuXG4vL1xuLy8gRm9yIGV4YW1wbGUgKHVzaW5nIEVTMjAxNSB2aWEgdGhlIGVjbWFzY3JpcHQgcGFja2FnZSk6XG4vL1xuLy8gICBjbGFzcyBBd2Vzb21lQ29tcGlsZXIgZXh0ZW5kcyBDYWNoaW5nQ29tcGlsZXIge1xuLy8gICAgIGNvbnN0cnVjdG9yKCkge1xuLy8gICAgICAgc3VwZXIoe1xuLy8gICAgICAgICBjb21waWxlck5hbWU6ICdhd2Vzb21lJyxcbi8vICAgICAgICAgZGVmYXVsdENhY2hlU2l6ZTogMTAyNCoxMDI0KjEwLFxuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICAgIC8vIC4uLiBkZWZpbmUgdGhlIG90aGVyIG1ldGhvZHNcbi8vICAgfVxuLy8gICBQbHVnaW4ucmVnaXN0ZXJDb21waWxlKHtcbi8vICAgICBleHRlbnNpb25zOiBbJ2F3ZXNvbWUnXSxcbi8vICAgfSwgKCkgPT4gbmV3IEF3ZXNvbWVDb21waWxlcigpKTtcbi8vXG4vLyBYWFggbWF5YmUgY29tcGlsZVJlc3VsdFNpemUgYW5kIHN0cmluZ2lmeUNvbXBpbGVSZXN1bHQgc2hvdWxkIGp1c3QgYmUgbWV0aG9kc1xuLy8gb24gQ29tcGlsZVJlc3VsdD8gU29ydCBvZiBoYXJkIHRvIGRvIHRoYXQgd2l0aCBwYXJzZUNvbXBpbGVSZXN1bHQuXG5DYWNoaW5nQ29tcGlsZXIgPSBjbGFzcyBDYWNoaW5nQ29tcGlsZXIgZXh0ZW5kcyBDYWNoaW5nQ29tcGlsZXJCYXNlIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGNvbXBpbGVyTmFtZSxcbiAgICBkZWZhdWx0Q2FjaGVTaXplLFxuICAgIG1heFBhcmFsbGVsaXNtID0gMjAsXG4gIH0pIHtcbiAgICBzdXBlcih7Y29tcGlsZXJOYW1lLCBkZWZhdWx0Q2FjaGVTaXplLCBtYXhQYXJhbGxlbGlzbX0pO1xuXG4gICAgLy8gTWFwcyBmcm9tIGEgaGFzaGVkIGNhY2hlIGtleSB0byBhIGNvbXBpbGVSZXN1bHQuXG4gICAgdGhpcy5fY2FjaGUgPSBuZXcgTFJVQ2FjaGUoe1xuICAgICAgbWF4OiB0aGlzLl9jYWNoZVNpemUsXG4gICAgICBsZW5ndGg6ICh2YWx1ZSkgPT4gdGhpcy5jb21waWxlUmVzdWx0U2l6ZSh2YWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICAvLyBZb3VyIHN1YmNsYXNzIG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGVmaW5lIHRoZSB0cmFuc2Zvcm1hdGlvbiBmcm9tXG4gIC8vIElucHV0RmlsZSB0byBpdHMgY2FjaGVhYmxlIENvbXBpbGVSZXN1bHQpLlxuICAvL1xuICAvLyBHaXZlbiBhbiBJbnB1dEZpbGUgKHRoZSBkYXRhIHR5cGUgcGFzc2VkIHRvIHByb2Nlc3NGaWxlc0ZvclRhcmdldCBhcyBwYXJ0XG4gIC8vIG9mIHRoZSBQbHVnaW4ucmVnaXN0ZXJDb21waWxlciBBUEkpLCBjb21waWxlcyB0aGUgZmlsZSBhbmQgcmV0dXJucyBhXG4gIC8vIENvbXBpbGVSZXN1bHQgKHRoZSBjYWNoZWFibGUgZGF0YSB0eXBlIHNwZWNpZmljIHRvIHlvdXIgc3ViY2xhc3MpLlxuICAvL1xuICAvLyBUaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIG9uIGZpbGVzIHdoZW4gYSB2YWxpZCBjYWNoZSBlbnRyeSBleGlzdHMgaW5cbiAgLy8gbWVtb3J5IG9yIG9uIGRpc2suXG4gIC8vXG4gIC8vIE9uIGEgY29tcGlsZSBlcnJvciwgeW91IHNob3VsZCBjYWxsIGBpbnB1dEZpbGUuZXJyb3JgIGFwcHJvcHJpYXRlbHkgYW5kXG4gIC8vIHJldHVybiBudWxsOyB0aGlzIHdpbGwgbm90IGJlIGNhY2hlZC5cbiAgLy9cbiAgLy8gVGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBjYWxsIGBpbnB1dEZpbGUuYWRkSmF2YVNjcmlwdGAgYW5kIHNpbWlsYXIgZmlsZXMhXG4gIC8vIFRoYXQncyB3aGF0IGFkZENvbXBpbGVSZXN1bHQgaXMgZm9yLlxuICBjb21waWxlT25lRmlsZShpbnB1dEZpbGUpIHtcbiAgICB0aHJvdyBFcnJvcignQ2FjaGluZ0NvbXBpbGVyIHN1YmNsYXNzIHNob3VsZCBpbXBsZW1lbnQgY29tcGlsZU9uZUZpbGUhJyk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2Vzc0ZpbGVzRm9yVGFyZ2V0IG1ldGhvZCBmcm9tIHRoZSBQbHVnaW4ucmVnaXN0ZXJDb21waWxlciBBUEkuIElmXG4gIC8vIHlvdSBoYXZlIHByb2Nlc3NpbmcgeW91IHdhbnQgdG8gcGVyZm9ybSBhdCB0aGUgYmVnaW5uaW5nIG9yIGVuZCBvZiBhXG4gIC8vIHByb2Nlc3NpbmcgcGhhc2UsIHlvdSBtYXkgd2FudCB0byBvdmVycmlkZSB0aGlzIG1ldGhvZCBhbmQgY2FsbCB0aGVcbiAgLy8gc3VwZXJjbGFzcyBpbXBsZW1lbnRhdGlvbiBmcm9tIHdpdGhpbiB5b3VyIG1ldGhvZC5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGVzRm9yVGFyZ2V0KGlucHV0RmlsZXMpIHtcbiAgICBjb25zdCBjYWNoZU1pc3NlcyA9IFtdO1xuICAgIGNvbnN0IGFyY2hlcyA9IHRoaXMuX2NhY2hlRGVidWdFbmFibGVkICYmIE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBmb3IgKGNvbnN0IGlucHV0RmlsZSBvZiBpbnB1dEZpbGVzKSB7XG4gICAgICBpZiAoYXJjaGVzKSB7XG4gICAgICAgIGFyY2hlc1tpbnB1dEZpbGUuZ2V0QXJjaCgpXSA9IDE7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdldFJlc3VsdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSB0aGlzLl9kZWVwSGFzaCh0aGlzLmdldENhY2hlS2V5KGlucHV0RmlsZSkpO1xuICAgICAgICBsZXQgY29tcGlsZVJlc3VsdCA9IHRoaXMuX2NhY2hlLmdldChjYWNoZUtleSk7XG5cbiAgICAgICAgaWYgKCEgY29tcGlsZVJlc3VsdCkge1xuICAgICAgICAgIGNvbXBpbGVSZXN1bHQgPSB0aGlzLl9yZWFkQ2FjaGUoY2FjaGVLZXkpO1xuICAgICAgICAgIGlmIChjb21waWxlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZURlYnVnKGBMb2FkZWQgJHsgaW5wdXRGaWxlLmdldERpc3BsYXlQYXRoKCkgfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghIGNvbXBpbGVSZXN1bHQpIHtcbiAgICAgICAgICBjYWNoZU1pc3Nlcy5wdXNoKGlucHV0RmlsZS5nZXREaXNwbGF5UGF0aCgpKTtcbiAgICAgICAgICBjb21waWxlUmVzdWx0ID0gYXdhaXQgdGhpcy5jb21waWxlT25lRmlsZShpbnB1dEZpbGUpO1xuXG4gICAgICAgICAgaWYgKCEgY29tcGlsZVJlc3VsdCkge1xuICAgICAgICAgICAgLy8gY29tcGlsZU9uZUZpbGUgc2hvdWxkIGhhdmUgY2FsbGVkIGlucHV0RmlsZS5lcnJvci5cbiAgICAgICAgICAgIC8vICBXZSBkb24ndCBjYWNoZSBmYWlsdXJlcyBmb3Igbm93LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNhdmUgd2hhdCB3ZSd2ZSBjb21waWxlZC5cbiAgICAgICAgICB0aGlzLl9jYWNoZS5zZXQoY2FjaGVLZXksIGNvbXBpbGVSZXN1bHQpO1xuICAgICAgICAgIHRoaXMuX3dyaXRlQ2FjaGVBc3luYyhjYWNoZUtleSwgY29tcGlsZVJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcGlsZVJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmNvbXBpbGVPbmVGaWxlTGF0ZXIgJiZcbiAgICAgICAgICBpbnB1dEZpbGUuc3VwcG9ydHNMYXp5Q29tcGlsYXRpb24pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jb21waWxlT25lRmlsZUxhdGVyKGlucHV0RmlsZSwgZ2V0UmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldFJlc3VsdCgpO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hZGRDb21waWxlUmVzdWx0KGlucHV0RmlsZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9jYWNoZURlYnVnRW5hYmxlZCkge1xuICAgICAgdGhpcy5fYWZ0ZXJMaW5rQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuICAgICAgICBjYWNoZU1pc3Nlcy5zb3J0KCk7XG5cbiAgICAgICAgdGhpcy5fY2FjaGVEZWJ1ZyhcbiAgICAgICAgICBgUmFuICgjJHtcbiAgICAgICAgICAgICsrdGhpcy5fY2FsbENvdW50XG4gICAgICAgICAgfSkgb246ICR7XG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShjYWNoZU1pc3NlcylcbiAgICAgICAgICB9ICR7XG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhhcmNoZXMpLnNvcnQoKSlcbiAgICAgICAgICB9YFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NhY2hlRmlsZW5hbWUoY2FjaGVLZXkpIHtcbiAgICAvLyBXZSB3YW50IGNhY2hlS2V5cyB0byBiZSBoZXggc28gdGhhdCB0aGV5IHdvcmsgb24gYW55IEZTIGFuZCBuZXZlciBlbmQgaW5cbiAgICAvLyAuY2FjaGUuXG4gICAgaWYgKCEvXlthLWYwLTldKyQvLnRlc3QoY2FjaGVLZXkpKSB7XG4gICAgICB0aHJvdyBFcnJvcignYmFkIGNhY2hlS2V5OiAnICsgY2FjaGVLZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX2Rpc2tDYWNoZSwgY2FjaGVLZXkgKyAnLmNhY2hlJyk7XG4gIH1cbiAgLy8gTG9hZCBhIGNhY2hlIGVudHJ5IGZyb20gZGlzay4gUmV0dXJucyB0aGUgY29tcGlsZVJlc3VsdCBvYmplY3RcbiAgLy8gYW5kIGxvYWRzIGl0IGludG8gdGhlIGluLW1lbW9yeSBjYWNoZSB0b28uXG4gIF9yZWFkQ2FjaGUoY2FjaGVLZXkpIHtcbiAgICBpZiAoISB0aGlzLl9kaXNrQ2FjaGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZUZpbGVuYW1lID0gdGhpcy5fY2FjaGVGaWxlbmFtZShjYWNoZUtleSk7XG4gICAgY29uc3QgY29tcGlsZVJlc3VsdCA9IHRoaXMuX3JlYWRBbmRQYXJzZUNvbXBpbGVSZXN1bHRPck51bGwoY2FjaGVGaWxlbmFtZSk7XG4gICAgaWYgKCEgY29tcGlsZVJlc3VsdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2NhY2hlLnNldChjYWNoZUtleSwgY29tcGlsZVJlc3VsdCk7XG4gICAgcmV0dXJuIGNvbXBpbGVSZXN1bHQ7XG4gIH1cbiAgX3dyaXRlQ2FjaGVBc3luYyhjYWNoZUtleSwgY29tcGlsZVJlc3VsdCkge1xuICAgIGlmICghIHRoaXMuX2Rpc2tDYWNoZSlcbiAgICAgIHJldHVybjtcbiAgICBjb25zdCBjYWNoZUZpbGVuYW1lID0gdGhpcy5fY2FjaGVGaWxlbmFtZShjYWNoZUtleSk7XG4gICAgY29uc3QgY2FjaGVDb250ZW50cyA9IHRoaXMuc3RyaW5naWZ5Q29tcGlsZVJlc3VsdChjb21waWxlUmVzdWx0KTtcbiAgICB0aGlzLl93cml0ZUZpbGUoY2FjaGVGaWxlbmFtZSwgY2FjaGVDb250ZW50cyk7XG4gIH1cblxuICAvLyBSZXR1cm5zIG51bGwgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3Qgb3IgY2FuJ3QgYmUgcGFyc2VkOyBvdGhlcndpc2VcbiAgLy8gcmV0dXJucyB0aGUgcGFyc2VkIGNvbXBpbGVSZXN1bHQgaW4gdGhlIGZpbGUuXG4gIF9yZWFkQW5kUGFyc2VDb21waWxlUmVzdWx0T3JOdWxsKGZpbGVuYW1lKSB7XG4gICAgY29uc3QgcmF3ID0gdGhpcy5fcmVhZEZpbGVPck51bGwoZmlsZW5hbWUpO1xuICAgIHJldHVybiB0aGlzLnBhcnNlQ29tcGlsZVJlc3VsdChyYXcpO1xuICB9XG59XG4iLCJjb25zdCBwYXRoID0gUGx1Z2luLnBhdGg7XG5jb25zdCBMUlVDYWNoZSA9IE5wbS5yZXF1aXJlKCdscnUtY2FjaGUnKTtcblxuLy8gTXVsdGlGaWxlQ2FjaGluZ0NvbXBpbGVyIGlzIGxpa2UgQ2FjaGluZ0NvbXBpbGVyLCBidXQgZm9yIGltcGxlbWVudGluZ1xuLy8gbGFuZ3VhZ2VzIHdoaWNoIGFsbG93IGZpbGVzIHRvIHJlZmVyZW5jZSBlYWNoIG90aGVyLCBzdWNoIGFzIENTU1xuLy8gcHJlcHJvY2Vzc29ycyB3aXRoIGBAaW1wb3J0YCBkaXJlY3RpdmVzLlxuLy9cbi8vIExpa2UgQ2FjaGluZ0NvbXBpbGVyLCB5b3Ugc2hvdWxkIHN1YmNsYXNzIE11bHRpRmlsZUNhY2hpbmdDb21waWxlciBhbmQgZGVmaW5lXG4vLyB0aGUgZm9sbG93aW5nIG1ldGhvZHM6IGdldENhY2hlS2V5LCBjb21waWxlT25lRmlsZSwgYWRkQ29tcGlsZVJlc3VsdCwgYW5kXG4vLyBjb21waWxlUmVzdWx0U2l6ZS4gIGNvbXBpbGVPbmVGaWxlIGdldHMgYW4gYWRkaXRpb25hbCBhbGxGaWxlcyBhcmd1bWVudCBhbmRcbi8vIHJldHVybnMgYW4gYXJyYXkgb2YgcmVmZXJlbmNlZCBpbXBvcnQgcGF0aHMgaW4gYWRkaXRpb24gdG8gdGhlIENvbXBpbGVSZXN1bHQuXG4vLyBZb3UgbWF5IGFsc28gb3ZlcnJpZGUgaXNSb290IGFuZCBnZXRBYnNvbHV0ZUltcG9ydFBhdGggdG8gY3VzdG9taXplXG4vLyBNdWx0aUZpbGVDYWNoaW5nQ29tcGlsZXIgZnVydGhlci5cbk11bHRpRmlsZUNhY2hpbmdDb21waWxlciA9IGNsYXNzIE11bHRpRmlsZUNhY2hpbmdDb21waWxlclxuZXh0ZW5kcyBDYWNoaW5nQ29tcGlsZXJCYXNlIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGNvbXBpbGVyTmFtZSxcbiAgICBkZWZhdWx0Q2FjaGVTaXplLFxuICAgIG1heFBhcmFsbGVsaXNtXG4gIH0pIHtcbiAgICBzdXBlcih7Y29tcGlsZXJOYW1lLCBkZWZhdWx0Q2FjaGVTaXplLCBtYXhQYXJhbGxlbGlzbX0pO1xuXG4gICAgLy8gTWFwcyBmcm9tIGNhY2hlIGtleSB0byB7IGNvbXBpbGVSZXN1bHQsIGNhY2hlS2V5cyB9LCB3aGVyZVxuICAgIC8vIGNhY2hlS2V5cyBpcyBhbiBvYmplY3QgbWFwcGluZyBmcm9tIGFic29sdXRlIGltcG9ydCBwYXRoIHRvIGhhc2hlZFxuICAgIC8vIGNhY2hlS2V5IGZvciBlYWNoIGZpbGUgcmVmZXJlbmNlZCBieSB0aGlzIGZpbGUgKGluY2x1ZGluZyBpdHNlbGYpLlxuICAgIHRoaXMuX2NhY2hlID0gbmV3IExSVUNhY2hlKHtcbiAgICAgIG1heDogdGhpcy5fY2FjaGVTaXplLFxuICAgICAgLy8gV2UgaWdub3JlIHRoZSBzaXplIG9mIGNhY2hlS2V5cyBoZXJlLlxuICAgICAgbGVuZ3RoOiAodmFsdWUpID0+IHRoaXMuY29tcGlsZVJlc3VsdFNpemUodmFsdWUuY29tcGlsZVJlc3VsdCksXG4gICAgfSk7XG4gIH1cblxuICAvLyBZb3VyIHN1YmNsYXNzIG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGVmaW5lIHRoZSB0cmFuc2Zvcm1hdGlvbiBmcm9tXG4gIC8vIElucHV0RmlsZSB0byBpdHMgY2FjaGVhYmxlIENvbXBpbGVSZXN1bHQpLlxuICAvL1xuICAvLyBBcmd1bWVudHM6XG4gIC8vICAgLSBpbnB1dEZpbGUgaXMgdGhlIElucHV0RmlsZSB0byBwcm9jZXNzXG4gIC8vICAgLSBhbGxGaWxlcyBpcyBhIGEgTWFwIG1hcHBpbmcgZnJvbSBhYnNvbHV0ZSBpbXBvcnQgcGF0aCB0byBJbnB1dEZpbGUgb2ZcbiAgLy8gICAgIGFsbCBmaWxlcyBiZWluZyBwcm9jZXNzZWQgaW4gdGhlIHRhcmdldFxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXM6XG4gIC8vICAgLSBjb21waWxlUmVzdWx0OiB0aGUgQ29tcGlsZVJlc3VsdCAodGhlIGNhY2hlYWJsZSBkYXRhIHR5cGUgc3BlY2lmaWMgdG9cbiAgLy8gICAgIHlvdXIgc3ViY2xhc3MpLlxuICAvLyAgIC0gcmVmZXJlbmNlZEltcG9ydFBhdGhzOiBhbiBhcnJheSBvZiBhYnNvbHV0ZSBpbXBvcnQgcGF0aHMgb2YgZmlsZXNcbiAgLy8gICAgIHdoaWNoIHdlcmUgcmVmZXJlcmVuY2VkIGJ5IHRoZSBjdXJyZW50IGZpbGUuICBUaGUgY3VycmVudCBmaWxlXG4gIC8vICAgICBpcyBpbmNsdWRlZCBpbXBsaWNpdGx5LlxuICAvL1xuICAvLyBUaGlzIG1ldGhvZCBpcyBub3QgY2FsbGVkIG9uIGZpbGVzIHdoZW4gYSB2YWxpZCBjYWNoZSBlbnRyeSBleGlzdHMgaW5cbiAgLy8gbWVtb3J5IG9yIG9uIGRpc2suXG4gIC8vXG4gIC8vIE9uIGEgY29tcGlsZSBlcnJvciwgeW91IHNob3VsZCBjYWxsIGBpbnB1dEZpbGUuZXJyb3JgIGFwcHJvcHJpYXRlbHkgYW5kXG4gIC8vIHJldHVybiBudWxsOyB0aGlzIHdpbGwgbm90IGJlIGNhY2hlZC5cbiAgLy9cbiAgLy8gVGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBjYWxsIGBpbnB1dEZpbGUuYWRkSmF2YVNjcmlwdGAgYW5kIHNpbWlsYXIgZmlsZXMhXG4gIC8vIFRoYXQncyB3aGF0IGFkZENvbXBpbGVSZXN1bHQgaXMgZm9yLlxuICBjb21waWxlT25lRmlsZShpbnB1dEZpbGUsIGFsbEZpbGVzKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAnTXVsdGlGaWxlQ2FjaGluZ0NvbXBpbGVyIHN1YmNsYXNzIHNob3VsZCBpbXBsZW1lbnQgY29tcGlsZU9uZUZpbGUhJyk7XG4gIH1cblxuICAvLyBZb3VyIHN1YmNsYXNzIG1heSBvdmVycmlkZSB0aGlzIHRvIGRlY2xhcmUgdGhhdCBhIGZpbGUgaXMgbm90IGEgXCJyb290XCIgLS0tXG4gIC8vIGllLCBpdCBjYW4gYmUgaW5jbHVkZWQgZnJvbSBvdGhlciBmaWxlcyBidXQgaXMgbm90IHByb2Nlc3NlZCBvbiBpdHMgb3duLiBJblxuICAvLyB0aGlzIGNhc2UsIE11bHRpRmlsZUNhY2hpbmdDb21waWxlciB3b24ndCB3YXN0ZSB0aW1lIHRyeWluZyB0byBsb29rIGZvciBhXG4gIC8vIGNhY2hlIGZvciBpdHMgY29tcGlsYXRpb24gb24gZGlzay5cbiAgaXNSb290KGlucHV0RmlsZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgYWJzb2x1dGUgaW1wb3J0IHBhdGggZm9yIGFuIElucHV0RmlsZS4gQnkgZGVmYXVsdCwgdGhpcyBpcyBhXG4gIC8vIHBhdGggaXMgYSBwYXRoIG9mIHRoZSBmb3JtIFwie3BhY2thZ2V9L3BhdGgvdG8vZmlsZVwiIGZvciBmaWxlcyBpbiBwYWNrYWdlc1xuICAvLyBhbmQgXCJ7fS9wYXRoL3RvL2ZpbGVcIiBmb3IgZmlsZXMgaW4gYXBwcy4gWW91ciBzdWJjbGFzcyBtYXkgb3ZlcnJpZGUgYW5kL29yXG4gIC8vIGNhbGwgdGhpcyBtZXRob2QuXG4gIGdldEFic29sdXRlSW1wb3J0UGF0aChpbnB1dEZpbGUpIHtcbiAgICBpZiAoaW5wdXRGaWxlLmdldFBhY2thZ2VOYW1lKCkgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiAne30vJyArIGlucHV0RmlsZS5nZXRQYXRoSW5QYWNrYWdlKCk7XG4gICAgfVxuICAgIHJldHVybiAneycgKyBpbnB1dEZpbGUuZ2V0UGFja2FnZU5hbWUoKSArICd9LydcbiAgICAgICsgaW5wdXRGaWxlLmdldFBhdGhJblBhY2thZ2UoKTtcbiAgfVxuXG4gIC8vIFRoZSBwcm9jZXNzRmlsZXNGb3JUYXJnZXQgbWV0aG9kIGZyb20gdGhlIFBsdWdpbi5yZWdpc3RlckNvbXBpbGVyIEFQSS5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGVzRm9yVGFyZ2V0KGlucHV0RmlsZXMpIHtcbiAgICBjb25zdCBhbGxGaWxlcyA9IG5ldyBNYXA7XG4gICAgY29uc3QgY2FjaGVLZXlNYXAgPSBuZXcgTWFwO1xuICAgIGNvbnN0IGNhY2hlTWlzc2VzID0gW107XG4gICAgY29uc3QgYXJjaGVzID0gdGhpcy5fY2FjaGVEZWJ1Z0VuYWJsZWQgJiYgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIGlucHV0RmlsZXMuZm9yRWFjaCgoaW5wdXRGaWxlKSA9PiB7XG4gICAgICBjb25zdCBpbXBvcnRQYXRoID0gdGhpcy5nZXRBYnNvbHV0ZUltcG9ydFBhdGgoaW5wdXRGaWxlKTtcbiAgICAgIGFsbEZpbGVzLnNldChpbXBvcnRQYXRoLCBpbnB1dEZpbGUpO1xuICAgICAgY2FjaGVLZXlNYXAuc2V0KGltcG9ydFBhdGgsIHRoaXMuX2dldENhY2hlS2V5V2l0aFBhdGgoaW5wdXRGaWxlKSk7XG4gICAgfSk7XG5cbiAgICBmb3IgKGNvbnN0IGlucHV0RmlsZSBvZiBpbnB1dEZpbGVzKSB7XG4gICAgICBpZiAoYXJjaGVzKSB7XG4gICAgICAgIGFyY2hlc1tpbnB1dEZpbGUuZ2V0QXJjaCgpXSA9IDE7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdldFJlc3VsdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJzb2x1dGVJbXBvcnRQYXRoID0gdGhpcy5nZXRBYnNvbHV0ZUltcG9ydFBhdGgoaW5wdXRGaWxlKTtcbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBjYWNoZUtleU1hcC5nZXQoYWJzb2x1dGVJbXBvcnRQYXRoKTtcbiAgICAgICAgbGV0IGNhY2hlRW50cnkgPSB0aGlzLl9jYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgICBpZiAoISBjYWNoZUVudHJ5KSB7XG4gICAgICAgICAgY2FjaGVFbnRyeSA9IHRoaXMuX3JlYWRDYWNoZShjYWNoZUtleSk7XG4gICAgICAgICAgaWYgKGNhY2hlRW50cnkpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlRGVidWcoYExvYWRlZCAkeyBhYnNvbHV0ZUltcG9ydFBhdGggfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghIChjYWNoZUVudHJ5ICYmIHRoaXMuX2NhY2hlRW50cnlWYWxpZChjYWNoZUVudHJ5LCBjYWNoZUtleU1hcCkpKSB7XG4gICAgICAgICAgY2FjaGVNaXNzZXMucHVzaChpbnB1dEZpbGUuZ2V0RGlzcGxheVBhdGgoKSk7XG5cbiAgICAgICAgICBjb25zdCBjb21waWxlT25lRmlsZVJldHVybiA9XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuY29tcGlsZU9uZUZpbGUoaW5wdXRGaWxlLCBhbGxGaWxlcyk7XG5cbiAgICAgICAgICBpZiAoISBjb21waWxlT25lRmlsZVJldHVybikge1xuICAgICAgICAgICAgLy8gY29tcGlsZU9uZUZpbGUgc2hvdWxkIGhhdmUgY2FsbGVkIGlucHV0RmlsZS5lcnJvci5cbiAgICAgICAgICAgIC8vIFdlIGRvbid0IGNhY2hlIGZhaWx1cmVzIGZvciBub3cuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgY29tcGlsZVJlc3VsdCxcbiAgICAgICAgICAgIHJlZmVyZW5jZWRJbXBvcnRQYXRocyxcbiAgICAgICAgICB9ID0gY29tcGlsZU9uZUZpbGVSZXR1cm47XG5cbiAgICAgICAgICBjYWNoZUVudHJ5ID0ge1xuICAgICAgICAgICAgY29tcGlsZVJlc3VsdCxcbiAgICAgICAgICAgIGNhY2hlS2V5czoge1xuICAgICAgICAgICAgICAvLyBJbmNsdWRlIHRoZSBoYXNoZWQgY2FjaGUga2V5IG9mIHRoZSBmaWxlIGl0c2VsZi4uLlxuICAgICAgICAgICAgICBbYWJzb2x1dGVJbXBvcnRQYXRoXTogY2FjaGVLZXlNYXAuZ2V0KGFic29sdXRlSW1wb3J0UGF0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gLi4uIGFuZCBvZiB0aGUgb3RoZXIgcmVmZXJlbmNlZCBmaWxlcy5cbiAgICAgICAgICByZWZlcmVuY2VkSW1wb3J0UGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjYWNoZUtleU1hcC5oYXMocGF0aCkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoYFVua25vd24gYWJzb2x1dGUgaW1wb3J0IHBhdGggJHsgcGF0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWNoZUVudHJ5LmNhY2hlS2V5c1twYXRoXSA9IGNhY2hlS2V5TWFwLmdldChwYXRoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNhdmUgdGhlIGNhY2hlIGVudHJ5LlxuICAgICAgICAgIHRoaXMuX2NhY2hlLnNldChjYWNoZUtleSwgY2FjaGVFbnRyeSk7XG4gICAgICAgICAgdGhpcy5fd3JpdGVDYWNoZUFzeW5jKGNhY2hlS2V5LCBjYWNoZUVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjYWNoZUVudHJ5LmNvbXBpbGVSZXN1bHQ7XG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5jb21waWxlT25lRmlsZUxhdGVyICYmXG4gICAgICAgICAgaW5wdXRGaWxlLnN1cHBvcnRzTGF6eUNvbXBpbGF0aW9uKSB7XG4gICAgICAgIGlmICghIHRoaXMuaXNSb290KGlucHV0RmlsZSkpIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlucHV0RmlsZSBpcyBkZWZpbml0ZWx5IG5vdCBhIHJvb3QsIHRoZW4gaXQgbXVzdCBiZVxuICAgICAgICAgIC8vIGxhenksIGFuZCB0aGlzIGlzIG91ciBsYXN0IGNoYW5jZSB0byBtYXJrIGl0IGFzIHN1Y2gsIHNvIHRoYXRcbiAgICAgICAgICAvLyB0aGUgcmVzdCBvZiB0aGUgY29tcGlsZXIgcGx1Z2luIHN5c3RlbSBjYW4gYXZvaWQgd29ycnlpbmdcbiAgICAgICAgICAvLyBhYm91dCB0aGUgTXVsdGlGaWxlQ2FjaGluZ0NvbXBpbGVyLXNwZWNpZmljIGNvbmNlcHQgb2YgYVxuICAgICAgICAgIC8vIFwicm9vdC5cIiBJZiB0aGlzLmlzUm9vdChpbnB1dEZpbGUpIHJldHVybnMgdHJ1ZSBpbnN0ZWFkLCB0aGF0XG4gICAgICAgICAgLy8gY2xhc3NpZmljYXRpb24gbWF5IG5vdCBiZSB0cnVzdHdvcnRoeSwgc2luY2UgcmV0dXJuaW5nIHRydWVcbiAgICAgICAgICAvLyB1c2VkIHRvIGJlIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGZpbGUgdG8gYmUgY29tcGlsZWQsIHNvXG4gICAgICAgICAgLy8gdGhhdCBpdCBjb3VsZCBiZSBpbXBvcnRlZCBsYXRlciBieSBhIEpTIG1vZHVsZS4gTm93IHRoYXRcbiAgICAgICAgICAvLyBmaWxlcyBjYW4gYmUgY29tcGlsZWQgb24tZGVtYW5kLCBpdCdzIHNhZmUgdG8gcGFzcyBhbGwgZmlsZXNcbiAgICAgICAgICAvLyB0aGF0IG1pZ2h0IGJlIHJvb3RzIHRvIHRoaXMuY29tcGlsZU9uZUZpbGVMYXRlci5cbiAgICAgICAgICBpbnB1dEZpbGUuZ2V0RmlsZU9wdGlvbnMoKS5sYXp5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLmNvbXBpbGVPbmVGaWxlTGF0ZXIoaW5wdXRGaWxlLCBnZXRSZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUm9vdChpbnB1dEZpbGUpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldFJlc3VsdCgpO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hZGRDb21waWxlUmVzdWx0KGlucHV0RmlsZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9jYWNoZURlYnVnRW5hYmxlZCkge1xuICAgICAgdGhpcy5fYWZ0ZXJMaW5rQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuICAgICAgICBjYWNoZU1pc3Nlcy5zb3J0KCk7XG5cbiAgICAgICAgdGhpcy5fY2FjaGVEZWJ1ZyhcbiAgICAgICAgICBgUmFuICgjJHtcbiAgICAgICAgICAgICsrdGhpcy5fY2FsbENvdW50XG4gICAgICAgICAgfSkgb246ICR7XG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShjYWNoZU1pc3NlcylcbiAgICAgICAgICB9ICR7XG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhhcmNoZXMpLnNvcnQoKSlcbiAgICAgICAgICB9YFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJucyBhIGhhc2ggdGhhdCBpbmNvcnBvcmF0ZXMgYm90aCB0aGlzLmdldENhY2hlS2V5KGlucHV0RmlsZSkgYW5kXG4gIC8vIHRoaXMuZ2V0QWJzb2x1dGVJbXBvcnRQYXRoKGlucHV0RmlsZSksIHNpbmNlIHRoZSBmaWxlIHBhdGggbWlnaHQgYmVcbiAgLy8gcmVsZXZhbnQgdG8gdGhlIGNvbXBpbGVkIG91dHB1dCB3aGVuIHVzaW5nIE11bHRpRmlsZUNhY2hpbmdDb21waWxlci5cbiAgX2dldENhY2hlS2V5V2l0aFBhdGgoaW5wdXRGaWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlZXBIYXNoKFtcbiAgICAgIHRoaXMuZ2V0QWJzb2x1dGVJbXBvcnRQYXRoKGlucHV0RmlsZSksXG4gICAgICB0aGlzLmdldENhY2hlS2V5KGlucHV0RmlsZSksXG4gICAgXSk7XG4gIH1cblxuICBfY2FjaGVFbnRyeVZhbGlkKGNhY2hlRW50cnksIGNhY2hlS2V5TWFwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGNhY2hlRW50cnkuY2FjaGVLZXlzKS5ldmVyeShcbiAgICAgIChwYXRoKSA9PiBjYWNoZUVudHJ5LmNhY2hlS2V5c1twYXRoXSA9PT0gY2FjaGVLZXlNYXAuZ2V0KHBhdGgpXG4gICAgKTtcbiAgfVxuXG4gIC8vIFRoZSBmb3JtYXQgb2YgYSBjYWNoZSBmaWxlIG9uIGRpc2sgaXMgdGhlIEpTT04tc3RyaW5naWZpZWQgY2FjaGVLZXlzXG4gIC8vIG9iamVjdCwgYSBuZXdsaW5lLCBmb2xsb3dlZCBieSB0aGUgQ29tcGlsZVJlc3VsdCBhcyByZXR1cm5lZCBmcm9tXG4gIC8vIHRoaXMuc3RyaW5naWZ5Q29tcGlsZVJlc3VsdC5cbiAgX2NhY2hlRmlsZW5hbWUoY2FjaGVLZXkpIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX2Rpc2tDYWNoZSwgY2FjaGVLZXkgKyBcIi5jYWNoZVwiKTtcbiAgfVxuXG4gIC8vIExvYWRzIGEge2NvbXBpbGVSZXN1bHQsIGNhY2hlS2V5c30gY2FjaGUgZW50cnkgZnJvbSBkaXNrLiBSZXR1cm5zIHRoZSB3aG9sZVxuICAvLyBjYWNoZSBlbnRyeSBhbmQgbG9hZHMgaXQgaW50byB0aGUgaW4tbWVtb3J5IGNhY2hlIHRvby5cbiAgX3JlYWRDYWNoZShjYWNoZUtleSkge1xuICAgIGlmICghIHRoaXMuX2Rpc2tDYWNoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlRmlsZW5hbWUgPSB0aGlzLl9jYWNoZUZpbGVuYW1lKGNhY2hlS2V5KTtcbiAgICBjb25zdCByYXcgPSB0aGlzLl9yZWFkRmlsZU9yTnVsbChjYWNoZUZpbGVuYW1lKTtcbiAgICBpZiAoIXJhdykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3BsaXQgb24gbmV3bGluZS5cbiAgICBjb25zdCBuZXdsaW5lSW5kZXggPSByYXcuaW5kZXhPZignXFxuJyk7XG4gICAgaWYgKG5ld2xpbmVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZUtleXNTdHJpbmcgPSByYXcuc3Vic3RyaW5nKDAsIG5ld2xpbmVJbmRleCk7XG4gICAgY29uc3QgY29tcGlsZVJlc3VsdFN0cmluZyA9IHJhdy5zdWJzdHJpbmcobmV3bGluZUluZGV4ICsgMSk7XG5cbiAgICBjb25zdCBjYWNoZUtleXMgPSB0aGlzLl9wYXJzZUpTT05Pck51bGwoY2FjaGVLZXlzU3RyaW5nKTtcbiAgICBpZiAoIWNhY2hlS2V5cykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBpbGVSZXN1bHQgPSB0aGlzLnBhcnNlQ29tcGlsZVJlc3VsdChjb21waWxlUmVzdWx0U3RyaW5nKTtcbiAgICBpZiAoISBjb21waWxlUmVzdWx0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjYWNoZUVudHJ5ID0ge2NvbXBpbGVSZXN1bHQsIGNhY2hlS2V5c307XG4gICAgdGhpcy5fY2FjaGUuc2V0KGNhY2hlS2V5LCBjYWNoZUVudHJ5KTtcbiAgICByZXR1cm4gY2FjaGVFbnRyeTtcbiAgfVxuXG4gIF93cml0ZUNhY2hlQXN5bmMoY2FjaGVLZXksIGNhY2hlRW50cnkpIHtcbiAgICBpZiAoISB0aGlzLl9kaXNrQ2FjaGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZUZpbGVuYW1lID0gdGhpcy5fY2FjaGVGaWxlbmFtZShjYWNoZUtleSk7XG4gICAgY29uc3QgY2FjaGVDb250ZW50cyA9XG4gICAgICBKU09OLnN0cmluZ2lmeShjYWNoZUVudHJ5LmNhY2hlS2V5cykgKyAnXFxuJyArXG4gICAgICB0aGlzLnN0cmluZ2lmeUNvbXBpbGVSZXN1bHQoY2FjaGVFbnRyeS5jb21waWxlUmVzdWx0KTtcbiAgICB0aGlzLl93cml0ZUZpbGUoY2FjaGVGaWxlbmFtZSwgY2FjaGVDb250ZW50cyk7XG4gIH1cbn1cbiJdfQ==
