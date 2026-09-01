// 듀얼 — 턴제 전투 게임 (설계: docs/battle-game-design.md / 밸런스: docs/battle-sim/battle-sim-latest.js)
// /듀얼 → 캐릭 선택 → 랜덤 상대+AI 매치업 → 전투 시작 시 타이틀 부여 + 자동 전투 + 극적 내레이션.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const rand = () => Math.random()
const step = (s, per) => Math.floor(s / 10) * per
const pickArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

const CHARS = {
  전사: { emoji: '⚔️', 힘: 85, 지능: 10, 체력: 70, 민첩: 40, 솜씨: 55, 행운: 30, id: '물리 딜탱' },
  광전사: { emoji: '🪓', 힘: 100, 지능: 10, 체력: 45, 민첩: 55, 솜씨: 60, 행운: 45, id: '물리 유리대포' },
  기사: { emoji: '🛡', 힘: 55, 지능: 10, 체력: 100, 민첩: 35, 솜씨: 50, 행운: 30, id: '순수 탱커' },
  마법사: { emoji: '🔮', 힘: 10, 지능: 100, 체력: 45, 민첩: 40, 솜씨: 60, 행운: 40, id: '마법 딜' },
  도적: { emoji: '🗡', 힘: 45, 지능: 15, 체력: 40, 민첩: 100, 솜씨: 55, 행운: 55, id: '스피드/회피/암살' },
  명사수: { emoji: '🏹', 힘: 55, 지능: 15, 체력: 45, 민첩: 55, 솜씨: 100, 행운: 40, id: '명중/크리/저격' },
  행운아: { emoji: '🍀', 힘: 25, 지능: 20, 체력: 40, 민첩: 85, 솜씨: 35, 행운: 100, id: '고속 도박' },
  세이지: { emoji: '📖', 힘: 60, 지능: 65, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, id: '혼합 하이브리드' },
  마검사: { emoji: '⚡', 힘: 65, 지능: 60, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, id: '융합/CC 하이브리드' }
}
const NAMES = Object.keys(CHARS)
const AIS = ['공격적', '방어적', '판단형']

// ── 타이틀 (docs 시뮬 동일) ──
const clampT = (v, mx) => Math.min(v, mx)
const TITLES = [
  { name: '튼튼한', d: d => { d.물방 += 0.10; d.마방 = clampT(d.마방 + 0.10, 0.75) } },
  { name: '럭키', d: d => { d.리롤 = clampT(d.리롤 + 0.10, 0.60) } },
  { name: '불주먹', d: d => { d.크리 = clampT(d.크리 + 0.05, 0.80); d.물공 = Math.round(d.물공 * 1.05) } },
  { name: '괴력의', d: d => { d.물공 = Math.round(d.물공 * 1.12) } },
  { name: '현자', d: d => { const b = d.base; let hit = false
    if (b.힘 >= 90) { d.물공 = Math.round(d.물공 * 1.12); hit = true }
    if (b.체력 >= 90) { d.물방 += 0.10; d.마방 = clampT(d.마방 + 0.08, 0.80); hit = true }
    if (b.지능 >= 90) { d.마나경감 = clampT((d.마나경감 || 0) + 0.08, 0.45); hit = true }
    if (b.행운 >= 90) { d.리롤 = clampT(d.리롤 + 0.10, 0.60); hit = true }
    if (b.민첩 >= 90) { d.크리 = clampT(d.크리 + 0.08, 0.90); hit = true }
    if (b.솜씨 >= 90) { d.명중 = clampT(d.명중 + 0.12, 0.95); hit = true }
    if (!hit) { d.물공 = Math.round(d.물공 * 1.06); d.마공 = Math.round(d.마공 * 1.06) } } },
  { name: '심연의', flag: 'tMPen' },
  { name: '현혹의', d: d => { d.마회 = clampT(d.마회 + 0.15, 0.60) } },
  { name: '매의눈', d: d => { d.명중 = clampT(d.명중 + 0.12, 0.95) } },
  { name: '암살자', d: d => { d.물크기본 += 0.6; d.마크기본 += 0.6 } },
  { name: '날렵한', d: d => { d.물회 = clampT(d.물회 + 0.10, 0.55) } },
  { name: '질풍의', d: d => { d.턴 = Math.max(Math.round(d.턴 * 0.85 * 10) / 10, 2) } },
  { name: '거인', d: d => { d.maxhp = Math.round(d.maxhp * 1.12) } },
  { name: '살이돋아나는', flag: 'tRegen' },
  { name: '뱀파이어', flag: 'tLeech' },
  { name: '광전사', flag: 'tFury' },
  { name: '철벽', flag: 'tWall' },
  { name: '가시돋힌', flag: 'tThorns' }
]
const JACKPOT = { name: '전설의', d: d => { d.물공 = Math.round(d.물공 * 1.2); d.마공 = Math.round(d.마공 * 1.2); d.크리 = clampT(d.크리 + 0.15, 0.90); d.턴 = Math.max(d.턴 - 1, 2) }, flag: 'tLegend' }
const DUDS = [
  { name: '저주받은', d: d => { d.물공 = Math.round(d.물공 * 0.85); d.마공 = Math.round(d.마공 * 0.85) } },
  { name: '허약한', flag: 'tFrail' },
  { name: '둔한', d: d => { d.턴 = Math.round(d.턴 * 1.15 * 10) / 10 } },
  { name: '무지한', d: d => { const 힘 = d.base.힘, 지능 = d.base.지능; let hit = false
    if (지능 >= 50) { d.마공 = Math.round(d.마공 * 0.88); hit = true }
    if (힘 >= 50) { d.물공 = Math.round(d.물공 * 0.88); hit = true }
    if (!hit) { d.물공 = Math.round(d.물공 * 0.94); d.마공 = Math.round(d.마공 * 0.94) } } },
  { name: '드러난', d: d => { d.마회 = Math.max(d.마회 - 0.15, 0) } }
]
const GALE = TITLES.find(t => t.name === '질풍의')
const COMMON = TITLES.filter(t => t.name !== '질풍의')
const pickTitle = () => { const r = rand()
  if (r < 0.001) return JACKPOT
  if (r < 0.006) return GALE
  if (r < 0.206) return DUDS[Math.floor(rand() * DUDS.length)]
  return COMMON[Math.floor(rand() * COMMON.length)] }

