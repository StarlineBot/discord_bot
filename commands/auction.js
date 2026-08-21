const { SlashCommandBuilder } = require('discord.js')
const { getCategoryItems, filterItems, filterEchostones, filterEnchants } = require('../modules/auction')
const { resolveGeneralChannel } = require('../modules/generalChannel')
const { startLoading } = require('../modules/loading')
const categoryData = require('../modules/auctionCategories.json')
const searchOptions = require('../modules/auctionSearchOptions.json')

const devChannelId = require('../modules/getGuildInfo').getMonitorChannelId()
const basicErrorMessage = '경매장 조회 중 문제가 생겼어 😢'
const MAX_EMBEDS = 10
const METALWARE_SLOTS = 3
const INNATE_STATS = ['체력', '지력', '솜씨', '의지', '행운', '민첩', '공격력', '마법 공격력', '방어', '보호']

const metalwareNames = (searchOptions.metalwareOptionNames || []).map(o => o.label).filter(n => n && n.length <= 100)

const getCat = (name) => categoryData.categories.find(c => c.name === name)
// 무기류 대분류(액세서리·에코스톤 제외 / 특수는 에코스톤 소분류 제외)
// 특수 대분류는 세공 검색 대상만(악기·생활 도구)로 제한
const SPECIAL_ALLOWED_SUBS = ['악기', '생활 도구']
const weaponCategories = categoryData.categories.filter(c => c.use && c.name !== '액세서리').map(c => ({
  key: c.name.replace(' 장비', '').replace(/\s+/g, ''),
  label: c.name,
  subs: c.name === '특수 장비'
    ? c.subCategories.filter(s => SPECIAL_ALLOWED_SUBS.includes(s))
    : c.subCategories.filter(s => s !== '에코스톤')
}))
const accessorySubs = (getCat('액세서리') || {}).subCategories || []

const metalOptName = (i) => (i === 0 ? '세공' : `세공${i + 1}`)
const metalLvName = (i) => (i === 0 ? '세공레벨' : `세공레벨${i + 1}`)
const addMetalwareOptions = (sub) => {
  sub.addStringOption(o => o.setName('키워드').setDescription('아이템 이름에 포함될 단어 (예: 소울)'))
  for (let i = 0; i < METALWARE_SLOTS; i++) {
    sub.addStringOption(o => o.setName(metalOptName(i)).setDescription(`세공 옵션명 ${i + 1} (자동완성)`).setAutocomplete(true))
    sub.addIntegerOption(o => o.setName(metalLvName(i)).setDescription(`세공 ${i + 1} 최소 레벨 (예: 21)`).setMinValue(1))
  }
  return sub
}

const data = new SlashCommandBuilder()
  .setName('경매장')
  .setDescription('넥슨 경매장 API로 매물을 조회해~ (데이터는 실제보다 ~10분 지연)')

// 장비: 그룹 안에 무기 대분류별 서브커맨드(소분류 선택)
data.addSubcommandGroup(group => {
  group.setName('장비').setDescription('무기·방어구 등 장비 매물 조회')
  for (const cat of weaponCategories) {
    group.addSubcommand(sub => {
      sub.setName(cat.key).setDescription(`${cat.label} 매물을 조회해~`)
      sub.addStringOption(o => o.setName('소분류').setDescription('세부 카테고리를 골라줘').setRequired(true)
        .addChoices(...cat.subs.map(s => ({ name: s, value: s }))))
      return addMetalwareOptions(sub)
    })
  }
  return group
})

// 액세서리: 카테고리 선택 없이 액세서리 전체 조회
data.addSubcommand(sub => {
  sub.setName('액세서리').setDescription('액세서리 매물을 조회해~ (카테고리 선택 없음)')
  return addMetalwareOptions(sub)
})

// 에코스톤: 등급/고유/각성 전용 필터
data.addSubcommand(sub => {
  sub.setName('에코스톤').setDescription('에코스톤을 등급·고유·각성 능력으로 조회해~')
  sub.addStringOption(o => o.setName('키워드').setDescription('이름 포함 단어 (예: 옐로)'))
  sub.addIntegerOption(o => o.setName('등급').setDescription('최소 등급 (최대 30)').setMinValue(1).setMaxValue(30))
  sub.addStringOption(o => o.setName('고유능력').setDescription('고유 능력 스탯').addChoices(...INNATE_STATS.map(s => ({ name: s, value: s }))))
  sub.addIntegerOption(o => o.setName('고유수치').setDescription('고유 능력 최소 수치 (예: 90)').setMinValue(1))
  sub.addStringOption(o => o.setName('각성능력').setDescription('각성 능력명 (자동완성)').setAutocomplete(true))
  sub.addIntegerOption(o => o.setName('각성레벨').setDescription('각성 능력 최소 레벨 (예: 15)').setMinValue(1))
  return sub
})

// 인챈트: 이름 입력 + 접두/접미 선택(미선택 시 둘 다)
data.addSubcommand(sub => {
  sub.setName('인챈트').setDescription('인챈트 스크롤을 이름·접두/접미로 조회해~')
  sub.addStringOption(o => o.setName('이름').setDescription('인챈트 이름 (예: 기억의, 편린)').setRequired(true))
  sub.addStringOption(o => o.setName('종류').setDescription('접두/접미 (선택 안 하면 둘 다)')
    .addChoices({ name: '접두', value: '접두' }, { name: '접미', value: '접미' }))
  return sub
})

