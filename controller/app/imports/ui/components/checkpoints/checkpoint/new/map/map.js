import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import './map.html';

/*
function setPostalCode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=postal_code&key=AIzaSyBpDW5a0FDEjAqEP-cOfT3GLaHHWdogSQY`;

  $.get( url, (result) => {
    try {
      console.log(result.results[0].address_components[0]);
      if ((result.status === 'OK') && (result.results.length > 0) && (result.results[0].address_components[0])) {
        // set the postal code into the form field 
        $('form input[name="postalCode"]').val(result.results[0].address_components[0].long_name);
        return result.results[0].address_components[0].long_name;
      }  
    } catch (ex) {
      console.log('Error getting the postal code');
    }
    return null;
  });
}
*/

function inputCoordinatesIntoForm(lat, lng) {
  $('form input[name="latitude"]').val(lat);
  $('form input[name="longitude"]').val(lng);
  // setPostalCode(lat, lng);
}

function displayAndWatch(currentPosition) {
  const currentPositionMarker = new google.maps.Marker({
    position: new google.maps.LatLng(
      currentPosition.coords.latitude,
      currentPosition.coords.longitude,
    ),
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#0288d1',
      fillOpacity: 0.7,
      scale: 2,
      strokeColor: '#0288d1',
      strokeWeight: 20,
      strokeOpacity: 0.7,
    },
    map: GoogleMaps.maps.newCheckpointMap.instance,
    title: 'Tu posición actual',
  });
  GoogleMaps.maps.newCheckpointMap.instance.panTo(new google.maps.LatLng(
    currentPosition.coords.latitude,
    currentPosition.coords.longitude,
  ));
  GoogleMaps.maps.newCheckpointMap.instance.setZoom(14);
  navigator.geolocation.watchPosition((pos) => {
    currentPositionMarker.setPosition(new google.maps.LatLng(
      pos.coords.latitude,
      pos.coords.longitude,
    ));
  });
}

function locError(error) {
  alert(error.code);
  Materialize.toast('No puedo encontrar la localización. Marca la posición aproximada en el mapa', 4000);
}

Template.newCheckpointMap.onRendered(() => {
  GoogleMaps.ready('newCheckpointMap', function(map) {
    const currentMap = GoogleMaps.maps.newCheckpointMap.instance;
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: false,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['marker'],
      },
      markerOptions: {
        animation: google.maps.Animation.DROP,
        icon: '/img/markers/marker_yellow+.png',
        draggable: true,
        opacity: 0.9,
      },
    });
    drawingManager.setMap(currentMap);

    google.maps.event.addListener(drawingManager, 'markercomplete', function(newMarker) {
      inputCoordinatesIntoForm(newMarker.position.lat(), newMarker.position.lng());
      // Disable drawing new markers
      drawingManager.setOptions({
        drawingMode: null,
      });
      // listener for drag and drop marker
      google.maps.event.addListener(newMarker, 'dragend', function(event) {
        inputCoordinatesIntoForm(this.position.lat(), this.position.lng());
      });
    });
    // if geolocation is on, enables the button to self-locate
    if ('geolocation' in navigator) {
      $('#newCheckpointMap-myLocation-button').bind('click', (event) => { 
        const geoOptions = {
          timeout: 10 * 1000,
        };
        navigator.geolocation.getCurrentPosition(displayAndWatch, locError, geoOptions);
      });
    } else {
      $('#newCheckpointMap-myLocation-button').hide();
    }
    currentMap.setCenter(new google.maps.LatLng(43.132056, -5.780542));
    currentMap.setZoom(8);
  });
  // Hides the information overlay and resizes the map
  $('#init-message-map').bind('click', (event) => { 
    google.maps.event.trigger(GoogleMaps.maps.newCheckpointMap.instance, 'resize');
    $('#init-message-map').hide(); 
  });
});

Template.newCheckpointMap.helpers({
  newCheckpointMapOptions() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(43.132056, -5.780542),
        zoom: 8,
        zoomControl: true,
        scaleControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
      };
    }
  },
});
