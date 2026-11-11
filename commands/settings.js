const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const settings = require('../modules/guildSettings')
const { developerId } = require('../config/bot')
const perm = require('../modules/perm')
const { approveRoleOf } = require('../modules/approveRole')
const catalog = require('../modules/featureCatalog')
const { buildSettingsView } = require('../modules/settingsView')

// 설정이 바뀌면 봇 제작자(config/bot.js developerId)에게 "누가 뭘 바꿨는지" DM.
async function notifyDeveloper (interaction, summary) {
  if (!developerId || developerId === interaction.user.id) return
  try {
    const dev = await interaction.client.users.fetch(developerId)
    const who = `${interaction.user.username} (<@${interaction.user.id}>)`
    await dev.send(`⚙️ **${interaction.guild.name}** 설정 변경 알림\n🧑 실행자: ${who}\n📝 ${summary}`)
  } catch (e) { /* DM 막힘/유저 조회 실패는 무시 */ }
}

// "토글 + 채널" 형태 기능 공용 처리 (파티모집/인게임파티모집현황/주간랭킹)
// key = 설정 키(config guildInfo 폴백 키와 동일), flag = on/off 키
async function setChannelFeature (interaction, guildInfo, { sub, label, flag, key, note }) {
  const guildId = interaction.member.guild.id
  const on = interaction.options.getString('상태') === 'on'
  if (!on) {
    settings.set(guildId, flag, false)
    await interaction.reply({ content: `✅ **${label}** 기능을 **껐어**~`, ephemeral: true })
    await notifyDeveloper(interaction, `${label} → **끄기**`)
    return
  }
  const channel = interaction.options.getChannel('채널')
  if (channel) settings.set(guildId, key, channel.id)
  const eff = settings.get(guildId, key, null) || (guildInfo && guildInfo[key])
  if (!eff) {
    await interaction.reply({ content: `⚠️ 켜려면 채널을 지정해줘~\n예: \`/섯다라인설정 ${sub} 상태:켜기 채널:#채널\``, ephemeral: true })
    return
  }
  settings.set(guildId, flag, true)
  await interaction.reply({ content: `✅ **${label}** 기능을 **켰어**~ 채널: <#${eff}>${note ? `\n${note}` : ''}`, ephemeral: true })
  await notifyDeveloper(interaction, `${label} → **켜기** (채널 <#${eff}>)`)
}

const stateOption = (o) => {
  o.setName('상태').setDescription('켜기 / 끄기').setRequired(true)
  o.addChoices({ name: '켜기', value: 'on' }, { name: '끄기', value: 'off' })
  return o
}
const channelOption = (types, desc) => (o) => {
  o.setName('채널').setDescription(desc).addChannelTypes(...types)
  return o
}

