Package["core-runtime"].queue("logging",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var EJSON = Package.ejson.EJSON;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Formatter, Log;

var require = meteorInstall({"node_modules":{"meteor":{"logging":{"logging.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/logging/logging.js                                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({Log:()=>Log});let Meteor;module.link("meteor/meteor",{Meteor(v){Meteor=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}

const hasOwn = Object.prototype.hasOwnProperty;
function Log(...args) {
    Log.info(...args);
}
/// FOR TESTING
let intercept = 0;
let interceptedLines = [];
let suppress = 0;
// Intercept the next 'count' calls to a Log function. The actual
// lines printed to the console can be cleared and read by calling
// Log._intercepted().
Log._intercept = (count)=>{
    intercept += count;
};
// Suppress the next 'count' calls to a Log function. Use this to stop
// tests from spamming the console, especially with red errors that
// might look like a failing test.
Log._suppress = (count)=>{
    suppress += count;
};
// Returns intercepted lines and resets the intercept counter.
Log._intercepted = ()=>{
    const lines = interceptedLines;
    interceptedLines = [];
    intercept = 0;
    return lines;
};
// Either 'json' or 'colored-text'.
//
// When this is set to 'json', print JSON documents that are parsed by another
// process ('satellite' or 'meteor run'). This other process should call
// 'Log.format' for nice output.
//
// When this is set to 'colored-text', call 'Log.format' before printing.
// This should be used for logging from within satellite, since there is no
// other process that will be reading its standard output.
Log.outputFormat = "json";
// Defaults to true for local development and for backwards compatibility.
// for cloud environments is interesting to leave it false as most of them have the timestamp in the console.
// Only works in server with colored-text
Log.showTime = true;
const LEVEL_COLORS = {
    debug: "green",
    // leave info as the default color
    warn: "magenta",
    error: "red"
};
const META_COLOR = "blue";
// Default colors cause readability problems on Windows Powershell,
// switch to bright variants. While still capable of millions of
// operations per second, the benchmark showed a 25%+ increase in
// ops per second (on Node 8) by caching "process.platform".
const isWin32 = typeof process === "object" && process.platform === "win32";
const platformColor = (color)=>{
    if (isWin32 && typeof color === "string" && !color.endsWith("Bright")) {
        return `${color}Bright`;
    }
    return color;
};
// XXX package
const RESTRICTED_KEYS = [
    "time",
    "timeInexact",
    "level",
    "file",
    "line",
    "program",
    "originApp",
    "satellite",
    "stderr"
];
const FORMATTED_KEYS = [
    ...RESTRICTED_KEYS,
    "app",
    "message"
];
const logInBrowser = (obj)=>{
    const str = Log.format(obj);
    // XXX Some levels should be probably be sent to the server
    const level = obj.level;
    if (typeof console !== "undefined" && console[level]) {
        console[level](str);
    } else {
        // IE doesn't have console.log.apply, it's not a real Object.
        // http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
        // http://patik.com/blog/complete-cross-browser-console-log/
        if (typeof console.log.apply === "function") {
            // Most browsers
            console.log.apply(console, [
                str
            ]);
        } else if (typeof Function.prototype.bind === "function") {
            // IE9
            const log = Function.prototype.bind.call(console.log, console);
            log.apply(console, [
                str
            ]);
        }
    }
};
// @returns {Object: { line: Number, file: String }}
Log._getCallerDetails = ()=>{
    const getStack = ()=>{
        // We do NOT use Error.prepareStackTrace here (a V8 extension that gets us a
        // pre-parsed stack) since it's impossible to compose it with the use of
        // Error.prepareStackTrace used on the server for source maps.
        const err = new Error();
        const stack = err.stack;
        return stack;
    };
    const stack = getStack();
    if (!stack) return {};
    // looking for the first line outside the logging package (or an
    // eval if we find that first)
    let line;
    const lines = stack.split("\n").slice(1);
    for (line of lines){
        if (line.match(/^\s*(at eval \(eval)|(eval:)/)) {
            return {
                file: "eval"
            };
        }
        if (!line.match(/packages\/(?:local-test[:_])?logging(?:\/|\.js)/)) {
            break;
        }
    }
    const details = {};
    // The format for FF is 'functionName@filePath:lineNumber'
    // The format for V8 is 'functionName (packages/logging/logging.js:81)' or
    //                      'packages/logging/logging.js:81'
    const match = /(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(line);
    if (!match) {
        return details;
    }
    // in case the matched block here is line:column
    details.line = match[2].split(":")[0];
    // Possible format: https://foo.bar.com/scripts/file.js?random=foobar
    // XXX: if you can write the following in better way, please do it
    // XXX: what about evals?
    details.file = match[1].split("/").slice(-1)[0].split("?")[0];
    return details;
};
[
    "debug",
    "info",
    "warn",
    "error"
].forEach((level)=>{
    // @param arg {String|Object}
    Log[level] = (arg)=>{
        if (suppress) {
            suppress--;
            return;
        }
        let intercepted = false;
        if (intercept) {
            intercept--;
            intercepted = true;
        }
        let obj = arg === Object(arg) && !(arg instanceof RegExp) && !(arg instanceof Date) ? arg : {
            message: new String(arg).toString()
        };
        RESTRICTED_KEYS.forEach((key)=>{
            if (obj[key]) {
                throw new Error(`Can't set '${key}' in log message`);
            }
        });
        if (hasOwn.call(obj, "message") && typeof obj.message !== "string") {
            throw new Error("The 'message' field in log objects must be a string");
        }
        if (!obj.omitCallerDetails) {
            obj = _object_spread({}, Log._getCallerDetails(), obj);
        }
        obj.time = new Date();
        obj.level = level;
        // If we are in production don't write out debug logs.
        if (level === "debug" && Meteor.isProduction) {
            return;
        }
        if (intercepted) {
            interceptedLines.push(EJSON.stringify(obj));
        } else if (Meteor.isServer) {
            if (Log.outputFormat === "colored-text") {
                console.log(Log.format(obj, {
                    color: true
                }));
            } else if (Log.outputFormat === "json") {
                console.log(EJSON.stringify(obj));
            } else {
                throw new Error(`Unknown logging output format: ${Log.outputFormat}`);
            }
        } else {
            logInBrowser(obj);
        }
    };
});
// tries to parse line as EJSON. returns object if parse is successful, or null if not
Log.parse = (line)=>{
    let obj = null;
    if (line && line.startsWith("{")) {
        // might be json generated from calling 'Log'
        try {
            obj = EJSON.parse(line);
        } catch (e) {}
    }
    // XXX should probably check fields other than 'time'
    if (obj && obj.time && obj.time instanceof Date) {
        return obj;
    } else {
        return null;
    }
};
// formats a log object into colored human and machine-readable text
Log.format = (obj, options = {})=>{
    obj = _object_spread({}, obj); // don't mutate the argument
    const { time, timeInexact, level = "info", file, line: lineNumber, app: appName = "", originApp, program = "", satellite = "", stderr = "" } = obj;
    let { message = "" } = obj;
    if (!(time instanceof Date)) {
        throw new Error("'time' must be a Date object");
    }
    FORMATTED_KEYS.forEach((key)=>{
        delete obj[key];
    });
    if (Object.keys(obj).length > 0) {
        if (message) {
            message += " ";
        }
        message += EJSON.stringify(obj);
    }
    const pad2 = (n)=>n.toString().padStart(2, "0");
    const pad3 = (n)=>n.toString().padStart(3, "0");
    const dateStamp = time.getFullYear().toString() + pad2(time.getMonth() + 1 /*0-based*/ ) + pad2(time.getDate());
    const timeStamp = `${pad2(time.getHours())}:${pad2(time.getMinutes())}:${pad2(time.getSeconds())}.${pad3(time.getMilliseconds())}`;
    // eg in San Francisco in June this will be '(-7)'
    const utcOffsetStr = `(${-(new Date().getTimezoneOffset() / 60)})`;
    let appInfo = "";
    if (appName) {
        appInfo += appName;
    }
    if (originApp && originApp !== appName) {
        appInfo += ` via ${originApp}`;
    }
    if (appInfo) {
        appInfo = `[${appInfo}] `;
    }
    const sourceInfoParts = [];
    if (program) {
        sourceInfoParts.push(program);
    }
    if (file) {
        sourceInfoParts.push(file);
    }
    if (lineNumber) {
        sourceInfoParts.push(lineNumber);
    }
    let sourceInfo = !sourceInfoParts.length ? "" : `(${sourceInfoParts.join(":")}) `;
    if (satellite) sourceInfo += `[${satellite}]`;
    const stderrIndicator = stderr ? "(STDERR) " : "";
    const timeString = Log.showTime ? `${dateStamp}-${timeStamp}${utcOffsetStr}${timeInexact ? "? " : " "}` : " ";
    const metaPrefix = [
        level.charAt(0).toUpperCase(),
        timeString,
        appInfo,
        sourceInfo,
        stderrIndicator
    ].join("");
    return Formatter.prettify(metaPrefix, options.color && platformColor(options.metaColor || META_COLOR)) + Formatter.prettify(message, options.color && platformColor(LEVEL_COLORS[level]));
};
// Turn a line of text into a loggable object.
// @param line {String}
// @param override {Object}
Log.objFromText = (line, override)=>{
    return _object_spread({
        message: line,
        level: "info",
        time: new Date(),
        timeInexact: true
    }, override);
};

//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"logging_server.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/logging/logging_server.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Formatter = {};
Formatter.prettify = function(line, color) {
    if (!color) return line;
    return require("chalk")[color](line);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"chalk":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/logging/node_modules/chalk/package.json                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "chalk",
  "version": "4.1.2",
  "main": "source"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"source":{"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/logging/node_modules/chalk/source/index.js                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  export: function () { return {
      Log: Log
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/logging/logging.js",
    "/node_modules/meteor/logging/logging_server.js"
  ],
  mainModulePath: "/node_modules/meteor/logging/logging.js"
}});

//# sourceURL=meteor://💻app/packages/logging.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbG9nZ2luZy9sb2dnaW5nLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9sb2dnaW5nL2xvZ2dpbmdfc2VydmVyLmpzIl0sIm5hbWVzIjpbImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiTG9nIiwiYXJncyIsImluZm8iLCJpbnRlcmNlcHQiLCJpbnRlcmNlcHRlZExpbmVzIiwic3VwcHJlc3MiLCJfaW50ZXJjZXB0IiwiY291bnQiLCJfc3VwcHJlc3MiLCJfaW50ZXJjZXB0ZWQiLCJsaW5lcyIsIm91dHB1dEZvcm1hdCIsInNob3dUaW1lIiwiTEVWRUxfQ09MT1JTIiwiZGVidWciLCJ3YXJuIiwiZXJyb3IiLCJNRVRBX0NPTE9SIiwiaXNXaW4zMiIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInBsYXRmb3JtQ29sb3IiLCJjb2xvciIsImVuZHNXaXRoIiwiUkVTVFJJQ1RFRF9LRVlTIiwiRk9STUFUVEVEX0tFWVMiLCJsb2dJbkJyb3dzZXIiLCJvYmoiLCJzdHIiLCJmb3JtYXQiLCJsZXZlbCIsImNvbnNvbGUiLCJsb2ciLCJhcHBseSIsIkZ1bmN0aW9uIiwiYmluZCIsImNhbGwiLCJfZ2V0Q2FsbGVyRGV0YWlscyIsImdldFN0YWNrIiwiZXJyIiwiRXJyb3IiLCJzdGFjayIsImxpbmUiLCJzcGxpdCIsInNsaWNlIiwibWF0Y2giLCJmaWxlIiwiZGV0YWlscyIsImV4ZWMiLCJmb3JFYWNoIiwiYXJnIiwiaW50ZXJjZXB0ZWQiLCJSZWdFeHAiLCJEYXRlIiwibWVzc2FnZSIsIlN0cmluZyIsInRvU3RyaW5nIiwia2V5Iiwib21pdENhbGxlckRldGFpbHMiLCJ0aW1lIiwiTWV0ZW9yIiwiaXNQcm9kdWN0aW9uIiwicHVzaCIsIkVKU09OIiwic3RyaW5naWZ5IiwiaXNTZXJ2ZXIiLCJwYXJzZSIsInN0YXJ0c1dpdGgiLCJvcHRpb25zIiwidGltZUluZXhhY3QiLCJsaW5lTnVtYmVyIiwiYXBwIiwiYXBwTmFtZSIsIm9yaWdpbkFwcCIsInByb2dyYW0iLCJzYXRlbGxpdGUiLCJzdGRlcnIiLCJrZXlzIiwibGVuZ3RoIiwicGFkMiIsIm4iLCJwYWRTdGFydCIsInBhZDMiLCJkYXRlU3RhbXAiLCJnZXRGdWxsWWVhciIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsInRpbWVTdGFtcCIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJ1dGNPZmZzZXRTdHIiLCJnZXRUaW1lem9uZU9mZnNldCIsImFwcEluZm8iLCJzb3VyY2VJbmZvUGFydHMiLCJzb3VyY2VJbmZvIiwiam9pbiIsInN0ZGVyckluZGljYXRvciIsInRpbWVTdHJpbmciLCJtZXRhUHJlZml4IiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJGb3JtYXR0ZXIiLCJwcmV0dGlmeSIsIm1ldGFDb2xvciIsIm9iakZyb21UZXh0Iiwib3ZlcnJpZGUiLCJyZXF1aXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXVDO0FBRXZDLE1BQU1BLFNBQVNDLE9BQU9DLFNBQVMsQ0FBQ0MsY0FBYztBQUU5QyxTQUFTQyxJQUFJLEdBQUdDLElBQUk7SUFDbEJELElBQUlFLElBQUksSUFBSUQ7QUFDZDtBQUVBLGVBQWU7QUFDZixJQUFJRSxZQUFZO0FBQ2hCLElBQUlDLG1CQUFtQixFQUFFO0FBQ3pCLElBQUlDLFdBQVc7QUFFZixpRUFBaUU7QUFDakUsa0VBQWtFO0FBQ2xFLHNCQUFzQjtBQUN0QkwsSUFBSU0sVUFBVSxHQUFHLENBQUNDO0lBQ2hCSixhQUFhSTtBQUNmO0FBRUEsc0VBQXNFO0FBQ3RFLG1FQUFtRTtBQUNuRSxrQ0FBa0M7QUFDbENQLElBQUlRLFNBQVMsR0FBRyxDQUFDRDtJQUNmRixZQUFZRTtBQUNkO0FBRUEsOERBQThEO0FBQzlEUCxJQUFJUyxZQUFZLEdBQUc7SUFDakIsTUFBTUMsUUFBUU47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USxDQUFDbEQsU0FBU2MsUUFBUTlDLEtBQUssSUFBSUQsY0FBY1IsWUFBWSxDQUFDaUIsTUFBTTtBQUV0RjtBQUVBLDhDQUE4QztBQUM5Qyx1QkFBdUI7QUFDdkIsMkJBQTJCO0FBQzNCOUIsSUFBSTBHLFdBQVcsR0FBRyxDQUFDaEUsTUFBTWlFO0lBQ3ZCLE9BQU87UUFDTHJELFNBQVNaO1FBQ1RaLE9BQU87UUFDUDZCLE1BQU0sSUFBSU47UUFDVmdCLGFBQWE7T0FDVnNDO0FBRVA7QUFFZTs7Ozs7Ozs7Ozs7OztBQ2xWZkosWUFBWSxDQUFDO0FBQ2JBLFVBQVVDLFFBQVEsR0FBRyxTQUFVOUQsSUFBSSxFQUFFcEIsS0FBSztJQUN4QyxJQUFJLENBQUNBLE9BQU8sT0FBT29CO0lBQ25CLE9BQU9rRSxRQUFRLFFBQVEsQ0FBQ3RGLE1BQU0sQ0FBQ29CO0FBQ2pDIiwiZmlsZSI6Ii9wYWNrYWdlcy9sb2dnaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcblxuY29uc3QgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gTG9nKC4uLmFyZ3MpIHtcbiAgTG9nLmluZm8oLi4uYXJncyk7XG59XG5cbi8vLyBGT1IgVEVTVElOR1xubGV0IGludGVyY2VwdCA9IDA7XG5sZXQgaW50ZXJjZXB0ZWRMaW5lcyA9IFtdO1xubGV0IHN1cHByZXNzID0gMDtcblxuLy8gSW50ZXJjZXB0IHRoZSBuZXh0ICdjb3VudCcgY2FsbHMgdG8gYSBMb2cgZnVuY3Rpb24uIFRoZSBhY3R1YWxcbi8vIGxpbmVzIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUgY2FuIGJlIGNsZWFyZWQgYW5kIHJlYWQgYnkgY2FsbGluZ1xuLy8gTG9nLl9pbnRlcmNlcHRlZCgpLlxuTG9nLl9pbnRlcmNlcHQgPSAoY291bnQpID0+IHtcbiAgaW50ZXJjZXB0ICs9IGNvdW50O1xufTtcblxuLy8gU3VwcHJlc3MgdGhlIG5leHQgJ2NvdW50JyBjYWxscyB0byBhIExvZyBmdW5jdGlvbi4gVXNlIHRoaXMgdG8gc3RvcFxuLy8gdGVzdHMgZnJvbSBzcGFtbWluZyB0aGUgY29uc29sZSwgZXNwZWNpYWxseSB3aXRoIHJlZCBlcnJvcnMgdGhhdFxuLy8gbWlnaHQgbG9vayBsaWtlIGEgZmFpbGluZyB0ZXN0LlxuTG9nLl9zdXBwcmVzcyA9IChjb3VudCkgPT4ge1xuICBzdXBwcmVzcyArPSBjb3VudDtcbn07XG5cbi8vIFJldHVybnMgaW50ZXJjZXB0ZWQgbGluZXMgYW5kIHJlc2V0cyB0aGUgaW50ZXJjZXB0IGNvdW50ZXIuXG5Mb2cuX2ludGVyY2VwdGVkID0gKCkgPT4ge1xuICBjb25zdCBsaW5lcyA9IGludGVyY2VwdGVkTGluZXM7XG4gIGludGVyY2VwdGVkTGluZXMgPSBbXTtcbiAgaW50ZXJjZXB0ID0gMDtcbiAgcmV0dXJuIGxpbmVzO1xufTtcblxuLy8gRWl0aGVyICdqc29uJyBvciAnY29sb3JlZC10ZXh0Jy5cbi8vXG4vLyBXaGVuIHRoaXMgaXMgc2V0IHRvICdqc29uJywgcHJpbnQgSlNPTiBkb2N1bWVudHMgdGhhdCBhcmUgcGFyc2VkIGJ5IGFub3RoZXJcbi8vIHByb2Nlc3MgKCdzYXRlbGxpdGUnIG9yICdtZXRlb3IgcnVuJykuIFRoaXMgb3RoZXIgcHJvY2VzcyBzaG91bGQgY2FsbFxuLy8gJ0xvZy5mb3JtYXQnIGZvciBuaWNlIG91dHB1dC5cbi8vXG4vLyBXaGVuIHRoaXMgaXMgc2V0IHRvICdjb2xvcmVkLXRleHQnLCBjYWxsICdMb2cuZm9ybWF0JyBiZWZvcmUgcHJpbnRpbmcuXG4vLyBUaGlzIHNob3VsZCBiZSB1c2VkIGZvciBsb2dnaW5nIGZyb20gd2l0aGluIHNhdGVsbGl0ZSwgc2luY2UgdGhlcmUgaXMgbm9cbi8vIG90aGVyIHByb2Nlc3MgdGhhdCB3aWxsIGJlIHJlYWRpbmcgaXRzIHN0YW5kYXJkIG91dHB1dC5cbkxvZy5vdXRwdXRGb3JtYXQgPSBcImpzb25cIjtcblxuLy8gRGVmYXVsdHMgdG8gdHJ1ZSBmb3IgbG9jYWwgZGV2ZWxvcG1lbnQgYW5kIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbi8vIGZvciBjbG91ZCBlbnZpcm9ubWVudHMgaXMgaW50ZXJlc3RpbmcgdG8gbGVhdmUgaXQgZmFsc2UgYXMgbW9zdCBvZiB0aGVtIGhhdmUgdGhlIHRpbWVzdGFtcCBpbiB0aGUgY29uc29sZS5cbi8vIE9ubHkgd29ya3MgaW4gc2VydmVyIHdpdGggY29sb3JlZC10ZXh0XG5Mb2cuc2hvd1RpbWUgPSB0cnVlO1xuXG5jb25zdCBMRVZFTF9DT0xPUlMgPSB7XG4gIGRlYnVnOiBcImdyZWVuXCIsXG4gIC8vIGxlYXZlIGluZm8gYXMgdGhlIGRlZmF1bHQgY29sb3JcbiAgd2FybjogXCJtYWdlbnRhXCIsXG4gIGVycm9yOiBcInJlZFwiLFxufTtcblxuY29uc3QgTUVUQV9DT0xPUiA9IFwiYmx1ZVwiO1xuXG4vLyBEZWZhdWx0IGNvbG9ycyBjYXVzZSByZWFkYWJpbGl0eSBwcm9ibGVtcyBvbiBXaW5kb3dzIFBvd2Vyc2hlbGwsXG4vLyBzd2l0Y2ggdG8gYnJpZ2h0IHZhcmlhbnRzLiBXaGlsZSBzdGlsbCBjYXBhYmxlIG9mIG1pbGxpb25zIG9mXG4vLyBvcGVyYXRpb25zIHBlciBzZWNvbmQsIHRoZSBiZW5jaG1hcmsgc2hvd2VkIGEgMjUlKyBpbmNyZWFzZSBpblxuLy8gb3BzIHBlciBzZWNvbmQgKG9uIE5vZGUgOCkgYnkgY2FjaGluZyBcInByb2Nlc3MucGxhdGZvcm1cIi5cbmNvbnN0IGlzV2luMzIgPSB0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCI7XG5jb25zdCBwbGF0Zm9ybUNvbG9yID0gKGNvbG9yKSA9PiB7XG4gIGlmIChpc1dpbjMyICYmIHR5cGVvZiBjb2xvciA9PT0gXCJzdHJpbmdcIiAmJiAhY29sb3IuZW5kc1dpdGgoXCJCcmlnaHRcIikpIHtcbiAgICByZXR1cm4gYCR7Y29sb3J9QnJpZ2h0YDtcbiAgfVxuICByZXR1cm4gY29sb3I7XG59O1xuXG4vLyBYWFggcGFja2FnZVxuY29uc3QgUkVTVFJJQ1RFRF9LRVlTID0gW1xuICBcInRpbWVcIixcbiAgXCJ0aW1lSW5leGFjdFwiLFxuICBcImxldmVsXCIsXG4gIFwiZmlsZVwiLFxuICBcImxpbmVcIixcbiAgXCJwcm9ncmFtXCIsXG4gIFwib3JpZ2luQXBwXCIsXG4gIFwic2F0ZWxsaXRlXCIsXG4gIFwic3RkZXJyXCIsXG5dO1xuXG5jb25zdCBGT1JNQVRURURfS0VZUyA9IFsuLi5SRVNUUklDVEVEX0tFWVMsIFwiYXBwXCIsIFwibWVzc2FnZVwiXTtcblxuY29uc3QgbG9nSW5Ccm93c2VyID0gKG9iaikgPT4ge1xuICBjb25zdCBzdHIgPSBMb2cuZm9ybWF0KG9iaik7XG5cbiAgLy8gWFhYIFNvbWUgbGV2ZWxzIHNob3VsZCBiZSBwcm9iYWJseSBiZSBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgY29uc3QgbGV2ZWwgPSBvYmoubGV2ZWw7XG5cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGVbbGV2ZWxdKSB7XG4gICAgY29uc29sZVtsZXZlbF0oc3RyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJRSBkb2Vzbid0IGhhdmUgY29uc29sZS5sb2cuYXBwbHksIGl0J3Mgbm90IGEgcmVhbCBPYmplY3QuXG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NTM4OTcyL2NvbnNvbGUtbG9nLWFwcGx5LW5vdC13b3JraW5nLWluLWllOVxuICAgIC8vIGh0dHA6Ly9wYXRpay5jb20vYmxvZy9jb21wbGV0ZS1jcm9zcy1icm93c2VyLWNvbnNvbGUtbG9nL1xuICAgIGlmICh0eXBlb2YgY29uc29sZS5sb2cuYXBwbHkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gTW9zdCBicm93c2Vyc1xuICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgW3N0cl0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIElFOVxuICAgICAgY29uc3QgbG9nID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSk7XG4gICAgICBsb2cuYXBwbHkoY29uc29sZSwgW3N0cl0pO1xuICAgIH1cbiAgfVxufTtcblxuLy8gQHJldHVybnMge09iamVjdDogeyBsaW5lOiBOdW1iZXIsIGZpbGU6IFN0cmluZyB9fVxuTG9nLl9nZXRDYWxsZXJEZXRhaWxzID0gKCkgPT4ge1xuICBjb25zdCBnZXRTdGFjayA9ICgpID0+IHtcbiAgICAvLyBXZSBkbyBOT1QgdXNlIEVycm9yLnByZXBhcmVTdGFja1RyYWNlIGhlcmUgKGEgVjggZXh0ZW5zaW9uIHRoYXQgZ2V0cyB1cyBhXG4gICAgLy8gcHJlLXBhcnNlZCBzdGFjaykgc2luY2UgaXQncyBpbXBvc3NpYmxlIHRvIGNvbXBvc2UgaXQgd2l0aCB0aGUgdXNlIG9mXG4gICAgLy8gRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgdXNlZCBvbiB0aGUgc2VydmVyIGZvciBzb3VyY2UgbWFwcy5cbiAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICBjb25zdCBzdGFjayA9IGVyci5zdGFjaztcbiAgICByZXR1cm4gc3RhY2s7XG4gIH07XG5cbiAgY29uc3Qgc3RhY2sgPSBnZXRTdGFjaygpO1xuXG4gIGlmICghc3RhY2spIHJldHVybiB7fTtcblxuICAvLyBsb29raW5nIGZvciB0aGUgZmlyc3QgbGluZSBvdXRzaWRlIHRoZSBsb2dnaW5nIHBhY2thZ2UgKG9yIGFuXG4gIC8vIGV2YWwgaWYgd2UgZmluZCB0aGF0IGZpcnN0KVxuICBsZXQgbGluZTtcbiAgY29uc3QgbGluZXMgPSBzdGFjay5zcGxpdChcIlxcblwiKS5zbGljZSgxKTtcbiAgZm9yIChsaW5lIG9mIGxpbmVzKSB7XG4gICAgaWYgKGxpbmUubWF0Y2goL15cXHMqKGF0IGV2YWwgXFwoZXZhbCl8KGV2YWw6KS8pKSB7XG4gICAgICByZXR1cm4geyBmaWxlOiBcImV2YWxcIiB9O1xuICAgIH1cblxuICAgIGlmICghbGluZS5tYXRjaCgvcGFja2FnZXNcXC8oPzpsb2NhbC10ZXN0WzpfXSk/bG9nZ2luZyg/OlxcL3xcXC5qcykvKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGV0YWlscyA9IHt9O1xuXG4gIC8vIFRoZSBmb3JtYXQgZm9yIEZGIGlzICdmdW5jdGlvbk5hbWVAZmlsZVBhdGg6bGluZU51bWJlcidcbiAgLy8gVGhlIGZvcm1hdCBmb3IgVjggaXMgJ2Z1bmN0aW9uTmFtZSAocGFja2FnZXMvbG9nZ2luZy9sb2dnaW5nLmpzOjgxKScgb3JcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgJ3BhY2thZ2VzL2xvZ2dpbmcvbG9nZ2luZy5qczo4MSdcbiAgY29uc3QgbWF0Y2ggPSAvKD86W0AoXXwgYXQgKShbXihdKz8pOihbMC05Ol0rKSg/OlxcKXwkKS8uZXhlYyhsaW5lKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiBkZXRhaWxzO1xuICB9XG5cbiAgLy8gaW4gY2FzZSB0aGUgbWF0Y2hlZCBibG9jayBoZXJlIGlzIGxpbmU6Y29sdW1uXG4gIGRldGFpbHMubGluZSA9IG1hdGNoWzJdLnNwbGl0KFwiOlwiKVswXTtcblxuICAvLyBQb3NzaWJsZSBmb3JtYXQ6IGh0dHBzOi8vZm9vLmJhci5jb20vc2NyaXB0cy9maWxlLmpzP3JhbmRvbT1mb29iYXJcbiAgLy8gWFhYOiBpZiB5b3UgY2FuIHdyaXRlIHRoZSBmb2xsb3dpbmcgaW4gYmV0dGVyIHdheSwgcGxlYXNlIGRvIGl0XG4gIC8vIFhYWDogd2hhdCBhYm91dCBldmFscz9cbiAgZGV0YWlscy5maWxlID0gbWF0Y2hbMV0uc3BsaXQoXCIvXCIpLnNsaWNlKC0xKVswXS5zcGxpdChcIj9cIilbMF07XG5cbiAgcmV0dXJuIGRldGFpbHM7XG59O1xuXG5bXCJkZWJ1Z1wiLCBcImluZm9cIiwgXCJ3YXJuXCIsIFwiZXJyb3JcIl0uZm9yRWFjaCgobGV2ZWwpID0+IHtcbiAgLy8gQHBhcmFtIGFyZyB7U3RyaW5nfE9iamVjdH1cbiAgTG9nW2xldmVsXSA9IChhcmcpID0+IHtcbiAgICBpZiAoc3VwcHJlc3MpIHtcbiAgICAgIHN1cHByZXNzLS07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGludGVyY2VwdGVkID0gZmFsc2U7XG4gICAgaWYgKGludGVyY2VwdCkge1xuICAgICAgaW50ZXJjZXB0LS07XG4gICAgICBpbnRlcmNlcHRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgbGV0IG9iaiA9XG4gICAgICBhcmcgPT09IE9iamVjdChhcmcpICYmICEoYXJnIGluc3RhbmNlb2YgUmVnRXhwKSAmJiAhKGFyZyBpbnN0YW5jZW9mIERhdGUpXG4gICAgICAgID8gYXJnXG4gICAgICAgIDogeyBtZXNzYWdlOiBuZXcgU3RyaW5nKGFyZykudG9TdHJpbmcoKSB9O1xuXG4gICAgUkVTVFJJQ1RFRF9LRVlTLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKG9ialtrZXldKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3Qgc2V0ICcke2tleX0nIGluIGxvZyBtZXNzYWdlYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBcIm1lc3NhZ2VcIikgJiYgdHlwZW9mIG9iai5tZXNzYWdlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgJ21lc3NhZ2UnIGZpZWxkIGluIGxvZyBvYmplY3RzIG11c3QgYmUgYSBzdHJpbmdcIik7XG4gICAgfVxuXG4gICAgaWYgKCFvYmoub21pdENhbGxlckRldGFpbHMpIHtcbiAgICAgIG9iaiA9IHsgLi4uTG9nLl9nZXRDYWxsZXJEZXRhaWxzKCksIC4uLm9iaiB9O1xuICAgIH1cblxuICAgIG9iai50aW1lID0gbmV3IERhdGUoKTtcbiAgICBvYmoubGV2ZWwgPSBsZXZlbDtcblxuICAgIC8vIElmIHdlIGFyZSBpbiBwcm9kdWN0aW9uIGRvbid0IHdyaXRlIG91dCBkZWJ1ZyBsb2dzLlxuICAgIGlmIChsZXZlbCA9PT0gXCJkZWJ1Z1wiICYmIE1ldGVvci5pc1Byb2R1Y3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJjZXB0ZWQpIHtcbiAgICAgIGludGVyY2VwdGVkTGluZXMucHVzaChFSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgfSBlbHNlIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIGlmIChMb2cub3V0cHV0Rm9ybWF0ID09PSBcImNvbG9yZWQtdGV4dFwiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKExvZy5mb3JtYXQob2JqLCB7IGNvbG9yOiB0cnVlIH0pKTtcbiAgICAgIH0gZWxzZSBpZiAoTG9nLm91dHB1dEZvcm1hdCA9PT0gXCJqc29uXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coRUpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGxvZ2dpbmcgb3V0cHV0IGZvcm1hdDogJHtMb2cub3V0cHV0Rm9ybWF0fWApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2dJbkJyb3dzZXIob2JqKTtcbiAgICB9XG4gIH07XG59KTtcblxuLy8gdHJpZXMgdG8gcGFyc2UgbGluZSBhcyBFSlNPTi4gcmV0dXJucyBvYmplY3QgaWYgcGFyc2UgaXMgc3VjY2Vzc2Z1bCwgb3IgbnVsbCBpZiBub3RcbkxvZy5wYXJzZSA9IChsaW5lKSA9PiB7XG4gIGxldCBvYmogPSBudWxsO1xuICBpZiAobGluZSAmJiBsaW5lLnN0YXJ0c1dpdGgoXCJ7XCIpKSB7XG4gICAgLy8gbWlnaHQgYmUganNvbiBnZW5lcmF0ZWQgZnJvbSBjYWxsaW5nICdMb2cnXG4gICAgdHJ5IHtcbiAgICAgIG9iaiA9IEVKU09OLnBhcnNlKGxpbmUpO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXG4gIC8vIFhYWCBzaG91bGQgcHJvYmFibHkgY2hlY2sgZmllbGRzIG90aGVyIHRoYW4gJ3RpbWUnXG4gIGlmIChvYmogJiYgb2JqLnRpbWUgJiYgb2JqLnRpbWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuLy8gZm9ybWF0cyBhIGxvZyBvYmplY3QgaW50byBjb2xvcmVkIGh1bWFuIGFuZCBtYWNoaW5lLXJlYWRhYmxlIHRleHRcbkxvZy5mb3JtYXQgPSAob2JqLCBvcHRpb25zID0ge30pID0+IHtcbiAgb2JqID0geyAuLi5vYmogfTsgLy8gZG9uJ3QgbXV0YXRlIHRoZSBhcmd1bWVudFxuICBjb25zdCB7XG4gICAgdGltZSxcbiAgICB0aW1lSW5leGFjdCxcbiAgICBsZXZlbCA9IFwiaW5mb1wiLFxuICAgIGZpbGUsXG4gICAgbGluZTogbGluZU51bWJlcixcbiAgICBhcHA6IGFwcE5hbWUgPSBcIlwiLFxuICAgIG9yaWdpbkFwcCxcbiAgICBwcm9ncmFtID0gXCJcIixcbiAgICBzYXRlbGxpdGUgPSBcIlwiLFxuICAgIHN0ZGVyciA9IFwiXCIsXG4gIH0gPSBvYmo7XG4gIGxldCB7IG1lc3NhZ2UgPSBcIlwiIH0gPSBvYmo7XG5cbiAgaWYgKCEodGltZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiJ3RpbWUnIG11c3QgYmUgYSBEYXRlIG9iamVjdFwiKTtcbiAgfVxuXG4gIEZPUk1BVFRFRF9LRVlTLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgfSk7XG5cbiAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID4gMCkge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlICs9IFwiIFwiO1xuICAgIH1cbiAgICBtZXNzYWdlICs9IEVKU09OLnN0cmluZ2lmeShvYmopO1xuICB9XG5cbiAgY29uc3QgcGFkMiA9IChuKSA9PiBuLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBwYWQzID0gKG4pID0+IG4udG9TdHJpbmcoKS5wYWRTdGFydCgzLCBcIjBcIik7XG5cbiAgY29uc3QgZGF0ZVN0YW1wID1cbiAgICB0aW1lLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKSArIHBhZDIodGltZS5nZXRNb250aCgpICsgMSAvKjAtYmFzZWQqLykgKyBwYWQyKHRpbWUuZ2V0RGF0ZSgpKTtcbiAgY29uc3QgdGltZVN0YW1wID0gYCR7cGFkMih0aW1lLmdldEhvdXJzKCkpfToke3BhZDIodGltZS5nZXRNaW51dGVzKCkpfToke3BhZDIodGltZS5nZXRTZWNvbmRzKCkpfS4ke3BhZDModGltZS5nZXRNaWxsaXNlY29uZHMoKSl9YDtcblxuICAvLyBlZyBpbiBTYW4gRnJhbmNpc2NvIGluIEp1bmUgdGhpcyB3aWxsIGJlICcoLTcpJ1xuICBjb25zdCB1dGNPZmZzZXRTdHIgPSBgKCR7LShuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MCl9KWA7XG5cbiAgbGV0IGFwcEluZm8gPSBcIlwiO1xuICBpZiAoYXBwTmFtZSkge1xuICAgIGFwcEluZm8gKz0gYXBwTmFtZTtcbiAgfVxuICBpZiAob3JpZ2luQXBwICYmIG9yaWdpbkFwcCAhPT0gYXBwTmFtZSkge1xuICAgIGFwcEluZm8gKz0gYCB2aWEgJHtvcmlnaW5BcHB9YDtcbiAgfVxuICBpZiAoYXBwSW5mbykge1xuICAgIGFwcEluZm8gPSBgWyR7YXBwSW5mb31dIGA7XG4gIH1cblxuICBjb25zdCBzb3VyY2VJbmZvUGFydHMgPSBbXTtcbiAgaWYgKHByb2dyYW0pIHtcbiAgICBzb3VyY2VJbmZvUGFydHMucHVzaChwcm9ncmFtKTtcbiAgfVxuICBpZiAoZmlsZSkge1xuICAgIHNvdXJjZUluZm9QYXJ0cy5wdXNoKGZpbGUpO1xuICB9XG4gIGlmIChsaW5lTnVtYmVyKSB7XG4gICAgc291cmNlSW5mb1BhcnRzLnB1c2gobGluZU51bWJlcik7XG4gIH1cblxuICBsZXQgc291cmNlSW5mbyA9ICFzb3VyY2VJbmZvUGFydHMubGVuZ3RoID8gXCJcIiA6IGAoJHtzb3VyY2VJbmZvUGFydHMuam9pbihcIjpcIil9KSBgO1xuXG4gIGlmIChzYXRlbGxpdGUpIHNvdXJjZUluZm8gKz0gYFske3NhdGVsbGl0ZX1dYDtcblxuICBjb25zdCBzdGRlcnJJbmRpY2F0b3IgPSBzdGRlcnIgPyBcIihTVERFUlIpIFwiIDogXCJcIjtcblxuICBjb25zdCB0aW1lU3RyaW5nID0gTG9nLnNob3dUaW1lXG4gICAgPyBgJHtkYXRlU3RhbXB9LSR7dGltZVN0YW1wfSR7dXRjT2Zmc2V0U3RyfSR7dGltZUluZXhhY3QgPyBcIj8gXCIgOiBcIiBcIn1gXG4gICAgOiBcIiBcIjtcblxuICBjb25zdCBtZXRhUHJlZml4ID0gW1xuICAgIGxldmVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpLFxuICAgIHRpbWVTdHJpbmcsXG4gICAgYXBwSW5mbyxcbiAgICBzb3VyY2VJbmZvLFxuICAgIHN0ZGVyckluZGljYXRvcixcbiAgXS5qb2luKFwiXCIpO1xuXG4gIHJldHVybiAoXG4gICAgRm9ybWF0dGVyLnByZXR0aWZ5KFxuICAgICAgbWV0YVByZWZpeCxcbiAgICAgIG9wdGlvbnMuY29sb3IgJiYgcGxhdGZvcm1Db2xvcihvcHRpb25zLm1ldGFDb2xvciB8fCBNRVRBX0NPTE9SKSxcbiAgICApICsgRm9ybWF0dGVyLnByZXR0aWZ5KG1lc3NhZ2UsIG9wdGlvbnMuY29sb3IgJiYgcGxhdGZvcm1Db2xvcihMRVZFTF9DT0xPUlNbbGV2ZWxdKSlcbiAgKTtcbn07XG5cbi8vIFR1cm4gYSBsaW5lIG9mIHRleHQgaW50byBhIGxvZ2dhYmxlIG9iamVjdC5cbi8vIEBwYXJhbSBsaW5lIHtTdHJpbmd9XG4vLyBAcGFyYW0gb3ZlcnJpZGUge09iamVjdH1cbkxvZy5vYmpGcm9tVGV4dCA9IChsaW5lLCBvdmVycmlkZSkgPT4ge1xuICByZXR1cm4ge1xuICAgIG1lc3NhZ2U6IGxpbmUsXG4gICAgbGV2ZWw6IFwiaW5mb1wiLFxuICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgdGltZUluZXhhY3Q6IHRydWUsXG4gICAgLi4ub3ZlcnJpZGUsXG4gIH07XG59O1xuXG5leHBvcnQgeyBMb2cgfTtcbiIsIkZvcm1hdHRlciA9IHt9O1xuRm9ybWF0dGVyLnByZXR0aWZ5ID0gZnVuY3Rpb24gKGxpbmUsIGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHJldHVybiBsaW5lO1xuICByZXR1cm4gcmVxdWlyZShcImNoYWxrXCIpW2NvbG9yXShsaW5lKTtcbn07XG4iXX0=
