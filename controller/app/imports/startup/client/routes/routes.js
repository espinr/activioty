import { Meteor } from 'meteor/meteor';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Roles } from 'meteor/alanning:roles';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Tracker } from 'meteor/tracker';
import RoleTypes from '../../../api/users/roles/roleTypes.js';
import Common from '../../../../both/lib/common.js';
import { Races } from '../../../api/races/races.js';

// Import needed templates
import '../config.js';

// Components
import '../../../ui/components/spinner/spinner.js';
import '../../../ui/components/header/header.js';
import '../../../ui/components/accounts/accounts.js';
import '../../../ui/components/profile/new-profile/new-profile.js';
import '../../../ui/components/profile/edit-profile/edit-profile.js';
import '../../../ui/components/profile/edit-profile-admin/edit-profile-admin.js';
import '../../../ui/components/checkpoints/checkpoints.js';
import '../../../ui/components/checkpoints/checkpoint/new/new.js';
import '../../../ui/components/checkpoints/checkpoint/edit/edit.js';
import '../../../ui/components/races/races.js';
import '../../../ui/components/races/race/new/new.js';
import '../../../ui/components/races/race/edit/edit.js';
import '../../../ui/components/competition/competition.js';
import '../../../ui/components/competitors/competitors.js';
import '../../../ui/components/policies/privacy-policy/privacy-policy.js';


// Errors
import '../../../ui/components/errors/not-found/not-found.js';

// Layouts
import '../../../ui/layouts/main-layout/main-layout.js';
import '../../../ui/layouts/login/login.js';
import '../../../ui/pages/error/error.js';


if (Meteor.isClient) {
  FlowRouter.wait();
  Tracker.autorun(function() {
    if (Roles.subscription.ready() && AccountsTemplates._initialized && !FlowRouter._initialized) {
      FlowRouter.initialize();
    }
  });
}

/* -----------------
 * Public Routes
 * -----------------
*/
const publicRoutes = FlowRouter.group({
  name: 'public',
  triggersEnter: [
    function(context, redirect) {
      // If the user is logged in but his profile was not set
      if (Common.isLoggedUser() && !Common.hasSetUpProfile()) {
        FlowRouter.go('App.newProfile');
      }
    },
  ],
});

publicRoutes.route('/', {
  name: 'App.home',
  onBack(details, origin) {
    BlazeLayout.render('appHome');
  },
  action(params, queryParams) {
    if (!Common.isLoggedUser()) {
      FlowRouter.go('App.login');
    }
    const raceId = (queryParams.raceId ? queryParams.raceId : null);
    BlazeLayout.render('appMainLayout', { main: 'racesMain', nav: 'racesNav', raceId });
  },
});

publicRoutes.route('/use-terms', {
  name: 'useTerms',
  action() {
    BlazeLayout.render('useTerms');
  },
});

publicRoutes.route('/privacy', {
  name: 'privacy',
  action() {
    BlazeLayout.render('privacy');
  },
});

publicRoutes.route('/new-profile', {
  name: 'App.newProfile',
  action() {
    // If NOT loggedIn -> redirected to /login
    if (!Common.isLoggedUser()) {
      FlowRouter.go('App.login');
    }
    BlazeLayout.render('loginLayout', { main: 'newProfile' });
  },
});

publicRoutes.route('/my-profile', {
  name: 'App.editProfile',
  onBack(details, origin) {
    BlazeLayout.render('appHome');
  },
  // If NOT loggedIn -> redirected to /login
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action() {
    BlazeLayout.render('appMainLayout', { main: 'editProfile', nav: 'editionFormHeader' });
  },
});


// Routes related to checkpoints {/checkpoints/*}
const checkpointsRoutes = FlowRouter.group({
  name: 'checkpoints',
  triggersEnter: [
    function(context, redirect) {
      this.route = FlowRouter.current();
      const { path } = this.route;
      if (Common.hasAnyOfUserRoles([RoleTypes.ADMIN])) {
        //console.log(`Granted access to ${path}`);
      } else {
        console.log('Access denied. Redirected to /');
        FlowRouter.go('App.home');
      }
    },
  ],
});

