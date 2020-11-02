const express = require('express');
const {parseNumber} = require('./util');
const {HardwareI2C} = require('./i2c');

class I2CServer {
    _verbose;

    constructor(host, port, busNumber) {
        const i2c = new HardwareI2C(busNumber);

        const app = express();
        //app.use(express.raw());

        app.get('/read', (req, res) => {
            let address = parseNumber(req.query.address);
            let count = parseNumber(req.query.count);

            if (this.isOneOrMoreEmpty(address, count)) {
                if (this.verbose) {
                    console.log(`read from bus '${busNumber}' at address '${address}' '${count}' bytes`);
                }
                i2c.readAsHex(address, count)
                    .then(hex => {
                        if (this.verbose) {
                            console.log(`  ok, data: '${hex}`);
                        }
                        res.send(hex)
                    })
                    .catch(err => {
                        if (this.verbose) {
                            console.error('  error:', err);
                        }
                        res.status(500).send(`${err}`);
                    })
            } else {
                if (this.areAllEmpty(address, count)) {
                    res.status(400).send('count and address are missing');
                } else if (this.isEmpty(address)) {
                    res.status(400).send('address is missing');
                } else {
                    res.status(400).send('count is missing');
                }
            }
        });

        app.get('/write', (req, res) => {
            let address = parseNumber(req.query.address);
            let data = req.query.data;

            if (this.isOneOrMoreEmpty(address, data)) {
                if (this.verbose) {
                    console.log(`write to bus '${busNumber}' at address '${address}' value '${data}'`)
                }
                i2c.writeAsHex(address, data)
                    .then(byteCount => {
                        if (this.verbose) {
                            console.log(`  ok, '${byteCount}' Bytes were written`)
                        }
                        res.sendStatus(200);
                    })
                    .catch(err => {
                        if (this.verbose) {
                            console.error('  error:', err);
                        }
                        res.status(500).send(`${err}`);
                    })
            } else {
                if (this.areAllEmpty(address, data)) {
                    res.status(400).send('data and address are missing');
                } else if (this.isEmpty(address)) {
                    res.status(400).send('address is missing');
                } else {
                    res.status(400).send('data is missing');
                }
            }
        });

        app.listen(port, host, () => {
            console.log(`Listening at http://${host}:${port}`)
        });
    }

    areAllEmpty(...value) {
        return value.filter(v => !this.isEmpty(v)).length === 0;
    }

    isOneOrMoreEmpty(...value) {
        return value.filter(v => this.isEmpty(v)).length > 0;
    }

    isEmpty(value) {
        return (value == null || value.length === 0);
    }

    set verbose(verbose) {
        this._verbose = verbose === true;
    }

    get verbose() {
        return this._verbose;
    }
}

module.exports = {I2CServer};
