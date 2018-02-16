import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Races } from '/imports/api/races/races.js';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import './map.html';
import { Messages } from '../../../../api/messages/messages';

// Installed markers
let markers = []; 

function initMap(map) {

  const currentMap = map.instance;
  const bounds = new google.maps.LatLngBounds();      

  const raceId = FlowRouter.getParam('raceId');
  if (!raceId) {
    console.log('No raceId received');
    return false;
  }
  const currentRace = Races.findOne({ _id: raceId });

  if (currentRace.geojsonUrl) {
    // Loads the course of the competition
    currentMap.data.loadGeoJson(currentRace.geojsonUrl);
  }

  currentMap.data.setStyle({
    fillColor: '#d81b60',
    strokeColor: '#d81b60',
    strokeWeight: 10,
  });

  if (currentRace.checkpoints && currentRace.checkpoints.length > 0) {
    currentRace.checkpoints.forEach((checkpointRace) => {

      const checkpoint = Checkpoints.findOne({ _id: checkpointRace.id });

      const optionsMarker = {
        icon: '/img/markers/marker_red.png',
        draggable: false,
        opacity: 0.9,
        map: currentMap,
      };
      const point = new google.maps.LatLng(checkpoint.latitude, checkpoint.longitude);
      bounds.extend(point);
      const picture = checkpoint.picture ? checkpoint.picture : '/img/checkpoint.jpg';
      optionsMarker.position = point;
      const marker = new google.maps.Marker(optionsMarker);
      const infowindow = new google.maps.InfoWindow({
        content: `<div class="infoWindow-checkpoint-race">
        <table class="bordered" id="${checkpoint._id}">
          <caption><span class="truncate">${checkpoint.identifier}</span></caption>
          <tbody class="first">
            <tr class="first"><td>🥇</td><td>Martin Alvarez</td><td><i class="material-icons tiny">arrow_upward</i></td></tr>
            <tr class="second"><td>🥈</td><td>Martin Alvarez</td><td><i class="material-icons tiny">arrow_upward</i></td></tr>
            <tr class="third"><td>🥉</td><td>Runner 3</td><td><i class="material-icons tiny">arrow_upward</i></td></tr>
            <tr class="break"><td colspan="3"></td></tr>
            <tr class="fourth"><td>5</td><td>Runner 4</td><td><i class="material-icons tiny">arrow_upward</i></td></tr>
            <tr class="fifth"><td>6</td><td>Runner 5</td><td><i class="material-icons tiny">arrow_downward</i></td></tr>
            <tr class="sixth"><td>7</td><td>Runner 5</td><td><i class="material-icons tiny">arrow_upward</i></td></tr>
          </tbody>
        </table>
        </div>`,
      });
      marker.addListener('click', function() {
        infowindow.open(currentMap, marker);
      });
      markers[checkpoint._id] = marker;
    });
  }
  console.log(markers);
  currentMap.fitBounds(bounds);
}


Template.competitionMap.onCreated(function () {
  const template = Template.instance();
  template.autorun(() => {
    const handler = template.subscribe('races.search');
    const handler2 = template.subscribe('checkpoints.search');
    if (handler.ready() && handler2.ready()) {
      console.log('handler is ready');
      GoogleMaps.ready('competitionMap', initMap);
    }
  });
});

Template.competitionMap.helpers({
  messages() {
    Messages.find();
  },
  competitionMapOptions() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(43.132056, -5.780542),
        zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM,
        },
        scaleControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      };
    }
    return {};
  },
  checkpoints() {
    const checkpoints = Checkpoints.find();
    console.log(checkpoints);
    checkpoints.forEach((checkpoint) => {
      if (checkpoint.ready) {
        const markerReady = markers[checkpoint._id];
        markerReady.setIcon('/img/markers/marker_green.png');
        Materialize.toast(`Checkpoint ${checkpoint.identifier} is ready!`, 4000);
      }
    });
  },
});

// mosquitto_pub -h activioty.ddns.net -t 'RFID-Reader-1/ready' -m '{"checkpoint" : { "id" : "RFID-Reader-1" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'RFID-Reader-2/ready' -m '{"checkpoint" : { "id" : "RFID-Reader-2" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'Keypad-1/ready' -m '{"checkpoint" : { "id" : "Keypad-1" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'Keyboard-2/ready' -m '{"checkpoint" : { "id" : "Keyboard-2" }, "timestamp"  : 1518770672254}'


Template.competitionMap.events({});
