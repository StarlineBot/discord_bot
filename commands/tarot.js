const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const tarot = require('../modules/tarot')

const POS_EMOJI = { 과거: '🕰️', 현재: '✨', 미래: '🔮' }
const POS_COLOR = { 과거: '#8E7CC3', 현재: '#F4B400', 미래: '#4A90D9' }

const data = new SlashCommandBuilder()
  .setName('타로점')
  .setDescription('카드를 셔플해서 과거·현재·미래 3장을 뽑아 봐줄게~ 🔮')

data.addIntegerOption(o =>
  o.setName('셔플횟수')
    .setDescription('덱을 몇 번 섞을까? (많이 섞을수록 정성! 1~1000, 기본 7)')
    .setMinValue(1)
    .setMaxValue(1000))

data.addStringOption(o =>
  o.setName('질문')
    .setDescription('마음속 질문을 적어봐~ (선택)'))

module.exports = {
  data,
  run: async ({ interaction }) => {
    const shuffle = interaction.options.getInteger('셔플횟수') || 7
    const question = interaction.options.getString('질문')

    const reading = tarot.draw(shuffle)

    const embeds = reading.map(r => {
      const dir = r.reversed ? '역방향 🔄' : '정방향'
      return new EmbedBuilder()
        .setColor(POS_COLOR[r.position])
        .setAuthor({ name: `${POS_EMOJI[r.position]} ${r.position}` })
        .setTitle(`${r.card.name} (${dir})`)
        .setDescription(`*${r.card.arcana} 아르카나*\n\n${r.prose}`)
        .setImage(r.imageUrl)
    })

    const header =
      `🔮 **${interaction.user.displayName}** 님의 타로점` +
      (question ? `\n> ${question}` : '') +
      `\n🃏 덱을 **${shuffle}번** 섞어서 세 장을 뽑았어~`

    await interaction.reply({ content: header, embeds })
  }
}
