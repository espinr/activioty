// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Identifiers = new Mongo.Collection('identifiers');

Identifiers.attachSchema(new SimpleSchema({
  bibId: {
    type: String,
    label: 'Bib ID',
    required: true,
  },
  epc: {
    type: String,
    label: 'EPC',
    optional: true,
  },
}, { tracker: Tracker }));

Identifiers.deny({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Identifiers.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});
