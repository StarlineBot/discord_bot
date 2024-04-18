const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const axios = require("axios");
const {DateTime} = require("luxon");
const otherChannelId = process.env.OTHER_CHANNEL_ID;
const basicErrorMessage = "오늘은 섯다라인 휴업중 🫥";
const veteran = ["알비", "키아", "라비", "마스", "피오드", "바리", "코일", "룬다", "페카"];

const now = DateTime.now();
const startDate = DateTime.local(2024, 4, 18, 0, 0);

let veteranIndex = 3;
let dungeonList = [{date: startDate, dungeon: veteran[veteranIndex++]}];
for(let i = 1; i < 731; i++) {
  veteranIndex = veteranIndex > 8 ? 0 : veteranIndex;
  let date = startDate.plus({days: i});
  dungeonList.push({
    date: date, dungeon: veteran[veteranIndex]
  });
  veteranIndex++;
}

module.exports = {
  data: new SlashCommandBuilder()
  .setName("오미")
  .setDescription("오늘의 미션과 베테랑 던전을 알려줄게!")
  , run: async ({interaction}) => {

    try {
      const todayVeteran = dungeonList.find(({date}) => date.hasSame(now, "day") && date.hasSame(now, "year") && date.hasSame(now, "month"));
      const todayMission = await axios.get("https://mabi.world/missions.php?server=korea&locale=korea&from=" + new Date().toISOString());
      const mission = todayMission.data.missions[0];

      const embed = new EmbedBuilder()
      .setTitle("오늘의 미션&베테랑")
      .setColor(0x0099ff)
      .addFields(
          {name: "베테랑 던전", value: `- ${todayVeteran.dungeon}`}
          , {name: "탈틴", value: `- ${mission.Taillteann.Normal}\n* (PC방) ${mission.Taillteann.VIP}`}
          , {name: "타라", value: `- ${mission.Tara.Normal}\n* (PC방) ${mission.Tara.VIP}`}
      );
      interaction.reply({content: "오미를 안내 해줄게~ 그럼 오늘도 화이팅!🤩", embeds: [embed]});
    } catch(error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(otherChannelId).send("오미 에러" + error);
    }
  }
}