const { EmbedBuilder } = require('discord.js')
const guildModule = require('../../modules/getGuildInfo')
const perm = require('../../modules/perm')
const prefix = '!'
module.exports = async (message, client) => {
  if (!message.author.bot) {
    if (message.guildId !== null) {
      const guildId = message.guildId
      const guildInfo = guildModule.getGuildInfo(guildId)
      if (typeof guildInfo !== typeof undefined) {
        try {
          const guild = client.guilds.cache.get(guildId)
          const member = guild && guild.members.cache.get(message.author.id)
          const isAllowed = perm.isBotAdmin(member, guild)

          // FIXME: 메세지 삭제가 포함되는지는 더 위에서 확인해야 할거 같음
          if (isAllowed && message.content.startsWith(prefix + '메세지삭제')) {
            const embed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('🚨메세지삭제')
              .setDescription(
                '메세지를 100건씩 삭제합니다.\n\n14일 이후의 메세지도 삭제되니 정말로 삭제하실거면 아래 `메세지삭제` 버튼을 눌러주세요.')
            const components = [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 4,
                    label: '메세지삭제',
                    customId: JSON.stringify(
                      { memberId: `${message.author.id}`, action: 'bulkDelete' })
                  }
                ]
              }
            ]
            message.reply({ embeds: [embed], components })
          }
        } catch (error) {
          console.log(`${guildId}에 대한 정보 없음 : \n\n${error}`)
        }
      }
    }
  }
}
