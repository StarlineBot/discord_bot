const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { computeSaju, interpret, WUXING_EMOJI } = require('../modules/saju')

// "19901010" 우선, "1990-10-10"/"1990.10.10"/"1990/10/10"도 허용 → {y,m,d}
function parseBirth (raw) {
  const s = String(raw).trim()
  let m = s.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (!m) m = s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/)
  if (!m) return null
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3])
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return { y, m: mo, d }
}

function pillarField (name, p, shishen) {
  if (!p) return { name, value: '모름\n(시각 미입력)', inline: true }
  const wx = `${WUXING_EMOJI[p.ganWx]}${p.ganWx}·${WUXING_EMOJI[p.zhiWx]}${p.zhiWx}`
  return { name, value: `**${p.korean}**\n(${p.hanja})\n${wx}\n${shishen || '— 일간(나)'}`, inline: true }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('사주팔자')
    .setDescription('생년월일시로 사주팔자·오행·십신·대운을 뽑아줄게~ (재미로만!)')
    .addStringOption(o => o.setName('생년월일').setDescription('숫자만! 예: 19901010 (양력 기본)').setRequired(true))
    .addIntegerOption(o => o.setName('태어난시').setDescription('0~23시 (모르면 비워둬 → 시주 제외)').setMinValue(0).setMaxValue(23))
    .addStringOption(o => o.setName('음양력').setDescription('기본 양력').addChoices({ name: '양력', value: 'solar' }, { name: '음력', value: 'lunar' }))
    .addStringOption(o => o.setName('성별').setDescription('대운(10년 운흐름) 계산에 필요해~').addChoices({ name: '남', value: '1' }, { name: '여', value: '0' })),
  run: async ({ interaction }) => {
    const birth = parseBirth(interaction.options.getString('생년월일'))
    if (!birth) {
      await interaction.reply({ content: '생년월일은 숫자 8자리로 입력해줘~ 예: `19901010`', ephemeral: true })
      return
    }
    const hour = interaction.options.getInteger('태어난시')
    const calendar = interaction.options.getString('음양력') || 'solar'
    const genderRaw = interaction.options.getString('성별')
    const gender = genderRaw == null ? null : Number(genderRaw)

    try {
      const saju = computeSaju({ year: birth.y, month: birth.m, day: birth.d, hour, calendar, gender })
      const p = saju.pillars
      const c = saju.counts
      const wxLine = ['목', '화', '토', '금', '수'].map(w => `${WUXING_EMOJI[w]}${w} ${c[w]}`).join(' · ')
      const calLabel = calendar === 'lunar' ? '음력' : '양력'
      const timeLabel = saju.hasTime ? `${hour}시` : '시간모름'

      const embed = new EmbedBuilder()
        .setTitle(`🀄 사주팔자 · ${saju.animal}띠`)
        .setColor('#8D6E63')
        .setDescription(
          `${calLabel} ${birth.y}.${birth.m}.${birth.d} ${timeLabel}\n` +
          `일간(나): **${saju.dayMaster}(${saju.dayMasterWx} ${WUXING_EMOJI[saju.dayMasterWx]})**\n` +
          `납음(일주): **${saju.dayNaYin}** · 별자리: **${saju.xingZuo}** · 공망: ${saju.kongMang}`
        )
        .addFields(
          pillarField('년주(年)', p.year, saju.shiShen.year),
          pillarField('월주(月)', p.month, saju.shiShen.month),
          pillarField('일주(日)', p.day, null),
          pillarField('시주(時)', p.time, saju.shiShen.time),
          { name: '오행 분포', value: wxLine },
          { name: '풀이', value: interpret(saju) }
        )

      if (saju.daYun && saju.daYun.length) {
        const line = saju.daYun.slice(0, 6).map(d => `${d.start}~${d.end}세 **${d.gz}** · ${d.sipsin}(${d.theme})`).join('\n')
        embed.addFields({ name: '🔄 대운 (10년마다 바뀌는 인생 흐름)', value: line })
      } else {
        embed.addFields({ name: '🔄 대운', value: '성별을 선택하면 10년 단위 운흐름도 보여줄게~' })
      }

      embed.setFooter({ text: '만세력 계산 기반 · 재미로만 봐주세요~' })
      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error('사주 계산 에러:', error && error.message)
      await interaction.reply({ content: '사주 계산 중 문제가 생겼어 😢 날짜를 다시 확인해줘~', ephemeral: true })
    }
  }
}
