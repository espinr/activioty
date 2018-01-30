#!/usr/bin/env python
# -*- coding: utf-8 -*-

import binascii
import time
import traceback

import serial 

import ind903_reader.ind903_packet as ind903Packet
from reader import reader


Ind903Packet = ind903Packet.Ind903Packet;

class DeviceException(Exception):
    pass

class ReadException(Exception):
    pass


class Ind903Reader(reader.Reader):
        
    def __init__(self, portName, baud=115200, readerAddress=b'\x01', timeout=None):
        """
        :param portName: serial port where the device is mounted (e.g., '/dev/ttyUSB0')
        :param baud: (int) baud rate for communications over the serial port. 
        The baud rates are 9600bps、19200bps、38400bps、115200bps. The default baud rate is 115200bps.
        :param readerAddress: (byte) the address of the reader (\x01 by default)
        :param timeout: (float) Read timeout value in seconds. (timeout=None wait forever, timeout=0 non-blocking mode, timeout = x (seconds)
        The structure of the Package [ Head | Length | Address | Cmd | Data[0…N] | Check ]
        """
        self.portName = portName
        self.address = readerAddress
        self.baud = baud
        self.timeout = timeout

    def initialize(self):
        self._serial = serial.Serial(self.portName, self.baud)
        
        if self._serial is None:
            raise DeviceException('No device found, please check the port name (i.e., python -m serial.tools.list_ports)')

    def write(self, data):
        """
        :param data: Data to send through the serial port. This should be of type bytes.
        :return: Number of bytes written.
        :rtype: int
        :raises SerialTimeoutException: In case a write timeout is configured for the port and the time is exceeded.
        """ 
        return self._serial.write(data)

    def readCommand(self):
        """
        Read the serial, looking for a command. If timeout is set to None, it waits until the command is received.
        :return: a Ind903Packet with the packet that read from the serial. 
         :raises SerialException: when applied to a closed port.
        """
        while (True):
            time.sleep(1)
            # At least a package of 4 bytes (minimum)
            # [ Head | Length | Address | Data[0…N] | Check ]
            if (self._serial.inWaiting()>=4):
                # Gets only the first byte of the packet (it should be HEAD)
                packet_header = self._serial.read(1)
                if (packet_header != Ind903Packet.PACKET_HEAD):
                    # the next one is the length of the packet
                    packet_length_bytes = self._serial.read(1)
                    packet_length = int.from_bytes(packet_length_bytes, byteorder='big')
                    if (packet_length > 0):
                        raw_packet = b"".join([packet_header, packet_length_bytes, self._serial.read(packet_length)]) 
                        result_packet = Ind903Packet.parsePacket(raw_packet)
                        return (result_packet)

    def doInventory(self, processCallback, antenna=b'\x01'):
        """
        Process of inventory execution. After the reader is initialized, an infinite loop is executed with these tasks:
        (1) the antenna set, (2) Inventory start requested, (3) Wait for several responses (stop when a control package is
        received), (4) Process the response
        :param processCallback(epcID, bibID): callback function to process a EPC found during inventory (bib=None).
        :param antenna: byte with the address of the antenna (\x01 by default)
        """
        setAntennaPacket = Ind903Packet.generatePacketSetAntenna()
        startRealTimeInventoryPacket = Ind903Packet.generatePacketStartRealTimeInventory()
        self.write(setAntennaPacket.packet)
        print ('> ' + setAntennaPacket.toString())
        receivedPacket = self.readCommand()
        print ('< ' + receivedPacket.toString())
        if (receivedPacket.isCommand(Ind903Packet.CMD_SET_WORKING_ANTENNA)):
        	# to check if is a success of failure
        	pass
        while (True):
            try:
                self.write(startRealTimeInventoryPacket.packet)
                print ('> ' + startRealTimeInventoryPacket.toString())
                # While a control package (success/error) is not received
                while (True):
                    receivedPacket = self.readCommand()
                    print ('< ' + receivedPacket.toString())
                    if (receivedPacket.isCommand(Ind903Packet.CMD_NAME_REAL_TIME_INVENTORY) and receivedPacket.isEndRealTimeInventory() != b'\x00'):
                        print(' [ end of inventory command found] ')
                        break   # jumps out the inventory loop
                    # Reads EPCs
                    epc = receivedPacket.getTagEPCFromInventoryData();
                    if (int.from_bytes(epc,byteorder='big') == 0):
                        break # jumps out the inventory loop
                    epcString = binascii.hexlify(epc).decode()   
                    print (' ****  [EPC found: ' + epcString + '] ****')
                    processCallback(epcString, None)
            except Exception as ex:
                traceback.print_exc()

if __name__ == '__main__':
    reader = Ind903Reader('/dev/ttyUSB0', 115200, 1000)
    reader.doInventory()
    
        
