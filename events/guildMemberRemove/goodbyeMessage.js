const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const { developerId, auditLogIgnoreUserIds = [] } = require('../../config/bot')
// 감사로그 입장·퇴장에서 제외할 계정: 제작자 + 제작용 부계정 등
const AUDIT_IGNORE = new Set([developerId, ...auditLogIgnoreUserIds].filter(Boolean))
module.exports = (member) => {
  // 로그 시각은 이벤트 발생 시점 기준(모듈 상단에 두면 봇 기동 시각으로 고정됨)
  const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
  const guildId = member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo || !settings.get(guildId, 'auditLog', false)) return
  // 제작자·제작용 계정(AUDIT_IGNORE)의 퇴장은 감사로그에 남기지 않는다
  if (AUDIT_IGNORE.has(member.user.id)) return
  const auditChannelId = settings.get(guildId, 'roleAuditingChannelId', null)
  if (!auditChannelId) return
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

  const auditChannel = member.guild.channels.cache.get(auditChannelId)
  if (auditChannel) auditChannel.send({ embeds: [embed] })
}
