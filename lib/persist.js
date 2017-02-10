const Loki = require('lokijs')
const db = new Loki('db')
const log = require('./logger')
const util = require('util')

let nikoActions = db.addCollection('nikoActions', { unique: ['id'] })
let nikoLocations = db.addCollection('nikoLocations', { unique: ['id'] })
let nikoEnergy = db.addCollection('nikoEnergy', {unique: ['id']})
let nikoThermostat = db.addCollection('nikoThermostat', {unique: ['id']})
let genericItem = db.addCollection('genericItem', {unique: ['uid']})

const upsertGenericItem = (item) => {
  // let computedUid = item.provider + '-' + item.type + '-' + item.id
  log.debug('upsert: ' + util.inspect(item, false, null))
  try {
    genericItem.insert((item))
    log.debug('inserted '+ util.inspect(item,false, null))
  } catch (err) {
    genericItem.chain().find({ uid: item.uid }).update(function (obj) {
      obj.value = item.value
      log.debug('updated '+ util.inspect(item,false, null))
    })
  }
}

const initNhcLocations = (nhcLocData) => {
  let jsonNhc = JSON.parse(nhcLocData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    nikoLocations.insert(jsonNhc.data[i])
    log.debug('insert location: ' + util.inspect(jsonNhc.data[i], false, null))
  }
}

const initNhcActions = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    nikoActions.insert(jsonNhc.data[i])
    log.debug('insert actions: ' + util.inspect(jsonNhc.data[i], false, null))
  }
}

const initNhcEnergies = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    nikoEnergy.insert(jsonNhc.data[i])
    log.debug('insert energy: ' + util.inspect(jsonNhc.data[i], false, null))
  }
}

