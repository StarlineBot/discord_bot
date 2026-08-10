const registry = require('../../modules/guildRegistry')
const { developerId } = require('../../config/bot')

// 봇이 새 서버에 합류하면 신원 자동 등록 + 제작자에게 DM 알림.
module.exports = async (guild, client) => {
  registry.upsert(guild.id, { ownerId: guild.ownerId, name: guild.name })
  console.log(`새 길드 등록: ${guild.name} (${guild.id})`)

  if (!developerId) return
  try {
    const dev = await client.users.fetch(developerId)
    await dev.send(
      `🆕 새 서버에 섯다라인 설치됨\n서버: **${guild.name}** (${guild.id})\n오너: <@${guild.ownerId}>\n멤버수: ${guild.memberCount ?? '?'}\n\n오너가 \`/섯다라인설정\`으로 기능을 켜면 동작해요~`)
  } catch (e) { /* DM 막힘/조회 실패 무시 */ }
}
