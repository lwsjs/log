const Tom = require('test-runner').Tom
const Log = require('./')
const Lws = require('lws')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('log')

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = Lws.create({ port, stack: Log, logFormat: 'combined' })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
})
