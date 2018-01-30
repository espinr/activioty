# -*- coding: utf-8 -*-
# -------
# Class that represents a packet to communicate with a IND903 device
# author: espinr 
# -------

#===============================================================================
# 
# Definition of data packets with commands to IND903 
# [ Head | Len | Address | Cmd | Data[0…N] | Check ]
#     |     |       |       |       |         |
#     |     |       |       |       |         |> (1 Byte) Checksum. Check all the bytes except itself.
#     |     |       |       |       |> (n Bytes) Command parameters
#     |     |       |       |> (1 Byte) Command byte (list of commands)
#     |     |       |> (1 Byte) Reader’s address. The common addresses are 0~ 254(0xFE)，
#     |     |          255(0xFF) is the public address. 
#     |     |          The reader accepts the address of itself and the public address.
#     |     |> (1 Byte) Length of the packet bytes. Starts from the third byte.
#     |> (1 Byte) Head of the packet. (Always 0xA0)
# 
# Definition of response data packets
# [ Head | Len | Address | Data[0…N] | Check ]
#     |     |       |       |            |
#     |     |       |       |            |> (1 Byte) Checksum. Check all the bytes except itself.
#     |     |       |       |> (n Bytes) Data from the reader
#     |     |       |> (1 Byte) Reader’s address. 
#     |     |> (1 Byte) Length of the packet bytes. Starts from the third byte.
#     |> (1 Byte) Head of the packet. (Always 0xA0)
#===============================================================================

import binascii


class Ind903PacketException(Exception):
    pass

