/* global test, expect, jest */
// 자동삭제 스윕(modules/autoDelete.js) — 14일 지난 메시지(켜기 전부터 있던 것)도 지워지는지(사용자 제보 11-18)
const { sweepChannel, OLD_PER_SWEEP } = require('../modules/autoDelete')

const NOW = Date.UTC(2026, 10, 18, 12)
const DAY = 24 * 60 * 60 * 1000

function fakeChannel (ages, { pinned = [] } = {}) {
  const deleted = []
  const bulkCalls = []
  const messages = new Map(ages.map((age, i) => {
    const m = {
      id: String(i),
      createdTimestamp: NOW - age,
      pinned: pinned.includes(i),
      delete: jest.fn(async () => { deleted.push(i) })
    }
    return [m.id, m]
  }))
  return {
    id: 'ch' + Math.random(),
    deleted,
    bulkCalls,
    messages: { fetch: jest.fn(async () => messages) },
    bulkDelete: jest.fn(async (list, filterOld) => {
      bulkCalls.push({ ids: list.map(m => Number(m.id)), filterOld })
      // 실제 디스코드처럼 14일 지난 건 조용히 빠짐
      const ok = list.filter(m => NOW - m.createdTimestamp < 14 * DAY)
      ok.forEach(m => deleted.push(Number(m.id)))
      return new Map(ok.map(m => [m.id, m]))
    })
  }
}

test('켜기 전 오래된(14일 넘은) 메시지도 하나씩 지운다', async () => {
  const ch = fakeChannel([17 * DAY, 18 * DAY, 20 * DAY]) // 티토커tts처럼 10/29~11/1 메시지만 남은 채널
  const done = await sweepChannel(ch, 5, { now: NOW })
  expect(done).toEqual({ bulk: 0, single: 3 })
  expect(ch.bulkDelete).not.toHaveBeenCalled()
  expect(ch.deleted.sort()).toEqual([0, 1, 2])
})

test('14일 이내는 한 번에, 오래된 건 한 번에 몇 개씩만', async () => {
  const ages = [10 * 60000, 20 * 60000, 3 * DAY, ...Array.from({ length: 15 }, (_, i) => (15 + i) * DAY)]
  const ch = fakeChannel(ages)
  const done = await sweepChannel(ch, 5, { now: NOW })
  expect(ch.bulkCalls).toEqual([{ ids: [0, 1, 2], filterOld: true }])
  expect(done).toEqual({ bulk: 3, single: OLD_PER_SWEEP })
  // 오래된 것 중 최근 것부터
  expect(ch.deleted.slice(3)).toEqual(Array.from({ length: OLD_PER_SWEEP }, (_, i) => 3 + i))
})

test('아직 시간이 안 된 메시지·핀 메시지는 남긴다', async () => {
  const ch = fakeChannel([60000, 2 * 60000, 20 * DAY, 21 * DAY], { pinned: [2] })
  const done = await sweepChannel(ch, 5, { now: NOW })
  expect(done).toEqual({ bulk: 0, single: 1 })
  expect(ch.deleted).toEqual([3])
})

test('14일 경계 바로 앞 메시지는 bulkDelete가 거절할 수 있어 하나씩으로', async () => {
  const ch = fakeChannel([14 * DAY - 30000, 60 * 60000])
  const done = await sweepChannel(ch, 5, { now: NOW })
  expect(done).toEqual({ bulk: 1, single: 1 })
  expect(ch.bulkDelete).not.toHaveBeenCalled()
})

test('채널이 없거나 텍스트 채널이 아니면 아무것도 안 함', async () => {
  expect(await sweepChannel(undefined, 5)).toEqual({ bulk: 0, single: 0 })
  expect(await sweepChannel({ id: 'x' }, 5)).toEqual({ bulk: 0, single: 0 })
})