function derive (c) {
  return {
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    물방: (step(c.힘, 3) + step(c.체력, 1)) / 100, 마방: Math.min(30 + step(c.지능, 3), 70) / 100,
    maxhp: Math.round(50 + c.체력 * 1.1 + c.힘 * 0.5 + c.지능 * 0.2 + c.민첩 * 0.2 + c.행운 * 0.3),
    명중: Math.min(20 + step(c.솜씨, 5), c.솜씨 === 100 ? 90 : 80) / 100, 물회: Math.min(10 + step(c.민첩, 2.5), 50) / 100, 마회: step(c.민첩, 3) / 100,
    sigPen: c.힘 === 100, sigDodge: c.행운 === 100, sigTank: c.체력 === 100, sigEcho: c.민첩 === 100, sigEye: c.지능 === 100, base: c,
    hybrid: (c.힘 === 60 && c.지능 === 65 && c.체력 === 55),
    fusion: (c.힘 === 65 && c.지능 === 60 && c.체력 === 55),
    크리: Math.min(10 + step(c.솜씨, 1) + step(c.행운, 3.5), 70) / 100, 리롤: Math.min(step(c.행운, 4), 50) / 100,
    근성: step(c.체력, 4) / 100,
    방패가격: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 0.5 + c.체력 * 1.2 + (step(c.힘, 3) + step(c.체력, 1)) * 2),
    힘절반: Math.round(c.힘 / 2), 돌진딜: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 1.5),
    메테오: Math.round(Math.round(c.지능 * (1 + step(c.지능, 10) / 100)) * 4), 회복: Math.min(10 + step(c.체력, 1), 30),
    물크기본: 2.5, 마크기본: 1.5, 크랜폭: step(c.행운, 0.15) * 2, 비껴무효: step(c.행운, 3) / 100, 턴: Math.max(10 - step(c.민첩, 0.7), 2),
    무기막기: c.힘 >= 50 ? (30 + Math.floor((c.힘 - 50) / 10) * 2) / 100 : 0,
    방패막기: c.체력 >= 70 ? (30 + Math.floor((c.체력 - 70) / 10) * 3) / 100 : 0,
    방패고정: c.체력 >= 70 ? c.체력 / 3 : 0,
    마나경감: c.지능 >= 70 ? (10 + ((c.지능 - 70) / 10) * 2) / 100 : 0
  }
}
function luckRoll (s, ls, p) { if (s) return true; if (ls.used) return false; if (rand() < p) { ls.used = true; return true } return false }
function gutsMul (d, hp, df) { const p = hp / df.maxhp; if (p >= 0.5) return 1; return 1 - df.근성 * ((0.5 - p) / 0.5) }
function attack (A, D, dA, dD, defending, guaranteed) {
  const magic = dA.마공 > dA.물공
  const ls = { used: false }, lsD = { used: false }
  let dmg, 고정 = 0
  if (dD.sigDodge && rand() < 0.30) return 0
  if (dA.hybrid) {
    if (luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤))) return 0
    let block = 0; 고정 = 0
    if (dD.방패막기 && rand() < dD.방패막기) { block = 0.30; 고정 = dD.방패고정 }
    const wBlk = (!block && dD.무기막기 && rand() < dD.무기막기) ? 0.50 : 1
    let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
    if (A.echoReady) { crit = true; A.echoReady = 0 }
    const cP = crit ? (dA.물크기본 + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1) : 1
    const cM = crit ? (dA.마크기본 + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1) : 1
    let ph = dA.물공 * 0.85 * (block ? (1 - block) : wBlk) * (1 - dD.물방 * (dA.sigPen ? 0.7 : 1)) * cP
    let mg = dA.마공 * 0.85 * (block ? (1 - block) : 1) * (1 - dD.마방 * (A.tMPen ? 0.75 : 1)) * cM
    let bolt = 0, pendingAmp = 0
    if (A.autoSpell > 0 && rand() < 0.10) {
      const r = rand()
      if (r < 1 / 3) { bolt = dA.base.지능 * 1.5; pendingAmp = 1.1 } else if (r < 2 / 3) { bolt = dA.base.지능 * 1.0 } else { bolt = dA.base.지능 * 1.2; pendingAmp = 1.2 }
      bolt *= (1 - dD.마방 * (A.tMPen ? 0.75 : 1)); A.lastBolt = true
    }
    let d = ph + mg + bolt - 고정
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) d *= 0.70
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (A.nextAmp) { d *= A.nextAmp; A.nextAmp = 0 }
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (crit) A.lastCrit = true
    const fin = Math.max(Math.round(d), 1)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(fin * 0.12))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    if (pendingAmp) A.nextAmp = pendingAmp
    return fin
  }
  if (dA.fusion) {
    if (!guaranteed && luckRoll(rand() < dD.물회, lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { if (dD.sigEcho) D.echoReady = 1; return 0 }
    let d = dA.물공 + dA.마공; 고정 = 0
    if (dD.방패막기 && rand() < dD.방패막기) { d *= 0.30; 고정 = dD.방패고정 } else if (dD.무기막기 && rand() < dD.무기막기) { d *= 0.50 }
    d *= (1 - Math.max(dD.물방 * (dA.sigPen ? 0.7 : 1), dD.마방))
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) d *= 0.70
    let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
    if (A.echoReady) { crit = true; A.echoReady = 0 }
    if (crit) { d *= (dA.물크기본 + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
    d -= 고정
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    const fin = Math.max(Math.round(d), 1)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(fin * 0.12))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    return fin
  }
  if (!magic) {
    if (!luckRoll(rand() < (dA.명중 - (A.missDown > 0 ? 0.2 : 0) - (A.blind > 0 ? 0.3 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))) return 0
    if (luckRoll(rand() < dD.물회, lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { if (dD.sigEcho) D.echoReady = 1; return 0 }
    dmg = dA.물공
    if (dD.방패막기 && rand() < dD.방패막기) { dmg *= 0.30; 고정 = dD.방패고정 } else if (dD.무기막기 && rand() < dD.무기막기) { dmg *= 0.50 }
    dmg *= (1 - dD.물방 * (dA.sigPen ? 0.70 : 1))
    if (D.sunder > 0) dmg *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) dmg *= 0.70
    let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
    if (A.echoReady) { crit = true; A.echoReady = 0 }
    if (crit) { dmg *= (dA.물크기본 + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
  } else {
    if (luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤))) return 0
    dmg = dA.마공
    if (dD.방패막기 && rand() < dD.방패막기) { dmg *= 0.30; 고정 = dD.방패고정 }
    dmg *= (1 - dD.마방 * (A.tMPen ? 0.75 : 1))
    if (D.sunder > 0) dmg *= 1.15
    if (rand() < dD.마회 && rand() >= dA.비껴무효) dmg *= 0.70
    if (rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0))) { dmg *= (dA.마크기본 + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true; if (dA.sigEye) A.shield = Math.min(Math.round(dA.maxhp * 0.3), A.shield + Math.round(dA.maxhp * 0.06)) }
  }
  dmg -= 고정
  if (dD.마나경감) dmg *= (1 - dD.마나경감)
  if (defending) dmg *= 0.10
  dmg *= gutsMul(dD, D.hp, dD)
  if (D.vuln > 0) dmg *= 2.0
  if (D.instVuln > 0) dmg *= 1.5
  if (A.tFury && A.hp < dA.maxhp * 0.5) dmg *= 1.22
  if (D.tWall) dmg *= 0.90
  if (D.tLegend) dmg *= 0.85
  if (D.tFrail) dmg *= 1.15
  const fin = Math.max(Math.round(dmg), 1)
  if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(fin * 0.12))
  if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
  return fin
}
function guts (dmg, foe, df) { const p = foe.hp / df.maxhp; if (p < 0.5) dmg *= (1 - df.근성 * ((0.5 - p) / 0.5)); return dmg }
function absorb (foe, dmg) { if (foe.shield > 0) { if (dmg <= foe.shield) { foe.shield -= dmg; return 0 } else { const r = dmg - foe.shield; foe.shield = 0; foe.vuln = 1; return r } } return dmg }
function applyCC (foe, field, dur) { foe[field] = Math.max(foe[field], foe.sigTank ? Math.max(dur - 1, 0) : dur) }
function applyAdaptiveCC (foe, df) {
  const b = df.base
  const cand = [['힘', b.힘], ['민첩', b.민첩], ['지능', b.지능], ['행운', b.행운], ['솜씨', b.솜씨], ['체력', b.체력]].filter(s => s[1] >= 70)
  if (cand.length === 0) { applyCC(foe, 'slow', 3); foe.slowSec = Math.max(foe.slowSec, 1); applyCC(foe, 'noDefend', 3); return '둔화' }
  cand.sort((x, y) => y[1] - x[1]); const top = cand[0][0]
  if (top === '힘') { applyCC(foe, 'stun', 1); return '기절' }
  if (top === '민첩') { applyCC(foe, 'slow', 2); foe.slowSec = Math.max(foe.slowSec, 1); return '둔화' }
  if (top === '지능') { applyCC(foe, 'silence', 2); return '침묵' }
  if (top === '행운') { applyCC(foe, 'luckLock', 2); return '행운봉인' }
  if (top === '솜씨') { applyCC(foe, 'blind', 2); return '실명' }
  applyCC(foe, 'noDefend', 2); applyCC(foe, 'healBlock', 2); return '봉쇄'
}
function estAtk (a, d) {
  if (a.hybrid) return (a.물공 * 0.85 * (1 - d.물방) * Math.max(a.명중, 0.3)) + (a.마공 * 0.85 * (1 - d.마방))
  if (a.fusion) return (a.물공 + a.마공) * (1 - Math.max(d.물방, d.마방)) * Math.max(a.명중, 0.3)
  if (a.마공 > a.물공) return a.마공 * (1 - d.마방)
  return a.물공 * (1 - d.물방) * Math.max(a.명중, 0.3)
}
const SKILLS = {
  전사: [
    { name: '방어파괴', ready: (s, f, ds, df) => s.cd[0] === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.2, exec: (s, f, ds, df) => { f.sunder = 2; const d = attack(s, f, ds, df, f.defending); f.hp -= d + ds.힘절반; s.cd[0] = 3 } },
    { name: '돌진', ready: (s, f, ds, df) => s.cd[1] === 0 && f.stun === 0 && s.hp > ds.maxhp * 0.2, score: (s, f, ds, df, x) => ds.돌진딜 * (1 - df.물방) + x.foeTurn, exec: (s, f, ds, df) => { let d = guts(ds.돌진딜 * (1 - df.물방), f, df); d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; applyCC(f, 'stun', 1); s.hp -= Math.round(ds.maxhp * 0.1); s.cd[1] = 5; s.note = '기절' } }
  ],
  광전사: [
    { name: '광폭화', ready: (s, f, ds, df) => s.cd[0] === 0 && s.rage === 0 && s.hp > ds.maxhp * 0.4 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.5, exec: (s, f, ds, df) => { s.rage = 3; const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.note = '광폭' } },
    { name: '재생의광기', ready: (s, f, ds, df) => s.cd[1] === 0 && s.hp < ds.maxhp * 0.65, score: (s, f, ds, df, x) => x.est * 3, exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.25)); s.healRegen = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[1] = 5; s.note = '회복' } }
  ],
  기사: [
    { name: '방패가격', ready: (s, f, ds, df) => s.cd[0] === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => ds.방패가격 * (1 - df.물방), exec: (s, f, ds, df) => { let d = ds.방패가격; if (f.defending) d *= 0.10; d *= (1 - df.물방); d = guts(d, f, df); f.hp -= Math.max(Math.round(d), 1); s.cd[0] = 3 } },
    { name: '도발', ready: (s, f, ds, df) => s.cd[1] === 0 && f.noDefend === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.2, exec: (s, f, ds, df) => { applyCC(f, 'noDefend', 2); const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.cd[1] = 5; s.note = '도발' } }
  ],
  마법사: [
    { name: '메테오', ready: (s, f, ds, df, x) => s.cast === 0 && x.safe, score: (s, f, ds, df, x) => ds.메테오, exec: (s, f, ds, df) => { s.cast = 3; s.note = '시전' } },
    { name: '인스턴트캐스팅', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => ds.메테오 * 1.1, exec: (s, f, ds, df) => { f.hp -= Math.round(ds.메테오 * 0.6 * guts(1, f, df)); s.cd[1] = 15; s.instVuln = 3 } }
  ],
  도적: [
    { name: '암습', ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.est + x.foeTurn * 2, exec: (s, f, ds, df) => { applyCC(f, 'stun', 2); const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.cd[0] = 10; s.note = '기절' } },
    { name: '처형', ready: (s, f, ds, df) => s.cd[1] === 0 && f.hp < df.maxhp * 0.25, score: (s, f, ds, df, x) => ds.물공 * 5 * (1 - df.물방), exec: (s, f, ds, df) => { const d = guts(ds.물공 * 5 * (1 - df.물방), f, df); f.hp -= Math.max(Math.round(d), 1); s.cd[1] = 5; s.note = '처형' } }
  ],
  명사수: [
    { name: '약점간파', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => ds.물공 * (ds.물크기본 + ds.크랜폭 * 0.5) * (1 - df.물방), exec: (s, f, ds, df) => { let d = ds.물공 * (ds.물크기본 + rand() * ds.크랜폭) * (1 - df.물방); if (df.마나경감) d *= (1 - df.마나경감); if (f.instVuln > 0) d *= 1.5; d = guts(d, f, df); d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; s.cd[0] = 4; s.note = '크리' } },
    { name: '견제사격', ready: (s, f, ds, df) => s.cd[1] === 0 && f.missDown === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.1, exec: (s, f, ds, df) => { const d = attack(s, f, ds, df, f.defending); f.hp -= d; f.missDown = 2; s.cd[1] = 4; s.note = '명중↓' } }
  ],
  마검사: [
    { name: '약점봉인', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => x.est + x.foeTurn * 2, exec: (s, f, ds, df) => { const cc = applyAdaptiveCC(f, df); let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[0] = 3; s.note = cc } },
    { name: '중력베기', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est + x.foeTurn, exec: (s, f, ds, df) => { let d = attack(s, f, ds, df, f.defending, true); d = absorb(f, d); f.hp -= d; f.slow = Math.max(f.slow, 3); f.slowSec = Math.max(f.slowSec, 2); s.cd[1] = 5; s.note = '둔화' } }
  ],
  세이지: [
    { name: '오토스펠', ready: (s, f, ds, df) => s.cd[0] === 0 && s.autoSpell <= 1, score: (s, f, ds, df, x) => x.est * 2.2, exec: (s, f, ds, df) => { s.autoSpell = 4; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[0] = 3; s.note = '주문각인' } },
    { name: '연환주문', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est * 2, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 2); d = absorb(f, d); f.hp -= d; s.cd[1] = 4 } }
  ],
  행운아: [
    { name: '행운폭발', ready: (s, f, ds, df) => s.cd[0] === 0 && s.luckBuff === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.5, exec: (s, f, ds, df) => { s.luckBuff = 3; const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.note = '폭발' } },
    { name: '동전던지기', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => ds.물공 * 4.25 * (1 - df.물방) * (s.hp < f.hp ? 1.3 : 1), exec: (s, f, ds, df) => { const m = rand() < 0.5 ? 8 : 0.5; const d = guts(ds.물공 * m * (1 - df.물방), f, df); f.hp -= Math.max(Math.round(d), 1); s.cd[1] = 3; s.note = m > 1 ? '대박' : '꽝' } }
  ]
}
function decideDefend (self, foe, ds, df) {
  const est = (df.물공 > df.마공 ? df.물공 : df.마공) * 0.5
  if (self.noDefend > 0) return false
  if (self.ai === '공격적') return false
  if (self.ai === '방어적') return self.hp < ds.maxhp * 0.7 && !self.defendedLast && rand() < 0.55
  return self.hp <= est * 1.5 && !self.defendedLast && rand() < 0.7
}
function mkFighter (d, name, ai) {
  // 게이지에 랜덤 미세오프셋 → 속도 동률 시 선공을 공정하게(플레이어 선공 고정 방지)
  return { name, hp: d.maxhp, gauge: d.턴 + Math.random() * 0.3, ai, defending: false, defCombo: 0, defendedLast: false,
    shield: d.마나경감 ? Math.round(d.maxhp * 0.3) : 0, vuln: 0, cd: [1, 1], rage: 0, sunder: 0, luckBuff: 0,
    cast: 0, instVuln: 0, stun: 0, noDefend: 0, missDown: 0, autoSpell: 0, nextAmp: 0,
    slow: 0, slowSec: 0, silence: 0, luckLock: 0, blind: 0, healBlock: 0, healRegen: 0,
    sigDodge: d.sigDodge, sigEcho: d.sigEcho, sigTank: d.sigTank, echoReady: 0, revive: d.sigTank ? 1 : 0 }
}
function reviveCheck (f, d) { if (f.hp <= 0 && f.revive > 0) { f.hp = Math.round(d.maxhp * 0.20); f.revive--; f.stun = 0; f.noDefend = 0; return true } return false }

