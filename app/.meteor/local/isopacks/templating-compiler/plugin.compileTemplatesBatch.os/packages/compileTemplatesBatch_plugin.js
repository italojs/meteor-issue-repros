Package["core-runtime"].queue("compileTemplatesBatch",function () {/* Imports */
var ECMAScript = Package.ecmascript.ECMAScript;
var CachingHtmlCompiler = Package['caching-html-compiler'].CachingHtmlCompiler;
var TemplatingTools = Package['templating-tools'].TemplatingTools;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"compileTemplatesBatch":{"compile-templates.js":function module(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/compileTemplatesBatch/compile-templates.js                     //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
/* global CachingHtmlCompiler TemplatingTools */ Plugin.registerCompiler({
    extensions: [
        'html'
    ],
    archMatching: 'web',
    isTemplate: true
}, ()=>new CachingHtmlCompiler('templating', TemplatingTools.scanHtmlForTags, TemplatingTools.compileTagsWithSpacebars));

/////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/compileTemplatesBatch/compile-templates.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/compileTemplatesBatch_plugin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvY29tcGlsZVRlbXBsYXRlc0JhdGNoL2NvbXBpbGUtdGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlZ2lzdGVyQ29tcGlsZXIiLCJleHRlbnNpb25zIiwiYXJjaE1hdGNoaW5nIiwiaXNUZW1wbGF0ZSIsIkNhY2hpbmdIdG1sQ29tcGlsZXIiLCJUZW1wbGF0aW5nVG9vbHMiLCJzY2FuSHRtbEZvclRhZ3MiLCJjb21waWxlVGFnc1dpdGhTcGFjZWJhcnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUE4QyxHQUM5Q0EsT0FBT0MsZ0JBQWdCLENBQUM7SUFDdEJDLFlBQVk7UUFBQztLQUFPO0lBQ3BCQyxjQUFjO0lBQ2RDLFlBQVk7QUFDZCxHQUFHLElBQU0sSUFBSUMsb0JBQ1gsY0FDQUMsZ0JBQWdCQyxlQUFlLEVBQy9CRCxnQkFBZ0JFLHdCQUF3QiIsImZpbGUiOiIvcGFja2FnZXMvY29tcGlsZVRlbXBsYXRlc0JhdGNoX3BsdWdpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBDYWNoaW5nSHRtbENvbXBpbGVyIFRlbXBsYXRpbmdUb29scyAqL1xuUGx1Z2luLnJlZ2lzdGVyQ29tcGlsZXIoe1xuICBleHRlbnNpb25zOiBbJ2h0bWwnXSxcbiAgYXJjaE1hdGNoaW5nOiAnd2ViJyxcbiAgaXNUZW1wbGF0ZTogdHJ1ZSxcbn0sICgpID0+IG5ldyBDYWNoaW5nSHRtbENvbXBpbGVyKFxuICAndGVtcGxhdGluZycsXG4gIFRlbXBsYXRpbmdUb29scy5zY2FuSHRtbEZvclRhZ3MsXG4gIFRlbXBsYXRpbmdUb29scy5jb21waWxlVGFnc1dpdGhTcGFjZWJhcnNcbikpO1xuIl19
