import 'hammerjs';
import 'materialize-css/dist/js/materialize.js';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BackBehaviour } from 'meteor/chriswessels:back-behaviour';
import SimpleSchema from 'simpl-schema';
import { AutoForm } from 'meteor/aldeed:autoform';
import { GoogleMaps } from 'meteor/dburles:google-maps';

SimpleSchema.extendOptions(['autoform']);

/* Configuration of accounts */
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL',
});

/* Configuration of templates (materialize, bootstrap3) */
AutoForm.setDefaultTemplate('materialize');

/* Maps */
if (Meteor.isClient) {
  Meteor.startup(function() {
    GoogleMaps.load({ v: '3', key: 'AIzaSyBOLwXHBn6I-cNhFCVYBfyPBwFN4Gtg8HA', libraries: 'drawing' });
  });
  BackBehaviour.attachToHardwareBackButton(true);
}

