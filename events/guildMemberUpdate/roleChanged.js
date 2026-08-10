const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
module.exports = (oldMember, newMember) => {
  const guildId = newMember.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo || !settings.get(guildId, 'auditLog', false)) return
  const auditChannelId = settings.get(guildId, 'roleAuditingChannelId', null)
  if (!auditChannelId) return

  // 관심 있는 변경(닉네임/역할)만 로그. 프로필 이미지 등 다른 변경은 description이 안 잡혀서 스킵됨.
  let description = null
  if (oldMember.nickname !== newMember.nickname) {
    description = `<@${newMember.user.id}> \`${(oldMember.nickname === null) ? oldMember.user.username : oldMember.nickname}\` → \`${newMember.nickname}\`으로 별명이 변경 됨`
  }
  if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    newMember.roles.cache.forEach(role => {
      if (!oldMember.roles.cache.has(role.id)) {
        description = `<@${newMember.user.id}> \`${role.name}\` 권한이 부여 됨`
      }
    })
  }
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    oldMember.roles.cache.forEach(role => {
      if (!newMember.roles.cache.has(role.id)) {
        description = `<@${newMember.user.id}> \`${role.name}\` 권한이 삭제 됨`
      }
    })
  }

  // 닉네임·역할 변경이 아니면(프로필 이미지 변경 등) 빈 로그 대신 아무 것도 안 올림
  if (!description) return

  const embed = new EmbedBuilder()
    .setColor('#86E57F')
    .setAuthor({
      name: `${newMember.user.username}`,
      iconURL: newMember.user.displayAvatarURL()
    })
    .setTitle(`${newMember.user.globalName === null ? newMember.user.id : newMember.user.globalName}`)
    .setDescription(description)
    .setFooter({
      text: `ID: ${newMember.user.id} ${now.toFormat('yyyy-MM-dd HH:mm cccc')}`
    })

  const auditChannel = newMember.guild.channels.cache.get(auditChannelId)
  if (auditChannel) auditChannel.send({ embeds: [embed] })
}
