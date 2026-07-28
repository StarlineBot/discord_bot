const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const guildModule = require('../modules/getGuildInfo')

const THUMB_PATH = './static/img/brileic-coin.png'

// min~max 정수 랜덤
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
// step 단위로 1~steps 단계 중 랜덤 (예: step 0.15, steps 20 → 0.15~3.00)
const rollStep = (step, steps) => +(step * randInt(1, steps)).toFixed(2)

// 종류별 스탯 롤 정의
const ROLLS = {
  물리: () => [
    { name: '최대 대미지', value: `${randInt(1, 20)}` },
    { name: '크리티컬 대미지', value: `${randInt(1, 10)}%` },
    { name: '아르카나 스킬 보너스 대미지', value: `${rollStep(0.15, 20)}%` }
  ],
  마법: () => [
    { name: '마법 공격력', value: `${randInt(1, 20)}` },
    { name: '크리티컬 대미지', value: `${randInt(1, 10)}%` },
    { name: '아르카나 스킬 보너스 대미지', value: `${rollStep(0.15, 20)}%` }
  ],
  연금: () => [
    { name: '모든 속성 연금술 대미지', value: `${randInt(1, 20)}` },
    { name: '크리티컬 대미지', value: `${randInt(1, 10)}%` },
    { name: '아르카나 스킬 보너스 대미지', value: `${rollStep(0.15, 20)}%` }
  ],
  지원: () => [
    { name: '전장의 서곡, 비바체 공격력', value: `${rollStep(0.1, 10)}%` },
    { name: '음악 버프 지속 시간', value: `${randInt(1, 20)}` },
    { name: '힐링 효과', value: `${randInt(1, 20)}%` }
  ]
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('브리레흐주화깡')
    .setDescription('브리레흐 주화 옵션을 랜덤으로 굴려볼게~')
    .addStringOption(option =>
      option.setName('종류').setDescription('굴릴 종류를 골라줘~').setRequired(true)
        .addChoices(
          { name: '물리', value: '물리' },
          { name: '마법', value: '마법' },
          { name: '연금', value: '연금' },
          { name: '지원', value: '지원' }
        )
    ),
  run: async ({ interaction }) => {
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannel = guildInfo && interaction.client.channels.cache.get(guildInfo.generalChannelId)

    const type = interaction.options.getString('종류')
    const roll = ROLLS[type]
    if (!roll) {
      interaction.reply({ content: '알 수 없는 종류야 😢', ephemeral: true })
      return
    }
    if (!generalChannel) {
      interaction.reply({ content: '봇 출력 채널을 찾을 수 없어 😢', ephemeral: true })
      return
    }

    const replyContent = { content: `**${type}** 주화깡 결과를 <#${generalChannel.id}>에 만들었어~🎲` }
    replyContent.ephemeral = true
    interaction.reply(replyContent)

    const stats = roll()
    const embed = new EmbedBuilder()
      .setTitle(`브리레흐 주화깡 · ${type}`)
      .setColor('#E67E22')
      .addFields(stats.map(s => ({ name: s.name, value: s.value, inline: false })))
      .setFooter({ text: `굴린 사람: ${interaction.member.nickname ?? interaction.member.user.globalName ?? interaction.user.username}` })
      .setTimestamp()

    const files = []
    if (fs.existsSync(THUMB_PATH)) {
      embed.setThumbnail('attachment://brileic-coin.png')
      files.push({ attachment: THUMB_PATH, name: 'brileic-coin.png' })
    }

    generalChannel.send({ embeds: [embed], files })
  }
}
