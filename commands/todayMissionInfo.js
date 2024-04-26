const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const devChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
const { todayVeteran, tomorrowVeteran, getTodayMission, getTomorrowMission } = require(
  '../modules/todayMission')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('오미')
    .setDescription('오늘의 미션과 베테랑 던전을 알려줄게!'),
  run: async ({ interaction }) => {
    try {
      const todayMissionObject = await getTodayMission()
      const todayMission = await todayMissionObject.data.missions[0]

      const tomorrowMissionObject = await getTomorrowMission()
      const tomorrowMission = await tomorrowMissionObject.data.missions[0]

      const todayEmbed = new EmbedBuilder()
        .setTitle('오늘의 미션&베테랑')
        .setColor('#86E57F')
        .addFields(
          { name: '베테랑 던전', value: `- ${todayVeteran.dungeon}` }
          , {
            name: '탈틴',
            value: `- ${todayMission.Taillteann.Normal}\n* (PC방) ${todayMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${todayMission.Tara.Normal}\n* (PC방) ${todayMission.Tara.VIP}`
          }
        )

      const tomorrowEmbed = new EmbedBuilder()
        .setTitle('내일의 미션&베테랑')
        .setColor('#FFBB00')
        .addFields(
          { name: '베테랑 던전', value: `- ${tomorrowVeteran.dungeon}` }
          , {
            name: '탈틴',
            value: `- ${tomorrowMission.Taillteann.Normal}\n* (PC방) ${tomorrowMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${tomorrowMission.Tara.Normal}\n* (PC방) ${tomorrowMission.Tara.VIP}`
          }
        )

      interaction.reply({
        content: '오미를 안내 해줄게~ 그럼 오늘도 화이팅!🤩',
        embeds: [todayEmbed, tomorrowEmbed]
      })
    } catch (error) {
      interaction.reply(basicErrorMessage)
      interaction.client.channels.cache.get(devChannelId).send(
        '오미 에러' + error)
    }
  }
}
