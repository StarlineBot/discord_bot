const fs = require('node:fs')
const { DateTime } = require('luxon')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js')

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

// 한 유저의 특정 주 여러 요일에 값 세팅. value = 0~23(그 시각부터 가능) | 'x'(불가)
function setEntry (channelId, weekId, userId, dayIdxs, value) {
  const data = read()
  const board = data[channelId]
  if (!board) return null
  if (!board.weeks) board.weeks = {}
  if (!board.weeks[weekId]) board.weeks[weekId] = {}
  if (!board.weeks[weekId][userId]) board.weeks[weekId][userId] = {}
  for (const idx of dayIdxs) board.weeks[weekId][userId][idx] = value
  write(data)
  return board
}

// 한 유저의 특정 주 입력 초기화
function resetUser (channelId, weekId, userId) {
  const data = read()
  const board = data[channelId]
  if (!board || !board.weeks || !board.weeks[weekId]) return null
  delete board.weeks[weekId][userId]
  write(data)
  return board
}

// 한 유저의 fromWeek 입력을 toWeek로 복사(루틴 복제용)
function copyUserWeek (channelId, fromWeekId, toWeekId, userId) {
  const data = read()
  const board = data[channelId]
  if (!board || !board.weeks) return null
  const src = board.weeks[fromWeekId] && board.weeks[fromWeekId][userId]
  if (!board.weeks[toWeekId]) board.weeks[toWeekId] = {}
  board.weeks[toWeekId][userId] = src ? { ...src } : {}
  write(data)
  return board
}

// ── 집계/해석 ─────────────────────────────────────────────────
function weekEntries (board, weekId) {
  return (board.weeks && board.weeks[weekId]) || {}
}

// 한 유저의 특정 요일 상태: 'x'(불가) | 시각(0~23). 미입력 요일 = 0(종일 가능).
function dayValue (entries, userId, idx) {
  const e = entries[userId] && entries[userId][idx]
  if (e === 'x') return 'x'
  if (e === undefined || e === null) return 0
  return e
}

function enterers (entries) {
  return Object.keys(entries)
}

// 요일별 집계 결과
function dayStatus (entries, idx) {
  const ids = enterers(entries)
  if (ids.length === 0) return { kind: 'empty' }
  const unavail = []
  let startMax = 0
  for (const id of ids) {
    const v = dayValue(entries, id, idx)
    if (v === 'x') unavail.push(id)
    else if (v > startMax) startMax = v
  }
  if (unavail.length) return { kind: 'blocked', unavail }
  return { kind: 'ok', start: startMax } // start 0 = 종일
}

function startLabel (start) {
  return start === 0 ? '종일' : `${start}시부터`
}

// 한 유저의 특정 주 요약 (기본과 다른 요일만 나열)
function memberSummary (entries, userId, days) {
  if (!entries[userId]) return '아직 미입력'
  const blocked = []
  const timed = []
  for (const d of days) {
    const v = dayValue(entries, userId, d.idx)
    if (v === 'x') blocked.push(d.label)
    else if (v > 0) timed.push(`${d.label} ${v}시~`)
  }
  const parts = []
  if (timed.length) parts.push(timed.join(' · '))
  if (blocked.length) parts.push(`${blocked.join('·')} 불가`)
  return parts.length ? parts.join(' / ') : '전요일 종일 가능'
}

// ── 렌더 ──────────────────────────────────────────────────────
// 한 주 블록의 필드 value(요일 그리드 + 전원가능 + 미입력) 생성
function weekFieldValue (board, wk) {
  const entries = weekEntries(board, wk.weekId)
  const lines = []
  const recommend = []
  for (const d of wk.days) {
    const st = dayStatus(entries, d.idx)
    if (st.kind === 'empty') {
      lines.push(`\`${d.label} ${d.date}\`  · 입력 대기`)
    } else if (st.kind === 'blocked') {
      lines.push(`\`${d.label} ${d.date}\`  🚫 ${st.unavail.map(id => `<@${id}>`).join(', ')}`)
    } else {
      lines.push(`\`${d.label} ${d.date}\`  ✅ 전원 ${startLabel(st.start)}`)
      recommend.push(`${d.label} ${startLabel(st.start)}`)
    }
  }
  let value = lines.join('\n')
  if (recommend.length) value += `\n🟢 전원 가능: ${recommend.join('  ·  ')}`
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
      new ButtonBuilder().setCustomId(`ws|wk|${tw.weekId}`).setLabel(`이번주 (${tw.range})`).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`ws|wk|${nw.weekId}`).setLabel(`다음주 (${nw.range})`).setStyle(ButtonStyle.Secondary)
    )
  ]
}

// 편집창: 특정 주 편집 화면(요일 멀티셀렉트 + 선택 요일 있으면 시각 셀렉트 + 버튼들)
function weekEditComponents (weekId, daysCsv) {
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

  if (daysCsv) {
    const hourMenu = new StringSelectMenuBuilder()
      .setCustomId(`ws|hour|${weekId}|${daysCsv}`)
      .setPlaceholder('선택한 요일의 시각 고르기')
      .addOptions([
        { label: '🚫 불가 (그날 안 됨)', value: 'x' },
        { label: '종일 가능 (0시부터)', value: '0' },
        ...Array.from({ length: 23 }, (_, i) => ({ label: `${i + 1}시부터 가능`, value: String(i + 1) }))
      ])
    rows.push(new ActionRowBuilder().addComponents(hourMenu))
  }

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

// 주 선택 화면 문구
function chooseContent (board, userId) {
  const [tw, nw] = twoWeeks()
  const twMine = memberSummary(weekEntries(board, tw.weekId), userId, tw.days)
  const nwMine = memberSummary(weekEntries(board, nw.weekId), userId, nw.days)
  return `어느 주를 입력할까?\n\n**이번주** (${tw.range}) — 내 입력: ${twMine}\n**다음주** (${nw.range}) — 내 입력: ${nwMine}`
}

// 특정 주 편집 화면 문구
function editContent (board, weekId, userId, selectedLabels) {
  const [tw, nw] = twoWeeks()
  const wk = weekId === nw.weekId ? nw : tw
  const label = weekId === nw.weekId ? '다음주' : '이번주'
  const mine = memberSummary(weekEntries(board, weekId), userId, wk.days)
  let content = `**[${label}] ${wk.range}**\n내 현재 입력: ${mine}`
  if (selectedLabels) content += `\n\n선택한 요일: **${selectedLabels}** → 아래에서 시각을 골라줘`
  return content
}

// 저장된 보드 메시지를 최신 상태로 다시 그린다(없으면 새로 보냄). 지난 주는 정리.
async function renderBoard (channel, channelId) {
  const data = read()
  const board = data[channelId]
  if (!board) return null
  pruneOldWeeks(board)
  write(data)

  const payload = { embeds: [buildEmbed(board)], components: boardComponents() }
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

module.exports = {
  LABELS,
  read,
  write,
  thisWeek,
  nextWeek,
  twoWeeks,
  getBoard,
  upsertBoard,
  setEntry,
  resetUser,
  copyUserWeek,
  weekEntries,
  buildEmbed,
  boardComponents,
  weekChoiceComponents,
  weekEditComponents,
  chooseContent,
  editContent,
  memberSummary,
  renderBoard
}
