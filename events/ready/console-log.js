const cron = require("cron");
const {DateTime} = require("luxon");
const axios = require("axios");
const cheerio = require("cheerio");
const {EmbedBuilder} = require("discord.js");
const week = ["일", "월", "화", "수", "목", "금", "토"];
const veteran = ["알비", "키아", "라비", "마스", "피오드", "바리", "코일", "룬다", "페카"];

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const now = DateTime.now();
const tomorrow = now.plus({days: 1});
const startDate = DateTime.local(2024, 4, 20, 0, 0);

let veteranStartIndex = 5;
let veteranIndex = 0;
let dungeonList = [{date: startDate, dungeon: veteran[veteranStartIndex++]}];
for(let i = 1; i < 731; i++) {
  if(i === 1) {
    veteranIndex = veteranStartIndex;
  }
  if(i > 1) {
    veteranIndex = veteranIndex > 8 ? 0 : veteranIndex;
  }
  let date = startDate.plus({days: i});
  dungeonList.push({
    date: date, dungeon: veteran[veteranIndex]
  });
  veteranIndex++;
}

// 슬래시커맨드를 삭제하고 다시 시작해야 할때
const isDelete = false;
const channelId = process.env.NODE_ENV === "development" ? process.env.OTHER_CHANNEL_ID : process.env.CHANNEL_ID;
const otherChannelId = process.env.OTHER_CHANNEL_ID;
const fetchChannelId = process.env.NODE_ENV === "development" ? process.env.OTHER_FETCH_CHANNEL_ID : process.env.FETCH_CHANNEL_ID;
const basicErrorMessage = "오늘은 섯다라인 휴업중 🫥";
module.exports = async (client) => {
  console.log(`server: ${process.env.NODE_ENV}, ${client.user.tag} is online!`);
  await client.guilds.cache.forEach(guild => {
    guild.members.fetch();
  });

  if(isDelete){
    const fetchSlash = await client.application.commands.fetch();
    console.log(fetchSlash);

    await Promise.all(fetchSlash.map(async slash => {
      await client.application.commands.delete(slash.id);
    }));
  }

  let eachHoursJob = new cron.CronJob("0 * * * *", function() {
    const channel = client.channels.cache.get(otherChannelId);
    try {
      let now = new Date();
      channel.send(now.getHours() + " / " + now.getMinutes())
    } catch (error) {
      channel.send(basicErrorMessage);
    }
  });

  console.log("eachHoursJob start!")
  eachHoursJob.start();

  // 매일 아침 8시에 필요한 정보들을 가져와 채널로 전송
  let cronSchedule = process.env.NODE_ENV === "development" ? "0 * * * *" : "0 08 * * *";
  let dailyJob = new cron.CronJob(cronSchedule, async function(){

    const channel = client.channels.cache.get(channelId);
    try {
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth()+1;
      let day = now.getDate();
      let getWeekDay = week[now.getDay()];

      channel.send("오늘은 " + year + "년 " + month + "월 " + day + "일 " + getWeekDay + "요일, 오늘의 미션과 간추린뉴스 전달해줄게~!😎");
      const todayVeteran = dungeonList.find(({date}) => date.hasSame(now, "day") && date.hasSame(now, "year") && date.hasSame(now, "month"));
      const todayMissionObject = await axios.get("https://mabi.world/missions.php?server=korea&locale=korea&from=" + new Date().toISOString());
      const todayMission = todayMissionObject.data.missions[0];

      const tomorrowVeteran = dungeonList.find(({date}) => date.hasSame(tomorrow, "day") && date.hasSame(tomorrow, "year") && date.hasSame(tomorrow, "month"));
      const tomorrowMissionObject = await axios.get("https://mabi.world/missions.php?server=korea&locale=korea&from=" + new Date().addDays(1).toISOString());
      const tomorrowMission = tomorrowMissionObject.data.missions[0];

      const todayEmbed = new EmbedBuilder()
      .setTitle("오늘의 미션&베테랑")
      .setColor("#86E57F")
      .addFields(
          {name: "베테랑 던전", value: `- ${todayVeteran.dungeon}`}
          , {name: "탈틴", value: `- ${todayMission.Taillteann.Normal}\n* (PC방) ${todayMission.Taillteann.VIP}`}
          , {name: "타라", value: `- ${todayMission.Tara.Normal}\n* (PC방) ${todayMission.Tara.VIP}`}
      );

      const tomorrowEmbed = new EmbedBuilder()
      .setTitle("내일의 미션&베테랑")
      .setColor("#FFBB00")
      .addFields(
          {name: "베테랑 던전", value: `- ${tomorrowVeteran.dungeon}`}
          , {name: "탈틴", value: `- ${tomorrowMission.Taillteann.Normal}\n* (PC방) ${tomorrowMission.Taillteann.VIP}`}
          , {name: "타라", value: `- ${tomorrowMission.Tara.Normal}\n* (PC방) ${tomorrowMission.Tara.VIP}`}
      );
      channel.send({ embeds: [todayEmbed, tomorrowEmbed]});

      channel.send("\n\n=====================================\n아래는 https://quicknews.co.kr/ 에서 가져오는 간추린아침뉴스야!\n\n")

      const getBody = await axios.get("https://quicknews.co.kr/");
      const $ = cheerio.load(getBody.data);
      const content = $("#news_0").text();

      channel.send(content);
      channel.send("오늘도 화이팅!🤩");
    } catch(error){
      channel.send(basicErrorMessage);
      channel.send(error);

      if(process.env.NODE_ENV === "production") {
        const otherChannel = client.channels.cache.get(otherChannelId);
        otherChannel.send(basicErrorMessage + "\n" + error);
      }
    }
  });

  console.log("dailyJob start!")
  dailyJob.start();
};