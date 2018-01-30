/***************************************************
  This is an MQTT publish example for the Adafruit CC3000 Wifi Breakout & Shield
  
  This script is based on the PubSubClient with AdaFruit CC3000 library support by nathanchantrell 
  [https://github.com/nathanchantrell/pubsubclient].
 ****************************************************/

#include <Adafruit_CC3000.h>
#include <ccspi.h>
#include <SPI.h>
#include "cc3000_PubSubClient.h"

// Configuration of CC3000 Wifi Shield
// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
// These can be any two pins
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10

// Use hardware SPI for the remaining pins
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT, SPI_CLOCK_DIVIDER);

// Wifi Configuration SSID + Pasword + Security Method 
#define WLAN_SSID       "mostruofone"
#define WLAN_PASS       "6204362420000000000"
// Security can be WLAN_SEC_UNSEC, WLAN_SEC_WEP, WLAN_SEC_WPA or WLAN_SEC_WPA2
#define WLAN_SECURITY   WLAN_SEC_WPA2


Adafruit_CC3000_Client client;
     
// We're going to set our broker IP and union it to something we can use
union ArrayToIp {
  byte array[4];
  uint32_t ip;
};

// MQTT Broker Configuration
ArrayToIp MQTT_BROKER =         { 157, 0, 168, 192 };
#define MQTT_BROKER_PORT        1883
// User and Password for the broker connection
#define MQTT_USER               "user"
#define MQTT_PASS               "pass"
                                // ID is MAC|name
#define MQTT_CLIENTID           "001994372BB2|arduinowifi"
#define MQTT_TOPIC              "/activioty"


const unsigned long
  ntpConnectTimeout  = 25L * 1000L, // Max time to wait for server connection
  ntpResponseTimeout = 25L * 1000L; // Max time to wait for data from server
unsigned long
  initialTime  = 0L,      // Initial value retrieved from NTP server
  sketchOffset = 0L;      // Initial value in seconds when initialTime was set    

cc3000_PubSubClient mqttclient(MQTT_BROKER.ip, MQTT_BROKER_PORT , callback, client, cc3000);

void callback (char* topic, byte* payload, unsigned int length) {
}

String mqttMessage;

void connectToWifi(void) 
{
  displayDriverMode();
  
  Serial.println(F("\nInitialising the CC3000 ..."));
  if (!cc3000.begin()) {
    Serial.println(F("Unable to initialise the CC3000! Check your wiring?"));
    for(;;);
  }

  uint16_t firmware = checkFirmwareVersion();
  if ((firmware != 0x113) && (firmware != 0x118)) {
    Serial.println(F("Wrong CC3000 firmware version!"));
    for(;;);
  }
  
  displayMACAddress();
  
  Serial.println(F("\nDeleting old connection profiles"));
  if (!cc3000.deleteProfiles()) {
    Serial.println(F("Failed!"));
    while(1);
  }

  /* Attempt to connect to an access point */
  char *ssid = WLAN_SSID;             /* Max 32 chars */
  Serial.print(F("\nAttempting to connect to ")); Serial.println(ssid);
  
  /* NOTE: Secure connections are not available in 'Tiny' mode! */
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }
   
  Serial.println(F("Connected!"));
  
  /* Wait for DHCP to complete */
  Serial.println(F("Request DHCP"));
  while (!cc3000.checkDHCP()) {
    delay(100); // ToDo: Insert a DHCP timeout!
  }

  /* Display the IP address DNS, Gateway, etc. */  
  while (!displayConnectionDetails()) {
    delay(1000);
  }
}

void connectToMQTTBroker(void) 
{
   // connect to the broker
   if (!client.connected()) {
     Serial.println(MQTT_BROKER.ip);
     client = cc3000.connectTCP(MQTT_BROKER.ip, 1883);
   }
   
   Serial.println(F("Connected TCP layer"));
   
   // did that last thing work? sweet, let's do something
   if(client.connected()) {
    if (mqttclient.connect(MQTT_CLIENTID, MQTT_USER, MQTT_PASS)) {
      Serial.println(F("Connected to MQTT broker"));
      char buffer[100];
      mqttMessage = String(MQTT_CLIENTID);
      mqttMessage += " is online!";
      mqttMessage.toCharArray(buffer, 100);
      mqttclient.publish(MQTT_TOPIC, buffer);
    }
   }
}

