const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { DateTime } = require('luxon')
const { developerId, auditLogIgnoreUserIds } = require('../config/bot')

// 슬래시 명령 사용량 기록 (기획: docs/command-usage-stats-plan.md)
// - index.js가 djs-commander의 각 명령 run을 감싸 끝날 때 record()를 부른다(예외 없으면 ok, 예외면 err).
// - 월별 합계 JSON: static/json/usage/commands-YYYY-MM.json
//   { 'YYYY-MM-DD'(KST): { guildId|'DM': { '명령 [하위명령]': { ok, err, users, msAvg, msMax } } } }
// - 메모리에 모았다가 flush()로 저장(index.js가 1분마다 + 종료 신호 때 호출). 임시 파일 → 이름 바꾸기.
// - 사용자 수: 하루 단위 서로 다른 사람 수만. 당일 항목에만 해시(유저ID+USAGE_SALT) 앞 10글자 목록(_ids)을 두고,
//   날이 바뀌면 목록을 지우고 숫자(users)만 남긴다. USAGE_SALT가 없으면 사용자 수 집계만 끈다.
//   디스코드 사용자 ID·이름은 저장하지 않는다.
// - 제작자(config/bot.js developerId·auditLogIgnoreUserIds)는 세지 않는다.
// - 기록 실패가 명령 실행을 방해하지 않도록 record/flush 안에서 예외를 삼킨다.

const ZONE = 'Asia/Seoul'
const IDS_KEY = '_ids' // 당일 사용자 해시 목록(날이 바뀌면 삭제)

