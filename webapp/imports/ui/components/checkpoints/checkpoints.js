import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import Common from '../../../../both/lib/common.js';

import './map/map.js';
import './cards/cards.js';
import './checkpoints.html';

Template.checkpointsMain.onCreated(function () {
  let template = Template.instance();
  template.searchQuery = new ReactiveVar();
  template.searching = new ReactiveVar(false);
  template.loading = new ReactiveVar(true);
  
  $('document').ready(function() {
    $('ul.tabs').tabs( {
      onShow: (tabpanel) => {
        // Goes to the top of the page
        window.scrollTo(0, 0);
        if (tabpanel && tabpanel[0].id === 'map' && GoogleMaps.loaded()) {
          google.maps.event.trigger(GoogleMaps.maps.checkpointsMap.instance, 'resize');
        }
      },
    });
    $('.search-filter .reset-button').hide();
  });

  template.autorun(() => {
    const handler = template.subscribe('checkpoints.search', template.searchQuery.get(), () => {
      setTimeout(() => {
        template.searching.set(false);
      }, 300);
    });
    if (handler.ready()) {
      template.loading.set(false);
    }
  });
});

Template.checkpointsMain.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  loading() {
    return Template.instance().loading.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
});

Template.checkpointsMain.events({
  'input #search'(event, template) {
    const value = event.target.value.trim();
    if (value !== '') {
      template.searchQuery.set(value);
      template.searching.set(true);
      $('.search-filter .reset-button').show();
    } else {
      template.searchQuery.set(value);
      $('.search-filter .reset-button').hide();
    }
  },
  'click .reset-button'(event, template) {
    $('#search').val('');
    $('.search-filter .reset-button').hide();
    template.searchQuery.set('');
  },
  'submit .search-filter>form'(event, template) {
    event.preventDefault();
  },
});

Template.checkpointsNav.helpers({});
Template.checkpointsNav.events({});
