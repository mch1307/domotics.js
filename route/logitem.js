/**
 * Created by michael on 2/2/2017.
 */

exports.register = (server, options, next) => {
  'use strict'
  const cfg = require('../conf/conf')
  const log = require('../lib/logger')
  const util = require('util')
  const Joi = require('joi')
  const persist = require('../lib/persist')
  const Boom = require('boom')

  server.route({
    method: 'POST',
    path: '/logitem',
    config: {
      handler: (request, reply) => {
        //log.debug('logitems route: ' + util.inspect(request.payload, false, null))
        const reqItem = request.payload
        let item = {}
        item.provider = reqItem.provider
        item.itemID = reqItem.itemID
        item.type = reqItem.type
        item.uid = item.provider + '-' + item.type + '-' + item.itemID
        item.value = reqItem.value
        item.itemName = reqItem.itemName
        persist.upsertGenericItem(item)
        return reply().code(200)
      },
      description: 'Create or update Generic equipment',
      // notes: 'http get in /init to get a JSON list of all equipments',
      tags: ['api', 'logitem', 'upsert'],
      validate: {
        payload: cfg.genericItemSchemaIn
      }
    }
  })
  next()
}
exports.register.attributes = {
  name: 'logitem'
}
