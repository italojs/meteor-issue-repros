Package["core-runtime"].queue("caching-html-compiler",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var CachingCompiler = Package['caching-compiler'].CachingCompiler;
var MultiFileCachingCompiler = Package['caching-compiler'].MultiFileCachingCompiler;
var ECMAScript = Package.ecmascript.ECMAScript;
var TemplatingTools = Package['templating-tools'].TemplatingTools;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var CachingHtmlCompiler;

var require = meteorInstall({"node_modules":{"meteor":{"caching-html-compiler":{"caching-html-compiler.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/caching-html-compiler/caching-html-compiler.js                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();/* global TemplatingTools CachingCompiler */ // eslint-disable-next-line import/no-unresolved

const { path } = Plugin;
// The CompileResult type for this CachingCompiler is the return value of
// htmlScanner.scan: a {js, head, body, bodyAttrs} object.
// eslint-disable-next-line no-undef
CachingHtmlCompiler = class CachingHtmlCompiler1 extends CachingCompiler {
    // Implements method from CachingCompilerBase
    // eslint-disable-next-line class-methods-use-this
    compileResultSize(compileResult) {
        const lengthOrZero = (field)=>field ? field.length : 0;
        const headSize = lengthOrZero(compileResult.head);
        const bodySize = lengthOrZero(compileResult.body);
        const jsSize = lengthOrZero(compileResult.js);
        return headSize + bodySize + jsSize;
    }
    // Overrides method from CachingCompiler
    processFilesForTarget(inputFiles) {
        this._bodyAttrInfo = {};
        return super.processFilesForTarget(inputFiles);
    }
    // Implements method from CachingCompilerBase
    // eslint-disable-next-line class-methods-use-this
    getCacheKey(inputFile) {
        // Note: the path is only used for errors, so it doesn't have to be part
        // of the cache key.
        return [
            inputFile.getArch(),
            inputFile.getSourceHash(),
            inputFile.hmrAvailable && inputFile.hmrAvailable()
        ];
    }
    // Implements method from CachingCompiler
    compileOneFile(inputFile) {
        const contents = inputFile.getContentsAsString();
        const inputPath = inputFile.getPathInPackage();
        try {
            const tags = this.tagScannerFunc({
                sourceName: inputPath,
                contents,
                tagNames: [
                    'body',
                    'head',
                    'template'
                ]
            });
            return this.tagHandlerFunc(tags, inputFile.hmrAvailable && inputFile.hmrAvailable());
        } catch (e) {
            if (e instanceof TemplatingTools.CompileError) {
                inputFile.error({
                    message: e.message,
                    line: e.line
                });
                return null;
            }
            throw e;
        }
    }
    // Implements method from CachingCompilerBase
    addCompileResult(inputFile, compileResult) {
        let allJavaScript = '';
        if (compileResult.head) {
            inputFile.addHtml({
                section: 'head',
                data: compileResult.head
            });
        }
        if (compileResult.body) {
            inputFile.addHtml({
                section: 'body',
                data: compileResult.body
            });
        }
        if (compileResult.js) {
            allJavaScript += compileResult.js;
        }
        if (!isEmpty(compileResult.bodyAttrs)) {
            Object.keys(compileResult.bodyAttrs).forEach((attr)=>{
                const value = compileResult.bodyAttrs[attr];
                if (Object.prototype.hasOwnProperty.call(this._bodyAttrInfo, attr) && this._bodyAttrInfo[attr].value !== value) {
                    // two conflicting attributes on <body> tags in two different template
                    // files
                    inputFile.error({
                        message: `${`<body> declarations have conflicting values for the '${attr}' ` + 'attribute in the following files: '}${this._bodyAttrInfo[attr].inputFile.getPathInPackage()}, ${inputFile.getPathInPackage()}`
                    });
                } else {
                    this._bodyAttrInfo[attr] = {
                        inputFile,
                        value
                    };
                }
            });
            // Add JavaScript code to set attributes on body
            allJavaScript += `Meteor.startup(function() {
  var attrs = ${JSON.stringify(compileResult.bodyAttrs)};
  for (var prop in attrs) {
    document.body.setAttribute(prop, attrs[prop]);
  }
});
`;
        }
        if (allJavaScript) {
            const filePath = inputFile.getPathInPackage();
            // XXX this path manipulation may be unnecessarily complex
            let pathPart = path.dirname(filePath);
            if (pathPart === '.') pathPart = '';
            if (pathPart.length && pathPart !== path.sep) pathPart += path.sep;
            const ext = path.extname(filePath);
            const basename = path.basename(filePath, ext);
            // XXX generate a source map
            inputFile.addJavaScript({
                path: path.join(pathPart, `template.${basename}.js`),
                data: allJavaScript
            });
        }
    }
    /**
   * Constructor for CachingHtmlCompiler
   * @param  {String} name The name of the compiler, printed in errors -
   * should probably always be the same as the name of the build
   * plugin/package
   * @param  {Function} tagScannerFunc Transforms a template file (commonly
   * .html) into an array of Tags
   * @param  {Function} tagHandlerFunc Transforms an array of tags into a
   * results object with js, body, head, and bodyAttrs properties
   */ constructor(name, tagScannerFunc, tagHandlerFunc){
        super({
            compilerName: name,
            defaultCacheSize: 1024 * 1024 * 10
        });
        this._bodyAttrInfo = null;
        this.tagScannerFunc = tagScannerFunc;
        this.tagHandlerFunc = tagHandlerFunc;
    }
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/caching-html-compiler/node_modules/lodash.isempty/package.json                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/caching-html-compiler/node_modules/lodash.isempty/index.js                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      CachingHtmlCompiler: CachingHtmlCompiler
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/caching-html-compiler/caching-html-compiler.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/caching-html-compiler.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvY2FjaGluZy1odG1sLWNvbXBpbGVyL2NhY2hpbmctaHRtbC1jb21waWxlci5qcyJdLCJuYW1lcyI6WyJwYXRoIiwiUGx1Z2luIiwiQ2FjaGluZ0h0bWxDb21waWxlciIsIkNhY2hpbmdDb21waWxlciIsImNvbXBpbGVSZXN1bHRTaXplIiwiY29tcGlsZVJlc3VsdCIsImxlbmd0aE9yWmVybyIsImZpZWxkIiwibGVuZ3RoIiwiaGVhZFNpemUiLCJoZWFkIiwiYm9keVNpemUiLCJib2R5IiwianNTaXplIiwianMiLCJwcm9jZXNzRmlsZXNGb3JUYXJnZXQiLCJpbnB1dEZpbGVzIiwiX2JvZHlBdHRySW5mbyIsImdldENhY2hlS2V5IiwiaW5wdXRGaWxlIiwiZ2V0QXJjaCIsImdldFNvdXJjZUhhc2giLCJobXJBdmFpbGFibGUiLCJjb21waWxlT25lRmlsZSIsImNvbnRlbnRzIiwiZ2V0Q29udGVudHNBc1N0cmluZyIsImlucHV0UGF0aCIsImdldFBhdGhJblBhY2thZ2UiLCJ0YWdzIiwidGFnU2Nhbm5lckZ1bmMiLCJzb3VyY2VOYW1lIiwidGFnTmFtZXMiLCJ0YWdIYW5kbGVyRnVuYyIsImUiLCJUZW1wbGF0aW5nVG9vbHMiLCJDb21waWxlRXJyb3IiLCJlcnJvciIsIm1lc3NhZ2UiLCJsaW5lIiwiYWRkQ29tcGlsZVJlc3VsdCIsImFsbEphdmFTY3JpcHQiLCJhZGRIdG1sIiwic2VjdGlvbiIsImRhdGEiLCJpc0VtcHR5IiwiYm9keUF0dHJzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJhdHRyIiwidmFsdWUiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJKU09OIiwic3RyaW5naWZ5IiwiZmlsZVBhdGgiLCJwYXRoUGFydCIsImRpcm5hbWUiLCJzZXAiLCJleHQiLCJleHRuYW1lIiwiYmFzZW5hbWUiLCJhZGRKYXZhU2NyaXB0Iiwiam9pbiIsIm5hbWUiLCJjb21waWxlck5hbWUi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YSxHQUFHO1FBRXJCLElBQUksQ0FBQ1ksY0FBYyxHQUFHQTtRQUN0QixJQUFJLENBQUNHLGNBQWMsR0FBR0E7SUFDeEI7QUFzSEYiLCJmaWxlIjoiL3BhY2thZ2VzL2NhY2hpbmctaHRtbC1jb21waWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBUZW1wbGF0aW5nVG9vbHMgQ2FjaGluZ0NvbXBpbGVyICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVucmVzb2x2ZWRcbmltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcblxuY29uc3QgeyBwYXRoIH0gPSBQbHVnaW47XG5cbi8vIFRoZSBDb21waWxlUmVzdWx0IHR5cGUgZm9yIHRoaXMgQ2FjaGluZ0NvbXBpbGVyIGlzIHRoZSByZXR1cm4gdmFsdWUgb2Zcbi8vIGh0bWxTY2FubmVyLnNjYW46IGEge2pzLCBoZWFkLCBib2R5LCBib2R5QXR0cnN9IG9iamVjdC5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuQ2FjaGluZ0h0bWxDb21waWxlciA9IGNsYXNzIENhY2hpbmdIdG1sQ29tcGlsZXIgZXh0ZW5kcyBDYWNoaW5nQ29tcGlsZXIge1xuICAvKipcbiAgICogQ29uc3RydWN0b3IgZm9yIENhY2hpbmdIdG1sQ29tcGlsZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb21waWxlciwgcHJpbnRlZCBpbiBlcnJvcnMgLVxuICAgKiBzaG91bGQgcHJvYmFibHkgYWx3YXlzIGJlIHRoZSBzYW1lIGFzIHRoZSBuYW1lIG9mIHRoZSBidWlsZFxuICAgKiBwbHVnaW4vcGFja2FnZVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gdGFnU2Nhbm5lckZ1bmMgVHJhbnNmb3JtcyBhIHRlbXBsYXRlIGZpbGUgKGNvbW1vbmx5XG4gICAqIC5odG1sKSBpbnRvIGFuIGFycmF5IG9mIFRhZ3NcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IHRhZ0hhbmRsZXJGdW5jIFRyYW5zZm9ybXMgYW4gYXJyYXkgb2YgdGFncyBpbnRvIGFcbiAgICogcmVzdWx0cyBvYmplY3Qgd2l0aCBqcywgYm9keSwgaGVhZCwgYW5kIGJvZHlBdHRycyBwcm9wZXJ0aWVzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihuYW1lLCB0YWdTY2FubmVyRnVuYywgdGFnSGFuZGxlckZ1bmMpIHtcbiAgICBzdXBlcih7XG4gICAgICBjb21waWxlck5hbWU6IG5hbWUsXG4gICAgICBkZWZhdWx0Q2FjaGVTaXplOiAxMDI0ICogMTAyNCAqIDEwLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fYm9keUF0dHJJbmZvID0gbnVsbDtcblxuICAgIHRoaXMudGFnU2Nhbm5lckZ1bmMgPSB0YWdTY2FubmVyRnVuYztcbiAgICB0aGlzLnRhZ0hhbmRsZXJGdW5jID0gdGFnSGFuZGxlckZ1bmM7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRzIG1ldGhvZCBmcm9tIENhY2hpbmdDb21waWxlckJhc2VcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgY29tcGlsZVJlc3VsdFNpemUoY29tcGlsZVJlc3VsdCkge1xuICAgIGNvbnN0IGxlbmd0aE9yWmVybyA9IChmaWVsZCkgPT4gZmllbGQgPyBmaWVsZC5sZW5ndGggOiAwO1xuICAgIGNvbnN0IGhlYWRTaXplID0gbGVuZ3RoT3JaZXJvKGNvbXBpbGVSZXN1bHQuaGVhZCk7XG4gICAgY29uc3QgYm9keVNpemUgPSBsZW5ndGhPclplcm8oY29tcGlsZVJlc3VsdC5ib2R5KTtcbiAgICBjb25zdCBqc1NpemUgPSBsZW5ndGhPclplcm8oY29tcGlsZVJlc3VsdC5qcyk7XG4gICAgcmV0dXJuIGhlYWRTaXplICsgYm9keVNpemUgKyBqc1NpemU7XG4gIH1cblxuICAvLyBPdmVycmlkZXMgbWV0aG9kIGZyb20gQ2FjaGluZ0NvbXBpbGVyXG4gIHByb2Nlc3NGaWxlc0ZvclRhcmdldChpbnB1dEZpbGVzKSB7XG4gICAgdGhpcy5fYm9keUF0dHJJbmZvID0ge307XG4gICAgcmV0dXJuIHN1cGVyLnByb2Nlc3NGaWxlc0ZvclRhcmdldChpbnB1dEZpbGVzKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudHMgbWV0aG9kIGZyb20gQ2FjaGluZ0NvbXBpbGVyQmFzZVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBnZXRDYWNoZUtleShpbnB1dEZpbGUpIHtcbiAgICAvLyBOb3RlOiB0aGUgcGF0aCBpcyBvbmx5IHVzZWQgZm9yIGVycm9ycywgc28gaXQgZG9lc24ndCBoYXZlIHRvIGJlIHBhcnRcbiAgICAvLyBvZiB0aGUgY2FjaGUga2V5LlxuICAgIHJldHVybiBbXG4gICAgICBpbnB1dEZpbGUuZ2V0QXJjaCgpLFxuICAgICAgaW5wdXRGaWxlLmdldFNvdXJjZUhhc2goKSxcbiAgICAgIGlucHV0RmlsZS5obXJBdmFpbGFibGUgJiYgaW5wdXRGaWxlLmhtckF2YWlsYWJsZSgpLFxuICAgIF07XG4gIH1cblxuICAvLyBJbXBsZW1lbnRzIG1ldGhvZCBmcm9tIENhY2hpbmdDb21waWxlclxuICBjb21waWxlT25lRmlsZShpbnB1dEZpbGUpIHtcbiAgICBjb25zdCBjb250ZW50cyA9IGlucHV0RmlsZS5nZXRDb250ZW50c0FzU3RyaW5nKCk7XG4gICAgY29uc3QgaW5wdXRQYXRoID0gaW5wdXRGaWxlLmdldFBhdGhJblBhY2thZ2UoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGFncyA9IHRoaXMudGFnU2Nhbm5lckZ1bmMoe1xuICAgICAgICBzb3VyY2VOYW1lOiBpbnB1dFBhdGgsXG4gICAgICAgIGNvbnRlbnRzLFxuICAgICAgICB0YWdOYW1lczogWydib2R5JywgJ2hlYWQnLCAndGVtcGxhdGUnXSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy50YWdIYW5kbGVyRnVuYyh0YWdzLCBpbnB1dEZpbGUuaG1yQXZhaWxhYmxlICYmIGlucHV0RmlsZS5obXJBdmFpbGFibGUoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBUZW1wbGF0aW5nVG9vbHMuQ29tcGlsZUVycm9yKSB7XG4gICAgICAgIGlucHV0RmlsZS5lcnJvcih7XG4gICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxuICAgICAgICAgIGxpbmU6IGUubGluZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEltcGxlbWVudHMgbWV0aG9kIGZyb20gQ2FjaGluZ0NvbXBpbGVyQmFzZVxuICBhZGRDb21waWxlUmVzdWx0KGlucHV0RmlsZSwgY29tcGlsZVJlc3VsdCkge1xuICAgIGxldCBhbGxKYXZhU2NyaXB0ID0gJyc7XG5cbiAgICBpZiAoY29tcGlsZVJlc3VsdC5oZWFkKSB7XG4gICAgICBpbnB1dEZpbGUuYWRkSHRtbCh7IHNlY3Rpb246ICdoZWFkJywgZGF0YTogY29tcGlsZVJlc3VsdC5oZWFkIH0pO1xuICAgIH1cblxuICAgIGlmIChjb21waWxlUmVzdWx0LmJvZHkpIHtcbiAgICAgIGlucHV0RmlsZS5hZGRIdG1sKHsgc2VjdGlvbjogJ2JvZHknLCBkYXRhOiBjb21waWxlUmVzdWx0LmJvZHkgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbXBpbGVSZXN1bHQuanMpIHtcbiAgICAgIGFsbEphdmFTY3JpcHQgKz0gY29tcGlsZVJlc3VsdC5qcztcbiAgICB9XG5cbiAgICBpZiAoIWlzRW1wdHkoY29tcGlsZVJlc3VsdC5ib2R5QXR0cnMpKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb21waWxlUmVzdWx0LmJvZHlBdHRycykuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGNvbXBpbGVSZXN1bHQuYm9keUF0dHJzW2F0dHJdO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2JvZHlBdHRySW5mbywgYXR0cikgJiZcbiAgICAgICAgICAgIHRoaXMuX2JvZHlBdHRySW5mb1thdHRyXS52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAvLyB0d28gY29uZmxpY3RpbmcgYXR0cmlidXRlcyBvbiA8Ym9keT4gdGFncyBpbiB0d28gZGlmZmVyZW50IHRlbXBsYXRlXG4gICAgICAgICAgLy8gZmlsZXNcbiAgICAgICAgICBpbnB1dEZpbGUuZXJyb3Ioe1xuICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgIGAke2A8Ym9keT4gZGVjbGFyYXRpb25zIGhhdmUgY29uZmxpY3RpbmcgdmFsdWVzIGZvciB0aGUgJyR7YXR0cn0nIGAgK1xuICAgICAgICAgICAgICAnYXR0cmlidXRlIGluIHRoZSBmb2xsb3dpbmcgZmlsZXM6ICd9JHtcbiAgICAgICAgICAgICAgdGhpcy5fYm9keUF0dHJJbmZvW2F0dHJdLmlucHV0RmlsZS5nZXRQYXRoSW5QYWNrYWdlKClcbiAgICAgICAgICAgICAgfSwgJHtpbnB1dEZpbGUuZ2V0UGF0aEluUGFja2FnZSgpfWAsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYm9keUF0dHJJbmZvW2F0dHJdID0geyBpbnB1dEZpbGUsIHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgSmF2YVNjcmlwdCBjb2RlIHRvIHNldCBhdHRyaWJ1dGVzIG9uIGJvZHlcbiAgICAgIGFsbEphdmFTY3JpcHQgKz1cbmBNZXRlb3Iuc3RhcnR1cChmdW5jdGlvbigpIHtcbiAgdmFyIGF0dHJzID0gJHtKU09OLnN0cmluZ2lmeShjb21waWxlUmVzdWx0LmJvZHlBdHRycyl9O1xuICBmb3IgKHZhciBwcm9wIGluIGF0dHJzKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cnNbcHJvcF0pO1xuICB9XG59KTtcbmA7XG4gICAgfVxuXG5cbiAgICBpZiAoYWxsSmF2YVNjcmlwdCkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBpbnB1dEZpbGUuZ2V0UGF0aEluUGFja2FnZSgpO1xuICAgICAgLy8gWFhYIHRoaXMgcGF0aCBtYW5pcHVsYXRpb24gbWF5IGJlIHVubmVjZXNzYXJpbHkgY29tcGxleFxuICAgICAgbGV0IHBhdGhQYXJ0ID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgIGlmIChwYXRoUGFydCA9PT0gJy4nKSBwYXRoUGFydCA9ICcnO1xuICAgICAgaWYgKHBhdGhQYXJ0Lmxlbmd0aCAmJiBwYXRoUGFydCAhPT0gcGF0aC5zZXApIHBhdGhQYXJ0ICs9IHBhdGguc2VwO1xuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCwgZXh0KTtcblxuICAgICAgLy8gWFhYIGdlbmVyYXRlIGEgc291cmNlIG1hcFxuXG4gICAgICBpbnB1dEZpbGUuYWRkSmF2YVNjcmlwdCh7XG4gICAgICAgIHBhdGg6IHBhdGguam9pbihwYXRoUGFydCwgYHRlbXBsYXRlLiR7YmFzZW5hbWV9LmpzYCksXG4gICAgICAgIGRhdGE6IGFsbEphdmFTY3JpcHQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG4iXX0=
