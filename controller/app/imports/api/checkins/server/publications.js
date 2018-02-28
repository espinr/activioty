// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Checkins } from '../checkins.js';

Meteor.publish('checkins.after', function (timestampFrom) {
  check(timestampFrom, Number);
  Meteor.call('logToConsole', timestampFrom);
  let query = {};
  if (timestampFrom) {
    query = { timestamp : { $gte : timestampFrom } };
  }
  Meteor.call('logToConsole', JSON.stringify(query));
  return Checkins.find(query);
});
