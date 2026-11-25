/* global test, expect */
// !현황 애드온 캐릭터 사용 현황(애드온 명세 3.4.4) — 요약 줄·사용자 줄
const { characterSummary, charLabel, affinityBucket, addonStatus } = require('../modules/ownerStatus')

const UPDATED = '2026-11-25T03:00:00Z' // KST 11-25 12:00 → 기준일 11-25
const S = (character, features = {}) => ({ updated: UPDATED, features, character })

test('캐릭터별 사람 수(로그인·비로그인 구분, 기본 목소리 포함, 많은 순)', () => {
  const lines = characterSummary([
    { s: S({ pack: '조용한 여성' }), guest: false },
    { s: S({ pack: '조용한 여성' }), guest: true },
    { s: S({ pack: '조용한 여성' }), guest: false },
    { s: S({ pack: '' }), guest: true },
    { s: S({ pack: '신비한 목소리' }), guest: false }, // 모르는 팩은 이름 그대로
    { s: S(null), guest: false } // 캐릭터 자료 없음(옛 업로드) → 빼고 셈
  ])
  expect(lines[0]).toBe('🎭 캐릭터: 다래 3 (로그인 2 · 비로그인 1) · 기본 1 (로그인 0 · 비로그인 1) · 신비한 목소리 1 (로그인 1 · 비로그인 0)')
})

test('펫·목소리: 최근 7일(받은 날 포함 0~6일 전) 경계, 미래 날짜는 오늘, 옛 앱 대체 규칙', () => {
  const pack = '부드러운 여성'
  const lines = characterSummary([
    { s: S({ pack, pet: false }, { pet: '2026-11-19', character_voice: '2026-11-19' }), guest: false }, // 6일 전 → 셈
    { s: S({ pack, pet: true }, { pet: '2026-11-18', character_voice: '2026-11-18' }), guest: false }, // 7일 전 → 안 셈(character.pet true여도 날짜 우선)
    { s: S({ pack, pet: false }, { pet: '2026-12-01' }), guest: true }, // 미래 → 오늘로 봄
    { s: S({ pack, pet: true }, { buff: '2026-11-25' }), guest: true }, // featureUsage에 pet 키 없음(옛 앱) → character.pet로 대신, 목소리는 안 셈
    { s: S({ pack: '', pet: true }), guest: true } // 기본 목소리는 펫으로 안 셈
  ])
  expect(lines[1]).toBe('🐾 펫 띄움 3명 · 🔔 캐릭터 목소리 알림 1명')
})

test('호감도 구간 경계(24/25/49/50/74/75/99/100), 기본 목소리·이상한 값 제외', () => {
  for (const [v, b] of [[0, '0~24'], [24, '0~24'], [24.9, '0~24'], [25, '25~49'], [49, '25~49'], [50, '50~74'], [74, '50~74'], [75, '75~99'], [99, '75~99'], [99.9, '75~99'], [100, '100']]) {
    expect(affinityBucket(v)).toBe(b)
  }
  for (const bad of [undefined, null, '30', -1, 101, NaN]) expect(affinityBucket(bad)).toBeNull()
  const pack = '화난 여성'
  const lines = characterSummary([24, 25, 49, 50, 74, 75, 99, 100, '이상함'].map(a => ({ s: S({ pack, affinity: a }), guest: false }))
    .concat([{ s: S({ pack: '', affinity: 90 }), guest: true }]))
  expect(lines[2]).toBe('💗 호감도: 0~24 1 · 25~49 2 · 50~74 2 · 75~99 2 · 100 1')
})

test('자료가 하나도 없으면 한 줄만', () => {
  expect(characterSummary([{ s: S(null), guest: false }])).toEqual(['🎭 캐릭터: 자료 없음'])
})

test('사용자 줄 표기', () => {
  expect(charLabel(S({ pack: '차분한 남성', pet: true }, { pet: '2026-11-25' }))).toBe('캐릭터: 이안(펫)')
  expect(charLabel(S({ pack: '장난스러운 남성', pet: false }))).toBe('캐릭터: Starline')
  expect(charLabel(S({ pack: '', pet: true }))).toBe('캐릭터: 기본')
  expect(charLabel(S({ pack: '자연스러운 여성' }, { pet: '2026-11-01' }))).toBe('캐릭터: 이름 미정')
  expect(charLabel(S(null))).toBeNull()
  expect(charLabel(S({ pack: 7 }))).toBeNull() // 형식 틀림 무시
})

test('!현황 애드온 화면: 맨 위 요약 3줄 + 사용자 줄에 캐릭터 칸(로그인·guest)', async () => {
  const axios = require('axios')
  const { DateTime } = require('luxon')
  const now = DateTime.now().toUTC()
  const iso = (d) => now.minus({ days: d }).toISO({ suppressMilliseconds: true })
  const today = now.setZone('Asia/Seoul').toISODate()
  const users = [
    {
      discord_id: '1',
      name: '로그인',
      tier: 'user',
      status: 'active',
      created: iso(3),
      last_seen: iso(0),
      settings: { rev: 3, updated: iso(0), device: 'PC', resolution: '1920x1080', size: 1024, app: '0.57.0', features: { pet: today }, character: { pack: '조용한 여성', pet: true, affinity: 10 } }
    },
    {
      discord_id: '2',
      name: '오래전',
      tier: 'user',
      status: 'active',
      created: iso(30),
      last_seen: iso(20),
      settings: { rev: 1, updated: iso(20), device: 'PC', resolution: '1920x1080', size: 1024, app: '0.50.0', features: {}, character: { pack: '화난 여성' } }
    }
  ]
  const guests = [{ install_id: 'abcdef0123456789abcdef0123456789', updated: iso(1), resolution: '2560x1440', size: 10, app: '0.57.0', features: {}, character: { pack: '' } }]
  const orig = axios.get
  axios.get = async () => ({ data: { users, guests } })
  try {
    const lines = (await addonStatus('')).embeds[0].data.description.split('\n')
    expect(lines.slice(0, 4)).toEqual([
      '👤 비로그인 1명(최근 7일)',
      '🎭 캐릭터: 기본 1 (로그인 0 · 비로그인 1) · 다래 1 (로그인 1 · 비로그인 0)', // 20일 전 접속한 사람은 요약에서 빠짐
      '🐾 펫 띄움 1명 · 🔔 캐릭터 목소리 알림 0명',
      '💗 호감도: 0~24 1 · 25~49 0 · 50~74 0 · 75~99 0 · 100 0'
    ])
    const desc = lines.join('\n')
    expect(desc).toContain('v0.57.0 · PC · 1920x1080 · 켠 기능 1개 · 캐릭터: 다래(펫)')
    expect(desc).toContain('v0.57.0 · 2560x1440 · 켠 기능 0개 · 캐릭터: 기본')
  } finally {
    axios.get = orig
  }
})
