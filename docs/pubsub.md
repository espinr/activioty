# ActivIoTy - MQTT and Workflow 

The platform is based on the pub-sub paradigm. This means that some components (*publishers* or *senders*) send messages to a central point, called *broker*, that delivers the messages to other components (*subscribers* or *receivers*) interested in receiving the information send by the *publishers*.

Just as a reminder of what the system does: 

1. *Checkpoints* registers { competitor's ID + timestamp }. So, these are the *publishers*
2. *Controller*(s) collect the information sent by *Checkpoints* and process the information. So, this is one of the *subscribers*.
3. Other *subscribers* may perform other activities (i.e., visualizations, integration with third party services, etc.)  

![pubsub](ActivIoTy PubSub Process)

## MQTT

> It's a good choice for systems where we need to share small code messages, and the network bandwidth may be limited

This mechanism is implemented using [MQTT 3.1.1](http://mqtt.org/), an OASIS standard that is widely adopted by industries and IoT solutions. MQTT is a light-weight protocol suitable for Activity, due to the flexibility requirements regarding the conditions where *Checkpoints* operates. MQTT guarantees connections with remote locations. It's a good choice for systems where we need to share small code messages, and the network bandwidth may be limited. So, it's a perfect choice for ActivIoTy.

MQTT ensures the data is delivered properly to *subscribers*. The *broker* is in charge of delivers messages, according to three [Quality of Service (QoS) levels](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718099): 

* **QoS 0: At most once delivery**. No response is sent by the receiver and no retry is performed by the sender. This means that the message arrives at the receiver **either once or not at all**.
* **QoS 1: At least once delivery**. This quality of service ensures that the message arrives at the receiver at least once.
* **QoS 2: Exactly once delivery**. This is the highest quality of service, for use when neither loss nor duplication of messages are acceptable.
     
Since ActivIoTy needs to satisfy completeness and integrity of data gathered by *Checkpoints*, the chosen QoS level is **QoS 1 (At least once delivery)**. QoS 2 would be also adequate but it increases the overhead of communications. There may be duplicates, that will be filtered by receivers without too much cost associated.

## Topics and Messages

Application messages within the MQTT queue are related to *topics*. So, both sender and receivers may work with messages organized by topics. [Topics](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718106) follow a hierarchical structure (e.g. `bedroom` to indicate all messages related to a bedroom; `bedroom/temperature` and `bedroom/humidity` for specific messages sent by sensors in the bedroom). This  that is useful for subscribers to filter and receive only the information they need. Forward slash (‘/’ U+002F) is used to separate each level within a topic tree structure.

*Checkpoints* generate two kind of application messages:

1- Readiness messages (topic `ready`). They are sent once the Checkpoint is initialized and connected to the network.   
2- Check-in messages (topic `checkin`). They are sent after the check-in of a competitor.

The definition of topics may be as complex as we want, In my case, the schema of topic names is based on the id of the checkpoint and the type of message. This is: `{checkpointID}/ready` and `{checkpointID}/checkin`.

Receivers may be subscribed to topics in a flexible way, using wildcards. For instance, `+/ready` to subscribe to all `ready` topics from all senders.

Messages will be encoded as UTF-8 in JSON format as follows:

Topic `+/ready`:
```
{
	"checkpoint" : {
		// ID required 
		"id" : "…",
		// Optional metadata
		"name" : "…",
		"description" : "…",
		"geo" : {
			"lat" : 0.000,
			"lng" : 0.000,
			"elevation" : 0.000
		},
	},
	"timestamp"  : 0000000
}
```
Readiness messages only require checkpoint identifier and timestamp (the Unix time of the device after synchronizing with a NTP server). 

Topic `+/checkpoint`:
```
{
	"checkpoint" : { 
		"id" : "…",			// Required
		"geo" : { "…" }		// (Optional) It can be included in case the checkpoint is on the move
	},
	"bibIdentifier" : "…",	// Either 'bib' or 'epc' are required
	"epcIdentifier" : "…",
	"timestamp"  : 0000000, 	// Required
}
```
For check-in messages, it is required the checkpoint identifier (some information may be added, such as coordinates in case the checkpoint is on the move), the unique identifier of the competitor (we can have several, such as bib number and RFID tag), and the timestamp of the check-in. 


## Implementation with Mosquitto and Paho

[Eclipse Mosquitto](https://mosquitto.org/) is an open source message broker that implements the MQTT protocol versions 3.1 and 3.1.1. This server is really stable and lightweight so it can be installed in any kind of computer, even on your Raspberry Pi.

Installation and configuration of the Mosquitto Broker is really easy (check [official page](https://mosquitto.org/download/) for instructions). For this pilot, I installed the Mosquitto Broker on a UP² Squared I received for this challenge –thanks, it's great!

I installed it from the Mosquitto Debian Repository with *apt* just in a few steps: 

After connecting via SSH with the UP² Squared.

```
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
sudo apt-key add mosquitto-repo.gpg.key 
```

Repository available to apt:

```
cd /etc/apt/sources.list.d/
sudo wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list
```

Update apt information and install Mosquitto

```
apt-get update
apt-get install mosquitto
```

As a summary of the configuration of this broker:

* Configuration file: `/etc/mosquitto/mosquitto.conf`
* Logs: `/var/log/mosquitto/mosquitto.log`

Mosquito service can be managed with this command: 

```
sudo service mosquitto [start|stop|restart]
```

The listener by default will open the `1883` port. Through the configuration file, we can set up the server. There is a sample file with all options listed and documented at `/usr/share/doc/mosquitto/examples/mosquitto.conf`.

There, we can configure all the security specifications of our broker (user/password files, SSL/TLS support, bridges, etc.). 

For this pilot we don't include security measures but communications should be private and secured in the production environment. 
 
In case we want to test the broker, we can also install the pub-sub clients anywhere.  

```
apt-get install mosquitto-clients
```

Opening several terminal sessions, we can simulate subscribers (`mosquitto_sub`) and publishers (`mosquitto_pub`) with just these options:
* -h (hostname)
* -t (topic)
* -m (message)

Do not forget to open that port on your firewall to make it available from outside your network.

### Paho 

*Checkpoints* are implemented using [Eclipse Paho](https://www.eclipse.org/paho/). Paho provides open-source client implementations of MQTT protocols for any platform. Paho implementations may be deployed on all checkpoint modules of ActivIoTy: Raspberry + Python; UP<sup>2</sup> Squared + Python/embedded C; Arduino + embedded C).

Paho is also the base for the implementation of the *Controller* (subscriber), coded in Node.js. 

[pubsub]: ./images/components/pubsub.png "ActivIoTy PubSub Process"