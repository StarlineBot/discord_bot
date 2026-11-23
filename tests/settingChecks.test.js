/* global test, expect, jest, beforeEach */
// /섯다라인설정 값 검사 — 설정은 성공인데 실제로 동작 안 하는 경우를 막는지
const { ChannelType, PermissionsBitField, PermissionFlagsBits: P } = require('discord.js')

const store = {}
jest.mock('../modules/guildSettings', () => ({
  get: (g, k, f) => (store[g] && k in store[g]) ? store[g][k] : f,
  set: (g, k, v) => { store[g] = store[g] || {}; store[g][k] = v }
}))
jest.mock('../modules/getGuildInfo', () => ({ getGuildInfo: () => ({}), getMonitorChannelId: () => null }))
jest.mock('../modules/partyAlerts', () => ({ read: () => ({ keywords: [] }) }))
jest.mock('../modules/perm', () => ({ isBotAdmin: () => true, isOwnerOrDev: () => true }))

const checks = require('../modules/settingChecks')
const { buildSettingsView } = require('../modules/settingsView')
const cmd = require('../commands/settings')

const G = 'G'
const ALL = [P.ViewChannel, P.SendMessages, P.SendMessagesInThreads, P.EmbedLinks, P.AttachFiles, P.ReadMessageHistory, P.ManageMessages, P.ManageThreads, P.ManageChannels]
const bits = (list) => new PermissionsBitField(list)

// 가짜 서버: 봇 역할 위치 10, 채널별 봇 권한·@everyone 보기 여부 지정
function makeGuild ({ botPerms = [P.ManageRoles], channels = [], roles = [] } = {}) {
  const botTop = { id: 'BOT', position: 10 }
  const everyone = { id: G, position: 0 }
  const me = { id: 'me', permissions: bits(botPerms), roles: { highest: botTop } }
  const chMap = new Map(channels.map(c => [c.id, {
    id: c.id,
    type: c.type ?? ChannelType.GuildText,
    permissionsFor: (who) => who === everyone ? bits(c.public ? [P.ViewChannel] : []) : bits(c.perms ?? ALL)
  }]))
  const roleMap = new Map([[G, everyone], [botTop.id, botTop], ...roles.map(r => [r.id, r])])
  return { id: G, name: '테스트', members: { me }, channels: { cache: chMap }, roles: { cache: roleMap, everyone } }
}

function run (guild, sub, opts = {}) {
  let reply
  const interaction = {
    member: { guild },
    guild,
    user: { id: '280290004926857216', username: 'dev' },
    client: { users: { fetch: async () => ({ send: async () => {} }) } },
    options: {
      getSubcommand: () => sub,
      getString: (n) => n === '상태' ? (opts.state || 'on') : null,
      getChannel: () => opts.channel ? guild.channels.cache.get(opts.channel) : null,
      getRole: () => opts.role ? guild.roles.cache.get(opts.role) : null,
      getInteger: (n) => n === '분' ? (opts.minutes ?? null) : null
    },
    reply: async (p) => { reply = p }
  }
  return cmd.run({ interaction }).then(() => reply.content)
}

beforeEach(() => { for (const k of Object.keys(store)) delete store[k] })

test('관리자역할 @everyone 차단(보안)', async () => {
  const g = makeGuild()
  expect(await run(g, '관리자역할', { role: G })).toContain('`@everyone`은 지정할 수 없어요')
  expect(store.G).toBeUndefined()
})

test('손님권한부여: 봇보다 위 역할·관리형 역할·역할 관리 권한 없음 → 거절, 정상 역할은 저장', async () => {
  const roles = [{ id: 'HIGH', position: 12 }, { id: 'SAME', position: 10 }, { id: 'BOOST', position: 2, managed: true }, { id: 'GUEST', position: 3 }]
  const g = makeGuild({ roles })
  expect(await run(g, '손님권한부여', { role: 'HIGH' })).toContain('봇 역할(<@&BOT>)보다 위')
  expect(await run(g, '손님권한부여', { role: 'SAME' })).toContain('봇 역할(<@&BOT>)보다 위')
  expect(await run(g, '손님권한부여', { role: 'BOOST' })).toContain('디스코드가 관리하는 역할')
  expect(store.G).toBeUndefined() // 거절되면 아무것도 저장 안 함
  expect(await run(makeGuild({ roles, botPerms: [] }), '손님권한부여', { role: 'GUEST' })).toContain('역할 관리** 권한이 없어')
  expect(await run(g, '손님권한부여', { role: 'GUEST' })).toContain('켰어')
  expect(store.G).toEqual({ guestRole: 'GUEST', autoGuestRole: true })
})

