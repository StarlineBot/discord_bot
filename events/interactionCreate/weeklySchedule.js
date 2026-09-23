const ws = require('../../modules/weeklySchedule')

// 주간일정 컴포넌트 라우팅. customId 규칙(주=weekId를 실어 stateless 처리):
//  ws|edit             '내 일정 입력' 버튼 → 주 선택 화면
//  ws|wk|<weekId>      주 선택 → 그 주 요일 셀렉트 노출
//  ws|days|<weekId>    요일 멀티셀렉트 → 시각 셀렉트 노출
//  ws|hour|<weekId>|<csv>  시각 셀렉트 → 그 주 선택 요일에 값 적용 후 보드 갱신
//  ws|copy|<weekId>    이번주 내 입력을 이 주(다음주)로 복사
//  ws|back             주 선택 화면으로
//  ws|reset|<weekId>   이 주 내 입력 초기화
//
// Discord는 클릭 시 다른 컴포넌트의 현재 선택값을 주지 않으므로, 선택 상태(주/요일)를
// 서버 메모리가 아니라 customId에 실어 넘긴다 → pm2 재시작·다중클릭에도 안전.
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

  // 1) 편집창 열기 → 주 선택
  if (id === 'ws|edit') {
    await interaction.reply({
      content: ws.chooseContent(board, userId),
      components: ws.weekChoiceComponents(),
      ephemeral: true
    })
    return
  }

  // 2) 주 선택 → 그 주 편집 화면
  if (id.startsWith('ws|wk|')) {
    const weekId = id.slice('ws|wk|'.length)
    await interaction.update({
      content: ws.editContent(board, weekId, userId, null),
      components: ws.weekEditComponents(weekId, null)
    })
    return
  }

  // 3) 요일 선택 → 시각 셀렉트 노출
  if (id.startsWith('ws|days|')) {
    const weekId = id.slice('ws|days|'.length)
    const csv = interaction.values.join(',')
    const labels = interaction.values.map(i => ws.LABELS[Number(i)]).join(', ')
    await interaction.update({
      content: ws.editContent(board, weekId, userId, labels),
      components: ws.weekEditComponents(weekId, csv)
    })
    return
  }

  // 4) 시각 적용
  if (id.startsWith('ws|hour|')) {
    const rest = id.slice('ws|hour|'.length)
    const sep = rest.indexOf('|')
    const weekId = rest.slice(0, sep)
    const csv = rest.slice(sep + 1)
    const dayIdxs = csv.split(',').map(Number).filter(n => !Number.isNaN(n))
    const token = interaction.values[0]
    const value = token === 'x' ? 'x' : Number(token)
    ws.setEntry(channelId, weekId, userId, dayIdxs, value)
    await ws.renderBoard(channel, channelId).catch(() => {})

    const applied = dayIdxs.map(i => ws.LABELS[i]).join('·')
    const timeText = value === 'x' ? '불가' : (value === 0 ? '종일' : `${value}시부터`)
    await interaction.update({
      content: `✅ **${applied}** → ${timeText} 적용!\n\n` + ws.editContent(ws.getBoard(channelId), weekId, userId, null),
      components: ws.weekEditComponents(weekId, null)
    })
    return
  }

  // 5) 이번주 → 이 주(다음주)로 복사
  if (id.startsWith('ws|copy|')) {
    const weekId = id.slice('ws|copy|'.length)
    const fromWeekId = ws.thisWeek().weekId
    ws.copyUserWeek(channelId, fromWeekId, weekId, userId)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await interaction.update({
      content: '📋 이번주 입력을 다음주로 복사했어~\n\n' + ws.editContent(ws.getBoard(channelId), weekId, userId, null),
      components: ws.weekEditComponents(weekId, null)
    })
    return
  }

  // 6) 주 다시 고르기
  if (id === 'ws|back') {
    await interaction.update({
      content: ws.chooseContent(board, userId),
      components: ws.weekChoiceComponents()
    })
    return
  }

  // 7) 이 주 내 입력 초기화
  if (id.startsWith('ws|reset|')) {
    const weekId = id.slice('ws|reset|'.length)
    ws.resetUser(channelId, weekId, userId)
    await ws.renderBoard(channel, channelId).catch(() => {})
    await interaction.update({
      content: '🗑 이 주 내 입력을 초기화했어~\n\n' + ws.editContent(ws.getBoard(channelId), weekId, userId, null),
      components: ws.weekEditComponents(weekId, null)
    })
  }
}
