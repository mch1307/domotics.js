const Loki = require('lokijs')
const db = new Loki('db')
const log = require('./logger')
const util = require('util')

let nikoActions = db.addCollection('nikoActions', { unique: ['id'] })
let nikoLocations = db.addCollection('nikoLocations', { unique: ['id'] })
// var nikoEnergies = db.addCollection('nikoEnergies', {unique: ['id']})
// var nikoThermostats = db.addCollection('nikoThermostats', {unique: ['id']})

const initNhcLocations = (nhcLocData) => {
  let jsonNhc = JSON.parse(nhcLocData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    nikoLocations.insert(jsonNhc.data[i])
  }
}

const initNhcActions = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    nikoActions.insert(jsonNhc.data[i])
    // log.debug('insert location: ' + util.inspect(jsonNhc.data[i], false, null))
  }
}

const initNhcEnergies = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    initNhcEnergies.insert(jsonNhc.data[i])
  }
}

const initNhcThermostats = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    initNhcThermostats.insert(jsonNhc.data[i])
  }
}

const getNikoAction = (id) => {
  let nhcAction
  let nhcLocation
  try {
    nhcAction = nikoActions.findOne({
      'id': id
    })
    nhcLocation = nikoLocations.findOne({
      'id': nhcAction.location
    })
  } catch (e) {
    log.error('persist.getNikoAction ' + e)
  }
  let item = {}
  try {
    item.provider = 'NHC'
    item.uid = 'NHC-' + nhcAction.id
    item.itemID = nhcAction.id
    item.itemName = nhcAction.name
    item.locationID = nhcAction.location
    item.locationName = nhcLocation.name
    item.typeID = nhcAction.type
    item.value = nhcAction.value1
  } catch (e) {
    log.error('persist.getNikoAction ' + e)
  }
  log.debug('persist getNikoAction:' + util.inspect(item, false, null))
  return item
}

const stripResultsMetadata = (results) => {
  let records = []
  for (let idx = 0; idx < results.length; idx++) {
    const lokiRec = results[ idx ]
    const cleanRec = Object.assign({}, lokiRec)
    delete cleanRec['meta']
    delete cleanRec['$loki']
    records.push(cleanRec)
  }
  return records
}

const getAllItems = () => {
  let resultSet = nikoActions.chain().eqJoin(nikoLocations.chain(), 'location', 'id', function (el, er) {
    let item = {}
    item.provider = 'NHC'
    item.uid = 'NHC-' + el.id
    item.itemID = el.id
    item.itemName = el.name
    item.locationID = el.location
    item.locationName = er.name
    item.typeID = el.type
    item.value = el.value1
    return item
  }).data()
  return (stripResultsMetadata(resultSet))
}

const updateNikoAction = (nhcAction) => {
  log.debug('persist updAct: ' + util.inspect(nhcAction, false, null))
  nikoActions.chain().find({ id: nhcAction.id }).update(function (obj) {
    obj.value1 = nhcAction.value1
  })
}

module.exports.initNhcActions = initNhcActions
module.exports.initNhcLocations = initNhcLocations
module.exports.initNhcEnergies = initNhcEnergies
module.exports.initNhcThermostats = initNhcThermostats
module.exports.getNikoAction = getNikoAction
module.exports.getAllItems = getAllItems
module.exports.updateNikoAction = updateNikoAction

