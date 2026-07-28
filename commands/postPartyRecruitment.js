const { SlashCommandBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../modules/getGuildInfo')
const botId = process.env.BOT_ID

const week = ['일', '월', '화', '수', '목', '금', '토']
const weekOption = week.map(weekDay => ({ name: weekDay, value: weekDay }))
const maxHour = 24
const minHour = 1
const maxMin = 59
const minMin = 0
const maxHeadcount = 8
const minHeadcount = 0

const difficultChoices = [
  { name: '전관스피드런', value: '전관스피드런' },
  { name: '1관클2관클3관클', value: '1관클2관클3관클' },
  { name: '1관트라이', value: '1관트라이' },
  { name: '1관클2관클3관트라이', value: '1관클2관클3관트라이' },
  { name: '1관클2관클', value: '1관클2관클' },
  { name: '1관클2관트라이', value: '1관클2관트라이' }
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
    }),
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const partyChannel = guildInfo && interaction.client.channels.cache.get(guildInfo.partyChannelId)

    await interaction.deferReply({ ephemeral: true })

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

    const tagDungeon = partyChannel.availableTags.find(({ name }) => name === dungeonName)
    const tagDungeonDifficult = partyChannel.availableTags.find(({ name }) => name === dungeonDifficult)
    if (!tagDungeon || !tagDungeonDifficult) {
      await interaction.editReply(`포럼 태그를 찾을 수 없어 😢 (필요 태그: ${dungeonName}, ${dungeonDifficult})`)
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

    const recruitmentDungeonName = `${dungeonName} ${dungeonDifficult}`
    const recruitmentHeadcount = `${dungeonHeadcount}명`

    const title = `${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} [${recruitmentDungeonName}] ${dungeonStartHour}시${dungeonStartMinute > 0 ? ' ' + dungeonStartMinute + '분' : ''}, ${(dungeonHeadcount === 0 ? '모이면 바로 출발' : '인원수(' + dungeonHeadcount + '명) 채워지면 출발!')}`
    let contents = '## <@everyone>제목과 태그로 던전을 먼저 확인해요.'
    contents += `\n### 하단에 댓글로 <@${botId}>을 맨션하면 자동으로 참여신청 돼요!`
    contents += `\n- <@${botId}>을 맨션하면 출발 10분전에 알림을 받을수 있어요!`
    contents += `\n\n### 현재 참가인원\n - <@${interaction.member.id}>`

    try {
      const partyThreadChannel = await partyChannel.threads.create({
        name: title,
        message: { content: contents },
        appliedTags: [tagDungeon.id, tagDungeonDifficult.id]
      })
      await partyThreadChannel.send(`모집던전: ${recruitmentDungeonName}`)
      await partyThreadChannel.send(`출발시간: ${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} ${dungeonStartHour}시 ${dungeonStartMinute > 0 ? dungeonStartMinute + '분' : '00분'}`)
      await partyThreadChannel.send(`모집인원: ${recruitmentHeadcount}`)
      await interaction.editReply(`<#${partyChannel.id}>에 해당 내용으로 작성했어~😎`)
    } catch (err) {
      console.error('파티모집 스레드 생성 실패:', err)
      await interaction.editReply('파티모집 작성 중 문제가 생겼어 😢')
    }
  }
}
