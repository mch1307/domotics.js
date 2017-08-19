const path = require('path')
const Joi = require('joi')
const cfg = {}

cfg.NHC = {}
cfg.DAEMON = {}
cfg.DAEMON.logFile = path.join(__dirname, '../log/jeedom-nhc.log')
cfg.DAEMON.logLevel = process.env.LOGLEVEL || 'DEBUG'
cfg.DAEMON.listen = process.env.LISTEN || 9101
cfg.DAEMON.notifyRootURL = 'http://localhost:9100'
cfg.DAEMON.notifyPath = '/event'
cfg.NHC.host = process.env.NHCHOST || 'nhc.csnet.me'
cfg.NHC.port = process.env.NHCPORT || 8000
cfg.NHC.keepAlive = process.env.NHCKEEPALIVE || 60000
cfg.NHC.registerMsg = '{"cmd":"startevents"}'
cfg.NHC.equMsg = '{"cmd":"listactions"}'
cfg.NHC.locMsg = '{"cmd":"listlocations"}'
cfg.NHC.listThermoMsg = '{"cmd":"listthermostat"}'
cfg.NHC.listEnergyMsg = '{"cmd":"listenergy"}'
cfg.NHC.cmd = {
  cmd: '',
  id: '',
  value1: ''}
cfg.genericItemSchemaOut = Joi.object({
  uid: Joi.string().regex(/^[A-Z0-9]{3}-[A-Z]{1}-[0-9]{1,}/).required(),
  // Joi.string().min(7).max(11).required()
  provider: Joi.string().uppercase().length(3).required(),
  itemID: Joi.number().required(),
  typeID: Joi.number(),
  type: Joi.string().length(1),
  itemName: Joi.string().min(1).max(60).required(),
  value: Joi.number().required(),
  locationID: Joi.any().optional(),
  locationName: Joi.any().optional()
})
cfg.genericItemSchemaIn = Joi.object().keys({
  // uid: Joi.string().regex(/^[A-Z0-9]{3}-[A-Z]{1}-[0-9]{1,}/).required(),
  // Joi.string().min(7).max(11).required()
  provider: Joi.string().length(3).required(),
  itemID: Joi.number().required(),
  typeID: Joi.number().optional(),
  type: Joi.string().uppercase().length(1).required(),
  itemName: Joi.string().min(1).max(60).required(),
  value: Joi.number().required(),
  locationID: Joi.any().optional(),
  locationName: Joi.any().optional()
})
module.exports = cfg
