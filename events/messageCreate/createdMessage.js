const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const { updateUserMessageCount } = require('../../modules/RankingUtil')
const { extractField } = require('../../modules/common')
const botId = process.env.BOT_ID

// 던전별 최대 파티 인원(파티장 포함). 모바출이어도 이 수까지만 참가 가능.
const DUNGEON_MAX = { 탈라가흐: 4, 크롬바스심연: 4, 브리레흐: 8, 믿음의균열: 8 }
const DEFAULT_MAX = 8
function dungeonMax (dungeonStr) {
  for (const [name, max] of Object.entries(DUNGEON_MAX)) {
    if (dungeonStr && dungeonStr.includes(name)) return max
  }
  return DEFAULT_MAX
}

module.exports = async (message, client) => {
  // 메세지 작성자가 봇이거나 길드아이디가 없으면 작업하지 않음
  if (message.author.bot || !message.guildId) return

  const guildId = message.guildId
  const userId = message.author.id

  // 랭킹 집계 실패가 메시지 처리(및 봇 전체)를 죽이지 않도록 격리
  try {
    updateUserMessageCount(guildId, userId, true)
  } catch (err) {
    console.error('❌ updateUserMessageCount 실패:', err)
  }

  try {
    // 파티모집 채널(설정 우선 → 옛 config 폴백)
    const guildInfo = guildModule.getGuildInfo(guildId)
    const partyChannelId = settings.get(guildId, 'partyChannelId', null) || (guildInfo && guildInfo.partyChannelId)
    if (!partyChannelId) return

    // 파티모집 포럼 스레드에서 '봇 멘션'으로 참가신청한 경우만 처리
    const thread = message.channel
    if (!thread || thread.parentId !== partyChannelId) return
    if (!message.mentions || !message.mentions.users.some(u => u.id === botId && u.bot)) return

    const messages = await thread.messages.fetch({ limit: 100 }).catch(() => null)
    if (!messages) return
    // 스레드 시작 메시지(= 글 본문, channelId===id). 참가인원·모집인원이 여기 들어있음
    const originMessage = messages.find(msg => msg.author.id === botId && msg.channelId === msg.id)
    if (!originMessage) return

    // 현재 참가자(파티장 포함) — '현재 참가인원' 마커 이후의 멘션들
    const marker = '현재 참가인원'
    const idx = originMessage.content.lastIndexOf(marker)
    const section = idx >= 0 ? originMessage.content.slice(idx + marker.length) : ''
    const currentIds = [...section.matchAll(/<@!?(\d+)>/g)].map(m => m[1])
    if (currentIds.includes(userId)) return // 이미 참가중이면 무시

    // 캡 = 모집인원(파티장 포함)이되 던전 최대로 클램프. 모바출(0)도 던전 최대까지만.
    const max = dungeonMax(extractField(originMessage.content, '모집던전') || '')
    const recruitRaw = extractField(originMessage.content, '모집인원')
    const recruit = recruitRaw ? (parseInt(recruitRaw, 10) || 0) : 0
    const cap = recruit > 0 ? Math.min(recruit, max) : max

    if (currentIds.length >= cap) {
      // 꽉 참 → 멘션 메시지를 삭제해 '참가인원↔멘션' 불변식 유지 + 안내(8초 후 자동삭제)
      await message.delete().catch(() => {})
      const warn = await thread.send(`<@${userId}> 파티가 이미 꽉 찼어요(${cap}명)~ 참가 신청이 취소됐어 🙏`).catch(() => null)
      if (warn) setTimeout(() => warn.delete().catch(() => {}), 8000)
      return
    }

    await originMessage.edit({ content: originMessage.content + `\n - <@${userId}>` }).catch(() => {})
  } catch (err) {
    console.error('❌ 파티 참가 처리 실패:', err.message)
  }
}
