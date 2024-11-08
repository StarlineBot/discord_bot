const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const axios = require('axios')
const devChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const nexonApiKey = process.env.NEXON_API_KEY
const mainUrl = 'https://open.api.nexon.com'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('거뿔')
    .setDescription('거대한 외침의 뿔피리의 가장 최근 20건을 불러와~'),
  run: async ({ interaction }) => {
    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    const replyContent = { content: `거대한 외침의 뿔피리 목록을 <#${generalChannel.id}>에 작성했어~` }
    interaction.reply(replyContent)

    const embeds = []
    try {
      const getBody = await axios({
        method: 'GET',
        url: mainUrl + '/mabinogi/v1/horn-bugle-world/history?server_name=하프',
        headers: {
          'x-nxopen-api-key': nexonApiKey
        }
      })

      const hornBugleList = getBody.data.horn_bugle_world_history
      for (let i = 0; i < 10; i++) {
        const hornBugle = hornBugleList[i]
        const date = new Date(hornBugle.date_send)

        const hornBugleEmbed = new EmbedBuilder()
          .setAuthor(writer)
          .setTitle('거대한 외침의 뿔피리')
          .setColor('#86E57F')
          .setThumbnail('attachment://horn.png')
          .addFields(
            { name: '작성일시', value: getDate(date) },
            { name: '작성자', value: hornBugle.character_name },
            { name: '내용', value: hornBugle.message }
          )
          .setTimestamp()
        embeds.push(hornBugleEmbed)
      }
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '거뿔 에러' + error)
    }
    generalChannel.send(
      {
        content: '가장 최근 20건의 거대한 외침의 뿔피리 목록이야~',
        embeds,
        files: [{ attachment: './static/img/horn.png', name: 'horn.png' }]
      }
    )
  }

}

const getDate = function (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)
  const hours = String(date.getHours()).padStart(2, 0)
  const min = String(date.getMinutes()).padStart(2, 0)
  const sec = String(date.getSeconds()).padStart(2, 0)
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`
}
