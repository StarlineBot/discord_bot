const fs = require('node:fs')
const { DateTime } = require('luxon')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js')
const settings = require('./guildSettings')
const { renderCalendar } = require('./scheduleCalendar')
const { extractField } = require('./common')

const filePath = './static/json/weeklySchedule.json'

// 주는 목요일 시작 ~ 다음주 수요일. 표시/데이터 요일 순서도 목→수.
const LABELS = ['목', '금', '토', '일', '월', '화', '수']

// ── 저장 (기존 봇 패턴: static/json 아래 JSON 파일) ──────────────
function read () {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    return {}
  }
}

function write (data) {
  fs.mkdirSync('./static/json', { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// ── 주 계산 ───────────────────────────────────────────────────
// 주어진 시각이 속한 주의 '시작 목요일'. luxon weekday: 월1..일7, 목=4.
function weekThursday (now) {
  const daysSinceThu = (now.weekday - 4 + 7) % 7 // 목=0, 금=1, ... 수=6
  return now.minus({ days: daysSinceThu }).startOf('day')
}

// 목요일 DateTime → 주 정보(요일별 날짜 라벨 포함)
function weekInfo (thu) {
  const days = LABELS.map((label, idx) => {
    const dt = thu.plus({ days: idx })
    return { idx, label, date: dt.toFormat('MM/dd'), dt }
  })
  return { weekId: thu.toFormat('yyyy-MM-dd'), thursday: thu, days, range: `${days[0].date}(목)~${days[6].date}(수)` }
}

// 오늘 기준 이번 주 / 다음 주
function thisWeek (now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')) {
  return weekInfo(weekThursday(now))
}
function nextWeek (now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')) {
  return weekInfo(weekThursday(now).plus({ weeks: 1 }))
}
// 편집/렌더에 쓰는 두 주 [이번주, 다음주]
function twoWeeks (now) {
  return [thisWeek(now), nextWeek(now)]
}

// ── 시간 구간(interval) 로직 ───────────────────────────────────
// 한 (유저, 요일)의 가용시간 표현:
//   'x'                         → 그날 불가
//   [{s,e}, ...]                → 가능 구간들(시각은 시 단위, .5=30분). e=24 는 "그 시각부터 쭉".
//   number N (레거시)           → [{s:N, e:24}] 로 해석(하위호환)
//   undefined / [] (미입력)     → 종일 가능 [{s:0, e:24}]
// 값이 'x' 면 toIntervals 는 null(불가)을 돌려준다. 그 외엔 항상 구간 배열.
function toIntervals (value) {
  if (value === 'x') return null
  if (Array.isArray(value)) return value.length ? value : [{ s: 0, e: 24 }]
  if (typeof value === 'number') return [{ s: value, e: 24 }]
  return [{ s: 0, e: 24 }]
}

// 겹치거나 맞닿은 구간 병합(정렬 포함)
function mergeIntervals (list) {
  const arr = list.filter(x => x && x.e > x.s).slice().sort((a, b) => a.s - b.s)
  const out = []
  for (const iv of arr) {
    const last = out[out.length - 1]
    if (last && iv.s <= last.e) last.e = Math.max(last.e, iv.e)
    else out.push({ s: iv.s, e: iv.e })
  }
  return out
}

function intersectTwo (a, b) {
  const res = []
  for (const x of a) {
    for (const y of b) {
      const s = Math.max(x.s, y.s)
      const e = Math.min(x.e, y.e)
      if (e > s) res.push({ s, e })
    }
  }
  return mergeIntervals(res)
}

// 여러 멤버 구간들의 교집합(모두가 동시에 가능한 시간). 한 명이라도 []면 결과도 [].
function intersectAll (lists) {
  if (!lists.length) return []
  let acc = lists[0]
  for (let i = 1; i < lists.length; i++) acc = intersectTwo(acc, lists[i])
  return acc
}

function fmtTime (h) {
  const hh = Math.floor(h)
  return (h - hh >= 0.5) ? `${hh}시30분` : `${hh}시`
}

function fmtOne (iv) {
  if (iv.s === 0 && iv.e >= 24) return '종일'
  if (iv.e >= 24) return `${fmtTime(iv.s)}부터`
  return `${fmtTime(iv.s)}~${fmtTime(iv.e)}`
}

// 구간 배열 → "14시~16시 · 20시부터" (빈 배열이면 '')
function fmtIntervals (list) {
  if (!list || !list.length) return ''
  return list.map(fmtOne).join(' · ')
}

// 토큰('0'|'30'|null) → 0 | 0.5
function minPart (token) {
  return token === '30' ? 0.5 : 0
}

// ── 보드 CRUD ─────────────────────────────────────────────────
function getBoard (channelId) {
  return read()[channelId] || null
}

// 지난 주(현재 이번주보다 이전) 데이터 정리
function pruneOldWeeks (board) {
  const curId = thisWeek().weekId
  if (!board.weeks) { board.weeks = {}; return }
  for (const wid of Object.keys(board.weeks)) {
    if (wid < curId) delete board.weeks[wid]
  }
}

// 보드 생성/갱신(제목·멤버·메시지ID 등). weeks(입력)는 보존.
function upsertBoard (channelId, patch) {
  const data = read()
  const prev = data[channelId] || { weeks: {}, members: [] }
  data[channelId] = { ...prev, ...patch, weeks: prev.weeks || {}, members: patch.members || prev.members || [] }
  write(data)
  return data[channelId]
}

// 내부: 특정 유저·주의 요일 맵을 확보
function ensureUserDays (board, weekId, userId) {
  if (!board.weeks) board.weeks = {}
  if (!board.weeks[weekId]) board.weeks[weekId] = {}
  if (!board.weeks[weekId][userId]) board.weeks[weekId][userId] = {}
  return board.weeks[weekId][userId]
}

// 한 유저의 특정 주 여러 요일에 가용 구간 1개 추가(기존 구간에 누적·병합).
// 기존이 'x'(불가)·미입력이면 이 구간부터 새로 시작(= 그 시간만 가능).
function addInterval (channelId, weekId, userId, dayIdxs, interval) {
  const data = read()
  const board = data[channelId]
  if (!board) return null
  const u = ensureUserDays(board, weekId, userId)
  for (const idx of dayIdxs) {
    const prev = u[idx]
    const base = (prev === 'x' || prev == null) ? [] : toIntervals(prev)
    u[idx] = mergeIntervals([...base, interval])
  }
  write(data)
  return board
}

// 한 유저의 특정 주 여러 요일을 불가('x')로
function setUnavail (channelId, weekId, userId, dayIdxs) {
  const data = read()
  const board = data[channelId]
  if (!board) return null
  const u = ensureUserDays(board, weekId, userId)
  for (const idx of dayIdxs) u[idx] = 'x'
  write(data)
  return board
}

// 한 유저의 특정 주 여러 요일 입력 제거(→ 기본값 '종일'로 복귀)
function clearDays (channelId, weekId, userId, dayIdxs) {
  const data = read()
  const board = data[channelId]
  const u = board && board.weeks && board.weeks[weekId] && board.weeks[weekId][userId]
  if (!u) return null
  for (const idx of dayIdxs) delete u[idx]
  write(data)
  return board
}

// 한 유저의 특정 주 입력 전체 초기화
function resetUser (channelId, weekId, userId) {
  const data = read()
  const board = data[channelId]
  if (!board || !board.weeks || !board.weeks[weekId]) return null
  delete board.weeks[weekId][userId]
  write(data)
  return board
}

// 한 유저의 fromWeek 입력을 toWeek로 복사(루틴 복제용, 깊은 복사)
function copyUserWeek (channelId, fromWeekId, toWeekId, userId) {
  const data = read()
  const board = data[channelId]
  if (!board || !board.weeks) return null
  const src = board.weeks[fromWeekId] && board.weeks[fromWeekId][userId]
  if (!board.weeks[toWeekId]) board.weeks[toWeekId] = {}
  board.weeks[toWeekId][userId] = src ? JSON.parse(JSON.stringify(src)) : {}
  write(data)
  return board
}

// ── 집계/해석 ─────────────────────────────────────────────────
function weekEntries (board, weekId) {
  return (board.weeks && board.weeks[weekId]) || {}
}

// 한 유저의 특정 요일 가용: null(불가) | 구간배열(미입력=종일 [{0,24}])
function dayAvail (entries, userId, idx) {
  const e = entries[userId] && entries[userId][idx]
  return toIntervals(e)
}

function enterers (entries) {
  return Object.keys(entries)
}

// 요일별 집계: { kind:'empty' } | { kind:'has', common:[{s,e}], unavail:[id] }
function dayCommon (entries, idx) {
  const ids = enterers(entries)
  if (ids.length === 0) return { kind: 'empty' }
  const unavail = []
  const lists = []
  for (const id of ids) {
    const av = dayAvail(entries, id, idx)
    if (av === null) { unavail.push(id); lists.push([]) } else lists.push(av)
  }
  return { kind: 'has', common: intersectAll(lists), unavail }
}

// 한 유저의 특정 주 요약 (기본 '종일'과 다른 요일만 나열)
function memberSummary (entries, userId, days) {
  if (!entries[userId]) return '아직 미입력'
  const blocked = []
  const timed = []
  for (const d of days) {
    const av = dayAvail(entries, userId, d.idx)
    if (av === null) { blocked.push(d.label); continue }
    const isAllDay = av.length === 1 && av[0].s === 0 && av[0].e >= 24
    if (!isAllDay) timed.push(`${d.label} ${fmtIntervals(av)}`)
  }
  const parts = []
  if (timed.length) parts.push(timed.join(' · '))
  if (blocked.length) parts.push(`${blocked.join('·')} 불가`)
  return parts.length ? parts.join(' / ') : '전요일 종일 가능'
}

// ── 렌더 ──────────────────────────────────────────────────────
// 한 주 블록의 필드 value(요일 그리드 + 전원 가능시간 + 미입력) 생성 (임베드 폴백용)
function weekFieldValue (board, wk) {
  const entries = weekEntries(board, wk.weekId)
  const lines = []
  for (const d of wk.days) {
    const dc = dayCommon(entries, d.idx)
    if (dc.kind === 'empty') {
      lines.push(`\`${d.label} ${d.date}\`  · 입력 대기`)
    } else if (dc.common.length) {
      lines.push(`\`${d.label} ${d.date}\`  🟢 전원 ${fmtIntervals(dc.common)}`)
    } else {
      const tail = dc.unavail.length ? ` (🚫 ${dc.unavail.map(id => `<@${id}>`).join(', ')})` : ''
      lines.push(`\`${d.label} ${d.date}\`  ⚠️ 전원 가능시간 없음${tail}`)
    }
  }
  let value = lines.join('\n')
  const missing = (board.members || []).filter(id => !enterers(entries).includes(id))
  if (missing.length) value += `\n⏳ 미입력: ${missing.map(id => `<@${id}>`).join(', ')}`
  return value
}

function buildEmbed (board) {
  const [tw, nw] = twoWeeks()
  const title = board.title || '주간일정'
  const embed = new EmbedBuilder()
    .setTitle(`📅 ${title}`)
    .setColor('#5865F2')
    .addFields(
      { name: `🗓 이번주 · ${tw.range}`, value: weekFieldValue(board, tw) },
      { name: `🗓 다음주 · ${nw.range}`, value: weekFieldValue(board, nw) }
    )
    .setFooter({ text: '아래 버튼으로 주를 골라 내 가능시간을 입력해줘' })
  return embed
}

function boardComponents () {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ws|edit').setLabel('✏️ 내 일정 입력').setStyle(ButtonStyle.Primary)
    )
  ]
}

// 편집창: 주 선택 화면
function weekChoiceComponents () {
  const [tw, nw] = twoWeeks()
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ws|wk|${tw.weekId}`).setLabel(`이번주 (${tw.range})`).setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`ws|wk|${nw.weekId}`).setLabel(`다음주 (${nw.range})`).setStyle(ButtonStyle.Success)
    )
  ]
}

// 편집창 1단계: 요일 선택(멀티) + 보조 버튼
function weekDayComponents (weekId) {
  const [tw, nw] = twoWeeks()
  const wk = weekId === nw.weekId ? nw : tw
  const isNext = weekId === nw.weekId

  const dayMenu = new StringSelectMenuBuilder()
    .setCustomId(`ws|days|${weekId}`)
    .setPlaceholder('설정할 요일 고르기 (여러 개 가능)')
    .setMinValues(1)
    .setMaxValues(7)
    .addOptions(wk.days.map(d => ({ label: `${d.label} (${d.date})`, value: String(d.idx) })))
  const rows = [new ActionRowBuilder().addComponents(dayMenu)]

  const btns = new ActionRowBuilder()
  if (isNext) {
    btns.addComponents(new ButtonBuilder().setCustomId(`ws|copy|${weekId}`).setLabel('📋 이번주와 같게').setStyle(ButtonStyle.Success))
  }
  btns.addComponents(
    new ButtonBuilder().setCustomId('ws|back').setLabel('◀ 주 다시 고르기').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`ws|reset|${weekId}`).setLabel('🗑 이 주 초기화').setStyle(ButtonStyle.Danger)
  )
  rows.push(btns)
  return rows
}

// 편집 상태(시작/종료 시·분)를 customId에 싣기 위한 직렬화
function parseState (str) {
  const [sh, sm, eh, em] = (str || '_._._._').split('.')
  const v = (x) => (x === '_' || x === undefined) ? null : x
  return { sh: v(sh), sm: v(sm), eh: v(eh), em: v(em) }
}
function buildState (s) {
  const v = (x) => (x == null ? '_' : x)
  return `${v(s.sh)}.${v(s.sm)}.${v(s.eh)}.${v(s.em)}`
}

const minuteOptions = (selected) => ([
  { label: '00분', value: '0', default: (selected ?? '0') === '0' },
  { label: '30분', value: '30', default: selected === '30' }
])

// 편집창 2단계: 선택한 요일의 시작/종료(시·분) 고르기 + 구간추가/불가/비우기
function weekTimeComponents (weekId, daysCsv, stateStr) {
  const s = parseState(stateStr)
  const state = buildState(s)

  const startHourMenu = new StringSelectMenuBuilder()
    .setCustomId(`ws|sh|${weekId}|${daysCsv}|${state}`)
    .setPlaceholder('시작 — 시')
    .addOptions(Array.from({ length: 24 }, (_, h) => ({ label: `${h}시`, value: String(h), default: s.sh === String(h) })))
  const startMinMenu = new StringSelectMenuBuilder()
    .setCustomId(`ws|sm|${weekId}|${daysCsv}|${state}`)
    .setPlaceholder('시작 — 분')
    .addOptions(minuteOptions(s.sm))

  const floor = s.sh != null ? Number(s.sh) : 0
  const endHourOpts = [{ label: '⏰ 제한없음 (그 시각부터 쭉)', value: 'none', default: s.eh === 'none' }]
  for (let h = floor; h <= 24; h++) {
    if (h === 24) continue // 24시=제한없음으로 대체
    endHourOpts.push({ label: `${h}시`, value: String(h), default: s.eh === String(h) })
  }
  const endHourMenu = new StringSelectMenuBuilder()
    .setCustomId(`ws|eh|${weekId}|${daysCsv}|${state}`)
    .setPlaceholder('종료 — 시 (시작보다 늦게)')
    .addOptions(endHourOpts.slice(0, 25))
  const endMinMenu = new StringSelectMenuBuilder()
    .setCustomId(`ws|em|${weekId}|${daysCsv}|${state}`)
    .setPlaceholder('종료 — 분')
    .addOptions(minuteOptions(s.em))

  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ws|add|${weekId}|${daysCsv}|${state}`).setLabel('➕ 구간 추가').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ws|setx|${weekId}|${daysCsv}`).setLabel('🚫 불가').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`ws|clr|${weekId}|${daysCsv}`).setLabel('🗑 비우기(종일)').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`ws|wk|${weekId}`).setLabel('◀ 요일 다시').setStyle(ButtonStyle.Secondary)
  )

  return [
    new ActionRowBuilder().addComponents(startHourMenu),
    new ActionRowBuilder().addComponents(startMinMenu),
    new ActionRowBuilder().addComponents(endHourMenu),
    new ActionRowBuilder().addComponents(endMinMenu),
    btns
  ]
}

// 주 선택 화면 문구
function chooseContent (board, userId) {
  const [tw, nw] = twoWeeks()
  const twMine = memberSummary(weekEntries(board, tw.weekId), userId, tw.days)
  const nwMine = memberSummary(weekEntries(board, nw.weekId), userId, nw.days)
  return `어느 주를 입력할까?\n\n**이번주** (${tw.range}) — 내 입력: ${twMine}\n**다음주** (${nw.range}) — 내 입력: ${nwMine}`
}

// 1단계(요일 선택) 문구
function editContent (board, weekId, userId, selectedLabels) {
  const [tw, nw] = twoWeeks()
  const wk = weekId === nw.weekId ? nw : tw
  const label = weekId === nw.weekId ? '다음주' : '이번주'
  const mine = memberSummary(weekEntries(board, weekId), userId, wk.days)
  let content = `**[${label}] ${wk.range}**\n내 현재 입력: ${mine}`
  if (selectedLabels) content += `\n\n선택한 요일: **${selectedLabels}** → 시작·종료를 골라줘`
  return content
}

// 2단계(시간 입력) 문구: 선택 요일의 현재 저장값 + 입력 중인 구간
function timeEditContent (board, weekId, userId, daysCsv, stateStr, note) {
  const [tw, nw] = twoWeeks()
  const wk = weekId === nw.weekId ? nw : tw
  const label = weekId === nw.weekId ? '다음주' : '이번주'
  const idxs = daysCsv.split(',').map(Number).filter(n => !Number.isNaN(n))
  const entries = weekEntries(board, weekId)
  const dayLabels = idxs.map(i => LABELS[i]).join('·')
  const cur = idxs.map(i => {
    const av = dayAvail(entries, userId, i)
    const t = av === null ? '불가' : (fmtIntervals(av) || '종일')
    return `${LABELS[i]} ${t}`
  }).join(' / ')
  const s = parseState(stateStr)
  let pending
  if (s.sh == null) {
    pending = '(시작 시각부터 골라줘)'
  } else {
    const startTxt = fmtTime(Number(s.sh) + minPart(s.sm))
    const endTxt = s.eh == null ? '(종료 선택)' : (s.eh === 'none' ? '제한없음(쭉)' : fmtTime(Number(s.eh) + minPart(s.em)))
    pending = `${startTxt} ~ ${endTxt}`
  }
  let content = `**[${label}] ${wk.range}**  ·  요일: **${dayLabels}**\n현재 저장: ${cur}\n입력 중: **${pending}**  → \`➕ 구간 추가\``
  if (note) content = `${note}\n\n${content}`
  return content
}

