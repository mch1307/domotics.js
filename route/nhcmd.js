/**
 * Created by michael on 2/2/2017.
 */

exports.register = (server, options, next) => {
  'use strict'
  const cfg = require('../conf/conf')
  const log = require('../lib/logger')
  const Joi = require('joi')
  const Boom = require('boom')

  server.dependency(['db'])

  server.route({
    method: 'PUT',
    path: '/cmd',
    config: {
      handler: (request, reply) => {
        let params = request.query
      // split uid to get provider and itemID
        let splitUid = params.uid.split('-')
        if (splitUid[0].toUpperCase() === 'NHC' && splitUid[1].toUpperCase() === 'A') { // Provider
          let actionCmd = cfg.NHC.cmd
          actionCmd.cmd = 'executeactions'
          actionCmd.id = splitUid[2]
          actionCmd.value1 = params.value
          server.plugins.nhc.sendCmd(JSON.stringify(actionCmd))
          return reply().code(204)
        } else { return reply(Boom.notImplemented('Equipment does not support command')) }
      },
      description: 'Send command to provider',
      notes: 'usage: /cmd?uid=xxx&value=y' +
      'where xxx is the item UID and value its numeric value',
      tags: ['api', 'cmd', 'command'],
      validate: {
        query: {
          uid: Joi.string().regex(/^[A-Z0-9]{3}-[A-Z]{1}-[0-9]{1,}/).required(),
          value: Joi.number().required()
        }
      }
    }
  })
  next()
}
exports.register.attributes = {
  name: 'cmd'
}
