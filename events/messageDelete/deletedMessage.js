const guildModule = require('../../modules/getGuildInfo')
const botId = process.env.BOT_ID

module.exports = async (message, client) => {
  // 봇이 작성하지 않은 글에만 반응, 길드에서 사용하기 때문에 길드 아이디가 없으면 작업하지 않음
  if (message.author.bot || !message.guildId) return

  const guildId = message.guildId
  const guildInfo = guildModule.getGuildInfo(guildId)
  // 마찬가지로 길드정보가 없으면 작업하지 않음
  if (!guildInfo) return

  const partyChannel = client.channels.cache.get(guildInfo.partyChannelId)
  if (!partyChannel) return

  const threads = [...partyChannel.threads.cache.values()]

  await Promise.allSettled(
    threads.map(async (thread) => {
      try {
        const messages = await thread.messages.fetch({
          limit: 100
        })
        const originMessage = messages.get(message.channelId)

        // 원래 메세지가 없거나 봇이 작성한게 아니면 작업하지 않음
        if (!originMessage || !originMessage.author.bot) return

        // 맨션으로 봇을 지칭해야함
        const isBotMentioned = message.mentions.users.some(
          (user) => user.id === botId && user.bot
        )
        if (!isBotMentioned) return

        const updatedContent = buildUpdatedContent(originMessage.content, message.author.id)
        if (!updatedContent) return

        await originMessage.edit({ content: updatedContent })
        console.log(`✅ Updated message in thread: ${thread.id}`)
      } catch (err) {
        console.error(`❌ Error updating thread ${thread.id}:`, err)
      }
    })
  )
}

function buildUpdatedContent (originalContent, userIdToRemove) {
  const marker = '현재 참가인원'
  const markerIndex = originalContent.lastIndexOf(marker)
  if (markerIndex === -1) return null

  const header = originalContent.slice(0, markerIndex + marker.length)
  const memberListText = originalContent.slice(markerIndex + marker.length)

  const participants = extractUserIds(memberListText).filter(id => id !== userIdToRemove)

  const lines = participants.map(id => `\n - <@${id}>`).join('')
  return header + lines
}

function extractUserIds (text) {
  return text
    .split('-')
    .map(segment => segment.replace(/\D/g, '')) // 숫자만 추출
    .filter(Boolean) // 빈 문자열 제거
}
