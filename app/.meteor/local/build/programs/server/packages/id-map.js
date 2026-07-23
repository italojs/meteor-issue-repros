Package["core-runtime"].queue("id-map",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var IdMap;

var require = meteorInstall({"node_modules":{"meteor":{"id-map":{"id-map.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// packages/id-map/id-map.js                                                               //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
module.export({IdMap:()=>IdMap});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);
class IdMap {
    // Some of these methods are designed to match methods on OrderedDict, since
    // (eg) ObserveMultiplex and _CachingChangeObserver use them interchangeably.
    // (Conceivably, this should be replaced with "UnorderedDict" with a specific
    // set of methods that overlap between the two.)
    get(id) {
        const key = this._idStringify(id);
        return this._map.get(key);
    }
    set(id, value) {
        const key = this._idStringify(id);
        this._map.set(key, value);
    }
    remove(id) {
        const key = this._idStringify(id);
        this._map.delete(key);
    }
    has(id) {
        const key = this._idStringify(id);
        return this._map.has(key);
    }
    empty() {
        return this._map.size === 0;
    }
    clear() {
        this._map.clear();
    }
    // Iterates over the items in the map. Return `false` to break the loop.
    forEach(iterator) {
        // don't use _.each, because we can't break out of it.
        for (const [key, value] of this._map){
            const breakIfFalse = iterator.call(null, value, this._idParse(key));
            if (breakIfFalse === false) {
                return;
            }
        }
    }
    forEachAsync(iterator) {
        return _async_to_generator(function*() {
            for (const [key, value] of this._map){
                const breakIfFalse = yield iterator.call(null, value, this._idParse(key));
                if (breakIfFalse === false) {
                    return;
                }
            }
        }).call(this);
    }
    size() {
        return this._map.size;
    }
    setDefault(id, def) {
        const key = this._idStringify(id);
        if (this._map.has(key)) {
            return this._map.get(key);
        }
        this._map.set(key, def);
        return def;
    }
    // Assumes that values are EJSON-cloneable, and that we don't need to clone
    // IDs (ie, that nobody is going to mutate an ObjectId).
    clone() {
        const clone = new IdMap(this._idStringify, this._idParse);
        // copy directly to avoid stringify/parse overhead
        this._map.forEach(function(value, key) {
            clone._map.set(key, EJSON.clone(value));
        });
        return clone;
    }
    constructor(idStringify, idParse){
        this._map = new Map();
        this._idStringify = idStringify || JSON.stringify;
        this._idParse = idParse || JSON.parse;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      IdMap: IdMap
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/id-map/id-map.js"
  ],
  mainModulePath: "/node_modules/meteor/id-map/id-map.js"
}});

//# sourceURL=meteor://💻app/packages/id-map.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvaWQtbWFwL2lkLW1hcC5qcyJdLCJuYW1lcyI6WyJJZE1hcCIsImdldCIsImlkIiwia2V5IiwiX2lkU3RyaW5naWZ5IiwiX21hcCIsInNldCIsInZhbHVlIiwicmVtb3ZlIiwiZGVsZXRlIiwiaGFzIiwiZW1wdHkiLCJzaXplIiwiY2xlYXIiLCJmb3JFYWNoIiwiaXRlcmF0b3IiLCJicmVha0lmRmFsc2UiLCJjYWxsIiwiX2lkUGFyc2UiLCJmb3JFYWNoQXN5bmMiLCJzZXREZWZhdWx0IiwiZGVmIiwiY2xvbmUiLCJFSlNPTiIsImlkU3RyaW5naWZ5IiwiaWRQYXJzZSIsIk1hcCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sTUFBTUE7SUFPWCw0RUFBNEU7SUFDNUUsNkVBQTZFO0lBQzdFLDZFQUE2RTtJQUM3RSxnREFBZ0Q7SUFFaERDLElBQUlDLEVBQUUsRUFBRTtRQUNOLE1BQU1DLE1BQU0sSUFBSSxDQUFDQyxZQUFZLENBQUNGO1FBQzlCLE9BQU8sSUFBSSxDQUFDRyxJQUFJLENBQUNKLEdBQUcsQ0FBQ0U7SUFDdkI7SUFFQUcsSUFBSUosRUFBRSxFQUFFSyxLQUFLLEVBQUU7UUFDYixNQUFNSixNQUFNLElBQUksQ0FBQ0MsWUFBWSxDQUFDRjtRQUM5QixJQUFJLENBQUNHLElBQUksQ0FBQ0MsR0FBRyxDQUFDSCxLQUFLSTtJQUNyQjtJQUVBQyxPQUFPTixFQUFFLEVBQUU7UUFDVCxNQUFNQyxNQUFNLElBQUksQ0FBQ0MsWUFBWSxDQUFDRjtRQUM5QixJQUFJLENBQUNHLElBQUksQ0FBQ0ksTUFBTSxDQUFDTjtJQUNuQjtJQUVBTyxJQUFJUixFQUFFLEVBQUU7UUFDTixNQUFNQyxNQUFNLElBQUksQ0FBQ0MsWUFBWSxDQUFDRjtRQUM5QixPQUFPLElBQUksQ0FBQ0csSUFBSSxDQUFDSyxHQUFHLENBQUNQO0lBQ3ZCO0lBRUFRLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQ04sSUFBSSxDQUFDTyxJQUFJLEtBQUs7SUFDNUI7SUFFQUMsUUFBUTtRQUNOLElBQUksQ0FBQ1IsSUFBSSxDQUFDUSxLQUFLO0lBQ2pCO0lBRUEsd0VBQXdFO0lBQ3hFQyxRQUFRQyxRQUFRLEVBQUU7UUFDaEIsc0RBQXNEO1FBQ3RELEtBQUssTUFBTSxDQUFDWixLQUFLSSxNQUFNLElBQUksSUFBSSxDQUFDRixJQUFJLENBQUU7WUFDcEMsTUFBTVcsZUFBZUQsU0FBU0UsSUFBSSxDQUFDLE1BQU1WLE9BQU8sSUFBSSxDQUFDVyxRQUFRLENBQUNmO1lBQzlELElBQUlhLGlCQUFpQixPQUFPO2dCQUMxQjtZQUNGO1FBQ0Y7SUFDRjtJQUVNRyxhQUFhSixRQUFROztZQUN6QixLQUFLLE1BQU0sQ0FBQ1osS0FBS0ksTUFBTSxJQUFJLElBQUksQ0FBQ0YsSUFBSSxDQUFFO2dCQUNwQyxNQUFNVyxlQUFlLE1BQU1ELFNBQVNFLElBQUksQ0FBQyxNQUFNVixPQUFPLElBQUksQ0FBQ1csUUFBUSxDQUFDZjtnQkFDcEUsSUFBSWEsaUJBQWlCLE9BQU87b0JBQzFCO2dCQUNGO1lBQ0Y7UUFDRjs7SUFFQUosT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDUCxJQUFJLENBQUNPLElBQUk7SUFDdkI7SUFFQVEsV0FBV2xCLEVBQUUsRUFBRW1CLEdBQUcsRUFBRTtRQUNsQixNQUFNbEIsTUFBTSxJQUFJLENBQUNDLFlBQVksQ0FBQ0Y7UUFDOUIsSUFBSSxJQUFJLENBQUNHLElBQUksQ0FBQ0ssR0FBRyxDQUFDUCxNQUFNO1lBQ3RCLE9BQU8sSUFBSSxDQUFDRSxJQUFJLENBQUNKLEdBQUcsQ0FBQ0U7UUFDdkI7UUFDQSxJQUFJLENBQUNFLElBQUksQ0FBQ0MsR0FBRyxDQUFDSCxLQUFLa0I7UUFDbkIsT0FBT0E7SUFDVDtJQUVBLDJFQUEyRTtJQUMzRSx3REFBd0Q7SUFDeERDLFFBQVE7UUFDTixNQUFNQSxRQUFRLElBQUl0QixNQUFNLElBQUksQ0FBQ0ksWUFBWSxFQUFFLElBQUksQ0FBQ2MsUUFBUTtRQUN4RCxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDYixJQUFJLENBQUNTLE9BQU8sQ0FBQyxTQUFVUCxLQUFLLEVBQUVKLEdBQUc7WUFDcENtQixNQUFNakIsSUFBSSxDQUFDQyxHQUFHLENBQUNILEtBQUtvQixNQUFNRCxLQUFLLENBQUNmO1FBQ2xDO1FBQ0EsT0FBT2U7SUFDVDtJQWpGQSxZQUFZRSxXQUFXLEVBQUVDLE9BQU8sQ0FBRTtRQUNoQyxJQUFJLENBQUNwQixJQUFJLEdBQUcsSUFBSXFCO1FBQ2hCLElBQUksQ0FBQ3RCLFlBQVksR0FBR29CLGVBQWVHLEtBQUtDLFNBQVM7UUFDakQsSUFBSSxDQUFDVixRQUFRLEdBQUdPLFdBQVdFLEtBQUtFLEtBQUs7SUFDdkM7QUE4RUYiLCJmaWxlIjoiL3BhY2thZ2VzL2lkLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBJZE1hcCB7XG4gIGNvbnN0cnVjdG9yKGlkU3RyaW5naWZ5LCBpZFBhcnNlKSB7XG4gICAgdGhpcy5fbWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lkU3RyaW5naWZ5ID0gaWRTdHJpbmdpZnkgfHwgSlNPTi5zdHJpbmdpZnk7XG4gICAgdGhpcy5faWRQYXJzZSA9IGlkUGFyc2UgfHwgSlNPTi5wYXJzZTtcbiAgfVxuXG4gIC8vIFNvbWUgb2YgdGhlc2UgbWV0aG9kcyBhcmUgZGVzaWduZWQgdG8gbWF0Y2ggbWV0aG9kcyBvbiBPcmRlcmVkRGljdCwgc2luY2VcbiAgLy8gKGVnKSBPYnNlcnZlTXVsdGlwbGV4IGFuZCBfQ2FjaGluZ0NoYW5nZU9ic2VydmVyIHVzZSB0aGVtIGludGVyY2hhbmdlYWJseS5cbiAgLy8gKENvbmNlaXZhYmx5LCB0aGlzIHNob3VsZCBiZSByZXBsYWNlZCB3aXRoIFwiVW5vcmRlcmVkRGljdFwiIHdpdGggYSBzcGVjaWZpY1xuICAvLyBzZXQgb2YgbWV0aG9kcyB0aGF0IG92ZXJsYXAgYmV0d2VlbiB0aGUgdHdvLilcblxuICBnZXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9pZFN0cmluZ2lmeShpZCk7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXQoa2V5KTtcbiAgfVxuXG4gIHNldChpZCwgdmFsdWUpIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9pZFN0cmluZ2lmeShpZCk7XG4gICAgdGhpcy5fbWFwLnNldChrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHJlbW92ZShpZCkge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuX2lkU3RyaW5naWZ5KGlkKTtcbiAgICB0aGlzLl9tYXAuZGVsZXRlKGtleSk7XG4gIH1cblxuICBoYXMoaWQpIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9pZFN0cmluZ2lmeShpZCk7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5oYXMoa2V5KTtcbiAgfVxuXG4gIGVtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuc2l6ZSA9PT0gMDtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX21hcC5jbGVhcigpO1xuICB9XG5cbiAgLy8gSXRlcmF0ZXMgb3ZlciB0aGUgaXRlbXMgaW4gdGhlIG1hcC4gUmV0dXJuIGBmYWxzZWAgdG8gYnJlYWsgdGhlIGxvb3AuXG4gIGZvckVhY2goaXRlcmF0b3IpIHtcbiAgICAvLyBkb24ndCB1c2UgXy5lYWNoLCBiZWNhdXNlIHdlIGNhbid0IGJyZWFrIG91dCBvZiBpdC5cbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLl9tYXApIHtcbiAgICAgIGNvbnN0IGJyZWFrSWZGYWxzZSA9IGl0ZXJhdG9yLmNhbGwobnVsbCwgdmFsdWUsIHRoaXMuX2lkUGFyc2Uoa2V5KSk7XG4gICAgICBpZiAoYnJlYWtJZkZhbHNlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZm9yRWFjaEFzeW5jKGl0ZXJhdG9yKSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5fbWFwKSB7XG4gICAgICBjb25zdCBicmVha0lmRmFsc2UgPSBhd2FpdCBpdGVyYXRvci5jYWxsKG51bGwsIHZhbHVlLCB0aGlzLl9pZFBhcnNlKGtleSkpO1xuICAgICAgaWYgKGJyZWFrSWZGYWxzZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5zaXplO1xuICB9XG5cbiAgc2V0RGVmYXVsdChpZCwgZGVmKSB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5faWRTdHJpbmdpZnkoaWQpO1xuICAgIGlmICh0aGlzLl9tYXAuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KGtleSk7XG4gICAgfVxuICAgIHRoaXMuX21hcC5zZXQoa2V5LCBkZWYpO1xuICAgIHJldHVybiBkZWY7XG4gIH1cblxuICAvLyBBc3N1bWVzIHRoYXQgdmFsdWVzIGFyZSBFSlNPTi1jbG9uZWFibGUsIGFuZCB0aGF0IHdlIGRvbid0IG5lZWQgdG8gY2xvbmVcbiAgLy8gSURzIChpZSwgdGhhdCBub2JvZHkgaXMgZ29pbmcgdG8gbXV0YXRlIGFuIE9iamVjdElkKS5cbiAgY2xvbmUoKSB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSWRNYXAodGhpcy5faWRTdHJpbmdpZnksIHRoaXMuX2lkUGFyc2UpO1xuICAgIC8vIGNvcHkgZGlyZWN0bHkgdG8gYXZvaWQgc3RyaW5naWZ5L3BhcnNlIG92ZXJoZWFkXG4gICAgdGhpcy5fbWFwLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGNsb25lLl9tYXAuc2V0KGtleSwgRUpTT04uY2xvbmUodmFsdWUpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cbn1cbiJdfQ==
