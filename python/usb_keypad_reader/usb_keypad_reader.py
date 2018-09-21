'''
Created on Jan 30, 2018

@author: martin
'''

from reader import reader
from termcolor import cprint
from pyfiglet import figlet_format



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
                if ('-' in bibId) or ('*' in bibId):
                    cprint(figlet_format('BIB NO SET!!', font='small'), 'white', 'on_red', attrs=['bold'])        
                    bibId = ''
            cprint(figlet_format(bibId, font='starwars'), 'white', 'on_green', attrs=['bold'])
            processCallback(None, bibId.strip())   
