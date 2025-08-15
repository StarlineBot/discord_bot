const guildModule = require('../../modules/getGuildInfo')
const fs = require('fs')
const botId = process.env.BOT_ID

module.exports = async (message, client) => {
  // 메세지 작성자가 봇이거나 길드아이디가 없으면 작업하지 않음
  if (message.author.bot || !message.guildId) return

  const guildId = message.guildId
  const userId = message.author.id
  const createdMessageChannelId = message.channelId
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return

  updateUserMessageCount(guildId, userId)

  const partyChannel = client.channels.cache.get(guildInfo.partyChannelId)
  if (!partyChannel) return

  const threads = [...partyChannel.threads.cache.values()]

  await Promise.allSettled(
    threads.map(async (thread) => {
      try {
        const messages = await thread.messages.fetch({
          limit: 100
        })
        console.log(messages)

        const originMessage = messages.find(msg =>
        {
          console.log((msg.author.id === botId), msg.author.id)
          console.log((msg.channelId === msg.id), msg.id)
          return msg.author.id === botId && msg.channelId === msg.id
        }

        )
        console.log('??오는거야?')
        if (!originMessage) return
        console.log('??오는거야??')

        const participants = getParticipants(messages, createdMessageChannelId)
        const newMentions = participants.filter(id => !originMessage.content.includes(id))

        console.log(participants)
        console.log(newMentions)
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

function updateUserMessageCount (guildId, userId) {
  const filePath = './static/json/userMessageCount.json'
  let userMessageCounts = {}

  if (fs.existsSync(filePath)) {
    userMessageCounts = JSON.parse(fs.readFileSync(filePath))
  }

  if (!userMessageCounts[guildId]) {
    userMessageCounts[guildId] = {}
  }

  userMessageCounts[guildId][userId] = (userMessageCounts[guildId][userId] || 0) + 1
  fs.writeFileSync(filePath, JSON.stringify(userMessageCounts, null, 2))
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