checkpointsRoutes.route('/checkpoints', {
  name: 'checkpoints.dashboard',
  action(params, queryParams) {
    const checkpointId = (queryParams.checkpointId ? queryParams.checkpointId : null);
    BlazeLayout.render('appMainLayout', { main: 'checkpointsMain', nav: 'checkpointsNav', checkpointId });
  },
});

checkpointsRoutes.route('/checkpoints/new', {
  name: 'checkpoints.new',
  action() {
    BlazeLayout.render('appMainLayout', { main: 'newCheckpoint', nav: 'editionFormHeader' });
  },
});

checkpointsRoutes.route('/checkpoints/edit/:checkpointId', {
  name: 'checkpoints.edit',
  action(params, queryParams) {
    //let currentCheckpoint = null;
    if (params.checkpointId) {
      //currentCheckpoint = Checkpoints.findOne({ _id: params.checkpointId });
      BlazeLayout.render('appMainLayout', { main: 'editCheckpoint', nav: 'editionFormHeader' });
    } else {
      FlowRouter.go('checkpoints.dashboard');
    }
  },
});

checkpointsRoutes.route('/races', {
  name: 'races.dashboard',
  action(params, queryParams) {
    const raceId = (queryParams.raceId ? queryParams.raceId : null);
    BlazeLayout.render('appMainLayout', { main: 'racesMain', nav: 'racesNav', raceId });
  },
});

checkpointsRoutes.route('/races/new', {
  name: 'races.new',
  action() {
    BlazeLayout.render('appMainLayout', { main: 'newRace', nav: 'editionFormHeader' });
  },
});

checkpointsRoutes.route('/races/edit/:raceId', {
  name: 'races.edit',
  action(params, queryParams) {
    //let currentCheckpoint = null;
    if (params.raceId) {
      //currentCheckpoint = Checkpoints.findOne({ _id: params.checkpointId });
      BlazeLayout.render('appMainLayout', { main: 'editRace', nav: 'editionFormHeader' });
    } else {
      FlowRouter.go('races.dashboard');
    }
  },
});

checkpointsRoutes.route('/competition/:raceId', {
  name: 'races.competition',
  action(params, queryParams) {
    //let currentCheckpoint = null;
    if (params.raceId) {
      BlazeLayout.render('appMainLayout', { main: 'competitionMain', nav: 'editionFormHeader'});
    } else {
      FlowRouter.go('races.dashboard');
    }
  },
});

checkpointsRoutes.route('/competitors/:raceId', {
  name: 'races.competitors',
  action(params, queryParams) {
    //let currentCheckpoint = null;
    if (params.raceId) {
      BlazeLayout.render('appMainLayout', { main: 'competitorsMain', nav: 'editionFormHeader'});
    } else {
      FlowRouter.go('races.dashboard');
    }
  },
});


/* Error handling */
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('errorTemplate', { errorTemplate: 'errorNotFound' });
  },
};


/* -----------------
 * Routes for admins
 * -----------------
*/
const adminRoutes = FlowRouter.group({
  name: 'admin',
  triggersEnter: [
    function(context, redirect) {
      if (Common.hasAnyOfUserRoles([RoleTypes.ADMIN])) {
        this.route = FlowRouter.current();
        //const { path } = this.route;
        //console.log(`Granted access to ${path}`);
      } else {
        console.log('Access denied. Redirected to /');
        FlowRouter.go('App.home');
      }
    },
  ],
});

adminRoutes.route('/admin/athletes', {
  name: 'admin.users',
  action() {
    BlazeLayout.render('appMainLayout', { main: 'adminAccounts', nav: 'mainNav' });
  },
});

publicRoutes.route('/admin/athletes/:userId', {
  name: 'App.editProfileAdmin',
  onBack(details, origin) {
    BlazeLayout.render('admin.users');
  },
  // If NOT loggedIn -> redirected to /login
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action(params) {
    if (params.userId) {
      BlazeLayout.render('appMainLayout', { main: 'editProfileAdmin', nav: 'editionFormHeader' });
    } else {
      FlowRouter.go('admin.users');
    }
  },
});

