const { Command } = require('discord.js-commando')
const axios = require('axios')
const WIKIPEDIA_API_ROOT = 'https://es.wikipedia.org'

module.exports = class Wikipedia extends Command {
  constructor (client) {
    super(client, {
      name: 'wikipedia',
      group: 'information',
      memberName: 'wikipedia',
      description: 'Obtener primer resultado de busqueda en wikipedia',
      args: [
        {
          key: 'search',
          prompt: 'Debes ingresar un termino de búsqueda',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, {search}) {
    try {
      let response = await axios.get(`${WIKIPEDIA_API_ROOT}/w/api.php`, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: search,
          srlimit: 1,
          format: 'json'
        }
      })

      const searchData = response.data.query.search
      const reply = searchData.length ? `${WIKIPEDIA_API_ROOT}/?curid=${searchData[0].pageid}` : 'No se encontro ningun resultado'
      return msg.channel.send(reply)
    } catch (error) {
      console.log(error)
    }
  }
}
