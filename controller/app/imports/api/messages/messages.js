// Definition of the messages collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Messages = new Mongo.Collection('messages');

if (Meteor.isServer) {
  Messages.mqttConnect('mqtt://activioty.ddns.net:1883', ['+/ready', '+/checkin'], { insert: true }, {});
}
