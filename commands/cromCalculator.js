const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('크롬계산기')
    .setDescription('크롬 암호 계산기야! 숫자 세개를 입력해줘~ 그럼 자동으로 계산해줄게!')
    .addIntegerOption((option) =>
      option.setName('number-1').setDescription('첫번째 숫자를 입력해주세요.').setRequired(
        true)
    )
    .addIntegerOption((option) =>
      option.setName('number-2').setDescription('두번째 숫자를 입력해주세요.').setRequired(
        true)
    )
    .addIntegerOption((option) =>
      option.setName('number-3').setDescription('세번째 숫자를 입력해주세요.').setRequired(
        true)
    ),
  run: ({ interaction }) => {
    const num1 = interaction.options.get('number-1').value
    const num2 = interaction.options.get('number-2').value
    const num3 = interaction.options.get('number-3').value
    // interaction.reply(result);

    const embed = new EmbedBuilder()
      .setTitle(`${num1}, ${num2}, ${num3}로 계산했어~`)
      .setColor(0x0099ff)
      .addFields(
        { name: '++', value: `${(num1 + num2 + num3)}` }
        , { name: '+-', value: `${(num1 + num2 - num3)}` }
        , { name: '-+', value: `${(num1 - num2 + num3)}` }
        , { name: '--', value: `${(num1 - num2 - num3)}` }
        , { name: '**', value: `${(num1 * num2 * num3)}` }
        , { name: '*+', value: `${(num1 * num2 + num3)}` }
        , { name: '*-', value: `${(num1 * num2 - num3)}` }
      )
      .setFooter({ text: '바스, 벨테인, 루나사, 삼하인, 임볼릭' })
    interaction.reply({ embeds: [embed] })
  }
}
