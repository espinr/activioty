import { Meteor } from 'meteor/meteor';
import mqtt from 'mqtt';
import Sntp from 'sntp';
import { Checkpoints } from '../../api/checkpoints/checkpoints.js';
import { Identifiers } from '../../api/identifiers/identifiers.js';
import { Checkins } from '../../api/checkins/checkins.js';

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
            console.log(`${result} Checkpoint ${msg.checkpoint.id} is marked as ready (${msg.timestamp})`);
          }
        });
      } catch (e) {
        console.log(e);
        console.log('I cannot process the readiness of a checkpoint, so I skip it');
      }
    } else if (topic.includes('/checkin')) {
      /*
            The expected message has this structure: 
      {
        "checkpoint" : {
          "id" : "…",			// Required
          "geo" : { "…" }		// (Optional) It can be included in case the checkpoint is on the move
        },
        "bibId" : "001",	// Either 'bib' or 'epc' are required
        "epc" : "E2 00 51 42 05 0F 02 62 16 00 6F 40",
        "timestamp"  : 0000000, 	// Required
      }
      */
      // Includes the athlete in the checkins database
      try {
        const msg = JSON.parse(message.toString());
        const checkpoint = Checkpoints.findOne({ identifier: msg.checkpoint.id });
        let identifier;
        if (msg.epc) {
          identifier = Identifiers.findOne({ epc: msg.epc });
        } else {
          identifier = Identifiers.findOne({ bibId: msg.bibId });
        }
        const docToInsert = {
          checkpointId: checkpoint._id,
          bibIdentifier: identifier.bibId,
          epc: identifier.epc,
          timestamp: msg.timestamp,
        };
        Checkins.insert(docToInsert, (error, result) => {
          if (error) {
            console.log(error);
          }
          if (result) {
            console.log(`Checkin of Bib Number ${identifier.bibId} at ${checkpoint.name}`);
          }
        });
      } catch (e) {
        console.log(e);
        console.log('I cannot process the checkin in a checkpoint, so I skip it');
      }
    }
  }));
}
