// Definition of the users and their profiles collection 
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import RoleTypes from './roles/roleTypes.js';

SimpleSchema.extendOptions(['autoform']);

// Extended profile for users
const userProfilesSchema = new SimpleSchema({
  // name is used as a full name composition
  name: {
    type: String,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  firstName: {
    type: String,
    label: 'First Name',
    required: true,
  },
  lastName: {
    type: String,
    label: 'Last Name',
    required: true,
  },
  phone: {
    type: String,
    label: 'Phone',
    optional: true,
  },
  passport: {
    type: String,
    label: 'ID card, Passport',
    required: true,
  },
  locality: {
    type: String,
    label: 'City, Town,...',
    optional: true,
  },
  club: {
    type: String,
    label: 'Sports Club',
    optional: true,
  },
  notes: {
    type: String,
    label: 'Notes',
    optional: true,
  },
  acceptPolicy: {
    type: Boolean,
    label: 'I accept the privacy policy',
    custom() {
      if (Meteor.isClient && this.isSet) {
        if (!this.value) {
          console.log('You must accept the privacy policy to continue');
          return 'required';
        }
      }
    },
  },
}, { tracker: Tracker });

// The schema for Meteor.users
const userSchema = new SimpleSchema({
  username: {
    type: String,
    optional: true,
  },
  emails: {
    type: Array,
    optional: true,
  },
  'emails.$': {
    type: Object,
  },
  'emails.$.address': {
    type: String,
    label: 'Correo electrónico',
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
  },
  registered_emails: {
    type: Array,
    optional: true,
  },
  'registered_emails.$': {
    type: Object,
    blackbox: true,
  },
  createdAt: {
    type: Date,
  },
  profile: {
    type: userProfilesSchema,
    optional: true,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // No use groups
  roles: {
    type: Array,
    optional: true,
  },
/*  roles: {
    type: Object,
    optional: true,
    blackbox: true,
  },
*/
  'roles.$': {
    type: String,
  },
  // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true,
  },
}, { tracker: Tracker });

Meteor.users.attachSchema(userSchema);

Meteor.users.allow({
  insert (userId, doc) { return true; },
  update (userId, doc, fieldNames, modifier) { 
    // An update only can be made by the admin or the user themselves
    if (userId && ((userId === doc._id) || (Roles.userIsInRole(userId, [RoleTypes.ADMIN])))) {
      return true;
    }
    return false;
  },
});

export const Users = Meteor.users;
