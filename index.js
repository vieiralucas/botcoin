const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client')
const axios = require('axios')
const express = require('express')

const rtm = new RtmClient(process.env.BOT_TOKEN)

let channel

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, ({ channels }) => {})

rtm.on(RTM_EVENTS.MESSAGE, message => {
  if (message.text.indexOf('bitcoin') > -1) {
    axios
      .get('https://blockchain.info/pt/ticker')
      .then(({ data }) => data)
      .then(({ BRL }) => {
        const { symbol, buy, sell } = BRL
        rtm.sendMessage(
          `According to blockchain.info: buy: ${symbol}${buy}, sell: ${symbol}${sell}`,
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
