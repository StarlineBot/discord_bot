const { EmbedBuilder } = require('discord.js')
const guildModule = require('../../modules/getGuildInfo')
const fs = require('fs')
const prefix = '!'
module.exports = async (message, client) => {
  if (message.guildId !== null) {
    const guildId = message.guildId
    const guildInfo = guildModule.getGuildInfo(guildId)
    if (typeof guildInfo !== typeof undefined) {
      try {
        const guildAdminRoleId = guildInfo.adminRole
        const guild = client.guilds.cache.find(guild => guild.id === guildId)
        const allowedRole = guild.roles.cache.find(role => role.id === guildAdminRoleId)
        const member = guild.members.cache.find(member => member.id === message.author.id)
        const isAllowed = !!member.roles.cache.find(role => role.id === allowedRole.id)

        if (isAllowed && message.content.startsWith(prefix + '채팅랭킹')) {
          // 파일에서 데이터 불러오기
          if (fs.existsSync('./static/json/userMessageCount.json')) {
            let userMessageCounts = JSON.parse(fs.readFileSync('./static/json/userMessageCount.json'));
            let userTextRank = Object.entries(userMessageCounts[guildInfo.guildId]).sort((a,b) => b[1] - a[1])
            if (userTextRank.length !== 0) {
              let embedList = []
              userTextRank.forEach(([key, value], index) => {
                console.log(index)
                if (index > 3) {
                  return false
                }
                let rank = index + 1
                let medal;
                switch(rank) {
                  case 1:
                    medal = '🥇'
                    break;
                  case 2:
                    medal = '🥈'
                    break;
                  case 3:
                  default:
                    medal = '🥉'
                    break;
                }
                embedList.push(
                    new EmbedBuilder()
                    .setTitle(`🌟이주의 채팅 랭킹 TOP ${medal}`)
                    .setColor('#FFD9EC')
                    .setDescription(
                        `<@${key}> 님이 이 주에 ${value}번을 떠들었어요~.`)
                    .setTimestamp()
                )
              })
              message.reply({ embeds: embedList })
            }
          }
        }
      } catch (error) {
        console.log(`${guildId}에 대한 정보 없음 : \n\n${error}`)
      }
    }
  }
}