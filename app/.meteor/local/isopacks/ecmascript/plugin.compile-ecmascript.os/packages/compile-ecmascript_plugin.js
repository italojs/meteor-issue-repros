Package["core-runtime"].queue("compile-ecmascript",function () {/* Imports */
var Babel = Package['babel-compiler'].Babel;
var BabelCompiler = Package['babel-compiler'].BabelCompiler;
var SwcCompiler = Package['babel-compiler'].SwcCompiler;
var ReactFastRefresh = Package['react-fast-refresh'].ReactFastRefresh;

(function(){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/compile-ecmascript/plugin.js                                     //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
Plugin.registerCompiler({
  extensions: ['js', 'jsx', 'mjs'],
}, function () {
  return new BabelCompiler({
    react: true
  }, (babelOptions, file) => {
    if (file.hmrAvailable()) {
      babelOptions.plugins = babelOptions.plugins || [];
      babelOptions.plugins.push(...ReactFastRefresh.getBabelPluginConfig());
    }
  });
});

///////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
return {

}});
