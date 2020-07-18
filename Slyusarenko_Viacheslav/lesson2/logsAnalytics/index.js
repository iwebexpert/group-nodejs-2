const argv = require('minimist')(process.argv);
const Logger = require('./Logger');

Logger.analyze( argv.f || argv.file );