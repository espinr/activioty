// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Identifiers } from '../identifiers.js';

Meteor.publish('identifiers.all', function () {
  return Identifiers.find();
});
