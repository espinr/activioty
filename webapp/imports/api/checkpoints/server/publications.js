// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Checkpoints } from '../checkpoints.js';
import Common from '../../../../both/lib/common.js';
import RoleTypes from '../../users/roles/roleTypes.js';

Meteor.publish('checkpoints.search', function (search) {
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
  return Checkpoints.find(query, projection);
});
