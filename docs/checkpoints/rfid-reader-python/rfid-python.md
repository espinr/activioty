# *Checkpoint*: UHF RFID Reader + Raspberry Pi + Paho for Python

This Checkpoint is based on a **IND903 UHF RFID Reader**, connected to a **Raspberry Pi** (or a **Intel Up Squared**). The reader control and the checkpoint will be coded in Python. The MQTT Client is implemented using the Paho Python module.

It is important to understand that each competitor taking part in a competition is identified by two unique IDs: 
1. the bib number: alphanumeric string that follows the organizers standards (it could be an alias, surname or bib number). In this case, an unsigned integer; and
2. an EPC (Electronic Product Code) corresponding to the RFID tag attached to their bib number. This tag follows the EPC C1G2 (Class 1 Generation 2) standard.


## IND903 UHF RFID Reader

This *checkpoint* of ActivIoTy is configured to read RFID Gen 2 tags that identify competitors. In the case of running races, competitors will wear paper bib numbers with RFID tags attached to them.

The chosen solution is based on the [IND903 UHF RFID reader module](./specs/specification-IND903.pdf). The IND903 is a small reader module, operating in the 902-928MHz (US) frequency and 865.6-867.6MHz (Europe). It works over the EPC global UHF Class 1 Gen 2 (ISO 18000-6C) protocol through a USB serial Interface. The operating voltage (DC 3.5V – 5V), operating temperature (-20°C to +70°C), performance (50 tags per second during an inventory, and a label buffer of 200 labels), and low consumption (110mA at 3.5V – 18 dBm Output，25°C) makes this module appropriate for the requirements of the project.

Although the reader has a reading buffer, this pilot will use a command to perform real-time tags inventory. The default baud rate is 115200bps. Thus, at 115200 baud there is 86 microseconds between characters transmitted through the serial port. For this pilot we don't need more efficiency. 

The EPC C1G2 RFID tags will store data that identifies competitors. The memory bank of tags stores several information fields, but the most interesting for us is the 96-bit EPC (Electronic Product Code). These unique codes are the ID for the athletes in the competition.

### RFID Reading Serial Protocol 

The RFID module implements a specific USB serial protocol. It brings along specific configuration software, and a SDK to control all the complete [functions](./specs/IND903_UHF_RFID_reader_module_protocol_V2.2_en) of the reader. The SDK is designed for the Windows platform and works nicely, but ActivIoTy aims at running on multi-platform devices. So, I had to build my own drivers adapted to the project needs.

Commands and responses consist of byte streams. The lengths of the streams are variable, and the packets are checked by checksum (function in the [specs](./specs/IND903_UHF_RFID_reader_module_protocol_V2.2_en)).

The pilot will implement some basic commands required for the project: 
* `cmd_name_real_time_inventory`: Inventory tags in real time mode.
* `cmd_name_get_firmware_version`: Get firmware version.
* `cmd_name_set_work_antenna`: Set working antenna.

The rest of the commands may be implemented afterwards. The reader will be configured in advance (operating frequency, address, etc.) with fixed values.


#### Sample of communication protocol during the operation of the reader: 

Command 0x72 (get firmware version) sent to the reader:

```
> A0 03 01 72 EA
```
These 5 bytes correspond to:
* `A0`: head (fixed)
* `03`: Length (starting from the third byte)
* `01`: Reader’s address
* `72`: Command
* `EA`: Checksum (check all the bytes except itself)

The reader responds with this packet:
 
```
< A0 05 01 72 01 09 DE
```

That corresponds to: 
* `A0`: head (fixed)
* `05`: Length
* `01`: Reader’s address
* `72`: Command
* `01 09`: Data (`01`: major version, `09`: minor version) -> so, *v1.9*
* `DE`: Checksum