test('승인권한부여: 손님 역할과 같으면 켜되 경고', async () => {
  const g = makeGuild({ roles: [{ id: 'R', position: 3 }] })
  store.G = { guestRole: 'R', auditLog: true }
  const content = await run(g, '승인권한부여', { role: 'R' })
  expect(content).toContain('켰어')
  expect(content).toContain('손님 역할과 승인 역할이 같은 역할')
})

test('채널 권한 없음 → 거절하고 이전 설정 유지', async () => {
  const g = makeGuild({ channels: [{ id: 'C', perms: [P.ViewChannel] }, { id: 'OK' }] })
  store.G = { weeklyMemberChannelId: 'OK' }
  const content = await run(g, '주간랭킹', { channel: 'C' })
  expect(content).toContain('메시지 보내기')
  expect(content).toContain('파일 첨부')
  expect(store.G).toEqual({ weeklyMemberChannelId: 'OK' }) // 채널 안 바뀜, 안 켜짐
})

test('지워진 채널로 켜기 → 거절', async () => {
  store.G = { todayMissionChannelId: 'GONE' }
  expect(await run(makeGuild(), '오늘의미션')).toContain('찾을 수 없어')
  expect(store.G.dailyMissionEnabled).toBeUndefined()
})

test('파티모집: 채널 관리 권한 없으면 켜되 태그 경고, 스레드 관리 없으면 거절', async () => {
  const forum = (id, perms) => ({ id, type: ChannelType.GuildForum, perms })
  const noManageCh = ALL.filter(p => p !== P.ManageChannels)
  const noThreads = ALL.filter(p => p !== P.ManageThreads)
  const g = makeGuild({ channels: [forum('F1', noManageCh), forum('F2', noThreads)] })
  const ok = await run(g, '파티모집', { channel: 'F1' })
  expect(ok).toContain('켰어')
  expect(ok).toContain('던전 태그')
  expect(await run(g, '파티모집', { channel: 'F2' })).toContain('스레드 관리')
})

test('감사로그: 공개 채널·자동삭제 채널이면 켜되 경고', async () => {
  const g = makeGuild({ channels: [{ id: 'L', public: true }] })
  store.G = { autoDeleteChannels: { L: 5 } }
  const content = await run(g, '감사로그', { channel: 'L' })
  expect(content).toContain('켰어')
  expect(content).toContain('모든 사람이 볼 수 있는 채널')
  expect(content).toContain('자동삭제(5분)')
})

test('자동삭제: 메시지 관리 권한 없으면 거절, 다른 기능 채널이면 경고', async () => {
  const g = makeGuild({ channels: [{ id: 'N', perms: [P.ViewChannel, P.ReadMessageHistory] }, { id: 'L' }] })
  expect(await run(g, '자동삭제', { channel: 'N', minutes: 5 })).toContain('메시지 관리')
  store.G = { auditLog: true, roleAuditingChannelId: 'L' }
  const content = await run(g, '자동삭제', { channel: 'L', minutes: 5 })
  expect(content).toContain('켰어')
  expect(content).toContain('**감사로그** 채널이기도 해서')
})

test('목록: 나중에 깨진 설정(역할 순서·권한·채널 삭제)을 해당 줄 아래 경고', () => {
  const g = makeGuild({ roles: [{ id: 'HIGH', position: 12 }], channels: [{ id: 'C', perms: [P.ViewChannel] }] })
  store.G = { autoGuestRole: true, guestRole: 'HIGH', weeklyEnabled: true, weeklyMemberChannelId: 'C', dailyMissionEnabled: true, todayMissionChannelId: 'GONE', adminRole: G }
  const [admin, ingame] = buildSettingsView(g).embeds.map(e => e.data.description)
  expect(admin).toMatch(/손님권한부여.*\n\u3000⚠️ <@&HIGH>이\(가\) 봇 역할/)
  expect(admin).toMatch(/주간랭킹.*\n\u3000⚠️ 봇이 <#C>에서 \*\*메시지 보내기/)
  expect(admin).toMatch(/관리자역할.*\n\u3000⚠️ `@everyone`/)
  expect(ingame).toMatch(/오늘의미션.*\n\u3000⚠️ 지정한 채널\(<#GONE>\)을 찾을 수 없어요/)
})

test('봇 정보를 캐시에서 못 찾으면 검사를 건너뜀(잘못 막지 않게)', () => {
  const g = makeGuild({ roles: [{ id: 'HIGH', position: 12 }] })
  g.members.me = null
  expect(checks.roleBlock(g, g.roles.cache.get('HIGH'))).toBeNull()
})
