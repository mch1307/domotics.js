const net = require('net')
const cfg = require('../conf/conf')
const log = require('./logger')
const router = require('./nhcinitroute')
const re = /\r\n|\n\r|\n|\r/g
let completeData = ''

function sendNhcCmd (nhcCmd) {
  let tmpSocket = new net.Socket({
    readable: true,
    writable: true
  })
  tmpSocket.setEncoding('utf8')
  try {
    tmpSocket.connect(cfg.NHC.port, cfg.NHC.host)
  } catch (err) {
    log.error('Unable to connect to NHC ', err)
  }
  process.nextTick(() => {
    tmpSocket.write(nhcCmd)
    log.debug('nhc sent cmd: ' + nhcCmd)
  })
  setTimeout(() => {
    tmpSocket.destroy()
  }, 800)
}

function initNhc () {
  let initSocket = new net.Socket()
  initSocket.setEncoding('utf8')
  try {
    initSocket.connect(cfg.NHC.port, cfg.NHC.host)
  } catch (err) {
    log.error('Unable to connect to NHC ', err)
  }
  initSocket.on('data', (data) => {
    if (data.indexOf('\n') < 0) {
      completeData += data
    } else {
      completeData += data
      log.debug('nhc init: ' + completeData)
      router.routeNhc(completeData)
      completeData = ''
      setTimeout(() => {
        initSocket.destroy()
        log.debug('init socket destroyed ##################')
      }, 4000)
    }
  })
  setTimeout(() => {
    initSocket.write(cfg.NHC.equMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.equMsg)
  }, 100)
  setTimeout(() => {
    initSocket.write(cfg.NHC.locMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.locMsg)
  }, 500)
  setTimeout(() => {
    initSocket.write(cfg.NHC.listThermoMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.listThermoMsg)
  }, 1000)
  setTimeout(() => {
    initSocket.write(cfg.NHC.listEnergyMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.listEnergyMsg)
  }, 1500)
//  setTimeout(() => {
//    nhcListen()
//  }, 1000)
  log.debug(' nhc init ended ##################################')
}
module.exports.initNhc = initNhc
// module.exports.sendNhcCmd = sendNhcCmd
