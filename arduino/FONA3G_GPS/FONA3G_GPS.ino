/***************************************************
  This is an example for our Adafruit FONA Cellular Module

  Designed specifically to work with the Adafruit FONA
  ----> http://www.adafruit.com/products/1946
  ----> http://www.adafruit.com/products/1963
  ----> http://www.adafruit.com/products/2468
  ----> http://www.adafruit.com/products/2542

  These cellular modules use TTL Serial to communicate, 2 pins are
  required to interface
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
 ****************************************************/

#include "Adafruit_FONA.h"

#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 5

// this is a large buffer for replies
char replybuffer[255];

// We default to using software serial. If you want to use hardware serial
// (because softserial isnt supported) comment out the following three lines 
// and uncomment the HardwareSerial line
#include <SoftwareSerial.h>
SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

// Hardware serial is also possible!
//  HardwareSerial *fonaSerial = &Serial1;

// Use this for FONA 800 and 808s
//Adafruit_FONA fona = Adafruit_FONA(FONA_RST);
// Use this one for FONA 3G
Adafruit_FONA_3G fona = Adafruit_FONA_3G(FONA_RST);

uint8_t type;

void setup() {
  while (!Serial);

  Serial.begin(115200);
  Serial.println(F("Initializing FONA 3G..."));

  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while (1);
  }
  type = fona.type();
  Serial.println(F("FONA is OK"));

  // Print module IMEI number.
  char imei[16] = {0}; // MUST use a 16 character buffer for IMEI!
  uint8_t imeiLen = fona.getIMEI(imei);
  if (imeiLen > 0) {
    Serial.print("Module IMEI: "); Serial.println(imei);
  }

  fona.setGPRSNetworkSettings(F("airtelwap.es"), F("wap@wap"), F("wap125"));
  fona.setHTTPSRedirect(true);
  printBatteryLevel();
  waitForNetworkConnection();
  delay(2000);
  printRSSI();
  delay(2000);
  turnGPRSOn();
  delay(5000);
  turnGPSOn();
  delay(5000);
  while (!isGPRSEnabled()) {
    delay(2000);  
  }
}

void turnGPRSOn() {
  Serial.println(F("Enabling GPRS..."));
  fona.enableGPRS(true);
}

void turnGPSOn() {
  Serial.println(F("Enabling GPS..."));
  fona.enableGPS(true);
}

uint16_t isGPRSEnabled() {
  uint16_t status = fona.GPRSstate();
  Serial.println(F("GPRS status:"));
  Serial.println(status);
  return status;
}
void waitForNetworkConnection() {
  // read the network/cellular status
  uint8_t n = 0;
  
  while (n!=1) {
    Serial.println(F("Checking network connection"));
    n = fona.getNetworkStatus();
    delay(500);
  }
  Serial.println(F("Registered (home)"));
}

void printBatteryLevel() {
  uint16_t vbat;
  while (! fona.getBattPercent(&vbat)) {
    Serial.println(F("Failed to read Battery"));
  } 
  Serial.print(F("Battery level = ")); Serial.print(vbat); Serial.println(F("%"));
}

void printRSSI() {
  int8_t r;
  uint8_t n = 0;
  
  while(n <= 0) {
    Serial.print(F("Waiting for RSSI..."));
    n = fona.getRSSI();
    delay(500);
  }
  
  Serial.print(F("RSSI = ")); Serial.print(n); Serial.print(": ");
  if (n == 0) r = -115;
  if (n == 1) r = -111;
  if (n == 31) r = -52;
  if ((n >= 2) && (n <= 30)) {
    r = map(n, 2, 30, -110, -54);
  }
  Serial.print(r); Serial.println(F(" dBm"));
}

void updateValues(float lat, float lng) {
  // read website URL
  uint16_t statuscode;
  int16_t length;
  
  String latitudeStr = String(lat);
  String longitudeStr = String(lng);
  String url = String("activioty.ddns.net/tracker/update?bibId=1&lat=" + latitudeStr + "&lng=" + longitudeStr);
  Serial.println(F("GET..."));
  Serial.println(url);

  Serial.println(F("****"));
  if (!fona.HTTP_GET_start(url.c_str(), &statuscode, (uint16_t *)&length)) {
    Serial.println("Failed!");
    return;
  } 
  while (length > 0) {
    while (fona.available()) {
      char c = fona.read();

      // Serial.write is too slow, we'll write directly to Serial register!
#if defined(__AVR_ATmega328P__) || defined(__AVR_ATmega168__)
        loop_until_bit_is_set(UCSR0A, UDRE0); /* Wait until data register empty. */
        UDR0 = c;
#else
        Serial.write(c);
#endif
      length--;
      if (! length) return;
    }
  }
  Serial.println(F("\n****"));
  fona.HTTP_GET_end();
}

void gpsFix() {
  // check GPS fix
  fona.GPSstatus();
}

void checkGPSLocation() {
  char gpsdata[120];
  fona.getGPS(0, gpsdata, 120);
  Serial.println(F("Reply in format: mode,fixstatus,utctime(yyyymmddHHMMSS),latitude,longitude,altitude,speed,course,fixmode,reserved1,HDOP,PDOP,VDOP,reserved2,view_satellites,used_satellites,reserved3,C/N0max,HPA,VPA"));
  Serial.println(gpsdata);
}

void loop() {
  printBatteryLevel();
  Serial.println(F("GPS Status..."));
  gpsFix();
  delay(5000);
  Serial.println(F("GPS Location..."));

  float latitude, longitude, speed_kph, heading, altitude;
  // if you ask for an altitude reading, getGPS will return false if there isn't a 3D fix
  boolean gps_success = fona.getGPS(&latitude, &longitude, &speed_kph, &heading, &altitude);
  delay(1000);
  if (gps_success) {
    Serial.print("GPS lat:");
    Serial.println(latitude, 6);
    Serial.print("GPS long:");
    Serial.println(longitude, 6);
    Serial.print("GPS speed KPH:");
    Serial.println(speed_kph);
    Serial.print("GPS heading:");
    Serial.println(heading);
    Serial.print("GPS altitude:");
    Serial.println(altitude);
    Serial.println(F("Updating values..."));
    updateValues(latitude, longitude);
  } else {
    Serial.println("Waiting for FONA GPS 3D fix...");
  }
  delay(30000);
}
