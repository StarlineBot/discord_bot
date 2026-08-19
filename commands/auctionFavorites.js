const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const favStore = require('../modules/auctionFavorites')
const { koreanGold, favoriteCategories, getCategoryItems, resolveLeafCategories, matchFavorite } = require('../modules/auction')
const { embedFor } = require('../modules/auctionEmbeds')
const searchOptions = require('../modules/auctionSearchOptions.json')

const METALWARE_SLOTS = 3
const metalwareNames = (searchOptions.metalwareOptionNames || []).map(o => o.label).filter(n => n && n.length <= 100)
// 즐겨찾기 카테고리 후보: 경매장 명령어가 쓰는 대분류만
const majorCategories = favoriteCategories()
// 에코스톤 고유 능력 스탯(= /경매장 에코스톤과 동일)
const INNATE_STATS = ['체력', '지력', '솜씨', '의지', '행운', '민첩', '공격력', '마법 공격력', '방어', '보호']

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
  if (f.affix) parts.push(f.affix)
  if (f.keyword) parts.push(`키워드 '${f.keyword}'`)
  if (f.minGrade) parts.push(`등급 ${f.minGrade}+`)
  if (f.innateStat) parts.push(`고유 ${f.innateStat}${f.minInnateValue ? ` ${f.minInnateValue}+` : ''}`)
  if (f.awakening) parts.push(`각성 ${f.awakening}${f.minAwakeningLevel ? ` ${f.minAwakeningLevel}레벨+` : ''}`)
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
  const matches = matchFavorite(items, fav)
  const data = favStore.read()
  const fresh = favStore.pickNewMatches(data, fav.id, matches)
  favStore.write(data)
  return { fresh }
}

// 최대가격 파싱(입력이 이상하면 안내 후 error). 반환: { maxPrice } 또는 { error: true }
async function readMaxPrice (interaction) {
  const maxRaw = interaction.options.getString('최대가격')
  const maxPrice = parseGold(maxRaw)
  if (maxRaw && maxPrice == null) {
    await interaction.reply({ content: `최대가격 '${maxRaw}' 을 못 알아듣겠어~ 예: 5억, 3000만, 5000000000`, ephemeral: true })
    return { error: true }
  }
  return { maxPrice: maxPrice || null }
}

// 알림 저장 + 등록 확인 응답 + 백그라운드 즉시 조회(등록/인챈트 공통)
async function registerFav (interaction, fav) {
  const res = favStore.add(fav)
  if (!res.ok) {
    await interaction.reply({ content: `❌ ${res.error}`, ephemeral: true })
    return
  }
  const embed = new EmbedBuilder()
    .setTitle(`⭐ 알림 등록: ${res.fav.label}`)
    .setColor('#F4B400')
    .setDescription(favSummary(res.fav))
    .setFooter({ text: '새 매물이 뜨면 DM으로 알려줄게~ (5분 주기 · 데이터 ~10분 지연)' })
  await interaction.reply({ embeds: [embed], ephemeral: true })

  // 등록 즉시 1회 조회는 백그라운드로 → 매물 있으면 개인 DM으로 알림(seen 기록해 배치 중복 방지)
  runFavoriteNow(res.fav).then(chk => {
    if (chk.maintenance || !chk.fresh.length) return
    const build = embedFor(res.fav.category)
    const dmEmbeds = chk.fresh.slice(0, 5).map(build)
    const header = `🔔 방금 등록한 알림 **${res.fav.label}** 조건에 맞는 매물이 지금 ${chk.fresh.length}건 있어!` +
      (chk.fresh.length > 5 ? ' (가격순 5건)' : '') + '\n※ 데이터 ~10분 지연이라 접속하면 이미 팔렸을 수 있어~'
    return interaction.user.send({ content: header, embeds: dmEmbeds }).catch(() =>
      interaction.followUp({ content: `🔔 알림 '${res.fav.label}' 조건에 지금 ${chk.fresh.length}건 있는데 DM이 막혀있어~`, embeds: dmEmbeds, ephemeral: true }).catch(() => {})
    )
  }).catch(err => console.error('[경매장알림] 즉시 조회 에러:', err.message))
}

const data = new SlashCommandBuilder()
  .setName('경매장알림')
  .setDescription('경매장 매물을 알림 등록하면 새 매물이 뜰 때 DM으로 알려줘~ (5분 주기)')

data.addSubcommand(sub => {
  sub.setName('등록').setDescription('알림을 추가해~ (인당 최대 5개)')
  sub.addStringOption(o => o.setName('이름').setDescription('알림 별칭 (예: 마공파볼트지팡이)').setRequired(true))
  sub.addStringOption(o => o.setName('카테고리').setDescription('감시할 대분류 (자동완성: 근거리/마법/액세서리/에코스톤 등)').setRequired(true).setAutocomplete(true))
  sub.addStringOption(o => o.setName('키워드').setDescription('검색할 상품 이름에 포함된 단어 (예: 소울, 기억의)'))
  sub.addStringOption(o => o.setName('최대가격').setDescription('이 금액 이하만 알림 (예: 5억, 3000만)'))
  for (let i = 0; i < METALWARE_SLOTS; i++) {
    sub.addStringOption(o => o.setName(metalOptName(i)).setDescription(`세공 옵션명 ${i + 1} (자동완성)`).setAutocomplete(true))
    sub.addIntegerOption(o => o.setName(metalLvName(i)).setDescription(`세공 ${i + 1} 최소 레벨 (예: 21)`).setMinValue(1))
  }
  return sub
})

