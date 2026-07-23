Package["core-runtime"].queue("observe-sequence",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var Random = Package.random.Random;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ObserveSequence, seqChangedToEmpty, seqChangedToArray, seqChangedToCursor;

var require = meteorInstall({"node_modules":{"meteor":{"observe-sequence":{"observe_sequence.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/observe-sequence/observe_sequence.js                                                                    //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
const isObject = function(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
};
const has = (obj, path)=>{
    const thisPath = Array.isArray(path) ? path : [
        path
    ];
    const length = thisPath.length;
    for(let i = 0; i < length; i++){
        const key = thisPath[i];
        const _has = obj != null && Object.hasOwnProperty.call(obj, key);
        if (!_has) return false;
        obj = obj[key];
    }
    return !!length;
};
const warn = function(...args) {
    if (ObserveSequence._suppressWarnings) {
        ObserveSequence._suppressWarnings--;
    } else {
        if (typeof console !== 'undefined' && console.warn) console.warn.apply(console, args);
        ObserveSequence._loggedWarnings++;
    }
};
// isArray returns true for arrays of these types:
// standard arrays: instanceof Array === true, _.isArray(arr) === true
// vm generated arrays: instanceOf Array === false, _.isArray(arr) === true
// subclassed arrays: instanceof Array === true, _.isArray(arr) === false
// see specific tests
function isArray(arr) {
    return arr instanceof Array || Array.isArray(arr);
}
// isIterable returns trues for objects implementing iterable protocol,
// except strings, as {{#each 'string'}} doesn't make much sense.
// Requires ES6+ and does not work in IE (but degrades gracefully).
// Does not support the `length` + index protocol also supported by Array.from
function isIterable(object) {
    const iter = typeof Symbol != 'undefined' && Symbol.iterator;
    return iter && object instanceof Object // note: returns false for strings
     && typeof object[iter] == 'function'; // implements iterable protocol
}
const idStringify = MongoID.idStringify;
const idParse = MongoID.idParse;
ObserveSequence = {
    _suppressWarnings: 0,
    _loggedWarnings: 0,
    // A mechanism similar to cursor.observe which receives a reactive
    // function returning a sequence type and firing appropriate callbacks
    // when the value changes.
    //
    // @param sequenceFunc {Function} a reactive function returning a
    //     sequence type. The currently supported sequence types are:
    //     Array, Cursor, and null.
    //
    // @param callbacks {Object} similar to a specific subset of
    //     callbacks passed to `cursor.observe`
    //     (http://docs.meteor.com/#observe), with minor variations to
    //     support the fact that not all sequences contain objects with
    //     _id fields.  Specifically:
    //
    //     * addedAt(id, item, atIndex, beforeId)
    //     * changedAt(id, newItem, oldItem, atIndex)
    //     * removedAt(id, oldItem, atIndex)
    //     * movedTo(id, item, fromIndex, toIndex, beforeId)
    //
    // @returns {Object(stop: Function)} call 'stop' on the return value
    //     to stop observing this sequence function.
    //
    // We don't make any assumptions about our ability to compare sequence
    // elements (ie, we don't assume EJSON.equals works; maybe there is extra
    // state/random methods on the objects) so unlike cursor.observe, we may
    // sometimes call changedAt() when nothing actually changed.
    // XXX consider if we *can* make the stronger assumption and avoid
    //     no-op changedAt calls (in some cases?)
    //
    // XXX currently only supports the callbacks used by our
    // implementation of {{#each}}, but this can be expanded.
    //
    // XXX #each doesn't use the indices (though we'll eventually need
    // a way to get them when we support `@index`), but calling
    // `cursor.observe` causes the index to be calculated on every
    // callback using a linear scan (unless you turn it off by passing
    // `_no_indices`).  Any way to avoid calculating indices on a pure
    // cursor observe like we used to?
    observe: function(sequenceFunc, callbacks) {
        var lastSeq = null;
        var activeObserveHandle = null;
        // 'lastSeqArray' contains the previous value of the sequence
        // we're observing. It is an array of objects with '_id' and
        // 'item' fields.  'item' is the element in the array, or the
        // document in the cursor.
        //
        // '_id' is whichever of the following is relevant, unless it has
        // already appeared -- in which case it's randomly generated.
        //
        // * if 'item' is an object:
        //   * an '_id' field, if present
        //   * otherwise, the index in the array
        //
        // * if 'item' is a number or string, use that value
        //
        // XXX this can be generalized by allowing {{#each}} to accept a
        // general 'key' argument which could be a function, a dotted
        // field name, or the special @index value.
        var lastSeqArray = []; // elements are objects of form {_id, item}
        var computation = Tracker.autorun(function() {
            var seq = sequenceFunc();
            Tracker.nonreactive(function() {
                var seqArray; // same structure as `lastSeqArray` above.
                if (activeObserveHandle) {
                    // If we were previously observing a cursor, replace lastSeqArray with
                    // more up-to-date information.  Then stop the old observe.
                    lastSeqArray = lastSeq.fetch().map(function(doc) {
                        return {
                            _id: doc._id,
                            item: doc
                        };
                    });
                    activeObserveHandle.stop();
                    activeObserveHandle = null;
                }
                if (!seq) {
                    seqArray = seqChangedToEmpty(lastSeqArray, callbacks);
                } else if (isArray(seq)) {
                    seqArray = seqChangedToArray(lastSeqArray, seq, callbacks);
                } else if (isStoreCursor(seq)) {
                    var result /* [seqArray, activeObserveHandle] */  = seqChangedToCursor(lastSeqArray, seq, callbacks);
                    seqArray = result[0];
                    activeObserveHandle = result[1];
                } else if (isIterable(seq)) {
                    const array = Array.from(seq);
                    seqArray = seqChangedToArray(lastSeqArray, array, callbacks);
                } else {
                    throw badSequenceError(seq);
                }
                diffArray(lastSeqArray, seqArray, callbacks);
                lastSeq = seq;
                lastSeqArray = seqArray;
            });
        });
        return {
            stop: function() {
                computation.stop();
                if (activeObserveHandle) activeObserveHandle.stop();
            }
        };
    },
    // Fetch the items of `seq` into an array, where `seq` is of one of the
    // sequence types accepted by `observe`.  If `seq` is a cursor, a
    // dependency is established.
    fetch: function(seq) {
        if (!seq) {
            return [];
        } else if (isArray(seq)) {
            return seq;
        } else if (isStoreCursor(seq)) {
            return seq.fetch();
        } else if (isIterable(seq)) {
            return Array.from(seq);
        } else {
            throw badSequenceError(seq);
        }
    }
};
function ellipsis(longStr, maxLength) {
    if (!maxLength) maxLength = 100;
    if (longStr.length < maxLength) return longStr;
    return longStr.substr(0, maxLength - 1) + '…';
}
function arrayToDebugStr(value, maxLength) {
    var out = '', sep = '';
    for(var i = 0; i < value.length; i++){
        var item = value[i];
        out += sep + toDebugStr(item, maxLength);
        if (out.length > maxLength) return out;
        sep = ', ';
    }
    return out;
}
function toDebugStr(value, maxLength) {
    if (!maxLength) maxLength = 150;
    const type = typeof value;
    switch(type){
        case 'undefined':
            return type;
        case 'number':
            return value.toString();
        case 'string':
            return JSON.stringify(value); // add quotes
        case 'object':
            if (value === null) {
                return 'null';
            } else if (Array.isArray(value)) {
                return 'Array [' + arrayToDebugStr(value, maxLength) + ']';
            } else if (Symbol.iterator in value) {
                return value.constructor.name + ' [' + arrayToDebugStr(Array.from(value), maxLength) + ']'; // Array.from doesn't work in IE, but neither do iterators so it's unreachable
            } else {
                return value.constructor.name + ' ' + ellipsis(JSON.stringify(value), maxLength);
            }
        default:
            return type + ': ' + value.toString();
    }
}
function sequenceGotValue(sequence) {
    try {
        return ' Got ' + toDebugStr(sequence);
    } catch (e) {
        return '';
    }
}
const badSequenceError = function(sequence) {
    return new Error("{{#each}} currently only accepts " + "arrays, cursors, iterables or falsey values." + sequenceGotValue(sequence));
};
const isFunction = (func)=>{
    return typeof func === "function";
};
const isStoreCursor = function(cursor) {
    return cursor && isObject(cursor) && isFunction(cursor.observe) && isFunction(cursor.fetch);
};
// Calculates the differences between `lastSeqArray` and
// `seqArray` and calls appropriate functions from `callbacks`.
// Reuses Minimongo's diff algorithm implementation.
const diffArray = function(lastSeqArray, seqArray, callbacks) {
    var diffFn = Package['diff-sequence'].DiffSequence.diffQueryOrderedChanges;
    var oldIdObjects = [];
    var newIdObjects = [];
    var posOld = {}; // maps from idStringify'd ids
    var posNew = {}; // ditto
    var posCur = {};
    var lengthCur = lastSeqArray.length;
    seqArray.forEach(function(doc, i) {
        newIdObjects.push({
            _id: doc._id
        });
        posNew[idStringify(doc._id)] = i;
    });
    lastSeqArray.forEach(function(doc, i) {
        oldIdObjects.push({
            _id: doc._id
        });
        posOld[idStringify(doc._id)] = i;
        posCur[idStringify(doc._id)] = i;
    });
    // Arrays can contain arbitrary objects. We don't diff the
    // objects. Instead we always fire 'changedAt' callback on every
    // object. The consumer of `observe-sequence` should deal with
    // it appropriately.
    diffFn(oldIdObjects, newIdObjects, {
        addedBefore: function(id, doc, before) {
            var position = before ? posCur[idStringify(before)] : lengthCur;
            if (before) {
                // If not adding at the end, we need to update indexes.
                // XXX this can still be improved greatly!
                Object.entries(posCur).forEach(function([id, pos]) {
                    if (pos >= position) posCur[id]++;
                });
            }
            lengthCur++;
            posCur[idStringify(id)] = position;
            callbacks.addedAt(id, seqArray[posNew[idStringify(id)]].item, position, before);
        },
        movedBefore: function(id, before) {
            if (id === before) return;
            var oldPosition = posCur[idStringify(id)];
            var newPosition = before ? posCur[idStringify(before)] : lengthCur;
            // Moving the item forward. The new element is losing one position as it
            // was removed from the old position before being inserted at the new
            // position.
            // Ex.:   0  *1*  2   3   4
            //        0   2   3  *1*  4
            // The original issued callback is "1" before "4".
            // The position of "1" is 1, the position of "4" is 4.
            // The generated move is (1) -> (3)
            if (newPosition > oldPosition) {
                newPosition--;
            }
            // Fix up the positions of elements between the old and the new positions
            // of the moved element.
            //
            // There are two cases:
            //   1. The element is moved forward. Then all the positions in between
            //   are moved back.
            //   2. The element is moved back. Then the positions in between *and* the
            //   element that is currently standing on the moved element's future
            //   position are moved forward.
            Object.entries(posCur).forEach(function([id, elCurPosition]) {
                if (oldPosition < elCurPosition && elCurPosition < newPosition) posCur[id]--;
                else if (newPosition <= elCurPosition && elCurPosition < oldPosition) posCur[id]++;
            });
            // Finally, update the position of the moved element.
            posCur[idStringify(id)] = newPosition;
            callbacks.movedTo(id, seqArray[posNew[idStringify(id)]].item, oldPosition, newPosition, before);
        },
        removed: function(id) {
            var prevPosition = posCur[idStringify(id)];
            Object.entries(posCur).forEach(function([id, pos]) {
                if (pos >= prevPosition) posCur[id]--;
            });
            delete posCur[idStringify(id)];
            lengthCur--;
            callbacks.removedAt(id, lastSeqArray[posOld[idStringify(id)]].item, prevPosition);
        }
    });
    Object.entries(posNew).forEach(function([idString, pos]) {
        var id = idParse(idString);
        if (has(posOld, idString)) {
            // specifically for primitive types, compare equality before
            // firing the 'changedAt' callback. otherwise, always fire it
            // because doing a deep EJSON comparison is not guaranteed to
            // work (an array can contain arbitrary objects, and 'transform'
            // can be used on cursors). also, deep diffing is not
            // necessarily the most efficient (if only a specific subfield
            // of the object is later accessed).
            var newItem = seqArray[pos].item;
            var oldItem = lastSeqArray[posOld[idString]].item;
            if (typeof newItem === 'object' || newItem !== oldItem) callbacks.changedAt(id, newItem, oldItem, pos);
        }
    });
};
seqChangedToEmpty = function(lastSeqArray, callbacks) {
    return [];
};
seqChangedToArray = function(lastSeqArray, array, callbacks) {
    var idsUsed = {};
    var seqArray = array.map(function(item, index) {
        var id;
        if (typeof item === 'string') {
            // ensure not empty, since other layers (eg DomRange) assume this as well
            id = "-" + item;
        } else if (typeof item === 'number' || typeof item === 'boolean' || item === undefined || item === null) {
            id = item;
        } else if (typeof item === 'object') {
            id = item && '_id' in item ? item._id : index;
        } else {
            throw new Error("{{#each}} doesn't support arrays with " + "elements of type " + typeof item);
        }
        var idString = idStringify(id);
        if (idsUsed[idString]) {
            if (item && typeof item === 'object' && '_id' in item) warn("duplicate id " + id + " in", array);
            id = Random.id();
        } else {
            idsUsed[idString] = true;
        }
        return {
            _id: id,
            item: item
        };
    });
    return seqArray;
};
seqChangedToCursor = function(lastSeqArray, cursor, callbacks) {
    var initial = true; // are we observing initial data from cursor?
    var seqArray = [];
    var observeHandle = cursor.observe({
        addedAt: function(document, atIndex, before) {
            if (initial) {
                // keep track of initial data so that we can diff once
                // we exit `observe`.
                if (before !== null) throw new Error("Expected initial data from observe in order");
                seqArray.push({
                    _id: document._id,
                    item: document
                });
            } else {
                callbacks.addedAt(document._id, document, atIndex, before);
            }
        },
        changedAt: function(newDocument, oldDocument, atIndex) {
            callbacks.changedAt(newDocument._id, newDocument, oldDocument, atIndex);
        },
        removedAt: function(oldDocument, atIndex) {
            callbacks.removedAt(oldDocument._id, oldDocument, atIndex);
        },
        movedTo: function(document, fromIndex, toIndex, before) {
            callbacks.movedTo(document._id, document, fromIndex, toIndex, before);
        }
    });
    initial = false;
    return [
        seqArray,
        observeHandle
    ];
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      ObserveSequence: ObserveSequence
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/observe-sequence/observe_sequence.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/observe-sequence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2JzZXJ2ZS1zZXF1ZW5jZS9vYnNlcnZlX3NlcXVlbmNlLmpzIl0sIm5hbWVzIjpbImlzT2JqZWN0IiwidmFsdWUiLCJ0eXBlIiwiaGFzIiwib2JqIiwicGF0aCIsInRoaXNQYXRoIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiaSIsImtleSIsIl9oYXMiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJ3YXJuIiwiYXJncyIsIk9ic2VydmVTZXF1ZW5jZSIsIl9zdXBwcmVzc1dhcm5pbmdzIiwiY29uc29sZSIsImFwcGx5IiwiX2xvZ2dlZFdhcm5pbmdzIiwiYXJyIiwiaXNJdGVyYWJsZSIsIm9iamVjdCIsIml0ZXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsImlkU3RyaW5naWZ5IiwiTW9uZ29JRCIsImlkUGFyc2UiLCJvYnNlcnZlIiwic2VxdWVuY2VGdW5jIiwiY2FsbGJhY2tzIiwibGFzdFNlcSIsImFjdGl2ZU9ic2VydmVIYW5kbGUiLCJsYXN0U2VxQXJyYXkiLCJjb21wdXRhdGlvbiIsIlRyYWNrZXIiLCJhdXRvcnVuIiwic2VxIiwibm9ucmVhY3RpdmUiLCJzZXFBcnJheSIsImZldGNoIiwibWFwIiwiZG9jIiwiX2lkIiwiaXRlbSIsInN0b3AiLCJzZXFDaGFuZ2VkVG9FbXB0eSIsInNlcUNoYW5nZWRUb0FycmF5IiwiaXNTdG9yZUN1cnNvciIsInJlc3VsdCIsInNlcUNoYW5nZWRUb0N1cnNvciIsImFycmF5IiwiZnJvbSIsImJhZFNlcXVlbmNlRXJyb3IiLCJkaWZmQXJyYXkiLCJlbGxpcHNpcyIsImxvbmdTdHIiLCJtYXhMZW5ndGgiLCJzdWJzdHIiLCJhcnJheVRvRGVidWdTdHIiLCJvdXQiLCJzZXAiLCJ0b0RlYnVnU3RyIiwidG9TdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwibmFtZSIsInNlcXVlbmNlR290VmFsdWUiLCJzZXF1ZW5jZSIsImUiLCJFcnJvciIsImlzRnVuY3Rpb24iLCJmdW5jIiwiY3Vyc29yIiwiZGlmZkZuIiwiUGFja2FnZSIsIkRpZmZTZXF1ZW5jZSIsImRpZmZRdWVyeU9yZGVyZWRDaGFuZ2VzIiwib2xkSWRPYmplY3RzIiwibmV3SWRPYmplY3RzIiwicG9zT2xkIiwicG9zTmV3IiwicG9zQ3VyIiwibGVuZ3RoQ3VyIiwiZm9yRWFjaCIsInB1c2giLCJhZGRlZEJlZm9yZSIsImlkIiwiYmVmb3JlIiwicG9zaXRpb24iLCJlbnRyaWVzIiwicG9zIiwiYWRkZWRBdCIsIm1vdmVkQmVmb3JlIiwib2xkUG9zaXRpb24iLCJuZXdQb3NpdGlvbiIsImVsQ3VyUG9zaXRpb24iLCJtb3ZlZFRvIiwicmVtb3ZlZCIsInByZXZQb3NpdGlvbiIsInJlbW92ZWRBdCIsImlkU3RyaW5nIiwibmV3SXRlbSIsIm9sZEl0ZW0iLCJjaGFuZ2VkQXQiLCJpZHNVc2VkIiwiaW5kZXgiLCJ1bmRlZmluZWQiLCJSYW5kb20iLCJpbml0aWFsIiwib2JzZXJ2ZUhhbmRsZSIsImRvY3VtZW50IiwiYXRJbmRleCIsIm5ld0RvY3VtZW50Iiwib2xkRG9jdW1lbnQiLCJmcm9tSW5kZXgiLCJ0b0luZGV4Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFBTUEsV0FBVyxTQUFVQyxLQUFLO0lBQzlCLElBQUlDLE9BQU8sT0FBT0Q7SUFDbEIsT0FBT0EsU0FBUyxRQUFTQyxTQUFRLFlBQVlBLFFBQVEsVUFBUztBQUNoRTtBQUNBLE1BQU1DLE1BQU0sQ0FBQ0MsS0FBS0M7SUFDaEIsTUFBTUMsV0FBV0MsTUFBTUMsT0FBTyxDQUFDSCxRQUFRQSxPQUFPO1FBQUNBO0tBQUs7SUFDcEQsTUFBTUksU0FBU0gsU0FBU0csTUFBTTtJQUM5QixJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSUQsUUFBUUMsSUFBSztRQUMvQixNQUFNQyxNQUFNTCxRQUFRLENBQUNJLEVBQUU7UUFDdkIsTUFBTUUsT0FBT1IsT0FBTyxRQUFRUyxPQUFPQyxjQUFjLENBQUNDLElBQUks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cEQ7UUFDQWYsU0FBUyxTQUFVYyxRQUFRLEVBQUVJLFNBQVMsRUFBRUMsT0FBTyxFQUFFNUIsTUFBTTtZQUNyRDFELFVBQVVtRSxPQUFPLENBQ2ZjLFNBQVNwRSxHQUFHLEVBQUVvRSxVQUFVSSxXQUFXQyxTQUFTNUI7UUFDaEQ7SUFDRjtJQUNBcUIsVUFBVTtJQUVWLE9BQU87UUFBQ3RFO1FBQVV1RTtLQUFjO0FBQ2xDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vYnNlcnZlLXNlcXVlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaXNPYmplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5jb25zdCBoYXMgPSAob2JqLCBwYXRoKSA9PiB7XG4gIGNvbnN0IHRoaXNQYXRoID0gQXJyYXkuaXNBcnJheShwYXRoKSA/IHBhdGggOiBbcGF0aF07XG4gIGNvbnN0IGxlbmd0aCA9IHRoaXNQYXRoLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGtleSA9IHRoaXNQYXRoW2ldO1xuICAgIGNvbnN0IF9oYXMgPSBvYmogIT0gbnVsbCAmJiBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gICAgaWYgKCFfaGFzKSByZXR1cm4gZmFsc2U7XG4gICAgb2JqID0gb2JqW2tleV07XG4gIH1cbiAgcmV0dXJuICEhbGVuZ3RoO1xufTtcblxuY29uc3Qgd2FybiA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gIGlmIChPYnNlcnZlU2VxdWVuY2UuX3N1cHByZXNzV2FybmluZ3MpIHtcbiAgICBPYnNlcnZlU2VxdWVuY2UuX3N1cHByZXNzV2FybmluZ3MtLTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUud2FybilcbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBhcmdzKTtcblxuICAgIE9ic2VydmVTZXF1ZW5jZS5fbG9nZ2VkV2FybmluZ3MrKztcbiAgfVxufTtcblxuLy8gaXNBcnJheSByZXR1cm5zIHRydWUgZm9yIGFycmF5cyBvZiB0aGVzZSB0eXBlczpcbi8vIHN0YW5kYXJkIGFycmF5czogaW5zdGFuY2VvZiBBcnJheSA9PT0gdHJ1ZSwgXy5pc0FycmF5KGFycikgPT09IHRydWVcbi8vIHZtIGdlbmVyYXRlZCBhcnJheXM6IGluc3RhbmNlT2YgQXJyYXkgPT09IGZhbHNlLCBfLmlzQXJyYXkoYXJyKSA9PT0gdHJ1ZVxuLy8gc3ViY2xhc3NlZCBhcnJheXM6IGluc3RhbmNlb2YgQXJyYXkgPT09IHRydWUsIF8uaXNBcnJheShhcnIpID09PSBmYWxzZVxuLy8gc2VlIHNwZWNpZmljIHRlc3RzXG5mdW5jdGlvbiBpc0FycmF5KGFycikge1xuICByZXR1cm4gYXJyIGluc3RhbmNlb2YgQXJyYXkgfHwgQXJyYXkuaXNBcnJheShhcnIpO1xufVxuXG4vLyBpc0l0ZXJhYmxlIHJldHVybnMgdHJ1ZXMgZm9yIG9iamVjdHMgaW1wbGVtZW50aW5nIGl0ZXJhYmxlIHByb3RvY29sLFxuLy8gZXhjZXB0IHN0cmluZ3MsIGFzIHt7I2VhY2ggJ3N0cmluZyd9fSBkb2Vzbid0IG1ha2UgbXVjaCBzZW5zZS5cbi8vIFJlcXVpcmVzIEVTNisgYW5kIGRvZXMgbm90IHdvcmsgaW4gSUUgKGJ1dCBkZWdyYWRlcyBncmFjZWZ1bGx5KS5cbi8vIERvZXMgbm90IHN1cHBvcnQgdGhlIGBsZW5ndGhgICsgaW5kZXggcHJvdG9jb2wgYWxzbyBzdXBwb3J0ZWQgYnkgQXJyYXkuZnJvbVxuZnVuY3Rpb24gaXNJdGVyYWJsZSAob2JqZWN0KSB7XG4gIGNvbnN0IGl0ZXIgPSB0eXBlb2YgU3ltYm9sICE9ICd1bmRlZmluZWQnICYmIFN5bWJvbC5pdGVyYXRvcjtcbiAgcmV0dXJuIGl0ZXJcbiAgICAmJiBvYmplY3QgaW5zdGFuY2VvZiBPYmplY3QgLy8gbm90ZTogcmV0dXJucyBmYWxzZSBmb3Igc3RyaW5nc1xuICAgICYmIHR5cGVvZiBvYmplY3RbaXRlcl0gPT0gJ2Z1bmN0aW9uJzsgLy8gaW1wbGVtZW50cyBpdGVyYWJsZSBwcm90b2NvbFxufVxuXG5jb25zdCBpZFN0cmluZ2lmeSA9IE1vbmdvSUQuaWRTdHJpbmdpZnk7XG5jb25zdCBpZFBhcnNlID0gTW9uZ29JRC5pZFBhcnNlO1xuXG5PYnNlcnZlU2VxdWVuY2UgPSB7XG4gIF9zdXBwcmVzc1dhcm5pbmdzOiAwLFxuICBfbG9nZ2VkV2FybmluZ3M6IDAsXG5cbiAgLy8gQSBtZWNoYW5pc20gc2ltaWxhciB0byBjdXJzb3Iub2JzZXJ2ZSB3aGljaCByZWNlaXZlcyBhIHJlYWN0aXZlXG4gIC8vIGZ1bmN0aW9uIHJldHVybmluZyBhIHNlcXVlbmNlIHR5cGUgYW5kIGZpcmluZyBhcHByb3ByaWF0ZSBjYWxsYmFja3NcbiAgLy8gd2hlbiB0aGUgdmFsdWUgY2hhbmdlcy5cbiAgLy9cbiAgLy8gQHBhcmFtIHNlcXVlbmNlRnVuYyB7RnVuY3Rpb259IGEgcmVhY3RpdmUgZnVuY3Rpb24gcmV0dXJuaW5nIGFcbiAgLy8gICAgIHNlcXVlbmNlIHR5cGUuIFRoZSBjdXJyZW50bHkgc3VwcG9ydGVkIHNlcXVlbmNlIHR5cGVzIGFyZTpcbiAgLy8gICAgIEFycmF5LCBDdXJzb3IsIGFuZCBudWxsLlxuICAvL1xuICAvLyBAcGFyYW0gY2FsbGJhY2tzIHtPYmplY3R9IHNpbWlsYXIgdG8gYSBzcGVjaWZpYyBzdWJzZXQgb2ZcbiAgLy8gICAgIGNhbGxiYWNrcyBwYXNzZWQgdG8gYGN1cnNvci5vYnNlcnZlYFxuICAvLyAgICAgKGh0dHA6Ly9kb2NzLm1ldGVvci5jb20vI29ic2VydmUpLCB3aXRoIG1pbm9yIHZhcmlhdGlvbnMgdG9cbiAgLy8gICAgIHN1cHBvcnQgdGhlIGZhY3QgdGhhdCBub3QgYWxsIHNlcXVlbmNlcyBjb250YWluIG9iamVjdHMgd2l0aFxuICAvLyAgICAgX2lkIGZpZWxkcy4gIFNwZWNpZmljYWxseTpcbiAgLy9cbiAgLy8gICAgICogYWRkZWRBdChpZCwgaXRlbSwgYXRJbmRleCwgYmVmb3JlSWQpXG4gIC8vICAgICAqIGNoYW5nZWRBdChpZCwgbmV3SXRlbSwgb2xkSXRlbSwgYXRJbmRleClcbiAgLy8gICAgICogcmVtb3ZlZEF0KGlkLCBvbGRJdGVtLCBhdEluZGV4KVxuICAvLyAgICAgKiBtb3ZlZFRvKGlkLCBpdGVtLCBmcm9tSW5kZXgsIHRvSW5kZXgsIGJlZm9yZUlkKVxuICAvL1xuICAvLyBAcmV0dXJucyB7T2JqZWN0KHN0b3A6IEZ1bmN0aW9uKX0gY2FsbCAnc3RvcCcgb24gdGhlIHJldHVybiB2YWx1ZVxuICAvLyAgICAgdG8gc3RvcCBvYnNlcnZpbmcgdGhpcyBzZXF1ZW5jZSBmdW5jdGlvbi5cbiAgLy9cbiAgLy8gV2UgZG9uJ3QgbWFrZSBhbnkgYXNzdW1wdGlvbnMgYWJvdXQgb3VyIGFiaWxpdHkgdG8gY29tcGFyZSBzZXF1ZW5jZVxuICAvLyBlbGVtZW50cyAoaWUsIHdlIGRvbid0IGFzc3VtZSBFSlNPTi5lcXVhbHMgd29ya3M7IG1heWJlIHRoZXJlIGlzIGV4dHJhXG4gIC8vIHN0YXRlL3JhbmRvbSBtZXRob2RzIG9uIHRoZSBvYmplY3RzKSBzbyB1bmxpa2UgY3Vyc29yLm9ic2VydmUsIHdlIG1heVxuICAvLyBzb21ldGltZXMgY2FsbCBjaGFuZ2VkQXQoKSB3aGVuIG5vdGhpbmcgYWN0dWFsbHkgY2hhbmdlZC5cbiAgLy8gWFhYIGNvbnNpZGVyIGlmIHdlICpjYW4qIG1ha2UgdGhlIHN0cm9uZ2VyIGFzc3VtcHRpb24gYW5kIGF2b2lkXG4gIC8vICAgICBuby1vcCBjaGFuZ2VkQXQgY2FsbHMgKGluIHNvbWUgY2FzZXM/KVxuICAvL1xuICAvLyBYWFggY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdGhlIGNhbGxiYWNrcyB1c2VkIGJ5IG91clxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiB7eyNlYWNofX0sIGJ1dCB0aGlzIGNhbiBiZSBleHBhbmRlZC5cbiAgLy9cbiAgLy8gWFhYICNlYWNoIGRvZXNuJ3QgdXNlIHRoZSBpbmRpY2VzICh0aG91Z2ggd2UnbGwgZXZlbnR1YWxseSBuZWVkXG4gIC8vIGEgd2F5IHRvIGdldCB0aGVtIHdoZW4gd2Ugc3VwcG9ydCBgQGluZGV4YCksIGJ1dCBjYWxsaW5nXG4gIC8vIGBjdXJzb3Iub2JzZXJ2ZWAgY2F1c2VzIHRoZSBpbmRleCB0byBiZSBjYWxjdWxhdGVkIG9uIGV2ZXJ5XG4gIC8vIGNhbGxiYWNrIHVzaW5nIGEgbGluZWFyIHNjYW4gKHVubGVzcyB5b3UgdHVybiBpdCBvZmYgYnkgcGFzc2luZ1xuICAvLyBgX25vX2luZGljZXNgKS4gIEFueSB3YXkgdG8gYXZvaWQgY2FsY3VsYXRpbmcgaW5kaWNlcyBvbiBhIHB1cmVcbiAgLy8gY3Vyc29yIG9ic2VydmUgbGlrZSB3ZSB1c2VkIHRvP1xuICBvYnNlcnZlOiBmdW5jdGlvbiAoc2VxdWVuY2VGdW5jLCBjYWxsYmFja3MpIHtcbiAgICB2YXIgbGFzdFNlcSA9IG51bGw7XG4gICAgdmFyIGFjdGl2ZU9ic2VydmVIYW5kbGUgPSBudWxsO1xuXG4gICAgLy8gJ2xhc3RTZXFBcnJheScgY29udGFpbnMgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBzZXF1ZW5jZVxuICAgIC8vIHdlJ3JlIG9ic2VydmluZy4gSXQgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoICdfaWQnIGFuZFxuICAgIC8vICdpdGVtJyBmaWVsZHMuICAnaXRlbScgaXMgdGhlIGVsZW1lbnQgaW4gdGhlIGFycmF5LCBvciB0aGVcbiAgICAvLyBkb2N1bWVudCBpbiB0aGUgY3Vyc29yLlxuICAgIC8vXG4gICAgLy8gJ19pZCcgaXMgd2hpY2hldmVyIG9mIHRoZSBmb2xsb3dpbmcgaXMgcmVsZXZhbnQsIHVubGVzcyBpdCBoYXNcbiAgICAvLyBhbHJlYWR5IGFwcGVhcmVkIC0tIGluIHdoaWNoIGNhc2UgaXQncyByYW5kb21seSBnZW5lcmF0ZWQuXG4gICAgLy9cbiAgICAvLyAqIGlmICdpdGVtJyBpcyBhbiBvYmplY3Q6XG4gICAgLy8gICAqIGFuICdfaWQnIGZpZWxkLCBpZiBwcmVzZW50XG4gICAgLy8gICAqIG90aGVyd2lzZSwgdGhlIGluZGV4IGluIHRoZSBhcnJheVxuICAgIC8vXG4gICAgLy8gKiBpZiAnaXRlbScgaXMgYSBudW1iZXIgb3Igc3RyaW5nLCB1c2UgdGhhdCB2YWx1ZVxuICAgIC8vXG4gICAgLy8gWFhYIHRoaXMgY2FuIGJlIGdlbmVyYWxpemVkIGJ5IGFsbG93aW5nIHt7I2VhY2h9fSB0byBhY2NlcHQgYVxuICAgIC8vIGdlbmVyYWwgJ2tleScgYXJndW1lbnQgd2hpY2ggY291bGQgYmUgYSBmdW5jdGlvbiwgYSBkb3R0ZWRcbiAgICAvLyBmaWVsZCBuYW1lLCBvciB0aGUgc3BlY2lhbCBAaW5kZXggdmFsdWUuXG4gICAgdmFyIGxhc3RTZXFBcnJheSA9IFtdOyAvLyBlbGVtZW50cyBhcmUgb2JqZWN0cyBvZiBmb3JtIHtfaWQsIGl0ZW19XG4gICAgdmFyIGNvbXB1dGF0aW9uID0gVHJhY2tlci5hdXRvcnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZXEgPSBzZXF1ZW5jZUZ1bmMoKTtcblxuICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZXFBcnJheTsgLy8gc2FtZSBzdHJ1Y3R1cmUgYXMgYGxhc3RTZXFBcnJheWAgYWJvdmUuXG5cbiAgICAgICAgaWYgKGFjdGl2ZU9ic2VydmVIYW5kbGUpIHtcbiAgICAgICAgICAvLyBJZiB3ZSB3ZXJlIHByZXZpb3VzbHkgb2JzZXJ2aW5nIGEgY3Vyc29yLCByZXBsYWNlIGxhc3RTZXFBcnJheSB3aXRoXG4gICAgICAgICAgLy8gbW9yZSB1cC10by1kYXRlIGluZm9ybWF0aW9uLiAgVGhlbiBzdG9wIHRoZSBvbGQgb2JzZXJ2ZS5cbiAgICAgICAgICBsYXN0U2VxQXJyYXkgPSBsYXN0U2VxLmZldGNoKCkubWFwKGZ1bmN0aW9uIChkb2MpIHtcbiAgICAgICAgICAgIHJldHVybiB7X2lkOiBkb2MuX2lkLCBpdGVtOiBkb2N9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGFjdGl2ZU9ic2VydmVIYW5kbGUuc3RvcCgpO1xuICAgICAgICAgIGFjdGl2ZU9ic2VydmVIYW5kbGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZXEpIHtcbiAgICAgICAgICBzZXFBcnJheSA9IHNlcUNoYW5nZWRUb0VtcHR5KGxhc3RTZXFBcnJheSwgY2FsbGJhY2tzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHNlcSkpIHtcbiAgICAgICAgICBzZXFBcnJheSA9IHNlcUNoYW5nZWRUb0FycmF5KGxhc3RTZXFBcnJheSwgc2VxLCBjYWxsYmFja3MpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3RvcmVDdXJzb3Ioc2VxKSkge1xuICAgICAgICAgIHZhciByZXN1bHQgLyogW3NlcUFycmF5LCBhY3RpdmVPYnNlcnZlSGFuZGxlXSAqLyA9XG4gICAgICAgICAgICAgICAgc2VxQ2hhbmdlZFRvQ3Vyc29yKGxhc3RTZXFBcnJheSwgc2VxLCBjYWxsYmFja3MpO1xuICAgICAgICAgIHNlcUFycmF5ID0gcmVzdWx0WzBdO1xuICAgICAgICAgIGFjdGl2ZU9ic2VydmVIYW5kbGUgPSByZXN1bHRbMV07XG4gICAgICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZShzZXEpKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXkgPSBBcnJheS5mcm9tKHNlcSk7XG4gICAgICAgICAgc2VxQXJyYXkgPSBzZXFDaGFuZ2VkVG9BcnJheShsYXN0U2VxQXJyYXksIGFycmF5LCBjYWxsYmFja3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGJhZFNlcXVlbmNlRXJyb3Ioc2VxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpZmZBcnJheShsYXN0U2VxQXJyYXksIHNlcUFycmF5LCBjYWxsYmFja3MpO1xuICAgICAgICBsYXN0U2VxID0gc2VxO1xuICAgICAgICBsYXN0U2VxQXJyYXkgPSBzZXFBcnJheTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29tcHV0YXRpb24uc3RvcCgpO1xuICAgICAgICBpZiAoYWN0aXZlT2JzZXJ2ZUhhbmRsZSlcbiAgICAgICAgICBhY3RpdmVPYnNlcnZlSGFuZGxlLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIC8vIEZldGNoIHRoZSBpdGVtcyBvZiBgc2VxYCBpbnRvIGFuIGFycmF5LCB3aGVyZSBgc2VxYCBpcyBvZiBvbmUgb2YgdGhlXG4gIC8vIHNlcXVlbmNlIHR5cGVzIGFjY2VwdGVkIGJ5IGBvYnNlcnZlYC4gIElmIGBzZXFgIGlzIGEgY3Vyc29yLCBhXG4gIC8vIGRlcGVuZGVuY3kgaXMgZXN0YWJsaXNoZWQuXG4gIGZldGNoOiBmdW5jdGlvbiAoc2VxKSB7XG4gICAgaWYgKCFzZXEpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoc2VxKSkge1xuICAgICAgcmV0dXJuIHNlcTtcbiAgICB9IGVsc2UgaWYgKGlzU3RvcmVDdXJzb3Ioc2VxKSkge1xuICAgICAgcmV0dXJuIHNlcS5mZXRjaCgpO1xuICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZShzZXEpKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShzZXEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBiYWRTZXF1ZW5jZUVycm9yKHNlcSk7XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBlbGxpcHNpcyhsb25nU3RyLCBtYXhMZW5ndGgpIHtcbiAgaWYoIW1heExlbmd0aCkgbWF4TGVuZ3RoID0gMTAwO1xuICBpZihsb25nU3RyLmxlbmd0aCA8IG1heExlbmd0aCkgcmV0dXJuIGxvbmdTdHI7XG4gIHJldHVybiBsb25nU3RyLnN1YnN0cigwLCBtYXhMZW5ndGgtMSkgKyAn4oCmJztcbn1cblxuZnVuY3Rpb24gYXJyYXlUb0RlYnVnU3RyKHZhbHVlLCBtYXhMZW5ndGgpIHtcbiAgdmFyIG91dCA9ICcnLCBzZXAgPSAnJztcbiAgZm9yKHZhciBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSB2YWx1ZVtpXTtcbiAgICBvdXQgKz0gc2VwICsgdG9EZWJ1Z1N0cihpdGVtLCBtYXhMZW5ndGgpO1xuICAgIGlmKG91dC5sZW5ndGggPiBtYXhMZW5ndGgpIHJldHVybiBvdXQ7XG4gICAgc2VwID0gJywgJztcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiB0b0RlYnVnU3RyKHZhbHVlLCBtYXhMZW5ndGgpIHtcbiAgaWYoIW1heExlbmd0aCkgbWF4TGVuZ3RoID0gMTUwO1xuICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7IC8vIGFkZCBxdW90ZXNcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgaWYodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgIH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gJ0FycmF5IFsnICsgYXJyYXlUb0RlYnVnU3RyKHZhbHVlLCBtYXhMZW5ndGgpICsgJ10nO1xuICAgICAgfSBlbHNlIGlmKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSkgeyAvLyBNYXAgYW5kIFNldCBhcmUgbm90IGhhbmRsZWQgYnkgSlNPTi5zdHJpbmdpZnlcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgICArICcgWycgKyBhcnJheVRvRGVidWdTdHIoQXJyYXkuZnJvbSh2YWx1ZSksIG1heExlbmd0aClcbiAgICAgICAgICArICddJzsgLy8gQXJyYXkuZnJvbSBkb2Vzbid0IHdvcmsgaW4gSUUsIGJ1dCBuZWl0aGVyIGRvIGl0ZXJhdG9ycyBzbyBpdCdzIHVucmVhY2hhYmxlXG4gICAgICB9IGVsc2UgeyAvLyB1c2UgSlNPTi5zdHJpbmdpZnkgKHNvbWV0aW1lcyB0b1N0cmluZyBjYW4gYmUgYmV0dGVyIGJ1dCB3ZSBkb24ndCBrbm93KVxuICAgICAgICByZXR1cm4gdmFsdWUuY29uc3RydWN0b3IubmFtZSArICcgJ1xuICAgICAgICAgICAgICsgZWxsaXBzaXMoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCBtYXhMZW5ndGgpO1xuICAgICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdHlwZSArICc6ICcgKyB2YWx1ZS50b1N0cmluZygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNlcXVlbmNlR290VmFsdWUoc2VxdWVuY2UpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gJyBHb3QgJyArIHRvRGVidWdTdHIoc2VxdWVuY2UpO1xuICB9IGNhdGNoKGUpIHtcbiAgICByZXR1cm4gJydcbiAgfVxufVxuXG5jb25zdCBiYWRTZXF1ZW5jZUVycm9yID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoXCJ7eyNlYWNofX0gY3VycmVudGx5IG9ubHkgYWNjZXB0cyBcIiArXG4gICAgICAgICAgICAgICAgICAgXCJhcnJheXMsIGN1cnNvcnMsIGl0ZXJhYmxlcyBvciBmYWxzZXkgdmFsdWVzLlwiICtcbiAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZUdvdFZhbHVlKHNlcXVlbmNlKSk7XG59O1xuXG5jb25zdCBpc0Z1bmN0aW9uID0gKGZ1bmMpID0+IHtcbiAgcmV0dXJuIHR5cGVvZiBmdW5jID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbmNvbnN0IGlzU3RvcmVDdXJzb3IgPSBmdW5jdGlvbiAoY3Vyc29yKSB7XG4gIHJldHVybiBjdXJzb3IgJiYgaXNPYmplY3QoY3Vyc29yKSAmJlxuICAgIGlzRnVuY3Rpb24oY3Vyc29yLm9ic2VydmUpICYmIGlzRnVuY3Rpb24oY3Vyc29yLmZldGNoKTtcbn07XG5cbi8vIENhbGN1bGF0ZXMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYGxhc3RTZXFBcnJheWAgYW5kXG4vLyBgc2VxQXJyYXlgIGFuZCBjYWxscyBhcHByb3ByaWF0ZSBmdW5jdGlvbnMgZnJvbSBgY2FsbGJhY2tzYC5cbi8vIFJldXNlcyBNaW5pbW9uZ28ncyBkaWZmIGFsZ29yaXRobSBpbXBsZW1lbnRhdGlvbi5cbmNvbnN0IGRpZmZBcnJheSA9IGZ1bmN0aW9uIChsYXN0U2VxQXJyYXksIHNlcUFycmF5LCBjYWxsYmFja3MpIHtcbiAgdmFyIGRpZmZGbiA9IFBhY2thZ2VbJ2RpZmYtc2VxdWVuY2UnXS5EaWZmU2VxdWVuY2UuZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXM7XG4gIHZhciBvbGRJZE9iamVjdHMgPSBbXTtcbiAgdmFyIG5ld0lkT2JqZWN0cyA9IFtdO1xuICB2YXIgcG9zT2xkID0ge307IC8vIG1hcHMgZnJvbSBpZFN0cmluZ2lmeSdkIGlkc1xuICB2YXIgcG9zTmV3ID0ge307IC8vIGRpdHRvXG4gIHZhciBwb3NDdXIgPSB7fTtcbiAgdmFyIGxlbmd0aEN1ciA9IGxhc3RTZXFBcnJheS5sZW5ndGg7XG5cbiAgc2VxQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoZG9jLCBpKSB7XG4gICAgbmV3SWRPYmplY3RzLnB1c2goe19pZDogZG9jLl9pZH0pO1xuICAgIHBvc05ld1tpZFN0cmluZ2lmeShkb2MuX2lkKV0gPSBpO1xuICB9KTtcbiAgbGFzdFNlcUFycmF5LmZvckVhY2goZnVuY3Rpb24gKGRvYywgaSkge1xuICAgIG9sZElkT2JqZWN0cy5wdXNoKHtfaWQ6IGRvYy5faWR9KTtcbiAgICBwb3NPbGRbaWRTdHJpbmdpZnkoZG9jLl9pZCldID0gaTtcbiAgICBwb3NDdXJbaWRTdHJpbmdpZnkoZG9jLl9pZCldID0gaTtcbiAgfSk7XG5cbiAgLy8gQXJyYXlzIGNhbiBjb250YWluIGFyYml0cmFyeSBvYmplY3RzLiBXZSBkb24ndCBkaWZmIHRoZVxuICAvLyBvYmplY3RzLiBJbnN0ZWFkIHdlIGFsd2F5cyBmaXJlICdjaGFuZ2VkQXQnIGNhbGxiYWNrIG9uIGV2ZXJ5XG4gIC8vIG9iamVjdC4gVGhlIGNvbnN1bWVyIG9mIGBvYnNlcnZlLXNlcXVlbmNlYCBzaG91bGQgZGVhbCB3aXRoXG4gIC8vIGl0IGFwcHJvcHJpYXRlbHkuXG4gIGRpZmZGbihvbGRJZE9iamVjdHMsIG5ld0lkT2JqZWN0cywge1xuICAgIGFkZGVkQmVmb3JlOiBmdW5jdGlvbiAoaWQsIGRvYywgYmVmb3JlKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBiZWZvcmUgPyBwb3NDdXJbaWRTdHJpbmdpZnkoYmVmb3JlKV0gOiBsZW5ndGhDdXI7XG5cbiAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgLy8gSWYgbm90IGFkZGluZyBhdCB0aGUgZW5kLCB3ZSBuZWVkIHRvIHVwZGF0ZSBpbmRleGVzLlxuICAgICAgICAvLyBYWFggdGhpcyBjYW4gc3RpbGwgYmUgaW1wcm92ZWQgZ3JlYXRseSFcbiAgICAgICAgT2JqZWN0LmVudHJpZXMocG9zQ3VyKS5mb3JFYWNoKGZ1bmN0aW9uIChbaWQsIHBvc10pIHtcbiAgICAgICAgICBpZiAocG9zID49IHBvc2l0aW9uKVxuICAgICAgICAgICAgcG9zQ3VyW2lkXSsrO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbGVuZ3RoQ3VyKys7XG4gICAgICBwb3NDdXJbaWRTdHJpbmdpZnkoaWQpXSA9IHBvc2l0aW9uO1xuXG4gICAgICBjYWxsYmFja3MuYWRkZWRBdChcbiAgICAgICAgaWQsXG4gICAgICAgIHNlcUFycmF5W3Bvc05ld1tpZFN0cmluZ2lmeShpZCldXS5pdGVtLFxuICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgYmVmb3JlKTtcbiAgICB9LFxuICAgIG1vdmVkQmVmb3JlOiBmdW5jdGlvbiAoaWQsIGJlZm9yZSkge1xuICAgICAgaWYgKGlkID09PSBiZWZvcmUpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdmFyIG9sZFBvc2l0aW9uID0gcG9zQ3VyW2lkU3RyaW5naWZ5KGlkKV07XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBiZWZvcmUgPyBwb3NDdXJbaWRTdHJpbmdpZnkoYmVmb3JlKV0gOiBsZW5ndGhDdXI7XG5cbiAgICAgIC8vIE1vdmluZyB0aGUgaXRlbSBmb3J3YXJkLiBUaGUgbmV3IGVsZW1lbnQgaXMgbG9zaW5nIG9uZSBwb3NpdGlvbiBhcyBpdFxuICAgICAgLy8gd2FzIHJlbW92ZWQgZnJvbSB0aGUgb2xkIHBvc2l0aW9uIGJlZm9yZSBiZWluZyBpbnNlcnRlZCBhdCB0aGUgbmV3XG4gICAgICAvLyBwb3NpdGlvbi5cbiAgICAgIC8vIEV4LjogICAwICAqMSogIDIgICAzICAgNFxuICAgICAgLy8gICAgICAgIDAgICAyICAgMyAgKjEqICA0XG4gICAgICAvLyBUaGUgb3JpZ2luYWwgaXNzdWVkIGNhbGxiYWNrIGlzIFwiMVwiIGJlZm9yZSBcIjRcIi5cbiAgICAgIC8vIFRoZSBwb3NpdGlvbiBvZiBcIjFcIiBpcyAxLCB0aGUgcG9zaXRpb24gb2YgXCI0XCIgaXMgNC5cbiAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgbW92ZSBpcyAoMSkgLT4gKDMpXG4gICAgICBpZiAobmV3UG9zaXRpb24gPiBvbGRQb3NpdGlvbikge1xuICAgICAgICBuZXdQb3NpdGlvbi0tO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXggdXAgdGhlIHBvc2l0aW9ucyBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBvbGQgYW5kIHRoZSBuZXcgcG9zaXRpb25zXG4gICAgICAvLyBvZiB0aGUgbW92ZWQgZWxlbWVudC5cbiAgICAgIC8vXG4gICAgICAvLyBUaGVyZSBhcmUgdHdvIGNhc2VzOlxuICAgICAgLy8gICAxLiBUaGUgZWxlbWVudCBpcyBtb3ZlZCBmb3J3YXJkLiBUaGVuIGFsbCB0aGUgcG9zaXRpb25zIGluIGJldHdlZW5cbiAgICAgIC8vICAgYXJlIG1vdmVkIGJhY2suXG4gICAgICAvLyAgIDIuIFRoZSBlbGVtZW50IGlzIG1vdmVkIGJhY2suIFRoZW4gdGhlIHBvc2l0aW9ucyBpbiBiZXR3ZWVuICphbmQqIHRoZVxuICAgICAgLy8gICBlbGVtZW50IHRoYXQgaXMgY3VycmVudGx5IHN0YW5kaW5nIG9uIHRoZSBtb3ZlZCBlbGVtZW50J3MgZnV0dXJlXG4gICAgICAvLyAgIHBvc2l0aW9uIGFyZSBtb3ZlZCBmb3J3YXJkLlxuICAgICAgT2JqZWN0LmVudHJpZXMocG9zQ3VyKS5mb3JFYWNoKGZ1bmN0aW9uIChbaWQsIGVsQ3VyUG9zaXRpb25dKSB7XG4gICAgICAgIGlmIChvbGRQb3NpdGlvbiA8IGVsQ3VyUG9zaXRpb24gJiYgZWxDdXJQb3NpdGlvbiA8IG5ld1Bvc2l0aW9uKVxuICAgICAgICAgIHBvc0N1cltpZF0tLTtcbiAgICAgICAgZWxzZSBpZiAobmV3UG9zaXRpb24gPD0gZWxDdXJQb3NpdGlvbiAmJiBlbEN1clBvc2l0aW9uIDwgb2xkUG9zaXRpb24pXG4gICAgICAgICAgcG9zQ3VyW2lkXSsrO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbmFsbHksIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIG1vdmVkIGVsZW1lbnQuXG4gICAgICBwb3NDdXJbaWRTdHJpbmdpZnkoaWQpXSA9IG5ld1Bvc2l0aW9uO1xuXG4gICAgICBjYWxsYmFja3MubW92ZWRUbyhcbiAgICAgICAgaWQsXG4gICAgICAgIHNlcUFycmF5W3Bvc05ld1tpZFN0cmluZ2lmeShpZCldXS5pdGVtLFxuICAgICAgICBvbGRQb3NpdGlvbixcbiAgICAgICAgbmV3UG9zaXRpb24sXG4gICAgICAgIGJlZm9yZSk7XG4gICAgfSxcbiAgICByZW1vdmVkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHZhciBwcmV2UG9zaXRpb24gPSBwb3NDdXJbaWRTdHJpbmdpZnkoaWQpXTtcblxuICAgICAgT2JqZWN0LmVudHJpZXMocG9zQ3VyKS5mb3JFYWNoKGZ1bmN0aW9uIChbaWQsIHBvc10pIHtcbiAgICAgICAgaWYgKHBvcyA+PSBwcmV2UG9zaXRpb24pXG4gICAgICAgICAgcG9zQ3VyW2lkXS0tO1xuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZSBwb3NDdXJbaWRTdHJpbmdpZnkoaWQpXTtcbiAgICAgIGxlbmd0aEN1ci0tO1xuXG4gICAgICBjYWxsYmFja3MucmVtb3ZlZEF0KFxuICAgICAgICBpZCxcbiAgICAgICAgbGFzdFNlcUFycmF5W3Bvc09sZFtpZFN0cmluZ2lmeShpZCldXS5pdGVtLFxuICAgICAgICBwcmV2UG9zaXRpb24pO1xuICAgIH1cbiAgfSk7XG4gIFxuICBPYmplY3QuZW50cmllcyhwb3NOZXcpLmZvckVhY2goZnVuY3Rpb24gKFtpZFN0cmluZywgcG9zXSkge1xuXG4gICAgdmFyIGlkID0gaWRQYXJzZShpZFN0cmluZyk7XG4gICAgXG4gICAgaWYgKGhhcyhwb3NPbGQsIGlkU3RyaW5nKSkge1xuICAgICAgLy8gc3BlY2lmaWNhbGx5IGZvciBwcmltaXRpdmUgdHlwZXMsIGNvbXBhcmUgZXF1YWxpdHkgYmVmb3JlXG4gICAgICAvLyBmaXJpbmcgdGhlICdjaGFuZ2VkQXQnIGNhbGxiYWNrLiBvdGhlcndpc2UsIGFsd2F5cyBmaXJlIGl0XG4gICAgICAvLyBiZWNhdXNlIGRvaW5nIGEgZGVlcCBFSlNPTiBjb21wYXJpc29uIGlzIG5vdCBndWFyYW50ZWVkIHRvXG4gICAgICAvLyB3b3JrIChhbiBhcnJheSBjYW4gY29udGFpbiBhcmJpdHJhcnkgb2JqZWN0cywgYW5kICd0cmFuc2Zvcm0nXG4gICAgICAvLyBjYW4gYmUgdXNlZCBvbiBjdXJzb3JzKS4gYWxzbywgZGVlcCBkaWZmaW5nIGlzIG5vdFxuICAgICAgLy8gbmVjZXNzYXJpbHkgdGhlIG1vc3QgZWZmaWNpZW50IChpZiBvbmx5IGEgc3BlY2lmaWMgc3ViZmllbGRcbiAgICAgIC8vIG9mIHRoZSBvYmplY3QgaXMgbGF0ZXIgYWNjZXNzZWQpLlxuICAgICAgdmFyIG5ld0l0ZW0gPSBzZXFBcnJheVtwb3NdLml0ZW07XG4gICAgICB2YXIgb2xkSXRlbSA9IGxhc3RTZXFBcnJheVtwb3NPbGRbaWRTdHJpbmddXS5pdGVtO1xuXG4gICAgICBpZiAodHlwZW9mIG5ld0l0ZW0gPT09ICdvYmplY3QnIHx8IG5ld0l0ZW0gIT09IG9sZEl0ZW0pXG4gICAgICAgICAgY2FsbGJhY2tzLmNoYW5nZWRBdChpZCwgbmV3SXRlbSwgb2xkSXRlbSwgcG9zKTtcbiAgICAgIH1cbiAgfSk7XG59O1xuXG5zZXFDaGFuZ2VkVG9FbXB0eSA9IGZ1bmN0aW9uIChsYXN0U2VxQXJyYXksIGNhbGxiYWNrcykge1xuICByZXR1cm4gW107XG59O1xuXG5zZXFDaGFuZ2VkVG9BcnJheSA9IGZ1bmN0aW9uIChsYXN0U2VxQXJyYXksIGFycmF5LCBjYWxsYmFja3MpIHtcbiAgdmFyIGlkc1VzZWQgPSB7fTtcbiAgdmFyIHNlcUFycmF5ID0gYXJyYXkubWFwKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgIHZhciBpZDtcbiAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBlbnN1cmUgbm90IGVtcHR5LCBzaW5jZSBvdGhlciBsYXllcnMgKGVnIERvbVJhbmdlKSBhc3N1bWUgdGhpcyBhcyB3ZWxsXG4gICAgICBpZCA9IFwiLVwiICsgaXRlbTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgdHlwZW9mIGl0ZW0gPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgICAgICAgaXRlbSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgICBpdGVtID09PSBudWxsKSB7XG4gICAgICBpZCA9IGl0ZW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkID0gKGl0ZW0gJiYgKCdfaWQnIGluIGl0ZW0pKSA/IGl0ZW0uX2lkIDogaW5kZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInt7I2VhY2h9fSBkb2Vzbid0IHN1cHBvcnQgYXJyYXlzIHdpdGggXCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFwiZWxlbWVudHMgb2YgdHlwZSBcIiArIHR5cGVvZiBpdGVtKTtcbiAgICB9XG5cbiAgICB2YXIgaWRTdHJpbmcgPSBpZFN0cmluZ2lmeShpZCk7XG4gICAgaWYgKGlkc1VzZWRbaWRTdHJpbmddKSB7XG4gICAgICBpZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgJ19pZCcgaW4gaXRlbSlcbiAgICAgICAgd2FybihcImR1cGxpY2F0ZSBpZCBcIiArIGlkICsgXCIgaW5cIiwgYXJyYXkpO1xuICAgICAgaWQgPSBSYW5kb20uaWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRzVXNlZFtpZFN0cmluZ10gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7IF9pZDogaWQsIGl0ZW06IGl0ZW0gfTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNlcUFycmF5O1xufTtcblxuc2VxQ2hhbmdlZFRvQ3Vyc29yID0gZnVuY3Rpb24gKGxhc3RTZXFBcnJheSwgY3Vyc29yLCBjYWxsYmFja3MpIHtcbiAgdmFyIGluaXRpYWwgPSB0cnVlOyAvLyBhcmUgd2Ugb2JzZXJ2aW5nIGluaXRpYWwgZGF0YSBmcm9tIGN1cnNvcj9cbiAgdmFyIHNlcUFycmF5ID0gW107XG5cbiAgdmFyIG9ic2VydmVIYW5kbGUgPSBjdXJzb3Iub2JzZXJ2ZSh7XG4gICAgYWRkZWRBdDogZnVuY3Rpb24gKGRvY3VtZW50LCBhdEluZGV4LCBiZWZvcmUpIHtcbiAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgaW5pdGlhbCBkYXRhIHNvIHRoYXQgd2UgY2FuIGRpZmYgb25jZVxuICAgICAgICAvLyB3ZSBleGl0IGBvYnNlcnZlYC5cbiAgICAgICAgaWYgKGJlZm9yZSAhPT0gbnVsbClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBpbml0aWFsIGRhdGEgZnJvbSBvYnNlcnZlIGluIG9yZGVyXCIpO1xuICAgICAgICBzZXFBcnJheS5wdXNoKHsgX2lkOiBkb2N1bWVudC5faWQsIGl0ZW06IGRvY3VtZW50IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2tzLmFkZGVkQXQoZG9jdW1lbnQuX2lkLCBkb2N1bWVudCwgYXRJbmRleCwgYmVmb3JlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNoYW5nZWRBdDogZnVuY3Rpb24gKG5ld0RvY3VtZW50LCBvbGREb2N1bWVudCwgYXRJbmRleCkge1xuICAgICAgY2FsbGJhY2tzLmNoYW5nZWRBdChuZXdEb2N1bWVudC5faWQsIG5ld0RvY3VtZW50LCBvbGREb2N1bWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXRJbmRleCk7XG4gICAgfSxcbiAgICByZW1vdmVkQXQ6IGZ1bmN0aW9uIChvbGREb2N1bWVudCwgYXRJbmRleCkge1xuICAgICAgY2FsbGJhY2tzLnJlbW92ZWRBdChvbGREb2N1bWVudC5faWQsIG9sZERvY3VtZW50LCBhdEluZGV4KTtcbiAgICB9LFxuICAgIG1vdmVkVG86IGZ1bmN0aW9uIChkb2N1bWVudCwgZnJvbUluZGV4LCB0b0luZGV4LCBiZWZvcmUpIHtcbiAgICAgIGNhbGxiYWNrcy5tb3ZlZFRvKFxuICAgICAgICBkb2N1bWVudC5faWQsIGRvY3VtZW50LCBmcm9tSW5kZXgsIHRvSW5kZXgsIGJlZm9yZSk7XG4gICAgfVxuICB9KTtcbiAgaW5pdGlhbCA9IGZhbHNlO1xuXG4gIHJldHVybiBbc2VxQXJyYXksIG9ic2VydmVIYW5kbGVdO1xufTtcbiJdfQ==
