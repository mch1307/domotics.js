const path = require('path')
const cfg = {}

cfg.NHC = {}
cfg.DAEMON = {}
cfg.DAEMON.logFile = path.join(__dirname, '../log/jeedom-nhc.log')
cfg.DAEMON.logLevel = process.env.LOGLEVEL || 'DEBUG'
cfg.DAEMON.listen = process.env.LISTEN || 9101
cfg.DAEMON.notifyRootURL = 'http://localhost:9100'
cfg.DAEMON.notifyPath = '/event'
cfg.NHC.host = process.env.NHCHOST || 'nhc.cs.home'
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

module.exports = cfg
