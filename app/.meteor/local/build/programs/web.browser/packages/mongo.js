//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("mongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var Log = Package.logging.Log;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var CollectionExtensions, Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"local_collection_driver.js":function module(require,exports,module){

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

}},"mongo_utils.js":function module(require,exports,module){

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

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  export: function () { return {
      Mongo: Mongo,
      CollectionExtensions: CollectionExtensions
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo/local_collection_driver.js",
    "/node_modules/meteor/mongo/collection/collection_extensions.js",
    "/node_modules/meteor/mongo/collection/collection.js"
  ]
}});
