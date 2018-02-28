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
      let infoWindowClassname = 'infoWindow-ranking';
      if (currentRace.finalCheckpoint.id === checkpointRace.id) {
        infoWindowClassname += ' finish';
      }
      const optionsMarker = {
        icon: '/img/markers/marker_red.png',
        draggable: false,
        opacity: 0.9,
        map: currentMap,
      };
      const point = new google.maps.LatLng(checkpoint.latitude, checkpoint.longitude);
      bounds.extend(point);
      optionsMarker.position = point;
      const marker = new google.maps.Marker(optionsMarker);

      const infowindow = new google.maps.InfoWindow({
        content: `<div class="${infoWindowClassname}">
        <table class="bordered" id="${checkpoint._id}">
          <caption><span class="truncate">${checkpoint.identifier}</span></caption>
          <tbody>
            <tr class="first"><td></td><td></td><td></td></tr>
            <tr class="second"><td></td><td></td><td></td></tr>
            <tr class="third"><td></td><td></td><td></td></tr>
            <tr class="break"><td colspan="3"></td></tr>
            <tr class="fourth"><td></td><td></td><td></td></tr>
            <tr class="fifth"><td></td><td></td><td></td></tr>
            <tr class="sixth"><td></td><td></td><td></td></tr>
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
  currentMap.fitBounds(bounds);
}


Template.competitionMap.onCreated(function () {
  const template = Template.instance();
  template.autorun(() => {
    const handler = template.subscribe('races.search');
    const handler2 = template.subscribe('checkpoints.search');
    template.autorun(() => {
      if (handler.ready() && handler2.ready()) {
        $('#competitionMap').ready(function() {
          if (GoogleMaps.loaded()) {
            initMap(GoogleMaps.maps.competitionMap);
          }
          //GoogleMaps.ready('competitionMap', initMap);
        });
      }
    });
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
    checkpoints.forEach((checkpoint) => {
      if (checkpoint.ready) {
        const markerReady = markers[checkpoint._id];
        if (markerReady) {
          markerReady.setIcon('/img/markers/marker_white.png');
          google.maps.event.trigger(markerReady, 'click');  
        }
        // Materialize.toast(`Checkpoint ${checkpoint.identifier} is ready!`, 4000);
      }
    });
  },
});

// mosquitto_pub -h activioty.ddns.net -t 'RFID-Reader-1/ready' -m '{"checkpoint" : { "id" : "RFID-Reader-1" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'RFID-Reader-2/ready' -m '{"checkpoint" : { "id" : "RFID-Reader-2" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'Keypad-1/ready' -m '{"checkpoint" : { "id" : "Keypad-1" }, "timestamp"  : 1518770672254}'
// mosquitto_pub -h activioty.ddns.net -t 'Keyboard-2/ready' -m '{"checkpoint" : { "id" : "Keyboard-2" }, "timestamp"  : 1518770672254}'

// mosquitto_pub -h activioty.ddns.net -t 'RFID-Reader-1/checkin' -m '{ "checkpoint" : { "id" : "RFID-Reader-1" }, "epcIdentifier": "E2 00 51 42 05 0F 02 62 16 00 6F 40", "timestamp": 1518770672254 }'

Template.competitionMap.events({});