// ── 달력 이미지(가용시간 + 파티모집 파티) ─────────────────────────
// 파티모집 포럼의 활성 스레드에서 출발시간·던전을 파싱해 날짜별로 모은다(60초 캐시).
const partyCache = {}
async function fetchPartiesByDate (guild) {
  const gid = guild.id
  if (partyCache[gid] && Date.now() - partyCache[gid].at < 60000) return partyCache[gid].byDate
  const byDate = {}
  const forumId = settings.get(gid, 'partyChannelId', null)
  const forum = forumId && guild.channels.cache.get(forumId)
  if (forum && forum.threads && typeof forum.threads.fetchActive === 'function') {
    try {
      const active = await forum.threads.fetchActive()
      const year = DateTime.now().setZone('Asia/Seoul').year
      for (const thread of active.threads.values()) {
        try {
          const msgs = await thread.messages.fetch({ limit: 10 })
          const timeMsg = msgs.find(m => m.content.includes('출발시간:'))
          if (!timeMsg) continue
          const raw = extractField(timeMsg.content, '출발시간')
          if (!raw) continue
          const dt = DateTime.fromFormat(`${year}년 ${raw}`, 'yyyy년 MM월 dd일 cccc H시 m분', { locale: 'ko' })
          if (!dt.isValid) continue
          const key = dt.toFormat('yyyy-MM-dd')
          const dungeonMsg = msgs.find(m => m.content.includes('모집던전:'))
          const dungeon = extractField(timeMsg.content, '모집던전') || (dungeonMsg && extractField(dungeonMsg.content, '모집던전')) || thread.name
          ;(byDate[key] = byDate[key] || []).push({ dungeon, hour: dt.hour, minute: dt.minute })
        } catch (e) { /* 스레드 읽기 실패 무시 */ }
      }
    } catch (e) { /* 포럼 조회 실패 무시 */ }
  }
  partyCache[gid] = { at: Date.now(), byDate }
  return byDate
}

