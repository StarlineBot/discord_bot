const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const { resolveGeneralChannel } = require('../modules/generalChannel')
const { getCategoryItems, koreanGold } = require('../modules/auction')
const { groupBySkill, rollGroup, appraise, grade, pickRandom } = require('../modules/muriasRelic')

const THUMB_PATH = './static/img/murias-relic.png'
const devChannelId = require('../modules/getGuildInfo').getMonitorChannelId()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('유물깡')
    .setDescription('무리아스의 유물(이데아)을 복원해 랜덤 유물·옵션을 굴리고 손익까지 계산해~ (재미로만!)'),
  run: async ({ interaction }) => {
    const generalChannel = resolveGeneralChannel(interaction)
    if (!generalChannel) {
      interaction.reply({ content: '봇 출력 채널을 찾을 수 없어 😢', ephemeral: true })
      return
    }
    await interaction.deferReply({ ephemeral: true })
    try {
      // 유물 카테고리 한 번 조회로 유물 매물 + 이데아 시세 둘 다 확보
      const items = await getCategoryItems('유물')
      const relicItems = items.filter(it => it.item_display_name === '무리아스의 유물')
      const ideaItems = items.filter(it => it.item_display_name === '무리아스의 유물(이데아)')
      const groups = groupBySkill(relicItems)
      if (!groups.length) {
        await interaction.editReply('지금 경매장에 무리아스의 유물 매물이 없어서 굴릴 수가 없어 😢')
        return
      }

      const group = pickRandom(groups) // 30종 중 랜덤 유물·스킬
      const roll = rollGroup(group) // Lv.1~10 수치 랜덤
      const { price, premium } = appraise(group, roll.value)
      const ideaCost = ideaItems.length ? Math.min(...ideaItems.map(i => i.auction_price_per_unit)) : null

      const lines = []
      lines.push(`**${roll.display}**`)
      lines.push('')
      lines.push(`🎲 등급 **Lv.${roll.level}/10** · ${grade(roll.level)}`)
      lines.push(`🏷️ 뽑은 유물 시세 ≈ **${koreanGold(price)}**${premium ? ' (시장 최상급 🔥)' : ''}`)
      if (ideaCost != null) {
        lines.push(`💠 이데아 원가 ≈ **${koreanGold(ideaCost)}**`)
        lines.push('━━━━━━━━━━━━')
        const diff = price - ideaCost
        lines.push(diff >= 0 ? `📈 **+${koreanGold(diff)}** 이득!` : `📉 **-${koreanGold(-diff)}** 적자...`)
      }

      const roller = interaction.member.nickname ?? interaction.member.user.globalName ?? interaction.user.username
      const embed = new EmbedBuilder()
        .setTitle(`🏺 무리아스의 유물 복원 · ${roll.job}`)
        .setColor(premium ? '#F1C40F' : '#8E44AD')
        .setDescription(lines.join('\n'))
        .setFooter({ text: `굴린 사람: ${roller} · 시세는 실시간 경매장 최저가 기준(~10분 지연)` })
        .setTimestamp()

      const files = []
      if (fs.existsSync(THUMB_PATH)) {
        embed.setThumbnail('attachment://murias-relic.png')
        files.push({ attachment: THUMB_PATH, name: 'murias-relic.png' })
      }

      await interaction.editReply(`유물깡 결과를 <#${generalChannel.id}>에 만들었어~🎲`)
      generalChannel.send({ embeds: [embed], files })
    } catch (error) {
      console.error('유물깡 에러:', error && error.message)
      await interaction.editReply('유물깡 도중 문제가 생겼어 😢 (경매장 API 지연일 수 있어)')
      const dev = interaction.client.channels.cache.get(devChannelId)
      if (dev) dev.send('유물깡 에러: ' + ((error && error.message) || error))
    }
  }
}
