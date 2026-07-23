Package["core-runtime"].queue("mongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var NpmModuleMongodb = Package['npm-mongo'].NpmModuleMongodb;
var NpmModuleMongodbVersion = Package['npm-mongo'].NpmModuleMongodbVersion;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var Decimal = Package['mongo-decimal'].Decimal;
var MaxHeap = Package['binary-heap'].MaxHeap;
var MinHeap = Package['binary-heap'].MinHeap;
var MinMaxHeap = Package['binary-heap'].MinMaxHeap;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MongoInternals, callback, CollectionExtensions, Mongo, ObserveMultiplexer;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"mongo_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_driver.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({listenAll:()=>listenAll,forEachTrigger:()=>forEachTrigger},true);let OplogHandle;module.link('./oplog_tailing',{OplogHandle(v){OplogHandle=v}},0);let MongoConnection;module.link('./mongo_connection',{MongoConnection(v){MongoConnection=v}},1);let OplogObserveDriver;module.link('./oplog_observe_driver',{OplogObserveDriver(v){OplogObserveDriver=v}},2);let MongoDB;module.link('./mongo_common',{MongoDB(v){MongoDB=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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




MongoInternals = global.MongoInternals = {};
MongoInternals.__packageName = 'mongo';
MongoInternals.NpmModules = {
    mongodb: {
        version: NpmModuleMongodbVersion,
        module: MongoDB
    }
};
// Older version of what is now available via
// MongoInternals.NpmModules.mongodb.module.  It was never documented, but
// people do use it.
// XXX COMPAT WITH 1.0.3.2
MongoInternals.NpmModule = new Proxy(MongoDB, {
    get (target, propertyKey, receiver) {
        if (propertyKey === 'ObjectID') {
            Meteor.deprecate(`Accessing 'MongoInternals.NpmModule.ObjectID' directly is deprecated. ` + `Use 'MongoInternals.NpmModule.ObjectId' instead.`);
        }
        return Reflect.get(target, propertyKey, receiver);
    }
});
MongoInternals.OplogHandle = OplogHandle;
MongoInternals.Connection = MongoConnection;
MongoInternals.OplogObserveDriver = OplogObserveDriver;
// This is used to add or remove EJSON from the beginning of everything nested
// inside an EJSON custom type. It should only be called on pure JSON!
// Ensure that EJSON.clone keeps a Timestamp as a Timestamp (instead of just
// doing a structural clone).
// XXX how ok is this? what if there are multiple copies of MongoDB loaded?
MongoDB.Timestamp.prototype.clone = function() {
    // Timestamps should be immutable.
    return this;
};
// Listen for the invalidation messages that will trigger us to poll the
// database for changes. If this selector specifies specific IDs, specify them
// here, so that updates to different specific IDs don't cause us to poll.
// listenCallback is the same kind of (notification, complete) callback passed
// to InvalidationCrossbar.listen.
const listenAll = function(cursorDescription, listenCallback) {
    return _async_to_generator(function*() {
        const listeners = [];
        yield forEachTrigger(cursorDescription, function(trigger) {
            listeners.push(DDPServer._InvalidationCrossbar.listen(trigger, listenCallback));
        });
        return {
            stop: function() {
                listeners.forEach(function(listener) {
                    listener.stop();
                });
            }
        };
    })();
};
const forEachTrigger = function(cursorDescription, triggerCallback) {
    return _async_to_generator(function*() {
        const key = {
            collection: cursorDescription.collectionName
        };
        const specificIds = LocalCollection._idsMatchedBySelector(cursorDescription.selector);
        if (specificIds) {
            for (const id of specificIds){
                yield triggerCallback(Object.assign({
                    id: id
                }, key));
            }
            yield triggerCallback(Object.assign({
                dropCollection: true,
                id: null
            }, key));
        } else {
            yield triggerCallback(key);
        }
        // Everyone cares about the database being dropped.
        yield triggerCallback({
            dropDatabase: true
        });
    })();
};
// XXX We probably need to find a better way to expose this. Right now
// it's only used by tests, but in fact you need it in normal
// operation to interact with capped collections.
MongoInternals.MongoTimestamp = MongoDB.Timestamp;
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oplog_tailing.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_tailing.ts                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({OplogHandle:()=>OplogHandle,idForOp:()=>idForOp});module.export({OPLOG_COLLECTION:()=>OPLOG_COLLECTION},true);let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},0);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},1);let CursorDescription;module.link('./cursor_description',{CursorDescription(v){CursorDescription=v}},2);let MongoConnection;module.link('./mongo_connection',{MongoConnection(v){MongoConnection=v}},3);let NpmModuleMongodb;module.link("meteor/npm-mongo",{NpmModuleMongodb(v){NpmModuleMongodb=v}},4);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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





const { Long } = NpmModuleMongodb;
const OPLOG_COLLECTION = 'oplog.rs';
let TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
const TAIL_TIMEOUT = +(process.env.METEOR_OPLOG_TAIL_TIMEOUT || 30000);
class OplogHandle {
    _nsAllowed(ns) {
        if (!ns) return false;
        if (ns === 'admin.$cmd') return true;
        if (this._includeNSRegex && !this._includeNSRegex.test(ns)) return false;
        if (this._excludeNSRegex && this._excludeNSRegex.test(ns)) return false;
        return true;
    }
    _getOplogSelector(lastProcessedTS) {
        var _this__oplogOptions_excludeCollections, _this__oplogOptions_includeCollections;
        const oplogCriteria = [
            {
                $or: [
                    {
                        op: {
                            $in: [
                                "i",
                                "u",
                                "d"
                            ]
                        }
                    },
                    {
                        op: "c",
                        "o.drop": {
                            $exists: true
                        }
                    },
                    {
                        op: "c",
                        "o.dropDatabase": 1
                    },
                    {
                        op: "c",
                        "o.applyOps": {
                            $exists: true
                        }
                    }
                ]
            }
        ];
        if ((_this__oplogOptions_excludeCollections = this._oplogOptions.excludeCollections) === null || _this__oplogOptions_excludeCollections === void 0 ? void 0 : _this__oplogOptions_excludeCollections.length) {
            const nsRegex = new RegExp('^(?:' + [
                // @ts-ignore
                Meteor._escapeRegExp(this._dbName + '.')
            ].join('|') + ')');
            const excludeNs = {
                $regex: nsRegex,
                $nin: this._oplogOptions.excludeCollections.map((collName)=>`${this._dbName}.${collName}`)
            };
            oplogCriteria.push({
                $or: [
                    {
                        ns: excludeNs
                    },
                    {
                        ns: /^admin\.\$cmd/,
                        'o.applyOps': {
                            $elemMatch: {
                                ns: excludeNs
                            }
                        }
                    }
                ]
            });
        } else if ((_this__oplogOptions_includeCollections = this._oplogOptions.includeCollections) === null || _this__oplogOptions_includeCollections === void 0 ? void 0 : _this__oplogOptions_includeCollections.length) {
            const includeNs = {
                $in: this._oplogOptions.includeCollections.map((collName)=>`${this._dbName}.${collName}`)
            };
            oplogCriteria.push({
                $or: [
                    {
                        ns: includeNs
                    },
                    {
                        ns: /^admin\.\$cmd/,
                        'o.applyOps.ns': includeNs
                    }
                ]
            });
        } else {
            const nsRegex = new RegExp("^(?:" + [
                // @ts-ignore
                Meteor._escapeRegExp(this._dbName + "."),
                // @ts-ignore
                Meteor._escapeRegExp("admin.$cmd")
            ].join("|") + ")");
            oplogCriteria.push({
                ns: nsRegex
            });
        }
        if (lastProcessedTS) {
            oplogCriteria.push({
                ts: {
                    $gt: lastProcessedTS
                }
            });
        }
        return {
            $and: oplogCriteria
        };
    }
    stop() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            this._stopped = true;
            if (this._tailHandle) {
                yield this._tailHandle.stop();
            }
        }).call(this);
    }
    _onOplogEntry(trigger, callback) {
        return _async_to_generator(function*() {
            if (this._stopped) {
                throw new Error("Called onOplogEntry on stopped handle!");
            }
            yield this._readyPromise;
            const originalCallback = callback;
            /**
     * This depends on AsynchronousQueue tasks being wrapped in `bindEnvironment` too.
     *
     * @todo Check after we simplify the `bindEnvironment` implementation if we can remove the second wrap.
     */ callback = Meteor.bindEnvironment(function(notification) {
                originalCallback(notification);
            }, // @ts-ignore
            function(err) {
                Meteor._debug("Error in oplog callback", err);
            });
            const listenHandle = this._crossbar.listen(trigger, callback);
            return {
                stop: function() {
                    return _async_to_generator(function*() {
                        yield listenHandle.stop();
                    })();
                }
            };
        }).call(this);
    }
    onOplogEntry(trigger, callback) {
        return this._onOplogEntry(trigger, callback);
    }
    onSkippedEntries(callback) {
        if (this._stopped) {
            throw new Error("Called onSkippedEntries on stopped handle!");
        }
        return this._onSkippedEntriesHook.register(callback);
    }
    _waitUntilCaughtUp() {
        return _async_to_generator(function*() {
            if (this._stopped) {
                throw new Error("Called waitUntilCaughtUp on stopped handle!");
            }
            yield this._readyPromise;
            let lastEntry = null;
            while(!this._stopped){
                const oplogSelector = this._getOplogSelector();
                try {
                    lastEntry = yield this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, oplogSelector, {
                        projection: {
                            ts: 1
                        },
                        sort: {
                            $natural: -1
                        }
                    });
                    break;
                } catch (e) {
                    Meteor._debug("Got exception while reading last entry", e);
                    // @ts-ignore
                    yield Meteor.sleep(100);
                }
            }
            if (this._stopped) return;
            if (!lastEntry) return;
            const ts = lastEntry.ts;
            if (!ts) {
                throw Error("oplog entry without ts: " + JSON.stringify(lastEntry));
            }
            if (this._lastProcessedTS && ts.lessThanOrEqual(this._lastProcessedTS)) {
                return;
            }
            let insertAfter = this._catchingUpResolvers.length;
            while(insertAfter - 1 > 0 && this._catchingUpResolvers[insertAfter - 1].ts.greaterThan(ts)){
                insertAfter--;
            }
            let promiseResolver = null;
            const promiseToAwait = new Promise((r)=>promiseResolver = r);
            clearTimeout(this._resolveTimeout);
            this._resolveTimeout = setTimeout(()=>{
                console.error("Meteor: oplog catching up took too long", {
                    ts
                });
            }, 10000);
            this._catchingUpResolvers.splice(insertAfter, 0, {
                ts,
                resolver: promiseResolver
            });
            yield promiseToAwait;
            clearTimeout(this._resolveTimeout);
        }).call(this);
    }
    waitUntilCaughtUp() {
        return _async_to_generator(function*() {
            return this._waitUntilCaughtUp();
        }).call(this);
    }
    _startTailing() {
        return _async_to_generator(function*() {
            const mongodbUri = require('mongodb-uri');
            if (mongodbUri.parse(this._oplogUrl).database !== 'local') {
                throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
            }
            this._oplogTailConnection = new MongoConnection(this._oplogUrl, {
                maxPoolSize: 1,
                minPoolSize: 1
            });
            this._oplogLastEntryConnection = new MongoConnection(this._oplogUrl, {
                maxPoolSize: 1,
                minPoolSize: 1
            });
            try {
                const isMasterDoc = yield this._oplogLastEntryConnection.db.admin().command({
                    ismaster: 1
                });
                if (!(isMasterDoc && isMasterDoc.setName)) {
                    throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
                }
                const lastOplogEntry = yield this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, {}, {
                    sort: {
                        $natural: -1
                    },
                    projection: {
                        ts: 1
                    }
                });
                const oplogSelector = this._getOplogSelector(lastOplogEntry === null || lastOplogEntry === void 0 ? void 0 : lastOplogEntry.ts);
                if (lastOplogEntry) {
                    this._lastProcessedTS = lastOplogEntry.ts;
                }
                const cursorDescription = new CursorDescription(OPLOG_COLLECTION, oplogSelector, {
                    tailable: true
                });
                this._tailHandle = this._oplogTailConnection.tail(cursorDescription, (doc)=>{
                    this._entryQueue.push(doc);
                    this._maybeStartWorker();
                }, TAIL_TIMEOUT);
                this._readyPromiseResolver();
            } catch (error) {
                console.error('Error in _startTailing:', error);
                throw error;
            }
        }).call(this);
    }
    _maybeStartWorker() {
        if (this._workerPromise) return;
        this._workerActive = true;
        // Convert to a proper promise-based queue processor
        this._workerPromise = (()=>_async_to_generator(function*() {
                try {
                    while(!this._stopped && !this._entryQueue.isEmpty()){
                        // Are we too far behind? Just tell our observers that they need to
                        // repoll, and drop our queue.
                        if (this._entryQueue.length > TOO_FAR_BEHIND) {
                            const lastEntry = this._entryQueue.pop();
                            this._entryQueue.clear();
                            this._onSkippedEntriesHook.each((callback)=>{
                                callback();
                                return true;
                            });
                            // Free any waitUntilCaughtUp() calls that were waiting for us to
                            // pass something that we just skipped.
                            this._setLastProcessedTS(lastEntry.ts);
                            continue;
                        }
                        // Process next batch from the queue
                        const doc = this._entryQueue.shift();
                        try {
                            yield handleDoc(this, doc);
                            // Process any waiting fence callbacks
                            if (doc.ts) {
                                this._setLastProcessedTS(doc.ts);
                            }
                        } catch (e) {
                            // Keep processing queue even if one entry fails
                            console.error('Error processing oplog entry:', e);
                        }
                    }
                } finally{
                    this._workerPromise = null;
                    this._workerActive = false;
                }
            }).call(this))();
    }
    _setLastProcessedTS(ts) {
        this._lastProcessedTS = ts;
        while(!isEmpty(this._catchingUpResolvers) && this._catchingUpResolvers[0].ts.lessThanOrEqual(this._lastProcessedTS)){
            const sequencer = this._catchingUpResolvers.shift();
            sequencer.resolver();
        }
    }
    _defineTooFarBehind(value) {
        TOO_FAR_BEHIND = value;
    }
    _resetTooFarBehind() {
        TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
    }
    constructor(oplogUrl, dbName){
        var _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings, _Meteor_settings_packages_mongo1, _Meteor_settings_packages1, _Meteor_settings1;
        _define_property(this, "_oplogUrl", void 0);
        _define_property(this, "_dbName", void 0);
        _define_property(this, "_oplogLastEntryConnection", void 0);
        _define_property(this, "_oplogTailConnection", void 0);
        _define_property(this, "_oplogOptions", void 0);
        _define_property(this, "_includeNSRegex", void 0);
        _define_property(this, "_excludeNSRegex", void 0);
        _define_property(this, "_stopped", void 0);
        _define_property(this, "_tailHandle", void 0);
        _define_property(this, "_readyPromiseResolver", void 0);
        _define_property(this, "_readyPromise", void 0);
        _define_property(this, "_crossbar", void 0);
        _define_property(this, "_catchingUpResolvers", void 0);
        _define_property(this, "_lastProcessedTS", void 0);
        _define_property(this, "_onSkippedEntriesHook", void 0);
        _define_property(this, "_startTrailingPromise", void 0);
        _define_property(this, "_resolveTimeout", void 0);
        _define_property(this, "_entryQueue", new Meteor._DoubleEndedQueue());
        _define_property(this, "_workerActive", false);
        _define_property(this, "_workerPromise", null);
        this._oplogUrl = oplogUrl;
        this._dbName = dbName;
        this._resolveTimeout = null;
        this._oplogLastEntryConnection = null;
        this._oplogTailConnection = null;
        this._stopped = false;
        this._tailHandle = null;
        this._readyPromiseResolver = null;
        this._readyPromise = new Promise((r)=>this._readyPromiseResolver = r);
        this._crossbar = new DDPServer._Crossbar({
            factPackage: "mongo-livedata",
            factName: "oplog-watchers"
        });
        const includeCollections = (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : _Meteor_settings_packages_mongo.oplogIncludeCollections;
        const excludeCollections = (_Meteor_settings1 = Meteor.settings) === null || _Meteor_settings1 === void 0 ? void 0 : (_Meteor_settings_packages1 = _Meteor_settings1.packages) === null || _Meteor_settings_packages1 === void 0 ? void 0 : (_Meteor_settings_packages_mongo1 = _Meteor_settings_packages1.mongo) === null || _Meteor_settings_packages_mongo1 === void 0 ? void 0 : _Meteor_settings_packages_mongo1.oplogExcludeCollections;
        if ((includeCollections === null || includeCollections === void 0 ? void 0 : includeCollections.length) && (excludeCollections === null || excludeCollections === void 0 ? void 0 : excludeCollections.length)) {
            throw new Error("Can't use both mongo oplog settings oplogIncludeCollections and oplogExcludeCollections at the same time.");
        }
        this._oplogOptions = {
            includeCollections,
            excludeCollections
        };
        if (includeCollections === null || includeCollections === void 0 ? void 0 : includeCollections.length) {
            const incAlt = includeCollections.map((c)=>Meteor._escapeRegExp(c)).join('|');
            this._includeNSRegex = new RegExp(`^${Meteor._escapeRegExp(this._dbName)}\\.(?:${incAlt})$`);
        }
        if (excludeCollections === null || excludeCollections === void 0 ? void 0 : excludeCollections.length) {
            const excAlt = excludeCollections.map((c)=>Meteor._escapeRegExp(c)).join('|');
            this._excludeNSRegex = new RegExp(`^${Meteor._escapeRegExp(this._dbName)}\\.(?:${excAlt})$`);
        }
        this._catchingUpResolvers = [];
        this._lastProcessedTS = null;
        this._onSkippedEntriesHook = new Hook({
            debugPrintExceptions: "onSkippedEntries callback"
        });
        this._startTrailingPromise = this._startTailing();
    }
}
function idForOp(op) {
    if (op.op === 'd' || op.op === 'i') {
        return op.o._id;
    } else if (op.op === 'u') {
        return op.o2._id;
    } else if (op.op === 'c') {
        throw Error("Operator 'c' doesn't supply an object with id: " + JSON.stringify(op));
    } else {
        throw Error("Unknown op: " + JSON.stringify(op));
    }
}
function handleDoc(handle, doc) {
    return _async_to_generator(function*() {
        if (doc.ns === "admin.$cmd") {
            if (doc.o.applyOps) {
                // This was a successful transaction, so we need to apply the
                // operations that were involved.
                let nextTimestamp = doc.ts;
                for (const op of doc.o.applyOps){
                    // See https://github.com/meteor/meteor/issues/10420.
                    if (!op.ts) {
                        op.ts = nextTimestamp;
                        nextTimestamp = nextTimestamp.add(Long.ONE);
                    }
                    // Only forward sub-ops whose ns is allowed
                    // See https://github.com/meteor/meteor/issues/13945
                    if (!handle['_nsAllowed'](op.ns)) {
                        continue;
                    }
                    yield handleDoc(handle, op);
                }
                return;
            }
            throw new Error("Unknown command " + JSON.stringify(doc));
        }
        const trigger = {
            dropCollection: false,
            dropDatabase: false,
            op: doc
        };
        if (typeof doc.ns === "string" && doc.ns.startsWith(handle._dbName + ".")) {
            trigger.collection = doc.ns.slice(handle._dbName.length + 1);
        }
        // Is it a special command and the collection name is hidden
        // somewhere in operator?
        if (trigger.collection === "$cmd") {
            if (doc.o.dropDatabase) {
                delete trigger.collection;
                trigger.dropDatabase = true;
            } else if ("drop" in doc.o) {
                trigger.collection = doc.o.drop;
                trigger.dropCollection = true;
                trigger.id = null;
            } else if ("create" in doc.o && "idIndex" in doc.o) {
            // A collection got implicitly created within a transaction. There's
            // no need to do anything about it.
            } else {
                throw Error("Unknown command " + JSON.stringify(doc));
            }
        } else {
            // All other ops have an id.
            trigger.id = idForOp(doc);
        }
        yield handle._crossbar.fire(trigger);
        yield new Promise((resolve)=>setImmediate(resolve));
    })();
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"observe_multiplex.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_multiplex.ts                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({ObserveMultiplexer:()=>ObserveMultiplexer});let isEmpty;module.link("lodash.isempty",{default(v){isEmpty=v}},0);let EJSON;module.link("meteor/ejson",{EJSON(v){EJSON=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
function _object_without_properties(source, excluded) {
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


/**
 * Allows multiple identical ObserveHandles to be driven by a single observe driver.
 *
 * This optimization ensures that multiple identical observations
 * don't result in duplicate database queries.
 */ class ObserveMultiplexer {
    addHandleAndSendInitialAdds(handle) {
        return this._addHandleAndSendInitialAdds(handle);
    }
    _addHandleAndSendInitialAdds(handle) {
        return _async_to_generator(function*() {
            ++this._addHandleTasksScheduledButNotPerformed;
            // @ts-ignore
            Package["facts-base"] && Package["facts-base"].Facts.incrementServerFact("mongo-livedata", "observe-handles", 1);
            yield this._queue.runTask(()=>_async_to_generator(function*() {
                    this._handles[handle._id] = handle;
                    yield this._sendAdds(handle);
                    --this._addHandleTasksScheduledButNotPerformed;
                }).call(this));
            yield this._readyPromise;
        }).call(this);
    }
    removeHandle(id) {
        return _async_to_generator(function*() {
            if (!this._ready()) throw new Error("Can't remove handles until the multiplex is ready");
            delete this._handles[id];
            // @ts-ignore
            Package["facts-base"] && Package["facts-base"].Facts.incrementServerFact("mongo-livedata", "observe-handles", -1);
            if (isEmpty(this._handles) && this._addHandleTasksScheduledButNotPerformed === 0) {
                yield this._stop();
            }
        }).call(this);
    }
    _stop() {
        return _async_to_generator(function*(options = {}) {
            if (!this._ready() && !options.fromQueryError) throw Error("surprising _stop: not ready");
            yield this._onStop();
            // @ts-ignore
            Package["facts-base"] && Package["facts-base"].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", -1);
            this._handles = null;
        }).apply(this, arguments);
    }
    ready() {
        return _async_to_generator(function*() {
            yield this._queue.queueTask(()=>{
                if (this._ready()) throw Error("can't make ObserveMultiplex ready twice!");
                if (!this._resolver) {
                    throw new Error("Missing resolver");
                }
                this._resolver();
                this._isReady = true;
            });
        }).call(this);
    }
    queryError(err) {
        return _async_to_generator(function*() {
            yield this._queue.runTask(()=>{
                if (this._ready()) throw Error("can't claim query has an error after it worked!");
                this._stop({
                    fromQueryError: true
                });
                throw err;
            });
        }).call(this);
    }
    onFlush(cb) {
        return _async_to_generator(function*() {
            // Use runTask, not queueTask: queueTask returns void so `await` resolves
            // immediately and the cb runs as fire-and-forget. Callers (e.g.
            // ChangeStreamObserveDriver.onBeforeFire) rely on `await onFlush(...)`
            // actually waiting for the cb to commit its write — without this, fences
            // fire before queued commits run and we lose backpressure.
            yield this._queue.runTask(()=>_async_to_generator(function*() {
                    if (!this._ready()) throw Error("only call onFlush on a multiplexer that will be ready");
                    yield cb();
                }).call(this));
        }).call(this);
    }
    callbackNames() {
        return this._ordered ? [
            "addedBefore",
            "changed",
            "movedBefore",
            "removed"
        ] : [
            "added",
            "changed",
            "removed"
        ];
    }
    _ready() {
        return !!this._isReady;
    }
    _applyCallback(callbackName, args) {
        // Update cache SYNCHRONOUSLY so it's immediately available for subsequent
        // operations. This prevents race conditions where an update event arrives
        // before the insert has been recorded in the cache.
        this._cache.applyChange[callbackName].apply(null, args);
        // Queue the callback notifications asynchronously
        this._queue.queueTask(()=>_async_to_generator(function*() {
                if (!this._handles) return;
                if (!this._ready() && callbackName !== "added" && callbackName !== "addedBefore") {
                    throw new Error(`Got ${callbackName} during initial adds`);
                }
                for (const handleId of Object.keys(this._handles)){
                    const handle = this._handles && this._handles[handleId];
                    if (!handle) return;
                    const callback = handle[`_${callbackName}`];
                    if (!callback) continue;
                    const result = callback.apply(null, handle.nonMutatingCallbacks ? args : EJSON.clone(args));
                    if (result && Meteor._isPromise(result)) {
                        result.catch((error)=>{
                            console.error(`Error in observeChanges callback ${callbackName}:`, error);
                        });
                    }
                    handle.initialAddsSent.then(result);
                }
            }).call(this));
    }
    _sendAdds(handle) {
        return _async_to_generator(function*() {
            const add = this._ordered ? handle._addedBefore : handle._added;
            if (!add) return;
            const addPromises = [];
            // note: docs may be an _IdMap or an OrderedDict
            this._cache.docs.forEach((doc, id)=>{
                if (!(handle._id in this._handles)) {
                    throw Error("handle got removed before sending initial adds!");
                }
                const _ref = handle.nonMutatingCallbacks ? doc : EJSON.clone(doc), { _id } = _ref, fields = _object_without_properties(_ref, [
                    "_id"
                ]);
                const promise = new Promise((resolve, reject)=>{
                    try {
                        const r = this._ordered ? add(id, fields, null) : add(id, fields);
                        resolve(r);
                    } catch (error) {
                        reject(error);
                    }
                });
                addPromises.push(promise);
            });
            yield Promise.allSettled(addPromises).then((p)=>{
                p.forEach((result)=>{
                    if (result.status === "rejected") {
                        console.error(`Error in adds for handle: ${result.reason}`);
                    }
                });
            });
            handle.initialAddsSentResolver();
        }).call(this);
    }
    constructor({ ordered, onStop = ()=>{} }){
        _define_property(this, "_ordered", void 0);
        _define_property(this, "_onStop", void 0);
        _define_property(this, "_queue", void 0);
        _define_property(this, "_handles", void 0);
        _define_property(this, "_resolver", void 0);
        _define_property(this, "_readyPromise", void 0);
        _define_property(this, "_isReady", void 0);
        _define_property(this, "_cache", void 0);
        _define_property(this, "_addHandleTasksScheduledButNotPerformed", void 0);
        if (ordered === undefined) throw Error("must specify ordered");
        // @ts-ignore
        Package["facts-base"] && Package["facts-base"].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", 1);
        this._ordered = ordered;
        this._onStop = onStop;
        this._queue = new Meteor._AsynchronousQueue();
        this._handles = {};
        this._resolver = null;
        this._isReady = false;
        this._readyPromise = new Promise((r)=>this._resolver = r).then(()=>this._isReady = true);
        // @ts-ignore
        this._cache = new LocalCollection._CachingChangeObserver({
            ordered
        });
        this._addHandleTasksScheduledButNotPerformed = 0;
        this.callbackNames().forEach((callbackName)=>{
            this[callbackName] = (...args)=>{
                this._applyCallback(callbackName, args);
            };
        });
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"doc_fetcher.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/doc_fetcher.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({DocFetcher:()=>DocFetcher});function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
class DocFetcher {
    // Fetches document "id" from collectionName, returning it or null if not
    // found.
    //
    // If you make multiple calls to fetch() with the same op reference,
    // DocFetcher may assume that they all return the same document. (It does
    // not check to see if collectionName/id match.)
    //
    // You may assume that callback is never called synchronously (and in fact
    // OplogObserveDriver does so).
    fetch(collectionName, id, op, callback) {
        return _async_to_generator(function*() {
            const self = this;
            check(collectionName, String);
            check(op, Object);
            // If there's already an in-progress fetch for this cache key, yield until
            // it's done and return whatever it returns.
            if (self._callbacksForOp.has(op)) {
                self._callbacksForOp.get(op).push(callback);
                return;
            }
            const callbacks = [
                callback
            ];
            self._callbacksForOp.set(op, callbacks);
            try {
                var doc = (yield self._mongoConnection.findOneAsync(collectionName, {
                    _id: id
                })) || null;
                // Return doc to all relevant callbacks. Note that this array can
                // continue to grow during callback excecution.
                while(callbacks.length > 0){
                    // Clone the document so that the various calls to fetch don't return
                    // objects that are intertwingled with each other. Clone before
                    // popping the future, so that if clone throws, the error gets passed
                    // to the next callback.
                    callbacks.pop()(null, EJSON.clone(doc));
                }
            } catch (e) {
                while(callbacks.length > 0){
                    callbacks.pop()(e);
                }
            } finally{
                // XXX consider keeping the doc around for a period of time before
                // removing from the cache
                self._callbacksForOp.delete(op);
            }
        }).call(this);
    }
    constructor(mongoConnection){
        this._mongoConnection = mongoConnection;
        // Map from op -> [callback]
        this._callbacksForOp = new Map();
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"polling_observe_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/polling_observe_driver.ts                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({PollingObserveDriver:()=>PollingObserveDriver});let throttle;module.link('lodash.throttle',{default(v){throttle=v}},0);let listenAll;module.link('./mongo_driver',{listenAll(v){listenAll=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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


const POLLING_THROTTLE_MS = +(process.env.METEOR_POLLING_THROTTLE_MS || '') || 50;
const POLLING_INTERVAL_MS = +(process.env.METEOR_POLLING_INTERVAL_MS || '') || 10 * 1000;
/**
 * @class PollingObserveDriver
 *
 * One of two observe driver implementations.
 *
 * Characteristics:
 * - Caches the results of a query
 * - Reruns the query when necessary
 * - Suitable for cases where oplog tailing is not available or practical
 */ class PollingObserveDriver {
    _init() {
        return _async_to_generator(function*() {
            var _Package_factsbase;
            const options = this._options;
            const listenersHandle = yield listenAll(this._cursorDescription, (notification)=>{
                const fence = DDPServer._getCurrentFence();
                if (fence) {
                    this._pendingWrites.push(fence.beginWrite());
                }
                if (this._pollsScheduledButNotStarted === 0) {
                    this._ensurePollIsScheduled();
                }
            });
            this._stopCallbacks.push(()=>_async_to_generator(function*() {
                    yield listenersHandle.stop();
                })());
            if (options._testOnlyPollCallback) {
                this._testOnlyPollCallback = options._testOnlyPollCallback;
            } else {
                const pollingInterval = this._cursorDescription.options.pollingIntervalMs || this._cursorDescription.options._pollingInterval || POLLING_INTERVAL_MS;
                const intervalHandle = Meteor.setInterval(this._ensurePollIsScheduled.bind(this), pollingInterval);
                this._stopCallbacks.push(()=>{
                    Meteor.clearInterval(intervalHandle);
                });
            }
            yield this._unthrottledEnsurePollIsScheduled();
            (_Package_factsbase = Package['facts-base']) === null || _Package_factsbase === void 0 ? void 0 : _Package_factsbase.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", 1);
        }).call(this);
    }
    _unthrottledEnsurePollIsScheduled() {
        return _async_to_generator(function*() {
            if (this._pollsScheduledButNotStarted > 0) return;
            ++this._pollsScheduledButNotStarted;
            yield this._taskQueue.runTask(()=>_async_to_generator(function*() {
                    yield this._pollMongo();
                }).call(this));
        }).call(this);
    }
    _suspendPolling() {
        ++this._pollsScheduledButNotStarted;
        this._taskQueue.runTask(()=>{});
        if (this._pollsScheduledButNotStarted !== 1) {
            throw new Error(`_pollsScheduledButNotStarted is ${this._pollsScheduledButNotStarted}`);
        }
    }
    _resumePolling() {
        return _async_to_generator(function*() {
            if (this._pollsScheduledButNotStarted !== 1) {
                throw new Error(`_pollsScheduledButNotStarted is ${this._pollsScheduledButNotStarted}`);
            }
            yield this._taskQueue.runTask(()=>_async_to_generator(function*() {
                    yield this._pollMongo();
                }).call(this));
        }).call(this);
    }
    _pollMongo() {
        return _async_to_generator(function*() {
            var _this__testOnlyPollCallback, _this;
            --this._pollsScheduledButNotStarted;
            if (this._stopped) return;
            let first = false;
            let newResults;
            let oldResults = this._results;
            if (!oldResults) {
                first = true;
                oldResults = this._ordered ? [] : new LocalCollection._IdMap;
            }
            (_this__testOnlyPollCallback = (_this = this)._testOnlyPollCallback) === null || _this__testOnlyPollCallback === void 0 ? void 0 : _this__testOnlyPollCallback.call(_this);
            const writesForCycle = this._pendingWrites;
            this._pendingWrites = [];
            try {
                newResults = yield this._cursor.getRawObjects(this._ordered);
            } catch (e) {
                if (first && typeof e.code === 'number') {
                    yield this._multiplexer.queryError(new Error(`Exception while polling query ${JSON.stringify(this._cursorDescription)}: ${e.message}`));
                }
                Array.prototype.push.apply(this._pendingWrites, writesForCycle);
                Meteor._debug(`Exception while polling query ${JSON.stringify(this._cursorDescription)}`, e);
                return;
            }
            if (!this._stopped) {
                LocalCollection._diffQueryChanges(this._ordered, oldResults, newResults, this._multiplexer);
            }
            if (first) this._multiplexer.ready();
            this._results = newResults;
            yield this._multiplexer.onFlush(()=>_async_to_generator(function*() {
                    for (const w of writesForCycle){
                        yield w.committed();
                    }
                })());
        }).call(this);
    }
    stop() {
        return _async_to_generator(function*() {
            var _Package_factsbase;
            this._stopped = true;
            for (const callback of this._stopCallbacks){
                yield callback();
            }
            for (const w of this._pendingWrites){
                yield w.committed();
            }
            (_Package_factsbase = Package['facts-base']) === null || _Package_factsbase === void 0 ? void 0 : _Package_factsbase.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", -1);
        }).call(this);
    }
    constructor(options){
        _define_property(this, "_options", void 0);
        _define_property(this, "_cursorDescription", void 0);
        _define_property(this, "_mongoHandle", void 0);
        _define_property(this, "_ordered", void 0);
        _define_property(this, "_multiplexer", void 0);
        _define_property(this, "_stopCallbacks", void 0);
        _define_property(this, "_stopped", void 0);
        _define_property(this, "_cursor", void 0);
        _define_property(this, "_results", void 0);
        _define_property(this, "_pollsScheduledButNotStarted", void 0);
        _define_property(this, "_pendingWrites", void 0);
        _define_property(this, "_ensurePollIsScheduled", void 0);
        _define_property(this, "_taskQueue", void 0);
        _define_property(this, "_testOnlyPollCallback", void 0);
        this._options = options;
        this._cursorDescription = options.cursorDescription;
        this._mongoHandle = options.mongoHandle;
        this._ordered = options.ordered;
        this._multiplexer = options.multiplexer;
        this._stopCallbacks = [];
        this._stopped = false;
        this._cursor = this._mongoHandle._createAsynchronousCursor(this._cursorDescription);
        this._results = null;
        this._pollsScheduledButNotStarted = 0;
        this._pendingWrites = [];
        this._ensurePollIsScheduled = throttle(this._unthrottledEnsurePollIsScheduled.bind(this), this._cursorDescription.options.pollingThrottleMs || POLLING_THROTTLE_MS);
        this._taskQueue = new Meteor._AsynchronousQueue();
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oplog_observe_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_observe_driver.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({OplogObserveDriver:()=>OplogObserveDriver},true);let has;module.link('lodash.has',{default(v){has=v}},0);let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},1);let oplogV2V1Converter;module.link("./oplog_v2_converter",{oplogV2V1Converter(v){oplogV2V1Converter=v}},2);let check,Match;module.link('meteor/check',{check(v){check=v},Match(v){Match=v}},3);let CursorDescription;module.link('./cursor_description',{CursorDescription(v){CursorDescription=v}},4);let forEachTrigger,listenAll;module.link('./mongo_driver',{forEachTrigger(v){forEachTrigger=v},listenAll(v){listenAll=v}},5);let Cursor;module.link('./cursor',{Cursor(v){Cursor=v}},6);let LocalCollection;module.link('meteor/minimongo/local_collection',{default(v){LocalCollection=v}},7);let idForOp;module.link('./oplog_tailing',{idForOp(v){idForOp=v}},8);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _async_iterator(iterable) {
    var method, async, sync, retry = 2;
    for("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;){
        if (async && null != (method = iterable[async])) return method.call(iterable);
        if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
        async = "@@asyncIterator", sync = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(s) {
    function AsyncFromSyncIteratorContinuation(r) {
        if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
        var done = r.done;
        return Promise.resolve(r.value).then(function(value) {
            return {
                value: value,
                done: done
            };
        });
    }
    return AsyncFromSyncIterator = function(s) {
        this.s = s, this.n = s.next;
    }, AsyncFromSyncIterator.prototype = {
        s: null,
        n: null,
        next: function() {
            return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
        },
        return: function(value) {
            var ret = this.s.return;
            return void 0 === ret ? Promise.resolve({
                value: value,
                done: !0
            }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
        },
        throw: function(value) {
            var thr = this.s.return;
            return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
        }
    }, new AsyncFromSyncIterator(s);
}
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









var PHASE = {
    QUERYING: "QUERYING",
    FETCHING: "FETCHING",
    STEADY: "STEADY"
};
// Exception thrown by _needToPollQuery which unrolls the stack up to the
// enclosing call to finishIfNeedToPollQuery.
var SwitchedToQuery = function() {};
var finishIfNeedToPollQuery = function(f) {
    return function() {
        try {
            f.apply(this, arguments);
        } catch (e) {
            if (!(e instanceof SwitchedToQuery)) throw e;
        }
    };
};
var currentId = 0;
/**
 * @class OplogObserveDriver
 * An alternative to PollingObserveDriver which follows the MongoDB operation log
 * instead of re-polling the query.
 *
 * Characteristics:
 * - Follows the MongoDB operation log
 * - Directly observes database changes
 * - More efficient than polling for most use cases
 * - Requires access to MongoDB oplog
 *
 * Interface:
 * - Construction initiates observeChanges callbacks and ready() invocation to the ObserveMultiplexer
 * - Observation can be terminated via the stop() method
 */ const OplogObserveDriver = function(options) {
    const self = this;
    self._usesOplog = true; // tests look at this
    self._id = currentId;
    currentId++;
    self._cursorDescription = options.cursorDescription;
    self._mongoHandle = options.mongoHandle;
    self._multiplexer = options.multiplexer;
    if (options.ordered) {
        throw Error("OplogObserveDriver only supports unordered observeChanges");
    }
    const sorter = options.sorter;
    // We don't support $near and other geo-queries so it's OK to initialize the
    // comparator only once in the constructor.
    const comparator = sorter && sorter.getComparator();
    if (options.cursorDescription.options.limit) {
        // There are several properties ordered driver implements:
        // - _limit is a positive number
        // - _comparator is a function-comparator by which the query is ordered
        // - _unpublishedBuffer is non-null Min/Max Heap,
        //                      the empty buffer in STEADY phase implies that the
        //                      everything that matches the queries selector fits
        //                      into published set.
        // - _published - Max Heap (also implements IdMap methods)
        const heapOptions = {
            IdMap: LocalCollection._IdMap
        };
        self._limit = self._cursorDescription.options.limit;
        self._comparator = comparator;
        self._sorter = sorter;
        self._unpublishedBuffer = new MinMaxHeap(comparator, heapOptions);
        // We need something that can find Max value in addition to IdMap interface
        self._published = new MaxHeap(comparator, heapOptions);
    } else {
        self._limit = 0;
        self._comparator = null;
        self._sorter = null;
        self._unpublishedBuffer = null;
        // Memory Growth
        self._published = new LocalCollection._IdMap;
    }
    // Indicates if it is safe to insert a new document at the end of the buffer
    // for this query. i.e. it is known that there are no documents matching the
    // selector those are not in published or buffer.
    self._safeAppendToBuffer = false;
    self._stopped = false;
    self._stopHandles = [];
    self._addStopHandles = function(newStopHandles) {
        const expectedPattern = Match.ObjectIncluding({
            stop: Function
        });
        // Single item or array
        check(newStopHandles, Match.OneOf([
            expectedPattern
        ], expectedPattern));
        self._stopHandles.push(newStopHandles);
    };
    Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", 1);
    self._registerPhaseChange(PHASE.QUERYING);
    self._matcher = options.matcher;
    // we are now using projection, not fields in the cursor description even if you pass {fields}
    // in the cursor construction
    const projection = self._cursorDescription.options.fields || self._cursorDescription.options.projection || {};
    self._projectionFn = LocalCollection._compileProjection(projection);
    // Projection function, result of combining important fields for selector and
    // existing fields projection
    self._sharedProjection = self._matcher.combineIntoProjection(projection);
    if (sorter) self._sharedProjection = sorter.combineIntoProjection(self._sharedProjection);
    self._sharedProjectionFn = LocalCollection._compileProjection(self._sharedProjection);
    self._needToFetch = new LocalCollection._IdMap;
    self._currentlyFetching = null;
    self._fetchGeneration = 0;
    self._requeryWhenDoneThisQuery = false;
    self._writesToCommitWhenWeReachSteady = [];
};
Object.assign(OplogObserveDriver.prototype, {
    _init: function() {
        return _async_to_generator(function*() {
            const self = this;
            // If the oplog handle tells us that it skipped some entries (because it got
            // behind, say), re-poll.
            self._addStopHandles(self._mongoHandle._oplogHandle.onSkippedEntries(finishIfNeedToPollQuery(function() {
                return self._needToPollQuery();
            })));
            yield forEachTrigger(self._cursorDescription, function(trigger) {
                return _async_to_generator(function*() {
                    self._addStopHandles((yield self._mongoHandle._oplogHandle.onOplogEntry(trigger, function(notification) {
                        finishIfNeedToPollQuery(function() {
                            const op = notification.op;
                            if (notification.dropCollection || notification.dropDatabase) {
                                // Note: this call is not allowed to block on anything (especially
                                // on waiting for oplog entries to catch up) because that will block
                                // onOplogEntry!
                                return self._needToPollQuery();
                            } else {
                                // All other operators should be handled depending on phase
                                if (self._phase === PHASE.QUERYING) {
                                    return self._handleOplogEntryQuerying(op);
                                } else {
                                    return self._handleOplogEntrySteadyOrFetching(op);
                                }
                            }
                        })();
                    })));
                })();
            });
            // XXX ordering w.r.t. everything else?
            self._addStopHandles((yield listenAll(self._cursorDescription, function() {
                // If we're not in a pre-fire write fence, we don't have to do anything.
                const fence = DDPServer._getCurrentFence();
                if (!fence || fence.fired) return;
                if (fence._oplogObserveDrivers) {
                    fence._oplogObserveDrivers[self._id] = self;
                    return;
                }
                fence._oplogObserveDrivers = {};
                fence._oplogObserveDrivers[self._id] = self;
                fence.onBeforeFire(function() {
                    return _async_to_generator(function*() {
                        const drivers = fence._oplogObserveDrivers;
                        delete fence._oplogObserveDrivers;
                        // This fence cannot fire until we've caught up to "this point" in the
                        // oplog, and all observers made it back to the steady state.
                        yield self._mongoHandle._oplogHandle.waitUntilCaughtUp();
                        for (const driver of Object.values(drivers)){
                            if (driver._stopped) continue;
                            const write = yield fence.beginWrite();
                            if (driver._phase === PHASE.STEADY) {
                                // Make sure that all of the callbacks have made it through the
                                // multiplexer and been delivered to ObserveHandles before committing
                                // writes.
                                yield driver._multiplexer.onFlush(write.committed);
                            } else {
                                driver._writesToCommitWhenWeReachSteady.push(write);
                            }
                        }
                    })();
                });
            })));
            // When Mongo fails over, we need to repoll the query, in case we processed an
            // oplog entry that got rolled back.
            self._addStopHandles(self._mongoHandle._onFailover(finishIfNeedToPollQuery(function() {
                return self._needToPollQuery();
            })));
            // Give _observeChanges a chance to add the new ObserveHandle to our
            // multiplexer, so that the added calls get streamed.
            return self._runInitialQuery();
        }).call(this);
    },
    _addPublished: function(id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            var fields = Object.assign({}, doc);
            delete fields._id;
            self._published.set(id, self._sharedProjectionFn(doc));
            self._multiplexer.added(id, self._projectionFn(fields));
            // After adding this document, the published set might be overflowed
            // (exceeding capacity specified by limit). If so, push the maximum
            // element to the buffer, we might want to save it in memory to reduce the
            // amount of Mongo lookups in the future.
            if (self._limit && self._published.size() > self._limit) {
                // XXX in theory the size of published is no more than limit+1
                if (self._published.size() !== self._limit + 1) {
                    throw new Error("After adding to published, " + (self._published.size() - self._limit) + " documents are overflowing the set");
                }
                var overflowingDocId = self._published.maxElementId();
                var overflowingDoc = self._published.get(overflowingDocId);
                if (EJSON.equals(overflowingDocId, id)) {
                    throw new Error("The document just added is overflowing the published set");
                }
                self._published.remove(overflowingDocId);
                self._multiplexer.removed(overflowingDocId);
                self._addBuffered(overflowingDocId, overflowingDoc);
            }
        });
    },
    _removePublished: function(id) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._published.remove(id);
            self._multiplexer.removed(id);
            if (!self._limit || self._published.size() === self._limit) return;
            if (self._published.size() > self._limit) throw Error("self._published got too big");
            // OK, we are publishing less than the limit. Maybe we should look in the
            // buffer to find the next element past what we were publishing before.
            if (!self._unpublishedBuffer.empty()) {
                // There's something in the buffer; move the first thing in it to
                // _published.
                var newDocId = self._unpublishedBuffer.minElementId();
                var newDoc = self._unpublishedBuffer.get(newDocId);
                self._removeBuffered(newDocId);
                self._addPublished(newDocId, newDoc);
                return;
            }
            // There's nothing in the buffer.  This could mean one of a few things.
            // (a) We could be in the middle of re-running the query (specifically, we
            // could be in _publishNewResults). In that case, _unpublishedBuffer is
            // empty because we clear it at the beginning of _publishNewResults. In
            // this case, our caller already knows the entire answer to the query and
            // we don't need to do anything fancy here.  Just return.
            if (self._phase === PHASE.QUERYING) return;
            // (b) We're pretty confident that the union of _published and
            // _unpublishedBuffer contain all documents that match selector. Because
            // _unpublishedBuffer is empty, that means we're confident that _published
            // contains all documents that match selector. So we have nothing to do.
            if (self._safeAppendToBuffer) return;
            // (c) Maybe there are other documents out there that should be in our
            // buffer. But in that case, when we emptied _unpublishedBuffer in
            // _removeBuffered, we should have called _needToPollQuery, which will
            // either put something in _unpublishedBuffer or set _safeAppendToBuffer
            // (or both), and it will put us in QUERYING for that whole time. So in
            // fact, we shouldn't be able to get here.
            throw new Error("Buffer inexplicably empty");
        });
    },
    _changePublished: function(id, oldDoc, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._published.set(id, self._sharedProjectionFn(newDoc));
            var projectedNew = self._projectionFn(newDoc);
            var projectedOld = self._projectionFn(oldDoc);
            var changed = DiffSequence.makeChangedFields(projectedNew, projectedOld);
            if (!isEmpty(changed)) self._multiplexer.changed(id, changed);
        });
    },
    _addBuffered: function(id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._unpublishedBuffer.set(id, self._sharedProjectionFn(doc));
            // If something is overflowing the buffer, we just remove it from cache
            if (self._unpublishedBuffer.size() > self._limit) {
                var maxBufferedId = self._unpublishedBuffer.maxElementId();
                self._unpublishedBuffer.remove(maxBufferedId);
                // Since something matching is removed from cache (both published set and
                // buffer), set flag to false
                self._safeAppendToBuffer = false;
            }
        });
    },
    // Is called either to remove the doc completely from matching set or to move
    // it to the published set later.
    _removeBuffered: function(id) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._unpublishedBuffer.remove(id);
            // To keep the contract "buffer is never empty in STEADY phase unless the
            // everything matching fits into published" true, we poll everything as
            // soon as we see the buffer becoming empty.
            if (!self._unpublishedBuffer.size() && !self._safeAppendToBuffer) self._needToPollQuery();
        });
    },
    // Called when a document has joined the "Matching" results set.
    // Takes responsibility of keeping _unpublishedBuffer in sync with _published
    // and the effect of limit enforced.
    _addMatching: function(doc) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            var id = doc._id;
            if (self._published.has(id)) throw Error("tried to add something already published " + id);
            if (self._limit && self._unpublishedBuffer.has(id)) throw Error("tried to add something already existed in buffer " + id);
            var limit = self._limit;
            var comparator = self._comparator;
            var maxPublished = limit && self._published.size() > 0 ? self._published.get(self._published.maxElementId()) : null;
            var maxBuffered = limit && self._unpublishedBuffer.size() > 0 ? self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId()) : null;
            // The query is unlimited or didn't publish enough documents yet or the
            // new document would fit into published set pushing the maximum element
            // out, then we need to publish the doc.
            var toPublish = !limit || self._published.size() < limit || comparator(doc, maxPublished) < 0;
            // Otherwise we might need to buffer it (only in case of limited query).
            // Buffering is allowed if the buffer is not filled up yet and all
            // matching docs are either in the published set or in the buffer.
            var canAppendToBuffer = !toPublish && self._safeAppendToBuffer && self._unpublishedBuffer.size() < limit;
            // Or if it is small enough to be safely inserted to the middle or the
            // beginning of the buffer.
            var canInsertIntoBuffer = !toPublish && maxBuffered && comparator(doc, maxBuffered) <= 0;
            var toBuffer = canAppendToBuffer || canInsertIntoBuffer;
            if (toPublish) {
                self._addPublished(id, doc);
            } else if (toBuffer) {
                self._addBuffered(id, doc);
            } else {
                // dropping it and not saving to the cache
                self._safeAppendToBuffer = false;
            }
        });
    },
    // Called when a document leaves the "Matching" results set.
    // Takes responsibility of keeping _unpublishedBuffer in sync with _published
    // and the effect of limit enforced.
    _removeMatching: function(id) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            if (!self._published.has(id) && !self._limit) throw Error("tried to remove something matching but not cached " + id);
            if (self._published.has(id)) {
                self._removePublished(id);
            } else if (self._unpublishedBuffer.has(id)) {
                self._removeBuffered(id);
            }
        });
    },
    _handleDoc: function(id, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            var matchesNow = newDoc && self._matcher.documentMatches(newDoc).result;
            var publishedBefore = self._published.has(id);
            var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
            var cachedBefore = publishedBefore || bufferedBefore;
            if (matchesNow && !cachedBefore) {
                self._addMatching(newDoc);
            } else if (cachedBefore && !matchesNow) {
                self._removeMatching(id);
            } else if (cachedBefore && matchesNow) {
                var oldDoc = self._published.get(id);
                var comparator = self._comparator;
                var minBuffered = self._limit && self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.minElementId());
                var maxBuffered;
                if (publishedBefore) {
                    // Unlimited case where the document stays in published once it
                    // matches or the case when we don't have enough matching docs to
                    // publish or the changed but matching doc will stay in published
                    // anyways.
                    //
                    // XXX: We rely on the emptiness of buffer. Be sure to maintain the
                    // fact that buffer can't be empty if there are matching documents not
                    // published. Notably, we don't want to schedule repoll and continue
                    // relying on this property.
                    var staysInPublished = !self._limit || self._unpublishedBuffer.size() === 0 || comparator(newDoc, minBuffered) <= 0;
                    if (staysInPublished) {
                        self._changePublished(id, oldDoc, newDoc);
                    } else {
                        // after the change doc doesn't stay in the published, remove it
                        self._removePublished(id);
                        // but it can move into buffered now, check it
                        maxBuffered = self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());
                        var toBuffer = self._safeAppendToBuffer || maxBuffered && comparator(newDoc, maxBuffered) <= 0;
                        if (toBuffer) {
                            self._addBuffered(id, newDoc);
                        } else {
                            // Throw away from both published set and buffer
                            self._safeAppendToBuffer = false;
                        }
                    }
                } else if (bufferedBefore) {
                    oldDoc = self._unpublishedBuffer.get(id);
                    // remove the old version manually instead of using _removeBuffered so
                    // we don't trigger the querying immediately.  if we end this block
                    // with the buffer empty, we will need to trigger the query poll
                    // manually too.
                    self._unpublishedBuffer.remove(id);
                    var maxPublished = self._published.get(self._published.maxElementId());
                    maxBuffered = self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());
                    // the buffered doc was updated, it could move to published
                    var toPublish = comparator(newDoc, maxPublished) < 0;
                    // or stays in buffer even after the change
                    var staysInBuffer = !toPublish && self._safeAppendToBuffer || !toPublish && maxBuffered && comparator(newDoc, maxBuffered) <= 0;
                    if (toPublish) {
                        self._addPublished(id, newDoc);
                    } else if (staysInBuffer) {
                        // stays in buffer but changes
                        self._unpublishedBuffer.set(id, newDoc);
                    } else {
                        // Throw away from both published set and buffer
                        self._safeAppendToBuffer = false;
                        // Normally this check would have been done in _removeBuffered but
                        // we didn't use it, so we need to do it ourself now.
                        if (!self._unpublishedBuffer.size()) {
                            self._needToPollQuery();
                        }
                    }
                } else {
                    throw new Error("cachedBefore implies either of publishedBefore or bufferedBefore is true.");
                }
            }
        });
    },
    _fetchModifiedDocuments: function() {
        var self = this;
        self._registerPhaseChange(PHASE.FETCHING);
        // Defer, because nothing called from the oplog entry handler may yield,
        // but fetch() yields.
        Meteor.defer(finishIfNeedToPollQuery(function() {
            return _async_to_generator(function*() {
                while(!self._stopped && !self._needToFetch.empty()){
                    if (self._phase === PHASE.QUERYING) {
                        break;
                    }
                    // Being in steady phase here would be surprising.
                    if (self._phase !== PHASE.FETCHING) throw new Error("phase in fetchModifiedDocuments: " + self._phase);
                    self._currentlyFetching = self._needToFetch;
                    var thisGeneration = ++self._fetchGeneration;
                    self._needToFetch = new LocalCollection._IdMap;
                    // Create an array of promises for all the fetch operations
                    const fetchPromises = [];
                    self._currentlyFetching.forEach(function(op, id) {
                        const fetchPromise = new Promise((resolve, reject)=>{
                            self._mongoHandle._docFetcher.fetch(self._cursorDescription.collectionName, id, op, finishIfNeedToPollQuery(function(err, doc) {
                                if (err) {
                                    Meteor._debug('Got exception while fetching documents', err);
                                    // If we get an error from the fetcher (eg, trouble
                                    // connecting to Mongo), let's just abandon the fetch phase
                                    // altogether and fall back to polling. It's not like we're
                                    // getting live updates anyway.
                                    if (self._phase !== PHASE.QUERYING) {
                                        self._needToPollQuery();
                                    }
                                    resolve();
                                    return;
                                }
                                if (!self._stopped && self._phase === PHASE.FETCHING && self._fetchGeneration === thisGeneration) {
                                    // We re-check the generation in case we've had an explicit
                                    // _pollQuery call (eg, in another fiber) which should
                                    // effectively cancel this round of fetches.  (_pollQuery
                                    // increments the generation.)
                                    try {
                                        self._handleDoc(id, doc);
                                        resolve();
                                    } catch (err) {
                                        reject(err);
                                    }
                                } else {
                                    resolve();
                                }
                            }));
                        });
                        fetchPromises.push(fetchPromise);
                    });
                    // Wait for all fetch operations to complete
                    try {
                        const results = yield Promise.allSettled(fetchPromises);
                        const errors = results.filter((result)=>result.status === 'rejected').map((result)=>result.reason);
                        if (errors.length > 0) {
                            Meteor._debug('Some fetch queries failed:', errors);
                        }
                    } catch (err) {
                        Meteor._debug('Got an exception in a fetch query', err);
                    }
                    // Exit now if we've had a _pollQuery call (here or in another fiber).
                    if (self._phase === PHASE.QUERYING) return;
                    self._currentlyFetching = null;
                }
                // We're done fetching, so we can be steady, unless we've had a
                // _pollQuery call (here or in another fiber).
                if (self._phase !== PHASE.QUERYING) yield self._beSteady();
            })();
        }));
    },
    _beSteady: function() {
        return _async_to_generator(function*() {
            var self = this;
            self._registerPhaseChange(PHASE.STEADY);
            var writes = self._writesToCommitWhenWeReachSteady || [];
            self._writesToCommitWhenWeReachSteady = [];
            yield self._multiplexer.onFlush(function() {
                return _async_to_generator(function*() {
                    try {
                        for (const w of writes){
                            yield w.committed();
                        }
                    } catch (e) {
                        console.error("_beSteady error", {
                            writes
                        }, e);
                    }
                })();
            });
        }).call(this);
    },
    _handleOplogEntryQuerying: function(op) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            self._needToFetch.set(idForOp(op), op);
        });
    },
    _handleOplogEntrySteadyOrFetching: function(op) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            var id = idForOp(op);
            // If we're already fetching this one, or about to, we can't optimize;
            // make sure that we fetch it again if necessary.
            if (self._phase === PHASE.FETCHING && (self._currentlyFetching && self._currentlyFetching.has(id) || self._needToFetch.has(id))) {
                self._needToFetch.set(id, op);
                return;
            }
            if (op.op === 'd') {
                if (self._published.has(id) || self._limit && self._unpublishedBuffer.has(id)) self._removeMatching(id);
            } else if (op.op === 'i') {
                if (self._published.has(id)) throw new Error("insert found for already-existing ID in published");
                if (self._unpublishedBuffer && self._unpublishedBuffer.has(id)) throw new Error("insert found for already-existing ID in buffer");
                // XXX what if selector yields?  for now it can't but later it could
                // have $where
                if (self._matcher.documentMatches(op.o).result) self._addMatching(op.o);
            } else if (op.op === 'u') {
                // we are mapping the new oplog format on mongo 5
                // to what we know better, $set
                op.o = oplogV2V1Converter(op.o);
                // Is this a modifier ($set/$unset, which may require us to poll the
                // database to figure out if the whole document matches the selector) or
                // a replacement (in which case we can just directly re-evaluate the
                // selector)?
                // oplog format has changed on mongodb 5, we have to support both now
                // diff is the format in Mongo 5+ (oplog v2)
                var isReplace = !has(op.o, '$set') && !has(op.o, 'diff') && !has(op.o, '$unset');
                // If this modifier modifies something inside an EJSON custom type (ie,
                // anything with EJSON$), then we can't try to use
                // LocalCollection._modify, since that just mutates the EJSON encoding,
                // not the actual object.
                var canDirectlyModifyDoc = !isReplace && modifierCanBeDirectlyApplied(op.o);
                var publishedBefore = self._published.has(id);
                var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
                if (isReplace) {
                    self._handleDoc(id, Object.assign({
                        _id: id
                    }, op.o));
                } else if ((publishedBefore || bufferedBefore) && canDirectlyModifyDoc) {
                    // Oh great, we actually know what the document is, so we can apply
                    // this directly.
                    var newDoc = self._published.has(id) ? self._published.get(id) : self._unpublishedBuffer.get(id);
                    newDoc = EJSON.clone(newDoc);
                    newDoc._id = id;
                    try {
                        LocalCollection._modify(newDoc, op.o);
                    } catch (e) {
                        if (e.name !== "MinimongoError") throw e;
                        // We didn't understand the modifier.  Re-fetch.
                        self._needToFetch.set(id, op);
                        if (self._phase === PHASE.STEADY) {
                            self._fetchModifiedDocuments();
                        }
                        return;
                    }
                    self._handleDoc(id, self._sharedProjectionFn(newDoc));
                } else if (!canDirectlyModifyDoc || self._matcher.canBecomeTrueByModifier(op.o) || self._sorter && self._sorter.affectedByModifier(op.o)) {
                    self._needToFetch.set(id, op);
                    if (self._phase === PHASE.STEADY) self._fetchModifiedDocuments();
                }
            } else {
                throw Error("XXX SURPRISING OPERATION: " + op);
            }
        });
    },
    _runInitialQueryAsync () {
        return _async_to_generator(function*() {
            var self = this;
            if (self._stopped) throw new Error("oplog stopped surprisingly early");
            yield self._runQuery({
                initial: true
            }); // yields
            if (self._stopped) return; // can happen on queryError
            // Allow observeChanges calls to return. (After this, it's possible for
            // stop() to be called.)
            yield self._multiplexer.ready();
            yield self._doneQuerying(); // yields
        }).call(this);
    },
    // Yields!
    _runInitialQuery: function() {
        return this._runInitialQueryAsync();
    },
    // In various circumstances, we may just want to stop processing the oplog and
    // re-run the initial query, just as if we were a PollingObserveDriver.
    //
    // This function may not block, because it is called from an oplog entry
    // handler.
    //
    // XXX We should call this when we detect that we've been in FETCHING for "too
    // long".
    //
    // XXX We should call this when we detect Mongo failover (since that might
    // mean that some of the oplog entries we have processed have been rolled
    // back). The Node Mongo driver is in the middle of a bunch of huge
    // refactorings, including the way that it notifies you when primary
    // changes. Will put off implementing this until driver 1.4 is out.
    _pollQuery: function() {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            if (self._stopped) return;
            // Yay, we get to forget about all the things we thought we had to fetch.
            self._needToFetch = new LocalCollection._IdMap;
            self._currentlyFetching = null;
            ++self._fetchGeneration; // ignore any in-flight fetches
            self._registerPhaseChange(PHASE.QUERYING);
            // Defer so that we don't yield.  We don't need finishIfNeedToPollQuery
            // here because SwitchedToQuery is not thrown in QUERYING mode.
            Meteor.defer(function() {
                return _async_to_generator(function*() {
                    yield self._runQuery();
                    yield self._doneQuerying();
                })();
            });
        });
    },
    // Yields!
    _runQueryAsync (options) {
        return _async_to_generator(function*() {
            var self = this;
            options = options || {};
            var newResults, newBuffer;
            // This while loop is just to retry failures.
            while(true){
                // If we've been stopped, we don't have to run anything any more.
                if (self._stopped) return;
                newResults = new LocalCollection._IdMap;
                newBuffer = new LocalCollection._IdMap;
                // Query 2x documents as the half excluded from the original query will go
                // into unpublished buffer to reduce additional Mongo lookups in cases
                // when documents are removed from the published set and need a
                // replacement.
                // XXX needs more thought on non-zero skip
                // XXX 2 is a "magic number" meaning there is an extra chunk of docs for
                // buffer if such is needed.
                var cursor = self._cursorForQuery({
                    limit: self._limit * 2
                });
                try {
                    yield cursor.forEach(function(doc, i) {
                        if (!self._limit || i < self._limit) {
                            newResults.set(doc._id, doc);
                        } else {
                            newBuffer.set(doc._id, doc);
                        }
                    });
                    break;
                } catch (e) {
                    if (options.initial && typeof e.code === 'number') {
                        // This is an error document sent to us by mongod, not a connection
                        // error generated by the client. And we've never seen this query work
                        // successfully. Probably it's a bad selector or something, so we
                        // should NOT retry. Instead, we should halt the observe (which ends
                        // up calling `stop` on us).
                        yield self._multiplexer.queryError(e);
                        return;
                    }
                    // During failover (eg) if we get an exception we should log and retry
                    // instead of crashing.
                    Meteor._debug("Got exception while polling query", e);
                    yield Meteor._sleepForMs(100);
                }
            }
            if (self._stopped) return;
            self._publishNewResults(newResults, newBuffer);
        }).call(this);
    },
    // Yields!
    _runQuery: function(options) {
        return this._runQueryAsync(options);
    },
    // Transitions to QUERYING and runs another query, or (if already in QUERYING)
    // ensures that we will query again later.
    //
    // This function may not block, because it is called from an oplog entry
    // handler. However, if we were not already in the QUERYING phase, it throws
    // an exception that is caught by the closest surrounding
    // finishIfNeedToPollQuery call; this ensures that we don't continue running
    // close that was designed for another phase inside PHASE.QUERYING.
    //
    // (It's also necessary whenever logic in this file yields to check that other
    // phases haven't put us into QUERYING mode, though; eg,
    // _fetchModifiedDocuments does this.)
    _needToPollQuery: function() {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            if (self._stopped) return;
            // If we're not already in the middle of a query, we can query now
            // (possibly pausing FETCHING).
            if (self._phase !== PHASE.QUERYING) {
                self._pollQuery();
                throw new SwitchedToQuery;
            }
            // We're currently in QUERYING. Set a flag to ensure that we run another
            // query when we're done.
            self._requeryWhenDoneThisQuery = true;
        });
    },
    // Yields!
    _doneQuerying: function() {
        return _async_to_generator(function*() {
            var self = this;
            if (self._stopped) return;
            yield self._mongoHandle._oplogHandle.waitUntilCaughtUp();
            if (self._stopped) return;
            if (self._phase !== PHASE.QUERYING) throw Error("Phase unexpectedly " + self._phase);
            if (self._requeryWhenDoneThisQuery) {
                self._requeryWhenDoneThisQuery = false;
                self._pollQuery();
            } else if (self._needToFetch.empty()) {
                yield self._beSteady();
            } else {
                self._fetchModifiedDocuments();
            }
        }).call(this);
    },
    _cursorForQuery: function(optionsOverwrite) {
        var self = this;
        return Meteor._noYieldsAllowed(function() {
            // The query we run is almost the same as the cursor we are observing,
            // with a few changes. We need to read all the fields that are relevant to
            // the selector, not just the fields we are going to publish (that's the
            // "shared" projection). And we don't want to apply any transform in the
            // cursor, because observeChanges shouldn't use the transform.
            var options = Object.assign({}, self._cursorDescription.options);
            // Allow the caller to modify the options. Useful to specify different
            // skip and limit values.
            Object.assign(options, optionsOverwrite);
            options.fields = self._sharedProjection;
            delete options.transform;
            // We are NOT deep cloning fields or selector here, which should be OK.
            var description = new CursorDescription(self._cursorDescription.collectionName, self._cursorDescription.selector, options);
            return new Cursor(self._mongoHandle, description);
        });
    },
    // Replace self._published with newResults (both are IdMaps), invoking observe
    // callbacks on the multiplexer.
    // Replace self._unpublishedBuffer with newBuffer.
    //
    // XXX This is very similar to LocalCollection._diffQueryUnorderedChanges. We
    // should really: (a) Unify IdMap and OrderedDict into Unordered/OrderedDict
    // (b) Rewrite diff.js to use these classes instead of arrays and objects.
    _publishNewResults: function(newResults, newBuffer) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            // If the query is limited and there is a buffer, shut down so it doesn't
            // stay in a way.
            if (self._limit) {
                self._unpublishedBuffer.clear();
            }
            // First remove anything that's gone. Be careful not to modify
            // self._published while iterating over it.
            var idsToRemove = [];
            self._published.forEach(function(doc, id) {
                if (!newResults.has(id)) idsToRemove.push(id);
            });
            idsToRemove.forEach(function(id) {
                self._removePublished(id);
            });
            // Now do adds and changes.
            // If self has a buffer and limit, the new fetched result will be
            // limited correctly as the query has sort specifier.
            newResults.forEach(function(doc, id) {
                self._handleDoc(id, doc);
            });
            // Sanity-check that everything we tried to put into _published ended up
            // there.
            // XXX if this is slow, remove it later
            if (self._published.size() !== newResults.size()) {
                Meteor._debug('The Mongo server and the Meteor query disagree on how ' + 'many documents match your query. Cursor description: ', self._cursorDescription);
            }
            self._published.forEach(function(doc, id) {
                if (!newResults.has(id)) throw Error("_published has a doc that newResults doesn't; " + id);
            });
            // Finally, replace the buffer
            newBuffer.forEach(function(doc, id) {
                self._addBuffered(id, doc);
            });
            self._safeAppendToBuffer = newBuffer.size() < self._limit;
        });
    },
    // This stop function is invoked from the onStop of the ObserveMultiplexer, so
    // it shouldn't actually be possible to call it until the multiplexer is
    // ready.
    //
    // It's important to check self._stopped after every call in this file that
    // can yield!
    _stop: function() {
        return _async_to_generator(function*() {
            var self = this;
            if (self._stopped) return;
            self._stopped = true;
            // Note: we *don't* use multiplexer.onFlush here because this stop
            // callback is actually invoked by the multiplexer itself when it has
            // determined that there are no handles left. So nothing is actually going
            // to get flushed (and it's probably not valid to call methods on the
            // dying multiplexer).
            for (const w of self._writesToCommitWhenWeReachSteady){
                yield w.committed();
            }
            self._writesToCommitWhenWeReachSteady = null;
            // Proactively drop references to potentially big things.
            self._published = null;
            self._unpublishedBuffer = null;
            self._needToFetch = null;
            self._currentlyFetching = null;
            self._oplogEntryHandle = null;
            self._listenersHandle = null;
            Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", -1);
            {
                var _iteratorAbruptCompletion = false, _didIteratorError = false, _iteratorError;
                try {
                    for(var _iterator = _async_iterator(self._stopHandles), _step; _iteratorAbruptCompletion = !(_step = yield _iterator.next()).done; _iteratorAbruptCompletion = false){
                        let _value = _step.value;
                        const handle = _value;
                        yield handle.stop();
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
    },
    stop: function() {
        return _async_to_generator(function*() {
            const self = this;
            return yield self._stop();
        }).call(this);
    },
    _registerPhaseChange: function(phase) {
        var self = this;
        Meteor._noYieldsAllowed(function() {
            var now = new Date;
            if (self._phase) {
                var timeDiff = now - self._phaseStartTime;
                Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "time-spent-in-" + self._phase + "-phase", timeDiff);
            }
            self._phase = phase;
            self._phaseStartTime = now;
        });
    }
});
// Does our oplog tailing code support this cursor? For now, we are being very
// conservative and allowing only simple queries with simple options.
// (This is a "static method".)
OplogObserveDriver.cursorSupported = function(cursorDescription, matcher) {
    // First, check the options.
    var options = cursorDescription.options;
    // Did the user say no explicitly?
    // underscored version of the option is COMPAT with 1.2
    if (options.disableOplog || options._disableOplog) return false;
    // skip is not supported: to support it we would need to keep track of all
    // "skipped" documents or at least their ids.
    // limit w/o a sort specifier is not supported: current implementation needs a
    // deterministic way to order documents.
    if (options.skip || options.limit && !options.sort) return false;
    // If a fields projection option is given check if it is supported by
    // minimongo (some operators are not supported).
    const fields = options.fields || options.projection;
    if (fields) {
        try {
            LocalCollection._checkSupportedProjection(fields);
        } catch (e) {
            if (e.name === "MinimongoError") {
                return false;
            } else {
                throw e;
            }
        }
    }
    // We don't allow the following selectors:
    //   - $where (not confident that we provide the same JS environment
    //             as Mongo, and can yield!)
    //   - $near (has "interesting" properties in MongoDB, like the possibility
    //            of returning an ID multiple times, though even polling maybe
    //            have a bug there)
    //           XXX: once we support it, we would need to think more on how we
    //           initialize the comparators when we create the driver.
    return !matcher.hasWhere() && !matcher.hasGeoQuery();
};
var modifierCanBeDirectlyApplied = function(modifier) {
    return Object.entries(modifier).every(function([operation, fields]) {
        return Object.entries(fields).every(function([field, value]) {
            return !/EJSON\$/.test(field);
        });
    });
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oplog_v2_converter.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_v2_converter.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({oplogV2V1Converter:()=>oplogV2V1Converter});let EJSON;module.link('meteor/ejson',{EJSON(v){EJSON=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();/**
 * Converter module for the new MongoDB Oplog format (>=5.0) to the one that Meteor
 * handles well, i.e., `$set` and `$unset`. The new format is completely new,
 * and looks as follows:
 *
 * ```js
 * { $v: 2, diff: Diff }
 * ```
 *
 * where `Diff` is a recursive structure:
 * ```js
 * {
 *   // Nested updates (sometimes also represented with an s-field).
 *   // Example: `{ $set: { 'foo.bar': 1 } }`.
 *   i: { <key>: <value>, ... },
 *
 *   // Top-level updates.
 *   // Example: `{ $set: { foo: { bar: 1 } } }`.
 *   u: { <key>: <value>, ... },
 *
 *   // Unsets.
 *   // Example: `{ $unset: { foo: '' } }`.
 *   d: { <key>: false, ... },
 *
 *   // Array operations.
 *   // Example: `{ $push: { foo: 'bar' } }`.
 *   s<key>: { a: true, u<index>: <value>, ... },
 *   ...
 *
 *   // Nested operations (sometimes also represented in the `i` field).
 *   // Example: `{ $set: { 'foo.bar': 1 } }`.
 *   s<key>: Diff,
 *   ...
 * }
 * ```
 *
 * (all fields are optional)
 */ 
const arrayOperatorKeyRegex = /^(a|[su]\d+)$/;
/**
 * Checks if a field is an array operator key of form 'a' or 's1' or 'u1' etc
 */ function isArrayOperatorKey(field) {
    return arrayOperatorKeyRegex.test(field);
}
/**
 * Type guard to check if an operator is a valid array operator.
 * Array operators have 'a: true' and keys that match the arrayOperatorKeyRegex
 */ function isArrayOperator(operator) {
    return operator !== null && typeof operator === 'object' && 'a' in operator && operator.a === true && Object.keys(operator).every(isArrayOperatorKey);
}
/**
 * Joins two parts of a field path with a dot.
 * Returns the key itself if prefix is empty.
 */ function join(prefix, key) {
    return prefix ? `${prefix}.${key}` : key;
}
/**
 * Recursively flattens an object into a target object with dot notation paths.
 * Handles special cases:
 * - Arrays are assigned directly
 * - Custom EJSON types are preserved
 * - Mongo.ObjectIDs are preserved
 * - Plain objects are recursively flattened
 * - Empty objects are assigned directly
 */ function flattenObjectInto(target, source, prefix) {
    if (Array.isArray(source) || typeof source !== 'object' || source === null || source instanceof Mongo.ObjectID || EJSON._isCustomType(source)) {
        target[prefix] = source;
        return;
    }
    const entries = Object.entries(source);
    if (entries.length) {
        entries.forEach(([key, value])=>{
            flattenObjectInto(target, value, join(prefix, key));
        });
    } else {
        target[prefix] = source;
    }
}
/**
 * Converts an oplog diff to a series of $set and $unset operations.
 * Handles several types of operations:
 * - Direct unsets via 'd' field
 * - Nested sets via 'i' field
 * - Top-level sets via 'u' field
 * - Array operations and nested objects via 's' prefixed fields
 *
 * Preserves the structure of EJSON custom types and ObjectIDs while
 * flattening paths into dot notation for MongoDB updates.
 */ function convertOplogDiff(oplogEntry, diff, prefix = '') {
    Object.entries(diff).forEach(([diffKey, value])=>{
        if (diffKey === 'd') {
            var // Handle `$unset`s
            _oplogEntry;
            var _$unset;
            (_$unset = (_oplogEntry = oplogEntry).$unset) !== null && _$unset !== void 0 ? _$unset : _oplogEntry.$unset = {};
            Object.keys(value).forEach((key)=>{
                oplogEntry.$unset[join(prefix, key)] = true;
            });
        } else if (diffKey === 'i') {
            var // Handle (potentially) nested `$set`s
            _oplogEntry1;
            var _$set;
            (_$set = (_oplogEntry1 = oplogEntry).$set) !== null && _$set !== void 0 ? _$set : _oplogEntry1.$set = {};
            flattenObjectInto(oplogEntry.$set, value, prefix);
        } else if (diffKey === 'u') {
            var // Handle flat `$set`s
            _oplogEntry2;
            var _$set1;
            (_$set1 = (_oplogEntry2 = oplogEntry).$set) !== null && _$set1 !== void 0 ? _$set1 : _oplogEntry2.$set = {};
            Object.entries(value).forEach(([key, fieldValue])=>{
                oplogEntry.$set[join(prefix, key)] = fieldValue;
            });
        } else if (diffKey.startsWith('s')) {
            // Handle s-fields (array operations and nested objects)
            const key = diffKey.slice(1);
            if (isArrayOperator(value)) {
                // Array operator
                Object.entries(value).forEach(([position, fieldValue])=>{
                    if (position === 'a') return;
                    const positionKey = join(prefix, `${key}.${position.slice(1)}`);
                    if (position[0] === 's') {
                        convertOplogDiff(oplogEntry, fieldValue, positionKey);
                    } else if (fieldValue === null) {
                        var _oplogEntry;
                        var _$unset;
                        (_$unset = (_oplogEntry = oplogEntry).$unset) !== null && _$unset !== void 0 ? _$unset : _oplogEntry.$unset = {};
                        oplogEntry.$unset[positionKey] = true;
                    } else {
                        var _oplogEntry1;
                        var _$set;
                        (_$set = (_oplogEntry1 = oplogEntry).$set) !== null && _$set !== void 0 ? _$set : _oplogEntry1.$set = {};
                        oplogEntry.$set[positionKey] = fieldValue;
                    }
                });
            } else if (key) {
                // Nested object
                convertOplogDiff(oplogEntry, value, join(prefix, key));
            }
        }
    });
}
/**
 * Converts a MongoDB v2 oplog entry to v1 format.
 * Returns the original entry unchanged if it's not a v2 oplog entry
 * or doesn't contain a diff field.
 *
 * The converted entry will contain $set and $unset operations that are
 * equivalent to the v2 diff format, with paths flattened to dot notation
 * and special handling for EJSON custom types and ObjectIDs.
 */ function oplogV2V1Converter(oplogEntry) {
    if (oplogEntry.$v !== 2 || !oplogEntry.diff) {
        return oplogEntry;
    }
    const convertedOplogEntry = {
        $v: 2
    };
    convertOplogDiff(convertedOplogEntry, oplogEntry.diff);
    return convertedOplogEntry;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cursor_description.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor_description.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({CursorDescription:()=>CursorDescription});/**
 * MongoDB collation options for locale-aware string comparison.
 *
 * All options are supported server-side via the MongoDB driver.
 * Client-side (Minimongo) support uses `Intl.Collator` and is limited to:
 * `locale`, `strength` (1–3), `caseLevel`, `numericOrdering`, and `caseFirst`.
 *
 * Options marked **server-only** are silently ignored by Minimongo.
 */ function _define_property(obj, key, value) {
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
/**
 * Represents the arguments used to construct a cursor.
 * Used as a key for cursor de-duplication.
 *
 * All properties must be either:
 * - JSON-stringifiable, or
 * - Not affect observeChanges output (e.g., options.transform functions)
 */ class CursorDescription {
    constructor(collectionName, selector, options){
        _define_property(this, "collectionName", void 0);
        _define_property(this, "selector", void 0);
        _define_property(this, "options", void 0);
        this.collectionName = collectionName;
        // @ts-ignore
        this.selector = Mongo.Collection._rewriteSelector(selector);
        this.options = options || {};
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_connection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_connection.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({MongoConnection:()=>MongoConnection},true);let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},0);let CLIENT_ONLY_METHODS,getAsyncMethodName;module.link('meteor/minimongo/constants',{CLIENT_ONLY_METHODS(v){CLIENT_ONLY_METHODS=v},getAsyncMethodName(v){getAsyncMethodName=v}},1);let MiniMongoQueryError;module.link('meteor/minimongo/common',{MiniMongoQueryError(v){MiniMongoQueryError=v}},2);let path;module.link('path',{default(v){path=v}},3);let AsynchronousCursor;module.link('./asynchronous_cursor',{AsynchronousCursor(v){AsynchronousCursor=v}},4);let Cursor;module.link('./cursor',{Cursor(v){Cursor=v}},5);let CursorDescription;module.link('./cursor_description',{CursorDescription(v){CursorDescription=v}},6);let DocFetcher;module.link('./doc_fetcher',{DocFetcher(v){DocFetcher=v}},7);let MongoDB,compareOperationTimes,replaceMeteorAtomWithMongo,replaceTypes,transformResult;module.link('./mongo_common',{MongoDB(v){MongoDB=v},compareOperationTimes(v){compareOperationTimes=v},replaceMeteorAtomWithMongo(v){replaceMeteorAtomWithMongo=v},replaceTypes(v){replaceTypes=v},transformResult(v){transformResult=v}},8);let ObserveHandle;module.link('./observe_handle',{ObserveHandle(v){ObserveHandle=v}},9);let ObserveMultiplexer;module.link('./observe_multiplex',{ObserveMultiplexer(v){ObserveMultiplexer=v}},10);let OplogObserveDriver;module.link('./oplog_observe_driver',{OplogObserveDriver(v){OplogObserveDriver=v}},11);let OPLOG_COLLECTION,OplogHandle;module.link('./oplog_tailing',{OPLOG_COLLECTION(v){OPLOG_COLLECTION=v},OplogHandle(v){OplogHandle=v}},12);let PollingObserveDriver;module.link('./polling_observe_driver',{PollingObserveDriver(v){PollingObserveDriver=v}},13);let ChangeStreamObserveDriver;module.link('./changestream_observe_driver',{ChangeStreamObserveDriver(v){ChangeStreamObserveDriver=v}},14);let SharedChangeStream;module.link('./shared_change_stream',{SharedChangeStream(v){SharedChangeStream=v}},15);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
var _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
















const FILE_ASSET_SUFFIX = 'Asset';
const ASSETS_FOLDER = 'assets';
const APP_FOLDER = 'app';
const oplogCollectionWarnings = [];
const availableDrivers = [
    'changeStreams',
    'oplog',
    'polling'
];
const DEFAULT_REACTIVITY_ORDER = process.env.METEOR_REACTIVITY_ORDER ? process.env.METEOR_REACTIVITY_ORDER.split(',') : availableDrivers;
const reactivitySetting = (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : _Meteor_settings_packages_mongo.reactivity;
if (Array.isArray(reactivitySetting)) {
    for (const method of reactivitySetting){
        if (!availableDrivers.includes(method)) {
            throw new Error(`Invalid Mongo reactivity method in settings: ${method}`);
        }
    }
}
const MongoConnection = function(url, options) {
    var _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
    var self = this;
    options = options || {};
    self._observeMultiplexers = {};
    self._sharedChangeStreams = {};
    self._onFailoverHook = new Hook;
    const userOptions = _object_spread({}, Mongo._connectionOptions || {}, ((_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : _Meteor_settings_packages_mongo.options) || {});
    var mongoOptions = Object.assign({
        ignoreUndefined: true
    }, userOptions);
    // Internally the oplog connections specify their own maxPoolSize
    // which we don't want to overwrite with any user defined value
    if ('maxPoolSize' in options) {
        // If we just set this for "server", replSet will override it. If we just
        // set it for replSet, it will be ignored if we're not using a replSet.
        mongoOptions.maxPoolSize = options.maxPoolSize;
    }
    if ('minPoolSize' in options) {
        mongoOptions.minPoolSize = options.minPoolSize;
    }
    // Transform options like "tlsCAFileAsset": "filename.pem" into
    // "tlsCAFile": "/<fullpath>/filename.pem"
    Object.entries(mongoOptions || {}).filter(([key])=>key && key.endsWith(FILE_ASSET_SUFFIX)).forEach(([key, value])=>{
        const optionName = key.replace(FILE_ASSET_SUFFIX, '');
        mongoOptions[optionName] = path.join(Assets.getServerDir(), ASSETS_FOLDER, APP_FOLDER, value);
        delete mongoOptions[key];
    });
    self.db = null;
    self._oplogHandle = null;
    self._docFetcher = null;
    mongoOptions.driverInfo = {
        name: 'Meteor',
        version: Meteor.release
    };
    self.client = new MongoDB.MongoClient(url, mongoOptions);
    self.db = self.client.db();
    self.client.on('serverDescriptionChanged', Meteor.bindEnvironment((event)=>{
        // When the connection is no longer against the primary node, execute all
        // failover hooks. This is important for the driver as it has to re-pool the
        // query when it happens.
        if (event.previousDescription.type !== 'RSPrimary' && event.newDescription.type === 'RSPrimary') {
            self._onFailoverHook.each((callback1)=>{
                callback1();
                return true;
            });
        }
    }));
    if (options.oplogUrl && !Package['disable-oplog']) {
        self._oplogHandle = new OplogHandle(options.oplogUrl, self.db.databaseName);
        self._docFetcher = new DocFetcher(self);
    }
};
MongoConnection.prototype._close = function() {
    return _async_to_generator(function*() {
        var self = this;
        if (!self.db) throw Error("close called before Connection created?");
        // XXX probably untested
        var oplogHandle = self._oplogHandle;
        self._oplogHandle = null;
        if (oplogHandle) yield oplogHandle.stop();
        // Use Future.wrap so that errors get thrown. This happens to
        // work even outside a fiber since the 'close' method is not
        // actually asynchronous.
        yield self.client.close();
    }).call(this);
};
MongoConnection.prototype.close = function() {
    return this._close();
};
MongoConnection.prototype._setOplogHandle = function(oplogHandle) {
    this._oplogHandle = oplogHandle;
    return this;
};
// Returns the Mongo Collection object; may yield.
MongoConnection.prototype.rawCollection = function(collectionName) {
    var self = this;
    if (!self.db) throw Error("rawCollection called before Connection created?");
    return self.db.collection(collectionName);
};
// Shared change stream for a collection, created on first use. It deregisters
// itself once its last driver detaches, so a later observer opens a fresh one.
MongoConnection.prototype._acquireSharedChangeStream = function(collectionName) {
    const self = this;
    const existing = self._sharedChangeStreams[collectionName];
    if (existing) {
        return existing;
    }
    const sharedStream = new SharedChangeStream(self, collectionName, function() {
        if (self._sharedChangeStreams[collectionName] === sharedStream) {
            delete self._sharedChangeStreams[collectionName];
        }
    });
    self._sharedChangeStreams[collectionName] = sharedStream;
    return sharedStream;
};
MongoConnection.prototype.createCappedCollectionAsync = function(collectionName, byteSize, maxDocuments) {
    return _async_to_generator(function*() {
        var self = this;
        if (!self.db) throw Error("createCappedCollectionAsync called before Connection created?");
        yield self.db.createCollection(collectionName, {
            capped: true,
            size: byteSize,
            max: maxDocuments
        });
    }).call(this);
};
// This should be called synchronously with a write, to create a
// transaction on the current write fence, if any. After we can read
// the write, and after observers have been notified (or at least,
// after the observer notifiers have added themselves to the write
// fence), you should call 'committed()' on the object returned.
MongoConnection.prototype._maybeBeginWrite = function() {
    const fence = DDPServer._getCurrentFence();
    if (fence) {
        return fence.beginWrite();
    } else {
        return {
            committed: function() {}
        };
    }
};
// Record the clusterTime of a write on the current DDP write fence so the
// ChangeStreamObserveDriver can wait for that exact timestamp instead of
// polling the server for a "current" time that may not be echoed by the
// stream until the next heartbeat (~1s).
//
// The target is per-collection: each change stream driver watches a single
// collection and will only observe clusterTimes from events in that
// collection. A fence may cover writes across multiple collections (e.g.
// creating a card also writes to activities), so picking a single "max ts"
// for the whole fence would stall drivers whose collection never sees
// that specific ts. We therefore keep the max ts per collection.
function _annotateFenceWithWriteTs(fence, collectionName, writeTs) {
    if (!fence || !writeTs || !collectionName) return;
    const map = fence._csTargetTsByCollection = fence._csTargetTsByCollection || {};
    const prev = map[collectionName];
    if (!prev || compareOperationTimes(writeTs, prev) > 0) {
        map[collectionName] = writeTs;
    }
}
// Internal interface: adds a callback which is called when the Mongo primary
// changes. Returns a stop handle.
MongoConnection.prototype._onFailover = function(callback1) {
    return this._onFailoverHook.register(callback1);
};
MongoConnection.prototype.insertAsync = function(collection_name, document) {
    return _async_to_generator(function*() {
        const self = this;
        if (collection_name === "___meteor_failure_test_collection") {
            const e = new Error("Failure test");
            e._expectedByTest = true;
            throw e;
        }
        if (!(LocalCollection._isPlainObject(document) && !EJSON._isCustomType(document))) {
            throw new Error("Only plain objects may be inserted into MongoDB");
        }
        var write = self._maybeBeginWrite();
        var refresh = function() {
            return _async_to_generator(function*() {
                yield Meteor.refresh({
                    collection: collection_name,
                    id: document._id
                });
            })();
        };
        const session = self.client.startSession();
        return self.rawCollection(collection_name).insertOne(replaceTypes(document, replaceMeteorAtomWithMongo), {
            safe: true,
            session
        }).then(({ insertedId })=>_async_to_generator(function*() {
                _annotateFenceWithWriteTs(DDPServer._getCurrentFence(), collection_name, session.operationTime);
                yield session.endSession();
                yield refresh();
                yield write.committed();
                return insertedId;
            })()).catch((e)=>_async_to_generator(function*() {
                try {
                    yield session.endSession();
                } catch (_) {}
                yield write.committed();
                throw e;
            })());
    }).call(this);
};
// Cause queries that may be affected by the selector to poll in this write
// fence.
MongoConnection.prototype._refresh = function(collectionName, selector) {
    return _async_to_generator(function*() {
        var refreshKey = {
            collection: collectionName
        };
        // If we know which documents we're removing, don't poll queries that are
        // specific to other documents. (Note that multiple notifications here should
        // not cause multiple polls, since all our listener is doing is enqueueing a
        // poll.)
        var specificIds = LocalCollection._idsMatchedBySelector(selector);
        if (specificIds) {
            for (const id of specificIds){
                yield Meteor.refresh(Object.assign({
                    id: id
                }, refreshKey));
            }
            ;
        } else {
            yield Meteor.refresh(refreshKey);
        }
    })();
};
MongoConnection.prototype.removeAsync = function(collection_name, selector) {
    return _async_to_generator(function*() {
        var self = this;
        if (collection_name === "___meteor_failure_test_collection") {
            var e = new Error("Failure test");
            e._expectedByTest = true;
            throw e;
        }
        var write = self._maybeBeginWrite();
        var refresh = function() {
            return _async_to_generator(function*() {
                yield self._refresh(collection_name, selector);
            })();
        };
        const session = self.client.startSession();
        return self.rawCollection(collection_name).deleteMany(replaceTypes(selector, replaceMeteorAtomWithMongo), {
            safe: true,
            session
        }).then(({ deletedCount })=>_async_to_generator(function*() {
                // Only annotate the fence when the operation actually modified data:
                // a no-op deleteMany (matched no docs) does not generate a change-
                // stream event, so a ChangeStreamObserveDriver waiting on this ts
                // would block forever waiting for an event Mongo will never emit.
                if (deletedCount > 0) {
                    _annotateFenceWithWriteTs(DDPServer._getCurrentFence(), collection_name, session.operationTime);
                }
                yield session.endSession();
                yield refresh();
                yield write.committed();
                return transformResult({
                    result: {
                        modifiedCount: deletedCount
                    }
                }).numberAffected;
            })()).catch((err)=>_async_to_generator(function*() {
                try {
                    yield session.endSession();
                } catch (_) {}
                yield write.committed();
                throw err;
            })());
    }).call(this);
};
MongoConnection.prototype.dropCollectionAsync = function(collectionName) {
    return _async_to_generator(function*() {
        var self = this;
        var write = self._maybeBeginWrite();
        var refresh = function() {
            return Meteor.refresh({
                collection: collectionName,
                id: null,
                dropCollection: true
            });
        };
        const session = self.client.startSession();
        return self.rawCollection(collectionName).drop({
            session
        }).then((result)=>_async_to_generator(function*() {
                // Do NOT annotate the fence here. ChangeStreamObserveDriver's pipeline
                // only forwards insert/update/replace/delete; mongo emits a `drop`
                // (and follow-up `invalidate`) event that our $match drops, so a
                // fence waiter pinned to this clusterTime would block forever waiting
                // for an event that never reaches the driver.
                yield session.endSession();
                yield refresh();
                yield write.committed();
                return result;
            })()).catch((e)=>_async_to_generator(function*() {
                try {
                    yield session.endSession();
                } catch (_) {}
                yield write.committed();
                throw e;
            })());
    }).call(this);
};
// For testing only.  Slightly better than `c.rawDatabase().dropDatabase()`
// because it lets the test's fence wait for it to be complete.
MongoConnection.prototype.dropDatabaseAsync = function() {
    return _async_to_generator(function*() {
        var self = this;
        var write = self._maybeBeginWrite();
        var refresh = function() {
            return _async_to_generator(function*() {
                yield Meteor.refresh({
                    dropDatabase: true
                });
            })();
        };
        try {
            yield self.db._dropDatabase();
            yield refresh();
            yield write.committed();
        } catch (e) {
            yield write.committed();
            throw e;
        }
    }).call(this);
};
MongoConnection.prototype.updateAsync = function(collection_name, selector, mod, options) {
    return _async_to_generator(function*() {
        var self = this;
        if (collection_name === "___meteor_failure_test_collection") {
            var e = new Error("Failure test");
            e._expectedByTest = true;
            throw e;
        }
        // explicit safety check. null and undefined can crash the mongo
        // driver. Although the node driver and minimongo do 'support'
        // non-object modifier in that they don't crash, they are not
        // meaningful operations and do not do anything. Defensively throw an
        // error here.
        if (!mod || typeof mod !== 'object') {
            const error = new Error("Invalid modifier. Modifier must be an object.");
            throw error;
        }
        if (!(LocalCollection._isPlainObject(mod) && !EJSON._isCustomType(mod))) {
            const error = new Error("Only plain objects may be used as replacement" + " documents in MongoDB");
            throw error;
        }
        if (!options) options = {};
        var write = self._maybeBeginWrite();
        var refresh = function() {
            return _async_to_generator(function*() {
                yield self._refresh(collection_name, selector);
            })();
        };
        var collection = self.rawCollection(collection_name);
        const session = self.client.startSession();
        var mongoOpts = {
            safe: true,
            session
        };
        // Add support for filtered positional operator
        if (options.arrayFilters !== undefined) mongoOpts.arrayFilters = options.arrayFilters;
        // explictly enumerate options that minimongo supports
        if (options.upsert) mongoOpts.upsert = true;
        if (options.multi) mongoOpts.multi = true;
        // Lets you get a more more full result from MongoDB. Use with caution:
        // might not work with C.upsert (as opposed to C.update({upsert:true}) or
        // with simulated upsert.
        if (options.fullResult) mongoOpts.fullResult = true;
        var mongoSelector = replaceTypes(selector, replaceMeteorAtomWithMongo);
        var mongoMod = replaceTypes(mod, replaceMeteorAtomWithMongo);
        var isModify = LocalCollection._isModificationMod(mongoMod);
        if (options._forbidReplace && !isModify) {
            var err = new Error("Invalid modifier. Replacements are forbidden.");
            throw err;
        }
        // We've already run replaceTypes/replaceMeteorAtomWithMongo on
        // selector and mod.  We assume it doesn't matter, as far as
        // the behavior of modifiers is concerned, whether `_modify`
        // is run on EJSON or on mongo-converted EJSON.
        // Run this code up front so that it fails fast if someone uses
        // a Mongo update operator we don't support.
        let knownId;
        if (options.upsert) {
            try {
                let newDoc = LocalCollection._createUpsertDocument(selector, mod);
                knownId = newDoc._id;
            } catch (err) {
                throw err;
            }
        }
        if (options.upsert && !isModify && !knownId && options.insertedId && !(options.insertedId instanceof Mongo.ObjectID && options.generatedId)) {
            // In case of an upsert with a replacement, where there is no _id defined
            // in either the query or the replacement doc, mongo will generate an id itself.
            // Therefore we need this special strategy if we want to control the id ourselves.
            // We don't need to do this when:
            // - This is not a replacement, so we can add an _id to $setOnInsert
            // - The id is defined by query or mod we can just add it to the replacement doc
            // - The user did not specify any id preference and the id is a Mongo ObjectId,
            //     then we can just let Mongo generate the id
            return yield simulateUpsertWithInsertedId(collection, mongoSelector, mongoMod, options, session).then((result)=>_async_to_generator(function*() {
                    // Skip annotation when nothing actually changed — change-stream
                    // observers wait for the exact ts and a no-op upsert produces no
                    // event, so the wait would never resolve.
                    if (result && result.numberAffected) {
                        _annotateFenceWithWriteTs(DDPServer._getCurrentFence(), collection_name, session.operationTime);
                    }
                    yield session.endSession();
                    yield refresh();
                    yield write.committed();
                    if (result && !options._returnObject) {
                        return result.numberAffected;
                    } else {
                        return result;
                    }
                })()).catch((err)=>_async_to_generator(function*() {
                    try {
                        yield session.endSession();
                    } catch (_) {}
                    throw err;
                })());
        } else {
            if (options.upsert && !knownId && options.insertedId && isModify) {
                if (!mongoMod.hasOwnProperty('$setOnInsert')) {
                    mongoMod.$setOnInsert = {};
                }
                knownId = options.insertedId;
                Object.assign(mongoMod.$setOnInsert, replaceTypes({
                    _id: options.insertedId
                }, replaceMeteorAtomWithMongo));
            }
            const strings = Object.keys(mongoMod).filter((key)=>!key.startsWith("$"));
            let updateMethod = strings.length > 0 ? 'replaceOne' : 'updateMany';
            updateMethod = updateMethod === 'updateMany' && !mongoOpts.multi ? 'updateOne' : updateMethod;
            return collection[updateMethod].bind(collection)(mongoSelector, mongoMod, mongoOpts).then((result)=>_async_to_generator(function*() {
                    // Skip annotation when nothing actually changed: a no-op
                    // updateOne / updateMany / replaceOne does not emit a change-
                    // stream event, so a fence waiter pinned to this ts would block
                    // forever. modifiedCount excludes matched-but-unchanged docs (which
                    // also produce no event), and upsertedCount catches inserts.
                    if (result && (result.modifiedCount > 0 || result.upsertedCount > 0)) {
                        _annotateFenceWithWriteTs(DDPServer._getCurrentFence(), collection_name, session.operationTime);
                    }
                    yield session.endSession();
                    var meteorResult = transformResult({
                        result
                    });
                    if (meteorResult && options._returnObject) {
                        // If this was an upsertAsync() call, and we ended up
                        // inserting a new doc and we know its id, then
                        // return that id as well.
                        if (options.upsert && meteorResult.insertedId) {
                            if (knownId) {
                                meteorResult.insertedId = knownId;
                            } else if (meteorResult.insertedId instanceof MongoDB.ObjectId) {
                                meteorResult.insertedId = new Mongo.ObjectID(meteorResult.insertedId.toHexString());
                            }
                        }
                        yield refresh();
                        yield write.committed();
                        return meteorResult;
                    } else {
                        yield refresh();
                        yield write.committed();
                        return meteorResult.numberAffected;
                    }
                })()).catch((err)=>_async_to_generator(function*() {
                    try {
                        yield session.endSession();
                    } catch (_) {}
                    yield write.committed();
                    throw err;
                })());
        }
    }).call(this);
};
// exposed for testing
MongoConnection._isCannotChangeIdError = function(err) {
    // Mongo 3.2.* returns error as next Object:
    // {name: String, code: Number, errmsg: String}
    // Older Mongo returns:
    // {name: String, code: Number, err: String}
    var error = err.errmsg || err.err;
    // We don't use the error code here
    // because the error code we observed it producing (16837) appears to be
    // a far more generic error code based on examining the source.
    if (error.indexOf('The _id field cannot be changed') === 0 || error.indexOf("the (immutable) field '_id' was found to have been altered to _id") !== -1) {
        return true;
    }
    return false;
};
// XXX MongoConnection.upsertAsync() does not return the id of the inserted document
// unless you set it explicitly in the selector or modifier (as a replacement
// doc).
MongoConnection.prototype.upsertAsync = function(collectionName, selector, mod, options) {
    return _async_to_generator(function*() {
        var self = this;
        if (typeof options === "function" && !callback) {
            callback = options;
            options = {};
        }
        return self.updateAsync(collectionName, selector, mod, Object.assign({}, options, {
            upsert: true,
            _returnObject: true
        }));
    }).call(this);
};
MongoConnection.prototype.find = function(collectionName, selector, options) {
    var self = this;
    if (arguments.length === 1) selector = {};
    return new Cursor(self, new CursorDescription(collectionName, selector, options));
};
MongoConnection.prototype.findOneAsync = function(_0, _1, _2) {
    return _async_to_generator(function*(collection_name, selector, options) {
        var self = this;
        if (arguments.length === 1) {
            selector = {};
        }
        options = options || {};
        options.limit = 1;
        const results = yield self.find(collection_name, selector, options).fetch();
        return results[0];
    }).apply(this, arguments);
};
// We'll actually design an index API later. For now, we just pass through to
// Mongo's, but make it synchronous.
MongoConnection.prototype.createIndexAsync = function(collectionName, index, options) {
    return _async_to_generator(function*() {
        var self = this;
        // We expect this function to be called at startup, not from within a method,
        // so we don't interact with the write fence.
        var collection = self.rawCollection(collectionName);
        yield collection.createIndex(index, options);
    }).call(this);
};
// just to be consistent with the other methods
MongoConnection.prototype.createIndex = MongoConnection.prototype.createIndexAsync;
MongoConnection.prototype.countDocuments = function(collectionName, ...args) {
    args = args.map((arg)=>replaceTypes(arg, replaceMeteorAtomWithMongo));
    const collection = this.rawCollection(collectionName);
    return collection.countDocuments(...args);
};
MongoConnection.prototype.estimatedDocumentCount = function(collectionName, ...args) {
    args = args.map((arg)=>replaceTypes(arg, replaceMeteorAtomWithMongo));
    const collection = this.rawCollection(collectionName);
    return collection.estimatedDocumentCount(...args);
};
MongoConnection.prototype.ensureIndexAsync = MongoConnection.prototype.createIndexAsync;
MongoConnection.prototype.dropIndexAsync = function(collectionName, index) {
    return _async_to_generator(function*() {
        var self = this;
        // This function is only used by test code, not within a method, so we don't
        // interact with the write fence.
        var collection = self.rawCollection(collectionName);
        var indexName = yield collection.dropIndex(index);
    }).call(this);
};
CLIENT_ONLY_METHODS.forEach(function(m) {
    MongoConnection.prototype[m] = function() {
        throw new Error(`${m} +  is not available on the server. Please use ${getAsyncMethodName(m)}() instead.`);
    };
});
var NUM_OPTIMISTIC_TRIES = 3;
var simulateUpsertWithInsertedId = function(collection, selector, mod, options, session) {
    return _async_to_generator(function*() {
        // STRATEGY: First try doing an upsert with a generated ID.
        // If this throws an error about changing the ID on an existing document
        // then without affecting the database, we know we should probably try
        // an update without the generated ID. If it affected 0 documents,
        // then without affecting the database, we the document that first
        // gave the error is probably removed and we need to try an insert again
        // We go back to step one and repeat.
        // Like all "optimistic write" schemes, we rely on the fact that it's
        // unlikely our writes will continue to be interfered with under normal
        // circumstances (though sufficiently heavy contention with writers
        // disagreeing on the existence of an object will cause writes to fail
        // in theory).
        var insertedId = options.insertedId; // must exist
        var mongoOptsForUpdate = {
            safe: true,
            multi: options.multi,
            session
        };
        var mongoOptsForInsert = {
            safe: true,
            upsert: true,
            session
        };
        var replacementWithId = Object.assign(replaceTypes({
            _id: insertedId
        }, replaceMeteorAtomWithMongo), mod);
        var tries = NUM_OPTIMISTIC_TRIES;
        var doUpdate = function() {
            return _async_to_generator(function*() {
                tries--;
                if (!tries) {
                    throw new Error("Upsert failed after " + NUM_OPTIMISTIC_TRIES + " tries.");
                } else {
                    let method = collection.updateMany;
                    if (!Object.keys(mod).some((key)=>key.startsWith("$"))) {
                        method = collection.replaceOne.bind(collection);
                    }
                    return method(selector, mod, mongoOptsForUpdate).then((result)=>{
                        if (result && (result.modifiedCount || result.upsertedCount)) {
                            return {
                                numberAffected: result.modifiedCount || result.upsertedCount,
                                insertedId: result.upsertedId || undefined
                            };
                        } else {
                            return doConditionalInsert();
                        }
                    });
                }
            })();
        };
        var doConditionalInsert = function() {
            return collection.replaceOne(selector, replacementWithId, mongoOptsForInsert).then((result)=>({
                    numberAffected: result.upsertedCount,
                    insertedId: result.upsertedId
                })).catch((err)=>{
                if (MongoConnection._isCannotChangeIdError(err)) {
                    return doUpdate();
                } else {
                    throw err;
                }
            });
        };
        return doUpdate();
    })();
};
// observeChanges for tailable cursors on capped collections.
//
// Some differences from normal cursors:
//   - Will never produce anything other than 'added' or 'addedBefore'. If you
//     do update a document that has already been produced, this will not notice
//     it.
//   - If you disconnect and reconnect from Mongo, it will essentially restart
//     the query, which will lead to duplicate results. This is pretty bad,
//     but if you include a field called 'ts' which is inserted as
//     new MongoInternals.MongoTimestamp(0, 0) (which is initialized to the
//     current Mongo-style timestamp), we'll be able to find the place to
//     restart properly. (This field is specifically understood by Mongo with an
//     optimization which allows it to find the right place to start without
//     an index on ts. It's how the oplog works.)
//   - No callbacks are triggered synchronously with the call (there's no
//     differentiation between "initial data" and "later changes"; everything
//     that matches the query gets sent asynchronously).
//   - De-duplication is not implemented.
//   - Does not yet interact with the write fence. Probably, this should work by
//     ignoring removes (which don't work on capped collections) and updates
//     (which don't affect tailable cursors), and just keeping track of the ID
//     of the inserted object, and closing the write fence once you get to that
//     ID (or timestamp?).  This doesn't work well if the document doesn't match
//     the query, though.  On the other hand, the write fence can close
//     immediately if it does not match the query. So if we trust minimongo
//     enough to accurately evaluate the query against the write fence, we
//     should be able to do this...  Of course, minimongo doesn't even support
//     Mongo Timestamps yet.
MongoConnection.prototype._observeChangesTailable = function(cursorDescription, ordered, callbacks) {
    var self = this;
    // Tailable cursors only ever call added/addedBefore callbacks, so it's an
    // error if you didn't provide them.
    if (ordered && !callbacks.addedBefore || !ordered && !callbacks.added) {
        throw new Error("Can't observe an " + (ordered ? "ordered" : "unordered") + " tailable cursor without a " + (ordered ? "addedBefore" : "added") + " callback");
    }
    return self.tail(cursorDescription, function(doc) {
        var id = doc._id;
        delete doc._id;
        // The ts is an implementation detail. Hide it.
        delete doc.ts;
        if (ordered) {
            callbacks.addedBefore(id, doc, null);
        } else {
            callbacks.added(id, doc);
        }
    });
};
MongoConnection.prototype._createAsynchronousCursor = function(cursorDescription, options = {}) {
    var self = this;
    const { selfForIteration, useTransform } = options;
    options = {
        selfForIteration,
        useTransform
    };
    var collection = self.rawCollection(cursorDescription.collectionName);
    var cursorOptions = cursorDescription.options;
    var mongoOptions = {
        sort: cursorOptions.sort,
        limit: cursorOptions.limit,
        skip: cursorOptions.skip,
        projection: cursorOptions.fields || cursorOptions.projection,
        readPreference: cursorOptions.readPreference,
        collation: cursorOptions.collation
    };
    // Do we want a tailable cursor (which only works on capped collections)?
    if (cursorOptions.tailable) {
        mongoOptions.numberOfRetries = -1;
    }
    var dbCursor = collection.find(replaceTypes(cursorDescription.selector, replaceMeteorAtomWithMongo), mongoOptions);
    // Do we want a tailable cursor (which only works on capped collections)?
    if (cursorOptions.tailable) {
        // We want a tailable cursor...
        dbCursor.addCursorFlag("tailable", true);
        // ... and for the server to wait a bit if any getMore has no data (rather
        // than making us put the relevant sleeps in the client)...
        dbCursor.addCursorFlag("awaitData", true);
        // And if this is on the oplog collection and the cursor specifies a 'ts',
        // then set the undocumented oplog replay flag, which does a special scan to
        // find the first document (instead of creating an index on ts). This is a
        // very hard-coded Mongo flag which only works on the oplog collection and
        // only works with the ts field.
        if (cursorDescription.collectionName === OPLOG_COLLECTION && cursorDescription.selector.ts) {
            dbCursor.addCursorFlag("oplogReplay", true);
        }
    }
    if (typeof cursorOptions.maxTimeMs !== 'undefined') {
        dbCursor = dbCursor.maxTimeMS(cursorOptions.maxTimeMs);
    }
    if (typeof cursorOptions.hint !== 'undefined') {
        dbCursor = dbCursor.hint(cursorOptions.hint);
    }
    return new AsynchronousCursor(dbCursor, cursorDescription, options, collection);
};
// Tails the cursor described by cursorDescription, most likely on the
// oplog. Calls docCallback with each document found. Ignores errors and just
// restarts the tail on error.
//
// If timeoutMS is set, then if we don't get a new document every timeoutMS,
// kill and restart the cursor. This is primarily a workaround for #8598.
MongoConnection.prototype.tail = function(cursorDescription, docCallback, timeoutMS) {
    var self = this;
    if (!cursorDescription.options.tailable) throw new Error("Can only tail a tailable cursor");
    var cursor = self._createAsynchronousCursor(cursorDescription);
    var stopped = false;
    var lastTS;
    Meteor.defer(function loop() {
        return _async_to_generator(function*() {
            var doc = null;
            while(true){
                if (stopped) return;
                try {
                    doc = yield cursor._nextObjectPromiseWithTimeout(timeoutMS);
                } catch (err) {
                    // We should not ignore errors here unless we want to spend a lot of time debugging
                    console.error(err);
                    // There's no good way to figure out if this was actually an error from
                    // Mongo, or just client-side (including our own timeout error). Ah
                    // well. But either way, we need to retry the cursor (unless the failure
                    // was because the observe got stopped).
                    doc = null;
                }
                // Since we awaited a promise above, we need to check again to see if
                // we've been stopped before calling the callback.
                if (stopped) return;
                if (doc) {
                    // If a tailable cursor contains a "ts" field, use it to recreate the
                    // cursor on error. ("ts" is a standard that Mongo uses internally for
                    // the oplog, and there's a special flag that lets you do binary search
                    // on it instead of needing to use an index.)
                    lastTS = doc.ts;
                    docCallback(doc);
                } else {
                    var newSelector = Object.assign({}, cursorDescription.selector);
                    if (lastTS) {
                        newSelector.ts = {
                            $gt: lastTS
                        };
                    }
                    cursor = self._createAsynchronousCursor(new CursorDescription(cursorDescription.collectionName, newSelector, cursorDescription.options));
                    // Mongo failover takes many seconds.  Retry in a bit.  (Without this
                    // setTimeout, we peg the CPU at 100% and never notice the actual
                    // failover.
                    setTimeout(loop, 100);
                    break;
                }
            }
        })();
    });
    return {
        stop: function() {
            stopped = true;
            cursor.close();
        }
    };
};
const driverClasses = {
    changeStreams: ChangeStreamObserveDriver,
    oplog: OplogObserveDriver,
    polling: PollingObserveDriver
};
function _getConfiguredReactivityOrder() {
    var _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
    const reactivitySetting = (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : _Meteor_settings_packages_mongo.reactivity;
    const isArraySetting = Array.isArray(reactivitySetting);
    const isStringSetting = typeof reactivitySetting === 'string';
    const hasCustomDriverOrder = isArraySetting || isStringSetting;
    if (reactivitySetting && !hasCustomDriverOrder) {
        throw new Error('Meteor.settings.packages.mongo.reactivity must be a string or an array of observer drivers');
    }
    let configuredOrder = DEFAULT_REACTIVITY_ORDER;
    if (hasCustomDriverOrder) {
        if (isStringSetting) {
            configuredOrder = [
                reactivitySetting
            ];
        } else {
            configuredOrder = [];
            for (const name of reactivitySetting){
                if (!configuredOrder.includes(name)) {
                    configuredOrder.push(name);
                }
            }
        }
    }
    const invalidDriverNames = configuredOrder.filter((name)=>!driverClasses[name]);
    if (invalidDriverNames.length) {
        throw new Error(`Invalid Mongo reactivity driver(s): ${invalidDriverNames.join(', ')}`);
    }
    if (hasCustomDriverOrder && configuredOrder.length === 0) {
        throw new Error('Meteor.settings.packages.mongo.reactivity must specify at least one observer driver');
    }
    return configuredOrder;
}
;
MongoConnection.prototype._selectReactivityDriver = function(configuredOrder, driverChecks) {
    return _async_to_generator(function*() {
        const availabilityErrors = [];
        let driverClass;
        let matcher;
        let sorter;
        for (const driverName of configuredOrder){
            const checker = driverChecks[driverName];
            if (!checker) {
                availabilityErrors.push(`Unknown driver "${driverName}"`);
                continue;
            }
            const result = yield checker();
            if (result.available) {
                matcher = result.matcher;
                sorter = result.sorter;
                driverClass = driverClasses[driverName];
                break;
            }
            if (result.reason) {
                availabilityErrors.push(`${driverName}: ${result.reason}`);
            }
        }
        return {
            driverClass,
            matcher,
            sorter
        };
    })();
};
MongoConnection.prototype._observeChanges = function(cursorDescription, ordered, callbacks, nonMutatingCallbacks) {
    return _async_to_generator(function*() {
        const collectionName = cursorDescription.collectionName;
        if (cursorDescription.options.tailable) {
            return this._observeChangesTailable(cursorDescription, ordered, callbacks);
        }
        // You may not filter out _id when observing changes, because the id is a core
        // part of the observeChanges API.
        const fieldsOptions = cursorDescription.options.projection || cursorDescription.options.fields;
        if ((fieldsOptions === null || fieldsOptions === void 0 ? void 0 : fieldsOptions._id) === 0 || (fieldsOptions === null || fieldsOptions === void 0 ? void 0 : fieldsOptions._id) === false) {
            throw Error("You may not observe a cursor with {fields: {_id: 0}}");
        }
        var observeKey = EJSON.stringify(Object.assign({
            ordered: ordered
        }, cursorDescription));
        var multiplexer, observeDriver;
        var firstHandle = false;
        // Find a matching ObserveMultiplexer, or create a new one. This next block is
        // guaranteed to not yield (and it doesn't call anything that can observe a
        // new query), so no other calls to this function can interleave with it.
        if (observeKey in this._observeMultiplexers) {
            multiplexer = this._observeMultiplexers[observeKey];
        } else {
            firstHandle = true;
            // Create a new ObserveMultiplexer.
            multiplexer = new ObserveMultiplexer({
                ordered: ordered,
                onStop: ()=>{
                    delete this._observeMultiplexers[observeKey];
                    return observeDriver.stop();
                }
            });
        }
        var observeHandle = new ObserveHandle(multiplexer, callbacks, nonMutatingCallbacks);
        const oplogOptions = this._oplogHandle && this._oplogHandle._oplogOptions || {};
        const { includeCollections, excludeCollections } = oplogOptions;
        if (firstHandle) {
            var matcher, sorter;
            // Create the collator once and share it across Matcher and Sorter.
            const collator = cursorDescription.options.collation ? LocalCollection._createCollator(cursorDescription.options.collation) : null;
            const configuredOrder = _getConfiguredReactivityOrder();
            const driverChecks = {
                changeStreams: ()=>_async_to_generator(function*() {
                        let localMatcher;
                        const reasons = [];
                        if (this._supportsChangeStreams === undefined) {
                            const serverReasons = [];
                            try {
                                // Change Streams require MongoDB 6+ and replica set or sharded cluster
                                const admin = this.db.admin();
                                const serverInfo = yield admin.serverInfo();
                                const isMasterPromise = admin.command({
                                    isMaster: 1
                                });
                                const versionString = serverInfo.version || 'unknown';
                                const versionParts = versionString.split('.').map(Number);
                                const major = Number.isFinite(versionParts[0]) ? versionParts[0] : 0;
                                // Check MongoDB version (6+)
                                const hasMinVersion = major >= 6;
                                if (!hasMinVersion) {
                                    serverReasons.push(`Change Streams feature require MongoDB 6+ (current ${versionString})`);
                                } else {
                                    // Check if we're running on a replica set or sharded cluster.
                                    // `isMaster.ismaster` is true on a standalone too (it only means
                                    // the node accepts writes), so it is NOT a replica-set signal:
                                    // including it made standalone deployments select Change Streams
                                    // and then fail at watch() with "$changeStream is only supported
                                    // on replica sets". `setName` is the replica-set signal.
                                    const isMaster = yield isMasterPromise;
                                    const isReplicaSet = Boolean(isMaster.setName || isMaster.secondary);
                                    const isSharded = isMaster.msg === 'isdbgrid';
                                    if (!(isReplicaSet || isSharded)) {
                                        serverReasons.push('Change Streams require a replica set or sharded cluster');
                                    }
                                }
                            } catch (error) {
                                Meteor._debug("Error checking Change Stream support:", error);
                                serverReasons.push(`Error checking Change Stream support: ${error.message}`);
                            }
                            this._changeStreamServerReasons = serverReasons;
                            this._supportsChangeStreams = serverReasons.length === 0;
                        }
                        if (!this._supportsChangeStreams) {
                            var _this__changeStreamServerReasons;
                            if ((_this__changeStreamServerReasons = this._changeStreamServerReasons) === null || _this__changeStreamServerReasons === void 0 ? void 0 : _this__changeStreamServerReasons.length) {
                                reasons.push(...this._changeStreamServerReasons);
                            } else {
                                reasons.push('Change Streams not supported by MongoDB deployment');
                            }
                        }
                        if (ordered) {
                            reasons.push('Change Streams only supports unordered observeChanges');
                        }
                        if (callbacks._testOnlyPollCallback) {
                            reasons.push('Change Streams cannot be used with _testOnlyPollCallback');
                        }
                        // Cursors with `skip` or `limit` are not supported. Change streams
                        // emit one event per write across the entire collection, but the
                        // result set of a limit/skip cursor is a moving window — when a doc
                        // outside that window changes it can shift the window, and inferring
                        // that purely from change events would require re-running the
                        // query. Without this fall-back we'd emit added events for any
                        // matching insert anywhere in the collection (regardless of limit),
                        // breaking tests like `livedata server - publish cursor is properly
                        // awaited`. Mirrors OplogObserveDriver.cursorSupported's reasoning.
                        const csOptions = cursorDescription.options || {};
                        if (csOptions.skip || csOptions.limit) {
                            reasons.push('Cursor with skip/limit not supported by Change Streams');
                        }
                        if (reasons.length) {
                            return {
                                available: false,
                                reason: reasons.join('; ')
                            };
                        }
                        try {
                            localMatcher = new Minimongo.Matcher(cursorDescription.selector, undefined, collator);
                        } catch (e) {
                            if (Meteor.isClient && e instanceof MiniMongoQueryError) {
                                throw e;
                            }
                            return {
                                available: false,
                                reason: `Selector not supported for Change Streams: ${e.message}`
                            };
                        }
                        return {
                            available: true,
                            matcher: localMatcher
                        };
                    }).call(this),
                oplog: ()=>{
                    const reasons = [];
                    let localMatcher;
                    let localSorter;
                    if (!(this._oplogHandle && !ordered && !callbacks._testOnlyPollCallback)) {
                        reasons.push('Oplog tailing not available for this cursor');
                    }
                    if (!reasons.length) {
                        if ((excludeCollections === null || excludeCollections === void 0 ? void 0 : excludeCollections.length) && excludeCollections.includes(collectionName)) {
                            if (!oplogCollectionWarnings.includes(collectionName)) {
                                Meteor._debug(`Meteor.settings.packages.mongo.oplogExcludeCollections includes the collection ${collectionName} - your subscriptions will only use long polling!`);
                                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
                            }
                            reasons.push('Collection is excluded from oplog tailing');
                        } else if ((includeCollections === null || includeCollections === void 0 ? void 0 : includeCollections.length) && !includeCollections.includes(collectionName)) {
                            if (!oplogCollectionWarnings.includes(collectionName)) {
                                Meteor._debug(`Meteor.settings.packages.mongo.oplogIncludeCollections does not include the collection ${collectionName} - your subscriptions will only use long polling!`);
                                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
                            }
                            reasons.push('Collection is not included in oplog tailing');
                        }
                    }
                    if (!reasons.length) {
                        try {
                            localMatcher = new Minimongo.Matcher(cursorDescription.selector, undefined, collator);
                        } catch (e) {
                            // XXX make all compilation errors MinimongoError or something
                            //     so that this doesn't ignore unrelated exceptions
                            if (Meteor.isClient && e instanceof MiniMongoQueryError) {
                                throw e;
                            }
                            reasons.push(`Selector not supported for oplog: ${e.message}`);
                        }
                    }
                    if (!reasons.length && !OplogObserveDriver.cursorSupported(cursorDescription, localMatcher)) {
                        reasons.push('Cursor not supported by oplog');
                    }
                    if (!reasons.length && cursorDescription.options.sort) {
                        try {
                            localSorter = new Minimongo.Sorter(cursorDescription.options.sort, collator);
                        } catch (e) {
                            // XXX make all compilation errors MinimongoError or something
                            //     so that this doesn't ignore unrelated exceptions
                            reasons.push('Sort not supported by oplog');
                        }
                    }
                    return {
                        available: reasons.length === 0,
                        matcher: localMatcher,
                        sorter: localSorter,
                        reason: reasons.join('; ')
                    };
                },
                polling: ()=>({
                        available: true
                    })
            };
            let { driverClass, matcher: selectedMatcher, sorter: selectedSorter } = yield this._selectReactivityDriver(configuredOrder, driverChecks);
            // Fallback to polling if no driver is available
            if (!driverClass) {
                Meteor._debug('No reactivity driver available for cursor, falling back to polling');
                driverClass = PollingObserveDriver;
            }
            matcher = selectedMatcher;
            sorter = selectedSorter;
            observeDriver = new driverClass({
                cursorDescription,
                mongoHandle: this,
                multiplexer,
                ordered,
                matcher,
                sorter,
                _testOnlyPollCallback: callbacks._testOnlyPollCallback
            });
            if (observeDriver._init) {
                yield observeDriver._init();
            }
            // This field is only set for use in tests.
            multiplexer._observeDriver = observeDriver;
        }
        this._observeMultiplexers[observeKey] = multiplexer;
        // Blocks until the initial adds have been sent.
        yield multiplexer.addHandleAndSendInitialAdds(observeHandle);
        return observeHandle;
    }).call(this);
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_common.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({replaceNames:()=>replaceNames,compareOperationTimes:()=>compareOperationTimes});module.export({MongoDB:()=>MongoDB,writeCallback:()=>writeCallback,transformResult:()=>transformResult,replaceMeteorAtomWithMongo:()=>replaceMeteorAtomWithMongo,replaceTypes:()=>replaceTypes,replaceMongoAtomWithMeteor:()=>replaceMongoAtomWithMeteor},true);let clone;module.link('lodash.clone',{default(v){clone=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
/** @type {import('mongodb')} */ const MongoDB = Object.assign(NpmModuleMongodb, {
    ObjectID: NpmModuleMongodb.ObjectId
});
// The write methods block until the database has confirmed the write (it may
// not be replicated or stable on disk, but one server has confirmed it) if no
// callback is provided. If a callback is provided, then they call the callback
// when the write is confirmed. They return nothing on success, and raise an
// exception on failure.
//
// After making a write (with insert, update, remove), observers are
// notified asynchronously. If you want to receive a callback once all
// of the observer notifications have landed for your write, do the
// writes inside a write fence (set DDPServer._CurrentWriteFence to a new
// _WriteFence, and then set a callback on the write fence.)
//
// Since our execution environment is single-threaded, this is
// well-defined -- a write "has been made" if it's returned, and an
// observer "has been notified" if its callback has returned.
const writeCallback = function(write, refresh, callback) {
    return function(err, result) {
        if (!err) {
            // XXX We don't have to run this on error, right?
            try {
                refresh();
            } catch (refreshErr) {
                if (callback) {
                    callback(refreshErr);
                    return;
                } else {
                    throw refreshErr;
                }
            }
        }
        write.committed();
        if (callback) {
            callback(err, result);
        } else if (err) {
            throw err;
        }
    };
};
const transformResult = function(driverResult) {
    var meteorResult = {
        numberAffected: 0
    };
    if (driverResult) {
        var mongoResult = driverResult.result;
        // On updates with upsert:true, the inserted values come as a list of
        // upserted values -- even with options.multi, when the upsert does insert,
        // it only inserts one element.
        if (mongoResult.upsertedCount) {
            meteorResult.numberAffected = mongoResult.upsertedCount;
            if (mongoResult.upsertedId) {
                meteorResult.insertedId = mongoResult.upsertedId;
            }
        } else {
            // n was used before Mongo 5.0, in Mongo 5.0 we are not receiving this n
            // field and so we are using modifiedCount instead
            meteorResult.numberAffected = mongoResult.n || mongoResult.matchedCount || mongoResult.modifiedCount;
        }
    }
    return meteorResult;
};
const replaceMeteorAtomWithMongo = function(document) {
    if (EJSON.isBinary(document)) {
        // This does more copies than we'd like, but is necessary because
        // MongoDB.BSON only looks like it takes a Uint8Array (and doesn't actually
        // serialize it correctly).
        return new MongoDB.Binary(Buffer.from(document));
    }
    if (document instanceof MongoDB.Binary) {
        return document;
    }
    if (document instanceof Mongo.ObjectID) {
        return new MongoDB.ObjectId(document.toHexString());
    }
    if (document instanceof MongoDB.ObjectId) {
        return new MongoDB.ObjectId(document.toHexString());
    }
    if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
    }
    if (document instanceof Decimal) {
        return MongoDB.Decimal128.fromString(document.toString());
    }
    if (EJSON._isCustomType(document)) {
        return replaceNames(makeMongoLegal, EJSON.toJSONValue(document));
    }
    // It is not ordinarily possible to stick dollar-sign keys into mongo
    // so we don't bother checking for things that need escaping at this time.
    return undefined;
};
const replaceTypes = function(document, atomTransformer) {
    if (typeof document !== 'object' || document === null) return document;
    var replacedTopLevelAtom = atomTransformer(document);
    if (replacedTopLevelAtom !== undefined) return replacedTopLevelAtom;
    var ret = document;
    Object.entries(document).forEach(function([key, val]) {
        var valReplaced = replaceTypes(val, atomTransformer);
        if (val !== valReplaced) {
            // Lazy clone. Shallow copy.
            if (ret === document) ret = clone(document);
            ret[key] = valReplaced;
        }
    });
    return ret;
};
const replaceMongoAtomWithMeteor = function(document) {
    if (document instanceof MongoDB.Binary) {
        // for backwards compatibility
        if (document.sub_type !== 0) {
            return document;
        }
        var buffer = document.value(true);
        return new Uint8Array(buffer);
    }
    if (document instanceof MongoDB.ObjectId) {
        return new Mongo.ObjectID(document.toHexString());
    }
    if (document instanceof MongoDB.Decimal128) {
        return Decimal(document.toString());
    }
    if (document["EJSON$type"] && document["EJSON$value"] && Object.keys(document).length === 2) {
        return EJSON.fromJSONValue(replaceNames(unmakeMongoLegal, document));
    }
    if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
    }
    return undefined;
};
const makeMongoLegal = (name)=>"EJSON" + name;
const unmakeMongoLegal = (name)=>name.substr(5);
function replaceNames(filter, thing) {
    if (typeof thing === "object" && thing !== null) {
        if (Array.isArray(thing)) {
            return thing.map(replaceNames.bind(null, filter));
        }
        var ret = {};
        Object.entries(thing).forEach(function([key, value]) {
            ret[filter(key)] = replaceNames(filter, value);
        });
        return ret;
    }
    return thing;
}
/**
 * Compares two MongoDB operation times.
 * @param {MongoDB.Timestamp|object} opTime1 - The first operation time to compare.
 * @param {MongoDB.Timestamp|object} opTime2 - The second operation time to compare.
 * @returns {number} - Returns a number indicating the comparison result:
 *   - A negative number if opTime1 is less than opTime2.
 *   - Zero if opTime1 is equal to opTime2.
 *   - A positive number if opTime1 is greater than opTime2.
 */ /**
 * Compares two MongoDB operation times (opTimes).
 *
 * Both parameters accept any value accepted by the `MongoDB.Timestamp` constructor:
 *   - a `Long` (e.g., `new Timestamp(Long)`),
 *   - an object of the form `{ t: number, i: number }`,
 *   - or the legacy two-number form `low, high` (via `Timestamp(low, high)`), which is deprecated;
 *     prefer `{ t, i }` or a `Long`.
 *
 * The function constructs a `MongoDB.Timestamp` from `opTime1` and compares it to `opTime2`
 * using `Timestamp#compare`.
 *
 * @param {MongoDB.Long|{t:number,i:number}|Array<number>|number} opTime1 - Operation time 1; any value accepted by `MongoDB.Timestamp`.
 *     For the two-number form you may provide an array `[low, high]`, but passing two separate numbers to the constructor is deprecated.
 * @param {MongoDB.Long|{t:number,i:number}|Array<number>|number} opTime2 - Operation time 2; same accepted forms as `opTime1`.
 * @returns {number} Comparison result: negative if `opTime1` < `opTime2`, zero if equal, positive if `opTime1` > `opTime2`.
 */ function compareOperationTimes(opTime1, opTime2) {
    return new MongoDB.Timestamp(opTime1).compare(opTime2);
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"asynchronous_cursor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/asynchronous_cursor.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({AsynchronousCursor:()=>AsynchronousCursor});let LocalCollection;module.link('meteor/minimongo/local_collection',{default(v){LocalCollection=v}},0);let replaceMongoAtomWithMeteor,replaceTypes;module.link('./mongo_common',{replaceMongoAtomWithMeteor(v){replaceMongoAtomWithMeteor=v},replaceTypes(v){replaceTypes=v}},1);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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


/**
 * This is just a light wrapper for the cursor. The goal here is to ensure compatibility even if
 * there are breaking changes on the MongoDB driver.
 *
 * This is an internal implementation detail and is created lazily by the main Cursor class.
 */ class AsynchronousCursor {
    [Symbol.asyncIterator]() {
        var cursor = this;
        return {
            next () {
                return _async_to_generator(function*() {
                    const value = yield cursor._nextObjectPromise();
                    return {
                        done: !value,
                        value
                    };
                })();
            }
        };
    }
    // Returns a Promise for the next object from the underlying cursor (before
    // the Mongo->Meteor type replacement).
    _rawNextObjectPromise() {
        return _async_to_generator(function*() {
            if (this._closing) {
                // Prevent next() after close is called
                return null;
            }
            try {
                this._pendingNext = this._dbCursor.next();
                const result = yield this._pendingNext;
                this._pendingNext = null;
                return result;
            } catch (e) {
                console.error(e);
            } finally{
                this._pendingNext = null;
            }
        }).call(this);
    }
    // Returns a Promise for the next object from the cursor, skipping those whose
    // IDs we've already seen and replacing Mongo atoms with Meteor atoms.
    _nextObjectPromise() {
        return _async_to_generator(function*() {
            while(true){
                var doc = yield this._rawNextObjectPromise();
                if (!doc) return null;
                doc = replaceTypes(doc, replaceMongoAtomWithMeteor);
                if (!this._cursorDescription.options.tailable && '_id' in doc) {
                    // Did Mongo give us duplicate documents in the same cursor? If so,
                    // ignore this one. (Do this before the transform, since transform might
                    // return some unrelated value.) We don't do this for tailable cursors,
                    // because we want to maintain O(1) memory usage. And if there isn't _id
                    // for some reason (maybe it's the oplog), then we don't do this either.
                    // (Be careful to do this for falsey but existing _id, though.)
                    if (this._visitedIds.has(doc._id)) continue;
                    this._visitedIds.set(doc._id, true);
                }
                if (this._transform) doc = this._transform(doc);
                return doc;
            }
        }).call(this);
    }
    // Returns a promise which is resolved with the next object (like with
    // _nextObjectPromise) or rejected if the cursor doesn't return within
    // timeoutMS ms.
    _nextObjectPromiseWithTimeout(timeoutMS) {
        const nextObjectPromise = this._nextObjectPromise();
        if (!timeoutMS) {
            return nextObjectPromise;
        }
        const timeoutPromise = new Promise((resolve)=>{
            // On timeout, close the cursor.
            const timeoutId = setTimeout(()=>{
                resolve(this.close());
            }, timeoutMS);
            // If the `_nextObjectPromise` returned first, cancel the timeout.
            nextObjectPromise.finally(()=>{
                clearTimeout(timeoutId);
            });
        });
        return Promise.race([
            nextObjectPromise,
            timeoutPromise
        ]);
    }
    forEach(callback, thisArg) {
        return _async_to_generator(function*() {
            // Get back to the beginning.
            this._rewind();
            let idx = 0;
            while(true){
                const doc = yield this._nextObjectPromise();
                if (!doc) return;
                yield callback.call(thisArg, doc, idx++, this._selfForIteration);
            }
        }).call(this);
    }
    map(callback, thisArg) {
        return _async_to_generator(function*() {
            const results = [];
            yield this.forEach((doc, index)=>_async_to_generator(function*() {
                    results.push((yield callback.call(thisArg, doc, index, this._selfForIteration)));
                }).call(this));
            return results;
        }).call(this);
    }
    _rewind() {
        // known to be synchronous
        this._dbCursor.rewind();
        this._visitedIds = new LocalCollection._IdMap;
    }
    // Mostly usable for tailable cursors.
    close() {
        return _async_to_generator(function*() {
            this._closing = true;
            // If there's a pending next(), wait for it to finish or abort
            if (this._pendingNext) {
                try {
                    yield this._pendingNext;
                } catch (e) {
                // ignore
                }
            }
            this._dbCursor.close();
        }).call(this);
    }
    fetch() {
        return this.map((doc)=>doc);
    }
    /**
   * FIXME: (node:34680) [MONGODB DRIVER] Warning: cursor.count is deprecated and will be
   *  removed in the next major version, please use `collection.estimatedDocumentCount` or
   *  `collection.countDocuments` instead.
   */ count() {
        return this._dbCursor.count();
    }
    // This method is NOT wrapped in Cursor.
    getRawObjects(ordered) {
        return _async_to_generator(function*() {
            var self = this;
            if (ordered) {
                return self.fetch();
            } else {
                var results = new LocalCollection._IdMap;
                yield self.forEach(function(doc) {
                    results.set(doc._id, doc);
                });
                return results;
            }
        }).call(this);
    }
    constructor(dbCursor, cursorDescription, options){
        _define_property(this, "_closing", false);
        _define_property(this, "_pendingNext", null);
        this._dbCursor = dbCursor;
        this._cursorDescription = cursorDescription;
        this._selfForIteration = options.selfForIteration || this;
        if (options.useTransform && cursorDescription.options.transform) {
            this._transform = LocalCollection.wrapTransform(cursorDescription.options.transform);
        } else {
            this._transform = null;
        }
        this._visitedIds = new LocalCollection._IdMap;
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cursor.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor.ts                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({Cursor:()=>Cursor});let ASYNC_CURSOR_METHODS,getAsyncMethodName;module.link('meteor/minimongo/constants',{ASYNC_CURSOR_METHODS(v){ASYNC_CURSOR_METHODS=v},getAsyncMethodName(v){getAsyncMethodName=v}},0);let replaceMeteorAtomWithMongo,replaceTypes;module.link('./mongo_common',{replaceMeteorAtomWithMongo(v){replaceMeteorAtomWithMongo=v},replaceTypes(v){replaceTypes=v}},1);let LocalCollection;module.link('meteor/minimongo/local_collection',{default(v){LocalCollection=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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



/**
 * @class Cursor
 *
 * The main cursor object returned from find(), implementing the documented
 * Mongo.Collection cursor API.
 *
 * Wraps a CursorDescription and lazily creates an AsynchronousCursor
 * (only contacts MongoDB when methods like fetch or forEach are called).
 */ class Cursor {
    countAsync() {
        return _async_to_generator(function*() {
            const collection = this._mongo.rawCollection(this._cursorDescription.collectionName);
            return yield collection.countDocuments(replaceTypes(this._cursorDescription.selector, replaceMeteorAtomWithMongo), replaceTypes(this._cursorDescription.options, replaceMeteorAtomWithMongo));
        }).call(this);
    }
    count() {
        throw new Error("count() is not available on the server. Please use countAsync() instead.");
    }
    getTransform() {
        return this._cursorDescription.options.transform;
    }
    _publishCursor(sub) {
        const collection = this._cursorDescription.collectionName;
        return Mongo.Collection._publishCursor(this, sub, collection);
    }
    _getCollectionName() {
        return this._cursorDescription.collectionName;
    }
    observe(callbacks) {
        return LocalCollection._observeFromObserveChanges(this, callbacks);
    }
    observeAsync(callbacks) {
        return _async_to_generator(function*() {
            return new Promise((resolve)=>resolve(this.observe(callbacks)));
        }).call(this);
    }
    observeChanges(callbacks, options = {}) {
        const ordered = LocalCollection._observeChangesCallbacksAreOrdered(callbacks);
        return this._mongo._observeChanges(this._cursorDescription, ordered, callbacks, options.nonMutatingCallbacks);
    }
    observeChangesAsync(_0) {
        return _async_to_generator(function*(callbacks, options = {}) {
            return this.observeChanges(callbacks, options);
        }).apply(this, arguments);
    }
    constructor(mongo, cursorDescription){
        _define_property(this, "_mongo", void 0);
        _define_property(this, "_cursorDescription", void 0);
        _define_property(this, "_synchronousCursor", void 0);
        this._mongo = mongo;
        this._cursorDescription = cursorDescription;
        this._synchronousCursor = null;
    }
}
// Add cursor methods dynamically
[
    ...ASYNC_CURSOR_METHODS,
    Symbol.iterator,
    Symbol.asyncIterator
].forEach((methodName)=>{
    if (methodName === 'count') return;
    Cursor.prototype[methodName] = function(...args) {
        const cursor = setupAsynchronousCursor(this, methodName);
        return cursor[methodName](...args);
    };
    if (methodName === Symbol.iterator || methodName === Symbol.asyncIterator) return;
    const methodNameAsync = getAsyncMethodName(methodName);
    Cursor.prototype[methodNameAsync] = function(...args) {
        return this[methodName](...args);
    };
});
function setupAsynchronousCursor(cursor, method) {
    if (cursor._cursorDescription.options.tailable) {
        throw new Error(`Cannot call ${String(method)} on a tailable cursor`);
    }
    if (!cursor._synchronousCursor) {
        cursor._synchronousCursor = cursor._mongo._createAsynchronousCursor(cursor._cursorDescription, {
            selfForIteration: cursor,
            useTransform: true
        });
    }
    return cursor._synchronousCursor;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shared_change_stream.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/shared_change_stream.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({SharedChangeStream:()=>SharedChangeStream});let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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

/**
 * SharedChangeStream — one MongoDB change stream shared per collection.
 *
 * Every driver on a collection watches the whole collection with identical
 * options and filters per-document in its own matcher, so they can share one
 * server-side cursor. This opens a single collection.watch() and multicasts each
 * raw event in-process to every subscribed driver — like the oplog driver
 * sharing one tail via a crossbar.
 *
 * It owns the cursor lifecycle: an error/close restarts from the last resume
 * token (startAfter), replaying events missed while reconnecting. A restart
 * replaces only the cursor; drivers are untouched.
 */ class SharedChangeStream {
    get size() {
        return this._drivers.size;
    }
    // Subscribe a driver, opening the stream on the first one. Resolves once open
    // so the driver can read its snapshot knowing events are now queued for it.
    addDriver(driver) {
        return _async_to_generator(function*() {
            if (this._stopped) {
                throw new Error('SharedChangeStream used after stop');
            }
            this._drivers.add(driver);
            yield this._ensureOpen();
        }).call(this);
    }
    // Open if needed, coalescing concurrent callers onto one in-flight open.
    // _startPromise is set synchronously before any await, so no double open.
    _ensureOpen() {
        if (this._changeStream || this._stopped) {
            return Promise.resolve();
        }
        if (!this._startPromise) {
            this._startPromise = this._open().finally(()=>{
                this._startPromise = null;
            });
        }
        return this._startPromise;
    }
    // Unsubscribe a driver; tear down once the last one leaves.
    removeDriver(driver) {
        return _async_to_generator(function*() {
            this._drivers.delete(driver);
            if (this._drivers.size === 0) {
                yield this._stop();
            }
        }).call(this);
    }
    _open() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            const collection = this._mongoHandle.rawCollection(this._collectionName);
            // Pin the start time before opening: otherwise the stream begins whenever
            // mongo processes the $changeStream command, and writes landing in that gap
            // are dropped. Skipped on resume (the token already pins the start).
            let startAtOperationTime;
            if (!this._resumeToken) {
                try {
                    const pingRes = yield this._mongoHandle.db.command({
                        ping: 1
                    });
                    startAtOperationTime = pingRes === null || pingRes === void 0 ? void 0 : pingRes.operationTime;
                } catch (e) {
                // Best-effort; falls back to mongo's default of "now".
                }
            }
            if (this._stopped) return;
            // Empty pipeline so mongo delivers EVERY event: a server-side filter would
            // skip events, so _setLastProcessedOperationTime wouldn't advance for their
            // clusterTime while the fence still targets it — wedging _waitUntilCaughtUp.
            // Per-document filtering happens in each driver's matcher instead.
            const changeStreamOptions = {
                fullDocument: 'updateLookup',
                fullDocumentBeforeChange: 'whenAvailable'
            };
            if (this._resumeToken) {
                changeStreamOptions.startAfter = this._resumeToken;
            } else if (startAtOperationTime) {
                changeStreamOptions.startAtOperationTime = startAtOperationTime;
            }
            const changeStream = collection.watch([], changeStreamOptions);
            this._changeStream = changeStream;
            changeStream.on('change', Meteor.bindEnvironment((change)=>{
                this._onChange(change);
            }));
            changeStream.on('error', Meteor.bindEnvironment((error)=>{
                var _Meteor_settings_packages_mongo_changeStream_delay, _Meteor_settings_packages_mongo_changeStream, _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
                // Only the active stream restarts; ignore a superseded one.
                if (this._stopped || this._changeStream !== changeStream) return;
                console.error('ChangeStream error:', {
                    collectionName: this._collectionName,
                    driverCount: this._drivers.size,
                    resumeTokenPresent: !!this._resumeToken,
                    error
                });
                // A non-resumable error means the resume token is no longer in the oplog,
                // so watch() reopens but every getMore fails with the same error again —
                // an endless error→restart loop that re-sends the dead token. Drop the
                // token so the restart falls back to startAtOperationTime (now), and flag
                // the stream so the reopened cursor reconciles its drivers: events in the
                // lost window were never delivered.
                if (this._isNonResumableError(error)) {
                    this._resumeToken = null;
                    this._historyLost = true;
                }
                this._scheduleRestart((Meteor === null || Meteor === void 0 ? void 0 : (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream = _Meteor_settings_packages_mongo.changeStream) === null || _Meteor_settings_packages_mongo_changeStream === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream_delay = _Meteor_settings_packages_mongo_changeStream.delay) === null || _Meteor_settings_packages_mongo_changeStream_delay === void 0 ? void 0 : _Meteor_settings_packages_mongo_changeStream_delay.error) || 100);
            }));
            changeStream.on('close', Meteor.bindEnvironment(()=>{
                var _Meteor_settings_packages_mongo_changeStream_delay, _Meteor_settings_packages_mongo_changeStream, _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
                // _closeStream() replaces this._changeStream before closing, so a
                // deliberate close fails this check and won't loop into a restart.
                if (this._stopped || this._changeStream !== changeStream) return;
                console.error('ChangeStream closed unexpectedly, scheduling restart:', {
                    collectionName: this._collectionName,
                    driverCount: this._drivers.size,
                    resumeTokenPresent: !!this._resumeToken
                });
                this._scheduleRestart((Meteor === null || Meteor === void 0 ? void 0 : (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream = _Meteor_settings_packages_mongo.changeStream) === null || _Meteor_settings_packages_mongo_changeStream === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream_delay = _Meteor_settings_packages_mongo_changeStream.delay) === null || _Meteor_settings_packages_mongo_changeStream_delay === void 0 ? void 0 : _Meteor_settings_packages_mongo_changeStream_delay.close) || 100);
            }));
        }).call(this);
    }
    _onChange(change) {
        if (this._stopped) return;
        // Remember the resume token so a restart picks up here (see _open).
        if (change && change._id) {
            this._resumeToken = change._id;
        }
        // Multicast to every driver; each runs its own matcher/projection, advances
        // its lastProcessedOperationTime, and flushes pending writes.
        for (const driver of this._drivers){
            if (driver._stopped) continue;
            try {
                driver._onChange(change);
            } catch (error) {
                console.error('[ChangeStreams] Error dispatching change to driver:', {
                    driverId: driver._id,
                    collectionName: this._collectionName,
                    error
                });
            }
        }
    }
    // A change stream is non-resumable when the resume point has aged out of the
    // oplog (ChangeStreamHistoryLost, code 286) or the driver otherwise tags the
    // error NonResumableChangeStreamError. Resuming from the stored token can
    // never succeed again, so the caller must restart from a fresh start time.
    _isNonResumableError(error) {
        if (!error) return false;
        if (error.code === 286 || error.codeName === 'ChangeStreamHistoryLost') {
            return true;
        }
        const label = 'NonResumableChangeStreamError';
        if (typeof error.hasErrorLabel === 'function' && error.hasErrorLabel(label)) {
            return true;
        }
        if (error.errorLabelSet && typeof error.errorLabelSet.has === 'function') {
            return error.errorLabelSet.has(label);
        }
        if (Array.isArray(error.errorLabels)) {
            return error.errorLabels.includes(label);
        }
        return false;
    }
    _scheduleRestart(delayMs) {
        if (this._stopped || this._restartTimer) return;
        this._restartTimer = setTimeout(()=>{
            this._restartTimer = null;
            if (!this._stopped) {
                this._restart();
            }
        }, delayMs);
    }
    _restart() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            console.error('ChangeStream restart begin:', {
                collectionName: this._collectionName,
                driverCount: this._drivers.size,
                resumeTokenPresent: !!this._resumeToken
            });
            try {
                yield this._closeStream();
                if (this._stopped) return;
                // Reopen via the shared guard so a mid-restart subscriber awaits it too.
                yield this._ensureOpen();
                // The reopened cursor starts at "now", so bring each driver's result set
                // back in sync with the collection for the events it never received. Only
                // clear the flag once the reopen succeeds, so a failed reopen that
                // reschedules still reconciles on the retry.
                if (this._historyLost && !this._stopped) {
                    this._historyLost = false;
                    yield this._resyncDrivers();
                }
                console.error('ChangeStream restart done:', {
                    collectionName: this._collectionName,
                    driverCount: this._drivers.size
                });
            } catch (error) {
                var _Meteor_settings_packages_mongo_changeStream_delay, _Meteor_settings_packages_mongo_changeStream, _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
                console.error('Failed to restart ChangeStream:', {
                    collectionName: this._collectionName,
                    error
                });
                // Retry so one failed reopen doesn't wedge the stream for all drivers.
                this._scheduleRestart((Meteor === null || Meteor === void 0 ? void 0 : (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream = _Meteor_settings_packages_mongo.changeStream) === null || _Meteor_settings_packages_mongo_changeStream === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream_delay = _Meteor_settings_packages_mongo_changeStream.delay) === null || _Meteor_settings_packages_mongo_changeStream_delay === void 0 ? void 0 : _Meteor_settings_packages_mongo_changeStream_delay.error) || 100);
            }
        }).call(this);
    }
    // Reconcile every attached driver with the collection after a non-resumable
    // gap. Best-effort and isolated per driver: a failed reconcile is logged, not
    // rethrown, so it can never wedge or re-loop the stream that just recovered.
    _resyncDrivers() {
        return _async_to_generator(function*() {
            for (const driver of [
                ...this._drivers
            ]){
                if (this._stopped) return;
                if (driver._stopped) continue;
                try {
                    yield driver._resyncAfterHistoryLost();
                } catch (error) {
                    console.error('ChangeStream resync after history loss failed:', {
                        collectionName: this._collectionName,
                        driverId: driver._id,
                        error
                    });
                }
            }
        }).call(this);
    }
    _closeStream() {
        return _async_to_generator(function*() {
            const stream = this._changeStream;
            this._changeStream = null;
            if (stream) {
                try {
                    yield stream.close();
                } catch (error) {
                // Ignore errors when closing.
                }
            }
        }).call(this);
    }
    _stop() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            this._stopped = true;
            if (this._restartTimer) {
                clearTimeout(this._restartTimer);
                this._restartTimer = null;
            }
            // Deregister before awaiting close, else an observe arriving during the
            // await would acquire this stopped stream (addDriver throws) not a fresh one.
            if (typeof this._onEmpty === 'function') {
                try {
                    this._onEmpty();
                } catch (e) {
                // Ignore registry-cleanup errors.
                }
            }
            yield this._closeStream();
        }).call(this);
    }
    constructor(mongoHandle, collectionName, onEmpty){
        this._mongoHandle = mongoHandle;
        this._collectionName = collectionName;
        // Called when the last driver detaches so the owner can deregister us.
        this._onEmpty = onEmpty;
        this._drivers = new Set();
        this._changeStream = null;
        this._stopped = false;
        // Last seen resume token; a restart replays from here (startAfter).
        this._resumeToken = null;
        // In-flight open, so concurrent callers share one watch() instead of
        // racing a second cursor.
        this._startPromise = null;
        this._restartTimer = null;
        // Set when a restart is triggered by a non-resumable error so the reopened
        // stream reconciles its drivers with the collection (see _restart).
        this._historyLost = false;
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"changestream_observe_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/changestream_observe_driver.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({ChangeStreamObserveDriver:()=>ChangeStreamObserveDriver});let Meteor;module.link('meteor/meteor',{Meteor(v){Meteor=v}},0);let LocalCollection;module.link('meteor/minimongo',{LocalCollection(v){LocalCollection=v}},1);let Random;module.link('meteor/random',{Random(v){Random=v}},2);let MongoID;module.link('meteor/mongo-id',{MongoID(v){MongoID=v}},3);let DDPServer;module.link('meteor/ddp-server',{DDPServer(v){DDPServer=v}},4);let DiffSequence;module.link('meteor/diff-sequence',{DiffSequence(v){DiffSequence=v}},5);let listenAll;module.link('./mongo_driver',{listenAll(v){listenAll=v}},6);let replaceTypes,replaceMongoAtomWithMeteor,replaceMeteorAtomWithMongo;module.link('./mongo_common',{replaceTypes(v){replaceTypes=v},replaceMongoAtomWithMeteor(v){replaceMongoAtomWithMeteor=v},replaceMeteorAtomWithMongo(v){replaceMeteorAtomWithMongo=v}},7);let compareOperationTimes;module.link('./mongo_common',{compareOperationTimes(v){compareOperationTimes=v}},8);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _async_iterator(iterable) {
    var method, async, sync, retry = 2;
    for("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;){
        if (async && null != (method = iterable[async])) return method.call(iterable);
        if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
        async = "@@asyncIterator", sync = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(s) {
    function AsyncFromSyncIteratorContinuation(r) {
        if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
        var done = r.done;
        return Promise.resolve(r.value).then(function(value) {
            return {
                value: value,
                done: done
            };
        });
    }
    return AsyncFromSyncIterator = function(s) {
        this.s = s, this.n = s.next;
    }, AsyncFromSyncIterator.prototype = {
        s: null,
        n: null,
        next: function() {
            return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
        },
        return: function(value) {
            var ret = this.s.return;
            return void 0 === ret ? Promise.resolve({
                value: value,
                done: !0
            }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
        },
        throw: function(value) {
            var thr = this.s.return;
            return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
        }
    }, new AsyncFromSyncIterator(s);
}
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
function _object_without_properties(source, excluded) {
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









const SUPPORTED_OPERATIONS = [
    'insert',
    'update',
    'replace',
    'delete'
];
/**
 * ChangeStreamObserveDriver - MongoDB Change Streams based observe driver
 *
 * Uses MongoDB Change Streams to watch for real-time changes to a collection.
 * Implements a stop callback system similar to PollingObserveDriver for proper
 * resource cleanup when the driver is stopped.
 */ class ChangeStreamObserveDriver {
    _sendMultiplexerAdded(id, projectedDoc) {
        // projectedDoc is already Meteor-typed — its caller translated the source
        // document at the path boundary (see the _projectionFn comment above).
        try {
            this._multiplexer.added(id, projectedDoc);
        } catch (error) {
            console.error('[ChangeStreams] Error sending added document:', error);
        }
    }
    _startListening() {
        return _async_to_generator(function*() {
            // Register a listener to be notified when writes happen
            // This follows the same pattern as OplogObserveDriver
            const stopHandle = yield listenAll(this._cursorDescription, ()=>{
                // If we're not in a pre-fire write fence, we don't have to do anything.
                const fence = DDPServer._getCurrentFence();
                if (!fence || fence.fired) return;
                if (fence._changeStreamObserveDrivers) {
                    fence._changeStreamObserveDrivers[this._id] = this;
                    return;
                }
                fence._changeStreamObserveDrivers = {};
                fence._changeStreamObserveDrivers[this._id] = this;
                fence.onBeforeFire(()=>_async_to_generator(function*() {
                        const drivers = fence._changeStreamObserveDrivers;
                        delete fence._changeStreamObserveDrivers;
                        // Process each driver that needs to be synchronized with the fence
                        for (const driver of Object.values(drivers)){
                            if (driver._stopped) continue;
                            const write = yield fence.beginWrite();
                            // Wait for the change stream to catch up with any pending operations.
                            // Pass the fence explicitly: fence.fire() runs outside the
                            // AsyncLocalStorage context, so DDPServer._getCurrentFence() would
                            // return undefined here and miss the fence._csTargetTs annotation.
                            yield driver._waitUntilCaughtUp(fence);
                            // The driver may have been stopped while we were parked in
                            // _waitUntilCaughtUp (stop() drains the waiter so we don't hang —
                            // meteor/meteor#14452). Once stopped, neither branch below can be
                            // trusted to release this write: the multiplexer is being torn
                            // down, and a push to _writesToCommitWhenReady can race stop()'s
                            // own drain of that array and be lost. Commit directly so the
                            // fence still fires.
                            if (driver._stopped) {
                                yield write.committed();
                                continue;
                            }
                            // Process any pending writes immediately
                            driver._flushPendingWrites();
                            // If the driver is ready (initial adds complete), ensure all writes are committed
                            if (driver._isReady) {
                                yield driver._multiplexer.onFlush(()=>_async_to_generator(function*() {
                                        yield write.committed();
                                    })());
                            } else {
                                // If not ready yet, queue the write for later
                                driver._writesToCommitWhenReady.push(write);
                            }
                        }
                        // Release the per-collection write-timestamp map now that every
                        // driver on this fence has caught up. The fence object is about
                        // to be discarded, but clearing explicitly prevents any stray
                        // read of a now-stale target.
                        delete fence._csTargetTsByCollection;
                    })());
            });
            // Register the stop handle
            this._addStopCallback(()=>stopHandle.stop());
        }).call(this);
    }
    _addStopCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Stop callback must be a function');
        }
        this._stopCallbacks.push(callback);
    }
    _startWatching() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            try {
                const collection = this._mongoHandle.rawCollection(this._cursorDescription.collectionName);
                // Subscribe to the shared per-collection stream. addDriver() resolves once
                // it's open; from then events dispatch here via _onChange and queue in
                // _pendingWrites until ready, so writes during the snapshot below are
                // captured and replayed (_handleInsert dedupes overlaps with the snapshot).
                this._sharedStream = this._mongoHandle._acquireSharedChangeStream(this._cursorDescription.collectionName);
                yield this._sharedStream.addDriver(this);
                if (this._stopped) return;
                // Now read the snapshot. Events that arrived while we were getting
                // here are sitting in _pendingWrites and will be flushed below.
                yield this._sendInitialAdds(collection);
                // Mark ready so _flushPendingWrites lets the queued change events
                // through (it short-circuits when !_isReady to avoid calling
                // multiplexer.changed/removed before ready()).
                this._multiplexer.ready();
                this._isReady = true;
                // Replay change events that arrived during _sendInitialAdds BEFORE
                // committing fence writes. _handleInsert dedups against the multiplexer
                // cache so events that overlap with the snapshot don't double-emit.
                // Commit order matters: ObserveMultiplexer.onFlush below waits for the
                // queue to drain, so client `added`/`changed` reach handles before the
                // fence's `updated` message — without this, clients see `updated`
                // without the corresponding data and stub-reverts wipe the local view.
                this._flushPendingWrites();
                yield this._flushWritesToCommit();
            } catch (error) {
                console.error('Failed to start ChangeStream:', error);
                // Make sure the multiplexer is ready'd even on failure — without this
                // the publication's _readyPromise never resolves, the subscription
                // never sends `ready` to the client, and any test that polls
                // sub.ready() (e.g. `livedata - methods with nested stubs`) hangs
                // its setup block to the testAsyncMulti timeout.
                try {
                    if (!this._multiplexer._ready()) {
                        yield this._multiplexer.ready();
                    }
                } catch (_) {}
                // Drain any writes that were queued by onBeforeFire while
                // _startWatching was in flight. Without this, the fences holding those
                // writes never fire and any DDP method that triggered them hangs.
                this._isReady = true;
                try {
                    yield this._flushWritesToCommit();
                } catch (_) {}
                throw error;
            }
        }).call(this);
    }
    _sendInitialAdds(collection) {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            try {
                // Build the same selector and options that the cursor would use
                const selector = replaceTypes(this._cursorDescription.selector || {}, replaceMeteorAtomWithMongo);
                const options = _object_spread({}, this._cursorDescription.options);
                // Find all existing documents
                const cursor = collection.find(selector, options);
                // Follow oplog driver pattern: get current fence and store write for later commit
                const fence = DDPServer._getCurrentFence();
                if (fence) {
                    this._writesToCommitWhenReady.push(fence.beginWrite());
                }
                // Send 'added' for each existing document that matches our matcher
                let docCount = 0;
                {
                    var _iteratorAbruptCompletion = false, _didIteratorError = false, _iteratorError;
                    try {
                        for(var _iterator = _async_iterator(cursor), _step; _iteratorAbruptCompletion = !(_step = yield _iterator.next()).done; _iteratorAbruptCompletion = false){
                            let _value = _step.value;
                            const rawDoc = _value;
                            if (this._stopped) return;
                            // The native driver yields BSON-typed docs. Translate once here so the
                            // projection and the multiplexer only ever see Meteor types — the same
                            // boundary _handleChange establishes for live change events.
                            const doc = replaceTypes(rawDoc, replaceMongoAtomWithMeteor);
                            const id = typeof doc._id !== 'string' ? new MongoID.ObjectID(doc._id.toHexString()) : doc._id;
                            const projectedDoc = this._projectionFn ? this._projectionFn(doc) : doc;
                            this._sendMultiplexerAdded(id, projectedDoc);
                            docCount++;
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
            // DON'T call ready() or flush here - let _startWatching handle it
            } catch (error) {
                console.error('Error sending initial adds for ChangeStream:', error);
                // We may have already pushed a fence write above; commit it so the
                // fence isn't deadlocked. _startWatching's catch will run too, but
                // _flushWritesToCommit drains the array, so the second call is a no-op.
                // Multiplexer.ready() is handled in _startWatching's catch.
                this._isReady = true;
                try {
                    yield this._flushWritesToCommit();
                } catch (_) {}
                throw error;
            }
        }).call(this);
    }
    // Called by the shared stream for every raw change. The shared stream owns the
    // resume token, so this just advances our processed time, runs the matcher,
    // and flushes pending writes.
    _onChange(change) {
        if (this._stopped) return;
        // Update last processed op time early so fences can unblock promptly.
        if (change && change.clusterTime) {
            this._setLastProcessedOperationTime(change.clusterTime);
        }
        this._handleChange(change);
        const fence = DDPServer._getCurrentFence();
        if (fence && !fence.fired) {
            this._flushPendingWrites();
        } else {
            Meteor.defer(()=>{
                if (!this._stopped) {
                    this._flushPendingWrites();
                }
            });
        }
    }
    _handleChange(change) {
        return _async_to_generator(function*() {
            var _documentKey__id;
            if (this._stopped) return;
            const { operationType, documentKey, clusterTime } = change;
            if (!SUPPORTED_OPERATIONS.includes(operationType)) {
                return; // Ignore unsupported operations
            }
            const fullDocument = replaceTypes(change.fullDocument, replaceMongoAtomWithMeteor);
            const fullDocumentBeforeChange = replaceTypes(change.fullDocumentBeforeChange, replaceMongoAtomWithMeteor);
            let id = documentKey._id;
            if (typeof ((_documentKey__id = documentKey._id) === null || _documentKey__id === void 0 ? void 0 : _documentKey__id.toHexString) === 'function') {
                id = new MongoID.ObjectID(documentKey._id.toHexString());
            }
            // Update last processed operation time (redundant with early update, but safe)
            if (clusterTime) {
                this._setLastProcessedOperationTime(clusterTime);
            }
            // Store callback to be executed later when fence processes writes
            // Don't try to capture fence here - it will be handled in onBeforeFire
            const callbackData = {
                operationType,
                id,
                fullDocument,
                fullDocumentBeforeChange,
                change
            };
            this._pendingWrites.push(callbackData);
        }).call(this);
    }
    _setLastProcessedOperationTime(ts) {
        this._lastProcessedOperationTime = ts;
        // Resolve any waiters whose target is <= current processed time
        while(this._catchingUpResolvers.length > 0){
            const first = this._catchingUpResolvers[0];
            if (compareOperationTimes(ts, first.ts) >= 0) {
                this._catchingUpResolvers.shift();
                try {
                    first.resolver();
                } catch (e) {}
            } else {
                break;
            }
        }
    }
    _flushPendingWrites() {
        return _async_to_generator(function*() {
            // Hold off processing until the multiplexer has had its `ready()` call.
            // We open the change stream before _sendInitialAdds so events emitted
            // during the snapshot are not lost — those events sit here until the
            // driver is ready, and _startWatching's tail flush replays them.
            // ObserveMultiplexer.changed / removed throw if called before ready.
            if (!this._isReady) return;
            const callbacksToFlush = this._pendingWrites;
            this._pendingWrites = [];
            if (callbacksToFlush.length > 0) {
                for (const callbackData of callbacksToFlush){
                    try {
                        const { operationType, id, fullDocument, fullDocumentBeforeChange, change } = callbackData;
                        switch(operationType){
                            case 'insert':
                                this._handleInsert(id, fullDocument);
                                break;
                            case 'update':
                            case 'replace':
                                this._handleUpdate(id, fullDocument, fullDocumentBeforeChange);
                                break;
                            case 'delete':
                                this._handleDelete(id, change);
                                break;
                        }
                    } catch (error) {
                        console.error(`[ChangeStream ${this._id}] Error processing callback:`, error);
                    }
                }
            }
        }).call(this);
    }
    _flushWritesToCommit() {
        return _async_to_generator(function*() {
            // Similar to oplog driver's _beSteady method
            const writes = this._writesToCommitWhenReady;
            this._writesToCommitWhenReady = [];
            if (writes.length > 0) {
                yield this._multiplexer.onFlush(()=>_async_to_generator(function*() {
                        for (const write of writes){
                            yield write.committed();
                        }
                    })());
            }
        }).call(this);
    }
    _handleInsert(id, doc) {
        var _this__multiplexer__cache_docs_has, _this__multiplexer__cache_docs, _this__multiplexer__cache, _this__multiplexer;
        const matches = this._matcher.documentMatches(doc).result;
        if (!matches) return;
        // Dedup against the cache: opening the change stream before
        // _sendInitialAdds means a doc inserted between watch() and the snapshot
        // read is reported by both. Without this guard we would emit `added`
        // twice for the same id, and ObserveMultiplexer / publication views
        // assume each id is added exactly once.
        if ((_this__multiplexer = this._multiplexer) === null || _this__multiplexer === void 0 ? void 0 : (_this__multiplexer__cache = _this__multiplexer._cache) === null || _this__multiplexer__cache === void 0 ? void 0 : (_this__multiplexer__cache_docs = _this__multiplexer__cache.docs) === null || _this__multiplexer__cache_docs === void 0 ? void 0 : (_this__multiplexer__cache_docs_has = _this__multiplexer__cache_docs.has) === null || _this__multiplexer__cache_docs_has === void 0 ? void 0 : _this__multiplexer__cache_docs_has.call(_this__multiplexer__cache_docs, id)) {
            this._handleUpdate(id, doc, null);
            return;
        }
        const projectedDoc = this._projectionFn ? this._projectionFn(doc) : doc;
        this._sendMultiplexerAdded(id, projectedDoc);
    }
    _handleUpdate(id, newDoc, oldDoc) {
        var _this__multiplexer__cache, _this__multiplexer;
        // Determine which state (before/after) matches the cursor selector
        const matchesAfter = this._matcher.documentMatches(newDoc || {}).result;
        // Use the multiplexer cache (now updated synchronously) to check if we've seen this doc
        const cachedDoc = (_this__multiplexer = this._multiplexer) === null || _this__multiplexer === void 0 ? void 0 : (_this__multiplexer__cache = _this__multiplexer._cache) === null || _this__multiplexer__cache === void 0 ? void 0 : _this__multiplexer__cache.docs.get(id);
        const matchesBefore = oldDoc ? this._matcher.documentMatches(oldDoc).result : !!cachedDoc;
        if (matchesAfter) {
            if (!matchesBefore) {
                // Document wasn't previously in the result set and now matches – emit added
                const projectedDoc = this._projectionFn ? this._projectionFn(newDoc) : newDoc;
                this._sendMultiplexerAdded(id, projectedDoc);
                return;
            }
            if (newDoc) {
                // Compute the changed fields using the available pre-image or the cached doc
                const oldDocForDiff = oldDoc || (cachedDoc ? _object_spread({}, cachedDoc) : null);
                if (oldDocForDiff) {
                    const projectedNew = this._projectionFn ? this._projectionFn(newDoc) : newDoc;
                    const projectedOld = this._projectionFn ? this._projectionFn(oldDocForDiff) : oldDocForDiff;
                    const changedFields = DiffSequence.makeChangedFields(projectedNew, projectedOld);
                    if (Object.keys(changedFields).length > 0) {
                        // changedFields is derived from already-translated docs via the
                        // projection, so it is already Meteor-typed.
                        this._multiplexer.changed(id, changedFields);
                    }
                    return;
                }
                // Without a pre-image we can't diff reliably; fall back to sending full doc
                const projectedDoc = this._projectionFn ? this._projectionFn(newDoc) : newDoc;
                this._multiplexer.changed(id, projectedDoc);
            }
            return;
        }
        if (matchesBefore) {
            // Document left the result set
            this._multiplexer.removed(id);
        }
    // Otherwise the document didn't match before or after, so no-op
    }
    _handleDelete(id) {
        var _this__multiplexer__cache;
        if ((_this__multiplexer__cache = this._multiplexer._cache) === null || _this__multiplexer__cache === void 0 ? void 0 : _this__multiplexer__cache.docs.has(id)) {
            this._multiplexer.removed(id);
        }
    }
    // Reconcile our result set with the current collection contents after the
    // shared change stream lost its resume history: events during the lost window
    // were never delivered, so the multiplexer cache may hold stale documents.
    // The live-event handlers are all cache-guarded, so reusing them here means a
    // document concurrently redelivered by the reopened cursor is reconciled once
    // rather than double-emitted.
    _resyncAfterHistoryLost() {
        return _async_to_generator(function*() {
            var _this__multiplexer__cache;
            if (this._stopped || !this._isReady) return;
            const collection = this._mongoHandle.rawCollection(this._cursorDescription.collectionName);
            const selector = replaceTypes(this._cursorDescription.selector || {}, replaceMeteorAtomWithMongo);
            const options = _object_spread({}, this._cursorDescription.options);
            // Re-add or update every currently-matching document, tracking which ids
            // are still present so the rest can be removed below.
            const present = new Set();
            const cursor = collection.find(selector, options);
            {
                var _iteratorAbruptCompletion = false, _didIteratorError = false, _iteratorError;
                try {
                    for(var _iterator = _async_iterator(cursor), _step; _iteratorAbruptCompletion = !(_step = yield _iterator.next()).done; _iteratorAbruptCompletion = false){
                        let _value = _step.value;
                        const rawDoc = _value;
                        if (this._stopped) return;
                        const doc = replaceTypes(rawDoc, replaceMongoAtomWithMeteor);
                        const id = typeof doc._id !== 'string' ? new MongoID.ObjectID(doc._id.toHexString()) : doc._id;
                        present.add(MongoID.idStringify(id));
                        this._handleInsert(id, doc);
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
            if (this._stopped) return;
            // Anything still cached but no longer returned by the query left the result
            // set while the stream was disconnected — emit the removals.
            const removedIds = [];
            (_this__multiplexer__cache = this._multiplexer._cache) === null || _this__multiplexer__cache === void 0 ? void 0 : _this__multiplexer__cache.docs.forEach((cachedDoc, cachedId)=>{
                if (!present.has(MongoID.idStringify(cachedId))) {
                    removedIds.push(cachedId);
                }
            });
            for (const id of removedIds){
                if (this._stopped) return;
                this._handleDelete(id);
            }
        }).call(this);
    }
    _waitUntilCaughtUp(fenceOverride) {
        return _async_to_generator(function*() {
            var _this__catchingUpResolvers_, _Meteor_settings_packages_mongo_changeStream, _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
            // Wait until our change stream has processed events up to the
            // server's current operation time. Mirrors oplog's wait logic.
            if (this._stopped) return;
            // The fence's write path stamps the exact clusterTime of each write on
            // fence._csTargetTsByCollection[collectionName] (see
            // mongo_connection._annotateFenceWithWriteTs). Wait specifically for
            // that ts. The fence must be passed explicitly because fence.fire()
            // runs outside the AsyncLocalStorage context where _getCurrentFence()
            // would find it.
            //
            // If there is no annotation for our collection, there is no specific
            // write to wait for and we return immediately. Asking the server for
            // its current operationTime here would chase a moving target — the
            // server's clock advances with replication heartbeats, but our stream
            // only sees events emitted on this collection, so the wait would never
            // resolve under the previous (no-timeout) regime.
            const fence = fenceOverride || DDPServer._getCurrentFence();
            const { collectionName } = this._cursorDescription;
            const { _csTargetTsByCollection } = fence || {};
            const targetTs = _csTargetTsByCollection && collectionName ? _csTargetTsByCollection[collectionName] : undefined;
            if (!targetTs) {
                return;
            }
            if (this._lastProcessedOperationTime && compareOperationTimes(this._lastProcessedOperationTime, targetTs) >= 0) {
                return;
            }
            // Insert in order so we can resolve from the front efficiently
            let insertIdx = this._catchingUpResolvers.length;
            while(insertIdx - 1 >= 0 && compareOperationTimes((_this__catchingUpResolvers_ = this._catchingUpResolvers[insertIdx - 1]) === null || _this__catchingUpResolvers_ === void 0 ? void 0 : _this__catchingUpResolvers_.ts, targetTs) > 0){
                insertIdx--;
            }
            const entry = {
                ts: targetTs,
                resolver: null
            };
            var _Meteor_settings_packages_mongo_changeStream_waitUntilCaughtUpWarnMs;
            // Wait until our change stream has actually delivered an event with
            // clusterTime >= targetTs. Mirrors OplogHandle._waitUntilCaughtUp: the
            // wait has no upper bound — releasing early causes the fence to fire
            // before the change has been applied to the multiplexer, which surfaces
            // as the client receiving `updated` without the corresponding
            // `added`/`changed`/`removed` (e.g. `livedata - method updated message
            // with subscriptions` failing with "Should receive CHANGED message").
            //
            // Liveness is guaranteed by:
            //   1. The shared change stream resuming from its resume token on
            //      error/close, so events missed while reconnecting are replayed and
            //      our lastProcessedOperationTime still advances to target.
            //   2. The watchdog below logging if the wait stalls past warnMs, which
            //      makes a genuinely-broken stream visible without masking it.
            const warnMs = (_Meteor_settings_packages_mongo_changeStream_waitUntilCaughtUpWarnMs = Meteor === null || Meteor === void 0 ? void 0 : (_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : (_Meteor_settings_packages_mongo_changeStream = _Meteor_settings_packages_mongo.changeStream) === null || _Meteor_settings_packages_mongo_changeStream === void 0 ? void 0 : _Meteor_settings_packages_mongo_changeStream.waitUntilCaughtUpWarnMs) !== null && _Meteor_settings_packages_mongo_changeStream_waitUntilCaughtUpWarnMs !== void 0 ? _Meteor_settings_packages_mongo_changeStream_waitUntilCaughtUpWarnMs : 10000;
            const waitStartedAt = Date.now();
            let warnCount = 0;
            // Periodic watchdog: re-fires every warnMs so we can see whether a wait
            // is making progress (lastProcessedOperationTime advancing) or genuinely
            // stuck.
            const dumpDiagnostics = ()=>{
                warnCount += 1;
                console.error(`Meteor: change stream catching up took too long`, {
                    driverId: this._id,
                    collectionName,
                    targetTs,
                    lastProcessedOperationTime: this._lastProcessedOperationTime,
                    stopped: this._stopped,
                    isReady: this._isReady,
                    changeStreamOpen: !!(this._sharedStream && this._sharedStream._changeStream),
                    resumeTokenPresent: !!(this._sharedStream && this._sharedStream._resumeToken),
                    pendingWritesCount: this._pendingWrites.length,
                    writesToCommitWhenReadyCount: this._writesToCommitWhenReady.length,
                    catchingUpResolversCount: this._catchingUpResolvers.length,
                    waitedMs: Date.now() - waitStartedAt,
                    warnCount
                });
            };
            let warnTimeoutId = setTimeout(function tick() {
                dumpDiagnostics();
                // Re-arm so we keep dumping state every warnMs while the wait is stuck.
                // Without this we only ever see the first snapshot and can't tell whether
                // the stream made any progress before the test gave up.
                warnTimeoutId = setTimeout(tick, warnMs);
            }, warnMs);
            yield new Promise((resolve)=>{
                entry.resolver = ()=>{
                    clearTimeout(warnTimeoutId);
                    if (warnCount > 0) {
                        console.error(// When stop() drains this resolver the stream never reached
                        // targetTs — say so rather than claiming we caught up, so the logs
                        // reflect that the wait was released by teardown (#14452).
                        this._stopped ? `Meteor: change stream wait released because observer stopped` : `Meteor: change stream caught up after warn`, {
                            driverId: this._id,
                            collectionName,
                            targetTs,
                            waitedMs: Date.now() - waitStartedAt,
                            warnCount
                        });
                    }
                    resolve();
                };
                this._catchingUpResolvers.splice(insertIdx, 0, entry);
            });
        }).call(this);
    }
    stop() {
        return _async_to_generator(function*() {
            if (this._stopped) return;
            this._stopped = true;
            // Release any fence waiters still parked in _waitUntilCaughtUp before we
            // close the change stream below. Those resolvers are waiting for an event
            // with clusterTime >= targetTs, but once the stream is closed that event
            // will never arrive, so leaving them parked hangs the fence's
            // onBeforeFire (which awaits _waitUntilCaughtUp) forever — the DDP method
            // that issued the write never gets its `updated` message and the client
            // call hangs until timeout (meteor/meteor#14452). Resolve (don't reject):
            // the fence may carry writes from other, still-healthy drivers, and the
            // continuation just commits this driver's already-begun write so the fence
            // can fire. The driver is being torn down, so not reaching targetTs on it
            // is harmless — its handles are gone.
            const pendingCatchUp = this._catchingUpResolvers;
            this._catchingUpResolvers = [];
            for (const entry of pendingCatchUp){
                try {
                    entry.resolver();
                } catch (e) {
                // ignore resolver errors
                }
            }
            // Execute all stop callbacks
            for (const callback of this._stopCallbacks){
                try {
                    yield callback();
                } catch (error) {
                    console.error('Error in stop callback:', error);
                }
            }
            // Detach from the shared stream. It closes the underlying cursor (and drops
            // itself from the connection registry) once its last driver leaves.
            if (this._sharedStream) {
                try {
                    yield this._sharedStream.removeDriver(this);
                } catch (error) {
                    console.error('Error detaching from shared change stream:', error);
                }
                this._sharedStream = null;
            }
            // Handle any remaining pending writes (following oplog driver pattern)
            for (const write of this._pendingWrites){
                if (!write || typeof write.committed !== 'function') continue;
                yield write.committed();
            }
            this._pendingWrites = [];
            // Handle any remaining writes to commit
            for (const write of this._writesToCommitWhenReady){
                yield write.committed();
            }
            this._writesToCommitWhenReady = [];
            // Clear callbacks array
            this._stopCallbacks = [];
        }).call(this);
    }
    constructor(options){
        this._usesChangeStreams = true;
        this._cursorDescription = options.cursorDescription;
        this._mongoHandle = options.mongoHandle;
        this._multiplexer = options.multiplexer;
        this._sharedStream = null;
        this._stopped = false;
        this._stopCallbacks = [];
        this._pendingWrites = [];
        this._writesToCommitWhenReady = [];
        this._isReady = false;
        this._lastProcessedOperationTime = null;
        this._catchingUpResolvers = [];
        this._resolveTimeout = null;
        this._matcher = options.matcher;
        this._id = options.id || Random.id();
        // Projection function similar to oplog driver.
        //
        // `doc` is expected to already be Meteor-typed: native BSON is translated
        // to Meteor types once at each path boundary (_sendInitialAdds for the
        // snapshot, _handleChange for live change events) before any doc reaches
        // the projection, the matcher or the multiplexer. Translating here as well
        // would just re-walk an already-converted document.
        const projection = this._cursorDescription.options.projection || this._cursorDescription.options.fields;
        if (projection) {
            const baseProjectionFn = LocalCollection._compileProjection(projection);
            this._projectionFn = (doc)=>{
                const projected = baseProjectionFn(doc);
                if (projected && typeof projected === 'object') {
                    const { _id } = projected, fields = _object_without_properties(projected, [
                        "_id"
                    ]);
                    return fields;
                }
                return projected;
            };
        } else {
            this._projectionFn = (doc)=>{
                const { _id } = doc, fields = _object_without_properties(doc, [
                    "_id"
                ]);
                return fields;
            };
        }
        this._startListening();
        this._startWatching();
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"local_collection_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/local_collection_driver.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({LocalCollectionDriver:()=>LocalCollectionDriver},true);// singleton
const LocalCollectionDriver = new class LocalCollectionDriver {
    open(name, conn) {
        if (!name) {
            return new LocalCollection;
        }
        if (!conn) {
            return ensureCollection(name, this.noConnCollections);
        }
        if (!conn._mongo_livedata_collections) {
            conn._mongo_livedata_collections = Object.create(null);
        }
        // XXX is there a way to keep track of a connection's collections without
        // dangling it off the connection object?
        return ensureCollection(name, conn._mongo_livedata_collections);
    }
    constructor(){
        this.noConnCollections = Object.create(null);
    }
};
function ensureCollection(name, collections) {
    return name in collections ? collections[name] : collections[name] = new LocalCollection(name);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remote_collection_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/remote_collection_driver.ts                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({RemoteCollectionDriver:()=>RemoteCollectionDriver});let once;module.link('lodash.once',{default(v){once=v}},0);let ASYNC_COLLECTION_METHODS,getAsyncMethodName,CLIENT_ONLY_METHODS;module.link("meteor/minimongo/constants",{ASYNC_COLLECTION_METHODS(v){ASYNC_COLLECTION_METHODS=v},getAsyncMethodName(v){getAsyncMethodName=v},CLIENT_ONLY_METHODS(v){CLIENT_ONLY_METHODS=v}},1);let MongoConnection;module.link('./mongo_connection',{MongoConnection(v){MongoConnection=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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



class RemoteCollectionDriver {
    open(name) {
        const ret = {};
        // Handle remote collection methods
        RemoteCollectionDriver.REMOTE_COLLECTION_METHODS.forEach((method)=>{
            // Type assertion needed because we know these methods exist on MongoConnection
            const mongoMethod = this.mongo[method];
            ret[method] = mongoMethod.bind(this.mongo, name);
            if (!ASYNC_COLLECTION_METHODS.includes(method)) return;
            const asyncMethodName = getAsyncMethodName(method);
            ret[asyncMethodName] = (...args)=>ret[method](...args);
        });
        // Handle client-only methods
        CLIENT_ONLY_METHODS.forEach((method)=>{
            ret[method] = (...args)=>{
                throw new Error(`${method} is not available on the server. Please use ${getAsyncMethodName(method)}() instead.`);
            };
        });
        return ret;
    }
    constructor(mongoUrl, options){
        _define_property(this, "mongo", void 0);
        this.mongo = new MongoConnection(mongoUrl, options);
    }
}
_define_property(RemoteCollectionDriver, "REMOTE_COLLECTION_METHODS", [
    'createCappedCollectionAsync',
    'dropIndexAsync',
    'ensureIndexAsync',
    'createIndexAsync',
    'countDocuments',
    'dropCollectionAsync',
    'estimatedDocumentCount',
    'find',
    'findOneAsync',
    'insertAsync',
    'rawCollection',
    'removeAsync',
    'updateAsync',
    'upsertAsync'
]);
// Assign the class to MongoInternals
MongoInternals.RemoteCollectionDriver = RemoteCollectionDriver;
// Create the singleton RemoteCollectionDriver only on demand
MongoInternals.defaultRemoteCollectionDriver = once(()=>{
    const connectionOptions = {};
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL must be set in environment");
    }
    if (process.env.MONGO_OPLOG_URL) {
        connectionOptions.oplogUrl = process.env.MONGO_OPLOG_URL;
    }
    const driver = new RemoteCollectionDriver(mongoUrl, connectionOptions);
    // Initialize database connection on startup
    Meteor.startup(()=>_async_to_generator(function*() {
            yield driver.mongo.client.connect();
        })());
    return driver;
});

//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection":{"collection_extensions.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection_extensions.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * Collection Extensions System
 * 
 * Provides a clean way to extend Mongo.Collection functionality
 * without monkey patching. Supports constructor extensions,
 * prototype methods, and static methods.
 */ if (Package['lai:collection-extensions']) {
    console.warn('lai:collection-extensions is not deprecated. Use Mongo.Collection.addExtension instead.');
}
CollectionExtensions = {
    _extensions: [],
    _prototypeMethods: new Map(),
    _staticMethods: new Map(),
    /**
   * Add a constructor extension function
   * Extension function is called with (name, options) and 'this' bound to collection instance
   */ addExtension (extension) {
        if (typeof extension !== 'function') {
            throw new Error('Extension must be a function');
        }
        this._extensions.push(extension);
    },
    /**
   * Add a prototype method to all collection instances
   * Method is bound to the collection instance
   */ addPrototypeMethod (name, method) {
        if (typeof name !== 'string' || !name) {
            throw new Error('Prototype method name must be a non-empty string');
        }
        if (typeof method !== 'function') {
            throw new Error('Prototype method must be a function');
        }
        this._prototypeMethods.set(name, method);
    },
    /**
   * Add a static method to the Mongo.Collection constructor
   */ addStaticMethod (name, method) {
        if (typeof name !== 'string' || !name) {
            throw new Error('Static method name must be a non-empty string');
        }
        if (typeof method !== 'function') {
            throw new Error('Static method must be a function');
        }
        this._staticMethods.set(name, method);
    },
    /**
   * Remove an extension (useful for testing)
   */ removeExtension (extension) {
        const index = this._extensions.indexOf(extension);
        if (index > -1) {
            this._extensions.splice(index, 1);
        }
    },
    /**
   * Remove a prototype method
   */ removePrototypeMethod (name) {
        this._prototypeMethods.delete(name);
    },
    /**
   * Remove a static method
   */ removeStaticMethod (name) {
        this._staticMethods.delete(name);
    },
    /**
   * Clear all extensions (useful for testing)
   */ clearExtensions () {
        this._extensions.length = 0;
        this._prototypeMethods.clear();
        this._staticMethods.clear();
    },
    /**
   * Get all registered extensions (useful for debugging)
   */ getExtensions () {
        return [
            ...this._extensions
        ];
    },
    /**
   * Get all registered prototype methods (useful for debugging)
   */ getPrototypeMethods () {
        return new Map(this._prototypeMethods);
    },
    /**
   * Get all registered static methods (useful for debugging)
   */ getStaticMethods () {
        return new Map(this._staticMethods);
    },
    /**
   * Apply all extensions to a collection instance
   * Called during collection construction
   */ _applyExtensions (instance, name, options) {
        // Apply constructor extensions
        for (const extension of this._extensions){
            try {
                extension.call(instance, name, options);
            } catch (error) {
                // Provide helpful error context
                throw new Error(`Extension failed for collection '${name}': ${error.message}`);
            }
        }
        // Apply prototype methods
        for (const [methodName, method] of this._prototypeMethods){
            instance[methodName] = method.bind(instance);
        }
    },
    /**
   * Apply static methods to the Mongo.Collection constructor
   * Called during package initialization
   */ _applyStaticMethods (CollectionConstructor) {
        for (const [methodName, method] of this._staticMethods){
            CollectionConstructor[methodName] = method;
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},1);let normalizeProjection;module.link("../mongo_utils",{normalizeProjection(v){normalizeProjection=v}},2);let AsyncMethods;module.link('./methods_async',{AsyncMethods(v){AsyncMethods=v}},3);let SyncMethods;module.link('./methods_sync',{SyncMethods(v){SyncMethods=v}},4);let IndexMethods;module.link('./methods_index',{IndexMethods(v){IndexMethods=v}},5);let ID_GENERATORS,normalizeOptions,setupAutopublish,setupConnection,setupDriver,setupMutationMethods,validateCollectionName;module.link('./collection_utils',{ID_GENERATORS(v){ID_GENERATORS=v},normalizeOptions(v){normalizeOptions=v},setupAutopublish(v){setupAutopublish=v},setupConnection(v){setupConnection=v},setupDriver(v){setupDriver=v},setupMutationMethods(v){setupMutationMethods=v},validateCollectionName(v){validateCollectionName=v}},6);let ReplicationMethods;module.link('./methods_replication',{ReplicationMethods(v){ReplicationMethods=v}},7);







/**
 * @summary Namespace for MongoDB-related items
 * @namespace
 */ Mongo = {};
/**
 * @summary Constructor for a Collection
 * @locus Anywhere
 * @instancename collection
 * @class
 * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
 * @param {Object} [options]
 * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#DDP-connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
 * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:

 - **`'STRING'`**: random strings
 - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values

The default id generation technique is `'STRING'`.
 * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOneAsync`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
 * @param {Boolean} options.defineMutationMethods Set to `false` to skip setting up the mutation methods that enable insert/update/remove from client code. Default `true`.
 */ // Main Collection constructor
Mongo.Collection = function Collection(name, options) {
    var _ID_GENERATORS_options_idGeneration;
    name = validateCollectionName(name);
    options = normalizeOptions(options);
    this._makeNewID = (_ID_GENERATORS_options_idGeneration = ID_GENERATORS[options.idGeneration]) === null || _ID_GENERATORS_options_idGeneration === void 0 ? void 0 : _ID_GENERATORS_options_idGeneration.call(ID_GENERATORS, name);
    this._transform = LocalCollection.wrapTransform(options.transform);
    this.resolverType = options.resolverType;
    this._connection = setupConnection(name, options);
    const driver = setupDriver(name, this._connection, options);
    this._driver = driver;
    this._collection = driver.open(name, this._connection);
    this._name = name;
    this._settingUpReplicationPromise = this._maybeSetUpReplication(name, options);
    setupMutationMethods(this, name, options);
    setupAutopublish(this, name, options);
    Mongo._collections.set(name, this);
    // Apply collection extensions
    CollectionExtensions._applyExtensions(this, name, options);
};
// Apply static methods to the Collection constructor
CollectionExtensions._applyStaticMethods(Mongo.Collection);
Object.assign(Mongo.Collection.prototype, {
    _getFindSelector (args) {
        if (args.length == 0) return {};
        else return args[0];
    },
    _getFindOptions (args) {
        const [, options] = args || [];
        const newOptions = normalizeProjection(options);
        var self = this;
        if (args.length < 2) {
            return {
                transform: self._transform
            };
        } else {
            check(newOptions, Match.Optional(Match.ObjectIncluding({
                projection: Match.Optional(Match.OneOf(Object, undefined)),
                sort: Match.Optional(Match.OneOf(Object, Array, Function, undefined)),
                limit: Match.Optional(Match.OneOf(Number, undefined)),
                skip: Match.Optional(Match.OneOf(Number, undefined))
            })));
            return _object_spread({
                transform: self._transform
            }, newOptions);
        }
    }
});
Object.assign(Mongo.Collection, {
    _publishCursor (cursor, sub, collection) {
        return _async_to_generator(function*() {
            var observeHandle = yield cursor.observeChanges({
                added: function(id, fields) {
                    sub.added(collection, id, fields);
                },
                changed: function(id, fields) {
                    sub.changed(collection, id, fields);
                },
                removed: function(id) {
                    sub.removed(collection, id);
                }
            }, // Publications don't mutate the documents
            // This is tested by the `livedata - publish callbacks clone` test
            {
                nonMutatingCallbacks: true
            });
            // We don't call sub.ready() here: it gets called in livedata_server, after
            // possibly calling _publishCursor on multiple returned cursors.
            // register stop callback (expects lambda w/ no args).
            sub.onStop(function() {
                return _async_to_generator(function*() {
                    return yield observeHandle.stop();
                })();
            });
            // return the observeHandle in case it needs to be stopped early
            return observeHandle;
        })();
    },
    // protect against dangerous selectors.  falsey and {_id: falsey} are both
    // likely programmer error, and not what you want, particularly for destructive
    // operations. If a falsey _id is sent in, a new string _id will be
    // generated and returned; if a fallbackId is provided, it will be returned
    // instead.
    _rewriteSelector (selector, { fallbackId } = {}) {
        // shorthand -- scalars match _id
        if (LocalCollection._selectorIsId(selector)) selector = {
            _id: selector
        };
        if (Array.isArray(selector)) {
            // This is consistent with the Mongo console itself; if we don't do this
            // check passing an empty array ends up selecting all items
            throw new Error("Mongo selector can't be an array.");
        }
        if (!selector || '_id' in selector && !selector._id) {
            // can't match anything
            return {
                _id: fallbackId || Random.id()
            };
        }
        return selector;
    },
    // Collection Extensions API - delegate to CollectionExtensions
    /**
   * @summary Add a constructor extension function that runs when collections are created.
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {Function} extension Extension function called with (name, options) and 'this' bound to collection instance
   */ addExtension (extension) {
        return CollectionExtensions.addExtension(extension);
    },
    /**
   * @summary Add a prototype method to all collection instances.
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {String} name The name of the method to add
   * @param {Function} method The method function, bound to the collection instance
   */ addPrototypeMethod (name, method) {
        return CollectionExtensions.addPrototypeMethod(name, method);
    },
    /**
   * @summary Add a static method to the Mongo.Collection constructor.
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {String} name The name of the static method to add
   * @param {Function} method The static method function
   */ addStaticMethod (name, method) {
        return CollectionExtensions.addStaticMethod(name, method);
    },
    /**
   * @summary Remove a constructor extension (useful for testing).
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {Function} extension The extension function to remove
   */ removeExtension (extension) {
        return CollectionExtensions.removeExtension(extension);
    },
    /**
   * @summary Remove a prototype method from all collection instances.
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {String} name The name of the method to remove
   */ removePrototypeMethod (name) {
        return CollectionExtensions.removePrototypeMethod(name);
    },
    /**
   * @summary Remove a static method from the Mongo.Collection constructor.
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @param {String} name The name of the static method to remove
   */ removeStaticMethod (name) {
        return CollectionExtensions.removeStaticMethod(name);
    },
    /**
   * @summary Clear all extensions, prototype methods, and static methods (useful for testing).
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   */ clearExtensions () {
        return CollectionExtensions.clearExtensions();
    },
    /**
   * @summary Get all registered constructor extensions (useful for debugging).
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @returns {Array<Function>} Array of registered extension functions
   */ getExtensions () {
        return CollectionExtensions.getExtensions();
    },
    /**
   * @summary Get all registered prototype methods (useful for debugging).
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @returns {Map<String, Function>} Map of method names to functions
   */ getPrototypeMethods () {
        return CollectionExtensions.getPrototypeMethods();
    },
    /**
   * @summary Get all registered static methods (useful for debugging).
   * @locus Anywhere
   * @memberof Mongo.Collection
   * @static
   * @returns {Map<String, Function>} Map of method names to functions
   */ getStaticMethods () {
        return CollectionExtensions.getStaticMethods();
    }
});
Object.assign(Mongo.Collection.prototype, ReplicationMethods, SyncMethods, AsyncMethods, IndexMethods);
Object.assign(Mongo.Collection.prototype, {
    // Determine if this collection is simply a minimongo representation of a real
    // database on another server
    _isRemoteCollection () {
        // XXX see #MeteorServerNull
        return this._connection && this._connection !== Meteor.server;
    },
    dropCollectionAsync () {
        return _async_to_generator(function*() {
            var self = this;
            if (!self._collection.dropCollectionAsync) throw new Error('Can only call dropCollectionAsync on server collections');
            yield self._collection.dropCollectionAsync();
        }).call(this);
    },
    createCappedCollectionAsync (byteSize, maxDocuments) {
        return _async_to_generator(function*() {
            var self = this;
            if (!(yield self._collection.createCappedCollectionAsync)) throw new Error('Can only call createCappedCollectionAsync on server collections');
            yield self._collection.createCappedCollectionAsync(byteSize, maxDocuments);
        }).call(this);
    },
    /**
   * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
   * @locus Server
   * @memberof Mongo.Collection
   * @instance
   */ rawCollection () {
        var self = this;
        if (!self._collection.rawCollection) {
            throw new Error('Can only call rawCollection on server collections');
        }
        return self._collection.rawCollection();
    },
    /**
   * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
   * @locus Server
   * @memberof Mongo.Collection
   * @instance
   */ rawDatabase () {
        var self = this;
        if (!(self._driver.mongo && self._driver.mongo.db)) {
            throw new Error('Can only call rawDatabase on server collections');
        }
        return self._driver.mongo.db;
    }
});
Object.assign(Mongo, {
    /**
   * @summary Retrieve a Meteor collection instance by name. Only collections defined with [`new Mongo.Collection(...)`](#collections) are available with this method. For plain MongoDB collections, you'll want to look at [`rawDatabase()`](#Mongo-Collection-rawDatabase).
   * @locus Anywhere
   * @memberof Mongo
   * @static
   * @param {string} name Name of your collection as it was defined with `new Mongo.Collection()`.
   * @returns {Mongo.Collection | undefined}
   */ getCollection (name) {
        return this._collections.get(name);
    },
    /**
   * @summary A record of all defined Mongo.Collection instances, indexed by collection name.
   * @type {Map<string, Mongo.Collection>}
   * @memberof Mongo
   * @protected
   */ _collections: new Map(),
    /**
   * @summary Collection Extensions API
   * @memberof Mongo
   * @static
   */ CollectionExtensions: CollectionExtensions
});
/**
 * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will be generated randomly (not using MongoDB's ID construction rules).
 * @locus Anywhere
 * @class
 * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create
 */ Mongo.ObjectID = MongoID.ObjectID;
/**
 * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.
 * @class
 * @instanceName cursor
 */ Mongo.Cursor = LocalCollection.Cursor;
/**
 * @deprecated in 0.9.1
 */ Mongo.Collection.Cursor = Mongo.Cursor;
/**
 * @deprecated in 0.9.1
 */ Mongo.Collection.ObjectID = Mongo.ObjectID;
/**
 * @deprecated in 0.9.1
 */ Meteor.Collection = Mongo.Collection;
// Allow deny stuff is now in the allow-deny package
Object.assign(Mongo.Collection.prototype, AllowDeny.CollectionPrototype);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection_utils.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({setupConnection:()=>setupConnection,setupDriver:()=>setupDriver,setupAutopublish:()=>setupAutopublish,setupMutationMethods:()=>setupMutationMethods,validateCollectionName:()=>validateCollectionName,normalizeOptions:()=>normalizeOptions});module.export({ID_GENERATORS:()=>ID_GENERATORS},true);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},0);
const ID_GENERATORS = {
    MONGO (name) {
        return function() {
            const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
            return new Mongo.ObjectID(src.hexString(24));
        };
    },
    STRING (name) {
        return function() {
            const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
            return src.id();
        };
    }
};
function setupConnection(name, options) {
    if (!name || options.connection === null) return null;
    if (options.connection) return options.connection;
    return Meteor.isClient ? Meteor.connection : Meteor.server;
}
function setupDriver(name, connection, options) {
    if (options._driver) return options._driver;
    if (name && connection === Meteor.server && typeof MongoInternals !== 'undefined' && MongoInternals.defaultRemoteCollectionDriver) {
        return MongoInternals.defaultRemoteCollectionDriver();
    }
    const { LocalCollectionDriver } = require('../local_collection_driver.js');
    return LocalCollectionDriver;
}
function setupAutopublish(collection, name, options) {
    if (Package.autopublish && !options._preventAutopublish && collection._connection && collection._connection.publish) {
        collection._connection.publish(null, ()=>collection.find(), {
            is_auto: true
        });
    }
}
function setupMutationMethods(collection, name, options) {
    if (options.defineMutationMethods === false) return;
    try {
        collection._defineMutationMethods({
            useExisting: options._suppressSameNameError === true
        });
    } catch (error) {
        if (error.message === `A method named '/${name}/insertAsync' is already defined`) {
            throw new Error(`There is already a collection named "${name}"`);
        }
        throw error;
    }
}
function validateCollectionName(name) {
    if (!name && name !== null) {
        Meteor._debug('Warning: creating anonymous collection. It will not be ' + 'saved or synchronized over the network. (Pass null for ' + 'the collection name to turn off this warning.)');
        name = null;
    }
    if (name !== null && typeof name !== 'string') {
        throw new Error('First argument to new Mongo.Collection must be a string or null');
    }
    return name;
}
function normalizeOptions(options) {
    if (options && options.methods) {
        // Backwards compatibility hack with original signature
        options = {
            connection: options
        };
    }
    // Backwards compatibility: "connection" used to be called "manager".
    if (options && options.manager && !options.connection) {
        options.connection = options.manager;
    }
    const cleanedOptions = Object.fromEntries(Object.entries(options || {}).filter(([_, v])=>v !== undefined));
    // 2) Spread defaults first, then only the defined overrides
    return _object_spread({
        connection: undefined,
        idGeneration: 'STRING',
        transform: null,
        _driver: undefined,
        _preventAutopublish: false
    }, cleanedOptions);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_async.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_async.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({AsyncMethods:()=>AsyncMethods},true);let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},1);let _object_spread_props;module.link("@swc/helpers/_/_object_spread_props",{_(v){_object_spread_props=v}},2);


const AsyncMethods = {
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
   * @param {Object} options.collation Specifies a [collation](https://docs.mongodb.com/manual/reference/collation/) for string comparison. See [`find`](#find) for details.
   * @returns {Object}
   */ findOneAsync (...args) {
        return this._collection.findOneAsync(this._getFindSelector(args), this._getFindOptions(args));
    },
    _insertAsync (doc, options = {}) {
        // Make sure we were passed a document to insert
        if (!doc) {
            throw new Error('insert requires an argument');
        }
        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
            if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
                throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
            }
        } else {
            let generateId = true;
            // Don't generate the id if we're the client and the 'outermost' call
            // This optimization saves us passing both the randomSeed and the id
            // Passing both is redundant.
            if (this._isRemoteCollection()) {
                const enclosing = DDP._CurrentMethodInvocation.get();
                if (!enclosing) {
                    generateId = false;
                }
            }
            if (generateId) {
                doc._id = this._makeNewID();
            }
        }
        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function(result) {
            if (Meteor._isPromise(result)) return result;
            if (doc._id) {
                return doc._id;
            }
            // XXX what is this for??
            // It's some iteraction between the callback to _callMutatorMethod and
            // the return value conversion
            doc._id = result;
            return result;
        };
        if (this._isRemoteCollection()) {
            const promise = this._callMutatorMethodAsync('insertAsync', [
                doc
            ], options);
            promise.then(chooseReturnValueFromCollectionResult);
            promise.stubPromise = promise.stubPromise.then(chooseReturnValueFromCollectionResult);
            promise.serverPromise = promise.serverPromise.then(chooseReturnValueFromCollectionResult);
            return promise;
        }
        // it's my collection.  descend into the collection object
        // and propagate any exception.
        return this._collection.insertAsync(doc).then(chooseReturnValueFromCollectionResult);
    },
    /**
   * @summary Insert a document in the collection.  Returns a promise that will return the document's unique _id when solved.
   * @locus Anywhere
   * @method  insert
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
   */ insertAsync (doc, options) {
        return this._insertAsync(doc, options);
    },
    /**
   * @summary Modify one or more documents in the collection. Returns the number of matched documents.
   * @locus Anywhere
   * @method update
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
   * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
   */ updateAsync (selector, modifier, ...optionsAndCallback) {
        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _object_spread({}, optionsAndCallback[0] || null);
        let insertedId;
        if (options && options.upsert) {
            // set `insertedId` if absent.  `insertedId` is a Meteor extension.
            if (options.insertedId) {
                if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
                insertedId = options.insertedId;
            } else if (!selector || !selector._id) {
                insertedId = this._makeNewID();
                options.generatedId = true;
                options.insertedId = insertedId;
            }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
            fallbackId: insertedId
        });
        if (this._isRemoteCollection()) {
            const args = [
                selector,
                modifier,
                options
            ];
            return this._callMutatorMethodAsync('updateAsync', args, options);
        }
        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.
        return this._collection.updateAsync(selector, modifier, options);
    },
    /**
   * @summary Asynchronously removes documents from the collection.
   * @locus Anywhere
   * @method remove
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to remove
   */ removeAsync (selector, options = {}) {
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
            return this._callMutatorMethodAsync('removeAsync', [
                selector
            ], options);
        }
        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.removeAsync(selector);
    },
    /**
   * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere
   * @method upsert
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   */ upsertAsync (selector, modifier, options) {
        return _async_to_generator(function*() {
            return this.updateAsync(selector, modifier, _object_spread_props(_object_spread({}, options), {
                _returnObject: true,
                upsert: true
            }));
        }).call(this);
    },
    /**
   * @summary Gets the number of documents matching the filter. For a fast count of the total documents in a collection see `estimatedDocumentCount`.
   * @locus Anywhere
   * @method countDocuments
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to count
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/CountDocumentsOptions.html). Please note that not all of them are available on the client.
   * @returns {Promise<number>}
   */ countDocuments (...args) {
        return this._collection.countDocuments(...args);
    },
    /**
   * @summary Gets an estimate of the count of documents in a collection using collection metadata. For an exact count of the documents in a collection see `countDocuments`.
   * @locus Anywhere
   * @method estimatedDocumentCount
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/EstimatedDocumentCountOptions.html). Please note that not all of them are available on the client.
   * @returns {Promise<number>}
   */ estimatedDocumentCount (...args) {
        return this._collection.estimatedDocumentCount(...args);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({IndexMethods:()=>IndexMethods},true);let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let Log;module.link('meteor/logging',{Log(v){Log=v}},1);

const IndexMethods = {
    // We'll actually design an index API later. For now, we just pass through to
    // Mongo's, but make it synchronous.
    /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method ensureIndexAsync
   * @deprecated in 3.0
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */ ensureIndexAsync (index, options) {
        return _async_to_generator(function*() {
            var self = this;
            if (!self._collection.ensureIndexAsync || !self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
            if (self._collection.createIndexAsync) {
                yield self._collection.createIndexAsync(index, options);
            } else {
                Log.debug(`ensureIndexAsync has been deprecated, please use the new 'createIndexAsync' instead${(options === null || options === void 0 ? void 0 : options.name) ? `, index name: ${options.name}` : `, index: ${JSON.stringify(index)}`}`);
                yield self._collection.ensureIndexAsync(index, options);
            }
        }).call(this);
    },
    /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndexAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */ createIndexAsync (index, options) {
        return _async_to_generator(function*() {
            var self = this;
            if (!self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
            try {
                yield self._collection.createIndexAsync(index, options);
            } catch (e) {
                var _Meteor_settings_packages_mongo, _Meteor_settings_packages, _Meteor_settings;
                if (e.message.includes('An equivalent index already exists with the same name but different options.') && ((_Meteor_settings = Meteor.settings) === null || _Meteor_settings === void 0 ? void 0 : (_Meteor_settings_packages = _Meteor_settings.packages) === null || _Meteor_settings_packages === void 0 ? void 0 : (_Meteor_settings_packages_mongo = _Meteor_settings_packages.mongo) === null || _Meteor_settings_packages_mongo === void 0 ? void 0 : _Meteor_settings_packages_mongo.reCreateIndexOnOptionMismatch)) {
                    Log.info(`Re-creating index ${index} for ${self._name} due to options mismatch.`);
                    yield self._collection.dropIndexAsync(index);
                    yield self._collection.createIndexAsync(index, options);
                } else {
                    console.error(e);
                    throw new Meteor.Error(`An error occurred when creating an index for collection "${self._name}: ${e.message}`);
                }
            }
        }).call(this);
    },
    /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndex
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */ createIndex (index, options) {
        return this.createIndexAsync(index, options);
    },
    dropIndexAsync (index) {
        return _async_to_generator(function*() {
            var self = this;
            if (!self._collection.dropIndexAsync) throw new Error('Can only call dropIndexAsync on server collections');
            yield self._collection.dropIndexAsync(index);
        }).call(this);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_replication.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_replication.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({ReplicationMethods:()=>ReplicationMethods},true);let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},1);

const ReplicationMethods = {
    _maybeSetUpReplication (name) {
        return _async_to_generator(function*() {
            var _registerStoreResult_then;
            const self = this;
            if (!(self._connection && self._connection.registerStoreClient && self._connection.registerStoreServer)) {
                return;
            }
            const wrappedStoreCommon = {
                // Called around method stub invocations to capture the original versions
                // of modified documents.
                saveOriginals () {
                    self._collection.saveOriginals();
                },
                retrieveOriginals () {
                    return self._collection.retrieveOriginals();
                },
                // To be able to get back to the collection from the store.
                _getCollection () {
                    return self;
                }
            };
            const wrappedStoreClient = _object_spread({
                // Called at the beginning of a batch of updates. batchSize is the number
                // of update calls to expect.
                //
                // XXX This interface is pretty janky. reset probably ought to go back to
                // being its own function, and callers shouldn't have to calculate
                // batchSize. The optimization of not calling pause/remove should be
                // delayed until later: the first call to update() should buffer its
                // message, and then we can either directly apply it at endUpdate time if
                // it was the only update, or do pauseObservers/apply/apply at the next
                // update() if there's another one.
                beginUpdate (batchSize, reset) {
                    return _async_to_generator(function*() {
                        // pause observers so users don't see flicker when updating several
                        // objects at once (including the post-reconnect reset-and-reapply
                        // stage), and so that a re-sorting of a query can take advantage of the
                        // full _diffQuery moved calculation instead of applying change one at a
                        // time.
                        if (batchSize > 1 || reset) self._collection.pauseObservers();
                        if (reset) yield self._collection.remove({});
                    })();
                },
                // Apply an update.
                // XXX better specify this interface (not in terms of a wire message)?
                update (msg) {
                    var mongoId = MongoID.idParse(msg.id);
                    var doc = self._collection._docs.get(mongoId);
                    //When the server's mergebox is disabled for a collection, the client must gracefully handle it when:
                    // *We receive an added message for a document that is already there. Instead, it will be changed
                    // *We reeive a change message for a document that is not there. Instead, it will be added
                    // *We receive a removed messsage for a document that is not there. Instead, noting wil happen.
                    //Code is derived from client-side code originally in peerlibrary:control-mergebox
                    //https://github.com/peerlibrary/meteor-control-mergebox/blob/master/client.coffee
                    //For more information, refer to discussion "Initial support for publication strategies in livedata server":
                    //https://github.com/meteor/meteor/pull/11151
                    if (Meteor.isClient) {
                        if (msg.msg === 'added' && doc) {
                            msg.msg = 'changed';
                        } else if (msg.msg === 'removed' && !doc) {
                            return;
                        } else if (msg.msg === 'changed' && !doc) {
                            msg.msg = 'added';
                            const _ref = msg.fields;
                            for(let field in _ref){
                                const value = _ref[field];
                                if (value === void 0) {
                                    delete msg.fields[field];
                                }
                            }
                        }
                    }
                    // Is this a "replace the whole doc" message coming from the quiescence
                    // of method writes to an object? (Note that 'undefined' is a valid
                    // value meaning "remove it".)
                    if (msg.msg === 'replace') {
                        var replace = msg.replace;
                        if (!replace) {
                            if (doc) self._collection.remove(mongoId);
                        } else if (!doc) {
                            self._collection.insert(replace);
                        } else {
                            // XXX check that replace has no $ ops
                            self._collection.update(mongoId, replace);
                        }
                        return;
                    } else if (msg.msg === 'added') {
                        if (doc) {
                            throw new Error('Expected not to find a document already present for an add');
                        }
                        self._collection.insert(_object_spread({
                            _id: mongoId
                        }, msg.fields));
                    } else if (msg.msg === 'removed') {
                        if (!doc) throw new Error('Expected to find a document already present for removed');
                        self._collection.remove(mongoId);
                    } else if (msg.msg === 'changed') {
                        if (!doc) throw new Error('Expected to find a document to change');
                        const keys = Object.keys(msg.fields);
                        if (keys.length > 0) {
                            var modifier = {};
                            keys.forEach((key)=>{
                                const value = msg.fields[key];
                                if (EJSON.equals(doc[key], value)) {
                                    return;
                                }
                                if (typeof value === 'undefined') {
                                    if (!modifier.$unset) {
                                        modifier.$unset = {};
                                    }
                                    modifier.$unset[key] = 1;
                                } else {
                                    if (!modifier.$set) {
                                        modifier.$set = {};
                                    }
                                    modifier.$set[key] = value;
                                }
                            });
                            if (Object.keys(modifier).length > 0) {
                                self._collection.update(mongoId, modifier);
                            }
                        }
                    } else {
                        throw new Error("I don't know how to deal with this message");
                    }
                },
                // Called at the end of a batch of updates.livedata_connection.js:1287
                endUpdate () {
                    self._collection.resumeObserversClient();
                },
                // Used to preserve current versions of documents across a store reset.
                getDoc (id) {
                    return self.findOne(id);
                }
            }, wrappedStoreCommon);
            const wrappedStoreServer = _object_spread({
                beginUpdate (batchSize, reset) {
                    return _async_to_generator(function*() {
                        if (batchSize > 1 || reset) self._collection.pauseObservers();
                        if (reset) yield self._collection.removeAsync({});
                    })();
                },
                update (msg) {
                    return _async_to_generator(function*() {
                        var mongoId = MongoID.idParse(msg.id);
                        var doc = self._collection._docs.get(mongoId);
                        // Is this a "replace the whole doc" message coming from the quiescence
                        // of method writes to an object? (Note that 'undefined' is a valid
                        // value meaning "remove it".)
                        if (msg.msg === 'replace') {
                            var replace = msg.replace;
                            if (!replace) {
                                if (doc) yield self._collection.removeAsync(mongoId);
                            } else if (!doc) {
                                yield self._collection.insertAsync(replace);
                            } else {
                                // XXX check that replace has no $ ops
                                yield self._collection.updateAsync(mongoId, replace);
                            }
                            return;
                        } else if (msg.msg === 'added') {
                            if (doc) {
                                throw new Error('Expected not to find a document already present for an add');
                            }
                            yield self._collection.insertAsync(_object_spread({
                                _id: mongoId
                            }, msg.fields));
                        } else if (msg.msg === 'removed') {
                            if (!doc) throw new Error('Expected to find a document already present for removed');
                            yield self._collection.removeAsync(mongoId);
                        } else if (msg.msg === 'changed') {
                            if (!doc) throw new Error('Expected to find a document to change');
                            const keys = Object.keys(msg.fields);
                            if (keys.length > 0) {
                                var modifier = {};
                                keys.forEach((key)=>{
                                    const value = msg.fields[key];
                                    if (EJSON.equals(doc[key], value)) {
                                        return;
                                    }
                                    if (typeof value === 'undefined') {
                                        if (!modifier.$unset) {
                                            modifier.$unset = {};
                                        }
                                        modifier.$unset[key] = 1;
                                    } else {
                                        if (!modifier.$set) {
                                            modifier.$set = {};
                                        }
                                        modifier.$set[key] = value;
                                    }
                                });
                                if (Object.keys(modifier).length > 0) {
                                    yield self._collection.updateAsync(mongoId, modifier);
                                }
                            }
                        } else {
                            throw new Error("I don't know how to deal with this message");
                        }
                    })();
                },
                // Called at the end of a batch of updates.
                endUpdate () {
                    return _async_to_generator(function*() {
                        yield self._collection.resumeObserversServer();
                    })();
                },
                // Used to preserve current versions of documents across a store reset.
                getDoc (id) {
                    return _async_to_generator(function*() {
                        return self.findOneAsync(id);
                    })();
                }
            }, wrappedStoreCommon);
            // OK, we're going to be a slave, replicating some remote
            // database, except possibly with some temporary divergence while
            // we have unacknowledged RPC's.
            let registerStoreResult;
            if (Meteor.isClient) {
                registerStoreResult = self._connection.registerStoreClient(name, wrappedStoreClient);
            } else {
                registerStoreResult = self._connection.registerStoreServer(name, wrappedStoreServer);
            }
            const message = `There is already a collection named "${name}"`;
            const logWarn = ()=>{
                console.warn ? console.warn(message) : console.log(message);
            };
            if (!registerStoreResult) {
                return logWarn();
            }
            return registerStoreResult === null || registerStoreResult === void 0 ? void 0 : (_registerStoreResult_then = registerStoreResult.then) === null || _registerStoreResult_then === void 0 ? void 0 : _registerStoreResult_then.call(registerStoreResult, (ok)=>{
                if (!ok) {
                    logWarn();
                }
            });
        }).call(this);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_sync.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_sync.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({SyncMethods:()=>SyncMethods},true);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},0);let _object_spread_props;module.link("@swc/helpers/_/_object_spread_props",{_(v){_object_spread_props=v}},1);

const SyncMethods = {
    /**
   * @summary Find the documents in a collection that match the selector.
   * @locus Anywhere
   * @method find
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} [selector] A query describing the documents to find
   * @param {Object} [options]
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
   * @param {Number} options.skip Number of results to skip at the beginning
   * @param {Number} options.limit Maximum number of results to return
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {Boolean} options.disableOplog (Server only) Pass true to disable oplog-tailing on this query. This affects the way server processes calls to `observe` on this query. Disabling the oplog can be useful when working with data that updates in large batches.
   * @param {Number} options.pollingIntervalMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the frequency (in milliseconds) of how often to poll this query when observing on the server. Defaults to 10000ms (10 seconds).
   * @param {Number} options.pollingThrottleMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the minimum time (in milliseconds) to allow between re-polling when observing on the server. Increasing this will save CPU and mongo load at the expense of slower updates to users. Decreasing this is not recommended. Defaults to 50ms.
   * @param {Number} options.maxTimeMs (Server only) If set, instructs MongoDB to set a time limit for this cursor's operations. If the operation reaches the specified time limit (in milliseconds) without the having been completed, an exception will be thrown. Useful to prevent an (accidental or malicious) unoptimized query from causing a full collection scan that would disrupt other database users, at the expense of needing to handle the resulting error.
   * @param {String|Object} options.hint (Server only) Overrides MongoDB's default index selection and query optimization process. Specify an index to force its use, either by its name or index specification. You can also specify `{ $natural : 1 }` to force a forwards collection scan, or `{ $natural : -1 }` for a reverse collection scan. Setting this is only recommended for advanced users.
   * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for this particular cursor. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
   * @param {Object} options.collation Specifies a [collation](https://docs.mongodb.com/manual/reference/collation/) for string comparison. Supported on both client (Minimongo) and server. Client-supported options: `locale` (required, e.g. `'en'`), `strength` (`1` for base, `2` for case-insensitive, `3` for default), `caseLevel`, `numericOrdering` (`true` to sort `'2'` before `'10'`), `caseFirst` (`'upper'` or `'lower'`). Server-only options (ignored by Minimongo): `alternate`, `maxVariable`, `backwards`, `strength` 4–5. Compatible with oplog-tailing.
   * @returns {Mongo.Cursor}
   */ find (...args) {
        // Collection.find() (return all docs) behaves differently
        // from Collection.find(undefined) (return 0 docs).  so be
        // careful about the length of arguments.
        return this._collection.find(this._getFindSelector(args), this._getFindOptions(args));
    },
    /**
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
   * @locus Anywhere
   * @method findOne
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
   * @param {Object} options.collation Specifies a [collation](https://docs.mongodb.com/manual/reference/collation/) for string comparison. See [`find`](#find) for details.
   * @returns {Object}
   */ findOne (...args) {
        return this._collection.findOne(this._getFindSelector(args), this._getFindOptions(args));
    },
    // 'insert' immediately returns the inserted document's new _id.
    // The others return values immediately if you are in a stub, an in-memory
    // unmanaged collection, or a mongo-backed collection and you don't pass a
    // callback. 'update' and 'remove' return the number of affected
    // documents. 'upsert' returns an object with keys 'numberAffected' and, if an
    // insert happened, 'insertedId'.
    //
    // Otherwise, the semantics are exactly like other methods: they take
    // a callback as an optional last argument; if no callback is
    // provided, they block until the operation is complete, and throw an
    // exception if it fails; if a callback is provided, then they don't
    // necessarily block, and they call the callback when they finish with error and
    // result arguments.  (The insert method provides the document ID as its result;
    // update and remove provide the number of affected docs as the result; upsert
    // provides an object with numberAffected and maybe insertedId.)
    //
    // On the client, blocking is impossible, so if a callback
    // isn't provided, they just return immediately and any error
    // information is lost.
    //
    // There's one more tweak. On the client, if you don't provide a
    // callback, then if there is an error, a message will be logged with
    // Meteor._debug.
    //
    // The intent (though this is actually determined by the underlying
    // drivers) is that the operations should be done synchronously, not
    // generating their result until the database has acknowledged
    // them. In the future maybe we should provide a flag to turn this
    // off.
    _insert (doc, callback) {
        // Make sure we were passed a document to insert
        if (!doc) {
            throw new Error('insert requires an argument');
        }
        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
            if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
                throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
            }
        } else {
            let generateId = true;
            // Don't generate the id if we're the client and the 'outermost' call
            // This optimization saves us passing both the randomSeed and the id
            // Passing both is redundant.
            if (this._isRemoteCollection()) {
                const enclosing = DDP._CurrentMethodInvocation.get();
                if (!enclosing) {
                    generateId = false;
                }
            }
            if (generateId) {
                doc._id = this._makeNewID();
            }
        }
        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function(result) {
            if (Meteor._isPromise(result)) return result;
            if (doc._id) {
                return doc._id;
            }
            // XXX what is this for??
            // It's some iteraction between the callback to _callMutatorMethod and
            // the return value conversion
            doc._id = result;
            return result;
        };
        const wrappedCallback = wrapCallback(callback, chooseReturnValueFromCollectionResult);
        if (this._isRemoteCollection()) {
            const result = this._callMutatorMethod('insert', [
                doc
            ], wrappedCallback);
            return chooseReturnValueFromCollectionResult(result);
        }
        // it's my collection.  descend into the collection object
        // and propagate any exception.
        try {
            // If the user provided a callback and the collection implements this
            // operation asynchronously, then queryRet will be undefined, and the
            // result will be returned through the callback instead.
            let result;
            if (!!wrappedCallback) {
                this._collection.insert(doc, wrappedCallback);
            } else {
                // If we don't have the callback, we assume the user is using the promise.
                // We can't just pass this._collection.insert to the promisify because it would lose the context.
                result = this._collection.insert(doc);
            }
            return chooseReturnValueFromCollectionResult(result);
        } catch (e) {
            if (callback) {
                callback(e);
                return null;
            }
            throw e;
        }
    },
    /**
   * @summary Insert a document in the collection.  Returns its unique _id.
   * @locus Anywhere
   * @method  insert
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
   */ insert (doc, callback) {
        return this._insert(doc, callback);
    },
    /**
   * @summary Asynchronously modifies one or more documents in the collection. Returns the number of matched documents.
   * @locus Anywhere
   * @method update
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
   * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */ update (selector, modifier, ...optionsAndCallback) {
        const callback = popCallbackFromArgs(optionsAndCallback);
        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _object_spread({}, optionsAndCallback[0] || null);
        let insertedId;
        if (options && options.upsert) {
            // set `insertedId` if absent.  `insertedId` is a Meteor extension.
            if (options.insertedId) {
                if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
                insertedId = options.insertedId;
            } else if (!selector || !selector._id) {
                insertedId = this._makeNewID();
                options.generatedId = true;
                options.insertedId = insertedId;
            }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
            fallbackId: insertedId
        });
        const wrappedCallback = wrapCallback(callback);
        if (this._isRemoteCollection()) {
            const args = [
                selector,
                modifier,
                options
            ];
            return this._callMutatorMethod('update', args, callback);
        }
        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.
        //console.log({callback, options, selector, modifier, coll: this._collection});
        try {
            // If the user provided a callback and the collection implements this
            // operation asynchronously, then queryRet will be undefined, and the
            // result will be returned through the callback instead.
            return this._collection.update(selector, modifier, options, wrappedCallback);
        } catch (e) {
            if (callback) {
                callback(e);
                return null;
            }
            throw e;
        }
    },
    /**
   * @summary Remove documents from the collection
   * @locus Anywhere
   * @method remove
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to remove
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */ remove (selector, callback) {
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
            return this._callMutatorMethod('remove', [
                selector
            ], callback);
        }
        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.remove(selector);
    },
    /**
   * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere
   * @method upsert
   * @memberof Mongo.Collection
   * @instance
   * @param {MongoSelector} selector Specifies which documents to modify
   * @param {MongoModifier} modifier Specifies how to modify the documents
   * @param {Object} [options]
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */ upsert (selector, modifier, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }
        return this.update(selector, modifier, _object_spread_props(_object_spread({}, options), {
            _returnObject: true,
            upsert: true
        }));
    }
};
// Convert the callback to not return a result if there is an error
function wrapCallback(callback, convertResult) {
    return callback && function(error, result) {
        if (error) {
            callback(error);
        } else if (typeof convertResult === 'function') {
            callback(error, convertResult(result));
        } else {
            callback(error, result);
        }
    };
}
function popCallbackFromArgs(args) {
    // Pull off any callback (or perhaps a 'callback' variable that was passed
    // in undefined, like how 'upsert' does it).
    if (args.length && (args[args.length - 1] === undefined || args[args.length - 1] instanceof Function)) {
        return args.pop();
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"connection_options.ts":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/connection_options.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * @summary Allows for user specified connection options
 * @example http://mongodb.github.io/node-mongodb-native/3.0/reference/connecting/connection-settings/
 * @locus Server
 * @param {Object} options User specified Mongo connection options
 */ Mongo.setConnectionOptions = function setConnectionOptions(options) {
    check(options, Object);
    Mongo._connectionOptions = options;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_utils.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({normalizeProjection:()=>normalizeProjection},true);let _object_spread;module.link("@swc/helpers/_/_object_spread",{_(v){_object_spread=v}},0);let _object_without_properties;module.link("@swc/helpers/_/_object_without_properties",{_(v){_object_without_properties=v}},1);

const normalizeProjection = (options)=>{
    // transform fields key in projection
    const _ref = options || {}, { fields, projection } = _ref, otherOptions = _object_without_properties(_ref, [
        "fields",
        "projection"
    ]);
    // TODO: enable this comment when deprecating the fields option
    // Log.debug(`fields option has been deprecated, please use the new 'projection' instead`)
    return _object_spread({}, otherOptions, projection || fields ? {
        projection: fields || projection
    } : {});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"observe_handle.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_handle.ts                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({ObserveHandle:()=>ObserveHandle});function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
let nextObserveHandleId = 1;
/**
 * The "observe handle" returned from observeChanges.
 * Contains a reference to an ObserveMultiplexer.
 * Used to stop observation and clean up resources.
 */ class ObserveHandle {
    constructor(multiplexer, callbacks, nonMutatingCallbacks){
        _define_property(this, "_id", void 0);
        _define_property(this, "_multiplexer", void 0);
        _define_property(this, "nonMutatingCallbacks", void 0);
        _define_property(this, "_stopped", void 0);
        _define_property(this, "initialAddsSentResolver", ()=>{});
        _define_property(this, "initialAddsSent", void 0);
        _define_property(this, "_added", void 0);
        _define_property(this, "_addedBefore", void 0);
        _define_property(this, "_changed", void 0);
        _define_property(this, "_movedBefore", void 0);
        _define_property(this, "_removed", void 0);
        /**
   * Using property syntax and arrow function syntax to avoid binding the wrong context on callbacks.
   */ _define_property(this, "stop", ()=>_async_to_generator(function*() {
                if (this._stopped) return;
                this._stopped = true;
                yield this._multiplexer.removeHandle(this._id);
            }).call(this));
        this._multiplexer = multiplexer;
        multiplexer.callbackNames().forEach((name)=>{
            if (callbacks[name]) {
                this[`_${name}`] = callbacks[name];
                return;
            }
            if (name === "addedBefore" && callbacks.added) {
                this._addedBefore = function(id, fields, before) {
                    return _async_to_generator(function*() {
                        yield callbacks.added(id, fields);
                    })();
                };
            }
        });
        this._stopped = false;
        this._id = nextObserveHandleId++;
        this.nonMutatingCallbacks = nonMutatingCallbacks;
        this.initialAddsSent = new Promise((resolve)=>{
            const ready = ()=>{
                resolve();
                this.initialAddsSent = Promise.resolve();
            };
            const timeout = setTimeout(ready, 30000);
            this.initialAddsSentResolver = ()=>{
                ready();
                clearTimeout(timeout);
            };
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.isempty/package.json                                                  //
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
// node_modules/meteor/mongo/node_modules/lodash.isempty/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.clone":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/package.json                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.clone",
  "version": "4.5.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/index.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.has":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/package.json                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.has",
  "version": "4.5.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/index.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.throttle":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/package.json                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.throttle",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/index.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"mongodb-uri":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "mongodb-uri",
  "version": "0.9.7",
  "main": "mongodb-uri"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongodb-uri.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/mongodb-uri.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.once":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.once/package.json                                                     //
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
// node_modules/meteor/mongo/node_modules/lodash.once/index.js                                                         //
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
      MongoInternals: MongoInternals,
      Mongo: Mongo,
      CollectionExtensions: CollectionExtensions,
      ObserveMultiplexer: ObserveMultiplexer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo/mongo_driver.js",
    "/node_modules/meteor/mongo/oplog_tailing.ts",
    "/node_modules/meteor/mongo/observe_multiplex.ts",
    "/node_modules/meteor/mongo/doc_fetcher.js",
    "/node_modules/meteor/mongo/polling_observe_driver.ts",
    "/node_modules/meteor/mongo/oplog_observe_driver.js",
    "/node_modules/meteor/mongo/oplog_v2_converter.ts",
    "/node_modules/meteor/mongo/cursor_description.ts",
    "/node_modules/meteor/mongo/mongo_connection.js",
    "/node_modules/meteor/mongo/mongo_common.js",
    "/node_modules/meteor/mongo/asynchronous_cursor.js",
    "/node_modules/meteor/mongo/cursor.ts",
    "/node_modules/meteor/mongo/shared_change_stream.js",
    "/node_modules/meteor/mongo/changestream_observe_driver.js",
    "/node_modules/meteor/mongo/local_collection_driver.js",
    "/node_modules/meteor/mongo/remote_collection_driver.ts",
    "/node_modules/meteor/mongo/collection/collection_extensions.js",
    "/node_modules/meteor/mongo/collection/collection.js",
    "/node_modules/meteor/mongo/connection_options.ts"
  ]
}});

//# sourceURL=meteor://💻app/packages/mongo.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ190YWlsaW5nLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vYnNlcnZlX211bHRpcGxleC50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vZG9jX2ZldGNoZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL3BvbGxpbmdfb2JzZXJ2ZV9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL29wbG9nX29ic2VydmVfZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ192Ml9jb252ZXJ0ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2N1cnNvcl9kZXNjcmlwdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29ubmVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9hc3luY2hyb25vdXNfY3Vyc29yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jdXJzb3IudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL3NoYXJlZF9jaGFuZ2Vfc3RyZWFtLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jaGFuZ2VzdHJlYW1fb2JzZXJ2ZV9kcml2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2xvY2FsX2NvbGxlY3Rpb25fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9yZW1vdGVfY29sbGVjdGlvbl9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vY29sbGVjdGlvbl9leHRlbnNpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vY29sbGVjdGlvbl91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9tZXRob2RzX2FzeW5jLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL21ldGhvZHNfaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vbWV0aG9kc19yZXBsaWNhdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9tZXRob2RzX3N5bmMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2Nvbm5lY3Rpb25fb3B0aW9ucy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fdXRpbHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL29ic2VydmVfaGFuZGxlLnRzIl0sIm5hbWVzIjpbIk1vbmdvSW50ZXJuYWxzIiwiZ2xvYmFsIiwiX19wYWNrYWdlTmFtZSIsIk5wbU1vZHVsZXMiLCJtb25nb2RiIiwidmVyc2lvbiIsIk5wbU1vZHVsZU1vbmdvZGJWZXJzaW9uIiwibW9kdWxlIiwiTW9uZ29EQiIsIk5wbU1vZHVsZSIsIlByb3h5IiwiZ2V0IiwidGFyZ2V0IiwicHJvcGVydHlLZXkiLCJyZWNlaXZlciIsIk1ldGVvciIsImRlcHJlY2F0ZSIsIlJlZmxlY3QiLCJPcGxvZ0hhbmRsZSIsIkNvbm5lY3Rpb24iLCJNb25nb0Nvbm5lY3Rpb24iLCJPcGxvZ09ic2VydmVEcml2ZXIiLCJUaW1lc3RhbXAiLCJwcm90b3R5cGUiLCJjbG9uZSIsImxpc3RlbkFsbCIsImN1cnNvckRlc2NyaXB0aW9uIiwibGlzdGVuQ2FsbGJhY2siLCJsaXN0ZW5lcnMiLCJmb3JFYWNoVHJpZ2dlciIsInRyaWdnZXIiLCJwdXNoIiwiRERQU2VydmVyIiwiX0ludmFsaWRhdGlvbkNyb3NzYmFyIiwibGlzdGVuIiwic3RvcCIsImZvckVhY2giLCJsaXN0ZW5lciIsInRyaWdnZXJDYWxsYmFjayIsImtleSIsImNvbGxlY3Rpb24iLCJjb2xsZWN0aW9uTmFtZSIsInNwZWNpZmljSWRzIiwiTG9jYWxDb2xsZWN0aW9uIiwiX2lkc01hdGNoZWRCeVNlbGVjdG9yIiwic2VsZWN0b3IiLCJpZCIsIk9iamVjdCIsImFzc2lnbiIsImRyb3BDb2xsZWN0aW9uIiwiZHJvcERhdGFiYXNlIiwiTW9uZ29UaW1lc3RhbXAiLCJMb25nIiwiTnBtTW9kdWxlTW9uZ29kYiIsIk9QTE9HX0NPTExFQ1RJT04iLCJUT09fRkFSX0JFSElORCIsInByb2Nlc3MiLCJlbnYiLCJNRVRFT1JfT1BMT0dfVE9PX0ZBUl9CRUhJTkQiLCJUQUlMX1RJTUVPVVQiLCJNRVRFT1JfT1BMT0dfVEFJTF9USU1FT1VUIiwiX25zQWxsb3dlZCIsIm5zIiwiX2luY2x1ZGVOU1JlZ2V4IiwidGVzdCIsIl9leGNsdWRlTlNSZWdleCIsIl9nZXRPcGxvZ1NlbGVjdG9yIiwibGFzdFByb2Nlc3NlZFRTIiwib3Bsb2dDcml0ZXJpYSIsIiRvciIsIm9wIiwiJGluIiwiJGV4aXN0cyIsIl9vcGxvZ09wdGlvbnMiLCJleGNsdWRlQ29sbGVjdGlvbnMiLCJsZW5ndGgiLCJuc1JlZ2V4IiwiUmVnRXhwIiwiX2VzY2FwZVJlZ0V4cCIsIl9kYk5hbWUiLCJqb2luIiwiZXhjbHVkZU5zIiwiJHJlZ2V4IiwiJG5pbiIsIm1hcCIsImNvbGxOYW1lIiwiJGVsZW1NYXRjaCIsImluY2x1ZGVDb2xsZWN0aW9ucyIsImluY2x1ZGVOcyIsInRzIiwiJGd0IiwiJGFuZCIsIl9zdG9wcGVkIiwiX3RhaWxIYW5kbGUiLCJfb25PcGxvZ0VudHJ5IiwiY2FsbGJhY2siLCJFcnJvciIsIl9yZWFkeVByb21pc2UiLCJvcmlnaW5hbENhbGxiYWNrIiwiYmluZEVudmlyb25tZW50Iiwibm90aWZpY2F0aW9uIiwiZXJyIiwiX2RlYnVnIiwibGlzdGVuSGFuZGxlIiwiX2Nyb3NzYmFyIiwib25PcGxvZ0VudHJ5Iiwib25Ta2lwcGVkRW50cmllcyIsIl9vblNraXBwZWRFbnRyaWVzSG9vayIsInJlZ2lzdGVyIiwiX3dhaXRVbnRpbENhdWdodFVwIiwibGFzdEVudHJ5Iiwib3Bsb2dTZWxlY3RvciIsIl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24iLCJmaW5kT25lQXN5bmMiLCJwcm9qZWN0aW9uIiwic29ydCIsIiRuYXR1cmFsIiwiZSIsInNsZWVwIiwiSlNPTiIsInN0cmluZ2lmeSIsIl9sYXN0UHJvY2Vzc2VkVFMiLCJsZXNzVGhhbk9yRXF1YWwiLCJpbnNlcnRBZnRlciIsIl9jYXRjaGluZ1VwUmVzb2x2ZXJzIiwiZ3JlYXRlclRoYW4iLCJwcm9taXNlUmVzb2x2ZXIiLCJwcm9taXNlVG9Bd2FpdCIsIlByb21pc2UiLCJyIiwiY2xlYXJUaW1lb3V0IiwiX3Jlc29sdmVUaW1lb3V0Iiwic2V0VGltZW91dCIsImNvbnNvbGUiLCJlcnJvciIsInNwbGljZSIsInJlc29sdmVyIiwid2FpdFVudGlsQ2F1Z2h0VXAiLCJfc3RhcnRUYWlsaW5nIiwibW9uZ29kYlVyaSIsInJlcXVpcmUiLCJwYXJzZSIsIl9vcGxvZ1VybCIsImRhdGFiYXNlIiwiX29wbG9nVGFpbENvbm5lY3Rpb24iLCJtYXhQb29sU2l6ZSIsIm1pblBvb2xTaXplIiwiaXNNYXN0ZXJEb2MiLCJkYiIsImFkbWluIiwiY29tbWFuZCIsImlzbWFzdGVyIiwic2V0TmFtZSIsImxhc3RPcGxvZ0VudHJ5IiwiQ3Vyc29yRGVzY3JpcHRpb24iLCJ0YWlsYWJsZSIsInRhaWwiLCJkb2MiLCJfZW50cnlRdWV1ZSIsIl9tYXliZVN0YXJ0V29ya2VyIiwiX3JlYWR5UHJvbWlzZVJlc29sdmVyIiwiX3dvcmtlclByb21pc2UiLCJfd29ya2VyQWN0aXZlIiwiaXNFbXB0eSIsInBvcCIsImNsZWFyIiwiZWFjaCIsIl9zZXRMYXN0UHJvY2Vzc2VkVFMiLCJzaGlmdCIsImhhbmRsZURvYyIsInNlcXVlbmNlciIsIl9kZWZpbmVUb29GYXJCZWhpbmQiLCJ2YWx1ZSIsIl9yZXNldFRvb0ZhckJlaGluZCIsIm9wbG9nVXJsIiwiZGJOYW1lIiwiX3N0YXJ0VHJhaWxpbmdQcm9taXNlIiwiX0RvdWJsZUVuZGVkUXVldWUiLCJfQ3Jvc3NiYXIiLCJmYWN0UGFja2FnZSIsImZhY3ROYW1lIiwic2V0dGluZ3MiLCJwYWNrYWdlcyIsIm1vbmdvIiwib3Bsb2dJbmNsdWRlQ29sbGVjdGlvbnMiLCJvcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucyIsImluY0FsdCIsImMiLCJleGNBbHQiLCJIb29rIiwiZGVidWdQcmludEV4Y2VwdGlvbnMiLCJpZEZvck9wIiwibyIsIl9pZCIsIm8yIiwiaGFuZGxlIiwiYXBwbHlPcHMiLCJuZXh0VGltZXN0YW1wIiwiYWRkIiwiT05FIiwic3RhcnRzV2l0aCIsInNsaWNlIiwiZHJvcCIsImZpcmUiLCJyZXNvbHZlIiwic2V0SW1tZWRpYXRlIiwiT2JzZXJ2ZU11bHRpcGxleGVyIiwiYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzIiwiX2FkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyIsIl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZCIsIlBhY2thZ2UiLCJGYWN0cyIsImluY3JlbWVudFNlcnZlckZhY3QiLCJfcXVldWUiLCJydW5UYXNrIiwiX2hhbmRsZXMiLCJfc2VuZEFkZHMiLCJyZW1vdmVIYW5kbGUiLCJfcmVhZHkiLCJfc3RvcCIsIm9wdGlvbnMiLCJmcm9tUXVlcnlFcnJvciIsIl9vblN0b3AiLCJyZWFkeSIsInF1ZXVlVGFzayIsIl9yZXNvbHZlciIsIl9pc1JlYWR5IiwicXVlcnlFcnJvciIsIm9uRmx1c2giLCJjYiIsImNhbGxiYWNrTmFtZXMiLCJfb3JkZXJlZCIsIl9hcHBseUNhbGxiYWNrIiwiY2FsbGJhY2tOYW1lIiwiYXJncyIsIl9jYWNoZSIsImFwcGx5Q2hhbmdlIiwiYXBwbHkiLCJoYW5kbGVJZCIsImtleXMiLCJyZXN1bHQiLCJub25NdXRhdGluZ0NhbGxiYWNrcyIsIkVKU09OIiwiX2lzUHJvbWlzZSIsImNhdGNoIiwiaW5pdGlhbEFkZHNTZW50IiwidGhlbiIsIl9hZGRlZEJlZm9yZSIsIl9hZGRlZCIsImFkZFByb21pc2VzIiwiZG9jcyIsImZpZWxkcyIsInByb21pc2UiLCJyZWplY3QiLCJhbGxTZXR0bGVkIiwicCIsInN0YXR1cyIsInJlYXNvbiIsImluaXRpYWxBZGRzU2VudFJlc29sdmVyIiwib3JkZXJlZCIsIm9uU3RvcCIsInVuZGVmaW5lZCIsIl9Bc3luY2hyb25vdXNRdWV1ZSIsIl9DYWNoaW5nQ2hhbmdlT2JzZXJ2ZXIiLCJEb2NGZXRjaGVyIiwiZmV0Y2giLCJzZWxmIiwiY2hlY2siLCJTdHJpbmciLCJfY2FsbGJhY2tzRm9yT3AiLCJoYXMiLCJjYWxsYmFja3MiLCJzZXQiLCJfbW9uZ29Db25uZWN0aW9uIiwiZGVsZXRlIiwibW9uZ29Db25uZWN0aW9uIiwiTWFwIiwiUE9MTElOR19USFJPVFRMRV9NUyIsIk1FVEVPUl9QT0xMSU5HX1RIUk9UVExFX01TIiwiUE9MTElOR19JTlRFUlZBTF9NUyIsIk1FVEVPUl9QT0xMSU5HX0lOVEVSVkFMX01TIiwiUG9sbGluZ09ic2VydmVEcml2ZXIiLCJfaW5pdCIsIl9vcHRpb25zIiwibGlzdGVuZXJzSGFuZGxlIiwiX2N1cnNvckRlc2NyaXB0aW9uIiwiZmVuY2UiLCJfZ2V0Q3VycmVudEZlbmNlIiwiX3BlbmRpbmdXcml0ZXMiLCJiZWdpbldyaXRlIiwiX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCIsIl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQiLCJfc3RvcENhbGxiYWNrcyIsIl90ZXN0T25seVBvbGxDYWxsYmFjayIsInBvbGxpbmdJbnRlcnZhbCIsInBvbGxpbmdJbnRlcnZhbE1zIiwiX3BvbGxpbmdJbnRlcnZhbCIsImludGVydmFsSGFuZGxlIiwic2V0SW50ZXJ2YWwiLCJiaW5kIiwiY2xlYXJJbnRlcnZhbCIsIl91bnRocm90dGxlZEVuc3VyZVBvbGxJc1NjaGVkdWxlZCIsIl90YXNrUXVldWUiLCJfcG9sbE1vbmdvIiwiX3N1c3BlbmRQb2xsaW5nIiwiX3Jlc3VtZVBvbGxpbmciLCJmaXJzdCIsIm5ld1Jlc3VsdHMiLCJvbGRSZXN1bHRzIiwiX3Jlc3VsdHMiLCJfSWRNYXAiLCJ3cml0ZXNGb3JDeWNsZSIsIl9jdXJzb3IiLCJnZXRSYXdPYmplY3RzIiwiY29kZSIsIl9tdWx0aXBsZXhlciIsIm1lc3NhZ2UiLCJBcnJheSIsIl9kaWZmUXVlcnlDaGFuZ2VzIiwidyIsImNvbW1pdHRlZCIsIl9tb25nb0hhbmRsZSIsIm1vbmdvSGFuZGxlIiwibXVsdGlwbGV4ZXIiLCJfY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yIiwidGhyb3R0bGUiLCJwb2xsaW5nVGhyb3R0bGVNcyIsIlBIQVNFIiwiUVVFUllJTkciLCJGRVRDSElORyIsIlNURUFEWSIsIlN3aXRjaGVkVG9RdWVyeSIsImZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5IiwiZiIsImFyZ3VtZW50cyIsImN1cnJlbnRJZCIsIl91c2VzT3Bsb2ciLCJzb3J0ZXIiLCJjb21wYXJhdG9yIiwiZ2V0Q29tcGFyYXRvciIsImxpbWl0IiwiaGVhcE9wdGlvbnMiLCJJZE1hcCIsIl9saW1pdCIsIl9jb21wYXJhdG9yIiwiX3NvcnRlciIsIl91bnB1Ymxpc2hlZEJ1ZmZlciIsIk1pbk1heEhlYXAiLCJfcHVibGlzaGVkIiwiTWF4SGVhcCIsIl9zYWZlQXBwZW5kVG9CdWZmZXIiLCJfc3RvcEhhbmRsZXMiLCJfYWRkU3RvcEhhbmRsZXMiLCJuZXdTdG9wSGFuZGxlcyIsImV4cGVjdGVkUGF0dGVybiIsIk1hdGNoIiwiT2JqZWN0SW5jbHVkaW5nIiwiRnVuY3Rpb24iLCJPbmVPZiIsIl9yZWdpc3RlclBoYXNlQ2hhbmdlIiwiX21hdGNoZXIiLCJtYXRjaGVyIiwiX3Byb2plY3Rpb25GbiIsIl9jb21waWxlUHJvamVjdGlvbiIsIl9zaGFyZWRQcm9qZWN0aW9uIiwiY29tYmluZUludG9Qcm9qZWN0aW9uIiwiX3NoYXJlZFByb2plY3Rpb25GbiIsIl9uZWVkVG9GZXRjaCIsIl9jdXJyZW50bHlGZXRjaGluZyIsIl9mZXRjaEdlbmVyYXRpb24iLCJfcmVxdWVyeVdoZW5Eb25lVGhpc1F1ZXJ5IiwiX3dyaXRlc1RvQ29tbWl0V2hlbldlUmVhY2hTdGVhZHkiLCJfb3Bsb2dIYW5kbGUiLCJfbmVlZFRvUG9sbFF1ZXJ5IiwiX3BoYXNlIiwiX2hhbmRsZU9wbG9nRW50cnlRdWVyeWluZyIsIl9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZyIsImZpcmVkIiwiX29wbG9nT2JzZXJ2ZURyaXZlcnMiLCJvbkJlZm9yZUZpcmUiLCJkcml2ZXJzIiwiZHJpdmVyIiwidmFsdWVzIiwid3JpdGUiLCJfb25GYWlsb3ZlciIsIl9ydW5Jbml0aWFsUXVlcnkiLCJfYWRkUHVibGlzaGVkIiwiX25vWWllbGRzQWxsb3dlZCIsImFkZGVkIiwic2l6ZSIsIm92ZXJmbG93aW5nRG9jSWQiLCJtYXhFbGVtZW50SWQiLCJvdmVyZmxvd2luZ0RvYyIsImVxdWFscyIsInJlbW92ZSIsInJlbW92ZWQiLCJfYWRkQnVmZmVyZWQiLCJfcmVtb3ZlUHVibGlzaGVkIiwiZW1wdHkiLCJuZXdEb2NJZCIsIm1pbkVsZW1lbnRJZCIsIm5ld0RvYyIsIl9yZW1vdmVCdWZmZXJlZCIsIl9jaGFuZ2VQdWJsaXNoZWQiLCJvbGREb2MiLCJwcm9qZWN0ZWROZXciLCJwcm9qZWN0ZWRPbGQiLCJjaGFuZ2VkIiwiRGlmZlNlcXVlbmNlIiwibWFrZUNoYW5nZWRGaWVsZHMiLCJtYXhCdWZmZXJlZElkIiwiX2FkZE1hdGNoaW5nIiwibWF4UHVibGlzaGVkIiwibWF4QnVmZmVyZWQiLCJ0b1B1Ymxpc2giLCJjYW5BcHBlbmRUb0J1ZmZlciIsImNhbkluc2VydEludG9CdWZmZXIiLCJ0b0J1ZmZlciIsIl9yZW1vdmVNYXRjaGluZyIsIl9oYW5kbGVEb2MiLCJtYXRjaGVzTm93IiwiZG9jdW1lbnRNYXRjaGVzIiwicHVibGlzaGVkQmVmb3JlIiwiYnVmZmVyZWRCZWZvcmUiLCJjYWNoZWRCZWZvcmUiLCJtaW5CdWZmZXJlZCIsInN0YXlzSW5QdWJsaXNoZWQiLCJzdGF5c0luQnVmZmVyIiwiX2ZldGNoTW9kaWZpZWREb2N1bWVudHMiLCJkZWZlciIsInRoaXNHZW5lcmF0aW9uIiwiZmV0Y2hQcm9taXNlcyIsImZldGNoUHJvbWlzZSIsIl9kb2NGZXRjaGVyIiwicmVzdWx0cyIsImVycm9ycyIsImZpbHRlciIsIl9iZVN0ZWFkeSIsIndyaXRlcyIsIm9wbG9nVjJWMUNvbnZlcnRlciIsImlzUmVwbGFjZSIsImNhbkRpcmVjdGx5TW9kaWZ5RG9jIiwibW9kaWZpZXJDYW5CZURpcmVjdGx5QXBwbGllZCIsIl9tb2RpZnkiLCJuYW1lIiwiY2FuQmVjb21lVHJ1ZUJ5TW9kaWZpZXIiLCJhZmZlY3RlZEJ5TW9kaWZpZXIiLCJfcnVuSW5pdGlhbFF1ZXJ5QXN5bmMiLCJfcnVuUXVlcnkiLCJpbml0aWFsIiwiX2RvbmVRdWVyeWluZyIsIl9wb2xsUXVlcnkiLCJfcnVuUXVlcnlBc3luYyIsIm5ld0J1ZmZlciIsImN1cnNvciIsIl9jdXJzb3JGb3JRdWVyeSIsImkiLCJfc2xlZXBGb3JNcyIsIl9wdWJsaXNoTmV3UmVzdWx0cyIsIm9wdGlvbnNPdmVyd3JpdGUiLCJ0cmFuc2Zvcm0iLCJkZXNjcmlwdGlvbiIsIkN1cnNvciIsImlkc1RvUmVtb3ZlIiwiX29wbG9nRW50cnlIYW5kbGUiLCJfbGlzdGVuZXJzSGFuZGxlIiwicGhhc2UiLCJub3ciLCJEYXRlIiwidGltZURpZmYiLCJfcGhhc2VTdGFydFRpbWUiLCJjdXJzb3JTdXBwb3J0ZWQiLCJkaXNhYmxlT3Bsb2ciLCJfZGlzYWJsZU9wbG9nIiwic2tpcCIsIl9jaGVja1N1cHBvcnRlZFByb2plY3Rpb24iLCJoYXNXaGVyZSIsImhhc0dlb1F1ZXJ5IiwibW9kaWZpZXIiLCJlbnRyaWVzIiwiZXZlcnkiLCJvcGVyYXRpb24iLCJmaWVsZCIsImFycmF5T3BlcmF0b3JLZXlSZWdleCIsImlzQXJyYXlPcGVyYXRvcktleSIsImlzQXJyYXlPcGVyYXRvciIsIm9wZXJhdG9yIiwiYSIsInByZWZpeCIsImZsYXR0ZW5PYmplY3RJbnRvIiwic291cmNlIiwiaXNBcnJheSIsIk1vbmdvIiwiT2JqZWN0SUQiLCJfaXNDdXN0b21UeXBlIiwiY29udmVydE9wbG9nRGlmZiIsIm9wbG9nRW50cnkiLCJkaWZmIiwiZGlmZktleSIsIiR1bnNldCIsIiRzZXQiLCJmaWVsZFZhbHVlIiwicG9zaXRpb24iLCJwb3NpdGlvbktleSIsIiR2IiwiY29udmVydGVkT3Bsb2dFbnRyeSIsIkNvbGxlY3Rpb24iLCJfcmV3cml0ZVNlbGVjdG9yIiwiRklMRV9BU1NFVF9TVUZGSVgiLCJBU1NFVFNfRk9MREVSIiwiQVBQX0ZPTERFUiIsIm9wbG9nQ29sbGVjdGlvbldhcm5pbmdzIiwiYXZhaWxhYmxlRHJpdmVycyIsIkRFRkFVTFRfUkVBQ1RJVklUWV9PUkRFUiIsIk1FVEVPUl9SRUFDVElWSVRZX09SREVSIiwic3BsaXQiLCJyZWFjdGl2aXR5U2V0dGluZyIsInJlYWN0aXZpdHkiLCJtZXRob2QiLCJpbmNsdWRlcyIsInVybCIsIl9vYnNlcnZlTXVsdGlwbGV4ZXJzIiwiX3NoYXJlZENoYW5nZVN0cmVhbXMiLCJfb25GYWlsb3Zlckhvb2siLCJ1c2VyT3B0aW9ucyIsIl9jb25uZWN0aW9uT3B0aW9ucyIsIm1vbmdvT3B0aW9ucyIsImlnbm9yZVVuZGVmaW5lZCIsImVuZHNXaXRoIiwib3B0aW9uTmFtZSIsInJlcGxhY2UiLCJwYXRoIiwiQXNzZXRzIiwiZ2V0U2VydmVyRGlyIiwiZHJpdmVySW5mbyIsInJlbGVhc2UiLCJjbGllbnQiLCJNb25nb0NsaWVudCIsIm9uIiwiZXZlbnQiLCJwcmV2aW91c0Rlc2NyaXB0aW9uIiwidHlwZSIsIm5ld0Rlc2NyaXB0aW9uIiwiZGF0YWJhc2VOYW1lIiwiX2Nsb3NlIiwib3Bsb2dIYW5kbGUiLCJjbG9zZSIsIl9zZXRPcGxvZ0hhbmRsZSIsInJhd0NvbGxlY3Rpb24iLCJfYWNxdWlyZVNoYXJlZENoYW5nZVN0cmVhbSIsImV4aXN0aW5nIiwic2hhcmVkU3RyZWFtIiwiU2hhcmVkQ2hhbmdlU3RyZWFtIiwiY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jIiwiYnl0ZVNpemUiLCJtYXhEb2N1bWVudHMiLCJjcmVhdGVDb2xsZWN0aW9uIiwiY2FwcGVkIiwibWF4IiwiX21heWJlQmVnaW5Xcml0ZSIsIl9hbm5vdGF0ZUZlbmNlV2l0aFdyaXRlVHMiLCJ3cml0ZVRzIiwiX2NzVGFyZ2V0VHNCeUNvbGxlY3Rpb24iLCJwcmV2IiwiY29tcGFyZU9wZXJhdGlvblRpbWVzIiwiaW5zZXJ0QXN5bmMiLCJjb2xsZWN0aW9uX25hbWUiLCJkb2N1bWVudCIsIl9leHBlY3RlZEJ5VGVzdCIsIl9pc1BsYWluT2JqZWN0IiwicmVmcmVzaCIsInNlc3Npb24iLCJzdGFydFNlc3Npb24iLCJpbnNlcnRPbmUiLCJyZXBsYWNlVHlwZXMiLCJyZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyIsInNhZmUiLCJpbnNlcnRlZElkIiwib3BlcmF0aW9uVGltZSIsImVuZFNlc3Npb24iLCJfIiwiX3JlZnJlc2giLCJyZWZyZXNoS2V5IiwicmVtb3ZlQXN5bmMiLCJkZWxldGVNYW55IiwiZGVsZXRlZENvdW50IiwidHJhbnNmb3JtUmVzdWx0IiwibW9kaWZpZWRDb3VudCIsIm51bWJlckFmZmVjdGVkIiwiZHJvcENvbGxlY3Rpb25Bc3luYyIsImRyb3BEYXRhYmFzZUFzeW5jIiwiX2Ryb3BEYXRhYmFzZSIsInVwZGF0ZUFzeW5jIiwibW9kIiwibW9uZ29PcHRzIiwiYXJyYXlGaWx0ZXJzIiwidXBzZXJ0IiwibXVsdGkiLCJmdWxsUmVzdWx0IiwibW9uZ29TZWxlY3RvciIsIm1vbmdvTW9kIiwiaXNNb2RpZnkiLCJfaXNNb2RpZmljYXRpb25Nb2QiLCJfZm9yYmlkUmVwbGFjZSIsImtub3duSWQiLCJfY3JlYXRlVXBzZXJ0RG9jdW1lbnQiLCJnZW5lcmF0ZWRJZCIsInNpbXVsYXRlVXBzZXJ0V2l0aEluc2VydGVkSWQiLCJfcmV0dXJuT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCIkc2V0T25JbnNlcnQiLCJzdHJpbmdzIiwidXBkYXRlTWV0aG9kIiwidXBzZXJ0ZWRDb3VudCIsIm1ldGVvclJlc3VsdCIsIk9iamVjdElkIiwidG9IZXhTdHJpbmciLCJfaXNDYW5ub3RDaGFuZ2VJZEVycm9yIiwiZXJybXNnIiwiaW5kZXhPZiIsInVwc2VydEFzeW5jIiwiZmluZCIsImNyZWF0ZUluZGV4QXN5bmMiLCJpbmRleCIsImNyZWF0ZUluZGV4IiwiY291bnREb2N1bWVudHMiLCJhcmciLCJlc3RpbWF0ZWREb2N1bWVudENvdW50IiwiZW5zdXJlSW5kZXhBc3luYyIsImRyb3BJbmRleEFzeW5jIiwiaW5kZXhOYW1lIiwiZHJvcEluZGV4IiwiQ0xJRU5UX09OTFlfTUVUSE9EUyIsIm0iLCJnZXRBc3luY01ldGhvZE5hbWUiLCJOVU1fT1BUSU1JU1RJQ19UUklFUyIsIm1vbmdvT3B0c0ZvclVwZGF0ZSIsIm1vbmdvT3B0c0Zvckluc2VydCIsInJlcGxhY2VtZW50V2l0aElkIiwidHJpZXMiLCJkb1VwZGF0ZSIsInVwZGF0ZU1hbnkiLCJzb21lIiwicmVwbGFjZU9uZSIsInVwc2VydGVkSWQiLCJkb0NvbmRpdGlvbmFsSW5zZXJ0IiwiX29ic2VydmVDaGFuZ2VzVGFpbGFibGUiLCJhZGRlZEJlZm9yZSIsInNlbGZGb3JJdGVyYXRpb24iLCJ1c2VUcmFuc2Zvcm0iLCJjdXJzb3JPcHRpb25zIiwicmVhZFByZWZlcmVuY2UiLCJjb2xsYXRpb24iLCJudW1iZXJPZlJldHJpZXMiLCJkYkN1cnNvciIsImFkZEN1cnNvckZsYWciLCJtYXhUaW1lTXMiLCJtYXhUaW1lTVMiLCJoaW50IiwiQXN5bmNocm9ub3VzQ3Vyc29yIiwiZG9jQ2FsbGJhY2siLCJ0aW1lb3V0TVMiLCJzdG9wcGVkIiwibGFzdFRTIiwibG9vcCIsIl9uZXh0T2JqZWN0UHJvbWlzZVdpdGhUaW1lb3V0IiwibmV3U2VsZWN0b3IiLCJkcml2ZXJDbGFzc2VzIiwiY2hhbmdlU3RyZWFtcyIsIkNoYW5nZVN0cmVhbU9ic2VydmVEcml2ZXIiLCJvcGxvZyIsInBvbGxpbmciLCJfZ2V0Q29uZmlndXJlZFJlYWN0aXZpdHlPcmRlciIsImlzQXJyYXlTZXR0aW5nIiwiaXNTdHJpbmdTZXR0aW5nIiwiaGFzQ3VzdG9tRHJpdmVyT3JkZXIiLCJjb25maWd1cmVkT3JkZXIiLCJpbnZhbGlkRHJpdmVyTmFtZXMiLCJfc2VsZWN0UmVhY3Rpdml0eURyaXZlciIsImRyaXZlckNoZWNrcyIsImF2YWlsYWJpbGl0eUVycm9ycyIsImRyaXZlckNsYXNzIiwiZHJpdmVyTmFtZSIsImNoZWNrZXIiLCJhdmFpbGFibGUiLCJfb2JzZXJ2ZUNoYW5nZXMiLCJmaWVsZHNPcHRpb25zIiwib2JzZXJ2ZUtleSIsIm9ic2VydmVEcml2ZXIiLCJmaXJzdEhhbmRsZSIsIm9ic2VydmVIYW5kbGUiLCJPYnNlcnZlSGFuZGxlIiwib3Bsb2dPcHRpb25zIiwiY29sbGF0b3IiLCJfY3JlYXRlQ29sbGF0b3IiLCJsb2NhbE1hdGNoZXIiLCJyZWFzb25zIiwiX3N1cHBvcnRzQ2hhbmdlU3RyZWFtcyIsInNlcnZlclJlYXNvbnMiLCJzZXJ2ZXJJbmZvIiwiaXNNYXN0ZXJQcm9taXNlIiwiaXNNYXN0ZXIiLCJ2ZXJzaW9uU3RyaW5nIiwidmVyc2lvblBhcnRzIiwiTnVtYmVyIiwibWFqb3IiLCJpc0Zpbml0ZSIsImhhc01pblZlcnNpb24iLCJpc1JlcGxpY2FTZXQiLCJCb29sZWFuIiwic2Vjb25kYXJ5IiwiaXNTaGFyZGVkIiwibXNnIiwiX2NoYW5nZVN0cmVhbVNlcnZlclJlYXNvbnMiLCJjc09wdGlvbnMiLCJNaW5pbW9uZ28iLCJNYXRjaGVyIiwiaXNDbGllbnQiLCJNaW5pTW9uZ29RdWVyeUVycm9yIiwibG9jYWxTb3J0ZXIiLCJTb3J0ZXIiLCJzZWxlY3RlZE1hdGNoZXIiLCJzZWxlY3RlZFNvcnRlciIsIl9vYnNlcnZlRHJpdmVyIiwid3JpdGVDYWxsYmFjayIsInJlZnJlc2hFcnIiLCJkcml2ZXJSZXN1bHQiLCJtb25nb1Jlc3VsdCIsIm4iLCJtYXRjaGVkQ291bnQiLCJpc0JpbmFyeSIsIkJpbmFyeSIsIkJ1ZmZlciIsImZyb20iLCJEZWNpbWFsIiwiRGVjaW1hbDEyOCIsImZyb21TdHJpbmciLCJ0b1N0cmluZyIsInJlcGxhY2VOYW1lcyIsIm1ha2VNb25nb0xlZ2FsIiwidG9KU09OVmFsdWUiLCJhdG9tVHJhbnNmb3JtZXIiLCJyZXBsYWNlZFRvcExldmVsQXRvbSIsInJldCIsInZhbCIsInZhbFJlcGxhY2VkIiwicmVwbGFjZU1vbmdvQXRvbVdpdGhNZXRlb3IiLCJzdWJfdHlwZSIsImJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJmcm9tSlNPTlZhbHVlIiwidW5tYWtlTW9uZ29MZWdhbCIsInN1YnN0ciIsInRoaW5nIiwib3BUaW1lMSIsIm9wVGltZTIiLCJjb21wYXJlIiwiU3ltYm9sIiwiYXN5bmNJdGVyYXRvciIsIm5leHQiLCJfbmV4dE9iamVjdFByb21pc2UiLCJkb25lIiwiX3Jhd05leHRPYmplY3RQcm9taXNlIiwiX2Nsb3NpbmciLCJfcGVuZGluZ05leHQiLCJfZGJDdXJzb3IiLCJfdmlzaXRlZElkcyIsIl90cmFuc2Zvcm0iLCJuZXh0T2JqZWN0UHJvbWlzZSIsInRpbWVvdXRQcm9taXNlIiwidGltZW91dElkIiwiZmluYWxseSIsInJhY2UiLCJ0aGlzQXJnIiwiX3Jld2luZCIsImlkeCIsImNhbGwiLCJfc2VsZkZvckl0ZXJhdGlvbiIsInJld2luZCIsImNvdW50Iiwid3JhcFRyYW5zZm9ybSIsImNvdW50QXN5bmMiLCJfbW9uZ28iLCJnZXRUcmFuc2Zvcm0iLCJfcHVibGlzaEN1cnNvciIsInN1YiIsIl9nZXRDb2xsZWN0aW9uTmFtZSIsIm9ic2VydmUiLCJfb2JzZXJ2ZUZyb21PYnNlcnZlQ2hhbmdlcyIsIm9ic2VydmVBc3luYyIsIm9ic2VydmVDaGFuZ2VzIiwiX29ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzQXJlT3JkZXJlZCIsIm9ic2VydmVDaGFuZ2VzQXN5bmMiLCJfc3luY2hyb25vdXNDdXJzb3IiLCJBU1lOQ19DVVJTT1JfTUVUSE9EUyIsIml0ZXJhdG9yIiwibWV0aG9kTmFtZSIsInNldHVwQXN5bmNocm9ub3VzQ3Vyc29yIiwibWV0aG9kTmFtZUFzeW5jIiwiX2RyaXZlcnMiLCJhZGREcml2ZXIiLCJfZW5zdXJlT3BlbiIsIl9jaGFuZ2VTdHJlYW0iLCJfc3RhcnRQcm9taXNlIiwiX29wZW4iLCJyZW1vdmVEcml2ZXIiLCJfY29sbGVjdGlvbk5hbWUiLCJzdGFydEF0T3BlcmF0aW9uVGltZSIsIl9yZXN1bWVUb2tlbiIsInBpbmdSZXMiLCJwaW5nIiwiY2hhbmdlU3RyZWFtT3B0aW9ucyIsImZ1bGxEb2N1bWVudCIsImZ1bGxEb2N1bWVudEJlZm9yZUNoYW5nZSIsInN0YXJ0QWZ0ZXIiLCJjaGFuZ2VTdHJlYW0iLCJ3YXRjaCIsImNoYW5nZSIsIl9vbkNoYW5nZSIsImRyaXZlckNvdW50IiwicmVzdW1lVG9rZW5QcmVzZW50IiwiX2lzTm9uUmVzdW1hYmxlRXJyb3IiLCJfaGlzdG9yeUxvc3QiLCJfc2NoZWR1bGVSZXN0YXJ0IiwiZGVsYXkiLCJkcml2ZXJJZCIsImNvZGVOYW1lIiwibGFiZWwiLCJoYXNFcnJvckxhYmVsIiwiZXJyb3JMYWJlbFNldCIsImVycm9yTGFiZWxzIiwiZGVsYXlNcyIsIl9yZXN0YXJ0VGltZXIiLCJfcmVzdGFydCIsIl9jbG9zZVN0cmVhbSIsIl9yZXN5bmNEcml2ZXJzIiwiX3Jlc3luY0FmdGVySGlzdG9yeUxvc3QiLCJzdHJlYW0iLCJfb25FbXB0eSIsIm9uRW1wdHkiLCJTZXQiLCJTVVBQT1JURURfT1BFUkFUSU9OUyIsIl9zZW5kTXVsdGlwbGV4ZXJBZGRlZCIsInByb2plY3RlZERvYyIsIl9zdGFydExpc3RlbmluZyIsInN0b3BIYW5kbGUiLCJfY2hhbmdlU3RyZWFtT2JzZXJ2ZURyaXZlcnMiLCJfZmx1c2hQZW5kaW5nV3JpdGVzIiwiX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5IiwiX2FkZFN0b3BDYWxsYmFjayIsIl9zdGFydFdhdGNoaW5nIiwiX3NoYXJlZFN0cmVhbSIsIl9zZW5kSW5pdGlhbEFkZHMiLCJfZmx1c2hXcml0ZXNUb0NvbW1pdCIsImRvY0NvdW50IiwicmF3RG9jIiwiTW9uZ29JRCIsImNsdXN0ZXJUaW1lIiwiX3NldExhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lIiwiX2hhbmRsZUNoYW5nZSIsImRvY3VtZW50S2V5Iiwib3BlcmF0aW9uVHlwZSIsImNhbGxiYWNrRGF0YSIsIl9sYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZSIsImNhbGxiYWNrc1RvRmx1c2giLCJfaGFuZGxlSW5zZXJ0IiwiX2hhbmRsZVVwZGF0ZSIsIl9oYW5kbGVEZWxldGUiLCJtYXRjaGVzIiwibWF0Y2hlc0FmdGVyIiwiY2FjaGVkRG9jIiwibWF0Y2hlc0JlZm9yZSIsIm9sZERvY0ZvckRpZmYiLCJjaGFuZ2VkRmllbGRzIiwicHJlc2VudCIsImlkU3RyaW5naWZ5IiwicmVtb3ZlZElkcyIsImNhY2hlZElkIiwiZmVuY2VPdmVycmlkZSIsInRhcmdldFRzIiwiaW5zZXJ0SWR4IiwiZW50cnkiLCJ3YXJuTXMiLCJ3YWl0VW50aWxDYXVnaHRVcFdhcm5NcyIsIndhaXRTdGFydGVkQXQiLCJ3YXJuQ291bnQiLCJkdW1wRGlhZ25vc3RpY3MiLCJsYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZSIsImlzUmVhZHkiLCJjaGFuZ2VTdHJlYW1PcGVuIiwicGVuZGluZ1dyaXRlc0NvdW50Iiwid3JpdGVzVG9Db21taXRXaGVuUmVhZHlDb3VudCIsImNhdGNoaW5nVXBSZXNvbHZlcnNDb3VudCIsIndhaXRlZE1zIiwid2FyblRpbWVvdXRJZCIsInRpY2siLCJwZW5kaW5nQ2F0Y2hVcCIsIl91c2VzQ2hhbmdlU3RyZWFtcyIsIlJhbmRvbSIsImJhc2VQcm9qZWN0aW9uRm4iLCJwcm9qZWN0ZWQiLCJMb2NhbENvbGxlY3Rpb25Ecml2ZXIiLCJvcGVuIiwiY29ubiIsImVuc3VyZUNvbGxlY3Rpb24iLCJub0Nvbm5Db2xsZWN0aW9ucyIsIl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucyIsImNyZWF0ZSIsImNvbGxlY3Rpb25zIiwiUmVtb3RlQ29sbGVjdGlvbkRyaXZlciIsIlJFTU9URV9DT0xMRUNUSU9OX01FVEhPRFMiLCJtb25nb01ldGhvZCIsIkFTWU5DX0NPTExFQ1RJT05fTUVUSE9EUyIsImFzeW5jTWV0aG9kTmFtZSIsIm1vbmdvVXJsIiwiZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIiLCJvbmNlIiwiY29ubmVjdGlvbk9wdGlvbnMiLCJNT05HT19VUkwiLCJNT05HT19PUExPR19VUkwiLCJzdGFydHVwIiwiY29ubmVjdCIsIndhcm4iLCJDb2xsZWN0aW9uRXh0ZW5zaW9ucyIsIl9leHRlbnNpb25zIiwiX3Byb3RvdHlwZU1ldGhvZHMiLCJfc3RhdGljTWV0aG9kcyIsImFkZEV4dGVuc2lvbiIsImV4dGVuc2lvbiIsImFkZFByb3RvdHlwZU1ldGhvZCIsImFkZFN0YXRpY01ldGhvZCIsInJlbW92ZUV4dGVuc2lvbiIsInJlbW92ZVByb3RvdHlwZU1ldGhvZCIsInJlbW92ZVN0YXRpY01ldGhvZCIsImNsZWFyRXh0ZW5zaW9ucyIsImdldEV4dGVuc2lvbnMiLCJnZXRQcm90b3R5cGVNZXRob2RzIiwiZ2V0U3RhdGljTWV0aG9kcyIsIl9hcHBseUV4dGVuc2lvbnMiLCJpbnN0YW5jZSIsIl9hcHBseVN0YXRpY01ldGhvZHMiLCJDb2xsZWN0aW9uQ29uc3RydWN0b3IiLCJJRF9HRU5FUkFUT1JTIiwidmFsaWRhdGVDb2xsZWN0aW9uTmFtZSIsIm5vcm1hbGl6ZU9wdGlvbnMiLCJfbWFrZU5ld0lEIiwiaWRHZW5lcmF0aW9uIiwicmVzb2x2ZXJUeXBlIiwiX2Nvbm5lY3Rpb24iLCJzZXR1cENvbm5lY3Rpb24iLCJzZXR1cERyaXZlciIsIl9kcml2ZXIiLCJfY29sbGVjdGlvbiIsIl9uYW1lIiwiX3NldHRpbmdVcFJlcGxpY2F0aW9uUHJvbWlzZSIsIl9tYXliZVNldFVwUmVwbGljYXRpb24iLCJzZXR1cE11dGF0aW9uTWV0aG9kcyIsInNldHVwQXV0b3B1Ymxpc2giLCJfY29sbGVjdGlvbnMiLCJfZ2V0RmluZFNlbGVjdG9yIiwiX2dldEZpbmRPcHRpb25zIiwibmV3T3B0aW9ucyIsIm5vcm1hbGl6ZVByb2plY3Rpb24iLCJPcHRpb25hbCIsImZhbGxiYWNrSWQiLCJfc2VsZWN0b3JJc0lkIiwiUmVwbGljYXRpb25NZXRob2RzIiwiU3luY01ldGhvZHMiLCJBc3luY01ldGhvZHMiLCJJbmRleE1ldGhvZHMiLCJfaXNSZW1vdGVDb2xsZWN0aW9uIiwic2VydmVyIiwicmF3RGF0YWJhc2UiLCJnZXRDb2xsZWN0aW9uIiwiQWxsb3dEZW55IiwiQ29sbGVjdGlvblByb3RvdHlwZSIsIk1PTkdPIiwic3JjIiwiRERQIiwicmFuZG9tU3RyZWFtIiwiaW5zZWN1cmUiLCJoZXhTdHJpbmciLCJTVFJJTkciLCJjb25uZWN0aW9uIiwiYXV0b3B1Ymxpc2giLCJfcHJldmVudEF1dG9wdWJsaXNoIiwicHVibGlzaCIsImlzX2F1dG8iLCJkZWZpbmVNdXRhdGlvbk1ldGhvZHMiLCJfZGVmaW5lTXV0YXRpb25NZXRob2RzIiwidXNlRXhpc3RpbmciLCJfc3VwcHJlc3NTYW1lTmFtZUVycm9yIiwibWV0aG9kcyIsIm1hbmFnZXIiLCJjbGVhbmVkT3B0aW9ucyIsImZyb21FbnRyaWVzIiwidiIsIl9pbnNlcnRBc3luYyIsImdldFByb3RvdHlwZU9mIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImdlbmVyYXRlSWQiLCJlbmNsb3NpbmciLCJfQ3VycmVudE1ldGhvZEludm9jYXRpb24iLCJjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0IiwiX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMiLCJzdHViUHJvbWlzZSIsInNlcnZlclByb21pc2UiLCJvcHRpb25zQW5kQ2FsbGJhY2siLCJMb2ciLCJkZWJ1ZyIsInJlQ3JlYXRlSW5kZXhPbk9wdGlvbk1pc21hdGNoIiwiaW5mbyIsInJlZ2lzdGVyU3RvcmVSZXN1bHQiLCJyZWdpc3RlclN0b3JlQ2xpZW50IiwicmVnaXN0ZXJTdG9yZVNlcnZlciIsIndyYXBwZWRTdG9yZUNvbW1vbiIsInNhdmVPcmlnaW5hbHMiLCJyZXRyaWV2ZU9yaWdpbmFscyIsIl9nZXRDb2xsZWN0aW9uIiwid3JhcHBlZFN0b3JlQ2xpZW50IiwiYmVnaW5VcGRhdGUiLCJiYXRjaFNpemUiLCJyZXNldCIsInBhdXNlT2JzZXJ2ZXJzIiwidXBkYXRlIiwibW9uZ29JZCIsImlkUGFyc2UiLCJfZG9jcyIsIl9yZWYiLCJpbnNlcnQiLCJlbmRVcGRhdGUiLCJyZXN1bWVPYnNlcnZlcnNDbGllbnQiLCJnZXREb2MiLCJmaW5kT25lIiwid3JhcHBlZFN0b3JlU2VydmVyIiwicmVzdW1lT2JzZXJ2ZXJzU2VydmVyIiwibG9nV2FybiIsImxvZyIsIm9rIiwiX2luc2VydCIsIndyYXBwZWRDYWxsYmFjayIsIndyYXBDYWxsYmFjayIsIl9jYWxsTXV0YXRvck1ldGhvZCIsInBvcENhbGxiYWNrRnJvbUFyZ3MiLCJjb252ZXJ0UmVzdWx0Iiwic2V0Q29ubmVjdGlvbk9wdGlvbnMiLCJvdGhlck9wdGlvbnMiLCJuZXh0T2JzZXJ2ZUhhbmRsZUlkIiwiX2NoYW5nZWQiLCJfbW92ZWRCZWZvcmUiLCJfcmVtb3ZlZCIsImJlZm9yZSIsInRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBOEM7QUFDTztBQUNPO0FBQ25CO0FBRXpDQSxpQkFBaUJDLE9BQU9ELGNBQWMsR0FBRyxDQUFDO0FBRTFDQSxlQUFlRSxhQUFhLEdBQUc7QUFFL0JGLGVBQWVHLFVBQVUsR0FBRztJQUMxQkMsU0FBUztRQUNQQyxTQUFTQztRQUNUQyxRQUFRQztJQUNWO0FBQ0Y7QUFFQSw2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QixJQUFJLENBQUNJLGVBQWUsR0FBRyxJQUFJckgsUUFBUTRFO1lBQ2pDLE1BQU1tQixRQUFRO2dCQUNabkI7Z0JBQ0EsSUFBSSxDQUFDeUMsZUFBZSxHQUFHckgsUUFBUTRFLE9BQU87WUFDeEM7WUFFQSxNQUFNZzFCLFVBQVV4NUIsV0FBVzJGLE9BQU87WUFFbEMsSUFBSSxDQUFDbUMsdUJBQXVCLEdBQUc7Z0JBQzdCbkM7Z0JBQ0E3RixhQUFhMDVCO1lBQ2Y7UUFDRjtJQUNGO0FBVUYiLCJmaWxlIjoiL3BhY2thZ2VzL21vbmdvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3Bsb2dIYW5kbGUgfSBmcm9tICcuL29wbG9nX3RhaWxpbmcnO1xuaW1wb3J0IHsgTW9uZ29Db25uZWN0aW9uIH0gZnJvbSAnLi9tb25nb19jb25uZWN0aW9uJztcbmltcG9ydCB7IE9wbG9nT2JzZXJ2ZURyaXZlciB9IGZyb20gJy4vb3Bsb2dfb2JzZXJ2ZV9kcml2ZXInO1xuaW1wb3J0IHsgTW9uZ29EQiB9IGZyb20gJy4vbW9uZ29fY29tbW9uJztcblxuTW9uZ29JbnRlcm5hbHMgPSBnbG9iYWwuTW9uZ29JbnRlcm5hbHMgPSB7fTtcblxuTW9uZ29JbnRlcm5hbHMuX19wYWNrYWdlTmFtZSA9ICdtb25nbyc7XG5cbk1vbmdvSW50ZXJuYWxzLk5wbU1vZHVsZXMgPSB7XG4gIG1vbmdvZGI6IHtcbiAgICB2ZXJzaW9uOiBOcG1Nb2R1bGVNb25nb2RiVmVyc2lvbixcbiAgICBtb2R1bGU6IE1vbmdvREJcbiAgfVxufTtcblxuLy8gT2xkZXIgdmVyc2lvbiBvZiB3aGF0IGlzIG5vdyBhdmFpbGFibGUgdmlhXG4vLyBNb25nb0ludGVybmFscy5OcG1Nb2R1bGVzLm1vbmdvZGIubW9kdWxlLiAgSXQgd2FzIG5ldmVyIGRvY3VtZW50ZWQsIGJ1dFxuLy8gcGVvcGxlIGRvIHVzZSBpdC5cbi8vIFhYWCBDT01QQVQgV0lUSCAxLjAuMy4yXG5Nb25nb0ludGVybmFscy5OcG1Nb2R1bGUgPSBuZXcgUHJveHkoTW9uZ29EQiwge1xuICBnZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAocHJvcGVydHlLZXkgPT09ICdPYmplY3RJRCcpIHtcbiAgICAgIE1ldGVvci5kZXByZWNhdGUoXG4gICAgICAgIGBBY2Nlc3NpbmcgJ01vbmdvSW50ZXJuYWxzLk5wbU1vZHVsZS5PYmplY3RJRCcgZGlyZWN0bHkgaXMgZGVwcmVjYXRlZC4gYCArXG4gICAgICAgIGBVc2UgJ01vbmdvSW50ZXJuYWxzLk5wbU1vZHVsZS5PYmplY3RJZCcgaW5zdGVhZC5gXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpO1xuICB9LFxufSk7XG5cbk1vbmdvSW50ZXJuYWxzLk9wbG9nSGFuZGxlID0gT3Bsb2dIYW5kbGU7XG5cbk1vbmdvSW50ZXJuYWxzLkNvbm5lY3Rpb24gPSBNb25nb0Nvbm5lY3Rpb247XG5cbk1vbmdvSW50ZXJuYWxzLk9wbG9nT2JzZXJ2ZURyaXZlciA9IE9wbG9nT2JzZXJ2ZURyaXZlcjtcblxuLy8gVGhpcyBpcyB1c2VkIHRvIGFkZCBvciByZW1vdmUgRUpTT04gZnJvbSB0aGUgYmVnaW5uaW5nIG9mIGV2ZXJ5dGhpbmcgbmVzdGVkXG4vLyBpbnNpZGUgYW4gRUpTT04gY3VzdG9tIHR5cGUuIEl0IHNob3VsZCBvbmx5IGJlIGNhbGxlZCBvbiBwdXJlIEpTT04hXG5cblxuLy8gRW5zdXJlIHRoYXQgRUpTT04uY2xvbmUga2VlcHMgYSBUaW1lc3RhbXAgYXMgYSBUaW1lc3RhbXAgKGluc3RlYWQgb2YganVzdFxuLy8gZG9pbmcgYSBzdHJ1Y3R1cmFsIGNsb25lKS5cbi8vIFhYWCBob3cgb2sgaXMgdGhpcz8gd2hhdCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgY29waWVzIG9mIE1vbmdvREIgbG9hZGVkP1xuTW9uZ29EQi5UaW1lc3RhbXAucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaW1lc3RhbXBzIHNob3VsZCBiZSBpbW11dGFibGUuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gTGlzdGVuIGZvciB0aGUgaW52YWxpZGF0aW9uIG1lc3NhZ2VzIHRoYXQgd2lsbCB0cmlnZ2VyIHVzIHRvIHBvbGwgdGhlXG4vLyBkYXRhYmFzZSBmb3IgY2hhbmdlcy4gSWYgdGhpcyBzZWxlY3RvciBzcGVjaWZpZXMgc3BlY2lmaWMgSURzLCBzcGVjaWZ5IHRoZW1cbi8vIGhlcmUsIHNvIHRoYXQgdXBkYXRlcyB0byBkaWZmZXJlbnQgc3BlY2lmaWMgSURzIGRvbid0IGNhdXNlIHVzIHRvIHBvbGwuXG4vLyBsaXN0ZW5DYWxsYmFjayBpcyB0aGUgc2FtZSBraW5kIG9mIChub3RpZmljYXRpb24sIGNvbXBsZXRlKSBjYWxsYmFjayBwYXNzZWRcbi8vIHRvIEludmFsaWRhdGlvbkNyb3NzYmFyLmxpc3Rlbi5cblxuZXhwb3J0IGNvbnN0IGxpc3RlbkFsbCA9IGFzeW5jIGZ1bmN0aW9uIChjdXJzb3JEZXNjcmlwdGlvbiwgbGlzdGVuQ2FsbGJhY2spIHtcbiAgY29uc3QgbGlzdGVuZXJzID0gW107XG4gIGF3YWl0IGZvckVhY2hUcmlnZ2VyKGN1cnNvckRlc2NyaXB0aW9uLCBmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgIGxpc3RlbmVycy5wdXNoKEREUFNlcnZlci5fSW52YWxpZGF0aW9uQ3Jvc3NiYXIubGlzdGVuKFxuICAgICAgdHJpZ2dlciwgbGlzdGVuQ2FsbGJhY2spKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIuc3RvcCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGZvckVhY2hUcmlnZ2VyID0gYXN5bmMgZnVuY3Rpb24gKGN1cnNvckRlc2NyaXB0aW9uLCB0cmlnZ2VyQ2FsbGJhY2spIHtcbiAgY29uc3Qga2V5ID0ge2NvbGxlY3Rpb246IGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lfTtcbiAgY29uc3Qgc3BlY2lmaWNJZHMgPSBMb2NhbENvbGxlY3Rpb24uX2lkc01hdGNoZWRCeVNlbGVjdG9yKFxuICAgIGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yKTtcbiAgaWYgKHNwZWNpZmljSWRzKSB7XG4gICAgZm9yIChjb25zdCBpZCBvZiBzcGVjaWZpY0lkcykge1xuICAgICAgYXdhaXQgdHJpZ2dlckNhbGxiYWNrKE9iamVjdC5hc3NpZ24oe2lkOiBpZH0sIGtleSkpO1xuICAgIH1cbiAgICBhd2FpdCB0cmlnZ2VyQ2FsbGJhY2soT2JqZWN0LmFzc2lnbih7ZHJvcENvbGxlY3Rpb246IHRydWUsIGlkOiBudWxsfSwga2V5KSk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgdHJpZ2dlckNhbGxiYWNrKGtleSk7XG4gIH1cbiAgLy8gRXZlcnlvbmUgY2FyZXMgYWJvdXQgdGhlIGRhdGFiYXNlIGJlaW5nIGRyb3BwZWQuXG4gIGF3YWl0IHRyaWdnZXJDYWxsYmFjayh7IGRyb3BEYXRhYmFzZTogdHJ1ZSB9KTtcbn07XG5cblxuXG4vLyBYWFggV2UgcHJvYmFibHkgbmVlZCB0byBmaW5kIGEgYmV0dGVyIHdheSB0byBleHBvc2UgdGhpcy4gUmlnaHQgbm93XG4vLyBpdCdzIG9ubHkgdXNlZCBieSB0ZXN0cywgYnV0IGluIGZhY3QgeW91IG5lZWQgaXQgaW4gbm9ybWFsXG4vLyBvcGVyYXRpb24gdG8gaW50ZXJhY3Qgd2l0aCBjYXBwZWQgY29sbGVjdGlvbnMuXG5Nb25nb0ludGVybmFscy5Nb25nb1RpbWVzdGFtcCA9IE1vbmdvREIuVGltZXN0YW1wO1xuIiwiaW1wb3J0IGlzRW1wdHkgZnJvbSAnbG9kYXNoLmlzZW1wdHknO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDdXJzb3JEZXNjcmlwdGlvbiB9IGZyb20gJy4vY3Vyc29yX2Rlc2NyaXB0aW9uJztcbmltcG9ydCB7IE1vbmdvQ29ubmVjdGlvbiB9IGZyb20gJy4vbW9uZ29fY29ubmVjdGlvbic7XG5cbmltcG9ydCB7IE5wbU1vZHVsZU1vbmdvZGIgfSBmcm9tIFwibWV0ZW9yL25wbS1tb25nb1wiO1xuY29uc3QgeyBMb25nIH0gPSBOcG1Nb2R1bGVNb25nb2RiO1xuXG5leHBvcnQgY29uc3QgT1BMT0dfQ09MTEVDVElPTiA9ICdvcGxvZy5ycyc7XG5cbmxldCBUT09fRkFSX0JFSElORCA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX09QTE9HX1RPT19GQVJfQkVISU5EIHx8IDIwMDApO1xuY29uc3QgVEFJTF9USU1FT1VUID0gKyhwcm9jZXNzLmVudi5NRVRFT1JfT1BMT0dfVEFJTF9USU1FT1VUIHx8IDMwMDAwKTtcblxuZXhwb3J0IGludGVyZmFjZSBPcGxvZ0VudHJ5IHtcbiAgb3A6IHN0cmluZztcbiAgbzogYW55O1xuICBvMj86IGFueTtcbiAgdHM6IGFueTtcbiAgbnM6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYXRjaGluZ1VwUmVzb2x2ZXIge1xuICB0czogYW55O1xuICByZXNvbHZlcjogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcGxvZ1RyaWdnZXIge1xuICBkcm9wQ29sbGVjdGlvbjogYm9vbGVhbjtcbiAgZHJvcERhdGFiYXNlOiBib29sZWFuO1xuICBvcDogT3Bsb2dFbnRyeTtcbiAgY29sbGVjdGlvbj86IHN0cmluZztcbiAgaWQ/OiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgY2xhc3MgT3Bsb2dIYW5kbGUge1xuICBwcml2YXRlIF9vcGxvZ1VybDogc3RyaW5nO1xuICBwdWJsaWMgX2RiTmFtZTogc3RyaW5nO1xuICBwcml2YXRlIF9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb246IE1vbmdvQ29ubmVjdGlvbiB8IG51bGw7XG4gIHByaXZhdGUgX29wbG9nVGFpbENvbm5lY3Rpb246IE1vbmdvQ29ubmVjdGlvbiB8IG51bGw7XG4gIHByaXZhdGUgX29wbG9nT3B0aW9uczoge1xuICAgIGV4Y2x1ZGVDb2xsZWN0aW9ucz86IHN0cmluZ1tdO1xuICAgIGluY2x1ZGVDb2xsZWN0aW9ucz86IHN0cmluZ1tdO1xuICB9O1xuICBwcml2YXRlIF9pbmNsdWRlTlNSZWdleD86IFJlZ0V4cDtcbiAgcHJpdmF0ZSBfZXhjbHVkZU5TUmVnZXg/OiBSZWdFeHA7XG4gIHByaXZhdGUgX3N0b3BwZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgX3RhaWxIYW5kbGU6IGFueTtcbiAgcHJpdmF0ZSBfcmVhZHlQcm9taXNlUmVzb2x2ZXI6ICgoKSA9PiB2b2lkKSB8IG51bGw7XG4gIHByaXZhdGUgX3JlYWR5UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgcHVibGljIF9jcm9zc2JhcjogYW55O1xuICBwcml2YXRlIF9jYXRjaGluZ1VwUmVzb2x2ZXJzOiBDYXRjaGluZ1VwUmVzb2x2ZXJbXTtcbiAgcHJpdmF0ZSBfbGFzdFByb2Nlc3NlZFRTOiBhbnk7XG4gIHByaXZhdGUgX29uU2tpcHBlZEVudHJpZXNIb29rOiBhbnk7XG4gIHByaXZhdGUgX3N0YXJ0VHJhaWxpbmdQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIF9yZXNvbHZlVGltZW91dDogYW55O1xuXG4gIHByaXZhdGUgX2VudHJ5UXVldWUgPSBuZXcgTWV0ZW9yLl9Eb3VibGVFbmRlZFF1ZXVlKCk7XG4gIHByaXZhdGUgX3dvcmtlckFjdGl2ZSA9IGZhbHNlO1xuICBwcml2YXRlIF93b3JrZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3Iob3Bsb2dVcmw6IHN0cmluZywgZGJOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9vcGxvZ1VybCA9IG9wbG9nVXJsO1xuICAgIHRoaXMuX2RiTmFtZSA9IGRiTmFtZTtcblxuICAgIHRoaXMuX3Jlc29sdmVUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX29wbG9nVGFpbENvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcbiAgICB0aGlzLl90YWlsSGFuZGxlID0gbnVsbDtcbiAgICB0aGlzLl9yZWFkeVByb21pc2VSZXNvbHZlciA9IG51bGw7XG4gICAgdGhpcy5fcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UociA9PiB0aGlzLl9yZWFkeVByb21pc2VSZXNvbHZlciA9IHIpOyBcbiAgICB0aGlzLl9jcm9zc2JhciA9IG5ldyBERFBTZXJ2ZXIuX0Nyb3NzYmFyKHtcbiAgICAgIGZhY3RQYWNrYWdlOiBcIm1vbmdvLWxpdmVkYXRhXCIsIGZhY3ROYW1lOiBcIm9wbG9nLXdhdGNoZXJzXCJcbiAgICB9KTtcblxuICAgIGNvbnN0IGluY2x1ZGVDb2xsZWN0aW9ucyA9XG4gICAgICBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8ub3Bsb2dJbmNsdWRlQ29sbGVjdGlvbnM7XG4gICAgY29uc3QgZXhjbHVkZUNvbGxlY3Rpb25zID1cbiAgICAgIE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5vcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucztcbiAgICBpZiAoaW5jbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGggJiYgZXhjbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJDYW4ndCB1c2UgYm90aCBtb25nbyBvcGxvZyBzZXR0aW5ncyBvcGxvZ0luY2x1ZGVDb2xsZWN0aW9ucyBhbmQgb3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnMgYXQgdGhlIHNhbWUgdGltZS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fb3Bsb2dPcHRpb25zID0geyBpbmNsdWRlQ29sbGVjdGlvbnMsIGV4Y2x1ZGVDb2xsZWN0aW9ucyB9O1xuXG4gICAgaWYgKGluY2x1ZGVDb2xsZWN0aW9ucz8ubGVuZ3RoKSB7XG4gICAgICBjb25zdCBpbmNBbHQgPSBpbmNsdWRlQ29sbGVjdGlvbnMubWFwKChjKSA9PiBNZXRlb3IuX2VzY2FwZVJlZ0V4cChjKSkuam9pbignfCcpO1xuXG4gICAgICB0aGlzLl9pbmNsdWRlTlNSZWdleCA9IG5ldyBSZWdFeHAoYF4ke01ldGVvci5fZXNjYXBlUmVnRXhwKHRoaXMuX2RiTmFtZSl9XFxcXC4oPzoke2luY0FsdH0pJGApO1xuICAgIH1cblxuICAgIGlmIChleGNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgY29uc3QgZXhjQWx0ID0gZXhjbHVkZUNvbGxlY3Rpb25zLm1hcCgoYykgPT4gTWV0ZW9yLl9lc2NhcGVSZWdFeHAoYykpLmpvaW4oJ3wnKTtcblxuICAgICAgdGhpcy5fZXhjbHVkZU5TUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtNZXRlb3IuX2VzY2FwZVJlZ0V4cCh0aGlzLl9kYk5hbWUpfVxcXFwuKD86JHtleGNBbHR9KSRgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzID0gW107XG4gICAgdGhpcy5fbGFzdFByb2Nlc3NlZFRTID0gbnVsbDtcblxuICAgIHRoaXMuX29uU2tpcHBlZEVudHJpZXNIb29rID0gbmV3IEhvb2soe1xuICAgICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25Ta2lwcGVkRW50cmllcyBjYWxsYmFja1wiXG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdGFydFRyYWlsaW5nUHJvbWlzZSA9IHRoaXMuX3N0YXJ0VGFpbGluZygpO1xuICB9XG5cbiAgICBwcml2YXRlIF9uc0FsbG93ZWQobnM6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICAgIGlmICghbnMpIHJldHVybiBmYWxzZTtcbiAgICBpZiAobnMgPT09ICdhZG1pbi4kY21kJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKHRoaXMuX2luY2x1ZGVOU1JlZ2V4ICYmICF0aGlzLl9pbmNsdWRlTlNSZWdleC50ZXN0KG5zKSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0aGlzLl9leGNsdWRlTlNSZWdleCAmJiB0aGlzLl9leGNsdWRlTlNSZWdleC50ZXN0KG5zKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPcGxvZ1NlbGVjdG9yKGxhc3RQcm9jZXNzZWRUUz86IGFueSk6IGFueSB7XG4gICAgY29uc3Qgb3Bsb2dDcml0ZXJpYTogYW55ID0gW1xuICAgICAge1xuICAgICAgICAkb3I6IFtcbiAgICAgICAgICB7IG9wOiB7ICRpbjogW1wiaVwiLCBcInVcIiwgXCJkXCJdIH0gfSxcbiAgICAgICAgICB7IG9wOiBcImNcIiwgXCJvLmRyb3BcIjogeyAkZXhpc3RzOiB0cnVlIH0gfSxcbiAgICAgICAgICB7IG9wOiBcImNcIiwgXCJvLmRyb3BEYXRhYmFzZVwiOiAxIH0sXG4gICAgICAgICAgeyBvcDogXCJjXCIsIFwiby5hcHBseU9wc1wiOiB7ICRleGlzdHM6IHRydWUgfSB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgaWYgKHRoaXMuX29wbG9nT3B0aW9ucy5leGNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgY29uc3QgbnNSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICdeKD86JyArXG4gICAgICAgICAgW1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgTWV0ZW9yLl9lc2NhcGVSZWdFeHAodGhpcy5fZGJOYW1lICsgJy4nKSxcbiAgICAgICAgICBdLmpvaW4oJ3wnKSArXG4gICAgICAgICAgJyknXG4gICAgICApO1xuICAgICAgY29uc3QgZXhjbHVkZU5zID0ge1xuICAgICAgICAkcmVnZXg6IG5zUmVnZXgsXG4gICAgICAgICRuaW46IHRoaXMuX29wbG9nT3B0aW9ucy5leGNsdWRlQ29sbGVjdGlvbnMubWFwKFxuICAgICAgICAgIChjb2xsTmFtZTogc3RyaW5nKSA9PiBgJHt0aGlzLl9kYk5hbWV9LiR7Y29sbE5hbWV9YFxuICAgICAgICApLFxuICAgICAgfTtcbiAgICAgIG9wbG9nQ3JpdGVyaWEucHVzaCh7XG4gICAgICAgICRvcjogW1xuICAgICAgICAgIHsgbnM6IGV4Y2x1ZGVOcyB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5zOiAvXmFkbWluXFwuXFwkY21kLyxcbiAgICAgICAgICAgICdvLmFwcGx5T3BzJzogeyAkZWxlbU1hdGNoOiB7IG5zOiBleGNsdWRlTnMgfSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX29wbG9nT3B0aW9ucy5pbmNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgY29uc3QgaW5jbHVkZU5zID0ge1xuICAgICAgICAkaW46IHRoaXMuX29wbG9nT3B0aW9ucy5pbmNsdWRlQ29sbGVjdGlvbnMubWFwKFxuICAgICAgICAgIChjb2xsTmFtZTogc3RyaW5nKSA9PiBgJHt0aGlzLl9kYk5hbWV9LiR7Y29sbE5hbWV9YFxuICAgICAgICApLFxuICAgICAgfTtcbiAgICAgIG9wbG9nQ3JpdGVyaWEucHVzaCh7XG4gICAgICAgICRvcjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5zOiBpbmNsdWRlTnMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IG5zOiAvXmFkbWluXFwuXFwkY21kLywgJ28uYXBwbHlPcHMubnMnOiBpbmNsdWRlTnMgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuc1JlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgXCJeKD86XCIgK1xuICAgICAgICAgIFtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIE1ldGVvci5fZXNjYXBlUmVnRXhwKHRoaXMuX2RiTmFtZSArIFwiLlwiKSxcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIE1ldGVvci5fZXNjYXBlUmVnRXhwKFwiYWRtaW4uJGNtZFwiKSxcbiAgICAgICAgICBdLmpvaW4oXCJ8XCIpICtcbiAgICAgICAgICBcIilcIlxuICAgICAgKTtcbiAgICAgIG9wbG9nQ3JpdGVyaWEucHVzaCh7XG4gICAgICAgIG5zOiBuc1JlZ2V4LFxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmKGxhc3RQcm9jZXNzZWRUUykge1xuICAgICAgb3Bsb2dDcml0ZXJpYS5wdXNoKHtcbiAgICAgICAgdHM6IHsgJGd0OiBsYXN0UHJvY2Vzc2VkVFMgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAkYW5kOiBvcGxvZ0NyaXRlcmlhLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgdGhpcy5fc3RvcHBlZCA9IHRydWU7XG4gICAgaWYgKHRoaXMuX3RhaWxIYW5kbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuX3RhaWxIYW5kbGUuc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9vbk9wbG9nRW50cnkodHJpZ2dlcjogT3Bsb2dUcmlnZ2VyLCBjYWxsYmFjazogRnVuY3Rpb24pOiBQcm9taXNlPHsgc3RvcDogKCkgPT4gUHJvbWlzZTx2b2lkPiB9PiB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbGxlZCBvbk9wbG9nRW50cnkgb24gc3RvcHBlZCBoYW5kbGUhXCIpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX3JlYWR5UHJvbWlzZTtcblxuICAgIGNvbnN0IG9yaWdpbmFsQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgIC8qKlxuICAgICAqIFRoaXMgZGVwZW5kcyBvbiBBc3luY2hyb25vdXNRdWV1ZSB0YXNrcyBiZWluZyB3cmFwcGVkIGluIGBiaW5kRW52aXJvbm1lbnRgIHRvby5cbiAgICAgKlxuICAgICAqIEB0b2RvIENoZWNrIGFmdGVyIHdlIHNpbXBsaWZ5IHRoZSBgYmluZEVudmlyb25tZW50YCBpbXBsZW1lbnRhdGlvbiBpZiB3ZSBjYW4gcmVtb3ZlIHRoZSBzZWNvbmQgd3JhcC5cbiAgICAgKi9cbiAgICBjYWxsYmFjayA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoXG4gICAgICBmdW5jdGlvbiAobm90aWZpY2F0aW9uOiBhbnkpIHtcbiAgICAgICAgb3JpZ2luYWxDYWxsYmFjayhub3RpZmljYXRpb24pO1xuICAgICAgfSxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkVycm9yIGluIG9wbG9nIGNhbGxiYWNrXCIsIGVycik7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGxpc3RlbkhhbmRsZSA9IHRoaXMuX2Nyb3NzYmFyLmxpc3Rlbih0cmlnZ2VyLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0b3A6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXdhaXQgbGlzdGVuSGFuZGxlLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgb25PcGxvZ0VudHJ5KHRyaWdnZXI6IE9wbG9nVHJpZ2dlciwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogUHJvbWlzZTx7IHN0b3A6ICgpID0+IFByb21pc2U8dm9pZD4gfT4ge1xuICAgIHJldHVybiB0aGlzLl9vbk9wbG9nRW50cnkodHJpZ2dlciwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25Ta2lwcGVkRW50cmllcyhjYWxsYmFjazogRnVuY3Rpb24pOiB7IHN0b3A6ICgpID0+IHZvaWQgfSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbGxlZCBvblNraXBwZWRFbnRyaWVzIG9uIHN0b3BwZWQgaGFuZGxlIVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29uU2tpcHBlZEVudHJpZXNIb29rLnJlZ2lzdGVyKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIF93YWl0VW50aWxDYXVnaHRVcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fc3RvcHBlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGVkIHdhaXRVbnRpbENhdWdodFVwIG9uIHN0b3BwZWQgaGFuZGxlIVwiKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl9yZWFkeVByb21pc2U7XG5cbiAgICBsZXQgbGFzdEVudHJ5OiBPcGxvZ0VudHJ5IHwgbnVsbCA9IG51bGw7XG5cbiAgICB3aGlsZSAoIXRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIGNvbnN0IG9wbG9nU2VsZWN0b3IgPSB0aGlzLl9nZXRPcGxvZ1NlbGVjdG9yKCk7XG4gICAgICB0cnkge1xuICAgICAgICBsYXN0RW50cnkgPSBhd2FpdCB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24uZmluZE9uZUFzeW5jKFxuICAgICAgICAgIE9QTE9HX0NPTExFQ1RJT04sXG4gICAgICAgICAgb3Bsb2dTZWxlY3RvcixcbiAgICAgICAgICB7IHByb2plY3Rpb246IHsgdHM6IDEgfSwgc29ydDogeyAkbmF0dXJhbDogLTEgfSB9XG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiR290IGV4Y2VwdGlvbiB3aGlsZSByZWFkaW5nIGxhc3QgZW50cnlcIiwgZSk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgYXdhaXQgTWV0ZW9yLnNsZWVwKDEwMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIGlmICghbGFzdEVudHJ5KSByZXR1cm47XG5cbiAgICBjb25zdCB0cyA9IGxhc3RFbnRyeS50cztcbiAgICBpZiAoIXRzKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIm9wbG9nIGVudHJ5IHdpdGhvdXQgdHM6IFwiICsgSlNPTi5zdHJpbmdpZnkobGFzdEVudHJ5KSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhc3RQcm9jZXNzZWRUUyAmJiB0cy5sZXNzVGhhbk9yRXF1YWwodGhpcy5fbGFzdFByb2Nlc3NlZFRTKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBpbnNlcnRBZnRlciA9IHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGluc2VydEFmdGVyIC0gMSA+IDAgJiYgdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVyc1tpbnNlcnRBZnRlciAtIDFdLnRzLmdyZWF0ZXJUaGFuKHRzKSkge1xuICAgICAgaW5zZXJ0QWZ0ZXItLTtcbiAgICB9XG5cbiAgICBsZXQgcHJvbWlzZVJlc29sdmVyID0gbnVsbDtcblxuICAgIGNvbnN0IHByb21pc2VUb0F3YWl0ID0gbmV3IFByb21pc2UociA9PiBwcm9taXNlUmVzb2x2ZXIgPSByKTtcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXNvbHZlVGltZW91dCk7XG5cbiAgICB0aGlzLl9yZXNvbHZlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihcIk1ldGVvcjogb3Bsb2cgY2F0Y2hpbmcgdXAgdG9vayB0b28gbG9uZ1wiLCB7IHRzIH0pO1xuICAgIH0sIDEwMDAwKTtcblxuICAgIHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnMuc3BsaWNlKGluc2VydEFmdGVyLCAwLCB7IHRzLCByZXNvbHZlcjogcHJvbWlzZVJlc29sdmVyISB9KTtcblxuICAgIGF3YWl0IHByb21pc2VUb0F3YWl0O1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc29sdmVUaW1lb3V0KTtcbiAgfVxuXG4gIGFzeW5jIHdhaXRVbnRpbENhdWdodFVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl93YWl0VW50aWxDYXVnaHRVcCgpO1xuICB9XG5cbiAgYXN5bmMgX3N0YXJ0VGFpbGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtb25nb2RiVXJpID0gcmVxdWlyZSgnbW9uZ29kYi11cmknKTtcbiAgICBpZiAobW9uZ29kYlVyaS5wYXJzZSh0aGlzLl9vcGxvZ1VybCkuZGF0YWJhc2UgIT09ICdsb2NhbCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIiRNT05HT19PUExPR19VUkwgbXVzdCBiZSBzZXQgdG8gdGhlICdsb2NhbCcgZGF0YWJhc2Ugb2YgYSBNb25nbyByZXBsaWNhIHNldFwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vcGxvZ1RhaWxDb25uZWN0aW9uID0gbmV3IE1vbmdvQ29ubmVjdGlvbihcbiAgICAgIHRoaXMuX29wbG9nVXJsLCB7IG1heFBvb2xTaXplOiAxLCBtaW5Qb29sU2l6ZTogMSB9XG4gICAgKTtcbiAgICB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24gPSBuZXcgTW9uZ29Db25uZWN0aW9uKFxuICAgICAgdGhpcy5fb3Bsb2dVcmwsIHsgbWF4UG9vbFNpemU6IDEsIG1pblBvb2xTaXplOiAxIH1cbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGlzTWFzdGVyRG9jID0gYXdhaXQgdGhpcy5fb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uIS5kYlxuICAgICAgICAuYWRtaW4oKVxuICAgICAgICAuY29tbWFuZCh7IGlzbWFzdGVyOiAxIH0pO1xuXG4gICAgICBpZiAoIShpc01hc3RlckRvYyAmJiBpc01hc3RlckRvYy5zZXROYW1lKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIkTU9OR09fT1BMT0dfVVJMIG11c3QgYmUgc2V0IHRvIHRoZSAnbG9jYWwnIGRhdGFiYXNlIG9mIGEgTW9uZ28gcmVwbGljYSBzZXRcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxhc3RPcGxvZ0VudHJ5ID0gYXdhaXQgdGhpcy5fb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uLmZpbmRPbmVBc3luYyhcbiAgICAgICAgT1BMT0dfQ09MTEVDVElPTixcbiAgICAgICAge30sXG4gICAgICAgIHsgc29ydDogeyAkbmF0dXJhbDogLTEgfSwgcHJvamVjdGlvbjogeyB0czogMSB9IH1cbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IG9wbG9nU2VsZWN0b3IgPSB0aGlzLl9nZXRPcGxvZ1NlbGVjdG9yKGxhc3RPcGxvZ0VudHJ5Py50cyk7XG4gICAgICBpZiAobGFzdE9wbG9nRW50cnkpIHtcbiAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFRTID0gbGFzdE9wbG9nRW50cnkudHM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnNvckRlc2NyaXB0aW9uID0gbmV3IEN1cnNvckRlc2NyaXB0aW9uKFxuICAgICAgICBPUExPR19DT0xMRUNUSU9OLFxuICAgICAgICBvcGxvZ1NlbGVjdG9yLFxuICAgICAgICB7IHRhaWxhYmxlOiB0cnVlIH1cbiAgICAgICk7XG5cbiAgICAgIHRoaXMuX3RhaWxIYW5kbGUgPSB0aGlzLl9vcGxvZ1RhaWxDb25uZWN0aW9uLnRhaWwoXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLFxuICAgICAgICAoZG9jOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbnRyeVF1ZXVlLnB1c2goZG9jKTtcbiAgICAgICAgICB0aGlzLl9tYXliZVN0YXJ0V29ya2VyKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFRBSUxfVElNRU9VVFxuICAgICAgKTtcblxuICAgICAgdGhpcy5fcmVhZHlQcm9taXNlUmVzb2x2ZXIhKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIF9zdGFydFRhaWxpbmc6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbWF5YmVTdGFydFdvcmtlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd29ya2VyUHJvbWlzZSkgcmV0dXJuO1xuICAgIHRoaXMuX3dvcmtlckFjdGl2ZSA9IHRydWU7XG5cbiAgICAvLyBDb252ZXJ0IHRvIGEgcHJvcGVyIHByb21pc2UtYmFzZWQgcXVldWUgcHJvY2Vzc29yXG4gICAgdGhpcy5fd29ya2VyUHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB3aGlsZSAoIXRoaXMuX3N0b3BwZWQgJiYgIXRoaXMuX2VudHJ5UXVldWUuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgLy8gQXJlIHdlIHRvbyBmYXIgYmVoaW5kPyBKdXN0IHRlbGwgb3VyIG9ic2VydmVycyB0aGF0IHRoZXkgbmVlZCB0b1xuICAgICAgICAgIC8vIHJlcG9sbCwgYW5kIGRyb3Agb3VyIHF1ZXVlLlxuICAgICAgICAgIGlmICh0aGlzLl9lbnRyeVF1ZXVlLmxlbmd0aCA+IFRPT19GQVJfQkVISU5EKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0RW50cnkgPSB0aGlzLl9lbnRyeVF1ZXVlLnBvcCgpO1xuICAgICAgICAgICAgdGhpcy5fZW50cnlRdWV1ZS5jbGVhcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9vblNraXBwZWRFbnRyaWVzSG9vay5lYWNoKChjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRnJlZSBhbnkgd2FpdFVudGlsQ2F1Z2h0VXAoKSBjYWxscyB0aGF0IHdlcmUgd2FpdGluZyBmb3IgdXMgdG9cbiAgICAgICAgICAgIC8vIHBhc3Mgc29tZXRoaW5nIHRoYXQgd2UganVzdCBza2lwcGVkLlxuICAgICAgICAgICAgdGhpcy5fc2V0TGFzdFByb2Nlc3NlZFRTKGxhc3RFbnRyeS50cyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQcm9jZXNzIG5leHQgYmF0Y2ggZnJvbSB0aGUgcXVldWVcbiAgICAgICAgICBjb25zdCBkb2MgPSB0aGlzLl9lbnRyeVF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaGFuZGxlRG9jKHRoaXMsIGRvYyk7XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGFueSB3YWl0aW5nIGZlbmNlIGNhbGxiYWNrc1xuICAgICAgICAgICAgaWYgKGRvYy50cykge1xuICAgICAgICAgICAgICB0aGlzLl9zZXRMYXN0UHJvY2Vzc2VkVFMoZG9jLnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHByb2Nlc3NpbmcgcXVldWUgZXZlbiBpZiBvbmUgZW50cnkgZmFpbHNcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3Npbmcgb3Bsb2cgZW50cnk6JywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl93b3JrZXJQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fd29ya2VyQWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfVxuXG4gIF9zZXRMYXN0UHJvY2Vzc2VkVFModHM6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRUUyA9IHRzO1xuICAgIHdoaWxlICghaXNFbXB0eSh0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzKSAmJiB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzWzBdLnRzLmxlc3NUaGFuT3JFcXVhbCh0aGlzLl9sYXN0UHJvY2Vzc2VkVFMpKSB7XG4gICAgICBjb25zdCBzZXF1ZW5jZXIgPSB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLnNoaWZ0KCkhO1xuICAgICAgc2VxdWVuY2VyLnJlc29sdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgX2RlZmluZVRvb0ZhckJlaGluZCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgVE9PX0ZBUl9CRUhJTkQgPSB2YWx1ZTtcbiAgfVxuXG4gIF9yZXNldFRvb0ZhckJlaGluZCgpOiB2b2lkIHtcbiAgICBUT09fRkFSX0JFSElORCA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX09QTE9HX1RPT19GQVJfQkVISU5EIHx8IDIwMDApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZEZvck9wKG9wOiBPcGxvZ0VudHJ5KTogc3RyaW5nIHtcbiAgaWYgKG9wLm9wID09PSAnZCcgfHwgb3Aub3AgPT09ICdpJykge1xuICAgIHJldHVybiBvcC5vLl9pZDtcbiAgfSBlbHNlIGlmIChvcC5vcCA9PT0gJ3UnKSB7XG4gICAgcmV0dXJuIG9wLm8yLl9pZDtcbiAgfSBlbHNlIGlmIChvcC5vcCA9PT0gJ2MnKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJPcGVyYXRvciAnYycgZG9lc24ndCBzdXBwbHkgYW4gb2JqZWN0IHdpdGggaWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkob3ApKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcihcIlVua25vd24gb3A6IFwiICsgSlNPTi5zdHJpbmdpZnkob3ApKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEb2MoaGFuZGxlOiBPcGxvZ0hhbmRsZSwgZG9jOiBPcGxvZ0VudHJ5KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChkb2MubnMgPT09IFwiYWRtaW4uJGNtZFwiKSB7XG4gICAgaWYgKGRvYy5vLmFwcGx5T3BzKSB7XG4gICAgICAvLyBUaGlzIHdhcyBhIHN1Y2Nlc3NmdWwgdHJhbnNhY3Rpb24sIHNvIHdlIG5lZWQgdG8gYXBwbHkgdGhlXG4gICAgICAvLyBvcGVyYXRpb25zIHRoYXQgd2VyZSBpbnZvbHZlZC5cbiAgICAgIGxldCBuZXh0VGltZXN0YW1wID0gZG9jLnRzO1xuICAgICAgZm9yIChjb25zdCBvcCBvZiBkb2Muby5hcHBseU9wcykge1xuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzEwNDIwLlxuICAgICAgICBpZiAoIW9wLnRzKSB7XG4gICAgICAgICAgb3AudHMgPSBuZXh0VGltZXN0YW1wO1xuICAgICAgICAgIG5leHRUaW1lc3RhbXAgPSBuZXh0VGltZXN0YW1wLmFkZChMb25nLk9ORSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBmb3J3YXJkIHN1Yi1vcHMgd2hvc2UgbnMgaXMgYWxsb3dlZFxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzEzOTQ1XG4gICAgICAgIGlmICghaGFuZGxlWydfbnNBbGxvd2VkJ10ob3AubnMpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgaGFuZGxlRG9jKGhhbmRsZSwgb3ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGNvbW1hbmQgXCIgKyBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgfVxuXG4gIGNvbnN0IHRyaWdnZXI6IE9wbG9nVHJpZ2dlciA9IHtcbiAgICBkcm9wQ29sbGVjdGlvbjogZmFsc2UsXG4gICAgZHJvcERhdGFiYXNlOiBmYWxzZSxcbiAgICBvcDogZG9jLFxuICB9O1xuXG4gIGlmICh0eXBlb2YgZG9jLm5zID09PSBcInN0cmluZ1wiICYmIGRvYy5ucy5zdGFydHNXaXRoKGhhbmRsZS5fZGJOYW1lICsgXCIuXCIpKSB7XG4gICAgdHJpZ2dlci5jb2xsZWN0aW9uID0gZG9jLm5zLnNsaWNlKGhhbmRsZS5fZGJOYW1lLmxlbmd0aCArIDEpO1xuICB9XG5cbiAgLy8gSXMgaXQgYSBzcGVjaWFsIGNvbW1hbmQgYW5kIHRoZSBjb2xsZWN0aW9uIG5hbWUgaXMgaGlkZGVuXG4gIC8vIHNvbWV3aGVyZSBpbiBvcGVyYXRvcj9cbiAgaWYgKHRyaWdnZXIuY29sbGVjdGlvbiA9PT0gXCIkY21kXCIpIHtcbiAgICBpZiAoZG9jLm8uZHJvcERhdGFiYXNlKSB7XG4gICAgICBkZWxldGUgdHJpZ2dlci5jb2xsZWN0aW9uO1xuICAgICAgdHJpZ2dlci5kcm9wRGF0YWJhc2UgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoXCJkcm9wXCIgaW4gZG9jLm8pIHtcbiAgICAgIHRyaWdnZXIuY29sbGVjdGlvbiA9IGRvYy5vLmRyb3A7XG4gICAgICB0cmlnZ2VyLmRyb3BDb2xsZWN0aW9uID0gdHJ1ZTtcbiAgICAgIHRyaWdnZXIuaWQgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoXCJjcmVhdGVcIiBpbiBkb2MubyAmJiBcImlkSW5kZXhcIiBpbiBkb2Mubykge1xuICAgICAgLy8gQSBjb2xsZWN0aW9uIGdvdCBpbXBsaWNpdGx5IGNyZWF0ZWQgd2l0aGluIGEgdHJhbnNhY3Rpb24uIFRoZXJlJ3NcbiAgICAgIC8vIG5vIG5lZWQgdG8gZG8gYW55dGhpbmcgYWJvdXQgaXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiVW5rbm93biBjb21tYW5kIFwiICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEFsbCBvdGhlciBvcHMgaGF2ZSBhbiBpZC5cbiAgICB0cmlnZ2VyLmlkID0gaWRGb3JPcChkb2MpO1xuICB9XG5cbiAgYXdhaXQgaGFuZGxlLl9jcm9zc2Jhci5maXJlKHRyaWdnZXIpO1xuXG4gIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0SW1tZWRpYXRlKHJlc29sdmUpKTtcbn0iLCJpbXBvcnQgaXNFbXB0eSBmcm9tIFwibG9kYXNoLmlzZW1wdHlcIjtcbmltcG9ydCB7IEVKU09OIH0gZnJvbSBcIm1ldGVvci9lanNvblwiO1xuaW1wb3J0IHsgT2JzZXJ2ZUhhbmRsZSB9IGZyb20gXCIuL29ic2VydmVfaGFuZGxlXCI7XG5cbmludGVyZmFjZSBPYnNlcnZlTXVsdGlwbGV4ZXJPcHRpb25zIHtcbiAgb3JkZXJlZDogYm9vbGVhbjtcbiAgb25TdG9wPzogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrID1cbiAgfCBcImFkZGVkXCJcbiAgfCBcImFkZGVkQmVmb3JlXCJcbiAgfCBcImNoYW5nZWRcIlxuICB8IFwibW92ZWRCZWZvcmVcIlxuICB8IFwicmVtb3ZlZFwiO1xuXG4vKipcbiAqIEFsbG93cyBtdWx0aXBsZSBpZGVudGljYWwgT2JzZXJ2ZUhhbmRsZXMgdG8gYmUgZHJpdmVuIGJ5IGEgc2luZ2xlIG9ic2VydmUgZHJpdmVyLlxuICpcbiAqIFRoaXMgb3B0aW1pemF0aW9uIGVuc3VyZXMgdGhhdCBtdWx0aXBsZSBpZGVudGljYWwgb2JzZXJ2YXRpb25zXG4gKiBkb24ndCByZXN1bHQgaW4gZHVwbGljYXRlIGRhdGFiYXNlIHF1ZXJpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBPYnNlcnZlTXVsdGlwbGV4ZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IF9vcmRlcmVkOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IF9vblN0b3A6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgX3F1ZXVlOiBhbnk7XG4gIHByaXZhdGUgX2hhbmRsZXM6IHsgW2tleTogc3RyaW5nXTogT2JzZXJ2ZUhhbmRsZSB9IHwgbnVsbDtcbiAgcHJpdmF0ZSBfcmVzb2x2ZXI6ICgodmFsdWU/OiB1bmtub3duKSA9PiB2b2lkKSB8IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3JlYWR5UHJvbWlzZTogUHJvbWlzZTxib29sZWFuIHwgdm9pZD47XG4gIHByaXZhdGUgX2lzUmVhZHk6IGJvb2xlYW47XG4gIHByaXZhdGUgX2NhY2hlOiBhbnk7XG4gIHByaXZhdGUgX2FkZEhhbmRsZVRhc2tzU2NoZWR1bGVkQnV0Tm90UGVyZm9ybWVkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoeyBvcmRlcmVkLCBvblN0b3AgPSAoKSA9PiB7fSB9OiBPYnNlcnZlTXVsdGlwbGV4ZXJPcHRpb25zKSB7XG4gICAgaWYgKG9yZGVyZWQgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoXCJtdXN0IHNwZWNpZnkgb3JkZXJlZFwiKTtcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBQYWNrYWdlW1wiZmFjdHMtYmFzZVwiXSAmJlxuICAgICAgUGFja2FnZVtcImZhY3RzLWJhc2VcIl0uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgICAgXCJtb25nby1saXZlZGF0YVwiLFxuICAgICAgICBcIm9ic2VydmUtbXVsdGlwbGV4ZXJzXCIsXG4gICAgICAgIDFcbiAgICAgICk7XG5cbiAgICB0aGlzLl9vcmRlcmVkID0gb3JkZXJlZDtcbiAgICB0aGlzLl9vblN0b3AgPSBvblN0b3A7XG4gICAgdGhpcy5fcXVldWUgPSBuZXcgTWV0ZW9yLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuICAgIHRoaXMuX2hhbmRsZXMgPSB7fTtcbiAgICB0aGlzLl9yZXNvbHZlciA9IG51bGw7XG4gICAgdGhpcy5faXNSZWFkeSA9IGZhbHNlO1xuICAgIHRoaXMuX3JlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyKSA9PiAodGhpcy5fcmVzb2x2ZXIgPSByKSkudGhlbihcbiAgICAgICgpID0+ICh0aGlzLl9pc1JlYWR5ID0gdHJ1ZSlcbiAgICApO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLl9jYWNoZSA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0NhY2hpbmdDaGFuZ2VPYnNlcnZlcih7IG9yZGVyZWQgfSk7XG4gICAgdGhpcy5fYWRkSGFuZGxlVGFza3NTY2hlZHVsZWRCdXROb3RQZXJmb3JtZWQgPSAwO1xuXG4gICAgdGhpcy5jYWxsYmFja05hbWVzKCkuZm9yRWFjaCgoY2FsbGJhY2tOYW1lKSA9PiB7XG4gICAgICAodGhpcyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgdGhpcy5fYXBwbHlDYWxsYmFjayhjYWxsYmFja05hbWUsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyhoYW5kbGU6IE9ic2VydmVIYW5kbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzKGhhbmRsZSk7XG4gIH1cblxuICBhc3luYyBfYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzKGhhbmRsZTogT2JzZXJ2ZUhhbmRsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICsrdGhpcy5fYWRkSGFuZGxlVGFza3NTY2hlZHVsZWRCdXROb3RQZXJmb3JtZWQ7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVtcImZhY3RzLWJhc2VcIl0gJiZcbiAgICAgIFBhY2thZ2VbXCJmYWN0cy1iYXNlXCJdLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIixcbiAgICAgICAgXCJvYnNlcnZlLWhhbmRsZXNcIixcbiAgICAgICAgMVxuICAgICAgKTtcblxuICAgIGF3YWl0IHRoaXMuX3F1ZXVlLnJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgdGhpcy5faGFuZGxlcyFbaGFuZGxlLl9pZF0gPSBoYW5kbGU7XG4gICAgICBhd2FpdCB0aGlzLl9zZW5kQWRkcyhoYW5kbGUpO1xuICAgICAgLS10aGlzLl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZDtcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuX3JlYWR5UHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUhhbmRsZShpZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLl9yZWFkeSgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVtb3ZlIGhhbmRsZXMgdW50aWwgdGhlIG11bHRpcGxleCBpcyByZWFkeVwiKTtcblxuICAgIGRlbGV0ZSB0aGlzLl9oYW5kbGVzIVtpZF07XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVtcImZhY3RzLWJhc2VcIl0gJiZcbiAgICAgIFBhY2thZ2VbXCJmYWN0cy1iYXNlXCJdLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIixcbiAgICAgICAgXCJvYnNlcnZlLWhhbmRsZXNcIixcbiAgICAgICAgLTFcbiAgICAgICk7XG5cbiAgICBpZiAoXG4gICAgICBpc0VtcHR5KHRoaXMuX2hhbmRsZXMpICYmXG4gICAgICB0aGlzLl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZCA9PT0gMFxuICAgICkge1xuICAgICAgYXdhaXQgdGhpcy5fc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zdG9wKG9wdGlvbnM6IHsgZnJvbVF1ZXJ5RXJyb3I/OiBib29sZWFuIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fcmVhZHkoKSAmJiAhb3B0aW9ucy5mcm9tUXVlcnlFcnJvcilcbiAgICAgIHRocm93IEVycm9yKFwic3VycHJpc2luZyBfc3RvcDogbm90IHJlYWR5XCIpO1xuXG4gICAgYXdhaXQgdGhpcy5fb25TdG9wKCk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVtcImZhY3RzLWJhc2VcIl0gJiZcbiAgICAgIFBhY2thZ2VbXCJmYWN0cy1iYXNlXCJdLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIixcbiAgICAgICAgXCJvYnNlcnZlLW11bHRpcGxleGVyc1wiLFxuICAgICAgICAtMVxuICAgICAgKTtcblxuICAgIHRoaXMuX2hhbmRsZXMgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgcmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcXVldWUucXVldWVUYXNrKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9yZWFkeSgpKVxuICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IG1ha2UgT2JzZXJ2ZU11bHRpcGxleCByZWFkeSB0d2ljZSFcIik7XG5cbiAgICAgIGlmICghdGhpcy5fcmVzb2x2ZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyByZXNvbHZlclwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmVzb2x2ZXIoKTtcbiAgICAgIHRoaXMuX2lzUmVhZHkgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcXVlcnlFcnJvcihlcnI6IEVycm9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcXVldWUucnVuVGFzaygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fcmVhZHkoKSlcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBjbGFpbSBxdWVyeSBoYXMgYW4gZXJyb3IgYWZ0ZXIgaXQgd29ya2VkIVwiKTtcbiAgICAgIHRoaXMuX3N0b3AoeyBmcm9tUXVlcnlFcnJvcjogdHJ1ZSB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uRmx1c2goY2I6ICgpID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBVc2UgcnVuVGFzaywgbm90IHF1ZXVlVGFzazogcXVldWVUYXNrIHJldHVybnMgdm9pZCBzbyBgYXdhaXRgIHJlc29sdmVzXG4gICAgLy8gaW1tZWRpYXRlbHkgYW5kIHRoZSBjYiBydW5zIGFzIGZpcmUtYW5kLWZvcmdldC4gQ2FsbGVycyAoZS5nLlxuICAgIC8vIENoYW5nZVN0cmVhbU9ic2VydmVEcml2ZXIub25CZWZvcmVGaXJlKSByZWx5IG9uIGBhd2FpdCBvbkZsdXNoKC4uLilgXG4gICAgLy8gYWN0dWFsbHkgd2FpdGluZyBmb3IgdGhlIGNiIHRvIGNvbW1pdCBpdHMgd3JpdGUg4oCUIHdpdGhvdXQgdGhpcywgZmVuY2VzXG4gICAgLy8gZmlyZSBiZWZvcmUgcXVldWVkIGNvbW1pdHMgcnVuIGFuZCB3ZSBsb3NlIGJhY2twcmVzc3VyZS5cbiAgICBhd2FpdCB0aGlzLl9xdWV1ZS5ydW5UYXNrKGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fcmVhZHkoKSlcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJvbmx5IGNhbGwgb25GbHVzaCBvbiBhIG11bHRpcGxleGVyIHRoYXQgd2lsbCBiZSByZWFkeVwiKTtcbiAgICAgIGF3YWl0IGNiKCk7XG4gICAgfSk7XG4gIH1cblxuICBjYWxsYmFja05hbWVzKCk6IE9ic2VydmVIYW5kbGVDYWxsYmFja1tdIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJlZFxuICAgICAgPyBbXCJhZGRlZEJlZm9yZVwiLCBcImNoYW5nZWRcIiwgXCJtb3ZlZEJlZm9yZVwiLCBcInJlbW92ZWRcIl1cbiAgICAgIDogW1wiYWRkZWRcIiwgXCJjaGFuZ2VkXCIsIFwicmVtb3ZlZFwiXTtcbiAgfVxuXG4gIF9yZWFkeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9pc1JlYWR5O1xuICB9XG5cbiAgX2FwcGx5Q2FsbGJhY2soY2FsbGJhY2tOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgLy8gVXBkYXRlIGNhY2hlIFNZTkNIUk9OT1VTTFkgc28gaXQncyBpbW1lZGlhdGVseSBhdmFpbGFibGUgZm9yIHN1YnNlcXVlbnRcbiAgICAvLyBvcGVyYXRpb25zLiBUaGlzIHByZXZlbnRzIHJhY2UgY29uZGl0aW9ucyB3aGVyZSBhbiB1cGRhdGUgZXZlbnQgYXJyaXZlc1xuICAgIC8vIGJlZm9yZSB0aGUgaW5zZXJ0IGhhcyBiZWVuIHJlY29yZGVkIGluIHRoZSBjYWNoZS5cbiAgICB0aGlzLl9jYWNoZS5hcHBseUNoYW5nZVtjYWxsYmFja05hbWVdLmFwcGx5KG51bGwsIGFyZ3MpO1xuXG4gICAgLy8gUXVldWUgdGhlIGNhbGxiYWNrIG5vdGlmaWNhdGlvbnMgYXN5bmNocm9ub3VzbHlcbiAgICB0aGlzLl9xdWV1ZS5xdWV1ZVRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9oYW5kbGVzKSByZXR1cm47XG5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuX3JlYWR5KCkgJiZcbiAgICAgICAgY2FsbGJhY2tOYW1lICE9PSBcImFkZGVkXCIgJiZcbiAgICAgICAgY2FsbGJhY2tOYW1lICE9PSBcImFkZGVkQmVmb3JlXCJcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEdvdCAke2NhbGxiYWNrTmFtZX0gZHVyaW5nIGluaXRpYWwgYWRkc2ApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGhhbmRsZUlkIG9mIE9iamVjdC5rZXlzKHRoaXMuX2hhbmRsZXMpKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZSA9IHRoaXMuX2hhbmRsZXMgJiYgdGhpcy5faGFuZGxlc1toYW5kbGVJZF07XG5cbiAgICAgICAgaWYgKCFoYW5kbGUpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjYWxsYmFjayA9IChoYW5kbGUgYXMgYW55KVtgXyR7Y2FsbGJhY2tOYW1lfWBdO1xuXG4gICAgICAgIGlmICghY2FsbGJhY2spIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhbGxiYWNrLmFwcGx5KFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgaGFuZGxlLm5vbk11dGF0aW5nQ2FsbGJhY2tzID8gYXJncyA6IEVKU09OLmNsb25lKGFyZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHJlc3VsdCAmJiBNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAgICAgcmVzdWx0LmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgYEVycm9yIGluIG9ic2VydmVDaGFuZ2VzIGNhbGxiYWNrICR7Y2FsbGJhY2tOYW1lfTpgLFxuICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGUuaW5pdGlhbEFkZHNTZW50LnRoZW4ocmVzdWx0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9zZW5kQWRkcyhoYW5kbGU6IE9ic2VydmVIYW5kbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBhZGQgPSB0aGlzLl9vcmRlcmVkID8gaGFuZGxlLl9hZGRlZEJlZm9yZSA6IGhhbmRsZS5fYWRkZWQ7XG4gICAgaWYgKCFhZGQpIHJldHVybjtcblxuICAgIGNvbnN0IGFkZFByb21pc2VzOiAoUHJvbWlzZTx2b2lkPiB8IHZvaWQpW10gPSBbXTtcblxuICAgIC8vIG5vdGU6IGRvY3MgbWF5IGJlIGFuIF9JZE1hcCBvciBhbiBPcmRlcmVkRGljdFxuICAgIHRoaXMuX2NhY2hlLmRvY3MuZm9yRWFjaCgoZG9jOiBhbnksIGlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghKGhhbmRsZS5faWQgaW4gdGhpcy5faGFuZGxlcyEpKSB7XG4gICAgICAgIHRocm93IEVycm9yKFwiaGFuZGxlIGdvdCByZW1vdmVkIGJlZm9yZSBzZW5kaW5nIGluaXRpYWwgYWRkcyFcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgX2lkLCAuLi5maWVsZHMgfSA9IGhhbmRsZS5ub25NdXRhdGluZ0NhbGxiYWNrc1xuICAgICAgICA/IGRvY1xuICAgICAgICA6IEVKU09OLmNsb25lKGRvYyk7XG5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgciA9IHRoaXMuX29yZGVyZWQgPyBhZGQoaWQsIGZpZWxkcywgbnVsbCkgOiBhZGQoaWQsIGZpZWxkcyk7XG4gICAgICAgICAgcmVzb2x2ZShyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgYWRkUHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChhZGRQcm9taXNlcykudGhlbigocCkgPT4ge1xuICAgICAgcC5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGFkZHMgZm9yIGhhbmRsZTogJHtyZXN1bHQucmVhc29ufWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGhhbmRsZS5pbml0aWFsQWRkc1NlbnRSZXNvbHZlcigpO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgRG9jRmV0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKG1vbmdvQ29ubmVjdGlvbikge1xuICAgIHRoaXMuX21vbmdvQ29ubmVjdGlvbiA9IG1vbmdvQ29ubmVjdGlvbjtcbiAgICAvLyBNYXAgZnJvbSBvcCAtPiBbY2FsbGJhY2tdXG4gICAgdGhpcy5fY2FsbGJhY2tzRm9yT3AgPSBuZXcgTWFwKCk7XG4gIH1cblxuICAvLyBGZXRjaGVzIGRvY3VtZW50IFwiaWRcIiBmcm9tIGNvbGxlY3Rpb25OYW1lLCByZXR1cm5pbmcgaXQgb3IgbnVsbCBpZiBub3RcbiAgLy8gZm91bmQuXG4gIC8vXG4gIC8vIElmIHlvdSBtYWtlIG11bHRpcGxlIGNhbGxzIHRvIGZldGNoKCkgd2l0aCB0aGUgc2FtZSBvcCByZWZlcmVuY2UsXG4gIC8vIERvY0ZldGNoZXIgbWF5IGFzc3VtZSB0aGF0IHRoZXkgYWxsIHJldHVybiB0aGUgc2FtZSBkb2N1bWVudC4gKEl0IGRvZXNcbiAgLy8gbm90IGNoZWNrIHRvIHNlZSBpZiBjb2xsZWN0aW9uTmFtZS9pZCBtYXRjaC4pXG4gIC8vXG4gIC8vIFlvdSBtYXkgYXNzdW1lIHRoYXQgY2FsbGJhY2sgaXMgbmV2ZXIgY2FsbGVkIHN5bmNocm9ub3VzbHkgKGFuZCBpbiBmYWN0XG4gIC8vIE9wbG9nT2JzZXJ2ZURyaXZlciBkb2VzIHNvKS5cbiAgYXN5bmMgZmV0Y2goY29sbGVjdGlvbk5hbWUsIGlkLCBvcCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIFxuICAgIGNoZWNrKGNvbGxlY3Rpb25OYW1lLCBTdHJpbmcpO1xuICAgIGNoZWNrKG9wLCBPYmplY3QpO1xuXG5cbiAgICAvLyBJZiB0aGVyZSdzIGFscmVhZHkgYW4gaW4tcHJvZ3Jlc3MgZmV0Y2ggZm9yIHRoaXMgY2FjaGUga2V5LCB5aWVsZCB1bnRpbFxuICAgIC8vIGl0J3MgZG9uZSBhbmQgcmV0dXJuIHdoYXRldmVyIGl0IHJldHVybnMuXG4gICAgaWYgKHNlbGYuX2NhbGxiYWNrc0Zvck9wLmhhcyhvcCkpIHtcbiAgICAgIHNlbGYuX2NhbGxiYWNrc0Zvck9wLmdldChvcCkucHVzaChjYWxsYmFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2FsbGJhY2tzID0gW2NhbGxiYWNrXTtcbiAgICBzZWxmLl9jYWxsYmFja3NGb3JPcC5zZXQob3AsIGNhbGxiYWNrcyk7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIGRvYyA9XG4gICAgICAgIChhd2FpdCBzZWxmLl9tb25nb0Nvbm5lY3Rpb24uZmluZE9uZUFzeW5jKGNvbGxlY3Rpb25OYW1lLCB7XG4gICAgICAgICAgX2lkOiBpZCxcbiAgICAgICAgfSkpIHx8IG51bGw7XG4gICAgICAvLyBSZXR1cm4gZG9jIHRvIGFsbCByZWxldmFudCBjYWxsYmFja3MuIE5vdGUgdGhhdCB0aGlzIGFycmF5IGNhblxuICAgICAgLy8gY29udGludWUgdG8gZ3JvdyBkdXJpbmcgY2FsbGJhY2sgZXhjZWN1dGlvbi5cbiAgICAgIHdoaWxlIChjYWxsYmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBDbG9uZSB0aGUgZG9jdW1lbnQgc28gdGhhdCB0aGUgdmFyaW91cyBjYWxscyB0byBmZXRjaCBkb24ndCByZXR1cm5cbiAgICAgICAgLy8gb2JqZWN0cyB0aGF0IGFyZSBpbnRlcnR3aW5nbGVkIHdpdGggZWFjaCBvdGhlci4gQ2xvbmUgYmVmb3JlXG4gICAgICAgIC8vIHBvcHBpbmcgdGhlIGZ1dHVyZSwgc28gdGhhdCBpZiBjbG9uZSB0aHJvd3MsIHRoZSBlcnJvciBnZXRzIHBhc3NlZFxuICAgICAgICAvLyB0byB0aGUgbmV4dCBjYWxsYmFjay5cbiAgICAgICAgY2FsbGJhY2tzLnBvcCgpKG51bGwsIEVKU09OLmNsb25lKGRvYykpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdoaWxlIChjYWxsYmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjYWxsYmFja3MucG9wKCkoZSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFhYWCBjb25zaWRlciBrZWVwaW5nIHRoZSBkb2MgYXJvdW5kIGZvciBhIHBlcmlvZCBvZiB0aW1lIGJlZm9yZVxuICAgICAgLy8gcmVtb3ZpbmcgZnJvbSB0aGUgY2FjaGVcbiAgICAgIHNlbGYuX2NhbGxiYWNrc0Zvck9wLmRlbGV0ZShvcCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoLnRocm90dGxlJztcbmltcG9ydCB7IGxpc3RlbkFsbCB9IGZyb20gJy4vbW9uZ29fZHJpdmVyJztcbmltcG9ydCB7IE9ic2VydmVNdWx0aXBsZXhlciB9IGZyb20gJy4vb2JzZXJ2ZV9tdWx0aXBsZXgnO1xuXG5pbnRlcmZhY2UgUG9sbGluZ09ic2VydmVEcml2ZXJPcHRpb25zIHtcbiAgY3Vyc29yRGVzY3JpcHRpb246IGFueTtcbiAgbW9uZ29IYW5kbGU6IGFueTtcbiAgb3JkZXJlZDogYm9vbGVhbjtcbiAgbXVsdGlwbGV4ZXI6IE9ic2VydmVNdWx0aXBsZXhlcjtcbiAgX3Rlc3RPbmx5UG9sbENhbGxiYWNrPzogKCkgPT4gdm9pZDtcbn1cblxuY29uc3QgUE9MTElOR19USFJPVFRMRV9NUyA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX1BPTExJTkdfVEhST1RUTEVfTVMgfHwgJycpIHx8IDUwO1xuY29uc3QgUE9MTElOR19JTlRFUlZBTF9NUyA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX1BPTExJTkdfSU5URVJWQUxfTVMgfHwgJycpIHx8IDEwICogMTAwMDtcblxuLyoqXG4gKiBAY2xhc3MgUG9sbGluZ09ic2VydmVEcml2ZXJcbiAqXG4gKiBPbmUgb2YgdHdvIG9ic2VydmUgZHJpdmVyIGltcGxlbWVudGF0aW9ucy5cbiAqXG4gKiBDaGFyYWN0ZXJpc3RpY3M6XG4gKiAtIENhY2hlcyB0aGUgcmVzdWx0cyBvZiBhIHF1ZXJ5XG4gKiAtIFJlcnVucyB0aGUgcXVlcnkgd2hlbiBuZWNlc3NhcnlcbiAqIC0gU3VpdGFibGUgZm9yIGNhc2VzIHdoZXJlIG9wbG9nIHRhaWxpbmcgaXMgbm90IGF2YWlsYWJsZSBvciBwcmFjdGljYWxcbiAqL1xuZXhwb3J0IGNsYXNzIFBvbGxpbmdPYnNlcnZlRHJpdmVyIHtcbiAgcHJpdmF0ZSBfb3B0aW9uczogUG9sbGluZ09ic2VydmVEcml2ZXJPcHRpb25zO1xuICBwcml2YXRlIF9jdXJzb3JEZXNjcmlwdGlvbjogYW55O1xuICBwcml2YXRlIF9tb25nb0hhbmRsZTogYW55O1xuICBwcml2YXRlIF9vcmRlcmVkOiBib29sZWFuO1xuICBwcml2YXRlIF9tdWx0aXBsZXhlcjogYW55O1xuICBwcml2YXRlIF9zdG9wQ2FsbGJhY2tzOiBBcnJheTwoKSA9PiBQcm9taXNlPHZvaWQ+PjtcbiAgcHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfY3Vyc29yOiBhbnk7XG4gIHByaXZhdGUgX3Jlc3VsdHM6IGFueTtcbiAgcHJpdmF0ZSBfcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkOiBudW1iZXI7XG4gIHByaXZhdGUgX3BlbmRpbmdXcml0ZXM6IGFueVtdO1xuICBwcml2YXRlIF9lbnN1cmVQb2xsSXNTY2hlZHVsZWQ6IEZ1bmN0aW9uO1xuICBwcml2YXRlIF90YXNrUXVldWU6IGFueTtcbiAgcHJpdmF0ZSBfdGVzdE9ubHlQb2xsQ2FsbGJhY2s/OiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBvbGxpbmdPYnNlcnZlRHJpdmVyT3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uID0gb3B0aW9ucy5jdXJzb3JEZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9tb25nb0hhbmRsZSA9IG9wdGlvbnMubW9uZ29IYW5kbGU7XG4gICAgdGhpcy5fb3JkZXJlZCA9IG9wdGlvbnMub3JkZXJlZDtcbiAgICB0aGlzLl9tdWx0aXBsZXhlciA9IG9wdGlvbnMubXVsdGlwbGV4ZXI7XG4gICAgdGhpcy5fc3RvcENhbGxiYWNrcyA9IFtdO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2N1cnNvciA9IHRoaXMuX21vbmdvSGFuZGxlLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IoXG4gICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbik7XG5cbiAgICB0aGlzLl9yZXN1bHRzID0gbnVsbDtcbiAgICB0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgPSAwO1xuICAgIHRoaXMuX3BlbmRpbmdXcml0ZXMgPSBbXTtcblxuICAgIHRoaXMuX2Vuc3VyZVBvbGxJc1NjaGVkdWxlZCA9IHRocm90dGxlKFxuICAgICAgdGhpcy5fdW50aHJvdHRsZWRFbnN1cmVQb2xsSXNTY2hlZHVsZWQuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucG9sbGluZ1Rocm90dGxlTXMgfHwgUE9MTElOR19USFJPVFRMRV9NU1xuICAgICk7XG5cbiAgICB0aGlzLl90YXNrUXVldWUgPSBuZXcgKE1ldGVvciBhcyBhbnkpLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuICB9XG5cbiAgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgY29uc3QgbGlzdGVuZXJzSGFuZGxlID0gYXdhaXQgbGlzdGVuQWxsKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24sXG4gICAgICAobm90aWZpY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZmVuY2UgPSAoRERQU2VydmVyIGFzIGFueSkuX2dldEN1cnJlbnRGZW5jZSgpO1xuICAgICAgICBpZiAoZmVuY2UpIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nV3JpdGVzLnB1c2goZmVuY2UuYmVnaW5Xcml0ZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZW5zdXJlUG9sbElzU2NoZWR1bGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5fc3RvcENhbGxiYWNrcy5wdXNoKGFzeW5jICgpID0+IHsgYXdhaXQgbGlzdGVuZXJzSGFuZGxlLnN0b3AoKTsgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrID0gb3B0aW9ucy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBvbGxpbmdJbnRlcnZhbCA9XG4gICAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucG9sbGluZ0ludGVydmFsTXMgfHxcbiAgICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5fcG9sbGluZ0ludGVydmFsIHx8XG4gICAgICAgIFBPTExJTkdfSU5URVJWQUxfTVM7XG5cbiAgICAgIGNvbnN0IGludGVydmFsSGFuZGxlID0gTWV0ZW9yLnNldEludGVydmFsKFxuICAgICAgICB0aGlzLl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQuYmluZCh0aGlzKSxcbiAgICAgICAgcG9sbGluZ0ludGVydmFsXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9zdG9wQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuICAgICAgICBNZXRlb3IuY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl91bnRocm90dGxlZEVuc3VyZVBvbGxJc1NjaGVkdWxlZCgpO1xuXG4gICAgKFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSBhcyBhbnkpPy5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1wb2xsaW5nXCIsIDEpO1xuICB9XG5cbiAgYXN5bmMgX3VudGhyb3R0bGVkRW5zdXJlUG9sbElzU2NoZWR1bGVkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgPiAwKSByZXR1cm47XG4gICAgKyt0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQ7XG4gICAgYXdhaXQgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fcG9sbE1vbmdvKCk7XG4gICAgfSk7XG4gIH1cblxuICBfc3VzcGVuZFBvbGxpbmcoKTogdm9pZCB7XG4gICAgKyt0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQ7XG4gICAgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soKCkgPT4ge30pO1xuXG4gICAgaWYgKHRoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBfcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkIGlzICR7dGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkfWApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9yZXN1bWVQb2xsaW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCBpcyAke3RoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZH1gKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fcG9sbE1vbmdvKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfcG9sbE1vbmdvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC0tdGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkO1xuXG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIGxldCBmaXJzdCA9IGZhbHNlO1xuICAgIGxldCBuZXdSZXN1bHRzO1xuICAgIGxldCBvbGRSZXN1bHRzID0gdGhpcy5fcmVzdWx0cztcblxuICAgIGlmICghb2xkUmVzdWx0cykge1xuICAgICAgZmlyc3QgPSB0cnVlO1xuICAgICAgb2xkUmVzdWx0cyA9IHRoaXMuX29yZGVyZWQgPyBbXSA6IG5ldyAoTG9jYWxDb2xsZWN0aW9uIGFzIGFueSkuX0lkTWFwO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrPy4oKTtcblxuICAgIGNvbnN0IHdyaXRlc0ZvckN5Y2xlID0gdGhpcy5fcGVuZGluZ1dyaXRlcztcbiAgICB0aGlzLl9wZW5kaW5nV3JpdGVzID0gW107XG5cbiAgICB0cnkge1xuICAgICAgbmV3UmVzdWx0cyA9IGF3YWl0IHRoaXMuX2N1cnNvci5nZXRSYXdPYmplY3RzKHRoaXMuX29yZGVyZWQpO1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgaWYgKGZpcnN0ICYmIHR5cGVvZihlLmNvZGUpID09PSAnbnVtYmVyJykge1xuICAgICAgICBhd2FpdCB0aGlzLl9tdWx0aXBsZXhlci5xdWVyeUVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFeGNlcHRpb24gd2hpbGUgcG9sbGluZyBxdWVyeSAke1xuICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbilcbiAgICAgICAgICAgIH06ICR7ZS5tZXNzYWdlfWBcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuX3BlbmRpbmdXcml0ZXMsIHdyaXRlc0ZvckN5Y2xlKTtcbiAgICAgIE1ldGVvci5fZGVidWcoYEV4Y2VwdGlvbiB3aGlsZSBwb2xsaW5nIHF1ZXJ5ICR7XG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uKX1gLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIChMb2NhbENvbGxlY3Rpb24gYXMgYW55KS5fZGlmZlF1ZXJ5Q2hhbmdlcyhcbiAgICAgICAgdGhpcy5fb3JkZXJlZCwgb2xkUmVzdWx0cywgbmV3UmVzdWx0cywgdGhpcy5fbXVsdGlwbGV4ZXIpO1xuICAgIH1cblxuICAgIGlmIChmaXJzdCkgdGhpcy5fbXVsdGlwbGV4ZXIucmVhZHkoKTtcblxuICAgIHRoaXMuX3Jlc3VsdHMgPSBuZXdSZXN1bHRzO1xuXG4gICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIub25GbHVzaChhc3luYyAoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHcgb2Ygd3JpdGVzRm9yQ3ljbGUpIHtcbiAgICAgICAgYXdhaXQgdy5jb21taXR0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc3RvcHBlZCA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIHRoaXMuX3N0b3BDYWxsYmFja3MpIHtcbiAgICAgIGF3YWl0IGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB3IG9mIHRoaXMuX3BlbmRpbmdXcml0ZXMpIHtcbiAgICAgIGF3YWl0IHcuY29tbWl0dGVkKCk7XG4gICAgfVxuXG4gICAgKFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSBhcyBhbnkpPy5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1wb2xsaW5nXCIsIC0xKTtcbiAgfVxufSIsImltcG9ydCBoYXMgZnJvbSAnbG9kYXNoLmhhcyc7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5pbXBvcnQgeyBvcGxvZ1YyVjFDb252ZXJ0ZXIgfSBmcm9tIFwiLi9vcGxvZ192Ml9jb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNoZWNrLCBNYXRjaCB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBDdXJzb3JEZXNjcmlwdGlvbiB9IGZyb20gJy4vY3Vyc29yX2Rlc2NyaXB0aW9uJztcbmltcG9ydCB7IGZvckVhY2hUcmlnZ2VyLCBsaXN0ZW5BbGwgfSBmcm9tICcuL21vbmdvX2RyaXZlcic7XG5pbXBvcnQgeyBDdXJzb3IgfSBmcm9tICcuL2N1cnNvcic7XG5pbXBvcnQgTG9jYWxDb2xsZWN0aW9uIGZyb20gJ21ldGVvci9taW5pbW9uZ28vbG9jYWxfY29sbGVjdGlvbic7XG5pbXBvcnQgeyBpZEZvck9wIH0gZnJvbSAnLi9vcGxvZ190YWlsaW5nJztcblxudmFyIFBIQVNFID0ge1xuICBRVUVSWUlORzogXCJRVUVSWUlOR1wiLFxuICBGRVRDSElORzogXCJGRVRDSElOR1wiLFxuICBTVEVBRFk6IFwiU1RFQURZXCJcbn07XG5cbi8vIEV4Y2VwdGlvbiB0aHJvd24gYnkgX25lZWRUb1BvbGxRdWVyeSB3aGljaCB1bnJvbGxzIHRoZSBzdGFjayB1cCB0byB0aGVcbi8vIGVuY2xvc2luZyBjYWxsIHRvIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5LlxudmFyIFN3aXRjaGVkVG9RdWVyeSA9IGZ1bmN0aW9uICgpIHt9O1xudmFyIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5ID0gZnVuY3Rpb24gKGYpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBTd2l0Y2hlZFRvUXVlcnkpKVxuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfTtcbn07XG5cbnZhciBjdXJyZW50SWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBPcGxvZ09ic2VydmVEcml2ZXJcbiAqIEFuIGFsdGVybmF0aXZlIHRvIFBvbGxpbmdPYnNlcnZlRHJpdmVyIHdoaWNoIGZvbGxvd3MgdGhlIE1vbmdvREIgb3BlcmF0aW9uIGxvZ1xuICogaW5zdGVhZCBvZiByZS1wb2xsaW5nIHRoZSBxdWVyeS5cbiAqXG4gKiBDaGFyYWN0ZXJpc3RpY3M6XG4gKiAtIEZvbGxvd3MgdGhlIE1vbmdvREIgb3BlcmF0aW9uIGxvZ1xuICogLSBEaXJlY3RseSBvYnNlcnZlcyBkYXRhYmFzZSBjaGFuZ2VzXG4gKiAtIE1vcmUgZWZmaWNpZW50IHRoYW4gcG9sbGluZyBmb3IgbW9zdCB1c2UgY2FzZXNcbiAqIC0gUmVxdWlyZXMgYWNjZXNzIHRvIE1vbmdvREIgb3Bsb2dcbiAqXG4gKiBJbnRlcmZhY2U6XG4gKiAtIENvbnN0cnVjdGlvbiBpbml0aWF0ZXMgb2JzZXJ2ZUNoYW5nZXMgY2FsbGJhY2tzIGFuZCByZWFkeSgpIGludm9jYXRpb24gdG8gdGhlIE9ic2VydmVNdWx0aXBsZXhlclxuICogLSBPYnNlcnZhdGlvbiBjYW4gYmUgdGVybWluYXRlZCB2aWEgdGhlIHN0b3AoKSBtZXRob2RcbiAqL1xuZXhwb3J0IGNvbnN0IE9wbG9nT2JzZXJ2ZURyaXZlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBzZWxmLl91c2VzT3Bsb2cgPSB0cnVlOyAgLy8gdGVzdHMgbG9vayBhdCB0aGlzXG5cbiAgc2VsZi5faWQgPSBjdXJyZW50SWQ7XG4gIGN1cnJlbnRJZCsrO1xuXG4gIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uID0gb3B0aW9ucy5jdXJzb3JEZXNjcmlwdGlvbjtcbiAgc2VsZi5fbW9uZ29IYW5kbGUgPSBvcHRpb25zLm1vbmdvSGFuZGxlO1xuICBzZWxmLl9tdWx0aXBsZXhlciA9IG9wdGlvbnMubXVsdGlwbGV4ZXI7XG5cbiAgaWYgKG9wdGlvbnMub3JkZXJlZCkge1xuICAgIHRocm93IEVycm9yKFwiT3Bsb2dPYnNlcnZlRHJpdmVyIG9ubHkgc3VwcG9ydHMgdW5vcmRlcmVkIG9ic2VydmVDaGFuZ2VzXCIpO1xuICB9XG5cbiAgY29uc3Qgc29ydGVyID0gb3B0aW9ucy5zb3J0ZXI7XG4gIC8vIFdlIGRvbid0IHN1cHBvcnQgJG5lYXIgYW5kIG90aGVyIGdlby1xdWVyaWVzIHNvIGl0J3MgT0sgdG8gaW5pdGlhbGl6ZSB0aGVcbiAgLy8gY29tcGFyYXRvciBvbmx5IG9uY2UgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICBjb25zdCBjb21wYXJhdG9yID0gc29ydGVyICYmIHNvcnRlci5nZXRDb21wYXJhdG9yKCk7XG5cbiAgaWYgKG9wdGlvbnMuY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5saW1pdCkge1xuICAgIC8vIFRoZXJlIGFyZSBzZXZlcmFsIHByb3BlcnRpZXMgb3JkZXJlZCBkcml2ZXIgaW1wbGVtZW50czpcbiAgICAvLyAtIF9saW1pdCBpcyBhIHBvc2l0aXZlIG51bWJlclxuICAgIC8vIC0gX2NvbXBhcmF0b3IgaXMgYSBmdW5jdGlvbi1jb21wYXJhdG9yIGJ5IHdoaWNoIHRoZSBxdWVyeSBpcyBvcmRlcmVkXG4gICAgLy8gLSBfdW5wdWJsaXNoZWRCdWZmZXIgaXMgbm9uLW51bGwgTWluL01heCBIZWFwLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHRoZSBlbXB0eSBidWZmZXIgaW4gU1RFQURZIHBoYXNlIGltcGxpZXMgdGhhdCB0aGVcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICBldmVyeXRoaW5nIHRoYXQgbWF0Y2hlcyB0aGUgcXVlcmllcyBzZWxlY3RvciBmaXRzXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgaW50byBwdWJsaXNoZWQgc2V0LlxuICAgIC8vIC0gX3B1Ymxpc2hlZCAtIE1heCBIZWFwIChhbHNvIGltcGxlbWVudHMgSWRNYXAgbWV0aG9kcylcblxuICAgIGNvbnN0IGhlYXBPcHRpb25zID0geyBJZE1hcDogTG9jYWxDb2xsZWN0aW9uLl9JZE1hcCB9O1xuICAgIHNlbGYuX2xpbWl0ID0gc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5saW1pdDtcbiAgICBzZWxmLl9jb21wYXJhdG9yID0gY29tcGFyYXRvcjtcbiAgICBzZWxmLl9zb3J0ZXIgPSBzb3J0ZXI7XG4gICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgPSBuZXcgTWluTWF4SGVhcChjb21wYXJhdG9yLCBoZWFwT3B0aW9ucyk7XG4gICAgLy8gV2UgbmVlZCBzb21ldGhpbmcgdGhhdCBjYW4gZmluZCBNYXggdmFsdWUgaW4gYWRkaXRpb24gdG8gSWRNYXAgaW50ZXJmYWNlXG4gICAgc2VsZi5fcHVibGlzaGVkID0gbmV3IE1heEhlYXAoY29tcGFyYXRvciwgaGVhcE9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX2xpbWl0ID0gMDtcbiAgICBzZWxmLl9jb21wYXJhdG9yID0gbnVsbDtcbiAgICBzZWxmLl9zb3J0ZXIgPSBudWxsO1xuICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyID0gbnVsbDtcbiAgICAvLyBNZW1vcnkgR3Jvd3RoXG4gICAgc2VsZi5fcHVibGlzaGVkID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIH1cblxuICAvLyBJbmRpY2F0ZXMgaWYgaXQgaXMgc2FmZSB0byBpbnNlcnQgYSBuZXcgZG9jdW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIC8vIGZvciB0aGlzIHF1ZXJ5LiBpLmUuIGl0IGlzIGtub3duIHRoYXQgdGhlcmUgYXJlIG5vIGRvY3VtZW50cyBtYXRjaGluZyB0aGVcbiAgLy8gc2VsZWN0b3IgdGhvc2UgYXJlIG5vdCBpbiBwdWJsaXNoZWQgb3IgYnVmZmVyLlxuICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcblxuICBzZWxmLl9zdG9wcGVkID0gZmFsc2U7XG4gIHNlbGYuX3N0b3BIYW5kbGVzID0gW107XG4gIHNlbGYuX2FkZFN0b3BIYW5kbGVzID0gZnVuY3Rpb24gKG5ld1N0b3BIYW5kbGVzKSB7XG4gICAgY29uc3QgZXhwZWN0ZWRQYXR0ZXJuID0gTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHsgc3RvcDogRnVuY3Rpb24gfSk7XG4gICAgLy8gU2luZ2xlIGl0ZW0gb3IgYXJyYXlcbiAgICBjaGVjayhuZXdTdG9wSGFuZGxlcywgTWF0Y2guT25lT2YoW2V4cGVjdGVkUGF0dGVybl0sIGV4cGVjdGVkUGF0dGVybikpO1xuICAgIHNlbGYuX3N0b3BIYW5kbGVzLnB1c2gobmV3U3RvcEhhbmRsZXMpO1xuICB9XG5cbiAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWRyaXZlcnMtb3Bsb2dcIiwgMSk7XG5cbiAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5RVUVSWUlORyk7XG5cbiAgc2VsZi5fbWF0Y2hlciA9IG9wdGlvbnMubWF0Y2hlcjtcbiAgLy8gd2UgYXJlIG5vdyB1c2luZyBwcm9qZWN0aW9uLCBub3QgZmllbGRzIGluIHRoZSBjdXJzb3IgZGVzY3JpcHRpb24gZXZlbiBpZiB5b3UgcGFzcyB7ZmllbGRzfVxuICAvLyBpbiB0aGUgY3Vyc29yIGNvbnN0cnVjdGlvblxuICBjb25zdCBwcm9qZWN0aW9uID0gc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5maWVsZHMgfHwgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5wcm9qZWN0aW9uIHx8IHt9O1xuICBzZWxmLl9wcm9qZWN0aW9uRm4gPSBMb2NhbENvbGxlY3Rpb24uX2NvbXBpbGVQcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuICAvLyBQcm9qZWN0aW9uIGZ1bmN0aW9uLCByZXN1bHQgb2YgY29tYmluaW5nIGltcG9ydGFudCBmaWVsZHMgZm9yIHNlbGVjdG9yIGFuZFxuICAvLyBleGlzdGluZyBmaWVsZHMgcHJvamVjdGlvblxuICBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uID0gc2VsZi5fbWF0Y2hlci5jb21iaW5lSW50b1Byb2plY3Rpb24ocHJvamVjdGlvbik7XG4gIGlmIChzb3J0ZXIpXG4gICAgc2VsZi5fc2hhcmVkUHJvamVjdGlvbiA9IHNvcnRlci5jb21iaW5lSW50b1Byb2plY3Rpb24oc2VsZi5fc2hhcmVkUHJvamVjdGlvbik7XG4gIHNlbGYuX3NoYXJlZFByb2plY3Rpb25GbiA9IExvY2FsQ29sbGVjdGlvbi5fY29tcGlsZVByb2plY3Rpb24oXG4gICAgc2VsZi5fc2hhcmVkUHJvamVjdGlvbik7XG5cbiAgc2VsZi5fbmVlZFRvRmV0Y2ggPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICBzZWxmLl9mZXRjaEdlbmVyYXRpb24gPSAwO1xuXG4gIHNlbGYuX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSA9IGZhbHNlO1xuICBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5ID0gW107XG4gfTtcblxuT2JqZWN0LmFzc2lnbihPcGxvZ09ic2VydmVEcml2ZXIucHJvdG90eXBlLCB7XG4gIF9pbml0OiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIElmIHRoZSBvcGxvZyBoYW5kbGUgdGVsbHMgdXMgdGhhdCBpdCBza2lwcGVkIHNvbWUgZW50cmllcyAoYmVjYXVzZSBpdCBnb3RcbiAgICAvLyBiZWhpbmQsIHNheSksIHJlLXBvbGwuXG4gICAgc2VsZi5fYWRkU3RvcEhhbmRsZXMoc2VsZi5fbW9uZ29IYW5kbGUuX29wbG9nSGFuZGxlLm9uU2tpcHBlZEVudHJpZXMoXG4gICAgICBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9uZWVkVG9Qb2xsUXVlcnkoKTtcbiAgICAgIH0pXG4gICAgKSk7XG4gICAgXG4gICAgYXdhaXQgZm9yRWFjaFRyaWdnZXIoc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24sIGFzeW5jIGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICBzZWxmLl9hZGRTdG9wSGFuZGxlcyhhd2FpdCBzZWxmLl9tb25nb0hhbmRsZS5fb3Bsb2dIYW5kbGUub25PcGxvZ0VudHJ5KFxuICAgICAgICB0cmlnZ2VyLCBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBub3RpZmljYXRpb24ub3A7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLmRyb3BDb2xsZWN0aW9uIHx8IG5vdGlmaWNhdGlvbi5kcm9wRGF0YWJhc2UpIHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBjYWxsIGlzIG5vdCBhbGxvd2VkIHRvIGJsb2NrIG9uIGFueXRoaW5nIChlc3BlY2lhbGx5XG4gICAgICAgICAgICAgIC8vIG9uIHdhaXRpbmcgZm9yIG9wbG9nIGVudHJpZXMgdG8gY2F0Y2ggdXApIGJlY2F1c2UgdGhhdCB3aWxsIGJsb2NrXG4gICAgICAgICAgICAgIC8vIG9uT3Bsb2dFbnRyeSFcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQWxsIG90aGVyIG9wZXJhdG9ycyBzaG91bGQgYmUgaGFuZGxlZCBkZXBlbmRpbmcgb24gcGhhc2VcbiAgICAgICAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmcob3ApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZyhvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICApKTtcbiAgICB9KTtcbiAgXG4gICAgLy8gWFhYIG9yZGVyaW5nIHcuci50LiBldmVyeXRoaW5nIGVsc2U/XG4gICAgc2VsZi5fYWRkU3RvcEhhbmRsZXMoYXdhaXQgbGlzdGVuQWxsKFxuICAgICAgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGluIGEgcHJlLWZpcmUgd3JpdGUgZmVuY2UsIHdlIGRvbid0IGhhdmUgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGNvbnN0IGZlbmNlID0gRERQU2VydmVyLl9nZXRDdXJyZW50RmVuY2UoKTtcbiAgICAgICAgaWYgKCFmZW5jZSB8fCBmZW5jZS5maXJlZClcbiAgICAgICAgICByZXR1cm47XG4gIFxuICAgICAgICBpZiAoZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnMpIHtcbiAgICAgICAgICBmZW5jZS5fb3Bsb2dPYnNlcnZlRHJpdmVyc1tzZWxmLl9pZF0gPSBzZWxmO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICBcbiAgICAgICAgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnMgPSB7fTtcbiAgICAgICAgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnNbc2VsZi5faWRdID0gc2VsZjtcbiAgXG4gICAgICAgIGZlbmNlLm9uQmVmb3JlRmlyZShhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc3QgZHJpdmVycyA9IGZlbmNlLl9vcGxvZ09ic2VydmVEcml2ZXJzO1xuICAgICAgICAgIGRlbGV0ZSBmZW5jZS5fb3Bsb2dPYnNlcnZlRHJpdmVycztcbiAgXG4gICAgICAgICAgLy8gVGhpcyBmZW5jZSBjYW5ub3QgZmlyZSB1bnRpbCB3ZSd2ZSBjYXVnaHQgdXAgdG8gXCJ0aGlzIHBvaW50XCIgaW4gdGhlXG4gICAgICAgICAgLy8gb3Bsb2csIGFuZCBhbGwgb2JzZXJ2ZXJzIG1hZGUgaXQgYmFjayB0byB0aGUgc3RlYWR5IHN0YXRlLlxuICAgICAgICAgIGF3YWl0IHNlbGYuX21vbmdvSGFuZGxlLl9vcGxvZ0hhbmRsZS53YWl0VW50aWxDYXVnaHRVcCgpO1xuICBcbiAgICAgICAgICBmb3IgKGNvbnN0IGRyaXZlciBvZiBPYmplY3QudmFsdWVzKGRyaXZlcnMpKSB7XG4gICAgICAgICAgICBpZiAoZHJpdmVyLl9zdG9wcGVkKVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgXG4gICAgICAgICAgICBjb25zdCB3cml0ZSA9IGF3YWl0IGZlbmNlLmJlZ2luV3JpdGUoKTtcbiAgICAgICAgICAgIGlmIChkcml2ZXIuX3BoYXNlID09PSBQSEFTRS5TVEVBRFkpIHtcbiAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgYWxsIG9mIHRoZSBjYWxsYmFja3MgaGF2ZSBtYWRlIGl0IHRocm91Z2ggdGhlXG4gICAgICAgICAgICAgIC8vIG11bHRpcGxleGVyIGFuZCBiZWVuIGRlbGl2ZXJlZCB0byBPYnNlcnZlSGFuZGxlcyBiZWZvcmUgY29tbWl0dGluZ1xuICAgICAgICAgICAgICAvLyB3cml0ZXMuXG4gICAgICAgICAgICAgIGF3YWl0IGRyaXZlci5fbXVsdGlwbGV4ZXIub25GbHVzaCh3cml0ZS5jb21taXR0ZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZHJpdmVyLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5LnB1c2god3JpdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKSk7XG4gIFxuICAgIC8vIFdoZW4gTW9uZ28gZmFpbHMgb3Zlciwgd2UgbmVlZCB0byByZXBvbGwgdGhlIHF1ZXJ5LCBpbiBjYXNlIHdlIHByb2Nlc3NlZCBhblxuICAgIC8vIG9wbG9nIGVudHJ5IHRoYXQgZ290IHJvbGxlZCBiYWNrLlxuICAgIHNlbGYuX2FkZFN0b3BIYW5kbGVzKHNlbGYuX21vbmdvSGFuZGxlLl9vbkZhaWxvdmVyKGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5KFxuICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICB9KSkpO1xuICBcbiAgICAvLyBHaXZlIF9vYnNlcnZlQ2hhbmdlcyBhIGNoYW5jZSB0byBhZGQgdGhlIG5ldyBPYnNlcnZlSGFuZGxlIHRvIG91clxuICAgIC8vIG11bHRpcGxleGVyLCBzbyB0aGF0IHRoZSBhZGRlZCBjYWxscyBnZXQgc3RyZWFtZWQuXG4gICAgcmV0dXJuIHNlbGYuX3J1bkluaXRpYWxRdWVyeSgpO1xuICB9LFxuICBfYWRkUHVibGlzaGVkOiBmdW5jdGlvbiAoaWQsIGRvYykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGRzID0gT2JqZWN0LmFzc2lnbih7fSwgZG9jKTtcbiAgICAgIGRlbGV0ZSBmaWVsZHMuX2lkO1xuICAgICAgc2VsZi5fcHVibGlzaGVkLnNldChpZCwgc2VsZi5fc2hhcmVkUHJvamVjdGlvbkZuKGRvYykpO1xuICAgICAgc2VsZi5fbXVsdGlwbGV4ZXIuYWRkZWQoaWQsIHNlbGYuX3Byb2plY3Rpb25GbihmaWVsZHMpKTtcblxuICAgICAgLy8gQWZ0ZXIgYWRkaW5nIHRoaXMgZG9jdW1lbnQsIHRoZSBwdWJsaXNoZWQgc2V0IG1pZ2h0IGJlIG92ZXJmbG93ZWRcbiAgICAgIC8vIChleGNlZWRpbmcgY2FwYWNpdHkgc3BlY2lmaWVkIGJ5IGxpbWl0KS4gSWYgc28sIHB1c2ggdGhlIG1heGltdW1cbiAgICAgIC8vIGVsZW1lbnQgdG8gdGhlIGJ1ZmZlciwgd2UgbWlnaHQgd2FudCB0byBzYXZlIGl0IGluIG1lbW9yeSB0byByZWR1Y2UgdGhlXG4gICAgICAvLyBhbW91bnQgb2YgTW9uZ28gbG9va3VwcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgaWYgKHNlbGYuX2xpbWl0ICYmIHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPiBzZWxmLl9saW1pdCkge1xuICAgICAgICAvLyBYWFggaW4gdGhlb3J5IHRoZSBzaXplIG9mIHB1Ymxpc2hlZCBpcyBubyBtb3JlIHRoYW4gbGltaXQrMVxuICAgICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLnNpemUoKSAhPT0gc2VsZi5fbGltaXQgKyAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWZ0ZXIgYWRkaW5nIHRvIHB1Ymxpc2hlZCwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VsZi5fcHVibGlzaGVkLnNpemUoKSAtIHNlbGYuX2xpbWl0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGRvY3VtZW50cyBhcmUgb3ZlcmZsb3dpbmcgdGhlIHNldFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdmVyZmxvd2luZ0RvY0lkID0gc2VsZi5fcHVibGlzaGVkLm1heEVsZW1lbnRJZCgpO1xuICAgICAgICB2YXIgb3ZlcmZsb3dpbmdEb2MgPSBzZWxmLl9wdWJsaXNoZWQuZ2V0KG92ZXJmbG93aW5nRG9jSWQpO1xuXG4gICAgICAgIGlmIChFSlNPTi5lcXVhbHMob3ZlcmZsb3dpbmdEb2NJZCwgaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGRvY3VtZW50IGp1c3QgYWRkZWQgaXMgb3ZlcmZsb3dpbmcgdGhlIHB1Ymxpc2hlZCBzZXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9wdWJsaXNoZWQucmVtb3ZlKG92ZXJmbG93aW5nRG9jSWQpO1xuICAgICAgICBzZWxmLl9tdWx0aXBsZXhlci5yZW1vdmVkKG92ZXJmbG93aW5nRG9jSWQpO1xuICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChvdmVyZmxvd2luZ0RvY0lkLCBvdmVyZmxvd2luZ0RvYyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9yZW1vdmVQdWJsaXNoZWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLl9wdWJsaXNoZWQucmVtb3ZlKGlkKTtcbiAgICAgIHNlbGYuX211bHRpcGxleGVyLnJlbW92ZWQoaWQpO1xuICAgICAgaWYgKCEgc2VsZi5fbGltaXQgfHwgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA9PT0gc2VsZi5fbGltaXQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPiBzZWxmLl9saW1pdClcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJzZWxmLl9wdWJsaXNoZWQgZ290IHRvbyBiaWdcIik7XG5cbiAgICAgIC8vIE9LLCB3ZSBhcmUgcHVibGlzaGluZyBsZXNzIHRoYW4gdGhlIGxpbWl0LiBNYXliZSB3ZSBzaG91bGQgbG9vayBpbiB0aGVcbiAgICAgIC8vIGJ1ZmZlciB0byBmaW5kIHRoZSBuZXh0IGVsZW1lbnQgcGFzdCB3aGF0IHdlIHdlcmUgcHVibGlzaGluZyBiZWZvcmUuXG5cbiAgICAgIGlmICghc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZW1wdHkoKSkge1xuICAgICAgICAvLyBUaGVyZSdzIHNvbWV0aGluZyBpbiB0aGUgYnVmZmVyOyBtb3ZlIHRoZSBmaXJzdCB0aGluZyBpbiBpdCB0b1xuICAgICAgICAvLyBfcHVibGlzaGVkLlxuICAgICAgICB2YXIgbmV3RG9jSWQgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5taW5FbGVtZW50SWQoKTtcbiAgICAgICAgdmFyIG5ld0RvYyA9IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChuZXdEb2NJZCk7XG4gICAgICAgIHNlbGYuX3JlbW92ZUJ1ZmZlcmVkKG5ld0RvY0lkKTtcbiAgICAgICAgc2VsZi5fYWRkUHVibGlzaGVkKG5ld0RvY0lkLCBuZXdEb2MpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgYnVmZmVyLiAgVGhpcyBjb3VsZCBtZWFuIG9uZSBvZiBhIGZldyB0aGluZ3MuXG5cbiAgICAgIC8vIChhKSBXZSBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIHJlLXJ1bm5pbmcgdGhlIHF1ZXJ5IChzcGVjaWZpY2FsbHksIHdlXG4gICAgICAvLyBjb3VsZCBiZSBpbiBfcHVibGlzaE5ld1Jlc3VsdHMpLiBJbiB0aGF0IGNhc2UsIF91bnB1Ymxpc2hlZEJ1ZmZlciBpc1xuICAgICAgLy8gZW1wdHkgYmVjYXVzZSB3ZSBjbGVhciBpdCBhdCB0aGUgYmVnaW5uaW5nIG9mIF9wdWJsaXNoTmV3UmVzdWx0cy4gSW5cbiAgICAgIC8vIHRoaXMgY2FzZSwgb3VyIGNhbGxlciBhbHJlYWR5IGtub3dzIHRoZSBlbnRpcmUgYW5zd2VyIHRvIHRoZSBxdWVyeSBhbmRcbiAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgZmFuY3kgaGVyZS4gIEp1c3QgcmV0dXJuLlxuICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORylcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyAoYikgV2UncmUgcHJldHR5IGNvbmZpZGVudCB0aGF0IHRoZSB1bmlvbiBvZiBfcHVibGlzaGVkIGFuZFxuICAgICAgLy8gX3VucHVibGlzaGVkQnVmZmVyIGNvbnRhaW4gYWxsIGRvY3VtZW50cyB0aGF0IG1hdGNoIHNlbGVjdG9yLiBCZWNhdXNlXG4gICAgICAvLyBfdW5wdWJsaXNoZWRCdWZmZXIgaXMgZW1wdHksIHRoYXQgbWVhbnMgd2UncmUgY29uZmlkZW50IHRoYXQgX3B1Ymxpc2hlZFxuICAgICAgLy8gY29udGFpbnMgYWxsIGRvY3VtZW50cyB0aGF0IG1hdGNoIHNlbGVjdG9yLiBTbyB3ZSBoYXZlIG5vdGhpbmcgdG8gZG8uXG4gICAgICBpZiAoc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIChjKSBNYXliZSB0aGVyZSBhcmUgb3RoZXIgZG9jdW1lbnRzIG91dCB0aGVyZSB0aGF0IHNob3VsZCBiZSBpbiBvdXJcbiAgICAgIC8vIGJ1ZmZlci4gQnV0IGluIHRoYXQgY2FzZSwgd2hlbiB3ZSBlbXB0aWVkIF91bnB1Ymxpc2hlZEJ1ZmZlciBpblxuICAgICAgLy8gX3JlbW92ZUJ1ZmZlcmVkLCB3ZSBzaG91bGQgaGF2ZSBjYWxsZWQgX25lZWRUb1BvbGxRdWVyeSwgd2hpY2ggd2lsbFxuICAgICAgLy8gZWl0aGVyIHB1dCBzb21ldGhpbmcgaW4gX3VucHVibGlzaGVkQnVmZmVyIG9yIHNldCBfc2FmZUFwcGVuZFRvQnVmZmVyXG4gICAgICAvLyAob3IgYm90aCksIGFuZCBpdCB3aWxsIHB1dCB1cyBpbiBRVUVSWUlORyBmb3IgdGhhdCB3aG9sZSB0aW1lLiBTbyBpblxuICAgICAgLy8gZmFjdCwgd2Ugc2hvdWxkbid0IGJlIGFibGUgdG8gZ2V0IGhlcmUuXG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1ZmZlciBpbmV4cGxpY2FibHkgZW1wdHlcIik7XG4gICAgfSk7XG4gIH0sXG4gIF9jaGFuZ2VQdWJsaXNoZWQ6IGZ1bmN0aW9uIChpZCwgb2xkRG9jLCBuZXdEb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fcHVibGlzaGVkLnNldChpZCwgc2VsZi5fc2hhcmVkUHJvamVjdGlvbkZuKG5ld0RvYykpO1xuICAgICAgdmFyIHByb2plY3RlZE5ldyA9IHNlbGYuX3Byb2plY3Rpb25GbihuZXdEb2MpO1xuICAgICAgdmFyIHByb2plY3RlZE9sZCA9IHNlbGYuX3Byb2plY3Rpb25GbihvbGREb2MpO1xuICAgICAgdmFyIGNoYW5nZWQgPSBEaWZmU2VxdWVuY2UubWFrZUNoYW5nZWRGaWVsZHMoXG4gICAgICAgIHByb2plY3RlZE5ldywgcHJvamVjdGVkT2xkKTtcbiAgICAgIGlmICghaXNFbXB0eShjaGFuZ2VkKSlcbiAgICAgICAgc2VsZi5fbXVsdGlwbGV4ZXIuY2hhbmdlZChpZCwgY2hhbmdlZCk7XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRCdWZmZXJlZDogZnVuY3Rpb24gKGlkLCBkb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2V0KGlkLCBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uRm4oZG9jKSk7XG5cbiAgICAgIC8vIElmIHNvbWV0aGluZyBpcyBvdmVyZmxvd2luZyB0aGUgYnVmZmVyLCB3ZSBqdXN0IHJlbW92ZSBpdCBmcm9tIGNhY2hlXG4gICAgICBpZiAoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpID4gc2VsZi5fbGltaXQpIHtcbiAgICAgICAgdmFyIG1heEJ1ZmZlcmVkSWQgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKTtcblxuICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5yZW1vdmUobWF4QnVmZmVyZWRJZCk7XG5cbiAgICAgICAgLy8gU2luY2Ugc29tZXRoaW5nIG1hdGNoaW5nIGlzIHJlbW92ZWQgZnJvbSBjYWNoZSAoYm90aCBwdWJsaXNoZWQgc2V0IGFuZFxuICAgICAgICAvLyBidWZmZXIpLCBzZXQgZmxhZyB0byBmYWxzZVxuICAgICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLy8gSXMgY2FsbGVkIGVpdGhlciB0byByZW1vdmUgdGhlIGRvYyBjb21wbGV0ZWx5IGZyb20gbWF0Y2hpbmcgc2V0IG9yIHRvIG1vdmVcbiAgLy8gaXQgdG8gdGhlIHB1Ymxpc2hlZCBzZXQgbGF0ZXIuXG4gIF9yZW1vdmVCdWZmZXJlZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnJlbW92ZShpZCk7XG4gICAgICAvLyBUbyBrZWVwIHRoZSBjb250cmFjdCBcImJ1ZmZlciBpcyBuZXZlciBlbXB0eSBpbiBTVEVBRFkgcGhhc2UgdW5sZXNzIHRoZVxuICAgICAgLy8gZXZlcnl0aGluZyBtYXRjaGluZyBmaXRzIGludG8gcHVibGlzaGVkXCIgdHJ1ZSwgd2UgcG9sbCBldmVyeXRoaW5nIGFzXG4gICAgICAvLyBzb29uIGFzIHdlIHNlZSB0aGUgYnVmZmVyIGJlY29taW5nIGVtcHR5LlxuICAgICAgaWYgKCEgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmICEgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyKVxuICAgICAgICBzZWxmLl9uZWVkVG9Qb2xsUXVlcnkoKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gQ2FsbGVkIHdoZW4gYSBkb2N1bWVudCBoYXMgam9pbmVkIHRoZSBcIk1hdGNoaW5nXCIgcmVzdWx0cyBzZXQuXG4gIC8vIFRha2VzIHJlc3BvbnNpYmlsaXR5IG9mIGtlZXBpbmcgX3VucHVibGlzaGVkQnVmZmVyIGluIHN5bmMgd2l0aCBfcHVibGlzaGVkXG4gIC8vIGFuZCB0aGUgZWZmZWN0IG9mIGxpbWl0IGVuZm9yY2VkLlxuICBfYWRkTWF0Y2hpbmc6IGZ1bmN0aW9uIChkb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlkID0gZG9jLl9pZDtcbiAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKSlcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJ0cmllZCB0byBhZGQgc29tZXRoaW5nIGFscmVhZHkgcHVibGlzaGVkIFwiICsgaWQpO1xuICAgICAgaWYgKHNlbGYuX2xpbWl0ICYmIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmhhcyhpZCkpXG4gICAgICAgIHRocm93IEVycm9yKFwidHJpZWQgdG8gYWRkIHNvbWV0aGluZyBhbHJlYWR5IGV4aXN0ZWQgaW4gYnVmZmVyIFwiICsgaWQpO1xuXG4gICAgICB2YXIgbGltaXQgPSBzZWxmLl9saW1pdDtcbiAgICAgIHZhciBjb21wYXJhdG9yID0gc2VsZi5fY29tcGFyYXRvcjtcbiAgICAgIHZhciBtYXhQdWJsaXNoZWQgPSAobGltaXQgJiYgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA+IDApID9cbiAgICAgICAgc2VsZi5fcHVibGlzaGVkLmdldChzZWxmLl9wdWJsaXNoZWQubWF4RWxlbWVudElkKCkpIDogbnVsbDtcbiAgICAgIHZhciBtYXhCdWZmZXJlZCA9IChsaW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkgPiAwKVxuICAgICAgICA/IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKSlcbiAgICAgICAgOiBudWxsO1xuICAgICAgLy8gVGhlIHF1ZXJ5IGlzIHVubGltaXRlZCBvciBkaWRuJ3QgcHVibGlzaCBlbm91Z2ggZG9jdW1lbnRzIHlldCBvciB0aGVcbiAgICAgIC8vIG5ldyBkb2N1bWVudCB3b3VsZCBmaXQgaW50byBwdWJsaXNoZWQgc2V0IHB1c2hpbmcgdGhlIG1heGltdW0gZWxlbWVudFxuICAgICAgLy8gb3V0LCB0aGVuIHdlIG5lZWQgdG8gcHVibGlzaCB0aGUgZG9jLlxuICAgICAgdmFyIHRvUHVibGlzaCA9ICEgbGltaXQgfHwgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA8IGxpbWl0IHx8XG4gICAgICAgIGNvbXBhcmF0b3IoZG9jLCBtYXhQdWJsaXNoZWQpIDwgMDtcblxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIG1pZ2h0IG5lZWQgdG8gYnVmZmVyIGl0IChvbmx5IGluIGNhc2Ugb2YgbGltaXRlZCBxdWVyeSkuXG4gICAgICAvLyBCdWZmZXJpbmcgaXMgYWxsb3dlZCBpZiB0aGUgYnVmZmVyIGlzIG5vdCBmaWxsZWQgdXAgeWV0IGFuZCBhbGxcbiAgICAgIC8vIG1hdGNoaW5nIGRvY3MgYXJlIGVpdGhlciBpbiB0aGUgcHVibGlzaGVkIHNldCBvciBpbiB0aGUgYnVmZmVyLlxuICAgICAgdmFyIGNhbkFwcGVuZFRvQnVmZmVyID0gIXRvUHVibGlzaCAmJiBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgJiZcbiAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpIDwgbGltaXQ7XG5cbiAgICAgIC8vIE9yIGlmIGl0IGlzIHNtYWxsIGVub3VnaCB0byBiZSBzYWZlbHkgaW5zZXJ0ZWQgdG8gdGhlIG1pZGRsZSBvciB0aGVcbiAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgYnVmZmVyLlxuICAgICAgdmFyIGNhbkluc2VydEludG9CdWZmZXIgPSAhdG9QdWJsaXNoICYmIG1heEJ1ZmZlcmVkICYmXG4gICAgICAgIGNvbXBhcmF0b3IoZG9jLCBtYXhCdWZmZXJlZCkgPD0gMDtcblxuICAgICAgdmFyIHRvQnVmZmVyID0gY2FuQXBwZW5kVG9CdWZmZXIgfHwgY2FuSW5zZXJ0SW50b0J1ZmZlcjtcblxuICAgICAgaWYgKHRvUHVibGlzaCkge1xuICAgICAgICBzZWxmLl9hZGRQdWJsaXNoZWQoaWQsIGRvYyk7XG4gICAgICB9IGVsc2UgaWYgKHRvQnVmZmVyKSB7XG4gICAgICAgIHNlbGYuX2FkZEJ1ZmZlcmVkKGlkLCBkb2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZHJvcHBpbmcgaXQgYW5kIG5vdCBzYXZpbmcgdG8gdGhlIGNhY2hlXG4gICAgICAgIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlciA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvLyBDYWxsZWQgd2hlbiBhIGRvY3VtZW50IGxlYXZlcyB0aGUgXCJNYXRjaGluZ1wiIHJlc3VsdHMgc2V0LlxuICAvLyBUYWtlcyByZXNwb25zaWJpbGl0eSBvZiBrZWVwaW5nIF91bnB1Ymxpc2hlZEJ1ZmZlciBpbiBzeW5jIHdpdGggX3B1Ymxpc2hlZFxuICAvLyBhbmQgdGhlIGVmZmVjdCBvZiBsaW1pdCBlbmZvcmNlZC5cbiAgX3JlbW92ZU1hdGNoaW5nOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCEgc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkgJiYgISBzZWxmLl9saW1pdClcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJ0cmllZCB0byByZW1vdmUgc29tZXRoaW5nIG1hdGNoaW5nIGJ1dCBub3QgY2FjaGVkIFwiICsgaWQpO1xuXG4gICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlUHVibGlzaGVkKGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKSkge1xuICAgICAgICBzZWxmLl9yZW1vdmVCdWZmZXJlZChpZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9oYW5kbGVEb2M6IGZ1bmN0aW9uIChpZCwgbmV3RG9jKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtYXRjaGVzTm93ID0gbmV3RG9jICYmIHNlbGYuX21hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKG5ld0RvYykucmVzdWx0O1xuXG4gICAgICB2YXIgcHVibGlzaGVkQmVmb3JlID0gc2VsZi5fcHVibGlzaGVkLmhhcyhpZCk7XG4gICAgICB2YXIgYnVmZmVyZWRCZWZvcmUgPSBzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpO1xuICAgICAgdmFyIGNhY2hlZEJlZm9yZSA9IHB1Ymxpc2hlZEJlZm9yZSB8fCBidWZmZXJlZEJlZm9yZTtcblxuICAgICAgaWYgKG1hdGNoZXNOb3cgJiYgIWNhY2hlZEJlZm9yZSkge1xuICAgICAgICBzZWxmLl9hZGRNYXRjaGluZyhuZXdEb2MpO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZWRCZWZvcmUgJiYgIW1hdGNoZXNOb3cpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlTWF0Y2hpbmcoaWQpO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZWRCZWZvcmUgJiYgbWF0Y2hlc05vdykge1xuICAgICAgICB2YXIgb2xkRG9jID0gc2VsZi5fcHVibGlzaGVkLmdldChpZCk7XG4gICAgICAgIHZhciBjb21wYXJhdG9yID0gc2VsZi5fY29tcGFyYXRvcjtcbiAgICAgICAgdmFyIG1pbkJ1ZmZlcmVkID0gc2VsZi5fbGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmXG4gICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLm1pbkVsZW1lbnRJZCgpKTtcbiAgICAgICAgdmFyIG1heEJ1ZmZlcmVkO1xuXG4gICAgICAgIGlmIChwdWJsaXNoZWRCZWZvcmUpIHtcbiAgICAgICAgICAvLyBVbmxpbWl0ZWQgY2FzZSB3aGVyZSB0aGUgZG9jdW1lbnQgc3RheXMgaW4gcHVibGlzaGVkIG9uY2UgaXRcbiAgICAgICAgICAvLyBtYXRjaGVzIG9yIHRoZSBjYXNlIHdoZW4gd2UgZG9uJ3QgaGF2ZSBlbm91Z2ggbWF0Y2hpbmcgZG9jcyB0b1xuICAgICAgICAgIC8vIHB1Ymxpc2ggb3IgdGhlIGNoYW5nZWQgYnV0IG1hdGNoaW5nIGRvYyB3aWxsIHN0YXkgaW4gcHVibGlzaGVkXG4gICAgICAgICAgLy8gYW55d2F5cy5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFhYWDogV2UgcmVseSBvbiB0aGUgZW1wdGluZXNzIG9mIGJ1ZmZlci4gQmUgc3VyZSB0byBtYWludGFpbiB0aGVcbiAgICAgICAgICAvLyBmYWN0IHRoYXQgYnVmZmVyIGNhbid0IGJlIGVtcHR5IGlmIHRoZXJlIGFyZSBtYXRjaGluZyBkb2N1bWVudHMgbm90XG4gICAgICAgICAgLy8gcHVibGlzaGVkLiBOb3RhYmx5LCB3ZSBkb24ndCB3YW50IHRvIHNjaGVkdWxlIHJlcG9sbCBhbmQgY29udGludWVcbiAgICAgICAgICAvLyByZWx5aW5nIG9uIHRoaXMgcHJvcGVydHkuXG4gICAgICAgICAgdmFyIHN0YXlzSW5QdWJsaXNoZWQgPSAhIHNlbGYuX2xpbWl0IHx8XG4gICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkgPT09IDAgfHxcbiAgICAgICAgICAgIGNvbXBhcmF0b3IobmV3RG9jLCBtaW5CdWZmZXJlZCkgPD0gMDtcblxuICAgICAgICAgIGlmIChzdGF5c0luUHVibGlzaGVkKSB7XG4gICAgICAgICAgICBzZWxmLl9jaGFuZ2VQdWJsaXNoZWQoaWQsIG9sZERvYywgbmV3RG9jKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYWZ0ZXIgdGhlIGNoYW5nZSBkb2MgZG9lc24ndCBzdGF5IGluIHRoZSBwdWJsaXNoZWQsIHJlbW92ZSBpdFxuICAgICAgICAgICAgc2VsZi5fcmVtb3ZlUHVibGlzaGVkKGlkKTtcbiAgICAgICAgICAgIC8vIGJ1dCBpdCBjYW4gbW92ZSBpbnRvIGJ1ZmZlcmVkIG5vdywgY2hlY2sgaXRcbiAgICAgICAgICAgIG1heEJ1ZmZlcmVkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KFxuICAgICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKSk7XG5cbiAgICAgICAgICAgIHZhciB0b0J1ZmZlciA9IHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlciB8fFxuICAgICAgICAgICAgICAgICAgKG1heEJ1ZmZlcmVkICYmIGNvbXBhcmF0b3IobmV3RG9jLCBtYXhCdWZmZXJlZCkgPD0gMCk7XG5cbiAgICAgICAgICAgIGlmICh0b0J1ZmZlcikge1xuICAgICAgICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChpZCwgbmV3RG9jKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZnJvbSBib3RoIHB1Ymxpc2hlZCBzZXQgYW5kIGJ1ZmZlclxuICAgICAgICAgICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYnVmZmVyZWRCZWZvcmUpIHtcbiAgICAgICAgICBvbGREb2MgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5nZXQoaWQpO1xuICAgICAgICAgIC8vIHJlbW92ZSB0aGUgb2xkIHZlcnNpb24gbWFudWFsbHkgaW5zdGVhZCBvZiB1c2luZyBfcmVtb3ZlQnVmZmVyZWQgc29cbiAgICAgICAgICAvLyB3ZSBkb24ndCB0cmlnZ2VyIHRoZSBxdWVyeWluZyBpbW1lZGlhdGVseS4gIGlmIHdlIGVuZCB0aGlzIGJsb2NrXG4gICAgICAgICAgLy8gd2l0aCB0aGUgYnVmZmVyIGVtcHR5LCB3ZSB3aWxsIG5lZWQgdG8gdHJpZ2dlciB0aGUgcXVlcnkgcG9sbFxuICAgICAgICAgIC8vIG1hbnVhbGx5IHRvby5cbiAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5yZW1vdmUoaWQpO1xuXG4gICAgICAgICAgdmFyIG1heFB1Ymxpc2hlZCA9IHNlbGYuX3B1Ymxpc2hlZC5nZXQoXG4gICAgICAgICAgICBzZWxmLl9wdWJsaXNoZWQubWF4RWxlbWVudElkKCkpO1xuICAgICAgICAgIG1heEJ1ZmZlcmVkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmXG4gICAgICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KFxuICAgICAgICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWF4RWxlbWVudElkKCkpO1xuXG4gICAgICAgICAgLy8gdGhlIGJ1ZmZlcmVkIGRvYyB3YXMgdXBkYXRlZCwgaXQgY291bGQgbW92ZSB0byBwdWJsaXNoZWRcbiAgICAgICAgICB2YXIgdG9QdWJsaXNoID0gY29tcGFyYXRvcihuZXdEb2MsIG1heFB1Ymxpc2hlZCkgPCAwO1xuXG4gICAgICAgICAgLy8gb3Igc3RheXMgaW4gYnVmZmVyIGV2ZW4gYWZ0ZXIgdGhlIGNoYW5nZVxuICAgICAgICAgIHZhciBzdGF5c0luQnVmZmVyID0gKCEgdG9QdWJsaXNoICYmIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlcikgfHxcbiAgICAgICAgICAgICAgICAoIXRvUHVibGlzaCAmJiBtYXhCdWZmZXJlZCAmJlxuICAgICAgICAgICAgICAgICBjb21wYXJhdG9yKG5ld0RvYywgbWF4QnVmZmVyZWQpIDw9IDApO1xuXG4gICAgICAgICAgaWYgKHRvUHVibGlzaCkge1xuICAgICAgICAgICAgc2VsZi5fYWRkUHVibGlzaGVkKGlkLCBuZXdEb2MpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3RheXNJbkJ1ZmZlcikge1xuICAgICAgICAgICAgLy8gc3RheXMgaW4gYnVmZmVyIGJ1dCBjaGFuZ2VzXG4gICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zZXQoaWQsIG5ld0RvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZnJvbSBib3RoIHB1Ymxpc2hlZCBzZXQgYW5kIGJ1ZmZlclxuICAgICAgICAgICAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBOb3JtYWxseSB0aGlzIGNoZWNrIHdvdWxkIGhhdmUgYmVlbiBkb25lIGluIF9yZW1vdmVCdWZmZXJlZCBidXRcbiAgICAgICAgICAgIC8vIHdlIGRpZG4ndCB1c2UgaXQsIHNvIHdlIG5lZWQgdG8gZG8gaXQgb3Vyc2VsZiBub3cuXG4gICAgICAgICAgICBpZiAoISBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkpIHtcbiAgICAgICAgICAgICAgc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhY2hlZEJlZm9yZSBpbXBsaWVzIGVpdGhlciBvZiBwdWJsaXNoZWRCZWZvcmUgb3IgYnVmZmVyZWRCZWZvcmUgaXMgdHJ1ZS5cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2ZldGNoTW9kaWZpZWREb2N1bWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5GRVRDSElORyk7XG4gICAgLy8gRGVmZXIsIGJlY2F1c2Ugbm90aGluZyBjYWxsZWQgZnJvbSB0aGUgb3Bsb2cgZW50cnkgaGFuZGxlciBtYXkgeWllbGQsXG4gICAgLy8gYnV0IGZldGNoKCkgeWllbGRzLlxuICAgIE1ldGVvci5kZWZlcihmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICB3aGlsZSAoIXNlbGYuX3N0b3BwZWQgJiYgIXNlbGYuX25lZWRUb0ZldGNoLmVtcHR5KCkpIHtcbiAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICAgIC8vIFdoaWxlIGZldGNoaW5nLCB3ZSBkZWNpZGVkIHRvIGdvIGludG8gUVVFUllJTkcgbW9kZSwgYW5kIHRoZW4gd2VcbiAgICAgICAgICAvLyBzYXcgYW5vdGhlciBvcGxvZyBlbnRyeSwgc28gX25lZWRUb0ZldGNoIGlzIG5vdCBlbXB0eS4gQnV0IHdlXG4gICAgICAgICAgLy8gc2hvdWxkbid0IGZldGNoIHRoZXNlIGRvY3VtZW50cyB1bnRpbCBBRlRFUiB0aGUgcXVlcnkgaXMgZG9uZS5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlaW5nIGluIHN0ZWFkeSBwaGFzZSBoZXJlIHdvdWxkIGJlIHN1cnByaXNpbmcuXG4gICAgICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuRkVUQ0hJTkcpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGhhc2UgaW4gZmV0Y2hNb2RpZmllZERvY3VtZW50czogXCIgKyBzZWxmLl9waGFzZSk7XG5cbiAgICAgICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBzZWxmLl9uZWVkVG9GZXRjaDtcbiAgICAgICAgdmFyIHRoaXNHZW5lcmF0aW9uID0gKytzZWxmLl9mZXRjaEdlbmVyYXRpb247XG4gICAgICAgIHNlbGYuX25lZWRUb0ZldGNoID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBhbGwgdGhlIGZldGNoIG9wZXJhdGlvbnNcbiAgICAgICAgY29uc3QgZmV0Y2hQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIHNlbGYuX2N1cnJlbnRseUZldGNoaW5nLmZvckVhY2goZnVuY3Rpb24gKG9wLCBpZCkge1xuICAgICAgICAgIGNvbnN0IGZldGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHNlbGYuX21vbmdvSGFuZGxlLl9kb2NGZXRjaGVyLmZldGNoKFxuICAgICAgICAgICAgICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgIG9wLFxuICAgICAgICAgICAgICBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShmdW5jdGlvbihlcnIsIGRvYykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoJ0dvdCBleGNlcHRpb24gd2hpbGUgZmV0Y2hpbmcgZG9jdW1lbnRzJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGdldCBhbiBlcnJvciBmcm9tIHRoZSBmZXRjaGVyIChlZywgdHJvdWJsZVxuICAgICAgICAgICAgICAgICAgLy8gY29ubmVjdGluZyB0byBNb25nbyksIGxldCdzIGp1c3QgYWJhbmRvbiB0aGUgZmV0Y2ggcGhhc2VcbiAgICAgICAgICAgICAgICAgIC8vIGFsdG9nZXRoZXIgYW5kIGZhbGwgYmFjayB0byBwb2xsaW5nLiBJdCdzIG5vdCBsaWtlIHdlJ3JlXG4gICAgICAgICAgICAgICAgICAvLyBnZXR0aW5nIGxpdmUgdXBkYXRlcyBhbnl3YXkuXG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGhhc2UgIT09IFBIQVNFLlFVRVJZSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICFzZWxmLl9zdG9wcGVkICYmXG4gICAgICAgICAgICAgICAgICBzZWxmLl9waGFzZSA9PT0gUEhBU0UuRkVUQ0hJTkcgJiZcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2ZldGNoR2VuZXJhdGlvbiA9PT0gdGhpc0dlbmVyYXRpb25cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdlIHJlLWNoZWNrIHRoZSBnZW5lcmF0aW9uIGluIGNhc2Ugd2UndmUgaGFkIGFuIGV4cGxpY2l0XG4gICAgICAgICAgICAgICAgICAvLyBfcG9sbFF1ZXJ5IGNhbGwgKGVnLCBpbiBhbm90aGVyIGZpYmVyKSB3aGljaCBzaG91bGRcbiAgICAgICAgICAgICAgICAgIC8vIGVmZmVjdGl2ZWx5IGNhbmNlbCB0aGlzIHJvdW5kIG9mIGZldGNoZXMuICAoX3BvbGxRdWVyeVxuICAgICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50cyB0aGUgZ2VuZXJhdGlvbi4pXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIGRvYyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZldGNoUHJvbWlzZXMucHVzaChmZXRjaFByb21pc2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gV2FpdCBmb3IgYWxsIGZldGNoIG9wZXJhdGlvbnMgdG8gY29tcGxldGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKGZldGNoUHJvbWlzZXMpO1xuICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHJlc3VsdHNcbiAgICAgICAgICAgIC5maWx0ZXIocmVzdWx0ID0+IHJlc3VsdC5zdGF0dXMgPT09ICdyZWplY3RlZCcpXG4gICAgICAgICAgICAubWFwKHJlc3VsdCA9PiByZXN1bHQucmVhc29uKTtcblxuICAgICAgICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnU29tZSBmZXRjaCBxdWVyaWVzIGZhaWxlZDonLCBlcnJvcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnR290IGFuIGV4Y2VwdGlvbiBpbiBhIGZldGNoIHF1ZXJ5JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFeGl0IG5vdyBpZiB3ZSd2ZSBoYWQgYSBfcG9sbFF1ZXJ5IGNhbGwgKGhlcmUgb3IgaW4gYW5vdGhlciBmaWJlcikuXG4gICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZWxmLl9jdXJyZW50bHlGZXRjaGluZyA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyBXZSdyZSBkb25lIGZldGNoaW5nLCBzbyB3ZSBjYW4gYmUgc3RlYWR5LCB1bmxlc3Mgd2UndmUgaGFkIGFcbiAgICAgIC8vIF9wb2xsUXVlcnkgY2FsbCAoaGVyZSBvciBpbiBhbm90aGVyIGZpYmVyKS5cbiAgICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICAgIGF3YWl0IHNlbGYuX2JlU3RlYWR5KCk7XG4gICAgfSkpO1xuICB9LFxuICBfYmVTdGVhZHk6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5TVEVBRFkpO1xuICAgIHZhciB3cml0ZXMgPSBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5IHx8IFtdO1xuICAgIHNlbGYuX3dyaXRlc1RvQ29tbWl0V2hlbldlUmVhY2hTdGVhZHkgPSBbXTtcbiAgICBhd2FpdCBzZWxmLl9tdWx0aXBsZXhlci5vbkZsdXNoKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAoY29uc3QgdyBvZiB3cml0ZXMpIHtcbiAgICAgICAgICBhd2FpdCB3LmNvbW1pdHRlZCgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJfYmVTdGVhZHkgZXJyb3JcIiwge3dyaXRlc30sIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaGFuZGxlT3Bsb2dFbnRyeVF1ZXJ5aW5nOiBmdW5jdGlvbiAob3ApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fbmVlZFRvRmV0Y2guc2V0KGlkRm9yT3Aob3ApLCBvcCk7XG4gICAgfSk7XG4gIH0sXG4gIF9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZzogZnVuY3Rpb24gKG9wKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpZCA9IGlkRm9yT3Aob3ApO1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSBmZXRjaGluZyB0aGlzIG9uZSwgb3IgYWJvdXQgdG8sIHdlIGNhbid0IG9wdGltaXplO1xuICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgd2UgZmV0Y2ggaXQgYWdhaW4gaWYgbmVjZXNzYXJ5LlxuXG4gICAgICBpZiAoc2VsZi5fcGhhc2UgPT09IFBIQVNFLkZFVENISU5HICYmXG4gICAgICAgICAgKChzZWxmLl9jdXJyZW50bHlGZXRjaGluZyAmJiBzZWxmLl9jdXJyZW50bHlGZXRjaGluZy5oYXMoaWQpKSB8fFxuICAgICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5oYXMoaWQpKSkge1xuICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5zZXQoaWQsIG9wKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob3Aub3AgPT09ICdkJykge1xuICAgICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkgfHxcbiAgICAgICAgICAgIChzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpKSlcbiAgICAgICAgICBzZWxmLl9yZW1vdmVNYXRjaGluZyhpZCk7XG4gICAgICB9IGVsc2UgaWYgKG9wLm9wID09PSAnaScpIHtcbiAgICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImluc2VydCBmb3VuZCBmb3IgYWxyZWFkeS1leGlzdGluZyBJRCBpbiBwdWJsaXNoZWRcIik7XG4gICAgICAgIGlmIChzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlciAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImluc2VydCBmb3VuZCBmb3IgYWxyZWFkeS1leGlzdGluZyBJRCBpbiBidWZmZXJcIik7XG5cbiAgICAgICAgLy8gWFhYIHdoYXQgaWYgc2VsZWN0b3IgeWllbGRzPyAgZm9yIG5vdyBpdCBjYW4ndCBidXQgbGF0ZXIgaXQgY291bGRcbiAgICAgICAgLy8gaGF2ZSAkd2hlcmVcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKG9wLm8pLnJlc3VsdClcbiAgICAgICAgICBzZWxmLl9hZGRNYXRjaGluZyhvcC5vKTtcbiAgICAgIH0gZWxzZSBpZiAob3Aub3AgPT09ICd1Jykge1xuICAgICAgICAvLyB3ZSBhcmUgbWFwcGluZyB0aGUgbmV3IG9wbG9nIGZvcm1hdCBvbiBtb25nbyA1XG4gICAgICAgIC8vIHRvIHdoYXQgd2Uga25vdyBiZXR0ZXIsICRzZXRcbiAgICAgICAgb3AubyA9IG9wbG9nVjJWMUNvbnZlcnRlcihvcC5vKVxuICAgICAgICAvLyBJcyB0aGlzIGEgbW9kaWZpZXIgKCRzZXQvJHVuc2V0LCB3aGljaCBtYXkgcmVxdWlyZSB1cyB0byBwb2xsIHRoZVxuICAgICAgICAvLyBkYXRhYmFzZSB0byBmaWd1cmUgb3V0IGlmIHRoZSB3aG9sZSBkb2N1bWVudCBtYXRjaGVzIHRoZSBzZWxlY3Rvcikgb3JcbiAgICAgICAgLy8gYSByZXBsYWNlbWVudCAoaW4gd2hpY2ggY2FzZSB3ZSBjYW4ganVzdCBkaXJlY3RseSByZS1ldmFsdWF0ZSB0aGVcbiAgICAgICAgLy8gc2VsZWN0b3IpP1xuICAgICAgICAvLyBvcGxvZyBmb3JtYXQgaGFzIGNoYW5nZWQgb24gbW9uZ29kYiA1LCB3ZSBoYXZlIHRvIHN1cHBvcnQgYm90aCBub3dcbiAgICAgICAgLy8gZGlmZiBpcyB0aGUgZm9ybWF0IGluIE1vbmdvIDUrIChvcGxvZyB2MilcbiAgICAgICAgdmFyIGlzUmVwbGFjZSA9ICFoYXMob3AubywgJyRzZXQnKSAmJiAhaGFzKG9wLm8sICdkaWZmJykgJiYgIWhhcyhvcC5vLCAnJHVuc2V0Jyk7XG4gICAgICAgIC8vIElmIHRoaXMgbW9kaWZpZXIgbW9kaWZpZXMgc29tZXRoaW5nIGluc2lkZSBhbiBFSlNPTiBjdXN0b20gdHlwZSAoaWUsXG4gICAgICAgIC8vIGFueXRoaW5nIHdpdGggRUpTT04kKSwgdGhlbiB3ZSBjYW4ndCB0cnkgdG8gdXNlXG4gICAgICAgIC8vIExvY2FsQ29sbGVjdGlvbi5fbW9kaWZ5LCBzaW5jZSB0aGF0IGp1c3QgbXV0YXRlcyB0aGUgRUpTT04gZW5jb2RpbmcsXG4gICAgICAgIC8vIG5vdCB0aGUgYWN0dWFsIG9iamVjdC5cbiAgICAgICAgdmFyIGNhbkRpcmVjdGx5TW9kaWZ5RG9jID1cbiAgICAgICAgICAhaXNSZXBsYWNlICYmIG1vZGlmaWVyQ2FuQmVEaXJlY3RseUFwcGxpZWQob3Aubyk7XG5cbiAgICAgICAgdmFyIHB1Ymxpc2hlZEJlZm9yZSA9IHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpO1xuICAgICAgICB2YXIgYnVmZmVyZWRCZWZvcmUgPSBzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpO1xuXG4gICAgICAgIGlmIChpc1JlcGxhY2UpIHtcbiAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIE9iamVjdC5hc3NpZ24oe19pZDogaWR9LCBvcC5vKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoKHB1Ymxpc2hlZEJlZm9yZSB8fCBidWZmZXJlZEJlZm9yZSkgJiZcbiAgICAgICAgICAgICAgICAgICBjYW5EaXJlY3RseU1vZGlmeURvYykge1xuICAgICAgICAgIC8vIE9oIGdyZWF0LCB3ZSBhY3R1YWxseSBrbm93IHdoYXQgdGhlIGRvY3VtZW50IGlzLCBzbyB3ZSBjYW4gYXBwbHlcbiAgICAgICAgICAvLyB0aGlzIGRpcmVjdGx5LlxuICAgICAgICAgIHZhciBuZXdEb2MgPSBzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKVxuICAgICAgICAgICAgPyBzZWxmLl9wdWJsaXNoZWQuZ2V0KGlkKSA6IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChpZCk7XG4gICAgICAgICAgbmV3RG9jID0gRUpTT04uY2xvbmUobmV3RG9jKTtcblxuICAgICAgICAgIG5ld0RvYy5faWQgPSBpZDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl9tb2RpZnkobmV3RG9jLCBvcC5vKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5uYW1lICE9PSBcIk1pbmltb25nb0Vycm9yXCIpXG4gICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAvLyBXZSBkaWRuJ3QgdW5kZXJzdGFuZCB0aGUgbW9kaWZpZXIuICBSZS1mZXRjaC5cbiAgICAgICAgICAgIHNlbGYuX25lZWRUb0ZldGNoLnNldChpZCwgb3ApO1xuICAgICAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5TVEVBRFkpIHtcbiAgICAgICAgICAgICAgc2VsZi5fZmV0Y2hNb2RpZmllZERvY3VtZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIHNlbGYuX3NoYXJlZFByb2plY3Rpb25GbihuZXdEb2MpKTtcbiAgICAgICAgfSBlbHNlIGlmICghY2FuRGlyZWN0bHlNb2RpZnlEb2MgfHxcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9tYXRjaGVyLmNhbkJlY29tZVRydWVCeU1vZGlmaWVyKG9wLm8pIHx8XG4gICAgICAgICAgICAgICAgICAgKHNlbGYuX3NvcnRlciAmJiBzZWxmLl9zb3J0ZXIuYWZmZWN0ZWRCeU1vZGlmaWVyKG9wLm8pKSkge1xuICAgICAgICAgIHNlbGYuX25lZWRUb0ZldGNoLnNldChpZCwgb3ApO1xuICAgICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuU1RFQURZKVxuICAgICAgICAgICAgc2VsZi5fZmV0Y2hNb2RpZmllZERvY3VtZW50cygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcihcIlhYWCBTVVJQUklTSU5HIE9QRVJBVElPTjogXCIgKyBvcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYXN5bmMgX3J1bkluaXRpYWxRdWVyeUFzeW5jKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9wbG9nIHN0b3BwZWQgc3VycHJpc2luZ2x5IGVhcmx5XCIpO1xuXG4gICAgYXdhaXQgc2VsZi5fcnVuUXVlcnkoe2luaXRpYWw6IHRydWV9KTsgIC8vIHlpZWxkc1xuXG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICByZXR1cm47ICAvLyBjYW4gaGFwcGVuIG9uIHF1ZXJ5RXJyb3JcblxuICAgIC8vIEFsbG93IG9ic2VydmVDaGFuZ2VzIGNhbGxzIHRvIHJldHVybi4gKEFmdGVyIHRoaXMsIGl0J3MgcG9zc2libGUgZm9yXG4gICAgLy8gc3RvcCgpIHRvIGJlIGNhbGxlZC4pXG4gICAgYXdhaXQgc2VsZi5fbXVsdGlwbGV4ZXIucmVhZHkoKTtcblxuICAgIGF3YWl0IHNlbGYuX2RvbmVRdWVyeWluZygpOyAgLy8geWllbGRzXG4gIH0sXG5cbiAgLy8gWWllbGRzIVxuICBfcnVuSW5pdGlhbFF1ZXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3J1bkluaXRpYWxRdWVyeUFzeW5jKCk7XG4gIH0sXG5cbiAgLy8gSW4gdmFyaW91cyBjaXJjdW1zdGFuY2VzLCB3ZSBtYXkganVzdCB3YW50IHRvIHN0b3AgcHJvY2Vzc2luZyB0aGUgb3Bsb2cgYW5kXG4gIC8vIHJlLXJ1biB0aGUgaW5pdGlhbCBxdWVyeSwganVzdCBhcyBpZiB3ZSB3ZXJlIGEgUG9sbGluZ09ic2VydmVEcml2ZXIuXG4gIC8vXG4gIC8vIFRoaXMgZnVuY3Rpb24gbWF5IG5vdCBibG9jaywgYmVjYXVzZSBpdCBpcyBjYWxsZWQgZnJvbSBhbiBvcGxvZyBlbnRyeVxuICAvLyBoYW5kbGVyLlxuICAvL1xuICAvLyBYWFggV2Ugc2hvdWxkIGNhbGwgdGhpcyB3aGVuIHdlIGRldGVjdCB0aGF0IHdlJ3ZlIGJlZW4gaW4gRkVUQ0hJTkcgZm9yIFwidG9vXG4gIC8vIGxvbmdcIi5cbiAgLy9cbiAgLy8gWFhYIFdlIHNob3VsZCBjYWxsIHRoaXMgd2hlbiB3ZSBkZXRlY3QgTW9uZ28gZmFpbG92ZXIgKHNpbmNlIHRoYXQgbWlnaHRcbiAgLy8gbWVhbiB0aGF0IHNvbWUgb2YgdGhlIG9wbG9nIGVudHJpZXMgd2UgaGF2ZSBwcm9jZXNzZWQgaGF2ZSBiZWVuIHJvbGxlZFxuICAvLyBiYWNrKS4gVGhlIE5vZGUgTW9uZ28gZHJpdmVyIGlzIGluIHRoZSBtaWRkbGUgb2YgYSBidW5jaCBvZiBodWdlXG4gIC8vIHJlZmFjdG9yaW5ncywgaW5jbHVkaW5nIHRoZSB3YXkgdGhhdCBpdCBub3RpZmllcyB5b3Ugd2hlbiBwcmltYXJ5XG4gIC8vIGNoYW5nZXMuIFdpbGwgcHV0IG9mZiBpbXBsZW1lbnRpbmcgdGhpcyB1bnRpbCBkcml2ZXIgMS40IGlzIG91dC5cbiAgX3BvbGxRdWVyeTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyBZYXksIHdlIGdldCB0byBmb3JnZXQgYWJvdXQgYWxsIHRoZSB0aGluZ3Mgd2UgdGhvdWdodCB3ZSBoYWQgdG8gZmV0Y2guXG4gICAgICBzZWxmLl9uZWVkVG9GZXRjaCA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICAgICAgKytzZWxmLl9mZXRjaEdlbmVyYXRpb247ICAvLyBpZ25vcmUgYW55IGluLWZsaWdodCBmZXRjaGVzXG4gICAgICBzZWxmLl9yZWdpc3RlclBoYXNlQ2hhbmdlKFBIQVNFLlFVRVJZSU5HKTtcblxuICAgICAgLy8gRGVmZXIgc28gdGhhdCB3ZSBkb24ndCB5aWVsZC4gIFdlIGRvbid0IG5lZWQgZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnlcbiAgICAgIC8vIGhlcmUgYmVjYXVzZSBTd2l0Y2hlZFRvUXVlcnkgaXMgbm90IHRocm93biBpbiBRVUVSWUlORyBtb2RlLlxuICAgICAgTWV0ZW9yLmRlZmVyKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXdhaXQgc2VsZi5fcnVuUXVlcnkoKTtcbiAgICAgICAgYXdhaXQgc2VsZi5fZG9uZVF1ZXJ5aW5nKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBZaWVsZHMhXG4gIGFzeW5jIF9ydW5RdWVyeUFzeW5jKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcjtcblxuICAgIC8vIFRoaXMgd2hpbGUgbG9vcCBpcyBqdXN0IHRvIHJldHJ5IGZhaWx1cmVzLlxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBiZWVuIHN0b3BwZWQsIHdlIGRvbid0IGhhdmUgdG8gcnVuIGFueXRoaW5nIGFueSBtb3JlLlxuICAgICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgbmV3UmVzdWx0cyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgbmV3QnVmZmVyID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG5cbiAgICAgIC8vIFF1ZXJ5IDJ4IGRvY3VtZW50cyBhcyB0aGUgaGFsZiBleGNsdWRlZCBmcm9tIHRoZSBvcmlnaW5hbCBxdWVyeSB3aWxsIGdvXG4gICAgICAvLyBpbnRvIHVucHVibGlzaGVkIGJ1ZmZlciB0byByZWR1Y2UgYWRkaXRpb25hbCBNb25nbyBsb29rdXBzIGluIGNhc2VzXG4gICAgICAvLyB3aGVuIGRvY3VtZW50cyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBwdWJsaXNoZWQgc2V0IGFuZCBuZWVkIGFcbiAgICAgIC8vIHJlcGxhY2VtZW50LlxuICAgICAgLy8gWFhYIG5lZWRzIG1vcmUgdGhvdWdodCBvbiBub24temVybyBza2lwXG4gICAgICAvLyBYWFggMiBpcyBhIFwibWFnaWMgbnVtYmVyXCIgbWVhbmluZyB0aGVyZSBpcyBhbiBleHRyYSBjaHVuayBvZiBkb2NzIGZvclxuICAgICAgLy8gYnVmZmVyIGlmIHN1Y2ggaXMgbmVlZGVkLlxuICAgICAgdmFyIGN1cnNvciA9IHNlbGYuX2N1cnNvckZvclF1ZXJ5KHsgbGltaXQ6IHNlbGYuX2xpbWl0ICogMiB9KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGN1cnNvci5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGkpIHsgIC8vIHlpZWxkc1xuICAgICAgICAgIGlmICghc2VsZi5fbGltaXQgfHwgaSA8IHNlbGYuX2xpbWl0KSB7XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChkb2MuX2lkLCBkb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdCdWZmZXIuc2V0KGRvYy5faWQsIGRvYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmluaXRpYWwgJiYgdHlwZW9mKGUuY29kZSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBhbiBlcnJvciBkb2N1bWVudCBzZW50IHRvIHVzIGJ5IG1vbmdvZCwgbm90IGEgY29ubmVjdGlvblxuICAgICAgICAgIC8vIGVycm9yIGdlbmVyYXRlZCBieSB0aGUgY2xpZW50LiBBbmQgd2UndmUgbmV2ZXIgc2VlbiB0aGlzIHF1ZXJ5IHdvcmtcbiAgICAgICAgICAvLyBzdWNjZXNzZnVsbHkuIFByb2JhYmx5IGl0J3MgYSBiYWQgc2VsZWN0b3Igb3Igc29tZXRoaW5nLCBzbyB3ZVxuICAgICAgICAgIC8vIHNob3VsZCBOT1QgcmV0cnkuIEluc3RlYWQsIHdlIHNob3VsZCBoYWx0IHRoZSBvYnNlcnZlICh3aGljaCBlbmRzXG4gICAgICAgICAgLy8gdXAgY2FsbGluZyBgc3RvcGAgb24gdXMpLlxuICAgICAgICAgIGF3YWl0IHNlbGYuX211bHRpcGxleGVyLnF1ZXJ5RXJyb3IoZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHVyaW5nIGZhaWxvdmVyIChlZykgaWYgd2UgZ2V0IGFuIGV4Y2VwdGlvbiB3ZSBzaG91bGQgbG9nIGFuZCByZXRyeVxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGNyYXNoaW5nLlxuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiR290IGV4Y2VwdGlvbiB3aGlsZSBwb2xsaW5nIHF1ZXJ5XCIsIGUpO1xuICAgICAgICBhd2FpdCBNZXRlb3IuX3NsZWVwRm9yTXMoMTAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcblxuICAgIHNlbGYuX3B1Ymxpc2hOZXdSZXN1bHRzKG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcik7XG4gIH0sXG5cbiAgLy8gWWllbGRzIVxuICBfcnVuUXVlcnk6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX3J1blF1ZXJ5QXN5bmMob3B0aW9ucyk7XG4gIH0sXG5cbiAgLy8gVHJhbnNpdGlvbnMgdG8gUVVFUllJTkcgYW5kIHJ1bnMgYW5vdGhlciBxdWVyeSwgb3IgKGlmIGFscmVhZHkgaW4gUVVFUllJTkcpXG4gIC8vIGVuc3VyZXMgdGhhdCB3ZSB3aWxsIHF1ZXJ5IGFnYWluIGxhdGVyLlxuICAvL1xuICAvLyBUaGlzIGZ1bmN0aW9uIG1heSBub3QgYmxvY2ssIGJlY2F1c2UgaXQgaXMgY2FsbGVkIGZyb20gYW4gb3Bsb2cgZW50cnlcbiAgLy8gaGFuZGxlci4gSG93ZXZlciwgaWYgd2Ugd2VyZSBub3QgYWxyZWFkeSBpbiB0aGUgUVVFUllJTkcgcGhhc2UsIGl0IHRocm93c1xuICAvLyBhbiBleGNlcHRpb24gdGhhdCBpcyBjYXVnaHQgYnkgdGhlIGNsb3Nlc3Qgc3Vycm91bmRpbmdcbiAgLy8gZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkgY2FsbDsgdGhpcyBlbnN1cmVzIHRoYXQgd2UgZG9uJ3QgY29udGludWUgcnVubmluZ1xuICAvLyBjbG9zZSB0aGF0IHdhcyBkZXNpZ25lZCBmb3IgYW5vdGhlciBwaGFzZSBpbnNpZGUgUEhBU0UuUVVFUllJTkcuXG4gIC8vXG4gIC8vIChJdCdzIGFsc28gbmVjZXNzYXJ5IHdoZW5ldmVyIGxvZ2ljIGluIHRoaXMgZmlsZSB5aWVsZHMgdG8gY2hlY2sgdGhhdCBvdGhlclxuICAvLyBwaGFzZXMgaGF2ZW4ndCBwdXQgdXMgaW50byBRVUVSWUlORyBtb2RlLCB0aG91Z2g7IGVnLFxuICAvLyBfZmV0Y2hNb2RpZmllZERvY3VtZW50cyBkb2VzIHRoaXMuKVxuICBfbmVlZFRvUG9sbFF1ZXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIElmIHdlJ3JlIG5vdCBhbHJlYWR5IGluIHRoZSBtaWRkbGUgb2YgYSBxdWVyeSwgd2UgY2FuIHF1ZXJ5IG5vd1xuICAgICAgLy8gKHBvc3NpYmx5IHBhdXNpbmcgRkVUQ0hJTkcpLlxuICAgICAgaWYgKHNlbGYuX3BoYXNlICE9PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICBzZWxmLl9wb2xsUXVlcnkoKTtcbiAgICAgICAgdGhyb3cgbmV3IFN3aXRjaGVkVG9RdWVyeTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UncmUgY3VycmVudGx5IGluIFFVRVJZSU5HLiBTZXQgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IHdlIHJ1biBhbm90aGVyXG4gICAgICAvLyBxdWVyeSB3aGVuIHdlJ3JlIGRvbmUuXG4gICAgICBzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkgPSB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFlpZWxkcyFcbiAgX2RvbmVRdWVyeWluZzogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgYXdhaXQgc2VsZi5fbW9uZ29IYW5kbGUuX29wbG9nSGFuZGxlLndhaXRVbnRpbENhdWdodFVwKCk7XG5cbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcblxuICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICB0aHJvdyBFcnJvcihcIlBoYXNlIHVuZXhwZWN0ZWRseSBcIiArIHNlbGYuX3BoYXNlKTtcblxuICAgIGlmIChzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkpIHtcbiAgICAgIHNlbGYuX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSA9IGZhbHNlO1xuICAgICAgc2VsZi5fcG9sbFF1ZXJ5KCk7XG4gICAgfSBlbHNlIGlmIChzZWxmLl9uZWVkVG9GZXRjaC5lbXB0eSgpKSB7XG4gICAgICBhd2FpdCBzZWxmLl9iZVN0ZWFkeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9mZXRjaE1vZGlmaWVkRG9jdW1lbnRzKCk7XG4gICAgfVxuICB9LFxuXG4gIF9jdXJzb3JGb3JRdWVyeTogZnVuY3Rpb24gKG9wdGlvbnNPdmVyd3JpdGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFRoZSBxdWVyeSB3ZSBydW4gaXMgYWxtb3N0IHRoZSBzYW1lIGFzIHRoZSBjdXJzb3Igd2UgYXJlIG9ic2VydmluZyxcbiAgICAgIC8vIHdpdGggYSBmZXcgY2hhbmdlcy4gV2UgbmVlZCB0byByZWFkIGFsbCB0aGUgZmllbGRzIHRoYXQgYXJlIHJlbGV2YW50IHRvXG4gICAgICAvLyB0aGUgc2VsZWN0b3IsIG5vdCBqdXN0IHRoZSBmaWVsZHMgd2UgYXJlIGdvaW5nIHRvIHB1Ymxpc2ggKHRoYXQncyB0aGVcbiAgICAgIC8vIFwic2hhcmVkXCIgcHJvamVjdGlvbikuIEFuZCB3ZSBkb24ndCB3YW50IHRvIGFwcGx5IGFueSB0cmFuc2Zvcm0gaW4gdGhlXG4gICAgICAvLyBjdXJzb3IsIGJlY2F1c2Ugb2JzZXJ2ZUNoYW5nZXMgc2hvdWxkbid0IHVzZSB0aGUgdHJhbnNmb3JtLlxuICAgICAgdmFyIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zKTtcblxuICAgICAgLy8gQWxsb3cgdGhlIGNhbGxlciB0byBtb2RpZnkgdGhlIG9wdGlvbnMuIFVzZWZ1bCB0byBzcGVjaWZ5IGRpZmZlcmVudFxuICAgICAgLy8gc2tpcCBhbmQgbGltaXQgdmFsdWVzLlxuICAgICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvcHRpb25zT3ZlcndyaXRlKTtcblxuICAgICAgb3B0aW9ucy5maWVsZHMgPSBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uO1xuICAgICAgZGVsZXRlIG9wdGlvbnMudHJhbnNmb3JtO1xuICAgICAgLy8gV2UgYXJlIE5PVCBkZWVwIGNsb25pbmcgZmllbGRzIG9yIHNlbGVjdG9yIGhlcmUsIHdoaWNoIHNob3VsZCBiZSBPSy5cbiAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG5ldyBDdXJzb3JEZXNjcmlwdGlvbihcbiAgICAgICAgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yLFxuICAgICAgICBvcHRpb25zKTtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHNlbGYuX21vbmdvSGFuZGxlLCBkZXNjcmlwdGlvbik7XG4gICAgfSk7XG4gIH0sXG5cblxuICAvLyBSZXBsYWNlIHNlbGYuX3B1Ymxpc2hlZCB3aXRoIG5ld1Jlc3VsdHMgKGJvdGggYXJlIElkTWFwcyksIGludm9raW5nIG9ic2VydmVcbiAgLy8gY2FsbGJhY2tzIG9uIHRoZSBtdWx0aXBsZXhlci5cbiAgLy8gUmVwbGFjZSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlciB3aXRoIG5ld0J1ZmZlci5cbiAgLy9cbiAgLy8gWFhYIFRoaXMgaXMgdmVyeSBzaW1pbGFyIHRvIExvY2FsQ29sbGVjdGlvbi5fZGlmZlF1ZXJ5VW5vcmRlcmVkQ2hhbmdlcy4gV2VcbiAgLy8gc2hvdWxkIHJlYWxseTogKGEpIFVuaWZ5IElkTWFwIGFuZCBPcmRlcmVkRGljdCBpbnRvIFVub3JkZXJlZC9PcmRlcmVkRGljdFxuICAvLyAoYikgUmV3cml0ZSBkaWZmLmpzIHRvIHVzZSB0aGVzZSBjbGFzc2VzIGluc3RlYWQgb2YgYXJyYXlzIGFuZCBvYmplY3RzLlxuICBfcHVibGlzaE5ld1Jlc3VsdHM6IGZ1bmN0aW9uIChuZXdSZXN1bHRzLCBuZXdCdWZmZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBJZiB0aGUgcXVlcnkgaXMgbGltaXRlZCBhbmQgdGhlcmUgaXMgYSBidWZmZXIsIHNodXQgZG93biBzbyBpdCBkb2Vzbid0XG4gICAgICAvLyBzdGF5IGluIGEgd2F5LlxuICAgICAgaWYgKHNlbGYuX2xpbWl0KSB7XG4gICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmNsZWFyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcnN0IHJlbW92ZSBhbnl0aGluZyB0aGF0J3MgZ29uZS4gQmUgY2FyZWZ1bCBub3QgdG8gbW9kaWZ5XG4gICAgICAvLyBzZWxmLl9wdWJsaXNoZWQgd2hpbGUgaXRlcmF0aW5nIG92ZXIgaXQuXG4gICAgICB2YXIgaWRzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHNlbGYuX3B1Ymxpc2hlZC5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGlkKSB7XG4gICAgICAgIGlmICghbmV3UmVzdWx0cy5oYXMoaWQpKVxuICAgICAgICAgIGlkc1RvUmVtb3ZlLnB1c2goaWQpO1xuICAgICAgfSk7XG4gICAgICBpZHNUb1JlbW92ZS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBzZWxmLl9yZW1vdmVQdWJsaXNoZWQoaWQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIE5vdyBkbyBhZGRzIGFuZCBjaGFuZ2VzLlxuICAgICAgLy8gSWYgc2VsZiBoYXMgYSBidWZmZXIgYW5kIGxpbWl0LCB0aGUgbmV3IGZldGNoZWQgcmVzdWx0IHdpbGwgYmVcbiAgICAgIC8vIGxpbWl0ZWQgY29ycmVjdGx5IGFzIHRoZSBxdWVyeSBoYXMgc29ydCBzcGVjaWZpZXIuXG4gICAgICBuZXdSZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgc2VsZi5faGFuZGxlRG9jKGlkLCBkb2MpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhbml0eS1jaGVjayB0aGF0IGV2ZXJ5dGhpbmcgd2UgdHJpZWQgdG8gcHV0IGludG8gX3B1Ymxpc2hlZCBlbmRlZCB1cFxuICAgICAgLy8gdGhlcmUuXG4gICAgICAvLyBYWFggaWYgdGhpcyBpcyBzbG93LCByZW1vdmUgaXQgbGF0ZXJcbiAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuc2l6ZSgpICE9PSBuZXdSZXN1bHRzLnNpemUoKSkge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKCdUaGUgTW9uZ28gc2VydmVyIGFuZCB0aGUgTWV0ZW9yIHF1ZXJ5IGRpc2FncmVlIG9uIGhvdyAnICtcbiAgICAgICAgICAnbWFueSBkb2N1bWVudHMgbWF0Y2ggeW91ciBxdWVyeS4gQ3Vyc29yIGRlc2NyaXB0aW9uOiAnLFxuICAgICAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2VsZi5fcHVibGlzaGVkLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgaWYgKCFuZXdSZXN1bHRzLmhhcyhpZCkpXG4gICAgICAgICAgdGhyb3cgRXJyb3IoXCJfcHVibGlzaGVkIGhhcyBhIGRvYyB0aGF0IG5ld1Jlc3VsdHMgZG9lc24ndDsgXCIgKyBpZCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRmluYWxseSwgcmVwbGFjZSB0aGUgYnVmZmVyXG4gICAgICBuZXdCdWZmZXIuZm9yRWFjaChmdW5jdGlvbiAoZG9jLCBpZCkge1xuICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChpZCwgZG9jKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBuZXdCdWZmZXIuc2l6ZSgpIDwgc2VsZi5fbGltaXQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gVGhpcyBzdG9wIGZ1bmN0aW9uIGlzIGludm9rZWQgZnJvbSB0aGUgb25TdG9wIG9mIHRoZSBPYnNlcnZlTXVsdGlwbGV4ZXIsIHNvXG4gIC8vIGl0IHNob3VsZG4ndCBhY3R1YWxseSBiZSBwb3NzaWJsZSB0byBjYWxsIGl0IHVudGlsIHRoZSBtdWx0aXBsZXhlciBpc1xuICAvLyByZWFkeS5cbiAgLy9cbiAgLy8gSXQncyBpbXBvcnRhbnQgdG8gY2hlY2sgc2VsZi5fc3RvcHBlZCBhZnRlciBldmVyeSBjYWxsIGluIHRoaXMgZmlsZSB0aGF0XG4gIC8vIGNhbiB5aWVsZCFcbiAgX3N0b3A6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcbiAgICBzZWxmLl9zdG9wcGVkID0gdHJ1ZTtcblxuICAgIC8vIE5vdGU6IHdlICpkb24ndCogdXNlIG11bHRpcGxleGVyLm9uRmx1c2ggaGVyZSBiZWNhdXNlIHRoaXMgc3RvcFxuICAgIC8vIGNhbGxiYWNrIGlzIGFjdHVhbGx5IGludm9rZWQgYnkgdGhlIG11bHRpcGxleGVyIGl0c2VsZiB3aGVuIGl0IGhhc1xuICAgIC8vIGRldGVybWluZWQgdGhhdCB0aGVyZSBhcmUgbm8gaGFuZGxlcyBsZWZ0LiBTbyBub3RoaW5nIGlzIGFjdHVhbGx5IGdvaW5nXG4gICAgLy8gdG8gZ2V0IGZsdXNoZWQgKGFuZCBpdCdzIHByb2JhYmx5IG5vdCB2YWxpZCB0byBjYWxsIG1ldGhvZHMgb24gdGhlXG4gICAgLy8gZHlpbmcgbXVsdGlwbGV4ZXIpLlxuICAgIGZvciAoY29uc3QgdyBvZiBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5KSB7XG4gICAgICBhd2FpdCB3LmNvbW1pdHRlZCgpO1xuICAgIH1cbiAgICBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5ID0gbnVsbDtcblxuICAgIC8vIFByb2FjdGl2ZWx5IGRyb3AgcmVmZXJlbmNlcyB0byBwb3RlbnRpYWxseSBiaWcgdGhpbmdzLlxuICAgIHNlbGYuX3B1Ymxpc2hlZCA9IG51bGw7XG4gICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgPSBudWxsO1xuICAgIHNlbGYuX25lZWRUb0ZldGNoID0gbnVsbDtcbiAgICBzZWxmLl9jdXJyZW50bHlGZXRjaGluZyA9IG51bGw7XG4gICAgc2VsZi5fb3Bsb2dFbnRyeUhhbmRsZSA9IG51bGw7XG4gICAgc2VsZi5fbGlzdGVuZXJzSGFuZGxlID0gbnVsbDtcblxuICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1vcGxvZ1wiLCAtMSk7XG5cbiAgICBmb3IgYXdhaXQgKGNvbnN0IGhhbmRsZSBvZiBzZWxmLl9zdG9wSGFuZGxlcykge1xuICAgICAgYXdhaXQgaGFuZGxlLnN0b3AoKTtcbiAgICB9XG4gIH0sXG4gIHN0b3A6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBhd2FpdCBzZWxmLl9zdG9wKCk7XG4gIH0sXG5cbiAgX3JlZ2lzdGVyUGhhc2VDaGFuZ2U6IGZ1bmN0aW9uIChwaGFzZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGU7XG5cbiAgICAgIGlmIChzZWxmLl9waGFzZSkge1xuICAgICAgICB2YXIgdGltZURpZmYgPSBub3cgLSBzZWxmLl9waGFzZVN0YXJ0VGltZTtcbiAgICAgICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJ0aW1lLXNwZW50LWluLVwiICsgc2VsZi5fcGhhc2UgKyBcIi1waGFzZVwiLCB0aW1lRGlmZik7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BoYXNlID0gcGhhc2U7XG4gICAgICBzZWxmLl9waGFzZVN0YXJ0VGltZSA9IG5vdztcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIERvZXMgb3VyIG9wbG9nIHRhaWxpbmcgY29kZSBzdXBwb3J0IHRoaXMgY3Vyc29yPyBGb3Igbm93LCB3ZSBhcmUgYmVpbmcgdmVyeVxuLy8gY29uc2VydmF0aXZlIGFuZCBhbGxvd2luZyBvbmx5IHNpbXBsZSBxdWVyaWVzIHdpdGggc2ltcGxlIG9wdGlvbnMuXG4vLyAoVGhpcyBpcyBhIFwic3RhdGljIG1ldGhvZFwiLilcbk9wbG9nT2JzZXJ2ZURyaXZlci5jdXJzb3JTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoY3Vyc29yRGVzY3JpcHRpb24sIG1hdGNoZXIpIHtcbiAgLy8gRmlyc3QsIGNoZWNrIHRoZSBvcHRpb25zLlxuICB2YXIgb3B0aW9ucyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG5cbiAgLy8gRGlkIHRoZSB1c2VyIHNheSBubyBleHBsaWNpdGx5P1xuICAvLyB1bmRlcnNjb3JlZCB2ZXJzaW9uIG9mIHRoZSBvcHRpb24gaXMgQ09NUEFUIHdpdGggMS4yXG4gIGlmIChvcHRpb25zLmRpc2FibGVPcGxvZyB8fCBvcHRpb25zLl9kaXNhYmxlT3Bsb2cpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIHNraXAgaXMgbm90IHN1cHBvcnRlZDogdG8gc3VwcG9ydCBpdCB3ZSB3b3VsZCBuZWVkIHRvIGtlZXAgdHJhY2sgb2YgYWxsXG4gIC8vIFwic2tpcHBlZFwiIGRvY3VtZW50cyBvciBhdCBsZWFzdCB0aGVpciBpZHMuXG4gIC8vIGxpbWl0IHcvbyBhIHNvcnQgc3BlY2lmaWVyIGlzIG5vdCBzdXBwb3J0ZWQ6IGN1cnJlbnQgaW1wbGVtZW50YXRpb24gbmVlZHMgYVxuICAvLyBkZXRlcm1pbmlzdGljIHdheSB0byBvcmRlciBkb2N1bWVudHMuXG4gIGlmIChvcHRpb25zLnNraXAgfHwgKG9wdGlvbnMubGltaXQgJiYgIW9wdGlvbnMuc29ydCkpIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiBhIGZpZWxkcyBwcm9qZWN0aW9uIG9wdGlvbiBpcyBnaXZlbiBjaGVjayBpZiBpdCBpcyBzdXBwb3J0ZWQgYnlcbiAgLy8gbWluaW1vbmdvIChzb21lIG9wZXJhdG9ycyBhcmUgbm90IHN1cHBvcnRlZCkuXG4gIGNvbnN0IGZpZWxkcyA9IG9wdGlvbnMuZmllbGRzIHx8IG9wdGlvbnMucHJvamVjdGlvbjtcbiAgaWYgKGZpZWxkcykge1xuICAgIHRyeSB7XG4gICAgICBMb2NhbENvbGxlY3Rpb24uX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbihmaWVsZHMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgPT09IFwiTWluaW1vbmdvRXJyb3JcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGRvbid0IGFsbG93IHRoZSBmb2xsb3dpbmcgc2VsZWN0b3JzOlxuICAvLyAgIC0gJHdoZXJlIChub3QgY29uZmlkZW50IHRoYXQgd2UgcHJvdmlkZSB0aGUgc2FtZSBKUyBlbnZpcm9ubWVudFxuICAvLyAgICAgICAgICAgICBhcyBNb25nbywgYW5kIGNhbiB5aWVsZCEpXG4gIC8vICAgLSAkbmVhciAoaGFzIFwiaW50ZXJlc3RpbmdcIiBwcm9wZXJ0aWVzIGluIE1vbmdvREIsIGxpa2UgdGhlIHBvc3NpYmlsaXR5XG4gIC8vICAgICAgICAgICAgb2YgcmV0dXJuaW5nIGFuIElEIG11bHRpcGxlIHRpbWVzLCB0aG91Z2ggZXZlbiBwb2xsaW5nIG1heWJlXG4gIC8vICAgICAgICAgICAgaGF2ZSBhIGJ1ZyB0aGVyZSlcbiAgLy8gICAgICAgICAgIFhYWDogb25jZSB3ZSBzdXBwb3J0IGl0LCB3ZSB3b3VsZCBuZWVkIHRvIHRoaW5rIG1vcmUgb24gaG93IHdlXG4gIC8vICAgICAgICAgICBpbml0aWFsaXplIHRoZSBjb21wYXJhdG9ycyB3aGVuIHdlIGNyZWF0ZSB0aGUgZHJpdmVyLlxuICByZXR1cm4gIW1hdGNoZXIuaGFzV2hlcmUoKSAmJiAhbWF0Y2hlci5oYXNHZW9RdWVyeSgpO1xufTtcblxudmFyIG1vZGlmaWVyQ2FuQmVEaXJlY3RseUFwcGxpZWQgPSBmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG1vZGlmaWVyKS5ldmVyeShmdW5jdGlvbiAoW29wZXJhdGlvbiwgZmllbGRzXSkge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhmaWVsZHMpLmV2ZXJ5KGZ1bmN0aW9uIChbZmllbGQsIHZhbHVlXSkge1xuICAgICAgcmV0dXJuICEvRUpTT05cXCQvLnRlc3QoZmllbGQpO1xuICAgIH0pO1xuICB9KTtcbn07IiwiLyoqXG4gKiBDb252ZXJ0ZXIgbW9kdWxlIGZvciB0aGUgbmV3IE1vbmdvREIgT3Bsb2cgZm9ybWF0ICg+PTUuMCkgdG8gdGhlIG9uZSB0aGF0IE1ldGVvclxuICogaGFuZGxlcyB3ZWxsLCBpLmUuLCBgJHNldGAgYW5kIGAkdW5zZXRgLiBUaGUgbmV3IGZvcm1hdCBpcyBjb21wbGV0ZWx5IG5ldyxcbiAqIGFuZCBsb29rcyBhcyBmb2xsb3dzOlxuICpcbiAqIGBgYGpzXG4gKiB7ICR2OiAyLCBkaWZmOiBEaWZmIH1cbiAqIGBgYFxuICpcbiAqIHdoZXJlIGBEaWZmYCBpcyBhIHJlY3Vyc2l2ZSBzdHJ1Y3R1cmU6XG4gKiBgYGBqc1xuICoge1xuICogICAvLyBOZXN0ZWQgdXBkYXRlcyAoc29tZXRpbWVzIGFsc28gcmVwcmVzZW50ZWQgd2l0aCBhbiBzLWZpZWxkKS5cbiAqICAgLy8gRXhhbXBsZTogYHsgJHNldDogeyAnZm9vLmJhcic6IDEgfSB9YC5cbiAqICAgaTogeyA8a2V5PjogPHZhbHVlPiwgLi4uIH0sXG4gKlxuICogICAvLyBUb3AtbGV2ZWwgdXBkYXRlcy5cbiAqICAgLy8gRXhhbXBsZTogYHsgJHNldDogeyBmb286IHsgYmFyOiAxIH0gfSB9YC5cbiAqICAgdTogeyA8a2V5PjogPHZhbHVlPiwgLi4uIH0sXG4gKlxuICogICAvLyBVbnNldHMuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICR1bnNldDogeyBmb286ICcnIH0gfWAuXG4gKiAgIGQ6IHsgPGtleT46IGZhbHNlLCAuLi4gfSxcbiAqXG4gKiAgIC8vIEFycmF5IG9wZXJhdGlvbnMuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRwdXNoOiB7IGZvbzogJ2JhcicgfSB9YC5cbiAqICAgczxrZXk+OiB7IGE6IHRydWUsIHU8aW5kZXg+OiA8dmFsdWU+LCAuLi4gfSxcbiAqICAgLi4uXG4gKlxuICogICAvLyBOZXN0ZWQgb3BlcmF0aW9ucyAoc29tZXRpbWVzIGFsc28gcmVwcmVzZW50ZWQgaW4gdGhlIGBpYCBmaWVsZCkuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRzZXQ6IHsgJ2Zvby5iYXInOiAxIH0gfWAuXG4gKiAgIHM8a2V5PjogRGlmZixcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAoYWxsIGZpZWxkcyBhcmUgb3B0aW9uYWwpXG4gKi9cblxuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nO1xuXG5pbnRlcmZhY2UgT3Bsb2dFbnRyeSB7XG4gICR2OiBudW1iZXI7XG4gIGRpZmY/OiBPcGxvZ0RpZmY7XG4gICRzZXQ/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAkdW5zZXQ/OiBSZWNvcmQ8c3RyaW5nLCB0cnVlPjtcbn1cblxuaW50ZXJmYWNlIE9wbG9nRGlmZiB7XG4gIGk/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICB1PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgZD86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuICBba2V5OiBgcyR7c3RyaW5nfWBdOiBBcnJheU9wZXJhdG9yIHwgUmVjb3JkPHN0cmluZywgYW55Pjtcbn1cblxuaW50ZXJmYWNlIEFycmF5T3BlcmF0b3Ige1xuICBhOiB0cnVlO1xuICBba2V5OiBgdSR7bnVtYmVyfWBdOiBhbnk7XG59XG5cbmNvbnN0IGFycmF5T3BlcmF0b3JLZXlSZWdleCA9IC9eKGF8W3N1XVxcZCspJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgZmllbGQgaXMgYW4gYXJyYXkgb3BlcmF0b3Iga2V5IG9mIGZvcm0gJ2EnIG9yICdzMScgb3IgJ3UxJyBldGNcbiAqL1xuZnVuY3Rpb24gaXNBcnJheU9wZXJhdG9yS2V5KGZpZWxkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGFycmF5T3BlcmF0b3JLZXlSZWdleC50ZXN0KGZpZWxkKTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIHRvIGNoZWNrIGlmIGFuIG9wZXJhdG9yIGlzIGEgdmFsaWQgYXJyYXkgb3BlcmF0b3IuXG4gKiBBcnJheSBvcGVyYXRvcnMgaGF2ZSAnYTogdHJ1ZScgYW5kIGtleXMgdGhhdCBtYXRjaCB0aGUgYXJyYXlPcGVyYXRvcktleVJlZ2V4XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlPcGVyYXRvcihvcGVyYXRvcjogdW5rbm93bik6IG9wZXJhdG9yIGlzIEFycmF5T3BlcmF0b3Ige1xuICByZXR1cm4gKFxuICAgIG9wZXJhdG9yICE9PSBudWxsICYmXG4gICAgdHlwZW9mIG9wZXJhdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICdhJyBpbiBvcGVyYXRvciAmJlxuICAgIChvcGVyYXRvciBhcyBBcnJheU9wZXJhdG9yKS5hID09PSB0cnVlICYmXG4gICAgT2JqZWN0LmtleXMob3BlcmF0b3IpLmV2ZXJ5KGlzQXJyYXlPcGVyYXRvcktleSlcbiAgKTtcbn1cblxuLyoqXG4gKiBKb2lucyB0d28gcGFydHMgb2YgYSBmaWVsZCBwYXRoIHdpdGggYSBkb3QuXG4gKiBSZXR1cm5zIHRoZSBrZXkgaXRzZWxmIGlmIHByZWZpeCBpcyBlbXB0eS5cbiAqL1xuZnVuY3Rpb24gam9pbihwcmVmaXg6IHN0cmluZywga2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGZsYXR0ZW5zIGFuIG9iamVjdCBpbnRvIGEgdGFyZ2V0IG9iamVjdCB3aXRoIGRvdCBub3RhdGlvbiBwYXRocy5cbiAqIEhhbmRsZXMgc3BlY2lhbCBjYXNlczpcbiAqIC0gQXJyYXlzIGFyZSBhc3NpZ25lZCBkaXJlY3RseVxuICogLSBDdXN0b20gRUpTT04gdHlwZXMgYXJlIHByZXNlcnZlZFxuICogLSBNb25nby5PYmplY3RJRHMgYXJlIHByZXNlcnZlZFxuICogLSBQbGFpbiBvYmplY3RzIGFyZSByZWN1cnNpdmVseSBmbGF0dGVuZWRcbiAqIC0gRW1wdHkgb2JqZWN0cyBhcmUgYXNzaWduZWQgZGlyZWN0bHlcbiAqL1xuZnVuY3Rpb24gZmxhdHRlbk9iamVjdEludG8oXG4gIHRhcmdldDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgc291cmNlOiBhbnksXG4gIHByZWZpeDogc3RyaW5nXG4pOiB2b2lkIHtcbiAgaWYgKFxuICAgIEFycmF5LmlzQXJyYXkoc291cmNlKSB8fFxuICAgIHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnIHx8XG4gICAgc291cmNlID09PSBudWxsIHx8XG4gICAgc291cmNlIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQgfHxcbiAgICBFSlNPTi5faXNDdXN0b21UeXBlKHNvdXJjZSlcbiAgKSB7XG4gICAgdGFyZ2V0W3ByZWZpeF0gPSBzb3VyY2U7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHNvdXJjZSk7XG4gIGlmIChlbnRyaWVzLmxlbmd0aCkge1xuICAgIGVudHJpZXMuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBmbGF0dGVuT2JqZWN0SW50byh0YXJnZXQsIHZhbHVlLCBqb2luKHByZWZpeCwga2V5KSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0W3ByZWZpeF0gPSBzb3VyY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBvcGxvZyBkaWZmIHRvIGEgc2VyaWVzIG9mICRzZXQgYW5kICR1bnNldCBvcGVyYXRpb25zLlxuICogSGFuZGxlcyBzZXZlcmFsIHR5cGVzIG9mIG9wZXJhdGlvbnM6XG4gKiAtIERpcmVjdCB1bnNldHMgdmlhICdkJyBmaWVsZFxuICogLSBOZXN0ZWQgc2V0cyB2aWEgJ2knIGZpZWxkXG4gKiAtIFRvcC1sZXZlbCBzZXRzIHZpYSAndScgZmllbGRcbiAqIC0gQXJyYXkgb3BlcmF0aW9ucyBhbmQgbmVzdGVkIG9iamVjdHMgdmlhICdzJyBwcmVmaXhlZCBmaWVsZHNcbiAqXG4gKiBQcmVzZXJ2ZXMgdGhlIHN0cnVjdHVyZSBvZiBFSlNPTiBjdXN0b20gdHlwZXMgYW5kIE9iamVjdElEcyB3aGlsZVxuICogZmxhdHRlbmluZyBwYXRocyBpbnRvIGRvdCBub3RhdGlvbiBmb3IgTW9uZ29EQiB1cGRhdGVzLlxuICovXG5mdW5jdGlvbiBjb252ZXJ0T3Bsb2dEaWZmKFxuICBvcGxvZ0VudHJ5OiBPcGxvZ0VudHJ5LFxuICBkaWZmOiBPcGxvZ0RpZmYsXG4gIHByZWZpeCA9ICcnXG4pOiB2b2lkIHtcbiAgT2JqZWN0LmVudHJpZXMoZGlmZikuZm9yRWFjaCgoW2RpZmZLZXksIHZhbHVlXSkgPT4ge1xuICAgIGlmIChkaWZmS2V5ID09PSAnZCcpIHtcbiAgICAgIC8vIEhhbmRsZSBgJHVuc2V0YHNcbiAgICAgIG9wbG9nRW50cnkuJHVuc2V0ID8/PSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIG9wbG9nRW50cnkuJHVuc2V0IVtqb2luKHByZWZpeCwga2V5KV0gPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkaWZmS2V5ID09PSAnaScpIHtcbiAgICAgIC8vIEhhbmRsZSAocG90ZW50aWFsbHkpIG5lc3RlZCBgJHNldGBzXG4gICAgICBvcGxvZ0VudHJ5LiRzZXQgPz89IHt9O1xuICAgICAgZmxhdHRlbk9iamVjdEludG8ob3Bsb2dFbnRyeS4kc2V0LCB2YWx1ZSwgcHJlZml4KTtcbiAgICB9IGVsc2UgaWYgKGRpZmZLZXkgPT09ICd1Jykge1xuICAgICAgLy8gSGFuZGxlIGZsYXQgYCRzZXRgc1xuICAgICAgb3Bsb2dFbnRyeS4kc2V0ID8/PSB7fTtcbiAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChba2V5LCBmaWVsZFZhbHVlXSkgPT4ge1xuICAgICAgICBvcGxvZ0VudHJ5LiRzZXQhW2pvaW4ocHJlZml4LCBrZXkpXSA9IGZpZWxkVmFsdWU7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGRpZmZLZXkuc3RhcnRzV2l0aCgncycpKSB7XG4gICAgICAvLyBIYW5kbGUgcy1maWVsZHMgKGFycmF5IG9wZXJhdGlvbnMgYW5kIG5lc3RlZCBvYmplY3RzKVxuICAgICAgY29uc3Qga2V5ID0gZGlmZktleS5zbGljZSgxKTtcbiAgICAgIGlmIChpc0FycmF5T3BlcmF0b3IodmFsdWUpKSB7XG4gICAgICAgIC8vIEFycmF5IG9wZXJhdG9yXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChbcG9zaXRpb24sIGZpZWxkVmFsdWVdKSA9PiB7XG4gICAgICAgICAgaWYgKHBvc2l0aW9uID09PSAnYScpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uS2V5ID0gam9pbihwcmVmaXgsIGAke2tleX0uJHtwb3NpdGlvbi5zbGljZSgxKX1gKTtcbiAgICAgICAgICBpZiAocG9zaXRpb25bMF0gPT09ICdzJykge1xuICAgICAgICAgICAgY29udmVydE9wbG9nRGlmZihvcGxvZ0VudHJ5LCBmaWVsZFZhbHVlLCBwb3NpdGlvbktleSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaWVsZFZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiR1bnNldCA/Pz0ge307XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiR1bnNldFtwb3NpdGlvbktleV0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiRzZXQgPz89IHt9O1xuICAgICAgICAgICAgb3Bsb2dFbnRyeS4kc2V0W3Bvc2l0aW9uS2V5XSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICAgIC8vIE5lc3RlZCBvYmplY3RcbiAgICAgICAgY29udmVydE9wbG9nRGlmZihvcGxvZ0VudHJ5LCB2YWx1ZSwgam9pbihwcmVmaXgsIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBNb25nb0RCIHYyIG9wbG9nIGVudHJ5IHRvIHYxIGZvcm1hdC5cbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIGVudHJ5IHVuY2hhbmdlZCBpZiBpdCdzIG5vdCBhIHYyIG9wbG9nIGVudHJ5XG4gKiBvciBkb2Vzbid0IGNvbnRhaW4gYSBkaWZmIGZpZWxkLlxuICpcbiAqIFRoZSBjb252ZXJ0ZWQgZW50cnkgd2lsbCBjb250YWluICRzZXQgYW5kICR1bnNldCBvcGVyYXRpb25zIHRoYXQgYXJlXG4gKiBlcXVpdmFsZW50IHRvIHRoZSB2MiBkaWZmIGZvcm1hdCwgd2l0aCBwYXRocyBmbGF0dGVuZWQgdG8gZG90IG5vdGF0aW9uXG4gKiBhbmQgc3BlY2lhbCBoYW5kbGluZyBmb3IgRUpTT04gY3VzdG9tIHR5cGVzIGFuZCBPYmplY3RJRHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcGxvZ1YyVjFDb252ZXJ0ZXIob3Bsb2dFbnRyeTogT3Bsb2dFbnRyeSk6IE9wbG9nRW50cnkge1xuICBpZiAob3Bsb2dFbnRyeS4kdiAhPT0gMiB8fCAhb3Bsb2dFbnRyeS5kaWZmKSB7XG4gICAgcmV0dXJuIG9wbG9nRW50cnk7XG4gIH1cblxuICBjb25zdCBjb252ZXJ0ZWRPcGxvZ0VudHJ5OiBPcGxvZ0VudHJ5ID0geyAkdjogMiB9O1xuICBjb252ZXJ0T3Bsb2dEaWZmKGNvbnZlcnRlZE9wbG9nRW50cnksIG9wbG9nRW50cnkuZGlmZik7XG4gIHJldHVybiBjb252ZXJ0ZWRPcGxvZ0VudHJ5O1xufSIsIi8qKlxuICogTW9uZ29EQiBjb2xsYXRpb24gb3B0aW9ucyBmb3IgbG9jYWxlLWF3YXJlIHN0cmluZyBjb21wYXJpc29uLlxuICpcbiAqIEFsbCBvcHRpb25zIGFyZSBzdXBwb3J0ZWQgc2VydmVyLXNpZGUgdmlhIHRoZSBNb25nb0RCIGRyaXZlci5cbiAqIENsaWVudC1zaWRlIChNaW5pbW9uZ28pIHN1cHBvcnQgdXNlcyBgSW50bC5Db2xsYXRvcmAgYW5kIGlzIGxpbWl0ZWQgdG86XG4gKiBgbG9jYWxlYCwgYHN0cmVuZ3RoYCAoMeKAkzMpLCBgY2FzZUxldmVsYCwgYG51bWVyaWNPcmRlcmluZ2AsIGFuZCBgY2FzZUZpcnN0YC5cbiAqXG4gKiBPcHRpb25zIG1hcmtlZCAqKnNlcnZlci1vbmx5KiogYXJlIHNpbGVudGx5IGlnbm9yZWQgYnkgTWluaW1vbmdvLlxuICovXG5pbnRlcmZhY2UgQ29sbGF0aW9uT3B0aW9ucyB7XG4gIGxvY2FsZTogc3RyaW5nO1xuICBjYXNlTGV2ZWw/OiBib29sZWFuO1xuICBjYXNlRmlyc3Q/OiAndXBwZXInIHwgJ2xvd2VyJyB8ICdvZmYnO1xuICAvKipcbiAgICogQ29tcGFyaXNvbiBsZXZlbC4gTWluaW1vbmdvIHN1cHBvcnRzIDHigJMzIG9ubHkuXG4gICAqIFN0cmVuZ3RocyA0IGFuZCA1IGFyZSAqKnNlcnZlci1vbmx5KiogKG5vIGBJbnRsLkNvbGxhdG9yYCBlcXVpdmFsZW50KS5cbiAgICovXG4gIHN0cmVuZ3RoPzogMSB8IDIgfCAzIHwgNCB8IDU7XG4gIG51bWVyaWNPcmRlcmluZz86IGJvb2xlYW47XG4gIC8qKiAqKlNlcnZlci1vbmx5LioqIElnbm9yZWQgYnkgTWluaW1vbmdvLiAqL1xuICBhbHRlcm5hdGU/OiAnbm9uLWlnbm9yYWJsZScgfCAnc2hpZnRlZCc7XG4gIC8qKiAqKlNlcnZlci1vbmx5LioqIElnbm9yZWQgYnkgTWluaW1vbmdvLiAqL1xuICBtYXhWYXJpYWJsZT86ICdwdW5jdCcgfCAnc3BhY2UnO1xuICAvKiogKipTZXJ2ZXItb25seS4qKiBJZ25vcmVkIGJ5IE1pbmltb25nby4gKi9cbiAgYmFja3dhcmRzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEN1cnNvck9wdGlvbnMge1xuICBsaW1pdD86IG51bWJlcjtcbiAgc2tpcD86IG51bWJlcjtcbiAgc29ydD86IFJlY29yZDxzdHJpbmcsIDEgfCAtMT47XG4gIGZpZWxkcz86IFJlY29yZDxzdHJpbmcsIDEgfCAwPjtcbiAgcHJvamVjdGlvbj86IFJlY29yZDxzdHJpbmcsIDEgfCAwPjtcbiAgY29sbGF0aW9uPzogQ29sbGF0aW9uT3B0aW9ucztcbiAgZGlzYWJsZU9wbG9nPzogYm9vbGVhbjtcbiAgX2Rpc2FibGVPcGxvZz86IGJvb2xlYW47XG4gIHRhaWxhYmxlPzogYm9vbGVhbjtcbiAgdHJhbnNmb3JtPzogKGRvYzogYW55KSA9PiBhbnk7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgYXJndW1lbnRzIHVzZWQgdG8gY29uc3RydWN0IGEgY3Vyc29yLlxuICogVXNlZCBhcyBhIGtleSBmb3IgY3Vyc29yIGRlLWR1cGxpY2F0aW9uLlxuICpcbiAqIEFsbCBwcm9wZXJ0aWVzIG11c3QgYmUgZWl0aGVyOlxuICogLSBKU09OLXN0cmluZ2lmaWFibGUsIG9yXG4gKiAtIE5vdCBhZmZlY3Qgb2JzZXJ2ZUNoYW5nZXMgb3V0cHV0IChlLmcuLCBvcHRpb25zLnRyYW5zZm9ybSBmdW5jdGlvbnMpXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXJzb3JEZXNjcmlwdGlvbiB7XG4gIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmc7XG4gIHNlbGVjdG9yOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICBvcHRpb25zOiBDdXJzb3JPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcsIHNlbGVjdG9yOiBhbnksIG9wdGlvbnM/OiBDdXJzb3JPcHRpb25zKSB7XG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IGNvbGxlY3Rpb25OYW1lO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLnNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB9XG59IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBDTElFTlRfT05MWV9NRVRIT0RTLCBnZXRBc3luY01ldGhvZE5hbWUgfSBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBNaW5pTW9uZ29RdWVyeUVycm9yIH0gZnJvbSAnbWV0ZW9yL21pbmltb25nby9jb21tb24nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBBc3luY2hyb25vdXNDdXJzb3IgfSBmcm9tICcuL2FzeW5jaHJvbm91c19jdXJzb3InO1xuaW1wb3J0IHsgQ3Vyc29yIH0gZnJvbSAnLi9jdXJzb3InO1xuaW1wb3J0IHsgQ3Vyc29yRGVzY3JpcHRpb24gfSBmcm9tICcuL2N1cnNvcl9kZXNjcmlwdGlvbic7XG5pbXBvcnQgeyBEb2NGZXRjaGVyIH0gZnJvbSAnLi9kb2NfZmV0Y2hlcic7XG5pbXBvcnQgeyBNb25nb0RCLCBjb21wYXJlT3BlcmF0aW9uVGltZXMsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvLCByZXBsYWNlVHlwZXMsIHRyYW5zZm9ybVJlc3VsdCB9IGZyb20gJy4vbW9uZ29fY29tbW9uJztcbmltcG9ydCB7IE9ic2VydmVIYW5kbGUgfSBmcm9tICcuL29ic2VydmVfaGFuZGxlJztcbmltcG9ydCB7IE9ic2VydmVNdWx0aXBsZXhlciB9IGZyb20gJy4vb2JzZXJ2ZV9tdWx0aXBsZXgnO1xuaW1wb3J0IHsgT3Bsb2dPYnNlcnZlRHJpdmVyIH0gZnJvbSAnLi9vcGxvZ19vYnNlcnZlX2RyaXZlcic7XG5pbXBvcnQgeyBPUExPR19DT0xMRUNUSU9OLCBPcGxvZ0hhbmRsZSB9IGZyb20gJy4vb3Bsb2dfdGFpbGluZyc7XG5pbXBvcnQgeyBQb2xsaW5nT2JzZXJ2ZURyaXZlciB9IGZyb20gJy4vcG9sbGluZ19vYnNlcnZlX2RyaXZlcic7XG5pbXBvcnQgeyBDaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyIH0gZnJvbSAnLi9jaGFuZ2VzdHJlYW1fb2JzZXJ2ZV9kcml2ZXInO1xuaW1wb3J0IHsgU2hhcmVkQ2hhbmdlU3RyZWFtIH0gZnJvbSAnLi9zaGFyZWRfY2hhbmdlX3N0cmVhbSc7XG5cbmNvbnN0IEZJTEVfQVNTRVRfU1VGRklYID0gJ0Fzc2V0JztcbmNvbnN0IEFTU0VUU19GT0xERVIgPSAnYXNzZXRzJztcbmNvbnN0IEFQUF9GT0xERVIgPSAnYXBwJztcblxuY29uc3Qgb3Bsb2dDb2xsZWN0aW9uV2FybmluZ3MgPSBbXTtcbmNvbnN0IGF2YWlsYWJsZURyaXZlcnMgPSBbJ2NoYW5nZVN0cmVhbXMnLCAnb3Bsb2cnLCAncG9sbGluZyddXG5jb25zdCBERUZBVUxUX1JFQUNUSVZJVFlfT1JERVIgPSBwcm9jZXNzLmVudi5NRVRFT1JfUkVBQ1RJVklUWV9PUkRFUiA/IHByb2Nlc3MuZW52Lk1FVEVPUl9SRUFDVElWSVRZX09SREVSLnNwbGl0KCcsJykgOiBhdmFpbGFibGVEcml2ZXJzO1xuXG5jb25zdCByZWFjdGl2aXR5U2V0dGluZyA9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5yZWFjdGl2aXR5O1xuaWYgKEFycmF5LmlzQXJyYXkocmVhY3Rpdml0eVNldHRpbmcpKSB7XG4gIGZvciAoY29uc3QgbWV0aG9kIG9mIHJlYWN0aXZpdHlTZXR0aW5nKSB7XG4gICAgaWYgKCFhdmFpbGFibGVEcml2ZXJzLmluY2x1ZGVzKG1ldGhvZCkpIHsgIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIE1vbmdvIHJlYWN0aXZpdHkgbWV0aG9kIGluIHNldHRpbmdzOiAke21ldGhvZH1gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IE1vbmdvQ29ubmVjdGlvbiA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgc2VsZi5fb2JzZXJ2ZU11bHRpcGxleGVycyA9IHt9O1xuICBzZWxmLl9zaGFyZWRDaGFuZ2VTdHJlYW1zID0ge307XG4gIHNlbGYuX29uRmFpbG92ZXJIb29rID0gbmV3IEhvb2s7XG5cbiAgY29uc3QgdXNlck9wdGlvbnMgPSB7XG4gICAgLi4uKE1vbmdvLl9jb25uZWN0aW9uT3B0aW9ucyB8fCB7fSksXG4gICAgLi4uKE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5vcHRpb25zIHx8IHt9KVxuICB9O1xuXG4gIHZhciBtb25nb09wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICBpZ25vcmVVbmRlZmluZWQ6IHRydWUsXG4gIH0sIHVzZXJPcHRpb25zKTtcblxuXG4gIC8vIEludGVybmFsbHkgdGhlIG9wbG9nIGNvbm5lY3Rpb25zIHNwZWNpZnkgdGhlaXIgb3duIG1heFBvb2xTaXplXG4gIC8vIHdoaWNoIHdlIGRvbid0IHdhbnQgdG8gb3ZlcndyaXRlIHdpdGggYW55IHVzZXIgZGVmaW5lZCB2YWx1ZVxuICBpZiAoJ21heFBvb2xTaXplJyBpbiBvcHRpb25zKSB7XG4gICAgLy8gSWYgd2UganVzdCBzZXQgdGhpcyBmb3IgXCJzZXJ2ZXJcIiwgcmVwbFNldCB3aWxsIG92ZXJyaWRlIGl0LiBJZiB3ZSBqdXN0XG4gICAgLy8gc2V0IGl0IGZvciByZXBsU2V0LCBpdCB3aWxsIGJlIGlnbm9yZWQgaWYgd2UncmUgbm90IHVzaW5nIGEgcmVwbFNldC5cbiAgICBtb25nb09wdGlvbnMubWF4UG9vbFNpemUgPSBvcHRpb25zLm1heFBvb2xTaXplO1xuICB9XG4gIGlmICgnbWluUG9vbFNpemUnIGluIG9wdGlvbnMpIHtcbiAgICBtb25nb09wdGlvbnMubWluUG9vbFNpemUgPSBvcHRpb25zLm1pblBvb2xTaXplO1xuICB9XG5cbiAgLy8gVHJhbnNmb3JtIG9wdGlvbnMgbGlrZSBcInRsc0NBRmlsZUFzc2V0XCI6IFwiZmlsZW5hbWUucGVtXCIgaW50b1xuICAvLyBcInRsc0NBRmlsZVwiOiBcIi88ZnVsbHBhdGg+L2ZpbGVuYW1lLnBlbVwiXG4gIE9iamVjdC5lbnRyaWVzKG1vbmdvT3B0aW9ucyB8fCB7fSlcbiAgICAuZmlsdGVyKChba2V5XSkgPT4ga2V5ICYmIGtleS5lbmRzV2l0aChGSUxFX0FTU0VUX1NVRkZJWCkpXG4gICAgLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9uTmFtZSA9IGtleS5yZXBsYWNlKEZJTEVfQVNTRVRfU1VGRklYLCAnJyk7XG4gICAgICBtb25nb09wdGlvbnNbb3B0aW9uTmFtZV0gPSBwYXRoLmpvaW4oQXNzZXRzLmdldFNlcnZlckRpcigpLFxuICAgICAgICBBU1NFVFNfRk9MREVSLCBBUFBfRk9MREVSLCB2YWx1ZSk7XG4gICAgICBkZWxldGUgbW9uZ29PcHRpb25zW2tleV07XG4gICAgfSk7XG5cbiAgc2VsZi5kYiA9IG51bGw7XG4gIHNlbGYuX29wbG9nSGFuZGxlID0gbnVsbDtcbiAgc2VsZi5fZG9jRmV0Y2hlciA9IG51bGw7XG5cbiAgbW9uZ29PcHRpb25zLmRyaXZlckluZm8gPSB7XG4gICAgbmFtZTogJ01ldGVvcicsXG4gICAgdmVyc2lvbjogTWV0ZW9yLnJlbGVhc2VcbiAgfVxuXG4gIHNlbGYuY2xpZW50ID0gbmV3IE1vbmdvREIuTW9uZ29DbGllbnQodXJsLCBtb25nb09wdGlvbnMpO1xuICBzZWxmLmRiID0gc2VsZi5jbGllbnQuZGIoKTtcblxuICBzZWxmLmNsaWVudC5vbignc2VydmVyRGVzY3JpcHRpb25DaGFuZ2VkJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChldmVudCA9PiB7XG4gICAgLy8gV2hlbiB0aGUgY29ubmVjdGlvbiBpcyBubyBsb25nZXIgYWdhaW5zdCB0aGUgcHJpbWFyeSBub2RlLCBleGVjdXRlIGFsbFxuICAgIC8vIGZhaWxvdmVyIGhvb2tzLiBUaGlzIGlzIGltcG9ydGFudCBmb3IgdGhlIGRyaXZlciBhcyBpdCBoYXMgdG8gcmUtcG9vbCB0aGVcbiAgICAvLyBxdWVyeSB3aGVuIGl0IGhhcHBlbnMuXG4gICAgaWYgKFxuICAgICAgZXZlbnQucHJldmlvdXNEZXNjcmlwdGlvbi50eXBlICE9PSAnUlNQcmltYXJ5JyAmJlxuICAgICAgZXZlbnQubmV3RGVzY3JpcHRpb24udHlwZSA9PT0gJ1JTUHJpbWFyeSdcbiAgICApIHtcbiAgICAgIHNlbGYuX29uRmFpbG92ZXJIb29rLmVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSkpO1xuXG4gIGlmIChvcHRpb25zLm9wbG9nVXJsICYmICEgUGFja2FnZVsnZGlzYWJsZS1vcGxvZyddKSB7XG4gICAgc2VsZi5fb3Bsb2dIYW5kbGUgPSBuZXcgT3Bsb2dIYW5kbGUob3B0aW9ucy5vcGxvZ1VybCwgc2VsZi5kYi5kYXRhYmFzZU5hbWUpO1xuICAgIHNlbGYuX2RvY0ZldGNoZXIgPSBuZXcgRG9jRmV0Y2hlcihzZWxmKTtcbiAgfVxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fY2xvc2UgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICghIHNlbGYuZGIpXG4gICAgdGhyb3cgRXJyb3IoXCJjbG9zZSBjYWxsZWQgYmVmb3JlIENvbm5lY3Rpb24gY3JlYXRlZD9cIik7XG5cbiAgLy8gWFhYIHByb2JhYmx5IHVudGVzdGVkXG4gIHZhciBvcGxvZ0hhbmRsZSA9IHNlbGYuX29wbG9nSGFuZGxlO1xuICBzZWxmLl9vcGxvZ0hhbmRsZSA9IG51bGw7XG4gIGlmIChvcGxvZ0hhbmRsZSlcbiAgICBhd2FpdCBvcGxvZ0hhbmRsZS5zdG9wKCk7XG5cbiAgLy8gVXNlIEZ1dHVyZS53cmFwIHNvIHRoYXQgZXJyb3JzIGdldCB0aHJvd24uIFRoaXMgaGFwcGVucyB0b1xuICAvLyB3b3JrIGV2ZW4gb3V0c2lkZSBhIGZpYmVyIHNpbmNlIHRoZSAnY2xvc2UnIG1ldGhvZCBpcyBub3RcbiAgLy8gYWN0dWFsbHkgYXN5bmNocm9ub3VzLlxuICBhd2FpdCBzZWxmLmNsaWVudC5jbG9zZSgpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX2Nsb3NlKCk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9zZXRPcGxvZ0hhbmRsZSA9IGZ1bmN0aW9uKG9wbG9nSGFuZGxlKSB7XG4gIHRoaXMuX29wbG9nSGFuZGxlID0gb3Bsb2dIYW5kbGU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gUmV0dXJucyB0aGUgTW9uZ28gQ29sbGVjdGlvbiBvYmplY3Q7IG1heSB5aWVsZC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUucmF3Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCEgc2VsZi5kYilcbiAgICB0aHJvdyBFcnJvcihcInJhd0NvbGxlY3Rpb24gY2FsbGVkIGJlZm9yZSBDb25uZWN0aW9uIGNyZWF0ZWQ/XCIpO1xuXG4gIHJldHVybiBzZWxmLmRiLmNvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xufTtcblxuLy8gU2hhcmVkIGNoYW5nZSBzdHJlYW0gZm9yIGEgY29sbGVjdGlvbiwgY3JlYXRlZCBvbiBmaXJzdCB1c2UuIEl0IGRlcmVnaXN0ZXJzXG4vLyBpdHNlbGYgb25jZSBpdHMgbGFzdCBkcml2ZXIgZGV0YWNoZXMsIHNvIGEgbGF0ZXIgb2JzZXJ2ZXIgb3BlbnMgYSBmcmVzaCBvbmUuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9hY3F1aXJlU2hhcmVkQ2hhbmdlU3RyZWFtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBjb25zdCBleGlzdGluZyA9IHNlbGYuX3NoYXJlZENoYW5nZVN0cmVhbXNbY29sbGVjdGlvbk5hbWVdO1xuICBpZiAoZXhpc3RpbmcpIHtcbiAgICByZXR1cm4gZXhpc3Rpbmc7XG4gIH1cbiAgY29uc3Qgc2hhcmVkU3RyZWFtID0gbmV3IFNoYXJlZENoYW5nZVN0cmVhbShzZWxmLCBjb2xsZWN0aW9uTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChzZWxmLl9zaGFyZWRDaGFuZ2VTdHJlYW1zW2NvbGxlY3Rpb25OYW1lXSA9PT0gc2hhcmVkU3RyZWFtKSB7XG4gICAgICBkZWxldGUgc2VsZi5fc2hhcmVkQ2hhbmdlU3RyZWFtc1tjb2xsZWN0aW9uTmFtZV07XG4gICAgfVxuICB9KTtcbiAgc2VsZi5fc2hhcmVkQ2hhbmdlU3RyZWFtc1tjb2xsZWN0aW9uTmFtZV0gPSBzaGFyZWRTdHJlYW07XG4gIHJldHVybiBzaGFyZWRTdHJlYW07XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChcbiAgY29sbGVjdGlvbk5hbWUsIGJ5dGVTaXplLCBtYXhEb2N1bWVudHMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICghIHNlbGYuZGIpXG4gICAgdGhyb3cgRXJyb3IoXCJjcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMgY2FsbGVkIGJlZm9yZSBDb25uZWN0aW9uIGNyZWF0ZWQ/XCIpO1xuXG5cbiAgYXdhaXQgc2VsZi5kYi5jcmVhdGVDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lLFxuICAgIHsgY2FwcGVkOiB0cnVlLCBzaXplOiBieXRlU2l6ZSwgbWF4OiBtYXhEb2N1bWVudHMgfSk7XG59O1xuXG4vLyBUaGlzIHNob3VsZCBiZSBjYWxsZWQgc3luY2hyb25vdXNseSB3aXRoIGEgd3JpdGUsIHRvIGNyZWF0ZSBhXG4vLyB0cmFuc2FjdGlvbiBvbiB0aGUgY3VycmVudCB3cml0ZSBmZW5jZSwgaWYgYW55LiBBZnRlciB3ZSBjYW4gcmVhZFxuLy8gdGhlIHdyaXRlLCBhbmQgYWZ0ZXIgb2JzZXJ2ZXJzIGhhdmUgYmVlbiBub3RpZmllZCAob3IgYXQgbGVhc3QsXG4vLyBhZnRlciB0aGUgb2JzZXJ2ZXIgbm90aWZpZXJzIGhhdmUgYWRkZWQgdGhlbXNlbHZlcyB0byB0aGUgd3JpdGVcbi8vIGZlbmNlKSwgeW91IHNob3VsZCBjYWxsICdjb21taXR0ZWQoKScgb24gdGhlIG9iamVjdCByZXR1cm5lZC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlQmVnaW5Xcml0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZmVuY2UgPSBERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpO1xuICBpZiAoZmVuY2UpIHtcbiAgICByZXR1cm4gZmVuY2UuYmVnaW5Xcml0ZSgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7Y29tbWl0dGVkOiBmdW5jdGlvbiAoKSB7fX07XG4gIH1cbn07XG5cbi8vIFJlY29yZCB0aGUgY2x1c3RlclRpbWUgb2YgYSB3cml0ZSBvbiB0aGUgY3VycmVudCBERFAgd3JpdGUgZmVuY2Ugc28gdGhlXG4vLyBDaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyIGNhbiB3YWl0IGZvciB0aGF0IGV4YWN0IHRpbWVzdGFtcCBpbnN0ZWFkIG9mXG4vLyBwb2xsaW5nIHRoZSBzZXJ2ZXIgZm9yIGEgXCJjdXJyZW50XCIgdGltZSB0aGF0IG1heSBub3QgYmUgZWNob2VkIGJ5IHRoZVxuLy8gc3RyZWFtIHVudGlsIHRoZSBuZXh0IGhlYXJ0YmVhdCAofjFzKS5cbi8vXG4vLyBUaGUgdGFyZ2V0IGlzIHBlci1jb2xsZWN0aW9uOiBlYWNoIGNoYW5nZSBzdHJlYW0gZHJpdmVyIHdhdGNoZXMgYSBzaW5nbGVcbi8vIGNvbGxlY3Rpb24gYW5kIHdpbGwgb25seSBvYnNlcnZlIGNsdXN0ZXJUaW1lcyBmcm9tIGV2ZW50cyBpbiB0aGF0XG4vLyBjb2xsZWN0aW9uLiBBIGZlbmNlIG1heSBjb3ZlciB3cml0ZXMgYWNyb3NzIG11bHRpcGxlIGNvbGxlY3Rpb25zIChlLmcuXG4vLyBjcmVhdGluZyBhIGNhcmQgYWxzbyB3cml0ZXMgdG8gYWN0aXZpdGllcyksIHNvIHBpY2tpbmcgYSBzaW5nbGUgXCJtYXggdHNcIlxuLy8gZm9yIHRoZSB3aG9sZSBmZW5jZSB3b3VsZCBzdGFsbCBkcml2ZXJzIHdob3NlIGNvbGxlY3Rpb24gbmV2ZXIgc2Vlc1xuLy8gdGhhdCBzcGVjaWZpYyB0cy4gV2UgdGhlcmVmb3JlIGtlZXAgdGhlIG1heCB0cyBwZXIgY29sbGVjdGlvbi5cbmZ1bmN0aW9uIF9hbm5vdGF0ZUZlbmNlV2l0aFdyaXRlVHMoZmVuY2UsIGNvbGxlY3Rpb25OYW1lLCB3cml0ZVRzKSB7XG4gIGlmICghZmVuY2UgfHwgIXdyaXRlVHMgfHwgIWNvbGxlY3Rpb25OYW1lKSByZXR1cm47XG4gIGNvbnN0IG1hcCA9IGZlbmNlLl9jc1RhcmdldFRzQnlDb2xsZWN0aW9uID0gZmVuY2UuX2NzVGFyZ2V0VHNCeUNvbGxlY3Rpb24gfHwge307XG4gIGNvbnN0IHByZXYgPSBtYXBbY29sbGVjdGlvbk5hbWVdO1xuICBpZiAoIXByZXYgfHwgY29tcGFyZU9wZXJhdGlvblRpbWVzKHdyaXRlVHMsIHByZXYpID4gMCkge1xuICAgIG1hcFtjb2xsZWN0aW9uTmFtZV0gPSB3cml0ZVRzO1xuICB9XG59XG5cbi8vIEludGVybmFsIGludGVyZmFjZTogYWRkcyBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBNb25nbyBwcmltYXJ5XG4vLyBjaGFuZ2VzLiBSZXR1cm5zIGEgc3RvcCBoYW5kbGUuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9vbkZhaWxvdmVyID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIHJldHVybiB0aGlzLl9vbkZhaWxvdmVySG9vay5yZWdpc3RlcihjYWxsYmFjayk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmluc2VydEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25fbmFtZSwgZG9jdW1lbnQpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKGNvbGxlY3Rpb25fbmFtZSA9PT0gXCJfX19tZXRlb3JfZmFpbHVyZV90ZXN0X2NvbGxlY3Rpb25cIikge1xuICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoXCJGYWlsdXJlIHRlc3RcIik7XG4gICAgZS5fZXhwZWN0ZWRCeVRlc3QgPSB0cnVlO1xuICAgIHRocm93IGU7XG4gIH1cblxuICBpZiAoIShMb2NhbENvbGxlY3Rpb24uX2lzUGxhaW5PYmplY3QoZG9jdW1lbnQpICYmXG4gICAgIUVKU09OLl9pc0N1c3RvbVR5cGUoZG9jdW1lbnQpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgcGxhaW4gb2JqZWN0cyBtYXkgYmUgaW5zZXJ0ZWQgaW50byBNb25nb0RCXCIpO1xuICB9XG5cbiAgdmFyIHdyaXRlID0gc2VsZi5fbWF5YmVCZWdpbldyaXRlKCk7XG4gIHZhciByZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGF3YWl0IE1ldGVvci5yZWZyZXNoKHtjb2xsZWN0aW9uOiBjb2xsZWN0aW9uX25hbWUsIGlkOiBkb2N1bWVudC5faWQgfSk7XG4gIH07XG4gIGNvbnN0IHNlc3Npb24gPSBzZWxmLmNsaWVudC5zdGFydFNlc3Npb24oKTtcbiAgcmV0dXJuIHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uX25hbWUpLmluc2VydE9uZShcbiAgICByZXBsYWNlVHlwZXMoZG9jdW1lbnQsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICB7XG4gICAgICBzYWZlOiB0cnVlLFxuICAgICAgc2Vzc2lvbixcbiAgICB9XG4gICkudGhlbihhc3luYyAoe2luc2VydGVkSWR9KSA9PiB7XG4gICAgX2Fubm90YXRlRmVuY2VXaXRoV3JpdGVUcyhERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpLCBjb2xsZWN0aW9uX25hbWUsIHNlc3Npb24ub3BlcmF0aW9uVGltZSk7XG4gICAgYXdhaXQgc2Vzc2lvbi5lbmRTZXNzaW9uKCk7XG4gICAgYXdhaXQgcmVmcmVzaCgpO1xuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIHJldHVybiBpbnNlcnRlZElkO1xuICB9KS5jYXRjaChhc3luYyBlID0+IHtcbiAgICB0cnkgeyBhd2FpdCBzZXNzaW9uLmVuZFNlc3Npb24oKTsgfSBjYXRjaCAoXykgeyAvKiBpZ25vcmUgKi8gfVxuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIHRocm93IGU7XG4gIH0pO1xufTtcblxuXG4vLyBDYXVzZSBxdWVyaWVzIHRoYXQgbWF5IGJlIGFmZmVjdGVkIGJ5IHRoZSBzZWxlY3RvciB0byBwb2xsIGluIHRoaXMgd3JpdGVcbi8vIGZlbmNlLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IpIHtcbiAgdmFyIHJlZnJlc2hLZXkgPSB7Y29sbGVjdGlvbjogY29sbGVjdGlvbk5hbWV9O1xuICAvLyBJZiB3ZSBrbm93IHdoaWNoIGRvY3VtZW50cyB3ZSdyZSByZW1vdmluZywgZG9uJ3QgcG9sbCBxdWVyaWVzIHRoYXQgYXJlXG4gIC8vIHNwZWNpZmljIHRvIG90aGVyIGRvY3VtZW50cy4gKE5vdGUgdGhhdCBtdWx0aXBsZSBub3RpZmljYXRpb25zIGhlcmUgc2hvdWxkXG4gIC8vIG5vdCBjYXVzZSBtdWx0aXBsZSBwb2xscywgc2luY2UgYWxsIG91ciBsaXN0ZW5lciBpcyBkb2luZyBpcyBlbnF1ZXVlaW5nIGFcbiAgLy8gcG9sbC4pXG4gIHZhciBzcGVjaWZpY0lkcyA9IExvY2FsQ29sbGVjdGlvbi5faWRzTWF0Y2hlZEJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICBpZiAoc3BlY2lmaWNJZHMpIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHNwZWNpZmljSWRzKSB7XG4gICAgICBhd2FpdCBNZXRlb3IucmVmcmVzaChPYmplY3QuYXNzaWduKHtpZDogaWR9LCByZWZyZXNoS2V5KSk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBNZXRlb3IucmVmcmVzaChyZWZyZXNoS2V5KTtcbiAgfVxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoY29sbGVjdGlvbl9uYW1lID09PSBcIl9fX21ldGVvcl9mYWlsdXJlX3Rlc3RfY29sbGVjdGlvblwiKSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJGYWlsdXJlIHRlc3RcIik7XG4gICAgZS5fZXhwZWN0ZWRCeVRlc3QgPSB0cnVlO1xuICAgIHRocm93IGU7XG4gIH1cblxuICB2YXIgd3JpdGUgPSBzZWxmLl9tYXliZUJlZ2luV3JpdGUoKTtcbiAgdmFyIHJlZnJlc2ggPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgYXdhaXQgc2VsZi5fcmVmcmVzaChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yKTtcbiAgfTtcblxuICBjb25zdCBzZXNzaW9uID0gc2VsZi5jbGllbnQuc3RhcnRTZXNzaW9uKCk7XG4gIHJldHVybiBzZWxmLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbl9uYW1lKVxuICAgIC5kZWxldGVNYW55KHJlcGxhY2VUeXBlcyhzZWxlY3RvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLCB7XG4gICAgICBzYWZlOiB0cnVlLFxuICAgICAgc2Vzc2lvbixcbiAgICB9KVxuICAgIC50aGVuKGFzeW5jICh7IGRlbGV0ZWRDb3VudCB9KSA9PiB7XG4gICAgICAvLyBPbmx5IGFubm90YXRlIHRoZSBmZW5jZSB3aGVuIHRoZSBvcGVyYXRpb24gYWN0dWFsbHkgbW9kaWZpZWQgZGF0YTpcbiAgICAgIC8vIGEgbm8tb3AgZGVsZXRlTWFueSAobWF0Y2hlZCBubyBkb2NzKSBkb2VzIG5vdCBnZW5lcmF0ZSBhIGNoYW5nZS1cbiAgICAgIC8vIHN0cmVhbSBldmVudCwgc28gYSBDaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyIHdhaXRpbmcgb24gdGhpcyB0c1xuICAgICAgLy8gd291bGQgYmxvY2sgZm9yZXZlciB3YWl0aW5nIGZvciBhbiBldmVudCBNb25nbyB3aWxsIG5ldmVyIGVtaXQuXG4gICAgICBpZiAoZGVsZXRlZENvdW50ID4gMCkge1xuICAgICAgICBfYW5ub3RhdGVGZW5jZVdpdGhXcml0ZVRzKEREUFNlcnZlci5fZ2V0Q3VycmVudEZlbmNlKCksIGNvbGxlY3Rpb25fbmFtZSwgc2Vzc2lvbi5vcGVyYXRpb25UaW1lKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHNlc3Npb24uZW5kU2Vzc2lvbigpO1xuICAgICAgYXdhaXQgcmVmcmVzaCgpO1xuICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtUmVzdWx0KHsgcmVzdWx0IDoge21vZGlmaWVkQ291bnQgOiBkZWxldGVkQ291bnR9IH0pLm51bWJlckFmZmVjdGVkO1xuICAgIH0pLmNhdGNoKGFzeW5jIChlcnIpID0+IHtcbiAgICAgIHRyeSB7IGF3YWl0IHNlc3Npb24uZW5kU2Vzc2lvbigpOyB9IGNhdGNoIChfKSB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZHJvcENvbGxlY3Rpb25Bc3luYyA9IGFzeW5jIGZ1bmN0aW9uKGNvbGxlY3Rpb25OYW1lKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNZXRlb3IucmVmcmVzaCh7XG4gICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSxcbiAgICAgIGlkOiBudWxsLFxuICAgICAgZHJvcENvbGxlY3Rpb246IHRydWUsXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3Qgc2Vzc2lvbiA9IHNlbGYuY2xpZW50LnN0YXJ0U2Vzc2lvbigpO1xuICByZXR1cm4gc2VsZlxuICAgIC5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKVxuICAgIC5kcm9wKHsgc2Vzc2lvbiB9KVxuICAgIC50aGVuKGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICAvLyBEbyBOT1QgYW5ub3RhdGUgdGhlIGZlbmNlIGhlcmUuIENoYW5nZVN0cmVhbU9ic2VydmVEcml2ZXIncyBwaXBlbGluZVxuICAgICAgLy8gb25seSBmb3J3YXJkcyBpbnNlcnQvdXBkYXRlL3JlcGxhY2UvZGVsZXRlOyBtb25nbyBlbWl0cyBhIGBkcm9wYFxuICAgICAgLy8gKGFuZCBmb2xsb3ctdXAgYGludmFsaWRhdGVgKSBldmVudCB0aGF0IG91ciAkbWF0Y2ggZHJvcHMsIHNvIGFcbiAgICAgIC8vIGZlbmNlIHdhaXRlciBwaW5uZWQgdG8gdGhpcyBjbHVzdGVyVGltZSB3b3VsZCBibG9jayBmb3JldmVyIHdhaXRpbmdcbiAgICAgIC8vIGZvciBhbiBldmVudCB0aGF0IG5ldmVyIHJlYWNoZXMgdGhlIGRyaXZlci5cbiAgICAgIGF3YWl0IHNlc3Npb24uZW5kU2Vzc2lvbigpO1xuICAgICAgYXdhaXQgcmVmcmVzaCgpO1xuICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pXG4gICAgLmNhdGNoKGFzeW5jIGUgPT4ge1xuICAgICAgdHJ5IHsgYXdhaXQgc2Vzc2lvbi5lbmRTZXNzaW9uKCk7IH0gY2F0Y2ggKF8pIHsgLyogaWdub3JlICovIH1cbiAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9KTtcbn07XG5cbi8vIEZvciB0ZXN0aW5nIG9ubHkuICBTbGlnaHRseSBiZXR0ZXIgdGhhbiBgYy5yYXdEYXRhYmFzZSgpLmRyb3BEYXRhYmFzZSgpYFxuLy8gYmVjYXVzZSBpdCBsZXRzIHRoZSB0ZXN0J3MgZmVuY2Ugd2FpdCBmb3IgaXQgdG8gYmUgY29tcGxldGUuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmRyb3BEYXRhYmFzZUFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIHdyaXRlID0gc2VsZi5fbWF5YmVCZWdpbldyaXRlKCk7XG4gIHZhciByZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGF3YWl0IE1ldGVvci5yZWZyZXNoKHsgZHJvcERhdGFiYXNlOiB0cnVlIH0pO1xuICB9O1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgc2VsZi5kYi5fZHJvcERhdGFiYXNlKCk7XG4gICAgYXdhaXQgcmVmcmVzaCgpO1xuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS51cGRhdGVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yLCBtb2QsIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmIChjb2xsZWN0aW9uX25hbWUgPT09IFwiX19fbWV0ZW9yX2ZhaWx1cmVfdGVzdF9jb2xsZWN0aW9uXCIpIHtcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihcIkZhaWx1cmUgdGVzdFwiKTtcbiAgICBlLl9leHBlY3RlZEJ5VGVzdCA9IHRydWU7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIC8vIGV4cGxpY2l0IHNhZmV0eSBjaGVjay4gbnVsbCBhbmQgdW5kZWZpbmVkIGNhbiBjcmFzaCB0aGUgbW9uZ29cbiAgLy8gZHJpdmVyLiBBbHRob3VnaCB0aGUgbm9kZSBkcml2ZXIgYW5kIG1pbmltb25nbyBkbyAnc3VwcG9ydCdcbiAgLy8gbm9uLW9iamVjdCBtb2RpZmllciBpbiB0aGF0IHRoZXkgZG9uJ3QgY3Jhc2gsIHRoZXkgYXJlIG5vdFxuICAvLyBtZWFuaW5nZnVsIG9wZXJhdGlvbnMgYW5kIGRvIG5vdCBkbyBhbnl0aGluZy4gRGVmZW5zaXZlbHkgdGhyb3cgYW5cbiAgLy8gZXJyb3IgaGVyZS5cbiAgaWYgKCFtb2QgfHwgdHlwZW9mIG1vZCAhPT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcIkludmFsaWQgbW9kaWZpZXIuIE1vZGlmaWVyIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcblxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgaWYgKCEoTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0KG1vZCkgJiYgIUVKU09OLl9pc0N1c3RvbVR5cGUobW9kKSkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIFwiT25seSBwbGFpbiBvYmplY3RzIG1heSBiZSB1c2VkIGFzIHJlcGxhY2VtZW50XCIgK1xuICAgICAgXCIgZG9jdW1lbnRzIGluIE1vbmdvREJcIik7XG5cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBhd2FpdCBzZWxmLl9yZWZyZXNoKGNvbGxlY3Rpb25fbmFtZSwgc2VsZWN0b3IpO1xuICB9O1xuXG4gIHZhciBjb2xsZWN0aW9uID0gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25fbmFtZSk7XG4gIGNvbnN0IHNlc3Npb24gPSBzZWxmLmNsaWVudC5zdGFydFNlc3Npb24oKTtcbiAgdmFyIG1vbmdvT3B0cyA9IHtzYWZlOiB0cnVlLCBzZXNzaW9ufTtcbiAgLy8gQWRkIHN1cHBvcnQgZm9yIGZpbHRlcmVkIHBvc2l0aW9uYWwgb3BlcmF0b3JcbiAgaWYgKG9wdGlvbnMuYXJyYXlGaWx0ZXJzICE9PSB1bmRlZmluZWQpIG1vbmdvT3B0cy5hcnJheUZpbHRlcnMgPSBvcHRpb25zLmFycmF5RmlsdGVycztcbiAgLy8gZXhwbGljdGx5IGVudW1lcmF0ZSBvcHRpb25zIHRoYXQgbWluaW1vbmdvIHN1cHBvcnRzXG4gIGlmIChvcHRpb25zLnVwc2VydCkgbW9uZ29PcHRzLnVwc2VydCA9IHRydWU7XG4gIGlmIChvcHRpb25zLm11bHRpKSBtb25nb09wdHMubXVsdGkgPSB0cnVlO1xuICAvLyBMZXRzIHlvdSBnZXQgYSBtb3JlIG1vcmUgZnVsbCByZXN1bHQgZnJvbSBNb25nb0RCLiBVc2Ugd2l0aCBjYXV0aW9uOlxuICAvLyBtaWdodCBub3Qgd29yayB3aXRoIEMudXBzZXJ0IChhcyBvcHBvc2VkIHRvIEMudXBkYXRlKHt1cHNlcnQ6dHJ1ZX0pIG9yXG4gIC8vIHdpdGggc2ltdWxhdGVkIHVwc2VydC5cbiAgaWYgKG9wdGlvbnMuZnVsbFJlc3VsdCkgbW9uZ29PcHRzLmZ1bGxSZXN1bHQgPSB0cnVlO1xuXG4gIHZhciBtb25nb1NlbGVjdG9yID0gcmVwbGFjZVR5cGVzKHNlbGVjdG9yLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyk7XG4gIHZhciBtb25nb01vZCA9IHJlcGxhY2VUeXBlcyhtb2QsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKTtcblxuICB2YXIgaXNNb2RpZnkgPSBMb2NhbENvbGxlY3Rpb24uX2lzTW9kaWZpY2F0aW9uTW9kKG1vbmdvTW9kKTtcblxuICBpZiAob3B0aW9ucy5fZm9yYmlkUmVwbGFjZSAmJiAhaXNNb2RpZnkpIHtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKFwiSW52YWxpZCBtb2RpZmllci4gUmVwbGFjZW1lbnRzIGFyZSBmb3JiaWRkZW4uXCIpO1xuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIC8vIFdlJ3ZlIGFscmVhZHkgcnVuIHJlcGxhY2VUeXBlcy9yZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyBvblxuICAvLyBzZWxlY3RvciBhbmQgbW9kLiAgV2UgYXNzdW1lIGl0IGRvZXNuJ3QgbWF0dGVyLCBhcyBmYXIgYXNcbiAgLy8gdGhlIGJlaGF2aW9yIG9mIG1vZGlmaWVycyBpcyBjb25jZXJuZWQsIHdoZXRoZXIgYF9tb2RpZnlgXG4gIC8vIGlzIHJ1biBvbiBFSlNPTiBvciBvbiBtb25nby1jb252ZXJ0ZWQgRUpTT04uXG5cbiAgLy8gUnVuIHRoaXMgY29kZSB1cCBmcm9udCBzbyB0aGF0IGl0IGZhaWxzIGZhc3QgaWYgc29tZW9uZSB1c2VzXG4gIC8vIGEgTW9uZ28gdXBkYXRlIG9wZXJhdG9yIHdlIGRvbid0IHN1cHBvcnQuXG4gIGxldCBrbm93bklkO1xuICBpZiAob3B0aW9ucy51cHNlcnQpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IG5ld0RvYyA9IExvY2FsQ29sbGVjdGlvbi5fY3JlYXRlVXBzZXJ0RG9jdW1lbnQoc2VsZWN0b3IsIG1vZCk7XG4gICAgICBrbm93bklkID0gbmV3RG9jLl9pZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cbiAgaWYgKG9wdGlvbnMudXBzZXJ0ICYmXG4gICAgISBpc01vZGlmeSAmJlxuICAgICEga25vd25JZCAmJlxuICAgIG9wdGlvbnMuaW5zZXJ0ZWRJZCAmJlxuICAgICEgKG9wdGlvbnMuaW5zZXJ0ZWRJZCBpbnN0YW5jZW9mIE1vbmdvLk9iamVjdElEICYmXG4gICAgICBvcHRpb25zLmdlbmVyYXRlZElkKSkge1xuICAgIC8vIEluIGNhc2Ugb2YgYW4gdXBzZXJ0IHdpdGggYSByZXBsYWNlbWVudCwgd2hlcmUgdGhlcmUgaXMgbm8gX2lkIGRlZmluZWRcbiAgICAvLyBpbiBlaXRoZXIgdGhlIHF1ZXJ5IG9yIHRoZSByZXBsYWNlbWVudCBkb2MsIG1vbmdvIHdpbGwgZ2VuZXJhdGUgYW4gaWQgaXRzZWxmLlxuICAgIC8vIFRoZXJlZm9yZSB3ZSBuZWVkIHRoaXMgc3BlY2lhbCBzdHJhdGVneSBpZiB3ZSB3YW50IHRvIGNvbnRyb2wgdGhlIGlkIG91cnNlbHZlcy5cblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gdGhpcyB3aGVuOlxuICAgIC8vIC0gVGhpcyBpcyBub3QgYSByZXBsYWNlbWVudCwgc28gd2UgY2FuIGFkZCBhbiBfaWQgdG8gJHNldE9uSW5zZXJ0XG4gICAgLy8gLSBUaGUgaWQgaXMgZGVmaW5lZCBieSBxdWVyeSBvciBtb2Qgd2UgY2FuIGp1c3QgYWRkIGl0IHRvIHRoZSByZXBsYWNlbWVudCBkb2NcbiAgICAvLyAtIFRoZSB1c2VyIGRpZCBub3Qgc3BlY2lmeSBhbnkgaWQgcHJlZmVyZW5jZSBhbmQgdGhlIGlkIGlzIGEgTW9uZ28gT2JqZWN0SWQsXG4gICAgLy8gICAgIHRoZW4gd2UgY2FuIGp1c3QgbGV0IE1vbmdvIGdlbmVyYXRlIHRoZSBpZFxuICAgIHJldHVybiBhd2FpdCBzaW11bGF0ZVVwc2VydFdpdGhJbnNlcnRlZElkKGNvbGxlY3Rpb24sIG1vbmdvU2VsZWN0b3IsIG1vbmdvTW9kLCBvcHRpb25zLCBzZXNzaW9uKVxuICAgICAgLnRoZW4oYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgICAgLy8gU2tpcCBhbm5vdGF0aW9uIHdoZW4gbm90aGluZyBhY3R1YWxseSBjaGFuZ2VkIOKAlCBjaGFuZ2Utc3RyZWFtXG4gICAgICAgIC8vIG9ic2VydmVycyB3YWl0IGZvciB0aGUgZXhhY3QgdHMgYW5kIGEgbm8tb3AgdXBzZXJ0IHByb2R1Y2VzIG5vXG4gICAgICAgIC8vIGV2ZW50LCBzbyB0aGUgd2FpdCB3b3VsZCBuZXZlciByZXNvbHZlLlxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5udW1iZXJBZmZlY3RlZCkge1xuICAgICAgICAgIF9hbm5vdGF0ZUZlbmNlV2l0aFdyaXRlVHMoRERQU2VydmVyLl9nZXRDdXJyZW50RmVuY2UoKSwgY29sbGVjdGlvbl9uYW1lLCBzZXNzaW9uLm9wZXJhdGlvblRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHNlc3Npb24uZW5kU2Vzc2lvbigpO1xuICAgICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICBpZiAocmVzdWx0ICYmICEgb3B0aW9ucy5fcmV0dXJuT2JqZWN0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5udW1iZXJBZmZlY3RlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChhc3luYyBlcnIgPT4ge1xuICAgICAgICB0cnkgeyBhd2FpdCBzZXNzaW9uLmVuZFNlc3Npb24oKTsgfSBjYXRjaCAoXykgeyAvKiBpZ25vcmUgKi8gfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAob3B0aW9ucy51cHNlcnQgJiYgIWtub3duSWQgJiYgb3B0aW9ucy5pbnNlcnRlZElkICYmIGlzTW9kaWZ5KSB7XG4gICAgICBpZiAoIW1vbmdvTW9kLmhhc093blByb3BlcnR5KCckc2V0T25JbnNlcnQnKSkge1xuICAgICAgICBtb25nb01vZC4kc2V0T25JbnNlcnQgPSB7fTtcbiAgICAgIH1cbiAgICAgIGtub3duSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7XG4gICAgICBPYmplY3QuYXNzaWduKG1vbmdvTW9kLiRzZXRPbkluc2VydCwgcmVwbGFjZVR5cGVzKHtfaWQ6IG9wdGlvbnMuaW5zZXJ0ZWRJZH0sIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaW5ncyA9IE9iamVjdC5rZXlzKG1vbmdvTW9kKS5maWx0ZXIoKGtleSkgPT4gIWtleS5zdGFydHNXaXRoKFwiJFwiKSk7XG4gICAgbGV0IHVwZGF0ZU1ldGhvZCA9IHN0cmluZ3MubGVuZ3RoID4gMCA/ICdyZXBsYWNlT25lJyA6ICd1cGRhdGVNYW55JztcbiAgICB1cGRhdGVNZXRob2QgPVxuICAgICAgdXBkYXRlTWV0aG9kID09PSAndXBkYXRlTWFueScgJiYgIW1vbmdvT3B0cy5tdWx0aVxuICAgICAgICA/ICd1cGRhdGVPbmUnXG4gICAgICAgIDogdXBkYXRlTWV0aG9kO1xuICAgIHJldHVybiBjb2xsZWN0aW9uW3VwZGF0ZU1ldGhvZF1cbiAgICAgIC5iaW5kKGNvbGxlY3Rpb24pKG1vbmdvU2VsZWN0b3IsIG1vbmdvTW9kLCBtb25nb09wdHMpXG4gICAgICAudGhlbihhc3luYyByZXN1bHQgPT4ge1xuICAgICAgICAvLyBTa2lwIGFubm90YXRpb24gd2hlbiBub3RoaW5nIGFjdHVhbGx5IGNoYW5nZWQ6IGEgbm8tb3BcbiAgICAgICAgLy8gdXBkYXRlT25lIC8gdXBkYXRlTWFueSAvIHJlcGxhY2VPbmUgZG9lcyBub3QgZW1pdCBhIGNoYW5nZS1cbiAgICAgICAgLy8gc3RyZWFtIGV2ZW50LCBzbyBhIGZlbmNlIHdhaXRlciBwaW5uZWQgdG8gdGhpcyB0cyB3b3VsZCBibG9ja1xuICAgICAgICAvLyBmb3JldmVyLiBtb2RpZmllZENvdW50IGV4Y2x1ZGVzIG1hdGNoZWQtYnV0LXVuY2hhbmdlZCBkb2NzICh3aGljaFxuICAgICAgICAvLyBhbHNvIHByb2R1Y2Ugbm8gZXZlbnQpLCBhbmQgdXBzZXJ0ZWRDb3VudCBjYXRjaGVzIGluc2VydHMuXG4gICAgICAgIGlmIChyZXN1bHQgJiYgKHJlc3VsdC5tb2RpZmllZENvdW50ID4gMCB8fCByZXN1bHQudXBzZXJ0ZWRDb3VudCA+IDApKSB7XG4gICAgICAgICAgX2Fubm90YXRlRmVuY2VXaXRoV3JpdGVUcyhERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpLCBjb2xsZWN0aW9uX25hbWUsIHNlc3Npb24ub3BlcmF0aW9uVGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgc2Vzc2lvbi5lbmRTZXNzaW9uKCk7XG4gICAgICAgIHZhciBtZXRlb3JSZXN1bHQgPSB0cmFuc2Zvcm1SZXN1bHQoe3Jlc3VsdH0pO1xuICAgICAgICBpZiAobWV0ZW9yUmVzdWx0ICYmIG9wdGlvbnMuX3JldHVybk9iamVjdCkge1xuICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIHVwc2VydEFzeW5jKCkgY2FsbCwgYW5kIHdlIGVuZGVkIHVwXG4gICAgICAgICAgLy8gaW5zZXJ0aW5nIGEgbmV3IGRvYyBhbmQgd2Uga25vdyBpdHMgaWQsIHRoZW5cbiAgICAgICAgICAvLyByZXR1cm4gdGhhdCBpZCBhcyB3ZWxsLlxuICAgICAgICAgIGlmIChvcHRpb25zLnVwc2VydCAmJiBtZXRlb3JSZXN1bHQuaW5zZXJ0ZWRJZCkge1xuICAgICAgICAgICAgaWYgKGtub3duSWQpIHtcbiAgICAgICAgICAgICAgbWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQgPSBrbm93bklkO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRlb3JSZXN1bHQuaW5zZXJ0ZWRJZCBpbnN0YW5jZW9mIE1vbmdvREIuT2JqZWN0SWQpIHtcbiAgICAgICAgICAgICAgbWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQgPSBuZXcgTW9uZ28uT2JqZWN0SUQobWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQudG9IZXhTdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgICAgICByZXR1cm4gbWV0ZW9yUmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgICAgICByZXR1cm4gbWV0ZW9yUmVzdWx0Lm51bWJlckFmZmVjdGVkO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChhc3luYyAoZXJyKSA9PiB7XG4gICAgICAgIHRyeSB7IGF3YWl0IHNlc3Npb24uZW5kU2Vzc2lvbigpOyB9IGNhdGNoIChfKSB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgfVxufTtcblxuLy8gZXhwb3NlZCBmb3IgdGVzdGluZ1xuTW9uZ29Db25uZWN0aW9uLl9pc0Nhbm5vdENoYW5nZUlkRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgLy8gTW9uZ28gMy4yLiogcmV0dXJucyBlcnJvciBhcyBuZXh0IE9iamVjdDpcbiAgLy8ge25hbWU6IFN0cmluZywgY29kZTogTnVtYmVyLCBlcnJtc2c6IFN0cmluZ31cbiAgLy8gT2xkZXIgTW9uZ28gcmV0dXJuczpcbiAgLy8ge25hbWU6IFN0cmluZywgY29kZTogTnVtYmVyLCBlcnI6IFN0cmluZ31cbiAgdmFyIGVycm9yID0gZXJyLmVycm1zZyB8fCBlcnIuZXJyO1xuXG4gIC8vIFdlIGRvbid0IHVzZSB0aGUgZXJyb3IgY29kZSBoZXJlXG4gIC8vIGJlY2F1c2UgdGhlIGVycm9yIGNvZGUgd2Ugb2JzZXJ2ZWQgaXQgcHJvZHVjaW5nICgxNjgzNykgYXBwZWFycyB0byBiZVxuICAvLyBhIGZhciBtb3JlIGdlbmVyaWMgZXJyb3IgY29kZSBiYXNlZCBvbiBleGFtaW5pbmcgdGhlIHNvdXJjZS5cbiAgaWYgKGVycm9yLmluZGV4T2YoJ1RoZSBfaWQgZmllbGQgY2Fubm90IGJlIGNoYW5nZWQnKSA9PT0gMFxuICAgIHx8IGVycm9yLmluZGV4T2YoXCJ0aGUgKGltbXV0YWJsZSkgZmllbGQgJ19pZCcgd2FzIGZvdW5kIHRvIGhhdmUgYmVlbiBhbHRlcmVkIHRvIF9pZFwiKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIFhYWCBNb25nb0Nvbm5lY3Rpb24udXBzZXJ0QXN5bmMoKSBkb2VzIG5vdCByZXR1cm4gdGhlIGlkIG9mIHRoZSBpbnNlcnRlZCBkb2N1bWVudFxuLy8gdW5sZXNzIHlvdSBzZXQgaXQgZXhwbGljaXRseSBpbiB0aGUgc2VsZWN0b3Igb3IgbW9kaWZpZXIgKGFzIGEgcmVwbGFjZW1lbnRcbi8vIGRvYykuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLnVwc2VydEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuXG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIgJiYgISBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICByZXR1cm4gc2VsZi51cGRhdGVBc3luYyhjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IsIG1vZCxcbiAgICBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICB1cHNlcnQ6IHRydWUsXG4gICAgICBfcmV0dXJuT2JqZWN0OiB0cnVlXG4gICAgfSkpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXG4gICAgc2VsZWN0b3IgPSB7fTtcblxuICByZXR1cm4gbmV3IEN1cnNvcihcbiAgICBzZWxmLCBuZXcgQ3Vyc29yRGVzY3JpcHRpb24oY29sbGVjdGlvbk5hbWUsIHNlbGVjdG9yLCBvcHRpb25zKSk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmZpbmRPbmVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBzZWxlY3RvciA9IHt9O1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIG9wdGlvbnMubGltaXQgPSAxO1xuXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBzZWxmLmZpbmQoY29sbGVjdGlvbl9uYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKTtcblxuICByZXR1cm4gcmVzdWx0c1swXTtcbn07XG5cbi8vIFdlJ2xsIGFjdHVhbGx5IGRlc2lnbiBhbiBpbmRleCBBUEkgbGF0ZXIuIEZvciBub3csIHdlIGp1c3QgcGFzcyB0aHJvdWdoIHRvXG4vLyBNb25nbydzLCBidXQgbWFrZSBpdCBzeW5jaHJvbm91cy5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXhBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gV2UgZXhwZWN0IHRoaXMgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IHN0YXJ0dXAsIG5vdCBmcm9tIHdpdGhpbiBhIG1ldGhvZCxcbiAgLy8gc28gd2UgZG9uJ3QgaW50ZXJhY3Qgd2l0aCB0aGUgd3JpdGUgZmVuY2UuXG4gIHZhciBjb2xsZWN0aW9uID0gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbiAgYXdhaXQgY29sbGVjdGlvbi5jcmVhdGVJbmRleChpbmRleCwgb3B0aW9ucyk7XG59O1xuXG4vLyBqdXN0IHRvIGJlIGNvbnNpc3RlbnQgd2l0aCB0aGUgb3RoZXIgbWV0aG9kc1xuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9XG4gIE1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXhBc3luYztcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jb3VudERvY3VtZW50cyA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgLi4uYXJncykge1xuICBhcmdzID0gYXJncy5tYXAoYXJnID0+IHJlcGxhY2VUeXBlcyhhcmcsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICByZXR1cm4gY29sbGVjdGlvbi5jb3VudERvY3VtZW50cyguLi5hcmdzKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZXN0aW1hdGVkRG9jdW1lbnRDb3VudCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgLi4uYXJncykge1xuICBhcmdzID0gYXJncy5tYXAoYXJnID0+IHJlcGxhY2VUeXBlcyhhcmcsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICByZXR1cm4gY29sbGVjdGlvbi5lc3RpbWF0ZWREb2N1bWVudENvdW50KC4uLmFyZ3MpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5lbnN1cmVJbmRleEFzeW5jID0gTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVJbmRleEFzeW5jO1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmRyb3BJbmRleEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBpbmRleCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBieSB0ZXN0IGNvZGUsIG5vdCB3aXRoaW4gYSBtZXRob2QsIHNvIHdlIGRvbid0XG4gIC8vIGludGVyYWN0IHdpdGggdGhlIHdyaXRlIGZlbmNlLlxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gIHZhciBpbmRleE5hbWUgPSAgYXdhaXQgY29sbGVjdGlvbi5kcm9wSW5kZXgoaW5kZXgpO1xufTtcblxuXG5DTElFTlRfT05MWV9NRVRIT0RTLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZVttXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgJHttfSArICBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBzZXJ2ZXIuIFBsZWFzZSB1c2UgJHtnZXRBc3luY01ldGhvZE5hbWUoXG4gICAgICAgIG1cbiAgICAgICl9KCkgaW5zdGVhZC5gXG4gICAgKTtcbiAgfTtcbn0pO1xuXG5cbnZhciBOVU1fT1BUSU1JU1RJQ19UUklFUyA9IDM7XG5cblxuXG52YXIgc2ltdWxhdGVVcHNlcnRXaXRoSW5zZXJ0ZWRJZCA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zLCBzZXNzaW9uKSB7XG4gIC8vIFNUUkFURUdZOiBGaXJzdCB0cnkgZG9pbmcgYW4gdXBzZXJ0IHdpdGggYSBnZW5lcmF0ZWQgSUQuXG4gIC8vIElmIHRoaXMgdGhyb3dzIGFuIGVycm9yIGFib3V0IGNoYW5naW5nIHRoZSBJRCBvbiBhbiBleGlzdGluZyBkb2N1bWVudFxuICAvLyB0aGVuIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBkYXRhYmFzZSwgd2Uga25vdyB3ZSBzaG91bGQgcHJvYmFibHkgdHJ5XG4gIC8vIGFuIHVwZGF0ZSB3aXRob3V0IHRoZSBnZW5lcmF0ZWQgSUQuIElmIGl0IGFmZmVjdGVkIDAgZG9jdW1lbnRzLFxuICAvLyB0aGVuIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBkYXRhYmFzZSwgd2UgdGhlIGRvY3VtZW50IHRoYXQgZmlyc3RcbiAgLy8gZ2F2ZSB0aGUgZXJyb3IgaXMgcHJvYmFibHkgcmVtb3ZlZCBhbmQgd2UgbmVlZCB0byB0cnkgYW4gaW5zZXJ0IGFnYWluXG4gIC8vIFdlIGdvIGJhY2sgdG8gc3RlcCBvbmUgYW5kIHJlcGVhdC5cbiAgLy8gTGlrZSBhbGwgXCJvcHRpbWlzdGljIHdyaXRlXCIgc2NoZW1lcywgd2UgcmVseSBvbiB0aGUgZmFjdCB0aGF0IGl0J3NcbiAgLy8gdW5saWtlbHkgb3VyIHdyaXRlcyB3aWxsIGNvbnRpbnVlIHRvIGJlIGludGVyZmVyZWQgd2l0aCB1bmRlciBub3JtYWxcbiAgLy8gY2lyY3Vtc3RhbmNlcyAodGhvdWdoIHN1ZmZpY2llbnRseSBoZWF2eSBjb250ZW50aW9uIHdpdGggd3JpdGVyc1xuICAvLyBkaXNhZ3JlZWluZyBvbiB0aGUgZXhpc3RlbmNlIG9mIGFuIG9iamVjdCB3aWxsIGNhdXNlIHdyaXRlcyB0byBmYWlsXG4gIC8vIGluIHRoZW9yeSkuXG5cbiAgdmFyIGluc2VydGVkSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7IC8vIG11c3QgZXhpc3RcbiAgdmFyIG1vbmdvT3B0c0ZvclVwZGF0ZSA9IHtcbiAgICBzYWZlOiB0cnVlLFxuICAgIG11bHRpOiBvcHRpb25zLm11bHRpLFxuICAgIHNlc3Npb24sXG4gIH07XG4gIHZhciBtb25nb09wdHNGb3JJbnNlcnQgPSB7XG4gICAgc2FmZTogdHJ1ZSxcbiAgICB1cHNlcnQ6IHRydWUsXG4gICAgc2Vzc2lvbixcbiAgfTtcblxuICB2YXIgcmVwbGFjZW1lbnRXaXRoSWQgPSBPYmplY3QuYXNzaWduKFxuICAgIHJlcGxhY2VUeXBlcyh7X2lkOiBpbnNlcnRlZElkfSwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgIG1vZCk7XG5cbiAgdmFyIHRyaWVzID0gTlVNX09QVElNSVNUSUNfVFJJRVM7XG5cbiAgdmFyIGRvVXBkYXRlID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIHRyaWVzLS07XG4gICAgaWYgKCEgdHJpZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVwc2VydCBmYWlsZWQgYWZ0ZXIgXCIgKyBOVU1fT1BUSU1JU1RJQ19UUklFUyArIFwiIHRyaWVzLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG1ldGhvZCA9IGNvbGxlY3Rpb24udXBkYXRlTWFueTtcbiAgICAgIGlmKCFPYmplY3Qua2V5cyhtb2QpLnNvbWUoa2V5ID0+IGtleS5zdGFydHNXaXRoKFwiJFwiKSkpe1xuICAgICAgICBtZXRob2QgPSBjb2xsZWN0aW9uLnJlcGxhY2VPbmUuYmluZChjb2xsZWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZXRob2QoXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICAgICBtb2QsXG4gICAgICAgIG1vbmdvT3B0c0ZvclVwZGF0ZSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ICYmIChyZXN1bHQubW9kaWZpZWRDb3VudCB8fCByZXN1bHQudXBzZXJ0ZWRDb3VudCkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbnVtYmVyQWZmZWN0ZWQ6IHJlc3VsdC5tb2RpZmllZENvdW50IHx8IHJlc3VsdC51cHNlcnRlZENvdW50LFxuICAgICAgICAgICAgaW5zZXJ0ZWRJZDogcmVzdWx0LnVwc2VydGVkSWQgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGRvQ29uZGl0aW9uYWxJbnNlcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkb0NvbmRpdGlvbmFsSW5zZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24ucmVwbGFjZU9uZShzZWxlY3RvciwgcmVwbGFjZW1lbnRXaXRoSWQsIG1vbmdvT3B0c0Zvckluc2VydClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAoe1xuICAgICAgICBudW1iZXJBZmZlY3RlZDogcmVzdWx0LnVwc2VydGVkQ291bnQsXG4gICAgICAgIGluc2VydGVkSWQ6IHJlc3VsdC51cHNlcnRlZElkLFxuICAgICAgfSkpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChNb25nb0Nvbm5lY3Rpb24uX2lzQ2Fubm90Q2hhbmdlSWRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgcmV0dXJuIGRvVXBkYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICB9O1xuICByZXR1cm4gZG9VcGRhdGUoKTtcbn07XG5cbi8vIG9ic2VydmVDaGFuZ2VzIGZvciB0YWlsYWJsZSBjdXJzb3JzIG9uIGNhcHBlZCBjb2xsZWN0aW9ucy5cbi8vXG4vLyBTb21lIGRpZmZlcmVuY2VzIGZyb20gbm9ybWFsIGN1cnNvcnM6XG4vLyAgIC0gV2lsbCBuZXZlciBwcm9kdWNlIGFueXRoaW5nIG90aGVyIHRoYW4gJ2FkZGVkJyBvciAnYWRkZWRCZWZvcmUnLiBJZiB5b3Vcbi8vICAgICBkbyB1cGRhdGUgYSBkb2N1bWVudCB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gcHJvZHVjZWQsIHRoaXMgd2lsbCBub3Qgbm90aWNlXG4vLyAgICAgaXQuXG4vLyAgIC0gSWYgeW91IGRpc2Nvbm5lY3QgYW5kIHJlY29ubmVjdCBmcm9tIE1vbmdvLCBpdCB3aWxsIGVzc2VudGlhbGx5IHJlc3RhcnRcbi8vICAgICB0aGUgcXVlcnksIHdoaWNoIHdpbGwgbGVhZCB0byBkdXBsaWNhdGUgcmVzdWx0cy4gVGhpcyBpcyBwcmV0dHkgYmFkLFxuLy8gICAgIGJ1dCBpZiB5b3UgaW5jbHVkZSBhIGZpZWxkIGNhbGxlZCAndHMnIHdoaWNoIGlzIGluc2VydGVkIGFzXG4vLyAgICAgbmV3IE1vbmdvSW50ZXJuYWxzLk1vbmdvVGltZXN0YW1wKDAsIDApICh3aGljaCBpcyBpbml0aWFsaXplZCB0byB0aGVcbi8vICAgICBjdXJyZW50IE1vbmdvLXN0eWxlIHRpbWVzdGFtcCksIHdlJ2xsIGJlIGFibGUgdG8gZmluZCB0aGUgcGxhY2UgdG9cbi8vICAgICByZXN0YXJ0IHByb3Blcmx5LiAoVGhpcyBmaWVsZCBpcyBzcGVjaWZpY2FsbHkgdW5kZXJzdG9vZCBieSBNb25nbyB3aXRoIGFuXG4vLyAgICAgb3B0aW1pemF0aW9uIHdoaWNoIGFsbG93cyBpdCB0byBmaW5kIHRoZSByaWdodCBwbGFjZSB0byBzdGFydCB3aXRob3V0XG4vLyAgICAgYW4gaW5kZXggb24gdHMuIEl0J3MgaG93IHRoZSBvcGxvZyB3b3Jrcy4pXG4vLyAgIC0gTm8gY2FsbGJhY2tzIGFyZSB0cmlnZ2VyZWQgc3luY2hyb25vdXNseSB3aXRoIHRoZSBjYWxsICh0aGVyZSdzIG5vXG4vLyAgICAgZGlmZmVyZW50aWF0aW9uIGJldHdlZW4gXCJpbml0aWFsIGRhdGFcIiBhbmQgXCJsYXRlciBjaGFuZ2VzXCI7IGV2ZXJ5dGhpbmdcbi8vICAgICB0aGF0IG1hdGNoZXMgdGhlIHF1ZXJ5IGdldHMgc2VudCBhc3luY2hyb25vdXNseSkuXG4vLyAgIC0gRGUtZHVwbGljYXRpb24gaXMgbm90IGltcGxlbWVudGVkLlxuLy8gICAtIERvZXMgbm90IHlldCBpbnRlcmFjdCB3aXRoIHRoZSB3cml0ZSBmZW5jZS4gUHJvYmFibHksIHRoaXMgc2hvdWxkIHdvcmsgYnlcbi8vICAgICBpZ25vcmluZyByZW1vdmVzICh3aGljaCBkb24ndCB3b3JrIG9uIGNhcHBlZCBjb2xsZWN0aW9ucykgYW5kIHVwZGF0ZXNcbi8vICAgICAod2hpY2ggZG9uJ3QgYWZmZWN0IHRhaWxhYmxlIGN1cnNvcnMpLCBhbmQganVzdCBrZWVwaW5nIHRyYWNrIG9mIHRoZSBJRFxuLy8gICAgIG9mIHRoZSBpbnNlcnRlZCBvYmplY3QsIGFuZCBjbG9zaW5nIHRoZSB3cml0ZSBmZW5jZSBvbmNlIHlvdSBnZXQgdG8gdGhhdFxuLy8gICAgIElEIChvciB0aW1lc3RhbXA/KS4gIFRoaXMgZG9lc24ndCB3b3JrIHdlbGwgaWYgdGhlIGRvY3VtZW50IGRvZXNuJ3QgbWF0Y2hcbi8vICAgICB0aGUgcXVlcnksIHRob3VnaC4gIE9uIHRoZSBvdGhlciBoYW5kLCB0aGUgd3JpdGUgZmVuY2UgY2FuIGNsb3NlXG4vLyAgICAgaW1tZWRpYXRlbHkgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIHF1ZXJ5LiBTbyBpZiB3ZSB0cnVzdCBtaW5pbW9uZ29cbi8vICAgICBlbm91Z2ggdG8gYWNjdXJhdGVseSBldmFsdWF0ZSB0aGUgcXVlcnkgYWdhaW5zdCB0aGUgd3JpdGUgZmVuY2UsIHdlXG4vLyAgICAgc2hvdWxkIGJlIGFibGUgdG8gZG8gdGhpcy4uLiAgT2YgY291cnNlLCBtaW5pbW9uZ28gZG9lc24ndCBldmVuIHN1cHBvcnRcbi8vICAgICBNb25nbyBUaW1lc3RhbXBzIHlldC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX29ic2VydmVDaGFuZ2VzVGFpbGFibGUgPSBmdW5jdGlvbiAoXG4gIGN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkLCBjYWxsYmFja3MpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIFRhaWxhYmxlIGN1cnNvcnMgb25seSBldmVyIGNhbGwgYWRkZWQvYWRkZWRCZWZvcmUgY2FsbGJhY2tzLCBzbyBpdCdzIGFuXG4gIC8vIGVycm9yIGlmIHlvdSBkaWRuJ3QgcHJvdmlkZSB0aGVtLlxuICBpZiAoKG9yZGVyZWQgJiYgIWNhbGxiYWNrcy5hZGRlZEJlZm9yZSkgfHxcbiAgICAoIW9yZGVyZWQgJiYgIWNhbGxiYWNrcy5hZGRlZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvYnNlcnZlIGFuIFwiICsgKG9yZGVyZWQgPyBcIm9yZGVyZWRcIiA6IFwidW5vcmRlcmVkXCIpXG4gICAgICArIFwiIHRhaWxhYmxlIGN1cnNvciB3aXRob3V0IGEgXCJcbiAgICAgICsgKG9yZGVyZWQgPyBcImFkZGVkQmVmb3JlXCIgOiBcImFkZGVkXCIpICsgXCIgY2FsbGJhY2tcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZi50YWlsKGN1cnNvckRlc2NyaXB0aW9uLCBmdW5jdGlvbiAoZG9jKSB7XG4gICAgdmFyIGlkID0gZG9jLl9pZDtcbiAgICBkZWxldGUgZG9jLl9pZDtcbiAgICAvLyBUaGUgdHMgaXMgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsLiBIaWRlIGl0LlxuICAgIGRlbGV0ZSBkb2MudHM7XG4gICAgaWYgKG9yZGVyZWQpIHtcbiAgICAgIGNhbGxiYWNrcy5hZGRlZEJlZm9yZShpZCwgZG9jLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2tzLmFkZGVkKGlkLCBkb2MpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IgPSBmdW5jdGlvbihcbiAgY3Vyc29yRGVzY3JpcHRpb24sIG9wdGlvbnMgPSB7fSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGNvbnN0IHsgc2VsZkZvckl0ZXJhdGlvbiwgdXNlVHJhbnNmb3JtIH0gPSBvcHRpb25zO1xuICBvcHRpb25zID0geyBzZWxmRm9ySXRlcmF0aW9uLCB1c2VUcmFuc2Zvcm0gfTtcblxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSk7XG4gIHZhciBjdXJzb3JPcHRpb25zID0gY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucztcbiAgdmFyIG1vbmdvT3B0aW9ucyA9IHtcbiAgICBzb3J0OiBjdXJzb3JPcHRpb25zLnNvcnQsXG4gICAgbGltaXQ6IGN1cnNvck9wdGlvbnMubGltaXQsXG4gICAgc2tpcDogY3Vyc29yT3B0aW9ucy5za2lwLFxuICAgIHByb2plY3Rpb246IGN1cnNvck9wdGlvbnMuZmllbGRzIHx8IGN1cnNvck9wdGlvbnMucHJvamVjdGlvbixcbiAgICByZWFkUHJlZmVyZW5jZTogY3Vyc29yT3B0aW9ucy5yZWFkUHJlZmVyZW5jZSxcbiAgICBjb2xsYXRpb246IGN1cnNvck9wdGlvbnMuY29sbGF0aW9uLFxuICB9O1xuXG4gIC8vIERvIHdlIHdhbnQgYSB0YWlsYWJsZSBjdXJzb3IgKHdoaWNoIG9ubHkgd29ya3Mgb24gY2FwcGVkIGNvbGxlY3Rpb25zKT9cbiAgaWYgKGN1cnNvck9wdGlvbnMudGFpbGFibGUpIHtcbiAgICBtb25nb09wdGlvbnMubnVtYmVyT2ZSZXRyaWVzID0gLTE7XG4gIH1cblxuICB2YXIgZGJDdXJzb3IgPSBjb2xsZWN0aW9uLmZpbmQoXG4gICAgcmVwbGFjZVR5cGVzKGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyksXG4gICAgbW9uZ29PcHRpb25zKTtcblxuICAvLyBEbyB3ZSB3YW50IGEgdGFpbGFibGUgY3Vyc29yICh3aGljaCBvbmx5IHdvcmtzIG9uIGNhcHBlZCBjb2xsZWN0aW9ucyk/XG4gIGlmIChjdXJzb3JPcHRpb25zLnRhaWxhYmxlKSB7XG4gICAgLy8gV2Ugd2FudCBhIHRhaWxhYmxlIGN1cnNvci4uLlxuICAgIGRiQ3Vyc29yLmFkZEN1cnNvckZsYWcoXCJ0YWlsYWJsZVwiLCB0cnVlKVxuICAgIC8vIC4uLiBhbmQgZm9yIHRoZSBzZXJ2ZXIgdG8gd2FpdCBhIGJpdCBpZiBhbnkgZ2V0TW9yZSBoYXMgbm8gZGF0YSAocmF0aGVyXG4gICAgLy8gdGhhbiBtYWtpbmcgdXMgcHV0IHRoZSByZWxldmFudCBzbGVlcHMgaW4gdGhlIGNsaWVudCkuLi5cbiAgICBkYkN1cnNvci5hZGRDdXJzb3JGbGFnKFwiYXdhaXREYXRhXCIsIHRydWUpXG5cbiAgICAvLyBBbmQgaWYgdGhpcyBpcyBvbiB0aGUgb3Bsb2cgY29sbGVjdGlvbiBhbmQgdGhlIGN1cnNvciBzcGVjaWZpZXMgYSAndHMnLFxuICAgIC8vIHRoZW4gc2V0IHRoZSB1bmRvY3VtZW50ZWQgb3Bsb2cgcmVwbGF5IGZsYWcsIHdoaWNoIGRvZXMgYSBzcGVjaWFsIHNjYW4gdG9cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBkb2N1bWVudCAoaW5zdGVhZCBvZiBjcmVhdGluZyBhbiBpbmRleCBvbiB0cykuIFRoaXMgaXMgYVxuICAgIC8vIHZlcnkgaGFyZC1jb2RlZCBNb25nbyBmbGFnIHdoaWNoIG9ubHkgd29ya3Mgb24gdGhlIG9wbG9nIGNvbGxlY3Rpb24gYW5kXG4gICAgLy8gb25seSB3b3JrcyB3aXRoIHRoZSB0cyBmaWVsZC5cbiAgICBpZiAoY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUgPT09IE9QTE9HX0NPTExFQ1RJT04gJiZcbiAgICAgIGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yLnRzKSB7XG4gICAgICBkYkN1cnNvci5hZGRDdXJzb3JGbGFnKFwib3Bsb2dSZXBsYXlcIiwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIGN1cnNvck9wdGlvbnMubWF4VGltZU1zICE9PSAndW5kZWZpbmVkJykge1xuICAgIGRiQ3Vyc29yID0gZGJDdXJzb3IubWF4VGltZU1TKGN1cnNvck9wdGlvbnMubWF4VGltZU1zKTtcbiAgfVxuICBpZiAodHlwZW9mIGN1cnNvck9wdGlvbnMuaGludCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkYkN1cnNvciA9IGRiQ3Vyc29yLmhpbnQoY3Vyc29yT3B0aW9ucy5oaW50KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQXN5bmNocm9ub3VzQ3Vyc29yKGRiQ3Vyc29yLCBjdXJzb3JEZXNjcmlwdGlvbiwgb3B0aW9ucywgY29sbGVjdGlvbik7XG59O1xuXG4vLyBUYWlscyB0aGUgY3Vyc29yIGRlc2NyaWJlZCBieSBjdXJzb3JEZXNjcmlwdGlvbiwgbW9zdCBsaWtlbHkgb24gdGhlXG4vLyBvcGxvZy4gQ2FsbHMgZG9jQ2FsbGJhY2sgd2l0aCBlYWNoIGRvY3VtZW50IGZvdW5kLiBJZ25vcmVzIGVycm9ycyBhbmQganVzdFxuLy8gcmVzdGFydHMgdGhlIHRhaWwgb24gZXJyb3IuXG4vL1xuLy8gSWYgdGltZW91dE1TIGlzIHNldCwgdGhlbiBpZiB3ZSBkb24ndCBnZXQgYSBuZXcgZG9jdW1lbnQgZXZlcnkgdGltZW91dE1TLFxuLy8ga2lsbCBhbmQgcmVzdGFydCB0aGUgY3Vyc29yLiBUaGlzIGlzIHByaW1hcmlseSBhIHdvcmthcm91bmQgZm9yICM4NTk4LlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS50YWlsID0gZnVuY3Rpb24gKGN1cnNvckRlc2NyaXB0aW9uLCBkb2NDYWxsYmFjaywgdGltZW91dE1TKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKCFjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRhaWxhYmxlKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IHRhaWwgYSB0YWlsYWJsZSBjdXJzb3JcIik7XG5cbiAgdmFyIGN1cnNvciA9IHNlbGYuX2NyZWF0ZUFzeW5jaHJvbm91c0N1cnNvcihjdXJzb3JEZXNjcmlwdGlvbik7XG5cbiAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcbiAgdmFyIGxhc3RUUztcblxuICBNZXRlb3IuZGVmZXIoYXN5bmMgZnVuY3Rpb24gbG9vcCgpIHtcbiAgICB2YXIgZG9jID0gbnVsbDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHN0b3BwZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRvYyA9IGF3YWl0IGN1cnNvci5fbmV4dE9iamVjdFByb21pc2VXaXRoVGltZW91dCh0aW1lb3V0TVMpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFdlIHNob3VsZCBub3QgaWdub3JlIGVycm9ycyBoZXJlIHVubGVzcyB3ZSB3YW50IHRvIHNwZW5kIGEgbG90IG9mIHRpbWUgZGVidWdnaW5nXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgLy8gVGhlcmUncyBubyBnb29kIHdheSB0byBmaWd1cmUgb3V0IGlmIHRoaXMgd2FzIGFjdHVhbGx5IGFuIGVycm9yIGZyb21cbiAgICAgICAgLy8gTW9uZ28sIG9yIGp1c3QgY2xpZW50LXNpZGUgKGluY2x1ZGluZyBvdXIgb3duIHRpbWVvdXQgZXJyb3IpLiBBaFxuICAgICAgICAvLyB3ZWxsLiBCdXQgZWl0aGVyIHdheSwgd2UgbmVlZCB0byByZXRyeSB0aGUgY3Vyc29yICh1bmxlc3MgdGhlIGZhaWx1cmVcbiAgICAgICAgLy8gd2FzIGJlY2F1c2UgdGhlIG9ic2VydmUgZ290IHN0b3BwZWQpLlxuICAgICAgICBkb2MgPSBudWxsO1xuICAgICAgfVxuICAgICAgLy8gU2luY2Ugd2UgYXdhaXRlZCBhIHByb21pc2UgYWJvdmUsIHdlIG5lZWQgdG8gY2hlY2sgYWdhaW4gdG8gc2VlIGlmXG4gICAgICAvLyB3ZSd2ZSBiZWVuIHN0b3BwZWQgYmVmb3JlIGNhbGxpbmcgdGhlIGNhbGxiYWNrLlxuICAgICAgaWYgKHN0b3BwZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgLy8gSWYgYSB0YWlsYWJsZSBjdXJzb3IgY29udGFpbnMgYSBcInRzXCIgZmllbGQsIHVzZSBpdCB0byByZWNyZWF0ZSB0aGVcbiAgICAgICAgLy8gY3Vyc29yIG9uIGVycm9yLiAoXCJ0c1wiIGlzIGEgc3RhbmRhcmQgdGhhdCBNb25nbyB1c2VzIGludGVybmFsbHkgZm9yXG4gICAgICAgIC8vIHRoZSBvcGxvZywgYW5kIHRoZXJlJ3MgYSBzcGVjaWFsIGZsYWcgdGhhdCBsZXRzIHlvdSBkbyBiaW5hcnkgc2VhcmNoXG4gICAgICAgIC8vIG9uIGl0IGluc3RlYWQgb2YgbmVlZGluZyB0byB1c2UgYW4gaW5kZXguKVxuICAgICAgICBsYXN0VFMgPSBkb2MudHM7XG4gICAgICAgIGRvY0NhbGxiYWNrKGRvYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV3U2VsZWN0b3IgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvcik7XG4gICAgICAgIGlmIChsYXN0VFMpIHtcbiAgICAgICAgICBuZXdTZWxlY3Rvci50cyA9IHskZ3Q6IGxhc3RUU307XG4gICAgICAgIH1cbiAgICAgICAgY3Vyc29yID0gc2VsZi5fY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yKG5ldyBDdXJzb3JEZXNjcmlwdGlvbihcbiAgICAgICAgICBjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICBuZXdTZWxlY3RvcixcbiAgICAgICAgICBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zKSk7XG4gICAgICAgIC8vIE1vbmdvIGZhaWxvdmVyIHRha2VzIG1hbnkgc2Vjb25kcy4gIFJldHJ5IGluIGEgYml0LiAgKFdpdGhvdXQgdGhpc1xuICAgICAgICAvLyBzZXRUaW1lb3V0LCB3ZSBwZWcgdGhlIENQVSBhdCAxMDAlIGFuZCBuZXZlciBub3RpY2UgdGhlIGFjdHVhbFxuICAgICAgICAvLyBmYWlsb3Zlci5cbiAgICAgICAgc2V0VGltZW91dChsb29wLCAxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgc3RvcHBlZCA9IHRydWU7XG4gICAgICBjdXJzb3IuY2xvc2UoKTtcbiAgICB9XG4gIH07XG59O1xuXG5jb25zdCBkcml2ZXJDbGFzc2VzID0ge1xuICBjaGFuZ2VTdHJlYW1zOiBDaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyLFxuICBvcGxvZzogT3Bsb2dPYnNlcnZlRHJpdmVyLFxuICBwb2xsaW5nOiBQb2xsaW5nT2JzZXJ2ZURyaXZlcixcbn07XG5cbmZ1bmN0aW9uIF9nZXRDb25maWd1cmVkUmVhY3Rpdml0eU9yZGVyICgpIHtcbiAgY29uc3QgcmVhY3Rpdml0eVNldHRpbmcgPSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8ucmVhY3Rpdml0eTtcbiAgY29uc3QgaXNBcnJheVNldHRpbmcgPSBBcnJheS5pc0FycmF5KHJlYWN0aXZpdHlTZXR0aW5nKTtcbiAgY29uc3QgaXNTdHJpbmdTZXR0aW5nID0gdHlwZW9mIHJlYWN0aXZpdHlTZXR0aW5nID09PSAnc3RyaW5nJztcbiAgY29uc3QgaGFzQ3VzdG9tRHJpdmVyT3JkZXIgPSBpc0FycmF5U2V0dGluZyB8fCBpc1N0cmluZ1NldHRpbmc7XG5cbiAgaWYgKHJlYWN0aXZpdHlTZXR0aW5nICYmICFoYXNDdXN0b21Ecml2ZXJPcmRlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzLm1vbmdvLnJlYWN0aXZpdHkgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBvYnNlcnZlciBkcml2ZXJzJyk7XG4gIH1cblxuICBsZXQgY29uZmlndXJlZE9yZGVyID0gREVGQVVMVF9SRUFDVElWSVRZX09SREVSO1xuICBpZiAoaGFzQ3VzdG9tRHJpdmVyT3JkZXIpIHtcbiAgICBpZiAoaXNTdHJpbmdTZXR0aW5nKSB7XG4gICAgICBjb25maWd1cmVkT3JkZXIgPSBbcmVhY3Rpdml0eVNldHRpbmddO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWd1cmVkT3JkZXIgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiByZWFjdGl2aXR5U2V0dGluZykge1xuICAgICAgICBpZiAoIWNvbmZpZ3VyZWRPcmRlci5pbmNsdWRlcyhuYW1lKSkge1xuICAgICAgICAgIGNvbmZpZ3VyZWRPcmRlci5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaW52YWxpZERyaXZlck5hbWVzID0gY29uZmlndXJlZE9yZGVyLmZpbHRlcihuYW1lID0+ICFkcml2ZXJDbGFzc2VzW25hbWVdKTtcbiAgaWYgKGludmFsaWREcml2ZXJOYW1lcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgTW9uZ28gcmVhY3Rpdml0eSBkcml2ZXIocyk6ICR7aW52YWxpZERyaXZlck5hbWVzLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICBpZiAoaGFzQ3VzdG9tRHJpdmVyT3JkZXIgJiYgY29uZmlndXJlZE9yZGVyLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzLm1vbmdvLnJlYWN0aXZpdHkgbXVzdCBzcGVjaWZ5IGF0IGxlYXN0IG9uZSBvYnNlcnZlciBkcml2ZXInKTtcbiAgfVxuXG4gIHJldHVybiBjb25maWd1cmVkT3JkZXI7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9zZWxlY3RSZWFjdGl2aXR5RHJpdmVyID0gYXN5bmMgZnVuY3Rpb24gKGNvbmZpZ3VyZWRPcmRlciwgZHJpdmVyQ2hlY2tzKSB7XG4gIGNvbnN0IGF2YWlsYWJpbGl0eUVycm9ycyA9IFtdO1xuICBsZXQgZHJpdmVyQ2xhc3M7XG4gIGxldCBtYXRjaGVyO1xuICBsZXQgc29ydGVyO1xuXG4gIGZvciAoY29uc3QgZHJpdmVyTmFtZSBvZiBjb25maWd1cmVkT3JkZXIpIHtcbiAgICBjb25zdCBjaGVja2VyID0gZHJpdmVyQ2hlY2tzW2RyaXZlck5hbWVdO1xuXG4gICAgaWYgKCFjaGVja2VyKSB7XG4gICAgICBhdmFpbGFiaWxpdHlFcnJvcnMucHVzaChgVW5rbm93biBkcml2ZXIgXCIke2RyaXZlck5hbWV9XCJgKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrZXIoKTtcblxuICAgIGlmIChyZXN1bHQuYXZhaWxhYmxlKSB7XG4gICAgICBtYXRjaGVyID0gcmVzdWx0Lm1hdGNoZXI7XG4gICAgICBzb3J0ZXIgPSByZXN1bHQuc29ydGVyO1xuICAgICAgZHJpdmVyQ2xhc3MgPSBkcml2ZXJDbGFzc2VzW2RyaXZlck5hbWVdO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5yZWFzb24pIHtcbiAgICAgIGF2YWlsYWJpbGl0eUVycm9ycy5wdXNoKGAke2RyaXZlck5hbWV9OiAke3Jlc3VsdC5yZWFzb259YCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkcml2ZXJDbGFzcyxcbiAgICBtYXRjaGVyLFxuICAgIHNvcnRlcixcbiAgfTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX29ic2VydmVDaGFuZ2VzID0gYXN5bmMgZnVuY3Rpb24gKFxuICAgIGN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkLCBjYWxsYmFja3MsIG5vbk11dGF0aW5nQ2FsbGJhY2tzKSB7XG4gICAgY29uc3QgY29sbGVjdGlvbk5hbWUgPSBjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZTtcblxuICAgIGlmIChjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRhaWxhYmxlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb2JzZXJ2ZUNoYW5nZXNUYWlsYWJsZShjdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZCwgY2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICAvLyBZb3UgbWF5IG5vdCBmaWx0ZXIgb3V0IF9pZCB3aGVuIG9ic2VydmluZyBjaGFuZ2VzLCBiZWNhdXNlIHRoZSBpZCBpcyBhIGNvcmVcbiAgICAvLyBwYXJ0IG9mIHRoZSBvYnNlcnZlQ2hhbmdlcyBBUEkuXG4gICAgY29uc3QgZmllbGRzT3B0aW9ucyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucHJvamVjdGlvbiB8fCBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLmZpZWxkcztcbiAgICBpZiAoZmllbGRzT3B0aW9ucz8uX2lkID09PSAwIHx8XG4gICAgICAgIGZpZWxkc09wdGlvbnM/Ll9pZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IEVycm9yKFwiWW91IG1heSBub3Qgb2JzZXJ2ZSBhIGN1cnNvciB3aXRoIHtmaWVsZHM6IHtfaWQ6IDB9fVwiKTtcbiAgICB9XG5cbiAgICB2YXIgb2JzZXJ2ZUtleSA9IEVKU09OLnN0cmluZ2lmeShcbiAgICAgIE9iamVjdC5hc3NpZ24oe29yZGVyZWQ6IG9yZGVyZWR9LCBjdXJzb3JEZXNjcmlwdGlvbikpO1xuXG4gICAgdmFyIG11bHRpcGxleGVyLCBvYnNlcnZlRHJpdmVyO1xuICAgIHZhciBmaXJzdEhhbmRsZSA9IGZhbHNlO1xuXG4gICAgLy8gRmluZCBhIG1hdGNoaW5nIE9ic2VydmVNdWx0aXBsZXhlciwgb3IgY3JlYXRlIGEgbmV3IG9uZS4gVGhpcyBuZXh0IGJsb2NrIGlzXG4gICAgLy8gZ3VhcmFudGVlZCB0byBub3QgeWllbGQgKGFuZCBpdCBkb2Vzbid0IGNhbGwgYW55dGhpbmcgdGhhdCBjYW4gb2JzZXJ2ZSBhXG4gICAgLy8gbmV3IHF1ZXJ5KSwgc28gbm8gb3RoZXIgY2FsbHMgdG8gdGhpcyBmdW5jdGlvbiBjYW4gaW50ZXJsZWF2ZSB3aXRoIGl0LlxuICAgIGlmIChvYnNlcnZlS2V5IGluIHRoaXMuX29ic2VydmVNdWx0aXBsZXhlcnMpIHtcbiAgICAgIG11bHRpcGxleGVyID0gdGhpcy5fb2JzZXJ2ZU11bHRpcGxleGVyc1tvYnNlcnZlS2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlyc3RIYW5kbGUgPSB0cnVlO1xuICAgICAgLy8gQ3JlYXRlIGEgbmV3IE9ic2VydmVNdWx0aXBsZXhlci5cbiAgICAgIG11bHRpcGxleGVyID0gbmV3IE9ic2VydmVNdWx0aXBsZXhlcih7XG4gICAgICAgIG9yZGVyZWQ6IG9yZGVyZWQsXG4gICAgICAgIG9uU3RvcDogKCkgPT4ge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9vYnNlcnZlTXVsdGlwbGV4ZXJzW29ic2VydmVLZXldO1xuICAgICAgICAgIHJldHVybiBvYnNlcnZlRHJpdmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIG9ic2VydmVIYW5kbGUgPSBuZXcgT2JzZXJ2ZUhhbmRsZShtdWx0aXBsZXhlcixcbiAgICAgIGNhbGxiYWNrcyxcbiAgICAgIG5vbk11dGF0aW5nQ2FsbGJhY2tzLFxuICAgICk7XG5cbiAgICBjb25zdCBvcGxvZ09wdGlvbnMgPSAodGhpcy5fb3Bsb2dIYW5kbGUgJiYgdGhpcy5fb3Bsb2dIYW5kbGUuX29wbG9nT3B0aW9ucykgfHwge307XG4gICAgY29uc3QgeyBpbmNsdWRlQ29sbGVjdGlvbnMsIGV4Y2x1ZGVDb2xsZWN0aW9ucyB9ID0gb3Bsb2dPcHRpb25zO1xuICAgIGlmIChmaXJzdEhhbmRsZSkge1xuICAgICAgdmFyIG1hdGNoZXIsIHNvcnRlcjtcbiAgICAgIC8vIENyZWF0ZSB0aGUgY29sbGF0b3Igb25jZSBhbmQgc2hhcmUgaXQgYWNyb3NzIE1hdGNoZXIgYW5kIFNvcnRlci5cbiAgICAgIGNvbnN0IGNvbGxhdG9yID0gY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5jb2xsYXRpb25cbiAgICAgICAgPyBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZUNvbGxhdG9yKGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuY29sbGF0aW9uKVxuICAgICAgICA6IG51bGw7XG4gICAgICBjb25zdCBjb25maWd1cmVkT3JkZXIgPSBfZ2V0Q29uZmlndXJlZFJlYWN0aXZpdHlPcmRlcigpO1xuXG4gICAgICBjb25zdCBkcml2ZXJDaGVja3MgPSB7XG4gICAgICAgIGNoYW5nZVN0cmVhbXM6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBsZXQgbG9jYWxNYXRjaGVyO1xuICAgICAgICAgIGNvbnN0IHJlYXNvbnMgPSBbXTtcblxuICAgICAgICAgIGlmICh0aGlzLl9zdXBwb3J0c0NoYW5nZVN0cmVhbXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyUmVhc29ucyA9IFtdO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDaGFuZ2UgU3RyZWFtcyByZXF1aXJlIE1vbmdvREIgNisgYW5kIHJlcGxpY2Egc2V0IG9yIHNoYXJkZWQgY2x1c3RlclxuICAgICAgICAgICAgICBjb25zdCBhZG1pbiA9IHRoaXMuZGIuYWRtaW4oKTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VydmVySW5mbyA9IGF3YWl0IGFkbWluLnNlcnZlckluZm8oKTtcbiAgICAgICAgICAgICAgY29uc3QgaXNNYXN0ZXJQcm9taXNlID0gYWRtaW4uY29tbWFuZCh7IGlzTWFzdGVyOiAxIH0pO1xuICAgICAgICAgICAgICBjb25zdCB2ZXJzaW9uU3RyaW5nID0gc2VydmVySW5mby52ZXJzaW9uIHx8ICd1bmtub3duJztcbiAgICAgICAgICAgICAgY29uc3QgdmVyc2lvblBhcnRzID0gdmVyc2lvblN0cmluZy5zcGxpdCgnLicpLm1hcChOdW1iZXIpO1xuICAgICAgICAgICAgICBjb25zdCBtYWpvciA9IE51bWJlci5pc0Zpbml0ZSh2ZXJzaW9uUGFydHNbMF0pID8gdmVyc2lvblBhcnRzWzBdIDogMDtcblxuICAgICAgICAgICAgICAvLyBDaGVjayBNb25nb0RCIHZlcnNpb24gKDYrKVxuICAgICAgICAgICAgICBjb25zdCBoYXNNaW5WZXJzaW9uID0gbWFqb3IgPj0gNjtcblxuICAgICAgICAgICAgICBpZiAoIWhhc01pblZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJSZWFzb25zLnB1c2goYENoYW5nZSBTdHJlYW1zIGZlYXR1cmUgcmVxdWlyZSBNb25nb0RCIDYrIChjdXJyZW50ICR7dmVyc2lvblN0cmluZ30pYCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgcnVubmluZyBvbiBhIHJlcGxpY2Egc2V0IG9yIHNoYXJkZWQgY2x1c3Rlci5cbiAgICAgICAgICAgICAgICAvLyBgaXNNYXN0ZXIuaXNtYXN0ZXJgIGlzIHRydWUgb24gYSBzdGFuZGFsb25lIHRvbyAoaXQgb25seSBtZWFuc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBub2RlIGFjY2VwdHMgd3JpdGVzKSwgc28gaXQgaXMgTk9UIGEgcmVwbGljYS1zZXQgc2lnbmFsOlxuICAgICAgICAgICAgICAgIC8vIGluY2x1ZGluZyBpdCBtYWRlIHN0YW5kYWxvbmUgZGVwbG95bWVudHMgc2VsZWN0IENoYW5nZSBTdHJlYW1zXG4gICAgICAgICAgICAgICAgLy8gYW5kIHRoZW4gZmFpbCBhdCB3YXRjaCgpIHdpdGggXCIkY2hhbmdlU3RyZWFtIGlzIG9ubHkgc3VwcG9ydGVkXG4gICAgICAgICAgICAgICAgLy8gb24gcmVwbGljYSBzZXRzXCIuIGBzZXROYW1lYCBpcyB0aGUgcmVwbGljYS1zZXQgc2lnbmFsLlxuICAgICAgICAgICAgICAgIGNvbnN0IGlzTWFzdGVyID0gYXdhaXQgaXNNYXN0ZXJQcm9taXNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmVwbGljYVNldCA9IEJvb2xlYW4oaXNNYXN0ZXIuc2V0TmFtZSB8fCBpc01hc3Rlci5zZWNvbmRhcnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzU2hhcmRlZCA9IGlzTWFzdGVyLm1zZyA9PT0gJ2lzZGJncmlkJztcblxuICAgICAgICAgICAgICAgIGlmICghKGlzUmVwbGljYVNldCB8fCBpc1NoYXJkZWQpKSB7XG4gICAgICAgICAgICAgICAgICBzZXJ2ZXJSZWFzb25zLnB1c2goJ0NoYW5nZSBTdHJlYW1zIHJlcXVpcmUgYSByZXBsaWNhIHNldCBvciBzaGFyZGVkIGNsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoXCJFcnJvciBjaGVja2luZyBDaGFuZ2UgU3RyZWFtIHN1cHBvcnQ6XCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgc2VydmVyUmVhc29ucy5wdXNoKGBFcnJvciBjaGVja2luZyBDaGFuZ2UgU3RyZWFtIHN1cHBvcnQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RyZWFtU2VydmVyUmVhc29ucyA9IHNlcnZlclJlYXNvbnM7XG4gICAgICAgICAgICB0aGlzLl9zdXBwb3J0c0NoYW5nZVN0cmVhbXMgPSBzZXJ2ZXJSZWFzb25zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXRoaXMuX3N1cHBvcnRzQ2hhbmdlU3RyZWFtcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NoYW5nZVN0cmVhbVNlcnZlclJlYXNvbnM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZWFzb25zLnB1c2goLi4udGhpcy5fY2hhbmdlU3RyZWFtU2VydmVyUmVhc29ucyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWFzb25zLnB1c2goJ0NoYW5nZSBTdHJlYW1zIG5vdCBzdXBwb3J0ZWQgYnkgTW9uZ29EQiBkZXBsb3ltZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9yZGVyZWQpIHtcbiAgICAgICAgICAgIHJlYXNvbnMucHVzaCgnQ2hhbmdlIFN0cmVhbXMgb25seSBzdXBwb3J0cyB1bm9yZGVyZWQgb2JzZXJ2ZUNoYW5nZXMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2tzLl90ZXN0T25seVBvbGxDYWxsYmFjaykge1xuICAgICAgICAgICAgcmVhc29ucy5wdXNoKCdDaGFuZ2UgU3RyZWFtcyBjYW5ub3QgYmUgdXNlZCB3aXRoIF90ZXN0T25seVBvbGxDYWxsYmFjaycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEN1cnNvcnMgd2l0aCBgc2tpcGAgb3IgYGxpbWl0YCBhcmUgbm90IHN1cHBvcnRlZC4gQ2hhbmdlIHN0cmVhbXNcbiAgICAgICAgICAvLyBlbWl0IG9uZSBldmVudCBwZXIgd3JpdGUgYWNyb3NzIHRoZSBlbnRpcmUgY29sbGVjdGlvbiwgYnV0IHRoZVxuICAgICAgICAgIC8vIHJlc3VsdCBzZXQgb2YgYSBsaW1pdC9za2lwIGN1cnNvciBpcyBhIG1vdmluZyB3aW5kb3cg4oCUIHdoZW4gYSBkb2NcbiAgICAgICAgICAvLyBvdXRzaWRlIHRoYXQgd2luZG93IGNoYW5nZXMgaXQgY2FuIHNoaWZ0IHRoZSB3aW5kb3csIGFuZCBpbmZlcnJpbmdcbiAgICAgICAgICAvLyB0aGF0IHB1cmVseSBmcm9tIGNoYW5nZSBldmVudHMgd291bGQgcmVxdWlyZSByZS1ydW5uaW5nIHRoZVxuICAgICAgICAgIC8vIHF1ZXJ5LiBXaXRob3V0IHRoaXMgZmFsbC1iYWNrIHdlJ2QgZW1pdCBhZGRlZCBldmVudHMgZm9yIGFueVxuICAgICAgICAgIC8vIG1hdGNoaW5nIGluc2VydCBhbnl3aGVyZSBpbiB0aGUgY29sbGVjdGlvbiAocmVnYXJkbGVzcyBvZiBsaW1pdCksXG4gICAgICAgICAgLy8gYnJlYWtpbmcgdGVzdHMgbGlrZSBgbGl2ZWRhdGEgc2VydmVyIC0gcHVibGlzaCBjdXJzb3IgaXMgcHJvcGVybHlcbiAgICAgICAgICAvLyBhd2FpdGVkYC4gTWlycm9ycyBPcGxvZ09ic2VydmVEcml2ZXIuY3Vyc29yU3VwcG9ydGVkJ3MgcmVhc29uaW5nLlxuICAgICAgICAgIGNvbnN0IGNzT3B0aW9ucyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMgfHwge307XG4gICAgICAgICAgaWYgKGNzT3B0aW9ucy5za2lwIHx8IGNzT3B0aW9ucy5saW1pdCkge1xuICAgICAgICAgICAgcmVhc29ucy5wdXNoKCdDdXJzb3Igd2l0aCBza2lwL2xpbWl0IG5vdCBzdXBwb3J0ZWQgYnkgQ2hhbmdlIFN0cmVhbXMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVhc29ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGF2YWlsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgIHJlYXNvbjogcmVhc29ucy5qb2luKCc7ICcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9jYWxNYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKFxuICAgICAgICAgICAgICBjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvcixcbiAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBjb2xsYXRvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50ICYmIGUgaW5zdGFuY2VvZiBNaW5pTW9uZ29RdWVyeUVycm9yKSB7XG4gICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGF2YWlsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgIHJlYXNvbjogYFNlbGVjdG9yIG5vdCBzdXBwb3J0ZWQgZm9yIENoYW5nZSBTdHJlYW1zOiAke2UubWVzc2FnZX1gLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYXZhaWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgbWF0Y2hlcjogbG9jYWxNYXRjaGVyLFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIG9wbG9nOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVhc29ucyA9IFtdO1xuICAgICAgICAgIGxldCBsb2NhbE1hdGNoZXI7XG4gICAgICAgICAgbGV0IGxvY2FsU29ydGVyO1xuXG4gICAgICAgICAgaWYgKCEodGhpcy5fb3Bsb2dIYW5kbGUgJiYgIW9yZGVyZWQgJiYgIWNhbGxiYWNrcy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2spKSB7XG4gICAgICAgICAgICByZWFzb25zLnB1c2goJ09wbG9nIHRhaWxpbmcgbm90IGF2YWlsYWJsZSBmb3IgdGhpcyBjdXJzb3InKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlYXNvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoZXhjbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGggJiYgZXhjbHVkZUNvbGxlY3Rpb25zLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICBpZiAoIW9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoYE1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcy5tb25nby5vcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucyBpbmNsdWRlcyB0aGUgY29sbGVjdGlvbiAke2NvbGxlY3Rpb25OYW1lfSAtIHlvdXIgc3Vic2NyaXB0aW9ucyB3aWxsIG9ubHkgdXNlIGxvbmcgcG9sbGluZyFgKTtcbiAgICAgICAgICAgICAgICBvcGxvZ0NvbGxlY3Rpb25XYXJuaW5ncy5wdXNoKGNvbGxlY3Rpb25OYW1lKTsgLy8gd2Ugb25seSB3YW50IHRvIHNob3cgdGhlIHdhcm5pbmdzIG9uY2UgcGVyIGNvbGxlY3Rpb24hXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVhc29ucy5wdXNoKCdDb2xsZWN0aW9uIGlzIGV4Y2x1ZGVkIGZyb20gb3Bsb2cgdGFpbGluZycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCAmJiAhaW5jbHVkZUNvbGxlY3Rpb25zLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICBpZiAoIW9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoYE1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcy5tb25nby5vcGxvZ0luY2x1ZGVDb2xsZWN0aW9ucyBkb2VzIG5vdCBpbmNsdWRlIHRoZSBjb2xsZWN0aW9uICR7Y29sbGVjdGlvbk5hbWV9IC0geW91ciBzdWJzY3JpcHRpb25zIHdpbGwgb25seSB1c2UgbG9uZyBwb2xsaW5nIWApO1xuICAgICAgICAgICAgICAgIG9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLnB1c2goY29sbGVjdGlvbk5hbWUpOyAvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyB0aGUgd2FybmluZ3Mgb25jZSBwZXIgY29sbGVjdGlvbiFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZWFzb25zLnB1c2goJ0NvbGxlY3Rpb24gaXMgbm90IGluY2x1ZGVkIGluIG9wbG9nIHRhaWxpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlYXNvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBsb2NhbE1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoXG4gICAgICAgICAgICAgICAgY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGNvbGxhdG9yXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIC8vIFhYWCBtYWtlIGFsbCBjb21waWxhdGlvbiBlcnJvcnMgTWluaW1vbmdvRXJyb3Igb3Igc29tZXRoaW5nXG4gICAgICAgICAgICAgIC8vICAgICBzbyB0aGF0IHRoaXMgZG9lc24ndCBpZ25vcmUgdW5yZWxhdGVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCAmJiBlIGluc3RhbmNlb2YgTWluaU1vbmdvUXVlcnlFcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVhc29ucy5wdXNoKGBTZWxlY3RvciBub3Qgc3VwcG9ydGVkIGZvciBvcGxvZzogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFyZWFzb25zLmxlbmd0aCAmJiAhT3Bsb2dPYnNlcnZlRHJpdmVyLmN1cnNvclN1cHBvcnRlZChjdXJzb3JEZXNjcmlwdGlvbiwgbG9jYWxNYXRjaGVyKSkge1xuICAgICAgICAgICAgcmVhc29ucy5wdXNoKCdDdXJzb3Igbm90IHN1cHBvcnRlZCBieSBvcGxvZycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghcmVhc29ucy5sZW5ndGggJiYgY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5zb3J0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBsb2NhbFNvcnRlciA9IG5ldyBNaW5pbW9uZ28uU29ydGVyKFxuICAgICAgICAgICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydCxcbiAgICAgICAgICAgICAgICBjb2xsYXRvclxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAvLyBYWFggbWFrZSBhbGwgY29tcGlsYXRpb24gZXJyb3JzIE1pbmltb25nb0Vycm9yIG9yIHNvbWV0aGluZ1xuICAgICAgICAgICAgICAvLyAgICAgc28gdGhhdCB0aGlzIGRvZXNuJ3QgaWdub3JlIHVucmVsYXRlZCBleGNlcHRpb25zXG4gICAgICAgICAgICAgIHJlYXNvbnMucHVzaCgnU29ydCBub3Qgc3VwcG9ydGVkIGJ5IG9wbG9nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZTogcmVhc29ucy5sZW5ndGggPT09IDAsXG4gICAgICAgICAgICBtYXRjaGVyOiBsb2NhbE1hdGNoZXIsXG4gICAgICAgICAgICBzb3J0ZXI6IGxvY2FsU29ydGVyLFxuICAgICAgICAgICAgcmVhc29uOiByZWFzb25zLmpvaW4oJzsgJylcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBwb2xsaW5nOiAoKSA9PiAoeyBhdmFpbGFibGU6IHRydWUgfSksXG4gICAgICB9O1xuXG4gICAgICBsZXQge1xuICAgICAgICBkcml2ZXJDbGFzcyxcbiAgICAgICAgbWF0Y2hlcjogc2VsZWN0ZWRNYXRjaGVyLFxuICAgICAgICBzb3J0ZXI6IHNlbGVjdGVkU29ydGVyLFxuICAgICAgfSA9IGF3YWl0IHRoaXMuX3NlbGVjdFJlYWN0aXZpdHlEcml2ZXIoY29uZmlndXJlZE9yZGVyLCBkcml2ZXJDaGVja3MpO1xuXG4gICAgICAvLyBGYWxsYmFjayB0byBwb2xsaW5nIGlmIG5vIGRyaXZlciBpcyBhdmFpbGFibGVcbiAgICAgIGlmICghZHJpdmVyQ2xhc3MpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnTm8gcmVhY3Rpdml0eSBkcml2ZXIgYXZhaWxhYmxlIGZvciBjdXJzb3IsIGZhbGxpbmcgYmFjayB0byBwb2xsaW5nJyk7XG4gICAgICAgIGRyaXZlckNsYXNzID0gUG9sbGluZ09ic2VydmVEcml2ZXI7XG4gICAgICB9XG5cbiAgICAgIG1hdGNoZXIgPSBzZWxlY3RlZE1hdGNoZXI7XG4gICAgICBzb3J0ZXIgPSBzZWxlY3RlZFNvcnRlcjtcblxuICAgICAgb2JzZXJ2ZURyaXZlciA9IG5ldyBkcml2ZXJDbGFzcyh7XG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLFxuICAgICAgICBtb25nb0hhbmRsZTogdGhpcyxcbiAgICAgICAgbXVsdGlwbGV4ZXIsXG4gICAgICAgIG9yZGVyZWQsXG4gICAgICAgIG1hdGNoZXIsICAvLyBpZ25vcmVkIGJ5IHBvbGxpbmdcbiAgICAgICAgc29ydGVyLCAgLy8gaWdub3JlZCBieSBwb2xsaW5nXG4gICAgICAgIF90ZXN0T25seVBvbGxDYWxsYmFjazogY2FsbGJhY2tzLl90ZXN0T25seVBvbGxDYWxsYmFja1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChvYnNlcnZlRHJpdmVyLl9pbml0KSB7XG4gICAgICAgIGF3YWl0IG9ic2VydmVEcml2ZXIuX2luaXQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyBmaWVsZCBpcyBvbmx5IHNldCBmb3IgdXNlIGluIHRlc3RzLlxuICAgICAgbXVsdGlwbGV4ZXIuX29ic2VydmVEcml2ZXIgPSBvYnNlcnZlRHJpdmVyO1xuICAgIH1cbiAgICB0aGlzLl9vYnNlcnZlTXVsdGlwbGV4ZXJzW29ic2VydmVLZXldID0gbXVsdGlwbGV4ZXI7XG4gICAgLy8gQmxvY2tzIHVudGlsIHRoZSBpbml0aWFsIGFkZHMgaGF2ZSBiZWVuIHNlbnQuXG4gICAgYXdhaXQgbXVsdGlwbGV4ZXIuYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzKG9ic2VydmVIYW5kbGUpO1xuXG4gICAgcmV0dXJuIG9ic2VydmVIYW5kbGU7XG4gIH1cbiIsImltcG9ydCBjbG9uZSBmcm9tICdsb2Rhc2guY2xvbmUnXG5cbi8qKiBAdHlwZSB7aW1wb3J0KCdtb25nb2RiJyl9ICovXG5leHBvcnQgY29uc3QgTW9uZ29EQiA9IE9iamVjdC5hc3NpZ24oTnBtTW9kdWxlTW9uZ29kYiwge1xuICBPYmplY3RJRDogTnBtTW9kdWxlTW9uZ29kYi5PYmplY3RJZCxcbn0pO1xuXG4vLyBUaGUgd3JpdGUgbWV0aG9kcyBibG9jayB1bnRpbCB0aGUgZGF0YWJhc2UgaGFzIGNvbmZpcm1lZCB0aGUgd3JpdGUgKGl0IG1heVxuLy8gbm90IGJlIHJlcGxpY2F0ZWQgb3Igc3RhYmxlIG9uIGRpc2ssIGJ1dCBvbmUgc2VydmVyIGhhcyBjb25maXJtZWQgaXQpIGlmIG5vXG4vLyBjYWxsYmFjayBpcyBwcm92aWRlZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCwgdGhlbiB0aGV5IGNhbGwgdGhlIGNhbGxiYWNrXG4vLyB3aGVuIHRoZSB3cml0ZSBpcyBjb25maXJtZWQuIFRoZXkgcmV0dXJuIG5vdGhpbmcgb24gc3VjY2VzcywgYW5kIHJhaXNlIGFuXG4vLyBleGNlcHRpb24gb24gZmFpbHVyZS5cbi8vXG4vLyBBZnRlciBtYWtpbmcgYSB3cml0ZSAod2l0aCBpbnNlcnQsIHVwZGF0ZSwgcmVtb3ZlKSwgb2JzZXJ2ZXJzIGFyZVxuLy8gbm90aWZpZWQgYXN5bmNocm9ub3VzbHkuIElmIHlvdSB3YW50IHRvIHJlY2VpdmUgYSBjYWxsYmFjayBvbmNlIGFsbFxuLy8gb2YgdGhlIG9ic2VydmVyIG5vdGlmaWNhdGlvbnMgaGF2ZSBsYW5kZWQgZm9yIHlvdXIgd3JpdGUsIGRvIHRoZVxuLy8gd3JpdGVzIGluc2lkZSBhIHdyaXRlIGZlbmNlIChzZXQgRERQU2VydmVyLl9DdXJyZW50V3JpdGVGZW5jZSB0byBhIG5ld1xuLy8gX1dyaXRlRmVuY2UsIGFuZCB0aGVuIHNldCBhIGNhbGxiYWNrIG9uIHRoZSB3cml0ZSBmZW5jZS4pXG4vL1xuLy8gU2luY2Ugb3VyIGV4ZWN1dGlvbiBlbnZpcm9ubWVudCBpcyBzaW5nbGUtdGhyZWFkZWQsIHRoaXMgaXNcbi8vIHdlbGwtZGVmaW5lZCAtLSBhIHdyaXRlIFwiaGFzIGJlZW4gbWFkZVwiIGlmIGl0J3MgcmV0dXJuZWQsIGFuZCBhblxuLy8gb2JzZXJ2ZXIgXCJoYXMgYmVlbiBub3RpZmllZFwiIGlmIGl0cyBjYWxsYmFjayBoYXMgcmV0dXJuZWQuXG5cbmV4cG9ydCBjb25zdCB3cml0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHdyaXRlLCByZWZyZXNoLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgaWYgKCEgZXJyKSB7XG4gICAgICAvLyBYWFggV2UgZG9uJ3QgaGF2ZSB0byBydW4gdGhpcyBvbiBlcnJvciwgcmlnaHQ/XG4gICAgICB0cnkge1xuICAgICAgICByZWZyZXNoKCk7XG4gICAgICB9IGNhdGNoIChyZWZyZXNoRXJyKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKHJlZnJlc2hFcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyByZWZyZXNoRXJyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9O1xufTtcblxuXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtUmVzdWx0ID0gZnVuY3Rpb24gKGRyaXZlclJlc3VsdCkge1xuICB2YXIgbWV0ZW9yUmVzdWx0ID0geyBudW1iZXJBZmZlY3RlZDogMCB9O1xuICBpZiAoZHJpdmVyUmVzdWx0KSB7XG4gICAgdmFyIG1vbmdvUmVzdWx0ID0gZHJpdmVyUmVzdWx0LnJlc3VsdDtcbiAgICAvLyBPbiB1cGRhdGVzIHdpdGggdXBzZXJ0OnRydWUsIHRoZSBpbnNlcnRlZCB2YWx1ZXMgY29tZSBhcyBhIGxpc3Qgb2ZcbiAgICAvLyB1cHNlcnRlZCB2YWx1ZXMgLS0gZXZlbiB3aXRoIG9wdGlvbnMubXVsdGksIHdoZW4gdGhlIHVwc2VydCBkb2VzIGluc2VydCxcbiAgICAvLyBpdCBvbmx5IGluc2VydHMgb25lIGVsZW1lbnQuXG4gICAgaWYgKG1vbmdvUmVzdWx0LnVwc2VydGVkQ291bnQpIHtcbiAgICAgIG1ldGVvclJlc3VsdC5udW1iZXJBZmZlY3RlZCA9IG1vbmdvUmVzdWx0LnVwc2VydGVkQ291bnQ7XG5cbiAgICAgIGlmIChtb25nb1Jlc3VsdC51cHNlcnRlZElkKSB7XG4gICAgICAgIG1ldGVvclJlc3VsdC5pbnNlcnRlZElkID0gbW9uZ29SZXN1bHQudXBzZXJ0ZWRJZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbiB3YXMgdXNlZCBiZWZvcmUgTW9uZ28gNS4wLCBpbiBNb25nbyA1LjAgd2UgYXJlIG5vdCByZWNlaXZpbmcgdGhpcyBuXG4gICAgICAvLyBmaWVsZCBhbmQgc28gd2UgYXJlIHVzaW5nIG1vZGlmaWVkQ291bnQgaW5zdGVhZFxuICAgICAgbWV0ZW9yUmVzdWx0Lm51bWJlckFmZmVjdGVkID0gbW9uZ29SZXN1bHQubiB8fCBtb25nb1Jlc3VsdC5tYXRjaGVkQ291bnQgfHwgbW9uZ29SZXN1bHQubW9kaWZpZWRDb3VudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWV0ZW9yUmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XG4gIGlmIChFSlNPTi5pc0JpbmFyeShkb2N1bWVudCkpIHtcbiAgICAvLyBUaGlzIGRvZXMgbW9yZSBjb3BpZXMgdGhhbiB3ZSdkIGxpa2UsIGJ1dCBpcyBuZWNlc3NhcnkgYmVjYXVzZVxuICAgIC8vIE1vbmdvREIuQlNPTiBvbmx5IGxvb2tzIGxpa2UgaXQgdGFrZXMgYSBVaW50OEFycmF5IChhbmQgZG9lc24ndCBhY3R1YWxseVxuICAgIC8vIHNlcmlhbGl6ZSBpdCBjb3JyZWN0bHkpLlxuICAgIHJldHVybiBuZXcgTW9uZ29EQi5CaW5hcnkoQnVmZmVyLmZyb20oZG9jdW1lbnQpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLkJpbmFyeSkge1xuICAgIHJldHVybiBkb2N1bWVudDtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRCkge1xuICAgIHJldHVybiBuZXcgTW9uZ29EQi5PYmplY3RJZChkb2N1bWVudC50b0hleFN0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLk9iamVjdElkKSB7XG4gICAgcmV0dXJuIG5ldyBNb25nb0RCLk9iamVjdElkKGRvY3VtZW50LnRvSGV4U3RyaW5nKCkpO1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuVGltZXN0YW1wKSB7XG4gICAgLy8gRm9yIG5vdywgdGhlIE1ldGVvciByZXByZXNlbnRhdGlvbiBvZiBhIE1vbmdvIHRpbWVzdGFtcCB0eXBlIChub3QgYSBkYXRlIVxuICAgIC8vIHRoaXMgaXMgYSB3ZWlyZCBpbnRlcm5hbCB0aGluZyB1c2VkIGluIHRoZSBvcGxvZyEpIGlzIHRoZSBzYW1lIGFzIHRoZVxuICAgIC8vIE1vbmdvIHJlcHJlc2VudGF0aW9uLiBXZSBuZWVkIHRvIGRvIHRoaXMgZXhwbGljaXRseSBvciBlbHNlIHdlIHdvdWxkIGRvIGFcbiAgICAvLyBzdHJ1Y3R1cmFsIGNsb25lIGFuZCBsb3NlIHRoZSBwcm90b3R5cGUuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIERlY2ltYWwpIHtcbiAgICByZXR1cm4gTW9uZ29EQi5EZWNpbWFsMTI4LmZyb21TdHJpbmcoZG9jdW1lbnQudG9TdHJpbmcoKSk7XG4gIH1cbiAgaWYgKEVKU09OLl9pc0N1c3RvbVR5cGUoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VOYW1lcyhtYWtlTW9uZ29MZWdhbCwgRUpTT04udG9KU09OVmFsdWUoZG9jdW1lbnQpKTtcbiAgfVxuICAvLyBJdCBpcyBub3Qgb3JkaW5hcmlseSBwb3NzaWJsZSB0byBzdGljayBkb2xsYXItc2lnbiBrZXlzIGludG8gbW9uZ29cbiAgLy8gc28gd2UgZG9uJ3QgYm90aGVyIGNoZWNraW5nIGZvciB0aGluZ3MgdGhhdCBuZWVkIGVzY2FwaW5nIGF0IHRoaXMgdGltZS5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCByZXBsYWNlVHlwZXMgPSBmdW5jdGlvbiAoZG9jdW1lbnQsIGF0b21UcmFuc2Zvcm1lcikge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAnb2JqZWN0JyB8fCBkb2N1bWVudCA9PT0gbnVsbClcbiAgICByZXR1cm4gZG9jdW1lbnQ7XG5cbiAgdmFyIHJlcGxhY2VkVG9wTGV2ZWxBdG9tID0gYXRvbVRyYW5zZm9ybWVyKGRvY3VtZW50KTtcbiAgaWYgKHJlcGxhY2VkVG9wTGV2ZWxBdG9tICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIHJlcGxhY2VkVG9wTGV2ZWxBdG9tO1xuXG4gIHZhciByZXQgPSBkb2N1bWVudDtcbiAgT2JqZWN0LmVudHJpZXMoZG9jdW1lbnQpLmZvckVhY2goZnVuY3Rpb24gKFtrZXksIHZhbF0pIHtcbiAgICB2YXIgdmFsUmVwbGFjZWQgPSByZXBsYWNlVHlwZXModmFsLCBhdG9tVHJhbnNmb3JtZXIpO1xuICAgIGlmICh2YWwgIT09IHZhbFJlcGxhY2VkKSB7XG4gICAgICAvLyBMYXp5IGNsb25lLiBTaGFsbG93IGNvcHkuXG4gICAgICBpZiAocmV0ID09PSBkb2N1bWVudClcbiAgICAgICAgcmV0ID0gY2xvbmUoZG9jdW1lbnQpO1xuICAgICAgcmV0W2tleV0gPSB2YWxSZXBsYWNlZDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcGxhY2VNb25nb0F0b21XaXRoTWV0ZW9yID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuQmluYXJ5KSB7XG4gICAgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgaWYgKGRvY3VtZW50LnN1Yl90eXBlICE9PSAwKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgfVxuICAgIHZhciBidWZmZXIgPSBkb2N1bWVudC52YWx1ZSh0cnVlKTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLk9iamVjdElkKSB7XG4gICAgcmV0dXJuIG5ldyBNb25nby5PYmplY3RJRChkb2N1bWVudC50b0hleFN0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLkRlY2ltYWwxMjgpIHtcbiAgICByZXR1cm4gRGVjaW1hbChkb2N1bWVudC50b1N0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnRbXCJFSlNPTiR0eXBlXCJdICYmIGRvY3VtZW50W1wiRUpTT04kdmFsdWVcIl0gJiYgT2JqZWN0LmtleXMoZG9jdW1lbnQpLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiBFSlNPTi5mcm9tSlNPTlZhbHVlKHJlcGxhY2VOYW1lcyh1bm1ha2VNb25nb0xlZ2FsLCBkb2N1bWVudCkpO1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuVGltZXN0YW1wKSB7XG4gICAgLy8gRm9yIG5vdywgdGhlIE1ldGVvciByZXByZXNlbnRhdGlvbiBvZiBhIE1vbmdvIHRpbWVzdGFtcCB0eXBlIChub3QgYSBkYXRlIVxuICAgIC8vIHRoaXMgaXMgYSB3ZWlyZCBpbnRlcm5hbCB0aGluZyB1c2VkIGluIHRoZSBvcGxvZyEpIGlzIHRoZSBzYW1lIGFzIHRoZVxuICAgIC8vIE1vbmdvIHJlcHJlc2VudGF0aW9uLiBXZSBuZWVkIHRvIGRvIHRoaXMgZXhwbGljaXRseSBvciBlbHNlIHdlIHdvdWxkIGRvIGFcbiAgICAvLyBzdHJ1Y3R1cmFsIGNsb25lIGFuZCBsb3NlIHRoZSBwcm90b3R5cGUuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBtYWtlTW9uZ29MZWdhbCA9IG5hbWUgPT4gXCJFSlNPTlwiICsgbmFtZTtcbmNvbnN0IHVubWFrZU1vbmdvTGVnYWwgPSBuYW1lID0+IG5hbWUuc3Vic3RyKDUpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZU5hbWVzKGZpbHRlciwgdGhpbmcpIHtcbiAgaWYgKHR5cGVvZiB0aGluZyA9PT0gXCJvYmplY3RcIiAmJiB0aGluZyAhPT0gbnVsbCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgcmV0dXJuIHRoaW5nLm1hcChyZXBsYWNlTmFtZXMuYmluZChudWxsLCBmaWx0ZXIpKTtcbiAgICB9XG4gICAgdmFyIHJldCA9IHt9O1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChba2V5LCB2YWx1ZV0pIHtcbiAgICAgIHJldFtmaWx0ZXIoa2V5KV0gPSByZXBsYWNlTmFtZXMoZmlsdGVyLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICByZXR1cm4gdGhpbmc7XG59XG5cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gTW9uZ29EQiBvcGVyYXRpb24gdGltZXMuXG4gKiBAcGFyYW0ge01vbmdvREIuVGltZXN0YW1wfG9iamVjdH0gb3BUaW1lMSAtIFRoZSBmaXJzdCBvcGVyYXRpb24gdGltZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtNb25nb0RCLlRpbWVzdGFtcHxvYmplY3R9IG9wVGltZTIgLSBUaGUgc2Vjb25kIG9wZXJhdGlvbiB0aW1lIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIFJldHVybnMgYSBudW1iZXIgaW5kaWNhdGluZyB0aGUgY29tcGFyaXNvbiByZXN1bHQ6XG4gKiAgIC0gQSBuZWdhdGl2ZSBudW1iZXIgaWYgb3BUaW1lMSBpcyBsZXNzIHRoYW4gb3BUaW1lMi5cbiAqICAgLSBaZXJvIGlmIG9wVGltZTEgaXMgZXF1YWwgdG8gb3BUaW1lMi5cbiAqICAgLSBBIHBvc2l0aXZlIG51bWJlciBpZiBvcFRpbWUxIGlzIGdyZWF0ZXIgdGhhbiBvcFRpbWUyLlxuICovXG4vKipcbiAqIENvbXBhcmVzIHR3byBNb25nb0RCIG9wZXJhdGlvbiB0aW1lcyAob3BUaW1lcykuXG4gKlxuICogQm90aCBwYXJhbWV0ZXJzIGFjY2VwdCBhbnkgdmFsdWUgYWNjZXB0ZWQgYnkgdGhlIGBNb25nb0RCLlRpbWVzdGFtcGAgY29uc3RydWN0b3I6XG4gKiAgIC0gYSBgTG9uZ2AgKGUuZy4sIGBuZXcgVGltZXN0YW1wKExvbmcpYCksXG4gKiAgIC0gYW4gb2JqZWN0IG9mIHRoZSBmb3JtIGB7IHQ6IG51bWJlciwgaTogbnVtYmVyIH1gLFxuICogICAtIG9yIHRoZSBsZWdhY3kgdHdvLW51bWJlciBmb3JtIGBsb3csIGhpZ2hgICh2aWEgYFRpbWVzdGFtcChsb3csIGhpZ2gpYCksIHdoaWNoIGlzIGRlcHJlY2F0ZWQ7XG4gKiAgICAgcHJlZmVyIGB7IHQsIGkgfWAgb3IgYSBgTG9uZ2AuXG4gKlxuICogVGhlIGZ1bmN0aW9uIGNvbnN0cnVjdHMgYSBgTW9uZ29EQi5UaW1lc3RhbXBgIGZyb20gYG9wVGltZTFgIGFuZCBjb21wYXJlcyBpdCB0byBgb3BUaW1lMmBcbiAqIHVzaW5nIGBUaW1lc3RhbXAjY29tcGFyZWAuXG4gKlxuICogQHBhcmFtIHtNb25nb0RCLkxvbmd8e3Q6bnVtYmVyLGk6bnVtYmVyfXxBcnJheTxudW1iZXI+fG51bWJlcn0gb3BUaW1lMSAtIE9wZXJhdGlvbiB0aW1lIDE7IGFueSB2YWx1ZSBhY2NlcHRlZCBieSBgTW9uZ29EQi5UaW1lc3RhbXBgLlxuICogICAgIEZvciB0aGUgdHdvLW51bWJlciBmb3JtIHlvdSBtYXkgcHJvdmlkZSBhbiBhcnJheSBgW2xvdywgaGlnaF1gLCBidXQgcGFzc2luZyB0d28gc2VwYXJhdGUgbnVtYmVycyB0byB0aGUgY29uc3RydWN0b3IgaXMgZGVwcmVjYXRlZC5cbiAqIEBwYXJhbSB7TW9uZ29EQi5Mb25nfHt0Om51bWJlcixpOm51bWJlcn18QXJyYXk8bnVtYmVyPnxudW1iZXJ9IG9wVGltZTIgLSBPcGVyYXRpb24gdGltZSAyOyBzYW1lIGFjY2VwdGVkIGZvcm1zIGFzIGBvcFRpbWUxYC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IENvbXBhcmlzb24gcmVzdWx0OiBuZWdhdGl2ZSBpZiBgb3BUaW1lMWAgPCBgb3BUaW1lMmAsIHplcm8gaWYgZXF1YWwsIHBvc2l0aXZlIGlmIGBvcFRpbWUxYCA+IGBvcFRpbWUyYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVPcGVyYXRpb25UaW1lcyhvcFRpbWUxLCBvcFRpbWUyKSB7XG4gIHJldHVybiAobmV3IE1vbmdvREIuVGltZXN0YW1wKG9wVGltZTEpKS5jb21wYXJlKG9wVGltZTIpO1xufVxuIiwiaW1wb3J0IExvY2FsQ29sbGVjdGlvbiBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2xvY2FsX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHsgcmVwbGFjZU1vbmdvQXRvbVdpdGhNZXRlb3IsIHJlcGxhY2VUeXBlcyB9IGZyb20gJy4vbW9uZ29fY29tbW9uJztcblxuLyoqXG4gKiBUaGlzIGlzIGp1c3QgYSBsaWdodCB3cmFwcGVyIGZvciB0aGUgY3Vyc29yLiBUaGUgZ29hbCBoZXJlIGlzIHRvIGVuc3VyZSBjb21wYXRpYmlsaXR5IGV2ZW4gaWZcbiAqIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VzIG9uIHRoZSBNb25nb0RCIGRyaXZlci5cbiAqXG4gKiBUaGlzIGlzIGFuIGludGVybmFsIGltcGxlbWVudGF0aW9uIGRldGFpbCBhbmQgaXMgY3JlYXRlZCBsYXppbHkgYnkgdGhlIG1haW4gQ3Vyc29yIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNocm9ub3VzQ3Vyc29yIHtcbiAgX2Nsb3NpbmcgPSBmYWxzZTtcbiAgX3BlbmRpbmdOZXh0ID0gbnVsbDtcbiAgY29uc3RydWN0b3IoZGJDdXJzb3IsIGN1cnNvckRlc2NyaXB0aW9uLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fZGJDdXJzb3IgPSBkYkN1cnNvcjtcbiAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbiA9IGN1cnNvckRlc2NyaXB0aW9uO1xuXG4gICAgdGhpcy5fc2VsZkZvckl0ZXJhdGlvbiA9IG9wdGlvbnMuc2VsZkZvckl0ZXJhdGlvbiB8fCB0aGlzO1xuICAgIGlmIChvcHRpb25zLnVzZVRyYW5zZm9ybSAmJiBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRyYW5zZm9ybSkge1xuICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTG9jYWxDb2xsZWN0aW9uLndyYXBUcmFuc2Zvcm0oXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudHJhbnNmb3JtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJhbnNmb3JtID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl92aXNpdGVkSWRzID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIH1cblxuICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgIHZhciBjdXJzb3IgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IGN1cnNvci5fbmV4dE9iamVjdFByb21pc2UoKTtcbiAgICAgICAgcmV0dXJuIHsgZG9uZTogIXZhbHVlLCB2YWx1ZSB9O1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSBuZXh0IG9iamVjdCBmcm9tIHRoZSB1bmRlcmx5aW5nIGN1cnNvciAoYmVmb3JlXG4gIC8vIHRoZSBNb25nby0+TWV0ZW9yIHR5cGUgcmVwbGFjZW1lbnQpLlxuICBhc3luYyBfcmF3TmV4dE9iamVjdFByb21pc2UoKSB7XG4gICAgaWYgKHRoaXMuX2Nsb3NpbmcpIHtcbiAgICAgIC8vIFByZXZlbnQgbmV4dCgpIGFmdGVyIGNsb3NlIGlzIGNhbGxlZFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9wZW5kaW5nTmV4dCA9IHRoaXMuX2RiQ3Vyc29yLm5leHQoKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3BlbmRpbmdOZXh0O1xuICAgICAgdGhpcy5fcGVuZGluZ05leHQgPSBudWxsO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9wZW5kaW5nTmV4dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSBuZXh0IG9iamVjdCBmcm9tIHRoZSBjdXJzb3IsIHNraXBwaW5nIHRob3NlIHdob3NlXG4gIC8vIElEcyB3ZSd2ZSBhbHJlYWR5IHNlZW4gYW5kIHJlcGxhY2luZyBNb25nbyBhdG9tcyB3aXRoIE1ldGVvciBhdG9tcy5cbiAgYXN5bmMgX25leHRPYmplY3RQcm9taXNlICgpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIGRvYyA9IGF3YWl0IHRoaXMuX3Jhd05leHRPYmplY3RQcm9taXNlKCk7XG5cbiAgICAgIGlmICghZG9jKSByZXR1cm4gbnVsbDtcbiAgICAgIGRvYyA9IHJlcGxhY2VUeXBlcyhkb2MsIHJlcGxhY2VNb25nb0F0b21XaXRoTWV0ZW9yKTtcblxuICAgICAgaWYgKCF0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRhaWxhYmxlICYmICdfaWQnIGluIGRvYykge1xuICAgICAgICAvLyBEaWQgTW9uZ28gZ2l2ZSB1cyBkdXBsaWNhdGUgZG9jdW1lbnRzIGluIHRoZSBzYW1lIGN1cnNvcj8gSWYgc28sXG4gICAgICAgIC8vIGlnbm9yZSB0aGlzIG9uZS4gKERvIHRoaXMgYmVmb3JlIHRoZSB0cmFuc2Zvcm0sIHNpbmNlIHRyYW5zZm9ybSBtaWdodFxuICAgICAgICAvLyByZXR1cm4gc29tZSB1bnJlbGF0ZWQgdmFsdWUuKSBXZSBkb24ndCBkbyB0aGlzIGZvciB0YWlsYWJsZSBjdXJzb3JzLFxuICAgICAgICAvLyBiZWNhdXNlIHdlIHdhbnQgdG8gbWFpbnRhaW4gTygxKSBtZW1vcnkgdXNhZ2UuIEFuZCBpZiB0aGVyZSBpc24ndCBfaWRcbiAgICAgICAgLy8gZm9yIHNvbWUgcmVhc29uIChtYXliZSBpdCdzIHRoZSBvcGxvZyksIHRoZW4gd2UgZG9uJ3QgZG8gdGhpcyBlaXRoZXIuXG4gICAgICAgIC8vIChCZSBjYXJlZnVsIHRvIGRvIHRoaXMgZm9yIGZhbHNleSBidXQgZXhpc3RpbmcgX2lkLCB0aG91Z2guKVxuICAgICAgICBpZiAodGhpcy5fdmlzaXRlZElkcy5oYXMoZG9jLl9pZCkpIGNvbnRpbnVlO1xuICAgICAgICB0aGlzLl92aXNpdGVkSWRzLnNldChkb2MuX2lkLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3RyYW5zZm9ybSlcbiAgICAgICAgZG9jID0gdGhpcy5fdHJhbnNmb3JtKGRvYyk7XG5cbiAgICAgIHJldHVybiBkb2M7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJucyBhIHByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2l0aCB0aGUgbmV4dCBvYmplY3QgKGxpa2Ugd2l0aFxuICAvLyBfbmV4dE9iamVjdFByb21pc2UpIG9yIHJlamVjdGVkIGlmIHRoZSBjdXJzb3IgZG9lc24ndCByZXR1cm4gd2l0aGluXG4gIC8vIHRpbWVvdXRNUyBtcy5cbiAgX25leHRPYmplY3RQcm9taXNlV2l0aFRpbWVvdXQodGltZW91dE1TKSB7XG4gICAgY29uc3QgbmV4dE9iamVjdFByb21pc2UgPSB0aGlzLl9uZXh0T2JqZWN0UHJvbWlzZSgpO1xuICAgIGlmICghdGltZW91dE1TKSB7XG4gICAgICByZXR1cm4gbmV4dE9iamVjdFByb21pc2U7XG4gICAgfVxuXG4gICAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIC8vIE9uIHRpbWVvdXQsIGNsb3NlIHRoZSBjdXJzb3IuXG4gICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLmNsb3NlKCkpO1xuICAgICAgfSwgdGltZW91dE1TKTtcblxuICAgICAgLy8gSWYgdGhlIGBfbmV4dE9iamVjdFByb21pc2VgIHJldHVybmVkIGZpcnN0LCBjYW5jZWwgdGhlIHRpbWVvdXQuXG4gICAgICBuZXh0T2JqZWN0UHJvbWlzZS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW25leHRPYmplY3RQcm9taXNlLCB0aW1lb3V0UHJvbWlzZV0pO1xuICB9XG5cbiAgYXN5bmMgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIC8vIEdldCBiYWNrIHRvIHRoZSBiZWdpbm5pbmcuXG4gICAgdGhpcy5fcmV3aW5kKCk7XG5cbiAgICBsZXQgaWR4ID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgZG9jID0gYXdhaXQgdGhpcy5fbmV4dE9iamVjdFByb21pc2UoKTtcbiAgICAgIGlmICghZG9jKSByZXR1cm47XG4gICAgICBhd2FpdCBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGRvYywgaWR4KyssIHRoaXMuX3NlbGZGb3JJdGVyYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG1hcChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBhd2FpdCB0aGlzLmZvckVhY2goYXN5bmMgKGRvYywgaW5kZXgpID0+IHtcbiAgICAgIHJlc3VsdHMucHVzaChhd2FpdCBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGRvYywgaW5kZXgsIHRoaXMuX3NlbGZGb3JJdGVyYXRpb24pKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgX3Jld2luZCgpIHtcbiAgICAvLyBrbm93biB0byBiZSBzeW5jaHJvbm91c1xuICAgIHRoaXMuX2RiQ3Vyc29yLnJld2luZCgpO1xuXG4gICAgdGhpcy5fdmlzaXRlZElkcyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICB9XG5cbiAgLy8gTW9zdGx5IHVzYWJsZSBmb3IgdGFpbGFibGUgY3Vyc29ycy5cbiAgYXN5bmMgY2xvc2UoKSB7XG4gICAgdGhpcy5fY2xvc2luZyA9IHRydWU7XG4gICAgLy8gSWYgdGhlcmUncyBhIHBlbmRpbmcgbmV4dCgpLCB3YWl0IGZvciBpdCB0byBmaW5pc2ggb3IgYWJvcnRcbiAgICBpZiAodGhpcy5fcGVuZGluZ05leHQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX3BlbmRpbmdOZXh0O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpZ25vcmVcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZGJDdXJzb3IuY2xvc2UoKTtcbiAgfVxuXG4gIGZldGNoKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChkb2MgPT4gZG9jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGSVhNRTogKG5vZGU6MzQ2ODApIFtNT05HT0RCIERSSVZFUl0gV2FybmluZzogY3Vyc29yLmNvdW50IGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmVcbiAgICogIHJlbW92ZWQgaW4gdGhlIG5leHQgbWFqb3IgdmVyc2lvbiwgcGxlYXNlIHVzZSBgY29sbGVjdGlvbi5lc3RpbWF0ZWREb2N1bWVudENvdW50YCBvclxuICAgKiAgYGNvbGxlY3Rpb24uY291bnREb2N1bWVudHNgIGluc3RlYWQuXG4gICAqL1xuICBjb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGJDdXJzb3IuY291bnQoKTtcbiAgfVxuXG4gIC8vIFRoaXMgbWV0aG9kIGlzIE5PVCB3cmFwcGVkIGluIEN1cnNvci5cbiAgYXN5bmMgZ2V0UmF3T2JqZWN0cyhvcmRlcmVkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChvcmRlcmVkKSB7XG4gICAgICByZXR1cm4gc2VsZi5mZXRjaCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0cyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgYXdhaXQgc2VsZi5mb3JFYWNoKGZ1bmN0aW9uIChkb2MpIHtcbiAgICAgICAgcmVzdWx0cy5zZXQoZG9jLl9pZCwgZG9jKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICB9XG59IiwiaW1wb3J0IHsgQVNZTkNfQ1VSU09SX01FVEhPRFMsIGdldEFzeW5jTWV0aG9kTmFtZSB9IGZyb20gJ21ldGVvci9taW5pbW9uZ28vY29uc3RhbnRzJztcbmltcG9ydCB7IHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvLCByZXBsYWNlVHlwZXMgfSBmcm9tICcuL21vbmdvX2NvbW1vbic7XG5pbXBvcnQgTG9jYWxDb2xsZWN0aW9uIGZyb20gJ21ldGVvci9taW5pbW9uZ28vbG9jYWxfY29sbGVjdGlvbic7XG5pbXBvcnQgeyBDdXJzb3JEZXNjcmlwdGlvbiB9IGZyb20gJy4vY3Vyc29yX2Rlc2NyaXB0aW9uJztcbmltcG9ydCB7IE9ic2VydmVDYWxsYmFja3MsIE9ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmludGVyZmFjZSBNb25nb0ludGVyZmFjZSB7XG4gIHJhd0NvbGxlY3Rpb246IChjb2xsZWN0aW9uTmFtZTogc3RyaW5nKSA9PiBhbnk7XG4gIF9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3I6IChjdXJzb3JEZXNjcmlwdGlvbjogQ3Vyc29yRGVzY3JpcHRpb24sIG9wdGlvbnM6IEN1cnNvck9wdGlvbnMpID0+IGFueTtcbiAgX29ic2VydmVDaGFuZ2VzOiAoY3Vyc29yRGVzY3JpcHRpb246IEN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkOiBib29sZWFuLCBjYWxsYmFja3M6IGFueSwgbm9uTXV0YXRpbmdDYWxsYmFja3M/OiBib29sZWFuKSA9PiBhbnk7XG59XG5cbmludGVyZmFjZSBDdXJzb3JPcHRpb25zIHtcbiAgc2VsZkZvckl0ZXJhdGlvbjogQ3Vyc29yPGFueT47XG4gIHVzZVRyYW5zZm9ybTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ3Vyc29yXG4gKlxuICogVGhlIG1haW4gY3Vyc29yIG9iamVjdCByZXR1cm5lZCBmcm9tIGZpbmQoKSwgaW1wbGVtZW50aW5nIHRoZSBkb2N1bWVudGVkXG4gKiBNb25nby5Db2xsZWN0aW9uIGN1cnNvciBBUEkuXG4gKlxuICogV3JhcHMgYSBDdXJzb3JEZXNjcmlwdGlvbiBhbmQgbGF6aWx5IGNyZWF0ZXMgYW4gQXN5bmNocm9ub3VzQ3Vyc29yXG4gKiAob25seSBjb250YWN0cyBNb25nb0RCIHdoZW4gbWV0aG9kcyBsaWtlIGZldGNoIG9yIGZvckVhY2ggYXJlIGNhbGxlZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXJzb3I8VCwgVSA9IFQ+IHtcbiAgcHVibGljIF9tb25nbzogTW9uZ29JbnRlcmZhY2U7XG4gIHB1YmxpYyBfY3Vyc29yRGVzY3JpcHRpb246IEN1cnNvckRlc2NyaXB0aW9uO1xuICBwdWJsaWMgX3N5bmNocm9ub3VzQ3Vyc29yOiBhbnkgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG1vbmdvOiBNb25nb0ludGVyZmFjZSwgY3Vyc29yRGVzY3JpcHRpb246IEN1cnNvckRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5fbW9uZ28gPSBtb25nbztcbiAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbiA9IGN1cnNvckRlc2NyaXB0aW9uO1xuICAgIHRoaXMuX3N5bmNocm9ub3VzQ3Vyc29yID0gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIGNvdW50QXN5bmMoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5fbW9uZ28ucmF3Q29sbGVjdGlvbih0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSk7XG4gICAgcmV0dXJuIGF3YWl0IGNvbGxlY3Rpb24uY291bnREb2N1bWVudHMoXG4gICAgICByZXBsYWNlVHlwZXModGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICAgIHJlcGxhY2VUeXBlcyh0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyksXG4gICAgKTtcbiAgfVxuXG4gIGNvdW50KCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcImNvdW50KCkgaXMgbm90IGF2YWlsYWJsZSBvbiB0aGUgc2VydmVyLiBQbGVhc2UgdXNlIGNvdW50QXN5bmMoKSBpbnN0ZWFkLlwiXG4gICAgKTtcbiAgfVxuXG4gIGdldFRyYW5zZm9ybSgpOiAoKGRvYzogYW55KSA9PiBhbnkpIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50cmFuc2Zvcm07XG4gIH1cblxuICBfcHVibGlzaEN1cnNvcihzdWI6IGFueSk6IGFueSB7XG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICAgIHJldHVybiBNb25nby5Db2xsZWN0aW9uLl9wdWJsaXNoQ3Vyc29yKHRoaXMsIHN1YiwgY29sbGVjdGlvbik7XG4gIH1cblxuICBfZ2V0Q29sbGVjdGlvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gIH1cblxuICBvYnNlcnZlKGNhbGxiYWNrczogT2JzZXJ2ZUNhbGxiYWNrczxVPik6IGFueSB7XG4gICAgcmV0dXJuIExvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUZyb21PYnNlcnZlQ2hhbmdlcyh0aGlzLCBjYWxsYmFja3MpO1xuICB9XG5cbiAgYXN5bmMgb2JzZXJ2ZUFzeW5jKGNhbGxiYWNrczogT2JzZXJ2ZUNhbGxiYWNrczxVPik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZSh0aGlzLm9ic2VydmUoY2FsbGJhY2tzKSkpO1xuICB9XG5cbiAgb2JzZXJ2ZUNoYW5nZXMoY2FsbGJhY2tzOiBPYnNlcnZlQ2hhbmdlc0NhbGxiYWNrczxVPiwgb3B0aW9uczogeyBub25NdXRhdGluZ0NhbGxiYWNrcz86IGJvb2xlYW4gfSA9IHt9KTogYW55IHtcbiAgICBjb25zdCBvcmRlcmVkID0gTG9jYWxDb2xsZWN0aW9uLl9vYnNlcnZlQ2hhbmdlc0NhbGxiYWNrc0FyZU9yZGVyZWQoY2FsbGJhY2tzKTtcbiAgICByZXR1cm4gdGhpcy5fbW9uZ28uX29ic2VydmVDaGFuZ2VzKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24sXG4gICAgICBvcmRlcmVkLFxuICAgICAgY2FsbGJhY2tzLFxuICAgICAgb3B0aW9ucy5ub25NdXRhdGluZ0NhbGxiYWNrc1xuICAgICk7XG4gIH1cblxuICBhc3luYyBvYnNlcnZlQ2hhbmdlc0FzeW5jKGNhbGxiYWNrczogT2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3M8VT4sIG9wdGlvbnM6IHsgbm9uTXV0YXRpbmdDYWxsYmFja3M/OiBib29sZWFuIH0gPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZUNoYW5nZXMoY2FsbGJhY2tzLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vLyBBZGQgY3Vyc29yIG1ldGhvZHMgZHluYW1pY2FsbHlcblsuLi5BU1lOQ19DVVJTT1JfTUVUSE9EUywgU3ltYm9sLml0ZXJhdG9yLCBTeW1ib2wuYXN5bmNJdGVyYXRvcl0uZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgaWYgKG1ldGhvZE5hbWUgPT09ICdjb3VudCcpIHJldHVybjtcblxuICAoQ3Vyc29yLnByb3RvdHlwZSBhcyBhbnkpW21ldGhvZE5hbWVdID0gZnVuY3Rpb24odGhpczogQ3Vyc29yPGFueT4sIC4uLmFyZ3M6IGFueVtdKTogYW55IHtcbiAgICBjb25zdCBjdXJzb3IgPSBzZXR1cEFzeW5jaHJvbm91c0N1cnNvcih0aGlzLCBtZXRob2ROYW1lKTtcbiAgICByZXR1cm4gY3Vyc29yW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICB9O1xuXG4gIGlmIChtZXRob2ROYW1lID09PSBTeW1ib2wuaXRlcmF0b3IgfHwgbWV0aG9kTmFtZSA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHJldHVybjtcblxuICBjb25zdCBtZXRob2ROYW1lQXN5bmMgPSBnZXRBc3luY01ldGhvZE5hbWUobWV0aG9kTmFtZSk7XG5cbiAgKEN1cnNvci5wcm90b3R5cGUgYXMgYW55KVttZXRob2ROYW1lQXN5bmNdID0gZnVuY3Rpb24odGhpczogQ3Vyc29yPGFueT4sIC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpc1ttZXRob2ROYW1lXSguLi5hcmdzKTtcbiAgfTtcbn0pO1xuXG5mdW5jdGlvbiBzZXR1cEFzeW5jaHJvbm91c0N1cnNvcihjdXJzb3I6IEN1cnNvcjxhbnk+LCBtZXRob2Q6IHN0cmluZyB8IHN5bWJvbCk6IGFueSB7XG4gIGlmIChjdXJzb3IuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudGFpbGFibGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjYWxsICR7U3RyaW5nKG1ldGhvZCl9IG9uIGEgdGFpbGFibGUgY3Vyc29yYCk7XG4gIH1cblxuICBpZiAoIWN1cnNvci5fc3luY2hyb25vdXNDdXJzb3IpIHtcbiAgICBjdXJzb3IuX3N5bmNocm9ub3VzQ3Vyc29yID0gY3Vyc29yLl9tb25nby5fY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yKFxuICAgICAgY3Vyc29yLl9jdXJzb3JEZXNjcmlwdGlvbixcbiAgICAgIHtcbiAgICAgICAgc2VsZkZvckl0ZXJhdGlvbjogY3Vyc29yLFxuICAgICAgICB1c2VUcmFuc2Zvcm06IHRydWUsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBjdXJzb3IuX3N5bmNocm9ub3VzQ3Vyc29yO1xufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKipcbiAqIFNoYXJlZENoYW5nZVN0cmVhbSDigJQgb25lIE1vbmdvREIgY2hhbmdlIHN0cmVhbSBzaGFyZWQgcGVyIGNvbGxlY3Rpb24uXG4gKlxuICogRXZlcnkgZHJpdmVyIG9uIGEgY29sbGVjdGlvbiB3YXRjaGVzIHRoZSB3aG9sZSBjb2xsZWN0aW9uIHdpdGggaWRlbnRpY2FsXG4gKiBvcHRpb25zIGFuZCBmaWx0ZXJzIHBlci1kb2N1bWVudCBpbiBpdHMgb3duIG1hdGNoZXIsIHNvIHRoZXkgY2FuIHNoYXJlIG9uZVxuICogc2VydmVyLXNpZGUgY3Vyc29yLiBUaGlzIG9wZW5zIGEgc2luZ2xlIGNvbGxlY3Rpb24ud2F0Y2goKSBhbmQgbXVsdGljYXN0cyBlYWNoXG4gKiByYXcgZXZlbnQgaW4tcHJvY2VzcyB0byBldmVyeSBzdWJzY3JpYmVkIGRyaXZlciDigJQgbGlrZSB0aGUgb3Bsb2cgZHJpdmVyXG4gKiBzaGFyaW5nIG9uZSB0YWlsIHZpYSBhIGNyb3NzYmFyLlxuICpcbiAqIEl0IG93bnMgdGhlIGN1cnNvciBsaWZlY3ljbGU6IGFuIGVycm9yL2Nsb3NlIHJlc3RhcnRzIGZyb20gdGhlIGxhc3QgcmVzdW1lXG4gKiB0b2tlbiAoc3RhcnRBZnRlciksIHJlcGxheWluZyBldmVudHMgbWlzc2VkIHdoaWxlIHJlY29ubmVjdGluZy4gQSByZXN0YXJ0XG4gKiByZXBsYWNlcyBvbmx5IHRoZSBjdXJzb3I7IGRyaXZlcnMgYXJlIHVudG91Y2hlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoYXJlZENoYW5nZVN0cmVhbSB7XG4gIGNvbnN0cnVjdG9yKG1vbmdvSGFuZGxlLCBjb2xsZWN0aW9uTmFtZSwgb25FbXB0eSkge1xuICAgIHRoaXMuX21vbmdvSGFuZGxlID0gbW9uZ29IYW5kbGU7XG4gICAgdGhpcy5fY29sbGVjdGlvbk5hbWUgPSBjb2xsZWN0aW9uTmFtZTtcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgbGFzdCBkcml2ZXIgZGV0YWNoZXMgc28gdGhlIG93bmVyIGNhbiBkZXJlZ2lzdGVyIHVzLlxuICAgIHRoaXMuX29uRW1wdHkgPSBvbkVtcHR5O1xuXG4gICAgdGhpcy5fZHJpdmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9jaGFuZ2VTdHJlYW0gPSBudWxsO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcbiAgICAvLyBMYXN0IHNlZW4gcmVzdW1lIHRva2VuOyBhIHJlc3RhcnQgcmVwbGF5cyBmcm9tIGhlcmUgKHN0YXJ0QWZ0ZXIpLlxuICAgIHRoaXMuX3Jlc3VtZVRva2VuID0gbnVsbDtcbiAgICAvLyBJbi1mbGlnaHQgb3Blbiwgc28gY29uY3VycmVudCBjYWxsZXJzIHNoYXJlIG9uZSB3YXRjaCgpIGluc3RlYWQgb2ZcbiAgICAvLyByYWNpbmcgYSBzZWNvbmQgY3Vyc29yLlxuICAgIHRoaXMuX3N0YXJ0UHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fcmVzdGFydFRpbWVyID0gbnVsbDtcbiAgICAvLyBTZXQgd2hlbiBhIHJlc3RhcnQgaXMgdHJpZ2dlcmVkIGJ5IGEgbm9uLXJlc3VtYWJsZSBlcnJvciBzbyB0aGUgcmVvcGVuZWRcbiAgICAvLyBzdHJlYW0gcmVjb25jaWxlcyBpdHMgZHJpdmVycyB3aXRoIHRoZSBjb2xsZWN0aW9uIChzZWUgX3Jlc3RhcnQpLlxuICAgIHRoaXMuX2hpc3RvcnlMb3N0ID0gZmFsc2U7XG4gIH1cblxuICBnZXQgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZHJpdmVycy5zaXplO1xuICB9XG5cbiAgLy8gU3Vic2NyaWJlIGEgZHJpdmVyLCBvcGVuaW5nIHRoZSBzdHJlYW0gb24gdGhlIGZpcnN0IG9uZS4gUmVzb2x2ZXMgb25jZSBvcGVuXG4gIC8vIHNvIHRoZSBkcml2ZXIgY2FuIHJlYWQgaXRzIHNuYXBzaG90IGtub3dpbmcgZXZlbnRzIGFyZSBub3cgcXVldWVkIGZvciBpdC5cbiAgYXN5bmMgYWRkRHJpdmVyKGRyaXZlcikge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NoYXJlZENoYW5nZVN0cmVhbSB1c2VkIGFmdGVyIHN0b3AnKTtcbiAgICB9XG4gICAgdGhpcy5fZHJpdmVycy5hZGQoZHJpdmVyKTtcbiAgICBhd2FpdCB0aGlzLl9lbnN1cmVPcGVuKCk7XG4gIH1cblxuICAvLyBPcGVuIGlmIG5lZWRlZCwgY29hbGVzY2luZyBjb25jdXJyZW50IGNhbGxlcnMgb250byBvbmUgaW4tZmxpZ2h0IG9wZW4uXG4gIC8vIF9zdGFydFByb21pc2UgaXMgc2V0IHN5bmNocm9ub3VzbHkgYmVmb3JlIGFueSBhd2FpdCwgc28gbm8gZG91YmxlIG9wZW4uXG4gIF9lbnN1cmVPcGVuKCkge1xuICAgIGlmICh0aGlzLl9jaGFuZ2VTdHJlYW0gfHwgdGhpcy5fc3RvcHBlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3N0YXJ0UHJvbWlzZSkge1xuICAgICAgdGhpcy5fc3RhcnRQcm9taXNlID0gdGhpcy5fb3BlbigpLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICB0aGlzLl9zdGFydFByb21pc2UgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGFydFByb21pc2U7XG4gIH1cblxuICAvLyBVbnN1YnNjcmliZSBhIGRyaXZlcjsgdGVhciBkb3duIG9uY2UgdGhlIGxhc3Qgb25lIGxlYXZlcy5cbiAgYXN5bmMgcmVtb3ZlRHJpdmVyKGRyaXZlcikge1xuICAgIHRoaXMuX2RyaXZlcnMuZGVsZXRlKGRyaXZlcik7XG4gICAgaWYgKHRoaXMuX2RyaXZlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgYXdhaXQgdGhpcy5fc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9vcGVuKCkge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5fbW9uZ29IYW5kbGUucmF3Q29sbGVjdGlvbih0aGlzLl9jb2xsZWN0aW9uTmFtZSk7XG5cbiAgICAvLyBQaW4gdGhlIHN0YXJ0IHRpbWUgYmVmb3JlIG9wZW5pbmc6IG90aGVyd2lzZSB0aGUgc3RyZWFtIGJlZ2lucyB3aGVuZXZlclxuICAgIC8vIG1vbmdvIHByb2Nlc3NlcyB0aGUgJGNoYW5nZVN0cmVhbSBjb21tYW5kLCBhbmQgd3JpdGVzIGxhbmRpbmcgaW4gdGhhdCBnYXBcbiAgICAvLyBhcmUgZHJvcHBlZC4gU2tpcHBlZCBvbiByZXN1bWUgKHRoZSB0b2tlbiBhbHJlYWR5IHBpbnMgdGhlIHN0YXJ0KS5cbiAgICBsZXQgc3RhcnRBdE9wZXJhdGlvblRpbWU7XG4gICAgaWYgKCF0aGlzLl9yZXN1bWVUb2tlbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGluZ1JlcyA9IGF3YWl0IHRoaXMuX21vbmdvSGFuZGxlLmRiLmNvbW1hbmQoeyBwaW5nOiAxIH0pO1xuICAgICAgICBzdGFydEF0T3BlcmF0aW9uVGltZSA9IHBpbmdSZXM/Lm9wZXJhdGlvblRpbWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEJlc3QtZWZmb3J0OyBmYWxscyBiYWNrIHRvIG1vbmdvJ3MgZGVmYXVsdCBvZiBcIm5vd1wiLlxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICAvLyBFbXB0eSBwaXBlbGluZSBzbyBtb25nbyBkZWxpdmVycyBFVkVSWSBldmVudDogYSBzZXJ2ZXItc2lkZSBmaWx0ZXIgd291bGRcbiAgICAvLyBza2lwIGV2ZW50cywgc28gX3NldExhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lIHdvdWxkbid0IGFkdmFuY2UgZm9yIHRoZWlyXG4gICAgLy8gY2x1c3RlclRpbWUgd2hpbGUgdGhlIGZlbmNlIHN0aWxsIHRhcmdldHMgaXQg4oCUIHdlZGdpbmcgX3dhaXRVbnRpbENhdWdodFVwLlxuICAgIC8vIFBlci1kb2N1bWVudCBmaWx0ZXJpbmcgaGFwcGVucyBpbiBlYWNoIGRyaXZlcidzIG1hdGNoZXIgaW5zdGVhZC5cbiAgICBjb25zdCBjaGFuZ2VTdHJlYW1PcHRpb25zID0ge1xuICAgICAgZnVsbERvY3VtZW50OiAndXBkYXRlTG9va3VwJyxcbiAgICAgIGZ1bGxEb2N1bWVudEJlZm9yZUNoYW5nZTogJ3doZW5BdmFpbGFibGUnLFxuICAgIH07XG4gICAgaWYgKHRoaXMuX3Jlc3VtZVRva2VuKSB7XG4gICAgICBjaGFuZ2VTdHJlYW1PcHRpb25zLnN0YXJ0QWZ0ZXIgPSB0aGlzLl9yZXN1bWVUb2tlbjtcbiAgICB9IGVsc2UgaWYgKHN0YXJ0QXRPcGVyYXRpb25UaW1lKSB7XG4gICAgICBjaGFuZ2VTdHJlYW1PcHRpb25zLnN0YXJ0QXRPcGVyYXRpb25UaW1lID0gc3RhcnRBdE9wZXJhdGlvblRpbWU7XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbmdlU3RyZWFtID0gY29sbGVjdGlvbi53YXRjaChbXSwgY2hhbmdlU3RyZWFtT3B0aW9ucyk7XG4gICAgdGhpcy5fY2hhbmdlU3RyZWFtID0gY2hhbmdlU3RyZWFtO1xuXG4gICAgY2hhbmdlU3RyZWFtLm9uKCdjaGFuZ2UnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMuX29uQ2hhbmdlKGNoYW5nZSk7XG4gICAgfSkpO1xuXG4gICAgY2hhbmdlU3RyZWFtLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKGVycm9yKSA9PiB7XG4gICAgICAvLyBPbmx5IHRoZSBhY3RpdmUgc3RyZWFtIHJlc3RhcnRzOyBpZ25vcmUgYSBzdXBlcnNlZGVkIG9uZS5cbiAgICAgIGlmICh0aGlzLl9zdG9wcGVkIHx8IHRoaXMuX2NoYW5nZVN0cmVhbSAhPT0gY2hhbmdlU3RyZWFtKSByZXR1cm47XG4gICAgICBjb25zb2xlLmVycm9yKCdDaGFuZ2VTdHJlYW0gZXJyb3I6Jywge1xuICAgICAgICBjb2xsZWN0aW9uTmFtZTogdGhpcy5fY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIGRyaXZlckNvdW50OiB0aGlzLl9kcml2ZXJzLnNpemUsXG4gICAgICAgIHJlc3VtZVRva2VuUHJlc2VudDogISF0aGlzLl9yZXN1bWVUb2tlbixcbiAgICAgICAgZXJyb3IsXG4gICAgICB9KTtcbiAgICAgIC8vIEEgbm9uLXJlc3VtYWJsZSBlcnJvciBtZWFucyB0aGUgcmVzdW1lIHRva2VuIGlzIG5vIGxvbmdlciBpbiB0aGUgb3Bsb2csXG4gICAgICAvLyBzbyB3YXRjaCgpIHJlb3BlbnMgYnV0IGV2ZXJ5IGdldE1vcmUgZmFpbHMgd2l0aCB0aGUgc2FtZSBlcnJvciBhZ2FpbiDigJRcbiAgICAgIC8vIGFuIGVuZGxlc3MgZXJyb3LihpJyZXN0YXJ0IGxvb3AgdGhhdCByZS1zZW5kcyB0aGUgZGVhZCB0b2tlbi4gRHJvcCB0aGVcbiAgICAgIC8vIHRva2VuIHNvIHRoZSByZXN0YXJ0IGZhbGxzIGJhY2sgdG8gc3RhcnRBdE9wZXJhdGlvblRpbWUgKG5vdyksIGFuZCBmbGFnXG4gICAgICAvLyB0aGUgc3RyZWFtIHNvIHRoZSByZW9wZW5lZCBjdXJzb3IgcmVjb25jaWxlcyBpdHMgZHJpdmVyczogZXZlbnRzIGluIHRoZVxuICAgICAgLy8gbG9zdCB3aW5kb3cgd2VyZSBuZXZlciBkZWxpdmVyZWQuXG4gICAgICBpZiAodGhpcy5faXNOb25SZXN1bWFibGVFcnJvcihlcnJvcikpIHtcbiAgICAgICAgdGhpcy5fcmVzdW1lVG9rZW4gPSBudWxsO1xuICAgICAgICB0aGlzLl9oaXN0b3J5TG9zdCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9zY2hlZHVsZVJlc3RhcnQoXG4gICAgICAgIE1ldGVvcj8uc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8uY2hhbmdlU3RyZWFtPy5kZWxheT8uZXJyb3IgfHwgMTAwXG4gICAgICApO1xuICAgIH0pKTtcblxuICAgIGNoYW5nZVN0cmVhbS5vbignY2xvc2UnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KCgpID0+IHtcbiAgICAgIC8vIF9jbG9zZVN0cmVhbSgpIHJlcGxhY2VzIHRoaXMuX2NoYW5nZVN0cmVhbSBiZWZvcmUgY2xvc2luZywgc28gYVxuICAgICAgLy8gZGVsaWJlcmF0ZSBjbG9zZSBmYWlscyB0aGlzIGNoZWNrIGFuZCB3b24ndCBsb29wIGludG8gYSByZXN0YXJ0LlxuICAgICAgaWYgKHRoaXMuX3N0b3BwZWQgfHwgdGhpcy5fY2hhbmdlU3RyZWFtICE9PSBjaGFuZ2VTdHJlYW0pIHJldHVybjtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NoYW5nZVN0cmVhbSBjbG9zZWQgdW5leHBlY3RlZGx5LCBzY2hlZHVsaW5nIHJlc3RhcnQ6Jywge1xuICAgICAgICBjb2xsZWN0aW9uTmFtZTogdGhpcy5fY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIGRyaXZlckNvdW50OiB0aGlzLl9kcml2ZXJzLnNpemUsXG4gICAgICAgIHJlc3VtZVRva2VuUHJlc2VudDogISF0aGlzLl9yZXN1bWVUb2tlbixcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2NoZWR1bGVSZXN0YXJ0KFxuICAgICAgICBNZXRlb3I/LnNldHRpbmdzPy5wYWNrYWdlcz8ubW9uZ28/LmNoYW5nZVN0cmVhbT8uZGVsYXk/LmNsb3NlIHx8IDEwMFxuICAgICAgKTtcbiAgICB9KSk7XG4gIH1cblxuICBfb25DaGFuZ2UoY2hhbmdlKSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIC8vIFJlbWVtYmVyIHRoZSByZXN1bWUgdG9rZW4gc28gYSByZXN0YXJ0IHBpY2tzIHVwIGhlcmUgKHNlZSBfb3BlbikuXG4gICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2UuX2lkKSB7XG4gICAgICB0aGlzLl9yZXN1bWVUb2tlbiA9IGNoYW5nZS5faWQ7XG4gICAgfVxuXG4gICAgLy8gTXVsdGljYXN0IHRvIGV2ZXJ5IGRyaXZlcjsgZWFjaCBydW5zIGl0cyBvd24gbWF0Y2hlci9wcm9qZWN0aW9uLCBhZHZhbmNlc1xuICAgIC8vIGl0cyBsYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZSwgYW5kIGZsdXNoZXMgcGVuZGluZyB3cml0ZXMuXG4gICAgZm9yIChjb25zdCBkcml2ZXIgb2YgdGhpcy5fZHJpdmVycykge1xuICAgICAgaWYgKGRyaXZlci5fc3RvcHBlZCkgY29udGludWU7XG4gICAgICB0cnkge1xuICAgICAgICBkcml2ZXIuX29uQ2hhbmdlKGNoYW5nZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQ2hhbmdlU3RyZWFtc10gRXJyb3IgZGlzcGF0Y2hpbmcgY2hhbmdlIHRvIGRyaXZlcjonLCB7XG4gICAgICAgICAgZHJpdmVySWQ6IGRyaXZlci5faWQsXG4gICAgICAgICAgY29sbGVjdGlvbk5hbWU6IHRoaXMuX2NvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBIGNoYW5nZSBzdHJlYW0gaXMgbm9uLXJlc3VtYWJsZSB3aGVuIHRoZSByZXN1bWUgcG9pbnQgaGFzIGFnZWQgb3V0IG9mIHRoZVxuICAvLyBvcGxvZyAoQ2hhbmdlU3RyZWFtSGlzdG9yeUxvc3QsIGNvZGUgMjg2KSBvciB0aGUgZHJpdmVyIG90aGVyd2lzZSB0YWdzIHRoZVxuICAvLyBlcnJvciBOb25SZXN1bWFibGVDaGFuZ2VTdHJlYW1FcnJvci4gUmVzdW1pbmcgZnJvbSB0aGUgc3RvcmVkIHRva2VuIGNhblxuICAvLyBuZXZlciBzdWNjZWVkIGFnYWluLCBzbyB0aGUgY2FsbGVyIG11c3QgcmVzdGFydCBmcm9tIGEgZnJlc2ggc3RhcnQgdGltZS5cbiAgX2lzTm9uUmVzdW1hYmxlRXJyb3IoZXJyb3IpIHtcbiAgICBpZiAoIWVycm9yKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09IDI4NiB8fCBlcnJvci5jb2RlTmFtZSA9PT0gJ0NoYW5nZVN0cmVhbUhpc3RvcnlMb3N0Jykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IGxhYmVsID0gJ05vblJlc3VtYWJsZUNoYW5nZVN0cmVhbUVycm9yJztcbiAgICBpZiAodHlwZW9mIGVycm9yLmhhc0Vycm9yTGFiZWwgPT09ICdmdW5jdGlvbicgJiYgZXJyb3IuaGFzRXJyb3JMYWJlbChsYWJlbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZXJyb3IuZXJyb3JMYWJlbFNldCAmJiB0eXBlb2YgZXJyb3IuZXJyb3JMYWJlbFNldC5oYXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBlcnJvci5lcnJvckxhYmVsU2V0LmhhcyhsYWJlbCk7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGVycm9yLmVycm9yTGFiZWxzKSkge1xuICAgICAgcmV0dXJuIGVycm9yLmVycm9yTGFiZWxzLmluY2x1ZGVzKGxhYmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX3NjaGVkdWxlUmVzdGFydChkZWxheU1zKSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQgfHwgdGhpcy5fcmVzdGFydFRpbWVyKSByZXR1cm47XG4gICAgdGhpcy5fcmVzdGFydFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZXN0YXJ0VGltZXIgPSBudWxsO1xuICAgICAgaWYgKCF0aGlzLl9zdG9wcGVkKSB7XG4gICAgICAgIHRoaXMuX3Jlc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9LCBkZWxheU1zKTtcbiAgfVxuXG4gIGFzeW5jIF9yZXN0YXJ0KCkge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgY29uc29sZS5lcnJvcignQ2hhbmdlU3RyZWFtIHJlc3RhcnQgYmVnaW46Jywge1xuICAgICAgY29sbGVjdGlvbk5hbWU6IHRoaXMuX2NvbGxlY3Rpb25OYW1lLFxuICAgICAgZHJpdmVyQ291bnQ6IHRoaXMuX2RyaXZlcnMuc2l6ZSxcbiAgICAgIHJlc3VtZVRva2VuUHJlc2VudDogISF0aGlzLl9yZXN1bWVUb2tlbixcbiAgICB9KTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fY2xvc2VTdHJlYW0oKTtcbiAgICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgICAvLyBSZW9wZW4gdmlhIHRoZSBzaGFyZWQgZ3VhcmQgc28gYSBtaWQtcmVzdGFydCBzdWJzY3JpYmVyIGF3YWl0cyBpdCB0b28uXG4gICAgICBhd2FpdCB0aGlzLl9lbnN1cmVPcGVuKCk7XG4gICAgICAvLyBUaGUgcmVvcGVuZWQgY3Vyc29yIHN0YXJ0cyBhdCBcIm5vd1wiLCBzbyBicmluZyBlYWNoIGRyaXZlcidzIHJlc3VsdCBzZXRcbiAgICAgIC8vIGJhY2sgaW4gc3luYyB3aXRoIHRoZSBjb2xsZWN0aW9uIGZvciB0aGUgZXZlbnRzIGl0IG5ldmVyIHJlY2VpdmVkLiBPbmx5XG4gICAgICAvLyBjbGVhciB0aGUgZmxhZyBvbmNlIHRoZSByZW9wZW4gc3VjY2VlZHMsIHNvIGEgZmFpbGVkIHJlb3BlbiB0aGF0XG4gICAgICAvLyByZXNjaGVkdWxlcyBzdGlsbCByZWNvbmNpbGVzIG9uIHRoZSByZXRyeS5cbiAgICAgIGlmICh0aGlzLl9oaXN0b3J5TG9zdCAmJiAhdGhpcy5fc3RvcHBlZCkge1xuICAgICAgICB0aGlzLl9oaXN0b3J5TG9zdCA9IGZhbHNlO1xuICAgICAgICBhd2FpdCB0aGlzLl9yZXN5bmNEcml2ZXJzKCk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmVycm9yKCdDaGFuZ2VTdHJlYW0gcmVzdGFydCBkb25lOicsIHtcbiAgICAgICAgY29sbGVjdGlvbk5hbWU6IHRoaXMuX2NvbGxlY3Rpb25OYW1lLFxuICAgICAgICBkcml2ZXJDb3VudDogdGhpcy5fZHJpdmVycy5zaXplLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZXN0YXJ0IENoYW5nZVN0cmVhbTonLCB7XG4gICAgICAgIGNvbGxlY3Rpb25OYW1lOiB0aGlzLl9jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgZXJyb3IsXG4gICAgICB9KTtcbiAgICAgIC8vIFJldHJ5IHNvIG9uZSBmYWlsZWQgcmVvcGVuIGRvZXNuJ3Qgd2VkZ2UgdGhlIHN0cmVhbSBmb3IgYWxsIGRyaXZlcnMuXG4gICAgICB0aGlzLl9zY2hlZHVsZVJlc3RhcnQoXG4gICAgICAgIE1ldGVvcj8uc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8uY2hhbmdlU3RyZWFtPy5kZWxheT8uZXJyb3IgfHwgMTAwXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlY29uY2lsZSBldmVyeSBhdHRhY2hlZCBkcml2ZXIgd2l0aCB0aGUgY29sbGVjdGlvbiBhZnRlciBhIG5vbi1yZXN1bWFibGVcbiAgLy8gZ2FwLiBCZXN0LWVmZm9ydCBhbmQgaXNvbGF0ZWQgcGVyIGRyaXZlcjogYSBmYWlsZWQgcmVjb25jaWxlIGlzIGxvZ2dlZCwgbm90XG4gIC8vIHJldGhyb3duLCBzbyBpdCBjYW4gbmV2ZXIgd2VkZ2Ugb3IgcmUtbG9vcCB0aGUgc3RyZWFtIHRoYXQganVzdCByZWNvdmVyZWQuXG4gIGFzeW5jIF9yZXN5bmNEcml2ZXJzKCkge1xuICAgIGZvciAoY29uc3QgZHJpdmVyIG9mIFsuLi50aGlzLl9kcml2ZXJzXSkge1xuICAgICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcbiAgICAgIGlmIChkcml2ZXIuX3N0b3BwZWQpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZHJpdmVyLl9yZXN5bmNBZnRlckhpc3RvcnlMb3N0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdDaGFuZ2VTdHJlYW0gcmVzeW5jIGFmdGVyIGhpc3RvcnkgbG9zcyBmYWlsZWQ6Jywge1xuICAgICAgICAgIGNvbGxlY3Rpb25OYW1lOiB0aGlzLl9jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICBkcml2ZXJJZDogZHJpdmVyLl9pZCxcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX2Nsb3NlU3RyZWFtKCkge1xuICAgIGNvbnN0IHN0cmVhbSA9IHRoaXMuX2NoYW5nZVN0cmVhbTtcbiAgICB0aGlzLl9jaGFuZ2VTdHJlYW0gPSBudWxsO1xuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0cmVhbS5jbG9zZSgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gSWdub3JlIGVycm9ycyB3aGVuIGNsb3NpbmcuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3N0b3AoKSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcbiAgICB0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fcmVzdGFydFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVzdGFydFRpbWVyKTtcbiAgICAgIHRoaXMuX3Jlc3RhcnRUaW1lciA9IG51bGw7XG4gICAgfVxuICAgIC8vIERlcmVnaXN0ZXIgYmVmb3JlIGF3YWl0aW5nIGNsb3NlLCBlbHNlIGFuIG9ic2VydmUgYXJyaXZpbmcgZHVyaW5nIHRoZVxuICAgIC8vIGF3YWl0IHdvdWxkIGFjcXVpcmUgdGhpcyBzdG9wcGVkIHN0cmVhbSAoYWRkRHJpdmVyIHRocm93cykgbm90IGEgZnJlc2ggb25lLlxuICAgIGlmICh0eXBlb2YgdGhpcy5fb25FbXB0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fb25FbXB0eSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJZ25vcmUgcmVnaXN0cnktY2xlYW51cCBlcnJvcnMuXG4gICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuX2Nsb3NlU3RyZWFtKCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgTG9jYWxDb2xsZWN0aW9uIH0gZnJvbSAnbWV0ZW9yL21pbmltb25nbyc7XG5pbXBvcnQgeyBSYW5kb20gfSBmcm9tICdtZXRlb3IvcmFuZG9tJztcbmltcG9ydCB7IE1vbmdvSUQgfSBmcm9tICdtZXRlb3IvbW9uZ28taWQnO1xuaW1wb3J0IHsgRERQU2VydmVyIH0gZnJvbSAnbWV0ZW9yL2RkcC1zZXJ2ZXInO1xuaW1wb3J0IHsgRGlmZlNlcXVlbmNlIH0gZnJvbSAnbWV0ZW9yL2RpZmYtc2VxdWVuY2UnO1xuaW1wb3J0IHsgbGlzdGVuQWxsIH0gZnJvbSAnLi9tb25nb19kcml2ZXInO1xuaW1wb3J0IHsgcmVwbGFjZVR5cGVzLCByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28gfSBmcm9tICcuL21vbmdvX2NvbW1vbic7XG5pbXBvcnQgeyBjb21wYXJlT3BlcmF0aW9uVGltZXMgfSBmcm9tICcuL21vbmdvX2NvbW1vbic7XG5cbmNvbnN0IFNVUFBPUlRFRF9PUEVSQVRJT05TID0gWydpbnNlcnQnLCAndXBkYXRlJywgJ3JlcGxhY2UnLCAnZGVsZXRlJ107XG5cbi8qKlxuICogQ2hhbmdlU3RyZWFtT2JzZXJ2ZURyaXZlciAtIE1vbmdvREIgQ2hhbmdlIFN0cmVhbXMgYmFzZWQgb2JzZXJ2ZSBkcml2ZXJcbiAqXG4gKiBVc2VzIE1vbmdvREIgQ2hhbmdlIFN0cmVhbXMgdG8gd2F0Y2ggZm9yIHJlYWwtdGltZSBjaGFuZ2VzIHRvIGEgY29sbGVjdGlvbi5cbiAqIEltcGxlbWVudHMgYSBzdG9wIGNhbGxiYWNrIHN5c3RlbSBzaW1pbGFyIHRvIFBvbGxpbmdPYnNlcnZlRHJpdmVyIGZvciBwcm9wZXJcbiAqIHJlc291cmNlIGNsZWFudXAgd2hlbiB0aGUgZHJpdmVyIGlzIHN0b3BwZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuX3VzZXNDaGFuZ2VTdHJlYW1zID0gdHJ1ZTtcbiAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbiA9IG9wdGlvbnMuY3Vyc29yRGVzY3JpcHRpb247XG4gICAgdGhpcy5fbW9uZ29IYW5kbGUgPSBvcHRpb25zLm1vbmdvSGFuZGxlO1xuICAgIHRoaXMuX211bHRpcGxleGVyID0gb3B0aW9ucy5tdWx0aXBsZXhlcjtcbiAgICB0aGlzLl9zaGFyZWRTdHJlYW0gPSBudWxsO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdG9wQ2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5fcGVuZGluZ1dyaXRlcyA9IFtdO1xuICAgIHRoaXMuX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5ID0gW107XG4gICAgdGhpcy5faXNSZWFkeSA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lID0gbnVsbDtcbiAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzID0gW107XG4gICAgdGhpcy5fcmVzb2x2ZVRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX21hdGNoZXIgPSBvcHRpb25zLm1hdGNoZXI7XG4gICAgdGhpcy5faWQgPSBvcHRpb25zLmlkIHx8IFJhbmRvbS5pZCgpO1xuXG4gICAgLy8gUHJvamVjdGlvbiBmdW5jdGlvbiBzaW1pbGFyIHRvIG9wbG9nIGRyaXZlci5cbiAgICAvL1xuICAgIC8vIGBkb2NgIGlzIGV4cGVjdGVkIHRvIGFscmVhZHkgYmUgTWV0ZW9yLXR5cGVkOiBuYXRpdmUgQlNPTiBpcyB0cmFuc2xhdGVkXG4gICAgLy8gdG8gTWV0ZW9yIHR5cGVzIG9uY2UgYXQgZWFjaCBwYXRoIGJvdW5kYXJ5IChfc2VuZEluaXRpYWxBZGRzIGZvciB0aGVcbiAgICAvLyBzbmFwc2hvdCwgX2hhbmRsZUNoYW5nZSBmb3IgbGl2ZSBjaGFuZ2UgZXZlbnRzKSBiZWZvcmUgYW55IGRvYyByZWFjaGVzXG4gICAgLy8gdGhlIHByb2plY3Rpb24sIHRoZSBtYXRjaGVyIG9yIHRoZSBtdWx0aXBsZXhlci4gVHJhbnNsYXRpbmcgaGVyZSBhcyB3ZWxsXG4gICAgLy8gd291bGQganVzdCByZS13YWxrIGFuIGFscmVhZHktY29udmVydGVkIGRvY3VtZW50LlxuICAgIGNvbnN0IHByb2plY3Rpb24gPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnByb2plY3Rpb24gfHwgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5maWVsZHM7XG4gICAgaWYgKHByb2plY3Rpb24pIHtcbiAgICAgIGNvbnN0IGJhc2VQcm9qZWN0aW9uRm4gPSBMb2NhbENvbGxlY3Rpb24uX2NvbXBpbGVQcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuICAgICAgdGhpcy5fcHJvamVjdGlvbkZuID0gKGRvYykgPT4ge1xuICAgICAgICBjb25zdCBwcm9qZWN0ZWQgPSBiYXNlUHJvamVjdGlvbkZuKGRvYyk7XG4gICAgICAgIGlmIChwcm9qZWN0ZWQgJiYgdHlwZW9mIHByb2plY3RlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBjb25zdCB7IF9pZCwgLi4uZmllbGRzIH0gPSBwcm9qZWN0ZWQ7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvamVjdGVkO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcHJvamVjdGlvbkZuID0gKGRvYykgPT4ge1xuICAgICAgICBjb25zdCB7IF9pZCwgLi4uZmllbGRzIH0gPSBkb2M7XG4gICAgICAgIHJldHVybiBmaWVsZHM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuX3N0YXJ0TGlzdGVuaW5nKCk7XG4gICAgdGhpcy5fc3RhcnRXYXRjaGluZygpO1xuICB9XG5cbiAgX3NlbmRNdWx0aXBsZXhlckFkZGVkKGlkLCBwcm9qZWN0ZWREb2MpIHtcbiAgICAvLyBwcm9qZWN0ZWREb2MgaXMgYWxyZWFkeSBNZXRlb3ItdHlwZWQg4oCUIGl0cyBjYWxsZXIgdHJhbnNsYXRlZCB0aGUgc291cmNlXG4gICAgLy8gZG9jdW1lbnQgYXQgdGhlIHBhdGggYm91bmRhcnkgKHNlZSB0aGUgX3Byb2plY3Rpb25GbiBjb21tZW50IGFib3ZlKS5cbiAgICB0cnkge1xuICAgICAgdGhpcy5fbXVsdGlwbGV4ZXIuYWRkZWQoaWQsIHByb2plY3RlZERvYyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDaGFuZ2VTdHJlYW1zXSBFcnJvciBzZW5kaW5nIGFkZGVkIGRvY3VtZW50OicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfc3RhcnRMaXN0ZW5pbmcoKSB7XG5cbiAgICAvLyBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIG5vdGlmaWVkIHdoZW4gd3JpdGVzIGhhcHBlblxuICAgIC8vIFRoaXMgZm9sbG93cyB0aGUgc2FtZSBwYXR0ZXJuIGFzIE9wbG9nT2JzZXJ2ZURyaXZlclxuICAgIGNvbnN0IHN0b3BIYW5kbGUgPSBhd2FpdCBsaXN0ZW5BbGwoXG4gICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbixcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGluIGEgcHJlLWZpcmUgd3JpdGUgZmVuY2UsIHdlIGRvbid0IGhhdmUgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGNvbnN0IGZlbmNlID0gRERQU2VydmVyLl9nZXRDdXJyZW50RmVuY2UoKTtcbiAgICAgICAgaWYgKCFmZW5jZSB8fCBmZW5jZS5maXJlZClcbiAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKGZlbmNlLl9jaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVycykge1xuICAgICAgICAgIGZlbmNlLl9jaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVyc1t0aGlzLl9pZF0gPSB0aGlzO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZlbmNlLl9jaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVycyA9IHt9O1xuICAgICAgICBmZW5jZS5fY2hhbmdlU3RyZWFtT2JzZXJ2ZURyaXZlcnNbdGhpcy5faWRdID0gdGhpcztcblxuICAgICAgICBmZW5jZS5vbkJlZm9yZUZpcmUoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRyaXZlcnMgPSBmZW5jZS5fY2hhbmdlU3RyZWFtT2JzZXJ2ZURyaXZlcnM7XG4gICAgICAgICAgZGVsZXRlIGZlbmNlLl9jaGFuZ2VTdHJlYW1PYnNlcnZlRHJpdmVycztcblxuICAgICAgICAgIC8vIFByb2Nlc3MgZWFjaCBkcml2ZXIgdGhhdCBuZWVkcyB0byBiZSBzeW5jaHJvbml6ZWQgd2l0aCB0aGUgZmVuY2VcbiAgICAgICAgICBmb3IgKGNvbnN0IGRyaXZlciBvZiBPYmplY3QudmFsdWVzKGRyaXZlcnMpKSB7XG4gICAgICAgICAgICBpZiAoZHJpdmVyLl9zdG9wcGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3Qgd3JpdGUgPSBhd2FpdCBmZW5jZS5iZWdpbldyaXRlKCk7XG5cbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBjaGFuZ2Ugc3RyZWFtIHRvIGNhdGNoIHVwIHdpdGggYW55IHBlbmRpbmcgb3BlcmF0aW9ucy5cbiAgICAgICAgICAgIC8vIFBhc3MgdGhlIGZlbmNlIGV4cGxpY2l0bHk6IGZlbmNlLmZpcmUoKSBydW5zIG91dHNpZGUgdGhlXG4gICAgICAgICAgICAvLyBBc3luY0xvY2FsU3RvcmFnZSBjb250ZXh0LCBzbyBERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpIHdvdWxkXG4gICAgICAgICAgICAvLyByZXR1cm4gdW5kZWZpbmVkIGhlcmUgYW5kIG1pc3MgdGhlIGZlbmNlLl9jc1RhcmdldFRzIGFubm90YXRpb24uXG4gICAgICAgICAgICBhd2FpdCBkcml2ZXIuX3dhaXRVbnRpbENhdWdodFVwKGZlbmNlKTtcblxuICAgICAgICAgICAgLy8gVGhlIGRyaXZlciBtYXkgaGF2ZSBiZWVuIHN0b3BwZWQgd2hpbGUgd2Ugd2VyZSBwYXJrZWQgaW5cbiAgICAgICAgICAgIC8vIF93YWl0VW50aWxDYXVnaHRVcCAoc3RvcCgpIGRyYWlucyB0aGUgd2FpdGVyIHNvIHdlIGRvbid0IGhhbmcg4oCUXG4gICAgICAgICAgICAvLyBtZXRlb3IvbWV0ZW9yIzE0NDUyKS4gT25jZSBzdG9wcGVkLCBuZWl0aGVyIGJyYW5jaCBiZWxvdyBjYW4gYmVcbiAgICAgICAgICAgIC8vIHRydXN0ZWQgdG8gcmVsZWFzZSB0aGlzIHdyaXRlOiB0aGUgbXVsdGlwbGV4ZXIgaXMgYmVpbmcgdG9yblxuICAgICAgICAgICAgLy8gZG93biwgYW5kIGEgcHVzaCB0byBfd3JpdGVzVG9Db21taXRXaGVuUmVhZHkgY2FuIHJhY2Ugc3RvcCgpJ3NcbiAgICAgICAgICAgIC8vIG93biBkcmFpbiBvZiB0aGF0IGFycmF5IGFuZCBiZSBsb3N0LiBDb21taXQgZGlyZWN0bHkgc28gdGhlXG4gICAgICAgICAgICAvLyBmZW5jZSBzdGlsbCBmaXJlcy5cbiAgICAgICAgICAgIGlmIChkcml2ZXIuX3N0b3BwZWQpIHtcbiAgICAgICAgICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGFueSBwZW5kaW5nIHdyaXRlcyBpbW1lZGlhdGVseVxuICAgICAgICAgICAgZHJpdmVyLl9mbHVzaFBlbmRpbmdXcml0ZXMoKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIGRyaXZlciBpcyByZWFkeSAoaW5pdGlhbCBhZGRzIGNvbXBsZXRlKSwgZW5zdXJlIGFsbCB3cml0ZXMgYXJlIGNvbW1pdHRlZFxuICAgICAgICAgICAgaWYgKGRyaXZlci5faXNSZWFkeSkge1xuICAgICAgICAgICAgICBhd2FpdCBkcml2ZXIuX211bHRpcGxleGVyLm9uRmx1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIElmIG5vdCByZWFkeSB5ZXQsIHF1ZXVlIHRoZSB3cml0ZSBmb3IgbGF0ZXJcbiAgICAgICAgICAgICAgZHJpdmVyLl93cml0ZXNUb0NvbW1pdFdoZW5SZWFkeS5wdXNoKHdyaXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVsZWFzZSB0aGUgcGVyLWNvbGxlY3Rpb24gd3JpdGUtdGltZXN0YW1wIG1hcCBub3cgdGhhdCBldmVyeVxuICAgICAgICAgIC8vIGRyaXZlciBvbiB0aGlzIGZlbmNlIGhhcyBjYXVnaHQgdXAuIFRoZSBmZW5jZSBvYmplY3QgaXMgYWJvdXRcbiAgICAgICAgICAvLyB0byBiZSBkaXNjYXJkZWQsIGJ1dCBjbGVhcmluZyBleHBsaWNpdGx5IHByZXZlbnRzIGFueSBzdHJheVxuICAgICAgICAgIC8vIHJlYWQgb2YgYSBub3ctc3RhbGUgdGFyZ2V0LlxuICAgICAgICAgIGRlbGV0ZSBmZW5jZS5fY3NUYXJnZXRUc0J5Q29sbGVjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFJlZ2lzdGVyIHRoZSBzdG9wIGhhbmRsZVxuICAgIHRoaXMuX2FkZFN0b3BDYWxsYmFjaygoKSA9PiBzdG9wSGFuZGxlLnN0b3AoKSk7XG4gIH1cblxuXG5cbiAgX2FkZFN0b3BDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3RvcCBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydFdhdGNoaW5nKCkge1xuXG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG5cbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLl9tb25nb0hhbmRsZS5yYXdDb2xsZWN0aW9uKHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lKTtcblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBzaGFyZWQgcGVyLWNvbGxlY3Rpb24gc3RyZWFtLiBhZGREcml2ZXIoKSByZXNvbHZlcyBvbmNlXG4gICAgICAvLyBpdCdzIG9wZW47IGZyb20gdGhlbiBldmVudHMgZGlzcGF0Y2ggaGVyZSB2aWEgX29uQ2hhbmdlIGFuZCBxdWV1ZSBpblxuICAgICAgLy8gX3BlbmRpbmdXcml0ZXMgdW50aWwgcmVhZHksIHNvIHdyaXRlcyBkdXJpbmcgdGhlIHNuYXBzaG90IGJlbG93IGFyZVxuICAgICAgLy8gY2FwdHVyZWQgYW5kIHJlcGxheWVkIChfaGFuZGxlSW5zZXJ0IGRlZHVwZXMgb3ZlcmxhcHMgd2l0aCB0aGUgc25hcHNob3QpLlxuICAgICAgdGhpcy5fc2hhcmVkU3RyZWFtID0gdGhpcy5fbW9uZ29IYW5kbGUuX2FjcXVpcmVTaGFyZWRDaGFuZ2VTdHJlYW0oXG4gICAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lXG4gICAgICApO1xuICAgICAgYXdhaXQgdGhpcy5fc2hhcmVkU3RyZWFtLmFkZERyaXZlcih0aGlzKTtcblxuICAgICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgICAgLy8gTm93IHJlYWQgdGhlIHNuYXBzaG90LiBFdmVudHMgdGhhdCBhcnJpdmVkIHdoaWxlIHdlIHdlcmUgZ2V0dGluZ1xuICAgICAgLy8gaGVyZSBhcmUgc2l0dGluZyBpbiBfcGVuZGluZ1dyaXRlcyBhbmQgd2lsbCBiZSBmbHVzaGVkIGJlbG93LlxuICAgICAgYXdhaXQgdGhpcy5fc2VuZEluaXRpYWxBZGRzKGNvbGxlY3Rpb24pO1xuXG4gICAgICAvLyBNYXJrIHJlYWR5IHNvIF9mbHVzaFBlbmRpbmdXcml0ZXMgbGV0cyB0aGUgcXVldWVkIGNoYW5nZSBldmVudHNcbiAgICAgIC8vIHRocm91Z2ggKGl0IHNob3J0LWNpcmN1aXRzIHdoZW4gIV9pc1JlYWR5IHRvIGF2b2lkIGNhbGxpbmdcbiAgICAgIC8vIG11bHRpcGxleGVyLmNoYW5nZWQvcmVtb3ZlZCBiZWZvcmUgcmVhZHkoKSkuXG4gICAgICB0aGlzLl9tdWx0aXBsZXhlci5yZWFkeSgpO1xuICAgICAgdGhpcy5faXNSZWFkeSA9IHRydWU7XG5cbiAgICAgIC8vIFJlcGxheSBjaGFuZ2UgZXZlbnRzIHRoYXQgYXJyaXZlZCBkdXJpbmcgX3NlbmRJbml0aWFsQWRkcyBCRUZPUkVcbiAgICAgIC8vIGNvbW1pdHRpbmcgZmVuY2Ugd3JpdGVzLiBfaGFuZGxlSW5zZXJ0IGRlZHVwcyBhZ2FpbnN0IHRoZSBtdWx0aXBsZXhlclxuICAgICAgLy8gY2FjaGUgc28gZXZlbnRzIHRoYXQgb3ZlcmxhcCB3aXRoIHRoZSBzbmFwc2hvdCBkb24ndCBkb3VibGUtZW1pdC5cbiAgICAgIC8vIENvbW1pdCBvcmRlciBtYXR0ZXJzOiBPYnNlcnZlTXVsdGlwbGV4ZXIub25GbHVzaCBiZWxvdyB3YWl0cyBmb3IgdGhlXG4gICAgICAvLyBxdWV1ZSB0byBkcmFpbiwgc28gY2xpZW50IGBhZGRlZGAvYGNoYW5nZWRgIHJlYWNoIGhhbmRsZXMgYmVmb3JlIHRoZVxuICAgICAgLy8gZmVuY2UncyBgdXBkYXRlZGAgbWVzc2FnZSDigJQgd2l0aG91dCB0aGlzLCBjbGllbnRzIHNlZSBgdXBkYXRlZGBcbiAgICAgIC8vIHdpdGhvdXQgdGhlIGNvcnJlc3BvbmRpbmcgZGF0YSBhbmQgc3R1Yi1yZXZlcnRzIHdpcGUgdGhlIGxvY2FsIHZpZXcuXG4gICAgICB0aGlzLl9mbHVzaFBlbmRpbmdXcml0ZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX2ZsdXNoV3JpdGVzVG9Db21taXQoKTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgQ2hhbmdlU3RyZWFtOicsIGVycm9yKTtcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgbXVsdGlwbGV4ZXIgaXMgcmVhZHknZCBldmVuIG9uIGZhaWx1cmUg4oCUIHdpdGhvdXQgdGhpc1xuICAgICAgLy8gdGhlIHB1YmxpY2F0aW9uJ3MgX3JlYWR5UHJvbWlzZSBuZXZlciByZXNvbHZlcywgdGhlIHN1YnNjcmlwdGlvblxuICAgICAgLy8gbmV2ZXIgc2VuZHMgYHJlYWR5YCB0byB0aGUgY2xpZW50LCBhbmQgYW55IHRlc3QgdGhhdCBwb2xsc1xuICAgICAgLy8gc3ViLnJlYWR5KCkgKGUuZy4gYGxpdmVkYXRhIC0gbWV0aG9kcyB3aXRoIG5lc3RlZCBzdHVic2ApIGhhbmdzXG4gICAgICAvLyBpdHMgc2V0dXAgYmxvY2sgdG8gdGhlIHRlc3RBc3luY011bHRpIHRpbWVvdXQuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMuX211bHRpcGxleGVyLl9yZWFkeSgpKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIucmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoXykgeyAvKiByZWFkeSgpIHRocm93cyBpZiBhbHJlYWR5IHJlYWR5OyBpZ25vcmUgKi8gfVxuICAgICAgLy8gRHJhaW4gYW55IHdyaXRlcyB0aGF0IHdlcmUgcXVldWVkIGJ5IG9uQmVmb3JlRmlyZSB3aGlsZVxuICAgICAgLy8gX3N0YXJ0V2F0Y2hpbmcgd2FzIGluIGZsaWdodC4gV2l0aG91dCB0aGlzLCB0aGUgZmVuY2VzIGhvbGRpbmcgdGhvc2VcbiAgICAgIC8vIHdyaXRlcyBuZXZlciBmaXJlIGFuZCBhbnkgRERQIG1ldGhvZCB0aGF0IHRyaWdnZXJlZCB0aGVtIGhhbmdzLlxuICAgICAgdGhpcy5faXNSZWFkeSA9IHRydWU7XG4gICAgICB0cnkgeyBhd2FpdCB0aGlzLl9mbHVzaFdyaXRlc1RvQ29tbWl0KCk7IH0gY2F0Y2ggKF8pIHsgLyogaWdub3JlICovIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zZW5kSW5pdGlhbEFkZHMoY29sbGVjdGlvbikge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgLy8gQnVpbGQgdGhlIHNhbWUgc2VsZWN0b3IgYW5kIG9wdGlvbnMgdGhhdCB0aGUgY3Vyc29yIHdvdWxkIHVzZVxuICAgICAgY29uc3Qgc2VsZWN0b3IgPSByZXBsYWNlVHlwZXMoXG4gICAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yIHx8IHt9LFxuICAgICAgICByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nb1xuICAgICAgKTtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLnRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMgfTtcblxuICAgICAgLy8gRmluZCBhbGwgZXhpc3RpbmcgZG9jdW1lbnRzXG4gICAgICBjb25zdCBjdXJzb3IgPSBjb2xsZWN0aW9uLmZpbmQoc2VsZWN0b3IsIG9wdGlvbnMpO1xuXG4gICAgICAvLyBGb2xsb3cgb3Bsb2cgZHJpdmVyIHBhdHRlcm46IGdldCBjdXJyZW50IGZlbmNlIGFuZCBzdG9yZSB3cml0ZSBmb3IgbGF0ZXIgY29tbWl0XG4gICAgICBjb25zdCBmZW5jZSA9IEREUFNlcnZlci5fZ2V0Q3VycmVudEZlbmNlKCk7XG4gICAgICBpZiAoZmVuY2UpIHtcbiAgICAgICAgdGhpcy5fd3JpdGVzVG9Db21taXRXaGVuUmVhZHkucHVzaChmZW5jZS5iZWdpbldyaXRlKCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBTZW5kICdhZGRlZCcgZm9yIGVhY2ggZXhpc3RpbmcgZG9jdW1lbnQgdGhhdCBtYXRjaGVzIG91ciBtYXRjaGVyXG4gICAgICBsZXQgZG9jQ291bnQgPSAwO1xuICAgICAgZm9yIGF3YWl0IChjb25zdCByYXdEb2Mgb2YgY3Vyc29yKSB7XG4gICAgICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgICAgIC8vIFRoZSBuYXRpdmUgZHJpdmVyIHlpZWxkcyBCU09OLXR5cGVkIGRvY3MuIFRyYW5zbGF0ZSBvbmNlIGhlcmUgc28gdGhlXG4gICAgICAgIC8vIHByb2plY3Rpb24gYW5kIHRoZSBtdWx0aXBsZXhlciBvbmx5IGV2ZXIgc2VlIE1ldGVvciB0eXBlcyDigJQgdGhlIHNhbWVcbiAgICAgICAgLy8gYm91bmRhcnkgX2hhbmRsZUNoYW5nZSBlc3RhYmxpc2hlcyBmb3IgbGl2ZSBjaGFuZ2UgZXZlbnRzLlxuICAgICAgICBjb25zdCBkb2MgPSByZXBsYWNlVHlwZXMocmF3RG9jLCByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvcik7XG4gICAgICAgIGNvbnN0IGlkID0gdHlwZW9mIGRvYy5faWQgIT09ICdzdHJpbmcnID8gbmV3IE1vbmdvSUQuT2JqZWN0SUQoZG9jLl9pZC50b0hleFN0cmluZygpKSA6IGRvYy5faWQ7XG4gICAgICAgIGNvbnN0IHByb2plY3RlZERvYyA9IHRoaXMuX3Byb2plY3Rpb25GbiA/IHRoaXMuX3Byb2plY3Rpb25Gbihkb2MpIDogZG9jO1xuICAgICAgICB0aGlzLl9zZW5kTXVsdGlwbGV4ZXJBZGRlZChpZCwgcHJvamVjdGVkRG9jKTtcbiAgICAgICAgZG9jQ291bnQrKztcbiAgICAgIH1cblxuICAgICAgLy8gRE9OJ1QgY2FsbCByZWFkeSgpIG9yIGZsdXNoIGhlcmUgLSBsZXQgX3N0YXJ0V2F0Y2hpbmcgaGFuZGxlIGl0XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VuZGluZyBpbml0aWFsIGFkZHMgZm9yIENoYW5nZVN0cmVhbTonLCBlcnJvcik7XG4gICAgICAvLyBXZSBtYXkgaGF2ZSBhbHJlYWR5IHB1c2hlZCBhIGZlbmNlIHdyaXRlIGFib3ZlOyBjb21taXQgaXQgc28gdGhlXG4gICAgICAvLyBmZW5jZSBpc24ndCBkZWFkbG9ja2VkLiBfc3RhcnRXYXRjaGluZydzIGNhdGNoIHdpbGwgcnVuIHRvbywgYnV0XG4gICAgICAvLyBfZmx1c2hXcml0ZXNUb0NvbW1pdCBkcmFpbnMgdGhlIGFycmF5LCBzbyB0aGUgc2Vjb25kIGNhbGwgaXMgYSBuby1vcC5cbiAgICAgIC8vIE11bHRpcGxleGVyLnJlYWR5KCkgaXMgaGFuZGxlZCBpbiBfc3RhcnRXYXRjaGluZydzIGNhdGNoLlxuICAgICAgdGhpcy5faXNSZWFkeSA9IHRydWU7XG4gICAgICB0cnkgeyBhd2FpdCB0aGlzLl9mbHVzaFdyaXRlc1RvQ29tbWl0KCk7IH0gY2F0Y2ggKF8pIHsgLyogaWdub3JlICovIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxlZCBieSB0aGUgc2hhcmVkIHN0cmVhbSBmb3IgZXZlcnkgcmF3IGNoYW5nZS4gVGhlIHNoYXJlZCBzdHJlYW0gb3ducyB0aGVcbiAgLy8gcmVzdW1lIHRva2VuLCBzbyB0aGlzIGp1c3QgYWR2YW5jZXMgb3VyIHByb2Nlc3NlZCB0aW1lLCBydW5zIHRoZSBtYXRjaGVyLFxuICAvLyBhbmQgZmx1c2hlcyBwZW5kaW5nIHdyaXRlcy5cbiAgX29uQ2hhbmdlKGNoYW5nZSkge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICAvLyBVcGRhdGUgbGFzdCBwcm9jZXNzZWQgb3AgdGltZSBlYXJseSBzbyBmZW5jZXMgY2FuIHVuYmxvY2sgcHJvbXB0bHkuXG4gICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2UuY2x1c3RlclRpbWUpIHtcbiAgICAgIHRoaXMuX3NldExhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lKGNoYW5nZS5jbHVzdGVyVGltZSk7XG4gICAgfVxuICAgIHRoaXMuX2hhbmRsZUNoYW5nZShjaGFuZ2UpO1xuXG4gICAgY29uc3QgZmVuY2UgPSBERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpO1xuICAgIGlmIChmZW5jZSAmJiAhZmVuY2UuZmlyZWQpIHtcbiAgICAgIHRoaXMuX2ZsdXNoUGVuZGluZ1dyaXRlcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBNZXRlb3IuZGVmZXIoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3N0b3BwZWQpIHtcbiAgICAgICAgICB0aGlzLl9mbHVzaFBlbmRpbmdXcml0ZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX2hhbmRsZUNoYW5nZShjaGFuZ2UpIHtcbiAgICBpZiAodGhpcy5fc3RvcHBlZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgeyBvcGVyYXRpb25UeXBlLCBkb2N1bWVudEtleSwgY2x1c3RlclRpbWUgfSA9IGNoYW5nZTtcblxuICAgIGlmICghU1VQUE9SVEVEX09QRVJBVElPTlMuaW5jbHVkZXMob3BlcmF0aW9uVHlwZSkpIHtcbiAgICAgIHJldHVybjsgLy8gSWdub3JlIHVuc3VwcG9ydGVkIG9wZXJhdGlvbnNcbiAgICB9XG5cbiAgICBjb25zdCBmdWxsRG9jdW1lbnQgPSByZXBsYWNlVHlwZXMoY2hhbmdlLmZ1bGxEb2N1bWVudCwgcmVwbGFjZU1vbmdvQXRvbVdpdGhNZXRlb3IpO1xuICAgIGNvbnN0IGZ1bGxEb2N1bWVudEJlZm9yZUNoYW5nZSA9IHJlcGxhY2VUeXBlcyhcbiAgICAgIGNoYW5nZS5mdWxsRG9jdW1lbnRCZWZvcmVDaGFuZ2UsXG4gICAgICByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvclxuICAgICk7XG5cbiAgICBsZXQgaWQgPSBkb2N1bWVudEtleS5faWQ7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudEtleS5faWQ/LnRvSGV4U3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZCA9IG5ldyBNb25nb0lELk9iamVjdElEKGRvY3VtZW50S2V5Ll9pZC50b0hleFN0cmluZygpKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbGFzdCBwcm9jZXNzZWQgb3BlcmF0aW9uIHRpbWUgKHJlZHVuZGFudCB3aXRoIGVhcmx5IHVwZGF0ZSwgYnV0IHNhZmUpXG4gICAgaWYgKGNsdXN0ZXJUaW1lKSB7XG4gICAgICB0aGlzLl9zZXRMYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZShjbHVzdGVyVGltZSk7XG4gICAgfVxuXG4gICAgLy8gU3RvcmUgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgbGF0ZXIgd2hlbiBmZW5jZSBwcm9jZXNzZXMgd3JpdGVzXG4gICAgLy8gRG9uJ3QgdHJ5IHRvIGNhcHR1cmUgZmVuY2UgaGVyZSAtIGl0IHdpbGwgYmUgaGFuZGxlZCBpbiBvbkJlZm9yZUZpcmVcbiAgICBjb25zdCBjYWxsYmFja0RhdGEgPSB7XG4gICAgICBvcGVyYXRpb25UeXBlLFxuICAgICAgaWQsXG4gICAgICBmdWxsRG9jdW1lbnQsXG4gICAgICBmdWxsRG9jdW1lbnRCZWZvcmVDaGFuZ2UsXG4gICAgICBjaGFuZ2VcbiAgICB9O1xuXG4gICAgdGhpcy5fcGVuZGluZ1dyaXRlcy5wdXNoKGNhbGxiYWNrRGF0YSk7XG4gIH1cblxuICBfc2V0TGFzdFByb2Nlc3NlZE9wZXJhdGlvblRpbWUodHMpIHtcbiAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZSA9IHRzO1xuICAgIC8vIFJlc29sdmUgYW55IHdhaXRlcnMgd2hvc2UgdGFyZ2V0IGlzIDw9IGN1cnJlbnQgcHJvY2Vzc2VkIHRpbWVcbiAgICB3aGlsZSAodGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmaXJzdCA9IHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnNbMF07XG4gICAgICBpZiAoY29tcGFyZU9wZXJhdGlvblRpbWVzKHRzLCBmaXJzdC50cykgPj0gMCkge1xuICAgICAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLnNoaWZ0KCk7XG4gICAgICAgIHRyeSB7IGZpcnN0LnJlc29sdmVyKCk7IH0gY2F0Y2ggKGUpIHsgLyogaWdub3JlIHJlc29sdmVyIGVycm9ycyAqLyB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBfZmx1c2hQZW5kaW5nV3JpdGVzKCkge1xuICAgIC8vIEhvbGQgb2ZmIHByb2Nlc3NpbmcgdW50aWwgdGhlIG11bHRpcGxleGVyIGhhcyBoYWQgaXRzIGByZWFkeSgpYCBjYWxsLlxuICAgIC8vIFdlIG9wZW4gdGhlIGNoYW5nZSBzdHJlYW0gYmVmb3JlIF9zZW5kSW5pdGlhbEFkZHMgc28gZXZlbnRzIGVtaXR0ZWRcbiAgICAvLyBkdXJpbmcgdGhlIHNuYXBzaG90IGFyZSBub3QgbG9zdCDigJQgdGhvc2UgZXZlbnRzIHNpdCBoZXJlIHVudGlsIHRoZVxuICAgIC8vIGRyaXZlciBpcyByZWFkeSwgYW5kIF9zdGFydFdhdGNoaW5nJ3MgdGFpbCBmbHVzaCByZXBsYXlzIHRoZW0uXG4gICAgLy8gT2JzZXJ2ZU11bHRpcGxleGVyLmNoYW5nZWQgLyByZW1vdmVkIHRocm93IGlmIGNhbGxlZCBiZWZvcmUgcmVhZHkuXG4gICAgaWYgKCF0aGlzLl9pc1JlYWR5KSByZXR1cm47XG5cbiAgICBjb25zdCBjYWxsYmFja3NUb0ZsdXNoID0gdGhpcy5fcGVuZGluZ1dyaXRlcztcbiAgICB0aGlzLl9wZW5kaW5nV3JpdGVzID0gW107XG5cbiAgICBpZiAoY2FsbGJhY2tzVG9GbHVzaC5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrRGF0YSBvZiBjYWxsYmFja3NUb0ZsdXNoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBvcGVyYXRpb25UeXBlLCBpZCwgZnVsbERvY3VtZW50LCBmdWxsRG9jdW1lbnRCZWZvcmVDaGFuZ2UsIGNoYW5nZSB9ID0gY2FsbGJhY2tEYXRhO1xuXG4gICAgICAgICAgc3dpdGNoIChvcGVyYXRpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpbnNlcnQnOlxuICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVJbnNlcnQoaWQsIGZ1bGxEb2N1bWVudCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIGNhc2UgJ3JlcGxhY2UnOlxuICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVVcGRhdGUoaWQsIGZ1bGxEb2N1bWVudCwgZnVsbERvY3VtZW50QmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVEZWxldGUoaWQsIGNoYW5nZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQ2hhbmdlU3RyZWFtICR7dGhpcy5faWR9XSBFcnJvciBwcm9jZXNzaW5nIGNhbGxiYWNrOmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9mbHVzaFdyaXRlc1RvQ29tbWl0KCkge1xuICAgIC8vIFNpbWlsYXIgdG8gb3Bsb2cgZHJpdmVyJ3MgX2JlU3RlYWR5IG1ldGhvZFxuICAgIGNvbnN0IHdyaXRlcyA9IHRoaXMuX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5O1xuICAgIHRoaXMuX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5ID0gW107XG5cbiAgICBpZiAod3JpdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX211bHRpcGxleGVyLm9uRmx1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHdyaXRlIG9mIHdyaXRlcykge1xuICAgICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlSW5zZXJ0KGlkLCBkb2MpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5fbWF0Y2hlci5kb2N1bWVudE1hdGNoZXMoZG9jKS5yZXN1bHQ7XG4gICAgaWYgKCFtYXRjaGVzKSByZXR1cm47XG5cbiAgICAvLyBEZWR1cCBhZ2FpbnN0IHRoZSBjYWNoZTogb3BlbmluZyB0aGUgY2hhbmdlIHN0cmVhbSBiZWZvcmVcbiAgICAvLyBfc2VuZEluaXRpYWxBZGRzIG1lYW5zIGEgZG9jIGluc2VydGVkIGJldHdlZW4gd2F0Y2goKSBhbmQgdGhlIHNuYXBzaG90XG4gICAgLy8gcmVhZCBpcyByZXBvcnRlZCBieSBib3RoLiBXaXRob3V0IHRoaXMgZ3VhcmQgd2Ugd291bGQgZW1pdCBgYWRkZWRgXG4gICAgLy8gdHdpY2UgZm9yIHRoZSBzYW1lIGlkLCBhbmQgT2JzZXJ2ZU11bHRpcGxleGVyIC8gcHVibGljYXRpb24gdmlld3NcbiAgICAvLyBhc3N1bWUgZWFjaCBpZCBpcyBhZGRlZCBleGFjdGx5IG9uY2UuXG4gICAgaWYgKHRoaXMuX211bHRpcGxleGVyPy5fY2FjaGU/LmRvY3M/Lmhhcz8uKGlkKSkge1xuICAgICAgdGhpcy5faGFuZGxlVXBkYXRlKGlkLCBkb2MsIG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2plY3RlZERvYyA9IHRoaXMuX3Byb2plY3Rpb25GbiA/IHRoaXMuX3Byb2plY3Rpb25Gbihkb2MpIDogZG9jO1xuICAgIHRoaXMuX3NlbmRNdWx0aXBsZXhlckFkZGVkKGlkLCBwcm9qZWN0ZWREb2MpO1xuICB9XG5cbiAgX2hhbmRsZVVwZGF0ZShpZCwgbmV3RG9jLCBvbGREb2MpIHtcbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc3RhdGUgKGJlZm9yZS9hZnRlcikgbWF0Y2hlcyB0aGUgY3Vyc29yIHNlbGVjdG9yXG4gICAgY29uc3QgbWF0Y2hlc0FmdGVyID0gdGhpcy5fbWF0Y2hlci5kb2N1bWVudE1hdGNoZXMobmV3RG9jIHx8IHt9KS5yZXN1bHQ7XG5cbiAgICAvLyBVc2UgdGhlIG11bHRpcGxleGVyIGNhY2hlIChub3cgdXBkYXRlZCBzeW5jaHJvbm91c2x5KSB0byBjaGVjayBpZiB3ZSd2ZSBzZWVuIHRoaXMgZG9jXG4gICAgY29uc3QgY2FjaGVkRG9jID0gdGhpcy5fbXVsdGlwbGV4ZXI/Ll9jYWNoZT8uZG9jcy5nZXQoaWQpO1xuICAgIGNvbnN0IG1hdGNoZXNCZWZvcmUgPSBvbGREb2NcbiAgICAgID8gKHRoaXMuX21hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKG9sZERvYykucmVzdWx0KVxuICAgICAgOiAhIWNhY2hlZERvYztcblxuICAgIGlmIChtYXRjaGVzQWZ0ZXIpIHtcbiAgICAgIGlmICghbWF0Y2hlc0JlZm9yZSkge1xuICAgICAgICAvLyBEb2N1bWVudCB3YXNuJ3QgcHJldmlvdXNseSBpbiB0aGUgcmVzdWx0IHNldCBhbmQgbm93IG1hdGNoZXMg4oCTIGVtaXQgYWRkZWRcbiAgICAgICAgY29uc3QgcHJvamVjdGVkRG9jID0gdGhpcy5fcHJvamVjdGlvbkZuID8gdGhpcy5fcHJvamVjdGlvbkZuKG5ld0RvYykgOiBuZXdEb2M7XG4gICAgICAgIHRoaXMuX3NlbmRNdWx0aXBsZXhlckFkZGVkKGlkLCBwcm9qZWN0ZWREb2MpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdEb2MpIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgY2hhbmdlZCBmaWVsZHMgdXNpbmcgdGhlIGF2YWlsYWJsZSBwcmUtaW1hZ2Ugb3IgdGhlIGNhY2hlZCBkb2NcbiAgICAgICAgY29uc3Qgb2xkRG9jRm9yRGlmZiA9IG9sZERvYyB8fCAoY2FjaGVkRG9jID8geyAuLi5jYWNoZWREb2MgfSA6IG51bGwpO1xuICAgICAgICBpZiAob2xkRG9jRm9yRGlmZikge1xuICAgICAgICAgIGNvbnN0IHByb2plY3RlZE5ldyA9IHRoaXMuX3Byb2plY3Rpb25GbiA/IHRoaXMuX3Byb2plY3Rpb25GbihuZXdEb2MpIDogbmV3RG9jO1xuICAgICAgICAgIGNvbnN0IHByb2plY3RlZE9sZCA9IHRoaXMuX3Byb2plY3Rpb25GbiA/IHRoaXMuX3Byb2plY3Rpb25GbihvbGREb2NGb3JEaWZmKSA6IG9sZERvY0ZvckRpZmY7XG4gICAgICAgICAgY29uc3QgY2hhbmdlZEZpZWxkcyA9IERpZmZTZXF1ZW5jZS5tYWtlQ2hhbmdlZEZpZWxkcyhwcm9qZWN0ZWROZXcsIHByb2plY3RlZE9sZCk7XG5cbiAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2hhbmdlZEZpZWxkcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gY2hhbmdlZEZpZWxkcyBpcyBkZXJpdmVkIGZyb20gYWxyZWFkeS10cmFuc2xhdGVkIGRvY3MgdmlhIHRoZVxuICAgICAgICAgICAgLy8gcHJvamVjdGlvbiwgc28gaXQgaXMgYWxyZWFkeSBNZXRlb3ItdHlwZWQuXG4gICAgICAgICAgICB0aGlzLl9tdWx0aXBsZXhlci5jaGFuZ2VkKGlkLCBjaGFuZ2VkRmllbGRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2l0aG91dCBhIHByZS1pbWFnZSB3ZSBjYW4ndCBkaWZmIHJlbGlhYmx5OyBmYWxsIGJhY2sgdG8gc2VuZGluZyBmdWxsIGRvY1xuICAgICAgICBjb25zdCBwcm9qZWN0ZWREb2MgPSB0aGlzLl9wcm9qZWN0aW9uRm4gPyB0aGlzLl9wcm9qZWN0aW9uRm4obmV3RG9jKSA6IG5ld0RvYztcbiAgICAgICAgdGhpcy5fbXVsdGlwbGV4ZXIuY2hhbmdlZChpZCwgcHJvamVjdGVkRG9jKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWF0Y2hlc0JlZm9yZSkge1xuICAgICAgLy8gRG9jdW1lbnQgbGVmdCB0aGUgcmVzdWx0IHNldFxuICAgICAgdGhpcy5fbXVsdGlwbGV4ZXIucmVtb3ZlZChpZCk7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSB0aGUgZG9jdW1lbnQgZGlkbid0IG1hdGNoIGJlZm9yZSBvciBhZnRlciwgc28gbm8tb3BcbiAgfVxuXG4gIF9oYW5kbGVEZWxldGUoaWQpIHtcbiAgICBpZiAodGhpcy5fbXVsdGlwbGV4ZXIuX2NhY2hlPy5kb2NzLmhhcyhpZCkpIHtcbiAgICAgIHRoaXMuX211bHRpcGxleGVyLnJlbW92ZWQoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlY29uY2lsZSBvdXIgcmVzdWx0IHNldCB3aXRoIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24gY29udGVudHMgYWZ0ZXIgdGhlXG4gIC8vIHNoYXJlZCBjaGFuZ2Ugc3RyZWFtIGxvc3QgaXRzIHJlc3VtZSBoaXN0b3J5OiBldmVudHMgZHVyaW5nIHRoZSBsb3N0IHdpbmRvd1xuICAvLyB3ZXJlIG5ldmVyIGRlbGl2ZXJlZCwgc28gdGhlIG11bHRpcGxleGVyIGNhY2hlIG1heSBob2xkIHN0YWxlIGRvY3VtZW50cy5cbiAgLy8gVGhlIGxpdmUtZXZlbnQgaGFuZGxlcnMgYXJlIGFsbCBjYWNoZS1ndWFyZGVkLCBzbyByZXVzaW5nIHRoZW0gaGVyZSBtZWFucyBhXG4gIC8vIGRvY3VtZW50IGNvbmN1cnJlbnRseSByZWRlbGl2ZXJlZCBieSB0aGUgcmVvcGVuZWQgY3Vyc29yIGlzIHJlY29uY2lsZWQgb25jZVxuICAvLyByYXRoZXIgdGhhbiBkb3VibGUtZW1pdHRlZC5cbiAgYXN5bmMgX3Jlc3luY0FmdGVySGlzdG9yeUxvc3QoKSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQgfHwgIXRoaXMuX2lzUmVhZHkpIHJldHVybjtcblxuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLl9tb25nb0hhbmRsZS5yYXdDb2xsZWN0aW9uKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWVcbiAgICApO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gcmVwbGFjZVR5cGVzKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IgfHwge30sXG4gICAgICByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nb1xuICAgICk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4udGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucyB9O1xuXG4gICAgLy8gUmUtYWRkIG9yIHVwZGF0ZSBldmVyeSBjdXJyZW50bHktbWF0Y2hpbmcgZG9jdW1lbnQsIHRyYWNraW5nIHdoaWNoIGlkc1xuICAgIC8vIGFyZSBzdGlsbCBwcmVzZW50IHNvIHRoZSByZXN0IGNhbiBiZSByZW1vdmVkIGJlbG93LlxuICAgIGNvbnN0IHByZXNlbnQgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgY3Vyc29yID0gY29sbGVjdGlvbi5maW5kKHNlbGVjdG9yLCBvcHRpb25zKTtcbiAgICBmb3IgYXdhaXQgKGNvbnN0IHJhd0RvYyBvZiBjdXJzb3IpIHtcbiAgICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgICBjb25zdCBkb2MgPSByZXBsYWNlVHlwZXMocmF3RG9jLCByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvcik7XG4gICAgICBjb25zdCBpZCA9IHR5cGVvZiBkb2MuX2lkICE9PSAnc3RyaW5nJ1xuICAgICAgICA/IG5ldyBNb25nb0lELk9iamVjdElEKGRvYy5faWQudG9IZXhTdHJpbmcoKSlcbiAgICAgICAgOiBkb2MuX2lkO1xuICAgICAgcHJlc2VudC5hZGQoTW9uZ29JRC5pZFN0cmluZ2lmeShpZCkpO1xuICAgICAgdGhpcy5faGFuZGxlSW5zZXJ0KGlkLCBkb2MpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICAvLyBBbnl0aGluZyBzdGlsbCBjYWNoZWQgYnV0IG5vIGxvbmdlciByZXR1cm5lZCBieSB0aGUgcXVlcnkgbGVmdCB0aGUgcmVzdWx0XG4gICAgLy8gc2V0IHdoaWxlIHRoZSBzdHJlYW0gd2FzIGRpc2Nvbm5lY3RlZCDigJQgZW1pdCB0aGUgcmVtb3ZhbHMuXG4gICAgY29uc3QgcmVtb3ZlZElkcyA9IFtdO1xuICAgIHRoaXMuX211bHRpcGxleGVyLl9jYWNoZT8uZG9jcy5mb3JFYWNoKChjYWNoZWREb2MsIGNhY2hlZElkKSA9PiB7XG4gICAgICBpZiAoIXByZXNlbnQuaGFzKE1vbmdvSUQuaWRTdHJpbmdpZnkoY2FjaGVkSWQpKSkge1xuICAgICAgICByZW1vdmVkSWRzLnB1c2goY2FjaGVkSWQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvciAoY29uc3QgaWQgb2YgcmVtb3ZlZElkcykge1xuICAgICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcbiAgICAgIHRoaXMuX2hhbmRsZURlbGV0ZShpZCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3dhaXRVbnRpbENhdWdodFVwKGZlbmNlT3ZlcnJpZGUpIHtcbiAgICAvLyBXYWl0IHVudGlsIG91ciBjaGFuZ2Ugc3RyZWFtIGhhcyBwcm9jZXNzZWQgZXZlbnRzIHVwIHRvIHRoZVxuICAgIC8vIHNlcnZlcidzIGN1cnJlbnQgb3BlcmF0aW9uIHRpbWUuIE1pcnJvcnMgb3Bsb2cncyB3YWl0IGxvZ2ljLlxuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICAvLyBUaGUgZmVuY2UncyB3cml0ZSBwYXRoIHN0YW1wcyB0aGUgZXhhY3QgY2x1c3RlclRpbWUgb2YgZWFjaCB3cml0ZSBvblxuICAgIC8vIGZlbmNlLl9jc1RhcmdldFRzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25OYW1lXSAoc2VlXG4gICAgLy8gbW9uZ29fY29ubmVjdGlvbi5fYW5ub3RhdGVGZW5jZVdpdGhXcml0ZVRzKS4gV2FpdCBzcGVjaWZpY2FsbHkgZm9yXG4gICAgLy8gdGhhdCB0cy4gVGhlIGZlbmNlIG11c3QgYmUgcGFzc2VkIGV4cGxpY2l0bHkgYmVjYXVzZSBmZW5jZS5maXJlKClcbiAgICAvLyBydW5zIG91dHNpZGUgdGhlIEFzeW5jTG9jYWxTdG9yYWdlIGNvbnRleHQgd2hlcmUgX2dldEN1cnJlbnRGZW5jZSgpXG4gICAgLy8gd291bGQgZmluZCBpdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIGFubm90YXRpb24gZm9yIG91ciBjb2xsZWN0aW9uLCB0aGVyZSBpcyBubyBzcGVjaWZpY1xuICAgIC8vIHdyaXRlIHRvIHdhaXQgZm9yIGFuZCB3ZSByZXR1cm4gaW1tZWRpYXRlbHkuIEFza2luZyB0aGUgc2VydmVyIGZvclxuICAgIC8vIGl0cyBjdXJyZW50IG9wZXJhdGlvblRpbWUgaGVyZSB3b3VsZCBjaGFzZSBhIG1vdmluZyB0YXJnZXQg4oCUIHRoZVxuICAgIC8vIHNlcnZlcidzIGNsb2NrIGFkdmFuY2VzIHdpdGggcmVwbGljYXRpb24gaGVhcnRiZWF0cywgYnV0IG91ciBzdHJlYW1cbiAgICAvLyBvbmx5IHNlZXMgZXZlbnRzIGVtaXR0ZWQgb24gdGhpcyBjb2xsZWN0aW9uLCBzbyB0aGUgd2FpdCB3b3VsZCBuZXZlclxuICAgIC8vIHJlc29sdmUgdW5kZXIgdGhlIHByZXZpb3VzIChuby10aW1lb3V0KSByZWdpbWUuXG4gICAgY29uc3QgZmVuY2UgPSBmZW5jZU92ZXJyaWRlIHx8IEREUFNlcnZlci5fZ2V0Q3VycmVudEZlbmNlKCk7XG4gICAgY29uc3QgeyBjb2xsZWN0aW9uTmFtZSB9ID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb247XG4gICAgY29uc3QgeyBfY3NUYXJnZXRUc0J5Q29sbGVjdGlvbiB9ID0gZmVuY2UgfHwge307XG4gICAgY29uc3QgdGFyZ2V0VHMgPSBfY3NUYXJnZXRUc0J5Q29sbGVjdGlvbiAmJiBjb2xsZWN0aW9uTmFtZSA/IF9jc1RhcmdldFRzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25OYW1lXSA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghdGFyZ2V0VHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGFzdFByb2Nlc3NlZE9wZXJhdGlvblRpbWUgJiYgY29tcGFyZU9wZXJhdGlvblRpbWVzKHRoaXMuX2xhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lLCB0YXJnZXRUcykgPj0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluc2VydCBpbiBvcmRlciBzbyB3ZSBjYW4gcmVzb2x2ZSBmcm9tIHRoZSBmcm9udCBlZmZpY2llbnRseVxuICAgIGxldCBpbnNlcnRJZHggPSB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLmxlbmd0aDtcbiAgICB3aGlsZSAoaW5zZXJ0SWR4IC0gMSA+PSAwICYmIGNvbXBhcmVPcGVyYXRpb25UaW1lcyh0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzW2luc2VydElkeCAtIDFdPy50cywgdGFyZ2V0VHMpID4gMCkge1xuICAgICAgaW5zZXJ0SWR4LS07XG4gICAgfVxuXG4gICAgY29uc3QgZW50cnkgPSB7IHRzOiB0YXJnZXRUcywgcmVzb2x2ZXI6IG51bGwgfTtcblxuICAgIC8vIFdhaXQgdW50aWwgb3VyIGNoYW5nZSBzdHJlYW0gaGFzIGFjdHVhbGx5IGRlbGl2ZXJlZCBhbiBldmVudCB3aXRoXG4gICAgLy8gY2x1c3RlclRpbWUgPj0gdGFyZ2V0VHMuIE1pcnJvcnMgT3Bsb2dIYW5kbGUuX3dhaXRVbnRpbENhdWdodFVwOiB0aGVcbiAgICAvLyB3YWl0IGhhcyBubyB1cHBlciBib3VuZCDigJQgcmVsZWFzaW5nIGVhcmx5IGNhdXNlcyB0aGUgZmVuY2UgdG8gZmlyZVxuICAgIC8vIGJlZm9yZSB0aGUgY2hhbmdlIGhhcyBiZWVuIGFwcGxpZWQgdG8gdGhlIG11bHRpcGxleGVyLCB3aGljaCBzdXJmYWNlc1xuICAgIC8vIGFzIHRoZSBjbGllbnQgcmVjZWl2aW5nIGB1cGRhdGVkYCB3aXRob3V0IHRoZSBjb3JyZXNwb25kaW5nXG4gICAgLy8gYGFkZGVkYC9gY2hhbmdlZGAvYHJlbW92ZWRgIChlLmcuIGBsaXZlZGF0YSAtIG1ldGhvZCB1cGRhdGVkIG1lc3NhZ2VcbiAgICAvLyB3aXRoIHN1YnNjcmlwdGlvbnNgIGZhaWxpbmcgd2l0aCBcIlNob3VsZCByZWNlaXZlIENIQU5HRUQgbWVzc2FnZVwiKS5cbiAgICAvL1xuICAgIC8vIExpdmVuZXNzIGlzIGd1YXJhbnRlZWQgYnk6XG4gICAgLy8gICAxLiBUaGUgc2hhcmVkIGNoYW5nZSBzdHJlYW0gcmVzdW1pbmcgZnJvbSBpdHMgcmVzdW1lIHRva2VuIG9uXG4gICAgLy8gICAgICBlcnJvci9jbG9zZSwgc28gZXZlbnRzIG1pc3NlZCB3aGlsZSByZWNvbm5lY3RpbmcgYXJlIHJlcGxheWVkIGFuZFxuICAgIC8vICAgICAgb3VyIGxhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lIHN0aWxsIGFkdmFuY2VzIHRvIHRhcmdldC5cbiAgICAvLyAgIDIuIFRoZSB3YXRjaGRvZyBiZWxvdyBsb2dnaW5nIGlmIHRoZSB3YWl0IHN0YWxscyBwYXN0IHdhcm5Ncywgd2hpY2hcbiAgICAvLyAgICAgIG1ha2VzIGEgZ2VudWluZWx5LWJyb2tlbiBzdHJlYW0gdmlzaWJsZSB3aXRob3V0IG1hc2tpbmcgaXQuXG4gICAgY29uc3Qgd2Fybk1zID0gTWV0ZW9yPy5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5jaGFuZ2VTdHJlYW0/LndhaXRVbnRpbENhdWdodFVwV2Fybk1zID8/IDEwMDAwO1xuXG4gICAgY29uc3Qgd2FpdFN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgbGV0IHdhcm5Db3VudCA9IDA7XG5cbiAgICAvLyBQZXJpb2RpYyB3YXRjaGRvZzogcmUtZmlyZXMgZXZlcnkgd2Fybk1zIHNvIHdlIGNhbiBzZWUgd2hldGhlciBhIHdhaXRcbiAgICAvLyBpcyBtYWtpbmcgcHJvZ3Jlc3MgKGxhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lIGFkdmFuY2luZykgb3IgZ2VudWluZWx5XG4gICAgLy8gc3R1Y2suXG4gICAgY29uc3QgZHVtcERpYWdub3N0aWNzID0gKCkgPT4ge1xuICAgICAgd2FybkNvdW50ICs9IDE7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBgTWV0ZW9yOiBjaGFuZ2Ugc3RyZWFtIGNhdGNoaW5nIHVwIHRvb2sgdG9vIGxvbmdgLFxuICAgICAgICB7XG4gICAgICAgICAgZHJpdmVySWQ6IHRoaXMuX2lkLFxuICAgICAgICAgIGNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIHRhcmdldFRzLFxuICAgICAgICAgIGxhc3RQcm9jZXNzZWRPcGVyYXRpb25UaW1lOiB0aGlzLl9sYXN0UHJvY2Vzc2VkT3BlcmF0aW9uVGltZSxcbiAgICAgICAgICBzdG9wcGVkOiB0aGlzLl9zdG9wcGVkLFxuICAgICAgICAgIGlzUmVhZHk6IHRoaXMuX2lzUmVhZHksXG4gICAgICAgICAgY2hhbmdlU3RyZWFtT3BlbjogISEodGhpcy5fc2hhcmVkU3RyZWFtICYmIHRoaXMuX3NoYXJlZFN0cmVhbS5fY2hhbmdlU3RyZWFtKSxcbiAgICAgICAgICByZXN1bWVUb2tlblByZXNlbnQ6ICEhKHRoaXMuX3NoYXJlZFN0cmVhbSAmJiB0aGlzLl9zaGFyZWRTdHJlYW0uX3Jlc3VtZVRva2VuKSxcbiAgICAgICAgICBwZW5kaW5nV3JpdGVzQ291bnQ6IHRoaXMuX3BlbmRpbmdXcml0ZXMubGVuZ3RoLFxuICAgICAgICAgIHdyaXRlc1RvQ29tbWl0V2hlblJlYWR5Q291bnQ6IHRoaXMuX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5Lmxlbmd0aCxcbiAgICAgICAgICBjYXRjaGluZ1VwUmVzb2x2ZXJzQ291bnQ6IHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnMubGVuZ3RoLFxuICAgICAgICAgIHdhaXRlZE1zOiBEYXRlLm5vdygpIC0gd2FpdFN0YXJ0ZWRBdCxcbiAgICAgICAgICB3YXJuQ291bnQsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcblxuICAgIGxldCB3YXJuVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgZHVtcERpYWdub3N0aWNzKCk7XG4gICAgICAvLyBSZS1hcm0gc28gd2Uga2VlcCBkdW1waW5nIHN0YXRlIGV2ZXJ5IHdhcm5NcyB3aGlsZSB0aGUgd2FpdCBpcyBzdHVjay5cbiAgICAgIC8vIFdpdGhvdXQgdGhpcyB3ZSBvbmx5IGV2ZXIgc2VlIHRoZSBmaXJzdCBzbmFwc2hvdCBhbmQgY2FuJ3QgdGVsbCB3aGV0aGVyXG4gICAgICAvLyB0aGUgc3RyZWFtIG1hZGUgYW55IHByb2dyZXNzIGJlZm9yZSB0aGUgdGVzdCBnYXZlIHVwLlxuICAgICAgd2FyblRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGljaywgd2Fybk1zKTtcbiAgICB9LCB3YXJuTXMpO1xuXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGVudHJ5LnJlc29sdmVyID0gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQod2FyblRpbWVvdXRJZCk7XG4gICAgICAgIGlmICh3YXJuQ291bnQgPiAwKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIC8vIFdoZW4gc3RvcCgpIGRyYWlucyB0aGlzIHJlc29sdmVyIHRoZSBzdHJlYW0gbmV2ZXIgcmVhY2hlZFxuICAgICAgICAgICAgLy8gdGFyZ2V0VHMg4oCUIHNheSBzbyByYXRoZXIgdGhhbiBjbGFpbWluZyB3ZSBjYXVnaHQgdXAsIHNvIHRoZSBsb2dzXG4gICAgICAgICAgICAvLyByZWZsZWN0IHRoYXQgdGhlIHdhaXQgd2FzIHJlbGVhc2VkIGJ5IHRlYXJkb3duICgjMTQ0NTIpLlxuICAgICAgICAgICAgdGhpcy5fc3RvcHBlZFxuICAgICAgICAgICAgICA/IGBNZXRlb3I6IGNoYW5nZSBzdHJlYW0gd2FpdCByZWxlYXNlZCBiZWNhdXNlIG9ic2VydmVyIHN0b3BwZWRgXG4gICAgICAgICAgICAgIDogYE1ldGVvcjogY2hhbmdlIHN0cmVhbSBjYXVnaHQgdXAgYWZ0ZXIgd2FybmAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRyaXZlcklkOiB0aGlzLl9pZCxcbiAgICAgICAgICAgICAgY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgICAgIHRhcmdldFRzLFxuICAgICAgICAgICAgICB3YWl0ZWRNczogRGF0ZS5ub3coKSAtIHdhaXRTdGFydGVkQXQsXG4gICAgICAgICAgICAgIHdhcm5Db3VudCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLnNwbGljZShpbnNlcnRJZHgsIDAsIGVudHJ5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AoKSB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXG4gICAgLy8gUmVsZWFzZSBhbnkgZmVuY2Ugd2FpdGVycyBzdGlsbCBwYXJrZWQgaW4gX3dhaXRVbnRpbENhdWdodFVwIGJlZm9yZSB3ZVxuICAgIC8vIGNsb3NlIHRoZSBjaGFuZ2Ugc3RyZWFtIGJlbG93LiBUaG9zZSByZXNvbHZlcnMgYXJlIHdhaXRpbmcgZm9yIGFuIGV2ZW50XG4gICAgLy8gd2l0aCBjbHVzdGVyVGltZSA+PSB0YXJnZXRUcywgYnV0IG9uY2UgdGhlIHN0cmVhbSBpcyBjbG9zZWQgdGhhdCBldmVudFxuICAgIC8vIHdpbGwgbmV2ZXIgYXJyaXZlLCBzbyBsZWF2aW5nIHRoZW0gcGFya2VkIGhhbmdzIHRoZSBmZW5jZSdzXG4gICAgLy8gb25CZWZvcmVGaXJlICh3aGljaCBhd2FpdHMgX3dhaXRVbnRpbENhdWdodFVwKSBmb3JldmVyIOKAlCB0aGUgRERQIG1ldGhvZFxuICAgIC8vIHRoYXQgaXNzdWVkIHRoZSB3cml0ZSBuZXZlciBnZXRzIGl0cyBgdXBkYXRlZGAgbWVzc2FnZSBhbmQgdGhlIGNsaWVudFxuICAgIC8vIGNhbGwgaGFuZ3MgdW50aWwgdGltZW91dCAobWV0ZW9yL21ldGVvciMxNDQ1MikuIFJlc29sdmUgKGRvbid0IHJlamVjdCk6XG4gICAgLy8gdGhlIGZlbmNlIG1heSBjYXJyeSB3cml0ZXMgZnJvbSBvdGhlciwgc3RpbGwtaGVhbHRoeSBkcml2ZXJzLCBhbmQgdGhlXG4gICAgLy8gY29udGludWF0aW9uIGp1c3QgY29tbWl0cyB0aGlzIGRyaXZlcidzIGFscmVhZHktYmVndW4gd3JpdGUgc28gdGhlIGZlbmNlXG4gICAgLy8gY2FuIGZpcmUuIFRoZSBkcml2ZXIgaXMgYmVpbmcgdG9ybiBkb3duLCBzbyBub3QgcmVhY2hpbmcgdGFyZ2V0VHMgb24gaXRcbiAgICAvLyBpcyBoYXJtbGVzcyDigJQgaXRzIGhhbmRsZXMgYXJlIGdvbmUuXG4gICAgY29uc3QgcGVuZGluZ0NhdGNoVXAgPSB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzO1xuICAgIHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHBlbmRpbmdDYXRjaFVwKSB7XG4gICAgICB0cnkge1xuICAgICAgICBlbnRyeS5yZXNvbHZlcigpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpZ25vcmUgcmVzb2x2ZXIgZXJyb3JzXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZSBhbGwgc3RvcCBjYWxsYmFja3NcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIHRoaXMuX3N0b3BDYWxsYmFja3MpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNhbGxiYWNrKCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzdG9wIGNhbGxiYWNrOicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZXRhY2ggZnJvbSB0aGUgc2hhcmVkIHN0cmVhbS4gSXQgY2xvc2VzIHRoZSB1bmRlcmx5aW5nIGN1cnNvciAoYW5kIGRyb3BzXG4gICAgLy8gaXRzZWxmIGZyb20gdGhlIGNvbm5lY3Rpb24gcmVnaXN0cnkpIG9uY2UgaXRzIGxhc3QgZHJpdmVyIGxlYXZlcy5cbiAgICBpZiAodGhpcy5fc2hhcmVkU3RyZWFtKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLl9zaGFyZWRTdHJlYW0ucmVtb3ZlRHJpdmVyKHRoaXMpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZGV0YWNoaW5nIGZyb20gc2hhcmVkIGNoYW5nZSBzdHJlYW06JywgZXJyb3IpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2hhcmVkU3RyZWFtID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYW55IHJlbWFpbmluZyBwZW5kaW5nIHdyaXRlcyAoZm9sbG93aW5nIG9wbG9nIGRyaXZlciBwYXR0ZXJuKVxuICAgIGZvciAoY29uc3Qgd3JpdGUgb2YgdGhpcy5fcGVuZGluZ1dyaXRlcykge1xuICAgICAgaWYgKCF3cml0ZSB8fCB0eXBlb2Ygd3JpdGUuY29tbWl0dGVkICE9PSAnZnVuY3Rpb24nKSBjb250aW51ZTtcbiAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIH1cbiAgICB0aGlzLl9wZW5kaW5nV3JpdGVzID0gW107XG5cbiAgICAvLyBIYW5kbGUgYW55IHJlbWFpbmluZyB3cml0ZXMgdG8gY29tbWl0XG4gICAgZm9yIChjb25zdCB3cml0ZSBvZiB0aGlzLl93cml0ZXNUb0NvbW1pdFdoZW5SZWFkeSkge1xuICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgfVxuICAgIHRoaXMuX3dyaXRlc1RvQ29tbWl0V2hlblJlYWR5ID0gW107XG5cbiAgICAvLyBDbGVhciBjYWxsYmFja3MgYXJyYXlcbiAgICB0aGlzLl9zdG9wQ2FsbGJhY2tzID0gW107XG4gIH1cbn1cbiIsIi8vIHNpbmdsZXRvblxuZXhwb3J0IGNvbnN0IExvY2FsQ29sbGVjdGlvbkRyaXZlciA9IG5ldyAoY2xhc3MgTG9jYWxDb2xsZWN0aW9uRHJpdmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ub0Nvbm5Db2xsZWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH1cblxuICBvcGVuKG5hbWUsIGNvbm4pIHtcbiAgICBpZiAoISBuYW1lKSB7XG4gICAgICByZXR1cm4gbmV3IExvY2FsQ29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISBjb25uKSB7XG4gICAgICByZXR1cm4gZW5zdXJlQ29sbGVjdGlvbihuYW1lLCB0aGlzLm5vQ29ubkNvbGxlY3Rpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoISBjb25uLl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucykge1xuICAgICAgY29ubi5fbW9uZ29fbGl2ZWRhdGFfY29sbGVjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cblxuICAgIC8vIFhYWCBpcyB0aGVyZSBhIHdheSB0byBrZWVwIHRyYWNrIG9mIGEgY29ubmVjdGlvbidzIGNvbGxlY3Rpb25zIHdpdGhvdXRcbiAgICAvLyBkYW5nbGluZyBpdCBvZmYgdGhlIGNvbm5lY3Rpb24gb2JqZWN0P1xuICAgIHJldHVybiBlbnN1cmVDb2xsZWN0aW9uKG5hbWUsIGNvbm4uX21vbmdvX2xpdmVkYXRhX2NvbGxlY3Rpb25zKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGVuc3VyZUNvbGxlY3Rpb24obmFtZSwgY29sbGVjdGlvbnMpIHtcbiAgcmV0dXJuIChuYW1lIGluIGNvbGxlY3Rpb25zKVxuICAgID8gY29sbGVjdGlvbnNbbmFtZV1cbiAgICA6IGNvbGxlY3Rpb25zW25hbWVdID0gbmV3IExvY2FsQ29sbGVjdGlvbihuYW1lKTtcbn1cbiIsImltcG9ydCBvbmNlIGZyb20gJ2xvZGFzaC5vbmNlJztcbmltcG9ydCB7XG4gIEFTWU5DX0NPTExFQ1RJT05fTUVUSE9EUyxcbiAgZ2V0QXN5bmNNZXRob2ROYW1lLFxuICBDTElFTlRfT05MWV9NRVRIT0RTXG59IGZyb20gXCJtZXRlb3IvbWluaW1vbmdvL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgTW9uZ29Db25uZWN0aW9uIH0gZnJvbSAnLi9tb25nb19jb25uZWN0aW9uJztcblxuLy8gRGVmaW5lIGludGVyZmFjZXMgYW5kIHR5cGVzXG5pbnRlcmZhY2UgSUNvbm5lY3Rpb25PcHRpb25zIHtcbiAgb3Bsb2dVcmw/OiBzdHJpbmc7XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247ICAvLyBDaGFuZ2VkIGZyb20gJ2FueScgdG8gJ3Vua25vd24nIGZvciBiZXR0ZXIgdHlwZSBzYWZldHlcbn1cblxuaW50ZXJmYWNlIElNb25nb0ludGVybmFscyB7XG4gIFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXI6IHR5cGVvZiBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyO1xuICBkZWZhdWx0UmVtb3RlQ29sbGVjdGlvbkRyaXZlcjogKCkgPT4gUmVtb3RlQ29sbGVjdGlvbkRyaXZlcjtcbn1cblxuLy8gTW9yZSBzcGVjaWZpYyB0eXBpbmcgZm9yIGNvbGxlY3Rpb24gbWV0aG9kc1xudHlwZSBNb25nb01ldGhvZEZ1bmN0aW9uID0gKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdW5rbm93bjtcbmludGVyZmFjZSBJQ29sbGVjdGlvbk1ldGhvZHMge1xuICBba2V5OiBzdHJpbmddOiBNb25nb01ldGhvZEZ1bmN0aW9uO1xufVxuXG4vLyBUeXBlIGZvciBNb25nb0Nvbm5lY3Rpb25cbmludGVyZmFjZSBJTW9uZ29DbGllbnQge1xuICBjb25uZWN0OiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufVxuXG5pbnRlcmZhY2UgSU1vbmdvQ29ubmVjdGlvbiB7XG4gIGNsaWVudDogSU1vbmdvQ2xpZW50O1xuICBba2V5OiBzdHJpbmddOiBNb25nb01ldGhvZEZ1bmN0aW9uIHwgSU1vbmdvQ2xpZW50O1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIG5hbWVzcGFjZSBOb2RlSlMge1xuICAgIGludGVyZmFjZSBQcm9jZXNzRW52IHtcbiAgICAgIE1PTkdPX1VSTDogc3RyaW5nO1xuICAgICAgTU9OR09fT1BMT0dfVVJMPzogc3RyaW5nO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IE1vbmdvSW50ZXJuYWxzOiBJTW9uZ29JbnRlcm5hbHM7XG4gIGNvbnN0IE1ldGVvcjoge1xuICAgIHN0YXJ0dXA6IChjYWxsYmFjazogKCkgPT4gUHJvbWlzZTx2b2lkPikgPT4gdm9pZDtcbiAgfTtcbn1cblxuY2xhc3MgUmVtb3RlQ29sbGVjdGlvbkRyaXZlciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbW9uZ286IE1vbmdvQ29ubmVjdGlvbjtcblxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBSRU1PVEVfQ09MTEVDVElPTl9NRVRIT0RTID0gW1xuICAgICdjcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMnLFxuICAgICdkcm9wSW5kZXhBc3luYycsXG4gICAgJ2Vuc3VyZUluZGV4QXN5bmMnLFxuICAgICdjcmVhdGVJbmRleEFzeW5jJyxcbiAgICAnY291bnREb2N1bWVudHMnLFxuICAgICdkcm9wQ29sbGVjdGlvbkFzeW5jJyxcbiAgICAnZXN0aW1hdGVkRG9jdW1lbnRDb3VudCcsXG4gICAgJ2ZpbmQnLFxuICAgICdmaW5kT25lQXN5bmMnLFxuICAgICdpbnNlcnRBc3luYycsXG4gICAgJ3Jhd0NvbGxlY3Rpb24nLFxuICAgICdyZW1vdmVBc3luYycsXG4gICAgJ3VwZGF0ZUFzeW5jJyxcbiAgICAndXBzZXJ0QXN5bmMnLFxuICBdIGFzIGNvbnN0O1xuXG4gIGNvbnN0cnVjdG9yKG1vbmdvVXJsOiBzdHJpbmcsIG9wdGlvbnM6IElDb25uZWN0aW9uT3B0aW9ucykge1xuICAgIHRoaXMubW9uZ28gPSBuZXcgTW9uZ29Db25uZWN0aW9uKG1vbmdvVXJsLCBvcHRpb25zKTtcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKG5hbWU6IHN0cmluZyk6IElDb2xsZWN0aW9uTWV0aG9kcyB7XG4gICAgY29uc3QgcmV0OiBJQ29sbGVjdGlvbk1ldGhvZHMgPSB7fTtcblxuICAgIC8vIEhhbmRsZSByZW1vdGUgY29sbGVjdGlvbiBtZXRob2RzXG4gICAgUmVtb3RlQ29sbGVjdGlvbkRyaXZlci5SRU1PVEVfQ09MTEVDVElPTl9NRVRIT0RTLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgLy8gVHlwZSBhc3NlcnRpb24gbmVlZGVkIGJlY2F1c2Ugd2Uga25vdyB0aGVzZSBtZXRob2RzIGV4aXN0IG9uIE1vbmdvQ29ubmVjdGlvblxuICAgICAgY29uc3QgbW9uZ29NZXRob2QgPSB0aGlzLm1vbmdvW21ldGhvZF0gYXMgTW9uZ29NZXRob2RGdW5jdGlvbjtcbiAgICAgIHJldFttZXRob2RdID0gbW9uZ29NZXRob2QuYmluZCh0aGlzLm1vbmdvLCBuYW1lKTtcblxuICAgICAgaWYgKCFBU1lOQ19DT0xMRUNUSU9OX01FVEhPRFMuaW5jbHVkZXMobWV0aG9kKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBhc3luY01ldGhvZE5hbWUgPSBnZXRBc3luY01ldGhvZE5hbWUobWV0aG9kKTtcbiAgICAgIHJldFthc3luY01ldGhvZE5hbWVdID0gKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gcmV0W21ldGhvZF0oLi4uYXJncyk7XG4gICAgfSk7XG5cbiAgICAvLyBIYW5kbGUgY2xpZW50LW9ubHkgbWV0aG9kc1xuICAgIENMSUVOVF9PTkxZX01FVEhPRFMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICByZXRbbWV0aG9kXSA9ICguLi5hcmdzOiB1bmtub3duW10pOiBuZXZlciA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgJHttZXRob2R9IGlzIG5vdCBhdmFpbGFibGUgb24gdGhlIHNlcnZlci4gUGxlYXNlIHVzZSAke2dldEFzeW5jTWV0aG9kTmFtZShcbiAgICAgICAgICAgIG1ldGhvZFxuICAgICAgICAgICl9KCkgaW5zdGVhZC5gXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG4vLyBBc3NpZ24gdGhlIGNsYXNzIHRvIE1vbmdvSW50ZXJuYWxzXG5Nb25nb0ludGVybmFscy5SZW1vdGVDb2xsZWN0aW9uRHJpdmVyID0gUmVtb3RlQ29sbGVjdGlvbkRyaXZlcjtcblxuLy8gQ3JlYXRlIHRoZSBzaW5nbGV0b24gUmVtb3RlQ29sbGVjdGlvbkRyaXZlciBvbmx5IG9uIGRlbWFuZFxuTW9uZ29JbnRlcm5hbHMuZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIgPSBvbmNlKCgpOiBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyID0+IHtcbiAgY29uc3QgY29ubmVjdGlvbk9wdGlvbnM6IElDb25uZWN0aW9uT3B0aW9ucyA9IHt9O1xuICBjb25zdCBtb25nb1VybCA9IHByb2Nlc3MuZW52Lk1PTkdPX1VSTDtcblxuICBpZiAoIW1vbmdvVXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTU9OR09fVVJMIG11c3QgYmUgc2V0IGluIGVudmlyb25tZW50XCIpO1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk1PTkdPX09QTE9HX1VSTCkge1xuICAgIGNvbm5lY3Rpb25PcHRpb25zLm9wbG9nVXJsID0gcHJvY2Vzcy5lbnYuTU9OR09fT1BMT0dfVVJMO1xuICB9XG5cbiAgY29uc3QgZHJpdmVyID0gbmV3IFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIobW9uZ29VcmwsIGNvbm5lY3Rpb25PcHRpb25zKTtcblxuICAvLyBJbml0aWFsaXplIGRhdGFiYXNlIGNvbm5lY3Rpb24gb24gc3RhcnR1cFxuICBNZXRlb3Iuc3RhcnR1cChhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgYXdhaXQgZHJpdmVyLm1vbmdvLmNsaWVudC5jb25uZWN0KCk7XG4gIH0pO1xuXG4gIHJldHVybiBkcml2ZXI7XG59KTtcblxuZXhwb3J0IHsgUmVtb3RlQ29sbGVjdGlvbkRyaXZlciwgSUNvbm5lY3Rpb25PcHRpb25zLCBJQ29sbGVjdGlvbk1ldGhvZHMgfTsiLCIvKipcbiAqIENvbGxlY3Rpb24gRXh0ZW5zaW9ucyBTeXN0ZW1cbiAqIFxuICogUHJvdmlkZXMgYSBjbGVhbiB3YXkgdG8gZXh0ZW5kIE1vbmdvLkNvbGxlY3Rpb24gZnVuY3Rpb25hbGl0eVxuICogd2l0aG91dCBtb25rZXkgcGF0Y2hpbmcuIFN1cHBvcnRzIGNvbnN0cnVjdG9yIGV4dGVuc2lvbnMsXG4gKiBwcm90b3R5cGUgbWV0aG9kcywgYW5kIHN0YXRpYyBtZXRob2RzLlxuICovXG5cbmlmIChQYWNrYWdlWydsYWk6Y29sbGVjdGlvbi1leHRlbnNpb25zJ10pIHtcbiAgY29uc29sZS53YXJuKCdsYWk6Y29sbGVjdGlvbi1leHRlbnNpb25zIGlzIG5vdCBkZXByZWNhdGVkLiBVc2UgTW9uZ28uQ29sbGVjdGlvbi5hZGRFeHRlbnNpb24gaW5zdGVhZC4nKTtcbn1cblxuQ29sbGVjdGlvbkV4dGVuc2lvbnMgPSB7XG4gIF9leHRlbnNpb25zOiBbXSxcbiAgX3Byb3RvdHlwZU1ldGhvZHM6IG5ldyBNYXAoKSxcbiAgX3N0YXRpY01ldGhvZHM6IG5ldyBNYXAoKSxcbiAgXG4gIC8qKlxuICAgKiBBZGQgYSBjb25zdHJ1Y3RvciBleHRlbnNpb24gZnVuY3Rpb25cbiAgICogRXh0ZW5zaW9uIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIChuYW1lLCBvcHRpb25zKSBhbmQgJ3RoaXMnIGJvdW5kIHRvIGNvbGxlY3Rpb24gaW5zdGFuY2VcbiAgICovXG4gIGFkZEV4dGVuc2lvbihleHRlbnNpb24pIHtcbiAgICBpZiAodHlwZW9mIGV4dGVuc2lvbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHRlbnNpb24gbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHRoaXMuX2V4dGVuc2lvbnMucHVzaChleHRlbnNpb24pO1xuICB9LFxuICBcbiAgLyoqXG4gICAqIEFkZCBhIHByb3RvdHlwZSBtZXRob2QgdG8gYWxsIGNvbGxlY3Rpb24gaW5zdGFuY2VzXG4gICAqIE1ldGhvZCBpcyBib3VuZCB0byB0aGUgY29sbGVjdGlvbiBpbnN0YW5jZVxuICAgKi9cbiAgYWRkUHJvdG90eXBlTWV0aG9kKG5hbWUsIG1ldGhvZCkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgfHwgIW5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdG90eXBlIG1ldGhvZCBuYW1lIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3RvdHlwZSBtZXRob2QgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuX3Byb3RvdHlwZU1ldGhvZHMuc2V0KG5hbWUsIG1ldGhvZCk7XG4gIH0sXG4gIFxuICAvKipcbiAgICogQWRkIGEgc3RhdGljIG1ldGhvZCB0byB0aGUgTW9uZ28uQ29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgKi9cbiAgYWRkU3RhdGljTWV0aG9kKG5hbWUsIG1ldGhvZCkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgfHwgIW5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3RhdGljIG1ldGhvZCBuYW1lIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0YXRpYyBtZXRob2QgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuX3N0YXRpY01ldGhvZHMuc2V0KG5hbWUsIG1ldGhvZCk7XG4gIH0sXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIGFuIGV4dGVuc2lvbiAodXNlZnVsIGZvciB0ZXN0aW5nKVxuICAgKi9cbiAgcmVtb3ZlRXh0ZW5zaW9uKGV4dGVuc2lvbikge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fZXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbik7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuX2V4dGVuc2lvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH0sXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIGEgcHJvdG90eXBlIG1ldGhvZFxuICAgKi9cbiAgcmVtb3ZlUHJvdG90eXBlTWV0aG9kKG5hbWUpIHtcbiAgICB0aGlzLl9wcm90b3R5cGVNZXRob2RzLmRlbGV0ZShuYW1lKTtcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzdGF0aWMgbWV0aG9kXG4gICAqL1xuICByZW1vdmVTdGF0aWNNZXRob2QobmFtZSkge1xuICAgIHRoaXMuX3N0YXRpY01ldGhvZHMuZGVsZXRlKG5hbWUpO1xuICB9LFxuICBcbiAgLyoqXG4gICAqIENsZWFyIGFsbCBleHRlbnNpb25zICh1c2VmdWwgZm9yIHRlc3RpbmcpXG4gICAqL1xuICBjbGVhckV4dGVuc2lvbnMoKSB7XG4gICAgdGhpcy5fZXh0ZW5zaW9ucy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX3Byb3RvdHlwZU1ldGhvZHMuY2xlYXIoKTtcbiAgICB0aGlzLl9zdGF0aWNNZXRob2RzLmNsZWFyKCk7XG4gIH0sXG4gIFxuICAvKipcbiAgICogR2V0IGFsbCByZWdpc3RlcmVkIGV4dGVuc2lvbnMgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuICAgKi9cbiAgZ2V0RXh0ZW5zaW9ucygpIHtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V4dGVuc2lvbnNdO1xuICB9LFxuICBcbiAgLyoqXG4gICAqIEdldCBhbGwgcmVnaXN0ZXJlZCBwcm90b3R5cGUgbWV0aG9kcyAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBnZXRQcm90b3R5cGVNZXRob2RzKCkge1xuICAgIHJldHVybiBuZXcgTWFwKHRoaXMuX3Byb3RvdHlwZU1ldGhvZHMpO1xuICB9LFxuICBcbiAgLyoqXG4gICAqIEdldCBhbGwgcmVnaXN0ZXJlZCBzdGF0aWMgbWV0aG9kcyAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBnZXRTdGF0aWNNZXRob2RzKCkge1xuICAgIHJldHVybiBuZXcgTWFwKHRoaXMuX3N0YXRpY01ldGhvZHMpO1xuICB9LFxuICBcblxuICBcbiAgLyoqXG4gICAqIEFwcGx5IGFsbCBleHRlbnNpb25zIHRvIGEgY29sbGVjdGlvbiBpbnN0YW5jZVxuICAgKiBDYWxsZWQgZHVyaW5nIGNvbGxlY3Rpb24gY29uc3RydWN0aW9uXG4gICAqL1xuICBfYXBwbHlFeHRlbnNpb25zKGluc3RhbmNlLCBuYW1lLCBvcHRpb25zKSB7XG4gICAgLy8gQXBwbHkgY29uc3RydWN0b3IgZXh0ZW5zaW9uc1xuICAgIGZvciAoY29uc3QgZXh0ZW5zaW9uIG9mIHRoaXMuX2V4dGVuc2lvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGV4dGVuc2lvbi5jYWxsKGluc3RhbmNlLCBuYW1lLCBvcHRpb25zKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIFByb3ZpZGUgaGVscGZ1bCBlcnJvciBjb250ZXh0XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0ZW5zaW9uIGZhaWxlZCBmb3IgY29sbGVjdGlvbiAnJHtuYW1lfSc6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gQXBwbHkgcHJvdG90eXBlIG1ldGhvZHNcbiAgICBmb3IgKGNvbnN0IFttZXRob2ROYW1lLCBtZXRob2RdIG9mIHRoaXMuX3Byb3RvdHlwZU1ldGhvZHMpIHtcbiAgICAgIGluc3RhbmNlW21ldGhvZE5hbWVdID0gbWV0aG9kLmJpbmQoaW5zdGFuY2UpO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBBcHBseSBzdGF0aWMgbWV0aG9kcyB0byB0aGUgTW9uZ28uQ29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgKiBDYWxsZWQgZHVyaW5nIHBhY2thZ2UgaW5pdGlhbGl6YXRpb25cbiAgICovXG4gIF9hcHBseVN0YXRpY01ldGhvZHMoQ29sbGVjdGlvbkNvbnN0cnVjdG9yKSB7XG4gICAgZm9yIChjb25zdCBbbWV0aG9kTmFtZSwgbWV0aG9kXSBvZiB0aGlzLl9zdGF0aWNNZXRob2RzKSB7XG4gICAgICBDb2xsZWN0aW9uQ29uc3RydWN0b3JbbWV0aG9kTmFtZV0gPSBtZXRob2Q7XG4gICAgfVxuICB9LFxuICBcblxufTsgIiwiaW1wb3J0IHsgbm9ybWFsaXplUHJvamVjdGlvbiB9IGZyb20gXCIuLi9tb25nb191dGlsc1wiO1xuaW1wb3J0IHsgQXN5bmNNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX2FzeW5jJztcbmltcG9ydCB7IFN5bmNNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX3N5bmMnO1xuaW1wb3J0IHsgSW5kZXhNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX2luZGV4JztcbmltcG9ydCB7XG4gIElEX0dFTkVSQVRPUlMsXG4gIG5vcm1hbGl6ZU9wdGlvbnMsXG4gIHNldHVwQXV0b3B1Ymxpc2gsXG4gIHNldHVwQ29ubmVjdGlvbixcbiAgc2V0dXBEcml2ZXIsXG4gIHNldHVwTXV0YXRpb25NZXRob2RzLFxuICB2YWxpZGF0ZUNvbGxlY3Rpb25OYW1lXG59IGZyb20gJy4vY29sbGVjdGlvbl91dGlscyc7XG5pbXBvcnQgeyBSZXBsaWNhdGlvbk1ldGhvZHMgfSBmcm9tICcuL21ldGhvZHNfcmVwbGljYXRpb24nO1xuXG4vKipcbiAqIEBzdW1tYXJ5IE5hbWVzcGFjZSBmb3IgTW9uZ29EQi1yZWxhdGVkIGl0ZW1zXG4gKiBAbmFtZXNwYWNlXG4gKi9cbk1vbmdvID0ge307XG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0b3IgZm9yIGEgQ29sbGVjdGlvblxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAaW5zdGFuY2VuYW1lIGNvbGxlY3Rpb25cbiAqIEBjbGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvbGxlY3Rpb24uICBJZiBudWxsLCBjcmVhdGVzIGFuIHVubWFuYWdlZCAodW5zeW5jaHJvbml6ZWQpIGxvY2FsIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5jb25uZWN0aW9uIFRoZSBzZXJ2ZXIgY29ubmVjdGlvbiB0aGF0IHdpbGwgbWFuYWdlIHRoaXMgY29sbGVjdGlvbi4gVXNlcyB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIGlmIG5vdCBzcGVjaWZpZWQuICBQYXNzIHRoZSByZXR1cm4gdmFsdWUgb2YgY2FsbGluZyBbYEREUC5jb25uZWN0YF0oI0REUC1jb25uZWN0KSB0byBzcGVjaWZ5IGEgZGlmZmVyZW50IHNlcnZlci4gUGFzcyBgbnVsbGAgdG8gc3BlY2lmeSBubyBjb25uZWN0aW9uLiBVbm1hbmFnZWQgKGBuYW1lYCBpcyBudWxsKSBjb2xsZWN0aW9ucyBjYW5ub3Qgc3BlY2lmeSBhIGNvbm5lY3Rpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5pZEdlbmVyYXRpb24gVGhlIG1ldGhvZCBvZiBnZW5lcmF0aW5nIHRoZSBgX2lkYCBmaWVsZHMgb2YgbmV3IGRvY3VtZW50cyBpbiB0aGlzIGNvbGxlY3Rpb24uICBQb3NzaWJsZSB2YWx1ZXM6XG5cbiAtICoqYCdTVFJJTkcnYCoqOiByYW5kb20gc3RyaW5nc1xuIC0gKipgJ01PTkdPJ2AqKjogIHJhbmRvbSBbYE1vbmdvLk9iamVjdElEYF0oI21vbmdvX29iamVjdF9pZCkgdmFsdWVzXG5cblRoZSBkZWZhdWx0IGlkIGdlbmVyYXRpb24gdGVjaG5pcXVlIGlzIGAnU1RSSU5HJ2AuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRyYW5zZm9ybSBBbiBvcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbi4gRG9jdW1lbnRzIHdpbGwgYmUgcGFzc2VkIHRocm91Z2ggdGhpcyBmdW5jdGlvbiBiZWZvcmUgYmVpbmcgcmV0dXJuZWQgZnJvbSBgZmV0Y2hgIG9yIGBmaW5kT25lQXN5bmNgLCBhbmQgYmVmb3JlIGJlaW5nIHBhc3NlZCB0byBjYWxsYmFja3Mgb2YgYG9ic2VydmVgLCBgbWFwYCwgYGZvckVhY2hgLCBgYWxsb3dgLCBhbmQgYGRlbnlgLiBUcmFuc2Zvcm1zIGFyZSAqbm90KiBhcHBsaWVkIGZvciB0aGUgY2FsbGJhY2tzIG9mIGBvYnNlcnZlQ2hhbmdlc2Agb3IgdG8gY3Vyc29ycyByZXR1cm5lZCBmcm9tIHB1Ymxpc2ggZnVuY3Rpb25zLlxuICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmRlZmluZU11dGF0aW9uTWV0aG9kcyBTZXQgdG8gYGZhbHNlYCB0byBza2lwIHNldHRpbmcgdXAgdGhlIG11dGF0aW9uIG1ldGhvZHMgdGhhdCBlbmFibGUgaW5zZXJ0L3VwZGF0ZS9yZW1vdmUgZnJvbSBjbGllbnQgY29kZS4gRGVmYXVsdCBgdHJ1ZWAuXG4gKi9cbi8vIE1haW4gQ29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuTW9uZ28uQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIENvbGxlY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICBuYW1lID0gdmFsaWRhdGVDb2xsZWN0aW9uTmFtZShuYW1lKTtcblxuICBvcHRpb25zID0gbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKTtcblxuICB0aGlzLl9tYWtlTmV3SUQgPSBJRF9HRU5FUkFUT1JTW29wdGlvbnMuaWRHZW5lcmF0aW9uXT8uKG5hbWUpO1xuXG4gIHRoaXMuX3RyYW5zZm9ybSA9IExvY2FsQ29sbGVjdGlvbi53cmFwVHJhbnNmb3JtKG9wdGlvbnMudHJhbnNmb3JtKTtcbiAgdGhpcy5yZXNvbHZlclR5cGUgPSBvcHRpb25zLnJlc29sdmVyVHlwZTtcblxuICB0aGlzLl9jb25uZWN0aW9uID0gc2V0dXBDb25uZWN0aW9uKG5hbWUsIG9wdGlvbnMpO1xuXG4gIGNvbnN0IGRyaXZlciA9IHNldHVwRHJpdmVyKG5hbWUsIHRoaXMuX2Nvbm5lY3Rpb24sIG9wdGlvbnMpO1xuICB0aGlzLl9kcml2ZXIgPSBkcml2ZXI7XG5cbiAgdGhpcy5fY29sbGVjdGlvbiA9IGRyaXZlci5vcGVuKG5hbWUsIHRoaXMuX2Nvbm5lY3Rpb24pO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcblxuICB0aGlzLl9zZXR0aW5nVXBSZXBsaWNhdGlvblByb21pc2UgPSB0aGlzLl9tYXliZVNldFVwUmVwbGljYXRpb24obmFtZSwgb3B0aW9ucyk7XG5cbiAgc2V0dXBNdXRhdGlvbk1ldGhvZHModGhpcywgbmFtZSwgb3B0aW9ucyk7XG5cbiAgc2V0dXBBdXRvcHVibGlzaCh0aGlzLCBuYW1lLCBvcHRpb25zKTtcblxuICBNb25nby5fY29sbGVjdGlvbnMuc2V0KG5hbWUsIHRoaXMpO1xuICBcbiAgLy8gQXBwbHkgY29sbGVjdGlvbiBleHRlbnNpb25zXG4gIENvbGxlY3Rpb25FeHRlbnNpb25zLl9hcHBseUV4dGVuc2lvbnModGhpcywgbmFtZSwgb3B0aW9ucyk7XG59O1xuXG4vLyBBcHBseSBzdGF0aWMgbWV0aG9kcyB0byB0aGUgQ29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuQ29sbGVjdGlvbkV4dGVuc2lvbnMuX2FwcGx5U3RhdGljTWV0aG9kcyhNb25nby5Db2xsZWN0aW9uKTtcblxuXG5PYmplY3QuYXNzaWduKE1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLCB7XG4gIF9nZXRGaW5kU2VsZWN0b3IoYXJncykge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PSAwKSByZXR1cm4ge307XG4gICAgZWxzZSByZXR1cm4gYXJnc1swXTtcbiAgfSxcblxuICBfZ2V0RmluZE9wdGlvbnMoYXJncykge1xuICAgIGNvbnN0IFssIG9wdGlvbnNdID0gYXJncyB8fCBbXTtcbiAgICBjb25zdCBuZXdPcHRpb25zID0gbm9ybWFsaXplUHJvamVjdGlvbihvcHRpb25zKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoYXJncy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4geyB0cmFuc2Zvcm06IHNlbGYuX3RyYW5zZm9ybSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGVjayhcbiAgICAgICAgbmV3T3B0aW9ucyxcbiAgICAgICAgTWF0Y2guT3B0aW9uYWwoXG4gICAgICAgICAgTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHtcbiAgICAgICAgICAgIHByb2plY3Rpb246IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKE9iamVjdCwgdW5kZWZpbmVkKSksXG4gICAgICAgICAgICBzb3J0OiBNYXRjaC5PcHRpb25hbChcbiAgICAgICAgICAgICAgTWF0Y2guT25lT2YoT2JqZWN0LCBBcnJheSwgRnVuY3Rpb24sIHVuZGVmaW5lZClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBsaW1pdDogTWF0Y2guT3B0aW9uYWwoTWF0Y2guT25lT2YoTnVtYmVyLCB1bmRlZmluZWQpKSxcbiAgICAgICAgICAgIHNraXA6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKE51bWJlciwgdW5kZWZpbmVkKSksXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNmb3JtOiBzZWxmLl90cmFuc2Zvcm0sXG4gICAgICAgIC4uLm5ld09wdGlvbnMsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcbn0pO1xuXG5PYmplY3QuYXNzaWduKE1vbmdvLkNvbGxlY3Rpb24sIHtcbiAgYXN5bmMgX3B1Ymxpc2hDdXJzb3IoY3Vyc29yLCBzdWIsIGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgb2JzZXJ2ZUhhbmRsZSA9IGF3YWl0IGN1cnNvci5vYnNlcnZlQ2hhbmdlcyhcbiAgICAgICAge1xuICAgICAgICAgIGFkZGVkOiBmdW5jdGlvbihpZCwgZmllbGRzKSB7XG4gICAgICAgICAgICBzdWIuYWRkZWQoY29sbGVjdGlvbiwgaWQsIGZpZWxkcyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaGFuZ2VkOiBmdW5jdGlvbihpZCwgZmllbGRzKSB7XG4gICAgICAgICAgICBzdWIuY2hhbmdlZChjb2xsZWN0aW9uLCBpZCwgZmllbGRzKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBzdWIucmVtb3ZlZChjb2xsZWN0aW9uLCBpZCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gUHVibGljYXRpb25zIGRvbid0IG11dGF0ZSB0aGUgZG9jdW1lbnRzXG4gICAgICAgIC8vIFRoaXMgaXMgdGVzdGVkIGJ5IHRoZSBgbGl2ZWRhdGEgLSBwdWJsaXNoIGNhbGxiYWNrcyBjbG9uZWAgdGVzdFxuICAgICAgICB7IG5vbk11dGF0aW5nQ2FsbGJhY2tzOiB0cnVlIH1cbiAgICApO1xuXG4gICAgLy8gV2UgZG9uJ3QgY2FsbCBzdWIucmVhZHkoKSBoZXJlOiBpdCBnZXRzIGNhbGxlZCBpbiBsaXZlZGF0YV9zZXJ2ZXIsIGFmdGVyXG4gICAgLy8gcG9zc2libHkgY2FsbGluZyBfcHVibGlzaEN1cnNvciBvbiBtdWx0aXBsZSByZXR1cm5lZCBjdXJzb3JzLlxuXG4gICAgLy8gcmVnaXN0ZXIgc3RvcCBjYWxsYmFjayAoZXhwZWN0cyBsYW1iZGEgdy8gbm8gYXJncykuXG4gICAgc3ViLm9uU3RvcChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhd2FpdCBvYnNlcnZlSGFuZGxlLnN0b3AoKTtcbiAgICB9KTtcblxuICAgIC8vIHJldHVybiB0aGUgb2JzZXJ2ZUhhbmRsZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHN0b3BwZWQgZWFybHlcbiAgICByZXR1cm4gb2JzZXJ2ZUhhbmRsZTtcbiAgfSxcblxuICAvLyBwcm90ZWN0IGFnYWluc3QgZGFuZ2Vyb3VzIHNlbGVjdG9ycy4gIGZhbHNleSBhbmQge19pZDogZmFsc2V5fSBhcmUgYm90aFxuICAvLyBsaWtlbHkgcHJvZ3JhbW1lciBlcnJvciwgYW5kIG5vdCB3aGF0IHlvdSB3YW50LCBwYXJ0aWN1bGFybHkgZm9yIGRlc3RydWN0aXZlXG4gIC8vIG9wZXJhdGlvbnMuIElmIGEgZmFsc2V5IF9pZCBpcyBzZW50IGluLCBhIG5ldyBzdHJpbmcgX2lkIHdpbGwgYmVcbiAgLy8gZ2VuZXJhdGVkIGFuZCByZXR1cm5lZDsgaWYgYSBmYWxsYmFja0lkIGlzIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHJldHVybmVkXG4gIC8vIGluc3RlYWQuXG4gIF9yZXdyaXRlU2VsZWN0b3Ioc2VsZWN0b3IsIHsgZmFsbGJhY2tJZCB9ID0ge30pIHtcbiAgICAvLyBzaG9ydGhhbmQgLS0gc2NhbGFycyBtYXRjaCBfaWRcbiAgICBpZiAoTG9jYWxDb2xsZWN0aW9uLl9zZWxlY3RvcklzSWQoc2VsZWN0b3IpKSBzZWxlY3RvciA9IHsgX2lkOiBzZWxlY3RvciB9O1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IpKSB7XG4gICAgICAvLyBUaGlzIGlzIGNvbnNpc3RlbnQgd2l0aCB0aGUgTW9uZ28gY29uc29sZSBpdHNlbGY7IGlmIHdlIGRvbid0IGRvIHRoaXNcbiAgICAgIC8vIGNoZWNrIHBhc3NpbmcgYW4gZW1wdHkgYXJyYXkgZW5kcyB1cCBzZWxlY3RpbmcgYWxsIGl0ZW1zXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNb25nbyBzZWxlY3RvciBjYW4ndCBiZSBhbiBhcnJheS5cIik7XG4gICAgfVxuXG4gICAgaWYgKCFzZWxlY3RvciB8fCAoJ19pZCcgaW4gc2VsZWN0b3IgJiYgIXNlbGVjdG9yLl9pZCkpIHtcbiAgICAgIC8vIGNhbid0IG1hdGNoIGFueXRoaW5nXG4gICAgICByZXR1cm4geyBfaWQ6IGZhbGxiYWNrSWQgfHwgUmFuZG9tLmlkKCkgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH0sXG5cbiAgLy8gQ29sbGVjdGlvbiBFeHRlbnNpb25zIEFQSSAtIGRlbGVnYXRlIHRvIENvbGxlY3Rpb25FeHRlbnNpb25zXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBZGQgYSBjb25zdHJ1Y3RvciBleHRlbnNpb24gZnVuY3Rpb24gdGhhdCBydW5zIHdoZW4gY29sbGVjdGlvbnMgYXJlIGNyZWF0ZWQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGV4dGVuc2lvbiBFeHRlbnNpb24gZnVuY3Rpb24gY2FsbGVkIHdpdGggKG5hbWUsIG9wdGlvbnMpIGFuZCAndGhpcycgYm91bmQgdG8gY29sbGVjdGlvbiBpbnN0YW5jZVxuICAgKi9cbiAgYWRkRXh0ZW5zaW9uKGV4dGVuc2lvbikge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5hZGRFeHRlbnNpb24oZXh0ZW5zaW9uKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQWRkIGEgcHJvdG90eXBlIG1ldGhvZCB0byBhbGwgY29sbGVjdGlvbiBpbnN0YW5jZXMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gYWRkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCBUaGUgbWV0aG9kIGZ1bmN0aW9uLCBib3VuZCB0byB0aGUgY29sbGVjdGlvbiBpbnN0YW5jZVxuICAgKi9cbiAgYWRkUHJvdG90eXBlTWV0aG9kKG5hbWUsIG1ldGhvZCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5hZGRQcm90b3R5cGVNZXRob2QobmFtZSwgbWV0aG9kKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQWRkIGEgc3RhdGljIG1ldGhvZCB0byB0aGUgTW9uZ28uQ29sbGVjdGlvbiBjb25zdHJ1Y3Rvci5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0YXRpYyBtZXRob2QgdG8gYWRkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCBUaGUgc3RhdGljIG1ldGhvZCBmdW5jdGlvblxuICAgKi9cbiAgYWRkU3RhdGljTWV0aG9kKG5hbWUsIG1ldGhvZCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5hZGRTdGF0aWNNZXRob2QobmFtZSwgbWV0aG9kKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVtb3ZlIGEgY29uc3RydWN0b3IgZXh0ZW5zaW9uICh1c2VmdWwgZm9yIHRlc3RpbmcpLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBleHRlbnNpb24gVGhlIGV4dGVuc2lvbiBmdW5jdGlvbiB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUV4dGVuc2lvbihleHRlbnNpb24pIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbkV4dGVuc2lvbnMucmVtb3ZlRXh0ZW5zaW9uKGV4dGVuc2lvbik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBhIHByb3RvdHlwZSBtZXRob2QgZnJvbSBhbGwgY29sbGVjdGlvbiBpbnN0YW5jZXMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVQcm90b3R5cGVNZXRob2QobmFtZSkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5yZW1vdmVQcm90b3R5cGVNZXRob2QobmFtZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBhIHN0YXRpYyBtZXRob2QgZnJvbSB0aGUgTW9uZ28uQ29sbGVjdGlvbiBjb25zdHJ1Y3Rvci5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHN0YXRpYyBtZXRob2QgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVTdGF0aWNNZXRob2QobmFtZSkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5yZW1vdmVTdGF0aWNNZXRob2QobmFtZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENsZWFyIGFsbCBleHRlbnNpb25zLCBwcm90b3R5cGUgbWV0aG9kcywgYW5kIHN0YXRpYyBtZXRob2RzICh1c2VmdWwgZm9yIHRlc3RpbmcpLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY2xlYXJFeHRlbnNpb25zKCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5jbGVhckV4dGVuc2lvbnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0IGFsbCByZWdpc3RlcmVkIGNvbnN0cnVjdG9yIGV4dGVuc2lvbnMgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBzdGF0aWNcbiAgICogQHJldHVybnMge0FycmF5PEZ1bmN0aW9uPn0gQXJyYXkgb2YgcmVnaXN0ZXJlZCBleHRlbnNpb24gZnVuY3Rpb25zXG4gICAqL1xuICBnZXRFeHRlbnNpb25zKCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uRXh0ZW5zaW9ucy5nZXRFeHRlbnNpb25zKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldCBhbGwgcmVnaXN0ZXJlZCBwcm90b3R5cGUgbWV0aG9kcyAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQHN0YXRpY1xuICAgKiBAcmV0dXJucyB7TWFwPFN0cmluZywgRnVuY3Rpb24+fSBNYXAgb2YgbWV0aG9kIG5hbWVzIHRvIGZ1bmN0aW9uc1xuICAgKi9cbiAgZ2V0UHJvdG90eXBlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbkV4dGVuc2lvbnMuZ2V0UHJvdG90eXBlTWV0aG9kcygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXQgYWxsIHJlZ2lzdGVyZWQgc3RhdGljIG1ldGhvZHMgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBzdGF0aWNcbiAgICogQHJldHVybnMge01hcDxTdHJpbmcsIEZ1bmN0aW9uPn0gTWFwIG9mIG1ldGhvZCBuYW1lcyB0byBmdW5jdGlvbnNcbiAgICovXG4gIGdldFN0YXRpY01ldGhvZHMoKSB7XG4gICAgcmV0dXJuIENvbGxlY3Rpb25FeHRlbnNpb25zLmdldFN0YXRpY01ldGhvZHMoKTtcbiAgfVxufSk7XG5cbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUsIFJlcGxpY2F0aW9uTWV0aG9kcywgU3luY01ldGhvZHMsIEFzeW5jTWV0aG9kcywgSW5kZXhNZXRob2RzKTtcblxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZSwge1xuICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBjb2xsZWN0aW9uIGlzIHNpbXBseSBhIG1pbmltb25nbyByZXByZXNlbnRhdGlvbiBvZiBhIHJlYWxcbiAgLy8gZGF0YWJhc2Ugb24gYW5vdGhlciBzZXJ2ZXJcbiAgX2lzUmVtb3RlQ29sbGVjdGlvbigpIHtcbiAgICAvLyBYWFggc2VlICNNZXRlb3JTZXJ2ZXJOdWxsXG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24gJiYgdGhpcy5fY29ubmVjdGlvbiAhPT0gTWV0ZW9yLnNlcnZlcjtcbiAgfSxcblxuICBhc3luYyBkcm9wQ29sbGVjdGlvbkFzeW5jKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uZHJvcENvbGxlY3Rpb25Bc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBkcm9wQ29sbGVjdGlvbkFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5kcm9wQ29sbGVjdGlvbkFzeW5jKCk7XG4gIH0sXG5cbiAgYXN5bmMgY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jKGJ5dGVTaXplLCBtYXhEb2N1bWVudHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCEgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdDYW4gb25seSBjYWxsIGNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnXG4gICAgICApO1xuICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jKGJ5dGVTaXplLCBtYXhEb2N1bWVudHMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSBbYENvbGxlY3Rpb25gXShodHRwOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS8zLjAvYXBpL0NvbGxlY3Rpb24uaHRtbCkgb2JqZWN0IGNvcnJlc3BvbmRpbmcgdG8gdGhpcyBjb2xsZWN0aW9uIGZyb20gdGhlIFtucG0gYG1vbmdvZGJgIGRyaXZlciBtb2R1bGVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21vbmdvZGIpIHdoaWNoIGlzIHdyYXBwZWQgYnkgYE1vbmdvLkNvbGxlY3Rpb25gLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgcmF3Q29sbGVjdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLnJhd0NvbGxlY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCByYXdDb2xsZWN0aW9uIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZi5fY29sbGVjdGlvbi5yYXdDb2xsZWN0aW9uKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIFtgRGJgXShodHRwOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS8zLjAvYXBpL0RiLmh0bWwpIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIHRoaXMgY29sbGVjdGlvbidzIGRhdGFiYXNlIGNvbm5lY3Rpb24gZnJvbSB0aGUgW25wbSBgbW9uZ29kYmAgZHJpdmVyIG1vZHVsZV0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbW9uZ29kYikgd2hpY2ggaXMgd3JhcHBlZCBieSBgTW9uZ28uQ29sbGVjdGlvbmAuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICByYXdEYXRhYmFzZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCEoc2VsZi5fZHJpdmVyLm1vbmdvICYmIHNlbGYuX2RyaXZlci5tb25nby5kYikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCByYXdEYXRhYmFzZSBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX2RyaXZlci5tb25nby5kYjtcbiAgfSxcbn0pO1xuXG5PYmplY3QuYXNzaWduKE1vbmdvLCB7XG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZXRyaWV2ZSBhIE1ldGVvciBjb2xsZWN0aW9uIGluc3RhbmNlIGJ5IG5hbWUuIE9ubHkgY29sbGVjdGlvbnMgZGVmaW5lZCB3aXRoIFtgbmV3IE1vbmdvLkNvbGxlY3Rpb24oLi4uKWBdKCNjb2xsZWN0aW9ucykgYXJlIGF2YWlsYWJsZSB3aXRoIHRoaXMgbWV0aG9kLiBGb3IgcGxhaW4gTW9uZ29EQiBjb2xsZWN0aW9ucywgeW91J2xsIHdhbnQgdG8gbG9vayBhdCBbYHJhd0RhdGFiYXNlKClgXSgjTW9uZ28tQ29sbGVjdGlvbi1yYXdEYXRhYmFzZSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyb2YgTW9uZ29cbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIG9mIHlvdXIgY29sbGVjdGlvbiBhcyBpdCB3YXMgZGVmaW5lZCB3aXRoIGBuZXcgTW9uZ28uQ29sbGVjdGlvbigpYC5cbiAgICogQHJldHVybnMge01vbmdvLkNvbGxlY3Rpb24gfCB1bmRlZmluZWR9XG4gICAqL1xuICBnZXRDb2xsZWN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnMuZ2V0KG5hbWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBIHJlY29yZCBvZiBhbGwgZGVmaW5lZCBNb25nby5Db2xsZWN0aW9uIGluc3RhbmNlcywgaW5kZXhlZCBieSBjb2xsZWN0aW9uIG5hbWUuXG4gICAqIEB0eXBlIHtNYXA8c3RyaW5nLCBNb25nby5Db2xsZWN0aW9uPn1cbiAgICogQG1lbWJlcm9mIE1vbmdvXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIF9jb2xsZWN0aW9uczogbmV3IE1hcCgpLFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDb2xsZWN0aW9uIEV4dGVuc2lvbnMgQVBJXG4gICAqIEBtZW1iZXJvZiBNb25nb1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBDb2xsZWN0aW9uRXh0ZW5zaW9uczogQ29sbGVjdGlvbkV4dGVuc2lvbnNcbn0pXG5cblxuXG4vKipcbiAqIEBzdW1tYXJ5IENyZWF0ZSBhIE1vbmdvLXN0eWxlIGBPYmplY3RJRGAuICBJZiB5b3UgZG9uJ3Qgc3BlY2lmeSBhIGBoZXhTdHJpbmdgLCB0aGUgYE9iamVjdElEYCB3aWxsIGJlIGdlbmVyYXRlZCByYW5kb21seSAobm90IHVzaW5nIE1vbmdvREIncyBJRCBjb25zdHJ1Y3Rpb24gcnVsZXMpLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7U3RyaW5nfSBbaGV4U3RyaW5nXSBPcHRpb25hbC4gIFRoZSAyNC1jaGFyYWN0ZXIgaGV4YWRlY2ltYWwgY29udGVudHMgb2YgdGhlIE9iamVjdElEIHRvIGNyZWF0ZVxuICovXG5Nb25nby5PYmplY3RJRCA9IE1vbmdvSUQuT2JqZWN0SUQ7XG5cbi8qKlxuICogQHN1bW1hcnkgVG8gY3JlYXRlIGEgY3Vyc29yLCB1c2UgZmluZC4gVG8gYWNjZXNzIHRoZSBkb2N1bWVudHMgaW4gYSBjdXJzb3IsIHVzZSBmb3JFYWNoLCBtYXAsIG9yIGZldGNoLlxuICogQGNsYXNzXG4gKiBAaW5zdGFuY2VOYW1lIGN1cnNvclxuICovXG5Nb25nby5DdXJzb3IgPSBMb2NhbENvbGxlY3Rpb24uQ3Vyc29yO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluIDAuOS4xXG4gKi9cbk1vbmdvLkNvbGxlY3Rpb24uQ3Vyc29yID0gTW9uZ28uQ3Vyc29yO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluIDAuOS4xXG4gKi9cbk1vbmdvLkNvbGxlY3Rpb24uT2JqZWN0SUQgPSBNb25nby5PYmplY3RJRDtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBpbiAwLjkuMVxuICovXG5NZXRlb3IuQ29sbGVjdGlvbiA9IE1vbmdvLkNvbGxlY3Rpb247XG5cblxuLy8gQWxsb3cgZGVueSBzdHVmZiBpcyBub3cgaW4gdGhlIGFsbG93LWRlbnkgcGFja2FnZVxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZSwgQWxsb3dEZW55LkNvbGxlY3Rpb25Qcm90b3R5cGUpO1xuIiwiZXhwb3J0IGNvbnN0IElEX0dFTkVSQVRPUlMgPSB7XG4gIE1PTkdPKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBzcmMgPSBuYW1lID8gRERQLnJhbmRvbVN0cmVhbSgnL2NvbGxlY3Rpb24vJyArIG5hbWUpIDogUmFuZG9tLmluc2VjdXJlO1xuICAgICAgcmV0dXJuIG5ldyBNb25nby5PYmplY3RJRChzcmMuaGV4U3RyaW5nKDI0KSk7XG4gICAgfVxuICB9LFxuICBTVFJJTkcobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHNyYyA9IG5hbWUgPyBERFAucmFuZG9tU3RyZWFtKCcvY29sbGVjdGlvbi8nICsgbmFtZSkgOiBSYW5kb20uaW5zZWN1cmU7XG4gICAgICByZXR1cm4gc3JjLmlkKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBDb25uZWN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgaWYgKCFuYW1lIHx8IG9wdGlvbnMuY29ubmVjdGlvbiA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGlmIChvcHRpb25zLmNvbm5lY3Rpb24pIHJldHVybiBvcHRpb25zLmNvbm5lY3Rpb247XG4gIHJldHVybiBNZXRlb3IuaXNDbGllbnQgPyBNZXRlb3IuY29ubmVjdGlvbiA6IE1ldGVvci5zZXJ2ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cERyaXZlcihuYW1lLCBjb25uZWN0aW9uLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLl9kcml2ZXIpIHJldHVybiBvcHRpb25zLl9kcml2ZXI7XG5cbiAgaWYgKG5hbWUgJiZcbiAgICBjb25uZWN0aW9uID09PSBNZXRlb3Iuc2VydmVyICYmXG4gICAgdHlwZW9mIE1vbmdvSW50ZXJuYWxzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIE1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKSB7XG4gICAgcmV0dXJuIE1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKCk7XG4gIH1cblxuICBjb25zdCB7IExvY2FsQ29sbGVjdGlvbkRyaXZlciB9ID0gcmVxdWlyZSgnLi4vbG9jYWxfY29sbGVjdGlvbl9kcml2ZXIuanMnKTtcbiAgcmV0dXJuIExvY2FsQ29sbGVjdGlvbkRyaXZlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQXV0b3B1Ymxpc2goY29sbGVjdGlvbiwgbmFtZSwgb3B0aW9ucykge1xuICBpZiAoUGFja2FnZS5hdXRvcHVibGlzaCAmJlxuICAgICFvcHRpb25zLl9wcmV2ZW50QXV0b3B1Ymxpc2ggJiZcbiAgICBjb2xsZWN0aW9uLl9jb25uZWN0aW9uICYmXG4gICAgY29sbGVjdGlvbi5fY29ubmVjdGlvbi5wdWJsaXNoKSB7XG4gICAgY29sbGVjdGlvbi5fY29ubmVjdGlvbi5wdWJsaXNoKG51bGwsICgpID0+IGNvbGxlY3Rpb24uZmluZCgpLCB7XG4gICAgICBpc19hdXRvOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTXV0YXRpb25NZXRob2RzKGNvbGxlY3Rpb24sIG5hbWUsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuZGVmaW5lTXV0YXRpb25NZXRob2RzID09PSBmYWxzZSkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgY29sbGVjdGlvbi5fZGVmaW5lTXV0YXRpb25NZXRob2RzKHtcbiAgICAgIHVzZUV4aXN0aW5nOiBvcHRpb25zLl9zdXBwcmVzc1NhbWVOYW1lRXJyb3IgPT09IHRydWVcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gYEEgbWV0aG9kIG5hbWVkICcvJHtuYW1lfS9pbnNlcnRBc3luYycgaXMgYWxyZWFkeSBkZWZpbmVkYCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBhbHJlYWR5IGEgY29sbGVjdGlvbiBuYW1lZCBcIiR7bmFtZX1cImApO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb2xsZWN0aW9uTmFtZShuYW1lKSB7XG4gIGlmICghbmFtZSAmJiBuYW1lICE9PSBudWxsKSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICAgICdXYXJuaW5nOiBjcmVhdGluZyBhbm9ueW1vdXMgY29sbGVjdGlvbi4gSXQgd2lsbCBub3QgYmUgJyArXG4gICAgICAnc2F2ZWQgb3Igc3luY2hyb25pemVkIG92ZXIgdGhlIG5ldHdvcmsuIChQYXNzIG51bGwgZm9yICcgK1xuICAgICAgJ3RoZSBjb2xsZWN0aW9uIG5hbWUgdG8gdHVybiBvZmYgdGhpcyB3YXJuaW5nLiknXG4gICAgKTtcbiAgICBuYW1lID0gbnVsbDtcbiAgfVxuXG4gIGlmIChuYW1lICE9PSBudWxsICYmIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdGaXJzdCBhcmd1bWVudCB0byBuZXcgTW9uZ28uQ29sbGVjdGlvbiBtdXN0IGJlIGEgc3RyaW5nIG9yIG51bGwnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMubWV0aG9kcykge1xuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGhhY2sgd2l0aCBvcmlnaW5hbCBzaWduYXR1cmVcbiAgICBvcHRpb25zID0geyBjb25uZWN0aW9uOiBvcHRpb25zIH07XG4gIH1cbiAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IFwiY29ubmVjdGlvblwiIHVzZWQgdG8gYmUgY2FsbGVkIFwibWFuYWdlclwiLlxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm1hbmFnZXIgJiYgIW9wdGlvbnMuY29ubmVjdGlvbikge1xuICAgIG9wdGlvbnMuY29ubmVjdGlvbiA9IG9wdGlvbnMubWFuYWdlcjtcbiAgfVxuXG4gIGNvbnN0IGNsZWFuZWRPcHRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMgfHwge30pLmZpbHRlcigoW18sIHZdKSA9PiB2ICE9PSB1bmRlZmluZWQpLFxuICApO1xuXG4gIC8vIDIpIFNwcmVhZCBkZWZhdWx0cyBmaXJzdCwgdGhlbiBvbmx5IHRoZSBkZWZpbmVkIG92ZXJyaWRlc1xuICByZXR1cm4ge1xuICAgIGNvbm5lY3Rpb246IHVuZGVmaW5lZCxcbiAgICBpZEdlbmVyYXRpb246ICdTVFJJTkcnLFxuICAgIHRyYW5zZm9ybTogbnVsbCxcbiAgICBfZHJpdmVyOiB1bmRlZmluZWQsXG4gICAgX3ByZXZlbnRBdXRvcHVibGlzaDogZmFsc2UsXG4gICAgLi4uY2xlYW5lZE9wdGlvbnMsXG4gIH07XG59XG4iLCJleHBvcnQgY29uc3QgQXN5bmNNZXRob2RzID0ge1xuICAvKipcbiAgICogQHN1bW1hcnkgRmluZHMgdGhlIGZpcnN0IGRvY3VtZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IsIGFzIG9yZGVyZWQgYnkgc29ydCBhbmQgc2tpcCBvcHRpb25zLiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50IGlzIGZvdW5kLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBmaW5kT25lQXN5bmNcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IHRydWU7IHBhc3MgZmFsc2UgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgW2BDb2xsZWN0aW9uYF0oI2NvbGxlY3Rpb25zKSBmb3IgdGhpcyBjdXJzb3IuICBQYXNzIGBudWxsYCB0byBkaXNhYmxlIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5yZWFkUHJlZmVyZW5jZSAoU2VydmVyIG9ubHkpIFNwZWNpZmllcyBhIGN1c3RvbSBNb25nb0RCIFtgcmVhZFByZWZlcmVuY2VgXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvcmVhZC1wcmVmZXJlbmNlKSBmb3IgZmV0Y2hpbmcgdGhlIGRvY3VtZW50LiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuY29sbGF0aW9uIFNwZWNpZmllcyBhIFtjb2xsYXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL2NvbGxhdGlvbi8pIGZvciBzdHJpbmcgY29tcGFyaXNvbi4gU2VlIFtgZmluZGBdKCNmaW5kKSBmb3IgZGV0YWlscy5cbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZpbmRPbmVBc3luYyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZmluZE9uZUFzeW5jKFxuICAgICAgdGhpcy5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpLFxuICAgICAgdGhpcy5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgICApO1xuICB9LFxuXG4gIF9pbnNlcnRBc3luYyhkb2MsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSB3ZXJlIHBhc3NlZCBhIGRvY3VtZW50IHRvIGluc2VydFxuICAgIGlmICghZG9jKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luc2VydCByZXF1aXJlcyBhbiBhcmd1bWVudCcpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgYSBzaGFsbG93IGNsb25lIG9mIHRoZSBkb2N1bWVudCwgcHJlc2VydmluZyBpdHMgcHJvdG90eXBlLlxuICAgIGRvYyA9IE9iamVjdC5jcmVhdGUoXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jKSxcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGRvYylcbiAgICApO1xuXG4gICAgaWYgKCdfaWQnIGluIGRvYykge1xuICAgICAgaWYgKFxuICAgICAgICAhZG9jLl9pZCB8fFxuICAgICAgICAhKHR5cGVvZiBkb2MuX2lkID09PSAnc3RyaW5nJyB8fCBkb2MuX2lkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdNZXRlb3IgcmVxdWlyZXMgZG9jdW1lbnQgX2lkIGZpZWxkcyB0byBiZSBub24tZW1wdHkgc3RyaW5ncyBvciBPYmplY3RJRHMnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBnZW5lcmF0ZUlkID0gdHJ1ZTtcblxuICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgdGhlIGlkIGlmIHdlJ3JlIHRoZSBjbGllbnQgYW5kIHRoZSAnb3V0ZXJtb3N0JyBjYWxsXG4gICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBzYXZlcyB1cyBwYXNzaW5nIGJvdGggdGhlIHJhbmRvbVNlZWQgYW5kIHRoZSBpZFxuICAgICAgLy8gUGFzc2luZyBib3RoIGlzIHJlZHVuZGFudC5cbiAgICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgICBjb25zdCBlbmNsb3NpbmcgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpO1xuICAgICAgICBpZiAoIWVuY2xvc2luZykge1xuICAgICAgICAgIGdlbmVyYXRlSWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdGVJZCkge1xuICAgICAgICBkb2MuX2lkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT24gaW5zZXJ0cywgYWx3YXlzIHJldHVybiB0aGUgaWQgdGhhdCB3ZSBnZW5lcmF0ZWQ7IG9uIGFsbCBvdGhlclxuICAgIC8vIG9wZXJhdGlvbnMsIGp1c3QgcmV0dXJuIHRoZSByZXN1bHQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICB2YXIgY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgaWYgKE1ldGVvci5faXNQcm9taXNlKHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG5cbiAgICAgIGlmIChkb2MuX2lkKSB7XG4gICAgICAgIHJldHVybiBkb2MuX2lkO1xuICAgICAgfVxuXG4gICAgICAvLyBYWFggd2hhdCBpcyB0aGlzIGZvcj8/XG4gICAgICAvLyBJdCdzIHNvbWUgaXRlcmFjdGlvbiBiZXR3ZWVuIHRoZSBjYWxsYmFjayB0byBfY2FsbE11dGF0b3JNZXRob2QgYW5kXG4gICAgICAvLyB0aGUgcmV0dXJuIHZhbHVlIGNvbnZlcnNpb25cbiAgICAgIGRvYy5faWQgPSByZXN1bHQ7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ2luc2VydEFzeW5jJywgW2RvY10sIG9wdGlvbnMpO1xuICAgICAgcHJvbWlzZS50aGVuKGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQpO1xuICAgICAgcHJvbWlzZS5zdHViUHJvbWlzZSA9IHByb21pc2Uuc3R1YlByb21pc2UudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgICAgIHByb21pc2Uuc2VydmVyUHJvbWlzZSA9IHByb21pc2Uuc2VydmVyUHJvbWlzZS50aGVuKGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5pbnNlcnRBc3luYyhkb2MpXG4gICAgICAudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgSW5zZXJ0IGEgZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uICBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmV0dXJuIHRoZSBkb2N1bWVudCdzIHVuaXF1ZSBfaWQgd2hlbiBzb2x2ZWQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kICBpbnNlcnRcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgVGhlIGRvY3VtZW50IHRvIGluc2VydC4gTWF5IG5vdCB5ZXQgaGF2ZSBhbiBfaWQgYXR0cmlidXRlLCBpbiB3aGljaCBjYXNlIE1ldGVvciB3aWxsIGdlbmVyYXRlIG9uZSBmb3IgeW91LlxuICAgKi9cbiAgaW5zZXJ0QXN5bmMoZG9jLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydEFzeW5jKGRvYywgb3B0aW9ucyk7XG4gIH0sXG5cblxuICAvKipcbiAgICogQHN1bW1hcnkgTW9kaWZ5IG9uZSBvciBtb3JlIGRvY3VtZW50cyBpbiB0aGUgY29sbGVjdGlvbi4gUmV0dXJucyB0aGUgbnVtYmVyIG9mIG1hdGNoZWQgZG9jdW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCB1cGRhdGVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byBtb2RpZnlcbiAgICogQHBhcmFtIHtNb25nb01vZGlmaWVyfSBtb2RpZmllciBTcGVjaWZpZXMgaG93IHRvIG1vZGlmeSB0aGUgZG9jdW1lbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLm11bHRpIFRydWUgdG8gbW9kaWZ5IGFsbCBtYXRjaGluZyBkb2N1bWVudHM7IGZhbHNlIHRvIG9ubHkgbW9kaWZ5IG9uZSBvZiB0aGUgbWF0Y2hpbmcgZG9jdW1lbnRzICh0aGUgZGVmYXVsdCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51cHNlcnQgVHJ1ZSB0byBpbnNlcnQgYSBkb2N1bWVudCBpZiBubyBtYXRjaGluZyBkb2N1bWVudHMgYXJlIGZvdW5kLlxuICAgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zLmFycmF5RmlsdGVycyBPcHRpb25hbC4gVXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIE1vbmdvREIgW2ZpbHRlcmVkIHBvc2l0aW9uYWwgb3BlcmF0b3JdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL29wZXJhdG9yL3VwZGF0ZS9wb3NpdGlvbmFsLWZpbHRlcmVkLykgdG8gc3BlY2lmeSB3aGljaCBlbGVtZW50cyB0byBtb2RpZnkgaW4gYW4gYXJyYXkgZmllbGQuXG4gICAqL1xuICB1cGRhdGVBc3luYyhzZWxlY3RvciwgbW9kaWZpZXIsIC4uLm9wdGlvbnNBbmRDYWxsYmFjaykge1xuXG4gICAgLy8gV2UndmUgYWxyZWFkeSBwb3BwZWQgb2ZmIHRoZSBjYWxsYmFjaywgc28gd2UgYXJlIGxlZnQgd2l0aCBhbiBhcnJheVxuICAgIC8vIG9mIG9uZSBvciB6ZXJvIGl0ZW1zXG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uKG9wdGlvbnNBbmRDYWxsYmFja1swXSB8fCBudWxsKSB9O1xuICAgIGxldCBpbnNlcnRlZElkO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgICAvLyBzZXQgYGluc2VydGVkSWRgIGlmIGFic2VudC4gIGBpbnNlcnRlZElkYCBpcyBhIE1ldGVvciBleHRlbnNpb24uXG4gICAgICBpZiAob3B0aW9ucy5pbnNlcnRlZElkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKFxuICAgICAgICAgICAgdHlwZW9mIG9wdGlvbnMuaW5zZXJ0ZWRJZCA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgIG9wdGlvbnMuaW5zZXJ0ZWRJZCBpbnN0YW5jZW9mIE1vbmdvLk9iamVjdElEXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNlcnRlZElkIG11c3QgYmUgc3RyaW5nIG9yIE9iamVjdElEJyk7XG4gICAgICAgIGluc2VydGVkSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7XG4gICAgICB9IGVsc2UgaWYgKCFzZWxlY3RvciB8fCAhc2VsZWN0b3IuX2lkKSB7XG4gICAgICAgIGluc2VydGVkSWQgPSB0aGlzLl9tYWtlTmV3SUQoKTtcbiAgICAgICAgb3B0aW9ucy5nZW5lcmF0ZWRJZCA9IHRydWU7XG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0ZWRJZCA9IGluc2VydGVkSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0b3IgPSBNb25nby5Db2xsZWN0aW9uLl9yZXdyaXRlU2VsZWN0b3Ioc2VsZWN0b3IsIHtcbiAgICAgIGZhbGxiYWNrSWQ6IGluc2VydGVkSWQsXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zXTtcblxuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ3VwZGF0ZUFzeW5jJywgYXJncywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhIGNhbGxiYWNrIGFuZCB0aGUgY29sbGVjdGlvbiBpbXBsZW1lbnRzIHRoaXNcbiAgICAvLyBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHksIHRoZW4gcXVlcnlSZXQgd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24udXBkYXRlQXN5bmMoXG4gICAgICBzZWxlY3RvcixcbiAgICAgIG1vZGlmaWVyLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IHJlbW92ZXMgZG9jdW1lbnRzIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIHJlbW92ZVxuICAgKi9cbiAgcmVtb3ZlQXN5bmMoc2VsZWN0b3IsIG9wdGlvbnMgPSB7fSkge1xuICAgIHNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ3JlbW92ZUFzeW5jJywgW3NlbGVjdG9yXSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uMSBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMoc2VsZWN0b3IpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBtb2RpZmllcyBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24sIG9yIGluc2VydCBvbmUgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIHdlcmUgZm91bmQuIFJldHVybnMgYW4gb2JqZWN0IHdpdGgga2V5cyBgbnVtYmVyQWZmZWN0ZWRgICh0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyBtb2RpZmllZCkgIGFuZCBgaW5zZXJ0ZWRJZGAgKHRoZSB1bmlxdWUgX2lkIG9mIHRoZSBkb2N1bWVudCB0aGF0IHdhcyBpbnNlcnRlZCwgaWYgYW55KS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBzZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKi9cbiAgYXN5bmMgdXBzZXJ0QXN5bmMoc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXN5bmMoXG4gICAgICBzZWxlY3RvcixcbiAgICAgIG1vZGlmaWVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBfcmV0dXJuT2JqZWN0OiB0cnVlLFxuICAgICAgICB1cHNlcnQ6IHRydWUsXG4gICAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0cyB0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyBtYXRjaGluZyB0aGUgZmlsdGVyLiBGb3IgYSBmYXN0IGNvdW50IG9mIHRoZSB0b3RhbCBkb2N1bWVudHMgaW4gYSBjb2xsZWN0aW9uIHNlZSBgZXN0aW1hdGVkRG9jdW1lbnRDb3VudGAuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGNvdW50RG9jdW1lbnRzXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IFtzZWxlY3Rvcl0gQSBxdWVyeSBkZXNjcmliaW5nIHRoZSBkb2N1bWVudHMgdG8gY291bnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS80LjExL2ludGVyZmFjZXMvQ291bnREb2N1bWVudHNPcHRpb25zLmh0bWwpLiBQbGVhc2Ugbm90ZSB0aGF0IG5vdCBhbGwgb2YgdGhlbSBhcmUgYXZhaWxhYmxlIG9uIHRoZSBjbGllbnQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59XG4gICAqL1xuICBjb3VudERvY3VtZW50cyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uY291bnREb2N1bWVudHMoLi4uYXJncyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldHMgYW4gZXN0aW1hdGUgb2YgdGhlIGNvdW50IG9mIGRvY3VtZW50cyBpbiBhIGNvbGxlY3Rpb24gdXNpbmcgY29sbGVjdGlvbiBtZXRhZGF0YS4gRm9yIGFuIGV4YWN0IGNvdW50IG9mIHRoZSBkb2N1bWVudHMgaW4gYSBjb2xsZWN0aW9uIHNlZSBgY291bnREb2N1bWVudHNgLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBlc3RpbWF0ZWREb2N1bWVudENvdW50XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEFsbCBvcHRpb25zIGFyZSBsaXN0ZWQgaW4gW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9tb25nb2RiLmdpdGh1Yi5pby9ub2RlLW1vbmdvZGItbmF0aXZlLzQuMTEvaW50ZXJmYWNlcy9Fc3RpbWF0ZWREb2N1bWVudENvdW50T3B0aW9ucy5odG1sKS4gUGxlYXNlIG5vdGUgdGhhdCBub3QgYWxsIG9mIHRoZW0gYXJlIGF2YWlsYWJsZSBvbiB0aGUgY2xpZW50LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxuICAgKi9cbiAgZXN0aW1hdGVkRG9jdW1lbnRDb3VudCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZXN0aW1hdGVkRG9jdW1lbnRDb3VudCguLi5hcmdzKTtcbiAgfSxcbn0iLCJpbXBvcnQgeyBMb2cgfSBmcm9tICdtZXRlb3IvbG9nZ2luZyc7XG5cbmV4cG9ydCBjb25zdCBJbmRleE1ldGhvZHMgPSB7XG4gIC8vIFdlJ2xsIGFjdHVhbGx5IGRlc2lnbiBhbiBpbmRleCBBUEkgbGF0ZXIuIEZvciBub3csIHdlIGp1c3QgcGFzcyB0aHJvdWdoIHRvXG4gIC8vIE1vbmdvJ3MsIGJ1dCBtYWtlIGl0IHN5bmNocm9ub3VzLlxuICAvKipcbiAgICogQHN1bW1hcnkgQXN5bmNocm9ub3VzbHkgY3JlYXRlcyB0aGUgc3BlY2lmaWVkIGluZGV4IG9uIHRoZSBjb2xsZWN0aW9uLlxuICAgKiBAbG9jdXMgc2VydmVyXG4gICAqIEBtZXRob2QgZW5zdXJlSW5kZXhBc3luY1xuICAgKiBAZGVwcmVjYXRlZCBpbiAzLjBcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbmRleCBBIGRvY3VtZW50IHRoYXQgY29udGFpbnMgdGhlIGZpZWxkIGFuZCB2YWx1ZSBwYWlycyB3aGVyZSB0aGUgZmllbGQgaXMgdGhlIGluZGV4IGtleSBhbmQgdGhlIHZhbHVlIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiBpbmRleCBmb3IgdGhhdCBmaWVsZC4gRm9yIGFuIGFzY2VuZGluZyBpbmRleCBvbiBhIGZpZWxkLCBzcGVjaWZ5IGEgdmFsdWUgb2YgYDFgOyBmb3IgZGVzY2VuZGluZyBpbmRleCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAtMWAuIFVzZSBgdGV4dGAgZm9yIHRleHQgaW5kZXhlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL21ldGhvZC9kYi5jb2xsZWN0aW9uLmNyZWF0ZUluZGV4LyNvcHRpb25zKVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5uYW1lIE5hbWUgb2YgdGhlIGluZGV4XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51bmlxdWUgRGVmaW5lIHRoYXQgdGhlIGluZGV4IHZhbHVlcyBtdXN0IGJlIHVuaXF1ZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtdW5pcXVlLylcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnNwYXJzZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggaXMgc3BhcnNlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC1zcGFyc2UvKVxuICAgKi9cbiAgYXN5bmMgZW5zdXJlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uZW5zdXJlSW5kZXhBc3luYyB8fCAhc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVJbmRleEFzeW5jKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gb25seSBjYWxsIGNyZWF0ZUluZGV4QXN5bmMgb24gc2VydmVyIGNvbGxlY3Rpb25zJyk7XG4gICAgaWYgKHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYykge1xuICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTG9nLmRlYnVnKGBlbnN1cmVJbmRleEFzeW5jIGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgdGhlIG5ldyAnY3JlYXRlSW5kZXhBc3luYycgaW5zdGVhZCR7IG9wdGlvbnM/Lm5hbWUgPyBgLCBpbmRleCBuYW1lOiAkeyBvcHRpb25zLm5hbWUgfWAgOiBgLCBpbmRleDogJHsgSlNPTi5zdHJpbmdpZnkoaW5kZXgpIH1gIH1gKVxuICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5lbnN1cmVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IGNyZWF0ZXMgdGhlIHNwZWNpZmllZCBpbmRleCBvbiB0aGUgY29sbGVjdGlvbi5cbiAgICogQGxvY3VzIHNlcnZlclxuICAgKiBAbWV0aG9kIGNyZWF0ZUluZGV4QXN5bmNcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbmRleCBBIGRvY3VtZW50IHRoYXQgY29udGFpbnMgdGhlIGZpZWxkIGFuZCB2YWx1ZSBwYWlycyB3aGVyZSB0aGUgZmllbGQgaXMgdGhlIGluZGV4IGtleSBhbmQgdGhlIHZhbHVlIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiBpbmRleCBmb3IgdGhhdCBmaWVsZC4gRm9yIGFuIGFzY2VuZGluZyBpbmRleCBvbiBhIGZpZWxkLCBzcGVjaWZ5IGEgdmFsdWUgb2YgYDFgOyBmb3IgZGVzY2VuZGluZyBpbmRleCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAtMWAuIFVzZSBgdGV4dGAgZm9yIHRleHQgaW5kZXhlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL21ldGhvZC9kYi5jb2xsZWN0aW9uLmNyZWF0ZUluZGV4LyNvcHRpb25zKVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5uYW1lIE5hbWUgb2YgdGhlIGluZGV4XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51bmlxdWUgRGVmaW5lIHRoYXQgdGhlIGluZGV4IHZhbHVlcyBtdXN0IGJlIHVuaXF1ZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtdW5pcXVlLylcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnNwYXJzZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggaXMgc3BhcnNlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC1zcGFyc2UvKVxuICAgKi9cbiAgYXN5bmMgY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBjcmVhdGVJbmRleEFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKFxuICAgICAgICBlLm1lc3NhZ2UuaW5jbHVkZXMoXG4gICAgICAgICAgJ0FuIGVxdWl2YWxlbnQgaW5kZXggYWxyZWFkeSBleGlzdHMgd2l0aCB0aGUgc2FtZSBuYW1lIGJ1dCBkaWZmZXJlbnQgb3B0aW9ucy4nXG4gICAgICAgICkgJiZcbiAgICAgICAgTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8ubW9uZ28/LnJlQ3JlYXRlSW5kZXhPbk9wdGlvbk1pc21hdGNoXG4gICAgICApIHtcbiAgICAgICAgTG9nLmluZm8oYFJlLWNyZWF0aW5nIGluZGV4ICR7IGluZGV4IH0gZm9yICR7IHNlbGYuX25hbWUgfSBkdWUgdG8gb3B0aW9ucyBtaXNtYXRjaC5gKTtcbiAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5kcm9wSW5kZXhBc3luYyhpbmRleCk7XG4gICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGVuIGNyZWF0aW5nIGFuIGluZGV4IGZvciBjb2xsZWN0aW9uIFwiJHsgc2VsZi5fbmFtZSB9OiAkeyBlLm1lc3NhZ2UgfWApO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQXN5bmNocm9ub3VzbHkgY3JlYXRlcyB0aGUgc3BlY2lmaWVkIGluZGV4IG9uIHRoZSBjb2xsZWN0aW9uLlxuICAgKiBAbG9jdXMgc2VydmVyXG4gICAqIEBtZXRob2QgY3JlYXRlSW5kZXhcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbmRleCBBIGRvY3VtZW50IHRoYXQgY29udGFpbnMgdGhlIGZpZWxkIGFuZCB2YWx1ZSBwYWlycyB3aGVyZSB0aGUgZmllbGQgaXMgdGhlIGluZGV4IGtleSBhbmQgdGhlIHZhbHVlIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiBpbmRleCBmb3IgdGhhdCBmaWVsZC4gRm9yIGFuIGFzY2VuZGluZyBpbmRleCBvbiBhIGZpZWxkLCBzcGVjaWZ5IGEgdmFsdWUgb2YgYDFgOyBmb3IgZGVzY2VuZGluZyBpbmRleCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAtMWAuIFVzZSBgdGV4dGAgZm9yIHRleHQgaW5kZXhlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL21ldGhvZC9kYi5jb2xsZWN0aW9uLmNyZWF0ZUluZGV4LyNvcHRpb25zKVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5uYW1lIE5hbWUgb2YgdGhlIGluZGV4XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51bmlxdWUgRGVmaW5lIHRoYXQgdGhlIGluZGV4IHZhbHVlcyBtdXN0IGJlIHVuaXF1ZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtdW5pcXVlLylcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnNwYXJzZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggaXMgc3BhcnNlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC1zcGFyc2UvKVxuICAgKi9cbiAgY3JlYXRlSW5kZXgoaW5kZXgsIG9wdGlvbnMpe1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpO1xuICB9LFxuXG4gIGFzeW5jIGRyb3BJbmRleEFzeW5jKGluZGV4KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fY29sbGVjdGlvbi5kcm9wSW5kZXhBc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBkcm9wSW5kZXhBc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmRyb3BJbmRleEFzeW5jKGluZGV4KTtcbiAgfSxcbn1cbiIsImV4cG9ydCBjb25zdCBSZXBsaWNhdGlvbk1ldGhvZHMgPSB7XG4gIGFzeW5jIF9tYXliZVNldFVwUmVwbGljYXRpb24obmFtZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChcbiAgICAgICEoXG4gICAgICAgIHNlbGYuX2Nvbm5lY3Rpb24gJiZcbiAgICAgICAgc2VsZi5fY29ubmVjdGlvbi5yZWdpc3RlclN0b3JlQ2xpZW50ICYmXG4gICAgICAgIHNlbGYuX2Nvbm5lY3Rpb24ucmVnaXN0ZXJTdG9yZVNlcnZlclxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgY29uc3Qgd3JhcHBlZFN0b3JlQ29tbW9uID0ge1xuICAgICAgLy8gQ2FsbGVkIGFyb3VuZCBtZXRob2Qgc3R1YiBpbnZvY2F0aW9ucyB0byBjYXB0dXJlIHRoZSBvcmlnaW5hbCB2ZXJzaW9uc1xuICAgICAgLy8gb2YgbW9kaWZpZWQgZG9jdW1lbnRzLlxuICAgICAgc2F2ZU9yaWdpbmFscygpIHtcbiAgICAgICAgc2VsZi5fY29sbGVjdGlvbi5zYXZlT3JpZ2luYWxzKCk7XG4gICAgICB9LFxuICAgICAgcmV0cmlldmVPcmlnaW5hbHMoKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9jb2xsZWN0aW9uLnJldHJpZXZlT3JpZ2luYWxzKCk7XG4gICAgICB9LFxuICAgICAgLy8gVG8gYmUgYWJsZSB0byBnZXQgYmFjayB0byB0aGUgY29sbGVjdGlvbiBmcm9tIHRoZSBzdG9yZS5cbiAgICAgIF9nZXRDb2xsZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG4gICAgfTtcbiAgICBjb25zdCB3cmFwcGVkU3RvcmVDbGllbnQgPSB7XG4gICAgICAvLyBDYWxsZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGJhdGNoIG9mIHVwZGF0ZXMuIGJhdGNoU2l6ZSBpcyB0aGUgbnVtYmVyXG4gICAgICAvLyBvZiB1cGRhdGUgY2FsbHMgdG8gZXhwZWN0LlxuICAgICAgLy9cbiAgICAgIC8vIFhYWCBUaGlzIGludGVyZmFjZSBpcyBwcmV0dHkgamFua3kuIHJlc2V0IHByb2JhYmx5IG91Z2h0IHRvIGdvIGJhY2sgdG9cbiAgICAgIC8vIGJlaW5nIGl0cyBvd24gZnVuY3Rpb24sIGFuZCBjYWxsZXJzIHNob3VsZG4ndCBoYXZlIHRvIGNhbGN1bGF0ZVxuICAgICAgLy8gYmF0Y2hTaXplLiBUaGUgb3B0aW1pemF0aW9uIG9mIG5vdCBjYWxsaW5nIHBhdXNlL3JlbW92ZSBzaG91bGQgYmVcbiAgICAgIC8vIGRlbGF5ZWQgdW50aWwgbGF0ZXI6IHRoZSBmaXJzdCBjYWxsIHRvIHVwZGF0ZSgpIHNob3VsZCBidWZmZXIgaXRzXG4gICAgICAvLyBtZXNzYWdlLCBhbmQgdGhlbiB3ZSBjYW4gZWl0aGVyIGRpcmVjdGx5IGFwcGx5IGl0IGF0IGVuZFVwZGF0ZSB0aW1lIGlmXG4gICAgICAvLyBpdCB3YXMgdGhlIG9ubHkgdXBkYXRlLCBvciBkbyBwYXVzZU9ic2VydmVycy9hcHBseS9hcHBseSBhdCB0aGUgbmV4dFxuICAgICAgLy8gdXBkYXRlKCkgaWYgdGhlcmUncyBhbm90aGVyIG9uZS5cbiAgICAgIGFzeW5jIGJlZ2luVXBkYXRlKGJhdGNoU2l6ZSwgcmVzZXQpIHtcbiAgICAgICAgLy8gcGF1c2Ugb2JzZXJ2ZXJzIHNvIHVzZXJzIGRvbid0IHNlZSBmbGlja2VyIHdoZW4gdXBkYXRpbmcgc2V2ZXJhbFxuICAgICAgICAvLyBvYmplY3RzIGF0IG9uY2UgKGluY2x1ZGluZyB0aGUgcG9zdC1yZWNvbm5lY3QgcmVzZXQtYW5kLXJlYXBwbHlcbiAgICAgICAgLy8gc3RhZ2UpLCBhbmQgc28gdGhhdCBhIHJlLXNvcnRpbmcgb2YgYSBxdWVyeSBjYW4gdGFrZSBhZHZhbnRhZ2Ugb2YgdGhlXG4gICAgICAgIC8vIGZ1bGwgX2RpZmZRdWVyeSBtb3ZlZCBjYWxjdWxhdGlvbiBpbnN0ZWFkIG9mIGFwcGx5aW5nIGNoYW5nZSBvbmUgYXQgYVxuICAgICAgICAvLyB0aW1lLlxuICAgICAgICBpZiAoYmF0Y2hTaXplID4gMSB8fCByZXNldCkgc2VsZi5fY29sbGVjdGlvbi5wYXVzZU9ic2VydmVycygpO1xuXG4gICAgICAgIGlmIChyZXNldCkgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmUoe30pO1xuICAgICAgfSxcblxuICAgICAgLy8gQXBwbHkgYW4gdXBkYXRlLlxuICAgICAgLy8gWFhYIGJldHRlciBzcGVjaWZ5IHRoaXMgaW50ZXJmYWNlIChub3QgaW4gdGVybXMgb2YgYSB3aXJlIG1lc3NhZ2UpP1xuICAgICAgdXBkYXRlKG1zZykge1xuICAgICAgICB2YXIgbW9uZ29JZCA9IE1vbmdvSUQuaWRQYXJzZShtc2cuaWQpO1xuICAgICAgICB2YXIgZG9jID0gc2VsZi5fY29sbGVjdGlvbi5fZG9jcy5nZXQobW9uZ29JZCk7XG5cbiAgICAgICAgLy9XaGVuIHRoZSBzZXJ2ZXIncyBtZXJnZWJveCBpcyBkaXNhYmxlZCBmb3IgYSBjb2xsZWN0aW9uLCB0aGUgY2xpZW50IG11c3QgZ3JhY2VmdWxseSBoYW5kbGUgaXQgd2hlbjpcbiAgICAgICAgLy8gKldlIHJlY2VpdmUgYW4gYWRkZWQgbWVzc2FnZSBmb3IgYSBkb2N1bWVudCB0aGF0IGlzIGFscmVhZHkgdGhlcmUuIEluc3RlYWQsIGl0IHdpbGwgYmUgY2hhbmdlZFxuICAgICAgICAvLyAqV2UgcmVlaXZlIGEgY2hhbmdlIG1lc3NhZ2UgZm9yIGEgZG9jdW1lbnQgdGhhdCBpcyBub3QgdGhlcmUuIEluc3RlYWQsIGl0IHdpbGwgYmUgYWRkZWRcbiAgICAgICAgLy8gKldlIHJlY2VpdmUgYSByZW1vdmVkIG1lc3NzYWdlIGZvciBhIGRvY3VtZW50IHRoYXQgaXMgbm90IHRoZXJlLiBJbnN0ZWFkLCBub3Rpbmcgd2lsIGhhcHBlbi5cblxuICAgICAgICAvL0NvZGUgaXMgZGVyaXZlZCBmcm9tIGNsaWVudC1zaWRlIGNvZGUgb3JpZ2luYWxseSBpbiBwZWVybGlicmFyeTpjb250cm9sLW1lcmdlYm94XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL3BlZXJsaWJyYXJ5L21ldGVvci1jb250cm9sLW1lcmdlYm94L2Jsb2IvbWFzdGVyL2NsaWVudC5jb2ZmZWVcblxuICAgICAgICAvL0ZvciBtb3JlIGluZm9ybWF0aW9uLCByZWZlciB0byBkaXNjdXNzaW9uIFwiSW5pdGlhbCBzdXBwb3J0IGZvciBwdWJsaWNhdGlvbiBzdHJhdGVnaWVzIGluIGxpdmVkYXRhIHNlcnZlclwiOlxuICAgICAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL3B1bGwvMTExNTFcbiAgICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgICAgIGlmIChtc2cubXNnID09PSAnYWRkZWQnICYmIGRvYykge1xuICAgICAgICAgICAgbXNnLm1zZyA9ICdjaGFuZ2VkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdyZW1vdmVkJyAmJiAhZG9jKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAnY2hhbmdlZCcgJiYgIWRvYykge1xuICAgICAgICAgICAgbXNnLm1zZyA9ICdhZGRlZCc7XG4gICAgICAgICAgICBjb25zdCBfcmVmID0gbXNnLmZpZWxkcztcbiAgICAgICAgICAgIGZvciAobGV0IGZpZWxkIGluIF9yZWYpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfcmVmW2ZpZWxkXTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbXNnLmZpZWxkc1tmaWVsZF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSXMgdGhpcyBhIFwicmVwbGFjZSB0aGUgd2hvbGUgZG9jXCIgbWVzc2FnZSBjb21pbmcgZnJvbSB0aGUgcXVpZXNjZW5jZVxuICAgICAgICAvLyBvZiBtZXRob2Qgd3JpdGVzIHRvIGFuIG9iamVjdD8gKE5vdGUgdGhhdCAndW5kZWZpbmVkJyBpcyBhIHZhbGlkXG4gICAgICAgIC8vIHZhbHVlIG1lYW5pbmcgXCJyZW1vdmUgaXRcIi4pXG4gICAgICAgIGlmIChtc2cubXNnID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgICB2YXIgcmVwbGFjZSA9IG1zZy5yZXBsYWNlO1xuICAgICAgICAgIGlmICghcmVwbGFjZSkge1xuICAgICAgICAgICAgaWYgKGRvYykgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmUobW9uZ29JZCk7XG4gICAgICAgICAgfSBlbHNlIGlmICghZG9jKSB7XG4gICAgICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLmluc2VydChyZXBsYWNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gWFhYIGNoZWNrIHRoYXQgcmVwbGFjZSBoYXMgbm8gJCBvcHNcbiAgICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24udXBkYXRlKG1vbmdvSWQsIHJlcGxhY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2FkZGVkJykge1xuICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIG5vdCB0byBmaW5kIGEgZG9jdW1lbnQgYWxyZWFkeSBwcmVzZW50IGZvciBhbiBhZGQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLmluc2VydCh7IF9pZDogbW9uZ29JZCwgLi4ubXNnLmZpZWxkcyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAncmVtb3ZlZCcpIHtcbiAgICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCBhbHJlYWR5IHByZXNlbnQgZm9yIHJlbW92ZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlKG1vbmdvSWQpO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdjaGFuZ2VkJykge1xuICAgICAgICAgIGlmICghZG9jKSB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCB0byBjaGFuZ2UnKTtcbiAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobXNnLmZpZWxkcyk7XG4gICAgICAgICAgaWYgKGtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIG1vZGlmaWVyID0ge307XG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtc2cuZmllbGRzW2tleV07XG4gICAgICAgICAgICAgIGlmIChFSlNPTi5lcXVhbHMoZG9jW2tleV0sIHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGlmICghbW9kaWZpZXIuJHVuc2V0KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllci4kdW5zZXQgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbW9kaWZpZXIuJHVuc2V0W2tleV0gPSAxO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghbW9kaWZpZXIuJHNldCkge1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZXIuJHNldCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllci4kc2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobW9kaWZpZXIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5fY29sbGVjdGlvbi51cGRhdGUobW9uZ29JZCwgbW9kaWZpZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJIGRvbid0IGtub3cgaG93IHRvIGRlYWwgd2l0aCB0aGlzIG1lc3NhZ2VcIik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgYmF0Y2ggb2YgdXBkYXRlcy5saXZlZGF0YV9jb25uZWN0aW9uLmpzOjEyODdcbiAgICAgIGVuZFVwZGF0ZSgpIHtcbiAgICAgICAgc2VsZi5fY29sbGVjdGlvbi5yZXN1bWVPYnNlcnZlcnNDbGllbnQoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFVzZWQgdG8gcHJlc2VydmUgY3VycmVudCB2ZXJzaW9ucyBvZiBkb2N1bWVudHMgYWNyb3NzIGEgc3RvcmUgcmVzZXQuXG4gICAgICBnZXREb2MoaWQpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZmluZE9uZShpZCk7XG4gICAgICB9LFxuXG4gICAgICAuLi53cmFwcGVkU3RvcmVDb21tb24sXG4gICAgfTtcbiAgICBjb25zdCB3cmFwcGVkU3RvcmVTZXJ2ZXIgPSB7XG4gICAgICBhc3luYyBiZWdpblVwZGF0ZShiYXRjaFNpemUsIHJlc2V0KSB7XG4gICAgICAgIGlmIChiYXRjaFNpemUgPiAxIHx8IHJlc2V0KSBzZWxmLl9jb2xsZWN0aW9uLnBhdXNlT2JzZXJ2ZXJzKCk7XG5cbiAgICAgICAgaWYgKHJlc2V0KSBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHt9KTtcbiAgICAgIH0sXG5cbiAgICAgIGFzeW5jIHVwZGF0ZShtc2cpIHtcbiAgICAgICAgdmFyIG1vbmdvSWQgPSBNb25nb0lELmlkUGFyc2UobXNnLmlkKTtcbiAgICAgICAgdmFyIGRvYyA9IHNlbGYuX2NvbGxlY3Rpb24uX2RvY3MuZ2V0KG1vbmdvSWQpO1xuXG4gICAgICAgIC8vIElzIHRoaXMgYSBcInJlcGxhY2UgdGhlIHdob2xlIGRvY1wiIG1lc3NhZ2UgY29taW5nIGZyb20gdGhlIHF1aWVzY2VuY2VcbiAgICAgICAgLy8gb2YgbWV0aG9kIHdyaXRlcyB0byBhbiBvYmplY3Q/IChOb3RlIHRoYXQgJ3VuZGVmaW5lZCcgaXMgYSB2YWxpZFxuICAgICAgICAvLyB2YWx1ZSBtZWFuaW5nIFwicmVtb3ZlIGl0XCIuKVxuICAgICAgICBpZiAobXNnLm1zZyA9PT0gJ3JlcGxhY2UnKSB7XG4gICAgICAgICAgdmFyIHJlcGxhY2UgPSBtc2cucmVwbGFjZTtcbiAgICAgICAgICBpZiAoIXJlcGxhY2UpIHtcbiAgICAgICAgICAgIGlmIChkb2MpIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMobW9uZ29JZCk7XG4gICAgICAgICAgfSBlbHNlIGlmICghZG9jKSB7XG4gICAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmluc2VydEFzeW5jKHJlcGxhY2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBYWFggY2hlY2sgdGhhdCByZXBsYWNlIGhhcyBubyAkIG9wc1xuICAgICAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi51cGRhdGVBc3luYyhtb25nb0lkLCByZXBsYWNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdhZGRlZCcpIHtcbiAgICAgICAgICBpZiAoZG9jKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdFeHBlY3RlZCBub3QgdG8gZmluZCBhIGRvY3VtZW50IGFscmVhZHkgcHJlc2VudCBmb3IgYW4gYWRkJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5pbnNlcnRBc3luYyh7IF9pZDogbW9uZ29JZCwgLi4ubXNnLmZpZWxkcyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAncmVtb3ZlZCcpIHtcbiAgICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCBhbHJlYWR5IHByZXNlbnQgZm9yIHJlbW92ZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMobW9uZ29JZCk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2NoYW5nZWQnKSB7XG4gICAgICAgICAgaWYgKCFkb2MpIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdG8gZmluZCBhIGRvY3VtZW50IHRvIGNoYW5nZScpO1xuICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhtc2cuZmllbGRzKTtcbiAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZXIgPSB7fTtcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1zZy5maWVsZHNba2V5XTtcbiAgICAgICAgICAgICAgaWYgKEVKU09OLmVxdWFscyhkb2Nba2V5XSwgdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kdW5zZXQpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVyLiR1bnNldCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllci4kdW5zZXRba2V5XSA9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kc2V0KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllci4kc2V0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVyLiRzZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhtb2RpZmllcikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnVwZGF0ZUFzeW5jKG1vbmdvSWQsIG1vZGlmaWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSSBkb24ndCBrbm93IGhvdyB0byBkZWFsIHdpdGggdGhpcyBtZXNzYWdlXCIpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBDYWxsZWQgYXQgdGhlIGVuZCBvZiBhIGJhdGNoIG9mIHVwZGF0ZXMuXG4gICAgICBhc3luYyBlbmRVcGRhdGUoKSB7XG4gICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVzdW1lT2JzZXJ2ZXJzU2VydmVyKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBVc2VkIHRvIHByZXNlcnZlIGN1cnJlbnQgdmVyc2lvbnMgb2YgZG9jdW1lbnRzIGFjcm9zcyBhIHN0b3JlIHJlc2V0LlxuICAgICAgYXN5bmMgZ2V0RG9jKGlkKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmZpbmRPbmVBc3luYyhpZCk7XG4gICAgICB9LFxuICAgICAgLi4ud3JhcHBlZFN0b3JlQ29tbW9uLFxuICAgIH07XG5cblxuICAgIC8vIE9LLCB3ZSdyZSBnb2luZyB0byBiZSBhIHNsYXZlLCByZXBsaWNhdGluZyBzb21lIHJlbW90ZVxuICAgIC8vIGRhdGFiYXNlLCBleGNlcHQgcG9zc2libHkgd2l0aCBzb21lIHRlbXBvcmFyeSBkaXZlcmdlbmNlIHdoaWxlXG4gICAgLy8gd2UgaGF2ZSB1bmFja25vd2xlZGdlZCBSUEMncy5cbiAgICBsZXQgcmVnaXN0ZXJTdG9yZVJlc3VsdDtcbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICByZWdpc3RlclN0b3JlUmVzdWx0ID0gc2VsZi5fY29ubmVjdGlvbi5yZWdpc3RlclN0b3JlQ2xpZW50KFxuICAgICAgICBuYW1lLFxuICAgICAgICB3cmFwcGVkU3RvcmVDbGllbnRcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lzdGVyU3RvcmVSZXN1bHQgPSBzZWxmLl9jb25uZWN0aW9uLnJlZ2lzdGVyU3RvcmVTZXJ2ZXIoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHdyYXBwZWRTdG9yZVNlcnZlclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID0gYFRoZXJlIGlzIGFscmVhZHkgYSBjb2xsZWN0aW9uIG5hbWVkIFwiJHtuYW1lfVwiYDtcbiAgICBjb25zdCBsb2dXYXJuID0gKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuID8gY29uc29sZS53YXJuKG1lc3NhZ2UpIDogY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgfTtcblxuICAgIGlmICghcmVnaXN0ZXJTdG9yZVJlc3VsdCkge1xuICAgICAgcmV0dXJuIGxvZ1dhcm4oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVnaXN0ZXJTdG9yZVJlc3VsdD8udGhlbj8uKG9rID0+IHtcbiAgICAgIGlmICghb2spIHtcbiAgICAgICAgbG9nV2FybigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxufSIsImV4cG9ydCBjb25zdCBTeW5jTWV0aG9kcyA9IHtcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEZpbmQgdGhlIGRvY3VtZW50cyBpbiBhIGNvbGxlY3Rpb24gdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3IuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGZpbmRcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5saW1pdCBNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVyblxuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IGB0cnVlYDsgcGFzcyBgZmFsc2VgIHRvIGRpc2FibGUgcmVhY3Rpdml0eVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRyYW5zZm9ybSBPdmVycmlkZXMgYHRyYW5zZm9ybWAgb24gdGhlICBbYENvbGxlY3Rpb25gXSgjY29sbGVjdGlvbnMpIGZvciB0aGlzIGN1cnNvci4gIFBhc3MgYG51bGxgIHRvIGRpc2FibGUgdHJhbnNmb3JtYXRpb24uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kaXNhYmxlT3Bsb2cgKFNlcnZlciBvbmx5KSBQYXNzIHRydWUgdG8gZGlzYWJsZSBvcGxvZy10YWlsaW5nIG9uIHRoaXMgcXVlcnkuIFRoaXMgYWZmZWN0cyB0aGUgd2F5IHNlcnZlciBwcm9jZXNzZXMgY2FsbHMgdG8gYG9ic2VydmVgIG9uIHRoaXMgcXVlcnkuIERpc2FibGluZyB0aGUgb3Bsb2cgY2FuIGJlIHVzZWZ1bCB3aGVuIHdvcmtpbmcgd2l0aCBkYXRhIHRoYXQgdXBkYXRlcyBpbiBsYXJnZSBiYXRjaGVzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wb2xsaW5nSW50ZXJ2YWxNcyAoU2VydmVyIG9ubHkpIFdoZW4gb3Bsb2cgaXMgZGlzYWJsZWQgKHRocm91Z2ggdGhlIHVzZSBvZiBgZGlzYWJsZU9wbG9nYCBvciB3aGVuIG90aGVyd2lzZSBub3QgYXZhaWxhYmxlKSwgdGhlIGZyZXF1ZW5jeSAoaW4gbWlsbGlzZWNvbmRzKSBvZiBob3cgb2Z0ZW4gdG8gcG9sbCB0aGlzIHF1ZXJ5IHdoZW4gb2JzZXJ2aW5nIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHRzIHRvIDEwMDAwbXMgKDEwIHNlY29uZHMpLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wb2xsaW5nVGhyb3R0bGVNcyAoU2VydmVyIG9ubHkpIFdoZW4gb3Bsb2cgaXMgZGlzYWJsZWQgKHRocm91Z2ggdGhlIHVzZSBvZiBgZGlzYWJsZU9wbG9nYCBvciB3aGVuIG90aGVyd2lzZSBub3QgYXZhaWxhYmxlKSwgdGhlIG1pbmltdW0gdGltZSAoaW4gbWlsbGlzZWNvbmRzKSB0byBhbGxvdyBiZXR3ZWVuIHJlLXBvbGxpbmcgd2hlbiBvYnNlcnZpbmcgb24gdGhlIHNlcnZlci4gSW5jcmVhc2luZyB0aGlzIHdpbGwgc2F2ZSBDUFUgYW5kIG1vbmdvIGxvYWQgYXQgdGhlIGV4cGVuc2Ugb2Ygc2xvd2VyIHVwZGF0ZXMgdG8gdXNlcnMuIERlY3JlYXNpbmcgdGhpcyBpcyBub3QgcmVjb21tZW5kZWQuIERlZmF1bHRzIHRvIDUwbXMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLm1heFRpbWVNcyAoU2VydmVyIG9ubHkpIElmIHNldCwgaW5zdHJ1Y3RzIE1vbmdvREIgdG8gc2V0IGEgdGltZSBsaW1pdCBmb3IgdGhpcyBjdXJzb3IncyBvcGVyYXRpb25zLiBJZiB0aGUgb3BlcmF0aW9uIHJlYWNoZXMgdGhlIHNwZWNpZmllZCB0aW1lIGxpbWl0IChpbiBtaWxsaXNlY29uZHMpIHdpdGhvdXQgdGhlIGhhdmluZyBiZWVuIGNvbXBsZXRlZCwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLiBVc2VmdWwgdG8gcHJldmVudCBhbiAoYWNjaWRlbnRhbCBvciBtYWxpY2lvdXMpIHVub3B0aW1pemVkIHF1ZXJ5IGZyb20gY2F1c2luZyBhIGZ1bGwgY29sbGVjdGlvbiBzY2FuIHRoYXQgd291bGQgZGlzcnVwdCBvdGhlciBkYXRhYmFzZSB1c2VycywgYXQgdGhlIGV4cGVuc2Ugb2YgbmVlZGluZyB0byBoYW5kbGUgdGhlIHJlc3VsdGluZyBlcnJvci5cbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRpb25zLmhpbnQgKFNlcnZlciBvbmx5KSBPdmVycmlkZXMgTW9uZ29EQidzIGRlZmF1bHQgaW5kZXggc2VsZWN0aW9uIGFuZCBxdWVyeSBvcHRpbWl6YXRpb24gcHJvY2Vzcy4gU3BlY2lmeSBhbiBpbmRleCB0byBmb3JjZSBpdHMgdXNlLCBlaXRoZXIgYnkgaXRzIG5hbWUgb3IgaW5kZXggc3BlY2lmaWNhdGlvbi4gWW91IGNhbiBhbHNvIHNwZWNpZnkgYHsgJG5hdHVyYWwgOiAxIH1gIHRvIGZvcmNlIGEgZm9yd2FyZHMgY29sbGVjdGlvbiBzY2FuLCBvciBgeyAkbmF0dXJhbCA6IC0xIH1gIGZvciBhIHJldmVyc2UgY29sbGVjdGlvbiBzY2FuLiBTZXR0aW5nIHRoaXMgaXMgb25seSByZWNvbW1lbmRlZCBmb3IgYWR2YW5jZWQgdXNlcnMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnJlYWRQcmVmZXJlbmNlIChTZXJ2ZXIgb25seSkgU3BlY2lmaWVzIGEgY3VzdG9tIE1vbmdvREIgW2ByZWFkUHJlZmVyZW5jZWBdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9yZWFkLXByZWZlcmVuY2UpIGZvciB0aGlzIHBhcnRpY3VsYXIgY3Vyc29yLiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuY29sbGF0aW9uIFNwZWNpZmllcyBhIFtjb2xsYXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL2NvbGxhdGlvbi8pIGZvciBzdHJpbmcgY29tcGFyaXNvbi4gU3VwcG9ydGVkIG9uIGJvdGggY2xpZW50IChNaW5pbW9uZ28pIGFuZCBzZXJ2ZXIuIENsaWVudC1zdXBwb3J0ZWQgb3B0aW9uczogYGxvY2FsZWAgKHJlcXVpcmVkLCBlLmcuIGAnZW4nYCksIGBzdHJlbmd0aGAgKGAxYCBmb3IgYmFzZSwgYDJgIGZvciBjYXNlLWluc2Vuc2l0aXZlLCBgM2AgZm9yIGRlZmF1bHQpLCBgY2FzZUxldmVsYCwgYG51bWVyaWNPcmRlcmluZ2AgKGB0cnVlYCB0byBzb3J0IGAnMidgIGJlZm9yZSBgJzEwJ2ApLCBgY2FzZUZpcnN0YCAoYCd1cHBlcidgIG9yIGAnbG93ZXInYCkuIFNlcnZlci1vbmx5IG9wdGlvbnMgKGlnbm9yZWQgYnkgTWluaW1vbmdvKTogYGFsdGVybmF0ZWAsIGBtYXhWYXJpYWJsZWAsIGBiYWNrd2FyZHNgLCBgc3RyZW5ndGhgIDTigJM1LiBDb21wYXRpYmxlIHdpdGggb3Bsb2ctdGFpbGluZy5cbiAgICogQHJldHVybnMge01vbmdvLkN1cnNvcn1cbiAgICovXG4gIGZpbmQoLi4uYXJncykge1xuICAgIC8vIENvbGxlY3Rpb24uZmluZCgpIChyZXR1cm4gYWxsIGRvY3MpIGJlaGF2ZXMgZGlmZmVyZW50bHlcbiAgICAvLyBmcm9tIENvbGxlY3Rpb24uZmluZCh1bmRlZmluZWQpIChyZXR1cm4gMCBkb2NzKS4gIHNvIGJlXG4gICAgLy8gY2FyZWZ1bCBhYm91dCB0aGUgbGVuZ3RoIG9mIGFyZ3VtZW50cy5cbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5maW5kKFxuICAgICAgdGhpcy5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpLFxuICAgICAgdGhpcy5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBGaW5kcyB0aGUgZmlyc3QgZG9jdW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBzZWxlY3RvciwgYXMgb3JkZXJlZCBieSBzb3J0IGFuZCBza2lwIG9wdGlvbnMuIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnQgaXMgZm91bmQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGZpbmRPbmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IHRydWU7IHBhc3MgZmFsc2UgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgW2BDb2xsZWN0aW9uYF0oI2NvbGxlY3Rpb25zKSBmb3IgdGhpcyBjdXJzb3IuICBQYXNzIGBudWxsYCB0byBkaXNhYmxlIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5yZWFkUHJlZmVyZW5jZSAoU2VydmVyIG9ubHkpIFNwZWNpZmllcyBhIGN1c3RvbSBNb25nb0RCIFtgcmVhZFByZWZlcmVuY2VgXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvcmVhZC1wcmVmZXJlbmNlKSBmb3IgZmV0Y2hpbmcgdGhlIGRvY3VtZW50LiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuY29sbGF0aW9uIFNwZWNpZmllcyBhIFtjb2xsYXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL2NvbGxhdGlvbi8pIGZvciBzdHJpbmcgY29tcGFyaXNvbi4gU2VlIFtgZmluZGBdKCNmaW5kKSBmb3IgZGV0YWlscy5cbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZpbmRPbmUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmZpbmRPbmUoXG4gICAgICB0aGlzLl9nZXRGaW5kU2VsZWN0b3IoYXJncyksXG4gICAgICB0aGlzLl9nZXRGaW5kT3B0aW9ucyhhcmdzKVxuICAgICk7XG4gIH0sXG5cblxuICAvLyAnaW5zZXJ0JyBpbW1lZGlhdGVseSByZXR1cm5zIHRoZSBpbnNlcnRlZCBkb2N1bWVudCdzIG5ldyBfaWQuXG4gIC8vIFRoZSBvdGhlcnMgcmV0dXJuIHZhbHVlcyBpbW1lZGlhdGVseSBpZiB5b3UgYXJlIGluIGEgc3R1YiwgYW4gaW4tbWVtb3J5XG4gIC8vIHVubWFuYWdlZCBjb2xsZWN0aW9uLCBvciBhIG1vbmdvLWJhY2tlZCBjb2xsZWN0aW9uIGFuZCB5b3UgZG9uJ3QgcGFzcyBhXG4gIC8vIGNhbGxiYWNrLiAndXBkYXRlJyBhbmQgJ3JlbW92ZScgcmV0dXJuIHRoZSBudW1iZXIgb2YgYWZmZWN0ZWRcbiAgLy8gZG9jdW1lbnRzLiAndXBzZXJ0JyByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgJ251bWJlckFmZmVjdGVkJyBhbmQsIGlmIGFuXG4gIC8vIGluc2VydCBoYXBwZW5lZCwgJ2luc2VydGVkSWQnLlxuICAvL1xuICAvLyBPdGhlcndpc2UsIHRoZSBzZW1hbnRpY3MgYXJlIGV4YWN0bHkgbGlrZSBvdGhlciBtZXRob2RzOiB0aGV5IHRha2VcbiAgLy8gYSBjYWxsYmFjayBhcyBhbiBvcHRpb25hbCBsYXN0IGFyZ3VtZW50OyBpZiBubyBjYWxsYmFjayBpc1xuICAvLyBwcm92aWRlZCwgdGhleSBibG9jayB1bnRpbCB0aGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlLCBhbmQgdGhyb3cgYW5cbiAgLy8gZXhjZXB0aW9uIGlmIGl0IGZhaWxzOyBpZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkLCB0aGVuIHRoZXkgZG9uJ3RcbiAgLy8gbmVjZXNzYXJpbHkgYmxvY2ssIGFuZCB0aGV5IGNhbGwgdGhlIGNhbGxiYWNrIHdoZW4gdGhleSBmaW5pc2ggd2l0aCBlcnJvciBhbmRcbiAgLy8gcmVzdWx0IGFyZ3VtZW50cy4gIChUaGUgaW5zZXJ0IG1ldGhvZCBwcm92aWRlcyB0aGUgZG9jdW1lbnQgSUQgYXMgaXRzIHJlc3VsdDtcbiAgLy8gdXBkYXRlIGFuZCByZW1vdmUgcHJvdmlkZSB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3MgYXMgdGhlIHJlc3VsdDsgdXBzZXJ0XG4gIC8vIHByb3ZpZGVzIGFuIG9iamVjdCB3aXRoIG51bWJlckFmZmVjdGVkIGFuZCBtYXliZSBpbnNlcnRlZElkLilcbiAgLy9cbiAgLy8gT24gdGhlIGNsaWVudCwgYmxvY2tpbmcgaXMgaW1wb3NzaWJsZSwgc28gaWYgYSBjYWxsYmFja1xuICAvLyBpc24ndCBwcm92aWRlZCwgdGhleSBqdXN0IHJldHVybiBpbW1lZGlhdGVseSBhbmQgYW55IGVycm9yXG4gIC8vIGluZm9ybWF0aW9uIGlzIGxvc3QuXG4gIC8vXG4gIC8vIFRoZXJlJ3Mgb25lIG1vcmUgdHdlYWsuIE9uIHRoZSBjbGllbnQsIGlmIHlvdSBkb24ndCBwcm92aWRlIGFcbiAgLy8gY2FsbGJhY2ssIHRoZW4gaWYgdGhlcmUgaXMgYW4gZXJyb3IsIGEgbWVzc2FnZSB3aWxsIGJlIGxvZ2dlZCB3aXRoXG4gIC8vIE1ldGVvci5fZGVidWcuXG4gIC8vXG4gIC8vIFRoZSBpbnRlbnQgKHRob3VnaCB0aGlzIGlzIGFjdHVhbGx5IGRldGVybWluZWQgYnkgdGhlIHVuZGVybHlpbmdcbiAgLy8gZHJpdmVycykgaXMgdGhhdCB0aGUgb3BlcmF0aW9ucyBzaG91bGQgYmUgZG9uZSBzeW5jaHJvbm91c2x5LCBub3RcbiAgLy8gZ2VuZXJhdGluZyB0aGVpciByZXN1bHQgdW50aWwgdGhlIGRhdGFiYXNlIGhhcyBhY2tub3dsZWRnZWRcbiAgLy8gdGhlbS4gSW4gdGhlIGZ1dHVyZSBtYXliZSB3ZSBzaG91bGQgcHJvdmlkZSBhIGZsYWcgdG8gdHVybiB0aGlzXG4gIC8vIG9mZi5cblxuICBfaW5zZXJ0KGRvYywgY2FsbGJhY2spIHtcbiAgICAvLyBNYWtlIHN1cmUgd2Ugd2VyZSBwYXNzZWQgYSBkb2N1bWVudCB0byBpbnNlcnRcbiAgICBpZiAoIWRvYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNlcnQgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG5cblxuICAgIC8vIE1ha2UgYSBzaGFsbG93IGNsb25lIG9mIHRoZSBkb2N1bWVudCwgcHJlc2VydmluZyBpdHMgcHJvdG90eXBlLlxuICAgIGRvYyA9IE9iamVjdC5jcmVhdGUoXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jKSxcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGRvYylcbiAgICApO1xuXG4gICAgaWYgKCdfaWQnIGluIGRvYykge1xuICAgICAgaWYgKFxuICAgICAgICAhZG9jLl9pZCB8fFxuICAgICAgICAhKHR5cGVvZiBkb2MuX2lkID09PSAnc3RyaW5nJyB8fCBkb2MuX2lkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdNZXRlb3IgcmVxdWlyZXMgZG9jdW1lbnQgX2lkIGZpZWxkcyB0byBiZSBub24tZW1wdHkgc3RyaW5ncyBvciBPYmplY3RJRHMnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBnZW5lcmF0ZUlkID0gdHJ1ZTtcblxuICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgdGhlIGlkIGlmIHdlJ3JlIHRoZSBjbGllbnQgYW5kIHRoZSAnb3V0ZXJtb3N0JyBjYWxsXG4gICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBzYXZlcyB1cyBwYXNzaW5nIGJvdGggdGhlIHJhbmRvbVNlZWQgYW5kIHRoZSBpZFxuICAgICAgLy8gUGFzc2luZyBib3RoIGlzIHJlZHVuZGFudC5cbiAgICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgICBjb25zdCBlbmNsb3NpbmcgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpO1xuICAgICAgICBpZiAoIWVuY2xvc2luZykge1xuICAgICAgICAgIGdlbmVyYXRlSWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdGVJZCkge1xuICAgICAgICBkb2MuX2lkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyBPbiBpbnNlcnRzLCBhbHdheXMgcmV0dXJuIHRoZSBpZCB0aGF0IHdlIGdlbmVyYXRlZDsgb24gYWxsIG90aGVyXG4gICAgLy8gb3BlcmF0aW9ucywganVzdCByZXR1cm4gdGhlIHJlc3VsdCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgIHZhciBjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICBpZiAoTWV0ZW9yLl9pc1Byb21pc2UocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgaWYgKGRvYy5faWQpIHtcbiAgICAgICAgcmV0dXJuIGRvYy5faWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCB3aGF0IGlzIHRoaXMgZm9yPz9cbiAgICAgIC8vIEl0J3Mgc29tZSBpdGVyYWN0aW9uIGJldHdlZW4gdGhlIGNhbGxiYWNrIHRvIF9jYWxsTXV0YXRvck1ldGhvZCBhbmRcbiAgICAgIC8vIHRoZSByZXR1cm4gdmFsdWUgY29udmVyc2lvblxuICAgICAgZG9jLl9pZCA9IHJlc3VsdDtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gd3JhcENhbGxiYWNrKFxuICAgICAgY2FsbGJhY2ssXG4gICAgICBjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0XG4gICAgKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fY2FsbE11dGF0b3JNZXRob2QoJ2luc2VydCcsIFtkb2NdLCB3cmFwcGVkQ2FsbGJhY2spO1xuICAgICAgcmV0dXJuIGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQocmVzdWx0KTtcbiAgICB9XG5cbiAgICAvLyBpdCdzIG15IGNvbGxlY3Rpb24uICBkZXNjZW5kIGludG8gdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG4gICAgLy8gYW5kIHByb3BhZ2F0ZSBhbnkgZXhjZXB0aW9uLlxuICAgIHRyeSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhIGNhbGxiYWNrIGFuZCB0aGUgY29sbGVjdGlvbiBpbXBsZW1lbnRzIHRoaXNcbiAgICAgIC8vIG9wZXJhdGlvbiBhc3luY2hyb25vdXNseSwgdGhlbiBxdWVyeVJldCB3aWxsIGJlIHVuZGVmaW5lZCwgYW5kIHRoZVxuICAgICAgLy8gcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZiAoISF3cmFwcGVkQ2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5pbnNlcnQoZG9jLCB3cmFwcGVkQ2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSB0aGUgY2FsbGJhY2ssIHdlIGFzc3VtZSB0aGUgdXNlciBpcyB1c2luZyB0aGUgcHJvbWlzZS5cbiAgICAgICAgLy8gV2UgY2FuJ3QganVzdCBwYXNzIHRoaXMuX2NvbGxlY3Rpb24uaW5zZXJ0IHRvIHRoZSBwcm9taXNpZnkgYmVjYXVzZSBpdCB3b3VsZCBsb3NlIHRoZSBjb250ZXh0LlxuICAgICAgICByZXN1bHQgPSB0aGlzLl9jb2xsZWN0aW9uLmluc2VydChkb2MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdChyZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgSW5zZXJ0IGEgZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uICBSZXR1cm5zIGl0cyB1bmlxdWUgX2lkLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCAgaW5zZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZG9jIFRoZSBkb2N1bWVudCB0byBpbnNlcnQuIE1heSBub3QgeWV0IGhhdmUgYW4gX2lkIGF0dHJpYnV0ZSwgaW4gd2hpY2ggY2FzZSBNZXRlb3Igd2lsbCBnZW5lcmF0ZSBvbmUgZm9yIHlvdS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIF9pZCBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgaW5zZXJ0KGRvYywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5faW5zZXJ0KGRvYywgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBtb2RpZmllcyBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24uIFJldHVybnMgdGhlIG51bWJlciBvZiBtYXRjaGVkIGRvY3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBkYXRlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudXBzZXJ0IFRydWUgdG8gaW5zZXJ0IGEgZG9jdW1lbnQgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIGFyZSBmb3VuZC5cbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5hcnJheUZpbHRlcnMgT3B0aW9uYWwuIFVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBNb25nb0RCIFtmaWx0ZXJlZCBwb3NpdGlvbmFsIG9wZXJhdG9yXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9vcGVyYXRvci91cGRhdGUvcG9zaXRpb25hbC1maWx0ZXJlZC8pIHRvIHNwZWNpZnkgd2hpY2ggZWxlbWVudHMgdG8gbW9kaWZ5IGluIGFuIGFycmF5IGZpZWxkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIE9wdGlvbmFsLiAgSWYgcHJlc2VudCwgY2FsbGVkIHdpdGggYW4gZXJyb3Igb2JqZWN0IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQsIGlmIG5vIGVycm9yLCB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3VtZW50cyBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgdXBkYXRlKHNlbGVjdG9yLCBtb2RpZmllciwgLi4ub3B0aW9uc0FuZENhbGxiYWNrKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBwb3BDYWxsYmFja0Zyb21BcmdzKG9wdGlvbnNBbmRDYWxsYmFjayk7XG5cbiAgICAvLyBXZSd2ZSBhbHJlYWR5IHBvcHBlZCBvZmYgdGhlIGNhbGxiYWNrLCBzbyB3ZSBhcmUgbGVmdCB3aXRoIGFuIGFycmF5XG4gICAgLy8gb2Ygb25lIG9yIHplcm8gaXRlbXNcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi4ob3B0aW9uc0FuZENhbGxiYWNrWzBdIHx8IG51bGwpIH07XG4gICAgbGV0IGluc2VydGVkSWQ7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy51cHNlcnQpIHtcbiAgICAgIC8vIHNldCBgaW5zZXJ0ZWRJZGAgaWYgYWJzZW50LiAgYGluc2VydGVkSWRgIGlzIGEgTWV0ZW9yIGV4dGVuc2lvbi5cbiAgICAgIGlmIChvcHRpb25zLmluc2VydGVkSWQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoXG4gICAgICAgICAgICB0eXBlb2Ygb3B0aW9ucy5pbnNlcnRlZElkID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgb3B0aW9ucy5pbnNlcnRlZElkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SURcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luc2VydGVkSWQgbXVzdCBiZSBzdHJpbmcgb3IgT2JqZWN0SUQnKTtcbiAgICAgICAgaW5zZXJ0ZWRJZCA9IG9wdGlvbnMuaW5zZXJ0ZWRJZDtcbiAgICAgIH0gZWxzZSBpZiAoIXNlbGVjdG9yIHx8ICFzZWxlY3Rvci5faWQpIHtcbiAgICAgICAgaW5zZXJ0ZWRJZCA9IHRoaXMuX21ha2VOZXdJRCgpO1xuICAgICAgICBvcHRpb25zLmdlbmVyYXRlZElkID0gdHJ1ZTtcbiAgICAgICAgb3B0aW9ucy5pbnNlcnRlZElkID0gaW5zZXJ0ZWRJZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvciwge1xuICAgICAgZmFsbGJhY2tJZDogaW5zZXJ0ZWRJZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdyYXBwZWRDYWxsYmFjayA9IHdyYXBDYWxsYmFjayhjYWxsYmFjayk7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zXTtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZCgndXBkYXRlJywgYXJncywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbiBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQgYSBjYWxsYmFjayBhbmQgdGhlIGNvbGxlY3Rpb24gaW1wbGVtZW50cyB0aGlzXG4gICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgLy8gcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAvL2NvbnNvbGUubG9nKHtjYWxsYmFjaywgb3B0aW9ucywgc2VsZWN0b3IsIG1vZGlmaWVyLCBjb2xsOiB0aGlzLl9jb2xsZWN0aW9ufSk7XG4gICAgdHJ5IHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHByb3ZpZGVkIGEgY2FsbGJhY2sgYW5kIHRoZSBjb2xsZWN0aW9uIGltcGxlbWVudHMgdGhpc1xuICAgICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24udXBkYXRlKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgbW9kaWZpZXIsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHdyYXBwZWRDYWxsYmFja1xuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBkb2N1bWVudHMgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCByZW1vdmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byByZW1vdmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIG51bWJlciBvZiBhZmZlY3RlZCBkb2N1bWVudHMgYXMgdGhlIHNlY29uZC5cbiAgICovXG4gIHJlbW92ZShzZWxlY3RvciwgY2FsbGJhY2spIHtcbiAgICBzZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZCgncmVtb3ZlJywgW3NlbGVjdG9yXSwgY2FsbGJhY2spO1xuICAgIH1cblxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uMSBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24ucmVtb3ZlKHNlbGVjdG9yKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQXN5bmNocm9ub3VzbHkgbW9kaWZpZXMgb25lIG9yIG1vcmUgZG9jdW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLCBvciBpbnNlcnQgb25lIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50cyB3ZXJlIGZvdW5kLiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgYG51bWJlckFmZmVjdGVkYCAodGhlIG51bWJlciBvZiBkb2N1bWVudHMgbW9kaWZpZWQpICBhbmQgYGluc2VydGVkSWRgICh0aGUgdW5pcXVlIF9pZCBvZiB0aGUgZG9jdW1lbnQgdGhhdCB3YXMgaW5zZXJ0ZWQsIGlmIGFueSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHVwc2VydFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIG1vZGlmeVxuICAgKiBAcGFyYW0ge01vbmdvTW9kaWZpZXJ9IG1vZGlmaWVyIFNwZWNpZmllcyBob3cgdG8gbW9kaWZ5IHRoZSBkb2N1bWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMubXVsdGkgVHJ1ZSB0byBtb2RpZnkgYWxsIG1hdGNoaW5nIGRvY3VtZW50czsgZmFsc2UgdG8gb25seSBtb2RpZnkgb25lIG9mIHRoZSBtYXRjaGluZyBkb2N1bWVudHMgKHRoZSBkZWZhdWx0KS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIG51bWJlciBvZiBhZmZlY3RlZCBkb2N1bWVudHMgYXMgdGhlIHNlY29uZC5cbiAgICovXG4gIHVwc2VydChzZWxlY3RvciwgbW9kaWZpZXIsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZShcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgbW9kaWZpZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIF9yZXR1cm5PYmplY3Q6IHRydWUsXG4gICAgICAgIHVwc2VydDogdHJ1ZSxcbiAgICAgIH0pO1xuICB9LFxufVxuXG4vLyBDb252ZXJ0IHRoZSBjYWxsYmFjayB0byBub3QgcmV0dXJuIGEgcmVzdWx0IGlmIHRoZXJlIGlzIGFuIGVycm9yXG5mdW5jdGlvbiB3cmFwQ2FsbGJhY2soY2FsbGJhY2ssIGNvbnZlcnRSZXN1bHQpIHtcbiAgcmV0dXJuIChcbiAgICBjYWxsYmFjayAmJlxuICAgIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb252ZXJ0UmVzdWx0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBjb252ZXJ0UmVzdWx0KHJlc3VsdCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBwb3BDYWxsYmFja0Zyb21BcmdzKGFyZ3MpIHtcbiAgLy8gUHVsbCBvZmYgYW55IGNhbGxiYWNrIChvciBwZXJoYXBzIGEgJ2NhbGxiYWNrJyB2YXJpYWJsZSB0aGF0IHdhcyBwYXNzZWRcbiAgLy8gaW4gdW5kZWZpbmVkLCBsaWtlIGhvdyAndXBzZXJ0JyBkb2VzIGl0KS5cbiAgaWYgKFxuICAgIGFyZ3MubGVuZ3RoICYmXG4gICAgKGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgKSB7XG4gICAgcmV0dXJuIGFyZ3MucG9wKCk7XG4gIH1cbn1cbiIsIi8qKlxuICogQHN1bW1hcnkgQWxsb3dzIGZvciB1c2VyIHNwZWNpZmllZCBjb25uZWN0aW9uIG9wdGlvbnNcbiAqIEBleGFtcGxlIGh0dHA6Ly9tb25nb2RiLmdpdGh1Yi5pby9ub2RlLW1vbmdvZGItbmF0aXZlLzMuMC9yZWZlcmVuY2UvY29ubmVjdGluZy9jb25uZWN0aW9uLXNldHRpbmdzL1xuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVXNlciBzcGVjaWZpZWQgTW9uZ28gY29ubmVjdGlvbiBvcHRpb25zXG4gKi9cbk1vbmdvLnNldENvbm5lY3Rpb25PcHRpb25zID0gZnVuY3Rpb24gc2V0Q29ubmVjdGlvbk9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgY2hlY2sob3B0aW9ucywgT2JqZWN0KTtcbiAgTW9uZ28uX2Nvbm5lY3Rpb25PcHRpb25zID0gb3B0aW9ucztcbn07IiwiZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVByb2plY3Rpb24gPSBvcHRpb25zID0+IHtcbiAgLy8gdHJhbnNmb3JtIGZpZWxkcyBrZXkgaW4gcHJvamVjdGlvblxuICBjb25zdCB7IGZpZWxkcywgcHJvamVjdGlvbiwgLi4ub3RoZXJPcHRpb25zIH0gPSBvcHRpb25zIHx8IHt9O1xuICAvLyBUT0RPOiBlbmFibGUgdGhpcyBjb21tZW50IHdoZW4gZGVwcmVjYXRpbmcgdGhlIGZpZWxkcyBvcHRpb25cbiAgLy8gTG9nLmRlYnVnKGBmaWVsZHMgb3B0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgdGhlIG5ldyAncHJvamVjdGlvbicgaW5zdGVhZGApXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5vdGhlck9wdGlvbnMsXG4gICAgLi4uKHByb2plY3Rpb24gfHwgZmllbGRzID8geyBwcm9qZWN0aW9uOiBmaWVsZHMgfHwgcHJvamVjdGlvbiB9IDoge30pLFxuICB9O1xufTtcbiIsImltcG9ydCB7IE9ic2VydmVIYW5kbGVDYWxsYmFjaywgT2JzZXJ2ZU11bHRpcGxleGVyIH0gZnJvbSAnLi9vYnNlcnZlX211bHRpcGxleCc7XG5cbmxldCBuZXh0T2JzZXJ2ZUhhbmRsZUlkID0gMTtcblxuZXhwb3J0IHR5cGUgT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrSW50ZXJuYWwgPSAnX2FkZGVkJyB8ICdfYWRkZWRCZWZvcmUnIHwgJ19jaGFuZ2VkJyB8ICdfbW92ZWRCZWZvcmUnIHwgJ19yZW1vdmVkJztcblxuXG5leHBvcnQgdHlwZSBDYWxsYmFjazxUID0gYW55PiA9ICguLi5hcmdzOiBUW10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuXG4vKipcbiAqIFRoZSBcIm9ic2VydmUgaGFuZGxlXCIgcmV0dXJuZWQgZnJvbSBvYnNlcnZlQ2hhbmdlcy5cbiAqIENvbnRhaW5zIGEgcmVmZXJlbmNlIHRvIGFuIE9ic2VydmVNdWx0aXBsZXhlci5cbiAqIFVzZWQgdG8gc3RvcCBvYnNlcnZhdGlvbiBhbmQgY2xlYW4gdXAgcmVzb3VyY2VzLlxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2ZUhhbmRsZTxUID0gYW55PiB7XG4gIF9pZDogbnVtYmVyO1xuICBfbXVsdGlwbGV4ZXI6IE9ic2VydmVNdWx0aXBsZXhlcjtcbiAgbm9uTXV0YXRpbmdDYWxsYmFja3M6IGJvb2xlYW47XG4gIF9zdG9wcGVkOiBib29sZWFuO1xuXG4gIHB1YmxpYyBpbml0aWFsQWRkc1NlbnRSZXNvbHZlcjogKHZhbHVlOiB2b2lkKSA9PiB2b2lkID0gKCkgPT4ge307XG4gIHB1YmxpYyBpbml0aWFsQWRkc1NlbnQ6IFByb21pc2U8dm9pZD5cblxuICBfYWRkZWQ/OiBDYWxsYmFjazxUPjtcbiAgX2FkZGVkQmVmb3JlPzogQ2FsbGJhY2s8VD47XG4gIF9jaGFuZ2VkPzogQ2FsbGJhY2s8VD47XG4gIF9tb3ZlZEJlZm9yZT86IENhbGxiYWNrPFQ+O1xuICBfcmVtb3ZlZD86IENhbGxiYWNrPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKG11bHRpcGxleGVyOiBPYnNlcnZlTXVsdGlwbGV4ZXIsIGNhbGxiYWNrczogUmVjb3JkPE9ic2VydmVIYW5kbGVDYWxsYmFjaywgQ2FsbGJhY2s8VD4+LCBub25NdXRhdGluZ0NhbGxiYWNrczogYm9vbGVhbikge1xuICAgIHRoaXMuX211bHRpcGxleGVyID0gbXVsdGlwbGV4ZXI7XG5cbiAgICBtdWx0aXBsZXhlci5jYWxsYmFja05hbWVzKCkuZm9yRWFjaCgobmFtZTogT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrKSA9PiB7XG4gICAgICBpZiAoY2FsbGJhY2tzW25hbWVdKSB7XG4gICAgICAgIHRoaXNbYF8ke25hbWV9YCBhcyBPYnNlcnZlSGFuZGxlQ2FsbGJhY2tJbnRlcm5hbF0gPSBjYWxsYmFja3NbbmFtZV07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgPT09IFwiYWRkZWRCZWZvcmVcIiAmJiBjYWxsYmFja3MuYWRkZWQpIHtcbiAgICAgICAgdGhpcy5fYWRkZWRCZWZvcmUgPSBhc3luYyBmdW5jdGlvbiAoaWQsIGZpZWxkcywgYmVmb3JlKSB7XG4gICAgICAgICAgYXdhaXQgY2FsbGJhY2tzLmFkZGVkKGlkLCBmaWVsZHMpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fc3RvcHBlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2lkID0gbmV4dE9ic2VydmVIYW5kbGVJZCsrO1xuICAgIHRoaXMubm9uTXV0YXRpbmdDYWxsYmFja3MgPSBub25NdXRhdGluZ0NhbGxiYWNrcztcblxuICAgIHRoaXMuaW5pdGlhbEFkZHNTZW50ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCByZWFkeSA9ICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB0aGlzLmluaXRpYWxBZGRzU2VudCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dChyZWFkeSwgMzAwMDApXG5cbiAgICAgIHRoaXMuaW5pdGlhbEFkZHNTZW50UmVzb2x2ZXIgPSAoKSA9PiB7XG4gICAgICAgIHJlYWR5KCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXNpbmcgcHJvcGVydHkgc3ludGF4IGFuZCBhcnJvdyBmdW5jdGlvbiBzeW50YXggdG8gYXZvaWQgYmluZGluZyB0aGUgd3JvbmcgY29udGV4dCBvbiBjYWxsYmFja3MuXG4gICAqL1xuICBzdG9wID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgdGhpcy5fc3RvcHBlZCA9IHRydWU7XG4gICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIucmVtb3ZlSGFuZGxlKHRoaXMuX2lkKTtcbiAgfVxufSJdfQ==
