require('dotenv').config()
const path = require('path')
const { CommandoClient } = require('discord.js-commando')

const bot = new CommandoClient({
  owner: process.env.SERVER_OWNER
})

bot.registry
  .registerDefaults()
  .registerGroups([
    ['fun', 'Comandos divertidos'],
    ['information', 'información de diversas fuentes'],
    ['services', 'Comandos para usar servicios externos']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)

  bot.generateInvite(['ADMINISTRATOR'])
    .then(link => {
      console.log(`Generated bot invite link: ${link}`)
    })
    .catch(e => console.log(e.stack))
})

bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find('name', 'general')
  const server = member.guild.name
  if (!channel) return
  channel.send(`${member} Bienvenido/a a ${server}, espero que disfrutes junto a la comunidad`)
})

bot.login(process.env.DISCORD_TOKEN)
