Package["core-runtime"].queue("minimongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var ECMAScript = Package.ecmascript.ECMAScript;
var EJSON = Package.ejson.EJSON;
var GeoJSON = Package['geojson-utils'].GeoJSON;
var IdMap = Package['id-map'].IdMap;
var MongoID = Package['mongo-id'].MongoID;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var Random = Package.random.Random;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Decimal = Package['mongo-decimal'].Decimal;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MinimongoTest, MinimongoError, LocalCollection, Minimongo;

var require = meteorInstall({"node_modules":{"meteor":{"minimongo":{"minimongo_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/minimongo_server.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.link('./minimongo_common.js');let hasOwn,isNumericKey,isOperatorObject,pathsToTree,projectionDetails;module.link('./common.js',{hasOwn(v){hasOwn=v},isNumericKey(v){isNumericKey=v},isOperatorObject(v){isOperatorObject=v},pathsToTree(v){pathsToTree=v},projectionDetails(v){projectionDetails=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

Minimongo._pathsElidingNumericKeys = (paths)=>paths.map((path)=>path.split('.').filter((part)=>!isNumericKey(part)).join('.'));
// Returns true if the modifier applied to some document may change the result
// of matching the document by selector
// The modifier is always in a form of Object:
//  - $set
//    - 'a.b.22.z': value
//    - 'foo.bar': 42
//  - $unset
//    - 'abc.d': 1
Minimongo.Matcher.prototype.affectedByModifier = function(modifier) {
    // safe check for $set/$unset being objects
    modifier = Object.assign({
        $set: {},
        $unset: {}
    }, modifier);
    const meaningfulPaths = this._getPaths();
    const modifiedPaths = [].concat(Object.keys(modifier.$set), Object.keys(modifier.$unset));
    return modifiedPaths.some((path)=>{
        const mod = path.split('.');
        return meaningfulPaths.some((meaningfulPath)=>{
            const sel = meaningfulPath.split('.');
            let i = 0, j = 0;
            while(i < sel.length && j < mod.length){
                if (isNumericKey(sel[i]) && isNumericKey(mod[j])) {
                    // foo.4.bar selector affected by foo.4 modifier
                    // foo.3.bar selector unaffected by foo.4 modifier
                    if (sel[i] === mod[j]) {
                        i++;
                        j++;
                    } else {
                        return false;
                    }
                } else if (isNumericKey(sel[i])) {
                    // foo.4.bar selector unaffected by foo.bar modifier
                    return false;
                } else if (isNumericKey(mod[j])) {
                    j++;
                } else if (sel[i] === mod[j]) {
                    i++;
                    j++;
                } else {
                    return false;
                }
            }
            // One is a prefix of another, taking numeric fields into account
            return true;
        });
    });
};
// @param modifier - Object: MongoDB-styled modifier with `$set`s and `$unsets`
//                           only. (assumed to come from oplog)
// @returns - Boolean: if after applying the modifier, selector can start
//                     accepting the modified value.
// NOTE: assumes that document affected by modifier didn't match this Matcher
// before, so if modifier can't convince selector in a positive change it would
// stay 'false'.
// Currently doesn't support $-operators and numeric indices precisely.
Minimongo.Matcher.prototype.canBecomeTrueByModifier = function(modifier) {
    if (!this.affectedByModifier(modifier)) {
        return false;
    }
    if (!this.isSimple()) {
        return true;
    }
    modifier = Object.assign({
        $set: {},
        $unset: {}
    }, modifier);
    const modifierPaths = [].concat(Object.keys(modifier.$set), Object.keys(modifier.$unset));
    if (this._getPaths().some(pathHasNumericKeys) || modifierPaths.some(pathHasNumericKeys)) {
        return true;
    }
    // check if there is a $set or $unset that indicates something is an
    // object rather than a scalar in the actual object where we saw $-operator
    // NOTE: it is correct since we allow only scalars in $-operators
    // Example: for selector {'a.b': {$gt: 5}} the modifier {'a.b.c':7} would
    // definitely set the result to false as 'a.b' appears to be an object.
    const expectedScalarIsObject = Object.keys(this._selector).some((path)=>{
        if (!isOperatorObject(this._selector[path])) {
            return false;
        }
        return modifierPaths.some((modifierPath)=>modifierPath.startsWith(`${path}.`));
    });
    if (expectedScalarIsObject) {
        return false;
    }
    // See if we can apply the modifier on the ideally matching object. If it
    // still matches the selector, then the modifier could have turned the real
    // object in the database into something matching.
    const matchingDocument = EJSON.clone(this.matchingDocument());
    // The selector is too complex, anything can happen.
    if (matchingDocument === null) {
        return true;
    }
    try {
        LocalCollection._modify(matchingDocument, modifier);
    } catch (error) {
        // Couldn't set a property on a field which is a scalar or null in the
        // selector.
        // Example:
        // real document: { 'a.b': 3 }
        // selector: { 'a': 12 }
        // converted selector (ideal document): { 'a': 12 }
        // modifier: { $set: { 'a.b': 4 } }
        // We don't know what real document was like but from the error raised by
        // $set on a scalar field we can reason that the structure of real document
        // is completely different.
        if (error.name === 'MinimongoError' && error.setPropertyError) {
            return false;
        }
        throw error;
    }
    return this.documentMatches(matchingDocument).result;
};
// Knows how to combine a mongo selector and a fields projection to a new fields
// projection taking into account active fields from the passed selector.
// @returns Object - projection object (same as fields option of mongo cursor)
Minimongo.Matcher.prototype.combineIntoProjection = function(projection) {
    const selectorPaths = Minimongo._pathsElidingNumericKeys(this._getPaths());
    // Special case for $where operator in the selector - projection should depend
    // on all fields of the document. getSelectorPaths returns a list of paths
    // selector depends on. If one of the paths is '' (empty string) representing
    // the root or the whole document, complete projection should be returned.
    if (selectorPaths.includes('')) {
        return {};
    }
    return combineImportantPathsIntoProjection(selectorPaths, projection);
};
// Returns an object that would match the selector if possible or null if the
// selector is too complex for us to analyze
// { 'a.b': { ans: 42 }, 'foo.bar': null, 'foo.baz': "something" }
// => { a: { b: { ans: 42 } }, foo: { bar: null, baz: "something" } }
Minimongo.Matcher.prototype.matchingDocument = function() {
    // check if it was computed before
    if (this._matchingDocument !== undefined) {
        return this._matchingDocument;
    }
    // If the analysis of this selector is too hard for our implementation
    // fallback to "YES"
    let fallback = false;
    this._matchingDocument = pathsToTree(this._getPaths(), (path)=>{
        const valueSelector = this._selector[path];
        if (isOperatorObject(valueSelector)) {
            // if there is a strict equality, there is a good
            // chance we can use one of those as "matching"
            // dummy value
            if (valueSelector.$eq) {
                return valueSelector.$eq;
            }
            if (valueSelector.$in) {
                const matcher = new Minimongo.Matcher({
                    placeholder: valueSelector
                });
                // Return anything from $in that matches the whole selector for this
                // path. If nothing matches, returns `undefined` as nothing can make
                // this selector into `true`.
                return valueSelector.$in.find((placeholder)=>matcher.documentMatches({
                        placeholder
                    }).result);
            }
            if (onlyContainsKeys(valueSelector, [
                '$gt',
                '$gte',
                '$lt',
                '$lte'
            ])) {
                let lowerBound = -Infinity;
                let upperBound = Infinity;
                [
                    '$lte',
                    '$lt'
                ].forEach((op)=>{
                    if (hasOwn.call(valueSelector, op) && valueSelector[op] < upperBound) {
                        upperBound = valueSelector[op];
                    }
                });
                [
                    '$gte',
                    '$gt'
                ].forEach((op)=>{
                    if (hasOwn.call(valueSelector, op) && valueSelector[op] > lowerBound) {
                        lowerBound = valueSelector[op];
                    }
                });
                const middle = (lowerBound + upperBound) / 2;
                const matcher = new Minimongo.Matcher({
                    placeholder: valueSelector
                });
                if (!matcher.documentMatches({
                    placeholder: middle
                }).result && (middle === lowerBound || middle === upperBound)) {
                    fallback = true;
                }
                return middle;
            }
            if (onlyContainsKeys(valueSelector, [
                '$nin',
                '$ne'
            ])) {
                // Since this._isSimple makes sure $nin and $ne are not combined with
                // objects or arrays, we can confidently return an empty object as it
                // never matches any scalar.
                return {};
            }
            fallback = true;
        }
        return this._selector[path];
    }, (x)=>x);
    if (fallback) {
        this._matchingDocument = null;
    }
    return this._matchingDocument;
};
// Minimongo.Sorter gets a similar method, which delegates to a Matcher it made
// for this exact purpose.
Minimongo.Sorter.prototype.affectedByModifier = function(modifier) {
    return this._selectorForAffectedByModifier.affectedByModifier(modifier);
};
Minimongo.Sorter.prototype.combineIntoProjection = function(projection) {
    return combineImportantPathsIntoProjection(Minimongo._pathsElidingNumericKeys(this._getPaths()), projection);
};
function combineImportantPathsIntoProjection(paths, projection) {
    const details = projectionDetails(projection);
    // merge the paths to include
    const tree = pathsToTree(paths, (path)=>true, (node, path, fullPath)=>true, details.tree);
    const mergedProjection = treeToPaths(tree);
    if (details.including) {
        // both selector and projection are pointing on fields to include
        // so we can just return the merged tree
        return mergedProjection;
    }
    // selector is pointing at fields to include
    // projection is pointing at fields to exclude
    // make sure we don't exclude important paths
    const mergedExclProjection = {};
    Object.keys(mergedProjection).forEach((path)=>{
        if (!mergedProjection[path]) {
            mergedExclProjection[path] = false;
        }
    });
    return mergedExclProjection;
}
function getPaths(selector) {
    return Object.keys(new Minimongo.Matcher(selector)._paths);
// XXX remove it?
// return Object.keys(selector).map(k => {
//   // we don't know how to handle $where because it can be anything
//   if (k === '$where') {
//     return ''; // matches everything
//   }
//   // we branch from $or/$and/$nor operator
//   if (['$or', '$and', '$nor'].includes(k)) {
//     return selector[k].map(getPaths);
//   }
//   // the value is a literal or some comparison operator
//   return k;
// })
//   .reduce((a, b) => a.concat(b), [])
//   .filter((a, b, c) => c.indexOf(a) === b);
}
// A helper to ensure object has only certain keys
function onlyContainsKeys(obj, keys) {
    return Object.keys(obj).every((k)=>keys.includes(k));
}
function pathHasNumericKeys(path) {
    return path.split('.').some(isNumericKey);
}
// Returns a set of key paths similar to
// { 'foo.bar': 1, 'a.b.c': 1 }
function treeToPaths(tree, prefix = '') {
    const result = {};
    Object.keys(tree).forEach((key)=>{
        const value = tree[key];
        if (value === Object(value)) {
            Object.assign(result, treeToPaths(value, `${prefix + key}.`));
        } else {
            result[prefix + key] = value;
        }
    });
    return result;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/common.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({MiniMongoQueryError:()=>MiniMongoQueryError,compileDocumentSelector:()=>compileDocumentSelector,equalityElementMatcher:()=>equalityElementMatcher,expandArraysInBranches:()=>expandArraysInBranches,isIndexable:()=>isIndexable,isNumericKey:()=>isNumericKey,isOperatorObject:()=>isOperatorObject,makeLookupFunction:()=>makeLookupFunction,nothingMatcher:()=>nothingMatcher,pathsToTree:()=>pathsToTree,populateDocumentWithQueryFields:()=>populateDocumentWithQueryFields,projectionDetails:()=>projectionDetails,regexpElementMatcher:()=>regexpElementMatcher});module.export({hasOwn:()=>hasOwn,ELEMENT_OPERATORS:()=>ELEMENT_OPERATORS},true);let LocalCollection;module.link('./local_collection.js',{default(v){LocalCollection=v}},0);
const hasOwn = Object.prototype.hasOwnProperty;
class MiniMongoQueryError extends Error {
}
// Each element selector contains:
//  - compileElementSelector, a function with args:
//    - operand - the "right hand side" of the operator
//    - valueSelector - the "context" for the operator (so that $regex can find
//      $options)
//    - matcher - the Matcher this is going into (so that $elemMatch can compile
//      more things)
//    returning a function mapping a single value to bool.
//  - dontExpandLeafArrays, a bool which prevents expandArraysInBranches from
//    being called
//  - dontIncludeLeafArrays, a bool which causes an argument to be passed to
//    expandArraysInBranches if it is called
const ELEMENT_OPERATORS = {
    $lt: makeInequality((cmpValue)=>cmpValue < 0),
    $gt: makeInequality((cmpValue)=>cmpValue > 0),
    $lte: makeInequality((cmpValue)=>cmpValue <= 0),
    $gte: makeInequality((cmpValue)=>cmpValue >= 0),
    $mod: {
        compileElementSelector (operand) {
            if (!(Array.isArray(operand) && operand.length === 2 && typeof operand[0] === 'number' && typeof operand[1] === 'number')) {
                throw new MiniMongoQueryError('argument to $mod must be an array of two numbers');
            }
            // XXX could require to be ints or round or something
            const divisor = operand[0];
            const remainder = operand[1];
            return (value)=>typeof value === 'number' && value % divisor === remainder;
        }
    },
    $in: {
        compileElementSelector (operand, valueSelector, matcher) {
            if (!Array.isArray(operand)) {
                throw new MiniMongoQueryError('$in needs an array');
            }
            const collator = matcher && matcher._collator;
            const elementMatchers = operand.map((option)=>{
                if (option instanceof RegExp) {
                    return regexpElementMatcher(option);
                }
                if (isOperatorObject(option)) {
                    throw new MiniMongoQueryError('cannot nest $ under $in');
                }
                return equalityElementMatcher(option, collator);
            });
            return (value)=>{
                // Allow {a: {$in: [null]}} to match when 'a' does not exist.
                if (value === undefined) {
                    value = null;
                }
                return elementMatchers.some((matcher)=>matcher(value));
            };
        }
    },
    $size: {
        // {a: [[5, 5]]} must match {a: {$size: 1}} but not {a: {$size: 2}}, so we
        // don't want to consider the element [5,5] in the leaf array [[5,5]] as a
        // possible value.
        dontExpandLeafArrays: true,
        compileElementSelector (operand) {
            if (typeof operand === 'string') {
                // Don't ask me why, but by experimentation, this seems to be what Mongo
                // does.
                operand = 0;
            } else if (typeof operand !== 'number') {
                throw new MiniMongoQueryError('$size needs a number');
            }
            return (value)=>Array.isArray(value) && value.length === operand;
        }
    },
    $type: {
        // {a: [5]} must not match {a: {$type: 4}} (4 means array), but it should
        // match {a: {$type: 1}} (1 means number), and {a: [[5]]} must match {$a:
        // {$type: 4}}. Thus, when we see a leaf array, we *should* expand it but
        // should *not* include it itself.
        dontIncludeLeafArrays: true,
        compileElementSelector (operand) {
            if (typeof operand === 'string') {
                const operandAliasMap = {
                    'double': 1,
                    'string': 2,
                    'object': 3,
                    'array': 4,
                    'binData': 5,
                    'undefined': 6,
                    'objectId': 7,
                    'bool': 8,
                    'date': 9,
                    'null': 10,
                    'regex': 11,
                    'dbPointer': 12,
                    'javascript': 13,
                    'symbol': 14,
                    'javascriptWithScope': 15,
                    'int': 16,
                    'timestamp': 17,
                    'long': 18,
                    'decimal': 19,
                    'minKey': -1,
                    'maxKey': 127
                };
                if (!hasOwn.call(operandAliasMap, operand)) {
                    throw new MiniMongoQueryError(`unknown string alias for $type: ${operand}`);
                }
                operand = operandAliasMap[operand];
            } else if (typeof operand === 'number') {
                if (operand === 0 || operand < -1 || operand > 19 && operand !== 127) {
                    throw new MiniMongoQueryError(`Invalid numerical $type code: ${operand}`);
                }
            } else {
                throw new MiniMongoQueryError('argument to $type is not a number or a string');
            }
            return (value)=>value !== undefined && LocalCollection._f._type(value) === operand;
        }
    },
    $bitsAllSet: {
        compileElementSelector (operand) {
            const mask = getOperandBitmask(operand, '$bitsAllSet');
            return (value)=>{
                const bitmask = getValueBitmask(value, mask.length);
                return bitmask && mask.every((byte, i)=>(bitmask[i] & byte) === byte);
            };
        }
    },
    $bitsAnySet: {
        compileElementSelector (operand) {
            const mask = getOperandBitmask(operand, '$bitsAnySet');
            return (value)=>{
                const bitmask = getValueBitmask(value, mask.length);
                return bitmask && mask.some((byte, i)=>(~bitmask[i] & byte) !== byte);
            };
        }
    },
    $bitsAllClear: {
        compileElementSelector (operand) {
            const mask = getOperandBitmask(operand, '$bitsAllClear');
            return (value)=>{
                const bitmask = getValueBitmask(value, mask.length);
                return bitmask && mask.every((byte, i)=>!(bitmask[i] & byte));
            };
        }
    },
    $bitsAnyClear: {
        compileElementSelector (operand) {
            const mask = getOperandBitmask(operand, '$bitsAnyClear');
            return (value)=>{
                const bitmask = getValueBitmask(value, mask.length);
                return bitmask && mask.some((byte, i)=>(bitmask[i] & byte) !== byte);
            };
        }
    },
    $regex: {
        compileElementSelector (operand, valueSelector) {
            if (!(typeof operand === 'string' || operand instanceof RegExp)) {
                throw new MiniMongoQueryError('$regex has to be a string or RegExp');
            }
            let regexp;
            if (valueSelector.$options !== undefined) {
                // Options passed in $options (even the empty string) always overrides
                // options in the RegExp object itself.
                // Be clear that we only support the JS-supported options, not extended
                // ones (eg, Mongo supports x and s). Ideally we would implement x and s
                // by transforming the regexp, but not today...
                if (/[^gim]/.test(valueSelector.$options)) {
                    throw new MiniMongoQueryError('Only the i, m, and g regexp options are supported');
                }
                const source = operand instanceof RegExp ? operand.source : operand;
                regexp = new RegExp(source, valueSelector.$options);
            } else if (operand instanceof RegExp) {
                regexp = operand;
            } else {
                regexp = new RegExp(operand);
            }
            return regexpElementMatcher(regexp);
        }
    },
    $elemMatch: {
        dontExpandLeafArrays: true,
        compileElementSelector (operand, valueSelector, matcher) {
            if (!LocalCollection._isPlainObject(operand)) {
                throw new MiniMongoQueryError('$elemMatch need an object');
            }
            const isDocMatcher = !isOperatorObject(Object.keys(operand).filter((key)=>!hasOwn.call(LOGICAL_OPERATORS, key)).reduce((a, b)=>Object.assign(a, {
                    [b]: operand[b]
                }), {}), true);
            let subMatcher;
            if (isDocMatcher) {
                // This is NOT the same as compileValueSelector(operand), and not just
                // because of the slightly different calling convention.
                // {$elemMatch: {x: 3}} means "an element has a field x:3", not
                // "consists only of a field x:3". Also, regexps and sub-$ are allowed.
                subMatcher = compileDocumentSelector(operand, matcher, {
                    inElemMatch: true
                });
            } else {
                subMatcher = compileValueSelector(operand, matcher);
            }
            return (value)=>{
                if (!Array.isArray(value)) {
                    return false;
                }
                for(let i = 0; i < value.length; ++i){
                    const arrayElement = value[i];
                    let arg;
                    if (isDocMatcher) {
                        // We can only match {$elemMatch: {b: 3}} against objects.
                        // (We can also match against arrays, if there's numeric indices,
                        // eg {$elemMatch: {'0.b': 3}} or {$elemMatch: {0: 3}}.)
                        if (!isIndexable(arrayElement)) {
                            return false;
                        }
                        arg = arrayElement;
                    } else {
                        // dontIterate ensures that {a: {$elemMatch: {$gt: 5}}} matches
                        // {a: [8]} but not {a: [[8]]}
                        arg = [
                            {
                                value: arrayElement,
                                dontIterate: true
                            }
                        ];
                    }
                    // XXX support $near in $elemMatch by propagating $distance?
                    if (subMatcher(arg).result) {
                        return i; // specially understood to mean "use as arrayIndices"
                    }
                }
                return false;
            };
        }
    }
};
// Operators that appear at the top level of a document selector.
const LOGICAL_OPERATORS = {
    $and (subSelector, matcher, inElemMatch) {
        return andDocumentMatchers(compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch));
    },
    $or (subSelector, matcher, inElemMatch) {
        const matchers = compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch);
        // Special case: if there is only one matcher, use it directly, *preserving*
        // any arrayIndices it returns.
        if (matchers.length === 1) {
            return matchers[0];
        }
        return (doc)=>{
            const result = matchers.some((fn)=>fn(doc).result);
            // $or does NOT set arrayIndices when it has multiple
            // sub-expressions. (Tested against MongoDB.)
            return {
                result
            };
        };
    },
    $nor (subSelector, matcher, inElemMatch) {
        const matchers = compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch);
        return (doc)=>{
            const result = matchers.every((fn)=>!fn(doc).result);
            // Never set arrayIndices, because we only match if nothing in particular
            // 'matched' (and because this is consistent with MongoDB).
            return {
                result
            };
        };
    },
    $where (selectorValue, matcher) {
        // Record that *any* path may be used.
        matcher._recordPathUsed('');
        matcher._hasWhere = true;
        if (!(selectorValue instanceof Function)) {
            // XXX MongoDB seems to have more complex logic to decide where or or not
            // to add 'return'; not sure exactly what it is.
            selectorValue = Function('obj', `return ${selectorValue}`);
        }
        // We make the document available as both `this` and `obj`.
        // // XXX not sure what we should do if this throws
        return (doc)=>({
                result: selectorValue.call(doc, doc)
            });
    },
    // This is just used as a comment in the query (in MongoDB, it also ends up in
    // query logs); it has no effect on the actual selection.
    $comment () {
        return ()=>({
                result: true
            });
    }
};
// Operators that (unlike LOGICAL_OPERATORS) pertain to individual paths in a
// document, but (unlike ELEMENT_OPERATORS) do not have a simple definition as
// "match each branched value independently and combine with
// convertElementMatcherToBranchedMatcher".
const VALUE_OPERATORS = {
    $eq (operand, valueSelector, matcher) {
        return convertElementMatcherToBranchedMatcher(equalityElementMatcher(operand, matcher && matcher._collator));
    },
    $not (operand, valueSelector, matcher) {
        return invertBranchedMatcher(compileValueSelector(operand, matcher));
    },
    $ne (operand, valueSelector, matcher) {
        return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(equalityElementMatcher(operand, matcher && matcher._collator)));
    },
    $nin (operand, valueSelector, matcher) {
        return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(ELEMENT_OPERATORS.$in.compileElementSelector(operand, valueSelector, matcher)));
    },
    $exists (operand) {
        const exists = convertElementMatcherToBranchedMatcher((value)=>value !== undefined);
        return operand ? exists : invertBranchedMatcher(exists);
    },
    // $options just provides options for $regex; its logic is inside $regex
    $options (operand, valueSelector) {
        if (!hasOwn.call(valueSelector, '$regex')) {
            throw new MiniMongoQueryError('$options needs a $regex');
        }
        return everythingMatcher;
    },
    // $maxDistance is basically an argument to $near
    $maxDistance (operand, valueSelector) {
        if (!valueSelector.$near) {
            throw new MiniMongoQueryError('$maxDistance needs a $near');
        }
        return everythingMatcher;
    },
    $all (operand, valueSelector, matcher) {
        if (!Array.isArray(operand)) {
            throw new MiniMongoQueryError('$all requires array');
        }
        // Not sure why, but this seems to be what MongoDB does.
        if (operand.length === 0) {
            return nothingMatcher;
        }
        const branchedMatchers = operand.map((criterion)=>{
            // XXX handle $all/$elemMatch combination
            if (isOperatorObject(criterion)) {
                throw new MiniMongoQueryError('no $ expressions in $all');
            }
            // This is always a regexp or equality selector.
            return compileValueSelector(criterion, matcher);
        });
        // andBranchedMatchers does NOT require all selectors to return true on the
        // SAME branch.
        return andBranchedMatchers(branchedMatchers);
    },
    $near (operand, valueSelector, matcher, isRoot) {
        if (!isRoot) {
            throw new MiniMongoQueryError('$near can\'t be inside another $ operator');
        }
        matcher._hasGeoQuery = true;
        // There are two kinds of geodata in MongoDB: legacy coordinate pairs and
        // GeoJSON. They use different distance metrics, too. GeoJSON queries are
        // marked with a $geometry property, though legacy coordinates can be
        // matched using $geometry.
        let maxDistance, point, distance;
        if (LocalCollection._isPlainObject(operand) && hasOwn.call(operand, '$geometry')) {
            // GeoJSON "2dsphere" mode.
            maxDistance = operand.$maxDistance;
            point = operand.$geometry;
            distance = (value)=>{
                // XXX: for now, we don't calculate the actual distance between, say,
                // polygon and circle. If people care about this use-case it will get
                // a priority.
                if (!value) {
                    return null;
                }
                if (!value.type) {
                    return GeoJSON.pointDistance(point, {
                        type: 'Point',
                        coordinates: pointToArray(value)
                    });
                }
                if (value.type === 'Point') {
                    return GeoJSON.pointDistance(point, value);
                }
                return GeoJSON.geometryWithinRadius(value, point, maxDistance) ? 0 : maxDistance + 1;
            };
        } else {
            maxDistance = valueSelector.$maxDistance;
            if (!isIndexable(operand)) {
                throw new MiniMongoQueryError('$near argument must be coordinate pair or GeoJSON');
            }
            point = pointToArray(operand);
            distance = (value)=>{
                if (!isIndexable(value)) {
                    return null;
                }
                return distanceCoordinatePairs(point, value);
            };
        }
        return (branchedValues)=>{
            // There might be multiple points in the document that match the given
            // field. Only one of them needs to be within $maxDistance, but we need to
            // evaluate all of them and use the nearest one for the implicit sort
            // specifier. (That's why we can't just use ELEMENT_OPERATORS here.)
            //
            // Note: This differs from MongoDB's implementation, where a document will
            // actually show up *multiple times* in the result set, with one entry for
            // each within-$maxDistance branching point.
            const result = {
                result: false
            };
            expandArraysInBranches(branchedValues).every((branch)=>{
                // if operation is an update, don't skip branches, just return the first
                // one (#3599)
                let curDistance;
                if (!matcher._isUpdate) {
                    if (!(typeof branch.value === 'object')) {
                        return true;
                    }
                    curDistance = distance(branch.value);
                    // Skip branches that aren't real points or are too far away.
                    if (curDistance === null || curDistance > maxDistance) {
                        return true;
                    }
                    // Skip anything that's a tie.
                    if (result.distance !== undefined && result.distance <= curDistance) {
                        return true;
                    }
                }
                result.result = true;
                result.distance = curDistance;
                if (branch.arrayIndices) {
                    result.arrayIndices = branch.arrayIndices;
                } else {
                    delete result.arrayIndices;
                }
                return !matcher._isUpdate;
            });
            return result;
        };
    }
};
// NB: We are cheating and using this function to implement 'AND' for both
// 'document matchers' and 'branched matchers'. They both return result objects
// but the argument is different: for the former it's a whole doc, whereas for
// the latter it's an array of 'branched values'.
function andSomeMatchers(subMatchers) {
    if (subMatchers.length === 0) {
        return everythingMatcher;
    }
    if (subMatchers.length === 1) {
        return subMatchers[0];
    }
    return (docOrBranches)=>{
        const match = {};
        match.result = subMatchers.every((fn)=>{
            const subResult = fn(docOrBranches);
            // Copy a 'distance' number out of the first sub-matcher that has
            // one. Yes, this means that if there are multiple $near fields in a
            // query, something arbitrary happens; this appears to be consistent with
            // Mongo.
            if (subResult.result && subResult.distance !== undefined && match.distance === undefined) {
                match.distance = subResult.distance;
            }
            // Similarly, propagate arrayIndices from sub-matchers... but to match
            // MongoDB behavior, this time the *last* sub-matcher with arrayIndices
            // wins.
            if (subResult.result && subResult.arrayIndices) {
                match.arrayIndices = subResult.arrayIndices;
            }
            return subResult.result;
        });
        // If we didn't actually match, forget any extra metadata we came up with.
        if (!match.result) {
            delete match.distance;
            delete match.arrayIndices;
        }
        return match;
    };
}
const andDocumentMatchers = andSomeMatchers;
const andBranchedMatchers = andSomeMatchers;
function compileArrayOfDocumentSelectors(selectors, matcher, inElemMatch) {
    if (!Array.isArray(selectors) || selectors.length === 0) {
        throw new MiniMongoQueryError('$and/$or/$nor must be nonempty array');
    }
    return selectors.map((subSelector)=>{
        if (!LocalCollection._isPlainObject(subSelector)) {
            throw new MiniMongoQueryError('$or/$and/$nor entries need to be full objects');
        }
        return compileDocumentSelector(subSelector, matcher, {
            inElemMatch
        });
    });
}
// Takes in a selector that could match a full document (eg, the original
// selector). Returns a function mapping document->result object.
//
// matcher is the Matcher object we are compiling.
//
// If this is the root document selector (ie, not wrapped in $and or the like),
// then isRoot is true. (This is used by $near.)
function compileDocumentSelector(docSelector, matcher, options = {}) {
    const docMatchers = Object.keys(docSelector).map((key)=>{
        const subSelector = docSelector[key];
        if (key.substr(0, 1) === '$') {
            // Outer operators are either logical operators (they recurse back into
            // this function), or $where.
            if (!hasOwn.call(LOGICAL_OPERATORS, key)) {
                throw new MiniMongoQueryError(`Unrecognized logical operator: ${key}`);
            }
            matcher._isSimple = false;
            return LOGICAL_OPERATORS[key](subSelector, matcher, options.inElemMatch);
        }
        // Record this path, but only if we aren't in an elemMatcher, since in an
        // elemMatch this is a path inside an object in an array, not in the doc
        // root.
        if (!options.inElemMatch) {
            matcher._recordPathUsed(key);
        }
        // Don't add a matcher if subSelector is a function -- this is to match
        // the behavior of Meteor on the server (inherited from the node mongodb
        // driver), which is to ignore any part of a selector which is a function.
        if (typeof subSelector === 'function') {
            return undefined;
        }
        const lookUpByIndex = makeLookupFunction(key);
        const valueMatcher = compileValueSelector(subSelector, matcher, options.isRoot);
        return (doc)=>valueMatcher(lookUpByIndex(doc));
    }).filter(Boolean);
    return andDocumentMatchers(docMatchers);
}
// Takes in a selector that could match a key-indexed value in a document; eg,
// {$gt: 5, $lt: 9}, or a regular expression, or any non-expression object (to
// indicate equality).  Returns a branched matcher: a function mapping
// [branched value]->result object.
function compileValueSelector(valueSelector, matcher, isRoot) {
    if (valueSelector instanceof RegExp) {
        matcher._isSimple = false;
        return convertElementMatcherToBranchedMatcher(regexpElementMatcher(valueSelector));
    }
    if (isOperatorObject(valueSelector)) {
        return operatorBranchedMatcher(valueSelector, matcher, isRoot);
    }
    return convertElementMatcherToBranchedMatcher(equalityElementMatcher(valueSelector, matcher && matcher._collator));
}
// Given an element matcher (which evaluates a single value), returns a branched
// value (which evaluates the element matcher on all the branches and returns a
// more structured return value possibly including arrayIndices).
function convertElementMatcherToBranchedMatcher(elementMatcher, options = {}) {
    return (branches)=>{
        const expanded = options.dontExpandLeafArrays ? branches : expandArraysInBranches(branches, options.dontIncludeLeafArrays);
        const match = {};
        match.result = expanded.some((element)=>{
            let matched = elementMatcher(element.value);
            // Special case for $elemMatch: it means "true, and use this as an array
            // index if I didn't already have one".
            if (typeof matched === 'number') {
                // XXX This code dates from when we only stored a single array index
                // (for the outermost array). Should we be also including deeper array
                // indices from the $elemMatch match?
                if (!element.arrayIndices) {
                    element.arrayIndices = [
                        matched
                    ];
                }
                matched = true;
            }
            // If some element matched, and it's tagged with array indices, include
            // those indices in our result object.
            if (matched && element.arrayIndices) {
                match.arrayIndices = element.arrayIndices;
            }
            return matched;
        });
        return match;
    };
}
// Helpers for $near.
function distanceCoordinatePairs(a, b) {
    const pointA = pointToArray(a);
    const pointB = pointToArray(b);
    return Math.hypot(pointA[0] - pointB[0], pointA[1] - pointB[1]);
}
// Takes something that is not an operator object and returns an element matcher
// for equality with that thing.  When a collator (Intl.Collator) is provided,
// string equality uses locale-aware comparison.
function equalityElementMatcher(elementSelector, collator) {
    if (isOperatorObject(elementSelector)) {
        throw new MiniMongoQueryError('Can\'t create equalityValueSelector for operator object');
    }
    // Special-case: null and undefined are equal (if you got undefined in there
    // somewhere, or if you got it due to some branch being non-existent in the
    // weird special case), even though they aren't with EJSON.equals.
    // undefined or null
    if (elementSelector == null) {
        return (value)=>value == null;
    }
    return (value)=>LocalCollection._f._equal(elementSelector, value, collator);
}
function everythingMatcher(docOrBranchedValues) {
    return {
        result: true
    };
}
function expandArraysInBranches(branches, skipTheArrays) {
    const branchesOut = [];
    branches.forEach((branch)=>{
        const thisIsArray = Array.isArray(branch.value);
        // We include the branch itself, *UNLESS* we it's an array that we're going
        // to iterate and we're told to skip arrays.  (That's right, we include some
        // arrays even skipTheArrays is true: these are arrays that were found via
        // explicit numerical indices.)
        if (!(skipTheArrays && thisIsArray && !branch.dontIterate)) {
            branchesOut.push({
                arrayIndices: branch.arrayIndices,
                value: branch.value
            });
        }
        if (thisIsArray && !branch.dontIterate) {
            branch.value.forEach((value, i)=>{
                branchesOut.push({
                    arrayIndices: (branch.arrayIndices || []).concat(i),
                    value
                });
            });
        }
    });
    return branchesOut;
}
// Helpers for $bitsAllSet/$bitsAnySet/$bitsAllClear/$bitsAnyClear.
function getOperandBitmask(operand, selector) {
    // numeric bitmask
    // You can provide a numeric bitmask to be matched against the operand field.
    // It must be representable as a non-negative 32-bit signed integer.
    // Otherwise, $bitsAllSet will return an error.
    if (Number.isInteger(operand) && operand >= 0) {
        return new Uint8Array(new Int32Array([
            operand
        ]).buffer);
    }
    // bindata bitmask
    // You can also use an arbitrarily large BinData instance as a bitmask.
    if (EJSON.isBinary(operand)) {
        return new Uint8Array(operand.buffer);
    }
    // position list
    // If querying a list of bit positions, each <position> must be a non-negative
    // integer. Bit positions start at 0 from the least significant bit.
    if (Array.isArray(operand) && operand.every((x)=>Number.isInteger(x) && x >= 0)) {
        const buffer = new ArrayBuffer((Math.max(...operand) >> 3) + 1);
        const view = new Uint8Array(buffer);
        operand.forEach((x)=>{
            view[x >> 3] |= 1 << (x & 0x7);
        });
        return view;
    }
    // bad operand
    throw new MiniMongoQueryError(`operand to ${selector} must be a numeric bitmask (representable as a ` + 'non-negative 32-bit signed integer), a bindata bitmask or an array with ' + 'bit positions (non-negative integers)');
}
function getValueBitmask(value, length) {
    // The field value must be either numerical or a BinData instance. Otherwise,
    // $bits... will not match the current document.
    // numerical
    if (Number.isSafeInteger(value)) {
        // $bits... will not match numerical values that cannot be represented as a
        // signed 64-bit integer. This can be the case if a value is either too
        // large or small to fit in a signed 64-bit integer, or if it has a
        // fractional component.
        const buffer = new ArrayBuffer(Math.max(length, 2 * Uint32Array.BYTES_PER_ELEMENT));
        let view = new Uint32Array(buffer, 0, 2);
        view[0] = value % ((1 << 16) * (1 << 16)) | 0;
        view[1] = value / ((1 << 16) * (1 << 16)) | 0;
        // sign extension
        if (value < 0) {
            view = new Uint8Array(buffer, 2);
            view.forEach((byte, i)=>{
                view[i] = 0xff;
            });
        }
        return new Uint8Array(buffer);
    }
    // bindata
    if (EJSON.isBinary(value)) {
        return new Uint8Array(value.buffer);
    }
    // no match
    return false;
}
// Actually inserts a key value into the selector document
// However, this checks there is no ambiguity in setting
// the value for the given key, throws otherwise
function insertIntoDocument(document, key, value) {
    Object.keys(document).forEach((existingKey)=>{
        if (existingKey.length > key.length && existingKey.indexOf(`${key}.`) === 0 || key.length > existingKey.length && key.indexOf(`${existingKey}.`) === 0) {
            throw new MiniMongoQueryError(`cannot infer query fields to set, both paths '${existingKey}' and '${key}' are matched`);
        } else if (existingKey === key) {
            throw new MiniMongoQueryError(`cannot infer query fields to set, path '${key}' is matched twice`);
        }
    });
    document[key] = value;
}
// Returns a branched matcher that matches iff the given matcher does not.
// Note that this implicitly "deMorganizes" the wrapped function.  ie, it
// means that ALL branch values need to fail to match innerBranchedMatcher.
function invertBranchedMatcher(branchedMatcher) {
    return (branchValues)=>{
        // We explicitly choose to strip arrayIndices here: it doesn't make sense to
        // say "update the array element that does not match something", at least
        // in mongo-land.
        return {
            result: !branchedMatcher(branchValues).result
        };
    };
}
function isIndexable(obj) {
    return Array.isArray(obj) || LocalCollection._isPlainObject(obj);
}
function isNumericKey(s) {
    return /^[0-9]+$/.test(s);
}
// Returns true if this is an object with at least one key and all keys begin
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
function isOperatorObject(valueSelector, inconsistentOK) {
    if (!LocalCollection._isPlainObject(valueSelector)) {
        return false;
    }
    let theseAreOperators = undefined;
    Object.keys(valueSelector).forEach((selKey)=>{
        const thisIsOperator = selKey.substr(0, 1) === '$' || selKey === 'diff';
        if (theseAreOperators === undefined) {
            theseAreOperators = thisIsOperator;
        } else if (theseAreOperators !== thisIsOperator) {
            if (!inconsistentOK) {
                throw new MiniMongoQueryError(`Inconsistent operator: ${JSON.stringify(valueSelector)}`);
            }
            theseAreOperators = false;
        }
    });
    return !!theseAreOperators; // {} has no operators
}
// Helper for $lt/$gt/$lte/$gte.
function makeInequality(cmpValueComparator) {
    return {
        compileElementSelector (operand, valueSelector, matcher) {
            // Arrays never compare false with non-arrays for any inequality.
            // XXX This was behavior we observed in pre-release MongoDB 2.5, but
            //     it seems to have been reverted.
            //     See https://jira.mongodb.org/browse/SERVER-11444
            if (Array.isArray(operand)) {
                return ()=>false;
            }
            // Special case: consider undefined and null the same (so true with
            // $gte/$lte).
            if (operand === undefined) {
                operand = null;
            }
            const operandType = LocalCollection._f._type(operand);
            const collator = matcher && matcher._collator;
            return (value)=>{
                if (value === undefined) {
                    value = null;
                }
                // Comparisons are never true among things of different type (except
                // null vs undefined).
                if (LocalCollection._f._type(value) !== operandType) {
                    return false;
                }
                return cmpValueComparator(LocalCollection._f._cmp(value, operand, collator));
            };
        }
    };
}
// makeLookupFunction(key) returns a lookup function.
//
// A lookup function takes in a document and returns an array of matching
// branches.  If no arrays are found while looking up the key, this array will
// have exactly one branches (possibly 'undefined', if some segment of the key
// was not found).
//
// If arrays are found in the middle, this can have more than one element, since
// we 'branch'. When we 'branch', if there are more key segments to look up,
// then we only pursue branches that are plain objects (not arrays or scalars).
// This means we can actually end up with no branches!
//
// We do *NOT* branch on arrays that are found at the end (ie, at the last
// dotted member of the key). We just return that array; if you want to
// effectively 'branch' over the array's values, post-process the lookup
// function with expandArraysInBranches.
//
// Each branch is an object with keys:
//  - value: the value at the branch
//  - dontIterate: an optional bool; if true, it means that 'value' is an array
//    that expandArraysInBranches should NOT expand. This specifically happens
//    when there is a numeric index in the key, and ensures the
//    perhaps-surprising MongoDB behavior where {'a.0': 5} does NOT
//    match {a: [[5]]}.
//  - arrayIndices: if any array indexing was done during lookup (either due to
//    explicit numeric indices or implicit branching), this will be an array of
//    the array indices used, from outermost to innermost; it is falsey or
//    absent if no array index is used. If an explicit numeric index is used,
//    the index will be followed in arrayIndices by the string 'x'.
//
//    Note: arrayIndices is used for two purposes. First, it is used to
//    implement the '$' modifier feature, which only ever looks at its first
//    element.
//
//    Second, it is used for sort key generation, which needs to be able to tell
//    the difference between different paths. Moreover, it needs to
//    differentiate between explicit and implicit branching, which is why
//    there's the somewhat hacky 'x' entry: this means that explicit and
//    implicit array lookups will have different full arrayIndices paths. (That
//    code only requires that different paths have different arrayIndices; it
//    doesn't actually 'parse' arrayIndices. As an alternative, arrayIndices
//    could contain objects with flags like 'implicit', but I think that only
//    makes the code surrounding them more complex.)
//
//    (By the way, this field ends up getting passed around a lot without
//    cloning, so never mutate any arrayIndices field/var in this package!)
//
//
// At the top level, you may only pass in a plain object or array.
//
// See the test 'minimongo - lookup' for some examples of what lookup functions
// return.
function makeLookupFunction(key, options = {}) {
    const parts = key.split('.');
    const firstPart = parts.length ? parts[0] : '';
    const lookupRest = parts.length > 1 && makeLookupFunction(parts.slice(1).join('.'), options);
    function buildResult(arrayIndices, dontIterate, value) {
        return arrayIndices && arrayIndices.length ? dontIterate ? [
            {
                arrayIndices,
                dontIterate,
                value
            }
        ] : [
            {
                arrayIndices,
                value
            }
        ] : dontIterate ? [
            {
                dontIterate,
                value
            }
        ] : [
            {
                value
            }
        ];
    }
    // Doc will always be a plain object or an array.
    // apply an explicit numeric index, an array.
    return (doc, arrayIndices)=>{
        if (Array.isArray(doc)) {
            // If we're being asked to do an invalid lookup into an array (non-integer
            // or out-of-bounds), return no results (which is different from returning
            // a single undefined result, in that `null` equality checks won't match).
            if (!(isNumericKey(firstPart) && firstPart < doc.length)) {
                return [];
            }
            // Remember that we used this array index. Include an 'x' to indicate that
            // the previous index came from being considered as an explicit array
            // index (not branching).
            arrayIndices = arrayIndices ? arrayIndices.concat(+firstPart, 'x') : [
                +firstPart,
                'x'
            ];
        }
        // Do our first lookup.
        const firstLevel = doc[firstPart];
        // If there is no deeper to dig, return what we found.
        //
        // If what we found is an array, most value selectors will choose to treat
        // the elements of the array as matchable values in their own right, but
        // that's done outside of the lookup function. (Exceptions to this are $size
        // and stuff relating to $elemMatch.  eg, {a: {$size: 2}} does not match {a:
        // [[1, 2]]}.)
        //
        // That said, if we just did an *explicit* array lookup (on doc) to find
        // firstLevel, and firstLevel is an array too, we do NOT want value
        // selectors to iterate over it.  eg, {'a.0': 5} does not match {a: [[5]]}.
        // So in that case, we mark the return value as 'don't iterate'.
        if (!lookupRest) {
            return buildResult(arrayIndices, Array.isArray(doc) && Array.isArray(firstLevel), firstLevel);
        }
        // We need to dig deeper.  But if we can't, because what we've found is not
        // an array or plain object, we're done. If we just did a numeric index into
        // an array, we return nothing here (this is a change in Mongo 2.5 from
        // Mongo 2.4, where {'a.0.b': null} stopped matching {a: [5]}). Otherwise,
        // return a single `undefined` (which can, for example, match via equality
        // with `null`).
        if (!isIndexable(firstLevel)) {
            if (Array.isArray(doc)) {
                return [];
            }
            return buildResult(arrayIndices, false, undefined);
        }
        const result = [];
        const appendToResult = (more)=>{
            result.push(...more);
        };
        // Dig deeper: look up the rest of the parts on whatever we've found.
        // (lookupRest is smart enough to not try to do invalid lookups into
        // firstLevel if it's an array.)
        appendToResult(lookupRest(firstLevel, arrayIndices));
        // If we found an array, then in *addition* to potentially treating the next
        // part as a literal integer lookup, we should also 'branch': try to look up
        // the rest of the parts on each array element in parallel.
        //
        // In this case, we *only* dig deeper into array elements that are plain
        // objects. (Recall that we only got this far if we have further to dig.)
        // This makes sense: we certainly don't dig deeper into non-indexable
        // objects. And it would be weird to dig into an array: it's simpler to have
        // a rule that explicit integer indexes only apply to an outer array, not to
        // an array you find after a branching search.
        //
        // In the special case of a numeric part in a *sort selector* (not a query
        // selector), we skip the branching: we ONLY allow the numeric part to mean
        // 'look up this index' in that case, not 'also look up this index in all
        // the elements of the array'.
        if (Array.isArray(firstLevel) && !(isNumericKey(parts[1]) && options.forSort)) {
            firstLevel.forEach((branch, arrayIndex)=>{
                if (LocalCollection._isPlainObject(branch)) {
                    appendToResult(lookupRest(branch, arrayIndices ? arrayIndices.concat(arrayIndex) : [
                        arrayIndex
                    ]));
                }
            });
        }
        return result;
    };
}
// Object exported only for unit testing.
// Use it to export private functions to test in Tinytest.
MinimongoTest = {
    makeLookupFunction
};
MinimongoError = (message, options = {})=>{
    if (typeof message === 'string' && options.field) {
        message += ` for field '${options.field}'`;
    }
    const error = new Error(message);
    error.name = 'MinimongoError';
    return error;
};
function nothingMatcher(docOrBranchedValues) {
    return {
        result: false
    };
}
// Takes an operator object (an object with $ keys) and returns a branched
// matcher for it.
function operatorBranchedMatcher(valueSelector, matcher, isRoot) {
    // Each valueSelector works separately on the various branches.  So one
    // operator can match one branch and another can match another branch.  This
    // is OK.
    const operatorMatchers = Object.keys(valueSelector).map((operator)=>{
        const operand = valueSelector[operator];
        const simpleRange = [
            '$lt',
            '$lte',
            '$gt',
            '$gte'
        ].includes(operator) && typeof operand === 'number';
        const simpleEquality = [
            '$ne',
            '$eq'
        ].includes(operator) && operand !== Object(operand);
        const simpleInclusion = [
            '$in',
            '$nin'
        ].includes(operator) && Array.isArray(operand) && !operand.some((x)=>x === Object(x));
        if (!(simpleRange || simpleInclusion || simpleEquality)) {
            matcher._isSimple = false;
        }
        if (hasOwn.call(VALUE_OPERATORS, operator)) {
            return VALUE_OPERATORS[operator](operand, valueSelector, matcher, isRoot);
        }
        if (hasOwn.call(ELEMENT_OPERATORS, operator)) {
            const options = ELEMENT_OPERATORS[operator];
            return convertElementMatcherToBranchedMatcher(options.compileElementSelector(operand, valueSelector, matcher), options);
        }
        throw new MiniMongoQueryError(`Unrecognized operator: ${operator}`);
    });
    return andBranchedMatchers(operatorMatchers);
}
// paths - Array: list of mongo style paths
// newLeafFn - Function: of form function(path) should return a scalar value to
//                       put into list created for that path
// conflictFn - Function: of form function(node, path, fullPath) is called
//                        when building a tree path for 'fullPath' node on
//                        'path' was already a leaf with a value. Must return a
//                        conflict resolution.
// initial tree - Optional Object: starting tree.
// @returns - Object: tree represented as a set of nested objects
function pathsToTree(paths, newLeafFn, conflictFn, root = {}) {
    paths.forEach((path)=>{
        const pathArray = path.split('.');
        let tree = root;
        // use .every just for iteration with break
        const success = pathArray.slice(0, -1).every((key, i)=>{
            if (!hasOwn.call(tree, key)) {
                tree[key] = {};
            } else if (tree[key] !== Object(tree[key])) {
                tree[key] = conflictFn(tree[key], pathArray.slice(0, i + 1).join('.'), path);
                // break out of loop if we are failing for this path
                if (tree[key] !== Object(tree[key])) {
                    return false;
                }
            }
            tree = tree[key];
            return true;
        });
        if (success) {
            const lastKey = pathArray[pathArray.length - 1];
            if (hasOwn.call(tree, lastKey)) {
                tree[lastKey] = conflictFn(tree[lastKey], path, path);
            } else {
                tree[lastKey] = newLeafFn(path);
            }
        }
    });
    return root;
}
// Makes sure we get 2 elements array and assume the first one to be x and
// the second one to y no matter what user passes.
// In case user passes { lon: x, lat: y } returns [x, y]
function pointToArray(point) {
    return Array.isArray(point) ? point.slice() : [
        point.x,
        point.y
    ];
}
// Creating a document from an upsert is quite tricky.
// E.g. this selector: {"$or": [{"b.foo": {"$all": ["bar"]}}]}, should result
// in: {"b.foo": "bar"}
// But this selector: {"$or": [{"b": {"foo": {"$all": ["bar"]}}}]} should throw
// an error
// Some rules (found mainly with trial & error, so there might be more):
// - handle all childs of $and (or implicit $and)
// - handle $or nodes with exactly 1 child
// - ignore $or nodes with more than 1 child
// - ignore $nor and $not nodes
// - throw when a value can not be set unambiguously
// - every value for $all should be dealt with as separate $eq-s
// - threat all children of $all as $eq setters (=> set if $all.length === 1,
//   otherwise throw error)
// - you can not mix '$'-prefixed keys and non-'$'-prefixed keys
// - you can only have dotted keys on a root-level
// - you can not have '$'-prefixed keys more than one-level deep in an object
// Handles one key/value pair to put in the selector document
function populateDocumentWithKeyValue(document, key, value) {
    if (value && Object.getPrototypeOf(value) === Object.prototype) {
        populateDocumentWithObject(document, key, value);
    } else if (!(value instanceof RegExp)) {
        insertIntoDocument(document, key, value);
    }
}
// Handles a key, value pair to put in the selector document
// if the value is an object
function populateDocumentWithObject(document, key, value) {
    const keys = Object.keys(value);
    const unprefixedKeys = keys.filter((op)=>op[0] !== '$');
    if (unprefixedKeys.length > 0 || !keys.length) {
        // Literal (possibly empty) object ( or empty object )
        // Don't allow mixing '$'-prefixed with non-'$'-prefixed fields
        if (keys.length !== unprefixedKeys.length) {
            throw new MiniMongoQueryError(`unknown operator: ${unprefixedKeys[0]}`);
        }
        validateObject(value, key);
        insertIntoDocument(document, key, value);
    } else {
        Object.keys(value).forEach((op)=>{
            const object = value[op];
            if (op === '$eq') {
                populateDocumentWithKeyValue(document, key, object);
            } else if (op === '$all') {
                // every value for $all should be dealt with as separate $eq-s
                object.forEach((element)=>populateDocumentWithKeyValue(document, key, element));
            }
        });
    }
}
// Fills a document with certain fields from an upsert selector
function populateDocumentWithQueryFields(query, document = {}) {
    if (Object.getPrototypeOf(query) === Object.prototype) {
        // handle implicit $and
        Object.keys(query).forEach((key)=>{
            const value = query[key];
            if (key === '$and') {
                // handle explicit $and
                value.forEach((element)=>populateDocumentWithQueryFields(element, document));
            } else if (key === '$or') {
                // handle $or nodes with exactly 1 child
                if (value.length === 1) {
                    populateDocumentWithQueryFields(value[0], document);
                }
            } else if (key[0] !== '$') {
                // Ignore other '$'-prefixed logical selectors
                populateDocumentWithKeyValue(document, key, value);
            }
        });
    } else {
        // Handle meteor-specific shortcut for selecting _id
        if (LocalCollection._selectorIsId(query)) {
            insertIntoDocument(document, '_id', query);
        }
    }
    return document;
}
// Traverses the keys of passed projection and constructs a tree where all
// leaves are either all True or all False
// @returns Object:
//  - tree - Object - tree representation of keys involved in projection
//  (exception for '_id' as it is a special case handled separately)
//  - including - Boolean - "take only certain fields" type of projection
function projectionDetails(fields) {
    // Find the non-_id keys (_id is handled specially because it is included
    // unless explicitly excluded). Sort the keys, so that our code to detect
    // overlaps like 'foo' and 'foo.bar' can assume that 'foo' comes first.
    let fieldsKeys = Object.keys(fields).sort();
    // If _id is the only field in the projection, do not remove it, since it is
    // required to determine if this is an exclusion or exclusion. Also keep an
    // inclusive _id, since inclusive _id follows the normal rules about mixing
    // inclusive and exclusive fields. If _id is not the only field in the
    // projection and is exclusive, remove it so it can be handled later by a
    // special case, since exclusive _id is always allowed.
    if (!(fieldsKeys.length === 1 && fieldsKeys[0] === '_id') && !(fieldsKeys.includes('_id') && fields._id)) {
        fieldsKeys = fieldsKeys.filter((key)=>key !== '_id');
    }
    let including = null; // Unknown
    fieldsKeys.forEach((keyPath)=>{
        const rule = !!fields[keyPath];
        if (including === null) {
            including = rule;
        }
        // This error message is copied from MongoDB shell
        if (including !== rule) {
            throw MinimongoError('You cannot currently mix including and excluding fields.');
        }
    });
    const projectionRulesTree = pathsToTree(fieldsKeys, (path)=>including, (node, path, fullPath)=>{
        // Check passed projection fields' keys: If you have two rules such as
        // 'foo.bar' and 'foo.bar.baz', then the result becomes ambiguous. If
        // that happens, there is a probability you are doing something wrong,
        // framework should notify you about such mistake earlier on cursor
        // compilation step than later during runtime.  Note, that real mongo
        // doesn't do anything about it and the later rule appears in projection
        // project, more priority it takes.
        //
        // Example, assume following in mongo shell:
        // > db.coll.insert({ a: { b: 23, c: 44 } })
        // > db.coll.find({}, { 'a': 1, 'a.b': 1 })
        // {"_id": ObjectId("520bfe456024608e8ef24af3"), "a": {"b": 23}}
        // > db.coll.find({}, { 'a.b': 1, 'a': 1 })
        // {"_id": ObjectId("520bfe456024608e8ef24af3"), "a": {"b": 23, "c": 44}}
        //
        // Note, how second time the return set of keys is different.
        const currentPath = fullPath;
        const anotherPath = path;
        throw MinimongoError(`both ${currentPath} and ${anotherPath} found in fields option, ` + 'using both of them may trigger unexpected behavior. Did you mean to ' + 'use only one of them?');
    });
    return {
        including,
        tree: projectionRulesTree
    };
}
// Takes a RegExp object and returns an element matcher.
function regexpElementMatcher(regexp) {
    return (value)=>{
        if (value instanceof RegExp) {
            return value.toString() === regexp.toString();
        }
        // Regexps only work against strings.
        if (typeof value !== 'string') {
            return false;
        }
        // Reset regexp's state to avoid inconsistent matching for objects with the
        // same value on consecutive calls of regexp.test. This happens only if the
        // regexp has the 'g' flag. Also note that ES6 introduces a new flag 'y' for
        // which we should *not* change the lastIndex but MongoDB doesn't support
        // either of these flags.
        regexp.lastIndex = 0;
        return regexp.test(value);
    };
}
// Validates the key in a path.
// Objects that are nested more then 1 level cannot have dotted fields
// or fields starting with '$'
function validateKeyInPath(key, path) {
    if (key.includes('.')) {
        throw new Error(`The dotted field '${key}' in '${path}.${key} is not valid for storage.`);
    }
    if (key[0] === '$') {
        throw new Error(`The dollar ($) prefixed field  '${path}.${key} is not valid for storage.`);
    }
}
// Recursively validates an object that is nested more than one level deep
function validateObject(object, path) {
    if (object && Object.getPrototypeOf(object) === Object.prototype) {
        Object.keys(object).forEach((key)=>{
            validateKeyInPath(key, path);
            validateObject(object[key], path + '.' + key);
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"constants.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/constants.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({getAsyncMethodName:()=>getAsyncMethodName});module.export({ASYNC_COLLECTION_METHODS:()=>ASYNC_COLLECTION_METHODS,ASYNC_CURSOR_METHODS:()=>ASYNC_CURSOR_METHODS,CLIENT_ONLY_METHODS:()=>CLIENT_ONLY_METHODS},true);/** Exported values are also used in the mongo package. */ /** @param {string} method */ function getAsyncMethodName(method) {
    return `${method.replace('_', '')}Async`;
}
const ASYNC_COLLECTION_METHODS = [
    '_createCappedCollection',
    'dropCollection',
    'dropIndex',
    /**
   * @summary Creates the specified index on the collection.
   * @locus server
   * @method createIndexAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   * @returns {Promise}
   */ 'createIndex',
    /**
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
   * @locus Anywhere
   * @method findOneAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to find
   * @param {Object} [options]
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
   * @param {Number} options.skip Number of results to skip at the beginning
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
   * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
   * @returns {Promise}
   */ 'findOne',
    /**
   * @summary Insert a document in the collection.  Returns its unique _id.
   * @locus Anywhere
   * @method  insertAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
   * @return {Promise}
   */ 'insert',
    /**
   * @summary Remove documents from the collection
   * @locus Anywhere
   * @method removeAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to remove
   * @return {Promise}
   */ 'remove',
    /**
   * @summary Modify one or more documents in the collection. Returns the number of matched documents.
   * @locus Anywhere
   * @method updateAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
   * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
   * @return {Promise}
   */ 'update',
    /**
   * @summary Modify one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere
   * @method upsertAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @return {Promise}
   */ 'upsert'
];
const ASYNC_CURSOR_METHODS = [
    /**
   * @deprecated in 2.9
   * @summary Returns the number of documents that match a query. This method is
   *          [deprecated since MongoDB 4.0](https://www.mongodb.com/docs/v4.4/reference/command/count/);
   *          see `Collection.countDocuments` and
   *          `Collection.estimatedDocumentCount` for a replacement.
   * @memberOf Mongo.Cursor
   * @method  countAsync
   * @instance
   * @locus Anywhere
   * @returns {Promise}
   */ 'count',
    /**
   * @summary Return all matching documents as an Array.
   * @memberOf Mongo.Cursor
   * @method  fetchAsync
   * @instance
   * @locus Anywhere
   * @returns {Promise}
   */ 'fetch',
    /**
   * @summary Call `callback` once for each matching document, sequentially and
   *          synchronously.
   * @locus Anywhere
   * @method  forEachAsync
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   * @returns {Promise}
   */ 'forEach',
    /**
   * @summary Map callback over all matching documents. Returns a Promise<Array>.
   * @locus Anywhere
   * @method mapAsync
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   * @returns {Promise<Array>}
   */ 'map'
];
const CLIENT_ONLY_METHODS = [
    "findOne",
    "insert",
    "remove",
    "update",
    "upsert"
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cursor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/cursor.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({default:()=>Cursor});let _async_iterator;module.link("@swc/helpers/_/_async_iterator",{_(v){_async_iterator=v}},0);let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},1);let LocalCollection;module.link('./local_collection.js',{default(v){LocalCollection=v}},2);let hasOwn;module.link('./common.js',{hasOwn(v){hasOwn=v}},3);let ASYNC_CURSOR_METHODS,getAsyncMethodName;module.link('./constants',{ASYNC_CURSOR_METHODS(v){ASYNC_CURSOR_METHODS=v},getAsyncMethodName(v){getAsyncMethodName=v}},4);




class Cursor {
    /**
   * @deprecated in 2.9
   * @summary Returns the number of documents that match a query. This method is
   *          [deprecated since MongoDB 4.0](https://www.mongodb.com/docs/v4.4/reference/command/count/);
   *          see `Collection.countDocuments` and
   *          `Collection.estimatedDocumentCount` for a replacement.
   * @memberOf Mongo.Cursor
   * @method  count
   * @instance
   * @locus Anywhere
   * @returns {Number}
   */ count() {
        if (this.reactive) {
            // allow the observe to be unordered
            this._depend({
                added: true,
                removed: true
            }, true);
        }
        return this._getRawObjects({
            ordered: true
        }).length;
    }
    /**
   * @summary Return all matching documents as an Array.
   * @memberOf Mongo.Cursor
   * @method  fetch
   * @instance
   * @locus Anywhere
   * @returns {Object[]}
   */ fetch() {
        const result = [];
        this.forEach((doc)=>{
            result.push(doc);
        });
        return result;
    }
    [Symbol.iterator]() {
        if (this.reactive) {
            this._depend({
                addedBefore: true,
                removed: true,
                changed: true,
                movedBefore: true
            });
        }
        let index = 0;
        const objects = this._getRawObjects({
            ordered: true
        });
        return {
            next: ()=>{
                if (index < objects.length) {
                    // This doubles as a clone operation.
                    let element = this._projectionFn(objects[index++]);
                    if (this._transform) element = this._transform(element);
                    return {
                        value: element
                    };
                }
                return {
                    done: true
                };
            }
        };
    }
    [Symbol.asyncIterator]() {
        const syncResult = this[Symbol.iterator]();
        return {
            next () {
                return _async_to_generator(function*() {
                    return Promise.resolve(syncResult.next());
                })();
            }
        };
    }
    /**
   * @callback IterationCallback
   * @param {Object} doc
   * @param {Number} index
   */ /**
   * @summary Call `callback` once for each matching document, sequentially and
   *          synchronously.
   * @locus Anywhere
   * @method  forEach
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   */ forEach(callback, thisArg) {
        let i = 0;
        for (const doc of this){
            callback.call(thisArg, doc, i++, this);
        }
    }
    /**
   * @summary Call `callback` once for each matching document, sequentially and
   *          synchronously.
   * @locus Anywhere
   * @method  forEachAsync
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   * @returns {Promise}
   */ forEachAsync(callback, thisArg) {
        return _async_to_generator(function*() {
            let i = 0;
            {
                var _iteratorAbruptCompletion = false, _didIteratorError = false, _iteratorError;
                try {
                    for(var _iterator = _async_iterator(this), _step; _iteratorAbruptCompletion = !(_step = yield _iterator.next()).done; _iteratorAbruptCompletion = false){
                        let _value = _step.value;
                        const doc = _value;
                        yield callback.call(thisArg, doc, i++, this);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (_iteratorAbruptCompletion && _iterator.return != null) {
                            yield _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }).call(this);
    }
    getTransform() {
        return this._transform;
    }
    /**
   * @summary Map callback over all matching documents. Returns an Array.
   * @locus Anywhere
   * @method map
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   */ map(callback, thisArg) {
        const result = [];
        this.forEach((doc, i)=>{
            result.push(callback.call(thisArg, doc, i, this));
        });
        return result;
    }
    /**
   * @summary Map callback over all matching documents. Returns a Promise<Array>.
   * @locus Anywhere
   * @method mapAsync
   * @instance
   * @memberOf Mongo.Cursor
   * @param {IterationCallback} callback Function to call. It will be called
   *                                     with three arguments: the document, a
   *                                     0-based index, and <em>cursor</em>
   *                                     itself.
   * @param {Any} [thisArg] An object which will be the value of `this` inside
   *                        `callback`.
   * @returns {Promise<Array>}
   */ mapAsync(callback, thisArg) {
        return _async_to_generator(function*() {
            const result = [];
            yield this.forEachAsync((doc, i)=>_async_to_generator(function*() {
                    result.push((yield callback.call(thisArg, doc, i, this)));
                }).call(this));
            return result;
        }).call(this);
    }
    // options to contain:
    //  * callbacks for observe():
    //    - addedAt (document, atIndex)
    //    - added (document)
    //    - changedAt (newDocument, oldDocument, atIndex)
    //    - changed (newDocument, oldDocument)
    //    - removedAt (document, atIndex)
    //    - removed (document)
    //    - movedTo (document, oldIndex, newIndex)
    //
    // attributes available on returned query handle:
    //  * stop(): end updates
    //  * collection: the collection this query is querying
    //
    // iff x is a returned query handle, (x instanceof
    // LocalCollection.ObserveHandle) is true
    //
    // initial results delivered through added callback
    // XXX maybe callbacks should take a list of objects, to expose transactions?
    // XXX maybe support field limiting (to limit what you're notified on)
    /**
   * @summary Watch a query.  Receive callbacks as the result set changes.
   * @locus Anywhere
   * @memberOf Mongo.Cursor
   * @instance
   * @param {Object} callbacks Functions to call to deliver the result set as it
   *                           changes
   */ observe(options) {
        return LocalCollection._observeFromObserveChanges(this, options);
    }
    /**
   * @summary Watch a query.  Receive callbacks as the result set changes.
   * @locus Anywhere
   * @memberOf Mongo.Cursor
   * @instance
   */ observeAsync(options) {
        return new Promise((resolve)=>resolve(this.observe(options)));
    }
    /**
   * @summary Watch a query. Receive callbacks as the result set changes. Only
   *          the differences between the old and new documents are passed to
   *          the callbacks.
   * @locus Anywhere
   * @memberOf Mongo.Cursor
   * @instance
   * @param {Object} callbacks Functions to call to deliver the result set as it
   *                           changes
   */ observeChanges(options) {
        const ordered = LocalCollection._observeChangesCallbacksAreOrdered(options);
        // there are several places that assume you aren't combining skip/limit with
        // unordered observe.  eg, update's EJSON.clone, and the "there are several"
        // comment in _modifyAndNotify
        // XXX allow skip/limit with unordered observe
        if (!options._allow_unordered && !ordered && (this.skip || this.limit)) {
            throw new Error("Must use an ordered observe with skip or limit (i.e. 'addedBefore' " + "for observeChanges or 'addedAt' for observe, instead of 'added').");
        }
        if (this.fields && (this.fields._id === 0 || this.fields._id === false)) {
            throw Error("You may not observe a cursor with {fields: {_id: 0}}");
        }
        const distances = this.matcher.hasGeoQuery() && ordered && new LocalCollection._IdMap();
        const query = {
            cursor: this,
            dirty: false,
            distances,
            matcher: this.matcher,
            ordered,
            projectionFn: this._projectionFn,
            resultsSnapshot: null,
            sorter: ordered && this.sorter
        };
        let qid;
        // Non-reactive queries call added[Before] and then never call anything
        // else.
        if (this.reactive) {
            qid = this.collection.next_qid++;
            this.collection.queries[qid] = query;
        }
        query.results = this._getRawObjects({
            ordered,
            distances: query.distances
        });
        if (this.collection.paused) {
            query.resultsSnapshot = ordered ? [] : new LocalCollection._IdMap();
        }
        // wrap callbacks we were passed. callbacks only fire when not paused and
        // are never undefined
        // Filters out blacklisted fields according to cursor's projection.
        // XXX wrong place for this?
        // furthermore, callbacks enqueue until the operation we're working on is
        // done.
        const wrapCallback = (fn)=>{
            if (!fn) {
                return ()=>{};
            }
            const self = this;
            return function() {
                if (self.collection.paused) {
                    return;
                }
                const args = arguments;
                self.collection._observeQueue.queueTask(()=>{
                    fn.apply(this, args);
                });
            };
        };
        query.added = wrapCallback(options.added);
        query.changed = wrapCallback(options.changed);
        query.removed = wrapCallback(options.removed);
        if (ordered) {
            query.addedBefore = wrapCallback(options.addedBefore);
            query.movedBefore = wrapCallback(options.movedBefore);
        }
        if (!options._suppress_initial && !this.collection.paused) {
            var _query_results_size, _query_results;
            const handler = (doc)=>{
                const fields = EJSON.clone(doc);
                delete fields._id;
                if (ordered) {
                    query.addedBefore(doc._id, this._projectionFn(fields), null);
                }
                query.added(doc._id, this._projectionFn(fields));
            };
            // it means it's just an array
            if (query.results.length) {
                for (const doc of query.results){
                    handler(doc);
                }
            }
            // it means it's an id map
            if ((_query_results = query.results) === null || _query_results === void 0 ? void 0 : (_query_results_size = _query_results.size) === null || _query_results_size === void 0 ? void 0 : _query_results_size.call(_query_results)) {
                query.results.forEach(handler);
            }
        }
        const handle = Object.assign(new LocalCollection.ObserveHandle(), {
            collection: this.collection,
            stop: ()=>{
                if (this.reactive) {
                    delete this.collection.queries[qid];
                }
            },
            isReady: false,
            isReadyPromise: null
        });
        if (this.reactive && Tracker.active) {
            // XXX in many cases, the same observe will be recreated when
            // the current autorun is rerun.  we could save work by
            // letting it linger across rerun and potentially get
            // repurposed if the same observe is performed, using logic
            // similar to that of Meteor.subscribe.
            Tracker.onInvalidate(()=>{
                handle.stop();
            });
        }
        // run the observe callbacks resulting from the initial contents
        // before we leave the observe.
        const drainResult = this.collection._observeQueue.drain();
        if (drainResult instanceof Promise) {
            handle.isReadyPromise = drainResult;
            drainResult.then(()=>handle.isReady = true);
        } else {
            handle.isReady = true;
            handle.isReadyPromise = Promise.resolve();
        }
        return handle;
    }
    /**
   * @summary Watch a query. Receive callbacks as the result set changes. Only
   *          the differences between the old and new documents are passed to
   *          the callbacks.
   * @locus Anywhere
   * @memberOf Mongo.Cursor
   * @instance
   * @param {Object} callbacks Functions to call to deliver the result set as it
   *                           changes
   */ observeChangesAsync(options) {
        return new Promise((resolve)=>{
            const handle = this.observeChanges(options);
            handle.isReadyPromise.then(()=>resolve(handle));
        });
    }
    // XXX Maybe we need a version of observe that just calls a callback if
    // anything changed.
    _depend(changers, _allow_unordered) {
        if (Tracker.active) {
            const dependency = new Tracker.Dependency();
            const notify = dependency.changed.bind(dependency);
            dependency.depend();
            const options = {
                _allow_unordered,
                _suppress_initial: true
            };
            [
                'added',
                'addedBefore',
                'changed',
                'movedBefore',
                'removed'
            ].forEach((fn)=>{
                if (changers[fn]) {
                    options[fn] = notify;
                }
            });
            // observeChanges will stop() when this computation is invalidated
            this.observeChanges(options);
        }
    }
    _getCollectionName() {
        return this.collection.name;
    }
    // Returns a collection of matching objects, but doesn't deep copy them.
    //
    // If ordered is set, returns a sorted array, respecting sorter, skip, and
    // limit properties of the query provided that options.applySkipLimit is
    // not set to false (#1201). If sorter is falsey, no sort -- you get the
    // natural order.
    //
    // If ordered is not set, returns an object mapping from ID to doc (sorter,
    // skip and limit should not be set).
    //
    // If ordered is set and this cursor is a $near geoquery, then this function
    // will use an _IdMap to track each distance from the $near argument point in
    // order to use it as a sort key. If an _IdMap is passed in the 'distances'
    // argument, this function will clear it and use it for this purpose
    // (otherwise it will just create its own _IdMap). The observeChanges
    // implementation uses this to remember the distances after this function
    // returns.
    _getRawObjects(options = {}) {
        // By default this method will respect skip and limit because .fetch(),
        // .forEach() etc... expect this behaviour. It can be forced to ignore
        // skip and limit by setting applySkipLimit to false (.count() does this,
        // for example)
        const applySkipLimit = options.applySkipLimit !== false;
        // XXX use OrderedDict instead of array, and make IdMap and OrderedDict
        // compatible
        const results = options.ordered ? [] : new LocalCollection._IdMap();
        // fast path for single ID value
        if (this._selectorId !== undefined) {
            // If you have non-zero skip and ask for a single id, you get nothing.
            // This is so it matches the behavior of the '{_id: foo}' path.
            if (applySkipLimit && this.skip) {
                return results;
            }
            const selectedDoc = this.collection._docs.get(this._selectorId);
            if (selectedDoc) {
                if (options.ordered) {
                    results.push(selectedDoc);
                } else {
                    results.set(this._selectorId, selectedDoc);
                }
            }
            return results;
        }
        // slow path for arbitrary selector, sort, skip, limit
        // in the observeChanges case, distances is actually part of the "query"
        // (ie, live results set) object.  in other cases, distances is only used
        // inside this function.
        let distances;
        if (this.matcher.hasGeoQuery() && options.ordered) {
            if (options.distances) {
                distances = options.distances;
                distances.clear();
            } else {
                distances = new LocalCollection._IdMap();
            }
        }
        Meteor._runFresh(()=>{
            this.collection._docs.forEach((doc, id)=>{
                const matchResult = this.matcher.documentMatches(doc);
                if (matchResult.result) {
                    if (options.ordered) {
                        results.push(doc);
                        if (distances && matchResult.distance !== undefined) {
                            distances.set(id, matchResult.distance);
                        }
                    } else {
                        results.set(id, doc);
                    }
                }
                // Override to ensure all docs are matched if ignoring skip & limit
                if (!applySkipLimit) {
                    return true;
                }
                // Fast path for limited unsorted queries.
                // XXX 'length' check here seems wrong for ordered
                return !this.limit || this.skip || this.sorter || results.length !== this.limit;
            });
        });
        if (!options.ordered) {
            return results;
        }
        if (this.sorter) {
            results.sort(this.sorter.getComparator({
                distances
            }));
        }
        // Return the full set of results if there is no skip or limit or if we're
        // ignoring them
        if (!applySkipLimit || !this.limit && !this.skip) {
            return results;
        }
        return results.slice(this.skip, this.limit ? this.limit + this.skip : results.length);
    }
    _publishCursor(subscription) {
        // XXX minimongo should not depend on mongo-livedata!
        if (!Package.mongo) {
            throw new Error("Can't publish from Minimongo without the `mongo` package.");
        }
        if (!this.collection.name) {
            throw new Error("Can't publish a cursor from a collection without a name.");
        }
        return Package.mongo.Mongo.Collection._publishCursor(this, subscription, this.collection.name);
    }
    // don't call this ctor directly.  use LocalCollection.find().
    constructor(collection, selector, options = {}){
        this.collection = collection;
        this.sorter = null;
        // Create the collator once and share it with both Matcher and Sorter.
        const collator = LocalCollection._createCollator(options.collation);
        this.matcher = new Minimongo.Matcher(selector, undefined, collator);
        if (LocalCollection._selectorIsIdPerhapsAsObject(selector) && !options.collation) {
            // stash for fast _id and { _id }
            this._selectorId = hasOwn.call(selector, '_id') ? selector._id : selector;
        } else {
            this._selectorId = undefined;
            if (this.matcher.hasGeoQuery() || options.sort) {
                this.sorter = new Minimongo.Sorter(options.sort || [], collator);
            }
        }
        this.skip = options.skip || 0;
        this.limit = options.limit;
        this.fields = options.projection || options.fields;
        this._projectionFn = LocalCollection._compileProjection(this.fields || {});
        this._transform = LocalCollection.wrapTransform(options.transform);
        // by default, queries register w/ Tracker when it is available.
        if (typeof Tracker !== 'undefined') {
            this.reactive = options.reactive === undefined ? true : options.reactive;
        }
    }
}
// Cursor: a specification for a particular subset of documents, w/ a defined
// order, limit, and offset.  creating a Cursor with LocalCollection.find(),

// Implements async version of cursor methods to keep collections isomorphic
ASYNC_CURSOR_METHODS.forEach((method)=>{
    const asyncName = getAsyncMethodName(method);
    if (Cursor.prototype[asyncName]) {
        return;
    }
    Cursor.prototype[asyncName] = function(...args) {
        try {
            return Promise.resolve(this[method].apply(this, args));
        } catch (error) {
            return Promise.reject(error);
        }
    };
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"local_collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/local_collection.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({default:()=>LocalCollection});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},1);let Cursor;module.link('./cursor.js',{default(v){Cursor=v}},2);let ObserveHandle;module.link('./observe_handle.js',{default(v){ObserveHandle=v}},3);let hasOwn,isIndexable,isNumericKey,isOperatorObject,populateDocumentWithQueryFields,projectionDetails;module.link('./common.js',{hasOwn(v){hasOwn=v},isIndexable(v){isIndexable=v},isNumericKey(v){isNumericKey=v},isOperatorObject(v){isOperatorObject=v},populateDocumentWithQueryFields(v){populateDocumentWithQueryFields=v},projectionDetails(v){projectionDetails=v}},4);let getAsyncMethodName;module.link('./constants',{getAsyncMethodName(v){getAsyncMethodName=v}},5);





class LocalCollection {
    countDocuments(selector, options) {
        return this.find(selector !== null && selector !== void 0 ? selector : {}, options).countAsync();
    }
    estimatedDocumentCount(options) {
        return this.find({}, options).countAsync();
    }
    // options may include sort, skip, limit, reactive
    // sort may be any of these forms:
    //     {a: 1, b: -1}
    //     [["a", "asc"], ["b", "desc"]]
    //     ["a", ["b", "desc"]]
    //   (in the first form you're beholden to key enumeration order in
    //   your javascript VM)
    //
    // reactive: if given, and false, don't register with Tracker (default
    // is true)
    //
    // XXX possibly should support retrieving a subset of fields? and
    // have it be a hint (ignored on the client, when not copying the
    // doc?)
    //
    // XXX sort does not yet support subkeys ('a.b') .. fix that!
    // XXX add one more sort form: "key"
    // XXX tests
    find(selector, options) {
        // default syntax for everything is to omit the selector argument.
        // but if selector is explicitly passed in as false or undefined, we
        // want a selector that matches nothing.
        if (arguments.length === 0) {
            selector = {};
        }
        return new LocalCollection.Cursor(this, selector, options);
    }
    findOne(selector, options = {}) {
        if (arguments.length === 0) {
            selector = {};
        }
        // NOTE: by setting limit 1 here, we end up using very inefficient
        // code that recomputes the whole query on each update. The upside is
        // that when you reactively depend on a findOne you only get
        // invalidated when the found object changes, not any object in the
        // collection. Most findOne will be by id, which has a fast path, so
        // this might not be a big deal. In most cases, invalidation causes
        // the called to re-query anyway, so this should be a net performance
        // improvement.
        options.limit = 1;
        return this.find(selector, options).fetch()[0];
    }
    findOneAsync(_0) {
        return _async_to_generator(function*(selector, options = {}) {
            if (arguments.length === 0) {
                selector = {};
            }
            options.limit = 1;
            return (yield this.find(selector, options).fetchAsync())[0];
        }).apply(this, arguments);
    }
    prepareInsert(doc) {
        assertHasValidFieldNames(doc);
        // if you really want to use ObjectIDs, set this global.
        // Mongo.Collection specifies its own ids and does not use this code.
        if (!hasOwn.call(doc, '_id')) {
            doc._id = LocalCollection._useOID ? new MongoID.ObjectID() : Random.id();
        }
        const id = doc._id;
        if (this._docs.has(id)) {
            throw MinimongoError(`Duplicate _id '${id}'`);
        }
        this._saveOriginal(id, undefined);
        this._docs.set(id, doc);
        return id;
    }
    // XXX possibly enforce that 'undefined' does not appear (we assume
    // this in our handling of null and $exists)
    insert(doc, callback) {
        doc = EJSON.clone(doc);
        const id = this.prepareInsert(doc);
        const queriesToRecompute = [];
        // trigger live queries that match
        for (const qid of Object.keys(this.queries)){
            const query = this.queries[qid];
            if (query.dirty) {
                continue;
            }
            const matchResult = query.matcher.documentMatches(doc);
            if (matchResult.result) {
                if (query.distances && matchResult.distance !== undefined) {
                    query.distances.set(id, matchResult.distance);
                }
                if (query.cursor.skip || query.cursor.limit) {
                    queriesToRecompute.push(qid);
                } else {
                    LocalCollection._insertInResultsSync(query, doc);
                }
            }
        }
        queriesToRecompute.forEach((qid)=>{
            if (this.queries[qid]) {
                this._recomputeResults(this.queries[qid]);
            }
        });
        this._observeQueue.drain();
        if (callback) {
            Meteor.defer(()=>{
                callback(null, id);
            });
        }
        return id;
    }
    insertAsync(doc, callback) {
        return _async_to_generator(function*() {
            doc = EJSON.clone(doc);
            const id = this.prepareInsert(doc);
            const queriesToRecompute = [];
            // trigger live queries that match
            for(const qid in this.queries){
                const query = this.queries[qid];
                if (query.dirty) {
                    continue;
                }
                const matchResult = query.matcher.documentMatches(doc);
                if (matchResult.result) {
                    if (query.distances && matchResult.distance !== undefined) {
                        query.distances.set(id, matchResult.distance);
                    }
                    if (query.cursor.skip || query.cursor.limit) {
                        queriesToRecompute.push(qid);
                    } else {
                        yield LocalCollection._insertInResultsAsync(query, doc);
                    }
                }
            }
            queriesToRecompute.forEach((qid)=>{
                if (this.queries[qid]) {
                    this._recomputeResults(this.queries[qid]);
                }
            });
            yield this._observeQueue.drain();
            if (callback) {
                Meteor.defer(()=>{
                    callback(null, id);
                });
            }
            return id;
        }).call(this);
    }
    // Pause the observers. No callbacks from observers will fire until
    // 'resumeObservers' is called.
    pauseObservers() {
        // No-op if already paused.
        if (this.paused) {
            return;
        }
        // Set the 'paused' flag such that new observer messages don't fire.
        this.paused = true;
        // Take a snapshot of the query results for each query.
        Object.keys(this.queries).forEach((qid)=>{
            const query = this.queries[qid];
            query.resultsSnapshot = EJSON.clone(query.results);
        });
    }
    clearResultQueries(callback) {
        const result = this._docs.size();
        this._docs.clear();
        Object.keys(this.queries).forEach((qid)=>{
            const query = this.queries[qid];
            if (query.ordered) {
                query.results = [];
            } else {
                query.results.clear();
            }
        });
        if (callback) {
            Meteor.defer(()=>{
                callback(null, result);
            });
        }
        return result;
    }
    prepareRemove(selector) {
        const matcher = new Minimongo.Matcher(selector);
        const remove = [];
        this._eachPossiblyMatchingDocSync(selector, (doc, id)=>{
            if (matcher.documentMatches(doc).result) {
                remove.push(id);
            }
        });
        const queriesToRecompute = [];
        const queryRemove = [];
        for(let i = 0; i < remove.length; i++){
            const removeId = remove[i];
            const removeDoc = this._docs.get(removeId);
            Object.keys(this.queries).forEach((qid)=>{
                const query = this.queries[qid];
                if (query.dirty) {
                    return;
                }
                if (query.matcher.documentMatches(removeDoc).result) {
                    if (query.cursor.skip || query.cursor.limit) {
                        queriesToRecompute.push(qid);
                    } else {
                        queryRemove.push({
                            qid,
                            doc: removeDoc
                        });
                    }
                }
            });
            this._saveOriginal(removeId, removeDoc);
            this._docs.remove(removeId);
        }
        return {
            queriesToRecompute,
            queryRemove,
            remove
        };
    }
    remove(selector, callback) {
        // Easy special case: if we're not calling observeChanges callbacks and
        // we're not saving originals and we got asked to remove everything, then
        // just empty everything directly.
        if (this.paused && !this._savedOriginals && EJSON.equals(selector, {})) {
            return this.clearResultQueries(callback);
        }
        const { queriesToRecompute, queryRemove, remove } = this.prepareRemove(selector);
        // run live query callbacks _after_ we've removed the documents.
        queryRemove.forEach((remove)=>{
            const query = this.queries[remove.qid];
            if (query) {
                query.distances && query.distances.remove(remove.doc._id);
                LocalCollection._removeFromResultsSync(query, remove.doc);
            }
        });
        queriesToRecompute.forEach((qid)=>{
            const query = this.queries[qid];
            if (query) {
                this._recomputeResults(query);
            }
        });
        this._observeQueue.drain();
        const result = remove.length;
        if (callback) {
            Meteor.defer(()=>{
                callback(null, result);
            });
        }
        return result;
    }
    removeAsync(selector, callback) {
        return _async_to_generator(function*() {
            // Easy special case: if we're not calling observeChanges callbacks and
            // we're not saving originals and we got asked to remove everything, then
            // just empty everything directly.
            if (this.paused && !this._savedOriginals && EJSON.equals(selector, {})) {
                return this.clearResultQueries(callback);
            }
            const { queriesToRecompute, queryRemove, remove } = this.prepareRemove(selector);
            // run live query callbacks _after_ we've removed the documents.
            for (const remove of queryRemove){
                const query = this.queries[remove.qid];
                if (query) {
                    query.distances && query.distances.remove(remove.doc._id);
                    yield LocalCollection._removeFromResultsAsync(query, remove.doc);
                }
            }
            queriesToRecompute.forEach((qid)=>{
                const query = this.queries[qid];
                if (query) {
                    this._recomputeResults(query);
                }
            });
            yield this._observeQueue.drain();
            const result = remove.length;
            if (callback) {
                Meteor.defer(()=>{
                    callback(null, result);
                });
            }
            return result;
        }).call(this);
    }
    // Resume the observers. Observers immediately receive change
    // notifications to bring them to the current state of the
    // database. Note that this is not just replaying all the changes that
    // happened during the pause, it is a smarter 'coalesced' diff.
    _resumeObservers() {
        // No-op if not paused.
        if (!this.paused) {
            return;
        }
        // Unset the 'paused' flag. Make sure to do this first, otherwise
        // observer methods won't actually fire when we trigger them.
        this.paused = false;
        Object.keys(this.queries).forEach((qid)=>{
            const query = this.queries[qid];
            if (query.dirty) {
                query.dirty = false;
                // re-compute results will perform `LocalCollection._diffQueryChanges`
                // automatically.
                this._recomputeResults(query, query.resultsSnapshot);
            } else {
                // Diff the current results against the snapshot and send to observers.
                // pass the query object for its observer callbacks.
                LocalCollection._diffQueryChanges(query.ordered, query.resultsSnapshot, query.results, query, {
                    projectionFn: query.projectionFn
                });
            }
            query.resultsSnapshot = null;
        });
    }
    resumeObserversServer() {
        return _async_to_generator(function*() {
            this._resumeObservers();
            yield this._observeQueue.drain();
        }).call(this);
    }
    resumeObserversClient() {
        this._resumeObservers();
        this._observeQueue.drain();
    }
    retrieveOriginals() {
        if (!this._savedOriginals) {
            throw new Error('Called retrieveOriginals without saveOriginals');
        }
        const originals = this._savedOriginals;
        this._savedOriginals = null;
        return originals;
    }
    // To track what documents are affected by a piece of code, call
    // saveOriginals() before it and retrieveOriginals() after it.
    // retrieveOriginals returns an object whose keys are the ids of the documents
    // that were affected since the call to saveOriginals(), and the values are
    // equal to the document's contents at the time of saveOriginals. (In the case
    // of an inserted document, undefined is the value.) You must alternate
    // between calls to saveOriginals() and retrieveOriginals().
    saveOriginals() {
        if (this._savedOriginals) {
            throw new Error('Called saveOriginals twice without retrieveOriginals');
        }
        this._savedOriginals = new LocalCollection._IdMap;
    }
    prepareUpdate(selector) {
        // Save the original results of any query that we might need to
        // _recomputeResults on, because _modifyAndNotify will mutate the objects in
        // it. (We don't need to save the original results of paused queries because
        // they already have a resultsSnapshot and we won't be diffing in
        // _recomputeResults.)
        const qidToOriginalResults = {};
        // We should only clone each document once, even if it appears in multiple
        // queries
        const docMap = new LocalCollection._IdMap;
        const idsMatched = LocalCollection._idsMatchedBySelector(selector);
        Object.keys(this.queries).forEach((qid)=>{
            const query = this.queries[qid];
            if ((query.cursor.skip || query.cursor.limit) && !this.paused) {
                // Catch the case of a reactive `count()` on a cursor with skip
                // or limit, which registers an unordered observe. This is a
                // pretty rare case, so we just clone the entire result set with
                // no optimizations for documents that appear in these result
                // sets and other queries.
                if (query.results instanceof LocalCollection._IdMap) {
                    qidToOriginalResults[qid] = query.results.clone();
                    return;
                }
                if (!(query.results instanceof Array)) {
                    throw new Error('Assertion failed: query.results not an array');
                }
                // Clones a document to be stored in `qidToOriginalResults`
                // because it may be modified before the new and old result sets
                // are diffed. But if we know exactly which document IDs we're
                // going to modify, then we only need to clone those.
                const memoizedCloneIfNeeded = (doc)=>{
                    if (docMap.has(doc._id)) {
                        return docMap.get(doc._id);
                    }
                    const docToMemoize = idsMatched && !idsMatched.some((id)=>EJSON.equals(id, doc._id)) ? doc : EJSON.clone(doc);
                    docMap.set(doc._id, docToMemoize);
                    return docToMemoize;
                };
                qidToOriginalResults[qid] = query.results.map(memoizedCloneIfNeeded);
            }
        });
        return qidToOriginalResults;
    }
    finishUpdate({ options, updateCount, callback, insertedId }) {
        // Return the number of affected documents, or in the upsert case, an object
        // containing the number of affected docs and the id of the doc that was
        // inserted, if any.
        let result;
        if (options._returnObject) {
            result = {
                numberAffected: updateCount
            };
            if (insertedId !== undefined) {
                result.insertedId = insertedId;
            }
        } else {
            result = updateCount;
        }
        if (callback) {
            Meteor.defer(()=>{
                callback(null, result);
            });
        }
        return result;
    }
    // XXX atomicity: if multi is true, and one modification fails, do
    // we rollback the whole operation, or what?
    updateAsync(selector, mod, options, callback) {
        return _async_to_generator(function*() {
            if (!callback && options instanceof Function) {
                callback = options;
                options = null;
            }
            if (!options) {
                options = {};
            }
            const matcher = new Minimongo.Matcher(selector, true);
            const qidToOriginalResults = this.prepareUpdate(selector);
            let recomputeQids = {};
            let updateCount = 0;
            yield this._eachPossiblyMatchingDocAsync(selector, (doc, id)=>_async_to_generator(function*() {
                    const queryResult = matcher.documentMatches(doc);
                    if (queryResult.result) {
                        // XXX Should we save the original even if mod ends up being a no-op?
                        this._saveOriginal(id, doc);
                        recomputeQids = yield this._modifyAndNotifyAsync(doc, mod, queryResult.arrayIndices);
                        ++updateCount;
                        if (!options.multi) {
                            return false; // break
                        }
                    }
                    return true;
                }).call(this));
            Object.keys(recomputeQids).forEach((qid)=>{
                const query = this.queries[qid];
                if (query) {
                    this._recomputeResults(query, qidToOriginalResults[qid]);
                }
            });
            yield this._observeQueue.drain();
            // If we are doing an upsert, and we didn't modify any documents yet, then
            // it's time to do an insert. Figure out what document we are inserting, and
            // generate an id for it.
            let insertedId;
            if (updateCount === 0 && options.upsert) {
                const doc = LocalCollection._createUpsertDocument(selector, mod);
                if (!doc._id && options.insertedId) {
                    doc._id = options.insertedId;
                }
                insertedId = yield this.insertAsync(doc);
                updateCount = 1;
            }
            return this.finishUpdate({
                options,
                insertedId,
                updateCount,
                callback
            });
        }).call(this);
    }
    // XXX atomicity: if multi is true, and one modification fails, do
    // we rollback the whole operation, or what?
    update(selector, mod, options, callback) {
        if (!callback && options instanceof Function) {
            callback = options;
            options = null;
        }
        if (!options) {
            options = {};
        }
        const matcher = new Minimongo.Matcher(selector, true);
        const qidToOriginalResults = this.prepareUpdate(selector);
        let recomputeQids = {};
        let updateCount = 0;
        this._eachPossiblyMatchingDocSync(selector, (doc, id)=>{
            const queryResult = matcher.documentMatches(doc);
            if (queryResult.result) {
                // XXX Should we save the original even if mod ends up being a no-op?
                this._saveOriginal(id, doc);
                recomputeQids = this._modifyAndNotifySync(doc, mod, queryResult.arrayIndices);
                ++updateCount;
                if (!options.multi) {
                    return false; // break
                }
            }
            return true;
        });
        Object.keys(recomputeQids).forEach((qid)=>{
            const query = this.queries[qid];
            if (query) {
                this._recomputeResults(query, qidToOriginalResults[qid]);
            }
        });
        this._observeQueue.drain();
        // If we are doing an upsert, and we didn't modify any documents yet, then
        // it's time to do an insert. Figure out what document we are inserting, and
        // generate an id for it.
        let insertedId;
        if (updateCount === 0 && options.upsert) {
            const doc = LocalCollection._createUpsertDocument(selector, mod);
            if (!doc._id && options.insertedId) {
                doc._id = options.insertedId;
            }
            insertedId = this.insert(doc);
            updateCount = 1;
        }
        return this.finishUpdate({
            options,
            insertedId,
            updateCount,
            callback,
            selector,
            mod
        });
    }
    // A convenience wrapper on update. LocalCollection.upsert(sel, mod) is
    // equivalent to LocalCollection.update(sel, mod, {upsert: true,
    // _returnObject: true}).
    upsert(selector, mod, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }
        return this.update(selector, mod, Object.assign({}, options, {
            upsert: true,
            _returnObject: true
        }), callback);
    }
    upsertAsync(selector, mod, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }
        return this.updateAsync(selector, mod, Object.assign({}, options, {
            upsert: true,
            _returnObject: true
        }), callback);
    }
    // Iterates over a subset of documents that could match selector; calls
    // fn(doc, id) on each of them.  Specifically, if selector specifies
    // specific _id's, it only looks at those.  doc is *not* cloned: it is the
    // same object that is in _docs.
    _eachPossiblyMatchingDocAsync(selector, fn) {
        return _async_to_generator(function*() {
            const specificIds = LocalCollection._idsMatchedBySelector(selector);
            if (specificIds) {
                for (const id of specificIds){
                    const doc = this._docs.get(id);
                    if (doc && !(yield fn(doc, id))) {
                        break;
                    }
                }
            } else {
                yield this._docs.forEachAsync(fn);
            }
        }).call(this);
    }
    _eachPossiblyMatchingDocSync(selector, fn) {
        const specificIds = LocalCollection._idsMatchedBySelector(selector);
        if (specificIds) {
            for (const id of specificIds){
                const doc = this._docs.get(id);
                if (doc && fn(doc, id) === false) {
                    break;
                }
            }
        } else {
            this._docs.forEach(fn);
        }
    }
    _getMatchedDocAndModify(doc, mod, arrayIndices) {
        const matched_before = {};
        Object.keys(this.queries).forEach((qid)=>{
            const query = this.queries[qid];
            if (query.dirty) {
                return;
            }
            if (query.ordered) {
                matched_before[qid] = query.matcher.documentMatches(doc).result;
            } else {
                // Because we don't support skip or limit (yet) in unordered queries, we
                // can just do a direct lookup.
                matched_before[qid] = query.results.has(doc._id);
            }
        });
        return matched_before;
    }
    _modifyAndNotifySync(doc, mod, arrayIndices) {
        const matched_before = this._getMatchedDocAndModify(doc, mod, arrayIndices);
        const old_doc = EJSON.clone(doc);
        LocalCollection._modify(doc, mod, {
            arrayIndices
        });
        const recomputeQids = {};
        for (const qid of Object.keys(this.queries)){
            const query = this.queries[qid];
            if (query.dirty) {
                continue;
            }
            const afterMatch = query.matcher.documentMatches(doc);
            const after = afterMatch.result;
            const before = matched_before[qid];
            if (after && query.distances && afterMatch.distance !== undefined) {
                query.distances.set(doc._id, afterMatch.distance);
            }
            if (query.cursor.skip || query.cursor.limit) {
                // We need to recompute any query where the doc may have been in the
                // cursor's window either before or after the update. (Note that if skip
                // or limit is set, "before" and "after" being true do not necessarily
                // mean that the document is in the cursor's output after skip/limit is
                // applied... but if they are false, then the document definitely is NOT
                // in the output. So it's safe to skip recompute if neither before or
                // after are true.)
                if (before || after) {
                    recomputeQids[qid] = true;
                }
            } else if (before && !after) {
                LocalCollection._removeFromResultsSync(query, doc);
            } else if (!before && after) {
                LocalCollection._insertInResultsSync(query, doc);
            } else if (before && after) {
                LocalCollection._updateInResultsSync(query, doc, old_doc);
            }
        }
        return recomputeQids;
    }
    _modifyAndNotifyAsync(doc, mod, arrayIndices) {
        return _async_to_generator(function*() {
            const matched_before = this._getMatchedDocAndModify(doc, mod, arrayIndices);
            const old_doc = EJSON.clone(doc);
            LocalCollection._modify(doc, mod, {
                arrayIndices
            });
            const recomputeQids = {};
            for(const qid in this.queries){
                const query = this.queries[qid];
                if (query.dirty) {
                    continue;
                }
                const afterMatch = query.matcher.documentMatches(doc);
                const after = afterMatch.result;
                const before = matched_before[qid];
                if (after && query.distances && afterMatch.distance !== undefined) {
                    query.distances.set(doc._id, afterMatch.distance);
                }
                if (query.cursor.skip || query.cursor.limit) {
                    // We need to recompute any query where the doc may have been in the
                    // cursor's window either before or after the update. (Note that if skip
                    // or limit is set, "before" and "after" being true do not necessarily
                    // mean that the document is in the cursor's output after skip/limit is
                    // applied... but if they are false, then the document definitely is NOT
                    // in the output. So it's safe to skip recompute if neither before or
                    // after are true.)
                    if (before || after) {
                        recomputeQids[qid] = true;
                    }
                } else if (before && !after) {
                    yield LocalCollection._removeFromResultsAsync(query, doc);
                } else if (!before && after) {
                    yield LocalCollection._insertInResultsAsync(query, doc);
                } else if (before && after) {
                    yield LocalCollection._updateInResultsAsync(query, doc, old_doc);
                }
            }
            return recomputeQids;
        }).call(this);
    }
    // Recomputes the results of a query and runs observe callbacks for the
    // difference between the previous results and the current results (unless
    // paused). Used for skip/limit queries.
    //
    // When this is used by insert or remove, it can just use query.results for
    // the old results (and there's no need to pass in oldResults), because these
    // operations don't mutate the documents in the collection. Update needs to
    // pass in an oldResults which was deep-copied before the modifier was
    // applied.
    //
    // oldResults is guaranteed to be ignored if the query is not paused.
    _recomputeResults(query, oldResults) {
        if (this.paused) {
            // There's no reason to recompute the results now as we're still paused.
            // By flagging the query as "dirty", the recompute will be performed
            // when resumeObservers is called.
            query.dirty = true;
            return;
        }
        if (!this.paused && !oldResults) {
            oldResults = query.results;
        }
        if (query.distances) {
            query.distances.clear();
        }
        query.results = query.cursor._getRawObjects({
            distances: query.distances,
            ordered: query.ordered
        });
        if (!this.paused) {
            LocalCollection._diffQueryChanges(query.ordered, oldResults, query.results, query, {
                projectionFn: query.projectionFn
            });
        }
    }
    _saveOriginal(id, doc) {
        // Are we even trying to save originals?
        if (!this._savedOriginals) {
            return;
        }
        // Have we previously mutated the original (and so 'doc' is not actually
        // original)?  (Note the 'has' check rather than truth: we store undefined
        // here for inserted docs!)
        if (this._savedOriginals.has(id)) {
            return;
        }
        this._savedOriginals.set(id, EJSON.clone(doc));
    }
    constructor(name){
        this.name = name;
        // _id -> document (also containing id)
        this._docs = new LocalCollection._IdMap;
        this._observeQueue = Meteor.isClient ? new Meteor._SynchronousQueue() : new Meteor._AsynchronousQueue();
        this.next_qid = 1; // live query id generator
        // qid -> live query object. keys:
        //  ordered: bool. ordered queries have addedBefore/movedBefore callbacks.
        //  results: array (ordered) or object (unordered) of current results
        //    (aliased with this._docs!)
        //  resultsSnapshot: snapshot of results. null if not paused.
        //  cursor: Cursor object for the query.
        //  selector, sorter, (callbacks): functions
        this.queries = Object.create(null);
        // null if not saving originals; an IdMap from id to original document value
        // if saving originals. See comments before saveOriginals().
        this._savedOriginals = null;
        // True when observers are paused and we should not send callbacks.
        this.paused = false;
    }
}
// XXX type checking on selectors (graceful error if malformed)
// LocalCollection: a set of documents that supports queries and modifiers.

LocalCollection.Cursor = Cursor;
LocalCollection.ObserveHandle = ObserveHandle;
// XXX maybe move these into another ObserveHelpers package or something
// _CachingChangeObserver is an object which receives observeChanges callbacks
// and keeps a cache of the current cursor state up to date in this.docs. Users
// of this class should read the docs field but not modify it. You should pass
// the "applyChange" field as the callbacks to the underlying observeChanges
// call. Optionally, you can specify your own observeChanges callbacks which are
// invoked immediately before the docs field is updated; this object is made
// available as `this` to those callbacks.
LocalCollection._CachingChangeObserver = class _CachingChangeObserver {
    constructor(options = {}){
        const orderedFromCallbacks = options.callbacks && LocalCollection._observeChangesCallbacksAreOrdered(options.callbacks);
        if (hasOwn.call(options, 'ordered')) {
            this.ordered = options.ordered;
            if (options.callbacks && options.ordered !== orderedFromCallbacks) {
                throw Error('ordered option doesn\'t match callbacks');
            }
        } else if (options.callbacks) {
            this.ordered = orderedFromCallbacks;
        } else {
            throw Error('must provide ordered or callbacks');
        }
        const callbacks = options.callbacks || {};
        if (this.ordered) {
            this.docs = new OrderedDict(MongoID.idStringify);
            this.applyChange = {
                addedBefore: (id, fields, before)=>{
                    // Take a shallow copy since the top-level properties can be changed
                    const doc = _object_spread({}, fields);
                    doc._id = id;
                    if (callbacks.addedBefore) {
                        callbacks.addedBefore.call(this, id, EJSON.clone(fields), before);
                    }
                    // This line triggers if we provide added with movedBefore.
                    if (callbacks.added) {
                        callbacks.added.call(this, id, EJSON.clone(fields));
                    }
                    // XXX could `before` be a falsy ID?  Technically
                    // idStringify seems to allow for them -- though
                    // OrderedDict won't call stringify on a falsy arg.
                    this.docs.putBefore(id, doc, before || null);
                },
                movedBefore: (id, before)=>{
                    if (callbacks.movedBefore) {
                        callbacks.movedBefore.call(this, id, before);
                    }
                    this.docs.moveBefore(id, before || null);
                }
            };
        } else {
            this.docs = new LocalCollection._IdMap;
            this.applyChange = {
                added: (id, fields)=>{
                    // Take a shallow copy since the top-level properties can be changed
                    const doc = _object_spread({}, fields);
                    if (callbacks.added) {
                        callbacks.added.call(this, id, EJSON.clone(fields));
                    }
                    doc._id = id;
                    this.docs.set(id, doc);
                }
            };
        }
        // The methods in _IdMap and OrderedDict used by these callbacks are
        // identical.
        this.applyChange.changed = (id, fields)=>{
            const doc = this.docs.get(id);
            if (!doc) {
                throw new Error(`Unknown id for changed: ${id}`);
            }
            if (callbacks.changed) {
                callbacks.changed.call(this, id, EJSON.clone(fields));
            }
            DiffSequence.applyChanges(doc, fields);
        };
        this.applyChange.removed = (id)=>{
            if (callbacks.removed) {
                callbacks.removed.call(this, id);
            }
            this.docs.remove(id);
        };
    }
};
LocalCollection._IdMap = class _IdMap extends IdMap {
    constructor(){
        super(MongoID.idStringify, MongoID.idParse);
    }
};
// Wrap a transform function to return objects that have the _id field
// of the untransformed document. This ensures that subsystems such as
// the observe-sequence package that call `observe` can keep track of
// the documents identities.
//
// - Require that it returns objects
// - If the return value has an _id field, verify that it matches the
//   original _id field
// - If the return value doesn't have an _id field, add it back.
LocalCollection.wrapTransform = (transform)=>{
    if (!transform) {
        return null;
    }
    // No need to doubly-wrap transforms.
    if (transform.__wrappedTransform__) {
        return transform;
    }
    const wrapped = (doc)=>{
        if (!hasOwn.call(doc, '_id')) {
            // XXX do we ever have a transform on the oplog's collection? because that
            // collection has no _id.
            throw new Error('can only transform documents with _id');
        }
        const id = doc._id;
        // XXX consider making tracker a weak dependency and checking
        // Package.tracker here
        const transformed = Tracker.nonreactive(()=>transform(doc));
        if (!LocalCollection._isPlainObject(transformed)) {
            throw new Error('transform must return object');
        }
        if (hasOwn.call(transformed, '_id')) {
            if (!EJSON.equals(transformed._id, id)) {
                throw new Error('transformed document can\'t have different _id');
            }
        } else {
            transformed._id = id;
        }
        return transformed;
    };
    wrapped.__wrappedTransform__ = true;
    return wrapped;
};
// XXX the sorted-query logic below is laughably inefficient. we'll
// need to come up with a better datastructure for this.
//
// XXX the logic for observing with a skip or a limit is even more
// laughably inefficient. we recompute the whole results every time!
// This binary search puts a value between any equal values, and the first
// lesser value.
LocalCollection._binarySearch = (cmp, array, value)=>{
    let first = 0;
    let range = array.length;
    while(range > 0){
        const halfRange = Math.floor(range / 2);
        if (cmp(value, array[first + halfRange]) >= 0) {
            first += halfRange + 1;
            range -= halfRange + 1;
        } else {
            range = halfRange;
        }
    }
    return first;
};
LocalCollection._checkSupportedProjection = (fields)=>{
    if (fields !== Object(fields) || Array.isArray(fields)) {
        throw MinimongoError('fields option must be an object');
    }
    Object.keys(fields).forEach((keyPath)=>{
        if (keyPath.split('.').includes('$')) {
            throw MinimongoError('Minimongo doesn\'t support $ operator in projections yet.');
        }
        const value = fields[keyPath];
        if (typeof value === 'object' && [
            '$elemMatch',
            '$meta',
            '$slice'
        ].some((key)=>hasOwn.call(value, key))) {
            throw MinimongoError('Minimongo doesn\'t support operators in projections yet.');
        }
        if (![
            1,
            0,
            true,
            false
        ].includes(value)) {
            throw MinimongoError('Projection values should be one of 1, 0, true, or false');
        }
    });
};
// Knows how to compile a fields projection to a predicate function.
// @returns - Function: a closure that filters out an object according to the
//            fields projection rules:
//            @param obj - Object: MongoDB-styled document
//            @returns - Object: a document with the fields filtered out
//                       according to projection rules. Doesn't retain subfields
//                       of passed argument.
LocalCollection._compileProjection = (fields)=>{
    LocalCollection._checkSupportedProjection(fields);
    const _idProjection = fields._id === undefined ? true : fields._id;
    const details = projectionDetails(fields);
    // returns transformed doc according to ruleTree
    const transform = (doc, ruleTree)=>{
        // Special case for "sets"
        if (Array.isArray(doc)) {
            return doc.map((subdoc)=>transform(subdoc, ruleTree));
        }
        const result = details.including ? {} : EJSON.clone(doc);
        Object.keys(ruleTree).forEach((key)=>{
            if (doc == null || !hasOwn.call(doc, key)) {
                return;
            }
            const rule = ruleTree[key];
            if (rule === Object(rule)) {
                // For sub-objects/subsets we branch
                if (doc[key] === Object(doc[key])) {
                    result[key] = transform(doc[key], rule);
                }
            } else if (details.including) {
                // Otherwise we don't even touch this subfield
                result[key] = EJSON.clone(doc[key]);
            } else {
                delete result[key];
            }
        });
        return doc != null ? result : doc;
    };
    return (doc)=>{
        const result = transform(doc, details.tree);
        if (_idProjection && hasOwn.call(doc, '_id')) {
            result._id = doc._id;
        }
        if (!_idProjection && hasOwn.call(result, '_id')) {
            delete result._id;
        }
        return result;
    };
};
// Calculates the document to insert in case we're doing an upsert and the
// selector does not match any elements
LocalCollection._createUpsertDocument = (selector, modifier)=>{
    const selectorDocument = populateDocumentWithQueryFields(selector);
    const isModify = LocalCollection._isModificationMod(modifier);
    const newDoc = {};
    if (selectorDocument._id) {
        newDoc._id = selectorDocument._id;
        delete selectorDocument._id;
    }
    // This double _modify call is made to help with nested properties (see issue
    // #8631). We do this even if it's a replacement for validation purposes (e.g.
    // ambiguous id's)
    LocalCollection._modify(newDoc, {
        $set: selectorDocument
    });
    LocalCollection._modify(newDoc, modifier, {
        isInsert: true
    });
    if (isModify) {
        return newDoc;
    }
    // Replacement can take _id from query document
    const replacement = Object.assign({}, modifier);
    if (newDoc._id) {
        replacement._id = newDoc._id;
    }
    return replacement;
};
LocalCollection._diffObjects = (left, right, callbacks)=>{
    return DiffSequence.diffObjects(left, right, callbacks);
};
// ordered: bool.
// old_results and new_results: collections of documents.
//    if ordered, they are arrays.
//    if unordered, they are IdMaps
LocalCollection._diffQueryChanges = (ordered, oldResults, newResults, observer, options)=>DiffSequence.diffQueryChanges(ordered, oldResults, newResults, observer, options);
LocalCollection._diffQueryOrderedChanges = (oldResults, newResults, observer, options)=>DiffSequence.diffQueryOrderedChanges(oldResults, newResults, observer, options);
LocalCollection._diffQueryUnorderedChanges = (oldResults, newResults, observer, options)=>DiffSequence.diffQueryUnorderedChanges(oldResults, newResults, observer, options);
LocalCollection._findInOrderedResults = (query, doc)=>{
    if (!query.ordered) {
        throw new Error('Can\'t call _findInOrderedResults on unordered query');
    }
    for(let i = 0; i < query.results.length; i++){
        if (query.results[i] === doc) {
            return i;
        }
    }
    throw Error('object missing from query');
};
// If this is a selector which explicitly constrains the match by ID to a finite
// number of documents, returns a list of their IDs.  Otherwise returns
// null. Note that the selector may have other restrictions so it may not even
// match those document!  We care about $in and $and since those are generated
// access-controlled update and remove.
LocalCollection._idsMatchedBySelector = (selector)=>{
    // Is the selector just an ID?
    if (LocalCollection._selectorIsId(selector)) {
        return [
            selector
        ];
    }
    if (!selector) {
        return null;
    }
    // Do we have an _id clause?
    if (hasOwn.call(selector, '_id')) {
        // Is the _id clause just an ID?
        if (LocalCollection._selectorIsId(selector._id)) {
            return [
                selector._id
            ];
        }
        // Is the _id clause {_id: {$in: ["x", "y", "z"]}}?
        if (selector._id && Array.isArray(selector._id.$in) && selector._id.$in.length && selector._id.$in.every(LocalCollection._selectorIsId)) {
            return selector._id.$in;
        }
        return null;
    }
    // If this is a top-level $and, and any of the clauses constrain their
    // documents, then the whole selector is constrained by any one clause's
    // constraint. (Well, by their intersection, but that seems unlikely.)
    if (Array.isArray(selector.$and)) {
        for(let i = 0; i < selector.$and.length; ++i){
            const subIds = LocalCollection._idsMatchedBySelector(selector.$and[i]);
            if (subIds) {
                return subIds;
            }
        }
    }
    return null;
};
LocalCollection._insertInResultsSync = (query, doc)=>{
    const fields = EJSON.clone(doc);
    delete fields._id;
    if (query.ordered) {
        if (!query.sorter) {
            query.addedBefore(doc._id, query.projectionFn(fields), null);
            query.results.push(doc);
        } else {
            const i = LocalCollection._insertInSortedList(query.sorter.getComparator({
                distances: query.distances
            }), query.results, doc);
            let next = query.results[i + 1];
            if (next) {
                next = next._id;
            } else {
                next = null;
            }
            query.addedBefore(doc._id, query.projectionFn(fields), next);
        }
        query.added(doc._id, query.projectionFn(fields));
    } else {
        query.added(doc._id, query.projectionFn(fields));
        query.results.set(doc._id, doc);
    }
};
LocalCollection._insertInResultsAsync = (query, doc)=>_async_to_generator(function*() {
        const fields = EJSON.clone(doc);
        delete fields._id;
        if (query.ordered) {
            if (!query.sorter) {
                yield query.addedBefore(doc._id, query.projectionFn(fields), null);
                query.results.push(doc);
            } else {
                const i = LocalCollection._insertInSortedList(query.sorter.getComparator({
                    distances: query.distances
                }), query.results, doc);
                let next = query.results[i + 1];
                if (next) {
                    next = next._id;
                } else {
                    next = null;
                }
                yield query.addedBefore(doc._id, query.projectionFn(fields), next);
            }
            yield query.added(doc._id, query.projectionFn(fields));
        } else {
            yield query.added(doc._id, query.projectionFn(fields));
            query.results.set(doc._id, doc);
        }
    })();
LocalCollection._insertInSortedList = (cmp, array, value)=>{
    if (array.length === 0) {
        array.push(value);
        return 0;
    }
    const i = LocalCollection._binarySearch(cmp, array, value);
    array.splice(i, 0, value);
    return i;
};
LocalCollection._isModificationMod = (mod)=>{
    let isModify = false;
    let isReplace = false;
    Object.keys(mod).forEach((key)=>{
        if (key.substr(0, 1) === '$') {
            isModify = true;
        } else {
            isReplace = true;
        }
    });
    if (isModify && isReplace) {
        throw new Error('Update parameter cannot have both modifier and non-modifier fields.');
    }
    return isModify;
};
// XXX maybe this should be EJSON.isObject, though EJSON doesn't know about
// RegExp
// XXX note that _type(undefined) === 3!!!!
LocalCollection._isPlainObject = (x)=>{
    return x && LocalCollection._f._type(x) === 3;
};
// XXX need a strategy for passing the binding of $ into this
// function, from the compiled selector
//
// maybe just {key.up.to.just.before.dollarsign: array_index}
//
// XXX atomicity: if one modification fails, do we roll back the whole
// change?
//
// options:
//   - isInsert is set when _modify is being called to compute the document to
//     insert as part of an upsert operation. We use this primarily to figure
//     out when to set the fields in $setOnInsert, if present.
LocalCollection._modify = (doc, modifier, options = {})=>{
    if (!LocalCollection._isPlainObject(modifier)) {
        throw MinimongoError('Modifier must be an object');
    }
    // Make sure the caller can't mutate our data structures.
    modifier = EJSON.clone(modifier);
    const isModifier = isOperatorObject(modifier);
    const newDoc = isModifier ? EJSON.clone(doc) : modifier;
    if (isModifier) {
        // apply modifiers to the doc.
        Object.keys(modifier).forEach((operator)=>{
            // Treat $setOnInsert as $set if this is an insert.
            const setOnInsert = options.isInsert && operator === '$setOnInsert';
            const modFunc = MODIFIERS[setOnInsert ? '$set' : operator];
            const operand = modifier[operator];
            if (!modFunc) {
                throw MinimongoError(`Invalid modifier specified ${operator}`);
            }
            Object.keys(operand).forEach((keypath)=>{
                const arg = operand[keypath];
                if (keypath === '') {
                    throw MinimongoError('An empty update path is not valid.');
                }
                const keyparts = keypath.split('.');
                if (!keyparts.every(Boolean)) {
                    throw MinimongoError(`The update path '${keypath}' contains an empty field name, ` + 'which is not allowed.');
                }
                const target = findModTarget(newDoc, keyparts, {
                    arrayIndices: options.arrayIndices,
                    forbidArray: operator === '$rename',
                    noCreate: NO_CREATE_MODIFIERS[operator]
                });
                modFunc(target, keyparts.pop(), arg, keypath, newDoc);
            });
        });
        if (doc._id && !EJSON.equals(doc._id, newDoc._id)) {
            throw MinimongoError(`After applying the update to the document {_id: "${doc._id}", ...},` + ' the (immutable) field \'_id\' was found to have been altered to ' + `_id: "${newDoc._id}"`);
        }
    } else {
        if (doc._id && modifier._id && !EJSON.equals(doc._id, modifier._id)) {
            throw MinimongoError(`The _id field cannot be changed from {_id: "${doc._id}"} to ` + `{_id: "${modifier._id}"}`);
        }
        // replace the whole document
        assertHasValidFieldNames(modifier);
    }
    // move new document into place.
    Object.keys(doc).forEach((key)=>{
        // Note: this used to be for (var key in doc) however, this does not
        // work right in Opera. Deleting from a doc while iterating over it
        // would sometimes cause opera to skip some keys.
        if (key !== '_id') {
            delete doc[key];
        }
    });
    Object.keys(newDoc).forEach((key)=>{
        doc[key] = newDoc[key];
    });
};
LocalCollection._observeFromObserveChanges = (cursor, observeCallbacks)=>{
    const transform = cursor.getTransform() || ((doc)=>doc);
    let suppressed = !!observeCallbacks._suppress_initial;
    let observeChangesCallbacks;
    if (LocalCollection._observeCallbacksAreOrdered(observeCallbacks)) {
        // The "_no_indices" option sets all index arguments to -1 and skips the
        // linear scans required to generate them.  This lets observers that don't
        // need absolute indices benefit from the other features of this API --
        // relative order, transforms, and applyChanges -- without the speed hit.
        const indices = !observeCallbacks._no_indices;
        observeChangesCallbacks = {
            addedBefore (id, fields, before) {
                const check = suppressed || !(observeCallbacks.addedAt || observeCallbacks.added);
                if (check) {
                    return;
                }
                const doc = transform(Object.assign(fields, {
                    _id: id
                }));
                if (observeCallbacks.addedAt) {
                    observeCallbacks.addedAt(doc, indices ? before ? this.docs.indexOf(before) : this.docs.size() : -1, before);
                } else {
                    observeCallbacks.added(doc);
                }
            },
            changed (id, fields) {
                if (!(observeCallbacks.changedAt || observeCallbacks.changed)) {
                    return;
                }
                let doc = EJSON.clone(this.docs.get(id));
                if (!doc) {
                    throw new Error(`Unknown id for changed: ${id}`);
                }
                const oldDoc = transform(EJSON.clone(doc));
                DiffSequence.applyChanges(doc, fields);
                if (observeCallbacks.changedAt) {
                    observeCallbacks.changedAt(transform(doc), oldDoc, indices ? this.docs.indexOf(id) : -1);
                } else {
                    observeCallbacks.changed(transform(doc), oldDoc);
                }
            },
            movedBefore (id, before) {
                if (!observeCallbacks.movedTo) {
                    return;
                }
                const from = indices ? this.docs.indexOf(id) : -1;
                let to = indices ? before ? this.docs.indexOf(before) : this.docs.size() : -1;
                // When not moving backwards, adjust for the fact that removing the
                // document slides everything back one slot.
                if (to > from) {
                    --to;
                }
                observeCallbacks.movedTo(transform(EJSON.clone(this.docs.get(id))), from, to, before || null);
            },
            removed (id) {
                if (!(observeCallbacks.removedAt || observeCallbacks.removed)) {
                    return;
                }
                // technically maybe there should be an EJSON.clone here, but it's about
                // to be removed from this.docs!
                const doc = transform(this.docs.get(id));
                if (observeCallbacks.removedAt) {
                    observeCallbacks.removedAt(doc, indices ? this.docs.indexOf(id) : -1);
                } else {
                    observeCallbacks.removed(doc);
                }
            }
        };
    } else {
        observeChangesCallbacks = {
            added (id, fields) {
                if (!suppressed && observeCallbacks.added) {
                    observeCallbacks.added(transform(Object.assign(fields, {
                        _id: id
                    })));
                }
            },
            changed (id, fields) {
                if (observeCallbacks.changed) {
                    const oldDoc = this.docs.get(id);
                    const doc = EJSON.clone(oldDoc);
                    DiffSequence.applyChanges(doc, fields);
                    observeCallbacks.changed(transform(doc), transform(EJSON.clone(oldDoc)));
                }
            },
            removed (id) {
                if (observeCallbacks.removed) {
                    observeCallbacks.removed(transform(this.docs.get(id)));
                }
            }
        };
    }
    const changeObserver = new LocalCollection._CachingChangeObserver({
        callbacks: observeChangesCallbacks
    });
    // CachingChangeObserver clones all received input on its callbacks
    // So we can mark it as safe to reduce the ejson clones.
    // This is tested by the `mongo-livedata - (extended) scribbling` tests
    changeObserver.applyChange._fromObserve = true;
    const handle = cursor.observeChanges(changeObserver.applyChange, {
        nonMutatingCallbacks: true
    });
    // If needed, re-enable callbacks as soon as the initial batch is ready.
    const setSuppressed = (h)=>{
        var _h_isReadyPromise;
        if (h.isReady) suppressed = false;
        else (_h_isReadyPromise = h.isReadyPromise) === null || _h_isReadyPromise === void 0 ? void 0 : _h_isReadyPromise.then(()=>suppressed = false);
    };
    // When we call cursor.observeChanges() it can be the on from
    // the mongo package (instead of the minimongo one) and it doesn't have isReady and isReadyPromise
    if (Meteor._isPromise(handle)) {
        handle.then(setSuppressed);
    } else {
        setSuppressed(handle);
    }
    return handle;
};
LocalCollection._observeCallbacksAreOrdered = (callbacks)=>{
    if (callbacks.added && callbacks.addedAt) {
        throw new Error('Please specify only one of added() and addedAt()');
    }
    if (callbacks.changed && callbacks.changedAt) {
        throw new Error('Please specify only one of changed() and changedAt()');
    }
    if (callbacks.removed && callbacks.removedAt) {
        throw new Error('Please specify only one of removed() and removedAt()');
    }
    return !!(callbacks.addedAt || callbacks.changedAt || callbacks.movedTo || callbacks.removedAt);
};
LocalCollection._observeChangesCallbacksAreOrdered = (callbacks)=>{
    if (callbacks.added && callbacks.addedBefore) {
        throw new Error('Please specify only one of added() and addedBefore()');
    }
    return !!(callbacks.addedBefore || callbacks.movedBefore);
};
LocalCollection._removeFromResultsSync = (query, doc)=>{
    if (query.ordered) {
        const i = LocalCollection._findInOrderedResults(query, doc);
        query.removed(doc._id);
        query.results.splice(i, 1);
    } else {
        const id = doc._id; // in case callback mutates doc
        query.removed(id);
        query.results.remove(id);
    }
};
LocalCollection._removeFromResultsAsync = (query, doc)=>_async_to_generator(function*() {
        if (query.ordered) {
            const i = LocalCollection._findInOrderedResults(query, doc);
            yield query.removed(doc._id);
            query.results.splice(i, 1);
        } else {
            const id = doc._id; // in case callback mutates doc
            yield query.removed(id);
            query.results.remove(id);
        }
    })();
// Is this selector just shorthand for lookup by _id?
LocalCollection._selectorIsId = (selector)=>typeof selector === 'number' || typeof selector === 'string' || selector instanceof MongoID.ObjectID;
// Is the selector just lookup by _id (shorthand or not)?
LocalCollection._selectorIsIdPerhapsAsObject = (selector)=>LocalCollection._selectorIsId(selector) || LocalCollection._selectorIsId(selector && selector._id) && Object.keys(selector).length === 1;
LocalCollection._updateInResultsSync = (query, doc, old_doc)=>{
    if (!EJSON.equals(doc._id, old_doc._id)) {
        throw new Error('Can\'t change a doc\'s _id while updating');
    }
    const projectionFn = query.projectionFn;
    const changedFields = DiffSequence.makeChangedFields(projectionFn(doc), projectionFn(old_doc));
    if (!query.ordered) {
        if (Object.keys(changedFields).length) {
            query.changed(doc._id, changedFields);
            query.results.set(doc._id, doc);
        }
        return;
    }
    const old_idx = LocalCollection._findInOrderedResults(query, doc);
    if (Object.keys(changedFields).length) {
        query.changed(doc._id, changedFields);
    }
    if (!query.sorter) {
        return;
    }
    // just take it out and put it back in again, and see if the index changes
    query.results.splice(old_idx, 1);
    const new_idx = LocalCollection._insertInSortedList(query.sorter.getComparator({
        distances: query.distances
    }), query.results, doc);
    if (old_idx !== new_idx) {
        let next = query.results[new_idx + 1];
        if (next) {
            next = next._id;
        } else {
            next = null;
        }
        query.movedBefore && query.movedBefore(doc._id, next);
    }
};
LocalCollection._updateInResultsAsync = (query, doc, old_doc)=>_async_to_generator(function*() {
        if (!EJSON.equals(doc._id, old_doc._id)) {
            throw new Error('Can\'t change a doc\'s _id while updating');
        }
        const projectionFn = query.projectionFn;
        const changedFields = DiffSequence.makeChangedFields(projectionFn(doc), projectionFn(old_doc));
        if (!query.ordered) {
            if (Object.keys(changedFields).length) {
                yield query.changed(doc._id, changedFields);
                query.results.set(doc._id, doc);
            }
            return;
        }
        const old_idx = LocalCollection._findInOrderedResults(query, doc);
        if (Object.keys(changedFields).length) {
            yield query.changed(doc._id, changedFields);
        }
        if (!query.sorter) {
            return;
        }
        // just take it out and put it back in again, and see if the index changes
        query.results.splice(old_idx, 1);
        const new_idx = LocalCollection._insertInSortedList(query.sorter.getComparator({
            distances: query.distances
        }), query.results, doc);
        if (old_idx !== new_idx) {
            let next = query.results[new_idx + 1];
            if (next) {
                next = next._id;
            } else {
                next = null;
            }
            query.movedBefore && (yield query.movedBefore(doc._id, next));
        }
    })();
const MODIFIERS = {
    $currentDate (target, field, arg) {
        if (typeof arg === 'object' && hasOwn.call(arg, '$type')) {
            if (arg.$type !== 'date') {
                throw MinimongoError('Minimongo does currently only support the date type in ' + '$currentDate modifiers', {
                    field
                });
            }
        } else if (arg !== true) {
            throw MinimongoError('Invalid $currentDate modifier', {
                field
            });
        }
        target[field] = new Date();
    },
    $inc (target, field, arg) {
        if (typeof arg !== 'number') {
            throw MinimongoError('Modifier $inc allowed for numbers only', {
                field
            });
        }
        if (field in target) {
            if (typeof target[field] !== 'number') {
                throw MinimongoError('Cannot apply $inc modifier to non-number', {
                    field
                });
            }
            target[field] += arg;
        } else {
            target[field] = arg;
        }
    },
    $min (target, field, arg) {
        if (typeof arg !== 'number') {
            throw MinimongoError('Modifier $min allowed for numbers only', {
                field
            });
        }
        if (field in target) {
            if (typeof target[field] !== 'number') {
                throw MinimongoError('Cannot apply $min modifier to non-number', {
                    field
                });
            }
            if (target[field] > arg) {
                target[field] = arg;
            }
        } else {
            target[field] = arg;
        }
    },
    $max (target, field, arg) {
        if (typeof arg !== 'number') {
            throw MinimongoError('Modifier $max allowed for numbers only', {
                field
            });
        }
        if (field in target) {
            if (typeof target[field] !== 'number') {
                throw MinimongoError('Cannot apply $max modifier to non-number', {
                    field
                });
            }
            if (target[field] < arg) {
                target[field] = arg;
            }
        } else {
            target[field] = arg;
        }
    },
    $mul (target, field, arg) {
        if (typeof arg !== 'number') {
            throw MinimongoError('Modifier $mul allowed for numbers only', {
                field
            });
        }
        if (field in target) {
            if (typeof target[field] !== 'number') {
                throw MinimongoError('Cannot apply $mul modifier to non-number', {
                    field
                });
            }
            target[field] *= arg;
        } else {
            target[field] = 0;
        }
    },
    $rename (target, field, arg, keypath, doc) {
        // no idea why mongo has this restriction..
        if (keypath === arg) {
            throw MinimongoError('$rename source must differ from target', {
                field
            });
        }
        if (target === null) {
            throw MinimongoError('$rename source field invalid', {
                field
            });
        }
        if (typeof arg !== 'string') {
            throw MinimongoError('$rename target must be a string', {
                field
            });
        }
        if (arg.includes('\0')) {
            // Null bytes are not allowed in Mongo field names
            // https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names
            throw MinimongoError('The \'to\' field for $rename cannot contain an embedded null byte', {
                field
            });
        }
        if (target === undefined) {
            return;
        }
        const object = target[field];
        delete target[field];
        const keyparts = arg.split('.');
        const target2 = findModTarget(doc, keyparts, {
            forbidArray: true
        });
        if (target2 === null) {
            throw MinimongoError('$rename target field invalid', {
                field
            });
        }
        target2[keyparts.pop()] = object;
    },
    $set (target, field, arg) {
        if (target !== Object(target)) {
            const error = MinimongoError('Cannot set property on non-object field', {
                field
            });
            error.setPropertyError = true;
            throw error;
        }
        if (target === null) {
            const error = MinimongoError('Cannot set property on null', {
                field
            });
            error.setPropertyError = true;
            throw error;
        }
        assertHasValidFieldNames(arg);
        target[field] = arg;
    },
    $setOnInsert (target, field, arg) {
    // converted to `$set` in `_modify`
    },
    $unset (target, field, arg) {
        if (target !== undefined) {
            if (target instanceof Array) {
                if (field in target) {
                    target[field] = null;
                }
            } else {
                delete target[field];
            }
        }
    },
    $push (target, field, arg) {
        if (target[field] === undefined) {
            target[field] = [];
        }
        if (!(target[field] instanceof Array)) {
            throw MinimongoError('Cannot apply $push modifier to non-array', {
                field
            });
        }
        if (!(arg && arg.$each)) {
            // Simple mode: not $each
            assertHasValidFieldNames(arg);
            target[field].push(arg);
            return;
        }
        // Fancy mode: $each (and maybe $slice and $sort and $position)
        const toPush = arg.$each;
        if (!(toPush instanceof Array)) {
            throw MinimongoError('$each must be an array', {
                field
            });
        }
        assertHasValidFieldNames(toPush);
        // Parse $position
        let position = undefined;
        if ('$position' in arg) {
            if (typeof arg.$position !== 'number') {
                throw MinimongoError('$position must be a numeric value', {
                    field
                });
            }
            // XXX should check to make sure integer
            if (arg.$position < 0) {
                throw MinimongoError('$position in $push must be zero or positive', {
                    field
                });
            }
            position = arg.$position;
        }
        // Parse $slice.
        let slice = undefined;
        if ('$slice' in arg) {
            if (typeof arg.$slice !== 'number') {
                throw MinimongoError('$slice must be a numeric value', {
                    field
                });
            }
            // XXX should check to make sure integer
            slice = arg.$slice;
        }
        // Parse $sort.
        let sortFunction = undefined;
        if (arg.$sort) {
            if (slice === undefined) {
                throw MinimongoError('$sort requires $slice to be present', {
                    field
                });
            }
            // XXX this allows us to use a $sort whose value is an array, but that's
            // actually an extension of the Node driver, so it won't work
            // server-side. Could be confusing!
            // XXX is it correct that we don't do geo-stuff here?
            sortFunction = new Minimongo.Sorter(arg.$sort).getComparator();
            toPush.forEach((element)=>{
                if (LocalCollection._f._type(element) !== 3) {
                    throw MinimongoError('$push like modifiers using $sort require all elements to be ' + 'objects', {
                        field
                    });
                }
            });
        }
        // Actually push.
        if (position === undefined) {
            toPush.forEach((element)=>{
                target[field].push(element);
            });
        } else {
            const spliceArguments = [
                position,
                0
            ];
            toPush.forEach((element)=>{
                spliceArguments.push(element);
            });
            target[field].splice(...spliceArguments);
        }
        // Actually sort.
        if (sortFunction) {
            target[field].sort(sortFunction);
        }
        // Actually slice.
        if (slice !== undefined) {
            if (slice === 0) {
                target[field] = []; // differs from Array.slice!
            } else if (slice < 0) {
                target[field] = target[field].slice(slice);
            } else {
                target[field] = target[field].slice(0, slice);
            }
        }
    },
    $pushAll (target, field, arg) {
        if (!(typeof arg === 'object' && arg instanceof Array)) {
            throw MinimongoError('Modifier $pushAll/pullAll allowed for arrays only');
        }
        assertHasValidFieldNames(arg);
        const toPush = target[field];
        if (toPush === undefined) {
            target[field] = arg;
        } else if (!(toPush instanceof Array)) {
            throw MinimongoError('Cannot apply $pushAll modifier to non-array', {
                field
            });
        } else {
            toPush.push(...arg);
        }
    },
    $addToSet (target, field, arg) {
        let isEach = false;
        if (typeof arg === 'object') {
            // check if first key is '$each'
            const keys = Object.keys(arg);
            if (keys[0] === '$each') {
                isEach = true;
            }
        }
        const values = isEach ? arg.$each : [
            arg
        ];
        assertHasValidFieldNames(values);
        const toAdd = target[field];
        if (toAdd === undefined) {
            target[field] = values;
        } else if (!(toAdd instanceof Array)) {
            throw MinimongoError('Cannot apply $addToSet modifier to non-array', {
                field
            });
        } else {
            values.forEach((value)=>{
                if (toAdd.some((element)=>LocalCollection._f._equal(value, element))) {
                    return;
                }
                toAdd.push(value);
            });
        }
    },
    $pop (target, field, arg) {
        if (target === undefined) {
            return;
        }
        const toPop = target[field];
        if (toPop === undefined) {
            return;
        }
        if (!(toPop instanceof Array)) {
            throw MinimongoError('Cannot apply $pop modifier to non-array', {
                field
            });
        }
        if (typeof arg === 'number' && arg < 0) {
            toPop.splice(0, 1);
        } else {
            toPop.pop();
        }
    },
    $pull (target, field, arg) {
        if (target === undefined) {
            return;
        }
        const toPull = target[field];
        if (toPull === undefined) {
            return;
        }
        if (!(toPull instanceof Array)) {
            throw MinimongoError('Cannot apply $pull/pullAll modifier to non-array', {
                field
            });
        }
        let out;
        if (arg != null && typeof arg === 'object' && !(arg instanceof Array)) {
            // XXX would be much nicer to compile this once, rather than
            // for each document we modify.. but usually we're not
            // modifying that many documents, so we'll let it slide for
            // now
            // XXX Minimongo.Matcher isn't up for the job, because we need
            // to permit stuff like {$pull: {a: {$gt: 4}}}.. something
            // like {$gt: 4} is not normally a complete selector.
            // same issue as $elemMatch possibly?
            const matcher = new Minimongo.Matcher(arg);
            out = toPull.filter((element)=>!matcher.documentMatches(element).result);
        } else {
            out = toPull.filter((element)=>!LocalCollection._f._equal(element, arg));
        }
        target[field] = out;
    },
    $pullAll (target, field, arg) {
        if (!(typeof arg === 'object' && arg instanceof Array)) {
            throw MinimongoError('Modifier $pushAll/pullAll allowed for arrays only', {
                field
            });
        }
        if (target === undefined) {
            return;
        }
        const toPull = target[field];
        if (toPull === undefined) {
            return;
        }
        if (!(toPull instanceof Array)) {
            throw MinimongoError('Cannot apply $pull/pullAll modifier to non-array', {
                field
            });
        }
        target[field] = toPull.filter((object)=>!arg.some((element)=>LocalCollection._f._equal(object, element)));
    },
    $bit (target, field, arg) {
        // XXX mongo only supports $bit on integers, and we only support
        // native javascript numbers (doubles) so far, so we can't support $bit
        throw MinimongoError('$bit is not supported', {
            field
        });
    },
    $v () {
    // As discussed in https://github.com/meteor/meteor/issues/9623,
    // the `$v` operator is not needed by Meteor, but problems can occur if
    // it's not at least callable (as of Mongo >= 3.6). It's defined here as
    // a no-op to work around these problems.
    }
};
const NO_CREATE_MODIFIERS = {
    $pop: true,
    $pull: true,
    $pullAll: true,
    $rename: true,
    $unset: true
};
// Make sure field names do not contain Mongo restricted
// characters ('$', '\0') or invalid dot usage (leading/trailing/consecutive '.').
// https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names
const invalidCharMsg = {
    $: 'start with \'$\'',
    '.': 'start or end with \'.\'',
    '..': 'contain consecutive dots',
    '\0': 'contain null bytes'
};
// checks if all field names in an object are valid
function assertHasValidFieldNames(doc) {
    if (doc && typeof doc === 'object') {
        JSON.stringify(doc, (key, value)=>{
            assertIsValidFieldName(key);
            return value;
        });
    }
}
function assertIsValidFieldName(key) {
    let match;
    if (typeof key === 'string' && (match = key.match(/^\$|^\.|\.\.|\.$|^\.$|\0/))) {
        throw MinimongoError(`Key ${key} must not ${invalidCharMsg[match[0]]}`);
    }
}
// for a.b.c.2.d.e, keyparts should be ['a', 'b', 'c', '2', 'd', 'e'],
// and then you would operate on the 'e' property of the returned
// object.
//
// if options.noCreate is falsey, creates intermediate levels of
// structure as necessary, like mkdir -p (and raises an exception if
// that would mean giving a non-numeric property to an array.) if
// options.noCreate is true, return undefined instead.
//
// may modify the last element of keyparts to signal to the caller that it needs
// to use a different value to index into the returned object (for example,
// ['a', '01'] -> ['a', 1]).
//
// if forbidArray is true, return null if the keypath goes through an array.
//
// if options.arrayIndices is set, use its first element for the (first) '$' in
// the path.
function findModTarget(doc, keyparts, options = {}) {
    let usedArrayIndex = false;
    for(let i = 0; i < keyparts.length; i++){
        const last = i === keyparts.length - 1;
        let keypart = keyparts[i];
        if (!isIndexable(doc)) {
            if (options.noCreate) {
                return undefined;
            }
            const error = MinimongoError(`cannot use the part '${keypart}' to traverse ${doc}`);
            error.setPropertyError = true;
            throw error;
        }
        if (doc instanceof Array) {
            if (options.forbidArray) {
                return null;
            }
            if (keypart === '$') {
                if (usedArrayIndex) {
                    throw MinimongoError('Too many positional (i.e. \'$\') elements');
                }
                if (!options.arrayIndices || !options.arrayIndices.length) {
                    throw MinimongoError('The positional operator did not find the match needed from the ' + 'query');
                }
                keypart = options.arrayIndices[0];
                usedArrayIndex = true;
            } else if (isNumericKey(keypart)) {
                keypart = parseInt(keypart);
            } else {
                if (options.noCreate) {
                    return undefined;
                }
                throw MinimongoError(`can't append to array using string field name [${keypart}]`);
            }
            if (last) {
                keyparts[i] = keypart; // handle 'a.01'
            }
            if (options.noCreate && keypart >= doc.length) {
                return undefined;
            }
            while(doc.length < keypart){
                doc.push(null);
            }
            if (!last) {
                if (doc.length === keypart) {
                    doc.push({});
                } else if (typeof doc[keypart] !== 'object') {
                    throw MinimongoError(`can't modify field '${keyparts[i + 1]}' of list value ` + JSON.stringify(doc[keypart]));
                }
            }
        } else {
            assertIsValidFieldName(keypart);
            if (!(keypart in doc)) {
                if (options.noCreate) {
                    return undefined;
                }
                if (!last) {
                    doc[keypart] = {};
                }
            }
        }
        if (last) {
            return doc;
        }
        doc = doc[keypart];
    }
// notreached
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"matcher.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/matcher.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({default:()=>Matcher});let LocalCollection;module.link('./local_collection.js',{default(v){LocalCollection=v}},0);let compileDocumentSelector,hasOwn,nothingMatcher;module.link('./common.js',{compileDocumentSelector(v){compileDocumentSelector=v},hasOwn(v){hasOwn=v},nothingMatcher(v){nothingMatcher=v}},1);var _Package_mongodecimal;


const Decimal = ((_Package_mongodecimal = Package['mongo-decimal']) === null || _Package_mongodecimal === void 0 ? void 0 : _Package_mongodecimal.Decimal) || class DecimalStub {
};
class Matcher {
    documentMatches(doc) {
        if (doc !== Object(doc)) {
            throw Error('documentMatches needs a document');
        }
        return this._docMatcher(doc);
    }
    hasGeoQuery() {
        return this._hasGeoQuery;
    }
    hasWhere() {
        return this._hasWhere;
    }
    isSimple() {
        return this._isSimple;
    }
    // Given a selector, return a function that takes one argument, a
    // document. It returns a result object.
    _compileSelector(selector) {
        // you can pass a literal function instead of a selector
        if (selector instanceof Function) {
            this._isSimple = false;
            this._selector = selector;
            this._recordPathUsed('');
            return (doc)=>({
                    result: !!selector.call(doc)
                });
        }
        // shorthand -- scalar _id
        if (LocalCollection._selectorIsId(selector)) {
            this._selector = {
                _id: selector
            };
            this._recordPathUsed('_id');
            if (this._collator) {
                // When a collator is active, compile {_id: selector} as a regular
                // document selector so string comparison uses the collator.
                return compileDocumentSelector(this._selector, this, {
                    isRoot: true
                });
            }
            return (doc)=>({
                    result: EJSON.equals(doc._id, selector)
                });
        }
        // protect against dangerous selectors.  falsey and {_id: falsey} are both
        // likely programmer error, and not what you want, particularly for
        // destructive operations.
        if (!selector || hasOwn.call(selector, '_id') && !selector._id) {
            this._isSimple = false;
            return nothingMatcher;
        }
        // Top level can't be an array or true or binary.
        if (Array.isArray(selector) || EJSON.isBinary(selector) || typeof selector === 'boolean') {
            throw new Error(`Invalid selector: ${selector}`);
        }
        this._selector = EJSON.clone(selector);
        return compileDocumentSelector(selector, this, {
            isRoot: true
        });
    }
    // Returns a list of key paths the given selector is looking for. It includes
    // the empty string if there is a $where.
    _getPaths() {
        return Object.keys(this._paths);
    }
    _recordPathUsed(path) {
        this._paths[path] = true;
    }
    constructor(selector, isUpdate, collation){
        // A set (object mapping string -> *) of all of the document paths looked
        // at by the selector. Also includes the empty string if it may look at any
        // path (eg, $where).
        this._paths = {};
        // Set to true if compilation finds a $near.
        this._hasGeoQuery = false;
        // Set to true if compilation finds a $where.
        this._hasWhere = false;
        // Set to false if compilation finds anything other than a simple equality
        // or one or more of '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin' used
        // with scalars as operands.
        this._isSimple = true;
        // Set to a dummy document which always matches this Matcher. Or set to null
        // if such document is too hard to find.
        this._matchingDocument = undefined;
        // A clone of the original selector. It may just be a function if the user
        // passed in a function; otherwise is definitely an object (eg, IDs are
        // translated into {_id: ID} first. Used by canBecomeTrueByModifier and
        // Sorter._useWithMatcher.
        this._selector = null;
        // An optional Intl.Collator for locale-aware string comparison (mirrors
        // MongoDB's collation option).
        this._collator = LocalCollection._createCollator(collation);
        this._docMatcher = this._compileSelector(selector);
        // Set to true if selection is done for an update operation
        // Default is false
        // Used for $near array update (issue #3599)
        this._isUpdate = isUpdate;
    }
}
// The minimongo selector compiler!
// Terminology:
//  - a 'selector' is the EJSON object representing a selector
//  - a 'matcher' is its compiled form (whether a full Minimongo.Matcher
//    object or one of the component lambdas that matches parts of it)
//  - a 'result object' is an object with a 'result' field and maybe
//    distance and arrayIndices.
//  - a 'branched value' is an object with a 'value' field and maybe
//    'dontIterate' and 'arrayIndices'.
//  - a 'document' is a top-level object that can be stored in a collection.
//  - a 'lookup function' is a function that takes in a document and returns
//    an array of 'branched values'.
//  - a 'branched matcher' maps from an array of branched values to a result
//    object.
//  - an 'element matcher' maps from a single value to a bool.
// Main entry point.
//   var matcher = new Minimongo.Matcher({a: {$gt: 5}});
//   if (matcher.documentMatches({a: 7})) ...

// helpers used by compiled selector code
LocalCollection._f = {
    // XXX for _all and _in, consider building 'inquery' at compile time..
    _type (v) {
        if (typeof v === 'number') {
            return 1;
        }
        if (typeof v === 'string') {
            return 2;
        }
        if (typeof v === 'boolean') {
            return 8;
        }
        if (Array.isArray(v)) {
            return 4;
        }
        if (v === null) {
            return 10;
        }
        // note that typeof(/x/) === "object"
        if (v instanceof RegExp) {
            return 11;
        }
        if (typeof v === 'function') {
            return 13;
        }
        if (v instanceof Date) {
            return 9;
        }
        if (EJSON.isBinary(v)) {
            return 5;
        }
        if (v instanceof MongoID.ObjectID) {
            return 7;
        }
        if (v instanceof Decimal) {
            return 1;
        }
        // object
        return 3;
    // XXX support some/all of these:
    // 14, symbol
    // 15, javascript code with scope
    // 16, 18: 32-bit/64-bit integer
    // 17, timestamp
    // 255, minkey
    // 127, maxkey
    },
    // deep equality test: use for literal document and array matches
    // When a collator (Intl.Collator) is provided, string equality uses
    // locale-aware comparison instead of strict ===.
    _equal (a, b, collator) {
        if (collator && typeof a === 'string' && typeof b === 'string') {
            return collator.compare(a, b) === 0;
        }
        return EJSON.equals(a, b, {
            keyOrderSensitive: true
        });
    },
    // maps a type code to a value that can be used to sort values of different
    // types
    _typeorder (t) {
        // http://www.mongodb.org/display/DOCS/What+is+the+Compare+Order+for+BSON+Types
        // XXX what is the correct sort position for Javascript code?
        // ('100' in the matrix below)
        // XXX minkey/maxkey
        return [
            -1,
            1,
            2,
            3,
            4,
            5,
            -1,
            6,
            7,
            8,
            0,
            9,
            -1,
            100,
            2,
            100,
            1,
            8,
            1 // 64-bit int
        ][t];
    },
    // compare two values of unknown type according to BSON ordering
    // semantics. (as an extension, consider 'undefined' to be less than
    // any other value.) return negative if a is less, positive if b is
    // less, or 0 if equal
    // When a collator (Intl.Collator) is provided, string comparison uses
    // locale-aware ordering instead of lexicographic <.
    _cmp (a, b, collator) {
        if (a === undefined) {
            return b === undefined ? 0 : -1;
        }
        if (b === undefined) {
            return 1;
        }
        let ta = LocalCollection._f._type(a);
        let tb = LocalCollection._f._type(b);
        const oa = LocalCollection._f._typeorder(ta);
        const ob = LocalCollection._f._typeorder(tb);
        if (oa !== ob) {
            return oa < ob ? -1 : 1;
        }
        // XXX need to implement this if we implement Symbol or integers, or
        // Timestamp
        if (ta !== tb) {
            throw Error('Missing type coercion logic in _cmp');
        }
        if (ta === 7) {
            // Convert to string.
            ta = tb = 2;
            a = a.toHexString();
            b = b.toHexString();
        }
        if (ta === 9) {
            // Convert to millis.
            ta = tb = 1;
            a = isNaN(a) ? 0 : a.getTime();
            b = isNaN(b) ? 0 : b.getTime();
        }
        if (ta === 1) {
            if (a instanceof Decimal) {
                return a.minus(b).toNumber();
            } else {
                return a - b;
            }
        }
        if (tb === 2) {
            if (collator) {
                return collator.compare(a, b);
            }
            return a < b ? -1 : a === b ? 0 : 1;
        }
        if (ta === 3) {
            // this could be much more efficient in the expected case ...
            const toArray = (object)=>{
                const result = [];
                Object.keys(object).forEach((key)=>{
                    result.push(key, object[key]);
                });
                return result;
            };
            return LocalCollection._f._cmp(toArray(a), toArray(b), collator);
        }
        if (ta === 4) {
            for(let i = 0;; i++){
                if (i === a.length) {
                    return i === b.length ? 0 : -1;
                }
                if (i === b.length) {
                    return 1;
                }
                const s = LocalCollection._f._cmp(a[i], b[i], collator);
                if (s !== 0) {
                    return s;
                }
            }
        }
        if (ta === 5) {
            // Surprisingly, a small binary blob is always less than a large one in
            // Mongo.
            if (a.length !== b.length) {
                return a.length - b.length;
            }
            for(let i = 0; i < a.length; i++){
                if (a[i] < b[i]) {
                    return -1;
                }
                if (a[i] > b[i]) {
                    return 1;
                }
            }
            return 0;
        }
        if (ta === 8) {
            if (a) {
                return b ? 0 : 1;
            }
            return b ? -1 : 0;
        }
        if (ta === 10) return 0;
        if (ta === 11) throw Error('Sorting not supported on regular expression'); // XXX
        // 13: javascript code
        // 14: symbol
        // 15: javascript code with scope
        // 16: 32-bit integer
        // 17: timestamp
        // 18: 64-bit integer
        // 255: minkey
        // 127: maxkey
        if (ta === 13) throw Error('Sorting not supported on Javascript code'); // XXX
        throw Error('Unknown type to sort');
    }
};
// Creates an Intl.Collator from a MongoDB-style collation spec.
// MongoDB collation options map to Intl.Collator options as follows:
//   strength 1 (primary)   → sensitivity 'base'   (a = A = á = Á)
//   strength 2 (secondary) → sensitivity 'accent'  (a = A, á ≠ a)
//   strength 3 (tertiary)  → sensitivity 'variant' (a ≠ A, á ≠ a)
//   caseLevel true at strength 1 → sensitivity 'case' (a ≠ A, á = a)
//   numericOrdering        → numeric
//   caseFirst              → caseFirst ('upper'|'lower'|'false')
const STRENGTH_TO_SENSITIVITY = {
    1: 'base',
    2: 'accent'
};
LocalCollection._createCollator = function(collation) {
    if (!collation) {
        return null;
    }
    if (collation instanceof Intl.Collator) {
        return collation;
    }
    if (Meteor.isDevelopment) {
        if (typeof collation !== 'object') {
            throw Error('collation must be an object');
        }
        if (typeof collation.locale !== 'string' || !collation.locale) {
            throw Error('collation.locale must be a non-empty string');
        }
        if (collation.strength != null && (typeof collation.strength !== 'number' || collation.strength < 1 || collation.strength > 5)) {
            throw Error('collation.strength must be an integer between 1 and 5');
        }
        if (collation.strength != null && collation.strength > 3) {
            Meteor._debug('collation.strength values 4 and 5 have no Intl.Collator equivalent ' + 'and are only supported server-side via the MongoDB driver');
        }
    }
    const options = {};
    if (collation.strength != null) {
        if (collation.strength === 1 && collation.caseLevel) {
            options.sensitivity = 'case';
        } else {
            options.sensitivity = STRENGTH_TO_SENSITIVITY[collation.strength] || 'variant';
        }
    }
    if (collation.numericOrdering != null) {
        options.numeric = collation.numericOrdering;
    }
    if (collation.caseFirst != null && collation.caseFirst !== 'off') {
        options.caseFirst = collation.caseFirst;
    }
    return new Intl.Collator(collation.locale, options);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"minimongo_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/minimongo_common.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let LocalCollection_;module.link('./local_collection.js',{default(v){LocalCollection_=v}},0);let Matcher;module.link('./matcher.js',{default(v){Matcher=v}},1);let Sorter;module.link('./sorter.js',{default(v){Sorter=v}},2);


LocalCollection = LocalCollection_;
Minimongo = {
    LocalCollection: LocalCollection_,
    Matcher,
    Sorter
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"observe_handle.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/observe_handle.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({default:()=>ObserveHandle});// ObserveHandle: the return value of a live query.
class ObserveHandle {
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sorter.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/sorter.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({default:()=>Sorter});let ELEMENT_OPERATORS,equalityElementMatcher,expandArraysInBranches,hasOwn,isOperatorObject,makeLookupFunction,regexpElementMatcher;module.link('./common.js',{ELEMENT_OPERATORS(v){ELEMENT_OPERATORS=v},equalityElementMatcher(v){equalityElementMatcher=v},expandArraysInBranches(v){expandArraysInBranches=v},hasOwn(v){hasOwn=v},isOperatorObject(v){isOperatorObject=v},makeLookupFunction(v){makeLookupFunction=v},regexpElementMatcher(v){regexpElementMatcher=v}},0);
class Sorter {
    getComparator(options) {
        // If sort is specified or have no distances, just use the comparator from
        // the source specification (which defaults to "everything is equal".
        // issue #3599
        // https://docs.mongodb.com/manual/reference/operator/query/near/#sort-operation
        // sort effectively overrides $near
        if (this._sortSpecParts.length || !options || !options.distances) {
            return this._getBaseComparator();
        }
        const distances = options.distances;
        // Return a comparator which compares using $near distances.
        return (a, b)=>{
            if (!distances.has(a._id)) {
                throw Error(`Missing distance for ${a._id}`);
            }
            if (!distances.has(b._id)) {
                throw Error(`Missing distance for ${b._id}`);
            }
            return distances.get(a._id) - distances.get(b._id);
        };
    }
    // Takes in two keys: arrays whose lengths match the number of spec
    // parts. Returns negative, 0, or positive based on using the sort spec to
    // compare fields.
    _compareKeys(key1, key2) {
        if (key1.length !== this._sortSpecParts.length || key2.length !== this._sortSpecParts.length) {
            throw Error('Key has wrong length');
        }
        return this._keyComparator(key1, key2);
    }
    // Iterates over each possible "key" from doc (ie, over each branch), calling
    // 'cb' with the key.
    _generateKeysFromDoc(doc, cb) {
        if (this._sortSpecParts.length === 0) {
            throw new Error('can\'t generate keys without a spec');
        }
        const pathFromIndices = (indices)=>`${indices.join(',')},`;
        let knownPaths = null;
        // maps index -> ({'' -> value} or {path -> value})
        const valuesByIndexAndPath = this._sortSpecParts.map((spec)=>{
            // Expand any leaf arrays that we find, and ignore those arrays
            // themselves.  (We never sort based on an array itself.)
            let branches = expandArraysInBranches(spec.lookup(doc), true);
            // If there are no values for a key (eg, key goes to an empty array),
            // pretend we found one undefined value.
            if (!branches.length) {
                branches = [
                    {
                        value: void 0
                    }
                ];
            }
            const element = Object.create(null);
            let usedPaths = false;
            branches.forEach((branch)=>{
                if (!branch.arrayIndices) {
                    // If there are no array indices for a branch, then it must be the
                    // only branch, because the only thing that produces multiple branches
                    // is the use of arrays.
                    if (branches.length > 1) {
                        throw Error('multiple branches but no array used?');
                    }
                    element[''] = branch.value;
                    return;
                }
                usedPaths = true;
                const path = pathFromIndices(branch.arrayIndices);
                if (hasOwn.call(element, path)) {
                    throw Error(`duplicate path: ${path}`);
                }
                element[path] = branch.value;
                // If two sort fields both go into arrays, they have to go into the
                // exact same arrays and we have to find the same paths.  This is
                // roughly the same condition that makes MongoDB throw this strange
                // error message.  eg, the main thing is that if sort spec is {a: 1,
                // b:1} then a and b cannot both be arrays.
                //
                // (In MongoDB it seems to be OK to have {a: 1, 'a.x.y': 1} where 'a'
                // and 'a.x.y' are both arrays, but we don't allow this for now.
                // #NestedArraySort
                // XXX achieve full compatibility here
                if (knownPaths && !hasOwn.call(knownPaths, path)) {
                    throw Error('cannot index parallel arrays');
                }
            });
            if (knownPaths) {
                // Similarly to above, paths must match everywhere, unless this is a
                // non-array field.
                if (!hasOwn.call(element, '') && Object.keys(knownPaths).length !== Object.keys(element).length) {
                    throw Error('cannot index parallel arrays!');
                }
            } else if (usedPaths) {
                knownPaths = {};
                Object.keys(element).forEach((path)=>{
                    knownPaths[path] = true;
                });
            }
            return element;
        });
        if (!knownPaths) {
            // Easy case: no use of arrays.
            const soleKey = valuesByIndexAndPath.map((values)=>{
                if (!hasOwn.call(values, '')) {
                    throw Error('no value in sole key case?');
                }
                return values[''];
            });
            cb(soleKey);
            return;
        }
        Object.keys(knownPaths).forEach((path)=>{
            const key = valuesByIndexAndPath.map((values)=>{
                if (hasOwn.call(values, '')) {
                    return values[''];
                }
                if (!hasOwn.call(values, path)) {
                    throw Error('missing path?');
                }
                return values[path];
            });
            cb(key);
        });
    }
    // Returns a comparator that represents the sort specification (but not
    // including a possible geoquery distance tie-breaker).
    _getBaseComparator() {
        if (this._sortFunction) {
            return this._sortFunction;
        }
        // If we're only sorting on geoquery distance and no specs, just say
        // everything is equal.
        if (!this._sortSpecParts.length) {
            return (doc1, doc2)=>0;
        }
        return (doc1, doc2)=>{
            const key1 = this._getMinKeyFromDoc(doc1);
            const key2 = this._getMinKeyFromDoc(doc2);
            return this._compareKeys(key1, key2);
        };
    }
    // Finds the minimum key from the doc, according to the sort specs.  (We say
    // "minimum" here but this is with respect to the sort spec, so "descending"
    // sort fields mean we're finding the max for that field.)
    //
    // Note that this is NOT "find the minimum value of the first field, the
    // minimum value of the second field, etc"... it's "choose the
    // lexicographically minimum value of the key vector, allowing only keys which
    // you can find along the same paths".  ie, for a doc {a: [{x: 0, y: 5}, {x:
    // 1, y: 3}]} with sort spec {'a.x': 1, 'a.y': 1}, the only keys are [0,5] and
    // [1,3], and the minimum key is [0,5]; notably, [0,3] is NOT a key.
    _getMinKeyFromDoc(doc) {
        let minKey = null;
        this._generateKeysFromDoc(doc, (key)=>{
            if (minKey === null) {
                minKey = key;
                return;
            }
            if (this._compareKeys(key, minKey) < 0) {
                minKey = key;
            }
        });
        return minKey;
    }
    _getPaths() {
        return this._sortSpecParts.map((part)=>part.path);
    }
    // Given an index 'i', returns a comparator that compares two key arrays based
    // on field 'i'.
    _keyFieldComparator(i) {
        const invert = !this._sortSpecParts[i].ascending;
        const collator = this._collator;
        return (key1, key2)=>{
            const compare = LocalCollection._f._cmp(key1[i], key2[i], collator);
            return invert ? -compare : compare;
        };
    }
    constructor(spec, collation){
        this._sortSpecParts = [];
        this._sortFunction = null;
        this._collator = LocalCollection._createCollator(collation);
        const addSpecPart = (path, ascending)=>{
            if (!path) {
                throw Error('sort keys must be non-empty');
            }
            if (path.charAt(0) === '$') {
                throw Error(`unsupported sort key: ${path}`);
            }
            this._sortSpecParts.push({
                ascending,
                lookup: makeLookupFunction(path, {
                    forSort: true
                }),
                path
            });
        };
        if (spec instanceof Array) {
            spec.forEach((element)=>{
                if (typeof element === 'string') {
                    addSpecPart(element, true);
                } else {
                    addSpecPart(element[0], element[1] !== 'desc');
                }
            });
        } else if (typeof spec === 'object') {
            Object.keys(spec).forEach((key)=>{
                addSpecPart(key, spec[key] >= 0);
            });
        } else if (typeof spec === 'function') {
            this._sortFunction = spec;
        } else {
            throw Error(`Bad sort specification: ${JSON.stringify(spec)}`);
        }
        // If a function is specified for sorting, we skip the rest.
        if (this._sortFunction) {
            return;
        }
        // To implement affectedByModifier, we piggy-back on top of Matcher's
        // affectedByModifier code; we create a selector that is affected by the
        // same modifiers as this sort order. This is only implemented on the
        // server.
        if (this.affectedByModifier) {
            const selector = {};
            this._sortSpecParts.forEach((spec)=>{
                selector[spec.path] = 1;
            });
            this._selectorForAffectedByModifier = new Minimongo.Matcher(selector);
        }
        this._keyComparator = composeComparators(this._sortSpecParts.map((spec, i)=>this._keyFieldComparator(i)));
    }
}
// Give a sort spec, which can be in any of these forms:
//   {"key1": 1, "key2": -1}
//   [["key1", "asc"], ["key2", "desc"]]
//   ["key1", ["key2", "desc"]]
//
// (.. with the first form being dependent on the key enumeration
// behavior of your javascript VM, which usually does what you mean in
// this case if the key names don't look like integers ..)
//
// return a function that takes two objects, and returns -1 if the
// first object comes first in order, 1 if the second object comes
// first, or 0 if neither object comes before the other.

// Given an array of comparators
// (functions (a,b)->(negative or positive or zero)), returns a single
// comparator which uses each comparator in order and returns the first
// non-zero value.
function composeComparators(comparatorArray) {
    return (a, b)=>{
        for(let i = 0; i < comparatorArray.length; ++i){
            const compare = comparatorArray[i](a, b);
            if (compare !== 0) {
                return compare;
            }
        }
        return 0;
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      LocalCollection: LocalCollection,
      Minimongo: Minimongo,
      MinimongoTest: MinimongoTest,
      MinimongoError: MinimongoError
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/minimongo/minimongo_server.js"
  ],
  mainModulePath: "/node_modules/meteor/minimongo/minimongo_server.js"
}});

//# sourceURL=meteor://💻app/packages/minimongo.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaW1vbmdvL21pbmltb25nb19zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21pbmltb25nby9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21pbmltb25nby9jb25zdGFudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21pbmltb25nby9jdXJzb3IuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21pbmltb25nby9sb2NhbF9jb2xsZWN0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9taW5pbW9uZ28vbWF0Y2hlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaW1vbmdvL21pbmltb25nb19jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21pbmltb25nby9vYnNlcnZlX2hhbmRsZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWluaW1vbmdvL3NvcnRlci5qcyJdLCJuYW1lcyI6WyJNaW5pbW9uZ28iLCJfcGF0aHNFbGlkaW5nTnVtZXJpY0tleXMiLCJwYXRocyIsIm1hcCIsInBhdGgiLCJzcGxpdCIsImZpbHRlciIsInBhcnQiLCJpc051bWVyaWNLZXkiLCJqb2luIiwiTWF0Y2hlciIsInByb3RvdHlwZSIsImFmZmVjdGVkQnlNb2RpZmllciIsIm1vZGlmaWVyIiwiT2JqZWN0IiwiYXNzaWduIiwiJHNldCIsIiR1bnNldCIsIm1lYW5pbmdmdWxQYXRocyIsIl9nZXRQYXRocyIsIm1vZGlmaWVkUGF0aHMiLCJjb25jYXQiLCJrZXlzIiwic29tZSIsIm1vZCIsIm1lYW5pbmdmdWxQYXRoIiwic2VsIiwiaSIsImoiLCJsZW5ndGgiLCJjYW5CZWNvbWVUcnVlQnlNb2RpZmllciIsImlzU2ltcGxlIiwibW9kaWZpZXJQYXRocyIsInBhdGhIYXNOdW1lcmljS2V5cyIsImV4cGVjdGVkU2NhbGFySXNPYmplY3QiLCJfc2VsZWN0b3IiLCJpc09wZXJhdG9yT2JqZWN0IiwibW9kaWZpZXJQYXRoIiwic3RhcnRzV2l0aCIsIm1hdGNoaW5nRG9jdW1lbnQiLCJFSlNPTiIsImNsb25lIiwiTG9jYWxDb2xsZWN0aW9uIiwiX21vZGlmeSIsImVycm9yIiwibmFtZSIsInNldFByb3BlcnR5RXJyb3IiLCJkb2N1bWVudE1hdGNoZXMiLCJyZXN1bHQiLCJjb21iaW5lSW50b1Byb2plY3Rpb24iLCJwcm9qZWN0aW9uIiwic2VsZWN0b3JQYXRocyIsImluY2x1ZGVzIiwiY29tYmluZUltcG9ydGFudFBhdGhzSW50b1Byb2plY3Rpb24iLCJfbWF0Y2hpbmdEb2N1bWVudCIsInVuZGVmaW5lZCIsImZhbGxiYWNrIiwicGF0aHNUb1RyZWUiLCJ2YWx1ZVNlbGVjdG9yIiwiJGVxIiwiJGluIiwibWF0Y2hlciIsInBsYWNlaG9sZGVyIiwiZmluZCIsIm9ubHlDb250YWluc0tleXMiLCJsb3dlckJvdW5kIiwiSW5maW5pdHkiLCJ1cHBlckJvdW5kIiwiZm9yRWFjaCIsIm9wIiwiaGFzT3duIiwiY2FsbCIsIm1pZGRsZSIsIngiLCJTb3J0ZXIiLCJfc2VsZWN0b3JGb3JBZmZlY3RlZEJ5TW9kaWZpZXIiLCJkZXRhaWxzIiwicHJvamVjdGlvbkRldGFpbHMiLCJ0cmVlIiwibm9kZSIsImZ1bGxQYXRoIiwibWVyZ2VkUHJvamVjdGlvbiIsInRyZWVUb1BhdGhzIiwiaW5jbHVkaW5nIiwibWVyZ2VkRXhjbFByb2plY3Rpb24iLCJnZXRQYXRocyIsInNlbGVjdG9yIiwiX3BhdGhzIiwib2JqIiwiZXZlcnkiLCJrIiwicHJlZml4Iiwia2V5IiwidmFsdWUiLCJoYXNPd25Qcm9wZXJ0eSIsIk1pbmlNb25nb1F1ZXJ5RXJyb3IiLCJFcnJvciIsIkVMRU1FTlRfT1BFUkFUT1JTIiwiJGx0IiwibWFrZUluZXF1YWxpdHkiLCJjbXBWYWx1ZSIsIiRndCIsIiRsdGUiLCIkZ3RlIiwiJG1vZCIsImNvbXBpbGVFbGVtZW50U2VsZWN0b3IiLCJvcGVyYW5kIiwiQXJyYXkiLCJpc0FycmF5IiwiZGl2aXNvciIsInJlbWFpbmRlciIsImNvbGxhdG9yIiwiX2NvbGxhdG9yIiwiZWxlbWVudE1hdGNoZXJzIiwib3B0aW9uIiwiUmVnRXhwIiwicmVnZXhwRWxlbWVudE1hdGNoZXIiLCJlcXVhbGl0eUVsZW1lbnRNYXRjaGVyIiwiJHNpemUiLCJkb250RXhwYW5kTGVhZkFycmF5cyIsIiR0eXBlIiwiZG9udEluY2x1ZGVMZWFmQXJyYXlzIiwib3BlcmFuZEFsaWFzTWFwIiwiX2YiLCJfdHlwZSIsIiRiaXRzQWxsU2V0IiwibWFzayIsImdldE9wZXJhbmRCaXRtYXNrIiwiYml0bWFzayIsImdldFZhbHVlQml0bWFzayIsImJ5dGUiLCIkYml0c0FueVNldCIsIiRiaXRzQWxsQ2xlYXIiLCIkYml0c0FueUNsZWFyIiwiJHJlZ2V4IiwicmVnZXhwIiwiJG9wdGlvbnMiLCJ0ZXN0Iiwic291cmNlIiwiJGVsZW1NYXRjaCIsIl9pc1BsYWluT2JqZWN0IiwiaXNEb2NNYXRjaGVyIiwiTE9HSUNBTF9PUEVSQVRPUlMiLCJyZWR1Y2UiLCJhIiwiYiIsInN1Yk1hdGNoZXIiLCJjb21waWxlRG9jdW1lbnRTZWxlY3RvciIsImluRWxlbU1hdGNoIiwiY29tcGlsZVZhbHVlU2VsZWN0b3IiLCJhcnJheUVsZW1lbnQiLCJhcmciLCJpc0luZGV4YWJsZSIsImRvbnRJdGVyYXRlIiwiJGFuZCIsInN1YlNlbGVjdG9yIiwiYW5kRG9jdW1lbnRNYXRjaGVycyIsImNvbXBpbGVBcnJheU9mRG9jdW1lbnRTZWxlY3RvcnMiLCIkb3IiLCJtYXRjaGVycyIsImRvYyIsImZuIiwiJG5vciIsIiR3aGVyZSIsInNlbGVjdG9yVmFsdWUiLCJfcmVjb3JkUGF0aFVzZWQiLCJfaGFzV2hlcmUiLCJGdW5jdGlvbiIsIiRjb21tZW50IiwiVkFMVUVfT1BFUkFUT1JTIiwiY29udmVydEVsZW1lbnRNYXRjaGVyVG9CcmFuY2hlZE1hdGNoZXIiLCIkbm90IiwiaW52ZXJ0QnJhbmNoZWRNYXRjaGVyIiwiJG5lIiwiJG5pbiIsIiRleGlzdHMiLCJleGlzdHMiLCJldmVyeXRoaW5nTWF0Y2hlciIsIiRtYXhEaXN0YW5jZSIsIiRuZWFyIiwiJGFsbCIsIm5vdGhpbmdNYXRjaGVyIiwiYnJhbmNoZWRNYXRjaGVycyIsImNyaXRlcmlvbiIsImFuZEJyYW5jaGVkTWF0Y2hlcnMiLCJpc1Jvb3QiLCJfaGFzR2VvUXVlcnkiLCJtYXhEaXN0YW5jZSIsInBvaW50IiwiZGlzdGFuY2UiLCIkZ2VvbWV0cnkiLCJ0eXBlIiwiR2VvSlNPTiIsInBvaW50RGlzdGFuY2UiLCJjb29yZGluYXRlcyIsInBvaW50VG9BcnJheSIsImdlb21ldHJ5V2l0aGluUmFkaXVzIiwiZGlzdGFuY2VDb29yZGluYXRlUGFpcnMiLCJicmFuY2hlZFZhbHVlcyIsImV4cGFuZEFycmF5c0luQnJhbmNoZXMiLCJicmFuY2giLCJjdXJEaXN0YW5jZSIsIl9pc1VwZGF0ZSIsImFycmF5SW5kaWNlcyIsImFuZFNvbWVNYXRjaGVycyIsInN1Yk1hdGNoZXJzIiwiZG9jT3JCcmFuY2hlcyIsIm1hdGNoIiwic3ViUmVzdWx0Iiwic2VsZWN0b3JzIiwiZG9jU2VsZWN0b3IiLCJvcHRpb25zIiwiZG9jTWF0Y2hlcnMiLCJzdWJzdHIiLCJfaXNTaW1wbGUiLCJsb29rVXBCeUluZGV4IiwibWFrZUxvb2t1cEZ1bmN0aW9uIiwidmFsdWVNYXRjaGVyIiwiQm9vbGVhbiIsIm9wZXJhdG9yQnJhbmNoZWRNYXRjaGVyIiwiZWxlbWVudE1hdGNoZXIiLCJicmFuY2hlcyIsImV4cGFuZGVkIiwiZWxlbWVudCIsIm1hdGNoZWQiLCJwb2ludEEiLCJwb2ludEIiLCJNYXRoIiwiaHlwb3QiLCJlbGVtZW50U2VsZWN0b3IiLCJfZXF1YWwiLCJkb2NPckJyYW5jaGVkVmFsdWVzIiwic2tpcFRoZUFycmF5cyIsImJyYW5jaGVzT3V0IiwidGhpc0lzQXJyYXkiLCJwdXNoIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwiVWludDhBcnJheSIsIkludDMyQXJyYXkiLCJidWZmZXIiLCJpc0JpbmFyeSIsIkFycmF5QnVmZmVyIiwibWF4IiwidmlldyIsImlzU2FmZUludGVnZXIiLCJVaW50MzJBcnJheSIsIkJZVEVTX1BFUl9FTEVNRU5UIiwiaW5zZXJ0SW50b0RvY3VtZW50IiwiZG9jdW1lbnQiLCJleGlzdGluZ0tleSIsImluZGV4T2YiLCJicmFuY2hlZE1hdGNoZXIiLCJicmFuY2hWYWx1ZXMiLCJzIiwiaW5jb25zaXN0ZW50T0siLCJ0aGVzZUFyZU9wZXJhdG9ycyIsInNlbEtleSIsInRoaXNJc09wZXJhdG9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImNtcFZhbHVlQ29tcGFyYXRvciIsIm9wZXJhbmRUeXBlIiwiX2NtcCIsInBhcnRzIiwiZmlyc3RQYXJ0IiwibG9va3VwUmVzdCIsInNsaWNlIiwiYnVpbGRSZXN1bHQiLCJmaXJzdExldmVsIiwiYXBwZW5kVG9SZXN1bHQiLCJtb3JlIiwiZm9yU29ydCIsImFycmF5SW5kZXgiLCJNaW5pbW9uZ29UZXN0IiwiTWluaW1vbmdvRXJyb3IiLCJtZXNzYWdlIiwiZmllbGQiLCJvcGVyYXRvck1hdGNoZXJzIiwib3BlcmF0b3IiLCJzaW1wbGVSYW5nZSIsInNpbXBsZUVxdWFsaXR5Iiwic2ltcGxlSW5jbHVzaW9uIiwibmV3TGVhZkZuIiwiY29uZmxpY3RGbiIsInJvb3QiLCJwYXRoQXJyYXkiLCJzdWNjZXNzIiwibGFzdEtleSIsInkiLCJwb3B1bGF0ZURvY3VtZW50V2l0aEtleVZhbHVlIiwiZ2V0UHJvdG90eXBlT2YiLCJwb3B1bGF0ZURvY3VtZW50V2l0aE9iamVjdCIsInVucHJlZml4ZWRLZXlzIiwidmFsaWRhdGVPYmplY3QiLCJvYmplY3QiLCJwb3B1bGF0ZURvY3VtZW50V2l0aFF1ZXJ5RmllbGRzIiwicXVlcnkiLCJfc2VsZWN0b3JJc0lkIiwiZmllbGRzIiwiZmllbGRzS2V5cyIsInNvcnQiLCJfaWQiLCJrZXlQYXRoIiwicnVsZSIsInByb2plY3Rpb25SdWxlc1RyZWUiLCJjdXJyZW50UGF0aCIsImFub3RoZXJQYXRoIiwidG9TdHJpbmciLCJsYXN0SW5kZXgiLCJ2YWxpZGF0ZUtleUluUGF0aCIsImdldEFzeW5jTWV0aG9kTmFtZSIsIm1ldGhvZCIsInJlcGxhY2UiLCJBU1lOQ19DT0xMRUNUSU9OX01FVEhPRFMiLCJBU1lOQ19DVVJTT1JfTUVUSE9EUyIsIkNMSUVOVF9PTkxZX01FVEhPRFMiLCJDdXJzb3IiLCJjb3VudCIsInJlYWN0aXZlIiwiX2RlcGVuZCIsImFkZGVkIiwicmVtb3ZlZCIsIl9nZXRSYXdPYmplY3RzIiwib3JkZXJlZCIsImZldGNoIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJhZGRlZEJlZm9yZSIsImNoYW5nZWQiLCJtb3ZlZEJlZm9yZSIsImluZGV4Iiwib2JqZWN0cyIsIm5leHQiLCJfcHJvamVjdGlvbkZuIiwiX3RyYW5zZm9ybSIsImRvbmUiLCJhc3luY0l0ZXJhdG9yIiwic3luY1Jlc3VsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwiY2FsbGJhY2siLCJ0aGlzQXJnIiwiZm9yRWFjaEFzeW5jIiwiZ2V0VHJhbnNmb3JtIiwibWFwQXN5bmMiLCJvYnNlcnZlIiwiX29ic2VydmVGcm9tT2JzZXJ2ZUNoYW5nZXMiLCJvYnNlcnZlQXN5bmMiLCJvYnNlcnZlQ2hhbmdlcyIsIl9vYnNlcnZlQ2hhbmdlc0NhbGxiYWNrc0FyZU9yZGVyZWQiLCJfYWxsb3dfdW5vcmRlcmVkIiwic2tpcCIsImxpbWl0IiwiZGlzdGFuY2VzIiwiaGFzR2VvUXVlcnkiLCJfSWRNYXAiLCJjdXJzb3IiLCJkaXJ0eSIsInByb2plY3Rpb25GbiIsInJlc3VsdHNTbmFwc2hvdCIsInNvcnRlciIsInFpZCIsImNvbGxlY3Rpb24iLCJuZXh0X3FpZCIsInF1ZXJpZXMiLCJyZXN1bHRzIiwicGF1c2VkIiwid3JhcENhbGxiYWNrIiwic2VsZiIsImFyZ3MiLCJhcmd1bWVudHMiLCJfb2JzZXJ2ZVF1ZXVlIiwicXVldWVUYXNrIiwiYXBwbHkiLCJfc3VwcHJlc3NfaW5pdGlhbCIsImhhbmRsZXIiLCJzaXplIiwiaGFuZGxlIiwiT2JzZXJ2ZUhhbmRsZSIsInN0b3AiLCJpc1JlYWR5IiwiaXNSZWFkeVByb21pc2UiLCJUcmFja2VyIiwiYWN0aXZlIiwib25JbnZhbGlkYXRlIiwiZHJhaW5SZXN1bHQiLCJkcmFpbiIsInRoZW4iLCJvYnNlcnZlQ2hhbmdlc0FzeW5jIiwiY2hhbmdlcnMiLCJkZXBlbmRlbmN5IiwiRGVwZW5kZW5jeSIsIm5vdGlmeSIsImJpbmQiLCJkZXBlbmQiLCJfZ2V0Q29sbGVjdGlvbk5hbWUiLCJhcHBseVNraXBMaW1pdCIsIl9zZWxlY3RvcklkIiwic2VsZWN0ZWREb2MiLCJfZG9jcyIsImdldCIsInNldCIsImNsZWFyIiwiTWV0ZW9yIiwiX3J1bkZyZXNoIiwiaWQiLCJtYXRjaFJlc3VsdCIsImdldENvbXBhcmF0b3IiLCJfcHVibGlzaEN1cnNvciIsInN1YnNjcmlwdGlvbiIsIlBhY2thZ2UiLCJtb25nbyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9jcmVhdGVDb2xsYXRvciIsImNvbGxhdGlvbiIsIl9zZWxlY3RvcklzSWRQZXJoYXBzQXNPYmplY3QiLCJfY29tcGlsZVByb2plY3Rpb24iLCJ3cmFwVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYXN5bmNOYW1lIiwicmVqZWN0IiwiY291bnREb2N1bWVudHMiLCJjb3VudEFzeW5jIiwiZXN0aW1hdGVkRG9jdW1lbnRDb3VudCIsImZpbmRPbmUiLCJmaW5kT25lQXN5bmMiLCJmZXRjaEFzeW5jIiwicHJlcGFyZUluc2VydCIsImFzc2VydEhhc1ZhbGlkRmllbGROYW1lcyIsIl91c2VPSUQiLCJNb25nb0lEIiwiT2JqZWN0SUQiLCJSYW5kb20iLCJoYXMiLCJfc2F2ZU9yaWdpbmFsIiwiaW5zZXJ0IiwicXVlcmllc1RvUmVjb21wdXRlIiwiX2luc2VydEluUmVzdWx0c1N5bmMiLCJfcmVjb21wdXRlUmVzdWx0cyIsImRlZmVyIiwiaW5zZXJ0QXN5bmMiLCJfaW5zZXJ0SW5SZXN1bHRzQXN5bmMiLCJwYXVzZU9ic2VydmVycyIsImNsZWFyUmVzdWx0UXVlcmllcyIsInByZXBhcmVSZW1vdmUiLCJyZW1vdmUiLCJfZWFjaFBvc3NpYmx5TWF0Y2hpbmdEb2NTeW5jIiwicXVlcnlSZW1vdmUiLCJyZW1vdmVJZCIsInJlbW92ZURvYyIsIl9zYXZlZE9yaWdpbmFscyIsImVxdWFscyIsIl9yZW1vdmVGcm9tUmVzdWx0c1N5bmMiLCJyZW1vdmVBc3luYyIsIl9yZW1vdmVGcm9tUmVzdWx0c0FzeW5jIiwiX3Jlc3VtZU9ic2VydmVycyIsIl9kaWZmUXVlcnlDaGFuZ2VzIiwicmVzdW1lT2JzZXJ2ZXJzU2VydmVyIiwicmVzdW1lT2JzZXJ2ZXJzQ2xpZW50IiwicmV0cmlldmVPcmlnaW5hbHMiLCJvcmlnaW5hbHMiLCJzYXZlT3JpZ2luYWxzIiwicHJlcGFyZVVwZGF0ZSIsInFpZFRvT3JpZ2luYWxSZXN1bHRzIiwiZG9jTWFwIiwiaWRzTWF0Y2hlZCIsIl9pZHNNYXRjaGVkQnlTZWxlY3RvciIsIm1lbW9pemVkQ2xvbmVJZk5lZWRlZCIsImRvY1RvTWVtb2l6ZSIsImZpbmlzaFVwZGF0ZSIsInVwZGF0ZUNvdW50IiwiaW5zZXJ0ZWRJZCIsIl9yZXR1cm5PYmplY3QiLCJudW1iZXJBZmZlY3RlZCIsInVwZGF0ZUFzeW5jIiwicmVjb21wdXRlUWlkcyIsIl9lYWNoUG9zc2libHlNYXRjaGluZ0RvY0FzeW5jIiwicXVlcnlSZXN1bHQiLCJfbW9kaWZ5QW5kTm90aWZ5QXN5bmMiLCJtdWx0aSIsInVwc2VydCIsIl9jcmVhdGVVcHNlcnREb2N1bWVudCIsInVwZGF0ZSIsIl9tb2RpZnlBbmROb3RpZnlTeW5jIiwidXBzZXJ0QXN5bmMiLCJzcGVjaWZpY0lkcyIsIl9nZXRNYXRjaGVkRG9jQW5kTW9kaWZ5IiwibWF0Y2hlZF9iZWZvcmUiLCJvbGRfZG9jIiwiYWZ0ZXJNYXRjaCIsImFmdGVyIiwiYmVmb3JlIiwiX3VwZGF0ZUluUmVzdWx0c1N5bmMiLCJfdXBkYXRlSW5SZXN1bHRzQXN5bmMiLCJvbGRSZXN1bHRzIiwiaXNDbGllbnQiLCJfU3luY2hyb25vdXNRdWV1ZSIsIl9Bc3luY2hyb25vdXNRdWV1ZSIsImNyZWF0ZSIsIl9DYWNoaW5nQ2hhbmdlT2JzZXJ2ZXIiLCJvcmRlcmVkRnJvbUNhbGxiYWNrcyIsImNhbGxiYWNrcyIsImRvY3MiLCJPcmRlcmVkRGljdCIsImlkU3RyaW5naWZ5IiwiYXBwbHlDaGFuZ2UiLCJwdXRCZWZvcmUiLCJtb3ZlQmVmb3JlIiwiRGlmZlNlcXVlbmNlIiwiYXBwbHlDaGFuZ2VzIiwiSWRNYXAiLCJpZFBhcnNlIiwiX193cmFwcGVkVHJhbnNmb3JtX18iLCJ3cmFwcGVkIiwidHJhbnNmb3JtZWQiLCJub25yZWFjdGl2ZSIsIl9iaW5hcnlTZWFyY2giLCJjbXAiLCJhcnJheSIsImZpcnN0IiwicmFuZ2UiLCJoYWxmUmFuZ2UiLCJmbG9vciIsIl9jaGVja1N1cHBvcnRlZFByb2plY3Rpb24iLCJfaWRQcm9qZWN0aW9uIiwicnVsZVRyZWUiLCJzdWJkb2MiLCJzZWxlY3RvckRvY3VtZW50IiwiaXNNb2RpZnkiLCJfaXNNb2RpZmljYXRpb25Nb2QiLCJuZXdEb2MiLCJpc0luc2VydCIsInJlcGxhY2VtZW50IiwiX2RpZmZPYmplY3RzIiwibGVmdCIsInJpZ2h0IiwiZGlmZk9iamVjdHMiLCJuZXdSZXN1bHRzIiwib2JzZXJ2ZXIiLCJkaWZmUXVlcnlDaGFuZ2VzIiwiX2RpZmZRdWVyeU9yZGVyZWRDaGFuZ2VzIiwiZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXMiLCJfZGlmZlF1ZXJ5VW5vcmRlcmVkQ2hhbmdlcyIsImRpZmZRdWVyeVVub3JkZXJlZENoYW5nZXMiLCJfZmluZEluT3JkZXJlZFJlc3VsdHMiLCJzdWJJZHMiLCJfaW5zZXJ0SW5Tb3J0ZWRMaXN0Iiwic3BsaWNlIiwiaXNSZXBsYWNlIiwiaXNNb2RpZmllciIsInNldE9uSW5zZXJ0IiwibW9kRnVuYyIsIk1PRElGSUVSUyIsImtleXBhdGgiLCJrZXlwYXJ0cyIsInRhcmdldCIsImZpbmRNb2RUYXJnZXQiLCJmb3JiaWRBcnJheSIsIm5vQ3JlYXRlIiwiTk9fQ1JFQVRFX01PRElGSUVSUyIsInBvcCIsIm9ic2VydmVDYWxsYmFja3MiLCJzdXBwcmVzc2VkIiwib2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3MiLCJfb2JzZXJ2ZUNhbGxiYWNrc0FyZU9yZGVyZWQiLCJpbmRpY2VzIiwiX25vX2luZGljZXMiLCJjaGVjayIsImFkZGVkQXQiLCJjaGFuZ2VkQXQiLCJvbGREb2MiLCJtb3ZlZFRvIiwiZnJvbSIsInRvIiwicmVtb3ZlZEF0IiwiY2hhbmdlT2JzZXJ2ZXIiLCJfZnJvbU9ic2VydmUiLCJub25NdXRhdGluZ0NhbGxiYWNrcyIsInNldFN1cHByZXNzZWQiLCJoIiwiX2lzUHJvbWlzZSIsImNoYW5nZWRGaWVsZHMiLCJtYWtlQ2hhbmdlZEZpZWxkcyIsIm9sZF9pZHgiLCJuZXdfaWR4IiwiJGN1cnJlbnREYXRlIiwiRGF0ZSIsIiRpbmMiLCIkbWluIiwiJG1heCIsIiRtdWwiLCIkcmVuYW1lIiwidGFyZ2V0MiIsIiRzZXRPbkluc2VydCIsIiRwdXNoIiwiJGVhY2giLCJ0b1B1c2giLCJwb3NpdGlvbiIsIiRwb3NpdGlvbiIsIiRzbGljZSIsInNvcnRGdW5jdGlvbiIsIiRzb3J0Iiwic3BsaWNlQXJndW1lbnRzIiwiJHB1c2hBbGwiLCIkYWRkVG9TZXQiLCJpc0VhY2giLCJ2YWx1ZXMiLCJ0b0FkZCIsIiRwb3AiLCJ0b1BvcCIsIiRwdWxsIiwidG9QdWxsIiwib3V0IiwiJHB1bGxBbGwiLCIkYml0IiwiJHYiLCJpbnZhbGlkQ2hhck1zZyIsIiQiLCJhc3NlcnRJc1ZhbGlkRmllbGROYW1lIiwidXNlZEFycmF5SW5kZXgiLCJsYXN0Iiwia2V5cGFydCIsInBhcnNlSW50IiwiRGVjaW1hbCIsIkRlY2ltYWxTdHViIiwiX2RvY01hdGNoZXIiLCJoYXNXaGVyZSIsIl9jb21waWxlU2VsZWN0b3IiLCJpc1VwZGF0ZSIsInYiLCJjb21wYXJlIiwia2V5T3JkZXJTZW5zaXRpdmUiLCJfdHlwZW9yZGVyIiwidCIsInRhIiwidGIiLCJvYSIsIm9iIiwidG9IZXhTdHJpbmciLCJpc05hTiIsImdldFRpbWUiLCJtaW51cyIsInRvTnVtYmVyIiwidG9BcnJheSIsIlNUUkVOR1RIX1RPX1NFTlNJVElWSVRZIiwiSW50bCIsIkNvbGxhdG9yIiwiaXNEZXZlbG9wbWVudCIsImxvY2FsZSIsInN0cmVuZ3RoIiwiX2RlYnVnIiwiY2FzZUxldmVsIiwic2Vuc2l0aXZpdHkiLCJudW1lcmljT3JkZXJpbmciLCJudW1lcmljIiwiY2FzZUZpcnN0IiwiTG9jYWxDb2xsZWN0aW9uXyIsIl9zb3J0U3BlY1BhcnRzIiwiX2dldEJhc2VDb21wYXJhdG9yIiwiX2NvbXBhcmVLZXlzIiwia2V5MSIsImtleTIiLCJfa2V5Q29tcGFyYXRvciIsIl9nZW5lcmF0ZUtleXNGcm9tRG9jIiwiY2IiLCJwYXRoRnJvbUluZGljZXMiLCJrbm93blBhdGhzIiwidmFsdWVzQnlJbmRleEFuZFBhdGgiLCJzcGVjIiwibG9va3VwIiwidXNlZFBhdGhzIiwic29sZUtleSIsIl9zb3J0RnVuY3Rpb24iLCJkb2MxIiwiZG9jMiIsIl9nZXRNaW5LZXlGcm9tRG9jIiwibWluS2V5IiwiX2tleUZpZWxkQ29tcGFyYXRvciIsImludmVydCIsImFzY2VuZGluZyIsImFkZFNwZWNQYXJ0IiwiY2hhckF0IiwiY29tcG9zZUNvbXBhcmF0b3JzIiwiY29tcGFyYXRvckFycmF5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLHdCQUF3QjtBQU9WO0FBRXJCQSxVQUFVQyx3QkFBd0IsR0FBR0MsU0FBU0EsTUFBTUMsR0FBRyxDQUFDQyxRQUN0REEsS0FBS0MsS0FBSyxDQUFDLEtBQUtDLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxhQUFhRCxPQUFPRSxJQUFJLENBQUM7QUFHM0QsOEVBQThFO0FBQzlFLHVDQUF1QztBQUN2Qyw4Q0FBOEM7QUFDOUMsVUFBVTtBQUNWLHlCQUF5QjtBQUN6QixxQkFBcUI7QUFDckIsWUFBWTtBQUNaLGtCQUFrQjtBQUNsQlQsVUFBVVUsT0FBTyxDQUFDQyxTQUFTLENBQUNDLGtCQUFr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QUFZLEdBQUc7Z0JBQ2pCLE9BQU9BO1lBQ1Q7UUFDRjtRQUVBLE9BQU87SUFDVDtBQUNGIiwiZmlsZSI6Ii9wYWNrYWdlcy9taW5pbW9uZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbWluaW1vbmdvX2NvbW1vbi5qcyc7XG5pbXBvcnQge1xuICBoYXNPd24sXG4gIGlzTnVtZXJpY0tleSxcbiAgaXNPcGVyYXRvck9iamVjdCxcbiAgcGF0aHNUb1RyZWUsXG4gIHByb2plY3Rpb25EZXRhaWxzLFxufSBmcm9tICcuL2NvbW1vbi5qcyc7XG5cbk1pbmltb25nby5fcGF0aHNFbGlkaW5nTnVtZXJpY0tleXMgPSBwYXRocyA9PiBwYXRocy5tYXAocGF0aCA9PlxuICBwYXRoLnNwbGl0KCcuJykuZmlsdGVyKHBhcnQgPT4gIWlzTnVtZXJpY0tleShwYXJ0KSkuam9pbignLicpXG4pO1xuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIG1vZGlmaWVyIGFwcGxpZWQgdG8gc29tZSBkb2N1bWVudCBtYXkgY2hhbmdlIHRoZSByZXN1bHRcbi8vIG9mIG1hdGNoaW5nIHRoZSBkb2N1bWVudCBieSBzZWxlY3RvclxuLy8gVGhlIG1vZGlmaWVyIGlzIGFsd2F5cyBpbiBhIGZvcm0gb2YgT2JqZWN0OlxuLy8gIC0gJHNldFxuLy8gICAgLSAnYS5iLjIyLnonOiB2YWx1ZVxuLy8gICAgLSAnZm9vLmJhcic6IDQyXG4vLyAgLSAkdW5zZXRcbi8vICAgIC0gJ2FiYy5kJzogMVxuTWluaW1vbmdvLk1hdGNoZXIucHJvdG90eXBlLmFmZmVjdGVkQnlNb2RpZmllciA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gIC8vIHNhZmUgY2hlY2sgZm9yICRzZXQvJHVuc2V0IGJlaW5nIG9iamVjdHNcbiAgbW9kaWZpZXIgPSBPYmplY3QuYXNzaWduKHskc2V0OiB7fSwgJHVuc2V0OiB7fX0sIG1vZGlmaWVyKTtcblxuICBjb25zdCBtZWFuaW5nZnVsUGF0aHMgPSB0aGlzLl9nZXRQYXRocygpO1xuICBjb25zdCBtb2RpZmllZFBhdGhzID0gW10uY29uY2F0KFxuICAgIE9iamVjdC5rZXlzKG1vZGlmaWVyLiRzZXQpLFxuICAgIE9iamVjdC5rZXlzKG1vZGlmaWVyLiR1bnNldClcbiAgKTtcblxuICByZXR1cm4gbW9kaWZpZWRQYXRocy5zb21lKHBhdGggPT4ge1xuICAgIGNvbnN0IG1vZCA9IHBhdGguc3BsaXQoJy4nKTtcblxuICAgIHJldHVybiBtZWFuaW5nZnVsUGF0aHMuc29tZShtZWFuaW5nZnVsUGF0aCA9PiB7XG4gICAgICBjb25zdCBzZWwgPSBtZWFuaW5nZnVsUGF0aC5zcGxpdCgnLicpO1xuXG4gICAgICBsZXQgaSA9IDAsIGogPSAwO1xuXG4gICAgICB3aGlsZSAoaSA8IHNlbC5sZW5ndGggJiYgaiA8IG1vZC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGlzTnVtZXJpY0tleShzZWxbaV0pICYmIGlzTnVtZXJpY0tleShtb2Rbal0pKSB7XG4gICAgICAgICAgLy8gZm9vLjQuYmFyIHNlbGVjdG9yIGFmZmVjdGVkIGJ5IGZvby40IG1vZGlmaWVyXG4gICAgICAgICAgLy8gZm9vLjMuYmFyIHNlbGVjdG9yIHVuYWZmZWN0ZWQgYnkgZm9vLjQgbW9kaWZpZXJcbiAgICAgICAgICBpZiAoc2VsW2ldID09PSBtb2Rbal0pIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc051bWVyaWNLZXkoc2VsW2ldKSkge1xuICAgICAgICAgIC8vIGZvby40LmJhciBzZWxlY3RvciB1bmFmZmVjdGVkIGJ5IGZvby5iYXIgbW9kaWZpZXJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljS2V5KG1vZFtqXSkpIHtcbiAgICAgICAgICBqKys7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsW2ldID09PSBtb2Rbal0pIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgaisrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBPbmUgaXMgYSBwcmVmaXggb2YgYW5vdGhlciwgdGFraW5nIG51bWVyaWMgZmllbGRzIGludG8gYWNjb3VudFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gQHBhcmFtIG1vZGlmaWVyIC0gT2JqZWN0OiBNb25nb0RCLXN0eWxlZCBtb2RpZmllciB3aXRoIGAkc2V0YHMgYW5kIGAkdW5zZXRzYFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICBvbmx5LiAoYXNzdW1lZCB0byBjb21lIGZyb20gb3Bsb2cpXG4vLyBAcmV0dXJucyAtIEJvb2xlYW46IGlmIGFmdGVyIGFwcGx5aW5nIHRoZSBtb2RpZmllciwgc2VsZWN0b3IgY2FuIHN0YXJ0XG4vLyAgICAgICAgICAgICAgICAgICAgIGFjY2VwdGluZyB0aGUgbW9kaWZpZWQgdmFsdWUuXG4vLyBOT1RFOiBhc3N1bWVzIHRoYXQgZG9jdW1lbnQgYWZmZWN0ZWQgYnkgbW9kaWZpZXIgZGlkbid0IG1hdGNoIHRoaXMgTWF0Y2hlclxuLy8gYmVmb3JlLCBzbyBpZiBtb2RpZmllciBjYW4ndCBjb252aW5jZSBzZWxlY3RvciBpbiBhIHBvc2l0aXZlIGNoYW5nZSBpdCB3b3VsZFxuLy8gc3RheSAnZmFsc2UnLlxuLy8gQ3VycmVudGx5IGRvZXNuJ3Qgc3VwcG9ydCAkLW9wZXJhdG9ycyBhbmQgbnVtZXJpYyBpbmRpY2VzIHByZWNpc2VseS5cbk1pbmltb25nby5NYXRjaGVyLnByb3RvdHlwZS5jYW5CZWNvbWVUcnVlQnlNb2RpZmllciA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gIGlmICghdGhpcy5hZmZlY3RlZEJ5TW9kaWZpZXIobW9kaWZpZXIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF0aGlzLmlzU2ltcGxlKCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG1vZGlmaWVyID0gT2JqZWN0LmFzc2lnbih7JHNldDoge30sICR1bnNldDoge319LCBtb2RpZmllcik7XG5cbiAgY29uc3QgbW9kaWZpZXJQYXRocyA9IFtdLmNvbmNhdChcbiAgICBPYmplY3Qua2V5cyhtb2RpZmllci4kc2V0KSxcbiAgICBPYmplY3Qua2V5cyhtb2RpZmllci4kdW5zZXQpXG4gICk7XG5cbiAgaWYgKHRoaXMuX2dldFBhdGhzKCkuc29tZShwYXRoSGFzTnVtZXJpY0tleXMpIHx8XG4gICAgICBtb2RpZmllclBhdGhzLnNvbWUocGF0aEhhc051bWVyaWNLZXlzKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYSAkc2V0IG9yICR1bnNldCB0aGF0IGluZGljYXRlcyBzb21ldGhpbmcgaXMgYW5cbiAgLy8gb2JqZWN0IHJhdGhlciB0aGFuIGEgc2NhbGFyIGluIHRoZSBhY3R1YWwgb2JqZWN0IHdoZXJlIHdlIHNhdyAkLW9wZXJhdG9yXG4gIC8vIE5PVEU6IGl0IGlzIGNvcnJlY3Qgc2luY2Ugd2UgYWxsb3cgb25seSBzY2FsYXJzIGluICQtb3BlcmF0b3JzXG4gIC8vIEV4YW1wbGU6IGZvciBzZWxlY3RvciB7J2EuYic6IHskZ3Q6IDV9fSB0aGUgbW9kaWZpZXIgeydhLmIuYyc6N30gd291bGRcbiAgLy8gZGVmaW5pdGVseSBzZXQgdGhlIHJlc3VsdCB0byBmYWxzZSBhcyAnYS5iJyBhcHBlYXJzIHRvIGJlIGFuIG9iamVjdC5cbiAgY29uc3QgZXhwZWN0ZWRTY2FsYXJJc09iamVjdCA9IE9iamVjdC5rZXlzKHRoaXMuX3NlbGVjdG9yKS5zb21lKHBhdGggPT4ge1xuICAgIGlmICghaXNPcGVyYXRvck9iamVjdCh0aGlzLl9zZWxlY3RvcltwYXRoXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9kaWZpZXJQYXRocy5zb21lKG1vZGlmaWVyUGF0aCA9PlxuICAgICAgbW9kaWZpZXJQYXRoLnN0YXJ0c1dpdGgoYCR7cGF0aH0uYClcbiAgICApO1xuICB9KTtcblxuICBpZiAoZXhwZWN0ZWRTY2FsYXJJc09iamVjdCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFNlZSBpZiB3ZSBjYW4gYXBwbHkgdGhlIG1vZGlmaWVyIG9uIHRoZSBpZGVhbGx5IG1hdGNoaW5nIG9iamVjdC4gSWYgaXRcbiAgLy8gc3RpbGwgbWF0Y2hlcyB0aGUgc2VsZWN0b3IsIHRoZW4gdGhlIG1vZGlmaWVyIGNvdWxkIGhhdmUgdHVybmVkIHRoZSByZWFsXG4gIC8vIG9iamVjdCBpbiB0aGUgZGF0YWJhc2UgaW50byBzb21ldGhpbmcgbWF0Y2hpbmcuXG4gIGNvbnN0IG1hdGNoaW5nRG9jdW1lbnQgPSBFSlNPTi5jbG9uZSh0aGlzLm1hdGNoaW5nRG9jdW1lbnQoKSk7XG5cbiAgLy8gVGhlIHNlbGVjdG9yIGlzIHRvbyBjb21wbGV4LCBhbnl0aGluZyBjYW4gaGFwcGVuLlxuICBpZiAobWF0Y2hpbmdEb2N1bWVudCA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBMb2NhbENvbGxlY3Rpb24uX21vZGlmeShtYXRjaGluZ0RvY3VtZW50LCBtb2RpZmllcik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gQ291bGRuJ3Qgc2V0IGEgcHJvcGVydHkgb24gYSBmaWVsZCB3aGljaCBpcyBhIHNjYWxhciBvciBudWxsIGluIHRoZVxuICAgIC8vIHNlbGVjdG9yLlxuICAgIC8vIEV4YW1wbGU6XG4gICAgLy8gcmVhbCBkb2N1bWVudDogeyAnYS5iJzogMyB9XG4gICAgLy8gc2VsZWN0b3I6IHsgJ2EnOiAxMiB9XG4gICAgLy8gY29udmVydGVkIHNlbGVjdG9yIChpZGVhbCBkb2N1bWVudCk6IHsgJ2EnOiAxMiB9XG4gICAgLy8gbW9kaWZpZXI6IHsgJHNldDogeyAnYS5iJzogNCB9IH1cbiAgICAvLyBXZSBkb24ndCBrbm93IHdoYXQgcmVhbCBkb2N1bWVudCB3YXMgbGlrZSBidXQgZnJvbSB0aGUgZXJyb3IgcmFpc2VkIGJ5XG4gICAgLy8gJHNldCBvbiBhIHNjYWxhciBmaWVsZCB3ZSBjYW4gcmVhc29uIHRoYXQgdGhlIHN0cnVjdHVyZSBvZiByZWFsIGRvY3VtZW50XG4gICAgLy8gaXMgY29tcGxldGVseSBkaWZmZXJlbnQuXG4gICAgaWYgKGVycm9yLm5hbWUgPT09ICdNaW5pbW9uZ29FcnJvcicgJiYgZXJyb3Iuc2V0UHJvcGVydHlFcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9jdW1lbnRNYXRjaGVzKG1hdGNoaW5nRG9jdW1lbnQpLnJlc3VsdDtcbn07XG5cbi8vIEtub3dzIGhvdyB0byBjb21iaW5lIGEgbW9uZ28gc2VsZWN0b3IgYW5kIGEgZmllbGRzIHByb2plY3Rpb24gdG8gYSBuZXcgZmllbGRzXG4vLyBwcm9qZWN0aW9uIHRha2luZyBpbnRvIGFjY291bnQgYWN0aXZlIGZpZWxkcyBmcm9tIHRoZSBwYXNzZWQgc2VsZWN0b3IuXG4vLyBAcmV0dXJucyBPYmplY3QgLSBwcm9qZWN0aW9uIG9iamVjdCAoc2FtZSBhcyBmaWVsZHMgb3B0aW9uIG9mIG1vbmdvIGN1cnNvcilcbk1pbmltb25nby5NYXRjaGVyLnByb3RvdHlwZS5jb21iaW5lSW50b1Byb2plY3Rpb24gPSBmdW5jdGlvbihwcm9qZWN0aW9uKSB7XG4gIGNvbnN0IHNlbGVjdG9yUGF0aHMgPSBNaW5pbW9uZ28uX3BhdGhzRWxpZGluZ051bWVyaWNLZXlzKHRoaXMuX2dldFBhdGhzKCkpO1xuXG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgJHdoZXJlIG9wZXJhdG9yIGluIHRoZSBzZWxlY3RvciAtIHByb2plY3Rpb24gc2hvdWxkIGRlcGVuZFxuICAvLyBvbiBhbGwgZmllbGRzIG9mIHRoZSBkb2N1bWVudC4gZ2V0U2VsZWN0b3JQYXRocyByZXR1cm5zIGEgbGlzdCBvZiBwYXRoc1xuICAvLyBzZWxlY3RvciBkZXBlbmRzIG9uLiBJZiBvbmUgb2YgdGhlIHBhdGhzIGlzICcnIChlbXB0eSBzdHJpbmcpIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgcm9vdCBvciB0aGUgd2hvbGUgZG9jdW1lbnQsIGNvbXBsZXRlIHByb2plY3Rpb24gc2hvdWxkIGJlIHJldHVybmVkLlxuICBpZiAoc2VsZWN0b3JQYXRocy5pbmNsdWRlcygnJykpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICByZXR1cm4gY29tYmluZUltcG9ydGFudFBhdGhzSW50b1Byb2plY3Rpb24oc2VsZWN0b3JQYXRocywgcHJvamVjdGlvbik7XG59O1xuXG4vLyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IHdvdWxkIG1hdGNoIHRoZSBzZWxlY3RvciBpZiBwb3NzaWJsZSBvciBudWxsIGlmIHRoZVxuLy8gc2VsZWN0b3IgaXMgdG9vIGNvbXBsZXggZm9yIHVzIHRvIGFuYWx5emVcbi8vIHsgJ2EuYic6IHsgYW5zOiA0MiB9LCAnZm9vLmJhcic6IG51bGwsICdmb28uYmF6JzogXCJzb21ldGhpbmdcIiB9XG4vLyA9PiB7IGE6IHsgYjogeyBhbnM6IDQyIH0gfSwgZm9vOiB7IGJhcjogbnVsbCwgYmF6OiBcInNvbWV0aGluZ1wiIH0gfVxuTWluaW1vbmdvLk1hdGNoZXIucHJvdG90eXBlLm1hdGNoaW5nRG9jdW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgaWYgaXQgd2FzIGNvbXB1dGVkIGJlZm9yZVxuICBpZiAodGhpcy5fbWF0Y2hpbmdEb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hdGNoaW5nRG9jdW1lbnQ7XG4gIH1cblxuICAvLyBJZiB0aGUgYW5hbHlzaXMgb2YgdGhpcyBzZWxlY3RvciBpcyB0b28gaGFyZCBmb3Igb3VyIGltcGxlbWVudGF0aW9uXG4gIC8vIGZhbGxiYWNrIHRvIFwiWUVTXCJcbiAgbGV0IGZhbGxiYWNrID0gZmFsc2U7XG5cbiAgdGhpcy5fbWF0Y2hpbmdEb2N1bWVudCA9IHBhdGhzVG9UcmVlKFxuICAgIHRoaXMuX2dldFBhdGhzKCksXG4gICAgcGF0aCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZVNlbGVjdG9yID0gdGhpcy5fc2VsZWN0b3JbcGF0aF07XG5cbiAgICAgIGlmIChpc09wZXJhdG9yT2JqZWN0KHZhbHVlU2VsZWN0b3IpKSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgc3RyaWN0IGVxdWFsaXR5LCB0aGVyZSBpcyBhIGdvb2RcbiAgICAgICAgLy8gY2hhbmNlIHdlIGNhbiB1c2Ugb25lIG9mIHRob3NlIGFzIFwibWF0Y2hpbmdcIlxuICAgICAgICAvLyBkdW1teSB2YWx1ZVxuICAgICAgICBpZiAodmFsdWVTZWxlY3Rvci4kZXEpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVTZWxlY3Rvci4kZXE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWVTZWxlY3Rvci4kaW4pIHtcbiAgICAgICAgICBjb25zdCBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHtwbGFjZWhvbGRlcjogdmFsdWVTZWxlY3Rvcn0pO1xuXG4gICAgICAgICAgLy8gUmV0dXJuIGFueXRoaW5nIGZyb20gJGluIHRoYXQgbWF0Y2hlcyB0aGUgd2hvbGUgc2VsZWN0b3IgZm9yIHRoaXNcbiAgICAgICAgICAvLyBwYXRoLiBJZiBub3RoaW5nIG1hdGNoZXMsIHJldHVybnMgYHVuZGVmaW5lZGAgYXMgbm90aGluZyBjYW4gbWFrZVxuICAgICAgICAgIC8vIHRoaXMgc2VsZWN0b3IgaW50byBgdHJ1ZWAuXG4gICAgICAgICAgcmV0dXJuIHZhbHVlU2VsZWN0b3IuJGluLmZpbmQocGxhY2Vob2xkZXIgPT5cbiAgICAgICAgICAgIG1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKHtwbGFjZWhvbGRlcn0pLnJlc3VsdFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob25seUNvbnRhaW5zS2V5cyh2YWx1ZVNlbGVjdG9yLCBbJyRndCcsICckZ3RlJywgJyRsdCcsICckbHRlJ10pKSB7XG4gICAgICAgICAgbGV0IGxvd2VyQm91bmQgPSAtSW5maW5pdHk7XG4gICAgICAgICAgbGV0IHVwcGVyQm91bmQgPSBJbmZpbml0eTtcblxuICAgICAgICAgIFsnJGx0ZScsICckbHQnXS5mb3JFYWNoKG9wID0+IHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbCh2YWx1ZVNlbGVjdG9yLCBvcCkgJiZcbiAgICAgICAgICAgICAgICB2YWx1ZVNlbGVjdG9yW29wXSA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgdXBwZXJCb3VuZCA9IHZhbHVlU2VsZWN0b3Jbb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgWyckZ3RlJywgJyRndCddLmZvckVhY2gob3AgPT4ge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKHZhbHVlU2VsZWN0b3IsIG9wKSAmJlxuICAgICAgICAgICAgICAgIHZhbHVlU2VsZWN0b3Jbb3BdID4gbG93ZXJCb3VuZCkge1xuICAgICAgICAgICAgICBsb3dlckJvdW5kID0gdmFsdWVTZWxlY3RvcltvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25zdCBtaWRkbGUgPSAobG93ZXJCb3VuZCArIHVwcGVyQm91bmQpIC8gMjtcbiAgICAgICAgICBjb25zdCBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHtwbGFjZWhvbGRlcjogdmFsdWVTZWxlY3Rvcn0pO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVyLmRvY3VtZW50TWF0Y2hlcyh7cGxhY2Vob2xkZXI6IG1pZGRsZX0pLnJlc3VsdCAmJlxuICAgICAgICAgICAgICAobWlkZGxlID09PSBsb3dlckJvdW5kIHx8IG1pZGRsZSA9PT0gdXBwZXJCb3VuZCkpIHtcbiAgICAgICAgICAgIGZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbWlkZGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9ubHlDb250YWluc0tleXModmFsdWVTZWxlY3RvciwgWyckbmluJywgJyRuZSddKSkge1xuICAgICAgICAgIC8vIFNpbmNlIHRoaXMuX2lzU2ltcGxlIG1ha2VzIHN1cmUgJG5pbiBhbmQgJG5lIGFyZSBub3QgY29tYmluZWQgd2l0aFxuICAgICAgICAgIC8vIG9iamVjdHMgb3IgYXJyYXlzLCB3ZSBjYW4gY29uZmlkZW50bHkgcmV0dXJuIGFuIGVtcHR5IG9iamVjdCBhcyBpdFxuICAgICAgICAgIC8vIG5ldmVyIG1hdGNoZXMgYW55IHNjYWxhci5cbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBmYWxsYmFjayA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RvcltwYXRoXTtcbiAgICB9LFxuICAgIHggPT4geCk7XG5cbiAgaWYgKGZhbGxiYWNrKSB7XG4gICAgdGhpcy5fbWF0Y2hpbmdEb2N1bWVudCA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fbWF0Y2hpbmdEb2N1bWVudDtcbn07XG5cbi8vIE1pbmltb25nby5Tb3J0ZXIgZ2V0cyBhIHNpbWlsYXIgbWV0aG9kLCB3aGljaCBkZWxlZ2F0ZXMgdG8gYSBNYXRjaGVyIGl0IG1hZGVcbi8vIGZvciB0aGlzIGV4YWN0IHB1cnBvc2UuXG5NaW5pbW9uZ28uU29ydGVyLnByb3RvdHlwZS5hZmZlY3RlZEJ5TW9kaWZpZXIgPSBmdW5jdGlvbihtb2RpZmllcikge1xuICByZXR1cm4gdGhpcy5fc2VsZWN0b3JGb3JBZmZlY3RlZEJ5TW9kaWZpZXIuYWZmZWN0ZWRCeU1vZGlmaWVyKG1vZGlmaWVyKTtcbn07XG5cbk1pbmltb25nby5Tb3J0ZXIucHJvdG90eXBlLmNvbWJpbmVJbnRvUHJvamVjdGlvbiA9IGZ1bmN0aW9uKHByb2plY3Rpb24pIHtcbiAgcmV0dXJuIGNvbWJpbmVJbXBvcnRhbnRQYXRoc0ludG9Qcm9qZWN0aW9uKFxuICAgIE1pbmltb25nby5fcGF0aHNFbGlkaW5nTnVtZXJpY0tleXModGhpcy5fZ2V0UGF0aHMoKSksXG4gICAgcHJvamVjdGlvblxuICApO1xufTtcblxuZnVuY3Rpb24gY29tYmluZUltcG9ydGFudFBhdGhzSW50b1Byb2plY3Rpb24ocGF0aHMsIHByb2plY3Rpb24pIHtcbiAgY29uc3QgZGV0YWlscyA9IHByb2plY3Rpb25EZXRhaWxzKHByb2plY3Rpb24pO1xuXG4gIC8vIG1lcmdlIHRoZSBwYXRocyB0byBpbmNsdWRlXG4gIGNvbnN0IHRyZWUgPSBwYXRoc1RvVHJlZShcbiAgICBwYXRocyxcbiAgICBwYXRoID0+IHRydWUsXG4gICAgKG5vZGUsIHBhdGgsIGZ1bGxQYXRoKSA9PiB0cnVlLFxuICAgIGRldGFpbHMudHJlZVxuICApO1xuICBjb25zdCBtZXJnZWRQcm9qZWN0aW9uID0gdHJlZVRvUGF0aHModHJlZSk7XG5cbiAgaWYgKGRldGFpbHMuaW5jbHVkaW5nKSB7XG4gICAgLy8gYm90aCBzZWxlY3RvciBhbmQgcHJvamVjdGlvbiBhcmUgcG9pbnRpbmcgb24gZmllbGRzIHRvIGluY2x1ZGVcbiAgICAvLyBzbyB3ZSBjYW4ganVzdCByZXR1cm4gdGhlIG1lcmdlZCB0cmVlXG4gICAgcmV0dXJuIG1lcmdlZFByb2plY3Rpb247XG4gIH1cblxuICAvLyBzZWxlY3RvciBpcyBwb2ludGluZyBhdCBmaWVsZHMgdG8gaW5jbHVkZVxuICAvLyBwcm9qZWN0aW9uIGlzIHBvaW50aW5nIGF0IGZpZWxkcyB0byBleGNsdWRlXG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBleGNsdWRlIGltcG9ydGFudCBwYXRoc1xuICBjb25zdCBtZXJnZWRFeGNsUHJvamVjdGlvbiA9IHt9O1xuXG4gIE9iamVjdC5rZXlzKG1lcmdlZFByb2plY3Rpb24pLmZvckVhY2gocGF0aCA9PiB7XG4gICAgaWYgKCFtZXJnZWRQcm9qZWN0aW9uW3BhdGhdKSB7XG4gICAgICBtZXJnZWRFeGNsUHJvamVjdGlvbltwYXRoXSA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG1lcmdlZEV4Y2xQcm9qZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBnZXRQYXRocyhzZWxlY3Rvcikge1xuICByZXR1cm4gT2JqZWN0LmtleXMobmV3IE1pbmltb25nby5NYXRjaGVyKHNlbGVjdG9yKS5fcGF0aHMpO1xuXG4gIC8vIFhYWCByZW1vdmUgaXQ/XG4gIC8vIHJldHVybiBPYmplY3Qua2V5cyhzZWxlY3RvcikubWFwKGsgPT4ge1xuICAvLyAgIC8vIHdlIGRvbid0IGtub3cgaG93IHRvIGhhbmRsZSAkd2hlcmUgYmVjYXVzZSBpdCBjYW4gYmUgYW55dGhpbmdcbiAgLy8gICBpZiAoayA9PT0gJyR3aGVyZScpIHtcbiAgLy8gICAgIHJldHVybiAnJzsgLy8gbWF0Y2hlcyBldmVyeXRoaW5nXG4gIC8vICAgfVxuXG4gIC8vICAgLy8gd2UgYnJhbmNoIGZyb20gJG9yLyRhbmQvJG5vciBvcGVyYXRvclxuICAvLyAgIGlmIChbJyRvcicsICckYW5kJywgJyRub3InXS5pbmNsdWRlcyhrKSkge1xuICAvLyAgICAgcmV0dXJuIHNlbGVjdG9yW2tdLm1hcChnZXRQYXRocyk7XG4gIC8vICAgfVxuXG4gIC8vICAgLy8gdGhlIHZhbHVlIGlzIGEgbGl0ZXJhbCBvciBzb21lIGNvbXBhcmlzb24gb3BlcmF0b3JcbiAgLy8gICByZXR1cm4gaztcbiAgLy8gfSlcbiAgLy8gICAucmVkdWNlKChhLCBiKSA9PiBhLmNvbmNhdChiKSwgW10pXG4gIC8vICAgLmZpbHRlcigoYSwgYiwgYykgPT4gYy5pbmRleE9mKGEpID09PSBiKTtcbn1cblxuLy8gQSBoZWxwZXIgdG8gZW5zdXJlIG9iamVjdCBoYXMgb25seSBjZXJ0YWluIGtleXNcbmZ1bmN0aW9uIG9ubHlDb250YWluc0tleXMob2JqLCBrZXlzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmV2ZXJ5KGsgPT4ga2V5cy5pbmNsdWRlcyhrKSk7XG59XG5cbmZ1bmN0aW9uIHBhdGhIYXNOdW1lcmljS2V5cyhwYXRoKSB7XG4gIHJldHVybiBwYXRoLnNwbGl0KCcuJykuc29tZShpc051bWVyaWNLZXkpO1xufVxuXG4vLyBSZXR1cm5zIGEgc2V0IG9mIGtleSBwYXRocyBzaW1pbGFyIHRvXG4vLyB7ICdmb28uYmFyJzogMSwgJ2EuYi5jJzogMSB9XG5mdW5jdGlvbiB0cmVlVG9QYXRocyh0cmVlLCBwcmVmaXggPSAnJykge1xuICBjb25zdCByZXN1bHQgPSB7fTtcblxuICBPYmplY3Qua2V5cyh0cmVlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSB0cmVlW2tleV07XG4gICAgaWYgKHZhbHVlID09PSBPYmplY3QodmFsdWUpKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgdHJlZVRvUGF0aHModmFsdWUsIGAke3ByZWZpeCArIGtleX0uYCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImltcG9ydCBMb2NhbENvbGxlY3Rpb24gZnJvbSAnLi9sb2NhbF9jb2xsZWN0aW9uLmpzJztcblxuZXhwb3J0IGNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmV4cG9ydCBjbGFzcyBNaW5pTW9uZ29RdWVyeUVycm9yIGV4dGVuZHMgRXJyb3Ige31cbi8vIEVhY2ggZWxlbWVudCBzZWxlY3RvciBjb250YWluczpcbi8vICAtIGNvbXBpbGVFbGVtZW50U2VsZWN0b3IsIGEgZnVuY3Rpb24gd2l0aCBhcmdzOlxuLy8gICAgLSBvcGVyYW5kIC0gdGhlIFwicmlnaHQgaGFuZCBzaWRlXCIgb2YgdGhlIG9wZXJhdG9yXG4vLyAgICAtIHZhbHVlU2VsZWN0b3IgLSB0aGUgXCJjb250ZXh0XCIgZm9yIHRoZSBvcGVyYXRvciAoc28gdGhhdCAkcmVnZXggY2FuIGZpbmRcbi8vICAgICAgJG9wdGlvbnMpXG4vLyAgICAtIG1hdGNoZXIgLSB0aGUgTWF0Y2hlciB0aGlzIGlzIGdvaW5nIGludG8gKHNvIHRoYXQgJGVsZW1NYXRjaCBjYW4gY29tcGlsZVxuLy8gICAgICBtb3JlIHRoaW5ncylcbi8vICAgIHJldHVybmluZyBhIGZ1bmN0aW9uIG1hcHBpbmcgYSBzaW5nbGUgdmFsdWUgdG8gYm9vbC5cbi8vICAtIGRvbnRFeHBhbmRMZWFmQXJyYXlzLCBhIGJvb2wgd2hpY2ggcHJldmVudHMgZXhwYW5kQXJyYXlzSW5CcmFuY2hlcyBmcm9tXG4vLyAgICBiZWluZyBjYWxsZWRcbi8vICAtIGRvbnRJbmNsdWRlTGVhZkFycmF5cywgYSBib29sIHdoaWNoIGNhdXNlcyBhbiBhcmd1bWVudCB0byBiZSBwYXNzZWQgdG9cbi8vICAgIGV4cGFuZEFycmF5c0luQnJhbmNoZXMgaWYgaXQgaXMgY2FsbGVkXG5leHBvcnQgY29uc3QgRUxFTUVOVF9PUEVSQVRPUlMgPSB7XG4gICRsdDogbWFrZUluZXF1YWxpdHkoY21wVmFsdWUgPT4gY21wVmFsdWUgPCAwKSxcbiAgJGd0OiBtYWtlSW5lcXVhbGl0eShjbXBWYWx1ZSA9PiBjbXBWYWx1ZSA+IDApLFxuICAkbHRlOiBtYWtlSW5lcXVhbGl0eShjbXBWYWx1ZSA9PiBjbXBWYWx1ZSA8PSAwKSxcbiAgJGd0ZTogbWFrZUluZXF1YWxpdHkoY21wVmFsdWUgPT4gY21wVmFsdWUgPj0gMCksXG4gICRtb2Q6IHtcbiAgICBjb21waWxlRWxlbWVudFNlbGVjdG9yKG9wZXJhbmQpIHtcbiAgICAgIGlmICghKEFycmF5LmlzQXJyYXkob3BlcmFuZCkgJiYgb3BlcmFuZC5sZW5ndGggPT09IDJcbiAgICAgICAgICAgICYmIHR5cGVvZiBvcGVyYW5kWzBdID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgJiYgdHlwZW9mIG9wZXJhbmRbMV0gPT09ICdudW1iZXInKSkge1xuICAgICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignYXJndW1lbnQgdG8gJG1vZCBtdXN0IGJlIGFuIGFycmF5IG9mIHR3byBudW1iZXJzJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCBjb3VsZCByZXF1aXJlIHRvIGJlIGludHMgb3Igcm91bmQgb3Igc29tZXRoaW5nXG4gICAgICBjb25zdCBkaXZpc29yID0gb3BlcmFuZFswXTtcbiAgICAgIGNvbnN0IHJlbWFpbmRlciA9IG9wZXJhbmRbMV07XG4gICAgICByZXR1cm4gdmFsdWUgPT4gKFxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIHZhbHVlICUgZGl2aXNvciA9PT0gcmVtYWluZGVyXG4gICAgICApO1xuICAgIH0sXG4gIH0sXG4gICRpbjoge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCwgdmFsdWVTZWxlY3RvciwgbWF0Y2hlcikge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wZXJhbmQpKSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckaW4gbmVlZHMgYW4gYXJyYXknKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29sbGF0b3IgPSBtYXRjaGVyICYmIG1hdGNoZXIuX2NvbGxhdG9yO1xuICAgICAgY29uc3QgZWxlbWVudE1hdGNoZXJzID0gb3BlcmFuZC5tYXAob3B0aW9uID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgIHJldHVybiByZWdleHBFbGVtZW50TWF0Y2hlcihvcHRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzT3BlcmF0b3JPYmplY3Qob3B0aW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCdjYW5ub3QgbmVzdCAkIHVuZGVyICRpbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVxdWFsaXR5RWxlbWVudE1hdGNoZXIob3B0aW9uLCBjb2xsYXRvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHZhbHVlID0+IHtcbiAgICAgICAgLy8gQWxsb3cge2E6IHskaW46IFtudWxsXX19IHRvIG1hdGNoIHdoZW4gJ2EnIGRvZXMgbm90IGV4aXN0LlxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbGVtZW50TWF0Y2hlcnMuc29tZShtYXRjaGVyID0+IG1hdGNoZXIodmFsdWUpKTtcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgJHNpemU6IHtcbiAgICAvLyB7YTogW1s1LCA1XV19IG11c3QgbWF0Y2gge2E6IHskc2l6ZTogMX19IGJ1dCBub3Qge2E6IHskc2l6ZTogMn19LCBzbyB3ZVxuICAgIC8vIGRvbid0IHdhbnQgdG8gY29uc2lkZXIgdGhlIGVsZW1lbnQgWzUsNV0gaW4gdGhlIGxlYWYgYXJyYXkgW1s1LDVdXSBhcyBhXG4gICAgLy8gcG9zc2libGUgdmFsdWUuXG4gICAgZG9udEV4cGFuZExlYWZBcnJheXM6IHRydWUsXG4gICAgY29tcGlsZUVsZW1lbnRTZWxlY3RvcihvcGVyYW5kKSB7XG4gICAgICBpZiAodHlwZW9mIG9wZXJhbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIERvbid0IGFzayBtZSB3aHksIGJ1dCBieSBleHBlcmltZW50YXRpb24sIHRoaXMgc2VlbXMgdG8gYmUgd2hhdCBNb25nb1xuICAgICAgICAvLyBkb2VzLlxuICAgICAgICBvcGVyYW5kID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wZXJhbmQgIT09ICdudW1iZXInKSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckc2l6ZSBuZWVkcyBhIG51bWJlcicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWUgPT4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSBvcGVyYW5kO1xuICAgIH0sXG4gIH0sXG4gICR0eXBlOiB7XG4gICAgLy8ge2E6IFs1XX0gbXVzdCBub3QgbWF0Y2gge2E6IHskdHlwZTogNH19ICg0IG1lYW5zIGFycmF5KSwgYnV0IGl0IHNob3VsZFxuICAgIC8vIG1hdGNoIHthOiB7JHR5cGU6IDF9fSAoMSBtZWFucyBudW1iZXIpLCBhbmQge2E6IFtbNV1dfSBtdXN0IG1hdGNoIHskYTpcbiAgICAvLyB7JHR5cGU6IDR9fS4gVGh1cywgd2hlbiB3ZSBzZWUgYSBsZWFmIGFycmF5LCB3ZSAqc2hvdWxkKiBleHBhbmQgaXQgYnV0XG4gICAgLy8gc2hvdWxkICpub3QqIGluY2x1ZGUgaXQgaXRzZWxmLlxuICAgIGRvbnRJbmNsdWRlTGVhZkFycmF5czogdHJ1ZSxcbiAgICBjb21waWxlRWxlbWVudFNlbGVjdG9yKG9wZXJhbmQpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3BlcmFuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3Qgb3BlcmFuZEFsaWFzTWFwID0ge1xuICAgICAgICAgICdkb3VibGUnOiAxLFxuICAgICAgICAgICdzdHJpbmcnOiAyLFxuICAgICAgICAgICdvYmplY3QnOiAzLFxuICAgICAgICAgICdhcnJheSc6IDQsXG4gICAgICAgICAgJ2JpbkRhdGEnOiA1LFxuICAgICAgICAgICd1bmRlZmluZWQnOiA2LFxuICAgICAgICAgICdvYmplY3RJZCc6IDcsXG4gICAgICAgICAgJ2Jvb2wnOiA4LFxuICAgICAgICAgICdkYXRlJzogOSxcbiAgICAgICAgICAnbnVsbCc6IDEwLFxuICAgICAgICAgICdyZWdleCc6IDExLFxuICAgICAgICAgICdkYlBvaW50ZXInOiAxMixcbiAgICAgICAgICAnamF2YXNjcmlwdCc6IDEzLFxuICAgICAgICAgICdzeW1ib2wnOiAxNCxcbiAgICAgICAgICAnamF2YXNjcmlwdFdpdGhTY29wZSc6IDE1LFxuICAgICAgICAgICdpbnQnOiAxNixcbiAgICAgICAgICAndGltZXN0YW1wJzogMTcsXG4gICAgICAgICAgJ2xvbmcnOiAxOCxcbiAgICAgICAgICAnZGVjaW1hbCc6IDE5LFxuICAgICAgICAgICdtaW5LZXknOiAtMSxcbiAgICAgICAgICAnbWF4S2V5JzogMTI3LFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWhhc093bi5jYWxsKG9wZXJhbmRBbGlhc01hcCwgb3BlcmFuZCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcihgdW5rbm93biBzdHJpbmcgYWxpYXMgZm9yICR0eXBlOiAke29wZXJhbmR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgb3BlcmFuZCA9IG9wZXJhbmRBbGlhc01hcFtvcGVyYW5kXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wZXJhbmQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChvcGVyYW5kID09PSAwIHx8IG9wZXJhbmQgPCAtMVxuICAgICAgICAgIHx8IChvcGVyYW5kID4gMTkgJiYgb3BlcmFuZCAhPT0gMTI3KSkge1xuICAgICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKGBJbnZhbGlkIG51bWVyaWNhbCAkdHlwZSBjb2RlOiAke29wZXJhbmR9YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCdhcmd1bWVudCB0byAkdHlwZSBpcyBub3QgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlID0+IChcbiAgICAgICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiBMb2NhbENvbGxlY3Rpb24uX2YuX3R5cGUodmFsdWUpID09PSBvcGVyYW5kXG4gICAgICApO1xuICAgIH0sXG4gIH0sXG4gICRiaXRzQWxsU2V0OiB7XG4gICAgY29tcGlsZUVsZW1lbnRTZWxlY3RvcihvcGVyYW5kKSB7XG4gICAgICBjb25zdCBtYXNrID0gZ2V0T3BlcmFuZEJpdG1hc2sob3BlcmFuZCwgJyRiaXRzQWxsU2V0Jyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT4ge1xuICAgICAgICBjb25zdCBiaXRtYXNrID0gZ2V0VmFsdWVCaXRtYXNrKHZhbHVlLCBtYXNrLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBiaXRtYXNrICYmIG1hc2suZXZlcnkoKGJ5dGUsIGkpID0+IChiaXRtYXNrW2ldICYgYnl0ZSkgPT09IGJ5dGUpO1xuICAgICAgfTtcbiAgICB9LFxuICB9LFxuICAkYml0c0FueVNldDoge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCkge1xuICAgICAgY29uc3QgbWFzayA9IGdldE9wZXJhbmRCaXRtYXNrKG9wZXJhbmQsICckYml0c0FueVNldCcpO1xuICAgICAgcmV0dXJuIHZhbHVlID0+IHtcbiAgICAgICAgY29uc3QgYml0bWFzayA9IGdldFZhbHVlQml0bWFzayh2YWx1ZSwgbWFzay5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gYml0bWFzayAmJiBtYXNrLnNvbWUoKGJ5dGUsIGkpID0+ICh+Yml0bWFza1tpXSAmIGJ5dGUpICE9PSBieXRlKTtcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgJGJpdHNBbGxDbGVhcjoge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCkge1xuICAgICAgY29uc3QgbWFzayA9IGdldE9wZXJhbmRCaXRtYXNrKG9wZXJhbmQsICckYml0c0FsbENsZWFyJyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT4ge1xuICAgICAgICBjb25zdCBiaXRtYXNrID0gZ2V0VmFsdWVCaXRtYXNrKHZhbHVlLCBtYXNrLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBiaXRtYXNrICYmIG1hc2suZXZlcnkoKGJ5dGUsIGkpID0+ICEoYml0bWFza1tpXSAmIGJ5dGUpKTtcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgJGJpdHNBbnlDbGVhcjoge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCkge1xuICAgICAgY29uc3QgbWFzayA9IGdldE9wZXJhbmRCaXRtYXNrKG9wZXJhbmQsICckYml0c0FueUNsZWFyJyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT4ge1xuICAgICAgICBjb25zdCBiaXRtYXNrID0gZ2V0VmFsdWVCaXRtYXNrKHZhbHVlLCBtYXNrLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBiaXRtYXNrICYmIG1hc2suc29tZSgoYnl0ZSwgaSkgPT4gKGJpdG1hc2tbaV0gJiBieXRlKSAhPT0gYnl0ZSk7XG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gICRyZWdleDoge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCwgdmFsdWVTZWxlY3Rvcikge1xuICAgICAgaWYgKCEodHlwZW9mIG9wZXJhbmQgPT09ICdzdHJpbmcnIHx8IG9wZXJhbmQgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckcmVnZXggaGFzIHRvIGJlIGEgc3RyaW5nIG9yIFJlZ0V4cCcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgcmVnZXhwO1xuICAgICAgaWYgKHZhbHVlU2VsZWN0b3IuJG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBPcHRpb25zIHBhc3NlZCBpbiAkb3B0aW9ucyAoZXZlbiB0aGUgZW1wdHkgc3RyaW5nKSBhbHdheXMgb3ZlcnJpZGVzXG4gICAgICAgIC8vIG9wdGlvbnMgaW4gdGhlIFJlZ0V4cCBvYmplY3QgaXRzZWxmLlxuXG4gICAgICAgIC8vIEJlIGNsZWFyIHRoYXQgd2Ugb25seSBzdXBwb3J0IHRoZSBKUy1zdXBwb3J0ZWQgb3B0aW9ucywgbm90IGV4dGVuZGVkXG4gICAgICAgIC8vIG9uZXMgKGVnLCBNb25nbyBzdXBwb3J0cyB4IGFuZCBzKS4gSWRlYWxseSB3ZSB3b3VsZCBpbXBsZW1lbnQgeCBhbmQgc1xuICAgICAgICAvLyBieSB0cmFuc2Zvcm1pbmcgdGhlIHJlZ2V4cCwgYnV0IG5vdCB0b2RheS4uLlxuICAgICAgICBpZiAoL1teZ2ltXS8udGVzdCh2YWx1ZVNlbGVjdG9yLiRvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCdPbmx5IHRoZSBpLCBtLCBhbmQgZyByZWdleHAgb3B0aW9ucyBhcmUgc3VwcG9ydGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzb3VyY2UgPSBvcGVyYW5kIGluc3RhbmNlb2YgUmVnRXhwID8gb3BlcmFuZC5zb3VyY2UgOiBvcGVyYW5kO1xuICAgICAgICByZWdleHAgPSBuZXcgUmVnRXhwKHNvdXJjZSwgdmFsdWVTZWxlY3Rvci4kb3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKG9wZXJhbmQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmVnZXhwID0gb3BlcmFuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4cCA9IG5ldyBSZWdFeHAob3BlcmFuZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWdleHBFbGVtZW50TWF0Y2hlcihyZWdleHApO1xuICAgIH0sXG4gIH0sXG4gICRlbGVtTWF0Y2g6IHtcbiAgICBkb250RXhwYW5kTGVhZkFycmF5czogdHJ1ZSxcbiAgICBjb21waWxlRWxlbWVudFNlbGVjdG9yKG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIpIHtcbiAgICAgIGlmICghTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0KG9wZXJhbmQpKSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckZWxlbU1hdGNoIG5lZWQgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzRG9jTWF0Y2hlciA9ICFpc09wZXJhdG9yT2JqZWN0KFxuICAgICAgICBPYmplY3Qua2V5cyhvcGVyYW5kKVxuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFoYXNPd24uY2FsbChMT0dJQ0FMX09QRVJBVE9SUywga2V5KSlcbiAgICAgICAgICAucmVkdWNlKChhLCBiKSA9PiBPYmplY3QuYXNzaWduKGEsIHtbYl06IG9wZXJhbmRbYl19KSwge30pLFxuICAgICAgICB0cnVlKTtcblxuICAgICAgbGV0IHN1Yk1hdGNoZXI7XG4gICAgICBpZiAoaXNEb2NNYXRjaGVyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgTk9UIHRoZSBzYW1lIGFzIGNvbXBpbGVWYWx1ZVNlbGVjdG9yKG9wZXJhbmQpLCBhbmQgbm90IGp1c3RcbiAgICAgICAgLy8gYmVjYXVzZSBvZiB0aGUgc2xpZ2h0bHkgZGlmZmVyZW50IGNhbGxpbmcgY29udmVudGlvbi5cbiAgICAgICAgLy8geyRlbGVtTWF0Y2g6IHt4OiAzfX0gbWVhbnMgXCJhbiBlbGVtZW50IGhhcyBhIGZpZWxkIHg6M1wiLCBub3RcbiAgICAgICAgLy8gXCJjb25zaXN0cyBvbmx5IG9mIGEgZmllbGQgeDozXCIuIEFsc28sIHJlZ2V4cHMgYW5kIHN1Yi0kIGFyZSBhbGxvd2VkLlxuICAgICAgICBzdWJNYXRjaGVyID1cbiAgICAgICAgICBjb21waWxlRG9jdW1lbnRTZWxlY3RvcihvcGVyYW5kLCBtYXRjaGVyLCB7aW5FbGVtTWF0Y2g6IHRydWV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1Yk1hdGNoZXIgPSBjb21waWxlVmFsdWVTZWxlY3RvcihvcGVyYW5kLCBtYXRjaGVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlID0+IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUVsZW1lbnQgPSB2YWx1ZVtpXTtcbiAgICAgICAgICBsZXQgYXJnO1xuICAgICAgICAgIGlmIChpc0RvY01hdGNoZXIpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbiBvbmx5IG1hdGNoIHskZWxlbU1hdGNoOiB7YjogM319IGFnYWluc3Qgb2JqZWN0cy5cbiAgICAgICAgICAgIC8vIChXZSBjYW4gYWxzbyBtYXRjaCBhZ2FpbnN0IGFycmF5cywgaWYgdGhlcmUncyBudW1lcmljIGluZGljZXMsXG4gICAgICAgICAgICAvLyBlZyB7JGVsZW1NYXRjaDogeycwLmInOiAzfX0gb3IgeyRlbGVtTWF0Y2g6IHswOiAzfX0uKVxuICAgICAgICAgICAgaWYgKCFpc0luZGV4YWJsZShhcnJheUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJnID0gYXJyYXlFbGVtZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBkb250SXRlcmF0ZSBlbnN1cmVzIHRoYXQge2E6IHskZWxlbU1hdGNoOiB7JGd0OiA1fX19IG1hdGNoZXNcbiAgICAgICAgICAgIC8vIHthOiBbOF19IGJ1dCBub3Qge2E6IFtbOF1dfVxuICAgICAgICAgICAgYXJnID0gW3t2YWx1ZTogYXJyYXlFbGVtZW50LCBkb250SXRlcmF0ZTogdHJ1ZX1dO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBYWFggc3VwcG9ydCAkbmVhciBpbiAkZWxlbU1hdGNoIGJ5IHByb3BhZ2F0aW5nICRkaXN0YW5jZT9cbiAgICAgICAgICBpZiAoc3ViTWF0Y2hlcihhcmcpLnJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGk7IC8vIHNwZWNpYWxseSB1bmRlcnN0b29kIHRvIG1lYW4gXCJ1c2UgYXMgYXJyYXlJbmRpY2VzXCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG59O1xuXG4vLyBPcGVyYXRvcnMgdGhhdCBhcHBlYXIgYXQgdGhlIHRvcCBsZXZlbCBvZiBhIGRvY3VtZW50IHNlbGVjdG9yLlxuY29uc3QgTE9HSUNBTF9PUEVSQVRPUlMgPSB7XG4gICRhbmQoc3ViU2VsZWN0b3IsIG1hdGNoZXIsIGluRWxlbU1hdGNoKSB7XG4gICAgcmV0dXJuIGFuZERvY3VtZW50TWF0Y2hlcnMoXG4gICAgICBjb21waWxlQXJyYXlPZkRvY3VtZW50U2VsZWN0b3JzKHN1YlNlbGVjdG9yLCBtYXRjaGVyLCBpbkVsZW1NYXRjaClcbiAgICApO1xuICB9LFxuXG4gICRvcihzdWJTZWxlY3RvciwgbWF0Y2hlciwgaW5FbGVtTWF0Y2gpIHtcbiAgICBjb25zdCBtYXRjaGVycyA9IGNvbXBpbGVBcnJheU9mRG9jdW1lbnRTZWxlY3RvcnMoXG4gICAgICBzdWJTZWxlY3RvcixcbiAgICAgIG1hdGNoZXIsXG4gICAgICBpbkVsZW1NYXRjaFxuICAgICk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2U6IGlmIHRoZXJlIGlzIG9ubHkgb25lIG1hdGNoZXIsIHVzZSBpdCBkaXJlY3RseSwgKnByZXNlcnZpbmcqXG4gICAgLy8gYW55IGFycmF5SW5kaWNlcyBpdCByZXR1cm5zLlxuICAgIGlmIChtYXRjaGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBtYXRjaGVyc1swXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9jID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IG1hdGNoZXJzLnNvbWUoZm4gPT4gZm4oZG9jKS5yZXN1bHQpO1xuICAgICAgLy8gJG9yIGRvZXMgTk9UIHNldCBhcnJheUluZGljZXMgd2hlbiBpdCBoYXMgbXVsdGlwbGVcbiAgICAgIC8vIHN1Yi1leHByZXNzaW9ucy4gKFRlc3RlZCBhZ2FpbnN0IE1vbmdvREIuKVxuICAgICAgcmV0dXJuIHtyZXN1bHR9O1xuICAgIH07XG4gIH0sXG5cbiAgJG5vcihzdWJTZWxlY3RvciwgbWF0Y2hlciwgaW5FbGVtTWF0Y2gpIHtcbiAgICBjb25zdCBtYXRjaGVycyA9IGNvbXBpbGVBcnJheU9mRG9jdW1lbnRTZWxlY3RvcnMoXG4gICAgICBzdWJTZWxlY3RvcixcbiAgICAgIG1hdGNoZXIsXG4gICAgICBpbkVsZW1NYXRjaFxuICAgICk7XG4gICAgcmV0dXJuIGRvYyA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBtYXRjaGVycy5ldmVyeShmbiA9PiAhZm4oZG9jKS5yZXN1bHQpO1xuICAgICAgLy8gTmV2ZXIgc2V0IGFycmF5SW5kaWNlcywgYmVjYXVzZSB3ZSBvbmx5IG1hdGNoIGlmIG5vdGhpbmcgaW4gcGFydGljdWxhclxuICAgICAgLy8gJ21hdGNoZWQnIChhbmQgYmVjYXVzZSB0aGlzIGlzIGNvbnNpc3RlbnQgd2l0aCBNb25nb0RCKS5cbiAgICAgIHJldHVybiB7cmVzdWx0fTtcbiAgICB9O1xuICB9LFxuXG4gICR3aGVyZShzZWxlY3RvclZhbHVlLCBtYXRjaGVyKSB7XG4gICAgLy8gUmVjb3JkIHRoYXQgKmFueSogcGF0aCBtYXkgYmUgdXNlZC5cbiAgICBtYXRjaGVyLl9yZWNvcmRQYXRoVXNlZCgnJyk7XG4gICAgbWF0Y2hlci5faGFzV2hlcmUgPSB0cnVlO1xuXG4gICAgaWYgKCEoc2VsZWN0b3JWYWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgLy8gWFhYIE1vbmdvREIgc2VlbXMgdG8gaGF2ZSBtb3JlIGNvbXBsZXggbG9naWMgdG8gZGVjaWRlIHdoZXJlIG9yIG9yIG5vdFxuICAgICAgLy8gdG8gYWRkICdyZXR1cm4nOyBub3Qgc3VyZSBleGFjdGx5IHdoYXQgaXQgaXMuXG4gICAgICBzZWxlY3RvclZhbHVlID0gRnVuY3Rpb24oJ29iaicsIGByZXR1cm4gJHtzZWxlY3RvclZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFdlIG1ha2UgdGhlIGRvY3VtZW50IGF2YWlsYWJsZSBhcyBib3RoIGB0aGlzYCBhbmQgYG9iamAuXG4gICAgLy8gLy8gWFhYIG5vdCBzdXJlIHdoYXQgd2Ugc2hvdWxkIGRvIGlmIHRoaXMgdGhyb3dzXG4gICAgcmV0dXJuIGRvYyA9PiAoe3Jlc3VsdDogc2VsZWN0b3JWYWx1ZS5jYWxsKGRvYywgZG9jKX0pO1xuICB9LFxuXG4gIC8vIFRoaXMgaXMganVzdCB1c2VkIGFzIGEgY29tbWVudCBpbiB0aGUgcXVlcnkgKGluIE1vbmdvREIsIGl0IGFsc28gZW5kcyB1cCBpblxuICAvLyBxdWVyeSBsb2dzKTsgaXQgaGFzIG5vIGVmZmVjdCBvbiB0aGUgYWN0dWFsIHNlbGVjdGlvbi5cbiAgJGNvbW1lbnQoKSB7XG4gICAgcmV0dXJuICgpID0+ICh7cmVzdWx0OiB0cnVlfSk7XG4gIH0sXG59O1xuXG4vLyBPcGVyYXRvcnMgdGhhdCAodW5saWtlIExPR0lDQUxfT1BFUkFUT1JTKSBwZXJ0YWluIHRvIGluZGl2aWR1YWwgcGF0aHMgaW4gYVxuLy8gZG9jdW1lbnQsIGJ1dCAodW5saWtlIEVMRU1FTlRfT1BFUkFUT1JTKSBkbyBub3QgaGF2ZSBhIHNpbXBsZSBkZWZpbml0aW9uIGFzXG4vLyBcIm1hdGNoIGVhY2ggYnJhbmNoZWQgdmFsdWUgaW5kZXBlbmRlbnRseSBhbmQgY29tYmluZSB3aXRoXG4vLyBjb252ZXJ0RWxlbWVudE1hdGNoZXJUb0JyYW5jaGVkTWF0Y2hlclwiLlxuY29uc3QgVkFMVUVfT1BFUkFUT1JTID0ge1xuICAkZXEob3BlcmFuZCwgdmFsdWVTZWxlY3RvciwgbWF0Y2hlcikge1xuICAgIHJldHVybiBjb252ZXJ0RWxlbWVudE1hdGNoZXJUb0JyYW5jaGVkTWF0Y2hlcihcbiAgICAgIGVxdWFsaXR5RWxlbWVudE1hdGNoZXIob3BlcmFuZCwgbWF0Y2hlciAmJiBtYXRjaGVyLl9jb2xsYXRvcilcbiAgICApO1xuICB9LFxuICAkbm90KG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIpIHtcbiAgICByZXR1cm4gaW52ZXJ0QnJhbmNoZWRNYXRjaGVyKGNvbXBpbGVWYWx1ZVNlbGVjdG9yKG9wZXJhbmQsIG1hdGNoZXIpKTtcbiAgfSxcbiAgJG5lKG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIpIHtcbiAgICByZXR1cm4gaW52ZXJ0QnJhbmNoZWRNYXRjaGVyKFxuICAgICAgY29udmVydEVsZW1lbnRNYXRjaGVyVG9CcmFuY2hlZE1hdGNoZXIoXG4gICAgICAgIGVxdWFsaXR5RWxlbWVudE1hdGNoZXIob3BlcmFuZCwgbWF0Y2hlciAmJiBtYXRjaGVyLl9jb2xsYXRvcilcbiAgICAgIClcbiAgICApO1xuICB9LFxuICAkbmluKG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIpIHtcbiAgICByZXR1cm4gaW52ZXJ0QnJhbmNoZWRNYXRjaGVyKFxuICAgICAgY29udmVydEVsZW1lbnRNYXRjaGVyVG9CcmFuY2hlZE1hdGNoZXIoXG4gICAgICAgIEVMRU1FTlRfT1BFUkFUT1JTLiRpbi5jb21waWxlRWxlbWVudFNlbGVjdG9yKG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIpXG4gICAgICApXG4gICAgKTtcbiAgfSxcbiAgJGV4aXN0cyhvcGVyYW5kKSB7XG4gICAgY29uc3QgZXhpc3RzID0gY29udmVydEVsZW1lbnRNYXRjaGVyVG9CcmFuY2hlZE1hdGNoZXIoXG4gICAgICB2YWx1ZSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgKTtcbiAgICByZXR1cm4gb3BlcmFuZCA/IGV4aXN0cyA6IGludmVydEJyYW5jaGVkTWF0Y2hlcihleGlzdHMpO1xuICB9LFxuICAvLyAkb3B0aW9ucyBqdXN0IHByb3ZpZGVzIG9wdGlvbnMgZm9yICRyZWdleDsgaXRzIGxvZ2ljIGlzIGluc2lkZSAkcmVnZXhcbiAgJG9wdGlvbnMob3BlcmFuZCwgdmFsdWVTZWxlY3Rvcikge1xuICAgIGlmICghaGFzT3duLmNhbGwodmFsdWVTZWxlY3RvciwgJyRyZWdleCcpKSB7XG4gICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignJG9wdGlvbnMgbmVlZHMgYSAkcmVnZXgnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXZlcnl0aGluZ01hdGNoZXI7XG4gIH0sXG4gIC8vICRtYXhEaXN0YW5jZSBpcyBiYXNpY2FsbHkgYW4gYXJndW1lbnQgdG8gJG5lYXJcbiAgJG1heERpc3RhbmNlKG9wZXJhbmQsIHZhbHVlU2VsZWN0b3IpIHtcbiAgICBpZiAoIXZhbHVlU2VsZWN0b3IuJG5lYXIpIHtcbiAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckbWF4RGlzdGFuY2UgbmVlZHMgYSAkbmVhcicpO1xuICAgIH1cblxuICAgIHJldHVybiBldmVyeXRoaW5nTWF0Y2hlcjtcbiAgfSxcbiAgJGFsbChvcGVyYW5kLCB2YWx1ZVNlbGVjdG9yLCBtYXRjaGVyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG9wZXJhbmQpKSB7XG4gICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignJGFsbCByZXF1aXJlcyBhcnJheScpO1xuICAgIH1cblxuICAgIC8vIE5vdCBzdXJlIHdoeSwgYnV0IHRoaXMgc2VlbXMgdG8gYmUgd2hhdCBNb25nb0RCIGRvZXMuXG4gICAgaWYgKG9wZXJhbmQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbm90aGluZ01hdGNoZXI7XG4gICAgfVxuXG4gICAgY29uc3QgYnJhbmNoZWRNYXRjaGVycyA9IG9wZXJhbmQubWFwKGNyaXRlcmlvbiA9PiB7XG4gICAgICAvLyBYWFggaGFuZGxlICRhbGwvJGVsZW1NYXRjaCBjb21iaW5hdGlvblxuICAgICAgaWYgKGlzT3BlcmF0b3JPYmplY3QoY3JpdGVyaW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignbm8gJCBleHByZXNzaW9ucyBpbiAkYWxsJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgaXMgYWx3YXlzIGEgcmVnZXhwIG9yIGVxdWFsaXR5IHNlbGVjdG9yLlxuICAgICAgcmV0dXJuIGNvbXBpbGVWYWx1ZVNlbGVjdG9yKGNyaXRlcmlvbiwgbWF0Y2hlcik7XG4gICAgfSk7XG5cbiAgICAvLyBhbmRCcmFuY2hlZE1hdGNoZXJzIGRvZXMgTk9UIHJlcXVpcmUgYWxsIHNlbGVjdG9ycyB0byByZXR1cm4gdHJ1ZSBvbiB0aGVcbiAgICAvLyBTQU1FIGJyYW5jaC5cbiAgICByZXR1cm4gYW5kQnJhbmNoZWRNYXRjaGVycyhicmFuY2hlZE1hdGNoZXJzKTtcbiAgfSxcbiAgJG5lYXIob3BlcmFuZCwgdmFsdWVTZWxlY3RvciwgbWF0Y2hlciwgaXNSb290KSB7XG4gICAgaWYgKCFpc1Jvb3QpIHtcbiAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKCckbmVhciBjYW5cXCd0IGJlIGluc2lkZSBhbm90aGVyICQgb3BlcmF0b3InKTtcbiAgICB9XG5cbiAgICBtYXRjaGVyLl9oYXNHZW9RdWVyeSA9IHRydWU7XG5cbiAgICAvLyBUaGVyZSBhcmUgdHdvIGtpbmRzIG9mIGdlb2RhdGEgaW4gTW9uZ29EQjogbGVnYWN5IGNvb3JkaW5hdGUgcGFpcnMgYW5kXG4gICAgLy8gR2VvSlNPTi4gVGhleSB1c2UgZGlmZmVyZW50IGRpc3RhbmNlIG1ldHJpY3MsIHRvby4gR2VvSlNPTiBxdWVyaWVzIGFyZVxuICAgIC8vIG1hcmtlZCB3aXRoIGEgJGdlb21ldHJ5IHByb3BlcnR5LCB0aG91Z2ggbGVnYWN5IGNvb3JkaW5hdGVzIGNhbiBiZVxuICAgIC8vIG1hdGNoZWQgdXNpbmcgJGdlb21ldHJ5LlxuICAgIGxldCBtYXhEaXN0YW5jZSwgcG9pbnQsIGRpc3RhbmNlO1xuICAgIGlmIChMb2NhbENvbGxlY3Rpb24uX2lzUGxhaW5PYmplY3Qob3BlcmFuZCkgJiYgaGFzT3duLmNhbGwob3BlcmFuZCwgJyRnZW9tZXRyeScpKSB7XG4gICAgICAvLyBHZW9KU09OIFwiMmRzcGhlcmVcIiBtb2RlLlxuICAgICAgbWF4RGlzdGFuY2UgPSBvcGVyYW5kLiRtYXhEaXN0YW5jZTtcbiAgICAgIHBvaW50ID0gb3BlcmFuZC4kZ2VvbWV0cnk7XG4gICAgICBkaXN0YW5jZSA9IHZhbHVlID0+IHtcbiAgICAgICAgLy8gWFhYOiBmb3Igbm93LCB3ZSBkb24ndCBjYWxjdWxhdGUgdGhlIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuLCBzYXksXG4gICAgICAgIC8vIHBvbHlnb24gYW5kIGNpcmNsZS4gSWYgcGVvcGxlIGNhcmUgYWJvdXQgdGhpcyB1c2UtY2FzZSBpdCB3aWxsIGdldFxuICAgICAgICAvLyBhIHByaW9yaXR5LlxuICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXZhbHVlLnR5cGUpIHtcbiAgICAgICAgICByZXR1cm4gR2VvSlNPTi5wb2ludERpc3RhbmNlKFxuICAgICAgICAgICAgcG9pbnQsXG4gICAgICAgICAgICB7dHlwZTogJ1BvaW50JywgY29vcmRpbmF0ZXM6IHBvaW50VG9BcnJheSh2YWx1ZSl9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS50eXBlID09PSAnUG9pbnQnKSB7XG4gICAgICAgICAgcmV0dXJuIEdlb0pTT04ucG9pbnREaXN0YW5jZShwb2ludCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIEdlb0pTT04uZ2VvbWV0cnlXaXRoaW5SYWRpdXModmFsdWUsIHBvaW50LCBtYXhEaXN0YW5jZSlcbiAgICAgICAgICA/IDBcbiAgICAgICAgICA6IG1heERpc3RhbmNlICsgMTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG1heERpc3RhbmNlID0gdmFsdWVTZWxlY3Rvci4kbWF4RGlzdGFuY2U7XG5cbiAgICAgIGlmICghaXNJbmRleGFibGUob3BlcmFuZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1pbmlNb25nb1F1ZXJ5RXJyb3IoJyRuZWFyIGFyZ3VtZW50IG11c3QgYmUgY29vcmRpbmF0ZSBwYWlyIG9yIEdlb0pTT04nKTtcbiAgICAgIH1cblxuICAgICAgcG9pbnQgPSBwb2ludFRvQXJyYXkob3BlcmFuZCk7XG5cbiAgICAgIGRpc3RhbmNlID0gdmFsdWUgPT4ge1xuICAgICAgICBpZiAoIWlzSW5kZXhhYmxlKHZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRpc3RhbmNlQ29vcmRpbmF0ZVBhaXJzKHBvaW50LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBicmFuY2hlZFZhbHVlcyA9PiB7XG4gICAgICAvLyBUaGVyZSBtaWdodCBiZSBtdWx0aXBsZSBwb2ludHMgaW4gdGhlIGRvY3VtZW50IHRoYXQgbWF0Y2ggdGhlIGdpdmVuXG4gICAgICAvLyBmaWVsZC4gT25seSBvbmUgb2YgdGhlbSBuZWVkcyB0byBiZSB3aXRoaW4gJG1heERpc3RhbmNlLCBidXQgd2UgbmVlZCB0b1xuICAgICAgLy8gZXZhbHVhdGUgYWxsIG9mIHRoZW0gYW5kIHVzZSB0aGUgbmVhcmVzdCBvbmUgZm9yIHRoZSBpbXBsaWNpdCBzb3J0XG4gICAgICAvLyBzcGVjaWZpZXIuIChUaGF0J3Mgd2h5IHdlIGNhbid0IGp1c3QgdXNlIEVMRU1FTlRfT1BFUkFUT1JTIGhlcmUuKVxuICAgICAgLy9cbiAgICAgIC8vIE5vdGU6IFRoaXMgZGlmZmVycyBmcm9tIE1vbmdvREIncyBpbXBsZW1lbnRhdGlvbiwgd2hlcmUgYSBkb2N1bWVudCB3aWxsXG4gICAgICAvLyBhY3R1YWxseSBzaG93IHVwICptdWx0aXBsZSB0aW1lcyogaW4gdGhlIHJlc3VsdCBzZXQsIHdpdGggb25lIGVudHJ5IGZvclxuICAgICAgLy8gZWFjaCB3aXRoaW4tJG1heERpc3RhbmNlIGJyYW5jaGluZyBwb2ludC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IHtyZXN1bHQ6IGZhbHNlfTtcbiAgICAgIGV4cGFuZEFycmF5c0luQnJhbmNoZXMoYnJhbmNoZWRWYWx1ZXMpLmV2ZXJ5KGJyYW5jaCA9PiB7XG4gICAgICAgIC8vIGlmIG9wZXJhdGlvbiBpcyBhbiB1cGRhdGUsIGRvbid0IHNraXAgYnJhbmNoZXMsIGp1c3QgcmV0dXJuIHRoZSBmaXJzdFxuICAgICAgICAvLyBvbmUgKCMzNTk5KVxuICAgICAgICBsZXQgY3VyRGlzdGFuY2U7XG4gICAgICAgIGlmICghbWF0Y2hlci5faXNVcGRhdGUpIHtcbiAgICAgICAgICBpZiAoISh0eXBlb2YgYnJhbmNoLnZhbHVlID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN1ckRpc3RhbmNlID0gZGlzdGFuY2UoYnJhbmNoLnZhbHVlKTtcblxuICAgICAgICAgIC8vIFNraXAgYnJhbmNoZXMgdGhhdCBhcmVuJ3QgcmVhbCBwb2ludHMgb3IgYXJlIHRvbyBmYXIgYXdheS5cbiAgICAgICAgICBpZiAoY3VyRGlzdGFuY2UgPT09IG51bGwgfHwgY3VyRGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2tpcCBhbnl0aGluZyB0aGF0J3MgYSB0aWUuXG4gICAgICAgICAgaWYgKHJlc3VsdC5kaXN0YW5jZSAhPT0gdW5kZWZpbmVkICYmIHJlc3VsdC5kaXN0YW5jZSA8PSBjdXJEaXN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0LnJlc3VsdCA9IHRydWU7XG4gICAgICAgIHJlc3VsdC5kaXN0YW5jZSA9IGN1ckRpc3RhbmNlO1xuXG4gICAgICAgIGlmIChicmFuY2guYXJyYXlJbmRpY2VzKSB7XG4gICAgICAgICAgcmVzdWx0LmFycmF5SW5kaWNlcyA9IGJyYW5jaC5hcnJheUluZGljZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHJlc3VsdC5hcnJheUluZGljZXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIW1hdGNoZXIuX2lzVXBkYXRlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSxcbn07XG5cbi8vIE5COiBXZSBhcmUgY2hlYXRpbmcgYW5kIHVzaW5nIHRoaXMgZnVuY3Rpb24gdG8gaW1wbGVtZW50ICdBTkQnIGZvciBib3RoXG4vLyAnZG9jdW1lbnQgbWF0Y2hlcnMnIGFuZCAnYnJhbmNoZWQgbWF0Y2hlcnMnLiBUaGV5IGJvdGggcmV0dXJuIHJlc3VsdCBvYmplY3RzXG4vLyBidXQgdGhlIGFyZ3VtZW50IGlzIGRpZmZlcmVudDogZm9yIHRoZSBmb3JtZXIgaXQncyBhIHdob2xlIGRvYywgd2hlcmVhcyBmb3Jcbi8vIHRoZSBsYXR0ZXIgaXQncyBhbiBhcnJheSBvZiAnYnJhbmNoZWQgdmFsdWVzJy5cbmZ1bmN0aW9uIGFuZFNvbWVNYXRjaGVycyhzdWJNYXRjaGVycykge1xuICBpZiAoc3ViTWF0Y2hlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGV2ZXJ5dGhpbmdNYXRjaGVyO1xuICB9XG5cbiAgaWYgKHN1Yk1hdGNoZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBzdWJNYXRjaGVyc1swXTtcbiAgfVxuXG4gIHJldHVybiBkb2NPckJyYW5jaGVzID0+IHtcbiAgICBjb25zdCBtYXRjaCA9IHt9O1xuICAgIG1hdGNoLnJlc3VsdCA9IHN1Yk1hdGNoZXJzLmV2ZXJ5KGZuID0+IHtcbiAgICAgIGNvbnN0IHN1YlJlc3VsdCA9IGZuKGRvY09yQnJhbmNoZXMpO1xuXG4gICAgICAvLyBDb3B5IGEgJ2Rpc3RhbmNlJyBudW1iZXIgb3V0IG9mIHRoZSBmaXJzdCBzdWItbWF0Y2hlciB0aGF0IGhhc1xuICAgICAgLy8gb25lLiBZZXMsIHRoaXMgbWVhbnMgdGhhdCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgJG5lYXIgZmllbGRzIGluIGFcbiAgICAgIC8vIHF1ZXJ5LCBzb21ldGhpbmcgYXJiaXRyYXJ5IGhhcHBlbnM7IHRoaXMgYXBwZWFycyB0byBiZSBjb25zaXN0ZW50IHdpdGhcbiAgICAgIC8vIE1vbmdvLlxuICAgICAgaWYgKHN1YlJlc3VsdC5yZXN1bHQgJiZcbiAgICAgICAgICBzdWJSZXN1bHQuZGlzdGFuY2UgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgIG1hdGNoLmRpc3RhbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbWF0Y2guZGlzdGFuY2UgPSBzdWJSZXN1bHQuZGlzdGFuY2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbWlsYXJseSwgcHJvcGFnYXRlIGFycmF5SW5kaWNlcyBmcm9tIHN1Yi1tYXRjaGVycy4uLiBidXQgdG8gbWF0Y2hcbiAgICAgIC8vIE1vbmdvREIgYmVoYXZpb3IsIHRoaXMgdGltZSB0aGUgKmxhc3QqIHN1Yi1tYXRjaGVyIHdpdGggYXJyYXlJbmRpY2VzXG4gICAgICAvLyB3aW5zLlxuICAgICAgaWYgKHN1YlJlc3VsdC5yZXN1bHQgJiYgc3ViUmVzdWx0LmFycmF5SW5kaWNlcykge1xuICAgICAgICBtYXRjaC5hcnJheUluZGljZXMgPSBzdWJSZXN1bHQuYXJyYXlJbmRpY2VzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3ViUmVzdWx0LnJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8vIElmIHdlIGRpZG4ndCBhY3R1YWxseSBtYXRjaCwgZm9yZ2V0IGFueSBleHRyYSBtZXRhZGF0YSB3ZSBjYW1lIHVwIHdpdGguXG4gICAgaWYgKCFtYXRjaC5yZXN1bHQpIHtcbiAgICAgIGRlbGV0ZSBtYXRjaC5kaXN0YW5jZTtcbiAgICAgIGRlbGV0ZSBtYXRjaC5hcnJheUluZGljZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9O1xufVxuXG5jb25zdCBhbmREb2N1bWVudE1hdGNoZXJzID0gYW5kU29tZU1hdGNoZXJzO1xuY29uc3QgYW5kQnJhbmNoZWRNYXRjaGVycyA9IGFuZFNvbWVNYXRjaGVycztcblxuZnVuY3Rpb24gY29tcGlsZUFycmF5T2ZEb2N1bWVudFNlbGVjdG9ycyhzZWxlY3RvcnMsIG1hdGNoZXIsIGluRWxlbU1hdGNoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzZWxlY3RvcnMpIHx8IHNlbGVjdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignJGFuZC8kb3IvJG5vciBtdXN0IGJlIG5vbmVtcHR5IGFycmF5Jyk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3JzLm1hcChzdWJTZWxlY3RvciA9PiB7XG4gICAgaWYgKCFMb2NhbENvbGxlY3Rpb24uX2lzUGxhaW5PYmplY3Qoc3ViU2VsZWN0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcignJG9yLyRhbmQvJG5vciBlbnRyaWVzIG5lZWQgdG8gYmUgZnVsbCBvYmplY3RzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBpbGVEb2N1bWVudFNlbGVjdG9yKHN1YlNlbGVjdG9yLCBtYXRjaGVyLCB7aW5FbGVtTWF0Y2h9KTtcbiAgfSk7XG59XG5cbi8vIFRha2VzIGluIGEgc2VsZWN0b3IgdGhhdCBjb3VsZCBtYXRjaCBhIGZ1bGwgZG9jdW1lbnQgKGVnLCB0aGUgb3JpZ2luYWxcbi8vIHNlbGVjdG9yKS4gUmV0dXJucyBhIGZ1bmN0aW9uIG1hcHBpbmcgZG9jdW1lbnQtPnJlc3VsdCBvYmplY3QuXG4vL1xuLy8gbWF0Y2hlciBpcyB0aGUgTWF0Y2hlciBvYmplY3Qgd2UgYXJlIGNvbXBpbGluZy5cbi8vXG4vLyBJZiB0aGlzIGlzIHRoZSByb290IGRvY3VtZW50IHNlbGVjdG9yIChpZSwgbm90IHdyYXBwZWQgaW4gJGFuZCBvciB0aGUgbGlrZSksXG4vLyB0aGVuIGlzUm9vdCBpcyB0cnVlLiAoVGhpcyBpcyB1c2VkIGJ5ICRuZWFyLilcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRG9jdW1lbnRTZWxlY3Rvcihkb2NTZWxlY3RvciwgbWF0Y2hlciwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGRvY01hdGNoZXJzID0gT2JqZWN0LmtleXMoZG9jU2VsZWN0b3IpLm1hcChrZXkgPT4ge1xuICAgIGNvbnN0IHN1YlNlbGVjdG9yID0gZG9jU2VsZWN0b3Jba2V5XTtcblxuICAgIGlmIChrZXkuc3Vic3RyKDAsIDEpID09PSAnJCcpIHtcbiAgICAgIC8vIE91dGVyIG9wZXJhdG9ycyBhcmUgZWl0aGVyIGxvZ2ljYWwgb3BlcmF0b3JzICh0aGV5IHJlY3Vyc2UgYmFjayBpbnRvXG4gICAgICAvLyB0aGlzIGZ1bmN0aW9uKSwgb3IgJHdoZXJlLlxuICAgICAgaWYgKCFoYXNPd24uY2FsbChMT0dJQ0FMX09QRVJBVE9SUywga2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgTWluaU1vbmdvUXVlcnlFcnJvcihgVW5yZWNvZ25pemVkIGxvZ2ljYWwgb3BlcmF0b3I6ICR7a2V5fWApO1xuICAgICAgfVxuXG4gICAgICBtYXRjaGVyLl9pc1NpbXBsZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIExPR0lDQUxfT1BFUkFUT1JTW2tleV0oc3ViU2VsZWN0b3IsIG1hdGNoZXIsIG9wdGlvbnMuaW5FbGVtTWF0Y2gpO1xuICAgIH1cblxuICAgIC8vIFJlY29yZCB0aGlzIHBhdGgsIGJ1dCBvbmx5IGlmIHdlIGFyZW4ndCBpbiBhbiBlbGVtTWF0Y2hlciwgc2luY2UgaW4gYW5cbiAgICAvLyBlbGVtTWF0Y2ggdGhpcyBpcyBhIHBhdGggaW5zaWRlIGFuIG9iamVjdCBpbiBhbiBhcnJheSwgbm90IGluIHRoZSBkb2NcbiAgICAvLyByb290LlxuICAgIGlmICghb3B0aW9ucy5pbkVsZW1NYXRjaCkge1xuICAgICAgbWF0Y2hlci5fcmVjb3JkUGF0aFVzZWQoa2V5KTtcbiAgICB9XG5cbiAgICAvLyBEb24ndCBhZGQgYSBtYXRjaGVyIGlmIHN1YlNlbGVjdG9yIGlzIGEgZnVuY3Rpb24gLS0gdGhpcyBpcyB0byBtYXRjaFxuICAgIC8vIHRoZSBiZWhhdmlvciBvZiBNZXRlb3Igb24gdGhlIHNlcnZlciAoaW5oZXJpdGVkIGZyb20gdGhlIG5vZGUgbW9uZ29kYlxuICAgIC8vIGRyaXZlciksIHdoaWNoIGlzIHRvIGlnbm9yZSBhbnkgcGFydCBvZiBhIHNlbGVjdG9yIHdoaWNoIGlzIGEgZnVuY3Rpb24uXG4gICAgaWYgKHR5cGVvZiBzdWJTZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBsb29rVXBCeUluZGV4ID0gbWFrZUxvb2t1cEZ1bmN0aW9uKGtleSk7XG4gICAgY29uc3QgdmFsdWVNYXRjaGVyID0gY29tcGlsZVZhbHVlU2VsZWN0b3IoXG4gICAgICBzdWJTZWxlY3RvcixcbiAgICAgIG1hdGNoZXIsXG4gICAgICBvcHRpb25zLmlzUm9vdFxuICAgICk7XG5cbiAgICByZXR1cm4gZG9jID0+IHZhbHVlTWF0Y2hlcihsb29rVXBCeUluZGV4KGRvYykpO1xuICB9KS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgcmV0dXJuIGFuZERvY3VtZW50TWF0Y2hlcnMoZG9jTWF0Y2hlcnMpO1xufVxuXG4vLyBUYWtlcyBpbiBhIHNlbGVjdG9yIHRoYXQgY291bGQgbWF0Y2ggYSBrZXktaW5kZXhlZCB2YWx1ZSBpbiBhIGRvY3VtZW50OyBlZyxcbi8vIHskZ3Q6IDUsICRsdDogOX0sIG9yIGEgcmVndWxhciBleHByZXNzaW9uLCBvciBhbnkgbm9uLWV4cHJlc3Npb24gb2JqZWN0ICh0b1xuLy8gaW5kaWNhdGUgZXF1YWxpdHkpLiAgUmV0dXJucyBhIGJyYW5jaGVkIG1hdGNoZXI6IGEgZnVuY3Rpb24gbWFwcGluZ1xuLy8gW2JyYW5jaGVkIHZhbHVlXS0+cmVzdWx0IG9iamVjdC5cbmZ1bmN0aW9uIGNvbXBpbGVWYWx1ZVNlbGVjdG9yKHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIsIGlzUm9vdCkge1xuICBpZiAodmFsdWVTZWxlY3RvciBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIG1hdGNoZXIuX2lzU2ltcGxlID0gZmFsc2U7XG4gICAgcmV0dXJuIGNvbnZlcnRFbGVtZW50TWF0Y2hlclRvQnJhbmNoZWRNYXRjaGVyKFxuICAgICAgcmVnZXhwRWxlbWVudE1hdGNoZXIodmFsdWVTZWxlY3RvcilcbiAgICApO1xuICB9XG5cbiAgaWYgKGlzT3BlcmF0b3JPYmplY3QodmFsdWVTZWxlY3RvcikpIHtcbiAgICByZXR1cm4gb3BlcmF0b3JCcmFuY2hlZE1hdGNoZXIodmFsdWVTZWxlY3RvciwgbWF0Y2hlciwgaXNSb290KTtcbiAgfVxuXG4gIHJldHVybiBjb252ZXJ0RWxlbWVudE1hdGNoZXJUb0JyYW5jaGVkTWF0Y2hlcihcbiAgICBlcXVhbGl0eUVsZW1lbnRNYXRjaGVyKHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIgJiYgbWF0Y2hlci5fY29sbGF0b3IpXG4gICk7XG59XG5cbi8vIEdpdmVuIGFuIGVsZW1lbnQgbWF0Y2hlciAod2hpY2ggZXZhbHVhdGVzIGEgc2luZ2xlIHZhbHVlKSwgcmV0dXJucyBhIGJyYW5jaGVkXG4vLyB2YWx1ZSAod2hpY2ggZXZhbHVhdGVzIHRoZSBlbGVtZW50IG1hdGNoZXIgb24gYWxsIHRoZSBicmFuY2hlcyBhbmQgcmV0dXJucyBhXG4vLyBtb3JlIHN0cnVjdHVyZWQgcmV0dXJuIHZhbHVlIHBvc3NpYmx5IGluY2x1ZGluZyBhcnJheUluZGljZXMpLlxuZnVuY3Rpb24gY29udmVydEVsZW1lbnRNYXRjaGVyVG9CcmFuY2hlZE1hdGNoZXIoZWxlbWVudE1hdGNoZXIsIG9wdGlvbnMgPSB7fSkge1xuICByZXR1cm4gYnJhbmNoZXMgPT4ge1xuICAgIGNvbnN0IGV4cGFuZGVkID0gb3B0aW9ucy5kb250RXhwYW5kTGVhZkFycmF5c1xuICAgICAgPyBicmFuY2hlc1xuICAgICAgOiBleHBhbmRBcnJheXNJbkJyYW5jaGVzKGJyYW5jaGVzLCBvcHRpb25zLmRvbnRJbmNsdWRlTGVhZkFycmF5cyk7XG5cbiAgICBjb25zdCBtYXRjaCA9IHt9O1xuICAgIG1hdGNoLnJlc3VsdCA9IGV4cGFuZGVkLnNvbWUoZWxlbWVudCA9PiB7XG4gICAgICBsZXQgbWF0Y2hlZCA9IGVsZW1lbnRNYXRjaGVyKGVsZW1lbnQudmFsdWUpO1xuXG4gICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yICRlbGVtTWF0Y2g6IGl0IG1lYW5zIFwidHJ1ZSwgYW5kIHVzZSB0aGlzIGFzIGFuIGFycmF5XG4gICAgICAvLyBpbmRleCBpZiBJIGRpZG4ndCBhbHJlYWR5IGhhdmUgb25lXCIuXG4gICAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIFhYWCBUaGlzIGNvZGUgZGF0ZXMgZnJvbSB3aGVuIHdlIG9ubHkgc3RvcmVkIGEgc2luZ2xlIGFycmF5IGluZGV4XG4gICAgICAgIC8vIChmb3IgdGhlIG91dGVybW9zdCBhcnJheSkuIFNob3VsZCB3ZSBiZSBhbHNvIGluY2x1ZGluZyBkZWVwZXIgYXJyYXlcbiAgICAgICAgLy8gaW5kaWNlcyBmcm9tIHRoZSAkZWxlbU1hdGNoIG1hdGNoP1xuICAgICAgICBpZiAoIWVsZW1lbnQuYXJyYXlJbmRpY2VzKSB7XG4gICAgICAgICAgZWxlbWVudC5hcnJheUluZGljZXMgPSBbbWF0Y2hlZF07XG4gICAgICAgIH1cblxuICAgICAgICBtYXRjaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgc29tZSBlbGVtZW50IG1hdGNoZWQsIGFuZCBpdCdzIHRhZ2dlZCB3aXRoIGFycmF5IGluZGljZXMsIGluY2x1ZGVcbiAgICAgIC8vIHRob3NlIGluZGljZXMgaW4gb3VyIHJlc3VsdCBvYmplY3QuXG4gICAgICBpZiAobWF0Y2hlZCAmJiBlbGVtZW50LmFycmF5SW5kaWNlcykge1xuICAgICAgICBtYXRjaC5hcnJheUluZGljZXMgPSBlbGVtZW50LmFycmF5SW5kaWNlcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG59XG5cbi8vIEhlbHBlcnMgZm9yICRuZWFyLlxuZnVuY3Rpb24gZGlzdGFuY2VDb29yZGluYXRlUGFpcnMoYSwgYikge1xuICBjb25zdCBwb2ludEEgPSBwb2ludFRvQXJyYXkoYSk7XG4gIGNvbnN0IHBvaW50QiA9IHBvaW50VG9BcnJheShiKTtcblxuICByZXR1cm4gTWF0aC5oeXBvdChwb2ludEFbMF0gLSBwb2ludEJbMF0sIHBvaW50QVsxXSAtIHBvaW50QlsxXSk7XG59XG5cbi8vIFRha2VzIHNvbWV0aGluZyB0aGF0IGlzIG5vdCBhbiBvcGVyYXRvciBvYmplY3QgYW5kIHJldHVybnMgYW4gZWxlbWVudCBtYXRjaGVyXG4vLyBmb3IgZXF1YWxpdHkgd2l0aCB0aGF0IHRoaW5nLiAgV2hlbiBhIGNvbGxhdG9yIChJbnRsLkNvbGxhdG9yKSBpcyBwcm92aWRlZCxcbi8vIHN0cmluZyBlcXVhbGl0eSB1c2VzIGxvY2FsZS1hd2FyZSBjb21wYXJpc29uLlxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsaXR5RWxlbWVudE1hdGNoZXIoZWxlbWVudFNlbGVjdG9yLCBjb2xsYXRvcikge1xuICBpZiAoaXNPcGVyYXRvck9iamVjdChlbGVtZW50U2VsZWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IE1pbmlNb25nb1F1ZXJ5RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGVxdWFsaXR5VmFsdWVTZWxlY3RvciBmb3Igb3BlcmF0b3Igb2JqZWN0Jyk7XG4gIH1cblxuICAvLyBTcGVjaWFsLWNhc2U6IG51bGwgYW5kIHVuZGVmaW5lZCBhcmUgZXF1YWwgKGlmIHlvdSBnb3QgdW5kZWZpbmVkIGluIHRoZXJlXG4gIC8vIHNvbWV3aGVyZSwgb3IgaWYgeW91IGdvdCBpdCBkdWUgdG8gc29tZSBicmFuY2ggYmVpbmcgbm9uLWV4aXN0ZW50IGluIHRoZVxuICAvLyB3ZWlyZCBzcGVjaWFsIGNhc2UpLCBldmVuIHRob3VnaCB0aGV5IGFyZW4ndCB3aXRoIEVKU09OLmVxdWFscy5cbiAgLy8gdW5kZWZpbmVkIG9yIG51bGxcbiAgaWYgKGVsZW1lbnRTZWxlY3RvciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID0+IHZhbHVlID09IG51bGw7XG4gIH1cblxuICByZXR1cm4gdmFsdWUgPT4gTG9jYWxDb2xsZWN0aW9uLl9mLl9lcXVhbChlbGVtZW50U2VsZWN0b3IsIHZhbHVlLCBjb2xsYXRvcik7XG59XG5cbmZ1bmN0aW9uIGV2ZXJ5dGhpbmdNYXRjaGVyKGRvY09yQnJhbmNoZWRWYWx1ZXMpIHtcbiAgcmV0dXJuIHtyZXN1bHQ6IHRydWV9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kQXJyYXlzSW5CcmFuY2hlcyhicmFuY2hlcywgc2tpcFRoZUFycmF5cykge1xuICBjb25zdCBicmFuY2hlc091dCA9IFtdO1xuXG4gIGJyYW5jaGVzLmZvckVhY2goYnJhbmNoID0+IHtcbiAgICBjb25zdCB0aGlzSXNBcnJheSA9IEFycmF5LmlzQXJyYXkoYnJhbmNoLnZhbHVlKTtcblxuICAgIC8vIFdlIGluY2x1ZGUgdGhlIGJyYW5jaCBpdHNlbGYsICpVTkxFU1MqIHdlIGl0J3MgYW4gYXJyYXkgdGhhdCB3ZSdyZSBnb2luZ1xuICAgIC8vIHRvIGl0ZXJhdGUgYW5kIHdlJ3JlIHRvbGQgdG8gc2tpcCBhcnJheXMuICAoVGhhdCdzIHJpZ2h0LCB3ZSBpbmNsdWRlIHNvbWVcbiAgICAvLyBhcnJheXMgZXZlbiBza2lwVGhlQXJyYXlzIGlzIHRydWU6IHRoZXNlIGFyZSBhcnJheXMgdGhhdCB3ZXJlIGZvdW5kIHZpYVxuICAgIC8vIGV4cGxpY2l0IG51bWVyaWNhbCBpbmRpY2VzLilcbiAgICBpZiAoIShza2lwVGhlQXJyYXlzICYmIHRoaXNJc0FycmF5ICYmICFicmFuY2guZG9udEl0ZXJhdGUpKSB7XG4gICAgICBicmFuY2hlc091dC5wdXNoKHthcnJheUluZGljZXM6IGJyYW5jaC5hcnJheUluZGljZXMsIHZhbHVlOiBicmFuY2gudmFsdWV9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpc0lzQXJyYXkgJiYgIWJyYW5jaC5kb250SXRlcmF0ZSkge1xuICAgICAgYnJhbmNoLnZhbHVlLmZvckVhY2goKHZhbHVlLCBpKSA9PiB7XG4gICAgICAgIGJyYW5jaGVzT3V0LnB1c2goe1xuICAgICAgICAgIGFycmF5SW5kaWNlczogKGJyYW5jaC5hcnJheUluZGljZXMgfHwgW10pLmNvbmNhdChpKSxcbiAgICAgICAgICB2YWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGJyYW5jaGVzT3V0O1xufVxuXG4vLyBIZWxwZXJzIGZvciAkYml0c0FsbFNldC8kYml0c0FueVNldC8kYml0c0FsbENsZWFyLyRiaXRzQW55Q2xlYXIuXG5mdW5jdGlvbiBnZXRPcGVyYW5kQml0bWFzayhvcGVyYW5kLCBzZWxlY3Rvcikge1xuICAvLyBudW1lcmljIGJpdG1hc2tcbiAgLy8gWW91IGNhbiBwcm92aWRlIGEgbnVtZXJpYyBiaXRtYXNrIHRvIGJlIG1hdGNoZWQgYWdhaW5zdCB0aGUgb3BlcmFuZCBmaWVsZC5cbiAgLy8gSXQgbXVzdCBiZSByZXByZXNlbnRhYmxlIGFzIGEgbm9uLW5lZ2F0aXZlIDMyLWJpdCBzaWduZWQgaW50ZWdlci5cbiAgLy8gT3RoZXJ3aXNlLCAkYml0c0FsbFNldCB3aWxsIHJldHVybiBhbiBlcnJvci5cbiAgaWYgKE51bWJlci5pc0ludGVnZXIob3BlcmFuZCkgJiYgb3BlcmFuZCA+PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG5ldyBJbnQzMkFycmF5KFtvcGVyYW5kXSkuYnVmZmVyKTtcbiAgfVxuXG4gIC8vIGJpbmRhdGEgYml0bWFza1xuICAvLyBZb3UgY2FuIGFsc28gdXNlIGFuIGFyYml0cmFyaWx5IGxhcmdlIEJpbkRhdGEgaW5zdGFuY2UgYXMgYSBiaXRtYXNrLlxuICBpZiAoRUpTT04uaXNCaW5hcnkob3BlcmFuZCkpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkob3BlcmFuZC5idWZmZXIpO1xuICB9XG5cbiAgLy8gcG9zaXRpb24gbGlzdFxuICAvLyBJZiBxdWVyeWluZyBhIGxpc3Qgb2YgYml0IHBvc2l0aW9ucywgZWFjaCA8cG9zaXRpb24+IG11c3QgYmUgYSBub24tbmVnYXRpdmVcbiAgLy8gaW50ZWdlci4gQml0IHBvc2l0aW9ucyBzdGFydCBhdCAwIGZyb20gdGhlIGxlYXN0IHNpZ25pZmljYW50IGJpdC5cbiAgaWYgKEFycmF5LmlzQXJyYXkob3BlcmFuZCkgJiZcbiAgICAgIG9wZXJhbmQuZXZlcnkoeCA9PiBOdW1iZXIuaXNJbnRlZ2VyKHgpICYmIHggPj0gMCkpIHtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoKE1hdGgubWF4KC4uLm9wZXJhbmQpID4+IDMpICsgMSk7XG4gICAgY29uc3QgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgICBvcGVyYW5kLmZvckVhY2goeCA9PiB7XG4gICAgICB2aWV3W3ggPj4gM10gfD0gMSA8PCAoeCAmIDB4Nyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8vIGJhZCBvcGVyYW5kXG4gIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKFxuICAgIGBvcGVyYW5kIHRvICR7c2VsZWN0b3J9IG11c3QgYmUgYSBudW1lcmljIGJpdG1hc2sgKHJlcHJlc2VudGFibGUgYXMgYSBgICtcbiAgICAnbm9uLW5lZ2F0aXZlIDMyLWJpdCBzaWduZWQgaW50ZWdlciksIGEgYmluZGF0YSBiaXRtYXNrIG9yIGFuIGFycmF5IHdpdGggJyArXG4gICAgJ2JpdCBwb3NpdGlvbnMgKG5vbi1uZWdhdGl2ZSBpbnRlZ2VycyknXG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlQml0bWFzayh2YWx1ZSwgbGVuZ3RoKSB7XG4gIC8vIFRoZSBmaWVsZCB2YWx1ZSBtdXN0IGJlIGVpdGhlciBudW1lcmljYWwgb3IgYSBCaW5EYXRhIGluc3RhbmNlLiBPdGhlcndpc2UsXG4gIC8vICRiaXRzLi4uIHdpbGwgbm90IG1hdGNoIHRoZSBjdXJyZW50IGRvY3VtZW50LlxuXG4gIC8vIG51bWVyaWNhbFxuICBpZiAoTnVtYmVyLmlzU2FmZUludGVnZXIodmFsdWUpKSB7XG4gICAgLy8gJGJpdHMuLi4gd2lsbCBub3QgbWF0Y2ggbnVtZXJpY2FsIHZhbHVlcyB0aGF0IGNhbm5vdCBiZSByZXByZXNlbnRlZCBhcyBhXG4gICAgLy8gc2lnbmVkIDY0LWJpdCBpbnRlZ2VyLiBUaGlzIGNhbiBiZSB0aGUgY2FzZSBpZiBhIHZhbHVlIGlzIGVpdGhlciB0b29cbiAgICAvLyBsYXJnZSBvciBzbWFsbCB0byBmaXQgaW4gYSBzaWduZWQgNjQtYml0IGludGVnZXIsIG9yIGlmIGl0IGhhcyBhXG4gICAgLy8gZnJhY3Rpb25hbCBjb21wb25lbnQuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKFxuICAgICAgTWF0aC5tYXgobGVuZ3RoLCAyICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpXG4gICAgKTtcblxuICAgIGxldCB2aWV3ID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlciwgMCwgMik7XG4gICAgdmlld1swXSA9IHZhbHVlICUgKCgxIDw8IDE2KSAqICgxIDw8IDE2KSkgfCAwO1xuICAgIHZpZXdbMV0gPSB2YWx1ZSAvICgoMSA8PCAxNikgKiAoMSA8PCAxNikpIHwgMDtcblxuICAgIC8vIHNpZ24gZXh0ZW5zaW9uXG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMik7XG4gICAgICB2aWV3LmZvckVhY2goKGJ5dGUsIGkpID0+IHtcbiAgICAgICAgdmlld1tpXSA9IDB4ZmY7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgfVxuXG4gIC8vIGJpbmRhdGFcbiAgaWYgKEVKU09OLmlzQmluYXJ5KHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSh2YWx1ZS5idWZmZXIpO1xuICB9XG5cbiAgLy8gbm8gbWF0Y2hcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBBY3R1YWxseSBpbnNlcnRzIGEga2V5IHZhbHVlIGludG8gdGhlIHNlbGVjdG9yIGRvY3VtZW50XG4vLyBIb3dldmVyLCB0aGlzIGNoZWNrcyB0aGVyZSBpcyBubyBhbWJpZ3VpdHkgaW4gc2V0dGluZ1xuLy8gdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4ga2V5LCB0aHJvd3Mgb3RoZXJ3aXNlXG5mdW5jdGlvbiBpbnNlcnRJbnRvRG9jdW1lbnQoZG9jdW1lbnQsIGtleSwgdmFsdWUpIHtcbiAgT2JqZWN0LmtleXMoZG9jdW1lbnQpLmZvckVhY2goZXhpc3RpbmdLZXkgPT4ge1xuICAgIGlmIChcbiAgICAgIChleGlzdGluZ0tleS5sZW5ndGggPiBrZXkubGVuZ3RoICYmIGV4aXN0aW5nS2V5LmluZGV4T2YoYCR7a2V5fS5gKSA9PT0gMCkgfHxcbiAgICAgIChrZXkubGVuZ3RoID4gZXhpc3RpbmdLZXkubGVuZ3RoICYmIGtleS5pbmRleE9mKGAke2V4aXN0aW5nS2V5fS5gKSA9PT0gMClcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKFxuICAgICAgICBgY2Fubm90IGluZmVyIHF1ZXJ5IGZpZWxkcyB0byBzZXQsIGJvdGggcGF0aHMgJyR7ZXhpc3RpbmdLZXl9JyBhbmQgJyR7a2V5fScgYXJlIG1hdGNoZWRgXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoZXhpc3RpbmdLZXkgPT09IGtleSkge1xuICAgICAgdGhyb3cgbmV3IE1pbmlNb25nb1F1ZXJ5RXJyb3IoXG4gICAgICAgIGBjYW5ub3QgaW5mZXIgcXVlcnkgZmllbGRzIHRvIHNldCwgcGF0aCAnJHtrZXl9JyBpcyBtYXRjaGVkIHR3aWNlYFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGRvY3VtZW50W2tleV0gPSB2YWx1ZTtcbn1cblxuLy8gUmV0dXJucyBhIGJyYW5jaGVkIG1hdGNoZXIgdGhhdCBtYXRjaGVzIGlmZiB0aGUgZ2l2ZW4gbWF0Y2hlciBkb2VzIG5vdC5cbi8vIE5vdGUgdGhhdCB0aGlzIGltcGxpY2l0bHkgXCJkZU1vcmdhbml6ZXNcIiB0aGUgd3JhcHBlZCBmdW5jdGlvbi4gIGllLCBpdFxuLy8gbWVhbnMgdGhhdCBBTEwgYnJhbmNoIHZhbHVlcyBuZWVkIHRvIGZhaWwgdG8gbWF0Y2ggaW5uZXJCcmFuY2hlZE1hdGNoZXIuXG5mdW5jdGlvbiBpbnZlcnRCcmFuY2hlZE1hdGNoZXIoYnJhbmNoZWRNYXRjaGVyKSB7XG4gIHJldHVybiBicmFuY2hWYWx1ZXMgPT4ge1xuICAgIC8vIFdlIGV4cGxpY2l0bHkgY2hvb3NlIHRvIHN0cmlwIGFycmF5SW5kaWNlcyBoZXJlOiBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG9cbiAgICAvLyBzYXkgXCJ1cGRhdGUgdGhlIGFycmF5IGVsZW1lbnQgdGhhdCBkb2VzIG5vdCBtYXRjaCBzb21ldGhpbmdcIiwgYXQgbGVhc3RcbiAgICAvLyBpbiBtb25nby1sYW5kLlxuICAgIHJldHVybiB7cmVzdWx0OiAhYnJhbmNoZWRNYXRjaGVyKGJyYW5jaFZhbHVlcykucmVzdWx0fTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5kZXhhYmxlKG9iaikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopIHx8IExvY2FsQ29sbGVjdGlvbi5faXNQbGFpbk9iamVjdChvYmopO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1lcmljS2V5KHMpIHtcbiAgcmV0dXJuIC9eWzAtOV0rJC8udGVzdChzKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoaXMgaXMgYW4gb2JqZWN0IHdpdGggYXQgbGVhc3Qgb25lIGtleSBhbmQgYWxsIGtleXMgYmVnaW5cbi8vIHdpdGggJC4gIFVubGVzcyBpbmNvbnNpc3RlbnRPSyBpcyBzZXQsIHRocm93cyBpZiBzb21lIGtleXMgYmVnaW4gd2l0aCAkIGFuZFxuLy8gb3RoZXJzIGRvbid0LlxuZXhwb3J0IGZ1bmN0aW9uIGlzT3BlcmF0b3JPYmplY3QodmFsdWVTZWxlY3RvciwgaW5jb25zaXN0ZW50T0spIHtcbiAgaWYgKCFMb2NhbENvbGxlY3Rpb24uX2lzUGxhaW5PYmplY3QodmFsdWVTZWxlY3RvcikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBsZXQgdGhlc2VBcmVPcGVyYXRvcnMgPSB1bmRlZmluZWQ7XG4gIE9iamVjdC5rZXlzKHZhbHVlU2VsZWN0b3IpLmZvckVhY2goc2VsS2V5ID0+IHtcbiAgICBjb25zdCB0aGlzSXNPcGVyYXRvciA9IHNlbEtleS5zdWJzdHIoMCwgMSkgPT09ICckJyB8fCBzZWxLZXkgPT09ICdkaWZmJztcblxuICAgIGlmICh0aGVzZUFyZU9wZXJhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGVzZUFyZU9wZXJhdG9ycyA9IHRoaXNJc09wZXJhdG9yO1xuICAgIH0gZWxzZSBpZiAodGhlc2VBcmVPcGVyYXRvcnMgIT09IHRoaXNJc09wZXJhdG9yKSB7XG4gICAgICBpZiAoIWluY29uc2lzdGVudE9LKSB7XG4gICAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKFxuICAgICAgICAgIGBJbmNvbnNpc3RlbnQgb3BlcmF0b3I6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWVTZWxlY3Rvcil9YFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGVzZUFyZU9wZXJhdG9ycyA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuICEhdGhlc2VBcmVPcGVyYXRvcnM7IC8vIHt9IGhhcyBubyBvcGVyYXRvcnNcbn1cblxuLy8gSGVscGVyIGZvciAkbHQvJGd0LyRsdGUvJGd0ZS5cbmZ1bmN0aW9uIG1ha2VJbmVxdWFsaXR5KGNtcFZhbHVlQ29tcGFyYXRvcikge1xuICByZXR1cm4ge1xuICAgIGNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCwgdmFsdWVTZWxlY3RvciwgbWF0Y2hlcikge1xuICAgICAgLy8gQXJyYXlzIG5ldmVyIGNvbXBhcmUgZmFsc2Ugd2l0aCBub24tYXJyYXlzIGZvciBhbnkgaW5lcXVhbGl0eS5cbiAgICAgIC8vIFhYWCBUaGlzIHdhcyBiZWhhdmlvciB3ZSBvYnNlcnZlZCBpbiBwcmUtcmVsZWFzZSBNb25nb0RCIDIuNSwgYnV0XG4gICAgICAvLyAgICAgaXQgc2VlbXMgdG8gaGF2ZSBiZWVuIHJldmVydGVkLlxuICAgICAgLy8gICAgIFNlZSBodHRwczovL2ppcmEubW9uZ29kYi5vcmcvYnJvd3NlL1NFUlZFUi0xMTQ0NFxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3BlcmFuZCkpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IGNvbnNpZGVyIHVuZGVmaW5lZCBhbmQgbnVsbCB0aGUgc2FtZSAoc28gdHJ1ZSB3aXRoXG4gICAgICAvLyAkZ3RlLyRsdGUpLlxuICAgICAgaWYgKG9wZXJhbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcGVyYW5kID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3BlcmFuZFR5cGUgPSBMb2NhbENvbGxlY3Rpb24uX2YuX3R5cGUob3BlcmFuZCk7XG4gICAgICBjb25zdCBjb2xsYXRvciA9IG1hdGNoZXIgJiYgbWF0Y2hlci5fY29sbGF0b3I7XG5cbiAgICAgIHJldHVybiB2YWx1ZSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29tcGFyaXNvbnMgYXJlIG5ldmVyIHRydWUgYW1vbmcgdGhpbmdzIG9mIGRpZmZlcmVudCB0eXBlIChleGNlcHRcbiAgICAgICAgLy8gbnVsbCB2cyB1bmRlZmluZWQpLlxuICAgICAgICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9mLl90eXBlKHZhbHVlKSAhPT0gb3BlcmFuZFR5cGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY21wVmFsdWVDb21wYXJhdG9yKExvY2FsQ29sbGVjdGlvbi5fZi5fY21wKHZhbHVlLCBvcGVyYW5kLCBjb2xsYXRvcikpO1xuICAgICAgfTtcbiAgICB9LFxuICB9O1xufVxuXG4vLyBtYWtlTG9va3VwRnVuY3Rpb24oa2V5KSByZXR1cm5zIGEgbG9va3VwIGZ1bmN0aW9uLlxuLy9cbi8vIEEgbG9va3VwIGZ1bmN0aW9uIHRha2VzIGluIGEgZG9jdW1lbnQgYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmdcbi8vIGJyYW5jaGVzLiAgSWYgbm8gYXJyYXlzIGFyZSBmb3VuZCB3aGlsZSBsb29raW5nIHVwIHRoZSBrZXksIHRoaXMgYXJyYXkgd2lsbFxuLy8gaGF2ZSBleGFjdGx5IG9uZSBicmFuY2hlcyAocG9zc2libHkgJ3VuZGVmaW5lZCcsIGlmIHNvbWUgc2VnbWVudCBvZiB0aGUga2V5XG4vLyB3YXMgbm90IGZvdW5kKS5cbi8vXG4vLyBJZiBhcnJheXMgYXJlIGZvdW5kIGluIHRoZSBtaWRkbGUsIHRoaXMgY2FuIGhhdmUgbW9yZSB0aGFuIG9uZSBlbGVtZW50LCBzaW5jZVxuLy8gd2UgJ2JyYW5jaCcuIFdoZW4gd2UgJ2JyYW5jaCcsIGlmIHRoZXJlIGFyZSBtb3JlIGtleSBzZWdtZW50cyB0byBsb29rIHVwLFxuLy8gdGhlbiB3ZSBvbmx5IHB1cnN1ZSBicmFuY2hlcyB0aGF0IGFyZSBwbGFpbiBvYmplY3RzIChub3QgYXJyYXlzIG9yIHNjYWxhcnMpLlxuLy8gVGhpcyBtZWFucyB3ZSBjYW4gYWN0dWFsbHkgZW5kIHVwIHdpdGggbm8gYnJhbmNoZXMhXG4vL1xuLy8gV2UgZG8gKk5PVCogYnJhbmNoIG9uIGFycmF5cyB0aGF0IGFyZSBmb3VuZCBhdCB0aGUgZW5kIChpZSwgYXQgdGhlIGxhc3Rcbi8vIGRvdHRlZCBtZW1iZXIgb2YgdGhlIGtleSkuIFdlIGp1c3QgcmV0dXJuIHRoYXQgYXJyYXk7IGlmIHlvdSB3YW50IHRvXG4vLyBlZmZlY3RpdmVseSAnYnJhbmNoJyBvdmVyIHRoZSBhcnJheSdzIHZhbHVlcywgcG9zdC1wcm9jZXNzIHRoZSBsb29rdXBcbi8vIGZ1bmN0aW9uIHdpdGggZXhwYW5kQXJyYXlzSW5CcmFuY2hlcy5cbi8vXG4vLyBFYWNoIGJyYW5jaCBpcyBhbiBvYmplY3Qgd2l0aCBrZXlzOlxuLy8gIC0gdmFsdWU6IHRoZSB2YWx1ZSBhdCB0aGUgYnJhbmNoXG4vLyAgLSBkb250SXRlcmF0ZTogYW4gb3B0aW9uYWwgYm9vbDsgaWYgdHJ1ZSwgaXQgbWVhbnMgdGhhdCAndmFsdWUnIGlzIGFuIGFycmF5XG4vLyAgICB0aGF0IGV4cGFuZEFycmF5c0luQnJhbmNoZXMgc2hvdWxkIE5PVCBleHBhbmQuIFRoaXMgc3BlY2lmaWNhbGx5IGhhcHBlbnNcbi8vICAgIHdoZW4gdGhlcmUgaXMgYSBudW1lcmljIGluZGV4IGluIHRoZSBrZXksIGFuZCBlbnN1cmVzIHRoZVxuLy8gICAgcGVyaGFwcy1zdXJwcmlzaW5nIE1vbmdvREIgYmVoYXZpb3Igd2hlcmUgeydhLjAnOiA1fSBkb2VzIE5PVFxuLy8gICAgbWF0Y2gge2E6IFtbNV1dfS5cbi8vICAtIGFycmF5SW5kaWNlczogaWYgYW55IGFycmF5IGluZGV4aW5nIHdhcyBkb25lIGR1cmluZyBsb29rdXAgKGVpdGhlciBkdWUgdG9cbi8vICAgIGV4cGxpY2l0IG51bWVyaWMgaW5kaWNlcyBvciBpbXBsaWNpdCBicmFuY2hpbmcpLCB0aGlzIHdpbGwgYmUgYW4gYXJyYXkgb2Zcbi8vICAgIHRoZSBhcnJheSBpbmRpY2VzIHVzZWQsIGZyb20gb3V0ZXJtb3N0IHRvIGlubmVybW9zdDsgaXQgaXMgZmFsc2V5IG9yXG4vLyAgICBhYnNlbnQgaWYgbm8gYXJyYXkgaW5kZXggaXMgdXNlZC4gSWYgYW4gZXhwbGljaXQgbnVtZXJpYyBpbmRleCBpcyB1c2VkLFxuLy8gICAgdGhlIGluZGV4IHdpbGwgYmUgZm9sbG93ZWQgaW4gYXJyYXlJbmRpY2VzIGJ5IHRoZSBzdHJpbmcgJ3gnLlxuLy9cbi8vICAgIE5vdGU6IGFycmF5SW5kaWNlcyBpcyB1c2VkIGZvciB0d28gcHVycG9zZXMuIEZpcnN0LCBpdCBpcyB1c2VkIHRvXG4vLyAgICBpbXBsZW1lbnQgdGhlICckJyBtb2RpZmllciBmZWF0dXJlLCB3aGljaCBvbmx5IGV2ZXIgbG9va3MgYXQgaXRzIGZpcnN0XG4vLyAgICBlbGVtZW50LlxuLy9cbi8vICAgIFNlY29uZCwgaXQgaXMgdXNlZCBmb3Igc29ydCBrZXkgZ2VuZXJhdGlvbiwgd2hpY2ggbmVlZHMgdG8gYmUgYWJsZSB0byB0ZWxsXG4vLyAgICB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGRpZmZlcmVudCBwYXRocy4gTW9yZW92ZXIsIGl0IG5lZWRzIHRvXG4vLyAgICBkaWZmZXJlbnRpYXRlIGJldHdlZW4gZXhwbGljaXQgYW5kIGltcGxpY2l0IGJyYW5jaGluZywgd2hpY2ggaXMgd2h5XG4vLyAgICB0aGVyZSdzIHRoZSBzb21ld2hhdCBoYWNreSAneCcgZW50cnk6IHRoaXMgbWVhbnMgdGhhdCBleHBsaWNpdCBhbmRcbi8vICAgIGltcGxpY2l0IGFycmF5IGxvb2t1cHMgd2lsbCBoYXZlIGRpZmZlcmVudCBmdWxsIGFycmF5SW5kaWNlcyBwYXRocy4gKFRoYXRcbi8vICAgIGNvZGUgb25seSByZXF1aXJlcyB0aGF0IGRpZmZlcmVudCBwYXRocyBoYXZlIGRpZmZlcmVudCBhcnJheUluZGljZXM7IGl0XG4vLyAgICBkb2Vzbid0IGFjdHVhbGx5ICdwYXJzZScgYXJyYXlJbmRpY2VzLiBBcyBhbiBhbHRlcm5hdGl2ZSwgYXJyYXlJbmRpY2VzXG4vLyAgICBjb3VsZCBjb250YWluIG9iamVjdHMgd2l0aCBmbGFncyBsaWtlICdpbXBsaWNpdCcsIGJ1dCBJIHRoaW5rIHRoYXQgb25seVxuLy8gICAgbWFrZXMgdGhlIGNvZGUgc3Vycm91bmRpbmcgdGhlbSBtb3JlIGNvbXBsZXguKVxuLy9cbi8vICAgIChCeSB0aGUgd2F5LCB0aGlzIGZpZWxkIGVuZHMgdXAgZ2V0dGluZyBwYXNzZWQgYXJvdW5kIGEgbG90IHdpdGhvdXRcbi8vICAgIGNsb25pbmcsIHNvIG5ldmVyIG11dGF0ZSBhbnkgYXJyYXlJbmRpY2VzIGZpZWxkL3ZhciBpbiB0aGlzIHBhY2thZ2UhKVxuLy9cbi8vXG4vLyBBdCB0aGUgdG9wIGxldmVsLCB5b3UgbWF5IG9ubHkgcGFzcyBpbiBhIHBsYWluIG9iamVjdCBvciBhcnJheS5cbi8vXG4vLyBTZWUgdGhlIHRlc3QgJ21pbmltb25nbyAtIGxvb2t1cCcgZm9yIHNvbWUgZXhhbXBsZXMgb2Ygd2hhdCBsb29rdXAgZnVuY3Rpb25zXG4vLyByZXR1cm4uXG5leHBvcnQgZnVuY3Rpb24gbWFrZUxvb2t1cEZ1bmN0aW9uKGtleSwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGZpcnN0UGFydCA9IHBhcnRzLmxlbmd0aCA/IHBhcnRzWzBdIDogJyc7XG4gIGNvbnN0IGxvb2t1cFJlc3QgPSAoXG4gICAgcGFydHMubGVuZ3RoID4gMSAmJlxuICAgIG1ha2VMb29rdXBGdW5jdGlvbihwYXJ0cy5zbGljZSgxKS5qb2luKCcuJyksIG9wdGlvbnMpXG4gICk7XG5cbiAgZnVuY3Rpb24gYnVpbGRSZXN1bHQoYXJyYXlJbmRpY2VzLCBkb250SXRlcmF0ZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gYXJyYXlJbmRpY2VzICYmIGFycmF5SW5kaWNlcy5sZW5ndGhcbiAgICAgID8gZG9udEl0ZXJhdGVcbiAgICAgICAgPyBbeyBhcnJheUluZGljZXMsIGRvbnRJdGVyYXRlLCB2YWx1ZSB9XVxuICAgICAgICA6IFt7IGFycmF5SW5kaWNlcywgdmFsdWUgfV1cbiAgICAgIDogZG9udEl0ZXJhdGVcbiAgICAgICAgPyBbeyBkb250SXRlcmF0ZSwgdmFsdWUgfV1cbiAgICAgICAgOiBbeyB2YWx1ZSB9XTtcbiAgfVxuXG4gIC8vIERvYyB3aWxsIGFsd2F5cyBiZSBhIHBsYWluIG9iamVjdCBvciBhbiBhcnJheS5cbiAgLy8gYXBwbHkgYW4gZXhwbGljaXQgbnVtZXJpYyBpbmRleCwgYW4gYXJyYXkuXG4gIHJldHVybiAoZG9jLCBhcnJheUluZGljZXMpID0+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkb2MpKSB7XG4gICAgICAvLyBJZiB3ZSdyZSBiZWluZyBhc2tlZCB0byBkbyBhbiBpbnZhbGlkIGxvb2t1cCBpbnRvIGFuIGFycmF5IChub24taW50ZWdlclxuICAgICAgLy8gb3Igb3V0LW9mLWJvdW5kcyksIHJldHVybiBubyByZXN1bHRzICh3aGljaCBpcyBkaWZmZXJlbnQgZnJvbSByZXR1cm5pbmdcbiAgICAgIC8vIGEgc2luZ2xlIHVuZGVmaW5lZCByZXN1bHQsIGluIHRoYXQgYG51bGxgIGVxdWFsaXR5IGNoZWNrcyB3b24ndCBtYXRjaCkuXG4gICAgICBpZiAoIShpc051bWVyaWNLZXkoZmlyc3RQYXJ0KSAmJiBmaXJzdFBhcnQgPCBkb2MubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbWVtYmVyIHRoYXQgd2UgdXNlZCB0aGlzIGFycmF5IGluZGV4LiBJbmNsdWRlIGFuICd4JyB0byBpbmRpY2F0ZSB0aGF0XG4gICAgICAvLyB0aGUgcHJldmlvdXMgaW5kZXggY2FtZSBmcm9tIGJlaW5nIGNvbnNpZGVyZWQgYXMgYW4gZXhwbGljaXQgYXJyYXlcbiAgICAgIC8vIGluZGV4IChub3QgYnJhbmNoaW5nKS5cbiAgICAgIGFycmF5SW5kaWNlcyA9IGFycmF5SW5kaWNlcyA/IGFycmF5SW5kaWNlcy5jb25jYXQoK2ZpcnN0UGFydCwgJ3gnKSA6IFsrZmlyc3RQYXJ0LCAneCddO1xuICAgIH1cblxuICAgIC8vIERvIG91ciBmaXJzdCBsb29rdXAuXG4gICAgY29uc3QgZmlyc3RMZXZlbCA9IGRvY1tmaXJzdFBhcnRdO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZGVlcGVyIHRvIGRpZywgcmV0dXJuIHdoYXQgd2UgZm91bmQuXG4gICAgLy9cbiAgICAvLyBJZiB3aGF0IHdlIGZvdW5kIGlzIGFuIGFycmF5LCBtb3N0IHZhbHVlIHNlbGVjdG9ycyB3aWxsIGNob29zZSB0byB0cmVhdFxuICAgIC8vIHRoZSBlbGVtZW50cyBvZiB0aGUgYXJyYXkgYXMgbWF0Y2hhYmxlIHZhbHVlcyBpbiB0aGVpciBvd24gcmlnaHQsIGJ1dFxuICAgIC8vIHRoYXQncyBkb25lIG91dHNpZGUgb2YgdGhlIGxvb2t1cCBmdW5jdGlvbi4gKEV4Y2VwdGlvbnMgdG8gdGhpcyBhcmUgJHNpemVcbiAgICAvLyBhbmQgc3R1ZmYgcmVsYXRpbmcgdG8gJGVsZW1NYXRjaC4gIGVnLCB7YTogeyRzaXplOiAyfX0gZG9lcyBub3QgbWF0Y2gge2E6XG4gICAgLy8gW1sxLCAyXV19LilcbiAgICAvL1xuICAgIC8vIFRoYXQgc2FpZCwgaWYgd2UganVzdCBkaWQgYW4gKmV4cGxpY2l0KiBhcnJheSBsb29rdXAgKG9uIGRvYykgdG8gZmluZFxuICAgIC8vIGZpcnN0TGV2ZWwsIGFuZCBmaXJzdExldmVsIGlzIGFuIGFycmF5IHRvbywgd2UgZG8gTk9UIHdhbnQgdmFsdWVcbiAgICAvLyBzZWxlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyIGl0LiAgZWcsIHsnYS4wJzogNX0gZG9lcyBub3QgbWF0Y2gge2E6IFtbNV1dfS5cbiAgICAvLyBTbyBpbiB0aGF0IGNhc2UsIHdlIG1hcmsgdGhlIHJldHVybiB2YWx1ZSBhcyAnZG9uJ3QgaXRlcmF0ZScuXG4gICAgaWYgKCFsb29rdXBSZXN0KSB7XG4gICAgICByZXR1cm4gYnVpbGRSZXN1bHQoXG4gICAgICAgIGFycmF5SW5kaWNlcyxcbiAgICAgICAgQXJyYXkuaXNBcnJheShkb2MpICYmIEFycmF5LmlzQXJyYXkoZmlyc3RMZXZlbCksXG4gICAgICAgIGZpcnN0TGV2ZWwsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gZGlnIGRlZXBlci4gIEJ1dCBpZiB3ZSBjYW4ndCwgYmVjYXVzZSB3aGF0IHdlJ3ZlIGZvdW5kIGlzIG5vdFxuICAgIC8vIGFuIGFycmF5IG9yIHBsYWluIG9iamVjdCwgd2UncmUgZG9uZS4gSWYgd2UganVzdCBkaWQgYSBudW1lcmljIGluZGV4IGludG9cbiAgICAvLyBhbiBhcnJheSwgd2UgcmV0dXJuIG5vdGhpbmcgaGVyZSAodGhpcyBpcyBhIGNoYW5nZSBpbiBNb25nbyAyLjUgZnJvbVxuICAgIC8vIE1vbmdvIDIuNCwgd2hlcmUgeydhLjAuYic6IG51bGx9IHN0b3BwZWQgbWF0Y2hpbmcge2E6IFs1XX0pLiBPdGhlcndpc2UsXG4gICAgLy8gcmV0dXJuIGEgc2luZ2xlIGB1bmRlZmluZWRgICh3aGljaCBjYW4sIGZvciBleGFtcGxlLCBtYXRjaCB2aWEgZXF1YWxpdHlcbiAgICAvLyB3aXRoIGBudWxsYCkuXG4gICAgaWYgKCFpc0luZGV4YWJsZShmaXJzdExldmVsKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZG9jKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWlsZFJlc3VsdChhcnJheUluZGljZXMsIGZhbHNlLCB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IGFwcGVuZFRvUmVzdWx0ID0gbW9yZSA9PiB7XG4gICAgICByZXN1bHQucHVzaCguLi5tb3JlKTtcbiAgICB9O1xuXG4gICAgLy8gRGlnIGRlZXBlcjogbG9vayB1cCB0aGUgcmVzdCBvZiB0aGUgcGFydHMgb24gd2hhdGV2ZXIgd2UndmUgZm91bmQuXG4gICAgLy8gKGxvb2t1cFJlc3QgaXMgc21hcnQgZW5vdWdoIHRvIG5vdCB0cnkgdG8gZG8gaW52YWxpZCBsb29rdXBzIGludG9cbiAgICAvLyBmaXJzdExldmVsIGlmIGl0J3MgYW4gYXJyYXkuKVxuICAgIGFwcGVuZFRvUmVzdWx0KGxvb2t1cFJlc3QoZmlyc3RMZXZlbCwgYXJyYXlJbmRpY2VzKSk7XG5cbiAgICAvLyBJZiB3ZSBmb3VuZCBhbiBhcnJheSwgdGhlbiBpbiAqYWRkaXRpb24qIHRvIHBvdGVudGlhbGx5IHRyZWF0aW5nIHRoZSBuZXh0XG4gICAgLy8gcGFydCBhcyBhIGxpdGVyYWwgaW50ZWdlciBsb29rdXAsIHdlIHNob3VsZCBhbHNvICdicmFuY2gnOiB0cnkgdG8gbG9vayB1cFxuICAgIC8vIHRoZSByZXN0IG9mIHRoZSBwYXJ0cyBvbiBlYWNoIGFycmF5IGVsZW1lbnQgaW4gcGFyYWxsZWwuXG4gICAgLy9cbiAgICAvLyBJbiB0aGlzIGNhc2UsIHdlICpvbmx5KiBkaWcgZGVlcGVyIGludG8gYXJyYXkgZWxlbWVudHMgdGhhdCBhcmUgcGxhaW5cbiAgICAvLyBvYmplY3RzLiAoUmVjYWxsIHRoYXQgd2Ugb25seSBnb3QgdGhpcyBmYXIgaWYgd2UgaGF2ZSBmdXJ0aGVyIHRvIGRpZy4pXG4gICAgLy8gVGhpcyBtYWtlcyBzZW5zZTogd2UgY2VydGFpbmx5IGRvbid0IGRpZyBkZWVwZXIgaW50byBub24taW5kZXhhYmxlXG4gICAgLy8gb2JqZWN0cy4gQW5kIGl0IHdvdWxkIGJlIHdlaXJkIHRvIGRpZyBpbnRvIGFuIGFycmF5OiBpdCdzIHNpbXBsZXIgdG8gaGF2ZVxuICAgIC8vIGEgcnVsZSB0aGF0IGV4cGxpY2l0IGludGVnZXIgaW5kZXhlcyBvbmx5IGFwcGx5IHRvIGFuIG91dGVyIGFycmF5LCBub3QgdG9cbiAgICAvLyBhbiBhcnJheSB5b3UgZmluZCBhZnRlciBhIGJyYW5jaGluZyBzZWFyY2guXG4gICAgLy9cbiAgICAvLyBJbiB0aGUgc3BlY2lhbCBjYXNlIG9mIGEgbnVtZXJpYyBwYXJ0IGluIGEgKnNvcnQgc2VsZWN0b3IqIChub3QgYSBxdWVyeVxuICAgIC8vIHNlbGVjdG9yKSwgd2Ugc2tpcCB0aGUgYnJhbmNoaW5nOiB3ZSBPTkxZIGFsbG93IHRoZSBudW1lcmljIHBhcnQgdG8gbWVhblxuICAgIC8vICdsb29rIHVwIHRoaXMgaW5kZXgnIGluIHRoYXQgY2FzZSwgbm90ICdhbHNvIGxvb2sgdXAgdGhpcyBpbmRleCBpbiBhbGxcbiAgICAvLyB0aGUgZWxlbWVudHMgb2YgdGhlIGFycmF5Jy5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmaXJzdExldmVsKSAmJlxuICAgICAgICAhKGlzTnVtZXJpY0tleShwYXJ0c1sxXSkgJiYgb3B0aW9ucy5mb3JTb3J0KSkge1xuICAgICAgZmlyc3RMZXZlbC5mb3JFYWNoKChicmFuY2gsIGFycmF5SW5kZXgpID0+IHtcbiAgICAgICAgaWYgKExvY2FsQ29sbGVjdGlvbi5faXNQbGFpbk9iamVjdChicmFuY2gpKSB7XG4gICAgICAgICAgYXBwZW5kVG9SZXN1bHQobG9va3VwUmVzdChicmFuY2gsIGFycmF5SW5kaWNlcyA/IGFycmF5SW5kaWNlcy5jb25jYXQoYXJyYXlJbmRleCkgOiBbYXJyYXlJbmRleF0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxuLy8gT2JqZWN0IGV4cG9ydGVkIG9ubHkgZm9yIHVuaXQgdGVzdGluZy5cbi8vIFVzZSBpdCB0byBleHBvcnQgcHJpdmF0ZSBmdW5jdGlvbnMgdG8gdGVzdCBpbiBUaW55dGVzdC5cbk1pbmltb25nb1Rlc3QgPSB7bWFrZUxvb2t1cEZ1bmN0aW9ufTtcbk1pbmltb25nb0Vycm9yID0gKG1lc3NhZ2UsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG9wdGlvbnMuZmllbGQpIHtcbiAgICBtZXNzYWdlICs9IGAgZm9yIGZpZWxkICcke29wdGlvbnMuZmllbGR9J2A7XG4gIH1cblxuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgZXJyb3IubmFtZSA9ICdNaW5pbW9uZ29FcnJvcic7XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RoaW5nTWF0Y2hlcihkb2NPckJyYW5jaGVkVmFsdWVzKSB7XG4gIHJldHVybiB7cmVzdWx0OiBmYWxzZX07XG59XG5cbi8vIFRha2VzIGFuIG9wZXJhdG9yIG9iamVjdCAoYW4gb2JqZWN0IHdpdGggJCBrZXlzKSBhbmQgcmV0dXJucyBhIGJyYW5jaGVkXG4vLyBtYXRjaGVyIGZvciBpdC5cbmZ1bmN0aW9uIG9wZXJhdG9yQnJhbmNoZWRNYXRjaGVyKHZhbHVlU2VsZWN0b3IsIG1hdGNoZXIsIGlzUm9vdCkge1xuICAvLyBFYWNoIHZhbHVlU2VsZWN0b3Igd29ya3Mgc2VwYXJhdGVseSBvbiB0aGUgdmFyaW91cyBicmFuY2hlcy4gIFNvIG9uZVxuICAvLyBvcGVyYXRvciBjYW4gbWF0Y2ggb25lIGJyYW5jaCBhbmQgYW5vdGhlciBjYW4gbWF0Y2ggYW5vdGhlciBicmFuY2guICBUaGlzXG4gIC8vIGlzIE9LLlxuICBjb25zdCBvcGVyYXRvck1hdGNoZXJzID0gT2JqZWN0LmtleXModmFsdWVTZWxlY3RvcikubWFwKG9wZXJhdG9yID0+IHtcbiAgICBjb25zdCBvcGVyYW5kID0gdmFsdWVTZWxlY3RvcltvcGVyYXRvcl07XG5cbiAgICBjb25zdCBzaW1wbGVSYW5nZSA9IChcbiAgICAgIFsnJGx0JywgJyRsdGUnLCAnJGd0JywgJyRndGUnXS5pbmNsdWRlcyhvcGVyYXRvcikgJiZcbiAgICAgIHR5cGVvZiBvcGVyYW5kID09PSAnbnVtYmVyJ1xuICAgICk7XG5cbiAgICBjb25zdCBzaW1wbGVFcXVhbGl0eSA9IChcbiAgICAgIFsnJG5lJywgJyRlcSddLmluY2x1ZGVzKG9wZXJhdG9yKSAmJlxuICAgICAgb3BlcmFuZCAhPT0gT2JqZWN0KG9wZXJhbmQpXG4gICAgKTtcblxuICAgIGNvbnN0IHNpbXBsZUluY2x1c2lvbiA9IChcbiAgICAgIFsnJGluJywgJyRuaW4nXS5pbmNsdWRlcyhvcGVyYXRvcilcbiAgICAgICYmIEFycmF5LmlzQXJyYXkob3BlcmFuZClcbiAgICAgICYmICFvcGVyYW5kLnNvbWUoeCA9PiB4ID09PSBPYmplY3QoeCkpXG4gICAgKTtcblxuICAgIGlmICghKHNpbXBsZVJhbmdlIHx8IHNpbXBsZUluY2x1c2lvbiB8fCBzaW1wbGVFcXVhbGl0eSkpIHtcbiAgICAgIG1hdGNoZXIuX2lzU2ltcGxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGhhc093bi5jYWxsKFZBTFVFX09QRVJBVE9SUywgb3BlcmF0b3IpKSB7XG4gICAgICByZXR1cm4gVkFMVUVfT1BFUkFUT1JTW29wZXJhdG9yXShvcGVyYW5kLCB2YWx1ZVNlbGVjdG9yLCBtYXRjaGVyLCBpc1Jvb3QpO1xuICAgIH1cblxuICAgIGlmIChoYXNPd24uY2FsbChFTEVNRU5UX09QRVJBVE9SUywgb3BlcmF0b3IpKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gRUxFTUVOVF9PUEVSQVRPUlNbb3BlcmF0b3JdO1xuICAgICAgcmV0dXJuIGNvbnZlcnRFbGVtZW50TWF0Y2hlclRvQnJhbmNoZWRNYXRjaGVyKFxuICAgICAgICBvcHRpb25zLmNvbXBpbGVFbGVtZW50U2VsZWN0b3Iob3BlcmFuZCwgdmFsdWVTZWxlY3RvciwgbWF0Y2hlciksXG4gICAgICAgIG9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IE1pbmlNb25nb1F1ZXJ5RXJyb3IoYFVucmVjb2duaXplZCBvcGVyYXRvcjogJHtvcGVyYXRvcn1gKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGFuZEJyYW5jaGVkTWF0Y2hlcnMob3BlcmF0b3JNYXRjaGVycyk7XG59XG5cbi8vIHBhdGhzIC0gQXJyYXk6IGxpc3Qgb2YgbW9uZ28gc3R5bGUgcGF0aHNcbi8vIG5ld0xlYWZGbiAtIEZ1bmN0aW9uOiBvZiBmb3JtIGZ1bmN0aW9uKHBhdGgpIHNob3VsZCByZXR1cm4gYSBzY2FsYXIgdmFsdWUgdG9cbi8vICAgICAgICAgICAgICAgICAgICAgICBwdXQgaW50byBsaXN0IGNyZWF0ZWQgZm9yIHRoYXQgcGF0aFxuLy8gY29uZmxpY3RGbiAtIEZ1bmN0aW9uOiBvZiBmb3JtIGZ1bmN0aW9uKG5vZGUsIHBhdGgsIGZ1bGxQYXRoKSBpcyBjYWxsZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBidWlsZGluZyBhIHRyZWUgcGF0aCBmb3IgJ2Z1bGxQYXRoJyBub2RlIG9uXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICdwYXRoJyB3YXMgYWxyZWFkeSBhIGxlYWYgd2l0aCBhIHZhbHVlLiBNdXN0IHJldHVybiBhXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZsaWN0IHJlc29sdXRpb24uXG4vLyBpbml0aWFsIHRyZWUgLSBPcHRpb25hbCBPYmplY3Q6IHN0YXJ0aW5nIHRyZWUuXG4vLyBAcmV0dXJucyAtIE9iamVjdDogdHJlZSByZXByZXNlbnRlZCBhcyBhIHNldCBvZiBuZXN0ZWQgb2JqZWN0c1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGhzVG9UcmVlKHBhdGhzLCBuZXdMZWFmRm4sIGNvbmZsaWN0Rm4sIHJvb3QgPSB7fSkge1xuICBwYXRocy5mb3JFYWNoKHBhdGggPT4ge1xuICAgIGNvbnN0IHBhdGhBcnJheSA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICBsZXQgdHJlZSA9IHJvb3Q7XG5cbiAgICAvLyB1c2UgLmV2ZXJ5IGp1c3QgZm9yIGl0ZXJhdGlvbiB3aXRoIGJyZWFrXG4gICAgY29uc3Qgc3VjY2VzcyA9IHBhdGhBcnJheS5zbGljZSgwLCAtMSkuZXZlcnkoKGtleSwgaSkgPT4ge1xuICAgICAgaWYgKCFoYXNPd24uY2FsbCh0cmVlLCBrZXkpKSB7XG4gICAgICAgIHRyZWVba2V5XSA9IHt9O1xuICAgICAgfSBlbHNlIGlmICh0cmVlW2tleV0gIT09IE9iamVjdCh0cmVlW2tleV0pKSB7XG4gICAgICAgIHRyZWVba2V5XSA9IGNvbmZsaWN0Rm4oXG4gICAgICAgICAgdHJlZVtrZXldLFxuICAgICAgICAgIHBhdGhBcnJheS5zbGljZSgwLCBpICsgMSkuam9pbignLicpLFxuICAgICAgICAgIHBhdGhcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBicmVhayBvdXQgb2YgbG9vcCBpZiB3ZSBhcmUgZmFpbGluZyBmb3IgdGhpcyBwYXRoXG4gICAgICAgIGlmICh0cmVlW2tleV0gIT09IE9iamVjdCh0cmVlW2tleV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRyZWUgPSB0cmVlW2tleV07XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IGxhc3RLZXkgPSBwYXRoQXJyYXlbcGF0aEFycmF5Lmxlbmd0aCAtIDFdO1xuICAgICAgaWYgKGhhc093bi5jYWxsKHRyZWUsIGxhc3RLZXkpKSB7XG4gICAgICAgIHRyZWVbbGFzdEtleV0gPSBjb25mbGljdEZuKHRyZWVbbGFzdEtleV0sIHBhdGgsIHBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJlZVtsYXN0S2V5XSA9IG5ld0xlYWZGbihwYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByb290O1xufVxuXG4vLyBNYWtlcyBzdXJlIHdlIGdldCAyIGVsZW1lbnRzIGFycmF5IGFuZCBhc3N1bWUgdGhlIGZpcnN0IG9uZSB0byBiZSB4IGFuZFxuLy8gdGhlIHNlY29uZCBvbmUgdG8geSBubyBtYXR0ZXIgd2hhdCB1c2VyIHBhc3Nlcy5cbi8vIEluIGNhc2UgdXNlciBwYXNzZXMgeyBsb246IHgsIGxhdDogeSB9IHJldHVybnMgW3gsIHldXG5mdW5jdGlvbiBwb2ludFRvQXJyYXkocG9pbnQpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkocG9pbnQpID8gcG9pbnQuc2xpY2UoKSA6IFtwb2ludC54LCBwb2ludC55XTtcbn1cblxuLy8gQ3JlYXRpbmcgYSBkb2N1bWVudCBmcm9tIGFuIHVwc2VydCBpcyBxdWl0ZSB0cmlja3kuXG4vLyBFLmcuIHRoaXMgc2VsZWN0b3I6IHtcIiRvclwiOiBbe1wiYi5mb29cIjoge1wiJGFsbFwiOiBbXCJiYXJcIl19fV19LCBzaG91bGQgcmVzdWx0XG4vLyBpbjoge1wiYi5mb29cIjogXCJiYXJcIn1cbi8vIEJ1dCB0aGlzIHNlbGVjdG9yOiB7XCIkb3JcIjogW3tcImJcIjoge1wiZm9vXCI6IHtcIiRhbGxcIjogW1wiYmFyXCJdfX19XX0gc2hvdWxkIHRocm93XG4vLyBhbiBlcnJvclxuXG4vLyBTb21lIHJ1bGVzIChmb3VuZCBtYWlubHkgd2l0aCB0cmlhbCAmIGVycm9yLCBzbyB0aGVyZSBtaWdodCBiZSBtb3JlKTpcbi8vIC0gaGFuZGxlIGFsbCBjaGlsZHMgb2YgJGFuZCAob3IgaW1wbGljaXQgJGFuZClcbi8vIC0gaGFuZGxlICRvciBub2RlcyB3aXRoIGV4YWN0bHkgMSBjaGlsZFxuLy8gLSBpZ25vcmUgJG9yIG5vZGVzIHdpdGggbW9yZSB0aGFuIDEgY2hpbGRcbi8vIC0gaWdub3JlICRub3IgYW5kICRub3Qgbm9kZXNcbi8vIC0gdGhyb3cgd2hlbiBhIHZhbHVlIGNhbiBub3QgYmUgc2V0IHVuYW1iaWd1b3VzbHlcbi8vIC0gZXZlcnkgdmFsdWUgZm9yICRhbGwgc2hvdWxkIGJlIGRlYWx0IHdpdGggYXMgc2VwYXJhdGUgJGVxLXNcbi8vIC0gdGhyZWF0IGFsbCBjaGlsZHJlbiBvZiAkYWxsIGFzICRlcSBzZXR0ZXJzICg9PiBzZXQgaWYgJGFsbC5sZW5ndGggPT09IDEsXG4vLyAgIG90aGVyd2lzZSB0aHJvdyBlcnJvcilcbi8vIC0geW91IGNhbiBub3QgbWl4ICckJy1wcmVmaXhlZCBrZXlzIGFuZCBub24tJyQnLXByZWZpeGVkIGtleXNcbi8vIC0geW91IGNhbiBvbmx5IGhhdmUgZG90dGVkIGtleXMgb24gYSByb290LWxldmVsXG4vLyAtIHlvdSBjYW4gbm90IGhhdmUgJyQnLXByZWZpeGVkIGtleXMgbW9yZSB0aGFuIG9uZS1sZXZlbCBkZWVwIGluIGFuIG9iamVjdFxuXG4vLyBIYW5kbGVzIG9uZSBrZXkvdmFsdWUgcGFpciB0byBwdXQgaW4gdGhlIHNlbGVjdG9yIGRvY3VtZW50XG5mdW5jdGlvbiBwb3B1bGF0ZURvY3VtZW50V2l0aEtleVZhbHVlKGRvY3VtZW50LCBrZXksIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpID09PSBPYmplY3QucHJvdG90eXBlKSB7XG4gICAgcG9wdWxhdGVEb2N1bWVudFdpdGhPYmplY3QoZG9jdW1lbnQsIGtleSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG4gICAgaW5zZXJ0SW50b0RvY3VtZW50KGRvY3VtZW50LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG4vLyBIYW5kbGVzIGEga2V5LCB2YWx1ZSBwYWlyIHRvIHB1dCBpbiB0aGUgc2VsZWN0b3IgZG9jdW1lbnRcbi8vIGlmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3RcbmZ1bmN0aW9uIHBvcHVsYXRlRG9jdW1lbnRXaXRoT2JqZWN0KGRvY3VtZW50LCBrZXksIHZhbHVlKSB7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIGNvbnN0IHVucHJlZml4ZWRLZXlzID0ga2V5cy5maWx0ZXIob3AgPT4gb3BbMF0gIT09ICckJyk7XG5cbiAgaWYgKHVucHJlZml4ZWRLZXlzLmxlbmd0aCA+IDAgfHwgIWtleXMubGVuZ3RoKSB7XG4gICAgLy8gTGl0ZXJhbCAocG9zc2libHkgZW1wdHkpIG9iamVjdCAoIG9yIGVtcHR5IG9iamVjdCApXG4gICAgLy8gRG9uJ3QgYWxsb3cgbWl4aW5nICckJy1wcmVmaXhlZCB3aXRoIG5vbi0nJCctcHJlZml4ZWQgZmllbGRzXG4gICAgaWYgKGtleXMubGVuZ3RoICE9PSB1bnByZWZpeGVkS2V5cy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBNaW5pTW9uZ29RdWVyeUVycm9yKGB1bmtub3duIG9wZXJhdG9yOiAke3VucHJlZml4ZWRLZXlzWzBdfWApO1xuICAgIH1cblxuICAgIHZhbGlkYXRlT2JqZWN0KHZhbHVlLCBrZXkpO1xuICAgIGluc2VydEludG9Eb2N1bWVudChkb2N1bWVudCwga2V5LCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2gob3AgPT4ge1xuICAgICAgY29uc3Qgb2JqZWN0ID0gdmFsdWVbb3BdO1xuXG4gICAgICBpZiAob3AgPT09ICckZXEnKSB7XG4gICAgICAgIHBvcHVsYXRlRG9jdW1lbnRXaXRoS2V5VmFsdWUoZG9jdW1lbnQsIGtleSwgb2JqZWN0KTtcbiAgICAgIH0gZWxzZSBpZiAob3AgPT09ICckYWxsJykge1xuICAgICAgICAvLyBldmVyeSB2YWx1ZSBmb3IgJGFsbCBzaG91bGQgYmUgZGVhbHQgd2l0aCBhcyBzZXBhcmF0ZSAkZXEtc1xuICAgICAgICBvYmplY3QuZm9yRWFjaChlbGVtZW50ID0+XG4gICAgICAgICAgcG9wdWxhdGVEb2N1bWVudFdpdGhLZXlWYWx1ZShkb2N1bWVudCwga2V5LCBlbGVtZW50KVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8vIEZpbGxzIGEgZG9jdW1lbnQgd2l0aCBjZXJ0YWluIGZpZWxkcyBmcm9tIGFuIHVwc2VydCBzZWxlY3RvclxuZXhwb3J0IGZ1bmN0aW9uIHBvcHVsYXRlRG9jdW1lbnRXaXRoUXVlcnlGaWVsZHMocXVlcnksIGRvY3VtZW50ID0ge30pIHtcbiAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihxdWVyeSkgPT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAvLyBoYW5kbGUgaW1wbGljaXQgJGFuZFxuICAgIE9iamVjdC5rZXlzKHF1ZXJ5KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHF1ZXJ5W2tleV07XG5cbiAgICAgIGlmIChrZXkgPT09ICckYW5kJykge1xuICAgICAgICAvLyBoYW5kbGUgZXhwbGljaXQgJGFuZFxuICAgICAgICB2YWx1ZS5mb3JFYWNoKGVsZW1lbnQgPT5cbiAgICAgICAgICBwb3B1bGF0ZURvY3VtZW50V2l0aFF1ZXJ5RmllbGRzKGVsZW1lbnQsIGRvY3VtZW50KVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICckb3InKSB7XG4gICAgICAgIC8vIGhhbmRsZSAkb3Igbm9kZXMgd2l0aCBleGFjdGx5IDEgY2hpbGRcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHBvcHVsYXRlRG9jdW1lbnRXaXRoUXVlcnlGaWVsZHModmFsdWVbMF0sIGRvY3VtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXlbMF0gIT09ICckJykge1xuICAgICAgICAvLyBJZ25vcmUgb3RoZXIgJyQnLXByZWZpeGVkIGxvZ2ljYWwgc2VsZWN0b3JzXG4gICAgICAgIHBvcHVsYXRlRG9jdW1lbnRXaXRoS2V5VmFsdWUoZG9jdW1lbnQsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIEhhbmRsZSBtZXRlb3Itc3BlY2lmaWMgc2hvcnRjdXQgZm9yIHNlbGVjdGluZyBfaWRcbiAgICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9zZWxlY3RvcklzSWQocXVlcnkpKSB7XG4gICAgICBpbnNlcnRJbnRvRG9jdW1lbnQoZG9jdW1lbnQsICdfaWQnLCBxdWVyeSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRvY3VtZW50O1xufVxuXG4vLyBUcmF2ZXJzZXMgdGhlIGtleXMgb2YgcGFzc2VkIHByb2plY3Rpb24gYW5kIGNvbnN0cnVjdHMgYSB0cmVlIHdoZXJlIGFsbFxuLy8gbGVhdmVzIGFyZSBlaXRoZXIgYWxsIFRydWUgb3IgYWxsIEZhbHNlXG4vLyBAcmV0dXJucyBPYmplY3Q6XG4vLyAgLSB0cmVlIC0gT2JqZWN0IC0gdHJlZSByZXByZXNlbnRhdGlvbiBvZiBrZXlzIGludm9sdmVkIGluIHByb2plY3Rpb25cbi8vICAoZXhjZXB0aW9uIGZvciAnX2lkJyBhcyBpdCBpcyBhIHNwZWNpYWwgY2FzZSBoYW5kbGVkIHNlcGFyYXRlbHkpXG4vLyAgLSBpbmNsdWRpbmcgLSBCb29sZWFuIC0gXCJ0YWtlIG9ubHkgY2VydGFpbiBmaWVsZHNcIiB0eXBlIG9mIHByb2plY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uRGV0YWlscyhmaWVsZHMpIHtcbiAgLy8gRmluZCB0aGUgbm9uLV9pZCBrZXlzIChfaWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYmVjYXVzZSBpdCBpcyBpbmNsdWRlZFxuICAvLyB1bmxlc3MgZXhwbGljaXRseSBleGNsdWRlZCkuIFNvcnQgdGhlIGtleXMsIHNvIHRoYXQgb3VyIGNvZGUgdG8gZGV0ZWN0XG4gIC8vIG92ZXJsYXBzIGxpa2UgJ2ZvbycgYW5kICdmb28uYmFyJyBjYW4gYXNzdW1lIHRoYXQgJ2ZvbycgY29tZXMgZmlyc3QuXG4gIGxldCBmaWVsZHNLZXlzID0gT2JqZWN0LmtleXMoZmllbGRzKS5zb3J0KCk7XG5cbiAgLy8gSWYgX2lkIGlzIHRoZSBvbmx5IGZpZWxkIGluIHRoZSBwcm9qZWN0aW9uLCBkbyBub3QgcmVtb3ZlIGl0LCBzaW5jZSBpdCBpc1xuICAvLyByZXF1aXJlZCB0byBkZXRlcm1pbmUgaWYgdGhpcyBpcyBhbiBleGNsdXNpb24gb3IgZXhjbHVzaW9uLiBBbHNvIGtlZXAgYW5cbiAgLy8gaW5jbHVzaXZlIF9pZCwgc2luY2UgaW5jbHVzaXZlIF9pZCBmb2xsb3dzIHRoZSBub3JtYWwgcnVsZXMgYWJvdXQgbWl4aW5nXG4gIC8vIGluY2x1c2l2ZSBhbmQgZXhjbHVzaXZlIGZpZWxkcy4gSWYgX2lkIGlzIG5vdCB0aGUgb25seSBmaWVsZCBpbiB0aGVcbiAgLy8gcHJvamVjdGlvbiBhbmQgaXMgZXhjbHVzaXZlLCByZW1vdmUgaXQgc28gaXQgY2FuIGJlIGhhbmRsZWQgbGF0ZXIgYnkgYVxuICAvLyBzcGVjaWFsIGNhc2UsIHNpbmNlIGV4Y2x1c2l2ZSBfaWQgaXMgYWx3YXlzIGFsbG93ZWQuXG4gIGlmICghKGZpZWxkc0tleXMubGVuZ3RoID09PSAxICYmIGZpZWxkc0tleXNbMF0gPT09ICdfaWQnKSAmJlxuICAgICAgIShmaWVsZHNLZXlzLmluY2x1ZGVzKCdfaWQnKSAmJiBmaWVsZHMuX2lkKSkge1xuICAgIGZpZWxkc0tleXMgPSBmaWVsZHNLZXlzLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAnX2lkJyk7XG4gIH1cblxuICBsZXQgaW5jbHVkaW5nID0gbnVsbDsgLy8gVW5rbm93blxuXG4gIGZpZWxkc0tleXMuZm9yRWFjaChrZXlQYXRoID0+IHtcbiAgICBjb25zdCBydWxlID0gISFmaWVsZHNba2V5UGF0aF07XG5cbiAgICBpZiAoaW5jbHVkaW5nID09PSBudWxsKSB7XG4gICAgICBpbmNsdWRpbmcgPSBydWxlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZXJyb3IgbWVzc2FnZSBpcyBjb3BpZWQgZnJvbSBNb25nb0RCIHNoZWxsXG4gICAgaWYgKGluY2x1ZGluZyAhPT0gcnVsZSkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICdZb3UgY2Fubm90IGN1cnJlbnRseSBtaXggaW5jbHVkaW5nIGFuZCBleGNsdWRpbmcgZmllbGRzLidcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBwcm9qZWN0aW9uUnVsZXNUcmVlID0gcGF0aHNUb1RyZWUoXG4gICAgZmllbGRzS2V5cyxcbiAgICBwYXRoID0+IGluY2x1ZGluZyxcbiAgICAobm9kZSwgcGF0aCwgZnVsbFBhdGgpID0+IHtcbiAgICAgIC8vIENoZWNrIHBhc3NlZCBwcm9qZWN0aW9uIGZpZWxkcycga2V5czogSWYgeW91IGhhdmUgdHdvIHJ1bGVzIHN1Y2ggYXNcbiAgICAgIC8vICdmb28uYmFyJyBhbmQgJ2Zvby5iYXIuYmF6JywgdGhlbiB0aGUgcmVzdWx0IGJlY29tZXMgYW1iaWd1b3VzLiBJZlxuICAgICAgLy8gdGhhdCBoYXBwZW5zLCB0aGVyZSBpcyBhIHByb2JhYmlsaXR5IHlvdSBhcmUgZG9pbmcgc29tZXRoaW5nIHdyb25nLFxuICAgICAgLy8gZnJhbWV3b3JrIHNob3VsZCBub3RpZnkgeW91IGFib3V0IHN1Y2ggbWlzdGFrZSBlYXJsaWVyIG9uIGN1cnNvclxuICAgICAgLy8gY29tcGlsYXRpb24gc3RlcCB0aGFuIGxhdGVyIGR1cmluZyBydW50aW1lLiAgTm90ZSwgdGhhdCByZWFsIG1vbmdvXG4gICAgICAvLyBkb2Vzbid0IGRvIGFueXRoaW5nIGFib3V0IGl0IGFuZCB0aGUgbGF0ZXIgcnVsZSBhcHBlYXJzIGluIHByb2plY3Rpb25cbiAgICAgIC8vIHByb2plY3QsIG1vcmUgcHJpb3JpdHkgaXQgdGFrZXMuXG4gICAgICAvL1xuICAgICAgLy8gRXhhbXBsZSwgYXNzdW1lIGZvbGxvd2luZyBpbiBtb25nbyBzaGVsbDpcbiAgICAgIC8vID4gZGIuY29sbC5pbnNlcnQoeyBhOiB7IGI6IDIzLCBjOiA0NCB9IH0pXG4gICAgICAvLyA+IGRiLmNvbGwuZmluZCh7fSwgeyAnYSc6IDEsICdhLmInOiAxIH0pXG4gICAgICAvLyB7XCJfaWRcIjogT2JqZWN0SWQoXCI1MjBiZmU0NTYwMjQ2MDhlOGVmMjRhZjNcIiksIFwiYVwiOiB7XCJiXCI6IDIzfX1cbiAgICAgIC8vID4gZGIuY29sbC5maW5kKHt9LCB7ICdhLmInOiAxLCAnYSc6IDEgfSlcbiAgICAgIC8vIHtcIl9pZFwiOiBPYmplY3RJZChcIjUyMGJmZTQ1NjAyNDYwOGU4ZWYyNGFmM1wiKSwgXCJhXCI6IHtcImJcIjogMjMsIFwiY1wiOiA0NH19XG4gICAgICAvL1xuICAgICAgLy8gTm90ZSwgaG93IHNlY29uZCB0aW1lIHRoZSByZXR1cm4gc2V0IG9mIGtleXMgaXMgZGlmZmVyZW50LlxuICAgICAgY29uc3QgY3VycmVudFBhdGggPSBmdWxsUGF0aDtcbiAgICAgIGNvbnN0IGFub3RoZXJQYXRoID0gcGF0aDtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICBgYm90aCAke2N1cnJlbnRQYXRofSBhbmQgJHthbm90aGVyUGF0aH0gZm91bmQgaW4gZmllbGRzIG9wdGlvbiwgYCArXG4gICAgICAgICd1c2luZyBib3RoIG9mIHRoZW0gbWF5IHRyaWdnZXIgdW5leHBlY3RlZCBiZWhhdmlvci4gRGlkIHlvdSBtZWFuIHRvICcgK1xuICAgICAgICAndXNlIG9ubHkgb25lIG9mIHRoZW0/J1xuICAgICAgKTtcbiAgICB9KTtcblxuICByZXR1cm4ge2luY2x1ZGluZywgdHJlZTogcHJvamVjdGlvblJ1bGVzVHJlZX07XG59XG5cbi8vIFRha2VzIGEgUmVnRXhwIG9iamVjdCBhbmQgcmV0dXJucyBhbiBlbGVtZW50IG1hdGNoZXIuXG5leHBvcnQgZnVuY3Rpb24gcmVnZXhwRWxlbWVudE1hdGNoZXIocmVnZXhwKSB7XG4gIHJldHVybiB2YWx1ZSA9PiB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKSA9PT0gcmVnZXhwLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gUmVnZXhwcyBvbmx5IHdvcmsgYWdhaW5zdCBzdHJpbmdzLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgcmVnZXhwJ3Mgc3RhdGUgdG8gYXZvaWQgaW5jb25zaXN0ZW50IG1hdGNoaW5nIGZvciBvYmplY3RzIHdpdGggdGhlXG4gICAgLy8gc2FtZSB2YWx1ZSBvbiBjb25zZWN1dGl2ZSBjYWxscyBvZiByZWdleHAudGVzdC4gVGhpcyBoYXBwZW5zIG9ubHkgaWYgdGhlXG4gICAgLy8gcmVnZXhwIGhhcyB0aGUgJ2cnIGZsYWcuIEFsc28gbm90ZSB0aGF0IEVTNiBpbnRyb2R1Y2VzIGEgbmV3IGZsYWcgJ3knIGZvclxuICAgIC8vIHdoaWNoIHdlIHNob3VsZCAqbm90KiBjaGFuZ2UgdGhlIGxhc3RJbmRleCBidXQgTW9uZ29EQiBkb2Vzbid0IHN1cHBvcnRcbiAgICAvLyBlaXRoZXIgb2YgdGhlc2UgZmxhZ3MuXG4gICAgcmVnZXhwLmxhc3RJbmRleCA9IDA7XG5cbiAgICByZXR1cm4gcmVnZXhwLnRlc3QodmFsdWUpO1xuICB9O1xufVxuXG4vLyBWYWxpZGF0ZXMgdGhlIGtleSBpbiBhIHBhdGguXG4vLyBPYmplY3RzIHRoYXQgYXJlIG5lc3RlZCBtb3JlIHRoZW4gMSBsZXZlbCBjYW5ub3QgaGF2ZSBkb3R0ZWQgZmllbGRzXG4vLyBvciBmaWVsZHMgc3RhcnRpbmcgd2l0aCAnJCdcbmZ1bmN0aW9uIHZhbGlkYXRlS2V5SW5QYXRoKGtleSwgcGF0aCkge1xuICBpZiAoa2V5LmluY2x1ZGVzKCcuJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVGhlIGRvdHRlZCBmaWVsZCAnJHtrZXl9JyBpbiAnJHtwYXRofS4ke2tleX0gaXMgbm90IHZhbGlkIGZvciBzdG9yYWdlLmBcbiAgICApO1xuICB9XG5cbiAgaWYgKGtleVswXSA9PT0gJyQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRoZSBkb2xsYXIgKCQpIHByZWZpeGVkIGZpZWxkICAnJHtwYXRofS4ke2tleX0gaXMgbm90IHZhbGlkIGZvciBzdG9yYWdlLmBcbiAgICApO1xuICB9XG59XG5cbi8vIFJlY3Vyc2l2ZWx5IHZhbGlkYXRlcyBhbiBvYmplY3QgdGhhdCBpcyBuZXN0ZWQgbW9yZSB0aGFuIG9uZSBsZXZlbCBkZWVwXG5mdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChvYmplY3QsIHBhdGgpIHtcbiAgaWYgKG9iamVjdCAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KSA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgdmFsaWRhdGVLZXlJblBhdGgoa2V5LCBwYXRoKTtcbiAgICAgIHZhbGlkYXRlT2JqZWN0KG9iamVjdFtrZXldLCBwYXRoICsgJy4nICsga2V5KTtcbiAgICB9KTtcbiAgfVxufVxuIiwiLyoqIEV4cG9ydGVkIHZhbHVlcyBhcmUgYWxzbyB1c2VkIGluIHRoZSBtb25nbyBwYWNrYWdlLiAqL1xuXG4vKiogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFzeW5jTWV0aG9kTmFtZShtZXRob2QpIHtcbiAgcmV0dXJuIGAke21ldGhvZC5yZXBsYWNlKCdfJywgJycpfUFzeW5jYDtcbn1cblxuZXhwb3J0IGNvbnN0IEFTWU5DX0NPTExFQ1RJT05fTUVUSE9EUyA9IFtcbiAgJ19jcmVhdGVDYXBwZWRDb2xsZWN0aW9uJyxcbiAgJ2Ryb3BDb2xsZWN0aW9uJyxcbiAgJ2Ryb3BJbmRleCcsXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDcmVhdGVzIHRoZSBzcGVjaWZpZWQgaW5kZXggb24gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBzZXJ2ZXJcbiAgICogQG1ldGhvZCBjcmVhdGVJbmRleEFzeW5jXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5kZXggQSBkb2N1bWVudCB0aGF0IGNvbnRhaW5zIHRoZSBmaWVsZCBhbmQgdmFsdWUgcGFpcnMgd2hlcmUgdGhlIGZpZWxkIGlzIHRoZSBpbmRleCBrZXkgYW5kIHRoZSB2YWx1ZSBkZXNjcmliZXMgdGhlIHR5cGUgb2YgaW5kZXggZm9yIHRoYXQgZmllbGQuIEZvciBhbiBhc2NlbmRpbmcgaW5kZXggb24gYSBmaWVsZCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAxYDsgZm9yIGRlc2NlbmRpbmcgaW5kZXgsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgLTFgLiBVc2UgYHRleHRgIGZvciB0ZXh0IGluZGV4ZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWxsIG9wdGlvbnMgYXJlIGxpc3RlZCBpbiBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9tZXRob2QvZGIuY29sbGVjdGlvbi5jcmVhdGVJbmRleC8jb3B0aW9ucylcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubmFtZSBOYW1lIG9mIHRoZSBpbmRleFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudW5pcXVlIERlZmluZSB0aGF0IHRoZSBpbmRleCB2YWx1ZXMgbXVzdCBiZSB1bmlxdWUsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXVuaXF1ZS8pXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5zcGFyc2UgRGVmaW5lIHRoYXQgdGhlIGluZGV4IGlzIHNwYXJzZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtc3BhcnNlLylcbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICAnY3JlYXRlSW5kZXgnLFxuICAvKipcbiAgICogQHN1bW1hcnkgRmluZHMgdGhlIGZpcnN0IGRvY3VtZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IsIGFzIG9yZGVyZWQgYnkgc29ydCBhbmQgc2tpcCBvcHRpb25zLiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50IGlzIGZvdW5kLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBmaW5kT25lQXN5bmNcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IHRydWU7IHBhc3MgZmFsc2UgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgW2BDb2xsZWN0aW9uYF0oI2NvbGxlY3Rpb25zKSBmb3IgdGhpcyBjdXJzb3IuICBQYXNzIGBudWxsYCB0byBkaXNhYmxlIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5yZWFkUHJlZmVyZW5jZSAoU2VydmVyIG9ubHkpIFNwZWNpZmllcyBhIGN1c3RvbSBNb25nb0RCIFtgcmVhZFByZWZlcmVuY2VgXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvcmVhZC1wcmVmZXJlbmNlKSBmb3IgZmV0Y2hpbmcgdGhlIGRvY3VtZW50LiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICAnZmluZE9uZScsXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBJbnNlcnQgYSBkb2N1bWVudCBpbiB0aGUgY29sbGVjdGlvbi4gIFJldHVybnMgaXRzIHVuaXF1ZSBfaWQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kICBpbnNlcnRBc3luY1xuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IGRvYyBUaGUgZG9jdW1lbnQgdG8gaW5zZXJ0LiBNYXkgbm90IHlldCBoYXZlIGFuIF9pZCBhdHRyaWJ1dGUsIGluIHdoaWNoIGNhc2UgTWV0ZW9yIHdpbGwgZ2VuZXJhdGUgb25lIGZvciB5b3UuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICAnaW5zZXJ0JyxcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBkb2N1bWVudHMgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCByZW1vdmVBc3luY1xuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIHJlbW92ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgJ3JlbW92ZScsXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBNb2RpZnkgb25lIG9yIG1vcmUgZG9jdW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgbWF0Y2hlZCBkb2N1bWVudHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHVwZGF0ZUFzeW5jXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudXBzZXJ0IFRydWUgdG8gaW5zZXJ0IGEgZG9jdW1lbnQgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIGFyZSBmb3VuZC5cbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5hcnJheUZpbHRlcnMgT3B0aW9uYWwuIFVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBNb25nb0RCIFtmaWx0ZXJlZCBwb3NpdGlvbmFsIG9wZXJhdG9yXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9vcGVyYXRvci91cGRhdGUvcG9zaXRpb25hbC1maWx0ZXJlZC8pIHRvIHNwZWNpZnkgd2hpY2ggZWxlbWVudHMgdG8gbW9kaWZ5IGluIGFuIGFycmF5IGZpZWxkLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgJ3VwZGF0ZScsXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBNb2RpZnkgb25lIG9yIG1vcmUgZG9jdW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLCBvciBpbnNlcnQgb25lIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50cyB3ZXJlIGZvdW5kLiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgYG51bWJlckFmZmVjdGVkYCAodGhlIG51bWJlciBvZiBkb2N1bWVudHMgbW9kaWZpZWQpICBhbmQgYGluc2VydGVkSWRgICh0aGUgdW5pcXVlIF9pZCBvZiB0aGUgZG9jdW1lbnQgdGhhdCB3YXMgaW5zZXJ0ZWQsIGlmIGFueSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHVwc2VydEFzeW5jXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgJ3Vwc2VydCcsXG5dO1xuXG5leHBvcnQgY29uc3QgQVNZTkNfQ1VSU09SX01FVEhPRFMgPSBbXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBpbiAyLjlcbiAgICogQHN1bW1hcnkgUmV0dXJucyB0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyB0aGF0IG1hdGNoIGEgcXVlcnkuIFRoaXMgbWV0aG9kIGlzXG4gICAqICAgICAgICAgIFtkZXByZWNhdGVkIHNpbmNlIE1vbmdvREIgNC4wXShodHRwczovL3d3dy5tb25nb2RiLmNvbS9kb2NzL3Y0LjQvcmVmZXJlbmNlL2NvbW1hbmQvY291bnQvKTtcbiAgICogICAgICAgICAgc2VlIGBDb2xsZWN0aW9uLmNvdW50RG9jdW1lbnRzYCBhbmRcbiAgICogICAgICAgICAgYENvbGxlY3Rpb24uZXN0aW1hdGVkRG9jdW1lbnRDb3VudGAgZm9yIGEgcmVwbGFjZW1lbnQuXG4gICAqIEBtZW1iZXJPZiBNb25nby5DdXJzb3JcbiAgICogQG1ldGhvZCAgY291bnRBc3luY1xuICAgKiBAaW5zdGFuY2VcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgJ2NvdW50JyxcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJldHVybiBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzIGFzIGFuIEFycmF5LlxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBtZXRob2QgIGZldGNoQXN5bmNcbiAgICogQGluc3RhbmNlXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gICdmZXRjaCcsXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGBjYWxsYmFja2Agb25jZSBmb3IgZWFjaCBtYXRjaGluZyBkb2N1bWVudCwgc2VxdWVudGlhbGx5IGFuZFxuICAgKiAgICAgICAgICBzeW5jaHJvbm91c2x5LlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCAgZm9yRWFjaEFzeW5jXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBwYXJhbSB7SXRlcmF0aW9uQ2FsbGJhY2t9IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwuIEl0IHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgZG9jdW1lbnQsIGFcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMC1iYXNlZCBpbmRleCwgYW5kIDxlbT5jdXJzb3I8L2VtPlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdHNlbGYuXG4gICAqIEBwYXJhbSB7QW55fSBbdGhpc0FyZ10gQW4gb2JqZWN0IHdoaWNoIHdpbGwgYmUgdGhlIHZhbHVlIG9mIGB0aGlzYCBpbnNpZGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBgY2FsbGJhY2tgLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gICdmb3JFYWNoJyxcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IE1hcCBjYWxsYmFjayBvdmVyIGFsbCBtYXRjaGluZyBkb2N1bWVudHMuIFJldHVybnMgYSBQcm9taXNlPEFycmF5Pi5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgbWFwQXN5bmNcbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJPZiBNb25nby5DdXJzb3JcbiAgICogQHBhcmFtIHtJdGVyYXRpb25DYWxsYmFja30gY2FsbGJhY2sgRnVuY3Rpb24gdG8gY2FsbC4gSXQgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCB0aHJlZSBhcmd1bWVudHM6IHRoZSBkb2N1bWVudCwgYVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLWJhc2VkIGluZGV4LCBhbmQgPGVtPmN1cnNvcjwvZW0+XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0c2VsZi5cbiAgICogQHBhcmFtIHtBbnl9IFt0aGlzQXJnXSBBbiBvYmplY3Qgd2hpY2ggd2lsbCBiZSB0aGUgdmFsdWUgb2YgYHRoaXNgIGluc2lkZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGBjYWxsYmFja2AuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAgICovXG4gICdtYXAnLFxuXTtcblxuZXhwb3J0IGNvbnN0IENMSUVOVF9PTkxZX01FVEhPRFMgPSBbXCJmaW5kT25lXCIsIFwiaW5zZXJ0XCIsIFwicmVtb3ZlXCIsIFwidXBkYXRlXCIsIFwidXBzZXJ0XCJdO1xuIiwiaW1wb3J0IExvY2FsQ29sbGVjdGlvbiBmcm9tICcuL2xvY2FsX2NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgaGFzT3duIH0gZnJvbSAnLi9jb21tb24uanMnO1xuaW1wb3J0IHsgQVNZTkNfQ1VSU09SX01FVEhPRFMsIGdldEFzeW5jTWV0aG9kTmFtZSB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLy8gQ3Vyc29yOiBhIHNwZWNpZmljYXRpb24gZm9yIGEgcGFydGljdWxhciBzdWJzZXQgb2YgZG9jdW1lbnRzLCB3LyBhIGRlZmluZWRcbi8vIG9yZGVyLCBsaW1pdCwgYW5kIG9mZnNldC4gIGNyZWF0aW5nIGEgQ3Vyc29yIHdpdGggTG9jYWxDb2xsZWN0aW9uLmZpbmQoKSxcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1cnNvciB7XG4gIC8vIGRvbid0IGNhbGwgdGhpcyBjdG9yIGRpcmVjdGx5LiAgdXNlIExvY2FsQ29sbGVjdGlvbi5maW5kKCkuXG4gIGNvbnN0cnVjdG9yKGNvbGxlY3Rpb24sIHNlbGVjdG9yLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgIHRoaXMuc29ydGVyID0gbnVsbDtcblxuICAgIC8vIENyZWF0ZSB0aGUgY29sbGF0b3Igb25jZSBhbmQgc2hhcmUgaXQgd2l0aCBib3RoIE1hdGNoZXIgYW5kIFNvcnRlci5cbiAgICBjb25zdCBjb2xsYXRvciA9IExvY2FsQ29sbGVjdGlvbi5fY3JlYXRlQ29sbGF0b3Iob3B0aW9ucy5jb2xsYXRpb24pO1xuXG4gICAgdGhpcy5tYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHNlbGVjdG9yLCB1bmRlZmluZWQsIGNvbGxhdG9yKTtcblxuICAgIGlmIChMb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZFBlcmhhcHNBc09iamVjdChzZWxlY3RvcikgJiZcbiAgICAgICAgIW9wdGlvbnMuY29sbGF0aW9uKSB7XG4gICAgICAvLyBzdGFzaCBmb3IgZmFzdCBfaWQgYW5kIHsgX2lkIH1cbiAgICAgIHRoaXMuX3NlbGVjdG9ySWQgPSBoYXNPd24uY2FsbChzZWxlY3RvciwgJ19pZCcpID8gc2VsZWN0b3IuX2lkIDogc2VsZWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NlbGVjdG9ySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh0aGlzLm1hdGNoZXIuaGFzR2VvUXVlcnkoKSB8fCBvcHRpb25zLnNvcnQpIHtcbiAgICAgICAgdGhpcy5zb3J0ZXIgPSBuZXcgTWluaW1vbmdvLlNvcnRlcihvcHRpb25zLnNvcnQgfHwgW10sIGNvbGxhdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNraXAgPSBvcHRpb25zLnNraXAgfHwgMDtcbiAgICB0aGlzLmxpbWl0ID0gb3B0aW9ucy5saW1pdDtcbiAgICB0aGlzLmZpZWxkcyA9IG9wdGlvbnMucHJvamVjdGlvbiB8fCBvcHRpb25zLmZpZWxkcztcblxuICAgIHRoaXMuX3Byb2plY3Rpb25GbiA9IExvY2FsQ29sbGVjdGlvbi5fY29tcGlsZVByb2plY3Rpb24odGhpcy5maWVsZHMgfHwge30pO1xuXG4gICAgdGhpcy5fdHJhbnNmb3JtID0gTG9jYWxDb2xsZWN0aW9uLndyYXBUcmFuc2Zvcm0ob3B0aW9ucy50cmFuc2Zvcm0pO1xuXG4gICAgLy8gYnkgZGVmYXVsdCwgcXVlcmllcyByZWdpc3RlciB3LyBUcmFja2VyIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxuICAgIGlmICh0eXBlb2YgVHJhY2tlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMucmVhY3RpdmUgPSBvcHRpb25zLnJlYWN0aXZlID09PSB1bmRlZmluZWQgPyB0cnVlIDogb3B0aW9ucy5yZWFjdGl2ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgaW4gMi45XG4gICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIG51bWJlciBvZiBkb2N1bWVudHMgdGhhdCBtYXRjaCBhIHF1ZXJ5LiBUaGlzIG1ldGhvZCBpc1xuICAgKiAgICAgICAgICBbZGVwcmVjYXRlZCBzaW5jZSBNb25nb0RCIDQuMF0oaHR0cHM6Ly93d3cubW9uZ29kYi5jb20vZG9jcy92NC40L3JlZmVyZW5jZS9jb21tYW5kL2NvdW50Lyk7XG4gICAqICAgICAgICAgIHNlZSBgQ29sbGVjdGlvbi5jb3VudERvY3VtZW50c2AgYW5kXG4gICAqICAgICAgICAgIGBDb2xsZWN0aW9uLmVzdGltYXRlZERvY3VtZW50Q291bnRgIGZvciBhIHJlcGxhY2VtZW50LlxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBtZXRob2QgIGNvdW50XG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGNvdW50KCkge1xuICAgIGlmICh0aGlzLnJlYWN0aXZlKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgb2JzZXJ2ZSB0byBiZSB1bm9yZGVyZWRcbiAgICAgIHRoaXMuX2RlcGVuZCh7IGFkZGVkOiB0cnVlLCByZW1vdmVkOiB0cnVlIH0sIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9nZXRSYXdPYmplY3RzKHtcbiAgICAgIG9yZGVyZWQ6IHRydWUsXG4gICAgfSkubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJldHVybiBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzIGFzIGFuIEFycmF5LlxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBtZXRob2QgIGZldGNoXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHJldHVybnMge09iamVjdFtdfVxuICAgKi9cbiAgZmV0Y2goKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICB0aGlzLmZvckVhY2goZG9jID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKGRvYyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgaWYgKHRoaXMucmVhY3RpdmUpIHtcbiAgICAgIHRoaXMuX2RlcGVuZCh7XG4gICAgICAgIGFkZGVkQmVmb3JlOiB0cnVlLFxuICAgICAgICByZW1vdmVkOiB0cnVlLFxuICAgICAgICBjaGFuZ2VkOiB0cnVlLFxuICAgICAgICBtb3ZlZEJlZm9yZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9IDA7XG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2dldFJhd09iamVjdHMoeyBvcmRlcmVkOiB0cnVlIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5leHQ6ICgpID0+IHtcbiAgICAgICAgaWYgKGluZGV4IDwgb2JqZWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBUaGlzIGRvdWJsZXMgYXMgYSBjbG9uZSBvcGVyYXRpb24uXG4gICAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLl9wcm9qZWN0aW9uRm4ob2JqZWN0c1tpbmRleCsrXSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5fdHJhbnNmb3JtKSBlbGVtZW50ID0gdGhpcy5fdHJhbnNmb3JtKGVsZW1lbnQpO1xuXG4gICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGVsZW1lbnQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgY29uc3Qgc3luY1Jlc3VsdCA9IHRoaXNbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIHJldHVybiB7XG4gICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHN5bmNSZXN1bHQubmV4dCgpKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2FsbGJhY2sgSXRlcmF0aW9uQ2FsbGJhY2tcbiAgICogQHBhcmFtIHtPYmplY3R9IGRvY1xuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICovXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGBjYWxsYmFja2Agb25jZSBmb3IgZWFjaCBtYXRjaGluZyBkb2N1bWVudCwgc2VxdWVudGlhbGx5IGFuZFxuICAgKiAgICAgICAgICBzeW5jaHJvbm91c2x5LlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCAgZm9yRWFjaFxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIE1vbmdvLkN1cnNvclxuICAgKiBAcGFyYW0ge0l0ZXJhdGlvbkNhbGxiYWNrfSBjYWxsYmFjayBGdW5jdGlvbiB0byBjYWxsLiBJdCB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRocmVlIGFyZ3VtZW50czogdGhlIGRvY3VtZW50LCBhXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAtYmFzZWQgaW5kZXgsIGFuZCA8ZW0+Y3Vyc29yPC9lbT5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRzZWxmLlxuICAgKiBAcGFyYW0ge0FueX0gW3RoaXNBcmddIEFuIG9iamVjdCB3aGljaCB3aWxsIGJlIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaW5zaWRlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgYGNhbGxiYWNrYC5cbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IGRvYyBvZiB0aGlzKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGRvYywgaSsrLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FsbCBgY2FsbGJhY2tgIG9uY2UgZm9yIGVhY2ggbWF0Y2hpbmcgZG9jdW1lbnQsIHNlcXVlbnRpYWxseSBhbmRcbiAgICogICAgICAgICAgc3luY2hyb25vdXNseS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgIGZvckVhY2hBc3luY1xuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIE1vbmdvLkN1cnNvclxuICAgKiBAcGFyYW0ge0l0ZXJhdGlvbkNhbGxiYWNrfSBjYWxsYmFjayBGdW5jdGlvbiB0byBjYWxsLiBJdCB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRocmVlIGFyZ3VtZW50czogdGhlIGRvY3VtZW50LCBhXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAtYmFzZWQgaW5kZXgsIGFuZCA8ZW0+Y3Vyc29yPC9lbT5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRzZWxmLlxuICAgKiBAcGFyYW0ge0FueX0gW3RoaXNBcmddIEFuIG9iamVjdCB3aGljaCB3aWxsIGJlIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaW5zaWRlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgYGNhbGxiYWNrYC5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICBhc3luYyBmb3JFYWNoQXN5bmMoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICBmb3IgYXdhaXQgKGNvbnN0IGRvYyBvZiB0aGlzKSB7XG4gICAgICBhd2FpdCBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGRvYywgaSsrLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRUcmFuc2Zvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBNYXAgY2FsbGJhY2sgb3ZlciBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzLiBSZXR1cm5zIGFuIEFycmF5LlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBtYXBcbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJPZiBNb25nby5DdXJzb3JcbiAgICogQHBhcmFtIHtJdGVyYXRpb25DYWxsYmFja30gY2FsbGJhY2sgRnVuY3Rpb24gdG8gY2FsbC4gSXQgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCB0aHJlZSBhcmd1bWVudHM6IHRoZSBkb2N1bWVudCwgYVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLWJhc2VkIGluZGV4LCBhbmQgPGVtPmN1cnNvcjwvZW0+XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0c2VsZi5cbiAgICogQHBhcmFtIHtBbnl9IFt0aGlzQXJnXSBBbiBvYmplY3Qgd2hpY2ggd2lsbCBiZSB0aGUgdmFsdWUgb2YgYHRoaXNgIGluc2lkZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGBjYWxsYmFja2AuXG4gICAqL1xuICBtYXAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgIHRoaXMuZm9yRWFjaCgoZG9jLCBpKSA9PiB7XG4gICAgICByZXN1bHQucHVzaChjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGRvYywgaSwgdGhpcykpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBNYXAgY2FsbGJhY2sgb3ZlciBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzLiBSZXR1cm5zIGEgUHJvbWlzZTxBcnJheT4uXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIG1hcEFzeW5jXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBwYXJhbSB7SXRlcmF0aW9uQ2FsbGJhY2t9IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwuIEl0IHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgZG9jdW1lbnQsIGFcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMC1iYXNlZCBpbmRleCwgYW5kIDxlbT5jdXJzb3I8L2VtPlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdHNlbGYuXG4gICAqIEBwYXJhbSB7QW55fSBbdGhpc0FyZ10gQW4gb2JqZWN0IHdoaWNoIHdpbGwgYmUgdGhlIHZhbHVlIG9mIGB0aGlzYCBpbnNpZGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBgY2FsbGJhY2tgLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XG4gICAqL1xuICBhc3luYyBtYXBBc3luYyhjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgYXdhaXQgdGhpcy5mb3JFYWNoQXN5bmMoYXN5bmMgKGRvYywgaSkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goYXdhaXQgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBkb2MsIGksIHRoaXMpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBvcHRpb25zIHRvIGNvbnRhaW46XG4gIC8vICAqIGNhbGxiYWNrcyBmb3Igb2JzZXJ2ZSgpOlxuICAvLyAgICAtIGFkZGVkQXQgKGRvY3VtZW50LCBhdEluZGV4KVxuICAvLyAgICAtIGFkZGVkIChkb2N1bWVudClcbiAgLy8gICAgLSBjaGFuZ2VkQXQgKG5ld0RvY3VtZW50LCBvbGREb2N1bWVudCwgYXRJbmRleClcbiAgLy8gICAgLSBjaGFuZ2VkIChuZXdEb2N1bWVudCwgb2xkRG9jdW1lbnQpXG4gIC8vICAgIC0gcmVtb3ZlZEF0IChkb2N1bWVudCwgYXRJbmRleClcbiAgLy8gICAgLSByZW1vdmVkIChkb2N1bWVudClcbiAgLy8gICAgLSBtb3ZlZFRvIChkb2N1bWVudCwgb2xkSW5kZXgsIG5ld0luZGV4KVxuICAvL1xuICAvLyBhdHRyaWJ1dGVzIGF2YWlsYWJsZSBvbiByZXR1cm5lZCBxdWVyeSBoYW5kbGU6XG4gIC8vICAqIHN0b3AoKTogZW5kIHVwZGF0ZXNcbiAgLy8gICogY29sbGVjdGlvbjogdGhlIGNvbGxlY3Rpb24gdGhpcyBxdWVyeSBpcyBxdWVyeWluZ1xuICAvL1xuICAvLyBpZmYgeCBpcyBhIHJldHVybmVkIHF1ZXJ5IGhhbmRsZSwgKHggaW5zdGFuY2VvZlxuICAvLyBMb2NhbENvbGxlY3Rpb24uT2JzZXJ2ZUhhbmRsZSkgaXMgdHJ1ZVxuICAvL1xuICAvLyBpbml0aWFsIHJlc3VsdHMgZGVsaXZlcmVkIHRocm91Z2ggYWRkZWQgY2FsbGJhY2tcbiAgLy8gWFhYIG1heWJlIGNhbGxiYWNrcyBzaG91bGQgdGFrZSBhIGxpc3Qgb2Ygb2JqZWN0cywgdG8gZXhwb3NlIHRyYW5zYWN0aW9ucz9cbiAgLy8gWFhYIG1heWJlIHN1cHBvcnQgZmllbGQgbGltaXRpbmcgKHRvIGxpbWl0IHdoYXQgeW91J3JlIG5vdGlmaWVkIG9uKVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBXYXRjaCBhIHF1ZXJ5LiAgUmVjZWl2ZSBjYWxsYmFja3MgYXMgdGhlIHJlc3VsdCBzZXQgY2hhbmdlcy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBNb25nby5DdXJzb3JcbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjYWxsYmFja3MgRnVuY3Rpb25zIHRvIGNhbGwgdG8gZGVsaXZlciB0aGUgcmVzdWx0IHNldCBhcyBpdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZXNcbiAgICovXG4gIG9ic2VydmUob3B0aW9ucykge1xuICAgIHJldHVybiBMb2NhbENvbGxlY3Rpb24uX29ic2VydmVGcm9tT2JzZXJ2ZUNoYW5nZXModGhpcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgV2F0Y2ggYSBxdWVyeS4gIFJlY2VpdmUgY2FsbGJhY2tzIGFzIHRoZSByZXN1bHQgc2V0IGNoYW5nZXMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgb2JzZXJ2ZUFzeW5jKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKHRoaXMub2JzZXJ2ZShvcHRpb25zKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFdhdGNoIGEgcXVlcnkuIFJlY2VpdmUgY2FsbGJhY2tzIGFzIHRoZSByZXN1bHQgc2V0IGNoYW5nZXMuIE9ubHlcbiAgICogICAgICAgICAgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIG9sZCBhbmQgbmV3IGRvY3VtZW50cyBhcmUgcGFzc2VkIHRvXG4gICAqICAgICAgICAgIHRoZSBjYWxsYmFja3MuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgTW9uZ28uQ3Vyc29yXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2tzIEZ1bmN0aW9ucyB0byBjYWxsIHRvIGRlbGl2ZXIgdGhlIHJlc3VsdCBzZXQgYXMgaXRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzXG4gICAqL1xuICBvYnNlcnZlQ2hhbmdlcyhvcHRpb25zKSB7XG4gICAgY29uc3Qgb3JkZXJlZCA9IExvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3NBcmVPcmRlcmVkKG9wdGlvbnMpO1xuXG4gICAgLy8gdGhlcmUgYXJlIHNldmVyYWwgcGxhY2VzIHRoYXQgYXNzdW1lIHlvdSBhcmVuJ3QgY29tYmluaW5nIHNraXAvbGltaXQgd2l0aFxuICAgIC8vIHVub3JkZXJlZCBvYnNlcnZlLiAgZWcsIHVwZGF0ZSdzIEVKU09OLmNsb25lLCBhbmQgdGhlIFwidGhlcmUgYXJlIHNldmVyYWxcIlxuICAgIC8vIGNvbW1lbnQgaW4gX21vZGlmeUFuZE5vdGlmeVxuICAgIC8vIFhYWCBhbGxvdyBza2lwL2xpbWl0IHdpdGggdW5vcmRlcmVkIG9ic2VydmVcbiAgICBpZiAoIW9wdGlvbnMuX2FsbG93X3Vub3JkZXJlZCAmJiAhb3JkZXJlZCAmJiAodGhpcy5za2lwIHx8IHRoaXMubGltaXQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTXVzdCB1c2UgYW4gb3JkZXJlZCBvYnNlcnZlIHdpdGggc2tpcCBvciBsaW1pdCAoaS5lLiAnYWRkZWRCZWZvcmUnIFwiICtcbiAgICAgICAgICBcImZvciBvYnNlcnZlQ2hhbmdlcyBvciAnYWRkZWRBdCcgZm9yIG9ic2VydmUsIGluc3RlYWQgb2YgJ2FkZGVkJykuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmllbGRzICYmICh0aGlzLmZpZWxkcy5faWQgPT09IDAgfHwgdGhpcy5maWVsZHMuX2lkID09PSBmYWxzZSkpIHtcbiAgICAgIHRocm93IEVycm9yKFwiWW91IG1heSBub3Qgb2JzZXJ2ZSBhIGN1cnNvciB3aXRoIHtmaWVsZHM6IHtfaWQ6IDB9fVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXN0YW5jZXMgPVxuICAgICAgdGhpcy5tYXRjaGVyLmhhc0dlb1F1ZXJ5KCkgJiYgb3JkZXJlZCAmJiBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcCgpO1xuXG4gICAgY29uc3QgcXVlcnkgPSB7XG4gICAgICBjdXJzb3I6IHRoaXMsXG4gICAgICBkaXJ0eTogZmFsc2UsXG4gICAgICBkaXN0YW5jZXMsXG4gICAgICBtYXRjaGVyOiB0aGlzLm1hdGNoZXIsIC8vIG5vdCBmYXN0IHBhdGhlZFxuICAgICAgb3JkZXJlZCxcbiAgICAgIHByb2plY3Rpb25GbjogdGhpcy5fcHJvamVjdGlvbkZuLFxuICAgICAgcmVzdWx0c1NuYXBzaG90OiBudWxsLFxuICAgICAgc29ydGVyOiBvcmRlcmVkICYmIHRoaXMuc29ydGVyLFxuICAgIH07XG5cbiAgICBsZXQgcWlkO1xuXG4gICAgLy8gTm9uLXJlYWN0aXZlIHF1ZXJpZXMgY2FsbCBhZGRlZFtCZWZvcmVdIGFuZCB0aGVuIG5ldmVyIGNhbGwgYW55dGhpbmdcbiAgICAvLyBlbHNlLlxuICAgIGlmICh0aGlzLnJlYWN0aXZlKSB7XG4gICAgICBxaWQgPSB0aGlzLmNvbGxlY3Rpb24ubmV4dF9xaWQrKztcbiAgICAgIHRoaXMuY29sbGVjdGlvbi5xdWVyaWVzW3FpZF0gPSBxdWVyeTtcbiAgICB9XG5cbiAgICBxdWVyeS5yZXN1bHRzID0gdGhpcy5fZ2V0UmF3T2JqZWN0cyh7XG4gICAgICBvcmRlcmVkLFxuICAgICAgZGlzdGFuY2VzOiBxdWVyeS5kaXN0YW5jZXMsXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jb2xsZWN0aW9uLnBhdXNlZCkge1xuICAgICAgcXVlcnkucmVzdWx0c1NuYXBzaG90ID0gb3JkZXJlZCA/IFtdIDogbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXAoKTtcbiAgICB9XG5cbiAgICAvLyB3cmFwIGNhbGxiYWNrcyB3ZSB3ZXJlIHBhc3NlZC4gY2FsbGJhY2tzIG9ubHkgZmlyZSB3aGVuIG5vdCBwYXVzZWQgYW5kXG4gICAgLy8gYXJlIG5ldmVyIHVuZGVmaW5lZFxuICAgIC8vIEZpbHRlcnMgb3V0IGJsYWNrbGlzdGVkIGZpZWxkcyBhY2NvcmRpbmcgdG8gY3Vyc29yJ3MgcHJvamVjdGlvbi5cbiAgICAvLyBYWFggd3JvbmcgcGxhY2UgZm9yIHRoaXM/XG5cbiAgICAvLyBmdXJ0aGVybW9yZSwgY2FsbGJhY2tzIGVucXVldWUgdW50aWwgdGhlIG9wZXJhdGlvbiB3ZSdyZSB3b3JraW5nIG9uIGlzXG4gICAgLy8gZG9uZS5cbiAgICBjb25zdCB3cmFwQ2FsbGJhY2sgPSAoZm4pID0+IHtcbiAgICAgIGlmICghZm4pIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHt9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgvKiBhcmdzKi8pIHtcbiAgICAgICAgaWYgKHNlbGYuY29sbGVjdGlvbi5wYXVzZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIHNlbGYuY29sbGVjdGlvbi5fb2JzZXJ2ZVF1ZXVlLnF1ZXVlVGFzaygoKSA9PiB7XG4gICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgcXVlcnkuYWRkZWQgPSB3cmFwQ2FsbGJhY2sob3B0aW9ucy5hZGRlZCk7XG4gICAgcXVlcnkuY2hhbmdlZCA9IHdyYXBDYWxsYmFjayhvcHRpb25zLmNoYW5nZWQpO1xuICAgIHF1ZXJ5LnJlbW92ZWQgPSB3cmFwQ2FsbGJhY2sob3B0aW9ucy5yZW1vdmVkKTtcblxuICAgIGlmIChvcmRlcmVkKSB7XG4gICAgICBxdWVyeS5hZGRlZEJlZm9yZSA9IHdyYXBDYWxsYmFjayhvcHRpb25zLmFkZGVkQmVmb3JlKTtcbiAgICAgIHF1ZXJ5Lm1vdmVkQmVmb3JlID0gd3JhcENhbGxiYWNrKG9wdGlvbnMubW92ZWRCZWZvcmUpO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5fc3VwcHJlc3NfaW5pdGlhbCAmJiAhdGhpcy5jb2xsZWN0aW9uLnBhdXNlZCkge1xuICAgICAgY29uc3QgaGFuZGxlciA9IChkb2MpID0+IHtcbiAgICAgICAgY29uc3QgZmllbGRzID0gRUpTT04uY2xvbmUoZG9jKTtcblxuICAgICAgICBkZWxldGUgZmllbGRzLl9pZDtcblxuICAgICAgICBpZiAob3JkZXJlZCkge1xuICAgICAgICAgIHF1ZXJ5LmFkZGVkQmVmb3JlKGRvYy5faWQsIHRoaXMuX3Byb2plY3Rpb25GbihmaWVsZHMpLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXJ5LmFkZGVkKGRvYy5faWQsIHRoaXMuX3Byb2plY3Rpb25GbihmaWVsZHMpKTtcbiAgICAgIH07XG4gICAgICAvLyBpdCBtZWFucyBpdCdzIGp1c3QgYW4gYXJyYXlcbiAgICAgIGlmIChxdWVyeS5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBxdWVyeS5yZXN1bHRzKSB7XG4gICAgICAgICAgaGFuZGxlcihkb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpdCBtZWFucyBpdCdzIGFuIGlkIG1hcFxuICAgICAgaWYgKHF1ZXJ5LnJlc3VsdHM/LnNpemU/LigpKSB7XG4gICAgICAgIHF1ZXJ5LnJlc3VsdHMuZm9yRWFjaChoYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGUgPSBPYmplY3QuYXNzaWduKG5ldyBMb2NhbENvbGxlY3Rpb24uT2JzZXJ2ZUhhbmRsZSgpLCB7XG4gICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXG4gICAgICBzdG9wOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnJlYWN0aXZlKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbi5xdWVyaWVzW3FpZF07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiBmYWxzZSxcbiAgICAgIGlzUmVhZHlQcm9taXNlOiBudWxsLFxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucmVhY3RpdmUgJiYgVHJhY2tlci5hY3RpdmUpIHtcbiAgICAgIC8vIFhYWCBpbiBtYW55IGNhc2VzLCB0aGUgc2FtZSBvYnNlcnZlIHdpbGwgYmUgcmVjcmVhdGVkIHdoZW5cbiAgICAgIC8vIHRoZSBjdXJyZW50IGF1dG9ydW4gaXMgcmVydW4uICB3ZSBjb3VsZCBzYXZlIHdvcmsgYnlcbiAgICAgIC8vIGxldHRpbmcgaXQgbGluZ2VyIGFjcm9zcyByZXJ1biBhbmQgcG90ZW50aWFsbHkgZ2V0XG4gICAgICAvLyByZXB1cnBvc2VkIGlmIHRoZSBzYW1lIG9ic2VydmUgaXMgcGVyZm9ybWVkLCB1c2luZyBsb2dpY1xuICAgICAgLy8gc2ltaWxhciB0byB0aGF0IG9mIE1ldGVvci5zdWJzY3JpYmUuXG4gICAgICBUcmFja2VyLm9uSW52YWxpZGF0ZSgoKSA9PiB7XG4gICAgICAgIGhhbmRsZS5zdG9wKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBydW4gdGhlIG9ic2VydmUgY2FsbGJhY2tzIHJlc3VsdGluZyBmcm9tIHRoZSBpbml0aWFsIGNvbnRlbnRzXG4gICAgLy8gYmVmb3JlIHdlIGxlYXZlIHRoZSBvYnNlcnZlLlxuICAgIGNvbnN0IGRyYWluUmVzdWx0ID0gdGhpcy5jb2xsZWN0aW9uLl9vYnNlcnZlUXVldWUuZHJhaW4oKTtcblxuICAgIGlmIChkcmFpblJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIGhhbmRsZS5pc1JlYWR5UHJvbWlzZSA9IGRyYWluUmVzdWx0O1xuICAgICAgZHJhaW5SZXN1bHQudGhlbigoKSA9PiAoaGFuZGxlLmlzUmVhZHkgPSB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZS5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgIGhhbmRsZS5pc1JlYWR5UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgV2F0Y2ggYSBxdWVyeS4gUmVjZWl2ZSBjYWxsYmFja3MgYXMgdGhlIHJlc3VsdCBzZXQgY2hhbmdlcy4gT25seVxuICAgKiAgICAgICAgICB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgb2xkIGFuZCBuZXcgZG9jdW1lbnRzIGFyZSBwYXNzZWQgdG9cbiAgICogICAgICAgICAgdGhlIGNhbGxiYWNrcy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBNb25nby5DdXJzb3JcbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjYWxsYmFja3MgRnVuY3Rpb25zIHRvIGNhbGwgdG8gZGVsaXZlciB0aGUgcmVzdWx0IHNldCBhcyBpdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZXNcbiAgICovXG4gIG9ic2VydmVDaGFuZ2VzQXN5bmMob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlID0gdGhpcy5vYnNlcnZlQ2hhbmdlcyhvcHRpb25zKTtcbiAgICAgIGhhbmRsZS5pc1JlYWR5UHJvbWlzZS50aGVuKCgpID0+IHJlc29sdmUoaGFuZGxlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBYWFggTWF5YmUgd2UgbmVlZCBhIHZlcnNpb24gb2Ygb2JzZXJ2ZSB0aGF0IGp1c3QgY2FsbHMgYSBjYWxsYmFjayBpZlxuICAvLyBhbnl0aGluZyBjaGFuZ2VkLlxuICBfZGVwZW5kKGNoYW5nZXJzLCBfYWxsb3dfdW5vcmRlcmVkKSB7XG4gICAgaWYgKFRyYWNrZXIuYWN0aXZlKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmN5ID0gbmV3IFRyYWNrZXIuRGVwZW5kZW5jeSgpO1xuICAgICAgY29uc3Qgbm90aWZ5ID0gZGVwZW5kZW5jeS5jaGFuZ2VkLmJpbmQoZGVwZW5kZW5jeSk7XG5cbiAgICAgIGRlcGVuZGVuY3kuZGVwZW5kKCk7XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IF9hbGxvd191bm9yZGVyZWQsIF9zdXBwcmVzc19pbml0aWFsOiB0cnVlIH07XG5cbiAgICAgIFsnYWRkZWQnLCAnYWRkZWRCZWZvcmUnLCAnY2hhbmdlZCcsICdtb3ZlZEJlZm9yZScsICdyZW1vdmVkJ10uZm9yRWFjaChcbiAgICAgICAgZm4gPT4ge1xuICAgICAgICAgIGlmIChjaGFuZ2Vyc1tmbl0pIHtcbiAgICAgICAgICAgIG9wdGlvbnNbZm5dID0gbm90aWZ5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgLy8gb2JzZXJ2ZUNoYW5nZXMgd2lsbCBzdG9wKCkgd2hlbiB0aGlzIGNvbXB1dGF0aW9uIGlzIGludmFsaWRhdGVkXG4gICAgICB0aGlzLm9ic2VydmVDaGFuZ2VzKG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRDb2xsZWN0aW9uTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLm5hbWU7XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgY29sbGVjdGlvbiBvZiBtYXRjaGluZyBvYmplY3RzLCBidXQgZG9lc24ndCBkZWVwIGNvcHkgdGhlbS5cbiAgLy9cbiAgLy8gSWYgb3JkZXJlZCBpcyBzZXQsIHJldHVybnMgYSBzb3J0ZWQgYXJyYXksIHJlc3BlY3Rpbmcgc29ydGVyLCBza2lwLCBhbmRcbiAgLy8gbGltaXQgcHJvcGVydGllcyBvZiB0aGUgcXVlcnkgcHJvdmlkZWQgdGhhdCBvcHRpb25zLmFwcGx5U2tpcExpbWl0IGlzXG4gIC8vIG5vdCBzZXQgdG8gZmFsc2UgKCMxMjAxKS4gSWYgc29ydGVyIGlzIGZhbHNleSwgbm8gc29ydCAtLSB5b3UgZ2V0IHRoZVxuICAvLyBuYXR1cmFsIG9yZGVyLlxuICAvL1xuICAvLyBJZiBvcmRlcmVkIGlzIG5vdCBzZXQsIHJldHVybnMgYW4gb2JqZWN0IG1hcHBpbmcgZnJvbSBJRCB0byBkb2MgKHNvcnRlcixcbiAgLy8gc2tpcCBhbmQgbGltaXQgc2hvdWxkIG5vdCBiZSBzZXQpLlxuICAvL1xuICAvLyBJZiBvcmRlcmVkIGlzIHNldCBhbmQgdGhpcyBjdXJzb3IgaXMgYSAkbmVhciBnZW9xdWVyeSwgdGhlbiB0aGlzIGZ1bmN0aW9uXG4gIC8vIHdpbGwgdXNlIGFuIF9JZE1hcCB0byB0cmFjayBlYWNoIGRpc3RhbmNlIGZyb20gdGhlICRuZWFyIGFyZ3VtZW50IHBvaW50IGluXG4gIC8vIG9yZGVyIHRvIHVzZSBpdCBhcyBhIHNvcnQga2V5LiBJZiBhbiBfSWRNYXAgaXMgcGFzc2VkIGluIHRoZSAnZGlzdGFuY2VzJ1xuICAvLyBhcmd1bWVudCwgdGhpcyBmdW5jdGlvbiB3aWxsIGNsZWFyIGl0IGFuZCB1c2UgaXQgZm9yIHRoaXMgcHVycG9zZVxuICAvLyAob3RoZXJ3aXNlIGl0IHdpbGwganVzdCBjcmVhdGUgaXRzIG93biBfSWRNYXApLiBUaGUgb2JzZXJ2ZUNoYW5nZXNcbiAgLy8gaW1wbGVtZW50YXRpb24gdXNlcyB0aGlzIHRvIHJlbWVtYmVyIHRoZSBkaXN0YW5jZXMgYWZ0ZXIgdGhpcyBmdW5jdGlvblxuICAvLyByZXR1cm5zLlxuICBfZ2V0UmF3T2JqZWN0cyhvcHRpb25zID0ge30pIHtcbiAgICAvLyBCeSBkZWZhdWx0IHRoaXMgbWV0aG9kIHdpbGwgcmVzcGVjdCBza2lwIGFuZCBsaW1pdCBiZWNhdXNlIC5mZXRjaCgpLFxuICAgIC8vIC5mb3JFYWNoKCkgZXRjLi4uIGV4cGVjdCB0aGlzIGJlaGF2aW91ci4gSXQgY2FuIGJlIGZvcmNlZCB0byBpZ25vcmVcbiAgICAvLyBza2lwIGFuZCBsaW1pdCBieSBzZXR0aW5nIGFwcGx5U2tpcExpbWl0IHRvIGZhbHNlICguY291bnQoKSBkb2VzIHRoaXMsXG4gICAgLy8gZm9yIGV4YW1wbGUpXG4gICAgY29uc3QgYXBwbHlTa2lwTGltaXQgPSBvcHRpb25zLmFwcGx5U2tpcExpbWl0ICE9PSBmYWxzZTtcblxuICAgIC8vIFhYWCB1c2UgT3JkZXJlZERpY3QgaW5zdGVhZCBvZiBhcnJheSwgYW5kIG1ha2UgSWRNYXAgYW5kIE9yZGVyZWREaWN0XG4gICAgLy8gY29tcGF0aWJsZVxuICAgIGNvbnN0IHJlc3VsdHMgPSBvcHRpb25zLm9yZGVyZWQgPyBbXSA6IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwKCk7XG5cbiAgICAvLyBmYXN0IHBhdGggZm9yIHNpbmdsZSBJRCB2YWx1ZVxuICAgIGlmICh0aGlzLl9zZWxlY3RvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIElmIHlvdSBoYXZlIG5vbi16ZXJvIHNraXAgYW5kIGFzayBmb3IgYSBzaW5nbGUgaWQsIHlvdSBnZXQgbm90aGluZy5cbiAgICAgIC8vIFRoaXMgaXMgc28gaXQgbWF0Y2hlcyB0aGUgYmVoYXZpb3Igb2YgdGhlICd7X2lkOiBmb299JyBwYXRoLlxuICAgICAgaWYgKGFwcGx5U2tpcExpbWl0ICYmIHRoaXMuc2tpcCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2VsZWN0ZWREb2MgPSB0aGlzLmNvbGxlY3Rpb24uX2RvY3MuZ2V0KHRoaXMuX3NlbGVjdG9ySWQpO1xuICAgICAgaWYgKHNlbGVjdGVkRG9jKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm9yZGVyZWQpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goc2VsZWN0ZWREb2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMuc2V0KHRoaXMuX3NlbGVjdG9ySWQsIHNlbGVjdGVkRG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gc2xvdyBwYXRoIGZvciBhcmJpdHJhcnkgc2VsZWN0b3IsIHNvcnQsIHNraXAsIGxpbWl0XG5cbiAgICAvLyBpbiB0aGUgb2JzZXJ2ZUNoYW5nZXMgY2FzZSwgZGlzdGFuY2VzIGlzIGFjdHVhbGx5IHBhcnQgb2YgdGhlIFwicXVlcnlcIlxuICAgIC8vIChpZSwgbGl2ZSByZXN1bHRzIHNldCkgb2JqZWN0LiAgaW4gb3RoZXIgY2FzZXMsIGRpc3RhbmNlcyBpcyBvbmx5IHVzZWRcbiAgICAvLyBpbnNpZGUgdGhpcyBmdW5jdGlvbi5cbiAgICBsZXQgZGlzdGFuY2VzO1xuICAgIGlmICh0aGlzLm1hdGNoZXIuaGFzR2VvUXVlcnkoKSAmJiBvcHRpb25zLm9yZGVyZWQpIHtcbiAgICAgIGlmIChvcHRpb25zLmRpc3RhbmNlcykge1xuICAgICAgICBkaXN0YW5jZXMgPSBvcHRpb25zLmRpc3RhbmNlcztcbiAgICAgICAgZGlzdGFuY2VzLmNsZWFyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXN0YW5jZXMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE1ldGVvci5fcnVuRnJlc2goKCkgPT4ge1xuICAgICAgdGhpcy5jb2xsZWN0aW9uLl9kb2NzLmZvckVhY2goKGRvYywgaWQpID0+IHtcbiAgICAgICAgY29uc3QgbWF0Y2hSZXN1bHQgPSB0aGlzLm1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKGRvYyk7XG4gICAgICAgIGlmIChtYXRjaFJlc3VsdC5yZXN1bHQpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5vcmRlcmVkKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goZG9jKTtcblxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlcyAmJiBtYXRjaFJlc3VsdC5kaXN0YW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGRpc3RhbmNlcy5zZXQoaWQsIG1hdGNoUmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0cy5zZXQoaWQsIGRvYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgdG8gZW5zdXJlIGFsbCBkb2NzIGFyZSBtYXRjaGVkIGlmIGlnbm9yaW5nIHNraXAgJiBsaW1pdFxuICAgICAgICBpZiAoIWFwcGx5U2tpcExpbWl0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGYXN0IHBhdGggZm9yIGxpbWl0ZWQgdW5zb3J0ZWQgcXVlcmllcy5cbiAgICAgICAgLy8gWFhYICdsZW5ndGgnIGNoZWNrIGhlcmUgc2VlbXMgd3JvbmcgZm9yIG9yZGVyZWRcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAhdGhpcy5saW1pdCB8fCB0aGlzLnNraXAgfHwgdGhpcy5zb3J0ZXIgfHwgcmVzdWx0cy5sZW5ndGggIT09IHRoaXMubGltaXRcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKCFvcHRpb25zLm9yZGVyZWQpIHtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNvcnRlcikge1xuICAgICAgcmVzdWx0cy5zb3J0KHRoaXMuc29ydGVyLmdldENvbXBhcmF0b3IoeyBkaXN0YW5jZXMgfSkpO1xuICAgIH1cblxuICAgIC8vIFJldHVybiB0aGUgZnVsbCBzZXQgb2YgcmVzdWx0cyBpZiB0aGVyZSBpcyBubyBza2lwIG9yIGxpbWl0IG9yIGlmIHdlJ3JlXG4gICAgLy8gaWdub3JpbmcgdGhlbVxuICAgIGlmICghYXBwbHlTa2lwTGltaXQgfHwgKCF0aGlzLmxpbWl0ICYmICF0aGlzLnNraXApKSB7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cy5zbGljZShcbiAgICAgIHRoaXMuc2tpcCxcbiAgICAgIHRoaXMubGltaXQgPyB0aGlzLmxpbWl0ICsgdGhpcy5za2lwIDogcmVzdWx0cy5sZW5ndGhcbiAgICApO1xuICB9XG5cbiAgX3B1Ymxpc2hDdXJzb3Ioc3Vic2NyaXB0aW9uKSB7XG4gICAgLy8gWFhYIG1pbmltb25nbyBzaG91bGQgbm90IGRlcGVuZCBvbiBtb25nby1saXZlZGF0YSFcbiAgICBpZiAoIVBhY2thZ2UubW9uZ28pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJDYW4ndCBwdWJsaXNoIGZyb20gTWluaW1vbmdvIHdpdGhvdXQgdGhlIGBtb25nb2AgcGFja2FnZS5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuY29sbGVjdGlvbi5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiQ2FuJ3QgcHVibGlzaCBhIGN1cnNvciBmcm9tIGEgY29sbGVjdGlvbiB3aXRob3V0IGEgbmFtZS5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUGFja2FnZS5tb25nby5Nb25nby5Db2xsZWN0aW9uLl9wdWJsaXNoQ3Vyc29yKFxuICAgICAgdGhpcyxcbiAgICAgIHN1YnNjcmlwdGlvbixcbiAgICAgIHRoaXMuY29sbGVjdGlvbi5uYW1lXG4gICAgKTtcbiAgfVxufVxuXG4vLyBJbXBsZW1lbnRzIGFzeW5jIHZlcnNpb24gb2YgY3Vyc29yIG1ldGhvZHMgdG8ga2VlcCBjb2xsZWN0aW9ucyBpc29tb3JwaGljXG5BU1lOQ19DVVJTT1JfTUVUSE9EUy5mb3JFYWNoKG1ldGhvZCA9PiB7XG4gIGNvbnN0IGFzeW5jTmFtZSA9IGdldEFzeW5jTWV0aG9kTmFtZShtZXRob2QpO1xuXG4gIGlmIChDdXJzb3IucHJvdG90eXBlW2FzeW5jTmFtZV0pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBDdXJzb3IucHJvdG90eXBlW2FzeW5jTmFtZV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH07XG59KTtcbiIsImltcG9ydCBDdXJzb3IgZnJvbSAnLi9jdXJzb3IuanMnO1xuaW1wb3J0IE9ic2VydmVIYW5kbGUgZnJvbSAnLi9vYnNlcnZlX2hhbmRsZS5qcyc7XG5pbXBvcnQge1xuICBoYXNPd24sXG4gIGlzSW5kZXhhYmxlLFxuICBpc051bWVyaWNLZXksXG4gIGlzT3BlcmF0b3JPYmplY3QsXG4gIHBvcHVsYXRlRG9jdW1lbnRXaXRoUXVlcnlGaWVsZHMsXG4gIHByb2plY3Rpb25EZXRhaWxzLFxufSBmcm9tICcuL2NvbW1vbi5qcyc7XG5cbmltcG9ydCB7IGdldEFzeW5jTWV0aG9kTmFtZSB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLy8gWFhYIHR5cGUgY2hlY2tpbmcgb24gc2VsZWN0b3JzIChncmFjZWZ1bCBlcnJvciBpZiBtYWxmb3JtZWQpXG5cbi8vIExvY2FsQ29sbGVjdGlvbjogYSBzZXQgb2YgZG9jdW1lbnRzIHRoYXQgc3VwcG9ydHMgcXVlcmllcyBhbmQgbW9kaWZpZXJzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxDb2xsZWN0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgLy8gX2lkIC0+IGRvY3VtZW50IChhbHNvIGNvbnRhaW5pbmcgaWQpXG4gICAgdGhpcy5fZG9jcyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZVF1ZXVlID0gTWV0ZW9yLmlzQ2xpZW50XG4gICAgICA/IG5ldyBNZXRlb3IuX1N5bmNocm9ub3VzUXVldWUoKVxuICAgICAgOiBuZXcgTWV0ZW9yLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuXG4gICAgdGhpcy5uZXh0X3FpZCA9IDE7IC8vIGxpdmUgcXVlcnkgaWQgZ2VuZXJhdG9yXG5cbiAgICAvLyBxaWQgLT4gbGl2ZSBxdWVyeSBvYmplY3QuIGtleXM6XG4gICAgLy8gIG9yZGVyZWQ6IGJvb2wuIG9yZGVyZWQgcXVlcmllcyBoYXZlIGFkZGVkQmVmb3JlL21vdmVkQmVmb3JlIGNhbGxiYWNrcy5cbiAgICAvLyAgcmVzdWx0czogYXJyYXkgKG9yZGVyZWQpIG9yIG9iamVjdCAodW5vcmRlcmVkKSBvZiBjdXJyZW50IHJlc3VsdHNcbiAgICAvLyAgICAoYWxpYXNlZCB3aXRoIHRoaXMuX2RvY3MhKVxuICAgIC8vICByZXN1bHRzU25hcHNob3Q6IHNuYXBzaG90IG9mIHJlc3VsdHMuIG51bGwgaWYgbm90IHBhdXNlZC5cbiAgICAvLyAgY3Vyc29yOiBDdXJzb3Igb2JqZWN0IGZvciB0aGUgcXVlcnkuXG4gICAgLy8gIHNlbGVjdG9yLCBzb3J0ZXIsIChjYWxsYmFja3MpOiBmdW5jdGlvbnNcbiAgICB0aGlzLnF1ZXJpZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgLy8gbnVsbCBpZiBub3Qgc2F2aW5nIG9yaWdpbmFsczsgYW4gSWRNYXAgZnJvbSBpZCB0byBvcmlnaW5hbCBkb2N1bWVudCB2YWx1ZVxuICAgIC8vIGlmIHNhdmluZyBvcmlnaW5hbHMuIFNlZSBjb21tZW50cyBiZWZvcmUgc2F2ZU9yaWdpbmFscygpLlxuICAgIHRoaXMuX3NhdmVkT3JpZ2luYWxzID0gbnVsbDtcblxuICAgIC8vIFRydWUgd2hlbiBvYnNlcnZlcnMgYXJlIHBhdXNlZCBhbmQgd2Ugc2hvdWxkIG5vdCBzZW5kIGNhbGxiYWNrcy5cbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgY291bnREb2N1bWVudHMoc2VsZWN0b3IsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kKHNlbGVjdG9yID8/IHt9LCBvcHRpb25zKS5jb3VudEFzeW5jKCk7XG4gIH1cblxuICBlc3RpbWF0ZWREb2N1bWVudENvdW50KG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kKHt9LCBvcHRpb25zKS5jb3VudEFzeW5jKCk7XG4gIH1cblxuICAvLyBvcHRpb25zIG1heSBpbmNsdWRlIHNvcnQsIHNraXAsIGxpbWl0LCByZWFjdGl2ZVxuICAvLyBzb3J0IG1heSBiZSBhbnkgb2YgdGhlc2UgZm9ybXM6XG4gIC8vICAgICB7YTogMSwgYjogLTF9XG4gIC8vICAgICBbW1wiYVwiLCBcImFzY1wiXSwgW1wiYlwiLCBcImRlc2NcIl1dXG4gIC8vICAgICBbXCJhXCIsIFtcImJcIiwgXCJkZXNjXCJdXVxuICAvLyAgIChpbiB0aGUgZmlyc3QgZm9ybSB5b3UncmUgYmVob2xkZW4gdG8ga2V5IGVudW1lcmF0aW9uIG9yZGVyIGluXG4gIC8vICAgeW91ciBqYXZhc2NyaXB0IFZNKVxuICAvL1xuICAvLyByZWFjdGl2ZTogaWYgZ2l2ZW4sIGFuZCBmYWxzZSwgZG9uJ3QgcmVnaXN0ZXIgd2l0aCBUcmFja2VyIChkZWZhdWx0XG4gIC8vIGlzIHRydWUpXG4gIC8vXG4gIC8vIFhYWCBwb3NzaWJseSBzaG91bGQgc3VwcG9ydCByZXRyaWV2aW5nIGEgc3Vic2V0IG9mIGZpZWxkcz8gYW5kXG4gIC8vIGhhdmUgaXQgYmUgYSBoaW50IChpZ25vcmVkIG9uIHRoZSBjbGllbnQsIHdoZW4gbm90IGNvcHlpbmcgdGhlXG4gIC8vIGRvYz8pXG4gIC8vXG4gIC8vIFhYWCBzb3J0IGRvZXMgbm90IHlldCBzdXBwb3J0IHN1YmtleXMgKCdhLmInKSAuLiBmaXggdGhhdCFcbiAgLy8gWFhYIGFkZCBvbmUgbW9yZSBzb3J0IGZvcm06IFwia2V5XCJcbiAgLy8gWFhYIHRlc3RzXG4gIGZpbmQoc2VsZWN0b3IsIG9wdGlvbnMpIHtcbiAgICAvLyBkZWZhdWx0IHN5bnRheCBmb3IgZXZlcnl0aGluZyBpcyB0byBvbWl0IHRoZSBzZWxlY3RvciBhcmd1bWVudC5cbiAgICAvLyBidXQgaWYgc2VsZWN0b3IgaXMgZXhwbGljaXRseSBwYXNzZWQgaW4gYXMgZmFsc2Ugb3IgdW5kZWZpbmVkLCB3ZVxuICAgIC8vIHdhbnQgYSBzZWxlY3RvciB0aGF0IG1hdGNoZXMgbm90aGluZy5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2VsZWN0b3IgPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExvY2FsQ29sbGVjdGlvbi5DdXJzb3IodGhpcywgc2VsZWN0b3IsIG9wdGlvbnMpO1xuICB9XG5cbiAgZmluZE9uZShzZWxlY3Rvciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHNlbGVjdG9yID0ge307XG4gICAgfVxuXG4gICAgLy8gTk9URTogYnkgc2V0dGluZyBsaW1pdCAxIGhlcmUsIHdlIGVuZCB1cCB1c2luZyB2ZXJ5IGluZWZmaWNpZW50XG4gICAgLy8gY29kZSB0aGF0IHJlY29tcHV0ZXMgdGhlIHdob2xlIHF1ZXJ5IG9uIGVhY2ggdXBkYXRlLiBUaGUgdXBzaWRlIGlzXG4gICAgLy8gdGhhdCB3aGVuIHlvdSByZWFjdGl2ZWx5IGRlcGVuZCBvbiBhIGZpbmRPbmUgeW91IG9ubHkgZ2V0XG4gICAgLy8gaW52YWxpZGF0ZWQgd2hlbiB0aGUgZm91bmQgb2JqZWN0IGNoYW5nZXMsIG5vdCBhbnkgb2JqZWN0IGluIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24uIE1vc3QgZmluZE9uZSB3aWxsIGJlIGJ5IGlkLCB3aGljaCBoYXMgYSBmYXN0IHBhdGgsIHNvXG4gICAgLy8gdGhpcyBtaWdodCBub3QgYmUgYSBiaWcgZGVhbC4gSW4gbW9zdCBjYXNlcywgaW52YWxpZGF0aW9uIGNhdXNlc1xuICAgIC8vIHRoZSBjYWxsZWQgdG8gcmUtcXVlcnkgYW55d2F5LCBzbyB0aGlzIHNob3VsZCBiZSBhIG5ldCBwZXJmb3JtYW5jZVxuICAgIC8vIGltcHJvdmVtZW50LlxuICAgIG9wdGlvbnMubGltaXQgPSAxO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluZChzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKVswXTtcbiAgfVxuICBhc3luYyBmaW5kT25lQXN5bmMoc2VsZWN0b3IsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzZWxlY3RvciA9IHt9O1xuICAgIH1cbiAgICBvcHRpb25zLmxpbWl0ID0gMTtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZmluZChzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2hBc3luYygpKVswXTtcbiAgfVxuICBwcmVwYXJlSW5zZXJ0KGRvYykge1xuICAgIGFzc2VydEhhc1ZhbGlkRmllbGROYW1lcyhkb2MpO1xuXG4gICAgLy8gaWYgeW91IHJlYWxseSB3YW50IHRvIHVzZSBPYmplY3RJRHMsIHNldCB0aGlzIGdsb2JhbC5cbiAgICAvLyBNb25nby5Db2xsZWN0aW9uIHNwZWNpZmllcyBpdHMgb3duIGlkcyBhbmQgZG9lcyBub3QgdXNlIHRoaXMgY29kZS5cbiAgICBpZiAoIWhhc093bi5jYWxsKGRvYywgJ19pZCcpKSB7XG4gICAgICBkb2MuX2lkID0gTG9jYWxDb2xsZWN0aW9uLl91c2VPSUQgPyBuZXcgTW9uZ29JRC5PYmplY3RJRCgpIDogUmFuZG9tLmlkKCk7XG4gICAgfVxuXG4gICAgY29uc3QgaWQgPSBkb2MuX2lkO1xuXG4gICAgaWYgKHRoaXMuX2RvY3MuaGFzKGlkKSkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoYER1cGxpY2F0ZSBfaWQgJyR7aWR9J2ApO1xuICAgIH1cblxuICAgIHRoaXMuX3NhdmVPcmlnaW5hbChpZCwgdW5kZWZpbmVkKTtcbiAgICB0aGlzLl9kb2NzLnNldChpZCwgZG9jKTtcblxuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8vIFhYWCBwb3NzaWJseSBlbmZvcmNlIHRoYXQgJ3VuZGVmaW5lZCcgZG9lcyBub3QgYXBwZWFyICh3ZSBhc3N1bWVcbiAgLy8gdGhpcyBpbiBvdXIgaGFuZGxpbmcgb2YgbnVsbCBhbmQgJGV4aXN0cylcbiAgaW5zZXJ0KGRvYywgY2FsbGJhY2spIHtcbiAgICBkb2MgPSBFSlNPTi5jbG9uZShkb2MpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5wcmVwYXJlSW5zZXJ0KGRvYyk7XG4gICAgY29uc3QgcXVlcmllc1RvUmVjb21wdXRlID0gW107XG5cbiAgICAvLyB0cmlnZ2VyIGxpdmUgcXVlcmllcyB0aGF0IG1hdGNoXG4gICAgZm9yIChjb25zdCBxaWQgb2YgT2JqZWN0LmtleXModGhpcy5xdWVyaWVzKSkge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5LmRpcnR5KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRjaFJlc3VsdCA9IHF1ZXJ5Lm1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKGRvYyk7XG5cbiAgICAgIGlmIChtYXRjaFJlc3VsdC5yZXN1bHQpIHtcbiAgICAgICAgaWYgKHF1ZXJ5LmRpc3RhbmNlcyAmJiBtYXRjaFJlc3VsdC5kaXN0YW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcXVlcnkuZGlzdGFuY2VzLnNldChpZCwgbWF0Y2hSZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHF1ZXJ5LmN1cnNvci5za2lwIHx8IHF1ZXJ5LmN1cnNvci5saW1pdCkge1xuICAgICAgICAgIHF1ZXJpZXNUb1JlY29tcHV0ZS5wdXNoKHFpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblJlc3VsdHNTeW5jKHF1ZXJ5LCBkb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcXVlcmllc1RvUmVjb21wdXRlLmZvckVhY2gocWlkID0+IHtcbiAgICAgIGlmICh0aGlzLnF1ZXJpZXNbcWlkXSkge1xuICAgICAgICB0aGlzLl9yZWNvbXB1dGVSZXN1bHRzKHRoaXMucXVlcmllc1txaWRdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX29ic2VydmVRdWV1ZS5kcmFpbigpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgaWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGFzeW5jIGluc2VydEFzeW5jKGRvYywgY2FsbGJhY2spIHtcbiAgICBkb2MgPSBFSlNPTi5jbG9uZShkb2MpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5wcmVwYXJlSW5zZXJ0KGRvYyk7XG4gICAgY29uc3QgcXVlcmllc1RvUmVjb21wdXRlID0gW107XG5cbiAgICAvLyB0cmlnZ2VyIGxpdmUgcXVlcmllcyB0aGF0IG1hdGNoXG4gICAgZm9yIChjb25zdCBxaWQgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcmllc1txaWRdO1xuXG4gICAgICBpZiAocXVlcnkuZGlydHkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoUmVzdWx0ID0gcXVlcnkubWF0Y2hlci5kb2N1bWVudE1hdGNoZXMoZG9jKTtcblxuICAgICAgaWYgKG1hdGNoUmVzdWx0LnJlc3VsdCkge1xuICAgICAgICBpZiAocXVlcnkuZGlzdGFuY2VzICYmIG1hdGNoUmVzdWx0LmRpc3RhbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBxdWVyeS5kaXN0YW5jZXMuc2V0KGlkLCBtYXRjaFJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocXVlcnkuY3Vyc29yLnNraXAgfHwgcXVlcnkuY3Vyc29yLmxpbWl0KSB7XG4gICAgICAgICAgcXVlcmllc1RvUmVjb21wdXRlLnB1c2gocWlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBMb2NhbENvbGxlY3Rpb24uX2luc2VydEluUmVzdWx0c0FzeW5jKHF1ZXJ5LCBkb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcXVlcmllc1RvUmVjb21wdXRlLmZvckVhY2gocWlkID0+IHtcbiAgICAgIGlmICh0aGlzLnF1ZXJpZXNbcWlkXSkge1xuICAgICAgICB0aGlzLl9yZWNvbXB1dGVSZXN1bHRzKHRoaXMucXVlcmllc1txaWRdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuX29ic2VydmVRdWV1ZS5kcmFpbigpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgaWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgLy8gUGF1c2UgdGhlIG9ic2VydmVycy4gTm8gY2FsbGJhY2tzIGZyb20gb2JzZXJ2ZXJzIHdpbGwgZmlyZSB1bnRpbFxuICAvLyAncmVzdW1lT2JzZXJ2ZXJzJyBpcyBjYWxsZWQuXG4gIHBhdXNlT2JzZXJ2ZXJzKCkge1xuICAgIC8vIE5vLW9wIGlmIGFscmVhZHkgcGF1c2VkLlxuICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgJ3BhdXNlZCcgZmxhZyBzdWNoIHRoYXQgbmV3IG9ic2VydmVyIG1lc3NhZ2VzIGRvbid0IGZpcmUuXG4gICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuXG4gICAgLy8gVGFrZSBhIHNuYXBzaG90IG9mIHRoZSBxdWVyeSByZXN1bHRzIGZvciBlYWNoIHF1ZXJ5LlxuICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcmllcykuZm9yRWFjaChxaWQgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcbiAgICAgIHF1ZXJ5LnJlc3VsdHNTbmFwc2hvdCA9IEVKU09OLmNsb25lKHF1ZXJ5LnJlc3VsdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJSZXN1bHRRdWVyaWVzKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZG9jcy5zaXplKCk7XG5cbiAgICB0aGlzLl9kb2NzLmNsZWFyKCk7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJpZXMpLmZvckVhY2gocWlkID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW3FpZF07XG5cbiAgICAgIGlmIChxdWVyeS5vcmRlcmVkKSB7XG4gICAgICAgIHF1ZXJ5LnJlc3VsdHMgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5LnJlc3VsdHMuY2xlYXIoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIHByZXBhcmVSZW1vdmUoc2VsZWN0b3IpIHtcbiAgICBjb25zdCBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHNlbGVjdG9yKTtcbiAgICBjb25zdCByZW1vdmUgPSBbXTtcblxuICAgIHRoaXMuX2VhY2hQb3NzaWJseU1hdGNoaW5nRG9jU3luYyhzZWxlY3RvciwgKGRvYywgaWQpID0+IHtcbiAgICAgIGlmIChtYXRjaGVyLmRvY3VtZW50TWF0Y2hlcyhkb2MpLnJlc3VsdCkge1xuICAgICAgICByZW1vdmUucHVzaChpZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBxdWVyaWVzVG9SZWNvbXB1dGUgPSBbXTtcbiAgICBjb25zdCBxdWVyeVJlbW92ZSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlbW92ZUlkID0gcmVtb3ZlW2ldO1xuICAgICAgY29uc3QgcmVtb3ZlRG9jID0gdGhpcy5fZG9jcy5nZXQocmVtb3ZlSWQpO1xuXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJpZXMpLmZvckVhY2gocWlkID0+IHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgICBpZiAocXVlcnkuZGlydHkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocXVlcnkubWF0Y2hlci5kb2N1bWVudE1hdGNoZXMocmVtb3ZlRG9jKS5yZXN1bHQpIHtcbiAgICAgICAgICBpZiAocXVlcnkuY3Vyc29yLnNraXAgfHwgcXVlcnkuY3Vyc29yLmxpbWl0KSB7XG4gICAgICAgICAgICBxdWVyaWVzVG9SZWNvbXB1dGUucHVzaChxaWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWVyeVJlbW92ZS5wdXNoKHtxaWQsIGRvYzogcmVtb3ZlRG9jfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fc2F2ZU9yaWdpbmFsKHJlbW92ZUlkLCByZW1vdmVEb2MpO1xuICAgICAgdGhpcy5fZG9jcy5yZW1vdmUocmVtb3ZlSWQpO1xuICAgIH1cblxuICAgIHJldHVybiB7IHF1ZXJpZXNUb1JlY29tcHV0ZSwgcXVlcnlSZW1vdmUsIHJlbW92ZSB9O1xuICB9XG5cbiAgcmVtb3ZlKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIC8vIEVhc3kgc3BlY2lhbCBjYXNlOiBpZiB3ZSdyZSBub3QgY2FsbGluZyBvYnNlcnZlQ2hhbmdlcyBjYWxsYmFja3MgYW5kXG4gICAgLy8gd2UncmUgbm90IHNhdmluZyBvcmlnaW5hbHMgYW5kIHdlIGdvdCBhc2tlZCB0byByZW1vdmUgZXZlcnl0aGluZywgdGhlblxuICAgIC8vIGp1c3QgZW1wdHkgZXZlcnl0aGluZyBkaXJlY3RseS5cbiAgICBpZiAodGhpcy5wYXVzZWQgJiYgIXRoaXMuX3NhdmVkT3JpZ2luYWxzICYmIEVKU09OLmVxdWFscyhzZWxlY3Rvciwge30pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbGVhclJlc3VsdFF1ZXJpZXMoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcXVlcmllc1RvUmVjb21wdXRlLCBxdWVyeVJlbW92ZSwgcmVtb3ZlIH0gPSB0aGlzLnByZXBhcmVSZW1vdmUoc2VsZWN0b3IpO1xuXG4gICAgLy8gcnVuIGxpdmUgcXVlcnkgY2FsbGJhY2tzIF9hZnRlcl8gd2UndmUgcmVtb3ZlZCB0aGUgZG9jdW1lbnRzLlxuICAgIHF1ZXJ5UmVtb3ZlLmZvckVhY2gocmVtb3ZlID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW3JlbW92ZS5xaWRdO1xuXG4gICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgcXVlcnkuZGlzdGFuY2VzICYmIHF1ZXJ5LmRpc3RhbmNlcy5yZW1vdmUocmVtb3ZlLmRvYy5faWQpO1xuICAgICAgICBMb2NhbENvbGxlY3Rpb24uX3JlbW92ZUZyb21SZXN1bHRzU3luYyhxdWVyeSwgcmVtb3ZlLmRvYyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBxdWVyaWVzVG9SZWNvbXB1dGUuZm9yRWFjaChxaWQgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuX3JlY29tcHV0ZVJlc3VsdHMocXVlcnkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZVF1ZXVlLmRyYWluKCk7XG5cbiAgICBjb25zdCByZXN1bHQgPSByZW1vdmUubGVuZ3RoO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBNZXRlb3IuZGVmZXIoKCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUFzeW5jKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIC8vIEVhc3kgc3BlY2lhbCBjYXNlOiBpZiB3ZSdyZSBub3QgY2FsbGluZyBvYnNlcnZlQ2hhbmdlcyBjYWxsYmFja3MgYW5kXG4gICAgLy8gd2UncmUgbm90IHNhdmluZyBvcmlnaW5hbHMgYW5kIHdlIGdvdCBhc2tlZCB0byByZW1vdmUgZXZlcnl0aGluZywgdGhlblxuICAgIC8vIGp1c3QgZW1wdHkgZXZlcnl0aGluZyBkaXJlY3RseS5cbiAgICBpZiAodGhpcy5wYXVzZWQgJiYgIXRoaXMuX3NhdmVkT3JpZ2luYWxzICYmIEVKU09OLmVxdWFscyhzZWxlY3Rvciwge30pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbGVhclJlc3VsdFF1ZXJpZXMoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcXVlcmllc1RvUmVjb21wdXRlLCBxdWVyeVJlbW92ZSwgcmVtb3ZlIH0gPSB0aGlzLnByZXBhcmVSZW1vdmUoc2VsZWN0b3IpO1xuXG4gICAgLy8gcnVuIGxpdmUgcXVlcnkgY2FsbGJhY2tzIF9hZnRlcl8gd2UndmUgcmVtb3ZlZCB0aGUgZG9jdW1lbnRzLlxuICAgIGZvciAoY29uc3QgcmVtb3ZlIG9mIHF1ZXJ5UmVtb3ZlKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcmllc1tyZW1vdmUucWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHF1ZXJ5LmRpc3RhbmNlcyAmJiBxdWVyeS5kaXN0YW5jZXMucmVtb3ZlKHJlbW92ZS5kb2MuX2lkKTtcbiAgICAgICAgYXdhaXQgTG9jYWxDb2xsZWN0aW9uLl9yZW1vdmVGcm9tUmVzdWx0c0FzeW5jKHF1ZXJ5LCByZW1vdmUuZG9jKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcXVlcmllc1RvUmVjb21wdXRlLmZvckVhY2gocWlkID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW3FpZF07XG5cbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICB0aGlzLl9yZWNvbXB1dGVSZXN1bHRzKHF1ZXJ5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuX29ic2VydmVRdWV1ZS5kcmFpbigpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gcmVtb3ZlLmxlbmd0aDtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBSZXN1bWUgdGhlIG9ic2VydmVycy4gT2JzZXJ2ZXJzIGltbWVkaWF0ZWx5IHJlY2VpdmUgY2hhbmdlXG4gIC8vIG5vdGlmaWNhdGlvbnMgdG8gYnJpbmcgdGhlbSB0byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGVcbiAgLy8gZGF0YWJhc2UuIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBqdXN0IHJlcGxheWluZyBhbGwgdGhlIGNoYW5nZXMgdGhhdFxuICAvLyBoYXBwZW5lZCBkdXJpbmcgdGhlIHBhdXNlLCBpdCBpcyBhIHNtYXJ0ZXIgJ2NvYWxlc2NlZCcgZGlmZi5cbiAgX3Jlc3VtZU9ic2VydmVycygpIHtcbiAgICAvLyBOby1vcCBpZiBub3QgcGF1c2VkLlxuICAgIGlmICghdGhpcy5wYXVzZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVbnNldCB0aGUgJ3BhdXNlZCcgZmxhZy4gTWFrZSBzdXJlIHRvIGRvIHRoaXMgZmlyc3QsIG90aGVyd2lzZVxuICAgIC8vIG9ic2VydmVyIG1ldGhvZHMgd29uJ3QgYWN0dWFsbHkgZmlyZSB3aGVuIHdlIHRyaWdnZXIgdGhlbS5cbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5xdWVyaWVzKS5mb3JFYWNoKHFpZCA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcmllc1txaWRdO1xuXG4gICAgICBpZiAocXVlcnkuZGlydHkpIHtcbiAgICAgICAgcXVlcnkuZGlydHkgPSBmYWxzZTtcblxuICAgICAgICAvLyByZS1jb21wdXRlIHJlc3VsdHMgd2lsbCBwZXJmb3JtIGBMb2NhbENvbGxlY3Rpb24uX2RpZmZRdWVyeUNoYW5nZXNgXG4gICAgICAgIC8vIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgIHRoaXMuX3JlY29tcHV0ZVJlc3VsdHMocXVlcnksIHF1ZXJ5LnJlc3VsdHNTbmFwc2hvdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEaWZmIHRoZSBjdXJyZW50IHJlc3VsdHMgYWdhaW5zdCB0aGUgc25hcHNob3QgYW5kIHNlbmQgdG8gb2JzZXJ2ZXJzLlxuICAgICAgICAvLyBwYXNzIHRoZSBxdWVyeSBvYmplY3QgZm9yIGl0cyBvYnNlcnZlciBjYWxsYmFja3MuXG4gICAgICAgIExvY2FsQ29sbGVjdGlvbi5fZGlmZlF1ZXJ5Q2hhbmdlcyhcbiAgICAgICAgICBxdWVyeS5vcmRlcmVkLFxuICAgICAgICAgIHF1ZXJ5LnJlc3VsdHNTbmFwc2hvdCxcbiAgICAgICAgICBxdWVyeS5yZXN1bHRzLFxuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIHtwcm9qZWN0aW9uRm46IHF1ZXJ5LnByb2plY3Rpb25Gbn1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcXVlcnkucmVzdWx0c1NuYXBzaG90ID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHJlc3VtZU9ic2VydmVyc1NlcnZlcigpIHtcbiAgICB0aGlzLl9yZXN1bWVPYnNlcnZlcnMoKTtcbiAgICBhd2FpdCB0aGlzLl9vYnNlcnZlUXVldWUuZHJhaW4oKTtcbiAgfVxuICByZXN1bWVPYnNlcnZlcnNDbGllbnQoKSB7XG4gICAgdGhpcy5fcmVzdW1lT2JzZXJ2ZXJzKCk7XG4gICAgdGhpcy5fb2JzZXJ2ZVF1ZXVlLmRyYWluKCk7XG4gIH1cblxuICByZXRyaWV2ZU9yaWdpbmFscygpIHtcbiAgICBpZiAoIXRoaXMuX3NhdmVkT3JpZ2luYWxzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxlZCByZXRyaWV2ZU9yaWdpbmFscyB3aXRob3V0IHNhdmVPcmlnaW5hbHMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbHMgPSB0aGlzLl9zYXZlZE9yaWdpbmFscztcblxuICAgIHRoaXMuX3NhdmVkT3JpZ2luYWxzID0gbnVsbDtcblxuICAgIHJldHVybiBvcmlnaW5hbHM7XG4gIH1cblxuICAvLyBUbyB0cmFjayB3aGF0IGRvY3VtZW50cyBhcmUgYWZmZWN0ZWQgYnkgYSBwaWVjZSBvZiBjb2RlLCBjYWxsXG4gIC8vIHNhdmVPcmlnaW5hbHMoKSBiZWZvcmUgaXQgYW5kIHJldHJpZXZlT3JpZ2luYWxzKCkgYWZ0ZXIgaXQuXG4gIC8vIHJldHJpZXZlT3JpZ2luYWxzIHJldHVybnMgYW4gb2JqZWN0IHdob3NlIGtleXMgYXJlIHRoZSBpZHMgb2YgdGhlIGRvY3VtZW50c1xuICAvLyB0aGF0IHdlcmUgYWZmZWN0ZWQgc2luY2UgdGhlIGNhbGwgdG8gc2F2ZU9yaWdpbmFscygpLCBhbmQgdGhlIHZhbHVlcyBhcmVcbiAgLy8gZXF1YWwgdG8gdGhlIGRvY3VtZW50J3MgY29udGVudHMgYXQgdGhlIHRpbWUgb2Ygc2F2ZU9yaWdpbmFscy4gKEluIHRoZSBjYXNlXG4gIC8vIG9mIGFuIGluc2VydGVkIGRvY3VtZW50LCB1bmRlZmluZWQgaXMgdGhlIHZhbHVlLikgWW91IG11c3QgYWx0ZXJuYXRlXG4gIC8vIGJldHdlZW4gY2FsbHMgdG8gc2F2ZU9yaWdpbmFscygpIGFuZCByZXRyaWV2ZU9yaWdpbmFscygpLlxuICBzYXZlT3JpZ2luYWxzKCkge1xuICAgIGlmICh0aGlzLl9zYXZlZE9yaWdpbmFscykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsZWQgc2F2ZU9yaWdpbmFscyB0d2ljZSB3aXRob3V0IHJldHJpZXZlT3JpZ2luYWxzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2F2ZWRPcmlnaW5hbHMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgfVxuXG4gIHByZXBhcmVVcGRhdGUoc2VsZWN0b3IpIHtcbiAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCByZXN1bHRzIG9mIGFueSBxdWVyeSB0aGF0IHdlIG1pZ2h0IG5lZWQgdG9cbiAgICAvLyBfcmVjb21wdXRlUmVzdWx0cyBvbiwgYmVjYXVzZSBfbW9kaWZ5QW5kTm90aWZ5IHdpbGwgbXV0YXRlIHRoZSBvYmplY3RzIGluXG4gICAgLy8gaXQuIChXZSBkb24ndCBuZWVkIHRvIHNhdmUgdGhlIG9yaWdpbmFsIHJlc3VsdHMgb2YgcGF1c2VkIHF1ZXJpZXMgYmVjYXVzZVxuICAgIC8vIHRoZXkgYWxyZWFkeSBoYXZlIGEgcmVzdWx0c1NuYXBzaG90IGFuZCB3ZSB3b24ndCBiZSBkaWZmaW5nIGluXG4gICAgLy8gX3JlY29tcHV0ZVJlc3VsdHMuKVxuICAgIGNvbnN0IHFpZFRvT3JpZ2luYWxSZXN1bHRzID0ge307XG5cbiAgICAvLyBXZSBzaG91bGQgb25seSBjbG9uZSBlYWNoIGRvY3VtZW50IG9uY2UsIGV2ZW4gaWYgaXQgYXBwZWFycyBpbiBtdWx0aXBsZVxuICAgIC8vIHF1ZXJpZXNcbiAgICBjb25zdCBkb2NNYXAgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgICBjb25zdCBpZHNNYXRjaGVkID0gTG9jYWxDb2xsZWN0aW9uLl9pZHNNYXRjaGVkQnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJpZXMpLmZvckVhY2gocWlkID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW3FpZF07XG5cbiAgICAgIGlmICgocXVlcnkuY3Vyc29yLnNraXAgfHwgcXVlcnkuY3Vyc29yLmxpbWl0KSAmJiAhIHRoaXMucGF1c2VkKSB7XG4gICAgICAgIC8vIENhdGNoIHRoZSBjYXNlIG9mIGEgcmVhY3RpdmUgYGNvdW50KClgIG9uIGEgY3Vyc29yIHdpdGggc2tpcFxuICAgICAgICAvLyBvciBsaW1pdCwgd2hpY2ggcmVnaXN0ZXJzIGFuIHVub3JkZXJlZCBvYnNlcnZlLiBUaGlzIGlzIGFcbiAgICAgICAgLy8gcHJldHR5IHJhcmUgY2FzZSwgc28gd2UganVzdCBjbG9uZSB0aGUgZW50aXJlIHJlc3VsdCBzZXQgd2l0aFxuICAgICAgICAvLyBubyBvcHRpbWl6YXRpb25zIGZvciBkb2N1bWVudHMgdGhhdCBhcHBlYXIgaW4gdGhlc2UgcmVzdWx0XG4gICAgICAgIC8vIHNldHMgYW5kIG90aGVyIHF1ZXJpZXMuXG4gICAgICAgIGlmIChxdWVyeS5yZXN1bHRzIGluc3RhbmNlb2YgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcCkge1xuICAgICAgICAgIHFpZFRvT3JpZ2luYWxSZXN1bHRzW3FpZF0gPSBxdWVyeS5yZXN1bHRzLmNsb25lKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEocXVlcnkucmVzdWx0cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXNzZXJ0aW9uIGZhaWxlZDogcXVlcnkucmVzdWx0cyBub3QgYW4gYXJyYXknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsb25lcyBhIGRvY3VtZW50IHRvIGJlIHN0b3JlZCBpbiBgcWlkVG9PcmlnaW5hbFJlc3VsdHNgXG4gICAgICAgIC8vIGJlY2F1c2UgaXQgbWF5IGJlIG1vZGlmaWVkIGJlZm9yZSB0aGUgbmV3IGFuZCBvbGQgcmVzdWx0IHNldHNcbiAgICAgICAgLy8gYXJlIGRpZmZlZC4gQnV0IGlmIHdlIGtub3cgZXhhY3RseSB3aGljaCBkb2N1bWVudCBJRHMgd2UncmVcbiAgICAgICAgLy8gZ29pbmcgdG8gbW9kaWZ5LCB0aGVuIHdlIG9ubHkgbmVlZCB0byBjbG9uZSB0aG9zZS5cbiAgICAgICAgY29uc3QgbWVtb2l6ZWRDbG9uZUlmTmVlZGVkID0gZG9jID0+IHtcbiAgICAgICAgICBpZiAoZG9jTWFwLmhhcyhkb2MuX2lkKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY01hcC5nZXQoZG9jLl9pZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZG9jVG9NZW1vaXplID0gKFxuICAgICAgICAgICAgaWRzTWF0Y2hlZCAmJlxuICAgICAgICAgICAgIWlkc01hdGNoZWQuc29tZShpZCA9PiBFSlNPTi5lcXVhbHMoaWQsIGRvYy5faWQpKVxuICAgICAgICAgICkgPyBkb2MgOiBFSlNPTi5jbG9uZShkb2MpO1xuXG4gICAgICAgICAgZG9jTWFwLnNldChkb2MuX2lkLCBkb2NUb01lbW9pemUpO1xuXG4gICAgICAgICAgcmV0dXJuIGRvY1RvTWVtb2l6ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBxaWRUb09yaWdpbmFsUmVzdWx0c1txaWRdID0gcXVlcnkucmVzdWx0cy5tYXAobWVtb2l6ZWRDbG9uZUlmTmVlZGVkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBxaWRUb09yaWdpbmFsUmVzdWx0cztcbiAgfVxuXG4gIGZpbmlzaFVwZGF0ZSh7IG9wdGlvbnMsIHVwZGF0ZUNvdW50LCBjYWxsYmFjaywgaW5zZXJ0ZWRJZCB9KSB7XG5cblxuICAgIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3VtZW50cywgb3IgaW4gdGhlIHVwc2VydCBjYXNlLCBhbiBvYmplY3RcbiAgICAvLyBjb250YWluaW5nIHRoZSBudW1iZXIgb2YgYWZmZWN0ZWQgZG9jcyBhbmQgdGhlIGlkIG9mIHRoZSBkb2MgdGhhdCB3YXNcbiAgICAvLyBpbnNlcnRlZCwgaWYgYW55LlxuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKG9wdGlvbnMuX3JldHVybk9iamVjdCkge1xuICAgICAgcmVzdWx0ID0geyBudW1iZXJBZmZlY3RlZDogdXBkYXRlQ291bnQgfTtcblxuICAgICAgaWYgKGluc2VydGVkSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXN1bHQuaW5zZXJ0ZWRJZCA9IGluc2VydGVkSWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHVwZGF0ZUNvdW50O1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBYWFggYXRvbWljaXR5OiBpZiBtdWx0aSBpcyB0cnVlLCBhbmQgb25lIG1vZGlmaWNhdGlvbiBmYWlscywgZG9cbiAgLy8gd2Ugcm9sbGJhY2sgdGhlIHdob2xlIG9wZXJhdGlvbiwgb3Igd2hhdD9cbiAgYXN5bmMgdXBkYXRlQXN5bmMoc2VsZWN0b3IsIG1vZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAoISBjYWxsYmFjayAmJiBvcHRpb25zIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoc2VsZWN0b3IsIHRydWUpO1xuXG4gICAgY29uc3QgcWlkVG9PcmlnaW5hbFJlc3VsdHMgPSB0aGlzLnByZXBhcmVVcGRhdGUoc2VsZWN0b3IpO1xuXG4gICAgbGV0IHJlY29tcHV0ZVFpZHMgPSB7fTtcblxuICAgIGxldCB1cGRhdGVDb3VudCA9IDA7XG5cbiAgICBhd2FpdCB0aGlzLl9lYWNoUG9zc2libHlNYXRjaGluZ0RvY0FzeW5jKHNlbGVjdG9yLCBhc3luYyAoZG9jLCBpZCkgPT4ge1xuICAgICAgY29uc3QgcXVlcnlSZXN1bHQgPSBtYXRjaGVyLmRvY3VtZW50TWF0Y2hlcyhkb2MpO1xuXG4gICAgICBpZiAocXVlcnlSZXN1bHQucmVzdWx0KSB7XG4gICAgICAgIC8vIFhYWCBTaG91bGQgd2Ugc2F2ZSB0aGUgb3JpZ2luYWwgZXZlbiBpZiBtb2QgZW5kcyB1cCBiZWluZyBhIG5vLW9wP1xuICAgICAgICB0aGlzLl9zYXZlT3JpZ2luYWwoaWQsIGRvYyk7XG4gICAgICAgIHJlY29tcHV0ZVFpZHMgPSBhd2FpdCB0aGlzLl9tb2RpZnlBbmROb3RpZnlBc3luYyhcbiAgICAgICAgICBkb2MsXG4gICAgICAgICAgbW9kLFxuICAgICAgICAgIHF1ZXJ5UmVzdWx0LmFycmF5SW5kaWNlc1xuICAgICAgICApO1xuXG4gICAgICAgICsrdXBkYXRlQ291bnQ7XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLm11bHRpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXMocmVjb21wdXRlUWlkcykuZm9yRWFjaChxaWQgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuX3JlY29tcHV0ZVJlc3VsdHMocXVlcnksIHFpZFRvT3JpZ2luYWxSZXN1bHRzW3FpZF0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXdhaXQgdGhpcy5fb2JzZXJ2ZVF1ZXVlLmRyYWluKCk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgZG9pbmcgYW4gdXBzZXJ0LCBhbmQgd2UgZGlkbid0IG1vZGlmeSBhbnkgZG9jdW1lbnRzIHlldCwgdGhlblxuICAgIC8vIGl0J3MgdGltZSB0byBkbyBhbiBpbnNlcnQuIEZpZ3VyZSBvdXQgd2hhdCBkb2N1bWVudCB3ZSBhcmUgaW5zZXJ0aW5nLCBhbmRcbiAgICAvLyBnZW5lcmF0ZSBhbiBpZCBmb3IgaXQuXG4gICAgbGV0IGluc2VydGVkSWQ7XG4gICAgaWYgKHVwZGF0ZUNvdW50ID09PSAwICYmIG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgICBjb25zdCBkb2MgPSBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZVVwc2VydERvY3VtZW50KHNlbGVjdG9yLCBtb2QpO1xuICAgICAgaWYgKCFkb2MuX2lkICYmIG9wdGlvbnMuaW5zZXJ0ZWRJZCkge1xuICAgICAgICBkb2MuX2lkID0gb3B0aW9ucy5pbnNlcnRlZElkO1xuICAgICAgfVxuXG4gICAgICBpbnNlcnRlZElkID0gYXdhaXQgdGhpcy5pbnNlcnRBc3luYyhkb2MpO1xuICAgICAgdXBkYXRlQ291bnQgPSAxO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaFVwZGF0ZSh7XG4gICAgICBvcHRpb25zLFxuICAgICAgaW5zZXJ0ZWRJZCxcbiAgICAgIHVwZGF0ZUNvdW50LFxuICAgICAgY2FsbGJhY2ssXG4gICAgfSk7XG4gIH1cbiAgLy8gWFhYIGF0b21pY2l0eTogaWYgbXVsdGkgaXMgdHJ1ZSwgYW5kIG9uZSBtb2RpZmljYXRpb24gZmFpbHMsIGRvXG4gIC8vIHdlIHJvbGxiYWNrIHRoZSB3aG9sZSBvcGVyYXRpb24sIG9yIHdoYXQ/XG4gIHVwZGF0ZShzZWxlY3RvciwgbW9kLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGlmICghIGNhbGxiYWNrICYmIG9wdGlvbnMgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgY29uc3QgbWF0Y2hlciA9IG5ldyBNaW5pbW9uZ28uTWF0Y2hlcihzZWxlY3RvciwgdHJ1ZSk7XG5cbiAgICBjb25zdCBxaWRUb09yaWdpbmFsUmVzdWx0cyA9IHRoaXMucHJlcGFyZVVwZGF0ZShzZWxlY3Rvcik7XG5cbiAgICBsZXQgcmVjb21wdXRlUWlkcyA9IHt9O1xuXG4gICAgbGV0IHVwZGF0ZUNvdW50ID0gMDtcblxuICAgIHRoaXMuX2VhY2hQb3NzaWJseU1hdGNoaW5nRG9jU3luYyhzZWxlY3RvciwgKGRvYywgaWQpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5UmVzdWx0ID0gbWF0Y2hlci5kb2N1bWVudE1hdGNoZXMoZG9jKTtcblxuICAgICAgaWYgKHF1ZXJ5UmVzdWx0LnJlc3VsdCkge1xuICAgICAgICAvLyBYWFggU2hvdWxkIHdlIHNhdmUgdGhlIG9yaWdpbmFsIGV2ZW4gaWYgbW9kIGVuZHMgdXAgYmVpbmcgYSBuby1vcD9cbiAgICAgICAgdGhpcy5fc2F2ZU9yaWdpbmFsKGlkLCBkb2MpO1xuICAgICAgICByZWNvbXB1dGVRaWRzID0gdGhpcy5fbW9kaWZ5QW5kTm90aWZ5U3luYyhcbiAgICAgICAgICBkb2MsXG4gICAgICAgICAgbW9kLFxuICAgICAgICAgIHF1ZXJ5UmVzdWx0LmFycmF5SW5kaWNlc1xuICAgICAgICApO1xuXG4gICAgICAgICsrdXBkYXRlQ291bnQ7XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLm11bHRpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXMocmVjb21wdXRlUWlkcykuZm9yRWFjaChxaWQgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICB0aGlzLl9yZWNvbXB1dGVSZXN1bHRzKHF1ZXJ5LCBxaWRUb09yaWdpbmFsUmVzdWx0c1txaWRdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX29ic2VydmVRdWV1ZS5kcmFpbigpO1xuXG5cbiAgICAvLyBJZiB3ZSBhcmUgZG9pbmcgYW4gdXBzZXJ0LCBhbmQgd2UgZGlkbid0IG1vZGlmeSBhbnkgZG9jdW1lbnRzIHlldCwgdGhlblxuICAgIC8vIGl0J3MgdGltZSB0byBkbyBhbiBpbnNlcnQuIEZpZ3VyZSBvdXQgd2hhdCBkb2N1bWVudCB3ZSBhcmUgaW5zZXJ0aW5nLCBhbmRcbiAgICAvLyBnZW5lcmF0ZSBhbiBpZCBmb3IgaXQuXG4gICAgbGV0IGluc2VydGVkSWQ7XG4gICAgaWYgKHVwZGF0ZUNvdW50ID09PSAwICYmIG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgICBjb25zdCBkb2MgPSBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZVVwc2VydERvY3VtZW50KHNlbGVjdG9yLCBtb2QpO1xuICAgICAgaWYgKCFkb2MuX2lkICYmIG9wdGlvbnMuaW5zZXJ0ZWRJZCkge1xuICAgICAgICBkb2MuX2lkID0gb3B0aW9ucy5pbnNlcnRlZElkO1xuICAgICAgfVxuXG4gICAgICBpbnNlcnRlZElkID0gdGhpcy5pbnNlcnQoZG9jKTtcbiAgICAgIHVwZGF0ZUNvdW50ID0gMTtcbiAgICB9XG5cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaFVwZGF0ZSh7XG4gICAgICBvcHRpb25zLFxuICAgICAgaW5zZXJ0ZWRJZCxcbiAgICAgIHVwZGF0ZUNvdW50LFxuICAgICAgY2FsbGJhY2ssXG4gICAgICBzZWxlY3RvcixcbiAgICAgIG1vZCxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEEgY29udmVuaWVuY2Ugd3JhcHBlciBvbiB1cGRhdGUuIExvY2FsQ29sbGVjdGlvbi51cHNlcnQoc2VsLCBtb2QpIGlzXG4gIC8vIGVxdWl2YWxlbnQgdG8gTG9jYWxDb2xsZWN0aW9uLnVwZGF0ZShzZWwsIG1vZCwge3Vwc2VydDogdHJ1ZSxcbiAgLy8gX3JldHVybk9iamVjdDogdHJ1ZX0pLlxuICB1cHNlcnQoc2VsZWN0b3IsIG1vZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBtb2QsXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7dXBzZXJ0OiB0cnVlLCBfcmV0dXJuT2JqZWN0OiB0cnVlfSksXG4gICAgICBjYWxsYmFja1xuICAgICk7XG4gIH1cblxuICB1cHNlcnRBc3luYyhzZWxlY3RvciwgbW9kLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2sgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVBc3luYyhcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgbW9kLFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge3Vwc2VydDogdHJ1ZSwgX3JldHVybk9iamVjdDogdHJ1ZX0pLFxuICAgICAgY2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgLy8gSXRlcmF0ZXMgb3ZlciBhIHN1YnNldCBvZiBkb2N1bWVudHMgdGhhdCBjb3VsZCBtYXRjaCBzZWxlY3RvcjsgY2FsbHNcbiAgLy8gZm4oZG9jLCBpZCkgb24gZWFjaCBvZiB0aGVtLiAgU3BlY2lmaWNhbGx5LCBpZiBzZWxlY3RvciBzcGVjaWZpZXNcbiAgLy8gc3BlY2lmaWMgX2lkJ3MsIGl0IG9ubHkgbG9va3MgYXQgdGhvc2UuICBkb2MgaXMgKm5vdCogY2xvbmVkOiBpdCBpcyB0aGVcbiAgLy8gc2FtZSBvYmplY3QgdGhhdCBpcyBpbiBfZG9jcy5cbiAgYXN5bmMgX2VhY2hQb3NzaWJseU1hdGNoaW5nRG9jQXN5bmMoc2VsZWN0b3IsIGZuKSB7XG4gICAgY29uc3Qgc3BlY2lmaWNJZHMgPSBMb2NhbENvbGxlY3Rpb24uX2lkc01hdGNoZWRCeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIGlmIChzcGVjaWZpY0lkcykge1xuICAgICAgZm9yIChjb25zdCBpZCBvZiBzcGVjaWZpY0lkcykge1xuICAgICAgICBjb25zdCBkb2MgPSB0aGlzLl9kb2NzLmdldChpZCk7XG5cbiAgICAgICAgaWYgKGRvYyAmJiAhIChhd2FpdCBmbihkb2MsIGlkKSkpIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuX2RvY3MuZm9yRWFjaEFzeW5jKGZuKTtcbiAgICB9XG4gIH1cbiAgX2VhY2hQb3NzaWJseU1hdGNoaW5nRG9jU3luYyhzZWxlY3RvciwgZm4pIHtcbiAgICBjb25zdCBzcGVjaWZpY0lkcyA9IExvY2FsQ29sbGVjdGlvbi5faWRzTWF0Y2hlZEJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgaWYgKHNwZWNpZmljSWRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIHNwZWNpZmljSWRzKSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IHRoaXMuX2RvY3MuZ2V0KGlkKTtcblxuICAgICAgICBpZiAoZG9jICYmIGZuKGRvYywgaWQpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZG9jcy5mb3JFYWNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TWF0Y2hlZERvY0FuZE1vZGlmeShkb2MsIG1vZCwgYXJyYXlJbmRpY2VzKSB7XG4gICAgY29uc3QgbWF0Y2hlZF9iZWZvcmUgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcmllcykuZm9yRWFjaChxaWQgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5LmRpcnR5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHF1ZXJ5Lm9yZGVyZWQpIHtcbiAgICAgICAgbWF0Y2hlZF9iZWZvcmVbcWlkXSA9IHF1ZXJ5Lm1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKGRvYykucmVzdWx0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQmVjYXVzZSB3ZSBkb24ndCBzdXBwb3J0IHNraXAgb3IgbGltaXQgKHlldCkgaW4gdW5vcmRlcmVkIHF1ZXJpZXMsIHdlXG4gICAgICAgIC8vIGNhbiBqdXN0IGRvIGEgZGlyZWN0IGxvb2t1cC5cbiAgICAgICAgbWF0Y2hlZF9iZWZvcmVbcWlkXSA9IHF1ZXJ5LnJlc3VsdHMuaGFzKGRvYy5faWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hdGNoZWRfYmVmb3JlO1xuICB9XG5cbiAgX21vZGlmeUFuZE5vdGlmeVN5bmMoZG9jLCBtb2QsIGFycmF5SW5kaWNlcykge1xuXG4gICAgY29uc3QgbWF0Y2hlZF9iZWZvcmUgPSB0aGlzLl9nZXRNYXRjaGVkRG9jQW5kTW9kaWZ5KGRvYywgbW9kLCBhcnJheUluZGljZXMpO1xuXG4gICAgY29uc3Qgb2xkX2RvYyA9IEVKU09OLmNsb25lKGRvYyk7XG4gICAgTG9jYWxDb2xsZWN0aW9uLl9tb2RpZnkoZG9jLCBtb2QsIHthcnJheUluZGljZXN9KTtcblxuICAgIGNvbnN0IHJlY29tcHV0ZVFpZHMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgcWlkIG9mIE9iamVjdC5rZXlzKHRoaXMucXVlcmllcykpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW3FpZF07XG5cbiAgICAgIGlmIChxdWVyeS5kaXJ0eSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYWZ0ZXJNYXRjaCA9IHF1ZXJ5Lm1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKGRvYyk7XG4gICAgICBjb25zdCBhZnRlciA9IGFmdGVyTWF0Y2gucmVzdWx0O1xuICAgICAgY29uc3QgYmVmb3JlID0gbWF0Y2hlZF9iZWZvcmVbcWlkXTtcblxuICAgICAgaWYgKGFmdGVyICYmIHF1ZXJ5LmRpc3RhbmNlcyAmJiBhZnRlck1hdGNoLmRpc3RhbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcXVlcnkuZGlzdGFuY2VzLnNldChkb2MuX2lkLCBhZnRlck1hdGNoLmRpc3RhbmNlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHF1ZXJ5LmN1cnNvci5za2lwIHx8IHF1ZXJ5LmN1cnNvci5saW1pdCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY29tcHV0ZSBhbnkgcXVlcnkgd2hlcmUgdGhlIGRvYyBtYXkgaGF2ZSBiZWVuIGluIHRoZVxuICAgICAgICAvLyBjdXJzb3IncyB3aW5kb3cgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgdXBkYXRlLiAoTm90ZSB0aGF0IGlmIHNraXBcbiAgICAgICAgLy8gb3IgbGltaXQgaXMgc2V0LCBcImJlZm9yZVwiIGFuZCBcImFmdGVyXCIgYmVpbmcgdHJ1ZSBkbyBub3QgbmVjZXNzYXJpbHlcbiAgICAgICAgLy8gbWVhbiB0aGF0IHRoZSBkb2N1bWVudCBpcyBpbiB0aGUgY3Vyc29yJ3Mgb3V0cHV0IGFmdGVyIHNraXAvbGltaXQgaXNcbiAgICAgICAgLy8gYXBwbGllZC4uLiBidXQgaWYgdGhleSBhcmUgZmFsc2UsIHRoZW4gdGhlIGRvY3VtZW50IGRlZmluaXRlbHkgaXMgTk9UXG4gICAgICAgIC8vIGluIHRoZSBvdXRwdXQuIFNvIGl0J3Mgc2FmZSB0byBza2lwIHJlY29tcHV0ZSBpZiBuZWl0aGVyIGJlZm9yZSBvclxuICAgICAgICAvLyBhZnRlciBhcmUgdHJ1ZS4pXG4gICAgICAgIGlmIChiZWZvcmUgfHwgYWZ0ZXIpIHtcbiAgICAgICAgICByZWNvbXB1dGVRaWRzW3FpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl9yZW1vdmVGcm9tUmVzdWx0c1N5bmMocXVlcnksIGRvYyk7XG4gICAgICB9IGVsc2UgaWYgKCFiZWZvcmUgJiYgYWZ0ZXIpIHtcbiAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblJlc3VsdHNTeW5jKHF1ZXJ5LCBkb2MpO1xuICAgICAgfSBlbHNlIGlmIChiZWZvcmUgJiYgYWZ0ZXIpIHtcbiAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl91cGRhdGVJblJlc3VsdHNTeW5jKHF1ZXJ5LCBkb2MsIG9sZF9kb2MpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjb21wdXRlUWlkcztcbiAgfVxuXG4gIGFzeW5jIF9tb2RpZnlBbmROb3RpZnlBc3luYyhkb2MsIG1vZCwgYXJyYXlJbmRpY2VzKSB7XG5cbiAgICBjb25zdCBtYXRjaGVkX2JlZm9yZSA9IHRoaXMuX2dldE1hdGNoZWREb2NBbmRNb2RpZnkoZG9jLCBtb2QsIGFycmF5SW5kaWNlcyk7XG5cbiAgICBjb25zdCBvbGRfZG9jID0gRUpTT04uY2xvbmUoZG9jKTtcbiAgICBMb2NhbENvbGxlY3Rpb24uX21vZGlmeShkb2MsIG1vZCwge2FycmF5SW5kaWNlc30pO1xuXG4gICAgY29uc3QgcmVjb21wdXRlUWlkcyA9IHt9O1xuICAgIGZvciAoY29uc3QgcWlkIGluIHRoaXMucXVlcmllcykge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbcWlkXTtcblxuICAgICAgaWYgKHF1ZXJ5LmRpcnR5KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhZnRlck1hdGNoID0gcXVlcnkubWF0Y2hlci5kb2N1bWVudE1hdGNoZXMoZG9jKTtcbiAgICAgIGNvbnN0IGFmdGVyID0gYWZ0ZXJNYXRjaC5yZXN1bHQ7XG4gICAgICBjb25zdCBiZWZvcmUgPSBtYXRjaGVkX2JlZm9yZVtxaWRdO1xuXG4gICAgICBpZiAoYWZ0ZXIgJiYgcXVlcnkuZGlzdGFuY2VzICYmIGFmdGVyTWF0Y2guZGlzdGFuY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBxdWVyeS5kaXN0YW5jZXMuc2V0KGRvYy5faWQsIGFmdGVyTWF0Y2guZGlzdGFuY2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAocXVlcnkuY3Vyc29yLnNraXAgfHwgcXVlcnkuY3Vyc29yLmxpbWl0KSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcmVjb21wdXRlIGFueSBxdWVyeSB3aGVyZSB0aGUgZG9jIG1heSBoYXZlIGJlZW4gaW4gdGhlXG4gICAgICAgIC8vIGN1cnNvcidzIHdpbmRvdyBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSB1cGRhdGUuIChOb3RlIHRoYXQgaWYgc2tpcFxuICAgICAgICAvLyBvciBsaW1pdCBpcyBzZXQsIFwiYmVmb3JlXCIgYW5kIFwiYWZ0ZXJcIiBiZWluZyB0cnVlIGRvIG5vdCBuZWNlc3NhcmlseVxuICAgICAgICAvLyBtZWFuIHRoYXQgdGhlIGRvY3VtZW50IGlzIGluIHRoZSBjdXJzb3IncyBvdXRwdXQgYWZ0ZXIgc2tpcC9saW1pdCBpc1xuICAgICAgICAvLyBhcHBsaWVkLi4uIGJ1dCBpZiB0aGV5IGFyZSBmYWxzZSwgdGhlbiB0aGUgZG9jdW1lbnQgZGVmaW5pdGVseSBpcyBOT1RcbiAgICAgICAgLy8gaW4gdGhlIG91dHB1dC4gU28gaXQncyBzYWZlIHRvIHNraXAgcmVjb21wdXRlIGlmIG5laXRoZXIgYmVmb3JlIG9yXG4gICAgICAgIC8vIGFmdGVyIGFyZSB0cnVlLilcbiAgICAgICAgaWYgKGJlZm9yZSB8fCBhZnRlcikge1xuICAgICAgICAgIHJlY29tcHV0ZVFpZHNbcWlkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYmVmb3JlICYmICFhZnRlcikge1xuICAgICAgICBhd2FpdCBMb2NhbENvbGxlY3Rpb24uX3JlbW92ZUZyb21SZXN1bHRzQXN5bmMocXVlcnksIGRvYyk7XG4gICAgICB9IGVsc2UgaWYgKCFiZWZvcmUgJiYgYWZ0ZXIpIHtcbiAgICAgICAgYXdhaXQgTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblJlc3VsdHNBc3luYyhxdWVyeSwgZG9jKTtcbiAgICAgIH0gZWxzZSBpZiAoYmVmb3JlICYmIGFmdGVyKSB7XG4gICAgICAgIGF3YWl0IExvY2FsQ29sbGVjdGlvbi5fdXBkYXRlSW5SZXN1bHRzQXN5bmMocXVlcnksIGRvYywgb2xkX2RvYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWNvbXB1dGVRaWRzO1xuICB9XG5cbiAgLy8gUmVjb21wdXRlcyB0aGUgcmVzdWx0cyBvZiBhIHF1ZXJ5IGFuZCBydW5zIG9ic2VydmUgY2FsbGJhY2tzIGZvciB0aGVcbiAgLy8gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyByZXN1bHRzIGFuZCB0aGUgY3VycmVudCByZXN1bHRzICh1bmxlc3NcbiAgLy8gcGF1c2VkKS4gVXNlZCBmb3Igc2tpcC9saW1pdCBxdWVyaWVzLlxuICAvL1xuICAvLyBXaGVuIHRoaXMgaXMgdXNlZCBieSBpbnNlcnQgb3IgcmVtb3ZlLCBpdCBjYW4ganVzdCB1c2UgcXVlcnkucmVzdWx0cyBmb3JcbiAgLy8gdGhlIG9sZCByZXN1bHRzIChhbmQgdGhlcmUncyBubyBuZWVkIHRvIHBhc3MgaW4gb2xkUmVzdWx0cyksIGJlY2F1c2UgdGhlc2VcbiAgLy8gb3BlcmF0aW9ucyBkb24ndCBtdXRhdGUgdGhlIGRvY3VtZW50cyBpbiB0aGUgY29sbGVjdGlvbi4gVXBkYXRlIG5lZWRzIHRvXG4gIC8vIHBhc3MgaW4gYW4gb2xkUmVzdWx0cyB3aGljaCB3YXMgZGVlcC1jb3BpZWQgYmVmb3JlIHRoZSBtb2RpZmllciB3YXNcbiAgLy8gYXBwbGllZC5cbiAgLy9cbiAgLy8gb2xkUmVzdWx0cyBpcyBndWFyYW50ZWVkIHRvIGJlIGlnbm9yZWQgaWYgdGhlIHF1ZXJ5IGlzIG5vdCBwYXVzZWQuXG4gIF9yZWNvbXB1dGVSZXN1bHRzKHF1ZXJ5LCBvbGRSZXN1bHRzKSB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAvLyBUaGVyZSdzIG5vIHJlYXNvbiB0byByZWNvbXB1dGUgdGhlIHJlc3VsdHMgbm93IGFzIHdlJ3JlIHN0aWxsIHBhdXNlZC5cbiAgICAgIC8vIEJ5IGZsYWdnaW5nIHRoZSBxdWVyeSBhcyBcImRpcnR5XCIsIHRoZSByZWNvbXB1dGUgd2lsbCBiZSBwZXJmb3JtZWRcbiAgICAgIC8vIHdoZW4gcmVzdW1lT2JzZXJ2ZXJzIGlzIGNhbGxlZC5cbiAgICAgIHF1ZXJ5LmRpcnR5ID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucGF1c2VkICYmICFvbGRSZXN1bHRzKSB7XG4gICAgICBvbGRSZXN1bHRzID0gcXVlcnkucmVzdWx0cztcbiAgICB9XG5cbiAgICBpZiAocXVlcnkuZGlzdGFuY2VzKSB7XG4gICAgICBxdWVyeS5kaXN0YW5jZXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBxdWVyeS5yZXN1bHRzID0gcXVlcnkuY3Vyc29yLl9nZXRSYXdPYmplY3RzKHtcbiAgICAgIGRpc3RhbmNlczogcXVlcnkuZGlzdGFuY2VzLFxuICAgICAgb3JkZXJlZDogcXVlcnkub3JkZXJlZFxuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgTG9jYWxDb2xsZWN0aW9uLl9kaWZmUXVlcnlDaGFuZ2VzKFxuICAgICAgICBxdWVyeS5vcmRlcmVkLFxuICAgICAgICBvbGRSZXN1bHRzLFxuICAgICAgICBxdWVyeS5yZXN1bHRzLFxuICAgICAgICBxdWVyeSxcbiAgICAgICAge3Byb2plY3Rpb25GbjogcXVlcnkucHJvamVjdGlvbkZufVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZU9yaWdpbmFsKGlkLCBkb2MpIHtcbiAgICAvLyBBcmUgd2UgZXZlbiB0cnlpbmcgdG8gc2F2ZSBvcmlnaW5hbHM/XG4gICAgaWYgKCF0aGlzLl9zYXZlZE9yaWdpbmFscykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEhhdmUgd2UgcHJldmlvdXNseSBtdXRhdGVkIHRoZSBvcmlnaW5hbCAoYW5kIHNvICdkb2MnIGlzIG5vdCBhY3R1YWxseVxuICAgIC8vIG9yaWdpbmFsKT8gIChOb3RlIHRoZSAnaGFzJyBjaGVjayByYXRoZXIgdGhhbiB0cnV0aDogd2Ugc3RvcmUgdW5kZWZpbmVkXG4gICAgLy8gaGVyZSBmb3IgaW5zZXJ0ZWQgZG9jcyEpXG4gICAgaWYgKHRoaXMuX3NhdmVkT3JpZ2luYWxzLmhhcyhpZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zYXZlZE9yaWdpbmFscy5zZXQoaWQsIEVKU09OLmNsb25lKGRvYykpO1xuICB9XG59XG5cbkxvY2FsQ29sbGVjdGlvbi5DdXJzb3IgPSBDdXJzb3I7XG5cbkxvY2FsQ29sbGVjdGlvbi5PYnNlcnZlSGFuZGxlID0gT2JzZXJ2ZUhhbmRsZTtcblxuLy8gWFhYIG1heWJlIG1vdmUgdGhlc2UgaW50byBhbm90aGVyIE9ic2VydmVIZWxwZXJzIHBhY2thZ2Ugb3Igc29tZXRoaW5nXG5cbi8vIF9DYWNoaW5nQ2hhbmdlT2JzZXJ2ZXIgaXMgYW4gb2JqZWN0IHdoaWNoIHJlY2VpdmVzIG9ic2VydmVDaGFuZ2VzIGNhbGxiYWNrc1xuLy8gYW5kIGtlZXBzIGEgY2FjaGUgb2YgdGhlIGN1cnJlbnQgY3Vyc29yIHN0YXRlIHVwIHRvIGRhdGUgaW4gdGhpcy5kb2NzLiBVc2Vyc1xuLy8gb2YgdGhpcyBjbGFzcyBzaG91bGQgcmVhZCB0aGUgZG9jcyBmaWVsZCBidXQgbm90IG1vZGlmeSBpdC4gWW91IHNob3VsZCBwYXNzXG4vLyB0aGUgXCJhcHBseUNoYW5nZVwiIGZpZWxkIGFzIHRoZSBjYWxsYmFja3MgdG8gdGhlIHVuZGVybHlpbmcgb2JzZXJ2ZUNoYW5nZXNcbi8vIGNhbGwuIE9wdGlvbmFsbHksIHlvdSBjYW4gc3BlY2lmeSB5b3VyIG93biBvYnNlcnZlQ2hhbmdlcyBjYWxsYmFja3Mgd2hpY2ggYXJlXG4vLyBpbnZva2VkIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG9jcyBmaWVsZCBpcyB1cGRhdGVkOyB0aGlzIG9iamVjdCBpcyBtYWRlXG4vLyBhdmFpbGFibGUgYXMgYHRoaXNgIHRvIHRob3NlIGNhbGxiYWNrcy5cbkxvY2FsQ29sbGVjdGlvbi5fQ2FjaGluZ0NoYW5nZU9ic2VydmVyID0gY2xhc3MgX0NhY2hpbmdDaGFuZ2VPYnNlcnZlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9yZGVyZWRGcm9tQ2FsbGJhY2tzID0gKFxuICAgICAgb3B0aW9ucy5jYWxsYmFja3MgJiZcbiAgICAgIExvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3NBcmVPcmRlcmVkKG9wdGlvbnMuY2FsbGJhY2tzKVxuICAgICk7XG5cbiAgICBpZiAoaGFzT3duLmNhbGwob3B0aW9ucywgJ29yZGVyZWQnKSkge1xuICAgICAgdGhpcy5vcmRlcmVkID0gb3B0aW9ucy5vcmRlcmVkO1xuXG4gICAgICBpZiAob3B0aW9ucy5jYWxsYmFja3MgJiYgb3B0aW9ucy5vcmRlcmVkICE9PSBvcmRlcmVkRnJvbUNhbGxiYWNrcykge1xuICAgICAgICB0aHJvdyBFcnJvcignb3JkZXJlZCBvcHRpb24gZG9lc25cXCd0IG1hdGNoIGNhbGxiYWNrcycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jYWxsYmFja3MpIHtcbiAgICAgIHRoaXMub3JkZXJlZCA9IG9yZGVyZWRGcm9tQ2FsbGJhY2tzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignbXVzdCBwcm92aWRlIG9yZGVyZWQgb3IgY2FsbGJhY2tzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY2FsbGJhY2tzID0gb3B0aW9ucy5jYWxsYmFja3MgfHwge307XG5cbiAgICBpZiAodGhpcy5vcmRlcmVkKSB7XG4gICAgICB0aGlzLmRvY3MgPSBuZXcgT3JkZXJlZERpY3QoTW9uZ29JRC5pZFN0cmluZ2lmeSk7XG4gICAgICB0aGlzLmFwcGx5Q2hhbmdlID0ge1xuICAgICAgICBhZGRlZEJlZm9yZTogKGlkLCBmaWVsZHMsIGJlZm9yZSkgPT4ge1xuICAgICAgICAgIC8vIFRha2UgYSBzaGFsbG93IGNvcHkgc2luY2UgdGhlIHRvcC1sZXZlbCBwcm9wZXJ0aWVzIGNhbiBiZSBjaGFuZ2VkXG4gICAgICAgICAgY29uc3QgZG9jID0geyAuLi5maWVsZHMgfTtcblxuICAgICAgICAgIGRvYy5faWQgPSBpZDtcblxuICAgICAgICAgIGlmIChjYWxsYmFja3MuYWRkZWRCZWZvcmUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5hZGRlZEJlZm9yZS5jYWxsKHRoaXMsIGlkLCBFSlNPTi5jbG9uZShmaWVsZHMpLCBiZWZvcmUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRoaXMgbGluZSB0cmlnZ2VycyBpZiB3ZSBwcm92aWRlIGFkZGVkIHdpdGggbW92ZWRCZWZvcmUuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrcy5hZGRlZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFkZGVkLmNhbGwodGhpcywgaWQsIEVKU09OLmNsb25lKGZpZWxkcykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFhYWCBjb3VsZCBgYmVmb3JlYCBiZSBhIGZhbHN5IElEPyAgVGVjaG5pY2FsbHlcbiAgICAgICAgICAvLyBpZFN0cmluZ2lmeSBzZWVtcyB0byBhbGxvdyBmb3IgdGhlbSAtLSB0aG91Z2hcbiAgICAgICAgICAvLyBPcmRlcmVkRGljdCB3b24ndCBjYWxsIHN0cmluZ2lmeSBvbiBhIGZhbHN5IGFyZy5cbiAgICAgICAgICB0aGlzLmRvY3MucHV0QmVmb3JlKGlkLCBkb2MsIGJlZm9yZSB8fCBudWxsKTtcbiAgICAgICAgfSxcbiAgICAgICAgbW92ZWRCZWZvcmU6IChpZCwgYmVmb3JlKSA9PiB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrcy5tb3ZlZEJlZm9yZSkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLm1vdmVkQmVmb3JlLmNhbGwodGhpcywgaWQsIGJlZm9yZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5kb2NzLm1vdmVCZWZvcmUoaWQsIGJlZm9yZSB8fCBudWxsKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9jcyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgdGhpcy5hcHBseUNoYW5nZSA9IHtcbiAgICAgICAgYWRkZWQ6IChpZCwgZmllbGRzKSA9PiB7XG4gICAgICAgICAgLy8gVGFrZSBhIHNoYWxsb3cgY29weSBzaW5jZSB0aGUgdG9wLWxldmVsIHByb3BlcnRpZXMgY2FuIGJlIGNoYW5nZWRcbiAgICAgICAgICBjb25zdCBkb2MgPSB7IC4uLmZpZWxkcyB9O1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrcy5hZGRlZCkge1xuICAgICAgICAgICAgY2FsbGJhY2tzLmFkZGVkLmNhbGwodGhpcywgaWQsIEVKU09OLmNsb25lKGZpZWxkcykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvYy5faWQgPSBpZDtcblxuICAgICAgICAgIHRoaXMuZG9jcy5zZXQoaWQsICBkb2MpO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbWV0aG9kcyBpbiBfSWRNYXAgYW5kIE9yZGVyZWREaWN0IHVzZWQgYnkgdGhlc2UgY2FsbGJhY2tzIGFyZVxuICAgIC8vIGlkZW50aWNhbC5cbiAgICB0aGlzLmFwcGx5Q2hhbmdlLmNoYW5nZWQgPSAoaWQsIGZpZWxkcykgPT4ge1xuICAgICAgY29uc3QgZG9jID0gdGhpcy5kb2NzLmdldChpZCk7XG5cbiAgICAgIGlmICghZG9jKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBpZCBmb3IgY2hhbmdlZDogJHtpZH1gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNhbGxiYWNrcy5jaGFuZ2VkKSB7XG4gICAgICAgIGNhbGxiYWNrcy5jaGFuZ2VkLmNhbGwodGhpcywgaWQsIEVKU09OLmNsb25lKGZpZWxkcykpO1xuICAgICAgfVxuXG4gICAgICBEaWZmU2VxdWVuY2UuYXBwbHlDaGFuZ2VzKGRvYywgZmllbGRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hcHBseUNoYW5nZS5yZW1vdmVkID0gaWQgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrcy5yZW1vdmVkKSB7XG4gICAgICAgIGNhbGxiYWNrcy5yZW1vdmVkLmNhbGwodGhpcywgaWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRvY3MucmVtb3ZlKGlkKTtcbiAgICB9O1xuICB9XG59O1xuXG5Mb2NhbENvbGxlY3Rpb24uX0lkTWFwID0gY2xhc3MgX0lkTWFwIGV4dGVuZHMgSWRNYXAge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihNb25nb0lELmlkU3RyaW5naWZ5LCBNb25nb0lELmlkUGFyc2UpO1xuICB9XG59O1xuXG4vLyBXcmFwIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHRvIHJldHVybiBvYmplY3RzIHRoYXQgaGF2ZSB0aGUgX2lkIGZpZWxkXG4vLyBvZiB0aGUgdW50cmFuc2Zvcm1lZCBkb2N1bWVudC4gVGhpcyBlbnN1cmVzIHRoYXQgc3Vic3lzdGVtcyBzdWNoIGFzXG4vLyB0aGUgb2JzZXJ2ZS1zZXF1ZW5jZSBwYWNrYWdlIHRoYXQgY2FsbCBgb2JzZXJ2ZWAgY2FuIGtlZXAgdHJhY2sgb2Zcbi8vIHRoZSBkb2N1bWVudHMgaWRlbnRpdGllcy5cbi8vXG4vLyAtIFJlcXVpcmUgdGhhdCBpdCByZXR1cm5zIG9iamVjdHNcbi8vIC0gSWYgdGhlIHJldHVybiB2YWx1ZSBoYXMgYW4gX2lkIGZpZWxkLCB2ZXJpZnkgdGhhdCBpdCBtYXRjaGVzIHRoZVxuLy8gICBvcmlnaW5hbCBfaWQgZmllbGRcbi8vIC0gSWYgdGhlIHJldHVybiB2YWx1ZSBkb2Vzbid0IGhhdmUgYW4gX2lkIGZpZWxkLCBhZGQgaXQgYmFjay5cbkxvY2FsQ29sbGVjdGlvbi53cmFwVHJhbnNmb3JtID0gdHJhbnNmb3JtID0+IHtcbiAgaWYgKCF0cmFuc2Zvcm0pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIE5vIG5lZWQgdG8gZG91Ymx5LXdyYXAgdHJhbnNmb3Jtcy5cbiAgaWYgKHRyYW5zZm9ybS5fX3dyYXBwZWRUcmFuc2Zvcm1fXykge1xuICAgIHJldHVybiB0cmFuc2Zvcm07XG4gIH1cblxuICBjb25zdCB3cmFwcGVkID0gZG9jID0+IHtcbiAgICBpZiAoIWhhc093bi5jYWxsKGRvYywgJ19pZCcpKSB7XG4gICAgICAvLyBYWFggZG8gd2UgZXZlciBoYXZlIGEgdHJhbnNmb3JtIG9uIHRoZSBvcGxvZydzIGNvbGxlY3Rpb24/IGJlY2F1c2UgdGhhdFxuICAgICAgLy8gY29sbGVjdGlvbiBoYXMgbm8gX2lkLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW4gb25seSB0cmFuc2Zvcm0gZG9jdW1lbnRzIHdpdGggX2lkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaWQgPSBkb2MuX2lkO1xuXG4gICAgLy8gWFhYIGNvbnNpZGVyIG1ha2luZyB0cmFja2VyIGEgd2VhayBkZXBlbmRlbmN5IGFuZCBjaGVja2luZ1xuICAgIC8vIFBhY2thZ2UudHJhY2tlciBoZXJlXG4gICAgY29uc3QgdHJhbnNmb3JtZWQgPSBUcmFja2VyLm5vbnJlYWN0aXZlKCgpID0+IHRyYW5zZm9ybShkb2MpKTtcblxuICAgIGlmICghTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0KHRyYW5zZm9ybWVkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0cmFuc2Zvcm0gbXVzdCByZXR1cm4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgaWYgKGhhc093bi5jYWxsKHRyYW5zZm9ybWVkLCAnX2lkJykpIHtcbiAgICAgIGlmICghRUpTT04uZXF1YWxzKHRyYW5zZm9ybWVkLl9pZCwgaWQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndHJhbnNmb3JtZWQgZG9jdW1lbnQgY2FuXFwndCBoYXZlIGRpZmZlcmVudCBfaWQnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNmb3JtZWQuX2lkID0gaWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybWVkO1xuICB9O1xuXG4gIHdyYXBwZWQuX193cmFwcGVkVHJhbnNmb3JtX18gPSB0cnVlO1xuXG4gIHJldHVybiB3cmFwcGVkO1xufTtcblxuLy8gWFhYIHRoZSBzb3J0ZWQtcXVlcnkgbG9naWMgYmVsb3cgaXMgbGF1Z2hhYmx5IGluZWZmaWNpZW50LiB3ZSdsbFxuLy8gbmVlZCB0byBjb21lIHVwIHdpdGggYSBiZXR0ZXIgZGF0YXN0cnVjdHVyZSBmb3IgdGhpcy5cbi8vXG4vLyBYWFggdGhlIGxvZ2ljIGZvciBvYnNlcnZpbmcgd2l0aCBhIHNraXAgb3IgYSBsaW1pdCBpcyBldmVuIG1vcmVcbi8vIGxhdWdoYWJseSBpbmVmZmljaWVudC4gd2UgcmVjb21wdXRlIHRoZSB3aG9sZSByZXN1bHRzIGV2ZXJ5IHRpbWUhXG5cbi8vIFRoaXMgYmluYXJ5IHNlYXJjaCBwdXRzIGEgdmFsdWUgYmV0d2VlbiBhbnkgZXF1YWwgdmFsdWVzLCBhbmQgdGhlIGZpcnN0XG4vLyBsZXNzZXIgdmFsdWUuXG5Mb2NhbENvbGxlY3Rpb24uX2JpbmFyeVNlYXJjaCA9IChjbXAsIGFycmF5LCB2YWx1ZSkgPT4ge1xuICBsZXQgZmlyc3QgPSAwO1xuICBsZXQgcmFuZ2UgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKHJhbmdlID4gMCkge1xuICAgIGNvbnN0IGhhbGZSYW5nZSA9IE1hdGguZmxvb3IocmFuZ2UgLyAyKTtcblxuICAgIGlmIChjbXAodmFsdWUsIGFycmF5W2ZpcnN0ICsgaGFsZlJhbmdlXSkgPj0gMCkge1xuICAgICAgZmlyc3QgKz0gaGFsZlJhbmdlICsgMTtcbiAgICAgIHJhbmdlIC09IGhhbGZSYW5nZSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlID0gaGFsZlJhbmdlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmaXJzdDtcbn07XG5cbkxvY2FsQ29sbGVjdGlvbi5fY2hlY2tTdXBwb3J0ZWRQcm9qZWN0aW9uID0gZmllbGRzID0+IHtcbiAgaWYgKGZpZWxkcyAhPT0gT2JqZWN0KGZpZWxkcykgfHwgQXJyYXkuaXNBcnJheShmaWVsZHMpKSB7XG4gICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJ2ZpZWxkcyBvcHRpb24gbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGZpZWxkcykuZm9yRWFjaChrZXlQYXRoID0+IHtcbiAgICBpZiAoa2V5UGF0aC5zcGxpdCgnLicpLmluY2x1ZGVzKCckJykpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAnTWluaW1vbmdvIGRvZXNuXFwndCBzdXBwb3J0ICQgb3BlcmF0b3IgaW4gcHJvamVjdGlvbnMgeWV0LidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSBmaWVsZHNba2V5UGF0aF07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBbJyRlbGVtTWF0Y2gnLCAnJG1ldGEnLCAnJHNsaWNlJ10uc29tZShrZXkgPT5cbiAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwga2V5KVxuICAgICAgICApKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgJ01pbmltb25nbyBkb2VzblxcJ3Qgc3VwcG9ydCBvcGVyYXRvcnMgaW4gcHJvamVjdGlvbnMgeWV0LidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFbMSwgMCwgdHJ1ZSwgZmFsc2VdLmluY2x1ZGVzKHZhbHVlKSkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICdQcm9qZWN0aW9uIHZhbHVlcyBzaG91bGQgYmUgb25lIG9mIDEsIDAsIHRydWUsIG9yIGZhbHNlJ1xuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gS25vd3MgaG93IHRvIGNvbXBpbGUgYSBmaWVsZHMgcHJvamVjdGlvbiB0byBhIHByZWRpY2F0ZSBmdW5jdGlvbi5cbi8vIEByZXR1cm5zIC0gRnVuY3Rpb246IGEgY2xvc3VyZSB0aGF0IGZpbHRlcnMgb3V0IGFuIG9iamVjdCBhY2NvcmRpbmcgdG8gdGhlXG4vLyAgICAgICAgICAgIGZpZWxkcyBwcm9qZWN0aW9uIHJ1bGVzOlxuLy8gICAgICAgICAgICBAcGFyYW0gb2JqIC0gT2JqZWN0OiBNb25nb0RCLXN0eWxlZCBkb2N1bWVudFxuLy8gICAgICAgICAgICBAcmV0dXJucyAtIE9iamVjdDogYSBkb2N1bWVudCB3aXRoIHRoZSBmaWVsZHMgZmlsdGVyZWQgb3V0XG4vLyAgICAgICAgICAgICAgICAgICAgICAgYWNjb3JkaW5nIHRvIHByb2plY3Rpb24gcnVsZXMuIERvZXNuJ3QgcmV0YWluIHN1YmZpZWxkc1xuLy8gICAgICAgICAgICAgICAgICAgICAgIG9mIHBhc3NlZCBhcmd1bWVudC5cbkxvY2FsQ29sbGVjdGlvbi5fY29tcGlsZVByb2plY3Rpb24gPSBmaWVsZHMgPT4ge1xuICBMb2NhbENvbGxlY3Rpb24uX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbihmaWVsZHMpO1xuXG4gIGNvbnN0IF9pZFByb2plY3Rpb24gPSBmaWVsZHMuX2lkID09PSB1bmRlZmluZWQgPyB0cnVlIDogZmllbGRzLl9pZDtcbiAgY29uc3QgZGV0YWlscyA9IHByb2plY3Rpb25EZXRhaWxzKGZpZWxkcyk7XG5cbiAgLy8gcmV0dXJucyB0cmFuc2Zvcm1lZCBkb2MgYWNjb3JkaW5nIHRvIHJ1bGVUcmVlXG4gIGNvbnN0IHRyYW5zZm9ybSA9IChkb2MsIHJ1bGVUcmVlKSA9PiB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBcInNldHNcIlxuICAgIGlmIChBcnJheS5pc0FycmF5KGRvYykpIHtcbiAgICAgIHJldHVybiBkb2MubWFwKHN1YmRvYyA9PiB0cmFuc2Zvcm0oc3ViZG9jLCBydWxlVHJlZSkpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGRldGFpbHMuaW5jbHVkaW5nID8ge30gOiBFSlNPTi5jbG9uZShkb2MpO1xuXG4gICAgT2JqZWN0LmtleXMocnVsZVRyZWUpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmIChkb2MgPT0gbnVsbCB8fCAhaGFzT3duLmNhbGwoZG9jLCBrZXkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcnVsZSA9IHJ1bGVUcmVlW2tleV07XG5cbiAgICAgIGlmIChydWxlID09PSBPYmplY3QocnVsZSkpIHtcbiAgICAgICAgLy8gRm9yIHN1Yi1vYmplY3RzL3N1YnNldHMgd2UgYnJhbmNoXG4gICAgICAgIGlmIChkb2Nba2V5XSA9PT0gT2JqZWN0KGRvY1trZXldKSkge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdHJhbnNmb3JtKGRvY1trZXldLCBydWxlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZXRhaWxzLmluY2x1ZGluZykge1xuICAgICAgICAvLyBPdGhlcndpc2Ugd2UgZG9uJ3QgZXZlbiB0b3VjaCB0aGlzIHN1YmZpZWxkXG4gICAgICAgIHJlc3VsdFtrZXldID0gRUpTT04uY2xvbmUoZG9jW2tleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHJlc3VsdFtrZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRvYyAhPSBudWxsID8gcmVzdWx0IDogZG9jO1xuICB9O1xuXG4gIHJldHVybiBkb2MgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRyYW5zZm9ybShkb2MsIGRldGFpbHMudHJlZSk7XG5cbiAgICBpZiAoX2lkUHJvamVjdGlvbiAmJiBoYXNPd24uY2FsbChkb2MsICdfaWQnKSkge1xuICAgICAgcmVzdWx0Ll9pZCA9IGRvYy5faWQ7XG4gICAgfVxuXG4gICAgaWYgKCFfaWRQcm9qZWN0aW9uICYmIGhhc093bi5jYWxsKHJlc3VsdCwgJ19pZCcpKSB7XG4gICAgICBkZWxldGUgcmVzdWx0Ll9pZDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufTtcblxuLy8gQ2FsY3VsYXRlcyB0aGUgZG9jdW1lbnQgdG8gaW5zZXJ0IGluIGNhc2Ugd2UncmUgZG9pbmcgYW4gdXBzZXJ0IGFuZCB0aGVcbi8vIHNlbGVjdG9yIGRvZXMgbm90IG1hdGNoIGFueSBlbGVtZW50c1xuTG9jYWxDb2xsZWN0aW9uLl9jcmVhdGVVcHNlcnREb2N1bWVudCA9IChzZWxlY3RvciwgbW9kaWZpZXIpID0+IHtcbiAgY29uc3Qgc2VsZWN0b3JEb2N1bWVudCA9IHBvcHVsYXRlRG9jdW1lbnRXaXRoUXVlcnlGaWVsZHMoc2VsZWN0b3IpO1xuICBjb25zdCBpc01vZGlmeSA9IExvY2FsQ29sbGVjdGlvbi5faXNNb2RpZmljYXRpb25Nb2QobW9kaWZpZXIpO1xuXG4gIGNvbnN0IG5ld0RvYyA9IHt9O1xuXG4gIGlmIChzZWxlY3RvckRvY3VtZW50Ll9pZCkge1xuICAgIG5ld0RvYy5faWQgPSBzZWxlY3RvckRvY3VtZW50Ll9pZDtcbiAgICBkZWxldGUgc2VsZWN0b3JEb2N1bWVudC5faWQ7XG4gIH1cblxuICAvLyBUaGlzIGRvdWJsZSBfbW9kaWZ5IGNhbGwgaXMgbWFkZSB0byBoZWxwIHdpdGggbmVzdGVkIHByb3BlcnRpZXMgKHNlZSBpc3N1ZVxuICAvLyAjODYzMSkuIFdlIGRvIHRoaXMgZXZlbiBpZiBpdCdzIGEgcmVwbGFjZW1lbnQgZm9yIHZhbGlkYXRpb24gcHVycG9zZXMgKGUuZy5cbiAgLy8gYW1iaWd1b3VzIGlkJ3MpXG4gIExvY2FsQ29sbGVjdGlvbi5fbW9kaWZ5KG5ld0RvYywgeyRzZXQ6IHNlbGVjdG9yRG9jdW1lbnR9KTtcbiAgTG9jYWxDb2xsZWN0aW9uLl9tb2RpZnkobmV3RG9jLCBtb2RpZmllciwge2lzSW5zZXJ0OiB0cnVlfSk7XG5cbiAgaWYgKGlzTW9kaWZ5KSB7XG4gICAgcmV0dXJuIG5ld0RvYztcbiAgfVxuXG4gIC8vIFJlcGxhY2VtZW50IGNhbiB0YWtlIF9pZCBmcm9tIHF1ZXJ5IGRvY3VtZW50XG4gIGNvbnN0IHJlcGxhY2VtZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgbW9kaWZpZXIpO1xuICBpZiAobmV3RG9jLl9pZCkge1xuICAgIHJlcGxhY2VtZW50Ll9pZCA9IG5ld0RvYy5faWQ7XG4gIH1cblxuICByZXR1cm4gcmVwbGFjZW1lbnQ7XG59O1xuXG5Mb2NhbENvbGxlY3Rpb24uX2RpZmZPYmplY3RzID0gKGxlZnQsIHJpZ2h0LCBjYWxsYmFja3MpID0+IHtcbiAgcmV0dXJuIERpZmZTZXF1ZW5jZS5kaWZmT2JqZWN0cyhsZWZ0LCByaWdodCwgY2FsbGJhY2tzKTtcbn07XG5cbi8vIG9yZGVyZWQ6IGJvb2wuXG4vLyBvbGRfcmVzdWx0cyBhbmQgbmV3X3Jlc3VsdHM6IGNvbGxlY3Rpb25zIG9mIGRvY3VtZW50cy5cbi8vICAgIGlmIG9yZGVyZWQsIHRoZXkgYXJlIGFycmF5cy5cbi8vICAgIGlmIHVub3JkZXJlZCwgdGhleSBhcmUgSWRNYXBzXG5Mb2NhbENvbGxlY3Rpb24uX2RpZmZRdWVyeUNoYW5nZXMgPSAob3JkZXJlZCwgb2xkUmVzdWx0cywgbmV3UmVzdWx0cywgb2JzZXJ2ZXIsIG9wdGlvbnMpID0+XG4gIERpZmZTZXF1ZW5jZS5kaWZmUXVlcnlDaGFuZ2VzKG9yZGVyZWQsIG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIG9ic2VydmVyLCBvcHRpb25zKVxuO1xuXG5Mb2NhbENvbGxlY3Rpb24uX2RpZmZRdWVyeU9yZGVyZWRDaGFuZ2VzID0gKG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIG9ic2VydmVyLCBvcHRpb25zKSA9PlxuICBEaWZmU2VxdWVuY2UuZGlmZlF1ZXJ5T3JkZXJlZENoYW5nZXMob2xkUmVzdWx0cywgbmV3UmVzdWx0cywgb2JzZXJ2ZXIsIG9wdGlvbnMpXG47XG5cbkxvY2FsQ29sbGVjdGlvbi5fZGlmZlF1ZXJ5VW5vcmRlcmVkQ2hhbmdlcyA9IChvbGRSZXN1bHRzLCBuZXdSZXN1bHRzLCBvYnNlcnZlciwgb3B0aW9ucykgPT5cbiAgRGlmZlNlcXVlbmNlLmRpZmZRdWVyeVVub3JkZXJlZENoYW5nZXMob2xkUmVzdWx0cywgbmV3UmVzdWx0cywgb2JzZXJ2ZXIsIG9wdGlvbnMpXG47XG5cbkxvY2FsQ29sbGVjdGlvbi5fZmluZEluT3JkZXJlZFJlc3VsdHMgPSAocXVlcnksIGRvYykgPT4ge1xuICBpZiAoIXF1ZXJ5Lm9yZGVyZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgY2FsbCBfZmluZEluT3JkZXJlZFJlc3VsdHMgb24gdW5vcmRlcmVkIHF1ZXJ5Jyk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHF1ZXJ5LnJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocXVlcnkucmVzdWx0c1tpXSA9PT0gZG9jKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBFcnJvcignb2JqZWN0IG1pc3NpbmcgZnJvbSBxdWVyeScpO1xufTtcblxuLy8gSWYgdGhpcyBpcyBhIHNlbGVjdG9yIHdoaWNoIGV4cGxpY2l0bHkgY29uc3RyYWlucyB0aGUgbWF0Y2ggYnkgSUQgdG8gYSBmaW5pdGVcbi8vIG51bWJlciBvZiBkb2N1bWVudHMsIHJldHVybnMgYSBsaXN0IG9mIHRoZWlyIElEcy4gIE90aGVyd2lzZSByZXR1cm5zXG4vLyBudWxsLiBOb3RlIHRoYXQgdGhlIHNlbGVjdG9yIG1heSBoYXZlIG90aGVyIHJlc3RyaWN0aW9ucyBzbyBpdCBtYXkgbm90IGV2ZW5cbi8vIG1hdGNoIHRob3NlIGRvY3VtZW50ISAgV2UgY2FyZSBhYm91dCAkaW4gYW5kICRhbmQgc2luY2UgdGhvc2UgYXJlIGdlbmVyYXRlZFxuLy8gYWNjZXNzLWNvbnRyb2xsZWQgdXBkYXRlIGFuZCByZW1vdmUuXG5Mb2NhbENvbGxlY3Rpb24uX2lkc01hdGNoZWRCeVNlbGVjdG9yID0gc2VsZWN0b3IgPT4ge1xuICAvLyBJcyB0aGUgc2VsZWN0b3IganVzdCBhbiBJRD9cbiAgaWYgKExvY2FsQ29sbGVjdGlvbi5fc2VsZWN0b3JJc0lkKHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBbc2VsZWN0b3JdO1xuICB9XG5cbiAgaWYgKCFzZWxlY3Rvcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gRG8gd2UgaGF2ZSBhbiBfaWQgY2xhdXNlP1xuICBpZiAoaGFzT3duLmNhbGwoc2VsZWN0b3IsICdfaWQnKSkge1xuICAgIC8vIElzIHRoZSBfaWQgY2xhdXNlIGp1c3QgYW4gSUQ/XG4gICAgaWYgKExvY2FsQ29sbGVjdGlvbi5fc2VsZWN0b3JJc0lkKHNlbGVjdG9yLl9pZCkpIHtcbiAgICAgIHJldHVybiBbc2VsZWN0b3IuX2lkXTtcbiAgICB9XG5cbiAgICAvLyBJcyB0aGUgX2lkIGNsYXVzZSB7X2lkOiB7JGluOiBbXCJ4XCIsIFwieVwiLCBcInpcIl19fT9cbiAgICBpZiAoc2VsZWN0b3IuX2lkXG4gICAgICAgICYmIEFycmF5LmlzQXJyYXkoc2VsZWN0b3IuX2lkLiRpbilcbiAgICAgICAgJiYgc2VsZWN0b3IuX2lkLiRpbi5sZW5ndGhcbiAgICAgICAgJiYgc2VsZWN0b3IuX2lkLiRpbi5ldmVyeShMb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZCkpIHtcbiAgICAgIHJldHVybiBzZWxlY3Rvci5faWQuJGluO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSWYgdGhpcyBpcyBhIHRvcC1sZXZlbCAkYW5kLCBhbmQgYW55IG9mIHRoZSBjbGF1c2VzIGNvbnN0cmFpbiB0aGVpclxuICAvLyBkb2N1bWVudHMsIHRoZW4gdGhlIHdob2xlIHNlbGVjdG9yIGlzIGNvbnN0cmFpbmVkIGJ5IGFueSBvbmUgY2xhdXNlJ3NcbiAgLy8gY29uc3RyYWludC4gKFdlbGwsIGJ5IHRoZWlyIGludGVyc2VjdGlvbiwgYnV0IHRoYXQgc2VlbXMgdW5saWtlbHkuKVxuICBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3Rvci4kYW5kKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0b3IuJGFuZC5sZW5ndGg7ICsraSkge1xuICAgICAgY29uc3Qgc3ViSWRzID0gTG9jYWxDb2xsZWN0aW9uLl9pZHNNYXRjaGVkQnlTZWxlY3RvcihzZWxlY3Rvci4kYW5kW2ldKTtcblxuICAgICAgaWYgKHN1Yklkcykge1xuICAgICAgICByZXR1cm4gc3ViSWRzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblJlc3VsdHNTeW5jID0gKHF1ZXJ5LCBkb2MpID0+IHtcbiAgY29uc3QgZmllbGRzID0gRUpTT04uY2xvbmUoZG9jKTtcblxuICBkZWxldGUgZmllbGRzLl9pZDtcblxuICBpZiAocXVlcnkub3JkZXJlZCkge1xuICAgIGlmICghcXVlcnkuc29ydGVyKSB7XG4gICAgICBxdWVyeS5hZGRlZEJlZm9yZShkb2MuX2lkLCBxdWVyeS5wcm9qZWN0aW9uRm4oZmllbGRzKSwgbnVsbCk7XG4gICAgICBxdWVyeS5yZXN1bHRzLnB1c2goZG9jKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaSA9IExvY2FsQ29sbGVjdGlvbi5faW5zZXJ0SW5Tb3J0ZWRMaXN0KFxuICAgICAgICBxdWVyeS5zb3J0ZXIuZ2V0Q29tcGFyYXRvcih7ZGlzdGFuY2VzOiBxdWVyeS5kaXN0YW5jZXN9KSxcbiAgICAgICAgcXVlcnkucmVzdWx0cyxcbiAgICAgICAgZG9jXG4gICAgICApO1xuXG4gICAgICBsZXQgbmV4dCA9IHF1ZXJ5LnJlc3VsdHNbaSArIDFdO1xuICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgbmV4dCA9IG5leHQuX2lkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5LmFkZGVkQmVmb3JlKGRvYy5faWQsIHF1ZXJ5LnByb2plY3Rpb25GbihmaWVsZHMpLCBuZXh0KTtcbiAgICB9XG5cbiAgICBxdWVyeS5hZGRlZChkb2MuX2lkLCBxdWVyeS5wcm9qZWN0aW9uRm4oZmllbGRzKSk7XG4gIH0gZWxzZSB7XG4gICAgcXVlcnkuYWRkZWQoZG9jLl9pZCwgcXVlcnkucHJvamVjdGlvbkZuKGZpZWxkcykpO1xuICAgIHF1ZXJ5LnJlc3VsdHMuc2V0KGRvYy5faWQsIGRvYyk7XG4gIH1cbn07XG5cbkxvY2FsQ29sbGVjdGlvbi5faW5zZXJ0SW5SZXN1bHRzQXN5bmMgPSBhc3luYyAocXVlcnksIGRvYykgPT4ge1xuICBjb25zdCBmaWVsZHMgPSBFSlNPTi5jbG9uZShkb2MpO1xuXG4gIGRlbGV0ZSBmaWVsZHMuX2lkO1xuXG4gIGlmIChxdWVyeS5vcmRlcmVkKSB7XG4gICAgaWYgKCFxdWVyeS5zb3J0ZXIpIHtcbiAgICAgIGF3YWl0IHF1ZXJ5LmFkZGVkQmVmb3JlKGRvYy5faWQsIHF1ZXJ5LnByb2plY3Rpb25GbihmaWVsZHMpLCBudWxsKTtcbiAgICAgIHF1ZXJ5LnJlc3VsdHMucHVzaChkb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpID0gTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblNvcnRlZExpc3QoXG4gICAgICAgIHF1ZXJ5LnNvcnRlci5nZXRDb21wYXJhdG9yKHtkaXN0YW5jZXM6IHF1ZXJ5LmRpc3RhbmNlc30pLFxuICAgICAgICBxdWVyeS5yZXN1bHRzLFxuICAgICAgICBkb2NcbiAgICAgICk7XG5cbiAgICAgIGxldCBuZXh0ID0gcXVlcnkucmVzdWx0c1tpICsgMV07XG4gICAgICBpZiAobmV4dCkge1xuICAgICAgICBuZXh0ID0gbmV4dC5faWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgcXVlcnkuYWRkZWRCZWZvcmUoZG9jLl9pZCwgcXVlcnkucHJvamVjdGlvbkZuKGZpZWxkcyksIG5leHQpO1xuICAgIH1cblxuICAgIGF3YWl0IHF1ZXJ5LmFkZGVkKGRvYy5faWQsIHF1ZXJ5LnByb2plY3Rpb25GbihmaWVsZHMpKTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBxdWVyeS5hZGRlZChkb2MuX2lkLCBxdWVyeS5wcm9qZWN0aW9uRm4oZmllbGRzKSk7XG4gICAgcXVlcnkucmVzdWx0cy5zZXQoZG9jLl9pZCwgZG9jKTtcbiAgfVxufTtcblxuTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblNvcnRlZExpc3QgPSAoY21wLCBhcnJheSwgdmFsdWUpID0+IHtcbiAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgaSA9IExvY2FsQ29sbGVjdGlvbi5fYmluYXJ5U2VhcmNoKGNtcCwgYXJyYXksIHZhbHVlKTtcblxuICBhcnJheS5zcGxpY2UoaSwgMCwgdmFsdWUpO1xuXG4gIHJldHVybiBpO1xufTtcblxuTG9jYWxDb2xsZWN0aW9uLl9pc01vZGlmaWNhdGlvbk1vZCA9IG1vZCA9PiB7XG4gIGxldCBpc01vZGlmeSA9IGZhbHNlO1xuICBsZXQgaXNSZXBsYWNlID0gZmFsc2U7XG5cbiAgT2JqZWN0LmtleXMobW9kKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleS5zdWJzdHIoMCwgMSkgPT09ICckJykge1xuICAgICAgaXNNb2RpZnkgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc1JlcGxhY2UgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGlzTW9kaWZ5ICYmIGlzUmVwbGFjZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdVcGRhdGUgcGFyYW1ldGVyIGNhbm5vdCBoYXZlIGJvdGggbW9kaWZpZXIgYW5kIG5vbi1tb2RpZmllciBmaWVsZHMuJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gaXNNb2RpZnk7XG59O1xuXG4vLyBYWFggbWF5YmUgdGhpcyBzaG91bGQgYmUgRUpTT04uaXNPYmplY3QsIHRob3VnaCBFSlNPTiBkb2Vzbid0IGtub3cgYWJvdXRcbi8vIFJlZ0V4cFxuLy8gWFhYIG5vdGUgdGhhdCBfdHlwZSh1bmRlZmluZWQpID09PSAzISEhIVxuTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0ID0geCA9PiB7XG4gIHJldHVybiB4ICYmIExvY2FsQ29sbGVjdGlvbi5fZi5fdHlwZSh4KSA9PT0gMztcbn07XG5cbi8vIFhYWCBuZWVkIGEgc3RyYXRlZ3kgZm9yIHBhc3NpbmcgdGhlIGJpbmRpbmcgb2YgJCBpbnRvIHRoaXNcbi8vIGZ1bmN0aW9uLCBmcm9tIHRoZSBjb21waWxlZCBzZWxlY3RvclxuLy9cbi8vIG1heWJlIGp1c3Qge2tleS51cC50by5qdXN0LmJlZm9yZS5kb2xsYXJzaWduOiBhcnJheV9pbmRleH1cbi8vXG4vLyBYWFggYXRvbWljaXR5OiBpZiBvbmUgbW9kaWZpY2F0aW9uIGZhaWxzLCBkbyB3ZSByb2xsIGJhY2sgdGhlIHdob2xlXG4vLyBjaGFuZ2U/XG4vL1xuLy8gb3B0aW9uczpcbi8vICAgLSBpc0luc2VydCBpcyBzZXQgd2hlbiBfbW9kaWZ5IGlzIGJlaW5nIGNhbGxlZCB0byBjb21wdXRlIHRoZSBkb2N1bWVudCB0b1xuLy8gICAgIGluc2VydCBhcyBwYXJ0IG9mIGFuIHVwc2VydCBvcGVyYXRpb24uIFdlIHVzZSB0aGlzIHByaW1hcmlseSB0byBmaWd1cmVcbi8vICAgICBvdXQgd2hlbiB0byBzZXQgdGhlIGZpZWxkcyBpbiAkc2V0T25JbnNlcnQsIGlmIHByZXNlbnQuXG5Mb2NhbENvbGxlY3Rpb24uX21vZGlmeSA9IChkb2MsIG1vZGlmaWVyLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKCFMb2NhbENvbGxlY3Rpb24uX2lzUGxhaW5PYmplY3QobW9kaWZpZXIpKSB7XG4gICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJ01vZGlmaWVyIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgdGhlIGNhbGxlciBjYW4ndCBtdXRhdGUgb3VyIGRhdGEgc3RydWN0dXJlcy5cbiAgbW9kaWZpZXIgPSBFSlNPTi5jbG9uZShtb2RpZmllcik7XG5cbiAgY29uc3QgaXNNb2RpZmllciA9IGlzT3BlcmF0b3JPYmplY3QobW9kaWZpZXIpO1xuICBjb25zdCBuZXdEb2MgPSBpc01vZGlmaWVyID8gRUpTT04uY2xvbmUoZG9jKSA6IG1vZGlmaWVyO1xuXG4gIGlmIChpc01vZGlmaWVyKSB7XG4gICAgLy8gYXBwbHkgbW9kaWZpZXJzIHRvIHRoZSBkb2MuXG4gICAgT2JqZWN0LmtleXMobW9kaWZpZXIpLmZvckVhY2gob3BlcmF0b3IgPT4ge1xuICAgICAgLy8gVHJlYXQgJHNldE9uSW5zZXJ0IGFzICRzZXQgaWYgdGhpcyBpcyBhbiBpbnNlcnQuXG4gICAgICBjb25zdCBzZXRPbkluc2VydCA9IG9wdGlvbnMuaXNJbnNlcnQgJiYgb3BlcmF0b3IgPT09ICckc2V0T25JbnNlcnQnO1xuICAgICAgY29uc3QgbW9kRnVuYyA9IE1PRElGSUVSU1tzZXRPbkluc2VydCA/ICckc2V0JyA6IG9wZXJhdG9yXTtcbiAgICAgIGNvbnN0IG9wZXJhbmQgPSBtb2RpZmllcltvcGVyYXRvcl07XG5cbiAgICAgIGlmICghbW9kRnVuYykge1xuICAgICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihgSW52YWxpZCBtb2RpZmllciBzcGVjaWZpZWQgJHtvcGVyYXRvcn1gKTtcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMob3BlcmFuZCkuZm9yRWFjaChrZXlwYXRoID0+IHtcbiAgICAgICAgY29uc3QgYXJnID0gb3BlcmFuZFtrZXlwYXRoXTtcblxuICAgICAgICBpZiAoa2V5cGF0aCA9PT0gJycpIHtcbiAgICAgICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignQW4gZW1wdHkgdXBkYXRlIHBhdGggaXMgbm90IHZhbGlkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qga2V5cGFydHMgPSBrZXlwYXRoLnNwbGl0KCcuJyk7XG5cbiAgICAgICAgaWYgKCFrZXlwYXJ0cy5ldmVyeShCb29sZWFuKSkge1xuICAgICAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAgICAgYFRoZSB1cGRhdGUgcGF0aCAnJHtrZXlwYXRofScgY29udGFpbnMgYW4gZW1wdHkgZmllbGQgbmFtZSwgYCArXG4gICAgICAgICAgICAnd2hpY2ggaXMgbm90IGFsbG93ZWQuJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBmaW5kTW9kVGFyZ2V0KG5ld0RvYywga2V5cGFydHMsIHtcbiAgICAgICAgICBhcnJheUluZGljZXM6IG9wdGlvbnMuYXJyYXlJbmRpY2VzLFxuICAgICAgICAgIGZvcmJpZEFycmF5OiBvcGVyYXRvciA9PT0gJyRyZW5hbWUnLFxuICAgICAgICAgIG5vQ3JlYXRlOiBOT19DUkVBVEVfTU9ESUZJRVJTW29wZXJhdG9yXVxuICAgICAgICB9KTtcblxuICAgICAgICBtb2RGdW5jKHRhcmdldCwga2V5cGFydHMucG9wKCksIGFyZywga2V5cGF0aCwgbmV3RG9jKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKGRvYy5faWQgJiYgIUVKU09OLmVxdWFscyhkb2MuX2lkLCBuZXdEb2MuX2lkKSkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgIGBBZnRlciBhcHBseWluZyB0aGUgdXBkYXRlIHRvIHRoZSBkb2N1bWVudCB7X2lkOiBcIiR7ZG9jLl9pZH1cIiwgLi4ufSxgICtcbiAgICAgICAgJyB0aGUgKGltbXV0YWJsZSkgZmllbGQgXFwnX2lkXFwnIHdhcyBmb3VuZCB0byBoYXZlIGJlZW4gYWx0ZXJlZCB0byAnICtcbiAgICAgICAgYF9pZDogXCIke25ld0RvYy5faWR9XCJgXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZG9jLl9pZCAmJiBtb2RpZmllci5faWQgJiYgIUVKU09OLmVxdWFscyhkb2MuX2lkLCBtb2RpZmllci5faWQpKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgYFRoZSBfaWQgZmllbGQgY2Fubm90IGJlIGNoYW5nZWQgZnJvbSB7X2lkOiBcIiR7ZG9jLl9pZH1cIn0gdG8gYCArXG4gICAgICAgIGB7X2lkOiBcIiR7bW9kaWZpZXIuX2lkfVwifWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gcmVwbGFjZSB0aGUgd2hvbGUgZG9jdW1lbnRcbiAgICBhc3NlcnRIYXNWYWxpZEZpZWxkTmFtZXMobW9kaWZpZXIpO1xuICB9XG5cbiAgLy8gbW92ZSBuZXcgZG9jdW1lbnQgaW50byBwbGFjZS5cbiAgT2JqZWN0LmtleXMoZG9jKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgLy8gTm90ZTogdGhpcyB1c2VkIHRvIGJlIGZvciAodmFyIGtleSBpbiBkb2MpIGhvd2V2ZXIsIHRoaXMgZG9lcyBub3RcbiAgICAvLyB3b3JrIHJpZ2h0IGluIE9wZXJhLiBEZWxldGluZyBmcm9tIGEgZG9jIHdoaWxlIGl0ZXJhdGluZyBvdmVyIGl0XG4gICAgLy8gd291bGQgc29tZXRpbWVzIGNhdXNlIG9wZXJhIHRvIHNraXAgc29tZSBrZXlzLlxuICAgIGlmIChrZXkgIT09ICdfaWQnKSB7XG4gICAgICBkZWxldGUgZG9jW2tleV07XG4gICAgfVxuICB9KTtcblxuICBPYmplY3Qua2V5cyhuZXdEb2MpLmZvckVhY2goa2V5ID0+IHtcbiAgICBkb2Nba2V5XSA9IG5ld0RvY1trZXldO1xuICB9KTtcbn07XG5cbkxvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUZyb21PYnNlcnZlQ2hhbmdlcyA9IChjdXJzb3IsIG9ic2VydmVDYWxsYmFja3MpID0+IHtcbiAgY29uc3QgdHJhbnNmb3JtID0gY3Vyc29yLmdldFRyYW5zZm9ybSgpIHx8IChkb2MgPT4gZG9jKTtcbiAgbGV0IHN1cHByZXNzZWQgPSAhIW9ic2VydmVDYWxsYmFja3MuX3N1cHByZXNzX2luaXRpYWw7XG5cbiAgbGV0IG9ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzO1xuICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9vYnNlcnZlQ2FsbGJhY2tzQXJlT3JkZXJlZChvYnNlcnZlQ2FsbGJhY2tzKSkge1xuICAgIC8vIFRoZSBcIl9ub19pbmRpY2VzXCIgb3B0aW9uIHNldHMgYWxsIGluZGV4IGFyZ3VtZW50cyB0byAtMSBhbmQgc2tpcHMgdGhlXG4gICAgLy8gbGluZWFyIHNjYW5zIHJlcXVpcmVkIHRvIGdlbmVyYXRlIHRoZW0uICBUaGlzIGxldHMgb2JzZXJ2ZXJzIHRoYXQgZG9uJ3RcbiAgICAvLyBuZWVkIGFic29sdXRlIGluZGljZXMgYmVuZWZpdCBmcm9tIHRoZSBvdGhlciBmZWF0dXJlcyBvZiB0aGlzIEFQSSAtLVxuICAgIC8vIHJlbGF0aXZlIG9yZGVyLCB0cmFuc2Zvcm1zLCBhbmQgYXBwbHlDaGFuZ2VzIC0tIHdpdGhvdXQgdGhlIHNwZWVkIGhpdC5cbiAgICBjb25zdCBpbmRpY2VzID0gIW9ic2VydmVDYWxsYmFja3MuX25vX2luZGljZXM7XG5cbiAgICBvYnNlcnZlQ2hhbmdlc0NhbGxiYWNrcyA9IHtcbiAgICAgIGFkZGVkQmVmb3JlKGlkLCBmaWVsZHMsIGJlZm9yZSkge1xuICAgICAgICBjb25zdCBjaGVjayA9IHN1cHByZXNzZWQgfHwgIShvYnNlcnZlQ2FsbGJhY2tzLmFkZGVkQXQgfHwgb2JzZXJ2ZUNhbGxiYWNrcy5hZGRlZClcbiAgICAgICAgaWYgKGNoZWNrKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZG9jID0gdHJhbnNmb3JtKE9iamVjdC5hc3NpZ24oZmllbGRzLCB7X2lkOiBpZH0pKTtcblxuICAgICAgICBpZiAob2JzZXJ2ZUNhbGxiYWNrcy5hZGRlZEF0KSB7XG4gICAgICAgICAgb2JzZXJ2ZUNhbGxiYWNrcy5hZGRlZEF0KFxuICAgICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICAgIGluZGljZXNcbiAgICAgICAgICAgICAgICAgID8gYmVmb3JlXG4gICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLmRvY3MuaW5kZXhPZihiZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLmRvY3Muc2l6ZSgpXG4gICAgICAgICAgICAgICAgICA6IC0xLFxuICAgICAgICAgICAgICBiZWZvcmVcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ic2VydmVDYWxsYmFja3MuYWRkZWQoZG9jKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNoYW5nZWQoaWQsIGZpZWxkcykge1xuXG4gICAgICAgIGlmICghKG9ic2VydmVDYWxsYmFja3MuY2hhbmdlZEF0IHx8IG9ic2VydmVDYWxsYmFja3MuY2hhbmdlZCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZG9jID0gRUpTT04uY2xvbmUodGhpcy5kb2NzLmdldChpZCkpO1xuICAgICAgICBpZiAoIWRvYykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBpZCBmb3IgY2hhbmdlZDogJHtpZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9sZERvYyA9IHRyYW5zZm9ybShFSlNPTi5jbG9uZShkb2MpKTtcblxuICAgICAgICBEaWZmU2VxdWVuY2UuYXBwbHlDaGFuZ2VzKGRvYywgZmllbGRzKTtcblxuICAgICAgICBpZiAob2JzZXJ2ZUNhbGxiYWNrcy5jaGFuZ2VkQXQpIHtcbiAgICAgICAgICBvYnNlcnZlQ2FsbGJhY2tzLmNoYW5nZWRBdChcbiAgICAgICAgICAgICAgdHJhbnNmb3JtKGRvYyksXG4gICAgICAgICAgICAgIG9sZERvYyxcbiAgICAgICAgICAgICAgaW5kaWNlcyA/IHRoaXMuZG9jcy5pbmRleE9mKGlkKSA6IC0xXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlQ2FsbGJhY2tzLmNoYW5nZWQodHJhbnNmb3JtKGRvYyksIG9sZERvYyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtb3ZlZEJlZm9yZShpZCwgYmVmb3JlKSB7XG4gICAgICAgIGlmICghb2JzZXJ2ZUNhbGxiYWNrcy5tb3ZlZFRvKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZnJvbSA9IGluZGljZXMgPyB0aGlzLmRvY3MuaW5kZXhPZihpZCkgOiAtMTtcbiAgICAgICAgbGV0IHRvID0gaW5kaWNlc1xuICAgICAgICAgICAgPyBiZWZvcmVcbiAgICAgICAgICAgICAgICA/IHRoaXMuZG9jcy5pbmRleE9mKGJlZm9yZSlcbiAgICAgICAgICAgICAgICA6IHRoaXMuZG9jcy5zaXplKClcbiAgICAgICAgICAgIDogLTE7XG5cbiAgICAgICAgLy8gV2hlbiBub3QgbW92aW5nIGJhY2t3YXJkcywgYWRqdXN0IGZvciB0aGUgZmFjdCB0aGF0IHJlbW92aW5nIHRoZVxuICAgICAgICAvLyBkb2N1bWVudCBzbGlkZXMgZXZlcnl0aGluZyBiYWNrIG9uZSBzbG90LlxuICAgICAgICBpZiAodG8gPiBmcm9tKSB7XG4gICAgICAgICAgLS10bztcbiAgICAgICAgfVxuXG4gICAgICAgIG9ic2VydmVDYWxsYmFja3MubW92ZWRUbyhcbiAgICAgICAgICAgIHRyYW5zZm9ybShFSlNPTi5jbG9uZSh0aGlzLmRvY3MuZ2V0KGlkKSkpLFxuICAgICAgICAgICAgZnJvbSxcbiAgICAgICAgICAgIHRvLFxuICAgICAgICAgICAgYmVmb3JlIHx8IG51bGxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICByZW1vdmVkKGlkKSB7XG4gICAgICAgIGlmICghKG9ic2VydmVDYWxsYmFja3MucmVtb3ZlZEF0IHx8IG9ic2VydmVDYWxsYmFja3MucmVtb3ZlZCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZWNobmljYWxseSBtYXliZSB0aGVyZSBzaG91bGQgYmUgYW4gRUpTT04uY2xvbmUgaGVyZSwgYnV0IGl0J3MgYWJvdXRcbiAgICAgICAgLy8gdG8gYmUgcmVtb3ZlZCBmcm9tIHRoaXMuZG9jcyFcbiAgICAgICAgY29uc3QgZG9jID0gdHJhbnNmb3JtKHRoaXMuZG9jcy5nZXQoaWQpKTtcblxuICAgICAgICBpZiAob2JzZXJ2ZUNhbGxiYWNrcy5yZW1vdmVkQXQpIHtcbiAgICAgICAgICBvYnNlcnZlQ2FsbGJhY2tzLnJlbW92ZWRBdChkb2MsIGluZGljZXMgPyB0aGlzLmRvY3MuaW5kZXhPZihpZCkgOiAtMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzZXJ2ZUNhbGxiYWNrcy5yZW1vdmVkKGRvYyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBvYnNlcnZlQ2hhbmdlc0NhbGxiYWNrcyA9IHtcbiAgICAgIGFkZGVkKGlkLCBmaWVsZHMpIHtcbiAgICAgICAgaWYgKCFzdXBwcmVzc2VkICYmIG9ic2VydmVDYWxsYmFja3MuYWRkZWQpIHtcbiAgICAgICAgICBvYnNlcnZlQ2FsbGJhY2tzLmFkZGVkKHRyYW5zZm9ybShPYmplY3QuYXNzaWduKGZpZWxkcywge19pZDogaWR9KSkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2hhbmdlZChpZCwgZmllbGRzKSB7XG4gICAgICAgIGlmIChvYnNlcnZlQ2FsbGJhY2tzLmNoYW5nZWQpIHtcbiAgICAgICAgICBjb25zdCBvbGREb2MgPSB0aGlzLmRvY3MuZ2V0KGlkKTtcbiAgICAgICAgICBjb25zdCBkb2MgPSBFSlNPTi5jbG9uZShvbGREb2MpO1xuXG4gICAgICAgICAgRGlmZlNlcXVlbmNlLmFwcGx5Q2hhbmdlcyhkb2MsIGZpZWxkcyk7XG5cbiAgICAgICAgICBvYnNlcnZlQ2FsbGJhY2tzLmNoYW5nZWQoXG4gICAgICAgICAgICAgIHRyYW5zZm9ybShkb2MpLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm0oRUpTT04uY2xvbmUob2xkRG9jKSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVtb3ZlZChpZCkge1xuICAgICAgICBpZiAob2JzZXJ2ZUNhbGxiYWNrcy5yZW1vdmVkKSB7XG4gICAgICAgICAgb2JzZXJ2ZUNhbGxiYWNrcy5yZW1vdmVkKHRyYW5zZm9ybSh0aGlzLmRvY3MuZ2V0KGlkKSkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBjb25zdCBjaGFuZ2VPYnNlcnZlciA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0NhY2hpbmdDaGFuZ2VPYnNlcnZlcih7XG4gICAgY2FsbGJhY2tzOiBvYnNlcnZlQ2hhbmdlc0NhbGxiYWNrc1xuICB9KTtcblxuICAvLyBDYWNoaW5nQ2hhbmdlT2JzZXJ2ZXIgY2xvbmVzIGFsbCByZWNlaXZlZCBpbnB1dCBvbiBpdHMgY2FsbGJhY2tzXG4gIC8vIFNvIHdlIGNhbiBtYXJrIGl0IGFzIHNhZmUgdG8gcmVkdWNlIHRoZSBlanNvbiBjbG9uZXMuXG4gIC8vIFRoaXMgaXMgdGVzdGVkIGJ5IHRoZSBgbW9uZ28tbGl2ZWRhdGEgLSAoZXh0ZW5kZWQpIHNjcmliYmxpbmdgIHRlc3RzXG4gIGNoYW5nZU9ic2VydmVyLmFwcGx5Q2hhbmdlLl9mcm9tT2JzZXJ2ZSA9IHRydWU7XG4gIGNvbnN0IGhhbmRsZSA9IGN1cnNvci5vYnNlcnZlQ2hhbmdlcyhjaGFuZ2VPYnNlcnZlci5hcHBseUNoYW5nZSxcbiAgICAgIHsgbm9uTXV0YXRpbmdDYWxsYmFja3M6IHRydWUgfSk7XG5cbiAgLy8gSWYgbmVlZGVkLCByZS1lbmFibGUgY2FsbGJhY2tzIGFzIHNvb24gYXMgdGhlIGluaXRpYWwgYmF0Y2ggaXMgcmVhZHkuXG4gIGNvbnN0IHNldFN1cHByZXNzZWQgPSAoaCkgPT4ge1xuICAgIGlmIChoLmlzUmVhZHkpIHN1cHByZXNzZWQgPSBmYWxzZTtcbiAgICBlbHNlIGguaXNSZWFkeVByb21pc2U/LnRoZW4oKCkgPT4gKHN1cHByZXNzZWQgPSBmYWxzZSkpO1xuICB9O1xuICAvLyBXaGVuIHdlIGNhbGwgY3Vyc29yLm9ic2VydmVDaGFuZ2VzKCkgaXQgY2FuIGJlIHRoZSBvbiBmcm9tXG4gIC8vIHRoZSBtb25nbyBwYWNrYWdlIChpbnN0ZWFkIG9mIHRoZSBtaW5pbW9uZ28gb25lKSBhbmQgaXQgZG9lc24ndCBoYXZlIGlzUmVhZHkgYW5kIGlzUmVhZHlQcm9taXNlXG4gIGlmIChNZXRlb3IuX2lzUHJvbWlzZShoYW5kbGUpKSB7XG4gICAgaGFuZGxlLnRoZW4oc2V0U3VwcHJlc3NlZCk7XG4gIH0gZWxzZSB7XG4gICAgc2V0U3VwcHJlc3NlZChoYW5kbGUpO1xuICB9XG4gIHJldHVybiBoYW5kbGU7XG59O1xuXG5Mb2NhbENvbGxlY3Rpb24uX29ic2VydmVDYWxsYmFja3NBcmVPcmRlcmVkID0gY2FsbGJhY2tzID0+IHtcbiAgaWYgKGNhbGxiYWNrcy5hZGRlZCAmJiBjYWxsYmFja3MuYWRkZWRBdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHNwZWNpZnkgb25seSBvbmUgb2YgYWRkZWQoKSBhbmQgYWRkZWRBdCgpJyk7XG4gIH1cblxuICBpZiAoY2FsbGJhY2tzLmNoYW5nZWQgJiYgY2FsbGJhY2tzLmNoYW5nZWRBdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHNwZWNpZnkgb25seSBvbmUgb2YgY2hhbmdlZCgpIGFuZCBjaGFuZ2VkQXQoKScpO1xuICB9XG5cbiAgaWYgKGNhbGxiYWNrcy5yZW1vdmVkICYmIGNhbGxiYWNrcy5yZW1vdmVkQXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBzcGVjaWZ5IG9ubHkgb25lIG9mIHJlbW92ZWQoKSBhbmQgcmVtb3ZlZEF0KCknKTtcbiAgfVxuXG4gIHJldHVybiAhIShcbiAgICBjYWxsYmFja3MuYWRkZWRBdCB8fFxuICAgIGNhbGxiYWNrcy5jaGFuZ2VkQXQgfHxcbiAgICBjYWxsYmFja3MubW92ZWRUbyB8fFxuICAgIGNhbGxiYWNrcy5yZW1vdmVkQXRcbiAgKTtcbn07XG5cbkxvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3NBcmVPcmRlcmVkID0gY2FsbGJhY2tzID0+IHtcbiAgaWYgKGNhbGxiYWNrcy5hZGRlZCAmJiBjYWxsYmFja3MuYWRkZWRCZWZvcmUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBzcGVjaWZ5IG9ubHkgb25lIG9mIGFkZGVkKCkgYW5kIGFkZGVkQmVmb3JlKCknKTtcbiAgfVxuXG4gIHJldHVybiAhIShjYWxsYmFja3MuYWRkZWRCZWZvcmUgfHwgY2FsbGJhY2tzLm1vdmVkQmVmb3JlKTtcbn07XG5cbkxvY2FsQ29sbGVjdGlvbi5fcmVtb3ZlRnJvbVJlc3VsdHNTeW5jID0gKHF1ZXJ5LCBkb2MpID0+IHtcbiAgaWYgKHF1ZXJ5Lm9yZGVyZWQpIHtcbiAgICBjb25zdCBpID0gTG9jYWxDb2xsZWN0aW9uLl9maW5kSW5PcmRlcmVkUmVzdWx0cyhxdWVyeSwgZG9jKTtcblxuICAgIHF1ZXJ5LnJlbW92ZWQoZG9jLl9pZCk7XG4gICAgcXVlcnkucmVzdWx0cy5zcGxpY2UoaSwgMSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaWQgPSBkb2MuX2lkOyAgLy8gaW4gY2FzZSBjYWxsYmFjayBtdXRhdGVzIGRvY1xuXG4gICAgcXVlcnkucmVtb3ZlZChpZCk7XG4gICAgcXVlcnkucmVzdWx0cy5yZW1vdmUoaWQpO1xuICB9XG59O1xuXG5Mb2NhbENvbGxlY3Rpb24uX3JlbW92ZUZyb21SZXN1bHRzQXN5bmMgPSBhc3luYyAocXVlcnksIGRvYykgPT4ge1xuICBpZiAocXVlcnkub3JkZXJlZCkge1xuICAgIGNvbnN0IGkgPSBMb2NhbENvbGxlY3Rpb24uX2ZpbmRJbk9yZGVyZWRSZXN1bHRzKHF1ZXJ5LCBkb2MpO1xuXG4gICAgYXdhaXQgcXVlcnkucmVtb3ZlZChkb2MuX2lkKTtcbiAgICBxdWVyeS5yZXN1bHRzLnNwbGljZShpLCAxKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBpZCA9IGRvYy5faWQ7ICAvLyBpbiBjYXNlIGNhbGxiYWNrIG11dGF0ZXMgZG9jXG5cbiAgICBhd2FpdCBxdWVyeS5yZW1vdmVkKGlkKTtcbiAgICBxdWVyeS5yZXN1bHRzLnJlbW92ZShpZCk7XG4gIH1cbn07XG5cbi8vIElzIHRoaXMgc2VsZWN0b3IganVzdCBzaG9ydGhhbmQgZm9yIGxvb2t1cCBieSBfaWQ/XG5Mb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZCA9IHNlbGVjdG9yID0+XG4gIHR5cGVvZiBzZWxlY3RvciA9PT0gJ251bWJlcicgfHxcbiAgdHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJyB8fFxuICBzZWxlY3RvciBpbnN0YW5jZW9mIE1vbmdvSUQuT2JqZWN0SURcbjtcblxuLy8gSXMgdGhlIHNlbGVjdG9yIGp1c3QgbG9va3VwIGJ5IF9pZCAoc2hvcnRoYW5kIG9yIG5vdCk/XG5Mb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZFBlcmhhcHNBc09iamVjdCA9IHNlbGVjdG9yID0+XG4gIExvY2FsQ29sbGVjdGlvbi5fc2VsZWN0b3JJc0lkKHNlbGVjdG9yKSB8fFxuICBMb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZChzZWxlY3RvciAmJiBzZWxlY3Rvci5faWQpICYmXG4gIE9iamVjdC5rZXlzKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbjtcblxuTG9jYWxDb2xsZWN0aW9uLl91cGRhdGVJblJlc3VsdHNTeW5jID0gKHF1ZXJ5LCBkb2MsIG9sZF9kb2MpID0+IHtcbiAgaWYgKCFFSlNPTi5lcXVhbHMoZG9jLl9pZCwgb2xkX2RvYy5faWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IGNoYW5nZSBhIGRvY1xcJ3MgX2lkIHdoaWxlIHVwZGF0aW5nJyk7XG4gIH1cblxuICBjb25zdCBwcm9qZWN0aW9uRm4gPSBxdWVyeS5wcm9qZWN0aW9uRm47XG4gIGNvbnN0IGNoYW5nZWRGaWVsZHMgPSBEaWZmU2VxdWVuY2UubWFrZUNoYW5nZWRGaWVsZHMoXG4gICAgcHJvamVjdGlvbkZuKGRvYyksXG4gICAgcHJvamVjdGlvbkZuKG9sZF9kb2MpXG4gICk7XG5cbiAgaWYgKCFxdWVyeS5vcmRlcmVkKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKGNoYW5nZWRGaWVsZHMpLmxlbmd0aCkge1xuICAgICAgcXVlcnkuY2hhbmdlZChkb2MuX2lkLCBjaGFuZ2VkRmllbGRzKTtcbiAgICAgIHF1ZXJ5LnJlc3VsdHMuc2V0KGRvYy5faWQsIGRvYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgb2xkX2lkeCA9IExvY2FsQ29sbGVjdGlvbi5fZmluZEluT3JkZXJlZFJlc3VsdHMocXVlcnksIGRvYyk7XG5cbiAgaWYgKE9iamVjdC5rZXlzKGNoYW5nZWRGaWVsZHMpLmxlbmd0aCkge1xuICAgIHF1ZXJ5LmNoYW5nZWQoZG9jLl9pZCwgY2hhbmdlZEZpZWxkcyk7XG4gIH1cblxuICBpZiAoIXF1ZXJ5LnNvcnRlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGp1c3QgdGFrZSBpdCBvdXQgYW5kIHB1dCBpdCBiYWNrIGluIGFnYWluLCBhbmQgc2VlIGlmIHRoZSBpbmRleCBjaGFuZ2VzXG4gIHF1ZXJ5LnJlc3VsdHMuc3BsaWNlKG9sZF9pZHgsIDEpO1xuXG4gIGNvbnN0IG5ld19pZHggPSBMb2NhbENvbGxlY3Rpb24uX2luc2VydEluU29ydGVkTGlzdChcbiAgICBxdWVyeS5zb3J0ZXIuZ2V0Q29tcGFyYXRvcih7ZGlzdGFuY2VzOiBxdWVyeS5kaXN0YW5jZXN9KSxcbiAgICBxdWVyeS5yZXN1bHRzLFxuICAgIGRvY1xuICApO1xuXG4gIGlmIChvbGRfaWR4ICE9PSBuZXdfaWR4KSB7XG4gICAgbGV0IG5leHQgPSBxdWVyeS5yZXN1bHRzW25ld19pZHggKyAxXTtcbiAgICBpZiAobmV4dCkge1xuICAgICAgbmV4dCA9IG5leHQuX2lkO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBxdWVyeS5tb3ZlZEJlZm9yZSAmJiBxdWVyeS5tb3ZlZEJlZm9yZShkb2MuX2lkLCBuZXh0KTtcbiAgfVxufTtcblxuTG9jYWxDb2xsZWN0aW9uLl91cGRhdGVJblJlc3VsdHNBc3luYyA9IGFzeW5jIChxdWVyeSwgZG9jLCBvbGRfZG9jKSA9PiB7XG4gIGlmICghRUpTT04uZXF1YWxzKGRvYy5faWQsIG9sZF9kb2MuX2lkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCBjaGFuZ2UgYSBkb2NcXCdzIF9pZCB3aGlsZSB1cGRhdGluZycpO1xuICB9XG5cbiAgY29uc3QgcHJvamVjdGlvbkZuID0gcXVlcnkucHJvamVjdGlvbkZuO1xuICBjb25zdCBjaGFuZ2VkRmllbGRzID0gRGlmZlNlcXVlbmNlLm1ha2VDaGFuZ2VkRmllbGRzKFxuICAgIHByb2plY3Rpb25Gbihkb2MpLFxuICAgIHByb2plY3Rpb25GbihvbGRfZG9jKVxuICApO1xuXG4gIGlmICghcXVlcnkub3JkZXJlZCkge1xuICAgIGlmIChPYmplY3Qua2V5cyhjaGFuZ2VkRmllbGRzKS5sZW5ndGgpIHtcbiAgICAgIGF3YWl0IHF1ZXJ5LmNoYW5nZWQoZG9jLl9pZCwgY2hhbmdlZEZpZWxkcyk7XG4gICAgICBxdWVyeS5yZXN1bHRzLnNldChkb2MuX2lkLCBkb2MpO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG9sZF9pZHggPSBMb2NhbENvbGxlY3Rpb24uX2ZpbmRJbk9yZGVyZWRSZXN1bHRzKHF1ZXJ5LCBkb2MpO1xuXG4gIGlmIChPYmplY3Qua2V5cyhjaGFuZ2VkRmllbGRzKS5sZW5ndGgpIHtcbiAgICBhd2FpdCBxdWVyeS5jaGFuZ2VkKGRvYy5faWQsIGNoYW5nZWRGaWVsZHMpO1xuICB9XG5cbiAgaWYgKCFxdWVyeS5zb3J0ZXIpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBqdXN0IHRha2UgaXQgb3V0IGFuZCBwdXQgaXQgYmFjayBpbiBhZ2FpbiwgYW5kIHNlZSBpZiB0aGUgaW5kZXggY2hhbmdlc1xuICBxdWVyeS5yZXN1bHRzLnNwbGljZShvbGRfaWR4LCAxKTtcblxuICBjb25zdCBuZXdfaWR4ID0gTG9jYWxDb2xsZWN0aW9uLl9pbnNlcnRJblNvcnRlZExpc3QoXG4gICAgcXVlcnkuc29ydGVyLmdldENvbXBhcmF0b3Ioe2Rpc3RhbmNlczogcXVlcnkuZGlzdGFuY2VzfSksXG4gICAgcXVlcnkucmVzdWx0cyxcbiAgICBkb2NcbiAgKTtcblxuICBpZiAob2xkX2lkeCAhPT0gbmV3X2lkeCkge1xuICAgIGxldCBuZXh0ID0gcXVlcnkucmVzdWx0c1tuZXdfaWR4ICsgMV07XG4gICAgaWYgKG5leHQpIHtcbiAgICAgIG5leHQgPSBuZXh0Ll9pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IG51bGw7XG4gICAgfVxuXG4gICAgcXVlcnkubW92ZWRCZWZvcmUgJiYgYXdhaXQgcXVlcnkubW92ZWRCZWZvcmUoZG9jLl9pZCwgbmV4dCk7XG4gIH1cbn07XG5cbmNvbnN0IE1PRElGSUVSUyA9IHtcbiAgJGN1cnJlbnREYXRlKHRhcmdldCwgZmllbGQsIGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBoYXNPd24uY2FsbChhcmcsICckdHlwZScpKSB7XG4gICAgICBpZiAoYXJnLiR0eXBlICE9PSAnZGF0ZScpIHtcbiAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgJ01pbmltb25nbyBkb2VzIGN1cnJlbnRseSBvbmx5IHN1cHBvcnQgdGhlIGRhdGUgdHlwZSBpbiAnICtcbiAgICAgICAgICAnJGN1cnJlbnREYXRlIG1vZGlmaWVycycsXG4gICAgICAgICAge2ZpZWxkfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXJnICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignSW52YWxpZCAkY3VycmVudERhdGUgbW9kaWZpZXInLCB7ZmllbGR9KTtcbiAgICB9XG5cbiAgICB0YXJnZXRbZmllbGRdID0gbmV3IERhdGUoKTtcbiAgfSxcbiAgJGluYyh0YXJnZXQsIGZpZWxkLCBhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCdNb2RpZmllciAkaW5jIGFsbG93ZWQgZm9yIG51bWJlcnMgb25seScsIHtmaWVsZH0pO1xuICAgIH1cblxuICAgIGlmIChmaWVsZCBpbiB0YXJnZXQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGFyZ2V0W2ZpZWxkXSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBhcHBseSAkaW5jIG1vZGlmaWVyIHRvIG5vbi1udW1iZXInLFxuICAgICAgICAgIHtmaWVsZH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgdGFyZ2V0W2ZpZWxkXSArPSBhcmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFtmaWVsZF0gPSBhcmc7XG4gICAgfVxuICB9LFxuICAkbWluKHRhcmdldCwgZmllbGQsIGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJ01vZGlmaWVyICRtaW4gYWxsb3dlZCBmb3IgbnVtYmVycyBvbmx5Jywge2ZpZWxkfSk7XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkIGluIHRhcmdldCkge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbZmllbGRdICE9PSAnbnVtYmVyJykge1xuICAgICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGFwcGx5ICRtaW4gbW9kaWZpZXIgdG8gbm9uLW51bWJlcicsXG4gICAgICAgICAge2ZpZWxkfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0W2ZpZWxkXSA+IGFyZykge1xuICAgICAgICB0YXJnZXRbZmllbGRdID0gYXJnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRbZmllbGRdID0gYXJnO1xuICAgIH1cbiAgfSxcbiAgJG1heCh0YXJnZXQsIGZpZWxkLCBhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCdNb2RpZmllciAkbWF4IGFsbG93ZWQgZm9yIG51bWJlcnMgb25seScsIHtmaWVsZH0pO1xuICAgIH1cblxuICAgIGlmIChmaWVsZCBpbiB0YXJnZXQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGFyZ2V0W2ZpZWxkXSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBhcHBseSAkbWF4IG1vZGlmaWVyIHRvIG5vbi1udW1iZXInLFxuICAgICAgICAgIHtmaWVsZH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRhcmdldFtmaWVsZF0gPCBhcmcpIHtcbiAgICAgICAgdGFyZ2V0W2ZpZWxkXSA9IGFyZztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W2ZpZWxkXSA9IGFyZztcbiAgICB9XG4gIH0sXG4gICRtdWwodGFyZ2V0LCBmaWVsZCwgYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignTW9kaWZpZXIgJG11bCBhbGxvd2VkIGZvciBudW1iZXJzIG9ubHknLCB7ZmllbGR9KTtcbiAgICB9XG5cbiAgICBpZiAoZmllbGQgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAodHlwZW9mIHRhcmdldFtmaWVsZF0gIT09ICdudW1iZXInKSB7XG4gICAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAgICdDYW5ub3QgYXBwbHkgJG11bCBtb2RpZmllciB0byBub24tbnVtYmVyJyxcbiAgICAgICAgICB7ZmllbGR9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRhcmdldFtmaWVsZF0gKj0gYXJnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRbZmllbGRdID0gMDtcbiAgICB9XG4gIH0sXG4gICRyZW5hbWUodGFyZ2V0LCBmaWVsZCwgYXJnLCBrZXlwYXRoLCBkb2MpIHtcbiAgICAvLyBubyBpZGVhIHdoeSBtb25nbyBoYXMgdGhpcyByZXN0cmljdGlvbi4uXG4gICAgaWYgKGtleXBhdGggPT09IGFyZykge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJyRyZW5hbWUgc291cmNlIG11c3QgZGlmZmVyIGZyb20gdGFyZ2V0Jywge2ZpZWxkfSk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJyRyZW5hbWUgc291cmNlIGZpZWxkIGludmFsaWQnLCB7ZmllbGR9KTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCckcmVuYW1lIHRhcmdldCBtdXN0IGJlIGEgc3RyaW5nJywge2ZpZWxkfSk7XG4gICAgfVxuXG4gICAgaWYgKGFyZy5pbmNsdWRlcygnXFwwJykpIHtcbiAgICAgIC8vIE51bGwgYnl0ZXMgYXJlIG5vdCBhbGxvd2VkIGluIE1vbmdvIGZpZWxkIG5hbWVzXG4gICAgICAvLyBodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9saW1pdHMvI1Jlc3RyaWN0aW9ucy1vbi1GaWVsZC1OYW1lc1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICdUaGUgXFwndG9cXCcgZmllbGQgZm9yICRyZW5hbWUgY2Fubm90IGNvbnRhaW4gYW4gZW1iZWRkZWQgbnVsbCBieXRlJyxcbiAgICAgICAge2ZpZWxkfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3QgPSB0YXJnZXRbZmllbGRdO1xuXG4gICAgZGVsZXRlIHRhcmdldFtmaWVsZF07XG5cbiAgICBjb25zdCBrZXlwYXJ0cyA9IGFyZy5zcGxpdCgnLicpO1xuICAgIGNvbnN0IHRhcmdldDIgPSBmaW5kTW9kVGFyZ2V0KGRvYywga2V5cGFydHMsIHtmb3JiaWRBcnJheTogdHJ1ZX0pO1xuXG4gICAgaWYgKHRhcmdldDIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCckcmVuYW1lIHRhcmdldCBmaWVsZCBpbnZhbGlkJywge2ZpZWxkfSk7XG4gICAgfVxuXG4gICAgdGFyZ2V0MltrZXlwYXJ0cy5wb3AoKV0gPSBvYmplY3Q7XG4gIH0sXG4gICRzZXQodGFyZ2V0LCBmaWVsZCwgYXJnKSB7XG4gICAgaWYgKHRhcmdldCAhPT0gT2JqZWN0KHRhcmdldCkpIHsgLy8gbm90IGFuIGFycmF5IG9yIGFuIG9iamVjdFxuICAgICAgY29uc3QgZXJyb3IgPSBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBzZXQgcHJvcGVydHkgb24gbm9uLW9iamVjdCBmaWVsZCcsXG4gICAgICAgIHtmaWVsZH1cbiAgICAgICk7XG4gICAgICBlcnJvci5zZXRQcm9wZXJ0eUVycm9yID0gdHJ1ZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gTWluaW1vbmdvRXJyb3IoJ0Nhbm5vdCBzZXQgcHJvcGVydHkgb24gbnVsbCcsIHtmaWVsZH0pO1xuICAgICAgZXJyb3Iuc2V0UHJvcGVydHlFcnJvciA9IHRydWU7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBhc3NlcnRIYXNWYWxpZEZpZWxkTmFtZXMoYXJnKTtcblxuICAgIHRhcmdldFtmaWVsZF0gPSBhcmc7XG4gIH0sXG4gICRzZXRPbkluc2VydCh0YXJnZXQsIGZpZWxkLCBhcmcpIHtcbiAgICAvLyBjb252ZXJ0ZWQgdG8gYCRzZXRgIGluIGBfbW9kaWZ5YFxuICB9LFxuICAkdW5zZXQodGFyZ2V0LCBmaWVsZCwgYXJnKSB7XG4gICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaWYgKGZpZWxkIGluIHRhcmdldCkge1xuICAgICAgICAgIHRhcmdldFtmaWVsZF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGFyZ2V0W2ZpZWxkXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICRwdXNoKHRhcmdldCwgZmllbGQsIGFyZykge1xuICAgIGlmICh0YXJnZXRbZmllbGRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldFtmaWVsZF0gPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoISh0YXJnZXRbZmllbGRdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignQ2Fubm90IGFwcGx5ICRwdXNoIG1vZGlmaWVyIHRvIG5vbi1hcnJheScsIHtmaWVsZH0pO1xuICAgIH1cblxuICAgIGlmICghKGFyZyAmJiBhcmcuJGVhY2gpKSB7XG4gICAgICAvLyBTaW1wbGUgbW9kZTogbm90ICRlYWNoXG4gICAgICBhc3NlcnRIYXNWYWxpZEZpZWxkTmFtZXMoYXJnKTtcblxuICAgICAgdGFyZ2V0W2ZpZWxkXS5wdXNoKGFyZyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGYW5jeSBtb2RlOiAkZWFjaCAoYW5kIG1heWJlICRzbGljZSBhbmQgJHNvcnQgYW5kICRwb3NpdGlvbilcbiAgICBjb25zdCB0b1B1c2ggPSBhcmcuJGVhY2g7XG4gICAgaWYgKCEodG9QdXNoIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignJGVhY2ggbXVzdCBiZSBhbiBhcnJheScsIHtmaWVsZH0pO1xuICAgIH1cblxuICAgIGFzc2VydEhhc1ZhbGlkRmllbGROYW1lcyh0b1B1c2gpO1xuXG4gICAgLy8gUGFyc2UgJHBvc2l0aW9uXG4gICAgbGV0IHBvc2l0aW9uID0gdW5kZWZpbmVkO1xuICAgIGlmICgnJHBvc2l0aW9uJyBpbiBhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnLiRwb3NpdGlvbiAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJyRwb3NpdGlvbiBtdXN0IGJlIGEgbnVtZXJpYyB2YWx1ZScsIHtmaWVsZH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBYWFggc2hvdWxkIGNoZWNrIHRvIG1ha2Ugc3VyZSBpbnRlZ2VyXG4gICAgICBpZiAoYXJnLiRwb3NpdGlvbiA8IDApIHtcbiAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgJyRwb3NpdGlvbiBpbiAkcHVzaCBtdXN0IGJlIHplcm8gb3IgcG9zaXRpdmUnLFxuICAgICAgICAgIHtmaWVsZH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb24gPSBhcmcuJHBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vIFBhcnNlICRzbGljZS5cbiAgICBsZXQgc2xpY2UgPSB1bmRlZmluZWQ7XG4gICAgaWYgKCckc2xpY2UnIGluIGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcuJHNsaWNlICE9PSAnbnVtYmVyJykge1xuICAgICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcignJHNsaWNlIG11c3QgYmUgYSBudW1lcmljIHZhbHVlJywge2ZpZWxkfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCBzaG91bGQgY2hlY2sgdG8gbWFrZSBzdXJlIGludGVnZXJcbiAgICAgIHNsaWNlID0gYXJnLiRzbGljZTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSAkc29ydC5cbiAgICBsZXQgc29ydEZ1bmN0aW9uID0gdW5kZWZpbmVkO1xuICAgIGlmIChhcmcuJHNvcnQpIHtcbiAgICAgIGlmIChzbGljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCckc29ydCByZXF1aXJlcyAkc2xpY2UgdG8gYmUgcHJlc2VudCcsIHtmaWVsZH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBYWFggdGhpcyBhbGxvd3MgdXMgdG8gdXNlIGEgJHNvcnQgd2hvc2UgdmFsdWUgaXMgYW4gYXJyYXksIGJ1dCB0aGF0J3NcbiAgICAgIC8vIGFjdHVhbGx5IGFuIGV4dGVuc2lvbiBvZiB0aGUgTm9kZSBkcml2ZXIsIHNvIGl0IHdvbid0IHdvcmtcbiAgICAgIC8vIHNlcnZlci1zaWRlLiBDb3VsZCBiZSBjb25mdXNpbmchXG4gICAgICAvLyBYWFggaXMgaXQgY29ycmVjdCB0aGF0IHdlIGRvbid0IGRvIGdlby1zdHVmZiBoZXJlP1xuICAgICAgc29ydEZ1bmN0aW9uID0gbmV3IE1pbmltb25nby5Tb3J0ZXIoYXJnLiRzb3J0KS5nZXRDb21wYXJhdG9yKCk7XG5cbiAgICAgIHRvUHVzaC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9mLl90eXBlKGVsZW1lbnQpICE9PSAzKSB7XG4gICAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgICAnJHB1c2ggbGlrZSBtb2RpZmllcnMgdXNpbmcgJHNvcnQgcmVxdWlyZSBhbGwgZWxlbWVudHMgdG8gYmUgJyArXG4gICAgICAgICAgICAnb2JqZWN0cycsXG4gICAgICAgICAgICB7ZmllbGR9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWN0dWFsbHkgcHVzaC5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdG9QdXNoLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIHRhcmdldFtmaWVsZF0ucHVzaChlbGVtZW50KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzcGxpY2VBcmd1bWVudHMgPSBbcG9zaXRpb24sIDBdO1xuXG4gICAgICB0b1B1c2guZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgc3BsaWNlQXJndW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9KTtcblxuICAgICAgdGFyZ2V0W2ZpZWxkXS5zcGxpY2UoLi4uc3BsaWNlQXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBBY3R1YWxseSBzb3J0LlxuICAgIGlmIChzb3J0RnVuY3Rpb24pIHtcbiAgICAgIHRhcmdldFtmaWVsZF0uc29ydChzb3J0RnVuY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIEFjdHVhbGx5IHNsaWNlLlxuICAgIGlmIChzbGljZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoc2xpY2UgPT09IDApIHtcbiAgICAgICAgdGFyZ2V0W2ZpZWxkXSA9IFtdOyAvLyBkaWZmZXJzIGZyb20gQXJyYXkuc2xpY2UhXG4gICAgICB9IGVsc2UgaWYgKHNsaWNlIDwgMCkge1xuICAgICAgICB0YXJnZXRbZmllbGRdID0gdGFyZ2V0W2ZpZWxkXS5zbGljZShzbGljZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXRbZmllbGRdID0gdGFyZ2V0W2ZpZWxkXS5zbGljZSgwLCBzbGljZSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAkcHVzaEFsbCh0YXJnZXQsIGZpZWxkLCBhcmcpIHtcbiAgICBpZiAoISh0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCdNb2RpZmllciAkcHVzaEFsbC9wdWxsQWxsIGFsbG93ZWQgZm9yIGFycmF5cyBvbmx5Jyk7XG4gICAgfVxuXG4gICAgYXNzZXJ0SGFzVmFsaWRGaWVsZE5hbWVzKGFyZyk7XG5cbiAgICBjb25zdCB0b1B1c2ggPSB0YXJnZXRbZmllbGRdO1xuXG4gICAgaWYgKHRvUHVzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YXJnZXRbZmllbGRdID0gYXJnO1xuICAgIH0gZWxzZSBpZiAoISh0b1B1c2ggaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAnQ2Fubm90IGFwcGx5ICRwdXNoQWxsIG1vZGlmaWVyIHRvIG5vbi1hcnJheScsXG4gICAgICAgIHtmaWVsZH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvUHVzaC5wdXNoKC4uLmFyZyk7XG4gICAgfVxuICB9LFxuICAkYWRkVG9TZXQodGFyZ2V0LCBmaWVsZCwgYXJnKSB7XG4gICAgbGV0IGlzRWFjaCA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBhcmcgPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyBjaGVjayBpZiBmaXJzdCBrZXkgaXMgJyRlYWNoJ1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGFyZyk7XG4gICAgICBpZiAoa2V5c1swXSA9PT0gJyRlYWNoJykge1xuICAgICAgICBpc0VhY2ggPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlcyA9IGlzRWFjaCA/IGFyZy4kZWFjaCA6IFthcmddO1xuXG4gICAgYXNzZXJ0SGFzVmFsaWRGaWVsZE5hbWVzKHZhbHVlcyk7XG5cbiAgICBjb25zdCB0b0FkZCA9IHRhcmdldFtmaWVsZF07XG4gICAgaWYgKHRvQWRkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldFtmaWVsZF0gPSB2YWx1ZXM7XG4gICAgfSBlbHNlIGlmICghKHRvQWRkIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBhcHBseSAkYWRkVG9TZXQgbW9kaWZpZXIgdG8gbm9uLWFycmF5JyxcbiAgICAgICAge2ZpZWxkfVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgICBpZiAodG9BZGQuc29tZShlbGVtZW50ID0+IExvY2FsQ29sbGVjdGlvbi5fZi5fZXF1YWwodmFsdWUsIGVsZW1lbnQpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvQWRkLnB1c2godmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAkcG9wKHRhcmdldCwgZmllbGQsIGFyZykge1xuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRvUG9wID0gdGFyZ2V0W2ZpZWxkXTtcblxuICAgIGlmICh0b1BvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEodG9Qb3AgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKCdDYW5ub3QgYXBwbHkgJHBvcCBtb2RpZmllciB0byBub24tYXJyYXknLCB7ZmllbGR9KTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicgJiYgYXJnIDwgMCkge1xuICAgICAgdG9Qb3Auc3BsaWNlKDAsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b1BvcC5wb3AoKTtcbiAgICB9XG4gIH0sXG4gICRwdWxsKHRhcmdldCwgZmllbGQsIGFyZykge1xuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRvUHVsbCA9IHRhcmdldFtmaWVsZF07XG4gICAgaWYgKHRvUHVsbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEodG9QdWxsIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgJ0Nhbm5vdCBhcHBseSAkcHVsbC9wdWxsQWxsIG1vZGlmaWVyIHRvIG5vbi1hcnJheScsXG4gICAgICAgIHtmaWVsZH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IG91dDtcbiAgICBpZiAoYXJnICE9IG51bGwgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgIShhcmcgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIC8vIFhYWCB3b3VsZCBiZSBtdWNoIG5pY2VyIHRvIGNvbXBpbGUgdGhpcyBvbmNlLCByYXRoZXIgdGhhblxuICAgICAgLy8gZm9yIGVhY2ggZG9jdW1lbnQgd2UgbW9kaWZ5Li4gYnV0IHVzdWFsbHkgd2UncmUgbm90XG4gICAgICAvLyBtb2RpZnlpbmcgdGhhdCBtYW55IGRvY3VtZW50cywgc28gd2UnbGwgbGV0IGl0IHNsaWRlIGZvclxuICAgICAgLy8gbm93XG5cbiAgICAgIC8vIFhYWCBNaW5pbW9uZ28uTWF0Y2hlciBpc24ndCB1cCBmb3IgdGhlIGpvYiwgYmVjYXVzZSB3ZSBuZWVkXG4gICAgICAvLyB0byBwZXJtaXQgc3R1ZmYgbGlrZSB7JHB1bGw6IHthOiB7JGd0OiA0fX19Li4gc29tZXRoaW5nXG4gICAgICAvLyBsaWtlIHskZ3Q6IDR9IGlzIG5vdCBub3JtYWxseSBhIGNvbXBsZXRlIHNlbGVjdG9yLlxuICAgICAgLy8gc2FtZSBpc3N1ZSBhcyAkZWxlbU1hdGNoIHBvc3NpYmx5P1xuICAgICAgY29uc3QgbWF0Y2hlciA9IG5ldyBNaW5pbW9uZ28uTWF0Y2hlcihhcmcpO1xuXG4gICAgICBvdXQgPSB0b1B1bGwuZmlsdGVyKGVsZW1lbnQgPT4gIW1hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKGVsZW1lbnQpLnJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHRvUHVsbC5maWx0ZXIoZWxlbWVudCA9PiAhTG9jYWxDb2xsZWN0aW9uLl9mLl9lcXVhbChlbGVtZW50LCBhcmcpKTtcbiAgICB9XG5cbiAgICB0YXJnZXRbZmllbGRdID0gb3V0O1xuICB9LFxuICAkcHVsbEFsbCh0YXJnZXQsIGZpZWxkLCBhcmcpIHtcbiAgICBpZiAoISh0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAnTW9kaWZpZXIgJHB1c2hBbGwvcHVsbEFsbCBhbGxvd2VkIGZvciBhcnJheXMgb25seScsXG4gICAgICAgIHtmaWVsZH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdG9QdWxsID0gdGFyZ2V0W2ZpZWxkXTtcblxuICAgIGlmICh0b1B1bGwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKHRvUHVsbCBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICdDYW5ub3QgYXBwbHkgJHB1bGwvcHVsbEFsbCBtb2RpZmllciB0byBub24tYXJyYXknLFxuICAgICAgICB7ZmllbGR9XG4gICAgICApO1xuICAgIH1cblxuICAgIHRhcmdldFtmaWVsZF0gPSB0b1B1bGwuZmlsdGVyKG9iamVjdCA9PlxuICAgICAgIWFyZy5zb21lKGVsZW1lbnQgPT4gTG9jYWxDb2xsZWN0aW9uLl9mLl9lcXVhbChvYmplY3QsIGVsZW1lbnQpKVxuICAgICk7XG4gIH0sXG4gICRiaXQodGFyZ2V0LCBmaWVsZCwgYXJnKSB7XG4gICAgLy8gWFhYIG1vbmdvIG9ubHkgc3VwcG9ydHMgJGJpdCBvbiBpbnRlZ2VycywgYW5kIHdlIG9ubHkgc3VwcG9ydFxuICAgIC8vIG5hdGl2ZSBqYXZhc2NyaXB0IG51bWJlcnMgKGRvdWJsZXMpIHNvIGZhciwgc28gd2UgY2FuJ3Qgc3VwcG9ydCAkYml0XG4gICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJyRiaXQgaXMgbm90IHN1cHBvcnRlZCcsIHtmaWVsZH0pO1xuICB9LFxuICAkdigpIHtcbiAgICAvLyBBcyBkaXNjdXNzZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzk2MjMsXG4gICAgLy8gdGhlIGAkdmAgb3BlcmF0b3IgaXMgbm90IG5lZWRlZCBieSBNZXRlb3IsIGJ1dCBwcm9ibGVtcyBjYW4gb2NjdXIgaWZcbiAgICAvLyBpdCdzIG5vdCBhdCBsZWFzdCBjYWxsYWJsZSAoYXMgb2YgTW9uZ28gPj0gMy42KS4gSXQncyBkZWZpbmVkIGhlcmUgYXNcbiAgICAvLyBhIG5vLW9wIHRvIHdvcmsgYXJvdW5kIHRoZXNlIHByb2JsZW1zLlxuICB9XG59O1xuXG5jb25zdCBOT19DUkVBVEVfTU9ESUZJRVJTID0ge1xuICAkcG9wOiB0cnVlLFxuICAkcHVsbDogdHJ1ZSxcbiAgJHB1bGxBbGw6IHRydWUsXG4gICRyZW5hbWU6IHRydWUsXG4gICR1bnNldDogdHJ1ZVxufTtcblxuLy8gTWFrZSBzdXJlIGZpZWxkIG5hbWVzIGRvIG5vdCBjb250YWluIE1vbmdvIHJlc3RyaWN0ZWRcbi8vIGNoYXJhY3RlcnMgKCckJywgJ1xcMCcpIG9yIGludmFsaWQgZG90IHVzYWdlIChsZWFkaW5nL3RyYWlsaW5nL2NvbnNlY3V0aXZlICcuJykuXG4vLyBodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9saW1pdHMvI1Jlc3RyaWN0aW9ucy1vbi1GaWVsZC1OYW1lc1xuY29uc3QgaW52YWxpZENoYXJNc2cgPSB7XG4gICQ6ICdzdGFydCB3aXRoIFxcJyRcXCcnLFxuICAnLic6ICdzdGFydCBvciBlbmQgd2l0aCBcXCcuXFwnJyxcbiAgJy4uJzogJ2NvbnRhaW4gY29uc2VjdXRpdmUgZG90cycsXG4gICdcXDAnOiAnY29udGFpbiBudWxsIGJ5dGVzJ1xufTtcblxuLy8gY2hlY2tzIGlmIGFsbCBmaWVsZCBuYW1lcyBpbiBhbiBvYmplY3QgYXJlIHZhbGlkXG5mdW5jdGlvbiBhc3NlcnRIYXNWYWxpZEZpZWxkTmFtZXMoZG9jKSB7XG4gIGlmIChkb2MgJiYgdHlwZW9mIGRvYyA9PT0gJ29iamVjdCcpIHtcbiAgICBKU09OLnN0cmluZ2lmeShkb2MsIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICBhc3NlcnRJc1ZhbGlkRmllbGROYW1lKGtleSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0SXNWYWxpZEZpZWxkTmFtZShrZXkpIHtcbiAgbGV0IG1hdGNoO1xuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgKG1hdGNoID0ga2V5Lm1hdGNoKC9eXFwkfF5cXC58XFwuXFwufFxcLiR8XlxcLiR8XFwwLykpKSB7XG4gICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoYEtleSAke2tleX0gbXVzdCBub3QgJHtpbnZhbGlkQ2hhck1zZ1ttYXRjaFswXV19YCk7XG4gIH1cbn1cblxuLy8gZm9yIGEuYi5jLjIuZC5lLCBrZXlwYXJ0cyBzaG91bGQgYmUgWydhJywgJ2InLCAnYycsICcyJywgJ2QnLCAnZSddLFxuLy8gYW5kIHRoZW4geW91IHdvdWxkIG9wZXJhdGUgb24gdGhlICdlJyBwcm9wZXJ0eSBvZiB0aGUgcmV0dXJuZWRcbi8vIG9iamVjdC5cbi8vXG4vLyBpZiBvcHRpb25zLm5vQ3JlYXRlIGlzIGZhbHNleSwgY3JlYXRlcyBpbnRlcm1lZGlhdGUgbGV2ZWxzIG9mXG4vLyBzdHJ1Y3R1cmUgYXMgbmVjZXNzYXJ5LCBsaWtlIG1rZGlyIC1wIChhbmQgcmFpc2VzIGFuIGV4Y2VwdGlvbiBpZlxuLy8gdGhhdCB3b3VsZCBtZWFuIGdpdmluZyBhIG5vbi1udW1lcmljIHByb3BlcnR5IHRvIGFuIGFycmF5LikgaWZcbi8vIG9wdGlvbnMubm9DcmVhdGUgaXMgdHJ1ZSwgcmV0dXJuIHVuZGVmaW5lZCBpbnN0ZWFkLlxuLy9cbi8vIG1heSBtb2RpZnkgdGhlIGxhc3QgZWxlbWVudCBvZiBrZXlwYXJ0cyB0byBzaWduYWwgdG8gdGhlIGNhbGxlciB0aGF0IGl0IG5lZWRzXG4vLyB0byB1c2UgYSBkaWZmZXJlbnQgdmFsdWUgdG8gaW5kZXggaW50byB0aGUgcmV0dXJuZWQgb2JqZWN0IChmb3IgZXhhbXBsZSxcbi8vIFsnYScsICcwMSddIC0+IFsnYScsIDFdKS5cbi8vXG4vLyBpZiBmb3JiaWRBcnJheSBpcyB0cnVlLCByZXR1cm4gbnVsbCBpZiB0aGUga2V5cGF0aCBnb2VzIHRocm91Z2ggYW4gYXJyYXkuXG4vL1xuLy8gaWYgb3B0aW9ucy5hcnJheUluZGljZXMgaXMgc2V0LCB1c2UgaXRzIGZpcnN0IGVsZW1lbnQgZm9yIHRoZSAoZmlyc3QpICckJyBpblxuLy8gdGhlIHBhdGguXG5mdW5jdGlvbiBmaW5kTW9kVGFyZ2V0KGRvYywga2V5cGFydHMsIG9wdGlvbnMgPSB7fSkge1xuICBsZXQgdXNlZEFycmF5SW5kZXggPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbGFzdCA9IGkgPT09IGtleXBhcnRzLmxlbmd0aCAtIDE7XG4gICAgbGV0IGtleXBhcnQgPSBrZXlwYXJ0c1tpXTtcblxuICAgIGlmICghaXNJbmRleGFibGUoZG9jKSkge1xuICAgICAgaWYgKG9wdGlvbnMubm9DcmVhdGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3IgPSBNaW5pbW9uZ29FcnJvcihcbiAgICAgICAgYGNhbm5vdCB1c2UgdGhlIHBhcnQgJyR7a2V5cGFydH0nIHRvIHRyYXZlcnNlICR7ZG9jfWBcbiAgICAgICk7XG4gICAgICBlcnJvci5zZXRQcm9wZXJ0eUVycm9yID0gdHJ1ZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIGlmIChkb2MgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgaWYgKG9wdGlvbnMuZm9yYmlkQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlwYXJ0ID09PSAnJCcpIHtcbiAgICAgICAgaWYgKHVzZWRBcnJheUluZGV4KSB7XG4gICAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoJ1RvbyBtYW55IHBvc2l0aW9uYWwgKGkuZS4gXFwnJFxcJykgZWxlbWVudHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb3B0aW9ucy5hcnJheUluZGljZXMgfHwgIW9wdGlvbnMuYXJyYXlJbmRpY2VzLmxlbmd0aCkge1xuICAgICAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAgICAgJ1RoZSBwb3NpdGlvbmFsIG9wZXJhdG9yIGRpZCBub3QgZmluZCB0aGUgbWF0Y2ggbmVlZGVkIGZyb20gdGhlICcgK1xuICAgICAgICAgICAgJ3F1ZXJ5J1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXlwYXJ0ID0gb3B0aW9ucy5hcnJheUluZGljZXNbMF07XG4gICAgICAgIHVzZWRBcnJheUluZGV4ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljS2V5KGtleXBhcnQpKSB7XG4gICAgICAgIGtleXBhcnQgPSBwYXJzZUludChrZXlwYXJ0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcHRpb25zLm5vQ3JlYXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IE1pbmltb25nb0Vycm9yKFxuICAgICAgICAgIGBjYW4ndCBhcHBlbmQgdG8gYXJyYXkgdXNpbmcgc3RyaW5nIGZpZWxkIG5hbWUgWyR7a2V5cGFydH1dYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdCkge1xuICAgICAgICBrZXlwYXJ0c1tpXSA9IGtleXBhcnQ7IC8vIGhhbmRsZSAnYS4wMSdcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMubm9DcmVhdGUgJiYga2V5cGFydCA+PSBkb2MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChkb2MubGVuZ3RoIDwga2V5cGFydCkge1xuICAgICAgICBkb2MucHVzaChudWxsKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFsYXN0KSB7XG4gICAgICAgIGlmIChkb2MubGVuZ3RoID09PSBrZXlwYXJ0KSB7XG4gICAgICAgICAgZG9jLnB1c2goe30pO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2Nba2V5cGFydF0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhyb3cgTWluaW1vbmdvRXJyb3IoXG4gICAgICAgICAgICBgY2FuJ3QgbW9kaWZ5IGZpZWxkICcke2tleXBhcnRzW2kgKyAxXX0nIG9mIGxpc3QgdmFsdWUgYCArXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShkb2Nba2V5cGFydF0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhc3NlcnRJc1ZhbGlkRmllbGROYW1lKGtleXBhcnQpO1xuXG4gICAgICBpZiAoIShrZXlwYXJ0IGluIGRvYykpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMubm9DcmVhdGUpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsYXN0KSB7XG4gICAgICAgICAgZG9jW2tleXBhcnRdID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobGFzdCkge1xuICAgICAgcmV0dXJuIGRvYztcbiAgICB9XG5cbiAgICBkb2MgPSBkb2Nba2V5cGFydF07XG4gIH1cblxuICAvLyBub3RyZWFjaGVkXG59XG4iLCJpbXBvcnQgTG9jYWxDb2xsZWN0aW9uIGZyb20gJy4vbG9jYWxfY29sbGVjdGlvbi5qcyc7XG5pbXBvcnQge1xuICBjb21waWxlRG9jdW1lbnRTZWxlY3RvcixcbiAgaGFzT3duLFxuICBub3RoaW5nTWF0Y2hlcixcbn0gZnJvbSAnLi9jb21tb24uanMnO1xuXG5jb25zdCBEZWNpbWFsID0gUGFja2FnZVsnbW9uZ28tZGVjaW1hbCddPy5EZWNpbWFsIHx8IGNsYXNzIERlY2ltYWxTdHViIHt9XG5cbi8vIFRoZSBtaW5pbW9uZ28gc2VsZWN0b3IgY29tcGlsZXIhXG5cbi8vIFRlcm1pbm9sb2d5OlxuLy8gIC0gYSAnc2VsZWN0b3InIGlzIHRoZSBFSlNPTiBvYmplY3QgcmVwcmVzZW50aW5nIGEgc2VsZWN0b3Jcbi8vICAtIGEgJ21hdGNoZXInIGlzIGl0cyBjb21waWxlZCBmb3JtICh3aGV0aGVyIGEgZnVsbCBNaW5pbW9uZ28uTWF0Y2hlclxuLy8gICAgb2JqZWN0IG9yIG9uZSBvZiB0aGUgY29tcG9uZW50IGxhbWJkYXMgdGhhdCBtYXRjaGVzIHBhcnRzIG9mIGl0KVxuLy8gIC0gYSAncmVzdWx0IG9iamVjdCcgaXMgYW4gb2JqZWN0IHdpdGggYSAncmVzdWx0JyBmaWVsZCBhbmQgbWF5YmVcbi8vICAgIGRpc3RhbmNlIGFuZCBhcnJheUluZGljZXMuXG4vLyAgLSBhICdicmFuY2hlZCB2YWx1ZScgaXMgYW4gb2JqZWN0IHdpdGggYSAndmFsdWUnIGZpZWxkIGFuZCBtYXliZVxuLy8gICAgJ2RvbnRJdGVyYXRlJyBhbmQgJ2FycmF5SW5kaWNlcycuXG4vLyAgLSBhICdkb2N1bWVudCcgaXMgYSB0b3AtbGV2ZWwgb2JqZWN0IHRoYXQgY2FuIGJlIHN0b3JlZCBpbiBhIGNvbGxlY3Rpb24uXG4vLyAgLSBhICdsb29rdXAgZnVuY3Rpb24nIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiBhIGRvY3VtZW50IGFuZCByZXR1cm5zXG4vLyAgICBhbiBhcnJheSBvZiAnYnJhbmNoZWQgdmFsdWVzJy5cbi8vICAtIGEgJ2JyYW5jaGVkIG1hdGNoZXInIG1hcHMgZnJvbSBhbiBhcnJheSBvZiBicmFuY2hlZCB2YWx1ZXMgdG8gYSByZXN1bHRcbi8vICAgIG9iamVjdC5cbi8vICAtIGFuICdlbGVtZW50IG1hdGNoZXInIG1hcHMgZnJvbSBhIHNpbmdsZSB2YWx1ZSB0byBhIGJvb2wuXG5cbi8vIE1haW4gZW50cnkgcG9pbnQuXG4vLyAgIHZhciBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHthOiB7JGd0OiA1fX0pO1xuLy8gICBpZiAobWF0Y2hlci5kb2N1bWVudE1hdGNoZXMoe2E6IDd9KSkgLi4uXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRjaGVyIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3IsIGlzVXBkYXRlLCBjb2xsYXRpb24pIHtcbiAgICAvLyBBIHNldCAob2JqZWN0IG1hcHBpbmcgc3RyaW5nIC0+ICopIG9mIGFsbCBvZiB0aGUgZG9jdW1lbnQgcGF0aHMgbG9va2VkXG4gICAgLy8gYXQgYnkgdGhlIHNlbGVjdG9yLiBBbHNvIGluY2x1ZGVzIHRoZSBlbXB0eSBzdHJpbmcgaWYgaXQgbWF5IGxvb2sgYXQgYW55XG4gICAgLy8gcGF0aCAoZWcsICR3aGVyZSkuXG4gICAgdGhpcy5fcGF0aHMgPSB7fTtcbiAgICAvLyBTZXQgdG8gdHJ1ZSBpZiBjb21waWxhdGlvbiBmaW5kcyBhICRuZWFyLlxuICAgIHRoaXMuX2hhc0dlb1F1ZXJ5ID0gZmFsc2U7XG4gICAgLy8gU2V0IHRvIHRydWUgaWYgY29tcGlsYXRpb24gZmluZHMgYSAkd2hlcmUuXG4gICAgdGhpcy5faGFzV2hlcmUgPSBmYWxzZTtcbiAgICAvLyBTZXQgdG8gZmFsc2UgaWYgY29tcGlsYXRpb24gZmluZHMgYW55dGhpbmcgb3RoZXIgdGhhbiBhIHNpbXBsZSBlcXVhbGl0eVxuICAgIC8vIG9yIG9uZSBvciBtb3JlIG9mICckZ3QnLCAnJGd0ZScsICckbHQnLCAnJGx0ZScsICckbmUnLCAnJGluJywgJyRuaW4nIHVzZWRcbiAgICAvLyB3aXRoIHNjYWxhcnMgYXMgb3BlcmFuZHMuXG4gICAgdGhpcy5faXNTaW1wbGUgPSB0cnVlO1xuICAgIC8vIFNldCB0byBhIGR1bW15IGRvY3VtZW50IHdoaWNoIGFsd2F5cyBtYXRjaGVzIHRoaXMgTWF0Y2hlci4gT3Igc2V0IHRvIG51bGxcbiAgICAvLyBpZiBzdWNoIGRvY3VtZW50IGlzIHRvbyBoYXJkIHRvIGZpbmQuXG4gICAgdGhpcy5fbWF0Y2hpbmdEb2N1bWVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyBBIGNsb25lIG9mIHRoZSBvcmlnaW5hbCBzZWxlY3Rvci4gSXQgbWF5IGp1c3QgYmUgYSBmdW5jdGlvbiBpZiB0aGUgdXNlclxuICAgIC8vIHBhc3NlZCBpbiBhIGZ1bmN0aW9uOyBvdGhlcndpc2UgaXMgZGVmaW5pdGVseSBhbiBvYmplY3QgKGVnLCBJRHMgYXJlXG4gICAgLy8gdHJhbnNsYXRlZCBpbnRvIHtfaWQ6IElEfSBmaXJzdC4gVXNlZCBieSBjYW5CZWNvbWVUcnVlQnlNb2RpZmllciBhbmRcbiAgICAvLyBTb3J0ZXIuX3VzZVdpdGhNYXRjaGVyLlxuICAgIHRoaXMuX3NlbGVjdG9yID0gbnVsbDtcbiAgICAvLyBBbiBvcHRpb25hbCBJbnRsLkNvbGxhdG9yIGZvciBsb2NhbGUtYXdhcmUgc3RyaW5nIGNvbXBhcmlzb24gKG1pcnJvcnNcbiAgICAvLyBNb25nb0RCJ3MgY29sbGF0aW9uIG9wdGlvbikuXG4gICAgdGhpcy5fY29sbGF0b3IgPSBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZUNvbGxhdG9yKGNvbGxhdGlvbik7XG4gICAgdGhpcy5fZG9jTWF0Y2hlciA9IHRoaXMuX2NvbXBpbGVTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgLy8gU2V0IHRvIHRydWUgaWYgc2VsZWN0aW9uIGlzIGRvbmUgZm9yIGFuIHVwZGF0ZSBvcGVyYXRpb25cbiAgICAvLyBEZWZhdWx0IGlzIGZhbHNlXG4gICAgLy8gVXNlZCBmb3IgJG5lYXIgYXJyYXkgdXBkYXRlIChpc3N1ZSAjMzU5OSlcbiAgICB0aGlzLl9pc1VwZGF0ZSA9IGlzVXBkYXRlO1xuICB9XG5cbiAgZG9jdW1lbnRNYXRjaGVzKGRvYykge1xuICAgIGlmIChkb2MgIT09IE9iamVjdChkb2MpKSB7XG4gICAgICB0aHJvdyBFcnJvcignZG9jdW1lbnRNYXRjaGVzIG5lZWRzIGEgZG9jdW1lbnQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZG9jTWF0Y2hlcihkb2MpO1xuICB9XG5cbiAgaGFzR2VvUXVlcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc0dlb1F1ZXJ5O1xuICB9XG5cbiAgaGFzV2hlcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1doZXJlO1xuICB9XG5cbiAgaXNTaW1wbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzU2ltcGxlO1xuICB9XG5cbiAgLy8gR2l2ZW4gYSBzZWxlY3RvciwgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBvbmUgYXJndW1lbnQsIGFcbiAgLy8gZG9jdW1lbnQuIEl0IHJldHVybnMgYSByZXN1bHQgb2JqZWN0LlxuICBfY29tcGlsZVNlbGVjdG9yKHNlbGVjdG9yKSB7XG4gICAgLy8geW91IGNhbiBwYXNzIGEgbGl0ZXJhbCBmdW5jdGlvbiBpbnN0ZWFkIG9mIGEgc2VsZWN0b3JcbiAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgdGhpcy5faXNTaW1wbGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICB0aGlzLl9yZWNvcmRQYXRoVXNlZCgnJyk7XG5cbiAgICAgIHJldHVybiBkb2MgPT4gKHtyZXN1bHQ6ICEhc2VsZWN0b3IuY2FsbChkb2MpfSk7XG4gICAgfVxuXG4gICAgLy8gc2hvcnRoYW5kIC0tIHNjYWxhciBfaWRcbiAgICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9zZWxlY3RvcklzSWQoc2VsZWN0b3IpKSB7XG4gICAgICB0aGlzLl9zZWxlY3RvciA9IHtfaWQ6IHNlbGVjdG9yfTtcbiAgICAgIHRoaXMuX3JlY29yZFBhdGhVc2VkKCdfaWQnKTtcblxuICAgICAgaWYgKHRoaXMuX2NvbGxhdG9yKSB7XG4gICAgICAgIC8vIFdoZW4gYSBjb2xsYXRvciBpcyBhY3RpdmUsIGNvbXBpbGUge19pZDogc2VsZWN0b3J9IGFzIGEgcmVndWxhclxuICAgICAgICAvLyBkb2N1bWVudCBzZWxlY3RvciBzbyBzdHJpbmcgY29tcGFyaXNvbiB1c2VzIHRoZSBjb2xsYXRvci5cbiAgICAgICAgcmV0dXJuIGNvbXBpbGVEb2N1bWVudFNlbGVjdG9yKHRoaXMuX3NlbGVjdG9yLCB0aGlzLCB7aXNSb290OiB0cnVlfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkb2MgPT4gKHtyZXN1bHQ6IEVKU09OLmVxdWFscyhkb2MuX2lkLCBzZWxlY3Rvcil9KTtcbiAgICB9XG5cbiAgICAvLyBwcm90ZWN0IGFnYWluc3QgZGFuZ2Vyb3VzIHNlbGVjdG9ycy4gIGZhbHNleSBhbmQge19pZDogZmFsc2V5fSBhcmUgYm90aFxuICAgIC8vIGxpa2VseSBwcm9ncmFtbWVyIGVycm9yLCBhbmQgbm90IHdoYXQgeW91IHdhbnQsIHBhcnRpY3VsYXJseSBmb3JcbiAgICAvLyBkZXN0cnVjdGl2ZSBvcGVyYXRpb25zLlxuICAgIGlmICghc2VsZWN0b3IgfHwgaGFzT3duLmNhbGwoc2VsZWN0b3IsICdfaWQnKSAmJiAhc2VsZWN0b3IuX2lkKSB7XG4gICAgICB0aGlzLl9pc1NpbXBsZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIG5vdGhpbmdNYXRjaGVyO1xuICAgIH1cblxuICAgIC8vIFRvcCBsZXZlbCBjYW4ndCBiZSBhbiBhcnJheSBvciB0cnVlIG9yIGJpbmFyeS5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikgfHxcbiAgICAgICAgRUpTT04uaXNCaW5hcnkoc2VsZWN0b3IpIHx8XG4gICAgICAgIHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VsZWN0b3I6ICR7c2VsZWN0b3J9YCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VsZWN0b3IgPSBFSlNPTi5jbG9uZShzZWxlY3Rvcik7XG5cbiAgICByZXR1cm4gY29tcGlsZURvY3VtZW50U2VsZWN0b3Ioc2VsZWN0b3IsIHRoaXMsIHtpc1Jvb3Q6IHRydWV9KTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBsaXN0IG9mIGtleSBwYXRocyB0aGUgZ2l2ZW4gc2VsZWN0b3IgaXMgbG9va2luZyBmb3IuIEl0IGluY2x1ZGVzXG4gIC8vIHRoZSBlbXB0eSBzdHJpbmcgaWYgdGhlcmUgaXMgYSAkd2hlcmUuXG4gIF9nZXRQYXRocygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fcGF0aHMpO1xuICB9XG5cbiAgX3JlY29yZFBhdGhVc2VkKHBhdGgpIHtcbiAgICB0aGlzLl9wYXRoc1twYXRoXSA9IHRydWU7XG4gIH1cbn1cblxuLy8gaGVscGVycyB1c2VkIGJ5IGNvbXBpbGVkIHNlbGVjdG9yIGNvZGVcbkxvY2FsQ29sbGVjdGlvbi5fZiA9IHtcbiAgLy8gWFhYIGZvciBfYWxsIGFuZCBfaW4sIGNvbnNpZGVyIGJ1aWxkaW5nICdpbnF1ZXJ5JyBhdCBjb21waWxlIHRpbWUuLlxuICBfdHlwZSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIDI7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiA4O1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICByZXR1cm4gNDtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIDEwO1xuICAgIH1cblxuICAgIC8vIG5vdGUgdGhhdCB0eXBlb2YoL3gvKSA9PT0gXCJvYmplY3RcIlxuICAgIGlmICh2IGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICByZXR1cm4gMTE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTM7XG4gICAgfVxuXG4gICAgaWYgKHYgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICByZXR1cm4gOTtcbiAgICB9XG5cbiAgICBpZiAoRUpTT04uaXNCaW5hcnkodikpIHtcbiAgICAgIHJldHVybiA1O1xuICAgIH1cblxuICAgIGlmICh2IGluc3RhbmNlb2YgTW9uZ29JRC5PYmplY3RJRCkge1xuICAgICAgcmV0dXJuIDc7XG4gICAgfVxuXG4gICAgaWYgKHYgaW5zdGFuY2VvZiBEZWNpbWFsKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICAvLyBvYmplY3RcbiAgICByZXR1cm4gMztcblxuICAgIC8vIFhYWCBzdXBwb3J0IHNvbWUvYWxsIG9mIHRoZXNlOlxuICAgIC8vIDE0LCBzeW1ib2xcbiAgICAvLyAxNSwgamF2YXNjcmlwdCBjb2RlIHdpdGggc2NvcGVcbiAgICAvLyAxNiwgMTg6IDMyLWJpdC82NC1iaXQgaW50ZWdlclxuICAgIC8vIDE3LCB0aW1lc3RhbXBcbiAgICAvLyAyNTUsIG1pbmtleVxuICAgIC8vIDEyNywgbWF4a2V5XG4gIH0sXG5cbiAgLy8gZGVlcCBlcXVhbGl0eSB0ZXN0OiB1c2UgZm9yIGxpdGVyYWwgZG9jdW1lbnQgYW5kIGFycmF5IG1hdGNoZXNcbiAgLy8gV2hlbiBhIGNvbGxhdG9yIChJbnRsLkNvbGxhdG9yKSBpcyBwcm92aWRlZCwgc3RyaW5nIGVxdWFsaXR5IHVzZXNcbiAgLy8gbG9jYWxlLWF3YXJlIGNvbXBhcmlzb24gaW5zdGVhZCBvZiBzdHJpY3QgPT09LlxuICBfZXF1YWwoYSwgYiwgY29sbGF0b3IpIHtcbiAgICBpZiAoY29sbGF0b3IgJiYgdHlwZW9mIGEgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBiID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGNvbGxhdG9yLmNvbXBhcmUoYSwgYikgPT09IDA7XG4gICAgfVxuICAgIHJldHVybiBFSlNPTi5lcXVhbHMoYSwgYiwge2tleU9yZGVyU2Vuc2l0aXZlOiB0cnVlfSk7XG4gIH0sXG5cbiAgLy8gbWFwcyBhIHR5cGUgY29kZSB0byBhIHZhbHVlIHRoYXQgY2FuIGJlIHVzZWQgdG8gc29ydCB2YWx1ZXMgb2YgZGlmZmVyZW50XG4gIC8vIHR5cGVzXG4gIF90eXBlb3JkZXIodCkge1xuICAgIC8vIGh0dHA6Ly93d3cubW9uZ29kYi5vcmcvZGlzcGxheS9ET0NTL1doYXQraXMrdGhlK0NvbXBhcmUrT3JkZXIrZm9yK0JTT04rVHlwZXNcbiAgICAvLyBYWFggd2hhdCBpcyB0aGUgY29ycmVjdCBzb3J0IHBvc2l0aW9uIGZvciBKYXZhc2NyaXB0IGNvZGU/XG4gICAgLy8gKCcxMDAnIGluIHRoZSBtYXRyaXggYmVsb3cpXG4gICAgLy8gWFhYIG1pbmtleS9tYXhrZXlcbiAgICByZXR1cm4gW1xuICAgICAgLTEsICAvLyAobm90IGEgdHlwZSlcbiAgICAgIDEsICAgLy8gbnVtYmVyXG4gICAgICAyLCAgIC8vIHN0cmluZ1xuICAgICAgMywgICAvLyBvYmplY3RcbiAgICAgIDQsICAgLy8gYXJyYXlcbiAgICAgIDUsICAgLy8gYmluYXJ5XG4gICAgICAtMSwgIC8vIGRlcHJlY2F0ZWRcbiAgICAgIDYsICAgLy8gT2JqZWN0SURcbiAgICAgIDcsICAgLy8gYm9vbFxuICAgICAgOCwgICAvLyBEYXRlXG4gICAgICAwLCAgIC8vIG51bGxcbiAgICAgIDksICAgLy8gUmVnRXhwXG4gICAgICAtMSwgIC8vIGRlcHJlY2F0ZWRcbiAgICAgIDEwMCwgLy8gSlMgY29kZVxuICAgICAgMiwgICAvLyBkZXByZWNhdGVkIChzeW1ib2wpXG4gICAgICAxMDAsIC8vIEpTIGNvZGVcbiAgICAgIDEsICAgLy8gMzItYml0IGludFxuICAgICAgOCwgICAvLyBNb25nbyB0aW1lc3RhbXBcbiAgICAgIDEgICAgLy8gNjQtYml0IGludFxuICAgIF1bdF07XG4gIH0sXG5cbiAgLy8gY29tcGFyZSB0d28gdmFsdWVzIG9mIHVua25vd24gdHlwZSBhY2NvcmRpbmcgdG8gQlNPTiBvcmRlcmluZ1xuICAvLyBzZW1hbnRpY3MuIChhcyBhbiBleHRlbnNpb24sIGNvbnNpZGVyICd1bmRlZmluZWQnIHRvIGJlIGxlc3MgdGhhblxuICAvLyBhbnkgb3RoZXIgdmFsdWUuKSByZXR1cm4gbmVnYXRpdmUgaWYgYSBpcyBsZXNzLCBwb3NpdGl2ZSBpZiBiIGlzXG4gIC8vIGxlc3MsIG9yIDAgaWYgZXF1YWxcbiAgLy8gV2hlbiBhIGNvbGxhdG9yIChJbnRsLkNvbGxhdG9yKSBpcyBwcm92aWRlZCwgc3RyaW5nIGNvbXBhcmlzb24gdXNlc1xuICAvLyBsb2NhbGUtYXdhcmUgb3JkZXJpbmcgaW5zdGVhZCBvZiBsZXhpY29ncmFwaGljIDwuXG4gIF9jbXAoYSwgYiwgY29sbGF0b3IpIHtcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYiA9PT0gdW5kZWZpbmVkID8gMCA6IC0xO1xuICAgIH1cblxuICAgIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIGxldCB0YSA9IExvY2FsQ29sbGVjdGlvbi5fZi5fdHlwZShhKTtcbiAgICBsZXQgdGIgPSBMb2NhbENvbGxlY3Rpb24uX2YuX3R5cGUoYik7XG5cbiAgICBjb25zdCBvYSA9IExvY2FsQ29sbGVjdGlvbi5fZi5fdHlwZW9yZGVyKHRhKTtcbiAgICBjb25zdCBvYiA9IExvY2FsQ29sbGVjdGlvbi5fZi5fdHlwZW9yZGVyKHRiKTtcblxuICAgIGlmIChvYSAhPT0gb2IpIHtcbiAgICAgIHJldHVybiBvYSA8IG9iID8gLTEgOiAxO1xuICAgIH1cblxuICAgIC8vIFhYWCBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGlmIHdlIGltcGxlbWVudCBTeW1ib2wgb3IgaW50ZWdlcnMsIG9yXG4gICAgLy8gVGltZXN0YW1wXG4gICAgaWYgKHRhICE9PSB0Yikge1xuICAgICAgdGhyb3cgRXJyb3IoJ01pc3NpbmcgdHlwZSBjb2VyY2lvbiBsb2dpYyBpbiBfY21wJyk7XG4gICAgfVxuXG4gICAgaWYgKHRhID09PSA3KSB7IC8vIE9iamVjdElEXG4gICAgICAvLyBDb252ZXJ0IHRvIHN0cmluZy5cbiAgICAgIHRhID0gdGIgPSAyO1xuICAgICAgYSA9IGEudG9IZXhTdHJpbmcoKTtcbiAgICAgIGIgPSBiLnRvSGV4U3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRhID09PSA5KSB7IC8vIERhdGVcbiAgICAgIC8vIENvbnZlcnQgdG8gbWlsbGlzLlxuICAgICAgdGEgPSB0YiA9IDE7XG4gICAgICBhID0gaXNOYU4oYSkgPyAwIDogYS5nZXRUaW1lKCk7XG4gICAgICBiID0gaXNOYU4oYikgPyAwIDogYi5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgaWYgKHRhID09PSAxKSB7IC8vIGRvdWJsZVxuICAgICAgaWYgKGEgaW5zdGFuY2VvZiBEZWNpbWFsKSB7XG4gICAgICAgIHJldHVybiBhLm1pbnVzKGIpLnRvTnVtYmVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRiID09PSAyKSB7IC8vIHN0cmluZ1xuICAgICAgaWYgKGNvbGxhdG9yKSB7XG4gICAgICAgIHJldHVybiBjb2xsYXRvci5jb21wYXJlKGEsIGIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID09PSBiID8gMCA6IDE7XG4gICAgfVxuXG4gICAgaWYgKHRhID09PSAzKSB7IC8vIE9iamVjdFxuICAgICAgLy8gdGhpcyBjb3VsZCBiZSBtdWNoIG1vcmUgZWZmaWNpZW50IGluIHRoZSBleHBlY3RlZCBjYXNlIC4uLlxuICAgICAgY29uc3QgdG9BcnJheSA9IG9iamVjdCA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSwgb2JqZWN0W2tleV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIExvY2FsQ29sbGVjdGlvbi5fZi5fY21wKHRvQXJyYXkoYSksIHRvQXJyYXkoYiksIGNvbGxhdG9yKTtcbiAgICB9XG5cbiAgICBpZiAodGEgPT09IDQpIHsgLy8gQXJyYXlcbiAgICAgIGZvciAobGV0IGkgPSAwOyA7IGkrKykge1xuICAgICAgICBpZiAoaSA9PT0gYS5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gaSA9PT0gYi5sZW5ndGggPyAwIDogLTE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaSA9PT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHMgPSBMb2NhbENvbGxlY3Rpb24uX2YuX2NtcChhW2ldLCBiW2ldLCBjb2xsYXRvcik7XG4gICAgICAgIGlmIChzICE9PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGEgPT09IDUpIHsgLy8gYmluYXJ5XG4gICAgICAvLyBTdXJwcmlzaW5nbHksIGEgc21hbGwgYmluYXJ5IGJsb2IgaXMgYWx3YXlzIGxlc3MgdGhhbiBhIGxhcmdlIG9uZSBpblxuICAgICAgLy8gTW9uZ28uXG4gICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFbaV0gPCBiW2ldKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFbaV0gPiBiW2ldKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKHRhID09PSA4KSB7IC8vIGJvb2xlYW5cbiAgICAgIGlmIChhKSB7XG4gICAgICAgIHJldHVybiBiID8gMCA6IDE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBiID8gLTEgOiAwO1xuICAgIH1cblxuICAgIGlmICh0YSA9PT0gMTApIC8vIG51bGxcbiAgICAgIHJldHVybiAwO1xuXG4gICAgaWYgKHRhID09PSAxMSkgLy8gcmVnZXhwXG4gICAgICB0aHJvdyBFcnJvcignU29ydGluZyBub3Qgc3VwcG9ydGVkIG9uIHJlZ3VsYXIgZXhwcmVzc2lvbicpOyAvLyBYWFhcblxuICAgIC8vIDEzOiBqYXZhc2NyaXB0IGNvZGVcbiAgICAvLyAxNDogc3ltYm9sXG4gICAgLy8gMTU6IGphdmFzY3JpcHQgY29kZSB3aXRoIHNjb3BlXG4gICAgLy8gMTY6IDMyLWJpdCBpbnRlZ2VyXG4gICAgLy8gMTc6IHRpbWVzdGFtcFxuICAgIC8vIDE4OiA2NC1iaXQgaW50ZWdlclxuICAgIC8vIDI1NTogbWlua2V5XG4gICAgLy8gMTI3OiBtYXhrZXlcbiAgICBpZiAodGEgPT09IDEzKSAvLyBqYXZhc2NyaXB0IGNvZGVcbiAgICAgIHRocm93IEVycm9yKCdTb3J0aW5nIG5vdCBzdXBwb3J0ZWQgb24gSmF2YXNjcmlwdCBjb2RlJyk7IC8vIFhYWFxuXG4gICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gdHlwZSB0byBzb3J0Jyk7XG4gIH0sXG59O1xuXG4vLyBDcmVhdGVzIGFuIEludGwuQ29sbGF0b3IgZnJvbSBhIE1vbmdvREItc3R5bGUgY29sbGF0aW9uIHNwZWMuXG4vLyBNb25nb0RCIGNvbGxhdGlvbiBvcHRpb25zIG1hcCB0byBJbnRsLkNvbGxhdG9yIG9wdGlvbnMgYXMgZm9sbG93czpcbi8vICAgc3RyZW5ndGggMSAocHJpbWFyeSkgICDihpIgc2Vuc2l0aXZpdHkgJ2Jhc2UnICAgKGEgPSBBID0gw6EgPSDDgSlcbi8vICAgc3RyZW5ndGggMiAoc2Vjb25kYXJ5KSDihpIgc2Vuc2l0aXZpdHkgJ2FjY2VudCcgIChhID0gQSwgw6Eg4omgIGEpXG4vLyAgIHN0cmVuZ3RoIDMgKHRlcnRpYXJ5KSAg4oaSIHNlbnNpdGl2aXR5ICd2YXJpYW50JyAoYSDiiaAgQSwgw6Eg4omgIGEpXG4vLyAgIGNhc2VMZXZlbCB0cnVlIGF0IHN0cmVuZ3RoIDEg4oaSIHNlbnNpdGl2aXR5ICdjYXNlJyAoYSDiiaAgQSwgw6EgPSBhKVxuLy8gICBudW1lcmljT3JkZXJpbmcgICAgICAgIOKGkiBudW1lcmljXG4vLyAgIGNhc2VGaXJzdCAgICAgICAgICAgICAg4oaSIGNhc2VGaXJzdCAoJ3VwcGVyJ3wnbG93ZXInfCdmYWxzZScpXG5jb25zdCBTVFJFTkdUSF9UT19TRU5TSVRJVklUWSA9IHsgMTogJ2Jhc2UnLCAyOiAnYWNjZW50JyB9O1xuXG5Mb2NhbENvbGxlY3Rpb24uX2NyZWF0ZUNvbGxhdG9yID0gZnVuY3Rpb24gKGNvbGxhdGlvbikge1xuICBpZiAoIWNvbGxhdGlvbikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChjb2xsYXRpb24gaW5zdGFuY2VvZiBJbnRsLkNvbGxhdG9yKSB7XG4gICAgcmV0dXJuIGNvbGxhdGlvbjtcbiAgfVxuICBpZiAoTWV0ZW9yLmlzRGV2ZWxvcG1lbnQpIHtcbiAgICBpZiAodHlwZW9mIGNvbGxhdGlvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IEVycm9yKCdjb2xsYXRpb24gbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2xsYXRpb24ubG9jYWxlICE9PSAnc3RyaW5nJyB8fCAhY29sbGF0aW9uLmxvY2FsZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ2NvbGxhdGlvbi5sb2NhbGUgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKGNvbGxhdGlvbi5zdHJlbmd0aCAhPSBudWxsICYmXG4gICAgICAgICh0eXBlb2YgY29sbGF0aW9uLnN0cmVuZ3RoICE9PSAnbnVtYmVyJyB8fCBjb2xsYXRpb24uc3RyZW5ndGggPCAxIHx8IGNvbGxhdGlvbi5zdHJlbmd0aCA+IDUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignY29sbGF0aW9uLnN0cmVuZ3RoIG11c3QgYmUgYW4gaW50ZWdlciBiZXR3ZWVuIDEgYW5kIDUnKTtcbiAgICB9XG4gICAgaWYgKGNvbGxhdGlvbi5zdHJlbmd0aCAhPSBudWxsICYmIGNvbGxhdGlvbi5zdHJlbmd0aCA+IDMpIHtcbiAgICAgIE1ldGVvci5fZGVidWcoXG4gICAgICAgICdjb2xsYXRpb24uc3RyZW5ndGggdmFsdWVzIDQgYW5kIDUgaGF2ZSBubyBJbnRsLkNvbGxhdG9yIGVxdWl2YWxlbnQgJyArXG4gICAgICAgICdhbmQgYXJlIG9ubHkgc3VwcG9ydGVkIHNlcnZlci1zaWRlIHZpYSB0aGUgTW9uZ29EQiBkcml2ZXInXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9wdGlvbnMgPSB7fTtcbiAgaWYgKGNvbGxhdGlvbi5zdHJlbmd0aCAhPSBudWxsKSB7XG4gICAgaWYgKGNvbGxhdGlvbi5zdHJlbmd0aCA9PT0gMSAmJiBjb2xsYXRpb24uY2FzZUxldmVsKSB7XG4gICAgICBvcHRpb25zLnNlbnNpdGl2aXR5ID0gJ2Nhc2UnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLnNlbnNpdGl2aXR5ID0gU1RSRU5HVEhfVE9fU0VOU0lUSVZJVFlbY29sbGF0aW9uLnN0cmVuZ3RoXSB8fCAndmFyaWFudCc7XG4gICAgfVxuICB9XG4gIGlmIChjb2xsYXRpb24ubnVtZXJpY09yZGVyaW5nICE9IG51bGwpIHtcbiAgICBvcHRpb25zLm51bWVyaWMgPSBjb2xsYXRpb24ubnVtZXJpY09yZGVyaW5nO1xuICB9XG4gIGlmIChjb2xsYXRpb24uY2FzZUZpcnN0ICE9IG51bGwgJiYgY29sbGF0aW9uLmNhc2VGaXJzdCAhPT0gJ29mZicpIHtcbiAgICBvcHRpb25zLmNhc2VGaXJzdCA9IGNvbGxhdGlvbi5jYXNlRmlyc3Q7XG4gIH1cbiAgcmV0dXJuIG5ldyBJbnRsLkNvbGxhdG9yKGNvbGxhdGlvbi5sb2NhbGUsIG9wdGlvbnMpO1xufTtcbiIsImltcG9ydCBMb2NhbENvbGxlY3Rpb25fIGZyb20gJy4vbG9jYWxfY29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgTWF0Y2hlciBmcm9tICcuL21hdGNoZXIuanMnO1xuaW1wb3J0IFNvcnRlciBmcm9tICcuL3NvcnRlci5qcyc7XG5cbkxvY2FsQ29sbGVjdGlvbiA9IExvY2FsQ29sbGVjdGlvbl87XG5NaW5pbW9uZ28gPSB7XG4gICAgTG9jYWxDb2xsZWN0aW9uOiBMb2NhbENvbGxlY3Rpb25fLFxuICAgIE1hdGNoZXIsXG4gICAgU29ydGVyXG59O1xuIiwiLy8gT2JzZXJ2ZUhhbmRsZTogdGhlIHJldHVybiB2YWx1ZSBvZiBhIGxpdmUgcXVlcnkuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZlSGFuZGxlIHt9XG4iLCJpbXBvcnQge1xuICBFTEVNRU5UX09QRVJBVE9SUyxcbiAgZXF1YWxpdHlFbGVtZW50TWF0Y2hlcixcbiAgZXhwYW5kQXJyYXlzSW5CcmFuY2hlcyxcbiAgaGFzT3duLFxuICBpc09wZXJhdG9yT2JqZWN0LFxuICBtYWtlTG9va3VwRnVuY3Rpb24sXG4gIHJlZ2V4cEVsZW1lbnRNYXRjaGVyLFxufSBmcm9tICcuL2NvbW1vbi5qcyc7XG5cbi8vIEdpdmUgYSBzb3J0IHNwZWMsIHdoaWNoIGNhbiBiZSBpbiBhbnkgb2YgdGhlc2UgZm9ybXM6XG4vLyAgIHtcImtleTFcIjogMSwgXCJrZXkyXCI6IC0xfVxuLy8gICBbW1wia2V5MVwiLCBcImFzY1wiXSwgW1wia2V5MlwiLCBcImRlc2NcIl1dXG4vLyAgIFtcImtleTFcIiwgW1wia2V5MlwiLCBcImRlc2NcIl1dXG4vL1xuLy8gKC4uIHdpdGggdGhlIGZpcnN0IGZvcm0gYmVpbmcgZGVwZW5kZW50IG9uIHRoZSBrZXkgZW51bWVyYXRpb25cbi8vIGJlaGF2aW9yIG9mIHlvdXIgamF2YXNjcmlwdCBWTSwgd2hpY2ggdXN1YWxseSBkb2VzIHdoYXQgeW91IG1lYW4gaW5cbi8vIHRoaXMgY2FzZSBpZiB0aGUga2V5IG5hbWVzIGRvbid0IGxvb2sgbGlrZSBpbnRlZ2VycyAuLilcbi8vXG4vLyByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHRha2VzIHR3byBvYmplY3RzLCBhbmQgcmV0dXJucyAtMSBpZiB0aGVcbi8vIGZpcnN0IG9iamVjdCBjb21lcyBmaXJzdCBpbiBvcmRlciwgMSBpZiB0aGUgc2Vjb25kIG9iamVjdCBjb21lc1xuLy8gZmlyc3QsIG9yIDAgaWYgbmVpdGhlciBvYmplY3QgY29tZXMgYmVmb3JlIHRoZSBvdGhlci5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29ydGVyIHtcbiAgY29uc3RydWN0b3Ioc3BlYywgY29sbGF0aW9uKSB7XG4gICAgdGhpcy5fc29ydFNwZWNQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3NvcnRGdW5jdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fY29sbGF0b3IgPSBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZUNvbGxhdG9yKGNvbGxhdGlvbik7XG5cbiAgICBjb25zdCBhZGRTcGVjUGFydCA9IChwYXRoLCBhc2NlbmRpbmcpID0+IHtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICB0aHJvdyBFcnJvcignc29ydCBrZXlzIG11c3QgYmUgbm9uLWVtcHR5Jyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoLmNoYXJBdCgwKSA9PT0gJyQnKSB7XG4gICAgICAgIHRocm93IEVycm9yKGB1bnN1cHBvcnRlZCBzb3J0IGtleTogJHtwYXRofWApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zb3J0U3BlY1BhcnRzLnB1c2goe1xuICAgICAgICBhc2NlbmRpbmcsXG4gICAgICAgIGxvb2t1cDogbWFrZUxvb2t1cEZ1bmN0aW9uKHBhdGgsIHtmb3JTb3J0OiB0cnVlfSksXG4gICAgICAgIHBhdGhcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoc3BlYyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBzcGVjLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBhZGRTcGVjUGFydChlbGVtZW50LCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRTcGVjUGFydChlbGVtZW50WzBdLCBlbGVtZW50WzFdICE9PSAnZGVzYycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGVjID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoc3BlYykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBhZGRTcGVjUGFydChrZXksIHNwZWNba2V5XSA+PSAwKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwZWMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3NvcnRGdW5jdGlvbiA9IHNwZWM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKGBCYWQgc29ydCBzcGVjaWZpY2F0aW9uOiAke0pTT04uc3RyaW5naWZ5KHNwZWMpfWApO1xuICAgIH1cblxuICAgIC8vIElmIGEgZnVuY3Rpb24gaXMgc3BlY2lmaWVkIGZvciBzb3J0aW5nLCB3ZSBza2lwIHRoZSByZXN0LlxuICAgIGlmICh0aGlzLl9zb3J0RnVuY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUbyBpbXBsZW1lbnQgYWZmZWN0ZWRCeU1vZGlmaWVyLCB3ZSBwaWdneS1iYWNrIG9uIHRvcCBvZiBNYXRjaGVyJ3NcbiAgICAvLyBhZmZlY3RlZEJ5TW9kaWZpZXIgY29kZTsgd2UgY3JlYXRlIGEgc2VsZWN0b3IgdGhhdCBpcyBhZmZlY3RlZCBieSB0aGVcbiAgICAvLyBzYW1lIG1vZGlmaWVycyBhcyB0aGlzIHNvcnQgb3JkZXIuIFRoaXMgaXMgb25seSBpbXBsZW1lbnRlZCBvbiB0aGVcbiAgICAvLyBzZXJ2ZXIuXG4gICAgaWYgKHRoaXMuYWZmZWN0ZWRCeU1vZGlmaWVyKSB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IHt9O1xuXG4gICAgICB0aGlzLl9zb3J0U3BlY1BhcnRzLmZvckVhY2goc3BlYyA9PiB7XG4gICAgICAgIHNlbGVjdG9yW3NwZWMucGF0aF0gPSAxO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3NlbGVjdG9yRm9yQWZmZWN0ZWRCeU1vZGlmaWVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKHNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICB0aGlzLl9rZXlDb21wYXJhdG9yID0gY29tcG9zZUNvbXBhcmF0b3JzKFxuICAgICAgdGhpcy5fc29ydFNwZWNQYXJ0cy5tYXAoKHNwZWMsIGkpID0+IHRoaXMuX2tleUZpZWxkQ29tcGFyYXRvcihpKSlcbiAgICApO1xuICB9XG5cbiAgZ2V0Q29tcGFyYXRvcihvcHRpb25zKSB7XG4gICAgLy8gSWYgc29ydCBpcyBzcGVjaWZpZWQgb3IgaGF2ZSBubyBkaXN0YW5jZXMsIGp1c3QgdXNlIHRoZSBjb21wYXJhdG9yIGZyb21cbiAgICAvLyB0aGUgc291cmNlIHNwZWNpZmljYXRpb24gKHdoaWNoIGRlZmF1bHRzIHRvIFwiZXZlcnl0aGluZyBpcyBlcXVhbFwiLlxuICAgIC8vIGlzc3VlICMzNTk5XG4gICAgLy8gaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2Uvb3BlcmF0b3IvcXVlcnkvbmVhci8jc29ydC1vcGVyYXRpb25cbiAgICAvLyBzb3J0IGVmZmVjdGl2ZWx5IG92ZXJyaWRlcyAkbmVhclxuICAgIGlmICh0aGlzLl9zb3J0U3BlY1BhcnRzLmxlbmd0aCB8fCAhb3B0aW9ucyB8fCAhb3B0aW9ucy5kaXN0YW5jZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRCYXNlQ29tcGFyYXRvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3RhbmNlcyA9IG9wdGlvbnMuZGlzdGFuY2VzO1xuXG4gICAgLy8gUmV0dXJuIGEgY29tcGFyYXRvciB3aGljaCBjb21wYXJlcyB1c2luZyAkbmVhciBkaXN0YW5jZXMuXG4gICAgcmV0dXJuIChhLCBiKSA9PiB7XG4gICAgICBpZiAoIWRpc3RhbmNlcy5oYXMoYS5faWQpKSB7XG4gICAgICAgIHRocm93IEVycm9yKGBNaXNzaW5nIGRpc3RhbmNlIGZvciAke2EuX2lkfWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRpc3RhbmNlcy5oYXMoYi5faWQpKSB7XG4gICAgICAgIHRocm93IEVycm9yKGBNaXNzaW5nIGRpc3RhbmNlIGZvciAke2IuX2lkfWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGlzdGFuY2VzLmdldChhLl9pZCkgLSBkaXN0YW5jZXMuZ2V0KGIuX2lkKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gVGFrZXMgaW4gdHdvIGtleXM6IGFycmF5cyB3aG9zZSBsZW5ndGhzIG1hdGNoIHRoZSBudW1iZXIgb2Ygc3BlY1xuICAvLyBwYXJ0cy4gUmV0dXJucyBuZWdhdGl2ZSwgMCwgb3IgcG9zaXRpdmUgYmFzZWQgb24gdXNpbmcgdGhlIHNvcnQgc3BlYyB0b1xuICAvLyBjb21wYXJlIGZpZWxkcy5cbiAgX2NvbXBhcmVLZXlzKGtleTEsIGtleTIpIHtcbiAgICBpZiAoa2V5MS5sZW5ndGggIT09IHRoaXMuX3NvcnRTcGVjUGFydHMubGVuZ3RoIHx8XG4gICAgICAgIGtleTIubGVuZ3RoICE9PSB0aGlzLl9zb3J0U3BlY1BhcnRzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0tleSBoYXMgd3JvbmcgbGVuZ3RoJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2tleUNvbXBhcmF0b3Ioa2V5MSwga2V5Mik7XG4gIH1cblxuICAvLyBJdGVyYXRlcyBvdmVyIGVhY2ggcG9zc2libGUgXCJrZXlcIiBmcm9tIGRvYyAoaWUsIG92ZXIgZWFjaCBicmFuY2gpLCBjYWxsaW5nXG4gIC8vICdjYicgd2l0aCB0aGUga2V5LlxuICBfZ2VuZXJhdGVLZXlzRnJvbURvYyhkb2MsIGNiKSB7XG4gICAgaWYgKHRoaXMuX3NvcnRTcGVjUGFydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhblxcJ3QgZ2VuZXJhdGUga2V5cyB3aXRob3V0IGEgc3BlYycpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdGhGcm9tSW5kaWNlcyA9IGluZGljZXMgPT4gYCR7aW5kaWNlcy5qb2luKCcsJyl9LGA7XG5cbiAgICBsZXQga25vd25QYXRocyA9IG51bGw7XG5cbiAgICAvLyBtYXBzIGluZGV4IC0+ICh7JycgLT4gdmFsdWV9IG9yIHtwYXRoIC0+IHZhbHVlfSlcbiAgICBjb25zdCB2YWx1ZXNCeUluZGV4QW5kUGF0aCA9IHRoaXMuX3NvcnRTcGVjUGFydHMubWFwKHNwZWMgPT4ge1xuICAgICAgLy8gRXhwYW5kIGFueSBsZWFmIGFycmF5cyB0aGF0IHdlIGZpbmQsIGFuZCBpZ25vcmUgdGhvc2UgYXJyYXlzXG4gICAgICAvLyB0aGVtc2VsdmVzLiAgKFdlIG5ldmVyIHNvcnQgYmFzZWQgb24gYW4gYXJyYXkgaXRzZWxmLilcbiAgICAgIGxldCBicmFuY2hlcyA9IGV4cGFuZEFycmF5c0luQnJhbmNoZXMoc3BlYy5sb29rdXAoZG9jKSwgdHJ1ZSk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyB2YWx1ZXMgZm9yIGEga2V5IChlZywga2V5IGdvZXMgdG8gYW4gZW1wdHkgYXJyYXkpLFxuICAgICAgLy8gcHJldGVuZCB3ZSBmb3VuZCBvbmUgdW5kZWZpbmVkIHZhbHVlLlxuICAgICAgaWYgKCFicmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgICAgYnJhbmNoZXMgPSBbeyB2YWx1ZTogdm9pZCAwIH1dO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlbGVtZW50ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIGxldCB1c2VkUGF0aHMgPSBmYWxzZTtcblxuICAgICAgYnJhbmNoZXMuZm9yRWFjaChicmFuY2ggPT4ge1xuICAgICAgICBpZiAoIWJyYW5jaC5hcnJheUluZGljZXMpIHtcbiAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gYXJyYXkgaW5kaWNlcyBmb3IgYSBicmFuY2gsIHRoZW4gaXQgbXVzdCBiZSB0aGVcbiAgICAgICAgICAvLyBvbmx5IGJyYW5jaCwgYmVjYXVzZSB0aGUgb25seSB0aGluZyB0aGF0IHByb2R1Y2VzIG11bHRpcGxlIGJyYW5jaGVzXG4gICAgICAgICAgLy8gaXMgdGhlIHVzZSBvZiBhcnJheXMuXG4gICAgICAgICAgaWYgKGJyYW5jaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdtdWx0aXBsZSBicmFuY2hlcyBidXQgbm8gYXJyYXkgdXNlZD8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbGVtZW50WycnXSA9IGJyYW5jaC52YWx1ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB1c2VkUGF0aHMgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHBhdGggPSBwYXRoRnJvbUluZGljZXMoYnJhbmNoLmFycmF5SW5kaWNlcyk7XG5cbiAgICAgICAgaWYgKGhhc093bi5jYWxsKGVsZW1lbnQsIHBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoYGR1cGxpY2F0ZSBwYXRoOiAke3BhdGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50W3BhdGhdID0gYnJhbmNoLnZhbHVlO1xuXG4gICAgICAgIC8vIElmIHR3byBzb3J0IGZpZWxkcyBib3RoIGdvIGludG8gYXJyYXlzLCB0aGV5IGhhdmUgdG8gZ28gaW50byB0aGVcbiAgICAgICAgLy8gZXhhY3Qgc2FtZSBhcnJheXMgYW5kIHdlIGhhdmUgdG8gZmluZCB0aGUgc2FtZSBwYXRocy4gIFRoaXMgaXNcbiAgICAgICAgLy8gcm91Z2hseSB0aGUgc2FtZSBjb25kaXRpb24gdGhhdCBtYWtlcyBNb25nb0RCIHRocm93IHRoaXMgc3RyYW5nZVxuICAgICAgICAvLyBlcnJvciBtZXNzYWdlLiAgZWcsIHRoZSBtYWluIHRoaW5nIGlzIHRoYXQgaWYgc29ydCBzcGVjIGlzIHthOiAxLFxuICAgICAgICAvLyBiOjF9IHRoZW4gYSBhbmQgYiBjYW5ub3QgYm90aCBiZSBhcnJheXMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIChJbiBNb25nb0RCIGl0IHNlZW1zIHRvIGJlIE9LIHRvIGhhdmUge2E6IDEsICdhLngueSc6IDF9IHdoZXJlICdhJ1xuICAgICAgICAvLyBhbmQgJ2EueC55JyBhcmUgYm90aCBhcnJheXMsIGJ1dCB3ZSBkb24ndCBhbGxvdyB0aGlzIGZvciBub3cuXG4gICAgICAgIC8vICNOZXN0ZWRBcnJheVNvcnRcbiAgICAgICAgLy8gWFhYIGFjaGlldmUgZnVsbCBjb21wYXRpYmlsaXR5IGhlcmVcbiAgICAgICAgaWYgKGtub3duUGF0aHMgJiYgIWhhc093bi5jYWxsKGtub3duUGF0aHMsIHBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ2Nhbm5vdCBpbmRleCBwYXJhbGxlbCBhcnJheXMnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChrbm93blBhdGhzKSB7XG4gICAgICAgIC8vIFNpbWlsYXJseSB0byBhYm92ZSwgcGF0aHMgbXVzdCBtYXRjaCBldmVyeXdoZXJlLCB1bmxlc3MgdGhpcyBpcyBhXG4gICAgICAgIC8vIG5vbi1hcnJheSBmaWVsZC5cbiAgICAgICAgaWYgKCFoYXNPd24uY2FsbChlbGVtZW50LCAnJykgJiZcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGtub3duUGF0aHMpLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoZWxlbWVudCkubGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ2Nhbm5vdCBpbmRleCBwYXJhbGxlbCBhcnJheXMhJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodXNlZFBhdGhzKSB7XG4gICAgICAgIGtub3duUGF0aHMgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhlbGVtZW50KS5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgICAgIGtub3duUGF0aHNbcGF0aF0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfSk7XG5cbiAgICBpZiAoIWtub3duUGF0aHMpIHtcbiAgICAgIC8vIEVhc3kgY2FzZTogbm8gdXNlIG9mIGFycmF5cy5cbiAgICAgIGNvbnN0IHNvbGVLZXkgPSB2YWx1ZXNCeUluZGV4QW5kUGF0aC5tYXAodmFsdWVzID0+IHtcbiAgICAgICAgaWYgKCFoYXNPd24uY2FsbCh2YWx1ZXMsICcnKSkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdubyB2YWx1ZSBpbiBzb2xlIGtleSBjYXNlPycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlc1snJ107XG4gICAgICB9KTtcblxuICAgICAgY2Ioc29sZUtleSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhrbm93blBhdGhzKS5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgY29uc3Qga2V5ID0gdmFsdWVzQnlJbmRleEFuZFBhdGgubWFwKHZhbHVlcyA9PiB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbCh2YWx1ZXMsICcnKSkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZXNbJyddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNPd24uY2FsbCh2YWx1ZXMsIHBhdGgpKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ21pc3NpbmcgcGF0aD8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZXNbcGF0aF07XG4gICAgICB9KTtcblxuICAgICAgY2Ioa2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBjb21wYXJhdG9yIHRoYXQgcmVwcmVzZW50cyB0aGUgc29ydCBzcGVjaWZpY2F0aW9uIChidXQgbm90XG4gIC8vIGluY2x1ZGluZyBhIHBvc3NpYmxlIGdlb3F1ZXJ5IGRpc3RhbmNlIHRpZS1icmVha2VyKS5cbiAgX2dldEJhc2VDb21wYXJhdG9yKCkge1xuICAgIGlmICh0aGlzLl9zb3J0RnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3J0RnVuY3Rpb247XG4gICAgfVxuXG4gICAgLy8gSWYgd2UncmUgb25seSBzb3J0aW5nIG9uIGdlb3F1ZXJ5IGRpc3RhbmNlIGFuZCBubyBzcGVjcywganVzdCBzYXlcbiAgICAvLyBldmVyeXRoaW5nIGlzIGVxdWFsLlxuICAgIGlmICghdGhpcy5fc29ydFNwZWNQYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAoZG9jMSwgZG9jMikgPT4gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gKGRvYzEsIGRvYzIpID0+IHtcbiAgICAgIGNvbnN0IGtleTEgPSB0aGlzLl9nZXRNaW5LZXlGcm9tRG9jKGRvYzEpO1xuICAgICAgY29uc3Qga2V5MiA9IHRoaXMuX2dldE1pbktleUZyb21Eb2MoZG9jMik7XG4gICAgICByZXR1cm4gdGhpcy5fY29tcGFyZUtleXMoa2V5MSwga2V5Mik7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEZpbmRzIHRoZSBtaW5pbXVtIGtleSBmcm9tIHRoZSBkb2MsIGFjY29yZGluZyB0byB0aGUgc29ydCBzcGVjcy4gIChXZSBzYXlcbiAgLy8gXCJtaW5pbXVtXCIgaGVyZSBidXQgdGhpcyBpcyB3aXRoIHJlc3BlY3QgdG8gdGhlIHNvcnQgc3BlYywgc28gXCJkZXNjZW5kaW5nXCJcbiAgLy8gc29ydCBmaWVsZHMgbWVhbiB3ZSdyZSBmaW5kaW5nIHRoZSBtYXggZm9yIHRoYXQgZmllbGQuKVxuICAvL1xuICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBOT1QgXCJmaW5kIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSBmaXJzdCBmaWVsZCwgdGhlXG4gIC8vIG1pbmltdW0gdmFsdWUgb2YgdGhlIHNlY29uZCBmaWVsZCwgZXRjXCIuLi4gaXQncyBcImNob29zZSB0aGVcbiAgLy8gbGV4aWNvZ3JhcGhpY2FsbHkgbWluaW11bSB2YWx1ZSBvZiB0aGUga2V5IHZlY3RvciwgYWxsb3dpbmcgb25seSBrZXlzIHdoaWNoXG4gIC8vIHlvdSBjYW4gZmluZCBhbG9uZyB0aGUgc2FtZSBwYXRoc1wiLiAgaWUsIGZvciBhIGRvYyB7YTogW3t4OiAwLCB5OiA1fSwge3g6XG4gIC8vIDEsIHk6IDN9XX0gd2l0aCBzb3J0IHNwZWMgeydhLngnOiAxLCAnYS55JzogMX0sIHRoZSBvbmx5IGtleXMgYXJlIFswLDVdIGFuZFxuICAvLyBbMSwzXSwgYW5kIHRoZSBtaW5pbXVtIGtleSBpcyBbMCw1XTsgbm90YWJseSwgWzAsM10gaXMgTk9UIGEga2V5LlxuICBfZ2V0TWluS2V5RnJvbURvYyhkb2MpIHtcbiAgICBsZXQgbWluS2V5ID0gbnVsbDtcblxuICAgIHRoaXMuX2dlbmVyYXRlS2V5c0Zyb21Eb2MoZG9jLCBrZXkgPT4ge1xuICAgICAgaWYgKG1pbktleSA9PT0gbnVsbCkge1xuICAgICAgICBtaW5LZXkgPSBrZXk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2NvbXBhcmVLZXlzKGtleSwgbWluS2V5KSA8IDApIHtcbiAgICAgICAgbWluS2V5ID0ga2V5O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1pbktleTtcbiAgfVxuXG4gIF9nZXRQYXRocygpIHtcbiAgICByZXR1cm4gdGhpcy5fc29ydFNwZWNQYXJ0cy5tYXAocGFydCA9PiBwYXJ0LnBhdGgpO1xuICB9XG5cbiAgLy8gR2l2ZW4gYW4gaW5kZXggJ2knLCByZXR1cm5zIGEgY29tcGFyYXRvciB0aGF0IGNvbXBhcmVzIHR3byBrZXkgYXJyYXlzIGJhc2VkXG4gIC8vIG9uIGZpZWxkICdpJy5cbiAgX2tleUZpZWxkQ29tcGFyYXRvcihpKSB7XG4gICAgY29uc3QgaW52ZXJ0ID0gIXRoaXMuX3NvcnRTcGVjUGFydHNbaV0uYXNjZW5kaW5nO1xuICAgIGNvbnN0IGNvbGxhdG9yID0gdGhpcy5fY29sbGF0b3I7XG5cbiAgICByZXR1cm4gKGtleTEsIGtleTIpID0+IHtcbiAgICAgIGNvbnN0IGNvbXBhcmUgPSBMb2NhbENvbGxlY3Rpb24uX2YuX2NtcChrZXkxW2ldLCBrZXkyW2ldLCBjb2xsYXRvcik7XG4gICAgICByZXR1cm4gaW52ZXJ0ID8gLWNvbXBhcmUgOiBjb21wYXJlO1xuICAgIH07XG4gIH1cbn1cblxuLy8gR2l2ZW4gYW4gYXJyYXkgb2YgY29tcGFyYXRvcnNcbi8vIChmdW5jdGlvbnMgKGEsYiktPihuZWdhdGl2ZSBvciBwb3NpdGl2ZSBvciB6ZXJvKSksIHJldHVybnMgYSBzaW5nbGVcbi8vIGNvbXBhcmF0b3Igd2hpY2ggdXNlcyBlYWNoIGNvbXBhcmF0b3IgaW4gb3JkZXIgYW5kIHJldHVybnMgdGhlIGZpcnN0XG4vLyBub24temVybyB2YWx1ZS5cbmZ1bmN0aW9uIGNvbXBvc2VDb21wYXJhdG9ycyhjb21wYXJhdG9yQXJyYXkpIHtcbiAgcmV0dXJuIChhLCBiKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wYXJhdG9yQXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IGNvbXBhcmUgPSBjb21wYXJhdG9yQXJyYXlbaV0oYSwgYik7XG4gICAgICBpZiAoY29tcGFyZSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gY29tcGFyZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfTtcbn1cbiJdfQ==
