const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const axios = require('axios')
const { DateTime } = require('luxon')
const guildModule = require('../modules/getGuildInfo')
const devChannelId = guildModule.getMonitorChannelId()
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const local = [
  { type: 'type1', names: ['티르코네일', '두갈드 아일', '두갈드 아일 거주지 + 성터'] },
  { type: 'type2', names: ['던바튼', '가이레흐', '카브 항구', '피오드'] },
  { type: 'type3', names: ['반호르'] },
  { type: 'type4', names: ['이멘 마하'] },
  { type: 'type5', names: ['센 마이', '센 마이 거주지 + 성터'] },
  { type: 'type6', names: ['케안 항구', '모르바 아일'] },
  { type: 'type7', names: ['라노', '누베스 산맥'] },
  { type: 'type8', names: ['콘누스'] },
  { type: 'type9', names: ['쿠르클레', '이리아 폭포'] },
  { type: 'type10', names: ['피시스', '자르딘'] },
  { type: 'type11', names: ['그림자 세계'] },
  { type: 'type12', names: ['탈틴', '타라', '코리브 협곡', '블라고 평원', '슬리아브 퀼린', '아브 네아'] }
]

const weathers = [
  { key: -9, weather: '알수없음', icon: '❓' },
  { key: -8, weather: '화창함', icon: '☀️' },
  { key: -7, weather: '약간 흐림', icon: '🌤️' },
  { key: -6, weather: '부분적으로 흐림', icon: '🌤️' },
  { key: -5, weather: '적당히 흐림', icon: '⛅️' },
  { key: -4, weather: '흐림', icon: '⛅️' },
  { key: -3, weather: '매우 흐림', icon: '☁️' },
  { key: -2, weather: '엄청나게 흐림', icon: '☁️' },
  { key: -1, weather: '완전히 흐림', icon: '☁️' },
  { key: 0, weather: '비(0%)', icon: '🌦️' },
  { key: 1, weather: '비(0%)', icon: '🌦️' },
  { key: 2, weather: '비(10%)', icon: '🌦️' },
  { key: 3, weather: '비(10%)', icon: '🌦️' },
  { key: 4, weather: '비(20%)', icon: '🌦️' },
  { key: 5, weather: '비(20%)', icon: '🌦️' },
  { key: 6, weather: '비(30%)', icon: '🌦️' },
  { key: 7, weather: '비(30%)', icon: '🌦️' },
  { key: 8, weather: '비(40%)', icon: '🌦️' },
  { key: 9, weather: '비(40%)', icon: '🌦️' },
  { key: 10, weather: '비(50%)', icon: '🌧️' },
  { key: 11, weather: '비(50%)', icon: '🌧️' },
  { key: 12, weather: '비(60%)', icon: '🌧️' },
  { key: 13, weather: '비(60%)', icon: '🌧️' },
  { key: 14, weather: '비(70%)', icon: '🌧️' },
  { key: 15, weather: '비(70%)', icon: '🌧️' },
  { key: 16, weather: '비(80%)', icon: '🌧️' },
  { key: 17, weather: '비(80%)', icon: '🌧️' },
  { key: 18, weather: '비(90%)', icon: '🌧️' },
  { key: 19, weather: '비(90%)', icon: '🌧️' },
  { key: 20, weather: '천둥번개', icon: '⛈️' }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('날씨')
    .setDescription('마비노기 날씨 정보를 가져와~'),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    try {
      const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')

      const forecastWeatherObject = await axios.get(
          `https://mabi.world/api/forecast/?from=${now.toISO().split('.')[0]}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              Referer: 'https://www.google.com',
              Connection: 'keep-alive'
            },
            withCredentials: true
          })
      let forecastResult = ''
      let i = 0
      let separator = ' - '
      for (const getType in forecastWeatherObject.data.forecast) {
        if (getType === 'type13') {
          continue
        }
        if (i > 0) {
          forecastResult += '\n'
          separator = '* '
        }
        const weatherCode = forecastWeatherObject.data.forecast[getType][0]
        const weather = weathers.find(({ key }) => key === weatherCode).weather
        const icon = weathers.find(({ key }) => key === weatherCode).icon
        const localNames = local.find(({ type }) => type === getType).names

        forecastResult += `${separator} ${localNames.join(
            ', ')} - ${icon}${weather}`
        i++
      }

      const upcomingThunderWeatherObject = await axios.get(
          `https://mabi.world/api/forecast/?from=${now.toISO().split(
              '.')[0]}&next=thunder&for=each&in=m`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              Referer: 'https://www.google.com',
              Connection: 'keep-alive'
            },
            withCredentials: true
          })
      const afterDateOfType7 = now.plus(
        { minute: upcomingThunderWeatherObject.data.next.for.type7 })
      const upcomingRainyWeatherObject = await axios.get(
          `https://mabi.world/api/forecast/?from=${now.toISO().split(
              '.')[0]}&next=rain&for=each&in=m`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              Referer: 'https://www.google.com',
              Connection: 'keep-alive'
            },
            withCredentials: true
          })

      const afterDateOfType10 = now.plus(
        { minute: upcomingRainyWeatherObject.data.next.for.type10 })

      const embed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('오늘의 에린날씨~🌈')
        .setColor('#FFD9EC')
        .addFields(
          {
            name: '현재 시간(리얼타임)기준 날씨',
            value: `${forecastResult}`
          }
          , {
            name: `가장 빠른 ${local.find(({ type }) => type === 'type10').names.join(
                ', ')}의 비오는 날(발화석)🌧️`,
            value: `${afterDateOfType10.toFormat('yyyy-MM-dd HH:mm')}`
          }
          , {
            name: `가장 빠른 ${local.find(({ type }) => type === 'type7').names.join(
                ', ')}의 천둥치는 날(쌍검전사)⛈️`,
            value: `${afterDateOfType7.toFormat('yyyy-MM-dd HH:mm')}`
          }
        )
        .setTimestamp()

      const generalChannel = interaction.client.channels.cache.get(generalChannelId)
      const replyContent = { content: `현재 시간 기준 에린날씨를 <#${generalChannel.id}>에 작성했어~` }
      replyContent.ephemeral = true
      interaction.reply(replyContent)

      generalChannel.send({ embeds: [embed] })
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '날씨 에러' + error)
    }
  }
}
