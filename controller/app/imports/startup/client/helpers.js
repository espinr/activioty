/* Register global templates */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';
import RoleTypes from '../../api/users/roles/roleTypes.js';

/* Helpers to control user permissions */
Template.registerHelper('isLoggedUser', () => {
  const returned = (Meteor && Meteor.user() && Meteor.user() !== null && Meteor.userId());
  return returned;
});

Template.registerHelper('isAdminUser', () => {
  const user = Meteor.user();
  if (user) {
    return Roles.userIsInRole(user, [RoleTypes.ADMIN]);
  }
  return false;
});
