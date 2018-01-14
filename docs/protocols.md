# ActivIoTy Protocols

ActivIoTy is based on recognized standard protocols. Since the platform is designed to allow different and heterogeneous devices and implementations, standard technologies are crucial for scalability, enhancement of the system, and also to preserve integrity of data.

Likely the rest of IoT solutions, protocols and technologies may be represented in a logic way, structured in different layers, from the physical to the application layer. Although there are many other protocols involved in the communications of the devices and sub-systems, this is a simplified summary of the standards used in the project: 

![Stack of technologies and protocols of ActivIoTy][stack]

Obviously, everything will run on the Internet. There are various underlying protocols since ActivIoTy aims to be flexible in terms of physical connectivity. *Controllers* and *Checkpoints* may be installed in locations with strong WiFi signal (city or, town center), even with access to wired Ethernet routers, but also in the middle of the forest where we would need establish cellular GSM or 3G connections. Thus, the physical layer includes: [**IEEE 802.3 (Ethernet)**](http://www.ieee802.org/3/), [**IEEE 802.11 (WiFi)**](http://www.ieee802.org/11/) and [**WCDMA/HSDPA (3G)**](https://www.gsma.com/aboutus/gsm-technology/3gwcdma) protocols.

On top of the Internet, the transport layer is composed mainly by [**TCP** or Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol). [**UDP** or User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol) is used for specific applications such as time synchronization through external [NTP (Network Time Protocol)](http://www.ntp.org/ntpfaq/NTP-s-def.htm) servers.

## MQTT is King

Checkpoints, controllers and the rest of the modules of ActivIoTy are based on the Pub/Sub (Publication/Subscription) paradigm. Since the distributed system needs reliability and there is a potential lack of quality of communications, the solution uses [MQTT (Message Queuing Telemetry Transport)](http://mqtt.org/) as messaging protocol. MQTT allows *Checkpoints* (publishers) to send messages to the *Controllers* (subscribers). A *broker*, up and running in a reliable environment, will be in charge of delivering those messages effectively. 

**MQTT** implements different levels of Quality of service (QoS). Since **integrity of data and rapidity is key for ActivIoTy** and intermediate *Checkpoints* may be weak in terms of connectivity, the system will implement **QoS 1 (at least once)**. Using QoS level 1, it is guaranteed that a message will be delivered at least once to the receiver. Messages can be delivered more than once but this will be taken into account and solved by the *Controller*.

## The Web Standards

In order to control, visualize, and provide services on top of ActivIoT, the platform will provide **[HTTP (Hypertext Transfer Protocol)](https://www.w3.org/Protocols/) RESTful services** to access the information and platform services (e.g. control the system from external software, integration with social networks, etc.). 

The final design may be complemented by other specific top level standards that will guarantee interoperability among similar systems around the world. The [**Thing Description**](https://www.w3.org/TR/wot-thing-description/) mechanisms recommended by the [W3C Web of Things Working Group](https://www.w3.org/WoT/WG/) help us to achieve this semantic interoperability. 

Last but not least, on top of the layer cake we find [**OpenTrack vocabularies**](https://w3c.github.io/opentrack-cg/) an initiative to model Athletics in a standard way. Information about athletes, clubs, competitions and results will be exposed through semantic vocabularies, based on **[Schema.org](http://schema.org)**. 


[stack]: ./images/layer-design/protocol-layer.svg "Stack of technologies and protocols of ActivIoTy"