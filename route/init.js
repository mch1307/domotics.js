/**
 * Created by michael on 2/2/2017.
 */
exports.register = (server, options, next) => {
  'use strict'
  const cfg = require('../conf/conf.js')
  const Joi = require('joi')
  server.route({
    method: 'GET',
    path: '/init',
    config: {
      handler: function (request, reply) {
        return reply(server.plugins.db.getAllItems()).code(200)
      },
      description: 'Get list of all equipments',
      notes: 'Get a JSON list of all registered equipments',
      tags: ['api', 'init', 'list all'],
      response: {
        schema: Joi.array().items(cfg.genericItemSchemaOut)
      }
    }
  })
  next()
}
exports.register.attributes = {
  name: 'init'
}
