import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './cards.html';

Template.cardsCheckpoints.onCreated(function () {
});

Template.cardsCheckpoints.helpers({
  checkpoints() {
    return Checkpoints.find();
  },
});

Template.cardsCheckpoints.events({
  'click .viewOnMap-button'(event, templateInstance) {
    window.location.reload();
  },
});
