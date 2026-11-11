const { EmbedBuilder } = require('discord.js')
const settings = require('./guildSettings')
const guildModule = require('./getGuildInfo')
const partyAlerts = require('./partyAlerts')
const { approveRoleOf } = require('./approveRole')
const catalog = require('./featureCatalog')

// /섯다라인설정 목록 화면(서버 관리 / 인게임 연동 임베드 2장).
// 줄 형식: `상태 이름 · 값 — 설명`. 이름 = 하위 명령 이름(그대로 복사해 명령으로 쓸 수 있게).
// 값만 있는 설정(관리자역할·기본채널·게임서버)은 🟢/🔴 대신 고유 이모지. 의존 관계 경고는 해당 줄 아래.
// (추후 설치 안내의 '📋 현재 설정 보기' 버튼도 이 빌더를 재사용)

const dot = (on) => on ? '🟢' : '🔴'
const ch = (id) => id ? `<#${id}>` : null
const role = (id) => id ? `<@&${id}>` : null

// 각 기능의 현재 상태: { on: true|false|null(값 전용 설정), value: 표시값|null, warn: 경고|null }
function stateOf (sub, guildId) {
  const gi = guildModule.getGuildInfo(guildId)
  const get = (k, f = null) => settings.get(guildId, k, f)
  const chOf = (k) => get(k) || (gi && gi[k]) || null

  switch (sub) {
    case '관리자역할':
      return { on: null, value: role(get('adminRole') || (gi && gi.adminRole)) || '미지정 (서버장·제작자만 관리)' }
    case '기본채널':
      return { on: null, value: ch(get('generalChannelId') || (gi && gi.generalChannelId)) || '미지정 (명령어 친 채널에 게시)' }
    case '손님권한부여':
      return { on: get('autoGuestRole', false), value: role(get('guestRole')) }
    case '감사로그':
      return { on: get('auditLog', false), value: ch(get('roleAuditingChannelId')) }
    case '승인권한부여': {
      const on = !!approveRoleOf(guildId)
      const warn = on && !get('auditLog', false) ? '⚠️ 감사로그가 꺼져 있어 승인 버튼이 안 떠요' : null
      return { on, value: role(get('guildMemberRole')), warn }
    }
    case '주간랭킹':
      return { on: get('weeklyEnabled', false), value: ch(chOf('weeklyMemberChannelId')) }
    case '자동삭제': {
      const entries = Object.entries(get('autoDeleteChannels', {}) || {})
      return { on: entries.length > 0, value: entries.length ? entries.map(([cid, m]) => `<#${cid}> ${m}분`).join(' · ') : null }
    }
    case '게임서버': {
      const set = get('gameServer')
      return { on: null, value: catalog.GAME_SERVERS.includes(set) ? set : `${catalog.DEFAULT_GAME_SERVER} (기본값)` }
    }
    case '오늘의미션':
      return { on: get('dailyMissionEnabled', false), value: ch(chOf('todayMissionChannelId')) }
    case '파티모집':
      return { on: get('partyRecruitEnabled', false), value: ch(chOf('partyChannelId')) }
    case '인게임파티모집현황': {
      const on = get('bugleBoardEnabled', false)
      let warn = null
      if (!on) {
        const users = new Set(partyAlerts.read().keywords.filter(k => k.guildId === guildId).map(k => k.userId))
        if (users.size) warn = `⚠️ ${users.size}명이 /파티알림을 등록했지만 꺼져 있어 알림이 안 가요`
      }
      return { on, value: ch(chOf('bugleHornChannelId')), warn }
    }
    default:
      return { on: null, value: null }
  }
}

function featureLine (f, guildId) {
  const st = stateOf(f.sub, guildId)
  const mark = st.on === null ? f.emoji : dot(st.on)
  let line = `${mark} **${f.sub}**${st.value ? ` · ${st.value}` : ''} — ${f.oneLine}`
  if (st.warn) line += `\n\u3000${st.warn}` // 전각 공백으로 들여쓰기
  return line
}

// 섹션별 줄 목록(그룹 헤더 포함)
function sectionLines (section, guildId) {
  const lines = []
  let lastGroup = null
  for (const f of catalog.FEATURES.filter(x => x.section === section)) {
    if (f.group && f.group !== lastGroup) lines.push(`**${catalog.GROUPS[f.group]}**`)
    lastGroup = f.group || null
    lines.push(featureLine(f, guildId))
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
      .setDescription(sectionLines(key, guild.id).join('\n').slice(0, 4096)))
  embeds[embeds.length - 1].setFooter({ text: '바꾸려면 /섯다라인설정 <항목이름>' })
  return { content: `⚙️ **${guild.name}** 설정`, embeds }
}

module.exports = { buildSettingsView, stateOf }
