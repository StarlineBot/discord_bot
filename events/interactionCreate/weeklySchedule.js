const ws = require('../../modules/weeklySchedule')

// 주간일정 컴포넌트 라우팅. customId 규칙(상태를 customId에 실어 stateless 처리):
//  ws|edit                      '내 일정 입력' → 주 선택
//  ws|wk|<weekId>               주 선택 → 요일 선택 화면
//  ws|days|<weekId>             요일 멀티셀렉트 → 시작/종료 입력 화면
//  ws|sh|<weekId>|<days>|<state>   시작 시 선택
//  ws|sm|<weekId>|<days>|<state>   시작 분 선택
//  ws|eh|<weekId>|<days>|<state>   종료 시 선택
//  ws|em|<weekId>|<days>|<state>   종료 분 선택
//  ws|add|<weekId>|<days>|<state>  입력한 구간 추가(기존에 누적·병합)
//  ws|done                      입력 패널 닫기(저장은 구간 추가 시점에 끝남)
//  ws|setx|<weekId>|<days>         선택 요일 불가 처리
//  ws|clr|<weekId>|<days>          선택 요일 비우기(종일)
//  ws|copy|<weekId>             이번주 내 입력을 이 주(다음주)로 복사
//  ws|back                      주 선택 화면으로
//  ws|reset|<weekId>            이 주 내 입력 초기화
//
// Discord는 클릭 시 다른 컴포넌트의 현재 선택값을 주지 않으므로, 선택 상태(시작/종료 시·분)를
// 서버 메모리가 아니라 customId(state)에 실어 넘긴다 → pm2 재시작·다중클릭에도 안전.
module.exports = async (interaction) => {
  const id = interaction.customId
  if (!id || !id.startsWith('ws|')) return

  const channel = interaction.channel
  const channelId = channel.id
  const userId = interaction.user.id
  const board = ws.getBoard(channelId)

  if (!board) {
    if (interaction.isRepliable()) {
      await interaction.reply({ content: '이 채널의 주간일정 보드를 찾을 수 없어~ `/주간일정`으로 다시 만들어줘.', ephemeral: true }).catch(() => {})
    }
    return
  }

  // customId를 '|'로 자르되, state(마지막 필드)는 그대로 둔다.
  const parts = id.split('|')
  const action = parts[1]
  const weekId = parts[2]
  const daysCsv = parts[3]
  const stateStr = parts[4]

  // 요일 CSV → 인덱스 배열
  const dayIdxsOf = (csv) => (csv || '').split(',').map(Number).filter(n => !Number.isNaN(n))

  // 시간 입력 화면을 갱신(상태 반영)
  const showTime = async (newState, note) => {
    await interaction.update({
      content: ws.timeEditContent(ws.getBoard(channelId), weekId, userId, daysCsv, newState, note),
      components: ws.weekTimeComponents(weekId, daysCsv, newState)
    })
  }

  // 0) 완료 — 입력 패널 닫기(컴포넌트 제거). 저장은 '구간 추가' 시점에 이미 끝남.
  if (action === 'done') {
    await interaction.update({ content: '✅ 입력 완료! (이 메시지는 닫아도 돼~)', components: [] }).catch(() => {})
    return
  }

  // 1) 편집창 열기 → 주 선택
  if (action === 'edit') {
    await interaction.reply({
      content: ws.chooseContent(board, userId),
      components: ws.weekChoiceComponents(),
      ephemeral: true
    })
    return
  }

  // 2) 주 선택 → 요일 선택 화면
  if (action === 'wk') {
    await interaction.update({
      content: ws.editContent(board, weekId, userId, null),
      components: ws.weekDayComponents(weekId)
    })
    return
  }

  // 3) 요일 선택 → 시작/종료 입력 화면
  if (action === 'days') {
    const csv = interaction.values.join(',')
    const labels = interaction.values.map(i => ws.LABELS[Number(i)]).join('·')
    const emptyState = ws.buildState({})
    await interaction.update({
      content: ws.timeEditContent(board, weekId, userId, csv, emptyState, `요일 선택: **${labels}**`),
      components: ws.weekTimeComponents(weekId, csv, emptyState)
    })
    return
  }

  // 4) 시작/종료 시·분 선택 → state 갱신 후 화면 갱신
  if (action === 'sh' || action === 'sm' || action === 'eh' || action === 'em') {
    const s = ws.parseState(stateStr)
    const field = { sh: 'sh', sm: 'sm', eh: 'eh', em: 'em' }[action]
    s[field] = interaction.values[0]
    await showTime(ws.buildState(s))
    return
  }

  // 5) 구간 추가(검증 후 누적)
  if (action === 'add') {
    const s = ws.parseState(stateStr)
    if (s.sh == null) { await showTime(stateStr, '⚠️ 시작 시각을 먼저 골라줘'); return }
    const start = Number(s.sh) + ws.minPart(s.sm)
    const end = s.eh === 'none' ? 24 : (s.eh == null ? null : Number(s.eh) + ws.minPart(s.em))
    if (end == null) { await showTime(stateStr, '⚠️ 종료 시각을 골라줘 (제한없음도 가능)'); return }
    if (end <= start) {
      await showTime(stateStr, `⚠️ 종료(${ws.fmtTime(end)})가 시작(${ws.fmtTime(start)})보다 늦어야 해`)
      return
    }
    const dayIdxs = dayIdxsOf(daysCsv)
    ws.addInterval(channelId, weekId, userId, dayIdxs, { s: start, e: end })
    await ws.renderBoard(channel, channelId).catch(() => {})
    // 추가 후 state 비워서 다음 구간 입력 준비
    await showTime(ws.buildState({}), `✅ 추가: ${ws.fmtIntervals([{ s: start, e: end }])}`)
    return
  }

  // 6) 선택 요일 불가 처리
  if (action === 'setx') {
    const dayIdxs = dayIdxsOf(daysCsv)
    ws.setUnavail(channelId, weekId, userId, dayIdxs)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await showTime(ws.buildState({}), '🚫 불가로 처리했어')
    return
  }

  // 7) 선택 요일 비우기(종일로)
  if (action === 'clr') {
    const dayIdxs = dayIdxsOf(daysCsv)
    ws.clearDays(channelId, weekId, userId, dayIdxs)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await showTime(ws.buildState({}), '🗑 비웠어 (종일 가능으로)')
    return
  }

  // 8) 이번주 → 이 주(다음주)로 복사
  if (action === 'copy') {
    const fromWeekId = ws.thisWeek().weekId
    ws.copyUserWeek(channelId, fromWeekId, weekId, userId)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await interaction.update({
      content: '📋 이번주 입력을 다음주로 복사했어~\n\n' + ws.editContent(ws.getBoard(channelId), weekId, userId, null),
      components: ws.weekDayComponents(weekId)
    })
    return
  }

  // 9) 주 다시 고르기
  if (action === 'back') {
    await interaction.update({
      content: ws.chooseContent(board, userId),
      components: ws.weekChoiceComponents()
    })
    return
  }

  // 10) 이 주 내 입력 초기화
  if (action === 'reset') {
    ws.resetUser(channelId, weekId, userId)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await interaction.update({
      content: '🗑 이 주 내 입력을 초기화했어~\n\n' + ws.editContent(ws.getBoard(channelId), weekId, userId, null),
      components: ws.weekDayComponents(weekId)
    })
  }
}
