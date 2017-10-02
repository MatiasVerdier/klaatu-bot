require('dotenv').config()
const path = require('path')
const { CommandoClient } = require('discord.js-commando')
const firebaseApp = require('./firebaseApp')

const bot = new CommandoClient({
  owner: process.env.SERVER_OWNER
})

bot.registry
  .registerDefaults()
  .registerGroups([
    ['fun', 'Comandos divertidos'],
    ['information', 'información de diversas fuentes'],
    ['settings', 'Comandos de configuración del servidor']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)

  firebaseApp.auth().signInWithEmailAndPassword(process.env.FIREBASE_BOT_EMAIL, process.env.FIREBASE_BOT_PASSWORD)
    .then(() => {
      console.log('firebase login')
    })
    .catch(error => console.log(error))
})

bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find('name', 'general')
  const server = member.guild.name
  if (!channel) return
  channel.send(`${member} Bienvenido/a a ${server}, espero que disfrutes junto a la comunidad`)
})

bot.on('guildCreate', guild => {
  firebaseApp.database().ref(`/guilds/${guild.id}`).set({
    id: guild.id,
    name: guild.name,
    ownerID: guild.ownerID,
    iconURL: guild.iconURL,
    active: true
  })
})

bot.on('guildDelete', guild => {
  firebaseApp.database().ref(`/guilds/${guild.id}`).update({
    active: false
  })
})

bot.login(process.env.DISCORD_TOKEN)