// userId → 서버 표시이름(이미지엔 멘션이 안 되므로 실제 이름 필요)
async function resolveNames (guild, ids) {
  const map = {}
  for (const id of ids) {
    let m = guild.members.cache.get(id)
    if (!m) m = await guild.members.fetch(id).catch(() => null)
    map[id] = m ? m.displayName : '알 수 없음'
  }
  return map
}

// 달력 렌더용 모델 생성(이번주/다음주 × 7일, 각 날에 전원가능 + 멤버별 + 파티)
async function buildCalendarModel (board, guild) {
  const [tw, nw] = twoWeeks()
  const partiesByDate = await fetchPartiesByDate(guild)
  const idSet = new Set()
  for (const wk of [tw, nw]) for (const id of enterers(weekEntries(board, wk.weekId))) idSet.add(id)
  const names = await resolveNames(guild, [...idSet])

  const weeks = [{ label: '이번주', wk: tw }, { label: '다음주', wk: nw }].map(({ label, wk }) => {
    const entries = weekEntries(board, wk.weekId)
    const memberIds = enterers(entries)
    const days = wk.days.map(d => {
      const lines = []
      // 셀 가로폭이 좁아, 구간이 여럿이면 한 줄에 몰지 말고 줄을 나눠 목록으로 쌓는다.
      // 첫 구간은 라벨과 같은 줄, 둘째부터는 '  · ' 들여쓰기 연속줄.
      const pushIntervals = (label, list, type) => {
        list.forEach((iv, i) => lines.push({ text: (i === 0 ? label : '  · ') + fmtOne(iv), type }))
      }
      // 상단: 전원 가능시간
      const dc = dayCommon(entries, d.idx)
      if (dc.kind !== 'empty') {
        if (dc.common.length) pushIntervals('전원 ', dc.common, 'all')
        else lines.push({ text: '전원 가능시간 없음', type: 'no' })
      }
      // 멤버별(이른 시작 순) — 각 멤버의 구간들을 한 그룹으로 묶어 정렬 후 펼친다
      const groups = []
      for (const id of memberIds) {
        const av = dayAvail(entries, id, d.idx)
        const nm = names[id] || '?'
        if (av === null) { groups.push({ sort: 9999, lines: [{ text: `${nm} 불가`, type: 'no' }] }); continue }
        const g = []
        av.forEach((iv, i) => g.push({ text: (i === 0 ? `${nm} ` : '  · ') + fmtOne(iv), type: 'ok' }))
        groups.push({ sort: av.length ? av[0].s : 0, lines: g })
      }
      groups.sort((a, b) => a.sort - b.sort)
      for (const g of groups) lines.push(...g.lines)
      // 파티
      for (const p of (partiesByDate[d.dt.toFormat('yyyy-MM-dd')] || [])) {
        const t = p.minute ? `${p.hour}시${p.minute}분` : `${p.hour}시`
        lines.push({ text: `[${p.dungeon}] ${t} 파티`, type: 'party' })
      }
      return { weekday: d.label, date: d.date, lines }
    })
    return { label, range: wk.range, days }
  })
  return { title: board.title || '주간일정', weeks }
}

