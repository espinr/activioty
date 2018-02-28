// Methods related to results

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Results } from './results.js';

Meteor.methods({
  'results.insert'(doc) {
    return Results.insert(doc);
  },
});
