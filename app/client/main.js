import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.repro.onCreated(function () {
  this.status = new ReactiveVar(null);
  this.log = new ReactiveVar([]);
  this.rolling = new ReactiveVar(false);

  this.append = (line) => {
    this.log.set([...this.log.get(), `${new Date().toISOString()}  ${line}`]);
  };

  this.refreshStatus = async () => {
    try {
      this.status.set(await Meteor.callAsync('repro.status'));
    } catch (e) {
      this.append(`status failed: ${e.message}`);
    }
  };

  this.refreshStatus();
});

Template.repro.helpers({
  status: () => Template.instance().status.get(),
  log: () => Template.instance().log.get(),
  rolling: () => Template.instance().rolling.get(),
});

Template.repro.events({
  async 'click .js-insert'(event, instance) {
    try {
      const res = await Meteor.callAsync('repro.insertQuiet');
      instance.append(`inserted quiet doc at ${res.insertedAtSec} — resume token captured`);
    } catch (e) {
      instance.append(`insert failed: ${e.message}`);
    }
    instance.refreshStatus();
  },

  async 'click .js-roll'(event, instance) {
    instance.rolling.set(true);
    instance.append('rolling oplog (bulk-writing to noise)…');
    try {
      const res = await Meteor.callAsync('repro.rollOplog');
      instance.append(
        `rolled oplog in ${res.batches} batches — tokenRolledOut=${res.tokenRolledOut}`
      );
    } catch (e) {
      instance.append(`roll failed: ${e.message}`);
    }
    instance.rolling.set(false);
    instance.refreshStatus();
  },

  async 'click .js-kill'(event, instance) {
    try {
      const res = await Meteor.callAsync('repro.killCursor');
      instance.append(
        `killed cursor(s) ${res.killed} — watch the SERVER console for the 286 loop`
      );
    } catch (e) {
      instance.append(`kill failed: ${e.message}`);
    }
    instance.refreshStatus();
  },

  'click .js-status'(event, instance) {
    instance.refreshStatus();
  },
});
