// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import Common from '../../../both/lib/common.js';
import RoleTypes from '../users/roles/roleTypes.js';

import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

export const Results = new Mongo.Collection('results');


Results.attachSchema(new SimpleSchema({
  competitor: {
    type: String,
    label: 'Checkpoint ID',
    required: true,
  },
  rank: {
    type: String,
    label: 'Description',
    required: true,
  },
  competitionFeature: {
    type: String,
    label: 'Competition Feature',
    optional: true,
  },
  performance: {
    type: Number,
    label: 'Name',
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

Results.deny({
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

Results.allow({
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