In order to set the working antenna (in our case, it is the #01) we send the following packet:

Set antenna (antenna 1):

```
> A0 04 01 74 00 E7
```
* `A0`: head (fixed)
* `04`: Length
* `01`: Reader’s address
* `74`: Command
* `00`: Data (`00` = antenna #01)
* `E7`: Checksum

The reader responds:

```
< A0 04 01 74 10 D7
```
The fifth byte is `10`: success code (command_success)


When we want to start the inventory, we send a **start inventory command** (0x89):

```
> A0 04 01 89 01 D1
```

The reader reads a tag (one or several times). In case the reader detects a tag more than once the reader only send one packet. This is the sample packet we send to the RFID reader:

```
< A0 13 01 89 04 30 00 E2 00 30 16 66 13 01 21 15 50 74 EF 45 BF
```
This packet means:
* `A0`: head (fixed)
* `13`: Length
* `01`: Reader’s address
* `89`: Command
* `04`: Antenna frequency
* `30 00`: Tag’s PC.
* `E2 00 30 16 66 13 01 21 12 50 74 EF`: **EPC**
* `45`: RSSI (The RSSI when tag is identified.)
* `BF`: Checksum

The reader may send as many packets as it reads. After those packets, the reader returns a *success reading* command (or failure):

```
> A0 0A 01 89 00 00 1D 00 00 00 01 BC
```
Bytes 10 and 11 represent the number of tags read. `00 01` one tag read.

Check the [full specs of the IND903](./specs/IND903_UHF_RFID_reader_module_protocol_V2.2_en)


### Coding in Python

The driver to control the UHF RDIF module has been written in Python (v3 because of new features to work with raw bytes). This language was chosen to be able to operate with bytes easily. It is a lightweight language with multi-platform support and it's very easy to understand. 

You can find all the Python classes and scripts in the repository. As mentioned before, not all commands are implemented but there are some classes that can be used to create packets, including checksums.  

> Do not relay too much on the scripts I created. Believe me, I did my best but it was my first experience with this language :)

The final running script will create a `Checkpoint` object that includes a `Ind903Reader` instance. The workflow will always be:

1. Set-up (set ID, address, port, etc.)
2. Check NTP time (set offset to the internal time clock)
3. Open serial USB port
4. Publish 'ready' message to the MQTT broker
5. Start inventory of tags (infinite loop: set antenna, start inventory, process reading)
5.1. Once a EPC is read, a message is published to the MQTT queue.

#### NTP client with ntplib module

ntplib module will is used to managing timestamps. The client will make a call during the setup to store the offset of the NTP time and the internal clock time.
 
ntplib is very intuitive and can be installed with PyPI `pip3 install ntplib`.

The implementation is pretty straightforward:

``` 
c = ntplib.NTPClient()
response = c.request('europe.pool.ntp.org', version=3)
```

#### Implementation of a MQTT Client with Paho for Python  

The MQTT client is implemented using the [Python Paho module](https://www.eclipse.org/paho/clients/python/). Paho for Python provides a client class with support for both MQTT v3.1 and v3.1.1 on Python 2.7 (or 3.x in this case). 

It can be installed easily via PyPI (`pip install paho-mqtt` or `pip3 install paho-mqtt` in my case).

This module provides some helper functions to make publishing one off messages to an MQTT server very straightforward. Publishing to the MQTT queue is as easy as this:

```
import paho.mqtt.publish as publish 

publish.single(“mytopic", “my message", hostname="test.mosquitto.org")
```

Since the platform will use two fixed topics (`ready` to indicate a checkpoint has joined the network and is in operation, and `checkin` to report competitor's presence or arrival at the checkpoint.

Before the device starts the inventory of competitors, the script publish a `ready` message, informing about the checkpoint station, following this structure:

```
message = {
    ‘checkpoint’ : ‘ID-CHECKPOINT’,
    ‘timestamp' : ‘NTP-UNIX-TIMESTAMP’,
}
```

Once a competitor checks in (their identifier is detected), the RFID reader publish a `checkin` message to the MQTT broker with these data:

```
message = {
    ‘checkpoint’ : 'ID-CHECKPOINT’,
    ‘timestamp' : ‘NTP-UNIX-TIMESTAMP’,
    ‘competitor’ : {
        ‘epc’ : ‘HEX-ID-RFID-TAG' 
    }
}
```

## Testing, testing

And, this is me having fun testing the system with real RFID tags, and simulating `checkins` in the kitchen:

<a href="https://youtu.be/kmptDorc3zw" target="_blank"><img src="http://img.youtube.com/vi/kmptDorc3zw/0.jpg" 
alt="Testing checkpoint at home" style="max-width:100%; border: 5px #cccccc solid;" /></a>

