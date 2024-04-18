const {SlashCommandBuilder} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('분배계산기')
  .setDescription('분배할 금액 총액과 인원수를 입력하면 각 얼마를 분배하면 되는지 알려줄게!')
  .addIntegerOption((option) =>
      option.setName("total_price").setDescription("득템 판매후 총 금액을 입력해줘!").setRequired(true)
  )
  .addIntegerOption((option) =>
      option.setName("headcount").setDescription("분배할 인원수를 알려줘!").setRequired(true)
      .setMinValue(1).setMaxValue(10)
  )
  , run: async ({interaction}) => {
    const totalPrice = interaction.options.get("total_price").value;
    const headcount = interaction.options.get("headcount").value;
    interaction.reply(`계산결과를 알려줄게!\n\n각 1명당 분배금 : ${Math.floor(totalPrice / headcount)}숲, 총금액 : ${totalPrice}숲, 인원수 : ${headcount}명`);
  }
}