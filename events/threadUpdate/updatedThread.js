const guildModule = require('../../modules/getGuildInfo')
module.exports = (oldThread, newThread) => {
  if (oldThread.ownerId !== process.env.BOT_ID) {
    return
  }
  if (oldThread.guildId !== null) {
    const guildId = oldThread.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    if (typeof guildInfo !== typeof undefined) {
      // 제목이 달라지면.. 보통 날짜를 수정함
      if (oldThread.name !== newThread.name) {
        console.log(newThread.name)
      }
    }
  }
}
