Package["core-runtime"].queue("ordered-dict",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OrderedDict;

var require = meteorInstall({"node_modules":{"meteor":{"ordered-dict":{"ordered_dict.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/ordered-dict/ordered_dict.js                                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.export({OrderedDict:()=>OrderedDict});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);
// This file defines an ordered dictionary abstraction that is useful for
// maintaining a dataset backed by observeChanges.  It supports ordering items
// by specifying the item they now come before.
// The implementation is a dictionary that contains nodes of a doubly-linked
// list as its values.
// constructs a new element struct
// next and prev are whole elements, not keys.
function element(key, value, next, prev) {
    return {
        key: key,
        value: value,
        next: next,
        prev: prev
    };
}
class OrderedDict {
    // the "prefix keys with a space" thing comes from here
    // https://github.com/documentcloud/underscore/issues/376#issuecomment-2815649
    _k(key) {
        return ` ${this._stringify(key)}`;
    }
    empty() {
        return !this._first;
    }
    size() {
        return this._size;
    }
    _linkEltIn(elt) {
        if (!elt.next) {
            elt.prev = this._last;
            if (this._last) this._last.next = elt;
            this._last = elt;
        } else {
            elt.prev = elt.next.prev;
            elt.next.prev = elt;
            if (elt.prev) elt.prev.next = elt;
        }
        if (this._first === null || this._first === elt.next) this._first = elt;
    }
    _linkEltOut(elt) {
        if (elt.next) elt.next.prev = elt.prev;
        if (elt.prev) elt.prev.next = elt.next;
        if (elt === this._last) this._last = elt.prev;
        if (elt === this._first) this._first = elt.next;
    }
    putBefore(key, item, before) {
        if (this._dict[this._k(key)]) throw new Error(`Item ${key} already present in OrderedDict`);
        const elt = before ? element(key, item, this._dict[this._k(before)]) : element(key, item, null);
        if (typeof elt.next === "undefined") throw new Error("could not find item to put this one before");
        this._linkEltIn(elt);
        this._dict[this._k(key)] = elt;
        this._size++;
    }
    append(key, item) {
        this.putBefore(key, item, null);
    }
    remove(key) {
        const elt = this._dict[this._k(key)];
        if (typeof elt === "undefined") throw new Error(`Item ${key} not present in OrderedDict`);
        this._linkEltOut(elt);
        this._size--;
        delete this._dict[this._k(key)];
        return elt.value;
    }
    get(key) {
        if (this.has(key)) {
            return this._dict[this._k(key)].value;
        }
    }
    has(key) {
        return Object.prototype.hasOwnProperty.call(this._dict, this._k(key));
    }
    // Iterate through the items in this dictionary in order, calling
    // iter(value, key, index) on each one.
    // Stops whenever iter returns OrderedDict.BREAK, or after the last element.
    forEach(iter, context = null) {
        let i = 0;
        let elt = this._first;
        while(elt !== null){
            const b = iter.call(context, elt.value, elt.key, i);
            if (b === OrderedDict.BREAK) return;
            elt = elt.next;
            i++;
        }
    }
    forEachAsync(asyncIter, context = null) {
        return _async_to_generator(function*() {
            let i = 0;
            let elt = this._first;
            while(elt !== null){
                const b = yield asyncIter.call(context, elt.value, elt.key, i);
                if (b === OrderedDict.BREAK) return;
                elt = elt.next;
                i++;
            }
        }).call(this);
    }
    first() {
        if (this.empty()) {
            return;
        }
        return this._first.key;
    }
    firstValue() {
        if (this.empty()) {
            return;
        }
        return this._first.value;
    }
    last() {
        if (this.empty()) {
            return;
        }
        return this._last.key;
    }
    lastValue() {
        if (this.empty()) {
            return;
        }
        return this._last.value;
    }
    prev(key) {
        if (this.has(key)) {
            const elt = this._dict[this._k(key)];
            if (elt.prev) return elt.prev.key;
        }
        return null;
    }
    next(key) {
        if (this.has(key)) {
            const elt = this._dict[this._k(key)];
            if (elt.next) return elt.next.key;
        }
        return null;
    }
    moveBefore(key, before) {
        const elt = this._dict[this._k(key)];
        const eltBefore = before ? this._dict[this._k(before)] : null;
        if (typeof elt === "undefined") {
            throw new Error("Item to move is not present");
        }
        if (typeof eltBefore === "undefined") {
            throw new Error("Could not find element to move this one before");
        }
        if (eltBefore === elt.next) // no moving necessary
        return;
        // remove from its old place
        this._linkEltOut(elt);
        // patch into its new place
        elt.next = eltBefore;
        this._linkEltIn(elt);
    }
    // Linear, sadly.
    indexOf(key) {
        let ret = null;
        this.forEach((v, k, i)=>{
            if (this._k(k) === this._k(key)) {
                ret = i;
                return OrderedDict.BREAK;
            }
            return;
        });
        return ret;
    }
    _checkRep() {
        Object.keys(this._dict).forEach((k)=>{
            const v = this._dict[k];
            if (v.next === v) {
                throw new Error("Next is a loop");
            }
            if (v.prev === v) {
                throw new Error("Prev is a loop");
            }
        });
    }
    constructor(...args){
        this._dict = Object.create(null);
        this._first = null;
        this._last = null;
        this._size = 0;
        if (typeof args[0] === "function") {
            this._stringify = args.shift();
        } else {
            this._stringify = function(x) {
                return x;
            };
        }
        args.forEach((kv)=>this.putBefore(kv[0], kv[1], null));
    }
}
OrderedDict.BREAK = {
    break: true
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      OrderedDict: OrderedDict
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ordered-dict/ordered_dict.js"
  ],
  mainModulePath: "/node_modules/meteor/ordered-dict/ordered_dict.js"
}});

//# sourceURL=meteor://💻app/packages/ordered-dict.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3JkZXJlZC1kaWN0L29yZGVyZWRfZGljdC5qcyJdLCJuYW1lcyI6WyJlbGVtZW50Iiwia2V5IiwidmFsdWUiLCJuZXh0IiwicHJldiIsIk9yZGVyZWREaWN0IiwiX2siLCJfc3RyaW5naWZ5IiwiZW1wdHkiLCJfZmlyc3QiLCJzaXplIiwiX3NpemUiLCJfbGlua0VsdEluIiwiZWx0IiwiX2xhc3QiLCJfbGlua0VsdE91dCIsInB1dEJlZm9yZSIsIml0ZW0iLCJiZWZvcmUiLCJfZGljdCIsIkVycm9yIiwiYXBwZW5kIiwicmVtb3ZlIiwiZ2V0IiwiaGFzIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiZm9yRWFjaCIsIml0ZXIiLCJjb250ZXh0IiwiaSIsImIiLCJCUkVBSyIsImZvckVhY2hBc3luYyIsImFzeW5jSXRlciIsImZpcnN0IiwiZmlyc3RWYWx1ZSIsImxhc3QiLCJsYXN0VmFsdWUiLCJtb3ZlQmVmb3JlIiwiZWx0QmVmb3JlIiwiaW5kZXhPZiIsInJldCIsInYiLCJrIiwiX2NoZWNrUmVwIiwia2V5cyIsImFyZ3MiLCJjcmVhdGUiLCJzaGlmdCIsIngiLCJrdiIsImJyZWFrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5RUFBeUU7QUFDekUsOEVBQThFO0FBQzlFLCtDQUErQztBQUUvQyw0RUFBNEU7QUFDNUUsc0JBQXNCO0FBRXRCLGtDQUFrQztBQUNsQyw4Q0FBOEM7QUFDOUMsU0FBU0EsUUFBUUMsR0FBRyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSTtJQUNyQyxPQUFPO1FBQ0xILEtBQUtBO1FBQ0xDLE9BQU9BO1FBQ1BDLE1BQU1BO1FBQ05DLE1BQU1BO0lBQ1I7QUFDRjtBQUVBLE9BQU8sTUFBTUM7SUFrQlgsdURBQXVEO0lBQ3ZELDhFQUE4RTtJQUM5RUMsR0FBR0wsR0FBRyxFQUFFO1FBQ04sT0FBTyxDQUFD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O1lBQ2pDLElBQUksQ0FBQzFDLFVBQVUsR0FBRzBDLEtBQUtFLEtBQUs7UUFDOUIsT0FBTztZQUNMLElBQUksQ0FBQzVDLFVBQVUsR0FBRyxTQUFVNkMsQ0FBQztnQkFDM0IsT0FBT0E7WUFDVDtRQUNGO1FBRUFILEtBQUtwQixPQUFPLENBQUMsQ0FBQ3dCLEtBQU8sSUFBSSxDQUFDckMsU0FBUyxDQUFDcUMsRUFBRSxDQUFDLEVBQUUsRUFBRUEsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNwRDtBQXNMRjtBQUVBaEQsWUFBWTZCLEtBQUssR0FBRztJQUFFb0IsT0FBTztBQUFLIiwiZmlsZSI6Ii9wYWNrYWdlcy9vcmRlcmVkLWRpY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgZGVmaW5lcyBhbiBvcmRlcmVkIGRpY3Rpb25hcnkgYWJzdHJhY3Rpb24gdGhhdCBpcyB1c2VmdWwgZm9yXG4vLyBtYWludGFpbmluZyBhIGRhdGFzZXQgYmFja2VkIGJ5IG9ic2VydmVDaGFuZ2VzLiAgSXQgc3VwcG9ydHMgb3JkZXJpbmcgaXRlbXNcbi8vIGJ5IHNwZWNpZnlpbmcgdGhlIGl0ZW0gdGhleSBub3cgY29tZSBiZWZvcmUuXG5cbi8vIFRoZSBpbXBsZW1lbnRhdGlvbiBpcyBhIGRpY3Rpb25hcnkgdGhhdCBjb250YWlucyBub2RlcyBvZiBhIGRvdWJseS1saW5rZWRcbi8vIGxpc3QgYXMgaXRzIHZhbHVlcy5cblxuLy8gY29uc3RydWN0cyBhIG5ldyBlbGVtZW50IHN0cnVjdFxuLy8gbmV4dCBhbmQgcHJldiBhcmUgd2hvbGUgZWxlbWVudHMsIG5vdCBrZXlzLlxuZnVuY3Rpb24gZWxlbWVudChrZXksIHZhbHVlLCBuZXh0LCBwcmV2KSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIG5leHQ6IG5leHQsXG4gICAgcHJldjogcHJldixcbiAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIE9yZGVyZWREaWN0IHtcbiAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgIHRoaXMuX2RpY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2ZpcnN0ID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0ID0gbnVsbDtcbiAgICB0aGlzLl9zaXplID0gMDtcblxuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLl9zdHJpbmdpZnkgPSBhcmdzLnNoaWZ0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0cmluZ2lmeSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBhcmdzLmZvckVhY2goKGt2KSA9PiB0aGlzLnB1dEJlZm9yZShrdlswXSwga3ZbMV0sIG51bGwpKTtcbiAgfVxuXG4gIC8vIHRoZSBcInByZWZpeCBrZXlzIHdpdGggYSBzcGFjZVwiIHRoaW5nIGNvbWVzIGZyb20gaGVyZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZG9jdW1lbnRjbG91ZC91bmRlcnNjb3JlL2lzc3Vlcy8zNzYjaXNzdWVjb21tZW50LTI4MTU2NDlcbiAgX2soa2V5KSB7XG4gICAgcmV0dXJuIGAgJHt0aGlzLl9zdHJpbmdpZnkoa2V5KX1gO1xuICB9XG5cbiAgZW1wdHkoKSB7XG4gICAgcmV0dXJuICF0aGlzLl9maXJzdDtcbiAgfVxuXG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemU7XG4gIH1cblxuICBfbGlua0VsdEluKGVsdCkge1xuICAgIGlmICghZWx0Lm5leHQpIHtcbiAgICAgIGVsdC5wcmV2ID0gdGhpcy5fbGFzdDtcbiAgICAgIGlmICh0aGlzLl9sYXN0KSB0aGlzLl9sYXN0Lm5leHQgPSBlbHQ7XG4gICAgICB0aGlzLl9sYXN0ID0gZWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICBlbHQucHJldiA9IGVsdC5uZXh0LnByZXY7XG4gICAgICBlbHQubmV4dC5wcmV2ID0gZWx0O1xuICAgICAgaWYgKGVsdC5wcmV2KSBlbHQucHJldi5uZXh0ID0gZWx0O1xuICAgIH1cbiAgICBpZiAodGhpcy5fZmlyc3QgPT09IG51bGwgfHwgdGhpcy5fZmlyc3QgPT09IGVsdC5uZXh0KSB0aGlzLl9maXJzdCA9IGVsdDtcbiAgfVxuXG4gIF9saW5rRWx0T3V0KGVsdCkge1xuICAgIGlmIChlbHQubmV4dCkgZWx0Lm5leHQucHJldiA9IGVsdC5wcmV2O1xuICAgIGlmIChlbHQucHJldikgZWx0LnByZXYubmV4dCA9IGVsdC5uZXh0O1xuICAgIGlmIChlbHQgPT09IHRoaXMuX2xhc3QpIHRoaXMuX2xhc3QgPSBlbHQucHJldjtcbiAgICBpZiAoZWx0ID09PSB0aGlzLl9maXJzdCkgdGhpcy5fZmlyc3QgPSBlbHQubmV4dDtcbiAgfVxuXG4gIHB1dEJlZm9yZShrZXksIGl0ZW0sIGJlZm9yZSkge1xuICAgIGlmICh0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV0pIHRocm93IG5ldyBFcnJvcihgSXRlbSAke2tleX0gYWxyZWFkeSBwcmVzZW50IGluIE9yZGVyZWREaWN0YCk7XG4gICAgY29uc3QgZWx0ID0gYmVmb3JlID8gZWxlbWVudChrZXksIGl0ZW0sIHRoaXMuX2RpY3RbdGhpcy5fayhiZWZvcmUpXSkgOiBlbGVtZW50KGtleSwgaXRlbSwgbnVsbCk7XG4gICAgaWYgKHR5cGVvZiBlbHQubmV4dCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImNvdWxkIG5vdCBmaW5kIGl0ZW0gdG8gcHV0IHRoaXMgb25lIGJlZm9yZVwiKTtcbiAgICB0aGlzLl9saW5rRWx0SW4oZWx0KTtcbiAgICB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV0gPSBlbHQ7XG4gICAgdGhpcy5fc2l6ZSsrO1xuICB9XG5cbiAgYXBwZW5kKGtleSwgaXRlbSkge1xuICAgIHRoaXMucHV0QmVmb3JlKGtleSwgaXRlbSwgbnVsbCk7XG4gIH1cblxuICByZW1vdmUoa2V5KSB7XG4gICAgY29uc3QgZWx0ID0gdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgIGlmICh0eXBlb2YgZWx0ID09PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgRXJyb3IoYEl0ZW0gJHtrZXl9IG5vdCBwcmVzZW50IGluIE9yZGVyZWREaWN0YCk7XG4gICAgdGhpcy5fbGlua0VsdE91dChlbHQpO1xuICAgIHRoaXMuX3NpemUtLTtcbiAgICBkZWxldGUgdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgIHJldHVybiBlbHQudmFsdWU7XG4gIH1cblxuICBnZXQoa2V5KSB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV0udmFsdWU7XG4gICAgfVxuICB9XG5cbiAgaGFzKGtleSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fZGljdCwgdGhpcy5fayhrZXkpKTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgaXRlbXMgaW4gdGhpcyBkaWN0aW9uYXJ5IGluIG9yZGVyLCBjYWxsaW5nXG4gIC8vIGl0ZXIodmFsdWUsIGtleSwgaW5kZXgpIG9uIGVhY2ggb25lLlxuXG4gIC8vIFN0b3BzIHdoZW5ldmVyIGl0ZXIgcmV0dXJucyBPcmRlcmVkRGljdC5CUkVBSywgb3IgYWZ0ZXIgdGhlIGxhc3QgZWxlbWVudC5cbiAgZm9yRWFjaChpdGVyLCBjb250ZXh0ID0gbnVsbCkge1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgZWx0ID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKGVsdCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgYiA9IGl0ZXIuY2FsbChjb250ZXh0LCBlbHQudmFsdWUsIGVsdC5rZXksIGkpO1xuICAgICAgaWYgKGIgPT09IE9yZGVyZWREaWN0LkJSRUFLKSByZXR1cm47XG4gICAgICBlbHQgPSBlbHQubmV4dDtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICBhc3luYyBmb3JFYWNoQXN5bmMoYXN5bmNJdGVyLCBjb250ZXh0ID0gbnVsbCkge1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgZWx0ID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKGVsdCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgYiA9IGF3YWl0IGFzeW5jSXRlci5jYWxsKGNvbnRleHQsIGVsdC52YWx1ZSwgZWx0LmtleSwgaSk7XG4gICAgICBpZiAoYiA9PT0gT3JkZXJlZERpY3QuQlJFQUspIHJldHVybjtcbiAgICAgIGVsdCA9IGVsdC5uZXh0O1xuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuXG4gIGZpcnN0KCkge1xuICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0LmtleTtcbiAgfVxuXG4gIGZpcnN0VmFsdWUoKSB7XG4gICAgaWYgKHRoaXMuZW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZmlyc3QudmFsdWU7XG4gIH1cblxuICBsYXN0KCkge1xuICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2xhc3Qua2V5O1xuICB9XG5cbiAgbGFzdFZhbHVlKCkge1xuICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2xhc3QudmFsdWU7XG4gIH1cblxuICBwcmV2KGtleSkge1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICBjb25zdCBlbHQgPSB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV07XG4gICAgICBpZiAoZWx0LnByZXYpIHJldHVybiBlbHQucHJldi5rZXk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbmV4dChrZXkpIHtcbiAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgZWx0ID0gdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgICAgaWYgKGVsdC5uZXh0KSByZXR1cm4gZWx0Lm5leHQua2V5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG1vdmVCZWZvcmUoa2V5LCBiZWZvcmUpIHtcbiAgICBjb25zdCBlbHQgPSB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV07XG4gICAgY29uc3QgZWx0QmVmb3JlID0gYmVmb3JlID8gdGhpcy5fZGljdFt0aGlzLl9rKGJlZm9yZSldIDogbnVsbDtcbiAgICBpZiAodHlwZW9mIGVsdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSXRlbSB0byBtb3ZlIGlzIG5vdCBwcmVzZW50XCIpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVsdEJlZm9yZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZpbmQgZWxlbWVudCB0byBtb3ZlIHRoaXMgb25lIGJlZm9yZVwiKTtcbiAgICB9XG4gICAgaWYgKGVsdEJlZm9yZSA9PT0gZWx0Lm5leHQpXG4gICAgICAvLyBubyBtb3ZpbmcgbmVjZXNzYXJ5XG4gICAgICByZXR1cm47XG4gICAgLy8gcmVtb3ZlIGZyb20gaXRzIG9sZCBwbGFjZVxuICAgIHRoaXMuX2xpbmtFbHRPdXQoZWx0KTtcbiAgICAvLyBwYXRjaCBpbnRvIGl0cyBuZXcgcGxhY2VcbiAgICBlbHQubmV4dCA9IGVsdEJlZm9yZTtcbiAgICB0aGlzLl9saW5rRWx0SW4oZWx0KTtcbiAgfVxuXG4gIC8vIExpbmVhciwgc2FkbHkuXG4gIGluZGV4T2Yoa2V5KSB7XG4gICAgbGV0IHJldCA9IG51bGw7XG4gICAgdGhpcy5mb3JFYWNoKCh2LCBrLCBpKSA9PiB7XG4gICAgICBpZiAodGhpcy5fayhrKSA9PT0gdGhpcy5fayhrZXkpKSB7XG4gICAgICAgIHJldCA9IGk7XG4gICAgICAgIHJldHVybiBPcmRlcmVkRGljdC5CUkVBSztcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgX2NoZWNrUmVwKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX2RpY3QpLmZvckVhY2goKGspID0+IHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLl9kaWN0W2tdO1xuICAgICAgaWYgKHYubmV4dCA9PT0gdikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZXh0IGlzIGEgbG9vcFwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh2LnByZXYgPT09IHYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJldiBpcyBhIGxvb3BcIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuT3JkZXJlZERpY3QuQlJFQUsgPSB7IGJyZWFrOiB0cnVlIH07XG4iXX0=
