const { EmbedBuilder } = require('discord.js')
const guildModule = require('../../modules/getGuildInfo')
const prefix = '!'
module.exports = async (message, client) => {
  const guildId = message.guildId
  const guildInfo = guildModule.getGuildInfo(guildId)
  const guildAdminRoleId = guildInfo.adminRole
  const guild = client.guilds.cache.find(guild => guild.id === guildId)
  const allowedRole = guild.roles.cache.find(role => role.id === guildAdminRoleId)
  const member = guild.members.cache.find(member => member.id === message.author.id)
  const isAllowed = !!member.roles.cache.find(role => role.id === allowedRole.id)
  if (isAllowed && message.content.startsWith(prefix + '메세지삭제')) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🚨메세지삭제')
      .setDescription('메세지를 100건씩 삭제합니다.\n\n14일 이후의 메세지도 삭제되니 정말로 삭제하실거면 아래 \`메세지삭제\` 버튼을 눌러주세요.')
    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 4,
            label: '메세지삭제',
            customId: JSON.stringify({ memberId: `${message.author.id}`, action: 'bulkDelete' })
          }
        ]
      }
    ]
    message.reply({ embeds: [embed], components })
  }
}
