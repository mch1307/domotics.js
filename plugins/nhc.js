const net = require('net')
const cfg = require('../conf/conf')
const log = require('../lib/logger')
const publish = require('../lib/publish')
// const router = require('./nhcinitroute')
const re = /\r\n|\n\r|\n|\r/g
let completeData = ''

exports.register = function (server, options, next) {

  server.dependency(['db'])

  const sendCmd = (nhcCmd) => {
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
  server.expose({sendCmd: sendCmd})

  const nhcListen = () => {
  // NHC Listener
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
            routeNhc(JSON.parse(oneMsg))
          // log.debug('nhc nhcListen routed: ' + oneMsg)
          }
        })
      }
    })
    log.debug('nhcListen sending register msg to niko')
    nhcListen.write(cfg.NHC.registerMsg)
  }

  const routeNhc = (oneMsg) => {
    // let jsNhc = JSON.parse(oneMsg)
  // get event type
    if (oneMsg.hasOwnProperty('cmd')) {
    // list commands -> initialize database
      if (oneMsg.cmd === 'listlocations') {
        server.plugins.db.initNhcLocations(oneMsg)
      } else if (oneMsg.cmd === 'listactions') {
        server.plugins.db.initNhcActions(oneMsg)
      } else if (oneMsg.cmd === 'listthermostat') {
        server.plugins.db.initNhcThermostats(oneMsg)
      } else if (oneMsg.cmd === 'listenergy') {
        server.plugins.db.initNhcEnergies(oneMsg)
      }
    } else if (oneMsg.hasOwnProperty('event')) {
    // event message -> notify + update database
    // log.debug('event received')
      if (oneMsg.event === 'listactions') {
      // log.debug('niko listener received action event: ' + util.inspect(jsNhc, false, null))
        for (let i = 0; i < oneMsg.data.length; i++) {
          let nikoItem = server.plugins.db.getNikoAction(oneMsg.data[i].id)
        // log.debug('router after getNikoAction: ' + util.inspect(nikoItem, false, null))
          nikoItem.value = oneMsg.data[i].value1
        // log.debug('niko listener ---- invoke action publish ---- ' + util.inspect(nikoItem, false, null))
          server.publish('/events', nikoItem)
          publish.sendItemEvent(nikoItem)
        // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
          server.plugins.db.updateNikoAction(oneMsg.data[i])
        // log.debug('router check value after: ' + util.inspect(persist.getNikoAction(jsNhc.data[i].id), false, null))
        }
      }
      if (oneMsg.event === 'listthermostat') {
      // log.debug('niko listener received thermostat event: ' + util.inspect(jsNhc, false, null))
        for (let i = 0; i < oneMsg.data.length; i++) {
          let nikoItem = server.plugins.db.getNikoThermostat(oneMsg.data[i].id)
        // log.debug('router after getNikoThermostat: ' + util.inspect(nikoItem, false, null))
          nikoItem.value = oneMsg.data[i].measured / 10
        // log.debug('nhListen ---- invoke publish ---- ' + util.inspect(nikoItem, false, null))
          server.publish('/events', nikoItem)
          publish.sendItemEvent(nikoItem)
        // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
          server.plugins.db.updateNikoThermostat(oneMsg.data[i])
        // log.debug('router check value after: ' + util.inspect(persist.getNikoThermostat(jsNhc.data[i].id), false, null))
        }
      }
      if (oneMsg.event === 'getlive') {
        let nikoItem = server.plugins.db.getNikoEnergy(oneMsg.data.channel)
      // log.debug('router after getNikoEnergy: ' + jsNhc.data.v /1000)
        nikoItem.value = oneMsg.data.v / 1000
      // log.debug('nhListen ---- invoke publish ---- ' + util.inspect(nikoItem, false, null))
        server.publish('/events', nikoItem)
        publish.sendItemEvent(nikoItem)
      // log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
        server.plugins.db.updateNikoEnergy(oneMsg.data)
      // log.debug('router check value after: ' + util.inspect(persist.getNikoEnergy(jsNhc.data[i].channel), false, null))
      }
    }
  }

  const initNhc = () => {
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
        let allMsg = completeData.replace(re, '\n').split('\n')
        completeData = ''
        allMsg.forEach((oneMsg, i) => {
          if (oneMsg) {
            routeNhc(JSON.parse(oneMsg))
          }
        })
        setTimeout(() => {
          initSocket.destroy()
          log.debug('init socket destroyed ##################')
        }, 2000)
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
    }, 900)
    setTimeout(() => {
      initSocket.write(cfg.NHC.listEnergyMsg)
      log.debug('nhc initNhc sent cmd: ' + cfg.NHC.listEnergyMsg)
    }, 1300)
    setTimeout(() => {
      nhcListen()
    }, 3000)
    log.debug(' nhc init ended ##################################')
  }
  log.debug('nhc init #################################')
  initNhc(),
    next()
}
exports.register.attributes = {
  name: 'nhc'
}
