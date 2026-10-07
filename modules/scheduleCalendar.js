const path = require('node:path')
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas')

// 번들 한글 폰트 등록(시스템 폰트에 의존하지 않도록 — 리눅스 배포에서 한글 깨짐 방지).
GlobalFonts.registerFromPath(path.join(__dirname, '../static/fonts/NanumGothic-Regular.ttf'), 'NanumGothic')
GlobalFonts.registerFromPath(path.join(__dirname, '../static/fonts/NanumGothic-Bold.ttf'), 'NanumGothicBold')

const COL_W = 178
const PAD = 20
const WEEK_LABEL_H = 30
const DOW_H = 26
const TITLE_H = 46
const LINE_H = 22
// 셀 높이는 내용(줄 수)에 맞춰 그 주에서 가장 많은 날 기준으로 늘어난다(세로로 확장 → 아래가 안 잘림).
const MIN_CELL_H = 100 // 내용 적은 주도 너무 납작하지 않게
const CELL_TOP = 20 // 첫 줄 위 여백
const CELL_BOTTOM = 12 // 마지막 줄 아래 여백
const MAX_CELL_LINES = 24 // 안전 상한(이보다 많으면 '+N개 더')

// 줄 수 → 셀 높이
function cellHeight (lineCount) {
  const shown = Math.min(lineCount, MAX_CELL_LINES) + (lineCount > MAX_CELL_LINES ? 1 : 0)
  return Math.max(MIN_CELL_H, CELL_TOP + shown * LINE_H + CELL_BOTTOM)
}

const C = {
  bg: '#2b2d31',
  panel: '#1e1f22',
  cell: '#313338',
  cellWeekend: '#3a2e2e',
  grid: '#232428',
  title: '#ffffff',
  sub: '#b5bac1',
  date: '#f2f3f5',
  sat: '#5bc0ff',
  sun: '#ff6b6b',
  ok: '#57f287',
  no: '#f04747',
  party: '#5bc0ff',
  info: '#dddddd'
}
const TYPE_COLOR = { ok: C.ok, no: C.no, party: C.party, info: C.info, all: C.ok, allHead: C.ok, name: C.date }
// 그룹 헤더(전체 가능일정 / 멤버 이름)는 굵게 그려 구분
const BOLD_TYPES = new Set(['allHead', 'name'])

function truncate (ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

// model: { title, weeks: [ { label, range, days: [ { weekday, date, dow(0=목..6=수), lines:[{text,type}] } x7 ] } ] }
function renderCalendar (model) {
  const weeks = model.weeks
  const gridW = COL_W * 7
  const width = PAD * 2 + gridW
  // 주마다 '그 주에서 가장 줄 많은 날' 기준으로 셀 높이 결정(모든 날 같은 높이로 맞춤)
  const weekCellH = weeks.map(w => cellHeight(Math.max(1, ...w.days.map(d => d.lines.length))))
  const height = TITLE_H + PAD + weeks.reduce((h, _w, i) => h + WEEK_LABEL_H + DOW_H + weekCellH[i] + PAD, 0)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, width, height)

  // 제목
  ctx.fillStyle = C.title
  ctx.font = '26px NanumGothicBold'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`📅 ${model.title || '주간일정'}`, PAD, 32)

  let y = TITLE_H + PAD
  weeks.forEach((week, wi) => {
    const cellH = weekCellH[wi]
    // 주 라벨
    ctx.fillStyle = C.sub
    ctx.font = '18px NanumGothicBold'
    ctx.fillText(`${week.label}  ·  ${week.range}`, PAD, y + 20)
    y += WEEK_LABEL_H

    // 요일 헤더 + 셀
    for (let i = 0; i < 7; i++) {
      const x = PAD + i * COL_W
      const day = week.days[i]
      const weekend = day.weekday === '토' || day.weekday === '일'

      // 요일 헤더
      ctx.fillStyle = C.panel
      ctx.fillRect(x, y, COL_W - 2, DOW_H)
      ctx.fillStyle = day.weekday === '토' ? C.sat : day.weekday === '일' ? C.sun : C.date
      ctx.font = '15px NanumGothicBold'
      ctx.fillText(`${day.weekday}  ${day.date}`, x + 10, y + 18)

      // 셀 배경
      const cy = y + DOW_H
      ctx.fillStyle = weekend ? C.cellWeekend : C.cell
      ctx.fillRect(x, cy, COL_W - 2, cellH)

      // 셀 내용(라인). 헤더 타입은 굵게.
      const lines = day.lines.slice(0, MAX_CELL_LINES)
      const overflow = day.lines.length - lines.length
      let ly = cy + CELL_TOP
      for (const line of lines) {
        ctx.font = BOLD_TYPES.has(line.type) ? '14px NanumGothicBold' : '14px NanumGothic'
        ctx.fillStyle = TYPE_COLOR[line.type] || C.info
        ctx.fillText(truncate(ctx, line.text, COL_W - 20), x + 10, ly)
        ly += LINE_H
      }
      if (overflow > 0) {
        ctx.fillStyle = C.sub
        ctx.fillText(`+${overflow}개 더`, x + 10, ly)
      }
    }
    y += DOW_H + cellH + PAD
  })

  return canvas.toBuffer('image/png')
}

module.exports = { renderCalendar }
