const { Command } = require('discord.js-commando')
const firebaseApp = require('../../firebaseApp')
const db = firebaseApp.database()

module.exports = class ThanksCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'thanks',
      memberName: 'thanks',
      group: 'profile',
      description: 'Send points when member say thanks to another user',
      throttling: {
        usages: 1,
        duration: 60
      },
      args: [
        {
          key: 'mention',
          label: 'mention',
          prompt: 'Mention at least 1 user',
          type: 'user'
        }
      ]
    })
  }

  run (msg, { mention }) {
    const { guild, author } = msg
    if (mention.id === author.id) return
    if (mention.bot) return

    const userRef = `/guilds/${guild.id}/users/${mention.id}`
    db.ref(userRef).once('value')
      .then(snapshot => {
        const prevPoints = snapshot.val() ? snapshot.val().points : 0
        db.ref(userRef).update({
          points: prevPoints + 1
        })

        return msg.channel.send(`${author.username} sends points to ${mention}`)
      })
      .catch(error => console.log(error))
  }
}
