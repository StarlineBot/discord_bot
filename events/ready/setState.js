const { ActivityType } = require('discord.js')

module.exports = (client) => {
  client.user.setActivity({
    name: '섯다라인😎 마비노기',
    type: ActivityType.Playing
  })
}
