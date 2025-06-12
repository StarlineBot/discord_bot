const { SlashCommandBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../modules/getGuildInfo')
const botId = process.env.BOT_ID

const week = ['일', '월', '화', '수', '목', '금', '토']
const weekOption = []
for (const weekDay of week) {
  weekOption.push({
    name: weekDay, value: weekDay
  })
}
const maxHour = 24
const minHour = 1
const maxMin = 59
const minMin = 0
const maxHeadcount = 8
const minHeadcount = 0

// const devPartyChannelId = process.env.DEV_PARTY_RECRUITMENT
module.exports = {
  data: new SlashCommandBuilder()
    .setName('파티모집')
    .setDescription('단계별로 작성하면 파티모집 포럼에 섯다라인이 대신 작성해줌!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('브리레흐')
        .setDescription('브리레흐 파티모집을 시작해~')
        .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription('먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
            .addChoices(...weekOption)
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_hour').setDescription(
            '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24(숫자로만 입력)').setRequired(true)
            .setMaxValue(maxHour).setMinValue(minHour)
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_minute').setDescription(
            '몇분 출발인지 알려줘~ (예) 0~59(숫자로만 입력)').setRequired(true)
            .setMaxValue(maxMin).setMinValue(minMin)
        )
        .addStringOption((option) =>
          option.setName('dungeon_difficult').setDescription(
            '어디까지 갈건지 골라볼까?').setRequired(true)
            .addChoices(
              { name: '전관스피드런', value: '전관스피드런' },
              { name: '1관클2관클3관클', value: '1관클2관클3관클' },
              { name: '1관트라이', value: '1관트라이' },
              { name: '1관클2관클3관트라이', value: '1관클2관클3관트라이' },
              { name: '1관클2관클', value: '1관클2관클' },
              { name: '1관클2관트라이', value: '1관클2관트라이' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_headcount').setDescription(
            '마지막으로 출발 인원수를 적어줘! 0명으로 입력하면 모바출이야~').setRequired(true)
            .setMaxValue(maxHeadcount).setMinValue(minHeadcount)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('글렌베르나')
        .setDescription('글렌베르나 파티모집을 시작해~')
        .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription(
            '먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
            .addChoices(...weekOption)
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_hour').setDescription(
            '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24(숫자로만 입력)').setRequired(true)
            .setMaxValue(maxHour).setMinValue(minHour)
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_minute').setDescription(
            '몇분 출발인지 알려줘~ (예) 0~59(숫자로만 입력)').setRequired(true)
            .setMaxValue(maxMin).setMinValue(minMin)
        )
        .addStringOption((option) =>
          option.setName('dungeon_difficult').setDescription(
            '다 왔다! 난이도를 골라줘~').setRequired(true)
            .addChoices(
              { name: '매우 어려움', value: '매우 어려움' }
              , { name: '어려움', value: '어려움' }
              , { name: '쉬움', value: '쉬움' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_headcount').setDescription(
            '마지막으로 출발 인원수를 적어줘! 0명으로 입력하면 모바출이야~').setRequired(true)
            .setMaxValue(maxHeadcount).setMinValue(minHeadcount)
        )
    ),
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const partyChannel = interaction.client.channels.cache.get(guildInfo.partyChannelId)

    const dungeonName = interaction.options._subcommand
    const getOptionValue = (name) =>
      interaction.options._hoistedOptions.find(opt => opt.name === name)?.value

    const dungeonStartDate = getOptionValue('dungeon_start_date')
    const dungeonStartHour = getOptionValue('dungeon_start_hour')
    const dungeonStartMinute = getOptionValue('dungeon_start_minute') ?? 0
    const dungeonDifficult = getOptionValue('dungeon_difficult')
    const dungeonHeadcount = getOptionValue('dungeon_headcount')

    const tagDungeon = partyChannel.availableTags.find(
      ({ name }) => name === dungeonName)
    const tagDungeonDifficult = partyChannel.availableTags.find(
      ({ name }) => name === dungeonDifficult)

    let dungeonStartDatetime
    const nowDate = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    const now = nowDate.startOf('day')
    // 당일인데 시간이 지금보다 이전이면 다음주로 미룸
    const index = nowDate.get('hour') >= dungeonStartHour ? 1 : 0
    // 당일부터 요일을 체크함
    for (let i = index; i < 10; i++) {
      if (now.plus({ days: i }).toFormat('ccc') === dungeonStartDate) {
        dungeonStartDatetime = now.plus({ days: i })
        break
      }
    }

    const recruitmentDungeonName = `${dungeonName} ${dungeonDifficult}`
    const recruitmentHeadcount = `${dungeonHeadcount}명`

    const title = `${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} [${recruitmentDungeonName}] ${dungeonStartHour}시${dungeonStartMinute > 0 ? ' ' + dungeonStartMinute + '분' : ''}, ${(dungeonHeadcount === 0 ? '모이면 바로 출발' : '인원수(' + dungeonHeadcount + '명) 채워지면 출발!')}`
    let contents = '## <@everyone>제목과 태그로 던전을 먼저 확인해요.'
    contents += `\n### 하단에 댓글로 <@${botId}>을 맨션하면 자동으로 참여신청 돼요!`
    contents += `\n- <@${botId}>을 맨션하면 출발 10분전에 알림을 받을수 있어요!`
    contents += `\n\n### 현재 참가인원\n - <@${interaction.member.id}>`

    partyChannel.threads.create({
      name: title,
      message: {
        content: contents
      },
      appliedTags: [tagDungeon.id, tagDungeonDifficult.id]
    }).then(partyThreadChannel => {
      partyThreadChannel.send(`모집던전: ${recruitmentDungeonName}`)
      partyThreadChannel.send(`출발시간: ${dungeonStartDatetime.toFormat('MM월 dd일 cccc')} ${dungeonStartHour}시 ${dungeonStartMinute > 0 ? dungeonStartMinute + '분' : '00분'}`)
      partyThreadChannel.send(`모집인원: ${recruitmentHeadcount}`)
    })

    interaction.reply(`<#${partyChannel.id}>에 해당 내용으로 작성했어~😎`)
  }
}
