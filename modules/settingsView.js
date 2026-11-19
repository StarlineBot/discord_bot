const { EmbedBuilder } = require('discord.js')
const settings = require('./guildSettings')
const guildModule = require('./getGuildInfo')
const partyAlerts = require('./partyAlerts')
const { approveRoleOf } = require('./approveRole')
const catalog = require('./featureCatalog')
const partyChannelMod = require('./partyChannel')
const checks = require('./settingChecks')

// /섯다라인설정 목록 화면(서버 관리 / 인게임 연동 임베드 2장).
// 줄 형식: `상태 이름 · 값 — 설명`. 이름 = 하위 명령 이름(그대로 복사해 명령으로 쓸 수 있게).
// 값만 있는 설정(관리자역할·기본채널·게임서버)은 🟢/🔴 대신 고유 이모지. 의존 관계 경고는 해당 줄 아래.
// (추후 설치 안내의 '📋 현재 설정 보기' 버튼도 이 빌더를 재사용)

const dot = (on) => on ? '🟢' : '🔴'
const ch = (id) => id ? `<#${id}>` : null
const role = (id) => id ? `<@&${id}>` : null

// 목록 경고: 설정할 땐 괜찮았어도 나중에 역할 순서·채널 권한·채널 삭제로 깨질 수 있어 볼 때마다 다시 검사(modules/settingChecks.js)
const warnOf = (list) => {
  const w = list.filter(Boolean).map(x => x.startsWith('⚠️') ? x : `⚠️ ${x}`)
  return w.length ? w.join('\n\u3000') : null
}

// 채널 기반 기능의 공통 경고: 사라진 채널 · 봇 권한 · 선택 권한 · 자동삭제 겹침
function channelWarns (guild, channelId, feature, { autoDelete = true } = {}) {
  if (!guild || !channelId) return []
  const chObj = checks.channelOf(guild, channelId)
  if (!chObj) return [`지정한 채널(<#${channelId}>)을 찾을 수 없어요 — 채널을 다시 지정해 주세요`]
  return [
    checks.channelBlock(guild, chObj, feature),
    ...checks.channelOptionalWarns(guild, chObj, feature),
    autoDelete ? checks.channelIsAutoDeleted(guild.id, channelId) : null
  ]
}

// 봇이 주는 역할(손님·승인) 경고: 사라진 역할 · 역할 순서/권한/관리형
function roleWarns (guild, roleId) {
  if (!guild || !roleId) return []
  const role = guild.roles && guild.roles.cache.get(roleId)
  if (!role) return [`지정한 역할(<@&${roleId}>)을 찾을 수 없어요 — 역할을 다시 지정해 주세요`]
  return [checks.roleBlock(guild, role, { assign: true })]
}

