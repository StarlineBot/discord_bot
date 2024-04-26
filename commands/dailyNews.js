const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios')
const cheerio = require('cheerio')
const otherChannelId = process.env.DEV_CHANNEL_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('매일뉴스')
    .setDescription('오늘의 간추린 뉴스를 가지고 올게, 출처는 https://quicknews.co.kr/ 여기야!'),
  run: async ({ interaction }) => {
    try {
      const getBody = await axios.get('https://quicknews.co.kr/')
      const $ = cheerio.load(getBody.data)
      const content = $('#news_0').text()
      interaction.reply(content)
    } catch (error) {
      interaction.reply('오늘은 섯다라인 휴업중 🫥')
      interaction.client.channels.cache.get(otherChannelId).send(
        '매일뉴스 에러: ' + error)
    }
  }
}
