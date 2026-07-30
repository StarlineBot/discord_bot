const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const favStore = require('../modules/auctionFavorites')
const { koreanGold, favoriteCategories, getCategoryItems, filterItems, resolveLeafCategories } = require('../modules/auction')
const { buildEquipEmbed, buildEchostoneEmbed } = require('../modules/auctionEmbeds')
const searchOptions = require('../modules/auctionSearchOptions.json')

const METALWARE_SLOTS = 3
const metalwareNames = (searchOptions.metalwareOptionNames || []).map(o => o.label).filter(n => n && n.length <= 100)
// 즐겨찾기 카테고리 후보: 경매장 명령어가 쓰는 대분류만
const majorCategories = favoriteCategories()

const metalOptName = (i) => (i === 0 ? '세공' : `세공${i + 1}`)
const metalLvName = (i) => (i === 0 ? '세공레벨' : `세공레벨${i + 1}`)

// "22억5000만", "5000만", "3억", "1,000,000" 등 → 원 단위 숫자
function parseGold (raw) {
  if (raw == null) return null
  const s = String(raw).replace(/[\s,]/g, '')
  if (!s) return null
  const eok = s.match(/(\d+)억/)
  const man = s.match(/(\d+)만/)
  if (eok || man) {
    let total = 0
    if (eok) total += Number(eok[1]) * 1e8
    if (man) total += Number(man[1]) * 1e4
    const rest = s.replace(/\d+억/, '').replace(/\d+만/, '')
    if (/^\d+$/.test(rest)) total += Number(rest)
    return total
  }
  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

function readMetalwares (interaction) {
  const metalwares = []
  for (let i = 0; i < METALWARE_SLOTS; i++) {
    const name = interaction.options.getString(metalOptName(i))
    if (name) metalwares.push({ name, minLevel: interaction.options.getInteger(metalLvName(i)) || 1 })
  }
  return metalwares
}

function favSummary (f) {
  const parts = [`\`${f.category}\``]
  if (f.keyword) parts.push(`키워드 '${f.keyword}'`)
  if (f.maxPrice) parts.push(`최대 ${koreanGold(f.maxPrice)}G`)
  for (const mw of f.metalwares || []) parts.push(`세공 '${mw.name}' ${mw.minLevel}레벨+`)
  return parts.join(' · ')
}

// 등록 즉시 1회 조회: 카나리 → 대분류를 소분류로 펼쳐 조회 → 필터 → 신규만(중복방지 seen 기록)
async function runFavoriteNow (fav) {
  let canary
  try { canary = await getCategoryItems('허브') } catch (e) { return { maintenance: true } }
  if (!canary.length) return { maintenance: true }
  let items = []
  for (const leaf of resolveLeafCategories(fav.category)) {
    items = items.concat(await getCategoryItems(leaf))
  }
  let matches = filterItems(items, { keyword: fav.keyword, metalwares: fav.metalwares || [] })
  if (fav.maxPrice) matches = matches.filter(it => it.auction_price_per_unit <= fav.maxPrice)
  const data = favStore.read()
  const fresh = favStore.pickNewMatches(data, fav.id, matches)
  favStore.write(data)
  return { fresh }
}

const data = new SlashCommandBuilder()
  .setName('경매장즐겨찾기')
  .setDescription('경매장 매물을 즐겨찾기로 등록하면 새 매물이 뜰 때 DM으로 알려줘~ (5분 주기)')

data.addSubcommand(sub => {
  sub.setName('등록').setDescription('즐겨찾기를 추가해~ (인당 최대 5개)')
  sub.addStringOption(o => o.setName('이름').setDescription('즐겨찾기 별칭 (예: 마공파볼트지팡이)').setRequired(true))
  sub.addStringOption(o => o.setName('카테고리').setDescription('감시할 대분류 (자동완성: 근거리/마법/액세서리/에코스톤 등)').setRequired(true).setAutocomplete(true))
  sub.addStringOption(o => o.setName('키워드').setDescription('아이템 이름에 포함될 단어 (예: 소울)'))
  sub.addStringOption(o => o.setName('최대가격').setDescription('이 금액 이하만 알림 (예: 5억, 3000만)'))
  for (let i = 0; i < METALWARE_SLOTS; i++) {
    sub.addStringOption(o => o.setName(metalOptName(i)).setDescription(`세공 옵션명 ${i + 1} (자동완성)`).setAutocomplete(true))
    sub.addIntegerOption(o => o.setName(metalLvName(i)).setDescription(`세공 ${i + 1} 최소 레벨 (예: 21)`).setMinValue(1))
  }
  return sub
})

data.addSubcommand(sub =>
  sub.setName('목록').setDescription('내 즐겨찾기 목록을 봐~'))

data.addSubcommand(sub => {
  sub.setName('삭제').setDescription('즐겨찾기를 삭제해~')
  sub.addStringOption(o => o.setName('이름').setDescription('삭제할 즐겨찾기 (자동완성)').setRequired(true).setAutocomplete(true))
  return sub
})

module.exports = {
  data,
  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true)
    const q = focused.value || ''
    let pool = []
    if (/^세공\d?$/.test(focused.name)) {
      pool = metalwareNames
    } else if (focused.name === '카테고리') {
      pool = majorCategories
    } else if (focused.name === '이름' && interaction.options.getSubcommand() === '삭제') {
      pool = favStore.listByUser(interaction.member.guild.id, interaction.user.id).map(f => f.label)
    } else {
      return
    }
    const hits = (q ? pool.filter(n => n.includes(q)) : pool).slice(0, 25)
    await interaction.respond(hits.map(n => ({ name: n, value: n })))
  },
  run: async ({ interaction }) => {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.member.guild.id
    const userId = interaction.user.id

    if (sub === '등록') {
      const category = interaction.options.getString('카테고리')
      if (!majorCategories.includes(category)) {
        await interaction.reply({ content: `'${category}' 는 등록 가능한 카테고리가 아니야~ 자동완성에서 골라줘`, ephemeral: true })
        return
      }
      const maxRaw = interaction.options.getString('최대가격')
      const maxPrice = parseGold(maxRaw)
      if (maxRaw && maxPrice == null) {
        await interaction.reply({ content: `최대가격 '${maxRaw}' 을 못 알아듣겠어~ 예: 5억, 3000만, 5000000000`, ephemeral: true })
        return
      }
      const fav = {
        guildId,
        userId,
        label: interaction.options.getString('이름'),
        category,
        keyword: interaction.options.getString('키워드') || null,
        maxPrice: maxPrice || null,
        metalwares: readMetalwares(interaction)
      }
      const res = favStore.add(fav)
      if (!res.ok) {
        await interaction.reply({ content: `❌ ${res.error}`, ephemeral: true })
        return
      }
      // 등록 응답은 그대로(등록 확인만) — 즉시 뜨게 defer 없이 바로 reply
      const embed = new EmbedBuilder()
        .setTitle(`⭐ 즐겨찾기 등록: ${res.fav.label}`)
        .setColor('#F4B400')
        .setDescription(favSummary(res.fav))
        .setFooter({ text: '새 매물이 뜨면 DM으로 알려줄게~ (5분 주기 · 데이터 ~10분 지연)' })
      await interaction.reply({ embeds: [embed], ephemeral: true })

      // 등록 즉시 1회 조회는 백그라운드로 → 매물 있으면 개인 DM으로 알림(seen 기록해 배치 중복 방지)
      runFavoriteNow(res.fav).then(chk => {
        if (chk.maintenance || !chk.fresh.length) return
        const build = res.fav.category === '에코스톤' ? buildEchostoneEmbed : buildEquipEmbed
        const dmEmbeds = chk.fresh.slice(0, 5).map(build)
        const header = `🔔 방금 등록한 즐겨찾기 **${res.fav.label}** 조건에 맞는 매물이 지금 ${chk.fresh.length}건 있어!` +
          (chk.fresh.length > 5 ? ' (가격순 5건)' : '') + '\n※ 데이터 ~10분 지연이라 접속하면 이미 팔렸을 수 있어~'
        return interaction.user.send({ content: header, embeds: dmEmbeds }).catch(() =>
          // DM이 막혀있으면 등록 응답에 이어 알려줌
          interaction.followUp({ content: `🔔 즐겨찾기 '${res.fav.label}' 조건에 지금 ${chk.fresh.length}건 있는데 DM이 막혀있어~`, embeds: dmEmbeds, ephemeral: true }).catch(() => {})
        )
      }).catch(err => console.error('[경매장즐겨찾기] 즉시 조회 에러:', err.message))
      return
    }

    if (sub === '목록') {
      const mine = favStore.listByUser(guildId, userId)
      if (!mine.length) {
        await interaction.reply({ content: '아직 등록한 즐겨찾기가 없어~ `/경매장즐겨찾기 등록` 으로 추가해줘', ephemeral: true })
        return
      }
      const embed = new EmbedBuilder()
        .setTitle(`⭐ 내 경매장 즐겨찾기 (${mine.length}/${favStore.MAX_PER_USER})`)
        .setColor('#F4B400')
        .addFields(mine.map(f => ({ name: f.label, value: favSummary(f) })))
      await interaction.reply({ embeds: [embed], ephemeral: true })
      return
    }

    if (sub === '삭제') {
      const label = interaction.options.getString('이름')
      const res = favStore.removeByLabel(guildId, userId, label)
      if (!res.ok) {
        await interaction.reply({ content: `'${label}' 즐겨찾기를 못 찾았어~`, ephemeral: true })
        return
      }
      await interaction.reply({ content: `🗑️ '${label}' 즐겨찾기를 삭제했어~`, ephemeral: true })
    }
  }
}