// ── 전투 실행 + 내레이션 로그 ──
function runBattle (meName, oppName, meAI, oppAI) {
  const dA = derive(CHARS[meName]), dB = derive(CHARS[oppName])
  const tA = pickTitle(), tB = pickTitle()
  if (tA.d) tA.d(dA); if (tB.d) tB.d(dB)
  const A = mkFighter(dA, meName, meAI), B = mkFighter(dB, oppName, oppAI)
  if (tA.flag) A[tA.flag] = true; if (tB.flag) B[tB.flag] = true
  const maxA = dA.maxhp, maxB = dB.maxhp
  const log = []
  let t = 0; const DT = 0.1

  const act = (self, foe, ds, df, foeMax) => {
    self.defending = false; self.note = null; self.lastCrit = false; self.lastBolt = false
    self.cd[0] = Math.max(0, self.cd[0] - 1); self.cd[1] = Math.max(0, self.cd[1] - 1)
    if (self.tRegen && self.healBlock === 0) self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.maxhp * 0.03))
    if (self.autoSpell > 0) self.autoSpell--
    if (self.slow > 0) self.slow--; if (self.silence > 0) self.silence--; if (self.luckLock > 0) self.luckLock--; if (self.blind > 0) self.blind--; if (self.healBlock > 0) self.healBlock--
    if (self.healRegen > 0 && self.healBlock === 0) { self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.maxhp * 0.04)); self.healRegen-- }
    if (self.stun > 0) { self.stun--; self.defCombo = 0; self.defendedLast = false; return { type: 'stun' } }
    if (self.instVuln > 0) self.instVuln--
    if (self.noDefend > 0) self.noDefend--
    if (self.missDown > 0) self.missDown--
    if (self.rage > 0) { self.rage--; if (self.rage === 0) self.cd[0] = 2 }
    if (self.luckBuff > 0) { self.luckBuff--; if (self.luckBuff === 0) self.cd[0] = 2 }
    if (foe.sunder > 0) foe.sunder--
    if (self.name === '마법사' && self.cast > 0) { self.cast--; if (self.cast === 0) { const before = foe.hp; foe.hp -= Math.round(guts(ds.메테오, foe, df)); return { type: 'meteor', dmg: before - foe.hp } } return { type: 'cast' } }
    if (self.ai !== '방어적' && self.silence === 0) {
      const foeMagic = df.마공 > df.물공
      const foeDmg = (foeMagic ? df.마공 : df.물공) * 0.6
      const foeHits = Math.ceil(3 / Math.max(df.턴, 2) * ds.턴) + 2
      const ctx = { est: estAtk(ds, df), foeTurn: estAtk(df, ds), safe: self.hp > foeDmg * foeHits * 0.6 }
      let best = null, bestScore = ctx.est
      for (const sk of SKILLS[self.name]) { if (!sk.ready(self, foe, ds, df, ctx)) continue; const sc = sk.score(self, foe, ds, df, ctx); if (sc > bestScore) { bestScore = sc; best = sk } }
      if (best) { const fb = foe.hp; best.exec(self, foe, ds, df); self.defCombo = 0; self.defendedLast = false; return { type: 'skill', name: best.name, dmg: Math.max(fb - foe.hp, 0), note: self.note, crit: self.lastCrit } }
    }
    if (decideDefend(self, foe, ds, df)) { self.hp = Math.min(ds.maxhp, self.hp + ds.회복 * ds.maxhp / 100); self.defending = true; self.defCombo++; self.defendedLast = true; return { type: 'defend' } }
    const fb = foe.hp
    let dmg = attack(self, foe, ds, df, foe.defending)
    if (foe.vuln > 0) foe.vuln--
    dmg = absorb(foe, dmg)
    foe.hp -= dmg; self.defCombo = 0; self.defendedLast = false
    return { type: 'attack', dmg: Math.max(fb - foe.hp, 0), crit: self.lastCrit, bolt: self.lastBolt }
  }

  const rec = (who, other, ev, otherMax) => {
    log.push(Object.assign({ who, hp: Math.max(other.hp, 0), max: otherMax, selfHp: Math.max(who === 'me' ? A.hp : B.hp, 0), selfMax: who === 'me' ? maxA : maxB }, ev))
  }

  while (A.hp > 0 && B.hp > 0 && t < 600) {
    A.gauge -= DT; B.gauge -= DT; t += DT
    if (A.gauge <= 0) { A.gauge = Math.max(dA.턴 - (A.rage > 0 ? 2 : 0), 2) + (A.slow > 0 ? A.slowSec : 0); const ev = act(A, B, dA, dB, maxB); rec('me', B, ev, maxB); if (reviveCheck(B, dB)) log.push({ who: 'opp', type: 'revive', hp: B.hp, max: maxB, selfHp: A.hp, selfMax: maxA }) }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = Math.max(dB.턴 - (B.rage > 0 ? 2 : 0), 2) + (B.slow > 0 ? B.slowSec : 0); const ev = act(B, A, dB, dA, maxA); rec('opp', A, ev, maxA); if (reviveCheck(A, dA)) log.push({ who: 'me', type: 'revive', hp: A.hp, max: maxA, selfHp: B.hp, selfMax: maxB }) }
  }
  const winner = t >= 600 ? 'draw' : (A.hp > 0 ? 'me' : 'opp')
  return { winner, log, meTitle: tA.name, oppTitle: tB.name, meMax: maxA, oppMax: maxB, meHp: Math.max(A.hp, 0), oppHp: Math.max(B.hp, 0) }
}

