'use strict';

// Reproduction for meteor/meteor#14594
//
// A malformed request URL (e.g. `//` or `//%5Cexample.com`) reaches Meteor's
// SockJS transport, which calls `new URL(request.url, 'http://localhost')`
// inside a raw HTTP 'request'/'upgrade' listener. `new URL('//', ...)` throws
// `TypeError: Invalid URL`, and because the listener is a plain EventEmitter
// callback (not connect middleware), the exception is uncaught and crashes the
// whole server process.
//
// We stand up a real http.Server, install the exact sockjs listener logic, and
// drive it with raw TCP so the request-target is not normalized by an HTTP
// client (browsers send the raw `//`).
//
//   node repro.js buggy   -> crashes with an uncaught TypeError (current devel)
//   node repro.js fixed   -> answers every request, no crash (proposed fix)

const http = require('http');
const net = require('net');
const { redirectWebsocketEndpoint } = require('./sockjs-redirect');

const MODE = process.argv[2] === 'fixed' ? 'fixed' : 'buggy';
const BAD_URLS = ['//', '//%5Cexample.com'];

// Stand-in for the Meteor connect/webapp request stack.
const server = http.createServer((req, res) => {
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('handled by app stack: ' + req.url + '\n');
});

// Install sockjs's listener-overshadowing wrapper (buggy or fixed).
redirectWebsocketEndpoint(server, '', '/sockjs', { fixed: MODE === 'fixed' });

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  console.log(`[${MODE}] listening on 127.0.0.1:${port}`);
  sendNext(port, BAD_URLS.slice());
});

// Send each bad URL as a raw HTTP request over a bare TCP socket, so the
// request-target hits the server exactly as written.
function sendNext(port, urls) {
  if (urls.length === 0) {
    console.log(`[${MODE}] ✅ all ${BAD_URLS.length} malformed requests handled — server still alive`);
    server.close();
    return;
  }
  const url = urls.shift();
  const sock = net.connect(port, '127.0.0.1', () => {
    console.log(`[${MODE}] --> GET ${url}`);
    sock.write(`GET ${url} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n`);
  });
  let buf = '';
  sock.on('data', (d) => { buf += d.toString(); });
  sock.on('close', () => {
    console.log(`[${MODE}] <-- ${buf.split('\r\n')[0] || '(no response)'}`);
    sendNext(port, urls);
  });
  sock.on('error', (err) => {
    console.log(`[${MODE}] socket error: ${err.message}`);
    sendNext(port, urls);
  });
}
