const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { getDate } = require('../modules/common')
const axios = require('axios')
const devChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const nexonApiKey = process.env.NEXON_API_KEY
const mainUrl = 'https://open.api.nexon.com'
const sellers = ['카디', '상인 네루', '상인 에루', '상인 베루', '상인 세누', '테일로', '데위', '얼리', '귀넥', '켄', '상인 메루', '상인 누누', '리나', '상인 아루', '모락', '상인 피루', '상인 라누']
const sellerChoices = []
for (const seller of sellers) {
  sellerChoices.push({
    name: seller,
    value: seller
  })
}
const maxChannel = 25
const minChannel = 1
const pockets = [
  { name: '달걀&감자&옥수수 주머니', value: '달걀,감자,옥수수' }, { name: '밀&보리 주머니', value: '밀,보리' }, { name: '양털&거미줄 주머니', value: '양털,거미줄' }, { name: '실뭉치 주머니', value: '실뭉치' }, { name: '가죽 주머니', value: '가죽' }, { name: '옷감 주머니', value: '옷감' }, { name: '실크 주머니', value: '실크' }, { name: '꽃바구니', value: '꽃바구니' }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('튼주')
    .setDescription('상인별로 전체 채널의 튼튼한 주머니 목록을 보여줘~')
    .addSubcommand(subcommand =>
      subcommand.setName('직접검색')
        .setDescription('모든 주머니를 선택한 채널과 상인에서 찾아봐~')
        .addIntegerOption((option) =>
          option.setName('channel')
            .setDescription('채널을 입력해~')
            .setRequired(true)
            .setMaxValue(maxChannel).setMinValue(minChannel)
        )
        .addStringOption((option) =>
          option.setName('seller')
            .setDescription('상인을 선택해~')
            .setRequired(true)
            .addChoices(...sellerChoices)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('주머니별')
        .setDescription('선택한 카테고리별 주머니를 전체 채널과 상인에서 찾아봐~')
        .addStringOption(option =>
          option.setName('pocket')
            .setDescription('주머니를 선택해~')
            .setRequired(true)
            .addChoices(...pockets)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('채널별')
        .setDescription('모든 주머니를 채널 별로 전체 상인에서 찾아봐~')
        .addIntegerOption((option) =>
          option.setName('channel')
            .setDescription('채널을 입력해~')
            .setRequired(true)
            .setMaxValue(maxChannel).setMinValue(minChannel)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('상인별')
        .setDescription('모든 주머니를 상인 별로 전체 채널에서 찾아봐~')
        .addStringOption((option) =>
          option.setName('seller')
            .setDescription('상인을 선택해~')
            .setRequired(true)
            .addChoices(...sellerChoices)
        )
    ),
  run: async ({ interaction }) => {
    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    await interaction.channel.sendTyping()
    const replyContent = { content: `튼튼한 주머니 목록을 <#${generalChannel.id}>에 작성했어~` }
    interaction.reply(replyContent)

    const subcommand = interaction.options._subcommand

    const channel = typeof interaction.options._hoistedOptions.find(option => option.name === 'channel') === typeof undefined
      ? ''
      : interaction.options._hoistedOptions.find(option => option.name === 'channel').value
    const seller = typeof interaction.options._hoistedOptions.find(option => option.name === 'seller') === typeof undefined
      ? ''
      : interaction.options._hoistedOptions.find(option => option.name === 'seller').value
    const pocket = typeof interaction.options._hoistedOptions.find(option => option.name === 'pocket') === typeof undefined
      ? ''
      : interaction.options._hoistedOptions.find(option => option.name === 'pocket').value

    const embeds = []
    let resultEmbedList = []
    const results = []
    let getBody
    try {
      switch (subcommand) {
        case '상인별':
          // 전체 채널, 전체 주머니를 선택한 상인으로 검색
          // 채널별 주머니 그룹화 필요
          for (let getChannel = minChannel; getChannel <= maxChannel; getChannel++) {
            if (getChannel === 10) {
              continue;
            }
            const channelInfo = { channel: getChannel }
            const sellerInfo = { seller, items: [] }
            getBody = await getApiRequest(getChannel, seller)
            const nextUpdateDate = new Date()
            const itemList = getBody.data.shop.find(getShop => getShop.tab_name === '주머니').item
            for (const item of itemList) {
              sellerInfo.items.push({
                title: item.item_display_name,
                thumbnail: item.image_url,
                nextUpdateDate: getDate(nextUpdateDate)
              })
            }
            channelInfo.sellerInfo = sellerInfo
            results.push(channelInfo)
          }

          // result 를 채널별로 분리해서 embed 를 10개씩 분리 발행
          for (const result of results) {
            const sellerInfo = result.sellerInfo
            for (const item of sellerInfo.items) {
              const itemEmbed = new EmbedBuilder()
                .setAuthor(writer)
                .setTitle(item.title)
                .setThumbnail(item.thumbnail)
                .setColor('#FFD8D8')
                .addFields(
                  { name: '채널', value: `${result.channel}채널` }
                )
                .addFields(
                  { name: '판매상인', value: sellerInfo.seller }
                )
                .addFields(
                  { name: '다음 갱신 시간', value: item.nextUpdateDate }
                )
                .setTimestamp()
              embeds.push(itemEmbed)
            }

            resultEmbedList = splitResultList(embeds)
            for (let i = 0; i < resultEmbedList.length; i++) {
              const embedList = resultEmbedList[i]
              generalChannel.send({ embeds: embedList })
            }
          }
          break
        case '주머니별':
          // 전체 채널, 전체 상인으로 선택한 주머니를 검색
          // 채널별 상인으로 그룹화 필요
          for (let getChannel = minChannel; getChannel <= maxChannel; getChannel++) {
            if (getChannel === 10) {
              continue;
            }
            const channelInfo = { channel: getChannel }
            for (const getSeller of sellers) {
              const sellerInfo = { seller: getSeller, items: [] }
              getBody = await getApiRequest(getChannel, getSeller)
              const nextUpdateDate = new Date()
              const itemList = getBody.data.shop.find(getShop => getShop.tab_name === '주머니').item
              const pockets = pocket.split(',')
              for (const item of itemList) {
                for (const getPocket of pockets) {
                  if (item.item_display_name.indexOf(getPocket) > -1) {
                    sellerInfo.items.push({
                      title: item.item_display_name,
                      thumbnail: item.image_url,
                      nextUpdateDate: getDate(nextUpdateDate)
                    })
                  }
                }
              }
              channelInfo.sellerInfo = sellerInfo
            }
            results.push(channelInfo)
          }

          // result 를 채널별로 분리해서 embed 를 10개씩 분리 발행
          for (const result of results) {
            const sellerInfo = result.sellerInfo
            for (const item of sellerInfo.items) {
              const itemEmbed = new EmbedBuilder()
                .setAuthor(writer)
                .setTitle(item.title)
                .setThumbnail(item.thumbnail)
                .setColor('#FFD8D8')
                .addFields(
                  { name: '채널', value: `${result.channel}채널` }
                )
                .addFields(
                  { name: '판매상인', value: sellerInfo.seller }
                )
                .addFields(
                  { name: '다음 갱신 시간', value: item.nextUpdateDate }
                )
                .setTimestamp()
              embeds.push(itemEmbed)
            }

            resultEmbedList = splitResultList(embeds)
            for (let i = 0; i < resultEmbedList.length; i++) {
              const embedList = resultEmbedList[i]
              generalChannel.send({ embeds: embedList })
            }
          }
          break
        case '직접검색':
        default: {
          // 채널, 상인을 선택하면 주머니 목록을 보여줌
          getBody = await getApiRequest(channel, seller)
          const nextUpdateDate = new Date(getBody.data.date_shop_next_update)
          const itemList = getBody.data.shop.find(getShop => getShop.tab_name === '주머니').item
          for (const item of itemList) {
            const itemEmbed = new EmbedBuilder()
              .setAuthor(writer)
              .setTitle(item.item_display_name)
              .setThumbnail(item.image_url)
              .setColor('#FFD8D8')
              .addFields(
                { name: '채널', value: `${channel}채널` }
              )
              .addFields(
                { name: '판매상인', value: seller }
              )
              .addFields(
                { name: '다음 갱신 시간', value: getDate(nextUpdateDate) }
              )
              .setTimestamp()
            embeds.push(itemEmbed)
          }

          resultEmbedList = splitResultList(embeds)
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
          break
      }
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '튼주 에러' + error)
    }
  }
}

const splitResultList = function (embeds = []) {
  const resultEmbedList = []
  for (let i = 0; i < embeds.length; i += 10) {
    const tempList = embeds.slice(i, i + 10)
    resultEmbedList.push(tempList)
  }
  return resultEmbedList
}

const getApiRequest = async function (channel, seller) {
  return await axios({
    method: 'GET',
    url: mainUrl + `/mabinogi/v1/npcshop/list?server_name=하프&channel=${channel}&npc_name=${seller}`,
    headers: {
      'x-nxopen-api-key': nexonApiKey
    }
  })
}
