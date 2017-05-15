'use strict'
const EventEmitter = require('events')

/**
 * Logging feature for [lws](https://github.com/lwsjs/lws).
 * @module lws-log
 */

/**
 * @alias module:lws-log
 */
class Log extends EventEmitter {
  optionDefinitions () {
    return {
      name: 'log.format',
      alias: 'f',
      type: String,
      description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny', 'stats', or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
    }
  }

  /**
   * @param [options] {object}
   * @param [options.log.format] {string}
   * @emits log
   * @emits start 
   */
  middleware (options) {
    let format = options['log.format'] || 'stats'

    if (options.verbose && format === 'stats') {
      format = 'dev'
    }
    if (format !== 'none') {
      const morgan = require('koa-morgan')

      const Writable = require('stream').Writable
      const logStream = new Writable()
      logStream._write = ((chunk, enc, done) => {
        this.emit('log', chunk.toString('utf8').trim() + '\n')
        done()
      })
      let stream = logStream

      /* no format specified - print stats to terminal */
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
      this.emit('start', { format, stream })
      return morgan(format, { stream })
    } else {
      this.emit('start', {})
    }
  }
}

module.exports = Log
