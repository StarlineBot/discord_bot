const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('매일뉴스')
  .setDescription('오늘의 간추린 뉴스를 가지고 올게, 출처는 https://quicknews.co.kr/ 여기야!')
  , run: async ({interaction}) => {
    const getBody = await axios.get("https://quicknews.co.kr/");
    const $ = cheerio.load(getBody.data);
    const content = $("#news_0").text();
    interaction.reply(content);
  }
}