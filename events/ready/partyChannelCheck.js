const settings = require('../../modules/guildSettings')
const { developerId } = require('../../config/bot')
const { partyChannelIdOf, isWrongType } = require('../../modules/partyChannel')

// 봇 시작 시: 파티모집을 켰는데 채널이 포럼이 아닌(예전 설정이 텍스트 채널을 받던 시절) 서버를 제작자에게 DM.
// 같은 서버·같은 채널은 한 번만 알린다(partyWrongTypeNotified = 알린 채널 ID). 배포마다 재시작해도 반복 안 됨.
module.exports = async (client) => {
  if (!developerId) return
  const found = []
  for (const guild of client.guilds.cache.values()) {
    if (!settings.get(guild.id, 'partyRecruitEnabled', false) || !isWrongType(guild)) continue
    const channelId = partyChannelIdOf(guild.id)
    if (settings.get(guild.id, 'partyWrongTypeNotified', null) === channelId) continue
    found.push({ guild, channelId })
  }
  if (!found.length) return
  try {
    const dev = await client.users.fetch(developerId)
    const lines = found.map(({ guild, channelId }) => `• **${guild.name}** (서버장 <@${guild.ownerId}>) — <#${channelId}>`)
    await dev.send({
      content: '⚠️ **파티모집 채널이 포럼이 아닌 서버** (켜져 있지만 동작 안 함)\n' + lines.join('\n') +
        '\n-# 이 서버들은 /섯다라인설정 목록에 경고가 뜨고, /파티모집 을 치면 포럼으로 다시 지정하라는 안내가 나가요. 같은 설정은 다시 알리지 않아요.',
      allowedMentions: { parse: [] }
    })
    for (const { guild, channelId } of found) settings.set(guild.id, 'partyWrongTypeNotified', channelId)
  } catch (e) {
    console.error('[파티모집 채널 점검] 제작자 DM 실패:', e.message)
  }
}
