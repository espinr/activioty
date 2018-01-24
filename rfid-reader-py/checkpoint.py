# -*- coding: utf-8 -*-
# -------
# Class to define Checkpoint that uses the IND903 reader
# author: espinr 
# -------


import context
import math
import paho.mqtt.publish as publish
from ind903_reader import ind903_reader   
import json
import time
from time import gmtime
import ntplib
from time import ctime
from distutils.command.check import check

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

    def checkinCompetitor(self, idCompetitor):
        '''
        Method to be called once a competitor do a check-in. 
        This is a callback method to be send to the reader. 
        It sends a MQTT message to the broker
        :param idCompetitor: String with the ID of the competitor that the reader detected.
        '''
        messageCheckin = { "checkpoint" : self.id , "timestamp" : self.getTimestamp(), "competitor" : { "epc" : idCompetitor } }
        publish.single(self.TOPIC_CHECKIN, json.dumps(messageCheckin), hostname=self.mqttBrokerHost)
        print(self.TOPIC_CHECKIN + " topic to MQTT:")
        print(json.dumps(messageCheckin))
        
        
    def execute(self):
        messageReady = { "checkpoint" : self.id , "timestamp" : self.getTimestamp() }  
        publish.single(self.TOPIC_READY, json.dumps(messageReady), hostname=self.mqttBrokerHost)
        print(self.TOPIC_READY + " topic to MQTT:")
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

if __name__ == '__main__':
    reader = ind903_reader.Ind903Reader('/dev/ttyUSB0', 115200)
    checkpoint = Checkpoint('RaspberryPi+IND903+Python', reader, 'test.mosquitto.org')
    checkpoint.execute()
        
