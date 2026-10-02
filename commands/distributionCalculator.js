const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { resolveGeneralChannel } = require('../modules/generalChannel')
const { koreanGold } = require('../modules/auction')
const { fetchCouponPrices, calcDistribution } = require('../modules/auctionFee')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('분배계산기')
    .setDescription('분배할 금액 총액과 인원수를 입력하면 각 얼마를 분배하면 되는지 알려줄게!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('단순분배')
        .setDescription('총금액을 인원수로 그냥 나눠줘~ (수수료 계산 없음)')
        .addIntegerOption(option =>
          option.setName('total_price').setDescription('물건 판매후 총 금액을 입력해줘!').setRequired(true))
        .addIntegerOption(option =>
          option.setName('headcount').setDescription('분배할 인원수를 알려줘!').setRequired(true).setMinValue(1).setMaxValue(10))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('수수료분배')
        .setDescription('경매장 수수료·할인쿠폰을 반영해 어떤 쿠폰이 이득인지까지 알려줘~')
        .addIntegerOption(option =>
          option.setName('total_price').setDescription('경매장 판매 금액(수수료 전)을 입력해줘!').setRequired(true))
        .addIntegerOption(option =>
          option.setName('headcount').setDescription('분배할 인원수를 알려줘!').setRequired(true).setMinValue(1).setMaxValue(10))
        .addBooleanOption(option =>
          option.setName('멤버십').setDescription('멤버십이면 수수료 4%, 아니면 기본 5% (기본값: 미적용 5%)'))
        .addIntegerOption(option =>
          option.setName('기타비용').setDescription('성수 제작비 등 추가로 뺄 비용(숲). 생략 시 0').setMinValue(0))
    ),
  run: async ({ interaction }) => {
    const writer = {
      name: interaction.member.nickname == null
        ? interaction.member.user.globalName
        : interaction.member.nickname,
      iconURL: interaction.member.user.displayAvatarURL()
    }

    const sub = interaction.options._subcommand
    const totalPrice = interaction.options.get('total_price').value
    const headcount = interaction.options.get('headcount').value
    const generalChannel = resolveGeneralChannel(interaction)

    if (sub === '단순분배') {
      const embed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('총 분배할 금액은~')
        .setColor(0x0099ff)
        .addFields(
          { name: '1명당 분배금', value: `${Math.floor(totalPrice / headcount).toLocaleString()}숲` },
          { name: '입력한 총금액', value: `${totalPrice.toLocaleString()}숲`, inline: true },
          { name: '입력한 인원수', value: `${headcount}명`, inline: true }
        )
        .setTimestamp()
      await interaction.reply({ content: `입력한 내용은 <#${generalChannel.id}>에 계산 해 놨어~`, ephemeral: true })
      await generalChannel.send({ content: '계산된 금액을 알려줄게~ 소수점은 버렸으니 분배자 수고비로 하자~', embeds: [embed] })
      return
    }

    if (sub === '수수료분배') {
      const membership = interaction.options.getBoolean('멤버십') ?? false
      const etc = interaction.options.get('기타비용')?.value ?? 0

      // 경매장 조회가 3초를 넘을 수 있으니 먼저 ack(인터랙션 만료 방지) 후 조회
      await interaction.reply({ content: `경매장에서 수수료 쿠폰 가격 확인 중... <#${generalChannel.id}>에 올려줄게~`, ephemeral: true })

      let couponPrices = {}
      let fetchFailed = false
      try {
        couponPrices = await fetchCouponPrices()
      } catch (e) {
        fetchFailed = true
        console.error('수수료 쿠폰 가격 조회 실패:', e.message)
      }

      const { rows, best } = calcDistribution({ salePrice: totalPrice, headcount, membership, etc, couponPrices })

      const lines = rows.map(r => {
        const mark = best && r.label === best.label ? '⭐ ' : '• '
        if (!r.available) return `${mark}**${r.label}** — 쿠폰 가격 조회 안됨`
        const feePart = r.pct === 0
          ? `수수료 ${r.feeAfter.toLocaleString()}`
          : `수수료 ${r.feeAfter.toLocaleString()} + 쿠폰 ${r.couponPrice.toLocaleString()}`
        const etcPart = etc ? ` + 기타 ${etc.toLocaleString()}` : ''
        return `${mark}**${r.label}** — 1인당 **${r.perPerson.toLocaleString()}** (${koreanGold(r.perPerson)}) · ${feePart}${etcPart}`
      })

      const header = `**판매가** ${totalPrice.toLocaleString()} (${koreanGold(totalPrice)}) · **${headcount}명** · **${membership ? '멤버십 4%' : '기본 5%'}**` +
        (etc ? ` · 기타비용 ${etc.toLocaleString()}` : '')
      const bestLine = best
        ? `\n\n🏆 **추천: ${best.label}** → 1인당 **${best.perPerson.toLocaleString()}숲** (${koreanGold(best.perPerson)})`
        : ''
      const failNote = fetchFailed ? '\n\n⚠️ 쿠폰 가격 조회에 실패해서 쿠폰 없음 기준만 정확해. 잠시 후 다시 시도해줘.' : ''

      const embed = new EmbedBuilder()
        .setAuthor(writer)
        .setTitle('💰 경매장 수수료 분배 계산')
        .setColor(0xffcc00)
        .setDescription(`${header}\n\n${lines.join('\n')}${bestLine}${failNote}`)
        .setFooter({ text: '경매장 데이터는 실제보다 ~10분 지연 · 쿠폰가 5분 캐시 · 1인당은 소수점 버림' })
        .setTimestamp()

      await generalChannel.send({ embeds: [embed] })
    }
  }
}
