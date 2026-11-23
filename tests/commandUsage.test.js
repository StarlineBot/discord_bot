/* global test, expect, beforeEach, afterEach, jest */
// 명령어 사용량 기록(modules/commandUsage.js) — 집계·월 경계·제작자 제외·날짜 바뀔 때 사용자 목록 정리
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { DateTime } = require('luxon')
const { createUsage } = require('../modules/commandUsage')
const { buildCommandView, parseDays } = require('../modules/ownerStatus')

const DEV = 'dev-id'
const ALT = 'alt-id'
let dir
let clock

// KST 시각 문자열로 현재 시각 지정
const at = (iso) => { clock = DateTime.fromISO(iso, { zone: 'Asia/Seoul' }) }
const make = (opts = {}) => createUsage({ dir, salt: 'pepper', excludeIds: [DEV, ALT], now: () => clock, ...opts })
const readFile = (month) => JSON.parse(fs.readFileSync(path.join(dir, `commands-${month}.json`), 'utf8'))

function ix ({ name = '요리', sub = null, user = 'u1', guild = 'g1' } = {}) {
  return {
    commandName: name,
    guildId: guild,
    user: { id: user },
    options: {
      getSubcommand: (required) => {
        if (sub) return sub
        if (required !== false) throw new Error('no sub')
        return null
      }
    }
  }
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usage-'))
  at('2026-11-23T12:00:00')
})
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

test('횟수·하위 명령·DM·시간·사용자 수를 하루·서버·명령별로 합친다', () => {
  const u = make()
  u.record(ix(), 'ok', 100)
  u.record(ix({ user: 'u2' }), 'ok', 300)
  u.record(ix(), 'err', 200) // 같은 사람 → 사용자 수 그대로
  u.record(ix({ name: '경매장', sub: '유물' }), 'ok', 50)
  u.record(ix({ name: '운세', guild: null }), 'ok', 10)
  u.flush()

  const day = readFile('2026-11')['2026-11-23']
  expect(day.g1['요리']).toMatchObject({ ok: 2, err: 1, users: 2, msAvg: 200, msMax: 300 })
  expect(day.g1['경매장 유물']).toMatchObject({ ok: 1, err: 0, users: 1 })
  expect(day.DM['운세']).toMatchObject({ ok: 1, users: 1 })
})

test('사용자 ID 원문은 파일에 남기지 않는다(당일 해시 10글자만)', () => {
  const u = make()
  u.record(ix({ user: '123456789012345678' }), 'ok', 1)
  u.flush()
  const raw = fs.readFileSync(path.join(dir, 'commands-2026-11.json'), 'utf8')
  expect(raw).not.toContain('123456789012345678')
  const ids = readFile('2026-11')['2026-11-23'].g1['요리']._ids
  expect(ids).toHaveLength(1)
  expect(ids[0]).toMatch(/^[0-9a-f]{10}$/)
})

test('제작자(developerId·부계정)는 세지 않는다', () => {
  const u = make()
  u.record(ix({ user: DEV }), 'ok', 1)
  u.record(ix({ user: ALT }), 'ok', 1)
  u.flush()
  expect(fs.existsSync(path.join(dir, 'commands-2026-11.json'))).toBe(false)
  u.record(ix({ user: 'u1' }), 'ok', 1)
  u.flush()
  expect(readFile('2026-11')['2026-11-23'].g1['요리'].ok).toBe(1)
})

test('날짜(KST)가 바뀌면 전날 사용자 목록은 지우고 숫자만 남긴다', () => {
  const u = make()
  u.record(ix({ user: 'u1' }), 'ok', 1)
  u.record(ix({ user: 'u2' }), 'ok', 1)
  at('2026-11-24T00:05:00') // KST 자정 지남(UTC로는 아직 23일)
  u.record(ix({ user: 'u1' }), 'ok', 1)
  u.flush()

  const data = readFile('2026-11')
  expect(data['2026-11-23'].g1['요리']).toEqual({ ok: 2, err: 0, users: 2, msAvg: 1, msMax: 1 })
  expect(data['2026-11-24'].g1['요리'].users).toBe(1) // 새 날은 다시 셈
  expect(data['2026-11-24'].g1['요리']._ids).toHaveLength(1)
})

test('재시작 후 날이 바뀌어 있어도 읽을 때 전날 목록을 정리한다', () => {
  const first = make()
  first.record(ix({ user: 'u9' }), 'ok', 1)
  first.flush()
  expect(readFile('2026-11')['2026-11-23'].g1['요리']._ids).toBeDefined()

  at('2026-11-24T09:00:00')
  const restarted = make()
  restarted.record(ix({ guild: 'g2' }), 'ok', 1)
  restarted.flush()
  expect(readFile('2026-11')['2026-11-23'].g1['요리']._ids).toBeUndefined()
})

