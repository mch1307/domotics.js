'use strict'

const persist = require('../lib/persist')
const net = require('net')
const cfg = require('../conf/conf')
const log = require('../lib/logger')
const util = require('util')
// const router = require('../lib/router')
//const nhc = require('../lib/nhc')
const re = /\r\n|\n\r|\n|\r/g
const Nes = require('nes')
let completeData

exports.register = (server, options, next) => {
  log.debug('start cmd register ##################')
  log.debug('before init ##################')
  // server.subscription('/events')
  setTimeout(() => {
    server.publish('/events', 'Hello')
  }, 4000)
  server.method('nhc.listen', () => {
    // NHC Listener
    log.debug('starting listener init ##################')
    let completeData = ''
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
            let jsNhc = JSON.parse(oneMsg)
            // get event type
            if (jsNhc.hasOwnProperty('cmd')) {
              // list commands -> initialize database
              if (jsNhc.cmd === 'listlocations') {
                persist.initNhcLocations(oneMsg)
              } else if (jsNhc.cmd === 'listactions') {
                persist.initNhcActions(oneMsg)
              }
            } else if (jsNhc.hasOwnProperty('event')) {
              // event message -> notify + update database
              log.debug('event received')
              if (jsNhc.event === 'listactions') {
                for (let i = 0; i < jsNhc.data.length; i++) {
                  let nikoItem = persist.getNikoAction(jsNhc.data[i].id)
                  log.debug('router after getNikoAction: ' + util.inspect(nikoItem, false, null))
                  nikoItem.value = jsNhc.data[i].value1
                  log.debug('nhListen ---- invoke pusblish ---- ' + util.inspect(nikoItem, false, null))
                  server.publish('/events', nikoItem)
                  server.publish('/events', 'update')
                  // publish.sendItemEvent(nikoItem)
                  log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
                  persist.updateNikoAction(jsNhc.data[i])
                  log.debug('router check value after: ' + util.inspect(persist.getNikoAction(jsNhc.data[i].id), false, null))
                }
              }
            }
//            router.routeNhc(oneMsg)
            log.debug('nhc nhcListen routed: ' + oneMsg)
          }
        })
      }
    })
    log.debug('nhcListen sending register msg to niko')
    nhcListen.write(cfg.NHC.registerMsg)
  }, {
    callback: false
  })
  next()
}
exports.register.attributes = {
  name: 'nhc'
}
