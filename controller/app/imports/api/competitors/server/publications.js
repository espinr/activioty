// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Competitors } from '../competitors.js';

Meteor.publish('competitors.all', function (idCompetition) {
  check(idCompetition, String);
  return Competitors.find({ idRace: idCompetition });
});
