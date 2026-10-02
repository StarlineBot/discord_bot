const { getItemsByName } = require('./auction')

// 경매장 수수료: 기본 5%, 멤버십 4%.
const FEE_RATE_BASE = 0.05
const FEE_RATE_MEMBERSHIP = 0.04

// 수수료 할인 쿠폰(경매장 '기타 > 기타'). 할인율 = 수수료를 그만큼 깎음. 조회는 아이템명으로.
const COUPONS = [
  { pct: 0, label: '쿠폰 없음', name: null },
  { pct: 0.10, label: '10% 할인', name: '경매장 수수료 10% 할인 쿠폰' },
  { pct: 0.20, label: '20% 할인', name: '경매장 수수료 20% 할인 쿠폰' },
  { pct: 0.30, label: '30% 할인', name: '경매장 수수료 30% 할인 쿠폰' },
  { pct: 0.50, label: '50% 할인', name: '경매장 수수료 50% 할인 쿠폰' },
  { pct: 1.00, label: '100% 할인', name: '경매장 수수료 100% 할인 쿠폰' }
]

// 쿠폰 현재가는 자주 안 변하고 경매 데이터도 ~10분 지연이라, 5분 메모리 캐시로 API 부하 절감.
const CACHE_TTL = 5 * 60 * 1000
let cache = { at: 0, prices: null }

// 각 쿠폰의 현재 '최저 단가'를 아이템명으로 조회. 없으면 null.
async function fetchCouponPrices () {
  if (cache.prices && Date.now() - cache.at < CACHE_TTL) return cache.prices
  const prices = {}
  await Promise.all(COUPONS.filter(c => c.name).map(async (c) => {
    try {
      const items = await getItemsByName(c.name)
      const matches = items.filter(it => it.item_display_name === c.name)
      prices[c.name] = matches.length ? Math.min(...matches.map(it => it.auction_price_per_unit)) : null
    } catch (e) {
      prices[c.name] = null
    }
  }))
  cache = { at: Date.now(), prices }
  return prices
}

// 쿠폰별 1인당 분배금 계산 + 최적 쿠폰 선정.
//  수수료 = 판매가 × 세율, 할인후수수료 = 수수료 × (1-할인율)
//  1인당 = (판매가 - 할인후수수료 - 쿠폰값 - 기타비용) / 인원
//  최적 = 1인당이 가장 큰 쿠폰(= 할인후수수료+쿠폰값이 최소)
function calcDistribution ({ salePrice, headcount, membership, etc = 0, couponPrices }) {
  const feeBase = Math.round(salePrice * (membership ? FEE_RATE_MEMBERSHIP : FEE_RATE_BASE))
  const rows = COUPONS.map(c => {
    const feeAfter = Math.round(feeBase * (1 - c.pct))
    const couponPrice = c.name ? couponPrices[c.name] : 0
    const available = c.name ? (couponPrice !== null && couponPrice !== undefined) : true
    const totalCost = available ? feeAfter + (couponPrice || 0) + etc : null
    const perPerson = available ? Math.floor((salePrice - totalCost) / headcount) : null
    return { ...c, feeAfter, couponPrice, available, totalCost, perPerson }
  })
  const avail = rows.filter(r => r.available && r.perPerson !== null)
  const best = avail.length ? avail.reduce((a, b) => (b.perPerson > a.perPerson ? b : a)) : null
  return { feeBase, rows, best }
}

module.exports = { FEE_RATE_BASE, FEE_RATE_MEMBERSHIP, COUPONS, fetchCouponPrices, calcDistribution }