class Ind903Packet(object):
    
    # Definition of commands and packets
    PACKET_HEAD     = 0xA0;     # All packets start with 0xA0

    # Component index in the array of bytes
    INDEX_HEAD      = 0;
    INDEX_LENGTH    = 1;
    INDEX_ADDRESS   = 2;
    INDEX_CMD       = 3;
    INDEX_DATA_START= 4; 
    
    # Commands already implemented
    CMD_GET_FIRMWARE_VERSION            = b"\x72"
    CMD_NAME_REAL_TIME_INVENTORY        = b"\x89"
    CMD_SET_WORKING_ANTENNA             = b"\x74"

    # Packets predefined
    #PACKET_GET_FIRMWARE_VERSION        = b"\xA0\x03\x01\x72\xEA"
    #PACKET_NAME_REAL_TIME_INVENTORY    = b"\xA0\x04\x01\x89\x01\xD1"
    #PACKET_SET_WORKING_ANTENNA         = b"\xA0\x04\x01\x74\x00\xE7"
    
    ERRORCODE_COMMAND_SUCCESS          = b'\x10'
    
    

    def __init__(self, head, length, address, cmd, data, check):
        """
        Create a packet with the data specified
        :param head: (bytes) head of the packet
        :param length: (bytes) length of the packet
        :param address: (bytes) address of the reader 
        :param cmd: (bytes) cmd of the packet
        :param data: (bytes) data bytes in the packet [0..n]
        :param check: (bytes) checksum of the packet
        """
        self.head = head
        self.length = length
        self.address = address
        self.cmd = cmd
        self.data = bytearray() if (data == None) else data
        self.check = check
        self.packet = bytearray(self.head+self.length+self.address+self.cmd+self.data+self.check)

    def parsePacket(packetData):
        """
        Static method to parse and extract the packet information into the structure
        :param packetData: hexadecimal bytes corresponding to the packet 
        """
        try:
            packet = bytearray(packetData)
            head = packet[Ind903Packet.INDEX_HEAD].to_bytes(1, byteorder='big', signed=False)
            length = packet[Ind903Packet.INDEX_LENGTH].to_bytes(1, byteorder='big', signed=False)
            address = packet[Ind903Packet.INDEX_ADDRESS].to_bytes(1, byteorder='big', signed=False)
            cmd = packet[Ind903Packet.INDEX_CMD].to_bytes(1, byteorder='big', signed=False)
            data = bytearray(packet[Ind903Packet.INDEX_DATA_START:len(packet)-1])
            check = packet[len(packet)-1].to_bytes(1, byteorder='big', signed=False)
            return Ind903Packet(head, length, address, cmd, data, check)
        except:
            raise Ind903PacketException('Error parsing the packet ' + packetData)
    parsePacket = staticmethod(parsePacket)
                        
    def toString(self):
        """
        :return: The complete packet as a list of bytes in a string
        """
        printable = '[ '
        printable += binascii.hexlify(self.head).decode() + ' | '
        printable += binascii.hexlify(self.length).decode() + ' | '
        printable += binascii.hexlify(self.address).decode() + ' | '
        printable += binascii.hexlify(self.cmd).decode() + ' | '
        for b in self.data:
            printable += format(b, '02X') + ' '
        printable += '| ' + binascii.hexlify(self.check).decode() + ' ]'
        return printable.upper()

    def getChecksumPacket(packetToCheck):
        """
        Static method that calculates the checksum of the list of bytes. The checksum will be generated using this function 
        unsigned char CheckSum(unsigned char *uBuff, unsigned char uBuffLen){
            unsigned char i,uSum=0;
            for(i=0;i<uBuffLen;i++){
                uSum = uSum + uBuff[i];
            }
            uSum = (~uSum) + 1;return uSum;
        }
        :param packetToCheck: list of bytes, to check
        :return: (byte) the checksum of the packet as hex
        """
        intSum = 0
        for x in packetToCheck:
            intSum = intSum + x
            if (intSum > 255):
                intSum = intSum.to_bytes(2, byteorder='big', signed=False)[1]
        
        intSum = (~intSum) + 1;
        if (intSum > 255):
            intSum = intSum.to_bytes(2, byteorder='big', signed=False)[1]
        
        # To avoid the sign
        return intSum.to_bytes(1, byteorder='big', signed=True)
    getChecksumPacket = staticmethod(getChecksumPacket)
    
    def isEndRealTimeInventory(self):
        """
        Check if the current packet indicates the end of an inventory. It is expected to be a response of CMD_NAME_REAL_TIME_INVENTORY command from the reader.
        If the reader finished reading tags, it may send two types of responses:
        Success:
            Head    Len     Address     Cmd     Ant_ID    Total_Read     Check
            0xA0    0x08      X         0x89    Y         4 bytes         Z
            (Total read is the number of tags read during the inventory round)
        Error:
            Head    Len     Address     Cmd     Error_Code    Check
            0xA0    0x04      X         0x89    Y             Z
        :return: (byte) with the error code of the result 0x10 for command_success
        """
        if (self.cmd != self.CMD_NAME_REAL_TIME_INVENTORY):
            raise Ind903PacketException('Received command is ' + self.cmd + ', not a ' + self.CMD_NAME_REAL_TIME_INVENTORY)
        
        if (self.length == b'\x08' and len(self.data) == 5):
            return self.ERRORCODE_COMMAND_SUCCESS
        
        # In other case, an error was found, raise an exception
        elif (self.length == b'\x04' and len(self.data) == 1):
            return self.data[0]
        
        return b'\x00'
    
    
    def isCommand(self, cmd):
        """
        Check if the current packet is the command sent as parameter
        :param cmd: (byte) with the command to compare
        """
        return (self.cmd == cmd)
    

    def getTagEPCFromInventoryData(self):
        """
        Extracts the information corresponding to the EPC in the data stored. It's a packet corresponding to 
        the response of a command x89. Data is structured as: 
        Freq_Ant (1 byte): The high 6 bits are frequency parameter; the low 2 bits are antenna ID.)
        PC (2 bytes): Tag’s PC.
        EPC (>=12 bytes) Tag’s EPC.
        RSSI (1 byte): The RSSI (-dBm) when tag is identified.
        """
        if (not self.isCommand(self.CMD_NAME_REAL_TIME_INVENTORY)):
            raise Ind903PacketException('Reading tag EPC from a packet with a unknown command '+self.toString())
        if (len(self.data)<5):
            raise Ind903PacketException('Reading tag EPC from a too short packet '+self.toString())
        return self.data[3:len(self.data)-1];

    def generatePacketSetAntenna(addressAntenna=b'\x00'):
        """
        Static method to generate a packet to set the antenna (by default, \x00 -> antenna 01).
        :param addressAntenna: hexadecimal byte corresponding to the id of the antenna (00 by default) 
        """
        subpacket = bytearray(b'\xA0\x04\x01\x74' + addressAntenna)
        
        return Ind903Packet.parsePacket(bytearray(subpacket + Ind903Packet.getChecksumPacket(subpacket)))
    generatePacketSetAntenna = staticmethod(generatePacketSetAntenna)

    def generatePacketStartRealTimeInventory(channel=b'\x01'):
        """
        Static method to generate a packet to start an inventory round. In data, there is the channel
        (How many RF carrier frequency hopping channels are going to be used per inventory round)
        :param channel: hexadecimal byte corresponding to the channel (01 by default) 
        """
        subpacket = bytearray(b"\xA0\x04\x01\x89" + channel)
        return Ind903Packet.parsePacket(bytearray(subpacket + Ind903Packet.getChecksumPacket(subpacket)))
    generatePacketStartRealTimeInventory = staticmethod(generatePacketStartRealTimeInventory)
