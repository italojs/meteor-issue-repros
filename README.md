# Repro — meteor/meteor#14400

**Security: `npm-mongo/wrapper.js` leaks full MONGO_URL (with credentials) to stderr**

Issue: https://github.com/meteor/meteor/issues/14400

## What happens

Since Meteor 3.3.1, `packages/npm-mongo/wrapper.js` runs a startup pre-check
that builds a throwaway `MongoClient` from `MONGO_URL` with hardcoded
`tls: true, tlsAllowInvalidCertificates: true`. When the constructor throws
synchronously (e.g. `mongodb+srv://` with a port number — a common user
mistake), the `catch` block logs the **raw** `MONGO_URL`, credentials
included, via `console.warn`. The hardcoded TLS options are problems of
their own: they force TLS onto plaintext deployments (failing the pre-check
silently) and disable certificate validation for the probe.

## How to reproduce

The app in this branch is `meteor create app --release 3.5.1 --minimal` —
zero code changes; `npm-mongo` ships with every app.

```bash
cd app
MONGO_URL='mongodb+srv://admin:S3cr3tPass@localhost:27017/proddb' meteor run --port 4658 2>&1 | grep 'Invalid MongoDB'
```

(`mongodb+srv` URIs cannot carry a port, so the `MongoClient` constructor
throws synchronously and the warning path fires.)

## Actual behavior (Meteor 3.5.1 — BEFORE the fix)

```
Invalid MongoDB connection string in MONGO_URL: mongodb+srv://admin:S3cr3tPass@localhost:27017/proddb
```

Username and password (`admin:S3cr3tPass`) land in stderr — and from there in
any log aggregation system.

## Behavior with the fix (`devel` checkout + patch)

Same command against the patched checkout:

```
Invalid MongoDB connection string in MONGO_URL: mongodb+srv://***:***@localhost:27017/proddb
```

Credentials redacted (`grep -c S3cr3tPass` over the full log: 0). The
pre-check also no longer forces `tls: true, tlsAllowInvalidCertificates: true`
— the connection string's own TLS semantics apply, so plaintext deployments
stop failing the probe and certificate validation is no longer disabled.
