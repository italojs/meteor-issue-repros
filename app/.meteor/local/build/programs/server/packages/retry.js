Package["core-runtime"].queue("retry",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Retry;

var require = meteorInstall({"node_modules":{"meteor":{"retry":{"retry.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/retry/retry.js                                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({Retry:()=>Retry});// Retry logic with an exponential backoff.
//
// options:
//  baseTimeout: time for initial reconnect attempt (ms).
//  exponent: exponential factor to increase timeout each attempt.
//  maxTimeout: maximum time between retries (ms).
//  minCount: how many times to reconnect "instantly".
//  minTimeout: time to wait for the first `minCount` retries (ms).
//  fuzz: factor to randomize retry times by (to avoid retry storms).
class Retry {
    // Reset a pending retry, if any.
    clear() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
        }
        this.retryTimer = null;
    }
    // Calculate how long to wait in milliseconds to retry, based on the
    // `count` of which retry this is.
    _timeout(count) {
        if (count < this.minCount) {
            return this.minTimeout;
        }
        // fuzz the timeout randomly, to avoid reconnect storms when a
        // server goes down.
        const timeout = Math.min(this.maxTimeout, this.baseTimeout * Math.pow(this.exponent, count)) * (Random.fraction() * this.fuzz + (1 - this.fuzz / 2));
        return timeout;
    }
    // Call `fn` after a delay, based on the `count` of which retry this is.
    retryLater(count, fn) {
        const timeout = this._timeout(count);
        if (this.retryTimer) clearTimeout(this.retryTimer);
        this.retryTimer = Meteor.setTimeout(fn, timeout);
        return timeout;
    }
    constructor({ baseTimeout = 1000, exponent = 2.2, // The default is high-ish to ensure a server can recover from a
    // failure caused by load.
    maxTimeout = 5 * 60 * 1000, minTimeout = 10, minCount = 2, fuzz = 0.5 } = {}){
        this.baseTimeout = baseTimeout;
        this.exponent = exponent;
        this.maxTimeout = maxTimeout;
        this.minTimeout = minTimeout;
        this.minCount = minCount;
        this.fuzz = fuzz;
        this.retryTimer = null;
    }
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
      Retry: Retry
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/retry/retry.js"
  ],
  mainModulePath: "/node_modules/meteor/retry/retry.js"
}});

//# sourceURL=meteor://💻app/packages/retry.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmV0cnkvcmV0cnkuanMiXSwibmFtZXMiOlsiUmV0cnkiLCJjbGVhciIsInJldHJ5VGltZXIiLCJjbGVhclRpbWVvdXQiLCJfdGltZW91dCIsImNvdW50IiwibWluQ291bnQiLCJtaW5UaW1lb3V0IiwidGltZW91dCIsIk1hdGgiLCJtaW4iLCJtYXhUaW1lb3V0IiwiYmFzZVRpbWVvdXQiLCJwb3ciLCJleHBvbmVudCIsIlJhbmRvbSIsImZyYWN0aW9uIiwiZnV6eiIsInJldHJ5TGF0ZXIiLCJmbiIsIk1ldGVvciIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUEyQztBQUMzQyxFQUFFO0FBQ0YsV0FBVztBQUNYLHlEQUF5RDtBQUN6RCxrRUFBa0U7QUFDbEUsa0RBQWtEO0FBQ2xELHNEQUFzRDtBQUN0RCxtRUFBbUU7QUFDbkUscUVBQXFFO0FBRXJFLE9BQU8sTUFBTUE7SUFvQlgsaUNBQWlDO0lBQ2pDQyxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUNDLFVBQVUsRUFBRTtZQUNuQkMsYUFBYSxJQUFJLENBQUNELFVBQVU7UUFDOUI7UUFDQSxJQUFJLENBQUNBLFVBQVUsR0FBRztJQUNwQjtJQUVBLG9FQUFvRTtJQUNwRSxrQ0FBa0M7SUFDbENFLFNBQVNDLEtBQUssRUFBRTtRQUNkLElBQUlBLFFBQVEsSUFBSSxDQUFDQyxRQUFRLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUNDLFVBQVU7UUFDeEI7UUFFQSw4REFBOEQ7UUFDOUQsb0JBQW9CO1FBQ3BCLE1BQU1DLFVBQ0pDLEtBQUtDLEdBQUcsQ0FBQyxJQUFJLENBQUNDLFVBQVUsRUFBRSxJQUFJLENBQUNDLFdBQVcsR0FBR0gsS0FBS0ksR0FBRyxDQUFDLElBQUksQ0FBQ0MsUUFBUSxFQUFFVCxVQUNwRVUsUUFBT0MsUUFBUSxLQUFLLElBQUksQ0FBQ0MsSUFBSSxHQUFJLEtBQUksSUFBSSxDQUFDQSxJQUFJLEdBQUcsRUFBQztRQUVyRCxPQUFPVDtJQUNUO0lBRUEsd0VBQXdFO0lBQ3hFVSxXQUFXYixLQUFLLEVBQUVjLEVBQUUsRUFBRTtRQUNwQixNQUFNWCxVQUFVLElBQUksQ0FBQ0osUUFBUSxDQUFDQztRQUM5QixJQUFJLElBQUksQ0FBQ0gsVUFBVSxFQUFFQyxhQUFhLElBQUksQ0FBQ0QsVUFBVTtRQUNqRCxJQUFJLENBQUNBLFVBQVUsR0FBR2tCLE9BQU9DLFVBQVUsQ0FBQ0YsSUFBSVg7UUFDeEMsT0FBT0E7SUFDVDtJQWpEQSxZQUFZLEVBQ1ZJLGNBQWMsSUFBSSxFQUNsQkUsV0FBVyxHQUFHLEVBQ2QsZ0VBQWdFO0lBQ2hFLDBCQUEwQjtJQUMxQkgsYUFBYSxJQUFJLEtBQUssSUFBSSxFQUMxQkosYUFBYSxFQUFFLEVBQ2ZELFdBQVcsQ0FBQyxFQUNaVyxPQUFPLEdBQUcsRUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFFO1FBQ04sSUFBSSxDQUFDTCxXQUFXLEdBQUdBO1FBQ25CLElBQUksQ0FBQ0UsUUFBUSxHQUFHQTtRQUNoQixJQUFJLENBQUNILFVBQVUsR0FBR0E7UUFDbEIsSUFBSSxDQUFDSixVQUFVLEdBQUdBO1FBQ2xCLElBQUksQ0FBQ0QsUUFBUSxHQUFHQTtRQUNoQixJQUFJLENBQUNXLElBQUksR0FBR0E7UUFDWixJQUFJLENBQUNmLFVBQVUsR0FBRztJQUNwQjtBQWlDRiIsImZpbGUiOiIvcGFja2FnZXMvcmV0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZXRyeSBsb2dpYyB3aXRoIGFuIGV4cG9uZW50aWFsIGJhY2tvZmYuXG4vL1xuLy8gb3B0aW9uczpcbi8vICBiYXNlVGltZW91dDogdGltZSBmb3IgaW5pdGlhbCByZWNvbm5lY3QgYXR0ZW1wdCAobXMpLlxuLy8gIGV4cG9uZW50OiBleHBvbmVudGlhbCBmYWN0b3IgdG8gaW5jcmVhc2UgdGltZW91dCBlYWNoIGF0dGVtcHQuXG4vLyAgbWF4VGltZW91dDogbWF4aW11bSB0aW1lIGJldHdlZW4gcmV0cmllcyAobXMpLlxuLy8gIG1pbkNvdW50OiBob3cgbWFueSB0aW1lcyB0byByZWNvbm5lY3QgXCJpbnN0YW50bHlcIi5cbi8vICBtaW5UaW1lb3V0OiB0aW1lIHRvIHdhaXQgZm9yIHRoZSBmaXJzdCBgbWluQ291bnRgIHJldHJpZXMgKG1zKS5cbi8vICBmdXp6OiBmYWN0b3IgdG8gcmFuZG9taXplIHJldHJ5IHRpbWVzIGJ5ICh0byBhdm9pZCByZXRyeSBzdG9ybXMpLlxuXG5leHBvcnQgY2xhc3MgUmV0cnkge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgYmFzZVRpbWVvdXQgPSAxMDAwLFxuICAgIGV4cG9uZW50ID0gMi4yLFxuICAgIC8vIFRoZSBkZWZhdWx0IGlzIGhpZ2gtaXNoIHRvIGVuc3VyZSBhIHNlcnZlciBjYW4gcmVjb3ZlciBmcm9tIGFcbiAgICAvLyBmYWlsdXJlIGNhdXNlZCBieSBsb2FkLlxuICAgIG1heFRpbWVvdXQgPSA1ICogNjAgKiAxMDAwLFxuICAgIG1pblRpbWVvdXQgPSAxMCxcbiAgICBtaW5Db3VudCA9IDIsXG4gICAgZnV6eiA9IDAuNSxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5iYXNlVGltZW91dCA9IGJhc2VUaW1lb3V0O1xuICAgIHRoaXMuZXhwb25lbnQgPSBleHBvbmVudDtcbiAgICB0aGlzLm1heFRpbWVvdXQgPSBtYXhUaW1lb3V0O1xuICAgIHRoaXMubWluVGltZW91dCA9IG1pblRpbWVvdXQ7XG4gICAgdGhpcy5taW5Db3VudCA9IG1pbkNvdW50O1xuICAgIHRoaXMuZnV6eiA9IGZ1eno7XG4gICAgdGhpcy5yZXRyeVRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIC8vIFJlc2V0IGEgcGVuZGluZyByZXRyeSwgaWYgYW55LlxuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5yZXRyeVRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXRyeVRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5yZXRyeVRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBob3cgbG9uZyB0byB3YWl0IGluIG1pbGxpc2Vjb25kcyB0byByZXRyeSwgYmFzZWQgb24gdGhlXG4gIC8vIGBjb3VudGAgb2Ygd2hpY2ggcmV0cnkgdGhpcyBpcy5cbiAgX3RpbWVvdXQoY291bnQpIHtcbiAgICBpZiAoY291bnQgPCB0aGlzLm1pbkNvdW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5UaW1lb3V0O1xuICAgIH1cblxuICAgIC8vIGZ1enogdGhlIHRpbWVvdXQgcmFuZG9tbHksIHRvIGF2b2lkIHJlY29ubmVjdCBzdG9ybXMgd2hlbiBhXG4gICAgLy8gc2VydmVyIGdvZXMgZG93bi5cbiAgICBjb25zdCB0aW1lb3V0ID1cbiAgICAgIE1hdGgubWluKHRoaXMubWF4VGltZW91dCwgdGhpcy5iYXNlVGltZW91dCAqIE1hdGgucG93KHRoaXMuZXhwb25lbnQsIGNvdW50KSkgKlxuICAgICAgKFJhbmRvbS5mcmFjdGlvbigpICogdGhpcy5mdXp6ICsgKDEgLSB0aGlzLmZ1enogLyAyKSk7XG5cbiAgICByZXR1cm4gdGltZW91dDtcbiAgfVxuXG4gIC8vIENhbGwgYGZuYCBhZnRlciBhIGRlbGF5LCBiYXNlZCBvbiB0aGUgYGNvdW50YCBvZiB3aGljaCByZXRyeSB0aGlzIGlzLlxuICByZXRyeUxhdGVyKGNvdW50LCBmbikge1xuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0KGNvdW50KTtcbiAgICBpZiAodGhpcy5yZXRyeVRpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5yZXRyeVRpbWVyKTtcbiAgICB0aGlzLnJldHJ5VGltZXIgPSBNZXRlb3Iuc2V0VGltZW91dChmbiwgdGltZW91dCk7XG4gICAgcmV0dXJuIHRpbWVvdXQ7XG4gIH1cbn1cbiJdfQ==
