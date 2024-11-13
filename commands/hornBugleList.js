const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { getDate } = require('../modules/common')
const axios = require('axios')
const devChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const nexonApiKey = process.env.NEXON_API_KEY
const mainUrl = 'https://open.api.nexon.com'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('거뿔')
    .setDescription('최근 1시간 내 거대한 외침의 뿔피리를 조회해~')
    .addSubcommand(subcommand =>
      subcommand.setName('전체검색')
        .setDescription('최근 1시간 내 10건을 검색해~')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('아이디')
        .setDescription('최근 1시간 내 입력한 내용이 포함된 아이디로 거뿔을 조회해~')
        .addStringOption(option =>
          option.setName('search_id').setDescription('입력한 아이디를 조회해~').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('내용')
        .setDescription('최근 1시간 내 입력한 내용이 포함된 거뿔을 조회해~')
        .addStringOption(option =>
          option.setName('search_content').setDescription('입력한 내용으로 조회해~').setRequired(true)
        )
    ),
  run: async ({ interaction }) => {
    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    const replyContent = { content: `거대한 외침의 뿔피리 목록을 <#${generalChannel.id}>에 작성했어~` }
    const subCommand = interaction.options._subcommand
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
      switch (subCommand) {
        case '아이디':
          const searchId = interaction.options._hoistedOptions.find(option => option.name === 'search_id').value
          let searchIdCount = 0
          for (const hornBugle of hornBugleList) {
            if (searchIdCount === 10) {
              break
            }
            if (hornBugle.character_name.indexOf(searchId) > -1) {
              const hornBugleEmbed = new EmbedBuilder()
                .setAuthor(writer)
                .setTitle('거대한 외침의 뿔피리')
                .setColor('#86E57F')
                .setThumbnail('attachment://horn.png')
                .addFields(
                  { name: '작성일시', value: getDate(new Date(hornBugle.date_send)) },
                  { name: '작성자', value: hornBugle.character_name },
                  { name: '내용', value: hornBugle.message }
                )
                .setTimestamp()
              embeds.push(hornBugleEmbed)
              searchIdCount++
            }
          }
          break
        case '내용':
          const searchContent = interaction.options._hoistedOptions.find(option => option.name === 'search_content').value
          let searchContentCount = 0
          for (const hornBugle of hornBugleList) {
            if (searchContentCount === 10) {
              break
            }
            if (hornBugle.message.indexOf(searchContent) > -1) {
              const hornBugleEmbed = new EmbedBuilder()
                .setAuthor(writer)
                .setTitle('거대한 외침의 뿔피리')
                .setColor('#86E57F')
                .setThumbnail('attachment://horn.png')
                .addFields(
                  { name: '작성일시', value: getDate(new Date(hornBugle.date_send)) },
                  { name: '작성자', value: hornBugle.character_name },
                  { name: '내용', value: hornBugle.message }
                )
                .setTimestamp()
              embeds.push(hornBugleEmbed)
              searchContentCount++
            }
          }
          break
        case '전체검색':
        default:
          for (let i = 0; i < 10; i++) {
            const hornBugle = hornBugleList[i]
            const hornBugleEmbed = new EmbedBuilder()
              .setAuthor(writer)
              .setTitle('거대한 외침의 뿔피리')
              .setColor('#86E57F')
              .setThumbnail('attachment://horn.png')
              .addFields(
                { name: '작성일시', value: getDate(new Date(hornBugle.date_send)) },
                { name: '작성자', value: hornBugle.character_name },
                { name: '내용', value: hornBugle.message }
              )
              .setTimestamp()
            embeds.push(hornBugleEmbed)
          }
          break
      }
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '거뿔 에러' + error)
    }

    if (embeds.length > 0) {
      interaction.reply(replyContent)
      generalChannel.send(
        {
          content: `가장 최근 ${embeds.length}건의 거대한 외침의 뿔피리 목록이야~`,
          embeds,
          files: [{ attachment: './static/img/horn.png', name: 'horn.png' }]
        }
      )
      return false
    }
    interaction.reply('검색조건에 맞는 거뿔 목록이 없네.. 다른걸로 입력해보면 어떨까?')
  }

}
