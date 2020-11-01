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
