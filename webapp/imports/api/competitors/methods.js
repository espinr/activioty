// Methods related to checkpoints

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Competitors } from './competitors.js';

Meteor.methods({
  'competitors.insert'(doc) {
    return Competitors.insert(doc);
  },
});
