import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import '../../api/users/server/publications.js';

/*
Accounts.validateNewUser(function (user) {
  const loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin', 'gestor'])) {
    return true;
  }
  throw new Meteor.Error(403, "Not authorized to create new users");
});
*/
