// All results-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Results } from '../results.js';
import Common from '../../../../both/lib/common.js';
import RoleTypes from '../../users/roles/roleTypes.js';

Meteor.publish('results.all', function () {
  return Results.find();
});
