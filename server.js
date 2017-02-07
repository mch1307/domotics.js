'use strict'

const config = require('./conf/conf')
const log = require('./lib/logger')
const Hapi = require('hapi')
const nhc = require('./lib/nhcinit')
// plugins
const Blipp = require('blipp')
const HapiSwagger = require('hapi-swagger')
const Inert = require('inert')
const Vision = require('vision')
const Nes = require('nes')
const NhcListen = require('./route/nhclistener')
const Init = require('./route/init')
const NhCmd = require('./route/nhcmd')

const options ={
  info: {
    'title': 'domotics.js API documentation'
  }
}

// Checking mandatory variables are defined
if (config.NHC.host === undefined) {
  log.error('fatal error: NHCHOST not defined')
  throw new Error('fatal error: NHCHOST not defined')
}

// Initialize loki internal db with Niko data
nhc.initNhc()

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
  Init, NhcListen, NhCmd, Blipp, Inert, Vision], (err) => {
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
    server.methods.nhc.listen()
    console.info('Server started at: ' + server.info.uri)
  })
})
