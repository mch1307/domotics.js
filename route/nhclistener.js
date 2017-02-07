'use strict'
const persist = require('../lib/persist')
const publish = require('../lib/publish')
const net = require('net')
const cfg = require('../conf/conf')
const log = require('../lib/logger')
const util = require('util')
// const router = require('../lib/router')
// const nhc = require('../lib/nhc')
const re = /\r\n|\n\r|\n|\r/g
// const Nes = require('nes')

exports.register = (server, options, next) => {
  // log.debug('start cmd register ##################')
  // log.debug('before init ##################')
  // server.subscription('/events')
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
      // log.debug('listener raw data: ' + data)
      if (data.indexOf('\n') < 0) {
        completeData += data
      } else {
        completeData += data
        let allMsg = completeData.replace(re, '\n').split('\n')
        completeData = ''
        // log.debug('listener complete data: ' + completeData)
        allMsg.forEach((oneMsg, i) => {
          if (oneMsg) {
            // log.debug('nhc listen: ' + oneMsg)
            let jsNhc = JSON.parse(oneMsg)
            // get event type
            if (jsNhc.hasOwnProperty('cmd')) {
              // list commands -> initialize database
              if (jsNhc.cmd === 'listlocations') {
                persist.initNhcLocations(oneMsg)
              } else if (jsNhc.cmd === 'listactions') {
                persist.initNhcActions(oneMsg)
              } else if (jsNhc.cmd === 'listthermostat') {
                persist.initNhcThermostats(oneMsg)
              } else if (jsNhc.cmd === 'listenergy') {
                persist.initNhcEnergies(oneMsg)
              }
            } else if (jsNhc.hasOwnProperty('event')) {
              // event message -> notify + update database
              // log.debug('event received')
              if (jsNhc.event === 'listactions') {
                // log.debug('niko listener received action event: ' + util.inspect(jsNhc, false, null))
                for (let i = 0; i < jsNhc.data.length; i++) {
                  let nikoItem = persist.getNikoAction(jsNhc.data[i].id)
                  // log.debug('router after getNikoAction: ' + util.inspect(nikoItem, false, null))
                  nikoItem.value = jsNhc.data[i].value1
                  // log.debug('niko listener ---- invoke action publish ---- ' + util.inspect(nikoItem, false, null))
                  server.publish('/events', nikoItem)
                  publish.sendItemEvent(nikoItem)
                  // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
                  persist.updateNikoAction(jsNhc.data[i])
                  // log.debug('router check value after: ' + util.inspect(persist.getNikoAction(jsNhc.data[i].id), false, null))
                }
              }
              if (jsNhc.event === 'listthermostat') {
                // log.debug('niko listener received thermostat event: ' + util.inspect(jsNhc, false, null))
                for (let i = 0; i < jsNhc.data.length; i++) {
                  let nikoItem = persist.getNikoThermostat(jsNhc.data[i].id)
                  // log.debug('router after getNikoThermostat: ' + util.inspect(nikoItem, false, null))
                  nikoItem.value = jsNhc.data[i].measured/10
                  log.debug('nhListen ---- invoke publish ---- ' + util.inspect(nikoItem, false, null))
                  server.publish('/events', nikoItem)
                  publish.sendItemEvent(nikoItem)
                  // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
                  persist.updateNikoThermostat(jsNhc.data[i])
                  // log.debug('router check value after: ' + util.inspect(persist.getNikoThermostat(jsNhc.data[i].id), false, null))
                }
              }
              if (jsNhc.event === 'getlive') {
                  let nikoItem = persist.getNikoEnergy(jsNhc.data.channel)
                  //log.debug('router after getNikoEnergy: ' + jsNhc.data.v /1000)
                  nikoItem.value = jsNhc.data.v /1000
                  // log.debug('nhListen ---- invoke publish ---- ' + util.inspect(nikoItem, false, null))
                  server.publish('/events', nikoItem)
                  publish.sendItemEvent(nikoItem)
                  // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
                  persist.updateNikoEnergy(jsNhc.data)
                  // log.debug('router check value after: ' + util.inspect(persist.getNikoEnergy(jsNhc.data[i].channel), false, null))
              }
            }
//            router.routeNhc(oneMsg)
            // log.debug('nhc nhcListen routed: ' + oneMsg)
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
