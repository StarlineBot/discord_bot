const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('분배계산기')
    .setDescription('분배할 금액 총액과 인원수를 입력하면 각 얼마를 분배하면 되는지 알려줄게!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('단순분배')
        .setDescription('기존과 똑같은 분배방식이야~')
        .addIntegerOption((option) =>
          option.setName('total_price').setDescription(
            '물건 판매후 총 금액을 입력해줘!').setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('headcount').setDescription('분배할 인원수를 알려줘!').setRequired(
            true)
            .setMinValue(1).setMaxValue(10)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('키쩔포함')
        .setDescription('키쩔이 포함되어 개평을 나눠줘~')
        .addIntegerOption((option) =>
          option.setName('total_price').setDescription(
            '물건 판매후 총 금액을 입력해줘!').setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('headcount').setDescription('키쩔 인원을 포함한 총 인원수를 적어줘~').setRequired(
            true)
            .setMinValue(1).setMaxValue(10)
        )
    ),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    console.log(interaction.member.guild.id)

    const writer = {
      name: interaction.member.nickname == null
        ? interaction.member.user.globalName
        : interaction.member.nickname,
      iconURL: interaction.member.user.displayAvatarURL()
    }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const distribution = interaction.options._subcommand

    const totalPrice = interaction.options.get('total_price').value
    const headcount = interaction.options.get('headcount').value

    let embed
    if (distribution === '단순분배') {
      embed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('총 분배할 금액은~')
        .setColor(0x0099ff)
        .addFields(
          { name: '1명당 분배금', value: `${Math.floor(totalPrice / headcount)}숲` }
          , { name: '입력한 총금액', value: `${totalPrice}숲`, inline: true }
          , { name: '입력한 인원수', value: `${headcount}명`, inline: true }
        )
        .setTimestamp()
    }
    if (distribution === '키쩔포함') {
      /*
      판매금 * 0.95 / 인원수 = 분배금
      판매금 - (분배금*인원수) 로 두번계산하면
       */
      const distributeCount = headcount - 1
      const salePrice = Math.floor((totalPrice * 0.95) / distributeCount)
      const comps = Math.ceil(totalPrice - (salePrice * distributeCount))
      embed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('총 분배할 금액은~')
        .setColor(0x0099ff)
        .addFields(
          { name: '1명당 분배금', value: `${salePrice}숲` }
          , { name: '개평', value: `${comps}숲` }
          , { name: '입력한 총금액', value: `${totalPrice}숲`, inline: true }
          , { name: '입력한 인원수', value: `${headcount}명(키쩔포함)`, inline: true }
        )
        .setTimestamp()
    }

    const generalChannel = interaction.client.channels.cache.get(
      generalChannelId)
    const replyContent = { content: `입력한 내용은 <#${generalChannel.id}>에 계산 해 놨어~` }
    if (interaction.channelId === generalChannel.id) {
      replyContent.ephemeral = true
    }
    interaction.reply(replyContent)

    generalChannel.send(
      { content: '계산된 금액을 알려줄게~ 소수점은 버렸으니 분배자 수고비로 하자~', embeds: [embed] })
  }
}
