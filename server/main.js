import { Meteor } from 'meteor/meteor';

// (1) Mutated at top level, BEFORE startup completes.
Meteor.settings.public.fooFirst = 'set-at-top-level';

Meteor.startup(() => {
  // (2) Mutated synchronously inside a startup callback.
  Meteor.settings.public.fooSecond = 'set-in-startup';

  // (3) Mutated AFTER server startup has finished (the documented contract:
  //     "changes to Meteor.settings.public during runtime will be picked up
  //      by new client connections").
  Meteor.setTimeout(() => {
    Meteor.settings.public.fooThird = 'set-after-startup';
    console.log(
      '[repro] server Meteor.settings.public is now:',
      JSON.stringify(Meteor.settings.public)
    );
    console.log('[repro] -> reload the page / open a NEW client; fooThird SHOULD appear.');
  }, 3000);
});
