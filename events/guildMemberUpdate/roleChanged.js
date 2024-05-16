const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
module.exports = (oldMember, newMember) => {
  const guildId = newMember.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  const embed = new EmbedBuilder()
    .setColor('#86E57F')
    .setAuthor({
      name: `${newMember.user.username}`,
      iconURL: newMember.user.displayAvatarURL()
    })
    .setTitle(`${newMember.user.globalName}`)

  if (oldMember.nickname !== newMember.nickname) {
    embed.setDescription(
        `<@${newMember.user.id}> \`${(oldMember.nickname === null) ? oldMember.user.username : oldMember.nickname}\` → \`${newMember.nickname}\`으로 별명이 변경 됨`)
  }

  if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    newMember.roles.cache.forEach(role => {
      if (!oldMember.roles.cache.has(role.id)) {
        embed.setDescription(
            `<@${newMember.user.id}> \`${role.name}\` 권한이 부여 됨`)
      }
    })
  }
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    oldMember.roles.cache.forEach(role => {
      if (!newMember.roles.cache.has(role.id)) {
        embed.setDescription(
            `<@${newMember.user.id}> \`${role.name}\` 권한이 삭제 됨`)
      }
    })
  }
  embed.setFooter({
    text: `ID: ${newMember.user.id} ${now.toFormat('yyyy-MM-dd HH:mm cccc')}`
  })

  newMember.guild.channels.cache.find(channel => channel.id === guildInfo.roleAuditingChannelId).send(
    { embeds: [embed] })
}
