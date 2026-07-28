const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { arcanas, combinations } = require('../modules/ogham.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('오검')
    .setDescription('아르카나를 선택하면 오검 조합을 이미지와 함께 보여줄게~')
    .addStringOption(option =>
      option.setName('아르카나').setDescription('아르카나를 골라줘~').setRequired(true)
        .addChoices(...arcanas.map(a => ({ name: a.name, value: String(a.id) })))
    ),
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannel = guildInfo && interaction.client.channels.cache.get(guildInfo.generalChannelId)

    const arcanaId = interaction.options.getString('아르카나')
    const arcana = arcanas.find(a => String(a.id) === arcanaId)
    const combos = combinations[arcanaId] || []

    if (!arcana || combos.length === 0) {
      interaction.reply({ content: '해당 아르카나의 오검 조합을 찾지 못했어 😢', ephemeral: true })
      return
    }
    if (!generalChannel) {
      interaction.reply({ content: '봇 출력 채널을 찾을 수 없어 😢', ephemeral: true })
      return
    }

    const replyContent = { content: `**${arcana.name}** 오검 조합을 <#${generalChannel.id}>에 작성했어~😎` }
    replyContent.ephemeral = true
    interaction.reply(replyContent)

    const embeds = combos.map((combo, idx) => {
      const embed = new EmbedBuilder()
        .setColor(combo.disclosed ? '#8E44AD' : '#95A5A6')
        .setTitle(`${arcana.name} · ${idx + 1}번째 조합`)
        .addFields({
          name: '오검 조합',
          value: combo.words.map(w => `${w.icon} ${w.name}`).join('  ·  ')
        })
      if (arcana.thumbnail) embed.setThumbnail(arcana.thumbnail)
      if (combo.disclosed) {
        embed.addFields({ name: '스킬', value: combo.skill })
        if (combo.image) embed.setImage(combo.image)
      } else {
        embed.addFields({ name: '스킬', value: '미공개' })
      }
      return embed
    })

    generalChannel.send({
      content: `**${arcana.name}** 오검 조합이야~ (공개 ${combos.filter(c => c.disclosed).length} / 미공개 ${combos.filter(c => !c.disclosed).length})`,
      embeds
    })
  }
}
