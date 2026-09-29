const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const { updateUserMessageCount } = require('../../modules/RankingUtil')
const botId = process.env.BOT_ID

module.exports = async (message, client) => {
  // 메세지 작성자가 봇이거나 길드아이디가 없으면 작업하지 않음
  if (message.author.bot || !message.guildId) return

  const guildId = message.guildId
  const userId = message.author.id
  const createdMessageChannelId = message.channelId
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return

  // 랭킹 집계 실패가 메시지 처리(및 봇 전체)를 죽이지 않도록 격리
  try {
    updateUserMessageCount(guildId, userId, true)
  } catch (err) {
    console.error('❌ updateUserMessageCount 실패:', err)
  }

  // 파티모집 채널은 /섯다라인설정(guildSettings)에서 관리 → 설정 우선, 옛 config로 폴백
  const partyChannelId = settings.get(guildId, 'partyChannelId', null) || guildInfo.partyChannelId
  const partyChannel = partyChannelId && client.channels.cache.get(partyChannelId)
  if (!partyChannel) return

  const threads = [...partyChannel.threads.cache.values()]

  await Promise.allSettled(
    threads.map(async (thread) => {
      try {
        const messages = await thread.messages.fetch({
          limit: 100
        })

        const originMessage = messages.find(msg => msg.author.id === botId && msg.channelId === msg.id)
        if (!originMessage) return

        const participants = getParticipants(messages, createdMessageChannelId)
        const newMentions = participants.filter(id => !originMessage.content.includes(id))

        if (newMentions.length > 0) {
          const newContent = originMessage.content + newMentions.map(id => `\n - <@${id}>`).join('')
          await originMessage.edit({ content: newContent })
          console.log(`✅ Updated message in thread: ${thread.id}`)
        }
      } catch (err) {
        console.error(`❌ Error updating thread ${thread.id}:`, err)
      }
    })
  )
}

function getParticipants (messages, targetChannelId) {
  const participants = []

  for (const msg of messages.values()) {
    if (msg.channelId !== targetChannelId || msg.author.id === botId) continue

    const mentionedBot = msg.mentions.users.find(user => user.id === botId && user.bot)
    if (mentionedBot) {
      participants.push(msg.author.id)
    }
  }

  return participants
}
