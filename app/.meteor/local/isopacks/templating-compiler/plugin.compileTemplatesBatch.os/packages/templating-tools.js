Package["core-runtime"].queue("templating-tools",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var SpacebarsCompiler = Package['spacebars-compiler'].SpacebarsCompiler;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var TemplatingTools;

var require = meteorInstall({"node_modules":{"meteor":{"templating-tools":{"templating-tools.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/templating-tools/templating-tools.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({TemplatingTools:()=>TemplatingTools},true);let scanHtmlForTags;module.link('./html-scanner',{scanHtmlForTags(v){scanHtmlForTags=v}},0);let compileTagsWithSpacebars;module.link('./compile-tags-with-spacebars',{compileTagsWithSpacebars(v){compileTagsWithSpacebars=v}},1);let generateTemplateJS,generateBodyJS;module.link('./code-generation',{generateTemplateJS(v){generateTemplateJS=v},generateBodyJS(v){generateBodyJS=v}},2);let CompileError,throwCompileError;module.link('./throw-compile-error',{CompileError(v){CompileError=v},throwCompileError(v){throwCompileError=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();



const TemplatingTools = {
    scanHtmlForTags,
    compileTagsWithSpacebars,
    generateTemplateJS,
    generateBodyJS,
    CompileError,
    throwCompileError
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"code-generation.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/templating-tools/code-generation.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({generateTemplateJS:()=>generateTemplateJS,generateBodyJS:()=>generateBodyJS});function generateTemplateJS(name, renderFuncCode, useHMR) {
    const nameLiteral = JSON.stringify(name);
    const templateDotNameLiteral = JSON.stringify(`Template.${name}`);
    if (useHMR) {
        // module.hot.data is used to make sure Template.__checkName can still
        // detect duplicates
        return `
Template._migrateTemplate(
  ${nameLiteral},
  new Template(${templateDotNameLiteral}, ${renderFuncCode})
);
if (typeof module === "object" && module.hot) {
  module.hot.accept();
  module.hot.dispose(function () {
    Template.__pendingReplacement.push(${nameLiteral});
    Template._applyHmrChanges(${nameLiteral});
  });
}
`;
    }
    return `
Template.__checkName(${nameLiteral});
Template[${nameLiteral}] = new Template(${templateDotNameLiteral}, ${renderFuncCode});
`;
}
function generateBodyJS(renderFuncCode, useHMR) {
    if (useHMR) {
        return `
(function () {
  var renderFunc = ${renderFuncCode};
  Template.body.addContent(renderFunc);
  Meteor.startup(Template.body.renderToDocument);
  if (typeof module === "object" && module.hot) {
    module.hot.accept();
    module.hot.dispose(function () {
      var index = Template.body.contentRenderFuncs.indexOf(renderFunc)
      Template.body.contentRenderFuncs.splice(index, 1);
      Template._applyHmrChanges();
    });
  }
})();
`;
    }
    return `
Template.body.addContent(${renderFuncCode});
Meteor.startup(Template.body.renderToDocument);
`;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"compile-tags-with-spacebars.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/templating-tools/compile-tags-with-spacebars.js                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({compileTagsWithSpacebars:()=>compileTagsWithSpacebars});let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},0);let SpacebarsCompiler;module.link('meteor/spacebars-compiler',{SpacebarsCompiler(v){SpacebarsCompiler=v}},1);let generateBodyJS,generateTemplateJS;module.link('./code-generation',{generateBodyJS(v){generateBodyJS=v},generateTemplateJS(v){generateTemplateJS=v}},2);let throwCompileError;module.link('./throw-compile-error',{throwCompileError(v){throwCompileError=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _object_without_properties(source, excluded) {
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




function compileTagsWithSpacebars(tags, hmrAvailable) {
    var handler = new SpacebarsTagCompiler();
    tags.forEach((tag)=>{
        handler.addTagToResults(tag, hmrAvailable);
    });
    return handler.getResults();
}
class SpacebarsTagCompiler {
    getResults() {
        return this.results;
    }
    addTagToResults(tag, hmrAvailable) {
        this.tag = tag;
        // do we have 1 or more attributes?
        const hasAttribs = !isEmpty(this.tag.attribs);
        if (this.tag.tagName === "head") {
            if (hasAttribs) {
                this.throwCompileError("Attributes on <head> not supported");
            }
            this.results.head += this.tag.contents;
            return;
        }
        // <body> or <template>
        try {
            if (this.tag.tagName === "template") {
                const name = this.tag.attribs.name;
                if (!name) {
                    this.throwCompileError("Template has no 'name' attribute");
                }
                if (SpacebarsCompiler.isReservedName(name)) {
                    this.throwCompileError(`Template can't be named "${name}"`);
                }
                const whitespace = this.tag.attribs.whitespace || '';
                const renderFuncCode = SpacebarsCompiler.compile(this.tag.contents, {
                    whitespace,
                    isTemplate: true,
                    sourceName: `Template "${name}"`
                });
                this.results.js += generateTemplateJS(name, renderFuncCode, hmrAvailable);
            } else if (this.tag.tagName === "body") {
                const _this_tag_attribs = this.tag.attribs, { whitespace = '' } = _this_tag_attribs, attribs = _object_without_properties(_this_tag_attribs, [
                    "whitespace"
                ]);
                this.addBodyAttrs(attribs);
                const renderFuncCode = SpacebarsCompiler.compile(this.tag.contents, {
                    whitespace,
                    isBody: true,
                    sourceName: "<body>"
                });
                // We may be one of many `<body>` tags.
                this.results.js += generateBodyJS(renderFuncCode, hmrAvailable);
            } else {
                this.throwCompileError("Expected <template>, <head>, or <body> tag in template file", tagStartIndex);
            }
        } catch (e) {
            if (e.scanner) {
                // The error came from Spacebars
                this.throwCompileError(e.message, this.tag.contentsStartIndex + e.offset);
            } else {
                throw e;
            }
        }
    }
    addBodyAttrs(attrs) {
        Object.keys(attrs).forEach((attr)=>{
            const val = attrs[attr];
            // This check is for conflicting body attributes in the same file;
            // we check across multiple files in caching-html-compiler using the
            // attributes on results.bodyAttrs
            if (this.results.bodyAttrs.hasOwnProperty(attr) && this.results.bodyAttrs[attr] !== val) {
                this.throwCompileError(`<body> declarations have conflicting values for the '${attr}' attribute.`);
            }
            this.results.bodyAttrs[attr] = val;
        });
    }
    throwCompileError(message, overrideIndex) {
        throwCompileError(this.tag, message, overrideIndex);
    }
    constructor(){
        this.results = {
            head: '',
            body: '',
            js: '',
            bodyAttrs: {}
        };
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"html-scanner.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/templating-tools/html-scanner.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({scanHtmlForTags:()=>scanHtmlForTags});let CompileError;module.link('./throw-compile-error',{CompileError(v){CompileError=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
function scanHtmlForTags(options) {
    const scan = new HtmlScan(options);
    return scan.getTags();
}
/**
 * Scan an HTML file for top-level tags and extract their contents. Pass them to
 * a tag handler (an object with a handleTag method)
 *
 * This is a primitive, regex-based scanner.  It scans
 * top-level tags, which are allowed to have attributes,
 * and ignores top-level HTML comments.
 */ class HtmlScan {
    /**
   * Advance the parser
   * @param  {Number} amount The amount of characters to advance
   */ advance(amount) {
        this.rest = this.rest.substring(amount);
        this.index += amount;
    }
    throwCompileError(msg, overrideIndex) {
        const finalIndex = typeof overrideIndex === 'number' ? overrideIndex : this.index;
        const err = new CompileError();
        err.message = msg || "bad formatting in template file";
        err.file = this.sourceName;
        err.line = this.contents.substring(0, finalIndex).split('\n').length;
        throw err;
    }
    throwBodyAttrsError(msg) {
        this.parseError(msg);
    }
    getTags() {
        return this.tags;
    }
    /**
   * Initialize and run a scan of a single file
   * @param  {String} sourceName The filename, used in errors only
   * @param  {String} contents   The contents of the file
   * @param  {String[]} tagNames An array of tag names that are accepted at the
   * top level. If any other tag is encountered, an error is thrown.
   */ constructor({ sourceName, contents, tagNames }){
        this.sourceName = sourceName;
        this.contents = contents;
        this.tagNames = tagNames;
        this.rest = contents;
        this.index = 0;
        this.tags = [];
        const tagNameRegex = this.tagNames.join("|");
        const openTagRegex = new RegExp(`^((<(${tagNameRegex})\\b)|(<!--)|(<!DOCTYPE|{{!)|$)`, "i");
        while(this.rest){
            // skip whitespace first (for better line numbers)
            this.advance(this.rest.match(/^\s*/)[0].length);
            const match = openTagRegex.exec(this.rest);
            if (!match) {
                this.throwCompileError(`Expected one of: <${this.tagNames.join('>, <')}>`);
            }
            const matchToken = match[1];
            const matchTokenTagName = match[3];
            const matchTokenComment = match[4];
            const matchTokenUnsupported = match[5];
            const tagStartIndex = this.index;
            this.advance(match.index + match[0].length);
            if (!matchToken) {
                break; // matched $ (end of file)
            }
            if (matchTokenComment === '<!--') {
                // top-level HTML comment
                const commentEnd = /--\s*>/.exec(this.rest);
                if (!commentEnd) this.throwCompileError("unclosed HTML comment in template file");
                this.advance(commentEnd.index + commentEnd[0].length);
                continue;
            }
            if (matchTokenUnsupported) {
                switch(matchTokenUnsupported.toLowerCase()){
                    case '<!doctype':
                        this.throwCompileError("Can't set DOCTYPE here.  (Meteor sets <!DOCTYPE html> for you)");
                    case '{{!':
                        this.throwCompileError("Can't use '{{! }}' outside a template.  Use '<!-- -->'.");
                }
                this.throwCompileError();
            }
            // otherwise, a <tag>
            const tagName = matchTokenTagName.toLowerCase();
            const tagAttribs = {}; // bare name -> value dict
            const tagPartRegex = /^\s*((([a-zA-Z0-9:_-]+)\s*=\s*(["'])(.*?)\4)|(>))/;
            // read attributes
            let attr;
            while(attr = tagPartRegex.exec(this.rest)){
                const attrToken = attr[1];
                const attrKey = attr[3];
                let attrValue = attr[5];
                this.advance(attr.index + attr[0].length);
                if (attrToken === '>') {
                    break;
                }
                // XXX we don't HTML unescape the attribute value
                // (e.g. to allow "abcd&quot;efg") or protect against
                // collisions with methods of tagAttribs (e.g. for
                // a property named toString)
                attrValue = attrValue.match(/^\s*([\s\S]*?)\s*$/)[1]; // trim
                tagAttribs[attrKey] = attrValue;
            }
            if (!attr) {
                this.throwCompileError("Parse error in tag");
            }
            // find </tag>
            const end = new RegExp('</' + tagName + '\\s*>', 'i').exec(this.rest);
            if (!end) {
                this.throwCompileError("unclosed <" + tagName + ">");
            }
            const tagContents = this.rest.slice(0, end.index);
            const contentsStartIndex = this.index;
            // trim the tag contents.
            // this is a courtesy and is also relied on by some unit tests.
            var m = tagContents.match(/^([ \t\r\n]*)([\s\S]*?)[ \t\r\n]*$/);
            const trimmedContentsStartIndex = contentsStartIndex + m[1].length;
            const trimmedTagContents = m[2];
            const tag = {
                tagName: tagName,
                attribs: tagAttribs,
                contents: trimmedTagContents,
                contentsStartIndex: trimmedContentsStartIndex,
                tagStartIndex: tagStartIndex,
                fileContents: this.contents,
                sourceName: this.sourceName
            };
            // save the tag
            this.tags.push(tag);
            // advance afterwards, so that line numbers in errors are correct
            this.advance(end.index + end[0].length);
        }
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"throw-compile-error.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/templating-tools/throw-compile-error.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({CompileError:()=>CompileError,throwCompileError:()=>throwCompileError});class CompileError {
}
function throwCompileError(tag, message, overrideIndex) {
    const finalIndex = typeof overrideIndex === 'number' ? overrideIndex : tag.tagStartIndex;
    const err = new CompileError();
    err.message = message || "bad formatting in template file";
    err.file = tag.sourceName;
    err.line = tag.fileContents.substring(0, finalIndex).split('\n').length;
    throw err;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/templating-tools/node_modules/lodash.isempty/package.json                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/templating-tools/node_modules/lodash.isempty/index.js                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.useNode();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      TemplatingTools: TemplatingTools
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/templating-tools/templating-tools.js"
  ],
  mainModulePath: "/node_modules/meteor/templating-tools/templating-tools.js"
}});

//# sourceURL=meteor://💻app/packages/templating-tools.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdGVtcGxhdGluZy10b29scy90ZW1wbGF0aW5nLXRvb2xzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90ZW1wbGF0aW5nLXRvb2xzL2NvZGUtZ2VuZXJhdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdGVtcGxhdGluZy10b29scy9jb21waWxlLXRhZ3Mtd2l0aC1zcGFjZWJhcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3RlbXBsYXRpbmctdG9vbHMvaHRtbC1zY2FubmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90ZW1wbGF0aW5nLXRvb2xzL3Rocm93LWNvbXBpbGUtZXJyb3IuanMiXSwibmFtZXMiOlsic2Nhbkh0bWxGb3JUYWdzIiwiVGVtcGxhdGluZ1Rvb2xzIiwiY29tcGlsZVRhZ3NXaXRoU3BhY2ViYXJzIiwiZ2VuZXJhdGVUZW1wbGF0ZUpTIiwiZ2VuZXJhdGVCb2R5SlMiLCJDb21waWxlRXJyb3IiLCJ0aHJvd0NvbXBpbGVFcnJvciIsIm5hbWUiLCJyZW5kZXJGdW5jQ29kZSIsInVzZUhNUiIsIm5hbWVMaXRlcmFsIiwiSlNPTiIsInN0cmluZ2lmeSIsInRlbXBsYXRlRG90TmFtZUxpdGVyYWwiLCJ0YWdzIiwiaG1yQXZhaWxhYmxlIiwiaGFuZGxlciIsIlNwYWNlYmFyc1RhZ0NvbXBpbGVyIiwiZm9yRWFjaCIsInRhZyIsImFkZFRhZ1RvUmVzdWx0cyIsImdldFJlc3VsdHMiLCJyZXN1bHRzIiwiaGFzQXR0cmlicyIsImlzRW1wdHkiLCJhdHRyaWJzIiwidGFnTmFtZSIsImhlYWQiLCJjb250ZW50cyIsIlNwYWNlYmFyc0NvbXBpbGVyIiwiaXNSZXNlcnZlZE5hbWUiLCJ3aGl0ZXNwYWNlIiwiY29tcGlsZSIsImlzVGVtcGxhdGUiLCJzb3VyY2VOYW1lIiwianMiLCJhZGRCb2R5QXR0cnMiLCJpc0JvZHkiLCJ0YWdTdGFydEluZGV4IiwiZSIsInNjYW5uZXIiLCJtZXNzYWdlIiwiY29udGVudHNTdGFydEluZGV4Iiwib2Zmc2V0IiwiYXR0cnMiLCJPYmplY3QiLCJrZXlzIiwiYXR0ciIsInZhbCIsImJvZHlBdHRycyIsImhhc093blByb3BlcnR5Iiwib3ZlcnJpZGVJbmRleCIsImJvZHkiLCJvcHRpb25zIiwic2NhbiIsIkh0bWxTY2FuIiwiZ2V0VGFncyIsImFkdmFuY2UiLCJhbW91bnQiLCJyZXN0Iiwic3Vic3RyaW5nIiwiaW5kZXgiLCJtc2ciLCJmaW5hbEluZGV4IiwiZXJyIiwiZmlsZSIsImxpbmUiLCJzcGxpdCIsImxlbmd0aCIsInRocm93Qm9keUF0dHJzRXJyb3IiLCJwYXJzZUVycm9yIiwidGFnTmFtZXMiLCJ0YWdOYW1lUmVnZXgiLCJqb2luIiwib3BlblRhZ1JlZ2V4IiwiUmVnRXhwIiwibWF0Y2giLCJleGVjIiwibWF0Y2hUb2tlbiIsIm1hdGNoVG9rZW5UYWdOYW1lIiwibWF0Y2hUb2tlbkNvbW1lbnQiLCJtYXRjaFRva2VuVW5zdXBwb3J0ZWQiLCJjb21tZW50RW5kIiwidG9Mb3dlckNhc2UiLCJ0YWdBdHRyaWJzIiwidGFnUGFydFJlZ2V4IiwiYXR0clRva2VuIiwiYXR0cktleSIsImF0dHJWYWx1ZSIsImVuZCIsInRhZ0NvbnRlbnRzIiwic2xpY2UiLCJtIiwidHJpbW1lZENvbnRlbnRzU3RhcnRJbmRleCIsInRyaW1tZWRUYWdDb250ZW50cyIsImZpbGVDb250ZW50cyIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLGVBQWUsUUFBUSxpQkFBaUI7QUFDd0I7QUFDRjtBQUNBO0FBRXZFLE9BQU8sTUFBTUMsWUFBbUI7SUFDOUJEO0lBQ0FFO0lBQ0FDO0lBQ0FDO0lBQ0FDO0lBQ0FDO0FBQ0YsRUFBRTs7Ozs7Ozs7Ozs7OztBQ1pGLE9BQU8sU0FBU0gsbUJBQW1CSSxJQUFJLEVBQUVDLGNBQWMsRUFBRUMsTUFBTTtJQUM3RCxNQUFNQyxjQUFjQyxLQUFLQyxTQUFTLENB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WixrQkFBa0IsV0FDM0NBLGdCQUFnQmhDLElBQUltQixhQUFhO0lBRW5DLE1BQU0wQixNQUFNLElBQUkzRDtJQUNoQjJELElBQUl2QixPQUFPLEdBQUdBLFdBQVc7SUFDekJ1QixJQUFJQyxJQUFJLEdBQUc5QyxJQUFJZSxVQUFVO0lBQ3pCOEIsSUFBSUUsSUFBSSxHQUFHL0MsSUFBSTRFLFlBQVksQ0FBQ25DLFNBQVMsQ0FBQyxHQUFHRyxZQUFZSSxLQUFLLENBQUMsTUFBTUMsTUFBTTtJQUN2RSxNQUFNSjtBQUNSIiwiZmlsZSI6Ii9wYWNrYWdlcy90ZW1wbGF0aW5nLXRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2Nhbkh0bWxGb3JUYWdzIH0gZnJvbSAnLi9odG1sLXNjYW5uZXInO1xuaW1wb3J0IHsgY29tcGlsZVRhZ3NXaXRoU3BhY2ViYXJzIH0gZnJvbSAnLi9jb21waWxlLXRhZ3Mtd2l0aC1zcGFjZWJhcnMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZW1wbGF0ZUpTLCBnZW5lcmF0ZUJvZHlKUyB9IGZyb20gJy4vY29kZS1nZW5lcmF0aW9uJztcbmltcG9ydCB7IENvbXBpbGVFcnJvciwgdGhyb3dDb21waWxlRXJyb3J9IGZyb20gJy4vdGhyb3ctY29tcGlsZS1lcnJvcic7XG5cbmV4cG9ydCBjb25zdCBUZW1wbGF0aW5nVG9vbHMgID0ge1xuICBzY2FuSHRtbEZvclRhZ3MsXG4gIGNvbXBpbGVUYWdzV2l0aFNwYWNlYmFycyxcbiAgZ2VuZXJhdGVUZW1wbGF0ZUpTLFxuICBnZW5lcmF0ZUJvZHlKUyxcbiAgQ29tcGlsZUVycm9yLFxuICB0aHJvd0NvbXBpbGVFcnJvclxufTtcbiIsImV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRlbXBsYXRlSlMobmFtZSwgcmVuZGVyRnVuY0NvZGUsIHVzZUhNUikge1xuICBjb25zdCBuYW1lTGl0ZXJhbCA9IEpTT04uc3RyaW5naWZ5KG5hbWUpO1xuICBjb25zdCB0ZW1wbGF0ZURvdE5hbWVMaXRlcmFsID0gSlNPTi5zdHJpbmdpZnkoYFRlbXBsYXRlLiR7bmFtZX1gKTtcblxuICBpZiAodXNlSE1SKSB7XG4gICAgLy8gbW9kdWxlLmhvdC5kYXRhIGlzIHVzZWQgdG8gbWFrZSBzdXJlIFRlbXBsYXRlLl9fY2hlY2tOYW1lIGNhbiBzdGlsbFxuICAgIC8vIGRldGVjdCBkdXBsaWNhdGVzXG4gICAgcmV0dXJuIGBcblRlbXBsYXRlLl9taWdyYXRlVGVtcGxhdGUoXG4gICR7bmFtZUxpdGVyYWx9LFxuICBuZXcgVGVtcGxhdGUoJHt0ZW1wbGF0ZURvdE5hbWVMaXRlcmFsfSwgJHtyZW5kZXJGdW5jQ29kZX0pXG4pO1xuaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpO1xuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKCkge1xuICAgIFRlbXBsYXRlLl9fcGVuZGluZ1JlcGxhY2VtZW50LnB1c2goJHtuYW1lTGl0ZXJhbH0pO1xuICAgIFRlbXBsYXRlLl9hcHBseUhtckNoYW5nZXMoJHtuYW1lTGl0ZXJhbH0pO1xuICB9KTtcbn1cbmBcbiAgfVxuXG4gIHJldHVybiBgXG5UZW1wbGF0ZS5fX2NoZWNrTmFtZSgke25hbWVMaXRlcmFsfSk7XG5UZW1wbGF0ZVske25hbWVMaXRlcmFsfV0gPSBuZXcgVGVtcGxhdGUoJHt0ZW1wbGF0ZURvdE5hbWVMaXRlcmFsfSwgJHtyZW5kZXJGdW5jQ29kZX0pO1xuYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQm9keUpTKHJlbmRlckZ1bmNDb2RlLCB1c2VITVIpIHtcbiAgaWYgKHVzZUhNUikge1xuICAgIHJldHVybiBgXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgcmVuZGVyRnVuYyA9ICR7cmVuZGVyRnVuY0NvZGV9O1xuICBUZW1wbGF0ZS5ib2R5LmFkZENvbnRlbnQocmVuZGVyRnVuYyk7XG4gIE1ldGVvci5zdGFydHVwKFRlbXBsYXRlLmJvZHkucmVuZGVyVG9Eb2N1bWVudCk7XG4gIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5ob3QpIHtcbiAgICBtb2R1bGUuaG90LmFjY2VwdCgpO1xuICAgIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW5kZXggPSBUZW1wbGF0ZS5ib2R5LmNvbnRlbnRSZW5kZXJGdW5jcy5pbmRleE9mKHJlbmRlckZ1bmMpXG4gICAgICBUZW1wbGF0ZS5ib2R5LmNvbnRlbnRSZW5kZXJGdW5jcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgVGVtcGxhdGUuX2FwcGx5SG1yQ2hhbmdlcygpO1xuICAgIH0pO1xuICB9XG59KSgpO1xuYFxuICB9XG5cbiAgcmV0dXJuIGBcblRlbXBsYXRlLmJvZHkuYWRkQ29udGVudCgke3JlbmRlckZ1bmNDb2RlfSk7XG5NZXRlb3Iuc3RhcnR1cChUZW1wbGF0ZS5ib2R5LnJlbmRlclRvRG9jdW1lbnQpO1xuYDtcbn1cbiIsImltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcbmltcG9ydCB7IFNwYWNlYmFyc0NvbXBpbGVyIH0gZnJvbSAnbWV0ZW9yL3NwYWNlYmFycy1jb21waWxlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZUJvZHlKUywgZ2VuZXJhdGVUZW1wbGF0ZUpTIH0gZnJvbSAnLi9jb2RlLWdlbmVyYXRpb24nO1xuaW1wb3J0IHsgdGhyb3dDb21waWxlRXJyb3IgfSBmcm9tICcuL3Rocm93LWNvbXBpbGUtZXJyb3InO1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRhZ3NXaXRoU3BhY2ViYXJzKHRhZ3MsIGhtckF2YWlsYWJsZSkge1xuICB2YXIgaGFuZGxlciA9IG5ldyBTcGFjZWJhcnNUYWdDb21waWxlcigpO1xuXG4gIHRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgaGFuZGxlci5hZGRUYWdUb1Jlc3VsdHModGFnLCBobXJBdmFpbGFibGUpO1xuICB9KTtcblxuICByZXR1cm4gaGFuZGxlci5nZXRSZXN1bHRzKCk7XG59XG5cblxuY2xhc3MgU3BhY2ViYXJzVGFnQ29tcGlsZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJlc3VsdHMgPSB7XG4gICAgICBoZWFkOiAnJyxcbiAgICAgIGJvZHk6ICcnLFxuICAgICAganM6ICcnLFxuICAgICAgYm9keUF0dHJzOiB7fVxuICAgIH07XG4gIH1cblxuICBnZXRSZXN1bHRzKCkge1xuICAgIHJldHVybiB0aGlzLnJlc3VsdHM7XG4gIH1cblxuICBhZGRUYWdUb1Jlc3VsdHModGFnLCBobXJBdmFpbGFibGUpIHtcbiAgICB0aGlzLnRhZyA9IHRhZztcblxuICAgIC8vIGRvIHdlIGhhdmUgMSBvciBtb3JlIGF0dHJpYnV0ZXM/XG4gICAgY29uc3QgaGFzQXR0cmlicyA9ICFpc0VtcHR5KHRoaXMudGFnLmF0dHJpYnMpO1xuXG4gICAgaWYgKHRoaXMudGFnLnRhZ05hbWUgPT09IFwiaGVhZFwiKSB7XG4gICAgICBpZiAoaGFzQXR0cmlicykge1xuICAgICAgICB0aGlzLnRocm93Q29tcGlsZUVycm9yKFwiQXR0cmlidXRlcyBvbiA8aGVhZD4gbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXN1bHRzLmhlYWQgKz0gdGhpcy50YWcuY29udGVudHM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG5cbiAgICAvLyA8Ym9keT4gb3IgPHRlbXBsYXRlPlxuXG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLnRhZy50YWdOYW1lID09PSBcInRlbXBsYXRlXCIpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMudGFnLmF0dHJpYnMubmFtZTtcblxuICAgICAgICBpZiAoISBuYW1lKSB7XG4gICAgICAgICAgdGhpcy50aHJvd0NvbXBpbGVFcnJvcihcIlRlbXBsYXRlIGhhcyBubyAnbmFtZScgYXR0cmlidXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNwYWNlYmFyc0NvbXBpbGVyLmlzUmVzZXJ2ZWROYW1lKG5hbWUpKSB7XG4gICAgICAgICAgdGhpcy50aHJvd0NvbXBpbGVFcnJvcihgVGVtcGxhdGUgY2FuJ3QgYmUgbmFtZWQgXCIke25hbWV9XCJgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdoaXRlc3BhY2UgPSB0aGlzLnRhZy5hdHRyaWJzLndoaXRlc3BhY2UgfHwgJyc7XG5cbiAgICAgICAgY29uc3QgcmVuZGVyRnVuY0NvZGUgPSBTcGFjZWJhcnNDb21waWxlci5jb21waWxlKHRoaXMudGFnLmNvbnRlbnRzLCB7XG4gICAgICAgICAgd2hpdGVzcGFjZSxcbiAgICAgICAgICBpc1RlbXBsYXRlOiB0cnVlLFxuICAgICAgICAgIHNvdXJjZU5hbWU6IGBUZW1wbGF0ZSBcIiR7bmFtZX1cImBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZXN1bHRzLmpzICs9IGdlbmVyYXRlVGVtcGxhdGVKUyhcbiAgICAgICAgICBuYW1lLCByZW5kZXJGdW5jQ29kZSwgaG1yQXZhaWxhYmxlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50YWcudGFnTmFtZSA9PT0gXCJib2R5XCIpIHtcbiAgICAgICAgY29uc3QgeyB3aGl0ZXNwYWNlID0gJycsIC4uLmF0dHJpYnMgfSA9IHRoaXMudGFnLmF0dHJpYnM7XG4gICAgICAgIHRoaXMuYWRkQm9keUF0dHJzKGF0dHJpYnMpO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlckZ1bmNDb2RlID0gU3BhY2ViYXJzQ29tcGlsZXIuY29tcGlsZSh0aGlzLnRhZy5jb250ZW50cywge1xuICAgICAgICAgIHdoaXRlc3BhY2UsXG4gICAgICAgICAgaXNCb2R5OiB0cnVlLFxuICAgICAgICAgIHNvdXJjZU5hbWU6IFwiPGJvZHk+XCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2UgbWF5IGJlIG9uZSBvZiBtYW55IGA8Ym9keT5gIHRhZ3MuXG4gICAgICAgIHRoaXMucmVzdWx0cy5qcyArPSBnZW5lcmF0ZUJvZHlKUyhyZW5kZXJGdW5jQ29kZSwgaG1yQXZhaWxhYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoXCJFeHBlY3RlZCA8dGVtcGxhdGU+LCA8aGVhZD4sIG9yIDxib2R5PiB0YWcgaW4gdGVtcGxhdGUgZmlsZVwiLCB0YWdTdGFydEluZGV4KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5zY2FubmVyKSB7XG4gICAgICAgIC8vIFRoZSBlcnJvciBjYW1lIGZyb20gU3BhY2ViYXJzXG4gICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoZS5tZXNzYWdlLCB0aGlzLnRhZy5jb250ZW50c1N0YXJ0SW5kZXggKyBlLm9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZEJvZHlBdHRycyhhdHRycykge1xuICAgIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKChhdHRyKSA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBhdHRyc1thdHRyXTtcblxuICAgICAgLy8gVGhpcyBjaGVjayBpcyBmb3IgY29uZmxpY3RpbmcgYm9keSBhdHRyaWJ1dGVzIGluIHRoZSBzYW1lIGZpbGU7XG4gICAgICAvLyB3ZSBjaGVjayBhY3Jvc3MgbXVsdGlwbGUgZmlsZXMgaW4gY2FjaGluZy1odG1sLWNvbXBpbGVyIHVzaW5nIHRoZVxuICAgICAgLy8gYXR0cmlidXRlcyBvbiByZXN1bHRzLmJvZHlBdHRyc1xuICAgICAgaWYgKHRoaXMucmVzdWx0cy5ib2R5QXR0cnMuaGFzT3duUHJvcGVydHkoYXR0cikgJiYgdGhpcy5yZXN1bHRzLmJvZHlBdHRyc1thdHRyXSAhPT0gdmFsKSB7XG4gICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoXG4gICAgICAgICAgYDxib2R5PiBkZWNsYXJhdGlvbnMgaGF2ZSBjb25mbGljdGluZyB2YWx1ZXMgZm9yIHRoZSAnJHthdHRyfScgYXR0cmlidXRlLmApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc3VsdHMuYm9keUF0dHJzW2F0dHJdID0gdmFsO1xuICAgIH0pO1xuICB9XG5cbiAgdGhyb3dDb21waWxlRXJyb3IobWVzc2FnZSwgb3ZlcnJpZGVJbmRleCkge1xuICAgIHRocm93Q29tcGlsZUVycm9yKHRoaXMudGFnLCBtZXNzYWdlLCBvdmVycmlkZUluZGV4KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcGlsZUVycm9yIH0gZnJvbSAnLi90aHJvdy1jb21waWxlLWVycm9yJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNjYW5IdG1sRm9yVGFncyhvcHRpb25zKSB7XG4gIGNvbnN0IHNjYW4gPSBuZXcgSHRtbFNjYW4ob3B0aW9ucyk7XG4gIHJldHVybiBzY2FuLmdldFRhZ3MoKTtcbn1cblxuLyoqXG4gKiBTY2FuIGFuIEhUTUwgZmlsZSBmb3IgdG9wLWxldmVsIHRhZ3MgYW5kIGV4dHJhY3QgdGhlaXIgY29udGVudHMuIFBhc3MgdGhlbSB0b1xuICogYSB0YWcgaGFuZGxlciAoYW4gb2JqZWN0IHdpdGggYSBoYW5kbGVUYWcgbWV0aG9kKVxuICpcbiAqIFRoaXMgaXMgYSBwcmltaXRpdmUsIHJlZ2V4LWJhc2VkIHNjYW5uZXIuICBJdCBzY2Fuc1xuICogdG9wLWxldmVsIHRhZ3MsIHdoaWNoIGFyZSBhbGxvd2VkIHRvIGhhdmUgYXR0cmlidXRlcyxcbiAqIGFuZCBpZ25vcmVzIHRvcC1sZXZlbCBIVE1MIGNvbW1lbnRzLlxuICovXG5jbGFzcyBIdG1sU2NhbiB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGFuZCBydW4gYSBzY2FuIG9mIGEgc2luZ2xlIGZpbGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzb3VyY2VOYW1lIFRoZSBmaWxlbmFtZSwgdXNlZCBpbiBlcnJvcnMgb25seVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNvbnRlbnRzICAgVGhlIGNvbnRlbnRzIG9mIHRoZSBmaWxlXG4gICAqIEBwYXJhbSAge1N0cmluZ1tdfSB0YWdOYW1lcyBBbiBhcnJheSBvZiB0YWcgbmFtZXMgdGhhdCBhcmUgYWNjZXB0ZWQgYXQgdGhlXG4gICAqIHRvcCBsZXZlbC4gSWYgYW55IG90aGVyIHRhZyBpcyBlbmNvdW50ZXJlZCwgYW4gZXJyb3IgaXMgdGhyb3duLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioe1xuICAgICAgICBzb3VyY2VOYW1lLFxuICAgICAgICBjb250ZW50cyxcbiAgICAgICAgdGFnTmFtZXNcbiAgICAgIH0pIHtcbiAgICB0aGlzLnNvdXJjZU5hbWUgPSBzb3VyY2VOYW1lO1xuICAgIHRoaXMuY29udGVudHMgPSBjb250ZW50cztcbiAgICB0aGlzLnRhZ05hbWVzID0gdGFnTmFtZXM7XG5cbiAgICB0aGlzLnJlc3QgPSBjb250ZW50cztcbiAgICB0aGlzLmluZGV4ID0gMDtcblxuICAgIHRoaXMudGFncyA9IFtdO1xuXG4gICAgY29uc3QgdGFnTmFtZVJlZ2V4ID0gdGhpcy50YWdOYW1lcy5qb2luKFwifFwiKTtcbiAgICBjb25zdCBvcGVuVGFnUmVnZXggPSBuZXcgUmVnRXhwKGBeKCg8KCR7dGFnTmFtZVJlZ2V4fSlcXFxcYil8KDwhLS0pfCg8IURPQ1RZUEV8e3shKXwkKWAsIFwiaVwiKTtcblxuICAgIHdoaWxlICh0aGlzLnJlc3QpIHtcbiAgICAgIC8vIHNraXAgd2hpdGVzcGFjZSBmaXJzdCAoZm9yIGJldHRlciBsaW5lIG51bWJlcnMpXG4gICAgICB0aGlzLmFkdmFuY2UodGhpcy5yZXN0Lm1hdGNoKC9eXFxzKi8pWzBdLmxlbmd0aCk7XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gb3BlblRhZ1JlZ2V4LmV4ZWModGhpcy5yZXN0KTtcblxuICAgICAgaWYgKCEgbWF0Y2gpIHtcbiAgICAgICAgdGhpcy50aHJvd0NvbXBpbGVFcnJvcihgRXhwZWN0ZWQgb25lIG9mOiA8JHt0aGlzLnRhZ05hbWVzLmpvaW4oJz4sIDwnKX0+YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoVG9rZW4gPSBtYXRjaFsxXTtcbiAgICAgIGNvbnN0IG1hdGNoVG9rZW5UYWdOYW1lID0gIG1hdGNoWzNdO1xuICAgICAgY29uc3QgbWF0Y2hUb2tlbkNvbW1lbnQgPSBtYXRjaFs0XTtcbiAgICAgIGNvbnN0IG1hdGNoVG9rZW5VbnN1cHBvcnRlZCA9IG1hdGNoWzVdO1xuXG4gICAgICBjb25zdCB0YWdTdGFydEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICAgIHRoaXMuYWR2YW5jZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG5cbiAgICAgIGlmICghIG1hdGNoVG9rZW4pIHtcbiAgICAgICAgYnJlYWs7IC8vIG1hdGNoZWQgJCAoZW5kIG9mIGZpbGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaFRva2VuQ29tbWVudCA9PT0gJzwhLS0nKSB7XG4gICAgICAgIC8vIHRvcC1sZXZlbCBIVE1MIGNvbW1lbnRcbiAgICAgICAgY29uc3QgY29tbWVudEVuZCA9IC8tLVxccyo+Ly5leGVjKHRoaXMucmVzdCk7XG4gICAgICAgIGlmICghIGNvbW1lbnRFbmQpXG4gICAgICAgICAgdGhpcy50aHJvd0NvbXBpbGVFcnJvcihcInVuY2xvc2VkIEhUTUwgY29tbWVudCBpbiB0ZW1wbGF0ZSBmaWxlXCIpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoY29tbWVudEVuZC5pbmRleCArIGNvbW1lbnRFbmRbMF0ubGVuZ3RoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaFRva2VuVW5zdXBwb3J0ZWQpIHtcbiAgICAgICAgc3dpdGNoIChtYXRjaFRva2VuVW5zdXBwb3J0ZWQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlICc8IWRvY3R5cGUnOlxuICAgICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoXG4gICAgICAgICAgICBcIkNhbid0IHNldCBET0NUWVBFIGhlcmUuICAoTWV0ZW9yIHNldHMgPCFET0NUWVBFIGh0bWw+IGZvciB5b3UpXCIpO1xuICAgICAgICBjYXNlICd7eyEnOlxuICAgICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoXG4gICAgICAgICAgICBcIkNhbid0IHVzZSAne3shIH19JyBvdXRzaWRlIGEgdGVtcGxhdGUuICBVc2UgJzwhLS0gLS0+Jy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRocm93Q29tcGlsZUVycm9yKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIG90aGVyd2lzZSwgYSA8dGFnPlxuICAgICAgY29uc3QgdGFnTmFtZSA9IG1hdGNoVG9rZW5UYWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCB0YWdBdHRyaWJzID0ge307IC8vIGJhcmUgbmFtZSAtPiB2YWx1ZSBkaWN0XG4gICAgICBjb25zdCB0YWdQYXJ0UmVnZXggPSAvXlxccyooKChbYS16QS1aMC05Ol8tXSspXFxzKj1cXHMqKFtcIiddKSguKj8pXFw0KXwoPikpLztcblxuICAgICAgLy8gcmVhZCBhdHRyaWJ1dGVzXG4gICAgICBsZXQgYXR0cjtcbiAgICAgIHdoaWxlICgoYXR0ciA9IHRhZ1BhcnRSZWdleC5leGVjKHRoaXMucmVzdCkpKSB7XG4gICAgICAgIGNvbnN0IGF0dHJUb2tlbiA9IGF0dHJbMV07XG4gICAgICAgIGNvbnN0IGF0dHJLZXkgPSBhdHRyWzNdO1xuICAgICAgICBsZXQgYXR0clZhbHVlID0gYXR0cls1XTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKGF0dHIuaW5kZXggKyBhdHRyWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKGF0dHJUb2tlbiA9PT0gJz4nKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFggd2UgZG9uJ3QgSFRNTCB1bmVzY2FwZSB0aGUgYXR0cmlidXRlIHZhbHVlXG4gICAgICAgIC8vIChlLmcuIHRvIGFsbG93IFwiYWJjZCZxdW90O2VmZ1wiKSBvciBwcm90ZWN0IGFnYWluc3RcbiAgICAgICAgLy8gY29sbGlzaW9ucyB3aXRoIG1ldGhvZHMgb2YgdGFnQXR0cmlicyAoZS5nLiBmb3JcbiAgICAgICAgLy8gYSBwcm9wZXJ0eSBuYW1lZCB0b1N0cmluZylcbiAgICAgICAgYXR0clZhbHVlID0gYXR0clZhbHVlLm1hdGNoKC9eXFxzKihbXFxzXFxTXSo/KVxccyokLylbMV07IC8vIHRyaW1cbiAgICAgICAgdGFnQXR0cmlic1thdHRyS2V5XSA9IGF0dHJWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEgYXR0cikgeyAvLyBkaWRuJ3QgZW5kIG9uICc+J1xuICAgICAgICB0aGlzLnRocm93Q29tcGlsZUVycm9yKFwiUGFyc2UgZXJyb3IgaW4gdGFnXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBmaW5kIDwvdGFnPlxuICAgICAgY29uc3QgZW5kID0gKG5ldyBSZWdFeHAoJzwvJyt0YWdOYW1lKydcXFxccyo+JywgJ2knKSkuZXhlYyh0aGlzLnJlc3QpO1xuICAgICAgaWYgKCEgZW5kKSB7XG4gICAgICAgIHRoaXMudGhyb3dDb21waWxlRXJyb3IoXCJ1bmNsb3NlZCA8XCIrdGFnTmFtZStcIj5cIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhZ0NvbnRlbnRzID0gdGhpcy5yZXN0LnNsaWNlKDAsIGVuZC5pbmRleCk7XG4gICAgICBjb25zdCBjb250ZW50c1N0YXJ0SW5kZXggPSB0aGlzLmluZGV4O1xuXG4gICAgICAvLyB0cmltIHRoZSB0YWcgY29udGVudHMuXG4gICAgICAvLyB0aGlzIGlzIGEgY291cnRlc3kgYW5kIGlzIGFsc28gcmVsaWVkIG9uIGJ5IHNvbWUgdW5pdCB0ZXN0cy5cbiAgICAgIHZhciBtID0gdGFnQ29udGVudHMubWF0Y2goL14oWyBcXHRcXHJcXG5dKikoW1xcc1xcU10qPylbIFxcdFxcclxcbl0qJC8pO1xuICAgICAgY29uc3QgdHJpbW1lZENvbnRlbnRzU3RhcnRJbmRleCA9IGNvbnRlbnRzU3RhcnRJbmRleCArIG1bMV0ubGVuZ3RoO1xuICAgICAgY29uc3QgdHJpbW1lZFRhZ0NvbnRlbnRzID0gbVsyXTtcblxuICAgICAgY29uc3QgdGFnID0ge1xuICAgICAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgICAgICBhdHRyaWJzOiB0YWdBdHRyaWJzLFxuICAgICAgICBjb250ZW50czogdHJpbW1lZFRhZ0NvbnRlbnRzLFxuICAgICAgICBjb250ZW50c1N0YXJ0SW5kZXg6IHRyaW1tZWRDb250ZW50c1N0YXJ0SW5kZXgsXG4gICAgICAgIHRhZ1N0YXJ0SW5kZXg6IHRhZ1N0YXJ0SW5kZXgsXG4gICAgICAgIGZpbGVDb250ZW50czogdGhpcy5jb250ZW50cyxcbiAgICAgICAgc291cmNlTmFtZTogdGhpcy5zb3VyY2VOYW1lXG4gICAgICB9O1xuXG4gICAgICAvLyBzYXZlIHRoZSB0YWdcbiAgICAgIHRoaXMudGFncy5wdXNoKHRhZyk7XG5cbiAgICAgIC8vIGFkdmFuY2UgYWZ0ZXJ3YXJkcywgc28gdGhhdCBsaW5lIG51bWJlcnMgaW4gZXJyb3JzIGFyZSBjb3JyZWN0XG4gICAgICB0aGlzLmFkdmFuY2UoZW5kLmluZGV4ICsgZW5kWzBdLmxlbmd0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkdmFuY2UgdGhlIHBhcnNlclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGFtb3VudCBUaGUgYW1vdW50IG9mIGNoYXJhY3RlcnMgdG8gYWR2YW5jZVxuICAgKi9cbiAgYWR2YW5jZShhbW91bnQpIHtcbiAgICB0aGlzLnJlc3QgPSB0aGlzLnJlc3Quc3Vic3RyaW5nKGFtb3VudCk7XG4gICAgdGhpcy5pbmRleCArPSBhbW91bnQ7XG4gIH1cblxuICB0aHJvd0NvbXBpbGVFcnJvcihtc2csIG92ZXJyaWRlSW5kZXgpIHtcbiAgICBjb25zdCBmaW5hbEluZGV4ID0gKHR5cGVvZiBvdmVycmlkZUluZGV4ID09PSAnbnVtYmVyJyA/IG92ZXJyaWRlSW5kZXggOiB0aGlzLmluZGV4KTtcblxuICAgIGNvbnN0IGVyciA9IG5ldyBDb21waWxlRXJyb3IoKTtcbiAgICBlcnIubWVzc2FnZSA9IG1zZyB8fCBcImJhZCBmb3JtYXR0aW5nIGluIHRlbXBsYXRlIGZpbGVcIjtcbiAgICBlcnIuZmlsZSA9IHRoaXMuc291cmNlTmFtZTtcbiAgICBlcnIubGluZSA9IHRoaXMuY29udGVudHMuc3Vic3RyaW5nKDAsIGZpbmFsSW5kZXgpLnNwbGl0KCdcXG4nKS5sZW5ndGg7XG5cbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICB0aHJvd0JvZHlBdHRyc0Vycm9yKG1zZykge1xuICAgIHRoaXMucGFyc2VFcnJvcihtc2cpO1xuICB9XG5cbiAgZ2V0VGFncygpIHtcbiAgICByZXR1cm4gdGhpcy50YWdzO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgQ29tcGlsZUVycm9yIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0NvbXBpbGVFcnJvcih0YWcsIG1lc3NhZ2UsIG92ZXJyaWRlSW5kZXgpIHtcbiAgY29uc3QgZmluYWxJbmRleCA9ICh0eXBlb2Ygb3ZlcnJpZGVJbmRleCA9PT0gJ251bWJlcicgP1xuICAgIG92ZXJyaWRlSW5kZXggOiB0YWcudGFnU3RhcnRJbmRleCk7XG5cbiAgY29uc3QgZXJyID0gbmV3IENvbXBpbGVFcnJvcigpO1xuICBlcnIubWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJiYWQgZm9ybWF0dGluZyBpbiB0ZW1wbGF0ZSBmaWxlXCI7XG4gIGVyci5maWxlID0gdGFnLnNvdXJjZU5hbWU7XG4gIGVyci5saW5lID0gdGFnLmZpbGVDb250ZW50cy5zdWJzdHJpbmcoMCwgZmluYWxJbmRleCkuc3BsaXQoJ1xcbicpLmxlbmd0aDtcbiAgdGhyb3cgZXJyO1xufVxuIl19
