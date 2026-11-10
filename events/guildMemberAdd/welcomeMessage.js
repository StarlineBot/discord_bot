const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const { approveRoleOf } = require('../../modules/approveRole')
const { developerId, auditLogIgnoreUserIds = [] } = require('../../config/bot')
// 감사로그 입장·퇴장에서 제외할 계정: 제작자 + 제작용 부계정 등
const AUDIT_IGNORE = new Set([developerId, ...auditLogIgnoreUserIds].filter(Boolean))
module.exports = (member) => {
  // 로그 시각은 이벤트 발생 시점 기준(모듈 상단에 두면 봇 기동 시각으로 고정됨)
  const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
  const guildId = member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return // config에 등록 안 된 서버는 무시

  // 손님권한·감사로그 설정은 /섯다라인설정으로 서버마다 지정. 기본 꺼짐(미설정 서버는 아무 것도 안 함).
  const autoGuestRole = settings.get(guildId, 'autoGuestRole', false)
  const auditLog = settings.get(guildId, 'auditLog', false)
  const guestRoleId = settings.get(guildId, 'guestRole', null)
  // 승인권한부여가 켜져 있을 때만 입장 로그에 역할 부여 버튼을 붙인다
  const guildMemberRoleId = approveRoleOf(guildId)
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
  // 제작자·제작용 계정(AUDIT_IGNORE)의 입장은 감사로그에 남기지 않는다(테스트·점검 입퇴장 노이즈 방지).
  if (!auditLog || !auditChannelId) return
  if (AUDIT_IGNORE.has(member.user.id)) return
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
        ? `<@${member.user.id}> 님이 서버에 입장 했어요.\n\n확인 후 \`${guildRole.name}\` 역할을 줄 대상이 맞다면 아래 버튼을 눌러 부여하세요.`
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
