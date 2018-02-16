/**
 * Common functions to work with from anywhere
 */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import RoleTypes from '../../imports/api/users/roles/roleTypes.js';

export default class Common {
  static isLoggedUser() {
    return (Meteor && Meteor.user() && Meteor.user() !== null && Meteor.userId());
  }
  static hasSetUpProfile() {
    // Checks if the current user has configured the basic profile (at least the name in profile)
    if (Meteor && Meteor.user() && Meteor.user() !== null && Meteor.user().profile
      && Meteor.user().profile.firstName) {
      return true;
    }
    return false;
  }
  static hasAnyOfUserRoles(roleArray) {
    if (Meteor && Meteor.user() && Meteor.user() !== null && Meteor.userId()) {
      return Roles.userIsInRole(Meteor.userId(), roleArray);
    }
    return false;
  }
}
