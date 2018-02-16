// Methods related to checkpoints

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Races } from './races.js';

Meteor.methods({
  'races.insert'(doc) {
    return Races.insert(doc);
  },
});
