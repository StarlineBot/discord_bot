const cron = require("cron");
const axios = require("axios");
const cheerio = require("cheerio");

// 슬래시커맨드를 삭제하고 다시 시작해야 할때
const isDelete = false;

module.exports = async (client) => {
  console.log(`${client.user.tag} is online`);

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

  // 매일 아침 8시에 그날 정보들을 가져와 채널로 전송
  let dailyJob = new cron.CronJob("* 08 * * *", async function(){

    const channelId = process.env.CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);
    try {
      const getBody = await axios.get("https://quicknews.co.kr/");
      const $ = cheerio.load(getBody.data);
      const content = $("#news_0").text();

      channel.send(content);
    } catch(error){
      const errorMessage = "오늘은 섯다라인 휴업중 🫥";
      channel.send(errorMessage);

      const otherChannel = client.channels.cache.get(process.env.ADMIN_CHANNEL_ID);
      otherChannel.send(errorMessage + "\n" + error);
    }

  });

  console.log("dailyJob start!")
  dailyJob.start();
};