'use strict'

/**
 * Logging feature for [lws](https://github.com/lwsjs/lws).
 * @module lws-log
 */

/**
 * @alias module:lws-log
 */
class Log {
  description () {
    return 'Log to the console or stats views.'
  }
  optionDefinitions () {
    return [{
      name: 'log.format',
      alias: 'f',
      type: String,
      description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny', 'stats', or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
    }]
  }

  /**
   * @param [options] {object}
   * @param [options.log.format] {string}
   * @emits log
   * @emits start
   */
  middleware (options) {
    const combinedFmt = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length]'
    let format = options.logFormat || combinedFmt

    if (format !== 'none') {
      const morgan = require('koa-morgan')

      const Writable = require('stream').Writable
      const logStream = new Writable()
      logStream._write = ((chunk, enc, done) => {
        this.view.write('log', chunk.toString('utf8').trim())
        done()
      })
      let stream = logStream

      /* logstalgia-specific output */
      if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        format = 'combined'
      }
      this.view.write('log.start', {})
      return morgan(format, { stream })
    } else {
      this.view.write('log.start', {})
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