test('월 경계: 달이 바뀌면 새 월 파일에 쓰고, 이전 달 파일은 목록을 정리해 저장한다', () => {
  at('2026-11-30T23:59:00')
  const u = make()
  u.record(ix(), 'ok', 1)
  at('2026-12-01T00:00:30')
  u.record(ix(), 'ok', 1)
  u.flush()

  const nov = readFile('2026-11')
  const dec = readFile('2026-12')
  expect(nov['2026-11-30'].g1['요리']).toEqual({ ok: 1, err: 0, users: 1, msAvg: 1, msMax: 1 })
  expect(dec['2026-12-01'].g1['요리']).toMatchObject({ ok: 1, users: 1 })
  expect(dec['2026-11-30']).toBeUndefined()
})

test('USAGE_SALT가 없으면 사용자 수만 집계하지 않는다', () => {
  const u = make({ salt: '' })
  u.record(ix(), 'ok', 5)
  u.flush()
  const e = readFile('2026-11')['2026-11-23'].g1['요리']
  expect(e).toEqual({ ok: 1, err: 0, msAvg: 5, msMax: 5 })
})

test('기록 실패(저장 불가 등)는 예외를 밖으로 내지 않는다', () => {
  const u = make({ dir: path.join(dir, 'file-not-dir') })
  fs.writeFileSync(path.join(dir, 'file-not-dir'), 'x') // 폴더 자리에 파일 → 쓰기 실패
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect(() => u.record(ix(), 'ok', 1)).not.toThrow()
  expect(() => u.record(null, 'ok', 1)).not.toThrow()
  expect(() => u.flush()).not.toThrow()
  spy.mockRestore()
})

test('wrapCommands: 성공은 ok, 예외는 err로 세고 예외는 그대로 다시 던진다', async () => {
  const u = make()
  const commands = [
    { name: '요리', run: async () => 'done' },
    { name: '듀얼', run: async () => { throw new Error('boom') } }
  ]
  u.wrapCommands(commands)
  u.wrapCommands(commands) // 두 번 감싸도 한 번만 센다
  await expect(commands[0].run({ interaction: ix() })).resolves.toBe('done')
  await expect(commands[1].run({ interaction: ix({ name: '듀얼' }) })).rejects.toThrow('boom')
  u.flush()
  const g1 = readFile('2026-11')['2026-11-23'].g1
  expect(g1['요리']).toMatchObject({ ok: 1, err: 0 })
  expect(g1['듀얼']).toMatchObject({ ok: 0, err: 1 })
})

test('summary: 기간 합계·월을 넘는 기간·0회 명령(비활성·베타 제외)·서버별', () => {
  const u = make()
  u.wrapCommands([
    { name: '요리', description: '요리', run: async () => {} },
    { name: '경매장', description: '경매장', run: async () => {} },
    { name: '사주팔자', description: '사주', run: async () => {} },
    { name: '튼주', description: '튼주', deleted: true, run: async () => {} },
    { name: '실험', description: '[BETA] 실험', run: async () => {} },
    { name: '숨김베타', description: 'x', beta: true, run: async () => {} }
  ])
  at('2026-11-28T10:00:00')
  u.record(ix({ user: 'a' }), 'ok', 100)
  u.record(ix({ user: 'b', guild: 'g2' }), 'err', 300)
  at('2026-12-02T10:00:00')
  u.record(ix({ user: 'a' }), 'ok', 200)
  u.record(ix({ name: '경매장', sub: '유물' }), 'ok', 3000)
  at('2026-12-03T10:00:00')

  const s7 = u.summary(7) // 11-27 ~ 12-03
  expect(s7.from).toBe('2026-11-27')
  const cook = s7.rows.find(r => r.key === '요리')
  expect(cook).toMatchObject({ ok: 2, err: 1, total: 3, users: 3, msAvg: 200, msMax: 300 })
  expect(s7.rows[0].key).toBe('요리')
  expect(s7.unused).toEqual(['사주팔자'])
  expect(s7.byGuild).toEqual([{ guildId: 'g1', total: 3 }, { guildId: 'g2', total: 1 }])

  const s2 = u.summary(2) // 12-02 ~ 12-03 → 11월 기록 빠짐
  expect(s2.rows.find(r => r.key === '요리').total).toBe(1)

  const view = buildCommandView(s7, null).embeds[0].data
  expect(view.description).toContain('🥇 **요리** 3회 · 3명')
  expect(view.description).toContain('⚠️ 에러 많음: 요리 err 1/3 (33%)')
  expect(view.description).toContain('🐢 느림: 경매장 유물 평균 3.0초')
  expect(view.description).toContain('💤 7일간 0회: 사주팔자')
})

test('parseDays: 기본 7일, 숫자가 아니면 null', () => {
  expect(parseDays('')).toBe(7)
  expect(parseDays('30')).toBe(30)
  expect(parseDays('abc')).toBeNull()
  expect(parseDays('0')).toBeNull()
})
