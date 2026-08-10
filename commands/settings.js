const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const settings = require('../modules/guildSettings')
const { developerId } = require('../config/bot')

// 관리자(adminRole 보유) 또는 서버장만 허용 — buttonReaction.js와 동일한 기준
async function isAdmin (interaction, guildInfo) {
  if (!guildInfo) return false
  if (interaction.member.roles.cache.has(guildInfo.adminRole)) return true
  const owner = await interaction.guild.fetchOwner()
  return owner.id === guildInfo.ownerId
}

// 설정이 바뀌면 봇 제작자(config/bot.js developerId)에게 "누가 뭘 바꿨는지" DM.
// 제작자 본인이 바꿨거나 developerId 미설정이면 스킵.
async function notifyDeveloper (interaction, summary) {
  if (!developerId || developerId === interaction.user.id) return
  try {
    const dev = await interaction.client.users.fetch(developerId)
    const who = `${interaction.user.username} (<@${interaction.user.id}>)`
    await dev.send(`⚙️ **${interaction.guild.name}** 설정 변경 알림\n🧑 실행자: ${who}\n📝 ${summary}`)
  } catch (e) { /* DM 막힘/유저 조회 실패는 무시 */ }
}

const stateOption = (o) => {
  o.setName('상태').setDescription('켜기 / 끄기').setRequired(true)
  o.addChoices({ name: '켜기', value: 'on' }, { name: '끄기', value: 'off' })
  return o
}

const data = new SlashCommandBuilder()
  .setName('섯다라인설정')
  .setDescription('서버별 봇 설정을 관리해~ (관리자 전용, 기본은 전부 꺼짐)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

// 손님권한부여: 입장 시 손님 역할 자동부여 on/off (켤 때 손님 역할 지정)
data.addSubcommand(sub => {
  sub.setName('손님권한부여').setDescription('입장한 멤버에게 손님 역할을 자동으로 줄지 on/off')
  sub.addStringOption(stateOption)
  sub.addRoleOption(o => o.setName('역할').setDescription('자동 부여할 손님 역할 (켤 때 지정)'))
  return sub
})

// 감사로그: 입장 승인버튼·역할변경·퇴장 로그 on/off + 채널·승인역할 지정
data.addSubcommand(sub => {
  sub.setName('감사로그').setDescription('입장 승인·역할변경·퇴장 로그 on/off (켤 땐 채널 지정)')
  sub.addStringOption(stateOption)
  sub.addChannelOption(o =>
    o.setName('채널').setDescription('로그를 올릴 텍스트 채널 (켤 때 지정)').addChannelTypes(ChannelType.GuildText))
  sub.addRoleOption(o => o.setName('승인역할').setDescription('입장 승인 버튼으로 부여할 정식 길드원 역할 (선택)'))
  return sub
})

data.addSubcommand(sub =>
  sub.setName('목록').setDescription('이 서버의 현재 설정을 봐~'))

module.exports = {
  data,
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)

    if (!(await isAdmin(interaction, guildInfo))) {
      await interaction.reply({ content: '이 명령어는 관리자만 쓸 수 있어~', ephemeral: true })
      return
    }

    const sub = interaction.options.getSubcommand()

    if (sub === '손님권한부여') {
      const on = interaction.options.getString('상태') === 'on'
      if (!on) {
        settings.set(guildId, 'autoGuestRole', false)
        await interaction.reply({ content: '✅ **손님권한 자동부여**를 **껐어**~', ephemeral: true })
        await notifyDeveloper(interaction, '손님권한 자동부여 → **끄기**')
        return
      }
      const role = interaction.options.getRole('역할')
      if (role) settings.set(guildId, 'guestRole', role.id)
      const effective = settings.get(guildId, 'guestRole', null)
      if (!effective) {
        await interaction.reply({
          content: '⚠️ 켜려면 손님 역할을 지정해줘~\n예: `/섯다라인설정 손님권한부여 상태:켜기 역할:@손님`',
          ephemeral: true
        })
        return
      }
      settings.set(guildId, 'autoGuestRole', true)
      await interaction.reply({ content: `✅ **손님권한 자동부여**를 **켰어**~ 손님 역할: <@&${effective}>`, ephemeral: true })
      await notifyDeveloper(interaction, `손님권한 자동부여 → **켜기** (손님역할 <@&${effective}>)`)
      return
    }

    if (sub === '감사로그') {
      const on = interaction.options.getString('상태') === 'on'
      if (!on) {
        settings.set(guildId, 'auditLog', false)
        await interaction.reply({ content: '✅ **감사로그**를 **껐어**~ (입장 승인·역할변경·퇴장 로그 중지)', ephemeral: true })
        await notifyDeveloper(interaction, '감사로그 → **끄기**')
        return
      }
      const channel = interaction.options.getChannel('채널')
      if (channel) settings.set(guildId, 'roleAuditingChannelId', channel.id)
      const approveRole = interaction.options.getRole('승인역할')
      if (approveRole) settings.set(guildId, 'guildMemberRole', approveRole.id)

      const effectiveCh = settings.get(guildId, 'roleAuditingChannelId', null)
      if (!effectiveCh) {
        await interaction.reply({
          content: '⚠️ 켜려면 로그 채널을 지정해줘~\n예: `/섯다라인설정 감사로그 상태:켜기 채널:#로그채널`',
          ephemeral: true
        })
        return
      }
      settings.set(guildId, 'auditLog', true)
      const effectiveRole = settings.get(guildId, 'guildMemberRole', null)
      const roleNote = effectiveRole
        ? `\n입장 승인 역할: <@&${effectiveRole}> (입장 로그에 부여 버튼 표시)`
        : '\n※ 승인역할 미지정 → 입장 로그만 뜨고 부여 버튼은 없어.'
      await interaction.reply({ content: `✅ **감사로그**를 **켰어**~ 로그 채널: <#${effectiveCh}>${roleNote}`, ephemeral: true })
      await notifyDeveloper(interaction, `감사로그 → **켜기** (채널 <#${effectiveCh}>${effectiveRole ? `, 승인역할 <@&${effectiveRole}>` : ''})`)
      return
    }

    if (sub === '목록') {
      const autoGuestRole = settings.get(guildId, 'autoGuestRole', false)
      const auditLog = settings.get(guildId, 'auditLog', false)
      const guestRole = settings.get(guildId, 'guestRole', null)
      const auditCh = settings.get(guildId, 'roleAuditingChannelId', null)
      const memberRole = settings.get(guildId, 'guildMemberRole', null)
      const embed = new EmbedBuilder()
        .setTitle(`⚙️ ${interaction.guild.name} 설정`)
        .setColor('#5865F2')
        .setDescription(
          `${autoGuestRole ? '🟢' : '🔴'} **손님권한 자동부여** — ${autoGuestRole ? '켜짐' : '꺼짐'}` +
          `${guestRole ? ` (역할 <@&${guestRole}>)` : ''}\n> 입장 시 손님 역할 자동 부여\n\n` +
          `${auditLog ? '🟢' : '🔴'} **감사로그** — ${auditLog ? '켜짐' : '꺼짐'}` +
          `${auditCh ? ` (채널 <#${auditCh}>)` : ''}${memberRole ? ` (승인역할 <@&${memberRole}>)` : ''}\n> 입장 승인·역할변경·퇴장 로그`)
      await interaction.reply({ embeds: [embed], ephemeral: true })
    }
  }
}
