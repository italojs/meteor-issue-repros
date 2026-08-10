# Repro — meteor/meteor#14654

**accounts-base: server always mounts `/_accounts/cookie/*` endpoints even when `useHttpOnlyCookies` is disabled; unbounded request body on `/set`**

Issue: https://github.com/meteor/meteor/issues/14654

## O que acontece

Desde o `accounts-base` 3.3.0 (Meteor 3.5), `server_main.js` importa
`server_http_cookies.js` incondicionalmente, registrando três endpoints HTTP em
**todo** servidor Meteor, mesmo que o app nunca tenha habilitado
`useHttpOnlyCookies`:

- `POST /_accounts/cookie/set`
- `GET /_accounts/cookie/refresh`
- `POST /_accounts/cookie/clear`

Além disso, o `/set` acumula o body inteiro em memória (`data += chunk`) sem
limite de tamanho antes de qualquer validação.

## Como reproduzir

O app desta branch é um `meteor create app --release 3.5.1 --minimal` +
`meteor add accounts-base`. Zero código de accounts — a feature nunca é
habilitada.

```bash
cd app
meteor run --port 4654
# em outro shell:
curl -i -X POST http://localhost:4654/_accounts/cookie/set -H 'content-type: application/json' -d '{}'
curl -i http://localhost:4654/_accounts/cookie/refresh
curl -i -X POST http://localhost:4654/_accounts/cookie/clear
```

**Esperado:** 404 (fall-through para o roteamento do app), já que a feature está desligada.

## Comportamento obtido (Meteor 3.5.1 — ANTES do fix)

Os três endpoints respondem pelos handlers do pacote:

```
--- POST /set
HTTP/1.1 400 Bad Request          # {"error":"invalid_token"} — handler vivo
--- GET /refresh
HTTP/1.1 204 No Content           # handler vivo
--- POST /clear
HTTP/1.1 200 OK
set-cookie: meteor_login_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
```

Body ilimitado no `/set` — o servidor lê o payload **inteiro** antes de validar:

```
# 10 MB:
$ curl -s -o /dev/null -w '%{http_code} sent=%{size_upload}\n' -X POST .../set --data-binary @10mb.json
400 sent=10000024                 # 10MB bufferizados em memória antes do 400

# 5 MB:
$ curl -s -w '%{http_code} sent=%{size_upload}\n' -X POST .../set --data-binary @5mb.json
{"error":"invalid_token"}400 sent=5000010
```

## Comportamento com o fix (checkout `devel` + patch)

Rodando o mesmo app contra o checkout com o fix
(`/path/to/meteor-source/meteor run --port 4654`):

**Feature desligada (default) — endpoints caem no roteamento do app:**

```
--- POST /set
HTTP/1.1 405 Method Not Allowed      # fall-through do webapp, sem Set-Cookie, sem JSON
allow: OPTIONS, GET, HEAD
--- GET /refresh
HTTP/1.1 200 OK                      # HTML do app (fall-through), sem lookup no banco
content-type: text/html; charset=utf-8
--- POST /clear
HTTP/1.1 405 Method Not Allowed      # fall-through, sem Set-Cookie
```

**Feature ligada** (`meteor run --settings ../settings-enabled.json`, que define
`public.packages.accounts.useHttpOnlyCookies: true`) — endpoints funcionam como antes:

```
--- GET /refresh
HTTP/1.1 204 No Content
--- POST /clear
HTTP/1.1 200 OK
set-cookie: meteor_login_token=; ... HttpOnly; SameSite=Lax
--- POST /set {}
{"error":"invalid_token"} [400]
```

**Body agora limitado (4 KB) mesmo com a feature ligada:**

```
--- POST /set 5KB
{"error":"body_too_large"} [413]
--- POST /set 5MB
{"error":"body_too_large"} [413] sent=2940408   # servidor respondeu no meio do upload;
                                                # antes, os 5MB eram bufferizados inteiros
```

O gate é checado por request e aceita tanto `Accounts.config({ useHttpOnlyCookies: true })`
no servidor (tipicamente em `Meteor.startup`) quanto
`Meteor.settings.public.packages.accounts.useHttpOnlyCookies` — as duas formas
documentadas de habilitar a feature.
