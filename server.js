'use strict'

const config = require('./conf/conf')
const log = require('./lib/logger')
const Hapi = require('hapi')
// plugins
const Blipp = require('blipp')
const HapiSwagger = require('hapi-swagger')
const Inert = require('inert')
const Vision = require('vision')
const Nes = require('nes')
const Init = require('./route/init')
const NhCmd = require('./route/nhcmd')
const LogItem = require('./route/logitem')
const Nhc = require('./plugins/nhc')
const Db = require('./plugins/db')

const options = {
  info: {
    'title': 'domotics.js API documentation'
  }
}

// Checking mandatory variables are defined
if (config.NHC.host === undefined) {
  log.error('fatal error: NHCHOST not defined')
  throw new Error('fatal error: NHCHOST not defined')
}
// Hapi
// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  port: config.DAEMON.listen
})

// register routes/plugins and start server
server.register([
  { register: Nes, options: { auth: { type: 'direct' } } },
  { register: HapiSwagger, options: options },
  Db, NhCmd, Init, Blipp, Inert, Vision, LogItem, Nhc], (err) => {
  if (err) {
    throw err
  }
  log.debug('server after cmd route ##################')
  server.subscription('/events')
  log.debug('server subscription ##################')
  server.start((err) => {
    if (err) {
      throw err
    }
    // server.methods.nhc.listen()
    console.info('Server started at: ' + server.info.uri)
  })
})
