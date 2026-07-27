const axios = require('axios')

const mainUrl = 'https://open.api.nexon.com'
const nexonApiKey = process.env.NEXON_API_KEY

// 세공 옵션 파싱: "옵션명(N레벨:X 증가)" → { name, level, raw }
const metalwarePattern = /^(.*?)\((\d+)레벨/

function parseMetalwares (item) {
  return (item.item_option || [])
    .filter(o => o.option_type === '세공 옵션')
    .map(o => {
      const m = metalwarePattern.exec(o.option_value || '')
      return m ? { name: m[1].trim(), level: Number(m[2]), raw: o.option_value } : null
    })
    .filter(Boolean)
}

// 특정 세공 옵션의 레벨(없으면 -1)
function metalwareLevel (item, metalwareName) {
  const hit = parseMetalwares(item).find(mw => mw.name === metalwareName)
  return hit ? hit.level : -1
}

// 카테고리 전체 매물 수집(next_cursor 끝까지). list는 category 필터가 정상 동작함.
async function getCategoryItems (category) {
  let cursor = null
  const all = []
  do {
    const params = { auction_item_category: category }
    if (cursor) params.cursor = cursor
    const res = await axios.get(mainUrl + '/mabinogi/v1/auction/list', {
      params,
      headers: { 'x-nxopen-api-key': nexonApiKey }
    })
    all.push(...(res.data.auction_item || []))
    cursor = res.data.next_cursor
  } while (cursor)
  return all
}

// 키워드 + 세공 여러 개(AND) 필터. metalwares: [{ name, minLevel }]
function filterItems (items, { keyword, metalwares = [] } = {}) {
  let result = items
  if (keyword) result = result.filter(it => it.item_display_name.includes(keyword))
  for (const mw of metalwares) {
    if (!mw || !mw.name) continue
    result = result.filter(it => metalwareLevel(it, mw.name) >= (mw.minLevel || 1))
  }
  return result.sort((a, b) => a.auction_price_per_unit - b.auction_price_per_unit)
}

// 금액 한글 표기: 2,250,000,000 → "22억 5,000만" (1만 미만은 생략, 그 이하 소액은 원값)
function koreanGold (n) {
  if (n < 10000) return n.toLocaleString('ko-KR')
  const eok = Math.floor(n / 100000000)
  const man = Math.floor((n % 100000000) / 10000)
  let s = ''
  if (eok) s += `${eok.toLocaleString('ko-KR')}억`
  if (man) s += `${s ? ' ' : ''}${man.toLocaleString('ko-KR')}만`
  return s || n.toLocaleString('ko-KR')
}

// ── 에코스톤 전용 파싱/필터 ──
// 각성 능력 값 예: "크래시 샷 파편 대미지 18 레벨 \n(63.00 )" → { name, level }
const awakenPattern = /^([\s\S]*?)\s+(\d+)\s*레벨/
function parseEchostone (item) {
  const opts = item.item_option || []
  const grade = opts.find(o => o.option_type === '에코스톤 등급')
  const innate = opts.find(o => o.option_type === '에코스톤 고유 능력')
  const awakeRaw = opts.find(o => o.option_type === '에코스톤 각성 능력')
  let awake = null
  if (awakeRaw) {
    const m = awakenPattern.exec(awakeRaw.option_value || '')
    if (m) awake = { name: m[1].trim(), level: Number(m[2]), raw: (awakeRaw.option_value || '').replace(/\s+/g, ' ').trim() }
  }
  return {
    grade: grade ? Number(grade.option_value) : null,
    innate: innate ? { stat: innate.option_sub_type, value: Number(innate.option_value) } : null,
    awake
  }
}

function filterEchostones (items, { keyword, awakening, minAwakeningLevel, innateStat, minInnateValue, minGrade } = {}) {
  let r = items
  if (keyword) r = r.filter(it => it.item_display_name.includes(keyword))
  if (awakening) r = r.filter(it => { const e = parseEchostone(it); return e.awake && e.awake.name.includes(awakening) && e.awake.level >= (minAwakeningLevel || 1) })
  if (innateStat) r = r.filter(it => { const e = parseEchostone(it); return e.innate && e.innate.stat.includes(innateStat) && e.innate.value >= (minInnateValue || 0) })
  if (minGrade) r = r.filter(it => { const e = parseEchostone(it); return (e.grade || 0) >= minGrade })
  return r.sort((a, b) => a.auction_price_per_unit - b.auction_price_per_unit)
}

module.exports = { getCategoryItems, filterItems, parseMetalwares, metalwareLevel, koreanGold, parseEchostone, filterEchostones }
