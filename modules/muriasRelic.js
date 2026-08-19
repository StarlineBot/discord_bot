// 무리아스의 유물 '깡' 시뮬레이터
// 실제 메커니즘: 무리아스의 유물(이데아)을 복원하면 '무리아스의 유물'에
//   스킬 옵션 1개가 랜덤(30종 중 1)으로 붙고, 수치는 Lv.1~10 (= 최대치 × 레벨/10) 랜덤.
// 시세 비교를 위해 경매장 라이브 매물의 옵션을 파싱해 스킬별로 그룹핑한다.

// 스킬 접두사 → 유물(직업) 이름. 아이템엔 스킬 옵션만 있고 직업명이 없어 이걸로 역추적한다.
const JOB_BY_PREFIX = [
  ['파이어 리프 어택', '엘레멘탈 나이트'],
  ['아이스 윈드밀', '엘레멘탈 나이트'],
  ['라이트닝 스매시', '엘레멘탈 나이트'],
  ['구원의 메아리', '세인트 바드'],
  ['정화의 고동', '세인트 바드'],
  ['붕괴의 파동', '세인트 바드'],
  ['익스플로전 런지', '다크 메이지'],
  ['라이트닝 체인', '다크 메이지'],
  ['스노우 스톰', '다크 메이지'],
  ['플레임 버스트', '알케믹 스팅어'],
  ['하이드로 피어스', '알케믹 스팅어'],
  ['트라이 어설트', '알케믹 스팅어'],
  ['희생의 응징', '세이크리드 가드'],
  ['심판의 일격', '세이크리드 가드'],
  ['고결한 서약', '세이크리드 가드'],
  ['임팩트 크러시', '블래스트 랜서'],
  ['오버 드라이브', '블래스트 랜서'],
  ['어나이얼레이션', '블래스트 랜서'],
  ['헤비 아틸러리', '배리어블 거너'],
  ['데바스테이션 캐논', '배리어블 거너'],
  ['페이탈 스코프', '배리어블 거너'],
  ['케미컬 카니발', '포비든 알케미스트'],
  ['스파이럴 이럽션', '포비든 알케미스트'],
  ['서먼 나이트메어', '포비든 알케미스트'],
  ['인터루드 슬래시', '멜로딕 퍼피티어'],
  ['다운비트 악센트', '멜로딕 퍼피티어'],
  ['그랜드 피날레', '멜로딕 퍼피티어'],
  ['익시드 : 체인 블로우', '퓨리 파이터'],
  ['익시드 : 임팩트 다이브', '퓨리 파이터'],
  ['익시드 : 포스 슬램', '퓨리 파이터']
]

function jobOf (skill) {
  const hit = JOB_BY_PREFIX.find(([p]) => skill.startsWith(p))
  return hit ? hit[1] : '무리아스의 유물'
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const fmtNum = (v) => (Number.isInteger(v) ? String(v) : (+v.toFixed(2)).toString())

// 라이브 매물 하나 파싱 → { skillKey, raw, left, value, max, unit, job, price } | null
// option_value 예: "케미컬 카니발 대미지 270% 증가 (최대 300%)"
function parseRelicListing (item) {
  const o = (item.item_option || []).find(x => x.option_type === '무리아스 유물')
  if (!o || !o.option_value) return null
  const raw = o.option_value
  const maxM = raw.match(/\(최대\s*([\d.]+)\s*(%|초)?\s*\)/)
  if (!maxM) return null
  const max = parseFloat(maxM[1])
  const unit = maxM[2] || ''
  const left = raw.split('(최대')[0] // 값이 들어있는 앞부분 (스킬명 + 현재 수치)
  const nums = left.match(/[\d.]+/g)
  const value = nums ? parseFloat(nums[nums.length - 1]) : 0 // 최대 앞 마지막 숫자 = 현재 수치
  const skillKey = raw.replace(/[\d.]+/g, 'N') // 숫자 제거 = 스킬 식별자
  return { skillKey, raw, left, value, max, unit, job: jobOf(raw), price: item.auction_price_per_unit }
}

// 라이브 매물들 → 스킬별 그룹 배열
function groupBySkill (items) {
  const groups = {}
  for (const it of items) {
    const p = parseRelicListing(it)
    if (!p) continue
    if (!groups[p.skillKey]) {
      groups[p.skillKey] = { skillKey: p.skillKey, raw: p.raw, left: p.left, max: p.max, unit: p.unit, job: p.job, listings: [] }
    }
    groups[p.skillKey].listings.push({ value: p.value, price: p.price })
  }
  return Object.values(groups)
}

// 그룹 하나 굴리기: Lv.1~10 → value = max*lv/10, 표시 문자열을 굴린 값으로 재구성
function rollGroup (group) {
  const level = randInt(1, 10)
  const value = +(group.max * level / 10).toFixed(2)
  // left의 '값 자리'(마지막 숫자)를 굴린 값으로 치환해 게임과 동일한 문장 복원
  const nums = [...group.left.matchAll(/[\d.]+/g)]
  let display
  if (nums.length) {
    const last = nums[nums.length - 1]
    const newLeft = group.left.slice(0, last.index) + fmtNum(value) + group.left.slice(last.index + last[0].length)
    display = newLeft + '(최대' + group.raw.split('(최대')[1]
  } else {
    display = group.raw
  }
  return { level, value, display, job: group.job, max: group.max, unit: group.unit }
}

// 시세 평가: 같은 스킬에서 내 롤 이상(value>=) 매물의 최저가. 없으면 시장에 없는 최상급 롤.
function appraise (group, rolledValue) {
  const ge = group.listings.filter(l => l.value >= rolledValue).sort((a, b) => a.price - b.price)
  if (ge.length) return { price: ge[0].price, premium: false }
  const top = group.listings.slice().sort((a, b) => b.price - a.price)[0]
  return { price: top ? top.price : 0, premium: true }
}

// 레벨(1~10)로 등급 판정
function grade (level) {
  if (level >= 10) return '🌈 인생 유물!'
  if (level >= 8) return '✨ 대성공'
  if (level >= 5) return '👍 평타'
  if (level >= 3) return '😐 아쉬움'
  return '💀 망했어요'
}

function pickRandom (arr) {
  return arr[randInt(0, arr.length - 1)]
}

module.exports = { groupBySkill, rollGroup, appraise, grade, pickRandom, jobOf, parseRelicListing }
