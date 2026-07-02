import { Meteor } from "meteor/meteor";

// Repro for meteor/meteor#12029 — call a method that returns a native ObjectId
// and report what the client actually received.
Meteor.startup(() => {
  Meteor.call("getNativeOid", (err, res) => {
    const oid = res && res.oid;
    const probe = {
      serverConstructor: res && res.serverConstructor,
      serverHex: res && res.serverHex,
      clientType: typeof oid,
      clientKeys: oid && typeof oid === "object" ? Object.keys(oid) : null,
      // A usable id exposes its hex value one way or another:
      clientHex:
        (oid &&
          (typeof oid.toHexString === "function"
            ? oid.toHexString()
            : oid._str)) || null,
    };
    // Round-trips correctly only if the client can recover the same hex id.
    probe.roundTrips = !!probe.clientHex && probe.clientHex === probe.serverHex;
    // eslint-disable-next-line no-console
    console.log("[oid-probe]", JSON.stringify(probe));

    const pre = document.createElement("pre");
    pre.id = "oid-probe";
    pre.textContent = JSON.stringify(probe, null, 2);
    document.body.appendChild(pre);

    const verdict = document.createElement("div");
    verdict.id = "oid-verdict";
    verdict.textContent = probe.roundTrips
      ? "OK: client received a usable ObjectId (" + probe.clientHex + ")"
      : "BUG: client cannot recover the ObjectId (keys=" +
        JSON.stringify(probe.clientKeys) +
        ", hex=" +
        probe.clientHex +
        ")";
    document.body.appendChild(verdict);
  });

  // Regression: a normal Mongo.ObjectID from find() must still round-trip.
  Meteor.call("getFindOid", (err, res) => {
    const id = res && res.id;
    const clientHex = id && (id._str || (id.toHexString && id.toHexString()));
    const probe = {
      serverConstructor: res && res.idConstructor,
      serverHex: res && res.idHex,
      clientHex: clientHex || null,
      roundTrips: !!clientHex && clientHex === (res && res.idHex),
    };
    // eslint-disable-next-line no-console
    console.log("[find-oid-probe]", JSON.stringify(probe));
    const el = document.createElement("div");
    el.id = "find-oid-verdict";
    el.textContent = probe.roundTrips
      ? "OK (regression): find() ObjectID round-trips (" + probe.clientHex + ")"
      : "REGRESSION: find() ObjectID broken (" + JSON.stringify(probe) + ")";
    document.body.appendChild(el);
  });
});
