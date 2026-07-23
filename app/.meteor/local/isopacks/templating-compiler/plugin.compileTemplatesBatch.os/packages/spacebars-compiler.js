Package["core-runtime"].queue("spacebars-compiler",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var HTML = Package.htmljs.HTML;
var HTMLTools = Package['html-tools'].HTMLTools;
var BlazeTools = Package['blaze-tools'].BlazeTools;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var SpacebarsCompiler;

var require = meteorInstall({"node_modules":{"meteor":{"spacebars-compiler":{"preamble.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/preamble.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({SpacebarsCompiler:()=>SpacebarsCompiler});let CodeGen,builtInBlockHelpers,isReservedName;module.link('./codegen',{CodeGen(v){CodeGen=v},builtInBlockHelpers(v){builtInBlockHelpers=v},isReservedName(v){isReservedName=v}},0);let optimize;module.link('./optimizer',{optimize(v){optimize=v}},1);let parse,compile,codeGen,TemplateTagReplacer,beautify;module.link('./compiler',{parse(v){parse=v},compile(v){compile=v},codeGen(v){codeGen=v},TemplateTagReplacer(v){TemplateTagReplacer=v},beautify(v){beautify=v}},2);let TemplateTag;module.link('./templatetag',{TemplateTag(v){TemplateTag=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();



module.runSetters(SpacebarsCompiler = {
    CodeGen,
    _builtInBlockHelpers: builtInBlockHelpers,
    isReservedName,
    optimize,
    parse,
    compile,
    codeGen,
    _TemplateTagReplacer: TemplateTagReplacer,
    _beautify: beautify,
    TemplateTag
},["SpacebarsCompiler"]);

//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"codegen.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/codegen.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({CodeGen:()=>CodeGen,isReservedName:()=>isReservedName});module.export({builtInBlockHelpers:()=>builtInBlockHelpers},true);let HTMLTools;module.link('meteor/html-tools',{HTMLTools(v){HTMLTools=v}},0);let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},1);let BlazeTools;module.link('meteor/blaze-tools',{BlazeTools(v){BlazeTools=v}},2);let codeGen;module.link('./compiler',{codeGen(v){codeGen=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();



// ============================================================
// Code-generation of template tags
// The `CodeGen` class currently has no instance state, but in theory
// it could be useful to track per-function state, like whether we
// need to emit `var self = this` or not.
function CodeGen() {}
const builtInBlockHelpers = {
    'if': 'Blaze.If',
    'unless': 'Blaze.Unless',
    'with': 'Spacebars.With',
    'each': 'Blaze.Each',
    'let': 'Blaze.Let'
};
// Mapping of "macros" which, when preceded by `Template.`, expand
// to special code rather than following the lookup rules for dotted
// symbols.
var builtInTemplateMacros = {
    // `view` is a local variable defined in the generated render
    // function for the template in which `Template.contentBlock` or
    // `Template.elseBlock` is invoked.
    'contentBlock': 'view.templateContentBlock',
    'elseBlock': 'view.templateElseBlock',
    // Confusingly, this makes `{{> Template.dynamic}}` an alias
    // for `{{> __dynamic}}`, where "__dynamic" is the template that
    // implements the dynamic template feature.
    'dynamic': 'Template.__dynamic',
    'subscriptionsReady': 'view.templateInstance().subscriptionsReady()'
};
var additionalReservedNames = [
    "body",
    "toString",
    "instance",
    "constructor",
    "toString",
    "toLocaleString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "__defineGetter__",
    "__lookupGetter__",
    "__defineSetter__",
    "__lookupSetter__",
    "__proto__",
    "dynamic",
    "registerHelper",
    "currentData",
    "parentData",
    "_migrateTemplate",
    "_applyHmrChanges",
    "__pendingReplacement"
];
// A "reserved name" can't be used as a <template> name.  This
// function is used by the template file scanner.
//
// Note that the runtime imposes additional restrictions, for example
// banning the name "body" and names of built-in object properties
// like "toString".
function isReservedName(name) {
    return builtInBlockHelpers.hasOwnProperty(name) || builtInTemplateMacros.hasOwnProperty(name) || additionalReservedNames.includes(name);
}
var makeObjectLiteral = function(obj) {
    var parts = [];
    for(var k in obj)parts.push(BlazeTools.toObjectLiteralKey(k) + ': ' + obj[k]);
    return '{' + parts.join(', ') + '}';
};
Object.assign(CodeGen.prototype, {
    codeGenTemplateTag: function(tag) {
        var self = this;
        if (tag.position === HTMLTools.TEMPLATE_TAG_POSITION.IN_START_TAG) {
            // Special dynamic attributes: `<div {{attrs}}>...`
            // only `tag.type === 'DOUBLE'` allowed (by earlier validation)
            return BlazeTools.EmitCode('function () { return ' + self.codeGenMustache(tag.path, tag.args, 'attrMustache') + '; }');
        } else {
            if (tag.type === 'DOUBLE' || tag.type === 'TRIPLE') {
                var code = self.codeGenMustache(tag.path, tag.args);
                if (tag.type === 'TRIPLE') {
                    code = 'Spacebars.makeRaw(' + code + ')';
                }
                if (tag.position !== HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
                    // Reactive attributes are already wrapped in a function,
                    // and there's no fine-grained reactivity.
                    // Anywhere else, we need to create a View.
                    code = 'Blaze.View(' + BlazeTools.toJSLiteral('lookup:' + tag.path.join('.')) + ', ' + 'function () { return ' + code + '; })';
                }
                return BlazeTools.EmitCode(code);
            } else if (tag.type === 'INCLUSION' || tag.type === 'BLOCKOPEN') {
                var path = tag.path;
                var args = tag.args;
                if (tag.type === 'BLOCKOPEN' && builtInBlockHelpers.hasOwnProperty(path[0])) {
                    // if, unless, with, each.
                    //
                    // If someone tries to do `{{> if}}`, we don't
                    // get here, but an error is thrown when we try to codegen the path.
                    // Note: If we caught these errors earlier, while scanning, we'd be able to
                    // provide nice line numbers.
                    if (path.length > 1) throw new Error("Unexpected dotted path beginning with " + path[0]);
                    if (!args.length) throw new Error("#" + path[0] + " requires an argument");
                    var dataCode = null;
                    // #each has a special treatment as it features two different forms:
                    // - {{#each people}}
                    // - {{#each person in people}}
                    if (path[0] === 'each' && args.length >= 2 && args[1][0] === 'PATH' && args[1][1].length && args[1][1][0] === 'in') {
                        // minimum conditions are met for each-in.  now validate this
                        // isn't some weird case.
                        var eachUsage = "Use either {{#each items}} or " + "{{#each item in items}} form of #each.";
                        var inArg = args[1];
                        if (!(args.length >= 3 && inArg[1].length === 1)) {
                            // we don't have at least 3 space-separated parts after #each, or
                            // inArg doesn't look like ['PATH',['in']]
                            throw new Error("Malformed #each. " + eachUsage);
                        }
                        // split out the variable name and sequence arguments
                        var variableArg = args[0];
                        if (!(variableArg[0] === "PATH" && variableArg[1].length === 1 && variableArg[1][0].replace(/\./g, ''))) {
                            throw new Error("Bad variable name in #each");
                        }
                        var variable = variableArg[1][0];
                        dataCode = 'function () { return { _sequence: ' + self.codeGenInclusionData(args.slice(2)) + ', _variable: ' + BlazeTools.toJSLiteral(variable) + ' }; }';
                    } else if (path[0] === 'let') {
                        var dataProps = {};
                        args.forEach(function(arg) {
                            if (arg.length !== 3) {
                                // not a keyword arg (x=y)
                                throw new Error("Incorrect form of #let");
                            }
                            var argKey = arg[2];
                            dataProps[argKey] = 'function () { return Spacebars.call(' + self.codeGenArgValue(arg) + '); }';
                        });
                        dataCode = makeObjectLiteral(dataProps);
                    }
                    if (!dataCode) {
                        // `args` must exist (tag.args.length > 0)
                        dataCode = self.codeGenInclusionDataFunc(args) || 'null';
                    }
                    // `content` must exist
                    var contentBlock = 'content' in tag ? self.codeGenBlock(tag.content) : null;
                    // `elseContent` may not exist
                    var elseContentBlock = 'elseContent' in tag ? self.codeGenBlock(tag.elseContent) : null;
                    var callArgs = [
                        dataCode,
                        contentBlock
                    ];
                    if (elseContentBlock) callArgs.push(elseContentBlock);
                    return BlazeTools.EmitCode(builtInBlockHelpers[path[0]] + '(' + callArgs.join(', ') + ')');
                } else {
                    var compCode = self.codeGenPath(path, {
                        lookupTemplate: true
                    });
                    if (path.length > 1) {
                        // capture reactivity
                        compCode = 'function () { return Spacebars.call(' + compCode + '); }';
                    }
                    var dataCode = self.codeGenInclusionDataFunc(tag.args);
                    var content = 'content' in tag ? self.codeGenBlock(tag.content) : null;
                    var elseContent = 'elseContent' in tag ? self.codeGenBlock(tag.elseContent) : null;
                    var includeArgs = [
                        compCode
                    ];
                    if (content) {
                        includeArgs.push(content);
                        if (elseContent) includeArgs.push(elseContent);
                    }
                    var includeCode = 'Spacebars.include(' + includeArgs.join(', ') + ')';
                    // calling convention compat -- set the data context around the
                    // entire inclusion, so that if the name of the inclusion is
                    // a helper function, it gets the data context in `this`.
                    // This makes for a pretty confusing calling convention --
                    // In `{{#foo bar}}`, `foo` is evaluated in the context of `bar`
                    // -- but it's what we shipped for 0.8.0.  The rationale is that
                    // `{{#foo bar}}` is sugar for `{{#with bar}}{{#foo}}...`.
                    if (dataCode) {
                        includeCode = 'Blaze._TemplateWith(' + dataCode + ', function () { return ' + includeCode + '; })';
                    }
                    // XXX BACK COMPAT - UI is the old name, Template is the new
                    if ((path[0] === 'UI' || path[0] === 'Template') && (path[1] === 'contentBlock' || path[1] === 'elseBlock')) {
                        // Call contentBlock and elseBlock in the appropriate scope
                        includeCode = 'Blaze._InOuterTemplateScope(view, function () { return ' + includeCode + '; })';
                    }
                    return BlazeTools.EmitCode(includeCode);
                }
            } else if (tag.type === 'ESCAPE') {
                return tag.value;
            } else {
                // Can't get here; TemplateTag validation should catch any
                // inappropriate tag types that might come out of the parser.
                throw new Error("Unexpected template tag type: " + tag.type);
            }
        }
    },
    // `path` is an array of at least one string.
    //
    // If `path.length > 1`, the generated code may be reactive
    // (i.e. it may invalidate the current computation).
    //
    // No code is generated to call the result if it's a function.
    //
    // Options:
    //
    // - lookupTemplate {Boolean} If true, generated code also looks in
    //   the list of templates. (After helpers, before data context).
    //   Used when generating code for `{{> foo}}` or `{{#foo}}`. Only
    //   used for non-dotted paths.
    codeGenPath: function(path, opts) {
        if (builtInBlockHelpers.hasOwnProperty(path[0])) throw new Error("Can't use the built-in '" + path[0] + "' here");
        // Let `{{#if Template.contentBlock}}` check whether this template was
        // invoked via inclusion or as a block helper, in addition to supporting
        // `{{> Template.contentBlock}}`.
        // XXX BACK COMPAT - UI is the old name, Template is the new
        if (path.length >= 2 && (path[0] === 'UI' || path[0] === 'Template') && builtInTemplateMacros.hasOwnProperty(path[1])) {
            if (path.length > 2) throw new Error("Unexpected dotted path beginning with " + path[0] + '.' + path[1]);
            return builtInTemplateMacros[path[1]];
        }
        var firstPathItem = BlazeTools.toJSLiteral(path[0]);
        var lookupMethod = 'lookup';
        if (opts && opts.lookupTemplate && path.length === 1) lookupMethod = 'lookupTemplate';
        var code = 'view.' + lookupMethod + '(' + firstPathItem + ')';
        if (path.length > 1) {
            code = 'Spacebars.dot(' + code + ', ' + path.slice(1).map(BlazeTools.toJSLiteral).join(', ') + ')';
        }
        return code;
    },
    // Generates code for an `[argType, argValue]` argument spec,
    // ignoring the third element (keyword argument name) if present.
    //
    // The resulting code may be reactive (in the case of a PATH of
    // more than one element) and is not wrapped in a closure.
    codeGenArgValue: function(arg) {
        var self = this;
        var argType = arg[0];
        var argValue = arg[1];
        var argCode;
        switch(argType){
            case 'STRING':
            case 'NUMBER':
            case 'BOOLEAN':
            case 'NULL':
                argCode = BlazeTools.toJSLiteral(argValue);
                break;
            case 'PATH':
                argCode = self.codeGenPath(argValue);
                break;
            case 'EXPR':
                // The format of EXPR is ['EXPR', { type: 'EXPR', path: [...], args: { ... } }]
                argCode = self.codeGenMustache(argValue.path, argValue.args, 'dataMustache');
                break;
            default:
                // can't get here
                throw new Error("Unexpected arg type: " + argType);
        }
        return argCode;
    },
    // Generates a call to `Spacebars.fooMustache` on evaluated arguments.
    // The resulting code has no function literals and must be wrapped in
    // one for fine-grained reactivity.
    codeGenMustache: function(path, args, mustacheType) {
        var self = this;
        var nameCode = self.codeGenPath(path);
        var argCode = self.codeGenMustacheArgs(args);
        var mustache = mustacheType || 'mustache';
        return 'Spacebars.' + mustache + '(' + nameCode + (argCode ? ', ' + argCode.join(', ') : '') + ')';
    },
    // returns: array of source strings, or null if no
    // args at all.
    codeGenMustacheArgs: function(tagArgs) {
        var self = this;
        var kwArgs = null; // source -> source
        var args = null; // [source]
        // tagArgs may be null
        tagArgs.forEach(function(arg) {
            var argCode = self.codeGenArgValue(arg);
            if (arg.length > 2) {
                // keyword argument (represented as [type, value, name])
                kwArgs = kwArgs || {};
                kwArgs[arg[2]] = argCode;
            } else {
                // positional argument
                args = args || [];
                args.push(argCode);
            }
        });
        // put kwArgs in options dictionary at end of args
        if (kwArgs) {
            args = args || [];
            args.push('Spacebars.kw(' + makeObjectLiteral(kwArgs) + ')');
        }
        return args;
    },
    codeGenBlock: function(content) {
        return codeGen(content);
    },
    codeGenInclusionData: function(args) {
        var self = this;
        if (!args.length) {
            // e.g. `{{#foo}}`
            return null;
        } else if (args[0].length === 3) {
            // keyword arguments only, e.g. `{{> point x=1 y=2}}`
            var dataProps = {};
            args.forEach(function(arg) {
                var argKey = arg[2];
                dataProps[argKey] = 'Spacebars.call(' + self.codeGenArgValue(arg) + ')';
            });
            return makeObjectLiteral(dataProps);
        } else if (args[0][0] !== 'PATH') {
            // literal first argument, e.g. `{{> foo "blah"}}`
            //
            // tag validation has confirmed, in this case, that there is only
            // one argument (`args.length === 1`)
            return self.codeGenArgValue(args[0]);
        } else if (args.length === 1) {
            // one argument, must be a PATH
            return 'Spacebars.call(' + self.codeGenPath(args[0][1]) + ')';
        } else {
            // Multiple positional arguments; treat them as a nested
            // "data mustache"
            return self.codeGenMustache(args[0][1], args.slice(1), 'dataMustache');
        }
    },
    codeGenInclusionDataFunc: function(args) {
        var self = this;
        var dataCode = self.codeGenInclusionData(args);
        if (dataCode) {
            return 'function () { return ' + dataCode + '; }';
        } else {
            return null;
        }
    }
});
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"compiler.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/compiler.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({parse:()=>parse,compile:()=>compile,codeGen:()=>codeGen,beautify:()=>beautify});module.export({TemplateTagReplacer:()=>TemplateTagReplacer},true);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},0);let HTMLTools;module.link('meteor/html-tools',{HTMLTools(v){HTMLTools=v}},1);let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},2);let BlazeTools;module.link('meteor/blaze-tools',{BlazeTools(v){BlazeTools=v}},3);let CodeGen;module.link('./codegen',{CodeGen(v){CodeGen=v}},4);let optimize;module.link('./optimizer',{optimize(v){optimize=v}},5);let ReactComponentSiblingForbidder;module.link('./react',{ReactComponentSiblingForbidder(v){ReactComponentSiblingForbidder=v}},6);let TemplateTag;module.link('./templatetag',{TemplateTag(v){TemplateTag=v}},7);let removeWhitespace;module.link('./whitespace',{removeWhitespace(v){removeWhitespace=v}},8);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();








var UglifyJSMinify = null;
if (Meteor.isServer) {
    UglifyJSMinify = Npm.require('uglify-js').minify;
}
function parse(input) {
    return HTMLTools.parseFragment(input, {
        getTemplateTag: TemplateTag.parseCompleteTag
    });
}
function compile(input, options) {
    var tree = parse(input);
    return codeGen(tree, options);
}
const TemplateTagReplacer = HTML.TransformingVisitor.extend();
TemplateTagReplacer.def({
    visitObject: function(x) {
        if (x instanceof HTMLTools.TemplateTag) {
            // Make sure all TemplateTags in attributes have the right
            // `.position` set on them.  This is a bit of a hack
            // (we shouldn't be mutating that here), but it allows
            // cleaner codegen of "synthetic" attributes like TEXTAREA's
            // "value", where the template tags were originally not
            // in an attribute.
            if (this.inAttributeValue) x.position = HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE;
            return this.codegen.codeGenTemplateTag(x);
        }
        return HTML.TransformingVisitor.prototype.visitObject.call(this, x);
    },
    visitAttributes: function(attrs) {
        if (attrs instanceof HTMLTools.TemplateTag) return this.codegen.codeGenTemplateTag(attrs);
        // call super (e.g. for case where `attrs` is an array)
        return HTML.TransformingVisitor.prototype.visitAttributes.call(this, attrs);
    },
    visitAttribute: function(name, value, tag) {
        this.inAttributeValue = true;
        var result = this.visit(value);
        this.inAttributeValue = false;
        if (result !== value) {
            // some template tags must have been replaced, because otherwise
            // we try to keep things `===` when transforming.  Wrap the code
            // in a function as per the rules.  You can't have
            // `{id: Blaze.View(...)}` as an attributes dict because the View
            // would be rendered more than once; you need to wrap it in a function
            // so that it's a different View each time.
            return BlazeTools.EmitCode(this.codegen.codeGenBlock(result));
        }
        return result;
    }
});
function codeGen(parseTree, options) {
    // is this a template, rather than a block passed to
    // a block helper, say
    var isTemplate = options && options.isTemplate;
    var isBody = options && options.isBody;
    var whitespace = options && options.whitespace;
    var sourceName = options && options.sourceName;
    var tree = parseTree;
    // The flags `isTemplate` and `isBody` are kind of a hack.
    if (isTemplate || isBody) {
        if (typeof whitespace === 'string' && whitespace.toLowerCase() === 'strip') {
            tree = removeWhitespace(tree);
        }
        // optimizing fragments would require being smarter about whether we are
        // in a TEXTAREA, say.
        tree = optimize(tree);
    }
    // throws an error if using `{{> React}}` with siblings
    new ReactComponentSiblingForbidder({
        sourceName: sourceName
    }).visit(tree);
    var codegen = new CodeGen;
    tree = new TemplateTagReplacer({
        codegen: codegen
    }).visit(tree);
    var code = '(function () { ';
    if (isTemplate || isBody) {
        code += 'var view = this; ';
    }
    code += 'return ';
    code += BlazeTools.toJS(tree);
    code += '; })';
    code = beautify(code);
    return code;
}
function beautify(code) {
    if (!UglifyJSMinify) {
        return code;
    }
    var result = UglifyJSMinify(code, {
        mangle: false,
        compress: false,
        output: {
            beautify: true,
            indent_level: 2,
            width: 80
        }
    });
    var output = result.code;
    // Uglify interprets our expression as a statement and may add a semicolon.
    // Strip trailing semicolon.
    output = output.replace(/;$/, '');
    return output;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"optimizer.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/optimizer.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({toRaw:()=>toRaw,optimize:()=>optimize});module.export({TreeTransformer:()=>TreeTransformer},true);let HTMLTools;module.link('meteor/html-tools',{HTMLTools(v){HTMLTools=v}},0);let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

// Optimize parts of an HTMLjs tree into raw HTML strings when they don't
// contain template tags.
var constant = function(value) {
    return function() {
        return value;
    };
};
var OPTIMIZABLE = {
    NONE: 0,
    PARTS: 1,
    FULL: 2
};
// We can only turn content into an HTML string if it contains no template
// tags and no "tricky" HTML tags.  If we can optimize the entire content
// into a string, we return OPTIMIZABLE.FULL.  If the we are given an
// unoptimizable node, we return OPTIMIZABLE.NONE.  If we are given a tree
// that contains an unoptimizable node somewhere, we return OPTIMIZABLE.PARTS.
//
// For example, we always create SVG elements programmatically, since SVG
// doesn't have innerHTML.  If we are given an SVG element, we return NONE.
// However, if we are given a big tree that contains SVG somewhere, we
// return PARTS so that the optimizer can descend into the tree and optimize
// other parts of it.
var CanOptimizeVisitor = HTML.Visitor.extend();
CanOptimizeVisitor.def({
    visitNull: constant(OPTIMIZABLE.FULL),
    visitPrimitive: constant(OPTIMIZABLE.FULL),
    visitComment: constant(OPTIMIZABLE.FULL),
    visitCharRef: constant(OPTIMIZABLE.FULL),
    visitRaw: constant(OPTIMIZABLE.FULL),
    visitObject: constant(OPTIMIZABLE.NONE),
    visitFunction: constant(OPTIMIZABLE.NONE),
    visitArray: function(x) {
        for(var i = 0; i < x.length; i++)if (this.visit(x[i]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
        return OPTIMIZABLE.FULL;
    },
    visitTag: function(tag) {
        var tagName = tag.tagName;
        if (tagName === 'textarea') {
            // optimizing into a TEXTAREA's RCDATA would require being a little
            // more clever.
            return OPTIMIZABLE.NONE;
        } else if (tagName === 'script') {
            // script tags don't work when rendered from strings
            return OPTIMIZABLE.NONE;
        } else if (!(HTML.isKnownElement(tagName) && !HTML.isKnownSVGElement(tagName))) {
            // foreign elements like SVG can't be stringified for innerHTML.
            return OPTIMIZABLE.NONE;
        } else if (tagName === 'table') {
            // Avoid ever producing HTML containing `<table><tr>...`, because the
            // browser will insert a TBODY.  If we just `createElement("table")` and
            // `createElement("tr")`, on the other hand, no TBODY is necessary
            // (assuming IE 8+).
            return OPTIMIZABLE.PARTS;
        } else if (tagName === 'tr') {
            return OPTIMIZABLE.PARTS;
        }
        var children = tag.children;
        for(var i = 0; i < children.length; i++)if (this.visit(children[i]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
        if (this.visitAttributes(tag.attrs) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
        return OPTIMIZABLE.FULL;
    },
    visitAttributes: function(attrs) {
        if (attrs) {
            var isArray = HTML.isArray(attrs);
            for(var i = 0; i < (isArray ? attrs.length : 1); i++){
                var a = isArray ? attrs[i] : attrs;
                if (typeof a !== 'object' || a instanceof HTMLTools.TemplateTag) return OPTIMIZABLE.PARTS;
                for(var k in a)if (this.visit(a[k]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
            }
        }
        return OPTIMIZABLE.FULL;
    }
});
var getOptimizability = function(content) {
    return (new CanOptimizeVisitor).visit(content);
};
function toRaw(x) {
    return HTML.Raw(HTML.toHTML(x));
}
const TreeTransformer = HTML.TransformingVisitor.extend();
TreeTransformer.def({
    visitAttributes: function(...args) {
        const [attrs] = args;
        // pass template tags through by default
        if (attrs instanceof HTMLTools.TemplateTag) return attrs;
        return HTML.TransformingVisitor.prototype.visitAttributes.apply(this, args);
    }
});
// Replace parts of the HTMLjs tree that have no template tags (or
// tricky HTML tags) with HTML.Raw objects containing raw HTML.
var OptimizingVisitor = TreeTransformer.extend();
OptimizingVisitor.def({
    visitNull: toRaw,
    visitPrimitive: toRaw,
    visitComment: toRaw,
    visitCharRef: toRaw,
    visitArray: function(array) {
        var optimizability = getOptimizability(array);
        if (optimizability === OPTIMIZABLE.FULL) {
            return toRaw(array);
        } else if (optimizability === OPTIMIZABLE.PARTS) {
            return TreeTransformer.prototype.visitArray.call(this, array);
        } else {
            return array;
        }
    },
    visitTag: function(tag) {
        var optimizability = getOptimizability(tag);
        if (optimizability === OPTIMIZABLE.FULL) {
            return toRaw(tag);
        } else if (optimizability === OPTIMIZABLE.PARTS) {
            return TreeTransformer.prototype.visitTag.call(this, tag);
        } else {
            return tag;
        }
    },
    visitChildren: function(children) {
        // don't optimize the children array into a Raw object!
        return TreeTransformer.prototype.visitArray.call(this, children);
    },
    visitAttributes: function(attrs) {
        return attrs;
    }
});
// Combine consecutive HTML.Raws.  Remove empty ones.
var RawCompactingVisitor = TreeTransformer.extend();
RawCompactingVisitor.def({
    visitArray: function(array) {
        var result = [];
        for(var i = 0; i < array.length; i++){
            var item = array[i];
            if (item instanceof HTML.Raw && (!item.value || result.length && result[result.length - 1] instanceof HTML.Raw)) {
                // two cases: item is an empty Raw, or previous item is
                // a Raw as well.  In the latter case, replace the previous
                // Raw with a longer one that includes the new Raw.
                if (item.value) {
                    result[result.length - 1] = HTML.Raw(result[result.length - 1].value + item.value);
                }
            } else {
                result.push(this.visit(item));
            }
        }
        return result;
    }
});
// Replace pointless Raws like `HTMl.Raw('foo')` that contain no special
// characters with simple strings.
var RawReplacingVisitor = TreeTransformer.extend();
RawReplacingVisitor.def({
    visitRaw: function(raw) {
        var html = raw.value;
        if (html.indexOf('&') < 0 && html.indexOf('<') < 0) {
            return html;
        } else {
            return raw;
        }
    }
});
function optimize(tree) {
    tree = (new OptimizingVisitor).visit(tree);
    tree = (new RawCompactingVisitor).visit(tree);
    tree = (new RawReplacingVisitor).visit(tree);
    return tree;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"react.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/react.js                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({ReactComponentSiblingForbidder:()=>ReactComponentSiblingForbidder},true);let HTMLTools;module.link('meteor/html-tools',{HTMLTools(v){HTMLTools=v}},0);let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},1);let BlazeTools;module.link('meteor/blaze-tools',{BlazeTools(v){BlazeTools=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();


// A visitor to ensure that React components included via the `{{>
// React}}` template defined in the react-template-helper package are
// the only child in their parent component. Otherwise `React.render`
// would eliminate all of their sibling nodes.
//
// It's a little strange that this logic is in spacebars-compiler if
// it's only relevant to a specific package but there's no way to have
// a package hook into a build plugin.
const ReactComponentSiblingForbidder = HTML.Visitor.extend();
ReactComponentSiblingForbidder.def({
    visitArray: function(array, parentTag) {
        for(var i = 0; i < array.length; i++){
            this.visit(array[i], parentTag);
        }
    },
    visitObject: function(obj, parentTag) {
        if (obj.type === "INCLUSION" && obj.path.length === 1 && obj.path[0] === "React") {
            if (!parentTag) {
                throw new Error("{{> React}} must be used in a container element" + (this.sourceName ? " in " + this.sourceName : "") + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
            }
            var numSiblings = 0;
            for(var i = 0; i < parentTag.children.length; i++){
                var child = parentTag.children[i];
                if (child !== obj && !(typeof child === "string" && child.match(/^\s*$/))) {
                    numSiblings++;
                }
            }
            if (numSiblings > 0) {
                throw new Error("{{> React}} must be used as the only child in a container element" + (this.sourceName ? " in " + this.sourceName : "") + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
            }
        }
    },
    visitTag: function(tag) {
        this.visitArray(tag.children, tag /*parentTag*/ );
    }
});
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"templatetag.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/templatetag.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({TemplateTag:()=>TemplateTag});let HTMLTools;module.link('meteor/html-tools',{HTMLTools(v){HTMLTools=v}},0);let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},1);let BlazeTools;module.link('meteor/blaze-tools',{BlazeTools(v){BlazeTools=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();


// A TemplateTag is the result of parsing a single `{{...}}` tag.
//
// The `.type` of a TemplateTag is one of:
//
// - `"DOUBLE"` - `{{foo}}`
// - `"TRIPLE"` - `{{{foo}}}`
// - `"EXPR"` - `(foo)`
// - `"COMMENT"` - `{{! foo}}`
// - `"BLOCKCOMMENT" - `{{!-- foo--}}`
// - `"INCLUSION"` - `{{> foo}}`
// - `"BLOCKOPEN"` - `{{#foo}}`
// - `"BLOCKCLOSE"` - `{{/foo}}`
// - `"ELSE"` - `{{else}}`
// - `"ESCAPE"` - `{{|`, `{{{|`, `{{{{|` and so on
//
// Besides `type`, the mandatory properties of a TemplateTag are:
//
// - `path` - An array of one or more strings.  The path of `{{foo.bar}}`
//   is `["foo", "bar"]`.  Applies to DOUBLE, TRIPLE, INCLUSION, BLOCKOPEN,
//   BLOCKCLOSE, and ELSE.
//
// - `args` - An array of zero or more argument specs.  An argument spec
//   is a two or three element array, consisting of a type, value, and
//   optional keyword name.  For example, the `args` of `{{foo "bar" x=3}}`
//   are `[["STRING", "bar"], ["NUMBER", 3, "x"]]`.  Applies to DOUBLE,
//   TRIPLE, INCLUSION, BLOCKOPEN, and ELSE.
//
// - `value` - A string of the comment's text. Applies to COMMENT and
//   BLOCKCOMMENT.
//
// These additional are typically set during parsing:
//
// - `position` - The HTMLTools.TEMPLATE_TAG_POSITION specifying at what sort
//   of site the TemplateTag was encountered (e.g. at element level or as
//   part of an attribute value). Its absence implies
//   TEMPLATE_TAG_POSITION.ELEMENT.
//
// - `content` and `elseContent` - When a BLOCKOPEN tag's contents are
//   parsed, they are put here.  `elseContent` will only be present if
//   an `{{else}}` was found.
var TEMPLATE_TAG_POSITION = HTMLTools.TEMPLATE_TAG_POSITION;
function TemplateTag(...args) {
    HTMLTools.TemplateTag.apply(this, args);
}
TemplateTag.prototype = new HTMLTools.TemplateTag;
TemplateTag.prototype.constructorName = 'SpacebarsCompiler.TemplateTag';
var makeStacheTagStartRegex = function(r) {
    return new RegExp(r.source + /(?![{>!#/])/.source, r.ignoreCase ? 'i' : '');
};
// "starts" regexes are used to see what type of template
// tag the parser is looking at.  They must match a non-empty
// result, but not the interesting part of the tag.
var starts = {
    ESCAPE: /^\{\{(?=\{*\|)/,
    ELSE: makeStacheTagStartRegex(/^\{\{\s*else(\s+(?!\s)|(?=[}]))/i),
    DOUBLE: makeStacheTagStartRegex(/^\{\{\s*(?!\s)/),
    TRIPLE: makeStacheTagStartRegex(/^\{\{\{\s*(?!\s)/),
    BLOCKCOMMENT: makeStacheTagStartRegex(/^\{\{\s*!--/),
    COMMENT: makeStacheTagStartRegex(/^\{\{\s*!/),
    INCLUSION: makeStacheTagStartRegex(/^\{\{\s*>\s*(?!\s)/),
    BLOCKOPEN: makeStacheTagStartRegex(/^\{\{\s*#\s*(?!\s)/),
    BLOCKCLOSE: makeStacheTagStartRegex(/^\{\{\s*\/\s*(?!\s)/)
};
var ends = {
    DOUBLE: /^\s*\}\}/,
    TRIPLE: /^\s*\}\}\}/,
    EXPR: /^\s*\)/
};
var endsString = {
    DOUBLE: '}}',
    TRIPLE: '}}}',
    EXPR: ')'
};
// Parse a tag from the provided scanner or string.  If the input
// doesn't start with `{{`, returns null.  Otherwise, either succeeds
// and returns a SpacebarsCompiler.TemplateTag, or throws an error (using
// `scanner.fatal` if a scanner is provided).
TemplateTag.parse = function(scannerOrString) {
    var scanner = scannerOrString;
    if (typeof scanner === 'string') scanner = new HTMLTools.Scanner(scannerOrString);
    if (!(scanner.peek() === '{' && scanner.rest().slice(0, 2) === '{{')) return null;
    var run = function(regex) {
        // regex is assumed to start with `^`
        var result = regex.exec(scanner.rest());
        if (!result) return null;
        var ret = result[0];
        scanner.pos += ret.length;
        return ret;
    };
    var advance = function(amount) {
        scanner.pos += amount;
    };
    var scanIdentifier = function(isFirstInPath) {
        var id = BlazeTools.parseExtendedIdentifierName(scanner);
        if (!id) {
            expected('IDENTIFIER');
        }
        if (isFirstInPath && (id === 'null' || id === 'true' || id === 'false')) scanner.fatal("Can't use null, true, or false, as an identifier at start of path");
        return id;
    };
    var scanPath = function() {
        var segments = [];
        // handle initial `.`, `..`, `./`, `../`, `../..`, `../../`, etc
        var dots;
        if (dots = run(/^[\.\/]+/)) {
            var ancestorStr = '.'; // eg `../../..` maps to `....`
            var endsWithSlash = /\/$/.test(dots);
            if (endsWithSlash) dots = dots.slice(0, -1);
            dots.split('/').forEach(function(dotClause, index) {
                if (index === 0) {
                    if (dotClause !== '.' && dotClause !== '..') expected("`.`, `..`, `./` or `../`");
                } else {
                    if (dotClause !== '..') expected("`..` or `../`");
                }
                if (dotClause === '..') ancestorStr += '.';
            });
            segments.push(ancestorStr);
            if (!endsWithSlash) return segments;
        }
        while(true){
            // scan a path segment
            if (run(/^\[/)) {
                var seg = run(/^[\s\S]*?\]/);
                if (!seg) error("Unterminated path segment");
                seg = seg.slice(0, -1);
                if (!seg && !segments.length) error("Path can't start with empty string");
                segments.push(seg);
            } else {
                var id = scanIdentifier(!segments.length);
                if (id === 'this') {
                    if (!segments.length) {
                        // initial `this`
                        segments.push('.');
                    } else {
                        error("Can only use `this` at the beginning of a path.\nInstead of `foo.this` or `../this`, just write `foo` or `..`.");
                    }
                } else {
                    segments.push(id);
                }
            }
            var sep = run(/^[\.\/]/);
            if (!sep) break;
        }
        return segments;
    };
    // scan the keyword portion of a keyword argument
    // (the "foo" portion in "foo=bar").
    // Result is either the keyword matched, or null
    // if we're not at a keyword argument position.
    var scanArgKeyword = function() {
        var match = /^([^\{\}\(\)\>#=\s"'\[\]]+)\s*=\s*/.exec(scanner.rest());
        if (match) {
            scanner.pos += match[0].length;
            return match[1];
        } else {
            return null;
        }
    };
    // scan an argument; succeeds or errors.
    // Result is an array of two or three items:
    // type , value, and (indicating a keyword argument)
    // keyword name.
    var scanArg = function() {
        var keyword = scanArgKeyword(); // null if not parsing a kwarg
        var value = scanArgValue();
        return keyword ? value.concat(keyword) : value;
    };
    // scan an argument value (for keyword or positional arguments);
    // succeeds or errors.  Result is an array of type, value.
    var scanArgValue = function() {
        var startPos = scanner.pos;
        var result;
        if (result = BlazeTools.parseNumber(scanner)) {
            return [
                'NUMBER',
                result.value
            ];
        } else if (result = BlazeTools.parseStringLiteral(scanner)) {
            return [
                'STRING',
                result.value
            ];
        } else if (/^[\.\[]/.test(scanner.peek())) {
            return [
                'PATH',
                scanPath()
            ];
        } else if (run(/^\(/)) {
            return [
                'EXPR',
                scanExpr('EXPR')
            ];
        } else if (result = BlazeTools.parseExtendedIdentifierName(scanner)) {
            var id = result;
            if (id === 'null') {
                return [
                    'NULL',
                    null
                ];
            } else if (id === 'true' || id === 'false') {
                return [
                    'BOOLEAN',
                    id === 'true'
                ];
            } else {
                scanner.pos = startPos; // unconsume `id`
                return [
                    'PATH',
                    scanPath()
                ];
            }
        } else {
            expected('identifier, number, string, boolean, null, or a sub expression enclosed in "(", ")"');
        }
    };
    var scanExpr = function(type) {
        var endType = type;
        if (type === 'INCLUSION' || type === 'BLOCKOPEN' || type === 'ELSE') endType = 'DOUBLE';
        var tag = new TemplateTag;
        tag.type = type;
        tag.path = scanPath();
        tag.args = [];
        var foundKwArg = false;
        while(true){
            run(/^\s*/);
            if (run(ends[endType])) break;
            else if (/^[})]/.test(scanner.peek())) {
                expected('`' + endsString[endType] + '`');
            }
            var newArg = scanArg();
            if (newArg.length === 3) {
                foundKwArg = true;
            } else {
                if (foundKwArg) error("Can't have a non-keyword argument after a keyword argument");
            }
            tag.args.push(newArg);
            // expect a whitespace or a closing ')' or '}'
            if (run(/^(?=[\s})])/) !== '') expected('space');
        }
        return tag;
    };
    var type;
    var error = function(msg) {
        scanner.fatal(msg);
    };
    var expected = function(what) {
        error('Expected ' + what);
    };
    // must do ESCAPE first, immediately followed by ELSE
    // order of others doesn't matter
    if (run(starts.ESCAPE)) type = 'ESCAPE';
    else if (run(starts.ELSE)) type = 'ELSE';
    else if (run(starts.DOUBLE)) type = 'DOUBLE';
    else if (run(starts.TRIPLE)) type = 'TRIPLE';
    else if (run(starts.BLOCKCOMMENT)) type = 'BLOCKCOMMENT';
    else if (run(starts.COMMENT)) type = 'COMMENT';
    else if (run(starts.INCLUSION)) type = 'INCLUSION';
    else if (run(starts.BLOCKOPEN)) type = 'BLOCKOPEN';
    else if (run(starts.BLOCKCLOSE)) type = 'BLOCKCLOSE';
    else error('Unknown stache tag');
    var tag = new TemplateTag;
    tag.type = type;
    if (type === 'BLOCKCOMMENT') {
        var result = run(/^[\s\S]*?--\s*?\}\}/);
        if (!result) error("Unclosed block comment");
        tag.value = result.slice(0, result.lastIndexOf('--'));
    } else if (type === 'COMMENT') {
        var result = run(/^[\s\S]*?\}\}/);
        if (!result) error("Unclosed comment");
        tag.value = result.slice(0, -2);
    } else if (type === 'BLOCKCLOSE') {
        tag.path = scanPath();
        if (!run(ends.DOUBLE)) expected('`}}`');
    } else if (type === 'ELSE') {
        if (!run(ends.DOUBLE)) {
            tag = scanExpr(type);
        }
    } else if (type === 'ESCAPE') {
        var result = run(/^\{*\|/);
        tag.value = '{{' + result.slice(0, -1);
    } else {
        // DOUBLE, TRIPLE, BLOCKOPEN, INCLUSION
        tag = scanExpr(type);
    }
    return tag;
};
// Returns a SpacebarsCompiler.TemplateTag parsed from `scanner`, leaving scanner
// at its original position.
//
// An error will still be thrown if there is not a valid template tag at
// the current position.
TemplateTag.peek = function(scanner) {
    var startPos = scanner.pos;
    var result = TemplateTag.parse(scanner);
    scanner.pos = startPos;
    return result;
};
// Like `TemplateTag.parse`, but in the case of blocks, parse the complete
// `{{#foo}}...{{/foo}}` with `content` and possible `elseContent`, rather
// than just the BLOCKOPEN tag.
//
// In addition:
//
// - Throws an error if `{{else}}` or `{{/foo}}` tag is encountered.
//
// - Returns `null` for a COMMENT.  (This case is distinguishable from
//   parsing no tag by the fact that the scanner is advanced.)
//
// - Takes an HTMLTools.TEMPLATE_TAG_POSITION `position` and sets it as the
//   TemplateTag's `.position` property.
//
// - Validates the tag's well-formedness and legality at in its position.
TemplateTag.parseCompleteTag = function(scannerOrString, position) {
    var scanner = scannerOrString;
    if (typeof scanner === 'string') scanner = new HTMLTools.Scanner(scannerOrString);
    var startPos = scanner.pos; // for error messages
    var result = TemplateTag.parse(scannerOrString);
    if (!result) return result;
    if (result.type === 'BLOCKCOMMENT') return null;
    if (result.type === 'COMMENT') return null;
    if (result.type === 'ELSE') scanner.fatal("Unexpected {{else}}");
    if (result.type === 'BLOCKCLOSE') scanner.fatal("Unexpected closing template tag");
    position = position || TEMPLATE_TAG_POSITION.ELEMENT;
    if (position !== TEMPLATE_TAG_POSITION.ELEMENT) result.position = position;
    if (result.type === 'BLOCKOPEN') {
        // parse block contents
        // Construct a string version of `.path` for comparing start and
        // end tags.  For example, `foo/[0]` was parsed into `["foo", "0"]`
        // and now becomes `foo,0`.  This form may also show up in error
        // messages.
        var blockName = result.path.join(',');
        var textMode = null;
        if (blockName === 'markdown' || position === TEMPLATE_TAG_POSITION.IN_RAWTEXT) {
            textMode = HTML.TEXTMODE.STRING;
        } else if (position === TEMPLATE_TAG_POSITION.IN_RCDATA || position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
            textMode = HTML.TEXTMODE.RCDATA;
        }
        var parserOptions = {
            getTemplateTag: TemplateTag.parseCompleteTag,
            shouldStop: isAtBlockCloseOrElse,
            textMode: textMode
        };
        result.textMode = textMode;
        result.content = HTMLTools.parseFragment(scanner, parserOptions);
        if (scanner.rest().slice(0, 2) !== '{{') scanner.fatal("Expected {{else}} or block close for " + blockName);
        var lastPos = scanner.pos; // save for error messages
        var tmplTag = TemplateTag.parse(scanner); // {{else}} or {{/foo}}
        var lastElseContentTag = result;
        while(tmplTag.type === 'ELSE'){
            if (lastElseContentTag === null) {
                scanner.fatal("Unexpected else after {{else}}");
            }
            if (tmplTag.path) {
                lastElseContentTag.elseContent = new TemplateTag;
                lastElseContentTag.elseContent.type = 'BLOCKOPEN';
                lastElseContentTag.elseContent.path = tmplTag.path;
                lastElseContentTag.elseContent.args = tmplTag.args;
                lastElseContentTag.elseContent.textMode = textMode;
                lastElseContentTag.elseContent.content = HTMLTools.parseFragment(scanner, parserOptions);
                lastElseContentTag = lastElseContentTag.elseContent;
            } else {
                // parse {{else}} and content up to close tag
                lastElseContentTag.elseContent = HTMLTools.parseFragment(scanner, parserOptions);
                lastElseContentTag = null;
            }
            if (scanner.rest().slice(0, 2) !== '{{') scanner.fatal("Expected block close for " + blockName);
            lastPos = scanner.pos;
            tmplTag = TemplateTag.parse(scanner);
        }
        if (tmplTag.type === 'BLOCKCLOSE') {
            var blockName2 = tmplTag.path.join(',');
            if (blockName !== blockName2) {
                scanner.pos = lastPos;
                scanner.fatal('Expected tag to close ' + blockName + ', found ' + blockName2);
            }
        } else {
            scanner.pos = lastPos;
            scanner.fatal('Expected tag to close ' + blockName + ', found ' + tmplTag.type);
        }
    }
    var finalPos = scanner.pos;
    scanner.pos = startPos;
    validateTag(result, scanner);
    scanner.pos = finalPos;
    return result;
};
var isAtBlockCloseOrElse = function(scanner) {
    // Detect `{{else}}` or `{{/foo}}`.
    //
    // We do as much work ourselves before deferring to `TemplateTag.peek`,
    // for efficiency (we're called for every input token) and to be
    // less obtrusive, because `TemplateTag.peek` will throw an error if it
    // sees `{{` followed by a malformed tag.
    var rest, type;
    return scanner.peek() === '{' && (rest = scanner.rest()).slice(0, 2) === '{{' && /^\{\{\s*(\/|else\b)/.test(rest) && (type = TemplateTag.peek(scanner).type) && (type === 'BLOCKCLOSE' || type === 'ELSE');
};
// Validate that `templateTag` is correctly formed and legal for its
// HTML position.  Use `scanner` to report errors. On success, does
// nothing.
var validateTag = function(ttag, scanner) {
    if (ttag.type === 'INCLUSION' || ttag.type === 'BLOCKOPEN') {
        var args = ttag.args;
        if (ttag.path[0] === 'each' && args[1] && args[1][0] === 'PATH' && args[1][1][0] === 'in') {
        // For slightly better error messages, we detect the each-in case
        // here in order not to complain if the user writes `{{#each 3 in x}}`
        // that "3 is not a function"
        } else {
            if (args.length > 1 && args[0].length === 2 && args[0][0] !== 'PATH') {
                // we have a positional argument that is not a PATH followed by
                // other arguments
                scanner.fatal("First argument must be a function, to be called on " + "the rest of the arguments; found " + args[0][0]);
            }
        }
    }
    var position = ttag.position || TEMPLATE_TAG_POSITION.ELEMENT;
    if (position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
        if (ttag.type === 'DOUBLE' || ttag.type === 'ESCAPE') {
            return;
        } else if (ttag.type === 'BLOCKOPEN') {
            var path = ttag.path;
            var path0 = path[0];
            if (!(path.length === 1 && (path0 === 'if' || path0 === 'unless' || path0 === 'with' || path0 === 'each'))) {
                scanner.fatal("Custom block helpers are not allowed in an HTML attribute, only built-in ones like #each and #if");
            }
        } else {
            scanner.fatal(ttag.type + " template tag is not allowed in an HTML attribute");
        }
    } else if (position === TEMPLATE_TAG_POSITION.IN_START_TAG) {
        if (!(ttag.type === 'DOUBLE')) {
            scanner.fatal("Reactive HTML attributes must either have a constant name or consist of a single {{helper}} providing a dictionary of names and values.  A template tag of type " + ttag.type + " is not allowed here.");
        }
        if (scanner.peek() === '=') {
            scanner.fatal("Template tags are not allowed in attribute names, only in attribute values or in the form of a single {{helper}} that evaluates to a dictionary of name=value pairs.");
        }
    }
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"whitespace.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/spacebars-compiler/whitespace.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({removeWhitespace:()=>removeWhitespace});let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},0);let TreeTransformer,toRaw;module.link('./optimizer',{TreeTransformer(v){TreeTransformer=v},toRaw(v){toRaw=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

function compactRaw(array) {
    var result = [];
    for(var i = 0; i < array.length; i++){
        var item = array[i];
        if (item instanceof HTML.Raw) {
            if (!item.value) {
                continue;
            }
            if (result.length && result[result.length - 1] instanceof HTML.Raw) {
                result[result.length - 1] = HTML.Raw(result[result.length - 1].value + item.value);
                continue;
            }
        }
        result.push(item);
    }
    return result;
}
function replaceIfContainsNewline(match) {
    if (match.indexOf('\n') >= 0) {
        return '';
    }
    return match;
}
function stripWhitespace(array) {
    var result = [];
    for(var i = 0; i < array.length; i++){
        var item = array[i];
        if (item instanceof HTML.Raw) {
            // remove nodes that contain only whitespace & a newline
            if (item.value.indexOf('\n') !== -1 && !/\S/.test(item.value)) {
                continue;
            }
            // Trim any preceding whitespace, if it contains a newline
            var newStr = item.value;
            newStr = newStr.replace(/^\s+/, replaceIfContainsNewline);
            newStr = newStr.replace(/\s+$/, replaceIfContainsNewline);
            item.value = newStr;
        }
        result.push(item);
    }
    return result;
}
var WhitespaceRemovingVisitor = TreeTransformer.extend();
WhitespaceRemovingVisitor.def({
    visitNull: toRaw,
    visitPrimitive: toRaw,
    visitCharRef: toRaw,
    visitArray: function(array) {
        // this.super(array)
        var result = TreeTransformer.prototype.visitArray.call(this, array);
        result = compactRaw(result);
        result = stripWhitespace(result);
        return result;
    },
    visitTag: function(tag) {
        var tagName = tag.tagName;
        // TODO - List tags that we don't want to strip whitespace for.
        if (tagName === 'textarea' || tagName === 'script' || tagName === 'pre' || !HTML.isKnownElement(tagName) || HTML.isKnownSVGElement(tagName)) {
            return tag;
        }
        return TreeTransformer.prototype.visitTag.call(this, tag);
    },
    visitAttributes: function(attrs) {
        return attrs;
    }
});
function removeWhitespace(tree) {
    tree = (new WhitespaceRemovingVisitor).visit(tree);
    return tree;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      SpacebarsCompiler: SpacebarsCompiler
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/spacebars-compiler/preamble.js"
  ],
  mainModulePath: "/node_modules/meteor/spacebars-compiler/preamble.js"
}});

//# sourceURL=meteor://💻app/packages/spacebars-compiler.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL3ByZWFtYmxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvY29kZWdlbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL2NvbXBpbGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvb3B0aW1pemVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvcmVhY3QuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NwYWNlYmFycy1jb21waWxlci90ZW1wbGF0ZXRhZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL3doaXRlc3BhY2UuanMiXSwibmFtZXMiOlsiQ29kZUdlbiIsImJ1aWx0SW5CbG9ja0hlbHBlcnMiLCJpc1Jlc2VydmVkTmFtZSIsIlNwYWNlYmFyc0NvbXBpbGVyIiwiX2J1aWx0SW5CbG9ja0hlbHBlcnMiLCJvcHRpbWl6ZSIsInBhcnNlIiwiY29tcGlsZSIsImNvZGVHZW4iLCJfVGVtcGxhdGVUYWdSZXBsYWNlciIsIlRlbXBsYXRlVGFnUmVwbGFjZXIiLCJfYmVhdXRpZnkiLCJiZWF1dGlmeSIsIlRlbXBsYXRlVGFnIiwiSFRNTFRvb2xzIiwiYnVpbHRJblRlbXBsYXRlTWFjcm9zIiwiYWRkaXRpb25hbFJlc2VydmVkTmFtZXMiLCJoYXNPd25Qcm9wZXJ0eSIsIm5hbWUiLCJpbmNsdWRlcyIsIm1ha2VPYmplY3RMaXRlcmFsIiwib2JqIiwicGFydHMiLCJrIiwicHVzaCIsIkJsYXplVG9vbHMiLCJ0b09iamVjdExpdGVyYWxLZXkiLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIiwicHJvdG90eXBlIiwiY29kZUdlblRlbXBsYXRlVGFnIiwidGFnIiwic2VsZiIsInBvc2l0aW9uIiwiVEVNUExBVEVfVEFHX1BPU0lUSU9OIiwiSU5fU1RBUlRfVEFHIiwiRW1pdENvZGUiLCJjb2RlR2VuTXVzdGFjaGUiLCJwYXRoIiwiYXJncyIsInR5cGUiLCJjb2RlIiwiSU5fQVRUUklCVVRFIiwidG9KU0xpdGVyYWwiLCJsZW5ndGgiLCJFcnJvciIsImRhdGFDb2RlIiwiZWFjaFVzYWdlIiwiaW5BcmciLCJ2YXJpYWJsZUFyZyIsInJlcGxhY2UiLCJ2YXJpYWJsZSIsImNvZGVHZW5JbmNsdXNpb25EYXRhIiwic2xpY2UiLCJkYXRhUHJvcHMiLCJmb3JFYWNoIiwiYXJnIiwiYXJnS2V5IiwiY29kZUdlbkFyZ1ZhbHVlIiwiY29kZUdlbkluY2x1c2lvbkRhdGFGdW5jIiwiY29udGVudEJsb2NrIiwiY29kZUdlbkJsb2NrIiwiY29udGVudCIsImVsc2VDb250ZW50QmxvY2siLCJlbHNlQ29udGVudCIsImNhbGxBcmdzIiwiY29tcENvZGUiLCJjb2RlR2VuUGF0aCIsImxvb2t1cFRlbXBsYXRlIiwiaW5jbHVkZUFyZ3MiLCJpbmNsdWRlQ29kZSIsInZhbHVlIiwib3B0cyIsImZpcnN0UGF0aEl0ZW0iLCJsb29rdXBNZXRob2QiLCJtYXAiLCJhcmdUeXBlIiwiYXJnVmFsdWUiLCJhcmdDb2RlIiwibXVzdGFjaGVUeXBlIiwibmFtZUNvZGUiLCJjb2RlR2VuTXVzdGFjaGVBcmdzIiwibXVzdGFjaGUiLCJ0YWdBcmdzIiwia3dBcmdzIiwiTWV0ZW9yIiwiVWdsaWZ5SlNNaW5pZnkiLCJpc1NlcnZlciIsIk5wbSIsInJlcXVpcmUiLCJtaW5pZnkiLCJpbnB1dCIsInBhcnNlRnJhZ21lbnQiLCJnZXRUZW1wbGF0ZVRhZyIsInBhcnNlQ29tcGxldGVUYWciLCJvcHRpb25zIiwidHJlZSIsIkhUTUwiLCJUcmFuc2Zvcm1pbmdWaXNpdG9yIiwiZXh0ZW5kIiwiZGVmIiwidmlzaXRPYmplY3QiLCJ4IiwiaW5BdHRyaWJ1dGVWYWx1ZSIsImNvZGVnZW4iLCJjYWxsIiwidmlzaXRBdHRyaWJ1dGVzIiwiYXR0cnMiLCJ2aXNpdEF0dHJpYnV0ZSIsInJlc3VsdCIsInZpc2l0IiwicGFyc2VUcmVlIiwiaXNUZW1wbGF0ZSIsImlzQm9keSIsIndoaXRlc3BhY2UiLCJzb3VyY2VOYW1lIiwidG9Mb3dlckNhc2UiLCJyZW1vdmVXaGl0ZXNwYWNlIiwiUmVhY3RDb21wb25lbnRTaWJsaW5nRm9yYmlkZGVyIiwidG9KUyIsIm1hbmdsZSIsImNvbXByZXNzIiwib3V0cHV0IiwiaW5kZW50X2xldmVsIiwid2lkdGgiLCJjb25zdGFudCIsIk9QVElNSVpBQkxFIiwiTk9ORSIsIlBBUlRTIiwiRlVMTCIsIkNhbk9wdGltaXplVmlzaXRvciIsIlZpc2l0b3IiLCJ2aXNpdE51bGwiLCJ2aXNpdFByaW1pdGl2ZSIsInZpc2l0Q29tbWVudCIsInZpc2l0Q2hhclJlZiIsInZpc2l0UmF3IiwidmlzaXRGdW5jdGlvbiIsInZpc2l0QXJyYXkiLCJpIiwidmlzaXRUYWciLCJ0YWdOYW1lIiwiaXNLbm93bkVsZW1lbnQiLCJpc0tub3duU1ZHRWxlbWVudCIsImNoaWxkcmVuIiwiaXNBcnJheSIsImEiLCJnZXRPcHRpbWl6YWJpbGl0eSIsInRvUmF3IiwiUmF3IiwidG9IVE1MIiwiVHJlZVRyYW5zZm9ybWVyIiwiYXBwbHkiLCJPcHRpbWl6aW5nVmlzaXRvciIsImFycmF5Iiwib3B0aW1pemFiaWxpdHkiLCJ2aXNpdENoaWxkcmVuIiwiUmF3Q29tcGFjdGluZ1Zpc2l0b3IiLCJpdGVtIiwiUmF3UmVwbGFjaW5nVmlzaXRvciIsInJhdyIsImh0bWwiLCJpbmRleE9mIiwicGFyZW50VGFnIiwibnVtU2libGluZ3MiLCJjaGlsZCIsIm1hdGNoIiwiY29uc3RydWN0b3JOYW1lIiwibWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXgiLCJyIiwiUmVnRXhwIiwic291cmNlIiwiaWdub3JlQ2FzZSIsInN0YXJ0cyIsIkVTQ0FQRSIsIkVMU0UiLCJET1VCTEUiLCJUUklQTEUiLCJCTE9DS0NPTU1FTlQiLCJDT01NRU5UIiwiSU5DTFVTSU9OIiwiQkxPQ0tPUEVOIiwiQkxPQ0tDTE9TRSIsImVuZHMiLCJFWFBSIiwiZW5kc1N0cmluZyIsInNjYW5uZXJPclN0cmluZyIsInNjYW5uZXIiLCJTY2FubmVyIiwicGVlayIsInJlc3QiLCJydW4iLCJyZWdleCIsImV4ZWMiLCJyZXQiLCJwb3MiLCJhZHZhbmNlIiwiYW1vdW50Iiwic2NhbklkZW50aWZpZXIiLCJpc0ZpcnN0SW5QYXRoIiwiaWQiLCJwYXJzZUV4dGVuZGVkSWRlbnRpZmllck5hbWUiLCJleHBlY3RlZCIsImZhdGFsIiwic2NhblBhdGgiLCJzZWdtZW50cyIsImRvdHMiLCJhbmNlc3RvclN0ciIsImVuZHNXaXRoU2xhc2giLCJ0ZXN0Iiwic3BsaXQiLCJkb3RDbGF1c2UiLCJpbmRleCIsInNlZyIsImVycm9yIiwic2VwIiwic2NhbkFyZ0tleXdvcmQiLCJzY2FuQXJnIiwia2V5d29yZCIsInNjYW5BcmdWYWx1ZSIsImNvbmNhdCIsInN0YXJ0UG9zIiwicGFyc2VOdW1iZXIiLCJwYXJzZVN0cmluZ0xpdGVyYWwiLCJzY2FuRXhwciIsImVuZFR5cGUiLCJmb3VuZEt3QXJnIiwibmV3QXJnIiwibXNnIiwid2hhdCIsImxhc3RJbmRleE9mIiwiRUxFTUVOVCIsImJsb2NrTmFtZSIsInRleHRNb2RlIiwiSU5fUkFXVEVYVCIsIlRFWFRNT0RFIiwiU1RSSU5HIiwiSU5fUkNEQVRBIiwiUkNEQVRBIiwicGFyc2VyT3B0aW9ucyIsInNob3VsZFN0b3AiLCJpc0F0QmxvY2tDbG9zZU9yRWxzZSIsImxhc3RQb3MiLCJ0bXBsVGFnIiwibGFzdEVsc2VDb250ZW50VGFnIiwiYmxvY2tOYW1lMiIsImZpbmFsUG9zIiwidmFsaWRhdGVUYWciLCJ0dGFnIiwicGF0aDAiLCJjb21wYWN0UmF3IiwicmVwbGFjZUlmQ29udGFpbnNOZXdsaW5lIiwic3RyaXBXaGl0ZXNwYWNlIiwibmV3U3RyIiwiV2hpdGVzcGFjZVJlbW92aW5nVmlzaXRvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7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cGFjZWJhcnMtY29tcGlsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2RlR2VuLCBidWlsdEluQmxvY2tIZWxwZXJzLCBpc1Jlc2VydmVkTmFtZSB9IGZyb20gJy4vY29kZWdlbic7XG5pbXBvcnQgeyBvcHRpbWl6ZSB9IGZyb20gJy4vb3B0aW1pemVyJztcbmltcG9ydCB7IHBhcnNlLCBjb21waWxlLCBjb2RlR2VuLCBUZW1wbGF0ZVRhZ1JlcGxhY2VyLCBiZWF1dGlmeSB9IGZyb20gJy4vY29tcGlsZXInO1xuaW1wb3J0IHsgVGVtcGxhdGVUYWcgfSBmcm9tICcuL3RlbXBsYXRldGFnJztcblxuU3BhY2ViYXJzQ29tcGlsZXIgPSB7XG4gIENvZGVHZW4sXG4gIF9idWlsdEluQmxvY2tIZWxwZXJzOiBidWlsdEluQmxvY2tIZWxwZXJzLFxuICBpc1Jlc2VydmVkTmFtZSxcbiAgb3B0aW1pemUsXG4gIHBhcnNlLFxuICBjb21waWxlLFxuICBjb2RlR2VuLFxuICBfVGVtcGxhdGVUYWdSZXBsYWNlcjogVGVtcGxhdGVUYWdSZXBsYWNlcixcbiAgX2JlYXV0aWZ5OiBiZWF1dGlmeSxcbiAgVGVtcGxhdGVUYWcsXG59O1xuXG5leHBvcnQgeyBTcGFjZWJhcnNDb21waWxlciB9O1xuIiwiaW1wb3J0IHsgSFRNTFRvb2xzIH0gZnJvbSAnbWV0ZW9yL2h0bWwtdG9vbHMnO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gJ21ldGVvci9odG1sanMnO1xuaW1wb3J0IHsgQmxhemVUb29scyB9IGZyb20gJ21ldGVvci9ibGF6ZS10b29scyc7XG5pbXBvcnQgeyBjb2RlR2VuIH0gZnJvbSAnLi9jb21waWxlcic7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDb2RlLWdlbmVyYXRpb24gb2YgdGVtcGxhdGUgdGFnc1xuXG4vLyBUaGUgYENvZGVHZW5gIGNsYXNzIGN1cnJlbnRseSBoYXMgbm8gaW5zdGFuY2Ugc3RhdGUsIGJ1dCBpbiB0aGVvcnlcbi8vIGl0IGNvdWxkIGJlIHVzZWZ1bCB0byB0cmFjayBwZXItZnVuY3Rpb24gc3RhdGUsIGxpa2Ugd2hldGhlciB3ZVxuLy8gbmVlZCB0byBlbWl0IGB2YXIgc2VsZiA9IHRoaXNgIG9yIG5vdC5cbmV4cG9ydCBmdW5jdGlvbiBDb2RlR2VuKCkge31cblxuZXhwb3J0IGNvbnN0IGJ1aWx0SW5CbG9ja0hlbHBlcnMgPSB7XG4gICdpZic6ICdCbGF6ZS5JZicsXG4gICd1bmxlc3MnOiAnQmxhemUuVW5sZXNzJyxcbiAgJ3dpdGgnOiAnU3BhY2ViYXJzLldpdGgnLFxuICAnZWFjaCc6ICdCbGF6ZS5FYWNoJyxcbiAgJ2xldCc6ICdCbGF6ZS5MZXQnXG59O1xuXG5cbi8vIE1hcHBpbmcgb2YgXCJtYWNyb3NcIiB3aGljaCwgd2hlbiBwcmVjZWRlZCBieSBgVGVtcGxhdGUuYCwgZXhwYW5kXG4vLyB0byBzcGVjaWFsIGNvZGUgcmF0aGVyIHRoYW4gZm9sbG93aW5nIHRoZSBsb29rdXAgcnVsZXMgZm9yIGRvdHRlZFxuLy8gc3ltYm9scy5cbnZhciBidWlsdEluVGVtcGxhdGVNYWNyb3MgPSB7XG4gIC8vIGB2aWV3YCBpcyBhIGxvY2FsIHZhcmlhYmxlIGRlZmluZWQgaW4gdGhlIGdlbmVyYXRlZCByZW5kZXJcbiAgLy8gZnVuY3Rpb24gZm9yIHRoZSB0ZW1wbGF0ZSBpbiB3aGljaCBgVGVtcGxhdGUuY29udGVudEJsb2NrYCBvclxuICAvLyBgVGVtcGxhdGUuZWxzZUJsb2NrYCBpcyBpbnZva2VkLlxuICAnY29udGVudEJsb2NrJzogJ3ZpZXcudGVtcGxhdGVDb250ZW50QmxvY2snLFxuICAnZWxzZUJsb2NrJzogJ3ZpZXcudGVtcGxhdGVFbHNlQmxvY2snLFxuXG4gIC8vIENvbmZ1c2luZ2x5LCB0aGlzIG1ha2VzIGB7ez4gVGVtcGxhdGUuZHluYW1pY319YCBhbiBhbGlhc1xuICAvLyBmb3IgYHt7PiBfX2R5bmFtaWN9fWAsIHdoZXJlIFwiX19keW5hbWljXCIgaXMgdGhlIHRlbXBsYXRlIHRoYXRcbiAgLy8gaW1wbGVtZW50cyB0aGUgZHluYW1pYyB0ZW1wbGF0ZSBmZWF0dXJlLlxuICAnZHluYW1pYyc6ICdUZW1wbGF0ZS5fX2R5bmFtaWMnLFxuXG4gICdzdWJzY3JpcHRpb25zUmVhZHknOiAndmlldy50ZW1wbGF0ZUluc3RhbmNlKCkuc3Vic2NyaXB0aW9uc1JlYWR5KCknXG59O1xuXG52YXIgYWRkaXRpb25hbFJlc2VydmVkTmFtZXMgPSBbXCJib2R5XCIsIFwidG9TdHJpbmdcIiwgXCJpbnN0YW5jZVwiLCAgXCJjb25zdHJ1Y3RvclwiLFxuICBcInRvU3RyaW5nXCIsIFwidG9Mb2NhbGVTdHJpbmdcIiwgXCJ2YWx1ZU9mXCIsIFwiaGFzT3duUHJvcGVydHlcIiwgXCJpc1Byb3RvdHlwZU9mXCIsXG4gIFwicHJvcGVydHlJc0VudW1lcmFibGVcIiwgXCJfX2RlZmluZUdldHRlcl9fXCIsIFwiX19sb29rdXBHZXR0ZXJfX1wiLFxuICBcIl9fZGVmaW5lU2V0dGVyX19cIiwgXCJfX2xvb2t1cFNldHRlcl9fXCIsIFwiX19wcm90b19fXCIsIFwiZHluYW1pY1wiLFxuICBcInJlZ2lzdGVySGVscGVyXCIsIFwiY3VycmVudERhdGFcIiwgXCJwYXJlbnREYXRhXCIsIFwiX21pZ3JhdGVUZW1wbGF0ZVwiLFxuICBcIl9hcHBseUhtckNoYW5nZXNcIiwgXCJfX3BlbmRpbmdSZXBsYWNlbWVudFwiXG5dO1xuXG4vLyBBIFwicmVzZXJ2ZWQgbmFtZVwiIGNhbid0IGJlIHVzZWQgYXMgYSA8dGVtcGxhdGU+IG5hbWUuICBUaGlzXG4vLyBmdW5jdGlvbiBpcyB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSBmaWxlIHNjYW5uZXIuXG4vL1xuLy8gTm90ZSB0aGF0IHRoZSBydW50aW1lIGltcG9zZXMgYWRkaXRpb25hbCByZXN0cmljdGlvbnMsIGZvciBleGFtcGxlXG4vLyBiYW5uaW5nIHRoZSBuYW1lIFwiYm9keVwiIGFuZCBuYW1lcyBvZiBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllc1xuLy8gbGlrZSBcInRvU3RyaW5nXCIuXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZE5hbWUobmFtZSkge1xuICByZXR1cm4gYnVpbHRJbkJsb2NrSGVscGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSB8fFxuICAgIGJ1aWx0SW5UZW1wbGF0ZU1hY3Jvcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSB8fFxuICAgIGFkZGl0aW9uYWxSZXNlcnZlZE5hbWVzLmluY2x1ZGVzKG5hbWUpO1xufVxuXG52YXIgbWFrZU9iamVjdExpdGVyYWwgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBwYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iailcbiAgICBwYXJ0cy5wdXNoKEJsYXplVG9vbHMudG9PYmplY3RMaXRlcmFsS2V5KGspICsgJzogJyArIG9ialtrXSk7XG4gIHJldHVybiAneycgKyBwYXJ0cy5qb2luKCcsICcpICsgJ30nO1xufTtcblxuT2JqZWN0LmFzc2lnbihDb2RlR2VuLnByb3RvdHlwZSwge1xuICBjb2RlR2VuVGVtcGxhdGVUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRhZy5wb3NpdGlvbiA9PT0gSFRNTFRvb2xzLlRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9TVEFSVF9UQUcpIHtcbiAgICAgIC8vIFNwZWNpYWwgZHluYW1pYyBhdHRyaWJ1dGVzOiBgPGRpdiB7e2F0dHJzfX0+Li4uYFxuICAgICAgLy8gb25seSBgdGFnLnR5cGUgPT09ICdET1VCTEUnYCBhbGxvd2VkIChieSBlYXJsaWVyIHZhbGlkYXRpb24pXG4gICAgICByZXR1cm4gQmxhemVUb29scy5FbWl0Q29kZSgnZnVuY3Rpb24gKCkgeyByZXR1cm4gJyArXG4gICAgICAgICAgc2VsZi5jb2RlR2VuTXVzdGFjaGUodGFnLnBhdGgsIHRhZy5hcmdzLCAnYXR0ck11c3RhY2hlJylcbiAgICAgICAgICArICc7IH0nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRhZy50eXBlID09PSAnRE9VQkxFJyB8fCB0YWcudHlwZSA9PT0gJ1RSSVBMRScpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmNvZGVHZW5NdXN0YWNoZSh0YWcucGF0aCwgdGFnLmFyZ3MpO1xuICAgICAgICBpZiAodGFnLnR5cGUgPT09ICdUUklQTEUnKSB7XG4gICAgICAgICAgY29kZSA9ICdTcGFjZWJhcnMubWFrZVJhdygnICsgY29kZSArICcpJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnLnBvc2l0aW9uICE9PSBIVE1MVG9vbHMuVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX0FUVFJJQlVURSkge1xuICAgICAgICAgIC8vIFJlYWN0aXZlIGF0dHJpYnV0ZXMgYXJlIGFscmVhZHkgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uLFxuICAgICAgICAgIC8vIGFuZCB0aGVyZSdzIG5vIGZpbmUtZ3JhaW5lZCByZWFjdGl2aXR5LlxuICAgICAgICAgIC8vIEFueXdoZXJlIGVsc2UsIHdlIG5lZWQgdG8gY3JlYXRlIGEgVmlldy5cbiAgICAgICAgICBjb2RlID0gJ0JsYXplLlZpZXcoJyArXG4gICAgICAgICAgICBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKCdsb29rdXA6JyArIHRhZy5wYXRoLmpvaW4oJy4nKSkgKyAnLCAnICtcbiAgICAgICAgICAgICdmdW5jdGlvbiAoKSB7IHJldHVybiAnICsgY29kZSArICc7IH0pJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQmxhemVUb29scy5FbWl0Q29kZShjb2RlKTtcbiAgICAgIH0gZWxzZSBpZiAodGFnLnR5cGUgPT09ICdJTkNMVVNJT04nIHx8IHRhZy50eXBlID09PSAnQkxPQ0tPUEVOJykge1xuICAgICAgICB2YXIgcGF0aCA9IHRhZy5wYXRoO1xuICAgICAgICB2YXIgYXJncyA9IHRhZy5hcmdzO1xuXG4gICAgICAgIGlmICh0YWcudHlwZSA9PT0gJ0JMT0NLT1BFTicgJiZcbiAgICAgICAgICAgIGJ1aWx0SW5CbG9ja0hlbHBlcnMuaGFzT3duUHJvcGVydHkocGF0aFswXSkpIHtcbiAgICAgICAgICAvLyBpZiwgdW5sZXNzLCB3aXRoLCBlYWNoLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSWYgc29tZW9uZSB0cmllcyB0byBkbyBge3s+IGlmfX1gLCB3ZSBkb24ndFxuICAgICAgICAgIC8vIGdldCBoZXJlLCBidXQgYW4gZXJyb3IgaXMgdGhyb3duIHdoZW4gd2UgdHJ5IHRvIGNvZGVnZW4gdGhlIHBhdGguXG5cbiAgICAgICAgICAvLyBOb3RlOiBJZiB3ZSBjYXVnaHQgdGhlc2UgZXJyb3JzIGVhcmxpZXIsIHdoaWxlIHNjYW5uaW5nLCB3ZSdkIGJlIGFibGUgdG9cbiAgICAgICAgICAvLyBwcm92aWRlIG5pY2UgbGluZSBudW1iZXJzLlxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGRvdHRlZCBwYXRoIGJlZ2lubmluZyB3aXRoIFwiICsgcGF0aFswXSk7XG4gICAgICAgICAgaWYgKCEgYXJncy5sZW5ndGgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIjXCIgKyBwYXRoWzBdICsgXCIgcmVxdWlyZXMgYW4gYXJndW1lbnRcIik7XG5cbiAgICAgICAgICB2YXIgZGF0YUNvZGUgPSBudWxsO1xuICAgICAgICAgIC8vICNlYWNoIGhhcyBhIHNwZWNpYWwgdHJlYXRtZW50IGFzIGl0IGZlYXR1cmVzIHR3byBkaWZmZXJlbnQgZm9ybXM6XG4gICAgICAgICAgLy8gLSB7eyNlYWNoIHBlb3BsZX19XG4gICAgICAgICAgLy8gLSB7eyNlYWNoIHBlcnNvbiBpbiBwZW9wbGV9fVxuICAgICAgICAgIGlmIChwYXRoWzBdID09PSAnZWFjaCcgJiYgYXJncy5sZW5ndGggPj0gMiAmJiBhcmdzWzFdWzBdID09PSAnUEFUSCcgJiZcbiAgICAgICAgICAgICAgYXJnc1sxXVsxXS5sZW5ndGggJiYgYXJnc1sxXVsxXVswXSA9PT0gJ2luJykge1xuICAgICAgICAgICAgLy8gbWluaW11bSBjb25kaXRpb25zIGFyZSBtZXQgZm9yIGVhY2gtaW4uICBub3cgdmFsaWRhdGUgdGhpc1xuICAgICAgICAgICAgLy8gaXNuJ3Qgc29tZSB3ZWlyZCBjYXNlLlxuICAgICAgICAgICAgdmFyIGVhY2hVc2FnZSA9IFwiVXNlIGVpdGhlciB7eyNlYWNoIGl0ZW1zfX0gb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgXCJ7eyNlYWNoIGl0ZW0gaW4gaXRlbXN9fSBmb3JtIG9mICNlYWNoLlwiO1xuICAgICAgICAgICAgdmFyIGluQXJnID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGlmICghIChhcmdzLmxlbmd0aCA+PSAzICYmIGluQXJnWzFdLmxlbmd0aCA9PT0gMSkpIHtcbiAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgaGF2ZSBhdCBsZWFzdCAzIHNwYWNlLXNlcGFyYXRlZCBwYXJ0cyBhZnRlciAjZWFjaCwgb3JcbiAgICAgICAgICAgICAgLy8gaW5BcmcgZG9lc24ndCBsb29rIGxpa2UgWydQQVRIJyxbJ2luJ11dXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hbGZvcm1lZCAjZWFjaC4gXCIgKyBlYWNoVXNhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc3BsaXQgb3V0IHRoZSB2YXJpYWJsZSBuYW1lIGFuZCBzZXF1ZW5jZSBhcmd1bWVudHNcbiAgICAgICAgICAgIHZhciB2YXJpYWJsZUFyZyA9IGFyZ3NbMF07XG4gICAgICAgICAgICBpZiAoISAodmFyaWFibGVBcmdbMF0gPT09IFwiUEFUSFwiICYmIHZhcmlhYmxlQXJnWzFdLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlQXJnWzFdWzBdLnJlcGxhY2UoL1xcLi9nLCAnJykpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCB2YXJpYWJsZSBuYW1lIGluICNlYWNoXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gdmFyaWFibGVBcmdbMV1bMF07XG4gICAgICAgICAgICBkYXRhQ29kZSA9ICdmdW5jdGlvbiAoKSB7IHJldHVybiB7IF9zZXF1ZW5jZTogJyArXG4gICAgICAgICAgICAgIHNlbGYuY29kZUdlbkluY2x1c2lvbkRhdGEoYXJncy5zbGljZSgyKSkgK1xuICAgICAgICAgICAgICAnLCBfdmFyaWFibGU6ICcgKyBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKHZhcmlhYmxlKSArICcgfTsgfSc7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXRoWzBdID09PSAnbGV0Jykge1xuICAgICAgICAgICAgdmFyIGRhdGFQcm9wcyA9IHt9O1xuICAgICAgICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgICAgaWYgKGFyZy5sZW5ndGggIT09IDMpIHtcbiAgICAgICAgICAgICAgICAvLyBub3QgYSBrZXl3b3JkIGFyZyAoeD15KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluY29ycmVjdCBmb3JtIG9mICNsZXRcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFyIGFyZ0tleSA9IGFyZ1syXTtcbiAgICAgICAgICAgICAgZGF0YVByb3BzW2FyZ0tleV0gPVxuICAgICAgICAgICAgICAgICdmdW5jdGlvbiAoKSB7IHJldHVybiBTcGFjZWJhcnMuY2FsbCgnICtcbiAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5BcmdWYWx1ZShhcmcpICsgJyk7IH0nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYXRhQ29kZSA9IG1ha2VPYmplY3RMaXRlcmFsKGRhdGFQcm9wcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEgZGF0YUNvZGUpIHtcbiAgICAgICAgICAgIC8vIGBhcmdzYCBtdXN0IGV4aXN0ICh0YWcuYXJncy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZGF0YUNvZGUgPSBzZWxmLmNvZGVHZW5JbmNsdXNpb25EYXRhRnVuYyhhcmdzKSB8fCAnbnVsbCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYGNvbnRlbnRgIG11c3QgZXhpc3RcbiAgICAgICAgICB2YXIgY29udGVudEJsb2NrID0gKCgnY29udGVudCcgaW4gdGFnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5CbG9jayh0YWcuY29udGVudCkgOiBudWxsKTtcbiAgICAgICAgICAvLyBgZWxzZUNvbnRlbnRgIG1heSBub3QgZXhpc3RcbiAgICAgICAgICB2YXIgZWxzZUNvbnRlbnRCbG9jayA9ICgoJ2Vsc2VDb250ZW50JyBpbiB0YWcpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5CbG9jayh0YWcuZWxzZUNvbnRlbnQpIDogbnVsbCk7XG5cbiAgICAgICAgICB2YXIgY2FsbEFyZ3MgPSBbZGF0YUNvZGUsIGNvbnRlbnRCbG9ja107XG4gICAgICAgICAgaWYgKGVsc2VDb250ZW50QmxvY2spXG4gICAgICAgICAgICBjYWxsQXJncy5wdXNoKGVsc2VDb250ZW50QmxvY2spO1xuXG4gICAgICAgICAgcmV0dXJuIEJsYXplVG9vbHMuRW1pdENvZGUoXG4gICAgICAgICAgICBidWlsdEluQmxvY2tIZWxwZXJzW3BhdGhbMF1dICsgJygnICsgY2FsbEFyZ3Muam9pbignLCAnKSArICcpJyk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY29tcENvZGUgPSBzZWxmLmNvZGVHZW5QYXRoKHBhdGgsIHtsb29rdXBUZW1wbGF0ZTogdHJ1ZX0pO1xuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIC8vIGNhcHR1cmUgcmVhY3Rpdml0eVxuICAgICAgICAgICAgY29tcENvZGUgPSAnZnVuY3Rpb24gKCkgeyByZXR1cm4gU3BhY2ViYXJzLmNhbGwoJyArIGNvbXBDb2RlICtcbiAgICAgICAgICAgICAgJyk7IH0nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBkYXRhQ29kZSA9IHNlbGYuY29kZUdlbkluY2x1c2lvbkRhdGFGdW5jKHRhZy5hcmdzKTtcbiAgICAgICAgICB2YXIgY29udGVudCA9ICgoJ2NvbnRlbnQnIGluIHRhZykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29kZUdlbkJsb2NrKHRhZy5jb250ZW50KSA6IG51bGwpO1xuICAgICAgICAgIHZhciBlbHNlQ29udGVudCA9ICgoJ2Vsc2VDb250ZW50JyBpbiB0YWcpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb2RlR2VuQmxvY2sodGFnLmVsc2VDb250ZW50KSA6IG51bGwpO1xuXG4gICAgICAgICAgdmFyIGluY2x1ZGVBcmdzID0gW2NvbXBDb2RlXTtcbiAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgaW5jbHVkZUFyZ3MucHVzaChjb250ZW50KTtcbiAgICAgICAgICAgIGlmIChlbHNlQ29udGVudClcbiAgICAgICAgICAgICAgaW5jbHVkZUFyZ3MucHVzaChlbHNlQ29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGluY2x1ZGVDb2RlID1cbiAgICAgICAgICAgICAgICAnU3BhY2ViYXJzLmluY2x1ZGUoJyArIGluY2x1ZGVBcmdzLmpvaW4oJywgJykgKyAnKSc7XG5cbiAgICAgICAgICAvLyBjYWxsaW5nIGNvbnZlbnRpb24gY29tcGF0IC0tIHNldCB0aGUgZGF0YSBjb250ZXh0IGFyb3VuZCB0aGVcbiAgICAgICAgICAvLyBlbnRpcmUgaW5jbHVzaW9uLCBzbyB0aGF0IGlmIHRoZSBuYW1lIG9mIHRoZSBpbmNsdXNpb24gaXNcbiAgICAgICAgICAvLyBhIGhlbHBlciBmdW5jdGlvbiwgaXQgZ2V0cyB0aGUgZGF0YSBjb250ZXh0IGluIGB0aGlzYC5cbiAgICAgICAgICAvLyBUaGlzIG1ha2VzIGZvciBhIHByZXR0eSBjb25mdXNpbmcgY2FsbGluZyBjb252ZW50aW9uIC0tXG4gICAgICAgICAgLy8gSW4gYHt7I2ZvbyBiYXJ9fWAsIGBmb29gIGlzIGV2YWx1YXRlZCBpbiB0aGUgY29udGV4dCBvZiBgYmFyYFxuICAgICAgICAgIC8vIC0tIGJ1dCBpdCdzIHdoYXQgd2Ugc2hpcHBlZCBmb3IgMC44LjAuICBUaGUgcmF0aW9uYWxlIGlzIHRoYXRcbiAgICAgICAgICAvLyBge3sjZm9vIGJhcn19YCBpcyBzdWdhciBmb3IgYHt7I3dpdGggYmFyfX17eyNmb299fS4uLmAuXG4gICAgICAgICAgaWYgKGRhdGFDb2RlKSB7XG4gICAgICAgICAgICBpbmNsdWRlQ29kZSA9XG4gICAgICAgICAgICAgICdCbGF6ZS5fVGVtcGxhdGVXaXRoKCcgKyBkYXRhQ29kZSArICcsIGZ1bmN0aW9uICgpIHsgcmV0dXJuICcgK1xuICAgICAgICAgICAgICBpbmNsdWRlQ29kZSArICc7IH0pJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBYWFggQkFDSyBDT01QQVQgLSBVSSBpcyB0aGUgb2xkIG5hbWUsIFRlbXBsYXRlIGlzIHRoZSBuZXdcbiAgICAgICAgICBpZiAoKHBhdGhbMF0gPT09ICdVSScgfHwgcGF0aFswXSA9PT0gJ1RlbXBsYXRlJykgJiZcbiAgICAgICAgICAgICAgKHBhdGhbMV0gPT09ICdjb250ZW50QmxvY2snIHx8IHBhdGhbMV0gPT09ICdlbHNlQmxvY2snKSkge1xuICAgICAgICAgICAgLy8gQ2FsbCBjb250ZW50QmxvY2sgYW5kIGVsc2VCbG9jayBpbiB0aGUgYXBwcm9wcmlhdGUgc2NvcGVcbiAgICAgICAgICAgIGluY2x1ZGVDb2RlID0gJ0JsYXplLl9Jbk91dGVyVGVtcGxhdGVTY29wZSh2aWV3LCBmdW5jdGlvbiAoKSB7IHJldHVybiAnXG4gICAgICAgICAgICAgICsgaW5jbHVkZUNvZGUgKyAnOyB9KSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIEJsYXplVG9vbHMuRW1pdENvZGUoaW5jbHVkZUNvZGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZy50eXBlID09PSAnRVNDQVBFJykge1xuICAgICAgICByZXR1cm4gdGFnLnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2FuJ3QgZ2V0IGhlcmU7IFRlbXBsYXRlVGFnIHZhbGlkYXRpb24gc2hvdWxkIGNhdGNoIGFueVxuICAgICAgICAvLyBpbmFwcHJvcHJpYXRlIHRhZyB0eXBlcyB0aGF0IG1pZ2h0IGNvbWUgb3V0IG9mIHRoZSBwYXJzZXIuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgdGVtcGxhdGUgdGFnIHR5cGU6IFwiICsgdGFnLnR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgcGF0aGAgaXMgYW4gYXJyYXkgb2YgYXQgbGVhc3Qgb25lIHN0cmluZy5cbiAgLy9cbiAgLy8gSWYgYHBhdGgubGVuZ3RoID4gMWAsIHRoZSBnZW5lcmF0ZWQgY29kZSBtYXkgYmUgcmVhY3RpdmVcbiAgLy8gKGkuZS4gaXQgbWF5IGludmFsaWRhdGUgdGhlIGN1cnJlbnQgY29tcHV0YXRpb24pLlxuICAvL1xuICAvLyBObyBjb2RlIGlzIGdlbmVyYXRlZCB0byBjYWxsIHRoZSByZXN1bHQgaWYgaXQncyBhIGZ1bmN0aW9uLlxuICAvL1xuICAvLyBPcHRpb25zOlxuICAvL1xuICAvLyAtIGxvb2t1cFRlbXBsYXRlIHtCb29sZWFufSBJZiB0cnVlLCBnZW5lcmF0ZWQgY29kZSBhbHNvIGxvb2tzIGluXG4gIC8vICAgdGhlIGxpc3Qgb2YgdGVtcGxhdGVzLiAoQWZ0ZXIgaGVscGVycywgYmVmb3JlIGRhdGEgY29udGV4dCkuXG4gIC8vICAgVXNlZCB3aGVuIGdlbmVyYXRpbmcgY29kZSBmb3IgYHt7PiBmb299fWAgb3IgYHt7I2Zvb319YC4gT25seVxuICAvLyAgIHVzZWQgZm9yIG5vbi1kb3R0ZWQgcGF0aHMuXG4gIGNvZGVHZW5QYXRoOiBmdW5jdGlvbiAocGF0aCwgb3B0cykge1xuICAgIGlmIChidWlsdEluQmxvY2tIZWxwZXJzLmhhc093blByb3BlcnR5KHBhdGhbMF0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgdXNlIHRoZSBidWlsdC1pbiAnXCIgKyBwYXRoWzBdICsgXCInIGhlcmVcIik7XG4gICAgLy8gTGV0IGB7eyNpZiBUZW1wbGF0ZS5jb250ZW50QmxvY2t9fWAgY2hlY2sgd2hldGhlciB0aGlzIHRlbXBsYXRlIHdhc1xuICAgIC8vIGludm9rZWQgdmlhIGluY2x1c2lvbiBvciBhcyBhIGJsb2NrIGhlbHBlciwgaW4gYWRkaXRpb24gdG8gc3VwcG9ydGluZ1xuICAgIC8vIGB7ez4gVGVtcGxhdGUuY29udGVudEJsb2NrfX1gLlxuICAgIC8vIFhYWCBCQUNLIENPTVBBVCAtIFVJIGlzIHRoZSBvbGQgbmFtZSwgVGVtcGxhdGUgaXMgdGhlIG5ld1xuICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyICYmXG4gICAgICAgIChwYXRoWzBdID09PSAnVUknIHx8IHBhdGhbMF0gPT09ICdUZW1wbGF0ZScpXG4gICAgICAgICYmIGJ1aWx0SW5UZW1wbGF0ZU1hY3Jvcy5oYXNPd25Qcm9wZXJ0eShwYXRoWzFdKSkge1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID4gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBkb3R0ZWQgcGF0aCBiZWdpbm5pbmcgd2l0aCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoWzBdICsgJy4nICsgcGF0aFsxXSk7XG4gICAgICByZXR1cm4gYnVpbHRJblRlbXBsYXRlTWFjcm9zW3BhdGhbMV1dO1xuICAgIH1cblxuICAgIHZhciBmaXJzdFBhdGhJdGVtID0gQmxhemVUb29scy50b0pTTGl0ZXJhbChwYXRoWzBdKTtcbiAgICB2YXIgbG9va3VwTWV0aG9kID0gJ2xvb2t1cCc7XG4gICAgaWYgKG9wdHMgJiYgb3B0cy5sb29rdXBUZW1wbGF0ZSAmJiBwYXRoLmxlbmd0aCA9PT0gMSlcbiAgICAgIGxvb2t1cE1ldGhvZCA9ICdsb29rdXBUZW1wbGF0ZSc7XG4gICAgdmFyIGNvZGUgPSAndmlldy4nICsgbG9va3VwTWV0aG9kICsgJygnICsgZmlyc3RQYXRoSXRlbSArICcpJztcblxuICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvZGUgPSAnU3BhY2ViYXJzLmRvdCgnICsgY29kZSArICcsICcgK1xuICAgICAgcGF0aC5zbGljZSgxKS5tYXAoQmxhemVUb29scy50b0pTTGl0ZXJhbCkuam9pbignLCAnKSArICcpJztcbiAgICB9XG5cbiAgICByZXR1cm4gY29kZTtcbiAgfSxcblxuICAvLyBHZW5lcmF0ZXMgY29kZSBmb3IgYW4gYFthcmdUeXBlLCBhcmdWYWx1ZV1gIGFyZ3VtZW50IHNwZWMsXG4gIC8vIGlnbm9yaW5nIHRoZSB0aGlyZCBlbGVtZW50IChrZXl3b3JkIGFyZ3VtZW50IG5hbWUpIGlmIHByZXNlbnQuXG4gIC8vXG4gIC8vIFRoZSByZXN1bHRpbmcgY29kZSBtYXkgYmUgcmVhY3RpdmUgKGluIHRoZSBjYXNlIG9mIGEgUEFUSCBvZlxuICAvLyBtb3JlIHRoYW4gb25lIGVsZW1lbnQpIGFuZCBpcyBub3Qgd3JhcHBlZCBpbiBhIGNsb3N1cmUuXG4gIGNvZGVHZW5BcmdWYWx1ZTogZnVuY3Rpb24gKGFyZykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBhcmdUeXBlID0gYXJnWzBdO1xuICAgIHZhciBhcmdWYWx1ZSA9IGFyZ1sxXTtcblxuICAgIHZhciBhcmdDb2RlO1xuICAgIHN3aXRjaCAoYXJnVHlwZSkge1xuICAgIGNhc2UgJ1NUUklORyc6XG4gICAgY2FzZSAnTlVNQkVSJzpcbiAgICBjYXNlICdCT09MRUFOJzpcbiAgICBjYXNlICdOVUxMJzpcbiAgICAgIGFyZ0NvZGUgPSBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKGFyZ1ZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BBVEgnOlxuICAgICAgYXJnQ29kZSA9IHNlbGYuY29kZUdlblBhdGgoYXJnVmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRVhQUic6XG4gICAgICAvLyBUaGUgZm9ybWF0IG9mIEVYUFIgaXMgWydFWFBSJywgeyB0eXBlOiAnRVhQUicsIHBhdGg6IFsuLi5dLCBhcmdzOiB7IC4uLiB9IH1dXG4gICAgICBhcmdDb2RlID0gc2VsZi5jb2RlR2VuTXVzdGFjaGUoYXJnVmFsdWUucGF0aCwgYXJnVmFsdWUuYXJncywgJ2RhdGFNdXN0YWNoZScpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGNhbid0IGdldCBoZXJlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGFyZyB0eXBlOiBcIiArIGFyZ1R5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdDb2RlO1xuICB9LFxuXG4gIC8vIEdlbmVyYXRlcyBhIGNhbGwgdG8gYFNwYWNlYmFycy5mb29NdXN0YWNoZWAgb24gZXZhbHVhdGVkIGFyZ3VtZW50cy5cbiAgLy8gVGhlIHJlc3VsdGluZyBjb2RlIGhhcyBubyBmdW5jdGlvbiBsaXRlcmFscyBhbmQgbXVzdCBiZSB3cmFwcGVkIGluXG4gIC8vIG9uZSBmb3IgZmluZS1ncmFpbmVkIHJlYWN0aXZpdHkuXG4gIGNvZGVHZW5NdXN0YWNoZTogZnVuY3Rpb24gKHBhdGgsIGFyZ3MsIG11c3RhY2hlVHlwZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBuYW1lQ29kZSA9IHNlbGYuY29kZUdlblBhdGgocGF0aCk7XG4gICAgdmFyIGFyZ0NvZGUgPSBzZWxmLmNvZGVHZW5NdXN0YWNoZUFyZ3MoYXJncyk7XG4gICAgdmFyIG11c3RhY2hlID0gKG11c3RhY2hlVHlwZSB8fCAnbXVzdGFjaGUnKTtcblxuICAgIHJldHVybiAnU3BhY2ViYXJzLicgKyBtdXN0YWNoZSArICcoJyArIG5hbWVDb2RlICtcbiAgICAgIChhcmdDb2RlID8gJywgJyArIGFyZ0NvZGUuam9pbignLCAnKSA6ICcnKSArICcpJztcbiAgfSxcblxuICAvLyByZXR1cm5zOiBhcnJheSBvZiBzb3VyY2Ugc3RyaW5ncywgb3IgbnVsbCBpZiBub1xuICAvLyBhcmdzIGF0IGFsbC5cbiAgY29kZUdlbk11c3RhY2hlQXJnczogZnVuY3Rpb24gKHRhZ0FyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIga3dBcmdzID0gbnVsbDsgLy8gc291cmNlIC0+IHNvdXJjZVxuICAgIHZhciBhcmdzID0gbnVsbDsgLy8gW3NvdXJjZV1cblxuICAgIC8vIHRhZ0FyZ3MgbWF5IGJlIG51bGxcbiAgICB0YWdBcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuICAgICAgdmFyIGFyZ0NvZGUgPSBzZWxmLmNvZGVHZW5BcmdWYWx1ZShhcmcpO1xuXG4gICAgICBpZiAoYXJnLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgLy8ga2V5d29yZCBhcmd1bWVudCAocmVwcmVzZW50ZWQgYXMgW3R5cGUsIHZhbHVlLCBuYW1lXSlcbiAgICAgICAga3dBcmdzID0gKGt3QXJncyB8fCB7fSk7XG4gICAgICAgIGt3QXJnc1thcmdbMl1dID0gYXJnQ29kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBvc2l0aW9uYWwgYXJndW1lbnRcbiAgICAgICAgYXJncyA9IChhcmdzIHx8IFtdKTtcbiAgICAgICAgYXJncy5wdXNoKGFyZ0NvZGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcHV0IGt3QXJncyBpbiBvcHRpb25zIGRpY3Rpb25hcnkgYXQgZW5kIG9mIGFyZ3NcbiAgICBpZiAoa3dBcmdzKSB7XG4gICAgICBhcmdzID0gKGFyZ3MgfHwgW10pO1xuICAgICAgYXJncy5wdXNoKCdTcGFjZWJhcnMua3coJyArIG1ha2VPYmplY3RMaXRlcmFsKGt3QXJncykgKyAnKScpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzO1xuICB9LFxuXG4gIGNvZGVHZW5CbG9jazogZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICByZXR1cm4gY29kZUdlbihjb250ZW50KTtcbiAgfSxcblxuICBjb2RlR2VuSW5jbHVzaW9uRGF0YTogZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoISBhcmdzLmxlbmd0aCkge1xuICAgICAgLy8gZS5nLiBge3sjZm9vfX1gXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGFyZ3NbMF0ubGVuZ3RoID09PSAzKSB7XG4gICAgICAvLyBrZXl3b3JkIGFyZ3VtZW50cyBvbmx5LCBlLmcuIGB7ez4gcG9pbnQgeD0xIHk9Mn19YFxuICAgICAgdmFyIGRhdGFQcm9wcyA9IHt9O1xuICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdmFyIGFyZ0tleSA9IGFyZ1syXTtcbiAgICAgICAgZGF0YVByb3BzW2FyZ0tleV0gPSAnU3BhY2ViYXJzLmNhbGwoJyArIHNlbGYuY29kZUdlbkFyZ1ZhbHVlKGFyZykgKyAnKSc7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYWtlT2JqZWN0TGl0ZXJhbChkYXRhUHJvcHMpO1xuICAgIH0gZWxzZSBpZiAoYXJnc1swXVswXSAhPT0gJ1BBVEgnKSB7XG4gICAgICAvLyBsaXRlcmFsIGZpcnN0IGFyZ3VtZW50LCBlLmcuIGB7ez4gZm9vIFwiYmxhaFwifX1gXG4gICAgICAvL1xuICAgICAgLy8gdGFnIHZhbGlkYXRpb24gaGFzIGNvbmZpcm1lZCwgaW4gdGhpcyBjYXNlLCB0aGF0IHRoZXJlIGlzIG9ubHlcbiAgICAgIC8vIG9uZSBhcmd1bWVudCAoYGFyZ3MubGVuZ3RoID09PSAxYClcbiAgICAgIHJldHVybiBzZWxmLmNvZGVHZW5BcmdWYWx1ZShhcmdzWzBdKTtcbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBvbmUgYXJndW1lbnQsIG11c3QgYmUgYSBQQVRIXG4gICAgICByZXR1cm4gJ1NwYWNlYmFycy5jYWxsKCcgKyBzZWxmLmNvZGVHZW5QYXRoKGFyZ3NbMF1bMV0pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNdWx0aXBsZSBwb3NpdGlvbmFsIGFyZ3VtZW50czsgdHJlYXQgdGhlbSBhcyBhIG5lc3RlZFxuICAgICAgLy8gXCJkYXRhIG11c3RhY2hlXCJcbiAgICAgIHJldHVybiBzZWxmLmNvZGVHZW5NdXN0YWNoZShhcmdzWzBdWzFdLCBhcmdzLnNsaWNlKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhTXVzdGFjaGUnKTtcbiAgICB9XG5cbiAgfSxcblxuICBjb2RlR2VuSW5jbHVzaW9uRGF0YUZ1bmM6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhQ29kZSA9IHNlbGYuY29kZUdlbkluY2x1c2lvbkRhdGEoYXJncyk7XG4gICAgaWYgKGRhdGFDb2RlKSB7XG4gICAgICByZXR1cm4gJ2Z1bmN0aW9uICgpIHsgcmV0dXJuICcgKyBkYXRhQ29kZSArICc7IH0nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEhUTUxUb29scyB9IGZyb20gJ21ldGVvci9odG1sLXRvb2xzJztcbmltcG9ydCB7IEhUTUwgfSBmcm9tICdtZXRlb3IvaHRtbGpzJztcbmltcG9ydCB7IEJsYXplVG9vbHMgfSBmcm9tICdtZXRlb3IvYmxhemUtdG9vbHMnO1xuaW1wb3J0IHsgQ29kZUdlbiB9IGZyb20gJy4vY29kZWdlbic7XG5pbXBvcnQgeyBvcHRpbWl6ZSB9IGZyb20gJy4vb3B0aW1pemVyJztcbmltcG9ydCB7IFJlYWN0Q29tcG9uZW50U2libGluZ0ZvcmJpZGRlcn0gZnJvbSAnLi9yZWFjdCc7XG5pbXBvcnQgeyBUZW1wbGF0ZVRhZyB9IGZyb20gJy4vdGVtcGxhdGV0YWcnO1xuaW1wb3J0IHsgcmVtb3ZlV2hpdGVzcGFjZSB9IGZyb20gJy4vd2hpdGVzcGFjZSc7XG5cbnZhciBVZ2xpZnlKU01pbmlmeSA9IG51bGw7XG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIFVnbGlmeUpTTWluaWZ5ID0gTnBtLnJlcXVpcmUoJ3VnbGlmeS1qcycpLm1pbmlmeTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gIHJldHVybiBIVE1MVG9vbHMucGFyc2VGcmFnbWVudChcbiAgICBpbnB1dCxcbiAgICB7IGdldFRlbXBsYXRlVGFnOiBUZW1wbGF0ZVRhZy5wYXJzZUNvbXBsZXRlVGFnIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZShpbnB1dCwgb3B0aW9ucykge1xuICB2YXIgdHJlZSA9IHBhcnNlKGlucHV0KTtcbiAgcmV0dXJuIGNvZGVHZW4odHJlZSwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBjb25zdCBUZW1wbGF0ZVRhZ1JlcGxhY2VyID0gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLmV4dGVuZCgpO1xuVGVtcGxhdGVUYWdSZXBsYWNlci5kZWYoe1xuICB2aXNpdE9iamVjdDogZnVuY3Rpb24gKHgpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEhUTUxUb29scy5UZW1wbGF0ZVRhZykge1xuXG4gICAgICAvLyBNYWtlIHN1cmUgYWxsIFRlbXBsYXRlVGFncyBpbiBhdHRyaWJ1dGVzIGhhdmUgdGhlIHJpZ2h0XG4gICAgICAvLyBgLnBvc2l0aW9uYCBzZXQgb24gdGhlbS4gIFRoaXMgaXMgYSBiaXQgb2YgYSBoYWNrXG4gICAgICAvLyAod2Ugc2hvdWxkbid0IGJlIG11dGF0aW5nIHRoYXQgaGVyZSksIGJ1dCBpdCBhbGxvd3NcbiAgICAgIC8vIGNsZWFuZXIgY29kZWdlbiBvZiBcInN5bnRoZXRpY1wiIGF0dHJpYnV0ZXMgbGlrZSBURVhUQVJFQSdzXG4gICAgICAvLyBcInZhbHVlXCIsIHdoZXJlIHRoZSB0ZW1wbGF0ZSB0YWdzIHdlcmUgb3JpZ2luYWxseSBub3RcbiAgICAgIC8vIGluIGFuIGF0dHJpYnV0ZS5cbiAgICAgIGlmICh0aGlzLmluQXR0cmlidXRlVmFsdWUpXG4gICAgICAgIHgucG9zaXRpb24gPSBIVE1MVG9vbHMuVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX0FUVFJJQlVURTtcblxuICAgICAgcmV0dXJuIHRoaXMuY29kZWdlbi5jb2RlR2VuVGVtcGxhdGVUYWcoeCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5wcm90b3R5cGUudmlzaXRPYmplY3QuY2FsbCh0aGlzLCB4KTtcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMpIHtcbiAgICBpZiAoYXR0cnMgaW5zdGFuY2VvZiBIVE1MVG9vbHMuVGVtcGxhdGVUYWcpXG4gICAgICByZXR1cm4gdGhpcy5jb2RlZ2VuLmNvZGVHZW5UZW1wbGF0ZVRhZyhhdHRycyk7XG5cbiAgICAvLyBjYWxsIHN1cGVyIChlLmcuIGZvciBjYXNlIHdoZXJlIGBhdHRyc2AgaXMgYW4gYXJyYXkpXG4gICAgcmV0dXJuIEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5wcm90b3R5cGUudmlzaXRBdHRyaWJ1dGVzLmNhbGwodGhpcywgYXR0cnMpO1xuICB9LFxuICB2aXNpdEF0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCB0YWcpIHtcbiAgICB0aGlzLmluQXR0cmlidXRlVmFsdWUgPSB0cnVlO1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnZpc2l0KHZhbHVlKTtcbiAgICB0aGlzLmluQXR0cmlidXRlVmFsdWUgPSBmYWxzZTtcblxuICAgIGlmIChyZXN1bHQgIT09IHZhbHVlKSB7XG4gICAgICAvLyBzb21lIHRlbXBsYXRlIHRhZ3MgbXVzdCBoYXZlIGJlZW4gcmVwbGFjZWQsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgICAvLyB3ZSB0cnkgdG8ga2VlcCB0aGluZ3MgYD09PWAgd2hlbiB0cmFuc2Zvcm1pbmcuICBXcmFwIHRoZSBjb2RlXG4gICAgICAvLyBpbiBhIGZ1bmN0aW9uIGFzIHBlciB0aGUgcnVsZXMuICBZb3UgY2FuJ3QgaGF2ZVxuICAgICAgLy8gYHtpZDogQmxhemUuVmlldyguLi4pfWAgYXMgYW4gYXR0cmlidXRlcyBkaWN0IGJlY2F1c2UgdGhlIFZpZXdcbiAgICAgIC8vIHdvdWxkIGJlIHJlbmRlcmVkIG1vcmUgdGhhbiBvbmNlOyB5b3UgbmVlZCB0byB3cmFwIGl0IGluIGEgZnVuY3Rpb25cbiAgICAgIC8vIHNvIHRoYXQgaXQncyBhIGRpZmZlcmVudCBWaWV3IGVhY2ggdGltZS5cbiAgICAgIHJldHVybiBCbGF6ZVRvb2xzLkVtaXRDb2RlKHRoaXMuY29kZWdlbi5jb2RlR2VuQmxvY2socmVzdWx0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gY29kZUdlbiAocGFyc2VUcmVlLCBvcHRpb25zKSB7XG4gIC8vIGlzIHRoaXMgYSB0ZW1wbGF0ZSwgcmF0aGVyIHRoYW4gYSBibG9jayBwYXNzZWQgdG9cbiAgLy8gYSBibG9jayBoZWxwZXIsIHNheVxuICB2YXIgaXNUZW1wbGF0ZSA9IChvcHRpb25zICYmIG9wdGlvbnMuaXNUZW1wbGF0ZSk7XG4gIHZhciBpc0JvZHkgPSAob3B0aW9ucyAmJiBvcHRpb25zLmlzQm9keSk7XG4gIHZhciB3aGl0ZXNwYWNlID0gKG9wdGlvbnMgJiYgb3B0aW9ucy53aGl0ZXNwYWNlKVxuICB2YXIgc291cmNlTmFtZSA9IChvcHRpb25zICYmIG9wdGlvbnMuc291cmNlTmFtZSk7XG5cbiAgdmFyIHRyZWUgPSBwYXJzZVRyZWU7XG5cbiAgLy8gVGhlIGZsYWdzIGBpc1RlbXBsYXRlYCBhbmQgYGlzQm9keWAgYXJlIGtpbmQgb2YgYSBoYWNrLlxuICBpZiAoaXNUZW1wbGF0ZSB8fCBpc0JvZHkpIHtcbiAgICBpZiAodHlwZW9mIHdoaXRlc3BhY2UgPT09ICdzdHJpbmcnICYmIHdoaXRlc3BhY2UudG9Mb3dlckNhc2UoKSA9PT0gJ3N0cmlwJykge1xuICAgICAgdHJlZSA9IHJlbW92ZVdoaXRlc3BhY2UodHJlZSk7XG4gICAgfVxuICAgIC8vIG9wdGltaXppbmcgZnJhZ21lbnRzIHdvdWxkIHJlcXVpcmUgYmVpbmcgc21hcnRlciBhYm91dCB3aGV0aGVyIHdlIGFyZVxuICAgIC8vIGluIGEgVEVYVEFSRUEsIHNheS5cbiAgICB0cmVlID0gb3B0aW1pemUodHJlZSk7XG4gIH1cblxuICAvLyB0aHJvd3MgYW4gZXJyb3IgaWYgdXNpbmcgYHt7PiBSZWFjdH19YCB3aXRoIHNpYmxpbmdzXG4gIG5ldyBSZWFjdENvbXBvbmVudFNpYmxpbmdGb3JiaWRkZXIoe3NvdXJjZU5hbWU6IHNvdXJjZU5hbWV9KVxuICAgIC52aXNpdCh0cmVlKTtcblxuICB2YXIgY29kZWdlbiA9IG5ldyBDb2RlR2VuO1xuICB0cmVlID0gKG5ldyBUZW1wbGF0ZVRhZ1JlcGxhY2VyKFxuICAgIHtjb2RlZ2VuOiBjb2RlZ2VufSkpLnZpc2l0KHRyZWUpO1xuXG4gIHZhciBjb2RlID0gJyhmdW5jdGlvbiAoKSB7ICc7XG4gIGlmIChpc1RlbXBsYXRlIHx8IGlzQm9keSkge1xuICAgIGNvZGUgKz0gJ3ZhciB2aWV3ID0gdGhpczsgJztcbiAgfVxuICBjb2RlICs9ICdyZXR1cm4gJztcbiAgY29kZSArPSBCbGF6ZVRvb2xzLnRvSlModHJlZSk7XG4gIGNvZGUgKz0gJzsgfSknO1xuXG4gIGNvZGUgPSBiZWF1dGlmeShjb2RlKTtcblxuICByZXR1cm4gY29kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJlYXV0aWZ5IChjb2RlKSB7XG4gIGlmICghVWdsaWZ5SlNNaW5pZnkpIHtcbiAgICByZXR1cm4gY29kZTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBVZ2xpZnlKU01pbmlmeShjb2RlLCB7XG4gICAgbWFuZ2xlOiBmYWxzZSxcbiAgICBjb21wcmVzczogZmFsc2UsXG4gICAgb3V0cHV0OiB7XG4gICAgICBiZWF1dGlmeTogdHJ1ZSxcbiAgICAgIGluZGVudF9sZXZlbDogMixcbiAgICAgIHdpZHRoOiA4MFxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIG91dHB1dCA9IHJlc3VsdC5jb2RlO1xuICAvLyBVZ2xpZnkgaW50ZXJwcmV0cyBvdXIgZXhwcmVzc2lvbiBhcyBhIHN0YXRlbWVudCBhbmQgbWF5IGFkZCBhIHNlbWljb2xvbi5cbiAgLy8gU3RyaXAgdHJhaWxpbmcgc2VtaWNvbG9uLlxuICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvOyQvLCAnJyk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG4iLCJpbXBvcnQgeyBIVE1MVG9vbHMgfSBmcm9tICdtZXRlb3IvaHRtbC10b29scyc7XG5pbXBvcnQgeyBIVE1MIH0gZnJvbSAnbWV0ZW9yL2h0bWxqcyc7XG5cbi8vIE9wdGltaXplIHBhcnRzIG9mIGFuIEhUTUxqcyB0cmVlIGludG8gcmF3IEhUTUwgc3RyaW5ncyB3aGVuIHRoZXkgZG9uJ3Rcbi8vIGNvbnRhaW4gdGVtcGxhdGUgdGFncy5cblxudmFyIGNvbnN0YW50ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfTtcbn07XG5cbnZhciBPUFRJTUlaQUJMRSA9IHtcbiAgTk9ORTogMCxcbiAgUEFSVFM6IDEsXG4gIEZVTEw6IDJcbn07XG5cbi8vIFdlIGNhbiBvbmx5IHR1cm4gY29udGVudCBpbnRvIGFuIEhUTUwgc3RyaW5nIGlmIGl0IGNvbnRhaW5zIG5vIHRlbXBsYXRlXG4vLyB0YWdzIGFuZCBubyBcInRyaWNreVwiIEhUTUwgdGFncy4gIElmIHdlIGNhbiBvcHRpbWl6ZSB0aGUgZW50aXJlIGNvbnRlbnRcbi8vIGludG8gYSBzdHJpbmcsIHdlIHJldHVybiBPUFRJTUlaQUJMRS5GVUxMLiAgSWYgdGhlIHdlIGFyZSBnaXZlbiBhblxuLy8gdW5vcHRpbWl6YWJsZSBub2RlLCB3ZSByZXR1cm4gT1BUSU1JWkFCTEUuTk9ORS4gIElmIHdlIGFyZSBnaXZlbiBhIHRyZWVcbi8vIHRoYXQgY29udGFpbnMgYW4gdW5vcHRpbWl6YWJsZSBub2RlIHNvbWV3aGVyZSwgd2UgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTLlxuLy9cbi8vIEZvciBleGFtcGxlLCB3ZSBhbHdheXMgY3JlYXRlIFNWRyBlbGVtZW50cyBwcm9ncmFtbWF0aWNhbGx5LCBzaW5jZSBTVkdcbi8vIGRvZXNuJ3QgaGF2ZSBpbm5lckhUTUwuICBJZiB3ZSBhcmUgZ2l2ZW4gYW4gU1ZHIGVsZW1lbnQsIHdlIHJldHVybiBOT05FLlxuLy8gSG93ZXZlciwgaWYgd2UgYXJlIGdpdmVuIGEgYmlnIHRyZWUgdGhhdCBjb250YWlucyBTVkcgc29tZXdoZXJlLCB3ZVxuLy8gcmV0dXJuIFBBUlRTIHNvIHRoYXQgdGhlIG9wdGltaXplciBjYW4gZGVzY2VuZCBpbnRvIHRoZSB0cmVlIGFuZCBvcHRpbWl6ZVxuLy8gb3RoZXIgcGFydHMgb2YgaXQuXG52YXIgQ2FuT3B0aW1pemVWaXNpdG9yID0gSFRNTC5WaXNpdG9yLmV4dGVuZCgpO1xuQ2FuT3B0aW1pemVWaXNpdG9yLmRlZih7XG4gIHZpc2l0TnVsbDogY29uc3RhbnQoT1BUSU1JWkFCTEUuRlVMTCksXG4gIHZpc2l0UHJpbWl0aXZlOiBjb25zdGFudChPUFRJTUlaQUJMRS5GVUxMKSxcbiAgdmlzaXRDb21tZW50OiBjb25zdGFudChPUFRJTUlaQUJMRS5GVUxMKSxcbiAgdmlzaXRDaGFyUmVmOiBjb25zdGFudChPUFRJTUlaQUJMRS5GVUxMKSxcbiAgdmlzaXRSYXc6IGNvbnN0YW50KE9QVElNSVpBQkxFLkZVTEwpLFxuICB2aXNpdE9iamVjdDogY29uc3RhbnQoT1BUSU1JWkFCTEUuTk9ORSksXG4gIHZpc2l0RnVuY3Rpb246IGNvbnN0YW50KE9QVElNSVpBQkxFLk5PTkUpLFxuICB2aXNpdEFycmF5OiBmdW5jdGlvbiAoeCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKylcbiAgICAgIGlmICh0aGlzLnZpc2l0KHhbaV0pICE9PSBPUFRJTUlaQUJMRS5GVUxMKVxuICAgICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG4gICAgcmV0dXJuIE9QVElNSVpBQkxFLkZVTEw7XG4gIH0sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdmFyIHRhZ05hbWUgPSB0YWcudGFnTmFtZTtcbiAgICBpZiAodGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgLy8gb3B0aW1pemluZyBpbnRvIGEgVEVYVEFSRUEncyBSQ0RBVEEgd291bGQgcmVxdWlyZSBiZWluZyBhIGxpdHRsZVxuICAgICAgLy8gbW9yZSBjbGV2ZXIuXG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuTk9ORTtcbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICdzY3JpcHQnKSB7XG4gICAgICAvLyBzY3JpcHQgdGFncyBkb24ndCB3b3JrIHdoZW4gcmVuZGVyZWQgZnJvbSBzdHJpbmdzXG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuTk9ORTtcbiAgICB9IGVsc2UgaWYgKCEgKEhUTUwuaXNLbm93bkVsZW1lbnQodGFnTmFtZSkgJiZcbiAgICAgICAgICAgICAgICAgICEgSFRNTC5pc0tub3duU1ZHRWxlbWVudCh0YWdOYW1lKSkpIHtcbiAgICAgIC8vIGZvcmVpZ24gZWxlbWVudHMgbGlrZSBTVkcgY2FuJ3QgYmUgc3RyaW5naWZpZWQgZm9yIGlubmVySFRNTC5cbiAgICAgIHJldHVybiBPUFRJTUlaQUJMRS5OT05FO1xuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ3RhYmxlJykge1xuICAgICAgLy8gQXZvaWQgZXZlciBwcm9kdWNpbmcgSFRNTCBjb250YWluaW5nIGA8dGFibGU+PHRyPi4uLmAsIGJlY2F1c2UgdGhlXG4gICAgICAvLyBicm93c2VyIHdpbGwgaW5zZXJ0IGEgVEJPRFkuICBJZiB3ZSBqdXN0IGBjcmVhdGVFbGVtZW50KFwidGFibGVcIilgIGFuZFxuICAgICAgLy8gYGNyZWF0ZUVsZW1lbnQoXCJ0clwiKWAsIG9uIHRoZSBvdGhlciBoYW5kLCBubyBUQk9EWSBpcyBuZWNlc3NhcnlcbiAgICAgIC8vIChhc3N1bWluZyBJRSA4KykuXG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAndHInKXtcbiAgICAgIHJldHVybiBPUFRJTUlaQUJMRS5QQVJUUztcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRyZW4gPSB0YWcuY2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcbiAgICAgIGlmICh0aGlzLnZpc2l0KGNoaWxkcmVuW2ldKSAhPT0gT1BUSU1JWkFCTEUuRlVMTClcbiAgICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTO1xuXG4gICAgaWYgKHRoaXMudmlzaXRBdHRyaWJ1dGVzKHRhZy5hdHRycykgIT09IE9QVElNSVpBQkxFLkZVTEwpXG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG5cbiAgICByZXR1cm4gT1BUSU1JWkFCTEUuRlVMTDtcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMpIHtcbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIHZhciBpc0FycmF5ID0gSFRNTC5pc0FycmF5KGF0dHJzKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKGlzQXJyYXkgPyBhdHRycy5sZW5ndGggOiAxKTsgaSsrKSB7XG4gICAgICAgIHZhciBhID0gKGlzQXJyYXkgPyBhdHRyc1tpXSA6IGF0dHJzKTtcbiAgICAgICAgaWYgKCh0eXBlb2YgYSAhPT0gJ29iamVjdCcpIHx8IChhIGluc3RhbmNlb2YgSFRNTFRvb2xzLlRlbXBsYXRlVGFnKSlcbiAgICAgICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG4gICAgICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgICBpZiAodGhpcy52aXNpdChhW2tdKSAhPT0gT1BUSU1JWkFCTEUuRlVMTClcbiAgICAgICAgICAgIHJldHVybiBPUFRJTUlaQUJMRS5QQVJUUztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIE9QVElNSVpBQkxFLkZVTEw7XG4gIH1cbn0pO1xuXG52YXIgZ2V0T3B0aW1pemFiaWxpdHkgPSBmdW5jdGlvbiAoY29udGVudCkge1xuICByZXR1cm4gKG5ldyBDYW5PcHRpbWl6ZVZpc2l0b3IpLnZpc2l0KGNvbnRlbnQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvUmF3KHgpIHtcbiAgcmV0dXJuIEhUTUwuUmF3KEhUTUwudG9IVE1MKHgpKTtcbn1cblxuZXhwb3J0IGNvbnN0IFRyZWVUcmFuc2Zvcm1lciA9IEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5leHRlbmQoKTtcblRyZWVUcmFuc2Zvcm1lci5kZWYoe1xuICB2aXNpdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgY29uc3QgW2F0dHJzXSA9IGFyZ3M7XG4gICAgLy8gcGFzcyB0ZW1wbGF0ZSB0YWdzIHRocm91Z2ggYnkgZGVmYXVsdFxuICAgIGlmIChhdHRycyBpbnN0YW5jZW9mIEhUTUxUb29scy5UZW1wbGF0ZVRhZylcbiAgICAgIHJldHVybiBhdHRycztcblxuICAgIHJldHVybiBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IucHJvdG90eXBlLnZpc2l0QXR0cmlidXRlcy5hcHBseShcbiAgICAgIHRoaXMsIGFyZ3MpO1xuICB9XG59KTtcblxuLy8gUmVwbGFjZSBwYXJ0cyBvZiB0aGUgSFRNTGpzIHRyZWUgdGhhdCBoYXZlIG5vIHRlbXBsYXRlIHRhZ3MgKG9yXG4vLyB0cmlja3kgSFRNTCB0YWdzKSB3aXRoIEhUTUwuUmF3IG9iamVjdHMgY29udGFpbmluZyByYXcgSFRNTC5cbnZhciBPcHRpbWl6aW5nVmlzaXRvciA9IFRyZWVUcmFuc2Zvcm1lci5leHRlbmQoKTtcbk9wdGltaXppbmdWaXNpdG9yLmRlZih7XG4gIHZpc2l0TnVsbDogdG9SYXcsXG4gIHZpc2l0UHJpbWl0aXZlOiB0b1JhdyxcbiAgdmlzaXRDb21tZW50OiB0b1JhdyxcbiAgdmlzaXRDaGFyUmVmOiB0b1JhdyxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgdmFyIG9wdGltaXphYmlsaXR5ID0gZ2V0T3B0aW1pemFiaWxpdHkoYXJyYXkpO1xuICAgIGlmIChvcHRpbWl6YWJpbGl0eSA9PT0gT1BUSU1JWkFCTEUuRlVMTCkge1xuICAgICAgcmV0dXJuIHRvUmF3KGFycmF5KTtcbiAgICB9IGVsc2UgaWYgKG9wdGltaXphYmlsaXR5ID09PSBPUFRJTUlaQUJMRS5QQVJUUykge1xuICAgICAgcmV0dXJuIFRyZWVUcmFuc2Zvcm1lci5wcm90b3R5cGUudmlzaXRBcnJheS5jYWxsKHRoaXMsIGFycmF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgfSxcbiAgdmlzaXRUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICB2YXIgb3B0aW1pemFiaWxpdHkgPSBnZXRPcHRpbWl6YWJpbGl0eSh0YWcpO1xuICAgIGlmIChvcHRpbWl6YWJpbGl0eSA9PT0gT1BUSU1JWkFCTEUuRlVMTCkge1xuICAgICAgcmV0dXJuIHRvUmF3KHRhZyk7XG4gICAgfSBlbHNlIGlmIChvcHRpbWl6YWJpbGl0eSA9PT0gT1BUSU1JWkFCTEUuUEFSVFMpIHtcbiAgICAgIHJldHVybiBUcmVlVHJhbnNmb3JtZXIucHJvdG90eXBlLnZpc2l0VGFnLmNhbGwodGhpcywgdGFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRhZztcbiAgICB9XG4gIH0sXG4gIHZpc2l0Q2hpbGRyZW46IGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgIC8vIGRvbid0IG9wdGltaXplIHRoZSBjaGlsZHJlbiBhcnJheSBpbnRvIGEgUmF3IG9iamVjdCFcbiAgICByZXR1cm4gVHJlZVRyYW5zZm9ybWVyLnByb3RvdHlwZS52aXNpdEFycmF5LmNhbGwodGhpcywgY2hpbGRyZW4pO1xuICB9LFxuICB2aXNpdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChhdHRycykge1xuICAgIHJldHVybiBhdHRycztcbiAgfVxufSk7XG5cbi8vIENvbWJpbmUgY29uc2VjdXRpdmUgSFRNTC5SYXdzLiAgUmVtb3ZlIGVtcHR5IG9uZXMuXG52YXIgUmF3Q29tcGFjdGluZ1Zpc2l0b3IgPSBUcmVlVHJhbnNmb3JtZXIuZXh0ZW5kKCk7XG5SYXdDb21wYWN0aW5nVmlzaXRvci5kZWYoe1xuICB2aXNpdEFycmF5OiBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmICgoaXRlbSBpbnN0YW5jZW9mIEhUTUwuUmF3KSAmJlxuICAgICAgICAgICgoISBpdGVtLnZhbHVlKSB8fFxuICAgICAgICAgICAocmVzdWx0Lmxlbmd0aCAmJlxuICAgICAgICAgICAgKHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBIVE1MLlJhdykpKSkge1xuICAgICAgICAvLyB0d28gY2FzZXM6IGl0ZW0gaXMgYW4gZW1wdHkgUmF3LCBvciBwcmV2aW91cyBpdGVtIGlzXG4gICAgICAgIC8vIGEgUmF3IGFzIHdlbGwuICBJbiB0aGUgbGF0dGVyIGNhc2UsIHJlcGxhY2UgdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIFJhdyB3aXRoIGEgbG9uZ2VyIG9uZSB0aGF0IGluY2x1ZGVzIHRoZSBuZXcgUmF3LlxuICAgICAgICBpZiAoaXRlbS52YWx1ZSkge1xuICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSBIVE1MLlJhdyhcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0udmFsdWUgKyBpdGVtLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy52aXNpdChpdGVtKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG4vLyBSZXBsYWNlIHBvaW50bGVzcyBSYXdzIGxpa2UgYEhUTWwuUmF3KCdmb28nKWAgdGhhdCBjb250YWluIG5vIHNwZWNpYWxcbi8vIGNoYXJhY3RlcnMgd2l0aCBzaW1wbGUgc3RyaW5ncy5cbnZhciBSYXdSZXBsYWNpbmdWaXNpdG9yID0gVHJlZVRyYW5zZm9ybWVyLmV4dGVuZCgpO1xuUmF3UmVwbGFjaW5nVmlzaXRvci5kZWYoe1xuICB2aXNpdFJhdzogZnVuY3Rpb24gKHJhdykge1xuICAgIHZhciBodG1sID0gcmF3LnZhbHVlO1xuICAgIGlmIChodG1sLmluZGV4T2YoJyYnKSA8IDAgJiYgaHRtbC5pbmRleE9mKCc8JykgPCAwKSB7XG4gICAgICByZXR1cm4gaHRtbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJhdztcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemUgKHRyZWUpIHtcbiAgdHJlZSA9IChuZXcgT3B0aW1pemluZ1Zpc2l0b3IpLnZpc2l0KHRyZWUpO1xuICB0cmVlID0gKG5ldyBSYXdDb21wYWN0aW5nVmlzaXRvcikudmlzaXQodHJlZSk7XG4gIHRyZWUgPSAobmV3IFJhd1JlcGxhY2luZ1Zpc2l0b3IpLnZpc2l0KHRyZWUpO1xuICByZXR1cm4gdHJlZTtcbn1cbiIsImltcG9ydCB7IEhUTUxUb29scyB9IGZyb20gJ21ldGVvci9odG1sLXRvb2xzJztcbmltcG9ydCB7IEhUTUwgfSBmcm9tICdtZXRlb3IvaHRtbGpzJztcbmltcG9ydCB7IEJsYXplVG9vbHMgfSBmcm9tICdtZXRlb3IvYmxhemUtdG9vbHMnO1xuXG4vLyBBIHZpc2l0b3IgdG8gZW5zdXJlIHRoYXQgUmVhY3QgY29tcG9uZW50cyBpbmNsdWRlZCB2aWEgdGhlIGB7ez5cbi8vIFJlYWN0fX1gIHRlbXBsYXRlIGRlZmluZWQgaW4gdGhlIHJlYWN0LXRlbXBsYXRlLWhlbHBlciBwYWNrYWdlIGFyZVxuLy8gdGhlIG9ubHkgY2hpbGQgaW4gdGhlaXIgcGFyZW50IGNvbXBvbmVudC4gT3RoZXJ3aXNlIGBSZWFjdC5yZW5kZXJgXG4vLyB3b3VsZCBlbGltaW5hdGUgYWxsIG9mIHRoZWlyIHNpYmxpbmcgbm9kZXMuXG4vL1xuLy8gSXQncyBhIGxpdHRsZSBzdHJhbmdlIHRoYXQgdGhpcyBsb2dpYyBpcyBpbiBzcGFjZWJhcnMtY29tcGlsZXIgaWZcbi8vIGl0J3Mgb25seSByZWxldmFudCB0byBhIHNwZWNpZmljIHBhY2thZ2UgYnV0IHRoZXJlJ3Mgbm8gd2F5IHRvIGhhdmVcbi8vIGEgcGFja2FnZSBob29rIGludG8gYSBidWlsZCBwbHVnaW4uXG5leHBvcnQgY29uc3QgUmVhY3RDb21wb25lbnRTaWJsaW5nRm9yYmlkZGVyID0gSFRNTC5WaXNpdG9yLmV4dGVuZCgpO1xuUmVhY3RDb21wb25lbnRTaWJsaW5nRm9yYmlkZGVyLmRlZih7XG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgcGFyZW50VGFnKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy52aXNpdChhcnJheVtpXSwgcGFyZW50VGFnKTtcbiAgICB9XG4gIH0sXG4gIHZpc2l0T2JqZWN0OiBmdW5jdGlvbiAob2JqLCBwYXJlbnRUYWcpIHtcbiAgICBpZiAob2JqLnR5cGUgPT09IFwiSU5DTFVTSU9OXCIgJiYgb2JqLnBhdGgubGVuZ3RoID09PSAxICYmIG9iai5wYXRoWzBdID09PSBcIlJlYWN0XCIpIHtcbiAgICAgIGlmICghcGFyZW50VGFnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcInt7PiBSZWFjdH19IG11c3QgYmUgdXNlZCBpbiBhIGNvbnRhaW5lciBlbGVtZW50XCJcbiAgICAgICAgICAgICsgKHRoaXMuc291cmNlTmFtZSA/IChcIiBpbiBcIiArIHRoaXMuc291cmNlTmFtZSkgOiBcIlwiKVxuICAgICAgICAgICAgICAgKyBcIi4gTGVhcm4gbW9yZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci93aWtpL1JlYWN0LWNvbXBvbmVudHMtbXVzdC1iZS10aGUtb25seS10aGluZy1pbi10aGVpci13cmFwcGVyLWVsZW1lbnRcIik7XG4gICAgICB9XG5cbiAgICAgIHZhciBudW1TaWJsaW5ncyA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudFRhZy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBwYXJlbnRUYWcuY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChjaGlsZCAhPT0gb2JqICYmICEodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiICYmIGNoaWxkLm1hdGNoKC9eXFxzKiQvKSkpIHtcbiAgICAgICAgICBudW1TaWJsaW5ncysrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1TaWJsaW5ncyA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIFwie3s+IFJlYWN0fX0gbXVzdCBiZSB1c2VkIGFzIHRoZSBvbmx5IGNoaWxkIGluIGEgY29udGFpbmVyIGVsZW1lbnRcIlxuICAgICAgICAgICAgKyAodGhpcy5zb3VyY2VOYW1lID8gKFwiIGluIFwiICsgdGhpcy5zb3VyY2VOYW1lKSA6IFwiXCIpXG4gICAgICAgICAgICAgICArIFwiLiBMZWFybiBtb3JlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL3dpa2kvUmVhY3QtY29tcG9uZW50cy1tdXN0LWJlLXRoZS1vbmx5LXRoaW5nLWluLXRoZWlyLXdyYXBwZXItZWxlbWVudFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdGhpcy52aXNpdEFycmF5KHRhZy5jaGlsZHJlbiwgdGFnIC8qcGFyZW50VGFnKi8pO1xuICB9XG59KTtcbiIsImltcG9ydCB7IEhUTUxUb29scyB9IGZyb20gJ21ldGVvci9odG1sLXRvb2xzJztcbmltcG9ydCB7IEhUTUwgfSBmcm9tICdtZXRlb3IvaHRtbGpzJztcbmltcG9ydCB7IEJsYXplVG9vbHMgfSBmcm9tICdtZXRlb3IvYmxhemUtdG9vbHMnO1xuXG4vLyBBIFRlbXBsYXRlVGFnIGlzIHRoZSByZXN1bHQgb2YgcGFyc2luZyBhIHNpbmdsZSBge3suLi59fWAgdGFnLlxuLy9cbi8vIFRoZSBgLnR5cGVgIG9mIGEgVGVtcGxhdGVUYWcgaXMgb25lIG9mOlxuLy9cbi8vIC0gYFwiRE9VQkxFXCJgIC0gYHt7Zm9vfX1gXG4vLyAtIGBcIlRSSVBMRVwiYCAtIGB7e3tmb299fX1gXG4vLyAtIGBcIkVYUFJcImAgLSBgKGZvbylgXG4vLyAtIGBcIkNPTU1FTlRcImAgLSBge3shIGZvb319YFxuLy8gLSBgXCJCTE9DS0NPTU1FTlRcIiAtIGB7eyEtLSBmb28tLX19YFxuLy8gLSBgXCJJTkNMVVNJT05cImAgLSBge3s+IGZvb319YFxuLy8gLSBgXCJCTE9DS09QRU5cImAgLSBge3sjZm9vfX1gXG4vLyAtIGBcIkJMT0NLQ0xPU0VcImAgLSBge3svZm9vfX1gXG4vLyAtIGBcIkVMU0VcImAgLSBge3tlbHNlfX1gXG4vLyAtIGBcIkVTQ0FQRVwiYCAtIGB7e3xgLCBge3t7fGAsIGB7e3t7fGAgYW5kIHNvIG9uXG4vL1xuLy8gQmVzaWRlcyBgdHlwZWAsIHRoZSBtYW5kYXRvcnkgcHJvcGVydGllcyBvZiBhIFRlbXBsYXRlVGFnIGFyZTpcbi8vXG4vLyAtIGBwYXRoYCAtIEFuIGFycmF5IG9mIG9uZSBvciBtb3JlIHN0cmluZ3MuICBUaGUgcGF0aCBvZiBge3tmb28uYmFyfX1gXG4vLyAgIGlzIGBbXCJmb29cIiwgXCJiYXJcIl1gLiAgQXBwbGllcyB0byBET1VCTEUsIFRSSVBMRSwgSU5DTFVTSU9OLCBCTE9DS09QRU4sXG4vLyAgIEJMT0NLQ0xPU0UsIGFuZCBFTFNFLlxuLy9cbi8vIC0gYGFyZ3NgIC0gQW4gYXJyYXkgb2YgemVybyBvciBtb3JlIGFyZ3VtZW50IHNwZWNzLiAgQW4gYXJndW1lbnQgc3BlY1xuLy8gICBpcyBhIHR3byBvciB0aHJlZSBlbGVtZW50IGFycmF5LCBjb25zaXN0aW5nIG9mIGEgdHlwZSwgdmFsdWUsIGFuZFxuLy8gICBvcHRpb25hbCBrZXl3b3JkIG5hbWUuICBGb3IgZXhhbXBsZSwgdGhlIGBhcmdzYCBvZiBge3tmb28gXCJiYXJcIiB4PTN9fWBcbi8vICAgYXJlIGBbW1wiU1RSSU5HXCIsIFwiYmFyXCJdLCBbXCJOVU1CRVJcIiwgMywgXCJ4XCJdXWAuICBBcHBsaWVzIHRvIERPVUJMRSxcbi8vICAgVFJJUExFLCBJTkNMVVNJT04sIEJMT0NLT1BFTiwgYW5kIEVMU0UuXG4vL1xuLy8gLSBgdmFsdWVgIC0gQSBzdHJpbmcgb2YgdGhlIGNvbW1lbnQncyB0ZXh0LiBBcHBsaWVzIHRvIENPTU1FTlQgYW5kXG4vLyAgIEJMT0NLQ09NTUVOVC5cbi8vXG4vLyBUaGVzZSBhZGRpdGlvbmFsIGFyZSB0eXBpY2FsbHkgc2V0IGR1cmluZyBwYXJzaW5nOlxuLy9cbi8vIC0gYHBvc2l0aW9uYCAtIFRoZSBIVE1MVG9vbHMuVEVNUExBVEVfVEFHX1BPU0lUSU9OIHNwZWNpZnlpbmcgYXQgd2hhdCBzb3J0XG4vLyAgIG9mIHNpdGUgdGhlIFRlbXBsYXRlVGFnIHdhcyBlbmNvdW50ZXJlZCAoZS5nLiBhdCBlbGVtZW50IGxldmVsIG9yIGFzXG4vLyAgIHBhcnQgb2YgYW4gYXR0cmlidXRlIHZhbHVlKS4gSXRzIGFic2VuY2UgaW1wbGllc1xuLy8gICBURU1QTEFURV9UQUdfUE9TSVRJT04uRUxFTUVOVC5cbi8vXG4vLyAtIGBjb250ZW50YCBhbmQgYGVsc2VDb250ZW50YCAtIFdoZW4gYSBCTE9DS09QRU4gdGFnJ3MgY29udGVudHMgYXJlXG4vLyAgIHBhcnNlZCwgdGhleSBhcmUgcHV0IGhlcmUuICBgZWxzZUNvbnRlbnRgIHdpbGwgb25seSBiZSBwcmVzZW50IGlmXG4vLyAgIGFuIGB7e2Vsc2V9fWAgd2FzIGZvdW5kLlxuXG52YXIgVEVNUExBVEVfVEFHX1BPU0lUSU9OID0gSFRNTFRvb2xzLlRFTVBMQVRFX1RBR19QT1NJVElPTjtcblxuZXhwb3J0IGZ1bmN0aW9uIFRlbXBsYXRlVGFnICguLi5hcmdzKSB7XG4gIEhUTUxUb29scy5UZW1wbGF0ZVRhZy5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuVGVtcGxhdGVUYWcucHJvdG90eXBlID0gbmV3IEhUTUxUb29scy5UZW1wbGF0ZVRhZztcblRlbXBsYXRlVGFnLnByb3RvdHlwZS5jb25zdHJ1Y3Rvck5hbWUgPSAnU3BhY2ViYXJzQ29tcGlsZXIuVGVtcGxhdGVUYWcnO1xuXG52YXIgbWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXggPSBmdW5jdGlvbiAocikge1xuICByZXR1cm4gbmV3IFJlZ0V4cChyLnNvdXJjZSArIC8oPyFbez4hIy9dKS8uc291cmNlLFxuICAgICAgICAgICAgICAgICAgICByLmlnbm9yZUNhc2UgPyAnaScgOiAnJyk7XG59O1xuXG4vLyBcInN0YXJ0c1wiIHJlZ2V4ZXMgYXJlIHVzZWQgdG8gc2VlIHdoYXQgdHlwZSBvZiB0ZW1wbGF0ZVxuLy8gdGFnIHRoZSBwYXJzZXIgaXMgbG9va2luZyBhdC4gIFRoZXkgbXVzdCBtYXRjaCBhIG5vbi1lbXB0eVxuLy8gcmVzdWx0LCBidXQgbm90IHRoZSBpbnRlcmVzdGluZyBwYXJ0IG9mIHRoZSB0YWcuXG52YXIgc3RhcnRzID0ge1xuICBFU0NBUEU6IC9eXFx7XFx7KD89XFx7KlxcfCkvLFxuICBFTFNFOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xccyplbHNlKFxccysoPyFcXHMpfCg/PVt9XSkpL2kpLFxuICBET1VCTEU6IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFxzKig/IVxccykvKSxcbiAgVFJJUExFOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xce1xccyooPyFcXHMpLyksXG4gIEJMT0NLQ09NTUVOVDogbWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXgoL15cXHtcXHtcXHMqIS0tLyksXG4gIENPTU1FTlQ6IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFxzKiEvKSxcbiAgSU5DTFVTSU9OOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xccyo+XFxzKig/IVxccykvKSxcbiAgQkxPQ0tPUEVOOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xccyojXFxzKig/IVxccykvKSxcbiAgQkxPQ0tDTE9TRTogbWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXgoL15cXHtcXHtcXHMqXFwvXFxzKig/IVxccykvKVxufTtcblxudmFyIGVuZHMgPSB7XG4gIERPVUJMRTogL15cXHMqXFx9XFx9LyxcbiAgVFJJUExFOiAvXlxccypcXH1cXH1cXH0vLFxuICBFWFBSOiAvXlxccypcXCkvXG59O1xuXG52YXIgZW5kc1N0cmluZyA9IHtcbiAgRE9VQkxFOiAnfX0nLFxuICBUUklQTEU6ICd9fX0nLFxuICBFWFBSOiAnKSdcbn07XG5cbi8vIFBhcnNlIGEgdGFnIGZyb20gdGhlIHByb3ZpZGVkIHNjYW5uZXIgb3Igc3RyaW5nLiAgSWYgdGhlIGlucHV0XG4vLyBkb2Vzbid0IHN0YXJ0IHdpdGggYHt7YCwgcmV0dXJucyBudWxsLiAgT3RoZXJ3aXNlLCBlaXRoZXIgc3VjY2VlZHNcbi8vIGFuZCByZXR1cm5zIGEgU3BhY2ViYXJzQ29tcGlsZXIuVGVtcGxhdGVUYWcsIG9yIHRocm93cyBhbiBlcnJvciAodXNpbmdcbi8vIGBzY2FubmVyLmZhdGFsYCBpZiBhIHNjYW5uZXIgaXMgcHJvdmlkZWQpLlxuVGVtcGxhdGVUYWcucGFyc2UgPSBmdW5jdGlvbiAoc2Nhbm5lck9yU3RyaW5nKSB7XG4gIHZhciBzY2FubmVyID0gc2Nhbm5lck9yU3RyaW5nO1xuICBpZiAodHlwZW9mIHNjYW5uZXIgPT09ICdzdHJpbmcnKVxuICAgIHNjYW5uZXIgPSBuZXcgSFRNTFRvb2xzLlNjYW5uZXIoc2Nhbm5lck9yU3RyaW5nKTtcblxuICBpZiAoISAoc2Nhbm5lci5wZWVrKCkgPT09ICd7JyAmJlxuICAgICAgICAgKHNjYW5uZXIucmVzdCgpKS5zbGljZSgwLCAyKSA9PT0gJ3t7JykpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdmFyIHJ1biA9IGZ1bmN0aW9uIChyZWdleCkge1xuICAgIC8vIHJlZ2V4IGlzIGFzc3VtZWQgdG8gc3RhcnQgd2l0aCBgXmBcbiAgICB2YXIgcmVzdWx0ID0gcmVnZXguZXhlYyhzY2FubmVyLnJlc3QoKSk7XG4gICAgaWYgKCEgcmVzdWx0KVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgdmFyIHJldCA9IHJlc3VsdFswXTtcbiAgICBzY2FubmVyLnBvcyArPSByZXQubGVuZ3RoO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgdmFyIGFkdmFuY2UgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgc2Nhbm5lci5wb3MgKz0gYW1vdW50O1xuICB9O1xuXG4gIHZhciBzY2FuSWRlbnRpZmllciA9IGZ1bmN0aW9uIChpc0ZpcnN0SW5QYXRoKSB7XG4gICAgdmFyIGlkID0gQmxhemVUb29scy5wYXJzZUV4dGVuZGVkSWRlbnRpZmllck5hbWUoc2Nhbm5lcik7XG4gICAgaWYgKCEgaWQpIHtcbiAgICAgIGV4cGVjdGVkKCdJREVOVElGSUVSJyk7XG4gICAgfVxuICAgIGlmIChpc0ZpcnN0SW5QYXRoICYmXG4gICAgICAgIChpZCA9PT0gJ251bGwnIHx8IGlkID09PSAndHJ1ZScgfHwgaWQgPT09ICdmYWxzZScpKVxuICAgICAgc2Nhbm5lci5mYXRhbChcIkNhbid0IHVzZSBudWxsLCB0cnVlLCBvciBmYWxzZSwgYXMgYW4gaWRlbnRpZmllciBhdCBzdGFydCBvZiBwYXRoXCIpO1xuXG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIHZhciBzY2FuUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VnbWVudHMgPSBbXTtcblxuICAgIC8vIGhhbmRsZSBpbml0aWFsIGAuYCwgYC4uYCwgYC4vYCwgYC4uL2AsIGAuLi8uLmAsIGAuLi8uLi9gLCBldGNcbiAgICB2YXIgZG90cztcbiAgICBpZiAoKGRvdHMgPSBydW4oL15bXFwuXFwvXSsvKSkpIHtcbiAgICAgIHZhciBhbmNlc3RvclN0ciA9ICcuJzsgLy8gZWcgYC4uLy4uLy4uYCBtYXBzIHRvIGAuLi4uYFxuICAgICAgdmFyIGVuZHNXaXRoU2xhc2ggPSAvXFwvJC8udGVzdChkb3RzKTtcblxuICAgICAgaWYgKGVuZHNXaXRoU2xhc2gpXG4gICAgICAgIGRvdHMgPSBkb3RzLnNsaWNlKDAsIC0xKTtcblxuICAgICAgZG90cy5zcGxpdCgnLycpLmZvckVhY2goZnVuY3Rpb24oZG90Q2xhdXNlLCBpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICBpZiAoZG90Q2xhdXNlICE9PSAnLicgJiYgZG90Q2xhdXNlICE9PSAnLi4nKVxuICAgICAgICAgICAgZXhwZWN0ZWQoXCJgLmAsIGAuLmAsIGAuL2Agb3IgYC4uL2BcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGRvdENsYXVzZSAhPT0gJy4uJylcbiAgICAgICAgICAgIGV4cGVjdGVkKFwiYC4uYCBvciBgLi4vYFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb3RDbGF1c2UgPT09ICcuLicpXG4gICAgICAgICAgYW5jZXN0b3JTdHIgKz0gJy4nO1xuICAgICAgfSk7XG5cbiAgICAgIHNlZ21lbnRzLnB1c2goYW5jZXN0b3JTdHIpO1xuXG4gICAgICBpZiAoIWVuZHNXaXRoU2xhc2gpXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgLy8gc2NhbiBhIHBhdGggc2VnbWVudFxuXG4gICAgICBpZiAocnVuKC9eXFxbLykpIHtcbiAgICAgICAgdmFyIHNlZyA9IHJ1bigvXltcXHNcXFNdKj9cXF0vKTtcbiAgICAgICAgaWYgKCEgc2VnKVxuICAgICAgICAgIGVycm9yKFwiVW50ZXJtaW5hdGVkIHBhdGggc2VnbWVudFwiKTtcbiAgICAgICAgc2VnID0gc2VnLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgaWYgKCEgc2VnICYmICEgc2VnbWVudHMubGVuZ3RoKVxuICAgICAgICAgIGVycm9yKFwiUGF0aCBjYW4ndCBzdGFydCB3aXRoIGVtcHR5IHN0cmluZ1wiKTtcbiAgICAgICAgc2VnbWVudHMucHVzaChzZWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlkID0gc2NhbklkZW50aWZpZXIoISBzZWdtZW50cy5sZW5ndGgpO1xuICAgICAgICBpZiAoaWQgPT09ICd0aGlzJykge1xuICAgICAgICAgIGlmICghIHNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gaW5pdGlhbCBgdGhpc2BcbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goJy4nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IoXCJDYW4gb25seSB1c2UgYHRoaXNgIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBwYXRoLlxcbkluc3RlYWQgb2YgYGZvby50aGlzYCBvciBgLi4vdGhpc2AsIGp1c3Qgd3JpdGUgYGZvb2Agb3IgYC4uYC5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZ21lbnRzLnB1c2goaWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXAgPSBydW4oL15bXFwuXFwvXS8pO1xuICAgICAgaWYgKCEgc2VwKVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudHM7XG4gIH07XG5cbiAgLy8gc2NhbiB0aGUga2V5d29yZCBwb3J0aW9uIG9mIGEga2V5d29yZCBhcmd1bWVudFxuICAvLyAodGhlIFwiZm9vXCIgcG9ydGlvbiBpbiBcImZvbz1iYXJcIikuXG4gIC8vIFJlc3VsdCBpcyBlaXRoZXIgdGhlIGtleXdvcmQgbWF0Y2hlZCwgb3IgbnVsbFxuICAvLyBpZiB3ZSdyZSBub3QgYXQgYSBrZXl3b3JkIGFyZ3VtZW50IHBvc2l0aW9uLlxuICB2YXIgc2NhbkFyZ0tleXdvcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1hdGNoID0gL14oW15cXHtcXH1cXChcXClcXD4jPVxcc1wiJ1xcW1xcXV0rKVxccyo9XFxzKi8uZXhlYyhzY2FubmVyLnJlc3QoKSk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBzY2FubmVyLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2hbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvLyBzY2FuIGFuIGFyZ3VtZW50OyBzdWNjZWVkcyBvciBlcnJvcnMuXG4gIC8vIFJlc3VsdCBpcyBhbiBhcnJheSBvZiB0d28gb3IgdGhyZWUgaXRlbXM6XG4gIC8vIHR5cGUgLCB2YWx1ZSwgYW5kIChpbmRpY2F0aW5nIGEga2V5d29yZCBhcmd1bWVudClcbiAgLy8ga2V5d29yZCBuYW1lLlxuICB2YXIgc2NhbkFyZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5d29yZCA9IHNjYW5BcmdLZXl3b3JkKCk7IC8vIG51bGwgaWYgbm90IHBhcnNpbmcgYSBrd2FyZ1xuICAgIHZhciB2YWx1ZSA9IHNjYW5BcmdWYWx1ZSgpO1xuICAgIHJldHVybiBrZXl3b3JkID8gdmFsdWUuY29uY2F0KGtleXdvcmQpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gc2NhbiBhbiBhcmd1bWVudCB2YWx1ZSAoZm9yIGtleXdvcmQgb3IgcG9zaXRpb25hbCBhcmd1bWVudHMpO1xuICAvLyBzdWNjZWVkcyBvciBlcnJvcnMuICBSZXN1bHQgaXMgYW4gYXJyYXkgb2YgdHlwZSwgdmFsdWUuXG4gIHZhciBzY2FuQXJnVmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJ0UG9zID0gc2Nhbm5lci5wb3M7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoKHJlc3VsdCA9IEJsYXplVG9vbHMucGFyc2VOdW1iZXIoc2Nhbm5lcikpKSB7XG4gICAgICByZXR1cm4gWydOVU1CRVInLCByZXN1bHQudmFsdWVdO1xuICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IEJsYXplVG9vbHMucGFyc2VTdHJpbmdMaXRlcmFsKHNjYW5uZXIpKSkge1xuICAgICAgcmV0dXJuIFsnU1RSSU5HJywgcmVzdWx0LnZhbHVlXTtcbiAgICB9IGVsc2UgaWYgKC9eW1xcLlxcW10vLnRlc3Qoc2Nhbm5lci5wZWVrKCkpKSB7XG4gICAgICByZXR1cm4gWydQQVRIJywgc2NhblBhdGgoKV07XG4gICAgfSBlbHNlIGlmIChydW4oL15cXCgvKSkge1xuICAgICAgcmV0dXJuIFsnRVhQUicsIHNjYW5FeHByKCdFWFBSJyldO1xuICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IEJsYXplVG9vbHMucGFyc2VFeHRlbmRlZElkZW50aWZpZXJOYW1lKHNjYW5uZXIpKSkge1xuICAgICAgdmFyIGlkID0gcmVzdWx0O1xuICAgICAgaWYgKGlkID09PSAnbnVsbCcpIHtcbiAgICAgICAgcmV0dXJuIFsnTlVMTCcsIG51bGxdO1xuICAgICAgfSBlbHNlIGlmIChpZCA9PT0gJ3RydWUnIHx8IGlkID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBbJ0JPT0xFQU4nLCBpZCA9PT0gJ3RydWUnXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYW5uZXIucG9zID0gc3RhcnRQb3M7IC8vIHVuY29uc3VtZSBgaWRgXG4gICAgICAgIHJldHVybiBbJ1BBVEgnLCBzY2FuUGF0aCgpXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhwZWN0ZWQoJ2lkZW50aWZpZXIsIG51bWJlciwgc3RyaW5nLCBib29sZWFuLCBudWxsLCBvciBhIHN1YiBleHByZXNzaW9uIGVuY2xvc2VkIGluIFwiKFwiLCBcIilcIicpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2NhbkV4cHIgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgIHZhciBlbmRUeXBlID0gdHlwZTtcbiAgICBpZiAodHlwZSA9PT0gJ0lOQ0xVU0lPTicgfHwgdHlwZSA9PT0gJ0JMT0NLT1BFTicgfHwgdHlwZSA9PT0gJ0VMU0UnKVxuICAgICAgZW5kVHlwZSA9ICdET1VCTEUnO1xuXG4gICAgdmFyIHRhZyA9IG5ldyBUZW1wbGF0ZVRhZztcbiAgICB0YWcudHlwZSA9IHR5cGU7XG4gICAgdGFnLnBhdGggPSBzY2FuUGF0aCgpO1xuICAgIHRhZy5hcmdzID0gW107XG4gICAgdmFyIGZvdW5kS3dBcmcgPSBmYWxzZTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgcnVuKC9eXFxzKi8pO1xuICAgICAgaWYgKHJ1bihlbmRzW2VuZFR5cGVdKSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBlbHNlIGlmICgvXlt9KV0vLnRlc3Qoc2Nhbm5lci5wZWVrKCkpKSB7XG4gICAgICAgIGV4cGVjdGVkKCdgJyArIGVuZHNTdHJpbmdbZW5kVHlwZV0gKyAnYCcpO1xuICAgICAgfVxuICAgICAgdmFyIG5ld0FyZyA9IHNjYW5BcmcoKTtcbiAgICAgIGlmIChuZXdBcmcubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIGZvdW5kS3dBcmcgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kS3dBcmcpXG4gICAgICAgICAgZXJyb3IoXCJDYW4ndCBoYXZlIGEgbm9uLWtleXdvcmQgYXJndW1lbnQgYWZ0ZXIgYSBrZXl3b3JkIGFyZ3VtZW50XCIpO1xuICAgICAgfVxuICAgICAgdGFnLmFyZ3MucHVzaChuZXdBcmcpO1xuXG4gICAgICAvLyBleHBlY3QgYSB3aGl0ZXNwYWNlIG9yIGEgY2xvc2luZyAnKScgb3IgJ30nXG4gICAgICBpZiAocnVuKC9eKD89W1xcc30pXSkvKSAhPT0gJycpXG4gICAgICAgIGV4cGVjdGVkKCdzcGFjZScpO1xuICAgIH1cblxuICAgIHJldHVybiB0YWc7XG4gIH07XG5cbiAgdmFyIHR5cGU7XG5cbiAgdmFyIGVycm9yID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHNjYW5uZXIuZmF0YWwobXNnKTtcbiAgfTtcblxuICB2YXIgZXhwZWN0ZWQgPSBmdW5jdGlvbiAod2hhdCkge1xuICAgIGVycm9yKCdFeHBlY3RlZCAnICsgd2hhdCk7XG4gIH07XG5cbiAgLy8gbXVzdCBkbyBFU0NBUEUgZmlyc3QsIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IEVMU0VcbiAgLy8gb3JkZXIgb2Ygb3RoZXJzIGRvZXNuJ3QgbWF0dGVyXG4gIGlmIChydW4oc3RhcnRzLkVTQ0FQRSkpIHR5cGUgPSAnRVNDQVBFJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5FTFNFKSkgdHlwZSA9ICdFTFNFJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5ET1VCTEUpKSB0eXBlID0gJ0RPVUJMRSc7XG4gIGVsc2UgaWYgKHJ1bihzdGFydHMuVFJJUExFKSkgdHlwZSA9ICdUUklQTEUnO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLkJMT0NLQ09NTUVOVCkpIHR5cGUgPSAnQkxPQ0tDT01NRU5UJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5DT01NRU5UKSkgdHlwZSA9ICdDT01NRU5UJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5JTkNMVVNJT04pKSB0eXBlID0gJ0lOQ0xVU0lPTic7XG4gIGVsc2UgaWYgKHJ1bihzdGFydHMuQkxPQ0tPUEVOKSkgdHlwZSA9ICdCTE9DS09QRU4nO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLkJMT0NLQ0xPU0UpKSB0eXBlID0gJ0JMT0NLQ0xPU0UnO1xuICBlbHNlXG4gICAgZXJyb3IoJ1Vua25vd24gc3RhY2hlIHRhZycpO1xuXG4gIHZhciB0YWcgPSBuZXcgVGVtcGxhdGVUYWc7XG4gIHRhZy50eXBlID0gdHlwZTtcblxuICBpZiAodHlwZSA9PT0gJ0JMT0NLQ09NTUVOVCcpIHtcbiAgICB2YXIgcmVzdWx0ID0gcnVuKC9eW1xcc1xcU10qPy0tXFxzKj9cXH1cXH0vKTtcbiAgICBpZiAoISByZXN1bHQpXG4gICAgICBlcnJvcihcIlVuY2xvc2VkIGJsb2NrIGNvbW1lbnRcIik7XG4gICAgdGFnLnZhbHVlID0gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLS0nKSk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0NPTU1FTlQnKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJ1bigvXltcXHNcXFNdKj9cXH1cXH0vKTtcbiAgICBpZiAoISByZXN1bHQpXG4gICAgICBlcnJvcihcIlVuY2xvc2VkIGNvbW1lbnRcIik7XG4gICAgdGFnLnZhbHVlID0gcmVzdWx0LnNsaWNlKDAsIC0yKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnQkxPQ0tDTE9TRScpIHtcbiAgICB0YWcucGF0aCA9IHNjYW5QYXRoKCk7XG4gICAgaWYgKCEgcnVuKGVuZHMuRE9VQkxFKSlcbiAgICAgIGV4cGVjdGVkKCdgfX1gJyk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VMU0UnKSB7XG4gICAgaWYgKCEgcnVuKGVuZHMuRE9VQkxFKSkge1xuICAgICAgdGFnID0gc2NhbkV4cHIodHlwZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdFU0NBUEUnKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJ1bigvXlxceypcXHwvKTtcbiAgICB0YWcudmFsdWUgPSAne3snICsgcmVzdWx0LnNsaWNlKDAsIC0xKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBET1VCTEUsIFRSSVBMRSwgQkxPQ0tPUEVOLCBJTkNMVVNJT05cbiAgICB0YWcgPSBzY2FuRXhwcih0eXBlKTtcbiAgfVxuXG4gIHJldHVybiB0YWc7XG59O1xuXG4vLyBSZXR1cm5zIGEgU3BhY2ViYXJzQ29tcGlsZXIuVGVtcGxhdGVUYWcgcGFyc2VkIGZyb20gYHNjYW5uZXJgLCBsZWF2aW5nIHNjYW5uZXJcbi8vIGF0IGl0cyBvcmlnaW5hbCBwb3NpdGlvbi5cbi8vXG4vLyBBbiBlcnJvciB3aWxsIHN0aWxsIGJlIHRocm93biBpZiB0aGVyZSBpcyBub3QgYSB2YWxpZCB0ZW1wbGF0ZSB0YWcgYXRcbi8vIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuVGVtcGxhdGVUYWcucGVlayA9IGZ1bmN0aW9uIChzY2FubmVyKSB7XG4gIHZhciBzdGFydFBvcyA9IHNjYW5uZXIucG9zO1xuICB2YXIgcmVzdWx0ID0gVGVtcGxhdGVUYWcucGFyc2Uoc2Nhbm5lcik7XG4gIHNjYW5uZXIucG9zID0gc3RhcnRQb3M7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyBMaWtlIGBUZW1wbGF0ZVRhZy5wYXJzZWAsIGJ1dCBpbiB0aGUgY2FzZSBvZiBibG9ja3MsIHBhcnNlIHRoZSBjb21wbGV0ZVxuLy8gYHt7I2Zvb319Li4ue3svZm9vfX1gIHdpdGggYGNvbnRlbnRgIGFuZCBwb3NzaWJsZSBgZWxzZUNvbnRlbnRgLCByYXRoZXJcbi8vIHRoYW4ganVzdCB0aGUgQkxPQ0tPUEVOIHRhZy5cbi8vXG4vLyBJbiBhZGRpdGlvbjpcbi8vXG4vLyAtIFRocm93cyBhbiBlcnJvciBpZiBge3tlbHNlfX1gIG9yIGB7ey9mb299fWAgdGFnIGlzIGVuY291bnRlcmVkLlxuLy9cbi8vIC0gUmV0dXJucyBgbnVsbGAgZm9yIGEgQ09NTUVOVC4gIChUaGlzIGNhc2UgaXMgZGlzdGluZ3Vpc2hhYmxlIGZyb21cbi8vICAgcGFyc2luZyBubyB0YWcgYnkgdGhlIGZhY3QgdGhhdCB0aGUgc2Nhbm5lciBpcyBhZHZhbmNlZC4pXG4vL1xuLy8gLSBUYWtlcyBhbiBIVE1MVG9vbHMuVEVNUExBVEVfVEFHX1BPU0lUSU9OIGBwb3NpdGlvbmAgYW5kIHNldHMgaXQgYXMgdGhlXG4vLyAgIFRlbXBsYXRlVGFnJ3MgYC5wb3NpdGlvbmAgcHJvcGVydHkuXG4vL1xuLy8gLSBWYWxpZGF0ZXMgdGhlIHRhZydzIHdlbGwtZm9ybWVkbmVzcyBhbmQgbGVnYWxpdHkgYXQgaW4gaXRzIHBvc2l0aW9uLlxuVGVtcGxhdGVUYWcucGFyc2VDb21wbGV0ZVRhZyA9IGZ1bmN0aW9uIChzY2FubmVyT3JTdHJpbmcsIHBvc2l0aW9uKSB7XG4gIHZhciBzY2FubmVyID0gc2Nhbm5lck9yU3RyaW5nO1xuICBpZiAodHlwZW9mIHNjYW5uZXIgPT09ICdzdHJpbmcnKVxuICAgIHNjYW5uZXIgPSBuZXcgSFRNTFRvb2xzLlNjYW5uZXIoc2Nhbm5lck9yU3RyaW5nKTtcblxuICB2YXIgc3RhcnRQb3MgPSBzY2FubmVyLnBvczsgLy8gZm9yIGVycm9yIG1lc3NhZ2VzXG4gIHZhciByZXN1bHQgPSBUZW1wbGF0ZVRhZy5wYXJzZShzY2FubmVyT3JTdHJpbmcpO1xuICBpZiAoISByZXN1bHQpXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuICBpZiAocmVzdWx0LnR5cGUgPT09ICdCTE9DS0NPTU1FTlQnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ0NPTU1FTlQnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ0VMU0UnKVxuICAgIHNjYW5uZXIuZmF0YWwoXCJVbmV4cGVjdGVkIHt7ZWxzZX19XCIpO1xuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ0JMT0NLQ0xPU0UnKVxuICAgIHNjYW5uZXIuZmF0YWwoXCJVbmV4cGVjdGVkIGNsb3NpbmcgdGVtcGxhdGUgdGFnXCIpO1xuXG4gIHBvc2l0aW9uID0gKHBvc2l0aW9uIHx8IFRFTVBMQVRFX1RBR19QT1NJVElPTi5FTEVNRU5UKTtcbiAgaWYgKHBvc2l0aW9uICE9PSBURU1QTEFURV9UQUdfUE9TSVRJT04uRUxFTUVOVClcbiAgICByZXN1bHQucG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICBpZiAocmVzdWx0LnR5cGUgPT09ICdCTE9DS09QRU4nKSB7XG4gICAgLy8gcGFyc2UgYmxvY2sgY29udGVudHNcblxuICAgIC8vIENvbnN0cnVjdCBhIHN0cmluZyB2ZXJzaW9uIG9mIGAucGF0aGAgZm9yIGNvbXBhcmluZyBzdGFydCBhbmRcbiAgICAvLyBlbmQgdGFncy4gIEZvciBleGFtcGxlLCBgZm9vL1swXWAgd2FzIHBhcnNlZCBpbnRvIGBbXCJmb29cIiwgXCIwXCJdYFxuICAgIC8vIGFuZCBub3cgYmVjb21lcyBgZm9vLDBgLiAgVGhpcyBmb3JtIG1heSBhbHNvIHNob3cgdXAgaW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlcy5cbiAgICB2YXIgYmxvY2tOYW1lID0gcmVzdWx0LnBhdGguam9pbignLCcpO1xuXG4gICAgdmFyIHRleHRNb2RlID0gbnVsbDtcbiAgICAgIGlmIChibG9ja05hbWUgPT09ICdtYXJrZG93bicgfHxcbiAgICAgICAgICBwb3NpdGlvbiA9PT0gVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX1JBV1RFWFQpIHtcbiAgICAgICAgdGV4dE1vZGUgPSBIVE1MLlRFWFRNT0RFLlNUUklORztcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IFRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9SQ0RBVEEgfHxcbiAgICAgICAgICAgICAgICAgcG9zaXRpb24gPT09IFRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9BVFRSSUJVVEUpIHtcbiAgICAgICAgdGV4dE1vZGUgPSBIVE1MLlRFWFRNT0RFLlJDREFUQTtcbiAgICAgIH1cbiAgICAgIHZhciBwYXJzZXJPcHRpb25zID0ge1xuICAgICAgICBnZXRUZW1wbGF0ZVRhZzogVGVtcGxhdGVUYWcucGFyc2VDb21wbGV0ZVRhZyxcbiAgICAgICAgc2hvdWxkU3RvcDogaXNBdEJsb2NrQ2xvc2VPckVsc2UsXG4gICAgICAgIHRleHRNb2RlOiB0ZXh0TW9kZVxuICAgICAgfTtcbiAgICByZXN1bHQudGV4dE1vZGUgPSB0ZXh0TW9kZTtcbiAgICByZXN1bHQuY29udGVudCA9IEhUTUxUb29scy5wYXJzZUZyYWdtZW50KHNjYW5uZXIsIHBhcnNlck9wdGlvbnMpO1xuXG4gICAgaWYgKHNjYW5uZXIucmVzdCgpLnNsaWNlKDAsIDIpICE9PSAne3snKVxuICAgICAgc2Nhbm5lci5mYXRhbChcIkV4cGVjdGVkIHt7ZWxzZX19IG9yIGJsb2NrIGNsb3NlIGZvciBcIiArIGJsb2NrTmFtZSk7XG5cbiAgICB2YXIgbGFzdFBvcyA9IHNjYW5uZXIucG9zOyAvLyBzYXZlIGZvciBlcnJvciBtZXNzYWdlc1xuICAgIHZhciB0bXBsVGFnID0gVGVtcGxhdGVUYWcucGFyc2Uoc2Nhbm5lcik7IC8vIHt7ZWxzZX19IG9yIHt7L2Zvb319XG5cbiAgICB2YXIgbGFzdEVsc2VDb250ZW50VGFnID0gcmVzdWx0O1xuICAgIHdoaWxlICh0bXBsVGFnLnR5cGUgPT09ICdFTFNFJykge1xuICAgICAgaWYgKGxhc3RFbHNlQ29udGVudFRhZyA9PT0gbnVsbCkge1xuICAgICAgICBzY2FubmVyLmZhdGFsKFwiVW5leHBlY3RlZCBlbHNlIGFmdGVyIHt7ZWxzZX19XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodG1wbFRhZy5wYXRoKSB7XG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZy5lbHNlQ29udGVudCA9IG5ldyBUZW1wbGF0ZVRhZztcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50LnR5cGUgPSAnQkxPQ0tPUEVOJztcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50LnBhdGggPSB0bXBsVGFnLnBhdGg7XG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZy5lbHNlQ29udGVudC5hcmdzID0gdG1wbFRhZy5hcmdzO1xuICAgICAgICBsYXN0RWxzZUNvbnRlbnRUYWcuZWxzZUNvbnRlbnQudGV4dE1vZGUgPSB0ZXh0TW9kZTtcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50LmNvbnRlbnQgPSBIVE1MVG9vbHMucGFyc2VGcmFnbWVudChzY2FubmVyLCBwYXJzZXJPcHRpb25zKTtcblxuICAgICAgICBsYXN0RWxzZUNvbnRlbnRUYWcgPSBsYXN0RWxzZUNvbnRlbnRUYWcuZWxzZUNvbnRlbnQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gcGFyc2Uge3tlbHNlfX0gYW5kIGNvbnRlbnQgdXAgdG8gY2xvc2UgdGFnXG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZy5lbHNlQ29udGVudCA9IEhUTUxUb29scy5wYXJzZUZyYWdtZW50KHNjYW5uZXIsIHBhcnNlck9wdGlvbnMpO1xuXG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY2FubmVyLnJlc3QoKS5zbGljZSgwLCAyKSAhPT0gJ3t7JylcbiAgICAgICAgc2Nhbm5lci5mYXRhbChcIkV4cGVjdGVkIGJsb2NrIGNsb3NlIGZvciBcIiArIGJsb2NrTmFtZSk7XG5cbiAgICAgIGxhc3RQb3MgPSBzY2FubmVyLnBvcztcbiAgICAgIHRtcGxUYWcgPSBUZW1wbGF0ZVRhZy5wYXJzZShzY2FubmVyKTtcbiAgICB9XG5cbiAgICBpZiAodG1wbFRhZy50eXBlID09PSAnQkxPQ0tDTE9TRScpIHtcbiAgICAgIHZhciBibG9ja05hbWUyID0gdG1wbFRhZy5wYXRoLmpvaW4oJywnKTtcbiAgICAgIGlmIChibG9ja05hbWUgIT09IGJsb2NrTmFtZTIpIHtcbiAgICAgICAgc2Nhbm5lci5wb3MgPSBsYXN0UG9zO1xuICAgICAgICBzY2FubmVyLmZhdGFsKCdFeHBlY3RlZCB0YWcgdG8gY2xvc2UgJyArIGJsb2NrTmFtZSArICcsIGZvdW5kICcgK1xuICAgICAgICAgICAgICAgICAgICAgIGJsb2NrTmFtZTIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzY2FubmVyLnBvcyA9IGxhc3RQb3M7XG4gICAgICBzY2FubmVyLmZhdGFsKCdFeHBlY3RlZCB0YWcgdG8gY2xvc2UgJyArIGJsb2NrTmFtZSArICcsIGZvdW5kICcgK1xuICAgICAgICAgICAgICAgICAgICB0bXBsVGFnLnR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBmaW5hbFBvcyA9IHNjYW5uZXIucG9zO1xuICBzY2FubmVyLnBvcyA9IHN0YXJ0UG9zO1xuICB2YWxpZGF0ZVRhZyhyZXN1bHQsIHNjYW5uZXIpO1xuICBzY2FubmVyLnBvcyA9IGZpbmFsUG9zO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG52YXIgaXNBdEJsb2NrQ2xvc2VPckVsc2UgPSBmdW5jdGlvbiAoc2Nhbm5lcikge1xuICAvLyBEZXRlY3QgYHt7ZWxzZX19YCBvciBge3svZm9vfX1gLlxuICAvL1xuICAvLyBXZSBkbyBhcyBtdWNoIHdvcmsgb3Vyc2VsdmVzIGJlZm9yZSBkZWZlcnJpbmcgdG8gYFRlbXBsYXRlVGFnLnBlZWtgLFxuICAvLyBmb3IgZWZmaWNpZW5jeSAod2UncmUgY2FsbGVkIGZvciBldmVyeSBpbnB1dCB0b2tlbikgYW5kIHRvIGJlXG4gIC8vIGxlc3Mgb2J0cnVzaXZlLCBiZWNhdXNlIGBUZW1wbGF0ZVRhZy5wZWVrYCB3aWxsIHRocm93IGFuIGVycm9yIGlmIGl0XG4gIC8vIHNlZXMgYHt7YCBmb2xsb3dlZCBieSBhIG1hbGZvcm1lZCB0YWcuXG4gIHZhciByZXN0LCB0eXBlO1xuICByZXR1cm4gKHNjYW5uZXIucGVlaygpID09PSAneycgJiZcbiAgICAgICAgICAocmVzdCA9IHNjYW5uZXIucmVzdCgpKS5zbGljZSgwLCAyKSA9PT0gJ3t7JyAmJlxuICAgICAgICAgIC9eXFx7XFx7XFxzKihcXC98ZWxzZVxcYikvLnRlc3QocmVzdCkgJiZcbiAgICAgICAgICAodHlwZSA9IFRlbXBsYXRlVGFnLnBlZWsoc2Nhbm5lcikudHlwZSkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gJ0JMT0NLQ0xPU0UnIHx8IHR5cGUgPT09ICdFTFNFJykpO1xufTtcblxuLy8gVmFsaWRhdGUgdGhhdCBgdGVtcGxhdGVUYWdgIGlzIGNvcnJlY3RseSBmb3JtZWQgYW5kIGxlZ2FsIGZvciBpdHNcbi8vIEhUTUwgcG9zaXRpb24uICBVc2UgYHNjYW5uZXJgIHRvIHJlcG9ydCBlcnJvcnMuIE9uIHN1Y2Nlc3MsIGRvZXNcbi8vIG5vdGhpbmcuXG52YXIgdmFsaWRhdGVUYWcgPSBmdW5jdGlvbiAodHRhZywgc2Nhbm5lcikge1xuXG4gIGlmICh0dGFnLnR5cGUgPT09ICdJTkNMVVNJT04nIHx8IHR0YWcudHlwZSA9PT0gJ0JMT0NLT1BFTicpIHtcbiAgICB2YXIgYXJncyA9IHR0YWcuYXJncztcbiAgICBpZiAodHRhZy5wYXRoWzBdID09PSAnZWFjaCcgJiYgYXJnc1sxXSAmJiBhcmdzWzFdWzBdID09PSAnUEFUSCcgJiZcbiAgICAgICAgYXJnc1sxXVsxXVswXSA9PT0gJ2luJykge1xuICAgICAgLy8gRm9yIHNsaWdodGx5IGJldHRlciBlcnJvciBtZXNzYWdlcywgd2UgZGV0ZWN0IHRoZSBlYWNoLWluIGNhc2VcbiAgICAgIC8vIGhlcmUgaW4gb3JkZXIgbm90IHRvIGNvbXBsYWluIGlmIHRoZSB1c2VyIHdyaXRlcyBge3sjZWFjaCAzIGluIHh9fWBcbiAgICAgIC8vIHRoYXQgXCIzIGlzIG5vdCBhIGZ1bmN0aW9uXCJcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSAmJiBhcmdzWzBdLmxlbmd0aCA9PT0gMiAmJiBhcmdzWzBdWzBdICE9PSAnUEFUSCcpIHtcbiAgICAgICAgLy8gd2UgaGF2ZSBhIHBvc2l0aW9uYWwgYXJndW1lbnQgdGhhdCBpcyBub3QgYSBQQVRIIGZvbGxvd2VkIGJ5XG4gICAgICAgIC8vIG90aGVyIGFyZ3VtZW50c1xuICAgICAgICBzY2FubmVyLmZhdGFsKFwiRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uLCB0byBiZSBjYWxsZWQgb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50czsgZm91bmQgXCIgKyBhcmdzWzBdWzBdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgcG9zaXRpb24gPSB0dGFnLnBvc2l0aW9uIHx8IFRFTVBMQVRFX1RBR19QT1NJVElPTi5FTEVNRU5UO1xuICBpZiAocG9zaXRpb24gPT09IFRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9BVFRSSUJVVEUpIHtcbiAgICBpZiAodHRhZy50eXBlID09PSAnRE9VQkxFJyB8fCB0dGFnLnR5cGUgPT09ICdFU0NBUEUnKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICh0dGFnLnR5cGUgPT09ICdCTE9DS09QRU4nKSB7XG4gICAgICB2YXIgcGF0aCA9IHR0YWcucGF0aDtcbiAgICAgIHZhciBwYXRoMCA9IHBhdGhbMF07XG4gICAgICBpZiAoISAocGF0aC5sZW5ndGggPT09IDEgJiYgKHBhdGgwID09PSAnaWYnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgwID09PSAndW5sZXNzJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoMCA9PT0gJ3dpdGgnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgwID09PSAnZWFjaCcpKSkge1xuICAgICAgICBzY2FubmVyLmZhdGFsKFwiQ3VzdG9tIGJsb2NrIGhlbHBlcnMgYXJlIG5vdCBhbGxvd2VkIGluIGFuIEhUTUwgYXR0cmlidXRlLCBvbmx5IGJ1aWx0LWluIG9uZXMgbGlrZSAjZWFjaCBhbmQgI2lmXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzY2FubmVyLmZhdGFsKHR0YWcudHlwZSArIFwiIHRlbXBsYXRlIHRhZyBpcyBub3QgYWxsb3dlZCBpbiBhbiBIVE1MIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IFRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9TVEFSVF9UQUcpIHtcbiAgICBpZiAoISAodHRhZy50eXBlID09PSAnRE9VQkxFJykpIHtcbiAgICAgIHNjYW5uZXIuZmF0YWwoXCJSZWFjdGl2ZSBIVE1MIGF0dHJpYnV0ZXMgbXVzdCBlaXRoZXIgaGF2ZSBhIGNvbnN0YW50IG5hbWUgb3IgY29uc2lzdCBvZiBhIHNpbmdsZSB7e2hlbHBlcn19IHByb3ZpZGluZyBhIGRpY3Rpb25hcnkgb2YgbmFtZXMgYW5kIHZhbHVlcy4gIEEgdGVtcGxhdGUgdGFnIG9mIHR5cGUgXCIgKyB0dGFnLnR5cGUgKyBcIiBpcyBub3QgYWxsb3dlZCBoZXJlLlwiKTtcbiAgICB9XG4gICAgaWYgKHNjYW5uZXIucGVlaygpID09PSAnPScpIHtcbiAgICAgIHNjYW5uZXIuZmF0YWwoXCJUZW1wbGF0ZSB0YWdzIGFyZSBub3QgYWxsb3dlZCBpbiBhdHRyaWJ1dGUgbmFtZXMsIG9ubHkgaW4gYXR0cmlidXRlIHZhbHVlcyBvciBpbiB0aGUgZm9ybSBvZiBhIHNpbmdsZSB7e2hlbHBlcn19IHRoYXQgZXZhbHVhdGVzIHRvIGEgZGljdGlvbmFyeSBvZiBuYW1lPXZhbHVlIHBhaXJzLlwiKTtcbiAgICB9XG4gIH1cblxufTtcbiIsImltcG9ydCB7IEhUTUwgfSBmcm9tICdtZXRlb3IvaHRtbGpzJztcbmltcG9ydCB7IFRyZWVUcmFuc2Zvcm1lciwgdG9SYXcgfSBmcm9tICcuL29wdGltaXplcic7XG5cbmZ1bmN0aW9uIGNvbXBhY3RSYXcoYXJyYXkpe1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgSFRNTC5SYXcpIHtcbiAgICAgIGlmICghaXRlbS52YWx1ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQubGVuZ3RoICYmXG4gICAgICAgICAgKHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBIVE1MLlJhdykpe1xuICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gSFRNTC5SYXcoXG4gICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXS52YWx1ZSArIGl0ZW0udmFsdWUpO1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQucHVzaChpdGVtKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiByZXBsYWNlSWZDb250YWluc05ld2xpbmUobWF0Y2gpIHtcbiAgaWYgKG1hdGNoLmluZGV4T2YoJ1xcbicpID49IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuICByZXR1cm4gbWF0Y2g7XG59XG5cbmZ1bmN0aW9uIHN0cmlwV2hpdGVzcGFjZShhcnJheSl7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBIVE1MLlJhdykge1xuICAgICAgLy8gcmVtb3ZlIG5vZGVzIHRoYXQgY29udGFpbiBvbmx5IHdoaXRlc3BhY2UgJiBhIG5ld2xpbmVcbiAgICAgIGlmIChpdGVtLnZhbHVlLmluZGV4T2YoJ1xcbicpICE9PSAtMSAmJiAhL1xcUy8udGVzdChpdGVtLnZhbHVlKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIFRyaW0gYW55IHByZWNlZGluZyB3aGl0ZXNwYWNlLCBpZiBpdCBjb250YWlucyBhIG5ld2xpbmVcbiAgICAgIHZhciBuZXdTdHIgPSBpdGVtLnZhbHVlO1xuICAgICAgbmV3U3RyID0gbmV3U3RyLnJlcGxhY2UoL15cXHMrLywgcmVwbGFjZUlmQ29udGFpbnNOZXdsaW5lKTtcbiAgICAgIG5ld1N0ciA9IG5ld1N0ci5yZXBsYWNlKC9cXHMrJC8sIHJlcGxhY2VJZkNvbnRhaW5zTmV3bGluZSk7XG4gICAgICBpdGVtLnZhbHVlID0gbmV3U3RyO1xuICAgIH1cbiAgICByZXN1bHQucHVzaChpdGVtKVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBXaGl0ZXNwYWNlUmVtb3ZpbmdWaXNpdG9yID0gVHJlZVRyYW5zZm9ybWVyLmV4dGVuZCgpO1xuV2hpdGVzcGFjZVJlbW92aW5nVmlzaXRvci5kZWYoe1xuICB2aXNpdE51bGw6IHRvUmF3LFxuICB2aXNpdFByaW1pdGl2ZTogdG9SYXcsXG4gIHZpc2l0Q2hhclJlZjogdG9SYXcsXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyB0aGlzLnN1cGVyKGFycmF5KVxuICAgIHZhciByZXN1bHQgPSBUcmVlVHJhbnNmb3JtZXIucHJvdG90eXBlLnZpc2l0QXJyYXkuY2FsbCh0aGlzLCBhcnJheSk7XG4gICAgcmVzdWx0ID0gY29tcGFjdFJhdyhyZXN1bHQpO1xuICAgIHJlc3VsdCA9IHN0cmlwV2hpdGVzcGFjZShyZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdmFyIHRhZ05hbWUgPSB0YWcudGFnTmFtZTtcbiAgICAvLyBUT0RPIC0gTGlzdCB0YWdzIHRoYXQgd2UgZG9uJ3Qgd2FudCB0byBzdHJpcCB3aGl0ZXNwYWNlIGZvci5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ3RleHRhcmVhJyB8fCB0YWdOYW1lID09PSAnc2NyaXB0JyB8fCB0YWdOYW1lID09PSAncHJlJ1xuICAgICAgfHwgIUhUTUwuaXNLbm93bkVsZW1lbnQodGFnTmFtZSkgfHwgSFRNTC5pc0tub3duU1ZHRWxlbWVudCh0YWdOYW1lKSkge1xuICAgICAgcmV0dXJuIHRhZztcbiAgICB9XG4gICAgcmV0dXJuIFRyZWVUcmFuc2Zvcm1lci5wcm90b3R5cGUudmlzaXRUYWcuY2FsbCh0aGlzLCB0YWcpXG4gIH0sXG4gIHZpc2l0QXR0cmlidXRlczogZnVuY3Rpb24gKGF0dHJzKSB7XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG59KTtcblxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlV2hpdGVzcGFjZSh0cmVlKSB7XG4gIHRyZWUgPSAobmV3IFdoaXRlc3BhY2VSZW1vdmluZ1Zpc2l0b3IpLnZpc2l0KHRyZWUpO1xuICByZXR1cm4gdHJlZTtcbn1cbiJdfQ==
