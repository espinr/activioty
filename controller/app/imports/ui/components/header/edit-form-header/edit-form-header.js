import { Template } from 'meteor/templating';
import { BackBehaviour } from 'meteor/chriswessels:back-behaviour';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './edit-form-header.html';

Template.editionFormHeader.helpers({
  title() {
    const routeName = FlowRouter.getRouteName();
    switch (routeName) {
      case 'App.editProfile':
        return 'Update profile';
      case 'App.changePwd':
        return 'Change password';
      case 'checkpoints.new':
        return 'New checkpoint';
      case 'checkpoints.edit':
        return 'Edit checkpoint';
      case 'races.competition':
        return 'Live Competition';
      case 'races.competitors':
        return 'Create Start List';
      default:
        break;
    }
    return routeName;
  },
});

Template.editionFormHeader.onBack(function (details, origin) {
  FlowRouter.go('App.home');
});
