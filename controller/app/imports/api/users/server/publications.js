// All checkpoints-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Common from '../../../../both/lib/common.js';
import RoleTypes from '../../users/roles/roleTypes.js';


Meteor.publish('users.email', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { emails: 1,  profile: 1, firstName: 1, lastName: 1 } });
});

Meteor.publish('user.data', function () {
  return Meteor.users.find({ _id: this.userId }, { fields: { emails: 1,  profile: 1, 'profile.name': 1, 'profile.firstName': 1, 'profile.lastName': 1, } });
});

Meteor.publish('users.roles', function () {
  return Meteor.roles.find({});
});

Meteor.publish('users.search', function (search) {
  check(search, Match.OneOf(String, null, undefined));

  let query = {};
  const projection = { sort: { createdAt: -1 } };

  if (!Common.hasAnyOfUserRoles([RoleTypes.ADMIN])) {
    return null;
  }

  if (search) {
    const regex = {
      $regex: search,
      $options: 'i',
    };

    query = {
      $or: [
        { 'profile.name': regex },
        { 'profile.firstName': regex },
        { 'profile.lastName': regex },
        { 'profile.organization': regex },
        { 'profile.notes': regex },
      ],
    };
  }
  return Meteor.users.find(query, projection);
});
