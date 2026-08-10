const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
module.exports = (member) => {
  const guildId = member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return // config에 등록 안 된 서버는 무시

  // 손님권한·감사로그 설정은 /섯다라인설정으로 서버마다 지정. 기본 꺼짐(미설정 서버는 아무 것도 안 함).
  const autoGuestRole = settings.get(guildId, 'autoGuestRole', false)
  const auditLog = settings.get(guildId, 'auditLog', false)
  const guestRoleId = settings.get(guildId, 'guestRole', null)
  const guildMemberRoleId = settings.get(guildId, 'guildMemberRole', null)
  const auditChannelId = settings.get(guildId, 'roleAuditingChannelId', null)

  // 손님권한 자동부여: 켜져 있고 손님 역할이 지정돼 있으면 역할 부여 + 안내 DM
  if (autoGuestRole && guestRoleId) {
    const role = member.guild.roles.cache.get(guestRoleId)
    if (role) {
      member.send(
          `============================================\n🌟어서오세요! ${member.user.globalName}님~🌟\n\n${member.guild.name}에 오신것을 환영합니다!\n'${role.name}'역할이 부여 되었으니 ${member.guild.name}서버에서 음성채팅에 참여해보세요~\n============================================`)
        .catch(() => {})
      member.roles.add(role.id).then(() => {
        console.log(`${role.name} added by ${member.user.globalName}`)
      }).catch(() => {})
    }
  }

  // 감사로그: 입장 알림을 감사채널에 게시. 승인역할이 있으면 '권한 부여' 버튼도 함께.
  if (!auditLog || !auditChannelId) return
  const auditChannel = member.guild.channels.cache.get(auditChannelId)
  if (!auditChannel) return
  const guildRole = guildMemberRoleId ? member.guild.roles.cache.get(guildMemberRoleId) : null

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setAuthor({
      name: `${member.user.username}`,
      iconURL: member.user.displayAvatarURL()
    })
    .setTitle(`${member.user.globalName === null ? member.user.id : member.user.globalName}`)
    .setDescription(
      guildRole
        ? `<@${member.user.id}> 님이 서버에 입장 했어요.\n\n\`${member.guild}\`의 길드원이 맞다면 아래 버튼을 눌러 \`${guildRole.name}\` 권한을 부여하세요.`
        : `<@${member.user.id}> 님이 서버에 입장 했어요.`)
    .setFooter(
      { text: `ID: ${member.user.id} ${now.toFormat('yyyy-MM-dd HH:mm cccc')}` })

  const components = guildRole
    ? [{
        type: 1,
        components: [{
          type: 2,
          style: 3,
          label: `\`${guildRole.name}\` 부여하기`,
          customId: JSON.stringify({ memberId: `${member.user.id}`, action: 'doAddRole' })
        }]
      }]
    : []

  auditChannel.send({ embeds: [embed], components })
}
