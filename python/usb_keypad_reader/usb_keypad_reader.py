'''
Created on Jan 30, 2018

@author: martin
'''

from reader import reader


class USBKeypadReader(reader.Reader):
    '''
    Reader of bib numbers (strings) from standard input. 
    '''

    def __init__(self):
        '''
        Constructor
        '''
        pass
        
    def initialize(self):
        '''
        Initializes the reader
        '''
        pass
    
    def doInventory(self, processCallback):
        '''
        Process of inventory execution. After the reader is initialized, an infinite loop is executed waiting for a 
        bib number finished by <intro> 
        :param processCallback(epcID, bibID): callback function to process a bibID found during inventory (epcID=None).
        '''
        while True:
            bibId = ''
            while bibId.strip() == '':
                bibId = input('\nBib number? > ')
            print('Read ' + bibId)
            processCallback(None, bibId.strip())   
