const cron = require("cron");
const axios = require("axios");
const cheerio = require("cheerio");

// 슬래시커맨드를 삭제하고 다시 시작해야 할때
const isDelete = false;

module.exports = async (client) => {
  console.log(`server: ${process.env.NODE_ENV}, ${client.user.tag} is online!`);

  if(isDelete){
    const fetchSlash = await client.application.commands.fetch();
    console.log(fetchSlash);

    await Promise.all(fetchSlash.map(async slash => {
      await client.application.commands.delete(slash.id);
    }));
  }

  /*
  let testJob = new cron.CronJob("* * * * *", function(){
    const channel1 = client.channels.cache.get('1126803873458303039');
    const channel2 = client.channels.cache.get('1230086265609912373');
    channel1.send("1번채널");
    channel2.send("1번채널");
  });

  console.log("testJob start!")
  testJob.start();
  */

  const channelId = process.env.NODE_ENV === "development" ? process.env.OTHER_CHANNEL_ID : process.env.CHANNEL_ID;
  const otherChannelId = process.env.OTHER_CHANNEL_ID;
  const basicErrorMessage = "오늘은 섯다라인 휴업중 🫥";
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
  let cronSchedule = process.env.NODE_ENV === "development" ? "0 * * * *" : "* 08 * * *";
  let dailyJob = new cron.CronJob(cronSchedule, async function(){

    const channel = client.channels.cache.get(channelId);
    try {
      const getBody = await axios.get("https://quicknews.co.kr/");
      const $ = cheerio.load(getBody.data);
      const content = $("#news_0").text();

      channel.send(content);
    } catch(error){
      channel.send(basicErrorMessage);

      if(process.env.NODE_ENV === "production") {
        const otherChannel = client.channels.cache.get(otherChannelId);
        otherChannel.send(basicErrorMessage + "\n" + error);
      }
    }

  });

  console.log("dailyJob start!")
  dailyJob.start();
};