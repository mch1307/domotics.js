const net = require('net')
const cfg = require('../conf/conf')
const log = require('./logger')
const router = require('./router')
const re = /\r\n|\n\r|\n|\r/g
let completeData = ''

function nhcListen () {
  let nhcListen = new net.Socket({readable: true, writable: true})
  nhcListen.setEncoding('utf8')
  nhcListen.setKeepAlive(true, cfg.NHC.keepAlive)
  try {
    nhcListen.connect(cfg.NHC.port, cfg.NHC.host)
  } catch (err) {
    log.error('Unable to connect to NHC: ', err)
  }
  log.debug('nhc nhcListen connected to: ' + cfg.NHC.host)

  nhcListen.on('data', (data) => {
    if (data.indexOf('\n') < 0) {
      completeData += data
    } else {
      completeData += data
      let allMsg = completeData.replace(re, '\n').split('\n')
      allMsg.forEach((oneMsg, i) => {
        if (oneMsg) {
          log.debug('nhc listen: ' + oneMsg)
          router.routeNhc(oneMsg)
          log.debug('nhc nhcListen routed: ' + oneMsg)
        }
      })
    }
  })
  log.debug('nhcListen sending init niko msg')
  nhcListen.write(cfg.NHC.registerMsg)
}

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
      router.routeNhc(completeData)
      completeData = ''
      setTimeout(() => {
        initSocket.destroy()
      }, 1000)
    }
  })
  setTimeout(() => {
    initSocket.write(cfg.NHC.equMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.equMsg)
  }, 100)
  setTimeout(() => {
    initSocket.write(cfg.NHC.locMsg)
    log.debug('nhc initNhc sent cmd: ' + cfg.NHC.locMsg)
  }, 200)
  setTimeout(() => {
    nhcListen()
  }, 1000)
}

module.exports.initNhc = initNhc
module.exports.sendNhcCmd = sendNhcCmd