// 인챈트 전용 등록: 옵션은 키워드 + 접두/접미 + 최대가격만
data.addSubcommand(sub => {
  sub.setName('인챈트').setDescription('인챈트 스크롤 알림을 추가해~ (인당 최대 5개)')
  sub.addStringOption(o => o.setName('이름').setDescription('알림 별칭 (예: 접두기억의)').setRequired(true))
  sub.addStringOption(o => o.setName('키워드').setDescription('인챈트 이름 (예: 기억의, 투르나이)').setRequired(true))
  sub.addStringOption(o => o.setName('종류').setDescription('접두/접미 (선택 안 하면 둘 다)')
    .addChoices({ name: '접두', value: '접두' }, { name: '접미', value: '접미' }))
  sub.addStringOption(o => o.setName('최대가격').setDescription('이 금액 이하만 알림 (예: 5억, 3000만)'))
  return sub
})

// 에코스톤 전용 등록: /경매장 에코스톤과 동일한 등급·고유·각성 조건
data.addSubcommand(sub => {
  sub.setName('에코스톤').setDescription('에코스톤 알림을 등급·고유·각성 조건으로 추가해~ (인당 최대 5개)')
  sub.addStringOption(o => o.setName('이름').setDescription('알림 별칭 (예: 옐로에코)').setRequired(true))
  sub.addStringOption(o => o.setName('키워드').setDescription('이름 포함 단어 (예: 옐로)'))
  sub.addIntegerOption(o => o.setName('등급').setDescription('최소 등급 (최대 30)').setMinValue(1).setMaxValue(30))
  sub.addStringOption(o => o.setName('고유능력').setDescription('고유 능력 스탯').addChoices(...INNATE_STATS.map(s => ({ name: s, value: s }))))
  sub.addIntegerOption(o => o.setName('고유수치').setDescription('고유 능력 최소 수치 (예: 90)').setMinValue(1))
  sub.addStringOption(o => o.setName('각성능력').setDescription('각성 능력명 (자동완성)').setAutocomplete(true))
  sub.addIntegerOption(o => o.setName('각성레벨').setDescription('각성 능력 최소 레벨 (예: 15)').setMinValue(1))
  sub.addStringOption(o => o.setName('최대가격').setDescription('이 금액 이하만 알림 (예: 5억, 3000만)'))
  return sub
})

data.addSubcommand(sub =>
  sub.setName('목록').setDescription('내 알림 목록을 봐~'))

data.addSubcommand(sub => {
  sub.setName('삭제').setDescription('알림을 삭제해~')
  sub.addStringOption(o => o.setName('이름').setDescription('삭제할 알림 (자동완성)').setRequired(true).setAutocomplete(true))
  return sub
})

module.exports = {
  data,
  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true)
    const q = focused.value || ''
    let pool = []
    if (/^세공\d?$/.test(focused.name) || focused.name === '각성능력') {
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
        await interaction.reply({ content: `'${category}' 는 등록 가능한 카테고리가 아니야~ 자동완성에서 골라줘 (인챈트는 \`/경매장알림 인챈트\`)`, ephemeral: true })
        return
      }
      const mp = await readMaxPrice(interaction)
      if (mp.error) return
      await registerFav(interaction, {
        guildId,
        userId,
        label: interaction.options.getString('이름'),
        category,
        keyword: interaction.options.getString('키워드') || null,
        maxPrice: mp.maxPrice,
        metalwares: readMetalwares(interaction)
      })
      return
    }

    if (sub === '인챈트') {
      const mp = await readMaxPrice(interaction)
      if (mp.error) return
      await registerFav(interaction, {
        guildId,
        userId,
        label: interaction.options.getString('이름'),
        category: '인챈트',
        keyword: interaction.options.getString('키워드'),
        affix: interaction.options.getString('종류') || null, // 접두/접미
        maxPrice: mp.maxPrice
      })
      return
    }

    if (sub === '에코스톤') {
      const mp = await readMaxPrice(interaction)
      if (mp.error) return
      const optS = (n) => interaction.options.getString(n)
      const optI = (n) => interaction.options.getInteger(n)
      await registerFav(interaction, {
        guildId,
        userId,
        label: optS('이름'),
        category: '에코스톤',
        keyword: optS('키워드') || null,
        minGrade: optI('등급') || null,
        innateStat: optS('고유능력') || null,
        minInnateValue: optI('고유수치') || null,
        awakening: optS('각성능력') || null,
        minAwakeningLevel: optI('각성레벨') || null,
        maxPrice: mp.maxPrice
      })
      return
    }

    if (sub === '목록') {
      const mine = favStore.listByUser(guildId, userId)
      if (!mine.length) {
        await interaction.reply({ content: '아직 등록한 알림이 없어~ `/경매장알림 등록` 으로 추가해줘', ephemeral: true })
        return
      }
      const embed = new EmbedBuilder()
        .setTitle(`⭐ 내 경매장 알림 (${mine.length}/${favStore.MAX_PER_USER})`)
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
      await interaction.reply({ content: `🗑️ '${label}' 알림을 삭제했어~`, ephemeral: true })
    }
  }
}
