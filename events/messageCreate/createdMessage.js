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
            const originMessage = messages.find(message => message.author.id === botId && message.channelId === message.id)
            if (typeof originMessage === typeof undefined) {
              return
            }
            const participants = []
            messages.forEach(getMessage => {
              // 작성한 글이 파티채널내 채널아이디와 다르면 작업하지 않음
              if (getMessage.channelId === createdMessageChannelId) {
                const author = getMessage.author
                // 글의 작성자가 봇이 아니면 작업하지 않음
                if (author.id === botId) {
                  return
                }
                // 맨션된 유저가 봇이 아니면 작업하지 않음
                const mentionedUser = getMessage.mentions.users.find(mentionedUser => mentionedUser.id === botId && mentionedUser.bot)
                if (typeof mentionedUser === typeof undefined) {
                  return
                }
                // 맨션한 사람을 참여자로 등록
                participants.push(author.id)
              }
            })

            for (const participant of participants) {
              if (!originMessage.content.includes(participant)) {
                let content = originMessage.content
                content += `\n - <@${participant}>`
                originMessage.edit({ content }).then(updatedThread => {
                  console.log('updated', updatedThread)
                }).catch(console.error)
              }
            }
          })
        })
      }
    }
  }
}
