# -*- coding: utf-8 -*-
# -------
# Class to test IND903 Packets and Reader
# author: espinr 
# -------
import unittest

from ind903_reader import ind903_packet, ind903_reader


Ind903Packet = ind903_packet.Ind903Packet
Ind903Reader = ind903_reader.Ind903Reader;


class Ind903PacketTest(unittest.TestCase):

    SAMPLE_PACKET_GET_FIRMWARE_VERSION          = b"\xA0\x03\x01\x72\xEA"
    SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY      = b"\xA0\x04\x01\x89\x01\xD1"
    SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY_OK   = b"\xA0\x08\x01\x89\x01\x00\x00\x00\x01\xCC"
    SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY_FAIL = b"\xA0\x04\x01\x89\x11\xBD"
    SAMPLE_PACKET_SET_WORKING_ANTENNA           = b"\xA0\x04\x01\x74\x00\xE7" 
    SAMPLE_PACKET_RECEIVED                      = b"\xA0\x13\x01\x89\x04\x30\x00\xE2\x00\x30\x16\x66\x13\x01\x21\x15\x50\x74\xEF\x45\xBF"       


    def setUp(self):
        self.p1 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_GET_FIRMWARE_VERSION)
        self.p2 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY)
        self.p3 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_SET_WORKING_ANTENNA)
        self.p4 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_RECEIVED)

    def test_builder(self):
        p1 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_GET_FIRMWARE_VERSION)
        p2 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_SET_WORKING_ANTENNA)
        p3 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY)
        self.assertTrue(p1.cmd == Ind903Packet.CMD_GET_FIRMWARE_VERSION, 'Command should be parsed')
        self.assertFalse(p1.cmd == None, 'Command should be parsed')
        self.assertTrue(p2.cmd == Ind903Packet.CMD_SET_WORKING_ANTENNA, 'Command should be parsed')
        self.assertTrue(p3.cmd == Ind903Packet.CMD_NAME_REAL_TIME_INVENTORY, 'Command should be parsed')

    def test_constructor(self):
        p = Ind903Packet(b'\xA0', b'\x03', b'\x01', b'\x72', None, b'\xEA')
        self.assertIsInstance(p, Ind903Packet, 'It should be an instance of Ind903Packet')
        p2 = Ind903Packet(b'\xA0', b'\x04', b'\x01', b'\x89', b'\x01', b'\xD1')
        self.assertIsInstance(p2, Ind903Packet, 'It should be an instance of Ind903Packet')
        data3 = b'\x04\x30\x00\xE2\x00\x30\x16\x66\x13\x01\x21\x15\x50\x74\xEF\x45'
        p3 = Ind903Packet(b'\xA0', b'\x14', b'\x01', b'\x89', data3 , b'\xBF')
        self.assertIsInstance(p3, Ind903Packet, 'It should be an instance of Ind903Packet')
        self.assertEqual(p3.data, data3, 'Data should be equal')

    def test_checksum(self):
        packetWithoutChecksum = self.SAMPLE_PACKET_GET_FIRMWARE_VERSION[0:len(self.SAMPLE_PACKET_GET_FIRMWARE_VERSION)-1]
        packetWithoutChecksum2 = self.SAMPLE_PACKET_RECEIVED[0:len(self.SAMPLE_PACKET_RECEIVED)-1]
        self.assertEqual(Ind903Packet.getChecksumPacket(packetWithoutChecksum),b'\xEA')
        self.assertEqual(Ind903Packet.getChecksumPacket(packetWithoutChecksum2),b'\xBF')

    def test_isCommand(self):
        self.assertTrue(self.p1.isCommand(b'\x72'))
        self.assertTrue(self.p2.isCommand(b'\x89'))
        self.assertFalse(self.p3.isCommand(b'\x89'))
        self.assertTrue(self.p4.isCommand(b'\x89'))

    def test_getTagEPCFromInventoryData(self):
        self.assertEqual(self.p4.getTagEPCFromInventoryData(), b'\xE2\x00\x30\x16\x66\x13\x01\x21\x15\x50\x74\xEF')
        
    def test_isEndRealTimeInventory(self):
        p1 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY_OK)
        p2 = Ind903Packet.parsePacket(self.SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY_FAIL)
        self.assertTrue(p1.isEndRealTimeInventory()==Ind903Packet.ERRORCODE_COMMAND_SUCCESS)
        self.assertTrue(p2.isEndRealTimeInventory()!=Ind903Packet.ERRORCODE_COMMAND_SUCCESS)
        self.assertTrue(p2.isEndRealTimeInventory() != b'\x00')
        try:
            self.p1.isEndRealTimeInventory()
        except:
            self.assertRaises(Ind903PacketException)

    def test_generatePacketSetAntenna(self):
        p = Ind903Packet.generatePacketSetAntenna()
        self.assertTrue(p.packet == self.SAMPLE_PACKET_SET_WORKING_ANTENNA)
        
    def test_generatePacketStartRealTimeInventory(self):
        p = Ind903Packet.generatePacketStartRealTimeInventory()
        self.assertTrue(p.packet == self.SAMPLE_PACKET_NAME_REAL_TIME_INVENTORY)
        
if __name__ == '__main__':
    unittest.main()