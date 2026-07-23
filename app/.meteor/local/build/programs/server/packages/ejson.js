Package["core-runtime"].queue("ejson",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Base64 = Package.base64.Base64;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var EJSON;

var require = meteorInstall({"node_modules":{"meteor":{"ejson":{"ejson.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ejson/ejson.js                                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({EJSON:()=>EJSON});let isFunction,isObject,keysOf,lengthOfWithLimit,hasOwn,convertMapToObject,isArguments,isInfOrNaN,handleError;module.link("./utils",{isFunction(v){isFunction=v},isObject(v){isObject=v},keysOf(v){keysOf=v},lengthOfWithLimit(v){lengthOfWithLimit=v},hasOwn(v){hasOwn=v},convertMapToObject(v){convertMapToObject=v},isArguments(v){isArguments=v},isInfOrNaN(v){isInfOrNaN=v},handleError(v){handleError=v}},0);let canonicalStringify;module.link("./stringify",{default(v){canonicalStringify=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

/**
 * @namespace
 * @summary Namespace for EJSON functions
 */ const EJSON = {};
// Custom type interface definition
/**
 * @class CustomType
 * @instanceName customType
 * @memberOf EJSON
 * @summary The interface that a class must satisfy to be able to become an
 * EJSON custom type via EJSON.addType.
 */ /**
 * @function typeName
 * @memberOf EJSON.CustomType
 * @summary Return the tag used to identify this type.  This must match the
 *          tag used to register this type with
 *          [`EJSON.addType`](#ejson_add_type).
 * @locus Anywhere
 * @instance
 */ /**
 * @function toJSONValue
 * @memberOf EJSON.CustomType
 * @summary Serialize this instance into a JSON-compatible value.
 * @locus Anywhere
 * @instance
 */ /**
 * @function clone
 * @memberOf EJSON.CustomType
 * @summary Return a value `r` such that `this.equals(r)` is true, and
 *          modifications to `r` do not affect `this` and vice versa.
 * @locus Anywhere
 * @instance
 */ /**
 * @function equals
 * @memberOf EJSON.CustomType
 * @summary Return `true` if `other` has a value equal to `this`; `false`
 *          otherwise.
 * @locus Anywhere
 * @param {Object} other Another object to compare this to.
 * @instance
 */ const customTypes = new Map();
// Add a custom type, using a method of your choice to get to and
// from a basic JSON-able representation.  The factory argument
// is a function of JSON-able --> your object
// The type you add must have:
// - A toJSONValue() method, so that Meteor can serialize it
// - a typeName() method, to show how to look it up in our type table.
// It is okay if these methods are monkey-patched on.
// EJSON.clone will use toJSONValue and the given factory to produce
// a clone, but you may specify a method clone() that will be
// used instead.
// Similarly, EJSON.equals will use toJSONValue to make comparisons,
// but you may provide a method equals() instead.
/**
 * @summary Add a custom datatype to EJSON.
 * @locus Anywhere
 * @param {String} name A tag for your custom type; must be unique among
 *                      custom data types defined in your project, and must
 *                      match the result of your type's `typeName` method.
 * @param {Function} factory A function that deserializes a JSON-compatible
 *                           value into an instance of your type.  This should
 *                           match the serialization performed by your
 *                           type's `toJSONValue` method.
 */ EJSON.addType = (name, factory)=>{
    if (customTypes.has(name)) {
        throw new Error(`Type ${name} already present`);
    }
    customTypes.set(name, factory);
};
const builtinConverters = [
    {
        // Date
        matchJSONValue (obj) {
            return hasOwn(obj, "$date") && lengthOfWithLimit(obj, 1) === 1;
        },
        matchObject (obj) {
            return obj instanceof Date;
        },
        toJSONValue (obj) {
            return {
                $date: obj.getTime()
            };
        },
        fromJSONValue (obj) {
            return new Date(obj.$date);
        }
    },
    {
        // RegExp
        matchJSONValue (obj) {
            return hasOwn(obj, "$regexp") && hasOwn(obj, "$flags") && lengthOfWithLimit(obj, 2) === 2;
        },
        matchObject (obj) {
            return obj instanceof RegExp;
        },
        toJSONValue (regexp) {
            return {
                $regexp: regexp.source,
                $flags: regexp.flags
            };
        },
        fromJSONValue (obj) {
            // Replaces duplicate / invalid flags.
            return new RegExp(obj.$regexp, obj.$flags// Cut off flags at 50 chars to avoid abusing RegExp for DOS.
            .slice(0, 50).replace(/[^gimuy]/g, "").replace(/(.)(?=.*\1)/g, ""));
        }
    },
    {
        // NaN, Inf, -Inf. (These are the only objects with typeof !== 'object'
        // which we match.)
        matchJSONValue (obj) {
            return hasOwn(obj, "$InfNaN") && lengthOfWithLimit(obj, 1) === 1;
        },
        matchObject: isInfOrNaN,
        toJSONValue (obj) {
            let sign;
            if (Number.isNaN(obj)) {
                sign = 0;
            } else if (obj === Infinity) {
                sign = 1;
            } else {
                sign = -1;
            }
            return {
                $InfNaN: sign
            };
        },
        fromJSONValue (obj) {
            return obj.$InfNaN / 0;
        }
    },
    {
        // Binary
        matchJSONValue (obj) {
            return hasOwn(obj, "$binary") && lengthOfWithLimit(obj, 1) === 1;
        },
        matchObject (obj) {
            return typeof Uint8Array !== "undefined" && obj instanceof Uint8Array || obj && hasOwn(obj, "$Uint8ArrayPolyfill");
        },
        toJSONValue (obj) {
            return {
                $binary: Base64.encode(obj)
            };
        },
        fromJSONValue (obj) {
            return Base64.decode(obj.$binary);
        }
    },
    {
        // Escaping one level
        matchJSONValue (obj) {
            return hasOwn(obj, "$escape") && lengthOfWithLimit(obj, 1) === 1;
        },
        matchObject (obj) {
            let match = false;
            if (obj) {
                const keyCount = lengthOfWithLimit(obj, 2);
                if (keyCount === 1 || keyCount === 2) {
                    match = builtinConverters.some((converter)=>converter.matchJSONValue(obj));
                }
            }
            return match;
        },
        toJSONValue (obj) {
            const newObj = {};
            keysOf(obj).forEach((key)=>{
                newObj[key] = EJSON.toJSONValue(obj[key]);
            });
            return {
                $escape: newObj
            };
        },
        fromJSONValue (obj) {
            const newObj = {};
            keysOf(obj.$escape).forEach((key)=>{
                newObj[key] = EJSON.fromJSONValue(obj.$escape[key]);
            });
            return newObj;
        }
    },
    {
        // Custom
        matchJSONValue (obj) {
            return hasOwn(obj, "$type") && hasOwn(obj, "$value") && lengthOfWithLimit(obj, 2) === 2;
        },
        matchObject (obj) {
            return EJSON._isCustomType(obj);
        },
        toJSONValue (obj) {
            const jsonValue = Meteor._noYieldsAllowed(()=>obj.toJSONValue());
            return {
                $type: obj.typeName(),
                $value: jsonValue
            };
        },
        fromJSONValue (obj) {
            const typeName = obj.$type;
            if (!customTypes.has(typeName)) {
                throw new Error(`Custom EJSON type ${typeName} is not defined`);
            }
            const converter = customTypes.get(typeName);
            return Meteor._noYieldsAllowed(()=>converter(obj.$value));
        }
    }
];
EJSON._isCustomType = (obj)=>obj && isFunction(obj.toJSONValue) && isFunction(obj.typeName) && customTypes.has(obj.typeName());
EJSON._getTypes = (isOriginal = false)=>isOriginal ? customTypes : convertMapToObject(customTypes);
EJSON._getConverters = ()=>builtinConverters;
// Either return the JSON-compatible version of the argument, or undefined (if
// the item isn't itself replaceable, but maybe some fields in it are)
const toJSONValueHelper = (item)=>{
    for(let i = 0; i < builtinConverters.length; i++){
        const converter = builtinConverters[i];
        if (converter.matchObject(item)) {
            return converter.toJSONValue(item);
        }
    }
    return undefined;
};
// for both arrays and objects, in-place modification.
const adjustTypesToJSONValue = (obj)=>{
    // Is it an atom that we need to adjust?
    if (obj === null) {
        return null;
    }
    const maybeChanged = toJSONValueHelper(obj);
    if (maybeChanged !== undefined) {
        return maybeChanged;
    }
    // Other atoms are unchanged.
    if (!isObject(obj)) {
        return obj;
    }
    // Iterate over array or object structure.
    keysOf(obj).forEach((key)=>{
        const value = obj[key];
        if (!isObject(value) && value !== undefined && !isInfOrNaN(value)) {
            return; // continue
        }
        const changed = toJSONValueHelper(value);
        if (changed) {
            obj[key] = changed;
            return; // on to the next key
        }
        // if we get here, value is an object but not adjustable
        // at this level.  recurse.
        adjustTypesToJSONValue(value);
    });
    return obj;
};
EJSON._adjustTypesToJSONValue = adjustTypesToJSONValue;
// Copy-on-write recursive EJSON→JSON converter.
// Only allocates new objects/arrays along paths that actually change,
// returning the original reference when nothing needs conversion.
const toJSONValueDeep = (value)=>{
    // Short-circuit for primitives that toJSONValueHelper can never match.
    if (value === null || value === undefined || typeof value === "boolean" || typeof value === "string" || typeof value === "number" && !isInfOrNaN(value)) {
        return value;
    }
    // Arrays can't be EJSON atoms, so process them directly.
    if (Array.isArray(value)) {
        let result = null;
        for(let i = 0; i < value.length; i++){
            const child = value[i];
            const converted = toJSONValueDeep(child);
            if (converted !== child) {
                result !== null && result !== void 0 ? result : result = value.slice(0, i);
                result.push(converted);
            } else if (result !== null) {
                result.push(child);
            }
        }
        return result !== null && result !== void 0 ? result : value;
    }
    // Atom-level conversion (Date, Binary, NaN/Inf, custom types, etc.)
    const replaced = toJSONValueHelper(value);
    if (replaced !== undefined) {
        return replaced;
    }
    // Plain object: copy-on-write
    const keys = keysOf(value);
    let result = null;
    for(let i = 0; i < keys.length; i++){
        const key = keys[i];
        const child = value[key];
        const converted = toJSONValueDeep(child);
        if (converted !== child) {
            if (result === null) {
                result = {};
                // backfill preceding keys
                for(let j = 0; j < i; j++){
                    result[keys[j]] = value[keys[j]];
                }
            }
            result[key] = converted;
        } else if (result !== null) {
            result[key] = child;
        }
    }
    return result !== null && result !== void 0 ? result : value;
};
/**
 * @summary Serialize an EJSON-compatible value into its plain JSON
 *          representation.
 * @locus Anywhere
 * @param {EJSON} val A value to serialize to plain JSON.
 */ EJSON.toJSONValue = (item)=>toJSONValueDeep(item);
// Either return the argument changed to have the non-json
// rep of itself (the Object version) or the argument itself.
// DOES NOT RECURSE.  For actually getting the fully-changed value, use
// EJSON.fromJSONValue
const fromJSONValueHelper = (value)=>{
    if (isObject(value) && value !== null) {
        const keys = keysOf(value);
        if (keys.length <= 2 && keys.every((k)=>typeof k === "string" && k.substr(0, 1) === "$")) {
            for(let i = 0; i < builtinConverters.length; i++){
                const converter = builtinConverters[i];
                if (converter.matchJSONValue(value)) {
                    return converter.fromJSONValue(value);
                }
            }
        }
    }
    return value;
};
// for both arrays and objects. Tries its best to just
// use the object you hand it, but may return something
// different if the object you hand it itself needs changing.
const adjustTypesFromJSONValue = (obj)=>{
    if (obj === null) {
        return null;
    }
    const maybeChanged = fromJSONValueHelper(obj);
    if (maybeChanged !== obj) {
        return maybeChanged;
    }
    // Other atoms are unchanged.
    if (!isObject(obj)) {
        return obj;
    }
    keysOf(obj).forEach((key)=>{
        const value = obj[key];
        if (isObject(value)) {
            const changed = fromJSONValueHelper(value);
            if (value !== changed) {
                obj[key] = changed;
                return;
            }
            // if we get here, value is an object but not adjustable
            // at this level.  recurse.
            adjustTypesFromJSONValue(value);
        }
    });
    return obj;
};
EJSON._adjustTypesFromJSONValue = adjustTypesFromJSONValue;
// Copy-on-write recursive JSON→EJSON converter.
// Same lazy-allocation strategy as toJSONValueDeep.
const fromJSONValueDeep = (value)=>{
    if (value === null || typeof value !== "object") {
        return value;
    }
    // Arrays can't be EJSON-encoded types, so process them directly.
    if (Array.isArray(value)) {
        let result = null;
        for(let i = 0; i < value.length; i++){
            const child = value[i];
            const converted = fromJSONValueDeep(child);
            if (converted !== child) {
                result !== null && result !== void 0 ? result : result = value.slice(0, i);
                result.push(converted);
            } else if (result !== null) {
                result.push(child);
            }
        }
        return result !== null && result !== void 0 ? result : value;
    }
    // Check if this value itself is a JSON-encoded EJSON type (e.g. {$date: ...})
    const replaced = fromJSONValueHelper(value);
    if (replaced !== value) {
        return replaced;
    }
    const keys = keysOf(value);
    let result = null;
    for(let i = 0; i < keys.length; i++){
        const key = keys[i];
        const child = value[key];
        const converted = fromJSONValueDeep(child);
        if (converted !== child) {
            if (result === null) {
                result = {};
                for(let j = 0; j < i; j++){
                    result[keys[j]] = value[keys[j]];
                }
            }
            result[key] = converted;
        } else if (result !== null) {
            result[key] = child;
        }
    }
    return result !== null && result !== void 0 ? result : value;
};
/**
 * @summary Deserialize an EJSON value from its plain JSON representation.
 * @locus Anywhere
 * @param {JSONCompatible} val A value to deserialize into EJSON.
 */ EJSON.fromJSONValue = (item)=>fromJSONValueDeep(item);
/**
 * @summary Serialize a value to a string. For EJSON values, the serialization
 *          fully represents the value. For non-EJSON values, serializes the
 *          same way as `JSON.stringify`.
 * @locus Anywhere
 * @param {EJSON} val A value to stringify.
 * @param {Object} [options]
 * @param {Boolean | Integer | String} [options.indent] Indents objects and
 * arrays for easy readability.  When `true`, indents by 2 spaces; when an
 * integer, indents by that number of spaces; and when a string, uses the
 * string as the indentation pattern.
 * @param {Boolean} [options.canonical] When `true`, stringifies keys in an
 *                                    object in sorted order.
 */ EJSON.stringify = handleError((item, options)=>{
    let serialized;
    const json = EJSON.toJSONValue(item);
    if (options && (options.canonical || options.indent)) {
        serialized = canonicalStringify(json, options);
    } else {
        serialized = JSON.stringify(json);
    }
    return serialized;
});
/**
 * @summary Parse a string into an EJSON value. Throws an error if the string
 *          is not valid EJSON.
 * @locus Anywhere
 * @param {String} str A string to parse into an EJSON value.
 */ EJSON.parse = (item)=>{
    if (typeof item !== "string") {
        throw new Error("EJSON.parse argument should be a string");
    }
    return EJSON.fromJSONValue(JSON.parse(item));
};
/**
 * @summary Returns true if `x` is a buffer of binary data, as returned from
 *          [`EJSON.newBinary`](#ejson_new_binary).
 * @param {Object} x The variable to check.
 * @locus Anywhere
 */ EJSON.isBinary = (obj)=>{
    return !!(typeof Uint8Array !== "undefined" && obj instanceof Uint8Array || obj && obj.$Uint8ArrayPolyfill);
};
/**
 * @summary Return true if `a` and `b` are equal to each other.  Return false
 *          otherwise.  Uses the `equals` method on `a` if present, otherwise
 *          performs a deep comparison.
 * @locus Anywhere
 * @param {EJSON} a
 * @param {EJSON} b
 * @param {Object} [options]
 * @param {Boolean} options.keyOrderSensitive Compare in key sensitive order,
 * if supported by the JavaScript implementation.  For example, `{a: 1, b: 2}`
 * is equal to `{b: 2, a: 1}` only when `keyOrderSensitive` is `false`.  The
 * default is `false`.
 */ EJSON.equals = (a, b, options)=>{
    let i;
    const keyOrderSensitive = !!(options && options.keyOrderSensitive);
    if (a === b) {
        return true;
    }
    // If types differ, they can't be equal.
    // This also handles mixed null/primitive cases since typeof null is 'object'.
    if (typeof a !== typeof b) {
        return false;
    }
    // Same-type primitives that aren't === can only be equal if both are NaN.
    // This skips the NaN check entirely for strings, booleans, etc.
    if (typeof a !== "object") {
        return Number.isNaN(a) && Number.isNaN(b);
    }
    // Both are typeof 'object' — but either could be null.
    // (If both were null, a === b would have caught it above.)
    if (a === null || b === null) {
        return false;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.valueOf() === b.valueOf();
    }
    if (EJSON.isBinary(a) && EJSON.isBinary(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for(i = 0; i < a.length; i++){
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    if (isFunction(a.equals)) {
        return a.equals(b, options);
    }
    if (isFunction(b.equals)) {
        return b.equals(a, options);
    }
    // Array.isArray works across iframes while instanceof won't
    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    // if not both or none are array they are not equal
    if (aIsArray !== bIsArray) {
        return false;
    }
    if (aIsArray && bIsArray) {
        if (a.length !== b.length) {
            return false;
        }
        for(i = 0; i < a.length; i++){
            if (!EJSON.equals(a[i], b[i], options)) {
                return false;
            }
        }
        return true;
    }
    // fallback for custom types that don't implement their own equals
    switch(EJSON._isCustomType(a) + EJSON._isCustomType(b)){
        case 1:
            return false;
        case 2:
            return EJSON.equals(EJSON.toJSONValue(a), EJSON.toJSONValue(b));
        default:
    }
    // fall back to structural equality of objects
    let ret;
    const aKeys = keysOf(a);
    const bKeys = keysOf(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    if (keyOrderSensitive) {
        i = 0;
        ret = aKeys.every((key)=>{
            if (i >= bKeys.length) {
                return false;
            }
            if (key !== bKeys[i]) {
                return false;
            }
            if (!EJSON.equals(a[key], b[bKeys[i]], options)) {
                return false;
            }
            i++;
            return true;
        });
    } else {
        i = 0;
        ret = aKeys.every((key)=>{
            if (!hasOwn(b, key)) {
                return false;
            }
            if (!EJSON.equals(a[key], b[key], options)) {
                return false;
            }
            i++;
            return true;
        });
    }
    return ret && i === bKeys.length;
};
/**
 * @summary Return a deep copy of `val`.
 * @locus Anywhere
 * @param {EJSON} val A value to copy.
 */ EJSON.clone = (v)=>{
    let ret;
    if (!isObject(v)) {
        return v;
    }
    if (v === null) {
        return null; // null has typeof "object"
    }
    if (v instanceof Date) {
        return new Date(v.getTime());
    }
    // RegExps are not really EJSON elements (eg we don't define a serialization
    // for them), but they're immutable anyway, so we can support them in clone.
    if (v instanceof RegExp) {
        return v;
    }
    if (EJSON.isBinary(v)) {
        ret = EJSON.newBinary(v.length);
        for(let i = 0; i < v.length; i++){
            ret[i] = v[i];
        }
        return ret;
    }
    if (Array.isArray(v)) {
        return v.map(EJSON.clone);
    }
    if (isArguments(v)) {
        return Array.from(v).map(EJSON.clone);
    }
    // handle general user-defined typed Objects if they have a clone method
    if (isFunction(v.clone)) {
        return v.clone();
    }
    // handle other custom types
    if (EJSON._isCustomType(v)) {
        return EJSON.fromJSONValue(EJSON.clone(EJSON.toJSONValue(v)), true);
    }
    // handle other objects
    ret = {};
    keysOf(v).forEach((key)=>{
        ret[key] = EJSON.clone(v[key]);
    });
    return ret;
};
/**
 * @summary Allocate a new buffer of binary data that EJSON can serialize.
 * @locus Anywhere
 * @param {Number} size The number of bytes of binary data to allocate.
 */ // EJSON.newBinary is the public documented API for this functionality,
// but the implementation is in the 'base64' package to avoid
// introducing a circular dependency. (If the implementation were here,
// then 'base64' would have to use EJSON.newBinary, and 'ejson' would
// also have to use 'base64'.)
EJSON.newBinary = Base64.newBinary;

//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"stringify.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ejson/stringify.js                                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Based on json2.js from https://github.com/douglascrockford/JSON-js
//
//    json2.js
//    2012-10-08
//
//    Public Domain.
//
//    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
function quote(string) {
    return JSON.stringify(string);
}
const str = (key, holder, singleIndent, outerIndent, canonical)=>{
    const value = holder[key];
    // What happens next depends on the value's type.
    switch(typeof value){
        case "string":
            return quote(value);
        case "number":
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : "null";
        case "boolean":
            return String(value);
        // If the type is 'object', we might be dealing with an object or an array or
        // null.
        case "object":
            {
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return "null";
                }
                // Make an array to hold the partial results of stringifying this object
                // value.
                const innerIndent = outerIndent + singleIndent;
                const partial = [];
                let v;
                // Is the value an array?
                if (Array.isArray(value) || ({}).hasOwnProperty.call(value, "callee")) {
                    // The value is an array. Stringify every element. Use null as a
                    // placeholder for non-JSON values.
                    const length = value.length;
                    for(let i = 0; i < length; i += 1){
                        partial[i] = str(i, value, singleIndent, innerIndent, canonical) || "null";
                    }
                    // Join all of the elements together, separated with commas, and wrap
                    // them in brackets.
                    if (partial.length === 0) {
                        v = "[]";
                    } else if (innerIndent) {
                        v = `[\n${innerIndent}${partial.join(`,\n${innerIndent}`)}\n${outerIndent}]`;
                    } else {
                        v = `[${partial.join(",")}]`;
                    }
                    return v;
                }
                // Iterate through all of the keys in the object.
                let keys = Object.keys(value);
                if (canonical) {
                    keys = keys.sort();
                }
                keys.forEach((k)=>{
                    v = str(k, value, singleIndent, innerIndent, canonical);
                    if (v) {
                        partial.push(quote(k) + (innerIndent ? ": " : ":") + v);
                    }
                });
                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                if (partial.length === 0) {
                    v = "{}";
                } else if (innerIndent) {
                    v = `{\n${innerIndent}${partial.join(`,\n${innerIndent}`)}\n${outerIndent}}`;
                } else {
                    v = `{${partial.join(",")}}`;
                }
                return v;
            }
        default:
    }
};
// If the JSON object does not yet have a stringify method, give it one.
const canonicalStringify = (value, options)=>{
    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    const allOptions = Object.assign({
        indent: "",
        canonical: false
    }, options);
    if (allOptions.indent === true) {
        allOptions.indent = "  ";
    } else if (typeof allOptions.indent === "number") {
        let newIndent = "";
        for(let i = 0; i < allOptions.indent; i++){
            newIndent += " ";
        }
        allOptions.indent = newIndent;
    }
    return str("", {
        "": value
    }, allOptions.indent, "", allOptions.canonical);
};
module.exportDefault(canonicalStringify);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ejson/utils.js                                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({isFunction:()=>isFunction,isObject:()=>isObject,keysOf:()=>keysOf,lengthOf:()=>lengthOf,lengthOfWithLimit:()=>lengthOfWithLimit,hasOwn:()=>hasOwn,convertMapToObject:()=>convertMapToObject,isArguments:()=>isArguments,isInfOrNaN:()=>isInfOrNaN,checkError:()=>checkError,handleError:()=>handleError},true);const isFunction = (fn)=>typeof fn === "function";
const isObject = (fn)=>typeof fn === "object";
const keysOf = (obj)=>Object.keys(obj);
const lengthOf = (obj)=>{
    let count = 0;
    for(const key in obj){
        if (hasOwn(obj, key)) count++;
    }
    return count;
};
/**
 * Counts own properties of obj, but stops early once count exceeds limit.
 * Useful for hot-path checks like `lengthOfWithLimit(obj, 1) === 1`
 * without iterating all keys of large objects.
 * @param {Object} obj
 * @param {number} limit - stop counting beyond this value
 * @returns {number} exact count if <= limit, otherwise limit + 1
 */ const lengthOfWithLimit = (obj, limit)=>{
    let count = 0;
    for(const key in obj){
        if (hasOwn(obj, key) && ++count > limit) return count;
    }
    return count;
};
const hasOwn = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
const convertMapToObject = (map)=>Array.from(map).reduce((acc, [key, value])=>{
        // reassign to not create new object
        acc[key] = value;
        return acc;
    }, {});
const isArguments = (obj)=>obj != null && hasOwn(obj, "callee");
const isInfOrNaN = (obj)=>Number.isNaN(obj) || obj === Infinity || obj === -Infinity;
const checkError = {
    maxStack: (msgError)=>new RegExp("Maximum call stack size exceeded", "g").test(msgError)
};
const handleError = (fn)=>function() {
        try {
            return fn.apply(this, arguments);
        } catch (error) {
            const isMaxStack = checkError.maxStack(error.message);
            if (isMaxStack) {
                throw new Error("Converting circular structure to JSON");
            }
            throw error;
        }
    };

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
      EJSON: EJSON
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ejson/ejson.js"
  ],
  mainModulePath: "/node_modules/meteor/ejson/ejson.js"
}});

//# sourceURL=meteor://💻app/packages/ejson.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZWpzb24vZWpzb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2Vqc29uL3N0cmluZ2lmeS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZWpzb24vdXRpbHMuanMiXSwibmFtZXMiOlsiaXNGdW5jdGlvbiIsImlzT2JqZWN0Iiwia2V5c09mIiwibGVuZ3RoT2ZXaXRoTGltaXQiLCJoYXNPd24iLCJjb252ZXJ0TWFwVG9PYmplY3QiLCJpc0FyZ3VtZW50cyIsImlzSW5mT3JOYU4iLCJoYW5kbGVFcnJvciIsIkVKU09OIiwiY3VzdG9tVHlwZXMiLCJNYXAiLCJhZGRUeXBlIiwibmFtZSIsImZhY3RvcnkiLCJoYXMiLCJFcnJvciIsInNldCIsImJ1aWx0aW5Db252ZXJ0ZXJzIiwibWF0Y2hKU09OVmFsdWUiLCJvYmoiLCJtYXRjaE9iamVjdCIsIkRhdGUiLCJ0b0pTT05WYWx1ZSIsIiRkYXRlIiwiZ2V0VGltZSIsImZyb21KU09OVmFsdWUiLCJSZWdFeHAiLCJyZWdleHAiLCIkcmVnZXhwIiwic291cmNlIiwiJGZsYWdzIiwiZmxhZ3MiLCJzbGljZSIsInJlcGxhY2UiLCJzaWduIiwiTnVtYmVyIiwiaXNOYU4iLCJJbmZpbml0eSIsIiRJbmZOYU4iLCJVaW50OEFycmF5IiwiJGJpbmFyeSIsIkJhc2U2NCIsImVuY29kZSIsImRlY29kZSIsIm1hdGNoIiwia2V5Q291bnQiLCJzb21lIiwiY29udmVydGVyIiwibmV3T2JqIiwiZm9yRWFjaCIsImtleSIsIiRlc2NhcGUiLCJfaXNDdXN0b21UeXBlIiwianNvblZhbHVlIiwiTWV0ZW9yIiwiX25vWWllbGRzQWxsb3dlZCIsIiR0eXBlIiwidHlwZU5hbWUiLCIkdmFsdWUiLCJnZXQiLCJfZ2V0VHlwZXMiLCJpc09yaWdpbmFsIiwiX2dldENvbnZlcnRlcnMiLCJ0b0pTT05WYWx1ZUhlbHBlciIsIml0ZW0iLCJpIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwiYWRqdXN0VHlwZXNUb0pTT05WYWx1ZSIsIm1heWJlQ2hhbmdlZCIsInZhbHVlIiwiY2hhbmdlZCIsIl9hZGp1c3RUeXBlc1RvSlNPTlZhbHVlIiwidG9KU09OVmFsdWVEZWVwIiwiQXJyYXkiLCJpc0FycmF5IiwicmVzdWx0IiwiY2hpbGQiLCJjb252ZXJ0ZWQiLCJwdXNoIiwicmVwbGFjZWQiLCJrZXlzIiwiaiIsImZyb21KU09OVmFsdWVIZWxwZXIiLCJldmVyeSIsImsiLCJzdWJzdHIiLCJhZGp1c3RUeXBlc0Zyb21KU09OVmFsdWUiLCJfYWRqdXN0VHlwZXNGcm9tSlNPTlZhbHVlIiwiZnJvbUpTT05WYWx1ZURlZXAiLCJzdHJpbmdpZnkiLCJvcHRpb25zIiwic2VyaWFsaXplZCIsImpzb24iLCJjYW5vbmljYWwiLCJpbmRlbnQiLCJjYW5vbmljYWxTdHJpbmdpZnkiLCJKU09OIiwicGFyc2UiLCJpc0JpbmFyeSIsIiRVaW50OEFycmF5UG9seWZpbGwiLCJlcXVhbHMiLCJhIiwiYiIsImtleU9yZGVyU2Vuc2l0aXZlIiwidmFsdWVPZiIsImFJc0FycmF5IiwiYklzQXJyYXkiLCJyZXQiLCJhS2V5cyIsImJLZXlzIiwiY2xvbmUiLCJ2IiwibmV3QmluYXJ5IiwibWFwIiwiZnJvbSIsInF1b3RlIiwic3RyaW5nIiwic3RyIiwiaG9sZGVyIiwic2luZ2xlSW5kZW50Iiwib3V0ZXJJbmRlbnQiLCJpc0Zpbml0ZSIsIlN0cmluZyIsImlubmVySW5kZW50IiwicGFydGlhbCIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImpvaW4iLCJPYmplY3QiLCJzb3J0IiwiYWxsT3B0aW9ucyIsImFzc2lnbiIsIm5ld0luZGVudCIsImZuIiwibGVuZ3RoT2YiLCJjb3VudCIsImxpbWl0IiwicHJvcCIsInByb3RvdHlwZSIsInJlZHVjZSIsImFjYyIsImNoZWNrRXJyb3IiLCJtYXhTdGFjayIsIm1zZ0Vycm9yIiwidGVzdCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXJyb3IiLCJpc01heFN0YWNrIiwibWVzc2Fn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LENBQUM4RyxNQUNqQ3hDLE1BQU15QyxJQUFJLENBQUNELEtBQUswQixNQUFNLENBQUMsQ0FBQ0MsS0FBSyxDQUFDM0YsS0FBS29CLEdBQU07UUFDdkMsb0NBQW9DO1FBQ3BDdUUsR0FBRyxDQUFDM0YsSUFBSSxHQUFHb0I7UUFDWCxPQUFPdUU7SUFDVCxHQUFHLENBQUMsR0FBRztBQUVULE9BQU8sTUFBTXhJLGNBQWMsQ0FBQ2MsTUFBUUEsT0FBTyxRQUFRaEIsT0FBT2dCLEtBQUssR0FBVTtBQUV6RSxPQUFPLE1BQU1iLGFBQWEsQ0FBQ2EsTUFBUWdCLE9BQU9DLEtBQUssQ0FBQ2pCLFFBQVFBLFFBQVFrQixZQUFZbEIsUUFBUSxDQUFDa0IsRUFBUztBQUU5RixPQUFPLE1BQU15RyxPQUFhO0lBQ3hCQyxVQUFVLENBQUNDLFdBQWEsSUFBSXRILE9BQU8sb0NBQW9DLEtBQUt1SCxJQUFJLENBQUNEO0FBQ25GLEVBQUU7QUFFRixPQUFPLE1BQU16SSxjQUFjLENBQUMrSCxLQUMxQjtRQUNFLElBQUk7WUFDRixPQUFPQSxHQUFHWSxLQUFLLENBQUMsSUFBSSxFQUFFQztRQUN4QixFQUFFLE9BQU9DLE9BQU87WUFDZCxNQUFNQyxhQUFhUCxXQUFXQyxRQUFRLENBQUNLLE1BQU1FLE9BQU87WUFDcEQsSUFBSUQsWUFBWTtnQkFDZCxNQUFNLElBQUl0SSxNQUFNO1lBQ2xCO1lBQ0EsTUFBTXFJO1FBQ1I7SUFDRixFQUFFIiwiZmlsZSI6Ii9wYWNrYWdlcy9lanNvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzRnVuY3Rpb24sXG4gIGlzT2JqZWN0LFxuICBrZXlzT2YsXG4gIGxlbmd0aE9mV2l0aExpbWl0LFxuICBoYXNPd24sXG4gIGNvbnZlcnRNYXBUb09iamVjdCxcbiAgaXNBcmd1bWVudHMsXG4gIGlzSW5mT3JOYU4sXG4gIGhhbmRsZUVycm9yLFxufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IGNhbm9uaWNhbFN0cmluZ2lmeSBmcm9tIFwiLi9zdHJpbmdpZnlcIjtcblxuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBAc3VtbWFyeSBOYW1lc3BhY2UgZm9yIEVKU09OIGZ1bmN0aW9uc1xuICovXG5jb25zdCBFSlNPTiA9IHt9O1xuXG4vLyBDdXN0b20gdHlwZSBpbnRlcmZhY2UgZGVmaW5pdGlvblxuLyoqXG4gKiBAY2xhc3MgQ3VzdG9tVHlwZVxuICogQGluc3RhbmNlTmFtZSBjdXN0b21UeXBlXG4gKiBAbWVtYmVyT2YgRUpTT05cbiAqIEBzdW1tYXJ5IFRoZSBpbnRlcmZhY2UgdGhhdCBhIGNsYXNzIG11c3Qgc2F0aXNmeSB0byBiZSBhYmxlIHRvIGJlY29tZSBhblxuICogRUpTT04gY3VzdG9tIHR5cGUgdmlhIEVKU09OLmFkZFR5cGUuXG4gKi9cblxuLyoqXG4gKiBAZnVuY3Rpb24gdHlwZU5hbWVcbiAqIEBtZW1iZXJPZiBFSlNPTi5DdXN0b21UeXBlXG4gKiBAc3VtbWFyeSBSZXR1cm4gdGhlIHRhZyB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgdHlwZS4gIFRoaXMgbXVzdCBtYXRjaCB0aGVcbiAqICAgICAgICAgIHRhZyB1c2VkIHRvIHJlZ2lzdGVyIHRoaXMgdHlwZSB3aXRoXG4gKiAgICAgICAgICBbYEVKU09OLmFkZFR5cGVgXSgjZWpzb25fYWRkX3R5cGUpLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAaW5zdGFuY2VcbiAqL1xuXG4vKipcbiAqIEBmdW5jdGlvbiB0b0pTT05WYWx1ZVxuICogQG1lbWJlck9mIEVKU09OLkN1c3RvbVR5cGVcbiAqIEBzdW1tYXJ5IFNlcmlhbGl6ZSB0aGlzIGluc3RhbmNlIGludG8gYSBKU09OLWNvbXBhdGlibGUgdmFsdWUuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBpbnN0YW5jZVxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uIGNsb25lXG4gKiBAbWVtYmVyT2YgRUpTT04uQ3VzdG9tVHlwZVxuICogQHN1bW1hcnkgUmV0dXJuIGEgdmFsdWUgYHJgIHN1Y2ggdGhhdCBgdGhpcy5lcXVhbHMocilgIGlzIHRydWUsIGFuZFxuICogICAgICAgICAgbW9kaWZpY2F0aW9ucyB0byBgcmAgZG8gbm90IGFmZmVjdCBgdGhpc2AgYW5kIHZpY2UgdmVyc2EuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBpbnN0YW5jZVxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uIGVxdWFsc1xuICogQG1lbWJlck9mIEVKU09OLkN1c3RvbVR5cGVcbiAqIEBzdW1tYXJ5IFJldHVybiBgdHJ1ZWAgaWYgYG90aGVyYCBoYXMgYSB2YWx1ZSBlcXVhbCB0byBgdGhpc2A7IGBmYWxzZWBcbiAqICAgICAgICAgIG90aGVyd2lzZS5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIEFub3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUgdGhpcyB0by5cbiAqIEBpbnN0YW5jZVxuICovXG5cbmNvbnN0IGN1c3RvbVR5cGVzID0gbmV3IE1hcCgpO1xuXG4vLyBBZGQgYSBjdXN0b20gdHlwZSwgdXNpbmcgYSBtZXRob2Qgb2YgeW91ciBjaG9pY2UgdG8gZ2V0IHRvIGFuZFxuLy8gZnJvbSBhIGJhc2ljIEpTT04tYWJsZSByZXByZXNlbnRhdGlvbi4gIFRoZSBmYWN0b3J5IGFyZ3VtZW50XG4vLyBpcyBhIGZ1bmN0aW9uIG9mIEpTT04tYWJsZSAtLT4geW91ciBvYmplY3Rcbi8vIFRoZSB0eXBlIHlvdSBhZGQgbXVzdCBoYXZlOlxuLy8gLSBBIHRvSlNPTlZhbHVlKCkgbWV0aG9kLCBzbyB0aGF0IE1ldGVvciBjYW4gc2VyaWFsaXplIGl0XG4vLyAtIGEgdHlwZU5hbWUoKSBtZXRob2QsIHRvIHNob3cgaG93IHRvIGxvb2sgaXQgdXAgaW4gb3VyIHR5cGUgdGFibGUuXG4vLyBJdCBpcyBva2F5IGlmIHRoZXNlIG1ldGhvZHMgYXJlIG1vbmtleS1wYXRjaGVkIG9uLlxuLy8gRUpTT04uY2xvbmUgd2lsbCB1c2UgdG9KU09OVmFsdWUgYW5kIHRoZSBnaXZlbiBmYWN0b3J5IHRvIHByb2R1Y2Vcbi8vIGEgY2xvbmUsIGJ1dCB5b3UgbWF5IHNwZWNpZnkgYSBtZXRob2QgY2xvbmUoKSB0aGF0IHdpbGwgYmVcbi8vIHVzZWQgaW5zdGVhZC5cbi8vIFNpbWlsYXJseSwgRUpTT04uZXF1YWxzIHdpbGwgdXNlIHRvSlNPTlZhbHVlIHRvIG1ha2UgY29tcGFyaXNvbnMsXG4vLyBidXQgeW91IG1heSBwcm92aWRlIGEgbWV0aG9kIGVxdWFscygpIGluc3RlYWQuXG4vKipcbiAqIEBzdW1tYXJ5IEFkZCBhIGN1c3RvbSBkYXRhdHlwZSB0byBFSlNPTi5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgQSB0YWcgZm9yIHlvdXIgY3VzdG9tIHR5cGU7IG11c3QgYmUgdW5pcXVlIGFtb25nXG4gKiAgICAgICAgICAgICAgICAgICAgICBjdXN0b20gZGF0YSB0eXBlcyBkZWZpbmVkIGluIHlvdXIgcHJvamVjdCwgYW5kIG11c3RcbiAqICAgICAgICAgICAgICAgICAgICAgIG1hdGNoIHRoZSByZXN1bHQgb2YgeW91ciB0eXBlJ3MgYHR5cGVOYW1lYCBtZXRob2QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmYWN0b3J5IEEgZnVuY3Rpb24gdGhhdCBkZXNlcmlhbGl6ZXMgYSBKU09OLWNvbXBhdGlibGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgaW50byBhbiBpbnN0YW5jZSBvZiB5b3VyIHR5cGUuICBUaGlzIHNob3VsZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCB0aGUgc2VyaWFsaXphdGlvbiBwZXJmb3JtZWQgYnkgeW91clxuICogICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlJ3MgYHRvSlNPTlZhbHVlYCBtZXRob2QuXG4gKi9cbkVKU09OLmFkZFR5cGUgPSAobmFtZSwgZmFjdG9yeSkgPT4ge1xuICBpZiAoY3VzdG9tVHlwZXMuaGFzKG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlICR7bmFtZX0gYWxyZWFkeSBwcmVzZW50YCk7XG4gIH1cbiAgY3VzdG9tVHlwZXMuc2V0KG5hbWUsIGZhY3RvcnkpO1xufTtcblxuY29uc3QgYnVpbHRpbkNvbnZlcnRlcnMgPSBbXG4gIHtcbiAgICAvLyBEYXRlXG4gICAgbWF0Y2hKU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gaGFzT3duKG9iaiwgXCIkZGF0ZVwiKSAmJiBsZW5ndGhPZldpdGhMaW1pdChvYmosIDEpID09PSAxO1xuICAgIH0sXG4gICAgbWF0Y2hPYmplY3Qob2JqKSB7XG4gICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRGF0ZTtcbiAgICB9LFxuICAgIHRvSlNPTlZhbHVlKG9iaikge1xuICAgICAgcmV0dXJuIHsgJGRhdGU6IG9iai5nZXRUaW1lKCkgfTtcbiAgICB9LFxuICAgIGZyb21KU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUob2JqLiRkYXRlKTtcbiAgICB9LFxuICB9LFxuICB7XG4gICAgLy8gUmVnRXhwXG4gICAgbWF0Y2hKU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gaGFzT3duKG9iaiwgXCIkcmVnZXhwXCIpICYmIGhhc093bihvYmosIFwiJGZsYWdzXCIpICYmIGxlbmd0aE9mV2l0aExpbWl0KG9iaiwgMikgPT09IDI7XG4gICAgfSxcbiAgICBtYXRjaE9iamVjdChvYmopIHtcbiAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBSZWdFeHA7XG4gICAgfSxcbiAgICB0b0pTT05WYWx1ZShyZWdleHApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICRyZWdleHA6IHJlZ2V4cC5zb3VyY2UsXG4gICAgICAgICRmbGFnczogcmVnZXhwLmZsYWdzLFxuICAgICAgfTtcbiAgICB9LFxuICAgIGZyb21KU09OVmFsdWUob2JqKSB7XG4gICAgICAvLyBSZXBsYWNlcyBkdXBsaWNhdGUgLyBpbnZhbGlkIGZsYWdzLlxuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoXG4gICAgICAgIG9iai4kcmVnZXhwLFxuICAgICAgICBvYmouJGZsYWdzXG4gICAgICAgICAgLy8gQ3V0IG9mZiBmbGFncyBhdCA1MCBjaGFycyB0byBhdm9pZCBhYnVzaW5nIFJlZ0V4cCBmb3IgRE9TLlxuICAgICAgICAgIC5zbGljZSgwLCA1MClcbiAgICAgICAgICAucmVwbGFjZSgvW15naW11eV0vZywgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvKC4pKD89LipcXDEpL2csIFwiXCIpLFxuICAgICAgKTtcbiAgICB9LFxuICB9LFxuICB7XG4gICAgLy8gTmFOLCBJbmYsIC1JbmYuIChUaGVzZSBhcmUgdGhlIG9ubHkgb2JqZWN0cyB3aXRoIHR5cGVvZiAhPT0gJ29iamVjdCdcbiAgICAvLyB3aGljaCB3ZSBtYXRjaC4pXG4gICAgbWF0Y2hKU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gaGFzT3duKG9iaiwgXCIkSW5mTmFOXCIpICYmIGxlbmd0aE9mV2l0aExpbWl0KG9iaiwgMSkgPT09IDE7XG4gICAgfSxcbiAgICBtYXRjaE9iamVjdDogaXNJbmZPck5hTixcbiAgICB0b0pTT05WYWx1ZShvYmopIHtcbiAgICAgIGxldCBzaWduO1xuICAgICAgaWYgKE51bWJlci5pc05hTihvYmopKSB7XG4gICAgICAgIHNpZ24gPSAwO1xuICAgICAgfSBlbHNlIGlmIChvYmogPT09IEluZmluaXR5KSB7XG4gICAgICAgIHNpZ24gPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2lnbiA9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgJEluZk5hTjogc2lnbiB9O1xuICAgIH0sXG4gICAgZnJvbUpTT05WYWx1ZShvYmopIHtcbiAgICAgIHJldHVybiBvYmouJEluZk5hTiAvIDA7XG4gICAgfSxcbiAgfSxcbiAge1xuICAgIC8vIEJpbmFyeVxuICAgIG1hdGNoSlNPTlZhbHVlKG9iaikge1xuICAgICAgcmV0dXJuIGhhc093bihvYmosIFwiJGJpbmFyeVwiKSAmJiBsZW5ndGhPZldpdGhMaW1pdChvYmosIDEpID09PSAxO1xuICAgIH0sXG4gICAgbWF0Y2hPYmplY3Qob2JqKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAodHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqIGluc3RhbmNlb2YgVWludDhBcnJheSkgfHxcbiAgICAgICAgKG9iaiAmJiBoYXNPd24ob2JqLCBcIiRVaW50OEFycmF5UG9seWZpbGxcIikpXG4gICAgICApO1xuICAgIH0sXG4gICAgdG9KU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4geyAkYmluYXJ5OiBCYXNlNjQuZW5jb2RlKG9iaikgfTtcbiAgICB9LFxuICAgIGZyb21KU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gQmFzZTY0LmRlY29kZShvYmouJGJpbmFyeSk7XG4gICAgfSxcbiAgfSxcbiAge1xuICAgIC8vIEVzY2FwaW5nIG9uZSBsZXZlbFxuICAgIG1hdGNoSlNPTlZhbHVlKG9iaikge1xuICAgICAgcmV0dXJuIGhhc093bihvYmosIFwiJGVzY2FwZVwiKSAmJiBsZW5ndGhPZldpdGhMaW1pdChvYmosIDEpID09PSAxO1xuICAgIH0sXG4gICAgbWF0Y2hPYmplY3Qob2JqKSB7XG4gICAgICBsZXQgbWF0Y2ggPSBmYWxzZTtcbiAgICAgIGlmIChvYmopIHtcbiAgICAgICAgY29uc3Qga2V5Q291bnQgPSBsZW5ndGhPZldpdGhMaW1pdChvYmosIDIpO1xuICAgICAgICBpZiAoa2V5Q291bnQgPT09IDEgfHwga2V5Q291bnQgPT09IDIpIHtcbiAgICAgICAgICBtYXRjaCA9IGJ1aWx0aW5Db252ZXJ0ZXJzLnNvbWUoKGNvbnZlcnRlcikgPT4gY29udmVydGVyLm1hdGNoSlNPTlZhbHVlKG9iaikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSxcbiAgICB0b0pTT05WYWx1ZShvYmopIHtcbiAgICAgIGNvbnN0IG5ld09iaiA9IHt9O1xuICAgICAga2V5c09mKG9iaikuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIG5ld09ialtrZXldID0gRUpTT04udG9KU09OVmFsdWUob2JqW2tleV0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4geyAkZXNjYXBlOiBuZXdPYmogfTtcbiAgICB9LFxuICAgIGZyb21KU09OVmFsdWUob2JqKSB7XG4gICAgICBjb25zdCBuZXdPYmogPSB7fTtcbiAgICAgIGtleXNPZihvYmouJGVzY2FwZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIG5ld09ialtrZXldID0gRUpTT04uZnJvbUpTT05WYWx1ZShvYmouJGVzY2FwZVtrZXldKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9LFxuICB9LFxuICB7XG4gICAgLy8gQ3VzdG9tXG4gICAgbWF0Y2hKU09OVmFsdWUob2JqKSB7XG4gICAgICByZXR1cm4gaGFzT3duKG9iaiwgXCIkdHlwZVwiKSAmJiBoYXNPd24ob2JqLCBcIiR2YWx1ZVwiKSAmJiBsZW5ndGhPZldpdGhMaW1pdChvYmosIDIpID09PSAyO1xuICAgIH0sXG4gICAgbWF0Y2hPYmplY3Qob2JqKSB7XG4gICAgICByZXR1cm4gRUpTT04uX2lzQ3VzdG9tVHlwZShvYmopO1xuICAgIH0sXG4gICAgdG9KU09OVmFsdWUob2JqKSB7XG4gICAgICBjb25zdCBqc29uVmFsdWUgPSBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCgoKSA9PiBvYmoudG9KU09OVmFsdWUoKSk7XG4gICAgICByZXR1cm4geyAkdHlwZTogb2JqLnR5cGVOYW1lKCksICR2YWx1ZToganNvblZhbHVlIH07XG4gICAgfSxcbiAgICBmcm9tSlNPTlZhbHVlKG9iaikge1xuICAgICAgY29uc3QgdHlwZU5hbWUgPSBvYmouJHR5cGU7XG4gICAgICBpZiAoIWN1c3RvbVR5cGVzLmhhcyh0eXBlTmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDdXN0b20gRUpTT04gdHlwZSAke3R5cGVOYW1lfSBpcyBub3QgZGVmaW5lZGApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29udmVydGVyID0gY3VzdG9tVHlwZXMuZ2V0KHR5cGVOYW1lKTtcbiAgICAgIHJldHVybiBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCgoKSA9PiBjb252ZXJ0ZXIob2JqLiR2YWx1ZSkpO1xuICAgIH0sXG4gIH0sXG5dO1xuXG5FSlNPTi5faXNDdXN0b21UeXBlID0gKG9iaikgPT5cbiAgb2JqICYmIGlzRnVuY3Rpb24ob2JqLnRvSlNPTlZhbHVlKSAmJiBpc0Z1bmN0aW9uKG9iai50eXBlTmFtZSkgJiYgY3VzdG9tVHlwZXMuaGFzKG9iai50eXBlTmFtZSgpKTtcblxuRUpTT04uX2dldFR5cGVzID0gKGlzT3JpZ2luYWwgPSBmYWxzZSkgPT5cbiAgaXNPcmlnaW5hbCA/IGN1c3RvbVR5cGVzIDogY29udmVydE1hcFRvT2JqZWN0KGN1c3RvbVR5cGVzKTtcblxuRUpTT04uX2dldENvbnZlcnRlcnMgPSAoKSA9PiBidWlsdGluQ29udmVydGVycztcblxuLy8gRWl0aGVyIHJldHVybiB0aGUgSlNPTi1jb21wYXRpYmxlIHZlcnNpb24gb2YgdGhlIGFyZ3VtZW50LCBvciB1bmRlZmluZWQgKGlmXG4vLyB0aGUgaXRlbSBpc24ndCBpdHNlbGYgcmVwbGFjZWFibGUsIGJ1dCBtYXliZSBzb21lIGZpZWxkcyBpbiBpdCBhcmUpXG5jb25zdCB0b0pTT05WYWx1ZUhlbHBlciA9IChpdGVtKSA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnVpbHRpbkNvbnZlcnRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSBidWlsdGluQ29udmVydGVyc1tpXTtcbiAgICBpZiAoY29udmVydGVyLm1hdGNoT2JqZWN0KGl0ZW0pKSB7XG4gICAgICByZXR1cm4gY29udmVydGVyLnRvSlNPTlZhbHVlKGl0ZW0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLy8gZm9yIGJvdGggYXJyYXlzIGFuZCBvYmplY3RzLCBpbi1wbGFjZSBtb2RpZmljYXRpb24uXG5jb25zdCBhZGp1c3RUeXBlc1RvSlNPTlZhbHVlID0gKG9iaikgPT4ge1xuICAvLyBJcyBpdCBhbiBhdG9tIHRoYXQgd2UgbmVlZCB0byBhZGp1c3Q/XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG1heWJlQ2hhbmdlZCA9IHRvSlNPTlZhbHVlSGVscGVyKG9iaik7XG4gIGlmIChtYXliZUNoYW5nZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBtYXliZUNoYW5nZWQ7XG4gIH1cblxuICAvLyBPdGhlciBhdG9tcyBhcmUgdW5jaGFuZ2VkLlxuICBpZiAoIWlzT2JqZWN0KG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IG9yIG9iamVjdCBzdHJ1Y3R1cmUuXG4gIGtleXNPZihvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgaWYgKCFpc09iamVjdCh2YWx1ZSkgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhaXNJbmZPck5hTih2YWx1ZSkpIHtcbiAgICAgIHJldHVybjsgLy8gY29udGludWVcbiAgICB9XG5cbiAgICBjb25zdCBjaGFuZ2VkID0gdG9KU09OVmFsdWVIZWxwZXIodmFsdWUpO1xuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICBvYmpba2V5XSA9IGNoYW5nZWQ7XG4gICAgICByZXR1cm47IC8vIG9uIHRvIHRoZSBuZXh0IGtleVxuICAgIH1cbiAgICAvLyBpZiB3ZSBnZXQgaGVyZSwgdmFsdWUgaXMgYW4gb2JqZWN0IGJ1dCBub3QgYWRqdXN0YWJsZVxuICAgIC8vIGF0IHRoaXMgbGV2ZWwuICByZWN1cnNlLlxuICAgIGFkanVzdFR5cGVzVG9KU09OVmFsdWUodmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn07XG5cbkVKU09OLl9hZGp1c3RUeXBlc1RvSlNPTlZhbHVlID0gYWRqdXN0VHlwZXNUb0pTT05WYWx1ZTtcblxuLy8gQ29weS1vbi13cml0ZSByZWN1cnNpdmUgRUpTT07ihpJKU09OIGNvbnZlcnRlci5cbi8vIE9ubHkgYWxsb2NhdGVzIG5ldyBvYmplY3RzL2FycmF5cyBhbG9uZyBwYXRocyB0aGF0IGFjdHVhbGx5IGNoYW5nZSxcbi8vIHJldHVybmluZyB0aGUgb3JpZ2luYWwgcmVmZXJlbmNlIHdoZW4gbm90aGluZyBuZWVkcyBjb252ZXJzaW9uLlxuY29uc3QgdG9KU09OVmFsdWVEZWVwID0gKHZhbHVlKSA9PiB7XG4gIC8vIFNob3J0LWNpcmN1aXQgZm9yIHByaW1pdGl2ZXMgdGhhdCB0b0pTT05WYWx1ZUhlbHBlciBjYW4gbmV2ZXIgbWF0Y2guXG4gIGlmIChcbiAgICB2YWx1ZSA9PT0gbnVsbCB8fFxuICAgIHZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8XG4gICAgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiAmJiAhaXNJbmZPck5hTih2YWx1ZSkpXG4gICkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8vIEFycmF5cyBjYW4ndCBiZSBFSlNPTiBhdG9tcywgc28gcHJvY2VzcyB0aGVtIGRpcmVjdGx5LlxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHZhbHVlW2ldO1xuICAgICAgY29uc3QgY29udmVydGVkID0gdG9KU09OVmFsdWVEZWVwKGNoaWxkKTtcbiAgICAgIGlmIChjb252ZXJ0ZWQgIT09IGNoaWxkKSB7XG4gICAgICAgIHJlc3VsdCA/Pz0gdmFsdWUuc2xpY2UoMCwgaSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvbnZlcnRlZCk7XG4gICAgICB9IGVsc2UgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICByZXN1bHQucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgPz8gdmFsdWU7XG4gIH1cblxuICAvLyBBdG9tLWxldmVsIGNvbnZlcnNpb24gKERhdGUsIEJpbmFyeSwgTmFOL0luZiwgY3VzdG9tIHR5cGVzLCBldGMuKVxuICBjb25zdCByZXBsYWNlZCA9IHRvSlNPTlZhbHVlSGVscGVyKHZhbHVlKTtcbiAgaWYgKHJlcGxhY2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcmVwbGFjZWQ7XG4gIH1cblxuICAvLyBQbGFpbiBvYmplY3Q6IGNvcHktb24td3JpdGVcbiAgY29uc3Qga2V5cyA9IGtleXNPZih2YWx1ZSk7XG4gIGxldCByZXN1bHQgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgIGNvbnN0IGNoaWxkID0gdmFsdWVba2V5XTtcbiAgICBjb25zdCBjb252ZXJ0ZWQgPSB0b0pTT05WYWx1ZURlZXAoY2hpbGQpO1xuICAgIGlmIChjb252ZXJ0ZWQgIT09IGNoaWxkKSB7XG4gICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAvLyBiYWNrZmlsbCBwcmVjZWRpbmcga2V5c1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGk7IGorKykge1xuICAgICAgICAgIHJlc3VsdFtrZXlzW2pdXSA9IHZhbHVlW2tleXNbal1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRba2V5XSA9IGNvbnZlcnRlZDtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgcmVzdWx0W2tleV0gPSBjaGlsZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0ID8/IHZhbHVlO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBTZXJpYWxpemUgYW4gRUpTT04tY29tcGF0aWJsZSB2YWx1ZSBpbnRvIGl0cyBwbGFpbiBKU09OXG4gKiAgICAgICAgICByZXByZXNlbnRhdGlvbi5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtFSlNPTn0gdmFsIEEgdmFsdWUgdG8gc2VyaWFsaXplIHRvIHBsYWluIEpTT04uXG4gKi9cbkVKU09OLnRvSlNPTlZhbHVlID0gKGl0ZW0pID0+IHRvSlNPTlZhbHVlRGVlcChpdGVtKTtcblxuLy8gRWl0aGVyIHJldHVybiB0aGUgYXJndW1lbnQgY2hhbmdlZCB0byBoYXZlIHRoZSBub24tanNvblxuLy8gcmVwIG9mIGl0c2VsZiAodGhlIE9iamVjdCB2ZXJzaW9uKSBvciB0aGUgYXJndW1lbnQgaXRzZWxmLlxuLy8gRE9FUyBOT1QgUkVDVVJTRS4gIEZvciBhY3R1YWxseSBnZXR0aW5nIHRoZSBmdWxseS1jaGFuZ2VkIHZhbHVlLCB1c2Vcbi8vIEVKU09OLmZyb21KU09OVmFsdWVcbmNvbnN0IGZyb21KU09OVmFsdWVIZWxwZXIgPSAodmFsdWUpID0+IHtcbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGtleXMgPSBrZXlzT2YodmFsdWUpO1xuICAgIGlmIChrZXlzLmxlbmd0aCA8PSAyICYmIGtleXMuZXZlcnkoKGspID0+IHR5cGVvZiBrID09PSBcInN0cmluZ1wiICYmIGsuc3Vic3RyKDAsIDEpID09PSBcIiRcIikpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVpbHRpbkNvbnZlcnRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY29udmVydGVyID0gYnVpbHRpbkNvbnZlcnRlcnNbaV07XG4gICAgICAgIGlmIChjb252ZXJ0ZXIubWF0Y2hKU09OVmFsdWUodmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnZlcnRlci5mcm9tSlNPTlZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vLyBmb3IgYm90aCBhcnJheXMgYW5kIG9iamVjdHMuIFRyaWVzIGl0cyBiZXN0IHRvIGp1c3Rcbi8vIHVzZSB0aGUgb2JqZWN0IHlvdSBoYW5kIGl0LCBidXQgbWF5IHJldHVybiBzb21ldGhpbmdcbi8vIGRpZmZlcmVudCBpZiB0aGUgb2JqZWN0IHlvdSBoYW5kIGl0IGl0c2VsZiBuZWVkcyBjaGFuZ2luZy5cbmNvbnN0IGFkanVzdFR5cGVzRnJvbUpTT05WYWx1ZSA9IChvYmopID0+IHtcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbWF5YmVDaGFuZ2VkID0gZnJvbUpTT05WYWx1ZUhlbHBlcihvYmopO1xuICBpZiAobWF5YmVDaGFuZ2VkICE9PSBvYmopIHtcbiAgICByZXR1cm4gbWF5YmVDaGFuZ2VkO1xuICB9XG5cbiAgLy8gT3RoZXIgYXRvbXMgYXJlIHVuY2hhbmdlZC5cbiAgaWYgKCFpc09iamVjdChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIGtleXNPZihvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgY29uc3QgY2hhbmdlZCA9IGZyb21KU09OVmFsdWVIZWxwZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBjaGFuZ2VkKSB7XG4gICAgICAgIG9ialtrZXldID0gY2hhbmdlZDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaWYgd2UgZ2V0IGhlcmUsIHZhbHVlIGlzIGFuIG9iamVjdCBidXQgbm90IGFkanVzdGFibGVcbiAgICAgIC8vIGF0IHRoaXMgbGV2ZWwuICByZWN1cnNlLlxuICAgICAgYWRqdXN0VHlwZXNGcm9tSlNPTlZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuRUpTT04uX2FkanVzdFR5cGVzRnJvbUpTT05WYWx1ZSA9IGFkanVzdFR5cGVzRnJvbUpTT05WYWx1ZTtcblxuLy8gQ29weS1vbi13cml0ZSByZWN1cnNpdmUgSlNPTuKGkkVKU09OIGNvbnZlcnRlci5cbi8vIFNhbWUgbGF6eS1hbGxvY2F0aW9uIHN0cmF0ZWd5IGFzIHRvSlNPTlZhbHVlRGVlcC5cbmNvbnN0IGZyb21KU09OVmFsdWVEZWVwID0gKHZhbHVlKSA9PiB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvLyBBcnJheXMgY2FuJ3QgYmUgRUpTT04tZW5jb2RlZCB0eXBlcywgc28gcHJvY2VzcyB0aGVtIGRpcmVjdGx5LlxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHZhbHVlW2ldO1xuICAgICAgY29uc3QgY29udmVydGVkID0gZnJvbUpTT05WYWx1ZURlZXAoY2hpbGQpO1xuICAgICAgaWYgKGNvbnZlcnRlZCAhPT0gY2hpbGQpIHtcbiAgICAgICAgcmVzdWx0ID8/PSB2YWx1ZS5zbGljZSgwLCBpKTtcbiAgICAgICAgcmVzdWx0LnB1c2goY29udmVydGVkKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCA/PyB2YWx1ZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHRoaXMgdmFsdWUgaXRzZWxmIGlzIGEgSlNPTi1lbmNvZGVkIEVKU09OIHR5cGUgKGUuZy4geyRkYXRlOiAuLi59KVxuICBjb25zdCByZXBsYWNlZCA9IGZyb21KU09OVmFsdWVIZWxwZXIodmFsdWUpO1xuICBpZiAocmVwbGFjZWQgIT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VkO1xuICB9XG5cbiAgY29uc3Qga2V5cyA9IGtleXNPZih2YWx1ZSk7XG4gIGxldCByZXN1bHQgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgIGNvbnN0IGNoaWxkID0gdmFsdWVba2V5XTtcbiAgICBjb25zdCBjb252ZXJ0ZWQgPSBmcm9tSlNPTlZhbHVlRGVlcChjaGlsZCk7XG4gICAgaWYgKGNvbnZlcnRlZCAhPT0gY2hpbGQpIHtcbiAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgaTsgaisrKSB7XG4gICAgICAgICAgcmVzdWx0W2tleXNbal1dID0gdmFsdWVba2V5c1tqXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdFtrZXldID0gY29udmVydGVkO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICByZXN1bHRba2V5XSA9IGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQgPz8gdmFsdWU7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IERlc2VyaWFsaXplIGFuIEVKU09OIHZhbHVlIGZyb20gaXRzIHBsYWluIEpTT04gcmVwcmVzZW50YXRpb24uXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBwYXJhbSB7SlNPTkNvbXBhdGlibGV9IHZhbCBBIHZhbHVlIHRvIGRlc2VyaWFsaXplIGludG8gRUpTT04uXG4gKi9cbkVKU09OLmZyb21KU09OVmFsdWUgPSAoaXRlbSkgPT4gZnJvbUpTT05WYWx1ZURlZXAoaXRlbSk7XG5cbi8qKlxuICogQHN1bW1hcnkgU2VyaWFsaXplIGEgdmFsdWUgdG8gYSBzdHJpbmcuIEZvciBFSlNPTiB2YWx1ZXMsIHRoZSBzZXJpYWxpemF0aW9uXG4gKiAgICAgICAgICBmdWxseSByZXByZXNlbnRzIHRoZSB2YWx1ZS4gRm9yIG5vbi1FSlNPTiB2YWx1ZXMsIHNlcmlhbGl6ZXMgdGhlXG4gKiAgICAgICAgICBzYW1lIHdheSBhcyBgSlNPTi5zdHJpbmdpZnlgLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAcGFyYW0ge0VKU09OfSB2YWwgQSB2YWx1ZSB0byBzdHJpbmdpZnkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge0Jvb2xlYW4gfCBJbnRlZ2VyIHwgU3RyaW5nfSBbb3B0aW9ucy5pbmRlbnRdIEluZGVudHMgb2JqZWN0cyBhbmRcbiAqIGFycmF5cyBmb3IgZWFzeSByZWFkYWJpbGl0eS4gIFdoZW4gYHRydWVgLCBpbmRlbnRzIGJ5IDIgc3BhY2VzOyB3aGVuIGFuXG4gKiBpbnRlZ2VyLCBpbmRlbnRzIGJ5IHRoYXQgbnVtYmVyIG9mIHNwYWNlczsgYW5kIHdoZW4gYSBzdHJpbmcsIHVzZXMgdGhlXG4gKiBzdHJpbmcgYXMgdGhlIGluZGVudGF0aW9uIHBhdHRlcm4uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmNhbm9uaWNhbF0gV2hlbiBgdHJ1ZWAsIHN0cmluZ2lmaWVzIGtleXMgaW4gYW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0IGluIHNvcnRlZCBvcmRlci5cbiAqL1xuRUpTT04uc3RyaW5naWZ5ID0gaGFuZGxlRXJyb3IoKGl0ZW0sIG9wdGlvbnMpID0+IHtcbiAgbGV0IHNlcmlhbGl6ZWQ7XG4gIGNvbnN0IGpzb24gPSBFSlNPTi50b0pTT05WYWx1ZShpdGVtKTtcbiAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMuY2Fub25pY2FsIHx8IG9wdGlvbnMuaW5kZW50KSkge1xuICAgIHNlcmlhbGl6ZWQgPSBjYW5vbmljYWxTdHJpbmdpZnkoanNvbiwgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KGpzb24pO1xuICB9XG4gIHJldHVybiBzZXJpYWxpemVkO1xufSk7XG5cbi8qKlxuICogQHN1bW1hcnkgUGFyc2UgYSBzdHJpbmcgaW50byBhbiBFSlNPTiB2YWx1ZS4gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBzdHJpbmdcbiAqICAgICAgICAgIGlzIG5vdCB2YWxpZCBFSlNPTi5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBBIHN0cmluZyB0byBwYXJzZSBpbnRvIGFuIEVKU09OIHZhbHVlLlxuICovXG5FSlNPTi5wYXJzZSA9IChpdGVtKSA9PiB7XG4gIGlmICh0eXBlb2YgaXRlbSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkVKU09OLnBhcnNlIGFyZ3VtZW50IHNob3VsZCBiZSBhIHN0cmluZ1wiKTtcbiAgfVxuICByZXR1cm4gRUpTT04uZnJvbUpTT05WYWx1ZShKU09OLnBhcnNlKGl0ZW0pKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmV0dXJucyB0cnVlIGlmIGB4YCBpcyBhIGJ1ZmZlciBvZiBiaW5hcnkgZGF0YSwgYXMgcmV0dXJuZWQgZnJvbVxuICogICAgICAgICAgW2BFSlNPTi5uZXdCaW5hcnlgXSgjZWpzb25fbmV3X2JpbmFyeSkuXG4gKiBAcGFyYW0ge09iamVjdH0geCBUaGUgdmFyaWFibGUgdG8gY2hlY2suXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqL1xuRUpTT04uaXNCaW5hcnkgPSAob2JqKSA9PiB7XG4gIHJldHVybiAhIShcbiAgICAodHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqIGluc3RhbmNlb2YgVWludDhBcnJheSkgfHxcbiAgICAob2JqICYmIG9iai4kVWludDhBcnJheVBvbHlmaWxsKVxuICApO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZXR1cm4gdHJ1ZSBpZiBgYWAgYW5kIGBiYCBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlci4gIFJldHVybiBmYWxzZVxuICogICAgICAgICAgb3RoZXJ3aXNlLiAgVXNlcyB0aGUgYGVxdWFsc2AgbWV0aG9kIG9uIGBhYCBpZiBwcmVzZW50LCBvdGhlcndpc2VcbiAqICAgICAgICAgIHBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAcGFyYW0ge0VKU09OfSBhXG4gKiBAcGFyYW0ge0VKU09OfSBiXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMua2V5T3JkZXJTZW5zaXRpdmUgQ29tcGFyZSBpbiBrZXkgc2Vuc2l0aXZlIG9yZGVyLFxuICogaWYgc3VwcG9ydGVkIGJ5IHRoZSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uLiAgRm9yIGV4YW1wbGUsIGB7YTogMSwgYjogMn1gXG4gKiBpcyBlcXVhbCB0byBge2I6IDIsIGE6IDF9YCBvbmx5IHdoZW4gYGtleU9yZGVyU2Vuc2l0aXZlYCBpcyBgZmFsc2VgLiAgVGhlXG4gKiBkZWZhdWx0IGlzIGBmYWxzZWAuXG4gKi9cbkVKU09OLmVxdWFscyA9IChhLCBiLCBvcHRpb25zKSA9PiB7XG4gIGxldCBpO1xuICBjb25zdCBrZXlPcmRlclNlbnNpdGl2ZSA9ICEhKG9wdGlvbnMgJiYgb3B0aW9ucy5rZXlPcmRlclNlbnNpdGl2ZSk7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJZiB0eXBlcyBkaWZmZXIsIHRoZXkgY2FuJ3QgYmUgZXF1YWwuXG4gIC8vIFRoaXMgYWxzbyBoYW5kbGVzIG1peGVkIG51bGwvcHJpbWl0aXZlIGNhc2VzIHNpbmNlIHR5cGVvZiBudWxsIGlzICdvYmplY3QnLlxuICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gU2FtZS10eXBlIHByaW1pdGl2ZXMgdGhhdCBhcmVuJ3QgPT09IGNhbiBvbmx5IGJlIGVxdWFsIGlmIGJvdGggYXJlIE5hTi5cbiAgLy8gVGhpcyBza2lwcyB0aGUgTmFOIGNoZWNrIGVudGlyZWx5IGZvciBzdHJpbmdzLCBib29sZWFucywgZXRjLlxuICBpZiAodHlwZW9mIGEgIT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGEpICYmIE51bWJlci5pc05hTihiKTtcbiAgfVxuXG4gIC8vIEJvdGggYXJlIHR5cGVvZiAnb2JqZWN0JyDigJQgYnV0IGVpdGhlciBjb3VsZCBiZSBudWxsLlxuICAvLyAoSWYgYm90aCB3ZXJlIG51bGwsIGEgPT09IGIgd291bGQgaGF2ZSBjYXVnaHQgaXQgYWJvdmUuKVxuICBpZiAoYSA9PT0gbnVsbCB8fCBiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGEgaW5zdGFuY2VvZiBEYXRlICYmIGIgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGEudmFsdWVPZigpID09PSBiLnZhbHVlT2YoKTtcbiAgfVxuXG4gIGlmIChFSlNPTi5pc0JpbmFyeShhKSAmJiBFSlNPTi5pc0JpbmFyeShiKSkge1xuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoaXNGdW5jdGlvbihhLmVxdWFscykpIHtcbiAgICByZXR1cm4gYS5lcXVhbHMoYiwgb3B0aW9ucyk7XG4gIH1cblxuICBpZiAoaXNGdW5jdGlvbihiLmVxdWFscykpIHtcbiAgICByZXR1cm4gYi5lcXVhbHMoYSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBBcnJheS5pc0FycmF5IHdvcmtzIGFjcm9zcyBpZnJhbWVzIHdoaWxlIGluc3RhbmNlb2Ygd29uJ3RcbiAgY29uc3QgYUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGEpO1xuICBjb25zdCBiSXNBcnJheSA9IEFycmF5LmlzQXJyYXkoYik7XG5cbiAgLy8gaWYgbm90IGJvdGggb3Igbm9uZSBhcmUgYXJyYXkgdGhleSBhcmUgbm90IGVxdWFsXG4gIGlmIChhSXNBcnJheSAhPT0gYklzQXJyYXkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoYUlzQXJyYXkgJiYgYklzQXJyYXkpIHtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIUVKU09OLmVxdWFscyhhW2ldLCBiW2ldLCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gZmFsbGJhY2sgZm9yIGN1c3RvbSB0eXBlcyB0aGF0IGRvbid0IGltcGxlbWVudCB0aGVpciBvd24gZXF1YWxzXG4gIHN3aXRjaCAoRUpTT04uX2lzQ3VzdG9tVHlwZShhKSArIEVKU09OLl9pc0N1c3RvbVR5cGUoYikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIEVKU09OLmVxdWFscyhFSlNPTi50b0pTT05WYWx1ZShhKSwgRUpTT04udG9KU09OVmFsdWUoYikpO1xuICAgIGRlZmF1bHQ6IC8vIERvIG5vdGhpbmdcbiAgfVxuXG4gIC8vIGZhbGwgYmFjayB0byBzdHJ1Y3R1cmFsIGVxdWFsaXR5IG9mIG9iamVjdHNcbiAgbGV0IHJldDtcbiAgY29uc3QgYUtleXMgPSBrZXlzT2YoYSk7XG4gIGNvbnN0IGJLZXlzID0ga2V5c09mKGIpO1xuICBpZiAoYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGtleU9yZGVyU2Vuc2l0aXZlKSB7XG4gICAgaSA9IDA7XG4gICAgcmV0ID0gYUtleXMuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgaWYgKGkgPj0gYktleXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgIT09IGJLZXlzW2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghRUpTT04uZXF1YWxzKGFba2V5XSwgYltiS2V5c1tpXV0sIG9wdGlvbnMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGkgPSAwO1xuICAgIHJldCA9IGFLZXlzLmV2ZXJ5KChrZXkpID0+IHtcbiAgICAgIGlmICghaGFzT3duKGIsIGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCFFSlNPTi5lcXVhbHMoYVtrZXldLCBiW2tleV0sIG9wdGlvbnMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXQgJiYgaSA9PT0gYktleXMubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZXR1cm4gYSBkZWVwIGNvcHkgb2YgYHZhbGAuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBwYXJhbSB7RUpTT059IHZhbCBBIHZhbHVlIHRvIGNvcHkuXG4gKi9cbkVKU09OLmNsb25lID0gKHYpID0+IHtcbiAgbGV0IHJldDtcbiAgaWYgKCFpc09iamVjdCh2KSkge1xuICAgIHJldHVybiB2O1xuICB9XG5cbiAgaWYgKHYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gbnVsbCBoYXMgdHlwZW9mIFwib2JqZWN0XCJcbiAgfVxuXG4gIGlmICh2IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh2LmdldFRpbWUoKSk7XG4gIH1cblxuICAvLyBSZWdFeHBzIGFyZSBub3QgcmVhbGx5IEVKU09OIGVsZW1lbnRzIChlZyB3ZSBkb24ndCBkZWZpbmUgYSBzZXJpYWxpemF0aW9uXG4gIC8vIGZvciB0aGVtKSwgYnV0IHRoZXkncmUgaW1tdXRhYmxlIGFueXdheSwgc28gd2UgY2FuIHN1cHBvcnQgdGhlbSBpbiBjbG9uZS5cbiAgaWYgKHYgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gdjtcbiAgfVxuXG4gIGlmIChFSlNPTi5pc0JpbmFyeSh2KSkge1xuICAgIHJldCA9IEVKU09OLm5ld0JpbmFyeSh2Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2Lmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXRbaV0gPSB2W2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICByZXR1cm4gdi5tYXAoRUpTT04uY2xvbmUpO1xuICB9XG5cbiAgaWYgKGlzQXJndW1lbnRzKHYpKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odikubWFwKEVKU09OLmNsb25lKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBnZW5lcmFsIHVzZXItZGVmaW5lZCB0eXBlZCBPYmplY3RzIGlmIHRoZXkgaGF2ZSBhIGNsb25lIG1ldGhvZFxuICBpZiAoaXNGdW5jdGlvbih2LmNsb25lKSkge1xuICAgIHJldHVybiB2LmNsb25lKCk7XG4gIH1cblxuICAvLyBoYW5kbGUgb3RoZXIgY3VzdG9tIHR5cGVzXG4gIGlmIChFSlNPTi5faXNDdXN0b21UeXBlKHYpKSB7XG4gICAgcmV0dXJuIEVKU09OLmZyb21KU09OVmFsdWUoRUpTT04uY2xvbmUoRUpTT04udG9KU09OVmFsdWUodikpLCB0cnVlKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBvdGhlciBvYmplY3RzXG4gIHJldCA9IHt9O1xuICBrZXlzT2YodikuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgcmV0W2tleV0gPSBFSlNPTi5jbG9uZSh2W2tleV0pO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQWxsb2NhdGUgYSBuZXcgYnVmZmVyIG9mIGJpbmFyeSBkYXRhIHRoYXQgRUpTT04gY2FuIHNlcmlhbGl6ZS5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgVGhlIG51bWJlciBvZiBieXRlcyBvZiBiaW5hcnkgZGF0YSB0byBhbGxvY2F0ZS5cbiAqL1xuLy8gRUpTT04ubmV3QmluYXJ5IGlzIHRoZSBwdWJsaWMgZG9jdW1lbnRlZCBBUEkgZm9yIHRoaXMgZnVuY3Rpb25hbGl0eSxcbi8vIGJ1dCB0aGUgaW1wbGVtZW50YXRpb24gaXMgaW4gdGhlICdiYXNlNjQnIHBhY2thZ2UgdG8gYXZvaWRcbi8vIGludHJvZHVjaW5nIGEgY2lyY3VsYXIgZGVwZW5kZW5jeS4gKElmIHRoZSBpbXBsZW1lbnRhdGlvbiB3ZXJlIGhlcmUsXG4vLyB0aGVuICdiYXNlNjQnIHdvdWxkIGhhdmUgdG8gdXNlIEVKU09OLm5ld0JpbmFyeSwgYW5kICdlanNvbicgd291bGRcbi8vIGFsc28gaGF2ZSB0byB1c2UgJ2Jhc2U2NCcuKVxuRUpTT04ubmV3QmluYXJ5ID0gQmFzZTY0Lm5ld0JpbmFyeTtcblxuZXhwb3J0IHsgRUpTT04gfTtcbiIsIi8vIEJhc2VkIG9uIGpzb24yLmpzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RvdWdsYXNjcm9ja2ZvcmQvSlNPTi1qc1xuLy9cbi8vICAgIGpzb24yLmpzXG4vLyAgICAyMDEyLTEwLTA4XG4vL1xuLy8gICAgUHVibGljIERvbWFpbi5cbi8vXG4vLyAgICBOTyBXQVJSQU5UWSBFWFBSRVNTRUQgT1IgSU1QTElFRC4gVVNFIEFUIFlPVVIgT1dOIFJJU0suXG5cbmZ1bmN0aW9uIHF1b3RlKHN0cmluZykge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3RyaW5nKTtcbn1cblxuY29uc3Qgc3RyID0gKGtleSwgaG9sZGVyLCBzaW5nbGVJbmRlbnQsIG91dGVySW5kZW50LCBjYW5vbmljYWwpID0+IHtcbiAgY29uc3QgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuICAvLyBXaGF0IGhhcHBlbnMgbmV4dCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSdzIHR5cGUuXG4gIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgcmV0dXJuIHF1b3RlKHZhbHVlKTtcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAvLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIEVuY29kZSBub24tZmluaXRlIG51bWJlcnMgYXMgbnVsbC5cbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgPyBTdHJpbmcodmFsdWUpIDogXCJudWxsXCI7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIC8vIElmIHRoZSB0eXBlIGlzICdvYmplY3QnLCB3ZSBtaWdodCBiZSBkZWFsaW5nIHdpdGggYW4gb2JqZWN0IG9yIGFuIGFycmF5IG9yXG4gICAgLy8gbnVsbC5cbiAgICBjYXNlIFwib2JqZWN0XCI6IHtcbiAgICAgIC8vIER1ZSB0byBhIHNwZWNpZmljYXRpb24gYmx1bmRlciBpbiBFQ01BU2NyaXB0LCB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0JyxcbiAgICAgIC8vIHNvIHdhdGNoIG91dCBmb3IgdGhhdCBjYXNlLlxuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICB9XG4gICAgICAvLyBNYWtlIGFuIGFycmF5IHRvIGhvbGQgdGhlIHBhcnRpYWwgcmVzdWx0cyBvZiBzdHJpbmdpZnlpbmcgdGhpcyBvYmplY3RcbiAgICAgIC8vIHZhbHVlLlxuICAgICAgY29uc3QgaW5uZXJJbmRlbnQgPSBvdXRlckluZGVudCArIHNpbmdsZUluZGVudDtcbiAgICAgIGNvbnN0IHBhcnRpYWwgPSBbXTtcbiAgICAgIGxldCB2O1xuXG4gICAgICAvLyBJcyB0aGUgdmFsdWUgYW4gYXJyYXk/XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwge30uaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJjYWxsZWVcIikpIHtcbiAgICAgICAgLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYVxuICAgICAgICAvLyBwbGFjZWhvbGRlciBmb3Igbm9uLUpTT04gdmFsdWVzLlxuICAgICAgICBjb25zdCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBwYXJ0aWFsW2ldID0gc3RyKGksIHZhbHVlLCBzaW5nbGVJbmRlbnQsIGlubmVySW5kZW50LCBjYW5vbmljYWwpIHx8IFwibnVsbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSm9pbiBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsIGFuZCB3cmFwXG4gICAgICAgIC8vIHRoZW0gaW4gYnJhY2tldHMuXG4gICAgICAgIGlmIChwYXJ0aWFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHYgPSBcIltdXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5uZXJJbmRlbnQpIHtcbiAgICAgICAgICB2ID0gYFtcXG4ke2lubmVySW5kZW50fSR7cGFydGlhbC5qb2luKGAsXFxuJHtpbm5lckluZGVudH1gKX1cXG4ke291dGVySW5kZW50fV1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHYgPSBgWyR7cGFydGlhbC5qb2luKFwiLFwiKX1dYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cblxuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gICAgICBpZiAoY2Fub25pY2FsKSB7XG4gICAgICAgIGtleXMgPSBrZXlzLnNvcnQoKTtcbiAgICAgIH1cbiAgICAgIGtleXMuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICB2ID0gc3RyKGssIHZhbHVlLCBzaW5nbGVJbmRlbnQsIGlubmVySW5kZW50LCBjYW5vbmljYWwpO1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChpbm5lckluZGVudCA/IFwiOiBcIiA6IFwiOlwiKSArIHYpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuICAgICAgLy8gYW5kIHdyYXAgdGhlbSBpbiBicmFjZXMuXG4gICAgICBpZiAocGFydGlhbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdiA9IFwie31cIjtcbiAgICAgIH0gZWxzZSBpZiAoaW5uZXJJbmRlbnQpIHtcbiAgICAgICAgdiA9IGB7XFxuJHtpbm5lckluZGVudH0ke3BhcnRpYWwuam9pbihgLFxcbiR7aW5uZXJJbmRlbnR9YCl9XFxuJHtvdXRlckluZGVudH19YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHYgPSBgeyR7cGFydGlhbC5qb2luKFwiLFwiKX19YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIGRlZmF1bHQ6IC8vIERvIG5vdGhpbmdcbiAgfVxufTtcblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgc3RyaW5naWZ5IG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5jb25zdCBjYW5vbmljYWxTdHJpbmdpZnkgPSAodmFsdWUsIG9wdGlvbnMpID0+IHtcbiAgLy8gTWFrZSBhIGZha2Ugcm9vdCBvYmplY3QgY29udGFpbmluZyBvdXIgdmFsdWUgdW5kZXIgdGhlIGtleSBvZiAnJy5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cbiAgY29uc3QgYWxsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge1xuICAgICAgaW5kZW50OiBcIlwiLFxuICAgICAgY2Fub25pY2FsOiBmYWxzZSxcbiAgICB9LFxuICAgIG9wdGlvbnMsXG4gICk7XG4gIGlmIChhbGxPcHRpb25zLmluZGVudCA9PT0gdHJ1ZSkge1xuICAgIGFsbE9wdGlvbnMuaW5kZW50ID0gXCIgIFwiO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBhbGxPcHRpb25zLmluZGVudCA9PT0gXCJudW1iZXJcIikge1xuICAgIGxldCBuZXdJbmRlbnQgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsT3B0aW9ucy5pbmRlbnQ7IGkrKykge1xuICAgICAgbmV3SW5kZW50ICs9IFwiIFwiO1xuICAgIH1cbiAgICBhbGxPcHRpb25zLmluZGVudCA9IG5ld0luZGVudDtcbiAgfVxuICByZXR1cm4gc3RyKFwiXCIsIHsgXCJcIjogdmFsdWUgfSwgYWxsT3B0aW9ucy5pbmRlbnQsIFwiXCIsIGFsbE9wdGlvbnMuY2Fub25pY2FsKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNhbm9uaWNhbFN0cmluZ2lmeTtcbiIsImV4cG9ydCBjb25zdCBpc0Z1bmN0aW9uID0gKGZuKSA9PiB0eXBlb2YgZm4gPT09IFwiZnVuY3Rpb25cIjtcblxuZXhwb3J0IGNvbnN0IGlzT2JqZWN0ID0gKGZuKSA9PiB0eXBlb2YgZm4gPT09IFwib2JqZWN0XCI7XG5cbmV4cG9ydCBjb25zdCBrZXlzT2YgPSAob2JqKSA9PiBPYmplY3Qua2V5cyhvYmopO1xuXG5leHBvcnQgY29uc3QgbGVuZ3RoT2YgPSAob2JqKSA9PiB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24ob2JqLCBrZXkpKSBjb3VudCsrO1xuICB9XG4gIHJldHVybiBjb3VudDtcbn07XG5cbi8qKlxuICogQ291bnRzIG93biBwcm9wZXJ0aWVzIG9mIG9iaiwgYnV0IHN0b3BzIGVhcmx5IG9uY2UgY291bnQgZXhjZWVkcyBsaW1pdC5cbiAqIFVzZWZ1bCBmb3IgaG90LXBhdGggY2hlY2tzIGxpa2UgYGxlbmd0aE9mV2l0aExpbWl0KG9iaiwgMSkgPT09IDFgXG4gKiB3aXRob3V0IGl0ZXJhdGluZyBhbGwga2V5cyBvZiBsYXJnZSBvYmplY3RzLlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gc3RvcCBjb3VudGluZyBiZXlvbmQgdGhpcyB2YWx1ZVxuICogQHJldHVybnMge251bWJlcn0gZXhhY3QgY291bnQgaWYgPD0gbGltaXQsIG90aGVyd2lzZSBsaW1pdCArIDFcbiAqL1xuZXhwb3J0IGNvbnN0IGxlbmd0aE9mV2l0aExpbWl0ID0gKG9iaiwgbGltaXQpID0+IHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bihvYmosIGtleSkgJiYgKytjb3VudCA+IGxpbWl0KSByZXR1cm4gY291bnQ7XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc093biA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xuXG5leHBvcnQgY29uc3QgY29udmVydE1hcFRvT2JqZWN0ID0gKG1hcCkgPT5cbiAgQXJyYXkuZnJvbShtYXApLnJlZHVjZSgoYWNjLCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAvLyByZWFzc2lnbiB0byBub3QgY3JlYXRlIG5ldyBvYmplY3RcbiAgICBhY2Nba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcblxuZXhwb3J0IGNvbnN0IGlzQXJndW1lbnRzID0gKG9iaikgPT4gb2JqICE9IG51bGwgJiYgaGFzT3duKG9iaiwgXCJjYWxsZWVcIik7XG5cbmV4cG9ydCBjb25zdCBpc0luZk9yTmFOID0gKG9iaikgPT4gTnVtYmVyLmlzTmFOKG9iaikgfHwgb2JqID09PSBJbmZpbml0eSB8fCBvYmogPT09IC1JbmZpbml0eTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrRXJyb3IgPSB7XG4gIG1heFN0YWNrOiAobXNnRXJyb3IpID0+IG5ldyBSZWdFeHAoXCJNYXhpbXVtIGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLCBcImdcIikudGVzdChtc2dFcnJvciksXG59O1xuXG5leHBvcnQgY29uc3QgaGFuZGxlRXJyb3IgPSAoZm4pID0+XG4gIGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGlzTWF4U3RhY2sgPSBjaGVja0Vycm9yLm1heFN0YWNrKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgaWYgKGlzTWF4U3RhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29udmVydGluZyBjaXJjdWxhciBzdHJ1Y3R1cmUgdG8gSlNPTlwiKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfTtcbiJdfQ==
