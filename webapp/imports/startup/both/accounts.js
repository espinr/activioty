import { Accounts } from 'meteor/accounts-base';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

function onLogout(error, state) {
  FlowRouter.go('App.home');
}

function onSubmitAtForm(error, state) {
  let user;
  let email;
  let options;
  switch (state) {
    case 'forgotPwd':
      email = $('#at-field-email').val();
      if (!email) return;
      options = { email };
      Accounts.forgotPassword(options, (err) => {
        if (err) {
          console.log(err);
        }
        FlowRouter.go('App.login');
        Materialize.toast('You will receive an email to change your password', 4000);
      });
      break;
    case 'resetPwd':
      Materialize.toast('Your password has been reset', 4000);
      return FlowRouter.go('App.profile');
    case 'changePwd':
      Materialize.toast('Your password has been reset', 4000);
      break;
    case 'verifyEmail':
      break;
    case 'signUp':
      // First time, adds the basic roles to this user
      Meteor.call('addUserDefaultRole', Meteor.userId());
      user = Meteor.user();
      email = user && user.emails && user.emails[0].address;
      Meteor.call(
        'sendEmail',
        `${email}`, // To
        'Activ-IoTy <martin@espinr.es>', // From
        'Welcome to Activ-IoTy',
        `Hi,

Welcome to Activ-IoTy! We are glad to have you on board. 

Feel free to change your profile on http://...

Cheers,

The Activ-IoTy Team
`,
      );
      return FlowRouter.go('App.home');
    default:
      FlowRouter.go('App.home');
  }
}

/* Configuration of user accounts */
AccountsTemplates.configure({
  confirmPassword: true,
  enablePasswordChange: true,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,

  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,

  // Client-side Validation
  continuousValidation: false,
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: false,
  positiveFeedback: true,
  showValidating: true,

  showReCaptcha: false,

  // Privacy Policy and Terms of Use
  // privacyUrl: 'privacy',
  // termsUrl: 'useTerms',

  // Redirects
  homeRoutePath: '/',
  redirectTimeout: 4000,

  // Hooks
  onLogoutHook: onLogout,
  onSubmitHook: onSubmitAtForm,
  preSignUpHook(error, state) {
  },
  postSignUpHook(error, state) {
  },
});

/* Routing login pages */
AccountsTemplates.configureRoute('signIn', {
  layoutType: 'blaze',
  name: 'App.login',
  path: '/login',
  template: 'fullPageAtForm',
  layoutTemplate: 'loginLayout',
  layoutRegions: {
    nav: 'loginHeader',
  },
  contentRegion: 'main',
  redirect: 'App.home',
});

AccountsTemplates.configureRoute('signUp', {
  layoutType: 'blaze',
  name: 'App.signUp',
  path: '/register',
  template: 'fullPageAtForm',
  layoutTemplate: 'loginLayout',
  layoutRegions: {
    nav: 'loginHeader',
  },
  contentRegion: 'main',
  redirect: 'App.newProfile',
});

AccountsTemplates.configureRoute('forgotPwd', {
  layoutType: 'blaze',
  name: 'App.forgotPwd',
  path: '/forgot-passwod',
  template: 'fullPageAtForm',
  layoutTemplate: 'loginLayout',
  layoutRegions: {
    nav: 'loginHeader',
  },
  contentRegion: 'main',
  redirect: 'App.login',
});

AccountsTemplates.configureRoute('resetPwd', {
  layoutType: 'blaze',
  name: 'App.resetPwd',
  path: '/reset-password',
  template: 'fullPageAtForm',
  layoutTemplate: 'loginLayout',
  layoutRegions: {
    nav: 'loginHeader',
  },
  contentRegion: 'main',
  redirect: 'App.login',
});

// At the end of change passworkd should be redirected to the previous page
AccountsTemplates.configureRoute('changePwd', {
  layoutType: 'blaze',
  name: 'App.changePwd',
  path: '/change-password',
  template: 'fullPageAtForm',
  layoutTemplate: 'loginLayout',
  layoutRegions: {
    nav: 'editionFormHeader',
    title: 'Change Password',
  },
  contentRegion: 'main',
  redirect: 'App.home',
});


Accounts.onLogin(function() {});
Accounts.onLogout(function() {});
