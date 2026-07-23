Package["core-runtime"].queue("ddp-common",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var ECMAScript = Package.ecmascript.ECMAScript;
var EJSON = Package.ejson.EJSON;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var DDPCommon;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-common":{"namespace.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ddp-common/namespace.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
/**
 * @namespace DDPCommon
 * @summary Namespace for DDPCommon-related methods/classes. Shared between 
 * `ddp-client` and `ddp-server`, where the ddp-client is the implementation
 * of a ddp client for both client AND server; and the ddp server is the
 * implementation of the livedata server and stream server. Common 
 * functionality shared between both can be shared under this namespace
 */ DDPCommon = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"heartbeat.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ddp-common/heartbeat.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// Heartbeat options:
//   heartbeatInterval: interval to send pings, in milliseconds.
//   heartbeatTimeout: timeout to close the connection if a reply isn't
//     received, in milliseconds.
//   sendPing: function to call to send a ping on the connection.
//   onTimeout: function to call to close the connection.
DDPCommon.Heartbeat = class Heartbeat {
    stop() {
        this._clearHeartbeatIntervalTimer();
        this._clearHeartbeatTimeoutTimer();
    }
    start() {
        this.stop();
        this._startHeartbeatIntervalTimer();
    }
    _startHeartbeatIntervalTimer() {
        this._heartbeatIntervalHandle = Meteor.setInterval(()=>this._heartbeatIntervalFired(), this.heartbeatInterval);
    }
    _startHeartbeatTimeoutTimer() {
        this._heartbeatTimeoutHandle = Meteor.setTimeout(()=>this._heartbeatTimeoutFired(), this.heartbeatTimeout);
    }
    _clearHeartbeatIntervalTimer() {
        if (this._heartbeatIntervalHandle) {
            Meteor.clearInterval(this._heartbeatIntervalHandle);
            this._heartbeatIntervalHandle = null;
        }
    }
    _clearHeartbeatTimeoutTimer() {
        if (this._heartbeatTimeoutHandle) {
            Meteor.clearTimeout(this._heartbeatTimeoutHandle);
            this._heartbeatTimeoutHandle = null;
        }
    }
    // The heartbeat interval timer is fired when we should send a ping.
    _heartbeatIntervalFired() {
        // don't send ping if we've seen a packet since we last checked,
        // *or* if we have already sent a ping and are awaiting a timeout.
        // That shouldn't happen, but it's possible if
        // `this.heartbeatInterval` is smaller than
        // `this.heartbeatTimeout`.
        if (!this._seenPacket && !this._heartbeatTimeoutHandle) {
            this._sendPing();
            // Set up timeout, in case a pong doesn't arrive in time.
            this._startHeartbeatTimeoutTimer();
        }
        this._seenPacket = false;
    }
    // The heartbeat timeout timer is fired when we sent a ping, but we
    // timed out waiting for the pong.
    _heartbeatTimeoutFired() {
        this._heartbeatTimeoutHandle = null;
        this._onTimeout();
    }
    messageReceived() {
        // Tell periodic checkin that we have seen a packet, and thus it
        // does not need to send a ping this cycle.
        this._seenPacket = true;
        // If we were waiting for a pong, we got it.
        if (this._heartbeatTimeoutHandle) {
            this._clearHeartbeatTimeoutTimer();
        }
    }
    constructor(options){
        this.heartbeatInterval = options.heartbeatInterval;
        this.heartbeatTimeout = options.heartbeatTimeout;
        this._sendPing = options.sendPing;
        this._onTimeout = options.onTimeout;
        this._seenPacket = false;
        this._heartbeatIntervalHandle = null;
        this._heartbeatTimeoutHandle = null;
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ddp-common/utils.js                                                                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
"use strict";module.export({keys:()=>keys,isEmpty:()=>isEmpty,last:()=>last});module.export({hasOwn:()=>hasOwn,slice:()=>slice},true);
const hasOwn = Object.prototype.hasOwnProperty;
const slice = Array.prototype.slice;
function keys(obj) {
    return Object.keys(Object(obj));
}
function isEmpty(obj) {
    if (obj == null) {
        return true;
    }
    if (Array.isArray(obj) || typeof obj === "string") {
        return obj.length === 0;
    }
    for(const key in obj){
        if (hasOwn.call(obj, key)) {
            return false;
        }
    }
    return true;
}
function last(array, n, guard) {
    if (array == null) {
        return;
    }
    if (n == null || guard) {
        return array[array.length - 1];
    }
    return slice.call(array, Math.max(array.length - n, 0));
}
DDPCommon.SUPPORTED_DDP_VERSIONS = [
    '1',
    'pre2',
    'pre1'
];
DDPCommon.parseDDP = function(stringMessage) {
    try {
        var msg = JSON.parse(stringMessage);
    } catch (e) {
        Meteor._debug("Discarding message with invalid JSON", stringMessage);
        return null;
    }
    // DDP messages must be objects.
    if (msg === null || typeof msg !== 'object') {
        Meteor._debug("Discarding non-object DDP message", stringMessage);
        return null;
    }
    // massage msg to get it into "abstract ddp" rather than "wire ddp" format.
    // switch between "cleared" rep of unsetting fields and "undefined"
    // rep of same
    if (hasOwn.call(msg, 'cleared')) {
        if (!hasOwn.call(msg, 'fields')) {
            msg.fields = {};
        }
        msg.cleared.forEach((clearKey)=>{
            msg.fields[clearKey] = undefined;
        });
        delete msg.cleared;
    }
    [
        'fields',
        'params',
        'result'
    ].forEach((field)=>{
        if (hasOwn.call(msg, field)) {
            msg[field] = EJSON._adjustTypesFromJSONValue(msg[field]);
        }
    });
    return msg;
};
DDPCommon.stringifyDDP = function(msg) {
    if (msg.id && typeof msg.id !== 'string') {
        throw new Error("Message id is not a string");
    }
    // Fast path: messages without fields/params/result need no EJSON conversion
    // (e.g. 'removed', 'ready', 'nosub', 'ping', 'pong')
    if (msg.fields === undefined && msg.params === undefined && msg.result === undefined) {
        return JSON.stringify(msg);
    }
    // Build wire-format object without cloning the entire message.
    // Uses EJSON.toJSONValue (copy-on-write) per field — only allocates new
    // objects for subtrees that actually contain EJSON types (Date, Binary, etc.).
    const wire = {};
    let cleared = null;
    let wireFields = null;
    for(const key in msg){
        if (!hasOwn.call(msg, key)) continue;
        switch(key){
            case 'fields':
                for(const fieldKey in msg.fields){
                    if (!hasOwn.call(msg.fields, fieldKey)) continue;
                    const value = msg.fields[fieldKey];
                    if (value === undefined) {
                        (cleared !== null && cleared !== void 0 ? cleared : cleared = []).push(fieldKey);
                    } else {
                        (wireFields !== null && wireFields !== void 0 ? wireFields : wireFields = {})[fieldKey] = EJSON.toJSONValue(value);
                    }
                }
                break;
            case 'params':
                wire.params = EJSON.toJSONValue(msg.params);
                break;
            case 'result':
                wire.result = EJSON.toJSONValue(msg.result);
                break;
            default:
                wire[key] = msg[key];
        }
    }
    if (wireFields !== null) wire.fields = wireFields;
    if (cleared !== null) wire.cleared = cleared;
    return JSON.stringify(wire);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"method_invocation.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ddp-common/method_invocation.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);
// Instance name is this because it is usually referred to as this inside a
// method definition
/**
 * @summary The state for a single invocation of a method, referenced by this
 * inside a method definition.
 * @param {Object} options
 * @instanceName this
 * @showInstanceName true
 */ DDPCommon.MethodInvocation = class MethodInvocation {
    /**
   * @summary Call inside a method invocation.  Allow subsequent method from this client to begin running in a new fiber.
   * @locus Server
   * @memberOf DDPCommon.MethodInvocation
   * @instance
   */ unblock() {
        this._calledUnblock = true;
        this._unblock();
    }
    /**
   * @summary Set the logged in user.
   * @locus Server
   * @memberOf DDPCommon.MethodInvocation
   * @instance
   * @param {String | null} userId The value that should be returned by `userId` on this connection.
   */ setUserId(userId) {
        return _async_to_generator(function*() {
            if (this._calledUnblock) {
                throw new Error("Can't call setUserId in a method after calling unblock");
            }
            this.userId = userId;
            yield this._setUserId(userId);
        }).call(this);
    }
    constructor(options){
        // true if we're running not the actual method, but a stub (that is,
        // if we're on a client (which may be a browser, or in the future a
        // server connecting to another server) and presently running a
        // simulation of a server-side method for latency compensation
        // purposes). not currently true except in a client such as a browser,
        // since there's usually no point in running stubs unless you have a
        // zero-latency connection to the user.
        /**
     * @summary The name given to the method.
     * @locus Anywhere
     * @name  name
     * @memberOf DDPCommon.MethodInvocation
     * @instance
     * @type {String}
     */ this.name = options.name;
        /**
     * @summary Access inside a method invocation.  Boolean value, true if this invocation is a stub.
     * @locus Anywhere
     * @name  isSimulation
     * @memberOf DDPCommon.MethodInvocation
     * @instance
     * @type {Boolean}
     */ this.isSimulation = options.isSimulation;
        // call this function to allow other method invocations (from the
        // same client) to continue running without waiting for this one to
        // complete.
        this._unblock = options.unblock || function() {};
        this._calledUnblock = false;
        // used to know when the function apply was called by callAsync
        this._isFromCallAsync = options.isFromCallAsync;
        // current user id
        /**
     * @summary The id of the user that made this method call, or `null` if no user was logged in.
     * @locus Anywhere
     * @name  userId
     * @memberOf DDPCommon.MethodInvocation
     * @instance
     */ this.userId = options.userId;
        // sets current user id in all appropriate server contexts and
        // reruns subscriptions
        this._setUserId = options.setUserId || function() {};
        // On the server, the connection this method call came in on.
        /**
     * @summary Access inside a method invocation. The [connection](#meteor_onconnection) that this method was received on. `null` if the method is not associated with a connection, eg. a server initiated method call. Calls to methods made from a server method which was in turn initiated from the client share the same `connection`.
     * @locus Server
     * @name  connection
     * @memberOf DDPCommon.MethodInvocation
     * @instance
     */ this.connection = options.connection;
        // The seed for randomStream value generation
        this.randomSeed = options.randomSeed;
        // This is set by RandomStream.get; and holds the random stream state
        this.randomStream = null;
        this.fence = options.fence;
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"random_stream.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ddp-common/random_stream.js                                                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// RandomStream allows for generation of pseudo-random values, from a seed.
//
// We use this for consistent 'random' numbers across the client and server.
// We want to generate probably-unique IDs on the client, and we ideally want
// the server to generate the same IDs when it executes the method.
//
// For generated values to be the same, we must seed ourselves the same way,
// and we must keep track of the current state of our pseudo-random generators.
// We call this state the scope. By default, we use the current DDP method
// invocation as our scope.  DDP now allows the client to specify a randomSeed.
// If a randomSeed is provided it will be used to seed our random sequences.
// In this way, client and server method calls will generate the same values.
//
// We expose multiple named streams; each stream is independent
// and is seeded differently (but predictably from the name).
// By using multiple streams, we support reordering of requests,
// as long as they occur on different streams.
//
// @param options {Optional Object}
//   seed: Array or value - Seed value(s) for the generator.
//                          If an array, will be used as-is
//                          If a value, will be converted to a single-value array
//                          If omitted, a random array will be used as the seed.
DDPCommon.RandomStream = class RandomStream {
    // Get a random sequence with the specified name, creating it if does not exist.
    // New sequences are seeded with the seed concatenated with the name.
    // By passing a seed into Random.create, we use the Alea generator.
    _sequence(name) {
        var self = this;
        var sequence = self.sequences[name] || null;
        if (sequence === null) {
            var sequenceSeed = self.seed.concat(name);
            for(var i = 0; i < sequenceSeed.length; i++){
                if (typeof sequenceSeed[i] === "function") {
                    sequenceSeed[i] = sequenceSeed[i]();
                }
            }
            self.sequences[name] = sequence = Random.createWithSeeds.apply(null, sequenceSeed);
        }
        return sequence;
    }
    constructor(options){
        this.seed = [].concat(options.seed || randomToken());
        this.sequences = Object.create(null);
    }
};
// Returns a random string of sufficient length for a random seed.
// This is a placeholder function; a similar function is planned
// for Random itself; when that is added we should remove this function,
// and call Random's randomToken instead.
function randomToken() {
    return Random.hexString(20);
}
;
// Returns the random stream with the specified name, in the specified
// scope. If a scope is passed, then we use that to seed a (not
// cryptographically secure) PRNG using the fast Alea algorithm.  If
// scope is null (or otherwise falsey) then we use a generated seed.
//
// However, scope will normally be the current DDP method invocation,
// so we'll use the stream with the specified name, and we should get
// consistent values on the client and server sides of a method call.
DDPCommon.RandomStream.get = function(scope, name) {
    if (!name) {
        name = "default";
    }
    if (!scope) {
        // There was no scope passed in; the sequence won't actually be
        // reproducible. but make it fast (and not cryptographically
        // secure) anyways, so that the behavior is similar to what you'd
        // get by passing in a scope.
        return Random.insecure;
    }
    var randomStream = scope.randomStream;
    if (!randomStream) {
        scope.randomStream = randomStream = new DDPCommon.RandomStream({
            seed: scope.randomSeed
        });
    }
    return randomStream._sequence(name);
};
// Creates a randomSeed for passing to a method call.
// Note that we take enclosing as an argument,
// though we expect it to be DDP._CurrentMethodInvocation.get()
// However, we often evaluate makeRpcSeed lazily, and thus the relevant
// invocation may not be the one currently in scope.
// If enclosing is null, we'll use Random and values won't be repeatable.
DDPCommon.makeRpcSeed = function(enclosing, methodName) {
    var stream = DDPCommon.RandomStream.get(enclosing, '/rpc/' + methodName);
    return stream.hexString(20);
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
      DDPCommon: DDPCommon
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ddp-common/namespace.js",
    "/node_modules/meteor/ddp-common/heartbeat.js",
    "/node_modules/meteor/ddp-common/utils.js",
    "/node_modules/meteor/ddp-common/method_invocation.js",
    "/node_modules/meteor/ddp-common/random_stream.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/ddp-common.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNvbW1vbi9uYW1lc3BhY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2RkcC1jb21tb24vaGVhcnRiZWF0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY29tbW9uL3V0aWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY29tbW9uL21ldGhvZF9pbnZvY2F0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY29tbW9uL3JhbmRvbV9zdHJlYW0uanMiXSwibmFtZXMiOlsiRERQQ29tbW9uIiwiSGVhcnRiZWF0Iiwic3RvcCIsIl9jbGVhckhlYXJ0YmVhdEludGVydmFsVGltZXIiLCJfY2xlYXJIZWFydGJlYXRUaW1lb3V0VGltZXIiLCJzdGFydCIsIl9zdGFydEhlYXJ0YmVhdEludGVydmFsVGltZXIiLCJfaGVhcnRiZWF0SW50ZXJ2YWxIYW5kbGUiLCJNZXRlb3IiLCJzZXRJbnRlcnZhbCIsIl9oZWFydGJlYXRJbnRlcnZhbEZpcmVkIiwiaGVhcnRiZWF0SW50ZXJ2YWwiLCJfc3RhcnRIZWFydGJlYXRUaW1lb3V0VGltZXIiLCJfaGVhcnRiZWF0VGltZW91dEhhbmRsZSIsInNldFRpbWVvdXQiLCJfaGVhcnRiZWF0VGltZW91dEZpcmVkIiwiaGVhcnRiZWF0VGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJjbGVhclRpbWVvdXQiLCJfc2VlblBhY2tldCIsIl9zZW5kUGluZyIsIl9vblRpbWVvdXQiLCJtZXNzYWdlUmVjZWl2ZWQiLCJvcHRpb25zIiwic2VuZFBpbmciLCJvblRpbWVvdXQiLCJoYXNPd24iLCJPYmplY3QiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsInNsaWNlIiwiQXJyYXkiLCJrZXlzIiwib2JqIiwiaXNFbXB0eSIsImlzQXJyYXkiLCJsZW5ndGgiLCJrZXkiLCJjYWxsIiwibGFzdCIsImFycmF5IiwibiIsImd1YXJkIiwiTWF0aCIsIm1heCIsIlNVUFBPUlRFRF9ERFBfVkVSU0lPTlMiLCJwYXJzZUREUCIsInN0cmluZ01lc3NhZ2UiLCJtc2ciLCJKU09OIiwicGFyc2UiLCJlIiwiX2RlYnVnIiwiZmllbGRzIiwiY2xlYXJlZCIsImZvckVhY2giLCJjbGVhcktleSIsInVuZGVmaW5lZCIsImZpZWxkIiwiRUpTT04iLCJfYWRqdXN0VHlwZXNGcm9tSlNPTlZhbHVlIiwic3RyaW5naWZ5RERQIiwiaWQiLCJFcnJvciIsInBhcmFtcyIsInJlc3VsdCIsInN0cmluZ2lmeSIsIndpcmUiLCJ3aXJlRmllbGRzIiwiZmllbGRLZXkiLCJ2YWx1ZSIsInB1c2giLCJ0b0pTT05WYWx1ZSIsIk1ldGhvZEludm9jYXRpb24iLCJ1bmJsb2NrIiwiX2NhbGxlZFVuYmxvY2siLCJfdW5ibG9jayIsInNldFVzZXJJZCIsInVzZXJJZCIsIl9zZXRVc2VySWQiLCJuYW1lIiwiaXNTaW11bGF0aW9uIiwiX2lzRnJvbUNhbGxBc3luYyIsImlzRnJvbUNhbGxBc3luYyIsImNvbm5lY3Rpb24iLCJyYW5kb21TZWVkIiwicmFuZG9tU3RyZWFtIiwiZmVuY2UiLCJSYW5kb21TdHJlYW0iLCJfc2VxdWVuY2UiLCJzZWxmIiwic2VxdWVuY2UiLCJzZXF1ZW5jZXMiLCJzZXF1ZW5jZVNlZWQiLCJzZWVkIiwiY29uY2F0IiwiaSIsIlJhbmRvbSIsImNyZWF0ZVdpdGhTZWVkcyIsImFwcGx5IiwicmFuZG9tVG9rZW4iLCJjcmVhdGUiLCJoZXhTdHJpbmciLCJnZXQiLCJzY29wZSIsImluc2VjdXJlIiwibWFrZVJwY1NlZWQiLCJlbmNsb3NpbmciLCJtZXRob2ROYW1lIiwic3RyZWFtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7OztDQU9DLEdBQ0RBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FDUmIscUJBQXFCO0FBQ3JCLGdFQUFnRTtBQUNoRSx1RUFBdUU7QUFDdkUsaUNBQWlDO0FBQ2pDLGlFQUFp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bEIsWUFBWTtJQUNyQyxJQUFJLENBQUNBLGNBQWM7UUFDakJrQixNQUFNbEIsWUFBWSxHQUFHQSxlQUFlLElBQUl0RixVQUFVd0YsWUFBWSxDQUFDO1lBQzdETSxNQUFNVSxNQUFNbkIsVUFBVTtRQUN4QjtJQUNGO0lBQ0EsT0FBT0MsYUFBYUcsU0FBUyxDQUFDVDtBQUNoQztBQUVBLHFEQUFxRDtBQUNyRCw4Q0FBOEM7QUFDOUMsK0RBQStEO0FBQy9ELHVFQUF1RTtBQUN2RSxvREFBb0Q7QUFDcEQseUVBQXlFO0FBQ3pFaEYsVUFBVTBHLFdBQVcsR0FBRyxTQUFVQyxTQUFTLEVBQUVDLFVBQVU7SUFDckQsSUFBSUMsU0FBUzdHLFVBQVV3RixZQUFZLENBQUNlLEdBQUcsQ0FBQ0ksV0FBVyxVQUFVQztJQUM3RCxPQUFPQyxPQUFPUCxTQUFTLENBQUM7QUFDMUIiLCJmaWxlIjoiL3BhY2thZ2VzL2RkcC1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBuYW1lc3BhY2UgRERQQ29tbW9uXG4gKiBAc3VtbWFyeSBOYW1lc3BhY2UgZm9yIEREUENvbW1vbi1yZWxhdGVkIG1ldGhvZHMvY2xhc3Nlcy4gU2hhcmVkIGJldHdlZW4gXG4gKiBgZGRwLWNsaWVudGAgYW5kIGBkZHAtc2VydmVyYCwgd2hlcmUgdGhlIGRkcC1jbGllbnQgaXMgdGhlIGltcGxlbWVudGF0aW9uXG4gKiBvZiBhIGRkcCBjbGllbnQgZm9yIGJvdGggY2xpZW50IEFORCBzZXJ2ZXI7IGFuZCB0aGUgZGRwIHNlcnZlciBpcyB0aGVcbiAqIGltcGxlbWVudGF0aW9uIG9mIHRoZSBsaXZlZGF0YSBzZXJ2ZXIgYW5kIHN0cmVhbSBzZXJ2ZXIuIENvbW1vbiBcbiAqIGZ1bmN0aW9uYWxpdHkgc2hhcmVkIGJldHdlZW4gYm90aCBjYW4gYmUgc2hhcmVkIHVuZGVyIHRoaXMgbmFtZXNwYWNlXG4gKi9cbkREUENvbW1vbiA9IHt9O1xuIiwiLy8gSGVhcnRiZWF0IG9wdGlvbnM6XG4vLyAgIGhlYXJ0YmVhdEludGVydmFsOiBpbnRlcnZhbCB0byBzZW5kIHBpbmdzLCBpbiBtaWxsaXNlY29uZHMuXG4vLyAgIGhlYXJ0YmVhdFRpbWVvdXQ6IHRpbWVvdXQgdG8gY2xvc2UgdGhlIGNvbm5lY3Rpb24gaWYgYSByZXBseSBpc24ndFxuLy8gICAgIHJlY2VpdmVkLCBpbiBtaWxsaXNlY29uZHMuXG4vLyAgIHNlbmRQaW5nOiBmdW5jdGlvbiB0byBjYWxsIHRvIHNlbmQgYSBwaW5nIG9uIHRoZSBjb25uZWN0aW9uLlxuLy8gICBvblRpbWVvdXQ6IGZ1bmN0aW9uIHRvIGNhbGwgdG8gY2xvc2UgdGhlIGNvbm5lY3Rpb24uXG5cbkREUENvbW1vbi5IZWFydGJlYXQgPSBjbGFzcyBIZWFydGJlYXQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5oZWFydGJlYXRJbnRlcnZhbCA9IG9wdGlvbnMuaGVhcnRiZWF0SW50ZXJ2YWw7XG4gICAgdGhpcy5oZWFydGJlYXRUaW1lb3V0ID0gb3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0O1xuICAgIHRoaXMuX3NlbmRQaW5nID0gb3B0aW9ucy5zZW5kUGluZztcbiAgICB0aGlzLl9vblRpbWVvdXQgPSBvcHRpb25zLm9uVGltZW91dDtcbiAgICB0aGlzLl9zZWVuUGFja2V0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbEhhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5faGVhcnRiZWF0VGltZW91dEhhbmRsZSA9IG51bGw7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuX2NsZWFySGVhcnRiZWF0SW50ZXJ2YWxUaW1lcigpO1xuICAgIHRoaXMuX2NsZWFySGVhcnRiZWF0VGltZW91dFRpbWVyKCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLl9zdGFydEhlYXJ0YmVhdEludGVydmFsVGltZXIoKTtcbiAgfVxuXG4gIF9zdGFydEhlYXJ0YmVhdEludGVydmFsVGltZXIoKSB7XG4gICAgdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWxIYW5kbGUgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoXG4gICAgICAoKSA9PiB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbEZpcmVkKCksXG4gICAgICB0aGlzLmhlYXJ0YmVhdEludGVydmFsXG4gICAgKTtcbiAgfVxuXG4gIF9zdGFydEhlYXJ0YmVhdFRpbWVvdXRUaW1lcigpIHtcbiAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SGFuZGxlID0gTWV0ZW9yLnNldFRpbWVvdXQoXG4gICAgICAoKSA9PiB0aGlzLl9oZWFydGJlYXRUaW1lb3V0RmlyZWQoKSxcbiAgICAgIHRoaXMuaGVhcnRiZWF0VGltZW91dFxuICAgICk7XG4gIH1cblxuICBfY2xlYXJIZWFydGJlYXRJbnRlcnZhbFRpbWVyKCkge1xuICAgIGlmICh0aGlzLl9oZWFydGJlYXRJbnRlcnZhbEhhbmRsZSkge1xuICAgICAgTWV0ZW9yLmNsZWFySW50ZXJ2YWwodGhpcy5faGVhcnRiZWF0SW50ZXJ2YWxIYW5kbGUpO1xuICAgICAgdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWxIYW5kbGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9jbGVhckhlYXJ0YmVhdFRpbWVvdXRUaW1lcigpIHtcbiAgICBpZiAodGhpcy5faGVhcnRiZWF0VGltZW91dEhhbmRsZSkge1xuICAgICAgTWV0ZW9yLmNsZWFyVGltZW91dCh0aGlzLl9oZWFydGJlYXRUaW1lb3V0SGFuZGxlKTtcbiAgICAgIHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRIYW5kbGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBoZWFydGJlYXQgaW50ZXJ2YWwgdGltZXIgaXMgZmlyZWQgd2hlbiB3ZSBzaG91bGQgc2VuZCBhIHBpbmcuXG4gIF9oZWFydGJlYXRJbnRlcnZhbEZpcmVkKCkge1xuICAgIC8vIGRvbid0IHNlbmQgcGluZyBpZiB3ZSd2ZSBzZWVuIGEgcGFja2V0IHNpbmNlIHdlIGxhc3QgY2hlY2tlZCxcbiAgICAvLyAqb3IqIGlmIHdlIGhhdmUgYWxyZWFkeSBzZW50IGEgcGluZyBhbmQgYXJlIGF3YWl0aW5nIGEgdGltZW91dC5cbiAgICAvLyBUaGF0IHNob3VsZG4ndCBoYXBwZW4sIGJ1dCBpdCdzIHBvc3NpYmxlIGlmXG4gICAgLy8gYHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxgIGlzIHNtYWxsZXIgdGhhblxuICAgIC8vIGB0aGlzLmhlYXJ0YmVhdFRpbWVvdXRgLlxuICAgIGlmICghIHRoaXMuX3NlZW5QYWNrZXQgJiYgISB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SGFuZGxlKSB7XG4gICAgICB0aGlzLl9zZW5kUGluZygpO1xuICAgICAgLy8gU2V0IHVwIHRpbWVvdXQsIGluIGNhc2UgYSBwb25nIGRvZXNuJ3QgYXJyaXZlIGluIHRpbWUuXG4gICAgICB0aGlzLl9zdGFydEhlYXJ0YmVhdFRpbWVvdXRUaW1lcigpO1xuICAgIH1cbiAgICB0aGlzLl9zZWVuUGFja2V0ID0gZmFsc2U7XG4gIH1cblxuICAvLyBUaGUgaGVhcnRiZWF0IHRpbWVvdXQgdGltZXIgaXMgZmlyZWQgd2hlbiB3ZSBzZW50IGEgcGluZywgYnV0IHdlXG4gIC8vIHRpbWVkIG91dCB3YWl0aW5nIGZvciB0aGUgcG9uZy5cbiAgX2hlYXJ0YmVhdFRpbWVvdXRGaXJlZCgpIHtcbiAgICB0aGlzLl9oZWFydGJlYXRUaW1lb3V0SGFuZGxlID0gbnVsbDtcbiAgICB0aGlzLl9vblRpbWVvdXQoKTtcbiAgfVxuXG4gIG1lc3NhZ2VSZWNlaXZlZCgpIHtcbiAgICAvLyBUZWxsIHBlcmlvZGljIGNoZWNraW4gdGhhdCB3ZSBoYXZlIHNlZW4gYSBwYWNrZXQsIGFuZCB0aHVzIGl0XG4gICAgLy8gZG9lcyBub3QgbmVlZCB0byBzZW5kIGEgcGluZyB0aGlzIGN5Y2xlLlxuICAgIHRoaXMuX3NlZW5QYWNrZXQgPSB0cnVlO1xuICAgIC8vIElmIHdlIHdlcmUgd2FpdGluZyBmb3IgYSBwb25nLCB3ZSBnb3QgaXQuXG4gICAgaWYgKHRoaXMuX2hlYXJ0YmVhdFRpbWVvdXRIYW5kbGUpIHtcbiAgICAgIHRoaXMuX2NsZWFySGVhcnRiZWF0VGltZW91dFRpbWVyKCk7XG4gICAgfVxuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBjb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuZXhwb3J0IGNvbnN0IHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5leHBvcnQgZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKE9iamVjdChvYmopKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkob2JqKSB7XG4gIGlmIChvYmogPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSB8fFxuICAgICAgdHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdChhcnJheSwgbiwgZ3VhcmQpIHtcbiAgaWYgKGFycmF5ID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQpIHtcbiAgICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gIH1cblxuICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xufVxuXG5ERFBDb21tb24uU1VQUE9SVEVEX0REUF9WRVJTSU9OUyA9IFsgJzEnLCAncHJlMicsICdwcmUxJyBdO1xuXG5ERFBDb21tb24ucGFyc2VERFAgPSBmdW5jdGlvbiAoc3RyaW5nTWVzc2FnZSkge1xuICB0cnkge1xuICAgIHZhciBtc2cgPSBKU09OLnBhcnNlKHN0cmluZ01lc3NhZ2UpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcIkRpc2NhcmRpbmcgbWVzc2FnZSB3aXRoIGludmFsaWQgSlNPTlwiLCBzdHJpbmdNZXNzYWdlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBERFAgbWVzc2FnZXMgbXVzdCBiZSBvYmplY3RzLlxuICBpZiAobXNnID09PSBudWxsIHx8IHR5cGVvZiBtc2cgIT09ICdvYmplY3QnKSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcIkRpc2NhcmRpbmcgbm9uLW9iamVjdCBERFAgbWVzc2FnZVwiLCBzdHJpbmdNZXNzYWdlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIG1hc3NhZ2UgbXNnIHRvIGdldCBpdCBpbnRvIFwiYWJzdHJhY3QgZGRwXCIgcmF0aGVyIHRoYW4gXCJ3aXJlIGRkcFwiIGZvcm1hdC5cblxuICAvLyBzd2l0Y2ggYmV0d2VlbiBcImNsZWFyZWRcIiByZXAgb2YgdW5zZXR0aW5nIGZpZWxkcyBhbmQgXCJ1bmRlZmluZWRcIlxuICAvLyByZXAgb2Ygc2FtZVxuICBpZiAoaGFzT3duLmNhbGwobXNnLCAnY2xlYXJlZCcpKSB7XG4gICAgaWYgKCEgaGFzT3duLmNhbGwobXNnLCAnZmllbGRzJykpIHtcbiAgICAgIG1zZy5maWVsZHMgPSB7fTtcbiAgICB9XG4gICAgbXNnLmNsZWFyZWQuZm9yRWFjaChjbGVhcktleSA9PiB7XG4gICAgICBtc2cuZmllbGRzW2NsZWFyS2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBkZWxldGUgbXNnLmNsZWFyZWQ7XG4gIH1cblxuICBbJ2ZpZWxkcycsICdwYXJhbXMnLCAncmVzdWx0J10uZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgaWYgKGhhc093bi5jYWxsKG1zZywgZmllbGQpKSB7XG4gICAgICBtc2dbZmllbGRdID0gRUpTT04uX2FkanVzdFR5cGVzRnJvbUpTT05WYWx1ZShtc2dbZmllbGRdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBtc2c7XG59O1xuXG5ERFBDb21tb24uc3RyaW5naWZ5RERQID0gZnVuY3Rpb24gKG1zZykge1xuICBpZiAobXNnLmlkICYmIHR5cGVvZiBtc2cuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWVzc2FnZSBpZCBpcyBub3QgYSBzdHJpbmdcIik7XG4gIH1cblxuICAvLyBGYXN0IHBhdGg6IG1lc3NhZ2VzIHdpdGhvdXQgZmllbGRzL3BhcmFtcy9yZXN1bHQgbmVlZCBubyBFSlNPTiBjb252ZXJzaW9uXG4gIC8vIChlLmcuICdyZW1vdmVkJywgJ3JlYWR5JywgJ25vc3ViJywgJ3BpbmcnLCAncG9uZycpXG4gIGlmIChtc2cuZmllbGRzID09PSB1bmRlZmluZWQgJiYgbXNnLnBhcmFtcyA9PT0gdW5kZWZpbmVkICYmIG1zZy5yZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtc2cpO1xuICB9XG5cbiAgLy8gQnVpbGQgd2lyZS1mb3JtYXQgb2JqZWN0IHdpdGhvdXQgY2xvbmluZyB0aGUgZW50aXJlIG1lc3NhZ2UuXG4gIC8vIFVzZXMgRUpTT04udG9KU09OVmFsdWUgKGNvcHktb24td3JpdGUpIHBlciBmaWVsZCDigJQgb25seSBhbGxvY2F0ZXMgbmV3XG4gIC8vIG9iamVjdHMgZm9yIHN1YnRyZWVzIHRoYXQgYWN0dWFsbHkgY29udGFpbiBFSlNPTiB0eXBlcyAoRGF0ZSwgQmluYXJ5LCBldGMuKS5cbiAgY29uc3Qgd2lyZSA9IHt9O1xuICBsZXQgY2xlYXJlZCA9IG51bGw7XG4gIGxldCB3aXJlRmllbGRzID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IGtleSBpbiBtc2cpIHtcbiAgICBpZiAoIWhhc093bi5jYWxsKG1zZywga2V5KSkgY29udGludWU7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgIGNhc2UgJ2ZpZWxkcyc6XG4gICAgICAgIGZvciAoY29uc3QgZmllbGRLZXkgaW4gbXNnLmZpZWxkcykge1xuICAgICAgICAgIGlmICghaGFzT3duLmNhbGwobXNnLmZpZWxkcywgZmllbGRLZXkpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1zZy5maWVsZHNbZmllbGRLZXldO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAoY2xlYXJlZCA/Pz0gW10pLnB1c2goZmllbGRLZXkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAod2lyZUZpZWxkcyA/Pz0ge30pW2ZpZWxkS2V5XSA9IEVKU09OLnRvSlNPTlZhbHVlKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwYXJhbXMnOlxuICAgICAgICB3aXJlLnBhcmFtcyA9IEVKU09OLnRvSlNPTlZhbHVlKG1zZy5wYXJhbXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jlc3VsdCc6XG4gICAgICAgIHdpcmUucmVzdWx0ID0gRUpTT04udG9KU09OVmFsdWUobXNnLnJlc3VsdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgd2lyZVtrZXldID0gbXNnW2tleV07XG4gICAgfVxuICB9XG5cbiAgaWYgKHdpcmVGaWVsZHMgIT09IG51bGwpIHdpcmUuZmllbGRzID0gd2lyZUZpZWxkcztcbiAgaWYgKGNsZWFyZWQgIT09IG51bGwpIHdpcmUuY2xlYXJlZCA9IGNsZWFyZWQ7XG5cbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHdpcmUpO1xufTtcbiIsIi8vIEluc3RhbmNlIG5hbWUgaXMgdGhpcyBiZWNhdXNlIGl0IGlzIHVzdWFsbHkgcmVmZXJyZWQgdG8gYXMgdGhpcyBpbnNpZGUgYVxuLy8gbWV0aG9kIGRlZmluaXRpb25cbi8qKlxuICogQHN1bW1hcnkgVGhlIHN0YXRlIGZvciBhIHNpbmdsZSBpbnZvY2F0aW9uIG9mIGEgbWV0aG9kLCByZWZlcmVuY2VkIGJ5IHRoaXNcbiAqIGluc2lkZSBhIG1ldGhvZCBkZWZpbml0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBpbnN0YW5jZU5hbWUgdGhpc1xuICogQHNob3dJbnN0YW5jZU5hbWUgdHJ1ZVxuICovXG5ERFBDb21tb24uTWV0aG9kSW52b2NhdGlvbiA9IGNsYXNzIE1ldGhvZEludm9jYXRpb24ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgLy8gdHJ1ZSBpZiB3ZSdyZSBydW5uaW5nIG5vdCB0aGUgYWN0dWFsIG1ldGhvZCwgYnV0IGEgc3R1YiAodGhhdCBpcyxcbiAgICAvLyBpZiB3ZSdyZSBvbiBhIGNsaWVudCAod2hpY2ggbWF5IGJlIGEgYnJvd3Nlciwgb3IgaW4gdGhlIGZ1dHVyZSBhXG4gICAgLy8gc2VydmVyIGNvbm5lY3RpbmcgdG8gYW5vdGhlciBzZXJ2ZXIpIGFuZCBwcmVzZW50bHkgcnVubmluZyBhXG4gICAgLy8gc2ltdWxhdGlvbiBvZiBhIHNlcnZlci1zaWRlIG1ldGhvZCBmb3IgbGF0ZW5jeSBjb21wZW5zYXRpb25cbiAgICAvLyBwdXJwb3NlcykuIG5vdCBjdXJyZW50bHkgdHJ1ZSBleGNlcHQgaW4gYSBjbGllbnQgc3VjaCBhcyBhIGJyb3dzZXIsXG4gICAgLy8gc2luY2UgdGhlcmUncyB1c3VhbGx5IG5vIHBvaW50IGluIHJ1bm5pbmcgc3R1YnMgdW5sZXNzIHlvdSBoYXZlIGFcbiAgICAvLyB6ZXJvLWxhdGVuY3kgY29ubmVjdGlvbiB0byB0aGUgdXNlci5cblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IFRoZSBuYW1lIGdpdmVuIHRvIHRoZSBtZXRob2QuXG4gICAgICogQGxvY3VzIEFueXdoZXJlXG4gICAgICogQG5hbWUgIG5hbWVcbiAgICAgKiBAbWVtYmVyT2YgRERQQ29tbW9uLk1ldGhvZEludm9jYXRpb25cbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IEFjY2VzcyBpbnNpZGUgYSBtZXRob2QgaW52b2NhdGlvbi4gIEJvb2xlYW4gdmFsdWUsIHRydWUgaWYgdGhpcyBpbnZvY2F0aW9uIGlzIGEgc3R1Yi5cbiAgICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICAgKiBAbmFtZSAgaXNTaW11bGF0aW9uXG4gICAgICogQG1lbWJlck9mIEREUENvbW1vbi5NZXRob2RJbnZvY2F0aW9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc1NpbXVsYXRpb24gPSBvcHRpb25zLmlzU2ltdWxhdGlvbjtcblxuICAgIC8vIGNhbGwgdGhpcyBmdW5jdGlvbiB0byBhbGxvdyBvdGhlciBtZXRob2QgaW52b2NhdGlvbnMgKGZyb20gdGhlXG4gICAgLy8gc2FtZSBjbGllbnQpIHRvIGNvbnRpbnVlIHJ1bm5pbmcgd2l0aG91dCB3YWl0aW5nIGZvciB0aGlzIG9uZSB0b1xuICAgIC8vIGNvbXBsZXRlLlxuICAgIHRoaXMuX3VuYmxvY2sgPSBvcHRpb25zLnVuYmxvY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgdGhpcy5fY2FsbGVkVW5ibG9jayA9IGZhbHNlO1xuXG4gICAgLy8gdXNlZCB0byBrbm93IHdoZW4gdGhlIGZ1bmN0aW9uIGFwcGx5IHdhcyBjYWxsZWQgYnkgY2FsbEFzeW5jXG4gICAgdGhpcy5faXNGcm9tQ2FsbEFzeW5jID0gb3B0aW9ucy5pc0Zyb21DYWxsQXN5bmM7XG5cbiAgICAvLyBjdXJyZW50IHVzZXIgaWRcblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IFRoZSBpZCBvZiB0aGUgdXNlciB0aGF0IG1hZGUgdGhpcyBtZXRob2QgY2FsbCwgb3IgYG51bGxgIGlmIG5vIHVzZXIgd2FzIGxvZ2dlZCBpbi5cbiAgICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICAgKiBAbmFtZSAgdXNlcklkXG4gICAgICogQG1lbWJlck9mIEREUENvbW1vbi5NZXRob2RJbnZvY2F0aW9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy51c2VySWQgPSBvcHRpb25zLnVzZXJJZDtcblxuICAgIC8vIHNldHMgY3VycmVudCB1c2VyIGlkIGluIGFsbCBhcHByb3ByaWF0ZSBzZXJ2ZXIgY29udGV4dHMgYW5kXG4gICAgLy8gcmVydW5zIHN1YnNjcmlwdGlvbnNcbiAgICB0aGlzLl9zZXRVc2VySWQgPSBvcHRpb25zLnNldFVzZXJJZCB8fCBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIE9uIHRoZSBzZXJ2ZXIsIHRoZSBjb25uZWN0aW9uIHRoaXMgbWV0aG9kIGNhbGwgY2FtZSBpbiBvbi5cblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IEFjY2VzcyBpbnNpZGUgYSBtZXRob2QgaW52b2NhdGlvbi4gVGhlIFtjb25uZWN0aW9uXSgjbWV0ZW9yX29uY29ubmVjdGlvbikgdGhhdCB0aGlzIG1ldGhvZCB3YXMgcmVjZWl2ZWQgb24uIGBudWxsYCBpZiB0aGUgbWV0aG9kIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBjb25uZWN0aW9uLCBlZy4gYSBzZXJ2ZXIgaW5pdGlhdGVkIG1ldGhvZCBjYWxsLiBDYWxscyB0byBtZXRob2RzIG1hZGUgZnJvbSBhIHNlcnZlciBtZXRob2Qgd2hpY2ggd2FzIGluIHR1cm4gaW5pdGlhdGVkIGZyb20gdGhlIGNsaWVudCBzaGFyZSB0aGUgc2FtZSBgY29ubmVjdGlvbmAuXG4gICAgICogQGxvY3VzIFNlcnZlclxuICAgICAqIEBuYW1lICBjb25uZWN0aW9uXG4gICAgICogQG1lbWJlck9mIEREUENvbW1vbi5NZXRob2RJbnZvY2F0aW9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jb25uZWN0aW9uID0gb3B0aW9ucy5jb25uZWN0aW9uO1xuXG4gICAgLy8gVGhlIHNlZWQgZm9yIHJhbmRvbVN0cmVhbSB2YWx1ZSBnZW5lcmF0aW9uXG4gICAgdGhpcy5yYW5kb21TZWVkID0gb3B0aW9ucy5yYW5kb21TZWVkO1xuXG4gICAgLy8gVGhpcyBpcyBzZXQgYnkgUmFuZG9tU3RyZWFtLmdldDsgYW5kIGhvbGRzIHRoZSByYW5kb20gc3RyZWFtIHN0YXRlXG4gICAgdGhpcy5yYW5kb21TdHJlYW0gPSBudWxsO1xuXG4gICAgdGhpcy5mZW5jZSA9IG9wdGlvbnMuZmVuY2U7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FsbCBpbnNpZGUgYSBtZXRob2QgaW52b2NhdGlvbi4gIEFsbG93IHN1YnNlcXVlbnQgbWV0aG9kIGZyb20gdGhpcyBjbGllbnQgdG8gYmVnaW4gcnVubmluZyBpbiBhIG5ldyBmaWJlci5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgRERQQ29tbW9uLk1ldGhvZEludm9jYXRpb25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICB1bmJsb2NrKCkge1xuICAgIHRoaXMuX2NhbGxlZFVuYmxvY2sgPSB0cnVlO1xuICAgIHRoaXMuX3VuYmxvY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBTZXQgdGhlIGxvZ2dlZCBpbiB1c2VyLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBERFBDb21tb24uTWV0aG9kSW52b2NhdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtTdHJpbmcgfCBudWxsfSB1c2VySWQgVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIGJ5IGB1c2VySWRgIG9uIHRoaXMgY29ubmVjdGlvbi5cbiAgICovXG4gIGFzeW5jIHNldFVzZXJJZCh1c2VySWQpIHtcbiAgICBpZiAodGhpcy5fY2FsbGVkVW5ibG9jaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBzZXRVc2VySWQgaW4gYSBtZXRob2QgYWZ0ZXIgY2FsbGluZyB1bmJsb2NrXCIpO1xuICAgIH1cbiAgICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgICBhd2FpdCB0aGlzLl9zZXRVc2VySWQodXNlcklkKTtcbiAgfVxufTtcbiIsIi8vIFJhbmRvbVN0cmVhbSBhbGxvd3MgZm9yIGdlbmVyYXRpb24gb2YgcHNldWRvLXJhbmRvbSB2YWx1ZXMsIGZyb20gYSBzZWVkLlxuLy9cbi8vIFdlIHVzZSB0aGlzIGZvciBjb25zaXN0ZW50ICdyYW5kb20nIG51bWJlcnMgYWNyb3NzIHRoZSBjbGllbnQgYW5kIHNlcnZlci5cbi8vIFdlIHdhbnQgdG8gZ2VuZXJhdGUgcHJvYmFibHktdW5pcXVlIElEcyBvbiB0aGUgY2xpZW50LCBhbmQgd2UgaWRlYWxseSB3YW50XG4vLyB0aGUgc2VydmVyIHRvIGdlbmVyYXRlIHRoZSBzYW1lIElEcyB3aGVuIGl0IGV4ZWN1dGVzIHRoZSBtZXRob2QuXG4vL1xuLy8gRm9yIGdlbmVyYXRlZCB2YWx1ZXMgdG8gYmUgdGhlIHNhbWUsIHdlIG11c3Qgc2VlZCBvdXJzZWx2ZXMgdGhlIHNhbWUgd2F5LFxuLy8gYW5kIHdlIG11c3Qga2VlcCB0cmFjayBvZiB0aGUgY3VycmVudCBzdGF0ZSBvZiBvdXIgcHNldWRvLXJhbmRvbSBnZW5lcmF0b3JzLlxuLy8gV2UgY2FsbCB0aGlzIHN0YXRlIHRoZSBzY29wZS4gQnkgZGVmYXVsdCwgd2UgdXNlIHRoZSBjdXJyZW50IEREUCBtZXRob2Rcbi8vIGludm9jYXRpb24gYXMgb3VyIHNjb3BlLiAgRERQIG5vdyBhbGxvd3MgdGhlIGNsaWVudCB0byBzcGVjaWZ5IGEgcmFuZG9tU2VlZC5cbi8vIElmIGEgcmFuZG9tU2VlZCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gc2VlZCBvdXIgcmFuZG9tIHNlcXVlbmNlcy5cbi8vIEluIHRoaXMgd2F5LCBjbGllbnQgYW5kIHNlcnZlciBtZXRob2QgY2FsbHMgd2lsbCBnZW5lcmF0ZSB0aGUgc2FtZSB2YWx1ZXMuXG4vL1xuLy8gV2UgZXhwb3NlIG11bHRpcGxlIG5hbWVkIHN0cmVhbXM7IGVhY2ggc3RyZWFtIGlzIGluZGVwZW5kZW50XG4vLyBhbmQgaXMgc2VlZGVkIGRpZmZlcmVudGx5IChidXQgcHJlZGljdGFibHkgZnJvbSB0aGUgbmFtZSkuXG4vLyBCeSB1c2luZyBtdWx0aXBsZSBzdHJlYW1zLCB3ZSBzdXBwb3J0IHJlb3JkZXJpbmcgb2YgcmVxdWVzdHMsXG4vLyBhcyBsb25nIGFzIHRoZXkgb2NjdXIgb24gZGlmZmVyZW50IHN0cmVhbXMuXG4vL1xuLy8gQHBhcmFtIG9wdGlvbnMge09wdGlvbmFsIE9iamVjdH1cbi8vICAgc2VlZDogQXJyYXkgb3IgdmFsdWUgLSBTZWVkIHZhbHVlKHMpIGZvciB0aGUgZ2VuZXJhdG9yLlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgIElmIGFuIGFycmF5LCB3aWxsIGJlIHVzZWQgYXMtaXNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBhIHZhbHVlLCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHNpbmdsZS12YWx1ZSBhcnJheVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgIElmIG9taXR0ZWQsIGEgcmFuZG9tIGFycmF5IHdpbGwgYmUgdXNlZCBhcyB0aGUgc2VlZC5cbkREUENvbW1vbi5SYW5kb21TdHJlYW0gPSBjbGFzcyBSYW5kb21TdHJlYW0ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5zZWVkID0gW10uY29uY2F0KG9wdGlvbnMuc2VlZCB8fCByYW5kb21Ub2tlbigpKTtcbiAgICB0aGlzLnNlcXVlbmNlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH1cblxuICAvLyBHZXQgYSByYW5kb20gc2VxdWVuY2Ugd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUsIGNyZWF0aW5nIGl0IGlmIGRvZXMgbm90IGV4aXN0LlxuICAvLyBOZXcgc2VxdWVuY2VzIGFyZSBzZWVkZWQgd2l0aCB0aGUgc2VlZCBjb25jYXRlbmF0ZWQgd2l0aCB0aGUgbmFtZS5cbiAgLy8gQnkgcGFzc2luZyBhIHNlZWQgaW50byBSYW5kb20uY3JlYXRlLCB3ZSB1c2UgdGhlIEFsZWEgZ2VuZXJhdG9yLlxuICBfc2VxdWVuY2UobmFtZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBzZXF1ZW5jZSA9IHNlbGYuc2VxdWVuY2VzW25hbWVdIHx8IG51bGw7XG4gICAgaWYgKHNlcXVlbmNlID09PSBudWxsKSB7XG4gICAgICB2YXIgc2VxdWVuY2VTZWVkID0gc2VsZi5zZWVkLmNvbmNhdChuYW1lKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VxdWVuY2VTZWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VxdWVuY2VTZWVkW2ldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBzZXF1ZW5jZVNlZWRbaV0gPSBzZXF1ZW5jZVNlZWRbaV0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5zZXF1ZW5jZXNbbmFtZV0gPSBzZXF1ZW5jZSA9IFJhbmRvbS5jcmVhdGVXaXRoU2VlZHMuYXBwbHkobnVsbCwgc2VxdWVuY2VTZWVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlcXVlbmNlO1xuICB9XG59O1xuXG4vLyBSZXR1cm5zIGEgcmFuZG9tIHN0cmluZyBvZiBzdWZmaWNpZW50IGxlbmd0aCBmb3IgYSByYW5kb20gc2VlZC5cbi8vIFRoaXMgaXMgYSBwbGFjZWhvbGRlciBmdW5jdGlvbjsgYSBzaW1pbGFyIGZ1bmN0aW9uIGlzIHBsYW5uZWRcbi8vIGZvciBSYW5kb20gaXRzZWxmOyB3aGVuIHRoYXQgaXMgYWRkZWQgd2Ugc2hvdWxkIHJlbW92ZSB0aGlzIGZ1bmN0aW9uLFxuLy8gYW5kIGNhbGwgUmFuZG9tJ3MgcmFuZG9tVG9rZW4gaW5zdGVhZC5cbmZ1bmN0aW9uIHJhbmRvbVRva2VuKCkge1xuICByZXR1cm4gUmFuZG9tLmhleFN0cmluZygyMCk7XG59O1xuXG4vLyBSZXR1cm5zIHRoZSByYW5kb20gc3RyZWFtIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLCBpbiB0aGUgc3BlY2lmaWVkXG4vLyBzY29wZS4gSWYgYSBzY29wZSBpcyBwYXNzZWQsIHRoZW4gd2UgdXNlIHRoYXQgdG8gc2VlZCBhIChub3Rcbi8vIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSkgUFJORyB1c2luZyB0aGUgZmFzdCBBbGVhIGFsZ29yaXRobS4gIElmXG4vLyBzY29wZSBpcyBudWxsIChvciBvdGhlcndpc2UgZmFsc2V5KSB0aGVuIHdlIHVzZSBhIGdlbmVyYXRlZCBzZWVkLlxuLy9cbi8vIEhvd2V2ZXIsIHNjb3BlIHdpbGwgbm9ybWFsbHkgYmUgdGhlIGN1cnJlbnQgRERQIG1ldGhvZCBpbnZvY2F0aW9uLFxuLy8gc28gd2UnbGwgdXNlIHRoZSBzdHJlYW0gd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUsIGFuZCB3ZSBzaG91bGQgZ2V0XG4vLyBjb25zaXN0ZW50IHZhbHVlcyBvbiB0aGUgY2xpZW50IGFuZCBzZXJ2ZXIgc2lkZXMgb2YgYSBtZXRob2QgY2FsbC5cbkREUENvbW1vbi5SYW5kb21TdHJlYW0uZ2V0ID0gZnVuY3Rpb24gKHNjb3BlLCBuYW1lKSB7XG4gIGlmICghbmFtZSkge1xuICAgIG5hbWUgPSBcImRlZmF1bHRcIjtcbiAgfVxuICBpZiAoIXNjb3BlKSB7XG4gICAgLy8gVGhlcmUgd2FzIG5vIHNjb3BlIHBhc3NlZCBpbjsgdGhlIHNlcXVlbmNlIHdvbid0IGFjdHVhbGx5IGJlXG4gICAgLy8gcmVwcm9kdWNpYmxlLiBidXQgbWFrZSBpdCBmYXN0IChhbmQgbm90IGNyeXB0b2dyYXBoaWNhbGx5XG4gICAgLy8gc2VjdXJlKSBhbnl3YXlzLCBzbyB0aGF0IHRoZSBiZWhhdmlvciBpcyBzaW1pbGFyIHRvIHdoYXQgeW91J2RcbiAgICAvLyBnZXQgYnkgcGFzc2luZyBpbiBhIHNjb3BlLlxuICAgIHJldHVybiBSYW5kb20uaW5zZWN1cmU7XG4gIH1cbiAgdmFyIHJhbmRvbVN0cmVhbSA9IHNjb3BlLnJhbmRvbVN0cmVhbTtcbiAgaWYgKCFyYW5kb21TdHJlYW0pIHtcbiAgICBzY29wZS5yYW5kb21TdHJlYW0gPSByYW5kb21TdHJlYW0gPSBuZXcgRERQQ29tbW9uLlJhbmRvbVN0cmVhbSh7XG4gICAgICBzZWVkOiBzY29wZS5yYW5kb21TZWVkXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJhbmRvbVN0cmVhbS5fc2VxdWVuY2UobmFtZSk7XG59O1xuXG4vLyBDcmVhdGVzIGEgcmFuZG9tU2VlZCBmb3IgcGFzc2luZyB0byBhIG1ldGhvZCBjYWxsLlxuLy8gTm90ZSB0aGF0IHdlIHRha2UgZW5jbG9zaW5nIGFzIGFuIGFyZ3VtZW50LFxuLy8gdGhvdWdoIHdlIGV4cGVjdCBpdCB0byBiZSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpXG4vLyBIb3dldmVyLCB3ZSBvZnRlbiBldmFsdWF0ZSBtYWtlUnBjU2VlZCBsYXppbHksIGFuZCB0aHVzIHRoZSByZWxldmFudFxuLy8gaW52b2NhdGlvbiBtYXkgbm90IGJlIHRoZSBvbmUgY3VycmVudGx5IGluIHNjb3BlLlxuLy8gSWYgZW5jbG9zaW5nIGlzIG51bGwsIHdlJ2xsIHVzZSBSYW5kb20gYW5kIHZhbHVlcyB3b24ndCBiZSByZXBlYXRhYmxlLlxuRERQQ29tbW9uLm1ha2VScGNTZWVkID0gZnVuY3Rpb24gKGVuY2xvc2luZywgbWV0aG9kTmFtZSkge1xuICB2YXIgc3RyZWFtID0gRERQQ29tbW9uLlJhbmRvbVN0cmVhbS5nZXQoZW5jbG9zaW5nLCAnL3JwYy8nICsgbWV0aG9kTmFtZSk7XG4gIHJldHVybiBzdHJlYW0uaGV4U3RyaW5nKDIwKTtcbn07XG4iXX0=
