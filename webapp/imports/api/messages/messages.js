// Definition of the checkpoints collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Messages = new Mongo.Collection('messages');

if (Meteor.isServer) {
  Messages.mqttConnect('mqtt://test.mosquitto.org:1883', ['ready'], { insert: true }, {});
}
