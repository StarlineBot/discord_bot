const { ActivityType } = require('discord.js')

module.exports = (client) => {
  client.user.setActivity({
    name: '마비노기',
    type: ActivityType.Playing
  })
}
