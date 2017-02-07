const cfg = require('../conf/conf')
const Client = require('node-rest-client').Client
const client = new Client()
const log = require('./logger')

let args = {
  data: {},
  headers: { 'Content-Type': 'application/json' },
  responseConfig: { timeout: 3000 }
}

const sendItemEvent = function (item) {
  args.data = item
  // log.debug('publish.sendItemEvent: ' + cfg.DAEMON.notifyRootURL + cfg.DAEMON.notifyPath)
  let req = client.post(cfg.DAEMON.notifyRootURL + cfg.DAEMON.notifyPath, args, function (data, response) {
    // log.debug('publish sendItemEvent:' + response)
  })
  req.on('requestTimeout', function (req) {
    log.warn('publish.sendItemEvent: request has expired, ignoring')
  })
  req.on('responseTimeout', function (req) {
    log.warn('publish.sendItemEvent: request has timed out, ignoring')
  })
  req.on('error', function (err) {
    console.log('request error', err)
  })
}

module.exports.sendItemEvent = sendItemEvent
