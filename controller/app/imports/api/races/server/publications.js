// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Races } from '../races.js';

Meteor.publish('races.search', function (search) {
  check(search, Match.OneOf(String, null, undefined));
  let query = {};
  const projection = { sort: { createdAt: -1 } };

  if (search) {
    const regex = {
      $regex: search,
      $options: 'i',
    };

    query = {
      $or: [
        { name: regex },
        { description: regex },
        { identifier: regex },
        { place: regex },
      ],
    };
  }
  return Races.find(query, projection);
});
