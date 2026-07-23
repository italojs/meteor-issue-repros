Package["core-runtime"].queue("callback-hook",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Hook;

var require = meteorInstall({"node_modules":{"meteor":{"callback-hook":{"hook.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/callback-hook/hook.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({Hook:()=>Hook});let _async_to_generator;module.link("@swc/helpers/_/_async_to_generator",{_(v){_async_to_generator=v}},0);
// XXX This pattern is under development. Do not add more callsites
// using this package for now. See:
// https://meteor.hackpad.com/Design-proposal-Hooks-YxvgEW06q6f
//
// Encapsulates the pattern of registering callbacks on a hook.
//
// The `each` method of the hook calls its iterator function argument
// with each registered callback.  This allows the hook to
// conditionally decide not to call the callback (if, for example, the
// observed object has been closed or terminated).
//
// By default, callbacks are bound with `Meteor.bindEnvironment`, so they will be
// called with the Meteor environment of the calling code that
// registered the callback. Override by passing { bindEnvironment: false }
// to the constructor.
//
// Registering a callback returns an object with a single `stop`
// method which unregisters the callback.
//
// The code is careful to allow a callback to be safely unregistered
// while the callbacks are being iterated over.
//
// If the hook is configured with the `exceptionHandler` option, the
// handler will be called if a called callback throws an exception.
// By default (if the exception handler doesn't itself throw an
// exception, or if the iterator function doesn't return a falsy value
// to terminate the calling of callbacks), the remaining callbacks
// will still be called.
//
// Alternatively, the `debugPrintExceptions` option can be specified
// as string describing the callback.  On an exception the string and
// the exception will be printed to the console log with
// `Meteor._debug`, and the exception otherwise ignored.
//
// If an exception handler isn't specified, exceptions thrown in the
// callback will propagate up to the iterator function, and will
// terminate calling the remaining callbacks if not caught.
class Hook {
    /**
   * Clears all registered callbacks from this Hook instance.
   * After calling this method, the hook will have no callbacks registered.
   */ clear() {
        this.callbacks.clear();
    }
    /**
   * Returns the number of callbacks currently registered with this Hook instance.
   * @returns {number} The number of registered callbacks.
   */ size() {
        return this.callbacks.size;
    }
    /**
   * Returns all registered callbacks as a new Array.
   * This provides a snapshot of the current callbacks.
   * @returns {Array<Function>} An array containing all registered callback functions.
   */ asArray() {
        return Array.from(this.callbacks);
    }
    /**
   * Replaces the current set of registered callbacks with a new set derived from the given array.
   *
   * @param {Array<Function>} arr An array of callback functions to register with this hook.
   * @throws {Error} If the provided argument `arr` is not an array.
   */ fromArray(arr) {
        if (!Array.isArray(arr)) {
            throw new Error("Method fromArray expects an array");
        }
        this.callbacks = new Set(arr);
    }
    /**
   * Registers a new callback with this Hook instance.
   *
   * @param {Function} callback The function to register. This function will be called when the hook is iterated over.
   * @returns {{callback: Function, stop: Function}} An object containing:
   *   - `callback`: The actual callback function that was added to the hook's internal set (after any wrapping).
   *   - `stop`: A function that, when called, unregisters this specific callback from the hook.
   */ register(callback) {
        const exceptionHandler = this.exceptionHandler || function(exception) {
            // Note: this relies on the undocumented fact that if bindEnvironment's
            // onException throws, and you are invoking the callback either in the
            // browser or from within a Fiber in Node, the exception is propagated.
            throw exception;
        };
        if (this.bindEnvironment) {
            callback = Meteor.bindEnvironment(callback, exceptionHandler);
        } else {
            callback = wrapHookWithErrorHandling(callback, exceptionHandler);
        }
        if (this.wrapAsync) {
            callback = Meteor.wrapFn(callback);
        }
        this.callbacks.add(callback);
        return {
            callback,
            stop: ()=>{
                this.callbacks.delete(callback);
            }
        };
    }
    /**
   * For each registered callback, call the passed iterator function with the callback.
   *
   * The iterator function can choose whether or not to call the
   * callback.  (For example, it might not call the callback if the
   * observed object has been closed or terminated).
   * The iteration is stopped if the iterator function returns a falsy
   * value or throws an exception.
   *
   * @param iterator
   */ forEach(iterator) {
        // Snapshot first so a callback can safely unregister itself (or other
        // callbacks) without disturbing this iteration. The Set is also re-checked
        // each step in case a callback removed a later one in the snapshot.
        const snapshot = Array.from(this.callbacks);
        for (const callback of snapshot){
            if (!this.callbacks.has(callback)) continue;
            if (!iterator(callback)) break;
        }
    }
    /**
   * For each registered callback, call the passed iterator function with the callback.
   *
   * it is a counterpart of forEach, but it is async and returns a promise
   * @param iterator
   * @return {Promise<void>}
   * @see forEach
   */ forEachAsync(iterator) {
        return _async_to_generator(function*() {
            for (const callback of this.callbacks){
                if (!(yield iterator(callback))) break;
            }
        }).call(this);
    }
    /**
   * @deprecated use forEach
   * @param iterator
   */ each(iterator) {
        return this.forEach(iterator);
    }
    /**
   * Makes the Hook instance iterable, allowing it to be used in `for...of` loops.
   * It iterates over the registered callbacks.
   * @returns {Iterator<Function>} An iterator for the registered callbacks.
   */ [Symbol.iterator]() {
        return this.callbacks[Symbol.iterator]();
    }
    /**
   * Creates a new Hook instance.
   * @param {object} [options={}] - Configuration options for the hook.
   * @param {boolean} [options.bindEnvironment=true] - Whether to automatically wrap registered callbacks with `Meteor.bindEnvironment`.
   *   If `true`, callbacks will run in the Meteor environment of the code that registered them.
   * @param {boolean} [options.wrapAsync=true] - Whether to automatically wrap registered callbacks with `Meteor.wrapFn`.
   *   If `true`, callbacks will be prepared to run asynchronously.
   * @param {Function} [options.exceptionHandler] - A custom function to handle exceptions thrown by registered callbacks.
   *   This function will be called with the exception as its argument.
   *   If provided, `options.debugPrintExceptions` will be ignored.
   * @param {string} [options.debugPrintExceptions] - If an `exceptionHandler` is not provided, and this option is a string,
   *   exceptions thrown by callbacks will be logged to `Meteor._debug` with this string as a description.
   */ constructor(options = {}){
        this.callbacks = new Set();
        // Whether to wrap callbacks with Meteor.bindEnvironment
        const { bindEnvironment = true, wrapAsync = true } = options;
        this.bindEnvironment = !!bindEnvironment;
        this.wrapAsync = !!wrapAsync;
        if (options.exceptionHandler) {
            this.exceptionHandler = options.exceptionHandler;
        } else if (options.debugPrintExceptions) {
            if (typeof options.debugPrintExceptions !== "string") {
                throw new Error("Hook option debugPrintExceptions should be a string");
            }
            this.exceptionHandler = options.debugPrintExceptions;
        }
    }
}
/**
 * Wraps a given function with error handling. If the wrapped function throws an exception,
 * it will be caught and passed to the provided exception handler.
 * This is similar to `Meteor.bindEnvironment` but without the Meteor environment binding.
 *
 * @param {Function} func The function to wrap.
 * @param {Function|string} onException The exception handler function to call if `func` throws,
 *   or a string description for default exception logging.
 * @param {any} _this The `this` context to bind to `func` when it is called.
 * @returns {Function} A new function that executes `func` with error handling.
 */ function wrapHookWithErrorHandling(func, onException, _this) {
    const exceptionHandler = normalizeHookExceptionHandler(onException);
    return function executeHookWithErrorHandling(...args) {
        let ret;
        try {
            ret = func.apply(_this, args);
        } catch (e) {
            exceptionHandler(e);
        }
        return ret;
    };
}
/**
 * Normalizes an exception handler, ensuring it is a function.
 * If a function is provided, it is returned directly.
 * If a string is provided, it is used as a description for a default handler that logs exceptions.
 * Otherwise, a generic default handler that logs exceptions with a default description is returned.
 *
 * @param {Function|string} exceptionHandler The exception handler to normalize. Can be a function,
 *   a string description for logging, or any other value (which defaults to generic logging).
 * @returns {Function} A function that handles exceptions.
 */ function normalizeHookExceptionHandler(exceptionHandler) {
    if (typeof exceptionHandler === "function") {
        return exceptionHandler;
    }
    const description = typeof exceptionHandler === "string" ? exceptionHandler : "callback of async function";
    return function defaultHookExceptionHandler(error) {
        Meteor._debug(`Exception in ${description}`, error);
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Hook: Hook
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/callback-hook/hook.js"
  ],
  mainModulePath: "/node_modules/meteor/callback-hook/hook.js"
}});

//# sourceURL=meteor://💻app/packages/callback-hook.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvY2FsbGJhY2staG9vay9ob29rLmpzIl0sIm5hbWVzIjpbIkhvb2siLCJjbGVhciIsImNhbGxiYWNrcyIsInNpemUiLCJhc0FycmF5IiwiQXJyYXkiLCJmcm9tIiwiZnJvbUFycmF5IiwiYXJyIiwiaXNBcnJheSIsIkVycm9yIiwiU2V0IiwicmVnaXN0ZXIiLCJjYWxsYmFjayIsImV4Y2VwdGlvbkhhbmRsZXIiLCJleGNlcHRpb24iLCJiaW5kRW52aXJvbm1lbnQiLCJNZXRlb3IiLCJ3cmFwSG9va1dpdGhFcnJvckhhbmRsaW5nIiwid3JhcEFzeW5jIiwid3JhcEZuIiwiYWRkIiwic3RvcCIsImRlbGV0ZSIsImZvckVhY2giLCJpdGVyYXRvciIsInNuYXBzaG90IiwiaGFzIiwiZm9yRWFjaEFzeW5jIiwiZWFjaCIsIlN5bWJvbCIsIm9wdGlvbnMiLCJkZWJ1Z1ByaW50RXhjZXB0aW9ucyIsImZ1bmMiLCJvbkV4Y2VwdGlvbiIsIl90aGlzIiwibm9ybWFsaXplSG9va0V4Y2VwdGlvbkhhbmRsZXIiLCJleGVjdXRlSG9va1dpdGhFcnJvckhhbmRsaW5nIiwiYXJncyIsInJldCIsImFwcGx5IiwiZSIsImRlc2NyaXB0aW9uIiwiZGVmYXVsdEhvb2tFeGNlcHRpb25IYW5kbGVyIiwiZXJyb3IiLCJfZGVidWciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1FQUFtRTtBQUNuRSxtQ0FBbUM7QUFDbkMsK0RBQStEO0FBQy9ELEVBQUU7QUFDRiwrREFBK0Q7QUFDL0QsRUFBRTtBQUNGLHFFQUFxRTtBQUNyRSwwREFBMEQ7QUFDMUQsc0VBQXNFO0FBQ3RFLGtEQUFrRDtBQUNsRCxFQUFFO0FBQ0YsaUZBQWlGO0FBQ2pGLDhEQUE4RDtBQUM5RCwwRUFBMEU7QUFDMUUsc0JBQXNCO0FBQ3RCLEVBQUU7QUFDRixnRUFBZ0U7QUFDaEUseUNBQXlDO0FBQ3pDLEVBQUU7QUFDRixvRUFBb0U7QUFDcEUs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QyxDQUFDQTtRQUVuQixJQUFJWSxRQUFRakIsZ0JBQWdCLEVBQUU7WUFDNUIsSUFBSSxDQUFDQSxnQkFBZ0IsR0FBR2lCLFFBQVFqQixnQkFBZ0I7UUFDbEQsT0FBTyxJQUFJaUIsUUFBUUMsb0JBQW9CLEVBQUU7WUFDdkMsSUFBSSxPQUFPRCxRQUFRQyxvQkFBb0IsS0FBSyxVQUFVO2dCQUNwRCxNQUFNLElBQUl0QixNQUFNO1lBQ2xCO1lBQ0EsSUFBSSxDQUFDSSxnQkFBZ0IsR0FBR2lCLFFBQVFDLG9CQUFvQjtRQUN0RDtJQUNGO0FBa0lGO0FBRUE7Ozs7Ozs7Ozs7Q0FVQyxHQUNELFNBQVNkLDBCQUEwQmUsSUFBSSxFQUFFQyxXQUFXLEVBQUVDLEtBQUs7SUFDekQsTUFBTXJCLG1CQUFtQnNCLDhCQUE4QkY7SUFDdkQsT0FBTyxTQUFTRyw2QkFBNkIsR0FBR0MsSUFBSTtRQUNsRCxJQUFJQztRQUNKLElBQUk7WUFDRkEsTUFBTU4sS0FBS08sS0FBSyxDQUFDTCxPQUFPRztRQUMxQixFQUFFLE9BQU9HLEdBQUc7WUFDVjNCLGlCQUFpQjJCO1FBQ25CO1FBQ0EsT0FBT0Y7SUFDVDtBQUNGO0FBRUE7Ozs7Ozs7OztDQVNDLEdBQ0QsU0FBU0gsOEJBQThCdEIsZ0JBQWdCO0lBQ3JELElBQUksT0FBT0EscUJBQXFCLFlBQVk7UUFDMUMsT0FBT0E7SUFDVDtJQUVBLE1BQU00QixjQUNKLE9BQU81QixxQkFBcUIsV0FBV0EsbUJBQW1CO0lBRTVELE9BQU8sU0FBUzZCLDRCQUE0QkMsS0FBSztRQUMvQzNCLE9BQU80QixNQUFNLENBQUMsQ0FBQyxhQUFhLEVBQUVILGFBQWEsRUFBRUU7SUFDL0M7QUFDRiIsImZpbGUiOiIvcGFja2FnZXMvY2FsbGJhY2staG9vay5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFhYWCBUaGlzIHBhdHRlcm4gaXMgdW5kZXIgZGV2ZWxvcG1lbnQuIERvIG5vdCBhZGQgbW9yZSBjYWxsc2l0ZXNcbi8vIHVzaW5nIHRoaXMgcGFja2FnZSBmb3Igbm93LiBTZWU6XG4vLyBodHRwczovL21ldGVvci5oYWNrcGFkLmNvbS9EZXNpZ24tcHJvcG9zYWwtSG9va3MtWXh2Z0VXMDZxNmZcbi8vXG4vLyBFbmNhcHN1bGF0ZXMgdGhlIHBhdHRlcm4gb2YgcmVnaXN0ZXJpbmcgY2FsbGJhY2tzIG9uIGEgaG9vay5cbi8vXG4vLyBUaGUgYGVhY2hgIG1ldGhvZCBvZiB0aGUgaG9vayBjYWxscyBpdHMgaXRlcmF0b3IgZnVuY3Rpb24gYXJndW1lbnRcbi8vIHdpdGggZWFjaCByZWdpc3RlcmVkIGNhbGxiYWNrLiAgVGhpcyBhbGxvd3MgdGhlIGhvb2sgdG9cbi8vIGNvbmRpdGlvbmFsbHkgZGVjaWRlIG5vdCB0byBjYWxsIHRoZSBjYWxsYmFjayAoaWYsIGZvciBleGFtcGxlLCB0aGVcbi8vIG9ic2VydmVkIG9iamVjdCBoYXMgYmVlbiBjbG9zZWQgb3IgdGVybWluYXRlZCkuXG4vL1xuLy8gQnkgZGVmYXVsdCwgY2FsbGJhY2tzIGFyZSBib3VuZCB3aXRoIGBNZXRlb3IuYmluZEVudmlyb25tZW50YCwgc28gdGhleSB3aWxsIGJlXG4vLyBjYWxsZWQgd2l0aCB0aGUgTWV0ZW9yIGVudmlyb25tZW50IG9mIHRoZSBjYWxsaW5nIGNvZGUgdGhhdFxuLy8gcmVnaXN0ZXJlZCB0aGUgY2FsbGJhY2suIE92ZXJyaWRlIGJ5IHBhc3NpbmcgeyBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlIH1cbi8vIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbi8vXG4vLyBSZWdpc3RlcmluZyBhIGNhbGxiYWNrIHJldHVybnMgYW4gb2JqZWN0IHdpdGggYSBzaW5nbGUgYHN0b3BgXG4vLyBtZXRob2Qgd2hpY2ggdW5yZWdpc3RlcnMgdGhlIGNhbGxiYWNrLlxuLy9cbi8vIFRoZSBjb2RlIGlzIGNhcmVmdWwgdG8gYWxsb3cgYSBjYWxsYmFjayB0byBiZSBzYWZlbHkgdW5yZWdpc3RlcmVkXG4vLyB3aGlsZSB0aGUgY2FsbGJhY2tzIGFyZSBiZWluZyBpdGVyYXRlZCBvdmVyLlxuLy9cbi8vIElmIHRoZSBob29rIGlzIGNvbmZpZ3VyZWQgd2l0aCB0aGUgYGV4Y2VwdGlvbkhhbmRsZXJgIG9wdGlvbiwgdGhlXG4vLyBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkIGlmIGEgY2FsbGVkIGNhbGxiYWNrIHRocm93cyBhbiBleGNlcHRpb24uXG4vLyBCeSBkZWZhdWx0IChpZiB0aGUgZXhjZXB0aW9uIGhhbmRsZXIgZG9lc24ndCBpdHNlbGYgdGhyb3cgYW5cbi8vIGV4Y2VwdGlvbiwgb3IgaWYgdGhlIGl0ZXJhdG9yIGZ1bmN0aW9uIGRvZXNuJ3QgcmV0dXJuIGEgZmFsc3kgdmFsdWVcbi8vIHRvIHRlcm1pbmF0ZSB0aGUgY2FsbGluZyBvZiBjYWxsYmFja3MpLCB0aGUgcmVtYWluaW5nIGNhbGxiYWNrc1xuLy8gd2lsbCBzdGlsbCBiZSBjYWxsZWQuXG4vL1xuLy8gQWx0ZXJuYXRpdmVseSwgdGhlIGBkZWJ1Z1ByaW50RXhjZXB0aW9uc2Agb3B0aW9uIGNhbiBiZSBzcGVjaWZpZWRcbi8vIGFzIHN0cmluZyBkZXNjcmliaW5nIHRoZSBjYWxsYmFjay4gIE9uIGFuIGV4Y2VwdGlvbiB0aGUgc3RyaW5nIGFuZFxuLy8gdGhlIGV4Y2VwdGlvbiB3aWxsIGJlIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUgbG9nIHdpdGhcbi8vIGBNZXRlb3IuX2RlYnVnYCwgYW5kIHRoZSBleGNlcHRpb24gb3RoZXJ3aXNlIGlnbm9yZWQuXG4vL1xuLy8gSWYgYW4gZXhjZXB0aW9uIGhhbmRsZXIgaXNuJ3Qgc3BlY2lmaWVkLCBleGNlcHRpb25zIHRocm93biBpbiB0aGVcbi8vIGNhbGxiYWNrIHdpbGwgcHJvcGFnYXRlIHVwIHRvIHRoZSBpdGVyYXRvciBmdW5jdGlvbiwgYW5kIHdpbGxcbi8vIHRlcm1pbmF0ZSBjYWxsaW5nIHRoZSByZW1haW5pbmcgY2FsbGJhY2tzIGlmIG5vdCBjYXVnaHQuXG5cbmV4cG9ydCBjbGFzcyBIb29rIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgSG9vayBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zPXt9XSAtIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGhvb2suXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYmluZEVudmlyb25tZW50PXRydWVdIC0gV2hldGhlciB0byBhdXRvbWF0aWNhbGx5IHdyYXAgcmVnaXN0ZXJlZCBjYWxsYmFja3Mgd2l0aCBgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudGAuXG4gICAqICAgSWYgYHRydWVgLCBjYWxsYmFja3Mgd2lsbCBydW4gaW4gdGhlIE1ldGVvciBlbnZpcm9ubWVudCBvZiB0aGUgY29kZSB0aGF0IHJlZ2lzdGVyZWQgdGhlbS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53cmFwQXN5bmM9dHJ1ZV0gLSBXaGV0aGVyIHRvIGF1dG9tYXRpY2FsbHkgd3JhcCByZWdpc3RlcmVkIGNhbGxiYWNrcyB3aXRoIGBNZXRlb3Iud3JhcEZuYC5cbiAgICogICBJZiBgdHJ1ZWAsIGNhbGxiYWNrcyB3aWxsIGJlIHByZXBhcmVkIHRvIHJ1biBhc3luY2hyb25vdXNseS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuZXhjZXB0aW9uSGFuZGxlcl0gLSBBIGN1c3RvbSBmdW5jdGlvbiB0byBoYW5kbGUgZXhjZXB0aW9ucyB0aHJvd24gYnkgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqICAgVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBleGNlcHRpb24gYXMgaXRzIGFyZ3VtZW50LlxuICAgKiAgIElmIHByb3ZpZGVkLCBgb3B0aW9ucy5kZWJ1Z1ByaW50RXhjZXB0aW9uc2Agd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGVidWdQcmludEV4Y2VwdGlvbnNdIC0gSWYgYW4gYGV4Y2VwdGlvbkhhbmRsZXJgIGlzIG5vdCBwcm92aWRlZCwgYW5kIHRoaXMgb3B0aW9uIGlzIGEgc3RyaW5nLFxuICAgKiAgIGV4Y2VwdGlvbnMgdGhyb3duIGJ5IGNhbGxiYWNrcyB3aWxsIGJlIGxvZ2dlZCB0byBgTWV0ZW9yLl9kZWJ1Z2Agd2l0aCB0aGlzIHN0cmluZyBhcyBhIGRlc2NyaXB0aW9uLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICAvLyBXaGV0aGVyIHRvIHdyYXAgY2FsbGJhY2tzIHdpdGggTWV0ZW9yLmJpbmRFbnZpcm9ubWVudFxuICAgIGNvbnN0IHsgYmluZEVudmlyb25tZW50ID0gdHJ1ZSwgd3JhcEFzeW5jID0gdHJ1ZSB9ID0gb3B0aW9ucztcbiAgICB0aGlzLmJpbmRFbnZpcm9ubWVudCA9ICEhYmluZEVudmlyb25tZW50O1xuICAgIHRoaXMud3JhcEFzeW5jID0gISF3cmFwQXN5bmM7XG5cbiAgICBpZiAob3B0aW9ucy5leGNlcHRpb25IYW5kbGVyKSB7XG4gICAgICB0aGlzLmV4Y2VwdGlvbkhhbmRsZXIgPSBvcHRpb25zLmV4Y2VwdGlvbkhhbmRsZXI7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmRlYnVnUHJpbnRFeGNlcHRpb25zKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGVidWdQcmludEV4Y2VwdGlvbnMgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSG9vayBvcHRpb24gZGVidWdQcmludEV4Y2VwdGlvbnMgc2hvdWxkIGJlIGEgc3RyaW5nXCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5leGNlcHRpb25IYW5kbGVyID0gb3B0aW9ucy5kZWJ1Z1ByaW50RXhjZXB0aW9ucztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcyBmcm9tIHRoaXMgSG9vayBpbnN0YW5jZS5cbiAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCwgdGhlIGhvb2sgd2lsbCBoYXZlIG5vIGNhbGxiYWNrcyByZWdpc3RlcmVkLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFja3MuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgY2FsbGJhY2tzIGN1cnJlbnRseSByZWdpc3RlcmVkIHdpdGggdGhpcyBIb29rIGluc3RhbmNlLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKi9cbiAgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFja3Muc2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcyBhcyBhIG5ldyBBcnJheS5cbiAgICogVGhpcyBwcm92aWRlcyBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrcy5cbiAgICogQHJldHVybnMge0FycmF5PEZ1bmN0aW9uPn0gQW4gYXJyYXkgY29udGFpbmluZyBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFjayBmdW5jdGlvbnMuXG4gICAqL1xuICBhc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY2FsbGJhY2tzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgY3VycmVudCBzZXQgb2YgcmVnaXN0ZXJlZCBjYWxsYmFja3Mgd2l0aCBhIG5ldyBzZXQgZGVyaXZlZCBmcm9tIHRoZSBnaXZlbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxGdW5jdGlvbj59IGFyciBBbiBhcnJheSBvZiBjYWxsYmFjayBmdW5jdGlvbnMgdG8gcmVnaXN0ZXIgd2l0aCB0aGlzIGhvb2suXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcHJvdmlkZWQgYXJndW1lbnQgYGFycmAgaXMgbm90IGFuIGFycmF5LlxuICAgKi9cbiAgZnJvbUFycmF5KGFycikge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgZnJvbUFycmF5IGV4cGVjdHMgYW4gYXJyYXlcIik7XG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2tzID0gbmV3IFNldChhcnIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIG5ldyBjYWxsYmFjayB3aXRoIHRoaXMgSG9vayBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyLiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIGhvb2sgaXMgaXRlcmF0ZWQgb3Zlci5cbiAgICogQHJldHVybnMge3tjYWxsYmFjazogRnVuY3Rpb24sIHN0b3A6IEZ1bmN0aW9ufX0gQW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4gICAqICAgLSBgY2FsbGJhY2tgOiBUaGUgYWN0dWFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2FzIGFkZGVkIHRvIHRoZSBob29rJ3MgaW50ZXJuYWwgc2V0IChhZnRlciBhbnkgd3JhcHBpbmcpLlxuICAgKiAgIC0gYHN0b3BgOiBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB1bnJlZ2lzdGVycyB0aGlzIHNwZWNpZmljIGNhbGxiYWNrIGZyb20gdGhlIGhvb2suXG4gICAqL1xuICByZWdpc3RlcihjYWxsYmFjaykge1xuICAgIGNvbnN0IGV4Y2VwdGlvbkhhbmRsZXIgPVxuICAgICAgdGhpcy5leGNlcHRpb25IYW5kbGVyIHx8XG4gICAgICBmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgIC8vIE5vdGU6IHRoaXMgcmVsaWVzIG9uIHRoZSB1bmRvY3VtZW50ZWQgZmFjdCB0aGF0IGlmIGJpbmRFbnZpcm9ubWVudCdzXG4gICAgICAgIC8vIG9uRXhjZXB0aW9uIHRocm93cywgYW5kIHlvdSBhcmUgaW52b2tpbmcgdGhlIGNhbGxiYWNrIGVpdGhlciBpbiB0aGVcbiAgICAgICAgLy8gYnJvd3NlciBvciBmcm9tIHdpdGhpbiBhIEZpYmVyIGluIE5vZGUsIHRoZSBleGNlcHRpb24gaXMgcHJvcGFnYXRlZC5cbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfTtcblxuICAgIGlmICh0aGlzLmJpbmRFbnZpcm9ubWVudCkge1xuICAgICAgY2FsbGJhY2sgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KGNhbGxiYWNrLCBleGNlcHRpb25IYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2sgPSB3cmFwSG9va1dpdGhFcnJvckhhbmRsaW5nKGNhbGxiYWNrLCBleGNlcHRpb25IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy53cmFwQXN5bmMpIHtcbiAgICAgIGNhbGxiYWNrID0gTWV0ZW9yLndyYXBGbihjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgdGhpcy5jYWxsYmFja3MuYWRkKGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjYWxsYmFjayxcbiAgICAgIHN0b3A6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZWFjaCByZWdpc3RlcmVkIGNhbGxiYWNrLCBjYWxsIHRoZSBwYXNzZWQgaXRlcmF0b3IgZnVuY3Rpb24gd2l0aCB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiBjYW4gY2hvb3NlIHdoZXRoZXIgb3Igbm90IHRvIGNhbGwgdGhlXG4gICAqIGNhbGxiYWNrLiAgKEZvciBleGFtcGxlLCBpdCBtaWdodCBub3QgY2FsbCB0aGUgY2FsbGJhY2sgaWYgdGhlXG4gICAqIG9ic2VydmVkIG9iamVjdCBoYXMgYmVlbiBjbG9zZWQgb3IgdGVybWluYXRlZCkuXG4gICAqIFRoZSBpdGVyYXRpb24gaXMgc3RvcHBlZCBpZiB0aGUgaXRlcmF0b3IgZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5XG4gICAqIHZhbHVlIG9yIHRocm93cyBhbiBleGNlcHRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBpdGVyYXRvclxuICAgKi9cbiAgZm9yRWFjaChpdGVyYXRvcikge1xuICAgIC8vIFNuYXBzaG90IGZpcnN0IHNvIGEgY2FsbGJhY2sgY2FuIHNhZmVseSB1bnJlZ2lzdGVyIGl0c2VsZiAob3Igb3RoZXJcbiAgICAvLyBjYWxsYmFja3MpIHdpdGhvdXQgZGlzdHVyYmluZyB0aGlzIGl0ZXJhdGlvbi4gVGhlIFNldCBpcyBhbHNvIHJlLWNoZWNrZWRcbiAgICAvLyBlYWNoIHN0ZXAgaW4gY2FzZSBhIGNhbGxiYWNrIHJlbW92ZWQgYSBsYXRlciBvbmUgaW4gdGhlIHNuYXBzaG90LlxuICAgIGNvbnN0IHNuYXBzaG90ID0gQXJyYXkuZnJvbSh0aGlzLmNhbGxiYWNrcyk7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBzbmFwc2hvdCkge1xuICAgICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5oYXMoY2FsbGJhY2spKSBjb250aW51ZTtcbiAgICAgIGlmICghaXRlcmF0b3IoY2FsbGJhY2spKSBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVhY2ggcmVnaXN0ZXJlZCBjYWxsYmFjaywgY2FsbCB0aGUgcGFzc2VkIGl0ZXJhdG9yIGZ1bmN0aW9uIHdpdGggdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBpdCBpcyBhIGNvdW50ZXJwYXJ0IG9mIGZvckVhY2gsIGJ1dCBpdCBpcyBhc3luYyBhbmQgcmV0dXJucyBhIHByb21pc2VcbiAgICogQHBhcmFtIGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge1Byb21pc2U8dm9pZD59XG4gICAqIEBzZWUgZm9yRWFjaFxuICAgKi9cbiAgYXN5bmMgZm9yRWFjaEFzeW5jKGl0ZXJhdG9yKSB7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLmNhbGxiYWNrcykge1xuICAgICAgaWYgKCEoYXdhaXQgaXRlcmF0b3IoY2FsbGJhY2spKSkgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIHVzZSBmb3JFYWNoXG4gICAqIEBwYXJhbSBpdGVyYXRvclxuICAgKi9cbiAgZWFjaChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goaXRlcmF0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIHRoZSBIb29rIGluc3RhbmNlIGl0ZXJhYmxlLCBhbGxvd2luZyBpdCB0byBiZSB1c2VkIGluIGBmb3IuLi5vZmAgbG9vcHMuXG4gICAqIEl0IGl0ZXJhdGVzIG92ZXIgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3I8RnVuY3Rpb24+fSBBbiBpdGVyYXRvciBmb3IgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKi9cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tzW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBzIGEgZ2l2ZW4gZnVuY3Rpb24gd2l0aCBlcnJvciBoYW5kbGluZy4gSWYgdGhlIHdyYXBwZWQgZnVuY3Rpb24gdGhyb3dzIGFuIGV4Y2VwdGlvbixcbiAqIGl0IHdpbGwgYmUgY2F1Z2h0IGFuZCBwYXNzZWQgdG8gdGhlIHByb3ZpZGVkIGV4Y2VwdGlvbiBoYW5kbGVyLlxuICogVGhpcyBpcyBzaW1pbGFyIHRvIGBNZXRlb3IuYmluZEVudmlyb25tZW50YCBidXQgd2l0aG91dCB0aGUgTWV0ZW9yIGVudmlyb25tZW50IGJpbmRpbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBvbkV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIGhhbmRsZXIgZnVuY3Rpb24gdG8gY2FsbCBpZiBgZnVuY2AgdGhyb3dzLFxuICogICBvciBhIHN0cmluZyBkZXNjcmlwdGlvbiBmb3IgZGVmYXVsdCBleGNlcHRpb24gbG9nZ2luZy5cbiAqIEBwYXJhbSB7YW55fSBfdGhpcyBUaGUgYHRoaXNgIGNvbnRleHQgdG8gYmluZCB0byBgZnVuY2Agd2hlbiBpdCBpcyBjYWxsZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHRoYXQgZXhlY3V0ZXMgYGZ1bmNgIHdpdGggZXJyb3IgaGFuZGxpbmcuXG4gKi9cbmZ1bmN0aW9uIHdyYXBIb29rV2l0aEVycm9ySGFuZGxpbmcoZnVuYywgb25FeGNlcHRpb24sIF90aGlzKSB7XG4gIGNvbnN0IGV4Y2VwdGlvbkhhbmRsZXIgPSBub3JtYWxpemVIb29rRXhjZXB0aW9uSGFuZGxlcihvbkV4Y2VwdGlvbik7XG4gIHJldHVybiBmdW5jdGlvbiBleGVjdXRlSG9va1dpdGhFcnJvckhhbmRsaW5nKC4uLmFyZ3MpIHtcbiAgICBsZXQgcmV0O1xuICAgIHRyeSB7XG4gICAgICByZXQgPSBmdW5jLmFwcGx5KF90aGlzLCBhcmdzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBleGNlcHRpb25IYW5kbGVyKGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZXMgYW4gZXhjZXB0aW9uIGhhbmRsZXIsIGVuc3VyaW5nIGl0IGlzIGEgZnVuY3Rpb24uXG4gKiBJZiBhIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCBpcyByZXR1cm5lZCBkaXJlY3RseS5cbiAqIElmIGEgc3RyaW5nIGlzIHByb3ZpZGVkLCBpdCBpcyB1c2VkIGFzIGEgZGVzY3JpcHRpb24gZm9yIGEgZGVmYXVsdCBoYW5kbGVyIHRoYXQgbG9ncyBleGNlcHRpb25zLlxuICogT3RoZXJ3aXNlLCBhIGdlbmVyaWMgZGVmYXVsdCBoYW5kbGVyIHRoYXQgbG9ncyBleGNlcHRpb25zIHdpdGggYSBkZWZhdWx0IGRlc2NyaXB0aW9uIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBleGNlcHRpb25IYW5kbGVyIFRoZSBleGNlcHRpb24gaGFuZGxlciB0byBub3JtYWxpemUuIENhbiBiZSBhIGZ1bmN0aW9uLFxuICogICBhIHN0cmluZyBkZXNjcmlwdGlvbiBmb3IgbG9nZ2luZywgb3IgYW55IG90aGVyIHZhbHVlICh3aGljaCBkZWZhdWx0cyB0byBnZW5lcmljIGxvZ2dpbmcpLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgaGFuZGxlcyBleGNlcHRpb25zLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVIb29rRXhjZXB0aW9uSGFuZGxlcihleGNlcHRpb25IYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgZXhjZXB0aW9uSGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIGV4Y2VwdGlvbkhhbmRsZXI7XG4gIH1cblxuICBjb25zdCBkZXNjcmlwdGlvbiA9XG4gICAgdHlwZW9mIGV4Y2VwdGlvbkhhbmRsZXIgPT09IFwic3RyaW5nXCIgPyBleGNlcHRpb25IYW5kbGVyIDogXCJjYWxsYmFjayBvZiBhc3luYyBmdW5jdGlvblwiO1xuXG4gIHJldHVybiBmdW5jdGlvbiBkZWZhdWx0SG9va0V4Y2VwdGlvbkhhbmRsZXIoZXJyb3IpIHtcbiAgICBNZXRlb3IuX2RlYnVnKGBFeGNlcHRpb24gaW4gJHtkZXNjcmlwdGlvbn1gLCBlcnJvcik7XG4gIH07XG59XG4iXX0=
