const { SlashCommandBuilder } = require('discord.js')
// const guildModule = require('../modules/getGuildInfo')
const { text } = require('@kokr/text')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('주사위')
    .setDescription('주사위를 굴려~'),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    /*
    console.log(interaction.member.guild.id)

    // const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId
    */

    interaction.reply(':game_die: 주사위를 굴려 ' + text`${Math.floor(Math.random() * 99) + 1}가` + ' 나왔습니다. (1~99)')
  }
}