async function buildCalendarImage (channel, board) {
  const model = await buildCalendarModel(board, channel.guild)
  return new AttachmentBuilder(renderCalendar(model), { name: 'schedule.png' })
}

// 저장된 보드 메시지를 최신 상태로 다시 그린다(없으면 새로 보냄). 지난 주는 정리.
async function renderBoard (channel, channelId) {
  const data = read()
  const board = data[channelId]
  if (!board) return null
  pruneOldWeeks(board)
  write(data)

  let payload
  try {
    const attachment = await buildCalendarImage(channel, board)
    payload = {
      content: `📅 **${board.title || '주간일정'}** — 아래 버튼으로 가능시간을 입력해줘`,
      embeds: [],
      attachments: [],
      files: [attachment],
      components: boardComponents()
    }
  } catch (e) {
    console.error('주간일정 달력 렌더 실패, 임베드로 대체:', e.message)
    payload = { content: '', embeds: [buildEmbed(board)], attachments: [], files: [], components: boardComponents() }
  }
  let msg = null
  if (board.messageId) msg = await channel.messages.fetch(board.messageId).catch(() => null)
  if (msg) {
    await msg.edit(payload)
  } else {
    msg = await channel.send(payload)
    upsertBoard(channelId, { messageId: msg.id })
    channel.messages.pin(msg.id).catch(() => {}) // 핀 실패(권한 등)는 무시
  }
  return msg
}

