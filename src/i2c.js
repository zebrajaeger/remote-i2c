const fetch = require('node-fetch');
const {openSync} = require('i2c-bus');

class I2CBase {
    async readAsHex(address, count) {
        return this.read(address, count)
            .then(buffer => buffer.toString('hex'));
    }

    async writeAsHex(address, data) {
        const buffer = Buffer.from(data, 'hex');
        return this.write(address, buffer);
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

    async write(address, buffer) {
        return new Promise((resolve, reject) => {
            try {
                const bytes = this.i2c.i2cWriteSync(address, buffer.length, buffer);
                resolve(bytes);
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
        const url = `http://${this.host}:${this.port}/read?address=${address}&count=${count}`;
        return fetch(url)
            .then(res => {
                if (res.status !== 200) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                return res.text()
            })
            .then(text => Buffer.from(text, 'hex'));
    }

    async write(address, buffer) {
        this.checkAddress(address);
        const url = `http://${this.host}:${this.port}/write?address=${address}&data=${buffer.toString('hex')}`;
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

class ReadDataBuffer {
    _index;
    _buffer;

    constructor(buffer) {
        this._buffer = buffer;
        this._index = 0;
    }

    resetIndex() {
        this._index = 0;
    }

    available() {
        return this._buffer.length - this._index;
    }

    checkSize(bytesNeeded) {
        if (this.available() < bytesNeeded) {
            throw new Error('Unexpected end of buffer')
        }
    }

    readUInt8() {
        this.checkSize(1);
        const result = this._buffer.readUInt8(this._index);
        this._index += 1;
        return result;
    };

    readUInt16LE() {
        this.checkSize(2);
        const result = this._buffer.readUInt16LE(this._index);
        this._index += 2;
        return result;
    }

    readUInt16BE() {
        this.checkSize(2);
        const result = this._buffer.readUInt16BE(this._index);
        this._index += 1;
        return result;
    };

    readUInt32LE() {
        this.checkSize(4);
        const result = this._buffer.readUInt32LE(this._index);
        this._index += 4;
        return result;
    };

    readUInt32BE() {
        this.checkSize(4);
        const result = this._buffer.readUInt32BE(this._index);
        this._index += 4;
        return result;
    };

    readInt8() {
        this.checkSize(1);
        const result = this._buffer.readInt8(this._index);
        this._index += 1;
        return result;
    };

    readInt16LE() {
        this.checkSize(2);
        const result = this._buffer.readInt16LE(this._index);
        this._index += 2;
        return result;
    };

    readInt16BE() {
        this.checkSize(2);
        const result = this._buffer.readInt16BE(this._index);
        this._index += 2;
        return result;
    };

    readInt32LE() {
        this.checkSize(4)
        const result = this._buffer.readInt32LE(this._index);
        this._index += 4;
        return result;
    };

    readInt32BE() {
        this.checkSize(4);
        const result = this._buffer.readInt32BE(this._index);
        this._index += 4;
        return result;
    };

    readFloatLE() {
        this.checkSize(4);
        const result = this._buffer.readFloatLE(this._index);
        this._index += 4;
        return result;
    };

    readFloatBE() {
        this.checkSize(4);
        const result = this._buffer.readFloatBE(this._index);
        this._index += 4;
        return result;
    };

    readDoubleLE() {
        this.checkSize(8);
        const result = this._buffer.readDoubleLE();
        this._index += 8;
        return result;
    };

    readDoubleBE() {
        this.checkSize(8);
        const result = this._buffer.readDoubleBE(this._index);
        this._index += 8;
        return result;
    };
}

class WriteDataBuffer {
    _buffers;

    constructor() {
        this.reset();
    }

    reset() {
        this._buffers = [];
    }

    create() {
        return Buffer.concat(this._buffers);
    }

    writeUInt8(value) {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(value);
        this._buffers.push(buffer);
    }

    writeUInt16LE(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(value);
        this._buffers.push(buffer);
    }

    writeUInt16BE(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(value);
        this._buffers.push(buffer);
    }

    writeUInt32LE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(value);
        this._buffers.push(buffer);
    }

    writeUInt32BE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(value);
        this._buffers.push(buffer);
    }

    writeInt8(value) {
        const buffer = Buffer.alloc(1);
        buffer.writeInt8(value);
        this._buffers.push(buffer);
    }

    writeInt16LE(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeInt16LE(value);
        this._buffers.push(buffer);
    }

    writeInt16BE(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeInt16BE(value);
        this._buffers.push(buffer);
    }

    writeInt32LE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);
        this._buffers.push(buffer);
    }

    writeInt32BE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(value);
        this._buffers.push(buffer);
    }

    writeFloatLE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value);
        this._buffers.push(buffer);
    }

    writeFloatBE(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatBE(value);
        this._buffers.push(buffer);
    }

    writeDoubleLE(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value);
        this._buffers.push(buffer);
    }

    writeDoubleBE(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleBE(value);
        this._buffers.push(buffer);
    }
}

module.exports = {HardwareI2C, HttpI2C, ReadDataBuffer, WriteDataBuffer}
