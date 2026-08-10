const registry = require('../../modules/guildRegistry')
const { developerId } = require('../../config/bot')

// 봇이 서버에서 제거/추방되면 레지스트리에서 정리 + 제작자에게 DM.
module.exports = async (guild, client) => {
  registry.remove(guild.id)
  console.log(`길드 제거: ${guild.name ?? guild.id} (${guild.id})`)

  if (!developerId) return
  try {
    const dev = await client.users.fetch(developerId)
    await dev.send(`👋 서버에서 제거됨: **${guild.name ?? guild.id}** (${guild.id})`)
  } catch (e) { /* DM 막힘/조회 실패 무시 */ }
}
