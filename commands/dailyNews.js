const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios')
const cheerio = require('cheerio')
const guildModule = require('../modules/getGuildInfo')
const otherChannelId = process.env.DEV_CHANNEL_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('매일뉴스')
    .setDescription('오늘의 간추린 뉴스를 가지고 올게, 출처는 https://quicknews.co.kr/ 여기야!'),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    // const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    try {
      const getBody = await axios.get('https://quicknews.co.kr/')
      const $ = cheerio.load(getBody.data)
      const content = $('#news_0').text()

      const generalChannel = interaction.client.channels.cache.get(generalChannelId)
      const replyContent = { content: `매일뉴스는 <#${generalChannel.id}>에 작성했어~` }
      if (interaction.channelId === generalChannel.id) {
        replyContent.ephemeral = true
      }
      interaction.reply(replyContent)

      generalChannel.send(content)
    } catch (error) {
      interaction.reply('오늘은 섯다라인 휴업중 🫥')
      interaction.client.channels.cache.get(otherChannelId).send(
        '매일뉴스 에러: ' + error)
    }
  }
}
