import { Meteor } from 'meteor/meteor';
import { Mongo, MongoInternals } from 'meteor/mongo';

/**
 * Reproduction for the Meteor 3.5 change-stream restart loop after
 * ChangeStreamHistoryLost (error 286).
 *
 * Steps (driven by UI buttons calling the methods below):
 *   1. Startup opens an observe on `quiet`, so SharedChangeStream watches it.
 *   2. repro.insertQuiet — one change event, so the driver stores a resume token.
 *   3. repro.rollOplog — bulk-writes to `noise` until the oldest oplog entry is
 *      newer than the stored token (the dev mongo oplog is only 8MB).
 *   4. repro.killCursor — kills the change-stream cursor server-side, forcing a
 *      resume attempt with the now-unresumable token → infinite 286 loop in the
 *      server console.
 */

const Quiet = new Mongo.Collection('quiet');
const Noise = new Mongo.Collection('noise');

const driver = MongoInternals.defaultRemoteCollectionDriver();
const db = driver.mongo.db;
const client = driver.mongo.client;

// Wall-clock seconds of the last quiet insert; compared against oplog
// timestamps (whose high bits are a unix-seconds value) in repro.status.
let lastQuietInsertSec = null;
let observedEvents = 0;

Meteor.startup(async () => {
  await Quiet.find().observeChangesAsync({
    added() { observedEvents++; },
    changed() { observedEvents++; },
    removed() { observedEvents++; },
  });
  console.log('[repro] observe started on `quiet` — change stream is open');
});

async function oldestOplogTs() {
  const [entry] = await client
    .db('local')
    .collection('oplog.rs')
    .find({}, { projection: { ts: 1 } })
    .sort({ $natural: 1 })
    .limit(1)
    .toArray();
  return entry?.ts ?? null;
}

function tsSeconds(ts) {
  return ts ? ts.getHighBits() : null;
}

async function findChangeStreamOps() {
  return client
    .db('admin')
    .aggregate([
      { $currentOp: { idleCursors: true, allUsers: true } },
      {
        $match: {
          ns: `${db.databaseName}.quiet`,
          'cursor.originatingCommand.pipeline.0.$changeStream': { $exists: true },
        },
      },
    ])
    .toArray();
}

Meteor.methods({
  async 'repro.status'() {
    const ts = await oldestOplogTs();
    const streamOps = await findChangeStreamOps();
    return {
      dbName: db.databaseName,
      observedEvents,
      lastQuietInsertSec,
      oldestOplogSec: tsSeconds(ts),
      tokenRolledOut:
        lastQuietInsertSec !== null && tsSeconds(ts) > lastQuietInsertSec,
      changeStreamCursors: streamOps.map((op) => String(op.cursor.cursorId)),
      noiseCount: await Noise.find().countAsync(),
    };
  },

  async 'repro.insertQuiet'() {
    await Quiet.insertAsync({ createdAt: new Date() });
    lastQuietInsertSec = Math.floor(Date.now() / 1000);
    return { insertedAtSec: lastQuietInsertSec };
  },

  async 'repro.rollOplog'() {
    if (lastQuietInsertSec === null) {
      throw new Meteor.Error('no-token', 'Insert a quiet doc first (step 2).');
    }
    const big = 'x'.repeat(100000);
    let batches = 0;
    // 8MB dev oplog: each 50-doc batch is ~5MB of churn. WiredTiger truncates
    // the capped oplog lazily on a background thread that only catches up
    // between writes, so pace the batches — a tight loop grows the oplog
    // without ever letting the head get trimmed.
    while (batches < 300) {
      const ts = await oldestOplogTs();
      if (tsSeconds(ts) > lastQuietInsertSec) break;
      await db
        .collection('noise')
        .insertMany(Array.from({ length: 50 }, (_, i) => ({ i, big })));
      batches++;
      await new Promise((r) => setTimeout(r, 250));
    }
    await db.collection('noise').drop().catch(() => {});
    const ts = await oldestOplogTs();
    return {
      batches,
      oldestOplogSec: tsSeconds(ts),
      tokenRolledOut: tsSeconds(ts) > lastQuietInsertSec,
    };
  },

  async 'repro.killCursor'() {
    const ops = await findChangeStreamOps();
    if (!ops.length) {
      throw new Meteor.Error(
        'no-cursor',
        'No change-stream cursor found on `quiet` — is the observe running?'
      );
    }
    const cursorIds = ops.map((op) => op.cursor.cursorId);
    const result = await db.command({ killCursors: 'quiet', cursors: cursorIds });
    console.log('[repro] killed change-stream cursor(s):', result);
    return { killed: result.cursorsKilled?.map(String) };
  },
});

/**
 * Headless driver: with REPRO_AUTO=1 the whole sequence runs on startup and the
 * process prints a machine-readable verdict, so the repro can be checked without
 * the UI buttons. It counts change-stream restart cycles over a window: the bug
 * loops (~10x/sec), a healthy stream restarts at most once and then settles.
 */
if (process.env.REPRO_AUTO === '1') {
  let restartCount = 0;
  let historyLostCount = 0;

  const mentions = (args, needle) =>
    args.some((a) => {
      if (a == null) return false;
      if (typeof a === 'string') return a.includes(needle);
      try {
        return JSON.stringify(a).includes(needle);
      } catch (e) {
        return false;
      }
    });

  const origError = console.error;
  console.error = (...args) => {
    if (mentions(args, 'ChangeStream restart begin')) restartCount++;
    if (mentions(args, '286') || mentions(args, 'ChangeStreamHistoryLost')) {
      historyLostCount++;
    }
    origError.apply(console, args);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  Meteor.startup(async () => {
    try {
      await sleep(3000);
      console.log('[repro-auto] step 2: insertQuiet');
      console.log('[repro-auto]', await Meteor.callAsync('repro.insertQuiet'));

      console.log('[repro-auto] step 3: rollOplog (~1 min)…');
      console.log('[repro-auto]', await Meteor.callAsync('repro.rollOplog'));

      console.log('[repro-auto] step 4: killCursor');
      console.log('[repro-auto]', await Meteor.callAsync('repro.killCursor'));

      const restartsBefore = restartCount;
      const historyLostBefore = historyLostCount;
      console.log('[repro-auto] observing the stream for 15s…');
      await sleep(15000);

      const restarts = restartCount - restartsBefore;
      const historyLost = historyLostCount - historyLostBefore;
      const looping = restarts > 3;
      console.log(
        `[repro-auto] RESULT restarts-in-15s=${restarts} historyLostErrors-in-15s=${historyLost}`
      );
      console.log(
        looping
          ? '[repro-auto] VERDICT: BUG REPRODUCED — change stream is stuck in a restart loop'
          : '[repro-auto] VERDICT: HEALTHY — change stream recovered, no restart loop'
      );
    } catch (e) {
      console.log('[repro-auto] driver failed:', e && e.message ? e.message : e);
    }
  });
}