// ── UI + 내레이션 ──
const BAR = 12
function hpBar (cur, max) {
  const pct = Math.max(0, Math.min(1, cur / max))
  const fill = Math.round(pct * BAR)
  return '█'.repeat(fill) + '░'.repeat(BAR - fill) + ` ${Math.round(pct * 100)}%`
}
function preview (name) {
  const c = CHARS[name]
  return {
    hp: Math.round(50 + c.체력 * 1.1 + c.힘 * 0.5 + c.지능 * 0.2 + c.민첩 * 0.2 + c.행운 * 0.3),
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    턴: Math.max(10 - step(c.민첩, 0.7), 2)
  }
}
function randomMatch (me) { return { opp: pickArr(NAMES.filter(n => n !== me)), ai: pickArr(AIS) } }

function buildSelectEmbed () {
  return new EmbedBuilder()
    .setTitle('⚔️ 듀얼 — 캐릭터 선택')
    .setDescription('캐릭터를 골라줘! 상대와 상대 성향(AI)은 랜덤으로 정해져~')
    .setColor(0x5865f2)
    .addFields(NAMES.map(n => ({ name: `${CHARS[n].emoji} ${n}`, value: CHARS[n].id, inline: true })))
}
function buildSelectRows (memberId) {
  const id = (char) => JSON.stringify({ action: 'duel', op: 'pick', char, memberId })
  const btn = (char) => new ButtonBuilder().setCustomId(id(char)).setLabel(`${CHARS[char].emoji} ${char}`).setStyle(ButtonStyle.Secondary)
  const rows = []
  for (let i = 0; i < NAMES.length; i += 5) rows.push(new ActionRowBuilder().addComponents(NAMES.slice(i, i + 5).map(btn)))
  return rows
}
function fighterLine (name, tail) {
  const c = CHARS[name]; const p = preview(name)
  return { name: `${c.emoji} ${name} ${tail}`, value: `${c.id}\n힘 ${c.힘}·지능 ${c.지능}·체력 ${c.체력}·민첩 ${c.민첩}·솜씨 ${c.솜씨}·행운 ${c.행운}\nHP ${p.hp} · 물공 ${p.물공} · 마공 ${p.마공} · 턴 ${p.턴}초` }
}
function buildMatchupEmbed (me, opp, ai, memberId) {
  return new EmbedBuilder()
    .setTitle('⚔️ 매치업 성립!')
    .setColor(0xe67e22)
    .addFields(fighterLine(me, `<@${memberId}>`), fighterLine(opp, `· ${ai} AI`))
    .setFooter({ text: '전투 시작을 누르면 타이틀이 부여되고 승부가 펼쳐진다! · 🎲로 상대 다시' })
}
function buildMatchupRow (me, opp, ai, memberId) {
  const cid = (op, ex) => JSON.stringify(Object.assign({ action: 'duel', op, memberId }, ex))
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(cid('go', { me, opp, ai })).setLabel('⚔️ 전투 시작').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(cid('reroll', { char: me })).setLabel('🎲 상대 다시').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(cid('back', {})).setLabel('🔙 캐릭 변경').setStyle(ButtonStyle.Secondary)
  )
}

