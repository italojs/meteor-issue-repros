Package["core-runtime"].queue("minifier-js",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Babel = Package['babel-compiler'].Babel;
var BabelCompiler = Package['babel-compiler'].BabelCompiler;
var SwcCompiler = Package['babel-compiler'].SwcCompiler;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var meteorJsMinify;

var require = meteorInstall({"node_modules":{"meteor":{"minifier-js":{"minifier.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/minifier-js/minifier.js                                                      //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
module.export({meteorJsMinify:()=>meteorJsMinify},true);function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
let terser;
const terserMinify = (source, options)=>_async_to_generator(function*() {
        terser = terser || Npm.require("terser");
        return yield terser.minify(source, options);
    })();
const meteorJsMinify = function(source) {
    return _async_to_generator(function*() {
        const result = {};
        const NODE_ENV = process.env.NODE_ENV || "development";
        const options = {
            compress: {
                drop_debugger: false,
                unused: false,
                dead_code: true,
                typeofs: false,
                global_defs: {
                    "process.env.NODE_ENV": NODE_ENV
                }
            },
            // Fix issue #9866, as explained in this comment:
            // https://github.com/mishoo/UglifyJS2/issues/1753#issuecomment-324814782
            // And fix terser issue #117: https://github.com/terser-js/terser/issues/117
            safari10: true
        };
        const terserResult = yield terserMinify(source, options);
        // this is kept to maintain backwards compatability
        result.code = terserResult.code;
        result.minifier = 'terser';
        return result;
    })();
};

///////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      meteorJsMinify: meteorJsMinify
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/minifier-js/minifier.js"
  ],
  mainModulePath: "/node_modules/meteor/minifier-js/minifier.js"
}});

//# sourceURL=meteor://💻app/packages/minifier-js.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaWZpZXItanMvbWluaWZpZXIuanMiXSwibmFtZXMiOlsidGVyc2VyIiwidGVyc2VyTWluaWZ5Iiwic291cmNlIiwib3B0aW9ucyIsIk5wbSIsInJlcXVpcmUiLCJtaW5pZnkiLCJtZXRlb3JKc01pbmlmeSIsInJlc3VsdCIsIk5PREVfRU5WIiwicHJvY2VzcyIsImVudiIsImNvbXByZXNzIiwiZHJvcF9kZWJ1Z2dlciIsInVudXNlZCIsImRlYWRfY29kZSIsInR5cGVvZnMiLCJnbG9iYWxfZGVmcyIsInNhZmFyaTEwIiwidGVyc2VyUmVzdWx0IiwiY29kZSIsIm1pbmlmaWVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUE7QUFFSixNQUFNQyxlQUFlLENBQU9DLFFBQVFDO1FBQ2xDSCxTQUFTQSxVQUFVSSxJQUFJQyxPQUFPLENBQUM7UUFDL0IsT0FBTyxNQUFNTCxPQUFPTSxNQUFNLENBQUNKLFFBQVFDO0lBQ3JDO0FBRUEsT0FBTyxNQUFNSSxpQkFBaUIsU0FBZ0JMLEVBQU07O1FBQ2xELE1BQU1NLFNBQVMsQ0FBQztRQUNoQixNQUFNQyxXQUFXQyxRQUFRQyxHQUFHLENBQUNGLFFBQVEsSUFBSTtRQUd6QyxNQUFNTixVQUFVO1lBQ2RTLFVBQVU7Z0JBQ1JDLGVBQWU7Z0JBQ2ZDLFFBQVE7Z0JBQ1JDLFdBQVc7Z0JBQ1hDLFNBQVM7Z0JBQ1RDLGFBQWE7b0JBQ1gsd0JBQXdCUjtnQkFDMUI7WUFDRjtZQUNBLGlEQUFpRDtZQUNqRCx5RUFBeUU7WUFDekUsNEVBQTRFO1lBQzVFUyxVQUFVO1FBQ1o7UUFFQSxNQUFNQyxlQUFlLE1BQU1sQixhQUFhQyxRQUFRQztRQUVoRCxtREFBbUQ7UUFDbkRLLE9BQU9ZLElBQUksR0FBR0QsYUFBYUMsSUFBSTtRQUMvQlosT0FBT2EsUUFBUSxHQUFHO1FBRWxCLE9BQU9iO0lBQ1Q7RUFBRSIsImZpbGUiOiIvcGFja2FnZXMvbWluaWZpZXItanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgdGVyc2VyO1xuXG5jb25zdCB0ZXJzZXJNaW5pZnkgPSBhc3luYyAoc291cmNlLCBvcHRpb25zKSA9PiB7XG4gIHRlcnNlciA9IHRlcnNlciB8fCBOcG0ucmVxdWlyZShcInRlcnNlclwiKTtcbiAgcmV0dXJuIGF3YWl0IHRlcnNlci5taW5pZnkoc291cmNlLCBvcHRpb25zKTtcbn07XG5cbmV4cG9ydCBjb25zdCBtZXRlb3JKc01pbmlmeSA9IGFzeW5jIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgY29uc3QgcmVzdWx0ID0ge307XG4gIGNvbnN0IE5PREVfRU5WID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgXCJkZXZlbG9wbWVudFwiO1xuXG5cbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjb21wcmVzczoge1xuICAgICAgZHJvcF9kZWJ1Z2dlcjogZmFsc2UsICAvLyByZW1vdmUgZGVidWdnZXI7IHN0YXRlbWVudHNcbiAgICAgIHVudXNlZDogZmFsc2UsICAgICAgICAgLy8gZHJvcCB1bnJlZmVyZW5jZWQgZnVuY3Rpb25zIGFuZCB2YXJpYWJsZXNcbiAgICAgIGRlYWRfY29kZTogdHJ1ZSwgICAgICAgLy8gcmVtb3ZlIHVucmVhY2hhYmxlIGNvZGVcbiAgICAgIHR5cGVvZnM6IGZhbHNlLCAgICAgICAgLy8gc2V0IHRvIGZhbHNlIGR1ZSB0byBrbm93biBpc3N1ZXMgaW4gSUUxMFxuICAgICAgZ2xvYmFsX2RlZnM6IHtcbiAgICAgICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBOT0RFX0VOVlxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gRml4IGlzc3VlICM5ODY2LCBhcyBleHBsYWluZWQgaW4gdGhpcyBjb21tZW50OlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9taXNob28vVWdsaWZ5SlMyL2lzc3Vlcy8xNzUzI2lzc3VlY29tbWVudC0zMjQ4MTQ3ODJcbiAgICAvLyBBbmQgZml4IHRlcnNlciBpc3N1ZSAjMTE3OiBodHRwczovL2dpdGh1Yi5jb20vdGVyc2VyLWpzL3RlcnNlci9pc3N1ZXMvMTE3XG4gICAgc2FmYXJpMTA6IHRydWUsICAgICAgICAgIC8vIHNldCB0aGlzIG9wdGlvbiB0byB0cnVlIHRvIHdvcmsgYXJvdW5kIHRoZSBTYWZhcmkgMTAvMTEgYXdhaXQgYnVnXG4gIH07XG5cbiAgY29uc3QgdGVyc2VyUmVzdWx0ID0gYXdhaXQgdGVyc2VyTWluaWZ5KHNvdXJjZSwgb3B0aW9ucyk7XG5cbiAgLy8gdGhpcyBpcyBrZXB0IHRvIG1haW50YWluIGJhY2t3YXJkcyBjb21wYXRhYmlsaXR5XG4gIHJlc3VsdC5jb2RlID0gdGVyc2VyUmVzdWx0LmNvZGU7XG4gIHJlc3VsdC5taW5pZmllciA9ICd0ZXJzZXInO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIl19
