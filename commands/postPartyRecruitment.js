const { SlashCommandBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../modules/getGuildInfo')
const settings = require('../modules/guildSettings')
const { startLoading } = require('../modules/loading')
const { extractField } = require('../modules/common')
const botId = process.env.BOT_ID

// 파티모집 채널(포럼) 해석 — 설정 우선, 옛 config 폴백
function resolvePartyChannel (interaction) {
  const guildId = interaction.member.guild.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  const partyChannelId = settings.get(guildId, 'partyChannelId', null) || (guildInfo && guildInfo.partyChannelId)
  return partyChannelId && interaction.client.channels.cache.get(partyChannelId)
}

// 요일+시+분으로 '다가오는' 출발 일시를 구한다(오늘이면 시간이 지났을 때 다음 주).
function computeUpcoming (weekday, hour, minute) {
  const nowDate = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
  for (let i = 0; i < 10; i++) {
    const day = nowDate.startOf('day').plus({ days: i })
    if (day.toFormat('ccc') !== weekday) continue
    const candidate = day.set({ hour, minute })
    if (i === 0 && candidate <= nowDate) continue
    return candidate
  }
  return null
}

// 스레드 시작 메시지(또는 구 별도 메시지)에서 작성자 ID를 읽는다. 없으면 첫 참가자로 폴백.
function readCreatorId (content) {
  const authorRaw = extractField(content, '작성자')
  if (authorRaw) {
    const m = authorRaw.match(/<@!?(\d+)>/)
    if (m) return m[1]
  }
  const after = content.split('현재 참가인원')[1]
  if (after) {
    const m = after.match(/<@!?(\d+)>/)
    if (m) return m[1]
  }
  return null
}

// /파티모집 수정: 내가 올린, 아직 시작 안 한 파티의 출발시간·인원을 바꾼다.
async function editParty (interaction, forum) {
  await startLoading(interaction, '✏️ 파티 정보를 수정하는 중...')
  if (!forum) { await interaction.editReply('파티모집 채널을 찾을 수 없어 😢'); return }

  const threadId = interaction.options.getString('파티')
  const thread = await interaction.client.channels.fetch(threadId).catch(() => null)
  if (!thread) { await interaction.editReply('그 파티를 찾을 수 없어 😢 (이미 삭제됐을 수 있어)'); return }
  const msgs = await thread.messages.fetch({ limit: 10 }).catch(() => null)
  const startMsg = msgs && msgs.find(m => m.content.includes('출발시간:'))
  if (!startMsg) { await interaction.editReply('이 파티는 수정할 수 있는 형식이 아니야 😢'); return }
  if (readCreatorId(startMsg.content) !== interaction.user.id) {
    await interaction.editReply('본인이 올린 파티만 수정할 수 있어~'); return
  }

  const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
  const raw = extractField(startMsg.content, '출발시간')
  const curDt = raw && DateTime.fromFormat(`${now.year}년 ${raw}`, 'yyyy년 MM월 dd일 cccc H시 m분', { locale: 'ko' })
  if (!curDt || !curDt.isValid) { await interaction.editReply('기존 출발시간을 해석하지 못했어 😢'); return }

  const newWeekday = interaction.options.getString('출발요일')
  const newHour = interaction.options.getInteger('출발시')
  const newMin = interaction.options.getInteger('출발분')
  const newHeadcount = interaction.options.getInteger('인원')
  if (newWeekday == null && newHour == null && newMin == null && newHeadcount == null) {
    await interaction.editReply('바꿀 값을 하나 이상 입력해줘~ (출발요일/출발시/출발분/인원)'); return
  }

  const weekday = newWeekday || curDt.toFormat('ccc')
  const hour = newHour != null ? newHour : curDt.hour
  const minute = newMin != null ? newMin : curDt.minute
  const newDt = computeUpcoming(weekday, hour, minute)
  if (!newDt) { await interaction.editReply('출발 요일을 계산하지 못했어 😢'); return }

  const hcMsg = msgs.find(m => m.content.includes('모집인원:'))
  let headcount = newHeadcount
  if (headcount == null) {
    const hcRaw = extractField(startMsg.content, '모집인원') || (hcMsg && extractField(hcMsg.content, '모집인원'))
    headcount = hcRaw ? (parseInt(hcRaw, 10) || 0) : 0
  }
  const dungeonMsg = msgs.find(m => m.content.includes('모집던전:'))
  const dungeon = extractField(startMsg.content, '모집던전') || (dungeonMsg && extractField(dungeonMsg.content, '모집던전')) || thread.name

  const startTimeStr = `${newDt.toFormat('MM월 dd일 cccc')} ${hour}시 ${minute > 0 ? minute + '분' : '00분'}`
  const newTitle = `${newDt.toFormat('MM월 dd일 cccc')} [${dungeon}] ${hour}시${minute > 0 ? ' ' + minute + '분' : ''}, ${headcount === 0 ? '모이면 바로 출발' : '인원수(' + headcount + '명) 채워지면 출발!'}`

  // 출발시간·모집인원 라인이 든 메시지를 찾아 교체(신규=시작메시지 하나 / 구=별도 메시지들)
  for (const m of new Set([startMsg, hcMsg].filter(Boolean))) {
    let c = m.content
    if (c.includes('출발시간:')) c = c.replace(/출발시간:[^\n]*/, `출발시간: ${startTimeStr}`)
    if (c.includes('모집인원:')) c = c.replace(/모집인원:[^\n]*/, `모집인원: ${headcount}명`)
    await m.edit({ content: c }).catch(() => {})
  }
  await thread.setName(newTitle).catch(() => {})

  // 달력 자동 새로고침
  try {
    const ws = require('../modules/weeklySchedule')
    ws.invalidatePartyCache(interaction.member.guild.id)
    await ws.refreshGuildBoards(interaction.member.guild)
  } catch (e) { /* 보드 없음/실패 무시 */ }

  await interaction.editReply(`✅ 수정 완료! <#${thread.id}>\n· 출발: ${startTimeStr}\n· 인원: ${headcount === 0 ? '모바출' : headcount + '명'}`)
}

// 포럼에 name 태그가 없으면 자동 생성하고 태그 객체를 돌려준다.
// setAvailableTags는 태그 배열을 통째로 교체하므로 기존 태그를 보존한 채 새것만 append.
// 봇에 '채널 관리' 권한이 없거나(throw) 20개 한도를 넘으면 null 반환 → 호출부에서 안내.
async function ensureForumTag (forum, name) {
  const existing = forum.availableTags.find(t => t.name === name)
  if (existing) return existing
  if (forum.availableTags.length >= 20) return null // 포럼 태그 한도
  const preserved = forum.availableTags.map(t => ({ id: t.id, name: t.name, moderated: t.moderated, emoji: t.emoji }))
  const updated = await forum.setAvailableTags([...preserved, { name }])
  return updated.availableTags.find(t => t.name === name) || null
}

const week = ['일', '월', '화', '수', '목', '금', '토']
const weekOption = week.map(weekDay => ({ name: weekDay, value: weekDay }))
const maxHour = 24
const minHour = 1
const maxMin = 59
const minMin = 0
const maxHeadcount = 8
const minHeadcount = 0

const difficultChoices = [
  { name: '1-3 트라이', value: '1-3 트라이' },
  { name: '1-3 스피드런', value: '1-3 스피드런' }
]

// 서브커맨드 공통 옵션(출발 요일/시/분) - 중복 제거
const addTimeOptions = (sub) => sub
  .addStringOption(option =>
    option.setName('dungeon_start_date').setDescription('먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
      .addChoices(...weekOption)
  )
  .addIntegerOption(option =>
    option.setName('dungeon_start_hour').setDescription('출발 시간을 24시간 기준으로 적어줘~ (예) 1~24(숫자로만 입력)').setRequired(true)
      .setMaxValue(maxHour).setMinValue(minHour)
  )
  .addIntegerOption(option =>
    option.setName('dungeon_start_minute').setDescription('몇분 출발인지 알려줘~ (예) 0~59(숫자로만 입력)').setRequired(true)
      .setMaxValue(maxMin).setMinValue(minMin)
  )

const addHeadcountOption = (sub) => sub
  .addIntegerOption(option =>
    option.setName('dungeon_headcount').setDescription('마지막으로 출발 인원수를 적어줘! 0명으로 입력하면 모바출이야~').setRequired(true)
      .setMaxValue(maxHeadcount).setMinValue(minHeadcount)
  )

// 인원을 선택지로 받는 던전용(모바출 + 2~4명). 자유입력 대신 드롭다운으로 범위 강제.
const headcount2to4Choices = [
  { name: '모바출(0명)', value: 0 },
  { name: '2명', value: 2 },
  { name: '3명', value: 3 },
  { name: '4명', value: 4 }
]
const addHeadcount2to4Option = (sub) => sub
  .addIntegerOption(option =>
    option.setName('dungeon_headcount').setDescription('출발 인원을 골라줘! (모바출 / 2~4명)').setRequired(true)
      .addChoices(...headcount2to4Choices)
  )

module.exports = {
  data: new SlashCommandBuilder()
    .setName('파티모집')
    .setDescription('단계별로 작성하면 파티모집 포럼에 섯다라인이 대신 작성해줌!')
    .addSubcommand(subcommand => {
      subcommand.setName('믿음의균열').setDescription('브리레흐 4관 파티모집을 시작해~')
      addTimeOptions(subcommand)
      addHeadcountOption(subcommand)
      return subcommand
    })
    .addSubcommand(subcommand => {
      subcommand.setName('브리레흐').setDescription('브리레흐 파티모집을 시작해~')
      addTimeOptions(subcommand)
      subcommand.addStringOption(option =>
        option.setName('dungeon_difficult').setDescription('어디까지 갈건지 골라볼까?').setRequired(true)
          .addChoices(...difficultChoices)
      )
      addHeadcountOption(subcommand)
      return subcommand
    })
    .addSubcommand(subcommand => {
      subcommand.setName('탈라가흐').setDescription('탈라가흐 파티모집을 시작해~ (2~4인)')
      addTimeOptions(subcommand)
      addHeadcount2to4Option(subcommand)
      return subcommand
    })
    .addSubcommand(subcommand => {
      subcommand.setName('크롬바스심연').setDescription('크롬바스 심연 파티모집을 시작해~ (2~4인)')
      addTimeOptions(subcommand)
      addHeadcount2to4Option(subcommand)
      return subcommand
    })
    .addSubcommand(subcommand => {
      subcommand.setName('수정').setDescription('내가 올린 아직 시작 안 한 파티의 시간·인원을 수정해~')
      subcommand.addStringOption(o => o.setName('파티').setDescription('수정할 내 파티 선택').setRequired(true).setAutocomplete(true))
      subcommand.addStringOption(o => o.setName('출발요일').setDescription('바꿀 출발 요일').addChoices(...weekOption))
      subcommand.addIntegerOption(o => o.setName('출발시').setDescription('바꿀 출발 시각 1~24').setMinValue(minHour).setMaxValue(maxHour))
      subcommand.addIntegerOption(o => o.setName('출발분').setDescription('바꿀 출발 분 0~59').setMinValue(minMin).setMaxValue(maxMin))
      subcommand.addIntegerOption(o => o.setName('인원').setDescription('바꿀 모집 인원 (0=모바출)').setMinValue(minHeadcount).setMaxValue(maxHeadcount))
      return subcommand
    }),
  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true)
    if (interaction.options.getSubcommand() !== '수정' || focused.name !== '파티') return
    const forum = resolvePartyChannel(interaction)
    if (!forum || typeof forum.threads?.fetchActive !== 'function') { await interaction.respond([]); return }
    const active = await forum.threads.fetchActive().catch(() => null)
    if (!active) { await interaction.respond([]); return }
    const now = DateTime.now().setZone('Asia/Seoul')
    const choices = []
    for (const thread of active.threads.values()) {
      const msgs = await thread.messages.fetch({ limit: 10 }).catch(() => null)
      if (!msgs) continue
      const meta = msgs.find(m => m.content.includes('출발시간:'))
      if (!meta) continue
      if (readCreatorId(meta.content) !== interaction.user.id) continue // 내 파티만
      const raw = extractField(meta.content, '출발시간')
      const dt = raw && DateTime.fromFormat(`${now.year}년 ${raw}`, 'yyyy년 MM월 dd일 cccc H시 m분', { locale: 'ko' })
      if (dt && dt.isValid && dt < now) continue // 이미 시작한 건 제외
      choices.push({ name: thread.name.slice(0, 100), value: thread.id })
      if (choices.length >= 25) break
    }
    await interaction.respond(choices)
  },
  run: async ({ interaction }) => {
    const sub = interaction.options.getSubcommand()
    const partyChannel = resolvePartyChannel(interaction)

    if (sub === '수정') { return editParty(interaction, partyChannel) }

    const guildId = interaction.member.guild.id

    await startLoading(interaction, '📢 파티모집 글을 올리는 중...')

    if (!partyChannel) {
      await interaction.editReply('파티모집 채널을 찾을 수 없어 😢')
      return
    }

    const dungeonName = interaction.options._subcommand
    const getOptionValue = (name) =>
      interaction.options._hoistedOptions.find(opt => opt.name === name)?.value

    const dungeonStartDate = getOptionValue('dungeon_start_date')
    const dungeonStartHour = getOptionValue('dungeon_start_hour')
    const dungeonStartMinute = getOptionValue('dungeon_start_minute') ?? 0
    const dungeonDifficult = dungeonName === '믿음의균열' ? '4관' : getOptionValue('dungeon_difficult')
    const dungeonHeadcount = getOptionValue('dungeon_headcount')

    // 필요한 태그가 없으면 자동 생성(난이도 없는 던전은 던전 태그만).
    let tagDungeon, tagDungeonDifficult
    try {
      tagDungeon = await ensureForumTag(partyChannel, dungeonName)
      tagDungeonDifficult = dungeonDifficult ? await ensureForumTag(partyChannel, dungeonDifficult) : null
    } catch (err) {
      console.error('포럼 태그 자동 생성 실패:', err)
      await interaction.editReply('포럼 태그를 만들지 못했어 😢 봇에 이 포럼의 `채널 관리` 권한이 있는지 확인해줘.')
      return
    }
    if (!tagDungeon || (dungeonDifficult && !tagDungeonDifficult)) {
      await interaction.editReply(`포럼 태그를 만들거나 찾지 못했어 😢 (필요 태그: ${dungeonName}${dungeonDifficult ? ', ' + dungeonDifficult : ''}) — 태그가 20개 한도를 넘었거나 권한이 없을 수 있어.`)
      return
    }

    // 요일 매칭은 날짜로 하고, 오늘이면 출발 시각(시+분)이 이미 지났는지까지 확인
    const nowDate = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    let dungeonStartDatetime
    for (let i = 0; i < 10; i++) {
      const day = nowDate.startOf('day').plus({ days: i })
      if (day.toFormat('ccc') !== dungeonStartDate) continue
      const candidate = day.set({ hour: dungeonStartHour, minute: dungeonStartMinute })
      if (i === 0 && candidate <= nowDate) continue // 오늘이지만 시간이 지났으면 다음 주로
      dungeonStartDatetime = day
      break
    }
    if (!dungeonStartDatetime) {
      await interaction.editReply('출발 요일을 계산하지 못했어 😢')
      return
    }

    const recruitmentDungeonName = dungeonDifficult ? `${dungeonName} ${dungeonDifficult}` : dungeonName
    const recruitmentHeadcount = `${dungeonHeadcount}명`

    const startTimeStr = `${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} ${dungeonStartHour}시 ${dungeonStartMinute > 0 ? dungeonStartMinute + '분' : '00분'}`
    const title = `${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} [${recruitmentDungeonName}] ${dungeonStartHour}시${dungeonStartMinute > 0 ? ' ' + dungeonStartMinute + '분' : ''}, ${(dungeonHeadcount === 0 ? '모이면 바로 출발' : '인원수(' + dungeonHeadcount + '명) 채워지면 출발!')}`
    // 메타데이터(던전·출발시간·인원·작성자)를 '시작 메시지 본문'에 넣는다.
    // → 포럼 글 본문이라 통째로 지우지 않는 한 개별 삭제가 안 됨(알림·달력·수정이 깨지지 않음).
    // → '현재 참가인원' 마커 '위'에 둬서 참가자 추가/삭제 로직(마커 이하만 갱신)에 보존됨.
    let contents = '## <@everyone>제목과 태그로 던전을 먼저 확인해요.'
    contents += `\n### 하단에 댓글로 <@${botId}>을 맨션하면 자동으로 참여신청 돼요!`
    contents += `\n- <@${botId}>을 맨션하면 출발 10분전에 알림을 받을수 있어요!`
    contents += `\n\n모집던전: ${recruitmentDungeonName}`
    contents += `\n출발시간: ${startTimeStr}`
    contents += `\n모집인원: ${recruitmentHeadcount}`
    contents += `\n작성자: <@${interaction.member.id}>`
    contents += `\n\n### 현재 참가인원\n - <@${interaction.member.id}>`

    try {
      await partyChannel.threads.create({
        name: title,
        message: { content: contents },
        appliedTags: tagDungeonDifficult ? [tagDungeon.id, tagDungeonDifficult.id] : [tagDungeon.id]
      })
      await interaction.editReply(`<#${partyChannel.id}>에 해당 내용으로 작성했어~😎`)
      // 주간일정 달력이 새 파티를 바로 반영하도록 캐시 무효화 + 보드 새로고침(보드 없으면 무시)
      try {
        const ws = require('../modules/weeklySchedule')
        ws.invalidatePartyCache(guildId)
        await ws.refreshGuildBoards(interaction.member.guild)
      } catch (e) { /* 주간일정 보드 없음/새로고침 실패는 무시 */ }
    } catch (err) {
      console.error('파티모집 스레드 생성 실패:', err)
      await interaction.editReply('파티모집 작성 중 문제가 생겼어 😢')
    }
  }
}
