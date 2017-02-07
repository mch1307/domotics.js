/**
 * Created by michael on 2/2/2017.
 */

exports.register = (server, options, next) => {
  'use strict'
  const cfg = require('../conf/conf')
  const log = require('../lib/logger')
  const util = require('util')
  const persist = require('../lib/persist')
  server.route({
    method: 'POST',
    path: '/logitem',
    handler: (request, reply) => {
      const reqItem = JSON.parse(request.payload)
      let item ={}
      item.provider = reqItem.provider
      item.id = reqItem.id
      item.type = reqItem.type
      item.uid = item.provider + '-' + item.type + '-' + item.id
      item.value = reqItem.value
      persist.upsertGenericItem(item)
      return reply(cfg.genericItem).code(202)
      },
    config: {
      description: 'Get equipment creation/updates',
      notes: 'JSON payload',
      tags: ['api', 'logitem']
    }
  })
  next()
}
exports.register.attributes = {
  name: 'logitem'
}
