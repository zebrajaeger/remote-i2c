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
            if (address !== null && count !== null) {

                i2c.readAsHex(address, count)
                    .then(hex => {
                        if(this.verbose){
                            console.log(`read from bus '${busNumber}' at address '${address}' '${count}' Bytes: '${hex}`);
                        }
                        res.send(hex)
                    })
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

        app.get('/write', (req, res) => {
            let address = parseNumber(req.query.address);
            let data = req.query.data;
            if (address !== null && data !==null) {
                if(this.verbose){
                    console.log(`write to bus '${busNumber}' at address '${address}' value '${data}'`)
                }
                i2c.writeAsHex(address, data)
                    .then(() => res.status(200))
                    .catch(err => {
                        res.status(500).send(`${err}`);
                    })
            } else {
                if(address === null && data === null){
                    res.status(400).send('data and address are missing');
                }else if(address === null){
                    res.status(400).send('address is missing');
                }else{
                    res.status(400).send('data is missing');
                }
            }
        });

        app.listen(port, host, () => {
            console.log(`Listening at http://${host}:${port}`)
        });
    }

    set verbose(verbose){
        this._verbose = verbose===true;
    }

    get verbose(){
        return this._verbose;
    }
}

module.exports = {I2CServer};
