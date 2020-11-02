const express = require('express');
const {parseNumber} = require('./util');
const {HardwareI2C} = require('./i2c');

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
                if(address === null && count === null){
                    res.status(400).send('count and address are missing');
                }else if(address === null){
                    res.status(400).send('address is missing');
                }else{
                    res.status(400).send('count is missing');
                }
            }
        });

        app.post('/', (req, res) => {
            let address = parseNumber(req.query.address);
            if (address !== null) {
                const data = Buffer.from(req.body.toString(), 'hex');
                i2c.write(address, data)
                    .then(bytes => res.status(200))
                    .catch(err => {
                        res.status(500).send(`${err}`);
                    })
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
