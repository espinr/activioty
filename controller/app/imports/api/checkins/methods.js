// Methods related to checkpoints

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Checkins } from './checkins.js';

Meteor.methods({
  'checkins.insert'(doc) {
    return Checkins.insert(doc);
  },
});
