/* global test, expect, jest, beforeEach */
// 파티모집은 포럼 전용 — 예전에 텍스트 채널로 저장된 서버 처리(경고·안내·제작자 1회 보고)
const { ChannelType } = require('discord.js')

const store = {}
jest.mock('../modules/guildSettings', () => ({
  get: (g, k, f) => (store[g] && k in store[g]) ? store[g][k] : f,
  set: (g, k, v) => { store[g] = store[g] || {}; store[g][k] = v }
}))
jest.mock('../modules/getGuildInfo', () => ({ getGuildInfo: () => ({}), getMonitorChannelId: () => null }))
jest.mock('../modules/perm', () => ({ isBotAdmin: () => true }))
jest.mock('../modules/partyAlerts', () => ({ read: () => ({ keywords: [] }) }))

const { isWrongType } = require('../modules/partyChannel')
const { stateOf, buildSettingsView } = require('../modules/settingsView')

const forum = { id: 'F', type: ChannelType.GuildForum }
const text = { id: 'T', type: ChannelType.GuildText }
const guildWith = (id, ...chs) => ({ id, name: id + '서버', ownerId: 'O' + id, channels: { cache: new Map(chs.map(c => [c.id, c])) } })

beforeEach(() => { for (const k of Object.keys(store)) delete store[k] })

test('isWrongType: 포럼은 정상, 텍스트는 문제, 채널 없음/미설정은 해당 없음', () => {
  store.A = { partyChannelId: 'F' }
  store.B = { partyChannelId: 'T' }
  store.C = { partyChannelId: 'gone' }
  expect(isWrongType(guildWith('A', forum))).toBe(false)
  expect(isWrongType(guildWith('B', text))).toBe(true)
  expect(isWrongType(guildWith('C'))).toBe(false)
  expect(isWrongType(guildWith('D'))).toBe(false)
})

test('설정 목록: 텍스트 채널이면 파티모집 줄 아래 경고', () => {
  store.B = { partyRecruitEnabled: true, partyChannelId: 'T' }
  const g = guildWith('B', text)
  expect(stateOf('파티모집', 'B', g).warn).toContain('포럼 채널이 아니라')
  expect(stateOf('파티모집', 'B').warn).toBeNull() // guild 없이 부르면 검사 안 함(기존 호출 호환)
  const ingame = buildSettingsView(g).embeds[1].data.description
  expect(ingame).toMatch(/파티모집\*\* · <#T>.*\n\u3000⚠️ 포럼 채널이 아니라/)
})

test('/섯다라인설정 파티모집: 채널 옵션은 포럼만, 옛 텍스트 채널로 켜기는 거절', async () => {
  const cmd = require('../commands/settings')
  const sub = cmd.data.toJSON().options.find(o => o.name === '파티모집')
  expect(sub.options.find(o => o.name === '채널').channel_types).toEqual([ChannelType.GuildForum])

  store.B = { partyChannelId: 'T' } // 예전에 저장된 텍스트 채널
  let reply
  const g = guildWith('B', text)
  const interaction = {
    member: { guild: g, permissions: { has: () => true } },
    guild: g,
    user: { id: '280290004926857216', username: 'dev' },
    client: { users: { fetch: async () => ({ send: async () => {} }) } },
    options: { getSubcommand: () => '파티모집', getString: (n) => n === '상태' ? 'on' : null, getChannel: () => null, getRole: () => null, getInteger: () => null },
    reply: async (p) => { reply = p }
  }
  await cmd.run({ interaction })
  expect(reply.content).toContain('포럼 채널이 아니야')
  expect(store.B.partyRecruitEnabled).toBeUndefined()
})

test('기동 점검: 켜져 있고 텍스트 채널인 서버만 제작자에게 한 번 DM', async () => {
  const check = require('../events/ready/partyChannelCheck')
  store.A = { partyRecruitEnabled: true, partyChannelId: 'F' }
  store.B = { partyRecruitEnabled: true, partyChannelId: 'T' }
  store.C = { partyRecruitEnabled: false, partyChannelId: 'T' }
  const sent = []
  const client = {
    guilds: { cache: new Map([['A', guildWith('A', forum)], ['B', guildWith('B', text)], ['C', guildWith('C', text)]]) },
    users: { fetch: async () => ({ send: async (p) => sent.push(p) }) }
  }
  await check(client)
  expect(sent).toHaveLength(1)
  expect(sent[0].content).toContain('B서버')
  expect(sent[0].content).not.toContain('A서버')
  expect(sent[0].content).not.toContain('C서버')
  await check(client) // 재시작해도 같은 설정은 다시 안 알림
  expect(sent).toHaveLength(1)
})
