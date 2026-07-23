Package["core-runtime"].queue("ddp-client",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var IdMap = Package['id-map'].IdMap;
var ECMAScript = Package.ecmascript.ECMAScript;
var Hook = Package['callback-hook'].Hook;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var DDP;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-client":{"server":{"server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/server/server.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.link('../common/namespace.js',{DDP:"DDP"},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"common":{"connection_stream_handlers.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/connection_stream_handlers.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({ConnectionStreamHandlers:()=>ConnectionStreamHandlers});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let DDPCommon;module.link('meteor/ddp-common',{DDPCommon(v){DDPCommon=v}},1);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},2);


class ConnectionStreamHandlers {
    /**
   * Handles incoming raw messages from the DDP stream
   * @param {String} raw_msg The raw message received from the stream
   */ onMessage(raw_msg) {
        return _async_to_generator(function*() {
            let msg;
            try {
                msg = DDPCommon.parseDDP(raw_msg);
            } catch (e) {
                Meteor._debug('Exception while parsing DDP', e);
                return;
            }
            // Any message counts as receiving a pong, as it demonstrates that
            // the server is still alive.
            if (this._connection._heartbeat) {
                this._connection._heartbeat.messageReceived();
            }
            if (msg === null || !msg.msg) {
                if (!msg || !msg.testMessageOnConnect) {
                    if (Object.keys(msg).length === 1 && msg.server_id) return;
                    Meteor._debug('discarding invalid livedata message', msg);
                }
                return;
            }
            // Track received message count for session resumption (excluding ping/pong)
            if (!this._connection._ignoredMsgsForSessionOutOfDateCheck.includes(msg.msg)) {
                this._connection._receivedCount++;
            }
            // Important: This was missing from previous version
            // We need to set the current version before routing the message
            if (msg.msg === 'connected') {
                this._connection._version = this._connection._versionSuggestion;
            }
            yield this._routeMessage(msg);
        }).call(this);
    }
    /**
   * Routes messages to their appropriate handlers based on message type
   * @private
   * @param {Object} msg The parsed DDP message
   */ _routeMessage(msg) {
        return _async_to_generator(function*() {
            switch(msg.msg){
                case 'connected':
                    yield this._connection._livedata_connected(msg);
                    this._connection.options.onConnected();
                    break;
                case 'failed':
                    yield this._handleFailedMessage(msg);
                    break;
                case 'ping':
                    if (this._connection.options.respondToPings) {
                        this._connection._send({
                            msg: 'pong',
                            id: msg.id
                        });
                    }
                    break;
                case 'pong':
                    break;
                case 'added':
                case 'changed':
                case 'removed':
                case 'ready':
                case 'updated':
                    yield this._connection._livedata_data(msg);
                    break;
                case 'nosub':
                    yield this._connection._livedata_nosub(msg);
                    break;
                case 'result':
                    yield this._connection._livedata_result(msg);
                    break;
                case 'error':
                    this._connection._livedata_error(msg);
                    break;
                default:
                    Meteor._debug('discarding unknown livedata message type', msg);
            }
        }).call(this);
    }
    /**
   * Handles failed connection messages
   * @private
   * @param {Object} msg The failed message object
   */ _handleFailedMessage(msg) {
        if (this._connection._supportedDDPVersions.indexOf(msg.version) >= 0) {
            this._connection._versionSuggestion = msg.version;
            this._connection._stream.reconnect({
                _force: true
            });
        } else {
            const description = 'DDP version negotiation failed; server requested version ' + msg.version;
            this._connection._stream.disconnect({
                _permanent: true,
                _error: description
            });
            this._connection.options.onDDPVersionNegotiationFailure(description);
        }
    }
    /**
   * Handles connection reset events
   */ onReset() {
        // Reset is called even on the first connection, so this is
        // the only place we send this message.
        const msg = this._buildConnectMessage();
        this._connection._send(msg);
        // Mark non-retry calls as failed and handle outstanding methods
        this._handleOutstandingMethodsOnReset();
        // Now, to minimize setup latency, go ahead and blast out all of
        // our pending methods ands subscriptions before we've even taken
        // the necessary RTT to know if we successfully reconnected.
        this._connection._callOnReconnectAndSendAppropriateOutstandingMethods();
        this._resendSubscriptions();
    }
    /**
   * Builds the initial connect message
   * @private
   * @returns {Object} The connect message object
   */ _buildConnectMessage() {
        const msg = {
            msg: 'connect'
        };
        if (this._connection._lastSessionId) {
            msg.session = this._connection._lastSessionId;
            msg.receivedCount = this._connection._receivedCount;
        }
        msg.version = this._connection._versionSuggestion || this._connection._supportedDDPVersions[0];
        this._connection._versionSuggestion = msg.version;
        msg.support = this._connection._supportedDDPVersions;
        return msg;
    }
    /**
   * Handles outstanding methods during a reset
   * @private
   */ _handleOutstandingMethodsOnReset() {
        const blocks = this._connection._outstandingMethodBlocks;
        if (blocks.length === 0) return;
        const currentMethodBlock = blocks[0].methods;
        blocks[0].methods = currentMethodBlock.filter((methodInvoker)=>{
            // Methods with 'noRetry' option set are not allowed to re-send after
            // recovering dropped connection.
            if (methodInvoker.sentMessage && methodInvoker.noRetry) {
                methodInvoker.receiveResult(new Meteor.Error('invocation-failed', 'Method invocation might have failed due to dropped connection. ' + 'Failing because `noRetry` option was passed to Meteor.apply.'));
            }
            // Only keep a method if it wasn't sent or it's allowed to retry.
            return !(methodInvoker.sentMessage && methodInvoker.noRetry);
        });
        // Clear empty blocks
        if (blocks.length > 0 && blocks[0].methods.length === 0) {
            blocks.shift();
        }
        // Reset all method invokers as unsent
        Object.values(this._connection._methodInvokers).forEach((invoker)=>{
            invoker.sentMessage = false;
        });
    }
    /**
   * Resends all active subscriptions
   * @private
   */ _resendSubscriptions() {
        Object.entries(this._connection._subscriptions).forEach(([id, sub])=>{
            this._connection._sendQueued({
                msg: 'sub',
                id: id,
                name: sub.name,
                params: sub.params
            });
        });
    }
    constructor(connection){
        this._connection = connection;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"document_processors.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/document_processors.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({DocumentProcessors:()=>DocumentProcessors});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let MongoID;module.link('meteor/mongo-id',{MongoID(v){MongoID=v}},1);let DiffSequence;module.link('meteor/diff-sequence',{DiffSequence(v){DiffSequence=v}},2);let hasOwn;module.link("meteor/ddp-common/utils",{hasOwn(v){hasOwn=v}},3);let isEmpty;module.link("meteor/ddp-common/utils",{isEmpty(v){isEmpty=v}},4);




class DocumentProcessors {
    /**
   * @summary Process an 'added' message from the server
   * @param {Object} msg The added message
   * @param {Object} updates The updates accumulator
   */ _process_added(msg, updates) {
        return _async_to_generator(function*() {
            const self = this._connection;
            const id = MongoID.idParse(msg.id);
            const serverDoc = self._getServerDoc(msg.collection, id);
            if (serverDoc) {
                // Some outstanding stub wrote here.
                const isExisting = serverDoc.document !== undefined;
                serverDoc.document = msg.fields || Object.create(null);
                serverDoc.document._id = id;
                if (self._resetStores) {
                    // During reconnect the server is sending adds for existing ids.
                    // Always push an update so that document stays in the store after
                    // reset. Use current version of the document for this update, so
                    // that stub-written values are preserved.
                    const currentDoc = yield self._stores[msg.collection].getDoc(msg.id);
                    if (currentDoc !== undefined) msg.fields = currentDoc;
                    self._pushUpdate(updates, msg.collection, msg);
                } else if (isExisting) {
                    throw new Error('Server sent add for existing id: ' + msg.id);
                }
            } else {
                self._pushUpdate(updates, msg.collection, msg);
            }
        }).call(this);
    }
    /**
   * @summary Process a 'changed' message from the server
   * @param {Object} msg The changed message
   * @param {Object} updates The updates accumulator
   */ _process_changed(msg, updates) {
        const self = this._connection;
        const serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));
        if (serverDoc) {
            if (serverDoc.document === undefined) {
                throw new Error('Server sent changed for nonexisting id: ' + msg.id);
            }
            DiffSequence.applyChanges(serverDoc.document, msg.fields);
        } else {
            self._pushUpdate(updates, msg.collection, msg);
        }
    }
    /**
   * @summary Process a 'removed' message from the server
   * @param {Object} msg The removed message
   * @param {Object} updates The updates accumulator
   */ _process_removed(msg, updates) {
        const self = this._connection;
        const serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));
        if (serverDoc) {
            // Some outstanding stub wrote here.
            if (serverDoc.document === undefined) {
                throw new Error('Server sent removed for nonexisting id:' + msg.id);
            }
            serverDoc.document = undefined;
        } else {
            self._pushUpdate(updates, msg.collection, {
                msg: 'removed',
                collection: msg.collection,
                id: msg.id
            });
        }
    }
    /**
   * @summary Process a 'ready' message from the server
   * @param {Object} msg The ready message
   * @param {Object} updates The updates accumulator
   */ _process_ready(msg, updates) {
        const self = this._connection;
        // Process "sub ready" messages. "sub ready" messages don't take effect
        // until all current server documents have been flushed to the local
        // database. We can use a write fence to implement this.
        msg.subs.forEach((subId)=>{
            self._runWhenAllServerDocsAreFlushed(()=>{
                const subRecord = self._subscriptions[subId];
                // Did we already unsubscribe?
                if (!subRecord) return;
                // Did we already receive a ready message? (Oops!)
                if (subRecord.ready) return;
                subRecord.ready = true;
                subRecord.readyCallback && subRecord.readyCallback();
                subRecord.readyDeps.changed();
            });
        });
    }
    /**
   * @summary Process an 'updated' message from the server
   * @param {Object} msg The updated message
   * @param {Object} updates The updates accumulator
   */ _process_updated(msg, updates) {
        const self = this._connection;
        // Process "method done" messages.
        msg.methods.forEach((methodId)=>{
            const docs = self._documentsWrittenByStub[methodId] || {};
            Object.values(docs).forEach((written)=>{
                const serverDoc = self._getServerDoc(written.collection, written.id);
                if (!serverDoc) {
                    throw new Error('Lost serverDoc for ' + JSON.stringify(written));
                }
                if (!serverDoc.writtenByStubs[methodId]) {
                    throw new Error('Doc ' + JSON.stringify(written) + ' not written by method ' + methodId);
                }
                delete serverDoc.writtenByStubs[methodId];
                if (isEmpty(serverDoc.writtenByStubs)) {
                    // All methods whose stubs wrote this method have completed! We can
                    // now copy the saved document to the database (reverting the stub's
                    // change if the server did not write to this object, or applying the
                    // server's writes if it did).
                    // This is a fake ddp 'replace' message.  It's just for talking
                    // between livedata connections and minimongo.  (We have to stringify
                    // the ID because it's supposed to look like a wire message.)
                    self._pushUpdate(updates, written.collection, {
                        msg: 'replace',
                        id: MongoID.idStringify(written.id),
                        replace: serverDoc.document
                    });
                    // Call all flush callbacks.
                    serverDoc.flushCallbacks.forEach((c)=>{
                        c();
                    });
                    // Delete this completed serverDocument. Don't bother to GC empty
                    // IdMaps inside self._serverDocuments, since there probably aren't
                    // many collections and they'll be written repeatedly.
                    self._serverDocuments[written.collection].remove(written.id);
                }
            });
            delete self._documentsWrittenByStub[methodId];
            // We want to call the data-written callback, but we can't do so until all
            // currently buffered messages are flushed.
            const callbackInvoker = self._methodInvokers[methodId];
            if (!callbackInvoker) {
                throw new Error('No callback invoker for method ' + methodId);
            }
            self._runWhenAllServerDocsAreFlushed((...args)=>callbackInvoker.dataVisible(...args));
        });
    }
    /**
   * @summary Push an update to the buffer
   * @private
   * @param {Object} updates The updates accumulator
   * @param {String} collection The collection name
   * @param {Object} msg The update message
   */ _pushUpdate(updates, collection, msg) {
        if (!hasOwn.call(updates, collection)) {
            updates[collection] = [];
        }
        updates[collection].push(msg);
    }
    /**
   * @summary Get a server document by collection and id
   * @private
   * @param {String} collection The collection name
   * @param {String} id The document id
   * @returns {Object|null} The server document or null
   */ _getServerDoc(collection, id) {
        const self = this._connection;
        if (!hasOwn.call(self._serverDocuments, collection)) {
            return null;
        }
        const serverDocsForCollection = self._serverDocuments[collection];
        return serverDocsForCollection.get(id) || null;
    }
    constructor(connection){
        this._connection = connection;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"livedata_connection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/livedata_connection.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({Connection:()=>Connection});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},1);let _object_spread_props;module.link("@swc/helpers/_/_object_spread_props",{_(v){_object_spread_props=v}},2);let _object_without_properties;module.link("@swc/helpers/_/_object_without_properties",{_(v){_object_without_properties=v}},3);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},4);let DDPCommon;module.link('meteor/ddp-common',{DDPCommon(v){DDPCommon=v}},5);let Tracker;module.link('meteor/tracker',{Tracker(v){Tracker=v}},6);let EJSON;module.link('meteor/ejson',{EJSON(v){EJSON=v}},7);let Random;module.link('meteor/random',{Random(v){Random=v}},8);let MongoID;module.link('meteor/mongo-id',{MongoID(v){MongoID=v}},9);let DDP;module.link('./namespace.js',{DDP(v){DDP=v}},10);let MethodInvoker;module.link('./method_invoker',{MethodInvoker(v){MethodInvoker=v}},11);let hasOwn,slice,keys,isEmpty,last;module.link("meteor/ddp-common/utils",{hasOwn(v){hasOwn=v},slice(v){slice=v},keys(v){keys=v},isEmpty(v){isEmpty=v},last(v){last=v}},12);let ConnectionStreamHandlers;module.link('./connection_stream_handlers',{ConnectionStreamHandlers(v){ConnectionStreamHandlers=v}},13);let MongoIDMap;module.link('./mongo_id_map',{MongoIDMap(v){MongoIDMap=v}},14);let MessageProcessors;module.link('./message_processors',{MessageProcessors(v){MessageProcessors=v}},15);let DocumentProcessors;module.link('./document_processors',{DocumentProcessors(v){DocumentProcessors=v}},16);
















// @param url {String|Object} URL to Meteor app,
//   or an object as a test hook (see code)
// Options:
//   reloadWithOutstanding: is it OK to reload if there are outstanding methods?
//   headers: extra headers to send on the websockets connection, for
//     server-to-server DDP only
//   _sockjsOptions: Specifies options to pass through to the sockjs client
//   onDDPNegotiationVersionFailure: callback when version negotiation fails.
//
// XXX There should be a way to destroy a DDP connection, causing all
// outstanding method calls to fail.
//
// XXX Our current way of handling failure and reconnection is great
// for an app (where we want to tolerate being disconnected as an
// expect state, and keep trying forever to reconnect) but cumbersome
// for something like a command line tool that wants to make a
// connection, call a method, and print an error if connection
// fails. We should have better usability in the latter case (while
// still transparently reconnecting if it's just a transient failure
// or the server migrating us).
class Connection {
    // 'name' is the name of the data on the wire that should go in the
    // store. 'wrappedStore' should be an object with methods beginUpdate, update,
    // endUpdate, saveOriginals, retrieveOriginals. see Collection for an example.
    createStoreMethods(name, wrappedStore) {
        const self = this;
        if (name in self._stores) return false;
        // Wrap the input object in an object which makes any store method not
        // implemented by 'store' into a no-op.
        const store = Object.create(null);
        const keysOfStore = [
            'update',
            'beginUpdate',
            'endUpdate',
            'saveOriginals',
            'retrieveOriginals',
            'getDoc',
            '_getCollection'
        ];
        keysOfStore.forEach((method)=>{
            store[method] = (...args)=>{
                if (wrappedStore[method]) {
                    return wrappedStore[method](...args);
                }
            };
        });
        self._stores[name] = store;
        return store;
    }
    registerStoreClient(name, wrappedStore) {
        const self = this;
        const store = self.createStoreMethods(name, wrappedStore);
        const queued = self._updatesForUnknownStores[name];
        if (Array.isArray(queued)) {
            store.beginUpdate(queued.length, false);
            queued.forEach((msg)=>{
                store.update(msg);
            });
            store.endUpdate();
            delete self._updatesForUnknownStores[name];
        }
        return true;
    }
    registerStoreServer(name, wrappedStore) {
        return _async_to_generator(function*() {
            const self = this;
            const store = self.createStoreMethods(name, wrappedStore);
            const queued = self._updatesForUnknownStores[name];
            if (Array.isArray(queued)) {
                yield store.beginUpdate(queued.length, false);
                for (const msg of queued){
                    yield store.update(msg);
                }
                yield store.endUpdate();
                delete self._updatesForUnknownStores[name];
            }
            return true;
        }).call(this);
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.subscribe
   * @summary Subscribe to a record set.  Returns a handle that provides
   * `stop()` and `ready()` methods.
   * @locus Client
   * @param {String} name Name of the subscription.  Matches the name of the
   * server's `publish()` call.
   * @param {EJSONable} [arg1,arg2...] Optional arguments passed to publisher
   * function on server.
   * @param {Function|Object} [callbacks] Optional. May include `onStop`
   * and `onReady` callbacks. If there is an error, it is passed as an
   * argument to `onStop`. If a function is passed instead of an object, it
   * is interpreted as an `onReady` callback.
   */ subscribe(name /* .. [arguments] .. (callback|callbacks) */ ) {
        const self = this;
        const params = slice.call(arguments, 1);
        let callbacks = Object.create(null);
        if (params.length) {
            const lastParam = params[params.length - 1];
            if (typeof lastParam === 'function') {
                callbacks.onReady = params.pop();
            } else if (lastParam && [
                lastParam.onReady,
                // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use
                // onStop with an error callback instead.
                lastParam.onError,
                lastParam.onStop
            ].some((f)=>typeof f === "function")) {
                callbacks = params.pop();
            }
        }
        // Is there an existing sub with the same name and param, run in an
        // invalidated Computation? This will happen if we are rerunning an
        // existing computation.
        //
        // For example, consider a rerun of:
        //
        //     Tracker.autorun(function () {
        //       Meteor.subscribe("foo", Session.get("foo"));
        //       Meteor.subscribe("bar", Session.get("bar"));
        //     });
        //
        // If "foo" has changed but "bar" has not, we will match the "bar"
        // subcribe to an existing inactive subscription in order to not
        // unsub and resub the subscription unnecessarily.
        //
        // We only look for one such sub; if there are N apparently-identical subs
        // being invalidated, we will require N matching subscribe calls to keep
        // them all active.
        const existing = Object.values(self._subscriptions).find((sub)=>sub.inactive && sub.name === name && EJSON.equals(sub.params, params));
        let id;
        if (existing) {
            id = existing.id;
            existing.inactive = false; // reactivate
            if (callbacks.onReady) {
                // If the sub is not already ready, replace any ready callback with the
                // one provided now. (It's not really clear what users would expect for
                // an onReady callback inside an autorun; the semantics we provide is
                // that at the time the sub first becomes ready, we call the last
                // onReady callback provided, if any.)
                // If the sub is already ready, run the ready callback right away.
                // It seems that users would expect an onReady callback inside an
                // autorun to trigger once the sub first becomes ready and also
                // when re-subs happens.
                if (existing.ready) {
                    callbacks.onReady();
                } else {
                    existing.readyCallback = callbacks.onReady;
                }
            }
            // XXX COMPAT WITH 1.0.3.1 we used to have onError but now we call
            // onStop with an optional error argument
            if (callbacks.onError) {
                // Replace existing callback if any, so that errors aren't
                // double-reported.
                existing.errorCallback = callbacks.onError;
            }
            if (callbacks.onStop) {
                existing.stopCallback = callbacks.onStop;
            }
        } else {
            // New sub! Generate an id, save it locally, and send message.
            id = Random.id();
            self._subscriptions[id] = {
                id: id,
                name: name,
                params: EJSON.clone(params),
                inactive: false,
                ready: false,
                readyDeps: new Tracker.Dependency(),
                readyCallback: callbacks.onReady,
                // XXX COMPAT WITH 1.0.3.1 #errorCallback
                errorCallback: callbacks.onError,
                stopCallback: callbacks.onStop,
                connection: self,
                remove () {
                    delete this.connection._subscriptions[this.id];
                    this.ready && this.readyDeps.changed();
                },
                stop () {
                    this.connection._sendQueued({
                        msg: 'unsub',
                        id: id
                    });
                    this.remove();
                    if (callbacks.onStop) {
                        callbacks.onStop();
                    }
                }
            };
            self._send({
                msg: 'sub',
                id: id,
                name: name,
                params: params
            });
        }
        // return a handle to the application.
        const handle = {
            stop () {
                if (!hasOwn.call(self._subscriptions, id)) {
                    return;
                }
                self._subscriptions[id].stop();
            },
            ready () {
                // return false if we've unsubscribed.
                if (!hasOwn.call(self._subscriptions, id)) {
                    return false;
                }
                const record = self._subscriptions[id];
                record.readyDeps.depend();
                return record.ready;
            },
            subscriptionId: id
        };
        if (Tracker.active) {
            // We're in a reactive computation, so we'd like to unsubscribe when the
            // computation is invalidated... but not if the rerun just re-subscribes
            // to the same subscription!  When a rerun happens, we use onInvalidate
            // as a change to mark the subscription "inactive" so that it can
            // be reused from the rerun.  If it isn't reused, it's killed from
            // an afterFlush.
            Tracker.onInvalidate((c)=>{
                if (hasOwn.call(self._subscriptions, id)) {
                    self._subscriptions[id].inactive = true;
                }
                Tracker.afterFlush(()=>{
                    if (hasOwn.call(self._subscriptions, id) && self._subscriptions[id].inactive) {
                        handle.stop();
                    }
                });
            });
        }
        return handle;
    }
    /**
   * @summary Tells if the method call came from a call or a callAsync.
   * @alias Meteor.isAsyncCall
   * @locus Anywhere
   * @memberOf Meteor
   * @importFromPackage meteor
   * @returns boolean
   */ isAsyncCall() {
        return DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
    }
    methods(methods) {
        Object.entries(methods).forEach(([name, func])=>{
            if (typeof func !== 'function') {
                throw new Error("Method '" + name + "' must be a function");
            }
            if (this._methodHandlers[name]) {
                throw new Error("A method named '" + name + "' is already defined");
            }
            this._methodHandlers[name] = func;
        });
    }
    _getIsSimulation({ isFromCallAsync, alreadyInSimulation }) {
        if (!isFromCallAsync) {
            return alreadyInSimulation;
        }
        return alreadyInSimulation && DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.call
   * @summary Invokes a method with a sync stub, passing any number of arguments.
   * @locus Anywhere
   * @param {String} name Name of method to invoke
   * @param {EJSONable} [arg1,arg2...] Optional method arguments
   * @param {Function} [asyncCallback] Optional callback, which is called asynchronously with the error or result after the method is complete. If not provided, the method runs synchronously if possible (see below).
   */ call(name /* .. [arguments] .. callback */ ) {
        // if it's a function, the last argument is the result callback,
        // not a parameter to the remote method.
        const args = slice.call(arguments, 1);
        let callback;
        if (args.length && typeof args[args.length - 1] === 'function') {
            callback = args.pop();
        }
        return this.apply(name, args, callback);
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.callAsync
   * @summary Invokes a method with an async stub, passing any number of arguments.
   * @locus Anywhere
   * @param {String} name Name of method to invoke
   * @param {EJSONable} [arg1,arg2...] Optional method arguments
   * @returns {Promise}
   */ callAsync(name /* .. [arguments] .. */ ) {
        const args = slice.call(arguments, 1);
        if (args.length && typeof args[args.length - 1] === 'function') {
            throw new Error("Meteor.callAsync() does not accept a callback. You should 'await' the result, or use .then().");
        }
        return this.applyAsync(name, args, {
            returnServerResultPromise: true
        });
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.apply
   * @summary Invoke a method passing an array of arguments.
   * @locus Anywhere
   * @param {String} name Name of method to invoke
   * @param {EJSONable[]} args Method arguments
   * @param {Object} [options]
   * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
   * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
   * @param {Boolean} options.noRetry (Client only) if true, don't send this method again on reload, simply call the callback an error with the error code 'invocation-failed'.
   * @param {Boolean} options.throwStubExceptions (Client only) If true, exceptions thrown by method stubs will be thrown instead of logged, and the method will not be invoked on the server.
   * @param {Boolean} options.returnStubValue (Client only) If true then in cases where we would have otherwise discarded the stub's return value and returned undefined, instead we go ahead and return it. Specifically, this is any time other than when (a) we are already inside a stub or (b) we are in Node and no callback was provided. Currently we require this flag to be explicitly passed to reduce the likelihood that stub return values will be confused with server return values; we may improve this in future.
   * @param {Function} [asyncCallback] Optional callback; same semantics as in [`Meteor.call`](#meteor_call).
   */ apply(name, args, options, callback) {
        const _this__stubCall = this._stubCall(name, EJSON.clone(args)), { stubInvocation, invocation } = _this__stubCall, stubOptions = _object_without_properties(_this__stubCall, [
            "stubInvocation",
            "invocation"
        ]);
        if (stubOptions.hasStub) {
            if (!this._getIsSimulation({
                alreadyInSimulation: stubOptions.alreadyInSimulation,
                isFromCallAsync: stubOptions.isFromCallAsync
            })) {
                this._saveOriginals();
            }
            try {
                stubOptions.stubReturnValue = DDP._CurrentMethodInvocation.withValue(invocation, stubInvocation);
                if (Meteor._isPromise(stubOptions.stubReturnValue)) {
                    Meteor._debug(`Method ${name}: Calling a method that has an async method stub with call/apply can lead to unexpected behaviors. Use callAsync/applyAsync instead.`);
                }
            } catch (e) {
                stubOptions.exception = e;
            }
        }
        return this._apply(name, stubOptions, args, options, callback);
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.applyAsync
   * @summary Invoke a method passing an array of arguments.
   * @locus Anywhere
   * @param {String} name Name of method to invoke
   * @param {EJSONable[]} args Method arguments
   * @param {Object} [options]
   * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
   * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
   * @param {Boolean} options.noRetry (Client only) if true, don't send this method again on reload, simply call the callback an error with the error code 'invocation-failed'.
   * @param {Boolean} options.throwStubExceptions (Client only) If true, exceptions thrown by method stubs will be thrown instead of logged, and the method will not be invoked on the server.
   * @param {Boolean} options.returnStubValue (Client only) If true then in cases where we would have otherwise discarded the stub's return value and returned undefined, instead we go ahead and return it. Specifically, this is any time other than when (a) we are already inside a stub or (b) we are in Node and no callback was provided. Currently we require this flag to be explicitly passed to reduce the likelihood that stub return values will be confused with server return values; we may improve this in future.
   * @param {Boolean} options.returnServerResultPromise (Client only) If true, the promise returned by applyAsync will resolve to the server's return value, rather than the stub's return value. This is useful when you want to ensure that the server's return value is used, even if the stub returns a promise. The same behavior as `callAsync`.
   */ applyAsync(name, args, options, callback = null) {
        const stubPromise = this._applyAsyncStubInvocation(name, args, options);
        const promise = this._applyAsync({
            name,
            args,
            options,
            callback,
            stubPromise
        });
        if (Meteor.isClient) {
            // only return the stubReturnValue
            promise.stubPromise = stubPromise.then((o)=>{
                if (o.exception) {
                    throw o.exception;
                }
                return o.stubReturnValue;
            });
            // this avoids attribute recursion
            promise.serverPromise = new Promise((resolve, reject)=>promise.then(resolve).catch(reject));
        }
        return promise;
    }
    _applyAsyncStubInvocation(name, args, options) {
        return _async_to_generator(function*() {
            const _this__stubCall = this._stubCall(name, EJSON.clone(args), options), { stubInvocation, invocation } = _this__stubCall, stubOptions = _object_without_properties(_this__stubCall, [
                "stubInvocation",
                "invocation"
            ]);
            if (stubOptions.hasStub) {
                if (!this._getIsSimulation({
                    alreadyInSimulation: stubOptions.alreadyInSimulation,
                    isFromCallAsync: stubOptions.isFromCallAsync
                })) {
                    this._saveOriginals();
                }
                try {
                    /*
         * The code below follows the same logic as the function withValues().
         *
         * But as the Meteor package is not compiled by ecmascript, it is unable to use newer syntax in the browser,
         * such as, the async/await.
         *
         * So, to keep supporting old browsers, like IE 11, we're creating the logic one level above.
         */ const currentContext = DDP._CurrentMethodInvocation._setNewContextAndGetCurrent(invocation);
                    try {
                        stubOptions.stubReturnValue = yield stubInvocation();
                    } catch (e) {
                        stubOptions.exception = e;
                    } finally{
                        DDP._CurrentMethodInvocation._set(currentContext);
                    }
                } catch (e) {
                    stubOptions.exception = e;
                }
            }
            return stubOptions;
        }).call(this);
    }
    _applyAsync(_0) {
        return _async_to_generator(function*({ name, args, options, callback, stubPromise }) {
            const stubOptions = yield stubPromise;
            return this._apply(name, stubOptions, args, options, callback);
        }).apply(this, arguments);
    }
    _apply(name, stubCallValue, args, options, callback) {
        const self = this;
        // We were passed 3 arguments. They may be either (name, args, options)
        // or (name, args, callback)
        if (!callback && typeof options === 'function') {
            callback = options;
            options = Object.create(null);
        }
        options = options || Object.create(null);
        if (callback) {
            // XXX would it be better form to do the binding in stream.on,
            // or caller, instead of here?
            // XXX improve error message (and how we report it)
            callback = Meteor.bindEnvironment(callback, "delivering result of invoking '" + name + "'");
        }
        const { hasStub, exception, stubReturnValue, alreadyInSimulation, randomSeed } = stubCallValue;
        // Keep our args safe from mutation (eg if we don't send the message for a
        // while because of a wait method).
        args = EJSON.clone(args);
        // If we're in a simulation, stop and return the result we have,
        // rather than going on to do an RPC. If there was no stub,
        // we'll end up returning undefined.
        if (this._getIsSimulation({
            alreadyInSimulation,
            isFromCallAsync: stubCallValue.isFromCallAsync
        })) {
            let result;
            if (callback) {
                callback(exception, stubReturnValue);
            } else {
                if (exception) throw exception;
                result = stubReturnValue;
            }
            return options._returnMethodInvoker ? {
                result
            } : result;
        }
        // We only create the methodId here because we don't actually need one if
        // we're already in a simulation
        const methodId = '' + self._nextMethodId++;
        if (hasStub) {
            self._retrieveAndStoreOriginals(methodId);
        }
        // Generate the DDP message for the method call. Note that on the client,
        // it is important that the stub have finished before we send the RPC, so
        // that we know we have a complete list of which local documents the stub
        // wrote.
        const message = {
            msg: 'method',
            id: methodId,
            method: name,
            params: args
        };
        // If an exception occurred in a stub, and we're ignoring it
        // because we're doing an RPC and want to use what the server
        // returns instead, log it so the developer knows
        // (unless they explicitly ask to see the error).
        //
        // Tests can set the '_expectedByTest' flag on an exception so it won't
        // go to log.
        if (exception) {
            if (options.throwStubExceptions) {
                throw exception;
            } else if (!exception._expectedByTest) {
                Meteor._debug("Exception while simulating the effect of invoking '" + name + "'", exception);
            }
        }
        // At this point we're definitely doing an RPC, and we're going to
        // return the value of the RPC to the caller.
        // If the caller didn't give a callback, decide what to do.
        let promise;
        if (!callback) {
            if (Meteor.isClient && !options.returnServerResultPromise && (!options.isFromCallAsync || options.returnStubValue)) {
                callback = (err)=>{
                    err && Meteor._debug("Error invoking Method '" + name + "'", err);
                };
            } else {
                promise = new Promise((resolve, reject)=>{
                    callback = (...allArgs)=>{
                        let args = Array.from(allArgs);
                        let err = args.shift();
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(...args);
                    };
                });
            }
        }
        // Send the randomSeed only if we used it
        if (randomSeed.value !== null) {
            message.randomSeed = randomSeed.value;
        }
        const methodInvoker = new MethodInvoker({
            methodId,
            callback: callback,
            connection: self,
            onResultReceived: options.onResultReceived,
            wait: !!options.wait,
            message: message,
            noRetry: !!options.noRetry
        });
        let result;
        if (promise) {
            result = options.returnStubValue ? promise.then(()=>stubReturnValue) : promise;
        } else {
            result = options.returnStubValue ? stubReturnValue : undefined;
        }
        if (options._returnMethodInvoker) {
            return {
                methodInvoker,
                result
            };
        }
        self._addOutstandingMethod(methodInvoker, options);
        return result;
    }
    _stubCall(name, args, options) {
        // Run the stub, if we have one. The stub is supposed to make some
        // temporary writes to the database to give the user a smooth experience
        // until the actual result of executing the method comes back from the
        // server (whereupon the temporary writes to the database will be reversed
        // during the beginUpdate/endUpdate process.)
        //
        // Normally, we ignore the return value of the stub (even if it is an
        // exception), in favor of the real return value from the server. The
        // exception is if the *caller* is a stub. In that case, we're not going
        // to do a RPC, so we use the return value of the stub as our return
        // value.
        const self = this;
        const enclosing = DDP._CurrentMethodInvocation.get();
        const stub = self._methodHandlers[name];
        const alreadyInSimulation = enclosing === null || enclosing === void 0 ? void 0 : enclosing.isSimulation;
        const isFromCallAsync = enclosing === null || enclosing === void 0 ? void 0 : enclosing._isFromCallAsync;
        const randomSeed = {
            value: null
        };
        const defaultReturn = {
            alreadyInSimulation,
            randomSeed,
            isFromCallAsync
        };
        if (!stub) {
            return _object_spread_props(_object_spread({}, defaultReturn), {
                hasStub: false
            });
        }
        // Lazily generate a randomSeed, only if it is requested by the stub.
        // The random streams only have utility if they're used on both the client
        // and the server; if the client doesn't generate any 'random' values
        // then we don't expect the server to generate any either.
        // Less commonly, the server may perform different actions from the client,
        // and may in fact generate values where the client did not, but we don't
        // have any client-side values to match, so even here we may as well just
        // use a random seed on the server.  In that case, we don't pass the
        // randomSeed to save bandwidth, and we don't even generate it to save a
        // bit of CPU and to avoid consuming entropy.
        const randomSeedGenerator = ()=>{
            if (randomSeed.value === null) {
                randomSeed.value = DDPCommon.makeRpcSeed(enclosing, name);
            }
            return randomSeed.value;
        };
        const setUserId = (userId)=>{
            self.setUserId(userId);
        };
        const invocation = new DDPCommon.MethodInvocation({
            name,
            isSimulation: true,
            userId: self.userId(),
            isFromCallAsync: options === null || options === void 0 ? void 0 : options.isFromCallAsync,
            setUserId: setUserId,
            randomSeed () {
                return randomSeedGenerator();
            }
        });
        // Note that unlike in the corresponding server code, we never audit
        // that stubs check() their arguments.
        const stubInvocation = ()=>{
            if (Meteor.isServer) {
                // Because saveOriginals and retrieveOriginals aren't reentrant,
                // don't allow stubs to yield.
                return Meteor._noYieldsAllowed(()=>{
                    // re-clone, so that the stub can't affect our caller's values
                    return stub.apply(invocation, EJSON.clone(args));
                });
            } else {
                return stub.apply(invocation, EJSON.clone(args));
            }
        };
        return _object_spread_props(_object_spread({}, defaultReturn), {
            hasStub: true,
            stubInvocation,
            invocation
        });
    }
    // Before calling a method stub, prepare all stores to track changes and allow
    // _retrieveAndStoreOriginals to get the original versions of changed
    // documents.
    _saveOriginals() {
        if (!this._waitingForQuiescence()) {
            this._flushBufferedWrites();
        }
        Object.values(this._stores).forEach((store)=>{
            store.saveOriginals();
        });
    }
    // Retrieves the original versions of all documents modified by the stub for
    // method 'methodId' from all stores and saves them to _serverDocuments (keyed
    // by document) and _documentsWrittenByStub (keyed by method ID).
    _retrieveAndStoreOriginals(methodId) {
        const self = this;
        if (self._documentsWrittenByStub[methodId]) throw new Error('Duplicate methodId in _retrieveAndStoreOriginals');
        const docsWritten = [];
        Object.entries(self._stores).forEach(([collection, store])=>{
            const originals = store.retrieveOriginals();
            // not all stores define retrieveOriginals
            if (!originals) return;
            originals.forEach((doc, id)=>{
                docsWritten.push({
                    collection,
                    id
                });
                if (!hasOwn.call(self._serverDocuments, collection)) {
                    self._serverDocuments[collection] = new MongoIDMap();
                }
                const serverDoc = self._serverDocuments[collection].setDefault(id, Object.create(null));
                if (serverDoc.writtenByStubs) {
                    // We're not the first stub to write this doc. Just add our method ID
                    // to the record.
                    serverDoc.writtenByStubs[methodId] = true;
                } else {
                    // First stub! Save the original value and our method ID.
                    serverDoc.document = doc;
                    serverDoc.flushCallbacks = [];
                    serverDoc.writtenByStubs = Object.create(null);
                    serverDoc.writtenByStubs[methodId] = true;
                }
            });
        });
        if (!isEmpty(docsWritten)) {
            self._documentsWrittenByStub[methodId] = docsWritten;
        }
    }
    // This is very much a private function we use to make the tests
    // take up fewer server resources after they complete.
    _unsubscribeAll() {
        Object.values(this._subscriptions).forEach((sub)=>{
            // Avoid killing the autoupdate subscription so that developers
            // still get hot code pushes when writing tests.
            //
            // XXX it's a hack to encode knowledge about autoupdate here,
            // but it doesn't seem worth it yet to have a special API for
            // subscriptions to preserve after unit tests.
            if (sub.name !== 'meteor_autoupdate_clientVersions') {
                sub.stop();
            }
        });
    }
    // Sends the DDP stringification of the given message object
    _send(obj) {
        this._stream.send(DDPCommon.stringifyDDP(obj));
    }
    // Always queues the call before sending the message
    // Used, for example, on subscription.[id].stop() to make sure a "sub" message is always called before an "unsub" message
    // https://github.com/meteor/meteor/issues/13212
    //
    // This is part of the actual fix for the rest check:
    // https://github.com/meteor/meteor/pull/13236
    _sendQueued(obj) {
        this._send(obj, true);
    }
    // We detected via DDP-level heartbeats that we've lost the
    // connection.  Unlike `disconnect` or `close`, a lost connection
    // will be automatically retried.
    _lostConnection(error) {
        this._stream._lostConnection(error);
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.status
   * @summary Get the current connection status. A reactive data source.
   * @locus Client
   */ status(...args) {
        return this._stream.status(...args);
    }
    /**
   * @summary Force an immediate reconnection attempt if the client is not connected to the server.

  This method does nothing if the client is already connected.
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.reconnect
   * @locus Client
   */ reconnect(...args) {
        return this._stream.reconnect(...args);
    }
    /**
   * @memberOf Meteor
   * @importFromPackage meteor
   * @alias Meteor.disconnect
   * @summary Disconnect the client from the server.
   * @locus Client
   */ disconnect(...args) {
        this._send({
            msg: 'disconnect'
        });
        return this._stream.disconnect(...args);
    }
    close() {
        // _permanent is used by the underlying stream to prevent reconnection attempts
        return this.disconnect({
            _permanent: true
        });
    }
    ///
    /// Reactive user system
    ///
    userId() {
        if (this._userIdDeps) this._userIdDeps.depend();
        return this._userId;
    }
    setUserId(userId) {
        // Avoid invalidating dependents if setUserId is called with current value.
        if (this._userId === userId) return;
        this._userId = userId;
        if (this._userIdDeps) this._userIdDeps.changed();
    }
    // Returns true if we are in a state after reconnect of waiting for subs to be
    // revived or early methods to finish their data, or we are waiting for a
    // "wait" method to finish.
    _waitingForQuiescence() {
        return !isEmpty(this._subsBeingRevived) || !isEmpty(this._methodsBlockingQuiescence);
    }
    // Returns true if any method whose message has been sent to the server has
    // not yet invoked its user callback.
    _anyMethodsAreOutstanding() {
        const invokers = this._methodInvokers;
        return Object.values(invokers).some((invoker)=>!!invoker.sentMessage);
    }
    _prepareBuffersToFlush() {
        const self = this;
        if (self._bufferedWritesFlushHandle) {
            clearTimeout(self._bufferedWritesFlushHandle);
            self._bufferedWritesFlushHandle = null;
        }
        self._bufferedWritesFlushAt = null;
        // We need to clear the buffer before passing it to
        //  performWrites. As there's no guarantee that it
        //  will exit cleanly.
        const writes = self._bufferedWrites;
        self._bufferedWrites = Object.create(null);
        return writes;
    }
    /**
   * Server-side store updates handled asynchronously
   * @private
   */ _performWritesServer(updates) {
        return _async_to_generator(function*() {
            const self = this;
            if (self._resetStores || !isEmpty(updates)) {
                // Start all store updates - keeping original loop structure
                for (const store of Object.values(self._stores)){
                    var _updates_store__name;
                    yield store.beginUpdate(((_updates_store__name = updates[store._name]) === null || _updates_store__name === void 0 ? void 0 : _updates_store__name.length) || 0, self._resetStores);
                }
                self._resetStores = false;
                // Process each store's updates sequentially as before
                for (const [storeName, messages] of Object.entries(updates)){
                    const store = self._stores[storeName];
                    if (store) {
                        // Batch each store's messages in modest chunks to prevent event loop blocking
                        // while maintaining operation order
                        const CHUNK_SIZE = 100;
                        for(let i = 0; i < messages.length; i += CHUNK_SIZE){
                            const chunk = messages.slice(i, Math.min(i + CHUNK_SIZE, messages.length));
                            for (const msg of chunk){
                                yield store.update(msg);
                            }
                            yield new Promise((resolve)=>process.nextTick(resolve));
                        }
                    } else {
                        // Queue updates for uninitialized stores
                        self._updatesForUnknownStores[storeName] = self._updatesForUnknownStores[storeName] || [];
                        self._updatesForUnknownStores[storeName].push(...messages);
                    }
                }
                // Complete all updates
                for (const store of Object.values(self._stores)){
                    yield store.endUpdate();
                }
            }
            self._runAfterUpdateCallbacks();
        }).call(this);
    }
    /**
   * Client-side store updates handled synchronously for optimistic UI
   * @private
   */ _performWritesClient(updates) {
        const self = this;
        if (self._resetStores || !isEmpty(updates)) {
            // Synchronous store updates for client
            Object.values(self._stores).forEach((store)=>{
                var _updates_store__name;
                store.beginUpdate(((_updates_store__name = updates[store._name]) === null || _updates_store__name === void 0 ? void 0 : _updates_store__name.length) || 0, self._resetStores);
            });
            self._resetStores = false;
            Object.entries(updates).forEach(([storeName, messages])=>{
                const store = self._stores[storeName];
                if (store) {
                    messages.forEach((msg)=>store.update(msg));
                } else {
                    self._updatesForUnknownStores[storeName] = self._updatesForUnknownStores[storeName] || [];
                    self._updatesForUnknownStores[storeName].push(...messages);
                }
            });
            Object.values(self._stores).forEach((store)=>store.endUpdate());
        }
        self._runAfterUpdateCallbacks();
    }
    /**
   * Executes buffered writes either synchronously (client) or async (server)
   * @private
   */ _flushBufferedWrites() {
        return _async_to_generator(function*() {
            const self = this;
            const writes = self._prepareBuffersToFlush();
            return Meteor.isClient ? self._performWritesClient(writes) : self._performWritesServer(writes);
        }).call(this);
    }
    // Call any callbacks deferred with _runWhenAllServerDocsAreFlushed whose
    // relevant docs have been flushed, as well as dataVisible callbacks at
    // reconnect-quiescence time.
    _runAfterUpdateCallbacks() {
        const self = this;
        const callbacks = self._afterUpdateCallbacks;
        self._afterUpdateCallbacks = [];
        callbacks.forEach((c)=>{
            c();
        });
    }
    // Ensures that "f" will be called after all documents currently in
    // _serverDocuments have been written to the local cache. f will not be called
    // if the connection is lost before then!
    _runWhenAllServerDocsAreFlushed(f) {
        const self = this;
        const runFAfterUpdates = ()=>{
            self._afterUpdateCallbacks.push(f);
        };
        let unflushedServerDocCount = 0;
        const onServerDocFlush = ()=>{
            --unflushedServerDocCount;
            if (unflushedServerDocCount === 0) {
                // This was the last doc to flush! Arrange to run f after the updates
                // have been applied.
                runFAfterUpdates();
            }
        };
        Object.values(self._serverDocuments).forEach((serverDocuments)=>{
            serverDocuments.forEach((serverDoc)=>{
                const writtenByStubForAMethodWithSentMessage = keys(serverDoc.writtenByStubs).some((methodId)=>{
                    const invoker = self._methodInvokers[methodId];
                    return invoker && invoker.sentMessage;
                });
                if (writtenByStubForAMethodWithSentMessage) {
                    ++unflushedServerDocCount;
                    serverDoc.flushCallbacks.push(onServerDocFlush);
                }
            });
        });
        if (unflushedServerDocCount === 0) {
            // There aren't any buffered docs --- we can call f as soon as the current
            // round of updates is applied!
            runFAfterUpdates();
        }
    }
    _addOutstandingMethod(methodInvoker, options) {
        if (options === null || options === void 0 ? void 0 : options.wait) {
            // It's a wait method! Wait methods go in their own block.
            this._outstandingMethodBlocks.push({
                wait: true,
                methods: [
                    methodInvoker
                ]
            });
        } else {
            // Not a wait method. Start a new block if the previous block was a wait
            // block, and add it to the last block of methods.
            if (isEmpty(this._outstandingMethodBlocks) || last(this._outstandingMethodBlocks).wait) {
                this._outstandingMethodBlocks.push({
                    wait: false,
                    methods: []
                });
            }
            last(this._outstandingMethodBlocks).methods.push(methodInvoker);
        }
        // If we added it to the first block, send it out now.
        if (this._outstandingMethodBlocks.length === 1) {
            methodInvoker.sendMessage();
        }
    }
    // Called by MethodInvoker after a method's callback is invoked.  If this was
    // the last outstanding method in the current block, runs the next block. If
    // there are no more methods, consider accepting a hot code push.
    _outstandingMethodFinished() {
        const self = this;
        if (self._anyMethodsAreOutstanding()) return;
        // No methods are outstanding. This should mean that the first block of
        // methods is empty. (Or it might not exist, if this was a method that
        // half-finished before disconnect/reconnect.)
        if (!isEmpty(self._outstandingMethodBlocks)) {
            const firstBlock = self._outstandingMethodBlocks.shift();
            if (!isEmpty(firstBlock.methods)) throw new Error('No methods outstanding but nonempty block: ' + JSON.stringify(firstBlock));
            // Send the outstanding methods now in the first block.
            if (!isEmpty(self._outstandingMethodBlocks)) self._sendOutstandingMethods();
        }
        // Maybe accept a hot code push.
        self._maybeMigrate();
    }
    // Sends messages for all the methods in the first block in
    // _outstandingMethodBlocks.
    _sendOutstandingMethods() {
        const self = this;
        if (isEmpty(self._outstandingMethodBlocks)) {
            return;
        }
        self._outstandingMethodBlocks[0].methods.forEach((m)=>{
            m.sendMessage();
        });
    }
    _sendOutstandingMethodBlocksMessages(oldOutstandingMethodBlocks) {
        const self = this;
        if (isEmpty(oldOutstandingMethodBlocks)) return;
        // We have at least one block worth of old outstanding methods to try
        // again. First: did onReconnect actually send anything? If not, we just
        // restore all outstanding methods and run the first block.
        if (isEmpty(self._outstandingMethodBlocks)) {
            self._outstandingMethodBlocks = oldOutstandingMethodBlocks;
            self._sendOutstandingMethods();
            return;
        }
        // OK, there are blocks on both sides. Special case: merge the last block of
        // the reconnect methods with the first block of the original methods, if
        // neither of them are "wait" blocks.
        if (!last(self._outstandingMethodBlocks).wait && !oldOutstandingMethodBlocks[0].wait) {
            oldOutstandingMethodBlocks[0].methods.forEach((m)=>{
                last(self._outstandingMethodBlocks).methods.push(m);
                // If this "last block" is also the first block, send the message.
                if (self._outstandingMethodBlocks.length === 1) {
                    m.sendMessage();
                }
            });
            oldOutstandingMethodBlocks.shift();
        }
        // Now add the rest of the original blocks on.
        self._outstandingMethodBlocks.push(...oldOutstandingMethodBlocks);
    }
    _callOnReconnectAndSendAppropriateOutstandingMethods() {
        const self = this;
        const oldOutstandingMethodBlocks = self._outstandingMethodBlocks;
        self._outstandingMethodBlocks = [];
        const promises = [];
        const pushReconnectResult = (invoke)=>{
            try {
                const result = invoke();
                if (result && typeof result.then === 'function') {
                    promises.push(result);
                }
            } catch (error) {
                promises.push(Promise.reject(error));
            }
        };
        if (self.onReconnect) {
            pushReconnectResult(()=>self.onReconnect());
        }
        DDP._reconnectHook.forEach((callback)=>{
            pushReconnectResult(()=>callback(self));
            return true;
        });
        const sendMessages = ()=>self._sendOutstandingMethodBlocksMessages(oldOutstandingMethodBlocks);
        if (promises.length > 0) {
            // Always re-send outstanding methods, even if a callback rejects.
            Promise.allSettled(promises).then(sendMessages);
        } else {
            sendMessages();
        }
    }
    // We can accept a hot code push if there are no methods in flight.
    _readyToMigrate() {
        return isEmpty(this._methodInvokers);
    }
    // If we were blocking a migration, see if it's now possible to continue.
    // Call whenever the set of outstanding/blocked methods shrinks.
    _maybeMigrate() {
        const self = this;
        if (self._retryMigrate && self._readyToMigrate()) {
            self._retryMigrate();
            self._retryMigrate = null;
        }
    }
    constructor(url, options){
        const self = this;
        this.options = options = _object_spread({
            onConnected () {},
            onDDPVersionNegotiationFailure (description) {
                Meteor._debug(description);
            },
            heartbeatInterval: 17500,
            heartbeatTimeout: 15000,
            npmFayeOptions: Object.create(null),
            // These options are only for testing.
            reloadWithOutstanding: false,
            supportedDDPVersions: DDPCommon.SUPPORTED_DDP_VERSIONS,
            retry: true,
            respondToPings: true,
            // When updates are coming within this ms interval, batch them together.
            bufferedWritesInterval: 5,
            // Flush buffers immediately if writes are happening continuously for more than this many ms.
            bufferedWritesMaxAge: 500
        }, options);
        // If set, called when we reconnect, queuing method calls _before_ the
        // existing outstanding ones.
        // NOTE: This feature has been preserved for backwards compatibility. The
        // preferred method of setting a callback on reconnect is to use
        // DDP.onReconnect.
        self.onReconnect = null;
        // as a test hook, allow passing a stream instead of a url.
        if (typeof url === 'object') {
            self._stream = url;
        } else {
            const { ClientStream } = require("meteor/socket-stream-client");
            self._stream = new ClientStream(url, {
                retry: options.retry,
                ConnectionError: DDP.ConnectionError,
                headers: options.headers,
                _sockjsOptions: options._sockjsOptions,
                // Used to keep some tests quiet, or for other cases in which
                // the right thing to do with connection errors is to silently
                // fail (e.g. sending package usage stats). At some point we
                // should have a real API for handling client-stream-level
                // errors.
                _dontPrintErrors: options._dontPrintErrors,
                connectTimeoutMs: options.connectTimeoutMs,
                npmFayeOptions: options.npmFayeOptions
            });
        }
        self._lastSessionId = null;
        // how many messages we've received (excluding ping/pong).
        // when we try to reconnect to the server, it will check this against the number of messages it sent.
        // if there is a mismatch, our info is out of date and we need a clean session.
        self._receivedCount = 0;
        self._versionSuggestion = null; // The last proposed DDP version.
        self._version = null; // The DDP version agreed on by client and server.
        self._stores = Object.create(null); // name -> object with methods
        self._methodHandlers = Object.create(null); // name -> func
        self._nextMethodId = 1;
        self._supportedDDPVersions = options.supportedDDPVersions;
        self._heartbeatInterval = options.heartbeatInterval;
        self._heartbeatTimeout = options.heartbeatTimeout;
        self._ignoredMsgsForSessionOutOfDateCheck = [
            'ping',
            'pong'
        ];
        // Tracks methods which the user has tried to call but which have not yet
        // called their user callback (ie, they are waiting on their result or for all
        // of their writes to be written to the local cache). Map from method ID to
        // MethodInvoker object.
        self._methodInvokers = Object.create(null);
        // Tracks methods which the user has called but whose result messages have not
        // arrived yet.
        //
        // _outstandingMethodBlocks is an array of blocks of methods. Each block
        // represents a set of methods that can run at the same time. The first block
        // represents the methods which are currently in flight; subsequent blocks
        // must wait for previous blocks to be fully finished before they can be sent
        // to the server.
        //
        // Each block is an object with the following fields:
        // - methods: a list of MethodInvoker objects
        // - wait: a boolean; if true, this block had a single method invoked with
        //         the "wait" option
        //
        // There will never be adjacent blocks with wait=false, because the only thing
        // that makes methods need to be serialized is a wait method.
        //
        // Methods are removed from the first block when their "result" is
        // received. The entire first block is only removed when all of the in-flight
        // methods have received their results (so the "methods" list is empty) *AND*
        // all of the data written by those methods are visible in the local cache. So
        // it is possible for the first block's methods list to be empty, if we are
        // still waiting for some objects to quiesce.
        //
        // Example:
        //  _outstandingMethodBlocks = [
        //    {wait: false, methods: []},
        //    {wait: true, methods: [<MethodInvoker for 'login'>]},
        //    {wait: false, methods: [<MethodInvoker for 'foo'>,
        //                            <MethodInvoker for 'bar'>]}]
        // This means that there were some methods which were sent to the server and
        // which have returned their results, but some of the data written by
        // the methods may not be visible in the local cache. Once all that data is
        // visible, we will send a 'login' method. Once the login method has returned
        // and all the data is visible (including re-running subs if userId changes),
        // we will send the 'foo' and 'bar' methods in parallel.
        self._outstandingMethodBlocks = [];
        // method ID -> array of objects with keys 'collection' and 'id', listing
        // documents written by a given method's stub. keys are associated with
        // methods whose stub wrote at least one document, and whose data-done message
        // has not yet been received.
        self._documentsWrittenByStub = {};
        // collection -> IdMap of "server document" object. A "server document" has:
        // - "document": the version of the document according the
        //   server (ie, the snapshot before a stub wrote it, amended by any changes
        //   received from the server)
        //   It is undefined if we think the document does not exist
        // - "writtenByStubs": a set of method IDs whose stubs wrote to the document
        //   whose "data done" messages have not yet been processed
        self._serverDocuments = {};
        // Array of callbacks to be called after the next update of the local
        // cache. Used for:
        //  - Calling methodInvoker.dataVisible and sub ready callbacks after
        //    the relevant data is flushed.
        //  - Invoking the callbacks of "half-finished" methods after reconnect
        //    quiescence. Specifically, methods whose result was received over the old
        //    connection (so we don't re-send it) but whose data had not been made
        //    visible.
        self._afterUpdateCallbacks = [];
        // In two contexts, we buffer all incoming data messages and then process them
        // all at once in a single update:
        //   - During reconnect, we buffer all data messages until all subs that had
        //     been ready before reconnect are ready again, and all methods that are
        //     active have returned their "data done message"; then
        //   - During the execution of a "wait" method, we buffer all data messages
        //     until the wait method gets its "data done" message. (If the wait method
        //     occurs during reconnect, it doesn't get any special handling.)
        // all data messages are processed in one update.
        //
        // The following fields are used for this "quiescence" process.
        // This buffers the messages that aren't being processed yet.
        self._messagesBufferedUntilQuiescence = [];
        // Map from method ID -> true. Methods are removed from this when their
        // "data done" message is received, and we will not quiesce until it is
        // empty.
        self._methodsBlockingQuiescence = {};
        // map from sub ID -> true for subs that were ready (ie, called the sub
        // ready callback) before reconnect but haven't become ready again yet
        self._subsBeingRevived = {}; // map from sub._id -> true
        // if true, the next data update should reset all stores. (set during
        // reconnect.)
        self._resetStores = false;
        // name -> array of updates for (yet to be created) collections
        self._updatesForUnknownStores = {};
        // if we're blocking a migration, the retry func
        self._retryMigrate = null;
        // Collection name -> array of messages.
        self._bufferedWrites = {};
        // When current buffer of updates must be flushed at, in ms timestamp.
        self._bufferedWritesFlushAt = null;
        // Timeout handle for the next processing of all pending writes
        self._bufferedWritesFlushHandle = null;
        self._bufferedWritesInterval = options.bufferedWritesInterval;
        self._bufferedWritesMaxAge = options.bufferedWritesMaxAge;
        // metadata for subscriptions.  Map from sub ID to object with keys:
        //   - id
        //   - name
        //   - params
        //   - inactive (if true, will be cleaned up if not reused in re-run)
        //   - ready (has the 'ready' message been received?)
        //   - readyCallback (an optional callback to call when ready)
        //   - errorCallback (an optional callback to call if the sub terminates with
        //                    an error, XXX COMPAT WITH 1.0.3.1)
        //   - stopCallback (an optional callback to call when the sub terminates
        //     for any reason, with an error argument if an error triggered the stop)
        self._subscriptions = {};
        // Reactive userId.
        self._userId = null;
        self._userIdDeps = new Tracker.Dependency();
        // Block auto-reload while we're waiting for method responses.
        if (Meteor.isClient && Package.reload && !options.reloadWithOutstanding) {
            Package.reload.Reload._onMigrate((retry)=>{
                if (!self._readyToMigrate()) {
                    self._retryMigrate = retry;
                    return [
                        false
                    ];
                } else {
                    return [
                        true
                    ];
                }
            });
        }
        this._streamHandlers = new ConnectionStreamHandlers(this);
        const onDisconnect = ()=>{
            if (this._heartbeat) {
                this._heartbeat.stop();
                this._heartbeat = null;
            }
        };
        if (Meteor.isServer) {
            this._stream.on('message', Meteor.bindEnvironment((msg)=>this._streamHandlers.onMessage(msg), 'handling DDP message'));
            this._stream.on('reset', Meteor.bindEnvironment(()=>this._streamHandlers.onReset(), 'handling DDP reset'));
            this._stream.on('disconnect', Meteor.bindEnvironment(onDisconnect, 'handling DDP disconnect'));
        } else {
            this._stream.on('message', (msg)=>this._streamHandlers.onMessage(msg));
            this._stream.on('reset', ()=>this._streamHandlers.onReset());
            this._stream.on('disconnect', onDisconnect);
        }
        this._messageProcessors = new MessageProcessors(this);
        // Expose message processor methods to maintain backward compatibility
        this._livedata_connected = (msg)=>this._messageProcessors._livedata_connected(msg);
        this._livedata_data = (msg)=>this._messageProcessors._livedata_data(msg);
        this._livedata_nosub = (msg)=>this._messageProcessors._livedata_nosub(msg);
        this._livedata_result = (msg)=>this._messageProcessors._livedata_result(msg);
        this._livedata_error = (msg)=>this._messageProcessors._livedata_error(msg);
        this._documentProcessors = new DocumentProcessors(this);
        // Expose document processor methods to maintain backward compatibility
        this._process_added = (msg, updates)=>this._documentProcessors._process_added(msg, updates);
        this._process_changed = (msg, updates)=>this._documentProcessors._process_changed(msg, updates);
        this._process_removed = (msg, updates)=>this._documentProcessors._process_removed(msg, updates);
        this._process_ready = (msg, updates)=>this._documentProcessors._process_ready(msg, updates);
        this._process_updated = (msg, updates)=>this._documentProcessors._process_updated(msg, updates);
        // Also expose utility methods used by other parts of the system
        this._pushUpdate = (updates, collection, msg)=>this._documentProcessors._pushUpdate(updates, collection, msg);
        this._getServerDoc = (collection, id)=>this._documentProcessors._getServerDoc(collection, id);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"message_processors.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/message_processors.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({MessageProcessors:()=>MessageProcessors});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let DDPCommon;module.link('meteor/ddp-common',{DDPCommon(v){DDPCommon=v}},1);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},2);let DDP;module.link('./namespace.js',{DDP(v){DDP=v}},3);let EJSON;module.link('meteor/ejson',{EJSON(v){EJSON=v}},4);let isEmpty,hasOwn;module.link("meteor/ddp-common/utils",{isEmpty(v){isEmpty=v},hasOwn(v){hasOwn=v}},5);





class MessageProcessors {
    /**
   * @summary Process the connection message and set up the session
   * @param {Object} msg The connection message
   */ _livedata_connected(msg) {
        return _async_to_generator(function*() {
            const self = this._connection;
            if (self._version !== 'pre1' && self._heartbeatInterval !== 0) {
                self._heartbeat = new DDPCommon.Heartbeat({
                    heartbeatInterval: self._heartbeatInterval,
                    heartbeatTimeout: self._heartbeatTimeout,
                    onTimeout () {
                        self._lostConnection(new DDP.ConnectionError('DDP heartbeat timed out'));
                    },
                    sendPing () {
                        self._send({
                            msg: 'ping'
                        });
                    }
                });
                self._heartbeat.start();
            }
            // If this is a reconnect, we'll have to reset all stores.
            if (self._lastSessionId) self._resetStores = true;
            let reconnectedToPreviousSession;
            if (typeof msg.session === 'string') {
                reconnectedToPreviousSession = self._lastSessionId === msg.session;
                self._lastSessionId = msg.session;
            }
            if (reconnectedToPreviousSession) {
                // Successful reconnection -- pick up where we left off.
                // Don't reset stores since we're continuing the same session.
                self._resetStores = false;
                return;
            }
            // Server doesn't have our data anymore. Re-sync a new session.
            // Reset the received count since we're starting a new session.
            // Set to 1 because the 'connected' message itself counts.
            self._receivedCount = 1;
            // Forget about messages we were buffering for unknown collections. They'll
            // be resent if still relevant.
            self._updatesForUnknownStores = Object.create(null);
            if (self._resetStores) {
                // Forget about the effects of stubs. We'll be resetting all collections
                // anyway.
                self._documentsWrittenByStub = Object.create(null);
                self._serverDocuments = Object.create(null);
            }
            // Clear _afterUpdateCallbacks.
            self._afterUpdateCallbacks = [];
            // Mark all named subscriptions which are ready as needing to be revived.
            self._subsBeingRevived = Object.create(null);
            Object.entries(self._subscriptions).forEach(([id, sub])=>{
                if (sub.ready) {
                    self._subsBeingRevived[id] = true;
                }
            });
            // Arrange for "half-finished" methods to have their callbacks run, and
            // track methods that were sent on this connection so that we don't
            // quiesce until they are all done.
            //
            // Start by clearing _methodsBlockingQuiescence: methods sent before
            // reconnect don't matter, and any "wait" methods sent on the new connection
            // that we drop here will be restored by the loop below.
            self._methodsBlockingQuiescence = Object.create(null);
            if (self._resetStores) {
                const invokers = self._methodInvokers;
                Object.keys(invokers).forEach((id)=>{
                    const invoker = invokers[id];
                    if (invoker.gotResult()) {
                        // This method already got its result, but it didn't call its callback
                        // because its data didn't become visible. We did not resend the
                        // method RPC. We'll call its callback when we get a full quiesce,
                        // since that's as close as we'll get to "data must be visible".
                        self._afterUpdateCallbacks.push((...args)=>invoker.dataVisible(...args));
                    } else if (invoker.sentMessage) {
                        // This method has been sent on this connection (maybe as a resend
                        // from the last connection, maybe from onReconnect, maybe just very
                        // quickly before processing the connected message).
                        //
                        // We don't need to do anything special to ensure its callbacks get
                        // called, but we'll count it as a method which is preventing
                        // reconnect quiescence. (eg, it might be a login method that was run
                        // from onReconnect, and we don't want to see flicker by seeing a
                        // logged-out state.)
                        self._methodsBlockingQuiescence[invoker.methodId] = true;
                    }
                });
            }
            self._messagesBufferedUntilQuiescence = [];
            // If we're not waiting on any methods or subs, we can reset the stores and
            // call the callbacks immediately.
            if (!self._waitingForQuiescence()) {
                if (self._resetStores) {
                    for (const store of Object.values(self._stores)){
                        yield store.beginUpdate(0, true);
                        yield store.endUpdate();
                    }
                    self._resetStores = false;
                }
                self._runAfterUpdateCallbacks();
            }
        }).call(this);
    }
    /**
   * @summary Process various data messages from the server
   * @param {Object} msg The data message
   */ _livedata_data(msg) {
        return _async_to_generator(function*() {
            const self = this._connection;
            if (self._waitingForQuiescence()) {
                self._messagesBufferedUntilQuiescence.push(msg);
                if (msg.msg === 'nosub') {
                    delete self._subsBeingRevived[msg.id];
                }
                if (msg.subs) {
                    msg.subs.forEach((subId)=>{
                        delete self._subsBeingRevived[subId];
                    });
                }
                if (msg.methods) {
                    msg.methods.forEach((methodId)=>{
                        delete self._methodsBlockingQuiescence[methodId];
                    });
                }
                if (self._waitingForQuiescence()) {
                    return;
                }
                // No methods or subs are blocking quiescence!
                // We'll now process and all of our buffered messages, reset all stores,
                // and apply them all at once.
                const bufferedMessages = self._messagesBufferedUntilQuiescence;
                for (const bufferedMessage of Object.values(bufferedMessages)){
                    yield this._processOneDataMessage(bufferedMessage, self._bufferedWrites);
                }
                self._messagesBufferedUntilQuiescence = [];
            } else {
                yield this._processOneDataMessage(msg, self._bufferedWrites);
            }
            // Immediately flush writes when:
            //  1. Buffering is disabled. Or;
            //  2. any non-(added/changed/removed) message arrives.
            const standardWrite = msg.msg === "added" || msg.msg === "changed" || msg.msg === "removed";
            if (self._bufferedWritesInterval === 0 || !standardWrite) {
                yield self._flushBufferedWrites();
                return;
            }
            if (self._bufferedWritesFlushAt === null) {
                self._bufferedWritesFlushAt = new Date().valueOf() + self._bufferedWritesMaxAge;
            } else if (self._bufferedWritesFlushAt < new Date().valueOf()) {
                yield self._flushBufferedWrites();
                return;
            }
            if (self._bufferedWritesFlushHandle) {
                clearTimeout(self._bufferedWritesFlushHandle);
            }
            self._bufferedWritesFlushHandle = setTimeout(()=>{
                self._liveDataWritesPromise = self._flushBufferedWrites();
                if (Meteor._isPromise(self._liveDataWritesPromise)) {
                    self._liveDataWritesPromise.finally(()=>self._liveDataWritesPromise = undefined);
                }
            }, self._bufferedWritesInterval);
        }).call(this);
    }
    /**
   * @summary Process individual data messages by type
   * @private
   */ _processOneDataMessage(msg, updates) {
        return _async_to_generator(function*() {
            const messageType = msg.msg;
            switch(messageType){
                case 'added':
                    yield this._connection._process_added(msg, updates);
                    break;
                case 'changed':
                    this._connection._process_changed(msg, updates);
                    break;
                case 'removed':
                    this._connection._process_removed(msg, updates);
                    break;
                case 'ready':
                    this._connection._process_ready(msg, updates);
                    break;
                case 'updated':
                    this._connection._process_updated(msg, updates);
                    break;
                case 'nosub':
                    break;
                default:
                    Meteor._debug('discarding unknown livedata data message type', msg);
            }
        }).call(this);
    }
    /**
   * @summary Handle method results arriving from the server
   * @param {Object} msg The method result message
   */ _livedata_result(msg) {
        return _async_to_generator(function*() {
            const self = this._connection;
            // Lets make sure there are no buffered writes before returning result.
            if (!isEmpty(self._bufferedWrites)) {
                yield self._flushBufferedWrites();
            }
            // find the outstanding request
            // should be O(1) in nearly all realistic use cases
            if (isEmpty(self._outstandingMethodBlocks)) {
                Meteor._debug('Received method result but no methods outstanding');
                return;
            }
            const currentMethodBlock = self._outstandingMethodBlocks[0].methods;
            let i;
            const m = currentMethodBlock.find((method, idx)=>{
                const found = method.methodId === msg.id;
                if (found) i = idx;
                return found;
            });
            if (!m) {
                Meteor._debug("Can't match method response to original method call", msg);
                return;
            }
            // Remove from current method block. This may leave the block empty, but we
            // don't move on to the next block until the callback has been delivered, in
            // _outstandingMethodFinished.
            currentMethodBlock.splice(i, 1);
            if (hasOwn.call(msg, 'error')) {
                m.receiveResult(new Meteor.Error(msg.error.error, msg.error.reason, msg.error.details));
            } else {
                // msg.result may be undefined if the method didn't return a value
                m.receiveResult(undefined, msg.result);
            }
        }).call(this);
    }
    /**
   * @summary Handle "nosub" messages arriving from the server
   * @param {Object} msg The nosub message
   */ _livedata_nosub(msg) {
        return _async_to_generator(function*() {
            const self = this._connection;
            // First pass it through _livedata_data, which only uses it to help get
            // towards quiescence.
            yield this._livedata_data(msg);
            // Do the rest of our processing immediately, with no
            // buffering-until-quiescence.
            // we weren't subbed anyway, or we initiated the unsub.
            if (!hasOwn.call(self._subscriptions, msg.id)) {
                return;
            }
            // XXX COMPAT WITH 1.0.3.1 #errorCallback
            const errorCallback = self._subscriptions[msg.id].errorCallback;
            const stopCallback = self._subscriptions[msg.id].stopCallback;
            self._subscriptions[msg.id].remove();
            const meteorErrorFromMsg = (msgArg)=>{
                return msgArg && msgArg.error && new Meteor.Error(msgArg.error.error, msgArg.error.reason, msgArg.error.details);
            };
            // XXX COMPAT WITH 1.0.3.1 #errorCallback
            if (errorCallback && msg.error) {
                errorCallback(meteorErrorFromMsg(msg));
            }
            if (stopCallback) {
                stopCallback(meteorErrorFromMsg(msg));
            }
        }).call(this);
    }
    /**
   * @summary Handle errors from the server
   * @param {Object} msg The error message
   */ _livedata_error(msg) {
        Meteor._debug('Received error from server: ', msg.reason);
        if (msg.offendingMessage) Meteor._debug('For: ', msg.offendingMessage);
    }
    constructor(connection){
        this._connection = connection;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"method_invoker.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/method_invoker.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({MethodInvoker:()=>MethodInvoker});// A MethodInvoker manages sending a method to the server and calling the user's
// callbacks. On construction, it registers itself in the connection's
// _methodInvokers map; it removes itself once the method is fully finished and
// the callback is invoked. This occurs when it has both received a result,
// and the data written by it is fully visible.
class MethodInvoker {
    // Sends the method message to the server. May be called additional times if
    // we lose the connection and reconnect before receiving a result.
    sendMessage() {
        // This function is called before sending a method (including resending on
        // reconnect). We should only (re)send methods where we don't already have a
        // result!
        if (this.gotResult()) throw new Error('sendingMethod is called on method with result');
        // If we're re-sending it, it doesn't matter if data was written the first
        // time.
        this._dataVisible = false;
        this.sentMessage = true;
        // If this is a wait method, make all data messages be buffered until it is
        // done.
        if (this._wait) this._connection._methodsBlockingQuiescence[this.methodId] = true;
        // Actually send the message.
        this._connection._send(this._message);
    }
    // Invoke the callback, if we have both a result and know that all data has
    // been written to the local cache.
    _maybeInvokeCallback() {
        if (this._methodResult && this._dataVisible) {
            // Call the callback. (This won't throw: the callback was wrapped with
            // bindEnvironment.)
            this._callback(this._methodResult[0], this._methodResult[1]);
            // Forget about this method.
            delete this._connection._methodInvokers[this.methodId];
            // Let the connection know that this method is finished, so it can try to
            // move on to the next block of methods.
            this._connection._outstandingMethodFinished();
        }
    }
    // Call with the result of the method from the server. Only may be called
    // once; once it is called, you should not call sendMessage again.
    // If the user provided an onResultReceived callback, call it immediately.
    // Then invoke the main callback if data is also visible.
    receiveResult(err, result) {
        if (this.gotResult()) throw new Error('Methods should only receive results once');
        this._methodResult = [
            err,
            result
        ];
        this._onResultReceived(err, result);
        this._maybeInvokeCallback();
    }
    // Call this when all data written by the method is visible. This means that
    // the method has returns its "data is done" message *AND* all server
    // documents that are buffered at that time have been written to the local
    // cache. Invokes the main callback if the result has been received.
    dataVisible() {
        this._dataVisible = true;
        this._maybeInvokeCallback();
    }
    // True if receiveResult has been called.
    gotResult() {
        return !!this._methodResult;
    }
    constructor(options){
        // Public (within this file) fields.
        this.methodId = options.methodId;
        this.sentMessage = false;
        this._callback = options.callback;
        this._connection = options.connection;
        this._message = options.message;
        this._onResultReceived = options.onResultReceived || (()=>{});
        this._wait = options.wait;
        this.noRetry = options.noRetry;
        this._methodResult = null;
        this._dataVisible = false;
        // Register with the connection.
        this._connection._methodInvokers[this.methodId] = this;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_id_map.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/mongo_id_map.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({MongoIDMap:()=>MongoIDMap});let MongoID;module.link('meteor/mongo-id',{MongoID(v){MongoID=v}},0);
class MongoIDMap extends IdMap {
    constructor(){
        super(MongoID.idStringify, MongoID.idParse);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/common/namespace.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({DDP:()=>DDP},true);let DDPCommon;module.link('meteor/ddp-common',{DDPCommon(v){DDPCommon=v}},0);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},1);let Connection;module.link('./livedata_connection.js',{Connection(v){Connection=v}},2);


// This array allows the `_allSubscriptionsReady` method below, which
// is used by the `spiderable` package, to keep track of whether all
// data is ready.
const allConnections = [];
/**
 * @namespace DDP
 * @summary Namespace for DDP-related methods/classes.
 */ const DDP = {};
// This is private but it's used in a few places. accounts-base uses
// it to get the current user. Meteor.setTimeout and friends clear
// it. We can probably find a better way to factor this.
DDP._CurrentMethodInvocation = new Meteor.EnvironmentVariable();
DDP._CurrentPublicationInvocation = new Meteor.EnvironmentVariable();
// XXX: Keep DDP._CurrentInvocation for backwards-compatibility.
DDP._CurrentInvocation = DDP._CurrentMethodInvocation;
DDP._CurrentCallAsyncInvocation = new Meteor.EnvironmentVariable();
// This is passed into a weird `makeErrorType` function that expects its thing
// to be a constructor
function connectionErrorConstructor(message) {
    this.message = message;
}
DDP.ConnectionError = Meteor.makeErrorType('DDP.ConnectionError', connectionErrorConstructor);
DDP.ForcedReconnectError = Meteor.makeErrorType('DDP.ForcedReconnectError', ()=>{});
// Returns the named sequence of pseudo-random values.
// The scope will be DDP._CurrentMethodInvocation.get(), so the stream will produce
// consistent values for method calls on the client and server.
DDP.randomStream = (name)=>{
    const scope = DDP._CurrentMethodInvocation.get();
    return DDPCommon.RandomStream.get(scope, name);
};
// @param url {String} URL to Meteor app,
//     e.g.:
//     "subdomain.meteor.com",
//     "http://subdomain.meteor.com",
//     "/",
//     "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"
/**
 * @summary Connect to the server of a different Meteor application to subscribe to its document sets and invoke its remote methods.
 * @locus Anywhere
 * @param {String} url The URL of another Meteor application.
 * @param {Object} [options]
 * @param {Boolean} options.reloadWithOutstanding is it OK to reload if there are outstanding methods?
 * @param {Object} options.headers extra headers to send on the websockets connection, for server-to-server DDP only
 * @param {Object} options._sockjsOptions Specifies options to pass through to the sockjs client
 * @param {Function} options.onDDPNegotiationVersionFailure callback when version negotiation fails.
 */ DDP.connect = (url, options)=>{
    const ret = new Connection(url, options);
    allConnections.push(ret); // hack. see below.
    return ret;
};
DDP._reconnectHook = new Hook({
    bindEnvironment: false
});
/**
 * @summary Register a function to call as the first step of
 * reconnecting. This function can call methods which will be executed before
 * any other outstanding methods. For example, this can be used to re-establish
 * the appropriate authentication context on the connection.
 * @locus Anywhere
 * @param {Function} callback The function to call. It will be called with a
 * single argument, the [connection object](#ddp_connect) that is reconnecting.
 */ DDP.onReconnect = (callback)=>DDP._reconnectHook.register(callback);
// Hack for `spiderable` package: a way to see if the page is done
// loading all the data it needs.
//
DDP._allSubscriptionsReady = ()=>allConnections.every((conn)=>Object.values(conn._subscriptions).every((sub)=>sub.ready));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      DDP: DDP
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ddp-client/server/server.js"
  ],
  mainModulePath: "/node_modules/meteor/ddp-client/server/server.js"
}});

//# sourceURL=meteor://💻app/packages/ddp-client.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9zZXJ2ZXIvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9jb25uZWN0aW9uX3N0cmVhbV9oYW5kbGVycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vZG9jdW1lbnRfcHJvY2Vzc29ycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbGl2ZWRhdGFfY29ubmVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbWVzc2FnZV9wcm9jZXNzb3JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9tZXRob2RfaW52b2tlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbW9uZ29faWRfbWFwLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsiRERQIiwiQ29ubmVjdGlvblN0cmVhbUhhbmRsZXJzIiwib25NZXNzYWdlIiwicmF3X21zZyIsIm1zZyIsIkREUENvbW1vbiIsInBhcnNlRERQIiwiZSIsIk1ldGVvciIsIl9kZWJ1ZyIsIl9jb25uZWN0aW9uIiwiX2hlYXJ0YmVhdCIsIm1lc3NhZ2VSZWNlaXZlZCIsInRlc3RNZXNzYWdlT25Db25uZWN0IiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInNlcnZlcl9pZCIsIl9pZ25vcmVkTXNnc0ZvclNlc3Npb25PdXRPZkRhdGVDaGVjayIsImluY2x1ZGVzIiwiX3JlY2VpdmVkQ291bnQiLCJfdmVyc2lvbiIsIl92ZXJzaW9uU3VnZ2VzdGlvbiIsIl9yb3V0ZU1lc3NhZ2UiLCJfbGl2ZWRhdGFfY29ubmVjdGVkIiwib3B0aW9ucyIsIm9uQ29ubmVjdGVkIiwiX2hhbmRsZUZhaWxlZE1lc3NhZ2UiLCJyZXNwb25kVG9QaW5ncyIsIl9zZW5kIiwiaWQiLCJfbGl2ZWRhdGFfZGF0YSIsIl9saXZlZGF0YV9ub3N1YiIsIl9saXZlZGF0YV9yZXN1bHQiLCJfbGl2ZWRhdGFfZXJyb3IiLCJfc3VwcG9ydGVkRERQVmVyc2lvbnMiLCJpbmRleE9mIiwidmVyc2lvbiIsIl9zdHJlYW0iLCJyZWNvbm5lY3QiLCJfZm9yY2UiLCJkZXNjcmlwdGlvbiIsImRpc2Nvbm5lY3QiLCJfcGVybWFuZW50IiwiX2Vycm9yIiwib25ERFBWZXJzaW9uTmVnb3RpYXRpb25GYWlsdXJlIiwib25SZXNldCIsIl9idWlsZENvbm5lY3RNZXNzYWdlIiwiX2hhbmRsZU91dHN0YW5kaW5nTWV0aG9kc09uUmVzZXQiLCJfY2FsbE9uUmVjb25uZWN0QW5kU2VuZEFwcHJvcHJpYXRlT3V0c3RhbmRpbmdNZXRob2RzIiwiX3Jlc2VuZFN1YnNjcmlwdGlvbnMiLCJfbGFzdFNlc3Npb25JZCIsInNlc3Npb24iLCJyZWNlaXZlZENvdW50Iiwic3VwcG9ydCIsImJsb2NrcyIsIl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyIsImN1cnJlbnRNZXRob2RCbG9jayIsIm1ldGhvZHMiLCJmaWx0ZXIiLCJtZXRob2RJbnZva2VyIiwic2VudE1lc3NhZ2UiLCJub1JldHJ5IiwicmVjZWl2ZVJlc3VsdCIsIkVycm9yIiwic2hpZnQiLCJ2YWx1ZXMiLCJfbWV0aG9kSW52b2tlcnMiLCJmb3JFYWNoIiwiaW52b2tlciIsImVudHJpZXMiLCJfc3Vic2NyaXB0aW9ucyIsInN1YiIsIl9zZW5kUXVldWVkIiwibmFtZSIsInBhcmFtcyIsImNvbm5lY3Rpb24iLCJEb2N1bWVudFByb2Nlc3NvcnMiLCJfcHJvY2Vzc19hZGRlZCIsInVwZGF0ZXMiLCJzZWxmIiwiTW9uZ29JRCIsImlkUGFyc2UiLCJzZXJ2ZXJEb2MiLCJfZ2V0U2VydmVyRG9jIiwiY29sbGVjdGlvbiIsImlzRXhpc3RpbmciLCJkb2N1bWVudCIsInVuZGVmaW5lZCIsImZpZWxkcyIsImNyZWF0ZSIsIl9pZCIsIl9yZXNldFN0b3JlcyIsImN1cnJlbnREb2MiLCJfc3RvcmVzIiwiZ2V0RG9jIiwiX3B1c2hVcGRhdGUiLCJfcHJvY2Vzc19jaGFuZ2VkIiwiRGlmZlNlcXVlbmNlIiwiYXBwbHlDaGFuZ2VzIiwiX3Byb2Nlc3NfcmVtb3ZlZCIsIl9wcm9jZXNzX3JlYWR5Iiwic3VicyIsInN1YklkIiwiX3J1bldoZW5BbGxTZXJ2ZXJEb2NzQXJlRmx1c2hlZCIsInN1YlJlY29yZCIsInJlYWR5IiwicmVhZHlDYWxsYmFjayIsInJlYWR5RGVwcyIsImNoYW5nZWQiLCJfcHJvY2Vzc191cGRhdGVkIiwibWV0aG9kSWQiLCJkb2NzIiwiX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWIiLCJ3cml0dGVuIiwiSlNPTiIsInN0cmluZ2lmeSIsIndyaXR0ZW5CeVN0dWJzIiwiaXNFbXB0eSIsImlkU3RyaW5naWZ5IiwicmVwbGFjZSIsImZsdXNoQ2FsbGJhY2tzIiwiYyIsIl9zZXJ2ZXJEb2N1bWVudHMiLCJyZW1vdmUiLCJjYWxsYmFja0ludm9rZXIiLCJhcmdzIiwiZGF0YVZpc2libGUiLCJoYXNPd24iLCJjYWxsIiwicHVzaCIsInNlcnZlckRvY3NGb3JDb2xsZWN0aW9uIiwiZ2V0IiwiQ29ubmVjdGlvbiIsImNyZWF0ZVN0b3JlTWV0aG9kcyIsIndyYXBwZWRTdG9yZSIsInN0b3JlIiwia2V5c09mU3RvcmUiLCJtZXRob2QiLCJyZWdpc3RlclN0b3JlQ2xpZW50IiwicXVldWVkIiwiX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzIiwiQXJyYXkiLCJpc0FycmF5IiwiYmVnaW5VcGRhdGUiLCJ1cGRhdGUiLCJlbmRVcGRhdGUiLCJyZWdpc3RlclN0b3JlU2VydmVyIiwic3Vic2NyaWJlIiwic2xpY2UiLCJhcmd1bWVudHMiLCJjYWxsYmFja3MiLCJsYXN0UGFyYW0iLCJvblJlYWR5IiwicG9wIiwib25FcnJvciIsIm9uU3RvcCIsInNvbWUiLCJmIiwiZXhpc3RpbmciLCJmaW5kIiwiaW5hY3RpdmUiLCJFSlNPTiIsImVxdWFscyIsImVycm9yQ2FsbGJhY2siLCJzdG9wQ2FsbGJhY2siLCJSYW5kb20iLCJjbG9uZSIsIlRyYWNrZXIiLCJEZXBlbmRlbmN5Iiwic3RvcCIsImhhbmRsZSIsInJlY29yZCIsImRlcGVuZCIsInN1YnNjcmlwdGlvbklkIiwiYWN0aXZlIiwib25JbnZhbGlkYXRlIiwiYWZ0ZXJGbHVzaCIsImlzQXN5bmNDYWxsIiwiX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uIiwiX2lzQ2FsbEFzeW5jTWV0aG9kUnVubmluZyIsImZ1bmMiLCJfbWV0aG9kSGFuZGxlcnMiLCJfZ2V0SXNTaW11bGF0aW9uIiwiaXNGcm9tQ2FsbEFzeW5jIiwiYWxyZWFkeUluU2ltdWxhdGlvbiIsImNhbGxiYWNrIiwiYXBwbHkiLCJjYWxsQXN5bmMiLCJhcHBseUFzeW5jIiwicmV0dXJuU2VydmVyUmVzdWx0UHJvbWlzZSIsIl9zdHViQ2FsbCIsInN0dWJJbnZvY2F0aW9uIiwiaW52b2NhdGlvbiIsInN0dWJPcHRpb25zIiwiaGFzU3R1YiIsIl9zYXZlT3JpZ2luYWxzIiwic3R1YlJldHVyblZhbHVlIiwid2l0aFZhbHVlIiwiX2lzUHJvbWlzZSIsImV4Y2VwdGlvbiIsIl9hcHBseSIsInN0dWJQcm9taXNlIiwiX2FwcGx5QXN5bmNTdHViSW52b2NhdGlvbiIsInByb21pc2UiLCJfYXBwbHlBc3luYyIsImlzQ2xpZW50IiwidGhlbiIsIm8iLCJzZXJ2ZXJQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjYXRjaCIsImN1cnJlbnRDb250ZXh0IiwiX3NldE5ld0NvbnRleHRBbmRHZXRDdXJyZW50IiwiX3NldCIsInN0dWJDYWxsVmFsdWUiLCJiaW5kRW52aXJvbm1lbnQiLCJyYW5kb21TZWVkIiwicmVzdWx0IiwiX3JldHVybk1ldGhvZEludm9rZXIiLCJfbmV4dE1ldGhvZElkIiwiX3JldHJpZXZlQW5kU3RvcmVPcmlnaW5hbHMiLCJtZXNzYWdlIiwidGhyb3dTdHViRXhjZXB0aW9ucyIsIl9leHBlY3RlZEJ5VGVzdCIsInJldHVyblN0dWJWYWx1ZSIsImVyciIsImFsbEFyZ3MiLCJmcm9tIiwidmFsdWUiLCJNZXRob2RJbnZva2VyIiwib25SZXN1bHRSZWNlaXZlZCIsIndhaXQiLCJfYWRkT3V0c3RhbmRpbmdNZXRob2QiLCJlbmNsb3NpbmciLCJzdHViIiwiaXNTaW11bGF0aW9uIiwiX2lzRnJvbUNhbGxBc3luYyIsImRlZmF1bHRSZXR1cm4iLCJyYW5kb21TZWVkR2VuZXJhdG9yIiwibWFrZVJwY1NlZWQiLCJzZXRVc2VySWQiLCJ1c2VySWQiLCJNZXRob2RJbnZvY2F0aW9uIiwiaXNTZXJ2ZXIiLCJfbm9ZaWVsZHNBbGxvd2VkIiwiX3dhaXRpbmdGb3JRdWllc2NlbmNlIiwiX2ZsdXNoQnVmZmVyZWRXcml0ZXMiLCJzYXZlT3JpZ2luYWxzIiwiZG9jc1dyaXR0ZW4iLCJvcmlnaW5hbHMiLCJyZXRyaWV2ZU9yaWdpbmFscyIsImRvYyIsIk1vbmdvSURNYXAiLCJzZXREZWZhdWx0IiwiX3Vuc3Vic2NyaWJlQWxsIiwib2JqIiwic2VuZCIsInN0cmluZ2lmeUREUCIsIl9sb3N0Q29ubmVjdGlvbiIsImVycm9yIiwic3RhdHVzIiwiY2xvc2UiLCJfdXNlcklkRGVwcyIsIl91c2VySWQiLCJfc3Vic0JlaW5nUmV2aXZlZCIsIl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlIiwiX2FueU1ldGhvZHNBcmVPdXRzdGFuZGluZyIsImludm9rZXJzIiwiX3ByZXBhcmVCdWZmZXJzVG9GbHVzaCIsIl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlIiwiY2xlYXJUaW1lb3V0IiwiX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCIsIndyaXRlcyIsIl9idWZmZXJlZFdyaXRlcyIsIl9wZXJmb3JtV3JpdGVzU2VydmVyIiwiX25hbWUiLCJzdG9yZU5hbWUiLCJtZXNzYWdlcyIsIkNIVU5LX1NJWkUiLCJpIiwiY2h1bmsiLCJNYXRoIiwibWluIiwicHJvY2VzcyIsIm5leHRUaWNrIiwiX3J1bkFmdGVyVXBkYXRlQ2FsbGJhY2tzIiwiX3BlcmZvcm1Xcml0ZXNDbGllbnQiLCJfYWZ0ZXJVcGRhdGVDYWxsYmFja3MiLCJydW5GQWZ0ZXJVcGRhdGVzIiwidW5mbHVzaGVkU2VydmVyRG9jQ291bnQiLCJvblNlcnZlckRvY0ZsdXNoIiwic2VydmVyRG9jdW1lbnRzIiwid3JpdHRlbkJ5U3R1YkZvckFNZXRob2RXaXRoU2VudE1lc3NhZ2UiLCJsYXN0Iiwic2VuZE1lc3NhZ2UiLCJfb3V0c3RhbmRpbmdNZXRob2RGaW5pc2hlZCIsImZpcnN0QmxvY2siLCJfc2VuZE91dHN0YW5kaW5nTWV0aG9kcyIsIl9tYXliZU1pZ3JhdGUiLCJtIiwiX3NlbmRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrc01lc3NhZ2VzIiwib2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3MiLCJwcm9taXNlcyIsInB1c2hSZWNvbm5lY3RSZXN1bHQiLCJpbnZva2UiLCJvblJlY29ubmVjdCIsIl9yZWNvbm5lY3RIb29rIiwic2VuZE1lc3NhZ2VzIiwiYWxsU2V0dGxlZCIsIl9yZWFkeVRvTWlncmF0ZSIsIl9yZXRyeU1pZ3JhdGUiLCJ1cmwiLCJoZWFydGJlYXRJbnRlcnZhbCIsImhlYXJ0YmVhdFRpbWVvdXQiLCJucG1GYXllT3B0aW9ucyIsInJlbG9hZFdpdGhPdXRzdGFuZGluZyIsInN1cHBvcnRlZEREUFZlcnNpb25zIiwiU1VQUE9SVEVEX0REUF9WRVJTSU9OUyIsInJldHJ5IiwiYnVmZmVyZWRXcml0ZXNJbnRlcnZhbCIsImJ1ZmZlcmVkV3JpdGVzTWF4QWdlIiwiQ2xpZW50U3RyZWFtIiwicmVxdWlyZSIsIkNvbm5lY3Rpb25FcnJvciIsImhlYWRlcnMiLCJfc29ja2pzT3B0aW9ucyIsIl9kb250UHJpbnRFcnJvcnMiLCJjb25uZWN0VGltZW91dE1zIiwiX2hlYXJ0YmVhdEludGVydmFsIiwiX2hlYXJ0YmVhdFRpbWVvdXQiLCJfbWVzc2FnZXNCdWZmZXJlZFVudGlsUXVpZXNjZW5jZSIsIl9idWZmZXJlZFdyaXRlc0ludGVydmFsIiwiX2J1ZmZlcmVkV3JpdGVzTWF4QWdlIiwiUGFja2FnZSIsInJlbG9hZCIsIlJlbG9hZCIsIl9vbk1pZ3JhdGUiLCJfc3RyZWFtSGFuZGxlcnMiLCJvbkRpc2Nvbm5lY3QiLCJvbiIsIl9tZXNzYWdlUHJvY2Vzc29ycyIsIk1lc3NhZ2VQcm9jZXNzb3JzIiwiX2RvY3VtZW50UHJvY2Vzc29ycyIsIkhlYXJ0YmVhdCIsIm9uVGltZW91dCIsInNlbmRQaW5nIiwic3RhcnQiLCJyZWNvbm5lY3RlZFRvUHJldmlvdXNTZXNzaW9uIiwiZ290UmVzdWx0IiwiYnVmZmVyZWRNZXNzYWdlcyIsImJ1ZmZlcmVkTWVzc2FnZSIsIl9wcm9jZXNzT25lRGF0YU1lc3NhZ2UiLCJzdGFuZGFyZFdyaXRlIiwiRGF0ZSIsInZhbHVlT2YiLCJzZXRUaW1lb3V0IiwiX2xpdmVEYXRhV3JpdGVzUHJvbWlzZSIsImZpbmFsbHkiLCJtZXNzYWdlVHlwZSIsImlkeCIsImZvdW5kIiwic3BsaWNlIiwicmVhc29uIiwiZGV0YWlscyIsIm1ldGVvckVycm9yRnJvbU1zZyIsIm1zZ0FyZyIsIm9mZmVuZGluZ01lc3NhZ2UiLCJfZGF0YVZpc2libGUiLCJfd2FpdCIsIl9tZXNzYWdlIiwiX21heWJlSW52b2tlQ2FsbGJhY2siLCJfbWV0aG9kUmVzdWx0IiwiX2NhbGxiYWNrIiwiX29uUmVzdWx0UmVjZWl2ZWQiLCJJZE1hcCIsImFsbENvbm5lY3Rpb25zIiwiRW52aXJvbm1lbnRWYXJpYWJsZSIsIl9DdXJyZW50UHVibGljYXRpb25JbnZvY2F0aW9uIiwiX0N1cnJlbnRJbnZvY2F0aW9uIiwiX0N1cnJlbnRDYWxsQXN5bmNJbnZvY2F0aW9uIiwiY29ubmVjdGlvbkVycm9yQ29uc3RydWN0b3IiLCJtYWtlRXJyb3JUeXBlIiwiRm9yY2VkUmVjb25uZWN0RXJyb3IiLCJyYW5kb21TdHJlYW0iLCJzY29wZSIsIlJhbmRvbVN0cmVhbSIsImNvbm5lY3QiLCJyZXQiLCJIb29rIiwicmVn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N1gsT0FBT29ELE1BQU0sQ0FBQ3lVLEtBQUtwVSxjQUFjLEVBQUVtVSxLQUFLLENBQUNsVSxPQUFPQSxJQUFJa0MsS0FBSyIsImZpbGUiOiIvcGFja2FnZXMvZGRwLWNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IEREUCB9IGZyb20gJy4uL2NvbW1vbi9uYW1lc3BhY2UuanMnO1xuIiwiaW1wb3J0IHsgRERQQ29tbW9uIH0gZnJvbSAnbWV0ZW9yL2RkcC1jb21tb24nO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uU3RyZWFtSGFuZGxlcnMge1xuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBpbmNvbWluZyByYXcgbWVzc2FnZXMgZnJvbSB0aGUgRERQIHN0cmVhbVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcmF3X21zZyBUaGUgcmF3IG1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSB0aGUgc3RyZWFtXG4gICAqL1xuICBhc3luYyBvbk1lc3NhZ2UocmF3X21zZykge1xuICAgIGxldCBtc2c7XG4gICAgdHJ5IHtcbiAgICAgIG1zZyA9IEREUENvbW1vbi5wYXJzZUREUChyYXdfbXNnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBNZXRlb3IuX2RlYnVnKCdFeGNlcHRpb24gd2hpbGUgcGFyc2luZyBERFAnLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBBbnkgbWVzc2FnZSBjb3VudHMgYXMgcmVjZWl2aW5nIGEgcG9uZywgYXMgaXQgZGVtb25zdHJhdGVzIHRoYXRcbiAgICAvLyB0aGUgc2VydmVyIGlzIHN0aWxsIGFsaXZlLlxuICAgIGlmICh0aGlzLl9jb25uZWN0aW9uLl9oZWFydGJlYXQpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX2hlYXJ0YmVhdC5tZXNzYWdlUmVjZWl2ZWQoKTtcbiAgICB9XG5cbiAgICBpZiAobXNnID09PSBudWxsIHx8ICFtc2cubXNnKSB7XG4gICAgICBpZighbXNnIHx8ICFtc2cudGVzdE1lc3NhZ2VPbkNvbm5lY3QpIHtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG1zZykubGVuZ3RoID09PSAxICYmIG1zZy5zZXJ2ZXJfaWQpIHJldHVybjtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnZGlzY2FyZGluZyBpbnZhbGlkIGxpdmVkYXRhIG1lc3NhZ2UnLCBtc2cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHJlY2VpdmVkIG1lc3NhZ2UgY291bnQgZm9yIHNlc3Npb24gcmVzdW1wdGlvbiAoZXhjbHVkaW5nIHBpbmcvcG9uZylcbiAgICBpZiAoIXRoaXMuX2Nvbm5lY3Rpb24uX2lnbm9yZWRNc2dzRm9yU2Vzc2lvbk91dE9mRGF0ZUNoZWNrLmluY2x1ZGVzKG1zZy5tc2cpKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLl9yZWNlaXZlZENvdW50Kys7XG4gICAgfVxuXG4gICAgLy8gSW1wb3J0YW50OiBUaGlzIHdhcyBtaXNzaW5nIGZyb20gcHJldmlvdXMgdmVyc2lvblxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IHRoZSBjdXJyZW50IHZlcnNpb24gYmVmb3JlIHJvdXRpbmcgdGhlIG1lc3NhZ2VcbiAgICBpZiAobXNnLm1zZyA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3ZlcnNpb24gPSB0aGlzLl9jb25uZWN0aW9uLl92ZXJzaW9uU3VnZ2VzdGlvbjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl9yb3V0ZU1lc3NhZ2UobXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3V0ZXMgbWVzc2FnZXMgdG8gdGhlaXIgYXBwcm9wcmlhdGUgaGFuZGxlcnMgYmFzZWQgb24gbWVzc2FnZSB0eXBlXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIHBhcnNlZCBERFAgbWVzc2FnZVxuICAgKi9cbiAgYXN5bmMgX3JvdXRlTWVzc2FnZShtc2cpIHtcbiAgICBzd2l0Y2ggKG1zZy5tc2cpIHtcbiAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb24uX2xpdmVkYXRhX2Nvbm5lY3RlZChtc2cpO1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLm9wdGlvbnMub25Db25uZWN0ZWQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgIGF3YWl0IHRoaXMuX2hhbmRsZUZhaWxlZE1lc3NhZ2UobXNnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3BpbmcnOlxuICAgICAgICBpZiAodGhpcy5fY29ubmVjdGlvbi5vcHRpb25zLnJlc3BvbmRUb1BpbmdzKSB7XG4gICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5fc2VuZCh7IG1zZzogJ3BvbmcnLCBpZDogbXNnLmlkIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdwb25nJzpcbiAgICAgICAgLy8gbm9vcCwgYXMgd2UgYXNzdW1lIGV2ZXJ5dGhpbmcncyBhIHBvbmdcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2FkZGVkJzpcbiAgICAgIGNhc2UgJ2NoYW5nZWQnOlxuICAgICAgY2FzZSAncmVtb3ZlZCc6XG4gICAgICBjYXNlICdyZWFkeSc6XG4gICAgICBjYXNlICd1cGRhdGVkJzpcbiAgICAgICAgYXdhaXQgdGhpcy5fY29ubmVjdGlvbi5fbGl2ZWRhdGFfZGF0YShtc2cpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbm9zdWInOlxuICAgICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLl9saXZlZGF0YV9ub3N1Yihtc2cpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncmVzdWx0JzpcbiAgICAgICAgYXdhaXQgdGhpcy5fY29ubmVjdGlvbi5fbGl2ZWRhdGFfcmVzdWx0KG1zZyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX2xpdmVkYXRhX2Vycm9yKG1zZyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBNZXRlb3IuX2RlYnVnKCdkaXNjYXJkaW5nIHVua25vd24gbGl2ZWRhdGEgbWVzc2FnZSB0eXBlJywgbXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBmYWlsZWQgY29ubmVjdGlvbiBtZXNzYWdlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBmYWlsZWQgbWVzc2FnZSBvYmplY3RcbiAgICovXG4gIF9oYW5kbGVGYWlsZWRNZXNzYWdlKG1zZykge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9uLl9zdXBwb3J0ZWRERFBWZXJzaW9ucy5pbmRleE9mKG1zZy52ZXJzaW9uKSA+PSAwKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLl92ZXJzaW9uU3VnZ2VzdGlvbiA9IG1zZy52ZXJzaW9uO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fc3RyZWFtLnJlY29ubmVjdCh7IF9mb3JjZTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVzY3JpcHRpb24gPVxuICAgICAgICAnRERQIHZlcnNpb24gbmVnb3RpYXRpb24gZmFpbGVkOyBzZXJ2ZXIgcmVxdWVzdGVkIHZlcnNpb24gJyArXG4gICAgICAgIG1zZy52ZXJzaW9uO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fc3RyZWFtLmRpc2Nvbm5lY3QoeyBfcGVybWFuZW50OiB0cnVlLCBfZXJyb3I6IGRlc2NyaXB0aW9uIH0pO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5vcHRpb25zLm9uRERQVmVyc2lvbk5lZ290aWF0aW9uRmFpbHVyZShkZXNjcmlwdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY29ubmVjdGlvbiByZXNldCBldmVudHNcbiAgICovXG4gIG9uUmVzZXQoKSB7XG4gICAgLy8gUmVzZXQgaXMgY2FsbGVkIGV2ZW4gb24gdGhlIGZpcnN0IGNvbm5lY3Rpb24sIHNvIHRoaXMgaXNcbiAgICAvLyB0aGUgb25seSBwbGFjZSB3ZSBzZW5kIHRoaXMgbWVzc2FnZS5cbiAgICBjb25zdCBtc2cgPSB0aGlzLl9idWlsZENvbm5lY3RNZXNzYWdlKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5fc2VuZChtc2cpO1xuXG4gICAgLy8gTWFyayBub24tcmV0cnkgY2FsbHMgYXMgZmFpbGVkIGFuZCBoYW5kbGUgb3V0c3RhbmRpbmcgbWV0aG9kc1xuICAgIHRoaXMuX2hhbmRsZU91dHN0YW5kaW5nTWV0aG9kc09uUmVzZXQoKTtcblxuICAgIC8vIE5vdywgdG8gbWluaW1pemUgc2V0dXAgbGF0ZW5jeSwgZ28gYWhlYWQgYW5kIGJsYXN0IG91dCBhbGwgb2ZcbiAgICAvLyBvdXIgcGVuZGluZyBtZXRob2RzIGFuZHMgc3Vic2NyaXB0aW9ucyBiZWZvcmUgd2UndmUgZXZlbiB0YWtlblxuICAgIC8vIHRoZSBuZWNlc3NhcnkgUlRUIHRvIGtub3cgaWYgd2Ugc3VjY2Vzc2Z1bGx5IHJlY29ubmVjdGVkLlxuICAgIHRoaXMuX2Nvbm5lY3Rpb24uX2NhbGxPblJlY29ubmVjdEFuZFNlbmRBcHByb3ByaWF0ZU91dHN0YW5kaW5nTWV0aG9kcygpO1xuICAgIHRoaXMuX3Jlc2VuZFN1YnNjcmlwdGlvbnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgdGhlIGluaXRpYWwgY29ubmVjdCBtZXNzYWdlXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBjb25uZWN0IG1lc3NhZ2Ugb2JqZWN0XG4gICAqL1xuICBfYnVpbGRDb25uZWN0TWVzc2FnZSgpIHtcbiAgICBjb25zdCBtc2cgPSB7IG1zZzogJ2Nvbm5lY3QnIH07XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24uX2xhc3RTZXNzaW9uSWQpIHtcbiAgICAgIG1zZy5zZXNzaW9uID0gdGhpcy5fY29ubmVjdGlvbi5fbGFzdFNlc3Npb25JZDtcbiAgICAgIG1zZy5yZWNlaXZlZENvdW50ID0gdGhpcy5fY29ubmVjdGlvbi5fcmVjZWl2ZWRDb3VudDtcbiAgICB9XG4gICAgbXNnLnZlcnNpb24gPSB0aGlzLl9jb25uZWN0aW9uLl92ZXJzaW9uU3VnZ2VzdGlvbiB8fCB0aGlzLl9jb25uZWN0aW9uLl9zdXBwb3J0ZWRERFBWZXJzaW9uc1swXTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLl92ZXJzaW9uU3VnZ2VzdGlvbiA9IG1zZy52ZXJzaW9uO1xuICAgIG1zZy5zdXBwb3J0ID0gdGhpcy5fY29ubmVjdGlvbi5fc3VwcG9ydGVkRERQVmVyc2lvbnM7XG4gICAgcmV0dXJuIG1zZztcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIG91dHN0YW5kaW5nIG1ldGhvZHMgZHVyaW5nIGEgcmVzZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVPdXRzdGFuZGluZ01ldGhvZHNPblJlc2V0KCkge1xuICAgIGNvbnN0IGJsb2NrcyA9IHRoaXMuX2Nvbm5lY3Rpb24uX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzO1xuICAgIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBjdXJyZW50TWV0aG9kQmxvY2sgPSBibG9ja3NbMF0ubWV0aG9kcztcbiAgICBibG9ja3NbMF0ubWV0aG9kcyA9IGN1cnJlbnRNZXRob2RCbG9jay5maWx0ZXIoXG4gICAgICBtZXRob2RJbnZva2VyID0+IHtcbiAgICAgICAgLy8gTWV0aG9kcyB3aXRoICdub1JldHJ5JyBvcHRpb24gc2V0IGFyZSBub3QgYWxsb3dlZCB0byByZS1zZW5kIGFmdGVyXG4gICAgICAgIC8vIHJlY292ZXJpbmcgZHJvcHBlZCBjb25uZWN0aW9uLlxuICAgICAgICBpZiAobWV0aG9kSW52b2tlci5zZW50TWVzc2FnZSAmJiBtZXRob2RJbnZva2VyLm5vUmV0cnkpIHtcbiAgICAgICAgICBtZXRob2RJbnZva2VyLnJlY2VpdmVSZXN1bHQoXG4gICAgICAgICAgICBuZXcgTWV0ZW9yLkVycm9yKFxuICAgICAgICAgICAgICAnaW52b2NhdGlvbi1mYWlsZWQnLFxuICAgICAgICAgICAgICAnTWV0aG9kIGludm9jYXRpb24gbWlnaHQgaGF2ZSBmYWlsZWQgZHVlIHRvIGRyb3BwZWQgY29ubmVjdGlvbi4gJyArXG4gICAgICAgICAgICAgICdGYWlsaW5nIGJlY2F1c2UgYG5vUmV0cnlgIG9wdGlvbiB3YXMgcGFzc2VkIHRvIE1ldGVvci5hcHBseS4nXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkga2VlcCBhIG1ldGhvZCBpZiBpdCB3YXNuJ3Qgc2VudCBvciBpdCdzIGFsbG93ZWQgdG8gcmV0cnkuXG4gICAgICAgIHJldHVybiAhKG1ldGhvZEludm9rZXIuc2VudE1lc3NhZ2UgJiYgbWV0aG9kSW52b2tlci5ub1JldHJ5KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ2xlYXIgZW1wdHkgYmxvY2tzXG4gICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwICYmIGJsb2Nrc1swXS5tZXRob2RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYmxvY2tzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgYWxsIG1ldGhvZCBpbnZva2VycyBhcyB1bnNlbnRcbiAgICBPYmplY3QudmFsdWVzKHRoaXMuX2Nvbm5lY3Rpb24uX21ldGhvZEludm9rZXJzKS5mb3JFYWNoKGludm9rZXIgPT4ge1xuICAgICAgaW52b2tlci5zZW50TWVzc2FnZSA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2VuZHMgYWxsIGFjdGl2ZSBzdWJzY3JpcHRpb25zXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVzZW5kU3Vic2NyaXB0aW9ucygpIHtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLl9jb25uZWN0aW9uLl9zdWJzY3JpcHRpb25zKS5mb3JFYWNoKChbaWQsIHN1Yl0pID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3NlbmRRdWV1ZWQoe1xuICAgICAgICBtc2c6ICdzdWInLFxuICAgICAgICBpZDogaWQsXG4gICAgICAgIG5hbWU6IHN1Yi5uYW1lLFxuICAgICAgICBwYXJhbXM6IHN1Yi5wYXJhbXNcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59IiwiaW1wb3J0IHsgTW9uZ29JRCB9IGZyb20gJ21ldGVvci9tb25nby1pZCc7XG5pbXBvcnQgeyBEaWZmU2VxdWVuY2UgfSBmcm9tICdtZXRlb3IvZGlmZi1zZXF1ZW5jZSc7XG5pbXBvcnQgeyBoYXNPd24gfSBmcm9tIFwibWV0ZW9yL2RkcC1jb21tb24vdXRpbHNcIjtcbmltcG9ydCB7IGlzRW1wdHkgfSBmcm9tIFwibWV0ZW9yL2RkcC1jb21tb24vdXRpbHNcIjtcblxuZXhwb3J0IGNsYXNzIERvY3VtZW50UHJvY2Vzc29ycyB7XG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIGFuICdhZGRlZCcgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgYWRkZWQgbWVzc2FnZVxuICAgKiBAcGFyYW0ge09iamVjdH0gdXBkYXRlcyBUaGUgdXBkYXRlcyBhY2N1bXVsYXRvclxuICAgKi9cbiAgYXN5bmMgX3Byb2Nlc3NfYWRkZWQobXNnLCB1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgY29uc3QgaWQgPSBNb25nb0lELmlkUGFyc2UobXNnLmlkKTtcbiAgICBjb25zdCBzZXJ2ZXJEb2MgPSBzZWxmLl9nZXRTZXJ2ZXJEb2MobXNnLmNvbGxlY3Rpb24sIGlkKTtcblxuICAgIGlmIChzZXJ2ZXJEb2MpIHtcbiAgICAgIC8vIFNvbWUgb3V0c3RhbmRpbmcgc3R1YiB3cm90ZSBoZXJlLlxuICAgICAgY29uc3QgaXNFeGlzdGluZyA9IHNlcnZlckRvYy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkO1xuXG4gICAgICBzZXJ2ZXJEb2MuZG9jdW1lbnQgPSBtc2cuZmllbGRzIHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICBzZXJ2ZXJEb2MuZG9jdW1lbnQuX2lkID0gaWQ7XG5cbiAgICAgIGlmIChzZWxmLl9yZXNldFN0b3Jlcykge1xuICAgICAgICAvLyBEdXJpbmcgcmVjb25uZWN0IHRoZSBzZXJ2ZXIgaXMgc2VuZGluZyBhZGRzIGZvciBleGlzdGluZyBpZHMuXG4gICAgICAgIC8vIEFsd2F5cyBwdXNoIGFuIHVwZGF0ZSBzbyB0aGF0IGRvY3VtZW50IHN0YXlzIGluIHRoZSBzdG9yZSBhZnRlclxuICAgICAgICAvLyByZXNldC4gVXNlIGN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQgZm9yIHRoaXMgdXBkYXRlLCBzb1xuICAgICAgICAvLyB0aGF0IHN0dWItd3JpdHRlbiB2YWx1ZXMgYXJlIHByZXNlcnZlZC5cbiAgICAgICAgY29uc3QgY3VycmVudERvYyA9IGF3YWl0IHNlbGYuX3N0b3Jlc1ttc2cuY29sbGVjdGlvbl0uZ2V0RG9jKG1zZy5pZCk7XG4gICAgICAgIGlmIChjdXJyZW50RG9jICE9PSB1bmRlZmluZWQpIG1zZy5maWVsZHMgPSBjdXJyZW50RG9jO1xuXG4gICAgICAgIHNlbGYuX3B1c2hVcGRhdGUodXBkYXRlcywgbXNnLmNvbGxlY3Rpb24sIG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKGlzRXhpc3RpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgc2VudCBhZGQgZm9yIGV4aXN0aW5nIGlkOiAnICsgbXNnLmlkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fcHVzaFVwZGF0ZSh1cGRhdGVzLCBtc2cuY29sbGVjdGlvbiwgbXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUHJvY2VzcyBhICdjaGFuZ2VkJyBtZXNzYWdlIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBjaGFuZ2VkIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXMgVGhlIHVwZGF0ZXMgYWNjdW11bGF0b3JcbiAgICovXG4gIF9wcm9jZXNzX2NoYW5nZWQobXNnLCB1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgY29uc3Qgc2VydmVyRG9jID0gc2VsZi5fZ2V0U2VydmVyRG9jKG1zZy5jb2xsZWN0aW9uLCBNb25nb0lELmlkUGFyc2UobXNnLmlkKSk7XG5cbiAgICBpZiAoc2VydmVyRG9jKSB7XG4gICAgICBpZiAoc2VydmVyRG9jLmRvY3VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgc2VudCBjaGFuZ2VkIGZvciBub25leGlzdGluZyBpZDogJyArIG1zZy5pZCk7XG4gICAgICB9XG4gICAgICBEaWZmU2VxdWVuY2UuYXBwbHlDaGFuZ2VzKHNlcnZlckRvYy5kb2N1bWVudCwgbXNnLmZpZWxkcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuX3B1c2hVcGRhdGUodXBkYXRlcywgbXNnLmNvbGxlY3Rpb24sIG1zZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFByb2Nlc3MgYSAncmVtb3ZlZCcgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgcmVtb3ZlZCBtZXNzYWdlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVzIFRoZSB1cGRhdGVzIGFjY3VtdWxhdG9yXG4gICAqL1xuICBfcHJvY2Vzc19yZW1vdmVkKG1zZywgdXBkYXRlcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuICAgIGNvbnN0IHNlcnZlckRvYyA9IHNlbGYuX2dldFNlcnZlckRvYyhtc2cuY29sbGVjdGlvbiwgTW9uZ29JRC5pZFBhcnNlKG1zZy5pZCkpO1xuXG4gICAgaWYgKHNlcnZlckRvYykge1xuICAgICAgLy8gU29tZSBvdXRzdGFuZGluZyBzdHViIHdyb3RlIGhlcmUuXG4gICAgICBpZiAoc2VydmVyRG9jLmRvY3VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgc2VudCByZW1vdmVkIGZvciBub25leGlzdGluZyBpZDonICsgbXNnLmlkKTtcbiAgICAgIH1cbiAgICAgIHNlcnZlckRvYy5kb2N1bWVudCA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fcHVzaFVwZGF0ZSh1cGRhdGVzLCBtc2cuY29sbGVjdGlvbiwge1xuICAgICAgICBtc2c6ICdyZW1vdmVkJyxcbiAgICAgICAgY29sbGVjdGlvbjogbXNnLmNvbGxlY3Rpb24sXG4gICAgICAgIGlkOiBtc2cuaWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIGEgJ3JlYWR5JyBtZXNzYWdlIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSByZWFkeSBtZXNzYWdlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVzIFRoZSB1cGRhdGVzIGFjY3VtdWxhdG9yXG4gICAqL1xuICBfcHJvY2Vzc19yZWFkeShtc2csIHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcblxuICAgIC8vIFByb2Nlc3MgXCJzdWIgcmVhZHlcIiBtZXNzYWdlcy4gXCJzdWIgcmVhZHlcIiBtZXNzYWdlcyBkb24ndCB0YWtlIGVmZmVjdFxuICAgIC8vIHVudGlsIGFsbCBjdXJyZW50IHNlcnZlciBkb2N1bWVudHMgaGF2ZSBiZWVuIGZsdXNoZWQgdG8gdGhlIGxvY2FsXG4gICAgLy8gZGF0YWJhc2UuIFdlIGNhbiB1c2UgYSB3cml0ZSBmZW5jZSB0byBpbXBsZW1lbnQgdGhpcy5cbiAgICBtc2cuc3Vicy5mb3JFYWNoKChzdWJJZCkgPT4ge1xuICAgICAgc2VsZi5fcnVuV2hlbkFsbFNlcnZlckRvY3NBcmVGbHVzaGVkKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3ViUmVjb3JkID0gc2VsZi5fc3Vic2NyaXB0aW9uc1tzdWJJZF07XG4gICAgICAgIC8vIERpZCB3ZSBhbHJlYWR5IHVuc3Vic2NyaWJlP1xuICAgICAgICBpZiAoIXN1YlJlY29yZCkgcmV0dXJuO1xuICAgICAgICAvLyBEaWQgd2UgYWxyZWFkeSByZWNlaXZlIGEgcmVhZHkgbWVzc2FnZT8gKE9vcHMhKVxuICAgICAgICBpZiAoc3ViUmVjb3JkLnJlYWR5KSByZXR1cm47XG4gICAgICAgIHN1YlJlY29yZC5yZWFkeSA9IHRydWU7XG4gICAgICAgIHN1YlJlY29yZC5yZWFkeUNhbGxiYWNrICYmIHN1YlJlY29yZC5yZWFkeUNhbGxiYWNrKCk7XG4gICAgICAgIHN1YlJlY29yZC5yZWFkeURlcHMuY2hhbmdlZCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUHJvY2VzcyBhbiAndXBkYXRlZCcgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgdXBkYXRlZCBtZXNzYWdlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVzIFRoZSB1cGRhdGVzIGFjY3VtdWxhdG9yXG4gICAqL1xuICBfcHJvY2Vzc191cGRhdGVkKG1zZywgdXBkYXRlcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuICAgIC8vIFByb2Nlc3MgXCJtZXRob2QgZG9uZVwiIG1lc3NhZ2VzLlxuICAgIG1zZy5tZXRob2RzLmZvckVhY2goKG1ldGhvZElkKSA9PiB7XG4gICAgICBjb25zdCBkb2NzID0gc2VsZi5fZG9jdW1lbnRzV3JpdHRlbkJ5U3R1YlttZXRob2RJZF0gfHwge307XG4gICAgICBPYmplY3QudmFsdWVzKGRvY3MpLmZvckVhY2goKHdyaXR0ZW4pID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyRG9jID0gc2VsZi5fZ2V0U2VydmVyRG9jKHdyaXR0ZW4uY29sbGVjdGlvbiwgd3JpdHRlbi5pZCk7XG4gICAgICAgIGlmICghc2VydmVyRG9jKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb3N0IHNlcnZlckRvYyBmb3IgJyArIEpTT04uc3RyaW5naWZ5KHdyaXR0ZW4pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNlcnZlckRvYy53cml0dGVuQnlTdHVic1ttZXRob2RJZF0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnRG9jICcgK1xuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkod3JpdHRlbikgK1xuICAgICAgICAgICAgJyBub3Qgd3JpdHRlbiBieSBtZXRob2QgJyArXG4gICAgICAgICAgICBtZXRob2RJZFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHNlcnZlckRvYy53cml0dGVuQnlTdHVic1ttZXRob2RJZF07XG4gICAgICAgIGlmIChpc0VtcHR5KHNlcnZlckRvYy53cml0dGVuQnlTdHVicykpIHtcbiAgICAgICAgICAvLyBBbGwgbWV0aG9kcyB3aG9zZSBzdHVicyB3cm90ZSB0aGlzIG1ldGhvZCBoYXZlIGNvbXBsZXRlZCEgV2UgY2FuXG4gICAgICAgICAgLy8gbm93IGNvcHkgdGhlIHNhdmVkIGRvY3VtZW50IHRvIHRoZSBkYXRhYmFzZSAocmV2ZXJ0aW5nIHRoZSBzdHViJ3NcbiAgICAgICAgICAvLyBjaGFuZ2UgaWYgdGhlIHNlcnZlciBkaWQgbm90IHdyaXRlIHRvIHRoaXMgb2JqZWN0LCBvciBhcHBseWluZyB0aGVcbiAgICAgICAgICAvLyBzZXJ2ZXIncyB3cml0ZXMgaWYgaXQgZGlkKS5cblxuICAgICAgICAgIC8vIFRoaXMgaXMgYSBmYWtlIGRkcCAncmVwbGFjZScgbWVzc2FnZS4gIEl0J3MganVzdCBmb3IgdGFsa2luZ1xuICAgICAgICAgIC8vIGJldHdlZW4gbGl2ZWRhdGEgY29ubmVjdGlvbnMgYW5kIG1pbmltb25nby4gIChXZSBoYXZlIHRvIHN0cmluZ2lmeVxuICAgICAgICAgIC8vIHRoZSBJRCBiZWNhdXNlIGl0J3Mgc3VwcG9zZWQgdG8gbG9vayBsaWtlIGEgd2lyZSBtZXNzYWdlLilcbiAgICAgICAgICBzZWxmLl9wdXNoVXBkYXRlKHVwZGF0ZXMsIHdyaXR0ZW4uY29sbGVjdGlvbiwge1xuICAgICAgICAgICAgbXNnOiAncmVwbGFjZScsXG4gICAgICAgICAgICBpZDogTW9uZ29JRC5pZFN0cmluZ2lmeSh3cml0dGVuLmlkKSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHNlcnZlckRvYy5kb2N1bWVudFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENhbGwgYWxsIGZsdXNoIGNhbGxiYWNrcy5cbiAgICAgICAgICBzZXJ2ZXJEb2MuZmx1c2hDYWxsYmFja3MuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgICAgICAgYygpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gRGVsZXRlIHRoaXMgY29tcGxldGVkIHNlcnZlckRvY3VtZW50LiBEb24ndCBib3RoZXIgdG8gR0MgZW1wdHlcbiAgICAgICAgICAvLyBJZE1hcHMgaW5zaWRlIHNlbGYuX3NlcnZlckRvY3VtZW50cywgc2luY2UgdGhlcmUgcHJvYmFibHkgYXJlbid0XG4gICAgICAgICAgLy8gbWFueSBjb2xsZWN0aW9ucyBhbmQgdGhleSdsbCBiZSB3cml0dGVuIHJlcGVhdGVkbHkuXG4gICAgICAgICAgc2VsZi5fc2VydmVyRG9jdW1lbnRzW3dyaXR0ZW4uY29sbGVjdGlvbl0ucmVtb3ZlKHdyaXR0ZW4uaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRlbGV0ZSBzZWxmLl9kb2N1bWVudHNXcml0dGVuQnlTdHViW21ldGhvZElkXTtcblxuICAgICAgLy8gV2Ugd2FudCB0byBjYWxsIHRoZSBkYXRhLXdyaXR0ZW4gY2FsbGJhY2ssIGJ1dCB3ZSBjYW4ndCBkbyBzbyB1bnRpbCBhbGxcbiAgICAgIC8vIGN1cnJlbnRseSBidWZmZXJlZCBtZXNzYWdlcyBhcmUgZmx1c2hlZC5cbiAgICAgIGNvbnN0IGNhbGxiYWNrSW52b2tlciA9IHNlbGYuX21ldGhvZEludm9rZXJzW21ldGhvZElkXTtcbiAgICAgIGlmICghY2FsbGJhY2tJbnZva2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gY2FsbGJhY2sgaW52b2tlciBmb3IgbWV0aG9kICcgKyBtZXRob2RJZCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3J1bldoZW5BbGxTZXJ2ZXJEb2NzQXJlRmx1c2hlZChcbiAgICAgICAgKC4uLmFyZ3MpID0+IGNhbGxiYWNrSW52b2tlci5kYXRhVmlzaWJsZSguLi5hcmdzKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQdXNoIGFuIHVwZGF0ZSB0byB0aGUgYnVmZmVyXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVzIFRoZSB1cGRhdGVzIGFjY3VtdWxhdG9yXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgdXBkYXRlIG1lc3NhZ2VcbiAgICovXG4gIF9wdXNoVXBkYXRlKHVwZGF0ZXMsIGNvbGxlY3Rpb24sIG1zZykge1xuICAgIGlmICghaGFzT3duLmNhbGwodXBkYXRlcywgY29sbGVjdGlvbikpIHtcbiAgICAgIHVwZGF0ZXNbY29sbGVjdGlvbl0gPSBbXTtcbiAgICB9XG4gICAgdXBkYXRlc1tjb2xsZWN0aW9uXS5wdXNoKG1zZyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0IGEgc2VydmVyIGRvY3VtZW50IGJ5IGNvbGxlY3Rpb24gYW5kIGlkXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSBkb2N1bWVudCBpZFxuICAgKiBAcmV0dXJucyB7T2JqZWN0fG51bGx9IFRoZSBzZXJ2ZXIgZG9jdW1lbnQgb3IgbnVsbFxuICAgKi9cbiAgX2dldFNlcnZlckRvYyhjb2xsZWN0aW9uLCBpZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuICAgIGlmICghaGFzT3duLmNhbGwoc2VsZi5fc2VydmVyRG9jdW1lbnRzLCBjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZlckRvY3NGb3JDb2xsZWN0aW9uID0gc2VsZi5fc2VydmVyRG9jdW1lbnRzW2NvbGxlY3Rpb25dO1xuICAgIHJldHVybiBzZXJ2ZXJEb2NzRm9yQ29sbGVjdGlvbi5nZXQoaWQpIHx8IG51bGw7XG4gIH1cbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEREUENvbW1vbiB9IGZyb20gJ21ldGVvci9kZHAtY29tbW9uJztcbmltcG9ydCB7IFRyYWNrZXIgfSBmcm9tICdtZXRlb3IvdHJhY2tlcic7XG5pbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbic7XG5pbXBvcnQgeyBSYW5kb20gfSBmcm9tICdtZXRlb3IvcmFuZG9tJztcbmltcG9ydCB7IE1vbmdvSUQgfSBmcm9tICdtZXRlb3IvbW9uZ28taWQnO1xuaW1wb3J0IHsgRERQIH0gZnJvbSAnLi9uYW1lc3BhY2UuanMnO1xuaW1wb3J0IHsgTWV0aG9kSW52b2tlciB9IGZyb20gJy4vbWV0aG9kX2ludm9rZXInO1xuaW1wb3J0IHtcbiAgaGFzT3duLFxuICBzbGljZSxcbiAga2V5cyxcbiAgaXNFbXB0eSxcbiAgbGFzdCxcbn0gZnJvbSBcIm1ldGVvci9kZHAtY29tbW9uL3V0aWxzXCI7XG5pbXBvcnQgeyBDb25uZWN0aW9uU3RyZWFtSGFuZGxlcnMgfSBmcm9tICcuL2Nvbm5lY3Rpb25fc3RyZWFtX2hhbmRsZXJzJztcbmltcG9ydCB7IE1vbmdvSURNYXAgfSBmcm9tICcuL21vbmdvX2lkX21hcCc7XG5pbXBvcnQgeyBNZXNzYWdlUHJvY2Vzc29ycyB9IGZyb20gJy4vbWVzc2FnZV9wcm9jZXNzb3JzJztcbmltcG9ydCB7IERvY3VtZW50UHJvY2Vzc29ycyB9IGZyb20gJy4vZG9jdW1lbnRfcHJvY2Vzc29ycyc7XG5cbi8vIEBwYXJhbSB1cmwge1N0cmluZ3xPYmplY3R9IFVSTCB0byBNZXRlb3IgYXBwLFxuLy8gICBvciBhbiBvYmplY3QgYXMgYSB0ZXN0IGhvb2sgKHNlZSBjb2RlKVxuLy8gT3B0aW9uczpcbi8vICAgcmVsb2FkV2l0aE91dHN0YW5kaW5nOiBpcyBpdCBPSyB0byByZWxvYWQgaWYgdGhlcmUgYXJlIG91dHN0YW5kaW5nIG1ldGhvZHM/XG4vLyAgIGhlYWRlcnM6IGV4dHJhIGhlYWRlcnMgdG8gc2VuZCBvbiB0aGUgd2Vic29ja2V0cyBjb25uZWN0aW9uLCBmb3Jcbi8vICAgICBzZXJ2ZXItdG8tc2VydmVyIEREUCBvbmx5XG4vLyAgIF9zb2NranNPcHRpb25zOiBTcGVjaWZpZXMgb3B0aW9ucyB0byBwYXNzIHRocm91Z2ggdG8gdGhlIHNvY2tqcyBjbGllbnRcbi8vICAgb25ERFBOZWdvdGlhdGlvblZlcnNpb25GYWlsdXJlOiBjYWxsYmFjayB3aGVuIHZlcnNpb24gbmVnb3RpYXRpb24gZmFpbHMuXG4vL1xuLy8gWFhYIFRoZXJlIHNob3VsZCBiZSBhIHdheSB0byBkZXN0cm95IGEgRERQIGNvbm5lY3Rpb24sIGNhdXNpbmcgYWxsXG4vLyBvdXRzdGFuZGluZyBtZXRob2QgY2FsbHMgdG8gZmFpbC5cbi8vXG4vLyBYWFggT3VyIGN1cnJlbnQgd2F5IG9mIGhhbmRsaW5nIGZhaWx1cmUgYW5kIHJlY29ubmVjdGlvbiBpcyBncmVhdFxuLy8gZm9yIGFuIGFwcCAod2hlcmUgd2Ugd2FudCB0byB0b2xlcmF0ZSBiZWluZyBkaXNjb25uZWN0ZWQgYXMgYW5cbi8vIGV4cGVjdCBzdGF0ZSwgYW5kIGtlZXAgdHJ5aW5nIGZvcmV2ZXIgdG8gcmVjb25uZWN0KSBidXQgY3VtYmVyc29tZVxuLy8gZm9yIHNvbWV0aGluZyBsaWtlIGEgY29tbWFuZCBsaW5lIHRvb2wgdGhhdCB3YW50cyB0byBtYWtlIGFcbi8vIGNvbm5lY3Rpb24sIGNhbGwgYSBtZXRob2QsIGFuZCBwcmludCBhbiBlcnJvciBpZiBjb25uZWN0aW9uXG4vLyBmYWlscy4gV2Ugc2hvdWxkIGhhdmUgYmV0dGVyIHVzYWJpbGl0eSBpbiB0aGUgbGF0dGVyIGNhc2UgKHdoaWxlXG4vLyBzdGlsbCB0cmFuc3BhcmVudGx5IHJlY29ubmVjdGluZyBpZiBpdCdzIGp1c3QgYSB0cmFuc2llbnQgZmFpbHVyZVxuLy8gb3IgdGhlIHNlcnZlciBtaWdyYXRpbmcgdXMpLlxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcih1cmwsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgPSB7XG4gICAgICBvbkNvbm5lY3RlZCgpIHt9LFxuICAgICAgb25ERFBWZXJzaW9uTmVnb3RpYXRpb25GYWlsdXJlKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoZGVzY3JpcHRpb24pO1xuICAgICAgfSxcbiAgICAgIGhlYXJ0YmVhdEludGVydmFsOiAxNzUwMCxcbiAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IDE1MDAwLFxuICAgICAgbnBtRmF5ZU9wdGlvbnM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICAvLyBUaGVzZSBvcHRpb25zIGFyZSBvbmx5IGZvciB0ZXN0aW5nLlxuICAgICAgcmVsb2FkV2l0aE91dHN0YW5kaW5nOiBmYWxzZSxcbiAgICAgIHN1cHBvcnRlZEREUFZlcnNpb25zOiBERFBDb21tb24uU1VQUE9SVEVEX0REUF9WRVJTSU9OUyxcbiAgICAgIHJldHJ5OiB0cnVlLFxuICAgICAgcmVzcG9uZFRvUGluZ3M6IHRydWUsXG4gICAgICAvLyBXaGVuIHVwZGF0ZXMgYXJlIGNvbWluZyB3aXRoaW4gdGhpcyBtcyBpbnRlcnZhbCwgYmF0Y2ggdGhlbSB0b2dldGhlci5cbiAgICAgIGJ1ZmZlcmVkV3JpdGVzSW50ZXJ2YWw6IDUsXG4gICAgICAvLyBGbHVzaCBidWZmZXJzIGltbWVkaWF0ZWx5IGlmIHdyaXRlcyBhcmUgaGFwcGVuaW5nIGNvbnRpbnVvdXNseSBmb3IgbW9yZSB0aGFuIHRoaXMgbWFueSBtcy5cbiAgICAgIGJ1ZmZlcmVkV3JpdGVzTWF4QWdlOiA1MDAsXG5cbiAgICAgIC4uLm9wdGlvbnNcbiAgICB9O1xuXG4gICAgLy8gSWYgc2V0LCBjYWxsZWQgd2hlbiB3ZSByZWNvbm5lY3QsIHF1ZXVpbmcgbWV0aG9kIGNhbGxzIF9iZWZvcmVfIHRoZVxuICAgIC8vIGV4aXN0aW5nIG91dHN0YW5kaW5nIG9uZXMuXG4gICAgLy8gTk9URTogVGhpcyBmZWF0dXJlIGhhcyBiZWVuIHByZXNlcnZlZCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIFRoZVxuICAgIC8vIHByZWZlcnJlZCBtZXRob2Qgb2Ygc2V0dGluZyBhIGNhbGxiYWNrIG9uIHJlY29ubmVjdCBpcyB0byB1c2VcbiAgICAvLyBERFAub25SZWNvbm5lY3QuXG4gICAgc2VsZi5vblJlY29ubmVjdCA9IG51bGw7XG5cbiAgICAvLyBhcyBhIHRlc3QgaG9vaywgYWxsb3cgcGFzc2luZyBhIHN0cmVhbSBpbnN0ZWFkIG9mIGEgdXJsLlxuICAgIGlmICh0eXBlb2YgdXJsID09PSAnb2JqZWN0Jykge1xuICAgICAgc2VsZi5fc3RyZWFtID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7IENsaWVudFN0cmVhbSB9ID0gcmVxdWlyZShcIm1ldGVvci9zb2NrZXQtc3RyZWFtLWNsaWVudFwiKTtcblxuICAgICAgc2VsZi5fc3RyZWFtID0gbmV3IENsaWVudFN0cmVhbSh1cmwsIHtcbiAgICAgICAgcmV0cnk6IG9wdGlvbnMucmV0cnksXG4gICAgICAgIENvbm5lY3Rpb25FcnJvcjogRERQLkNvbm5lY3Rpb25FcnJvcixcbiAgICAgICAgaGVhZGVyczogb3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICBfc29ja2pzT3B0aW9uczogb3B0aW9ucy5fc29ja2pzT3B0aW9ucyxcbiAgICAgICAgLy8gVXNlZCB0byBrZWVwIHNvbWUgdGVzdHMgcXVpZXQsIG9yIGZvciBvdGhlciBjYXNlcyBpbiB3aGljaFxuICAgICAgICAvLyB0aGUgcmlnaHQgdGhpbmcgdG8gZG8gd2l0aCBjb25uZWN0aW9uIGVycm9ycyBpcyB0byBzaWxlbnRseVxuICAgICAgICAvLyBmYWlsIChlLmcuIHNlbmRpbmcgcGFja2FnZSB1c2FnZSBzdGF0cykuIEF0IHNvbWUgcG9pbnQgd2VcbiAgICAgICAgLy8gc2hvdWxkIGhhdmUgYSByZWFsIEFQSSBmb3IgaGFuZGxpbmcgY2xpZW50LXN0cmVhbS1sZXZlbFxuICAgICAgICAvLyBlcnJvcnMuXG4gICAgICAgIF9kb250UHJpbnRFcnJvcnM6IG9wdGlvbnMuX2RvbnRQcmludEVycm9ycyxcbiAgICAgICAgY29ubmVjdFRpbWVvdXRNczogb3B0aW9ucy5jb25uZWN0VGltZW91dE1zLFxuICAgICAgICBucG1GYXllT3B0aW9uczogb3B0aW9ucy5ucG1GYXllT3B0aW9uc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5fbGFzdFNlc3Npb25JZCA9IG51bGw7XG4gICAgLy8gaG93IG1hbnkgbWVzc2FnZXMgd2UndmUgcmVjZWl2ZWQgKGV4Y2x1ZGluZyBwaW5nL3BvbmcpLlxuICAgIC8vIHdoZW4gd2UgdHJ5IHRvIHJlY29ubmVjdCB0byB0aGUgc2VydmVyLCBpdCB3aWxsIGNoZWNrIHRoaXMgYWdhaW5zdCB0aGUgbnVtYmVyIG9mIG1lc3NhZ2VzIGl0IHNlbnQuXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBtaXNtYXRjaCwgb3VyIGluZm8gaXMgb3V0IG9mIGRhdGUgYW5kIHdlIG5lZWQgYSBjbGVhbiBzZXNzaW9uLlxuICAgIHNlbGYuX3JlY2VpdmVkQ291bnQgPSAwO1xuICAgIHNlbGYuX3ZlcnNpb25TdWdnZXN0aW9uID0gbnVsbDsgLy8gVGhlIGxhc3QgcHJvcG9zZWQgRERQIHZlcnNpb24uXG4gICAgc2VsZi5fdmVyc2lvbiA9IG51bGw7IC8vIFRoZSBERFAgdmVyc2lvbiBhZ3JlZWQgb24gYnkgY2xpZW50IGFuZCBzZXJ2ZXIuXG4gICAgc2VsZi5fc3RvcmVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgLy8gbmFtZSAtPiBvYmplY3Qgd2l0aCBtZXRob2RzXG4gICAgc2VsZi5fbWV0aG9kSGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBuYW1lIC0+IGZ1bmNcbiAgICBzZWxmLl9uZXh0TWV0aG9kSWQgPSAxO1xuICAgIHNlbGYuX3N1cHBvcnRlZEREUFZlcnNpb25zID0gb3B0aW9ucy5zdXBwb3J0ZWRERFBWZXJzaW9ucztcblxuICAgIHNlbGYuX2hlYXJ0YmVhdEludGVydmFsID0gb3B0aW9ucy5oZWFydGJlYXRJbnRlcnZhbDtcbiAgICBzZWxmLl9oZWFydGJlYXRUaW1lb3V0ID0gb3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0O1xuICAgIHNlbGYuX2lnbm9yZWRNc2dzRm9yU2Vzc2lvbk91dE9mRGF0ZUNoZWNrID0gWydwaW5nJywgJ3BvbmcnXTtcblxuICAgIC8vIFRyYWNrcyBtZXRob2RzIHdoaWNoIHRoZSB1c2VyIGhhcyB0cmllZCB0byBjYWxsIGJ1dCB3aGljaCBoYXZlIG5vdCB5ZXRcbiAgICAvLyBjYWxsZWQgdGhlaXIgdXNlciBjYWxsYmFjayAoaWUsIHRoZXkgYXJlIHdhaXRpbmcgb24gdGhlaXIgcmVzdWx0IG9yIGZvciBhbGxcbiAgICAvLyBvZiB0aGVpciB3cml0ZXMgdG8gYmUgd3JpdHRlbiB0byB0aGUgbG9jYWwgY2FjaGUpLiBNYXAgZnJvbSBtZXRob2QgSUQgdG9cbiAgICAvLyBNZXRob2RJbnZva2VyIG9iamVjdC5cbiAgICBzZWxmLl9tZXRob2RJbnZva2VycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvLyBUcmFja3MgbWV0aG9kcyB3aGljaCB0aGUgdXNlciBoYXMgY2FsbGVkIGJ1dCB3aG9zZSByZXN1bHQgbWVzc2FnZXMgaGF2ZSBub3RcbiAgICAvLyBhcnJpdmVkIHlldC5cbiAgICAvL1xuICAgIC8vIF9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyBpcyBhbiBhcnJheSBvZiBibG9ja3Mgb2YgbWV0aG9kcy4gRWFjaCBibG9ja1xuICAgIC8vIHJlcHJlc2VudHMgYSBzZXQgb2YgbWV0aG9kcyB0aGF0IGNhbiBydW4gYXQgdGhlIHNhbWUgdGltZS4gVGhlIGZpcnN0IGJsb2NrXG4gICAgLy8gcmVwcmVzZW50cyB0aGUgbWV0aG9kcyB3aGljaCBhcmUgY3VycmVudGx5IGluIGZsaWdodDsgc3Vic2VxdWVudCBibG9ja3NcbiAgICAvLyBtdXN0IHdhaXQgZm9yIHByZXZpb3VzIGJsb2NrcyB0byBiZSBmdWxseSBmaW5pc2hlZCBiZWZvcmUgdGhleSBjYW4gYmUgc2VudFxuICAgIC8vIHRvIHRoZSBzZXJ2ZXIuXG4gICAgLy9cbiAgICAvLyBFYWNoIGJsb2NrIGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICAgIC8vIC0gbWV0aG9kczogYSBsaXN0IG9mIE1ldGhvZEludm9rZXIgb2JqZWN0c1xuICAgIC8vIC0gd2FpdDogYSBib29sZWFuOyBpZiB0cnVlLCB0aGlzIGJsb2NrIGhhZCBhIHNpbmdsZSBtZXRob2QgaW52b2tlZCB3aXRoXG4gICAgLy8gICAgICAgICB0aGUgXCJ3YWl0XCIgb3B0aW9uXG4gICAgLy9cbiAgICAvLyBUaGVyZSB3aWxsIG5ldmVyIGJlIGFkamFjZW50IGJsb2NrcyB3aXRoIHdhaXQ9ZmFsc2UsIGJlY2F1c2UgdGhlIG9ubHkgdGhpbmdcbiAgICAvLyB0aGF0IG1ha2VzIG1ldGhvZHMgbmVlZCB0byBiZSBzZXJpYWxpemVkIGlzIGEgd2FpdCBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBNZXRob2RzIGFyZSByZW1vdmVkIGZyb20gdGhlIGZpcnN0IGJsb2NrIHdoZW4gdGhlaXIgXCJyZXN1bHRcIiBpc1xuICAgIC8vIHJlY2VpdmVkLiBUaGUgZW50aXJlIGZpcnN0IGJsb2NrIGlzIG9ubHkgcmVtb3ZlZCB3aGVuIGFsbCBvZiB0aGUgaW4tZmxpZ2h0XG4gICAgLy8gbWV0aG9kcyBoYXZlIHJlY2VpdmVkIHRoZWlyIHJlc3VsdHMgKHNvIHRoZSBcIm1ldGhvZHNcIiBsaXN0IGlzIGVtcHR5KSAqQU5EKlxuICAgIC8vIGFsbCBvZiB0aGUgZGF0YSB3cml0dGVuIGJ5IHRob3NlIG1ldGhvZHMgYXJlIHZpc2libGUgaW4gdGhlIGxvY2FsIGNhY2hlLiBTb1xuICAgIC8vIGl0IGlzIHBvc3NpYmxlIGZvciB0aGUgZmlyc3QgYmxvY2sncyBtZXRob2RzIGxpc3QgdG8gYmUgZW1wdHksIGlmIHdlIGFyZVxuICAgIC8vIHN0aWxsIHdhaXRpbmcgZm9yIHNvbWUgb2JqZWN0cyB0byBxdWllc2NlLlxuICAgIC8vXG4gICAgLy8gRXhhbXBsZTpcbiAgICAvLyAgX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzID0gW1xuICAgIC8vICAgIHt3YWl0OiBmYWxzZSwgbWV0aG9kczogW119LFxuICAgIC8vICAgIHt3YWl0OiB0cnVlLCBtZXRob2RzOiBbPE1ldGhvZEludm9rZXIgZm9yICdsb2dpbic+XX0sXG4gICAgLy8gICAge3dhaXQ6IGZhbHNlLCBtZXRob2RzOiBbPE1ldGhvZEludm9rZXIgZm9yICdmb28nPixcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TWV0aG9kSW52b2tlciBmb3IgJ2Jhcic+XX1dXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IHRoZXJlIHdlcmUgc29tZSBtZXRob2RzIHdoaWNoIHdlcmUgc2VudCB0byB0aGUgc2VydmVyIGFuZFxuICAgIC8vIHdoaWNoIGhhdmUgcmV0dXJuZWQgdGhlaXIgcmVzdWx0cywgYnV0IHNvbWUgb2YgdGhlIGRhdGEgd3JpdHRlbiBieVxuICAgIC8vIHRoZSBtZXRob2RzIG1heSBub3QgYmUgdmlzaWJsZSBpbiB0aGUgbG9jYWwgY2FjaGUuIE9uY2UgYWxsIHRoYXQgZGF0YSBpc1xuICAgIC8vIHZpc2libGUsIHdlIHdpbGwgc2VuZCBhICdsb2dpbicgbWV0aG9kLiBPbmNlIHRoZSBsb2dpbiBtZXRob2QgaGFzIHJldHVybmVkXG4gICAgLy8gYW5kIGFsbCB0aGUgZGF0YSBpcyB2aXNpYmxlIChpbmNsdWRpbmcgcmUtcnVubmluZyBzdWJzIGlmIHVzZXJJZCBjaGFuZ2VzKSxcbiAgICAvLyB3ZSB3aWxsIHNlbmQgdGhlICdmb28nIGFuZCAnYmFyJyBtZXRob2RzIGluIHBhcmFsbGVsLlxuICAgIHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzID0gW107XG5cbiAgICAvLyBtZXRob2QgSUQgLT4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGtleXMgJ2NvbGxlY3Rpb24nIGFuZCAnaWQnLCBsaXN0aW5nXG4gICAgLy8gZG9jdW1lbnRzIHdyaXR0ZW4gYnkgYSBnaXZlbiBtZXRob2QncyBzdHViLiBrZXlzIGFyZSBhc3NvY2lhdGVkIHdpdGhcbiAgICAvLyBtZXRob2RzIHdob3NlIHN0dWIgd3JvdGUgYXQgbGVhc3Qgb25lIGRvY3VtZW50LCBhbmQgd2hvc2UgZGF0YS1kb25lIG1lc3NhZ2VcbiAgICAvLyBoYXMgbm90IHlldCBiZWVuIHJlY2VpdmVkLlxuICAgIHNlbGYuX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWIgPSB7fTtcbiAgICAvLyBjb2xsZWN0aW9uIC0+IElkTWFwIG9mIFwic2VydmVyIGRvY3VtZW50XCIgb2JqZWN0LiBBIFwic2VydmVyIGRvY3VtZW50XCIgaGFzOlxuICAgIC8vIC0gXCJkb2N1bWVudFwiOiB0aGUgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQgYWNjb3JkaW5nIHRoZVxuICAgIC8vICAgc2VydmVyIChpZSwgdGhlIHNuYXBzaG90IGJlZm9yZSBhIHN0dWIgd3JvdGUgaXQsIGFtZW5kZWQgYnkgYW55IGNoYW5nZXNcbiAgICAvLyAgIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlcilcbiAgICAvLyAgIEl0IGlzIHVuZGVmaW5lZCBpZiB3ZSB0aGluayB0aGUgZG9jdW1lbnQgZG9lcyBub3QgZXhpc3RcbiAgICAvLyAtIFwid3JpdHRlbkJ5U3R1YnNcIjogYSBzZXQgb2YgbWV0aG9kIElEcyB3aG9zZSBzdHVicyB3cm90ZSB0byB0aGUgZG9jdW1lbnRcbiAgICAvLyAgIHdob3NlIFwiZGF0YSBkb25lXCIgbWVzc2FnZXMgaGF2ZSBub3QgeWV0IGJlZW4gcHJvY2Vzc2VkXG4gICAgc2VsZi5fc2VydmVyRG9jdW1lbnRzID0ge307XG5cbiAgICAvLyBBcnJheSBvZiBjYWxsYmFja3MgdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBuZXh0IHVwZGF0ZSBvZiB0aGUgbG9jYWxcbiAgICAvLyBjYWNoZS4gVXNlZCBmb3I6XG4gICAgLy8gIC0gQ2FsbGluZyBtZXRob2RJbnZva2VyLmRhdGFWaXNpYmxlIGFuZCBzdWIgcmVhZHkgY2FsbGJhY2tzIGFmdGVyXG4gICAgLy8gICAgdGhlIHJlbGV2YW50IGRhdGEgaXMgZmx1c2hlZC5cbiAgICAvLyAgLSBJbnZva2luZyB0aGUgY2FsbGJhY2tzIG9mIFwiaGFsZi1maW5pc2hlZFwiIG1ldGhvZHMgYWZ0ZXIgcmVjb25uZWN0XG4gICAgLy8gICAgcXVpZXNjZW5jZS4gU3BlY2lmaWNhbGx5LCBtZXRob2RzIHdob3NlIHJlc3VsdCB3YXMgcmVjZWl2ZWQgb3ZlciB0aGUgb2xkXG4gICAgLy8gICAgY29ubmVjdGlvbiAoc28gd2UgZG9uJ3QgcmUtc2VuZCBpdCkgYnV0IHdob3NlIGRhdGEgaGFkIG5vdCBiZWVuIG1hZGVcbiAgICAvLyAgICB2aXNpYmxlLlxuICAgIHNlbGYuX2FmdGVyVXBkYXRlQ2FsbGJhY2tzID0gW107XG5cbiAgICAvLyBJbiB0d28gY29udGV4dHMsIHdlIGJ1ZmZlciBhbGwgaW5jb21pbmcgZGF0YSBtZXNzYWdlcyBhbmQgdGhlbiBwcm9jZXNzIHRoZW1cbiAgICAvLyBhbGwgYXQgb25jZSBpbiBhIHNpbmdsZSB1cGRhdGU6XG4gICAgLy8gICAtIER1cmluZyByZWNvbm5lY3QsIHdlIGJ1ZmZlciBhbGwgZGF0YSBtZXNzYWdlcyB1bnRpbCBhbGwgc3VicyB0aGF0IGhhZFxuICAgIC8vICAgICBiZWVuIHJlYWR5IGJlZm9yZSByZWNvbm5lY3QgYXJlIHJlYWR5IGFnYWluLCBhbmQgYWxsIG1ldGhvZHMgdGhhdCBhcmVcbiAgICAvLyAgICAgYWN0aXZlIGhhdmUgcmV0dXJuZWQgdGhlaXIgXCJkYXRhIGRvbmUgbWVzc2FnZVwiOyB0aGVuXG4gICAgLy8gICAtIER1cmluZyB0aGUgZXhlY3V0aW9uIG9mIGEgXCJ3YWl0XCIgbWV0aG9kLCB3ZSBidWZmZXIgYWxsIGRhdGEgbWVzc2FnZXNcbiAgICAvLyAgICAgdW50aWwgdGhlIHdhaXQgbWV0aG9kIGdldHMgaXRzIFwiZGF0YSBkb25lXCIgbWVzc2FnZS4gKElmIHRoZSB3YWl0IG1ldGhvZFxuICAgIC8vICAgICBvY2N1cnMgZHVyaW5nIHJlY29ubmVjdCwgaXQgZG9lc24ndCBnZXQgYW55IHNwZWNpYWwgaGFuZGxpbmcuKVxuICAgIC8vIGFsbCBkYXRhIG1lc3NhZ2VzIGFyZSBwcm9jZXNzZWQgaW4gb25lIHVwZGF0ZS5cbiAgICAvL1xuICAgIC8vIFRoZSBmb2xsb3dpbmcgZmllbGRzIGFyZSB1c2VkIGZvciB0aGlzIFwicXVpZXNjZW5jZVwiIHByb2Nlc3MuXG5cbiAgICAvLyBUaGlzIGJ1ZmZlcnMgdGhlIG1lc3NhZ2VzIHRoYXQgYXJlbid0IGJlaW5nIHByb2Nlc3NlZCB5ZXQuXG4gICAgc2VsZi5fbWVzc2FnZXNCdWZmZXJlZFVudGlsUXVpZXNjZW5jZSA9IFtdO1xuICAgIC8vIE1hcCBmcm9tIG1ldGhvZCBJRCAtPiB0cnVlLiBNZXRob2RzIGFyZSByZW1vdmVkIGZyb20gdGhpcyB3aGVuIHRoZWlyXG4gICAgLy8gXCJkYXRhIGRvbmVcIiBtZXNzYWdlIGlzIHJlY2VpdmVkLCBhbmQgd2Ugd2lsbCBub3QgcXVpZXNjZSB1bnRpbCBpdCBpc1xuICAgIC8vIGVtcHR5LlxuICAgIHNlbGYuX21ldGhvZHNCbG9ja2luZ1F1aWVzY2VuY2UgPSB7fTtcbiAgICAvLyBtYXAgZnJvbSBzdWIgSUQgLT4gdHJ1ZSBmb3Igc3VicyB0aGF0IHdlcmUgcmVhZHkgKGllLCBjYWxsZWQgdGhlIHN1YlxuICAgIC8vIHJlYWR5IGNhbGxiYWNrKSBiZWZvcmUgcmVjb25uZWN0IGJ1dCBoYXZlbid0IGJlY29tZSByZWFkeSBhZ2FpbiB5ZXRcbiAgICBzZWxmLl9zdWJzQmVpbmdSZXZpdmVkID0ge307IC8vIG1hcCBmcm9tIHN1Yi5faWQgLT4gdHJ1ZVxuICAgIC8vIGlmIHRydWUsIHRoZSBuZXh0IGRhdGEgdXBkYXRlIHNob3VsZCByZXNldCBhbGwgc3RvcmVzLiAoc2V0IGR1cmluZ1xuICAgIC8vIHJlY29ubmVjdC4pXG4gICAgc2VsZi5fcmVzZXRTdG9yZXMgPSBmYWxzZTtcblxuICAgIC8vIG5hbWUgLT4gYXJyYXkgb2YgdXBkYXRlcyBmb3IgKHlldCB0byBiZSBjcmVhdGVkKSBjb2xsZWN0aW9uc1xuICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzID0ge307XG4gICAgLy8gaWYgd2UncmUgYmxvY2tpbmcgYSBtaWdyYXRpb24sIHRoZSByZXRyeSBmdW5jXG4gICAgc2VsZi5fcmV0cnlNaWdyYXRlID0gbnVsbDtcbiAgICAvLyBDb2xsZWN0aW9uIG5hbWUgLT4gYXJyYXkgb2YgbWVzc2FnZXMuXG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXMgPSB7fTtcbiAgICAvLyBXaGVuIGN1cnJlbnQgYnVmZmVyIG9mIHVwZGF0ZXMgbXVzdCBiZSBmbHVzaGVkIGF0LCBpbiBtcyB0aW1lc3RhbXAuXG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEF0ID0gbnVsbDtcbiAgICAvLyBUaW1lb3V0IGhhbmRsZSBmb3IgdGhlIG5leHQgcHJvY2Vzc2luZyBvZiBhbGwgcGVuZGluZyB3cml0ZXNcbiAgICBzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlID0gbnVsbDtcblxuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzSW50ZXJ2YWwgPSBvcHRpb25zLmJ1ZmZlcmVkV3JpdGVzSW50ZXJ2YWw7XG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXNNYXhBZ2UgPSBvcHRpb25zLmJ1ZmZlcmVkV3JpdGVzTWF4QWdlO1xuXG4gICAgLy8gbWV0YWRhdGEgZm9yIHN1YnNjcmlwdGlvbnMuICBNYXAgZnJvbSBzdWIgSUQgdG8gb2JqZWN0IHdpdGgga2V5czpcbiAgICAvLyAgIC0gaWRcbiAgICAvLyAgIC0gbmFtZVxuICAgIC8vICAgLSBwYXJhbXNcbiAgICAvLyAgIC0gaW5hY3RpdmUgKGlmIHRydWUsIHdpbGwgYmUgY2xlYW5lZCB1cCBpZiBub3QgcmV1c2VkIGluIHJlLXJ1bilcbiAgICAvLyAgIC0gcmVhZHkgKGhhcyB0aGUgJ3JlYWR5JyBtZXNzYWdlIGJlZW4gcmVjZWl2ZWQ/KVxuICAgIC8vICAgLSByZWFkeUNhbGxiYWNrIChhbiBvcHRpb25hbCBjYWxsYmFjayB0byBjYWxsIHdoZW4gcmVhZHkpXG4gICAgLy8gICAtIGVycm9yQ2FsbGJhY2sgKGFuIG9wdGlvbmFsIGNhbGxiYWNrIHRvIGNhbGwgaWYgdGhlIHN1YiB0ZXJtaW5hdGVzIHdpdGhcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgYW4gZXJyb3IsIFhYWCBDT01QQVQgV0lUSCAxLjAuMy4xKVxuICAgIC8vICAgLSBzdG9wQ2FsbGJhY2sgKGFuIG9wdGlvbmFsIGNhbGxiYWNrIHRvIGNhbGwgd2hlbiB0aGUgc3ViIHRlcm1pbmF0ZXNcbiAgICAvLyAgICAgZm9yIGFueSByZWFzb24sIHdpdGggYW4gZXJyb3IgYXJndW1lbnQgaWYgYW4gZXJyb3IgdHJpZ2dlcmVkIHRoZSBzdG9wKVxuICAgIHNlbGYuX3N1YnNjcmlwdGlvbnMgPSB7fTtcblxuICAgIC8vIFJlYWN0aXZlIHVzZXJJZC5cbiAgICBzZWxmLl91c2VySWQgPSBudWxsO1xuICAgIHNlbGYuX3VzZXJJZERlcHMgPSBuZXcgVHJhY2tlci5EZXBlbmRlbmN5KCk7XG5cbiAgICAvLyBCbG9jayBhdXRvLXJlbG9hZCB3aGlsZSB3ZSdyZSB3YWl0aW5nIGZvciBtZXRob2QgcmVzcG9uc2VzLlxuICAgIGlmIChNZXRlb3IuaXNDbGllbnQgJiZcbiAgICAgIFBhY2thZ2UucmVsb2FkICYmXG4gICAgICAhIG9wdGlvbnMucmVsb2FkV2l0aE91dHN0YW5kaW5nKSB7XG4gICAgICBQYWNrYWdlLnJlbG9hZC5SZWxvYWQuX29uTWlncmF0ZShyZXRyeSA9PiB7XG4gICAgICAgIGlmICghIHNlbGYuX3JlYWR5VG9NaWdyYXRlKCkpIHtcbiAgICAgICAgICBzZWxmLl9yZXRyeU1pZ3JhdGUgPSByZXRyeTtcbiAgICAgICAgICByZXR1cm4gW2ZhbHNlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW3RydWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdHJlYW1IYW5kbGVycyA9IG5ldyBDb25uZWN0aW9uU3RyZWFtSGFuZGxlcnModGhpcyk7XG5cbiAgICBjb25zdCBvbkRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5faGVhcnRiZWF0KSB7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdC5zdG9wKCk7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX3N0cmVhbS5vbihcbiAgICAgICAgJ21lc3NhZ2UnLFxuICAgICAgICBNZXRlb3IuYmluZEVudmlyb25tZW50KFxuICAgICAgICAgIG1zZyA9PiB0aGlzLl9zdHJlYW1IYW5kbGVycy5vbk1lc3NhZ2UobXNnKSxcbiAgICAgICAgICAnaGFuZGxpbmcgRERQIG1lc3NhZ2UnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICB0aGlzLl9zdHJlYW0ub24oXG4gICAgICAgICdyZXNldCcsXG4gICAgICAgIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoXG4gICAgICAgICAgKCkgPT4gdGhpcy5fc3RyZWFtSGFuZGxlcnMub25SZXNldCgpLFxuICAgICAgICAgICdoYW5kbGluZyBERFAgcmVzZXQnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICB0aGlzLl9zdHJlYW0ub24oXG4gICAgICAgICdkaXNjb25uZWN0JyxcbiAgICAgICAgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChvbkRpc2Nvbm5lY3QsICdoYW5kbGluZyBERFAgZGlzY29ubmVjdCcpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zdHJlYW0ub24oJ21lc3NhZ2UnLCBtc2cgPT4gdGhpcy5fc3RyZWFtSGFuZGxlcnMub25NZXNzYWdlKG1zZykpO1xuICAgICAgdGhpcy5fc3RyZWFtLm9uKCdyZXNldCcsICgpID0+IHRoaXMuX3N0cmVhbUhhbmRsZXJzLm9uUmVzZXQoKSk7XG4gICAgICB0aGlzLl9zdHJlYW0ub24oJ2Rpc2Nvbm5lY3QnLCBvbkRpc2Nvbm5lY3QpO1xuICAgIH1cblxuICAgIHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzID0gbmV3IE1lc3NhZ2VQcm9jZXNzb3JzKHRoaXMpO1xuXG4gICAgLy8gRXhwb3NlIG1lc3NhZ2UgcHJvY2Vzc29yIG1ldGhvZHMgdG8gbWFpbnRhaW4gYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIHRoaXMuX2xpdmVkYXRhX2Nvbm5lY3RlZCA9IChtc2cpID0+IHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzLl9saXZlZGF0YV9jb25uZWN0ZWQobXNnKTtcbiAgICB0aGlzLl9saXZlZGF0YV9kYXRhID0gKG1zZykgPT4gdGhpcy5fbWVzc2FnZVByb2Nlc3NvcnMuX2xpdmVkYXRhX2RhdGEobXNnKTtcbiAgICB0aGlzLl9saXZlZGF0YV9ub3N1YiA9IChtc2cpID0+IHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzLl9saXZlZGF0YV9ub3N1Yihtc2cpO1xuICAgIHRoaXMuX2xpdmVkYXRhX3Jlc3VsdCA9IChtc2cpID0+IHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzLl9saXZlZGF0YV9yZXN1bHQobXNnKTtcbiAgICB0aGlzLl9saXZlZGF0YV9lcnJvciA9IChtc2cpID0+IHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzLl9saXZlZGF0YV9lcnJvcihtc2cpO1xuXG4gICAgdGhpcy5fZG9jdW1lbnRQcm9jZXNzb3JzID0gbmV3IERvY3VtZW50UHJvY2Vzc29ycyh0aGlzKTtcblxuICAgIC8vIEV4cG9zZSBkb2N1bWVudCBwcm9jZXNzb3IgbWV0aG9kcyB0byBtYWludGFpbiBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgdGhpcy5fcHJvY2Vzc19hZGRlZCA9IChtc2csIHVwZGF0ZXMpID0+IHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHJvY2Vzc19hZGRlZChtc2csIHVwZGF0ZXMpO1xuICAgIHRoaXMuX3Byb2Nlc3NfY2hhbmdlZCA9IChtc2csIHVwZGF0ZXMpID0+IHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHJvY2Vzc19jaGFuZ2VkKG1zZywgdXBkYXRlcyk7XG4gICAgdGhpcy5fcHJvY2Vzc19yZW1vdmVkID0gKG1zZywgdXBkYXRlcykgPT4gdGhpcy5fZG9jdW1lbnRQcm9jZXNzb3JzLl9wcm9jZXNzX3JlbW92ZWQobXNnLCB1cGRhdGVzKTtcbiAgICB0aGlzLl9wcm9jZXNzX3JlYWR5ID0gKG1zZywgdXBkYXRlcykgPT4gdGhpcy5fZG9jdW1lbnRQcm9jZXNzb3JzLl9wcm9jZXNzX3JlYWR5KG1zZywgdXBkYXRlcyk7XG4gICAgdGhpcy5fcHJvY2Vzc191cGRhdGVkID0gKG1zZywgdXBkYXRlcykgPT4gdGhpcy5fZG9jdW1lbnRQcm9jZXNzb3JzLl9wcm9jZXNzX3VwZGF0ZWQobXNnLCB1cGRhdGVzKTtcblxuICAgIC8vIEFsc28gZXhwb3NlIHV0aWxpdHkgbWV0aG9kcyB1c2VkIGJ5IG90aGVyIHBhcnRzIG9mIHRoZSBzeXN0ZW1cbiAgICB0aGlzLl9wdXNoVXBkYXRlID0gKHVwZGF0ZXMsIGNvbGxlY3Rpb24sIG1zZykgPT5cbiAgICAgIHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHVzaFVwZGF0ZSh1cGRhdGVzLCBjb2xsZWN0aW9uLCBtc2cpO1xuICAgIHRoaXMuX2dldFNlcnZlckRvYyA9IChjb2xsZWN0aW9uLCBpZCkgPT5cbiAgICAgIHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fZ2V0U2VydmVyRG9jKGNvbGxlY3Rpb24sIGlkKTtcbiAgfVxuXG4gIC8vICduYW1lJyBpcyB0aGUgbmFtZSBvZiB0aGUgZGF0YSBvbiB0aGUgd2lyZSB0aGF0IHNob3VsZCBnbyBpbiB0aGVcbiAgLy8gc3RvcmUuICd3cmFwcGVkU3RvcmUnIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCBtZXRob2RzIGJlZ2luVXBkYXRlLCB1cGRhdGUsXG4gIC8vIGVuZFVwZGF0ZSwgc2F2ZU9yaWdpbmFscywgcmV0cmlldmVPcmlnaW5hbHMuIHNlZSBDb2xsZWN0aW9uIGZvciBhbiBleGFtcGxlLlxuICBjcmVhdGVTdG9yZU1ldGhvZHMobmFtZSwgd3JhcHBlZFN0b3JlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAobmFtZSBpbiBzZWxmLl9zdG9yZXMpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIFdyYXAgdGhlIGlucHV0IG9iamVjdCBpbiBhbiBvYmplY3Qgd2hpY2ggbWFrZXMgYW55IHN0b3JlIG1ldGhvZCBub3RcbiAgICAvLyBpbXBsZW1lbnRlZCBieSAnc3RvcmUnIGludG8gYSBuby1vcC5cbiAgICBjb25zdCBzdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgY29uc3Qga2V5c09mU3RvcmUgPSBbXG4gICAgICAndXBkYXRlJyxcbiAgICAgICdiZWdpblVwZGF0ZScsXG4gICAgICAnZW5kVXBkYXRlJyxcbiAgICAgICdzYXZlT3JpZ2luYWxzJyxcbiAgICAgICdyZXRyaWV2ZU9yaWdpbmFscycsXG4gICAgICAnZ2V0RG9jJyxcbiAgICAgICdfZ2V0Q29sbGVjdGlvbidcbiAgICBdO1xuICAgIGtleXNPZlN0b3JlLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgc3RvcmVbbWV0aG9kXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGlmICh3cmFwcGVkU3RvcmVbbWV0aG9kXSkge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVkU3RvcmVbbWV0aG9kXSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgICBzZWxmLl9zdG9yZXNbbmFtZV0gPSBzdG9yZTtcbiAgICByZXR1cm4gc3RvcmU7XG4gIH1cblxuICByZWdpc3RlclN0b3JlQ2xpZW50KG5hbWUsIHdyYXBwZWRTdG9yZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3Qgc3RvcmUgPSBzZWxmLmNyZWF0ZVN0b3JlTWV0aG9kcyhuYW1lLCB3cmFwcGVkU3RvcmUpO1xuXG4gICAgY29uc3QgcXVldWVkID0gc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbbmFtZV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocXVldWVkKSkge1xuICAgICAgc3RvcmUuYmVnaW5VcGRhdGUocXVldWVkLmxlbmd0aCwgZmFsc2UpO1xuICAgICAgcXVldWVkLmZvckVhY2gobXNnID0+IHtcbiAgICAgICAgc3RvcmUudXBkYXRlKG1zZyk7XG4gICAgICB9KTtcbiAgICAgIHN0b3JlLmVuZFVwZGF0ZSgpO1xuICAgICAgZGVsZXRlIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGFzeW5jIHJlZ2lzdGVyU3RvcmVTZXJ2ZXIobmFtZSwgd3JhcHBlZFN0b3JlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBzdG9yZSA9IHNlbGYuY3JlYXRlU3RvcmVNZXRob2RzKG5hbWUsIHdyYXBwZWRTdG9yZSk7XG5cbiAgICBjb25zdCBxdWV1ZWQgPSBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tuYW1lXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShxdWV1ZWQpKSB7XG4gICAgICBhd2FpdCBzdG9yZS5iZWdpblVwZGF0ZShxdWV1ZWQubGVuZ3RoLCBmYWxzZSk7XG4gICAgICBmb3IgKGNvbnN0IG1zZyBvZiBxdWV1ZWQpIHtcbiAgICAgICAgYXdhaXQgc3RvcmUudXBkYXRlKG1zZyk7XG4gICAgICB9XG4gICAgICBhd2FpdCBzdG9yZS5lbmRVcGRhdGUoKTtcbiAgICAgIGRlbGV0ZSBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tuYW1lXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGFsaWFzIE1ldGVvci5zdWJzY3JpYmVcbiAgICogQHN1bW1hcnkgU3Vic2NyaWJlIHRvIGEgcmVjb3JkIHNldC4gIFJldHVybnMgYSBoYW5kbGUgdGhhdCBwcm92aWRlc1xuICAgKiBgc3RvcCgpYCBhbmQgYHJlYWR5KClgIG1ldGhvZHMuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgc3Vic2NyaXB0aW9uLiAgTWF0Y2hlcyB0aGUgbmFtZSBvZiB0aGVcbiAgICogc2VydmVyJ3MgYHB1Ymxpc2goKWAgY2FsbC5cbiAgICogQHBhcmFtIHtFSlNPTmFibGV9IFthcmcxLGFyZzIuLi5dIE9wdGlvbmFsIGFyZ3VtZW50cyBwYXNzZWQgdG8gcHVibGlzaGVyXG4gICAqIGZ1bmN0aW9uIG9uIHNlcnZlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IFtjYWxsYmFja3NdIE9wdGlvbmFsLiBNYXkgaW5jbHVkZSBgb25TdG9wYFxuICAgKiBhbmQgYG9uUmVhZHlgIGNhbGxiYWNrcy4gSWYgdGhlcmUgaXMgYW4gZXJyb3IsIGl0IGlzIHBhc3NlZCBhcyBhblxuICAgKiBhcmd1bWVudCB0byBgb25TdG9wYC4gSWYgYSBmdW5jdGlvbiBpcyBwYXNzZWQgaW5zdGVhZCBvZiBhbiBvYmplY3QsIGl0XG4gICAqIGlzIGludGVycHJldGVkIGFzIGFuIGBvblJlYWR5YCBjYWxsYmFjay5cbiAgICovXG4gIHN1YnNjcmliZShuYW1lIC8qIC4uIFthcmd1bWVudHNdIC4uIChjYWxsYmFja3xjYWxsYmFja3MpICovKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBwYXJhbXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGV0IGNhbGxiYWNrcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgaWYgKHBhcmFtcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGxhc3RQYXJhbSA9IHBhcmFtc1twYXJhbXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAodHlwZW9mIGxhc3RQYXJhbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFja3Mub25SZWFkeSA9IHBhcmFtcy5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFBhcmFtICYmIFtcbiAgICAgICAgbGFzdFBhcmFtLm9uUmVhZHksXG4gICAgICAgIC8vIFhYWCBDT01QQVQgV0lUSCAxLjAuMy4xIG9uRXJyb3IgdXNlZCB0byBleGlzdCwgYnV0IG5vdyB3ZSB1c2VcbiAgICAgICAgLy8gb25TdG9wIHdpdGggYW4gZXJyb3IgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAgICAgbGFzdFBhcmFtLm9uRXJyb3IsXG4gICAgICAgIGxhc3RQYXJhbS5vblN0b3BcbiAgICAgIF0uc29tZShmID0+IHR5cGVvZiBmID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgIGNhbGxiYWNrcyA9IHBhcmFtcy5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJcyB0aGVyZSBhbiBleGlzdGluZyBzdWIgd2l0aCB0aGUgc2FtZSBuYW1lIGFuZCBwYXJhbSwgcnVuIGluIGFuXG4gICAgLy8gaW52YWxpZGF0ZWQgQ29tcHV0YXRpb24/IFRoaXMgd2lsbCBoYXBwZW4gaWYgd2UgYXJlIHJlcnVubmluZyBhblxuICAgIC8vIGV4aXN0aW5nIGNvbXB1dGF0aW9uLlxuICAgIC8vXG4gICAgLy8gRm9yIGV4YW1wbGUsIGNvbnNpZGVyIGEgcmVydW4gb2Y6XG4gICAgLy9cbiAgICAvLyAgICAgVHJhY2tlci5hdXRvcnVuKGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgICBNZXRlb3Iuc3Vic2NyaWJlKFwiZm9vXCIsIFNlc3Npb24uZ2V0KFwiZm9vXCIpKTtcbiAgICAvLyAgICAgICBNZXRlb3Iuc3Vic2NyaWJlKFwiYmFyXCIsIFNlc3Npb24uZ2V0KFwiYmFyXCIpKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvLyBJZiBcImZvb1wiIGhhcyBjaGFuZ2VkIGJ1dCBcImJhclwiIGhhcyBub3QsIHdlIHdpbGwgbWF0Y2ggdGhlIFwiYmFyXCJcbiAgICAvLyBzdWJjcmliZSB0byBhbiBleGlzdGluZyBpbmFjdGl2ZSBzdWJzY3JpcHRpb24gaW4gb3JkZXIgdG8gbm90XG4gICAgLy8gdW5zdWIgYW5kIHJlc3ViIHRoZSBzdWJzY3JpcHRpb24gdW5uZWNlc3NhcmlseS5cbiAgICAvL1xuICAgIC8vIFdlIG9ubHkgbG9vayBmb3Igb25lIHN1Y2ggc3ViOyBpZiB0aGVyZSBhcmUgTiBhcHBhcmVudGx5LWlkZW50aWNhbCBzdWJzXG4gICAgLy8gYmVpbmcgaW52YWxpZGF0ZWQsIHdlIHdpbGwgcmVxdWlyZSBOIG1hdGNoaW5nIHN1YnNjcmliZSBjYWxscyB0byBrZWVwXG4gICAgLy8gdGhlbSBhbGwgYWN0aXZlLlxuICAgIGNvbnN0IGV4aXN0aW5nID0gT2JqZWN0LnZhbHVlcyhzZWxmLl9zdWJzY3JpcHRpb25zKS5maW5kKFxuICAgICAgc3ViID0+IChzdWIuaW5hY3RpdmUgJiYgc3ViLm5hbWUgPT09IG5hbWUgJiYgRUpTT04uZXF1YWxzKHN1Yi5wYXJhbXMsIHBhcmFtcykpXG4gICAgKTtcblxuICAgIGxldCBpZDtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlkID0gZXhpc3RpbmcuaWQ7XG4gICAgICBleGlzdGluZy5pbmFjdGl2ZSA9IGZhbHNlOyAvLyByZWFjdGl2YXRlXG5cbiAgICAgIGlmIChjYWxsYmFja3Mub25SZWFkeSkge1xuICAgICAgICAvLyBJZiB0aGUgc3ViIGlzIG5vdCBhbHJlYWR5IHJlYWR5LCByZXBsYWNlIGFueSByZWFkeSBjYWxsYmFjayB3aXRoIHRoZVxuICAgICAgICAvLyBvbmUgcHJvdmlkZWQgbm93LiAoSXQncyBub3QgcmVhbGx5IGNsZWFyIHdoYXQgdXNlcnMgd291bGQgZXhwZWN0IGZvclxuICAgICAgICAvLyBhbiBvblJlYWR5IGNhbGxiYWNrIGluc2lkZSBhbiBhdXRvcnVuOyB0aGUgc2VtYW50aWNzIHdlIHByb3ZpZGUgaXNcbiAgICAgICAgLy8gdGhhdCBhdCB0aGUgdGltZSB0aGUgc3ViIGZpcnN0IGJlY29tZXMgcmVhZHksIHdlIGNhbGwgdGhlIGxhc3RcbiAgICAgICAgLy8gb25SZWFkeSBjYWxsYmFjayBwcm92aWRlZCwgaWYgYW55LilcbiAgICAgICAgLy8gSWYgdGhlIHN1YiBpcyBhbHJlYWR5IHJlYWR5LCBydW4gdGhlIHJlYWR5IGNhbGxiYWNrIHJpZ2h0IGF3YXkuXG4gICAgICAgIC8vIEl0IHNlZW1zIHRoYXQgdXNlcnMgd291bGQgZXhwZWN0IGFuIG9uUmVhZHkgY2FsbGJhY2sgaW5zaWRlIGFuXG4gICAgICAgIC8vIGF1dG9ydW4gdG8gdHJpZ2dlciBvbmNlIHRoZSBzdWIgZmlyc3QgYmVjb21lcyByZWFkeSBhbmQgYWxzb1xuICAgICAgICAvLyB3aGVuIHJlLXN1YnMgaGFwcGVucy5cbiAgICAgICAgaWYgKGV4aXN0aW5nLnJlYWR5KSB7XG4gICAgICAgICAgY2FsbGJhY2tzLm9uUmVhZHkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleGlzdGluZy5yZWFkeUNhbGxiYWNrID0gY2FsbGJhY2tzLm9uUmVhZHk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjEgd2UgdXNlZCB0byBoYXZlIG9uRXJyb3IgYnV0IG5vdyB3ZSBjYWxsXG4gICAgICAvLyBvblN0b3Agd2l0aCBhbiBvcHRpb25hbCBlcnJvciBhcmd1bWVudFxuICAgICAgaWYgKGNhbGxiYWNrcy5vbkVycm9yKSB7XG4gICAgICAgIC8vIFJlcGxhY2UgZXhpc3RpbmcgY2FsbGJhY2sgaWYgYW55LCBzbyB0aGF0IGVycm9ycyBhcmVuJ3RcbiAgICAgICAgLy8gZG91YmxlLXJlcG9ydGVkLlxuICAgICAgICBleGlzdGluZy5lcnJvckNhbGxiYWNrID0gY2FsbGJhY2tzLm9uRXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGlmIChjYWxsYmFja3Mub25TdG9wKSB7XG4gICAgICAgIGV4aXN0aW5nLnN0b3BDYWxsYmFjayA9IGNhbGxiYWNrcy5vblN0b3A7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5ldyBzdWIhIEdlbmVyYXRlIGFuIGlkLCBzYXZlIGl0IGxvY2FsbHksIGFuZCBzZW5kIG1lc3NhZ2UuXG4gICAgICBpZCA9IFJhbmRvbS5pZCgpO1xuICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tpZF0gPSB7XG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgcGFyYW1zOiBFSlNPTi5jbG9uZShwYXJhbXMpLFxuICAgICAgICBpbmFjdGl2ZTogZmFsc2UsXG4gICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgcmVhZHlEZXBzOiBuZXcgVHJhY2tlci5EZXBlbmRlbmN5KCksXG4gICAgICAgIHJlYWR5Q2FsbGJhY2s6IGNhbGxiYWNrcy5vblJlYWR5LFxuICAgICAgICAvLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSAjZXJyb3JDYWxsYmFja1xuICAgICAgICBlcnJvckNhbGxiYWNrOiBjYWxsYmFja3Mub25FcnJvcixcbiAgICAgICAgc3RvcENhbGxiYWNrOiBjYWxsYmFja3Mub25TdG9wLFxuICAgICAgICBjb25uZWN0aW9uOiBzZWxmLFxuICAgICAgICByZW1vdmUoKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuY29ubmVjdGlvbi5fc3Vic2NyaXB0aW9uc1t0aGlzLmlkXTtcbiAgICAgICAgICB0aGlzLnJlYWR5ICYmIHRoaXMucmVhZHlEZXBzLmNoYW5nZWQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3RvcCgpIHtcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24uX3NlbmRRdWV1ZWQoeyBtc2c6ICd1bnN1YicsIGlkOiBpZCB9KTtcbiAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrcy5vblN0b3ApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5vblN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzZWxmLl9zZW5kKHsgbXNnOiAnc3ViJywgaWQ6IGlkLCBuYW1lOiBuYW1lLCBwYXJhbXM6IHBhcmFtcyB9KTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gYSBoYW5kbGUgdG8gdGhlIGFwcGxpY2F0aW9uLlxuICAgIGNvbnN0IGhhbmRsZSA9IHtcbiAgICAgIHN0b3AoKSB7XG4gICAgICAgIGlmICghIGhhc093bi5jYWxsKHNlbGYuX3N1YnNjcmlwdGlvbnMsIGlkKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLl9zdWJzY3JpcHRpb25zW2lkXS5zdG9wKCk7XG4gICAgICB9LFxuICAgICAgcmVhZHkoKSB7XG4gICAgICAgIC8vIHJldHVybiBmYWxzZSBpZiB3ZSd2ZSB1bnN1YnNjcmliZWQuXG4gICAgICAgIGlmICghaGFzT3duLmNhbGwoc2VsZi5fc3Vic2NyaXB0aW9ucywgaWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IHNlbGYuX3N1YnNjcmlwdGlvbnNbaWRdO1xuICAgICAgICByZWNvcmQucmVhZHlEZXBzLmRlcGVuZCgpO1xuICAgICAgICByZXR1cm4gcmVjb3JkLnJlYWR5O1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmlwdGlvbklkOiBpZFxuICAgIH07XG5cbiAgICBpZiAoVHJhY2tlci5hY3RpdmUpIHtcbiAgICAgIC8vIFdlJ3JlIGluIGEgcmVhY3RpdmUgY29tcHV0YXRpb24sIHNvIHdlJ2QgbGlrZSB0byB1bnN1YnNjcmliZSB3aGVuIHRoZVxuICAgICAgLy8gY29tcHV0YXRpb24gaXMgaW52YWxpZGF0ZWQuLi4gYnV0IG5vdCBpZiB0aGUgcmVydW4ganVzdCByZS1zdWJzY3JpYmVzXG4gICAgICAvLyB0byB0aGUgc2FtZSBzdWJzY3JpcHRpb24hICBXaGVuIGEgcmVydW4gaGFwcGVucywgd2UgdXNlIG9uSW52YWxpZGF0ZVxuICAgICAgLy8gYXMgYSBjaGFuZ2UgdG8gbWFyayB0aGUgc3Vic2NyaXB0aW9uIFwiaW5hY3RpdmVcIiBzbyB0aGF0IGl0IGNhblxuICAgICAgLy8gYmUgcmV1c2VkIGZyb20gdGhlIHJlcnVuLiAgSWYgaXQgaXNuJ3QgcmV1c2VkLCBpdCdzIGtpbGxlZCBmcm9tXG4gICAgICAvLyBhbiBhZnRlckZsdXNoLlxuICAgICAgVHJhY2tlci5vbkludmFsaWRhdGUoKGMpID0+IHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKHNlbGYuX3N1YnNjcmlwdGlvbnMsIGlkKSkge1xuICAgICAgICAgIHNlbGYuX3N1YnNjcmlwdGlvbnNbaWRdLmluYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIFRyYWNrZXIuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bi5jYWxsKHNlbGYuX3N1YnNjcmlwdGlvbnMsIGlkKSAmJlxuICAgICAgICAgICAgICBzZWxmLl9zdWJzY3JpcHRpb25zW2lkXS5pbmFjdGl2ZSkge1xuICAgICAgICAgICAgaGFuZGxlLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBUZWxscyBpZiB0aGUgbWV0aG9kIGNhbGwgY2FtZSBmcm9tIGEgY2FsbCBvciBhIGNhbGxBc3luYy5cbiAgICogQGFsaWFzIE1ldGVvci5pc0FzeW5jQ2FsbFxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICovXG4gIGlzQXN5bmNDYWxsKCl7XG4gICAgcmV0dXJuIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX2lzQ2FsbEFzeW5jTWV0aG9kUnVubmluZygpXG4gIH1cbiAgbWV0aG9kcyhtZXRob2RzKSB7XG4gICAgT2JqZWN0LmVudHJpZXMobWV0aG9kcykuZm9yRWFjaCgoW25hbWUsIGZ1bmNdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGZ1bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kICdcIiArIG5hbWUgKyBcIicgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX21ldGhvZEhhbmRsZXJzW25hbWVdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbWV0aG9kIG5hbWVkICdcIiArIG5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWZpbmVkXCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbWV0aG9kSGFuZGxlcnNbbmFtZV0gPSBmdW5jO1xuICAgIH0pO1xuICB9XG5cbiAgX2dldElzU2ltdWxhdGlvbih7aXNGcm9tQ2FsbEFzeW5jLCBhbHJlYWR5SW5TaW11bGF0aW9ufSkge1xuICAgIGlmICghaXNGcm9tQ2FsbEFzeW5jKSB7XG4gICAgICByZXR1cm4gYWxyZWFkeUluU2ltdWxhdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIGFscmVhZHlJblNpbXVsYXRpb24gJiYgRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5faXNDYWxsQXN5bmNNZXRob2RSdW5uaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3IuY2FsbFxuICAgKiBAc3VtbWFyeSBJbnZva2VzIGEgbWV0aG9kIHdpdGggYSBzeW5jIHN0dWIsIHBhc3NpbmcgYW55IG51bWJlciBvZiBhcmd1bWVudHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBOYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAgICogQHBhcmFtIHtFSlNPTmFibGV9IFthcmcxLGFyZzIuLi5dIE9wdGlvbmFsIG1ldGhvZCBhcmd1bWVudHNcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2FzeW5jQ2FsbGJhY2tdIE9wdGlvbmFsIGNhbGxiYWNrLCB3aGljaCBpcyBjYWxsZWQgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZXJyb3Igb3IgcmVzdWx0IGFmdGVyIHRoZSBtZXRob2QgaXMgY29tcGxldGUuIElmIG5vdCBwcm92aWRlZCwgdGhlIG1ldGhvZCBydW5zIHN5bmNocm9ub3VzbHkgaWYgcG9zc2libGUgKHNlZSBiZWxvdykuXG4gICAqL1xuICBjYWxsKG5hbWUgLyogLi4gW2FyZ3VtZW50c10gLi4gY2FsbGJhY2sgKi8pIHtcbiAgICAvLyBpZiBpdCdzIGEgZnVuY3Rpb24sIHRoZSBsYXN0IGFyZ3VtZW50IGlzIHRoZSByZXN1bHQgY2FsbGJhY2ssXG4gICAgLy8gbm90IGEgcGFyYW1ldGVyIHRvIHRoZSByZW1vdGUgbWV0aG9kLlxuICAgIGNvbnN0IGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGV0IGNhbGxiYWNrO1xuICAgIGlmIChhcmdzLmxlbmd0aCAmJiB0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFwcGx5KG5hbWUsIGFyZ3MsIGNhbGxiYWNrKTtcbiAgfVxuICAvKipcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3IuY2FsbEFzeW5jXG4gICAqIEBzdW1tYXJ5IEludm9rZXMgYSBtZXRob2Qgd2l0aCBhbiBhc3luYyBzdHViLCBwYXNzaW5nIGFueSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gICAqIEBwYXJhbSB7RUpTT05hYmxlfSBbYXJnMSxhcmcyLi4uXSBPcHRpb25hbCBtZXRob2QgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgY2FsbEFzeW5jKG5hbWUgLyogLi4gW2FyZ3VtZW50c10gLi4gKi8pIHtcbiAgICBjb25zdCBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChhcmdzLmxlbmd0aCAmJiB0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTWV0ZW9yLmNhbGxBc3luYygpIGRvZXMgbm90IGFjY2VwdCBhIGNhbGxiYWNrLiBZb3Ugc2hvdWxkICdhd2FpdCcgdGhlIHJlc3VsdCwgb3IgdXNlIC50aGVuKCkuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXBwbHlBc3luYyhuYW1lLCBhcmdzLCB7IHJldHVyblNlcnZlclJlc3VsdFByb21pc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3IuYXBwbHlcbiAgICogQHN1bW1hcnkgSW52b2tlIGEgbWV0aG9kIHBhc3NpbmcgYW4gYXJyYXkgb2YgYXJndW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gICAqIEBwYXJhbSB7RUpTT05hYmxlW119IGFyZ3MgTWV0aG9kIGFyZ3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy53YWl0IChDbGllbnQgb25seSkgSWYgdHJ1ZSwgZG9uJ3Qgc2VuZCB0aGlzIG1ldGhvZCB1bnRpbCBhbGwgcHJldmlvdXMgbWV0aG9kIGNhbGxzIGhhdmUgY29tcGxldGVkLCBhbmQgZG9uJ3Qgc2VuZCBhbnkgc3Vic2VxdWVudCBtZXRob2QgY2FsbHMgdW50aWwgdGhpcyBvbmUgaXMgY29tcGxldGVkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLm9uUmVzdWx0UmVjZWl2ZWQgKENsaWVudCBvbmx5KSBUaGlzIGNhbGxiYWNrIGlzIGludm9rZWQgd2l0aCB0aGUgZXJyb3Igb3IgcmVzdWx0IG9mIHRoZSBtZXRob2QgKGp1c3QgbGlrZSBgYXN5bmNDYWxsYmFja2ApIGFzIHNvb24gYXMgdGhlIGVycm9yIG9yIHJlc3VsdCBpcyBhdmFpbGFibGUuIFRoZSBsb2NhbCBjYWNoZSBtYXkgbm90IHlldCByZWZsZWN0IHRoZSB3cml0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBtZXRob2QuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5ub1JldHJ5IChDbGllbnQgb25seSkgaWYgdHJ1ZSwgZG9uJ3Qgc2VuZCB0aGlzIG1ldGhvZCBhZ2FpbiBvbiByZWxvYWQsIHNpbXBseSBjYWxsIHRoZSBjYWxsYmFjayBhbiBlcnJvciB3aXRoIHRoZSBlcnJvciBjb2RlICdpbnZvY2F0aW9uLWZhaWxlZCcuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy50aHJvd1N0dWJFeGNlcHRpb25zIChDbGllbnQgb25seSkgSWYgdHJ1ZSwgZXhjZXB0aW9ucyB0aHJvd24gYnkgbWV0aG9kIHN0dWJzIHdpbGwgYmUgdGhyb3duIGluc3RlYWQgb2YgbG9nZ2VkLCBhbmQgdGhlIG1ldGhvZCB3aWxsIG5vdCBiZSBpbnZva2VkIG9uIHRoZSBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5yZXR1cm5TdHViVmFsdWUgKENsaWVudCBvbmx5KSBJZiB0cnVlIHRoZW4gaW4gY2FzZXMgd2hlcmUgd2Ugd291bGQgaGF2ZSBvdGhlcndpc2UgZGlzY2FyZGVkIHRoZSBzdHViJ3MgcmV0dXJuIHZhbHVlIGFuZCByZXR1cm5lZCB1bmRlZmluZWQsIGluc3RlYWQgd2UgZ28gYWhlYWQgYW5kIHJldHVybiBpdC4gU3BlY2lmaWNhbGx5LCB0aGlzIGlzIGFueSB0aW1lIG90aGVyIHRoYW4gd2hlbiAoYSkgd2UgYXJlIGFscmVhZHkgaW5zaWRlIGEgc3R1YiBvciAoYikgd2UgYXJlIGluIE5vZGUgYW5kIG5vIGNhbGxiYWNrIHdhcyBwcm92aWRlZC4gQ3VycmVudGx5IHdlIHJlcXVpcmUgdGhpcyBmbGFnIHRvIGJlIGV4cGxpY2l0bHkgcGFzc2VkIHRvIHJlZHVjZSB0aGUgbGlrZWxpaG9vZCB0aGF0IHN0dWIgcmV0dXJuIHZhbHVlcyB3aWxsIGJlIGNvbmZ1c2VkIHdpdGggc2VydmVyIHJldHVybiB2YWx1ZXM7IHdlIG1heSBpbXByb3ZlIHRoaXMgaW4gZnV0dXJlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbYXN5bmNDYWxsYmFja10gT3B0aW9uYWwgY2FsbGJhY2s7IHNhbWUgc2VtYW50aWNzIGFzIGluIFtgTWV0ZW9yLmNhbGxgXSgjbWV0ZW9yX2NhbGwpLlxuICAgKi9cbiAgYXBwbHkobmFtZSwgYXJncywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCB7IHN0dWJJbnZvY2F0aW9uLCBpbnZvY2F0aW9uLCAuLi5zdHViT3B0aW9ucyB9ID0gdGhpcy5fc3R1YkNhbGwobmFtZSwgRUpTT04uY2xvbmUoYXJncykpO1xuXG4gICAgaWYgKHN0dWJPcHRpb25zLmhhc1N0dWIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuX2dldElzU2ltdWxhdGlvbih7XG4gICAgICAgICAgYWxyZWFkeUluU2ltdWxhdGlvbjogc3R1Yk9wdGlvbnMuYWxyZWFkeUluU2ltdWxhdGlvbixcbiAgICAgICAgICBpc0Zyb21DYWxsQXN5bmM6IHN0dWJPcHRpb25zLmlzRnJvbUNhbGxBc3luYyxcbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9zYXZlT3JpZ2luYWxzKCk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBzdHViT3B0aW9ucy5zdHViUmV0dXJuVmFsdWUgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uXG4gICAgICAgICAgLndpdGhWYWx1ZShpbnZvY2F0aW9uLCBzdHViSW52b2NhdGlvbik7XG4gICAgICAgIGlmIChNZXRlb3IuX2lzUHJvbWlzZShzdHViT3B0aW9ucy5zdHViUmV0dXJuVmFsdWUpKSB7XG4gICAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICAgICAgICAgIGBNZXRob2QgJHtuYW1lfTogQ2FsbGluZyBhIG1ldGhvZCB0aGF0IGhhcyBhbiBhc3luYyBtZXRob2Qgc3R1YiB3aXRoIGNhbGwvYXBwbHkgY2FuIGxlYWQgdG8gdW5leHBlY3RlZCBiZWhhdmlvcnMuIFVzZSBjYWxsQXN5bmMvYXBwbHlBc3luYyBpbnN0ZWFkLmBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0dWJPcHRpb25zLmV4Y2VwdGlvbiA9IGU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hcHBseShuYW1lLCBzdHViT3B0aW9ucywgYXJncywgb3B0aW9ucywgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAYWxpYXMgTWV0ZW9yLmFwcGx5QXN5bmNcbiAgICogQHN1bW1hcnkgSW52b2tlIGEgbWV0aG9kIHBhc3NpbmcgYW4gYXJyYXkgb2YgYXJndW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gICAqIEBwYXJhbSB7RUpTT05hYmxlW119IGFyZ3MgTWV0aG9kIGFyZ3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy53YWl0IChDbGllbnQgb25seSkgSWYgdHJ1ZSwgZG9uJ3Qgc2VuZCB0aGlzIG1ldGhvZCB1bnRpbCBhbGwgcHJldmlvdXMgbWV0aG9kIGNhbGxzIGhhdmUgY29tcGxldGVkLCBhbmQgZG9uJ3Qgc2VuZCBhbnkgc3Vic2VxdWVudCBtZXRob2QgY2FsbHMgdW50aWwgdGhpcyBvbmUgaXMgY29tcGxldGVkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLm9uUmVzdWx0UmVjZWl2ZWQgKENsaWVudCBvbmx5KSBUaGlzIGNhbGxiYWNrIGlzIGludm9rZWQgd2l0aCB0aGUgZXJyb3Igb3IgcmVzdWx0IG9mIHRoZSBtZXRob2QgKGp1c3QgbGlrZSBgYXN5bmNDYWxsYmFja2ApIGFzIHNvb24gYXMgdGhlIGVycm9yIG9yIHJlc3VsdCBpcyBhdmFpbGFibGUuIFRoZSBsb2NhbCBjYWNoZSBtYXkgbm90IHlldCByZWZsZWN0IHRoZSB3cml0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBtZXRob2QuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5ub1JldHJ5IChDbGllbnQgb25seSkgaWYgdHJ1ZSwgZG9uJ3Qgc2VuZCB0aGlzIG1ldGhvZCBhZ2FpbiBvbiByZWxvYWQsIHNpbXBseSBjYWxsIHRoZSBjYWxsYmFjayBhbiBlcnJvciB3aXRoIHRoZSBlcnJvciBjb2RlICdpbnZvY2F0aW9uLWZhaWxlZCcuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy50aHJvd1N0dWJFeGNlcHRpb25zIChDbGllbnQgb25seSkgSWYgdHJ1ZSwgZXhjZXB0aW9ucyB0aHJvd24gYnkgbWV0aG9kIHN0dWJzIHdpbGwgYmUgdGhyb3duIGluc3RlYWQgb2YgbG9nZ2VkLCBhbmQgdGhlIG1ldGhvZCB3aWxsIG5vdCBiZSBpbnZva2VkIG9uIHRoZSBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5yZXR1cm5TdHViVmFsdWUgKENsaWVudCBvbmx5KSBJZiB0cnVlIHRoZW4gaW4gY2FzZXMgd2hlcmUgd2Ugd291bGQgaGF2ZSBvdGhlcndpc2UgZGlzY2FyZGVkIHRoZSBzdHViJ3MgcmV0dXJuIHZhbHVlIGFuZCByZXR1cm5lZCB1bmRlZmluZWQsIGluc3RlYWQgd2UgZ28gYWhlYWQgYW5kIHJldHVybiBpdC4gU3BlY2lmaWNhbGx5LCB0aGlzIGlzIGFueSB0aW1lIG90aGVyIHRoYW4gd2hlbiAoYSkgd2UgYXJlIGFscmVhZHkgaW5zaWRlIGEgc3R1YiBvciAoYikgd2UgYXJlIGluIE5vZGUgYW5kIG5vIGNhbGxiYWNrIHdhcyBwcm92aWRlZC4gQ3VycmVudGx5IHdlIHJlcXVpcmUgdGhpcyBmbGFnIHRvIGJlIGV4cGxpY2l0bHkgcGFzc2VkIHRvIHJlZHVjZSB0aGUgbGlrZWxpaG9vZCB0aGF0IHN0dWIgcmV0dXJuIHZhbHVlcyB3aWxsIGJlIGNvbmZ1c2VkIHdpdGggc2VydmVyIHJldHVybiB2YWx1ZXM7IHdlIG1heSBpbXByb3ZlIHRoaXMgaW4gZnV0dXJlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmV0dXJuU2VydmVyUmVzdWx0UHJvbWlzZSAoQ2xpZW50IG9ubHkpIElmIHRydWUsIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IGFwcGx5QXN5bmMgd2lsbCByZXNvbHZlIHRvIHRoZSBzZXJ2ZXIncyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIHRoZSBzdHViJ3MgcmV0dXJuIHZhbHVlLiBUaGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGVuc3VyZSB0aGF0IHRoZSBzZXJ2ZXIncyByZXR1cm4gdmFsdWUgaXMgdXNlZCwgZXZlbiBpZiB0aGUgc3R1YiByZXR1cm5zIGEgcHJvbWlzZS4gVGhlIHNhbWUgYmVoYXZpb3IgYXMgYGNhbGxBc3luY2AuXG4gICAqL1xuICBhcHBseUFzeW5jKG5hbWUsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrID0gbnVsbCkge1xuICAgIGNvbnN0IHN0dWJQcm9taXNlID0gdGhpcy5fYXBwbHlBc3luY1N0dWJJbnZvY2F0aW9uKG5hbWUsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2FwcGx5QXN5bmMoe1xuICAgICAgbmFtZSxcbiAgICAgIGFyZ3MsXG4gICAgICBvcHRpb25zLFxuICAgICAgY2FsbGJhY2ssXG4gICAgICBzdHViUHJvbWlzZSxcbiAgICB9KTtcbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICAvLyBvbmx5IHJldHVybiB0aGUgc3R1YlJldHVyblZhbHVlXG4gICAgICBwcm9taXNlLnN0dWJQcm9taXNlID0gc3R1YlByb21pc2UudGhlbihvID0+IHtcbiAgICAgICAgaWYgKG8uZXhjZXB0aW9uKSB7XG4gICAgICAgICAgdGhyb3cgby5leGNlcHRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG8uc3R1YlJldHVyblZhbHVlO1xuICAgICAgfSk7XG4gICAgICAvLyB0aGlzIGF2b2lkcyBhdHRyaWJ1dGUgcmVjdXJzaW9uXG4gICAgICBwcm9taXNlLnNlcnZlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICBwcm9taXNlLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KSxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG4gIGFzeW5jIF9hcHBseUFzeW5jU3R1Ykludm9jYXRpb24obmFtZSwgYXJncywgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgc3R1Ykludm9jYXRpb24sIGludm9jYXRpb24sIC4uLnN0dWJPcHRpb25zIH0gPSB0aGlzLl9zdHViQ2FsbChuYW1lLCBFSlNPTi5jbG9uZShhcmdzKSwgb3B0aW9ucyk7XG4gICAgaWYgKHN0dWJPcHRpb25zLmhhc1N0dWIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuX2dldElzU2ltdWxhdGlvbih7XG4gICAgICAgICAgYWxyZWFkeUluU2ltdWxhdGlvbjogc3R1Yk9wdGlvbnMuYWxyZWFkeUluU2ltdWxhdGlvbixcbiAgICAgICAgICBpc0Zyb21DYWxsQXN5bmM6IHN0dWJPcHRpb25zLmlzRnJvbUNhbGxBc3luYyxcbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9zYXZlT3JpZ2luYWxzKCk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBUaGUgY29kZSBiZWxvdyBmb2xsb3dzIHRoZSBzYW1lIGxvZ2ljIGFzIHRoZSBmdW5jdGlvbiB3aXRoVmFsdWVzKCkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEJ1dCBhcyB0aGUgTWV0ZW9yIHBhY2thZ2UgaXMgbm90IGNvbXBpbGVkIGJ5IGVjbWFzY3JpcHQsIGl0IGlzIHVuYWJsZSB0byB1c2UgbmV3ZXIgc3ludGF4IGluIHRoZSBicm93c2VyLFxuICAgICAgICAgKiBzdWNoIGFzLCB0aGUgYXN5bmMvYXdhaXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIFNvLCB0byBrZWVwIHN1cHBvcnRpbmcgb2xkIGJyb3dzZXJzLCBsaWtlIElFIDExLCB3ZSdyZSBjcmVhdGluZyB0aGUgbG9naWMgb25lIGxldmVsIGFib3ZlLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY3VycmVudENvbnRleHQgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLl9zZXROZXdDb250ZXh0QW5kR2V0Q3VycmVudChcbiAgICAgICAgICBpbnZvY2F0aW9uXG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3R1Yk9wdGlvbnMuc3R1YlJldHVyblZhbHVlID0gYXdhaXQgc3R1Ykludm9jYXRpb24oKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHN0dWJPcHRpb25zLmV4Y2VwdGlvbiA9IGU7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5fc2V0KGN1cnJlbnRDb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdHViT3B0aW9ucy5leGNlcHRpb24gPSBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3R1Yk9wdGlvbnM7XG4gIH1cbiAgYXN5bmMgX2FwcGx5QXN5bmMoeyBuYW1lLCBhcmdzLCBvcHRpb25zLCBjYWxsYmFjaywgc3R1YlByb21pc2UgfSkge1xuICAgIGNvbnN0IHN0dWJPcHRpb25zID0gYXdhaXQgc3R1YlByb21pc2U7XG4gICAgcmV0dXJuIHRoaXMuX2FwcGx5KG5hbWUsIHN0dWJPcHRpb25zLCBhcmdzLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gIH1cblxuICBfYXBwbHkobmFtZSwgc3R1YkNhbGxWYWx1ZSwgYXJncywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIFdlIHdlcmUgcGFzc2VkIDMgYXJndW1lbnRzLiBUaGV5IG1heSBiZSBlaXRoZXIgKG5hbWUsIGFyZ3MsIG9wdGlvbnMpXG4gICAgLy8gb3IgKG5hbWUsIGFyZ3MsIGNhbGxiYWNrKVxuICAgIGlmICghY2FsbGJhY2sgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAvLyBYWFggd291bGQgaXQgYmUgYmV0dGVyIGZvcm0gdG8gZG8gdGhlIGJpbmRpbmcgaW4gc3RyZWFtLm9uLFxuICAgICAgLy8gb3IgY2FsbGVyLCBpbnN0ZWFkIG9mIGhlcmU/XG4gICAgICAvLyBYWFggaW1wcm92ZSBlcnJvciBtZXNzYWdlIChhbmQgaG93IHdlIHJlcG9ydCBpdClcbiAgICAgIGNhbGxiYWNrID0gTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgIFwiZGVsaXZlcmluZyByZXN1bHQgb2YgaW52b2tpbmcgJ1wiICsgbmFtZSArIFwiJ1wiXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCB7XG4gICAgICBoYXNTdHViLFxuICAgICAgZXhjZXB0aW9uLFxuICAgICAgc3R1YlJldHVyblZhbHVlLFxuICAgICAgYWxyZWFkeUluU2ltdWxhdGlvbixcbiAgICAgIHJhbmRvbVNlZWQsXG4gICAgfSA9IHN0dWJDYWxsVmFsdWU7XG5cbiAgICAvLyBLZWVwIG91ciBhcmdzIHNhZmUgZnJvbSBtdXRhdGlvbiAoZWcgaWYgd2UgZG9uJ3Qgc2VuZCB0aGUgbWVzc2FnZSBmb3IgYVxuICAgIC8vIHdoaWxlIGJlY2F1c2Ugb2YgYSB3YWl0IG1ldGhvZCkuXG4gICAgYXJncyA9IEVKU09OLmNsb25lKGFyZ3MpO1xuICAgIC8vIElmIHdlJ3JlIGluIGEgc2ltdWxhdGlvbiwgc3RvcCBhbmQgcmV0dXJuIHRoZSByZXN1bHQgd2UgaGF2ZSxcbiAgICAvLyByYXRoZXIgdGhhbiBnb2luZyBvbiB0byBkbyBhbiBSUEMuIElmIHRoZXJlIHdhcyBubyBzdHViLFxuICAgIC8vIHdlJ2xsIGVuZCB1cCByZXR1cm5pbmcgdW5kZWZpbmVkLlxuICAgIGlmIChcbiAgICAgIHRoaXMuX2dldElzU2ltdWxhdGlvbih7XG4gICAgICAgIGFscmVhZHlJblNpbXVsYXRpb24sXG4gICAgICAgIGlzRnJvbUNhbGxBc3luYzogc3R1YkNhbGxWYWx1ZS5pc0Zyb21DYWxsQXN5bmMsXG4gICAgICB9KVxuICAgICkge1xuICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKGV4Y2VwdGlvbiwgc3R1YlJldHVyblZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChleGNlcHRpb24pIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgICAgcmVzdWx0ID0gc3R1YlJldHVyblZhbHVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0aW9ucy5fcmV0dXJuTWV0aG9kSW52b2tlciA/IHsgcmVzdWx0IH0gOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gV2Ugb25seSBjcmVhdGUgdGhlIG1ldGhvZElkIGhlcmUgYmVjYXVzZSB3ZSBkb24ndCBhY3R1YWxseSBuZWVkIG9uZSBpZlxuICAgIC8vIHdlJ3JlIGFscmVhZHkgaW4gYSBzaW11bGF0aW9uXG4gICAgY29uc3QgbWV0aG9kSWQgPSAnJyArIHNlbGYuX25leHRNZXRob2RJZCsrO1xuICAgIGlmIChoYXNTdHViKSB7XG4gICAgICBzZWxmLl9yZXRyaWV2ZUFuZFN0b3JlT3JpZ2luYWxzKG1ldGhvZElkKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB0aGUgRERQIG1lc3NhZ2UgZm9yIHRoZSBtZXRob2QgY2FsbC4gTm90ZSB0aGF0IG9uIHRoZSBjbGllbnQsXG4gICAgLy8gaXQgaXMgaW1wb3J0YW50IHRoYXQgdGhlIHN0dWIgaGF2ZSBmaW5pc2hlZCBiZWZvcmUgd2Ugc2VuZCB0aGUgUlBDLCBzb1xuICAgIC8vIHRoYXQgd2Uga25vdyB3ZSBoYXZlIGEgY29tcGxldGUgbGlzdCBvZiB3aGljaCBsb2NhbCBkb2N1bWVudHMgdGhlIHN0dWJcbiAgICAvLyB3cm90ZS5cbiAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgbXNnOiAnbWV0aG9kJyxcbiAgICAgIGlkOiBtZXRob2RJZCxcbiAgICAgIG1ldGhvZDogbmFtZSxcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH07XG5cbiAgICAvLyBJZiBhbiBleGNlcHRpb24gb2NjdXJyZWQgaW4gYSBzdHViLCBhbmQgd2UncmUgaWdub3JpbmcgaXRcbiAgICAvLyBiZWNhdXNlIHdlJ3JlIGRvaW5nIGFuIFJQQyBhbmQgd2FudCB0byB1c2Ugd2hhdCB0aGUgc2VydmVyXG4gICAgLy8gcmV0dXJucyBpbnN0ZWFkLCBsb2cgaXQgc28gdGhlIGRldmVsb3BlciBrbm93c1xuICAgIC8vICh1bmxlc3MgdGhleSBleHBsaWNpdGx5IGFzayB0byBzZWUgdGhlIGVycm9yKS5cbiAgICAvL1xuICAgIC8vIFRlc3RzIGNhbiBzZXQgdGhlICdfZXhwZWN0ZWRCeVRlc3QnIGZsYWcgb24gYW4gZXhjZXB0aW9uIHNvIGl0IHdvbid0XG4gICAgLy8gZ28gdG8gbG9nLlxuICAgIGlmIChleGNlcHRpb24pIHtcbiAgICAgIGlmIChvcHRpb25zLnRocm93U3R1YkV4Y2VwdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfSBlbHNlIGlmICghZXhjZXB0aW9uLl9leHBlY3RlZEJ5VGVzdCkge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFxuICAgICAgICAgIFwiRXhjZXB0aW9uIHdoaWxlIHNpbXVsYXRpbmcgdGhlIGVmZmVjdCBvZiBpbnZva2luZyAnXCIgKyBuYW1lICsgXCInXCIsXG4gICAgICAgICAgZXhjZXB0aW9uXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB3ZSdyZSBkZWZpbml0ZWx5IGRvaW5nIGFuIFJQQywgYW5kIHdlJ3JlIGdvaW5nIHRvXG4gICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgUlBDIHRvIHRoZSBjYWxsZXIuXG5cbiAgICAvLyBJZiB0aGUgY2FsbGVyIGRpZG4ndCBnaXZlIGEgY2FsbGJhY2ssIGRlY2lkZSB3aGF0IHRvIGRvLlxuICAgIGxldCBwcm9taXNlO1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGlmIChcbiAgICAgICAgTWV0ZW9yLmlzQ2xpZW50ICYmXG4gICAgICAgICFvcHRpb25zLnJldHVyblNlcnZlclJlc3VsdFByb21pc2UgJiZcbiAgICAgICAgKCFvcHRpb25zLmlzRnJvbUNhbGxBc3luYyB8fCBvcHRpb25zLnJldHVyblN0dWJWYWx1ZSlcbiAgICAgICkge1xuICAgICAgICBjYWxsYmFjayA9IChlcnIpID0+IHtcbiAgICAgICAgICBlcnIgJiYgTWV0ZW9yLl9kZWJ1ZyhcIkVycm9yIGludm9raW5nIE1ldGhvZCAnXCIgKyBuYW1lICsgXCInXCIsIGVycik7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrID0gKC4uLmFsbEFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBhcmdzID0gQXJyYXkuZnJvbShhbGxBcmdzKTtcbiAgICAgICAgICAgIGxldCBlcnIgPSBhcmdzLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKC4uLmFyZ3MpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJhbmRvbVNlZWQgb25seSBpZiB3ZSB1c2VkIGl0XG4gICAgaWYgKHJhbmRvbVNlZWQudmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UucmFuZG9tU2VlZCA9IHJhbmRvbVNlZWQudmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kSW52b2tlciA9IG5ldyBNZXRob2RJbnZva2VyKHtcbiAgICAgIG1ldGhvZElkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY29ubmVjdGlvbjogc2VsZixcbiAgICAgIG9uUmVzdWx0UmVjZWl2ZWQ6IG9wdGlvbnMub25SZXN1bHRSZWNlaXZlZCxcbiAgICAgIHdhaXQ6ICEhb3B0aW9ucy53YWl0LFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG5vUmV0cnk6ICEhb3B0aW9ucy5ub1JldHJ5XG4gICAgfSk7XG5cbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYgKHByb21pc2UpIHtcbiAgICAgIHJlc3VsdCA9IG9wdGlvbnMucmV0dXJuU3R1YlZhbHVlID8gcHJvbWlzZS50aGVuKCgpID0+IHN0dWJSZXR1cm5WYWx1ZSkgOiBwcm9taXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnJldHVyblN0dWJWYWx1ZSA/IHN0dWJSZXR1cm5WYWx1ZSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5fcmV0dXJuTWV0aG9kSW52b2tlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWV0aG9kSW52b2tlcixcbiAgICAgICAgcmVzdWx0LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzZWxmLl9hZGRPdXRzdGFuZGluZ01ldGhvZChtZXRob2RJbnZva2VyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgX3N0dWJDYWxsKG5hbWUsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBSdW4gdGhlIHN0dWIsIGlmIHdlIGhhdmUgb25lLiBUaGUgc3R1YiBpcyBzdXBwb3NlZCB0byBtYWtlIHNvbWVcbiAgICAvLyB0ZW1wb3Jhcnkgd3JpdGVzIHRvIHRoZSBkYXRhYmFzZSB0byBnaXZlIHRoZSB1c2VyIGEgc21vb3RoIGV4cGVyaWVuY2VcbiAgICAvLyB1bnRpbCB0aGUgYWN0dWFsIHJlc3VsdCBvZiBleGVjdXRpbmcgdGhlIG1ldGhvZCBjb21lcyBiYWNrIGZyb20gdGhlXG4gICAgLy8gc2VydmVyICh3aGVyZXVwb24gdGhlIHRlbXBvcmFyeSB3cml0ZXMgdG8gdGhlIGRhdGFiYXNlIHdpbGwgYmUgcmV2ZXJzZWRcbiAgICAvLyBkdXJpbmcgdGhlIGJlZ2luVXBkYXRlL2VuZFVwZGF0ZSBwcm9jZXNzLilcbiAgICAvL1xuICAgIC8vIE5vcm1hbGx5LCB3ZSBpZ25vcmUgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgc3R1YiAoZXZlbiBpZiBpdCBpcyBhblxuICAgIC8vIGV4Y2VwdGlvbiksIGluIGZhdm9yIG9mIHRoZSByZWFsIHJldHVybiB2YWx1ZSBmcm9tIHRoZSBzZXJ2ZXIuIFRoZVxuICAgIC8vIGV4Y2VwdGlvbiBpcyBpZiB0aGUgKmNhbGxlciogaXMgYSBzdHViLiBJbiB0aGF0IGNhc2UsIHdlJ3JlIG5vdCBnb2luZ1xuICAgIC8vIHRvIGRvIGEgUlBDLCBzbyB3ZSB1c2UgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgc3R1YiBhcyBvdXIgcmV0dXJuXG4gICAgLy8gdmFsdWUuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgZW5jbG9zaW5nID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKTtcbiAgICBjb25zdCBzdHViID0gc2VsZi5fbWV0aG9kSGFuZGxlcnNbbmFtZV07XG4gICAgY29uc3QgYWxyZWFkeUluU2ltdWxhdGlvbiA9IGVuY2xvc2luZz8uaXNTaW11bGF0aW9uO1xuICAgIGNvbnN0IGlzRnJvbUNhbGxBc3luYyA9IGVuY2xvc2luZz8uX2lzRnJvbUNhbGxBc3luYztcbiAgICBjb25zdCByYW5kb21TZWVkID0geyB2YWx1ZTogbnVsbH07XG5cbiAgICBjb25zdCBkZWZhdWx0UmV0dXJuID0ge1xuICAgICAgYWxyZWFkeUluU2ltdWxhdGlvbixcbiAgICAgIHJhbmRvbVNlZWQsXG4gICAgICBpc0Zyb21DYWxsQXN5bmMsXG4gICAgfTtcbiAgICBpZiAoIXN0dWIpIHtcbiAgICAgIHJldHVybiB7IC4uLmRlZmF1bHRSZXR1cm4sIGhhc1N0dWI6IGZhbHNlIH07XG4gICAgfVxuXG4gICAgLy8gTGF6aWx5IGdlbmVyYXRlIGEgcmFuZG9tU2VlZCwgb25seSBpZiBpdCBpcyByZXF1ZXN0ZWQgYnkgdGhlIHN0dWIuXG4gICAgLy8gVGhlIHJhbmRvbSBzdHJlYW1zIG9ubHkgaGF2ZSB1dGlsaXR5IGlmIHRoZXkncmUgdXNlZCBvbiBib3RoIHRoZSBjbGllbnRcbiAgICAvLyBhbmQgdGhlIHNlcnZlcjsgaWYgdGhlIGNsaWVudCBkb2Vzbid0IGdlbmVyYXRlIGFueSAncmFuZG9tJyB2YWx1ZXNcbiAgICAvLyB0aGVuIHdlIGRvbid0IGV4cGVjdCB0aGUgc2VydmVyIHRvIGdlbmVyYXRlIGFueSBlaXRoZXIuXG4gICAgLy8gTGVzcyBjb21tb25seSwgdGhlIHNlcnZlciBtYXkgcGVyZm9ybSBkaWZmZXJlbnQgYWN0aW9ucyBmcm9tIHRoZSBjbGllbnQsXG4gICAgLy8gYW5kIG1heSBpbiBmYWN0IGdlbmVyYXRlIHZhbHVlcyB3aGVyZSB0aGUgY2xpZW50IGRpZCBub3QsIGJ1dCB3ZSBkb24ndFxuICAgIC8vIGhhdmUgYW55IGNsaWVudC1zaWRlIHZhbHVlcyB0byBtYXRjaCwgc28gZXZlbiBoZXJlIHdlIG1heSBhcyB3ZWxsIGp1c3RcbiAgICAvLyB1c2UgYSByYW5kb20gc2VlZCBvbiB0aGUgc2VydmVyLiAgSW4gdGhhdCBjYXNlLCB3ZSBkb24ndCBwYXNzIHRoZVxuICAgIC8vIHJhbmRvbVNlZWQgdG8gc2F2ZSBiYW5kd2lkdGgsIGFuZCB3ZSBkb24ndCBldmVuIGdlbmVyYXRlIGl0IHRvIHNhdmUgYVxuICAgIC8vIGJpdCBvZiBDUFUgYW5kIHRvIGF2b2lkIGNvbnN1bWluZyBlbnRyb3B5LlxuXG4gICAgY29uc3QgcmFuZG9tU2VlZEdlbmVyYXRvciA9ICgpID0+IHtcbiAgICAgIGlmIChyYW5kb21TZWVkLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJhbmRvbVNlZWQudmFsdWUgPSBERFBDb21tb24ubWFrZVJwY1NlZWQoZW5jbG9zaW5nLCBuYW1lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByYW5kb21TZWVkLnZhbHVlO1xuICAgIH07XG5cbiAgICBjb25zdCBzZXRVc2VySWQgPSB1c2VySWQgPT4ge1xuICAgICAgc2VsZi5zZXRVc2VySWQodXNlcklkKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaW52b2NhdGlvbiA9IG5ldyBERFBDb21tb24uTWV0aG9kSW52b2NhdGlvbih7XG4gICAgICBuYW1lLFxuICAgICAgaXNTaW11bGF0aW9uOiB0cnVlLFxuICAgICAgdXNlcklkOiBzZWxmLnVzZXJJZCgpLFxuICAgICAgaXNGcm9tQ2FsbEFzeW5jOiBvcHRpb25zPy5pc0Zyb21DYWxsQXN5bmMsXG4gICAgICBzZXRVc2VySWQ6IHNldFVzZXJJZCxcbiAgICAgIHJhbmRvbVNlZWQoKSB7XG4gICAgICAgIHJldHVybiByYW5kb21TZWVkR2VuZXJhdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlIHRoYXQgdW5saWtlIGluIHRoZSBjb3JyZXNwb25kaW5nIHNlcnZlciBjb2RlLCB3ZSBuZXZlciBhdWRpdFxuICAgIC8vIHRoYXQgc3R1YnMgY2hlY2soKSB0aGVpciBhcmd1bWVudHMuXG4gICAgY29uc3Qgc3R1Ykludm9jYXRpb24gPSAoKSA9PiB7XG4gICAgICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgICAgICAvLyBCZWNhdXNlIHNhdmVPcmlnaW5hbHMgYW5kIHJldHJpZXZlT3JpZ2luYWxzIGFyZW4ndCByZWVudHJhbnQsXG4gICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgc3R1YnMgdG8geWllbGQuXG4gICAgICAgICAgcmV0dXJuIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKCgpID0+IHtcbiAgICAgICAgICAgIC8vIHJlLWNsb25lLCBzbyB0aGF0IHRoZSBzdHViIGNhbid0IGFmZmVjdCBvdXIgY2FsbGVyJ3MgdmFsdWVzXG4gICAgICAgICAgICByZXR1cm4gc3R1Yi5hcHBseShpbnZvY2F0aW9uLCBFSlNPTi5jbG9uZShhcmdzKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHN0dWIuYXBwbHkoaW52b2NhdGlvbiwgRUpTT04uY2xvbmUoYXJncykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4geyAuLi5kZWZhdWx0UmV0dXJuLCBoYXNTdHViOiB0cnVlLCBzdHViSW52b2NhdGlvbiwgaW52b2NhdGlvbiB9O1xuICB9XG5cbiAgLy8gQmVmb3JlIGNhbGxpbmcgYSBtZXRob2Qgc3R1YiwgcHJlcGFyZSBhbGwgc3RvcmVzIHRvIHRyYWNrIGNoYW5nZXMgYW5kIGFsbG93XG4gIC8vIF9yZXRyaWV2ZUFuZFN0b3JlT3JpZ2luYWxzIHRvIGdldCB0aGUgb3JpZ2luYWwgdmVyc2lvbnMgb2YgY2hhbmdlZFxuICAvLyBkb2N1bWVudHMuXG4gIF9zYXZlT3JpZ2luYWxzKCkge1xuICAgIGlmICghIHRoaXMuX3dhaXRpbmdGb3JRdWllc2NlbmNlKCkpIHtcbiAgICAgIHRoaXMuX2ZsdXNoQnVmZmVyZWRXcml0ZXMoKTtcbiAgICB9XG5cbiAgICBPYmplY3QudmFsdWVzKHRoaXMuX3N0b3JlcykuZm9yRWFjaCgoc3RvcmUpID0+IHtcbiAgICAgIHN0b3JlLnNhdmVPcmlnaW5hbHMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJldHJpZXZlcyB0aGUgb3JpZ2luYWwgdmVyc2lvbnMgb2YgYWxsIGRvY3VtZW50cyBtb2RpZmllZCBieSB0aGUgc3R1YiBmb3JcbiAgLy8gbWV0aG9kICdtZXRob2RJZCcgZnJvbSBhbGwgc3RvcmVzIGFuZCBzYXZlcyB0aGVtIHRvIF9zZXJ2ZXJEb2N1bWVudHMgKGtleWVkXG4gIC8vIGJ5IGRvY3VtZW50KSBhbmQgX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWIgKGtleWVkIGJ5IG1ldGhvZCBJRCkuXG4gIF9yZXRyaWV2ZUFuZFN0b3JlT3JpZ2luYWxzKG1ldGhvZElkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWJbbWV0aG9kSWRdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEdXBsaWNhdGUgbWV0aG9kSWQgaW4gX3JldHJpZXZlQW5kU3RvcmVPcmlnaW5hbHMnKTtcblxuICAgIGNvbnN0IGRvY3NXcml0dGVuID0gW107XG5cbiAgICBPYmplY3QuZW50cmllcyhzZWxmLl9zdG9yZXMpLmZvckVhY2goKFtjb2xsZWN0aW9uLCBzdG9yZV0pID0+IHtcbiAgICAgIGNvbnN0IG9yaWdpbmFscyA9IHN0b3JlLnJldHJpZXZlT3JpZ2luYWxzKCk7XG4gICAgICAvLyBub3QgYWxsIHN0b3JlcyBkZWZpbmUgcmV0cmlldmVPcmlnaW5hbHNcbiAgICAgIGlmICghIG9yaWdpbmFscykgcmV0dXJuO1xuICAgICAgb3JpZ2luYWxzLmZvckVhY2goKGRvYywgaWQpID0+IHtcbiAgICAgICAgZG9jc1dyaXR0ZW4ucHVzaCh7IGNvbGxlY3Rpb24sIGlkIH0pO1xuICAgICAgICBpZiAoISBoYXNPd24uY2FsbChzZWxmLl9zZXJ2ZXJEb2N1bWVudHMsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgc2VsZi5fc2VydmVyRG9jdW1lbnRzW2NvbGxlY3Rpb25dID0gbmV3IE1vbmdvSURNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZXJ2ZXJEb2MgPSBzZWxmLl9zZXJ2ZXJEb2N1bWVudHNbY29sbGVjdGlvbl0uc2V0RGVmYXVsdChcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChzZXJ2ZXJEb2Mud3JpdHRlbkJ5U3R1YnMpIHtcbiAgICAgICAgICAvLyBXZSdyZSBub3QgdGhlIGZpcnN0IHN0dWIgdG8gd3JpdGUgdGhpcyBkb2MuIEp1c3QgYWRkIG91ciBtZXRob2QgSURcbiAgICAgICAgICAvLyB0byB0aGUgcmVjb3JkLlxuICAgICAgICAgIHNlcnZlckRvYy53cml0dGVuQnlTdHVic1ttZXRob2RJZF0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZpcnN0IHN0dWIhIFNhdmUgdGhlIG9yaWdpbmFsIHZhbHVlIGFuZCBvdXIgbWV0aG9kIElELlxuICAgICAgICAgIHNlcnZlckRvYy5kb2N1bWVudCA9IGRvYztcbiAgICAgICAgICBzZXJ2ZXJEb2MuZmx1c2hDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgICBzZXJ2ZXJEb2Mud3JpdHRlbkJ5U3R1YnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHNlcnZlckRvYy53cml0dGVuQnlTdHVic1ttZXRob2RJZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAoISBpc0VtcHR5KGRvY3NXcml0dGVuKSkge1xuICAgICAgc2VsZi5fZG9jdW1lbnRzV3JpdHRlbkJ5U3R1YlttZXRob2RJZF0gPSBkb2NzV3JpdHRlbjtcbiAgICB9XG4gIH1cblxuICAvLyBUaGlzIGlzIHZlcnkgbXVjaCBhIHByaXZhdGUgZnVuY3Rpb24gd2UgdXNlIHRvIG1ha2UgdGhlIHRlc3RzXG4gIC8vIHRha2UgdXAgZmV3ZXIgc2VydmVyIHJlc291cmNlcyBhZnRlciB0aGV5IGNvbXBsZXRlLlxuICBfdW5zdWJzY3JpYmVBbGwoKSB7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9zdWJzY3JpcHRpb25zKS5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgIC8vIEF2b2lkIGtpbGxpbmcgdGhlIGF1dG91cGRhdGUgc3Vic2NyaXB0aW9uIHNvIHRoYXQgZGV2ZWxvcGVyc1xuICAgICAgLy8gc3RpbGwgZ2V0IGhvdCBjb2RlIHB1c2hlcyB3aGVuIHdyaXRpbmcgdGVzdHMuXG4gICAgICAvL1xuICAgICAgLy8gWFhYIGl0J3MgYSBoYWNrIHRvIGVuY29kZSBrbm93bGVkZ2UgYWJvdXQgYXV0b3VwZGF0ZSBoZXJlLFxuICAgICAgLy8gYnV0IGl0IGRvZXNuJ3Qgc2VlbSB3b3J0aCBpdCB5ZXQgdG8gaGF2ZSBhIHNwZWNpYWwgQVBJIGZvclxuICAgICAgLy8gc3Vic2NyaXB0aW9ucyB0byBwcmVzZXJ2ZSBhZnRlciB1bml0IHRlc3RzLlxuICAgICAgaWYgKHN1Yi5uYW1lICE9PSAnbWV0ZW9yX2F1dG91cGRhdGVfY2xpZW50VmVyc2lvbnMnKSB7XG4gICAgICAgIHN1Yi5zdG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBTZW5kcyB0aGUgRERQIHN0cmluZ2lmaWNhdGlvbiBvZiB0aGUgZ2l2ZW4gbWVzc2FnZSBvYmplY3RcbiAgX3NlbmQob2JqKSB7XG4gICAgdGhpcy5fc3RyZWFtLnNlbmQoRERQQ29tbW9uLnN0cmluZ2lmeUREUChvYmopKTtcbiAgfVxuXG4gIC8vIEFsd2F5cyBxdWV1ZXMgdGhlIGNhbGwgYmVmb3JlIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAgLy8gVXNlZCwgZm9yIGV4YW1wbGUsIG9uIHN1YnNjcmlwdGlvbi5baWRdLnN0b3AoKSB0byBtYWtlIHN1cmUgYSBcInN1YlwiIG1lc3NhZ2UgaXMgYWx3YXlzIGNhbGxlZCBiZWZvcmUgYW4gXCJ1bnN1YlwiIG1lc3NhZ2VcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzEzMjEyXG4gIC8vXG4gIC8vIFRoaXMgaXMgcGFydCBvZiB0aGUgYWN0dWFsIGZpeCBmb3IgdGhlIHJlc3QgY2hlY2s6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL3B1bGwvMTMyMzZcbiAgX3NlbmRRdWV1ZWQob2JqKSB7XG4gICAgdGhpcy5fc2VuZChvYmosIHRydWUpO1xuICB9XG5cbiAgLy8gV2UgZGV0ZWN0ZWQgdmlhIEREUC1sZXZlbCBoZWFydGJlYXRzIHRoYXQgd2UndmUgbG9zdCB0aGVcbiAgLy8gY29ubmVjdGlvbi4gIFVubGlrZSBgZGlzY29ubmVjdGAgb3IgYGNsb3NlYCwgYSBsb3N0IGNvbm5lY3Rpb25cbiAgLy8gd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHJldHJpZWQuXG4gIF9sb3N0Q29ubmVjdGlvbihlcnJvcikge1xuICAgIHRoaXMuX3N0cmVhbS5fbG9zdENvbm5lY3Rpb24oZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAYWxpYXMgTWV0ZW9yLnN0YXR1c1xuICAgKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgY29ubmVjdGlvbiBzdGF0dXMuIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICovXG4gIHN0YXR1cyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmVhbS5zdGF0dXMoLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgRm9yY2UgYW4gaW1tZWRpYXRlIHJlY29ubmVjdGlvbiBhdHRlbXB0IGlmIHRoZSBjbGllbnQgaXMgbm90IGNvbm5lY3RlZCB0byB0aGUgc2VydmVyLlxuXG4gIFRoaXMgbWV0aG9kIGRvZXMgbm90aGluZyBpZiB0aGUgY2xpZW50IGlzIGFscmVhZHkgY29ubmVjdGVkLlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGFsaWFzIE1ldGVvci5yZWNvbm5lY3RcbiAgICogQGxvY3VzIENsaWVudFxuICAgKi9cbiAgcmVjb25uZWN0KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyZWFtLnJlY29ubmVjdCguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGFsaWFzIE1ldGVvci5kaXNjb25uZWN0XG4gICAqIEBzdW1tYXJ5IERpc2Nvbm5lY3QgdGhlIGNsaWVudCBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICovXG4gIGRpc2Nvbm5lY3QoLi4uYXJncykge1xuICAgIHRoaXMuX3NlbmQoeyBtc2c6ICdkaXNjb25uZWN0JyB9KTtcbiAgICByZXR1cm4gdGhpcy5fc3RyZWFtLmRpc2Nvbm5lY3QoLi4uYXJncyk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICAvLyBfcGVybWFuZW50IGlzIHVzZWQgYnkgdGhlIHVuZGVybHlpbmcgc3RyZWFtIHRvIHByZXZlbnQgcmVjb25uZWN0aW9uIGF0dGVtcHRzXG4gICAgcmV0dXJuIHRoaXMuZGlzY29ubmVjdCh7IF9wZXJtYW5lbnQ6IHRydWUgfSk7XG4gIH1cblxuICAvLy9cbiAgLy8vIFJlYWN0aXZlIHVzZXIgc3lzdGVtXG4gIC8vL1xuICB1c2VySWQoKSB7XG4gICAgaWYgKHRoaXMuX3VzZXJJZERlcHMpIHRoaXMuX3VzZXJJZERlcHMuZGVwZW5kKCk7XG4gICAgcmV0dXJuIHRoaXMuX3VzZXJJZDtcbiAgfVxuXG4gIHNldFVzZXJJZCh1c2VySWQpIHtcbiAgICAvLyBBdm9pZCBpbnZhbGlkYXRpbmcgZGVwZW5kZW50cyBpZiBzZXRVc2VySWQgaXMgY2FsbGVkIHdpdGggY3VycmVudCB2YWx1ZS5cbiAgICBpZiAodGhpcy5fdXNlcklkID09PSB1c2VySWQpIHJldHVybjtcbiAgICB0aGlzLl91c2VySWQgPSB1c2VySWQ7XG4gICAgaWYgKHRoaXMuX3VzZXJJZERlcHMpIHRoaXMuX3VzZXJJZERlcHMuY2hhbmdlZCgpO1xuICB9XG5cbiAgLy8gUmV0dXJucyB0cnVlIGlmIHdlIGFyZSBpbiBhIHN0YXRlIGFmdGVyIHJlY29ubmVjdCBvZiB3YWl0aW5nIGZvciBzdWJzIHRvIGJlXG4gIC8vIHJldml2ZWQgb3IgZWFybHkgbWV0aG9kcyB0byBmaW5pc2ggdGhlaXIgZGF0YSwgb3Igd2UgYXJlIHdhaXRpbmcgZm9yIGFcbiAgLy8gXCJ3YWl0XCIgbWV0aG9kIHRvIGZpbmlzaC5cbiAgX3dhaXRpbmdGb3JRdWllc2NlbmNlKCkge1xuICAgIHJldHVybiAoXG4gICAgICAhIGlzRW1wdHkodGhpcy5fc3Vic0JlaW5nUmV2aXZlZCkgfHxcbiAgICAgICEgaXNFbXB0eSh0aGlzLl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlKVxuICAgICk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHRydWUgaWYgYW55IG1ldGhvZCB3aG9zZSBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgdG8gdGhlIHNlcnZlciBoYXNcbiAgLy8gbm90IHlldCBpbnZva2VkIGl0cyB1c2VyIGNhbGxiYWNrLlxuICBfYW55TWV0aG9kc0FyZU91dHN0YW5kaW5nKCkge1xuICAgIGNvbnN0IGludm9rZXJzID0gdGhpcy5fbWV0aG9kSW52b2tlcnM7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoaW52b2tlcnMpLnNvbWUoKGludm9rZXIpID0+ICEhaW52b2tlci5zZW50TWVzc2FnZSk7XG4gIH1cblxuICBfcHJlcGFyZUJ1ZmZlcnNUb0ZsdXNoKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlKSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEhhbmRsZSk7XG4gICAgICBzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlID0gbnVsbDtcbiAgICB9XG5cbiAgICBzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoQXQgPSBudWxsO1xuICAgIC8vIFdlIG5lZWQgdG8gY2xlYXIgdGhlIGJ1ZmZlciBiZWZvcmUgcGFzc2luZyBpdCB0b1xuICAgIC8vICBwZXJmb3JtV3JpdGVzLiBBcyB0aGVyZSdzIG5vIGd1YXJhbnRlZSB0aGF0IGl0XG4gICAgLy8gIHdpbGwgZXhpdCBjbGVhbmx5LlxuICAgIGNvbnN0IHdyaXRlcyA9IHNlbGYuX2J1ZmZlcmVkV3JpdGVzO1xuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICByZXR1cm4gd3JpdGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcnZlci1zaWRlIHN0b3JlIHVwZGF0ZXMgaGFuZGxlZCBhc3luY2hyb25vdXNseVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXN5bmMgX3BlcmZvcm1Xcml0ZXNTZXJ2ZXIodXBkYXRlcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3Jlc2V0U3RvcmVzIHx8ICFpc0VtcHR5KHVwZGF0ZXMpKSB7XG4gICAgICAvLyBTdGFydCBhbGwgc3RvcmUgdXBkYXRlcyAtIGtlZXBpbmcgb3JpZ2luYWwgbG9vcCBzdHJ1Y3R1cmVcbiAgICAgIGZvciAoY29uc3Qgc3RvcmUgb2YgT2JqZWN0LnZhbHVlcyhzZWxmLl9zdG9yZXMpKSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLmJlZ2luVXBkYXRlKFxuICAgICAgICAgIHVwZGF0ZXNbc3RvcmUuX25hbWVdPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICBzZWxmLl9yZXNldFN0b3Jlc1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9yZXNldFN0b3JlcyA9IGZhbHNlO1xuXG4gICAgICAvLyBQcm9jZXNzIGVhY2ggc3RvcmUncyB1cGRhdGVzIHNlcXVlbnRpYWxseSBhcyBiZWZvcmVcbiAgICAgIGZvciAoY29uc3QgW3N0b3JlTmFtZSwgbWVzc2FnZXNdIG9mIE9iamVjdC5lbnRyaWVzKHVwZGF0ZXMpKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gc2VsZi5fc3RvcmVzW3N0b3JlTmFtZV07XG4gICAgICAgIGlmIChzdG9yZSkge1xuICAgICAgICAgIC8vIEJhdGNoIGVhY2ggc3RvcmUncyBtZXNzYWdlcyBpbiBtb2Rlc3QgY2h1bmtzIHRvIHByZXZlbnQgZXZlbnQgbG9vcCBibG9ja2luZ1xuICAgICAgICAgIC8vIHdoaWxlIG1haW50YWluaW5nIG9wZXJhdGlvbiBvcmRlclxuICAgICAgICAgIGNvbnN0IENIVU5LX1NJWkUgPSAxMDA7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7IGkgKz0gQ0hVTktfU0laRSkge1xuICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBtZXNzYWdlcy5zbGljZShpLCBNYXRoLm1pbihpICsgQ0hVTktfU0laRSwgbWVzc2FnZXMubGVuZ3RoKSk7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgbXNnIG9mIGNodW5rKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHN0b3JlLnVwZGF0ZShtc2cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHByb2Nlc3MubmV4dFRpY2socmVzb2x2ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBRdWV1ZSB1cGRhdGVzIGZvciB1bmluaXRpYWxpemVkIHN0b3Jlc1xuICAgICAgICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW3N0b3JlTmFtZV0gPVxuICAgICAgICAgICAgc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbc3RvcmVOYW1lXSB8fCBbXTtcbiAgICAgICAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tzdG9yZU5hbWVdLnB1c2goLi4ubWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXBsZXRlIGFsbCB1cGRhdGVzXG4gICAgICBmb3IgKGNvbnN0IHN0b3JlIG9mIE9iamVjdC52YWx1ZXMoc2VsZi5fc3RvcmVzKSkge1xuICAgICAgICBhd2FpdCBzdG9yZS5lbmRVcGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9ydW5BZnRlclVwZGF0ZUNhbGxiYWNrcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsaWVudC1zaWRlIHN0b3JlIHVwZGF0ZXMgaGFuZGxlZCBzeW5jaHJvbm91c2x5IGZvciBvcHRpbWlzdGljIFVJXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGVyZm9ybVdyaXRlc0NsaWVudCh1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fcmVzZXRTdG9yZXMgfHwgIWlzRW1wdHkodXBkYXRlcykpIHtcbiAgICAgIC8vIFN5bmNocm9ub3VzIHN0b3JlIHVwZGF0ZXMgZm9yIGNsaWVudFxuICAgICAgT2JqZWN0LnZhbHVlcyhzZWxmLl9zdG9yZXMpLmZvckVhY2goc3RvcmUgPT4ge1xuICAgICAgICBzdG9yZS5iZWdpblVwZGF0ZShcbiAgICAgICAgICB1cGRhdGVzW3N0b3JlLl9uYW1lXT8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgc2VsZi5fcmVzZXRTdG9yZXNcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9yZXNldFN0b3JlcyA9IGZhbHNlO1xuXG4gICAgICBPYmplY3QuZW50cmllcyh1cGRhdGVzKS5mb3JFYWNoKChbc3RvcmVOYW1lLCBtZXNzYWdlc10pID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBzZWxmLl9zdG9yZXNbc3RvcmVOYW1lXTtcbiAgICAgICAgaWYgKHN0b3JlKSB7XG4gICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaChtc2cgPT4gc3RvcmUudXBkYXRlKG1zZykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW3N0b3JlTmFtZV0gPVxuICAgICAgICAgICAgc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbc3RvcmVOYW1lXSB8fCBbXTtcbiAgICAgICAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tzdG9yZU5hbWVdLnB1c2goLi4ubWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgT2JqZWN0LnZhbHVlcyhzZWxmLl9zdG9yZXMpLmZvckVhY2goc3RvcmUgPT4gc3RvcmUuZW5kVXBkYXRlKCkpO1xuICAgIH1cblxuICAgIHNlbGYuX3J1bkFmdGVyVXBkYXRlQ2FsbGJhY2tzKCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYnVmZmVyZWQgd3JpdGVzIGVpdGhlciBzeW5jaHJvbm91c2x5IChjbGllbnQpIG9yIGFzeW5jIChzZXJ2ZXIpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfZmx1c2hCdWZmZXJlZFdyaXRlcygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCB3cml0ZXMgPSBzZWxmLl9wcmVwYXJlQnVmZmVyc1RvRmx1c2goKTtcblxuICAgIHJldHVybiBNZXRlb3IuaXNDbGllbnRcbiAgICAgID8gc2VsZi5fcGVyZm9ybVdyaXRlc0NsaWVudCh3cml0ZXMpXG4gICAgICA6IHNlbGYuX3BlcmZvcm1Xcml0ZXNTZXJ2ZXIod3JpdGVzKTtcbiAgfVxuXG4gIC8vIENhbGwgYW55IGNhbGxiYWNrcyBkZWZlcnJlZCB3aXRoIF9ydW5XaGVuQWxsU2VydmVyRG9jc0FyZUZsdXNoZWQgd2hvc2VcbiAgLy8gcmVsZXZhbnQgZG9jcyBoYXZlIGJlZW4gZmx1c2hlZCwgYXMgd2VsbCBhcyBkYXRhVmlzaWJsZSBjYWxsYmFja3MgYXRcbiAgLy8gcmVjb25uZWN0LXF1aWVzY2VuY2UgdGltZS5cbiAgX3J1bkFmdGVyVXBkYXRlQ2FsbGJhY2tzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IHNlbGYuX2FmdGVyVXBkYXRlQ2FsbGJhY2tzO1xuICAgIHNlbGYuX2FmdGVyVXBkYXRlQ2FsbGJhY2tzID0gW107XG4gICAgY2FsbGJhY2tzLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEVuc3VyZXMgdGhhdCBcImZcIiB3aWxsIGJlIGNhbGxlZCBhZnRlciBhbGwgZG9jdW1lbnRzIGN1cnJlbnRseSBpblxuICAvLyBfc2VydmVyRG9jdW1lbnRzIGhhdmUgYmVlbiB3cml0dGVuIHRvIHRoZSBsb2NhbCBjYWNoZS4gZiB3aWxsIG5vdCBiZSBjYWxsZWRcbiAgLy8gaWYgdGhlIGNvbm5lY3Rpb24gaXMgbG9zdCBiZWZvcmUgdGhlbiFcbiAgX3J1bldoZW5BbGxTZXJ2ZXJEb2NzQXJlRmx1c2hlZChmKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgcnVuRkFmdGVyVXBkYXRlcyA9ICgpID0+IHtcbiAgICAgIHNlbGYuX2FmdGVyVXBkYXRlQ2FsbGJhY2tzLnB1c2goZik7XG4gICAgfTtcbiAgICBsZXQgdW5mbHVzaGVkU2VydmVyRG9jQ291bnQgPSAwO1xuICAgIGNvbnN0IG9uU2VydmVyRG9jRmx1c2ggPSAoKSA9PiB7XG4gICAgICAtLXVuZmx1c2hlZFNlcnZlckRvY0NvdW50O1xuICAgICAgaWYgKHVuZmx1c2hlZFNlcnZlckRvY0NvdW50ID09PSAwKSB7XG4gICAgICAgIC8vIFRoaXMgd2FzIHRoZSBsYXN0IGRvYyB0byBmbHVzaCEgQXJyYW5nZSB0byBydW4gZiBhZnRlciB0aGUgdXBkYXRlc1xuICAgICAgICAvLyBoYXZlIGJlZW4gYXBwbGllZC5cbiAgICAgICAgcnVuRkFmdGVyVXBkYXRlcygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3QudmFsdWVzKHNlbGYuX3NlcnZlckRvY3VtZW50cykuZm9yRWFjaCgoc2VydmVyRG9jdW1lbnRzKSA9PiB7XG4gICAgICBzZXJ2ZXJEb2N1bWVudHMuZm9yRWFjaCgoc2VydmVyRG9jKSA9PiB7XG4gICAgICAgIGNvbnN0IHdyaXR0ZW5CeVN0dWJGb3JBTWV0aG9kV2l0aFNlbnRNZXNzYWdlID1cbiAgICAgICAgICBrZXlzKHNlcnZlckRvYy53cml0dGVuQnlTdHVicykuc29tZShtZXRob2RJZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnZva2VyID0gc2VsZi5fbWV0aG9kSW52b2tlcnNbbWV0aG9kSWRdO1xuICAgICAgICAgICAgcmV0dXJuIGludm9rZXIgJiYgaW52b2tlci5zZW50TWVzc2FnZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAod3JpdHRlbkJ5U3R1YkZvckFNZXRob2RXaXRoU2VudE1lc3NhZ2UpIHtcbiAgICAgICAgICArK3VuZmx1c2hlZFNlcnZlckRvY0NvdW50O1xuICAgICAgICAgIHNlcnZlckRvYy5mbHVzaENhbGxiYWNrcy5wdXNoKG9uU2VydmVyRG9jRmx1c2gpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAodW5mbHVzaGVkU2VydmVyRG9jQ291bnQgPT09IDApIHtcbiAgICAgIC8vIFRoZXJlIGFyZW4ndCBhbnkgYnVmZmVyZWQgZG9jcyAtLS0gd2UgY2FuIGNhbGwgZiBhcyBzb29uIGFzIHRoZSBjdXJyZW50XG4gICAgICAvLyByb3VuZCBvZiB1cGRhdGVzIGlzIGFwcGxpZWQhXG4gICAgICBydW5GQWZ0ZXJVcGRhdGVzKCk7XG4gICAgfVxuICB9XG5cbiAgX2FkZE91dHN0YW5kaW5nTWV0aG9kKG1ldGhvZEludm9rZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucz8ud2FpdCkge1xuICAgICAgLy8gSXQncyBhIHdhaXQgbWV0aG9kISBXYWl0IG1ldGhvZHMgZ28gaW4gdGhlaXIgb3duIGJsb2NrLlxuICAgICAgdGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MucHVzaCh7XG4gICAgICAgIHdhaXQ6IHRydWUsXG4gICAgICAgIG1ldGhvZHM6IFttZXRob2RJbnZva2VyXVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdCBhIHdhaXQgbWV0aG9kLiBTdGFydCBhIG5ldyBibG9jayBpZiB0aGUgcHJldmlvdXMgYmxvY2sgd2FzIGEgd2FpdFxuICAgICAgLy8gYmxvY2ssIGFuZCBhZGQgaXQgdG8gdGhlIGxhc3QgYmxvY2sgb2YgbWV0aG9kcy5cbiAgICAgIGlmIChpc0VtcHR5KHRoaXMuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzKSB8fFxuICAgICAgICAgIGxhc3QodGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpLndhaXQpIHtcbiAgICAgICAgdGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MucHVzaCh7XG4gICAgICAgICAgd2FpdDogZmFsc2UsXG4gICAgICAgICAgbWV0aG9kczogW10sXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBsYXN0KHRoaXMuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzKS5tZXRob2RzLnB1c2gobWV0aG9kSW52b2tlcik7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYWRkZWQgaXQgdG8gdGhlIGZpcnN0IGJsb2NrLCBzZW5kIGl0IG91dCBub3cuXG4gICAgaWYgKHRoaXMuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgbWV0aG9kSW52b2tlci5zZW5kTWVzc2FnZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxlZCBieSBNZXRob2RJbnZva2VyIGFmdGVyIGEgbWV0aG9kJ3MgY2FsbGJhY2sgaXMgaW52b2tlZC4gIElmIHRoaXMgd2FzXG4gIC8vIHRoZSBsYXN0IG91dHN0YW5kaW5nIG1ldGhvZCBpbiB0aGUgY3VycmVudCBibG9jaywgcnVucyB0aGUgbmV4dCBibG9jay4gSWZcbiAgLy8gdGhlcmUgYXJlIG5vIG1vcmUgbWV0aG9kcywgY29uc2lkZXIgYWNjZXB0aW5nIGEgaG90IGNvZGUgcHVzaC5cbiAgX291dHN0YW5kaW5nTWV0aG9kRmluaXNoZWQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2FueU1ldGhvZHNBcmVPdXRzdGFuZGluZygpKSByZXR1cm47XG5cbiAgICAvLyBObyBtZXRob2RzIGFyZSBvdXRzdGFuZGluZy4gVGhpcyBzaG91bGQgbWVhbiB0aGF0IHRoZSBmaXJzdCBibG9jayBvZlxuICAgIC8vIG1ldGhvZHMgaXMgZW1wdHkuIChPciBpdCBtaWdodCBub3QgZXhpc3QsIGlmIHRoaXMgd2FzIGEgbWV0aG9kIHRoYXRcbiAgICAvLyBoYWxmLWZpbmlzaGVkIGJlZm9yZSBkaXNjb25uZWN0L3JlY29ubmVjdC4pXG4gICAgaWYgKCEgaXNFbXB0eShzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpIHtcbiAgICAgIGNvbnN0IGZpcnN0QmxvY2sgPSBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5zaGlmdCgpO1xuICAgICAgaWYgKCEgaXNFbXB0eShmaXJzdEJsb2NrLm1ldGhvZHMpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ05vIG1ldGhvZHMgb3V0c3RhbmRpbmcgYnV0IG5vbmVtcHR5IGJsb2NrOiAnICtcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGZpcnN0QmxvY2spXG4gICAgICAgICk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIG91dHN0YW5kaW5nIG1ldGhvZHMgbm93IGluIHRoZSBmaXJzdCBibG9jay5cbiAgICAgIGlmICghIGlzRW1wdHkoc2VsZi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpKVxuICAgICAgICBzZWxmLl9zZW5kT3V0c3RhbmRpbmdNZXRob2RzKCk7XG4gICAgfVxuXG4gICAgLy8gTWF5YmUgYWNjZXB0IGEgaG90IGNvZGUgcHVzaC5cbiAgICBzZWxmLl9tYXliZU1pZ3JhdGUoKTtcbiAgfVxuXG4gIC8vIFNlbmRzIG1lc3NhZ2VzIGZvciBhbGwgdGhlIG1ldGhvZHMgaW4gdGhlIGZpcnN0IGJsb2NrIGluXG4gIC8vIF9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5cbiAgX3NlbmRPdXRzdGFuZGluZ01ldGhvZHMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoaXNFbXB0eShzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrc1swXS5tZXRob2RzLmZvckVhY2gobSA9PiB7XG4gICAgICBtLnNlbmRNZXNzYWdlKCk7XG4gICAgfSk7XG4gIH1cblxuICBfc2VuZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzTWVzc2FnZXMob2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAoaXNFbXB0eShvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpIHJldHVybjtcblxuICAgIC8vIFdlIGhhdmUgYXQgbGVhc3Qgb25lIGJsb2NrIHdvcnRoIG9mIG9sZCBvdXRzdGFuZGluZyBtZXRob2RzIHRvIHRyeVxuICAgIC8vIGFnYWluLiBGaXJzdDogZGlkIG9uUmVjb25uZWN0IGFjdHVhbGx5IHNlbmQgYW55dGhpbmc/IElmIG5vdCwgd2UganVzdFxuICAgIC8vIHJlc3RvcmUgYWxsIG91dHN0YW5kaW5nIG1ldGhvZHMgYW5kIHJ1biB0aGUgZmlyc3QgYmxvY2suXG4gICAgaWYgKGlzRW1wdHkoc2VsZi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpKSB7XG4gICAgICBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyA9IG9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzO1xuICAgICAgc2VsZi5fc2VuZE91dHN0YW5kaW5nTWV0aG9kcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE9LLCB0aGVyZSBhcmUgYmxvY2tzIG9uIGJvdGggc2lkZXMuIFNwZWNpYWwgY2FzZTogbWVyZ2UgdGhlIGxhc3QgYmxvY2sgb2ZcbiAgICAvLyB0aGUgcmVjb25uZWN0IG1ldGhvZHMgd2l0aCB0aGUgZmlyc3QgYmxvY2sgb2YgdGhlIG9yaWdpbmFsIG1ldGhvZHMsIGlmXG4gICAgLy8gbmVpdGhlciBvZiB0aGVtIGFyZSBcIndhaXRcIiBibG9ja3MuXG4gICAgaWYgKFxuICAgICAgIWxhc3Qoc2VsZi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpLndhaXQgJiZcbiAgICAgICFvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrc1swXS53YWl0XG4gICAgKSB7XG4gICAgICBvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrc1swXS5tZXRob2RzLmZvckVhY2goKG0pID0+IHtcbiAgICAgICAgbGFzdChzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykubWV0aG9kcy5wdXNoKG0pO1xuXG4gICAgICAgIC8vIElmIHRoaXMgXCJsYXN0IGJsb2NrXCIgaXMgYWxzbyB0aGUgZmlyc3QgYmxvY2ssIHNlbmQgdGhlIG1lc3NhZ2UuXG4gICAgICAgIGlmIChzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBtLnNlbmRNZXNzYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5zaGlmdCgpO1xuICAgIH1cblxuICAgIC8vIE5vdyBhZGQgdGhlIHJlc3Qgb2YgdGhlIG9yaWdpbmFsIGJsb2NrcyBvbi5cbiAgICBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5wdXNoKC4uLm9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzKTtcbiAgfVxuXG4gIF9jYWxsT25SZWNvbm5lY3RBbmRTZW5kQXBwcm9wcmlhdGVPdXRzdGFuZGluZ01ldGhvZHMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgb2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3MgPSBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcztcbiAgICBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyA9IFtdO1xuXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBjb25zdCBwdXNoUmVjb25uZWN0UmVzdWx0ID0gKGludm9rZSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gaW52b2tlKCk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBwcm9taXNlcy5wdXNoKFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzZWxmLm9uUmVjb25uZWN0KSB7XG4gICAgICBwdXNoUmVjb25uZWN0UmVzdWx0KCgpID0+IHNlbGYub25SZWNvbm5lY3QoKSk7XG4gICAgfVxuICAgIEREUC5fcmVjb25uZWN0SG9vay5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgcHVzaFJlY29ubmVjdFJlc3VsdCgoKSA9PiBjYWxsYmFjayhzZWxmKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNlbmRNZXNzYWdlcyA9ICgpID0+IHNlbGYuX3NlbmRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrc01lc3NhZ2VzKG9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzKTtcbiAgICBpZiAocHJvbWlzZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gQWx3YXlzIHJlLXNlbmQgb3V0c3RhbmRpbmcgbWV0aG9kcywgZXZlbiBpZiBhIGNhbGxiYWNrIHJlamVjdHMuXG4gICAgICBQcm9taXNlLmFsbFNldHRsZWQocHJvbWlzZXMpLnRoZW4oc2VuZE1lc3NhZ2VzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VuZE1lc3NhZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gV2UgY2FuIGFjY2VwdCBhIGhvdCBjb2RlIHB1c2ggaWYgdGhlcmUgYXJlIG5vIG1ldGhvZHMgaW4gZmxpZ2h0LlxuICBfcmVhZHlUb01pZ3JhdGUoKSB7XG4gICAgcmV0dXJuIGlzRW1wdHkodGhpcy5fbWV0aG9kSW52b2tlcnMpO1xuICB9XG5cbiAgLy8gSWYgd2Ugd2VyZSBibG9ja2luZyBhIG1pZ3JhdGlvbiwgc2VlIGlmIGl0J3Mgbm93IHBvc3NpYmxlIHRvIGNvbnRpbnVlLlxuICAvLyBDYWxsIHdoZW5ldmVyIHRoZSBzZXQgb2Ygb3V0c3RhbmRpbmcvYmxvY2tlZCBtZXRob2RzIHNocmlua3MuXG4gIF9tYXliZU1pZ3JhdGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX3JldHJ5TWlncmF0ZSAmJiBzZWxmLl9yZWFkeVRvTWlncmF0ZSgpKSB7XG4gICAgICBzZWxmLl9yZXRyeU1pZ3JhdGUoKTtcbiAgICAgIHNlbGYuX3JldHJ5TWlncmF0ZSA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBERFBDb21tb24gfSBmcm9tICdtZXRlb3IvZGRwLWNvbW1vbic7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEREUCB9IGZyb20gJy4vbmFtZXNwYWNlLmpzJztcbmltcG9ydCB7IEVKU09OIH0gZnJvbSAnbWV0ZW9yL2Vqc29uJztcbmltcG9ydCB7IGlzRW1wdHksIGhhc093biB9IGZyb20gXCJtZXRlb3IvZGRwLWNvbW1vbi91dGlsc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZVByb2Nlc3NvcnMge1xuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUHJvY2VzcyB0aGUgY29ubmVjdGlvbiBtZXNzYWdlIGFuZCBzZXQgdXAgdGhlIHNlc3Npb25cbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgY29ubmVjdGlvbiBtZXNzYWdlXG4gICAqL1xuICBhc3luYyBfbGl2ZWRhdGFfY29ubmVjdGVkKG1zZykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuXG4gICAgaWYgKHNlbGYuX3ZlcnNpb24gIT09ICdwcmUxJyAmJiBzZWxmLl9oZWFydGJlYXRJbnRlcnZhbCAhPT0gMCkge1xuICAgICAgc2VsZi5faGVhcnRiZWF0ID0gbmV3IEREUENvbW1vbi5IZWFydGJlYXQoe1xuICAgICAgICBoZWFydGJlYXRJbnRlcnZhbDogc2VsZi5faGVhcnRiZWF0SW50ZXJ2YWwsXG4gICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IHNlbGYuX2hlYXJ0YmVhdFRpbWVvdXQsXG4gICAgICAgIG9uVGltZW91dCgpIHtcbiAgICAgICAgICBzZWxmLl9sb3N0Q29ubmVjdGlvbihcbiAgICAgICAgICAgIG5ldyBERFAuQ29ubmVjdGlvbkVycm9yKCdERFAgaGVhcnRiZWF0IHRpbWVkIG91dCcpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VuZFBpbmcoKSB7XG4gICAgICAgICAgc2VsZi5fc2VuZCh7IG1zZzogJ3BpbmcnIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNlbGYuX2hlYXJ0YmVhdC5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIElmIHRoaXMgaXMgYSByZWNvbm5lY3QsIHdlJ2xsIGhhdmUgdG8gcmVzZXQgYWxsIHN0b3Jlcy5cbiAgICBpZiAoc2VsZi5fbGFzdFNlc3Npb25JZCkgc2VsZi5fcmVzZXRTdG9yZXMgPSB0cnVlO1xuXG4gICAgbGV0IHJlY29ubmVjdGVkVG9QcmV2aW91c1Nlc3Npb247XG4gICAgaWYgKHR5cGVvZiBtc2cuc2Vzc2lvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlY29ubmVjdGVkVG9QcmV2aW91c1Nlc3Npb24gPSBzZWxmLl9sYXN0U2Vzc2lvbklkID09PSBtc2cuc2Vzc2lvbjtcbiAgICAgIHNlbGYuX2xhc3RTZXNzaW9uSWQgPSBtc2cuc2Vzc2lvbjtcbiAgICB9XG5cbiAgICBpZiAocmVjb25uZWN0ZWRUb1ByZXZpb3VzU2Vzc2lvbikge1xuICAgICAgLy8gU3VjY2Vzc2Z1bCByZWNvbm5lY3Rpb24gLS0gcGljayB1cCB3aGVyZSB3ZSBsZWZ0IG9mZi5cbiAgICAgIC8vIERvbid0IHJlc2V0IHN0b3JlcyBzaW5jZSB3ZSdyZSBjb250aW51aW5nIHRoZSBzYW1lIHNlc3Npb24uXG4gICAgICBzZWxmLl9yZXNldFN0b3JlcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNlcnZlciBkb2Vzbid0IGhhdmUgb3VyIGRhdGEgYW55bW9yZS4gUmUtc3luYyBhIG5ldyBzZXNzaW9uLlxuICAgIC8vIFJlc2V0IHRoZSByZWNlaXZlZCBjb3VudCBzaW5jZSB3ZSdyZSBzdGFydGluZyBhIG5ldyBzZXNzaW9uLlxuICAgIC8vIFNldCB0byAxIGJlY2F1c2UgdGhlICdjb25uZWN0ZWQnIG1lc3NhZ2UgaXRzZWxmIGNvdW50cy5cbiAgICBzZWxmLl9yZWNlaXZlZENvdW50ID0gMTtcblxuICAgIC8vIEZvcmdldCBhYm91dCBtZXNzYWdlcyB3ZSB3ZXJlIGJ1ZmZlcmluZyBmb3IgdW5rbm93biBjb2xsZWN0aW9ucy4gVGhleSdsbFxuICAgIC8vIGJlIHJlc2VudCBpZiBzdGlsbCByZWxldmFudC5cbiAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3JlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBpZiAoc2VsZi5fcmVzZXRTdG9yZXMpIHtcbiAgICAgIC8vIEZvcmdldCBhYm91dCB0aGUgZWZmZWN0cyBvZiBzdHVicy4gV2UnbGwgYmUgcmVzZXR0aW5nIGFsbCBjb2xsZWN0aW9uc1xuICAgICAgLy8gYW55d2F5LlxuICAgICAgc2VsZi5fZG9jdW1lbnRzV3JpdHRlbkJ5U3R1YiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICBzZWxmLl9zZXJ2ZXJEb2N1bWVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cblxuICAgIC8vIENsZWFyIF9hZnRlclVwZGF0ZUNhbGxiYWNrcy5cbiAgICBzZWxmLl9hZnRlclVwZGF0ZUNhbGxiYWNrcyA9IFtdO1xuXG4gICAgLy8gTWFyayBhbGwgbmFtZWQgc3Vic2NyaXB0aW9ucyB3aGljaCBhcmUgcmVhZHkgYXMgbmVlZGluZyB0byBiZSByZXZpdmVkLlxuICAgIHNlbGYuX3N1YnNCZWluZ1Jldml2ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIE9iamVjdC5lbnRyaWVzKHNlbGYuX3N1YnNjcmlwdGlvbnMpLmZvckVhY2goKFtpZCwgc3ViXSkgPT4ge1xuICAgICAgaWYgKHN1Yi5yZWFkeSkge1xuICAgICAgICBzZWxmLl9zdWJzQmVpbmdSZXZpdmVkW2lkXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBcnJhbmdlIGZvciBcImhhbGYtZmluaXNoZWRcIiBtZXRob2RzIHRvIGhhdmUgdGhlaXIgY2FsbGJhY2tzIHJ1biwgYW5kXG4gICAgLy8gdHJhY2sgbWV0aG9kcyB0aGF0IHdlcmUgc2VudCBvbiB0aGlzIGNvbm5lY3Rpb24gc28gdGhhdCB3ZSBkb24ndFxuICAgIC8vIHF1aWVzY2UgdW50aWwgdGhleSBhcmUgYWxsIGRvbmUuXG4gICAgLy9cbiAgICAvLyBTdGFydCBieSBjbGVhcmluZyBfbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZTogbWV0aG9kcyBzZW50IGJlZm9yZVxuICAgIC8vIHJlY29ubmVjdCBkb24ndCBtYXR0ZXIsIGFuZCBhbnkgXCJ3YWl0XCIgbWV0aG9kcyBzZW50IG9uIHRoZSBuZXcgY29ubmVjdGlvblxuICAgIC8vIHRoYXQgd2UgZHJvcCBoZXJlIHdpbGwgYmUgcmVzdG9yZWQgYnkgdGhlIGxvb3AgYmVsb3cuXG4gICAgc2VsZi5fbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgaWYgKHNlbGYuX3Jlc2V0U3RvcmVzKSB7XG4gICAgICBjb25zdCBpbnZva2VycyA9IHNlbGYuX21ldGhvZEludm9rZXJzO1xuICAgICAgT2JqZWN0LmtleXMoaW52b2tlcnMpLmZvckVhY2goaWQgPT4ge1xuICAgICAgICBjb25zdCBpbnZva2VyID0gaW52b2tlcnNbaWRdO1xuICAgICAgICBpZiAoaW52b2tlci5nb3RSZXN1bHQoKSkge1xuICAgICAgICAgIC8vIFRoaXMgbWV0aG9kIGFscmVhZHkgZ290IGl0cyByZXN1bHQsIGJ1dCBpdCBkaWRuJ3QgY2FsbCBpdHMgY2FsbGJhY2tcbiAgICAgICAgICAvLyBiZWNhdXNlIGl0cyBkYXRhIGRpZG4ndCBiZWNvbWUgdmlzaWJsZS4gV2UgZGlkIG5vdCByZXNlbmQgdGhlXG4gICAgICAgICAgLy8gbWV0aG9kIFJQQy4gV2UnbGwgY2FsbCBpdHMgY2FsbGJhY2sgd2hlbiB3ZSBnZXQgYSBmdWxsIHF1aWVzY2UsXG4gICAgICAgICAgLy8gc2luY2UgdGhhdCdzIGFzIGNsb3NlIGFzIHdlJ2xsIGdldCB0byBcImRhdGEgbXVzdCBiZSB2aXNpYmxlXCIuXG4gICAgICAgICAgc2VsZi5fYWZ0ZXJVcGRhdGVDYWxsYmFja3MucHVzaChcbiAgICAgICAgICAgICguLi5hcmdzKSA9PiBpbnZva2VyLmRhdGFWaXNpYmxlKC4uLmFyZ3MpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnZva2VyLnNlbnRNZXNzYWdlKSB7XG4gICAgICAgICAgLy8gVGhpcyBtZXRob2QgaGFzIGJlZW4gc2VudCBvbiB0aGlzIGNvbm5lY3Rpb24gKG1heWJlIGFzIGEgcmVzZW5kXG4gICAgICAgICAgLy8gZnJvbSB0aGUgbGFzdCBjb25uZWN0aW9uLCBtYXliZSBmcm9tIG9uUmVjb25uZWN0LCBtYXliZSBqdXN0IHZlcnlcbiAgICAgICAgICAvLyBxdWlja2x5IGJlZm9yZSBwcm9jZXNzaW5nIHRoZSBjb25uZWN0ZWQgbWVzc2FnZSkuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwgdG8gZW5zdXJlIGl0cyBjYWxsYmFja3MgZ2V0XG4gICAgICAgICAgLy8gY2FsbGVkLCBidXQgd2UnbGwgY291bnQgaXQgYXMgYSBtZXRob2Qgd2hpY2ggaXMgcHJldmVudGluZ1xuICAgICAgICAgIC8vIHJlY29ubmVjdCBxdWllc2NlbmNlLiAoZWcsIGl0IG1pZ2h0IGJlIGEgbG9naW4gbWV0aG9kIHRoYXQgd2FzIHJ1blxuICAgICAgICAgIC8vIGZyb20gb25SZWNvbm5lY3QsIGFuZCB3ZSBkb24ndCB3YW50IHRvIHNlZSBmbGlja2VyIGJ5IHNlZWluZyBhXG4gICAgICAgICAgLy8gbG9nZ2VkLW91dCBzdGF0ZS4pXG4gICAgICAgICAgc2VsZi5fbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZVtpbnZva2VyLm1ldGhvZElkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYuX21lc3NhZ2VzQnVmZmVyZWRVbnRpbFF1aWVzY2VuY2UgPSBbXTtcblxuICAgIC8vIElmIHdlJ3JlIG5vdCB3YWl0aW5nIG9uIGFueSBtZXRob2RzIG9yIHN1YnMsIHdlIGNhbiByZXNldCB0aGUgc3RvcmVzIGFuZFxuICAgIC8vIGNhbGwgdGhlIGNhbGxiYWNrcyBpbW1lZGlhdGVseS5cbiAgICBpZiAoIXNlbGYuX3dhaXRpbmdGb3JRdWllc2NlbmNlKCkpIHtcbiAgICAgIGlmIChzZWxmLl9yZXNldFN0b3Jlcykge1xuICAgICAgICBmb3IgKGNvbnN0IHN0b3JlIG9mIE9iamVjdC52YWx1ZXMoc2VsZi5fc3RvcmVzKSkge1xuICAgICAgICAgIGF3YWl0IHN0b3JlLmJlZ2luVXBkYXRlKDAsIHRydWUpO1xuICAgICAgICAgIGF3YWl0IHN0b3JlLmVuZFVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX3Jlc2V0U3RvcmVzID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzZWxmLl9ydW5BZnRlclVwZGF0ZUNhbGxiYWNrcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIHZhcmlvdXMgZGF0YSBtZXNzYWdlcyBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgZGF0YSBtZXNzYWdlXG4gICAqL1xuICBhc3luYyBfbGl2ZWRhdGFfZGF0YShtc2cpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcblxuICAgIGlmIChzZWxmLl93YWl0aW5nRm9yUXVpZXNjZW5jZSgpKSB7XG4gICAgICBzZWxmLl9tZXNzYWdlc0J1ZmZlcmVkVW50aWxRdWllc2NlbmNlLnB1c2gobXNnKTtcblxuICAgICAgaWYgKG1zZy5tc2cgPT09ICdub3N1YicpIHtcbiAgICAgICAgZGVsZXRlIHNlbGYuX3N1YnNCZWluZ1Jldml2ZWRbbXNnLmlkXTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1zZy5zdWJzKSB7XG4gICAgICAgIG1zZy5zdWJzLmZvckVhY2goc3ViSWQgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBzZWxmLl9zdWJzQmVpbmdSZXZpdmVkW3N1YklkXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChtc2cubWV0aG9kcykge1xuICAgICAgICBtc2cubWV0aG9kcy5mb3JFYWNoKG1ldGhvZElkID0+IHtcbiAgICAgICAgICBkZWxldGUgc2VsZi5fbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZVttZXRob2RJZF07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5fd2FpdGluZ0ZvclF1aWVzY2VuY2UoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE5vIG1ldGhvZHMgb3Igc3VicyBhcmUgYmxvY2tpbmcgcXVpZXNjZW5jZSFcbiAgICAgIC8vIFdlJ2xsIG5vdyBwcm9jZXNzIGFuZCBhbGwgb2Ygb3VyIGJ1ZmZlcmVkIG1lc3NhZ2VzLCByZXNldCBhbGwgc3RvcmVzLFxuICAgICAgLy8gYW5kIGFwcGx5IHRoZW0gYWxsIGF0IG9uY2UuXG4gICAgICBjb25zdCBidWZmZXJlZE1lc3NhZ2VzID0gc2VsZi5fbWVzc2FnZXNCdWZmZXJlZFVudGlsUXVpZXNjZW5jZTtcbiAgICAgIGZvciAoY29uc3QgYnVmZmVyZWRNZXNzYWdlIG9mIE9iamVjdC52YWx1ZXMoYnVmZmVyZWRNZXNzYWdlcykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fcHJvY2Vzc09uZURhdGFNZXNzYWdlKFxuICAgICAgICAgIGJ1ZmZlcmVkTWVzc2FnZSxcbiAgICAgICAgICBzZWxmLl9idWZmZXJlZFdyaXRlc1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgc2VsZi5fbWVzc2FnZXNCdWZmZXJlZFVudGlsUXVpZXNjZW5jZSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLl9wcm9jZXNzT25lRGF0YU1lc3NhZ2UobXNnLCBzZWxmLl9idWZmZXJlZFdyaXRlcyk7XG4gICAgfVxuXG4gICAgLy8gSW1tZWRpYXRlbHkgZmx1c2ggd3JpdGVzIHdoZW46XG4gICAgLy8gIDEuIEJ1ZmZlcmluZyBpcyBkaXNhYmxlZC4gT3I7XG4gICAgLy8gIDIuIGFueSBub24tKGFkZGVkL2NoYW5nZWQvcmVtb3ZlZCkgbWVzc2FnZSBhcnJpdmVzLlxuICAgIGNvbnN0IHN0YW5kYXJkV3JpdGUgPVxuICAgICAgbXNnLm1zZyA9PT0gXCJhZGRlZFwiIHx8XG4gICAgICBtc2cubXNnID09PSBcImNoYW5nZWRcIiB8fFxuICAgICAgbXNnLm1zZyA9PT0gXCJyZW1vdmVkXCI7XG5cbiAgICBpZiAoc2VsZi5fYnVmZmVyZWRXcml0ZXNJbnRlcnZhbCA9PT0gMCB8fCAhc3RhbmRhcmRXcml0ZSkge1xuICAgICAgYXdhaXQgc2VsZi5fZmx1c2hCdWZmZXJlZFdyaXRlcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoQXQgPT09IG51bGwpIHtcbiAgICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCA9XG4gICAgICAgIG5ldyBEYXRlKCkudmFsdWVPZigpICsgc2VsZi5fYnVmZmVyZWRXcml0ZXNNYXhBZ2U7XG4gICAgfSBlbHNlIGlmIChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoQXQgPCBuZXcgRGF0ZSgpLnZhbHVlT2YoKSkge1xuICAgICAgYXdhaXQgc2VsZi5fZmx1c2hCdWZmZXJlZFdyaXRlcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlKSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEhhbmRsZSk7XG4gICAgfVxuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX2xpdmVEYXRhV3JpdGVzUHJvbWlzZSA9IHNlbGYuX2ZsdXNoQnVmZmVyZWRXcml0ZXMoKTtcbiAgICAgIGlmIChNZXRlb3IuX2lzUHJvbWlzZShzZWxmLl9saXZlRGF0YVdyaXRlc1Byb21pc2UpKSB7XG4gICAgICAgIHNlbGYuX2xpdmVEYXRhV3JpdGVzUHJvbWlzZS5maW5hbGx5KFxuICAgICAgICAgICgpID0+IChzZWxmLl9saXZlRGF0YVdyaXRlc1Byb21pc2UgPSB1bmRlZmluZWQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSwgc2VsZi5fYnVmZmVyZWRXcml0ZXNJbnRlcnZhbCk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUHJvY2VzcyBpbmRpdmlkdWFsIGRhdGEgbWVzc2FnZXMgYnkgdHlwZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXN5bmMgX3Byb2Nlc3NPbmVEYXRhTWVzc2FnZShtc2csIHVwZGF0ZXMpIHtcbiAgICBjb25zdCBtZXNzYWdlVHlwZSA9IG1zZy5tc2c7XG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XG4gICAgICBjYXNlICdhZGRlZCc6XG4gICAgICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb24uX3Byb2Nlc3NfYWRkZWQobXNnLCB1cGRhdGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjaGFuZ2VkJzpcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5fcHJvY2Vzc19jaGFuZ2VkKG1zZywgdXBkYXRlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVtb3ZlZCc6XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3Byb2Nlc3NfcmVtb3ZlZChtc2csIHVwZGF0ZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JlYWR5JzpcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5fcHJvY2Vzc19yZWFkeShtc2csIHVwZGF0ZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VwZGF0ZWQnOlxuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLl9wcm9jZXNzX3VwZGF0ZWQobXNnLCB1cGRhdGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdub3N1Yic6XG4gICAgICAgIC8vIGlnbm9yZSB0aGlzXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnZGlzY2FyZGluZyB1bmtub3duIGxpdmVkYXRhIGRhdGEgbWVzc2FnZSB0eXBlJywgbXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgSGFuZGxlIG1ldGhvZCByZXN1bHRzIGFycml2aW5nIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBtZXRob2QgcmVzdWx0IG1lc3NhZ2VcbiAgICovXG4gIGFzeW5jIF9saXZlZGF0YV9yZXN1bHQobXNnKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG5cbiAgICAvLyBMZXRzIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gYnVmZmVyZWQgd3JpdGVzIGJlZm9yZSByZXR1cm5pbmcgcmVzdWx0LlxuICAgIGlmICghaXNFbXB0eShzZWxmLl9idWZmZXJlZFdyaXRlcykpIHtcbiAgICAgIGF3YWl0IHNlbGYuX2ZsdXNoQnVmZmVyZWRXcml0ZXMoKTtcbiAgICB9XG5cbiAgICAvLyBmaW5kIHRoZSBvdXRzdGFuZGluZyByZXF1ZXN0XG4gICAgLy8gc2hvdWxkIGJlIE8oMSkgaW4gbmVhcmx5IGFsbCByZWFsaXN0aWMgdXNlIGNhc2VzXG4gICAgaWYgKGlzRW1wdHkoc2VsZi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpKSB7XG4gICAgICBNZXRlb3IuX2RlYnVnKCdSZWNlaXZlZCBtZXRob2QgcmVzdWx0IGJ1dCBubyBtZXRob2RzIG91dHN0YW5kaW5nJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRNZXRob2RCbG9jayA9IHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzWzBdLm1ldGhvZHM7XG4gICAgbGV0IGk7XG4gICAgY29uc3QgbSA9IGN1cnJlbnRNZXRob2RCbG9jay5maW5kKChtZXRob2QsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgZm91bmQgPSBtZXRob2QubWV0aG9kSWQgPT09IG1zZy5pZDtcbiAgICAgIGlmIChmb3VuZCkgaSA9IGlkeDtcbiAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9KTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIE1ldGVvci5fZGVidWcoXCJDYW4ndCBtYXRjaCBtZXRob2QgcmVzcG9uc2UgdG8gb3JpZ2luYWwgbWV0aG9kIGNhbGxcIiwgbXNnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSBjdXJyZW50IG1ldGhvZCBibG9jay4gVGhpcyBtYXkgbGVhdmUgdGhlIGJsb2NrIGVtcHR5LCBidXQgd2VcbiAgICAvLyBkb24ndCBtb3ZlIG9uIHRvIHRoZSBuZXh0IGJsb2NrIHVudGlsIHRoZSBjYWxsYmFjayBoYXMgYmVlbiBkZWxpdmVyZWQsIGluXG4gICAgLy8gX291dHN0YW5kaW5nTWV0aG9kRmluaXNoZWQuXG4gICAgY3VycmVudE1ldGhvZEJsb2NrLnNwbGljZShpLCAxKTtcblxuICAgIGlmIChoYXNPd24uY2FsbChtc2csICdlcnJvcicpKSB7XG4gICAgICBtLnJlY2VpdmVSZXN1bHQoXG4gICAgICAgIG5ldyBNZXRlb3IuRXJyb3IobXNnLmVycm9yLmVycm9yLCBtc2cuZXJyb3IucmVhc29uLCBtc2cuZXJyb3IuZGV0YWlscylcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1zZy5yZXN1bHQgbWF5IGJlIHVuZGVmaW5lZCBpZiB0aGUgbWV0aG9kIGRpZG4ndCByZXR1cm4gYSB2YWx1ZVxuICAgICAgbS5yZWNlaXZlUmVzdWx0KHVuZGVmaW5lZCwgbXNnLnJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEhhbmRsZSBcIm5vc3ViXCIgbWVzc2FnZXMgYXJyaXZpbmcgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIG5vc3ViIG1lc3NhZ2VcbiAgICovXG4gIGFzeW5jIF9saXZlZGF0YV9ub3N1Yihtc2cpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcblxuICAgIC8vIEZpcnN0IHBhc3MgaXQgdGhyb3VnaCBfbGl2ZWRhdGFfZGF0YSwgd2hpY2ggb25seSB1c2VzIGl0IHRvIGhlbHAgZ2V0XG4gICAgLy8gdG93YXJkcyBxdWllc2NlbmNlLlxuICAgIGF3YWl0IHRoaXMuX2xpdmVkYXRhX2RhdGEobXNnKTtcblxuICAgIC8vIERvIHRoZSByZXN0IG9mIG91ciBwcm9jZXNzaW5nIGltbWVkaWF0ZWx5LCB3aXRoIG5vXG4gICAgLy8gYnVmZmVyaW5nLXVudGlsLXF1aWVzY2VuY2UuXG5cbiAgICAvLyB3ZSB3ZXJlbid0IHN1YmJlZCBhbnl3YXksIG9yIHdlIGluaXRpYXRlZCB0aGUgdW5zdWIuXG4gICAgaWYgKCFoYXNPd24uY2FsbChzZWxmLl9zdWJzY3JpcHRpb25zLCBtc2cuaWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjEgI2Vycm9yQ2FsbGJhY2tcbiAgICBjb25zdCBlcnJvckNhbGxiYWNrID0gc2VsZi5fc3Vic2NyaXB0aW9uc1ttc2cuaWRdLmVycm9yQ2FsbGJhY2s7XG4gICAgY29uc3Qgc3RvcENhbGxiYWNrID0gc2VsZi5fc3Vic2NyaXB0aW9uc1ttc2cuaWRdLnN0b3BDYWxsYmFjaztcblxuICAgIHNlbGYuX3N1YnNjcmlwdGlvbnNbbXNnLmlkXS5yZW1vdmUoKTtcblxuICAgIGNvbnN0IG1ldGVvckVycm9yRnJvbU1zZyA9IG1zZ0FyZyA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBtc2dBcmcgJiZcbiAgICAgICAgbXNnQXJnLmVycm9yICYmXG4gICAgICAgIG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgICAgbXNnQXJnLmVycm9yLmVycm9yLFxuICAgICAgICAgIG1zZ0FyZy5lcnJvci5yZWFzb24sXG4gICAgICAgICAgbXNnQXJnLmVycm9yLmRldGFpbHNcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjEgI2Vycm9yQ2FsbGJhY2tcbiAgICBpZiAoZXJyb3JDYWxsYmFjayAmJiBtc2cuZXJyb3IpIHtcbiAgICAgIGVycm9yQ2FsbGJhY2sobWV0ZW9yRXJyb3JGcm9tTXNnKG1zZykpO1xuICAgIH1cblxuICAgIGlmIChzdG9wQ2FsbGJhY2spIHtcbiAgICAgIHN0b3BDYWxsYmFjayhtZXRlb3JFcnJvckZyb21Nc2cobXNnKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEhhbmRsZSBlcnJvcnMgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIF9saXZlZGF0YV9lcnJvcihtc2cpIHtcbiAgICBNZXRlb3IuX2RlYnVnKCdSZWNlaXZlZCBlcnJvciBmcm9tIHNlcnZlcjogJywgbXNnLnJlYXNvbik7XG4gICAgaWYgKG1zZy5vZmZlbmRpbmdNZXNzYWdlKSBNZXRlb3IuX2RlYnVnKCdGb3I6ICcsIG1zZy5vZmZlbmRpbmdNZXNzYWdlKTtcbiAgfVxuXG4gIC8vIERvY3VtZW50IGNoYW5nZSBtZXNzYWdlIHByb2Nlc3NvcnMgd2lsbCBiZSBkZWZpbmVkIGluIGEgc2VwYXJhdGUgY2xhc3Ncbn0iLCIvLyBBIE1ldGhvZEludm9rZXIgbWFuYWdlcyBzZW5kaW5nIGEgbWV0aG9kIHRvIHRoZSBzZXJ2ZXIgYW5kIGNhbGxpbmcgdGhlIHVzZXInc1xuLy8gY2FsbGJhY2tzLiBPbiBjb25zdHJ1Y3Rpb24sIGl0IHJlZ2lzdGVycyBpdHNlbGYgaW4gdGhlIGNvbm5lY3Rpb24nc1xuLy8gX21ldGhvZEludm9rZXJzIG1hcDsgaXQgcmVtb3ZlcyBpdHNlbGYgb25jZSB0aGUgbWV0aG9kIGlzIGZ1bGx5IGZpbmlzaGVkIGFuZFxuLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQuIFRoaXMgb2NjdXJzIHdoZW4gaXQgaGFzIGJvdGggcmVjZWl2ZWQgYSByZXN1bHQsXG4vLyBhbmQgdGhlIGRhdGEgd3JpdHRlbiBieSBpdCBpcyBmdWxseSB2aXNpYmxlLlxuZXhwb3J0IGNsYXNzIE1ldGhvZEludm9rZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgLy8gUHVibGljICh3aXRoaW4gdGhpcyBmaWxlKSBmaWVsZHMuXG4gICAgdGhpcy5tZXRob2RJZCA9IG9wdGlvbnMubWV0aG9kSWQ7XG4gICAgdGhpcy5zZW50TWVzc2FnZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5fY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBvcHRpb25zLmNvbm5lY3Rpb247XG4gICAgdGhpcy5fbWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLl9vblJlc3VsdFJlY2VpdmVkID0gb3B0aW9ucy5vblJlc3VsdFJlY2VpdmVkIHx8ICgoKSA9PiB7fSk7XG4gICAgdGhpcy5fd2FpdCA9IG9wdGlvbnMud2FpdDtcbiAgICB0aGlzLm5vUmV0cnkgPSBvcHRpb25zLm5vUmV0cnk7XG4gICAgdGhpcy5fbWV0aG9kUmVzdWx0ID0gbnVsbDtcbiAgICB0aGlzLl9kYXRhVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgLy8gUmVnaXN0ZXIgd2l0aCB0aGUgY29ubmVjdGlvbi5cbiAgICB0aGlzLl9jb25uZWN0aW9uLl9tZXRob2RJbnZva2Vyc1t0aGlzLm1ldGhvZElkXSA9IHRoaXM7XG4gIH1cbiAgLy8gU2VuZHMgdGhlIG1ldGhvZCBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXIuIE1heSBiZSBjYWxsZWQgYWRkaXRpb25hbCB0aW1lcyBpZlxuICAvLyB3ZSBsb3NlIHRoZSBjb25uZWN0aW9uIGFuZCByZWNvbm5lY3QgYmVmb3JlIHJlY2VpdmluZyBhIHJlc3VsdC5cbiAgc2VuZE1lc3NhZ2UoKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYmVmb3JlIHNlbmRpbmcgYSBtZXRob2QgKGluY2x1ZGluZyByZXNlbmRpbmcgb25cbiAgICAvLyByZWNvbm5lY3QpLiBXZSBzaG91bGQgb25seSAocmUpc2VuZCBtZXRob2RzIHdoZXJlIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBhXG4gICAgLy8gcmVzdWx0IVxuICAgIGlmICh0aGlzLmdvdFJlc3VsdCgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kaW5nTWV0aG9kIGlzIGNhbGxlZCBvbiBtZXRob2Qgd2l0aCByZXN1bHQnKTtcblxuICAgIC8vIElmIHdlJ3JlIHJlLXNlbmRpbmcgaXQsIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIGRhdGEgd2FzIHdyaXR0ZW4gdGhlIGZpcnN0XG4gICAgLy8gdGltZS5cbiAgICB0aGlzLl9kYXRhVmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuc2VudE1lc3NhZ2UgPSB0cnVlO1xuXG4gICAgLy8gSWYgdGhpcyBpcyBhIHdhaXQgbWV0aG9kLCBtYWtlIGFsbCBkYXRhIG1lc3NhZ2VzIGJlIGJ1ZmZlcmVkIHVudGlsIGl0IGlzXG4gICAgLy8gZG9uZS5cbiAgICBpZiAodGhpcy5fd2FpdClcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX21ldGhvZHNCbG9ja2luZ1F1aWVzY2VuY2VbdGhpcy5tZXRob2RJZF0gPSB0cnVlO1xuXG4gICAgLy8gQWN0dWFsbHkgc2VuZCB0aGUgbWVzc2FnZS5cbiAgICB0aGlzLl9jb25uZWN0aW9uLl9zZW5kKHRoaXMuX21lc3NhZ2UpO1xuICB9XG4gIC8vIEludm9rZSB0aGUgY2FsbGJhY2ssIGlmIHdlIGhhdmUgYm90aCBhIHJlc3VsdCBhbmQga25vdyB0aGF0IGFsbCBkYXRhIGhhc1xuICAvLyBiZWVuIHdyaXR0ZW4gdG8gdGhlIGxvY2FsIGNhY2hlLlxuICBfbWF5YmVJbnZva2VDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy5fbWV0aG9kUmVzdWx0ICYmIHRoaXMuX2RhdGFWaXNpYmxlKSB7XG4gICAgICAvLyBDYWxsIHRoZSBjYWxsYmFjay4gKFRoaXMgd29uJ3QgdGhyb3c6IHRoZSBjYWxsYmFjayB3YXMgd3JhcHBlZCB3aXRoXG4gICAgICAvLyBiaW5kRW52aXJvbm1lbnQuKVxuICAgICAgdGhpcy5fY2FsbGJhY2sodGhpcy5fbWV0aG9kUmVzdWx0WzBdLCB0aGlzLl9tZXRob2RSZXN1bHRbMV0pO1xuXG4gICAgICAvLyBGb3JnZXQgYWJvdXQgdGhpcyBtZXRob2QuXG4gICAgICBkZWxldGUgdGhpcy5fY29ubmVjdGlvbi5fbWV0aG9kSW52b2tlcnNbdGhpcy5tZXRob2RJZF07XG5cbiAgICAgIC8vIExldCB0aGUgY29ubmVjdGlvbiBrbm93IHRoYXQgdGhpcyBtZXRob2QgaXMgZmluaXNoZWQsIHNvIGl0IGNhbiB0cnkgdG9cbiAgICAgIC8vIG1vdmUgb24gdG8gdGhlIG5leHQgYmxvY2sgb2YgbWV0aG9kcy5cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX291dHN0YW5kaW5nTWV0aG9kRmluaXNoZWQoKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2FsbCB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBmcm9tIHRoZSBzZXJ2ZXIuIE9ubHkgbWF5IGJlIGNhbGxlZFxuICAvLyBvbmNlOyBvbmNlIGl0IGlzIGNhbGxlZCwgeW91IHNob3VsZCBub3QgY2FsbCBzZW5kTWVzc2FnZSBhZ2Fpbi5cbiAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQgYW4gb25SZXN1bHRSZWNlaXZlZCBjYWxsYmFjaywgY2FsbCBpdCBpbW1lZGlhdGVseS5cbiAgLy8gVGhlbiBpbnZva2UgdGhlIG1haW4gY2FsbGJhY2sgaWYgZGF0YSBpcyBhbHNvIHZpc2libGUuXG4gIHJlY2VpdmVSZXN1bHQoZXJyLCByZXN1bHQpIHtcbiAgICBpZiAodGhpcy5nb3RSZXN1bHQoKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kcyBzaG91bGQgb25seSByZWNlaXZlIHJlc3VsdHMgb25jZScpO1xuICAgIHRoaXMuX21ldGhvZFJlc3VsdCA9IFtlcnIsIHJlc3VsdF07XG4gICAgdGhpcy5fb25SZXN1bHRSZWNlaXZlZChlcnIsIHJlc3VsdCk7XG4gICAgdGhpcy5fbWF5YmVJbnZva2VDYWxsYmFjaygpO1xuICB9XG4gIC8vIENhbGwgdGhpcyB3aGVuIGFsbCBkYXRhIHdyaXR0ZW4gYnkgdGhlIG1ldGhvZCBpcyB2aXNpYmxlLiBUaGlzIG1lYW5zIHRoYXRcbiAgLy8gdGhlIG1ldGhvZCBoYXMgcmV0dXJucyBpdHMgXCJkYXRhIGlzIGRvbmVcIiBtZXNzYWdlICpBTkQqIGFsbCBzZXJ2ZXJcbiAgLy8gZG9jdW1lbnRzIHRoYXQgYXJlIGJ1ZmZlcmVkIGF0IHRoYXQgdGltZSBoYXZlIGJlZW4gd3JpdHRlbiB0byB0aGUgbG9jYWxcbiAgLy8gY2FjaGUuIEludm9rZXMgdGhlIG1haW4gY2FsbGJhY2sgaWYgdGhlIHJlc3VsdCBoYXMgYmVlbiByZWNlaXZlZC5cbiAgZGF0YVZpc2libGUoKSB7XG4gICAgdGhpcy5fZGF0YVZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMuX21heWJlSW52b2tlQ2FsbGJhY2soKTtcbiAgfVxuICAvLyBUcnVlIGlmIHJlY2VpdmVSZXN1bHQgaGFzIGJlZW4gY2FsbGVkLlxuICBnb3RSZXN1bHQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWV0aG9kUmVzdWx0O1xuICB9XG59XG4iLCJpbXBvcnQgeyBNb25nb0lEIH0gZnJvbSAnbWV0ZW9yL21vbmdvLWlkJztcblxuZXhwb3J0IGNsYXNzIE1vbmdvSURNYXAgZXh0ZW5kcyBJZE1hcCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKE1vbmdvSUQuaWRTdHJpbmdpZnksIE1vbmdvSUQuaWRQYXJzZSk7XG4gIH1cbn0iLCJpbXBvcnQgeyBERFBDb21tb24gfSBmcm9tICdtZXRlb3IvZGRwLWNvbW1vbic7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuaW1wb3J0IHsgQ29ubmVjdGlvbiB9IGZyb20gJy4vbGl2ZWRhdGFfY29ubmVjdGlvbi5qcyc7XG5cbi8vIFRoaXMgYXJyYXkgYWxsb3dzIHRoZSBgX2FsbFN1YnNjcmlwdGlvbnNSZWFkeWAgbWV0aG9kIGJlbG93LCB3aGljaFxuLy8gaXMgdXNlZCBieSB0aGUgYHNwaWRlcmFibGVgIHBhY2thZ2UsIHRvIGtlZXAgdHJhY2sgb2Ygd2hldGhlciBhbGxcbi8vIGRhdGEgaXMgcmVhZHkuXG5jb25zdCBhbGxDb25uZWN0aW9ucyA9IFtdO1xuXG4vKipcbiAqIEBuYW1lc3BhY2UgRERQXG4gKiBAc3VtbWFyeSBOYW1lc3BhY2UgZm9yIEREUC1yZWxhdGVkIG1ldGhvZHMvY2xhc3Nlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEREUCA9IHt9O1xuXG4vLyBUaGlzIGlzIHByaXZhdGUgYnV0IGl0J3MgdXNlZCBpbiBhIGZldyBwbGFjZXMuIGFjY291bnRzLWJhc2UgdXNlc1xuLy8gaXQgdG8gZ2V0IHRoZSBjdXJyZW50IHVzZXIuIE1ldGVvci5zZXRUaW1lb3V0IGFuZCBmcmllbmRzIGNsZWFyXG4vLyBpdC4gV2UgY2FuIHByb2JhYmx5IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGZhY3RvciB0aGlzLlxuRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiA9IG5ldyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZSgpO1xuRERQLl9DdXJyZW50UHVibGljYXRpb25JbnZvY2F0aW9uID0gbmV3IE1ldGVvci5FbnZpcm9ubWVudFZhcmlhYmxlKCk7XG5cbi8vIFhYWDogS2VlcCBERFAuX0N1cnJlbnRJbnZvY2F0aW9uIGZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eS5cbkREUC5fQ3VycmVudEludm9jYXRpb24gPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uO1xuXG5ERFAuX0N1cnJlbnRDYWxsQXN5bmNJbnZvY2F0aW9uID0gbmV3IE1ldGVvci5FbnZpcm9ubWVudFZhcmlhYmxlKCk7XG5cbi8vIFRoaXMgaXMgcGFzc2VkIGludG8gYSB3ZWlyZCBgbWFrZUVycm9yVHlwZWAgZnVuY3Rpb24gdGhhdCBleHBlY3RzIGl0cyB0aGluZ1xuLy8gdG8gYmUgYSBjb25zdHJ1Y3RvclxuZnVuY3Rpb24gY29ubmVjdGlvbkVycm9yQ29uc3RydWN0b3IobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5ERFAuQ29ubmVjdGlvbkVycm9yID0gTWV0ZW9yLm1ha2VFcnJvclR5cGUoXG4gICdERFAuQ29ubmVjdGlvbkVycm9yJyxcbiAgY29ubmVjdGlvbkVycm9yQ29uc3RydWN0b3Jcbik7XG5cbkREUC5Gb3JjZWRSZWNvbm5lY3RFcnJvciA9IE1ldGVvci5tYWtlRXJyb3JUeXBlKFxuICAnRERQLkZvcmNlZFJlY29ubmVjdEVycm9yJyxcbiAgKCkgPT4ge31cbik7XG5cbi8vIFJldHVybnMgdGhlIG5hbWVkIHNlcXVlbmNlIG9mIHBzZXVkby1yYW5kb20gdmFsdWVzLlxuLy8gVGhlIHNjb3BlIHdpbGwgYmUgRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKSwgc28gdGhlIHN0cmVhbSB3aWxsIHByb2R1Y2Vcbi8vIGNvbnNpc3RlbnQgdmFsdWVzIGZvciBtZXRob2QgY2FsbHMgb24gdGhlIGNsaWVudCBhbmQgc2VydmVyLlxuRERQLnJhbmRvbVN0cmVhbSA9IG5hbWUgPT4ge1xuICBjb25zdCBzY29wZSA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uZ2V0KCk7XG4gIHJldHVybiBERFBDb21tb24uUmFuZG9tU3RyZWFtLmdldChzY29wZSwgbmFtZSk7XG59O1xuXG4vLyBAcGFyYW0gdXJsIHtTdHJpbmd9IFVSTCB0byBNZXRlb3IgYXBwLFxuLy8gICAgIGUuZy46XG4vLyAgICAgXCJzdWJkb21haW4ubWV0ZW9yLmNvbVwiLFxuLy8gICAgIFwiaHR0cDovL3N1YmRvbWFpbi5tZXRlb3IuY29tXCIsXG4vLyAgICAgXCIvXCIsXG4vLyAgICAgXCJkZHArc29ja2pzOi8vZGRwLS0qKioqLWZvby5tZXRlb3IuY29tL3NvY2tqc1wiXG5cbi8qKlxuICogQHN1bW1hcnkgQ29ubmVjdCB0byB0aGUgc2VydmVyIG9mIGEgZGlmZmVyZW50IE1ldGVvciBhcHBsaWNhdGlvbiB0byBzdWJzY3JpYmUgdG8gaXRzIGRvY3VtZW50IHNldHMgYW5kIGludm9rZSBpdHMgcmVtb3RlIG1ldGhvZHMuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCBvZiBhbm90aGVyIE1ldGVvciBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5yZWxvYWRXaXRoT3V0c3RhbmRpbmcgaXMgaXQgT0sgdG8gcmVsb2FkIGlmIHRoZXJlIGFyZSBvdXRzdGFuZGluZyBtZXRob2RzP1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaGVhZGVycyBleHRyYSBoZWFkZXJzIHRvIHNlbmQgb24gdGhlIHdlYnNvY2tldHMgY29ubmVjdGlvbiwgZm9yIHNlcnZlci10by1zZXJ2ZXIgRERQIG9ubHlcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLl9zb2NranNPcHRpb25zIFNwZWNpZmllcyBvcHRpb25zIHRvIHBhc3MgdGhyb3VnaCB0byB0aGUgc29ja2pzIGNsaWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5vbkREUE5lZ290aWF0aW9uVmVyc2lvbkZhaWx1cmUgY2FsbGJhY2sgd2hlbiB2ZXJzaW9uIG5lZ290aWF0aW9uIGZhaWxzLlxuICovXG5ERFAuY29ubmVjdCA9ICh1cmwsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IENvbm5lY3Rpb24odXJsLCBvcHRpb25zKTtcbiAgYWxsQ29ubmVjdGlvbnMucHVzaChyZXQpOyAvLyBoYWNrLiBzZWUgYmVsb3cuXG4gIHJldHVybiByZXQ7XG59O1xuXG5ERFAuX3JlY29ubmVjdEhvb2sgPSBuZXcgSG9vayh7IGJpbmRFbnZpcm9ubWVudDogZmFsc2UgfSk7XG5cbi8qKlxuICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBjYWxsIGFzIHRoZSBmaXJzdCBzdGVwIG9mXG4gKiByZWNvbm5lY3RpbmcuIFRoaXMgZnVuY3Rpb24gY2FuIGNhbGwgbWV0aG9kcyB3aGljaCB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZVxuICogYW55IG90aGVyIG91dHN0YW5kaW5nIG1ldGhvZHMuIEZvciBleGFtcGxlLCB0aGlzIGNhbiBiZSB1c2VkIHRvIHJlLWVzdGFibGlzaFxuICogdGhlIGFwcHJvcHJpYXRlIGF1dGhlbnRpY2F0aW9uIGNvbnRleHQgb24gdGhlIGNvbm5lY3Rpb24uXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBjYWxsLiBJdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFcbiAqIHNpbmdsZSBhcmd1bWVudCwgdGhlIFtjb25uZWN0aW9uIG9iamVjdF0oI2RkcF9jb25uZWN0KSB0aGF0IGlzIHJlY29ubmVjdGluZy5cbiAqL1xuRERQLm9uUmVjb25uZWN0ID0gY2FsbGJhY2sgPT4gRERQLl9yZWNvbm5lY3RIb29rLnJlZ2lzdGVyKGNhbGxiYWNrKTtcblxuLy8gSGFjayBmb3IgYHNwaWRlcmFibGVgIHBhY2thZ2U6IGEgd2F5IHRvIHNlZSBpZiB0aGUgcGFnZSBpcyBkb25lXG4vLyBsb2FkaW5nIGFsbCB0aGUgZGF0YSBpdCBuZWVkcy5cbi8vXG5ERFAuX2FsbFN1YnNjcmlwdGlvbnNSZWFkeSA9ICgpID0+IGFsbENvbm5lY3Rpb25zLmV2ZXJ5KFxuICBjb25uID0+IE9iamVjdC52YWx1ZXMoY29ubi5fc3Vic2NyaXB0aW9ucykuZXZlcnkoc3ViID0+IHN1Yi5yZWFkeSlcbik7XG4iXX0=
