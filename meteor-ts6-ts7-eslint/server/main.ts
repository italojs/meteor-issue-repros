import { Meteor } from 'meteor/meteor';
const boot = new Date().toISOString();
const revision = 'servidor A';

Meteor.methods({
  'demo.status'() {
    return { pid: process.pid, boot, revision, release: Meteor.release };
  },
});

Meteor.startup(() => {
  console.log('[DEMO_BOOT]', JSON.stringify({ pid: process.pid, boot, revision, release: Meteor.release }));
});
