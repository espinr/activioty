# Components

![components](Components of ActivIoTy)

## *Checkpoints* and *Controller*

These are the main pieces of ActivIoTy. The **Controller** is a server that manages and controls the timekeeping system. It stores basic information about each race such as `startDateTime` (timestamp with the official starting time) and the configuration of the `itinerary` of the running course. The itinerary is a sequence of one or more **Checkpoints** where runners must go to and check-in in order to complete the race.

Thus, *Checkpoints* are virtual gates located along the course of the race where runners must go through. Checkpoints register the competitor's ID and a timestamp that marks the official check time at that point of the race. **Checkpoints** must indicate the **Controller** that are in operation and they will send all the information to the **Controller**. 

The check process at *Checkpoints* may vary depending on the features of the device in use. For instance, some *Checkpoints* may read UHF RFID tags; others may be based on physical keyboards where marshals type the bib numbers when competitors go through the virtual gate. 

In terms of arquitecture, both *Controller* and *Checkpoint(s)* are **MQTT Clients**. These clients will be implemented using the specific [Eclipse Paho](https://www.eclipse.org/paho/) distribution, that provides solutions for all device platforms the project has. 

## MQTT Broker

Apart from these MQTT *pubsub* clients there is a **MQTT Broker** in charge of delivering messages. It is not repesented in the image to simplify the model. 

Eclipse [Mosquitto](https://mosquitto.org/) is the implementation selected for the MQTT Broker. This Open Source MQTT v3.1/v3.1.1 Broker will be installed on a reliable device with a strong internet connection.


## Personae

Three main roles will operate ActivIoTy:

* **Admin**: The person in charge of setting up the system (i.e., definition of checkpoints itinerary, assigning IDs to competitors, and others).
* **Official**: The person that will control the race, acting as starter of the race (e.g., setting `startDateTime`).
* **Competitors**: Runners/cyclists/… that take part in the competition. They are part of the checkpoint registration event.


## NTP Timing Accuracy

Synchronization of both *Checkpoints* and *Controller* is the cornerstone of the platform. Because of this, one first initialization tasks of every device is to set the 'official' time and date. This is done by using [**NTP** (Network Time Protocol)](http://www.ntp.org/ntpfaq/NTP-s-def.htm) external servers (e.g., [pool.ntp.org](http://pool.ntp.org) or [time.google.com](http://time.google.com)).   

## MQTT Reliability

Reliability is more important than efficiency in this project. Some checkpoints may have a poor internet connection and suffer interruptions, so ActivIoTy uses the MQTT protocol to guarantee the completeness of data. The system will implement **QoS 1 (at least once)**. Using QoS level 1, it is guaranteed that a message will be delivered at least once to the receiver. Messages can be delivered more than once but this will be taken into account and solved by the *Controller*.  


## HTTP Server

There is a public HTTP server that publish information about the system and enable the full configuration of ActivIoTy. This is the main interface either for public users and administrators. This server may deploy subsequent services built on top of ActivIoTy (e.g., social network integration, direct publication to media agencies, etc.).

Information will be published using Web Standards that guarantee interoperability.


[components]: ./images/components/checkpoints.png "Components in the ActivIoTy system"