'use strict'

class Log {
  optionDefinitions () {
    return {
      name: 'log-format',
      alias: 'f',
      type: String,
      description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
    }
  }
  middleware (options) {
    const format = options['log-format']

    if (options.verbose && !format) {
      format = 'none'
    }

    if (format !== 'none') {
      const morgan = require('koa-morgan')

      if (!format) {
        const streamLogStats = require('stream-log-stats')
        options.stream = streamLogStats({ refreshRate: 500 })
        console.error(require('util').inspect(options, { depth: 1, colors: true }))
        return morgan('common', options)
      } else if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        return morgan('combined', options)
      } else {
        return morgan(format, options)
      }
    }
  }
}

module.exports = Log
