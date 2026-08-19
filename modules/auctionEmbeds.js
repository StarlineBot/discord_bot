const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const { koreanGold, parseEchostone, parseEnchant } = require('./auction')

// 경매장 명령어/즐겨찾기 알림이 공유하는 매물 임베드 빌더 (모양 통일)
const SHORT = { 크리티컬: '크리', 방어력: '방어', '마법 방어력': '마방', '마법 보호': '마보' }
const truncate = (s) => (s.length > 1024 ? s.slice(0, 1021) + '…' : s)

function formatExpire (iso) {
  if (!iso) return '-'
  const exp = DateTime.fromISO(iso).setZone('Asia/Seoul')
  const mins = Math.floor(exp.diff(DateTime.now(), 'minutes').minutes)
  let left = '만료됨'
  if (mins > 0) { const h = Math.floor(mins / 60); const m = mins % 60; left = h > 0 ? `${h}시간 ${m}분 뒤` : `${m}분 뒤` }
  return `${exp.toFormat('MM/dd HH:mm')} 만료 (${left})`
}

function baseEmbed (item) {
  return new EmbedBuilder().setTitle(item.item_display_name).setColor('#8E7CC3')
    .setDescription(`💰 **${koreanGold(item.auction_price_per_unit)} G**  ·  수량 ${item.item_count || 1}`)
    .setFooter({ text: `⏳ ${formatExpire(item.date_auction_expire)}` })
}

function buildEquipEmbed (item) {
  const opts = item.item_option || []
  const pick = (t) => opts.find(o => o.option_type === t)
  const embed = baseEmbed(item)
  const basic = []
  const atk = pick('공격'); if (atk) basic.push(`공격 ${atk.option_value}~${atk.option_value2}`)
  const matk = pick('마법 공격력'); if (matk) basic.push(`마법공격 ${matk.option_value}`)
  for (const t of ['크리티컬', '밸런스', '방어력', '보호', '마법 방어력', '마법 보호', '숙련']) { const o = pick(t); if (o) basic.push(`${SHORT[t] || t} ${o.option_value}`) }
  const dur = pick('내구력'); if (dur) basic.push(`내구 ${dur.option_value}/${dur.option_value2}`)
  if (basic.length) embed.addFields({ name: '📊 기본', value: truncate(basic.join(' · ')) })
  const ench = opts.filter(o => o.option_type === '인챈트').map(o => `**${o.option_sub_type}** ${o.option_value}${o.option_desc ? `\n┗ ${o.option_desc}` : ''}`).join('\n')
  if (ench) embed.addFields({ name: '✨ 인챈트', value: truncate(ench) })
  const reinf = []
  const g = pick('일반 개조'); if (g) reinf.push(`일반 ${g.option_value}/${g.option_value2}`)
  const j = pick('보석 개조'); if (j) reinf.push(`보석 ${j.option_value}`)
  const sp = pick('특별 개조'); if (sp) reinf.push(`특별(${sp.option_sub_type}) ${sp.option_value}`)
  const er = pick('에르그'); if (er) reinf.push(`에르그(${er.option_sub_type}) ${er.option_value}/${er.option_value2}`)
  const pr = pick('피어싱 레벨'); if (pr) reinf.push(`피어싱 ${pr.option_value}`)
  if (reinf.length) embed.addFields({ name: '⚒️ 강화·에르그', value: truncate(reinf.join(' · ')) })
  const metal = opts.filter(o => o.option_type === '세공 옵션').map(o => `🔹 ${o.option_value}`).join('\n')
  if (metal) embed.addFields({ name: '🔧 세공', value: truncate(metal) })
  return embed
}

function buildEchostoneEmbed (item) {
  const e = parseEchostone(item)
  const embed = baseEmbed(item)
  if (e.grade != null) embed.addFields({ name: '🏅 등급', value: `${e.grade}`, inline: true })
  if (e.innate) embed.addFields({ name: '💠 고유 능력', value: `${e.innate.stat} ${e.innate.value}`, inline: true })
  if (e.awake) embed.addFields({ name: '🌟 각성 능력', value: e.awake.raw })
  return embed
}

function buildEnchantEmbed (item) {
  const e = parseEnchant(item) || {}
  const embed = baseEmbed(item)
  const meta = []
  if (e.affix) meta.push(e.affix) // 접두/접미
  if (e.rank) meta.push(`랭크 ${e.rank}`)
  if (meta.length) embed.addFields({ name: '✨ 인챈트', value: meta.join(' · '), inline: true })
  if (e.durability) embed.addFields({ name: '🛡️ 내구도', value: `${e.durability}`, inline: true })
  return embed
}

// 카테고리별 임베드 빌더 선택
function embedFor (category) {
  if (category === '에코스톤') return buildEchostoneEmbed
  if (category === '인챈트') return buildEnchantEmbed
  return buildEquipEmbed
}

module.exports = { buildEquipEmbed, buildEchostoneEmbed, buildEnchantEmbed, embedFor, formatExpire }
