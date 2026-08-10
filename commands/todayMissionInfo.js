const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { DateTime } = require('luxon')
const devChannelId = guildModule.getMonitorChannelId()
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('오미')
    .setDescription('오늘의 미션과 베테랑 던전을 알려줄게!'),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const today = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    const offset = new Date().getTimezoneOffset() * 60000
    const now = new Date(Date.now() - offset)
    const { getVeteran, getMissions } = require(
      '../modules/todayMission')(today, now)

    // 미션 조회에 수 초가 걸려 3초 내 응답을 못 하면 디스코드가 "응답 없음" 에러를 띄운다.
    // 먼저 인터랙션을 defer로 확보한다.
    await interaction.deferReply({ ephemeral: true })
    try {
      const { today: todayMissionObject, tomorrow: tomorrowMissionObject } = await getMissions()
      const todayMission = todayMissionObject.missions[0]
      const tomorrowMission = tomorrowMissionObject.missions[0]

      const todayEmbed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('오늘의 미션&베테랑')
        .setColor('#86E57F')
        .addFields(
          { name: '베테랑 던전', value: `- ${getVeteran().today}` }
          , {
            name: '탈틴',
            value: `- ${todayMission.Taillteann.Normal}\n* (PC방) ${todayMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${todayMission.Tara.Normal}\n* (PC방) ${todayMission.Tara.VIP}`
          }
        )
        .setTimestamp()

      const tomorrowEmbed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('내일의 미션&베테랑')
        .setColor('#FFBB00')
        .addFields(
          { name: '베테랑 던전', value: `- ${getVeteran().tomorrow}` }
          , {
            name: '탈틴',
            value: `- ${tomorrowMission.Taillteann.Normal}\n* (PC방) ${tomorrowMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${tomorrowMission.Tara.Normal}\n* (PC방) ${tomorrowMission.Tara.VIP}`
          }
        )
        .setTimestamp()

      const generalChannel = interaction.client.channels.cache.get(generalChannelId)
      /*
      const replyContent = { content: `오늘의 미션을 <#${generalChannel.id}>에 작성했어~` }
      if (interaction.channelId === generalChannel.id) {
        replyContent.ephemeral = true
      }
      interaction.reply(replyContent)
      */

      generalChannel.send(
        {
          content: '오미를 안내 해줄게~ 그럼 오늘도 화이팅!🤩',
          embeds: [todayEmbed, tomorrowEmbed]
        }
      )
      await interaction.editReply(`오미를 <#${generalChannelId}>에 안내했어~`)
    } catch (error) {
      await interaction.editReply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '오미 에러' + error)
    }
  }
}
