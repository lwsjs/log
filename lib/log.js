'use strict'

class Log {
  optionDefinitions () {
    return {
      name: 'log.format',
      alias: 'f',
      type: String,
      description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
    }
  }
  middleware (options, localWebServer) {
    let format = options['log.format']

    if (options.verbose && !format) {
      format = 'none'
    }

    if (format !== 'none') {
      const morgan = require('koa-morgan')

      /* no format specified - print stats to terminal */
      if (!format) {
        const streamLogStats = require('stream-log-stats')
        options.stream = streamLogStats({ refreshRate: 500 })
        format = 'combined'

      /* logstalgia-specific output */
      } else if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        format = 'combined'

      } else {
        // const Writable = require('stream').Writable
        // const stream = new Writable()
        // stream._write = ((chunk, enc, done) => {
        //   localWebServer.view.write({ log: chunk.toString('utf8').trim() })
        //   done()
        // })
        // options.stream = stream
      }
      this.config = { format: format }
      return morgan(format, options)
    }
  }
}

module.exports = Log
