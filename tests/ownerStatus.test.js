/* global test, expect */
// !현황 애드온 '켠 기능' 표시 — 새 앱 featureUsage(날짜) / 옛 앱 enabled(bool) 섞인 값 처리
const { featureView } = require('../modules/ownerStatus')

// 서버가 받은 시각: 2026-11-18 01:30 KST (= 11-17 16:30 UTC) → 기준일 11-18
const UPDATED = '2026-11-17T16:30:00Z'
const keys = (list) => list.map(f => f.key)

test('날짜 값: 받은 날 포함 7일(0~6일 전)만 🟢, 7일 전부터는 표시 안 함', () => {
  const v = featureView({
    updated: UPDATED,
    features: { today: '2026-11-18', d6: '2026-11-12', d7: '2026-11-11', old: '2026-10-01' }
  })
  expect(keys(v.on)).toEqual(['today', 'd6'])
  expect(v.off).toEqual([])
})

test('KST 기준일: UTC로는 전날이어도 KST 날짜로 센다', () => {
  // UTC 11-17 16:30 이지만 KST로는 11-18 → 11-12는 6일 전(🟢)
  expect(keys(featureView({ updated: UPDATED, features: { a: '2026-11-12' } }).on)).toEqual(['a'])
})

test('미래 날짜는 받은 날로 본다', () => {
  const v = featureView({ updated: UPDATED, features: { future: '2026-11-25' } })
  expect(v.on).toEqual([{ key: 'future', date: '2026-11-25', daysAgo: 0 }])
})

test('이상한 값은 무시', () => {
  const v = featureView({ updated: UPDATED, features: { bad: '어제', badDate: '2026-02-30', num: 3, nul: null } })
  expect(v).toEqual({ on: [], off: [] })
})

test('옛 bool과 날짜가 섞인 행: bool true 🟢 / false 🔴, autofindV2는 숨김, 최근 사용 순', () => {
  const v = featureView({
    updated: UPDATED,
    features: { blackbox: true, cursorFx: false, autofindV2: true, halo: '2026-11-15', bossPattern: '2026-11-18' }
  })
  expect(keys(v.on)).toEqual(['bossPattern', 'halo', 'blackbox'])
  expect(keys(v.off)).toEqual(['cursorFx'])
})

test('설정 없음/빈 값', () => {
  expect(featureView(null)).toEqual({ on: [], off: [] })
  expect(featureView({ updated: UPDATED, features: {} })).toEqual({ on: [], off: [] })
})

test('!현황 애드온: 사용자 줄에 앱 버전 표시(없으면 ?)', async () => {
  const axios = require('axios')
  const { addonStatus } = require('../modules/ownerStatus')
  const user = (name, app) => ({
    discord_id: name,
    name,
    tier: 'user',
    status: 'active',
    created: UPDATED,
    last_seen: UPDATED,
    settings: { rev: 1, updated: UPDATED, device: 'PC', resolution: '2560x1440', size: 1024, features: {}, app }
  })
  const orig = axios.get
  axios.get = async () => ({ data: { users: [user('새앱', '0.52.2'), user('옛앱', null)] } })
  try {
    const summary = (await addonStatus('')).embeds[0].data.description
    expect(summary).toContain('v0.52.2 · PC · 2560x1440')
    expect(summary).toContain('앱 버전 ? · PC · 2560x1440')
    const detail = (await addonStatus('새앱')).embeds[0].data.description
    expect(detail).toContain('v0.52.2 · PC PC · 해상도 2560x1440')
  } finally {
    axios.get = orig
  }
})
