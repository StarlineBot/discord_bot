const { SlashCommandBuilder } = require('discord.js')
const { getCategoryItems } = require('../modules/auction')
const { buildEmbed, buildRow } = require('../modules/holyWater')
const { startLoading } = require('../modules/loading')

const devChannelId = require('../modules/getGuildInfo').getMonitorChannelId()

// 성수 단가 = 소모품>포션 '무리아스의 성수' 경매장 최저가 (조회 실패 시 null)
async function fetchUnitPrice () {
  const items = await getCategoryItems('포션')
  const prices = items
    .filter(it => it.item_display_name === '무리아스의 성수')
    .map(it => it.auction_price_per_unit)
    .filter(p => p > 0)
  return prices.length ? Math.min(...prices) : null
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('성수깡')
    .setDescription('무리아스의 성수를 발라 옵션을 굴려봐~ 버튼으로 계속! (재미로만!) 💧'),
  run: async ({ interaction }) => {
    await startLoading(interaction, '💧 무리아스의 성수를 준비하는 중...', { ephemeral: false })
    let unit = null
    try {
      unit = await fetchUnitPrice()
    } catch (error) {
      console.error('성수깡 단가 조회 에러:', error && error.message)
      const dev = interaction.client.channels.cache.get(devChannelId)
      if (dev) dev.send('성수깡 단가 조회 에러: ' + ((error && error.message) || error))
    }
    const state = { memberId: interaction.user.id, n: 0, unit }
    // 공개 메시지(남들도 구경) → 버튼은 소유자만 조작(핸들러에서 가드)
    await interaction.editReply({ content: '', embeds: [buildEmbed(state, null)], components: [buildRow(state)] })
  }
}
