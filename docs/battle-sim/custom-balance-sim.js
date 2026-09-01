// 커스텀 캐릭 밸런스 시뮬 (실엔진 직결).
// 커스텀 = 공통 스킬 풀(modules/battle.js의 CUSTOM_DEFS) 중 2개 선택 + 자유 스탯배분.
// 설계 규칙(검증됨): 스탯 상한 85, 예산 ~320. → 정상 빌드 46~51%, 크리몰빵 40~43%, 순수탱 37%.
// 사용: node docs/battle-sim/custom-balance-sim.js [예산] [반복수]
const battle = require('../../modules/battle')
const { NAMES, AIS, CHARS, SKILLS, CUSTOM_DEFS } = battle

const BUDGET = parseInt(process.argv[2] || '320', 10)
const RUNS = parseInt(process.argv[3] || '400', 10)
const CAP = 85 // 커스텀 스탯 상한 (90 보정·100 시그 차단)
const STATS = ['힘', '지능', '체력', '민첩', '솜씨', '행운']
function pick (a) { return a[Math.floor(Math.random() * a.length)] }
function sum (s) { return STATS.reduce((a, k) => a + (s[k] || 0), 0) }
function legal (s) { return STATS.every(k => (s[k] || 0) <= CAP) && sum(s) <= BUDGET }
function setSkills (a, b) { SKILLS['커스텀'] = [CUSTOM_DEFS[a](0), CUSTOM_DEFS[b](1)] }
function winrate () {
  let w = 0; let g = 0
  for (const opp of NAMES) {
    for (let i = 0; i < RUNS; i++) {
      const r = battle.runBattle('커스텀', opp, pick(AIS), pick(AIS)); g++; if (r.winner === 'me') w++
      const r2 = battle.runBattle(opp, '커스텀', pick(AIS), pick(AIS)); g++; if (r2.winner === 'opp') w++
    }
  }
  return w / g * 100
}
// 대표 빌드 (예산에 맞춰 행운으로 잔여 채움)
const fill = (base) => { const s = { ...base }; s.행운 = (s.행운 || 0) + Math.max(0, BUDGET - sum(s)); return s }
const builds = {
  '균형': fill({ 힘: 75, 체력: 80, 민첩: 70, 솜씨: 60 }),
  '마딜': fill({ 지능: 85, 체력: 80, 민첩: 70, 솜씨: 75 }),
  '크리몰빵': fill({ 힘: 75, 체력: 75, 민첩: 85, 솜씨: 80 }),
  '순수탱': fill({ 힘: 60, 체력: 85, 민첩: 55, 솜씨: 60, 행운: 40 })
}
const pairs = [['강타', '연격'], ['재정비', '속박'], ['강타', '철벽']]
console.log(`커스텀 밸런스: 예산 ${BUDGET}, 상한 ${CAP}, RUNS ${RUNS} (커스텀 vs 프리셋9, 양방향)`)
for (const [bn, st] of Object.entries(builds)) {
  CHARS['커스텀'] = { emoji: '🧩', id: '커스텀', 힘: 0, 지능: 0, 체력: 0, 민첩: 0, 솜씨: 0, 행운: 0, ...st }
  const ok = legal(CHARS['커스텀']) ? '' : ' [규칙위반!]'
  const row = pairs.map(([a, b]) => { setSkills(a, b); return `${a}+${b}:${winrate().toFixed(0)}` })
  console.log(`  ${bn.padEnd(5)} 합${sum(CHARS['커스텀'])}${ok}  ${row.join('  ')}`)
}
