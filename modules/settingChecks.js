const { PermissionFlagsBits: P } = require('discord.js')
const settings = require('./guildSettings')

// /섯다라인설정 값 검사(단일 출처) — "설정은 성공했는데 실제로는 동작 안 함"을 미리 막는다.
//  - 설정할 때: block(역할·채널 권한·사라진 채널) → 거절 / warn(충돌·공개 채널) → 설정하되 같이 안내
//  - /섯다라인설정 목록: 같은 검사를 다시 돌려 해당 줄 아래 ⚠️ (나중에 역할 순서·채널 권한이 바뀐 경우)
// 봇 자신(guild.members.me)을 캐시에서 못 찾으면 검사를 건너뛴다(잘못 막지 않게).

const PERM_NAMES = new Map([
  [P.ViewChannel, '채널 보기'],
  [P.SendMessages, '메시지 보내기(포럼은 게시물 만들기)'],
  [P.SendMessagesInThreads, '스레드에서 메시지 보내기'],
  [P.EmbedLinks, '링크 첨부(임베드)'],
  [P.AttachFiles, '파일 첨부'],
  [P.ReadMessageHistory, '메시지 기록 보기'],
  [P.ManageMessages, '메시지 관리'],
  [P.ManageThreads, '스레드 관리'],
  [P.ManageChannels, '채널 관리'],
  [P.ManageRoles, '역할 관리']
])

// 기능별로 봇에게 필요한 채널 권한. required = 없으면 기능이 안 됨(설정 거절), optional = 일부만 안 됨(경고)
const FEATURE_PERMS = {
  감사로그: { required: [P.ViewChannel, P.SendMessages, P.EmbedLinks] },
  인게임파티모집현황: { required: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.ReadMessageHistory] }, // 보드 1개를 찾아 수정
  주간랭킹: { required: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles] },
  오늘의미션: { required: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles] },
  기본채널: { required: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles] },
  파티모집: {
    required: [P.ViewChannel, P.SendMessages, P.SendMessagesInThreads, P.ReadMessageHistory, P.ManageThreads], // 글 생성·참가 갱신·오래된 글 정리
    optional: [[P.ManageChannels, '없으면 처음 보는 던전 태그를 자동으로 못 만들어']]
  },
  자동삭제: { required: [P.ViewChannel, P.ReadMessageHistory, P.ManageMessages] }
}

const me = (guild) => (guild && guild.members && guild.members.me) || null

// 채널에서 봇에게 없는 필수 권한 → 안내 문구 | null
function channelBlock (guild, channel, feature) {
  const bot = me(guild)
  const spec = FEATURE_PERMS[feature]
  if (!bot || !channel || !spec || typeof channel.permissionsFor !== 'function') return null
  const perms = channel.permissionsFor(bot)
  if (!perms) return null
  const missing = spec.required.filter(p => !perms.has(p)).map(p => PERM_NAMES.get(p))
  return missing.length ? `봇이 <#${channel.id}>에서 **${missing.join(', ')}** 권한이 없어 동작하지 않아요 (채널 설정 > 권한에서 봇에게 허용)` : null
}

// 채널 권한 중 선택 권한 경고 목록
function channelOptionalWarns (guild, channel, feature) {
  const bot = me(guild)
  const spec = FEATURE_PERMS[feature]
  if (!bot || !channel || !spec || !spec.optional || typeof channel.permissionsFor !== 'function') return []
  const perms = channel.permissionsFor(bot)
  if (!perms) return []
  return spec.optional.filter(([p]) => !perms.has(p)).map(([p, why]) => `봇에게 <#${channel.id}> **${PERM_NAMES.get(p)}** 권한이 없어요 — ${why}`)
}