// 각 기능의 현재 상태: { on: true|false|null(값 전용 설정), value: 표시값|null, warn: 경고|null }
// guild(선택): 채널·역할·권한 검사처럼 디스코드 캐시가 필요한 경고용(없으면 경고 생략 — 기존 호출 호환)
function stateOf (sub, guildId, guild = null) {
  const gi = guildModule.getGuildInfo(guildId)
  const get = (k, f = null) => settings.get(guildId, k, f)
  const chOf = (k) => get(k) || (gi && gi[k]) || null

  switch (sub) {
    case '관리자역할': {
      const id = get('adminRole') || (gi && gi.adminRole)
      const roleObj = guild && id && guild.roles && guild.roles.cache.get(id)
      const warn = guild && id ? warnOf([roleObj ? checks.roleBlock(guild, roleObj, { assign: false }) : `지정한 역할(<@&${id}>)을 찾을 수 없어요`]) : null
      return { on: null, value: role(id) || '미지정 (서버장·제작자만 관리)', warn }
    }
    case '기본채널': {
      const id = get('generalChannelId') || (gi && gi.generalChannelId)
      return { on: null, value: ch(id) || '미지정 (명령어 친 채널에 게시)', warn: warnOf(channelWarns(guild, id, '기본채널')) }
    }
    case '손님권한부여': {
      const on = get('autoGuestRole', false)
      return { on, value: role(get('guestRole')), warn: on ? warnOf(roleWarns(guild, get('guestRole'))) : null }
    }
    case '감사로그': {
      const on = get('auditLog', false)
      const id = get('roleAuditingChannelId')
      const warns = on ? [...channelWarns(guild, id, '감사로그'), guild ? checks.publicChannelWarn(guild, checks.channelOf(guild, id)) : null] : []
      return { on, value: ch(id), warn: warnOf(warns) }
    }
    case '승인권한부여': {
      const on = !!approveRoleOf(guildId)
      const warns = on
        ? [!get('auditLog', false) ? '⚠️ 감사로그가 꺼져 있어 승인 버튼이 안 떠요' : null, ...roleWarns(guild, get('guildMemberRole')), checks.sameRoleWarn(guildId)]
        : []
      return { on, value: role(get('guildMemberRole')), warn: warnOf(warns) }
    }
    case '주간랭킹': {
      const on = get('weeklyEnabled', false)
      return { on, value: ch(chOf('weeklyMemberChannelId')), warn: on ? warnOf(channelWarns(guild, chOf('weeklyMemberChannelId'), '주간랭킹')) : null }
    }
    case '자동삭제': {
      const entries = Object.entries(get('autoDeleteChannels', {}) || {})
      const warns = guild
        ? entries.flatMap(([cid]) => [...channelWarns(guild, cid, '자동삭제', { autoDelete: false }), ...checks.autoDeleteConflictWarns(guildId, cid)])
        : []
      return { on: entries.length > 0, value: entries.length ? entries.map(([cid, m]) => `<#${cid}> ${m}분`).join(' · ') : null, warn: warnOf(warns) }
    }
    case '게임서버': {
      const set = get('gameServer')
      return { on: null, value: catalog.GAME_SERVERS.includes(set) ? set : `${catalog.DEFAULT_GAME_SERVER} (기본값)` }
    }
    case '오늘의미션': {
      const on = get('dailyMissionEnabled', false)
      return { on, value: ch(chOf('todayMissionChannelId')), warn: on ? warnOf(channelWarns(guild, chOf('todayMissionChannelId'), '오늘의미션')) : null }
    }
    case '파티모집': {
      const on = get('partyRecruitEnabled', false)
      const wrongType = guild && partyChannelMod.isWrongType(guild)
      const warns = wrongType
        ? ['⚠️ 포럼 채널이 아니라 동작하지 않아요 — 포럼 채널로 다시 지정해 주세요']
        : (on ? channelWarns(guild, chOf('partyChannelId'), '파티모집', { autoDelete: false }) : [])
      return { on, value: ch(chOf('partyChannelId')), warn: warnOf(warns) }
    }
    case '인게임파티모집현황': {
      const on = get('bugleBoardEnabled', false)
      const warns = []
      if (!on) {
        const users = new Set(partyAlerts.read().keywords.filter(k => k.guildId === guildId).map(k => k.userId))
        if (users.size) warns.push(`⚠️ ${users.size}명이 /파티알림을 등록했지만 꺼져 있어 알림이 안 가요`)
      } else {
        warns.push(...channelWarns(guild, chOf('bugleHornChannelId'), '인게임파티모집현황'))
      }
      return { on, value: ch(chOf('bugleHornChannelId')), warn: warnOf(warns) }
    }
    default:
      return { on: null, value: null }
  }
}

function featureLine (f, guild) {
  const st = stateOf(f.sub, guild.id, guild)
  const mark = st.on === null ? f.emoji : dot(st.on)
  let line = `${mark} **${f.sub}**${st.value ? ` · ${st.value}` : ''} — ${f.oneLine}`
  if (st.warn) line += `\n\u3000${st.warn}` // 전각 공백으로 들여쓰기
  return line
}

// 섹션별 줄 목록(그룹 헤더 포함)
function sectionLines (section, guild) {
  const lines = []
  let lastGroup = null
  for (const f of catalog.FEATURES.filter(x => x.section === section)) {
    if (f.group && f.group !== lastGroup) lines.push(`**${catalog.GROUPS[f.group]}**`)
    lastGroup = f.group || null
    lines.push(featureLine(f, guild))
    if (f.afterNote) lines.push(f.afterNote)
  }
  return lines
}

// /섯다라인설정 목록 응답 payload
function buildSettingsView (guild) {
  const embeds = Object.entries(catalog.SECTIONS).map(([key, s]) =>
    new EmbedBuilder()
      .setTitle(s.title)
      .setColor(s.color)
      // 필드 값(1024자)은 자동삭제 채널이 많으면 넘칠 수 있어 description(4096자)에 줄을 쓴다
      .setDescription(sectionLines(key, guild).join('\n').slice(0, 4096)))
  embeds[embeds.length - 1].setFooter({ text: '바꾸려면 /섯다라인설정 <항목이름>' })
  return { content: `⚙️ **${guild.name}** 설정`, embeds }
}

module.exports = { buildSettingsView, stateOf }
