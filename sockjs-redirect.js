'use strict';

// In a real Meteor server, `Meteor._debug` is a global. This standalone repro
// shims it so the file runs under plain Node and the diagnostic log is visible.
const Meteor = { _debug: (...a) => console.error('[Meteor._debug]', ...a) };

// Faithful, standalone copy of the listener-overshadowing logic that Meteor's
// SockJS transport installs on the HTTP server:
//   packages/ddp-server/transports/sockjs.js -> redirectWebsocketEndpoint()
//
// SockJS removes every existing 'request'/'upgrade' listener and reinstalls a
// wrapper (`newListener`) that runs BEFORE the connect/webapp stack. Because
// that wrapper is a plain EventEmitter listener — not connect middleware — any
// exception it throws is uncaught and takes the whole process down.
//
// The `fixed` flag toggles between the current devel behavior and the proposed
// fix (wrap the URL parse/rewrite in try/catch).
function redirectWebsocketEndpoint(httpServer, pathPrefix, sockjsPrefix, opts) {
  const fixed = !!(opts && opts.fixed);

  ['request', 'upgrade'].forEach((event) => {
    const oldHttpServerListeners = httpServer.listeners(event).slice(0);
    httpServer.removeAllListeners(event);

    // request and upgrade have different arguments passed but
    // we only care about the first one which is always request
    const newListener = function (request /*, moreArguments */) {
      // Store arguments for use within the closure below
      const args = arguments;

      if (fixed) {
        // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while
        // preserving query string. A malformed request URL must not crash the
        // process; if it cannot be parsed, leave it untouched and let the
        // normal request stack respond.
        try {
          const parsedUrl = new URL(request.url, 'http://localhost');
          if (parsedUrl.pathname === pathPrefix + '/websocket' ||
              parsedUrl.pathname === pathPrefix + '/websocket/') {
            parsedUrl.pathname = sockjsPrefix + '/websocket';
            request.url = parsedUrl.pathname + parsedUrl.search;
          }
        } catch (err) {
          // Malformed request URL — leave request.url untouched.
          Meteor._debug('sockjs: could not parse request URL, skipping websocket rewrite', request.url, err);
        }
      } else {
        // ==== verbatim current devel behavior ====
        // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while
        // preserving query string.
        const parsedUrl = new URL(request.url, 'http://localhost'); // <-- throws on '//'
        if (parsedUrl.pathname === pathPrefix + '/websocket' ||
            parsedUrl.pathname === pathPrefix + '/websocket/') {
          parsedUrl.pathname = sockjsPrefix + '/websocket';
          request.url = parsedUrl.pathname + parsedUrl.search;
        }
      }

      oldHttpServerListeners.forEach(function (oldListener) {
        oldListener.apply(httpServer, args);
      });
    };
    httpServer.addListener(event, newListener);
  });
}

module.exports = { redirectWebsocketEndpoint };
