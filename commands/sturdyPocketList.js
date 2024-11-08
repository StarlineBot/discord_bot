const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const axios = require('axios')
const devChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const nexonApiKey = process.env.NEXON_API_KEY
const mainUrl = 'https://open.api.nexon.com'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('튼주')
    .setDescription('상인별로 전체 채널의 튼튼한 주머니 목록을 보여줘~')
    .addIntegerOption((option) =>
      option.setName('channel')
        .setDescription('채널을 입력해~')
        .setRequired(true)
        .setMaxValue(25).setMinValue(1)
    )
    .addStringOption((option) =>
      option.setName('seller')
        .setDescription('상인을 선택해~')
        .setRequired(true)
        .addChoices(
          { name: '카디', value: '카디' }
          , { name: '상인 네루', value: '상인 네루' }
          , { name: '상인 에루', value: '상인 에루' }
          , { name: '상인 베루', value: '상인 베루' }
          , { name: '상인 세누', value: '상인 세누' }
          , { name: '상인 메루', value: '상인 메루' }
          , { name: '상인 누누', value: '상인 누누' }
          , { name: '상인 아루', value: '상인 아루' }
          , { name: '상인 피루', value: '상인 피루' }
          , { name: '상인 라누', value: '상인 라누' }
          , { name: '테일로', value: '테일로' }
          , { name: '데위', value: '데위' }
          , { name: '얼리', value: '얼리' }
          , { name: '귀넥', value: '귀넥' }
          , { name: '켄', value: '켄' }
          , { name: '리나', value: '리나' }
          , { name: '모락', value: '모락' }
        )
    ),
  run: async ({ interaction }) => {
    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    const replyContent = { content: `튼튼한 주머니 목록을 <#${generalChannel.id}>에 작성했어~` }
    interaction.reply(replyContent)

    const channel = interaction.options._hoistedOptions.find(option => option.name === 'channel').value
    const seller = interaction.options._hoistedOptions.find(option => option.name === 'seller').value

    const embeds = []
    try {
      const getBody = await axios({
        method: 'GET',
        url: mainUrl + `/mabinogi/v1/npcshop/list?server_name=하프&channel=${channel}&npc_name=${seller}`,
        headers: {
          'x-nxopen-api-key': nexonApiKey
        }
      })

      const nextUpdateDate = new Date(getBody.data.date_shop_next_update)
      const itemList = getBody.data.shop.find(getShop => getShop.tab_name === '주머니').item
      for (const item of itemList) {
        const itemEmbed = new EmbedBuilder()
          .setAuthor(writer)
          .setTitle(item.item_display_name)
          .setThumbnail(item.image_url)
          .setColor('#FFD8D8')
          .addFields(
            { name: '다음 갱신 시간', value: getDate(nextUpdateDate) }
          )
          .setTimestamp()
        embeds.push(itemEmbed)
      }
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '튼주 에러' + error)
    }

    const resultEmbedList = []
    for (let i = 0; i < embeds.length; i += 10) {
      const tempList = embeds.slice(i, i + 10)
      resultEmbedList.push(tempList)
    }

    for (let i = 0; i < resultEmbedList.length; i++) {
      const embedList = resultEmbedList[i]
      generalChannel.send(
        {
          content: `현재 ${channel}채널의 선택상인(${seller})이 파는 주머니 목록이야~ ${i + 1}/${resultEmbedList.length}`,
          embeds: embedList
        }
      )
    }
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
