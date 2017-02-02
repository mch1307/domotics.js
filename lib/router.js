const persist = require('./persist')
const log = require('./logger')
const util = require('util')
const publish = require('./publish')

function routeNhc (nhcEvent) {
  let jsNhc = JSON.parse(nhcEvent)
  // get event type
  if (jsNhc.hasOwnProperty('cmd')) {
    // list commands -> initialize database
    if (jsNhc.cmd === 'listlocations') {
      persist.initNhcLocations(nhcEvent)
    } else if (jsNhc.cmd === 'listactions') {
      persist.initNhcActions(nhcEvent)
    }
  } else if (jsNhc.hasOwnProperty('event')) {
    // event message -> notify + update database
    log.debug('event received')
    if (jsNhc.event === 'listactions') {
      for (let i = 0; i < jsNhc.data.length; i++) {
        let nikoItem = persist.getNikoAction(jsNhc.data[i].id)
        log.debug('router after getNikoAction: ' + util.inspect(nikoItem, false, null))
        nikoItem.value = jsNhc.data[i].value1
        publish.sendItemEvent(nikoItem)
        log.debug('router NHC update: ' + util.inspect(nikoItem, false, null))
        persist.updateNikoAction(jsNhc.data[i])
        log.debug('router check value after: ' + util.inspect(persist.getNikoAction(jsNhc.data[i].id), false, null))
      }
    }
  }
}

module.exports.routeNhc = routeNhc
