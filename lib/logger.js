const cfg = require('../conf/conf')
const bunyan = require('bunyan')

let logopt = {
  name: 'domotics.js',
  streams: [{
    type: 'rotating-file',
    path: cfg.DAEMON.logFile,
    level: cfg.DAEMON.logLevel
  }]
}

const log = bunyan.createLogger(logopt)

module.exports = log
