// All mqtt-messages-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Messages } from '../messages.js';

Meteor.publish('messages.all', function () {
  //check(query, Match.OneOf(String, null, undefined));
  return Messages.find();
});