// 이벤트 → 극적 한 줄
function narrateLine (ev, meName, oppName, memberId, oppAI) {
  const actor = ev.who === 'me' ? `${CHARS[meName].emoji} ${meName}` : `${CHARS[oppName].emoji} ${oppName}`
  const crit = ev.crit ? '💥**치명타!** ' : ''
  const bolt = ev.bolt ? '✨볼트 ' : ''
  switch (ev.type) {
    case 'attack': return ev.dmg > 0 ? `${actor} ${bolt}${crit}공격 → **${ev.dmg}** 피해` : `${actor}의 공격 — 빗나감/회피! 💨`
    case 'skill': return `${actor} ⚡**${ev.name}**!${ev.note ? ` [${ev.note}]` : ''}${ev.dmg > 0 ? ` → ${crit}**${ev.dmg}** 피해` : ''}`
    case 'defend': return `${actor} 🛡️ 방어 태세 (회복)`
    case 'stun': return `${actor} 😵 기절 — 행동 불가!`
    case 'cast': return `${actor} 🔮 메테오 시전 중…`
    case 'meteor': return `${actor} ☄️ **메테오 작렬!** → **${ev.dmg}** 피해`
    case 'revive': return `${actor} ✨ **불굴!** 쓰러졌다 다시 일어선다!`
    default: return `${actor} …`
  }
}
function buildResultEmbed (res, meName, oppName, memberId, oppAI) {
  const lines = res.log.map(ev => narrateLine(ev, meName, oppName, memberId, oppAI))
  let body
  if (lines.length > 26) body = lines.slice(0, 10).concat(['', `⋯ *(중략 ${lines.length - 22}턴)* ⋯`, ''], lines.slice(-12)).join('\n')
  else body = lines.join('\n')

  const meHead = `${CHARS[meName].emoji} **${meName}** '*${res.meTitle}*' <@${memberId}>`
  const oppHead = `${CHARS[oppName].emoji} **${oppName}** '*${res.oppTitle}*' · ${oppAI} AI`
  let banner
  if (res.winner === 'draw') banner = '⏳ **무승부!** 시간 초과로 승부가 나지 않았다…'
  else if (res.winner === 'me') banner = `🏆 **승리!** <@${memberId}>의 ${meName} '*${res.meTitle}*'가 이겼다!`
  else banner = `💀 **패배…** ${oppName} '*${res.oppTitle}*'(${oppAI})에게 당했다.`

  const desc = `${meHead}\n${oppHead}\n\n${body}\n\n` +
    `${CHARS[meName].emoji} ${meName} \`${hpBar(res.meHp, res.meMax)}\`\n` +
    `${CHARS[oppName].emoji} ${oppName} \`${hpBar(res.oppHp, res.oppMax)}\`\n\n${banner}`

  return new EmbedBuilder()
    .setTitle('⚔️ 듀얼 결과')
    .setColor(res.winner === 'me' ? 0x2ecc71 : res.winner === 'opp' ? 0xe74c3c : 0x95a5a6)
    .setDescription(desc.length > 4090 ? desc.slice(0, 4090) + '…' : desc)
    .setFooter({ text: '재미로만! · 🔁 재대결 / 🎲 새 상대 / 🔙 캐릭 변경' })
}
function buildResultRow (me, opp, ai, memberId) {
  const cid = (op, ex) => JSON.stringify(Object.assign({ action: 'duel', op, memberId }, ex))
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(cid('go', { me, opp, ai })).setLabel('🔁 재대결').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(cid('reroll', { char: me })).setLabel('🎲 새 상대').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(cid('back', {})).setLabel('🔙 캐릭 변경').setStyle(ButtonStyle.Secondary)
  )
}

async function handleButton (interaction, info) {
  if (interaction.user.id !== info.memberId) {
    await interaction.reply({ content: '이건 다른 사람의 듀얼이야~ `/듀얼`로 직접 시작해봐! ⚔️', ephemeral: true })
    return
  }
  if (info.op === 'pick' || info.op === 'reroll') {
    const me = info.char
    const { opp, ai } = randomMatch(me)
    await interaction.update({ embeds: [buildMatchupEmbed(me, opp, ai, info.memberId)], components: [buildMatchupRow(me, opp, ai, info.memberId)] })
  } else if (info.op === 'back') {
    await interaction.update({ embeds: [buildSelectEmbed()], components: buildSelectRows(info.memberId) })
  } else if (info.op === 'go') {
    const res = runBattle(info.me, info.opp, '판단형', info.ai)
    await interaction.update({ embeds: [buildResultEmbed(res, info.me, info.opp, info.memberId, info.ai)], components: [buildResultRow(info.me, info.opp, info.ai, info.memberId)] })
  }
}

module.exports = { CHARS, NAMES, AIS, TITLES, runBattle, buildSelectEmbed, buildSelectRows, handleButton }

