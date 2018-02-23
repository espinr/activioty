'''
Created on Jan 29, 2018

@author: martin

Main function to run a checkpoint using a USB Keypad Reader

'''

from checkpoint import checkpoint
import context
from usb_keypad_reader import usb_keypad_reader


if __name__ == '__main__':
    reader = usb_keypad_reader.USBKeypadReader()
    checkpoint = checkpoint.Checkpoint('Keypad-1', reader, 'activioty.ddns.net')
    checkpoint.execute()
