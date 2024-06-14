const guildModule = require('../../modules/getGuildInfo')

// 슬래시커맨드를 삭제하고 다시 시작해야 할때
const isDelete = false
module.exports = async (client) => {
  console.log(`server: ${process.env.NODE_ENV}, ${client.user.tag} is online!`)

  if (isDelete) {
    const fetchSlash = await client.application.commands.fetch()

    await Promise.all(fetchSlash.map(async slash => {
      await client.application.commands.delete(slash.id)
    }))
  }

  await client.guilds.cache.forEach(guild => {
    guild.members.fetch()
  })

  client.guilds.cache.forEach(guild => {
    const guildInfo = guildModule.getGuildInfo(guild.id)
    if (typeof guildInfo === typeof undefined) {
      return
    }
    // 길드별로 해야할일이 있을때
    console.log(guildInfo)
  })
}
