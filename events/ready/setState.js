const { ActivityType } = require('discord.js')

module.exports = (client) => {
  client.user.setActivity({
    name: '마비노기 하는 중',
    type: ActivityType.Playing
  })
}
