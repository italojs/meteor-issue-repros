Package["core-runtime"].queue("htmljs",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var HTML;

var require = meteorInstall({"node_modules":{"meteor":{"htmljs":{"preamble.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/htmljs/preamble.js                                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({HTML:()=>HTML},true);let HTMLTags,Tag,Attrs,getTag,ensureTag,isTagEnsured,getSymbolName,knownHTMLElementNames,knownSVGElementNames,knownElementNames,voidElementNames,isKnownElement,isKnownSVGElement,isVoidElement,CharRef,Comment,Raw,isArray,isConstructedObject,isNully,isValidAttributeName,flattenAttributes;module.link('./html',{HTMLTags(v){HTMLTags=v},Tag(v){Tag=v},Attrs(v){Attrs=v},getTag(v){getTag=v},ensureTag(v){ensureTag=v},isTagEnsured(v){isTagEnsured=v},getSymbolName(v){getSymbolName=v},knownHTMLElementNames(v){knownHTMLElementNames=v},knownSVGElementNames(v){knownSVGElementNames=v},knownElementNames(v){knownElementNames=v},voidElementNames(v){voidElementNames=v},isKnownElement(v){isKnownElement=v},isKnownSVGElement(v){isKnownSVGElement=v},isVoidElement(v){isVoidElement=v},CharRef(v){CharRef=v},Comment(v){Comment=v},Raw(v){Raw=v},isArray(v){isArray=v},isConstructedObject(v){isConstructedObject=v},isNully(v){isNully=v},isValidAttributeName(v){isValidAttributeName=v},flattenAttributes(v){flattenAttributes=v}},0);let Visitor,TransformingVisitor,ToHTMLVisitor,ToTextVisitor,toHTML,TEXTMODE,toText;module.link('./visitors',{Visitor(v){Visitor=v},TransformingVisitor(v){TransformingVisitor=v},ToHTMLVisitor(v){ToHTMLVisitor=v},ToTextVisitor(v){ToTextVisitor=v},toHTML(v){toHTML=v},TEXTMODE(v){TEXTMODE=v},toText(v){toText=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

// we're actually exporting the HTMLTags object.
//  because it is dynamically altered by getTag/ensureTag
const HTML = Object.assign(HTMLTags, {
    Tag,
    Attrs,
    getTag,
    ensureTag,
    isTagEnsured,
    getSymbolName,
    knownHTMLElementNames,
    knownSVGElementNames,
    knownElementNames,
    voidElementNames,
    isKnownElement,
    isKnownSVGElement,
    isVoidElement,
    CharRef,
    Comment,
    Raw,
    isArray,
    isConstructedObject,
    isNully,
    isValidAttributeName,
    flattenAttributes,
    toHTML,
    TEXTMODE,
    toText,
    Visitor,
    TransformingVisitor,
    ToHTMLVisitor,
    ToTextVisitor
});
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"html.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/htmljs/html.js                                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({Attrs:()=>Attrs,getTag:()=>getTag,ensureTag:()=>ensureTag,isTagEnsured:()=>isTagEnsured,getSymbolName:()=>getSymbolName,isKnownElement:()=>isKnownElement,isKnownSVGElement:()=>isKnownSVGElement,isVoidElement:()=>isVoidElement,CharRef:()=>CharRef,Comment:()=>Comment,Raw:()=>Raw,isArray:()=>isArray,isConstructedObject:()=>isConstructedObject,isNully:()=>isNully,isValidAttributeName:()=>isValidAttributeName,flattenAttributes:()=>flattenAttributes});module.export({Tag:()=>Tag,HTMLTags:()=>HTMLTags,knownHTMLElementNames:()=>knownHTMLElementNames,knownSVGElementNames:()=>knownSVGElementNames,knownElementNames:()=>knownElementNames,voidElementNames:()=>voidElementNames},true);const Tag = function() {};
Tag.prototype.tagName = ''; // this will be set per Tag subclass
Tag.prototype.attrs = null;
Tag.prototype.children = Object.freeze ? Object.freeze([]) : [];
Tag.prototype.htmljsType = Tag.htmljsType = [
    'Tag'
];
// Given "p" create the function `HTML.P`.
var makeTagConstructor = function(tagName) {
    // Tag is the per-tagName constructor of a HTML.Tag subclass
    var HTMLTag = function(...args) {
        // Work with or without `new`.  If not called with `new`,
        // perform instantiation by recursively calling this constructor.
        // We can't pass varargs, so pass no args.
        var instance = this instanceof Tag ? this : new HTMLTag;
        var i = 0;
        var attrs = args.length && args[0];
        if (attrs && typeof attrs === 'object') {
            // Treat vanilla JS object as an attributes dictionary.
            if (!isConstructedObject(attrs)) {
                instance.attrs = attrs;
                i++;
            } else if (attrs instanceof Attrs) {
                var array = attrs.value;
                if (array.length === 1) {
                    instance.attrs = array[0];
                } else if (array.length > 1) {
                    instance.attrs = array;
                }
                i++;
            }
        }
        // If no children, don't create an array at all, use the prototype's
        // (frozen, empty) array.  This way we don't create an empty array
        // every time someone creates a tag without `new` and this constructor
        // calls itself with no arguments (above).
        if (i < args.length) instance.children = args.slice(i);
        return instance;
    };
    HTMLTag.prototype = new Tag;
    HTMLTag.prototype.constructor = HTMLTag;
    HTMLTag.prototype.tagName = tagName;
    return HTMLTag;
};
// Not an HTMLjs node, but a wrapper to pass multiple attrs dictionaries
// to a tag (for the purpose of implementing dynamic attributes).
function Attrs(...args) {
    // Work with or without `new`.  If not called with `new`,
    // perform instantiation by recursively calling this constructor.
    // We can't pass varargs, so pass no args.
    var instance = this instanceof Attrs ? this : new Attrs;
    instance.value = args;
    return instance;
}
////////////////////////////// KNOWN ELEMENTS
const HTMLTags = {};
function getTag(tagName) {
    var symbolName = getSymbolName(tagName);
    if (symbolName === tagName) throw new Error("Use the lowercase or camelCase form of '" + tagName + "' here");
    if (!HTMLTags[symbolName]) HTMLTags[symbolName] = makeTagConstructor(tagName);
    return HTMLTags[symbolName];
}
function ensureTag(tagName) {
    getTag(tagName); // don't return it
}
function isTagEnsured(tagName) {
    return isKnownElement(tagName);
}
function getSymbolName(tagName) {
    // "foo-bar" -> "FOO_BAR"
    return tagName.toUpperCase().replace(/-/g, '_');
}
const knownHTMLElementNames = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
// (we add the SVG ones below)
const knownSVGElementNames = 'altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph path pattern polygon polyline radialGradient rect set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ');
// Append SVG element names to list of known element names
const knownElementNames = knownHTMLElementNames.concat(knownSVGElementNames);
const voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
var voidElementSet = new Set(voidElementNames);
var knownElementSet = new Set(knownElementNames);
var knownSVGElementSet = new Set(knownSVGElementNames);
function isKnownElement(tagName) {
    return knownElementSet.has(tagName);
}
function isKnownSVGElement(tagName) {
    return knownSVGElementSet.has(tagName);
}
function isVoidElement(tagName) {
    return voidElementSet.has(tagName);
}
// Ensure tags for all known elements
knownElementNames.forEach(ensureTag);
function CharRef(attrs) {
    if (!(this instanceof CharRef)) // called without `new`
    return new CharRef(attrs);
    if (!(attrs && attrs.html && attrs.str)) throw new Error("HTML.CharRef must be constructed with ({html:..., str:...})");
    this.html = attrs.html;
    this.str = attrs.str;
}
CharRef.prototype.htmljsType = CharRef.htmljsType = [
    'CharRef'
];
function Comment(value) {
    if (!(this instanceof Comment)) // called without `new`
    return new Comment(value);
    if (typeof value !== 'string') throw new Error('HTML.Comment must be constructed with a string');
    this.value = value;
    // Kill illegal hyphens in comment value (no way to escape them in HTML)
    this.sanitizedValue = value.replace(/^-|--+|-$/g, '');
}
Comment.prototype.htmljsType = Comment.htmljsType = [
    'Comment'
];
function Raw(value) {
    if (!(this instanceof Raw)) // called without `new`
    return new Raw(value);
    if (typeof value !== 'string') throw new Error('HTML.Raw must be constructed with a string');
    this.value = value;
}
Raw.prototype.htmljsType = Raw.htmljsType = [
    'Raw'
];
function isArray(x) {
    return x instanceof Array || Array.isArray(x);
}
function isConstructedObject(x) {
    // Figure out if `x` is "an instance of some class" or just a plain
    // object literal.  It correctly treats an object literal like
    // `{ constructor: ... }` as an object literal.  It won't detect
    // instances of classes that lack a `constructor` property (e.g.
    // if you assign to a prototype when setting up the class as in:
    // `Foo = function () { ... }; Foo.prototype = { ... }`, then
    // `(new Foo).constructor` is `Object`, not `Foo`).
    if (!x || typeof x !== 'object') return false;
    // Is this a plain object?
    let plain = false;
    if (Object.getPrototypeOf(x) === null) {
        plain = true;
    } else {
        let proto = x;
        while(Object.getPrototypeOf(proto) !== null){
            proto = Object.getPrototypeOf(proto);
        }
        plain = Object.getPrototypeOf(x) === proto;
    }
    return !plain && typeof x.constructor === 'function' && x instanceof x.constructor;
}
function isNully(node) {
    if (node == null) // null or undefined
    return true;
    if (isArray(node)) {
        // is it an empty array or an array of all nully items?
        for(var i = 0; i < node.length; i++)if (!isNully(node[i])) return false;
        return true;
    }
    return false;
}
function isValidAttributeName(name) {
    return /^[:_A-Za-z][:_A-Za-z0-9.\-]*/.test(name);
}
// If `attrs` is an array of attributes dictionaries, combines them
// into one.  Removes attributes that are "nully."
function flattenAttributes(attrs) {
    if (!attrs) return attrs;
    var isList = isArray(attrs);
    if (isList && attrs.length === 0) return null;
    var result = {};
    for(var i = 0, N = isList ? attrs.length : 1; i < N; i++){
        var oneAttrs = isList ? attrs[i] : attrs;
        if (typeof oneAttrs !== 'object' || isConstructedObject(oneAttrs)) throw new Error("Expected plain JS object as attrs, found: " + oneAttrs);
        for(var name in oneAttrs){
            if (!isValidAttributeName(name)) throw new Error("Illegal HTML attribute name: " + name);
            var value = oneAttrs[name];
            if (!isNully(value)) result[name] = value;
        }
    }
    return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"visitors.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/htmljs/visitors.js                                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({toHTML:()=>toHTML,toText:()=>toText});module.export({Visitor:()=>Visitor,TransformingVisitor:()=>TransformingVisitor,ToTextVisitor:()=>ToTextVisitor,ToHTMLVisitor:()=>ToHTMLVisitor,TEXTMODE:()=>TEXTMODE},true);let Tag,CharRef,Comment,Raw,isArray,getTag,isConstructedObject,flattenAttributes,isVoidElement;module.link('./html',{Tag(v){Tag=v},CharRef(v){CharRef=v},Comment(v){Comment=v},Raw(v){Raw=v},isArray(v){isArray=v},getTag(v){getTag=v},isConstructedObject(v){isConstructedObject=v},flattenAttributes(v){flattenAttributes=v},isVoidElement(v){isVoidElement=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
const isPromiseLike = (x)=>!!x && typeof x.then === 'function';
var IDENTITY = function(x) {
    return x;
};
// _assign is like _.extend or the upcoming Object.assign.
// Copy src's own, enumerable properties onto tgt and return
// tgt.
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _assign = function(tgt, src) {
    for(var k in src){
        if (_hasOwnProperty.call(src, k)) tgt[k] = src[k];
    }
    return tgt;
};
const Visitor = function(props) {
    _assign(this, props);
};
Visitor.def = function(options) {
    _assign(this.prototype, options);
};
Visitor.extend = function(options) {
    var curType = this;
    var subType = function HTMLVisitorSubtype(...args) {
        Visitor.apply(this, args);
    };
    subType.prototype = new curType;
    subType.extend = curType.extend;
    subType.def = curType.def;
    if (options) _assign(subType.prototype, options);
    return subType;
};
Visitor.def({
    visit: function(...args) {
        const [content] = args;
        if (content == null) // null or undefined.
        return this.visitNull.apply(this, args);
        if (typeof content === 'object') {
            if (content.htmljsType) {
                switch(content.htmljsType){
                    case Tag.htmljsType:
                        return this.visitTag.apply(this, args);
                    case CharRef.htmljsType:
                        return this.visitCharRef.apply(this, args);
                    case Comment.htmljsType:
                        return this.visitComment.apply(this, args);
                    case Raw.htmljsType:
                        return this.visitRaw.apply(this, args);
                    default:
                        throw new Error("Unknown htmljs type: " + content.htmljsType);
                }
            }
            if (isArray(content)) return this.visitArray.apply(this, args);
            return this.visitObject.apply(this, args);
        } else if (typeof content === 'string' || typeof content === 'boolean' || typeof content === 'number') {
            return this.visitPrimitive.apply(this, args);
        } else if (typeof content === 'function') {
            return this.visitFunction.apply(this, args);
        }
        throw new Error("Unexpected object in htmljs: " + content);
    },
    visitNull: function(nullOrUndefined /*, ...*/ ) {},
    visitPrimitive: function(stringBooleanOrNumber /*, ...*/ ) {},
    visitArray: function(array /*, ...*/ ) {},
    visitComment: function(comment /*, ...*/ ) {},
    visitCharRef: function(charRef /*, ...*/ ) {},
    visitRaw: function(raw /*, ...*/ ) {},
    visitTag: function(tag /*, ...*/ ) {},
    visitObject: function(obj /*, ...*/ ) {
        throw new Error("Unexpected object in htmljs: " + obj);
    },
    visitFunction: function(fn /*, ...*/ ) {
        throw new Error("Unexpected function in htmljs: " + fn);
    }
});
const TransformingVisitor = Visitor.extend();
TransformingVisitor.def({
    visitNull: IDENTITY,
    visitPrimitive: IDENTITY,
    visitArray: function(array, ...args) {
        var result = array;
        for(var i = 0; i < array.length; i++){
            var oldItem = array[i];
            var newItem = this.visit(oldItem, ...args);
            if (newItem !== oldItem) {
                // copy `array` on write
                if (result === array) result = array.slice();
                result[i] = newItem;
            }
        }
        return result;
    },
    visitComment: IDENTITY,
    visitCharRef: IDENTITY,
    visitRaw: IDENTITY,
    visitObject: function(obj, ...args) {
        // Don't parse Markdown & RCData as HTML
        if (obj.textMode != null) {
            return obj;
        }
        if ('content' in obj) {
            obj.content = this.visit(obj.content, ...args);
        }
        if ('elseContent' in obj) {
            obj.elseContent = this.visit(obj.elseContent, ...args);
        }
        return obj;
    },
    visitFunction: IDENTITY,
    visitTag: function(tag, ...args) {
        var oldChildren = tag.children;
        var newChildren = this.visitChildren(oldChildren, ...args);
        var oldAttrs = tag.attrs;
        var newAttrs = this.visitAttributes(oldAttrs, ...args);
        if (newAttrs === oldAttrs && newChildren === oldChildren) return tag;
        var newTag = getTag(tag.tagName).apply(null, newChildren);
        newTag.attrs = newAttrs;
        return newTag;
    },
    visitChildren: function(children, ...args) {
        return this.visitArray(children, ...args);
    },
    // Transform the `.attrs` property of a tag, which may be a dictionary,
    // an array, or in some uses, a foreign object (such as
    // a template tag).
    visitAttributes: function(...all) {
        const [attrs, ...args] = all;
        // Allow Promise-like values here; these will be handled in materializer.
        if (isPromiseLike(attrs)) {
            return attrs;
        }
        if (isArray(attrs)) {
            var result = attrs;
            for(var i = 0; i < attrs.length; i++){
                var oldItem = attrs[i];
                var newItem = this.visitAttributes(oldItem, ...args);
                if (newItem !== oldItem) {
                    // copy on write
                    if (result === attrs) result = attrs.slice();
                    result[i] = newItem;
                }
            }
            return result;
        }
        if (attrs && isConstructedObject(attrs)) {
            throw new Error("The basic TransformingVisitor does not support " + "foreign objects in attributes.  Define a custom " + "visitAttributes for this case.");
        }
        var oldAttrs = attrs;
        var newAttrs = oldAttrs;
        if (oldAttrs) {
            var attrArgs = [
                null,
                null
            ];
            attrArgs.push.apply(attrArgs, all);
            for(var k in oldAttrs){
                var oldValue = oldAttrs[k];
                attrArgs[0] = k;
                attrArgs[1] = oldValue;
                var newValue = this.visitAttribute.apply(this, attrArgs);
                if (newValue !== oldValue) {
                    // copy on write
                    if (newAttrs === oldAttrs) newAttrs = _assign({}, oldAttrs);
                    newAttrs[k] = newValue;
                }
            }
        }
        return newAttrs;
    },
    // Transform the value of one attribute name/value in an
    // attributes dictionary.
    visitAttribute: function(name, value, tag, ...args) {
        return this.visit(value, ...args);
    }
});
const ToTextVisitor = Visitor.extend();
ToTextVisitor.def({
    visitNull: function(nullOrUndefined) {
        return '';
    },
    visitPrimitive: function(stringBooleanOrNumber) {
        var str = String(stringBooleanOrNumber);
        if (this.textMode === TEXTMODE.RCDATA) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        } else if (this.textMode === TEXTMODE.ATTRIBUTE) {
            // escape `&` and `"` this time, not `&` and `<`
            return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        } else {
            return str;
        }
    },
    visitArray: function(array) {
        var parts = [];
        for(var i = 0; i < array.length; i++)parts.push(this.visit(array[i]));
        return parts.join('');
    },
    visitComment: function(comment) {
        throw new Error("Can't have a comment here");
    },
    visitCharRef: function(charRef) {
        if (this.textMode === TEXTMODE.RCDATA || this.textMode === TEXTMODE.ATTRIBUTE) {
            return charRef.html;
        } else {
            return charRef.str;
        }
    },
    visitRaw: function(raw) {
        return raw.value;
    },
    visitTag: function(tag) {
        // Really we should just disallow Tags here.  However, at the
        // moment it's useful to stringify any HTML we find.  In
        // particular, when you include a template within `{{#markdown}}`,
        // we render the template as text, and since there's currently
        // no way to make the template be *parsed* as text (e.g. `<template
        // type="text">`), we hackishly support HTML tags in markdown
        // in templates by parsing them and stringifying them.
        return this.visit(this.toHTML(tag));
    },
    visitObject: function(x) {
        throw new Error("Unexpected object in htmljs in toText: " + x);
    },
    toHTML: function(node) {
        return toHTML(node);
    }
});
const ToHTMLVisitor = Visitor.extend();
ToHTMLVisitor.def({
    visitNull: function(nullOrUndefined) {
        return '';
    },
    visitPrimitive: function(stringBooleanOrNumber) {
        var str = String(stringBooleanOrNumber);
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    },
    visitArray: function(array) {
        var parts = [];
        for(var i = 0; i < array.length; i++)parts.push(this.visit(array[i]));
        return parts.join('');
    },
    visitComment: function(comment) {
        return '<!--' + comment.sanitizedValue + '-->';
    },
    visitCharRef: function(charRef) {
        return charRef.html;
    },
    visitRaw: function(raw) {
        return raw.value;
    },
    visitTag: function(tag) {
        var attrStrs = [];
        var tagName = tag.tagName;
        var children = tag.children;
        var attrs = tag.attrs;
        if (attrs) {
            attrs = flattenAttributes(attrs);
            for(var k in attrs){
                if (k === 'value' && tagName === 'textarea') {
                    children = [
                        attrs[k],
                        children
                    ];
                } else {
                    var v = this.toText(attrs[k], TEXTMODE.ATTRIBUTE);
                    attrStrs.push(' ' + k + '="' + v + '"');
                }
            }
        }
        var startTag = '<' + tagName + attrStrs.join('') + '>';
        var childStrs = [];
        var content;
        if (tagName === 'textarea') {
            for(var i = 0; i < children.length; i++)childStrs.push(this.toText(children[i], TEXTMODE.RCDATA));
            content = childStrs.join('');
            if (content.slice(0, 1) === '\n') // TEXTAREA will absorb a newline, so if we see one, add
            // another one.
            content = '\n' + content;
        } else {
            for(var i = 0; i < children.length; i++)childStrs.push(this.visit(children[i]));
            content = childStrs.join('');
        }
        var result = startTag + content;
        if (children.length || !isVoidElement(tagName)) {
            // "Void" elements like BR are the only ones that don't get a close
            // tag in HTML5.  They shouldn't have contents, either, so we could
            // throw an error upon seeing contents here.
            result += '</' + tagName + '>';
        }
        return result;
    },
    visitObject: function(x) {
        throw new Error("Unexpected object in htmljs in toHTML: " + x);
    },
    toText: function(node, textMode) {
        return toText(node, textMode);
    }
});
////////////////////////////// TOHTML
function toHTML(content) {
    return (new ToHTMLVisitor).visit(content);
}
// Escaping modes for outputting text when generating HTML.
const TEXTMODE = {
    STRING: 1,
    RCDATA: 2,
    ATTRIBUTE: 3
};
function toText(content, textMode) {
    if (!textMode) throw new Error("textMode required for HTML.toText");
    if (!(textMode === TEXTMODE.STRING || textMode === TEXTMODE.RCDATA || textMode === TEXTMODE.ATTRIBUTE)) throw new Error("Unknown textMode: " + textMode);
    var visitor = new ToTextVisitor({
        textMode: textMode
    });
    return visitor.visit(content);
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
      HTML: HTML
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/htmljs/preamble.js"
  ],
  mainModulePath: "/node_modules/meteor/htmljs/preamble.js"
}});

//# sourceURL=meteor://💻app/packages/htmljs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvaHRtbGpzL3ByZWFtYmxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9odG1sanMvaHRtbC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvaHRtbGpzL3Zpc2l0b3JzLmpzIl0sIm5hbWVzIjpbIkhUTUxUYWdzIiwiVGFnIiwiQXR0cnMiLCJnZXRUYWciLCJlbnN1cmVUYWciLCJpc1RhZ0Vuc3VyZWQiLCJnZXRTeW1ib2xOYW1lIiwia25vd25IVE1MRWxlbWVudE5hbWVzIiwia25vd25TVkdFbGVtZW50TmFtZXMiLCJrbm93bkVsZW1lbnROYW1lcyIsInZvaWRFbGVtZW50TmFtZXMiLCJpc0tub3duRWxlbWVudCIsImlzS25vd25TVkdFbGVtZW50IiwiaXNWb2lkRWxlbWVudCIsIkNoYXJSZWYiLCJDb21tZW50IiwiUmF3IiwiaXNBcnJheSIsImlzQ29uc3RydWN0ZWRPYmplY3QiLCJpc051bGx5IiwiaXNWYWxpZEF0dHJpYnV0ZU5hbWUiLCJmbGF0dGVuQXR0cmlidXRlcyIsIkhUTUwiLCJPYmplY3QiLCJhc3NpZ24iLCJ0b0hUTUwiLCJURVhUTU9ERSIsInRvVGV4dCIsIlZpc2l0b3IiLCJUcmFuc2Zvcm1pbmdWaXNpdG9yIiwiVG9IVE1MVmlzaXRvciIsIlRvVGV4dFZpc2l0b3IiLCJwcm90b3R5cGUiLCJ0YWdOYW1lIiwiYXR0cnMiLCJjaGlsZHJlbiIsImZyZWV6ZSIsImh0bWxqc1R5cGUiLCJtYWtlVGFnQ29uc3RydWN0b3IiLCJIVE1MVGFnIiwiYXJncyIsImluc3RhbmNlIiwiaSIsImxlbmd0aCIsImFycmF5IiwidmFsdWUiLCJzbGljZSIsInN5bWJvbE5hbWUiLCJFcnJvciIsInRvVXBwZXJDYXNlIiwicmVwbGFjZSIsInNwbGl0IiwiY29uY2F0Iiwidm9pZEVsZW1lbnRTZXQiLCJTZXQiLCJrbm93bkVsZW1lbnRTZXQiLCJrbm93blNWR0VsZW1lbnRTZXQiLCJoYXMiLCJmb3JFYWNoIiwiaHRtbCIsInN0ciIsInNhbml0aXplZFZhbHVlIiwieCIsIkFycmF5IiwicGxhaW4iLCJnZXRQcm90b3R5cGVPZiIsInByb3RvIiwibm9kZSIsInRlc3QiLCJuYW1lIiwiaXNMaXN0IiwicmVzdWx0IiwiTiIsIm9uZUF0dHJzIiwiaXNQcm9taXNlTGlrZSIsInRoZW4iLCJJREVOVElUWSIsIl9oYXNPd25Qcm9wZXJ0eSIsImhhc093blByb3BlcnR5IiwiX2Fzc2lnbiIsInRndCIsInNyYyIsImsiLCJjYWxsIiwicHJvcHMiLCJkZWYiLCJvcHRpb25zIiwiZXh0ZW5kIiwiY3VyVHlwZSIsInN1YlR5cGUiLCJIVE1MVmlzaXRvclN1YnR5cGUiLCJhcHBseSIsInZpc2l0IiwiY29udGVudCIsInZpc2l0TnVsbCIsInZpc2l0VGFnIiwidmlzaXRDaGFyUmVmIiwidmlzaXRDb21tZW50IiwidmlzaXRSYXciLCJ2aXNpdEFycmF5IiwidmlzaXRPYmplY3QiLCJ2aXNpdFByaW1pdGl2ZSIsInZpc2l0RnVuY3Rpb24iLCJudWxsT3JVbmRlZmluZWQiLCJzdHJpbmdCb29sZWFuT3JOdW1iZXIiLCJjb21tZW50IiwiY2hhclJlZiIsInJhdyIsInRhZyIsIm9iaiIsImZuIiwib2xkSXRlbSIsIm5ld0l0ZW0iLCJ0ZXh0TW9kZSIsImVsc2VDb250ZW50Iiwib2xkQ2hpbGRyZW4iLCJuZXdDaGlsZHJlbiIsInZpc2l0Q2hpbGRyZW4iLCJvbGRBdHRycyIsIm5ld0F0dHJzIiwidmlzaXRBdHRyaWJ1dGVzIiwibmV3VGFnIiwiYWxsIiwiYXR0ckFyZ3MiLCJwdXNoIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsInZpc2l0QXR0cmlidXRlIiwiU3RyaW5nIiwiUkNEQVRBIiwiQVRUUklCVVRFIiwicGFydHMiLCJqb2luIiwiYXR0clN0cnMiLCJ2Iiwic3RhcnRUYWciLCJjaGlsZFN0cnMiLCJTVFJJTkciLCJ2aXNpdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQ0VBLFFBQVEsRUFD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USxDQUFDTyxFQUFFO1lBRXZDbUQsVUFBVTJDLFVBQVVKLElBQUksQ0FBQztRQUMzQjtRQUVBLElBQUk3RCxTQUFTZ0UsV0FBVzFDO1FBRXhCLElBQUkxRCxTQUFTUSxNQUFNLElBQUksQ0FBRTlCLGNBQWNvQixVQUFVO1lBQy9DLG1FQUFtRTtZQUNuRSxtRUFBbUU7WUFDbkUsNENBQTRDO1lBQzVDc0MsVUFBVSxPQUFPdEMsVUFBVTtRQUM3QjtRQUVBLE9BQU9zQztJQUNUO0lBQ0E2QixhQUFhLFNBQVV0QyxDQUFDO1FBQ3RCLE1BQU0sSUFBSWQsTUFBTSw0Q0FBNENjO0lBQzlEO0lBQ0FuQyxRQUFRLFNBQVV3QyxJQUFJLEVBQUU4QyxRQUFRO1FBQzlCLE9BQU90RixPQUFPd0MsTUFBTThDO0lBQ3RCO0FBQ0Y7QUFJQSxxQ0FBcUM7QUFFckMsT0FBTyxTQUFTeEYsT0FBT29FLEdBQU87SUFDNUIsT0FBUSxLQUFJL0QsYUFBWSxFQUFHOEQsS0FBSyxDQUFDQztBQUNuQztBQUVBLDJEQUEyRDtBQUMzRCxPQUFPLE1BQU1uRSxLQUFXO0lBQ3RCK0csUUFBUTtJQUNSUixRQUFRO0lBQ1JDLFdBQVc7QUFDYixFQUFFO0FBR0YsT0FBTyxTQUFTdkcsT0FBT2tFLE9BQU8sRUFBRW9CLElBQVE7SUFDdEMsSUFBSSxDQUFFQSxVQUNKLE1BQU0sSUFBSWpFLE1BQU07SUFDbEIsSUFBSSxDQUFHaUUsY0FBYXZGLFNBQVMrRyxNQUFNLElBQzVCeEIsYUFBYXZGLFNBQVN1RyxNQUFNLElBQzVCaEIsYUFBYXZGLFNBQVN3RyxTQUFTLEdBQ3BDLE1BQU0sSUFBSWxGLE1BQU0sdUJBQXVCaUU7SUFFekMsSUFBSXlCLFVBQVUsSUFBSTNHLGNBQWM7UUFBQ2tGLFVBQVVBO0lBQVE7SUFDbkQsT0FBT3lCLFFBQVE5QyxLQUFLLENBQUNDO0FBQ3ZCIiwiZmlsZSI6Ii9wYWNrYWdlcy9odG1sanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBIVE1MVGFncyxcbiAgVGFnLFxuICBBdHRycyxcbiAgZ2V0VGFnLFxuICBlbnN1cmVUYWcsXG4gIGlzVGFnRW5zdXJlZCxcbiAgZ2V0U3ltYm9sTmFtZSxcbiAga25vd25IVE1MRWxlbWVudE5hbWVzLFxuICBrbm93blNWR0VsZW1lbnROYW1lcyxcbiAga25vd25FbGVtZW50TmFtZXMsXG4gIHZvaWRFbGVtZW50TmFtZXMsXG4gIGlzS25vd25FbGVtZW50LFxuICBpc0tub3duU1ZHRWxlbWVudCxcbiAgaXNWb2lkRWxlbWVudCxcbiAgQ2hhclJlZixcbiAgQ29tbWVudCxcbiAgUmF3LFxuICBpc0FycmF5LFxuICBpc0NvbnN0cnVjdGVkT2JqZWN0LFxuICBpc051bGx5LFxuICBpc1ZhbGlkQXR0cmlidXRlTmFtZSxcbiAgZmxhdHRlbkF0dHJpYnV0ZXMsXG59IGZyb20gJy4vaHRtbCc7XG5cbmltcG9ydCB7XG4gIFZpc2l0b3IsXG4gIFRyYW5zZm9ybWluZ1Zpc2l0b3IsXG4gIFRvSFRNTFZpc2l0b3IsXG4gIFRvVGV4dFZpc2l0b3IsXG4gIHRvSFRNTCxcbiAgVEVYVE1PREUsXG4gIHRvVGV4dFxufSBmcm9tICcuL3Zpc2l0b3JzJztcblxuXG4vLyB3ZSdyZSBhY3R1YWxseSBleHBvcnRpbmcgdGhlIEhUTUxUYWdzIG9iamVjdC5cbi8vICBiZWNhdXNlIGl0IGlzIGR5bmFtaWNhbGx5IGFsdGVyZWQgYnkgZ2V0VGFnL2Vuc3VyZVRhZ1xuZXhwb3J0IGNvbnN0IEhUTUwgPSBPYmplY3QuYXNzaWduKEhUTUxUYWdzLCB7XG4gIFRhZyxcbiAgQXR0cnMsXG4gIGdldFRhZyxcbiAgZW5zdXJlVGFnLFxuICBpc1RhZ0Vuc3VyZWQsXG4gIGdldFN5bWJvbE5hbWUsXG4gIGtub3duSFRNTEVsZW1lbnROYW1lcyxcbiAga25vd25TVkdFbGVtZW50TmFtZXMsXG4gIGtub3duRWxlbWVudE5hbWVzLFxuICB2b2lkRWxlbWVudE5hbWVzLFxuICBpc0tub3duRWxlbWVudCxcbiAgaXNLbm93blNWR0VsZW1lbnQsXG4gIGlzVm9pZEVsZW1lbnQsXG4gIENoYXJSZWYsXG4gIENvbW1lbnQsXG4gIFJhdyxcbiAgaXNBcnJheSxcbiAgaXNDb25zdHJ1Y3RlZE9iamVjdCxcbiAgaXNOdWxseSxcbiAgaXNWYWxpZEF0dHJpYnV0ZU5hbWUsXG4gIGZsYXR0ZW5BdHRyaWJ1dGVzLFxuICB0b0hUTUwsXG4gIFRFWFRNT0RFLFxuICB0b1RleHQsXG4gIFZpc2l0b3IsXG4gIFRyYW5zZm9ybWluZ1Zpc2l0b3IsXG4gIFRvSFRNTFZpc2l0b3IsXG4gIFRvVGV4dFZpc2l0b3IsXG59KTtcbiIsIlxuZXhwb3J0IGNvbnN0IFRhZyA9IGZ1bmN0aW9uICgpIHt9O1xuVGFnLnByb3RvdHlwZS50YWdOYW1lID0gJyc7IC8vIHRoaXMgd2lsbCBiZSBzZXQgcGVyIFRhZyBzdWJjbGFzc1xuVGFnLnByb3RvdHlwZS5hdHRycyA9IG51bGw7XG5UYWcucHJvdG90eXBlLmNoaWxkcmVuID0gT2JqZWN0LmZyZWV6ZSA/IE9iamVjdC5mcmVlemUoW10pIDogW107XG5UYWcucHJvdG90eXBlLmh0bWxqc1R5cGUgPSBUYWcuaHRtbGpzVHlwZSA9IFsnVGFnJ107XG5cbi8vIEdpdmVuIFwicFwiIGNyZWF0ZSB0aGUgZnVuY3Rpb24gYEhUTUwuUGAuXG52YXIgbWFrZVRhZ0NvbnN0cnVjdG9yID0gZnVuY3Rpb24gKHRhZ05hbWUpIHtcbiAgLy8gVGFnIGlzIHRoZSBwZXItdGFnTmFtZSBjb25zdHJ1Y3RvciBvZiBhIEhUTUwuVGFnIHN1YmNsYXNzXG4gIHZhciBIVE1MVGFnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAvLyBXb3JrIHdpdGggb3Igd2l0aG91dCBgbmV3YC4gIElmIG5vdCBjYWxsZWQgd2l0aCBgbmV3YCxcbiAgICAvLyBwZXJmb3JtIGluc3RhbnRpYXRpb24gYnkgcmVjdXJzaXZlbHkgY2FsbGluZyB0aGlzIGNvbnN0cnVjdG9yLlxuICAgIC8vIFdlIGNhbid0IHBhc3MgdmFyYXJncywgc28gcGFzcyBubyBhcmdzLlxuICAgIHZhciBpbnN0YW5jZSA9ICh0aGlzIGluc3RhbmNlb2YgVGFnKSA/IHRoaXMgOiBuZXcgSFRNTFRhZztcblxuICAgIHZhciBpID0gMDtcbiAgICB2YXIgYXR0cnMgPSBhcmdzLmxlbmd0aCAmJiBhcmdzWzBdO1xuICAgIGlmIChhdHRycyAmJiAodHlwZW9mIGF0dHJzID09PSAnb2JqZWN0JykpIHtcbiAgICAgIC8vIFRyZWF0IHZhbmlsbGEgSlMgb2JqZWN0IGFzIGFuIGF0dHJpYnV0ZXMgZGljdGlvbmFyeS5cbiAgICAgIGlmICghIGlzQ29uc3RydWN0ZWRPYmplY3QoYXR0cnMpKSB7XG4gICAgICAgIGluc3RhbmNlLmF0dHJzID0gYXR0cnM7XG4gICAgICAgIGkrKztcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMgaW5zdGFuY2VvZiBBdHRycykge1xuICAgICAgICB2YXIgYXJyYXkgPSBhdHRycy52YWx1ZTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGluc3RhbmNlLmF0dHJzID0gYXJyYXlbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoYXJyYXkubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGluc3RhbmNlLmF0dHJzID0gYXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gSWYgbm8gY2hpbGRyZW4sIGRvbid0IGNyZWF0ZSBhbiBhcnJheSBhdCBhbGwsIHVzZSB0aGUgcHJvdG90eXBlJ3NcbiAgICAvLyAoZnJvemVuLCBlbXB0eSkgYXJyYXkuICBUaGlzIHdheSB3ZSBkb24ndCBjcmVhdGUgYW4gZW1wdHkgYXJyYXlcbiAgICAvLyBldmVyeSB0aW1lIHNvbWVvbmUgY3JlYXRlcyBhIHRhZyB3aXRob3V0IGBuZXdgIGFuZCB0aGlzIGNvbnN0cnVjdG9yXG4gICAgLy8gY2FsbHMgaXRzZWxmIHdpdGggbm8gYXJndW1lbnRzIChhYm92ZSkuXG4gICAgaWYgKGkgPCBhcmdzLmxlbmd0aClcbiAgICAgIGluc3RhbmNlLmNoaWxkcmVuID0gYXJncy5zbGljZShpKTtcblxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcbiAgSFRNTFRhZy5wcm90b3R5cGUgPSBuZXcgVGFnO1xuICBIVE1MVGFnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhUTUxUYWc7XG4gIEhUTUxUYWcucHJvdG90eXBlLnRhZ05hbWUgPSB0YWdOYW1lO1xuXG4gIHJldHVybiBIVE1MVGFnO1xufTtcblxuLy8gTm90IGFuIEhUTUxqcyBub2RlLCBidXQgYSB3cmFwcGVyIHRvIHBhc3MgbXVsdGlwbGUgYXR0cnMgZGljdGlvbmFyaWVzXG4vLyB0byBhIHRhZyAoZm9yIHRoZSBwdXJwb3NlIG9mIGltcGxlbWVudGluZyBkeW5hbWljIGF0dHJpYnV0ZXMpLlxuZXhwb3J0IGZ1bmN0aW9uIEF0dHJzKC4uLmFyZ3MpIHtcbiAgLy8gV29yayB3aXRoIG9yIHdpdGhvdXQgYG5ld2AuICBJZiBub3QgY2FsbGVkIHdpdGggYG5ld2AsXG4gIC8vIHBlcmZvcm0gaW5zdGFudGlhdGlvbiBieSByZWN1cnNpdmVseSBjYWxsaW5nIHRoaXMgY29uc3RydWN0b3IuXG4gIC8vIFdlIGNhbid0IHBhc3MgdmFyYXJncywgc28gcGFzcyBubyBhcmdzLlxuICB2YXIgaW5zdGFuY2UgPSAodGhpcyBpbnN0YW5jZW9mIEF0dHJzKSA/IHRoaXMgOiBuZXcgQXR0cnM7XG5cbiAgaW5zdGFuY2UudmFsdWUgPSBhcmdzO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIEtOT1dOIEVMRU1FTlRTXG5leHBvcnQgY29uc3QgSFRNTFRhZ3MgPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhZyAodGFnTmFtZSkge1xuICB2YXIgc3ltYm9sTmFtZSA9IGdldFN5bWJvbE5hbWUodGFnTmFtZSk7XG4gIGlmIChzeW1ib2xOYW1lID09PSB0YWdOYW1lKSAvLyBhbGwtY2FwcyB0YWdOYW1lXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVXNlIHRoZSBsb3dlcmNhc2Ugb3IgY2FtZWxDYXNlIGZvcm0gb2YgJ1wiICsgdGFnTmFtZSArIFwiJyBoZXJlXCIpO1xuXG4gIGlmICghIEhUTUxUYWdzW3N5bWJvbE5hbWVdKVxuICAgIEhUTUxUYWdzW3N5bWJvbE5hbWVdID0gbWFrZVRhZ0NvbnN0cnVjdG9yKHRhZ05hbWUpO1xuXG4gIHJldHVybiBIVE1MVGFnc1tzeW1ib2xOYW1lXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVRhZyh0YWdOYW1lKSB7XG4gIGdldFRhZyh0YWdOYW1lKTsgLy8gZG9uJ3QgcmV0dXJuIGl0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RhZ0Vuc3VyZWQgKHRhZ05hbWUpIHtcbiAgcmV0dXJuIGlzS25vd25FbGVtZW50KHRhZ05hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ltYm9sTmFtZSAodGFnTmFtZSkge1xuICAvLyBcImZvby1iYXJcIiAtPiBcIkZPT19CQVJcIlxuICByZXR1cm4gdGFnTmFtZS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoLy0vZywgJ18nKTtcbn1cblxuZXhwb3J0IGNvbnN0IGtub3duSFRNTEVsZW1lbnROYW1lcyA9ICdhIGFiYnIgYWNyb255bSBhZGRyZXNzIGFwcGxldCBhcmVhIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiYXNlIGJhc2Vmb250IGJkaSBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBiciBidXR0b24gY2FudmFzIGNhcHRpb24gY2VudGVyIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgY29tbWFuZCBkYXRhIGRhdGFncmlkIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXIgZGl2IGRsIGR0IGVtIGVtYmVkIGV2ZW50c291cmNlIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvbnQgZm9vdGVyIGZvcm0gZnJhbWUgZnJhbWVzZXQgaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaGdyb3VwIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBpc2luZGV4IGtiZCBrZXlnZW4gbGFiZWwgbGVnZW5kIGxpIGxpbmsgbWFpbiBtYXAgbWFyayBtZW51IG1ldGEgbWV0ZXIgbmF2IG5vZnJhbWVzIG5vc2NyaXB0IG9iamVjdCBvbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcGFyYW0gcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBzIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cmlrZSBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdHQgdSB1bCB2YXIgdmlkZW8gd2JyJy5zcGxpdCgnICcpO1xuLy8gKHdlIGFkZCB0aGUgU1ZHIG9uZXMgYmVsb3cpXG5cbmV4cG9ydCBjb25zdCBrbm93blNWR0VsZW1lbnROYW1lcyA9ICdhbHRHbHlwaCBhbHRHbHlwaERlZiBhbHRHbHlwaEl0ZW0gYW5pbWF0ZSBhbmltYXRlQ29sb3IgYW5pbWF0ZU1vdGlvbiBhbmltYXRlVHJhbnNmb3JtIGNpcmNsZSBjbGlwUGF0aCBjb2xvci1wcm9maWxlIGN1cnNvciBkZWZzIGRlc2MgZWxsaXBzZSBmZUJsZW5kIGZlQ29sb3JNYXRyaXggZmVDb21wb25lbnRUcmFuc2ZlciBmZUNvbXBvc2l0ZSBmZUNvbnZvbHZlTWF0cml4IGZlRGlmZnVzZUxpZ2h0aW5nIGZlRGlzcGxhY2VtZW50TWFwIGZlRGlzdGFudExpZ2h0IGZlRmxvb2QgZmVGdW5jQSBmZUZ1bmNCIGZlRnVuY0cgZmVGdW5jUiBmZUdhdXNzaWFuQmx1ciBmZUltYWdlIGZlTWVyZ2UgZmVNZXJnZU5vZGUgZmVNb3JwaG9sb2d5IGZlT2Zmc2V0IGZlUG9pbnRMaWdodCBmZVNwZWN1bGFyTGlnaHRpbmcgZmVTcG90TGlnaHQgZmVUaWxlIGZlVHVyYnVsZW5jZSBmaWx0ZXIgZm9udCBmb250LWZhY2UgZm9udC1mYWNlLWZvcm1hdCBmb250LWZhY2UtbmFtZSBmb250LWZhY2Utc3JjIGZvbnQtZmFjZS11cmkgZm9yZWlnbk9iamVjdCBnIGdseXBoIGdseXBoUmVmIGhrZXJuIGltYWdlIGxpbmUgbGluZWFyR3JhZGllbnQgbWFya2VyIG1hc2sgbWV0YWRhdGEgbWlzc2luZy1nbHlwaCBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHNldCBzdG9wIHN0eWxlIHN2ZyBzd2l0Y2ggc3ltYm9sIHRleHQgdGV4dFBhdGggdGl0bGUgdHJlZiB0c3BhbiB1c2UgdmlldyB2a2Vybicuc3BsaXQoJyAnKTtcbi8vIEFwcGVuZCBTVkcgZWxlbWVudCBuYW1lcyB0byBsaXN0IG9mIGtub3duIGVsZW1lbnQgbmFtZXNcbmV4cG9ydCBjb25zdCBrbm93bkVsZW1lbnROYW1lcyA9IGtub3duSFRNTEVsZW1lbnROYW1lcy5jb25jYXQoa25vd25TVkdFbGVtZW50TmFtZXMpO1xuXG5leHBvcnQgY29uc3Qgdm9pZEVsZW1lbnROYW1lcyA9ICdhcmVhIGJhc2UgYnIgY29sIGNvbW1hbmQgZW1iZWQgaHIgaW1nIGlucHV0IGtleWdlbiBsaW5rIG1ldGEgcGFyYW0gc291cmNlIHRyYWNrIHdicicuc3BsaXQoJyAnKTtcblxuXG52YXIgdm9pZEVsZW1lbnRTZXQgPSBuZXcgU2V0KHZvaWRFbGVtZW50TmFtZXMpO1xudmFyIGtub3duRWxlbWVudFNldCA9IG5ldyBTZXQoa25vd25FbGVtZW50TmFtZXMpO1xudmFyIGtub3duU1ZHRWxlbWVudFNldCA9IG5ldyBTZXQoa25vd25TVkdFbGVtZW50TmFtZXMpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNLbm93bkVsZW1lbnQodGFnTmFtZSkge1xuICByZXR1cm4ga25vd25FbGVtZW50U2V0Lmhhcyh0YWdOYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzS25vd25TVkdFbGVtZW50KHRhZ05hbWUpIHtcbiAgcmV0dXJuIGtub3duU1ZHRWxlbWVudFNldC5oYXModGFnTmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZvaWRFbGVtZW50KHRhZ05hbWUpIHtcbiAgcmV0dXJuIHZvaWRFbGVtZW50U2V0Lmhhcyh0YWdOYW1lKTtcbn1cblxuXG4vLyBFbnN1cmUgdGFncyBmb3IgYWxsIGtub3duIGVsZW1lbnRzXG5rbm93bkVsZW1lbnROYW1lcy5mb3JFYWNoKGVuc3VyZVRhZyk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIENoYXJSZWYoYXR0cnMpIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBDaGFyUmVmKSlcbiAgICAvLyBjYWxsZWQgd2l0aG91dCBgbmV3YFxuICAgIHJldHVybiBuZXcgQ2hhclJlZihhdHRycyk7XG5cbiAgaWYgKCEgKGF0dHJzICYmIGF0dHJzLmh0bWwgJiYgYXR0cnMuc3RyKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkhUTUwuQ2hhclJlZiBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggKHtodG1sOi4uLiwgc3RyOi4uLn0pXCIpO1xuXG4gIHRoaXMuaHRtbCA9IGF0dHJzLmh0bWw7XG4gIHRoaXMuc3RyID0gYXR0cnMuc3RyO1xufVxuQ2hhclJlZi5wcm90b3R5cGUuaHRtbGpzVHlwZSA9IENoYXJSZWYuaHRtbGpzVHlwZSA9IFsnQ2hhclJlZiddO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29tbWVudCh2YWx1ZSkge1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIENvbW1lbnQpKVxuICAgIC8vIGNhbGxlZCB3aXRob3V0IGBuZXdgXG4gICAgcmV0dXJuIG5ldyBDb21tZW50KHZhbHVlKTtcblxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0hUTUwuQ29tbWVudCBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggYSBzdHJpbmcnKTtcblxuICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIC8vIEtpbGwgaWxsZWdhbCBoeXBoZW5zIGluIGNvbW1lbnQgdmFsdWUgKG5vIHdheSB0byBlc2NhcGUgdGhlbSBpbiBIVE1MKVxuICB0aGlzLnNhbml0aXplZFZhbHVlID0gdmFsdWUucmVwbGFjZSgvXi18LS0rfC0kL2csICcnKTtcbn1cbkNvbW1lbnQucHJvdG90eXBlLmh0bWxqc1R5cGUgPSBDb21tZW50Lmh0bWxqc1R5cGUgPSBbJ0NvbW1lbnQnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFJhdyh2YWx1ZSkge1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIFJhdykpXG4gICAgLy8gY2FsbGVkIHdpdGhvdXQgYG5ld2BcbiAgICByZXR1cm4gbmV3IFJhdyh2YWx1ZSk7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdIVE1MLlJhdyBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggYSBzdHJpbmcnKTtcblxuICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5SYXcucHJvdG90eXBlLmh0bWxqc1R5cGUgPSBSYXcuaHRtbGpzVHlwZSA9IFsnUmF3J107XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXkgKHgpIHtcbiAgcmV0dXJuIHggaW5zdGFuY2VvZiBBcnJheSB8fCBBcnJheS5pc0FycmF5KHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdHJ1Y3RlZE9iamVjdCAoeCkge1xuICAvLyBGaWd1cmUgb3V0IGlmIGB4YCBpcyBcImFuIGluc3RhbmNlIG9mIHNvbWUgY2xhc3NcIiBvciBqdXN0IGEgcGxhaW5cbiAgLy8gb2JqZWN0IGxpdGVyYWwuICBJdCBjb3JyZWN0bHkgdHJlYXRzIGFuIG9iamVjdCBsaXRlcmFsIGxpa2VcbiAgLy8gYHsgY29uc3RydWN0b3I6IC4uLiB9YCBhcyBhbiBvYmplY3QgbGl0ZXJhbC4gIEl0IHdvbid0IGRldGVjdFxuICAvLyBpbnN0YW5jZXMgb2YgY2xhc3NlcyB0aGF0IGxhY2sgYSBgY29uc3RydWN0b3JgIHByb3BlcnR5IChlLmcuXG4gIC8vIGlmIHlvdSBhc3NpZ24gdG8gYSBwcm90b3R5cGUgd2hlbiBzZXR0aW5nIHVwIHRoZSBjbGFzcyBhcyBpbjpcbiAgLy8gYEZvbyA9IGZ1bmN0aW9uICgpIHsgLi4uIH07IEZvby5wcm90b3R5cGUgPSB7IC4uLiB9YCwgdGhlblxuICAvLyBgKG5ldyBGb28pLmNvbnN0cnVjdG9yYCBpcyBgT2JqZWN0YCwgbm90IGBGb29gKS5cbiAgaWYoIXggfHwgKHR5cGVvZiB4ICE9PSAnb2JqZWN0JykpIHJldHVybiBmYWxzZTtcbiAgLy8gSXMgdGhpcyBhIHBsYWluIG9iamVjdD9cbiAgbGV0IHBsYWluID0gZmFsc2U7XG4gIGlmKE9iamVjdC5nZXRQcm90b3R5cGVPZih4KSA9PT0gbnVsbCkge1xuICAgIHBsYWluID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgcHJvdG8gPSB4O1xuICAgIHdoaWxlKE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90bykgIT09IG51bGwpIHtcbiAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICB9XG4gICAgcGxhaW4gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCkgPT09IHByb3RvO1xuICB9XG5cbiAgcmV0dXJuICFwbGFpbiAmJlxuICAgICh0eXBlb2YgeC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykgJiZcbiAgICAoeCBpbnN0YW5jZW9mIHguY29uc3RydWN0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdWxseSAobm9kZSkge1xuICBpZiAobm9kZSA9PSBudWxsKVxuICAgIC8vIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgaWYgKGlzQXJyYXkobm9kZSkpIHtcbiAgICAvLyBpcyBpdCBhbiBlbXB0eSBhcnJheSBvciBhbiBhcnJheSBvZiBhbGwgbnVsbHkgaXRlbXM/XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKCEgaXNOdWxseShub2RlW2ldKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEF0dHJpYnV0ZU5hbWUgKG5hbWUpIHtcbiAgcmV0dXJuIC9eWzpfQS1aYS16XVs6X0EtWmEtejAtOS5cXC1dKi8udGVzdChuYW1lKTtcbn1cblxuLy8gSWYgYGF0dHJzYCBpcyBhbiBhcnJheSBvZiBhdHRyaWJ1dGVzIGRpY3Rpb25hcmllcywgY29tYmluZXMgdGhlbVxuLy8gaW50byBvbmUuICBSZW1vdmVzIGF0dHJpYnV0ZXMgdGhhdCBhcmUgXCJudWxseS5cIlxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5BdHRyaWJ1dGVzIChhdHRycykge1xuICBpZiAoISBhdHRycylcbiAgICByZXR1cm4gYXR0cnM7XG5cbiAgdmFyIGlzTGlzdCA9IGlzQXJyYXkoYXR0cnMpO1xuICBpZiAoaXNMaXN0ICYmIGF0dHJzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgcmVzdWx0ID0ge307XG4gIGZvciAodmFyIGkgPSAwLCBOID0gKGlzTGlzdCA/IGF0dHJzLmxlbmd0aCA6IDEpOyBpIDwgTjsgaSsrKSB7XG4gICAgdmFyIG9uZUF0dHJzID0gKGlzTGlzdCA/IGF0dHJzW2ldIDogYXR0cnMpO1xuICAgIGlmICgodHlwZW9mIG9uZUF0dHJzICE9PSAnb2JqZWN0JykgfHxcbiAgICAgICAgaXNDb25zdHJ1Y3RlZE9iamVjdChvbmVBdHRycykpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwbGFpbiBKUyBvYmplY3QgYXMgYXR0cnMsIGZvdW5kOiBcIiArIG9uZUF0dHJzKTtcbiAgICBmb3IgKHZhciBuYW1lIGluIG9uZUF0dHJzKSB7XG4gICAgICBpZiAoISBpc1ZhbGlkQXR0cmlidXRlTmFtZShuYW1lKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSWxsZWdhbCBIVE1MIGF0dHJpYnV0ZSBuYW1lOiBcIiArIG5hbWUpO1xuICAgICAgdmFyIHZhbHVlID0gb25lQXR0cnNbbmFtZV07XG4gICAgICBpZiAoISBpc051bGx5KHZhbHVlKSlcbiAgICAgICAgcmVzdWx0W25hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImltcG9ydCB7XG4gIFRhZyxcbiAgQ2hhclJlZixcbiAgQ29tbWVudCxcbiAgUmF3LFxuICBpc0FycmF5LFxuICBnZXRUYWcsXG4gIGlzQ29uc3RydWN0ZWRPYmplY3QsXG4gIGZsYXR0ZW5BdHRyaWJ1dGVzLFxuICBpc1ZvaWRFbGVtZW50LFxufSBmcm9tICcuL2h0bWwnO1xuXG5jb25zdCBpc1Byb21pc2VMaWtlID0geCA9PiAhIXggJiYgdHlwZW9mIHgudGhlbiA9PT0gJ2Z1bmN0aW9uJztcblxudmFyIElERU5USVRZID0gZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHg7IH07XG5cbi8vIF9hc3NpZ24gaXMgbGlrZSBfLmV4dGVuZCBvciB0aGUgdXBjb21pbmcgT2JqZWN0LmFzc2lnbi5cbi8vIENvcHkgc3JjJ3Mgb3duLCBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb250byB0Z3QgYW5kIHJldHVyblxuLy8gdGd0LlxudmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgX2Fzc2lnbiA9IGZ1bmN0aW9uICh0Z3QsIHNyYykge1xuICBmb3IgKHZhciBrIGluIHNyYykge1xuICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChzcmMsIGspKVxuICAgICAgdGd0W2tdID0gc3JjW2tdO1xuICB9XG4gIHJldHVybiB0Z3Q7XG59O1xuXG5leHBvcnQgY29uc3QgVmlzaXRvciA9IGZ1bmN0aW9uIChwcm9wcykge1xuICBfYXNzaWduKHRoaXMsIHByb3BzKTtcbn07XG5cblZpc2l0b3IuZGVmID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgX2Fzc2lnbih0aGlzLnByb3RvdHlwZSwgb3B0aW9ucyk7XG59O1xuXG5WaXNpdG9yLmV4dGVuZCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBjdXJUeXBlID0gdGhpcztcbiAgdmFyIHN1YlR5cGUgPSBmdW5jdGlvbiBIVE1MVmlzaXRvclN1YnR5cGUoLi4uYXJncykge1xuICAgIFZpc2l0b3IuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG4gIHN1YlR5cGUucHJvdG90eXBlID0gbmV3IGN1clR5cGU7XG4gIHN1YlR5cGUuZXh0ZW5kID0gY3VyVHlwZS5leHRlbmQ7XG4gIHN1YlR5cGUuZGVmID0gY3VyVHlwZS5kZWY7XG4gIGlmIChvcHRpb25zKVxuICAgIF9hc3NpZ24oc3ViVHlwZS5wcm90b3R5cGUsIG9wdGlvbnMpO1xuICByZXR1cm4gc3ViVHlwZTtcbn07XG5cblZpc2l0b3IuZGVmKHtcbiAgdmlzaXQ6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgY29uc3QgW2NvbnRlbnRdID0gYXJncztcbiAgICBpZiAoY29udGVudCA9PSBudWxsKVxuICAgICAgLy8gbnVsbCBvciB1bmRlZmluZWQuXG4gICAgICByZXR1cm4gdGhpcy52aXNpdE51bGwuYXBwbHkodGhpcywgYXJncyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoY29udGVudC5odG1sanNUeXBlKSB7XG4gICAgICAgIHN3aXRjaCAoY29udGVudC5odG1sanNUeXBlKSB7XG4gICAgICAgIGNhc2UgVGFnLmh0bWxqc1R5cGU6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUYWcuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIGNhc2UgQ2hhclJlZi5odG1sanNUeXBlOlxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2hhclJlZi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgY2FzZSBDb21tZW50Lmh0bWxqc1R5cGU6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb21tZW50LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBjYXNlIFJhdy5odG1sanNUeXBlOlxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0UmF3LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gaHRtbGpzIHR5cGU6IFwiICsgY29udGVudC5odG1sanNUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNBcnJheShjb250ZW50KSlcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRBcnJheS5hcHBseSh0aGlzLCBhcmdzKTtcblxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRPYmplY3QuYXBwbHkodGhpcywgYXJncyk7XG5cbiAgICB9IGVsc2UgaWYgKCh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHx8XG4gICAgICAgICAgICAgICAodHlwZW9mIGNvbnRlbnQgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAgICAgICh0eXBlb2YgY29udGVudCA9PT0gJ251bWJlcicpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdFByaW1pdGl2ZS5hcHBseSh0aGlzLCBhcmdzKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RnVuY3Rpb24uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBvYmplY3QgaW4gaHRtbGpzOiBcIiArIGNvbnRlbnQpO1xuXG4gIH0sXG4gIHZpc2l0TnVsbDogZnVuY3Rpb24gKG51bGxPclVuZGVmaW5lZC8qLCAuLi4qLykge30sXG4gIHZpc2l0UHJpbWl0aXZlOiBmdW5jdGlvbiAoc3RyaW5nQm9vbGVhbk9yTnVtYmVyLyosIC4uLiovKSB7fSxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKGFycmF5LyosIC4uLiovKSB7fSxcbiAgdmlzaXRDb21tZW50OiBmdW5jdGlvbiAoY29tbWVudC8qLCAuLi4qLykge30sXG4gIHZpc2l0Q2hhclJlZjogZnVuY3Rpb24gKGNoYXJSZWYvKiwgLi4uKi8pIHt9LFxuICB2aXNpdFJhdzogZnVuY3Rpb24gKHJhdy8qLCAuLi4qLykge30sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnLyosIC4uLiovKSB7fSxcbiAgdmlzaXRPYmplY3Q6IGZ1bmN0aW9uIChvYmovKiwgLi4uKi8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIG9iamVjdCBpbiBodG1sanM6IFwiICsgb2JqKTtcbiAgfSxcbiAgdmlzaXRGdW5jdGlvbjogZnVuY3Rpb24gKGZuLyosIC4uLiovKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBmdW5jdGlvbiBpbiBodG1sanM6IFwiICsgZm4pO1xuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IFRyYW5zZm9ybWluZ1Zpc2l0b3IgPSBWaXNpdG9yLmV4dGVuZCgpO1xuVHJhbnNmb3JtaW5nVmlzaXRvci5kZWYoe1xuICB2aXNpdE51bGw6IElERU5USVRZLFxuICB2aXNpdFByaW1pdGl2ZTogSURFTlRJVFksXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgLi4uYXJncykge1xuICAgIHZhciByZXN1bHQgPSBhcnJheTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgb2xkSXRlbSA9IGFycmF5W2ldO1xuICAgICAgdmFyIG5ld0l0ZW0gPSB0aGlzLnZpc2l0KG9sZEl0ZW0sIC4uLmFyZ3MpO1xuICAgICAgaWYgKG5ld0l0ZW0gIT09IG9sZEl0ZW0pIHtcbiAgICAgICAgLy8gY29weSBgYXJyYXlgIG9uIHdyaXRlXG4gICAgICAgIGlmIChyZXN1bHQgPT09IGFycmF5KVxuICAgICAgICAgIHJlc3VsdCA9IGFycmF5LnNsaWNlKCk7XG4gICAgICAgIHJlc3VsdFtpXSA9IG5ld0l0ZW07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHZpc2l0Q29tbWVudDogSURFTlRJVFksXG4gIHZpc2l0Q2hhclJlZjogSURFTlRJVFksXG4gIHZpc2l0UmF3OiBJREVOVElUWSxcbiAgdmlzaXRPYmplY3Q6IGZ1bmN0aW9uKG9iaiwgLi4uYXJncyl7XG4gICAgLy8gRG9uJ3QgcGFyc2UgTWFya2Rvd24gJiBSQ0RhdGEgYXMgSFRNTFxuICAgIGlmIChvYmoudGV4dE1vZGUgIT0gbnVsbCl7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAoJ2NvbnRlbnQnIGluIG9iaikge1xuICAgICAgb2JqLmNvbnRlbnQgPSB0aGlzLnZpc2l0KG9iai5jb250ZW50LCAuLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCdlbHNlQ29udGVudCcgaW4gb2JqKXtcbiAgICAgIG9iai5lbHNlQ29udGVudCA9IHRoaXMudmlzaXQob2JqLmVsc2VDb250ZW50LCAuLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgdmlzaXRGdW5jdGlvbjogSURFTlRJVFksXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnLCAuLi5hcmdzKSB7XG4gICAgdmFyIG9sZENoaWxkcmVuID0gdGFnLmNoaWxkcmVuO1xuICAgIHZhciBuZXdDaGlsZHJlbiA9IHRoaXMudmlzaXRDaGlsZHJlbihvbGRDaGlsZHJlbiwgLi4uYXJncyk7XG5cbiAgICB2YXIgb2xkQXR0cnMgPSB0YWcuYXR0cnM7XG4gICAgdmFyIG5ld0F0dHJzID0gdGhpcy52aXNpdEF0dHJpYnV0ZXMob2xkQXR0cnMsIC4uLmFyZ3MpO1xuXG4gICAgaWYgKG5ld0F0dHJzID09PSBvbGRBdHRycyAmJiBuZXdDaGlsZHJlbiA9PT0gb2xkQ2hpbGRyZW4pXG4gICAgICByZXR1cm4gdGFnO1xuXG4gICAgdmFyIG5ld1RhZyA9IGdldFRhZyh0YWcudGFnTmFtZSkuYXBwbHkobnVsbCwgbmV3Q2hpbGRyZW4pO1xuICAgIG5ld1RhZy5hdHRycyA9IG5ld0F0dHJzO1xuICAgIHJldHVybiBuZXdUYWc7XG4gIH0sXG4gIHZpc2l0Q2hpbGRyZW46IGZ1bmN0aW9uIChjaGlsZHJlbiwgLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnZpc2l0QXJyYXkoY2hpbGRyZW4sIC4uLmFyZ3MpO1xuICB9LFxuICAvLyBUcmFuc2Zvcm0gdGhlIGAuYXR0cnNgIHByb3BlcnR5IG9mIGEgdGFnLCB3aGljaCBtYXkgYmUgYSBkaWN0aW9uYXJ5LFxuICAvLyBhbiBhcnJheSwgb3IgaW4gc29tZSB1c2VzLCBhIGZvcmVpZ24gb2JqZWN0IChzdWNoIGFzXG4gIC8vIGEgdGVtcGxhdGUgdGFnKS5cbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoLi4uYWxsKSB7XG4gICAgY29uc3QgW2F0dHJzLCAuLi5hcmdzXSA9IGFsbDtcbiAgICAvLyBBbGxvdyBQcm9taXNlLWxpa2UgdmFsdWVzIGhlcmU7IHRoZXNlIHdpbGwgYmUgaGFuZGxlZCBpbiBtYXRlcmlhbGl6ZXIuXG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnM7XG4gICAgfVxuXG4gICAgaWYgKGlzQXJyYXkoYXR0cnMpKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gYXR0cnM7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBvbGRJdGVtID0gYXR0cnNbaV07XG4gICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy52aXNpdEF0dHJpYnV0ZXMob2xkSXRlbSwgLi4uYXJncyk7XG4gICAgICAgIGlmIChuZXdJdGVtICE9PSBvbGRJdGVtKSB7XG4gICAgICAgICAgLy8gY29weSBvbiB3cml0ZVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IGF0dHJzKVxuICAgICAgICAgICAgcmVzdWx0ID0gYXR0cnMuc2xpY2UoKTtcbiAgICAgICAgICByZXN1bHRbaV0gPSBuZXdJdGVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGlmIChhdHRycyAmJiBpc0NvbnN0cnVjdGVkT2JqZWN0KGF0dHJzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGJhc2ljIFRyYW5zZm9ybWluZ1Zpc2l0b3IgZG9lcyBub3Qgc3VwcG9ydCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJmb3JlaWduIG9iamVjdHMgaW4gYXR0cmlidXRlcy4gIERlZmluZSBhIGN1c3RvbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJ2aXNpdEF0dHJpYnV0ZXMgZm9yIHRoaXMgY2FzZS5cIik7XG4gICAgfVxuXG4gICAgdmFyIG9sZEF0dHJzID0gYXR0cnM7XG4gICAgdmFyIG5ld0F0dHJzID0gb2xkQXR0cnM7XG4gICAgaWYgKG9sZEF0dHJzKSB7XG4gICAgICB2YXIgYXR0ckFyZ3MgPSBbbnVsbCwgbnVsbF07XG4gICAgICBhdHRyQXJncy5wdXNoLmFwcGx5KGF0dHJBcmdzLCBhbGwpO1xuICAgICAgZm9yICh2YXIgayBpbiBvbGRBdHRycykge1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSBvbGRBdHRyc1trXTtcbiAgICAgICAgYXR0ckFyZ3NbMF0gPSBrO1xuICAgICAgICBhdHRyQXJnc1sxXSA9IG9sZFZhbHVlO1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnZpc2l0QXR0cmlidXRlLmFwcGx5KHRoaXMsIGF0dHJBcmdzKTtcbiAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICAgIC8vIGNvcHkgb24gd3JpdGVcbiAgICAgICAgICBpZiAobmV3QXR0cnMgPT09IG9sZEF0dHJzKVxuICAgICAgICAgICAgbmV3QXR0cnMgPSBfYXNzaWduKHt9LCBvbGRBdHRycyk7XG4gICAgICAgICAgbmV3QXR0cnNba10gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXdBdHRycztcbiAgfSxcbiAgLy8gVHJhbnNmb3JtIHRoZSB2YWx1ZSBvZiBvbmUgYXR0cmlidXRlIG5hbWUvdmFsdWUgaW4gYW5cbiAgLy8gYXR0cmlidXRlcyBkaWN0aW9uYXJ5LlxuICB2aXNpdEF0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCB0YWcsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdCh2YWx1ZSwgLi4uYXJncyk7XG4gIH1cbn0pO1xuXG5cbmV4cG9ydCBjb25zdCBUb1RleHRWaXNpdG9yID0gVmlzaXRvci5leHRlbmQoKTtcblRvVGV4dFZpc2l0b3IuZGVmKHtcbiAgdmlzaXROdWxsOiBmdW5jdGlvbiAobnVsbE9yVW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICcnO1xuICB9LFxuICB2aXNpdFByaW1pdGl2ZTogZnVuY3Rpb24gKHN0cmluZ0Jvb2xlYW5Pck51bWJlcikge1xuICAgIHZhciBzdHIgPSBTdHJpbmcoc3RyaW5nQm9vbGVhbk9yTnVtYmVyKTtcbiAgICBpZiAodGhpcy50ZXh0TW9kZSA9PT0gVEVYVE1PREUuUkNEQVRBKSB7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpO1xuICAgIH0gZWxzZSBpZiAodGhpcy50ZXh0TW9kZSA9PT0gVEVYVE1PREUuQVRUUklCVVRFKSB7XG4gICAgICAvLyBlc2NhcGUgYCZgIGFuZCBgXCJgIHRoaXMgdGltZSwgbm90IGAmYCBhbmQgYDxgXG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfSxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgdmFyIHBhcnRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKylcbiAgICAgIHBhcnRzLnB1c2godGhpcy52aXNpdChhcnJheVtpXSkpO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKCcnKTtcbiAgfSxcbiAgdmlzaXRDb21tZW50OiBmdW5jdGlvbiAoY29tbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGhhdmUgYSBjb21tZW50IGhlcmVcIik7XG4gIH0sXG4gIHZpc2l0Q2hhclJlZjogZnVuY3Rpb24gKGNoYXJSZWYpIHtcbiAgICBpZiAodGhpcy50ZXh0TW9kZSA9PT0gVEVYVE1PREUuUkNEQVRBIHx8XG4gICAgICAgIHRoaXMudGV4dE1vZGUgPT09IFRFWFRNT0RFLkFUVFJJQlVURSkge1xuICAgICAgcmV0dXJuIGNoYXJSZWYuaHRtbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNoYXJSZWYuc3RyO1xuICAgIH1cbiAgfSxcbiAgdmlzaXRSYXc6IGZ1bmN0aW9uIChyYXcpIHtcbiAgICByZXR1cm4gcmF3LnZhbHVlO1xuICB9LFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgIC8vIFJlYWxseSB3ZSBzaG91bGQganVzdCBkaXNhbGxvdyBUYWdzIGhlcmUuICBIb3dldmVyLCBhdCB0aGVcbiAgICAvLyBtb21lbnQgaXQncyB1c2VmdWwgdG8gc3RyaW5naWZ5IGFueSBIVE1MIHdlIGZpbmQuICBJblxuICAgIC8vIHBhcnRpY3VsYXIsIHdoZW4geW91IGluY2x1ZGUgYSB0ZW1wbGF0ZSB3aXRoaW4gYHt7I21hcmtkb3dufX1gLFxuICAgIC8vIHdlIHJlbmRlciB0aGUgdGVtcGxhdGUgYXMgdGV4dCwgYW5kIHNpbmNlIHRoZXJlJ3MgY3VycmVudGx5XG4gICAgLy8gbm8gd2F5IHRvIG1ha2UgdGhlIHRlbXBsYXRlIGJlICpwYXJzZWQqIGFzIHRleHQgKGUuZy4gYDx0ZW1wbGF0ZVxuICAgIC8vIHR5cGU9XCJ0ZXh0XCI+YCksIHdlIGhhY2tpc2hseSBzdXBwb3J0IEhUTUwgdGFncyBpbiBtYXJrZG93blxuICAgIC8vIGluIHRlbXBsYXRlcyBieSBwYXJzaW5nIHRoZW0gYW5kIHN0cmluZ2lmeWluZyB0aGVtLlxuICAgIHJldHVybiB0aGlzLnZpc2l0KHRoaXMudG9IVE1MKHRhZykpO1xuICB9LFxuICB2aXNpdE9iamVjdDogZnVuY3Rpb24gKHgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIG9iamVjdCBpbiBodG1sanMgaW4gdG9UZXh0OiBcIiArIHgpO1xuICB9LFxuICB0b0hUTUw6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuIHRvSFRNTChub2RlKTtcbiAgfVxufSk7XG5cblxuXG5leHBvcnQgY29uc3QgVG9IVE1MVmlzaXRvciA9IFZpc2l0b3IuZXh0ZW5kKCk7XG5Ub0hUTUxWaXNpdG9yLmRlZih7XG4gIHZpc2l0TnVsbDogZnVuY3Rpb24gKG51bGxPclVuZGVmaW5lZCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcbiAgdmlzaXRQcmltaXRpdmU6IGZ1bmN0aW9uIChzdHJpbmdCb29sZWFuT3JOdW1iZXIpIHtcbiAgICB2YXIgc3RyID0gU3RyaW5nKHN0cmluZ0Jvb2xlYW5Pck51bWJlcik7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgfSxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgdmFyIHBhcnRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKylcbiAgICAgIHBhcnRzLnB1c2godGhpcy52aXNpdChhcnJheVtpXSkpO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKCcnKTtcbiAgfSxcbiAgdmlzaXRDb21tZW50OiBmdW5jdGlvbiAoY29tbWVudCkge1xuICAgIHJldHVybiAnPCEtLScgKyBjb21tZW50LnNhbml0aXplZFZhbHVlICsgJy0tPic7XG4gIH0sXG4gIHZpc2l0Q2hhclJlZjogZnVuY3Rpb24gKGNoYXJSZWYpIHtcbiAgICByZXR1cm4gY2hhclJlZi5odG1sO1xuICB9LFxuICB2aXNpdFJhdzogZnVuY3Rpb24gKHJhdykge1xuICAgIHJldHVybiByYXcudmFsdWU7XG4gIH0sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdmFyIGF0dHJTdHJzID0gW107XG5cbiAgICB2YXIgdGFnTmFtZSA9IHRhZy50YWdOYW1lO1xuICAgIHZhciBjaGlsZHJlbiA9IHRhZy5jaGlsZHJlbjtcblxuICAgIHZhciBhdHRycyA9IHRhZy5hdHRycztcbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIGF0dHJzID0gZmxhdHRlbkF0dHJpYnV0ZXMoYXR0cnMpO1xuICAgICAgZm9yICh2YXIgayBpbiBhdHRycykge1xuICAgICAgICBpZiAoayA9PT0gJ3ZhbHVlJyAmJiB0YWdOYW1lID09PSAndGV4dGFyZWEnKSB7XG4gICAgICAgICAgY2hpbGRyZW4gPSBbYXR0cnNba10sIGNoaWxkcmVuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdiA9IHRoaXMudG9UZXh0KGF0dHJzW2tdLCBURVhUTU9ERS5BVFRSSUJVVEUpO1xuICAgICAgICAgIGF0dHJTdHJzLnB1c2goJyAnICsgayArICc9XCInICsgdiArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0VGFnID0gJzwnICsgdGFnTmFtZSArIGF0dHJTdHJzLmpvaW4oJycpICsgJz4nO1xuXG4gICAgdmFyIGNoaWxkU3RycyA9IFtdO1xuICAgIHZhciBjb250ZW50O1xuICAgIGlmICh0YWdOYW1lID09PSAndGV4dGFyZWEnKSB7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgIGNoaWxkU3Rycy5wdXNoKHRoaXMudG9UZXh0KGNoaWxkcmVuW2ldLCBURVhUTU9ERS5SQ0RBVEEpKTtcblxuICAgICAgY29udGVudCA9IGNoaWxkU3Rycy5qb2luKCcnKTtcbiAgICAgIGlmIChjb250ZW50LnNsaWNlKDAsIDEpID09PSAnXFxuJylcbiAgICAgICAgLy8gVEVYVEFSRUEgd2lsbCBhYnNvcmIgYSBuZXdsaW5lLCBzbyBpZiB3ZSBzZWUgb25lLCBhZGRcbiAgICAgICAgLy8gYW5vdGhlciBvbmUuXG4gICAgICAgIGNvbnRlbnQgPSAnXFxuJyArIGNvbnRlbnQ7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcbiAgICAgICAgY2hpbGRTdHJzLnB1c2godGhpcy52aXNpdChjaGlsZHJlbltpXSkpO1xuXG4gICAgICBjb250ZW50ID0gY2hpbGRTdHJzLmpvaW4oJycpO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBzdGFydFRhZyArIGNvbnRlbnQ7XG5cbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIHx8ICEgaXNWb2lkRWxlbWVudCh0YWdOYW1lKSkge1xuICAgICAgLy8gXCJWb2lkXCIgZWxlbWVudHMgbGlrZSBCUiBhcmUgdGhlIG9ubHkgb25lcyB0aGF0IGRvbid0IGdldCBhIGNsb3NlXG4gICAgICAvLyB0YWcgaW4gSFRNTDUuICBUaGV5IHNob3VsZG4ndCBoYXZlIGNvbnRlbnRzLCBlaXRoZXIsIHNvIHdlIGNvdWxkXG4gICAgICAvLyB0aHJvdyBhbiBlcnJvciB1cG9uIHNlZWluZyBjb250ZW50cyBoZXJlLlxuICAgICAgcmVzdWx0ICs9ICc8LycgKyB0YWdOYW1lICsgJz4nO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHZpc2l0T2JqZWN0OiBmdW5jdGlvbiAoeCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgb2JqZWN0IGluIGh0bWxqcyBpbiB0b0hUTUw6IFwiICsgeCk7XG4gIH0sXG4gIHRvVGV4dDogZnVuY3Rpb24gKG5vZGUsIHRleHRNb2RlKSB7XG4gICAgcmV0dXJuIHRvVGV4dChub2RlLCB0ZXh0TW9kZSk7XG4gIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFRPSFRNTFxuXG5leHBvcnQgZnVuY3Rpb24gdG9IVE1MKGNvbnRlbnQpIHtcbiAgcmV0dXJuIChuZXcgVG9IVE1MVmlzaXRvcikudmlzaXQoY29udGVudCk7XG59XG5cbi8vIEVzY2FwaW5nIG1vZGVzIGZvciBvdXRwdXR0aW5nIHRleHQgd2hlbiBnZW5lcmF0aW5nIEhUTUwuXG5leHBvcnQgY29uc3QgVEVYVE1PREUgPSB7XG4gIFNUUklORzogMSxcbiAgUkNEQVRBOiAyLFxuICBBVFRSSUJVVEU6IDNcbn07XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRvVGV4dChjb250ZW50LCB0ZXh0TW9kZSkge1xuICBpZiAoISB0ZXh0TW9kZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0ZXh0TW9kZSByZXF1aXJlZCBmb3IgSFRNTC50b1RleHRcIik7XG4gIGlmICghICh0ZXh0TW9kZSA9PT0gVEVYVE1PREUuU1RSSU5HIHx8XG4gICAgICAgICB0ZXh0TW9kZSA9PT0gVEVYVE1PREUuUkNEQVRBIHx8XG4gICAgICAgICB0ZXh0TW9kZSA9PT0gVEVYVE1PREUuQVRUUklCVVRFKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRleHRNb2RlOiBcIiArIHRleHRNb2RlKTtcblxuICB2YXIgdmlzaXRvciA9IG5ldyBUb1RleHRWaXNpdG9yKHt0ZXh0TW9kZTogdGV4dE1vZGV9KTtcbiAgcmV0dXJuIHZpc2l0b3IudmlzaXQoY29udGVudCk7XG59XG4iXX0=
