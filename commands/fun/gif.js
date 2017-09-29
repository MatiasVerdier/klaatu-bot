const { Command } = require('discord.js-commando')
const axios = require('axios')
const GIPHY_API_ROOT = 'https://api.giphy.com'

module.exports = class Gif extends Command {
  constructor (client) {
    super(client, {
      name: 'gif',
      group: 'fun',
      memberName: 'gif',
      description: 'Obtener un gif',
      args: [
        {
          key: 'search',
          prompt: 'Debes ingresasar un termino de búsqueda',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, {search}) {
    try {
      const response = await axios.get(`${GIPHY_API_ROOT}/v1/gifs/search`, {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: search,
          limit: 1
        }
      })

      const gifData = response.data.data[0]
      return msg.channel.send(gifData ? gifData.embed_url : 'No se encontro ningun gif')
    } catch (error) {
      console.log(error)
    }
  }
}