const initNhcThermostats = (nhcEquData) => {
  let jsonNhc = JSON.parse(nhcEquData)
  for (let i = 0; i < jsonNhc.data.length; i++) {
    log.debug('persist.insertThermostat: ' + util.inspect(jsonNhc, false, null))
    nikoThermostat.insert(jsonNhc.data[i])
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
    item.uid = 'NHC-A-' + nhcAction.id
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

const getNikoThermostat = (id) => {
  let nhcThermostat
  let nhcLocation
  try {
    nhcThermostat = nikoThermostat.findOne({
      'id': id
    })
    nhcLocation = nikoLocations.findOne({
      'id': nhcThermostat.location
    })
  } catch (e) {
    log.error('persist.getNikoThermostat ' + e)
  }
  let item = {}
  try {
    item.provider = 'NHC'
    item.uid = 'NHC-T-' + nhcThermostat.id
    item.itemID = nhcThermostat.id
    item.itemName = nhcThermostat.name
    item.locationID = nhcThermostat.location
    item.locationName = nhcLocation.name
    item.typeID = ''
    item.value = nhcThermostat.measured
  } catch (e) {
    log.error('persist.getNikoThermostat ' + e)
  }
    // log.debug('persist getNikoThermostat:' + util.inspect(item, false, null))
  return item
}

const getNikoEnergy = (id) => {
  let nhcEnergy

  try {
    nhcEnergy = nikoEnergy.findOne({
      'channel': id
    })
  } catch (e) {
    log.error('persist.getNikoEnergy ' + e)
  }
  let item = {}
  try {
    item.provider = 'NHC'
    item.uid = 'NHC-E-' + nhcEnergy.channel
    item.itemID = nhcEnergy.channel
    item.itemName = nhcEnergy.name
    item.locationID = ''
    item.locationName = ''
    item.typeID = nhcEnergy.type
    item.value = nhcEnergy.live
  } catch (e) {
    log.error('persist.getNikoEnergy ' + e)
  }
    // log.debug('persist getNikoThermostat:' + util.inspect(item, false, null))
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
  log.debug('stripRS: ' + util.inspect(records, false, null))
  return records
}

const getAllItems = () => {
  let allItemsResultSet = []
  let nikoActionsResultSet = nikoActions.chain().eqJoin(nikoLocations.chain(), 'location', 'id', function (el, er) {
    let item = {}
    item.provider = 'NHC'
    item.type = 'A'
    item.uid = 'NHC-A-' + el.id
    item.itemID = el.id
    item.itemName = el.name
    item.locationID = el.location
    item.locationName = er.name
    item.typeID = el.type
    item.value = el.value1
    return item
  }).data()
  allItemsResultSet = allItemsResultSet.concat(nikoActionsResultSet)
  // log.debug('persist nikoActionsResultSet: ' + nikoActionsResultSet)
  // log.debug('persist allItemsResultSet after actions: ' + util.inspect(allItemsResultSet, false, null))
  let nikoThermostatResultSet = nikoThermostat.chain().eqJoin(nikoLocations.chain(), 'location', 'id', (el, er) => {
    'use strict'
    let item = {}
    item.provider = 'NHC'
    item.uid = 'NHC-T-' + el.id
    item.type = 'T'
    item.itemID = el.id
    item.itemName = el.name
    item.locationID = el.location
    item.locationName = er.name
    item.typeID = el.type
    item.value = el.measured / 10
    return item
  }).data()
  allItemsResultSet = allItemsResultSet.concat(nikoThermostatResultSet)
  let genericItemResultSet = genericItem.find()
  log.debug('###################### ' + util.inspect(genericItemResultSet, false, null))
  allItemsResultSet = allItemsResultSet.concat(genericItemResultSet)
  // log.debug('persist allItemsResultSet after thermostat: ' + util.inspect(allItemsResultSet, false, null))
  let nikoEnergyRecords = nikoEnergy.find()
  let nikoEnergyResultSet = [{}]
  for (let i = 0; i < nikoEnergyRecords.length; i++) {
    let item = {}
    item.provider = 'NHC'
    item.uid = 'NHC-E-' + nikoEnergyRecords[i].channel
    item.type = 'E'
    item.itemID = nikoEnergyRecords[i].channel
    item.itemName = nikoEnergyRecords[i].name
    item.locationID = ''
    item.locationName = ''
    item.typeID = nikoEnergyRecords[i].type
    item.value = nikoEnergyRecords[i].live / 1000
    allItemsResultSet.push(item)
  }
  //allItemsFinalResultSet = allItemsResultSet.concat(nikoEnergyResultSet)
  // log.debug('persist allItemsResultSet after energies: ' + util.inspect(allItemsResultSet, false, null))
  return (stripResultsMetadata(allItemsResultSet))
}

const updateNikoAction = (nhcAction) => {
  // log.debug('persist updAct: ' + util.inspect(nhcAction, false, null))
  nikoActions.chain().find({ id: nhcAction.id }).update(function (obj) {
    obj.value1 = nhcAction.value1
  })
}

const updateNikoThermostat = (nhcThermostat) => {
  // log.debug('persist updAct: ' + util.inspect(nhcThermostat, false, null))
  nikoThermostat.chain().find({ id: nhcThermostat.id }).update(function (obj) {
    obj.measured = nhcThermostat.measured
    obj.setPoint = nhcThermostat.setPoint
  })
}

const updateNikoEnergy = (nhcEnergy) => {
  // log.debug('persist updAct: ' + util.inspect(nhcEnergy, false, null))
  nikoEnergy.chain().find({ channel: nhcEnergy.channel }).update(function (obj) {
    obj.live = nhcEnergy.v
  })
}
module.exports.initNhcActions = initNhcActions
module.exports.initNhcLocations = initNhcLocations
module.exports.initNhcEnergies = initNhcEnergies
module.exports.initNhcThermostats = initNhcThermostats
module.exports.getNikoAction = getNikoAction
module.exports.getNikoThermostat = getNikoThermostat
module.exports.getNikoEnergy = getNikoEnergy
module.exports.getAllItems = getAllItems
module.exports.updateNikoAction = updateNikoAction
module.exports.updateNikoThermostat = updateNikoThermostat
module.exports.updateNikoEnergy = updateNikoEnergy
module.exports.upsertGenericItem = upsertGenericItem
