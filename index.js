/**
 * Logging feature for [lws](https://github.com/lwsjs/lws).
 * @module lws-log
 */

/**
 * @alias module:lws-log
 */
class Log {
  description () {
    return 'Outputs an access log or stats view to the console.'
  }
  optionDefinitions () {
    return [{
      name: 'log.format',
      alias: 'f',
      type: String,
      description: "Possible values: 'stats', 'logstalgia' or anything defined by https://github.com/expressjs/morgan, typically 'dev', 'combined', 'short', 'tiny' or a custom format (e.g. ':method -> :url')"
    }]
  }

  /**
   * @param [options] {object}
   * @param [options.log.format] {string}
   * @emits log
   * @emits start
   */
  middleware (options) {
    this.view.write('log-start', options)
    let format = options.logFormat || 'none'

    if (format !== 'none') {
      const morgan = require('koa-morgan')
      let stream

      if (format === 'stats') {
        const streamLogStats = require('stream-log-stats')
        stream = streamLogStats({ refreshRate: 500 })
        format = 'combined'

      /* logstalgia-specific output */
      } else if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        format = 'combined'
      }
      this.view.write('log-start', options)
      return morgan(format, { stream })
    }
  }
}

function clf (log) {
  const re = /([^ ]*) ([^ ]*) ([^ ]*) \[([^\]]*)\] "([^"]*)" ([^ ]*) ([^ ]*)/;
  const matches = log.match(re);
  if (matches){
    return {
      remoteHost: matches[1],
      remoteLogName: matches[2],
      authUser: matches[3],
      date: new Date(matches[4]),
      request: matches[5],
      status: Number(matches[6]),
      bytes: Number(matches[7]) || 0
    }
  }
}

module.exports = Log
