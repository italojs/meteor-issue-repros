Package["core-runtime"].queue("facts-base",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Facts;

var require = meteorInstall({"node_modules":{"meteor":{"facts-base":{"facts_base_server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/facts-base/facts_base_server.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({Facts:()=>Facts,FACTS_COLLECTION:()=>FACTS_COLLECTION,FACTS_PUBLICATION:()=>FACTS_PUBLICATION});let Facts,FACTS_COLLECTION,FACTS_PUBLICATION;module.link("./facts_base_common",{Facts(v){Facts=v},FACTS_COLLECTION(v){FACTS_COLLECTION=v},FACTS_PUBLICATION(v){FACTS_PUBLICATION=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
const hasOwn = Object.prototype.hasOwnProperty;
// This file is only used server-side, so no need to check Meteor.isServer.
// By default, we publish facts to no user if autopublish is off, and to all
// users if autopublish is on.
let userIdFilter = function() {
    return !!Package.autopublish;
};
// XXX make this take effect at runtime too?
Facts.setUserIdFilter = function(filter) {
    userIdFilter = filter;
};
// XXX Use a minimongo collection instead and hook up an observeChanges
// directly to a publish.
const factsByPackage = {};
let activeSubscriptions = [];
// Make internal state available to the server environment
Facts._factsByPackage = factsByPackage;
Facts._getActiveSubscriptions = function() {
    return activeSubscriptions;
};
Facts._setActiveSubscriptions = function(subs) {
    activeSubscriptions = subs;
};
Facts.incrementServerFact = function(pkg, fact, increment) {
    if (!hasOwn.call(factsByPackage, pkg)) {
        factsByPackage[pkg] = {};
        factsByPackage[pkg][fact] = increment;
        activeSubscriptions.forEach(function(sub) {
            sub.added(FACTS_COLLECTION, pkg, factsByPackage[pkg]);
        });
        return;
    }
    const packageFacts = factsByPackage[pkg];
    if (!hasOwn.call(packageFacts, fact)) {
        factsByPackage[pkg][fact] = 0;
    }
    factsByPackage[pkg][fact] += increment;
    const changedField = {};
    changedField[fact] = factsByPackage[pkg][fact];
    activeSubscriptions.forEach(function(sub) {
        sub.changed(FACTS_COLLECTION, pkg, changedField);
    });
};
Facts.resetServerFacts = function() {
    for(const pkg in factsByPackage){
        delete factsByPackage[pkg];
    }
};
// Deferred, because we have an unordered dependency on livedata.
// XXX is this safe? could somebody try to connect before Meteor.publish is
// called?
Meteor.defer(function() {
    // XXX Also publish facts-by-package.
    Meteor.publish(FACTS_PUBLICATION, function() {
        const sub = this;
        if (!userIdFilter(this.userId)) {
            sub.ready();
            return;
        }
        activeSubscriptions.push(sub);
        Object.keys(factsByPackage).forEach(function(pkg) {
            sub.added(FACTS_COLLECTION, pkg, factsByPackage[pkg]);
        });
        sub.onStop(function() {
            activeSubscriptions = activeSubscriptions.filter((activeSub)=>activeSub !== sub);
        });
        sub.ready();
    }, {
        is_auto: true
    });
});

//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"facts_base_common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/facts-base/facts_base_common.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({Facts:()=>Facts,FACTS_COLLECTION:()=>FACTS_COLLECTION,FACTS_PUBLICATION:()=>FACTS_PUBLICATION});const Facts = {};
const FACTS_COLLECTION = "meteor_Facts_server";
const FACTS_PUBLICATION = "meteor_facts";


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Facts: Facts
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/facts-base/facts_base_server.js"
  ],
  mainModulePath: "/node_modules/meteor/facts-base/facts_base_server.js"
}});

//# sourceURL=meteor://💻app/packages/facts-base.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjdHMtYmFzZS9mYWN0c19iYXNlX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjdHMtYmFzZS9mYWN0c19iYXNlX2NvbW1vbi5qcyJdLCJuYW1lcyI6WyJGYWN0cyIsIkZBQ1RTX0NPTExFQ1RJT04iLCJGQUNUU19QVUJMSUNBVElPTiIsImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwidXNlcklkRmlsdGVyIiwiUGFja2FnZSIsImF1dG9wdWJsaXNoIiwic2V0VXNlcklkRmlsdGVyIiwiZmlsdGVyIiwiZmFjdHNCeVBhY2thZ2UiLCJhY3RpdmVTdWJzY3JpcHRpb25zIiwiX2ZhY3RzQnlQYWNrYWdlIiwiX2dldEFjdGl2ZVN1YnNjcmlwdGlvbnMiLCJfc2V0QWN0aXZlU3Vic2NyaXB0aW9ucyIsInN1YnMiLCJpbmNyZW1lbnRTZXJ2ZXJGYWN0IiwicGtnIiwiZmFjdCIsImluY3JlbWVudCIsImNhbGwiLCJmb3JFYWNoIiwic3ViIiwiYWRkZWQiLCJwYWNrYWdlRmFjdHMiLCJjaGFuZ2VkRmllbGQiLCJjaGFuZ2VkIiwicmVzZXRTZXJ2ZXJGYWN0cyIsIk1ldGVvciIsImRlZmVyIiwicHVibGlzaCIsInVzZXJJZCIsInJlYWR5IiwicHVzaCIsImtleXMiLCJvblN0b3AiLCJhY3RpdmVTdWIiLCJpc19hdXRvIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsS0FBSyxFQUFFQyxnQkFBZ0IsRUFBRUMsaUJBQWlCLFFBQVEsc0JBQXNCO0FBRWpGLE1BQU1DLFNBQVNDLE9BQU9DLFNBQVMsQ0FBQ0MsY0FBYztBQUU5QywyRUFBMkU7QUFFM0UsNEVBQTRFO0FBQzVFLDhCQUE4QjtBQUM5QixJQUFJQyxlQUFlO0lBQ2pCLE9BQU8sQ0FBQyxDQUFDQyxRQUFRQyxXQUFXO0FBQzlCO0FBRUEsNENBQTRDO0FBQzVDVCxNQUFNVSxlQUFlLEdBQUcsU0FBVUMsTUFBTTtJQUN0Q0osZUFBZUk7QUFDakI7QUFFQSx1RUFBdUU7QUFDdkUseUJBQXlCO0FBQ3pCLE1BQU1DLGlCQUFpQixDQUFDO0FBQ3hCLElBQUlDLHNCQUFzQixFQUFFO0FBRTVCLDBEQUEwRDtBQUMxRGIsTUFBTWMsZUFBZSxHQUFHRjtBQUN4QlosTUFBTWUsdUJBQXVCLEdBQUc7SUFDOUIsT0FBT0Y7QUFDVDtBQUNBYixNQUFNZ0IsdUJBQXVCLEdBQUcsU0FBVUMsSUFBSTtJQUM1Q0osc0JBQXNCSTtBQUN4QjtBQUVBakIsTUFBTWtCLG1CQUFtQixHQUFHLFNBQVVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFQyxTQUFTO0lBQ3hELElBQUksQ0FBQ2xCLE9BQU9tQixJQUFJLENBQUNWLGdCQUFnQk8sTUFBTTtRQUNyQ1AsY0FBYyxDQUFDTyxJQUFJLEdBQUcsQ0FBQztRQUN2QlAsY0FBYyxDQUFDTyxJQUFJLENBQUNDLEtBQUssR0FBR0M7UUFDNUJSLG9CQUFvQlUsT0FBTyxDQUFDLFNBQVVDLEdBQUc7WUFDdkNBLElBQUlDLEtBQUssQ0FBQ3hCLGtCQUFrQmtCLEtBQUtQLGNBQWMsQ0FBQ08sSUFBSTtRQUN0RDtRQUNBO0lBQ0Y7SUFFQSxNQUFNTyxlQUFlZCxjQUFjLENBQUNPLElBQUk7SUFDeEMsSUFBSSxDQUFDaEIsT0FBT21CLElBQUksQ0FBQ0ksY0FBY04sT0FBTztRQUNwQ1IsY0FBYyxDQUFDTyxJQUFJLENBQUNDLEtBQUssR0FBRztJQUM5QjtJQUNBUixjQUFjLENBQUNPLElBQUksQ0FBQ0MsS0FBSyxJQUFJQztJQUM3QixNQUFNTSxlQUFlLENBQUM7SUFDdEJBLFlBQVksQ0FBQ1AsS0FBSyxHQUFHUixjQUFjLENBQUNPLElBQUksQ0FBQ0MsS0FBSztJQUM5Q1Asb0JBQW9CVSxPQUFPLENBQUMsU0FBVUMsR0FBRztRQUN2Q0EsSUFBSUksT0FBTyxDQUFDM0Isa0JBQWtCa0IsS0FBS1E7SUFDckM7QUFDRjtBQUVBM0IsTUFBTTZCLGdCQUFnQixHQUFHO0lBQ3ZCLElBQUssTUFBTVYsT0FBT1AsZUFBZ0I7UUFDaEMsT0FBT0EsY0FBYyxDQUFDTyxJQUFJO0lBQzVCO0FBQ0Y7QUFFQSxpRUFBaUU7QUFDakUsMkVBQTJFO0FBQzNFLFVBQVU7QUFDVlcsT0FBT0MsS0FBSyxDQUFDO0lBQ1gscUNBQXFDO0lBQ3JDRCxPQUFPRSxPQUFPLENBQ1o5QixtQkFDQTtRQUNFLE1BQU1zQixNQUFNLElBQUk7UUFDaEIsSUFBSSxDQUFDakIsYUFBYSxJQUFJLENBQUMwQixNQUFNLEdBQUc7WUFDOUJULElBQUlVLEtBQUs7WUFDVDtRQUNGO1FBRUFyQixvQkFBb0JzQixJQUFJLENBQUNYO1FBQ3pCcEIsT0FBT2dDLElBQUksQ0FBQ3hCLGdCQUFnQlcsT0FBTyxDQUFDLFNBQVVKLEdBQUc7WUFDL0NLLElBQUlDLEtBQUssQ0FBQ3hCLGtCQUFrQmtCLEtBQUtQLGNBQWMsQ0FBQ08sSUFBSTtRQUN0RDtRQUNBSyxJQUFJYSxNQUFNLENBQUM7WUFDVHhCLHNCQUFzQkEsb0JBQW9CRixNQUFNLENBQUMsQ0FBQzJCLFlBQWNBLGNBQWNkO1FBQ2hGO1FBQ0FBLElBQUlVLEtBQUs7SUFDWCxHQUNBO1FBQUVLLFNBQVM7SUFBSztBQUVwQjtBQUVzRDs7Ozs7Ozs7Ozs7OztBQ3RGdEQsTUFBTXZDLFFBQVEsQ0FBQztBQUNmLE1BQU1DLG1CQUFtQjtBQUN6QixNQUFNQyxvQkFBb0I7QUFFNEIiLCJmaWxlIjoiL3BhY2thZ2VzL2ZhY3RzLWJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGYWN0cywgRkFDVFNfQ09MTEVDVElPTiwgRkFDVFNfUFVCTElDQVRJT04gfSBmcm9tIFwiLi9mYWN0c19iYXNlX2NvbW1vblwiO1xuXG5jb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBUaGlzIGZpbGUgaXMgb25seSB1c2VkIHNlcnZlci1zaWRlLCBzbyBubyBuZWVkIHRvIGNoZWNrIE1ldGVvci5pc1NlcnZlci5cblxuLy8gQnkgZGVmYXVsdCwgd2UgcHVibGlzaCBmYWN0cyB0byBubyB1c2VyIGlmIGF1dG9wdWJsaXNoIGlzIG9mZiwgYW5kIHRvIGFsbFxuLy8gdXNlcnMgaWYgYXV0b3B1Ymxpc2ggaXMgb24uXG5sZXQgdXNlcklkRmlsdGVyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gISFQYWNrYWdlLmF1dG9wdWJsaXNoO1xufTtcblxuLy8gWFhYIG1ha2UgdGhpcyB0YWtlIGVmZmVjdCBhdCBydW50aW1lIHRvbz9cbkZhY3RzLnNldFVzZXJJZEZpbHRlciA9IGZ1bmN0aW9uIChmaWx0ZXIpIHtcbiAgdXNlcklkRmlsdGVyID0gZmlsdGVyO1xufTtcblxuLy8gWFhYIFVzZSBhIG1pbmltb25nbyBjb2xsZWN0aW9uIGluc3RlYWQgYW5kIGhvb2sgdXAgYW4gb2JzZXJ2ZUNoYW5nZXNcbi8vIGRpcmVjdGx5IHRvIGEgcHVibGlzaC5cbmNvbnN0IGZhY3RzQnlQYWNrYWdlID0ge307XG5sZXQgYWN0aXZlU3Vic2NyaXB0aW9ucyA9IFtdO1xuXG4vLyBNYWtlIGludGVybmFsIHN0YXRlIGF2YWlsYWJsZSB0byB0aGUgc2VydmVyIGVudmlyb25tZW50XG5GYWN0cy5fZmFjdHNCeVBhY2thZ2UgPSBmYWN0c0J5UGFja2FnZTtcbkZhY3RzLl9nZXRBY3RpdmVTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gYWN0aXZlU3Vic2NyaXB0aW9ucztcbn07XG5GYWN0cy5fc2V0QWN0aXZlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIChzdWJzKSB7XG4gIGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSBzdWJzO1xufTtcblxuRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdCA9IGZ1bmN0aW9uIChwa2csIGZhY3QsIGluY3JlbWVudCkge1xuICBpZiAoIWhhc093bi5jYWxsKGZhY3RzQnlQYWNrYWdlLCBwa2cpKSB7XG4gICAgZmFjdHNCeVBhY2thZ2VbcGtnXSA9IHt9O1xuICAgIGZhY3RzQnlQYWNrYWdlW3BrZ11bZmFjdF0gPSBpbmNyZW1lbnQ7XG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzdWIpIHtcbiAgICAgIHN1Yi5hZGRlZChGQUNUU19DT0xMRUNUSU9OLCBwa2csIGZhY3RzQnlQYWNrYWdlW3BrZ10pO1xuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VGYWN0cyA9IGZhY3RzQnlQYWNrYWdlW3BrZ107XG4gIGlmICghaGFzT3duLmNhbGwocGFja2FnZUZhY3RzLCBmYWN0KSkge1xuICAgIGZhY3RzQnlQYWNrYWdlW3BrZ11bZmFjdF0gPSAwO1xuICB9XG4gIGZhY3RzQnlQYWNrYWdlW3BrZ11bZmFjdF0gKz0gaW5jcmVtZW50O1xuICBjb25zdCBjaGFuZ2VkRmllbGQgPSB7fTtcbiAgY2hhbmdlZEZpZWxkW2ZhY3RdID0gZmFjdHNCeVBhY2thZ2VbcGtnXVtmYWN0XTtcbiAgYWN0aXZlU3Vic2NyaXB0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzdWIpIHtcbiAgICBzdWIuY2hhbmdlZChGQUNUU19DT0xMRUNUSU9OLCBwa2csIGNoYW5nZWRGaWVsZCk7XG4gIH0pO1xufTtcblxuRmFjdHMucmVzZXRTZXJ2ZXJGYWN0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yIChjb25zdCBwa2cgaW4gZmFjdHNCeVBhY2thZ2UpIHtcbiAgICBkZWxldGUgZmFjdHNCeVBhY2thZ2VbcGtnXTtcbiAgfVxufTtcblxuLy8gRGVmZXJyZWQsIGJlY2F1c2Ugd2UgaGF2ZSBhbiB1bm9yZGVyZWQgZGVwZW5kZW5jeSBvbiBsaXZlZGF0YS5cbi8vIFhYWCBpcyB0aGlzIHNhZmU/IGNvdWxkIHNvbWVib2R5IHRyeSB0byBjb25uZWN0IGJlZm9yZSBNZXRlb3IucHVibGlzaCBpc1xuLy8gY2FsbGVkP1xuTWV0ZW9yLmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgLy8gWFhYIEFsc28gcHVibGlzaCBmYWN0cy1ieS1wYWNrYWdlLlxuICBNZXRlb3IucHVibGlzaChcbiAgICBGQUNUU19QVUJMSUNBVElPTixcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBzdWIgPSB0aGlzO1xuICAgICAgaWYgKCF1c2VySWRGaWx0ZXIodGhpcy51c2VySWQpKSB7XG4gICAgICAgIHN1Yi5yZWFkeSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMucHVzaChzdWIpO1xuICAgICAgT2JqZWN0LmtleXMoZmFjdHNCeVBhY2thZ2UpLmZvckVhY2goZnVuY3Rpb24gKHBrZykge1xuICAgICAgICBzdWIuYWRkZWQoRkFDVFNfQ09MTEVDVElPTiwgcGtnLCBmYWN0c0J5UGFja2FnZVtwa2ddKTtcbiAgICAgIH0pO1xuICAgICAgc3ViLm9uU3RvcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSBhY3RpdmVTdWJzY3JpcHRpb25zLmZpbHRlcigoYWN0aXZlU3ViKSA9PiBhY3RpdmVTdWIgIT09IHN1Yik7XG4gICAgICB9KTtcbiAgICAgIHN1Yi5yZWFkeSgpO1xuICAgIH0sXG4gICAgeyBpc19hdXRvOiB0cnVlIH0sXG4gICk7XG59KTtcblxuZXhwb3J0IHsgRmFjdHMsIEZBQ1RTX0NPTExFQ1RJT04sIEZBQ1RTX1BVQkxJQ0FUSU9OIH07XG4iLCJjb25zdCBGYWN0cyA9IHt9O1xuY29uc3QgRkFDVFNfQ09MTEVDVElPTiA9IFwibWV0ZW9yX0ZhY3RzX3NlcnZlclwiO1xuY29uc3QgRkFDVFNfUFVCTElDQVRJT04gPSBcIm1ldGVvcl9mYWN0c1wiO1xuXG5leHBvcnQgeyBGYWN0cywgRkFDVFNfQ09MTEVDVElPTiwgRkFDVFNfUFVCTElDQVRJT04gfTtcbiJdfQ==
