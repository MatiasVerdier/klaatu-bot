const { Command } = require('discord.js-commando')
const axios = require('axios')
const GIPHY_API_ROOT = 'https://api.giphy.com'
const firebaseApp = require('../../firebaseApp')

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
          prompt: 'Debes ingresar un término de búsqueda',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, {search}) {
    const { guild } = msg.channel

    try {
      const response = await axios.get(`${GIPHY_API_ROOT}/v1/gifs/search`, {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: search,
          limit: 1
        }
      })

      const gifData = response.data.data[0]
      const reply = gifData ? gifData.embed_url : 'No se encontró ningún gif :( '

      firebaseApp.database().ref(`/guilds/${guild.id}/gifs`).push({
        search,
        timestamp: new Date().getTime(),
        reply
      })

      return msg.channel.send(reply)
    } catch (error) {
      console.log(error)
    }
  }
}
