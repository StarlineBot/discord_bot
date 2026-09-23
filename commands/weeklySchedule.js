const { SlashCommandBuilder } = require('discord.js')
const ws = require('../modules/weeklySchedule')

// 이 명령을 실행한 '채널'에 주간일정 보드를 만든다(채널=일정의 정체성).
// 한 채널당 보드 1개. 목요일 시작 주간, 파티원이 각자 가능시간을 버튼으로 입력.
module.exports = {
  data: new SlashCommandBuilder()
    .setName('주간일정')
    .setDescription('이 채널에 파티 주간일정 보드를 만들어 (목~수, 각자 가능시간 입력)')
    .addStringOption(o =>
      o.setName('제목').setDescription('일정 제목 (생략하면 채널 이름 사용)').setRequired(false))
    .addUserOption(o => o.setName('멤버1').setDescription('파티원 (미입력자 표시용)').setRequired(false))
    .addUserOption(o => o.setName('멤버2').setDescription('파티원').setRequired(false))
    .addUserOption(o => o.setName('멤버3').setDescription('파티원').setRequired(false))
    .addUserOption(o => o.setName('멤버4').setDescription('파티원').setRequired(false))
    .addUserOption(o => o.setName('멤버5').setDescription('파티원').setRequired(false))
    .addUserOption(o => o.setName('멤버6').setDescription('파티원').setRequired(false)),

  run: async ({ interaction }) => {
    const channel = interaction.channel
    const channelId = channel.id

    const title = interaction.options.getString('제목') || channel.name
    const members = []
    for (let i = 1; i <= 6; i++) {
      const u = interaction.options.getUser(`멤버${i}`)
      if (u && !u.bot && !members.includes(u.id)) members.push(u.id)
    }

    const patch = { guildId: interaction.member.guild.id, title }
    // 멤버를 하나라도 지정했을 때만 로스터 갱신(재실행 시 실수로 비우지 않게)
    if (members.length) patch.members = members
    ws.upsertBoard(channelId, patch)

    await ws.renderBoard(channel, channelId)
    await interaction.reply({ content: `📅 **${title}** 주간일정 보드를 이 채널에 올렸어~ 파티원들이 버튼으로 가능시간을 입력하면 돼!`, ephemeral: true })
  }
}
