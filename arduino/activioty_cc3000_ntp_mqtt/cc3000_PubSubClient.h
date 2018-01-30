/*
 PubSubClient.h - A simple client for MQTT.
  Nicholas O'Leary
  http://knolleary.net
*/

#ifndef cc3000_PubSubClient_h
#define cc3000_PubSubClient_h

#include <Arduino.h>
#include "Adafruit_CC3000.h"
#include "Stream.h"

// MQTT_MAX_PACKET_SIZE : Maximum packet size
#define MQTT_MAX_PACKET_SIZE 128

// MQTT_KEEPALIVE : keepAlive interval in Seconds
#define MQTT_KEEPALIVE 15

#define MQTTPROTOCOLVERSION 3
#define MQTTCONNECT     1 << 4  // Client request to connect to Server
#define MQTTCONNACK     2 << 4  // Connect Acknowledgment
#define MQTTPUBLISH     3 << 4  // Publish message
#define MQTTPUBACK      4 << 4  // Publish Acknowledgment
#define MQTTPUBREC      5 << 4  // Publish Received (assured delivery part 1)
#define MQTTPUBREL      6 << 4  // Publish Release (assured delivery part 2)
#define MQTTPUBCOMP     7 << 4  // Publish Complete (assured delivery part 3)
#define MQTTSUBSCRIBE   8 << 4  // Client Subscribe request
#define MQTTSUBACK      9 << 4  // Subscribe Acknowledgment
#define MQTTUNSUBSCRIBE 10 << 4 // Client Unsubscribe request
#define MQTTUNSUBACK    11 << 4 // Unsubscribe Acknowledgment
#define MQTTPINGREQ     12 << 4 // PING Request
#define MQTTPINGRESP    13 << 4 // PING Response
#define MQTTDISCONNECT  14 << 4 // Client is Disconnecting
#define MQTTReserved    15 << 4 // Reserved

#define MQTTQOS0        (0 << 1)
#define MQTTQOS1        (1 << 1)
#define MQTTQOS2        (2 << 1)

class cc3000_PubSubClient {
private:
   Adafruit_CC3000_Client* _client;
   Adafruit_CC3000* _cc3000;
   uint8_t buffer[MQTT_MAX_PACKET_SIZE];
   uint16_t nextMsgId;
   unsigned long lastOutActivity;
   unsigned long lastInActivity;
   bool pingOutstanding;
   void (*callback)(char*,uint8_t*,unsigned int);
   uint16_t readPacket(uint8_t*);
   uint8_t readByte();
   boolean write(uint8_t header, uint8_t* buf, uint16_t length);
   uint16_t writeString(char* string, uint8_t* buf, uint16_t pos);
   uint32_t ip;
   char* domain;
   int port;
   Stream* stream;
public:
   cc3000_PubSubClient();
   cc3000_PubSubClient(uint32_t&, int, void(&)(char*,uint8_t*,unsigned int),Adafruit_CC3000_Client& client, Adafruit_CC3000& cc3000);
   boolean connect(char *);
   boolean connect(char *, char *, char *);
   boolean connect(char *, char *, uint8_t, uint8_t, char *);
   boolean connect(char *, char *, char *, char *, uint8_t, uint8_t, char*);
   void disconnect();
   boolean publish(char *, char *);
   boolean publish(char *, uint8_t *, unsigned int);
   boolean publish(char *, uint8_t *, unsigned int, boolean);
   boolean publish_P(char *, uint8_t PROGMEM *, unsigned int, boolean);
   boolean subscribe(char *);
   boolean subscribe(char *, uint8_t qos);
   boolean unsubscribe(char *);
   boolean puback(uint16_t msgId);
   boolean loop();
   boolean connected();
};


#endif