void setup(void)
{
  Serial.begin(115200);
  Serial.println(F("CC3000 + MQTT Publishing\n"));
  
  connectToWifi();
  setupTime();
  connectToMQTTBroker();

  // if analog input pin 0 is unconnected, random analog
  // noise will cause the call to randomSeed() to generate
  // different seed numbers each time the sketch runs.
  // randomSeed() will then shuffle the random function.  
  randomSeed(analogRead(0));
}

void loop(void) {
 
  // It will reconnect in case it was disconnected at some point
  if (!client.connected()) {
    client = cc3000.connectTCP(MQTT_BROKER.ip, 1883);
     
    if(client.connected()) {
      if (mqttclient.connect(MQTT_CLIENTID, MQTT_USER, MQTT_PASS)) {
        char buffer[100];
        mqttMessage = String(MQTT_CLIENTID);
        mqttMessage += " is online again!";
        mqttMessage.toCharArray(buffer, 100);
        mqttclient.publish(MQTT_TOPIC, buffer);
      }
    } 
  } else {
    // Publish the message
    String tagId = String(random(1, 10000));
    mqttMessage += tagId;
    unsigned long time = nowInUnixTime();
    mqttMessage = String("{\"id\":\"");
    mqttMessage += MQTT_CLIENTID;
    mqttMessage += "\", \"timestamp\": ";
    mqttMessage += time;
    mqttMessage += ", \"tagid\": \"";
    mqttMessage += String(tagId);
    mqttMessage += "\"}";
    char buffer[100];
    mqttMessage += "}}";
    mqttMessage.toCharArray(buffer, 100);
    Serial.println(buffer);
    mqttclient.publish("/activioty", buffer);
  }

  delay(5000);
}


/**************************************************************************/
/*!
    @brief  Displays the driver mode (tiny of normal), and the buffer
            size if tiny mode is not being used

    @note   The buffer size and driver mode are defined in cc3000_common.h
*/
/**************************************************************************/
void displayDriverMode(void)
{
  #ifdef CC3000_TINY_DRIVER
    Serial.println(F("CC3000 is configure in 'Tiny' mode"));
  #else
    Serial.print(F("RX Buffer : "));
    Serial.print(CC3000_RX_BUFFER_SIZE);
    Serial.println(F(" bytes"));
    Serial.print(F("TX Buffer : "));
    Serial.print(CC3000_TX_BUFFER_SIZE);
    Serial.println(F(" bytes"));
  #endif
}

/**************************************************************************/
/*!
    @brief  Tries to read the CC3000's internal firmware patch ID
*/
/**************************************************************************/
uint16_t checkFirmwareVersion(void)
{
  uint8_t major, minor;
  uint16_t version;
  
#ifndef CC3000_TINY_DRIVER  
  if(!cc3000.getFirmwareVersion(&major, &minor))
  {
    Serial.println(F("Unable to retrieve the firmware version!\r\n"));
    version = 0;
  }
  else
  {
    Serial.print(F("Firmware V. : "));
    Serial.print(major); Serial.print(F(".")); Serial.println(minor);
    version = major; version <<= 8; version |= minor;
  }
#endif
  return version;
}

/**************************************************************************/
/*!
    @brief  Tries to read the 6-byte MAC address of the CC3000 module
*/
/**************************************************************************/
void displayMACAddress(void)
{
  uint8_t macAddress[6];
  
  if(!cc3000.getMacAddress(macAddress))
  {
    Serial.println(F("Unable to retrieve MAC Address!\r\n"));
  }
  else
  {
    Serial.print(F("MAC Address : "));
    cc3000.printHex((byte*)&macAddress, 6);
  }
}


