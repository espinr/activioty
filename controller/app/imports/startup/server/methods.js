import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Roles } from 'meteor/alanning:roles';
import Sntp from 'sntp';
import RoleTypes from '../../api/users/roles/roleTypes.js';


Meteor.methods({
  logToConsole(msg) {
    console.log(` SERVER> ${  msg}`);
  },
  sendEmail(to, from, subject, text) {
    if (typeof to === 'string' && to.length > 0 &&
        typeof from === 'string' && from.length > 0 &&
        typeof subject === 'string' && subject.length > 0 &&
        typeof text === 'string' && text.length > 0 ) {
      this.unblock();
      Email.send({ to, from, bcc: 'martin@espinr.es', subject, text });    
    }
  },
  addUserDefaultRole(userId) {
    if (!userId) return;
    Roles.addUsersToRoles(userId, [RoleTypes.PUBLIC]);
  },
  addRolesToUser(userId, rolesArray) {
    if (!userId || !rolesArray) return;
    Roles.addUsersToRoles(userId, rolesArray);
  },
  getTimestamp() {
    const ntpOptions = {
      host: 'time.google.com',
      port: 123,
    };
    Sntp.time(ntpOptions, function (err, time) {
      if (err) {
        console.log('Failed: ' + err.message);
      }
      console.log('Local clock is off by: ' + time.t + ' milliseconds');
    });
  },
});

