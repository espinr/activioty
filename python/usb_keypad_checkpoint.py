'''
Created on Jan 29, 2018

@author: martin

Main function to run a checkpoint using a USB Keypad Reader

'''

from checkpoint import checkpoint
import context
import argparse
from usb_keypad_reader import usb_keypad_reader

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-id', '--device', help='The ID of the device (string)')
    parser.add_argument('-b', '--broker', help='MQTT broker hostname')
    args = parser.parse_args()
    print('Running device [' + args.device + '] publishing on [' + args.broker + ']')
    reader = usb_keypad_reader.USBKeypadReader()
    checkpoint = checkpoint.Checkpoint(args.device, reader, args.broker)
    checkpoint.execute()
