const guildModule = require('../../modules/getGuildInfo')
const settings = require('../../modules/guildSettings')
const timeout = 3000
module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return
  const guildId = interaction.member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return
  const buttonInfo = JSON.parse(interaction.customId)
  const action = buttonInfo.action
  const memberId = buttonInfo.memberId
  const clickMember = interaction.member

  const owner = await clickMember.guild.fetchOwner()
  const isAllowed = !!clickMember.roles.cache.find(
    role => role.id === guildInfo.adminRole) || owner.user.id === guildInfo.ownerId

  let message
  switch (action) {
    case 'bulkDelete':
      if (!isAllowed) {
        message = `권한이 없는 사용자 입니다.\n\n이 메세지는 ${timeout / 1000}초 후 삭제됩니다.`
        break
      }
      await interaction.message.channel.bulkDelete(100, true)
      message = `과거 메세지 100건 삭제 완료. → 메세지삭제자: <@${clickMember.user.id}>\n\n이 메세지는 ${timeout / 1000}초 후 삭제됩니다.`
      break
    case 'doAddRole':
    default: {
      // 승인역할(guildMemberRole)은 /섯다라인설정 감사로그에서 지정 → 없으면 안내
      const guildMemberRoleId = settings.get(guildId, 'guildMemberRole', null)
      const guildRole = guildMemberRoleId ? clickMember.guild.roles.cache.get(guildMemberRoleId) : null
      if (!guildRole) {
        message = '승인 역할이 설정돼 있지 않아~ `/섯다라인설정 감사로그`에서 승인역할을 지정해줘.'
        break
      }
      const guild = client.guilds.cache.get(guildId)
      const targetMember = guild ? guild.members.cache.get(memberId) : null
      if (!targetMember) {
        message = '대상 멤버를 찾을 수 없어~ (이미 퇴장했을 수 있어)'
        break
      }
      const existRole = targetMember.roles.cache.has(guildRole.id)
      if (!existRole) targetMember.roles.add(guildRole).catch(() => {})
      message = existRole
        ? `이미 <@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한이 부여 되어 있습니다.`
        : `<@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한을 부여 했습니다. → 권한부여자: <@${clickMember.user.id}>`
      break
    }
  }
  interaction.reply(message)

  if (action === 'bulkDelete') {
    setTimeout(() => interaction.deleteReply(), timeout)
  }
}
