Package["core-runtime"].queue("webapp-hashing",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var WebAppHashing;

var require = meteorInstall({"node_modules":{"meteor":{"webapp-hashing":{"webapp-hashing.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/webapp-hashing/webapp-hashing.js                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {let createHash;module.link("crypto",{createHash(v){createHash=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}

WebAppHashing = {};
// Calculate a hash of all the client resources downloaded by the
// browser, including the application HTML, runtime config, code, and
// static files.
//
// This hash *must* change if any resources seen by the browser
// change, and ideally *doesn't* change for any server-only changes
// (but the second is a performance enhancement, not a hard
// requirement).
WebAppHashing.calculateClientHash = function(manifest, includeFilter, runtimeConfigOverride) {
    const hash = createHash("sha1");
    // Omit the old hashed client values in the new hash. These may be
    // modified in the new boilerplate.
    const { autoupdateVersion: _av, autoupdateVersionRefreshable: _avr, autoupdateVersionCordova: _avc } = __meteor_runtime_config__, runtimeCfgBase = _object_without_properties(__meteor_runtime_config__, [
        "autoupdateVersion",
        "autoupdateVersionRefreshable",
        "autoupdateVersionCordova"
    ]);
    const runtimeCfg = runtimeConfigOverride || runtimeCfgBase;
    hash.update(JSON.stringify(runtimeCfg, "utf8"));
    manifest.forEach(function(resource) {
        if ((!includeFilter || includeFilter(resource.type, resource.replaceable)) && (resource.where === "client" || resource.where === "internal")) {
            hash.update(resource.path);
            hash.update(resource.hash);
        }
    });
    return hash.digest("hex");
};
WebAppHashing.calculateCordovaCompatibilityHash = function(platformVersion, pluginVersions) {
    const hash = createHash("sha1");
    hash.update(platformVersion);
    // Sort plugins first so iteration order doesn't affect the hash
    const plugins = Object.keys(pluginVersions).sort();
    for (const plugin of plugins){
        const version = pluginVersions[plugin];
        hash.update(plugin);
        hash.update(version);
    }
    return hash.digest("hex");
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      WebAppHashing: WebAppHashing
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/webapp-hashing/webapp-hashing.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/webapp-hashing.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvd2ViYXBwLWhhc2hpbmcvd2ViYXBwLWhhc2hpbmcuanMiXSwibmFtZXMiOlsiV2ViQXBwSGFzaGluZyIsImNhbGN1bGF0ZUNsaWVudEhhc2giLCJtYW5pZmVzdCIsImluY2x1ZGVGaWx0ZXIiLCJydW50aW1lQ29uZmlnT3ZlcnJpZGUiLCJoYXNoIiwiY3JlYXRlSGFzaCIsImF1dG91cGRhdGVWZXJzaW9uIiwiX2F2IiwiYXV0b3VwZGF0ZVZlcnNpb25SZWZyZXNoYWJsZSIsIl9hdnIiLCJhdXRvdXBkYXRlVmVyc2lvbkNvcmRvdmEiLCJfYXZjIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsInJ1bnRpbWVDZmdCYXNlIiwicnVudGltZUNmZyIsInVwZGF0ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJmb3JFYWNoIiwicmVzb3VyY2UiLCJ0eXBlIiwicmVwbGFjZWFibGUiLCJ3aGVyZSIsInBhdGgiLCJkaWdlc3QiLCJjYWxjdWxhdGVDb3Jkb3ZhQ29tcGF0aWJpbGl0eUhhc2giLCJwbGF0Zm9ybVZlcnNpb24iLCJwbHVnaW5WZXJzaW9ucyIsInBsdWdpbnMiLCJPYmplY3QiLCJrZXlzIiwic29ydCIsInBsdWdpbiIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQW9DO0FBRXBDQSxnQkFBZ0IsQ0FBQztBQUVqQixpRUFBaUU7QUFDakUscUVBQXFFO0FBQ3JFLGdCQUFnQjtBQUNoQixFQUFFO0FBQ0YsK0RBQStEO0FBQy9ELG1FQUFtRTtBQUNuRSwyREFBMkQ7QUFDM0QsZ0JBQWdCO0FBRWhCQSxjQUFjQyxtQkFBbUIsR0FBRyxTQUFVQyxRQUFRLEVBQUVDLGFBQWEsRUFBRUMscUJBQXFCO0lBQzFGLE1BQU1DLE9BQU9DLFdBQVc7SUFFeEIsa0VBQWtFO0lBQ2xFLG1DQUFtQztJQUNuQyxNQUFNLEVBQ0pDLG1CQUFtQkMsR0FBRyxFQUN0QkMsOEJBQThCQyxJQUFJLEVBQ2xDQywwQkFBMEJDLElBQUksRUFFL0IsR0FBR0MsMkJBRENDLDRDQUNERDtRQUpGTjtRQUNBRTtRQUNBRTs7SUFJRixNQUFNSSxhQUFhWCx5QkFBeUJVO0lBRTVDVCxLQUFLVyxNQUFNLENBQUNDLEtBQUtDLFNBQVMsQ0FBQ0gsWUFBWTtJQUV2Q2IsU0FBU2lCLE9BQU8sQ0FBQyxTQUFVQyxRQUFRO1FBQ2pDLElBQ0csRUFBQ2pCLGlCQUFpQkEsY0FBY2lCLFNBQVNDLElBQUksRUFBRUQsU0FBU0UsV0FBVyxNQUNuRUYsVUFBU0csS0FBSyxLQUFLLFlBQVlILFNBQVNHLEtBQUssS0FBSyxVQUFTLEdBQzVEO1lBQ0FsQixLQUFLVyxNQUFNLENBQUNJLFNBQVNJLElBQUk7WUFDekJuQixLQUFLVyxNQUFNLENBQUNJLFNBQVNmLElBQUk7UUFDM0I7SUFDRjtJQUNBLE9BQU9BLEtBQUtvQixNQUFNLENBQUM7QUFDckI7QUFFQXpCLGNBQWMwQixpQ0FBaUMsR0FBRyxTQUFVQyxlQUFlLEVBQUVDLGNBQWM7SUFDekYsTUFBTXZCLE9BQU9DLFdBQVc7SUFFeEJELEtBQUtXLE1BQU0sQ0FBQ1c7SUFFWixnRUFBZ0U7SUFDaEUsTUFBTUUsVUFBVUMsT0FBT0MsSUFBSSxDQUFDSCxnQkFBZ0JJLElBQUk7SUFDaEQsS0FBSyxNQUFNQyxVQUFVSixRQUFTO1FBQzVCLE1BQU1LLFVBQVVOLGNBQWMsQ0FBQ0ssT0FBTztRQUN0QzVCLEtBQUtXLE1BQU0sQ0FBQ2lCO1FBQ1o1QixLQUFLVyxNQUFNLENBQUNrQjtJQUNkO0lBRUEsT0FBTzdCLEtBQUtvQixNQUFNLENBQUM7QUFDckIiLCJmaWxlIjoiL3BhY2thZ2VzL3dlYmFwcC1oYXNoaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIjtcblxuV2ViQXBwSGFzaGluZyA9IHt9O1xuXG4vLyBDYWxjdWxhdGUgYSBoYXNoIG9mIGFsbCB0aGUgY2xpZW50IHJlc291cmNlcyBkb3dubG9hZGVkIGJ5IHRoZVxuLy8gYnJvd3NlciwgaW5jbHVkaW5nIHRoZSBhcHBsaWNhdGlvbiBIVE1MLCBydW50aW1lIGNvbmZpZywgY29kZSwgYW5kXG4vLyBzdGF0aWMgZmlsZXMuXG4vL1xuLy8gVGhpcyBoYXNoICptdXN0KiBjaGFuZ2UgaWYgYW55IHJlc291cmNlcyBzZWVuIGJ5IHRoZSBicm93c2VyXG4vLyBjaGFuZ2UsIGFuZCBpZGVhbGx5ICpkb2Vzbid0KiBjaGFuZ2UgZm9yIGFueSBzZXJ2ZXItb25seSBjaGFuZ2VzXG4vLyAoYnV0IHRoZSBzZWNvbmQgaXMgYSBwZXJmb3JtYW5jZSBlbmhhbmNlbWVudCwgbm90IGEgaGFyZFxuLy8gcmVxdWlyZW1lbnQpLlxuXG5XZWJBcHBIYXNoaW5nLmNhbGN1bGF0ZUNsaWVudEhhc2ggPSBmdW5jdGlvbiAobWFuaWZlc3QsIGluY2x1ZGVGaWx0ZXIsIHJ1bnRpbWVDb25maWdPdmVycmlkZSkge1xuICBjb25zdCBoYXNoID0gY3JlYXRlSGFzaChcInNoYTFcIik7XG5cbiAgLy8gT21pdCB0aGUgb2xkIGhhc2hlZCBjbGllbnQgdmFsdWVzIGluIHRoZSBuZXcgaGFzaC4gVGhlc2UgbWF5IGJlXG4gIC8vIG1vZGlmaWVkIGluIHRoZSBuZXcgYm9pbGVycGxhdGUuXG4gIGNvbnN0IHtcbiAgICBhdXRvdXBkYXRlVmVyc2lvbjogX2F2LFxuICAgIGF1dG91cGRhdGVWZXJzaW9uUmVmcmVzaGFibGU6IF9hdnIsXG4gICAgYXV0b3VwZGF0ZVZlcnNpb25Db3Jkb3ZhOiBfYXZjLFxuICAgIC4uLnJ1bnRpbWVDZmdCYXNlXG4gIH0gPSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fO1xuXG4gIGNvbnN0IHJ1bnRpbWVDZmcgPSBydW50aW1lQ29uZmlnT3ZlcnJpZGUgfHwgcnVudGltZUNmZ0Jhc2U7XG5cbiAgaGFzaC51cGRhdGUoSlNPTi5zdHJpbmdpZnkocnVudGltZUNmZywgXCJ1dGY4XCIpKTtcblxuICBtYW5pZmVzdC5mb3JFYWNoKGZ1bmN0aW9uIChyZXNvdXJjZSkge1xuICAgIGlmIChcbiAgICAgICghaW5jbHVkZUZpbHRlciB8fCBpbmNsdWRlRmlsdGVyKHJlc291cmNlLnR5cGUsIHJlc291cmNlLnJlcGxhY2VhYmxlKSkgJiZcbiAgICAgIChyZXNvdXJjZS53aGVyZSA9PT0gXCJjbGllbnRcIiB8fCByZXNvdXJjZS53aGVyZSA9PT0gXCJpbnRlcm5hbFwiKVxuICAgICkge1xuICAgICAgaGFzaC51cGRhdGUocmVzb3VyY2UucGF0aCk7XG4gICAgICBoYXNoLnVwZGF0ZShyZXNvdXJjZS5oYXNoKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gaGFzaC5kaWdlc3QoXCJoZXhcIik7XG59O1xuXG5XZWJBcHBIYXNoaW5nLmNhbGN1bGF0ZUNvcmRvdmFDb21wYXRpYmlsaXR5SGFzaCA9IGZ1bmN0aW9uIChwbGF0Zm9ybVZlcnNpb24sIHBsdWdpblZlcnNpb25zKSB7XG4gIGNvbnN0IGhhc2ggPSBjcmVhdGVIYXNoKFwic2hhMVwiKTtcblxuICBoYXNoLnVwZGF0ZShwbGF0Zm9ybVZlcnNpb24pO1xuXG4gIC8vIFNvcnQgcGx1Z2lucyBmaXJzdCBzbyBpdGVyYXRpb24gb3JkZXIgZG9lc24ndCBhZmZlY3QgdGhlIGhhc2hcbiAgY29uc3QgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHBsdWdpblZlcnNpb25zKS5zb3J0KCk7XG4gIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gcGx1Z2luVmVyc2lvbnNbcGx1Z2luXTtcbiAgICBoYXNoLnVwZGF0ZShwbHVnaW4pO1xuICAgIGhhc2gudXBkYXRlKHZlcnNpb24pO1xuICB9XG5cbiAgcmV0dXJuIGhhc2guZGlnZXN0KFwiaGV4XCIpO1xufTtcbiJdfQ==
