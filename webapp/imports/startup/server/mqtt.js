import { Meteor } from 'meteor/meteor';
import mqtt from 'mqtt';
import Sntp from 'sntp';
import { Checkpoints } from '../../api/checkpoints/checkpoints.js';

if (Meteor.isServer) {
  const mqttBroker = {
    url : 'mqtt://activioty.ddns.net',
    port: 1883,
  };
  const timestamp = Sntp.now();

  const mqttClient = mqtt.connect(mqttBroker.url, mqttBroker.port);

  mqttClient.on('connect', function () {
    mqttClient.subscribe({ '+/ready': 1, '+/checkin': 1 });
    mqttClient.publish('controller/ready', `{ "checkpoint" : { "id" : "I am the controller :-)"}, "timestamp" : ${timestamp} }`);
  });

  mqttClient.on('message', Meteor.bindEnvironment(function (topic, message) {
    console.log(`MQTT Message received [${topic.toString()}] -> ${message.toString()}`);
    if (topic.includes('/ready')) {
      // Marks the checkpoint as ready
      try {
        const msg = JSON.parse(message.toString());
        Checkpoints.update({ identifier: msg.checkpoint.id }, { $set : { ready : true } }, (error, result) => {
          if (error) {
            console.log(error);
          }
          if (result) {
            console.log(`${result} Checkpoint ${msg.checkpoint.id} is marked as ready (${msg.timestamp})!`);
          }
        });
      } catch (e) {
        console.log(e);
        console.log('I cannot process the readiness of a checkpoint, so I skip it');
      }
    } else if (topic.includes('/checkin')) {
      // Includes the athlete in the checkins database
      try {
        const msg = JSON.parse(message.toString());
      } catch (e) {
        console.log('I cannot process the readiness of a checkpoint, so I skip it');
      }
    }
  }));
}
