// Methods related to checkpoints

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Checkpoints } from './checkpoints.js';

Meteor.methods({
  'checkpoints.insert'(doc) {
    return Checkpoints.insert(doc);
  },
});
