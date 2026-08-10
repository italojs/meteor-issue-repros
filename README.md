# Repro — meteor/meteor#14654

**accounts-base: server always mounts `/_accounts/cookie/*` endpoints even when `useHttpOnlyCookies` is disabled; unbounded request body on `/set`**

Issue: https://github.com/meteor/meteor/issues/14654
Fix PR: https://github.com/meteor/meteor/pull/14657

## What happens

Since `accounts-base` 3.3.0 (Meteor 3.5), `server_main.js` unconditionally
imports `server_http_cookies.js`, registering three HTTP endpoints on
**every** Meteor server, even when the app never enabled
`useHttpOnlyCookies`:

- `POST /_accounts/cookie/set`
- `GET /_accounts/cookie/refresh`
- `POST /_accounts/cookie/clear`

On top of that, `/set` accumulates the entire request body in memory
(`data += chunk`) with no size limit before any validation.

## How to reproduce

The app in this branch is `meteor create app --release 3.5.1 --minimal` +
`meteor add accounts-base`. Zero accounts code — the feature is never
enabled.

```bash
cd app
meteor run --port 4654
# in another shell:
curl -i -X POST http://localhost:4654/_accounts/cookie/set -H 'content-type: application/json' -d '{}'
curl -i http://localhost:4654/_accounts/cookie/refresh
curl -i -X POST http://localhost:4654/_accounts/cookie/clear
```

**Expected:** 404 (fall-through to the app's own routing), since the feature is disabled.

## Actual behavior (Meteor 3.5.1 — BEFORE the fix)

All three endpoints answer from the package handlers:

```
--- POST /set
HTTP/1.1 400 Bad Request          # {"error":"invalid_token"} — handler is live
--- GET /refresh
HTTP/1.1 204 No Content           # handler is live
--- POST /clear
HTTP/1.1 200 OK
set-cookie: meteor_login_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
```

Unbounded body on `/set` — the server reads the **entire** payload before validating:

```
# 10 MB:
$ curl -s -o /dev/null -w '%{http_code} sent=%{size_upload}\n' -X POST .../set --data-binary @10mb.json
400 sent=10000024                 # 10 MB buffered in memory before the 400

# 5 MB:
$ curl -s -w '%{http_code} sent=%{size_upload}\n' -X POST .../set --data-binary @5mb.json
{"error":"invalid_token"}400 sent=5000010
```

## Behavior with the fix (`devel` checkout + patch)

Running the same app against the patched checkout
(`/path/to/meteor-source/meteor run --port 4654`):

**Feature disabled (default) — endpoints fall through to the app's routing:**

```
--- POST /set
HTTP/1.1 405 Method Not Allowed      # webapp fall-through, no Set-Cookie, no JSON
allow: OPTIONS, GET, HEAD
--- GET /refresh
HTTP/1.1 200 OK                      # app HTML (fall-through), no DB lookup
content-type: text/html; charset=utf-8
--- POST /clear
HTTP/1.1 405 Method Not Allowed      # fall-through, no Set-Cookie
```

**Feature enabled** (`meteor run --settings ../settings-enabled.json`, which sets
`public.packages.accounts.useHttpOnlyCookies: true`) — endpoints work as before:

```
--- GET /refresh
HTTP/1.1 204 No Content
--- POST /clear
HTTP/1.1 200 OK
set-cookie: meteor_login_token=; ... HttpOnly; SameSite=Lax
--- POST /set {}
{"error":"invalid_token"} [400]
```

**Body now capped (4 KB) even with the feature enabled:**

```
--- POST /set 5KB
{"error":"body_too_large"} [413]
--- POST /set 5MB
{"error":"body_too_large"} [413] sent=2940408   # server answered mid-upload;
                                                # before, the full 5 MB was buffered
```

The gate is checked per request and accepts both
`Accounts.config({ useHttpOnlyCookies: true })` on the server (typically in
`Meteor.startup`) and
`Meteor.settings.public.packages.accounts.useHttpOnlyCookies` — the two
documented ways of enabling the feature.
