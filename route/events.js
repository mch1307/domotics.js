/**
 * Created by michael on 2/2/2017.
 */
'use strict'

exports.register = function (server, options, next) {
  server.method('db.setupChangefeedPush', () => {
    r.db(db).table(entriesTable).changes().run(conn, (err, cursor) => {
      cursor.each((err, item) => {
        server.publish('/timeline/updates', item.new_val)
      })
    })
  }, {
    callback: false
  })
}

exports.register.attributes = {
  name: 'events'
}
