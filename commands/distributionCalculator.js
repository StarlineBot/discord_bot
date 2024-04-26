const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('분배계산기')
    .setDescription('분배할 금액 총액과 인원수를 입력하면 각 얼마를 분배하면 되는지 알려줄게!')
    .addIntegerOption((option) =>
      option.setName('total_price').setDescription(
        '득템 판매후 총 금액을 입력해줘!').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('headcount').setDescription('분배할 인원수를 알려줘!').setRequired(
        true)
        .setMinValue(1).setMaxValue(10)
    ),
  run: async ({ interaction }) => {
    const totalPrice = interaction.options.get('total_price').value
    const headcount = interaction.options.get('headcount').value

    const embed = new EmbedBuilder()
      .setTitle('분배할 금액은~?')
      .setColor(0x0099ff)
      .addFields(
        { name: '1명당 분배금', value: `${Math.floor(totalPrice / headcount)}숲` }
        , { name: '입력한 총금액', value: `${totalPrice}숲` }
        , { name: '입력한 인원수', value: `${headcount}명` }
      )
    interaction.reply(
      { content: '계산된 금액을 알려줄게~ 소수점은 버렸으니 분배자 수고비로 하자~', embeds: [embed] })
  }
}