const { buildEquipEmbed, buildEchostoneEmbed, buildEnchantEmbed } = require('../modules/auctionEmbeds')

async function post (interaction, header, embeds) {
  const botChannel = resolveGeneralChannel(interaction)
  const who = (interaction.member && interaction.member.displayName) || interaction.user.username
  const body = `${header}\n-# 🔎 요청: ${who}`
  if (!botChannel) { await interaction.editReply(embeds.length ? { content: body, embeds } : body); return }
  if (embeds.length) await botChannel.send({ content: body, embeds })
  else await botChannel.send(body)
  await interaction.editReply(`경매장 조회 결과를 <#${botChannel.id}>에 보냈어~ 😎`)
}

function readMetalwares (interaction) {
  const metalwares = []
  for (let i = 0; i < METALWARE_SLOTS; i++) {
    const name = interaction.options.getString(metalOptName(i))
    if (name) metalwares.push({ name, minLevel: interaction.options.getInteger(metalLvName(i)) })
  }
  return metalwares
}

module.exports = {
  data,
  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true)
    if (!/^세공\d?$/.test(focused.name) && focused.name !== '각성능력') return
    const q = focused.value || ''
    const hits = (q ? metalwareNames.filter(n => n.includes(q)) : metalwareNames).slice(0, 25)
    await interaction.respond(hits.map(n => ({ name: n, value: n })))
  },
  run: async ({ interaction }) => {
    const group = interaction.options.getSubcommandGroup(false)
    const sub = interaction.options.getSubcommand()
    await startLoading(interaction, '🔍 경매장을 뒤지는 중...')
    try {
      if (sub === '에코스톤') {
        const items = await getCategoryItems('에코스톤')
        const opt = (n) => interaction.options.getString(n)
        const optI = (n) => interaction.options.getInteger(n)
        const results = filterEchostones(items, {
          keyword: opt('키워드'),
          minGrade: optI('등급'),
          innateStat: opt('고유능력'),
          minInnateValue: optI('고유수치'),
          awakening: opt('각성능력'),
          minAwakeningLevel: optI('각성레벨')
        })
        const cond = ['에코스톤']
        if (optI('등급')) cond.push(`등급 ${optI('등급')}+`)
        if (opt('고유능력')) cond.push(`고유 ${opt('고유능력')}${optI('고유수치') ? ' ' + optI('고유수치') + '+' : ''}`)
        if (opt('각성능력')) cond.push(`각성 ${opt('각성능력')}${optI('각성레벨') ? ' ' + optI('각성레벨') + '레벨+' : ''}`)
        const header = `🔍 ${cond.join(' · ')}\n전체 ${items.length}건 중 매칭 **${results.length}건**` + (results.length > MAX_EMBEDS ? ` (가격순 ${MAX_EMBEDS}건)` : '')
        await post(interaction, results.length ? header : `${header}\n\n조건에 맞는 매물이 없어~ 😢`, results.slice(0, MAX_EMBEDS).map(buildEchostoneEmbed))
        return
      }

      if (sub === '인챈트') {
        const items = await getCategoryItems('인챈트 스크롤')
        const keyword = interaction.options.getString('이름')
        const affix = interaction.options.getString('종류')
        const results = filterEnchants(items, { keyword, affix })
        const cond = ['인챈트', `'${keyword}'`]
        if (affix) cond.push(affix)
        const header = `🔍 ${cond.join(' · ')}\n전체 ${items.length}건 중 매칭 **${results.length}건**` + (results.length > MAX_EMBEDS ? ` (가격순 ${MAX_EMBEDS}건)` : '')
        await post(interaction, results.length ? header : `${header}\n\n조건에 맞는 매물이 없어~ 😢`, results.slice(0, MAX_EMBEDS).map(buildEnchantEmbed))
        return
      }

      // 조회 대상 카테고리 결정: 장비 그룹=선택 소분류 / 액세서리=액세서리 4종 전체
      let categories
      let condHead
      if (group === '장비') {
        categories = [interaction.options.getString('소분류')]
        condHead = `카테고리 ${categories[0]}`
      } else { // 액세서리
        categories = accessorySubs
        condHead = '액세서리 전체'
      }
      const keyword = interaction.options.getString('키워드')
      const metalwares = readMetalwares(interaction)

      let items = []
      for (const c of categories) items = items.concat(await getCategoryItems(c))
      const results = filterItems(items, { keyword, metalwares })

      const cond = [condHead]
      if (keyword) cond.push(`키워드 '${keyword}'`)
      for (const mw of metalwares) cond.push(`세공 '${mw.name}'${mw.minLevel ? ` ${mw.minLevel}레벨+` : ''}`)
      const header = `🔍 ${cond.join(' · ')}\n전체 ${items.length}건 중 매칭 **${results.length}건**` + (results.length > MAX_EMBEDS ? ` (가격순 ${MAX_EMBEDS}건)` : '')
      await post(interaction, results.length ? header : `${header}\n\n조건에 맞는 매물이 없어~ 😢`, results.slice(0, MAX_EMBEDS).map(buildEquipEmbed))
    } catch (error) {
      console.error('경매장 조회 에러:', error && error.message)
      await interaction.editReply(basicErrorMessage)
      const dev = interaction.client.channels.cache.get(devChannelId)
      if (dev) dev.send('경매장 에러: ' + ((error && error.message) || error))
    }
  }
}
