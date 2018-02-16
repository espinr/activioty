import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Races } from '../../../api/races/races.js';

import './races.html';

Template.racesMain.onCreated(function () {
  let template = Template.instance();
  template.searchQuery = new ReactiveVar();
  template.searching = new ReactiveVar(false);
  template.loading = new ReactiveVar(true);

  $('document').ready(function() {
    $('.search-filter .reset-button').hide();
    $('select').material_select();
    $('select').material_select();
  });

  template.autorun(() => {
    const handler = template.subscribe('races.search', template.searchQuery.get(), () => {
      setTimeout(() => {
        template.searching.set(false);
      }, 300);
    });
    if (handler.ready()) {
      template.loading.set(false);
    }
  });
});

Template.racesMain.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  loading() {
    return Template.instance().loading.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  races() {
    return Races.find();
  },
  settings() {
    return {
      fields: [
        {
          key: 'identifier',
          label: 'Id',
          sortOrder: 1,
          sortDirection: 'ascending',
        },
        {
          key: 'name',
          label: 'Name',
          sortOrder: 1,
          sortDirection: 'ascending',
        },
        {
          key: 'description',
          label: 'Description',
          sortOrder: 1,
        },
        {
          key: '_id',
          label: '',
          fn(value) {
            return new Spacebars.SafeString(`<a href="/races/edit/${value}" title="Edit race"><i class="material-icons">edit</i></a>
            <a href="/competitors/${value}" title="Competitors"><i class="material-icons">people_outline</i></a>
            <a href="/competition/${value}" title="Start Competition"><i class="material-icons">play_circle_filled</i></a>`);
          },
        },
      ],
    };
  },
});

Template.racesMain.events({
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
