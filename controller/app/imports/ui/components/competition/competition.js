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
import 'moment';
import beautify from 'json-beautify';
import { Messages }  from '../../../api/messages/messages.js';
import Common from '../../../../both/lib/common.js';


import './map/map.js';
import './competition.html';
import { Checkins } from '../../../api/checkins/checkins.js';
import { Competitors } from '../../../api/competitors/competitors.js';
import { Races } from '../../../api/races/races.js';
import { Results } from '../../../api/results/results.js';


function isInResults(arrayResults, checkinValue) {
  for (let i = 0; i < arrayResults.length; i += 1) {
    if (arrayResults[i].bibId === checkinValue.bibId) {
      return true;
    }
  }
  return false;
}

Template.competitionMain.onCreated(function () {
  const template = Template.instance();
  template.startTimestamp = new ReactiveVar(0);

  const raceId = FlowRouter.getParam('raceId');
  if (!raceId) {
    console.log('No raceId received');
    return false;
  }

  $(document).ready(function() {
    $('.modal').modal({
      dismissible: true,
    });
  });

  template.subscribe('messages.all');
  template.subscribe('competitors.all', raceId);
  template.subscribe('checkpoints.search');

  template.CompetitionClock = new ReactiveClock('ExerciseClock');
  template.CompetitionClock.setElapsedSeconds(0);
  template.CompetitionClock.stop();


  template.checkpoints = [];
  // The dynamic classification
  template.resultsAtCheckpoint = [];
  template.checkpointsCompleted = []; // Array with the IDs of checkpoints once there is a checkin

  Tracker.autorun(() => {
    template.currentRace = Races.findOne({ _id: raceId });
    if (template.currentRace && template.currentRace.checkpoints) {
      template.currentRace.checkpoints.forEach((checkpoint) => {
        template.checkpoints.push(Checkpoints.findOne({ _id: checkpoint.id }));
      });
    }
    if (template.startTimestamp.get() && template.startTimestamp.get() > 0) {
      template.subscribe('checkins.after', template.startTimestamp.get());
      template.checkpoints.forEach((checkpoint) => {
        const checkinsForCheckpoint = Checkins.find({ checkpointId: checkpoint._id });
        if (checkinsForCheckpoint) {
          checkinsForCheckpoint.forEach((checkin) => {
            let competitor;
            if (checkin.epc) {
              competitor = Competitors.findOne({ epc: checkin.epc });
            } else {
              competitor = Competitors.findOne({ bibId: checkin.bibId });
            }
            const totalTime = checkin.timestamp - template.startTimestamp.get();
            checkinAthlete(template, checkpoint._id, checkpoint.identifier, competitor.bibId, competitor.epc, competitor.nameUser, competitor.idUser, totalTime);
          });
        }
      });
    }
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
  checkins() {
    return Checkins.find();
  },
});

/* 
  Return -1 if the athlete has a worse result in the previous checkpoint,
  0 if it is the same or 1 if it's better.
*/
function worseOrBetterResult(checkpointsCompleted, resultsAtCheckpoint, bibId, idCheckpointCurrent, currentRank) {
  const indexCheckpoint = checkpointsCompleted.indexOf(idCheckpointCurrent);
  // The first one, no changes
  if (indexCheckpoint === 0) {
    return 0;
  }
  const previousCheckpointId = checkpointsCompleted[indexCheckpoint - 1];
  // Search for the bibId
  const previousResults = resultsAtCheckpoint[previousCheckpointId];
  for (let i = 0; i < previousResults.length; i += 1) {
    const result = previousResults[i];
    if (result.bibId === bibId) {
      if (currentRank > result.rank) {
        return -1;
      } else if (currentRank < result.rank) {
        return 1;
      }
      return 0;
    }
  }
  return 0;
}

function checkinAthlete(template, idCheckpoint, nameCheckpoint, bibId, epc, nameAthlete, idAthlete, totalTime) {
  let timeCheckpoint = Math.round(totalTime);
  // First athlete at this checkpoint?
  if (!template.resultsAtCheckpoint[idCheckpoint]) {
    template.resultsAtCheckpoint[idCheckpoint] = [];
    template.checkpointsCompleted.push(idCheckpoint);
    Materialize.toast(`First athlete at checkpoint ${nameCheckpoint}!`, 4000);
    timeCheckpoint = moment().startOf('day').seconds(timeCheckpoint).format('H:mm:ss');
  } else {
    // It is not the first one
    const results = template.resultsAtCheckpoint[idCheckpoint];
    timeCheckpoint = totalTime - results[0].time;
    timeCheckpoint = moment().startOf('day').seconds(timeCheckpoint).format('mm:ss');
  }
  const checkinValue = {
    rank: template.resultsAtCheckpoint[idCheckpoint].length + 1,
    bibId,
    epc,
    idAthlete,
    nameAthlete,
    time: totalTime,
  };
  if (isInResults(template.resultsAtCheckpoint[idCheckpoint], checkinValue)) {
    return false;
  }
  console.log(`Competitor ${nameAthlete} at checkpoint <${nameCheckpoint}> -> ${totalTime}s `);
  template.resultsAtCheckpoint[idCheckpoint].push(checkinValue);
  const results = template.resultsAtCheckpoint[idCheckpoint];
  const numberCheckins = template.resultsAtCheckpoint[idCheckpoint].length;
  let materialIcon = '<i class="material-icons tiny"></i>';
  const worseOrBetter = worseOrBetterResult(template.checkpointsCompleted, template.resultsAtCheckpoint, bibId, idCheckpoint, numberCheckins);
  if (worseOrBetter === -1) {
    materialIcon = '<i class="material-icons tiny down">keyboard_arrow_down</i>';
  } else if (worseOrBetter === 1) {
    materialIcon = '<i class="material-icons tiny up">keyboard_arrow_up</i>';
  }
  if (numberCheckins === 1) {
    $(`table#${idCheckpoint} tr.first`).html(`<td>🥇${materialIcon}</td><td>${results[0].nameAthlete}</td><td class="time">${timeCheckpoint}</td>`);
  } else if (numberCheckins === 2) {
    $(`table#${idCheckpoint} tr.second`).html(`<td>🥈${materialIcon}</td><td>${results[1].nameAthlete}</td><td class="time">+${timeCheckpoint}</td>`);
  } else if (numberCheckins === 3) {
    $(`table#${idCheckpoint} tr.third`).html(`<td>🥉${materialIcon}</td><td>${results[2].nameAthlete}</td><td class="time">+${timeCheckpoint}</td>`);
  } else if (numberCheckins === 4) {
    $(`table#${idCheckpoint} tr.fourth`).html(`<td>${numberCheckins} ${materialIcon}</td><td>${results[3].nameAthlete}</td><td class="time">+${timeCheckpoint}</td>`);
  } else if (numberCheckins === 5) {
    $(`table#${idCheckpoint} tr.fifth`).html(`<td>${numberCheckins} ${materialIcon}</td><td>${results[4].nameAthlete}</td><td class="time">+${timeCheckpoint}</td>`);
  } else if (numberCheckins === 6) {
    $(`table#${idCheckpoint} tr.sixth`).html(`<td>${numberCheckins} ${materialIcon}</td><td>${results[5].nameAthlete}</td><td class="time">+${timeCheckpoint}</td>`);
  } else {
    // > 6
    const fourthAthlete = results[numberCheckins - 3].nameAthlete;
    let timeCheckpointFourth = results[numberCheckins - 3].time - results[0].time;
    timeCheckpointFourth = moment().startOf('day').seconds(timeCheckpointFourth).format('mm:ss');

    const fifthAthlete = results[numberCheckins - 2].nameAthlete;
    let timeCheckpointFifth = results[numberCheckins - 2].time - results[0].time;
    timeCheckpointFifth = moment().startOf('day').seconds(timeCheckpointFifth).format('mm:ss');
    $(`table#${idCheckpoint} tr.fourth`).html(`<td>${numberCheckins - 2} ${materialIcon}</td><td>${fourthAthlete}</td><td>+${timeCheckpointFourth}</td>`);
    $(`table#${idCheckpoint} tr.fifth`).html(`<td>${numberCheckins - 1} ${materialIcon}</td><td>${fifthAthlete}</td><td>+${timeCheckpointFifth}</td>`);
    $(`table#${idCheckpoint} tr.sixth`).html(`<td>${numberCheckins} ${materialIcon}</td><td>${nameAthlete}</td><td>+${timeCheckpoint}</td>`);
  }
}

function generateResultsJsonLD(currentRace, resultsArray) {
  if (!currentRace || !resultsArray || resultsArray === 'undefined') return '';
  let results = {
    '@context' : "http://w3c.github.io/opentrack-cg/contexts/opentrack.jsonld",
    '@id' : `http://activioty.ddns.net/race/${currentRace._id}`,
    '@type' : 'UnitRace',
    name : currentRace.name,
  };
  const resultsJsonLD = [];
  for (let i = 0 ; i < resultsArray.length ; i += 1) {
    const timeCheckpoint = moment().startOf('day').seconds(resultsArray[i].time).format('H:mm:ss');
    resultsJsonLD.push({
      '@id': `http://activioty.ddns.net/race/${currentRace._id}/results#${i}`,
      '@type': 'Result',
      name: `Result #${i} of ${currentRace.name}`,
      rank: i,
      performance: {
        '@type': 'Performance',
        competitor: {
          '@id': `http://activioty.ddns.net/race/${currentRace._id}/competitor/${resultsArray[i].bibId}`,
          bibIdentifier: resultsArray[i].bibId,
          transponderIdentifier: resultsArray[i].epc,
          agent: {
            '@id': `http://activioty.ddns.net/athlete/${resultsArray[i].idUser}`,
            name: resultsArray[i].nameUser,
          },
        },
        time: `${timeCheckpoint}`,
      },
    });
  }
  results.results = resultsJsonLD;
  return results;
}

Template.competitionMain.events({
  'click #startCompetition-button'(event) {
    const template = Template.instance();
    template.CompetitionClock.start();
    template.startTimestamp.set(Sntp.now() / 1000);
    const actionButton = $('#startCompetition-button');
    actionButton.html('<i class="material-icons">stop</i>');
    actionButton.attr('id', 'finishCompetition-button');
  },
  'click #finishCompetition-button'(event) {
    const template = Template.instance();
    template.CompetitionClock.stop();
    template.finishTimestamp = Sntp.now();
    const actionButton = $('#finishCompetition-button');
    actionButton.html('<i class="material-icons">format_list_numbered</i>');
    actionButton.attr('id', 'downloadResults-button');
  },
  'click #downloadResults-button'(event) {
    const template = Template.instance();
    const idFinishLine = template.currentRace.finalCheckpoint.id;
    
    const jsonResults = generateResultsJsonLD(template.currentRace, template.resultsAtCheckpoint[idFinishLine]);
    $('#modalJsonResults .json').html(beautify(jsonResults, null, 2, 80));
    $('#modalJsonResults').modal('open');
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

