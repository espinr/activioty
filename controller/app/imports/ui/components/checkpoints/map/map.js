import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import './map.html';

let activeInfowindow = null;
let activeMarkers = [];

Template.checkpointsMap.onCreated(function () {
  const highlightedCheckpointId = this.data.checkpointId;

  GoogleMaps.ready('checkpointsMap', function(map) {
    Tracker.autorun(function() {
      const currentMap = GoogleMaps.maps.checkpointsMap.instance;
      const bounds = new google.maps.LatLngBounds();
      let markerToHighlight = null;

      const checkpoints = Checkpoints.find().fetch();
      checkpoints.forEach((checkpoint) => {
        const optionsMarker = {
          icon: '/img/markers/marker_black.png',
          draggable: false,
          opacity: 0.9,
          map: currentMap,
        };
        const point = new google.maps.LatLng(checkpoint.latitude, checkpoint.longitude);
        bounds.extend(point);
        const picture = checkpoint.picture ? checkpoint.picture : '/img/checkpoint.jpg';
        let notes = '';
        if (checkpoint.notes && checkpoint.notes.length > 0) {
          notes = `<div class="row"><div class="col s12 valign-wrapper"><i class="material-icons tiny">comment</i> ${checkpoint.notes}</div></div>`;
        }
        optionsMarker.position = point;
        const marker = new google.maps.Marker(optionsMarker);
        const infowindow = new google.maps.InfoWindow({
          content: `<div class="card small infoWindow-checkpoint">
                <div class="card-image waves-effect waves-block waves-light">
                  <img class="activator" src="${picture}" alt="${checkpoint.name}">
                </div>
                <div class="card-content">
                  <span class="card-title activator truncate">${checkpoint.identifier}<i class="material-icons right">more_vert</i></span>
                  <div class="card-action">
                    <a href="/checkpoints/edit/${checkpoint._id}">Edit</a>
                  </div>                    
                </div>  
                <div class="card-reveal">
                  <span class="card-title truncate">${checkpoint.identifier}<i class="material-icons right">close</i></span>
                  <div class="row">
                    <div class="col s12 valign-wrapper">
                      <i class="material-icons tiny">label_outline</i> ${checkpoint.name}
                    </div> 
                  </div>
                  <div class="row">
                    <div class="col s12 valign-wrapper">
                      <i class="material-icons tiny">label_outline</i> ${checkpoint.description}
                    </div> 
                  </div>
                  <div class="row">
                    <div class="col s12 valign-wrapper">
                      <blockquote>${checkpoint.notes ? checkpoint.notes : ''}</blockquote>
                    </div> 
                  </div>
                  <div class="card-action">
                    <a href="/checkpoints/edit/${checkpoint._id}">Edit</a>
checkpoints              </div>`,
        });
        marker.addListener('click', function() {
          if (activeInfowindow) {
            activeInfowindow.close();
          }
          infowindow.open(currentMap, marker);
          activeInfowindow = infowindow;
        });
        // Should I highlight the current marker?
        if (highlightedCheckpointId === checkpoint._id) {
          marker.animation = google.maps.Animation.DROP;
          markerToHighlight = marker;
        }
        activeMarkers.push(marker);
      });
      currentMap.fitBounds(bounds);
      if (markerToHighlight) {
        new google.maps.event.trigger(markerToHighlight, 'click');
      }
      if (checkpoints.length === 0) {
        // Clean the existing markers on the map
        activeMarkers.forEach((marker) => {
          marker.setMap(null);
          currentMap.setCenter(new google.maps.LatLng(43.132056, -5.780542));
          currentMap.setZoom(8);
        });
        activeMarkers = [];
      }
    });
  });
});

Template.checkpointsMap.helpers({
  checkpointsMapOptions() {
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
        fullscreenControl: true,
      };
    }
    return {};
  },
});

Template.checkpointsMap.events({});
