#!/usr/bin/env node

const {program} = require('commander');

const {HttpI2C} = require('./i2c');

program.option('-p, --port <port>', 'Port for send request to', '8080');
program.option('-h, --host <hostname>', 'Host for send request to', 'localhost');
program.option('-a, --address <address>', 'i²C Address', '0');
program.requiredOption('-d, --data <hexString>', ' Data like this 0F01CB');
program.parse(process.argv);

let client = new HttpI2C(program.host, parseInt(program.port));
client
    .readAsHex(parseInt(program.address), parseInt(program.count))
    .then(hex => console.log(hex))
    .catch(err=>console.log(err.toString()));
