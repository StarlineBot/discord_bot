const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
module.exports = (member) => {
  const guildId = member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setAuthor({
      name: `${member.user.username}`,
      iconURL: member.user.displayAvatarURL()
    })
    .setTitle(`${member.user.globalName === null ? member.user.id : member.user.globalName}`)
    .setDescription(`<@${member.user.id}> 님이 서버에서 퇴장 함`)
    .setFooter(
      { text: `ID: ${member.user.id} ${now.toFormat('yyyy-MM-dd HH:mm cccc')}` })

  member.guild.channels.cache.find(channel => channel.id === guildInfo.roleAuditingChannelId).send(
    { embeds: [embed] })
}
