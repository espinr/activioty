import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import Sntp from 'sntp';
import { ReactiveClock } from 'meteor/aldeed:clock';
import 'numeraljs';
import { Messages }  from '../../../api/messages/messages.js';
import Common from '../../../../both/lib/common.js';


import './map/map.js';
import './competition.html';

let checkins;

Template.competitionMain.onCreated(function () {
  const template = Template.instance();

  checkins = 0;

  $(document).ready(function() {
    $('.modal').modal();
  });

  template.subscribe('messages.all');
  template.subscribe('competitors.all');

  template.CompetitionClock = new ReactiveClock('ExerciseClock');
  template.CompetitionClock.setElapsedSeconds(0);
  Tracker.autorun(function () {
  });
});

Template.competitionMain.onDestroyed = function () {
  const template = Template.instance();
  template.CompetitionClock.stop();
};

Template.competitionMain.helpers({
  stopwatch() {
    const template = Template.instance();
    return template.CompetitionClock.elapsedTime({ format: '00:00:00' });
  },
});

// The dynamic classification
let fifthAthlete;
let fourthAthlete;
let sixthAthlete;

function checkinAthlete(idCheckpoint, nameAthlete, materialIcon) {
  checkins += 1;
  if (checkins === 1) {
    $(`${idCheckpoint} .first`).html(`<td>🥇</td><td>${nameAthlete}</td><td><i class="material-icons tiny up">${materialIcon}</i></td>`);
  } else if (checkins === 2) {
    $(`${idCheckpoint} .second`).html(`<td>🥈</td><td>${nameAthlete}</td><td><i class="material-icons tiny ">${materialIcon}</i></td>`);
  } else if (checkins === 3) {
    $(`${idCheckpoint} .third`).html(`<td>🥉</td><td>${nameAthlete}</td><td><i class="material-icons tiny">${materialIcon}</i></td>`);
  } else if (checkins === 4) {
    $(`${idCheckpoint} .fourth`).html(`<td>${checkins}</td><td>${nameAthlete}</td><td><i class="material-icons tiny">${materialIcon}</i></td>`);
    fourthAthlete = nameAthlete;
  } else if (checkins === 5) {
    fifthAthlete = nameAthlete;
    $(`${idCheckpoint} .fifth`).html(`<td>${checkins}</td><td>${nameAthlete}</td><td><i class="material-icons tiny">${materialIcon}</i></td>`);
  } else if (checkins === 6) {
    $(`${idCheckpoint} .sixth`).html(`<td>${checkins}</td><td>${nameAthlete}</td><td><i class="material-icons tiny">${materialIcon}</i></td>`);
    sixthAthlete = nameAthlete;
  } else {
    // > 6
    fourthAthlete = fifthAthlete;
    fifthAthlete = sixthAthlete;
    sixthAthlete = nameAthlete;
    $(`${idCheckpoint} .fourth`).html(`<td>${checkins - 2}</td><td>${fourthAthlete}</td><td></td>`);
    $(`${idCheckpoint} .fifth`).html(`<td>${checkins - 1}</td><td>${fifthAthlete}</td><td></td>`);
    $(`${idCheckpoint} .sixth`).html(`<td>${checkins}</td><td>${nameAthlete}</td><td><i class="material-icons tiny">${materialIcon}</i></td>`);
  }
}

Template.competitionMain.events({
  'click #startCompetition-button'(event) {
    const template = Template.instance();
    template.CompetitionClock.start();
    template.startTimestamp = Sntp.now();
    const actionButton = $('#startCompetition-button');
    actionButton.html('<i class="material-icons">stop</i>');
    actionButton.attr('id', 'finishCompetition-button');
  },
  'click #finishCompetition-button'(event) {
    const template = Template.instance();
    template.CompetitionClock.stop();
    template.finishTimestamp = Sntp.now();
    $('#finishCompetition-button').hide();
  },  
});

/*
'ready messages':
{
	"checkpoint" : {
		"id" : "…",
	},
	"timestamp"  : 0000000
}

'checkin messages':
{
	"checkpoint" : { 
		"id" : "…",			// Required
	},
	"bibIdentifier" : "…",	// Either 'bib' or 'epc' are required
	"epcIdentifier" : "…",
	"timestamp"  : 0000000, 	// Required
}
*/

function isCheckpointReady(idCheckpoint) {
  const messages = Messages.find({ topic: 'ready' });
  for (let i = 0; i < messages.length; i += 1) {
    if (messages[i].message.checkpoint.id === idCheckpoint) {
      return true;
    }
  }
}

Template.mqttMessages.helpers({
  messages() {
    return Messages.find();
  },
});
