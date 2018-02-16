// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { Checkpoints } from '../checkpoints/checkpoints.js';

import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Competitors = new Mongo.Collection('competitors');

Competitors.attachSchema(new SimpleSchema({
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
  idUser: {
    type: String,
    label: 'User ID',
    required: true,
  },
  nameUser: {
    type: String,
    label: 'User Name',
    optional: true,
  },
  idRace: {
    type: String,
    label: 'Race ID',
    required: true,
  },
  createdAt: {
    type: Date,
    label: 'Created at',
    optional: true,
  },
},
{
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
  },
  tracker: Tracker,
},
));

Competitors.deny({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Competitors.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});
