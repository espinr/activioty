// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { Checkpoints } from '../checkpoints/checkpoints.js';

import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Checkins = new Mongo.Collection('checkins');

Checkins.attachSchema(new SimpleSchema({
  bibId: {
    type: String,
    label: 'Bib ID',
    optional: true,
  },
  epc: {
    type: String,
    label: 'EPC',
    optional: true,
  },
  timestamp: {
    type: Number,
    label: 'Timestamp',
    required: true,
  },
  checkpointId: {
    type: String,
    label: 'Checkpoint ID',
    required: true,
  },
}, { tracker: Tracker }));

Checkins.deny({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Checkins.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});
