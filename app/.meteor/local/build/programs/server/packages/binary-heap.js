Package["core-runtime"].queue("binary-heap",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var IdMap = Package['id-map'].IdMap;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MaxHeap, MinHeap, MinMaxHeap;

var require = meteorInstall({"node_modules":{"meteor":{"binary-heap":{"binary-heap.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/binary-heap/binary-heap.js                                                                               //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.link("./max-heap.js",{MaxHeap:"MaxHeap"},0);module.link("./min-heap.js",{MinHeap:"MinHeap"},1);module.link("./min-max-heap.js",{MinMaxHeap:"MinMaxHeap"},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();


//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"max-heap.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/binary-heap/max-heap.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({MaxHeap:()=>MaxHeap});// Constructor of Heap
// - comparator - Function - given two items returns a number
// - options:
//   - initData - Array - Optional - the initial data in a format:
//        Object:
//          - id - String - unique id of the item
//          - value - Any - the data value
//      each value is retained
//   - IdMap - Constructor - Optional - custom IdMap class to store id->index
//       mappings internally. Standard IdMap is used by default.
class MaxHeap {
    // Builds a new heap in-place in linear time based on passed data
    _initFromData(data) {
        this._heap = data.map(({ id, value })=>({
                id,
                value
            }));
        data.forEach(({ id }, i)=>this._heapIdx.set(id, i));
        if (!data.length) {
            return;
        }
        // start from the first non-leaf - the parent of the last leaf
        for(let i = parentIdx(data.length - 1); i >= 0; i--){
            this._downHeap(i);
        }
    }
    _downHeap(idx) {
        while(leftChildIdx(idx) < this.size()){
            const left = leftChildIdx(idx);
            const right = rightChildIdx(idx);
            let largest = idx;
            if (left < this.size()) {
                largest = this._maxIndex(largest, left);
            }
            if (right < this.size()) {
                largest = this._maxIndex(largest, right);
            }
            if (largest === idx) {
                break;
            }
            this._swap(largest, idx);
            idx = largest;
        }
    }
    _upHeap(idx) {
        while(idx > 0){
            const parent = parentIdx(idx);
            if (this._maxIndex(parent, idx) === idx) {
                this._swap(parent, idx);
                idx = parent;
            } else {
                break;
            }
        }
    }
    _maxIndex(idxA, idxB) {
        const valueA = this._get(idxA);
        const valueB = this._get(idxB);
        return this._comparator(valueA, valueB) >= 0 ? idxA : idxB;
    }
    // Internal: gets raw data object placed on idxth place in heap
    _get(idx) {
        return this._heap[idx].value;
    }
    _swap(idxA, idxB) {
        const recA = this._heap[idxA];
        const recB = this._heap[idxB];
        this._heapIdx.set(recA.id, idxB);
        this._heapIdx.set(recB.id, idxA);
        this._heap[idxA] = recB;
        this._heap[idxB] = recA;
    }
    get(id) {
        return this.has(id) ? this._get(this._heapIdx.get(id)) : null;
    }
    set(id, value) {
        if (this.has(id)) {
            if (this.get(id) === value) {
                return;
            }
            const idx = this._heapIdx.get(id);
            this._heap[idx].value = value;
            // Fix the new value's position
            // Either bubble new value up if it is greater than its parent
            this._upHeap(idx);
            // or bubble it down if it is smaller than one of its children
            this._downHeap(idx);
        } else {
            this._heapIdx.set(id, this._heap.length);
            this._heap.push({
                id,
                value
            });
            this._upHeap(this._heap.length - 1);
        }
    }
    remove(id) {
        if (this.has(id)) {
            const last = this._heap.length - 1;
            const idx = this._heapIdx.get(id);
            if (idx !== last) {
                this._swap(idx, last);
                this._heap.pop();
                this._heapIdx.remove(id);
                // Fix the swapped value's position
                this._upHeap(idx);
                this._downHeap(idx);
            } else {
                this._heap.pop();
                this._heapIdx.remove(id);
            }
        }
    }
    has(id) {
        return this._heapIdx.has(id);
    }
    empty() {
        return !this.size();
    }
    clear() {
        this._heap = [];
        this._heapIdx.clear();
    }
    // iterate over values in no particular order
    forEach(iterator) {
        this._heap.forEach((obj)=>iterator(obj.value, obj.id));
    }
    size() {
        return this._heap.length;
    }
    setDefault(id, def) {
        if (this.has(id)) {
            return this.get(id);
        }
        this.set(id, def);
        return def;
    }
    clone() {
        const clone = new MaxHeap(this._comparator, this._heap);
        return clone;
    }
    maxElementId() {
        return this.size() ? this._heap[0].id : null;
    }
    _selfCheck() {
        for(let i = 1; i < this._heap.length; i++){
            if (this._maxIndex(parentIdx(i), i) !== parentIdx(i)) {
                throw new Error(`An item with id ${this._heap[i].id} has a parent younger than it: ${this._heap[parentIdx(i)].id}`);
            }
        }
    }
    constructor(comparator, options = {}){
        if (typeof comparator !== "function") {
            throw new Error("Passed comparator is invalid, should be a comparison function");
        }
        // a C-style comparator that is given two values and returns a number,
        // negative if the first value is less than the second, positive if the second
        // value is greater than the first and zero if they are equal.
        this._comparator = comparator;
        if (!options.IdMap) {
            options.IdMap = IdMap;
        }
        // _heapIdx maps an id to an index in the Heap array the corresponding value
        // is located on.
        this._heapIdx = new options.IdMap();
        // The Heap data-structure implemented as a 0-based contiguous array where
        // every item on index idx is a node in a complete binary tree. Every node can
        // have children on indexes idx*2+1 and idx*2+2, except for the leaves. Every
        // node has a parent on index (idx-1)/2;
        this._heap = [];
        // If the initial array is passed, we can build the heap in linear time
        // complexity (O(N)) compared to linearithmic time complexity (O(nlogn)) if
        // we push elements one by one.
        if (Array.isArray(options.initData)) {
            this._initFromData(options.initData);
        }
    }
}
const leftChildIdx = (i)=>i * 2 + 1;
const rightChildIdx = (i)=>i * 2 + 2;
const parentIdx = (i)=>i - 1 >> 1;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"min-heap.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/binary-heap/min-heap.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({MinHeap:()=>MinHeap});let MaxHeap;module.link("./max-heap.js",{MaxHeap(v){MaxHeap=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
class MinHeap extends MaxHeap {
    maxElementId() {
        throw new Error("Cannot call maxElementId on MinHeap");
    }
    minElementId() {
        return super.maxElementId();
    }
    constructor(comparator, options){
        super((a, b)=>-comparator(a, b), options);
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"min-max-heap.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/binary-heap/min-max-heap.js                                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({MinMaxHeap:()=>MinMaxHeap});let MaxHeap;module.link("./max-heap.js",{MaxHeap(v){MaxHeap=v}},0);let MinHeap;module.link("./min-heap.js",{MinHeap(v){MinHeap=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

// This implementation of Min/Max-Heap is just a subclass of Max-Heap
// with a Min-Heap as an encapsulated property.
//
// Most of the operations are just proxy methods to call the same method on both
// heaps.
//
// This implementation takes 2*N memory but is fairly simple to write and
// understand. And the constant factor of a simple Heap is usually smaller
// compared to other two-way priority queues like Min/Max Heaps
// (http://www.cs.otago.ac.nz/staffpriv/mike/Papers/MinMaxHeaps/MinMaxHeaps.pdf)
// and Interval Heaps
// (http://www.cise.ufl.edu/~sahni/dsaac/enrich/c13/double.htm)
class MinMaxHeap extends MaxHeap {
    set(...args) {
        super.set(...args);
        this._minHeap.set(...args);
    }
    remove(...args) {
        super.remove(...args);
        this._minHeap.remove(...args);
    }
    clear(...args) {
        super.clear(...args);
        this._minHeap.clear(...args);
    }
    setDefault(...args) {
        super.setDefault(...args);
        return this._minHeap.setDefault(...args);
    }
    clone() {
        const clone = new MinMaxHeap(this._comparator, this._heap);
        return clone;
    }
    minElementId() {
        return this._minHeap.minElementId();
    }
    constructor(comparator, options){
        super(comparator, options);
        this._minHeap = new MinHeap(comparator, options);
    }
}
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
      MaxHeap: MaxHeap,
      MinHeap: MinHeap,
      MinMaxHeap: MinMaxHeap
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/binary-heap/binary-heap.js"
  ],
  mainModulePath: "/node_modules/meteor/binary-heap/binary-heap.js"
}});

//# sourceURL=meteor://💻app/packages/binary-heap.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYmluYXJ5LWhlYXAvYmluYXJ5LWhlYXAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JpbmFyeS1oZWFwL21heC1oZWFwLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9iaW5hcnktaGVhcC9taW4taGVhcC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYmluYXJ5LWhlYXAvbWluLW1heC1oZWFwLmpzIl0sIm5hbWVzIjpbIk1heEhlYXAiLCJfaW5pdEZyb21EYXRhIiwiZGF0YSIsIl9oZWFwIiwibWFwIiwiaWQiLCJ2YWx1ZSIsImZvckVhY2giLCJpIiwiX2hlYXBJZHgiLCJzZXQiLCJsZW5ndGgiLCJwYXJlbnRJZHgiLCJfZG93bkhlYXAiLCJpZHgiLCJsZWZ0Q2hpbGRJZHgiLCJzaXplIiwibGVmdCIsInJpZ2h0IiwicmlnaHRDaGlsZElkeCIsImxhcmdlc3QiLCJfbWF4SW5kZXgiLCJfc3dhcCIsIl91cEhlYXAiLCJwYXJlbnQiLCJpZHhBIiwiaWR4QiIsInZhbHVlQSIsIl9nZXQiLCJ2YWx1ZUIiLCJfY29tcGFyYXRvciIsInJlY0EiLCJyZWNCIiwiZ2V0IiwiaGFzIiwicHVzaCIsInJlbW92ZSIsImxhc3QiLCJwb3AiLCJlbXB0eSIsImNsZWFyIiwiaXRlcmF0b3IiLCJvYmoiLCJzZXREZWZhdWx0IiwiZGVmIiwiY2xvbmUiLCJtYXhFbGVtZW50SWQiLCJfc2VsZkNoZWNrIiwiRXJyb3IiLCJjb21wYXJhdG9yIiwib3B0aW9ucyIsIklkTWFwIiwiQXJyYXkiLCJpc0FycmF5IiwiaW5pdERhdGEiLCJNaW5IZWFwIiwibWluRWxlbWVudElkIiwiYSIsImIiLCJNaW5NYXhIZWFwIiwiYXJncyIsIl9taW5IZWFwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxPQUFPLFFBQVEsZ0JBQWdCO0FBQ0E7QUFDTzs7Ozs7Ozs7Ozs7OztBQ0YvQyxz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QVEsQ0FBQ2xCLFVBQVUsSUFBSWlCO0lBQ3JDO0lBRUFmLFFBQVE7UUFDTixNQUFNQSxRQUFRLElBQUljLFdBQVcsSUFBSSxDQUFDN0IsV0FBVyxFQUFFLElBQUksQ0FBQzNCLEtBQUs7UUFDekQsT0FBTzBDO0lBQ1Q7SUFFQVcsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDSyxRQUFRLENBQUNMLFlBQVk7SUFDbkM7SUFoQ0EsWUFBWVAsVUFBVSxFQUFFQyxPQUFPLENBQUU7UUFDL0IsS0FBSyxDQUFDRCxZQUFZQztRQUNsQixJQUFJLENBQUNXLFFBQVEsR0FBRyxJQUFJTixRQUFRTixZQUFZQztJQUMxQztBQThCRiIsImZpbGUiOiIvcGFja2FnZXMvYmluYXJ5LWhlYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgeyBNYXhIZWFwIH0gZnJvbSBcIi4vbWF4LWhlYXAuanNcIjtcbmV4cG9ydCB7IE1pbkhlYXAgfSBmcm9tIFwiLi9taW4taGVhcC5qc1wiO1xuZXhwb3J0IHsgTWluTWF4SGVhcCB9IGZyb20gXCIuL21pbi1tYXgtaGVhcC5qc1wiO1xuIiwiLy8gQ29uc3RydWN0b3Igb2YgSGVhcFxuLy8gLSBjb21wYXJhdG9yIC0gRnVuY3Rpb24gLSBnaXZlbiB0d28gaXRlbXMgcmV0dXJucyBhIG51bWJlclxuLy8gLSBvcHRpb25zOlxuLy8gICAtIGluaXREYXRhIC0gQXJyYXkgLSBPcHRpb25hbCAtIHRoZSBpbml0aWFsIGRhdGEgaW4gYSBmb3JtYXQ6XG4vLyAgICAgICAgT2JqZWN0OlxuLy8gICAgICAgICAgLSBpZCAtIFN0cmluZyAtIHVuaXF1ZSBpZCBvZiB0aGUgaXRlbVxuLy8gICAgICAgICAgLSB2YWx1ZSAtIEFueSAtIHRoZSBkYXRhIHZhbHVlXG4vLyAgICAgIGVhY2ggdmFsdWUgaXMgcmV0YWluZWRcbi8vICAgLSBJZE1hcCAtIENvbnN0cnVjdG9yIC0gT3B0aW9uYWwgLSBjdXN0b20gSWRNYXAgY2xhc3MgdG8gc3RvcmUgaWQtPmluZGV4XG4vLyAgICAgICBtYXBwaW5ncyBpbnRlcm5hbGx5LiBTdGFuZGFyZCBJZE1hcCBpcyB1c2VkIGJ5IGRlZmF1bHQuXG5leHBvcnQgY2xhc3MgTWF4SGVhcCB7XG4gIGNvbnN0cnVjdG9yKGNvbXBhcmF0b3IsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgY29tcGFyYXRvciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXNzZWQgY29tcGFyYXRvciBpcyBpbnZhbGlkLCBzaG91bGQgYmUgYSBjb21wYXJpc29uIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIC8vIGEgQy1zdHlsZSBjb21wYXJhdG9yIHRoYXQgaXMgZ2l2ZW4gdHdvIHZhbHVlcyBhbmQgcmV0dXJucyBhIG51bWJlcixcbiAgICAvLyBuZWdhdGl2ZSBpZiB0aGUgZmlyc3QgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzZWNvbmQsIHBvc2l0aXZlIGlmIHRoZSBzZWNvbmRcbiAgICAvLyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIGZpcnN0IGFuZCB6ZXJvIGlmIHRoZXkgYXJlIGVxdWFsLlxuICAgIHRoaXMuX2NvbXBhcmF0b3IgPSBjb21wYXJhdG9yO1xuXG4gICAgaWYgKCFvcHRpb25zLklkTWFwKSB7XG4gICAgICBvcHRpb25zLklkTWFwID0gSWRNYXA7XG4gICAgfVxuXG4gICAgLy8gX2hlYXBJZHggbWFwcyBhbiBpZCB0byBhbiBpbmRleCBpbiB0aGUgSGVhcCBhcnJheSB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZVxuICAgIC8vIGlzIGxvY2F0ZWQgb24uXG4gICAgdGhpcy5faGVhcElkeCA9IG5ldyBvcHRpb25zLklkTWFwKCk7XG5cbiAgICAvLyBUaGUgSGVhcCBkYXRhLXN0cnVjdHVyZSBpbXBsZW1lbnRlZCBhcyBhIDAtYmFzZWQgY29udGlndW91cyBhcnJheSB3aGVyZVxuICAgIC8vIGV2ZXJ5IGl0ZW0gb24gaW5kZXggaWR4IGlzIGEgbm9kZSBpbiBhIGNvbXBsZXRlIGJpbmFyeSB0cmVlLiBFdmVyeSBub2RlIGNhblxuICAgIC8vIGhhdmUgY2hpbGRyZW4gb24gaW5kZXhlcyBpZHgqMisxIGFuZCBpZHgqMisyLCBleGNlcHQgZm9yIHRoZSBsZWF2ZXMuIEV2ZXJ5XG4gICAgLy8gbm9kZSBoYXMgYSBwYXJlbnQgb24gaW5kZXggKGlkeC0xKS8yO1xuICAgIHRoaXMuX2hlYXAgPSBbXTtcblxuICAgIC8vIElmIHRoZSBpbml0aWFsIGFycmF5IGlzIHBhc3NlZCwgd2UgY2FuIGJ1aWxkIHRoZSBoZWFwIGluIGxpbmVhciB0aW1lXG4gICAgLy8gY29tcGxleGl0eSAoTyhOKSkgY29tcGFyZWQgdG8gbGluZWFyaXRobWljIHRpbWUgY29tcGxleGl0eSAoTyhubG9nbikpIGlmXG4gICAgLy8gd2UgcHVzaCBlbGVtZW50cyBvbmUgYnkgb25lLlxuICAgIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMuaW5pdERhdGEpKSB7XG4gICAgICB0aGlzLl9pbml0RnJvbURhdGEob3B0aW9ucy5pbml0RGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQnVpbGRzIGEgbmV3IGhlYXAgaW4tcGxhY2UgaW4gbGluZWFyIHRpbWUgYmFzZWQgb24gcGFzc2VkIGRhdGFcbiAgX2luaXRGcm9tRGF0YShkYXRhKSB7XG4gICAgdGhpcy5faGVhcCA9IGRhdGEubWFwKCh7IGlkLCB2YWx1ZSB9KSA9PiAoeyBpZCwgdmFsdWUgfSkpO1xuXG4gICAgZGF0YS5mb3JFYWNoKCh7IGlkIH0sIGkpID0+IHRoaXMuX2hlYXBJZHguc2V0KGlkLCBpKSk7XG5cbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc3RhcnQgZnJvbSB0aGUgZmlyc3Qgbm9uLWxlYWYgLSB0aGUgcGFyZW50IG9mIHRoZSBsYXN0IGxlYWZcbiAgICBmb3IgKGxldCBpID0gcGFyZW50SWR4KGRhdGEubGVuZ3RoIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0aGlzLl9kb3duSGVhcChpKTtcbiAgICB9XG4gIH1cblxuICBfZG93bkhlYXAoaWR4KSB7XG4gICAgd2hpbGUgKGxlZnRDaGlsZElkeChpZHgpIDwgdGhpcy5zaXplKCkpIHtcbiAgICAgIGNvbnN0IGxlZnQgPSBsZWZ0Q2hpbGRJZHgoaWR4KTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gcmlnaHRDaGlsZElkeChpZHgpO1xuICAgICAgbGV0IGxhcmdlc3QgPSBpZHg7XG5cbiAgICAgIGlmIChsZWZ0IDwgdGhpcy5zaXplKCkpIHtcbiAgICAgICAgbGFyZ2VzdCA9IHRoaXMuX21heEluZGV4KGxhcmdlc3QsIGxlZnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmlnaHQgPCB0aGlzLnNpemUoKSkge1xuICAgICAgICBsYXJnZXN0ID0gdGhpcy5fbWF4SW5kZXgobGFyZ2VzdCwgcmlnaHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFyZ2VzdCA9PT0gaWR4KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zd2FwKGxhcmdlc3QsIGlkeCk7XG4gICAgICBpZHggPSBsYXJnZXN0O1xuICAgIH1cbiAgfVxuXG4gIF91cEhlYXAoaWR4KSB7XG4gICAgd2hpbGUgKGlkeCA+IDApIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudElkeChpZHgpO1xuICAgICAgaWYgKHRoaXMuX21heEluZGV4KHBhcmVudCwgaWR4KSA9PT0gaWR4KSB7XG4gICAgICAgIHRoaXMuX3N3YXAocGFyZW50LCBpZHgpO1xuICAgICAgICBpZHggPSBwYXJlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfbWF4SW5kZXgoaWR4QSwgaWR4Qikge1xuICAgIGNvbnN0IHZhbHVlQSA9IHRoaXMuX2dldChpZHhBKTtcbiAgICBjb25zdCB2YWx1ZUIgPSB0aGlzLl9nZXQoaWR4Qik7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmF0b3IodmFsdWVBLCB2YWx1ZUIpID49IDAgPyBpZHhBIDogaWR4QjtcbiAgfVxuXG4gIC8vIEludGVybmFsOiBnZXRzIHJhdyBkYXRhIG9iamVjdCBwbGFjZWQgb24gaWR4dGggcGxhY2UgaW4gaGVhcFxuICBfZ2V0KGlkeCkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwW2lkeF0udmFsdWU7XG4gIH1cblxuICBfc3dhcChpZHhBLCBpZHhCKSB7XG4gICAgY29uc3QgcmVjQSA9IHRoaXMuX2hlYXBbaWR4QV07XG4gICAgY29uc3QgcmVjQiA9IHRoaXMuX2hlYXBbaWR4Ql07XG5cbiAgICB0aGlzLl9oZWFwSWR4LnNldChyZWNBLmlkLCBpZHhCKTtcbiAgICB0aGlzLl9oZWFwSWR4LnNldChyZWNCLmlkLCBpZHhBKTtcblxuICAgIHRoaXMuX2hlYXBbaWR4QV0gPSByZWNCO1xuICAgIHRoaXMuX2hlYXBbaWR4Ql0gPSByZWNBO1xuICB9XG5cbiAgZ2V0KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGlkKSA/IHRoaXMuX2dldCh0aGlzLl9oZWFwSWR4LmdldChpZCkpIDogbnVsbDtcbiAgfVxuXG4gIHNldChpZCwgdmFsdWUpIHtcbiAgICBpZiAodGhpcy5oYXMoaWQpKSB7XG4gICAgICBpZiAodGhpcy5nZXQoaWQpID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuX2hlYXBJZHguZ2V0KGlkKTtcbiAgICAgIHRoaXMuX2hlYXBbaWR4XS52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICAvLyBGaXggdGhlIG5ldyB2YWx1ZSdzIHBvc2l0aW9uXG4gICAgICAvLyBFaXRoZXIgYnViYmxlIG5ldyB2YWx1ZSB1cCBpZiBpdCBpcyBncmVhdGVyIHRoYW4gaXRzIHBhcmVudFxuICAgICAgdGhpcy5fdXBIZWFwKGlkeCk7XG4gICAgICAvLyBvciBidWJibGUgaXQgZG93biBpZiBpdCBpcyBzbWFsbGVyIHRoYW4gb25lIG9mIGl0cyBjaGlsZHJlblxuICAgICAgdGhpcy5fZG93bkhlYXAoaWR4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGVhcElkeC5zZXQoaWQsIHRoaXMuX2hlYXAubGVuZ3RoKTtcbiAgICAgIHRoaXMuX2hlYXAucHVzaCh7IGlkLCB2YWx1ZSB9KTtcbiAgICAgIHRoaXMuX3VwSGVhcCh0aGlzLl9oZWFwLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZShpZCkge1xuICAgIGlmICh0aGlzLmhhcyhpZCkpIHtcbiAgICAgIGNvbnN0IGxhc3QgPSB0aGlzLl9oZWFwLmxlbmd0aCAtIDE7XG4gICAgICBjb25zdCBpZHggPSB0aGlzLl9oZWFwSWR4LmdldChpZCk7XG5cbiAgICAgIGlmIChpZHggIT09IGxhc3QpIHtcbiAgICAgICAgdGhpcy5fc3dhcChpZHgsIGxhc3QpO1xuICAgICAgICB0aGlzLl9oZWFwLnBvcCgpO1xuICAgICAgICB0aGlzLl9oZWFwSWR4LnJlbW92ZShpZCk7XG5cbiAgICAgICAgLy8gRml4IHRoZSBzd2FwcGVkIHZhbHVlJ3MgcG9zaXRpb25cbiAgICAgICAgdGhpcy5fdXBIZWFwKGlkeCk7XG4gICAgICAgIHRoaXMuX2Rvd25IZWFwKGlkeCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZWFwLnBvcCgpO1xuICAgICAgICB0aGlzLl9oZWFwSWR4LnJlbW92ZShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFzKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXBJZHguaGFzKGlkKTtcbiAgfVxuXG4gIGVtcHR5KCkge1xuICAgIHJldHVybiAhdGhpcy5zaXplKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9oZWFwID0gW107XG4gICAgdGhpcy5faGVhcElkeC5jbGVhcigpO1xuICB9XG5cbiAgLy8gaXRlcmF0ZSBvdmVyIHZhbHVlcyBpbiBubyBwYXJ0aWN1bGFyIG9yZGVyXG4gIGZvckVhY2goaXRlcmF0b3IpIHtcbiAgICB0aGlzLl9oZWFwLmZvckVhY2goKG9iaikgPT4gaXRlcmF0b3Iob2JqLnZhbHVlLCBvYmouaWQpKTtcbiAgfVxuXG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXAubGVuZ3RoO1xuICB9XG5cbiAgc2V0RGVmYXVsdChpZCwgZGVmKSB7XG4gICAgaWYgKHRoaXMuaGFzKGlkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KGlkKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldChpZCwgZGVmKTtcbiAgICByZXR1cm4gZGVmO1xuICB9XG5cbiAgY2xvbmUoKSB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgTWF4SGVhcCh0aGlzLl9jb21wYXJhdG9yLCB0aGlzLl9oZWFwKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICBtYXhFbGVtZW50SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSgpID8gdGhpcy5faGVhcFswXS5pZCA6IG51bGw7XG4gIH1cblxuICBfc2VsZkNoZWNrKCkge1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5faGVhcC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuX21heEluZGV4KHBhcmVudElkeChpKSwgaSkgIT09IHBhcmVudElkeChpKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFuIGl0ZW0gd2l0aCBpZCAke3RoaXMuX2hlYXBbaV0uaWR9IGhhcyBhIHBhcmVudCB5b3VuZ2VyIHRoYW4gaXQ6ICR7dGhpcy5faGVhcFtwYXJlbnRJZHgoaSldLmlkfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGxlZnRDaGlsZElkeCA9IChpKSA9PiBpICogMiArIDE7XG5jb25zdCByaWdodENoaWxkSWR4ID0gKGkpID0+IGkgKiAyICsgMjtcbmNvbnN0IHBhcmVudElkeCA9IChpKSA9PiAoaSAtIDEpID4+IDE7XG4iLCJpbXBvcnQgeyBNYXhIZWFwIH0gZnJvbSBcIi4vbWF4LWhlYXAuanNcIjtcblxuZXhwb3J0IGNsYXNzIE1pbkhlYXAgZXh0ZW5kcyBNYXhIZWFwIHtcbiAgY29uc3RydWN0b3IoY29tcGFyYXRvciwgb3B0aW9ucykge1xuICAgIHN1cGVyKChhLCBiKSA9PiAtY29tcGFyYXRvcihhLCBiKSwgb3B0aW9ucyk7XG4gIH1cblxuICBtYXhFbGVtZW50SWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNhbGwgbWF4RWxlbWVudElkIG9uIE1pbkhlYXBcIik7XG4gIH1cblxuICBtaW5FbGVtZW50SWQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLm1heEVsZW1lbnRJZCgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXhIZWFwIH0gZnJvbSBcIi4vbWF4LWhlYXAuanNcIjtcbmltcG9ydCB7IE1pbkhlYXAgfSBmcm9tIFwiLi9taW4taGVhcC5qc1wiO1xuXG4vLyBUaGlzIGltcGxlbWVudGF0aW9uIG9mIE1pbi9NYXgtSGVhcCBpcyBqdXN0IGEgc3ViY2xhc3Mgb2YgTWF4LUhlYXBcbi8vIHdpdGggYSBNaW4tSGVhcCBhcyBhbiBlbmNhcHN1bGF0ZWQgcHJvcGVydHkuXG4vL1xuLy8gTW9zdCBvZiB0aGUgb3BlcmF0aW9ucyBhcmUganVzdCBwcm94eSBtZXRob2RzIHRvIGNhbGwgdGhlIHNhbWUgbWV0aG9kIG9uIGJvdGhcbi8vIGhlYXBzLlxuLy9cbi8vIFRoaXMgaW1wbGVtZW50YXRpb24gdGFrZXMgMipOIG1lbW9yeSBidXQgaXMgZmFpcmx5IHNpbXBsZSB0byB3cml0ZSBhbmRcbi8vIHVuZGVyc3RhbmQuIEFuZCB0aGUgY29uc3RhbnQgZmFjdG9yIG9mIGEgc2ltcGxlIEhlYXAgaXMgdXN1YWxseSBzbWFsbGVyXG4vLyBjb21wYXJlZCB0byBvdGhlciB0d28td2F5IHByaW9yaXR5IHF1ZXVlcyBsaWtlIE1pbi9NYXggSGVhcHNcbi8vIChodHRwOi8vd3d3LmNzLm90YWdvLmFjLm56L3N0YWZmcHJpdi9taWtlL1BhcGVycy9NaW5NYXhIZWFwcy9NaW5NYXhIZWFwcy5wZGYpXG4vLyBhbmQgSW50ZXJ2YWwgSGVhcHNcbi8vIChodHRwOi8vd3d3LmNpc2UudWZsLmVkdS9+c2FobmkvZHNhYWMvZW5yaWNoL2MxMy9kb3VibGUuaHRtKVxuZXhwb3J0IGNsYXNzIE1pbk1heEhlYXAgZXh0ZW5kcyBNYXhIZWFwIHtcbiAgY29uc3RydWN0b3IoY29tcGFyYXRvciwgb3B0aW9ucykge1xuICAgIHN1cGVyKGNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgIHRoaXMuX21pbkhlYXAgPSBuZXcgTWluSGVhcChjb21wYXJhdG9yLCBvcHRpb25zKTtcbiAgfVxuXG4gIHNldCguLi5hcmdzKSB7XG4gICAgc3VwZXIuc2V0KC4uLmFyZ3MpO1xuICAgIHRoaXMuX21pbkhlYXAuc2V0KC4uLmFyZ3MpO1xuICB9XG5cbiAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5yZW1vdmUoLi4uYXJncyk7XG4gICAgdGhpcy5fbWluSGVhcC5yZW1vdmUoLi4uYXJncyk7XG4gIH1cblxuICBjbGVhciguLi5hcmdzKSB7XG4gICAgc3VwZXIuY2xlYXIoLi4uYXJncyk7XG4gICAgdGhpcy5fbWluSGVhcC5jbGVhciguLi5hcmdzKTtcbiAgfVxuXG4gIHNldERlZmF1bHQoLi4uYXJncykge1xuICAgIHN1cGVyLnNldERlZmF1bHQoLi4uYXJncyk7XG4gICAgcmV0dXJuIHRoaXMuX21pbkhlYXAuc2V0RGVmYXVsdCguLi5hcmdzKTtcbiAgfVxuXG4gIGNsb25lKCkge1xuICAgIGNvbnN0IGNsb25lID0gbmV3IE1pbk1heEhlYXAodGhpcy5fY29tcGFyYXRvciwgdGhpcy5faGVhcCk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgbWluRWxlbWVudElkKCkge1xuICAgIHJldHVybiB0aGlzLl9taW5IZWFwLm1pbkVsZW1lbnRJZCgpO1xuICB9XG59XG4iXX0=