// 파티 목록 캐시 무효화(파티모집 생성/삭제 직후 즉시 반영용)
function invalidatePartyCache (guildId) {
  delete partyCache[guildId]
}

// 해당 길드에 속한 모든 주간일정 보드를 다시 그린다(파티모집 생성 시 자동 새로고침).
async function refreshGuildBoards (guild) {
  const data = read()
  for (const channelId of Object.keys(data)) {
    if (data[channelId].guildId !== guild.id) continue
    const channel = guild.channels.cache.get(channelId)
    if (channel) await renderBoard(channel, channelId).catch(() => {})
  }
}

module.exports = {
  LABELS,
  invalidatePartyCache,
  refreshGuildBoards,
  read,
  write,
  thisWeek,
  nextWeek,
  twoWeeks,
  getBoard,
  upsertBoard,
  addInterval,
  setUnavail,
  clearDays,
  resetUser,
  copyUserWeek,
  weekEntries,
  dayAvail,
  fmtTime,
  fmtIntervals,
  minPart,
  mergeIntervals,
  intersectAll,
  parseState,
  buildState,
  buildEmbed,
  boardComponents,
  weekChoiceComponents,
  weekDayComponents,
  weekTimeComponents,
  chooseContent,
  editContent,
  timeEditContent,
  memberSummary,
  renderBoard
}
