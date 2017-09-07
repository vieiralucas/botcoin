const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client')
const axios = require('axios')
const express = require('express')
const cheerio = require('cheerio')

const rtm = new RtmClient(process.env.BOT_TOKEN)

let channel
const fetchBtcPrice = () =>
  axios
    .get('http://dolarhoje.com/bitcoin-hoje/#bitcoin=1,00')
    .then(({ data }) => data)
    .then(cheerio.load.bind(cheerio))
    .then($ => $('#conversao tbody tr'))
    .then(trs =>
      trs
        .map(function() {
          return cheerio(this)
            .children()
            .map(function() {
              return cheerio(this).text()
            })
            .get()
            .join(': ')
        })
        .get()
        .join('\n')
    )

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, ({ channels }) => {})

rtm.on(RTM_EVENTS.MESSAGE, message => {
  if (
    message.text &&
    message.text.indexOf &&
    message.text.indexOf('bitcoin') > -1
  ) {
    fetchBtcPrice()
      .then(btc => {
        rtm.sendMessage(
          [
            'According to http://dolarhoje.com/bitcoin-hoje/#bitcoin=1,00',
            btc,
          ].join('\n\n'),
          message.channel
        )
      })
      .catch(err => {
        console.error(err)
      })
  }
})

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {})

rtm.start()

const server = express()

server.get('/', (req, res) => {
  res.sendStatus(204)
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`express server listening at ${PORT}`)
})
