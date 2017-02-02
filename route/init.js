/**
 * Created by michael on 2/2/2017.
 */

exports.register = (server, options, next) => {
  'use strict'
  const persist = require('../lib/persist.js')
  server.route({
    method: 'GET',
    path: '/init',
    handler: function (request, reply) {
      return reply(persist.getAllItems())
    },
    config: {
      description: 'Get list of all equipments',
      notes: 'simply call /init to get a JSON list of all equipments',
      tags: ['api', 'init', 'list all']
    }
  })
  next()
}
exports.register.attributes = {
  name: 'init'
}
