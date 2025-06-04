const guildModule = require('../../modules/getGuildInfo')
const fs = require('fs')
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
        let userMessageCounts = {};
        // 파일에서 데이터 불러오기
        if (fs.existsSync('./static/json/userMessageCount.json')) {
          userMessageCounts = JSON.parse(fs.readFileSync('./static/json/userMessageCount.json'));
        }

        // 길드별로 데이터 구조 생성
        if (!userMessageCounts[guildId]) {
          userMessageCounts[guildId] = {};
        }

        const userId = message.author.id;
        userMessageCounts[guildId][userId] = (userMessageCounts[guildId][userId] || 0) + 1;
        // 변경된 데이터 저장
        fs.writeFileSync('./static/json/userMessageCount.json', JSON.stringify(userMessageCounts, null, 2));

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
