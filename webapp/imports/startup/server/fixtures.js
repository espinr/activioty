// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import mqtt from 'mqtt';
import { Identifiers } from '../../api/identifiers/identifiers.js';
import { identifiers } from '../../../stores/identifiers.js';
import RoleTypes from '../../api/users/roles/roleTypes.js';
import { Checkpoints } from '../../api/checkpoints/checkpoints.js';
import './accounts.js';

Meteor.startup(() => {

  // Sets the environment variable with the SMTP data
  //process.env.MAIL_URL = 'smtp://2d3f5be0e8d9dba98412fd3c24c73a5d:468420017d6a3fcfa39db2c74fbd8a36@in-v3.mailjet.com:587';
  process.env.MAIL_URL = 'smtp://127.0.0.1:25';

  // create the roles if they don't already exist
  if (!Meteor.roles.findOne({ name: RoleTypes.ADMIN })) {
    Roles.createRole(RoleTypes.ADMIN);
  }
  if (!Meteor.roles.findOne({ name: RoleTypes.PUBLIC })) {
    Roles.createRole(RoleTypes.PUBLIC);
  }
  // Create an admin/admin account if it doesn't exist
  if (Meteor.users.find({ username: 'admin' }).count() < 1) {
    const userId = Accounts.createUser({
      username: 'admin',
      email: 'martin@espinr.es',
      profile: {
        name: 'admin',
        firstName: 'admin',
        passport: '00000000',
        lastName: 'admin',
        phone: '000000000',
        acceptPolicy: true,
      },
      password: 'admin',
    });
    if (userId) {
      Roles.addUsersToRoles(userId, [RoleTypes.ADMIN, RoleTypes.PUBLIC]);
    }
  }

  // Load for the first time the identifiers
  if (Identifiers.find().count() < 1) {
    for (let i = 0; i < identifiers.length; i += 1) {
      Identifiers.insert(identifiers[i]);
    }
  }

  // All the checkpoints marked as inactive
  Checkpoints.update({}, { $set : { ready : false } }, { multi: true }, (error, result) => {
    if (error) {
      console.log(error);
    }
    if (result) {
      console.log(`${result} Checkpoints set as NOT ready`);
    }
  });
});
