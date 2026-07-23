Package["core-runtime"].queue("ddp-server",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Retry = Package.retry.Retry;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DDP = Package['ddp-client'].DDP;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var StreamServer, DDPServer, Server;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-server":{"transports":{"raw_connection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/transports/raw_connection.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({RawWebSocketConnection:()=>RawWebSocketConnection});let EventEmitter;module.link('events',{EventEmitter(v){EventEmitter=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
/**
 * Wrapper around a raw WebSocket connection that provides the same
 * interface as a SockJS connection, as expected by _onConnection
 * and livedata_server.js.
 *
 * Used by non-SockJS transports that provide a standard WebSocket
 * object. The uws transport implements its own socket interface directly.
 */ class RawWebSocketConnection extends EventEmitter {
    write(data) {
        if (this._ws) this._ws.send(data);
    }
    send(data) {
        this.write(data);
    }
    close() {
        if (this._ws) this._ws.close();
    }
    setWebsocketTimeout(timeout) {
        if (this._rawSocket) {
            this._rawSocket.setTimeout(timeout);
        }
    }
    constructor(ws, req, rawSocket, messageAdapter){
        super();
        this._ws = ws;
        this._rawSocket = rawSocket;
        this.protocol = 'websocket-raw';
        this.id = Random.id();
        // Copy relevant headers (same set as SockJS transport.js)
        this.headers = {};
        const headerKeys = [
            'referer',
            'x-client-ip',
            'x-forwarded-for',
            'x-forwarded-host',
            'x-forwarded-port',
            'x-cluster-client-ip',
            'via',
            'x-real-ip',
            'x-forwarded-proto',
            'x-ssl',
            'dnt',
            'host',
            'user-agent',
            'accept-language'
        ];
        for (const key of headerKeys){
            if (req.headers[key]) this.headers[key] = req.headers[key];
        }
        this.remoteAddress = rawSocket.remoteAddress;
        this.remotePort = rawSocket.remotePort;
        this.url = req.url;
        // Compatibility with SockJS internals that stream_server accesses
        this._session = {
            recv: {
                connection: rawSocket,
                protocol: 'websocket-raw'
            }
        };
        // messageAdapter extracts the string data from the transport's message event.
        // Each transport has a different message event signature.
        ws.on('message', (...args)=>{
            var str = messageAdapter(...args);
            if (str != null) this.emit('data', str);
        });
        ws.on('close', ()=>{
            this.emit('close');
            this._ws = null;
        });
        ws.on('error', ()=>{
            this.emit('close');
            this._ws = null;
        });
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sockjs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/transports/sockjs.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({createSockJSTransport:()=>createSockJSTransport});let EventEmitter;module.link('events',{EventEmitter(v){EventEmitter=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
/**
 * SockJS transport — the traditional Meteor transport.
 * Provides WebSocket with automatic fallback to HTTP polling.
 */ function createSockJSTransport() {
    return {
        name: 'sockjs',
        setup (httpServer, pathPrefix, options) {
            var emitter = new EventEmitter();
            var sockjs = Npm.require('sockjs');
            var prefix = pathPrefix + '/sockjs';
            RoutePolicy.declare(prefix + '/', 'network');
            var serverOptions = {
                prefix: prefix,
                log: function() {},
                // this is the default, but we code it explicitly because we depend
                // on it in stream_client:HEARTBEAT_TIMEOUT
                heartbeat_delay: 45000,
                // The default disconnect_delay is 5 seconds, but if the server ends up CPU
                // bound for that much time, SockJS might not notice that the user has
                // reconnected because the timer (of disconnect_delay ms) can fire before
                // SockJS processes the new connection. Eventually we'll fix this by not
                // combining CPU-heavy processing with SockJS termination (eg a proxy which
                // converts to Unix sockets) but for now, raise the delay.
                disconnect_delay: 60 * 1000,
                // Allow disabling of CORS requests to address
                // https://github.com/meteor/meteor/issues/8317.
                disable_cors: !!process.env.DISABLE_SOCKJS_CORS,
                // Set the USE_JSESSIONID environment variable to enable setting the
                // JSESSIONID cookie. This is useful for setting up proxies with
                // session affinity.
                jsessionid: !!process.env.USE_JSESSIONID
            };
            // If you know your server environment (eg, proxies) will prevent websockets
            // from ever working, set $DISABLE_WEBSOCKETS and SockJS clients (ie,
            // browsers) will not waste time attempting to use them.
            // (Your server will still have a /websocket endpoint.)
            if (process.env.DISABLE_WEBSOCKETS) {
                serverOptions.websocket = false;
            } else {
                serverOptions.faye_server_options = {
                    extensions: options.websocketExtensions()
                };
            }
            var server = sockjs.createServer(serverOptions);
            // Install the sockjs handlers, but we want to keep around our own particular
            // request handler that adjusts idle timeouts while we have an outstanding
            // request.  This compensates for the fact that sockjs removes all listeners
            // for "request" to add its own.
            httpServer.removeListener('request', WebApp._timeoutAdjustmentRequestCallback);
            server.installHandlers(httpServer);
            httpServer.addListener('request', WebApp._timeoutAdjustmentRequestCallback);
            // Support the /websocket endpoint by redirecting to /sockjs/websocket
            redirectWebsocketEndpoint(httpServer, pathPrefix, prefix);
            server.on('connection', function(socket) {
                emitter.emit('connection', socket);
            });
            return emitter;
        }
    };
}
/**
 * Redirect /websocket to /sockjs/websocket in order to not expose
 * sockjs to clients that want to use raw websockets.
 */ function redirectWebsocketEndpoint(httpServer, pathPrefix, sockjsPrefix) {
    // Unfortunately we can't use a connect middleware here since
    // sockjs installs itself prior to all existing listeners
    // (meaning prior to any connect middlewares) so we need to take
    // an approach similar to overshadowListeners in
    // https://github.com/sockjs/sockjs-node/blob/cf820c55af6a9953e16558555a31decea554f70e/src/utils.coffee
    [
        'request',
        'upgrade'
    ].forEach((event)=>{
        var oldHttpServerListeners = httpServer.listeners(event).slice(0);
        httpServer.removeAllListeners(event);
        // request and upgrade have different arguments passed but
        // we only care about the first one which is always request
        var newListener = function(request /*, moreArguments */ ) {
            // Store arguments for use within the closure below
            var args = arguments;
            // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while
            // preserving query string.
            var parsedUrl = new URL(request.url, 'http://localhost');
            if (parsedUrl.pathname === pathPrefix + '/websocket' || parsedUrl.pathname === pathPrefix + '/websocket/') {
                parsedUrl.pathname = sockjsPrefix + '/websocket';
                request.url = parsedUrl.pathname + parsedUrl.search;
            }
            oldHttpServerListeners.forEach(function(oldListener) {
                oldListener.apply(httpServer, args);
            });
        };
        httpServer.addListener(event, newListener);
    });
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"uws.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/transports/uws.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({createUwsTransport:()=>createUwsTransport});let EventEmitter;module.link('events',{EventEmitter(v){EventEmitter=v}},0);let net;module.link('node:net',{default(v){net=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

/**
 * Configuration via Meteor.settings:
 *   { "packages": { "ddp-server": { "transport": "uws", "uws": { "port": 5001, "host": "127.0.0.1", "payloadLength": 48, "timeout": 45 } } } }
 */ function createUwsTransport() {
    return {
        name: 'uws',
        setup (httpServer, pathPrefix, options) {
            var _Meteor_settings_packages_ddpserver, _Meteor_settings_packages, _Meteor_settings;
            const emitter = new EventEmitter();
            const uws = Npm.require('uWebSockets.js');
            const settings = ((_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_ddpserver = _Meteor_settings_packages['ddp-server']) === null || _Meteor_settings_packages_ddpserver === void 0 ? void 0 : _Meteor_settings_packages_ddpserver.uws) || {};
            const uwsPort = Number(settings.port) || 5001;
            const uwsPayloadLength = Number(settings.payloadLength) || 48;
            const uwsSocketTimeout = Number(settings.timeout) || 45;
            const uwsHost = settings.host || '127.0.0.1';
            const uwsProxyHost = uwsHost === '0.0.0.0' ? '127.0.0.1' : uwsHost === '::' ? '::1' : uwsHost;
            // WeakMaps for event listeners (uWS sockets don't have EventEmitter).
            // WeakMap allows automatic GC if uWS drops a socket without firing close.
            // Values are arrays so multiple consumers (e.g. stream_server and
            // livedata_server) can each register a 'close' or 'data' listener.
            const closeListeners = new WeakMap();
            const messageListeners = new WeakMap();
            const uwsApp = uws.App();
            uwsApp.get('/*', function(res) {
                res.end('OK');
            });
            uwsApp.ws('/*', {
                maxBackpressure: 16 * 1024 * 1024,
                maxPayloadLength: uwsPayloadLength * 1024,
                idleTimeout: uwsSocketTimeout,
                open (socket) {
                    // Adapt uWS socket to the interface expected by _onConnection.
                    // uWS sockets don't have EventEmitter methods, so we provide them.
                    socket.on = function(event, callback) {
                        const map = event === 'close' ? closeListeners : event === 'data' ? messageListeners : null;
                        if (!map) return;
                        const list = map.get(socket);
                        if (list) {
                            list.push(callback);
                        } else {
                            map.set(socket, [
                                callback
                            ]);
                        }
                    };
                    socket.setWebsocketTimeout = function() {
                    // uWS manages its own timeouts internally
                    };
                    socket.protocol = 'websocket-raw';
                    socket.headers = socket.headers || {};
                    emitter.emit('connection', socket);
                },
                upgrade (res, req, context) {
                    const headers = {};
                    req.forEach((key, value)=>{
                        headers[key] = value;
                    });
                    res.upgrade({
                        headers
                    }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
                },
                close (socket) {
                    socket.isClosed = true;
                    const listeners = closeListeners.get(socket);
                    closeListeners.delete(socket);
                    messageListeners.delete(socket);
                    if (listeners) {
                        for (const cb of listeners){
                            try {
                                cb();
                            } catch (e) {
                                Meteor._debug('uws close listener threw', e);
                            }
                        }
                    }
                },
                message (socket, message, isBinary) {
                    if (isBinary) return;
                    const listeners = messageListeners.get(socket);
                    if (!listeners || listeners.length === 0) return;
                    const str = Buffer.from(message).toString('utf-8');
                    for (const cb of listeners){
                        try {
                            cb(str);
                        } catch (e) {
                            Meteor._debug('uws data listener threw', e);
                        }
                    }
                }
            });
            // Pass LIBUS_LISTEN_EXCLUSIVE_PORT so uWS does not enable SO_REUSEPORT
            // on this listening socket. With SO_REUSEPORT (uWS's default), two
            // Meteor processes in the same kernel network namespace will both
            // succeed in binding the same `(host, port)` tuple, and the kernel
            // will then load-balance inbound connections between them — splitting
            // WS upgrade traffic across unrelated app processes. With EXCLUSIVE,
            // the second instance gets EADDRINUSE and `token` is false here, so
            // we throw a loud, actionable error instead of silently leaking
            // traffic. Operators running multiple Meteor instances on one host
            // must pick a distinct `Meteor.settings.packages["ddp-server"].uws.port`
            // (or `host`) per process.
            uwsApp.listen(uwsHost, uwsPort, uws.LIBUS_LISTEN_EXCLUSIVE_PORT, (token)=>{
                if (!token) {
                    throw new Error('uWebSockets.js: failed to listen on ' + uwsHost + ':' + uwsPort + ' (address already in use). Another Meteor instance in this ' + 'network namespace is already bound to this port. Set a ' + 'distinct Meteor.settings.packages["ddp-server"].uws.port ' + '(or .host) for each instance.');
                }
            });
            // Reject plain HTTP requests to /websocket
            WebApp.rawConnectHandlers.use(function(req, res, next) {
                const pathname = new URL(req.url, 'http://localhost').pathname;
                if (pathname === pathPrefix + '/websocket' || pathname === pathPrefix + '/websocket/') {
                    res.writeHead(400, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Not a valid websocket request');
                } else {
                    next();
                }
            });
            // Proxy WebSocket upgrade requests from the main HTTP server to uWS.
            // This is necessary because uWS runs on its own port.
            proxyWebsocketToUws(httpServer, pathPrefix, uwsProxyHost, uwsPort);
            return emitter;
        }
    };
}
/**
 * Proxy HTTP upgrade requests on /websocket from the main Meteor HTTP server
 * to the uWebSockets.js server via a raw TCP connection.
 */ function proxyWebsocketToUws(httpServer, pathPrefix, uwsHost, uwsPort) {
    const oldUpgradeListeners = httpServer.listeners('upgrade').slice(0);
    httpServer.removeAllListeners('upgrade');
    httpServer.on('upgrade', function(req, rawSocket, head) {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        if (pathname === pathPrefix + '/websocket' || pathname === pathPrefix + '/websocket/') {
            // Build the raw HTTP upgrade request to forward to uWS
            const uwsSocket = net.createConnection(uwsPort, uwsHost, function() {
                let headers = '';
                for(let i = 0; i < req.rawHeaders.length; i += 2){
                    headers += req.rawHeaders[i] + ': ' + req.rawHeaders[i + 1] + '\r\n';
                }
                const httpRequest = req.method + ' ' + req.url + ' HTTP/' + req.httpVersion + '\r\n' + headers + '\r\n';
                uwsSocket.write(httpRequest);
                if (head && head.length) uwsSocket.write(head);
                rawSocket.pipe(uwsSocket);
                uwsSocket.pipe(rawSocket);
            });
            uwsSocket.on('error', function() {
                if (rawSocket.writable) {
                    rawSocket.write('HTTP/1.1 502 Bad Gateway\r\n' + 'Connection: close\r\n' + 'Content-Type: text/plain\r\n' + '\r\n' + '502 Bad Gateway: Upstream WebSocket server unreachable.');
                }
                rawSocket.destroy();
            });
            rawSocket.on('error', function() {
                if (uwsSocket.writable) uwsSocket.destroy();
            });
        } else {
            // Pass to other upgrade handlers (HMR, etc.)
            for(let i = 0; i < oldUpgradeListeners.length; i++){
                oldUpgradeListeners[i].call(httpServer, req, rawSocket, head);
            }
        }
    });
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/transports/index.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({getTransport:()=>getTransport});let createSockJSTransport;module.link('./sockjs.js',{createSockJSTransport(v){createSockJSTransport=v}},0);let createUwsTransport;module.link('./uws.js',{createUwsTransport(v){createUwsTransport=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();

const TRANSPORTS = {
    sockjs: createSockJSTransport,
    uws: createUwsTransport
};
const VALID_NAMES = Object.keys(TRANSPORTS);
/**
 * Resolve which transport to use. Priority:
 *   1. Meteor.settings.packages['ddp-server'].transport
 *   2. DDP_TRANSPORT env var
 *   3. DISABLE_SOCKJS=1 → 'uws' (backward compat)
 *   4. default: 'sockjs'
 *
 * Also sets __meteor_runtime_config__.DDP_TRANSPORT so the client
 * knows whether to load SockJS or use native WebSocket.
 */ function getTransport() {
    var name = resolveTransportName();
    if (!TRANSPORTS[name]) {
        throw new Error('Unknown DDP transport: "' + name + '". ' + 'Valid transports: ' + VALID_NAMES.join(', '));
    }
    // Propagate to client runtime config so browser.js can decide
    // whether to load SockJS or use native WebSocket.
    __meteor_runtime_config__.DDP_TRANSPORT = name;
    return TRANSPORTS[name]();
}
function resolveTransportName() {
    var _Meteor_settings_packages, _Meteor_settings;
    // 1. Meteor settings
    var settings = (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : _Meteor_settings_packages['ddp-server'];
    if (settings && settings.transport) {
        return settings.transport;
    }
    // 2. DDP_TRANSPORT env var
    if (process.env.DDP_TRANSPORT) {
        return process.env.DDP_TRANSPORT;
    }
    // 3. Backward compat: DISABLE_SOCKJS=1 → uws
    if (process.env.DISABLE_SOCKJS) {
        return 'uws';
    }
    // 4. Default
    return 'sockjs';
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"stream_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/stream_server.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {let once;module.link('lodash.once',{default(v){once=v}},0);let zlib;module.link('node:zlib',{default(v){zlib=v}},1);let getTransport;module.link('./transports/index.js',{getTransport(v){getTransport=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _define_property(obj, key, value) {
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



// By default, we use the permessage-deflate extension with default
// configuration. If $SERVER_WEBSOCKET_COMPRESSION is set, then it must be valid
// JSON. If it represents a falsey value, then we do not use permessage-deflate
// at all; otherwise, the JSON value is used as an argument to deflate's
// configure method; see
// https://github.com/faye/permessage-deflate-node/blob/master/README.md
//
// (We do this in an _.once instead of at startup, because we don't want to
// crash the tool during isopacket load if your JSON doesn't parse. This is only
// a problem because the tool has to load the DDP server code just in order to
// be a DDP client; see https://github.com/meteor/meteor/issues/3452 .)
var websocketExtensions = once(function() {
    var extensions = [];
    var websocketCompressionConfig = process.env.SERVER_WEBSOCKET_COMPRESSION ? JSON.parse(process.env.SERVER_WEBSOCKET_COMPRESSION) : {};
    if (websocketCompressionConfig) {
        extensions.push(Npm.require('permessage-deflate2').configure(_object_spread({
            threshold: 1024,
            level: zlib.constants.Z_BEST_SPEED,
            memLevel: zlib.constants.Z_MIN_MEMLEVEL,
            noContextTakeover: true,
            maxWindowBits: zlib.constants.Z_MIN_WINDOWBITS
        }, websocketCompressionConfig || {})));
    }
    return extensions;
});
var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "";
StreamServer = function() {
    var self = this;
    self.registration_callbacks = [];
    self.open_sockets = [];
    // Resolve and set up the configured transport.
    var transport = getTransport();
    var emitter = transport.setup(WebApp.httpServer, pathPrefix, {
        websocketExtensions: websocketExtensions
    });
    emitter.on('connection', function(socket) {
        self._onConnection(socket);
    });
};
Object.assign(StreamServer.prototype, {
    // Shared connection handler used by all transports.
    _onConnection (socket) {
        var self = this;
        // sockjs sometimes passes us null instead of a socket object
        // so we need to guard against that. see:
        // https://github.com/sockjs/sockjs-node/issues/121
        // https://github.com/meteor/meteor/issues/10468
        if (!socket) return;
        // We want to make sure that if a client connects to us and does the initial
        // Websocket handshake but never gets to the DDP handshake, that we
        // eventually kill the socket.  Once the DDP handshake happens, DDP
        // heartbeating will work. And before the Websocket handshake, the timeouts
        // we set at the server level in webapp_server.js will work. But
        // WebSocket libraries call setTimeout(0) on any socket they take over,
        // so there is an "in between" state where this doesn't happen.  We work
        // around this by explicitly setting the socket timeout to a relatively
        // large time here, and setting it back to zero when we set up the
        // heartbeat in livedata_server.js.
        if (!socket.setWebsocketTimeout) {
            socket.setWebsocketTimeout = function(timeout) {
                if ((socket.protocol === 'websocket' || socket.protocol === 'websocket-raw') && socket._session.recv) {
                    socket._session.recv.connection.setTimeout(timeout);
                }
            };
        }
        socket.setWebsocketTimeout(45 * 1000);
        if (!socket.send) {
            socket.send = function(data) {
                socket.write(data);
            };
        }
        socket.on('close', function() {
            self.open_sockets = self.open_sockets.filter(function(value) {
                return value !== socket;
            });
        });
        self.open_sockets.push(socket);
        // only to send a message after connection on tests, useful for
        // socket-stream-client/server-tests.js
        if (process.env.TEST_METADATA && process.env.TEST_METADATA !== "{}") {
            socket.send(JSON.stringify({
                testMessageOnConnect: true
            }));
        }
        // call all our callbacks when we get a new socket. they will do the
        // work of setting up handlers and such for specific messages.
        self.registration_callbacks.forEach(function(callback) {
            callback(socket);
        });
    },
    // call my callback when a new socket connects.
    // also call it for all current connections.
    register: function(callback) {
        var self = this;
        self.registration_callbacks.push(callback);
        self.all_sockets().forEach(function(socket) {
            callback(socket);
        });
    },
    // get a list of all sockets
    all_sockets: function() {
        var self = this;
        return Object.values(self.open_sockets);
    }
});
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"livedata_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/livedata_server.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},0);let isObject;module.link('lodash.isobject',{default(v){isObject=v}},1);let isString;module.link('lodash.isstring',{default(v){isString=v}},2);let SessionCollectionView;module.link('./session_collection_view',{SessionCollectionView(v){SessionCollectionView=v}},3);let SessionDocumentView;module.link('./session_document_view',{SessionDocumentView(v){SessionDocumentView=v}},4);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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





DDPServer = {};
// Publication strategies define how we handle data from published cursors at the collection level
// This allows someone to:
// - Choose a trade-off between client-server bandwidth and server memory usage
// - Implement special (non-mongo) collections like volatile message queues
const publicationStrategies = {
    // SERVER_MERGE is the default strategy.
    // When using this strategy, the server maintains a copy of all data a connection is subscribed to.
    // This allows us to only send deltas over multiple publications.
    SERVER_MERGE: {
        useDummyDocumentView: false,
        useCollectionView: true,
        doAccountingForCollection: true
    },
    // The NO_MERGE_NO_HISTORY strategy results in the server sending all publication data
    // directly to the client. It does not remember what it has previously sent
    // to it will not trigger removed messages when a subscription is stopped.
    // This should only be chosen for special use cases like send-and-forget queues.
    NO_MERGE_NO_HISTORY: {
        useDummyDocumentView: false,
        useCollectionView: false,
        doAccountingForCollection: false
    },
    // NO_MERGE is similar to NO_MERGE_NO_HISTORY but the server will remember the IDs it has
    // sent to the client so it can remove them when a subscription is stopped.
    // This strategy can be used when a collection is only used in a single publication.
    NO_MERGE: {
        useDummyDocumentView: false,
        useCollectionView: false,
        doAccountingForCollection: true
    },
    // NO_MERGE_MULTI is similar to `NO_MERGE`, but it does track whether a document is
    // used by multiple publications. This has some memory overhead, but it still does not do
    // diffing so it's faster and slimmer than SERVER_MERGE.
    NO_MERGE_MULTI: {
        useDummyDocumentView: true,
        useCollectionView: true,
        doAccountingForCollection: true
    }
};
DDPServer.publicationStrategies = publicationStrategies;
// This file contains classes:
// * Session - The server's connection to a single DDP client
// * Subscription - A single subscription for a single client
// * Server - An entire server that may talk to > 1 client. A DDP endpoint.
//
// Session and Subscription are file scope. For now, until we freeze
// the interface, Server is package scope (in the future it should be
// exported).
DDPServer._SessionDocumentView = SessionDocumentView;
DDPServer._getCurrentFence = function() {
    let currentInvocation = this._CurrentWriteFence.get();
    if (currentInvocation) {
        return currentInvocation;
    }
    currentInvocation = DDP._CurrentMethodInvocation.get();
    return currentInvocation ? currentInvocation.fence : undefined;
};
DDPServer._SessionCollectionView = SessionCollectionView;
/******************************************************************************/ /* Session                                                                    */ /******************************************************************************/ var Session = function(server, version, socket, options) {
    var self = this;
    self.id = Random.id();
    // how many messages we've actually sent (not queued to send) excluding ping/pong
    // we'll use this to detect mismatch of data on reconnect.
    self.sentCount = 0;
    self.server = server;
    self.version = version;
    self.initialized = false;
    self.socket = socket;
    self.options = options;
    // Set to null when the session is destroyed. Multiple places below
    // use this to determine if the session is alive or not.
    self.inQueue = new Meteor._DoubleEndedQueue();
    self.blocked = false;
    self.workerRunning = false;
    self.cachedUnblock = null;
    // Sub objects for active subscriptions
    self._namedSubs = new Map();
    self._universalSubs = [];
    self.userId = null;
    self.collectionViews = new Map();
    // Set this to false to not send messages when collectionViews are
    // modified. This is done when rerunning subs in _setUserId and those messages
    // are calculated via a diff instead.
    self._isSending = true;
    // If this is true, don't start a newly-created universal publisher on this
    // session. The session will take care of starting it when appropriate.
    self._dontStartNewUniversalSubs = false;
    // When we are rerunning subscriptions, any ready messages
    // we want to buffer up for when we are done rerunning subscriptions
    self._pendingReady = [];
    // List of callbacks to call when this connection is closed.
    self._closeCallbacks = [];
    // XXX HACK: If a sockjs connection, save off the URL. This is
    // temporary and will go away in the near future.
    self._socketUrl = socket.url;
    // Allow tests to disable responding to pings.
    self._respondToPings = options.respondToPings;
    // This object is the public interface to the session. In the public
    // API, it is called the `connection` object.  Internally we call it
    // a `connectionHandle` to avoid ambiguity.
    self.connectionHandle = {
        id: self.id,
        close: function() {
            // Server-initiated close should not be resumable
            self._expectingDisconnect = true;
            self.close();
        },
        onClose: function(fn) {
            var cb = Meteor.bindEnvironment(fn, "connection onClose callback");
            if (self.inQueue) {
                self._closeCallbacks.push(cb);
            } else {
                // if we're already closed, call the callback.
                Meteor.defer(cb);
            }
        },
        clientAddress: self._clientAddress(),
        httpHeaders: self.socket.headers
    };
    self.send({
        msg: 'connected',
        session: self.id
    });
    // On initial connect, spin up all the universal publishers.
    self.startUniversalSubs();
    if (version !== 'pre1' && options.heartbeatInterval !== 0) {
        // We no longer need the low level timeout because we have heartbeats.
        socket.setWebsocketTimeout(0);
        self.heartbeat = new DDPCommon.Heartbeat({
            heartbeatInterval: options.heartbeatInterval,
            heartbeatTimeout: options.heartbeatTimeout,
            onTimeout: function() {
                self.close();
            },
            sendPing: function() {
                self.send({
                    msg: 'ping'
                });
            }
        });
        self.heartbeat.start();
    }
    Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "sessions", 1);
};
const ignoredMsgsForSessionOutOfDateCheck = [
    'ping',
    'pong'
];
Object.assign(Session.prototype, {
    sendReady: function(subscriptionIds) {
        var self = this;
        if (self._isSending) {
            self.send({
                msg: "ready",
                subs: subscriptionIds
            });
        } else {
            subscriptionIds.forEach(function(subscriptionId) {
                self._pendingReady.push(subscriptionId);
            });
        }
    },
    _canSend (collectionName) {
        return this._isSending || !this.server.getPublicationStrategy(collectionName).useCollectionView;
    },
    sendAdded (collectionName, id, fields) {
        if (this._canSend(collectionName)) {
            this.send({
                msg: 'added',
                collection: collectionName,
                id,
                fields
            });
        }
    },
    sendChanged (collectionName, id, fields) {
        if (isEmpty(fields)) return;
        if (this._canSend(collectionName)) {
            this.send({
                msg: "changed",
                collection: collectionName,
                id,
                fields
            });
        }
    },
    sendRemoved (collectionName, id) {
        if (this._canSend(collectionName)) {
            this.send({
                msg: "removed",
                collection: collectionName,
                id
            });
        }
    },
    getSendCallbacks: function() {
        var self = this;
        return {
            added: self.sendAdded.bind(self),
            changed: self.sendChanged.bind(self),
            removed: self.sendRemoved.bind(self)
        };
    },
    getCollectionView: function(collectionName) {
        var self = this;
        var ret = self.collectionViews.get(collectionName);
        if (!ret) {
            ret = new SessionCollectionView(collectionName, self.getSendCallbacks());
            self.collectionViews.set(collectionName, ret);
        }
        return ret;
    },
    added (subscriptionHandle, collectionName, id, fields) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
            const view = this.getCollectionView(collectionName);
            view.added(subscriptionHandle, id, fields);
        } else {
            this.sendAdded(collectionName, id, fields);
        }
    },
    removed (subscriptionHandle, collectionName, id) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
            const view = this.getCollectionView(collectionName);
            view.removed(subscriptionHandle, id);
            if (view.isEmpty()) {
                this.collectionViews.delete(collectionName);
            }
        } else {
            this.sendRemoved(collectionName, id);
        }
    },
    changed (subscriptionHandle, collectionName, id, fields) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
            const view = this.getCollectionView(collectionName);
            view.changed(subscriptionHandle, id, fields);
        } else {
            this.sendChanged(collectionName, id, fields);
        }
    },
    startUniversalSubs: function() {
        const self = this;
        // Make a shallow copy of the set of universal handlers and start them. If
        // additional universal publishers start while we're running them (due to
        // yielding), they will run separately as part of Server.publish.
        for (const handler of [
            ...self.server.universal_publish_handlers
        ]){
            self._startSubscription(handler);
        }
    },
    // Stop heartbeat if running
    _stopHeartbeat: function() {
        if (this.heartbeat) {
            this.heartbeat.stop();
            this.heartbeat = null;
        }
    },
    // Destroy this session and unregister it at the server.
    close: function() {
        const self = this;
        // Destroy this session, even if it's not registered at the
        // server. Stop all processing and tear everything down. If a socket
        // was attached, close it.
        // Already closing or closed - prevent multiple close() calls
        if (self._isClosing) {
            return;
        }
        self._isClosing = true;
        if (self._removeTimeoutHandle) {
            Meteor.clearTimeout(self._removeTimeoutHandle);
            self._removeTimeoutHandle = null;
        }
        if (self.socket) {
            if (!self.socket.isClosed) {
                self.socket.close();
            }
            self.socket._meteorSession = null;
            self.socket = null;
        }
        // Stop heartbeat immediately - we don't need it during the grace period
        // since we have no socket to send pings on anyway.
        self._stopHeartbeat();
        self.server._removeSession(self, ()=>{
            Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "sessions", -1);
            self.inQueue = null;
            self.collectionViews = new Map();
            self._stopHeartbeat();
            Meteor.defer(function() {
                // stop callbacks can yield, so we defer this on close.
                // sub._isDeactivated() detects that we set inQueue to null and
                // treats it as semi-deactivated (it will ignore incoming callbacks, etc).
                self._deactivateAllSubscriptions();
                // Defer calling the close callbacks, so that the caller closing
                // the session isn't waiting for all the callbacks to complete.
                self._closeCallbacks.forEach((callback)=>{
                    callback();
                });
            });
        });
    },
    // Send a message (doing nothing if no socket is connected right now).
    // It should be a JSON object (it will be stringified).
    send: function(msg) {
        const self = this;
        const isIgnoredMsg = ignoredMsgsForSessionOutOfDateCheck.includes(msg.msg);
        if (self.messageQueue && !isIgnoredMsg) {
            self.messageQueue.push(msg);
            if (self.messageQueue.length > self.options.maxMessageQueueLength) {
                Meteor.clearTimeout(self._removeTimeoutHandle);
                self._pendingRemoveFunction();
            }
            return;
        }
        if (self.socket) {
            const stringMsg = DDPCommon.stringifyDDP(msg);
            if (Meteor._printSentDDP) Meteor._debug("Sent DDP", stringMsg);
            if (!isIgnoredMsg) {
                self.sentCount++;
            }
            self.socket.send(stringMsg);
        }
    },
    // Send a connection error.
    sendError: function(reason, offendingMessage) {
        const self = this;
        const msg = {
            msg: 'error',
            reason: reason
        };
        if (offendingMessage) msg.offendingMessage = offendingMessage;
        self.send(msg);
    },
    // Process 'msg' as an incoming message. As a guard against
    // race conditions during reconnection, ignore the message if
    // 'socket' is not the currently connected socket.
    //
    // We run the messages from the client one at a time, in the order
    // given by the client. The message handler is passed an idempotent
    // function 'unblock' which it may call to allow other messages to
    // begin running in parallel in another fiber (for example, a method
    // that wants to yield). Otherwise, it is automatically unblocked
    // when it returns.
    //
    // Actually, we don't have to 'totally order' the messages in this
    // way, but it's the easiest thing that's correct. (unsub needs to
    // be ordered against sub, methods need to be ordered against each
    // other).
    processMessage: function(msg_in) {
        var self = this;
        if (!self.inQueue) return;
        // Respond to ping and pong messages immediately without queuing.
        // If the negotiated DDP version is "pre1" which didn't support
        // pings, preserve the "pre1" behavior of responding with a "bad
        // request" for the unknown messages.
        //
        // Fibers are needed because heartbeats use Meteor.setTimeout, which
        // needs a Fiber. We could actually use regular setTimeout and avoid
        // these new fibers, but it is easier to just make everything use
        // Meteor.setTimeout and not think too hard.
        //
        // Any message counts as receiving a pong, as it demonstrates that
        // the client is still alive.
        if (self.heartbeat) {
            self.heartbeat.messageReceived();
        }
        if (self.version !== 'pre1' && msg_in.msg === 'ping') {
            if (self._respondToPings) self.send({
                msg: "pong",
                id: msg_in.id
            });
            return;
        }
        if (self.version !== 'pre1' && msg_in.msg === 'pong') {
            // Since everything is a pong, there is nothing to do
            return;
        }
        if (msg_in.msg === 'disconnect') {
            // Pre-empt the queue - a disconnect is imminent.
            return self.protocol_handlers.disconnect.call(self, msg_in, ()=>{});
        }
        self.inQueue.push(msg_in);
        if (self.workerRunning) return;
        self.workerRunning = true;
        var processNext = function() {
            var msg = self.inQueue && self.inQueue.shift();
            if (!msg) {
                self.workerRunning = false;
                return;
            }
            function runHandlers() {
                var blocked = true;
                var unblock = function() {
                    if (!blocked) return; // idempotent
                    blocked = false;
                    setImmediate(processNext);
                };
                self.server.onMessageHook.each(function(callback) {
                    callback(msg, self);
                    return true;
                });
                if (msg.msg in self.protocol_handlers) {
                    const result = self.protocol_handlers[msg.msg].call(self, msg, unblock);
                    if (Meteor._isPromise(result)) {
                        result.finally(()=>unblock());
                    } else {
                        unblock();
                    }
                } else {
                    self.sendError('Bad request', msg);
                    unblock(); // in case the handler didn't already do it
                }
            }
            runHandlers();
        };
        processNext();
    },
    protocol_handlers: {
        disconnect: function(msg) {
            this._expectingDisconnect = true;
        },
        sub: function(msg, unblock) {
            return _async_to_generator(function*() {
                var self = this;
                // cacheUnblock temporarly, so we can capture it later
                // we will use unblock in current eventLoop, so this is safe
                self.cachedUnblock = unblock;
                // reject malformed messages
                if (typeof msg.id !== "string" || typeof msg.name !== "string" || 'params' in msg && !(msg.params instanceof Array)) {
                    self.sendError("Malformed subscription", msg);
                    return;
                }
                if (!self.server.publish_handlers[msg.name]) {
                    self.send({
                        msg: 'nosub',
                        id: msg.id,
                        error: new Meteor.Error(404, `Subscription '${msg.name}' not found`)
                    });
                    return;
                }
                if (self._namedSubs.has(msg.id)) // subs are idempotent, or rather, they are ignored if a sub
                // with that id already exists. this is important during
                // reconnect.
                return;
                // XXX It'd be much better if we had generic hooks where any package can
                // hook into subscription handling, but in the mean while we special case
                // ddp-rate-limiter package. This is also done for weak requirements to
                // add the ddp-rate-limiter package in case we don't have Accounts. A
                // user trying to use the ddp-rate-limiter must explicitly require it.
                if (Package['ddp-rate-limiter']) {
                    var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
                    var rateLimiterInput = {
                        userId: self.userId,
                        clientAddress: self.connectionHandle.clientAddress,
                        type: "subscription",
                        name: msg.name,
                        connectionId: self.id
                    };
                    const rules = yield DDPRateLimiter.findAllMatchingRulesAsync(rateLimiterInput);
                    DDPRateLimiter._incrementRules(rules, rateLimiterInput);
                    const rateLimitResult = DDPRateLimiter._checkRules(rules, rateLimiterInput);
                    if (!rateLimitResult.allowed) {
                        self.send({
                            msg: 'nosub',
                            id: msg.id,
                            error: new Meteor.Error('too-many-requests', DDPRateLimiter.getErrorMessage(rateLimitResult), {
                                timeToReset: rateLimitResult.timeToReset
                            })
                        });
                        return;
                    }
                }
                var handler = self.server.publish_handlers[msg.name];
                yield self._startSubscription(handler, msg.id, msg.params, msg.name);
                // cleaning cached unblock
                self.cachedUnblock = null;
            }).call(this);
        },
        unsub: function(msg) {
            var self = this;
            self._stopSubscription(msg.id);
        },
        method: function(msg, unblock) {
            return _async_to_generator(function*() {
                var self = this;
                // Reject malformed messages.
                // For now, we silently ignore unknown attributes,
                // for forwards compatibility.
                if (typeof msg.id !== "string" || typeof msg.method !== "string" || 'params' in msg && !(msg.params instanceof Array) || 'randomSeed' in msg && typeof msg.randomSeed !== "string") {
                    self.sendError("Malformed method invocation", msg);
                    return;
                }
                var randomSeed = msg.randomSeed || null;
                // Set up to mark the method as satisfied once all observers
                // (and subscriptions) have reacted to any writes that were
                // done.
                var fence = new DDPServer._WriteFence;
                fence.onAllCommitted(function() {
                    // Retire the fence so that future writes are allowed.
                    // This means that callbacks like timers are free to use
                    // the fence, and if they fire before it's armed (for
                    // example, because the method waits for them) their
                    // writes will be included in the fence.
                    fence.retire();
                    self.send({
                        msg: 'updated',
                        methods: [
                            msg.id
                        ]
                    });
                });
                // Find the handler
                var handler = self.server.method_handlers[msg.method];
                if (!handler) {
                    self.send({
                        msg: 'result',
                        id: msg.id,
                        error: new Meteor.Error(404, `Method '${msg.method}' not found`)
                    });
                    yield fence.arm();
                    return;
                }
                var invocation = new DDPCommon.MethodInvocation({
                    name: msg.method,
                    isSimulation: false,
                    userId: self.userId,
                    setUserId (userId) {
                        return self._setUserId(userId);
                    },
                    unblock: unblock,
                    connection: self.connectionHandle,
                    randomSeed: randomSeed,
                    fence
                });
                function finish() {
                    return _async_to_generator(function*() {
                        yield fence.arm();
                        unblock();
                    })();
                }
                const payload = {
                    msg: "result",
                    id: msg.id
                };
                try {
                    // XXX It'd be better if we could hook into method handlers better but
                    // for now, we need to check if the ddp-rate-limiter exists since we
                    // have a weak requirement for the ddp-rate-limiter package to be added
                    // to our application.
                    if (Package['ddp-rate-limiter']) {
                        const DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
                        var rateLimiterInput = {
                            userId: self.userId,
                            clientAddress: self.connectionHandle.clientAddress,
                            type: "method",
                            name: msg.method,
                            connectionId: self.id
                        };
                        const rules = yield DDPRateLimiter.findAllMatchingRulesAsync(rateLimiterInput);
                        DDPRateLimiter._incrementRules(rules, rateLimiterInput);
                        const rateLimitResult = DDPRateLimiter._checkRules(rules, rateLimiterInput);
                        if (!rateLimitResult.allowed) {
                            throw new Meteor.Error("too-many-requests", DDPRateLimiter.getErrorMessage(rateLimitResult), {
                                timeToReset: rateLimitResult.timeToReset
                            });
                        }
                    }
                    const result = yield DDPServer._CurrentWriteFence.withValue(fence, ()=>DDP._CurrentMethodInvocation.withValue(invocation, ()=>maybeAuditArgumentChecks(handler, invocation, msg.params, "call to '" + msg.method + "'")));
                    yield finish();
                    if (result !== undefined) {
                        payload.result = result;
                    }
                    self.send(payload);
                } catch (exception) {
                    yield finish();
                    payload.error = wrapInternalException(exception, `while invoking method '${msg.method}'`);
                    self.send(payload);
                }
                ;
            }).call(this);
        }
    },
    _eachSub: function(f) {
        var self = this;
        self._namedSubs.forEach(f);
        self._universalSubs.forEach(f);
    },
    _diffCollectionViews: function(beforeCVs) {
        var self = this;
        DiffSequence.diffMaps(beforeCVs, self.collectionViews, {
            both: function(collectionName, leftValue, rightValue) {
                rightValue.diff(leftValue);
            },
            rightOnly: function(collectionName, rightValue) {
                rightValue.documents.forEach(function(docView, id) {
                    self.sendAdded(collectionName, id, docView.getFields());
                });
            },
            leftOnly: function(collectionName, leftValue) {
                leftValue.documents.forEach(function(doc, id) {
                    self.sendRemoved(collectionName, id);
                });
            }
        });
    },
    // Sets the current user id in all appropriate contexts and reruns
    // all subscriptions
    _setUserId (userId) {
        return _async_to_generator(function*() {
            var self = this;
            if (userId !== null && typeof userId !== "string") throw new Error("setUserId must be called on string or null, not " + typeof userId);
            // Prevent newly-created universal subscriptions from being added to our
            // session. They will be found below when we call startUniversalSubs.
            //
            // (We don't have to worry about named subscriptions, because we only add
            // them when we process a 'sub' message. We are currently processing a
            // 'method' message, and the method did not unblock, because it is illegal
            // to call setUserId after unblock. Thus we cannot be concurrently adding a
            // new named subscription).
            self._dontStartNewUniversalSubs = true;
            // Prevent current subs from updating our collectionViews and call their
            // stop callbacks. This may yield.
            self._eachSub(function(sub) {
                sub._deactivate();
            });
            // All subs should now be deactivated. Stop sending messages to the client,
            // save the state of the published collections, reset to an empty view, and
            // update the userId.
            self._isSending = false;
            var beforeCVs = self.collectionViews;
            self.collectionViews = new Map();
            self.userId = userId;
            // _setUserId is normally called from a Meteor method with
            // DDP._CurrentMethodInvocation set. But DDP._CurrentMethodInvocation is not
            // expected to be set inside a publish function, so we temporary unset it.
            // Inside a publish function DDP._CurrentPublicationInvocation is set.
            yield DDP._CurrentMethodInvocation.withValue(undefined, function() {
                return _async_to_generator(function*() {
                    // Save the old named subs, and reset to having no subscriptions.
                    var oldNamedSubs = self._namedSubs;
                    self._namedSubs = new Map();
                    self._universalSubs = [];
                    yield Promise.all([
                        ...oldNamedSubs
                    ].map(([subscriptionId, sub])=>_async_to_generator(function*() {
                            const newSub = sub._recreate();
                            self._namedSubs.set(subscriptionId, newSub);
                            // nb: if the handler throws or calls this.error(), it will in fact
                            // immediately send its 'nosub'. This is OK, though.
                            yield newSub._runHandler();
                        })()));
                    // Allow newly-created universal subs to be started on our connection in
                    // parallel with the ones we're spinning up here, and spin up universal
                    // subs.
                    self._dontStartNewUniversalSubs = false;
                    self.startUniversalSubs();
                })();
            }, {
                name: '_setUserId'
            });
            // Start sending messages again, beginning with the diff from the previous
            // state of the world to the current state. No yields are allowed during
            // this diff, so that other changes cannot interleave.
            Meteor._noYieldsAllowed(function() {
                self._isSending = true;
                self._diffCollectionViews(beforeCVs);
                if (!isEmpty(self._pendingReady)) {
                    self.sendReady(self._pendingReady);
                    self._pendingReady = [];
                }
            });
        }).call(this);
    },
    _startSubscription: function(handler, subId, params, name) {
        var self = this;
        var sub = new Subscription(self, handler, subId, params, name);
        let unblockHander = self.cachedUnblock;
        // _startSubscription may call from a lot places
        // so cachedUnblock might be null in somecases
        // assign the cachedUnblock
        sub.unblock = unblockHander || (()=>{});
        if (subId) self._namedSubs.set(subId, sub);
        else self._universalSubs.push(sub);
        return sub._runHandler();
    },
    // Tear down specified subscription
    _stopSubscription: function(subId, error) {
        var self = this;
        var subName = null;
        if (subId) {
            var maybeSub = self._namedSubs.get(subId);
            if (maybeSub) {
                subName = maybeSub._name;
                maybeSub._removeAllDocuments();
                maybeSub._deactivate();
                self._namedSubs.delete(subId);
            }
        }
        var response = {
            msg: 'nosub',
            id: subId
        };
        if (error) {
            response.error = wrapInternalException(error, subName ? "from sub " + subName + " id " + subId : "from sub id " + subId);
        }
        self.send(response);
    },
    // Tear down all subscriptions. Note that this does NOT send removed or nosub
    // messages, since we assume the client is gone.
    _deactivateAllSubscriptions: function() {
        var self = this;
        self._namedSubs.forEach(function(sub, id) {
            sub._deactivate();
        });
        self._namedSubs = new Map();
        self._universalSubs.forEach(function(sub) {
            sub._deactivate();
        });
        self._universalSubs = [];
    },
    // Determine the remote client's IP address, based on the
    // HTTP_FORWARDED_COUNT environment variable representing how many
    // proxies the server is behind.
    _clientAddress: function() {
        var self = this;
        // For the reported client address for a connection to be correct,
        // the developer must set the HTTP_FORWARDED_COUNT environment
        // variable to an integer representing the number of hops they
        // expect in the `x-forwarded-for` header. E.g., set to "1" if the
        // server is behind one proxy.
        //
        // This could be computed once at startup instead of every time.
        var httpForwardedCount = parseInt(process.env['HTTP_FORWARDED_COUNT']) || 0;
        if (httpForwardedCount === 0) return self.socket.remoteAddress;
        var forwardedFor = self.socket.headers["x-forwarded-for"];
        if (!isString(forwardedFor)) return null;
        forwardedFor = forwardedFor.split(',');
        // Typically the first value in the `x-forwarded-for` header is
        // the original IP address of the client connecting to the first
        // proxy.  However, the end user can easily spoof the header, in
        // which case the first value(s) will be the fake IP address from
        // the user pretending to be a proxy reporting the original IP
        // address value.  By counting HTTP_FORWARDED_COUNT back from the
        // end of the list, we ensure that we get the IP address being
        // reported by *our* first proxy.
        if (httpForwardedCount < 0 || httpForwardedCount !== forwardedFor.length) return null;
        forwardedFor = forwardedFor.map((ip)=>ip.trim());
        return forwardedFor[forwardedFor.length - httpForwardedCount];
    }
});
/******************************************************************************/ /* Subscription                                                               */ /******************************************************************************/ // Ctor for a sub handle: the input to each publish function
// Instance name is this because it's usually referred to as this inside a
// publish
/**
 * @summary The server's side of a subscription
 * @class Subscription
 * @instanceName this
 * @showInstanceName true
 */ var Subscription = function(session, handler, subscriptionId, params, name) {
    var self = this;
    self._session = session; // type is Session
    /**
   * @summary Access inside the publish function. The incoming [connection](#meteor_onconnection) for this subscription.
   * @locus Server
   * @name  connection
   * @memberOf Subscription
   * @instance
   */ self.connection = session.connectionHandle; // public API object
    self._handler = handler;
    // My subscription ID (generated by client, undefined for universal subs).
    self._subscriptionId = subscriptionId;
    // Undefined for universal subs
    self._name = name;
    self._params = params || [];
    // Only named subscriptions have IDs, but we need some sort of string
    // internally to keep track of all subscriptions inside
    // SessionDocumentViews. We use this subscriptionHandle for that.
    if (self._subscriptionId) {
        self._subscriptionHandle = 'N' + self._subscriptionId;
    } else {
        self._subscriptionHandle = 'U' + Random.id();
    }
    // Has _deactivate been called?
    self._deactivated = false;
    // Stop callbacks to g/c this sub.  called w/ zero arguments.
    self._stopCallbacks = [];
    // The set of (collection, documentid) that this subscription has
    // an opinion about.
    self._documents = new Map();
    // Remember if we are ready.
    self._ready = false;
    // Part of the public API: the user of this sub.
    /**
   * @summary Access inside the publish function. The id of the logged-in user, or `null` if no user is logged in.
   * @locus Server
   * @memberOf Subscription
   * @name  userId
   * @instance
   */ self.userId = session.userId;
    // For now, the id filter is going to default to
    // the to/from DDP methods on MongoID, to
    // specifically deal with mongo/minimongo ObjectIds.
    // Later, you will be able to make this be "raw"
    // if you want to publish a collection that you know
    // just has strings for keys and no funny business, to
    // a DDP consumer that isn't minimongo.
    self._idFilter = {
        idStringify: MongoID.idStringify,
        idParse: MongoID.idParse
    };
    Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "subscriptions", 1);
};
Object.assign(Subscription.prototype, {
    _runHandler: function() {
        return _async_to_generator(function*() {
            // XXX should we unblock() here? Either before running the publish
            // function, or before running _publishCursor.
            //
            // Right now, each publish function blocks all future publishes and
            // methods waiting on data from Mongo (or whatever else the function
            // blocks on). This probably slows page load in common cases.
            if (!this.unblock) {
                this.unblock = ()=>{};
            }
            const self = this;
            let resultOrThenable = null;
            try {
                resultOrThenable = DDP._CurrentPublicationInvocation.withValue(self, ()=>maybeAuditArgumentChecks(self._handler, self, EJSON.clone(self._params), // It's OK that this would look weird for universal subscriptions,
                    // because they have no arguments so there can never be an
                    // audit-argument-checks failure.
                    "publisher '" + self._name + "'"), {
                    name: self._name
                });
            } catch (e) {
                self.error(e);
                return;
            }
            // Did the handler call this.error or this.stop?
            if (self._isDeactivated()) return;
            // Both conventional and async publish handler functions are supported.
            // If an object is returned with a then() function, it is either a promise
            // or thenable and will be resolved asynchronously.
            const isThenable = resultOrThenable && typeof resultOrThenable.then === 'function';
            if (isThenable) {
                try {
                    yield self._publishHandlerResult((yield resultOrThenable));
                } catch (e) {
                    self.error(e);
                }
            } else {
                yield self._publishHandlerResult(resultOrThenable);
            }
        }).call(this);
    },
    _publishHandlerResult (res) {
        return _async_to_generator(function*() {
            // SPECIAL CASE: Instead of writing their own callbacks that invoke
            // this.added/changed/ready/etc, the user can just return a collection
            // cursor or array of cursors from the publish function; we call their
            // _publishCursor method which starts observing the cursor and publishes the
            // results. Note that _publishCursor does NOT call ready().
            //
            // XXX This uses an undocumented interface which only the Mongo cursor
            // interface publishes. Should we make this interface public and encourage
            // users to implement it themselves? Arguably, it's unnecessary; users can
            // already write their own functions like
            //   var publishMyReactiveThingy = function (name, handler) {
            //     Meteor.publish(name, function () {
            //       var reactiveThingy = handler();
            //       reactiveThingy.publishMe();
            //     });
            //   };
            var self = this;
            var isCursor = function(c) {
                return c && c._publishCursor;
            };
            if (isCursor(res)) {
                try {
                    yield res._publishCursor(self);
                } catch (e) {
                    self.error(e);
                    return;
                }
                // _publishCursor only returns after the initial added callbacks have run.
                // mark subscription as ready.
                self.ready();
            } else if (Array.isArray(res)) {
                // Check all the elements are cursors
                if (!res.every(isCursor)) {
                    self.error(new Error("Publish function returned an array of non-Cursors"));
                    return;
                }
                // Find duplicate collection names
                // XXX we should support overlapping cursors, but that would require the
                // merge box to allow overlap within a subscription
                var collectionNames = {};
                for(var i = 0; i < res.length; ++i){
                    var collectionName = res[i]._getCollectionName();
                    if (collectionNames[collectionName]) {
                        self.error(new Error("Publish function returned multiple cursors for collection " + collectionName));
                        return;
                    }
                    collectionNames[collectionName] = true;
                }
                try {
                    yield Promise.all(res.map((cur)=>cur._publishCursor(self)));
                } catch (e) {
                    self.error(e);
                    return;
                }
                self.ready();
            } else if (res) {
                // Truthy values other than cursors or arrays are probably a
                // user mistake (possible returning a Mongo document via, say,
                // `coll.findOne()`).
                self.error(new Error("Publish function can only return a Cursor or " + "an array of Cursors"));
            }
        }).call(this);
    },
    // This calls all stop callbacks and prevents the handler from updating any
    // SessionCollectionViews further. It's used when the user unsubscribes or
    // disconnects, as well as during setUserId re-runs. It does *NOT* send
    // removed messages for the published objects; if that is necessary, call
    // _removeAllDocuments first.
    _deactivate: function() {
        if (this._deactivated) return;
        this._deactivated = true;
        this._callStopCallbacks().then(()=>{
            // Break reference chains to allow GC of the Session and its data.
            // Without this, deactivated subscriptions retain live references
            // to the (now-closed) session indefinitely.
            this._session = null;
            this._documents = new Map();
        });
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "subscriptions", -1);
    },
    _callStopCallbacks: function() {
        return _async_to_generator(function*() {
            // In Meteor 3, onStop callbacks can be async (e.g. observeHandle.stop()
            // returns a Promise). We must await each one so that observer teardown
            // completes before the subscription is considered fully deactivated.
            const callbacks = this._stopCallbacks;
            this._stopCallbacks = [];
            for (const callback of callbacks){
                try {
                    yield callback();
                } catch (e) {
                    Meteor._debug("Exception in onStop callback:", e);
                }
            }
        }).call(this);
    },
    // Send remove messages for every document.
    _removeAllDocuments: function() {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._documents.forEach(function(collectionDocs, collectionName) {
                collectionDocs.forEach(function(strId) {
                    self.removed(collectionName, self._idFilter.idParse(strId));
                });
            });
        });
    },
    // Returns a new Subscription for the same session with the same
    // initial creation parameters. This isn't a clone: it doesn't have
    // the same _documents cache, stopped state or callbacks; may have a
    // different _subscriptionHandle, and gets its userId from the
    // session, not from this object.
    _recreate: function() {
        var self = this;
        return new Subscription(self._session, self._handler, self._subscriptionId, self._params, self._name);
    },
    /**
   * @summary Call inside the publish function.  Stops this client's subscription, triggering a call on the client to the `onStop` callback passed to [`Meteor.subscribe`](#meteor_subscribe), if any. If `error` is not a [`Meteor.Error`](#meteor_error), it will be [sanitized](#meteor_error).
   * @locus Server
   * @param {Error} error The error to pass to the client.
   * @instance
   * @memberOf Subscription
   */ error: function(error) {
        var self = this;
        if (self._isDeactivated()) return;
        self._session._stopSubscription(self._subscriptionId, error);
    },
    // Note that while our DDP client will notice that you've called stop() on the
    // server (and clean up its _subscriptions table) we don't actually provide a
    // mechanism for an app to notice this (the subscribe onError callback only
    // triggers if there is an error).
    /**
   * @summary Call inside the publish function.  Stops this client's subscription and invokes the client's `onStop` callback with no error.
   * @locus Server
   * @instance
   * @memberOf Subscription
   */ stop: function() {
        var self = this;
        if (self._isDeactivated()) return;
        self._session._stopSubscription(self._subscriptionId);
    },
    /**
   * @summary Call inside the publish function.  Registers a callback function to run when the subscription is stopped.
   * @locus Server
   * @memberOf Subscription
   * @instance
   * @param {Function} func The callback function
   */ onStop: function(callback) {
        var self = this;
        callback = Meteor.bindEnvironment(callback, 'onStop callback', self);
        if (self._isDeactivated()) callback();
        else self._stopCallbacks.push(callback);
    },
    // This returns true if the sub has been deactivated, *OR* if the session was
    // destroyed but the deferred call to _deactivateAllSubscriptions hasn't
    // happened yet.
    _isDeactivated: function() {
        return this._deactivated || !this._session || this._session.inQueue === null;
    },
    /**
   * @summary Call inside the publish function.  Informs the subscriber that a document has been added to the record set.
   * @locus Server
   * @memberOf Subscription
   * @instance
   * @param {String} collection The name of the collection that contains the new document.
   * @param {String} id The new document's ID.
   * @param {Object} fields The fields in the new document.  If `_id` is present it is ignored.
   */ added (collectionName, id, fields) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        if (this._session.server.getPublicationStrategy(collectionName).doAccountingForCollection) {
            let ids = this._documents.get(collectionName);
            if (ids == null) {
                ids = new Set();
                this._documents.set(collectionName, ids);
            }
            ids.add(id);
        }
        this._session.added(this._subscriptionHandle, collectionName, id, fields);
    },
    /**
   * @summary Call inside the publish function.  Informs the subscriber that a document in the record set has been modified.
   * @locus Server
   * @memberOf Subscription
   * @instance
   * @param {String} collection The name of the collection that contains the changed document.
   * @param {String} id The changed document's ID.
   * @param {Object} fields The fields in the document that have changed, together with their new values.  If a field is not present in `fields` it was left unchanged; if it is present in `fields` and has a value of `undefined` it was removed from the document.  If `_id` is present it is ignored.
   */ changed (collectionName, id, fields) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        this._session.changed(this._subscriptionHandle, collectionName, id, fields);
    },
    /**
   * @summary Call inside the publish function.  Informs the subscriber that a document has been removed from the record set.
   * @locus Server
   * @memberOf Subscription
   * @instance
   * @param {String} collection The name of the collection that the document has been removed from.
   * @param {String} id The ID of the document that has been removed.
   */ removed (collectionName, id) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        if (this._session.server.getPublicationStrategy(collectionName).doAccountingForCollection) {
            // We don't bother to delete sets of things in a collection if the
            // collection is empty.  It could break _removeAllDocuments.
            this._documents.get(collectionName).delete(id);
        }
        this._session.removed(this._subscriptionHandle, collectionName, id);
    },
    /**
   * @summary Call inside the publish function.  Informs the subscriber that an initial, complete snapshot of the record set has been sent.  This will trigger a call on the client to the `onReady` callback passed to  [`Meteor.subscribe`](#meteor_subscribe), if any.
   * @locus Server
   * @memberOf Subscription
   * @instance
   */ ready: function() {
        var self = this;
        if (self._isDeactivated()) return;
        if (!self._subscriptionId) return; // Unnecessary but ignored for universal sub
        if (!self._ready) {
            self._session.sendReady([
                self._subscriptionId
            ]);
            self._ready = true;
        }
    }
});
/******************************************************************************/ /* Server                                                                     */ /******************************************************************************/ Server = function(options = {}) {
    var self = this;
    // The default heartbeat interval is 30 seconds on the server and 35
    // seconds on the client.  Since the client doesn't need to send a
    // ping as long as it is receiving pings, this means that pings
    // normally go from the server to the client.
    //
    // Note: Troposphere depends on the ability to mutate
    // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.
    self.options = _object_spread({
        heartbeatInterval: 15000,
        heartbeatTimeout: 15000,
        // For testing, allow responding to pings to be disabled.
        respondToPings: true,
        defaultPublicationStrategy: publicationStrategies.SERVER_MERGE,
        /**
     * @summary How many messages should we queue during a non-graceful disconnect before we destroy the session, to help prevent memory leaks.
     * @type {Number}
     * @locus Server
     */ maxMessageQueueLength: 100,
        /**
     * @summary How long we should maintain a session for after a non-graceful disconnect before killing it
     *          sessions that reconnect within this time will be resumed with minimal performance impact.
     * @type {Number}
     * @locus Server
     */ disconnectGracePeriod: 15000
    }, options);
    // Map of callbacks to call when a new connection comes in to the
    // server and completes DDP version negotiation. Use an object instead
    // of an array so we can safely remove one from the list while
    // iterating over it.
    self.onConnectionHook = new Hook({
        debugPrintExceptions: "onConnection callback"
    });
    // Map of callbacks to call when a new message comes in.
    self.onMessageHook = new Hook({
        debugPrintExceptions: "onMessage callback"
    });
    self.publish_handlers = {};
    self.universal_publish_handlers = [];
    self.method_handlers = {};
    self._publicationStrategies = {};
    self.sessions = new Map(); // map from id to session
    self.stream_server = new StreamServer();
    self.stream_server.register(function(socket) {
        // socket implements the SockJSConnection interface
        socket._meteorSession = null;
        var sendError = function(reason, offendingMessage) {
            var msg = {
                msg: 'error',
                reason: reason
            };
            if (offendingMessage) msg.offendingMessage = offendingMessage;
            socket.send(DDPCommon.stringifyDDP(msg));
        };
        socket.on('data', function(raw_msg) {
            if (Meteor._printReceivedDDP) {
                Meteor._debug("Received DDP", raw_msg);
            }
            try {
                try {
                    var msg = DDPCommon.parseDDP(raw_msg);
                } catch (err) {
                    sendError('Parse error');
                    return;
                }
                if (msg === null || !msg.msg) {
                    sendError('Bad request', msg);
                    return;
                }
                if (msg.msg === 'connect') {
                    if (socket._meteorSession) {
                        sendError("Already connected", msg);
                        return;
                    }
                    self._handleConnect(socket, msg);
                    return;
                }
                if (!socket._meteorSession) {
                    sendError('Must connect first', msg);
                    return;
                }
                socket._meteorSession.processMessage(msg);
            } catch (e) {
                // XXX print stack nicely
                Meteor._debug("Internal exception while processing message", msg, e);
            }
        });
        socket.on('close', function() {
            if (socket._meteorSession) {
                socket._meteorSession.close();
            }
        });
    });
};
Object.assign(Server.prototype, {
    /**
   * @summary Register a callback to be called when a new DDP connection is made to the server.
   * @locus Server
   * @param {function} callback The function to call when a new DDP connection is established.
   * @memberOf Meteor
   * @importFromPackage meteor
   */ onConnection: function(fn) {
        var self = this;
        return self.onConnectionHook.register(fn);
    },
    /**
   * @summary Set publication strategy for the given collection. Publications strategies are available from `DDPServer.publicationStrategies`. You call this method from `Meteor.server`, like `Meteor.server.setPublicationStrategy()`
   * @locus Server
   * @alias setPublicationStrategy
   * @param collectionName {String}
   * @param strategy {{useCollectionView: boolean, doAccountingForCollection: boolean}}
   * @memberOf Meteor.server
   * @importFromPackage meteor
   */ setPublicationStrategy (collectionName, strategy) {
        if (!Object.values(publicationStrategies).includes(strategy)) {
            throw new Error(`Invalid merge strategy: ${strategy} 
        for collection ${collectionName}`);
        }
        this._publicationStrategies[collectionName] = strategy;
    },
    /**
   * @summary Gets the publication strategy for the requested collection. You call this method from `Meteor.server`, like `Meteor.server.getPublicationStrategy()`
   * @locus Server
   * @alias getPublicationStrategy
   * @param collectionName {String}
   * @memberOf Meteor.server
   * @importFromPackage meteor
   * @return {{useCollectionView: boolean, doAccountingForCollection: boolean}}
   */ getPublicationStrategy (collectionName) {
        return this._publicationStrategies[collectionName] || this.options.defaultPublicationStrategy;
    },
    /**
   * @summary Register a callback to be called when a new DDP message is received.
   * @locus Server
   * @param {function} callback The function to call when a new DDP message is received.
   * @memberOf Meteor
   * @importFromPackage meteor
   */ onMessage: function(fn) {
        var self = this;
        return self.onMessageHook.register(fn);
    },
    _handleConnect: function(socket, msg) {
        var self = this;
        // The connect message must specify a version and an array of supported
        // versions, and it must claim to support what it is proposing.
        if (!(typeof msg.version === 'string' && Array.isArray(msg.support) && msg.support.every(isString) && msg.support.includes(msg.version))) {
            socket.send(DDPCommon.stringifyDDP({
                msg: 'failed',
                version: DDPCommon.SUPPORTED_DDP_VERSIONS[0]
            }));
            socket.close();
            return;
        }
        // In the future, handle session resumption: something like:
        //  socket._meteorSession = self.sessions[msg.session]
        var version = calculateVersion(msg.support, DDPCommon.SUPPORTED_DDP_VERSIONS);
        if (msg.version !== version) {
            // The best version to use (according to the client's stated preferences)
            // is not the one the client is trying to use. Inform them about the best
            // version to use.
            socket.send(DDPCommon.stringifyDDP({
                msg: 'failed',
                version: version
            }));
            socket.close();
            return;
        }
        // Yay, version matches! Resume existing session if possible, otherwise create a new one.
        // Note: Troposphere depends on the ability to mutate
        // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.
        const existingSession = self.sessions.get(msg.session);
        // we've found a session with:
        // the right ID
        // a matching sent/received count
        // was disconnected and hasn't been reconnected to yet.
        if (existingSession && existingSession.sentCount === msg.receivedCount && existingSession._removeTimeoutHandle) {
            Meteor.clearTimeout(existingSession._removeTimeoutHandle);
            existingSession._removeTimeoutHandle = undefined;
            existingSession._pendingRemoveFunction = undefined;
            existingSession._isClosing = false; // Reset so session can be closed again later
            socket._meteorSession = existingSession;
            const messageQueue = existingSession.messageQueue;
            existingSession.messageQueue = undefined;
            existingSession.socket = socket;
            // Restart heartbeat for the resumed session
            if (existingSession.version !== 'pre1' && self.options.heartbeatInterval !== 0) {
                socket.setWebsocketTimeout(0);
                existingSession.heartbeat = new DDPCommon.Heartbeat({
                    heartbeatInterval: self.options.heartbeatInterval,
                    heartbeatTimeout: self.options.heartbeatTimeout,
                    onTimeout: function() {
                        existingSession.close();
                    },
                    sendPing: function() {
                        existingSession.send({
                            msg: 'ping'
                        });
                    }
                });
                existingSession.heartbeat.start();
            }
            // Send connected message so client can restart heartbeat and confirm resumption
            existingSession.send({
                msg: 'connected',
                session: existingSession.id
            });
            if (messageQueue) {
                Meteor.defer(()=>{
                    messageQueue.forEach((msg)=>existingSession.send(msg));
                });
            }
        // Note: onConnectionHook is NOT called on session resume - the connection
        // is considered to be the same logical connection as before.
        } else {
            // immediately remove the old session since we're out of date.
            if (existingSession && existingSession._pendingRemoveFunction) {
                Meteor.clearTimeout(existingSession._removeTimeoutHandle);
                existingSession._pendingRemoveFunction();
            }
            socket._meteorSession = new Session(self, version, socket, self.options);
            self.sessions.set(socket._meteorSession.id, socket._meteorSession);
            self.onConnectionHook.each(function(callback) {
                if (socket._meteorSession) callback(socket._meteorSession.connectionHandle);
                return true;
            });
        }
    },
    /**
   * Register a publish handler function.
   *
   * @param name {String} identifier for query
   * @param handler {Function} publish handler
   * @param options {Object}
   *
   * Server will call handler function on each new subscription,
   * either when receiving DDP sub message for a named subscription, or on
   * DDP connect for a universal subscription.
   *
   * If name is null, this will be a subscription that is
   * automatically established and permanently on for all connected
   * client, instead of a subscription that can be turned on and off
   * with subscribe().
   *
   * options to contain:
   *  - (mostly internal) is_auto: true if generated automatically
   *    from an autopublish hook. this is for cosmetic purposes only
   *    (it lets us determine whether to print a warning suggesting
   *    that you turn off autopublish).
   */ /**
   * @summary Publish a record set.
   * @memberOf Meteor
   * @importFromPackage meteor
   * @locus Server
   * @param {String|Object} name If String, name of the record set.  If Object, publications Dictionary of publish functions by name.  If `null`, the set has no name, and the record set is automatically sent to all connected clients.
   * @param {Function} func Function called on the server each time a client subscribes.  Inside the function, `this` is the publish handler object, described below.  If the client passed arguments to `subscribe`, the function is called with the same arguments.
   */ publish: function(name, handler, options) {
        var self = this;
        if (!isObject(name)) {
            options = options || {};
            if (name && name in self.publish_handlers) {
                Meteor._debug("Ignoring duplicate publish named '" + name + "'");
                return;
            }
            if (Package.autopublish && !options.is_auto) {
                // They have autopublish on, yet they're trying to manually
                // pick stuff to publish. They probably should turn off
                // autopublish. (This check isn't perfect -- if you create a
                // publish before you turn on autopublish, it won't catch
                // it, but this will definitely handle the simple case where
                // you've added the autopublish package to your app, and are
                // calling publish from your app code).
                if (!self.warned_about_autopublish) {
                    self.warned_about_autopublish = true;
                    Meteor._debug("** You've set up some data subscriptions with Meteor.publish(), but\n" + "** you still have autopublish turned on. Because autopublish is still\n" + "** on, your Meteor.publish() calls won't have much effect. All data\n" + "** will still be sent to all clients.\n" + "**\n" + "** Turn off autopublish by removing the autopublish package:\n" + "**\n" + "**   $ meteor remove autopublish\n" + "**\n" + "** .. and make sure you have Meteor.publish() and Meteor.subscribe() calls\n" + "** for each collection that you want clients to see.\n");
                }
            }
            if (name) self.publish_handlers[name] = handler;
            else {
                self.universal_publish_handlers.push(handler);
                // Spin up the new publisher on any existing session too. Run each
                // session's subscription in a new Fiber, so that there's no change for
                // self.sessions to change while we're running this loop.
                self.sessions.forEach(function(session) {
                    if (!session._dontStartNewUniversalSubs) {
                        session._startSubscription(handler);
                    }
                });
            }
        } else {
            Object.entries(name).forEach(function([key, value]) {
                self.publish(key, value, {});
            });
        }
    },
    _removeSession: function(session, callback = ()=>{}) {
        var self = this;
        const sessionRemoveFunction = ()=>{
            // Guard against being called multiple times (e.g., from both overflow and timeout)
            if (!self.sessions.has(session.id)) {
                return;
            }
            // Clear timeout handle if it exists to prevent double execution
            if (session._removeTimeoutHandle) {
                Meteor.clearTimeout(session._removeTimeoutHandle);
                session._removeTimeoutHandle = null;
            }
            session._pendingRemoveFunction = null;
            self.sessions.delete(session.id);
            callback();
        };
        if (session._expectingDisconnect) {
            return sessionRemoveFunction();
        }
        session.messageQueue = [];
        session._pendingRemoveFunction = sessionRemoveFunction;
        if (session._removeTimeoutHandle) {
            Meteor.clearTimeout(session._removeTimeoutHandle);
        }
        session._removeTimeoutHandle = Meteor.setTimeout(sessionRemoveFunction, self.options.disconnectGracePeriod);
    },
    /**
   * @summary Tells if the method call came from a call or a callAsync.
   * @locus Anywhere
   * @memberOf Meteor
   * @importFromPackage meteor
   * @returns boolean
   */ isAsyncCall: function() {
        return DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
    },
    /**
   * @summary Defines functions that can be invoked over the network by clients.
   * @locus Anywhere
   * @param {Object} methods Dictionary whose keys are method names and values are functions.
   * @memberOf Meteor
   * @importFromPackage meteor
   */ methods: function(methods) {
        var self = this;
        Object.entries(methods).forEach(function([name, func]) {
            if (typeof func !== 'function') throw new Error("Method '" + name + "' must be a function");
            if (self.method_handlers[name]) throw new Error("A method named '" + name + "' is already defined");
            self.method_handlers[name] = func;
        });
    },
    call: function(name, ...args) {
        if (args.length && typeof args[args.length - 1] === "function") {
            // If it's a function, the last argument is the result callback, not
            // a parameter to the remote method.
            var callback = args.pop();
        }
        return this.apply(name, args, callback);
    },
    // A version of the call method that always returns a Promise.
    callAsync: function(name, ...args) {
        var _args_;
        const options = ((_args_ = args[0]) === null || _args_ === void 0 ? void 0 : _args_.hasOwnProperty('returnStubValue')) ? args.shift() : {};
        DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(true);
        const promise = new Promise((resolve, reject)=>{
            DDP._CurrentCallAsyncInvocation._set({
                name,
                hasCallAsyncParent: true
            });
            this.applyAsync(name, args, _object_spread({
                isFromCallAsync: true
            }, options)).then(resolve).catch(reject).finally(()=>{
                DDP._CurrentCallAsyncInvocation._set();
            });
        });
        return promise.finally(()=>DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(false));
    },
    apply: function(name, args, options, callback) {
        // We were passed 3 arguments. They may be either (name, args, options)
        // or (name, args, callback)
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        const promise = this.applyAsync(name, args, options);
        // Return the result in whichever way the caller asked for it. Note that we
        // do NOT block on the write fence in an analogous way to how the client
        // blocks on the relevant data being visible, so you are NOT guaranteed that
        // cursor observe callbacks have fired when your callback is invoked. (We
        // can change this if there's a real use case).
        if (callback) {
            promise.then((result)=>callback(undefined, result), (exception)=>callback(exception));
        } else {
            return promise;
        }
    },
    // @param options {Optional Object}
    applyAsync: function(name, args, options) {
        // Run the handler
        var handler = this.method_handlers[name];
        if (!handler) {
            return Promise.reject(new Meteor.Error(404, `Method '${name}' not found`));
        }
        // If this is a method call from within another method or publish function,
        // get the user state from the outer method or publish function, otherwise
        // don't allow setUserId to be called
        var userId = null;
        let setUserId = ()=>{
            throw new Error("Can't call setUserId on a server initiated method call");
        };
        var connection = null;
        var currentMethodInvocation = DDP._CurrentMethodInvocation.get();
        var currentPublicationInvocation = DDP._CurrentPublicationInvocation.get();
        var randomSeed = null;
        if (currentMethodInvocation) {
            userId = currentMethodInvocation.userId;
            setUserId = (userId)=>currentMethodInvocation.setUserId(userId);
            connection = currentMethodInvocation.connection;
            randomSeed = DDPCommon.makeRpcSeed(currentMethodInvocation, name);
        } else if (currentPublicationInvocation) {
            userId = currentPublicationInvocation.userId;
            setUserId = (userId)=>currentPublicationInvocation._session._setUserId(userId);
            connection = currentPublicationInvocation.connection;
        }
        var invocation = new DDPCommon.MethodInvocation({
            isSimulation: false,
            userId,
            setUserId,
            connection,
            randomSeed
        });
        return new Promise((resolve, reject)=>{
            let result;
            try {
                result = DDP._CurrentMethodInvocation.withValue(invocation, ()=>maybeAuditArgumentChecks(handler, invocation, EJSON.clone(args), "internal call to '" + name + "'"));
            } catch (e) {
                return reject(e);
            }
            if (!Meteor._isPromise(result)) {
                return resolve(result);
            }
            result.then((r)=>resolve(r)).catch(reject);
        }).then(EJSON.clone);
    },
    _urlForSession: function(sessionId) {
        var self = this;
        var session = self.sessions.get(sessionId);
        if (session) return session._socketUrl;
        else return null;
    }
});
var calculateVersion = function(clientSupportedVersions, serverSupportedVersions) {
    var correctVersion = clientSupportedVersions.find(function(version) {
        return serverSupportedVersions.includes(version);
    });
    if (!correctVersion) {
        correctVersion = serverSupportedVersions[0];
    }
    return correctVersion;
};
DDPServer._calculateVersion = calculateVersion;
// "blind" exceptions other than those that were deliberately thrown to signal
// errors to the client
var wrapInternalException = function(exception, context) {
    if (!exception) return exception;
    // To allow packages to throw errors intended for the client but not have to
    // depend on the Meteor.Error class, `isClientSafe` can be set to true on any
    // error before it is thrown.
    if (exception.isClientSafe) {
        if (!(exception instanceof Meteor.Error)) {
            const originalMessage = exception.message;
            exception = new Meteor.Error(exception.error, exception.reason, exception.details);
            exception.message = originalMessage;
        }
        return exception;
    }
    // Tests can set the '_expectedByTest' flag on an exception so it won't go to
    // the server log.
    if (!exception._expectedByTest) {
        Meteor._debug("Exception " + context, exception.stack);
        if (exception.sanitizedError) {
            Meteor._debug("Sanitized and reported to the client as:", exception.sanitizedError);
            Meteor._debug();
        }
    }
    // Did the error contain more details that could have been useful if caught in
    // server code (or if thrown from non-client-originated code), but also
    // provided a "sanitized" version with more context than 500 Internal server error? Use that.
    if (exception.sanitizedError) {
        if (exception.sanitizedError.isClientSafe) return exception.sanitizedError;
        Meteor._debug("Exception " + context + " provides a sanitizedError that " + "does not have isClientSafe property set; ignoring");
    }
    return new Meteor.Error(500, "Internal server error");
};
// Audit argument checks, if the audit-argument-checks package exists (it is a
// weak dependency of this package).
var maybeAuditArgumentChecks = function(f, context, args, description) {
    args = args || [];
    if (Package['audit-argument-checks']) {
        return Match._failIfArgumentsAreNotAllChecked(f, context, args, description);
    }
    return f.apply(context, args);
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"writefence.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/writefence.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
DDPServer._WriteFence = class {
    beginWrite() {
        if (this.retired) {
            return {
                committed: ()=>{}
            };
        }
        if (this.fired) {
            throw new Error("fence has already activated -- too late to add writes");
        }
        this.outstanding_writes++;
        let committed = false;
        return {
            committed: ()=>_async_to_generator(function*() {
                    if (committed) {
                        throw new Error("committed called twice on the same write");
                    }
                    committed = true;
                    this.outstanding_writes--;
                    yield this._maybeFire();
                }).call(this)
        };
    }
    arm() {
        if (this === DDPServer._getCurrentFence()) {
            throw Error("Can't arm the current fence");
        }
        this.armed = true;
        return this._maybeFire();
    }
    onBeforeFire(func) {
        if (this.fired) {
            throw new Error("fence has already activated -- too late to add a callback");
        }
        this.before_fire_callbacks.push(func);
    }
    onAllCommitted(func) {
        if (this.fired) {
            throw new Error("fence has already activated -- too late to add a callback");
        }
        this.completion_callbacks.push(func);
    }
    _armAndWait() {
        return _async_to_generator(function*() {
            let resolver;
            const returnValue = new Promise((r)=>resolver = r);
            this.onAllCommitted(resolver);
            yield this.arm();
            return returnValue;
        }).call(this);
    }
    armAndWait() {
        return this._armAndWait();
    }
    _maybeFire() {
        return _async_to_generator(function*() {
            if (this.fired) {
                throw new Error("write fence already activated?");
            }
            if (!this.armed || this.outstanding_writes > 0) {
                return;
            }
            const invokeCallback = (func)=>_async_to_generator(function*() {
                    try {
                        yield func(this);
                    } catch (err) {
                        Meteor._debug("exception in write fence callback:", err);
                    }
                }).call(this);
            this.outstanding_writes++;
            // Process all before_fire callbacks in parallel
            const beforeCallbacks = [
                ...this.before_fire_callbacks
            ];
            this.before_fire_callbacks = [];
            yield Promise.all(beforeCallbacks.map((cb)=>invokeCallback(cb)));
            this.outstanding_writes--;
            if (this.outstanding_writes === 0) {
                this.fired = true;
                // Process all completion callbacks in parallel
                const callbacks = [
                    ...this.completion_callbacks
                ];
                this.completion_callbacks = [];
                yield Promise.all(callbacks.map((cb)=>invokeCallback(cb)));
            }
        }).call(this);
    }
    retire() {
        if (!this.fired) {
            throw new Error("Can't retire a fence that hasn't fired.");
        }
        this.retired = true;
    }
    constructor(){
        this.armed = false;
        this.fired = false;
        this.retired = false;
        this.outstanding_writes = 0;
        this.before_fire_callbacks = [];
        this.completion_callbacks = [];
    }
};
DDPServer._CurrentWriteFence = new Meteor.EnvironmentVariable;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"crossbar.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/crossbar.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
// A "crossbar" is a class that provides structured notification registration.
// See _match for the definition of how a notification matches a trigger.
// All notifications and triggers must have a string key named 'collection'.
DDPServer._Crossbar = function(options) {
    var self = this;
    options = options || {};
    self.nextId = 1;
    // map from collection name (string) -> listener id -> object. each object has
    // keys 'trigger', 'callback'.  As a hack, the empty string means "no
    // collection".
    self.listenersByCollection = {};
    self.listenersByCollectionCount = {};
    self.factPackage = options.factPackage || "livedata";
    self.factName = options.factName || null;
};
Object.assign(DDPServer._Crossbar.prototype, {
    // msg is a trigger or a notification
    _collectionForMessage: function(msg) {
        var self = this;
        if (!('collection' in msg)) {
            return '';
        } else if (typeof msg.collection === 'string') {
            if (msg.collection === '') throw Error("Message has empty collection!");
            return msg.collection;
        } else {
            throw Error("Message has non-string collection!");
        }
    },
    // Listen for notification that match 'trigger'. A notification
    // matches if it has the key-value pairs in trigger as a
    // subset. When a notification matches, call 'callback', passing
    // the actual notification.
    //
    // Returns a listen handle, which is an object with a method
    // stop(). Call stop() to stop listening.
    //
    // XXX It should be legal to call fire() from inside a listen()
    // callback?
    listen: function(trigger, callback) {
        var self = this;
        var id = self.nextId++;
        var collection = self._collectionForMessage(trigger);
        var record = {
            trigger: EJSON.clone(trigger),
            callback: callback
        };
        if (!(collection in self.listenersByCollection)) {
            self.listenersByCollection[collection] = {};
            self.listenersByCollectionCount[collection] = 0;
        }
        self.listenersByCollection[collection][id] = record;
        self.listenersByCollectionCount[collection]++;
        if (self.factName && Package['facts-base']) {
            Package['facts-base'].Facts.incrementServerFact(self.factPackage, self.factName, 1);
        }
        return {
            stop: function() {
                if (self.factName && Package['facts-base']) {
                    Package['facts-base'].Facts.incrementServerFact(self.factPackage, self.factName, -1);
                }
                delete self.listenersByCollection[collection][id];
                self.listenersByCollectionCount[collection]--;
                if (self.listenersByCollectionCount[collection] === 0) {
                    delete self.listenersByCollection[collection];
                    delete self.listenersByCollectionCount[collection];
                }
            }
        };
    },
    // Fire the provided 'notification' (an object whose attribute
    // values are all JSON-compatibile) -- inform all matching listeners
    // (registered with listen()).
    //
    // If fire() is called inside a write fence, then each of the
    // listener callbacks will be called inside the write fence as well.
    //
    // The listeners may be invoked in parallel, rather than serially.
    fire: function(notification) {
        return _async_to_generator(function*() {
            var self = this;
            var collection = self._collectionForMessage(notification);
            if (!(collection in self.listenersByCollection)) {
                return;
            }
            var listenersForCollection = self.listenersByCollection[collection];
            var callbackIds = [];
            Object.entries(listenersForCollection).forEach(function([id, l]) {
                if (self._matches(notification, l.trigger)) {
                    callbackIds.push(id);
                }
            });
            // Listener callbacks can yield, so we need to first find all the ones that
            // match in a single iteration over self.listenersByCollection (which can't
            // be mutated during this iteration), and then invoke the matching
            // callbacks, checking before each call to ensure they haven't stopped.
            // Note that we don't have to check that
            // self.listenersByCollection[collection] still === listenersForCollection,
            // because the only way that stops being true is if listenersForCollection
            // first gets reduced down to the empty object (and then never gets
            // increased again).
            for (const id of callbackIds){
                if (id in listenersForCollection) {
                    yield listenersForCollection[id].callback(notification);
                }
            }
        }).call(this);
    },
    // A notification matches a trigger if all keys that exist in both are equal.
    //
    // Examples:
    //  N:{collection: "C"} matches T:{collection: "C"}
    //    (a non-targeted write to a collection matches a
    //     non-targeted query)
    //  N:{collection: "C", id: "X"} matches T:{collection: "C"}
    //    (a targeted write to a collection matches a non-targeted query)
    //  N:{collection: "C"} matches T:{collection: "C", id: "X"}
    //    (a non-targeted write to a collection matches a
    //     targeted query)
    //  N:{collection: "C", id: "X"} matches T:{collection: "C", id: "X"}
    //    (a targeted write to a collection matches a targeted query targeted
    //     at the same document)
    //  N:{collection: "C", id: "X"} does not match T:{collection: "C", id: "Y"}
    //    (a targeted write to a collection does not match a targeted query
    //     targeted at a different document)
    _matches: function(notification, trigger) {
        // Most notifications that use the crossbar have a string `collection` and
        // maybe an `id` that is a string or ObjectID. We're already dividing up
        // triggers by collection, but let's fast-track "nope, different ID" (and
        // avoid the overly generic EJSON.equals). This makes a noticeable
        // performance difference; see https://github.com/meteor/meteor/pull/3697
        if (typeof notification.id === 'string' && typeof trigger.id === 'string' && notification.id !== trigger.id) {
            return false;
        }
        if (notification.id instanceof MongoID.ObjectID && trigger.id instanceof MongoID.ObjectID && !notification.id.equals(trigger.id)) {
            return false;
        }
        return Object.keys(trigger).every(function(key) {
            return !(key in notification) || EJSON.equals(trigger[key], notification[key]);
        });
    }
});
// The "invalidation crossbar" is a specific instance used by the DDP server to
// implement write fence notifications. Listener callbacks on this crossbar
// should call beginWrite on the current write fence before they return, if they
// want to delay the write fence from firing (ie, the DDP method-data-updated
// message from being sent).
DDPServer._InvalidationCrossbar = new DDPServer._Crossbar({
    factName: "invalidation-crossbar-listeners"
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"server_convenience.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/server_convenience.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
if (process.env.DDP_DEFAULT_CONNECTION_URL) {
    __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = process.env.DDP_DEFAULT_CONNECTION_URL;
}
Meteor.server = new Server();
Meteor.refresh = function(notification) {
    return _async_to_generator(function*() {
        yield DDPServer._InvalidationCrossbar.fire(notification);
    })();
};
// Proxy the public methods of Meteor.server so they can
// be called directly on Meteor.
[
    'publish',
    'isAsyncCall',
    'methods',
    'call',
    'callAsync',
    'apply',
    'applyAsync',
    'onConnection',
    'onMessage'
].forEach(function(name) {
    Meteor[name] = Meteor.server[name].bind(Meteor.server);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dummy_document_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/dummy_document_view.ts                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({DummyDocumentView:()=>DummyDocumentView});function _define_property(obj, key, value) {
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
class DummyDocumentView {
    getFields() {
        return {};
    }
    clearField(subscriptionHandle, key, changeCollector) {
        changeCollector[key] = undefined;
    }
    changeField(subscriptionHandle, key, value, changeCollector, isAdd) {
        changeCollector[key] = value;
    }
    constructor(){
        _define_property(this, "existsIn", void 0);
        _define_property(this, "dataByKey", void 0);
        this.existsIn = new Set(); // set of subscriptionHandle
        this.dataByKey = new Map(); // key-> [ {subscriptionHandle, value} by precedence]
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"session_collection_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/session_collection_view.ts                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({SessionCollectionView:()=>SessionCollectionView});let DummyDocumentView;module.link("./dummy_document_view",{DummyDocumentView(v){DummyDocumentView=v}},0);let SessionDocumentView;module.link("./session_document_view",{SessionDocumentView(v){SessionDocumentView=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _define_property(obj, key, value) {
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


class SessionCollectionView {
    isEmpty() {
        return this.documents.size === 0;
    }
    diff(previous) {
        DiffSequence.diffMaps(previous.documents, this.documents, {
            both: this.diffDocument.bind(this),
            rightOnly: (id, nowDV)=>{
                this.callbacks.added(this.collectionName, id, nowDV.getFields());
            },
            leftOnly: (id, prevDV)=>{
                this.callbacks.removed(this.collectionName, id);
            }
        });
    }
    diffDocument(id, prevDV, nowDV) {
        const fields = {};
        DiffSequence.diffObjects(prevDV.getFields(), nowDV.getFields(), {
            both: (key, prev, now)=>{
                if (!EJSON.equals(prev, now)) {
                    fields[key] = now;
                }
            },
            rightOnly: (key, now)=>{
                fields[key] = now;
            },
            leftOnly: (key, prev)=>{
                fields[key] = undefined;
            }
        });
        this.callbacks.changed(this.collectionName, id, fields);
    }
    added(subscriptionHandle, id, fields) {
        let docView = this.documents.get(id);
        let added = false;
        if (!docView) {
            added = true;
            if (Meteor.server.getPublicationStrategy(this.collectionName).useDummyDocumentView) {
                docView = new DummyDocumentView();
            } else {
                docView = new SessionDocumentView();
            }
            this.documents.set(id, docView);
        }
        docView.existsIn.add(subscriptionHandle);
        const changeCollector = {};
        Object.entries(fields).forEach(([key, value])=>{
            docView.changeField(subscriptionHandle, key, value, changeCollector, true);
        });
        if (added) {
            this.callbacks.added(this.collectionName, id, changeCollector);
        } else {
            this.callbacks.changed(this.collectionName, id, changeCollector);
        }
    }
    changed(subscriptionHandle, id, changed) {
        const changedResult = {};
        const docView = this.documents.get(id);
        if (!docView) {
            // Document was already removed. This can happen in high-concurrency scenarios
            // where the cache is updated synchronously but callbacks are processed
            // asynchronously, and a remove was processed before this change.
            return;
        }
        Object.entries(changed).forEach(([key, value])=>{
            if (value === undefined) {
                docView.clearField(subscriptionHandle, key, changedResult);
            } else {
                docView.changeField(subscriptionHandle, key, value, changedResult);
            }
        });
        this.callbacks.changed(this.collectionName, id, changedResult);
    }
    removed(subscriptionHandle, id) {
        const docView = this.documents.get(id);
        if (!docView) {
            // Document was already removed. This can happen in high-concurrency scenarios
            // where the cache is updated synchronously but callbacks are processed
            // asynchronously, causing duplicate removal attempts.
            return;
        }
        docView.existsIn.delete(subscriptionHandle);
        if (docView.existsIn.size === 0) {
            // it is gone from everyone
            this.callbacks.removed(this.collectionName, id);
            this.documents.delete(id);
        } else {
            const changed = {};
            // remove this subscription from every precedence list
            // and record the changes
            docView.dataByKey.forEach((precedenceList, key)=>{
                docView.clearField(subscriptionHandle, key, changed);
            });
            this.callbacks.changed(this.collectionName, id, changed);
        }
    }
    /**
   * Represents a client's view of a single collection
   * @param collectionName - Name of the collection it represents
   * @param sessionCallbacks - The callbacks for added, changed, removed
   */ constructor(collectionName, sessionCallbacks){
        _define_property(this, "collectionName", void 0);
        _define_property(this, "documents", void 0);
        _define_property(this, "callbacks", void 0);
        this.collectionName = collectionName;
        this.documents = new Map();
        this.callbacks = sessionCallbacks;
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"session_document_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/session_document_view.ts                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({SessionDocumentView:()=>SessionDocumentView});function _define_property(obj, key, value) {
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
class SessionDocumentView {
    getFields() {
        const ret = {};
        this.dataByKey.forEach((precedenceList, key)=>{
            ret[key] = precedenceList[0].value;
        });
        return ret;
    }
    clearField(subscriptionHandle, key, changeCollector) {
        // Publish API ignores _id if present in fields
        if (key === "_id") return;
        const precedenceList = this.dataByKey.get(key);
        // It's okay to clear fields that didn't exist. No need to throw
        // an error.
        if (!precedenceList) return;
        let removedValue = undefined;
        for(let i = 0; i < precedenceList.length; i++){
            const precedence = precedenceList[i];
            if (precedence.subscriptionHandle === subscriptionHandle) {
                // The view's value can only change if this subscription is the one that
                // used to have precedence.
                if (i === 0) removedValue = precedence.value;
                precedenceList.splice(i, 1);
                break;
            }
        }
        if (precedenceList.length === 0) {
            this.dataByKey.delete(key);
            changeCollector[key] = undefined;
        } else if (removedValue !== undefined && !EJSON.equals(removedValue, precedenceList[0].value)) {
            changeCollector[key] = precedenceList[0].value;
        }
    }
    changeField(subscriptionHandle, key, value, changeCollector, isAdd = false) {
        // Publish API ignores _id if present in fields
        if (key === "_id") return;
        // Don't share state with the data passed in by the user.
        value = EJSON.clone(value);
        if (!this.dataByKey.has(key)) {
            this.dataByKey.set(key, [
                {
                    subscriptionHandle: subscriptionHandle,
                    value: value
                }
            ]);
            changeCollector[key] = value;
            return;
        }
        const precedenceList = this.dataByKey.get(key);
        let elt;
        if (!isAdd) {
            elt = precedenceList.find((precedence)=>precedence.subscriptionHandle === subscriptionHandle);
        }
        if (elt) {
            if (elt === precedenceList[0] && !EJSON.equals(value, elt.value)) {
                // this subscription is changing the value of this field.
                changeCollector[key] = value;
            }
            elt.value = value;
        } else {
            // this subscription is newly caring about this field
            precedenceList.push({
                subscriptionHandle: subscriptionHandle,
                value: value
            });
        }
    }
    constructor(){
        _define_property(this, "existsIn", void 0);
        _define_property(this, "dataByKey", void 0);
        this.existsIn = new Set(); // set of subscriptionHandle
        // Memory Growth
        this.dataByKey = new Map(); // key-> [ {subscriptionHandle, value} by precedence]
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.once":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.once/package.json                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.once",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.once/index.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isempty/package.json                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isempty/index.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isobject/package.json                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isobject/index.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isstring":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isstring/package.json                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isstring",
  "version": "4.0.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isstring/index.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  export: function () { return {
      DDPServer: DDPServer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ddp-server/transports/raw_connection.js",
    "/node_modules/meteor/ddp-server/transports/sockjs.js",
    "/node_modules/meteor/ddp-server/transports/uws.js",
    "/node_modules/meteor/ddp-server/transports/index.js",
    "/node_modules/meteor/ddp-server/stream_server.js",
    "/node_modules/meteor/ddp-server/livedata_server.js",
    "/node_modules/meteor/ddp-server/writefence.js",
    "/node_modules/meteor/ddp-server/crossbar.js",
    "/node_modules/meteor/ddp-server/server_convenience.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/ddp-server.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci90cmFuc3BvcnRzL3Jhd19jb25uZWN0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3RyYW5zcG9ydHMvc29ja2pzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3RyYW5zcG9ydHMvdXdzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3RyYW5zcG9ydHMvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2RkcC1zZXJ2ZXIvc3RyZWFtX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9saXZlZGF0YV9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2RkcC1zZXJ2ZXIvd3JpdGVmZW5jZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9jcm9zc2Jhci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9zZXJ2ZXJfY29udmVuaWVuY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2RkcC1zZXJ2ZXIvZHVtbXlfZG9jdW1lbnRfdmlldy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9zZXNzaW9uX2NvbGxlY3Rpb25fdmlldy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9zZXNzaW9uX2RvY3VtZW50X3ZpZXcudHMiXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiUmF3V2ViU29ja2V0Q29ubmVjdGlvbiIsIndyaXRlIiwiZGF0YSIsIl93cyIsInNlbmQiLCJjbG9zZSIsInNldFdlYnNvY2tldFRpbWVvdXQiLCJ0aW1lb3V0IiwiX3Jhd1NvY2tldCIsInNldFRpbWVvdXQiLCJ3cyIsInJlcSIsInJhd1NvY2tldCIsIm1lc3NhZ2VBZGFwdGVyIiwicHJvdG9jb2wiLCJpZCIsIlJhbmRvbSIsImhlYWRlcnMiLCJoZWFkZXJLZXlzIiwia2V5IiwicmVtb3RlQWRkcmVzcyIsInJlbW90ZVBvcnQiLCJ1cmwiLCJfc2Vzc2lvbiIsInJlY3YiLCJjb25uZWN0aW9uIiwib24iLCJhcmdzIiwic3RyIiwiZW1pdCIsImNyZWF0ZVNvY2tKU1RyYW5zcG9ydCIsIm5hbWUiLCJzZXR1cCIsImh0dHBTZXJ2ZXIiLCJwYXRoUHJlZml4Iiwib3B0aW9ucyIsImVtaXR0ZXIiLCJzb2NranMiLCJOcG0iLCJyZXF1aXJlIiwicHJlZml4IiwiUm91dGVQb2xpY3kiLCJkZWNsYXJlIiwic2VydmVyT3B0aW9ucyIsImxvZyIsImhlYXJ0YmVhdF9kZWxheSIsImRpc2Nvbm5lY3RfZGVsYXkiLCJkaXNhYmxlX2NvcnMiLCJwcm9jZXNzIiwiZW52IiwiRElTQUJMRV9TT0NLSlNfQ09SUyIsImpzZXNzaW9uaWQiLCJVU0VfSlNFU1NJT05JRCIsIkRJU0FCTEVfV0VCU09DS0VUUyIsIndlYnNvY2tldCIsImZheWVfc2VydmVyX29wdGlvbnMiLCJleHRlbnNpb25zIiwid2Vic29ja2V0RXh0ZW5zaW9ucyIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsInJlbW92ZUxpc3RlbmVyIiwiV2ViQXBwIiwiX3RpbWVvdXRBZGp1c3RtZW50UmVxdWVzdENhbGxiYWNrIiwiaW5zdGFsbEhhbmRsZXJzIiwiYWRkTGlzdGVuZXIiLCJyZWRpcmVjdFdlYnNvY2tldEVuZHBvaW50Iiwic29ja2V0Iiwic29ja2pzUHJlZml4IiwiZm9yRWFjaCIsImV2ZW50Iiwib2xkSHR0cFNlcnZlckxpc3RlbmVycyIsImxpc3RlbmVycyIsInNsaWNlIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwibmV3TGlzdGVuZXIiLCJyZXF1ZXN0IiwiYXJndW1lbnRzIiwicGFyc2VkVXJsIiwiVVJMIiwicGF0aG5hbWUiLCJzZWFyY2giLCJvbGRMaXN0ZW5lciIsImFwcGx5IiwiY3JlYXRlVXdzVHJhbnNwb3J0IiwiTWV0ZW9yIiwidXdzIiwic2V0dGluZ3MiLCJwYWNrYWdlcyIsInV3c1BvcnQiLCJOdW1iZXIiLCJwb3J0IiwidXdzUGF5bG9hZExlbmd0aCIsInBheWxvYWRMZW5ndGgiLCJ1d3NTb2NrZXRUaW1lb3V0IiwidXdzSG9zdCIsImhvc3QiLCJ1d3NQcm94eUhvc3QiLCJjbG9zZUxpc3RlbmVycyIsIldlYWtNYXAiLCJtZXNzYWdlTGlzdGVuZXJzIiwidXdzQXBwIiwiQXBwIiwiZ2V0IiwicmVzIiwiZW5kIiwibWF4QmFja3ByZXNzdXJlIiwibWF4UGF5bG9hZExlbmd0aCIsImlkbGVUaW1lb3V0Iiwib3BlbiIsImNhbGxiYWNrIiwibWFwIiwibGlzdCIsInB1c2giLCJzZXQiLCJ1cGdyYWRlIiwiY29udGV4dCIsInZhbHVlIiwiZ2V0SGVhZGVyIiwiaXNDbG9zZWQiLCJkZWxldGUiLCJjYiIsImUiLCJfZGVidWciLCJtZXNzYWdlIiwiaXNCaW5hcnkiLCJsZW5ndGgiLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJsaXN0ZW4iLCJMSUJVU19MSVNURU5fRVhDTFVTSVZFX1BPUlQiLCJ0b2tlbiIsIkVycm9yIiwicmF3Q29ubmVjdEhhbmRsZXJzIiwidXNlIiwibmV4dCIsIndyaXRlSGVhZCIsInByb3h5V2Vic29ja2V0VG9Vd3MiLCJvbGRVcGdyYWRlTGlzdGVuZXJzIiwiaGVhZCIsInV3c1NvY2tldCIsIm5ldCIsImNyZWF0ZUNvbm5lY3Rpb24iLCJpIiwicmF3SGVhZGVycyIsImh0dHBSZXF1ZXN0IiwibWV0aG9kIiwiaHR0cFZlcnNpb24iLCJwaXBlIiwid3JpdGFibGUiLCJkZXN0cm95IiwiY2FsbCIsIlRSQU5TUE9SVFMiLCJWQUxJRF9OQU1FUyIsIk9iamVjdCIsImtleXMiLCJnZXRUcmFuc3BvcnQiLCJyZXNvbHZlVHJhbnNwb3J0TmFtZSIsImpvaW4iLCJfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIiwiRERQX1RSQU5TUE9SVCIsInRyYW5zcG9ydCIsIkRJU0FCTEVfU09DS0pTIiwib25jZSIsIndlYnNvY2tldENvbXByZXNzaW9uQ29uZmlnIiwiU0VSVkVSX1dFQlNPQ0tFVF9DT01QUkVTU0lPTiIsIkpTT04iLCJwYXJzZSIsImNvbmZpZ3VyZSIsInRocmVzaG9sZCIsImxldmVsIiwiemxpYiIsImNvbnN0YW50cyIsIlpfQkVTVF9TUEVFRCIsIm1lbUxldmVsIiwiWl9NSU5fTUVNTEVWRUwiLCJub0NvbnRleHRUYWtlb3ZlciIsIm1heFdpbmRvd0JpdHMiLCJaX01JTl9XSU5ET1dCSVRTIiwiUk9PVF9VUkxfUEFUSF9QUkVGSVgiLCJTdHJlYW1TZXJ2ZXIiLCJzZWxmIiwicmVnaXN0cmF0aW9uX2NhbGxiYWNrcyIsIm9wZW5fc29ja2V0cyIsIl9vbkNvbm5lY3Rpb24iLCJhc3NpZ24iLCJwcm90b3R5cGUiLCJmaWx0ZXIiLCJURVNUX01FVEFEQVRBIiwic3RyaW5naWZ5IiwidGVzdE1lc3NhZ2VPbkNvbm5lY3QiLCJyZWdpc3RlciIsImFsbF9zb2NrZXRzIiwidmFsdWVzIiwiRERQU2VydmVyIiwicHVibGljYXRpb25TdHJhdGVnaWVzIiwiU0VSVkVSX01FUkdFIiwidXNlRHVtbXlEb2N1bWVudFZpZXciLCJ1c2VDb2xsZWN0aW9uVmlldyIsImRvQWNjb3VudGluZ0ZvckNvbGxlY3Rpb24iLCJOT19NRVJHRV9OT19ISVNUT1JZIiwiTk9fTUVSR0UiLCJOT19NRVJHRV9NVUxUSSIsIl9TZXNzaW9uRG9jdW1lbnRWaWV3IiwiU2Vzc2lvbkRvY3VtZW50VmlldyIsIl9nZXRDdXJyZW50RmVuY2UiLCJjdXJyZW50SW52b2NhdGlvbiIsIl9DdXJyZW50V3JpdGVGZW5jZSIsIkREUCIsIl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiIsImZlbmNlIiwidW5kZWZpbmVkIiwiX1Nlc3Npb25Db2xsZWN0aW9uVmlldyIsIlNlc3Npb25Db2xsZWN0aW9uVmlldyIsIlNlc3Npb24iLCJ2ZXJzaW9uIiwic2VudENvdW50IiwiaW5pdGlhbGl6ZWQiLCJpblF1ZXVlIiwiX0RvdWJsZUVuZGVkUXVldWUiLCJibG9ja2VkIiwid29ya2VyUnVubmluZyIsImNhY2hlZFVuYmxvY2siLCJfbmFtZWRTdWJzIiwiTWFwIiwiX3VuaXZlcnNhbFN1YnMiLCJ1c2VySWQiLCJjb2xsZWN0aW9uVmlld3MiLCJfaXNTZW5kaW5nIiwiX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMiLCJfcGVuZGluZ1JlYWR5IiwiX2Nsb3NlQ2FsbGJhY2tzIiwiX3NvY2tldFVybCIsIl9yZXNwb25kVG9QaW5ncyIsInJlc3BvbmRUb1BpbmdzIiwiY29ubmVjdGlvbkhhbmRsZSIsIl9leHBlY3RpbmdEaXNjb25uZWN0Iiwib25DbG9zZSIsImZuIiwiYmluZEVudmlyb25tZW50IiwiZGVmZXIiLCJjbGllbnRBZGRyZXNzIiwiX2NsaWVudEFkZHJlc3MiLCJodHRwSGVhZGVycyIsIm1zZyIsInNlc3Npb24iLCJzdGFydFVuaXZlcnNhbFN1YnMiLCJoZWFydGJlYXRJbnRlcnZhbCIsImhlYXJ0YmVhdCIsIkREUENvbW1vbiIsIkhlYXJ0YmVhdCIsImhlYXJ0YmVhdFRpbWVvdXQiLCJvblRpbWVvdXQiLCJzZW5kUGluZyIsInN0YXJ0IiwiUGFja2FnZSIsIkZhY3RzIiwiaW5jcmVtZW50U2VydmVyRmFjdCIsImlnbm9yZWRNc2dzRm9yU2Vzc2lvbk91dE9mRGF0ZUNoZWNrIiwic2VuZFJlYWR5Iiwic3Vic2NyaXB0aW9uSWRzIiwic3VicyIsInN1YnNjcmlwdGlvbklkIiwiX2NhblNlbmQiLCJjb2xsZWN0aW9uTmFtZSIsImdldFB1YmxpY2F0aW9uU3RyYXRlZ3kiLCJzZW5kQWRkZWQiLCJmaWVsZHMiLCJjb2xsZWN0aW9uIiwic2VuZENoYW5nZWQiLCJpc0VtcHR5Iiwic2VuZFJlbW92ZWQiLCJnZXRTZW5kQ2FsbGJhY2tzIiwiYWRkZWQiLCJiaW5kIiwiY2hhbmdlZCIsInJlbW92ZWQiLCJnZXRDb2xsZWN0aW9uVmlldyIsInJldCIsInN1YnNjcmlwdGlvbkhhbmRsZSIsInZpZXciLCJoYW5kbGVyIiwidW5pdmVyc2FsX3B1Ymxpc2hfaGFuZGxlcnMiLCJfc3RhcnRTdWJzY3JpcHRpb24iLCJfc3RvcEhlYXJ0YmVhdCIsInN0b3AiLCJfaXNDbG9zaW5nIiwiX3JlbW92ZVRpbWVvdXRIYW5kbGUiLCJjbGVhclRpbWVvdXQiLCJfbWV0ZW9yU2Vzc2lvbiIsIl9yZW1vdmVTZXNzaW9uIiwiX2RlYWN0aXZhdGVBbGxTdWJzY3JpcHRpb25zIiwiaXNJZ25vcmVkTXNnIiwiaW5jbHVkZXMiLCJtZXNzYWdlUXVldWUiLCJtYXhNZXNzYWdlUXVldWVMZW5ndGgiLCJfcGVuZGluZ1JlbW92ZUZ1bmN0aW9uIiwic3RyaW5nTXNnIiwic3RyaW5naWZ5RERQIiwiX3ByaW50U2VudEREUCIsInNlbmRFcnJvciIsInJlYXNvbiIsIm9mZmVuZGluZ01lc3NhZ2UiLCJwcm9jZXNzTWVzc2FnZSIsIm1zZ19pbiIsIm1lc3NhZ2VSZWNlaXZlZCIsInByb3RvY29sX2hhbmRsZXJzIiwiZGlzY29ubmVjdCIsInByb2Nlc3NOZXh0Iiwic2hpZnQiLCJydW5IYW5kbGVycyIsInVuYmxvY2siLCJzZXRJbW1lZGlhdGUiLCJvbk1lc3NhZ2VIb29rIiwiZWFjaCIsInJlc3VsdCIsIl9pc1Byb21pc2UiLCJmaW5hbGx5Iiwic3ViIiwicGFyYW1zIiwiQXJyYXkiLCJwdWJsaXNoX2hhbmRsZXJzIiwiZXJyb3IiLCJoYXMiLCJERFBSYXRlTGltaXRlciIsInJhdGVMaW1pdGVySW5wdXQiLCJ0eXBlIiwiY29ubmVjdGlvbklkIiwicnVsZXMiLCJmaW5kQWxsTWF0Y2hpbmdSdWxlc0FzeW5jIiwiX2luY3JlbWVudFJ1bGVzIiwicmF0ZUxpbWl0UmVzdWx0IiwiX2NoZWNrUnVsZXMiLCJhbGxvd2VkIiwiZ2V0RXJyb3JNZXNzYWdlIiwidGltZVRvUmVzZXQiLCJ1bnN1YiIsIl9zdG9wU3Vic2NyaXB0aW9uIiwicmFuZG9tU2VlZCIsIl9Xcml0ZUZlbmNlIiwib25BbGxDb21taXR0ZWQiLCJyZXRpcmUiLCJtZXRob2RzIiwibWV0aG9kX2hhbmRsZXJzIiwiYXJtIiwiaW52b2NhdGlvbiIsIk1ldGhvZEludm9jYXRpb24iLCJpc1NpbXVsYXRpb24iLCJzZXRVc2VySWQiLCJfc2V0VXNlcklkIiwiZmluaXNoIiwicGF5bG9hZCIsIndpdGhWYWx1ZSIsIm1heWJlQXVkaXRBcmd1bWVudENoZWNrcyIsImV4Y2VwdGlvbiIsIndyYXBJbnRlcm5hbEV4Y2VwdGlvbiIsIl9lYWNoU3ViIiwiZiIsIl9kaWZmQ29sbGVjdGlvblZpZXdzIiwiYmVmb3JlQ1ZzIiwiRGlmZlNlcXVlbmNlIiwiZGlmZk1hcHMiLCJib3RoIiwibGVmdFZhbHVlIiwicmlnaHRWYWx1ZSIsImRpZmYiLCJyaWdodE9ubHkiLCJkb2N1bWVudHMiLCJkb2NWaWV3IiwiZ2V0RmllbGRzIiwibGVmdE9ubHkiLCJkb2MiLCJfZGVhY3RpdmF0ZSIsIm9sZE5hbWVkU3VicyIsIlByb21pc2UiLCJhbGwiLCJuZXdTdWIiLCJfcmVjcmVhdGUiLCJfcnVuSGFuZGxlciIsIl9ub1lpZWxkc0FsbG93ZWQiLCJzdWJJZCIsIlN1YnNjcmlwdGlvbiIsInVuYmxvY2tIYW5kZXIiLCJzdWJOYW1lIiwibWF5YmVTdWIiLCJfbmFtZSIsIl9yZW1vdmVBbGxEb2N1bWVudHMiLCJyZXNwb25zZSIsImh0dHBGb3J3YXJkZWRDb3VudCIsInBhcnNlSW50IiwiZm9yd2FyZGVkRm9yIiwiaXNTdHJpbmciLCJzcGxpdCIsImlwIiwidHJpbSIsIl9oYW5kbGVyIiwiX3N1YnNjcmlwdGlvbklkIiwiX3BhcmFtcyIsIl9zdWJzY3JpcHRpb25IYW5kbGUiLCJfZGVhY3RpdmF0ZWQiLCJfc3RvcENhbGxiYWNrcyIsIl9kb2N1bWVudHMiLCJfcmVhZHkiLCJfaWRGaWx0ZXIiLCJpZFN0cmluZ2lmeSIsIk1vbmdvSUQiLCJpZFBhcnNlIiwicmVzdWx0T3JUaGVuYWJsZSIsIl9DdXJyZW50UHVibGljYXRpb25JbnZvY2F0aW9uIiwiRUpTT04iLCJjbG9uZSIsIl9pc0RlYWN0aXZhdGVkIiwiaXNUaGVuYWJsZSIsInRoZW4iLCJfcHVibGlzaEhhbmRsZXJSZXN1bHQiLCJpc0N1cnNvciIsImMiLCJfcHVibGlzaEN1cnNvciIsInJlYWR5IiwiaXNBcnJheSIsImV2ZXJ5IiwiY29sbGVjdGlvbk5hbWVzIiwiX2dldENvbGxlY3Rpb25OYW1lIiwiY3VyIiwiX2NhbGxTdG9wQ2FsbGJhY2tzIiwiY2FsbGJhY2tzIiwiY29sbGVjdGlvbkRvY3MiLCJzdHJJZCIsIm9uU3RvcCIsImlkcyIsIlNldCIsImFkZCIsIlNlcnZlciIsImRlZmF1bHRQdWJsaWNhdGlvblN0cmF0ZWd5IiwiZGlzY29ubmVjdEdyYWNlUGVyaW9kIiwib25Db25uZWN0aW9uSG9vayIsIkhvb2siLCJkZWJ1Z1ByaW50RXhjZXB0aW9ucyIsIl9wdWJsaWNhdGlvblN0cmF0ZWdpZXMiLCJzZXNzaW9ucyIsInN0cmVhbV9zZXJ2ZXIiLCJyYXdfbXNnIiwiX3ByaW50UmVjZWl2ZWRERFAiLCJwYXJzZUREUCIsImVyciIsIl9oYW5kbGVDb25uZWN0Iiwib25Db25uZWN0aW9uIiwic2V0UHVibGljYXRpb25TdHJhdGVneSIsInN0cmF0ZWd5Iiwib25NZXNzYWdlIiwic3VwcG9ydCIsIlNVUFBPUlRFRF9ERFBfVkVSU0lPTlMiLCJjYWxjdWxhdGVWZXJzaW9uIiwiZXhpc3RpbmdTZXNzaW9uIiwicmVjZWl2ZWRDb3VudCIsInB1Ymxpc2giLCJpc09iamVjdCIsImF1dG9wdWJsaXNoIiwiaXNfYXV0byIsIndhcm5lZF9hYm91dF9hdXRvcHVibGlzaCIsImVudHJpZXMiLCJzZXNzaW9uUmVtb3ZlRnVuY3Rpb24iLCJpc0FzeW5jQ2FsbCIsIl9pc0NhbGxBc3luY01ldGhvZFJ1bm5pbmciLCJmdW5jIiwicG9wIiwiY2FsbEFzeW5jIiwiaGFzT3duUHJvcGVydHkiLCJfc2V0Q2FsbEFzeW5jTWV0aG9kUnVubmluZyIsInByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiX0N1cnJlbnRDYWxsQXN5bmNJbnZvY2F0aW9uIiwiX3NldCIsImhhc0NhbGxBc3luY1BhcmVudCIsImFwcGx5QXN5bmMiLCJpc0Zyb21DYWxsQXN5bmMiLCJjYXRjaCIsImN1cnJlbnRNZXRob2RJbnZvY2F0aW9uIiwiY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsIm1ha2VScGNTZWVkIiwiciIsIl91cmxGb3JTZXNzaW9uIiwic2Vzc2lvbklkIiwiY2xpZW50U3VwcG9ydGVkVmVyc2lvbnMiLCJzZXJ2ZXJTdXBwb3J0ZWRWZXJzaW9ucyIsImNvcnJlY3RWZXJzaW9uIiwiZmluZCIsIl9jYWxjdWxhdGVWZXJzaW9uIiwiaXNDbGllbnRTYWZlIiwib3JpZ2luYWxNZXNzYWdlIiwiZGV0YWlscyIsIl9leHBlY3RlZEJ5VGVzdCIsInN0YWNrIiwic2FuaXRpemVkRXJyb3IiLCJkZXNjcmlwdGlvbiIsIk1hdGNoIiwiX2ZhaWxJZkFyZ3VtZW50c0FyZU5vdEFsbENoZWNrZWQiLCJiZWdpbldyaXRlIiwicmV0aXJlZCIsImNvbW1pdHRlZCIsImZpcmVkIiwib3V0c3RhbmRpbmdfd3JpdGVzIiwiX21heWJlRmlyZSIsImFybWVkIiwib25CZWZvcmVGaXJlIiwiYmVmb3JlX2ZpcmVfY2FsbGJhY2tzIiwiY29tcGxldGlvbl9jYWxsYmFja3MiLCJfYXJtQW5kV2FpdCIsInJlc29sdmVyIiwicmV0dXJuVmFsdWUiLCJhcm1BbmRXYWl0IiwiaW52b2tlQ2FsbGJhY2siLCJiZWZvcmVDYWxsYmFja3MiLCJFbnZpcm9ubWVudFZhcmlhYmxlIiwiX0Nyb3NzYmFyIiwibmV4dElkIiwibGlzdGVuZXJzQnlDb2xsZWN0aW9uIiwibGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnQiLCJmYWN0UGFja2FnZSIsImZhY3ROYW1lIiwiX2NvbGxlY3Rpb25Gb3JNZXNzYWdlIiwidHJpZ2dlciIsInJlY29yZCIsImZpcmUiLCJub3RpZmljYXRpb24iLCJsaXN0ZW5lcnNGb3JDb2xsZWN0aW9uIiwiY2FsbGJhY2tJZHMiLCJsIiwiX21hdGNoZXMiLCJPYmplY3RJRCIsImVxdWFscyIsIl9JbnZhbGlkYXRpb25Dcm9zc2JhciIsIkREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMIiwicmVmcmVzaCIsIkR1bW15RG9jdW1lbnRWaWV3IiwiY2xlYXJGaWVsZCIsImNoYW5nZUNvbGxlY3RvciIsImNoYW5nZUZpZWxkIiwiaXNBZGQiLCJleGlzdHNJbiIsImRhdGFCeUtleSIsInNpemUiLCJwcmV2aW91cyIsImRpZmZEb2N1bWVudCIsIm5vd0RWIiwicHJldkRWIiwiZGlmZk9iamVjdHMiLCJwcmV2Iiwibm93IiwiY2hhbmdlZFJlc3VsdCIsInByZWNlZGVuY2VMaXN0Iiwic2Vzc2lvbkNhbGxiYWNrcyIsInJlbW92ZWRWYWx1ZSIsInByZWNlZGVuY2UiLCJzcGxpY2UiLCJlbHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxZQUFZLFFBQVEsU0FBUztBQUV0Qzs7Ozs7OztDQU9DLEdBQ0QsT0FBTyxNQUFNQywrQkFBK0JEO0lBa0QxQ0UsTUFBTUMsSUFBSSxFQUFFO1FBQ1YsSUFBSSxJQUFJLENBQUNDLEdBQUcsRUFBRSxJQUFJLENBQUNBLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDRjtJQUM5QjtJQUVBRSxLQUFLRixJQUFJLEVBQUU7UUFDVCxJQUFJLENBQUNELEtBQUssQ0FBQ0M7SUFDYjtJQUVBRyxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUNGLEdBQUcsRUFBRSxJQUFJLENBQUNBLEdBQUcsQ0FBQ0UsS0FBSztJQUM5QjtJQUVBQyxvQkFBb0JDLE9BQU8sRUFBRTtRQUMzQixJQUFJLElBQUksQ0FBQ0MsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQ0EsVUFBVSxDQUFDQyxVQUFVLENBQUNGO1FBQzdCO0lBQ0Y7SUFqRUEsWUFBWUcsRUFBRSxFQUFFQyxHQUFHLEVBQUVDLFNBQVMsRUFBRUMsY0FBYyxDQUFFO1FBQzlDLEtBQUs7UUFDTCxJQUFJLENBQUNWLEdBQUcsR0FBR087UUFDWCxJQUFJLENBQUNGLFVBQVUsR0FBR0k7UUFDbEIsSUFBSSxDQUFDRSxRQUFRLEdBQUc7UUFDaEIsSUFBSSxDQUFDQyxF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QixNQUFNTCxlQUFlaEUsSUFBSSxDQUN2QixDQUFDbUUsYUFBZUEsV0FBV25SLGtCQUFrQixLQUFLQTtRQUV0RDtRQUVBLElBQUlxUixLQUFLO1lBQ1AsSUFBSUEsUUFBUUwsY0FBYyxDQUFDLEVBQUUsSUFBSSxDQUFDOUksTUFBTTBILE1BQU0sQ0FBQy9aLE9BQU93YixJQUFJeGIsS0FBSyxHQUFHO2dCQUNoRSx5REFBeUQ7Z0JBQ3pEcWEsZUFBZSxDQUFDdGdCLElBQUksR0FBR2lHO1lBQ3pCO1lBQ0F3YixJQUFJeGIsS0FBSyxHQUFHQTtRQUNkLE9BQU87WUFDTCxxREFBcUQ7WUFDckRtYixlQUFldmIsSUFBSSxDQUFDO2dCQUFFdUssb0JBQW9CQTtnQkFBb0JuSyxPQUFPQTtZQUFNO1FBQzdFO0lBQ0Y7SUEzRkEsYUFBYztRQUhkLHVCQUFRd2EsWUFBUjtRQUNBLHVCQUFRQyxhQUFSO1FBR0UsSUFBSSxDQUFDRCxRQUFRLEdBQUcsSUFBSTlHLE9BQU8sNEJBQTRCO1FBQ3ZELGdCQUFnQjtRQUNoQixJQUFJLENBQUMrRyxTQUFTLEdBQUcsSUFBSTdULE9BQU8scURBQXFEO0lBQ25GO0FBd0ZGIiwiZmlsZSI6Ii9wYWNrYWdlcy9kZHAtc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBhIHJhdyBXZWJTb2NrZXQgY29ubmVjdGlvbiB0aGF0IHByb3ZpZGVzIHRoZSBzYW1lXG4gKiBpbnRlcmZhY2UgYXMgYSBTb2NrSlMgY29ubmVjdGlvbiwgYXMgZXhwZWN0ZWQgYnkgX29uQ29ubmVjdGlvblxuICogYW5kIGxpdmVkYXRhX3NlcnZlci5qcy5cbiAqXG4gKiBVc2VkIGJ5IG5vbi1Tb2NrSlMgdHJhbnNwb3J0cyB0aGF0IHByb3ZpZGUgYSBzdGFuZGFyZCBXZWJTb2NrZXRcbiAqIG9iamVjdC4gVGhlIHV3cyB0cmFuc3BvcnQgaW1wbGVtZW50cyBpdHMgb3duIHNvY2tldCBpbnRlcmZhY2UgZGlyZWN0bHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBSYXdXZWJTb2NrZXRDb25uZWN0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3Iod3MsIHJlcSwgcmF3U29ja2V0LCBtZXNzYWdlQWRhcHRlcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fd3MgPSB3cztcbiAgICB0aGlzLl9yYXdTb2NrZXQgPSByYXdTb2NrZXQ7XG4gICAgdGhpcy5wcm90b2NvbCA9ICd3ZWJzb2NrZXQtcmF3JztcbiAgICB0aGlzLmlkID0gUmFuZG9tLmlkKCk7XG5cbiAgICAvLyBDb3B5IHJlbGV2YW50IGhlYWRlcnMgKHNhbWUgc2V0IGFzIFNvY2tKUyB0cmFuc3BvcnQuanMpXG4gICAgdGhpcy5oZWFkZXJzID0ge307XG4gICAgY29uc3QgaGVhZGVyS2V5cyA9IFtcbiAgICAgICdyZWZlcmVyJywgJ3gtY2xpZW50LWlwJywgJ3gtZm9yd2FyZGVkLWZvcicsXG4gICAgICAneC1mb3J3YXJkZWQtaG9zdCcsICd4LWZvcndhcmRlZC1wb3J0JywgJ3gtY2x1c3Rlci1jbGllbnQtaXAnLFxuICAgICAgJ3ZpYScsICd4LXJlYWwtaXAnLCAneC1mb3J3YXJkZWQtcHJvdG8nLCAneC1zc2wnLCAnZG50JyxcbiAgICAgICdob3N0JywgJ3VzZXItYWdlbnQnLCAnYWNjZXB0LWxhbmd1YWdlJ1xuICAgIF07XG4gICAgZm9yIChjb25zdCBrZXkgb2YgaGVhZGVyS2V5cykge1xuICAgICAgaWYgKHJlcS5oZWFkZXJzW2tleV0pIHRoaXMuaGVhZGVyc1trZXldID0gcmVxLmhlYWRlcnNba2V5XTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbW90ZUFkZHJlc3MgPSByYXdTb2NrZXQucmVtb3RlQWRkcmVzcztcbiAgICB0aGlzLnJlbW90ZVBvcnQgPSByYXdTb2NrZXQucmVtb3RlUG9ydDtcbiAgICB0aGlzLnVybCA9IHJlcS51cmw7XG5cbiAgICAvLyBDb21wYXRpYmlsaXR5IHdpdGggU29ja0pTIGludGVybmFscyB0aGF0IHN0cmVhbV9zZXJ2ZXIgYWNjZXNzZXNcbiAgICB0aGlzLl9zZXNzaW9uID0ge1xuICAgICAgcmVjdjoge1xuICAgICAgICBjb25uZWN0aW9uOiByYXdTb2NrZXQsXG4gICAgICAgIHByb3RvY29sOiAnd2Vic29ja2V0LXJhdydcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gbWVzc2FnZUFkYXB0ZXIgZXh0cmFjdHMgdGhlIHN0cmluZyBkYXRhIGZyb20gdGhlIHRyYW5zcG9ydCdzIG1lc3NhZ2UgZXZlbnQuXG4gICAgLy8gRWFjaCB0cmFuc3BvcnQgaGFzIGEgZGlmZmVyZW50IG1lc3NhZ2UgZXZlbnQgc2lnbmF0dXJlLlxuICAgIHdzLm9uKCdtZXNzYWdlJywgKC4uLmFyZ3MpID0+IHtcbiAgICAgIHZhciBzdHIgPSBtZXNzYWdlQWRhcHRlciguLi5hcmdzKTtcbiAgICAgIGlmIChzdHIgIT0gbnVsbCkgdGhpcy5lbWl0KCdkYXRhJywgc3RyKTtcbiAgICB9KTtcblxuICAgIHdzLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcbiAgICAgIHRoaXMuX3dzID0gbnVsbDtcbiAgICB9KTtcblxuICAgIHdzLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcbiAgICAgIHRoaXMuX3dzID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHdyaXRlKGRhdGEpIHtcbiAgICBpZiAodGhpcy5fd3MpIHRoaXMuX3dzLnNlbmQoZGF0YSk7XG4gIH1cblxuICBzZW5kKGRhdGEpIHtcbiAgICB0aGlzLndyaXRlKGRhdGEpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3dzKSB0aGlzLl93cy5jbG9zZSgpO1xuICB9XG5cbiAgc2V0V2Vic29ja2V0VGltZW91dCh0aW1lb3V0KSB7XG4gICAgaWYgKHRoaXMuX3Jhd1NvY2tldCkge1xuICAgICAgdGhpcy5fcmF3U29ja2V0LnNldFRpbWVvdXQodGltZW91dCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG4vKipcbiAqIFNvY2tKUyB0cmFuc3BvcnQg4oCUIHRoZSB0cmFkaXRpb25hbCBNZXRlb3IgdHJhbnNwb3J0LlxuICogUHJvdmlkZXMgV2ViU29ja2V0IHdpdGggYXV0b21hdGljIGZhbGxiYWNrIHRvIEhUVFAgcG9sbGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvY2tKU1RyYW5zcG9ydCgpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnc29ja2pzJyxcbiAgICBzZXR1cChodHRwU2VydmVyLCBwYXRoUHJlZml4LCBvcHRpb25zKSB7XG4gICAgICB2YXIgZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgIHZhciBzb2NranMgPSBOcG0ucmVxdWlyZSgnc29ja2pzJyk7XG4gICAgICB2YXIgcHJlZml4ID0gcGF0aFByZWZpeCArICcvc29ja2pzJztcblxuICAgICAgUm91dGVQb2xpY3kuZGVjbGFyZShwcmVmaXggKyAnLycsICduZXR3b3JrJyk7XG5cbiAgICAgIHZhciBzZXJ2ZXJPcHRpb25zID0ge1xuICAgICAgICBwcmVmaXg6IHByZWZpeCxcbiAgICAgICAgbG9nOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAvLyB0aGlzIGlzIHRoZSBkZWZhdWx0LCBidXQgd2UgY29kZSBpdCBleHBsaWNpdGx5IGJlY2F1c2Ugd2UgZGVwZW5kXG4gICAgICAgIC8vIG9uIGl0IGluIHN0cmVhbV9jbGllbnQ6SEVBUlRCRUFUX1RJTUVPVVRcbiAgICAgICAgaGVhcnRiZWF0X2RlbGF5OiA0NTAwMCxcbiAgICAgICAgLy8gVGhlIGRlZmF1bHQgZGlzY29ubmVjdF9kZWxheSBpcyA1IHNlY29uZHMsIGJ1dCBpZiB0aGUgc2VydmVyIGVuZHMgdXAgQ1BVXG4gICAgICAgIC8vIGJvdW5kIGZvciB0aGF0IG11Y2ggdGltZSwgU29ja0pTIG1pZ2h0IG5vdCBub3RpY2UgdGhhdCB0aGUgdXNlciBoYXNcbiAgICAgICAgLy8gcmVjb25uZWN0ZWQgYmVjYXVzZSB0aGUgdGltZXIgKG9mIGRpc2Nvbm5lY3RfZGVsYXkgbXMpIGNhbiBmaXJlIGJlZm9yZVxuICAgICAgICAvLyBTb2NrSlMgcHJvY2Vzc2VzIHRoZSBuZXcgY29ubmVjdGlvbi4gRXZlbnR1YWxseSB3ZSdsbCBmaXggdGhpcyBieSBub3RcbiAgICAgICAgLy8gY29tYmluaW5nIENQVS1oZWF2eSBwcm9jZXNzaW5nIHdpdGggU29ja0pTIHRlcm1pbmF0aW9uIChlZyBhIHByb3h5IHdoaWNoXG4gICAgICAgIC8vIGNvbnZlcnRzIHRvIFVuaXggc29ja2V0cykgYnV0IGZvciBub3csIHJhaXNlIHRoZSBkZWxheS5cbiAgICAgICAgZGlzY29ubmVjdF9kZWxheTogNjAgKiAxMDAwLFxuICAgICAgICAvLyBBbGxvdyBkaXNhYmxpbmcgb2YgQ09SUyByZXF1ZXN0cyB0byBhZGRyZXNzXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy84MzE3LlxuICAgICAgICBkaXNhYmxlX2NvcnM6ICEhcHJvY2Vzcy5lbnYuRElTQUJMRV9TT0NLSlNfQ09SUyxcbiAgICAgICAgLy8gU2V0IHRoZSBVU0VfSlNFU1NJT05JRCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBlbmFibGUgc2V0dGluZyB0aGVcbiAgICAgICAgLy8gSlNFU1NJT05JRCBjb29raWUuIFRoaXMgaXMgdXNlZnVsIGZvciBzZXR0aW5nIHVwIHByb3hpZXMgd2l0aFxuICAgICAgICAvLyBzZXNzaW9uIGFmZmluaXR5LlxuICAgICAgICBqc2Vzc2lvbmlkOiAhIXByb2Nlc3MuZW52LlVTRV9KU0VTU0lPTklEXG4gICAgICB9O1xuXG4gICAgICAvLyBJZiB5b3Uga25vdyB5b3VyIHNlcnZlciBlbnZpcm9ubWVudCAoZWcsIHByb3hpZXMpIHdpbGwgcHJldmVudCB3ZWJzb2NrZXRzXG4gICAgICAvLyBmcm9tIGV2ZXIgd29ya2luZywgc2V0ICRESVNBQkxFX1dFQlNPQ0tFVFMgYW5kIFNvY2tKUyBjbGllbnRzIChpZSxcbiAgICAgIC8vIGJyb3dzZXJzKSB3aWxsIG5vdCB3YXN0ZSB0aW1lIGF0dGVtcHRpbmcgdG8gdXNlIHRoZW0uXG4gICAgICAvLyAoWW91ciBzZXJ2ZXIgd2lsbCBzdGlsbCBoYXZlIGEgL3dlYnNvY2tldCBlbmRwb2ludC4pXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuRElTQUJMRV9XRUJTT0NLRVRTKSB7XG4gICAgICAgIHNlcnZlck9wdGlvbnMud2Vic29ja2V0ID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXJPcHRpb25zLmZheWVfc2VydmVyX29wdGlvbnMgPSB7XG4gICAgICAgICAgZXh0ZW5zaW9uczogb3B0aW9ucy53ZWJzb2NrZXRFeHRlbnNpb25zKClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlcnZlciA9IHNvY2tqcy5jcmVhdGVTZXJ2ZXIoc2VydmVyT3B0aW9ucyk7XG5cbiAgICAgIC8vIEluc3RhbGwgdGhlIHNvY2tqcyBoYW5kbGVycywgYnV0IHdlIHdhbnQgdG8ga2VlcCBhcm91bmQgb3VyIG93biBwYXJ0aWN1bGFyXG4gICAgICAvLyByZXF1ZXN0IGhhbmRsZXIgdGhhdCBhZGp1c3RzIGlkbGUgdGltZW91dHMgd2hpbGUgd2UgaGF2ZSBhbiBvdXRzdGFuZGluZ1xuICAgICAgLy8gcmVxdWVzdC4gIFRoaXMgY29tcGVuc2F0ZXMgZm9yIHRoZSBmYWN0IHRoYXQgc29ja2pzIHJlbW92ZXMgYWxsIGxpc3RlbmVyc1xuICAgICAgLy8gZm9yIFwicmVxdWVzdFwiIHRvIGFkZCBpdHMgb3duLlxuICAgICAgaHR0cFNlcnZlci5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICAgJ3JlcXVlc3QnLCBXZWJBcHAuX3RpbWVvdXRBZGp1c3RtZW50UmVxdWVzdENhbGxiYWNrKTtcbiAgICAgIHNlcnZlci5pbnN0YWxsSGFuZGxlcnMoaHR0cFNlcnZlcik7XG4gICAgICBodHRwU2VydmVyLmFkZExpc3RlbmVyKFxuICAgICAgICAncmVxdWVzdCcsIFdlYkFwcC5fdGltZW91dEFkanVzdG1lbnRSZXF1ZXN0Q2FsbGJhY2spO1xuXG4gICAgICAvLyBTdXBwb3J0IHRoZSAvd2Vic29ja2V0IGVuZHBvaW50IGJ5IHJlZGlyZWN0aW5nIHRvIC9zb2NranMvd2Vic29ja2V0XG4gICAgICByZWRpcmVjdFdlYnNvY2tldEVuZHBvaW50KGh0dHBTZXJ2ZXIsIHBhdGhQcmVmaXgsIHByZWZpeCk7XG5cbiAgICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgZW1pdHRlci5lbWl0KCdjb25uZWN0aW9uJywgc29ja2V0KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZW1pdHRlcjtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmVkaXJlY3QgL3dlYnNvY2tldCB0byAvc29ja2pzL3dlYnNvY2tldCBpbiBvcmRlciB0byBub3QgZXhwb3NlXG4gKiBzb2NranMgdG8gY2xpZW50cyB0aGF0IHdhbnQgdG8gdXNlIHJhdyB3ZWJzb2NrZXRzLlxuICovXG5mdW5jdGlvbiByZWRpcmVjdFdlYnNvY2tldEVuZHBvaW50KGh0dHBTZXJ2ZXIsIHBhdGhQcmVmaXgsIHNvY2tqc1ByZWZpeCkge1xuICAvLyBVbmZvcnR1bmF0ZWx5IHdlIGNhbid0IHVzZSBhIGNvbm5lY3QgbWlkZGxld2FyZSBoZXJlIHNpbmNlXG4gIC8vIHNvY2tqcyBpbnN0YWxscyBpdHNlbGYgcHJpb3IgdG8gYWxsIGV4aXN0aW5nIGxpc3RlbmVyc1xuICAvLyAobWVhbmluZyBwcmlvciB0byBhbnkgY29ubmVjdCBtaWRkbGV3YXJlcykgc28gd2UgbmVlZCB0byB0YWtlXG4gIC8vIGFuIGFwcHJvYWNoIHNpbWlsYXIgdG8gb3ZlcnNoYWRvd0xpc3RlbmVycyBpblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vc29ja2pzL3NvY2tqcy1ub2RlL2Jsb2IvY2Y4MjBjNTVhZjZhOTk1M2UxNjU1ODU1NWEzMWRlY2VhNTU0ZjcwZS9zcmMvdXRpbHMuY29mZmVlXG4gIFsncmVxdWVzdCcsICd1cGdyYWRlJ10uZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICB2YXIgb2xkSHR0cFNlcnZlckxpc3RlbmVycyA9IGh0dHBTZXJ2ZXIubGlzdGVuZXJzKGV2ZW50KS5zbGljZSgwKTtcbiAgICBodHRwU2VydmVyLnJlbW92ZUFsbExpc3RlbmVycyhldmVudCk7XG5cbiAgICAvLyByZXF1ZXN0IGFuZCB1cGdyYWRlIGhhdmUgZGlmZmVyZW50IGFyZ3VtZW50cyBwYXNzZWQgYnV0XG4gICAgLy8gd2Ugb25seSBjYXJlIGFib3V0IHRoZSBmaXJzdCBvbmUgd2hpY2ggaXMgYWx3YXlzIHJlcXVlc3RcbiAgICB2YXIgbmV3TGlzdGVuZXIgPSBmdW5jdGlvbihyZXF1ZXN0IC8qLCBtb3JlQXJndW1lbnRzICovKSB7XG4gICAgICAvLyBTdG9yZSBhcmd1bWVudHMgZm9yIHVzZSB3aXRoaW4gdGhlIGNsb3N1cmUgYmVsb3dcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAvLyBSZXdyaXRlIC93ZWJzb2NrZXQgYW5kIC93ZWJzb2NrZXQvIHVybHMgdG8gL3NvY2tqcy93ZWJzb2NrZXQgd2hpbGVcbiAgICAgIC8vIHByZXNlcnZpbmcgcXVlcnkgc3RyaW5nLlxuICAgICAgdmFyIHBhcnNlZFVybCA9IG5ldyBVUkwocmVxdWVzdC51cmwsICdodHRwOi8vbG9jYWxob3N0Jyk7XG4gICAgICBpZiAocGFyc2VkVXJsLnBhdGhuYW1lID09PSBwYXRoUHJlZml4ICsgJy93ZWJzb2NrZXQnIHx8XG4gICAgICAgICAgcGFyc2VkVXJsLnBhdGhuYW1lID09PSBwYXRoUHJlZml4ICsgJy93ZWJzb2NrZXQvJykge1xuICAgICAgICBwYXJzZWRVcmwucGF0aG5hbWUgPSBzb2NranNQcmVmaXggKyAnL3dlYnNvY2tldCc7XG4gICAgICAgIHJlcXVlc3QudXJsID0gcGFyc2VkVXJsLnBhdGhuYW1lICsgcGFyc2VkVXJsLnNlYXJjaDtcbiAgICAgIH1cbiAgICAgIG9sZEh0dHBTZXJ2ZXJMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihvbGRMaXN0ZW5lcikge1xuICAgICAgICBvbGRMaXN0ZW5lci5hcHBseShodHRwU2VydmVyLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgaHR0cFNlcnZlci5hZGRMaXN0ZW5lcihldmVudCwgbmV3TGlzdGVuZXIpO1xuICB9KTtcbn1cbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgbmV0IGZyb20gJ25vZGU6bmV0JztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIHZpYSBNZXRlb3Iuc2V0dGluZ3M6XG4gKiAgIHsgXCJwYWNrYWdlc1wiOiB7IFwiZGRwLXNlcnZlclwiOiB7IFwidHJhbnNwb3J0XCI6IFwidXdzXCIsIFwidXdzXCI6IHsgXCJwb3J0XCI6IDUwMDEsIFwiaG9zdFwiOiBcIjEyNy4wLjAuMVwiLCBcInBheWxvYWRMZW5ndGhcIjogNDgsIFwidGltZW91dFwiOiA0NSB9IH0gfSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVd3NUcmFuc3BvcnQoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3V3cycsXG4gICAgc2V0dXAoaHR0cFNlcnZlciwgcGF0aFByZWZpeCwgb3B0aW9ucykge1xuICAgICAgY29uc3QgZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgIGNvbnN0IHV3cyA9IE5wbS5yZXF1aXJlKCd1V2ViU29ja2V0cy5qcycpO1xuXG4gICAgICBjb25zdCBzZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/LlsnZGRwLXNlcnZlciddPy51d3MgfHwge307XG4gICAgICBjb25zdCB1d3NQb3J0ID0gTnVtYmVyKHNldHRpbmdzLnBvcnQpIHx8IDUwMDE7XG4gICAgICBjb25zdCB1d3NQYXlsb2FkTGVuZ3RoID0gTnVtYmVyKHNldHRpbmdzLnBheWxvYWRMZW5ndGgpIHx8IDQ4O1xuICAgICAgY29uc3QgdXdzU29ja2V0VGltZW91dCA9IE51bWJlcihzZXR0aW5ncy50aW1lb3V0KSB8fCA0NTtcbiAgICAgIGNvbnN0IHV3c0hvc3QgPSBzZXR0aW5ncy5ob3N0IHx8ICcxMjcuMC4wLjEnO1xuICAgICAgY29uc3QgdXdzUHJveHlIb3N0ID0gdXdzSG9zdCA9PT0gJzAuMC4wLjAnXG4gICAgICAgID8gJzEyNy4wLjAuMSdcbiAgICAgICAgOiB1d3NIb3N0ID09PSAnOjonXG4gICAgICAgICAgPyAnOjoxJ1xuICAgICAgICAgIDogdXdzSG9zdDtcblxuICAgICAgLy8gV2Vha01hcHMgZm9yIGV2ZW50IGxpc3RlbmVycyAodVdTIHNvY2tldHMgZG9uJ3QgaGF2ZSBFdmVudEVtaXR0ZXIpLlxuICAgICAgLy8gV2Vha01hcCBhbGxvd3MgYXV0b21hdGljIEdDIGlmIHVXUyBkcm9wcyBhIHNvY2tldCB3aXRob3V0IGZpcmluZyBjbG9zZS5cbiAgICAgIC8vIFZhbHVlcyBhcmUgYXJyYXlzIHNvIG11bHRpcGxlIGNvbnN1bWVycyAoZS5nLiBzdHJlYW1fc2VydmVyIGFuZFxuICAgICAgLy8gbGl2ZWRhdGFfc2VydmVyKSBjYW4gZWFjaCByZWdpc3RlciBhICdjbG9zZScgb3IgJ2RhdGEnIGxpc3RlbmVyLlxuICAgICAgY29uc3QgY2xvc2VMaXN0ZW5lcnMgPSBuZXcgV2Vha01hcCgpO1xuICAgICAgY29uc3QgbWVzc2FnZUxpc3RlbmVycyA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgIGNvbnN0IHV3c0FwcCA9IHV3cy5BcHAoKTtcblxuICAgICAgdXdzQXBwLmdldCgnLyonLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHJlcy5lbmQoJ09LJyk7XG4gICAgICB9KTtcblxuICAgICAgdXdzQXBwLndzKCcvKicsIHtcbiAgICAgICAgbWF4QmFja3ByZXNzdXJlOiAxNiAqIDEwMjQgKiAxMDI0LFxuICAgICAgICBtYXhQYXlsb2FkTGVuZ3RoOiB1d3NQYXlsb2FkTGVuZ3RoICogMTAyNCxcbiAgICAgICAgaWRsZVRpbWVvdXQ6IHV3c1NvY2tldFRpbWVvdXQsXG5cbiAgICAgICAgb3Blbihzb2NrZXQpIHtcbiAgICAgICAgICAvLyBBZGFwdCB1V1Mgc29ja2V0IHRvIHRoZSBpbnRlcmZhY2UgZXhwZWN0ZWQgYnkgX29uQ29ubmVjdGlvbi5cbiAgICAgICAgICAvLyB1V1Mgc29ja2V0cyBkb24ndCBoYXZlIEV2ZW50RW1pdHRlciBtZXRob2RzLCBzbyB3ZSBwcm92aWRlIHRoZW0uXG4gICAgICAgICAgc29ja2V0Lm9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgY29uc3QgbWFwID0gZXZlbnQgPT09ICdjbG9zZScgPyBjbG9zZUxpc3RlbmVyc1xuICAgICAgICAgICAgICA6IGV2ZW50ID09PSAnZGF0YScgPyBtZXNzYWdlTGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgaWYgKCFtYXApIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KHNvY2tldCk7XG4gICAgICAgICAgICBpZiAobGlzdCkge1xuICAgICAgICAgICAgICBsaXN0LnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWFwLnNldChzb2NrZXQsIFtjYWxsYmFja10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzb2NrZXQuc2V0V2Vic29ja2V0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIHVXUyBtYW5hZ2VzIGl0cyBvd24gdGltZW91dHMgaW50ZXJuYWxseVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzb2NrZXQucHJvdG9jb2wgPSAnd2Vic29ja2V0LXJhdyc7XG4gICAgICAgICAgc29ja2V0LmhlYWRlcnMgPSBzb2NrZXQuaGVhZGVycyB8fCB7fTtcblxuICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnY29ubmVjdGlvbicsIHNvY2tldCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBncmFkZShyZXMsIHJlcSwgY29udGV4dCkge1xuICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB7fTtcbiAgICAgICAgICByZXEuZm9yRWFjaCgoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaGVhZGVyc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXMudXBncmFkZShcbiAgICAgICAgICAgIHsgaGVhZGVycyB9LFxuICAgICAgICAgICAgcmVxLmdldEhlYWRlcignc2VjLXdlYnNvY2tldC1rZXknKSxcbiAgICAgICAgICAgIHJlcS5nZXRIZWFkZXIoJ3NlYy13ZWJzb2NrZXQtcHJvdG9jb2wnKSxcbiAgICAgICAgICAgIHJlcS5nZXRIZWFkZXIoJ3NlYy13ZWJzb2NrZXQtZXh0ZW5zaW9ucycpLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlKHNvY2tldCkge1xuICAgICAgICAgIHNvY2tldC5pc0Nsb3NlZCA9IHRydWU7XG4gICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gY2xvc2VMaXN0ZW5lcnMuZ2V0KHNvY2tldCk7XG4gICAgICAgICAgY2xvc2VMaXN0ZW5lcnMuZGVsZXRlKHNvY2tldCk7XG4gICAgICAgICAgbWVzc2FnZUxpc3RlbmVycy5kZWxldGUoc29ja2V0KTtcbiAgICAgICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNiIG9mIGxpc3RlbmVycykge1xuICAgICAgICAgICAgICB0cnkgeyBjYigpOyB9IGNhdGNoIChlKSB7IE1ldGVvci5fZGVidWcoJ3V3cyBjbG9zZSBsaXN0ZW5lciB0aHJldycsIGUpOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1lc3NhZ2Uoc29ja2V0LCBtZXNzYWdlLCBpc0JpbmFyeSkge1xuICAgICAgICAgIGlmIChpc0JpbmFyeSkgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IG1lc3NhZ2VMaXN0ZW5lcnMuZ2V0KHNvY2tldCk7XG4gICAgICAgICAgaWYgKCFsaXN0ZW5lcnMgfHwgbGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IHN0ciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UpLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgICAgICAgIGZvciAoY29uc3QgY2Igb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICB0cnkgeyBjYihzdHIpOyB9IGNhdGNoIChlKSB7IE1ldGVvci5fZGVidWcoJ3V3cyBkYXRhIGxpc3RlbmVyIHRocmV3JywgZSk7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBQYXNzIExJQlVTX0xJU1RFTl9FWENMVVNJVkVfUE9SVCBzbyB1V1MgZG9lcyBub3QgZW5hYmxlIFNPX1JFVVNFUE9SVFxuICAgICAgLy8gb24gdGhpcyBsaXN0ZW5pbmcgc29ja2V0LiBXaXRoIFNPX1JFVVNFUE9SVCAodVdTJ3MgZGVmYXVsdCksIHR3b1xuICAgICAgLy8gTWV0ZW9yIHByb2Nlc3NlcyBpbiB0aGUgc2FtZSBrZXJuZWwgbmV0d29yayBuYW1lc3BhY2Ugd2lsbCBib3RoXG4gICAgICAvLyBzdWNjZWVkIGluIGJpbmRpbmcgdGhlIHNhbWUgYChob3N0LCBwb3J0KWAgdHVwbGUsIGFuZCB0aGUga2VybmVsXG4gICAgICAvLyB3aWxsIHRoZW4gbG9hZC1iYWxhbmNlIGluYm91bmQgY29ubmVjdGlvbnMgYmV0d2VlbiB0aGVtIOKAlCBzcGxpdHRpbmdcbiAgICAgIC8vIFdTIHVwZ3JhZGUgdHJhZmZpYyBhY3Jvc3MgdW5yZWxhdGVkIGFwcCBwcm9jZXNzZXMuIFdpdGggRVhDTFVTSVZFLFxuICAgICAgLy8gdGhlIHNlY29uZCBpbnN0YW5jZSBnZXRzIEVBRERSSU5VU0UgYW5kIGB0b2tlbmAgaXMgZmFsc2UgaGVyZSwgc29cbiAgICAgIC8vIHdlIHRocm93IGEgbG91ZCwgYWN0aW9uYWJsZSBlcnJvciBpbnN0ZWFkIG9mIHNpbGVudGx5IGxlYWtpbmdcbiAgICAgIC8vIHRyYWZmaWMuIE9wZXJhdG9ycyBydW5uaW5nIG11bHRpcGxlIE1ldGVvciBpbnN0YW5jZXMgb24gb25lIGhvc3RcbiAgICAgIC8vIG11c3QgcGljayBhIGRpc3RpbmN0IGBNZXRlb3Iuc2V0dGluZ3MucGFja2FnZXNbXCJkZHAtc2VydmVyXCJdLnV3cy5wb3J0YFxuICAgICAgLy8gKG9yIGBob3N0YCkgcGVyIHByb2Nlc3MuXG4gICAgICB1d3NBcHAubGlzdGVuKHV3c0hvc3QsIHV3c1BvcnQsIHV3cy5MSUJVU19MSVNURU5fRVhDTFVTSVZFX1BPUlQsICh0b2tlbikgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ3VXZWJTb2NrZXRzLmpzOiBmYWlsZWQgdG8gbGlzdGVuIG9uICcgKyB1d3NIb3N0ICsgJzonICsgdXdzUG9ydCArXG4gICAgICAgICAgICAnIChhZGRyZXNzIGFscmVhZHkgaW4gdXNlKS4gQW5vdGhlciBNZXRlb3IgaW5zdGFuY2UgaW4gdGhpcyAnICtcbiAgICAgICAgICAgICduZXR3b3JrIG5hbWVzcGFjZSBpcyBhbHJlYWR5IGJvdW5kIHRvIHRoaXMgcG9ydC4gU2V0IGEgJyArXG4gICAgICAgICAgICAnZGlzdGluY3QgTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzW1wiZGRwLXNlcnZlclwiXS51d3MucG9ydCAnICtcbiAgICAgICAgICAgICcob3IgLmhvc3QpIGZvciBlYWNoIGluc3RhbmNlLidcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVqZWN0IHBsYWluIEhUVFAgcmVxdWVzdHMgdG8gL3dlYnNvY2tldFxuICAgICAgV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycy51c2UoZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IHBhdGhuYW1lID0gbmV3IFVSTChyZXEudXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpLnBhdGhuYW1lO1xuICAgICAgICBpZiAocGF0aG5hbWUgPT09IHBhdGhQcmVmaXggKyAnL3dlYnNvY2tldCcgfHxcbiAgICAgICAgICBwYXRobmFtZSA9PT0gcGF0aFByZWZpeCArICcvd2Vic29ja2V0LycpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDQwMCwgeyAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nIH0pO1xuICAgICAgICAgIHJlcy5lbmQoJ05vdCBhIHZhbGlkIHdlYnNvY2tldCByZXF1ZXN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUHJveHkgV2ViU29ja2V0IHVwZ3JhZGUgcmVxdWVzdHMgZnJvbSB0aGUgbWFpbiBIVFRQIHNlcnZlciB0byB1V1MuXG4gICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHVXUyBydW5zIG9uIGl0cyBvd24gcG9ydC5cbiAgICAgIHByb3h5V2Vic29ja2V0VG9Vd3MoaHR0cFNlcnZlciwgcGF0aFByZWZpeCwgdXdzUHJveHlIb3N0LCB1d3NQb3J0KTtcblxuICAgICAgcmV0dXJuIGVtaXR0ZXI7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFByb3h5IEhUVFAgdXBncmFkZSByZXF1ZXN0cyBvbiAvd2Vic29ja2V0IGZyb20gdGhlIG1haW4gTWV0ZW9yIEhUVFAgc2VydmVyXG4gKiB0byB0aGUgdVdlYlNvY2tldHMuanMgc2VydmVyIHZpYSBhIHJhdyBUQ1AgY29ubmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gcHJveHlXZWJzb2NrZXRUb1V3cyhodHRwU2VydmVyLCBwYXRoUHJlZml4LCB1d3NIb3N0LCB1d3NQb3J0KSB7XG4gIGNvbnN0IG9sZFVwZ3JhZGVMaXN0ZW5lcnMgPSBodHRwU2VydmVyLmxpc3RlbmVycygndXBncmFkZScpLnNsaWNlKDApO1xuICBodHRwU2VydmVyLnJlbW92ZUFsbExpc3RlbmVycygndXBncmFkZScpO1xuXG4gIGh0dHBTZXJ2ZXIub24oJ3VwZ3JhZGUnLCBmdW5jdGlvbiAocmVxLCByYXdTb2NrZXQsIGhlYWQpIHtcbiAgICBjb25zdCBwYXRobmFtZSA9IG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKS5wYXRobmFtZTtcblxuICAgIGlmIChwYXRobmFtZSA9PT0gcGF0aFByZWZpeCArICcvd2Vic29ja2V0JyB8fFxuICAgICAgcGF0aG5hbWUgPT09IHBhdGhQcmVmaXggKyAnL3dlYnNvY2tldC8nKSB7XG5cbiAgICAgIC8vIEJ1aWxkIHRoZSByYXcgSFRUUCB1cGdyYWRlIHJlcXVlc3QgdG8gZm9yd2FyZCB0byB1V1NcbiAgICAgIGNvbnN0IHV3c1NvY2tldCA9IG5ldC5jcmVhdGVDb25uZWN0aW9uKHV3c1BvcnQsIHV3c0hvc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGhlYWRlcnMgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXEucmF3SGVhZGVycy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgIGhlYWRlcnMgKz0gcmVxLnJhd0hlYWRlcnNbaV0gKyAnOiAnICsgcmVxLnJhd0hlYWRlcnNbaSArIDFdICsgJ1xcclxcbic7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBodHRwUmVxdWVzdCA9XG4gICAgICAgICAgcmVxLm1ldGhvZCArICcgJyArIHJlcS51cmwgKyAnIEhUVFAvJyArIHJlcS5odHRwVmVyc2lvbiArICdcXHJcXG4nICtcbiAgICAgICAgICBoZWFkZXJzICsgJ1xcclxcbic7XG5cbiAgICAgICAgdXdzU29ja2V0LndyaXRlKGh0dHBSZXF1ZXN0KTtcbiAgICAgICAgaWYgKGhlYWQgJiYgaGVhZC5sZW5ndGgpIHV3c1NvY2tldC53cml0ZShoZWFkKTtcblxuICAgICAgICByYXdTb2NrZXQucGlwZSh1d3NTb2NrZXQpO1xuICAgICAgICB1d3NTb2NrZXQucGlwZShyYXdTb2NrZXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHV3c1NvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyYXdTb2NrZXQud3JpdGFibGUpIHtcbiAgICAgICAgICByYXdTb2NrZXQud3JpdGUoXG4gICAgICAgICAgICAnSFRUUC8xLjEgNTAyIEJhZCBHYXRld2F5XFxyXFxuJyArXG4gICAgICAgICAgICAnQ29ubmVjdGlvbjogY2xvc2VcXHJcXG4nICtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGU6IHRleHQvcGxhaW5cXHJcXG4nICtcbiAgICAgICAgICAgICdcXHJcXG4nICtcbiAgICAgICAgICAgICc1MDIgQmFkIEdhdGV3YXk6IFVwc3RyZWFtIFdlYlNvY2tldCBzZXJ2ZXIgdW5yZWFjaGFibGUuJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmF3U29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIH0pO1xuXG4gICAgICByYXdTb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodXdzU29ja2V0LndyaXRhYmxlKSB1d3NTb2NrZXQuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFBhc3MgdG8gb3RoZXIgdXBncmFkZSBoYW5kbGVycyAoSE1SLCBldGMuKVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRVcGdyYWRlTGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG9sZFVwZ3JhZGVMaXN0ZW5lcnNbaV0uY2FsbChodHRwU2VydmVyLCByZXEsIHJhd1NvY2tldCwgaGVhZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVNvY2tKU1RyYW5zcG9ydCB9IGZyb20gJy4vc29ja2pzLmpzJztcbmltcG9ydCB7IGNyZWF0ZVV3c1RyYW5zcG9ydCB9IGZyb20gJy4vdXdzLmpzJztcblxuY29uc3QgVFJBTlNQT1JUUyA9IHtcbiAgc29ja2pzOiBjcmVhdGVTb2NrSlNUcmFuc3BvcnQsXG4gIHV3czogY3JlYXRlVXdzVHJhbnNwb3J0LFxufTtcblxuY29uc3QgVkFMSURfTkFNRVMgPSBPYmplY3Qua2V5cyhUUkFOU1BPUlRTKTtcblxuLyoqXG4gKiBSZXNvbHZlIHdoaWNoIHRyYW5zcG9ydCB0byB1c2UuIFByaW9yaXR5OlxuICogICAxLiBNZXRlb3Iuc2V0dGluZ3MucGFja2FnZXNbJ2RkcC1zZXJ2ZXInXS50cmFuc3BvcnRcbiAqICAgMi4gRERQX1RSQU5TUE9SVCBlbnYgdmFyXG4gKiAgIDMuIERJU0FCTEVfU09DS0pTPTEg4oaSICd1d3MnIChiYWNrd2FyZCBjb21wYXQpXG4gKiAgIDQuIGRlZmF1bHQ6ICdzb2NranMnXG4gKlxuICogQWxzbyBzZXRzIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uRERQX1RSQU5TUE9SVCBzbyB0aGUgY2xpZW50XG4gKiBrbm93cyB3aGV0aGVyIHRvIGxvYWQgU29ja0pTIG9yIHVzZSBuYXRpdmUgV2ViU29ja2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwb3J0KCkge1xuICB2YXIgbmFtZSA9IHJlc29sdmVUcmFuc3BvcnROYW1lKCk7XG5cbiAgaWYgKCFUUkFOU1BPUlRTW25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1Vua25vd24gRERQIHRyYW5zcG9ydDogXCInICsgbmFtZSArICdcIi4gJyArXG4gICAgICAnVmFsaWQgdHJhbnNwb3J0czogJyArIFZBTElEX05BTUVTLmpvaW4oJywgJylcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvcGFnYXRlIHRvIGNsaWVudCBydW50aW1lIGNvbmZpZyBzbyBicm93c2VyLmpzIGNhbiBkZWNpZGVcbiAgLy8gd2hldGhlciB0byBsb2FkIFNvY2tKUyBvciB1c2UgbmF0aXZlIFdlYlNvY2tldC5cbiAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ERFBfVFJBTlNQT1JUID0gbmFtZTtcblxuICByZXR1cm4gVFJBTlNQT1JUU1tuYW1lXSgpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVHJhbnNwb3J0TmFtZSgpIHtcbiAgLy8gMS4gTWV0ZW9yIHNldHRpbmdzXG4gIHZhciBzZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/LlsnZGRwLXNlcnZlciddO1xuICBpZiAoc2V0dGluZ3MgJiYgc2V0dGluZ3MudHJhbnNwb3J0KSB7XG4gICAgcmV0dXJuIHNldHRpbmdzLnRyYW5zcG9ydDtcbiAgfVxuXG4gIC8vIDIuIEREUF9UUkFOU1BPUlQgZW52IHZhclxuICBpZiAocHJvY2Vzcy5lbnYuRERQX1RSQU5TUE9SVCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5ERFBfVFJBTlNQT1JUO1xuICB9XG5cbiAgLy8gMy4gQmFja3dhcmQgY29tcGF0OiBESVNBQkxFX1NPQ0tKUz0xIOKGkiB1d3NcbiAgaWYgKHByb2Nlc3MuZW52LkRJU0FCTEVfU09DS0pTKSB7XG4gICAgcmV0dXJuICd1d3MnO1xuICB9XG5cbiAgLy8gNC4gRGVmYXVsdFxuICByZXR1cm4gJ3NvY2tqcyc7XG59XG4iLCJpbXBvcnQgb25jZSBmcm9tICdsb2Rhc2gub25jZSc7XG5pbXBvcnQgemxpYiBmcm9tICdub2RlOnpsaWInO1xuaW1wb3J0IHsgZ2V0VHJhbnNwb3J0IH0gZnJvbSAnLi90cmFuc3BvcnRzL2luZGV4LmpzJztcblxuLy8gQnkgZGVmYXVsdCwgd2UgdXNlIHRoZSBwZXJtZXNzYWdlLWRlZmxhdGUgZXh0ZW5zaW9uIHdpdGggZGVmYXVsdFxuLy8gY29uZmlndXJhdGlvbi4gSWYgJFNFUlZFUl9XRUJTT0NLRVRfQ09NUFJFU1NJT04gaXMgc2V0LCB0aGVuIGl0IG11c3QgYmUgdmFsaWRcbi8vIEpTT04uIElmIGl0IHJlcHJlc2VudHMgYSBmYWxzZXkgdmFsdWUsIHRoZW4gd2UgZG8gbm90IHVzZSBwZXJtZXNzYWdlLWRlZmxhdGVcbi8vIGF0IGFsbDsgb3RoZXJ3aXNlLCB0aGUgSlNPTiB2YWx1ZSBpcyB1c2VkIGFzIGFuIGFyZ3VtZW50IHRvIGRlZmxhdGUnc1xuLy8gY29uZmlndXJlIG1ldGhvZDsgc2VlXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmF5ZS9wZXJtZXNzYWdlLWRlZmxhdGUtbm9kZS9ibG9iL21hc3Rlci9SRUFETUUubWRcbi8vXG4vLyAoV2UgZG8gdGhpcyBpbiBhbiBfLm9uY2UgaW5zdGVhZCBvZiBhdCBzdGFydHVwLCBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG9cbi8vIGNyYXNoIHRoZSB0b29sIGR1cmluZyBpc29wYWNrZXQgbG9hZCBpZiB5b3VyIEpTT04gZG9lc24ndCBwYXJzZS4gVGhpcyBpcyBvbmx5XG4vLyBhIHByb2JsZW0gYmVjYXVzZSB0aGUgdG9vbCBoYXMgdG8gbG9hZCB0aGUgRERQIHNlcnZlciBjb2RlIGp1c3QgaW4gb3JkZXIgdG9cbi8vIGJlIGEgRERQIGNsaWVudDsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8zNDUyIC4pXG52YXIgd2Vic29ja2V0RXh0ZW5zaW9ucyA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICB2YXIgZXh0ZW5zaW9ucyA9IFtdO1xuXG4gIHZhciB3ZWJzb2NrZXRDb21wcmVzc2lvbkNvbmZpZyA9IHByb2Nlc3MuZW52LlNFUlZFUl9XRUJTT0NLRVRfQ09NUFJFU1NJT04gP1xuICAgIEpTT04ucGFyc2UocHJvY2Vzcy5lbnYuU0VSVkVSX1dFQlNPQ0tFVF9DT01QUkVTU0lPTikgOiB7fTtcblxuICBpZiAod2Vic29ja2V0Q29tcHJlc3Npb25Db25maWcpIHtcbiAgICBleHRlbnNpb25zLnB1c2goTnBtLnJlcXVpcmUoJ3Blcm1lc3NhZ2UtZGVmbGF0ZTInKS5jb25maWd1cmUoe1xuICAgICAgdGhyZXNob2xkOiAxMDI0LFxuICAgICAgbGV2ZWw6IHpsaWIuY29uc3RhbnRzLlpfQkVTVF9TUEVFRCxcbiAgICAgIG1lbUxldmVsOiB6bGliLmNvbnN0YW50cy5aX01JTl9NRU1MRVZFTCxcbiAgICAgIG5vQ29udGV4dFRha2VvdmVyOiB0cnVlLFxuICAgICAgbWF4V2luZG93Qml0czogemxpYi5jb25zdGFudHMuWl9NSU5fV0lORE9XQklUUyxcbiAgICAgIC4uLih3ZWJzb2NrZXRDb21wcmVzc2lvbkNvbmZpZyB8fCB7fSlcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gZXh0ZW5zaW9ucztcbn0pO1xuXG52YXIgcGF0aFByZWZpeCA9IF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgIFwiXCI7XG5cblN0cmVhbVNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLnJlZ2lzdHJhdGlvbl9jYWxsYmFja3MgPSBbXTtcbiAgc2VsZi5vcGVuX3NvY2tldHMgPSBbXTtcblxuICAvLyBSZXNvbHZlIGFuZCBzZXQgdXAgdGhlIGNvbmZpZ3VyZWQgdHJhbnNwb3J0LlxuICB2YXIgdHJhbnNwb3J0ID0gZ2V0VHJhbnNwb3J0KCk7XG4gIHZhciBlbWl0dGVyID0gdHJhbnNwb3J0LnNldHVwKFdlYkFwcC5odHRwU2VydmVyLCBwYXRoUHJlZml4LCB7XG4gICAgd2Vic29ja2V0RXh0ZW5zaW9uczogd2Vic29ja2V0RXh0ZW5zaW9ucyxcbiAgfSk7XG5cbiAgZW1pdHRlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICBzZWxmLl9vbkNvbm5lY3Rpb24oc29ja2V0KTtcbiAgfSk7XG59O1xuXG5PYmplY3QuYXNzaWduKFN0cmVhbVNlcnZlci5wcm90b3R5cGUsIHtcbiAgLy8gU2hhcmVkIGNvbm5lY3Rpb24gaGFuZGxlciB1c2VkIGJ5IGFsbCB0cmFuc3BvcnRzLlxuICBfb25Db25uZWN0aW9uKHNvY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIHNvY2tqcyBzb21ldGltZXMgcGFzc2VzIHVzIG51bGwgaW5zdGVhZCBvZiBhIHNvY2tldCBvYmplY3RcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGd1YXJkIGFnYWluc3QgdGhhdC4gc2VlOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NranMvc29ja2pzLW5vZGUvaXNzdWVzLzEyMVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8xMDQ2OFxuICAgIGlmICghc29ja2V0KSByZXR1cm47XG5cbiAgICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0IGlmIGEgY2xpZW50IGNvbm5lY3RzIHRvIHVzIGFuZCBkb2VzIHRoZSBpbml0aWFsXG4gICAgLy8gV2Vic29ja2V0IGhhbmRzaGFrZSBidXQgbmV2ZXIgZ2V0cyB0byB0aGUgRERQIGhhbmRzaGFrZSwgdGhhdCB3ZVxuICAgIC8vIGV2ZW50dWFsbHkga2lsbCB0aGUgc29ja2V0LiAgT25jZSB0aGUgRERQIGhhbmRzaGFrZSBoYXBwZW5zLCBERFBcbiAgICAvLyBoZWFydGJlYXRpbmcgd2lsbCB3b3JrLiBBbmQgYmVmb3JlIHRoZSBXZWJzb2NrZXQgaGFuZHNoYWtlLCB0aGUgdGltZW91dHNcbiAgICAvLyB3ZSBzZXQgYXQgdGhlIHNlcnZlciBsZXZlbCBpbiB3ZWJhcHBfc2VydmVyLmpzIHdpbGwgd29yay4gQnV0XG4gICAgLy8gV2ViU29ja2V0IGxpYnJhcmllcyBjYWxsIHNldFRpbWVvdXQoMCkgb24gYW55IHNvY2tldCB0aGV5IHRha2Ugb3ZlcixcbiAgICAvLyBzbyB0aGVyZSBpcyBhbiBcImluIGJldHdlZW5cIiBzdGF0ZSB3aGVyZSB0aGlzIGRvZXNuJ3QgaGFwcGVuLiAgV2Ugd29ya1xuICAgIC8vIGFyb3VuZCB0aGlzIGJ5IGV4cGxpY2l0bHkgc2V0dGluZyB0aGUgc29ja2V0IHRpbWVvdXQgdG8gYSByZWxhdGl2ZWx5XG4gICAgLy8gbGFyZ2UgdGltZSBoZXJlLCBhbmQgc2V0dGluZyBpdCBiYWNrIHRvIHplcm8gd2hlbiB3ZSBzZXQgdXAgdGhlXG4gICAgLy8gaGVhcnRiZWF0IGluIGxpdmVkYXRhX3NlcnZlci5qcy5cbiAgICBpZiAoIXNvY2tldC5zZXRXZWJzb2NrZXRUaW1lb3V0KSB7XG4gICAgICBzb2NrZXQuc2V0V2Vic29ja2V0VGltZW91dCA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgICAgIGlmICgoc29ja2V0LnByb3RvY29sID09PSAnd2Vic29ja2V0JyB8fFxuICAgICAgICAgICAgIHNvY2tldC5wcm90b2NvbCA9PT0gJ3dlYnNvY2tldC1yYXcnKVxuICAgICAgICAgICAgJiYgc29ja2V0Ll9zZXNzaW9uLnJlY3YpIHtcbiAgICAgICAgICBzb2NrZXQuX3Nlc3Npb24ucmVjdi5jb25uZWN0aW9uLnNldFRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHNvY2tldC5zZXRXZWJzb2NrZXRUaW1lb3V0KDQ1ICogMTAwMCk7XG5cbiAgICBpZiAoIXNvY2tldC5zZW5kKSB7XG4gICAgICBzb2NrZXQuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHNvY2tldC53cml0ZShkYXRhKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc29ja2V0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub3Blbl9zb2NrZXRzID0gc2VsZi5vcGVuX3NvY2tldHMuZmlsdGVyKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSAhPT0gc29ja2V0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgc2VsZi5vcGVuX3NvY2tldHMucHVzaChzb2NrZXQpO1xuXG4gICAgLy8gb25seSB0byBzZW5kIGEgbWVzc2FnZSBhZnRlciBjb25uZWN0aW9uIG9uIHRlc3RzLCB1c2VmdWwgZm9yXG4gICAgLy8gc29ja2V0LXN0cmVhbS1jbGllbnQvc2VydmVyLXRlc3RzLmpzXG4gICAgaWYgKHByb2Nlc3MuZW52LlRFU1RfTUVUQURBVEEgJiYgcHJvY2Vzcy5lbnYuVEVTVF9NRVRBREFUQSAhPT0gXCJ7fVwiKSB7XG4gICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7IHRlc3RNZXNzYWdlT25Db25uZWN0OiB0cnVlIH0pKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsIGFsbCBvdXIgY2FsbGJhY2tzIHdoZW4gd2UgZ2V0IGEgbmV3IHNvY2tldC4gdGhleSB3aWxsIGRvIHRoZVxuICAgIC8vIHdvcmsgb2Ygc2V0dGluZyB1cCBoYW5kbGVycyBhbmQgc3VjaCBmb3Igc3BlY2lmaWMgbWVzc2FnZXMuXG4gICAgc2VsZi5yZWdpc3RyYXRpb25fY2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayhzb2NrZXQpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIGNhbGwgbXkgY2FsbGJhY2sgd2hlbiBhIG5ldyBzb2NrZXQgY29ubmVjdHMuXG4gIC8vIGFsc28gY2FsbCBpdCBmb3IgYWxsIGN1cnJlbnQgY29ubmVjdGlvbnMuXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5yZWdpc3RyYXRpb25fY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHNlbGYuYWxsX3NvY2tldHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgIGNhbGxiYWNrKHNvY2tldCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gZ2V0IGEgbGlzdCBvZiBhbGwgc29ja2V0c1xuICBhbGxfc29ja2V0czogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhzZWxmLm9wZW5fc29ja2V0cyk7XG4gIH0sXG59KTtcbiIsImltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2guaXNvYmplY3QnO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC5pc3N0cmluZyc7XG5pbXBvcnQgeyBTZXNzaW9uQ29sbGVjdGlvblZpZXcgfSBmcm9tICcuL3Nlc3Npb25fY29sbGVjdGlvbl92aWV3JztcbmltcG9ydCB7IFNlc3Npb25Eb2N1bWVudFZpZXcgfSBmcm9tICcuL3Nlc3Npb25fZG9jdW1lbnRfdmlldyc7XG5cbkREUFNlcnZlciA9IHt9O1xuXG5cbi8vIFB1YmxpY2F0aW9uIHN0cmF0ZWdpZXMgZGVmaW5lIGhvdyB3ZSBoYW5kbGUgZGF0YSBmcm9tIHB1Ymxpc2hlZCBjdXJzb3JzIGF0IHRoZSBjb2xsZWN0aW9uIGxldmVsXG4vLyBUaGlzIGFsbG93cyBzb21lb25lIHRvOlxuLy8gLSBDaG9vc2UgYSB0cmFkZS1vZmYgYmV0d2VlbiBjbGllbnQtc2VydmVyIGJhbmR3aWR0aCBhbmQgc2VydmVyIG1lbW9yeSB1c2FnZVxuLy8gLSBJbXBsZW1lbnQgc3BlY2lhbCAobm9uLW1vbmdvKSBjb2xsZWN0aW9ucyBsaWtlIHZvbGF0aWxlIG1lc3NhZ2UgcXVldWVzXG5jb25zdCBwdWJsaWNhdGlvblN0cmF0ZWdpZXMgPSB7XG4gIC8vIFNFUlZFUl9NRVJHRSBpcyB0aGUgZGVmYXVsdCBzdHJhdGVneS5cbiAgLy8gV2hlbiB1c2luZyB0aGlzIHN0cmF0ZWd5LCB0aGUgc2VydmVyIG1haW50YWlucyBhIGNvcHkgb2YgYWxsIGRhdGEgYSBjb25uZWN0aW9uIGlzIHN1YnNjcmliZWQgdG8uXG4gIC8vIFRoaXMgYWxsb3dzIHVzIHRvIG9ubHkgc2VuZCBkZWx0YXMgb3ZlciBtdWx0aXBsZSBwdWJsaWNhdGlvbnMuXG4gIFNFUlZFUl9NRVJHRToge1xuICAgIHVzZUR1bW15RG9jdW1lbnRWaWV3OiBmYWxzZSxcbiAgICB1c2VDb2xsZWN0aW9uVmlldzogdHJ1ZSxcbiAgICBkb0FjY291bnRpbmdGb3JDb2xsZWN0aW9uOiB0cnVlLFxuICB9LFxuICAvLyBUaGUgTk9fTUVSR0VfTk9fSElTVE9SWSBzdHJhdGVneSByZXN1bHRzIGluIHRoZSBzZXJ2ZXIgc2VuZGluZyBhbGwgcHVibGljYXRpb24gZGF0YVxuICAvLyBkaXJlY3RseSB0byB0aGUgY2xpZW50LiBJdCBkb2VzIG5vdCByZW1lbWJlciB3aGF0IGl0IGhhcyBwcmV2aW91c2x5IHNlbnRcbiAgLy8gdG8gaXQgd2lsbCBub3QgdHJpZ2dlciByZW1vdmVkIG1lc3NhZ2VzIHdoZW4gYSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZC5cbiAgLy8gVGhpcyBzaG91bGQgb25seSBiZSBjaG9zZW4gZm9yIHNwZWNpYWwgdXNlIGNhc2VzIGxpa2Ugc2VuZC1hbmQtZm9yZ2V0IHF1ZXVlcy5cbiAgTk9fTUVSR0VfTk9fSElTVE9SWToge1xuICAgIHVzZUR1bW15RG9jdW1lbnRWaWV3OiBmYWxzZSxcbiAgICB1c2VDb2xsZWN0aW9uVmlldzogZmFsc2UsXG4gICAgZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbjogZmFsc2UsXG4gIH0sXG4gIC8vIE5PX01FUkdFIGlzIHNpbWlsYXIgdG8gTk9fTUVSR0VfTk9fSElTVE9SWSBidXQgdGhlIHNlcnZlciB3aWxsIHJlbWVtYmVyIHRoZSBJRHMgaXQgaGFzXG4gIC8vIHNlbnQgdG8gdGhlIGNsaWVudCBzbyBpdCBjYW4gcmVtb3ZlIHRoZW0gd2hlbiBhIHN1YnNjcmlwdGlvbiBpcyBzdG9wcGVkLlxuICAvLyBUaGlzIHN0cmF0ZWd5IGNhbiBiZSB1c2VkIHdoZW4gYSBjb2xsZWN0aW9uIGlzIG9ubHkgdXNlZCBpbiBhIHNpbmdsZSBwdWJsaWNhdGlvbi5cbiAgTk9fTUVSR0U6IHtcbiAgICB1c2VEdW1teURvY3VtZW50VmlldzogZmFsc2UsXG4gICAgdXNlQ29sbGVjdGlvblZpZXc6IGZhbHNlLFxuICAgIGRvQWNjb3VudGluZ0ZvckNvbGxlY3Rpb246IHRydWUsXG4gIH0sXG4gIC8vIE5PX01FUkdFX01VTFRJIGlzIHNpbWlsYXIgdG8gYE5PX01FUkdFYCwgYnV0IGl0IGRvZXMgdHJhY2sgd2hldGhlciBhIGRvY3VtZW50IGlzXG4gIC8vIHVzZWQgYnkgbXVsdGlwbGUgcHVibGljYXRpb25zLiBUaGlzIGhhcyBzb21lIG1lbW9yeSBvdmVyaGVhZCwgYnV0IGl0IHN0aWxsIGRvZXMgbm90IGRvXG4gIC8vIGRpZmZpbmcgc28gaXQncyBmYXN0ZXIgYW5kIHNsaW1tZXIgdGhhbiBTRVJWRVJfTUVSR0UuXG4gIE5PX01FUkdFX01VTFRJOiB7XG4gICAgdXNlRHVtbXlEb2N1bWVudFZpZXc6IHRydWUsXG4gICAgdXNlQ29sbGVjdGlvblZpZXc6IHRydWUsXG4gICAgZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbjogdHJ1ZVxuICB9XG59O1xuXG5ERFBTZXJ2ZXIucHVibGljYXRpb25TdHJhdGVnaWVzID0gcHVibGljYXRpb25TdHJhdGVnaWVzO1xuXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgY2xhc3Nlczpcbi8vICogU2Vzc2lvbiAtIFRoZSBzZXJ2ZXIncyBjb25uZWN0aW9uIHRvIGEgc2luZ2xlIEREUCBjbGllbnRcbi8vICogU3Vic2NyaXB0aW9uIC0gQSBzaW5nbGUgc3Vic2NyaXB0aW9uIGZvciBhIHNpbmdsZSBjbGllbnRcbi8vICogU2VydmVyIC0gQW4gZW50aXJlIHNlcnZlciB0aGF0IG1heSB0YWxrIHRvID4gMSBjbGllbnQuIEEgRERQIGVuZHBvaW50LlxuLy9cbi8vIFNlc3Npb24gYW5kIFN1YnNjcmlwdGlvbiBhcmUgZmlsZSBzY29wZS4gRm9yIG5vdywgdW50aWwgd2UgZnJlZXplXG4vLyB0aGUgaW50ZXJmYWNlLCBTZXJ2ZXIgaXMgcGFja2FnZSBzY29wZSAoaW4gdGhlIGZ1dHVyZSBpdCBzaG91bGQgYmVcbi8vIGV4cG9ydGVkKS5cblxuXG5ERFBTZXJ2ZXIuX1Nlc3Npb25Eb2N1bWVudFZpZXcgPSBTZXNzaW9uRG9jdW1lbnRWaWV3O1xuXG5ERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGN1cnJlbnRJbnZvY2F0aW9uID0gdGhpcy5fQ3VycmVudFdyaXRlRmVuY2UuZ2V0KCk7XG4gIGlmIChjdXJyZW50SW52b2NhdGlvbikge1xuICAgIHJldHVybiBjdXJyZW50SW52b2NhdGlvbjtcbiAgfVxuICBjdXJyZW50SW52b2NhdGlvbiA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uZ2V0KCk7XG4gIHJldHVybiBjdXJyZW50SW52b2NhdGlvbiA/IGN1cnJlbnRJbnZvY2F0aW9uLmZlbmNlIDogdW5kZWZpbmVkO1xufTtcblxuXG5ERFBTZXJ2ZXIuX1Nlc3Npb25Db2xsZWN0aW9uVmlldyA9IFNlc3Npb25Db2xsZWN0aW9uVmlldztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qIFNlc3Npb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgU2Vzc2lvbiA9IGZ1bmN0aW9uIChzZXJ2ZXIsIHZlcnNpb24sIHNvY2tldCwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuaWQgPSBSYW5kb20uaWQoKTtcblxuICAvLyBob3cgbWFueSBtZXNzYWdlcyB3ZSd2ZSBhY3R1YWxseSBzZW50IChub3QgcXVldWVkIHRvIHNlbmQpIGV4Y2x1ZGluZyBwaW5nL3BvbmdcbiAgLy8gd2UnbGwgdXNlIHRoaXMgdG8gZGV0ZWN0IG1pc21hdGNoIG9mIGRhdGEgb24gcmVjb25uZWN0LlxuICBzZWxmLnNlbnRDb3VudCA9IDA7XG5cbiAgc2VsZi5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gIHNlbGYudmVyc2lvbiA9IHZlcnNpb247XG5cbiAgc2VsZi5pbml0aWFsaXplZCA9IGZhbHNlO1xuICBzZWxmLnNvY2tldCA9IHNvY2tldDtcbiAgc2VsZi5vcHRpb25zID0gb3B0aW9ucztcblxuICAvLyBTZXQgdG8gbnVsbCB3aGVuIHRoZSBzZXNzaW9uIGlzIGRlc3Ryb3llZC4gTXVsdGlwbGUgcGxhY2VzIGJlbG93XG4gIC8vIHVzZSB0aGlzIHRvIGRldGVybWluZSBpZiB0aGUgc2Vzc2lvbiBpcyBhbGl2ZSBvciBub3QuXG4gIHNlbGYuaW5RdWV1ZSA9IG5ldyBNZXRlb3IuX0RvdWJsZUVuZGVkUXVldWUoKTtcblxuICBzZWxmLmJsb2NrZWQgPSBmYWxzZTtcbiAgc2VsZi53b3JrZXJSdW5uaW5nID0gZmFsc2U7XG5cbiAgc2VsZi5jYWNoZWRVbmJsb2NrID0gbnVsbDtcblxuICAvLyBTdWIgb2JqZWN0cyBmb3IgYWN0aXZlIHN1YnNjcmlwdGlvbnNcbiAgc2VsZi5fbmFtZWRTdWJzID0gbmV3IE1hcCgpO1xuICBzZWxmLl91bml2ZXJzYWxTdWJzID0gW107XG5cbiAgc2VsZi51c2VySWQgPSBudWxsO1xuXG4gIHNlbGYuY29sbGVjdGlvblZpZXdzID0gbmV3IE1hcCgpO1xuXG4gIC8vIFNldCB0aGlzIHRvIGZhbHNlIHRvIG5vdCBzZW5kIG1lc3NhZ2VzIHdoZW4gY29sbGVjdGlvblZpZXdzIGFyZVxuICAvLyBtb2RpZmllZC4gVGhpcyBpcyBkb25lIHdoZW4gcmVydW5uaW5nIHN1YnMgaW4gX3NldFVzZXJJZCBhbmQgdGhvc2UgbWVzc2FnZXNcbiAgLy8gYXJlIGNhbGN1bGF0ZWQgdmlhIGEgZGlmZiBpbnN0ZWFkLlxuICBzZWxmLl9pc1NlbmRpbmcgPSB0cnVlO1xuXG4gIC8vIElmIHRoaXMgaXMgdHJ1ZSwgZG9uJ3Qgc3RhcnQgYSBuZXdseS1jcmVhdGVkIHVuaXZlcnNhbCBwdWJsaXNoZXIgb24gdGhpc1xuICAvLyBzZXNzaW9uLiBUaGUgc2Vzc2lvbiB3aWxsIHRha2UgY2FyZSBvZiBzdGFydGluZyBpdCB3aGVuIGFwcHJvcHJpYXRlLlxuICBzZWxmLl9kb250U3RhcnROZXdVbml2ZXJzYWxTdWJzID0gZmFsc2U7XG5cbiAgLy8gV2hlbiB3ZSBhcmUgcmVydW5uaW5nIHN1YnNjcmlwdGlvbnMsIGFueSByZWFkeSBtZXNzYWdlc1xuICAvLyB3ZSB3YW50IHRvIGJ1ZmZlciB1cCBmb3Igd2hlbiB3ZSBhcmUgZG9uZSByZXJ1bm5pbmcgc3Vic2NyaXB0aW9uc1xuICBzZWxmLl9wZW5kaW5nUmVhZHkgPSBbXTtcblxuICAvLyBMaXN0IG9mIGNhbGxiYWNrcyB0byBjYWxsIHdoZW4gdGhpcyBjb25uZWN0aW9uIGlzIGNsb3NlZC5cbiAgc2VsZi5fY2xvc2VDYWxsYmFja3MgPSBbXTtcblxuXG4gIC8vIFhYWCBIQUNLOiBJZiBhIHNvY2tqcyBjb25uZWN0aW9uLCBzYXZlIG9mZiB0aGUgVVJMLiBUaGlzIGlzXG4gIC8vIHRlbXBvcmFyeSBhbmQgd2lsbCBnbyBhd2F5IGluIHRoZSBuZWFyIGZ1dHVyZS5cbiAgc2VsZi5fc29ja2V0VXJsID0gc29ja2V0LnVybDtcblxuICAvLyBBbGxvdyB0ZXN0cyB0byBkaXNhYmxlIHJlc3BvbmRpbmcgdG8gcGluZ3MuXG4gIHNlbGYuX3Jlc3BvbmRUb1BpbmdzID0gb3B0aW9ucy5yZXNwb25kVG9QaW5ncztcblxuICAvLyBUaGlzIG9iamVjdCBpcyB0aGUgcHVibGljIGludGVyZmFjZSB0byB0aGUgc2Vzc2lvbi4gSW4gdGhlIHB1YmxpY1xuICAvLyBBUEksIGl0IGlzIGNhbGxlZCB0aGUgYGNvbm5lY3Rpb25gIG9iamVjdC4gIEludGVybmFsbHkgd2UgY2FsbCBpdFxuICAvLyBhIGBjb25uZWN0aW9uSGFuZGxlYCB0byBhdm9pZCBhbWJpZ3VpdHkuXG4gIHNlbGYuY29ubmVjdGlvbkhhbmRsZSA9IHtcbiAgICBpZDogc2VsZi5pZCxcbiAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gU2VydmVyLWluaXRpYXRlZCBjbG9zZSBzaG91bGQgbm90IGJlIHJlc3VtYWJsZVxuICAgICAgc2VsZi5fZXhwZWN0aW5nRGlzY29ubmVjdCA9IHRydWU7XG4gICAgICBzZWxmLmNsb3NlKCk7XG4gICAgfSxcbiAgICBvbkNsb3NlOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHZhciBjYiA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZm4sIFwiY29ubmVjdGlvbiBvbkNsb3NlIGNhbGxiYWNrXCIpO1xuICAgICAgaWYgKHNlbGYuaW5RdWV1ZSkge1xuICAgICAgICBzZWxmLl9jbG9zZUNhbGxiYWNrcy5wdXNoKGNiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHdlJ3JlIGFscmVhZHkgY2xvc2VkLCBjYWxsIHRoZSBjYWxsYmFjay5cbiAgICAgICAgTWV0ZW9yLmRlZmVyKGNiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWVudEFkZHJlc3M6IHNlbGYuX2NsaWVudEFkZHJlc3MoKSxcbiAgICBodHRwSGVhZGVyczogc2VsZi5zb2NrZXQuaGVhZGVyc1xuICB9O1xuXG4gIHNlbGYuc2VuZCh7IG1zZzogJ2Nvbm5lY3RlZCcsIHNlc3Npb246IHNlbGYuaWQgfSk7XG5cbiAgLy8gT24gaW5pdGlhbCBjb25uZWN0LCBzcGluIHVwIGFsbCB0aGUgdW5pdmVyc2FsIHB1Ymxpc2hlcnMuXG4gIHNlbGYuc3RhcnRVbml2ZXJzYWxTdWJzKCk7XG5cbiAgaWYgKHZlcnNpb24gIT09ICdwcmUxJyAmJiBvcHRpb25zLmhlYXJ0YmVhdEludGVydmFsICE9PSAwKSB7XG4gICAgLy8gV2Ugbm8gbG9uZ2VyIG5lZWQgdGhlIGxvdyBsZXZlbCB0aW1lb3V0IGJlY2F1c2Ugd2UgaGF2ZSBoZWFydGJlYXRzLlxuICAgIHNvY2tldC5zZXRXZWJzb2NrZXRUaW1lb3V0KDApO1xuXG4gICAgc2VsZi5oZWFydGJlYXQgPSBuZXcgRERQQ29tbW9uLkhlYXJ0YmVhdCh7XG4gICAgICBoZWFydGJlYXRJbnRlcnZhbDogb3B0aW9ucy5oZWFydGJlYXRJbnRlcnZhbCxcbiAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IG9wdGlvbnMuaGVhcnRiZWF0VGltZW91dCxcbiAgICAgIG9uVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICB9LFxuICAgICAgc2VuZFBpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZW5kKHttc2c6ICdwaW5nJ30pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuaGVhcnRiZWF0LnN0YXJ0KCk7XG4gIH1cblxuICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgXCJsaXZlZGF0YVwiLCBcInNlc3Npb25zXCIsIDEpO1xufTtcblxuY29uc3QgaWdub3JlZE1zZ3NGb3JTZXNzaW9uT3V0T2ZEYXRlQ2hlY2sgPSBbJ3BpbmcnLCAncG9uZyddO1xuXG5PYmplY3QuYXNzaWduKFNlc3Npb24ucHJvdG90eXBlLCB7XG4gIHNlbmRSZWFkeTogZnVuY3Rpb24gKHN1YnNjcmlwdGlvbklkcykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNTZW5kaW5nKSB7XG4gICAgICBzZWxmLnNlbmQoe21zZzogXCJyZWFkeVwiLCBzdWJzOiBzdWJzY3JpcHRpb25JZHN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3Vic2NyaXB0aW9uSWRzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmlwdGlvbklkKSB7XG4gICAgICAgIHNlbGYuX3BlbmRpbmdSZWFkeS5wdXNoKHN1YnNjcmlwdGlvbklkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfY2FuU2VuZChjb2xsZWN0aW9uTmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9pc1NlbmRpbmcgfHwgIXRoaXMuc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3koY29sbGVjdGlvbk5hbWUpLnVzZUNvbGxlY3Rpb25WaWV3O1xuICB9LFxuXG5cbiAgc2VuZEFkZGVkKGNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKSB7XG4gICAgaWYgKHRoaXMuX2NhblNlbmQoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICB0aGlzLnNlbmQoeyBtc2c6ICdhZGRlZCcsIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzIH0pO1xuICAgIH1cbiAgfSxcblxuICBzZW5kQ2hhbmdlZChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgIGlmIChpc0VtcHR5KGZpZWxkcykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAodGhpcy5fY2FuU2VuZChjb2xsZWN0aW9uTmFtZSkpIHtcbiAgICAgIHRoaXMuc2VuZCh7XG4gICAgICAgIG1zZzogXCJjaGFuZ2VkXCIsXG4gICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25OYW1lLFxuICAgICAgICBpZCxcbiAgICAgICAgZmllbGRzXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2VuZFJlbW92ZWQoY29sbGVjdGlvbk5hbWUsIGlkKSB7XG4gICAgaWYgKHRoaXMuX2NhblNlbmQoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICB0aGlzLnNlbmQoe21zZzogXCJyZW1vdmVkXCIsIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25OYW1lLCBpZH0pO1xuICAgIH1cbiAgfSxcblxuICBnZXRTZW5kQ2FsbGJhY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBhZGRlZDogc2VsZi5zZW5kQWRkZWQuYmluZChzZWxmKSxcbiAgICAgIGNoYW5nZWQ6IHNlbGYuc2VuZENoYW5nZWQuYmluZChzZWxmKSxcbiAgICAgIHJlbW92ZWQ6IHNlbGYuc2VuZFJlbW92ZWQuYmluZChzZWxmKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0Q29sbGVjdGlvblZpZXc6IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmV0ID0gc2VsZi5jb2xsZWN0aW9uVmlld3MuZ2V0KGNvbGxlY3Rpb25OYW1lKTtcbiAgICBpZiAoIXJldCkge1xuICAgICAgcmV0ID0gbmV3IFNlc3Npb25Db2xsZWN0aW9uVmlldyhjb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldFNlbmRDYWxsYmFja3MoKSk7XG4gICAgICBzZWxmLmNvbGxlY3Rpb25WaWV3cy5zZXQoY29sbGVjdGlvbk5hbWUsIHJldCk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgYWRkZWQoc3Vic2NyaXB0aW9uSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgIGlmICh0aGlzLnNlcnZlci5nZXRQdWJsaWNhdGlvblN0cmF0ZWd5KGNvbGxlY3Rpb25OYW1lKS51c2VDb2xsZWN0aW9uVmlldykge1xuICAgICAgY29uc3QgdmlldyA9IHRoaXMuZ2V0Q29sbGVjdGlvblZpZXcoY29sbGVjdGlvbk5hbWUpO1xuICAgICAgdmlldy5hZGRlZChzdWJzY3JpcHRpb25IYW5kbGUsIGlkLCBmaWVsZHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbmRBZGRlZChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbW92ZWQoc3Vic2NyaXB0aW9uSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgaWQpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSkudXNlQ29sbGVjdGlvblZpZXcpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLmdldENvbGxlY3Rpb25WaWV3KGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIHZpZXcucmVtb3ZlZChzdWJzY3JpcHRpb25IYW5kbGUsIGlkKTtcbiAgICAgIGlmICh2aWV3LmlzRW1wdHkoKSkge1xuICAgICAgICAgdGhpcy5jb2xsZWN0aW9uVmlld3MuZGVsZXRlKGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kUmVtb3ZlZChjb2xsZWN0aW9uTmFtZSwgaWQpO1xuICAgIH1cbiAgfSxcblxuICBjaGFuZ2VkKHN1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSkudXNlQ29sbGVjdGlvblZpZXcpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLmdldENvbGxlY3Rpb25WaWV3KGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIHZpZXcuY2hhbmdlZChzdWJzY3JpcHRpb25IYW5kbGUsIGlkLCBmaWVsZHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbmRDaGFuZ2VkKGNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKTtcbiAgICB9XG4gIH0sXG5cbiAgc3RhcnRVbml2ZXJzYWxTdWJzOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgLy8gTWFrZSBhIHNoYWxsb3cgY29weSBvZiB0aGUgc2V0IG9mIHVuaXZlcnNhbCBoYW5kbGVycyBhbmQgc3RhcnQgdGhlbS4gSWZcbiAgICAvLyBhZGRpdGlvbmFsIHVuaXZlcnNhbCBwdWJsaXNoZXJzIHN0YXJ0IHdoaWxlIHdlJ3JlIHJ1bm5pbmcgdGhlbSAoZHVlIHRvXG4gICAgLy8geWllbGRpbmcpLCB0aGV5IHdpbGwgcnVuIHNlcGFyYXRlbHkgYXMgcGFydCBvZiBTZXJ2ZXIucHVibGlzaC5cbiAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgWy4uLnNlbGYuc2VydmVyLnVuaXZlcnNhbF9wdWJsaXNoX2hhbmRsZXJzXSkge1xuICAgICAgc2VsZi5fc3RhcnRTdWJzY3JpcHRpb24oaGFuZGxlcik7XG4gICAgfVxuICB9LFxuXG4gIC8vIFN0b3AgaGVhcnRiZWF0IGlmIHJ1bm5pbmdcbiAgX3N0b3BIZWFydGJlYXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5oZWFydGJlYXQpIHtcbiAgICAgIHRoaXMuaGVhcnRiZWF0LnN0b3AoKTtcbiAgICAgIHRoaXMuaGVhcnRiZWF0ID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVzdHJveSB0aGlzIHNlc3Npb24gYW5kIHVucmVnaXN0ZXIgaXQgYXQgdGhlIHNlcnZlci5cbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIERlc3Ryb3kgdGhpcyBzZXNzaW9uLCBldmVuIGlmIGl0J3Mgbm90IHJlZ2lzdGVyZWQgYXQgdGhlXG4gICAgLy8gc2VydmVyLiBTdG9wIGFsbCBwcm9jZXNzaW5nIGFuZCB0ZWFyIGV2ZXJ5dGhpbmcgZG93bi4gSWYgYSBzb2NrZXRcbiAgICAvLyB3YXMgYXR0YWNoZWQsIGNsb3NlIGl0LlxuXG4gICAgLy8gQWxyZWFkeSBjbG9zaW5nIG9yIGNsb3NlZCAtIHByZXZlbnQgbXVsdGlwbGUgY2xvc2UoKSBjYWxsc1xuICAgIGlmIChzZWxmLl9pc0Nsb3NpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5faXNDbG9zaW5nID0gdHJ1ZTtcblxuICAgIGlmIChzZWxmLl9yZW1vdmVUaW1lb3V0SGFuZGxlKSB7XG4gICAgICBNZXRlb3IuY2xlYXJUaW1lb3V0KHNlbGYuX3JlbW92ZVRpbWVvdXRIYW5kbGUpO1xuICAgICAgc2VsZi5fcmVtb3ZlVGltZW91dEhhbmRsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuc29ja2V0KSB7XG4gICAgICBpZiAoIXNlbGYuc29ja2V0LmlzQ2xvc2VkKSB7XG4gICAgICAgIHNlbGYuc29ja2V0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBzZWxmLnNvY2tldC5fbWV0ZW9yU2Vzc2lvbiA9IG51bGw7XG4gICAgICBzZWxmLnNvY2tldCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU3RvcCBoZWFydGJlYXQgaW1tZWRpYXRlbHkgLSB3ZSBkb24ndCBuZWVkIGl0IGR1cmluZyB0aGUgZ3JhY2UgcGVyaW9kXG4gICAgLy8gc2luY2Ugd2UgaGF2ZSBubyBzb2NrZXQgdG8gc2VuZCBwaW5ncyBvbiBhbnl3YXkuXG4gICAgc2VsZi5fc3RvcEhlYXJ0YmVhdCgpO1xuXG4gICAgc2VsZi5zZXJ2ZXIuX3JlbW92ZVNlc3Npb24oc2VsZiwgKCkgPT4ge1xuICAgICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgICBcImxpdmVkYXRhXCIsIFwic2Vzc2lvbnNcIiwgLTEpO1xuXG4gICAgICBzZWxmLmluUXVldWUgPSBudWxsO1xuICAgICAgc2VsZi5jb2xsZWN0aW9uVmlld3MgPSBuZXcgTWFwKCk7XG5cbiAgICAgIHNlbGYuX3N0b3BIZWFydGJlYXQoKTtcblxuICAgICAgTWV0ZW9yLmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gc3RvcCBjYWxsYmFja3MgY2FuIHlpZWxkLCBzbyB3ZSBkZWZlciB0aGlzIG9uIGNsb3NlLlxuICAgICAgICAvLyBzdWIuX2lzRGVhY3RpdmF0ZWQoKSBkZXRlY3RzIHRoYXQgd2Ugc2V0IGluUXVldWUgdG8gbnVsbCBhbmRcbiAgICAgICAgLy8gdHJlYXRzIGl0IGFzIHNlbWktZGVhY3RpdmF0ZWQgKGl0IHdpbGwgaWdub3JlIGluY29taW5nIGNhbGxiYWNrcywgZXRjKS5cbiAgICAgICAgc2VsZi5fZGVhY3RpdmF0ZUFsbFN1YnNjcmlwdGlvbnMoKTtcblxuICAgICAgICAvLyBEZWZlciBjYWxsaW5nIHRoZSBjbG9zZSBjYWxsYmFja3MsIHNvIHRoYXQgdGhlIGNhbGxlciBjbG9zaW5nXG4gICAgICAgIC8vIHRoZSBzZXNzaW9uIGlzbid0IHdhaXRpbmcgZm9yIGFsbCB0aGUgY2FsbGJhY2tzIHRvIGNvbXBsZXRlLlxuICAgICAgICBzZWxmLl9jbG9zZUNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFNlbmQgYSBtZXNzYWdlIChkb2luZyBub3RoaW5nIGlmIG5vIHNvY2tldCBpcyBjb25uZWN0ZWQgcmlnaHQgbm93KS5cbiAgLy8gSXQgc2hvdWxkIGJlIGEgSlNPTiBvYmplY3QgKGl0IHdpbGwgYmUgc3RyaW5naWZpZWQpLlxuICBzZW5kOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgaXNJZ25vcmVkTXNnID0gaWdub3JlZE1zZ3NGb3JTZXNzaW9uT3V0T2ZEYXRlQ2hlY2suaW5jbHVkZXMobXNnLm1zZyk7XG4gICAgaWYgKHNlbGYubWVzc2FnZVF1ZXVlICYmICFpc0lnbm9yZWRNc2cpIHtcbiAgICAgIHNlbGYubWVzc2FnZVF1ZXVlLnB1c2gobXNnKTtcbiAgICAgIGlmIChzZWxmLm1lc3NhZ2VRdWV1ZS5sZW5ndGggPiBzZWxmLm9wdGlvbnMubWF4TWVzc2FnZVF1ZXVlTGVuZ3RoKSB7XG4gICAgICAgIE1ldGVvci5jbGVhclRpbWVvdXQoc2VsZi5fcmVtb3ZlVGltZW91dEhhbmRsZSk7XG4gICAgICAgIHNlbGYuX3BlbmRpbmdSZW1vdmVGdW5jdGlvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2VsZi5zb2NrZXQpIHtcbiAgICAgIGNvbnN0IHN0cmluZ01zZyA9IEREUENvbW1vbi5zdHJpbmdpZnlERFAobXNnKTtcbiAgICAgIGlmIChNZXRlb3IuX3ByaW50U2VudEREUClcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIlNlbnQgRERQXCIsIHN0cmluZ01zZyk7XG4gICAgICBpZiAoIWlzSWdub3JlZE1zZykge1xuICAgICAgICBzZWxmLnNlbnRDb3VudCsrO1xuICAgICAgfVxuICAgICAgc2VsZi5zb2NrZXQuc2VuZChzdHJpbmdNc2cpO1xuICAgIH1cbiAgfSxcblxuICAvLyBTZW5kIGEgY29ubmVjdGlvbiBlcnJvci5cbiAgc2VuZEVycm9yOiBmdW5jdGlvbiAocmVhc29uLCBvZmZlbmRpbmdNZXNzYWdlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgbXNnID0ge21zZzogJ2Vycm9yJywgcmVhc29uOiByZWFzb259O1xuICAgIGlmIChvZmZlbmRpbmdNZXNzYWdlKVxuICAgICAgbXNnLm9mZmVuZGluZ01lc3NhZ2UgPSBvZmZlbmRpbmdNZXNzYWdlO1xuICAgIHNlbGYuc2VuZChtc2cpO1xuICB9LFxuXG4gIC8vIFByb2Nlc3MgJ21zZycgYXMgYW4gaW5jb21pbmcgbWVzc2FnZS4gQXMgYSBndWFyZCBhZ2FpbnN0XG4gIC8vIHJhY2UgY29uZGl0aW9ucyBkdXJpbmcgcmVjb25uZWN0aW9uLCBpZ25vcmUgdGhlIG1lc3NhZ2UgaWZcbiAgLy8gJ3NvY2tldCcgaXMgbm90IHRoZSBjdXJyZW50bHkgY29ubmVjdGVkIHNvY2tldC5cbiAgLy9cbiAgLy8gV2UgcnVuIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBjbGllbnQgb25lIGF0IGEgdGltZSwgaW4gdGhlIG9yZGVyXG4gIC8vIGdpdmVuIGJ5IHRoZSBjbGllbnQuIFRoZSBtZXNzYWdlIGhhbmRsZXIgaXMgcGFzc2VkIGFuIGlkZW1wb3RlbnRcbiAgLy8gZnVuY3Rpb24gJ3VuYmxvY2snIHdoaWNoIGl0IG1heSBjYWxsIHRvIGFsbG93IG90aGVyIG1lc3NhZ2VzIHRvXG4gIC8vIGJlZ2luIHJ1bm5pbmcgaW4gcGFyYWxsZWwgaW4gYW5vdGhlciBmaWJlciAoZm9yIGV4YW1wbGUsIGEgbWV0aG9kXG4gIC8vIHRoYXQgd2FudHMgdG8geWllbGQpLiBPdGhlcndpc2UsIGl0IGlzIGF1dG9tYXRpY2FsbHkgdW5ibG9ja2VkXG4gIC8vIHdoZW4gaXQgcmV0dXJucy5cbiAgLy9cbiAgLy8gQWN0dWFsbHksIHdlIGRvbid0IGhhdmUgdG8gJ3RvdGFsbHkgb3JkZXInIHRoZSBtZXNzYWdlcyBpbiB0aGlzXG4gIC8vIHdheSwgYnV0IGl0J3MgdGhlIGVhc2llc3QgdGhpbmcgdGhhdCdzIGNvcnJlY3QuICh1bnN1YiBuZWVkcyB0b1xuICAvLyBiZSBvcmRlcmVkIGFnYWluc3Qgc3ViLCBtZXRob2RzIG5lZWQgdG8gYmUgb3JkZXJlZCBhZ2FpbnN0IGVhY2hcbiAgLy8gb3RoZXIpLlxuICBwcm9jZXNzTWVzc2FnZTogZnVuY3Rpb24gKG1zZ19pbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuaW5RdWV1ZSkgLy8gd2UgaGF2ZSBiZWVuIGRlc3Ryb3llZC5cbiAgICAgIHJldHVybjtcblxuICAgIC8vIFJlc3BvbmQgdG8gcGluZyBhbmQgcG9uZyBtZXNzYWdlcyBpbW1lZGlhdGVseSB3aXRob3V0IHF1ZXVpbmcuXG4gICAgLy8gSWYgdGhlIG5lZ290aWF0ZWQgRERQIHZlcnNpb24gaXMgXCJwcmUxXCIgd2hpY2ggZGlkbid0IHN1cHBvcnRcbiAgICAvLyBwaW5ncywgcHJlc2VydmUgdGhlIFwicHJlMVwiIGJlaGF2aW9yIG9mIHJlc3BvbmRpbmcgd2l0aCBhIFwiYmFkXG4gICAgLy8gcmVxdWVzdFwiIGZvciB0aGUgdW5rbm93biBtZXNzYWdlcy5cbiAgICAvL1xuICAgIC8vIEZpYmVycyBhcmUgbmVlZGVkIGJlY2F1c2UgaGVhcnRiZWF0cyB1c2UgTWV0ZW9yLnNldFRpbWVvdXQsIHdoaWNoXG4gICAgLy8gbmVlZHMgYSBGaWJlci4gV2UgY291bGQgYWN0dWFsbHkgdXNlIHJlZ3VsYXIgc2V0VGltZW91dCBhbmQgYXZvaWRcbiAgICAvLyB0aGVzZSBuZXcgZmliZXJzLCBidXQgaXQgaXMgZWFzaWVyIHRvIGp1c3QgbWFrZSBldmVyeXRoaW5nIHVzZVxuICAgIC8vIE1ldGVvci5zZXRUaW1lb3V0IGFuZCBub3QgdGhpbmsgdG9vIGhhcmQuXG4gICAgLy9cbiAgICAvLyBBbnkgbWVzc2FnZSBjb3VudHMgYXMgcmVjZWl2aW5nIGEgcG9uZywgYXMgaXQgZGVtb25zdHJhdGVzIHRoYXRcbiAgICAvLyB0aGUgY2xpZW50IGlzIHN0aWxsIGFsaXZlLlxuICAgIGlmIChzZWxmLmhlYXJ0YmVhdCkge1xuICAgICAgc2VsZi5oZWFydGJlYXQubWVzc2FnZVJlY2VpdmVkKCk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYudmVyc2lvbiAhPT0gJ3ByZTEnICYmIG1zZ19pbi5tc2cgPT09ICdwaW5nJykge1xuICAgICAgaWYgKHNlbGYuX3Jlc3BvbmRUb1BpbmdzKVxuICAgICAgICBzZWxmLnNlbmQoe21zZzogXCJwb25nXCIsIGlkOiBtc2dfaW4uaWR9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNlbGYudmVyc2lvbiAhPT0gJ3ByZTEnICYmIG1zZ19pbi5tc2cgPT09ICdwb25nJykge1xuICAgICAgLy8gU2luY2UgZXZlcnl0aGluZyBpcyBhIHBvbmcsIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG9cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobXNnX2luLm1zZyA9PT0gJ2Rpc2Nvbm5lY3QnKSB7XG4gICAgICAvLyBQcmUtZW1wdCB0aGUgcXVldWUgLSBhIGRpc2Nvbm5lY3QgaXMgaW1taW5lbnQuXG4gICAgICByZXR1cm4gc2VsZi5wcm90b2NvbF9oYW5kbGVycy5kaXNjb25uZWN0LmNhbGwoc2VsZiwgbXNnX2luLCAoKSA9PiB7fSk7XG4gICAgfVxuXG4gICAgc2VsZi5pblF1ZXVlLnB1c2gobXNnX2luKTtcbiAgICBpZiAoc2VsZi53b3JrZXJSdW5uaW5nKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYud29ya2VyUnVubmluZyA9IHRydWU7XG5cbiAgICB2YXIgcHJvY2Vzc05leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbXNnID0gc2VsZi5pblF1ZXVlICYmIHNlbGYuaW5RdWV1ZS5zaGlmdCgpO1xuXG4gICAgICBpZiAoIW1zZykge1xuICAgICAgICBzZWxmLndvcmtlclJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBydW5IYW5kbGVycygpIHtcbiAgICAgICAgdmFyIGJsb2NrZWQgPSB0cnVlO1xuXG4gICAgICAgIHZhciB1bmJsb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICghYmxvY2tlZClcbiAgICAgICAgICAgIHJldHVybjsgLy8gaWRlbXBvdGVudFxuICAgICAgICAgIGJsb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICBzZXRJbW1lZGlhdGUocHJvY2Vzc05leHQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNlbGYuc2VydmVyLm9uTWVzc2FnZUhvb2suZWFjaChmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjayhtc2csIHNlbGYpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobXNnLm1zZyBpbiBzZWxmLnByb3RvY29sX2hhbmRsZXJzKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gc2VsZi5wcm90b2NvbF9oYW5kbGVyc1ttc2cubXNnXS5jYWxsKFxuICAgICAgICAgICAgc2VsZixcbiAgICAgICAgICAgIG1zZyxcbiAgICAgICAgICAgIHVuYmxvY2tcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKE1ldGVvci5faXNQcm9taXNlKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5maW5hbGx5KCgpID0+IHVuYmxvY2soKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVuYmxvY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5zZW5kRXJyb3IoJ0JhZCByZXF1ZXN0JywgbXNnKTtcbiAgICAgICAgICB1bmJsb2NrKCk7IC8vIGluIGNhc2UgdGhlIGhhbmRsZXIgZGlkbid0IGFscmVhZHkgZG8gaXRcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBydW5IYW5kbGVycygpO1xuICAgIH07XG5cbiAgICBwcm9jZXNzTmV4dCgpO1xuICB9LFxuXG4gIHByb3RvY29sX2hhbmRsZXJzOiB7XG4gICAgZGlzY29ubmVjdDogZnVuY3Rpb24obXNnKSB7XG4gICAgICB0aGlzLl9leHBlY3RpbmdEaXNjb25uZWN0ID0gdHJ1ZTtcbiAgICB9LFxuICAgIHN1YjogYXN5bmMgZnVuY3Rpb24gKG1zZywgdW5ibG9jaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBjYWNoZVVuYmxvY2sgdGVtcG9yYXJseSwgc28gd2UgY2FuIGNhcHR1cmUgaXQgbGF0ZXJcbiAgICAgIC8vIHdlIHdpbGwgdXNlIHVuYmxvY2sgaW4gY3VycmVudCBldmVudExvb3AsIHNvIHRoaXMgaXMgc2FmZVxuICAgICAgc2VsZi5jYWNoZWRVbmJsb2NrID0gdW5ibG9jaztcblxuICAgICAgLy8gcmVqZWN0IG1hbGZvcm1lZCBtZXNzYWdlc1xuICAgICAgaWYgKHR5cGVvZiAobXNnLmlkKSAhPT0gXCJzdHJpbmdcIiB8fFxuICAgICAgICAgIHR5cGVvZiAobXNnLm5hbWUpICE9PSBcInN0cmluZ1wiIHx8XG4gICAgICAgICAgKCdwYXJhbXMnIGluIG1zZyAmJiAhKG1zZy5wYXJhbXMgaW5zdGFuY2VvZiBBcnJheSkpKSB7XG4gICAgICAgIHNlbGYuc2VuZEVycm9yKFwiTWFsZm9ybWVkIHN1YnNjcmlwdGlvblwiLCBtc2cpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghc2VsZi5zZXJ2ZXIucHVibGlzaF9oYW5kbGVyc1ttc2cubmFtZV0pIHtcbiAgICAgICAgc2VsZi5zZW5kKHtcbiAgICAgICAgICBtc2c6ICdub3N1YicsIGlkOiBtc2cuaWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCBgU3Vic2NyaXB0aW9uICcke21zZy5uYW1lfScgbm90IGZvdW5kYCl9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5fbmFtZWRTdWJzLmhhcyhtc2cuaWQpKVxuICAgICAgICAvLyBzdWJzIGFyZSBpZGVtcG90ZW50LCBvciByYXRoZXIsIHRoZXkgYXJlIGlnbm9yZWQgaWYgYSBzdWJcbiAgICAgICAgLy8gd2l0aCB0aGF0IGlkIGFscmVhZHkgZXhpc3RzLiB0aGlzIGlzIGltcG9ydGFudCBkdXJpbmdcbiAgICAgICAgLy8gcmVjb25uZWN0LlxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIFhYWCBJdCdkIGJlIG11Y2ggYmV0dGVyIGlmIHdlIGhhZCBnZW5lcmljIGhvb2tzIHdoZXJlIGFueSBwYWNrYWdlIGNhblxuICAgICAgLy8gaG9vayBpbnRvIHN1YnNjcmlwdGlvbiBoYW5kbGluZywgYnV0IGluIHRoZSBtZWFuIHdoaWxlIHdlIHNwZWNpYWwgY2FzZVxuICAgICAgLy8gZGRwLXJhdGUtbGltaXRlciBwYWNrYWdlLiBUaGlzIGlzIGFsc28gZG9uZSBmb3Igd2VhayByZXF1aXJlbWVudHMgdG9cbiAgICAgIC8vIGFkZCB0aGUgZGRwLXJhdGUtbGltaXRlciBwYWNrYWdlIGluIGNhc2Ugd2UgZG9uJ3QgaGF2ZSBBY2NvdW50cy4gQVxuICAgICAgLy8gdXNlciB0cnlpbmcgdG8gdXNlIHRoZSBkZHAtcmF0ZS1saW1pdGVyIG11c3QgZXhwbGljaXRseSByZXF1aXJlIGl0LlxuICAgICAgaWYgKFBhY2thZ2VbJ2RkcC1yYXRlLWxpbWl0ZXInXSkge1xuICAgICAgICB2YXIgRERQUmF0ZUxpbWl0ZXIgPSBQYWNrYWdlWydkZHAtcmF0ZS1saW1pdGVyJ10uRERQUmF0ZUxpbWl0ZXI7XG4gICAgICAgIHZhciByYXRlTGltaXRlcklucHV0ID0ge1xuICAgICAgICAgIHVzZXJJZDogc2VsZi51c2VySWQsXG4gICAgICAgICAgY2xpZW50QWRkcmVzczogc2VsZi5jb25uZWN0aW9uSGFuZGxlLmNsaWVudEFkZHJlc3MsXG4gICAgICAgICAgdHlwZTogXCJzdWJzY3JpcHRpb25cIixcbiAgICAgICAgICBuYW1lOiBtc2cubmFtZSxcbiAgICAgICAgICBjb25uZWN0aW9uSWQ6IHNlbGYuaWRcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBydWxlcyA9IGF3YWl0IEREUFJhdGVMaW1pdGVyLmZpbmRBbGxNYXRjaGluZ1J1bGVzQXN5bmMocmF0ZUxpbWl0ZXJJbnB1dCk7XG4gICAgICAgIEREUFJhdGVMaW1pdGVyLl9pbmNyZW1lbnRSdWxlcyhydWxlcywgcmF0ZUxpbWl0ZXJJbnB1dCk7XG4gICAgICAgIGNvbnN0IHJhdGVMaW1pdFJlc3VsdCA9IEREUFJhdGVMaW1pdGVyLl9jaGVja1J1bGVzKHJ1bGVzLCByYXRlTGltaXRlcklucHV0KTtcbiAgICAgICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuYWxsb3dlZCkge1xuICAgICAgICAgIHNlbGYuc2VuZCh7XG4gICAgICAgICAgICBtc2c6ICdub3N1YicsIGlkOiBtc2cuaWQsXG4gICAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcihcbiAgICAgICAgICAgICAgJ3Rvby1tYW55LXJlcXVlc3RzJyxcbiAgICAgICAgICAgICAgRERQUmF0ZUxpbWl0ZXIuZ2V0RXJyb3JNZXNzYWdlKHJhdGVMaW1pdFJlc3VsdCksXG4gICAgICAgICAgICAgIHt0aW1lVG9SZXNldDogcmF0ZUxpbWl0UmVzdWx0LnRpbWVUb1Jlc2V0fSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGhhbmRsZXIgPSBzZWxmLnNlcnZlci5wdWJsaXNoX2hhbmRsZXJzW21zZy5uYW1lXTtcblxuICAgICAgYXdhaXQgc2VsZi5fc3RhcnRTdWJzY3JpcHRpb24oaGFuZGxlciwgbXNnLmlkLCBtc2cucGFyYW1zLCBtc2cubmFtZSk7XG5cbiAgICAgIC8vIGNsZWFuaW5nIGNhY2hlZCB1bmJsb2NrXG4gICAgICBzZWxmLmNhY2hlZFVuYmxvY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICB1bnN1YjogZnVuY3Rpb24gKG1zZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLl9zdG9wU3Vic2NyaXB0aW9uKG1zZy5pZCk7XG4gICAgfSxcblxuICAgIG1ldGhvZDogYXN5bmMgZnVuY3Rpb24gKG1zZywgdW5ibG9jaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBSZWplY3QgbWFsZm9ybWVkIG1lc3NhZ2VzLlxuICAgICAgLy8gRm9yIG5vdywgd2Ugc2lsZW50bHkgaWdub3JlIHVua25vd24gYXR0cmlidXRlcyxcbiAgICAgIC8vIGZvciBmb3J3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgICAgaWYgKHR5cGVvZiAobXNnLmlkKSAhPT0gXCJzdHJpbmdcIiB8fFxuICAgICAgICAgIHR5cGVvZiAobXNnLm1ldGhvZCkgIT09IFwic3RyaW5nXCIgfHxcbiAgICAgICAgICAoJ3BhcmFtcycgaW4gbXNnICYmICEobXNnLnBhcmFtcyBpbnN0YW5jZW9mIEFycmF5KSkgfHxcbiAgICAgICAgICAoKCdyYW5kb21TZWVkJyBpbiBtc2cpICYmICh0eXBlb2YgbXNnLnJhbmRvbVNlZWQgIT09IFwic3RyaW5nXCIpKSkge1xuICAgICAgICBzZWxmLnNlbmRFcnJvcihcIk1hbGZvcm1lZCBtZXRob2QgaW52b2NhdGlvblwiLCBtc2cpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciByYW5kb21TZWVkID0gbXNnLnJhbmRvbVNlZWQgfHwgbnVsbDtcblxuICAgICAgLy8gU2V0IHVwIHRvIG1hcmsgdGhlIG1ldGhvZCBhcyBzYXRpc2ZpZWQgb25jZSBhbGwgb2JzZXJ2ZXJzXG4gICAgICAvLyAoYW5kIHN1YnNjcmlwdGlvbnMpIGhhdmUgcmVhY3RlZCB0byBhbnkgd3JpdGVzIHRoYXQgd2VyZVxuICAgICAgLy8gZG9uZS5cbiAgICAgIHZhciBmZW5jZSA9IG5ldyBERFBTZXJ2ZXIuX1dyaXRlRmVuY2U7XG4gICAgICBmZW5jZS5vbkFsbENvbW1pdHRlZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIFJldGlyZSB0aGUgZmVuY2Ugc28gdGhhdCBmdXR1cmUgd3JpdGVzIGFyZSBhbGxvd2VkLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgY2FsbGJhY2tzIGxpa2UgdGltZXJzIGFyZSBmcmVlIHRvIHVzZVxuICAgICAgICAvLyB0aGUgZmVuY2UsIGFuZCBpZiB0aGV5IGZpcmUgYmVmb3JlIGl0J3MgYXJtZWQgKGZvclxuICAgICAgICAvLyBleGFtcGxlLCBiZWNhdXNlIHRoZSBtZXRob2Qgd2FpdHMgZm9yIHRoZW0pIHRoZWlyXG4gICAgICAgIC8vIHdyaXRlcyB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBmZW5jZS5cbiAgICAgICAgZmVuY2UucmV0aXJlKCk7XG4gICAgICAgIHNlbGYuc2VuZCh7bXNnOiAndXBkYXRlZCcsIG1ldGhvZHM6IFttc2cuaWRdfSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRmluZCB0aGUgaGFuZGxlclxuICAgICAgdmFyIGhhbmRsZXIgPSBzZWxmLnNlcnZlci5tZXRob2RfaGFuZGxlcnNbbXNnLm1ldGhvZF07XG4gICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgc2VsZi5zZW5kKHtcbiAgICAgICAgICBtc2c6ICdyZXN1bHQnLCBpZDogbXNnLmlkLFxuICAgICAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgYE1ldGhvZCAnJHttc2cubWV0aG9kfScgbm90IGZvdW5kYCl9KTtcbiAgICAgICAgYXdhaXQgZmVuY2UuYXJtKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGludm9jYXRpb24gPSBuZXcgRERQQ29tbW9uLk1ldGhvZEludm9jYXRpb24oe1xuICAgICAgICBuYW1lOiBtc2cubWV0aG9kLFxuICAgICAgICBpc1NpbXVsYXRpb246IGZhbHNlLFxuICAgICAgICB1c2VySWQ6IHNlbGYudXNlcklkLFxuICAgICAgICBzZXRVc2VySWQodXNlcklkKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuX3NldFVzZXJJZCh1c2VySWQpO1xuICAgICAgICB9LFxuICAgICAgICB1bmJsb2NrOiB1bmJsb2NrLFxuICAgICAgICBjb25uZWN0aW9uOiBzZWxmLmNvbm5lY3Rpb25IYW5kbGUsXG4gICAgICAgIHJhbmRvbVNlZWQ6IHJhbmRvbVNlZWQsXG4gICAgICAgIGZlbmNlLFxuICAgICAgfSk7XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICAgICAgYXdhaXQgZmVuY2UuYXJtKCk7XG4gICAgICAgIHVuYmxvY2soKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgbXNnOiBcInJlc3VsdFwiLFxuICAgICAgICBpZDogbXNnLmlkXG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBYWFggSXQnZCBiZSBiZXR0ZXIgaWYgd2UgY291bGQgaG9vayBpbnRvIG1ldGhvZCBoYW5kbGVycyBiZXR0ZXIgYnV0XG4gICAgICAgIC8vIGZvciBub3csIHdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlIGRkcC1yYXRlLWxpbWl0ZXIgZXhpc3RzIHNpbmNlIHdlXG4gICAgICAgIC8vIGhhdmUgYSB3ZWFrIHJlcXVpcmVtZW50IGZvciB0aGUgZGRwLXJhdGUtbGltaXRlciBwYWNrYWdlIHRvIGJlIGFkZGVkXG4gICAgICAgIC8vIHRvIG91ciBhcHBsaWNhdGlvbi5cbiAgICAgICAgaWYgKFBhY2thZ2VbJ2RkcC1yYXRlLWxpbWl0ZXInXSkge1xuICAgICAgICAgIGNvbnN0IEREUFJhdGVMaW1pdGVyID0gUGFja2FnZVsnZGRwLXJhdGUtbGltaXRlciddLkREUFJhdGVMaW1pdGVyO1xuICAgICAgICAgIHZhciByYXRlTGltaXRlcklucHV0ID0ge1xuICAgICAgICAgICAgdXNlcklkOiBzZWxmLnVzZXJJZCxcbiAgICAgICAgICAgIGNsaWVudEFkZHJlc3M6IHNlbGYuY29ubmVjdGlvbkhhbmRsZS5jbGllbnRBZGRyZXNzLFxuICAgICAgICAgICAgdHlwZTogXCJtZXRob2RcIixcbiAgICAgICAgICAgIG5hbWU6IG1zZy5tZXRob2QsXG4gICAgICAgICAgICBjb25uZWN0aW9uSWQ6IHNlbGYuaWRcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHJ1bGVzID0gYXdhaXQgRERQUmF0ZUxpbWl0ZXIuZmluZEFsbE1hdGNoaW5nUnVsZXNBc3luYyhyYXRlTGltaXRlcklucHV0KTtcbiAgICAgICAgICBERFBSYXRlTGltaXRlci5faW5jcmVtZW50UnVsZXMocnVsZXMsIHJhdGVMaW1pdGVySW5wdXQpO1xuICAgICAgICAgIGNvbnN0IHJhdGVMaW1pdFJlc3VsdCA9IEREUFJhdGVMaW1pdGVyLl9jaGVja1J1bGVzKHJ1bGVzLCByYXRlTGltaXRlcklucHV0KTtcbiAgICAgICAgICBpZiAoIXJhdGVMaW1pdFJlc3VsdC5hbGxvd2VkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFxuICAgICAgICAgICAgICBcInRvby1tYW55LXJlcXVlc3RzXCIsXG4gICAgICAgICAgICAgIEREUFJhdGVMaW1pdGVyLmdldEVycm9yTWVzc2FnZShyYXRlTGltaXRSZXN1bHQpLFxuICAgICAgICAgICAgICB7dGltZVRvUmVzZXQ6IHJhdGVMaW1pdFJlc3VsdC50aW1lVG9SZXNldH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRERQU2VydmVyLl9DdXJyZW50V3JpdGVGZW5jZS53aXRoVmFsdWUoXG4gICAgICAgICAgZmVuY2UsXG4gICAgICAgICAgKCkgPT4gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi53aXRoVmFsdWUoXG4gICAgICAgICAgICBpbnZvY2F0aW9uLFxuICAgICAgICAgICAgKCkgPT4gbWF5YmVBdWRpdEFyZ3VtZW50Q2hlY2tzKFxuICAgICAgICAgICAgICBoYW5kbGVyLCBpbnZvY2F0aW9uLCBtc2cucGFyYW1zLFxuICAgICAgICAgICAgICBcImNhbGwgdG8gJ1wiICsgbXNnLm1ldGhvZCArIFwiJ1wiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIGF3YWl0IGZpbmlzaCgpO1xuICAgICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwYXlsb2FkLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNlbmQocGF5bG9hZCk7XG4gICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgYXdhaXQgZmluaXNoKCk7XG4gICAgICAgIHBheWxvYWQuZXJyb3IgPSB3cmFwSW50ZXJuYWxFeGNlcHRpb24oXG4gICAgICAgICAgZXhjZXB0aW9uLFxuICAgICAgICAgIGB3aGlsZSBpbnZva2luZyBtZXRob2QgJyR7bXNnLm1ldGhvZH0nYFxuICAgICAgICApO1xuICAgICAgICBzZWxmLnNlbmQocGF5bG9hZCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBfZWFjaFN1YjogZnVuY3Rpb24gKGYpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fbmFtZWRTdWJzLmZvckVhY2goZik7XG4gICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5mb3JFYWNoKGYpO1xuICB9LFxuXG4gIF9kaWZmQ29sbGVjdGlvblZpZXdzOiBmdW5jdGlvbiAoYmVmb3JlQ1ZzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIERpZmZTZXF1ZW5jZS5kaWZmTWFwcyhiZWZvcmVDVnMsIHNlbGYuY29sbGVjdGlvblZpZXdzLCB7XG4gICAgICBib3RoOiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGxlZnRWYWx1ZSwgcmlnaHRWYWx1ZSkge1xuICAgICAgICByaWdodFZhbHVlLmRpZmYobGVmdFZhbHVlKTtcbiAgICAgIH0sXG4gICAgICByaWdodE9ubHk6IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgcmlnaHRWYWx1ZSkge1xuICAgICAgICByaWdodFZhbHVlLmRvY3VtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkb2NWaWV3LCBpZCkge1xuICAgICAgICAgIHNlbGYuc2VuZEFkZGVkKGNvbGxlY3Rpb25OYW1lLCBpZCwgZG9jVmlldy5nZXRGaWVsZHMoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGxlZnRPbmx5OiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGxlZnRWYWx1ZSkge1xuICAgICAgICBsZWZ0VmFsdWUuZG9jdW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgICBzZWxmLnNlbmRSZW1vdmVkKGNvbGxlY3Rpb25OYW1lLCBpZCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8vIFNldHMgdGhlIGN1cnJlbnQgdXNlciBpZCBpbiBhbGwgYXBwcm9wcmlhdGUgY29udGV4dHMgYW5kIHJlcnVuc1xuICAvLyBhbGwgc3Vic2NyaXB0aW9uc1xuICBhc3luYyBfc2V0VXNlcklkKHVzZXJJZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh1c2VySWQgIT09IG51bGwgJiYgdHlwZW9mIHVzZXJJZCAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInNldFVzZXJJZCBtdXN0IGJlIGNhbGxlZCBvbiBzdHJpbmcgb3IgbnVsbCwgbm90IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdXNlcklkKTtcblxuICAgIC8vIFByZXZlbnQgbmV3bHktY3JlYXRlZCB1bml2ZXJzYWwgc3Vic2NyaXB0aW9ucyBmcm9tIGJlaW5nIGFkZGVkIHRvIG91clxuICAgIC8vIHNlc3Npb24uIFRoZXkgd2lsbCBiZSBmb3VuZCBiZWxvdyB3aGVuIHdlIGNhbGwgc3RhcnRVbml2ZXJzYWxTdWJzLlxuICAgIC8vXG4gICAgLy8gKFdlIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgbmFtZWQgc3Vic2NyaXB0aW9ucywgYmVjYXVzZSB3ZSBvbmx5IGFkZFxuICAgIC8vIHRoZW0gd2hlbiB3ZSBwcm9jZXNzIGEgJ3N1YicgbWVzc2FnZS4gV2UgYXJlIGN1cnJlbnRseSBwcm9jZXNzaW5nIGFcbiAgICAvLyAnbWV0aG9kJyBtZXNzYWdlLCBhbmQgdGhlIG1ldGhvZCBkaWQgbm90IHVuYmxvY2ssIGJlY2F1c2UgaXQgaXMgaWxsZWdhbFxuICAgIC8vIHRvIGNhbGwgc2V0VXNlcklkIGFmdGVyIHVuYmxvY2suIFRodXMgd2UgY2Fubm90IGJlIGNvbmN1cnJlbnRseSBhZGRpbmcgYVxuICAgIC8vIG5ldyBuYW1lZCBzdWJzY3JpcHRpb24pLlxuICAgIHNlbGYuX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMgPSB0cnVlO1xuXG4gICAgLy8gUHJldmVudCBjdXJyZW50IHN1YnMgZnJvbSB1cGRhdGluZyBvdXIgY29sbGVjdGlvblZpZXdzIGFuZCBjYWxsIHRoZWlyXG4gICAgLy8gc3RvcCBjYWxsYmFja3MuIFRoaXMgbWF5IHlpZWxkLlxuICAgIHNlbGYuX2VhY2hTdWIoZnVuY3Rpb24gKHN1Yikge1xuICAgICAgc3ViLl9kZWFjdGl2YXRlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBbGwgc3VicyBzaG91bGQgbm93IGJlIGRlYWN0aXZhdGVkLiBTdG9wIHNlbmRpbmcgbWVzc2FnZXMgdG8gdGhlIGNsaWVudCxcbiAgICAvLyBzYXZlIHRoZSBzdGF0ZSBvZiB0aGUgcHVibGlzaGVkIGNvbGxlY3Rpb25zLCByZXNldCB0byBhbiBlbXB0eSB2aWV3LCBhbmRcbiAgICAvLyB1cGRhdGUgdGhlIHVzZXJJZC5cbiAgICBzZWxmLl9pc1NlbmRpbmcgPSBmYWxzZTtcbiAgICB2YXIgYmVmb3JlQ1ZzID0gc2VsZi5jb2xsZWN0aW9uVmlld3M7XG4gICAgc2VsZi5jb2xsZWN0aW9uVmlld3MgPSBuZXcgTWFwKCk7XG4gICAgc2VsZi51c2VySWQgPSB1c2VySWQ7XG5cbiAgICAvLyBfc2V0VXNlcklkIGlzIG5vcm1hbGx5IGNhbGxlZCBmcm9tIGEgTWV0ZW9yIG1ldGhvZCB3aXRoXG4gICAgLy8gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiBzZXQuIEJ1dCBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uIGlzIG5vdFxuICAgIC8vIGV4cGVjdGVkIHRvIGJlIHNldCBpbnNpZGUgYSBwdWJsaXNoIGZ1bmN0aW9uLCBzbyB3ZSB0ZW1wb3JhcnkgdW5zZXQgaXQuXG4gICAgLy8gSW5zaWRlIGEgcHVibGlzaCBmdW5jdGlvbiBERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24gaXMgc2V0LlxuICAgIGF3YWl0IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24ud2l0aFZhbHVlKHVuZGVmaW5lZCwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gU2F2ZSB0aGUgb2xkIG5hbWVkIHN1YnMsIGFuZCByZXNldCB0byBoYXZpbmcgbm8gc3Vic2NyaXB0aW9ucy5cbiAgICAgIHZhciBvbGROYW1lZFN1YnMgPSBzZWxmLl9uYW1lZFN1YnM7XG4gICAgICBzZWxmLl9uYW1lZFN1YnMgPSBuZXcgTWFwKCk7XG4gICAgICBzZWxmLl91bml2ZXJzYWxTdWJzID0gW107XG5cblxuXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbLi4ub2xkTmFtZWRTdWJzXS5tYXAoYXN5bmMgKFtzdWJzY3JpcHRpb25JZCwgc3ViXSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTdWIgPSBzdWIuX3JlY3JlYXRlKCk7XG4gICAgICAgIHNlbGYuX25hbWVkU3Vicy5zZXQoc3Vic2NyaXB0aW9uSWQsIG5ld1N1Yik7XG4gICAgICAgIC8vIG5iOiBpZiB0aGUgaGFuZGxlciB0aHJvd3Mgb3IgY2FsbHMgdGhpcy5lcnJvcigpLCBpdCB3aWxsIGluIGZhY3RcbiAgICAgICAgLy8gaW1tZWRpYXRlbHkgc2VuZCBpdHMgJ25vc3ViJy4gVGhpcyBpcyBPSywgdGhvdWdoLlxuICAgICAgICBhd2FpdCBuZXdTdWIuX3J1bkhhbmRsZXIoKTtcbiAgICAgIH0pKTtcblxuICAgICAgLy8gQWxsb3cgbmV3bHktY3JlYXRlZCB1bml2ZXJzYWwgc3VicyB0byBiZSBzdGFydGVkIG9uIG91ciBjb25uZWN0aW9uIGluXG4gICAgICAvLyBwYXJhbGxlbCB3aXRoIHRoZSBvbmVzIHdlJ3JlIHNwaW5uaW5nIHVwIGhlcmUsIGFuZCBzcGluIHVwIHVuaXZlcnNhbFxuICAgICAgLy8gc3Vicy5cbiAgICAgIHNlbGYuX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMgPSBmYWxzZTtcbiAgICAgIHNlbGYuc3RhcnRVbml2ZXJzYWxTdWJzKCk7XG4gICAgfSwgeyBuYW1lOiAnX3NldFVzZXJJZCcgfSk7XG5cbiAgICAvLyBTdGFydCBzZW5kaW5nIG1lc3NhZ2VzIGFnYWluLCBiZWdpbm5pbmcgd2l0aCB0aGUgZGlmZiBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHN0YXRlIG9mIHRoZSB3b3JsZCB0byB0aGUgY3VycmVudCBzdGF0ZS4gTm8geWllbGRzIGFyZSBhbGxvd2VkIGR1cmluZ1xuICAgIC8vIHRoaXMgZGlmZiwgc28gdGhhdCBvdGhlciBjaGFuZ2VzIGNhbm5vdCBpbnRlcmxlYXZlLlxuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX2lzU2VuZGluZyA9IHRydWU7XG4gICAgICBzZWxmLl9kaWZmQ29sbGVjdGlvblZpZXdzKGJlZm9yZUNWcyk7XG4gICAgICBpZiAoIWlzRW1wdHkoc2VsZi5fcGVuZGluZ1JlYWR5KSkge1xuICAgICAgICBzZWxmLnNlbmRSZWFkeShzZWxmLl9wZW5kaW5nUmVhZHkpO1xuICAgICAgICBzZWxmLl9wZW5kaW5nUmVhZHkgPSBbXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBfc3RhcnRTdWJzY3JpcHRpb246IGZ1bmN0aW9uIChoYW5kbGVyLCBzdWJJZCwgcGFyYW1zLCBuYW1lKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHN1YiA9IG5ldyBTdWJzY3JpcHRpb24oXG4gICAgICBzZWxmLCBoYW5kbGVyLCBzdWJJZCwgcGFyYW1zLCBuYW1lKTtcblxuICAgIGxldCB1bmJsb2NrSGFuZGVyID0gc2VsZi5jYWNoZWRVbmJsb2NrO1xuICAgIC8vIF9zdGFydFN1YnNjcmlwdGlvbiBtYXkgY2FsbCBmcm9tIGEgbG90IHBsYWNlc1xuICAgIC8vIHNvIGNhY2hlZFVuYmxvY2sgbWlnaHQgYmUgbnVsbCBpbiBzb21lY2FzZXNcbiAgICAvLyBhc3NpZ24gdGhlIGNhY2hlZFVuYmxvY2tcbiAgICBzdWIudW5ibG9jayA9IHVuYmxvY2tIYW5kZXIgfHwgKCgpID0+IHt9KTtcblxuICAgIGlmIChzdWJJZClcbiAgICAgIHNlbGYuX25hbWVkU3Vicy5zZXQoc3ViSWQsIHN1Yik7XG4gICAgZWxzZVxuICAgICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5wdXNoKHN1Yik7XG5cbiAgICByZXR1cm4gc3ViLl9ydW5IYW5kbGVyKCk7XG4gIH0sXG5cbiAgLy8gVGVhciBkb3duIHNwZWNpZmllZCBzdWJzY3JpcHRpb25cbiAgX3N0b3BTdWJzY3JpcHRpb246IGZ1bmN0aW9uIChzdWJJZCwgZXJyb3IpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgc3ViTmFtZSA9IG51bGw7XG4gICAgaWYgKHN1YklkKSB7XG4gICAgICB2YXIgbWF5YmVTdWIgPSBzZWxmLl9uYW1lZFN1YnMuZ2V0KHN1YklkKTtcbiAgICAgIGlmIChtYXliZVN1Yikge1xuICAgICAgICBzdWJOYW1lID0gbWF5YmVTdWIuX25hbWU7XG4gICAgICAgIG1heWJlU3ViLl9yZW1vdmVBbGxEb2N1bWVudHMoKTtcbiAgICAgICAgbWF5YmVTdWIuX2RlYWN0aXZhdGUoKTtcbiAgICAgICAgc2VsZi5fbmFtZWRTdWJzLmRlbGV0ZShzdWJJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3BvbnNlID0ge21zZzogJ25vc3ViJywgaWQ6IHN1YklkfTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgcmVzcG9uc2UuZXJyb3IgPSB3cmFwSW50ZXJuYWxFeGNlcHRpb24oXG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdWJOYW1lID8gKFwiZnJvbSBzdWIgXCIgKyBzdWJOYW1lICsgXCIgaWQgXCIgKyBzdWJJZClcbiAgICAgICAgICA6IChcImZyb20gc3ViIGlkIFwiICsgc3ViSWQpKTtcbiAgICB9XG5cbiAgICBzZWxmLnNlbmQocmVzcG9uc2UpO1xuICB9LFxuXG4gIC8vIFRlYXIgZG93biBhbGwgc3Vic2NyaXB0aW9ucy4gTm90ZSB0aGF0IHRoaXMgZG9lcyBOT1Qgc2VuZCByZW1vdmVkIG9yIG5vc3ViXG4gIC8vIG1lc3NhZ2VzLCBzaW5jZSB3ZSBhc3N1bWUgdGhlIGNsaWVudCBpcyBnb25lLlxuICBfZGVhY3RpdmF0ZUFsbFN1YnNjcmlwdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLl9uYW1lZFN1YnMuZm9yRWFjaChmdW5jdGlvbiAoc3ViLCBpZCkge1xuICAgICAgc3ViLl9kZWFjdGl2YXRlKCk7XG4gICAgfSk7XG4gICAgc2VsZi5fbmFtZWRTdWJzID0gbmV3IE1hcCgpO1xuXG4gICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5mb3JFYWNoKGZ1bmN0aW9uIChzdWIpIHtcbiAgICAgIHN1Yi5fZGVhY3RpdmF0ZSgpO1xuICAgIH0pO1xuICAgIHNlbGYuX3VuaXZlcnNhbFN1YnMgPSBbXTtcbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgdGhlIHJlbW90ZSBjbGllbnQncyBJUCBhZGRyZXNzLCBiYXNlZCBvbiB0aGVcbiAgLy8gSFRUUF9GT1JXQVJERURfQ09VTlQgZW52aXJvbm1lbnQgdmFyaWFibGUgcmVwcmVzZW50aW5nIGhvdyBtYW55XG4gIC8vIHByb3hpZXMgdGhlIHNlcnZlciBpcyBiZWhpbmQuXG4gIF9jbGllbnRBZGRyZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gRm9yIHRoZSByZXBvcnRlZCBjbGllbnQgYWRkcmVzcyBmb3IgYSBjb25uZWN0aW9uIHRvIGJlIGNvcnJlY3QsXG4gICAgLy8gdGhlIGRldmVsb3BlciBtdXN0IHNldCB0aGUgSFRUUF9GT1JXQVJERURfQ09VTlQgZW52aXJvbm1lbnRcbiAgICAvLyB2YXJpYWJsZSB0byBhbiBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGhvcHMgdGhleVxuICAgIC8vIGV4cGVjdCBpbiB0aGUgYHgtZm9yd2FyZGVkLWZvcmAgaGVhZGVyLiBFLmcuLCBzZXQgdG8gXCIxXCIgaWYgdGhlXG4gICAgLy8gc2VydmVyIGlzIGJlaGluZCBvbmUgcHJveHkuXG4gICAgLy9cbiAgICAvLyBUaGlzIGNvdWxkIGJlIGNvbXB1dGVkIG9uY2UgYXQgc3RhcnR1cCBpbnN0ZWFkIG9mIGV2ZXJ5IHRpbWUuXG4gICAgdmFyIGh0dHBGb3J3YXJkZWRDb3VudCA9IHBhcnNlSW50KHByb2Nlc3MuZW52WydIVFRQX0ZPUldBUkRFRF9DT1VOVCddKSB8fCAwO1xuXG4gICAgaWYgKGh0dHBGb3J3YXJkZWRDb3VudCA9PT0gMClcbiAgICAgIHJldHVybiBzZWxmLnNvY2tldC5yZW1vdGVBZGRyZXNzO1xuXG4gICAgdmFyIGZvcndhcmRlZEZvciA9IHNlbGYuc29ja2V0LmhlYWRlcnNbXCJ4LWZvcndhcmRlZC1mb3JcIl07XG4gICAgaWYgKCFpc1N0cmluZyhmb3J3YXJkZWRGb3IpKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgZm9yd2FyZGVkRm9yID0gZm9yd2FyZGVkRm9yLnNwbGl0KCcsJylcblxuICAgIC8vIFR5cGljYWxseSB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGB4LWZvcndhcmRlZC1mb3JgIGhlYWRlciBpc1xuICAgIC8vIHRoZSBvcmlnaW5hbCBJUCBhZGRyZXNzIG9mIHRoZSBjbGllbnQgY29ubmVjdGluZyB0byB0aGUgZmlyc3RcbiAgICAvLyBwcm94eS4gIEhvd2V2ZXIsIHRoZSBlbmQgdXNlciBjYW4gZWFzaWx5IHNwb29mIHRoZSBoZWFkZXIsIGluXG4gICAgLy8gd2hpY2ggY2FzZSB0aGUgZmlyc3QgdmFsdWUocykgd2lsbCBiZSB0aGUgZmFrZSBJUCBhZGRyZXNzIGZyb21cbiAgICAvLyB0aGUgdXNlciBwcmV0ZW5kaW5nIHRvIGJlIGEgcHJveHkgcmVwb3J0aW5nIHRoZSBvcmlnaW5hbCBJUFxuICAgIC8vIGFkZHJlc3MgdmFsdWUuICBCeSBjb3VudGluZyBIVFRQX0ZPUldBUkRFRF9DT1VOVCBiYWNrIGZyb20gdGhlXG4gICAgLy8gZW5kIG9mIHRoZSBsaXN0LCB3ZSBlbnN1cmUgdGhhdCB3ZSBnZXQgdGhlIElQIGFkZHJlc3MgYmVpbmdcbiAgICAvLyByZXBvcnRlZCBieSAqb3VyKiBmaXJzdCBwcm94eS5cblxuICAgIGlmIChodHRwRm9yd2FyZGVkQ291bnQgPCAwIHx8IGh0dHBGb3J3YXJkZWRDb3VudCAhPT0gZm9yd2FyZGVkRm9yLmxlbmd0aClcbiAgICAgIHJldHVybiBudWxsO1xuICAgIGZvcndhcmRlZEZvciA9IGZvcndhcmRlZEZvci5tYXAoKGlwKSA9PiBpcC50cmltKCkpO1xuICAgIHJldHVybiBmb3J3YXJkZWRGb3JbZm9yd2FyZGVkRm9yLmxlbmd0aCAtIGh0dHBGb3J3YXJkZWRDb3VudF07XG4gIH1cbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyogU3Vic2NyaXB0aW9uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEN0b3IgZm9yIGEgc3ViIGhhbmRsZTogdGhlIGlucHV0IHRvIGVhY2ggcHVibGlzaCBmdW5jdGlvblxuXG4vLyBJbnN0YW5jZSBuYW1lIGlzIHRoaXMgYmVjYXVzZSBpdCdzIHVzdWFsbHkgcmVmZXJyZWQgdG8gYXMgdGhpcyBpbnNpZGUgYVxuLy8gcHVibGlzaFxuLyoqXG4gKiBAc3VtbWFyeSBUaGUgc2VydmVyJ3Mgc2lkZSBvZiBhIHN1YnNjcmlwdGlvblxuICogQGNsYXNzIFN1YnNjcmlwdGlvblxuICogQGluc3RhbmNlTmFtZSB0aGlzXG4gKiBAc2hvd0luc3RhbmNlTmFtZSB0cnVlXG4gKi9cbnZhciBTdWJzY3JpcHRpb24gPSBmdW5jdGlvbiAoXG4gICAgc2Vzc2lvbiwgaGFuZGxlciwgc3Vic2NyaXB0aW9uSWQsIHBhcmFtcywgbmFtZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuX3Nlc3Npb24gPSBzZXNzaW9uOyAvLyB0eXBlIGlzIFNlc3Npb25cblxuICAvKipcbiAgICogQHN1bW1hcnkgQWNjZXNzIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gVGhlIGluY29taW5nIFtjb25uZWN0aW9uXSgjbWV0ZW9yX29uY29ubmVjdGlvbikgZm9yIHRoaXMgc3Vic2NyaXB0aW9uLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBuYW1lICBjb25uZWN0aW9uXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZWxmLmNvbm5lY3Rpb24gPSBzZXNzaW9uLmNvbm5lY3Rpb25IYW5kbGU7IC8vIHB1YmxpYyBBUEkgb2JqZWN0XG5cbiAgc2VsZi5faGFuZGxlciA9IGhhbmRsZXI7XG5cbiAgLy8gTXkgc3Vic2NyaXB0aW9uIElEIChnZW5lcmF0ZWQgYnkgY2xpZW50LCB1bmRlZmluZWQgZm9yIHVuaXZlcnNhbCBzdWJzKS5cbiAgc2VsZi5fc3Vic2NyaXB0aW9uSWQgPSBzdWJzY3JpcHRpb25JZDtcbiAgLy8gVW5kZWZpbmVkIGZvciB1bml2ZXJzYWwgc3Vic1xuICBzZWxmLl9uYW1lID0gbmFtZTtcblxuICBzZWxmLl9wYXJhbXMgPSBwYXJhbXMgfHwgW107XG5cbiAgLy8gT25seSBuYW1lZCBzdWJzY3JpcHRpb25zIGhhdmUgSURzLCBidXQgd2UgbmVlZCBzb21lIHNvcnQgb2Ygc3RyaW5nXG4gIC8vIGludGVybmFsbHkgdG8ga2VlcCB0cmFjayBvZiBhbGwgc3Vic2NyaXB0aW9ucyBpbnNpZGVcbiAgLy8gU2Vzc2lvbkRvY3VtZW50Vmlld3MuIFdlIHVzZSB0aGlzIHN1YnNjcmlwdGlvbkhhbmRsZSBmb3IgdGhhdC5cbiAgaWYgKHNlbGYuX3N1YnNjcmlwdGlvbklkKSB7XG4gICAgc2VsZi5fc3Vic2NyaXB0aW9uSGFuZGxlID0gJ04nICsgc2VsZi5fc3Vic2NyaXB0aW9uSWQ7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc3Vic2NyaXB0aW9uSGFuZGxlID0gJ1UnICsgUmFuZG9tLmlkKCk7XG4gIH1cblxuICAvLyBIYXMgX2RlYWN0aXZhdGUgYmVlbiBjYWxsZWQ/XG4gIHNlbGYuX2RlYWN0aXZhdGVkID0gZmFsc2U7XG5cbiAgLy8gU3RvcCBjYWxsYmFja3MgdG8gZy9jIHRoaXMgc3ViLiAgY2FsbGVkIHcvIHplcm8gYXJndW1lbnRzLlxuICBzZWxmLl9zdG9wQ2FsbGJhY2tzID0gW107XG5cbiAgLy8gVGhlIHNldCBvZiAoY29sbGVjdGlvbiwgZG9jdW1lbnRpZCkgdGhhdCB0aGlzIHN1YnNjcmlwdGlvbiBoYXNcbiAgLy8gYW4gb3BpbmlvbiBhYm91dC5cbiAgc2VsZi5fZG9jdW1lbnRzID0gbmV3IE1hcCgpO1xuXG4gIC8vIFJlbWVtYmVyIGlmIHdlIGFyZSByZWFkeS5cbiAgc2VsZi5fcmVhZHkgPSBmYWxzZTtcblxuICAvLyBQYXJ0IG9mIHRoZSBwdWJsaWMgQVBJOiB0aGUgdXNlciBvZiB0aGlzIHN1Yi5cblxuICAvKipcbiAgICogQHN1bW1hcnkgQWNjZXNzIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gVGhlIGlkIG9mIHRoZSBsb2dnZWQtaW4gdXNlciwgb3IgYG51bGxgIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQG5hbWUgIHVzZXJJZFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNlbGYudXNlcklkID0gc2Vzc2lvbi51c2VySWQ7XG5cbiAgLy8gRm9yIG5vdywgdGhlIGlkIGZpbHRlciBpcyBnb2luZyB0byBkZWZhdWx0IHRvXG4gIC8vIHRoZSB0by9mcm9tIEREUCBtZXRob2RzIG9uIE1vbmdvSUQsIHRvXG4gIC8vIHNwZWNpZmljYWxseSBkZWFsIHdpdGggbW9uZ28vbWluaW1vbmdvIE9iamVjdElkcy5cblxuICAvLyBMYXRlciwgeW91IHdpbGwgYmUgYWJsZSB0byBtYWtlIHRoaXMgYmUgXCJyYXdcIlxuICAvLyBpZiB5b3Ugd2FudCB0byBwdWJsaXNoIGEgY29sbGVjdGlvbiB0aGF0IHlvdSBrbm93XG4gIC8vIGp1c3QgaGFzIHN0cmluZ3MgZm9yIGtleXMgYW5kIG5vIGZ1bm55IGJ1c2luZXNzLCB0b1xuICAvLyBhIEREUCBjb25zdW1lciB0aGF0IGlzbid0IG1pbmltb25nby5cblxuICBzZWxmLl9pZEZpbHRlciA9IHtcbiAgICBpZFN0cmluZ2lmeTogTW9uZ29JRC5pZFN0cmluZ2lmeSxcbiAgICBpZFBhcnNlOiBNb25nb0lELmlkUGFyc2VcbiAgfTtcblxuICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgXCJsaXZlZGF0YVwiLCBcInN1YnNjcmlwdGlvbnNcIiwgMSk7XG59O1xuXG5PYmplY3QuYXNzaWduKFN1YnNjcmlwdGlvbi5wcm90b3R5cGUsIHtcbiAgX3J1bkhhbmRsZXI6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIC8vIFhYWCBzaG91bGQgd2UgdW5ibG9jaygpIGhlcmU/IEVpdGhlciBiZWZvcmUgcnVubmluZyB0aGUgcHVibGlzaFxuICAgIC8vIGZ1bmN0aW9uLCBvciBiZWZvcmUgcnVubmluZyBfcHVibGlzaEN1cnNvci5cbiAgICAvL1xuICAgIC8vIFJpZ2h0IG5vdywgZWFjaCBwdWJsaXNoIGZ1bmN0aW9uIGJsb2NrcyBhbGwgZnV0dXJlIHB1Ymxpc2hlcyBhbmRcbiAgICAvLyBtZXRob2RzIHdhaXRpbmcgb24gZGF0YSBmcm9tIE1vbmdvIChvciB3aGF0ZXZlciBlbHNlIHRoZSBmdW5jdGlvblxuICAgIC8vIGJsb2NrcyBvbikuIFRoaXMgcHJvYmFibHkgc2xvd3MgcGFnZSBsb2FkIGluIGNvbW1vbiBjYXNlcy5cblxuICAgIGlmICghdGhpcy51bmJsb2NrKSB7XG4gICAgICB0aGlzLnVuYmxvY2sgPSAoKSA9PiB7fTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBsZXQgcmVzdWx0T3JUaGVuYWJsZSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdE9yVGhlbmFibGUgPSBERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24ud2l0aFZhbHVlKFxuICAgICAgICBzZWxmLFxuICAgICAgICAoKSA9PlxuICAgICAgICAgIG1heWJlQXVkaXRBcmd1bWVudENoZWNrcyhcbiAgICAgICAgICAgIHNlbGYuX2hhbmRsZXIsXG4gICAgICAgICAgICBzZWxmLFxuICAgICAgICAgICAgRUpTT04uY2xvbmUoc2VsZi5fcGFyYW1zKSxcbiAgICAgICAgICAgIC8vIEl0J3MgT0sgdGhhdCB0aGlzIHdvdWxkIGxvb2sgd2VpcmQgZm9yIHVuaXZlcnNhbCBzdWJzY3JpcHRpb25zLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGV5IGhhdmUgbm8gYXJndW1lbnRzIHNvIHRoZXJlIGNhbiBuZXZlciBiZSBhblxuICAgICAgICAgICAgLy8gYXVkaXQtYXJndW1lbnQtY2hlY2tzIGZhaWx1cmUuXG4gICAgICAgICAgICBcInB1Ymxpc2hlciAnXCIgKyBzZWxmLl9uYW1lICsgXCInXCJcbiAgICAgICAgICApLFxuICAgICAgICB7IG5hbWU6IHNlbGYuX25hbWUgfVxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZWxmLmVycm9yKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERpZCB0aGUgaGFuZGxlciBjYWxsIHRoaXMuZXJyb3Igb3IgdGhpcy5zdG9wP1xuICAgIGlmIChzZWxmLl9pc0RlYWN0aXZhdGVkKCkpIHJldHVybjtcblxuICAgIC8vIEJvdGggY29udmVudGlvbmFsIGFuZCBhc3luYyBwdWJsaXNoIGhhbmRsZXIgZnVuY3Rpb25zIGFyZSBzdXBwb3J0ZWQuXG4gICAgLy8gSWYgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggYSB0aGVuKCkgZnVuY3Rpb24sIGl0IGlzIGVpdGhlciBhIHByb21pc2VcbiAgICAvLyBvciB0aGVuYWJsZSBhbmQgd2lsbCBiZSByZXNvbHZlZCBhc3luY2hyb25vdXNseS5cbiAgICBjb25zdCBpc1RoZW5hYmxlID1cbiAgICAgIHJlc3VsdE9yVGhlbmFibGUgJiYgdHlwZW9mIHJlc3VsdE9yVGhlbmFibGUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbiAgICBpZiAoaXNUaGVuYWJsZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2VsZi5fcHVibGlzaEhhbmRsZXJSZXN1bHQoYXdhaXQgcmVzdWx0T3JUaGVuYWJsZSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgc2VsZi5lcnJvcihlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCBzZWxmLl9wdWJsaXNoSGFuZGxlclJlc3VsdChyZXN1bHRPclRoZW5hYmxlKTtcbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgX3B1Ymxpc2hIYW5kbGVyUmVzdWx0IChyZXMpIHtcbiAgICAvLyBTUEVDSUFMIENBU0U6IEluc3RlYWQgb2Ygd3JpdGluZyB0aGVpciBvd24gY2FsbGJhY2tzIHRoYXQgaW52b2tlXG4gICAgLy8gdGhpcy5hZGRlZC9jaGFuZ2VkL3JlYWR5L2V0YywgdGhlIHVzZXIgY2FuIGp1c3QgcmV0dXJuIGEgY29sbGVjdGlvblxuICAgIC8vIGN1cnNvciBvciBhcnJheSBvZiBjdXJzb3JzIGZyb20gdGhlIHB1Ymxpc2ggZnVuY3Rpb247IHdlIGNhbGwgdGhlaXJcbiAgICAvLyBfcHVibGlzaEN1cnNvciBtZXRob2Qgd2hpY2ggc3RhcnRzIG9ic2VydmluZyB0aGUgY3Vyc29yIGFuZCBwdWJsaXNoZXMgdGhlXG4gICAgLy8gcmVzdWx0cy4gTm90ZSB0aGF0IF9wdWJsaXNoQ3Vyc29yIGRvZXMgTk9UIGNhbGwgcmVhZHkoKS5cbiAgICAvL1xuICAgIC8vIFhYWCBUaGlzIHVzZXMgYW4gdW5kb2N1bWVudGVkIGludGVyZmFjZSB3aGljaCBvbmx5IHRoZSBNb25nbyBjdXJzb3JcbiAgICAvLyBpbnRlcmZhY2UgcHVibGlzaGVzLiBTaG91bGQgd2UgbWFrZSB0aGlzIGludGVyZmFjZSBwdWJsaWMgYW5kIGVuY291cmFnZVxuICAgIC8vIHVzZXJzIHRvIGltcGxlbWVudCBpdCB0aGVtc2VsdmVzPyBBcmd1YWJseSwgaXQncyB1bm5lY2Vzc2FyeTsgdXNlcnMgY2FuXG4gICAgLy8gYWxyZWFkeSB3cml0ZSB0aGVpciBvd24gZnVuY3Rpb25zIGxpa2VcbiAgICAvLyAgIHZhciBwdWJsaXNoTXlSZWFjdGl2ZVRoaW5neSA9IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyKSB7XG4gICAgLy8gICAgIE1ldGVvci5wdWJsaXNoKG5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgICB2YXIgcmVhY3RpdmVUaGluZ3kgPSBoYW5kbGVyKCk7XG4gICAgLy8gICAgICAgcmVhY3RpdmVUaGluZ3kucHVibGlzaE1lKCk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgaXNDdXJzb3IgPSBmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIGMgJiYgYy5fcHVibGlzaEN1cnNvcjtcbiAgICB9O1xuICAgIGlmIChpc0N1cnNvcihyZXMpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCByZXMuX3B1Ymxpc2hDdXJzb3Ioc2VsZik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNlbGYuZXJyb3IoZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIF9wdWJsaXNoQ3Vyc29yIG9ubHkgcmV0dXJucyBhZnRlciB0aGUgaW5pdGlhbCBhZGRlZCBjYWxsYmFja3MgaGF2ZSBydW4uXG4gICAgICAvLyBtYXJrIHN1YnNjcmlwdGlvbiBhcyByZWFkeS5cbiAgICAgIHNlbGYucmVhZHkoKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVzKSkge1xuICAgICAgLy8gQ2hlY2sgYWxsIHRoZSBlbGVtZW50cyBhcmUgY3Vyc29yc1xuICAgICAgaWYgKCEgcmVzLmV2ZXJ5KGlzQ3Vyc29yKSkge1xuICAgICAgICBzZWxmLmVycm9yKG5ldyBFcnJvcihcIlB1Ymxpc2ggZnVuY3Rpb24gcmV0dXJuZWQgYW4gYXJyYXkgb2Ygbm9uLUN1cnNvcnNcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBGaW5kIGR1cGxpY2F0ZSBjb2xsZWN0aW9uIG5hbWVzXG4gICAgICAvLyBYWFggd2Ugc2hvdWxkIHN1cHBvcnQgb3ZlcmxhcHBpbmcgY3Vyc29ycywgYnV0IHRoYXQgd291bGQgcmVxdWlyZSB0aGVcbiAgICAgIC8vIG1lcmdlIGJveCB0byBhbGxvdyBvdmVybGFwIHdpdGhpbiBhIHN1YnNjcmlwdGlvblxuICAgICAgdmFyIGNvbGxlY3Rpb25OYW1lcyA9IHt9O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY29sbGVjdGlvbk5hbWUgPSByZXNbaV0uX2dldENvbGxlY3Rpb25OYW1lKCk7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uTmFtZXNbY29sbGVjdGlvbk5hbWVdKSB7XG4gICAgICAgICAgc2VsZi5lcnJvcihuZXcgRXJyb3IoXG4gICAgICAgICAgICBcIlB1Ymxpc2ggZnVuY3Rpb24gcmV0dXJuZWQgbXVsdGlwbGUgY3Vyc29ycyBmb3IgY29sbGVjdGlvbiBcIiArXG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25OYW1lKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbGxlY3Rpb25OYW1lc1tjb2xsZWN0aW9uTmFtZV0gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChyZXMubWFwKGN1ciA9PiBjdXIuX3B1Ymxpc2hDdXJzb3Ioc2VsZikpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2VsZi5lcnJvcihlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VsZi5yZWFkeSgpO1xuICAgIH0gZWxzZSBpZiAocmVzKSB7XG4gICAgICAvLyBUcnV0aHkgdmFsdWVzIG90aGVyIHRoYW4gY3Vyc29ycyBvciBhcnJheXMgYXJlIHByb2JhYmx5IGFcbiAgICAgIC8vIHVzZXIgbWlzdGFrZSAocG9zc2libGUgcmV0dXJuaW5nIGEgTW9uZ28gZG9jdW1lbnQgdmlhLCBzYXksXG4gICAgICAvLyBgY29sbC5maW5kT25lKClgKS5cbiAgICAgIHNlbGYuZXJyb3IobmV3IEVycm9yKFwiUHVibGlzaCBmdW5jdGlvbiBjYW4gb25seSByZXR1cm4gYSBDdXJzb3Igb3IgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCJhbiBhcnJheSBvZiBDdXJzb3JzXCIpKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gVGhpcyBjYWxscyBhbGwgc3RvcCBjYWxsYmFja3MgYW5kIHByZXZlbnRzIHRoZSBoYW5kbGVyIGZyb20gdXBkYXRpbmcgYW55XG4gIC8vIFNlc3Npb25Db2xsZWN0aW9uVmlld3MgZnVydGhlci4gSXQncyB1c2VkIHdoZW4gdGhlIHVzZXIgdW5zdWJzY3JpYmVzIG9yXG4gIC8vIGRpc2Nvbm5lY3RzLCBhcyB3ZWxsIGFzIGR1cmluZyBzZXRVc2VySWQgcmUtcnVucy4gSXQgZG9lcyAqTk9UKiBzZW5kXG4gIC8vIHJlbW92ZWQgbWVzc2FnZXMgZm9yIHRoZSBwdWJsaXNoZWQgb2JqZWN0czsgaWYgdGhhdCBpcyBuZWNlc3NhcnksIGNhbGxcbiAgLy8gX3JlbW92ZUFsbERvY3VtZW50cyBmaXJzdC5cbiAgX2RlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9kZWFjdGl2YXRlZClcbiAgICAgIHJldHVybjtcbiAgICB0aGlzLl9kZWFjdGl2YXRlZCA9IHRydWU7XG4gICAgdGhpcy5fY2FsbFN0b3BDYWxsYmFja3MoKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEJyZWFrIHJlZmVyZW5jZSBjaGFpbnMgdG8gYWxsb3cgR0Mgb2YgdGhlIFNlc3Npb24gYW5kIGl0cyBkYXRhLlxuICAgICAgLy8gV2l0aG91dCB0aGlzLCBkZWFjdGl2YXRlZCBzdWJzY3JpcHRpb25zIHJldGFpbiBsaXZlIHJlZmVyZW5jZXNcbiAgICAgIC8vIHRvIHRoZSAobm93LWNsb3NlZCkgc2Vzc2lvbiBpbmRlZmluaXRlbHkuXG4gICAgICB0aGlzLl9zZXNzaW9uID0gbnVsbDtcbiAgICAgIHRoaXMuX2RvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgICB9KTtcbiAgICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICBcImxpdmVkYXRhXCIsIFwic3Vic2NyaXB0aW9uc1wiLCAtMSk7XG4gIH0sXG5cbiAgX2NhbGxTdG9wQ2FsbGJhY2tzOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSW4gTWV0ZW9yIDMsIG9uU3RvcCBjYWxsYmFja3MgY2FuIGJlIGFzeW5jIChlLmcuIG9ic2VydmVIYW5kbGUuc3RvcCgpXG4gICAgLy8gcmV0dXJucyBhIFByb21pc2UpLiBXZSBtdXN0IGF3YWl0IGVhY2ggb25lIHNvIHRoYXQgb2JzZXJ2ZXIgdGVhcmRvd25cbiAgICAvLyBjb21wbGV0ZXMgYmVmb3JlIHRoZSBzdWJzY3JpcHRpb24gaXMgY29uc2lkZXJlZCBmdWxseSBkZWFjdGl2YXRlZC5cbiAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9zdG9wQ2FsbGJhY2tzO1xuICAgIHRoaXMuX3N0b3BDYWxsYmFja3MgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIGNhbGxiYWNrcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2FsbGJhY2soKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkV4Y2VwdGlvbiBpbiBvblN0b3AgY2FsbGJhY2s6XCIsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBTZW5kIHJlbW92ZSBtZXNzYWdlcyBmb3IgZXZlcnkgZG9jdW1lbnQuXG4gIF9yZW1vdmVBbGxEb2N1bWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fZG9jdW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGNvbGxlY3Rpb25Eb2NzLCBjb2xsZWN0aW9uTmFtZSkge1xuICAgICAgICBjb2xsZWN0aW9uRG9jcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHJJZCkge1xuICAgICAgICAgIHNlbGYucmVtb3ZlZChjb2xsZWN0aW9uTmFtZSwgc2VsZi5faWRGaWx0ZXIuaWRQYXJzZShzdHJJZCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFJldHVybnMgYSBuZXcgU3Vic2NyaXB0aW9uIGZvciB0aGUgc2FtZSBzZXNzaW9uIHdpdGggdGhlIHNhbWVcbiAgLy8gaW5pdGlhbCBjcmVhdGlvbiBwYXJhbWV0ZXJzLiBUaGlzIGlzbid0IGEgY2xvbmU6IGl0IGRvZXNuJ3QgaGF2ZVxuICAvLyB0aGUgc2FtZSBfZG9jdW1lbnRzIGNhY2hlLCBzdG9wcGVkIHN0YXRlIG9yIGNhbGxiYWNrczsgbWF5IGhhdmUgYVxuICAvLyBkaWZmZXJlbnQgX3N1YnNjcmlwdGlvbkhhbmRsZSwgYW5kIGdldHMgaXRzIHVzZXJJZCBmcm9tIHRoZVxuICAvLyBzZXNzaW9uLCBub3QgZnJvbSB0aGlzIG9iamVjdC5cbiAgX3JlY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgU3Vic2NyaXB0aW9uKFxuICAgICAgc2VsZi5fc2Vzc2lvbiwgc2VsZi5faGFuZGxlciwgc2VsZi5fc3Vic2NyaXB0aW9uSWQsIHNlbGYuX3BhcmFtcyxcbiAgICAgIHNlbGYuX25hbWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIFN0b3BzIHRoaXMgY2xpZW50J3Mgc3Vic2NyaXB0aW9uLCB0cmlnZ2VyaW5nIGEgY2FsbCBvbiB0aGUgY2xpZW50IHRvIHRoZSBgb25TdG9wYCBjYWxsYmFjayBwYXNzZWQgdG8gW2BNZXRlb3Iuc3Vic2NyaWJlYF0oI21ldGVvcl9zdWJzY3JpYmUpLCBpZiBhbnkuIElmIGBlcnJvcmAgaXMgbm90IGEgW2BNZXRlb3IuRXJyb3JgXSgjbWV0ZW9yX2Vycm9yKSwgaXQgd2lsbCBiZSBbc2FuaXRpemVkXSgjbWV0ZW9yX2Vycm9yKS5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gcGFzcyB0byB0aGUgY2xpZW50LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKi9cbiAgZXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYuX3Nlc3Npb24uX3N0b3BTdWJzY3JpcHRpb24oc2VsZi5fc3Vic2NyaXB0aW9uSWQsIGVycm9yKTtcbiAgfSxcblxuICAvLyBOb3RlIHRoYXQgd2hpbGUgb3VyIEREUCBjbGllbnQgd2lsbCBub3RpY2UgdGhhdCB5b3UndmUgY2FsbGVkIHN0b3AoKSBvbiB0aGVcbiAgLy8gc2VydmVyIChhbmQgY2xlYW4gdXAgaXRzIF9zdWJzY3JpcHRpb25zIHRhYmxlKSB3ZSBkb24ndCBhY3R1YWxseSBwcm92aWRlIGFcbiAgLy8gbWVjaGFuaXNtIGZvciBhbiBhcHAgdG8gbm90aWNlIHRoaXMgKHRoZSBzdWJzY3JpYmUgb25FcnJvciBjYWxsYmFjayBvbmx5XG4gIC8vIHRyaWdnZXJzIGlmIHRoZXJlIGlzIGFuIGVycm9yKS5cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FsbCBpbnNpZGUgdGhlIHB1Ymxpc2ggZnVuY3Rpb24uICBTdG9wcyB0aGlzIGNsaWVudCdzIHN1YnNjcmlwdGlvbiBhbmQgaW52b2tlcyB0aGUgY2xpZW50J3MgYG9uU3RvcGAgY2FsbGJhY2sgd2l0aCBubyBlcnJvci5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKi9cbiAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYuX3Nlc3Npb24uX3N0b3BTdWJzY3JpcHRpb24oc2VsZi5fc3Vic2NyaXB0aW9uSWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZC5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgb25TdG9wOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY2FsbGJhY2sgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KGNhbGxiYWNrLCAnb25TdG9wIGNhbGxiYWNrJywgc2VsZik7XG4gICAgaWYgKHNlbGYuX2lzRGVhY3RpdmF0ZWQoKSlcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgZWxzZVxuICAgICAgc2VsZi5fc3RvcENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgfSxcblxuICAvLyBUaGlzIHJldHVybnMgdHJ1ZSBpZiB0aGUgc3ViIGhhcyBiZWVuIGRlYWN0aXZhdGVkLCAqT1IqIGlmIHRoZSBzZXNzaW9uIHdhc1xuICAvLyBkZXN0cm95ZWQgYnV0IHRoZSBkZWZlcnJlZCBjYWxsIHRvIF9kZWFjdGl2YXRlQWxsU3Vic2NyaXB0aW9ucyBoYXNuJ3RcbiAgLy8gaGFwcGVuZWQgeWV0LlxuICBfaXNEZWFjdGl2YXRlZDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kZWFjdGl2YXRlZCB8fCAhdGhpcy5fc2Vzc2lvbiB8fCB0aGlzLl9zZXNzaW9uLmluUXVldWUgPT09IG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENhbGwgaW5zaWRlIHRoZSBwdWJsaXNoIGZ1bmN0aW9uLiAgSW5mb3JtcyB0aGUgc3Vic2NyaWJlciB0aGF0IGEgZG9jdW1lbnQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHJlY29yZCBzZXQuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxlY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGNvbGxlY3Rpb24gdGhhdCBjb250YWlucyB0aGUgbmV3IGRvY3VtZW50LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgVGhlIG5ldyBkb2N1bWVudCdzIElELlxuICAgKiBAcGFyYW0ge09iamVjdH0gZmllbGRzIFRoZSBmaWVsZHMgaW4gdGhlIG5ldyBkb2N1bWVudC4gIElmIGBfaWRgIGlzIHByZXNlbnQgaXQgaXMgaWdub3JlZC5cbiAgICovXG4gIGFkZGVkIChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgIGlmICh0aGlzLl9pc0RlYWN0aXZhdGVkKCkpXG4gICAgICByZXR1cm47XG4gICAgaWQgPSB0aGlzLl9pZEZpbHRlci5pZFN0cmluZ2lmeShpZCk7XG5cbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSkuZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbikge1xuICAgICAgbGV0IGlkcyA9IHRoaXMuX2RvY3VtZW50cy5nZXQoY29sbGVjdGlvbk5hbWUpO1xuICAgICAgaWYgKGlkcyA9PSBudWxsKSB7XG4gICAgICAgIGlkcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRzLnNldChjb2xsZWN0aW9uTmFtZSwgaWRzKTtcbiAgICAgIH1cbiAgICAgIGlkcy5hZGQoaWQpO1xuICAgIH1cblxuICAgIHRoaXMuX3Nlc3Npb24uYWRkZWQodGhpcy5fc3Vic2NyaXB0aW9uSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENhbGwgaW5zaWRlIHRoZSBwdWJsaXNoIGZ1bmN0aW9uLiAgSW5mb3JtcyB0aGUgc3Vic2NyaWJlciB0aGF0IGEgZG9jdW1lbnQgaW4gdGhlIHJlY29yZCBzZXQgaGFzIGJlZW4gbW9kaWZpZWQuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxlY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGNvbGxlY3Rpb24gdGhhdCBjb250YWlucyB0aGUgY2hhbmdlZCBkb2N1bWVudC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSBjaGFuZ2VkIGRvY3VtZW50J3MgSUQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmaWVsZHMgVGhlIGZpZWxkcyBpbiB0aGUgZG9jdW1lbnQgdGhhdCBoYXZlIGNoYW5nZWQsIHRvZ2V0aGVyIHdpdGggdGhlaXIgbmV3IHZhbHVlcy4gIElmIGEgZmllbGQgaXMgbm90IHByZXNlbnQgaW4gYGZpZWxkc2AgaXQgd2FzIGxlZnQgdW5jaGFuZ2VkOyBpZiBpdCBpcyBwcmVzZW50IGluIGBmaWVsZHNgIGFuZCBoYXMgYSB2YWx1ZSBvZiBgdW5kZWZpbmVkYCBpdCB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudC4gIElmIGBfaWRgIGlzIHByZXNlbnQgaXQgaXMgaWdub3JlZC5cbiAgICovXG4gIGNoYW5nZWQgKGNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKSB7XG4gICAgaWYgKHRoaXMuX2lzRGVhY3RpdmF0ZWQoKSlcbiAgICAgIHJldHVybjtcbiAgICBpZCA9IHRoaXMuX2lkRmlsdGVyLmlkU3RyaW5naWZ5KGlkKTtcbiAgICB0aGlzLl9zZXNzaW9uLmNoYW5nZWQodGhpcy5fc3Vic2NyaXB0aW9uSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENhbGwgaW5zaWRlIHRoZSBwdWJsaXNoIGZ1bmN0aW9uLiAgSW5mb3JtcyB0aGUgc3Vic2NyaWJlciB0aGF0IGEgZG9jdW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSByZWNvcmQgc2V0LlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBuYW1lIG9mIHRoZSBjb2xsZWN0aW9uIHRoYXQgdGhlIGRvY3VtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSBJRCBvZiB0aGUgZG9jdW1lbnQgdGhhdCBoYXMgYmVlbiByZW1vdmVkLlxuICAgKi9cbiAgcmVtb3ZlZCAoY29sbGVjdGlvbk5hbWUsIGlkKSB7XG4gICAgaWYgKHRoaXMuX2lzRGVhY3RpdmF0ZWQoKSlcbiAgICAgIHJldHVybjtcbiAgICBpZCA9IHRoaXMuX2lkRmlsdGVyLmlkU3RyaW5naWZ5KGlkKTtcblxuICAgIGlmICh0aGlzLl9zZXNzaW9uLnNlcnZlci5nZXRQdWJsaWNhdGlvblN0cmF0ZWd5KGNvbGxlY3Rpb25OYW1lKS5kb0FjY291bnRpbmdGb3JDb2xsZWN0aW9uKSB7XG4gICAgICAvLyBXZSBkb24ndCBib3RoZXIgdG8gZGVsZXRlIHNldHMgb2YgdGhpbmdzIGluIGEgY29sbGVjdGlvbiBpZiB0aGVcbiAgICAgIC8vIGNvbGxlY3Rpb24gaXMgZW1wdHkuICBJdCBjb3VsZCBicmVhayBfcmVtb3ZlQWxsRG9jdW1lbnRzLlxuICAgICAgdGhpcy5fZG9jdW1lbnRzLmdldChjb2xsZWN0aW9uTmFtZSkuZGVsZXRlKGlkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLnJlbW92ZWQodGhpcy5fc3Vic2NyaXB0aW9uSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgaWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIEluZm9ybXMgdGhlIHN1YnNjcmliZXIgdGhhdCBhbiBpbml0aWFsLCBjb21wbGV0ZSBzbmFwc2hvdCBvZiB0aGUgcmVjb3JkIHNldCBoYXMgYmVlbiBzZW50LiAgVGhpcyB3aWxsIHRyaWdnZXIgYSBjYWxsIG9uIHRoZSBjbGllbnQgdG8gdGhlIGBvblJlYWR5YCBjYWxsYmFjayBwYXNzZWQgdG8gIFtgTWV0ZW9yLnN1YnNjcmliZWBdKCNtZXRlb3Jfc3Vic2NyaWJlKSwgaWYgYW55LlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICByZWFkeTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICghc2VsZi5fc3Vic2NyaXB0aW9uSWQpXG4gICAgICByZXR1cm47ICAvLyBVbm5lY2Vzc2FyeSBidXQgaWdub3JlZCBmb3IgdW5pdmVyc2FsIHN1YlxuICAgIGlmICghc2VsZi5fcmVhZHkpIHtcbiAgICAgIHNlbGYuX3Nlc3Npb24uc2VuZFJlYWR5KFtzZWxmLl9zdWJzY3JpcHRpb25JZF0pO1xuICAgICAgc2VsZi5fcmVhZHkgPSB0cnVlO1xuICAgIH1cbiAgfVxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiBTZXJ2ZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuU2VydmVyID0gZnVuY3Rpb24gKG9wdGlvbnMgPSB7fSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gVGhlIGRlZmF1bHQgaGVhcnRiZWF0IGludGVydmFsIGlzIDMwIHNlY29uZHMgb24gdGhlIHNlcnZlciBhbmQgMzVcbiAgLy8gc2Vjb25kcyBvbiB0aGUgY2xpZW50LiAgU2luY2UgdGhlIGNsaWVudCBkb2Vzbid0IG5lZWQgdG8gc2VuZCBhXG4gIC8vIHBpbmcgYXMgbG9uZyBhcyBpdCBpcyByZWNlaXZpbmcgcGluZ3MsIHRoaXMgbWVhbnMgdGhhdCBwaW5nc1xuICAvLyBub3JtYWxseSBnbyBmcm9tIHRoZSBzZXJ2ZXIgdG8gdGhlIGNsaWVudC5cbiAgLy9cbiAgLy8gTm90ZTogVHJvcG9zcGhlcmUgZGVwZW5kcyBvbiB0aGUgYWJpbGl0eSB0byBtdXRhdGVcbiAgLy8gTWV0ZW9yLnNlcnZlci5vcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQhIFRoaXMgaXMgYSBoYWNrLCBidXQgaXQncyBsaWZlLlxuICBzZWxmLm9wdGlvbnMgPSB7XG4gICAgaGVhcnRiZWF0SW50ZXJ2YWw6IDE1MDAwLFxuICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IDE1MDAwLFxuICAgIC8vIEZvciB0ZXN0aW5nLCBhbGxvdyByZXNwb25kaW5nIHRvIHBpbmdzIHRvIGJlIGRpc2FibGVkLlxuICAgIHJlc3BvbmRUb1BpbmdzOiB0cnVlLFxuICAgIGRlZmF1bHRQdWJsaWNhdGlvblN0cmF0ZWd5OiBwdWJsaWNhdGlvblN0cmF0ZWdpZXMuU0VSVkVSX01FUkdFLFxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IEhvdyBtYW55IG1lc3NhZ2VzIHNob3VsZCB3ZSBxdWV1ZSBkdXJpbmcgYSBub24tZ3JhY2VmdWwgZGlzY29ubmVjdCBiZWZvcmUgd2UgZGVzdHJveSB0aGUgc2Vzc2lvbiwgdG8gaGVscCBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICAgKi9cbiAgICBtYXhNZXNzYWdlUXVldWVMZW5ndGg6IDEwMCxcbiAgICAvKipcbiAgICAgKiBAc3VtbWFyeSBIb3cgbG9uZyB3ZSBzaG91bGQgbWFpbnRhaW4gYSBzZXNzaW9uIGZvciBhZnRlciBhIG5vbi1ncmFjZWZ1bCBkaXNjb25uZWN0IGJlZm9yZSBraWxsaW5nIGl0XG4gICAgICogICAgICAgICAgc2Vzc2lvbnMgdGhhdCByZWNvbm5lY3Qgd2l0aGluIHRoaXMgdGltZSB3aWxsIGJlIHJlc3VtZWQgd2l0aCBtaW5pbWFsIHBlcmZvcm1hbmNlIGltcGFjdC5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0R3JhY2VQZXJpb2Q6IDE1MDAwLFxuICAgIC4uLm9wdGlvbnMsXG4gIH07XG5cbiAgLy8gTWFwIG9mIGNhbGxiYWNrcyB0byBjYWxsIHdoZW4gYSBuZXcgY29ubmVjdGlvbiBjb21lcyBpbiB0byB0aGVcbiAgLy8gc2VydmVyIGFuZCBjb21wbGV0ZXMgRERQIHZlcnNpb24gbmVnb3RpYXRpb24uIFVzZSBhbiBvYmplY3QgaW5zdGVhZFxuICAvLyBvZiBhbiBhcnJheSBzbyB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBvbmUgZnJvbSB0aGUgbGlzdCB3aGlsZVxuICAvLyBpdGVyYXRpbmcgb3ZlciBpdC5cbiAgc2VsZi5vbkNvbm5lY3Rpb25Ib29rID0gbmV3IEhvb2soe1xuICAgIGRlYnVnUHJpbnRFeGNlcHRpb25zOiBcIm9uQ29ubmVjdGlvbiBjYWxsYmFja1wiXG4gIH0pO1xuXG4gIC8vIE1hcCBvZiBjYWxsYmFja3MgdG8gY2FsbCB3aGVuIGEgbmV3IG1lc3NhZ2UgY29tZXMgaW4uXG4gIHNlbGYub25NZXNzYWdlSG9vayA9IG5ldyBIb29rKHtcbiAgICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogXCJvbk1lc3NhZ2UgY2FsbGJhY2tcIlxuICB9KTtcblxuICBzZWxmLnB1Ymxpc2hfaGFuZGxlcnMgPSB7fTtcbiAgc2VsZi51bml2ZXJzYWxfcHVibGlzaF9oYW5kbGVycyA9IFtdO1xuXG4gIHNlbGYubWV0aG9kX2hhbmRsZXJzID0ge307XG5cbiAgc2VsZi5fcHVibGljYXRpb25TdHJhdGVnaWVzID0ge307XG5cbiAgc2VsZi5zZXNzaW9ucyA9IG5ldyBNYXAoKTsgLy8gbWFwIGZyb20gaWQgdG8gc2Vzc2lvblxuXG4gIHNlbGYuc3RyZWFtX3NlcnZlciA9IG5ldyBTdHJlYW1TZXJ2ZXIoKTtcblxuICBzZWxmLnN0cmVhbV9zZXJ2ZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIC8vIHNvY2tldCBpbXBsZW1lbnRzIHRoZSBTb2NrSlNDb25uZWN0aW9uIGludGVyZmFjZVxuICAgIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbiA9IG51bGw7XG5cbiAgICB2YXIgc2VuZEVycm9yID0gZnVuY3Rpb24gKHJlYXNvbiwgb2ZmZW5kaW5nTWVzc2FnZSkge1xuICAgICAgdmFyIG1zZyA9IHttc2c6ICdlcnJvcicsIHJlYXNvbjogcmVhc29ufTtcbiAgICAgIGlmIChvZmZlbmRpbmdNZXNzYWdlKVxuICAgICAgICBtc2cub2ZmZW5kaW5nTWVzc2FnZSA9IG9mZmVuZGluZ01lc3NhZ2U7XG4gICAgICBzb2NrZXQuc2VuZChERFBDb21tb24uc3RyaW5naWZ5RERQKG1zZykpO1xuICAgIH07XG5cbiAgICBzb2NrZXQub24oJ2RhdGEnLCBmdW5jdGlvbiAocmF3X21zZykge1xuICAgICAgaWYgKE1ldGVvci5fcHJpbnRSZWNlaXZlZEREUCkge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiUmVjZWl2ZWQgRERQXCIsIHJhd19tc2cpO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgbXNnID0gRERQQ29tbW9uLnBhcnNlRERQKHJhd19tc2cpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBzZW5kRXJyb3IoJ1BhcnNlIGVycm9yJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cgPT09IG51bGwgfHwgIW1zZy5tc2cpIHtcbiAgICAgICAgICBzZW5kRXJyb3IoJ0JhZCByZXF1ZXN0JywgbXNnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobXNnLm1zZyA9PT0gJ2Nvbm5lY3QnKSB7XG4gICAgICAgICAgaWYgKHNvY2tldC5fbWV0ZW9yU2Vzc2lvbikge1xuICAgICAgICAgICAgc2VuZEVycm9yKFwiQWxyZWFkeSBjb25uZWN0ZWRcIiwgbXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9oYW5kbGVDb25uZWN0KHNvY2tldCwgbXNnKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc29ja2V0Ll9tZXRlb3JTZXNzaW9uKSB7XG4gICAgICAgICAgc2VuZEVycm9yKCdNdXN0IGNvbm5lY3QgZmlyc3QnLCBtc2cpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQuX21ldGVvclNlc3Npb24ucHJvY2Vzc01lc3NhZ2UobXNnKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gWFhYIHByaW50IHN0YWNrIG5pY2VseVxuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiSW50ZXJuYWwgZXhjZXB0aW9uIHdoaWxlIHByb2Nlc3NpbmcgbWVzc2FnZVwiLCBtc2csIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc29ja2V0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzb2NrZXQuX21ldGVvclNlc3Npb24pIHtcbiAgICAgICAgc29ja2V0Ll9tZXRlb3JTZXNzaW9uLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuT2JqZWN0LmFzc2lnbihTZXJ2ZXIucHJvdG90eXBlLCB7XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlZ2lzdGVyIGEgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gYSBuZXcgRERQIGNvbm5lY3Rpb24gaXMgbWFkZSB0byB0aGUgc2VydmVyLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYSBuZXcgRERQIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWQuXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKi9cbiAgb25Db25uZWN0aW9uOiBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHNlbGYub25Db25uZWN0aW9uSG9vay5yZWdpc3Rlcihmbik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFNldCBwdWJsaWNhdGlvbiBzdHJhdGVneSBmb3IgdGhlIGdpdmVuIGNvbGxlY3Rpb24uIFB1YmxpY2F0aW9ucyBzdHJhdGVnaWVzIGFyZSBhdmFpbGFibGUgZnJvbSBgRERQU2VydmVyLnB1YmxpY2F0aW9uU3RyYXRlZ2llc2AuIFlvdSBjYWxsIHRoaXMgbWV0aG9kIGZyb20gYE1ldGVvci5zZXJ2ZXJgLCBsaWtlIGBNZXRlb3Iuc2VydmVyLnNldFB1YmxpY2F0aW9uU3RyYXRlZ3koKWBcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAYWxpYXMgc2V0UHVibGljYXRpb25TdHJhdGVneVxuICAgKiBAcGFyYW0gY29sbGVjdGlvbk5hbWUge1N0cmluZ31cbiAgICogQHBhcmFtIHN0cmF0ZWd5IHt7dXNlQ29sbGVjdGlvblZpZXc6IGJvb2xlYW4sIGRvQWNjb3VudGluZ0ZvckNvbGxlY3Rpb246IGJvb2xlYW59fVxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yLnNlcnZlclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqL1xuICBzZXRQdWJsaWNhdGlvblN0cmF0ZWd5KGNvbGxlY3Rpb25OYW1lLCBzdHJhdGVneSkge1xuICAgIGlmICghT2JqZWN0LnZhbHVlcyhwdWJsaWNhdGlvblN0cmF0ZWdpZXMpLmluY2x1ZGVzKHN0cmF0ZWd5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG1lcmdlIHN0cmF0ZWd5OiAke3N0cmF0ZWd5fSBcbiAgICAgICAgZm9yIGNvbGxlY3Rpb24gJHtjb2xsZWN0aW9uTmFtZX1gKTtcbiAgICB9XG4gICAgdGhpcy5fcHVibGljYXRpb25TdHJhdGVnaWVzW2NvbGxlY3Rpb25OYW1lXSA9IHN0cmF0ZWd5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXRzIHRoZSBwdWJsaWNhdGlvbiBzdHJhdGVneSBmb3IgdGhlIHJlcXVlc3RlZCBjb2xsZWN0aW9uLiBZb3UgY2FsbCB0aGlzIG1ldGhvZCBmcm9tIGBNZXRlb3Iuc2VydmVyYCwgbGlrZSBgTWV0ZW9yLnNlcnZlci5nZXRQdWJsaWNhdGlvblN0cmF0ZWd5KClgXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQGFsaWFzIGdldFB1YmxpY2F0aW9uU3RyYXRlZ3lcbiAgICogQHBhcmFtIGNvbGxlY3Rpb25OYW1lIHtTdHJpbmd9XG4gICAqIEBtZW1iZXJPZiBNZXRlb3Iuc2VydmVyXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQHJldHVybiB7e3VzZUNvbGxlY3Rpb25WaWV3OiBib29sZWFuLCBkb0FjY291bnRpbmdGb3JDb2xsZWN0aW9uOiBib29sZWFufX1cbiAgICovXG4gIGdldFB1YmxpY2F0aW9uU3RyYXRlZ3koY29sbGVjdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fcHVibGljYXRpb25TdHJhdGVnaWVzW2NvbGxlY3Rpb25OYW1lXVxuICAgICAgfHwgdGhpcy5vcHRpb25zLmRlZmF1bHRQdWJsaWNhdGlvblN0cmF0ZWd5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIGEgbmV3IEREUCBtZXNzYWdlIGlzIHJlY2VpdmVkLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYSBuZXcgRERQIG1lc3NhZ2UgaXMgcmVjZWl2ZWQuXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKi9cbiAgb25NZXNzYWdlOiBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHNlbGYub25NZXNzYWdlSG9vay5yZWdpc3Rlcihmbik7XG4gIH0sXG5cbiAgX2hhbmRsZUNvbm5lY3Q6IGZ1bmN0aW9uIChzb2NrZXQsIG1zZykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFRoZSBjb25uZWN0IG1lc3NhZ2UgbXVzdCBzcGVjaWZ5IGEgdmVyc2lvbiBhbmQgYW4gYXJyYXkgb2Ygc3VwcG9ydGVkXG4gICAgLy8gdmVyc2lvbnMsIGFuZCBpdCBtdXN0IGNsYWltIHRvIHN1cHBvcnQgd2hhdCBpdCBpcyBwcm9wb3NpbmcuXG4gICAgaWYgKCEodHlwZW9mIChtc2cudmVyc2lvbikgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgQXJyYXkuaXNBcnJheShtc2cuc3VwcG9ydCkgJiZcbiAgICAgICAgICBtc2cuc3VwcG9ydC5ldmVyeShpc1N0cmluZykgJiZcbiAgICAgICAgICBtc2cuc3VwcG9ydC5pbmNsdWRlcyhtc2cudmVyc2lvbikpKSB7XG4gICAgICBzb2NrZXQuc2VuZChERFBDb21tb24uc3RyaW5naWZ5RERQKHttc2c6ICdmYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBERFBDb21tb24uU1VQUE9SVEVEX0REUF9WRVJTSU9OU1swXX0pKTtcbiAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluIHRoZSBmdXR1cmUsIGhhbmRsZSBzZXNzaW9uIHJlc3VtcHRpb246IHNvbWV0aGluZyBsaWtlOlxuICAgIC8vICBzb2NrZXQuX21ldGVvclNlc3Npb24gPSBzZWxmLnNlc3Npb25zW21zZy5zZXNzaW9uXVxuICAgIHZhciB2ZXJzaW9uID0gY2FsY3VsYXRlVmVyc2lvbihtc2cuc3VwcG9ydCwgRERQQ29tbW9uLlNVUFBPUlRFRF9ERFBfVkVSU0lPTlMpO1xuXG4gICAgaWYgKG1zZy52ZXJzaW9uICE9PSB2ZXJzaW9uKSB7XG4gICAgICAvLyBUaGUgYmVzdCB2ZXJzaW9uIHRvIHVzZSAoYWNjb3JkaW5nIHRvIHRoZSBjbGllbnQncyBzdGF0ZWQgcHJlZmVyZW5jZXMpXG4gICAgICAvLyBpcyBub3QgdGhlIG9uZSB0aGUgY2xpZW50IGlzIHRyeWluZyB0byB1c2UuIEluZm9ybSB0aGVtIGFib3V0IHRoZSBiZXN0XG4gICAgICAvLyB2ZXJzaW9uIHRvIHVzZS5cbiAgICAgIHNvY2tldC5zZW5kKEREUENvbW1vbi5zdHJpbmdpZnlERFAoe21zZzogJ2ZhaWxlZCcsIHZlcnNpb246IHZlcnNpb259KSk7XG4gICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBZYXksIHZlcnNpb24gbWF0Y2hlcyEgUmVzdW1lIGV4aXN0aW5nIHNlc3Npb24gaWYgcG9zc2libGUsIG90aGVyd2lzZSBjcmVhdGUgYSBuZXcgb25lLlxuICAgIC8vIE5vdGU6IFRyb3Bvc3BoZXJlIGRlcGVuZHMgb24gdGhlIGFiaWxpdHkgdG8gbXV0YXRlXG4gICAgLy8gTWV0ZW9yLnNlcnZlci5vcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQhIFRoaXMgaXMgYSBoYWNrLCBidXQgaXQncyBsaWZlLlxuICAgIGNvbnN0IGV4aXN0aW5nU2Vzc2lvbiA9IHNlbGYuc2Vzc2lvbnMuZ2V0KG1zZy5zZXNzaW9uKTtcblxuICAgIC8vIHdlJ3ZlIGZvdW5kIGEgc2Vzc2lvbiB3aXRoOlxuICAgIC8vIHRoZSByaWdodCBJRFxuICAgIC8vIGEgbWF0Y2hpbmcgc2VudC9yZWNlaXZlZCBjb3VudFxuICAgIC8vIHdhcyBkaXNjb25uZWN0ZWQgYW5kIGhhc24ndCBiZWVuIHJlY29ubmVjdGVkIHRvIHlldC5cbiAgICBpZiAoZXhpc3RpbmdTZXNzaW9uICYmIGV4aXN0aW5nU2Vzc2lvbi5zZW50Q291bnQgPT09IG1zZy5yZWNlaXZlZENvdW50ICYmIGV4aXN0aW5nU2Vzc2lvbi5fcmVtb3ZlVGltZW91dEhhbmRsZSkge1xuICAgICAgTWV0ZW9yLmNsZWFyVGltZW91dChleGlzdGluZ1Nlc3Npb24uX3JlbW92ZVRpbWVvdXRIYW5kbGUpO1xuICAgICAgZXhpc3RpbmdTZXNzaW9uLl9yZW1vdmVUaW1lb3V0SGFuZGxlID0gdW5kZWZpbmVkO1xuICAgICAgZXhpc3RpbmdTZXNzaW9uLl9wZW5kaW5nUmVtb3ZlRnVuY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICBleGlzdGluZ1Nlc3Npb24uX2lzQ2xvc2luZyA9IGZhbHNlOyAvLyBSZXNldCBzbyBzZXNzaW9uIGNhbiBiZSBjbG9zZWQgYWdhaW4gbGF0ZXJcbiAgICAgIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbiA9IGV4aXN0aW5nU2Vzc2lvbjtcbiAgICAgIGNvbnN0IG1lc3NhZ2VRdWV1ZSA9IGV4aXN0aW5nU2Vzc2lvbi5tZXNzYWdlUXVldWU7XG4gICAgICBleGlzdGluZ1Nlc3Npb24ubWVzc2FnZVF1ZXVlID0gdW5kZWZpbmVkO1xuICAgICAgZXhpc3RpbmdTZXNzaW9uLnNvY2tldCA9IHNvY2tldDtcblxuICAgICAgLy8gUmVzdGFydCBoZWFydGJlYXQgZm9yIHRoZSByZXN1bWVkIHNlc3Npb25cbiAgICAgIGlmIChleGlzdGluZ1Nlc3Npb24udmVyc2lvbiAhPT0gJ3ByZTEnICYmIHNlbGYub3B0aW9ucy5oZWFydGJlYXRJbnRlcnZhbCAhPT0gMCkge1xuICAgICAgICBzb2NrZXQuc2V0V2Vic29ja2V0VGltZW91dCgwKTtcbiAgICAgICAgZXhpc3RpbmdTZXNzaW9uLmhlYXJ0YmVhdCA9IG5ldyBERFBDb21tb24uSGVhcnRiZWF0KHtcbiAgICAgICAgICBoZWFydGJlYXRJbnRlcnZhbDogc2VsZi5vcHRpb25zLmhlYXJ0YmVhdEludGVydmFsLFxuICAgICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IHNlbGYub3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0LFxuICAgICAgICAgIG9uVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhpc3RpbmdTZXNzaW9uLmNsb3NlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZW5kUGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhpc3RpbmdTZXNzaW9uLnNlbmQoe21zZzogJ3BpbmcnfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZXhpc3RpbmdTZXNzaW9uLmhlYXJ0YmVhdC5zdGFydCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBTZW5kIGNvbm5lY3RlZCBtZXNzYWdlIHNvIGNsaWVudCBjYW4gcmVzdGFydCBoZWFydGJlYXQgYW5kIGNvbmZpcm0gcmVzdW1wdGlvblxuICAgICAgZXhpc3RpbmdTZXNzaW9uLnNlbmQoeyBtc2c6ICdjb25uZWN0ZWQnLCBzZXNzaW9uOiBleGlzdGluZ1Nlc3Npb24uaWQgfSk7XG4gICAgICBpZiAobWVzc2FnZVF1ZXVlKSB7XG4gICAgICAgIE1ldGVvci5kZWZlcigoKSA9PiB7XG4gICAgICAgICAgbWVzc2FnZVF1ZXVlLmZvckVhY2gobXNnID0+IGV4aXN0aW5nU2Vzc2lvbi5zZW5kKG1zZykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIC8vIE5vdGU6IG9uQ29ubmVjdGlvbkhvb2sgaXMgTk9UIGNhbGxlZCBvbiBzZXNzaW9uIHJlc3VtZSAtIHRoZSBjb25uZWN0aW9uXG4gICAgICAvLyBpcyBjb25zaWRlcmVkIHRvIGJlIHRoZSBzYW1lIGxvZ2ljYWwgY29ubmVjdGlvbiBhcyBiZWZvcmUuXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gaW1tZWRpYXRlbHkgcmVtb3ZlIHRoZSBvbGQgc2Vzc2lvbiBzaW5jZSB3ZSdyZSBvdXQgb2YgZGF0ZS5cbiAgICAgIGlmIChleGlzdGluZ1Nlc3Npb24gJiYgZXhpc3RpbmdTZXNzaW9uLl9wZW5kaW5nUmVtb3ZlRnVuY3Rpb24pIHtcbiAgICAgICAgTWV0ZW9yLmNsZWFyVGltZW91dChleGlzdGluZ1Nlc3Npb24uX3JlbW92ZVRpbWVvdXRIYW5kbGUpO1xuICAgICAgICBleGlzdGluZ1Nlc3Npb24uX3BlbmRpbmdSZW1vdmVGdW5jdGlvbigpO1xuICAgICAgfVxuICAgICAgc29ja2V0Ll9tZXRlb3JTZXNzaW9uID0gbmV3IFNlc3Npb24oc2VsZiwgdmVyc2lvbiwgc29ja2V0LCBzZWxmLm9wdGlvbnMpO1xuICAgICAgc2VsZi5zZXNzaW9ucy5zZXQoc29ja2V0Ll9tZXRlb3JTZXNzaW9uLmlkLCBzb2NrZXQuX21ldGVvclNlc3Npb24pO1xuXG4gICAgICBzZWxmLm9uQ29ubmVjdGlvbkhvb2suZWFjaChmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHNvY2tldC5fbWV0ZW9yU2Vzc2lvbilcbiAgICAgICAgICBjYWxsYmFjayhzb2NrZXQuX21ldGVvclNlc3Npb24uY29ubmVjdGlvbkhhbmRsZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBwdWJsaXNoIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIHtTdHJpbmd9IGlkZW50aWZpZXIgZm9yIHF1ZXJ5XG4gICAqIEBwYXJhbSBoYW5kbGVyIHtGdW5jdGlvbn0gcHVibGlzaCBoYW5kbGVyXG4gICAqIEBwYXJhbSBvcHRpb25zIHtPYmplY3R9XG4gICAqXG4gICAqIFNlcnZlciB3aWxsIGNhbGwgaGFuZGxlciBmdW5jdGlvbiBvbiBlYWNoIG5ldyBzdWJzY3JpcHRpb24sXG4gICAqIGVpdGhlciB3aGVuIHJlY2VpdmluZyBERFAgc3ViIG1lc3NhZ2UgZm9yIGEgbmFtZWQgc3Vic2NyaXB0aW9uLCBvciBvblxuICAgKiBERFAgY29ubmVjdCBmb3IgYSB1bml2ZXJzYWwgc3Vic2NyaXB0aW9uLlxuICAgKlxuICAgKiBJZiBuYW1lIGlzIG51bGwsIHRoaXMgd2lsbCBiZSBhIHN1YnNjcmlwdGlvbiB0aGF0IGlzXG4gICAqIGF1dG9tYXRpY2FsbHkgZXN0YWJsaXNoZWQgYW5kIHBlcm1hbmVudGx5IG9uIGZvciBhbGwgY29ubmVjdGVkXG4gICAqIGNsaWVudCwgaW5zdGVhZCBvZiBhIHN1YnNjcmlwdGlvbiB0aGF0IGNhbiBiZSB0dXJuZWQgb24gYW5kIG9mZlxuICAgKiB3aXRoIHN1YnNjcmliZSgpLlxuICAgKlxuICAgKiBvcHRpb25zIHRvIGNvbnRhaW46XG4gICAqICAtIChtb3N0bHkgaW50ZXJuYWwpIGlzX2F1dG86IHRydWUgaWYgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHlcbiAgICogICAgZnJvbSBhbiBhdXRvcHVibGlzaCBob29rLiB0aGlzIGlzIGZvciBjb3NtZXRpYyBwdXJwb3NlcyBvbmx5XG4gICAqICAgIChpdCBsZXRzIHVzIGRldGVybWluZSB3aGV0aGVyIHRvIHByaW50IGEgd2FybmluZyBzdWdnZXN0aW5nXG4gICAqICAgIHRoYXQgeW91IHR1cm4gb2ZmIGF1dG9wdWJsaXNoKS5cbiAgICovXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFB1Ymxpc2ggYSByZWNvcmQgc2V0LlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG5hbWUgSWYgU3RyaW5nLCBuYW1lIG9mIHRoZSByZWNvcmQgc2V0LiAgSWYgT2JqZWN0LCBwdWJsaWNhdGlvbnMgRGljdGlvbmFyeSBvZiBwdWJsaXNoIGZ1bmN0aW9ucyBieSBuYW1lLiAgSWYgYG51bGxgLCB0aGUgc2V0IGhhcyBubyBuYW1lLCBhbmQgdGhlIHJlY29yZCBzZXQgaXMgYXV0b21hdGljYWxseSBzZW50IHRvIGFsbCBjb25uZWN0ZWQgY2xpZW50cy5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBGdW5jdGlvbiBjYWxsZWQgb24gdGhlIHNlcnZlciBlYWNoIHRpbWUgYSBjbGllbnQgc3Vic2NyaWJlcy4gIEluc2lkZSB0aGUgZnVuY3Rpb24sIGB0aGlzYCBpcyB0aGUgcHVibGlzaCBoYW5kbGVyIG9iamVjdCwgZGVzY3JpYmVkIGJlbG93LiAgSWYgdGhlIGNsaWVudCBwYXNzZWQgYXJndW1lbnRzIHRvIGBzdWJzY3JpYmVgLCB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIHNhbWUgYXJndW1lbnRzLlxuICAgKi9cbiAgcHVibGlzaDogZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIWlzT2JqZWN0KG5hbWUpKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKG5hbWUgJiYgbmFtZSBpbiBzZWxmLnB1Ymxpc2hfaGFuZGxlcnMpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIklnbm9yaW5nIGR1cGxpY2F0ZSBwdWJsaXNoIG5hbWVkICdcIiArIG5hbWUgKyBcIidcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKFBhY2thZ2UuYXV0b3B1Ymxpc2ggJiYgIW9wdGlvbnMuaXNfYXV0bykge1xuICAgICAgICAvLyBUaGV5IGhhdmUgYXV0b3B1Ymxpc2ggb24sIHlldCB0aGV5J3JlIHRyeWluZyB0byBtYW51YWxseVxuICAgICAgICAvLyBwaWNrIHN0dWZmIHRvIHB1Ymxpc2guIFRoZXkgcHJvYmFibHkgc2hvdWxkIHR1cm4gb2ZmXG4gICAgICAgIC8vIGF1dG9wdWJsaXNoLiAoVGhpcyBjaGVjayBpc24ndCBwZXJmZWN0IC0tIGlmIHlvdSBjcmVhdGUgYVxuICAgICAgICAvLyBwdWJsaXNoIGJlZm9yZSB5b3UgdHVybiBvbiBhdXRvcHVibGlzaCwgaXQgd29uJ3QgY2F0Y2hcbiAgICAgICAgLy8gaXQsIGJ1dCB0aGlzIHdpbGwgZGVmaW5pdGVseSBoYW5kbGUgdGhlIHNpbXBsZSBjYXNlIHdoZXJlXG4gICAgICAgIC8vIHlvdSd2ZSBhZGRlZCB0aGUgYXV0b3B1Ymxpc2ggcGFja2FnZSB0byB5b3VyIGFwcCwgYW5kIGFyZVxuICAgICAgICAvLyBjYWxsaW5nIHB1Ymxpc2ggZnJvbSB5b3VyIGFwcCBjb2RlKS5cbiAgICAgICAgaWYgKCFzZWxmLndhcm5lZF9hYm91dF9hdXRvcHVibGlzaCkge1xuICAgICAgICAgIHNlbGYud2FybmVkX2Fib3V0X2F1dG9wdWJsaXNoID0gdHJ1ZTtcbiAgICAgICAgICBNZXRlb3IuX2RlYnVnKFxuICAgIFwiKiogWW91J3ZlIHNldCB1cCBzb21lIGRhdGEgc3Vic2NyaXB0aW9ucyB3aXRoIE1ldGVvci5wdWJsaXNoKCksIGJ1dFxcblwiICtcbiAgICBcIioqIHlvdSBzdGlsbCBoYXZlIGF1dG9wdWJsaXNoIHR1cm5lZCBvbi4gQmVjYXVzZSBhdXRvcHVibGlzaCBpcyBzdGlsbFxcblwiICtcbiAgICBcIioqIG9uLCB5b3VyIE1ldGVvci5wdWJsaXNoKCkgY2FsbHMgd29uJ3QgaGF2ZSBtdWNoIGVmZmVjdC4gQWxsIGRhdGFcXG5cIiArXG4gICAgXCIqKiB3aWxsIHN0aWxsIGJlIHNlbnQgdG8gYWxsIGNsaWVudHMuXFxuXCIgK1xuICAgIFwiKipcXG5cIiArXG4gICAgXCIqKiBUdXJuIG9mZiBhdXRvcHVibGlzaCBieSByZW1vdmluZyB0aGUgYXV0b3B1Ymxpc2ggcGFja2FnZTpcXG5cIiArXG4gICAgXCIqKlxcblwiICtcbiAgICBcIioqICAgJCBtZXRlb3IgcmVtb3ZlIGF1dG9wdWJsaXNoXFxuXCIgK1xuICAgIFwiKipcXG5cIiArXG4gICAgXCIqKiAuLiBhbmQgbWFrZSBzdXJlIHlvdSBoYXZlIE1ldGVvci5wdWJsaXNoKCkgYW5kIE1ldGVvci5zdWJzY3JpYmUoKSBjYWxsc1xcblwiICtcbiAgICBcIioqIGZvciBlYWNoIGNvbGxlY3Rpb24gdGhhdCB5b3Ugd2FudCBjbGllbnRzIHRvIHNlZS5cXG5cIik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUpXG4gICAgICAgIHNlbGYucHVibGlzaF9oYW5kbGVyc1tuYW1lXSA9IGhhbmRsZXI7XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi51bml2ZXJzYWxfcHVibGlzaF9oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAvLyBTcGluIHVwIHRoZSBuZXcgcHVibGlzaGVyIG9uIGFueSBleGlzdGluZyBzZXNzaW9uIHRvby4gUnVuIGVhY2hcbiAgICAgICAgLy8gc2Vzc2lvbidzIHN1YnNjcmlwdGlvbiBpbiBhIG5ldyBGaWJlciwgc28gdGhhdCB0aGVyZSdzIG5vIGNoYW5nZSBmb3JcbiAgICAgICAgLy8gc2VsZi5zZXNzaW9ucyB0byBjaGFuZ2Ugd2hpbGUgd2UncmUgcnVubmluZyB0aGlzIGxvb3AuXG4gICAgICAgIHNlbGYuc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgIGlmICghc2Vzc2lvbi5fZG9udFN0YXJ0TmV3VW5pdmVyc2FsU3Vicykge1xuICAgICAgICAgICAgc2Vzc2lvbi5fc3RhcnRTdWJzY3JpcHRpb24oaGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG5hbWUpLmZvckVhY2goZnVuY3Rpb24oW2tleSwgdmFsdWVdKSB7XG4gICAgICAgIHNlbGYucHVibGlzaChrZXksIHZhbHVlLCB7fSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbW92ZVNlc3Npb246IGZ1bmN0aW9uIChzZXNzaW9uLCBjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlc3Npb25SZW1vdmVGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgIC8vIEd1YXJkIGFnYWluc3QgYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzIChlLmcuLCBmcm9tIGJvdGggb3ZlcmZsb3cgYW5kIHRpbWVvdXQpXG4gICAgICBpZiAoIXNlbGYuc2Vzc2lvbnMuaGFzKHNlc3Npb24uaWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRpbWVvdXQgaGFuZGxlIGlmIGl0IGV4aXN0cyB0byBwcmV2ZW50IGRvdWJsZSBleGVjdXRpb25cbiAgICAgIGlmIChzZXNzaW9uLl9yZW1vdmVUaW1lb3V0SGFuZGxlKSB7XG4gICAgICAgIE1ldGVvci5jbGVhclRpbWVvdXQoc2Vzc2lvbi5fcmVtb3ZlVGltZW91dEhhbmRsZSk7XG4gICAgICAgIHNlc3Npb24uX3JlbW92ZVRpbWVvdXRIYW5kbGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgc2Vzc2lvbi5fcGVuZGluZ1JlbW92ZUZ1bmN0aW9uID0gbnVsbDtcbiAgICAgIHNlbGYuc2Vzc2lvbnMuZGVsZXRlKHNlc3Npb24uaWQpO1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9O1xuICAgIGlmIChzZXNzaW9uLl9leHBlY3RpbmdEaXNjb25uZWN0KSB7XG4gICAgICByZXR1cm4gc2Vzc2lvblJlbW92ZUZ1bmN0aW9uKCk7XG4gICAgfVxuICAgIHNlc3Npb24ubWVzc2FnZVF1ZXVlID0gW107XG4gICAgc2Vzc2lvbi5fcGVuZGluZ1JlbW92ZUZ1bmN0aW9uID0gc2Vzc2lvblJlbW92ZUZ1bmN0aW9uO1xuICAgIGlmIChzZXNzaW9uLl9yZW1vdmVUaW1lb3V0SGFuZGxlKSB7XG4gICAgICBNZXRlb3IuY2xlYXJUaW1lb3V0KHNlc3Npb24uX3JlbW92ZVRpbWVvdXRIYW5kbGUpO1xuICAgIH1cbiAgICBzZXNzaW9uLl9yZW1vdmVUaW1lb3V0SGFuZGxlID0gTWV0ZW9yLnNldFRpbWVvdXQoc2Vzc2lvblJlbW92ZUZ1bmN0aW9uLCBzZWxmLm9wdGlvbnMuZGlzY29ubmVjdEdyYWNlUGVyaW9kKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgVGVsbHMgaWYgdGhlIG1ldGhvZCBjYWxsIGNhbWUgZnJvbSBhIGNhbGwgb3IgYSBjYWxsQXN5bmMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgaXNBc3luY0NhbGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX2lzQ2FsbEFzeW5jTWV0aG9kUnVubmluZygpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IERlZmluZXMgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIGludm9rZWQgb3ZlciB0aGUgbmV0d29yayBieSBjbGllbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IG1ldGhvZHMgRGljdGlvbmFyeSB3aG9zZSBrZXlzIGFyZSBtZXRob2QgbmFtZXMgYW5kIHZhbHVlcyBhcmUgZnVuY3Rpb25zLlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICovXG4gIG1ldGhvZHM6IGZ1bmN0aW9uIChtZXRob2RzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE9iamVjdC5lbnRyaWVzKG1ldGhvZHMpLmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBmdW5jXSkge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgJ1wiICsgbmFtZSArIFwiJyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICBpZiAoc2VsZi5tZXRob2RfaGFuZGxlcnNbbmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbWV0aG9kIG5hbWVkICdcIiArIG5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWZpbmVkXCIpO1xuICAgICAgc2VsZi5tZXRob2RfaGFuZGxlcnNbbmFtZV0gPSBmdW5jO1xuICAgIH0pO1xuICB9LFxuXG4gIGNhbGw6IGZ1bmN0aW9uIChuYW1lLCAuLi5hcmdzKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gSWYgaXQncyBhIGZ1bmN0aW9uLCB0aGUgbGFzdCBhcmd1bWVudCBpcyB0aGUgcmVzdWx0IGNhbGxiYWNrLCBub3RcbiAgICAgIC8vIGEgcGFyYW1ldGVyIHRvIHRoZSByZW1vdGUgbWV0aG9kLlxuICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hcHBseShuYW1lLCBhcmdzLCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLy8gQSB2ZXJzaW9uIG9mIHRoZSBjYWxsIG1ldGhvZCB0aGF0IGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgY2FsbEFzeW5jOiBmdW5jdGlvbiAobmFtZSwgLi4uYXJncykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhcmdzWzBdPy5oYXNPd25Qcm9wZXJ0eSgncmV0dXJuU3R1YlZhbHVlJylcbiAgICAgID8gYXJncy5zaGlmdCgpXG4gICAgICA6IHt9O1xuICAgIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcodHJ1ZSk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIEREUC5fQ3VycmVudENhbGxBc3luY0ludm9jYXRpb24uX3NldCh7IG5hbWUsIGhhc0NhbGxBc3luY1BhcmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuYXBwbHlBc3luYyhuYW1lLCBhcmdzLCB7IGlzRnJvbUNhbGxBc3luYzogdHJ1ZSwgLi4ub3B0aW9ucyB9KVxuICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgRERQLl9DdXJyZW50Q2FsbEFzeW5jSW52b2NhdGlvbi5fc2V0KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwcm9taXNlLmZpbmFsbHkoKCkgPT5cbiAgICAgIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcoZmFsc2UpXG4gICAgKTtcbiAgfSxcblxuICBhcHBseTogZnVuY3Rpb24gKG5hbWUsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgLy8gV2Ugd2VyZSBwYXNzZWQgMyBhcmd1bWVudHMuIFRoZXkgbWF5IGJlIGVpdGhlciAobmFtZSwgYXJncywgb3B0aW9ucylcbiAgICAvLyBvciAobmFtZSwgYXJncywgY2FsbGJhY2spXG4gICAgaWYgKCEgY2FsbGJhY2sgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgfVxuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmFwcGx5QXN5bmMobmFtZSwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIHJlc3VsdCBpbiB3aGljaGV2ZXIgd2F5IHRoZSBjYWxsZXIgYXNrZWQgZm9yIGl0LiBOb3RlIHRoYXQgd2VcbiAgICAvLyBkbyBOT1QgYmxvY2sgb24gdGhlIHdyaXRlIGZlbmNlIGluIGFuIGFuYWxvZ291cyB3YXkgdG8gaG93IHRoZSBjbGllbnRcbiAgICAvLyBibG9ja3Mgb24gdGhlIHJlbGV2YW50IGRhdGEgYmVpbmcgdmlzaWJsZSwgc28geW91IGFyZSBOT1QgZ3VhcmFudGVlZCB0aGF0XG4gICAgLy8gY3Vyc29yIG9ic2VydmUgY2FsbGJhY2tzIGhhdmUgZmlyZWQgd2hlbiB5b3VyIGNhbGxiYWNrIGlzIGludm9rZWQuIChXZVxuICAgIC8vIGNhbiBjaGFuZ2UgdGhpcyBpZiB0aGVyZSdzIGEgcmVhbCB1c2UgY2FzZSkuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBwcm9taXNlLnRoZW4oXG4gICAgICAgIHJlc3VsdCA9PiBjYWxsYmFjayh1bmRlZmluZWQsIHJlc3VsdCksXG4gICAgICAgIGV4Y2VwdGlvbiA9PiBjYWxsYmFjayhleGNlcHRpb24pXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQHBhcmFtIG9wdGlvbnMge09wdGlvbmFsIE9iamVjdH1cbiAgYXBwbHlBc3luYzogZnVuY3Rpb24gKG5hbWUsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBSdW4gdGhlIGhhbmRsZXJcbiAgICB2YXIgaGFuZGxlciA9IHRoaXMubWV0aG9kX2hhbmRsZXJzW25hbWVdO1xuXG4gICAgaWYgKCEgaGFuZGxlcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgYE1ldGhvZCAnJHtuYW1lfScgbm90IGZvdW5kYClcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIElmIHRoaXMgaXMgYSBtZXRob2QgY2FsbCBmcm9tIHdpdGhpbiBhbm90aGVyIG1ldGhvZCBvciBwdWJsaXNoIGZ1bmN0aW9uLFxuICAgIC8vIGdldCB0aGUgdXNlciBzdGF0ZSBmcm9tIHRoZSBvdXRlciBtZXRob2Qgb3IgcHVibGlzaCBmdW5jdGlvbiwgb3RoZXJ3aXNlXG4gICAgLy8gZG9uJ3QgYWxsb3cgc2V0VXNlcklkIHRvIGJlIGNhbGxlZFxuICAgIHZhciB1c2VySWQgPSBudWxsO1xuICAgIGxldCBzZXRVc2VySWQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIHNldFVzZXJJZCBvbiBhIHNlcnZlciBpbml0aWF0ZWQgbWV0aG9kIGNhbGxcIik7XG4gICAgfTtcbiAgICB2YXIgY29ubmVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKTtcbiAgICB2YXIgY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiA9IEREUC5fQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5nZXQoKTtcbiAgICB2YXIgcmFuZG9tU2VlZCA9IG51bGw7XG5cbiAgICBpZiAoY3VycmVudE1ldGhvZEludm9jYXRpb24pIHtcbiAgICAgIHVzZXJJZCA9IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLnVzZXJJZDtcbiAgICAgIHNldFVzZXJJZCA9ICh1c2VySWQpID0+IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLnNldFVzZXJJZCh1c2VySWQpO1xuICAgICAgY29ubmVjdGlvbiA9IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmNvbm5lY3Rpb247XG4gICAgICByYW5kb21TZWVkID0gRERQQ29tbW9uLm1ha2VScGNTZWVkKGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLCBuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24pIHtcbiAgICAgIHVzZXJJZCA9IGN1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24udXNlcklkO1xuICAgICAgc2V0VXNlcklkID0gKHVzZXJJZCkgPT4gY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5fc2Vzc2lvbi5fc2V0VXNlcklkKHVzZXJJZCk7XG4gICAgICBjb25uZWN0aW9uID0gY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5jb25uZWN0aW9uO1xuICAgIH1cblxuICAgIHZhciBpbnZvY2F0aW9uID0gbmV3IEREUENvbW1vbi5NZXRob2RJbnZvY2F0aW9uKHtcbiAgICAgIGlzU2ltdWxhdGlvbjogZmFsc2UsXG4gICAgICB1c2VySWQsXG4gICAgICBzZXRVc2VySWQsXG4gICAgICBjb25uZWN0aW9uLFxuICAgICAgcmFuZG9tU2VlZFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLndpdGhWYWx1ZShpbnZvY2F0aW9uLCAoKSA9PlxuICAgICAgICAgIG1heWJlQXVkaXRBcmd1bWVudENoZWNrcyhcbiAgICAgICAgICAgIGhhbmRsZXIsXG4gICAgICAgICAgICBpbnZvY2F0aW9uLFxuICAgICAgICAgICAgRUpTT04uY2xvbmUoYXJncyksXG4gICAgICAgICAgICBcImludGVybmFsIGNhbGwgdG8gJ1wiICsgbmFtZSArIFwiJ1wiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgaWYgKCFNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9XG4gICAgICByZXN1bHQudGhlbihyID0+IHJlc29sdmUocikpLmNhdGNoKHJlamVjdCk7XG4gICAgfSkudGhlbihFSlNPTi5jbG9uZSk7XG4gIH0sXG5cbiAgX3VybEZvclNlc3Npb246IGZ1bmN0aW9uIChzZXNzaW9uSWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHNlc3Npb24gPSBzZWxmLnNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmIChzZXNzaW9uKVxuICAgICAgcmV0dXJuIHNlc3Npb24uX3NvY2tldFVybDtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG5cbnZhciBjYWxjdWxhdGVWZXJzaW9uID0gZnVuY3Rpb24gKGNsaWVudFN1cHBvcnRlZFZlcnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU3VwcG9ydGVkVmVyc2lvbnMpIHtcbiAgdmFyIGNvcnJlY3RWZXJzaW9uID0gY2xpZW50U3VwcG9ydGVkVmVyc2lvbnMuZmluZChmdW5jdGlvbiAodmVyc2lvbikge1xuICAgIHJldHVybiBzZXJ2ZXJTdXBwb3J0ZWRWZXJzaW9ucy5pbmNsdWRlcyh2ZXJzaW9uKTtcbiAgfSk7XG4gIGlmICghY29ycmVjdFZlcnNpb24pIHtcbiAgICBjb3JyZWN0VmVyc2lvbiA9IHNlcnZlclN1cHBvcnRlZFZlcnNpb25zWzBdO1xuICB9XG4gIHJldHVybiBjb3JyZWN0VmVyc2lvbjtcbn07XG5cbkREUFNlcnZlci5fY2FsY3VsYXRlVmVyc2lvbiA9IGNhbGN1bGF0ZVZlcnNpb247XG5cblxuLy8gXCJibGluZFwiIGV4Y2VwdGlvbnMgb3RoZXIgdGhhbiB0aG9zZSB0aGF0IHdlcmUgZGVsaWJlcmF0ZWx5IHRocm93biB0byBzaWduYWxcbi8vIGVycm9ycyB0byB0aGUgY2xpZW50XG52YXIgd3JhcEludGVybmFsRXhjZXB0aW9uID0gZnVuY3Rpb24gKGV4Y2VwdGlvbiwgY29udGV4dCkge1xuICBpZiAoIWV4Y2VwdGlvbikgcmV0dXJuIGV4Y2VwdGlvbjtcblxuICAvLyBUbyBhbGxvdyBwYWNrYWdlcyB0byB0aHJvdyBlcnJvcnMgaW50ZW5kZWQgZm9yIHRoZSBjbGllbnQgYnV0IG5vdCBoYXZlIHRvXG4gIC8vIGRlcGVuZCBvbiB0aGUgTWV0ZW9yLkVycm9yIGNsYXNzLCBgaXNDbGllbnRTYWZlYCBjYW4gYmUgc2V0IHRvIHRydWUgb24gYW55XG4gIC8vIGVycm9yIGJlZm9yZSBpdCBpcyB0aHJvd24uXG4gIGlmIChleGNlcHRpb24uaXNDbGllbnRTYWZlKSB7XG4gICAgaWYgKCEoZXhjZXB0aW9uIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yKSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxNZXNzYWdlID0gZXhjZXB0aW9uLm1lc3NhZ2U7XG4gICAgICBleGNlcHRpb24gPSBuZXcgTWV0ZW9yLkVycm9yKGV4Y2VwdGlvbi5lcnJvciwgZXhjZXB0aW9uLnJlYXNvbiwgZXhjZXB0aW9uLmRldGFpbHMpO1xuICAgICAgZXhjZXB0aW9uLm1lc3NhZ2UgPSBvcmlnaW5hbE1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiBleGNlcHRpb247XG4gIH1cblxuICAvLyBUZXN0cyBjYW4gc2V0IHRoZSAnX2V4cGVjdGVkQnlUZXN0JyBmbGFnIG9uIGFuIGV4Y2VwdGlvbiBzbyBpdCB3b24ndCBnbyB0b1xuICAvLyB0aGUgc2VydmVyIGxvZy5cbiAgaWYgKCFleGNlcHRpb24uX2V4cGVjdGVkQnlUZXN0KSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcIkV4Y2VwdGlvbiBcIiArIGNvbnRleHQsIGV4Y2VwdGlvbi5zdGFjayk7XG4gICAgaWYgKGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcikge1xuICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIlNhbml0aXplZCBhbmQgcmVwb3J0ZWQgdG8gdGhlIGNsaWVudCBhczpcIiwgZXhjZXB0aW9uLnNhbml0aXplZEVycm9yKTtcbiAgICAgIE1ldGVvci5fZGVidWcoKTtcbiAgICB9XG4gIH1cblxuICAvLyBEaWQgdGhlIGVycm9yIGNvbnRhaW4gbW9yZSBkZXRhaWxzIHRoYXQgY291bGQgaGF2ZSBiZWVuIHVzZWZ1bCBpZiBjYXVnaHQgaW5cbiAgLy8gc2VydmVyIGNvZGUgKG9yIGlmIHRocm93biBmcm9tIG5vbi1jbGllbnQtb3JpZ2luYXRlZCBjb2RlKSwgYnV0IGFsc29cbiAgLy8gcHJvdmlkZWQgYSBcInNhbml0aXplZFwiIHZlcnNpb24gd2l0aCBtb3JlIGNvbnRleHQgdGhhbiA1MDAgSW50ZXJuYWwgc2VydmVyIGVycm9yPyBVc2UgdGhhdC5cbiAgaWYgKGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcikge1xuICAgIGlmIChleGNlcHRpb24uc2FuaXRpemVkRXJyb3IuaXNDbGllbnRTYWZlKVxuICAgICAgcmV0dXJuIGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcjtcbiAgICBNZXRlb3IuX2RlYnVnKFwiRXhjZXB0aW9uIFwiICsgY29udGV4dCArIFwiIHByb3ZpZGVzIGEgc2FuaXRpemVkRXJyb3IgdGhhdCBcIiArXG4gICAgICAgICAgICAgICAgICBcImRvZXMgbm90IGhhdmUgaXNDbGllbnRTYWZlIHByb3BlcnR5IHNldDsgaWdub3JpbmdcIik7XG4gIH1cblxuICByZXR1cm4gbmV3IE1ldGVvci5FcnJvcig1MDAsIFwiSW50ZXJuYWwgc2VydmVyIGVycm9yXCIpO1xufTtcblxuXG4vLyBBdWRpdCBhcmd1bWVudCBjaGVja3MsIGlmIHRoZSBhdWRpdC1hcmd1bWVudC1jaGVja3MgcGFja2FnZSBleGlzdHMgKGl0IGlzIGFcbi8vIHdlYWsgZGVwZW5kZW5jeSBvZiB0aGlzIHBhY2thZ2UpLlxudmFyIG1heWJlQXVkaXRBcmd1bWVudENoZWNrcyA9IGZ1bmN0aW9uIChmLCBjb250ZXh0LCBhcmdzLCBkZXNjcmlwdGlvbikge1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgaWYgKFBhY2thZ2VbJ2F1ZGl0LWFyZ3VtZW50LWNoZWNrcyddKSB7XG4gICAgcmV0dXJuIE1hdGNoLl9mYWlsSWZBcmd1bWVudHNBcmVOb3RBbGxDaGVja2VkKFxuICAgICAgZiwgY29udGV4dCwgYXJncywgZGVzY3JpcHRpb24pO1xuICB9XG4gIHJldHVybiBmLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xufTsiLCJERFBTZXJ2ZXIuX1dyaXRlRmVuY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYXJtZWQgPSBmYWxzZTtcbiAgICB0aGlzLmZpcmVkID0gZmFsc2U7XG4gICAgdGhpcy5yZXRpcmVkID0gZmFsc2U7XG4gICAgdGhpcy5vdXRzdGFuZGluZ193cml0ZXMgPSAwO1xuICAgIHRoaXMuYmVmb3JlX2ZpcmVfY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5jb21wbGV0aW9uX2NhbGxiYWNrcyA9IFtdO1xuICB9XG5cbiAgYmVnaW5Xcml0ZSgpIHtcbiAgICBpZiAodGhpcy5yZXRpcmVkKSB7XG4gICAgICByZXR1cm4geyBjb21taXR0ZWQ6ICgpID0+IHt9IH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImZlbmNlIGhhcyBhbHJlYWR5IGFjdGl2YXRlZCAtLSB0b28gbGF0ZSB0byBhZGQgd3JpdGVzXCIpO1xuICAgIH1cblxuICAgIHRoaXMub3V0c3RhbmRpbmdfd3JpdGVzKys7XG4gICAgbGV0IGNvbW1pdHRlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZDogYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoY29tbWl0dGVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29tbWl0dGVkIGNhbGxlZCB0d2ljZSBvbiB0aGUgc2FtZSB3cml0ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb21taXR0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcy0tO1xuICAgICAgICBhd2FpdCB0aGlzLl9tYXliZUZpcmUoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXJtKCkge1xuICAgIGlmICh0aGlzID09PSBERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIkNhbid0IGFybSB0aGUgY3VycmVudCBmZW5jZVwiKTtcbiAgICB9XG4gICAgdGhpcy5hcm1lZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX21heWJlRmlyZSgpO1xuICB9XG5cbiAgb25CZWZvcmVGaXJlKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5maXJlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZmVuY2UgaGFzIGFscmVhZHkgYWN0aXZhdGVkIC0tIHRvbyBsYXRlIHRvIGFkZCBhIGNhbGxiYWNrXCIpO1xuICAgIH1cbiAgICB0aGlzLmJlZm9yZV9maXJlX2NhbGxiYWNrcy5wdXNoKGZ1bmMpO1xuICB9XG5cbiAgb25BbGxDb21taXR0ZWQoZnVuYykge1xuICAgIGlmICh0aGlzLmZpcmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJmZW5jZSBoYXMgYWxyZWFkeSBhY3RpdmF0ZWQgLS0gdG9vIGxhdGUgdG8gYWRkIGEgY2FsbGJhY2tcIik7XG4gICAgfVxuICAgIHRoaXMuY29tcGxldGlvbl9jYWxsYmFja3MucHVzaChmdW5jKTtcbiAgfVxuXG4gIGFzeW5jIF9hcm1BbmRXYWl0KCkge1xuICAgIGxldCByZXNvbHZlcjtcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG5ldyBQcm9taXNlKHIgPT4gcmVzb2x2ZXIgPSByKTtcbiAgICB0aGlzLm9uQWxsQ29tbWl0dGVkKHJlc29sdmVyKTtcbiAgICBhd2FpdCB0aGlzLmFybSgpO1xuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxuXG4gIGFybUFuZFdhaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FybUFuZFdhaXQoKTtcbiAgfVxuXG4gIGFzeW5jIF9tYXliZUZpcmUoKSB7XG4gICAgaWYgKHRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIndyaXRlIGZlbmNlIGFscmVhZHkgYWN0aXZhdGVkP1wiKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuYXJtZWQgfHwgdGhpcy5vdXRzdGFuZGluZ193cml0ZXMgPiAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW52b2tlQ2FsbGJhY2sgPSBhc3luYyAoZnVuYykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZnVuYyh0aGlzKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiZXhjZXB0aW9uIGluIHdyaXRlIGZlbmNlIGNhbGxiYWNrOlwiLCBlcnIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcysrO1xuXG4gICAgLy8gUHJvY2VzcyBhbGwgYmVmb3JlX2ZpcmUgY2FsbGJhY2tzIGluIHBhcmFsbGVsXG4gICAgY29uc3QgYmVmb3JlQ2FsbGJhY2tzID0gWy4uLnRoaXMuYmVmb3JlX2ZpcmVfY2FsbGJhY2tzXTtcbiAgICB0aGlzLmJlZm9yZV9maXJlX2NhbGxiYWNrcyA9IFtdO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGJlZm9yZUNhbGxiYWNrcy5tYXAoY2IgPT4gaW52b2tlQ2FsbGJhY2soY2IpKSk7XG5cbiAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcy0tO1xuXG4gICAgaWYgKHRoaXMub3V0c3RhbmRpbmdfd3JpdGVzID09PSAwKSB7XG4gICAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICAgIC8vIFByb2Nlc3MgYWxsIGNvbXBsZXRpb24gY2FsbGJhY2tzIGluIHBhcmFsbGVsXG4gICAgICBjb25zdCBjYWxsYmFja3MgPSBbLi4udGhpcy5jb21wbGV0aW9uX2NhbGxiYWNrc107XG4gICAgICB0aGlzLmNvbXBsZXRpb25fY2FsbGJhY2tzID0gW107XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChjYWxsYmFja3MubWFwKGNiID0+IGludm9rZUNhbGxiYWNrKGNiKSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldGlyZSgpIHtcbiAgICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJldGlyZSBhIGZlbmNlIHRoYXQgaGFzbid0IGZpcmVkLlwiKTtcbiAgICB9XG4gICAgdGhpcy5yZXRpcmVkID0gdHJ1ZTtcbiAgfVxufTtcblxuRERQU2VydmVyLl9DdXJyZW50V3JpdGVGZW5jZSA9IG5ldyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZTsiLCIvLyBBIFwiY3Jvc3NiYXJcIiBpcyBhIGNsYXNzIHRoYXQgcHJvdmlkZXMgc3RydWN0dXJlZCBub3RpZmljYXRpb24gcmVnaXN0cmF0aW9uLlxuLy8gU2VlIF9tYXRjaCBmb3IgdGhlIGRlZmluaXRpb24gb2YgaG93IGEgbm90aWZpY2F0aW9uIG1hdGNoZXMgYSB0cmlnZ2VyLlxuLy8gQWxsIG5vdGlmaWNhdGlvbnMgYW5kIHRyaWdnZXJzIG11c3QgaGF2ZSBhIHN0cmluZyBrZXkgbmFtZWQgJ2NvbGxlY3Rpb24nLlxuXG5ERFBTZXJ2ZXIuX0Nyb3NzYmFyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBzZWxmLm5leHRJZCA9IDE7XG4gIC8vIG1hcCBmcm9tIGNvbGxlY3Rpb24gbmFtZSAoc3RyaW5nKSAtPiBsaXN0ZW5lciBpZCAtPiBvYmplY3QuIGVhY2ggb2JqZWN0IGhhc1xuICAvLyBrZXlzICd0cmlnZ2VyJywgJ2NhbGxiYWNrJy4gIEFzIGEgaGFjaywgdGhlIGVtcHR5IHN0cmluZyBtZWFucyBcIm5vXG4gIC8vIGNvbGxlY3Rpb25cIi5cbiAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb24gPSB7fTtcbiAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25Db3VudCA9IHt9O1xuICBzZWxmLmZhY3RQYWNrYWdlID0gb3B0aW9ucy5mYWN0UGFja2FnZSB8fCBcImxpdmVkYXRhXCI7XG4gIHNlbGYuZmFjdE5hbWUgPSBvcHRpb25zLmZhY3ROYW1lIHx8IG51bGw7XG59O1xuXG5PYmplY3QuYXNzaWduKEREUFNlcnZlci5fQ3Jvc3NiYXIucHJvdG90eXBlLCB7XG4gIC8vIG1zZyBpcyBhIHRyaWdnZXIgb3IgYSBub3RpZmljYXRpb25cbiAgX2NvbGxlY3Rpb25Gb3JNZXNzYWdlOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghKCdjb2xsZWN0aW9uJyBpbiBtc2cpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YobXNnLmNvbGxlY3Rpb24pID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKG1zZy5jb2xsZWN0aW9uID09PSAnJylcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJNZXNzYWdlIGhhcyBlbXB0eSBjb2xsZWN0aW9uIVwiKTtcbiAgICAgIHJldHVybiBtc2cuY29sbGVjdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXCJNZXNzYWdlIGhhcyBub24tc3RyaW5nIGNvbGxlY3Rpb24hXCIpO1xuICAgIH1cbiAgfSxcblxuICAvLyBMaXN0ZW4gZm9yIG5vdGlmaWNhdGlvbiB0aGF0IG1hdGNoICd0cmlnZ2VyJy4gQSBub3RpZmljYXRpb25cbiAgLy8gbWF0Y2hlcyBpZiBpdCBoYXMgdGhlIGtleS12YWx1ZSBwYWlycyBpbiB0cmlnZ2VyIGFzIGFcbiAgLy8gc3Vic2V0LiBXaGVuIGEgbm90aWZpY2F0aW9uIG1hdGNoZXMsIGNhbGwgJ2NhbGxiYWNrJywgcGFzc2luZ1xuICAvLyB0aGUgYWN0dWFsIG5vdGlmaWNhdGlvbi5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIGxpc3RlbiBoYW5kbGUsIHdoaWNoIGlzIGFuIG9iamVjdCB3aXRoIGEgbWV0aG9kXG4gIC8vIHN0b3AoKS4gQ2FsbCBzdG9wKCkgdG8gc3RvcCBsaXN0ZW5pbmcuXG4gIC8vXG4gIC8vIFhYWCBJdCBzaG91bGQgYmUgbGVnYWwgdG8gY2FsbCBmaXJlKCkgZnJvbSBpbnNpZGUgYSBsaXN0ZW4oKVxuICAvLyBjYWxsYmFjaz9cbiAgbGlzdGVuOiBmdW5jdGlvbiAodHJpZ2dlciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGlkID0gc2VsZi5uZXh0SWQrKztcblxuICAgIHZhciBjb2xsZWN0aW9uID0gc2VsZi5fY29sbGVjdGlvbkZvck1lc3NhZ2UodHJpZ2dlcik7XG4gICAgdmFyIHJlY29yZCA9IHt0cmlnZ2VyOiBFSlNPTi5jbG9uZSh0cmlnZ2VyKSwgY2FsbGJhY2s6IGNhbGxiYWNrfTtcbiAgICBpZiAoISAoY29sbGVjdGlvbiBpbiBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbikpIHtcbiAgICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dID0ge307XG4gICAgICBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbkNvdW50W2NvbGxlY3Rpb25dID0gMDtcbiAgICB9XG4gICAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25bY29sbGVjdGlvbl1baWRdID0gcmVjb3JkO1xuICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0rKztcblxuICAgIGlmIChzZWxmLmZhY3ROYW1lICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSkge1xuICAgICAgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIHNlbGYuZmFjdFBhY2thZ2UsIHNlbGYuZmFjdE5hbWUsIDEpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLmZhY3ROYW1lICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSkge1xuICAgICAgICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgICAgICAgc2VsZi5mYWN0UGFja2FnZSwgc2VsZi5mYWN0TmFtZSwgLTEpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbltjb2xsZWN0aW9uXVtpZF07XG4gICAgICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0tLTtcbiAgICAgICAgaWYgKHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0gPT09IDApIHtcbiAgICAgICAgICBkZWxldGUgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25bY29sbGVjdGlvbl07XG4gICAgICAgICAgZGVsZXRlIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIC8vIEZpcmUgdGhlIHByb3ZpZGVkICdub3RpZmljYXRpb24nIChhbiBvYmplY3Qgd2hvc2UgYXR0cmlidXRlXG4gIC8vIHZhbHVlcyBhcmUgYWxsIEpTT04tY29tcGF0aWJpbGUpIC0tIGluZm9ybSBhbGwgbWF0Y2hpbmcgbGlzdGVuZXJzXG4gIC8vIChyZWdpc3RlcmVkIHdpdGggbGlzdGVuKCkpLlxuICAvL1xuICAvLyBJZiBmaXJlKCkgaXMgY2FsbGVkIGluc2lkZSBhIHdyaXRlIGZlbmNlLCB0aGVuIGVhY2ggb2YgdGhlXG4gIC8vIGxpc3RlbmVyIGNhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCBpbnNpZGUgdGhlIHdyaXRlIGZlbmNlIGFzIHdlbGwuXG4gIC8vXG4gIC8vIFRoZSBsaXN0ZW5lcnMgbWF5IGJlIGludm9rZWQgaW4gcGFyYWxsZWwsIHJhdGhlciB0aGFuIHNlcmlhbGx5LlxuICBmaXJlOiBhc3luYyBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbGxlY3Rpb24gPSBzZWxmLl9jb2xsZWN0aW9uRm9yTWVzc2FnZShub3RpZmljYXRpb24pO1xuXG4gICAgaWYgKCEoY29sbGVjdGlvbiBpbiBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzRm9yQ29sbGVjdGlvbiA9IHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dO1xuICAgIHZhciBjYWxsYmFja0lkcyA9IFtdO1xuICAgIE9iamVjdC5lbnRyaWVzKGxpc3RlbmVyc0ZvckNvbGxlY3Rpb24pLmZvckVhY2goZnVuY3Rpb24gKFtpZCwgbF0pIHtcbiAgICAgIGlmIChzZWxmLl9tYXRjaGVzKG5vdGlmaWNhdGlvbiwgbC50cmlnZ2VyKSkge1xuICAgICAgICBjYWxsYmFja0lkcy5wdXNoKGlkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIExpc3RlbmVyIGNhbGxiYWNrcyBjYW4geWllbGQsIHNvIHdlIG5lZWQgdG8gZmlyc3QgZmluZCBhbGwgdGhlIG9uZXMgdGhhdFxuICAgIC8vIG1hdGNoIGluIGEgc2luZ2xlIGl0ZXJhdGlvbiBvdmVyIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uICh3aGljaCBjYW4ndFxuICAgIC8vIGJlIG11dGF0ZWQgZHVyaW5nIHRoaXMgaXRlcmF0aW9uKSwgYW5kIHRoZW4gaW52b2tlIHRoZSBtYXRjaGluZ1xuICAgIC8vIGNhbGxiYWNrcywgY2hlY2tpbmcgYmVmb3JlIGVhY2ggY2FsbCB0byBlbnN1cmUgdGhleSBoYXZlbid0IHN0b3BwZWQuXG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IGhhdmUgdG8gY2hlY2sgdGhhdFxuICAgIC8vIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dIHN0aWxsID09PSBsaXN0ZW5lcnNGb3JDb2xsZWN0aW9uLFxuICAgIC8vIGJlY2F1c2UgdGhlIG9ubHkgd2F5IHRoYXQgc3RvcHMgYmVpbmcgdHJ1ZSBpcyBpZiBsaXN0ZW5lcnNGb3JDb2xsZWN0aW9uXG4gICAgLy8gZmlyc3QgZ2V0cyByZWR1Y2VkIGRvd24gdG8gdGhlIGVtcHR5IG9iamVjdCAoYW5kIHRoZW4gbmV2ZXIgZ2V0c1xuICAgIC8vIGluY3JlYXNlZCBhZ2FpbikuXG4gICAgZm9yIChjb25zdCBpZCBvZiBjYWxsYmFja0lkcykge1xuICAgICAgaWYgKGlkIGluIGxpc3RlbmVyc0ZvckNvbGxlY3Rpb24pIHtcbiAgICAgICAgYXdhaXQgbGlzdGVuZXJzRm9yQ29sbGVjdGlvbltpZF0uY2FsbGJhY2sobm90aWZpY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQSBub3RpZmljYXRpb24gbWF0Y2hlcyBhIHRyaWdnZXIgaWYgYWxsIGtleXMgdGhhdCBleGlzdCBpbiBib3RoIGFyZSBlcXVhbC5cbiAgLy9cbiAgLy8gRXhhbXBsZXM6XG4gIC8vICBOOntjb2xsZWN0aW9uOiBcIkNcIn0gbWF0Y2hlcyBUOntjb2xsZWN0aW9uOiBcIkNcIn1cbiAgLy8gICAgKGEgbm9uLXRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGFcbiAgLy8gICAgIG5vbi10YXJnZXRlZCBxdWVyeSlcbiAgLy8gIE46e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJYXCJ9IG1hdGNoZXMgVDp7Y29sbGVjdGlvbjogXCJDXCJ9XG4gIC8vICAgIChhIHRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGEgbm9uLXRhcmdldGVkIHF1ZXJ5KVxuICAvLyAgTjp7Y29sbGVjdGlvbjogXCJDXCJ9IG1hdGNoZXMgVDp7Y29sbGVjdGlvbjogXCJDXCIsIGlkOiBcIlhcIn1cbiAgLy8gICAgKGEgbm9uLXRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGFcbiAgLy8gICAgIHRhcmdldGVkIHF1ZXJ5KVxuICAvLyAgTjp7Y29sbGVjdGlvbjogXCJDXCIsIGlkOiBcIlhcIn0gbWF0Y2hlcyBUOntjb2xsZWN0aW9uOiBcIkNcIiwgaWQ6IFwiWFwifVxuICAvLyAgICAoYSB0YXJnZXRlZCB3cml0ZSB0byBhIGNvbGxlY3Rpb24gbWF0Y2hlcyBhIHRhcmdldGVkIHF1ZXJ5IHRhcmdldGVkXG4gIC8vICAgICBhdCB0aGUgc2FtZSBkb2N1bWVudClcbiAgLy8gIE46e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJYXCJ9IGRvZXMgbm90IG1hdGNoIFQ6e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJZXCJ9XG4gIC8vICAgIChhIHRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBkb2VzIG5vdCBtYXRjaCBhIHRhcmdldGVkIHF1ZXJ5XG4gIC8vICAgICB0YXJnZXRlZCBhdCBhIGRpZmZlcmVudCBkb2N1bWVudClcbiAgX21hdGNoZXM6IGZ1bmN0aW9uIChub3RpZmljYXRpb24sIHRyaWdnZXIpIHtcbiAgICAvLyBNb3N0IG5vdGlmaWNhdGlvbnMgdGhhdCB1c2UgdGhlIGNyb3NzYmFyIGhhdmUgYSBzdHJpbmcgYGNvbGxlY3Rpb25gIGFuZFxuICAgIC8vIG1heWJlIGFuIGBpZGAgdGhhdCBpcyBhIHN0cmluZyBvciBPYmplY3RJRC4gV2UncmUgYWxyZWFkeSBkaXZpZGluZyB1cFxuICAgIC8vIHRyaWdnZXJzIGJ5IGNvbGxlY3Rpb24sIGJ1dCBsZXQncyBmYXN0LXRyYWNrIFwibm9wZSwgZGlmZmVyZW50IElEXCIgKGFuZFxuICAgIC8vIGF2b2lkIHRoZSBvdmVybHkgZ2VuZXJpYyBFSlNPTi5lcXVhbHMpLiBUaGlzIG1ha2VzIGEgbm90aWNlYWJsZVxuICAgIC8vIHBlcmZvcm1hbmNlIGRpZmZlcmVuY2U7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9wdWxsLzM2OTdcbiAgICBpZiAodHlwZW9mKG5vdGlmaWNhdGlvbi5pZCkgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIHR5cGVvZih0cmlnZ2VyLmlkKSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgbm90aWZpY2F0aW9uLmlkICE9PSB0cmlnZ2VyLmlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChub3RpZmljYXRpb24uaWQgaW5zdGFuY2VvZiBNb25nb0lELk9iamVjdElEICYmXG4gICAgICAgIHRyaWdnZXIuaWQgaW5zdGFuY2VvZiBNb25nb0lELk9iamVjdElEICYmXG4gICAgICAgICEgbm90aWZpY2F0aW9uLmlkLmVxdWFscyh0cmlnZ2VyLmlkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0cmlnZ2VyKS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gIShrZXkgaW4gbm90aWZpY2F0aW9uKSB8fCBFSlNPTi5lcXVhbHModHJpZ2dlcltrZXldLCBub3RpZmljYXRpb25ba2V5XSk7XG4gICAgIH0pO1xuICB9XG59KTtcblxuLy8gVGhlIFwiaW52YWxpZGF0aW9uIGNyb3NzYmFyXCIgaXMgYSBzcGVjaWZpYyBpbnN0YW5jZSB1c2VkIGJ5IHRoZSBERFAgc2VydmVyIHRvXG4vLyBpbXBsZW1lbnQgd3JpdGUgZmVuY2Ugbm90aWZpY2F0aW9ucy4gTGlzdGVuZXIgY2FsbGJhY2tzIG9uIHRoaXMgY3Jvc3NiYXJcbi8vIHNob3VsZCBjYWxsIGJlZ2luV3JpdGUgb24gdGhlIGN1cnJlbnQgd3JpdGUgZmVuY2UgYmVmb3JlIHRoZXkgcmV0dXJuLCBpZiB0aGV5XG4vLyB3YW50IHRvIGRlbGF5IHRoZSB3cml0ZSBmZW5jZSBmcm9tIGZpcmluZyAoaWUsIHRoZSBERFAgbWV0aG9kLWRhdGEtdXBkYXRlZFxuLy8gbWVzc2FnZSBmcm9tIGJlaW5nIHNlbnQpLlxuRERQU2VydmVyLl9JbnZhbGlkYXRpb25Dcm9zc2JhciA9IG5ldyBERFBTZXJ2ZXIuX0Nyb3NzYmFyKHtcbiAgZmFjdE5hbWU6IFwiaW52YWxpZGF0aW9uLWNyb3NzYmFyLWxpc3RlbmVyc1wiXG59KTsiLCJpZiAocHJvY2Vzcy5lbnYuRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkwpIHtcbiAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ERFBfREVGQVVMVF9DT05ORUNUSU9OX1VSTCA9XG4gICAgcHJvY2Vzcy5lbnYuRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkw7XG59XG5cbk1ldGVvci5zZXJ2ZXIgPSBuZXcgU2VydmVyKCk7XG5cbk1ldGVvci5yZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xuICBhd2FpdCBERFBTZXJ2ZXIuX0ludmFsaWRhdGlvbkNyb3NzYmFyLmZpcmUobm90aWZpY2F0aW9uKTtcbn07XG5cbi8vIFByb3h5IHRoZSBwdWJsaWMgbWV0aG9kcyBvZiBNZXRlb3Iuc2VydmVyIHNvIHRoZXkgY2FuXG4vLyBiZSBjYWxsZWQgZGlyZWN0bHkgb24gTWV0ZW9yLlxuXG4gIFtcbiAgICAncHVibGlzaCcsXG4gICAgJ2lzQXN5bmNDYWxsJyxcbiAgICAnbWV0aG9kcycsXG4gICAgJ2NhbGwnLFxuICAgICdjYWxsQXN5bmMnLFxuICAgICdhcHBseScsXG4gICAgJ2FwcGx5QXN5bmMnLFxuICAgICdvbkNvbm5lY3Rpb24nLFxuICAgICdvbk1lc3NhZ2UnLFxuICBdLmZvckVhY2goXG4gIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBNZXRlb3JbbmFtZV0gPSBNZXRlb3Iuc2VydmVyW25hbWVdLmJpbmQoTWV0ZW9yLnNlcnZlcik7XG4gIH1cbik7XG4iLCJpbnRlcmZhY2UgQ2hhbmdlQ29sbGVjdG9yIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgRGF0YUVudHJ5IHtcbiAgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBEdW1teURvY3VtZW50VmlldyB7XG4gIHByaXZhdGUgZXhpc3RzSW46IFNldDxzdHJpbmc+O1xuICBwcml2YXRlIGRhdGFCeUtleTogTWFwPHN0cmluZywgRGF0YUVudHJ5W10+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXhpc3RzSW4gPSBuZXcgU2V0PHN0cmluZz4oKTsgLy8gc2V0IG9mIHN1YnNjcmlwdGlvbkhhbmRsZVxuICAgIHRoaXMuZGF0YUJ5S2V5ID0gbmV3IE1hcDxzdHJpbmcsIERhdGFFbnRyeVtdPigpOyAvLyBrZXktPiBbIHtzdWJzY3JpcHRpb25IYW5kbGUsIHZhbHVlfSBieSBwcmVjZWRlbmNlXVxuICB9XG5cbiAgZ2V0RmllbGRzKCk6IFJlY29yZDxzdHJpbmcsIG5ldmVyPiB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgY2xlYXJGaWVsZChcbiAgICBzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgXG4gICAga2V5OiBzdHJpbmcsIFxuICAgIGNoYW5nZUNvbGxlY3RvcjogQ2hhbmdlQ29sbGVjdG9yXG4gICk6IHZvaWQge1xuICAgIGNoYW5nZUNvbGxlY3RvcltrZXldID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgY2hhbmdlRmllbGQoXG4gICAgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IGFueSxcbiAgICBjaGFuZ2VDb2xsZWN0b3I6IENoYW5nZUNvbGxlY3RvcixcbiAgICBpc0FkZD86IGJvb2xlYW5cbiAgKTogdm9pZCB7XG4gICAgY2hhbmdlQ29sbGVjdG9yW2tleV0gPSB2YWx1ZTtcbiAgfVxufSIsImltcG9ydCB7IER1bW15RG9jdW1lbnRWaWV3IH0gZnJvbSBcIi4vZHVtbXlfZG9jdW1lbnRfdmlld1wiO1xuaW1wb3J0IHsgU2Vzc2lvbkRvY3VtZW50VmlldyB9IGZyb20gXCIuL3Nlc3Npb25fZG9jdW1lbnRfdmlld1wiO1xuXG5pbnRlcmZhY2UgU2Vzc2lvbkNhbGxiYWNrcyB7XG4gIGFkZGVkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiB2b2lkO1xuICBjaGFuZ2VkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiB2b2lkO1xuICByZW1vdmVkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZykgPT4gdm9pZDtcbn1cblxudHlwZSBEb2N1bWVudFZpZXcgPSBTZXNzaW9uRG9jdW1lbnRWaWV3IHwgRHVtbXlEb2N1bWVudFZpZXc7XG5cbmV4cG9ydCBjbGFzcyBTZXNzaW9uQ29sbGVjdGlvblZpZXcge1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbGxlY3Rpb25OYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgZG9jdW1lbnRzOiBNYXA8c3RyaW5nLCBEb2N1bWVudFZpZXc+O1xuICBwcml2YXRlIHJlYWRvbmx5IGNhbGxiYWNrczogU2Vzc2lvbkNhbGxiYWNrcztcblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIGNsaWVudCdzIHZpZXcgb2YgYSBzaW5nbGUgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gY29sbGVjdGlvbk5hbWUgLSBOYW1lIG9mIHRoZSBjb2xsZWN0aW9uIGl0IHJlcHJlc2VudHNcbiAgICogQHBhcmFtIHNlc3Npb25DYWxsYmFja3MgLSBUaGUgY2FsbGJhY2tzIGZvciBhZGRlZCwgY2hhbmdlZCwgcmVtb3ZlZFxuICAgKi9cbiAgY29uc3RydWN0b3IoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgc2Vzc2lvbkNhbGxiYWNrczogU2Vzc2lvbkNhbGxiYWNrcykge1xuICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBjb2xsZWN0aW9uTmFtZTtcbiAgICB0aGlzLmRvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IHNlc3Npb25DYWxsYmFja3M7XG4gIH1cblxuICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZSA9PT0gMDtcbiAgfVxuXG4gIHB1YmxpYyBkaWZmKHByZXZpb3VzOiBTZXNzaW9uQ29sbGVjdGlvblZpZXcpOiB2b2lkIHtcbiAgICBEaWZmU2VxdWVuY2UuZGlmZk1hcHMocHJldmlvdXMuZG9jdW1lbnRzLCB0aGlzLmRvY3VtZW50cywge1xuICAgICAgYm90aDogdGhpcy5kaWZmRG9jdW1lbnQuYmluZCh0aGlzKSxcbiAgICAgIHJpZ2h0T25seTogKGlkOiBzdHJpbmcsIG5vd0RWOiBEb2N1bWVudFZpZXcpID0+IHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MuYWRkZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQsIG5vd0RWLmdldEZpZWxkcygpKTtcbiAgICAgIH0sXG4gICAgICBsZWZ0T25seTogKGlkOiBzdHJpbmcsIHByZXZEVjogRG9jdW1lbnRWaWV3KSA9PiB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnJlbW92ZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkaWZmRG9jdW1lbnQoaWQ6IHN0cmluZywgcHJldkRWOiBEb2N1bWVudFZpZXcsIG5vd0RWOiBEb2N1bWVudFZpZXcpOiB2b2lkIHtcbiAgICBjb25zdCBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICBcbiAgICBEaWZmU2VxdWVuY2UuZGlmZk9iamVjdHMocHJldkRWLmdldEZpZWxkcygpLCBub3dEVi5nZXRGaWVsZHMoKSwge1xuICAgICAgYm90aDogKGtleTogc3RyaW5nLCBwcmV2OiBhbnksIG5vdzogYW55KSA9PiB7XG4gICAgICAgIGlmICghRUpTT04uZXF1YWxzKHByZXYsIG5vdykpIHtcbiAgICAgICAgICBmaWVsZHNba2V5XSA9IG5vdztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJpZ2h0T25seTogKGtleTogc3RyaW5nLCBub3c6IGFueSkgPT4ge1xuICAgICAgICBmaWVsZHNba2V5XSA9IG5vdztcbiAgICAgIH0sXG4gICAgICBsZWZ0T25seTogKGtleTogc3RyaW5nLCBwcmV2OiBhbnkpID0+IHtcbiAgICAgICAgZmllbGRzW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5jYWxsYmFja3MuY2hhbmdlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRlZChzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG4gICAgbGV0IGRvY1ZpZXc6IERvY3VtZW50VmlldyB8IHVuZGVmaW5lZCA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG4gICAgbGV0IGFkZGVkID0gZmFsc2U7XG5cbiAgICBpZiAoIWRvY1ZpZXcpIHtcbiAgICAgIGFkZGVkID0gdHJ1ZTtcbiAgICAgIGlmIChNZXRlb3Iuc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3kodGhpcy5jb2xsZWN0aW9uTmFtZSkudXNlRHVtbXlEb2N1bWVudFZpZXcpIHtcbiAgICAgICAgZG9jVmlldyA9IG5ldyBEdW1teURvY3VtZW50VmlldygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jVmlldyA9IG5ldyBTZXNzaW9uRG9jdW1lbnRWaWV3KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmRvY3VtZW50cy5zZXQoaWQsIGRvY1ZpZXcpO1xuICAgIH1cblxuICAgIGRvY1ZpZXcuZXhpc3RzSW4uYWRkKHN1YnNjcmlwdGlvbkhhbmRsZSk7XG4gICAgY29uc3QgY2hhbmdlQ29sbGVjdG9yOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBPYmplY3QuZW50cmllcyhmaWVsZHMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgZG9jVmlldyEuY2hhbmdlRmllbGQoXG4gICAgICAgIHN1YnNjcmlwdGlvbkhhbmRsZSxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgY2hhbmdlQ29sbGVjdG9yLFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKGFkZGVkKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5hZGRlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlQ29sbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MuY2hhbmdlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlQ29sbGVjdG9yKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2hhbmdlZChzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgaWQ6IHN0cmluZywgY2hhbmdlZDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWRSZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICBjb25zdCBkb2NWaWV3ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcblxuICAgIGlmICghZG9jVmlldykge1xuICAgICAgLy8gRG9jdW1lbnQgd2FzIGFscmVhZHkgcmVtb3ZlZC4gVGhpcyBjYW4gaGFwcGVuIGluIGhpZ2gtY29uY3VycmVuY3kgc2NlbmFyaW9zXG4gICAgICAvLyB3aGVyZSB0aGUgY2FjaGUgaXMgdXBkYXRlZCBzeW5jaHJvbm91c2x5IGJ1dCBjYWxsYmFja3MgYXJlIHByb2Nlc3NlZFxuICAgICAgLy8gYXN5bmNocm9ub3VzbHksIGFuZCBhIHJlbW92ZSB3YXMgcHJvY2Vzc2VkIGJlZm9yZSB0aGlzIGNoYW5nZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZW50cmllcyhjaGFuZ2VkKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRvY1ZpZXcuY2xlYXJGaWVsZChzdWJzY3JpcHRpb25IYW5kbGUsIGtleSwgY2hhbmdlZFJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2NWaWV3LmNoYW5nZUZpZWxkKHN1YnNjcmlwdGlvbkhhbmRsZSwga2V5LCB2YWx1ZSwgY2hhbmdlZFJlc3VsdCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbGxiYWNrcy5jaGFuZ2VkKHRoaXMuY29sbGVjdGlvbk5hbWUsIGlkLCBjaGFuZ2VkUmVzdWx0KTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVkKHN1YnNjcmlwdGlvbkhhbmRsZTogc3RyaW5nLCBpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZG9jVmlldyA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG5cbiAgICBpZiAoIWRvY1ZpZXcpIHtcbiAgICAgIC8vIERvY3VtZW50IHdhcyBhbHJlYWR5IHJlbW92ZWQuIFRoaXMgY2FuIGhhcHBlbiBpbiBoaWdoLWNvbmN1cnJlbmN5IHNjZW5hcmlvc1xuICAgICAgLy8gd2hlcmUgdGhlIGNhY2hlIGlzIHVwZGF0ZWQgc3luY2hyb25vdXNseSBidXQgY2FsbGJhY2tzIGFyZSBwcm9jZXNzZWRcbiAgICAgIC8vIGFzeW5jaHJvbm91c2x5LCBjYXVzaW5nIGR1cGxpY2F0ZSByZW1vdmFsIGF0dGVtcHRzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvY1ZpZXcuZXhpc3RzSW4uZGVsZXRlKHN1YnNjcmlwdGlvbkhhbmRsZSk7XG5cbiAgICBpZiAoZG9jVmlldy5leGlzdHNJbi5zaXplID09PSAwKSB7XG4gICAgICAvLyBpdCBpcyBnb25lIGZyb20gZXZlcnlvbmVcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnJlbW92ZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQpO1xuICAgICAgdGhpcy5kb2N1bWVudHMuZGVsZXRlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2hhbmdlZDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgICAgLy8gcmVtb3ZlIHRoaXMgc3Vic2NyaXB0aW9uIGZyb20gZXZlcnkgcHJlY2VkZW5jZSBsaXN0XG4gICAgICAvLyBhbmQgcmVjb3JkIHRoZSBjaGFuZ2VzXG4gICAgICBkb2NWaWV3LmRhdGFCeUtleS5mb3JFYWNoKChwcmVjZWRlbmNlTGlzdCwga2V5KSA9PiB7XG4gICAgICAgIGRvY1ZpZXcuY2xlYXJGaWVsZChzdWJzY3JpcHRpb25IYW5kbGUsIGtleSwgY2hhbmdlZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLmNoYW5nZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQsIGNoYW5nZWQpO1xuICAgIH1cbiAgfVxufSIsImludGVyZmFjZSBQcmVjZWRlbmNlSXRlbSB7XG4gIHN1YnNjcmlwdGlvbkhhbmRsZTogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xufVxuXG5pbnRlcmZhY2UgQ2hhbmdlQ29sbGVjdG9yIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgU2Vzc2lvbkRvY3VtZW50VmlldyB7XG4gIHByaXZhdGUgZXhpc3RzSW46IFNldDxzdHJpbmc+O1xuICBwcml2YXRlIGRhdGFCeUtleTogTWFwPHN0cmluZywgUHJlY2VkZW5jZUl0ZW1bXT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5leGlzdHNJbiA9IG5ldyBTZXQoKTsgLy8gc2V0IG9mIHN1YnNjcmlwdGlvbkhhbmRsZVxuICAgIC8vIE1lbW9yeSBHcm93dGhcbiAgICB0aGlzLmRhdGFCeUtleSA9IG5ldyBNYXAoKTsgLy8ga2V5LT4gWyB7c3Vic2NyaXB0aW9uSGFuZGxlLCB2YWx1ZX0gYnkgcHJlY2VkZW5jZV1cbiAgfVxuXG4gIGdldEZpZWxkcygpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcbiAgICBjb25zdCByZXQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICB0aGlzLmRhdGFCeUtleS5mb3JFYWNoKChwcmVjZWRlbmNlTGlzdCwga2V5KSA9PiB7XG4gICAgICByZXRba2V5XSA9IHByZWNlZGVuY2VMaXN0WzBdLnZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBjbGVhckZpZWxkKFxuICAgIHN1YnNjcmlwdGlvbkhhbmRsZTogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGNoYW5nZUNvbGxlY3RvcjogQ2hhbmdlQ29sbGVjdG9yXG4gICk6IHZvaWQge1xuICAgIC8vIFB1Ymxpc2ggQVBJIGlnbm9yZXMgX2lkIGlmIHByZXNlbnQgaW4gZmllbGRzXG4gICAgaWYgKGtleSA9PT0gXCJfaWRcIikgcmV0dXJuO1xuXG4gICAgY29uc3QgcHJlY2VkZW5jZUxpc3QgPSB0aGlzLmRhdGFCeUtleS5nZXQoa2V5KTtcbiAgICAvLyBJdCdzIG9rYXkgdG8gY2xlYXIgZmllbGRzIHRoYXQgZGlkbid0IGV4aXN0LiBObyBuZWVkIHRvIHRocm93XG4gICAgLy8gYW4gZXJyb3IuXG4gICAgaWYgKCFwcmVjZWRlbmNlTGlzdCkgcmV0dXJuO1xuXG4gICAgbGV0IHJlbW92ZWRWYWx1ZTogYW55ID0gdW5kZWZpbmVkO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVjZWRlbmNlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJlY2VkZW5jZSA9IHByZWNlZGVuY2VMaXN0W2ldO1xuICAgICAgaWYgKHByZWNlZGVuY2Uuc3Vic2NyaXB0aW9uSGFuZGxlID09PSBzdWJzY3JpcHRpb25IYW5kbGUpIHtcbiAgICAgICAgLy8gVGhlIHZpZXcncyB2YWx1ZSBjYW4gb25seSBjaGFuZ2UgaWYgdGhpcyBzdWJzY3JpcHRpb24gaXMgdGhlIG9uZSB0aGF0XG4gICAgICAgIC8vIHVzZWQgdG8gaGF2ZSBwcmVjZWRlbmNlLlxuICAgICAgICBpZiAoaSA9PT0gMCkgcmVtb3ZlZFZhbHVlID0gcHJlY2VkZW5jZS52YWx1ZTtcbiAgICAgICAgcHJlY2VkZW5jZUxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJlY2VkZW5jZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmRhdGFCeUtleS5kZWxldGUoa2V5KTtcbiAgICAgIGNoYW5nZUNvbGxlY3RvcltrZXldID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICByZW1vdmVkVmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgIUVKU09OLmVxdWFscyhyZW1vdmVkVmFsdWUsIHByZWNlZGVuY2VMaXN0WzBdLnZhbHVlKVxuICAgICkge1xuICAgICAgY2hhbmdlQ29sbGVjdG9yW2tleV0gPSBwcmVjZWRlbmNlTGlzdFswXS52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VGaWVsZChcbiAgICBzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogYW55LFxuICAgIGNoYW5nZUNvbGxlY3RvcjogQ2hhbmdlQ29sbGVjdG9yLFxuICAgIGlzQWRkOiBib29sZWFuID0gZmFsc2VcbiAgKTogdm9pZCB7XG4gICAgLy8gUHVibGlzaCBBUEkgaWdub3JlcyBfaWQgaWYgcHJlc2VudCBpbiBmaWVsZHNcbiAgICBpZiAoa2V5ID09PSBcIl9pZFwiKSByZXR1cm47XG5cbiAgICAvLyBEb24ndCBzaGFyZSBzdGF0ZSB3aXRoIHRoZSBkYXRhIHBhc3NlZCBpbiBieSB0aGUgdXNlci5cbiAgICB2YWx1ZSA9IEVKU09OLmNsb25lKHZhbHVlKTtcblxuICAgIGlmICghdGhpcy5kYXRhQnlLZXkuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuZGF0YUJ5S2V5LnNldChrZXksIFtcbiAgICAgICAgeyBzdWJzY3JpcHRpb25IYW5kbGU6IHN1YnNjcmlwdGlvbkhhbmRsZSwgdmFsdWU6IHZhbHVlIH0sXG4gICAgICBdKTtcbiAgICAgIGNoYW5nZUNvbGxlY3RvcltrZXldID0gdmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJlY2VkZW5jZUxpc3QgPSB0aGlzLmRhdGFCeUtleS5nZXQoa2V5KSE7XG4gICAgbGV0IGVsdDogUHJlY2VkZW5jZUl0ZW0gfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIWlzQWRkKSB7XG4gICAgICBlbHQgPSBwcmVjZWRlbmNlTGlzdC5maW5kKFxuICAgICAgICAocHJlY2VkZW5jZSkgPT4gcHJlY2VkZW5jZS5zdWJzY3JpcHRpb25IYW5kbGUgPT09IHN1YnNjcmlwdGlvbkhhbmRsZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZWx0KSB7XG4gICAgICBpZiAoZWx0ID09PSBwcmVjZWRlbmNlTGlzdFswXSAmJiAhRUpTT04uZXF1YWxzKHZhbHVlLCBlbHQudmFsdWUpKSB7XG4gICAgICAgIC8vIHRoaXMgc3Vic2NyaXB0aW9uIGlzIGNoYW5naW5nIHRoZSB2YWx1ZSBvZiB0aGlzIGZpZWxkLlxuICAgICAgICBjaGFuZ2VDb2xsZWN0b3Jba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgZWx0LnZhbHVlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoaXMgc3Vic2NyaXB0aW9uIGlzIG5ld2x5IGNhcmluZyBhYm91dCB0aGlzIGZpZWxkXG4gICAgICBwcmVjZWRlbmNlTGlzdC5wdXNoKHsgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdWJzY3JpcHRpb25IYW5kbGUsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICB9XG4gIH1cbn0iXX0=
