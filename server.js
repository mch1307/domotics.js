'use strict'
const config = require('./conf/conf')
const log = require('./lib/logger')
const nhc = require('./lib/nhc')
const Hapi = require('hapi')
const init = require('./route/init')
const cmd = require('./route/cmd')
// const Nes = require('nes')

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
  host: 'localhost',
  port: config.DAEMON.listen
})

// register routes and start server
server.register([init, cmd], (err) => {
  if (err) {
    throw err
  }
  server.start(function () {
    console.info('Server started at: ' + server.info.uri)
  })
})
