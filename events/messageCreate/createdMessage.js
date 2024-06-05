const { EmbedBuilder } = require('discord.js')
const guildModule = require('../../modules/getGuildInfo')
const botId = process.env.BOT_ID
module.exports = async (message, client) => {
  // 이 메세지가 생성된 채널아이디
  const createdMessageChannelId = message.channelId
  const guildId = message.guildId
  const guildInfo = guildModule.getGuildInfo(guildId)

  const partyChannel = client.channels.cache.get(guildInfo.partyChannelId);
  partyChannel.threads.cache.forEach(thread => {
    thread.messages.fetch().then(messages => {
      let originMessage = messages.find(message => message.author.id === botId)
      if(typeof originMessage === typeof undefined){
        return
      }
      let participants = [];
      messages.forEach(getMessage => {
        // 작성한 글이 파티채널내 채널아이디와 다르면 작업하지 않음
        if(getMessage.channelId === createdMessageChannelId){
          const author = getMessage.author
          // 글의 작성자가 봇이 아니면 작업하지 않음
          if(author.id === botId){
            return
          }
          // 맨션된 유저가 봇이 아니면 작업하지 않음
          const mentionedUser = getMessage.mentions.users.find(mentionedUser => mentionedUser.id === botId && mentionedUser.bot)
          if(typeof mentionedUser === typeof undefined){
            return
          }
          // 맨션한 사람을 참여자로 등록
          participants.push(author.id);
        }
      })

      for(let participant of participants) {
        if(!originMessage.content.includes(participant)) {
          let content = originMessage.content;
          content += `\n - <@${participant}>`
          originMessage.edit({content: content}).then(updatedThread => {
            console.log("updated");
          }).catch(console.error)
        }
      }
    })
  })
}