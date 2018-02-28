import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import './accounts.html';
import RoleTypes from '../../../api/users/roles/roleTypes';

Template.adminAccounts.onCreated(function () {
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
    const handler = template.subscribe('users.search', template.searchQuery.get(), () => {
      setTimeout(() => {
        template.searching.set(false);
      }, 300);
    });
    if (handler.ready()) {
      template.loading.set(false);
    }
  });
});

Template.adminAccounts.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  loading() {
    return Template.instance().loading.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  tableFilters() {
    return ['userFilter'];
  },
  users() {
    return Meteor.users.find();
  },
  settings() {
    return {
      fields: [
        {
          key: 'profile.name',
          label: 'Name',
          sortOrder: 1,
          sortDirection: 'ascending',
        },
        {
          key: 'profile.phone',
          label: 'Phone',
          sortOrder: 1,
          sortDirection: 'ascending',
        },
        {
          key: 'emails.0.address',
          label: 'Email',
          sortOrder: 1,
          sortDirection: 'ascending',
          fn(value) { return new Spacebars.SafeString(`<a class="truncate" style="max-width:15rem" href="mailto:${value}">${value}</a>`); },
        },
        {
          key: 'profile.club',
          label: 'Club',
          sortOrder: 1,
          sortDirection: 'ascending',
        },
        {
          key: '_id',
          label: '',
          fn(value) {
            return new Spacebars.SafeString(`<a href="/admin/profile/${value}" title="Edit user"><i class="material-icons">edit</i></a>`);
          },
        },
      ],
    };
  },
});

Template.adminAccounts.events({
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
