import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Users } from '/imports/api/users/users.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';

import './new-profile.html';

AutoForm.hooks({
  newProfileForm: {
    before: {
      update(doc) {
        return doc;
      },
    },
    after: {
      update(error, result) {
        if (error) {
          if (error.reason) {
            alert(error.reason);
          }
        } else if (result) {
          Materialize.toast('Profile created successfully', 4000);
          // Continues to '/'
          FlowRouter.go('App.home');
        }
      },
    },
  },
});

Template.newProfile.onCreated(function () {
  $(document).ready(() => {
    $('.modal').modal({
      dismissible: true,
      opacity: 0.5,
      startingTop: '0',
    });
  });
});

Template.newProfile.helpers({
  currentUser() {
    return Meteor.user();
  },
  email() {
    const user = Meteor.users.findOne({ _id: Meteor.userId() });
    return user.emails[0].address;
  },  
  usersCollection() {
    return Users;
  },
  usersSchema() {
    return Users.simpleSchema();
  },
});

Template.newProfile.events({
  // Update the hidden field 'name'
  'change input[name="profile.firstName"]'() {
    const name = `${$('input[name="profile.firstName"]').val()} ${$('input[name="profile.lastName"]').val()}`;
    $('input[name="profile.name"]').val(name);
  },
  'change input[name="profile.lastName"]'() {
    const name = `${$('input[name="profile.firstName"]').val()  } ${  $('input[name="profile.lastName"]').val()}`;
    $('input[name="profile.name"]').val(name);
  },
  'click .privacyPolicy'() {
    $('#modalPrivacyPolicy').modal('open');
  },
});
