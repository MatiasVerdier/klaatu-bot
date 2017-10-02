require('dotenv').config()
const path = require('path')
const { CommandoClient } = require('discord.js-commando')
const firebaseApp = require('./firebaseApp')
const db = firebaseApp.database()

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
  db.ref(`/guilds/${guild.id}`).set({
    id: guild.id,
    name: guild.name,
    ownerID: guild.ownerID,
    iconURL: guild.iconURL,
    active: true
  })
})

bot.on('guildDelete', guild => {
  db.ref(`/guilds/${guild.id}`).update({
    active: false
  })
})

const generateXp = () => {
  const max = 25
  const min = 15
  return Math.floor(Math.random() * (max - min + 1) + min)
}

bot.on('message', async (message) => {
  const { author, guild, channel } = message
  const coolDownMiliseconds = 60 * 1000

  if (author.bot) return
  if (channel.type === 'dm') return

  try {
    const { lastMessage } = author
    const userRef = `/guilds/${guild.id}/users/${author.id}`
    const snapshot = await db.ref(userRef).once('value')
    const lastMessageTimestamp = snapshot.val() ? snapshot.val().lastMessageTimestamp : null
    const currentXp = snapshot.val().xp || 0

    if (!lastMessageTimestamp) {
      db.ref(userRef).update({
        lastMessageTimestamp: lastMessage.createdTimestamp,
        xp: 0
      })
    } else {
      if (lastMessage.createdTimestamp >= lastMessageTimestamp + coolDownMiliseconds) {
        // generate xp
        const xp = generateXp()

        // update user last message timestamp and xp
        db.ref(userRef).update({
          lastMessageTimestamp: lastMessage.createdTimestamp,
          xp: (currentXp + xp)
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
})

bot.login(process.env.DISCORD_TOKEN)
