'''
Created on Jan 29, 2018

@author: martin

Main function to run a checkpoint using a IND903 RFID Reader

'''

from checkpoint import checkpoint
import context
from ind903_reader import ind903_reader   


if __name__ == '__main__':
    reader = ind903_reader.Ind903Reader('/dev/ttyUSB0', 115200)
    checkpoint = checkpoint.Checkpoint('RFID-Reader-1', reader, 'activioty.ddns.net')
    checkpoint.execute()
