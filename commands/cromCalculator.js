const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')

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
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const num1 = interaction.options.get('number-1').value
    const num2 = interaction.options.get('number-2').value
    const num3 = interaction.options.get('number-3').value
    // interaction.reply(result);

    const embed = new EmbedBuilder()
      .setAuthor(writer)
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
      .setTimestamp()
      .setFooter({ text: '바스, 벨테인, 루나사, 삼하인, 임볼릭' })

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    const replyContent = { content: `입력한 정보는 <#${generalChannel.id}>에 작성했어~` }
    if (interaction.channelId === generalChannel.id) {
      replyContent.ephemeral = true
    }
    interaction.reply(replyContent)

    generalChannel.send({ embeds: [embed] })
  }
}
