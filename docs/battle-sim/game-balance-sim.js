// modules/battle.js(실게임 엔진)에 직접 붙는 밸런스 시뮬.
// 초기 설계용 battle-sim-latest.js와 달리 이건 소스오브트루스와 동기화됨.
// 사용: node docs/battle-sim/game-balance-sim.js [반복수]
const battle = require('../../modules/battle')
const { NAMES, AIS } = battle

const RUNS = parseInt(process.argv[2] || '400', 10) // 매치업 조합당 반복수

function pick (arr) { return arr[Math.floor(Math.random() * arr.length)] }

const wins = {}; const games = {}
NAMES.forEach(n => { wins[n] = 0; games[n] = 0 })

for (const a of NAMES) {
  for (const b of NAMES) {
    if (a === b) continue
    for (let i = 0; i < RUNS; i++) {
      const r = battle.runBattle(a, b, pick(AIS), pick(AIS))
      games[a]++; games[b]++
      if (r.winner === 'me') wins[a]++
      else if (r.winner === 'opp') wins[b]++
    }
  }
}

const rows = NAMES.map(n => ({ n, wr: (wins[n] / games[n] * 100) }))
  .sort((x, y) => y.wr - x.wr)
const total = NAMES.map(n => {
  const c = battle.CHARS[n]
  return c.힘 + c.지능 + c.체력 + c.민첩 + c.솜씨 + c.행운
})
console.log(`반복 ${RUNS}/매치업, 총 ${NAMES.length * (NAMES.length - 1) * RUNS}게임`)
console.log('캐릭       승률%   스탯합')
rows.forEach(r => {
  const c = battle.CHARS[r.n]
  const st = c.힘 + c.지능 + c.체력 + c.민첩 + c.솜씨 + c.행운
  console.log(`${r.n.padEnd(8)} ${r.wr.toFixed(1).padStart(5)}   ${st}`)
})
const wrs = rows.map(r => r.wr)
console.log(`\n스프레드: ${Math.min(...wrs).toFixed(1)} ~ ${Math.max(...wrs).toFixed(1)} (폭 ${(Math.max(...wrs) - Math.min(...wrs)).toFixed(1)})`)
