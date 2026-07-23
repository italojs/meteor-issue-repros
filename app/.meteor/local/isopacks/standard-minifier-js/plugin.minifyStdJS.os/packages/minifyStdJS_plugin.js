Package["core-runtime"].queue("minifyStdJS",function () {/* Imports */
var meteorJsMinify = Package['minifier-js'].meteorJsMinify;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ast;

var require = meteorInstall({"node_modules":{"meteor":{"minifyStdJS":{"plugin":{"minify-js.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minifyStdJS/plugin/minify-js.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({MeteorMinifier:()=>MeteorMinifier});let extractModuleSizesTree;module.link("./stats.js",{extractModuleSizesTree(v){extractModuleSizesTree=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}

const statsEnabled = process.env.DISABLE_CLIENT_STATS !== 'true';
const Meteor = typeof global.Meteor !== 'undefined' ? global.Meteor : {
    _debug: function(...args) {
        if (typeof console !== 'undefined' && typeof console.log !== 'undefined' && process.env.NODE_INSPECTOR_IPC) {
            console.log('[DEBUG]', ...args);
        }
    }
};
// Profile for test and production environments
let Profile;
if (typeof Plugin !== 'undefined' && Plugin.Profile) {
    Profile = Plugin.Profile;
} else {
    Profile = function(label, func) {
        return function() {
            return func.apply(this, arguments);
        };
    };
    Profile.time = function(label, func) {
        func();
    };
}
function getMeteorConfig() {
    var _Plugin;
    return ((_Plugin = Plugin) === null || _Plugin === void 0 ? void 0 : _Plugin.getMeteorConfig()) || {};
}
let swc;
// Register the minifier only when Plugin is available (not in tests)
if (typeof Plugin !== 'undefined') {
    Plugin.registerMinifier({
        extensions: [
            'js'
        ],
        archMatching: 'web'
    }, ()=>new MeteorMinifier());
}
class MeteorMinifier {
    _minifyWithSWC(file) {
        return Profile('_minifyWithSWC', ()=>{
            swc = swc || require('@meteorjs/swc-core');
            const NODE_ENV = process.env.NODE_ENV || 'development';
            let content = file.getContentsAsString();
            const isLegacyWebArch = (file === null || file === void 0 ? void 0 : file._arch) === 'web.browser.legacy';
            return swc.minifySync(content, {
                ecma: 5,
                compress: _object_spread_props(_object_spread({
                    drop_debugger: false,
                    unused: true,
                    dead_code: true,
                    typeofs: false
                }, isLegacyWebArch && {
                    defaults: false
                }), {
                    global_defs: {
                        'process.env.NODE_ENV': NODE_ENV
                    }
                }),
                safari10: true,
                inlineSourcesContent: true
            });
        })();
    }
    _minifyWithTerser(file) {
        return Profile('_minifyWithTerser', ()=>_async_to_generator(function*() {
                let terser = require('terser');
                const NODE_ENV = process.env.NODE_ENV || 'development';
                const content = file.getContentsAsString();
                return terser.minify(content, {
                    compress: {
                        drop_debugger: false,
                        unused: false,
                        dead_code: true,
                        global_defs: {
                            "process.env.NODE_ENV": NODE_ENV
                        }
                    },
                    // Fix issue meteor/meteor#9866, as explained in this comment:
                    // https://github.com/mishoo/UglifyJS2/issues/1753#issuecomment-324814782
                    // And fix terser issue #117: https://github.com/terser-js/terser/issues/117
                    safari10: true
                }).then((result)=>{
                    if (!result) {
                        throw new Error(`Terser produced empty result for ${file.getPathInBundle()}`);
                    }
                    return result;
                }).catch((error)=>{
                    throw error;
                });
            })())();
    }
    minifyOneFile(file) {
        return Profile('minifyOneFile', ()=>{
            var _meteorConfig_modern;
            const meteorConfig = getMeteorConfig();
            const modern = meteorConfig && ((meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.modern) === true || (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.modern) && (meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_modern = meteorConfig.modern) === null || _meteorConfig_modern === void 0 ? void 0 : _meteorConfig_modern.minifier) === true);
            // check if config is an empty object
            if (meteorConfig && Object.keys(meteorConfig).length === 0 || !modern) {
                Meteor._debug(`Minifying using Terser  | file: ${file.getPathInBundle()}`);
                return this._minifyWithTerser(file);
            }
            try {
                Meteor._debug(`Minifying using SWC  | file: ${file.getPathInBundle()}`);
                return this._minifyWithSWC(file);
            } catch (swcError) {
                Meteor._debug(`SWC failed  | file: ${file.getPathInBundle()}`);
                return this._minifyWithTerser(file);
            }
        })();
    }
}
MeteorMinifier.prototype.processFilesForBundle = Profile('processFilesForBundle', function(files, options) {
    return _async_to_generator(function*() {
        const mode = options.minifyMode;
        // don't minify anything for development
        if (mode === 'development') {
            files.forEach(function(file) {
                file.addJavaScript({
                    data: file.getContentsAsBuffer(),
                    sourceMap: file.getSourceMap(),
                    path: file.getPathInBundle()
                });
            });
            return;
        }
        // this function tries its best to locate the original source file
        // that the error being reported was located inside of
        function maybeThrowMinifyErrorBySourceFile(error, file) {
            const lines = file.getContentsAsString().split(/\n/);
            const lineContent = lines[error.line - 1];
            let originalSourceFileLineNumber = 0;
            // Count backward from the failed line to find the oringal filename
            for(let i = error.line - 1; i >= 0; i--){
                let currentLine = lines[i];
                // If the line is a boatload of slashes (8 or more), we're in the right place.
                if (/^\/\/\/{6,}$/.test(currentLine)) {
                    // If 4 lines back is the same exact line, we've found the framing.
                    if (lines[i - 4] === currentLine) {
                        // So in that case, 2 lines back is the file path.
                        let originalFilePath = lines[i - 2].substring(3).replace(/\s+\/\//, "");
                        throw new Error(`terser minification error (${error.name}:${error.message})\n` + `Source file: ${originalFilePath}  (${originalSourceFileLineNumber}:${error.col})\n` + `Line content: ${lineContent}\n`);
                    }
                }
                originalSourceFileLineNumber++;
            }
        }
        // this object will collect all the minified code in the
        // data field and post-minfiication file sizes in the stats field
        const toBeAdded = {
            data: "",
            stats: Object.create(null)
        };
        for (let file of files){
            // Don't reminify *.min.js.
            if (/\.min\.js$/.test(file.getPathInBundle())) {
                toBeAdded.data += file.getContentsAsString();
                Plugin.nudge();
                continue;
            }
            let minified;
            let label = 'minify file';
            if (file.getPathInBundle() === 'app/app.js') {
                label = 'minify app/app.js';
            }
            if (file.getPathInBundle() === 'packages/modules.js') {
                label = 'minify packages/modules.js';
            }
            try {
                // Need to update this approach for async/await
                let minifyPromise;
                Profile.time(label, ()=>{
                    minifyPromise = this.minifyOneFile(file);
                });
                minified = yield minifyPromise;
                if (!(minified && typeof minified.code === "string")) {
                    throw new Error(`Invalid minification result for ${file.getPathInBundle()}`);
                }
            } catch (err) {
                maybeThrowMinifyErrorBySourceFile(err, file);
                var filePath = file.getPathInBundle();
                err.message += " while minifying " + filePath;
                throw err;
            }
            if (statsEnabled) {
                let tree;
                Profile.time('extractModuleSizesTree', ()=>{
                    tree = extractModuleSizesTree(minified.code);
                    if (tree) {
                        toBeAdded.stats[file.getPathInBundle()] = [
                            Buffer.byteLength(minified.code),
                            tree
                        ];
                    } else {
                        toBeAdded.stats[file.getPathInBundle()] = Buffer.byteLength(minified.code);
                    }
                // append the minified code to the "running sum"
                // of code being minified
                });
                // Add the minified code outside of the Profile.time
                toBeAdded.data += minified.code;
            } else {
                // If stats are disabled, still need to add the minified code
                toBeAdded.data += minified.code;
            }
            toBeAdded.data += '\n\n';
            Plugin.nudge();
        }
        // this is where the minified code gets added to one
        // JS file that is delivered to the client
        if (files.length) {
            files[0].addJavaScript(toBeAdded);
        }
    }).call(this);
});
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stats.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minifyStdJS/plugin/stats.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({extractModuleSizesTree:()=>extractModuleSizesTree});let Visitor;module.link("@meteorjs/reify/lib/visitor.js",{default(v){Visitor=v}},0);let findPossibleIndexes;module.link("@meteorjs/reify/lib/utils.js",{findPossibleIndexes(v){findPossibleIndexes=v}},1);let Babel;module.link("meteor/babel-compiler",{Babel(v){Babel=v}},2);let acorn;module.link("acorn",{default(v){acorn=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();



// This RegExp will be used to scan the source for calls to meteorInstall,
// taking into consideration that the function name may have been mangled
// to something other than "meteorInstall" by the minifier.
const meteorInstallRegExp = new RegExp([
    // If meteorInstall is called by its unminified name, then that's what
    // we should be looking for in the AST.
    /\b(meteorInstall)\(\{/,
    // If the meteorInstall function name has been minified, we can figure
    // out its mangled name by examining the import assignment.
    /\b(\w+)=Package\.modules\.meteorInstall\b/,
    /\b(\w+)=Package\["modules-runtime"\].meteorInstall\b/,
    // Sometimes uglify-es will inline (0,Package.modules.meteorInstall) as
    // a call expression.
    /\(0,Package\.modules\.(meteorInstall)\)\(/,
    /\(0,Package\["modules-runtime"\]\.(meteorInstall)\)\(/
].map((exp)=>exp.source).join("|"));
function extractModuleSizesTree(source) {
    const match = meteorInstallRegExp.exec(source);
    if (match) {
        try {
            ast = acorn.parse(source, {
                ecmaVersion: 'latest',
                sourceType: 'script',
                allowAwaitOutsideFunction: true,
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                allowHashBang: true,
                checkPrivateFields: false
            });
        } catch (e) {
            console.log(`Error while parsing with acorn. Falling back to babel minifier. ${e}`);
            ast = Babel.parse(source);
        }
        let meteorInstallName = "meteorInstall";
        // The minifier may have renamed meteorInstall to something shorter.
        match.some((name, i)=>i > 0 && (meteorInstallName = name));
        meteorInstallVisitor.visit(ast, meteorInstallName, source);
        return meteorInstallVisitor.tree;
    }
}
const meteorInstallVisitor = new class extends Visitor {
    reset(root, meteorInstallName, source) {
        this.name = meteorInstallName;
        this.source = source;
        this.tree = Object.create(null);
        // Optimization to abandon entire subtrees of the AST that contain
        // nothing like the meteorInstall identifier we're looking for.
        this.possibleIndexes = findPossibleIndexes(source, [
            meteorInstallName
        ]);
    }
    visitCallExpression(path) {
        const node = path.getValue();
        if (hasIdWithName(node.callee, this.name)) {
            const source = this.source;
            function walk(tree, expr) {
                if (expr.type !== "ObjectExpression") {
                    return Buffer.byteLength(source.slice(expr.start, expr.end));
                }
                tree = tree || Object.create(null);
                expr.properties.forEach((prop)=>{
                    const keyName = getKeyName(prop.key);
                    if (typeof keyName === "string") {
                        tree[keyName] = walk(tree[keyName], prop.value);
                    }
                });
                return tree;
            }
            walk(this.tree, node.arguments[0]);
        } else {
            this.visitChildren(path);
        }
    }
};
function hasIdWithName(node, name) {
    switch(node && node.type){
        case "SequenceExpression":
            const last = node.expressions[node.expressions.length - 1];
            return hasIdWithName(last, name);
        case "MemberExpression":
            return hasIdWithName(node.property, name);
        case "Identifier":
            return node.name === name;
        default:
            return false;
    }
}
function getKeyName(key) {
    if (key.type === "Identifier") {
        return key.name;
    }
    if (key.type === "StringLiteral" || key.type === "Literal") {
        return key.value;
    }
    return null;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"@meteorjs":{"reify":{"lib":{"visitor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/@meteorjs/reify/lib/visitor.js                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/@meteorjs/reify/lib/utils.js                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"swc-core":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/@meteorjs/swc-core/package.json                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "@meteorjs/swc-core",
  "version": "1.15.3",
  "main": "./index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/@meteorjs/swc-core/index.js                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"acorn":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/acorn/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "acorn",
  "version": "8.10.0",
  "main": "dist/acorn.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"acorn.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/acorn/dist/acorn.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"terser":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/terser/package.json                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "terser",
  "version": "5.19.2",
  "main": "dist/bundle.min.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"bundle.min.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/minifyStdJS/node_modules/terser/dist/bundle.min.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/minifyStdJS/plugin/minify-js.js",
    "/node_modules/meteor/minifyStdJS/plugin/stats.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/minifyStdJS_plugin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaWZ5U3RkSlMvcGx1Z2luL21pbmlmeS1qcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaWZ5U3RkSlMvcGx1Z2luL3N0YXRzLmpzIl0sIm5hbWVzIjpbInN0YXRzRW5hYmxlZCIsInByb2Nlc3MiLCJlbnYiLCJESVNBQkxFX0NMSUVOVF9TVEFUUyIsIk1ldGVvciIsImdsb2JhbCIsIl9kZWJ1ZyIsImFyZ3MiLCJjb25zb2xlIiwibG9nIiwiTk9ERV9JTlNQRUNUT1JfSVBDIiwiUHJvZmlsZSIsIlBsdWdpbiIsImxhYmVsIiwiZnVuYyIsImFwcGx5IiwiYXJndW1lbnRzIiwidGltZSIsImdldE1ldGVvckNvbmZpZyIsInN3YyIsInJlZ2lzdGVyTWluaWZpZXIiLCJleHRlbnNpb25zIiwiYXJjaE1hdGNoaW5nIiwiTWV0ZW9yTWluaWZpZXIiLCJfbWluaWZ5V2l0aFNXQyIsImZpbGUiLCJyZXF1aXJlIiwiTk9ERV9FTlYiLCJjb250ZW50IiwiZ2V0Q29udGVudHNBc1N0cmluZyIsImlzTGVnYWN5V2ViQXJjaCIsIl9hcmNoIiwibWluaWZ5U3luYyIsImVjbWEiLCJjb21wcmVzcyIsImRyb3BfZGVidWdnZXIiLCJ1bnVzZWQiLCJkZWFkX2NvZGUiLCJ0eXBlb2ZzIiwiZGVmYXVsdHMiLCJnbG9iYWxfZGVmcyIsInNhZmFyaTEwIiwiaW5saW5lU291cmNlc0NvbnRlbnQiLCJfbWluaWZ5V2l0aFRlcnNlciIsInRlcnNlciIsIm1pbmlmeSIsInRoZW4iLCJyZXN1bHQiLCJFcnJvciIsImdldFBhdGhJbkJ1bmRsZSIsImNhdGNoIiwiZXJyb3IiLCJtaW5pZnlPbmVGaWxlIiwibWV0ZW9yQ29uZmlnIiwibW9kZXJuIiwibWluaWZpZXIiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwic3djRXJyb3IiLCJwcm90b3R5cGUiLCJwcm9jZXNzRmlsZXNGb3JCdW5kbGUiLCJmaWxlcyIsIm9wdGlvbnMiLCJtb2RlIiwibWluaWZ5TW9kZSIsImZvckVhY2giLCJhZGRKYXZhU2NyaXB0IiwiZGF0YSIsImdldENvbnRlbnRzQXNCdWZmZXIiLCJzb3VyY2VNYXAiLCJnZXRTb3VyY2VNYXAiLCJwYXRoIiwibWF5YmVUaHJvd01pbmlmeUVycm9yQnlTb3VyY2VGaWxlIiwibGluZXMiLCJzcGxpdCIsImxpbmVDb250ZW50IiwibGluZSIsIm9yaWdpbmFsU291cmNlRmlsZUxpbmVOdW1iZXIiLCJpIiwiY3VycmVudExpbmUiLCJ0ZXN0Iiwib3JpZ2luYWxGaWxlUGF0aCIsInN1YnN0cmluZyIsInJlcGxhY2UiLCJuYW1lIiwibWVzc2FnZSIsImNvbCIsInRvQmVBZGRlZCIsInN0YXRzIiwiY3JlYXRlIiwibnVkZ2UiLCJtaW5pZmllZCIsIm1pbmlmeVByb21pc2UiLCJjb2RlIiwiZXJyIiwiZmlsZVBhdGgiLCJ0cmVlIiwiZXh0cmFjdE1vZHVsZVNpemVzVHJlZSIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJWaXNpdG9yIiwibWV0ZW9ySW5zdGFsbFJlZ0V4cCIsIlJlZ0V4cCIsIm1hcCIsImV4cCIsInNvdXJjZSIsImpvaW4iLCJtYXRjaCIsImV4ZWMiLCJhc3QiLCJhY29ybiIsInBhcnNlIiwiZWNtYVZlcnNpb24iLCJzb3VyY2VUeXBlIiwiYWxsb3dBd2FpdE91dHNpZGVGdW5jdGlvbiIsImFsbG93SW1wb3J0RXhwb3J0RXZlcnl3aGVyZSIsImFsbG93UmV0dXJuT3V0c2lkZUZ1bmN0aW9uIiwiYWxsb3dIYXNoQmFuZyIsImNoZWNrUHJpdmF0ZUZpZWxkcyIsImUiLCJCYWJlbCIsIm1ldGVvckluc3RhbGxOYW1lIiwic29tZSIsIm1ldGVvckluc3RhbGxWaXNpdG9yIiwidmlzaXQiLCJyZXNldCIsInJvb3QiLCJwb3NzaWJsZUluZGV4ZXMiLCJmaW5kUG9zc2libGVJbmRleGVzIiwidmlzaXRDYWxsRXhwcmVzc2lvbiIsIm5vZGUiLCJnZXRWYWx1ZSIsImhhc0lkV2l0aE5hbWUiLCJjYWxsZWUiLCJ3YWxrIiwiZXhwciIsInR5cGUiLCJzbGljZSIsInN0YXJ0IiwiZW5kIiwicHJvcGVydGllcyIsInByb3AiLCJrZXlOYW1lIiwiZ2V0S2V5TmFtZSIsImtleSIsInZhbHVlIiwidmlzaXRDaGlsZHJlbiIsImxhc3QiLCJleHByZXNzaW9ucyIsInByb3BlcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFvRDtBQUVwRCxNQUFNQSxlQUFlQyxRQUFRQyxHQUFHLENBQUNDLG9CQUFvQixLQUFLO0FBRzFELE1BQU1DLFNBQVMsT0FBT0MsT0FBT0QsTUFBTSxLQUFLLGNBQWNDLE9BQU9ELE1BQU0sR0FBRztJQUNwRUUsUUFBUSxTQUFTLEdBQUdDLElBQUk7UUFDdEIsSUFBSSxPQUFPQyxZQUFZLGVBQWUsT0FBT0EsUUFBUUMsR0FBRyxLQUFLLGVBQWVSLFFBQVFDLEdBQUcsQ0FBQ1Esa0JBQWtCLEVBQUU7WUFDMUdGLFFBQVFDLEdBQUcsQ0FBQyxjQUFjRjtRQUM1QjtJQUNGO0FBQ0Y7QUFFQSwrQ0FBK0M7QUFDL0MsSUFBSUk7QUFDSixJQUFJLE9BQU9DLFdBQVcsZUFBZUEsT0FBT0QsT0FBTyxFQUFFO0lBQ25EQSxVQUFVQyxPQUFPRCxPQUFPO0FBQzFCLE9BQU87SUFDTEEsVUFBVSxTQUFVRSxLQUFLLEVBQUVDLElBQUk7UUFDN0IsT0FBTztZQUNMLE9BQU9BLEtBQUtDLEtBQUssQ0FBQyxJQUFJLEVBQUVDO1FBQzFCO0lBQ0Y7SUFDQUwsUUFBUU0sSUFBSSxHQUFHLFNBQVVKLEtBQUssRUFBRUMsSUFBSTtRQUNsQ0E7SUFDRjtBQUNGO0FBRUEsU0FBU0k7UUFDQU47SUFBUCxPQUFPQSxzRUFBUU0sZUFBZSxPQUFNLENBQUM7QUFDdkM7QUFFQSxJQUFJQztBQUVKLHFFQUFxRTtBQUNyRSxJQUFJLE9BQU9QLFdBQVcsYUFBYTtJQUNqQ0EsT0FBT1EsZ0JB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Q29udGVudCI6WyJpbXBvcnQgeyBleHRyYWN0TW9kdWxlU2l6ZXNUcmVlIH0gZnJvbSBcIi4vc3RhdHMuanNcIjtcblxuY29uc3Qgc3RhdHNFbmFibGVkID0gcHJvY2Vzcy5lbnYuRElTQUJMRV9DTElFTlRfU1RBVFMgIT09ICd0cnVlJ1xuXG5cbmNvbnN0IE1ldGVvciA9IHR5cGVvZiBnbG9iYWwuTWV0ZW9yICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5NZXRlb3IgOiB7XG4gIF9kZWJ1ZzogZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUubG9nICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudi5OT0RFX0lOU1BFQ1RPUl9JUEMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbREVCVUddJywgLi4uYXJncyk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBQcm9maWxlIGZvciB0ZXN0IGFuZCBwcm9kdWN0aW9uIGVudmlyb25tZW50c1xubGV0IFByb2ZpbGU7XG5pZiAodHlwZW9mIFBsdWdpbiAhPT0gJ3VuZGVmaW5lZCcgJiYgUGx1Z2luLlByb2ZpbGUpIHtcbiAgUHJvZmlsZSA9IFBsdWdpbi5Qcm9maWxlO1xufSBlbHNlIHtcbiAgUHJvZmlsZSA9IGZ1bmN0aW9uIChsYWJlbCwgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuICBQcm9maWxlLnRpbWUgPSBmdW5jdGlvbiAobGFiZWwsIGZ1bmMpIHtcbiAgICBmdW5jKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWV0ZW9yQ29uZmlnKCkge1xuICByZXR1cm4gUGx1Z2luPy5nZXRNZXRlb3JDb25maWcoKSB8fCB7fTtcbn1cblxubGV0IHN3YztcblxuLy8gUmVnaXN0ZXIgdGhlIG1pbmlmaWVyIG9ubHkgd2hlbiBQbHVnaW4gaXMgYXZhaWxhYmxlIChub3QgaW4gdGVzdHMpXG5pZiAodHlwZW9mIFBsdWdpbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgUGx1Z2luLnJlZ2lzdGVyTWluaWZpZXIoe1xuICAgICAgZXh0ZW5zaW9uczogWydqcyddLFxuICAgICAgYXJjaE1hdGNoaW5nOiAnd2ViJyxcbiAgICB9LFxuICAgICgpID0+IG5ldyBNZXRlb3JNaW5pZmllcigpXG4gICk7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRlb3JNaW5pZmllciB7XG4gIF9taW5pZnlXaXRoU1dDKGZpbGUpIHtcbiAgICByZXR1cm4gUHJvZmlsZSgnX21pbmlmeVdpdGhTV0MnLCAoKSA9PiB7XG4gICAgICBzd2MgPSBzd2MgfHwgcmVxdWlyZSgnQG1ldGVvcmpzL3N3Yy1jb3JlJyk7IFxuICAgICAgY29uc3QgTk9ERV9FTlYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnO1xuICAgICAgXG4gICAgICBsZXQgY29udGVudCA9IGZpbGUuZ2V0Q29udGVudHNBc1N0cmluZygpO1xuICAgICAgY29uc3QgaXNMZWdhY3lXZWJBcmNoID0gZmlsZT8uX2FyY2ggPT09ICd3ZWIuYnJvd3Nlci5sZWdhY3knO1xuXG4gICAgICByZXR1cm4gc3djLm1pbmlmeVN5bmMoXG4gICAgICAgIGNvbnRlbnQsXG4gICAgICAgIHtcbiAgICAgICAgICBlY21hOiA1LFxuICAgICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiBmYWxzZSxcblxuICAgICAgICAgICAgdW51c2VkOiB0cnVlLFxuICAgICAgICAgICAgZGVhZF9jb2RlOiB0cnVlLFxuICAgICAgICAgICAgdHlwZW9mczogZmFsc2UsXG4gICAgICAgICAgICAuLi4oaXNMZWdhY3lXZWJBcmNoICYmIHsgZGVmYXVsdHM6IGZhbHNlIH0pLFxuXG4gICAgICAgICAgICBnbG9iYWxfZGVmczoge1xuICAgICAgICAgICAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBOT0RFX0VOVixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzYWZhcmkxMDogdHJ1ZSxcbiAgICAgICAgICBpbmxpbmVTb3VyY2VzQ29udGVudDogdHJ1ZVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pKCk7XG4gIH1cblxuICBfbWluaWZ5V2l0aFRlcnNlcihmaWxlKSB7XG4gICAgcmV0dXJuIFByb2ZpbGUoJ19taW5pZnlXaXRoVGVyc2VyJywgYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHRlcnNlciA9IHJlcXVpcmUoJ3RlcnNlcicpO1xuICAgICAgY29uc3QgTk9ERV9FTlYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnO1xuICAgICAgY29uc3QgY29udGVudCA9IGZpbGUuZ2V0Q29udGVudHNBc1N0cmluZygpO1xuICAgICAgXG4gICAgICByZXR1cm4gdGVyc2VyLm1pbmlmeShjb250ZW50LCB7XG4gICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgZHJvcF9kZWJ1Z2dlcjogZmFsc2UsXG4gICAgICAgICAgdW51c2VkOiBmYWxzZSxcbiAgICAgICAgICBkZWFkX2NvZGU6IHRydWUsXG4gICAgICAgICAgZ2xvYmFsX2RlZnM6IHtcbiAgICAgICAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogTk9ERV9FTlZcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEZpeCBpc3N1ZSBtZXRlb3IvbWV0ZW9yIzk4NjYsIGFzIGV4cGxhaW5lZCBpbiB0aGlzIGNvbW1lbnQ6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9taXNob28vVWdsaWZ5SlMyL2lzc3Vlcy8xNzUzI2lzc3VlY29tbWVudC0zMjQ4MTQ3ODJcbiAgICAgICAgLy8gQW5kIGZpeCB0ZXJzZXIgaXNzdWUgIzExNzogaHR0cHM6Ly9naXRodWIuY29tL3RlcnNlci1qcy90ZXJzZXIvaXNzdWVzLzExN1xuICAgICAgICBzYWZhcmkxMDogdHJ1ZVxuICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGVyc2VyIHByb2R1Y2VkIGVtcHR5IHJlc3VsdCBmb3IgJHtmaWxlLmdldFBhdGhJbkJ1bmRsZSgpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgfSkoKTtcbiAgfVxuXG4gIG1pbmlmeU9uZUZpbGUoZmlsZSkge1xuICAgIHJldHVybiBQcm9maWxlKCdtaW5pZnlPbmVGaWxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbWV0ZW9yQ29uZmlnID0gZ2V0TWV0ZW9yQ29uZmlnKCk7XG4gICAgICBjb25zdCBtb2Rlcm4gPVxuICAgICAgICBtZXRlb3JDb25maWcgJiZcbiAgICAgICAgKG1ldGVvckNvbmZpZz8ubW9kZXJuID09PSB0cnVlIHx8XG4gICAgICAgICAgKG1ldGVvckNvbmZpZz8ubW9kZXJuICYmXG4gICAgICAgICAgICBtZXRlb3JDb25maWc/Lm1vZGVybj8ubWluaWZpZXIgPT09IHRydWUpKTtcbiAgICAgIC8vIGNoZWNrIGlmIGNvbmZpZyBpcyBhbiBlbXB0eSBvYmplY3RcbiAgICAgIGlmKG1ldGVvckNvbmZpZyAmJiBPYmplY3Qua2V5cyhtZXRlb3JDb25maWcpLmxlbmd0aCA9PT0gMCB8fCAhbW9kZXJuKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoYE1pbmlmeWluZyB1c2luZyBUZXJzZXIgIHwgZmlsZTogJHtmaWxlLmdldFBhdGhJbkJ1bmRsZSgpfWApO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWluaWZ5V2l0aFRlcnNlcihmaWxlKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhgTWluaWZ5aW5nIHVzaW5nIFNXQyAgfCBmaWxlOiAke2ZpbGUuZ2V0UGF0aEluQnVuZGxlKCl9YCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9taW5pZnlXaXRoU1dDKGZpbGUpO1xuICAgICAgfSBjYXRjaCAoc3djRXJyb3IpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhgU1dDIGZhaWxlZCAgfCBmaWxlOiAke2ZpbGUuZ2V0UGF0aEluQnVuZGxlKCl9YCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9taW5pZnlXaXRoVGVyc2VyKGZpbGUpO1xuICAgICAgfVxuICAgIH0pKCk7XG4gIH1cbn1cblxuTWV0ZW9yTWluaWZpZXIucHJvdG90eXBlLnByb2Nlc3NGaWxlc0ZvckJ1bmRsZSA9IFByb2ZpbGUoJ3Byb2Nlc3NGaWxlc0ZvckJ1bmRsZScsIGFzeW5jIGZ1bmN0aW9uIChmaWxlcywgb3B0aW9ucykge1xuICBjb25zdCBtb2RlID0gb3B0aW9ucy5taW5pZnlNb2RlO1xuXG4gIC8vIGRvbid0IG1pbmlmeSBhbnl0aGluZyBmb3IgZGV2ZWxvcG1lbnRcbiAgaWYgKG1vZGUgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBmaWxlLmFkZEphdmFTY3JpcHQoe1xuICAgICAgICBkYXRhOiBmaWxlLmdldENvbnRlbnRzQXNCdWZmZXIoKSxcbiAgICAgICAgc291cmNlTWFwOiBmaWxlLmdldFNvdXJjZU1hcCgpLFxuICAgICAgICBwYXRoOiBmaWxlLmdldFBhdGhJbkJ1bmRsZSgpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdGhpcyBmdW5jdGlvbiB0cmllcyBpdHMgYmVzdCB0byBsb2NhdGUgdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlXG4gIC8vIHRoYXQgdGhlIGVycm9yIGJlaW5nIHJlcG9ydGVkIHdhcyBsb2NhdGVkIGluc2lkZSBvZlxuICBmdW5jdGlvbiBtYXliZVRocm93TWluaWZ5RXJyb3JCeVNvdXJjZUZpbGUoZXJyb3IsIGZpbGUpIHtcbiAgICBjb25zdCBsaW5lcyA9IGZpbGUuZ2V0Q29udGVudHNBc1N0cmluZygpLnNwbGl0KC9cXG4vKTtcbiAgICBjb25zdCBsaW5lQ29udGVudCA9IGxpbmVzW2Vycm9yLmxpbmUgLSAxXTtcblxuICAgIGxldCBvcmlnaW5hbFNvdXJjZUZpbGVMaW5lTnVtYmVyID0gMDtcblxuICAgIC8vIENvdW50IGJhY2t3YXJkIGZyb20gdGhlIGZhaWxlZCBsaW5lIHRvIGZpbmQgdGhlIG9yaW5nYWwgZmlsZW5hbWVcbiAgICBmb3IgKGxldCBpID0gKGVycm9yLmxpbmUgLSAxKTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgbGV0IGN1cnJlbnRMaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgLy8gSWYgdGhlIGxpbmUgaXMgYSBib2F0bG9hZCBvZiBzbGFzaGVzICg4IG9yIG1vcmUpLCB3ZSdyZSBpbiB0aGUgcmlnaHQgcGxhY2UuXG4gICAgICAgIGlmICgvXlxcL1xcL1xcL3s2LH0kLy50ZXN0KGN1cnJlbnRMaW5lKSkge1xuXG4gICAgICAgICAgICAvLyBJZiA0IGxpbmVzIGJhY2sgaXMgdGhlIHNhbWUgZXhhY3QgbGluZSwgd2UndmUgZm91bmQgdGhlIGZyYW1pbmcuXG4gICAgICAgICAgICBpZiAobGluZXNbaSAtIDRdID09PSBjdXJyZW50TGluZSkge1xuXG4gICAgICAgICAgICAgICAgLy8gU28gaW4gdGhhdCBjYXNlLCAyIGxpbmVzIGJhY2sgaXMgdGhlIGZpbGUgcGF0aC5cbiAgICAgICAgICAgICAgICBsZXQgb3JpZ2luYWxGaWxlUGF0aCA9IGxpbmVzW2kgLSAyXS5zdWJzdHJpbmcoMykucmVwbGFjZSgvXFxzK1xcL1xcLy8sIFwiXCIpO1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgdGVyc2VyIG1pbmlmaWNhdGlvbiBlcnJvciAoJHtlcnJvci5uYW1lfToke2Vycm9yLm1lc3NhZ2V9KVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgU291cmNlIGZpbGU6ICR7b3JpZ2luYWxGaWxlUGF0aH0gICgke29yaWdpbmFsU291cmNlRmlsZUxpbmVOdW1iZXJ9OiR7ZXJyb3IuY29sfSlcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYExpbmUgY29udGVudDogJHtsaW5lQ29udGVudH1cXG5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcmlnaW5hbFNvdXJjZUZpbGVMaW5lTnVtYmVyKys7XG4gICAgfVxuICB9XG4gICAgXG4gIC8vIHRoaXMgb2JqZWN0IHdpbGwgY29sbGVjdCBhbGwgdGhlIG1pbmlmaWVkIGNvZGUgaW4gdGhlXG4gIC8vIGRhdGEgZmllbGQgYW5kIHBvc3QtbWluZmlpY2F0aW9uIGZpbGUgc2l6ZXMgaW4gdGhlIHN0YXRzIGZpZWxkXG4gIGNvbnN0IHRvQmVBZGRlZCA9IHtcbiAgICBkYXRhOiBcIlwiLFxuICAgIHN0YXRzOiBPYmplY3QuY3JlYXRlKG51bGwpXG4gIH07XG5cbiAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgIC8vIERvbid0IHJlbWluaWZ5ICoubWluLmpzLlxuICAgIGlmICgvXFwubWluXFwuanMkLy50ZXN0KGZpbGUuZ2V0UGF0aEluQnVuZGxlKCkpKSB7XG4gICAgICB0b0JlQWRkZWQuZGF0YSArPSBmaWxlLmdldENvbnRlbnRzQXNTdHJpbmcoKTtcbiAgICAgIFBsdWdpbi5udWRnZSgpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuIFxuICAgIGxldCBtaW5pZmllZDtcbiAgICBsZXQgbGFiZWwgPSAnbWluaWZ5IGZpbGUnXG4gICAgaWYgKGZpbGUuZ2V0UGF0aEluQnVuZGxlKCkgPT09ICdhcHAvYXBwLmpzJykge1xuICAgICAgbGFiZWwgPSAnbWluaWZ5IGFwcC9hcHAuanMnXG4gICAgfVxuICAgIGlmIChmaWxlLmdldFBhdGhJbkJ1bmRsZSgpID09PSAncGFja2FnZXMvbW9kdWxlcy5qcycpIHtcbiAgICAgIGxhYmVsID0gJ21pbmlmeSBwYWNrYWdlcy9tb2R1bGVzLmpzJ1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBOZWVkIHRvIHVwZGF0ZSB0aGlzIGFwcHJvYWNoIGZvciBhc3luYy9hd2FpdFxuICAgICAgbGV0IG1pbmlmeVByb21pc2U7XG4gICAgICBQcm9maWxlLnRpbWUobGFiZWwsICgpID0+IHtcbiAgICAgICAgbWluaWZ5UHJvbWlzZSA9IHRoaXMubWluaWZ5T25lRmlsZShmaWxlKTtcbiAgICAgIH0pO1xuICAgICAgbWluaWZpZWQgPSBhd2FpdCBtaW5pZnlQcm9taXNlO1xuICAgICAgXG4gICAgICBpZiAoIShtaW5pZmllZCAmJiB0eXBlb2YgbWluaWZpZWQuY29kZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG1pbmlmaWNhdGlvbiByZXN1bHQgZm9yICR7ZmlsZS5nZXRQYXRoSW5CdW5kbGUoKX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgbWF5YmVUaHJvd01pbmlmeUVycm9yQnlTb3VyY2VGaWxlKGVyciwgZmlsZSk7XG4gICAgICB2YXIgZmlsZVBhdGggPSBmaWxlLmdldFBhdGhJbkJ1bmRsZSgpO1xuICAgICAgZXJyLm1lc3NhZ2UgKz0gXCIgd2hpbGUgbWluaWZ5aW5nIFwiICsgZmlsZVBhdGg7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRzRW5hYmxlZCkge1xuICAgICAgbGV0IHRyZWU7XG4gICAgICBQcm9maWxlLnRpbWUoJ2V4dHJhY3RNb2R1bGVTaXplc1RyZWUnLCAoKSA9PiB7XG4gICAgICAgIHRyZWUgPSBleHRyYWN0TW9kdWxlU2l6ZXNUcmVlKG1pbmlmaWVkLmNvZGUpO1xuICAgICAgICBpZiAodHJlZSkge1xuICAgICAgICAgIHRvQmVBZGRlZC5zdGF0c1tmaWxlLmdldFBhdGhJbkJ1bmRsZSgpXSA9IFtCdWZmZXIuYnl0ZUxlbmd0aChtaW5pZmllZC5jb2RlKSwgdHJlZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9CZUFkZGVkLnN0YXRzW2ZpbGUuZ2V0UGF0aEluQnVuZGxlKCldID0gQnVmZmVyLmJ5dGVMZW5ndGgobWluaWZpZWQuY29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHRoZSBtaW5pZmllZCBjb2RlIHRvIHRoZSBcInJ1bm5pbmcgc3VtXCJcbiAgICAgICAgLy8gb2YgY29kZSBiZWluZyBtaW5pZmllZFxuICAgICAgfSk7XG4gICAgICAvLyBBZGQgdGhlIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiB0aGUgUHJvZmlsZS50aW1lXG4gICAgICB0b0JlQWRkZWQuZGF0YSArPSBtaW5pZmllZC5jb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBzdGF0cyBhcmUgZGlzYWJsZWQsIHN0aWxsIG5lZWQgdG8gYWRkIHRoZSBtaW5pZmllZCBjb2RlXG4gICAgICB0b0JlQWRkZWQuZGF0YSArPSBtaW5pZmllZC5jb2RlO1xuICAgIH1cblxuICAgIHRvQmVBZGRlZC5kYXRhICs9ICdcXG5cXG4nO1xuICAgIFxuICAgIFBsdWdpbi5udWRnZSgpO1xuICB9XG5cbiAgLy8gdGhpcyBpcyB3aGVyZSB0aGUgbWluaWZpZWQgY29kZSBnZXRzIGFkZGVkIHRvIG9uZVxuICAvLyBKUyBmaWxlIHRoYXQgaXMgZGVsaXZlcmVkIHRvIHRoZSBjbGllbnRcbiAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgIGZpbGVzWzBdLmFkZEphdmFTY3JpcHQodG9CZUFkZGVkKTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgVmlzaXRvciBmcm9tIFwiQG1ldGVvcmpzL3JlaWZ5L2xpYi92aXNpdG9yLmpzXCI7XG5pbXBvcnQgeyBmaW5kUG9zc2libGVJbmRleGVzIH0gZnJvbSBcIkBtZXRlb3Jqcy9yZWlmeS9saWIvdXRpbHMuanNcIjtcbmltcG9ydCB7IEJhYmVsIH0gZnJvbSBcIm1ldGVvci9iYWJlbC1jb21waWxlclwiO1xuaW1wb3J0IGFjb3JuIGZyb21cImFjb3JuXCI7XG5cblxuLy8gVGhpcyBSZWdFeHAgd2lsbCBiZSB1c2VkIHRvIHNjYW4gdGhlIHNvdXJjZSBmb3IgY2FsbHMgdG8gbWV0ZW9ySW5zdGFsbCxcbi8vIHRha2luZyBpbnRvIGNvbnNpZGVyYXRpb24gdGhhdCB0aGUgZnVuY3Rpb24gbmFtZSBtYXkgaGF2ZSBiZWVuIG1hbmdsZWRcbi8vIHRvIHNvbWV0aGluZyBvdGhlciB0aGFuIFwibWV0ZW9ySW5zdGFsbFwiIGJ5IHRoZSBtaW5pZmllci5cbmNvbnN0IG1ldGVvckluc3RhbGxSZWdFeHAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gSWYgbWV0ZW9ySW5zdGFsbCBpcyBjYWxsZWQgYnkgaXRzIHVubWluaWZpZWQgbmFtZSwgdGhlbiB0aGF0J3Mgd2hhdFxuICAvLyB3ZSBzaG91bGQgYmUgbG9va2luZyBmb3IgaW4gdGhlIEFTVC5cbiAgL1xcYihtZXRlb3JJbnN0YWxsKVxcKFxcey8sXG4gIC8vIElmIHRoZSBtZXRlb3JJbnN0YWxsIGZ1bmN0aW9uIG5hbWUgaGFzIGJlZW4gbWluaWZpZWQsIHdlIGNhbiBmaWd1cmVcbiAgLy8gb3V0IGl0cyBtYW5nbGVkIG5hbWUgYnkgZXhhbWluaW5nIHRoZSBpbXBvcnQgYXNzaWdubWVudC5cbiAgL1xcYihcXHcrKT1QYWNrYWdlXFwubW9kdWxlc1xcLm1ldGVvckluc3RhbGxcXGIvLFxuICAvXFxiKFxcdyspPVBhY2thZ2VcXFtcIm1vZHVsZXMtcnVudGltZVwiXFxdLm1ldGVvckluc3RhbGxcXGIvLFxuICAvLyBTb21ldGltZXMgdWdsaWZ5LWVzIHdpbGwgaW5saW5lICgwLFBhY2thZ2UubW9kdWxlcy5tZXRlb3JJbnN0YWxsKSBhc1xuICAvLyBhIGNhbGwgZXhwcmVzc2lvbi5cbiAgL1xcKDAsUGFja2FnZVxcLm1vZHVsZXNcXC4obWV0ZW9ySW5zdGFsbClcXClcXCgvLFxuICAvXFwoMCxQYWNrYWdlXFxbXCJtb2R1bGVzLXJ1bnRpbWVcIlxcXVxcLihtZXRlb3JJbnN0YWxsKVxcKVxcKC8sXG5dLm1hcChleHAgPT4gZXhwLnNvdXJjZSkuam9pbihcInxcIikpO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdE1vZHVsZVNpemVzVHJlZShzb3VyY2UpIHtcbiAgY29uc3QgbWF0Y2ggPSBtZXRlb3JJbnN0YWxsUmVnRXhwLmV4ZWMoc291cmNlKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGFzdCA9IGFjb3JuLnBhcnNlKHNvdXJjZSwge1xuICAgICAgICBlY21hVmVyc2lvbjogJ2xhdGVzdCcsXG4gICAgICAgIHNvdXJjZVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICBhbGxvd0F3YWl0T3V0c2lkZUZ1bmN0aW9uOiB0cnVlLFxuICAgICAgICBhbGxvd0ltcG9ydEV4cG9ydEV2ZXJ5d2hlcmU6IHRydWUsXG4gICAgICAgIGFsbG93UmV0dXJuT3V0c2lkZUZ1bmN0aW9uOiB0cnVlLFxuICAgICAgICBhbGxvd0hhc2hCYW5nOiB0cnVlLFxuICAgICAgICBjaGVja1ByaXZhdGVGaWVsZHM6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gICAgY2F0Y2goZSl7XG4gICAgICBjb25zb2xlLmxvZyhgRXJyb3Igd2hpbGUgcGFyc2luZyB3aXRoIGFjb3JuLiBGYWxsaW5nIGJhY2sgdG8gYmFiZWwgbWluaWZpZXIuICR7ZX1gKTtcbiAgICAgIGFzdCA9IEJhYmVsLnBhcnNlKHNvdXJjZSk7XG4gICAgfVxuICAgIFxuICAgIGxldCBtZXRlb3JJbnN0YWxsTmFtZSA9IFwibWV0ZW9ySW5zdGFsbFwiO1xuICAgIC8vIFRoZSBtaW5pZmllciBtYXkgaGF2ZSByZW5hbWVkIG1ldGVvckluc3RhbGwgdG8gc29tZXRoaW5nIHNob3J0ZXIuXG4gICAgbWF0Y2guc29tZSgobmFtZSwgaSkgPT4gKGkgPiAwICYmIChtZXRlb3JJbnN0YWxsTmFtZSA9IG5hbWUpKSk7XG4gICAgbWV0ZW9ySW5zdGFsbFZpc2l0b3IudmlzaXQoYXN0LCBtZXRlb3JJbnN0YWxsTmFtZSwgc291cmNlKTtcbiAgICByZXR1cm4gbWV0ZW9ySW5zdGFsbFZpc2l0b3IudHJlZTtcbiAgfVxufVxuXG5jb25zdCBtZXRlb3JJbnN0YWxsVmlzaXRvciA9IG5ldyAoY2xhc3MgZXh0ZW5kcyBWaXNpdG9yIHtcbiAgcmVzZXQocm9vdCwgbWV0ZW9ySW5zdGFsbE5hbWUsIHNvdXJjZSkge1xuICAgIHRoaXMubmFtZSA9IG1ldGVvckluc3RhbGxOYW1lO1xuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgIHRoaXMudHJlZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgLy8gT3B0aW1pemF0aW9uIHRvIGFiYW5kb24gZW50aXJlIHN1YnRyZWVzIG9mIHRoZSBBU1QgdGhhdCBjb250YWluXG4gICAgLy8gbm90aGluZyBsaWtlIHRoZSBtZXRlb3JJbnN0YWxsIGlkZW50aWZpZXIgd2UncmUgbG9va2luZyBmb3IuXG4gICAgdGhpcy5wb3NzaWJsZUluZGV4ZXMgPSBmaW5kUG9zc2libGVJbmRleGVzKHNvdXJjZSwgW1xuICAgICAgbWV0ZW9ySW5zdGFsbE5hbWUsXG4gICAgXSk7XG4gIH1cblxuICB2aXNpdENhbGxFeHByZXNzaW9uKHBhdGgpIHtcbiAgICBjb25zdCBub2RlID0gcGF0aC5nZXRWYWx1ZSgpO1xuXG4gICAgaWYgKGhhc0lkV2l0aE5hbWUobm9kZS5jYWxsZWUsIHRoaXMubmFtZSkpIHtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuc291cmNlO1xuXG4gICAgICBmdW5jdGlvbiB3YWxrKHRyZWUsIGV4cHIpIHtcbiAgICAgICAgaWYgKGV4cHIudHlwZSAhPT0gXCJPYmplY3RFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gQnVmZmVyLmJ5dGVMZW5ndGgoc291cmNlLnNsaWNlKGV4cHIuc3RhcnQsIGV4cHIuZW5kKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cmVlID0gdHJlZSB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIGV4cHIucHJvcGVydGllcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgIGNvbnN0IGtleU5hbWUgPSBnZXRLZXlOYW1lKHByb3Aua2V5KTtcbiAgICAgICAgICBpZiAodHlwZW9mIGtleU5hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRyZWVba2V5TmFtZV0gPSB3YWxrKHRyZWVba2V5TmFtZV0sIHByb3AudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRyZWU7XG4gICAgICB9XG5cbiAgICAgIHdhbGsodGhpcy50cmVlLCBub2RlLmFyZ3VtZW50c1swXSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKHBhdGgpO1xuICAgIH1cbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGhhc0lkV2l0aE5hbWUobm9kZSwgbmFtZSkge1xuICBzd2l0Y2ggKG5vZGUgJiYgbm9kZS50eXBlKSB7XG4gIGNhc2UgXCJTZXF1ZW5jZUV4cHJlc3Npb25cIjpcbiAgICBjb25zdCBsYXN0ID0gbm9kZS5leHByZXNzaW9uc1tub2RlLmV4cHJlc3Npb25zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBoYXNJZFdpdGhOYW1lKGxhc3QsIG5hbWUpO1xuICBjYXNlIFwiTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgIHJldHVybiBoYXNJZFdpdGhOYW1lKG5vZGUucHJvcGVydHksIG5hbWUpO1xuICBjYXNlIFwiSWRlbnRpZmllclwiOlxuICAgIHJldHVybiBub2RlLm5hbWUgPT09IG5hbWU7XG4gIGRlZmF1bHQ6XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEtleU5hbWUoa2V5KSB7XG4gIGlmIChrZXkudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICByZXR1cm4ga2V5Lm5hbWU7XG4gIH1cblxuICBpZiAoa2V5LnR5cGUgPT09IFwiU3RyaW5nTGl0ZXJhbFwiIHx8XG4gICAgICBrZXkudHlwZSA9PT0gXCJMaXRlcmFsXCIpIHtcbiAgICByZXR1cm4ga2V5LnZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
