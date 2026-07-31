const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const { buildDailyFortune, starBar } = require('../modules/fortune')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('운세')
    .setDescription('오늘의 운세를 봐줄게~ (하루 한 번 고정, 재미로만!)'),
  run: async ({ interaction }) => {
    const today = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    const dateStr = today.toFormat('yyyy-MM-dd')
    const f = buildDailyFortune(interaction.user.id, dateStr)

    const embed = new EmbedBuilder()
      .setTitle(`🔮 오늘의 운세 · ${today.toFormat('MM월 dd일 (ccc)')}`)
      .setColor('#B39DDB')
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
      .addFields(
        { name: `총운 ${starBar(f.total.star)}`, value: f.total.msg },
        { name: `❤️ 애정운 ${starBar(f.love.star)}`, value: f.love.msg },
        { name: `💰 금전운 ${starBar(f.money.star)}`, value: f.money.msg },
        { name: `💼 일·학업운 ${starBar(f.work.star)}`, value: f.work.msg },
        { name: '🍀 행운', value: `숫자 **${f.luckyNumber}** · 색 **${f.luckyColor}** · 방위 **${f.luckyDirection}**` }
      )
      .setFooter({ text: `💬 ${f.advice}  ·  재미로만 봐주세요~` })

    await interaction.reply({ embeds: [embed] })
  }
}
