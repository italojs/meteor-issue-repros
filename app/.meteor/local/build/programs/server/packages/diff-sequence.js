Package["core-runtime"].queue("diff-sequence",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var DiffSequence;

var require = meteorInstall({"node_modules":{"meteor":{"diff-sequence":{"diff.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/diff-sequence/diff.js                                                                 //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
module.export({DiffSequence:()=>DiffSequence},true);const DiffSequence = {};
const hasOwn = Object.prototype.hasOwnProperty;
function isObjEmpty(obj) {
    for(const key in Object(obj)){
        if (hasOwn.call(obj, key)) {
            return false;
        }
    }
    return true;
}
// ordered: bool.
// old_results and new_results: collections of documents.
//    if ordered, they are arrays.
//    if unordered, they are IdMaps
DiffSequence.diffQueryChanges = function(ordered, oldResults, newResults, observer, options) {
    if (ordered) DiffSequence.diffQueryOrderedChanges(oldResults, newResults, observer, options);
    else DiffSequence.diffQueryUnorderedChanges(oldResults, newResults, observer, options);
};
DiffSequence.diffQueryUnorderedChanges = function(oldResults, newResults, observer, options) {
    options = options || {};
    const projectionFn = options.projectionFn || EJSON.clone;
    if (observer.movedBefore) {
        throw new Error("_diffQueryUnordered called with a movedBefore observer!");
    }
    newResults.forEach(function(newDoc, id) {
        const oldDoc = oldResults.get(id);
        if (oldDoc) {
            if (observer.changed && !EJSON.equals(oldDoc, newDoc)) {
                const projectedNew = projectionFn(newDoc);
                const projectedOld = projectionFn(oldDoc);
                const changedFields = DiffSequence.makeChangedFields(projectedNew, projectedOld);
                if (!isObjEmpty(changedFields)) {
                    observer.changed(id, changedFields);
                }
            }
        } else if (observer.added) {
            const fields = projectionFn(newDoc);
            delete fields._id;
            observer.added(newDoc._id, fields);
        }
    });
    if (observer.removed) {
        oldResults.forEach(function(oldDoc, id) {
            if (!newResults.has(id)) observer.removed(id);
        });
    }
};
DiffSequence.diffQueryOrderedChanges = function(old_results, new_results, observer, options) {
    options = options || {};
    const projectionFn = options.projectionFn || EJSON.clone;
    const new_presence_of_id = {};
    new_results.forEach(function(doc) {
        if (new_presence_of_id[doc._id]) Meteor._debug("Duplicate _id in new_results");
        new_presence_of_id[doc._id] = true;
    });
    const old_index_of_id = {};
    old_results.forEach(function(doc, i) {
        if (doc._id in old_index_of_id) Meteor._debug("Duplicate _id in old_results");
        old_index_of_id[doc._id] = i;
    });
    // ALGORITHM:
    //
    // To determine which docs should be considered "moved" (and which
    // merely change position because of other docs moving) we run
    // a "longest common subsequence" (LCS) algorithm.  The LCS of the
    // old doc IDs and the new doc IDs gives the docs that should NOT be
    // considered moved.
    // To actually call the appropriate callbacks to get from the old state to the
    // new state:
    // First, we call removed() on all the items that only appear in the old
    // state.
    // Then, once we have the items that should not move, we walk through the new
    // results array group-by-group, where a "group" is a set of items that have
    // moved, anchored on the end by an item that should not move.  One by one, we
    // move each of those elements into place "before" the anchoring end-of-group
    // item, and fire changed events on them if necessary.  Then we fire a changed
    // event on the anchor, and move on to the next group.  There is always at
    // least one group; the last group is anchored by a virtual "null" id at the
    // end.
    // Asymptotically: O(N k) where k is number of ops, or potentially
    // O(N log N) if inner loop of LCS were made to be binary search.
    //////// LCS (longest common sequence, with respect to _id)
    // (see Wikipedia article on Longest Increasing Subsequence,
    // where the LIS is taken of the sequence of old indices of the
    // docs in new_results)
    //
    // unmoved: the output of the algorithm; members of the LCS,
    // in the form of indices into new_results
    const unmoved = [];
    // max_seq_len: length of LCS found so far
    let max_seq_len = 0;
    // seq_ends[i]: the index into new_results of the last doc in a
    // common subsequence of length of i+1 <= max_seq_len
    const N = new_results.length;
    const seq_ends = Array.from({
        length: N
    });
    // ptrs:  the common subsequence ending with new_results[n] extends
    // a common subsequence ending with new_results[ptr[n]], unless
    // ptr[n] is -1.
    const ptrs = Array.from({
        length: N
    });
    // virtual sequence of old indices of new results
    const old_idx_seq = function(i_new) {
        return old_index_of_id[new_results[i_new]._id];
    };
    // for each item in new_results, use it to extend a common subsequence
    // of length j <= max_seq_len
    for(let i = 0; i < N; i++){
        if (old_index_of_id[new_results[i]._id] !== undefined) {
            let j = max_seq_len;
            // this inner loop would traditionally be a binary search,
            // but scanning backwards we will likely find a subseq to extend
            // pretty soon, bounded for example by the total number of ops.
            // If this were to be changed to a binary search, we'd still want
            // to scan backwards a bit as an optimization.
            while(j > 0){
                if (old_idx_seq(seq_ends[j - 1]) < old_idx_seq(i)) break;
                j--;
            }
            ptrs[i] = j === 0 ? -1 : seq_ends[j - 1];
            seq_ends[j] = i;
            if (j + 1 > max_seq_len) max_seq_len = j + 1;
        }
    }
    // pull out the LCS/LIS into unmoved
    let idx = max_seq_len === 0 ? -1 : seq_ends[max_seq_len - 1];
    while(idx >= 0){
        unmoved.push(idx);
        idx = ptrs[idx];
    }
    // the unmoved item list is built backwards, so fix that
    unmoved.reverse();
    // the last group is always anchored by the end of the result list, which is
    // an id of "null"
    unmoved.push(new_results.length);
    old_results.forEach(function(doc) {
        if (!new_presence_of_id[doc._id]) {
            if (observer.removed) observer.removed(doc._id);
        }
    });
    // for each group of things in the new_results that is anchored by an unmoved
    // element, iterate through the things before it.
    let startOfGroup = 0;
    unmoved.forEach(function(endOfGroup) {
        const groupId = new_results[endOfGroup] ? new_results[endOfGroup]._id : null;
        let oldDoc, newDoc, fields, projectedNew, projectedOld;
        for(let i = startOfGroup; i < endOfGroup; i++){
            newDoc = new_results[i];
            if (!hasOwn.call(old_index_of_id, newDoc._id)) {
                fields = projectionFn(newDoc);
                delete fields._id;
                if (observer.addedBefore) observer.addedBefore(newDoc._id, fields, groupId);
                if (observer.added) observer.added(newDoc._id, fields);
            } else {
                // moved
                oldDoc = old_results[old_index_of_id[newDoc._id]];
                projectedNew = projectionFn(newDoc);
                projectedOld = projectionFn(oldDoc);
                fields = DiffSequence.makeChangedFields(projectedNew, projectedOld);
                if (!isObjEmpty(fields)) {
                    if (observer.changed) observer.changed(newDoc._id, fields);
                }
                if (observer.movedBefore) observer.movedBefore(newDoc._id, groupId);
            }
        }
        if (groupId) {
            newDoc = new_results[endOfGroup];
            oldDoc = old_results[old_index_of_id[newDoc._id]];
            projectedNew = projectionFn(newDoc);
            projectedOld = projectionFn(oldDoc);
            fields = DiffSequence.makeChangedFields(projectedNew, projectedOld);
            if (!isObjEmpty(fields)) {
                if (observer.changed) observer.changed(newDoc._id, fields);
            }
        }
        startOfGroup = endOfGroup + 1;
    });
};
// General helper for diff-ing two objects.
// callbacks is an object like so:
// { leftOnly: function (key, leftValue) {...},
//   rightOnly: function (key, rightValue) {...},
//   both: function (key, leftValue, rightValue) {...},
// }
DiffSequence.diffObjects = function(left, right, callbacks) {
    Object.keys(left).forEach((key)=>{
        const leftValue = left[key];
        if (hasOwn.call(right, key)) {
            if (callbacks.both) callbacks.both(key, leftValue, right[key]);
        } else {
            if (callbacks.leftOnly) callbacks.leftOnly(key, leftValue);
        }
    });
    if (callbacks.rightOnly) {
        Object.keys(right).forEach((key)=>{
            const rightValue = right[key];
            if (!hasOwn.call(left, key)) {
                callbacks.rightOnly(key, rightValue);
            }
        });
    }
};
DiffSequence.diffMaps = function(left, right, callbacks) {
    left.forEach(function(leftValue, key) {
        if (right.has(key)) {
            if (callbacks.both) callbacks.both(key, leftValue, right.get(key));
        } else {
            if (callbacks.leftOnly) callbacks.leftOnly(key, leftValue);
        }
    });
    if (callbacks.rightOnly) {
        right.forEach(function(rightValue, key) {
            if (!left.has(key)) {
                callbacks.rightOnly(key, rightValue);
            }
        });
    }
};
DiffSequence.makeChangedFields = function(newDoc, oldDoc) {
    const fields = {};
    DiffSequence.diffObjects(oldDoc, newDoc, {
        leftOnly: function(key, _value) {
            fields[key] = undefined;
        },
        rightOnly: function(key, value) {
            fields[key] = value;
        },
        both: function(key, leftValue, rightValue) {
            if (!EJSON.equals(leftValue, rightValue)) fields[key] = rightValue;
        }
    });
    return fields;
};
DiffSequence.applyChanges = function(doc, changeFields) {
    Object.keys(changeFields).forEach((key)=>{
        const value = changeFields[key];
        if (typeof value === "undefined") {
            delete doc[key];
        } else {
            doc[key] = value;
        }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      DiffSequence: DiffSequence
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/diff-sequence/diff.js"
  ],
  mainModulePath: "/node_modules/meteor/diff-sequence/diff.js"
}});

//# sourceURL=meteor://💻app/packages/diff-sequence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGlmZi1zZXF1ZW5jZS9kaWZmLmpzIl0sIm5hbWVzIjpbIkRpZmZTZXF1ZW5jZSIsImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiaXNPYmpFbXB0eSIsIm9iaiIsImtleSIsImNhbGwiLCJkaWZmUXVlcnlDaGFuZ2VzIiwib3JkZXJlZCIsIm9sZFJlc3VsdHMiLCJuZXdSZXN1bHRzIiwib2JzZXJ2ZXIiLCJvcHRpb25zIiwiZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXMiLCJkaWZmUXVlcnlVbm9yZGVyZWRDaGFuZ2VzIiwicHJvamVjdGlvbkZuIiwiRUpTT04iLCJjbG9uZSIsIm1vdmVkQmVmb3JlIiwiRXJyb3IiLCJmb3JFYWNoIiwibmV3RG9jIiwiaWQiLCJvbGREb2MiLCJnZXQiLCJjaGFuZ2VkIiwiZXF1YWxzIiwicHJvamVjdGVkTmV3IiwicHJvamVjdGVkT2xkIiwiY2hhbmdlZEZpZWxkcyIsIm1ha2VDaGFuZ2VkRmllbGRzIiwiYWRkZWQiLCJmaWVsZHMiLCJfaWQiLCJyZW1vdmVkIiwiaGFzIiwib2xkX3Jlc3VsdHMiLCJuZXdfcmVzdWx0cyIsIm5ld19wcmVzZW5jZV9vZl9pZCIsImRvYyIsIk1ldGVvciIsIl9kZWJ1ZyIsIm9sZF9pbmRleF9vZl9pZCIsImkiLCJ1bm1vdmVkIiwibWF4X3NlcV9sZW4iLCJOIiwibGVuZ3RoIiwic2VxX2VuZHMiLCJBcnJheSIsImZyb20iLCJwdHJzIiwib2xkX2lkeF9zZXEiLCJpX25ldyIsInVuZGVmaW5lZCIsImoiLCJpZHgiLCJwdXNoIiwicmV2ZXJzZSIsInN0YXJ0T2ZHcm91cCIsImVuZE9mR3JvdXAiLCJncm91cElkIiwiYWRkZWRCZWZvcmUiLCJkaWZmT2JqZWN0cyIsImxlZnQiLCJyaWdodCIsImNhbGxiYWNrcyIsImtleXMiLCJsZWZ0VmFsdWUiLCJib3RoIiwibGVmdE9ubHkiLCJyaWdodE9ubHkiLCJyaWdodFZh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c0U7UUFDYjtJQUNGO0FBQ0YiLCJmaWxlIjoiL3BhY2thZ2VzL2RpZmYtc2VxdWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRGlmZlNlcXVlbmNlID0ge307XG5cbmNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGlzT2JqRW1wdHkob2JqKSB7XG4gIGZvciAoY29uc3Qga2V5IGluIE9iamVjdChvYmopKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gb3JkZXJlZDogYm9vbC5cbi8vIG9sZF9yZXN1bHRzIGFuZCBuZXdfcmVzdWx0czogY29sbGVjdGlvbnMgb2YgZG9jdW1lbnRzLlxuLy8gICAgaWYgb3JkZXJlZCwgdGhleSBhcmUgYXJyYXlzLlxuLy8gICAgaWYgdW5vcmRlcmVkLCB0aGV5IGFyZSBJZE1hcHNcbkRpZmZTZXF1ZW5jZS5kaWZmUXVlcnlDaGFuZ2VzID0gZnVuY3Rpb24gKG9yZGVyZWQsIG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIG9ic2VydmVyLCBvcHRpb25zKSB7XG4gIGlmIChvcmRlcmVkKSBEaWZmU2VxdWVuY2UuZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXMob2xkUmVzdWx0cywgbmV3UmVzdWx0cywgb2JzZXJ2ZXIsIG9wdGlvbnMpO1xuICBlbHNlIERpZmZTZXF1ZW5jZS5kaWZmUXVlcnlVbm9yZGVyZWRDaGFuZ2VzKG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIG9ic2VydmVyLCBvcHRpb25zKTtcbn07XG5cbkRpZmZTZXF1ZW5jZS5kaWZmUXVlcnlVbm9yZGVyZWRDaGFuZ2VzID0gZnVuY3Rpb24gKG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIG9ic2VydmVyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBjb25zdCBwcm9qZWN0aW9uRm4gPSBvcHRpb25zLnByb2plY3Rpb25GbiB8fCBFSlNPTi5jbG9uZTtcblxuICBpZiAob2JzZXJ2ZXIubW92ZWRCZWZvcmUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJfZGlmZlF1ZXJ5VW5vcmRlcmVkIGNhbGxlZCB3aXRoIGEgbW92ZWRCZWZvcmUgb2JzZXJ2ZXIhXCIpO1xuICB9XG5cbiAgbmV3UmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChuZXdEb2MsIGlkKSB7XG4gICAgY29uc3Qgb2xkRG9jID0gb2xkUmVzdWx0cy5nZXQoaWQpO1xuICAgIGlmIChvbGREb2MpIHtcbiAgICAgIGlmIChvYnNlcnZlci5jaGFuZ2VkICYmICFFSlNPTi5lcXVhbHMob2xkRG9jLCBuZXdEb2MpKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3RlZE5ldyA9IHByb2plY3Rpb25GbihuZXdEb2MpO1xuICAgICAgICBjb25zdCBwcm9qZWN0ZWRPbGQgPSBwcm9qZWN0aW9uRm4ob2xkRG9jKTtcbiAgICAgICAgY29uc3QgY2hhbmdlZEZpZWxkcyA9IERpZmZTZXF1ZW5jZS5tYWtlQ2hhbmdlZEZpZWxkcyhwcm9qZWN0ZWROZXcsIHByb2plY3RlZE9sZCk7XG4gICAgICAgIGlmICghaXNPYmpFbXB0eShjaGFuZ2VkRmllbGRzKSkge1xuICAgICAgICAgIG9ic2VydmVyLmNoYW5nZWQoaWQsIGNoYW5nZWRGaWVsZHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvYnNlcnZlci5hZGRlZCkge1xuICAgICAgY29uc3QgZmllbGRzID0gcHJvamVjdGlvbkZuKG5ld0RvYyk7XG4gICAgICBkZWxldGUgZmllbGRzLl9pZDtcbiAgICAgIG9ic2VydmVyLmFkZGVkKG5ld0RvYy5faWQsIGZpZWxkcyk7XG4gICAgfVxuICB9KTtcblxuICBpZiAob2JzZXJ2ZXIucmVtb3ZlZCkge1xuICAgIG9sZFJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAob2xkRG9jLCBpZCkge1xuICAgICAgaWYgKCFuZXdSZXN1bHRzLmhhcyhpZCkpIG9ic2VydmVyLnJlbW92ZWQoaWQpO1xuICAgIH0pO1xuICB9XG59O1xuXG5EaWZmU2VxdWVuY2UuZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXMgPSBmdW5jdGlvbiAob2xkX3Jlc3VsdHMsIG5ld19yZXN1bHRzLCBvYnNlcnZlciwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgY29uc3QgcHJvamVjdGlvbkZuID0gb3B0aW9ucy5wcm9qZWN0aW9uRm4gfHwgRUpTT04uY2xvbmU7XG5cbiAgY29uc3QgbmV3X3ByZXNlbmNlX29mX2lkID0ge307XG4gIG5ld19yZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKGRvYykge1xuICAgIGlmIChuZXdfcHJlc2VuY2Vfb2ZfaWRbZG9jLl9pZF0pIE1ldGVvci5fZGVidWcoXCJEdXBsaWNhdGUgX2lkIGluIG5ld19yZXN1bHRzXCIpO1xuICAgIG5ld19wcmVzZW5jZV9vZl9pZFtkb2MuX2lkXSA9IHRydWU7XG4gIH0pO1xuXG4gIGNvbnN0IG9sZF9pbmRleF9vZl9pZCA9IHt9O1xuICBvbGRfcmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGkpIHtcbiAgICBpZiAoZG9jLl9pZCBpbiBvbGRfaW5kZXhfb2ZfaWQpIE1ldGVvci5fZGVidWcoXCJEdXBsaWNhdGUgX2lkIGluIG9sZF9yZXN1bHRzXCIpO1xuICAgIG9sZF9pbmRleF9vZl9pZFtkb2MuX2lkXSA9IGk7XG4gIH0pO1xuXG4gIC8vIEFMR09SSVRITTpcbiAgLy9cbiAgLy8gVG8gZGV0ZXJtaW5lIHdoaWNoIGRvY3Mgc2hvdWxkIGJlIGNvbnNpZGVyZWQgXCJtb3ZlZFwiIChhbmQgd2hpY2hcbiAgLy8gbWVyZWx5IGNoYW5nZSBwb3NpdGlvbiBiZWNhdXNlIG9mIG90aGVyIGRvY3MgbW92aW5nKSB3ZSBydW5cbiAgLy8gYSBcImxvbmdlc3QgY29tbW9uIHN1YnNlcXVlbmNlXCIgKExDUykgYWxnb3JpdGhtLiAgVGhlIExDUyBvZiB0aGVcbiAgLy8gb2xkIGRvYyBJRHMgYW5kIHRoZSBuZXcgZG9jIElEcyBnaXZlcyB0aGUgZG9jcyB0aGF0IHNob3VsZCBOT1QgYmVcbiAgLy8gY29uc2lkZXJlZCBtb3ZlZC5cblxuICAvLyBUbyBhY3R1YWxseSBjYWxsIHRoZSBhcHByb3ByaWF0ZSBjYWxsYmFja3MgdG8gZ2V0IGZyb20gdGhlIG9sZCBzdGF0ZSB0byB0aGVcbiAgLy8gbmV3IHN0YXRlOlxuXG4gIC8vIEZpcnN0LCB3ZSBjYWxsIHJlbW92ZWQoKSBvbiBhbGwgdGhlIGl0ZW1zIHRoYXQgb25seSBhcHBlYXIgaW4gdGhlIG9sZFxuICAvLyBzdGF0ZS5cblxuICAvLyBUaGVuLCBvbmNlIHdlIGhhdmUgdGhlIGl0ZW1zIHRoYXQgc2hvdWxkIG5vdCBtb3ZlLCB3ZSB3YWxrIHRocm91Z2ggdGhlIG5ld1xuICAvLyByZXN1bHRzIGFycmF5IGdyb3VwLWJ5LWdyb3VwLCB3aGVyZSBhIFwiZ3JvdXBcIiBpcyBhIHNldCBvZiBpdGVtcyB0aGF0IGhhdmVcbiAgLy8gbW92ZWQsIGFuY2hvcmVkIG9uIHRoZSBlbmQgYnkgYW4gaXRlbSB0aGF0IHNob3VsZCBub3QgbW92ZS4gIE9uZSBieSBvbmUsIHdlXG4gIC8vIG1vdmUgZWFjaCBvZiB0aG9zZSBlbGVtZW50cyBpbnRvIHBsYWNlIFwiYmVmb3JlXCIgdGhlIGFuY2hvcmluZyBlbmQtb2YtZ3JvdXBcbiAgLy8gaXRlbSwgYW5kIGZpcmUgY2hhbmdlZCBldmVudHMgb24gdGhlbSBpZiBuZWNlc3NhcnkuICBUaGVuIHdlIGZpcmUgYSBjaGFuZ2VkXG4gIC8vIGV2ZW50IG9uIHRoZSBhbmNob3IsIGFuZCBtb3ZlIG9uIHRvIHRoZSBuZXh0IGdyb3VwLiAgVGhlcmUgaXMgYWx3YXlzIGF0XG4gIC8vIGxlYXN0IG9uZSBncm91cDsgdGhlIGxhc3QgZ3JvdXAgaXMgYW5jaG9yZWQgYnkgYSB2aXJ0dWFsIFwibnVsbFwiIGlkIGF0IHRoZVxuICAvLyBlbmQuXG5cbiAgLy8gQXN5bXB0b3RpY2FsbHk6IE8oTiBrKSB3aGVyZSBrIGlzIG51bWJlciBvZiBvcHMsIG9yIHBvdGVudGlhbGx5XG4gIC8vIE8oTiBsb2cgTikgaWYgaW5uZXIgbG9vcCBvZiBMQ1Mgd2VyZSBtYWRlIHRvIGJlIGJpbmFyeSBzZWFyY2guXG5cbiAgLy8vLy8vLy8gTENTIChsb25nZXN0IGNvbW1vbiBzZXF1ZW5jZSwgd2l0aCByZXNwZWN0IHRvIF9pZClcbiAgLy8gKHNlZSBXaWtpcGVkaWEgYXJ0aWNsZSBvbiBMb25nZXN0IEluY3JlYXNpbmcgU3Vic2VxdWVuY2UsXG4gIC8vIHdoZXJlIHRoZSBMSVMgaXMgdGFrZW4gb2YgdGhlIHNlcXVlbmNlIG9mIG9sZCBpbmRpY2VzIG9mIHRoZVxuICAvLyBkb2NzIGluIG5ld19yZXN1bHRzKVxuICAvL1xuICAvLyB1bm1vdmVkOiB0aGUgb3V0cHV0IG9mIHRoZSBhbGdvcml0aG07IG1lbWJlcnMgb2YgdGhlIExDUyxcbiAgLy8gaW4gdGhlIGZvcm0gb2YgaW5kaWNlcyBpbnRvIG5ld19yZXN1bHRzXG4gIGNvbnN0IHVubW92ZWQgPSBbXTtcbiAgLy8gbWF4X3NlcV9sZW46IGxlbmd0aCBvZiBMQ1MgZm91bmQgc28gZmFyXG4gIGxldCBtYXhfc2VxX2xlbiA9IDA7XG4gIC8vIHNlcV9lbmRzW2ldOiB0aGUgaW5kZXggaW50byBuZXdfcmVzdWx0cyBvZiB0aGUgbGFzdCBkb2MgaW4gYVxuICAvLyBjb21tb24gc3Vic2VxdWVuY2Ugb2YgbGVuZ3RoIG9mIGkrMSA8PSBtYXhfc2VxX2xlblxuICBjb25zdCBOID0gbmV3X3Jlc3VsdHMubGVuZ3RoO1xuICBjb25zdCBzZXFfZW5kcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IE4gfSk7XG4gIC8vIHB0cnM6ICB0aGUgY29tbW9uIHN1YnNlcXVlbmNlIGVuZGluZyB3aXRoIG5ld19yZXN1bHRzW25dIGV4dGVuZHNcbiAgLy8gYSBjb21tb24gc3Vic2VxdWVuY2UgZW5kaW5nIHdpdGggbmV3X3Jlc3VsdHNbcHRyW25dXSwgdW5sZXNzXG4gIC8vIHB0cltuXSBpcyAtMS5cbiAgY29uc3QgcHRycyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IE4gfSk7XG4gIC8vIHZpcnR1YWwgc2VxdWVuY2Ugb2Ygb2xkIGluZGljZXMgb2YgbmV3IHJlc3VsdHNcbiAgY29uc3Qgb2xkX2lkeF9zZXEgPSBmdW5jdGlvbiAoaV9uZXcpIHtcbiAgICByZXR1cm4gb2xkX2luZGV4X29mX2lkW25ld19yZXN1bHRzW2lfbmV3XS5faWRdO1xuICB9O1xuICAvLyBmb3IgZWFjaCBpdGVtIGluIG5ld19yZXN1bHRzLCB1c2UgaXQgdG8gZXh0ZW5kIGEgY29tbW9uIHN1YnNlcXVlbmNlXG4gIC8vIG9mIGxlbmd0aCBqIDw9IG1heF9zZXFfbGVuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgTjsgaSsrKSB7XG4gICAgaWYgKG9sZF9pbmRleF9vZl9pZFtuZXdfcmVzdWx0c1tpXS5faWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCBqID0gbWF4X3NlcV9sZW47XG4gICAgICAvLyB0aGlzIGlubmVyIGxvb3Agd291bGQgdHJhZGl0aW9uYWxseSBiZSBhIGJpbmFyeSBzZWFyY2gsXG4gICAgICAvLyBidXQgc2Nhbm5pbmcgYmFja3dhcmRzIHdlIHdpbGwgbGlrZWx5IGZpbmQgYSBzdWJzZXEgdG8gZXh0ZW5kXG4gICAgICAvLyBwcmV0dHkgc29vbiwgYm91bmRlZCBmb3IgZXhhbXBsZSBieSB0aGUgdG90YWwgbnVtYmVyIG9mIG9wcy5cbiAgICAgIC8vIElmIHRoaXMgd2VyZSB0byBiZSBjaGFuZ2VkIHRvIGEgYmluYXJ5IHNlYXJjaCwgd2UnZCBzdGlsbCB3YW50XG4gICAgICAvLyB0byBzY2FuIGJhY2t3YXJkcyBhIGJpdCBhcyBhbiBvcHRpbWl6YXRpb24uXG4gICAgICB3aGlsZSAoaiA+IDApIHtcbiAgICAgICAgaWYgKG9sZF9pZHhfc2VxKHNlcV9lbmRzW2ogLSAxXSkgPCBvbGRfaWR4X3NlcShpKSkgYnJlYWs7XG4gICAgICAgIGotLTtcbiAgICAgIH1cblxuICAgICAgcHRyc1tpXSA9IGogPT09IDAgPyAtMSA6IHNlcV9lbmRzW2ogLSAxXTtcbiAgICAgIHNlcV9lbmRzW2pdID0gaTtcbiAgICAgIGlmIChqICsgMSA+IG1heF9zZXFfbGVuKSBtYXhfc2VxX2xlbiA9IGogKyAxO1xuICAgIH1cbiAgfVxuXG4gIC8vIHB1bGwgb3V0IHRoZSBMQ1MvTElTIGludG8gdW5tb3ZlZFxuICBsZXQgaWR4ID0gbWF4X3NlcV9sZW4gPT09IDAgPyAtMSA6IHNlcV9lbmRzW21heF9zZXFfbGVuIC0gMV07XG4gIHdoaWxlIChpZHggPj0gMCkge1xuICAgIHVubW92ZWQucHVzaChpZHgpO1xuICAgIGlkeCA9IHB0cnNbaWR4XTtcbiAgfVxuICAvLyB0aGUgdW5tb3ZlZCBpdGVtIGxpc3QgaXMgYnVpbHQgYmFja3dhcmRzLCBzbyBmaXggdGhhdFxuICB1bm1vdmVkLnJldmVyc2UoKTtcblxuICAvLyB0aGUgbGFzdCBncm91cCBpcyBhbHdheXMgYW5jaG9yZWQgYnkgdGhlIGVuZCBvZiB0aGUgcmVzdWx0IGxpc3QsIHdoaWNoIGlzXG4gIC8vIGFuIGlkIG9mIFwibnVsbFwiXG4gIHVubW92ZWQucHVzaChuZXdfcmVzdWx0cy5sZW5ndGgpO1xuXG4gIG9sZF9yZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKGRvYykge1xuICAgIGlmICghbmV3X3ByZXNlbmNlX29mX2lkW2RvYy5faWRdKSB7XG4gICAgICBpZiAob2JzZXJ2ZXIucmVtb3ZlZCkgb2JzZXJ2ZXIucmVtb3ZlZChkb2MuX2lkKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGZvciBlYWNoIGdyb3VwIG9mIHRoaW5ncyBpbiB0aGUgbmV3X3Jlc3VsdHMgdGhhdCBpcyBhbmNob3JlZCBieSBhbiB1bm1vdmVkXG4gIC8vIGVsZW1lbnQsIGl0ZXJhdGUgdGhyb3VnaCB0aGUgdGhpbmdzIGJlZm9yZSBpdC5cbiAgbGV0IHN0YXJ0T2ZHcm91cCA9IDA7XG4gIHVubW92ZWQuZm9yRWFjaChmdW5jdGlvbiAoZW5kT2ZHcm91cCkge1xuICAgIGNvbnN0IGdyb3VwSWQgPSBuZXdfcmVzdWx0c1tlbmRPZkdyb3VwXSA/IG5ld19yZXN1bHRzW2VuZE9mR3JvdXBdLl9pZCA6IG51bGw7XG4gICAgbGV0IG9sZERvYywgbmV3RG9jLCBmaWVsZHMsIHByb2plY3RlZE5ldywgcHJvamVjdGVkT2xkO1xuICAgIGZvciAobGV0IGkgPSBzdGFydE9mR3JvdXA7IGkgPCBlbmRPZkdyb3VwOyBpKyspIHtcbiAgICAgIG5ld0RvYyA9IG5ld19yZXN1bHRzW2ldO1xuICAgICAgaWYgKCFoYXNPd24uY2FsbChvbGRfaW5kZXhfb2ZfaWQsIG5ld0RvYy5faWQpKSB7XG4gICAgICAgIGZpZWxkcyA9IHByb2plY3Rpb25GbihuZXdEb2MpO1xuICAgICAgICBkZWxldGUgZmllbGRzLl9pZDtcbiAgICAgICAgaWYgKG9ic2VydmVyLmFkZGVkQmVmb3JlKSBvYnNlcnZlci5hZGRlZEJlZm9yZShuZXdEb2MuX2lkLCBmaWVsZHMsIGdyb3VwSWQpO1xuICAgICAgICBpZiAob2JzZXJ2ZXIuYWRkZWQpIG9ic2VydmVyLmFkZGVkKG5ld0RvYy5faWQsIGZpZWxkcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBtb3ZlZFxuICAgICAgICBvbGREb2MgPSBvbGRfcmVzdWx0c1tvbGRfaW5kZXhfb2ZfaWRbbmV3RG9jLl9pZF1dO1xuICAgICAgICBwcm9qZWN0ZWROZXcgPSBwcm9qZWN0aW9uRm4obmV3RG9jKTtcbiAgICAgICAgcHJvamVjdGVkT2xkID0gcHJvamVjdGlvbkZuKG9sZERvYyk7XG4gICAgICAgIGZpZWxkcyA9IERpZmZTZXF1ZW5jZS5tYWtlQ2hhbmdlZEZpZWxkcyhwcm9qZWN0ZWROZXcsIHByb2plY3RlZE9sZCk7XG4gICAgICAgIGlmICghaXNPYmpFbXB0eShmaWVsZHMpKSB7XG4gICAgICAgICAgaWYgKG9ic2VydmVyLmNoYW5nZWQpIG9ic2VydmVyLmNoYW5nZWQobmV3RG9jLl9pZCwgZmllbGRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JzZXJ2ZXIubW92ZWRCZWZvcmUpIG9ic2VydmVyLm1vdmVkQmVmb3JlKG5ld0RvYy5faWQsIGdyb3VwSWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ3JvdXBJZCkge1xuICAgICAgbmV3RG9jID0gbmV3X3Jlc3VsdHNbZW5kT2ZHcm91cF07XG4gICAgICBvbGREb2MgPSBvbGRfcmVzdWx0c1tvbGRfaW5kZXhfb2ZfaWRbbmV3RG9jLl9pZF1dO1xuICAgICAgcHJvamVjdGVkTmV3ID0gcHJvamVjdGlvbkZuKG5ld0RvYyk7XG4gICAgICBwcm9qZWN0ZWRPbGQgPSBwcm9qZWN0aW9uRm4ob2xkRG9jKTtcbiAgICAgIGZpZWxkcyA9IERpZmZTZXF1ZW5jZS5tYWtlQ2hhbmdlZEZpZWxkcyhwcm9qZWN0ZWROZXcsIHByb2plY3RlZE9sZCk7XG4gICAgICBpZiAoIWlzT2JqRW1wdHkoZmllbGRzKSkge1xuICAgICAgICBpZiAob2JzZXJ2ZXIuY2hhbmdlZCkgb2JzZXJ2ZXIuY2hhbmdlZChuZXdEb2MuX2lkLCBmaWVsZHMpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGFydE9mR3JvdXAgPSBlbmRPZkdyb3VwICsgMTtcbiAgfSk7XG59O1xuXG4vLyBHZW5lcmFsIGhlbHBlciBmb3IgZGlmZi1pbmcgdHdvIG9iamVjdHMuXG4vLyBjYWxsYmFja3MgaXMgYW4gb2JqZWN0IGxpa2Ugc286XG4vLyB7IGxlZnRPbmx5OiBmdW5jdGlvbiAoa2V5LCBsZWZ0VmFsdWUpIHsuLi59LFxuLy8gICByaWdodE9ubHk6IGZ1bmN0aW9uIChrZXksIHJpZ2h0VmFsdWUpIHsuLi59LFxuLy8gICBib3RoOiBmdW5jdGlvbiAoa2V5LCBsZWZ0VmFsdWUsIHJpZ2h0VmFsdWUpIHsuLi59LFxuLy8gfVxuRGlmZlNlcXVlbmNlLmRpZmZPYmplY3RzID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0LCBjYWxsYmFja3MpIHtcbiAgT2JqZWN0LmtleXMobGVmdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgbGVmdFZhbHVlID0gbGVmdFtrZXldO1xuICAgIGlmIChoYXNPd24uY2FsbChyaWdodCwga2V5KSkge1xuICAgICAgaWYgKGNhbGxiYWNrcy5ib3RoKSBjYWxsYmFja3MuYm90aChrZXksIGxlZnRWYWx1ZSwgcmlnaHRba2V5XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjYWxsYmFja3MubGVmdE9ubHkpIGNhbGxiYWNrcy5sZWZ0T25seShrZXksIGxlZnRWYWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY2FsbGJhY2tzLnJpZ2h0T25seSkge1xuICAgIE9iamVjdC5rZXlzKHJpZ2h0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHJpZ2h0VmFsdWUgPSByaWdodFtrZXldO1xuICAgICAgaWYgKCFoYXNPd24uY2FsbChsZWZ0LCBrZXkpKSB7XG4gICAgICAgIGNhbGxiYWNrcy5yaWdodE9ubHkoa2V5LCByaWdodFZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRGlmZlNlcXVlbmNlLmRpZmZNYXBzID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0LCBjYWxsYmFja3MpIHtcbiAgbGVmdC5mb3JFYWNoKGZ1bmN0aW9uIChsZWZ0VmFsdWUsIGtleSkge1xuICAgIGlmIChyaWdodC5oYXMoa2V5KSkge1xuICAgICAgaWYgKGNhbGxiYWNrcy5ib3RoKSBjYWxsYmFja3MuYm90aChrZXksIGxlZnRWYWx1ZSwgcmlnaHQuZ2V0KGtleSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY2FsbGJhY2tzLmxlZnRPbmx5KSBjYWxsYmFja3MubGVmdE9ubHkoa2V5LCBsZWZ0VmFsdWUpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGNhbGxiYWNrcy5yaWdodE9ubHkpIHtcbiAgICByaWdodC5mb3JFYWNoKGZ1bmN0aW9uIChyaWdodFZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghbGVmdC5oYXMoa2V5KSkge1xuICAgICAgICBjYWxsYmFja3MucmlnaHRPbmx5KGtleSwgcmlnaHRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkRpZmZTZXF1ZW5jZS5tYWtlQ2hhbmdlZEZpZWxkcyA9IGZ1bmN0aW9uIChuZXdEb2MsIG9sZERvYykge1xuICBjb25zdCBmaWVsZHMgPSB7fTtcbiAgRGlmZlNlcXVlbmNlLmRpZmZPYmplY3RzKG9sZERvYywgbmV3RG9jLCB7XG4gICAgbGVmdE9ubHk6IGZ1bmN0aW9uIChrZXksIF92YWx1ZSkge1xuICAgICAgZmllbGRzW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICByaWdodE9ubHk6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBmaWVsZHNba2V5XSA9IHZhbHVlO1xuICAgIH0sXG4gICAgYm90aDogZnVuY3Rpb24gKGtleSwgbGVmdFZhbHVlLCByaWdodFZhbHVlKSB7XG4gICAgICBpZiAoIUVKU09OLmVxdWFscyhsZWZ0VmFsdWUsIHJpZ2h0VmFsdWUpKSBmaWVsZHNba2V5XSA9IHJpZ2h0VmFsdWU7XG4gICAgfSxcbiAgfSk7XG4gIHJldHVybiBmaWVsZHM7XG59O1xuXG5EaWZmU2VxdWVuY2UuYXBwbHlDaGFuZ2VzID0gZnVuY3Rpb24gKGRvYywgY2hhbmdlRmllbGRzKSB7XG4gIE9iamVjdC5rZXlzKGNoYW5nZUZpZWxkcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBjaGFuZ2VGaWVsZHNba2V5XTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBkZWxldGUgZG9jW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY1trZXldID0gdmFsdWU7XG4gICAgfVxuICB9KTtcbn07XG4iXX0=
