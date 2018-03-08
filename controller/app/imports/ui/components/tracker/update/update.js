import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './update.html';

Template.trackerUpdate.onCreated(function () {
  const bibId = FlowRouter.getQueryParam('bibId');
  const lat = FlowRouter.getQueryParam('lat');
  const lng = FlowRouter.getQueryParam('lng');

  let jsonData = '{}';
  // Resend to Ubidots
  if (bibId && lat && lng) {
    jsonData = {
      value: bibId,
      context: { lat, lng },
    };
    const url = 'http://things.ubidots.com/api/v1.6/variables/5aa01185642ab66ae02d4674/values?token=BBFF-Pt5LS75MYpoMQRpBpRB80fiU1pXi2D';
    Meteor.call('httpPost', url, jsonData);
  }
  $(document).ready( () => {
    $('#content').html(`${JSON.stringify(jsonData)}`);
  });
});
