const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { resolveGeneralChannel } = require('../modules/generalChannel')
const { koreanGold } = require('../modules/auction')
const { REGIONS, calcRegion } = require('../modules/exchangeRate')

// 지역(던전) 구슬로 재료를 사서 경매장에 팔 때 '구슬당 골드'가 가장 높은 재료를 추천.
const REGION_NAMES = Object.keys(REGIONS)

const build = new SlashCommandBuilder()
  .setName('환전비율계산기')
  .setDescription('던전 구슬로 어떤 재료를 사서 파는 게 이득인지 경매장 시세로 알려줘~')
for (const region of REGION_NAMES) {
  build.addSubcommand(sub =>
    sub.setName(region).setDescription(`${region} 구슬 교환 재료 효율 순위`)
      .addIntegerOption(o => o.setName('보유구슬').setDescription('보유 구슬 수 (넣으면 최적 재료 교환 시 총 골드까지)').setMinValue(1))
  )
}

module.exports = {
  category: '📖 게임정보',
  data: build,
  run: async ({ interaction }) => {
    const writer = {
      name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname,
      iconURL: interaction.member.user.displayAvatarURL()
    }
    const region = interaction.options._subcommand
    const coins = interaction.options.get('보유구슬')?.value ?? null
    const generalChannel = resolveGeneralChannel(interaction)

    // 경매장 조회가 3초를 넘을 수 있으니 먼저 ack 후 조회
    await interaction.reply({ content: `${region} 교환 재료 시세 확인 중... <#${generalChannel.id}>에 올려줄게~`, ephemeral: true })

    let rows
    try {
      rows = await calcRegion(region)
    } catch (e) {
      console.error('환전비율 조회 실패:', e.message)
      await generalChannel.send(`${region} 시세 조회 중 문제가 생겼어 😢 잠시 후 다시 시도해줘.`)
      return
    }

    const best = rows.find(r => r.efficiency != null) || null
    const lines = rows.map(r => {
      const mark = best && r.name === best.name ? '⭐ ' : '• '
      if (r.efficiency == null) return `${mark}**${r.name}** — 매물 없음 (구슬 ${r.coin})`
      return `${mark}**${r.name}** — 구슬당 **${koreanGold(r.efficiency)}** (개당 ${koreanGold(r.perUnit)} / 구슬 ${r.coin})`
    })

    let bestLine = ''
    if (best) {
      bestLine = `\n\n🏆 **추천: ${best.name}** — 구슬당 ${koreanGold(best.efficiency)} (${best.efficiency.toLocaleString()}골드)`
      if (coins) {
        const count = Math.floor(coins / best.coin)
        const total = count * best.perUnit
        const leftover = coins % best.coin
        bestLine += `\n💰 보유 **${coins}구슬** → ${best.name} **${count}개** 교환 ≈ **${koreanGold(total)}** (${total.toLocaleString()}골드)` +
          (leftover ? ` · 구슬 ${leftover} 남음` : '')
      }
    }

    const embed = new EmbedBuilder()
      .setAuthor(writer)
      .setTitle(`🔁 ${region} 환전 효율 (구슬당 골드)`)
      .setColor(0x00b894)
      .setDescription(lines.join('\n') + bestLine)
      .setFooter({ text: '경매장 데이터는 실제보다 ~10분 지연 · 시세 10분 캐시 · 개당 최저가 기준' })
      .setTimestamp()

    await generalChannel.send({ embeds: [embed] })
  }
}
