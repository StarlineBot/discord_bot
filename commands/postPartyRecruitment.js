const { SlashCommandBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const guildModule = require('../modules/getGuildInfo')

const week = ['일', '월', '화', '수', '목', '금', '토']
const weekOption = []
for (const weekDay of week) {
  weekOption.push({
    name: weekDay, value: weekDay
  })
}

const devPartyChannelId = process.env.DEV_PARTY_RECRUITMENT
module.exports = {
  data: new SlashCommandBuilder()
    .setName('파티모집')
    .setDescription('단계별로 작성하면 파티모집 포럼에 섯다라인이 대신 작성해줌!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('글렌베르나')
        .setDescription('글렌베르나 파티모집을 시작해~')
        .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription(
            '먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
            .addChoices(
              { name: '일', value: '일' },
              { name: '월', value: '월' },
              { name: '화', value: '화' },
              { name: '수', value: '수' },
              { name: '목', value: '목' },
              { name: '금', value: '금' },
              { name: '토', value: '토' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_time').setDescription(
            '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시').setRequired(true)
            .setMaxValue(24).setMinValue(1)
        )
        .addStringOption((option) =>
          option.setName('dungeon_difficult').setDescription(
            '다 왔다! 난이도를 골라줘~').setRequired(true)
            .addChoices(
              { name: '어려움', value: '어려움' }
              , { name: '쉬움', value: '쉬움' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_headcount').setDescription(
            '마지막으로 최소 출발 인원수를 적어줘!').setRequired(true)
            .addChoices(
              { name: '모바출', value: 0 }
              , { name: '4명', value: 4 }
              , { name: '8명', value: 8 }
              , { name: '2명', value: 2 }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('크롬바스')
        .setDescription('크롬바스 파티모집을 시작해~')
        .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription(
            '먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
            .addChoices(
              { name: '일', value: '일' },
              { name: '월', value: '월' },
              { name: '화', value: '화' },
              { name: '수', value: '수' },
              { name: '목', value: '목' },
              { name: '금', value: '금' },
              { name: '토', value: '토' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_time').setDescription(
            '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시').setRequired(true)
            .setMaxValue(24).setMinValue(1)
        )
        .addStringOption((option) =>
          option.setName('dungeon_difficult').setDescription(
            '다 왔다! 난이도를 골라줘~').setRequired(true)
            .addChoices(
              { name: '100', value: '100' }
              , { name: '50', value: '50' }
              , { name: '30', value: '30' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_headcount').setDescription(
            '마지막으로 최소 출발 인원수를 적어줘!').setRequired(true)
            .addChoices(
              { name: '모바출', value: 0 }
              , { name: '4명', value: 4 }
              , { name: '2명', value: 2 }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('테흐두인')
        .setDescription('테흐두인 파티모집을 시작해~')
        .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription(
            '먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
            .addChoices(
              { name: '일', value: '일' },
              { name: '월', value: '월' },
              { name: '화', value: '화' },
              { name: '수', value: '수' },
              { name: '목', value: '목' },
              { name: '금', value: '금' },
              { name: '토', value: '토' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_start_time').setDescription(
            '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시').setRequired(true)
            .setMaxValue(24).setMinValue(1)
        )
        .addStringOption((option) =>
          option.setName('dungeon_difficult').setDescription(
            '다 왔다! 난이도를 골라줘~').setRequired(true)
            .addChoices(
              { name: '어려움', value: '어려움' }
              , { name: '쉬움', value: '쉬움' }
            )
        )
        .addIntegerOption((option) =>
          option.setName('dungeon_headcount').setDescription(
            '마지막으로 최소 출발 인원수를 적어줘!').setRequired(true)
            .addChoices(
              { name: '모바출', value: 0 }
              , { name: '4명', value: 4 }
              , { name: '2명', value: 2 }
            )
        )
    )
  .addSubcommand(subcommand =>
      subcommand
      .setName('보약팟')
      .setDescription('보약팟 파티모집을 시작해~')
      .addStringOption((option) =>
          option.setName('dungeon_start_date').setDescription(
              '먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!').setRequired(true)
          .addChoices(
              { name: '일', value: '일' },
              { name: '월', value: '월' },
              { name: '화', value: '화' },
              { name: '수', value: '수' },
              { name: '목', value: '목' },
              { name: '금', value: '금' },
              { name: '토', value: '토' }
          )
      )
      .addIntegerOption((option) =>
          option.setName('dungeon_start_time').setDescription(
              '출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시').setRequired(true)
          .setMaxValue(24).setMinValue(1)
      )
  )
  ,
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const partyChannel = interaction.client.channels.cache.get(guildInfo.partyChannelId)
    const devPartyChannel = interaction.client.channels.cache.get(devPartyChannelId)

    const dungeonName = interaction.options._subcommand
    let dungeonStartDate
    let dungeonDifficult
    let dungeonStartTime
    let dungeonHeadcount
    for (const option of interaction.options._hoistedOptions) {
      switch (option.name) {
        case 'dungeon_start_date':
          dungeonStartDate = option.value
          break
        case 'dungeon_start_time':
          dungeonStartTime = option.value
          break
        case 'dungeon_difficult':
          dungeonDifficult = option.value
          break
        default:
          dungeonHeadcount = option.value
          break
      }
    }

    if(dungeonName === "보약팟") {
      dungeonDifficult = "엘리트";
    }

    const tagDungeon = partyChannel.availableTags.find(
      ({ name }) => name === dungeonName)
    const tagDungeonDifficult = partyChannel.availableTags.find(
      ({ name }) => name === dungeonDifficult)

    let dungeonStartDatetime
    const now = DateTime.now().setLocale('ko').startOf('day')
    for (let i = 1; i < 10; i++) {
      if (now.plus({ days: i }).toFormat('ccc') === dungeonStartDate) {
        dungeonStartDatetime = now.plus({ days: i })
        break
      }
    }

    let title = `${dungeonStartDatetime.toFormat('yy년 MM월 dd일 cccc')} ${dungeonStartTime}시 [${dungeonName} ${dungeonDifficult}] ${(dungeonHeadcount === 0
        ? '모이면 바로 출발'
: '인원수(' + dungeonHeadcount + '명) 채워지면 출발!')}`

    let contents = '<@everyone>' +
        '\n제목과 태그를 확인하고 댓글로 참여여부를 작성해줘!\n\n(예) 은접시 / 낭만엘나\n\n' +
        `<@${interaction.member.id}>`;
    if(dungeonName === "보약팟") {
      title = `${dungeonStartDatetime.toFormat('yy년 MM월 dd일 cccc')} ${dungeonStartTime}시 [${dungeonName}] 8인 채워지면 출발!`;
      contents = '<@everyone>' + " feat: 열정이"
          + "\n## 1시간 40릴을 목표로 진행 합니다. 전부 길원들로만 갈거라서 8인이 모여야 출발할수 있습니다.\n"
          + "\n"
          + "\n- 준비물"
          + "\n - `무제한 그림자 미션 통행증` 혹은 `엘리트 통행증 - 섀도우 위자드 퇴치` 5장"
          + "\n - `만사형통의 보약` 1개"
          + "\n\n### 보약팟이란?"
          + "\n파티원 8명이 각자 `무제한 그림자 미션 통행증` 혹은 `엘리트 통행증 - 섀도우 위자드 퇴치` 을 5장(혹은 4장)씩 준비하여"
          + "\n1시간 지속되는 `만사형통의 보약`(몬스터 골드드랍과 퀘스트 완료 골드 보상 2배증가)을 먹고"
          + "\n보약이 지속되는 동안 40릴(혹은 32릴)을 돌아서 나오는"
          + "\n새도우위자드 완료보상 35,200 골드와 몬스터 드랍골드, 에린의정기, 알반훈련소 하드-중급 등의 유효보상을 노리는 파티로"
          + "\n1개 보약 사용시 보통 700만 ~ 1,000만원의 골드를 벌 수 있는 파티입니다.";
    }
    await partyChannel.threads.create({
      name: title,
      message: {
        content: contents
      },
      appliedTags: [tagDungeon.id, tagDungeonDifficult.id]
    })

    if (guildInfo.partyChannelId !== devPartyChannelId) {
      // 누가 어떤내용을 작성했는지 확인용 발행
      await devPartyChannel.threads.create({
        name: title,
        message: {
          content: contents
        },
        appliedTags: [tagDungeon.id, tagDungeonDifficult.id]
      })
    }

    interaction.reply('파티모집에 해당 내용으로 작성했어~😎 확인해줘~')
  }
}
