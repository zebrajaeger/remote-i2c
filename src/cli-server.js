#!/usr/bin/env node

const {program} = require('commander');

const {I2CServer} = require('./server');

program.requiredOption('-b, --busNumber <nr>', 'I²C-Bus number');
program.option('-p, --port <port>', 'Port to bind on', '8080');
program.option('-h, --host <hostname>', 'Host, IP, ... to bind on', '0.0.0.0');
program.option('-v, --verbose', 'Print what happens');
program.parse(process.argv);
console.log('bus', program.busNumber)
console.log('server', program.host + ':' + program.port)

const server = new I2CServer(program.host, parseInt(program.port), parseInt(program.busNumber));
server.verbose = program.verbose;
