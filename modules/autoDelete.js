// 자동삭제 스윕 — 설정된 채널의 (N분 지난 · 핀 아닌) 메시지를 지운다. cronJob이 30초마다 부른다.
//
// 디스코드는 14일 지난 메시지를 bulkDelete로 지울 수 없다(API 제한). 예전 코드는 bulkDelete(expired, true)로
// 14일 지난 걸 '조용히 빼서', 자동삭제를 켜기 전부터 있던 오래된 메시지가 영원히 남았다(사용자 제보 11-18).
// → 14일 이내는 지금처럼 한 번에, 14일 지난 건 한 번에 OLD_PER_SWEEP개씩 하나씩 지운다(속도 제한 때문에 나눠서).
//   채널에 오래된 메시지가 많으면 30초마다 조금씩 비워진다.

const BULK_LIMIT_MS = 14 * 24 * 60 * 60 * 1000
const BULK_MARGIN_MS = 60 * 1000 // 14일 경계 바로 앞은 bulkDelete가 거절할 수 있어 하나씩 쪽으로
const OLD_PER_SWEEP = 10

const running = new Set() // 채널별 스윕이 겹치지 않게(하나씩 지우기가 30초를 넘길 수 있음)

/**
 * 한 채널 스윕. 지운 개수 { bulk, single } 를 돌려준다.
 * @param {import('discord.js').TextChannel} channel
 * @param {number} ttlMin 이 분이 지난 메시지를 지움
 */
async function sweepChannel (channel, ttlMin, { now = Date.now(), oldPerSweep = OLD_PER_SWEEP } = {}) {
  const done = { bulk: 0, single: 0 }
  if (!channel || typeof channel.bulkDelete !== 'function' || running.has(channel.id)) return done
  running.add(channel.id)
  try {
    const cutoff = now - ttlMin * 60000
    const messages = await channel.messages.fetch({ limit: 100 })
    const expired = [...messages.values()].filter(m => !m.pinned && m.createdTimestamp < cutoff)
    const bulkable = expired.filter(m => now - m.createdTimestamp < BULK_LIMIT_MS - BULK_MARGIN_MS)
    const old = expired.filter(m => !bulkable.includes(m))
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp) // 최근 것부터(채널 아래쪽부터 비워짐)
      .slice(0, oldPerSweep)
    if (bulkable.length >= 2) {
      const deleted = await channel.bulkDelete(bulkable, true)
      done.bulk = deleted?.size ?? bulkable.length
    } else if (bulkable.length === 1) {
      await bulkable[0].delete().then(() => { done.bulk = 1 }).catch(() => {})
    }
    for (const m of old) {
      // 하나씩 — 이미 지워졌거나 권한이 없으면 건너뜀(속도 제한은 discord.js가 기다려 줌)
      await m.delete().then(() => { done.single++ }).catch(() => {})
    }
    return done
  } finally {
    running.delete(channel.id)
  }
}

module.exports = { sweepChannel, BULK_LIMIT_MS, OLD_PER_SWEEP }
