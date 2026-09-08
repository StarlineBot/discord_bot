const { SlashCommandBuilder } = require('discord.js')
const battle = require('../modules/battle')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('듀얼')
    .setDescription('캐릭터를 골라 랜덤 상대와 턴제 듀얼! ⚔️'),
  run: async ({ interaction }) => {
    // 공개 메시지(남들도 구경) → 버튼은 소유자만 조작(핸들러에서 가드)
    await interaction.reply({ embeds: [battle.buildSelectEmbed()], components: battle.buildSelectRows(interaction.user.id) })
  }
}
