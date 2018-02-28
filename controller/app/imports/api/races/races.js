// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { Checkpoints } from '../checkpoints/checkpoints.js';
import { Results } from '../results/results.js';
import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Races = new Mongo.Collection('races');

const checkpointsSchema = Checkpoints.simpleSchema();

const resultsSchema = Results.simpleSchema();

Races.attachSchema(new SimpleSchema({
  identifier: {
    type: String,
    label: 'Race ID',
    required: true,
  },
  description: {
    type: String,
    label: 'Description',
    optional: true,
  },
  startTimestamp: {
    type: Number,
    label: 'Start Timestamp',
    optional: true,
  },
  name: {
    type: String,
    label: 'Name',
    required: true,
  },
  picture: {
    type: String,
    label: 'Picture',
    optional: true,
  },
  place: {
    type: String,
    label: 'Place',
    optional: true,
  },
  geojsonUrl: {
    type: String,
    label: 'Course path in Geo-JSON format',
    optional: true,
  },
  createdAt: {
    type: Date,
    label: 'Created at',
    optional: true,
  },
  notes: {
    type: String,
    label: 'Notes',
    autoform: {
      type: 'textarea',
    },
    optional: true,
  },
  checkpoints: {
    type: Array,
    label: 'Checkpoints',
    optional: true,
  },
  'checkpoints.$': {
    type: Object,
  },
  'checkpoints.$.id': {
    type: String,
    required: true,
  },
  'checkpoints.$.name': {
    type: String,
    optional: true,
  },
  'checkpoints.$.laps': {
    type: Number,
    defaultValue: 1,
    required: true,
  },
  finalCheckpoint: {
    type: Object,
    required: true,
  },
  'finalCheckpoint.id': {
    type: String,
    required: true,
  },
  'finalCheckpoint.name': {
    type: String,
    required: true,
  },
  results: {
    type: Array,
    label: 'Results',
    optional: true,
  },
  'results.$': {
    type: resultsSchema,
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

if (Meteor.isServer) {
  Races._ensureIndex({
    identifier: 1,
    name: 1,
    description: 1,
    place: 1,
  });
}

Races.deny({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Races.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});
