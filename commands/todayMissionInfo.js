const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const axios = require("axios");
const {DateTime} = require("luxon");
const otherChannelId = process.env.OTHER_CHANNEL_ID;
const basicErrorMessage = "오늘은 섯다라인 휴업중 🫥";
const veteran = ["알비", "키아", "라비", "마스", "피오드", "바리", "코일", "룬다", "페카"];

const now = DateTime.now();
const tomorrow = now.plus({days: 1});
const startDate = DateTime.local(2024, 4, 20, 0, 0);

Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

let veteranStartIndex = 5;
let veteranIndex = 0;
let dungeonList = [{date: startDate, dungeon: veteran[veteranStartIndex++]}];
for (let i = 1; i < 731; i++) {
  if (i === 1) {
    veteranIndex = veteranStartIndex;
  }
  if (i > 1) {
    veteranIndex = veteranIndex > 8 ? 0 : veteranIndex;
  }
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
      const todayVeteran = dungeonList.find(
          ({date}) => date.hasSame(now, "day") && date.hasSame(now, "year")
              && date.hasSame(now, "month"));
      const todayMissionObject = await axios.get(
          "https://mabi.world/missions.php?server=korea&locale=korea&from="
          + new Date().toISOString());
      const todayMission = todayMissionObject.data.missions[0];

      const tomorrowVeteran = dungeonList.find(
          ({date}) => date.hasSame(tomorrow, "day") && date.hasSame(tomorrow,
              "year") && date.hasSame(tomorrow, "month"));
      const tomorrowMissionObject = await axios.get(
          "https://mabi.world/missions.php?server=korea&locale=korea&from="
          + new Date().addDays(1).toISOString());
      const tomorrowMission = tomorrowMissionObject.data.missions[0];

      const todayEmbed = new EmbedBuilder()
      .setTitle("오늘의 미션&베테랑")
      .setColor("#86E57F")
      .addFields(
          {name: "베테랑 던전", value: `- ${todayVeteran.dungeon}`}
          , {
            name: "탈틴",
            value: `- ${todayMission.Taillteann.Normal}\n* (PC방) ${todayMission.Taillteann.VIP}`
          }
          , {
            name: "타라",
            value: `- ${todayMission.Tara.Normal}\n* (PC방) ${todayMission.Tara.VIP}`
          }
      );

      const tomorrowEmbed = new EmbedBuilder()
      .setTitle("내일의 미션&베테랑")
      .setColor("#FFBB00")
      .addFields(
          {name: "베테랑 던전", value: `- ${tomorrowVeteran.dungeon}`}
          , {
            name: "탈틴",
            value: `- ${tomorrowMission.Taillteann.Normal}\n* (PC방) ${tomorrowMission.Taillteann.VIP}`
          }
          , {
            name: "타라",
            value: `- ${tomorrowMission.Tara.Normal}\n* (PC방) ${tomorrowMission.Tara.VIP}`
          }
      );
      interaction.reply({
        content: "오미를 안내 해줄게~ 그럼 오늘도 화이팅!🤩",
        embeds: [todayEmbed, tomorrowEmbed]
      });
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(otherChannelId).send(
          "오미 에러" + error);
    }
  }
}