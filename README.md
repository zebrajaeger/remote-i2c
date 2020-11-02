# i2c-over-http

[![NPM](https://nodei.co/npm/@zebrajaeger/remote-i2c.png?compact=true)](https://npmjs.org/package/@zebrajaeger/remote-i2c)

Transparent connection to local i2c-bus or remote i2c-bus via http rest interface.

## Start Server from commandline

```bash
$ i2c-server --help
Usage: i2c-server [options]

Options:
  -b, --busNumber <nr>   I²C-Bus number (default: "0")
  -p, --port <port>      Port to bind on (default: "8080")
  -h, --host <hostname>  Host, IP, ... to bind on (default: "0.0.0.0")
  --help                 display help for command 
```

## Use Client from commandline

```bash
$ i2c-client --help
Usage: i2c-client [options]

Options:
  -p, --port <port>        Port for send request to (default: "8080")
  -h, --host <hostname>    Host for send request to (default: "localhost")
  -a, --address <address>  i²C Address (default: "0")
  -c, --count <count>      Number of bytes to read (default: "1")
  --help                   display help for command
```

## Use Client from code

For remote connection, first start server on the remote device.

```javascript
// const {HardwareI2C} = require('@zebrajaeger/remote-i2c');
const {HardwareI2C, HttpI2C} = require('../src/client');

// for local execution use this one
//const i2c = new HardwareI2C(1); // on raspberry pi, we use i2c-bus #1

// for remote execution use this one
const i2c = new HttpI2C('192.168.178.69', 8080); // remote raspberry pi

(async () => {
    try {
        // read two 16 bit values (from i2c-joystick)
        const buffer = await i2c.read(0x30, 4);
        const x = buffer.readInt16LE(0);
        const y = buffer.readInt16LE(2);
        console.log({x, y});

        // read as hex-string for whatever
        const hexString = await i2c.readAsHex(0x30, 4);
        console.log({hexString});
    } catch (err) {
        console.log('Error', err)
    }
})();
```