// 역할 문제 → 안내 문구 | null
//  assign=true: 봇이 그 역할을 줘야 하는 기능(손님·승인) → 역할 관리 권한·역할 순서·관리형 역할까지 검사
//  assign=false: 관리자역할(봇이 주지 않음) → @everyone만 막음
function roleBlock (guild, role, { assign = true } = {}) {
  if (!guild || !role) return null
  if (role.id === guild.id) return '`@everyone`은 지정할 수 없어요' + (assign ? '' : ' (서버 모든 사람이 봇 관리자가 돼요)')
  if (!assign) return null
  if (role.managed) return `<@&${role.id}>은(는) 봇·연동 앱·서버 부스트처럼 디스코드가 관리하는 역할이라 줄 수 없어요`
  const bot = me(guild)
  if (!bot) return null
  if (!bot.permissions.has(P.ManageRoles)) return '봇에게 **역할 관리** 권한이 없어 역할을 줄 수 없어요 (서버 설정 > 역할 > 봇 역할에서 허용)'
  const top = bot.roles.highest
  if (top && role.position >= top.position) {
    return `<@&${role.id}>이(가) 봇 역할(<@&${top.id}>)보다 위(또는 같은 위치)라 줄 수 없어요 (서버 설정 > 역할에서 봇 역할을 그 역할보다 위로 끌어올려 주세요)`
  }
  return null
}

// 채널 ID → 채널 | null (지워진 채널 확인용)
const channelOf = (guild, id) => (id && guild && guild.channels && guild.channels.cache.get(id)) || null

// 다른 기능이 쓰는 채널과 자동삭제가 겹치는지: 채널 ID → ['감사로그', ...]
function featuresUsingChannel (guildId, channelId) {
  const get = (k, f = null) => settings.get(guildId, k, f)
  const uses = [
    ['감사로그', get('auditLog', false) && get('roleAuditingChannelId'), '입장 로그·승인 버튼까지 지워져요'],
    ['인게임파티모집현황', get('bugleBoardEnabled', false) && get('bugleHornChannelId'), '파티보드가 지워졌다 다시 올라오기를 반복해요'],
    ['주간랭킹', get('weeklyEnabled', false) && get('weeklyMemberChannelId'), '랭킹 게시물이 금방 사라져요'],
    ['오늘의미션', get('dailyMissionEnabled', false) && get('todayMissionChannelId'), '미션 게시물이 금방 사라져요'],
    ['기본채널', get('generalChannelId'), '명령어 결과가 금방 사라져요(일부러 그런 거면 괜찮아요)']
  ]
  return uses.filter(([, id]) => id && id === channelId).map(([name, , why]) => ({ name, why }))
}

// 자동삭제 채널 ↔ 다른 기능 채널 충돌 경고 목록
function autoDeleteConflictWarns (guildId, channelId) {
  return featuresUsingChannel(guildId, channelId).map(f => `<#${channelId}>은(는) **${f.name}** 채널이기도 해서 자동삭제로 ${f.why}`)
}

// 기능 채널을 자동삭제 채널로 지정할 때 경고
function channelIsAutoDeleted (guildId, channelId) {
  const map = settings.get(guildId, 'autoDeleteChannels', {}) || {}
  return channelId && map[channelId] !== undefined ? `<#${channelId}>은(는) 자동삭제(${map[channelId]}분)가 켜진 채널이라 게시물이 지워져요` : null
}

// 감사로그 채널이 @everyone에게 보이면 경고
function publicChannelWarn (guild, channel) {
  if (!guild || !channel || typeof channel.permissionsFor !== 'function' || !guild.roles) return null
  const everyone = guild.roles.everyone
  const perms = everyone && channel.permissionsFor(everyone)
  return perms && perms.has(P.ViewChannel) ? `<#${channel.id}>은(는) 모든 사람이 볼 수 있는 채널이라 입퇴장 기록·승인 버튼이 전부 공개돼요` : null
}

// 손님 역할 = 승인 역할이면 경고
function sameRoleWarn (guildId) {
  const guest = settings.get(guildId, 'guestRole', null)
  const approve = settings.get(guildId, 'guildMemberRole', null)
  return guest && guest === approve ? `손님 역할과 승인 역할이 같은 역할(<@&${guest}>)이라 입장하자마자 정식 역할을 받는 셈이에요` : null
}

module.exports = {
  FEATURE_PERMS,
  channelBlock,
  channelOptionalWarns,
  roleBlock,
  channelOf,
  autoDeleteConflictWarns,
  channelIsAutoDeleted,
  publicChannelWarn,
  sameRoleWarn
}
