Package["core-runtime"].queue("webapp",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Boilerplate = Package['boilerplate-generator'].Boilerplate;
var WebAppHashing = Package['webapp-hashing'].WebAppHashing;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var WebApp, WebAppInternals, main;

var require = meteorInstall({"node_modules":{"meteor":{"webapp":{"webapp_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/webapp/webapp_server.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({WebApp:()=>WebApp,WebAppInternals:()=>WebAppInternals,getGroupInfo:()=>getGroupInfo},true);let assert;module.link('assert',{default(v){assert=v}},0);let readFileSync,chmodSync,chownSync;module.link('fs',{readFileSync(v){readFileSync=v},chmodSync(v){chmodSync=v},chownSync(v){chownSync=v}},1);let createServer;module.link('http',{createServer(v){createServer=v}},2);let userInfo;module.link('os',{userInfo(v){userInfo=v}},3);let pathJoin,pathDirname;module.link('path',{join(v){pathJoin=v},dirname(v){pathDirname=v}},4);let createHash;module.link('crypto',{createHash(v){createHash=v}},5);let express;module.link('express',{default(v){express=v}},6);let compress;module.link('compression',{default(v){compress=v}},7);let cookieParser;module.link('cookie-parser',{default(v){cookieParser=v}},8);let qs;module.link('qs',{default(v){qs=v}},9);let parseRequest;module.link('parseurl',{default(v){parseRequest=v}},10);let lookupUserAgent;module.link('useragent-ng',{lookup(v){lookupUserAgent=v}},11);let isModern;module.link('meteor/modern-browsers',{isModern(v){isModern=v}},12);let send;module.link('send',{default(v){send=v}},13);let removeExistingSocketFile,registerSocketFileCleanup;module.link('./socket_file.js',{removeExistingSocketFile(v){removeExistingSocketFile=v},registerSocketFileCleanup(v){registerSocketFileCleanup=v}},14);let cluster;module.link('cluster',{default(v){cluster=v}},15);let execSync;module.link('child_process',{execSync(v){execSync=v}},16);let onMessage;module.link('meteor/inter-process-messaging',{onMessage(v){onMessage=v}},17);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _define_property(obj, key, value) {
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


















var SHORT_SOCKET_TIMEOUT = 5 * 1000;
var LONG_SOCKET_TIMEOUT = 120 * 1000;
const createExpressApp = ()=>{
    const app = express();
    // Security and performace headers
    // these headers come from these docs: https://expressjs.com/en/api.html#app.settings.table
    app.set('x-powered-by', false);
    app.set('etag', false);
    app.set('query parser', qs.parse);
    return app;
};
const WebApp = {};
const WebAppInternals = {};
const hasOwn = Object.prototype.hasOwnProperty;
WebAppInternals.NpmModules = {
    express: {
        version: Npm.require('express/package.json').version,
        module: express
    }
};
// More of a convenience for the end user
WebApp.express = express;
// Though we might prefer to use web.browser (modern) as the default
// architecture, safety requires a more compatible defaultArch.
WebApp.defaultArch = 'web.browser.legacy';
// XXX maps archs to manifests
WebApp.clientPrograms = {};
// XXX maps archs to program path on filesystem
var archPath = {};
var bundledJsCssUrlRewriteHook = function(url) {
    var bundledPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
    return bundledPrefix + url;
};
var sha1 = function(contents) {
    var hash = createHash('sha1');
    hash.update(contents);
    return hash.digest('hex');
};
function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
    }
    // fallback to standard filter function
    return compress.filter(req, res);
}
// #BrowserIdentification
//
// We have multiple places that want to identify the browser: the
// unsupported browser page, the appcache package, and, eventually
// delivering browser polyfills only as needed.
//
// To avoid detecting the browser in multiple places ad-hoc, we create a
// Meteor "browser" object. It uses but does not expose the npm
// useragent module (we could choose a different mechanism to identify
// the browser in the future if we wanted to).  The browser object
// contains
//
// * `name`: the name of the browser in camel case
// * `major`, `minor`, `patch`: integers describing the browser version
//
// Also here is an early version of a Meteor `request` object, intended
// to be a high-level description of the request without exposing
// details of Express's low-level `req`.  Currently it contains:
//
// * `browser`: browser identification object described above
// * `url`: parsed url, including parsed query params
//
// As a temporary hack there is a `categorizeRequest` function on WebApp which
// converts a Express `req` to a Meteor `request`. This can go away once smart
// packages such as appcache are being passed a `request` object directly when
// they serve content.
//
// This allows `request` to be used uniformly: it is passed to the html
// attributes hook, and the appcache package can use it when deciding
// whether to generate a 404 for the manifest.
//
// Real routing / server side rendering will probably refactor this
// heavily.
// e.g. "Mobile Safari" => "mobileSafari"
var camelCase = function(name) {
    var parts = name.split(' ');
    parts[0] = parts[0].toLowerCase();
    for(var i = 1; i < parts.length; ++i){
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }
    return parts.join('');
};
var identifyBrowser = function(userAgentString) {
    if (!userAgentString) {
        return {
            name: 'unknown',
            major: 0,
            minor: 0,
            patch: 0
        };
    }
    var userAgent = lookupUserAgent(userAgentString);
    return {
        name: camelCase(userAgent.family),
        major: +userAgent.major,
        minor: +userAgent.minor,
        patch: +userAgent.patch
    };
};
// XXX Refactor as part of implementing real routing.
WebAppInternals.identifyBrowser = identifyBrowser;
WebApp.categorizeRequest = function(req) {
    if (req.browser && req.arch && typeof req.modern === 'boolean') {
        // Already categorized.
        return req;
    }
    const browser = identifyBrowser(req.headers['user-agent']);
    const modern = isModern(browser);
    const path = typeof req.pathname === 'string' ? req.pathname : parseRequest(req).pathname;
    const categorized = {
        browser,
        modern,
        path,
        arch: WebApp.defaultArch,
        url: {
            query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
        },
        dynamicHead: req.dynamicHead,
        dynamicBody: req.dynamicBody,
        headers: req.headers,
        cookies: req.cookies
    };
    const pathParts = path.split('/');
    const archKey = pathParts[1];
    if (archKey.startsWith('__')) {
        const archCleaned = 'web.' + archKey.slice(2);
        if (hasOwn.call(WebApp.clientPrograms, archCleaned)) {
            pathParts.splice(1, 1); // Remove the archKey part.
            return Object.assign(categorized, {
                arch: archCleaned,
                path: pathParts.join('/')
            });
        }
    }
    // TODO Perhaps one day we could infer Cordova clients here, so that we
    // wouldn't have to use prefixed "/__cordova/..." URLs.
    const preferredArchOrder = isModern(browser) ? [
        'web.browser',
        'web.browser.legacy'
    ] : [
        'web.browser.legacy',
        'web.browser'
    ];
    for (const arch of preferredArchOrder){
        // If our preferred arch is not available, it's better to use another
        // client arch that is available than to guarantee the site won't work
        // by returning an unknown arch. For example, if web.browser.legacy is
        // excluded using the --exclude-archs command-line option, legacy
        // clients are better off receiving web.browser (which might actually
        // work) than receiving an HTTP 404 response. If none of the archs in
        // preferredArchOrder are defined, only then should we send a 404.
        if (hasOwn.call(WebApp.clientPrograms, arch)) {
            return Object.assign(categorized, {
                arch
            });
        }
    }
    return categorized;
};
// HTML attribute hooks: functions to be called to determine any attributes to
// be added to the '<html>' tag. Each function is passed a 'request' object (see
// #BrowserIdentification) and should return null or object.
var htmlAttributeHooks = [];
var getHtmlAttributes = function(request) {
    var combinedAttributes = {};
    (htmlAttributeHooks || []).forEach(function(hook) {
        var attributes = hook(request);
        if (attributes === null) return;
        if (typeof attributes !== 'object') throw Error('HTML attribute hook must return null or object');
        Object.assign(combinedAttributes, attributes);
    });
    return combinedAttributes;
};
WebApp.addHtmlAttributeHook = function(hook) {
    htmlAttributeHooks.push(hook);
};
// Serve app HTML for this URL?
var appUrl = function(url) {
    if (url === '/favicon.ico' || url === '/robots.txt') return false;
    // NOTE: app.manifest is not a web standard like favicon.ico and
    // robots.txt. It is a file name we have chosen to use for HTML5
    // appcache URLs. It is included here to prevent using an appcache
    // then removing it from poisoning an app permanently. Eventually,
    // once we have server side routing, this won't be needed as
    // unknown URLs with return a 404 automatically.
    if (url === '/app.manifest') return false;
    // Avoid serving app HTML for declared routes such as /sockjs/.
    if (RoutePolicy.classify(url)) return false;
    // we currently return app HTML on all URLs by default
    return true;
};
// We need to calculate the client hash after all packages have loaded
// to give them a chance to populate __meteor_runtime_config__.
//
// Calculating the hash during startup means that packages can only
// populate __meteor_runtime_config__ during load, not during startup.
//
// Calculating instead it at the beginning of main after all startup
// hooks had run would allow packages to also populate
// __meteor_runtime_config__ during startup, but that's too late for
// autoupdate because it needs to have the client hash at startup to
// insert the auto update version itself into
// __meteor_runtime_config__ to get it to the client.
//
// An alternative would be to give autoupdate a "post-start,
// pre-listen" hook to allow it to insert the auto update version at
// the right moment.
Meteor.startup(function() {
    function getter(key) {
        return function(arch) {
            arch = arch || WebApp.defaultArch;
            const program = WebApp.clientPrograms[arch];
            const value = program && program[key];
            // If this is the first time we have calculated this hash,
            // program[key] will be a thunk (lazy function with no parameters)
            // that we should call to do the actual computation.
            return typeof value === 'function' ? program[key] = value() : value;
        };
    }
    WebApp.calculateClientHash = WebApp.clientHash = getter('version');
    WebApp.calculateClientHashRefreshable = getter('versionRefreshable');
    WebApp.calculateClientHashNonRefreshable = getter('versionNonRefreshable');
    WebApp.calculateClientHashReplaceable = getter('versionReplaceable');
    WebApp.getRefreshableAssets = getter('refreshableAssets');
});
// When we have a request pending, we want the socket timeout to be long, to
// give ourselves a while to serve it, and to allow sockjs long polls to
// complete.  On the other hand, we want to close idle sockets relatively
// quickly, so that we can shut down relatively promptly but cleanly, without
// cutting off anyone's response.
WebApp._timeoutAdjustmentRequestCallback = function(req, res) {
    // this is really just req.socket.setTimeout(LONG_SOCKET_TIMEOUT);
    req.setTimeout(LONG_SOCKET_TIMEOUT);
    // Insert our new finish listener to run BEFORE the existing one which removes
    // the response from the socket.
    var finishListeners = res.listeners('finish');
    // XXX Apparently in Node 0.12 this event was called 'prefinish'.
    // https://github.com/joyent/node/commit/7c9b6070
    // But it has switched back to 'finish' in Node v4:
    // https://github.com/nodejs/node/pull/1411
    res.removeAllListeners('finish');
    res.on('finish', function() {
        res.setTimeout(SHORT_SOCKET_TIMEOUT);
    });
    Object.values(finishListeners).forEach(function(l) {
        res.on('finish', l);
    });
};
// Will be updated by main before we listen.
// Map from client arch to boilerplate object.
// Boilerplate object has:
//   - func: XXX
//   - baseData: XXX
var boilerplateByArch = {};
// Register a callback function that can selectively modify boilerplate
// data given arguments (request, data, arch). The key should be a unique
// identifier, to prevent accumulating duplicate callbacks from the same
// call site over time. Callbacks will be called in the order they were
// registered. A callback should return false if it did not make any
// changes affecting the boilerplate. Passing null deletes the callback.
// Any previous callback registered for this key will be returned.
const boilerplateDataCallbacks = Object.create(null);
WebAppInternals.registerBoilerplateDataCallback = function(key, callback) {
    const previousCallback = boilerplateDataCallbacks[key];
    if (typeof callback === 'function') {
        boilerplateDataCallbacks[key] = callback;
    } else {
        assert.strictEqual(callback, null);
        delete boilerplateDataCallbacks[key];
    }
    // Return the previous callback in case the new callback needs to call
    // it; for example, when the new callback is a wrapper for the old.
    return previousCallback || null;
};
// Given a request (as returned from `categorizeRequest`), return the
// boilerplate HTML to serve for that request.
//
// If a previous Express middleware has rendered content for the head or body,
// returns the boilerplate with that content patched in otherwise
// memoizes on HTML attributes (used by, eg, appcache) and whether inline
// scripts are currently allowed.
// XXX so far this function is always called with arch === 'web.browser'
function getBoilerplate(request, arch) {
    return getBoilerplateAsync(request, arch);
}
/**
 * @summary Takes a runtime configuration object and
 * returns an encoded runtime string.
 * @locus Server
 * @param {Object} rtimeConfig
 * @returns {String}
 */ WebApp.encodeRuntimeConfig = function(rtimeConfig) {
    return JSON.stringify(encodeURIComponent(JSON.stringify(rtimeConfig)));
};
/**
 * @summary Takes an encoded runtime string and returns
 * a runtime configuration object.
 * @locus Server
 * @param {String} rtimeConfigString
 * @returns {Object}
 */ WebApp.decodeRuntimeConfig = function(rtimeConfigStr) {
    return JSON.parse(decodeURIComponent(JSON.parse(rtimeConfigStr)));
};
const runtimeConfig = {
    // hooks will contain the callback functions
    // set by the caller to addRuntimeConfigHook
    hooks: new Hook(),
    // updateHooks will contain the callback functions
    // set by the caller to addUpdatedNotifyHook
    updateHooks: new Hook(),
    // isUpdatedByArch is an object containing fields for each arch
    // that this server supports.
    // - Each field will be true when the server updates the runtimeConfig for that arch.
    // - When the hook callback is called the update field in the callback object will be
    // set to isUpdatedByArch[arch].
    // = isUpdatedyByArch[arch] is reset to false after the callback.
    // This enables the caller to cache data efficiently so they do not need to
    // decode & update data on every callback when the runtimeConfig is not changing.
    isUpdatedByArch: {}
};
/**
 * @name addRuntimeConfigHookCallback(options)
 * @locus Server
 * @isprototype true
 * @summary Callback for `addRuntimeConfigHook`.
 *
 * If the handler returns a _falsy_ value the hook will not
 * modify the runtime configuration.
 *
 * If the handler returns a _String_ the hook will substitute
 * the string for the encoded configuration string.
 *
 * **Warning:** the hook does not check the return value at all it is
 * the responsibility of the caller to get the formatting correct using
 * the helper functions.
 *
 * `addRuntimeConfigHookCallback` takes only one `Object` argument
 * with the following fields:
 * @param {Object} options
 * @param {String} options.arch The architecture of the client
 * requesting a new runtime configuration. This can be one of
 * `web.browser`, `web.browser.legacy` or `web.cordova`.
 * @param {Object} options.request
 * A NodeJs [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * https://nodejs.org/api/http.html#http_class_http_incomingmessage
 * `Object` that can be used to get information about the incoming request.
 * @param {String} options.encodedCurrentConfig The current configuration object
 * encoded as a string for inclusion in the root html.
 * @param {Boolean} options.updated `true` if the config for this architecture
 * has been updated since last called, otherwise `false`. This flag can be used
 * to cache the decoding/encoding for each architecture.
 */ /**
 * @summary Hook that calls back when the meteor runtime configuration,
 * `__meteor_runtime_config__` is being sent to any client.
 *
 * **returns**: <small>_Object_</small> `{ stop: function, callback: function }`
 * - `stop` <small>_Function_</small> Call `stop()` to stop getting callbacks.
 * - `callback` <small>_Function_</small> The passed in `callback`.
 * @locus Server
 * @param {addRuntimeConfigHookCallback} callback
 * See `addRuntimeConfigHookCallback` description.
 * @returns {Object} {{ stop: function, callback: function }}
 * Call the returned `stop()` to stop getting callbacks.
 * The passed in `callback` is returned also.
 */ WebApp.addRuntimeConfigHook = function(callback) {
    return runtimeConfig.hooks.register(callback);
};
function getBoilerplateAsync(request, arch, response) {
    return _async_to_generator(function*() {
        let boilerplate = boilerplateByArch[arch];
        yield runtimeConfig.hooks.forEachAsync((hook)=>_async_to_generator(function*() {
                const meteorRuntimeConfig = yield hook({
                    arch,
                    request,
                    encodedCurrentConfig: boilerplate.baseData.meteorRuntimeConfig,
                    updated: runtimeConfig.isUpdatedByArch[arch]
                });
                if (!meteorRuntimeConfig) return true;
                boilerplate.baseData = Object.assign({}, boilerplate.baseData, {
                    meteorRuntimeConfig
                });
                return true;
            })());
        runtimeConfig.isUpdatedByArch[arch] = false;
        const { dynamicHead, dynamicBody } = request;
        const data = Object.assign({}, boilerplate.baseData, {
            htmlAttributes: getHtmlAttributes(request)
        }, {
            dynamicHead,
            dynamicBody
        });
        let madeChanges = false;
        let promise = Promise.resolve();
        Object.keys(boilerplateDataCallbacks).forEach((key)=>{
            promise = promise.then(()=>{
                const callback = boilerplateDataCallbacks[key];
                return callback(request, data, arch, response);
            }).then((result)=>{
                // Callbacks should return false if they did not make any changes.
                if (result !== false) {
                    madeChanges = true;
                }
            });
        });
        return promise.then(()=>({
                stream: boilerplate.toHTMLStream(data),
                statusCode: data.statusCode,
                headers: data.headers
            }));
    })();
}
/**
 * @name addUpdatedNotifyHookCallback(options)
 * @summary callback handler for `addupdatedNotifyHook`
 * @isprototype true
 * @locus Server
 * @param {Object} options
 * @param {String} options.arch The architecture that is being updated.
 * This can be one of `web.browser`, `web.browser.legacy` or `web.cordova`.
 * @param {Object} options.manifest The new updated manifest object for
 * this `arch`.
 * @param {Object} options.runtimeConfig The new updated configuration
 * object for this `arch`.
 */ /**
 * @summary Hook that runs when the meteor runtime configuration
 * is updated.  Typically the configuration only changes during development mode.
 * @locus Server
 * @param {addUpdatedNotifyHookCallback} handler
 * The `handler` is called on every change to an `arch` runtime configuration.
 * See `addUpdatedNotifyHookCallback`.
 * @returns {Object} {{ stop: function, callback: function }}
 */ WebApp.addUpdatedNotifyHook = function(handler) {
    return runtimeConfig.updateHooks.register(handler);
};
WebAppInternals.generateBoilerplateInstance = function(arch, manifest, additionalOptions) {
    additionalOptions = additionalOptions || {};
    runtimeConfig.isUpdatedByArch[arch] = true;
    const rtimeConfig = _object_spread({}, __meteor_runtime_config__, additionalOptions.runtimeConfigOverrides || {});
    runtimeConfig.updateHooks.forEach((cb)=>{
        cb({
            arch,
            manifest,
            runtimeConfig: rtimeConfig
        });
        return true;
    });
    const meteorRuntimeConfig = JSON.stringify(encodeURIComponent(JSON.stringify(rtimeConfig)));
    return new Boilerplate(arch, manifest, Object.assign({
        pathMapper (itemPath) {
            return pathJoin(archPath[arch], itemPath);
        },
        baseDataExtension: {
            additionalStaticJs: (Object.entries(additionalStaticJs) || []).map(function([pathname, contents]) {
                return {
                    pathname: pathname,
                    contents: contents
                };
            }),
            // Convert to a JSON string, then get rid of most weird characters, then
            // wrap in double quotes. (The outermost JSON.stringify really ought to
            // just be "wrap in double quotes" but we use it to be safe.) This might
            // end up inside a <script> tag so we need to be careful to not include
            // "</script>", but normal {{spacebars}} escaping escapes too much! See
            // https://github.com/meteor/meteor/issues/3730
            meteorRuntimeConfig,
            meteorRuntimeHash: sha1(meteorRuntimeConfig),
            rootUrlPathPrefix: __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '',
            bundledJsCssUrlRewriteHook: bundledJsCssUrlRewriteHook,
            sriMode: sriMode,
            inlineScriptsAllowed: WebAppInternals.inlineScriptsAllowed(),
            inline: additionalOptions.inline
        }
    }, additionalOptions));
};
// A mapping from url path to architecture (e.g. "web.browser") to static
// file information with the following fields:
// - type: the type of file to be served
// - cacheable: optionally, whether the file should be cached or not
// - sourceMapUrl: optionally, the url of the source map
//
// Info also contains one of the following:
// - content: the stringified content that should be served at this path
// - absolutePath: the absolute path on disk to the file
// Serve static files from the manifest or added with
// `addStaticJs`. Exported for tests.
WebAppInternals.staticFilesMiddleware = function(staticFilesByArch, req, res, next) {
    return _async_to_generator(function*() {
        var _Meteor_settings_packages_webapp, _Meteor_settings_packages, _Meteor_settings_packages_webapp1, _Meteor_settings_packages1;
        var pathname = parseRequest(req).pathname;
        try {
            pathname = decodeURIComponent(pathname);
        } catch (e) {
            next();
            return;
        }
        var serveStaticJs = function(s) {
            var _Meteor_settings_packages_webapp, _Meteor_settings_packages;
            if (req.method === 'GET' || req.method === 'HEAD' || ((_Meteor_settings_packages = Meteor.settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_webapp = _Meteor_settings_packages.webapp) === null || _Meteor_settings_packages_webapp === void 0 ? void 0 : _Meteor_settings_packages_webapp.alwaysReturnContent)) {
                res.writeHead(200, {
                    'Content-type': 'application/javascript; charset=UTF-8',
                    'Content-Length': Buffer.byteLength(s)
                });
                res.write(s);
                res.end();
            } else {
                const status = req.method === 'OPTIONS' ? 200 : 405;
                res.writeHead(status, {
                    Allow: 'OPTIONS, GET, HEAD',
                    'Content-Length': '0'
                });
                res.end();
            }
        };
        if (pathname in additionalStaticJs && !WebAppInternals.inlineScriptsAllowed()) {
            serveStaticJs(additionalStaticJs[pathname]);
            return;
        }
        const { arch, path } = WebApp.categorizeRequest(req);
        if (!hasOwn.call(WebApp.clientPrograms, arch)) {
            // We could come here in case we run with some architectures excluded
            next();
            return;
        }
        // If pauseClient(arch) has been called, program.paused will be a
        // Promise that will be resolved when the program is unpaused.
        const program = WebApp.clientPrograms[arch];
        yield program.paused;
        if (path === '/meteor_runtime_config.js' && !WebAppInternals.inlineScriptsAllowed()) {
            serveStaticJs(`__meteor_runtime_config__ = ${program.meteorRuntimeConfig};`);
            return;
        }
        const info = getStaticFileInfo(staticFilesByArch, pathname, path, arch);
        if (!info) {
            next();
            return;
        }
        // "send" will handle HEAD & GET requests
        if (req.method !== 'HEAD' && req.method !== 'GET' && !((_Meteor_settings_packages = Meteor.settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_webapp = _Meteor_settings_packages.webapp) === null || _Meteor_settings_packages_webapp === void 0 ? void 0 : _Meteor_settings_packages_webapp.alwaysReturnContent)) {
            const status = req.method === 'OPTIONS' ? 200 : 405;
            res.writeHead(status, {
                Allow: 'OPTIONS, GET, HEAD',
                'Content-Length': '0'
            });
            res.end();
            return;
        }
        // We don't need to call pause because, unlike 'static', once we call into
        // 'send' and yield to the event loop, we never call another handler with
        // 'next'.
        // Cacheable files are files that should never change. Typically
        // named by their hash (eg meteor bundled js and css files).
        // We cache them ~forever (1yr).
        const maxAge = info.cacheable ? 1000 * 60 * 60 * 24 * 365 : 0;
        var _Meteor_settings_packages_webapp_includeVaryUserAgent;
        // Resources whose URL already contains the content hash are immutable
        // and unique per architecture (modern vs legacy), so Vary: User-Agent
        // is unnecessary and harms CDN cache efficiency.
        //
        // If the requested URL does not contain the hash (e.g. development
        // or unhashed assets), we keep Vary: User-Agent to prevent cache
        // poisoning across different browsers.
        const includeVaryUserAgent = (_Meteor_settings_packages_webapp_includeVaryUserAgent = (_Meteor_settings_packages1 = Meteor.settings.packages) === null || _Meteor_settings_packages1 === void 0 ? void 0 : (_Meteor_settings_packages_webapp1 = _Meteor_settings_packages1.webapp) === null || _Meteor_settings_packages_webapp1 === void 0 ? void 0 : _Meteor_settings_packages_webapp1.includeVaryUserAgent) !== null && _Meteor_settings_packages_webapp_includeVaryUserAgent !== void 0 ? _Meteor_settings_packages_webapp_includeVaryUserAgent : true;
        if (info.cacheable && !pathname.includes(info.hash) && includeVaryUserAgent) {
            res.setHeader('Vary', 'User-Agent');
        }
        // Set the X-SourceMap header, which current Chrome, FireFox, and Safari
        // understand.  (The SourceMap header is slightly more spec-correct but FF
        // doesn't understand it.)
        //
        // You may also need to enable source maps in Chrome: open dev tools, click
        // the gear in the bottom right corner, and select "enable source maps".
        if (info.sourceMapUrl) {
            res.setHeader('X-SourceMap', __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + info.sourceMapUrl);
        }
        if (info.type === 'js' || info.type === 'dynamic js') {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (info.type === 'css') {
            res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        } else if (info.type === 'json') {
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        }
        if (info.hash) {
            res.setHeader('ETag', '"' + info.hash + '"');
        }
        if (info.content) {
            res.setHeader('Content-Length', Buffer.byteLength(info.content));
            res.write(info.content);
            res.end();
        } else {
            send(req, info.absolutePath, {
                maxage: maxAge,
                dotfiles: 'allow',
                lastModified: false
            }).on('error', function(err) {
                Log.error('Error serving static file ' + err);
                res.writeHead(500);
                res.end();
            }).on('directory', function() {
                Log.error('Unexpected directory ' + info.absolutePath);
                res.writeHead(500);
                res.end();
            }).pipe(res);
        }
    })();
};
function getStaticFileInfo(staticFilesByArch, originalPath, path, arch) {
    if (!hasOwn.call(WebApp.clientPrograms, arch)) {
        return null;
    }
    // Get a list of all available static file architectures, with arch
    // first in the list if it exists.
    const staticArchList = Object.keys(staticFilesByArch);
    const archIndex = staticArchList.indexOf(arch);
    if (archIndex > 0) {
        staticArchList.unshift(staticArchList.splice(archIndex, 1)[0]);
    }
    let info = null;
    staticArchList.some((arch)=>{
        const staticFiles = staticFilesByArch[arch];
        function finalize(path) {
            info = staticFiles[path];
            // Sometimes we register a lazy function instead of actual data in
            // the staticFiles manifest.
            if (typeof info === 'function') {
                info = staticFiles[path] = info();
            }
            return info;
        }
        // If staticFiles contains originalPath with the arch inferred above,
        // use that information.
        if (hasOwn.call(staticFiles, originalPath)) {
            return finalize(originalPath);
        }
        // If categorizeRequest returned an alternate path, try that instead.
        if (path !== originalPath && hasOwn.call(staticFiles, path)) {
            return finalize(path);
        }
    });
    return info;
}
// Parse the passed in port value. Return the port as-is if it's a String
// (e.g. a Windows Server style named pipe), otherwise return the port as an
// integer.
//
// DEPRECATED: Direct use of this function is not recommended; it is no
// longer used internally, and will be removed in a future release.
WebAppInternals.parsePort = (port)=>{
    let parsedPort = parseInt(port);
    if (Number.isNaN(parsedPort)) {
        parsedPort = port;
    }
    return parsedPort;
};
onMessage('webapp-pause-client', ({ arch })=>_async_to_generator(function*() {
        yield WebAppInternals.pauseClient(arch);
    })());
onMessage('webapp-reload-client', ({ arch })=>_async_to_generator(function*() {
        yield WebAppInternals.generateClientProgram(arch);
    })());
function runWebAppServer() {
    return _async_to_generator(function*() {
        var shuttingDown = false;
        var syncQueue = new Meteor._AsynchronousQueue();
        var getItemPathname = function(itemUrl) {
            return decodeURIComponent(new URL(itemUrl, 'http://localhost').pathname);
        };
        WebAppInternals.reloadClientPrograms = function() {
            return _async_to_generator(function*() {
                yield syncQueue.runTask(function() {
                    const staticFilesByArch = Object.create(null);
                    const { configJson } = __meteor_bootstrap__;
                    const clientArchs = configJson.clientArchs || Object.keys(configJson.clientPaths);
                    try {
                        clientArchs.forEach((arch)=>{
                            generateClientProgram(arch, staticFilesByArch);
                        });
                        WebAppInternals.staticFilesByArch = staticFilesByArch;
                    } catch (e) {
                        Log.error('Error reloading the client program: ' + e.stack);
                        process.exit(1);
                    }
                });
            })();
        };
        // Pause any incoming requests and make them wait for the program to be
        // unpaused the next time generateClientProgram(arch) is called.
        WebAppInternals.pauseClient = function(arch) {
            return _async_to_generator(function*() {
                yield syncQueue.runTask(()=>{
                    const program = WebApp.clientPrograms[arch];
                    const { unpause } = program;
                    program.paused = new Promise((resolve)=>{
                        if (typeof unpause === 'function') {
                            // If there happens to be an existing program.unpause function,
                            // compose it with the resolve function.
                            program.unpause = function() {
                                unpause();
                                resolve();
                            };
                        } else {
                            program.unpause = resolve;
                        }
                    });
                });
            })();
        };
        WebAppInternals.generateClientProgram = function(arch) {
            return _async_to_generator(function*() {
                yield syncQueue.runTask(()=>generateClientProgram(arch));
            })();
        };
        function generateClientProgram(arch, staticFilesByArch = WebAppInternals.staticFilesByArch) {
            const clientDir = pathJoin(pathDirname(__meteor_bootstrap__.serverDir), arch);
            // read the control for the client we'll be serving up
            const programJsonPath = pathJoin(clientDir, 'program.json');
            let programJson;
            try {
                programJson = JSON.parse(readFileSync(programJsonPath));
            } catch (e) {
                if (e.code === 'ENOENT') return;
                throw e;
            }
            if (programJson.format !== 'web-program-pre1') {
                throw new Error('Unsupported format for client assets: ' + JSON.stringify(programJson.format));
            }
            if (!programJsonPath || !clientDir || !programJson) {
                throw new Error('Client config file not parsed.');
            }
            archPath[arch] = clientDir;
            const staticFiles = staticFilesByArch[arch] = Object.create(null);
            const { manifest } = programJson;
            manifest.forEach((item)=>{
                if (item.url && item.where === 'client') {
                    staticFiles[getItemPathname(item.url)] = {
                        absolutePath: pathJoin(clientDir, item.path),
                        cacheable: item.cacheable,
                        hash: item.hash,
                        // Link from source to its map
                        sourceMapUrl: item.sourceMapUrl,
                        type: item.type
                    };
                    if (item.sourceMap) {
                        // Serve the source map too, under the specified URL. We assume
                        // all source maps are cacheable.
                        staticFiles[getItemPathname(item.sourceMapUrl)] = {
                            absolutePath: pathJoin(clientDir, item.sourceMap),
                            cacheable: true
                        };
                    }
                }
            });
            const { PUBLIC_SETTINGS } = __meteor_runtime_config__;
            const configOverrides = {
                PUBLIC_SETTINGS
            };
            const oldProgram = WebApp.clientPrograms[arch];
            const newProgram = WebApp.clientPrograms[arch] = {
                format: 'web-program-pre1',
                manifest: manifest,
                // Use arrow functions so that these versions can be lazily
                // calculated later, and so that they will not be included in the
                // staticFiles[manifestUrl].content string below.
                //
                // Note: these version calculations must be kept in agreement with
                // CordovaBuilder#appendVersion in tools/cordova/builder.js, or hot
                // code push will reload Cordova apps unnecessarily.
                version: ()=>WebAppHashing.calculateClientHash(manifest, null, configOverrides),
                versionRefreshable: ()=>WebAppHashing.calculateClientHash(manifest, (type)=>type === 'css', configOverrides),
                versionNonRefreshable: ()=>WebAppHashing.calculateClientHash(manifest, (type, replaceable)=>type !== 'css' && !replaceable, configOverrides),
                versionReplaceable: ()=>WebAppHashing.calculateClientHash(manifest, (_type, replaceable)=>replaceable, configOverrides),
                cordovaCompatibilityVersions: programJson.cordovaCompatibilityVersions,
                PUBLIC_SETTINGS,
                hmrVersion: programJson.hmrVersion
            };
            // Expose program details as a string reachable via the following URL.
            const manifestUrlPrefix = '/__' + arch.replace(/^web\./, '');
            const manifestUrl = manifestUrlPrefix + getItemPathname('/manifest.json');
            staticFiles[manifestUrl] = ()=>{
                if (Package.autoupdate) {
                    const { AUTOUPDATE_VERSION = Package.autoupdate.Autoupdate.autoupdateVersion } = process.env;
                    if (AUTOUPDATE_VERSION) {
                        newProgram.version = AUTOUPDATE_VERSION;
                    }
                }
                if (typeof newProgram.version === 'function') {
                    newProgram.version = newProgram.version();
                }
                return {
                    content: JSON.stringify(newProgram),
                    cacheable: false,
                    hash: newProgram.version,
                    type: 'json'
                };
            };
            generateBoilerplateForArch(arch);
            // If there are any requests waiting on oldProgram.paused, let them
            // continue now (using the new program).
            if (oldProgram && oldProgram.paused) {
                oldProgram.unpause();
            }
        }
        const defaultOptionsForArch = {
            'web.cordova': {
                runtimeConfigOverrides: {
                    // XXX We use absoluteUrl() here so that we serve https://
                    // URLs to cordova clients if force-ssl is in use. If we were
                    // to use __meteor_runtime_config__.ROOT_URL instead of
                    // absoluteUrl(), then Cordova clients would immediately get a
                    // HCP setting their DDP_DEFAULT_CONNECTION_URL to
                    // http://example.meteor.com. This breaks the app, because
                    // force-ssl doesn't serve CORS headers on 302
                    // redirects. (Plus it's undesirable to have clients
                    // connecting to http://example.meteor.com when force-ssl is
                    // in use.)
                    DDP_DEFAULT_CONNECTION_URL: process.env.MOBILE_DDP_URL || Meteor.absoluteUrl(),
                    ROOT_URL: process.env.MOBILE_ROOT_URL || Meteor.absoluteUrl()
                }
            },
            'web.browser': {
                runtimeConfigOverrides: {
                    isModern: true
                }
            },
            'web.browser.legacy': {
                runtimeConfigOverrides: {
                    isModern: false
                }
            }
        };
        WebAppInternals.generateBoilerplate = function() {
            return _async_to_generator(function*() {
                // This boilerplate will be served to the mobile devices when used with
                // Meteor/Cordova for the Hot-Code Push and since the file will be served by
                // the device's server, it is important to set the DDP url to the actual
                // Meteor server accepting DDP connections and not the device's file server.
                yield syncQueue.runTask(function() {
                    Object.keys(WebApp.clientPrograms).forEach(generateBoilerplateForArch);
                });
            })();
        };
        function generateBoilerplateForArch(arch) {
            const program = WebApp.clientPrograms[arch];
            const additionalOptions = defaultOptionsForArch[arch] || {};
            const { baseData } = boilerplateByArch[arch] = WebAppInternals.generateBoilerplateInstance(arch, program.manifest, additionalOptions);
            // We need the runtime config with overrides for meteor_runtime_config.js:
            program.meteorRuntimeConfig = JSON.stringify(_object_spread({}, __meteor_runtime_config__, additionalOptions.runtimeConfigOverrides || null));
            program.refreshableAssets = baseData.css.map((file)=>({
                    url: bundledJsCssUrlRewriteHook(file.url)
                }));
        }
        yield WebAppInternals.reloadClientPrograms();
        // webserver
        var app = createExpressApp();
        // Packages and apps can add handlers that run before any other Meteor
        // handlers via WebApp.rawExpressHandlers.
        var rawExpressHandlers = createExpressApp();
        app.use(rawExpressHandlers);
        // Auto-compress any json, javascript, or text.
        app.use(compress({
            filter: shouldCompress
        }));
        // parse cookies into an object
        app.use(cookieParser());
        // We're not a proxy; reject (without crashing) attempts to treat us like
        // one. (See #1212.)
        app.use(function(req, res, next) {
            if (RoutePolicy.isValidUrl(req.url)) {
                next();
                return;
            }
            res.writeHead(400);
            res.write('Not a proxy');
            res.end();
        });
        function getPathParts(path) {
            const parts = path.split('/');
            while(parts[0] === '')parts.shift();
            return parts;
        }
        function isPrefixOf(prefix, array) {
            return prefix.length <= array.length && prefix.every((part, i)=>part === array[i]);
        }
        // Strip off the path prefix, if it exists.
        app.use(function(request, response, next) {
            const pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX;
            const { pathname, search } = new URL(request.url, 'http://localhost');
            // check if the path in the url starts with the path prefix
            if (pathPrefix) {
                const prefixParts = getPathParts(pathPrefix);
                const pathParts = getPathParts(pathname);
                if (isPrefixOf(prefixParts, pathParts)) {
                    request.url = '/' + pathParts.slice(prefixParts.length).join('/');
                    if (search) {
                        request.url += search;
                    }
                    return next();
                }
            }
            if (pathname === '/favicon.ico' || pathname === '/robots.txt') {
                return next();
            }
            if (pathPrefix) {
                response.writeHead(404);
                response.write('Unknown path');
                response.end();
                return;
            }
            next();
        });
        // Serve static files from the manifest.
        // This is inspired by the 'static' middleware.
        app.use(function(req, res, next) {
            // console.log(String(arguments.callee));
            WebAppInternals.staticFilesMiddleware(WebAppInternals.staticFilesByArch, req, res, next);
        });
        // Core Meteor packages like dynamic-import can add handlers before
        // other handlers added by package and application code.
        app.use(WebAppInternals.meteorInternalHandlers = createExpressApp());
        /**
   * @name expressHandlersCallback(req, res, next)
   * @locus Server
   * @isprototype true
   * @summary callback handler for `WebApp.expressHandlers`
   * @param {Object} req
   * a Node.js
   * [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage)
   * object with some extra properties. This argument can be used
   *  to get information about the incoming request.
   * @param {Object} res
   * a Node.js
   * [ServerResponse](https://nodejs.org/api/http.html#class-httpserverresponse)
   * object. Use this to write data that should be sent in response to the
   * request, and call `res.end()` when you are done.
   * @param {Function} next
   * Calling this function will pass on the handling of
   * this request to the next relevant handler.
   *
   */ /**
   * @method handlers
   * @memberof WebApp
   * @locus Server
   * @summary Register a handler for all HTTP requests.
   * @param {String} [path]
   * This handler will only be called on paths that match
   * this string. The match has to border on a `/` or a `.`.
   *
   * For example, `/hello` will match `/hello/world` and
   * `/hello.world`, but not `/hello_world`.
   * @param {expressHandlersCallback} handler
   * A handler function that will be called on HTTP requests.
   * See `expressHandlersCallback`
   *
   */ // Packages and apps can add handlers to this via WebApp.expressHandlers.
        // They are inserted before our default handler.
        var packageAndAppHandlers = createExpressApp();
        app.use(packageAndAppHandlers);
        let suppressExpressErrors = false;
        // Express knows it is an error handler because it has 4 arguments instead of
        // 3. go figure.  (It is not smart enough to find such a thing if it's hidden
        // inside packageAndAppHandlers.)
        app.use(function(err, req, res, next) {
            if (!err || !suppressExpressErrors || !req.headers['x-suppress-error']) {
                next(err);
                return;
            }
            res.writeHead(err.status, {
                'Content-Type': 'text/plain'
            });
            res.end('An error message');
        });
        app.use(function(req, res, next) {
            return _async_to_generator(function*() {
                var _Meteor_settings_packages_webapp, _Meteor_settings_packages;
                if (!appUrl(req.url)) {
                    return next();
                } else if (req.method !== 'HEAD' && req.method !== 'GET' && !((_Meteor_settings_packages = Meteor.settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_webapp = _Meteor_settings_packages.webapp) === null || _Meteor_settings_packages_webapp === void 0 ? void 0 : _Meteor_settings_packages_webapp.alwaysReturnContent)) {
                    const status = req.method === 'OPTIONS' ? 200 : 405;
                    res.writeHead(status, {
                        Allow: 'OPTIONS, GET, HEAD',
                        'Content-Length': '0'
                    });
                    res.end();
                } else {
                    var headers = {
                        'Content-Type': 'text/html; charset=utf-8'
                    };
                    if (shuttingDown) {
                        headers['Connection'] = 'Close';
                    }
                    var request = WebApp.categorizeRequest(req);
                    var response = res;
                    if (request.url.query && request.url.query['meteor_css_resource']) {
                        // In this case, we're requesting a CSS resource in the meteor-specific
                        // way, but we don't have it.  Serve a static css file that indicates that
                        // we didn't have it, so we can detect that and refresh.  Make sure
                        // that any proxies or CDNs don't cache this error!  (Normally proxies
                        // or CDNs are smart enough not to cache error pages, but in order to
                        // make this hack work, we need to return the CSS file as a 200, which
                        // would otherwise be cached.)
                        headers['Content-Type'] = 'text/css; charset=utf-8';
                        headers['Cache-Control'] = 'no-cache';
                        res.writeHead(200, headers);
                        res.write('.meteor-css-not-found-error { width: 0px;}');
                        res.end();
                        return;
                    }
                    if (request.url.query && request.url.query['meteor_js_resource']) {
                        // Similarly, we're requesting a JS resource that we don't have.
                        // Serve an uncached 404. (We can't use the same hack we use for CSS,
                        // because actually acting on that hack requires us to have the JS
                        // already!)
                        headers['Cache-Control'] = 'no-cache';
                        res.writeHead(404, headers);
                        res.end('404 Not Found');
                        return;
                    }
                    if (request.url.query && request.url.query['meteor_dont_serve_index']) {
                        // When downloading files during a Cordova hot code push, we need
                        // to detect if a file is not available instead of inadvertently
                        // downloading the default index page.
                        // So similar to the situation above, we serve an uncached 404.
                        headers['Cache-Control'] = 'no-cache';
                        res.writeHead(404, headers);
                        res.end('404 Not Found');
                        return;
                    }
                    const { arch } = request;
                    assert.strictEqual(typeof arch, 'string', {
                        arch
                    });
                    if (!hasOwn.call(WebApp.clientPrograms, arch)) {
                        // We could come here in case we run with some architectures excluded
                        headers['Cache-Control'] = 'no-cache';
                        res.writeHead(404, headers);
                        if (Meteor.isDevelopment) {
                            res.end(`No client program found for the ${arch} architecture.`);
                        } else {
                            // Safety net, but this branch should not be possible.
                            res.end('404 Not Found');
                        }
                        return;
                    }
                    // If pauseClient(arch) has been called, program.paused will be a
                    // Promise that will be resolved when the program is unpaused.
                    yield WebApp.clientPrograms[arch].paused;
                    return getBoilerplateAsync(request, arch, response).then(({ stream, statusCode, headers: newHeaders })=>{
                        if (!statusCode) {
                            statusCode = res.statusCode ? res.statusCode : 200;
                        }
                        if (newHeaders) {
                            Object.assign(headers, newHeaders);
                        }
                        res.writeHead(statusCode, headers);
                        if (!disableBoilerplateResponse) {
                            stream.pipe(res, {
                                // End the response when the stream ends.
                                end: true
                            });
                        }
                    }).catch((error)=>{
                        Log.error('Error running template: ' + error.stack);
                        res.writeHead(500, headers);
                        res.end();
                    });
                }
            })();
        });
        // Return 404 by default, if no other handlers serve this URL.
        app.use(function(req, res) {
            res.writeHead(404);
            res.end();
        });
        var httpServer = createServer(app);
        var onListeningCallbacks = [];
        // After 5 seconds w/o data on a socket, kill it.  On the other hand, if
        // there's an outstanding request, give it a higher timeout instead (to avoid
        // killing long-polling requests)
        httpServer.setTimeout(SHORT_SOCKET_TIMEOUT);
        // Do this here, and then also in livedata/stream_server.js, because
        // stream_server.js kills all the current request handlers when installing its
        // own.
        httpServer.on('request', WebApp._timeoutAdjustmentRequestCallback);
        // If the client gave us a bad request, tell it instead of just closing the
        // socket. This lets load balancers in front of us differentiate between "a
        // server is randomly closing sockets for no reason" and "client sent a bad
        // request".
        //
        // This will only work on Node 6; Node 4 destroys the socket before calling
        // this event. See https://github.com/nodejs/node/pull/4557/ for details.
        httpServer.on('clientError', (err, socket)=>{
            // Pre-Node-6, do nothing.
            if (socket.destroyed) {
                return;
            }
            if (err.message === 'Parse Error') {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            } else {
                // For other errors, use the default behavior as if we had no clientError
                // handler.
                socket.destroy(err);
            }
        });
        const suppressErrors = function() {
            suppressExpressErrors = true;
        };
        let warnedAboutConnectUsage = false;
        // start up app
        Object.assign(WebApp, {
            connectHandlers: packageAndAppHandlers,
            handlers: packageAndAppHandlers,
            rawConnectHandlers: rawExpressHandlers,
            rawHandlers: rawExpressHandlers,
            httpServer: httpServer,
            expressApp: app,
            // For testing.
            suppressConnectErrors: ()=>{
                if (!warnedAboutConnectUsage) {
                    Meteor._debug("WebApp.suppressConnectErrors has been renamed to Meteor._suppressExpressErrors and it should be used only in tests.");
                    warnedAboutConnectUsage = true;
                }
                suppressErrors();
            },
            _suppressExpressErrors: suppressErrors,
            onListening: function(f) {
                if (onListeningCallbacks) onListeningCallbacks.push(f);
                else f();
            },
            // This can be overridden by users who want to modify how listening works
            // (eg, to run a proxy like Apollo Engine Proxy in front of the server).
            startListening: function(httpServer, listenOptions, cb) {
                httpServer.listen(listenOptions, cb);
            }
        });
        /**
   * @name main
   * @locus Server
   * @summary Starts the HTTP server.
   *  If `UNIX_SOCKET_PATH` is present Meteor's HTTP server will use that socket file for inter-process communication, instead of TCP.
   * If you choose to not include webapp package in your application this method still must be defined for your Meteor application to work.
   */ // Let the rest of the packages (and Meteor.startup hooks) insert Express
        // middlewares and update __meteor_runtime_config__, then keep going to set up
        // actually serving HTML.
        exports.main = (argv)=>_async_to_generator(function*() {
                yield WebAppInternals.generateBoilerplate();
                const startHttpServer = (listenOptions)=>{
                    WebApp.startListening((argv === null || argv === void 0 ? void 0 : argv.httpServer) || httpServer, listenOptions, Meteor.bindEnvironment(()=>{
                        if (process.env.METEOR_PRINT_ON_LISTEN) {
                            console.log('LISTENING');
                        }
                        const callbacks = onListeningCallbacks;
                        onListeningCallbacks = null;
                        callbacks === null || callbacks === void 0 ? void 0 : callbacks.forEach((callback)=>{
                            callback();
                        });
                    }, (e)=>{
                        console.error('Error listening:', e);
                        console.error(e && e.stack);
                    }));
                };
                let localPort = process.env.PORT || 0;
                let unixSocketPath = process.env.UNIX_SOCKET_PATH;
                if (unixSocketPath) {
                    if (cluster.isWorker) {
                        const workerName = cluster.worker.process.env.name || cluster.worker.id;
                        unixSocketPath += '.' + workerName + '.sock';
                    }
                    // Start the HTTP server using a socket file.
                    removeExistingSocketFile(unixSocketPath);
                    startHttpServer({
                        path: unixSocketPath
                    });
                    const unixSocketPermissions = (process.env.UNIX_SOCKET_PERMISSIONS || '').trim();
                    if (unixSocketPermissions) {
                        if (/^[0-7]{3}$/.test(unixSocketPermissions)) {
                            chmodSync(unixSocketPath, parseInt(unixSocketPermissions, 8));
                        } else {
                            throw new Error('Invalid UNIX_SOCKET_PERMISSIONS specified');
                        }
                    }
                    const unixSocketGroup = (process.env.UNIX_SOCKET_GROUP || '').trim();
                    if (unixSocketGroup) {
                        const unixSocketGroupInfo = getGroupInfo(unixSocketGroup);
                        if (unixSocketGroupInfo === null) {
                            throw new Error('Invalid UNIX_SOCKET_GROUP name specified');
                        }
                        try {
                            chownSync(unixSocketPath, userInfo().uid, unixSocketGroupInfo.gid);
                        } catch (error) {
                            if (error.code === 'EPERM' || error.code === 'EACCES') {
                                console.error(`Skipping UNIX_SOCKET_GROUP change for "${unixSocketGroup}" because current user lacks permission.`);
                            } else {
                                throw error;
                            }
                        }
                    }
                    registerSocketFileCleanup(unixSocketPath);
                } else {
                    localPort = isNaN(Number(localPort)) ? localPort : Number(localPort);
                    if (/\\\\?.+\\pipe\\?.+/.test(localPort)) {
                        // Start the HTTP server using Windows Server style named pipe.
                        startHttpServer({
                            path: localPort
                        });
                    } else if (typeof localPort === 'number') {
                        // Start the HTTP server using TCP.
                        startHttpServer({
                            port: localPort,
                            host: process.env.BIND_IP || '0.0.0.0'
                        });
                    } else {
                        throw new Error('Invalid PORT specified');
                    }
                }
                return 'DAEMON';
            })();
    })();
}
const isGetentAvailable = ()=>{
    try {
        execSync('which getent');
        return true;
    } catch (e) {
        return false;
    }
};
const getGroupInfoUsingGetent = (groupName)=>{
    try {
        const stdout = execSync(`getent group ${groupName}`, {
            encoding: 'utf8'
        });
        if (!stdout) return null;
        const [name, , gid] = stdout.trim().split(':');
        if (name == null || gid == null) return null;
        return {
            name,
            gid: Number(gid)
        };
    } catch (error) {
        return null;
    }
};
const getGroupInfoFromFile = (groupName)=>{
    try {
        const data = readFileSync('/etc/group', 'utf8');
        const groupLine = data.trim().split('\n').find((line)=>line.startsWith(`${groupName}:`));
        if (!groupLine) return null;
        const [name, , gid] = groupLine.trim().split(':');
        if (name == null || gid == null) return null;
        return {
            name,
            gid: Number(gid)
        };
    } catch (error) {
        return null;
    }
};
const getGroupInfo = (groupName)=>{
    let groupInfo = getGroupInfoFromFile(groupName);
    if (!groupInfo && isGetentAvailable()) {
        groupInfo = getGroupInfoUsingGetent(groupName);
    }
    return groupInfo;
};
var inlineScriptsAllowed = true;
WebAppInternals.inlineScriptsAllowed = function() {
    return inlineScriptsAllowed;
};
WebAppInternals.setInlineScriptsAllowed = function(value) {
    return _async_to_generator(function*() {
        inlineScriptsAllowed = value;
        yield WebAppInternals.generateBoilerplate();
    })();
};
var sriMode;
WebAppInternals.enableSubresourceIntegrity = function(use_credentials = false) {
    return _async_to_generator(function*() {
        sriMode = use_credentials ? 'use-credentials' : 'anonymous';
        yield WebAppInternals.generateBoilerplate();
    })();
};
WebAppInternals.setBundledJsCssUrlRewriteHook = function(hookFn) {
    return _async_to_generator(function*() {
        bundledJsCssUrlRewriteHook = hookFn;
        yield WebAppInternals.generateBoilerplate();
    })();
};
WebAppInternals.setBundledJsCssPrefix = function(prefix) {
    return _async_to_generator(function*() {
        var self = this;
        yield self.setBundledJsCssUrlRewriteHook(function(url) {
            return prefix + url;
        });
    }).call(this);
};
// Packages can call `WebAppInternals.addStaticJs` to specify static
// JavaScript to be included in the app. This static JS will be inlined,
// unless inline scripts have been disabled, in which case it will be
// served under `/<sha1 of contents>`.
var additionalStaticJs = {};
WebAppInternals.addStaticJs = function(contents) {
    additionalStaticJs['/' + sha1(contents) + '.js'] = contents;
};
var disableBoilerplateResponse = false;
WebAppInternals.disableBoilerplateResponse = function() {
    disableBoilerplateResponse = true;
};
// Exported for tests
WebAppInternals.getBoilerplate = getBoilerplate;
WebAppInternals.additionalStaticJs = additionalStaticJs;
await runWebAppServer();
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: true });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"socket_file.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/webapp/socket_file.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({removeExistingSocketFile:()=>removeExistingSocketFile,registerSocketFileCleanup:()=>registerSocketFileCleanup},true);let statSync,unlinkSync,existsSync;module.link('fs',{statSync(v){statSync=v},unlinkSync(v){unlinkSync=v},existsSync(v){existsSync=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
// Since a new socket file will be created when the HTTP server
// starts up, if found remove the existing file.
//
// WARNING:
// This will remove the configured socket file without warning. If
// the configured socket file is already in use by another application,
// it will still be removed. Node does not provide a reliable way to
// differentiate between a socket file that is already in use by
// another application or a stale socket file that has been
// left over after a SIGKILL. Since we have no reliable way to
// differentiate between these two scenarios, the best course of
// action during startup is to remove any existing socket file. This
// is not the safest course of action as removing the existing socket
// file could impact an application using it, but this approach helps
// ensure the HTTP server can startup without manual
// intervention (e.g. asking for the verification and cleanup of socket
// files before allowing the HTTP server to be started).
//
// The above being said, as long as the socket file path is
// configured carefully when the application is deployed (and extra
// care is taken to make sure the configured path is unique and doesn't
// conflict with another socket file path), then there should not be
// any issues with this approach.
const removeExistingSocketFile = (socketPath)=>{
    try {
        if (statSync(socketPath).isSocket()) {
            // Since a new socket file will be created, remove the existing
            // file.
            unlinkSync(socketPath);
        } else {
            throw new Error(`An existing file was found at "${socketPath}" and it is not ` + 'a socket file. Please confirm PORT is pointing to valid and ' + 'un-used socket file path.');
        }
    } catch (error) {
        // If there is no existing socket file to cleanup, great, we'll
        // continue normally. If the caught exception represents any other
        // issue, re-throw.
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
};
// Remove the socket file when done to avoid leaving behind a stale one.
// Note - a stale socket file is still left behind if the running node
// process is killed via signal 9 - SIGKILL.
const registerSocketFileCleanup = (socketPath, eventEmitter = process)=>{
    [
        'exit',
        'SIGINT',
        'SIGHUP',
        'SIGTERM'
    ].forEach((signal)=>{
        eventEmitter.on(signal, Meteor.bindEnvironment(()=>{
            if (existsSync(socketPath)) {
                unlinkSync(socketPath);
            }
        }));
    });
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"express":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/express/package.json                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "express",
  "version": "5.1.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/express/index.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"compression":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/compression/package.json                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "compression",
  "version": "1.7.4"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/compression/index.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"cookie-parser":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/cookie-parser/package.json                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "cookie-parser",
  "version": "1.4.6"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/cookie-parser/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"qs":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/qs/package.json                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "qs",
  "version": "6.13.0",
  "main": "lib/index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/qs/lib/index.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"parseurl":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/parseurl/package.json                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "parseurl",
  "version": "1.3.3"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/parseurl/index.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"useragent-ng":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/useragent-ng/package.json                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "useragent-ng",
  "version": "2.4.4",
  "main": "./index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/useragent-ng/index.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"send":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/send/package.json                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "send",
  "version": "1.1.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/webapp/node_modules/send/index.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      WebApp: WebApp,
      WebAppInternals: WebAppInternals,
      main: main
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/webapp/webapp_server.js"
  ],
  mainModulePath: "/node_modules/meteor/webapp/webapp_server.js"
}});

//# sourceURL=meteor://💻app/packages/webapp.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvd2ViYXBwL3dlYmFwcF9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3dlYmFwcC9zb2NrZXRfZmlsZS5qcyJdLCJuYW1lcyI6WyJTSE9SVF9TT0NLRVRfVElNRU9VVCIsIkxPTkdfU09DS0VUX1RJTUVPVVQiLCJjcmVhdGVFeHByZXNzQXBwIiwiYXBwIiwiZXhwcmVzcyIsInNldCIsInFzIiwicGFyc2UiLCJXZWJBcHAiLCJXZWJBcHBJbnRlcm5hbHMiLCJoYXNPd24iLCJPYmplY3QiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsIk5wbU1vZHVsZXMiLCJ2ZXJzaW9uIiwiTnBtIiwicmVxdWlyZSIsIm1vZHVsZSIsImRlZmF1bHRBcmNoIiwiY2xpZW50UHJvZ3JhbXMiLCJhcmNoUGF0aCIsImJ1bmRsZWRKc0Nzc1VybFJld3JpdGVIb29rIiwidXJsIiwiYnVuZGxlZFByZWZpeCIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJST09UX1VSTF9QQVRIX1BSRUZJWCIsInNoYTEiLCJjb250ZW50cyIsImhhc2giLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwiZGlnZXN0Iiwic2hvdWxkQ29tcHJlc3MiLCJyZXEiLCJyZXMiLCJoZWFkZXJzIiwiY29tcHJlc3MiLCJmaWx0ZXIiLCJjYW1lbENhc2UiLCJuYW1lIiwicGFydHMiLCJzcGxpdCIsInRvTG93ZXJDYXNlIiwiaSIsImxlbmd0aCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic3Vic3RyaW5nIiwiam9pbiIsImlkZW50aWZ5QnJvd3NlciIsInVzZXJBZ2VudFN0cmluZyIsIm1ham9yIiwibWlub3IiLCJwYXRjaCIsInVzZXJBZ2VudCIsImxvb2t1cFVzZXJBZ2VudCIsImZhbWlseSIsImNhdGVnb3JpemVSZXF1ZXN0IiwiYnJvd3NlciIsImFyY2giLCJtb2Rlcm4iLCJpc01vZGVybiIsInBhdGgiLCJwYXRobmFtZSIsInBhcnNlUmVxdWVzdCIsImNhdGVnb3JpemVkIiwicXVlcnkiLCJmcm9tRW50cmllcyIsIlVSTCIsInNlYXJjaFBhcmFtcyIsImR5bmFtaWNIZWFkIiwiZHluYW1pY0JvZHkiLCJjb29raWVzIiwicGF0aFBhcnRzIiwiYXJjaEtleSIsInN0YXJ0c1dpdGgiLCJhcmNoQ2xlYW5lZCIsInNsaWNlIiwiY2FsbCIsInNwbGljZSIsImFzc2lnbiIsInByZWZlcnJlZEFyY2hPcmRlciIsImh0bWxBdHRyaWJ1dGVIb29rcyIsImdldEh0bWxBdHRyaWJ1dGVzIiwicmVxdWVzdCIsImNvbWJpbmVkQXR0cmlidXRlcyIsImZvckVhY2giLCJob29rIiwiYXR0cmlidXRlcyIsIkVycm9yIiwiYWRkSHRtbEF0dHJpYnV0ZUhvb2siLCJwdXNoIiwiYXBwVXJsIiwiUm91dGVQb2xpY3kiLCJjbGFzc2lmeSIsIk1ldGVvciIsInN0YXJ0dXAiLCJnZXR0ZXIiLCJrZXkiLCJwcm9ncmFtIiwidmFsdWUiLCJjYWxjdWxhdGVDbGllbnRIYXNoIiwiY2xpZW50SGFzaCIsImNhbGN1bGF0ZUNsaWVudEhhc2hSZWZyZXNoYWJsZSIsImNhbGN1bGF0ZUNsaWVudEhhc2hOb25SZWZyZXNoYWJsZSIsImNhbGN1bGF0ZUNsaWVudEhhc2hSZXBsYWNlYWJsZSIsImdldFJlZnJlc2hhYmxlQXNzZXRzIiwiX3RpbWVvdXRBZGp1c3RtZW50UmVxdWVzdENhbGxiYWNrIiwic2V0VGltZW91dCIsImZpbmlzaExpc3RlbmVycyIsImxpc3RlbmVycyIsInJlbW92ZUFsbExpc3RlbmVycyIsIm9uIiwidmFsdWVzIiwibCIsImJvaWxlcnBsYXRlQnlBcmNoIiwiYm9pbGVycGxhdGVEYXRhQ2FsbGJhY2tzIiwiY3JlYXRlIiwicmVnaXN0ZXJCb2lsZXJwbGF0ZURhdGFDYWxsYmFjayIsImNhbGxiYWNrIiwicHJldmlvdXNDYWxsYmFjayIsImFzc2VydCIsInN0cmljdEVxdWFsIiwiZ2V0Qm9pbGVycGxhdGUiLCJnZXRCb2lsZXJwbGF0ZUFzeW5jIiwiZW5jb2RlUnVudGltZUNvbmZpZyIsInJ0aW1lQ29uZmlnIiwiSlNPTiIsInN0cmluZ2lmeSIsImVuY29kZVVSSUNvbXBvbmVudCIsImRlY29kZVJ1bnRpbWVDb25maWciLCJydGltZUNvbmZpZ1N0ciIsImRlY29kZVVSSUNvbXBvbmVudCIsInJ1bnRpbWVDb25maWciLCJob29rcyIsIkhvb2siLCJ1cGRhdGVIb29rcyIsImlzVXBkYXRlZEJ5QXJjaCIsImFkZFJ1bnRpbWVDb25maWdIb29rIiwicmVnaXN0ZXIiLCJyZXNwb25zZSIsImJvaWxlcnBsYXRlIiwiZm9yRWFjaEFzeW5jIiwibWV0ZW9yUnVudGltZUNvbmZpZyIsImVuY29kZWRDdXJyZW50Q29uZmlnIiwiYmFzZURhdGEiLCJ1cGRhdGVkIiwiZGF0YSIsImh0bWxBdHRyaWJ1dGVzIiwibWFkZUNoYW5nZXMiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJrZXlzIiwidGhlbiIsInJlc3VsdCIsInN0cmVhbSIsInRvSFRNTFN0cmVhbSIsInN0YXR1c0NvZGUiLCJhZGRVcGRhdGVkTm90aWZ5SG9vayIsImhhbmRsZXIiLCJnZW5lcmF0ZUJvaWxlcnBsYXRlSW5zdGFuY2UiLCJtYW5pZmVzdCIsImFkZGl0aW9uYWxPcHRpb25zIiwicnVudGltZUNvbmZpZ092ZXJyaWRlcyIsImNiIiwiQm9pbGVycGxhdGUiLCJwYXRoTWFwcGVyIiwiaXRlbVBhdGgiLCJwYXRoSm9pbiIsImJhc2VEYXRhRXh0ZW5zaW9uIiwiYWRkaXRpb25hbFN0YXRpY0pzIiwiZW50cmllcyIsIm1hcCIsIm1ldGVvclJ1bnRpbWVIYXNoIiwicm9vdFVybFBhdGhQcmVmaXgiLCJzcmlNb2RlIiwiaW5saW5lU2NyaXB0c0FsbG93ZWQiLCJpbmxpbmUiLCJzdGF0aWNGaWxlc01pZGRsZXdhcmUiLCJzdGF0aWNGaWxlc0J5QXJjaCIsIm5leHQiLCJlIiwic2VydmVTdGF0aWNKcyIsInMiLCJtZXRob2QiLCJzZXR0aW5ncyIsInBhY2thZ2VzIiwid2ViYXBwIiwiYWx3YXlzUmV0dXJuQ29udGVudCIsIndyaXRlSGVhZCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJ3cml0ZSIsImVuZCIsInN0YXR1cyIsIkFsbG93IiwicGF1c2VkIiwiaW5mbyIsImdldFN0YXRpY0ZpbGVJbmZvIiwibWF4QWdlIiwiY2FjaGVhYmxlIiwiaW5jbHVkZVZhcnlVc2VyQWdlbnQiLCJpbmNsdWRlcyIsInNldEhlYWRlciIsInNvdXJjZU1hcFVybCIsInR5cGUiLCJjb250ZW50Iiwic2VuZCIsImFic29sdXRlUGF0aCIsIm1heGFnZSIsImRvdGZpbGVzIiwibGFzdE1vZGlmaWVkIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJwaXBlIiwib3JpZ2luYWxQYXRoIiwic3RhdGljQXJjaExpc3QiLCJhcmNoSW5kZXgiLCJpbmRleE9mIiwidW5zaGlmdCIsInNvbWUiLCJzdGF0aWNGaWxlcyIsImZpbmFsaXplIiwicGFyc2VQb3J0IiwicG9ydCIsInBhcnNlZFBvcnQiLCJwYXJzZUludCIsIk51bWJlciIsImlzTmFOIiwib25NZXNzYWdlIiwicGF1c2VDbGllbnQiLCJnZW5lcmF0ZUNsaWVudFByb2dyYW0iLCJydW5XZWJBcHBTZXJ2ZXIiLCJzaHV0dGluZ0Rvd24iLCJzeW5jUXVldWUiLCJfQXN5bmNocm9ub3VzUXVldWUiLCJnZXRJdGVtUGF0aG5hbWUiLCJpdGVtVXJsIiwicmVsb2FkQ2xpZW50UHJvZ3JhbXMiLCJydW5UYXNrIiwiY29uZmlnSnNvbiIsIl9fbWV0ZW9yX2Jvb3RzdHJhcF9fIiwiY2xpZW50QXJjaHMiLCJjbGllbnRQYXRocyIsInN0YWNrIiwicHJvY2VzcyIsImV4aXQiLCJ1bnBhdXNlIiwiY2xpZW50RGlyIiwicGF0aERpcm5hbWUiLCJzZXJ2ZXJEaXIiLCJwcm9ncmFtSnNvblBhdGgiLCJwcm9ncmFtSnNvbiIsInJlYWRGaWxlU3luYyIsImNvZGUiLCJmb3JtYXQiLCJpdGVtIiwid2hlcmUiLCJzb3VyY2VNYXAiLCJQVUJMSUNfU0VUVElOR1MiLCJjb25maWdPdmVycmlkZXMiLCJvbGRQcm9ncmFtIiwibmV3UHJvZ3JhbSIsIldlYkFwcEhhc2hpbmciLCJ2ZXJzaW9uUmVmcmVzaGFibGUiLCJ2ZXJzaW9uTm9uUmVmcmVzaGFibGUiLCJyZXBsYWNlYWJsZSIsInZlcnNpb25SZXBsYWNlYWJsZSIsIl90eXBlIiwiY29yZG92YUNvbXBhdGliaWxpdHlWZXJzaW9ucyIsImhtclZlcnNpb24iLCJtYW5pZmVzdFVybFByZWZpeCIsInJlcGxhY2UiLCJtYW5pZmVzdFVybCIsIlBhY2thZ2UiLCJhdXRvdXBkYXRlIiwiQVVUT1VQREFURV9WRVJTSU9OIiwiQXV0b3VwZGF0ZSIsImF1dG91cGRhdGVWZXJzaW9uIiwiZW52IiwiZ2VuZXJhdGVCb2lsZXJwbGF0ZUZvckFyY2giLCJkZWZhdWx0T3B0aW9uc0ZvckFyY2giLCJERFBfREVGQVVMVF9DT05ORUNUSU9OX1VSTCIsIk1PQklMRV9ERFBfVVJMIiwiYWJzb2x1dGVVcmwiLCJST09UX1VSTCIsIk1PQklMRV9ST09UX1VSTCIsImdlbmVyYXRlQm9pbGVycGxhdGUiLCJyZWZyZXNoYWJsZUFzc2V0cyIsImNzcyIsImZpbGUiLCJyYXdFeHByZXNzSGFuZGxlcnMiLCJ1c2UiLCJjb29raWVQYXJzZXIiLCJpc1ZhbGlkVXJsIiwiZ2V0UGF0aFBhcnRzIiwic2hpZnQiLCJpc1ByZWZpeE9mIiwicHJlZml4IiwiYXJyYXkiLCJldmVyeSIsInBhcnQiLCJwYXRoUHJlZml4Iiwic2VhcmNoIiwicHJlZml4UGFydHMiLCJtZXRlb3JJbnRlcm5hbEhhbmRsZXJzIiwicGFja2FnZUFuZEFwcEhhbmRsZXJzIiwic3VwcHJlc3NFeHByZXNzRXJyb3JzIiwiaXNEZXZlbG9wbWVudCIsIm5ld0hlYWRlcnMiLCJkaXNhYmxlQm9pbGVycGxhdGVSZXNwb25zZSIsImNhdGNoIiwiaHR0cFNlcnZlciIsImNyZWF0ZVNlcnZlciIsIm9uTGlzdGVuaW5nQ2FsbGJhY2tzIiwic29ja2V0IiwiZGVzdHJveWVkIiwibWVzc2FnZSIsImRlc3Ryb3kiLCJzdXBwcmVzc0Vycm9ycyIsIndhcm5lZEFib3V0Q29ubmVjdFVzYWdlIiwiY29ubmVjdEhhbmRsZXJzIiwiaGFuZGxlcnMiLCJyYXdDb25uZWN0SGFuZGxlcnMiLCJyYXdIYW5kbGVycyIsImV4cHJlc3NBcHAiLCJzdXBwcmVzc0Nvbm5lY3RFcnJvcnMiLCJfZGVidWciLCJfc3VwcHJlc3NFeHByZXNzRXJyb3JzIiwib25MaXN0ZW5pbmciLCJmIiwic3RhcnRMaXN0ZW5pbmciLCJsaXN0ZW5PcHRpb25zIiwibGlzdGVuIiwiZXhwb3J0cyIsIm1haW4iLCJhcmd2Iiwic3RhcnRIdHRwU2VydmVyIiwiYmluZEVudmlyb25tZW50IiwiTUVURU9SX1BSSU5UX09OX0xJU1RFTiIsImNvbnNvbGUiLCJsb2ciLCJjYWxsYmFja3MiLCJsb2NhbFBvcnQiLCJQT1JUIiwidW5peFNvY2tldFBhdGgiLCJVTklYX1NPQ0tFVF9QQVRIIiwiY2x1c3RlciIsImlzV29ya2VyIiwid29ya2VyTmFtZSIsIndvcmtlciIsImlkIiwicmVtb3ZlRXhpc3RpbmdTb2NrZXRGaWxlIiwidW5peFNvY2tldFBlcm1pc3Npb25zIiwiVU5JWF9TT0NLRVRfUEVSTUlTU0lPTlMiLCJ0cmltIiwidGVzdCIsImNobW9kU3luYyIsInVuaXhTb2NrZXRHcm91cCIsIlVOSVhfU09DS0VUX0dST1VQIiwidW5peFNvY2tldEdyb3VwSW5mbyIsImdldEdyb3VwSW5mbyIsImNob3duU3luYyIsInVzZXJJbmZvIiwidWlkIiwiZ2lkIiwicmVnaXN0ZXJTb2NrZXRGaWxlQ2xlYW51cCIsImhvc3QiLCJCSU5EX0lQIiwiaXNHZXRlbnRBdmFpbGFibGUiLCJleGVjU3luYyIsImdldEdyb3VwSW5mb1VzaW5nR2V0ZW50IiwiZ3JvdXBOYW1lIiwic3Rkb3V0IiwiZW5jb2RpbmciLCJnZXRHcm91cEluZm9Gcm9tRmlsZSIsImdyb3VwTGluZSIsImZpbmQiLCJsaW5lIiwiZ3JvdXBJbmZvIiwic2V0SW5saW5lU2NyaXB0c0FsbG93ZWQiLCJlbmFibGVTdWJyZXNvdXJjZUludGVncml0eSIsInVzZV9jcmVkZW50aWFscyIsInNldEJ1bmRsZWRKc0Nzc1VybFJld3JpdGVIb29rIiwiaG9va0ZuIiwic2V0QnVuZGxlZEpzQ3NzUHJlZml4Iiwic2VsZiIsImFkZFN0YXRpY0pzIiwic3RhdFN5bmMiLCJ1bmxpbmtTeW5jIiwiZXhpc3RzU3luYyIsInNvY2tldFBhdGgiLCJpc1NvY2tldCIsImV2ZW50RW1pdHRlciIsInNpZ25hbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUE0QjtBQUM0QjtBQUNwQjtBQUNOO0FBQ2tDO0FBQzVCO0FBQ047QUFDSztBQUNNO0FBQ3JCO0FBQ2dCO0FBQ3FCO0FBQ1A7QUFDMUI7QUFJRTtBQUNJO0FBQ1c7QUFDa0I7QUFFM0QsSUFBSUEsdUJBQXVCLElBQUk7QUFDL0IsSUFBSUMsc0JBQXNCLE1BQU07QUFFaEMsTUFBTUMsbUJBQW1CO0lBQ3ZCLE1BQU1DLE1BQU1DO0lBQ1osa0NBQWtDO0lBQ2xDLDJGQUEyRjtJQUMzRkQsSUFBSUUsR0FBRyxDQUFDLGdCQUFnQjtJQUN4QkYsSUFBSUUsR0FBRyxDQUFDLFFBQVE7SUFDaEJGLElBQUlFLEdBQUcsQ0FBQyxnQkFBZ0JDLEdBQUdDLEtBQUs7SUFDaEMsT0FBT0o7QUFDVDtBQUNBLE9BQU8sTUFBTUssS0FBWTtBQUN6QixPQUFPLE1BQU1DLGNBQXFCO0FBRWxDLE1BQU1DLFNBQVNDLE9BQU9DLFNBQVMsQ0FBQ0MsY0FBYztBQUc5Q0osZ0JBQWdCSyxVQUFVLEdBQUc7SUFDM0JWLFNBQVU7UUFDUlcsU0FBU0MsSUFBSUMsT0FBTyxDQUFDLHdCQUF3QkYsT0FBTztRQUNwREcsUUFBUWQ7SUFDVjtBQUNGO0FBRUEseUNBQXlDO0FBQ3pDSSxPQUFPSixPQUFPLEdBQUdBO0FBRWpCLG9FQUFvRTtBQUNwRSwrREFBK0Q7QUFDL0RJLE9BQU9XLFdBQVcsR0FBRztBQUVyQiw4QkFBOEI7QUFDOUJYLE9BQU9Z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TztRQUNkLCtEQUErRDtRQUMvRCxrRUFBa0U7UUFDbEUsbUJBQW1CO1FBQ25CLElBQUlBLE1BQU15QyxJQUFJLEtBQUssVUFBVTtZQUMzQixNQUFNekM7UUFDUjtJQUNGO0FBQ0YsRUFBRTtBQUVGLHdFQUF3RTtBQUN4RSxzRUFBc0U7QUFDdEUsNENBQTRDO0FBQzVDLE9BQU8sTUFBTXlKLDRCQUNYLENBQUN5QixZQUFZRSxlQUFlcEosSUFBTztJQUNqQztRQUFDO1FBQVE7UUFBVTtRQUFVO0tBQVUsQ0FBQ2pLLE9BQU8sQ0FBQ3NUO1FBQzlDRCxhQUFhM1IsRUFBRSxDQUFDNFIsUUFBUTdTLE9BQU9xUCxlQUFlLENBQUM7WUFDN0MsSUFBSW9ELFdBQVdDLGFBQWE7Z0JBQzFCRixXQUFXRTtZQUNiO1FBQ0Y7SUFDRjtBQUNGLEVBQUUiLCJmaWxlIjoiL3BhY2thZ2VzL3dlYmFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgY2htb2RTeW5jLCBjaG93blN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IHVzZXJJbmZvIH0gZnJvbSAnb3MnO1xuaW1wb3J0IHsgam9pbiBhcyBwYXRoSm9pbiwgZGlybmFtZSBhcyBwYXRoRGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb21wcmVzcyBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgY29va2llUGFyc2VyIGZyb20gJ2Nvb2tpZS1wYXJzZXInO1xuaW1wb3J0IHFzIGZyb20gJ3FzJztcbmltcG9ydCBwYXJzZVJlcXVlc3QgZnJvbSAncGFyc2V1cmwnO1xuaW1wb3J0IHsgbG9va3VwIGFzIGxvb2t1cFVzZXJBZ2VudCB9IGZyb20gJ3VzZXJhZ2VudC1uZyc7XG5pbXBvcnQgeyBpc01vZGVybiB9IGZyb20gJ21ldGVvci9tb2Rlcm4tYnJvd3NlcnMnO1xuaW1wb3J0IHNlbmQgZnJvbSAnc2VuZCc7XG5pbXBvcnQge1xuICByZW1vdmVFeGlzdGluZ1NvY2tldEZpbGUsXG4gIHJlZ2lzdGVyU29ja2V0RmlsZUNsZWFudXAsXG59IGZyb20gJy4vc29ja2V0X2ZpbGUuanMnO1xuaW1wb3J0IGNsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgb25NZXNzYWdlIH0gZnJvbSAnbWV0ZW9yL2ludGVyLXByb2Nlc3MtbWVzc2FnaW5nJztcblxudmFyIFNIT1JUX1NPQ0tFVF9USU1FT1VUID0gNSAqIDEwMDA7XG52YXIgTE9OR19TT0NLRVRfVElNRU9VVCA9IDEyMCAqIDEwMDA7XG5cbmNvbnN0IGNyZWF0ZUV4cHJlc3NBcHAgPSAoKSA9PiB7XG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbiAgLy8gU2VjdXJpdHkgYW5kIHBlcmZvcm1hY2UgaGVhZGVyc1xuICAvLyB0aGVzZSBoZWFkZXJzIGNvbWUgZnJvbSB0aGVzZSBkb2NzOiBodHRwczovL2V4cHJlc3Nqcy5jb20vZW4vYXBpLmh0bWwjYXBwLnNldHRpbmdzLnRhYmxlXG4gIGFwcC5zZXQoJ3gtcG93ZXJlZC1ieScsIGZhbHNlKTtcbiAgYXBwLnNldCgnZXRhZycsIGZhbHNlKTtcbiAgYXBwLnNldCgncXVlcnkgcGFyc2VyJywgcXMucGFyc2UpO1xuICByZXR1cm4gYXBwO1xufVxuZXhwb3J0IGNvbnN0IFdlYkFwcCA9IHt9O1xuZXhwb3J0IGNvbnN0IFdlYkFwcEludGVybmFscyA9IHt9O1xuXG5jb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5cbldlYkFwcEludGVybmFscy5OcG1Nb2R1bGVzID0ge1xuICBleHByZXNzIDoge1xuICAgIHZlcnNpb246IE5wbS5yZXF1aXJlKCdleHByZXNzL3BhY2thZ2UuanNvbicpLnZlcnNpb24sXG4gICAgbW9kdWxlOiBleHByZXNzLFxuICB9XG59O1xuXG4vLyBNb3JlIG9mIGEgY29udmVuaWVuY2UgZm9yIHRoZSBlbmQgdXNlclxuV2ViQXBwLmV4cHJlc3MgPSBleHByZXNzO1xuXG4vLyBUaG91Z2ggd2UgbWlnaHQgcHJlZmVyIHRvIHVzZSB3ZWIuYnJvd3NlciAobW9kZXJuKSBhcyB0aGUgZGVmYXVsdFxuLy8gYXJjaGl0ZWN0dXJlLCBzYWZldHkgcmVxdWlyZXMgYSBtb3JlIGNvbXBhdGlibGUgZGVmYXVsdEFyY2guXG5XZWJBcHAuZGVmYXVsdEFyY2ggPSAnd2ViLmJyb3dzZXIubGVnYWN5JztcblxuLy8gWFhYIG1hcHMgYXJjaHMgdG8gbWFuaWZlc3RzXG5XZWJBcHAuY2xpZW50UHJvZ3JhbXMgPSB7fTtcblxuLy8gWFhYIG1hcHMgYXJjaHMgdG8gcHJvZ3JhbSBwYXRoIG9uIGZpbGVzeXN0ZW1cbnZhciBhcmNoUGF0aCA9IHt9O1xuXG52YXIgYnVuZGxlZEpzQ3NzVXJsUmV3cml0ZUhvb2sgPSBmdW5jdGlvbih1cmwpIHtcbiAgdmFyIGJ1bmRsZWRQcmVmaXggPSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMX1BBVEhfUFJFRklYIHx8ICcnO1xuICByZXR1cm4gYnVuZGxlZFByZWZpeCArIHVybDtcbn07XG5cbnZhciBzaGExID0gZnVuY3Rpb24oY29udGVudHMpIHtcbiAgdmFyIGhhc2ggPSBjcmVhdGVIYXNoKCdzaGExJyk7XG4gIGhhc2gudXBkYXRlKGNvbnRlbnRzKTtcbiAgcmV0dXJuIGhhc2guZGlnZXN0KCdoZXgnKTtcbn07XG5cbmZ1bmN0aW9uIHNob3VsZENvbXByZXNzKHJlcSwgcmVzKSB7XG4gIGlmIChyZXEuaGVhZGVyc1sneC1uby1jb21wcmVzc2lvbiddKSB7XG4gICAgLy8gZG9uJ3QgY29tcHJlc3MgcmVzcG9uc2VzIHdpdGggdGhpcyByZXF1ZXN0IGhlYWRlclxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrIHRvIHN0YW5kYXJkIGZpbHRlciBmdW5jdGlvblxuICByZXR1cm4gY29tcHJlc3MuZmlsdGVyKHJlcSwgcmVzKTtcbn1cblxuLy8gI0Jyb3dzZXJJZGVudGlmaWNhdGlvblxuLy9cbi8vIFdlIGhhdmUgbXVsdGlwbGUgcGxhY2VzIHRoYXQgd2FudCB0byBpZGVudGlmeSB0aGUgYnJvd3NlcjogdGhlXG4vLyB1bnN1cHBvcnRlZCBicm93c2VyIHBhZ2UsIHRoZSBhcHBjYWNoZSBwYWNrYWdlLCBhbmQsIGV2ZW50dWFsbHlcbi8vIGRlbGl2ZXJpbmcgYnJvd3NlciBwb2x5ZmlsbHMgb25seSBhcyBuZWVkZWQuXG4vL1xuLy8gVG8gYXZvaWQgZGV0ZWN0aW5nIHRoZSBicm93c2VyIGluIG11bHRpcGxlIHBsYWNlcyBhZC1ob2MsIHdlIGNyZWF0ZSBhXG4vLyBNZXRlb3IgXCJicm93c2VyXCIgb2JqZWN0LiBJdCB1c2VzIGJ1dCBkb2VzIG5vdCBleHBvc2UgdGhlIG5wbVxuLy8gdXNlcmFnZW50IG1vZHVsZSAod2UgY291bGQgY2hvb3NlIGEgZGlmZmVyZW50IG1lY2hhbmlzbSB0byBpZGVudGlmeVxuLy8gdGhlIGJyb3dzZXIgaW4gdGhlIGZ1dHVyZSBpZiB3ZSB3YW50ZWQgdG8pLiAgVGhlIGJyb3dzZXIgb2JqZWN0XG4vLyBjb250YWluc1xuLy9cbi8vICogYG5hbWVgOiB0aGUgbmFtZSBvZiB0aGUgYnJvd3NlciBpbiBjYW1lbCBjYXNlXG4vLyAqIGBtYWpvcmAsIGBtaW5vcmAsIGBwYXRjaGA6IGludGVnZXJzIGRlc2NyaWJpbmcgdGhlIGJyb3dzZXIgdmVyc2lvblxuLy9cbi8vIEFsc28gaGVyZSBpcyBhbiBlYXJseSB2ZXJzaW9uIG9mIGEgTWV0ZW9yIGByZXF1ZXN0YCBvYmplY3QsIGludGVuZGVkXG4vLyB0byBiZSBhIGhpZ2gtbGV2ZWwgZGVzY3JpcHRpb24gb2YgdGhlIHJlcXVlc3Qgd2l0aG91dCBleHBvc2luZ1xuLy8gZGV0YWlscyBvZiBFeHByZXNzJ3MgbG93LWxldmVsIGByZXFgLiAgQ3VycmVudGx5IGl0IGNvbnRhaW5zOlxuLy9cbi8vICogYGJyb3dzZXJgOiBicm93c2VyIGlkZW50aWZpY2F0aW9uIG9iamVjdCBkZXNjcmliZWQgYWJvdmVcbi8vICogYHVybGA6IHBhcnNlZCB1cmwsIGluY2x1ZGluZyBwYXJzZWQgcXVlcnkgcGFyYW1zXG4vL1xuLy8gQXMgYSB0ZW1wb3JhcnkgaGFjayB0aGVyZSBpcyBhIGBjYXRlZ29yaXplUmVxdWVzdGAgZnVuY3Rpb24gb24gV2ViQXBwIHdoaWNoXG4vLyBjb252ZXJ0cyBhIEV4cHJlc3MgYHJlcWAgdG8gYSBNZXRlb3IgYHJlcXVlc3RgLiBUaGlzIGNhbiBnbyBhd2F5IG9uY2Ugc21hcnRcbi8vIHBhY2thZ2VzIHN1Y2ggYXMgYXBwY2FjaGUgYXJlIGJlaW5nIHBhc3NlZCBhIGByZXF1ZXN0YCBvYmplY3QgZGlyZWN0bHkgd2hlblxuLy8gdGhleSBzZXJ2ZSBjb250ZW50LlxuLy9cbi8vIFRoaXMgYWxsb3dzIGByZXF1ZXN0YCB0byBiZSB1c2VkIHVuaWZvcm1seTogaXQgaXMgcGFzc2VkIHRvIHRoZSBodG1sXG4vLyBhdHRyaWJ1dGVzIGhvb2ssIGFuZCB0aGUgYXBwY2FjaGUgcGFja2FnZSBjYW4gdXNlIGl0IHdoZW4gZGVjaWRpbmdcbi8vIHdoZXRoZXIgdG8gZ2VuZXJhdGUgYSA0MDQgZm9yIHRoZSBtYW5pZmVzdC5cbi8vXG4vLyBSZWFsIHJvdXRpbmcgLyBzZXJ2ZXIgc2lkZSByZW5kZXJpbmcgd2lsbCBwcm9iYWJseSByZWZhY3RvciB0aGlzXG4vLyBoZWF2aWx5LlxuXG4vLyBlLmcuIFwiTW9iaWxlIFNhZmFyaVwiID0+IFwibW9iaWxlU2FmYXJpXCJcbnZhciBjYW1lbENhc2UgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJyAnKTtcbiAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgcGFydHNbaV0gPSBwYXJ0c1tpXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnRzW2ldLnN1YnN0cmluZygxKTtcbiAgfVxuICByZXR1cm4gcGFydHMuam9pbignJyk7XG59O1xuXG52YXIgaWRlbnRpZnlCcm93c2VyID0gZnVuY3Rpb24odXNlckFnZW50U3RyaW5nKSB7XG4gIGlmICghdXNlckFnZW50U3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd1bmtub3duJyxcbiAgICAgIG1ham9yOiAwLFxuICAgICAgbWlub3I6IDAsXG4gICAgICBwYXRjaDogMFxuICAgIH07XG4gIH1cbiAgdmFyIHVzZXJBZ2VudCA9IGxvb2t1cFVzZXJBZ2VudCh1c2VyQWdlbnRTdHJpbmcpO1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGNhbWVsQ2FzZSh1c2VyQWdlbnQuZmFtaWx5KSxcbiAgICBtYWpvcjogK3VzZXJBZ2VudC5tYWpvcixcbiAgICBtaW5vcjogK3VzZXJBZ2VudC5taW5vcixcbiAgICBwYXRjaDogK3VzZXJBZ2VudC5wYXRjaCxcbiAgfTtcbn07XG5cbi8vIFhYWCBSZWZhY3RvciBhcyBwYXJ0IG9mIGltcGxlbWVudGluZyByZWFsIHJvdXRpbmcuXG5XZWJBcHBJbnRlcm5hbHMuaWRlbnRpZnlCcm93c2VyID0gaWRlbnRpZnlCcm93c2VyO1xuXG5XZWJBcHAuY2F0ZWdvcml6ZVJlcXVlc3QgPSBmdW5jdGlvbihyZXEpIHtcbiAgaWYgKHJlcS5icm93c2VyICYmIHJlcS5hcmNoICYmIHR5cGVvZiByZXEubW9kZXJuID09PSAnYm9vbGVhbicpIHtcbiAgICAvLyBBbHJlYWR5IGNhdGVnb3JpemVkLlxuICAgIHJldHVybiByZXE7XG4gIH1cblxuICBjb25zdCBicm93c2VyID0gaWRlbnRpZnlCcm93c2VyKHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J10pO1xuICBjb25zdCBtb2Rlcm4gPSBpc01vZGVybihicm93c2VyKTtcbiAgY29uc3QgcGF0aCA9XG4gICAgdHlwZW9mIHJlcS5wYXRobmFtZSA9PT0gJ3N0cmluZydcbiAgICAgID8gcmVxLnBhdGhuYW1lXG4gICAgICA6IHBhcnNlUmVxdWVzdChyZXEpLnBhdGhuYW1lO1xuXG4gIGNvbnN0IGNhdGVnb3JpemVkID0ge1xuICAgIGJyb3dzZXIsXG4gICAgbW9kZXJuLFxuICAgIHBhdGgsXG4gICAgYXJjaDogV2ViQXBwLmRlZmF1bHRBcmNoLFxuICAgIHVybDogeyBxdWVyeTogT2JqZWN0LmZyb21FbnRyaWVzKG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKS5zZWFyY2hQYXJhbXMpIH0sXG4gICAgZHluYW1pY0hlYWQ6IHJlcS5keW5hbWljSGVhZCxcbiAgICBkeW5hbWljQm9keTogcmVxLmR5bmFtaWNCb2R5LFxuICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLFxuICAgIGNvb2tpZXM6IHJlcS5jb29raWVzLFxuICB9O1xuXG4gIGNvbnN0IHBhdGhQYXJ0cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgY29uc3QgYXJjaEtleSA9IHBhdGhQYXJ0c1sxXTtcblxuICBpZiAoYXJjaEtleS5zdGFydHNXaXRoKCdfXycpKSB7XG4gICAgY29uc3QgYXJjaENsZWFuZWQgPSAnd2ViLicgKyBhcmNoS2V5LnNsaWNlKDIpO1xuICAgIGlmIChoYXNPd24uY2FsbChXZWJBcHAuY2xpZW50UHJvZ3JhbXMsIGFyY2hDbGVhbmVkKSkge1xuICAgICAgcGF0aFBhcnRzLnNwbGljZSgxLCAxKTsgLy8gUmVtb3ZlIHRoZSBhcmNoS2V5IHBhcnQuXG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihjYXRlZ29yaXplZCwge1xuICAgICAgICBhcmNoOiBhcmNoQ2xlYW5lZCxcbiAgICAgICAgcGF0aDogcGF0aFBhcnRzLmpvaW4oJy8nKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gUGVyaGFwcyBvbmUgZGF5IHdlIGNvdWxkIGluZmVyIENvcmRvdmEgY2xpZW50cyBoZXJlLCBzbyB0aGF0IHdlXG4gIC8vIHdvdWxkbid0IGhhdmUgdG8gdXNlIHByZWZpeGVkIFwiL19fY29yZG92YS8uLi5cIiBVUkxzLlxuICBjb25zdCBwcmVmZXJyZWRBcmNoT3JkZXIgPSBpc01vZGVybihicm93c2VyKVxuICAgID8gWyd3ZWIuYnJvd3NlcicsICd3ZWIuYnJvd3Nlci5sZWdhY3knXVxuICAgIDogWyd3ZWIuYnJvd3Nlci5sZWdhY3knLCAnd2ViLmJyb3dzZXInXTtcblxuICBmb3IgKGNvbnN0IGFyY2ggb2YgcHJlZmVycmVkQXJjaE9yZGVyKSB7XG4gICAgLy8gSWYgb3VyIHByZWZlcnJlZCBhcmNoIGlzIG5vdCBhdmFpbGFibGUsIGl0J3MgYmV0dGVyIHRvIHVzZSBhbm90aGVyXG4gICAgLy8gY2xpZW50IGFyY2ggdGhhdCBpcyBhdmFpbGFibGUgdGhhbiB0byBndWFyYW50ZWUgdGhlIHNpdGUgd29uJ3Qgd29ya1xuICAgIC8vIGJ5IHJldHVybmluZyBhbiB1bmtub3duIGFyY2guIEZvciBleGFtcGxlLCBpZiB3ZWIuYnJvd3Nlci5sZWdhY3kgaXNcbiAgICAvLyBleGNsdWRlZCB1c2luZyB0aGUgLS1leGNsdWRlLWFyY2hzIGNvbW1hbmQtbGluZSBvcHRpb24sIGxlZ2FjeVxuICAgIC8vIGNsaWVudHMgYXJlIGJldHRlciBvZmYgcmVjZWl2aW5nIHdlYi5icm93c2VyICh3aGljaCBtaWdodCBhY3R1YWxseVxuICAgIC8vIHdvcmspIHRoYW4gcmVjZWl2aW5nIGFuIEhUVFAgNDA0IHJlc3BvbnNlLiBJZiBub25lIG9mIHRoZSBhcmNocyBpblxuICAgIC8vIHByZWZlcnJlZEFyY2hPcmRlciBhcmUgZGVmaW5lZCwgb25seSB0aGVuIHNob3VsZCB3ZSBzZW5kIGEgNDA0LlxuICAgIGlmIChoYXNPd24uY2FsbChXZWJBcHAuY2xpZW50UHJvZ3JhbXMsIGFyY2gpKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihjYXRlZ29yaXplZCwgeyBhcmNoIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjYXRlZ29yaXplZDtcbn07XG5cbi8vIEhUTUwgYXR0cmlidXRlIGhvb2tzOiBmdW5jdGlvbnMgdG8gYmUgY2FsbGVkIHRvIGRldGVybWluZSBhbnkgYXR0cmlidXRlcyB0b1xuLy8gYmUgYWRkZWQgdG8gdGhlICc8aHRtbD4nIHRhZy4gRWFjaCBmdW5jdGlvbiBpcyBwYXNzZWQgYSAncmVxdWVzdCcgb2JqZWN0IChzZWVcbi8vICNCcm93c2VySWRlbnRpZmljYXRpb24pIGFuZCBzaG91bGQgcmV0dXJuIG51bGwgb3Igb2JqZWN0LlxudmFyIGh0bWxBdHRyaWJ1dGVIb29rcyA9IFtdO1xudmFyIGdldEh0bWxBdHRyaWJ1dGVzID0gZnVuY3Rpb24ocmVxdWVzdCkge1xuICB2YXIgY29tYmluZWRBdHRyaWJ1dGVzID0ge307XG4gIChodG1sQXR0cmlidXRlSG9va3MgfHwgW10pLmZvckVhY2goZnVuY3Rpb24oaG9vaykge1xuICAgIHZhciBhdHRyaWJ1dGVzID0gaG9vayhyZXF1ZXN0KTtcbiAgICBpZiAoYXR0cmlidXRlcyA9PT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgYXR0cmlidXRlcyAhPT0gJ29iamVjdCcpXG4gICAgICB0aHJvdyBFcnJvcignSFRNTCBhdHRyaWJ1dGUgaG9vayBtdXN0IHJldHVybiBudWxsIG9yIG9iamVjdCcpO1xuICAgIE9iamVjdC5hc3NpZ24oY29tYmluZWRBdHRyaWJ1dGVzLCBhdHRyaWJ1dGVzKTtcbiAgfSk7XG4gIHJldHVybiBjb21iaW5lZEF0dHJpYnV0ZXM7XG59O1xuV2ViQXBwLmFkZEh0bWxBdHRyaWJ1dGVIb29rID0gZnVuY3Rpb24oaG9vaykge1xuICBodG1sQXR0cmlidXRlSG9va3MucHVzaChob29rKTtcbn07XG5cbi8vIFNlcnZlIGFwcCBIVE1MIGZvciB0aGlzIFVSTD9cbnZhciBhcHBVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKHVybCA9PT0gJy9mYXZpY29uLmljbycgfHwgdXJsID09PSAnL3JvYm90cy50eHQnKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gTk9URTogYXBwLm1hbmlmZXN0IGlzIG5vdCBhIHdlYiBzdGFuZGFyZCBsaWtlIGZhdmljb24uaWNvIGFuZFxuICAvLyByb2JvdHMudHh0LiBJdCBpcyBhIGZpbGUgbmFtZSB3ZSBoYXZlIGNob3NlbiB0byB1c2UgZm9yIEhUTUw1XG4gIC8vIGFwcGNhY2hlIFVSTHMuIEl0IGlzIGluY2x1ZGVkIGhlcmUgdG8gcHJldmVudCB1c2luZyBhbiBhcHBjYWNoZVxuICAvLyB0aGVuIHJlbW92aW5nIGl0IGZyb20gcG9pc29uaW5nIGFuIGFwcCBwZXJtYW5lbnRseS4gRXZlbnR1YWxseSxcbiAgLy8gb25jZSB3ZSBoYXZlIHNlcnZlciBzaWRlIHJvdXRpbmcsIHRoaXMgd29uJ3QgYmUgbmVlZGVkIGFzXG4gIC8vIHVua25vd24gVVJMcyB3aXRoIHJldHVybiBhIDQwNCBhdXRvbWF0aWNhbGx5LlxuICBpZiAodXJsID09PSAnL2FwcC5tYW5pZmVzdCcpIHJldHVybiBmYWxzZTtcblxuICAvLyBBdm9pZCBzZXJ2aW5nIGFwcCBIVE1MIGZvciBkZWNsYXJlZCByb3V0ZXMgc3VjaCBhcyAvc29ja2pzLy5cbiAgaWYgKFJvdXRlUG9saWN5LmNsYXNzaWZ5KHVybCkpIHJldHVybiBmYWxzZTtcblxuICAvLyB3ZSBjdXJyZW50bHkgcmV0dXJuIGFwcCBIVE1MIG9uIGFsbCBVUkxzIGJ5IGRlZmF1bHRcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBXZSBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgY2xpZW50IGhhc2ggYWZ0ZXIgYWxsIHBhY2thZ2VzIGhhdmUgbG9hZGVkXG4vLyB0byBnaXZlIHRoZW0gYSBjaGFuY2UgdG8gcG9wdWxhdGUgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5cbi8vXG4vLyBDYWxjdWxhdGluZyB0aGUgaGFzaCBkdXJpbmcgc3RhcnR1cCBtZWFucyB0aGF0IHBhY2thZ2VzIGNhbiBvbmx5XG4vLyBwb3B1bGF0ZSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIGR1cmluZyBsb2FkLCBub3QgZHVyaW5nIHN0YXJ0dXAuXG4vL1xuLy8gQ2FsY3VsYXRpbmcgaW5zdGVhZCBpdCBhdCB0aGUgYmVnaW5uaW5nIG9mIG1haW4gYWZ0ZXIgYWxsIHN0YXJ0dXBcbi8vIGhvb2tzIGhhZCBydW4gd291bGQgYWxsb3cgcGFja2FnZXMgdG8gYWxzbyBwb3B1bGF0ZVxuLy8gX19tZXRlb3JfcnVudGltZV9jb25maWdfXyBkdXJpbmcgc3RhcnR1cCwgYnV0IHRoYXQncyB0b28gbGF0ZSBmb3Jcbi8vIGF1dG91cGRhdGUgYmVjYXVzZSBpdCBuZWVkcyB0byBoYXZlIHRoZSBjbGllbnQgaGFzaCBhdCBzdGFydHVwIHRvXG4vLyBpbnNlcnQgdGhlIGF1dG8gdXBkYXRlIHZlcnNpb24gaXRzZWxmIGludG9cbi8vIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18gdG8gZ2V0IGl0IHRvIHRoZSBjbGllbnQuXG4vL1xuLy8gQW4gYWx0ZXJuYXRpdmUgd291bGQgYmUgdG8gZ2l2ZSBhdXRvdXBkYXRlIGEgXCJwb3N0LXN0YXJ0LFxuLy8gcHJlLWxpc3RlblwiIGhvb2sgdG8gYWxsb3cgaXQgdG8gaW5zZXJ0IHRoZSBhdXRvIHVwZGF0ZSB2ZXJzaW9uIGF0XG4vLyB0aGUgcmlnaHQgbW9tZW50LlxuXG5NZXRlb3Iuc3RhcnR1cChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gZ2V0dGVyKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcmNoKSB7XG4gICAgICBhcmNoID0gYXJjaCB8fCBXZWJBcHAuZGVmYXVsdEFyY2g7XG4gICAgICBjb25zdCBwcm9ncmFtID0gV2ViQXBwLmNsaWVudFByb2dyYW1zW2FyY2hdO1xuICAgICAgY29uc3QgdmFsdWUgPSBwcm9ncmFtICYmIHByb2dyYW1ba2V5XTtcbiAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UgaGF2ZSBjYWxjdWxhdGVkIHRoaXMgaGFzaCxcbiAgICAgIC8vIHByb2dyYW1ba2V5XSB3aWxsIGJlIGEgdGh1bmsgKGxhenkgZnVuY3Rpb24gd2l0aCBubyBwYXJhbWV0ZXJzKVxuICAgICAgLy8gdGhhdCB3ZSBzaG91bGQgY2FsbCB0byBkbyB0aGUgYWN0dWFsIGNvbXB1dGF0aW9uLlxuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/IChwcm9ncmFtW2tleV0gPSB2YWx1ZSgpKSA6IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBXZWJBcHAuY2FsY3VsYXRlQ2xpZW50SGFzaCA9IFdlYkFwcC5jbGllbnRIYXNoID0gZ2V0dGVyKCd2ZXJzaW9uJyk7XG4gIFdlYkFwcC5jYWxjdWxhdGVDbGllbnRIYXNoUmVmcmVzaGFibGUgPSBnZXR0ZXIoJ3ZlcnNpb25SZWZyZXNoYWJsZScpO1xuICBXZWJBcHAuY2FsY3VsYXRlQ2xpZW50SGFzaE5vblJlZnJlc2hhYmxlID0gZ2V0dGVyKCd2ZXJzaW9uTm9uUmVmcmVzaGFibGUnKTtcbiAgV2ViQXBwLmNhbGN1bGF0ZUNsaWVudEhhc2hSZXBsYWNlYWJsZSA9IGdldHRlcigndmVyc2lvblJlcGxhY2VhYmxlJyk7XG4gIFdlYkFwcC5nZXRSZWZyZXNoYWJsZUFzc2V0cyA9IGdldHRlcigncmVmcmVzaGFibGVBc3NldHMnKTtcbn0pO1xuXG4vLyBXaGVuIHdlIGhhdmUgYSByZXF1ZXN0IHBlbmRpbmcsIHdlIHdhbnQgdGhlIHNvY2tldCB0aW1lb3V0IHRvIGJlIGxvbmcsIHRvXG4vLyBnaXZlIG91cnNlbHZlcyBhIHdoaWxlIHRvIHNlcnZlIGl0LCBhbmQgdG8gYWxsb3cgc29ja2pzIGxvbmcgcG9sbHMgdG9cbi8vIGNvbXBsZXRlLiAgT24gdGhlIG90aGVyIGhhbmQsIHdlIHdhbnQgdG8gY2xvc2UgaWRsZSBzb2NrZXRzIHJlbGF0aXZlbHlcbi8vIHF1aWNrbHksIHNvIHRoYXQgd2UgY2FuIHNodXQgZG93biByZWxhdGl2ZWx5IHByb21wdGx5IGJ1dCBjbGVhbmx5LCB3aXRob3V0XG4vLyBjdXR0aW5nIG9mZiBhbnlvbmUncyByZXNwb25zZS5cbldlYkFwcC5fdGltZW91dEFkanVzdG1lbnRSZXF1ZXN0Q2FsbGJhY2sgPSBmdW5jdGlvbihyZXEsIHJlcykge1xuICAvLyB0aGlzIGlzIHJlYWxseSBqdXN0IHJlcS5zb2NrZXQuc2V0VGltZW91dChMT05HX1NPQ0tFVF9USU1FT1VUKTtcbiAgcmVxLnNldFRpbWVvdXQoTE9OR19TT0NLRVRfVElNRU9VVCk7XG4gIC8vIEluc2VydCBvdXIgbmV3IGZpbmlzaCBsaXN0ZW5lciB0byBydW4gQkVGT1JFIHRoZSBleGlzdGluZyBvbmUgd2hpY2ggcmVtb3Zlc1xuICAvLyB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgc29ja2V0LlxuICB2YXIgZmluaXNoTGlzdGVuZXJzID0gcmVzLmxpc3RlbmVycygnZmluaXNoJyk7XG4gIC8vIFhYWCBBcHBhcmVudGx5IGluIE5vZGUgMC4xMiB0aGlzIGV2ZW50IHdhcyBjYWxsZWQgJ3ByZWZpbmlzaCcuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9jb21taXQvN2M5YjYwNzBcbiAgLy8gQnV0IGl0IGhhcyBzd2l0Y2hlZCBiYWNrIHRvICdmaW5pc2gnIGluIE5vZGUgdjQ6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9wdWxsLzE0MTFcbiAgcmVzLnJlbW92ZUFsbExpc3RlbmVycygnZmluaXNoJyk7XG4gIHJlcy5vbignZmluaXNoJywgZnVuY3Rpb24oKSB7XG4gICAgcmVzLnNldFRpbWVvdXQoU0hPUlRfU09DS0VUX1RJTUVPVVQpO1xuICB9KTtcbiAgT2JqZWN0LnZhbHVlcyhmaW5pc2hMaXN0ZW5lcnMpLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgIHJlcy5vbignZmluaXNoJywgbCk7XG4gIH0pO1xufTtcblxuLy8gV2lsbCBiZSB1cGRhdGVkIGJ5IG1haW4gYmVmb3JlIHdlIGxpc3Rlbi5cbi8vIE1hcCBmcm9tIGNsaWVudCBhcmNoIHRvIGJvaWxlcnBsYXRlIG9iamVjdC5cbi8vIEJvaWxlcnBsYXRlIG9iamVjdCBoYXM6XG4vLyAgIC0gZnVuYzogWFhYXG4vLyAgIC0gYmFzZURhdGE6IFhYWFxudmFyIGJvaWxlcnBsYXRlQnlBcmNoID0ge307XG5cbi8vIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBjYW4gc2VsZWN0aXZlbHkgbW9kaWZ5IGJvaWxlcnBsYXRlXG4vLyBkYXRhIGdpdmVuIGFyZ3VtZW50cyAocmVxdWVzdCwgZGF0YSwgYXJjaCkuIFRoZSBrZXkgc2hvdWxkIGJlIGEgdW5pcXVlXG4vLyBpZGVudGlmaWVyLCB0byBwcmV2ZW50IGFjY3VtdWxhdGluZyBkdXBsaWNhdGUgY2FsbGJhY2tzIGZyb20gdGhlIHNhbWVcbi8vIGNhbGwgc2l0ZSBvdmVyIHRpbWUuIENhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgb3JkZXIgdGhleSB3ZXJlXG4vLyByZWdpc3RlcmVkLiBBIGNhbGxiYWNrIHNob3VsZCByZXR1cm4gZmFsc2UgaWYgaXQgZGlkIG5vdCBtYWtlIGFueVxuLy8gY2hhbmdlcyBhZmZlY3RpbmcgdGhlIGJvaWxlcnBsYXRlLiBQYXNzaW5nIG51bGwgZGVsZXRlcyB0aGUgY2FsbGJhY2suXG4vLyBBbnkgcHJldmlvdXMgY2FsbGJhY2sgcmVnaXN0ZXJlZCBmb3IgdGhpcyBrZXkgd2lsbCBiZSByZXR1cm5lZC5cbmNvbnN0IGJvaWxlcnBsYXRlRGF0YUNhbGxiYWNrcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5XZWJBcHBJbnRlcm5hbHMucmVnaXN0ZXJCb2lsZXJwbGF0ZURhdGFDYWxsYmFjayA9IGZ1bmN0aW9uKGtleSwgY2FsbGJhY2spIHtcbiAgY29uc3QgcHJldmlvdXNDYWxsYmFjayA9IGJvaWxlcnBsYXRlRGF0YUNhbGxiYWNrc1trZXldO1xuXG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICBib2lsZXJwbGF0ZURhdGFDYWxsYmFja3Nba2V5XSA9IGNhbGxiYWNrO1xuICB9IGVsc2Uge1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbChjYWxsYmFjaywgbnVsbCk7XG4gICAgZGVsZXRlIGJvaWxlcnBsYXRlRGF0YUNhbGxiYWNrc1trZXldO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwcmV2aW91cyBjYWxsYmFjayBpbiBjYXNlIHRoZSBuZXcgY2FsbGJhY2sgbmVlZHMgdG8gY2FsbFxuICAvLyBpdDsgZm9yIGV4YW1wbGUsIHdoZW4gdGhlIG5ldyBjYWxsYmFjayBpcyBhIHdyYXBwZXIgZm9yIHRoZSBvbGQuXG4gIHJldHVybiBwcmV2aW91c0NhbGxiYWNrIHx8IG51bGw7XG59O1xuXG4vLyBHaXZlbiBhIHJlcXVlc3QgKGFzIHJldHVybmVkIGZyb20gYGNhdGVnb3JpemVSZXF1ZXN0YCksIHJldHVybiB0aGVcbi8vIGJvaWxlcnBsYXRlIEhUTUwgdG8gc2VydmUgZm9yIHRoYXQgcmVxdWVzdC5cbi8vXG4vLyBJZiBhIHByZXZpb3VzIEV4cHJlc3MgbWlkZGxld2FyZSBoYXMgcmVuZGVyZWQgY29udGVudCBmb3IgdGhlIGhlYWQgb3IgYm9keSxcbi8vIHJldHVybnMgdGhlIGJvaWxlcnBsYXRlIHdpdGggdGhhdCBjb250ZW50IHBhdGNoZWQgaW4gb3RoZXJ3aXNlXG4vLyBtZW1vaXplcyBvbiBIVE1MIGF0dHJpYnV0ZXMgKHVzZWQgYnksIGVnLCBhcHBjYWNoZSkgYW5kIHdoZXRoZXIgaW5saW5lXG4vLyBzY3JpcHRzIGFyZSBjdXJyZW50bHkgYWxsb3dlZC5cbi8vIFhYWCBzbyBmYXIgdGhpcyBmdW5jdGlvbiBpcyBhbHdheXMgY2FsbGVkIHdpdGggYXJjaCA9PT0gJ3dlYi5icm93c2VyJ1xuZnVuY3Rpb24gZ2V0Qm9pbGVycGxhdGUocmVxdWVzdCwgYXJjaCkge1xuICByZXR1cm4gZ2V0Qm9pbGVycGxhdGVBc3luYyhyZXF1ZXN0LCBhcmNoKTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBUYWtlcyBhIHJ1bnRpbWUgY29uZmlndXJhdGlvbiBvYmplY3QgYW5kXG4gKiByZXR1cm5zIGFuIGVuY29kZWQgcnVudGltZSBzdHJpbmcuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gcnRpbWVDb25maWdcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbldlYkFwcC5lbmNvZGVSdW50aW1lQ29uZmlnID0gZnVuY3Rpb24ocnRpbWVDb25maWcpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShydGltZUNvbmZpZykpKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgVGFrZXMgYW4gZW5jb2RlZCBydW50aW1lIHN0cmluZyBhbmQgcmV0dXJuc1xuICogYSBydW50aW1lIGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHJ0aW1lQ29uZmlnU3RyaW5nXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5XZWJBcHAuZGVjb2RlUnVudGltZUNvbmZpZyA9IGZ1bmN0aW9uKHJ0aW1lQ29uZmlnU3RyKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChKU09OLnBhcnNlKHJ0aW1lQ29uZmlnU3RyKSkpO1xufTtcblxuY29uc3QgcnVudGltZUNvbmZpZyA9IHtcbiAgLy8gaG9va3Mgd2lsbCBjb250YWluIHRoZSBjYWxsYmFjayBmdW5jdGlvbnNcbiAgLy8gc2V0IGJ5IHRoZSBjYWxsZXIgdG8gYWRkUnVudGltZUNvbmZpZ0hvb2tcbiAgaG9va3M6IG5ldyBIb29rKCksXG4gIC8vIHVwZGF0ZUhvb2tzIHdpbGwgY29udGFpbiB0aGUgY2FsbGJhY2sgZnVuY3Rpb25zXG4gIC8vIHNldCBieSB0aGUgY2FsbGVyIHRvIGFkZFVwZGF0ZWROb3RpZnlIb29rXG4gIHVwZGF0ZUhvb2tzOiBuZXcgSG9vaygpLFxuICAvLyBpc1VwZGF0ZWRCeUFyY2ggaXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgZmllbGRzIGZvciBlYWNoIGFyY2hcbiAgLy8gdGhhdCB0aGlzIHNlcnZlciBzdXBwb3J0cy5cbiAgLy8gLSBFYWNoIGZpZWxkIHdpbGwgYmUgdHJ1ZSB3aGVuIHRoZSBzZXJ2ZXIgdXBkYXRlcyB0aGUgcnVudGltZUNvbmZpZyBmb3IgdGhhdCBhcmNoLlxuICAvLyAtIFdoZW4gdGhlIGhvb2sgY2FsbGJhY2sgaXMgY2FsbGVkIHRoZSB1cGRhdGUgZmllbGQgaW4gdGhlIGNhbGxiYWNrIG9iamVjdCB3aWxsIGJlXG4gIC8vIHNldCB0byBpc1VwZGF0ZWRCeUFyY2hbYXJjaF0uXG4gIC8vID0gaXNVcGRhdGVkeUJ5QXJjaFthcmNoXSBpcyByZXNldCB0byBmYWxzZSBhZnRlciB0aGUgY2FsbGJhY2suXG4gIC8vIFRoaXMgZW5hYmxlcyB0aGUgY2FsbGVyIHRvIGNhY2hlIGRhdGEgZWZmaWNpZW50bHkgc28gdGhleSBkbyBub3QgbmVlZCB0b1xuICAvLyBkZWNvZGUgJiB1cGRhdGUgZGF0YSBvbiBldmVyeSBjYWxsYmFjayB3aGVuIHRoZSBydW50aW1lQ29uZmlnIGlzIG5vdCBjaGFuZ2luZy5cbiAgaXNVcGRhdGVkQnlBcmNoOiB7fSxcbn07XG5cbi8qKlxuICogQG5hbWUgYWRkUnVudGltZUNvbmZpZ0hvb2tDYWxsYmFjayhvcHRpb25zKVxuICogQGxvY3VzIFNlcnZlclxuICogQGlzcHJvdG90eXBlIHRydWVcbiAqIEBzdW1tYXJ5IENhbGxiYWNrIGZvciBgYWRkUnVudGltZUNvbmZpZ0hvb2tgLlxuICpcbiAqIElmIHRoZSBoYW5kbGVyIHJldHVybnMgYSBfZmFsc3lfIHZhbHVlIHRoZSBob29rIHdpbGwgbm90XG4gKiBtb2RpZnkgdGhlIHJ1bnRpbWUgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBJZiB0aGUgaGFuZGxlciByZXR1cm5zIGEgX1N0cmluZ18gdGhlIGhvb2sgd2lsbCBzdWJzdGl0dXRlXG4gKiB0aGUgc3RyaW5nIGZvciB0aGUgZW5jb2RlZCBjb25maWd1cmF0aW9uIHN0cmluZy5cbiAqXG4gKiAqKldhcm5pbmc6KiogdGhlIGhvb2sgZG9lcyBub3QgY2hlY2sgdGhlIHJldHVybiB2YWx1ZSBhdCBhbGwgaXQgaXNcbiAqIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY2FsbGVyIHRvIGdldCB0aGUgZm9ybWF0dGluZyBjb3JyZWN0IHVzaW5nXG4gKiB0aGUgaGVscGVyIGZ1bmN0aW9ucy5cbiAqXG4gKiBgYWRkUnVudGltZUNvbmZpZ0hvb2tDYWxsYmFja2AgdGFrZXMgb25seSBvbmUgYE9iamVjdGAgYXJndW1lbnRcbiAqIHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuYXJjaCBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBjbGllbnRcbiAqIHJlcXVlc3RpbmcgYSBuZXcgcnVudGltZSBjb25maWd1cmF0aW9uLiBUaGlzIGNhbiBiZSBvbmUgb2ZcbiAqIGB3ZWIuYnJvd3NlcmAsIGB3ZWIuYnJvd3Nlci5sZWdhY3lgIG9yIGB3ZWIuY29yZG92YWAuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5yZXF1ZXN0XG4gKiBBIE5vZGVKcyBbSW5jb21pbmdNZXNzYWdlXShodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX2NsYXNzX2h0dHBfaW5jb21pbmdtZXNzYWdlKVxuICogaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9jbGFzc19odHRwX2luY29taW5nbWVzc2FnZVxuICogYE9iamVjdGAgdGhhdCBjYW4gYmUgdXNlZCB0byBnZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGluY29taW5nIHJlcXVlc3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5lbmNvZGVkQ3VycmVudENvbmZpZyBUaGUgY3VycmVudCBjb25maWd1cmF0aW9uIG9iamVjdFxuICogZW5jb2RlZCBhcyBhIHN0cmluZyBmb3IgaW5jbHVzaW9uIGluIHRoZSByb290IGh0bWwuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudXBkYXRlZCBgdHJ1ZWAgaWYgdGhlIGNvbmZpZyBmb3IgdGhpcyBhcmNoaXRlY3R1cmVcbiAqIGhhcyBiZWVuIHVwZGF0ZWQgc2luY2UgbGFzdCBjYWxsZWQsIG90aGVyd2lzZSBgZmFsc2VgLiBUaGlzIGZsYWcgY2FuIGJlIHVzZWRcbiAqIHRvIGNhY2hlIHRoZSBkZWNvZGluZy9lbmNvZGluZyBmb3IgZWFjaCBhcmNoaXRlY3R1cmUuXG4gKi9cblxuLyoqXG4gKiBAc3VtbWFyeSBIb29rIHRoYXQgY2FsbHMgYmFjayB3aGVuIHRoZSBtZXRlb3IgcnVudGltZSBjb25maWd1cmF0aW9uLFxuICogYF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX19gIGlzIGJlaW5nIHNlbnQgdG8gYW55IGNsaWVudC5cbiAqXG4gKiAqKnJldHVybnMqKjogPHNtYWxsPl9PYmplY3RfPC9zbWFsbD4gYHsgc3RvcDogZnVuY3Rpb24sIGNhbGxiYWNrOiBmdW5jdGlvbiB9YFxuICogLSBgc3RvcGAgPHNtYWxsPl9GdW5jdGlvbl88L3NtYWxsPiBDYWxsIGBzdG9wKClgIHRvIHN0b3AgZ2V0dGluZyBjYWxsYmFja3MuXG4gKiAtIGBjYWxsYmFja2AgPHNtYWxsPl9GdW5jdGlvbl88L3NtYWxsPiBUaGUgcGFzc2VkIGluIGBjYWxsYmFja2AuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge2FkZFJ1bnRpbWVDb25maWdIb29rQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKiBTZWUgYGFkZFJ1bnRpbWVDb25maWdIb29rQ2FsbGJhY2tgIGRlc2NyaXB0aW9uLlxuICogQHJldHVybnMge09iamVjdH0ge3sgc3RvcDogZnVuY3Rpb24sIGNhbGxiYWNrOiBmdW5jdGlvbiB9fVxuICogQ2FsbCB0aGUgcmV0dXJuZWQgYHN0b3AoKWAgdG8gc3RvcCBnZXR0aW5nIGNhbGxiYWNrcy5cbiAqIFRoZSBwYXNzZWQgaW4gYGNhbGxiYWNrYCBpcyByZXR1cm5lZCBhbHNvLlxuICovXG5XZWJBcHAuYWRkUnVudGltZUNvbmZpZ0hvb2sgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICByZXR1cm4gcnVudGltZUNvbmZpZy5ob29rcy5yZWdpc3RlcihjYWxsYmFjayk7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRCb2lsZXJwbGF0ZUFzeW5jKHJlcXVlc3QsIGFyY2gsIHJlc3BvbnNlKSB7XG4gIGxldCBib2lsZXJwbGF0ZSA9IGJvaWxlcnBsYXRlQnlBcmNoW2FyY2hdO1xuICBhd2FpdCBydW50aW1lQ29uZmlnLmhvb2tzLmZvckVhY2hBc3luYyhhc3luYyBob29rID0+IHtcbiAgICBjb25zdCBtZXRlb3JSdW50aW1lQ29uZmlnID0gYXdhaXQgaG9vayh7XG4gICAgICBhcmNoLFxuICAgICAgcmVxdWVzdCxcbiAgICAgIGVuY29kZWRDdXJyZW50Q29uZmlnOiBib2lsZXJwbGF0ZS5iYXNlRGF0YS5tZXRlb3JSdW50aW1lQ29uZmlnLFxuICAgICAgdXBkYXRlZDogcnVudGltZUNvbmZpZy5pc1VwZGF0ZWRCeUFyY2hbYXJjaF0sXG4gICAgfSk7XG4gICAgaWYgKCFtZXRlb3JSdW50aW1lQ29uZmlnKSByZXR1cm4gdHJ1ZTtcbiAgICBib2lsZXJwbGF0ZS5iYXNlRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGJvaWxlcnBsYXRlLmJhc2VEYXRhLCB7XG4gICAgICBtZXRlb3JSdW50aW1lQ29uZmlnLFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbiAgcnVudGltZUNvbmZpZy5pc1VwZGF0ZWRCeUFyY2hbYXJjaF0gPSBmYWxzZTtcbiAgY29uc3QgeyBkeW5hbWljSGVhZCwgZHluYW1pY0JvZHkgfSA9IHJlcXVlc3Q7XG4gIGNvbnN0IGRhdGEgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIGJvaWxlcnBsYXRlLmJhc2VEYXRhLFxuICAgIHtcbiAgICAgIGh0bWxBdHRyaWJ1dGVzOiBnZXRIdG1sQXR0cmlidXRlcyhyZXF1ZXN0KSxcbiAgICB9LFxuICAgIHsgZHluYW1pY0hlYWQsIGR5bmFtaWNCb2R5IH1cbiAgKTtcblxuICBsZXQgbWFkZUNoYW5nZXMgPSBmYWxzZTtcbiAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICBPYmplY3Qua2V5cyhib2lsZXJwbGF0ZURhdGFDYWxsYmFja3MpLmZvckVhY2goa2V5ID0+IHtcbiAgICBwcm9taXNlID0gcHJvbWlzZVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFjayA9IGJvaWxlcnBsYXRlRGF0YUNhbGxiYWNrc1trZXldO1xuICAgICAgICByZXR1cm4gY2FsbGJhY2socmVxdWVzdCwgZGF0YSwgYXJjaCwgcmVzcG9uc2UpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIC8vIENhbGxiYWNrcyBzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHRoZXkgZGlkIG5vdCBtYWtlIGFueSBjaGFuZ2VzLlxuICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgIG1hZGVDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBwcm9taXNlLnRoZW4oKCkgPT4gKHtcbiAgICBzdHJlYW06IGJvaWxlcnBsYXRlLnRvSFRNTFN0cmVhbShkYXRhKSxcbiAgICBzdGF0dXNDb2RlOiBkYXRhLnN0YXR1c0NvZGUsXG4gICAgaGVhZGVyczogZGF0YS5oZWFkZXJzLFxuICB9KSk7XG59XG5cbi8qKlxuICogQG5hbWUgYWRkVXBkYXRlZE5vdGlmeUhvb2tDYWxsYmFjayhvcHRpb25zKVxuICogQHN1bW1hcnkgY2FsbGJhY2sgaGFuZGxlciBmb3IgYGFkZHVwZGF0ZWROb3RpZnlIb29rYFxuICogQGlzcHJvdG90eXBlIHRydWVcbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5hcmNoIFRoZSBhcmNoaXRlY3R1cmUgdGhhdCBpcyBiZWluZyB1cGRhdGVkLlxuICogVGhpcyBjYW4gYmUgb25lIG9mIGB3ZWIuYnJvd3NlcmAsIGB3ZWIuYnJvd3Nlci5sZWdhY3lgIG9yIGB3ZWIuY29yZG92YWAuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5tYW5pZmVzdCBUaGUgbmV3IHVwZGF0ZWQgbWFuaWZlc3Qgb2JqZWN0IGZvclxuICogdGhpcyBgYXJjaGAuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5ydW50aW1lQ29uZmlnIFRoZSBuZXcgdXBkYXRlZCBjb25maWd1cmF0aW9uXG4gKiBvYmplY3QgZm9yIHRoaXMgYGFyY2hgLlxuICovXG5cbi8qKlxuICogQHN1bW1hcnkgSG9vayB0aGF0IHJ1bnMgd2hlbiB0aGUgbWV0ZW9yIHJ1bnRpbWUgY29uZmlndXJhdGlvblxuICogaXMgdXBkYXRlZC4gIFR5cGljYWxseSB0aGUgY29uZmlndXJhdGlvbiBvbmx5IGNoYW5nZXMgZHVyaW5nIGRldmVsb3BtZW50IG1vZGUuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge2FkZFVwZGF0ZWROb3RpZnlIb29rQ2FsbGJhY2t9IGhhbmRsZXJcbiAqIFRoZSBgaGFuZGxlcmAgaXMgY2FsbGVkIG9uIGV2ZXJ5IGNoYW5nZSB0byBhbiBgYXJjaGAgcnVudGltZSBjb25maWd1cmF0aW9uLlxuICogU2VlIGBhZGRVcGRhdGVkTm90aWZ5SG9va0NhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IHt7IHN0b3A6IGZ1bmN0aW9uLCBjYWxsYmFjazogZnVuY3Rpb24gfX1cbiAqL1xuV2ViQXBwLmFkZFVwZGF0ZWROb3RpZnlIb29rID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICByZXR1cm4gcnVudGltZUNvbmZpZy51cGRhdGVIb29rcy5yZWdpc3RlcihoYW5kbGVyKTtcbn07XG5cbldlYkFwcEludGVybmFscy5nZW5lcmF0ZUJvaWxlcnBsYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihcbiAgYXJjaCxcbiAgbWFuaWZlc3QsXG4gIGFkZGl0aW9uYWxPcHRpb25zXG4pIHtcbiAgYWRkaXRpb25hbE9wdGlvbnMgPSBhZGRpdGlvbmFsT3B0aW9ucyB8fCB7fTtcblxuICBydW50aW1lQ29uZmlnLmlzVXBkYXRlZEJ5QXJjaFthcmNoXSA9IHRydWU7XG4gIGNvbnN0IHJ0aW1lQ29uZmlnID0ge1xuICAgIC4uLl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18sXG4gICAgLi4uKGFkZGl0aW9uYWxPcHRpb25zLnJ1bnRpbWVDb25maWdPdmVycmlkZXMgfHwge30pLFxuICB9O1xuICBydW50aW1lQ29uZmlnLnVwZGF0ZUhvb2tzLmZvckVhY2goY2IgPT4ge1xuICAgIGNiKHsgYXJjaCwgbWFuaWZlc3QsIHJ1bnRpbWVDb25maWc6IHJ0aW1lQ29uZmlnIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICBjb25zdCBtZXRlb3JSdW50aW1lQ29uZmlnID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHJ0aW1lQ29uZmlnKSlcbiAgKTtcblxuICByZXR1cm4gbmV3IEJvaWxlcnBsYXRlKFxuICAgIGFyY2gsXG4gICAgbWFuaWZlc3QsXG4gICAgT2JqZWN0LmFzc2lnbihcbiAgICAgIHtcbiAgICAgICAgcGF0aE1hcHBlcihpdGVtUGF0aCkge1xuICAgICAgICAgIHJldHVybiBwYXRoSm9pbihhcmNoUGF0aFthcmNoXSwgaXRlbVBhdGgpO1xuICAgICAgICB9LFxuICAgICAgICBiYXNlRGF0YUV4dGVuc2lvbjoge1xuICAgICAgICAgIGFkZGl0aW9uYWxTdGF0aWNKczogKE9iamVjdC5lbnRyaWVzKGFkZGl0aW9uYWxTdGF0aWNKcykgfHwgW10pLm1hcChmdW5jdGlvbihcbiAgICAgICAgICAgIFtwYXRobmFtZSwgY29udGVudHNdXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBwYXRobmFtZTogcGF0aG5hbWUsXG4gICAgICAgICAgICAgIGNvbnRlbnRzOiBjb250ZW50cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSksXG4gICAgICAgICAgLy8gQ29udmVydCB0byBhIEpTT04gc3RyaW5nLCB0aGVuIGdldCByaWQgb2YgbW9zdCB3ZWlyZCBjaGFyYWN0ZXJzLCB0aGVuXG4gICAgICAgICAgLy8gd3JhcCBpbiBkb3VibGUgcXVvdGVzLiAoVGhlIG91dGVybW9zdCBKU09OLnN0cmluZ2lmeSByZWFsbHkgb3VnaHQgdG9cbiAgICAgICAgICAvLyBqdXN0IGJlIFwid3JhcCBpbiBkb3VibGUgcXVvdGVzXCIgYnV0IHdlIHVzZSBpdCB0byBiZSBzYWZlLikgVGhpcyBtaWdodFxuICAgICAgICAgIC8vIGVuZCB1cCBpbnNpZGUgYSA8c2NyaXB0PiB0YWcgc28gd2UgbmVlZCB0byBiZSBjYXJlZnVsIHRvIG5vdCBpbmNsdWRlXG4gICAgICAgICAgLy8gXCI8L3NjcmlwdD5cIiwgYnV0IG5vcm1hbCB7e3NwYWNlYmFyc319IGVzY2FwaW5nIGVzY2FwZXMgdG9vIG11Y2ghIFNlZVxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8zNzMwXG4gICAgICAgICAgbWV0ZW9yUnVudGltZUNvbmZpZyxcbiAgICAgICAgICBtZXRlb3JSdW50aW1lSGFzaDogc2hhMShtZXRlb3JSdW50aW1lQ29uZmlnKSxcbiAgICAgICAgICByb290VXJsUGF0aFByZWZpeDpcbiAgICAgICAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgJycsXG4gICAgICAgICAgYnVuZGxlZEpzQ3NzVXJsUmV3cml0ZUhvb2s6IGJ1bmRsZWRKc0Nzc1VybFJld3JpdGVIb29rLFxuICAgICAgICAgIHNyaU1vZGU6IHNyaU1vZGUsXG4gICAgICAgICAgaW5saW5lU2NyaXB0c0FsbG93ZWQ6IFdlYkFwcEludGVybmFscy5pbmxpbmVTY3JpcHRzQWxsb3dlZCgpLFxuICAgICAgICAgIGlubGluZTogYWRkaXRpb25hbE9wdGlvbnMuaW5saW5lLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zXG4gICAgKVxuICApO1xufTtcblxuLy8gQSBtYXBwaW5nIGZyb20gdXJsIHBhdGggdG8gYXJjaGl0ZWN0dXJlIChlLmcuIFwid2ViLmJyb3dzZXJcIikgdG8gc3RhdGljXG4vLyBmaWxlIGluZm9ybWF0aW9uIHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4vLyAtIHR5cGU6IHRoZSB0eXBlIG9mIGZpbGUgdG8gYmUgc2VydmVkXG4vLyAtIGNhY2hlYWJsZTogb3B0aW9uYWxseSwgd2hldGhlciB0aGUgZmlsZSBzaG91bGQgYmUgY2FjaGVkIG9yIG5vdFxuLy8gLSBzb3VyY2VNYXBVcmw6IG9wdGlvbmFsbHksIHRoZSB1cmwgb2YgdGhlIHNvdXJjZSBtYXBcbi8vXG4vLyBJbmZvIGFsc28gY29udGFpbnMgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4vLyAtIGNvbnRlbnQ6IHRoZSBzdHJpbmdpZmllZCBjb250ZW50IHRoYXQgc2hvdWxkIGJlIHNlcnZlZCBhdCB0aGlzIHBhdGhcbi8vIC0gYWJzb2x1dGVQYXRoOiB0aGUgYWJzb2x1dGUgcGF0aCBvbiBkaXNrIHRvIHRoZSBmaWxlXG5cbi8vIFNlcnZlIHN0YXRpYyBmaWxlcyBmcm9tIHRoZSBtYW5pZmVzdCBvciBhZGRlZCB3aXRoXG4vLyBgYWRkU3RhdGljSnNgLiBFeHBvcnRlZCBmb3IgdGVzdHMuXG5XZWJBcHBJbnRlcm5hbHMuc3RhdGljRmlsZXNNaWRkbGV3YXJlID0gYXN5bmMgZnVuY3Rpb24oXG4gIHN0YXRpY0ZpbGVzQnlBcmNoLFxuICByZXEsXG4gIHJlcyxcbiAgbmV4dFxuKSB7XG4gIHZhciBwYXRobmFtZSA9IHBhcnNlUmVxdWVzdChyZXEpLnBhdGhuYW1lO1xuICB0cnkge1xuICAgIHBhdGhuYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIG5leHQoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc2VydmVTdGF0aWNKcyA9IGZ1bmN0aW9uKHMpIHtcbiAgICBpZiAoXG4gICAgICByZXEubWV0aG9kID09PSAnR0VUJyB8fFxuICAgICAgcmVxLm1ldGhvZCA9PT0gJ0hFQUQnIHx8XG4gICAgICBNZXRlb3Iuc2V0dGluZ3MucGFja2FnZXM/LndlYmFwcD8uYWx3YXlzUmV0dXJuQ29udGVudFxuICAgICkge1xuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PVVURi04JyxcbiAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogQnVmZmVyLmJ5dGVMZW5ndGgocyksXG4gICAgICB9KTtcbiAgICAgIHJlcy53cml0ZShzKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnID8gMjAwIDogNDA1O1xuICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXMsIHtcbiAgICAgICAgQWxsb3c6ICdPUFRJT05TLCBHRVQsIEhFQUQnLFxuICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAnMCcsXG4gICAgICB9KTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKFxuICAgIHBhdGhuYW1lIGluIGFkZGl0aW9uYWxTdGF0aWNKcyAmJlxuICAgICFXZWJBcHBJbnRlcm5hbHMuaW5saW5lU2NyaXB0c0FsbG93ZWQoKVxuICApIHtcbiAgICBzZXJ2ZVN0YXRpY0pzKGFkZGl0aW9uYWxTdGF0aWNKc1twYXRobmFtZV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgYXJjaCwgcGF0aCB9ID0gV2ViQXBwLmNhdGVnb3JpemVSZXF1ZXN0KHJlcSk7XG5cbiAgaWYgKCFoYXNPd24uY2FsbChXZWJBcHAuY2xpZW50UHJvZ3JhbXMsIGFyY2gpKSB7XG4gICAgLy8gV2UgY291bGQgY29tZSBoZXJlIGluIGNhc2Ugd2UgcnVuIHdpdGggc29tZSBhcmNoaXRlY3R1cmVzIGV4Y2x1ZGVkXG4gICAgbmV4dCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIHBhdXNlQ2xpZW50KGFyY2gpIGhhcyBiZWVuIGNhbGxlZCwgcHJvZ3JhbS5wYXVzZWQgd2lsbCBiZSBhXG4gIC8vIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIHByb2dyYW0gaXMgdW5wYXVzZWQuXG4gIGNvbnN0IHByb2dyYW0gPSBXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF07XG4gIGF3YWl0IHByb2dyYW0ucGF1c2VkO1xuXG4gIGlmIChcbiAgICBwYXRoID09PSAnL21ldGVvcl9ydW50aW1lX2NvbmZpZy5qcycgJiZcbiAgICAhV2ViQXBwSW50ZXJuYWxzLmlubGluZVNjcmlwdHNBbGxvd2VkKClcbiAgKSB7XG4gICAgc2VydmVTdGF0aWNKcyhcbiAgICAgIGBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fID0gJHtwcm9ncmFtLm1ldGVvclJ1bnRpbWVDb25maWd9O2BcbiAgICApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGluZm8gPSBnZXRTdGF0aWNGaWxlSW5mbyhzdGF0aWNGaWxlc0J5QXJjaCwgcGF0aG5hbWUsIHBhdGgsIGFyY2gpO1xuICBpZiAoIWluZm8pIHtcbiAgICBuZXh0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIFwic2VuZFwiIHdpbGwgaGFuZGxlIEhFQUQgJiBHRVQgcmVxdWVzdHNcbiAgaWYgKFxuICAgIHJlcS5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgIHJlcS5tZXRob2QgIT09ICdHRVQnICYmXG4gICAgIU1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcz8ud2ViYXBwPy5hbHdheXNSZXR1cm5Db250ZW50XG4gICkge1xuICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5tZXRob2QgPT09ICdPUFRJT05TJyA/IDIwMCA6IDQwNTtcbiAgICByZXMud3JpdGVIZWFkKHN0YXR1cywge1xuICAgICAgQWxsb3c6ICdPUFRJT05TLCBHRVQsIEhFQUQnLFxuICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogJzAnLFxuICAgIH0pO1xuICAgIHJlcy5lbmQoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBXZSBkb24ndCBuZWVkIHRvIGNhbGwgcGF1c2UgYmVjYXVzZSwgdW5saWtlICdzdGF0aWMnLCBvbmNlIHdlIGNhbGwgaW50b1xuICAvLyAnc2VuZCcgYW5kIHlpZWxkIHRvIHRoZSBldmVudCBsb29wLCB3ZSBuZXZlciBjYWxsIGFub3RoZXIgaGFuZGxlciB3aXRoXG4gIC8vICduZXh0Jy5cblxuICAvLyBDYWNoZWFibGUgZmlsZXMgYXJlIGZpbGVzIHRoYXQgc2hvdWxkIG5ldmVyIGNoYW5nZS4gVHlwaWNhbGx5XG4gIC8vIG5hbWVkIGJ5IHRoZWlyIGhhc2ggKGVnIG1ldGVvciBidW5kbGVkIGpzIGFuZCBjc3MgZmlsZXMpLlxuICAvLyBXZSBjYWNoZSB0aGVtIH5mb3JldmVyICgxeXIpLlxuICBjb25zdCBtYXhBZ2UgPSBpbmZvLmNhY2hlYWJsZSA/IDEwMDAgKiA2MCAqIDYwICogMjQgKiAzNjUgOiAwO1xuXG4gIC8vIFJlc291cmNlcyB3aG9zZSBVUkwgYWxyZWFkeSBjb250YWlucyB0aGUgY29udGVudCBoYXNoIGFyZSBpbW11dGFibGVcbiAgLy8gYW5kIHVuaXF1ZSBwZXIgYXJjaGl0ZWN0dXJlIChtb2Rlcm4gdnMgbGVnYWN5KSwgc28gVmFyeTogVXNlci1BZ2VudFxuICAvLyBpcyB1bm5lY2Vzc2FyeSBhbmQgaGFybXMgQ0ROIGNhY2hlIGVmZmljaWVuY3kuXG4gIC8vXG4gIC8vIElmIHRoZSByZXF1ZXN0ZWQgVVJMIGRvZXMgbm90IGNvbnRhaW4gdGhlIGhhc2ggKGUuZy4gZGV2ZWxvcG1lbnRcbiAgLy8gb3IgdW5oYXNoZWQgYXNzZXRzKSwgd2Uga2VlcCBWYXJ5OiBVc2VyLUFnZW50IHRvIHByZXZlbnQgY2FjaGVcbiAgLy8gcG9pc29uaW5nIGFjcm9zcyBkaWZmZXJlbnQgYnJvd3NlcnMuXG4gIGNvbnN0IGluY2x1ZGVWYXJ5VXNlckFnZW50ID1cbiAgTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzPy53ZWJhcHA/LmluY2x1ZGVWYXJ5VXNlckFnZW50ID8/IHRydWU7XG5cbiAgaWYgKGluZm8uY2FjaGVhYmxlICYmICFwYXRobmFtZS5pbmNsdWRlcyhpbmZvLmhhc2gpICYmIGluY2x1ZGVWYXJ5VXNlckFnZW50KSB7XG4gICAgcmVzLnNldEhlYWRlcignVmFyeScsICdVc2VyLUFnZW50Jyk7XG4gIH1cblxuICAvLyBTZXQgdGhlIFgtU291cmNlTWFwIGhlYWRlciwgd2hpY2ggY3VycmVudCBDaHJvbWUsIEZpcmVGb3gsIGFuZCBTYWZhcmlcbiAgLy8gdW5kZXJzdGFuZC4gIChUaGUgU291cmNlTWFwIGhlYWRlciBpcyBzbGlnaHRseSBtb3JlIHNwZWMtY29ycmVjdCBidXQgRkZcbiAgLy8gZG9lc24ndCB1bmRlcnN0YW5kIGl0LilcbiAgLy9cbiAgLy8gWW91IG1heSBhbHNvIG5lZWQgdG8gZW5hYmxlIHNvdXJjZSBtYXBzIGluIENocm9tZTogb3BlbiBkZXYgdG9vbHMsIGNsaWNrXG4gIC8vIHRoZSBnZWFyIGluIHRoZSBib3R0b20gcmlnaHQgY29ybmVyLCBhbmQgc2VsZWN0IFwiZW5hYmxlIHNvdXJjZSBtYXBzXCIuXG4gIGlmIChpbmZvLnNvdXJjZU1hcFVybCkge1xuICAgIHJlcy5zZXRIZWFkZXIoXG4gICAgICAnWC1Tb3VyY2VNYXAnLFxuICAgICAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWCArIGluZm8uc291cmNlTWFwVXJsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpbmZvLnR5cGUgPT09ICdqcycgfHwgaW5mby50eXBlID09PSAnZHluYW1pYyBqcycpIHtcbiAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD1VVEYtOCcpO1xuICB9IGVsc2UgaWYgKGluZm8udHlwZSA9PT0gJ2NzcycpIHtcbiAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9jc3M7IGNoYXJzZXQ9VVRGLTgnKTtcbiAgfSBlbHNlIGlmIChpbmZvLnR5cGUgPT09ICdqc29uJykge1xuICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04Jyk7XG4gIH1cblxuICBpZiAoaW5mby5oYXNoKSB7XG4gICAgcmVzLnNldEhlYWRlcignRVRhZycsICdcIicgKyBpbmZvLmhhc2ggKyAnXCInKTtcbiAgfVxuXG4gIGlmIChpbmZvLmNvbnRlbnQpIHtcbiAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsIEJ1ZmZlci5ieXRlTGVuZ3RoKGluZm8uY29udGVudCkpO1xuICAgIHJlcy53cml0ZShpbmZvLmNvbnRlbnQpO1xuICAgIHJlcy5lbmQoKTtcbiAgfSBlbHNlIHtcbiAgICBzZW5kKHJlcSwgaW5mby5hYnNvbHV0ZVBhdGgsIHtcbiAgICAgIG1heGFnZTogbWF4QWdlLFxuICAgICAgZG90ZmlsZXM6ICdhbGxvdycsIC8vIGlmIHdlIHNwZWNpZmllZCBhIGRvdGZpbGUgaW4gdGhlIG1hbmlmZXN0LCBzZXJ2ZSBpdFxuICAgICAgbGFzdE1vZGlmaWVkOiBmYWxzZSwgLy8gZG9uJ3Qgc2V0IGxhc3QtbW9kaWZpZWQgYmFzZWQgb24gdGhlIGZpbGUgZGF0ZVxuICAgIH0pXG4gICAgICAub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIExvZy5lcnJvcignRXJyb3Igc2VydmluZyBzdGF0aWMgZmlsZSAnICsgZXJyKTtcbiAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xuICAgICAgICByZXMuZW5kKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdkaXJlY3RvcnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgTG9nLmVycm9yKCdVbmV4cGVjdGVkIGRpcmVjdG9yeSAnICsgaW5mby5hYnNvbHV0ZVBhdGgpO1xuICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgIHJlcy5lbmQoKTtcbiAgICAgIH0pXG4gICAgICAucGlwZShyZXMpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRTdGF0aWNGaWxlSW5mbyhzdGF0aWNGaWxlc0J5QXJjaCwgb3JpZ2luYWxQYXRoLCBwYXRoLCBhcmNoKSB7XG4gIGlmICghaGFzT3duLmNhbGwoV2ViQXBwLmNsaWVudFByb2dyYW1zLCBhcmNoKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gR2V0IGEgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIHN0YXRpYyBmaWxlIGFyY2hpdGVjdHVyZXMsIHdpdGggYXJjaFxuICAvLyBmaXJzdCBpbiB0aGUgbGlzdCBpZiBpdCBleGlzdHMuXG4gIGNvbnN0IHN0YXRpY0FyY2hMaXN0ID0gT2JqZWN0LmtleXMoc3RhdGljRmlsZXNCeUFyY2gpO1xuICBjb25zdCBhcmNoSW5kZXggPSBzdGF0aWNBcmNoTGlzdC5pbmRleE9mKGFyY2gpO1xuICBpZiAoYXJjaEluZGV4ID4gMCkge1xuICAgIHN0YXRpY0FyY2hMaXN0LnVuc2hpZnQoc3RhdGljQXJjaExpc3Quc3BsaWNlKGFyY2hJbmRleCwgMSlbMF0pO1xuICB9XG5cbiAgbGV0IGluZm8gPSBudWxsO1xuXG4gIHN0YXRpY0FyY2hMaXN0LnNvbWUoYXJjaCA9PiB7XG4gICAgY29uc3Qgc3RhdGljRmlsZXMgPSBzdGF0aWNGaWxlc0J5QXJjaFthcmNoXTtcblxuICAgIGZ1bmN0aW9uIGZpbmFsaXplKHBhdGgpIHtcbiAgICAgIGluZm8gPSBzdGF0aWNGaWxlc1twYXRoXTtcbiAgICAgIC8vIFNvbWV0aW1lcyB3ZSByZWdpc3RlciBhIGxhenkgZnVuY3Rpb24gaW5zdGVhZCBvZiBhY3R1YWwgZGF0YSBpblxuICAgICAgLy8gdGhlIHN0YXRpY0ZpbGVzIG1hbmlmZXN0LlxuICAgICAgaWYgKHR5cGVvZiBpbmZvID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGluZm8gPSBzdGF0aWNGaWxlc1twYXRoXSA9IGluZm8oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIElmIHN0YXRpY0ZpbGVzIGNvbnRhaW5zIG9yaWdpbmFsUGF0aCB3aXRoIHRoZSBhcmNoIGluZmVycmVkIGFib3ZlLFxuICAgIC8vIHVzZSB0aGF0IGluZm9ybWF0aW9uLlxuICAgIGlmIChoYXNPd24uY2FsbChzdGF0aWNGaWxlcywgb3JpZ2luYWxQYXRoKSkge1xuICAgICAgcmV0dXJuIGZpbmFsaXplKG9yaWdpbmFsUGF0aCk7XG4gICAgfVxuXG4gICAgLy8gSWYgY2F0ZWdvcml6ZVJlcXVlc3QgcmV0dXJuZWQgYW4gYWx0ZXJuYXRlIHBhdGgsIHRyeSB0aGF0IGluc3RlYWQuXG4gICAgaWYgKHBhdGggIT09IG9yaWdpbmFsUGF0aCAmJiBoYXNPd24uY2FsbChzdGF0aWNGaWxlcywgcGF0aCkpIHtcbiAgICAgIHJldHVybiBmaW5hbGl6ZShwYXRoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpbmZvO1xufVxuXG4vLyBQYXJzZSB0aGUgcGFzc2VkIGluIHBvcnQgdmFsdWUuIFJldHVybiB0aGUgcG9ydCBhcy1pcyBpZiBpdCdzIGEgU3RyaW5nXG4vLyAoZS5nLiBhIFdpbmRvd3MgU2VydmVyIHN0eWxlIG5hbWVkIHBpcGUpLCBvdGhlcndpc2UgcmV0dXJuIHRoZSBwb3J0IGFzIGFuXG4vLyBpbnRlZ2VyLlxuLy9cbi8vIERFUFJFQ0FURUQ6IERpcmVjdCB1c2Ugb2YgdGhpcyBmdW5jdGlvbiBpcyBub3QgcmVjb21tZW5kZWQ7IGl0IGlzIG5vXG4vLyBsb25nZXIgdXNlZCBpbnRlcm5hbGx5LCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHJlbGVhc2UuXG5XZWJBcHBJbnRlcm5hbHMucGFyc2VQb3J0ID0gcG9ydCA9PiB7XG4gIGxldCBwYXJzZWRQb3J0ID0gcGFyc2VJbnQocG9ydCk7XG4gIGlmIChOdW1iZXIuaXNOYU4ocGFyc2VkUG9ydCkpIHtcbiAgICBwYXJzZWRQb3J0ID0gcG9ydDtcbiAgfVxuICByZXR1cm4gcGFyc2VkUG9ydDtcbn07XG5cbm9uTWVzc2FnZSgnd2ViYXBwLXBhdXNlLWNsaWVudCcsIGFzeW5jICh7IGFyY2ggfSkgPT4ge1xuICBhd2FpdCBXZWJBcHBJbnRlcm5hbHMucGF1c2VDbGllbnQoYXJjaCk7XG59KTtcblxub25NZXNzYWdlKCd3ZWJhcHAtcmVsb2FkLWNsaWVudCcsIGFzeW5jICh7IGFyY2ggfSkgPT4ge1xuICBhd2FpdCBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVDbGllbnRQcm9ncmFtKGFyY2gpO1xufSk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bldlYkFwcFNlcnZlcigpIHtcbiAgdmFyIHNodXR0aW5nRG93biA9IGZhbHNlO1xuICB2YXIgc3luY1F1ZXVlID0gbmV3IE1ldGVvci5fQXN5bmNocm9ub3VzUXVldWUoKTtcblxuICB2YXIgZ2V0SXRlbVBhdGhuYW1lID0gZnVuY3Rpb24oaXRlbVVybCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQobmV3IFVSTChpdGVtVXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpLnBhdGhuYW1lKTtcbiAgfTtcblxuICBXZWJBcHBJbnRlcm5hbHMucmVsb2FkQ2xpZW50UHJvZ3JhbXMgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBhd2FpdCBzeW5jUXVldWUucnVuVGFzayhmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHN0YXRpY0ZpbGVzQnlBcmNoID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgY29uc3QgeyBjb25maWdKc29uIH0gPSBfX21ldGVvcl9ib290c3RyYXBfXztcbiAgICAgIGNvbnN0IGNsaWVudEFyY2hzID1cbiAgICAgICAgY29uZmlnSnNvbi5jbGllbnRBcmNocyB8fCBPYmplY3Qua2V5cyhjb25maWdKc29uLmNsaWVudFBhdGhzKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY2xpZW50QXJjaHMuZm9yRWFjaChhcmNoID0+IHtcbiAgICAgICAgICBnZW5lcmF0ZUNsaWVudFByb2dyYW0oYXJjaCwgc3RhdGljRmlsZXNCeUFyY2gpO1xuICAgICAgICB9KTtcbiAgICAgICAgV2ViQXBwSW50ZXJuYWxzLnN0YXRpY0ZpbGVzQnlBcmNoID0gc3RhdGljRmlsZXNCeUFyY2g7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIExvZy5lcnJvcignRXJyb3IgcmVsb2FkaW5nIHRoZSBjbGllbnQgcHJvZ3JhbTogJyArIGUuc3RhY2spO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUGF1c2UgYW55IGluY29taW5nIHJlcXVlc3RzIGFuZCBtYWtlIHRoZW0gd2FpdCBmb3IgdGhlIHByb2dyYW0gdG8gYmVcbiAgLy8gdW5wYXVzZWQgdGhlIG5leHQgdGltZSBnZW5lcmF0ZUNsaWVudFByb2dyYW0oYXJjaCkgaXMgY2FsbGVkLlxuICBXZWJBcHBJbnRlcm5hbHMucGF1c2VDbGllbnQgPSBhc3luYyBmdW5jdGlvbihhcmNoKSB7XG4gICAgYXdhaXQgc3luY1F1ZXVlLnJ1blRhc2soKCkgPT4ge1xuICAgICAgY29uc3QgcHJvZ3JhbSA9IFdlYkFwcC5jbGllbnRQcm9ncmFtc1thcmNoXTtcbiAgICAgIGNvbnN0IHsgdW5wYXVzZSB9ID0gcHJvZ3JhbTtcbiAgICAgIHByb2dyYW0ucGF1c2VkID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdW5wYXVzZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIC8vIElmIHRoZXJlIGhhcHBlbnMgdG8gYmUgYW4gZXhpc3RpbmcgcHJvZ3JhbS51bnBhdXNlIGZ1bmN0aW9uLFxuICAgICAgICAgIC8vIGNvbXBvc2UgaXQgd2l0aCB0aGUgcmVzb2x2ZSBmdW5jdGlvbi5cbiAgICAgICAgICBwcm9ncmFtLnVucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHVucGF1c2UoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2dyYW0udW5wYXVzZSA9IHJlc29sdmU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIFdlYkFwcEludGVybmFscy5nZW5lcmF0ZUNsaWVudFByb2dyYW0gPSBhc3luYyBmdW5jdGlvbihhcmNoKSB7XG4gICAgYXdhaXQgc3luY1F1ZXVlLnJ1blRhc2soKCkgPT4gZ2VuZXJhdGVDbGllbnRQcm9ncmFtKGFyY2gpKTtcbiAgfTtcblxuICBmdW5jdGlvbiBnZW5lcmF0ZUNsaWVudFByb2dyYW0oXG4gICAgYXJjaCxcbiAgICBzdGF0aWNGaWxlc0J5QXJjaCA9IFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc0J5QXJjaFxuICApIHtcbiAgICBjb25zdCBjbGllbnREaXIgPSBwYXRoSm9pbihcbiAgICAgIHBhdGhEaXJuYW1lKF9fbWV0ZW9yX2Jvb3RzdHJhcF9fLnNlcnZlckRpciksXG4gICAgICBhcmNoXG4gICAgKTtcblxuICAgIC8vIHJlYWQgdGhlIGNvbnRyb2wgZm9yIHRoZSBjbGllbnQgd2UnbGwgYmUgc2VydmluZyB1cFxuICAgIGNvbnN0IHByb2dyYW1Kc29uUGF0aCA9IHBhdGhKb2luKGNsaWVudERpciwgJ3Byb2dyYW0uanNvbicpO1xuXG4gICAgbGV0IHByb2dyYW1Kc29uO1xuICAgIHRyeSB7XG4gICAgICBwcm9ncmFtSnNvbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKHByb2dyYW1Kc29uUGF0aCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSByZXR1cm47XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChwcm9ncmFtSnNvbi5mb3JtYXQgIT09ICd3ZWItcHJvZ3JhbS1wcmUxJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5zdXBwb3J0ZWQgZm9ybWF0IGZvciBjbGllbnQgYXNzZXRzOiAnICtcbiAgICAgICAgICBKU09OLnN0cmluZ2lmeShwcm9ncmFtSnNvbi5mb3JtYXQpXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghcHJvZ3JhbUpzb25QYXRoIHx8ICFjbGllbnREaXIgfHwgIXByb2dyYW1Kc29uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NsaWVudCBjb25maWcgZmlsZSBub3QgcGFyc2VkLicpO1xuICAgIH1cblxuICAgIGFyY2hQYXRoW2FyY2hdID0gY2xpZW50RGlyO1xuICAgIGNvbnN0IHN0YXRpY0ZpbGVzID0gKHN0YXRpY0ZpbGVzQnlBcmNoW2FyY2hdID0gT2JqZWN0LmNyZWF0ZShudWxsKSk7XG5cbiAgICBjb25zdCB7IG1hbmlmZXN0IH0gPSBwcm9ncmFtSnNvbjtcbiAgICBtYW5pZmVzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udXJsICYmIGl0ZW0ud2hlcmUgPT09ICdjbGllbnQnKSB7XG4gICAgICAgIHN0YXRpY0ZpbGVzW2dldEl0ZW1QYXRobmFtZShpdGVtLnVybCldID0ge1xuICAgICAgICAgIGFic29sdXRlUGF0aDogcGF0aEpvaW4oY2xpZW50RGlyLCBpdGVtLnBhdGgpLFxuICAgICAgICAgIGNhY2hlYWJsZTogaXRlbS5jYWNoZWFibGUsXG4gICAgICAgICAgaGFzaDogaXRlbS5oYXNoLFxuICAgICAgICAgIC8vIExpbmsgZnJvbSBzb3VyY2UgdG8gaXRzIG1hcFxuICAgICAgICAgIHNvdXJjZU1hcFVybDogaXRlbS5zb3VyY2VNYXBVcmwsXG4gICAgICAgICAgdHlwZTogaXRlbS50eXBlLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpdGVtLnNvdXJjZU1hcCkge1xuICAgICAgICAgIC8vIFNlcnZlIHRoZSBzb3VyY2UgbWFwIHRvbywgdW5kZXIgdGhlIHNwZWNpZmllZCBVUkwuIFdlIGFzc3VtZVxuICAgICAgICAgIC8vIGFsbCBzb3VyY2UgbWFwcyBhcmUgY2FjaGVhYmxlLlxuICAgICAgICAgIHN0YXRpY0ZpbGVzW2dldEl0ZW1QYXRobmFtZShpdGVtLnNvdXJjZU1hcFVybCldID0ge1xuICAgICAgICAgICAgYWJzb2x1dGVQYXRoOiBwYXRoSm9pbihjbGllbnREaXIsIGl0ZW0uc291cmNlTWFwKSxcbiAgICAgICAgICAgIGNhY2hlYWJsZTogdHJ1ZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB7IFBVQkxJQ19TRVRUSU5HUyB9ID0gX19tZXRlb3JfcnVudGltZV9jb25maWdfXztcbiAgICBjb25zdCBjb25maWdPdmVycmlkZXMgPSB7XG4gICAgICBQVUJMSUNfU0VUVElOR1MsXG4gICAgfTtcblxuICAgIGNvbnN0IG9sZFByb2dyYW0gPSBXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF07XG4gICAgY29uc3QgbmV3UHJvZ3JhbSA9IChXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF0gPSB7XG4gICAgICBmb3JtYXQ6ICd3ZWItcHJvZ3JhbS1wcmUxJyxcbiAgICAgIG1hbmlmZXN0OiBtYW5pZmVzdCxcbiAgICAgIC8vIFVzZSBhcnJvdyBmdW5jdGlvbnMgc28gdGhhdCB0aGVzZSB2ZXJzaW9ucyBjYW4gYmUgbGF6aWx5XG4gICAgICAvLyBjYWxjdWxhdGVkIGxhdGVyLCBhbmQgc28gdGhhdCB0aGV5IHdpbGwgbm90IGJlIGluY2x1ZGVkIGluIHRoZVxuICAgICAgLy8gc3RhdGljRmlsZXNbbWFuaWZlc3RVcmxdLmNvbnRlbnQgc3RyaW5nIGJlbG93LlxuICAgICAgLy9cbiAgICAgIC8vIE5vdGU6IHRoZXNlIHZlcnNpb24gY2FsY3VsYXRpb25zIG11c3QgYmUga2VwdCBpbiBhZ3JlZW1lbnQgd2l0aFxuICAgICAgLy8gQ29yZG92YUJ1aWxkZXIjYXBwZW5kVmVyc2lvbiBpbiB0b29scy9jb3Jkb3ZhL2J1aWxkZXIuanMsIG9yIGhvdFxuICAgICAgLy8gY29kZSBwdXNoIHdpbGwgcmVsb2FkIENvcmRvdmEgYXBwcyB1bm5lY2Vzc2FyaWx5LlxuICAgICAgdmVyc2lvbjogKCkgPT5cbiAgICAgICAgV2ViQXBwSGFzaGluZy5jYWxjdWxhdGVDbGllbnRIYXNoKG1hbmlmZXN0LCBudWxsLCBjb25maWdPdmVycmlkZXMpLFxuICAgICAgdmVyc2lvblJlZnJlc2hhYmxlOiAoKSA9PlxuICAgICAgICBXZWJBcHBIYXNoaW5nLmNhbGN1bGF0ZUNsaWVudEhhc2goXG4gICAgICAgICAgbWFuaWZlc3QsXG4gICAgICAgICAgdHlwZSA9PiB0eXBlID09PSAnY3NzJyxcbiAgICAgICAgICBjb25maWdPdmVycmlkZXNcbiAgICAgICAgKSxcbiAgICAgIHZlcnNpb25Ob25SZWZyZXNoYWJsZTogKCkgPT5cbiAgICAgICAgV2ViQXBwSGFzaGluZy5jYWxjdWxhdGVDbGllbnRIYXNoKFxuICAgICAgICAgIG1hbmlmZXN0LFxuICAgICAgICAgICh0eXBlLCByZXBsYWNlYWJsZSkgPT4gdHlwZSAhPT0gJ2NzcycgJiYgIXJlcGxhY2VhYmxlLFxuICAgICAgICAgIGNvbmZpZ092ZXJyaWRlc1xuICAgICAgICApLFxuICAgICAgdmVyc2lvblJlcGxhY2VhYmxlOiAoKSA9PlxuICAgICAgICBXZWJBcHBIYXNoaW5nLmNhbGN1bGF0ZUNsaWVudEhhc2goXG4gICAgICAgICAgbWFuaWZlc3QsXG4gICAgICAgICAgKF90eXBlLCByZXBsYWNlYWJsZSkgPT4gcmVwbGFjZWFibGUsXG4gICAgICAgICAgY29uZmlnT3ZlcnJpZGVzXG4gICAgICAgICksXG4gICAgICBjb3Jkb3ZhQ29tcGF0aWJpbGl0eVZlcnNpb25zOiBwcm9ncmFtSnNvbi5jb3Jkb3ZhQ29tcGF0aWJpbGl0eVZlcnNpb25zLFxuICAgICAgUFVCTElDX1NFVFRJTkdTLFxuICAgICAgaG1yVmVyc2lvbjogcHJvZ3JhbUpzb24uaG1yVmVyc2lvbixcbiAgICB9KTtcblxuICAgIC8vIEV4cG9zZSBwcm9ncmFtIGRldGFpbHMgYXMgYSBzdHJpbmcgcmVhY2hhYmxlIHZpYSB0aGUgZm9sbG93aW5nIFVSTC5cbiAgICBjb25zdCBtYW5pZmVzdFVybFByZWZpeCA9ICcvX18nICsgYXJjaC5yZXBsYWNlKC9ed2ViXFwuLywgJycpO1xuICAgIGNvbnN0IG1hbmlmZXN0VXJsID0gbWFuaWZlc3RVcmxQcmVmaXggKyBnZXRJdGVtUGF0aG5hbWUoJy9tYW5pZmVzdC5qc29uJyk7XG5cbiAgICBzdGF0aWNGaWxlc1ttYW5pZmVzdFVybF0gPSAoKSA9PiB7XG4gICAgICBpZiAoUGFja2FnZS5hdXRvdXBkYXRlKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBBVVRPVVBEQVRFX1ZFUlNJT04gPSBQYWNrYWdlLmF1dG91cGRhdGUuQXV0b3VwZGF0ZS5hdXRvdXBkYXRlVmVyc2lvbixcbiAgICAgICAgfSA9IHByb2Nlc3MuZW52O1xuXG4gICAgICAgIGlmIChBVVRPVVBEQVRFX1ZFUlNJT04pIHtcbiAgICAgICAgICBuZXdQcm9ncmFtLnZlcnNpb24gPSBBVVRPVVBEQVRFX1ZFUlNJT047XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBuZXdQcm9ncmFtLnZlcnNpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbmV3UHJvZ3JhbS52ZXJzaW9uID0gbmV3UHJvZ3JhbS52ZXJzaW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KG5ld1Byb2dyYW0pLFxuICAgICAgICBjYWNoZWFibGU6IGZhbHNlLFxuICAgICAgICBoYXNoOiBuZXdQcm9ncmFtLnZlcnNpb24sXG4gICAgICAgIHR5cGU6ICdqc29uJyxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGdlbmVyYXRlQm9pbGVycGxhdGVGb3JBcmNoKGFyY2gpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGFueSByZXF1ZXN0cyB3YWl0aW5nIG9uIG9sZFByb2dyYW0ucGF1c2VkLCBsZXQgdGhlbVxuICAgIC8vIGNvbnRpbnVlIG5vdyAodXNpbmcgdGhlIG5ldyBwcm9ncmFtKS5cbiAgICBpZiAob2xkUHJvZ3JhbSAmJiBvbGRQcm9ncmFtLnBhdXNlZCkge1xuICAgICAgb2xkUHJvZ3JhbS51bnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGVmYXVsdE9wdGlvbnNGb3JBcmNoID0ge1xuICAgICd3ZWIuY29yZG92YSc6IHtcbiAgICAgIHJ1bnRpbWVDb25maWdPdmVycmlkZXM6IHtcbiAgICAgICAgLy8gWFhYIFdlIHVzZSBhYnNvbHV0ZVVybCgpIGhlcmUgc28gdGhhdCB3ZSBzZXJ2ZSBodHRwczovL1xuICAgICAgICAvLyBVUkxzIHRvIGNvcmRvdmEgY2xpZW50cyBpZiBmb3JjZS1zc2wgaXMgaW4gdXNlLiBJZiB3ZSB3ZXJlXG4gICAgICAgIC8vIHRvIHVzZSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMIGluc3RlYWQgb2ZcbiAgICAgICAgLy8gYWJzb2x1dGVVcmwoKSwgdGhlbiBDb3Jkb3ZhIGNsaWVudHMgd291bGQgaW1tZWRpYXRlbHkgZ2V0IGFcbiAgICAgICAgLy8gSENQIHNldHRpbmcgdGhlaXIgRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkwgdG9cbiAgICAgICAgLy8gaHR0cDovL2V4YW1wbGUubWV0ZW9yLmNvbS4gVGhpcyBicmVha3MgdGhlIGFwcCwgYmVjYXVzZVxuICAgICAgICAvLyBmb3JjZS1zc2wgZG9lc24ndCBzZXJ2ZSBDT1JTIGhlYWRlcnMgb24gMzAyXG4gICAgICAgIC8vIHJlZGlyZWN0cy4gKFBsdXMgaXQncyB1bmRlc2lyYWJsZSB0byBoYXZlIGNsaWVudHNcbiAgICAgICAgLy8gY29ubmVjdGluZyB0byBodHRwOi8vZXhhbXBsZS5tZXRlb3IuY29tIHdoZW4gZm9yY2Utc3NsIGlzXG4gICAgICAgIC8vIGluIHVzZS4pXG4gICAgICAgIEREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMOlxuICAgICAgICAgIHByb2Nlc3MuZW52Lk1PQklMRV9ERFBfVVJMIHx8IE1ldGVvci5hYnNvbHV0ZVVybCgpLFxuICAgICAgICBST09UX1VSTDogcHJvY2Vzcy5lbnYuTU9CSUxFX1JPT1RfVVJMIHx8IE1ldGVvci5hYnNvbHV0ZVVybCgpLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgJ3dlYi5icm93c2VyJzoge1xuICAgICAgcnVudGltZUNvbmZpZ092ZXJyaWRlczoge1xuICAgICAgICBpc01vZGVybjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgICd3ZWIuYnJvd3Nlci5sZWdhY3knOiB7XG4gICAgICBydW50aW1lQ29uZmlnT3ZlcnJpZGVzOiB7XG4gICAgICAgIGlzTW9kZXJuOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVCb2lsZXJwbGF0ZSA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoaXMgYm9pbGVycGxhdGUgd2lsbCBiZSBzZXJ2ZWQgdG8gdGhlIG1vYmlsZSBkZXZpY2VzIHdoZW4gdXNlZCB3aXRoXG4gICAgLy8gTWV0ZW9yL0NvcmRvdmEgZm9yIHRoZSBIb3QtQ29kZSBQdXNoIGFuZCBzaW5jZSB0aGUgZmlsZSB3aWxsIGJlIHNlcnZlZCBieVxuICAgIC8vIHRoZSBkZXZpY2UncyBzZXJ2ZXIsIGl0IGlzIGltcG9ydGFudCB0byBzZXQgdGhlIEREUCB1cmwgdG8gdGhlIGFjdHVhbFxuICAgIC8vIE1ldGVvciBzZXJ2ZXIgYWNjZXB0aW5nIEREUCBjb25uZWN0aW9ucyBhbmQgbm90IHRoZSBkZXZpY2UncyBmaWxlIHNlcnZlci5cbiAgICBhd2FpdCBzeW5jUXVldWUucnVuVGFzayhmdW5jdGlvbigpIHtcbiAgICAgIE9iamVjdC5rZXlzKFdlYkFwcC5jbGllbnRQcm9ncmFtcykuZm9yRWFjaChnZW5lcmF0ZUJvaWxlcnBsYXRlRm9yQXJjaCk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVCb2lsZXJwbGF0ZUZvckFyY2goYXJjaCkge1xuICAgIGNvbnN0IHByb2dyYW0gPSBXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF07XG4gICAgY29uc3QgYWRkaXRpb25hbE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9uc0ZvckFyY2hbYXJjaF0gfHwge307XG4gICAgY29uc3QgeyBiYXNlRGF0YSB9ID0gKGJvaWxlcnBsYXRlQnlBcmNoW1xuICAgICAgYXJjaFxuICAgIF0gPSBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVCb2lsZXJwbGF0ZUluc3RhbmNlKFxuICAgICAgYXJjaCxcbiAgICAgIHByb2dyYW0ubWFuaWZlc3QsXG4gICAgICBhZGRpdGlvbmFsT3B0aW9uc1xuICAgICkpO1xuICAgIC8vIFdlIG5lZWQgdGhlIHJ1bnRpbWUgY29uZmlnIHdpdGggb3ZlcnJpZGVzIGZvciBtZXRlb3JfcnVudGltZV9jb25maWcuanM6XG4gICAgcHJvZ3JhbS5tZXRlb3JSdW50aW1lQ29uZmlnID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgLi4uX19tZXRlb3JfcnVudGltZV9jb25maWdfXyxcbiAgICAgIC4uLihhZGRpdGlvbmFsT3B0aW9ucy5ydW50aW1lQ29uZmlnT3ZlcnJpZGVzIHx8IG51bGwpLFxuICAgIH0pO1xuICAgIHByb2dyYW0ucmVmcmVzaGFibGVBc3NldHMgPSBiYXNlRGF0YS5jc3MubWFwKGZpbGUgPT4gKHtcbiAgICAgIHVybDogYnVuZGxlZEpzQ3NzVXJsUmV3cml0ZUhvb2soZmlsZS51cmwpLFxuICAgIH0pKTtcbiAgfVxuXG4gIGF3YWl0IFdlYkFwcEludGVybmFscy5yZWxvYWRDbGllbnRQcm9ncmFtcygpO1xuXG4gIC8vIHdlYnNlcnZlclxuICB2YXIgYXBwID0gY3JlYXRlRXhwcmVzc0FwcCgpXG5cbiAgLy8gUGFja2FnZXMgYW5kIGFwcHMgY2FuIGFkZCBoYW5kbGVycyB0aGF0IHJ1biBiZWZvcmUgYW55IG90aGVyIE1ldGVvclxuICAvLyBoYW5kbGVycyB2aWEgV2ViQXBwLnJhd0V4cHJlc3NIYW5kbGVycy5cbiAgdmFyIHJhd0V4cHJlc3NIYW5kbGVycyA9IGNyZWF0ZUV4cHJlc3NBcHAoKVxuICBhcHAudXNlKHJhd0V4cHJlc3NIYW5kbGVycyk7XG5cbiAgLy8gQXV0by1jb21wcmVzcyBhbnkganNvbiwgamF2YXNjcmlwdCwgb3IgdGV4dC5cbiAgYXBwLnVzZShjb21wcmVzcyh7IGZpbHRlcjogc2hvdWxkQ29tcHJlc3MgfSkpO1xuXG4gIC8vIHBhcnNlIGNvb2tpZXMgaW50byBhbiBvYmplY3RcbiAgYXBwLnVzZShjb29raWVQYXJzZXIoKSk7XG5cbiAgLy8gV2UncmUgbm90IGEgcHJveHk7IHJlamVjdCAod2l0aG91dCBjcmFzaGluZykgYXR0ZW1wdHMgdG8gdHJlYXQgdXMgbGlrZVxuICAvLyBvbmUuIChTZWUgIzEyMTIuKVxuICBhcHAudXNlKGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgaWYgKFJvdXRlUG9saWN5LmlzVmFsaWRVcmwocmVxLnVybCkpIHtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzLndyaXRlSGVhZCg0MDApO1xuICAgIHJlcy53cml0ZSgnTm90IGEgcHJveHknKTtcbiAgICByZXMuZW5kKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGdldFBhdGhQYXJ0cyhwYXRoKSB7XG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgd2hpbGUgKHBhcnRzWzBdID09PSAnJykgcGFydHMuc2hpZnQoKTtcbiAgICByZXR1cm4gcGFydHM7XG4gIH1cblxuICBmdW5jdGlvbiBpc1ByZWZpeE9mKHByZWZpeCwgYXJyYXkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcHJlZml4Lmxlbmd0aCA8PSBhcnJheS5sZW5ndGggJiZcbiAgICAgIHByZWZpeC5ldmVyeSgocGFydCwgaSkgPT4gcGFydCA9PT0gYXJyYXlbaV0pXG4gICAgKTtcbiAgfVxuXG4gIC8vIFN0cmlwIG9mZiB0aGUgcGF0aCBwcmVmaXgsIGlmIGl0IGV4aXN0cy5cbiAgYXBwLnVzZShmdW5jdGlvbihyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkge1xuICAgIGNvbnN0IHBhdGhQcmVmaXggPSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMX1BBVEhfUFJFRklYO1xuICAgIGNvbnN0IHsgcGF0aG5hbWUsIHNlYXJjaCB9ID0gbmV3IFVSTChyZXF1ZXN0LnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcblxuICAgIC8vIGNoZWNrIGlmIHRoZSBwYXRoIGluIHRoZSB1cmwgc3RhcnRzIHdpdGggdGhlIHBhdGggcHJlZml4XG4gICAgaWYgKHBhdGhQcmVmaXgpIHtcbiAgICAgIGNvbnN0IHByZWZpeFBhcnRzID0gZ2V0UGF0aFBhcnRzKHBhdGhQcmVmaXgpO1xuICAgICAgY29uc3QgcGF0aFBhcnRzID0gZ2V0UGF0aFBhcnRzKHBhdGhuYW1lKTtcbiAgICAgIGlmIChpc1ByZWZpeE9mKHByZWZpeFBhcnRzLCBwYXRoUGFydHMpKSB7XG4gICAgICAgIHJlcXVlc3QudXJsID0gJy8nICsgcGF0aFBhcnRzLnNsaWNlKHByZWZpeFBhcnRzLmxlbmd0aCkuam9pbignLycpO1xuICAgICAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgICAgcmVxdWVzdC51cmwgKz0gc2VhcmNoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhdGhuYW1lID09PSAnL2Zhdmljb24uaWNvJyB8fCBwYXRobmFtZSA9PT0gJy9yb2JvdHMudHh0Jykge1xuICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9XG5cbiAgICBpZiAocGF0aFByZWZpeCkge1xuICAgICAgcmVzcG9uc2Uud3JpdGVIZWFkKDQwNCk7XG4gICAgICByZXNwb25zZS53cml0ZSgnVW5rbm93biBwYXRoJyk7XG4gICAgICByZXNwb25zZS5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH0pO1xuXG4gIC8vIFNlcnZlIHN0YXRpYyBmaWxlcyBmcm9tIHRoZSBtYW5pZmVzdC5cbiAgLy8gVGhpcyBpcyBpbnNwaXJlZCBieSB0aGUgJ3N0YXRpYycgbWlkZGxld2FyZS5cbiAgYXBwLnVzZShmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFN0cmluZyhhcmd1bWVudHMuY2FsbGVlKSk7XG4gICAgV2ViQXBwSW50ZXJuYWxzLnN0YXRpY0ZpbGVzTWlkZGxld2FyZShcbiAgICAgIFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc0J5QXJjaCxcbiAgICAgIHJlcSxcbiAgICAgIHJlcyxcbiAgICAgIG5leHRcbiAgICApO1xuICB9KTtcblxuICAvLyBDb3JlIE1ldGVvciBwYWNrYWdlcyBsaWtlIGR5bmFtaWMtaW1wb3J0IGNhbiBhZGQgaGFuZGxlcnMgYmVmb3JlXG4gIC8vIG90aGVyIGhhbmRsZXJzIGFkZGVkIGJ5IHBhY2thZ2UgYW5kIGFwcGxpY2F0aW9uIGNvZGUuXG4gIGFwcC51c2UoKFdlYkFwcEludGVybmFscy5tZXRlb3JJbnRlcm5hbEhhbmRsZXJzID0gY3JlYXRlRXhwcmVzc0FwcCgpKSk7XG5cbiAgLyoqXG4gICAqIEBuYW1lIGV4cHJlc3NIYW5kbGVyc0NhbGxiYWNrKHJlcSwgcmVzLCBuZXh0KVxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBpc3Byb3RvdHlwZSB0cnVlXG4gICAqIEBzdW1tYXJ5IGNhbGxiYWNrIGhhbmRsZXIgZm9yIGBXZWJBcHAuZXhwcmVzc0hhbmRsZXJzYFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxXG4gICAqIGEgTm9kZS5qc1xuICAgKiBbSW5jb21pbmdNZXNzYWdlXShodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNjbGFzcy1odHRwaW5jb21pbmdtZXNzYWdlKVxuICAgKiBvYmplY3Qgd2l0aCBzb21lIGV4dHJhIHByb3BlcnRpZXMuIFRoaXMgYXJndW1lbnQgY2FuIGJlIHVzZWRcbiAgICogIHRvIGdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgaW5jb21pbmcgcmVxdWVzdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc1xuICAgKiBhIE5vZGUuanNcbiAgICogW1NlcnZlclJlc3BvbnNlXShodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNjbGFzcy1odHRwc2VydmVycmVzcG9uc2UpXG4gICAqIG9iamVjdC4gVXNlIHRoaXMgdG8gd3JpdGUgZGF0YSB0aGF0IHNob3VsZCBiZSBzZW50IGluIHJlc3BvbnNlIHRvIHRoZVxuICAgKiByZXF1ZXN0LCBhbmQgY2FsbCBgcmVzLmVuZCgpYCB3aGVuIHlvdSBhcmUgZG9uZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFxuICAgKiBDYWxsaW5nIHRoaXMgZnVuY3Rpb24gd2lsbCBwYXNzIG9uIHRoZSBoYW5kbGluZyBvZlxuICAgKiB0aGlzIHJlcXVlc3QgdG8gdGhlIG5leHQgcmVsZXZhbnQgaGFuZGxlci5cbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgaGFuZGxlcnNcbiAgICogQG1lbWJlcm9mIFdlYkFwcFxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBzdW1tYXJ5IFJlZ2lzdGVyIGEgaGFuZGxlciBmb3IgYWxsIEhUVFAgcmVxdWVzdHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbcGF0aF1cbiAgICogVGhpcyBoYW5kbGVyIHdpbGwgb25seSBiZSBjYWxsZWQgb24gcGF0aHMgdGhhdCBtYXRjaFxuICAgKiB0aGlzIHN0cmluZy4gVGhlIG1hdGNoIGhhcyB0byBib3JkZXIgb24gYSBgL2Agb3IgYSBgLmAuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBgL2hlbGxvYCB3aWxsIG1hdGNoIGAvaGVsbG8vd29ybGRgIGFuZFxuICAgKiBgL2hlbGxvLndvcmxkYCwgYnV0IG5vdCBgL2hlbGxvX3dvcmxkYC5cbiAgICogQHBhcmFtIHtleHByZXNzSGFuZGxlcnNDYWxsYmFja30gaGFuZGxlclxuICAgKiBBIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCBvbiBIVFRQIHJlcXVlc3RzLlxuICAgKiBTZWUgYGV4cHJlc3NIYW5kbGVyc0NhbGxiYWNrYFxuICAgKlxuICAgKi9cbiAgLy8gUGFja2FnZXMgYW5kIGFwcHMgY2FuIGFkZCBoYW5kbGVycyB0byB0aGlzIHZpYSBXZWJBcHAuZXhwcmVzc0hhbmRsZXJzLlxuICAvLyBUaGV5IGFyZSBpbnNlcnRlZCBiZWZvcmUgb3VyIGRlZmF1bHQgaGFuZGxlci5cbiAgdmFyIHBhY2thZ2VBbmRBcHBIYW5kbGVycyA9IGNyZWF0ZUV4cHJlc3NBcHAoKVxuICBhcHAudXNlKHBhY2thZ2VBbmRBcHBIYW5kbGVycyk7XG5cbiAgbGV0IHN1cHByZXNzRXhwcmVzc0Vycm9ycyA9IGZhbHNlO1xuICAvLyBFeHByZXNzIGtub3dzIGl0IGlzIGFuIGVycm9yIGhhbmRsZXIgYmVjYXVzZSBpdCBoYXMgNCBhcmd1bWVudHMgaW5zdGVhZCBvZlxuICAvLyAzLiBnbyBmaWd1cmUuICAoSXQgaXMgbm90IHNtYXJ0IGVub3VnaCB0byBmaW5kIHN1Y2ggYSB0aGluZyBpZiBpdCdzIGhpZGRlblxuICAvLyBpbnNpZGUgcGFja2FnZUFuZEFwcEhhbmRsZXJzLilcbiAgYXBwLnVzZShmdW5jdGlvbihlcnIsIHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgaWYgKCFlcnIgfHwgIXN1cHByZXNzRXhwcmVzc0Vycm9ycyB8fCAhcmVxLmhlYWRlcnNbJ3gtc3VwcHJlc3MtZXJyb3InXSkge1xuICAgICAgbmV4dChlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXMud3JpdGVIZWFkKGVyci5zdGF0dXMsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyB9KTtcbiAgICByZXMuZW5kKCdBbiBlcnJvciBtZXNzYWdlJyk7XG4gIH0pO1xuXG4gIGFwcC51c2UoYXN5bmMgZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgICBpZiAoIWFwcFVybChyZXEudXJsKSkge1xuICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcmVxLm1ldGhvZCAhPT0gJ0hFQUQnICYmXG4gICAgICByZXEubWV0aG9kICE9PSAnR0VUJyAmJlxuICAgICAgIU1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcz8ud2ViYXBwPy5hbHdheXNSZXR1cm5Db250ZW50XG4gICAgKSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSByZXEubWV0aG9kID09PSAnT1BUSU9OUycgPyAyMDAgOiA0MDU7XG4gICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywge1xuICAgICAgICBBbGxvdzogJ09QVElPTlMsIEdFVCwgSEVBRCcsXG4gICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcwJyxcbiAgICAgIH0pO1xuICAgICAgcmVzLmVuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAgICAgfTtcblxuICAgICAgaWYgKHNodXR0aW5nRG93bikge1xuICAgICAgICBoZWFkZXJzWydDb25uZWN0aW9uJ10gPSAnQ2xvc2UnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IFdlYkFwcC5jYXRlZ29yaXplUmVxdWVzdChyZXEpO1xuICAgICAgdmFyIHJlc3BvbnNlID0gcmVzO1xuXG4gICAgICBpZiAocmVxdWVzdC51cmwucXVlcnkgJiYgcmVxdWVzdC51cmwucXVlcnlbJ21ldGVvcl9jc3NfcmVzb3VyY2UnXSkge1xuICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIHdlJ3JlIHJlcXVlc3RpbmcgYSBDU1MgcmVzb3VyY2UgaW4gdGhlIG1ldGVvci1zcGVjaWZpY1xuICAgICAgICAvLyB3YXksIGJ1dCB3ZSBkb24ndCBoYXZlIGl0LiAgU2VydmUgYSBzdGF0aWMgY3NzIGZpbGUgdGhhdCBpbmRpY2F0ZXMgdGhhdFxuICAgICAgICAvLyB3ZSBkaWRuJ3QgaGF2ZSBpdCwgc28gd2UgY2FuIGRldGVjdCB0aGF0IGFuZCByZWZyZXNoLiAgTWFrZSBzdXJlXG4gICAgICAgIC8vIHRoYXQgYW55IHByb3hpZXMgb3IgQ0ROcyBkb24ndCBjYWNoZSB0aGlzIGVycm9yISAgKE5vcm1hbGx5IHByb3hpZXNcbiAgICAgICAgLy8gb3IgQ0ROcyBhcmUgc21hcnQgZW5vdWdoIG5vdCB0byBjYWNoZSBlcnJvciBwYWdlcywgYnV0IGluIG9yZGVyIHRvXG4gICAgICAgIC8vIG1ha2UgdGhpcyBoYWNrIHdvcmssIHdlIG5lZWQgdG8gcmV0dXJuIHRoZSBDU1MgZmlsZSBhcyBhIDIwMCwgd2hpY2hcbiAgICAgICAgLy8gd291bGQgb3RoZXJ3aXNlIGJlIGNhY2hlZC4pXG4gICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04JztcbiAgICAgICAgaGVhZGVyc1snQ2FjaGUtQ29udHJvbCddID0gJ25vLWNhY2hlJztcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIGhlYWRlcnMpO1xuICAgICAgICByZXMud3JpdGUoJy5tZXRlb3ItY3NzLW5vdC1mb3VuZC1lcnJvciB7IHdpZHRoOiAwcHg7fScpO1xuICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcXVlc3QudXJsLnF1ZXJ5ICYmIHJlcXVlc3QudXJsLnF1ZXJ5WydtZXRlb3JfanNfcmVzb3VyY2UnXSkge1xuICAgICAgICAvLyBTaW1pbGFybHksIHdlJ3JlIHJlcXVlc3RpbmcgYSBKUyByZXNvdXJjZSB0aGF0IHdlIGRvbid0IGhhdmUuXG4gICAgICAgIC8vIFNlcnZlIGFuIHVuY2FjaGVkIDQwNC4gKFdlIGNhbid0IHVzZSB0aGUgc2FtZSBoYWNrIHdlIHVzZSBmb3IgQ1NTLFxuICAgICAgICAvLyBiZWNhdXNlIGFjdHVhbGx5IGFjdGluZyBvbiB0aGF0IGhhY2sgcmVxdWlyZXMgdXMgdG8gaGF2ZSB0aGUgSlNcbiAgICAgICAgLy8gYWxyZWFkeSEpXG4gICAgICAgIGhlYWRlcnNbJ0NhY2hlLUNvbnRyb2wnXSA9ICduby1jYWNoZSc7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoNDA0LCBoZWFkZXJzKTtcbiAgICAgICAgcmVzLmVuZCgnNDA0IE5vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXF1ZXN0LnVybC5xdWVyeSAmJiByZXF1ZXN0LnVybC5xdWVyeVsnbWV0ZW9yX2RvbnRfc2VydmVfaW5kZXgnXSkge1xuICAgICAgICAvLyBXaGVuIGRvd25sb2FkaW5nIGZpbGVzIGR1cmluZyBhIENvcmRvdmEgaG90IGNvZGUgcHVzaCwgd2UgbmVlZFxuICAgICAgICAvLyB0byBkZXRlY3QgaWYgYSBmaWxlIGlzIG5vdCBhdmFpbGFibGUgaW5zdGVhZCBvZiBpbmFkdmVydGVudGx5XG4gICAgICAgIC8vIGRvd25sb2FkaW5nIHRoZSBkZWZhdWx0IGluZGV4IHBhZ2UuXG4gICAgICAgIC8vIFNvIHNpbWlsYXIgdG8gdGhlIHNpdHVhdGlvbiBhYm92ZSwgd2Ugc2VydmUgYW4gdW5jYWNoZWQgNDA0LlxuICAgICAgICBoZWFkZXJzWydDYWNoZS1Db250cm9sJ10gPSAnbm8tY2FjaGUnO1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCwgaGVhZGVycyk7XG4gICAgICAgIHJlcy5lbmQoJzQwNCBOb3QgRm91bmQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IGFyY2ggfSA9IHJlcXVlc3Q7XG4gICAgICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIGFyY2gsICdzdHJpbmcnLCB7IGFyY2ggfSk7XG5cbiAgICAgIGlmICghaGFzT3duLmNhbGwoV2ViQXBwLmNsaWVudFByb2dyYW1zLCBhcmNoKSkge1xuICAgICAgICAvLyBXZSBjb3VsZCBjb21lIGhlcmUgaW4gY2FzZSB3ZSBydW4gd2l0aCBzb21lIGFyY2hpdGVjdHVyZXMgZXhjbHVkZWRcbiAgICAgICAgaGVhZGVyc1snQ2FjaGUtQ29udHJvbCddID0gJ25vLWNhY2hlJztcbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQsIGhlYWRlcnMpO1xuICAgICAgICBpZiAoTWV0ZW9yLmlzRGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgICByZXMuZW5kKGBObyBjbGllbnQgcHJvZ3JhbSBmb3VuZCBmb3IgdGhlICR7YXJjaH0gYXJjaGl0ZWN0dXJlLmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNhZmV0eSBuZXQsIGJ1dCB0aGlzIGJyYW5jaCBzaG91bGQgbm90IGJlIHBvc3NpYmxlLlxuICAgICAgICAgIHJlcy5lbmQoJzQwNCBOb3QgRm91bmQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHBhdXNlQ2xpZW50KGFyY2gpIGhhcyBiZWVuIGNhbGxlZCwgcHJvZ3JhbS5wYXVzZWQgd2lsbCBiZSBhXG4gICAgICAvLyBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoZSBwcm9ncmFtIGlzIHVucGF1c2VkLlxuICAgICAgYXdhaXQgV2ViQXBwLmNsaWVudFByb2dyYW1zW2FyY2hdLnBhdXNlZDtcblxuICAgICAgcmV0dXJuIGdldEJvaWxlcnBsYXRlQXN5bmMocmVxdWVzdCwgYXJjaCwgcmVzcG9uc2UpXG4gICAgICAgIC50aGVuKCh7IHN0cmVhbSwgc3RhdHVzQ29kZSwgaGVhZGVyczogbmV3SGVhZGVycyB9KSA9PiB7XG4gICAgICAgICAgaWYgKCFzdGF0dXNDb2RlKSB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlID0gcmVzLnN0YXR1c0NvZGUgPyByZXMuc3RhdHVzQ29kZSA6IDIwMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobmV3SGVhZGVycykge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihoZWFkZXJzLCBuZXdIZWFkZXJzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1c0NvZGUsIGhlYWRlcnMpO1xuXG4gICAgICAgICAgaWYgKCFkaXNhYmxlQm9pbGVycGxhdGVSZXNwb25zZSkge1xuICAgICAgICAgICAgc3RyZWFtLnBpcGUocmVzLCB7XG4gICAgICAgICAgICAgIC8vIEVuZCB0aGUgcmVzcG9uc2Ugd2hlbiB0aGUgc3RyZWFtIGVuZHMuXG4gICAgICAgICAgICAgIGVuZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBMb2cuZXJyb3IoJ0Vycm9yIHJ1bm5pbmcgdGVtcGxhdGU6ICcgKyBlcnJvci5zdGFjayk7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIGhlYWRlcnMpO1xuICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBSZXR1cm4gNDA0IGJ5IGRlZmF1bHQsIGlmIG5vIG90aGVyIGhhbmRsZXJzIHNlcnZlIHRoaXMgVVJMLlxuICBhcHAudXNlKGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG4gICAgcmVzLndyaXRlSGVhZCg0MDQpO1xuICAgIHJlcy5lbmQoKTtcbiAgfSk7XG5cbiAgdmFyIGh0dHBTZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoYXBwKTtcbiAgdmFyIG9uTGlzdGVuaW5nQ2FsbGJhY2tzID0gW107XG5cbiAgLy8gQWZ0ZXIgNSBzZWNvbmRzIHcvbyBkYXRhIG9uIGEgc29ja2V0LCBraWxsIGl0LiAgT24gdGhlIG90aGVyIGhhbmQsIGlmXG4gIC8vIHRoZXJlJ3MgYW4gb3V0c3RhbmRpbmcgcmVxdWVzdCwgZ2l2ZSBpdCBhIGhpZ2hlciB0aW1lb3V0IGluc3RlYWQgKHRvIGF2b2lkXG4gIC8vIGtpbGxpbmcgbG9uZy1wb2xsaW5nIHJlcXVlc3RzKVxuICBodHRwU2VydmVyLnNldFRpbWVvdXQoU0hPUlRfU09DS0VUX1RJTUVPVVQpO1xuXG4gIC8vIERvIHRoaXMgaGVyZSwgYW5kIHRoZW4gYWxzbyBpbiBsaXZlZGF0YS9zdHJlYW1fc2VydmVyLmpzLCBiZWNhdXNlXG4gIC8vIHN0cmVhbV9zZXJ2ZXIuanMga2lsbHMgYWxsIHRoZSBjdXJyZW50IHJlcXVlc3QgaGFuZGxlcnMgd2hlbiBpbnN0YWxsaW5nIGl0c1xuICAvLyBvd24uXG4gIGh0dHBTZXJ2ZXIub24oJ3JlcXVlc3QnLCBXZWJBcHAuX3RpbWVvdXRBZGp1c3RtZW50UmVxdWVzdENhbGxiYWNrKTtcblxuICAvLyBJZiB0aGUgY2xpZW50IGdhdmUgdXMgYSBiYWQgcmVxdWVzdCwgdGVsbCBpdCBpbnN0ZWFkIG9mIGp1c3QgY2xvc2luZyB0aGVcbiAgLy8gc29ja2V0LiBUaGlzIGxldHMgbG9hZCBiYWxhbmNlcnMgaW4gZnJvbnQgb2YgdXMgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIFwiYVxuICAvLyBzZXJ2ZXIgaXMgcmFuZG9tbHkgY2xvc2luZyBzb2NrZXRzIGZvciBubyByZWFzb25cIiBhbmQgXCJjbGllbnQgc2VudCBhIGJhZFxuICAvLyByZXF1ZXN0XCIuXG4gIC8vXG4gIC8vIFRoaXMgd2lsbCBvbmx5IHdvcmsgb24gTm9kZSA2OyBOb2RlIDQgZGVzdHJveXMgdGhlIHNvY2tldCBiZWZvcmUgY2FsbGluZ1xuICAvLyB0aGlzIGV2ZW50LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL3B1bGwvNDU1Ny8gZm9yIGRldGFpbHMuXG4gIGh0dHBTZXJ2ZXIub24oJ2NsaWVudEVycm9yJywgKGVyciwgc29ja2V0KSA9PiB7XG4gICAgLy8gUHJlLU5vZGUtNiwgZG8gbm90aGluZy5cbiAgICBpZiAoc29ja2V0LmRlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChlcnIubWVzc2FnZSA9PT0gJ1BhcnNlIEVycm9yJykge1xuICAgICAgc29ja2V0LmVuZCgnSFRUUC8xLjEgNDAwIEJhZCBSZXF1ZXN0XFxyXFxuXFxyXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvciBvdGhlciBlcnJvcnMsIHVzZSB0aGUgZGVmYXVsdCBiZWhhdmlvciBhcyBpZiB3ZSBoYWQgbm8gY2xpZW50RXJyb3JcbiAgICAgIC8vIGhhbmRsZXIuXG4gICAgICBzb2NrZXQuZGVzdHJveShlcnIpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3Qgc3VwcHJlc3NFcnJvcnMgPSBmdW5jdGlvbigpIHtcbiAgICBzdXBwcmVzc0V4cHJlc3NFcnJvcnMgPSB0cnVlO1xuICB9O1xuXG4gIGxldCB3YXJuZWRBYm91dENvbm5lY3RVc2FnZSA9IGZhbHNlO1xuXG4gIC8vIHN0YXJ0IHVwIGFwcFxuICBPYmplY3QuYXNzaWduKFdlYkFwcCwge1xuICAgIGNvbm5lY3RIYW5kbGVyczogcGFja2FnZUFuZEFwcEhhbmRsZXJzLFxuICAgIGhhbmRsZXJzOiBwYWNrYWdlQW5kQXBwSGFuZGxlcnMsXG4gICAgcmF3Q29ubmVjdEhhbmRsZXJzOiByYXdFeHByZXNzSGFuZGxlcnMsXG4gICAgcmF3SGFuZGxlcnM6IHJhd0V4cHJlc3NIYW5kbGVycyxcbiAgICBodHRwU2VydmVyOiBodHRwU2VydmVyLFxuICAgIGV4cHJlc3NBcHA6IGFwcCxcbiAgICAvLyBGb3IgdGVzdGluZy5cbiAgICBzdXBwcmVzc0Nvbm5lY3RFcnJvcnM6ICgpID0+IHtcbiAgICAgIGlmICghIHdhcm5lZEFib3V0Q29ubmVjdFVzYWdlKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoXCJXZWJBcHAuc3VwcHJlc3NDb25uZWN0RXJyb3JzIGhhcyBiZWVuIHJlbmFtZWQgdG8gTWV0ZW9yLl9zdXBwcmVzc0V4cHJlc3NFcnJvcnMgYW5kIGl0IHNob3VsZCBiZSB1c2VkIG9ubHkgaW4gdGVzdHMuXCIpO1xuICAgICAgICB3YXJuZWRBYm91dENvbm5lY3RVc2FnZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBzdXBwcmVzc0Vycm9ycygpO1xuICAgIH0sXG4gICAgX3N1cHByZXNzRXhwcmVzc0Vycm9yczogc3VwcHJlc3NFcnJvcnMsXG4gICAgb25MaXN0ZW5pbmc6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIGlmIChvbkxpc3RlbmluZ0NhbGxiYWNrcykgb25MaXN0ZW5pbmdDYWxsYmFja3MucHVzaChmKTtcbiAgICAgIGVsc2UgZigpO1xuICAgIH0sXG4gICAgLy8gVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VycyB3aG8gd2FudCB0byBtb2RpZnkgaG93IGxpc3RlbmluZyB3b3Jrc1xuICAgIC8vIChlZywgdG8gcnVuIGEgcHJveHkgbGlrZSBBcG9sbG8gRW5naW5lIFByb3h5IGluIGZyb250IG9mIHRoZSBzZXJ2ZXIpLlxuICAgIHN0YXJ0TGlzdGVuaW5nOiBmdW5jdGlvbihodHRwU2VydmVyLCBsaXN0ZW5PcHRpb25zLCBjYikge1xuICAgICAgaHR0cFNlcnZlci5saXN0ZW4obGlzdGVuT3B0aW9ucywgY2IpO1xuICAgIH0sXG4gIH0pO1xuXG4gICAgLyoqXG4gICAqIEBuYW1lIG1haW5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAc3VtbWFyeSBTdGFydHMgdGhlIEhUVFAgc2VydmVyLlxuICAgKiAgSWYgYFVOSVhfU09DS0VUX1BBVEhgIGlzIHByZXNlbnQgTWV0ZW9yJ3MgSFRUUCBzZXJ2ZXIgd2lsbCB1c2UgdGhhdCBzb2NrZXQgZmlsZSBmb3IgaW50ZXItcHJvY2VzcyBjb21tdW5pY2F0aW9uLCBpbnN0ZWFkIG9mIFRDUC5cbiAgICogSWYgeW91IGNob29zZSB0byBub3QgaW5jbHVkZSB3ZWJhcHAgcGFja2FnZSBpbiB5b3VyIGFwcGxpY2F0aW9uIHRoaXMgbWV0aG9kIHN0aWxsIG11c3QgYmUgZGVmaW5lZCBmb3IgeW91ciBNZXRlb3IgYXBwbGljYXRpb24gdG8gd29yay5cbiAgICovXG4gIC8vIExldCB0aGUgcmVzdCBvZiB0aGUgcGFja2FnZXMgKGFuZCBNZXRlb3Iuc3RhcnR1cCBob29rcykgaW5zZXJ0IEV4cHJlc3NcbiAgLy8gbWlkZGxld2FyZXMgYW5kIHVwZGF0ZSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLCB0aGVuIGtlZXAgZ29pbmcgdG8gc2V0IHVwXG4gIC8vIGFjdHVhbGx5IHNlcnZpbmcgSFRNTC5cbiAgZXhwb3J0cy5tYWluID0gYXN5bmMgYXJndiA9PiB7XG4gICAgYXdhaXQgV2ViQXBwSW50ZXJuYWxzLmdlbmVyYXRlQm9pbGVycGxhdGUoKTtcblxuICAgIGNvbnN0IHN0YXJ0SHR0cFNlcnZlciA9IGxpc3Rlbk9wdGlvbnMgPT4ge1xuICAgICAgV2ViQXBwLnN0YXJ0TGlzdGVuaW5nKFxuICAgICAgICBhcmd2Py5odHRwU2VydmVyIHx8IGh0dHBTZXJ2ZXIsXG4gICAgICAgIGxpc3Rlbk9wdGlvbnMsXG4gICAgICAgIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk1FVEVPUl9QUklOVF9PTl9MSVNURU4pIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xJU1RFTklORycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gb25MaXN0ZW5pbmdDYWxsYmFja3M7XG4gICAgICAgICAgICBvbkxpc3RlbmluZ0NhbGxiYWNrcyA9IG51bGw7XG4gICAgICAgICAgICBjYWxsYmFja3M/LmZvckVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxpc3RlbmluZzonLCBlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSAmJiBlLnN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIGxldCBsb2NhbFBvcnQgPSBwcm9jZXNzLmVudi5QT1JUIHx8IDA7XG4gICAgbGV0IHVuaXhTb2NrZXRQYXRoID0gcHJvY2Vzcy5lbnYuVU5JWF9TT0NLRVRfUEFUSDtcblxuICAgIGlmICh1bml4U29ja2V0UGF0aCkge1xuICAgICAgaWYgKGNsdXN0ZXIuaXNXb3JrZXIpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyTmFtZSA9IGNsdXN0ZXIud29ya2VyLnByb2Nlc3MuZW52Lm5hbWUgfHwgY2x1c3Rlci53b3JrZXIuaWQ7XG4gICAgICAgIHVuaXhTb2NrZXRQYXRoICs9ICcuJyArIHdvcmtlck5hbWUgKyAnLnNvY2snO1xuICAgICAgfVxuICAgICAgLy8gU3RhcnQgdGhlIEhUVFAgc2VydmVyIHVzaW5nIGEgc29ja2V0IGZpbGUuXG4gICAgICByZW1vdmVFeGlzdGluZ1NvY2tldEZpbGUodW5peFNvY2tldFBhdGgpO1xuICAgICAgc3RhcnRIdHRwU2VydmVyKHsgcGF0aDogdW5peFNvY2tldFBhdGggfSk7XG5cbiAgICAgIGNvbnN0IHVuaXhTb2NrZXRQZXJtaXNzaW9ucyA9IChcbiAgICAgICAgcHJvY2Vzcy5lbnYuVU5JWF9TT0NLRVRfUEVSTUlTU0lPTlMgfHwgJydcbiAgICAgICkudHJpbSgpO1xuICAgICAgaWYgKHVuaXhTb2NrZXRQZXJtaXNzaW9ucykge1xuICAgICAgICBpZiAoL15bMC03XXszfSQvLnRlc3QodW5peFNvY2tldFBlcm1pc3Npb25zKSkge1xuICAgICAgICAgIGNobW9kU3luYyh1bml4U29ja2V0UGF0aCwgcGFyc2VJbnQodW5peFNvY2tldFBlcm1pc3Npb25zLCA4KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFVOSVhfU09DS0VUX1BFUk1JU1NJT05TIHNwZWNpZmllZCcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVuaXhTb2NrZXRHcm91cCA9IChwcm9jZXNzLmVudi5VTklYX1NPQ0tFVF9HUk9VUCB8fCAnJykudHJpbSgpO1xuICAgICAgaWYgKHVuaXhTb2NrZXRHcm91cCkge1xuICAgICAgICBjb25zdCB1bml4U29ja2V0R3JvdXBJbmZvID0gZ2V0R3JvdXBJbmZvKHVuaXhTb2NrZXRHcm91cCk7XG4gICAgICAgIGlmICh1bml4U29ja2V0R3JvdXBJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFVOSVhfU09DS0VUX0dST1VQIG5hbWUgc3BlY2lmaWVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjaG93blN5bmModW5peFNvY2tldFBhdGgsIHVzZXJJbmZvKCkudWlkLCB1bml4U29ja2V0R3JvdXBJbmZvLmdpZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFUEVSTScgfHwgZXJyb3IuY29kZSA9PT0gJ0VBQ0NFUycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFNraXBwaW5nIFVOSVhfU09DS0VUX0dST1VQIGNoYW5nZSBmb3IgXCIke3VuaXhTb2NrZXRHcm91cH1cIiBiZWNhdXNlIGN1cnJlbnQgdXNlciBsYWNrcyBwZXJtaXNzaW9uLmApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVnaXN0ZXJTb2NrZXRGaWxlQ2xlYW51cCh1bml4U29ja2V0UGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsUG9ydCA9IGlzTmFOKE51bWJlcihsb2NhbFBvcnQpKSA/IGxvY2FsUG9ydCA6IE51bWJlcihsb2NhbFBvcnQpO1xuICAgICAgaWYgKC9cXFxcXFxcXD8uK1xcXFxwaXBlXFxcXD8uKy8udGVzdChsb2NhbFBvcnQpKSB7XG4gICAgICAgIC8vIFN0YXJ0IHRoZSBIVFRQIHNlcnZlciB1c2luZyBXaW5kb3dzIFNlcnZlciBzdHlsZSBuYW1lZCBwaXBlLlxuICAgICAgICBzdGFydEh0dHBTZXJ2ZXIoeyBwYXRoOiBsb2NhbFBvcnQgfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb2NhbFBvcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIFN0YXJ0IHRoZSBIVFRQIHNlcnZlciB1c2luZyBUQ1AuXG4gICAgICAgIHN0YXJ0SHR0cFNlcnZlcih7XG4gICAgICAgICAgcG9ydDogbG9jYWxQb3J0LFxuICAgICAgICAgIGhvc3Q6IHByb2Nlc3MuZW52LkJJTkRfSVAgfHwgJzAuMC4wLjAnLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBQT1JUIHNwZWNpZmllZCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnREFFTU9OJztcbiAgfTtcbn1cblxuY29uc3QgaXNHZXRlbnRBdmFpbGFibGUgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgZXhlY1N5bmMoJ3doaWNoIGdldGVudCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGdldEdyb3VwSW5mb1VzaW5nR2V0ZW50ID0gKGdyb3VwTmFtZSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHN0ZG91dCA9IGV4ZWNTeW5jKGBnZXRlbnQgZ3JvdXAgJHtncm91cE5hbWV9YCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuICAgIGlmICghc3Rkb3V0KSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBbbmFtZSwgLCBnaWRdID0gc3Rkb3V0LnRyaW0oKS5zcGxpdCgnOicpO1xuICAgIGlmIChuYW1lID09IG51bGwgfHwgZ2lkID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7IG5hbWUsIGdpZDogTnVtYmVyKGdpZCkgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuY29uc3QgZ2V0R3JvdXBJbmZvRnJvbUZpbGUgPSAoZ3JvdXBOYW1lKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IHJlYWRGaWxlU3luYygnL2V0Yy9ncm91cCcsICd1dGY4Jyk7XG4gICAgY29uc3QgZ3JvdXBMaW5lID0gZGF0YS50cmltKCkuc3BsaXQoJ1xcbicpLmZpbmQobGluZSA9PiBsaW5lLnN0YXJ0c1dpdGgoYCR7Z3JvdXBOYW1lfTpgKSk7XG4gICAgaWYgKCFncm91cExpbmUpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IFtuYW1lLCAsIGdpZF0gPSBncm91cExpbmUudHJpbSgpLnNwbGl0KCc6Jyk7XG4gICAgaWYgKG5hbWUgPT0gbnVsbCB8fCBnaWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHsgbmFtZSwgZ2lkOiBOdW1iZXIoZ2lkKSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0R3JvdXBJbmZvID0gKGdyb3VwTmFtZSkgPT4ge1xuICBsZXQgZ3JvdXBJbmZvID0gZ2V0R3JvdXBJbmZvRnJvbUZpbGUoZ3JvdXBOYW1lKTtcbiAgaWYgKCFncm91cEluZm8gJiYgaXNHZXRlbnRBdmFpbGFibGUoKSkge1xuICAgIGdyb3VwSW5mbyA9IGdldEdyb3VwSW5mb1VzaW5nR2V0ZW50KGdyb3VwTmFtZSk7XG4gIH1cbiAgcmV0dXJuIGdyb3VwSW5mbztcbn07XG5cbnZhciBpbmxpbmVTY3JpcHRzQWxsb3dlZCA9IHRydWU7XG5cbldlYkFwcEludGVybmFscy5pbmxpbmVTY3JpcHRzQWxsb3dlZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gaW5saW5lU2NyaXB0c0FsbG93ZWQ7XG59O1xuXG5XZWJBcHBJbnRlcm5hbHMuc2V0SW5saW5lU2NyaXB0c0FsbG93ZWQgPSBhc3luYyBmdW5jdGlvbih2YWx1ZSkge1xuICBpbmxpbmVTY3JpcHRzQWxsb3dlZCA9IHZhbHVlO1xuICBhd2FpdCBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVCb2lsZXJwbGF0ZSgpO1xufTtcblxudmFyIHNyaU1vZGU7XG5cbldlYkFwcEludGVybmFscy5lbmFibGVTdWJyZXNvdXJjZUludGVncml0eSA9IGFzeW5jIGZ1bmN0aW9uKHVzZV9jcmVkZW50aWFscyA9IGZhbHNlKSB7XG4gIHNyaU1vZGUgPSB1c2VfY3JlZGVudGlhbHMgPyAndXNlLWNyZWRlbnRpYWxzJyA6ICdhbm9ueW1vdXMnO1xuICBhd2FpdCBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVCb2lsZXJwbGF0ZSgpO1xufTtcblxuV2ViQXBwSW50ZXJuYWxzLnNldEJ1bmRsZWRKc0Nzc1VybFJld3JpdGVIb29rID0gYXN5bmMgZnVuY3Rpb24oaG9va0ZuKSB7XG4gIGJ1bmRsZWRKc0Nzc1VybFJld3JpdGVIb29rID0gaG9va0ZuO1xuICBhd2FpdCBXZWJBcHBJbnRlcm5hbHMuZ2VuZXJhdGVCb2lsZXJwbGF0ZSgpO1xufTtcblxuV2ViQXBwSW50ZXJuYWxzLnNldEJ1bmRsZWRKc0Nzc1ByZWZpeCA9IGFzeW5jIGZ1bmN0aW9uKHByZWZpeCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGF3YWl0IHNlbGYuc2V0QnVuZGxlZEpzQ3NzVXJsUmV3cml0ZUhvb2soZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuIHByZWZpeCArIHVybDtcbiAgfSk7XG59O1xuXG4vLyBQYWNrYWdlcyBjYW4gY2FsbCBgV2ViQXBwSW50ZXJuYWxzLmFkZFN0YXRpY0pzYCB0byBzcGVjaWZ5IHN0YXRpY1xuLy8gSmF2YVNjcmlwdCB0byBiZSBpbmNsdWRlZCBpbiB0aGUgYXBwLiBUaGlzIHN0YXRpYyBKUyB3aWxsIGJlIGlubGluZWQsXG4vLyB1bmxlc3MgaW5saW5lIHNjcmlwdHMgaGF2ZSBiZWVuIGRpc2FibGVkLCBpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmVcbi8vIHNlcnZlZCB1bmRlciBgLzxzaGExIG9mIGNvbnRlbnRzPmAuXG52YXIgYWRkaXRpb25hbFN0YXRpY0pzID0ge307XG5XZWJBcHBJbnRlcm5hbHMuYWRkU3RhdGljSnMgPSBmdW5jdGlvbihjb250ZW50cykge1xuICBhZGRpdGlvbmFsU3RhdGljSnNbJy8nICsgc2hhMShjb250ZW50cykgKyAnLmpzJ10gPSBjb250ZW50cztcbn07XG5cbnZhciBkaXNhYmxlQm9pbGVycGxhdGVSZXNwb25zZSA9IGZhbHNlO1xuV2ViQXBwSW50ZXJuYWxzLmRpc2FibGVCb2lsZXJwbGF0ZVJlc3BvbnNlID0gZnVuY3Rpb24oKSB7XG4gIGRpc2FibGVCb2lsZXJwbGF0ZVJlc3BvbnNlID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RzXG5XZWJBcHBJbnRlcm5hbHMuZ2V0Qm9pbGVycGxhdGUgPSBnZXRCb2lsZXJwbGF0ZTtcbldlYkFwcEludGVybmFscy5hZGRpdGlvbmFsU3RhdGljSnMgPSBhZGRpdGlvbmFsU3RhdGljSnM7XG5cbmF3YWl0IHJ1bldlYkFwcFNlcnZlcigpO1xuIiwiaW1wb3J0IHsgc3RhdFN5bmMsIHVubGlua1N5bmMsIGV4aXN0c1N5bmMgfSBmcm9tICdmcyc7XG5cbi8vIFNpbmNlIGEgbmV3IHNvY2tldCBmaWxlIHdpbGwgYmUgY3JlYXRlZCB3aGVuIHRoZSBIVFRQIHNlcnZlclxuLy8gc3RhcnRzIHVwLCBpZiBmb3VuZCByZW1vdmUgdGhlIGV4aXN0aW5nIGZpbGUuXG4vL1xuLy8gV0FSTklORzpcbi8vIFRoaXMgd2lsbCByZW1vdmUgdGhlIGNvbmZpZ3VyZWQgc29ja2V0IGZpbGUgd2l0aG91dCB3YXJuaW5nLiBJZlxuLy8gdGhlIGNvbmZpZ3VyZWQgc29ja2V0IGZpbGUgaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciBhcHBsaWNhdGlvbixcbi8vIGl0IHdpbGwgc3RpbGwgYmUgcmVtb3ZlZC4gTm9kZSBkb2VzIG5vdCBwcm92aWRlIGEgcmVsaWFibGUgd2F5IHRvXG4vLyBkaWZmZXJlbnRpYXRlIGJldHdlZW4gYSBzb2NrZXQgZmlsZSB0aGF0IGlzIGFscmVhZHkgaW4gdXNlIGJ5XG4vLyBhbm90aGVyIGFwcGxpY2F0aW9uIG9yIGEgc3RhbGUgc29ja2V0IGZpbGUgdGhhdCBoYXMgYmVlblxuLy8gbGVmdCBvdmVyIGFmdGVyIGEgU0lHS0lMTC4gU2luY2Ugd2UgaGF2ZSBubyByZWxpYWJsZSB3YXkgdG9cbi8vIGRpZmZlcmVudGlhdGUgYmV0d2VlbiB0aGVzZSB0d28gc2NlbmFyaW9zLCB0aGUgYmVzdCBjb3Vyc2Ugb2Zcbi8vIGFjdGlvbiBkdXJpbmcgc3RhcnR1cCBpcyB0byByZW1vdmUgYW55IGV4aXN0aW5nIHNvY2tldCBmaWxlLiBUaGlzXG4vLyBpcyBub3QgdGhlIHNhZmVzdCBjb3Vyc2Ugb2YgYWN0aW9uIGFzIHJlbW92aW5nIHRoZSBleGlzdGluZyBzb2NrZXRcbi8vIGZpbGUgY291bGQgaW1wYWN0IGFuIGFwcGxpY2F0aW9uIHVzaW5nIGl0LCBidXQgdGhpcyBhcHByb2FjaCBoZWxwc1xuLy8gZW5zdXJlIHRoZSBIVFRQIHNlcnZlciBjYW4gc3RhcnR1cCB3aXRob3V0IG1hbnVhbFxuLy8gaW50ZXJ2ZW50aW9uIChlLmcuIGFza2luZyBmb3IgdGhlIHZlcmlmaWNhdGlvbiBhbmQgY2xlYW51cCBvZiBzb2NrZXRcbi8vIGZpbGVzIGJlZm9yZSBhbGxvd2luZyB0aGUgSFRUUCBzZXJ2ZXIgdG8gYmUgc3RhcnRlZCkuXG4vL1xuLy8gVGhlIGFib3ZlIGJlaW5nIHNhaWQsIGFzIGxvbmcgYXMgdGhlIHNvY2tldCBmaWxlIHBhdGggaXNcbi8vIGNvbmZpZ3VyZWQgY2FyZWZ1bGx5IHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIGRlcGxveWVkIChhbmQgZXh0cmFcbi8vIGNhcmUgaXMgdGFrZW4gdG8gbWFrZSBzdXJlIHRoZSBjb25maWd1cmVkIHBhdGggaXMgdW5pcXVlIGFuZCBkb2Vzbid0XG4vLyBjb25mbGljdCB3aXRoIGFub3RoZXIgc29ja2V0IGZpbGUgcGF0aCksIHRoZW4gdGhlcmUgc2hvdWxkIG5vdCBiZVxuLy8gYW55IGlzc3VlcyB3aXRoIHRoaXMgYXBwcm9hY2guXG5leHBvcnQgY29uc3QgcmVtb3ZlRXhpc3RpbmdTb2NrZXRGaWxlID0gKHNvY2tldFBhdGgpID0+IHtcbiAgdHJ5IHtcbiAgICBpZiAoc3RhdFN5bmMoc29ja2V0UGF0aCkuaXNTb2NrZXQoKSkge1xuICAgICAgLy8gU2luY2UgYSBuZXcgc29ja2V0IGZpbGUgd2lsbCBiZSBjcmVhdGVkLCByZW1vdmUgdGhlIGV4aXN0aW5nXG4gICAgICAvLyBmaWxlLlxuICAgICAgdW5saW5rU3luYyhzb2NrZXRQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQW4gZXhpc3RpbmcgZmlsZSB3YXMgZm91bmQgYXQgXCIke3NvY2tldFBhdGh9XCIgYW5kIGl0IGlzIG5vdCBgICtcbiAgICAgICAgJ2Egc29ja2V0IGZpbGUuIFBsZWFzZSBjb25maXJtIFBPUlQgaXMgcG9pbnRpbmcgdG8gdmFsaWQgYW5kICcgK1xuICAgICAgICAndW4tdXNlZCBzb2NrZXQgZmlsZSBwYXRoLidcbiAgICAgICk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4aXN0aW5nIHNvY2tldCBmaWxlIHRvIGNsZWFudXAsIGdyZWF0LCB3ZSdsbFxuICAgIC8vIGNvbnRpbnVlIG5vcm1hbGx5LiBJZiB0aGUgY2F1Z2h0IGV4Y2VwdGlvbiByZXByZXNlbnRzIGFueSBvdGhlclxuICAgIC8vIGlzc3VlLCByZS10aHJvdy5cbiAgICBpZiAoZXJyb3IuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufTtcblxuLy8gUmVtb3ZlIHRoZSBzb2NrZXQgZmlsZSB3aGVuIGRvbmUgdG8gYXZvaWQgbGVhdmluZyBiZWhpbmQgYSBzdGFsZSBvbmUuXG4vLyBOb3RlIC0gYSBzdGFsZSBzb2NrZXQgZmlsZSBpcyBzdGlsbCBsZWZ0IGJlaGluZCBpZiB0aGUgcnVubmluZyBub2RlXG4vLyBwcm9jZXNzIGlzIGtpbGxlZCB2aWEgc2lnbmFsIDkgLSBTSUdLSUxMLlxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyU29ja2V0RmlsZUNsZWFudXAgPVxuICAoc29ja2V0UGF0aCwgZXZlbnRFbWl0dGVyID0gcHJvY2VzcykgPT4ge1xuICAgIFsnZXhpdCcsICdTSUdJTlQnLCAnU0lHSFVQJywgJ1NJR1RFUk0nXS5mb3JFYWNoKHNpZ25hbCA9PiB7XG4gICAgICBldmVudEVtaXR0ZXIub24oc2lnbmFsLCBNZXRlb3IuYmluZEVudmlyb25tZW50KCgpID0+IHtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc29ja2V0UGF0aCkpIHtcbiAgICAgICAgICB1bmxpbmtTeW5jKHNvY2tldFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG4iXX0=
