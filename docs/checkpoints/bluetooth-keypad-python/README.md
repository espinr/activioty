# Checkpoint: Bluetooth Keypad on Rasperry Pi

This is a cheap option to implement an Activ-IoTy compatible checkpoint. 

Athletics events are usually controlled by officials with different roles such as: judges, timekeepers and starters. Other competitions must rely on officials with other roles, even volunteers or marshals. This solution enables officials and volunteers to register athletes at checkpoints using a simple physical keypad to type athlete's bib numbers.

Since all athletes must wear a visible bib identifier, this implementation is compatible with the existing rules of official competitions. Keypad may be substituted by a complete keyboard. Of course, the keypad could be a capacitive screen (i.e., tablet, smartphone, etc.) but it is probed that data input operators are more efficient with physical typing devices. Also they may be robust, even waterproof.  

This solution only needs a bluetooth input device connected to a Raspberry Pi, or similar.

![Bluetooth keypad and Raspberry Pi 3](https://raw.githubusercontent.com/espinr/activioty/master/docs/images/implementation/keypad_bluetooth_rpi.jpg)

The official located nearby the checkpoint **type the bib number** and **press enter** to register athletes' *checkinw*. The system will send the information (bib number + timestamp) of this `checkin` automatically.  

The implementation is based on the module I developed to implement the [Checkpoint based on a RFID Reader](../rfid-reader-python/).

Both approaches implement a generic `Reader` that performs two main tasks: `initialization` (setup of the checkpoint) and `doInventory`. 

```  
class Reader(object):
    def __init__(self):
        pass
        
    def initialize(self):
        pass
    
    def doInventory(self):
        pass     
```

They also use a common class `Checkpoint` that implements all the basic functionality of a checkpoint: 

* Get reliable timestamps from a common NTP server;
* Establish a connection with the MQTT server (once it is connected and set-up sends a `{checkpointId}/ready` message);
* Through a `Reader`, read either bib numbers or RFID EPCs that are related to each competitor (once they are read, they are sent to the MQTT queue under the topic `{checkpointId}/checkin`);
* This is executed in an infinite loop. The controller will be in charge of deal with the messages and do the business logic. 

The Checkpoint is implemented using [ntplib](https://github.com/Tipoca/ntplib) and [paho.mqtt](https://www.eclipse.org/paho/clients/python/). This is a summary of the code:

```     

# ... more imports ...

import ntplib
import paho.mqtt.publish as publish   


class Checkpoint(object):
    
    TOPIC_READY     = 'ready'
    TOPIC_CHECKIN   = 'checkin'
    
    def __init__(self, id, reader, mqttBrokerHost, mqttBrokerPort=1883):
        '''
        :param id: String with the identifier of the Checkpoint
        :param reader: Ind903Reader object (or other Reader) that will do the inventory
        :param mqttBrokerHost: String with the hostname of the MQTT broker
        :param mqttBrokerPort: (int) with the port of the MQTT broker (1883 by default)
        '''
        self.id = id
        self.reader = reader
        self.mqttBrokerHost = mqttBrokerHost
        self.mqttBrokerPort = mqttBrokerPort
        self.timestampOffset = self.getOffsetNTPTime()

    def checkinCompetitor(self, idCompetitorEPC, idCompetitorBibNumber):
        '''
        Method to be called once a competitor do a check-in. 
        This is a callback method to be send to the reader. 
        It sends a MQTT message to the broker
        :param idCompetitor: String with the ID of the competitor that the reader detected.
        '''
        competitor = {}
        if (idCompetitorEPC != None):
            competitor["epc"] = idCompetitorEPC; 
        if (idCompetitorBibNumber != None):
            competitor["bib"] = idCompetitorBibNumber;
            
        messageCheckin = { "checkpoint" : self.id , "timestamp" : self.getTimestamp(), "competitor" : competitor }
        topic = self.id + "/" + self.TOPIC_CHECKIN
        publish.single(topic, json.dumps(messageCheckin), hostname=self.mqttBrokerHost)
        print(topic + " topic to MQTT:")
        print(json.dumps(messageCheckin))
        
    def execute(self):
        messageReady = { "checkpoint" : self.id , "timestamp" : self.getTimestamp() }  
        topic = self.id + "/" + self.TOPIC_READY
        publish.single(topic, json.dumps(messageReady), hostname=self.mqttBrokerHost)
        print(topic + " topic to MQTT:")
        print(json.dumps(messageReady)) 
        self.reader.initialize()
        self.reader.doInventory(self.checkinCompetitor)

    def getOffsetNTPTime(self):
        '''
        Get timestamp from a NTP server and stores the offset with the internal clock.
        :return: (float) with the difference between the local clock and the NTP time (in seconds)
        '''
        c = ntplib.NTPClient()
        response = c.request('europe.pool.ntp.org', version=3)
        # convert from seconds since 1900 to seconds since 1970
        ntpUnixtime = response.tx_timestamp - 2208988800
        timestampOffset = time.time() - ntpUnixtime;
        return timestampOffset 

    def getTimestamp(self):
        '''
        Returns the local time plus the offset registered at the beginning.
        :return: long with the current timestamp (unix time)
        '''
        return int(time.time() + self.timestampOffset)
```

The key part of this code is the execution itself:

```
    def execute(self):
    		...
		self.reader.doInventory(self.checkinCompetitor)
```

When the checkpoint is correctly setup, the reader is asked to start the inventory of runners. Once either a bibNumber (from a keyboard input) or a EPC (from the RFID reader) is detected the `checkinCompetitor` callback is executed. This method creates the message for the MQTT receivers that will contains the information about the competitor id.   

The functionality of this specific checkpoint is implemented using the following main method: 

```
# ... imports

if __name__ == '__main__':
    reader = usb_keypad_reader.USBKeypadReader()
    checkpoint = checkpoint.Checkpoint('Keypad-1', reader, 'activioty.ddns.net')
    checkpoint.execute() 
```

This approach may be extended to other *checkin* mechanisms such as bar-code readers or computer vision analyzers. Perhaps for the next release ;-) 

  

    