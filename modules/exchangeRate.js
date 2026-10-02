const { getItemsByName } = require('./auction')

// 지역별 교환 재료: 던전 구슬 N개 → 재료 1개. 효율 = 경매장 개당가 ÷ 구슬수(= 구슬당 골드).
// coin = 재료 1개 교환에 드는 구슬 수(고정 게임 데이터). 경매장 개당가는 live 조회.
const REGIONS = {
  탈라가흐: [
    { name: '끈적이게 엉긴 식물 덩어리', coin: 3 },
    { name: '빛바랜 에너지 회로', coin: 35 },
    { name: '고리아스 동력원', coin: 200 },
    { name: '순도 높은 힐웬 강판 조각', coin: 6 },
    { name: '희미하게 빛나는 명주실', coin: 3 },
    { name: '순도 높은 실리엔 섬유 다발', coin: 6 },
    { name: '달아오른 광두정', coin: 3 },
    { name: '순도 높은 힐웬 주괴 조각', coin: 6 }
  ],
  브리레흐: [
    { name: '브리 레흐의 코어', coin: 100 },
    { name: '브리 레흐의 정수', coin: 100 },
    { name: '녹음이 깃든 마법사의 보석', coin: 1 },
    { name: '텅 빈 마력석', coin: 3 },
    { name: '깨어난 힘의 정수', coin: 5 },
    { name: '순백의 가죽 조각', coin: 1 },
    { name: '녹음이 감도는 칼날 조각', coin: 1 },
    { name: '순백의 깃털', coin: 1 },
    { name: '초록빛 기억의 조각', coin: 25 },
    { name: '오묘한 마력석', coin: 3 },
    { name: '주황빛 기억의 조각', coin: 25 },
    { name: '오묘한 가죽 조각', coin: 3 },
    { name: '단단한 늑대의 이빨', coin: 1 },
    { name: '금빛 기억의 조각', coin: 25 },
    { name: '순도 높은 마력의 결정', coin: 3 },
    { name: '녹음이 감도는 나무 장작', coin: 1 },
    { name: '단단한 힐웬 광석 조각', coin: 1 },
    { name: '무른 금속 파편', coin: 3 },
    { name: '녹음이 감도는 광석 조각', coin: 1 },
    { name: '빛바랜 자수실', coin: 3 },
    { name: '브리 레흐의 기운이 깃든 문장', coin: 3 },
    { name: '투명한 연금술 결정', coin: 1 },
    { name: '마력석', coin: 1 },
    { name: '아라고나이트', coin: 3 },
    { name: '오피먼트', coin: 3 },
    { name: '오묘한 금속 조각', coin: 3 },
    { name: '바리사이트', coin: 3 },
    { name: '무딘 칼날 조각', coin: 3 },
    { name: '녹음이 감도는 금속 조각', coin: 1 }
  ],
  글렌베르나: [
    { name: '결정화된 겨울의 잔해', coin: 35 },
    { name: '잘려 나간 겨울의 꿈 결정', coin: 200 },
    { name: '얼어붙은 백철 조각', coin: 6 },
    { name: '얼어붙은 직물 조각', coin: 6 },
    { name: '얼어붙은 판금 조각', coin: 6 }
  ],
  크롬바스: [
    { name: '아다만티움', coin: 200 },
    { name: '글라스 기브넨의 심장', coin: 200 },
    { name: '손상된 글라스 기브넨의 깃털', coin: 200 }
  ]
}

// 경매 데이터는 ~10분 지연이라 지역별 10분 메모리 캐시.
const CACHE_TTL = 10 * 60 * 1000
const cache = {}

// 재료 1개의 현재 경매장 최저 개당가(없으면 null)
async function minUnitPrice (name) {
  const items = await getItemsByName(name)
  const matches = items.filter(it => it.item_display_name === name)
  return matches.length ? Math.min(...matches.map(it => it.auction_price_per_unit)) : null
}

// 한 지역의 재료별 효율(구슬당 골드) 계산 + 효율 내림차순 정렬
async function calcRegion (region) {
  const mats = REGIONS[region]
  if (!mats) return null
  if (cache[region] && Date.now() - cache[region].at < CACHE_TTL) return cache[region].rows

  const rows = await Promise.all(mats.map(async (m) => {
    let perUnit = null
    try { perUnit = await minUnitPrice(m.name) } catch (e) { perUnit = null }
    const efficiency = perUnit != null ? Math.floor(perUnit / m.coin) : null
    return { name: m.name, coin: m.coin, perUnit, efficiency }
  }))
  rows.sort((a, b) => (b.efficiency ?? -1) - (a.efficiency ?? -1))
  cache[region] = { at: Date.now(), rows }
  return rows
}

module.exports = { REGIONS, calcRegion }
