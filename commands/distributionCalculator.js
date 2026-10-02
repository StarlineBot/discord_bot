const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { resolveGeneralChannel } = require('../modules/generalChannel')
const { koreanGold } = require('../modules/auction')
const { fetchCouponPrices, calcDistribution } = require('../modules/auctionFee')

// 경매장 판매 금액·인원으로 수수료(멤버십 4%/기본 5%)와 할인쿠폰까지 반영해 1인당 분배금 계산.
module.exports = {
  category: '👥 파티',
  data: new SlashCommandBuilder()
    .setName('분배계산기')
    .setDescription('경매장 판매 금액·인원으로 수수료·할인쿠폰까지 반영해 분배금을 계산해줘!')
    .addIntegerOption(option =>
      option.setName('total_price').setDescription('판매 금액 — 천만 단위! (예: 2=2천만, 20=2억)').setRequired(true).setMinValue(1))
    .addIntegerOption(option =>
      option.setName('headcount').setDescription('분배할 인원수를 알려줘!').setRequired(true).setMinValue(1).setMaxValue(10))
    .addBooleanOption(option =>
      option.setName('멤버십').setDescription('기본은 멤버십 4%. 멤버십이 아니면 False로 선택하면 5% 적용')),
  run: async ({ interaction }) => {
    const writer = {
      name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname,
      iconURL: interaction.member.user.displayAvatarURL()
    }
    // 입력은 천만 단위(2 = 2천만, 20 = 2억) → 실제 골드로 환산
    const totalPrice = interaction.options.get('total_price').value * 10000000
    const headcount = interaction.options.get('headcount').value
    const membership = interaction.options.getBoolean('멤버십') ?? true
    const generalChannel = resolveGeneralChannel(interaction)

    // 경매장 조회가 3초를 넘을 수 있으니 먼저 ack(인터랙션 만료 방지) 후 조회
    await interaction.reply({ content: `경매장에서 수수료 쿠폰 가격 확인 중... <#${generalChannel.id}>에 올려줄게~`, ephemeral: true })

    let couponPrices = {}
    try {
      couponPrices = await fetchCouponPrices()
    } catch (e) {
      console.error('수수료 쿠폰 가격 조회 실패:', e.message)
    }

    const { rows, best } = calcDistribution({ salePrice: totalPrice, headcount, membership, couponPrices })

    const lines = rows.map(r => {
      const mark = best && r.label === best.label ? '⭐ ' : '• '
      if (!r.available) return `${mark}**${r.label}** — 쿠폰 가격 조회 안됨`
      const feePart = r.pct === 0
        ? `수수료 ${r.feeAfter.toLocaleString()}`
        : `수수료 ${r.feeAfter.toLocaleString()} + 쿠폰 ${r.couponPrice.toLocaleString()}`
      return `${mark}**${r.label}** — 1인당 **${r.perPerson.toLocaleString()}** (${koreanGold(r.perPerson)}) · ${feePart}`
    })

    const header = `**판매가** ${totalPrice.toLocaleString()} (${koreanGold(totalPrice)}) · **${headcount}명** · **${membership ? '멤버십 4%' : '기본 5%'}**`
    const bestLine = best
      ? `\n\n🏆 **추천: ${best.label}** → 1인당 **${best.perPerson.toLocaleString()}숲** (${koreanGold(best.perPerson)})`
      : ''

    const embed = new EmbedBuilder()
      .setAuthor(writer)
      .setTitle('💰 경매장 수수료 분배 계산')
      .setColor(0xffcc00)
      .setDescription(`${header}\n\n${lines.join('\n')}${bestLine}`)
      .setFooter({ text: '경매장 데이터는 실제보다 ~10분 지연 · 쿠폰가 5분 캐시 · 1인당은 소수점 버림' })
      .setTimestamp()

    await generalChannel.send({ embeds: [embed] })
  }
}
