const persist = require('./persist')
const log = require('./logger')
const util = require('util')

// Handles initialisation messages, only used at startup
function routeNhc (nhcEvent) {
  let jsNhc = JSON.parse(nhcEvent)
  // get event type
  if (jsNhc.hasOwnProperty('cmd')) {
    // list commands -> initialize database
    if (jsNhc.cmd === 'listlocations') {
      persist.initNhcLocations(nhcEvent)
    } else if (jsNhc.cmd === 'listactions') {
      persist.initNhcActions(nhcEvent)
    } else if (jsNhc.cmd === 'listthermostat') {
        persist.initNhcThermostats(nhcEvent)
    } else if (jsNhc.cmd === 'listenergy') {
      log.debug('init energy : ' + util.inspect(nhcEvent, false, null) )
        persist.initNhcEnergies(nhcEvent)
    }
  }
}

module.exports.routeNhc = routeNhc
