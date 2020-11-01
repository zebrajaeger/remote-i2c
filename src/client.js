const fetch = require('node-fetch');
const {openSync} = require('i2c-bus');

class I2CBase {
    async readAsHex(address, count) {
        return this.read(address, count)
            .then(buffer => buffer.toString('hex'));
    }
}

class HardwareI2C extends I2CBase {
    _i2c;

    constructor(busNumber) {
        super();
        this._i2c = openSync(busNumber);
    }

    get i2c() {
        return this._i2c;
    }

    async read(address, count) {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(count);
            try {
                const bytes = this.i2c.i2cReadSync(address, count, buffer);
                resolve((bytes === count) ? buffer : buffer.subarray(0, bytes));
            } catch (err) {
                reject(err);
            }
        })
    }
}

class HttpI2C extends I2CBase {
    _host;
    _port;

    constructor(host, port) {
        super();
        this._host = host;
        this._port = port;
    }

    get host() {
        return this._host;
    }


    get port() {
        return this._port;
    }

    async read(address, count) {
        this.checkAddress(address);
        const url = `http://${this.host}:${this.port}/?address=${address}&count=${count}`;
        return fetch(url)
            .then(res => {
                if (res.status !== 200) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                return res.text()
            })
            .then(text => Buffer.from(text, 'hex'));
    }


    checkAddress(address) {
        if (!Number.isInteger(address) || address < 0 || address > 0x7f) {
            throw new Error('Invalid I2C address ' + address);
        }
    };
}

module.exports = {HardwareI2C, HttpI2C}

// let c = new HttpI2C('http://192.168.178.69:8080');
// setInterval(() => {
//
//     c.readAsHex(0x30, 4).then(x => {
//         // console.log(x.readInt16LE(0));
//         console.log(x.substr(0,4));
//     });
// }, 1000)
