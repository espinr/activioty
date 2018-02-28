import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import 'numeraljs';
import { Races } from '../../../api/races/races.js';
import { Identifiers } from '../../../api/identifiers/identifiers.js';
import { Competitors } from '../../../api/competitors/competitors.js';
import Common from '../../../../both/lib/common.js';

import './competitors.html';

let checkins;

Template.competitorsMain.onCreated(function () {
  const template = Template.instance();
  
  const raceId = FlowRouter.getParam('raceId');
  if (!raceId) {
    console.log('No raceId received');
    return false;
  }
  Tracker.autorun(function () {
    template.subscribe('users.search');
    template.subscribe('races.search');
    template.subscribe('identifiers.all');
    if (!template.currentRace && template.currentRace === undefined) {
      template.currentRace = Races.findOne({ _id: raceId });
    }
  });
});

Template.competitorsMain.helpers({
  competitorsCollection() {
    return Competitors;
  },
  athletes() {
    return Meteor.users.find();
  },
  getIdForm(idAthlete) {
    return `newCompetitorForm_${idAthlete}`;
  },
  getIdSelect(idAthlete) {
    return `bibSelect_${idAthlete}`;
  },
  identifiers() {
    const arrayIds = [];
    return Identifiers.find().map((id) => {
      return {
        label: id.bibId,
        value: id._id,
      };
    });
  },
});

function insertCompetitorCallback(error, result) {
  if (error) {
    console.log(error);
  } else if (result) {
    Materialize.toast('Competitor has been created', 4000);
  }
}

Template.competitorsMain.events({
  'click #assign-bibs-button'(event) {
    const template = Template.instance();
    console.log(template);
    const selectedAthletes = $('input:checked');
    const allIdentifiers = Identifiers.find().fetch();
    for (let i = 0; i < selectedAthletes.length;  i += 1 ) {
      const athleteId = selectedAthletes[i].getAttribute('id');
      const nameAthlete = selectedAthletes[i].getAttribute('data-athlete-name');
      const select = $(`form#newCompetitorForm_${athleteId} select`);
      select.val(allIdentifiers[i]._id);
      select.prop('disabled', true);
      select.material_select();
      const document = {
        bibId: allIdentifiers[i].bibId,
        epc: allIdentifiers[i].epc,
        idUser: athleteId,
        nameUser: nameAthlete,
        idRace: template.currentRace._id,
        createdAt: new Date(),
      };
      Meteor.call('competitors.insert', document, insertCompetitorCallback);
    }
  },
});