const data = new SlashCommandBuilder()
  .setName('섯다라인설정')
  .setDescription('서버별 봇 설정을 관리해~ (관리자 전용, 기본은 전부 꺼짐)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

// 손님권한부여: 입장 시 손님 역할 자동부여 on/off (켤 때 손님 역할 지정)
data.addSubcommand(sub => {
  sub.setName('손님권한부여').setDescription(catalog.desc('손님권한부여'))
  sub.addStringOption(stateOption)
  sub.addRoleOption(o => o.setName('역할').setDescription('자동 부여할 손님 역할 (켤 때 지정)'))
  return sub
})

// 감사로그: 입장·퇴장·역할변경 로그 on/off + 채널 지정
data.addSubcommand(sub => {
  sub.setName('감사로그').setDescription(catalog.desc('감사로그'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(o =>
    o.setName('채널').setDescription('로그를 올릴 텍스트 채널 (켤 때 지정)').addChannelTypes(ChannelType.GuildText))
  return sub
})

// 승인권한부여: 손님권한부여(자동) 다음 단계. 감사로그 입장 로그에 '역할 부여' 버튼을 띄워
// 운영진이 확인 후 눌러서 정식 역할(길드원·정회원 등)을 준다. 감사로그가 켜져 있어야 버튼이 보임.
// 설정 키: approveRoleEnabled(on/off) + guildMemberRole(역할, 키 이름은 하위호환 위해 유지)
data.addSubcommand(sub => {
  sub.setName('승인권한부여').setDescription(catalog.desc('승인권한부여'))
  sub.addStringOption(stateOption)
  sub.addRoleOption(o => o.setName('역할').setDescription('확인 후 부여할 정식 역할 (예: 길드원·정회원, 켤 때 지정)'))
  return sub
})

// 파티모집: 길드원이 /파티모집으로 올린 디스코드 모집글 관리(오래된 글 정리·출발 10분 전 DM) on/off + 채널
data.addSubcommand(sub => {
  sub.setName('파티모집').setDescription(catalog.desc('파티모집'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(channelOption([ChannelType.GuildForum, ChannelType.GuildText], '디스코드 파티모집 채널 (켤 때 지정)'))
  return sub
})

// 인게임파티모집현황: 게임 안 거뿔 파티모집 외침 실시간 게시 on/off + 채널 (/파티알림 키워드 DM도 이게 on일 때만 동작)
data.addSubcommand(sub => {
  sub.setName('인게임파티모집현황').setDescription(catalog.desc('인게임파티모집현황'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(channelOption([ChannelType.GuildText], '파티보드를 올릴 채널 (켤 때 지정)'))
  return sub
})

// 주간랭킹: 주간 활동/보이스 랭킹 게시 on/off + 채널
data.addSubcommand(sub => {
  sub.setName('주간랭킹').setDescription(catalog.desc('주간랭킹'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(channelOption([ChannelType.GuildText], '랭킹을 올릴 채널 (켤 때 지정)'))
  return sub
})

// 게임서버: 거뿔 조회 기준 게임 서버(인게임파티모집현황·/파티알림). 미설정 시 하프(기존 동작 유지).
data.addSubcommand(sub => {
  sub.setName('게임서버').setDescription(catalog.desc('게임서버'))
  sub.addStringOption(o => o.setName('서버').setDescription('우리 길드의 마비노기 서버').setRequired(true)
    .addChoices(...catalog.GAME_SERVERS.map(n => ({ name: n, value: n }))))
  return sub
})

// 오늘의미션: 매일 아침 오늘/내일 미션·베테랑 게시 on/off + 채널
data.addSubcommand(sub => {
  sub.setName('오늘의미션').setDescription(catalog.desc('오늘의미션'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(channelOption([ChannelType.GuildText], '미션을 올릴 채널 (켤 때 지정)'))
  return sub
})

// 자동삭제: 지정 채널의 메시지를 N분 뒤 자동삭제 on/off (핀 메시지 제외). 채널마다 개별 설정.
data.addSubcommand(sub => {
  sub.setName('자동삭제').setDescription(catalog.desc('자동삭제'))
  sub.addStringOption(stateOption)
  sub.addChannelOption(channelOption([ChannelType.GuildText], '자동삭제할 채널 (켜기/끄기 모두 지정)'))
  sub.addIntegerOption(o =>
    o.setName('분').setDescription('이 시간(분)이 지난 메시지를 삭제 (켤 때 지정, 1~1440)').setMinValue(1).setMaxValue(1440))
  return sub
})

// 관리자역할: 봇 관리 명령어(설정·랭킹·메시지삭제)를 쓸 수 있는 역할 지정 (서버장·제작자만)
data.addSubcommand(sub => {
  sub.setName('관리자역할').setDescription(catalog.desc('관리자역할'))
  sub.addRoleOption(o => o.setName('역할').setDescription('관리자 역할').setRequired(true))
  return sub
})

// 기본채널: 명령어 결과(오미/날씨/경매장 등)를 올릴 채널. 미설정 시 명령어 친 채널에 게시.
data.addSubcommand(sub => {
  sub.setName('기본채널').setDescription(catalog.desc('기본채널'))
  sub.addChannelOption(channelOption([ChannelType.GuildText], '결과를 올릴 채널'))
  return sub
})

data.addSubcommand(sub =>
  sub.setName('목록').setDescription('이 서버의 현재 설정을 봐~'))

module.exports = {
  data,
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)

    if (!perm.isBotAdmin(interaction.member, interaction.guild)) {
      await interaction.reply({ content: '이 명령어는 관리자만 쓸 수 있어~', ephemeral: true })
      return
    }

    const sub = interaction.options.getSubcommand()

    if (sub === '손님권한부여') {
      const on = interaction.options.getString('상태') === 'on'
      if (!on) {
        settings.set(guildId, 'autoGuestRole', false)
        await interaction.reply({ content: '✅ **손님권한부여**를 **껐어**~', ephemeral: true })
        await notifyDeveloper(interaction, '손님권한부여 → **끄기**')
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
      await interaction.reply({ content: `✅ **손님권한부여**를 **켰어**~ 손님 역할: <@&${effective}>`, ephemeral: true })
      await notifyDeveloper(interaction, `손님권한부여 → **켜기** (손님역할 <@&${effective}>)`)
      return
    }

    if (sub === '감사로그') {
      const on = interaction.options.getString('상태') === 'on'
      if (!on) {
        settings.set(guildId, 'auditLog', false)
        await interaction.reply({ content: '✅ **감사로그**를 **껐어**~ (입장·퇴장·역할변경 로그 중지, 승인 버튼도 안 떠)', ephemeral: true })
        await notifyDeveloper(interaction, '감사로그 → **끄기**')
        return
      }
      const channel = interaction.options.getChannel('채널')
      if (channel) settings.set(guildId, 'roleAuditingChannelId', channel.id)

      const effectiveCh = settings.get(guildId, 'roleAuditingChannelId', null)
      if (!effectiveCh) {
        await interaction.reply({
          content: '⚠️ 켜려면 로그 채널을 지정해줘~\n예: `/섯다라인설정 감사로그 상태:켜기 채널:#로그채널`',
          ephemeral: true
        })
        return
      }
      settings.set(guildId, 'auditLog', true)
      const approveRole = approveRoleOf(guildId)
      const roleNote = approveRole
        ? `\n승인권한부여 켜짐: 입장 로그에 <@&${approveRole}> 부여 버튼이 같이 떠.`
        : '\n※ 승인권한부여 꺼짐 → 입장 로그만 뜨고 부여 버튼은 없어. (`/섯다라인설정 승인권한부여`)'
      await interaction.reply({ content: `✅ **감사로그**를 **켰어**~ 로그 채널: <#${effectiveCh}>${roleNote}`, ephemeral: true })
      await notifyDeveloper(interaction, `감사로그 → **켜기** (채널 <#${effectiveCh}>)`)
      return
    }

    if (sub === '승인권한부여') {
      const on = interaction.options.getString('상태') === 'on'
      if (!on) {
        settings.set(guildId, 'approveRoleEnabled', false)
        await interaction.reply({ content: '✅ **승인권한부여**를 **껐어**~ 입장 로그에 역할 부여 버튼이 더 이상 안 떠. (지정한 역할은 기억해둘게)', ephemeral: true })
        await notifyDeveloper(interaction, '승인권한부여 → **끄기**')
        return
      }
      const role = interaction.options.getRole('역할')
      if (role) settings.set(guildId, 'guildMemberRole', role.id)
      const effective = settings.get(guildId, 'guildMemberRole', null)
      if (!effective) {
        await interaction.reply({
          content: '⚠️ 켜려면 확인 후 부여할 역할을 지정해줘~\n예: `/섯다라인설정 승인권한부여 상태:켜기 역할:@길드원`',
          ephemeral: true
        })
        return
      }
      settings.set(guildId, 'approveRoleEnabled', true)
      const auditNote = settings.get(guildId, 'auditLog', false)
        ? ''
        : '\n⚠️ 지금 **감사로그가 꺼져 있어서** 버튼이 안 떠. `/섯다라인설정 감사로그`로 켜줘.'
      await interaction.reply({ content: `✅ **승인권한부여**를 **켰어**~ 입장 로그에 <@&${effective}> 부여 버튼이 떠. 운영진이 확인 후 눌러주면 돼!${auditNote}`, ephemeral: true })
      await notifyDeveloper(interaction, `승인권한부여 → **켜기** (역할 <@&${effective}>)`)
      return
    }

    if (sub === '파티모집') {
      await setChannelFeature(interaction, guildInfo, { sub, label: '파티모집', flag: 'partyRecruitEnabled', key: 'partyChannelId' })
      return
    }
    if (sub === '인게임파티모집현황') {
      await setChannelFeature(interaction, guildInfo, { sub, label: '인게임파티모집현황', flag: 'bugleBoardEnabled', key: 'bugleHornChannelId', note: `(게임서버: **${catalog.gameServerLabel(guildId)}** · /파티알림 키워드 DM도 이 설정을 따라가)` })
      return
    }

    if (sub === '게임서버') {
      const server = interaction.options.getString('서버')
      const prev = catalog.gameServerOf(guildId)
      settings.set(guildId, 'gameServer', server)
      await interaction.reply({ content: `✅ 게임서버를 **${server}**(으)로 지정했어~ 인게임파티모집현황·/파티알림이 이 서버 거뿔을 기준으로 동작해.${prev !== server ? ` (이전: ${prev})` : ''}`, ephemeral: true })
      await notifyDeveloper(interaction, `게임서버 → **${server}** (이전 ${prev})`)
      return
    }
    if (sub === '주간랭킹') {
      await setChannelFeature(interaction, guildInfo, { sub, label: '주간랭킹', flag: 'weeklyEnabled', key: 'weeklyMemberChannelId' })
      return
    }
    if (sub === '오늘의미션') {
      await setChannelFeature(interaction, guildInfo, { sub, label: '오늘의미션', flag: 'dailyMissionEnabled', key: 'todayMissionChannelId' })
      return
    }

    if (sub === '자동삭제') {
      const on = interaction.options.getString('상태') === 'on'
      const channel = interaction.options.getChannel('채널')
      if (!channel) {
        await interaction.reply({ content: '자동삭제할 채널을 지정해줘~', ephemeral: true })
        return
      }
      // 채널별 TTL(분) 맵: { 채널ID: 분 }
      const map = { ...settings.get(guildId, 'autoDeleteChannels', {}) }
      if (!on) {
        if (map[channel.id] === undefined) {
          await interaction.reply({ content: `<#${channel.id}> 은 자동삭제가 켜져있지 않아~`, ephemeral: true })
          return
        }
        delete map[channel.id]
        settings.set(guildId, 'autoDeleteChannels', map)
        await interaction.reply({ content: `✅ <#${channel.id}> 자동삭제를 **껐어**~`, ephemeral: true })
        await notifyDeveloper(interaction, `자동삭제 끄기 → <#${channel.id}>`)
        return
      }
      const minutes = interaction.options.getInteger('분')
      if (!minutes) {
        await interaction.reply({
          content: '켤 때는 몇 분 뒤 삭제할지 `분`을 지정해줘~\n예: `/섯다라인설정 자동삭제 상태:켜기 채널:#봇명령 분:1`',
          ephemeral: true
        })
        return
      }
      map[channel.id] = minutes
      settings.set(guildId, 'autoDeleteChannels', map)
      await interaction.reply({ content: `✅ <#${channel.id}> 메시지를 **${minutes}분** 뒤 자동삭제하도록 켰어~ (핀 메시지 제외, 최대 30초 오차)`, ephemeral: true })
      await notifyDeveloper(interaction, `자동삭제 켜기 → <#${channel.id}> ${minutes}분`)
      return
    }

    if (sub === '관리자역할') {
      // 관리자역할 지정은 서버장·제작자만(adminRole 보유자가 스스로 관리자 역할을 바꾸는 것 방지)
      if (!perm.isOwnerOrDev(interaction.member, interaction.guild)) {
        await interaction.reply({ content: '관리자 역할 지정은 서버장(또는 제작자)만 할 수 있어~', ephemeral: true })
        return
      }
      const role = interaction.options.getRole('역할')
      settings.set(guildId, 'adminRole', role.id)
      await interaction.reply({ content: `✅ 관리자 역할을 <@&${role.id}> 로 지정했어~\n이 역할이면 설정·랭킹·메시지삭제 명령어를 쓸 수 있어.`, ephemeral: true })
      await notifyDeveloper(interaction, `관리자역할 → <@&${role.id}>`)
      return
    }

    if (sub === '기본채널') {
      const channel = interaction.options.getChannel('채널')
      if (!channel) {
        await interaction.reply({ content: '올릴 채널을 지정해줘~', ephemeral: true })
        return
      }
      settings.set(guildId, 'generalChannelId', channel.id)
      await interaction.reply({ content: `✅ 명령어 결과를 <#${channel.id}> 에 올리도록 지정했어~`, ephemeral: true })
      await notifyDeveloper(interaction, `기본채널 → <#${channel.id}>`)
      return
    }

    if (sub === '목록') {
      await interaction.reply({ ...buildSettingsView(interaction.guild), ephemeral: true })
    }
  }
}