function createUsage ({
  dir = path.join(__dirname, '..', 'static', 'json', 'usage'),
  salt = process.env.USAGE_SALT || '',
  excludeIds = [developerId, ...(auditLogIgnoreUserIds || [])].filter(Boolean),
  now = () => DateTime.now()
} = {}) {
  const exclude = new Set(excludeIds)
  let cache = null // { month, data, dirty }
  let lastDay = null // 마지막으로 사용자 목록을 정리한 날(오늘 날짜)
  let registered = [] // djs-commander 명령 목록(0회 명령 비교용)

  const fileOf = (month) => path.join(dir, `commands-${month}.json`)

  function readMonth (month) {
    try {
      return JSON.parse(fs.readFileSync(fileOf(month), 'utf8'))
    } catch (e) {
      return {}
    }
  }

  function writeMonth (month, data) {
    fs.mkdirSync(dir, { recursive: true })
    const file = fileOf(month)
    const tmp = `${file}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, file) // 쓰는 도중 꺼져도 원본이 깨지지 않게
  }

  // 오늘이 아닌 날의 사용자 해시 목록 삭제(숫자 users만 남김). 지운 게 있으면 true
  function pruneIds (data, today) {
    let changed = false
    for (const [day, guilds] of Object.entries(data)) {
      if (day === today) continue
      for (const cmds of Object.values(guilds)) {
        for (const entry of Object.values(cmds)) {
          if (entry[IDS_KEY]) {
            delete entry[IDS_KEY]
            changed = true
          }
        }
      }
    }
    return changed
  }

  function flush () {
    try {
      // 날이 바뀐 뒤 명령이 하나도 안 들어와도 전날 사용자 해시 목록이 파일에 남지 않게(1분마다 flush가 정리)
      if (cache) {
        const today = now().setZone(ZONE).toFormat('yyyy-MM-dd')
        if (lastDay !== today) {
          if (pruneIds(cache.data, today)) cache.dirty = true
          lastDay = today
        }
      }
      if (cache && cache.dirty) {
        writeMonth(cache.month, cache.data)
        cache.dirty = false
      }
    } catch (e) {
      console.error('[commandUsage] 저장 실패:', e.message)
    }
  }

  // 지금 달의 데이터를 메모리에 올린다. 달이 바뀌면 이전 달을 정리·저장하고 새 달 파일을 읽는다.
  function monthData (month, today) {
    if (!cache || cache.month !== month) {
      if (cache) {
        if (pruneIds(cache.data, today)) cache.dirty = true
        flush()
      }
      cache = { month, data: readMonth(month), dirty: false }
      lastDay = null
    }
    if (lastDay !== today) {
      if (pruneIds(cache.data, today)) cache.dirty = true
      lastDay = today
    }
    return cache.data
  }

  function commandKey (interaction) {
    let sub = null
    try {
      sub = interaction.options?.getSubcommand?.(false) || null
    } catch (e) { /* 하위 명령 없음 */ }
    return sub ? `${interaction.commandName} ${sub}` : interaction.commandName
  }

  const hashUser = (userId) => crypto.createHash('sha256').update(String(userId) + salt).digest('hex').slice(0, 10)

  function record (interaction, result, ms) {
    try {
      if (!interaction || !interaction.commandName) return
      const userId = interaction.user?.id
      if (userId && exclude.has(userId)) return

      const t = now().setZone(ZONE)
      const today = t.toFormat('yyyy-MM-dd')
      const data = monthData(t.toFormat('yyyy-MM'), today)

      const guildKey = interaction.guildId || 'DM'
      const key = commandKey(interaction)
      const day = data[today] || (data[today] = {})
      const guild = day[guildKey] || (day[guildKey] = {})
      const entry = guild[key] || (guild[key] = { ok: 0, err: 0 })

      entry[result === 'err' ? 'err' : 'ok'] += 1
      const n = entry.ok + entry.err
      if (Number.isFinite(ms) && ms >= 0) {
        entry.msAvg = Math.round(((entry.msAvg || 0) * (n - 1) + ms) / n)
        entry.msMax = Math.max(entry.msMax || 0, Math.round(ms))
      }
      if (salt && userId) {
        const ids = entry[IDS_KEY] || (entry[IDS_KEY] = [])
        const h = hashUser(userId)
        if (!ids.includes(h)) ids.push(h)
        entry.users = ids.length
      }
      cache.dirty = true
    } catch (e) {
      console.error('[commandUsage] 기록 실패:', e.message)
    }
  }

  // djs-commander 명령들의 run을 감싸 사용량을 기록한다(명령 파일은 그대로).
  // 예외는 기록 후 다시 던져 기존 동작(최상위 unhandledRejection 안전망)을 유지한다.
  function wrapCommands (commands) {
    registered = commands
    for (const cmd of commands) {
      const run = cmd.run
      if (typeof run !== 'function' || run.__usageWrapped) continue
      const wrapped = async (ctx) => {
        const started = Date.now()
        try {
          const ret = await run(ctx)
          record(ctx?.interaction, 'ok', Date.now() - started)
          return ret
        } catch (e) {
          record(ctx?.interaction, 'err', Date.now() - started)
          throw e
        }
      }
      wrapped.__usageWrapped = true
      cmd.run = wrapped
    }
  }

  // 0회 비교 대상: 등록된 명령 중 비활성(deleted)·베타 제외
  function activeCommandNames () {
    return registered
      .filter(c => c && c.name && !c.deleted && !(c.beta || /\[beta\]/i.test(c.description || '')))
      .map(c => c.name)
  }

  // 최근 days일(오늘 포함, KST) 합계
  function summary (days = 7) {
    flush()
    const end = now().setZone(ZONE).startOf('day')
    const start = end.minus({ days: days - 1 })
    const dayKeys = new Set()
    const months = new Set()
    for (let d = start; d <= end; d = d.plus({ days: 1 })) {
      dayKeys.add(d.toFormat('yyyy-MM-dd'))
      months.add(d.toFormat('yyyy-MM'))
    }

    const commands = {} // key → { ok, err, users, msSum, msN, msMax }
    const guilds = {} // guildKey → 횟수
    for (const month of months) {
      const data = readMonth(month)
      for (const [day, byGuild] of Object.entries(data)) {
        if (!dayKeys.has(day)) continue
        for (const [guildKey, cmds] of Object.entries(byGuild)) {
          for (const [key, e] of Object.entries(cmds)) {
            const n = (e.ok || 0) + (e.err || 0)
            const c = commands[key] || (commands[key] = { ok: 0, err: 0, users: 0, msSum: 0, msN: 0, msMax: 0 })
            c.ok += e.ok || 0
            c.err += e.err || 0
            c.users += e.users || 0
            if (Number.isFinite(e.msAvg)) {
              c.msSum += e.msAvg * n
              c.msN += n
            }
            c.msMax = Math.max(c.msMax, e.msMax || 0)
            guilds[guildKey] = (guilds[guildKey] || 0) + n
          }
        }
      }
    }

    const rows = Object.entries(commands).map(([key, c]) => ({
      key,
      ok: c.ok,
      err: c.err,
      total: c.ok + c.err,
      users: c.users,
      msAvg: c.msN ? Math.round(c.msSum / c.msN) : null,
      msMax: c.msMax || null
    })).sort((a, b) => b.total - a.total || a.key.localeCompare(b.key))

    const usedNames = new Set(rows.map(r => r.key.split(' ')[0]))
    const unused = activeCommandNames().filter(n => !usedNames.has(n)).sort((a, b) => a.localeCompare(b))
    const byGuild = Object.entries(guilds).map(([guildId, total]) => ({ guildId, total }))
      .sort((a, b) => b.total - a.total)

    return {
      days,
      from: start.toFormat('yyyy-MM-dd'),
      to: end.toFormat('yyyy-MM-dd'),
      rows,
      unused,
      byGuild,
      userCounting: Boolean(salt)
    }
  }

  return { record, flush, summary, wrapCommands, commandKey, hashUser, activeCommandNames }
}

module.exports = { createUsage, ...createUsage() }
