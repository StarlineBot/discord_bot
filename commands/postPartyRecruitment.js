const {SlashCommandBuilder} = require("discord.js");
const week = ["일", "월", "화", "수", "목", "금", "토"];
let weekOption = [];
for(let weekDay of week){
  weekOption.push({
    name: weekDay, value: weekDay
  });
}
module.exports = {
  data: new SlashCommandBuilder()
  .setName('파티모집')
  .setDescription('단계별로 작성하면 파티모집 포럼에 섯다라인이 대신 작성해줌!')
  .addSubcommand(subcommand =>
      subcommand
      .setName('글렌베르나')
      .setDescription('글렌베르나 파티모집을 시작해~')
      .addStringOption((option) =>
          option.setName("dungeon_start_date").setDescription("먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!").setRequired(true)
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
          option.setName("dungeon_start_time").setDescription("출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시").setRequired(true)
          .setMaxValue(24).setMinValue(1)
      )
      .addStringOption((option) =>
          option.setName("dungeon_difficult").setDescription("다 왔다! 난이도를 골라줘~").setRequired(true)
          .addChoices(
               {name: "어려움", value: "어려움"}
              , {name: "쉬움", value: "쉬움"}
          )
      )
      .addIntegerOption((option) =>
          option.setName("dungeon_headcount").setDescription("마지막으로 최소 출발 인원수를 적어줘!").setRequired(true)
          .addChoices(
              {name: "모바출", value: 0}
              , {name: "4명", value: 4}
              , {name: "8명", value: 8}
              , {name: "2명", value: 2}
          )
      )
  )
  .addSubcommand(subcommand =>
      subcommand
      .setName('크롬바스')
      .setDescription('크롬바스 파티모집을 시작해~')
      .addStringOption((option) =>
          option.setName("dungeon_start_date").setDescription("먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!").setRequired(true)
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
          option.setName("dungeon_start_time").setDescription("출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시").setRequired(true)
          .setMaxValue(24).setMinValue(1)
      )
      .addStringOption((option) =>
          option.setName("dungeon_difficult").setDescription("다 왔다! 난이도를 골라줘~").setRequired(true)
          .addChoices(
              {name: "100", value: "100"}
              , {name: "50", value: "50"}
              , {name: "30", value: "30"}
          )
      )
      .addIntegerOption((option) =>
          option.setName("dungeon_headcount").setDescription("마지막으로 최소 출발 인원수를 적어줘!").setRequired(true)
          .addChoices(
              {name: "모바출", value: 0}
              , {name: "4명", value: 4}
              , {name: "2명", value: 2}
          )
      )
  )
  .addSubcommand(subcommand =>
      subcommand
      .setName('테흐두인')
      .setDescription('테흐두인 파티모집을 시작해~')
      .addStringOption((option) =>
          option.setName("dungeon_start_date").setDescription("먼저 출발 요일을 정해줘! 요일은 다가오는 요일이야!").setRequired(true)
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
          option.setName("dungeon_start_time").setDescription("출발 시간을 24시간 기준으로 적어줘~ (예) 1~24시").setRequired(true)
          .setMaxValue(24).setMinValue(1)
      )
      .addStringOption((option) =>
          option.setName("dungeon_difficult").setDescription("다 왔다! 난이도를 골라줘~").setRequired(true)
          .addChoices(
              {name: "어려움", value: "어려움"}
              , {name: "쉬움", value: "쉬움"}
          )
      )
      .addIntegerOption((option) =>
          option.setName("dungeon_headcount").setDescription("마지막으로 최소 출발 인원수를 적어줘!").setRequired(true)
          .addChoices(
              {name: "모바출", value: 0}
              , {name: "4명", value: 4}
              , {name: "2명", value: 2}
          )
      )
  )
  , run: async ({interaction}) => {
    const channel = interaction.client.channels.cache.get(process.env.PARTY_RECRUITMENT);

    let dungeonName = interaction.options._subcommand;
    let dungeonStartDate;
    let dungeonDifficult;
    let dungeonStartTime;
    let dungeonHeadcount;
    for(let option of interaction.options._hoistedOptions) {
      switch(option.name) {
        case "dungeon_start_date":
          dungeonStartDate = option.value;
          break;
        case "dungeon_start_time":
          dungeonStartTime = option.value;
          break;
        case "dungeon_difficult":
          dungeonDifficult = option.value;
          break;
        default:
          dungeonHeadcount = option.value;
          break;
      }
    }

    let tagDungeon = channel.availableTags.find(({name}) => name === dungeonName);
    let tagDungeonDifficult = channel.availableTags.find(({name}) => name === dungeonDifficult);

    let title = dungeonName + " " + dungeonDifficult + " - " + dungeonStartDate + "요일 " + dungeonStartTime + "시 " + (dungeonHeadcount === 0 ? "모이면 바로 출발" : "인원수(" + dungeonHeadcount + "명) 채워지면 출발!");
    await channel.threads.create({
      name: title,
      message: {content: '<@everyone>' + '\n제목과 태그를 확인하고 댓글로 참여여부를 작성해줘!\n\n(예) Starline / 다크메이지'},
      appliedTags: [tagDungeon.id, tagDungeonDifficult.id]
    });

    interaction.reply("파티모집에 해당 내용으로 작성했어~😎 확인해봐!");
  }
}