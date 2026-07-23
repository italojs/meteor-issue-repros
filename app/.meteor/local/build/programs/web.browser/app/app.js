var require = meteorInstall({"client":{"main.html":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// client/main.html                                                             //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
module.link("./template.main.js", { "*": "*+" });

//////////////////////////////////////////////////////////////////////////////////

},"template.main.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// client/template.main.js                                                      //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //

(function () {
  var renderFunc = (function() {
  var view = this;
  return Spacebars.include(view.lookupTemplate("repro"));
});
  Template.body.addContent(renderFunc);
  Meteor.startup(Template.body.renderToDocument);
  if (typeof module === "object" && module.hot) {
    module.hot.accept();
    module.hot.dispose(function () {
      var index = Template.body.contentRenderFuncs.indexOf(renderFunc)
      Template.body.contentRenderFuncs.splice(index, 1);
      Template._applyHmrChanges();
    });
  }
})();

Template._migrateTemplate(
  "repro",
  new Template("Template.repro", (function() {
  var view = this;
  return HTML.MAIN(HTML.Raw("\n    <h1>ChangeStreamHistoryLost restart-loop repro</h1>\n    <p>\n      Run the steps in order, then watch the <strong>server console</strong>:\n      after step 3 it should loop forever with\n      <code>ChangeStream error: ... code: 286 (ChangeStreamHistoryLost)</code>.\n    </p>\n\n    "), HTML.OL(HTML.Raw('\n      <li>\n        <button class="js-insert">1. Insert quiet doc</button>\n        <span class="hint">one change event on <code>quiet</code> so the driver stores a resume token</span>\n      </li>\n      '), HTML.LI("\n        ", HTML.BUTTON({
    class: "js-roll",
    disabled: function() {
      return Spacebars.mustache(view.lookup("rolling"));
    }
  }, "2. Roll the oplog"), "\n        ", HTML.SPAN({
    class: "hint"
  }, HTML.Raw("bulk-writes to <code>noise</code> until the token falls out of the 8MB dev oplog"), Blaze.If(function() {
    return Spacebars.call(view.lookup("rolling"));
  }, function() {
    return " — running please wait about a minute...";
  })), "\n      "), HTML.Raw('\n      <li>\n        <button class="js-kill">3. Kill change-stream cursor</button>\n        <span class="hint">forces a resume with the stale token → infinite 286 loop</span>\n      </li>\n    ')), HTML.Raw('\n\n    <p>\n      <button class="js-status">Refresh status</button>\n    </p>\n\n    '), Spacebars.With(function() {
    return Spacebars.call(view.lookup("status"));
  }, function() {
    return [ "\n      ", HTML.TABLE("\n        ", HTML.TR(HTML.Raw("<td>DB</td>"), HTML.TD(Blaze.View("lookup:dbName", function() {
      return Spacebars.mustache(view.lookup("dbName"));
    }))), "\n        ", HTML.TR(HTML.Raw("<td>Observed change events</td>"), HTML.TD(Blaze.View("lookup:observedEvents", function() {
      return Spacebars.mustache(view.lookup("observedEvents"));
    }))), "\n        ", HTML.TR(HTML.Raw("<td>Last quiet insert (unix sec)</td>"), HTML.TD(Blaze.View("lookup:lastQuietInsertSec", function() {
      return Spacebars.mustache(view.lookup("lastQuietInsertSec"));
    }))), "\n        ", HTML.TR(HTML.Raw("<td>Oldest oplog entry (unix sec)</td>"), HTML.TD(Blaze.View("lookup:oldestOplogSec", function() {
      return Spacebars.mustache(view.lookup("oldestOplogSec"));
    }))), "\n        ", HTML.TR(HTML.Raw("<td>Resume token rolled out of oplog</td>"), HTML.TD(HTML.STRONG(Blaze.View("lookup:tokenRolledOut", function() {
      return Spacebars.mustache(view.lookup("tokenRolledOut"));
    })))), "\n        ", HTML.TR(HTML.Raw("<td>Change-stream cursors on <code>quiet</code></td>"), HTML.TD(Blaze.View("lookup:changeStreamCursors", function() {
      return Spacebars.mustache(view.lookup("changeStreamCursors"));
    }))), "\n      "), "\n    " ];
  }), HTML.Raw("\n\n    <h2>Log</h2>\n    "), HTML.PRE({
    class: "log"
  }, Blaze.Each(function() {
    return {
      _sequence: Spacebars.call(view.lookup("log")),
      _variable: "line"
    };
  }, function() {
    return [ Blaze.View("lookup:line", function() {
      return Spacebars.mustache(view.lookup("line"));
    }), "\n" ];
  })), "\n  ");
}))
);
if (typeof module === "object" && module.hot) {
  module.hot.accept();
  module.hot.dispose(function () {
    Template.__pendingReplacement.push("repro");
    Template._applyHmrChanges("repro");
  });
}

//////////////////////////////////////////////////////////////////////////////////

}},"_build":{"main-dev":{"client-meteor.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// _build/main-dev/client-meteor.js                                             //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
module.link('../.././client/main.html');/**
* @file client-meteor.js
* @description Meteor runtime file that imports the Rspack bundle
* --------------------------------------------------------------------------
* ☄️ Meteor Client App (Development)
* --------------------------------------------------------------------------
* • [   client-entry.js ] ──▶ [   client-rspack.js ] ──▶ [■ client-meteor.js ]
*
* This file overrides the corresponding `meteor.mainModule.client` entry in
* package.json. Meteor loads it at runtime, and it imports the Rspack
* bundle (`client-rspack.js`) so the application executes using the build
* produced by Rspack.
*
* ⚠️ Note: This file is autogenerated. It is not meant to be modified manually.
* These files also act as a cache: they can be safely removed and will be
* regenerated on the next build. They should be ignored in IDE suggestions
* and version control.
*/ /* No link to ⚡ Rspack Client App as served by HMR server */ /* Polyfill globalThis.module, exports & module for legacy */ if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.module === 'undefined') {
        globalThis.module = {
            exports: {}
        };
    }
    if (typeof globalThis.exports === 'undefined') {
        globalThis.exports = globalThis.module.exports;
    }
}
if (typeof window.module === 'undefined') {
    window.module = {
        exports: {}
    };
}
function lazyExternalImports1() {
    require('meteor/meteor');
    require('meteor/templating');
    require('meteor/reactive-var');
}
// (function eagerExternalImports2() {
 // })

//////////////////////////////////////////////////////////////////////////////////

}}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".css"
  ]
});

require("/_build/main-dev/client-meteor.js");