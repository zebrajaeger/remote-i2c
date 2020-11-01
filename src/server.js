const express = require('express');
const {parseNumber} = require('./util');
const {HardwareI2C} = require('./client');

class I2CServer {
    constructor(host, port, busNumber) {
        const i2c = new HardwareI2C(busNumber);

        const app = express();
        app.use(express.raw());

        app.get('/', (req, res) => {
            let address = parseNumber(req.query.address);
            let count = parseNumber(req.query.count);
            if (address !== null && count !== null) {
                i2c.readAsHex(address, count)
                    .then(hex => res.send(hex))
                    .catch(err => {
                        res.status(500).send(`${err}`);
                    })
            } else {
                res.status(400).send('count or address missing');
            }
        });

        app.post('/', (req, res) => {
            let address = parseNumber(req.query.address);
            if (address !== null) {
                const data = Buffer.from(req.body.toString(), 'hex');
                // TODO WRITE DATA TO i2c
                res.status(200);
            } else {
                res.status(400).send('address missing');
            }
        });

        app.listen(port, host, () => {
            console.log(`Listening at http://${host}:${port}`)
        });
    }
}

module.exports = {I2CServer};
