#!/usr/bin/env node

const {program} = require('commander');

const {HttpI2C} = require('./client');

program.option('-p, --port <port>', 'Port for send request to', '8080');
program.option('-h, --host <hostname>', 'Host for send request to', 'localhost');
program.option('-a, --address <address>', 'i²C Address', '0');
program.option('-c, --count <count>', 'Number of bytes to read', '1');
program.parse(process.argv);

let client = new HttpI2C(program.host, parseInt(program.port));
client
    .readAsHex(parseInt(program.address), parseInt(program.count))
    .then(hex => console.log(hex))
    .catch(err=>console.log(err.toString()));