/**************************************************************************/
/*!
    @brief  Tries to read the IP address and other connection details
*/
/**************************************************************************/
bool displayConnectionDetails(void)
{
  uint32_t ipAddress, netmask, gateway, dhcpserv, dnsserv;
  
  if(!cc3000.getIPAddress(&ipAddress, &netmask, &gateway, &dhcpserv, &dnsserv))
  {
    Serial.println(F("Unable to retrieve the IP Address!\r\n"));
    return false;
  }
  else
  {
    Serial.print(F("\nIP Addr: ")); cc3000.printIPdotsRev(ipAddress);
    Serial.print(F("\nNetmask: ")); cc3000.printIPdotsRev(netmask);
    Serial.print(F("\nGateway: ")); cc3000.printIPdotsRev(gateway);
    Serial.print(F("\nDHCPsrv: ")); cc3000.printIPdotsRev(dhcpserv);
    Serial.print(F("\nDNSserv: ")); cc3000.printIPdotsRev(dnsserv);
    Serial.println();
    return true;
  }
}


/**************************************************************************/
/*!
    @brief  Configuration of the internal time of the system, based on a 
    NTP query. This should be called during the setup phase.
    Returns the Unix time in case of success; 0 if fails.
*/
/**************************************************************************/
unsigned long setupTime(void) {
  unsigned long t = 0L;
  
  do{
    t = getNTPTime();
  } while(!t);                        // Query time server
  initialTime = t;                    // Save time globally
  sketchOffset = millis()/1000;  // Substracts the current

  Serial.print(F("Current UNIX time: "));
  Serial.print(initialTime);
  Serial.println(F(" (seconds since 1/1/1970 UTC)"));
  Serial.print(F("Internal Arduino clock: "));
  Serial.print(sketchOffset);
  Serial.print(F("seconds from startup "));
  return t;
}

/**************************************************************************/
/*!
    @brief  Get a timestamp in Unix seconds, based on the initial NTP time 
    and the millis() of the Arduino.
*/
/**************************************************************************/
unsigned long nowInUnixTime(void) {
  unsigned long now = initialTime + (millis()/1000) - sketchOffset;
  return now;
}


/**************************************************************************/
/*!
    @brief  Minimalist time server query; adapted from Adafruit Gutenbird sketch,
    which in turn has roots in Arduino UdpNTPClient tutorial.
*/
/**************************************************************************/
unsigned long getNTPTime(void) {

  uint8_t       buf[48];
  unsigned long ip, startTime, t = 0L;

  Serial.print(F("Locating time server..."));

  // Hostname to IP lookup; use NTP pool (rotates through servers)
  if(cc3000.getHostByName("time.google.com", &ip)) {
    static const char PROGMEM
      timeReqA[] = { 227,  0,  6, 236 },
      timeReqB[] = {  49, 78, 49,  52 };

    Serial.println(F("\r\nAttempting connection..."));
    startTime = millis();
    do {
      client = cc3000.connectUDP(ip, 123);
    } while((!client.connected()) &&
            ((millis() - startTime) < ntpConnectTimeout));

    if(client.connected()) {
      Serial.print(F("connected!\r\nIssuing request..."));

      // Assemble and issue request packet
      memset(buf, 0, sizeof(buf));
      memcpy_P( buf    , timeReqA, sizeof(timeReqA));
      memcpy_P(&buf[12], timeReqB, sizeof(timeReqB));
      client.write(buf, sizeof(buf));

      Serial.print(F("\r\nAwaiting NTP response..."));
      memset(buf, 0, sizeof(buf));
      startTime = millis();
      while((!client.available()) &&
            ((millis() - startTime) < ntpResponseTimeout));
      if(client.available()) {
        Serial.println(F("Reading NTP Response"));
        client.read(buf, sizeof(buf));
        t = (((unsigned long)buf[40] << 24) |
             ((unsigned long)buf[41] << 16) |
             ((unsigned long)buf[42] <<  8) |
              (unsigned long)buf[43]) - 2208988800UL;
        Serial.print(F("OK NTP!\r\n"));
      }
      client.close();
    }
  }
  if(!t) Serial.println(F("error NTP"));
  return t;
}
