// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import Common from '../../../both/lib/common.js';
import RoleTypes from '../users/roles/roleTypes.js';

import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Checkpoints = new Mongo.Collection('checkpoints');


Checkpoints.attachSchema(new SimpleSchema({
  identifier: {
    type: String,
    label: 'Checkpoint ID',
    optional: true,
  },
  description: {
    type: String,
    label: 'Description',
    optional: true,
  },
  name: {
    type: String,
    label: 'Name',
    optional: true,
  },
  latitude: {
    type: Number,
    label: 'Latitude',
    autoform: {
      type: 'hidden',
    },
    min: -90.0,
    max: 90.0,
  },
  longitude: {
    type: Number,
    label: 'Longitude',
    autoform: {
      type: 'hidden',
    },
    min: -180.0,
    max: 180.0,
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
  altitude: {
    type: Number,
    label: 'Altitude',
    autoform: {
      type: 'hidden',
    },
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
  ready: {
    type: Boolean,
    label: 'Ready?',
    optional: true,
    defaultValue: false,
  },
},
{
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
  },
},
{ tracker: Tracker },
));

if (Meteor.isServer) {
  Checkpoints._ensureIndex({
    identifier: 1,
    name: 1,
    description: 1,
    place: 1,
  });
}

Checkpoints.deny({
  insert: () => true,
  update: (userId, doc) => {
    // Only can update the admin 
    if (Common.hasAnyOfUserRoles([RoleTypes.ADMIN])) {
      return false;
    }
    return true;
  },
  remove: () => true,
});

Checkpoints.allow({
  insert: () => false,
  update: (userId, doc) => {
    // Only can update: gestor, admin or the same user
    if (Common.hasAnyOfUserRoles([RoleTypes.ADMIN])) {
      return true;
    }
    return false;
  },
  remove: () => false,
});
