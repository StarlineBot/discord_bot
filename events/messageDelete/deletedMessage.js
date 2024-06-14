const guildModule = require('../../modules/getGuildInfo')
const botId = process.env.BOT_ID
module.exports = async (message, client) => {
  // 봇이 작성하지 않은 글에만 반응 해야함
  if (!message.author.bot) {
    // 이 메세지가 생성된 채널아이디
    const createdMessageChannelId = message.channelId
    // 길드에서 사용하기 떄문에 길드아이디가 없으면 작업하지 않음
    if (message.guildId !== null) {
      const guildId = message.guildId
      const guildInfo = guildModule.getGuildInfo(guildId)
      // 마찬가지로 길드정보가 없으면 작업하지 않음
      if (typeof guildInfo !== typeof undefined) {
        const partyChannel = client.channels.cache.get(guildInfo.partyChannelId)
        partyChannel.threads.cache.forEach(thread => {
          thread.messages.fetch().then(messages => {
            const originMessage = messages.get(createdMessageChannelId)
            if (typeof originMessage === typeof undefined) {
              return
            }
            if (!originMessage.author.bot) {
              return
            }
            const isBotMention = typeof message.mentions.users.find(member => member.id === botId && member.bot) !== typeof undefined
            if (!isBotMention) {
              return
            }
            const findIndex = originMessage.content.lastIndexOf('현재 참가인원')
            let content = originMessage.content.substring(0, findIndex + '현재 참가인원'.length)
            const members = originMessage.content.substring(findIndex + '현재 참가인원'.length, message.length).replaceAll(' ', '').split('-')
            const participants = []
            for (const member of members) {
              const memberId = member.replace(/\D/g, '')
              if (memberId !== '') {
                participants.push(memberId)
              }
            }
            const removeIndex = participants.indexOf(message.author.id)
            participants.splice(removeIndex, 1)
            for (const participant of participants) {
              content += `\n - <@${participant}>`
            }
            originMessage.edit({ content }).then(updatedThread => {
              console.log('updated', updatedThread)
            }).catch(console.error)
          })
        })
      }
    }
  }
}
