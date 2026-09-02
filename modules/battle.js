// 듀얼 — 턴제 전투 게임 (설계: docs/battle-game-design.md / 밸런스: docs/battle-sim/battle-sim-latest.js)
// /듀얼 → 캐릭 선택 → 랜덤 상대+AI 매치업 → 전투 시작 시 타이틀 부여 + 자동 전투 + 극적 내레이션.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const rand = () => Math.random()
const step = (s, per) => Math.floor(s / 10) * per
const pickArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

const CHARS = {
  전사: { emoji: '⚔️', 힘: 85, 지능: 10, 체력: 75, 민첩: 45, 솜씨: 60, 행운: 30, 무기: '검방', id: '물리 딜탱' },
  광전사: { emoji: '🪓', 힘: 100, 지능: 10, 체력: 45, 민첩: 55, 솜씨: 60, 행운: 45, 무기: '양도끼', id: '물리 유리대포' },
  기사: { emoji: '🛡', 힘: 60, 지능: 10, 체력: 100, 민첩: 35, 솜씨: 68, 행운: 30, 무기: '검방', 반사: 0.12, id: '순수 탱커' },
  마법사: { emoji: '🔮', 힘: 10, 지능: 100, 체력: 60, 민첩: 30, 솜씨: 50, 행운: 45, 무기: '스태프', id: '스태프 마법사' },
  원드마법사: { emoji: '✨', 힘: 10, 지능: 90, 체력: 50, 민첩: 55, 솜씨: 50, 행운: 45, 무기: '완드', id: '완드 마법사' },
  도적: { emoji: '🗡', 힘: 45, 지능: 15, 체력: 40, 민첩: 100, 솜씨: 55, 행운: 55, 무기: '단검', id: '스피드/회피/암살' },
  명사수: { emoji: '🏹', 힘: 55, 지능: 15, 체력: 45, 민첩: 55, 솜씨: 100, 행운: 40, 무기: '활', id: '명중/크리/저격' },
  한탕주의자: { emoji: '🃏', 힘: 25, 지능: 20, 체력: 40, 민첩: 85, 솜씨: 35, 행운: 100, 무기: '쌍검', id: '고속 도박' },
  세이지: { emoji: '📖', 힘: 60, 지능: 65, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, 무기: '마도서', 원소: true, id: '혼합 하이브리드' },
  마검사: { emoji: '⚡', 힘: 65, 지능: 60, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, 무기: '검오브', id: '융합/CC 하이브리드' },
  스펠브레이커: { emoji: '🪄', 힘: 30, 지능: 80, 체력: 65, 민첩: 50, 솜씨: 45, 행운: 30, 무기: '마도검', id: '안티캐스터 마딜' }
}
// 무기 정의: 캐릭은 CHARS.무기로 참조, derive()가 속성 병합.
// 계열(물리/마법)=스킬풀·조직 / 평타(물리/마법/혼합/융합)=엔진 공격분기 / range=근접·원거리(태그)
// 물리·하이브리드 무기는 현재 스텁(수치 보정 기본값=불변) → 효과는 차차. 스태프·완드만 활성.
const WEAPONS = {
  // 한손 근접=기본배수·속도불변 / 양손(대검류)=평타↑·20%느림 / 쌍검=듀얼(속도불변, 다단) / 활=원거리(공격자 턴+30%)
  검방: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 기본공: 1.0, tempoMul: 1.0, 방어: '방패' },
  단검: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 기본공: 0.78, tempoMul: 1.0, 크리보너스: 0.15, 크리배율: 2.2, 회피보너스: 0.15, 방어: '패링' },
  쌍검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 0.6, tempoMul: 1.0, 다단: 2, 방어: '패링' },
  양검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.25, tempoMul: 1.25, 방어: '무기막기' },
  양둔: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.2, tempoMul: 1.25, 스턴확률: 0.2, 방어: '무기막기' },
  양도끼: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.4, tempoMul: 1.25, 관통: 0.3, 방어: '무기막기' },
  활: { 계열: '물리', 평타: '물리', range: '원거리', hands: 2, 기본공: 1.05, tempoMul: 1.0, 크리배율: 2.5, 원거리페널티: 0.3, 방어: '회피' },
  스태프: { 계열: '마법', 평타: '마법', range: '원거리', hands: 2, magicTempo: true, tempoMul: 1.65, 평타계수: 0.55, castMod: -2, 방어: '마나실드' },
  완드: { 계열: '마법', 평타: '마법', range: '원거리', hands: 1, magicTempo: true, tempoMul: 0.75, 평타계수: 0.9, 마뎀너프: 0.66, 방어: '마나실드' },
  마도서: { 계열: '마법', 평타: '혼합', range: '원거리', hands: 2, 크리배율: 1.9, 방어: '무기막기' },
  검오브: { 계열: '마법', 평타: '융합', range: '근접', hands: 1, 크리배율: 1.9, 방어: '무기막기' },
  마도검: { 계열: '마법', 평타: '마법', range: '근접', hands: 1, magicTempo: true, tempoMul: 0.95, 마방보너스: 0.15, 방어: '무기막기' }
}
// 무기 표시 라벨(이모지 + 이름)
const WEAPON_LABEL = {
  검방: '🛡️검/방', 단검: '🗡단검', 쌍검: '🗡🗡쌍검', 양검: '⚔️양손검', 양둔: '🔨양손둔기',
  양도끼: '🪓양손도끼', 활: '🏹활', 스태프: '🔮스태프', 완드: '✨완드', 마도서: '📖마도서', 검오브: '⚡검/오브', 마도검: '🗡️✨마도검'
}
const wpnLabel = (key) => WEAPON_LABEL[key] || key || ''
const NAMES = Object.keys(CHARS)
const AIS = ['공격적', '방어적', '판단형']
// AI 상대 NPC 이름 (플레이어 @멘션과 대칭용)
const NICKS = ['아르덴', '던컨', '리시타', '카록', '벨루가', '이멘', '루에리', '나오', '마리', '아이라', '퍼거스', '트리아나', '제이머스', '엘리자', '칼릭스', '란딜', '피오나', '에반', '제노', '아리아', '케이', '로란', '델리아', '무마']

// ── 전투 길이 튜닝 노브 (기본값 = 현재 동작) ──
const TUNE = { hpScale: 1, skillStart: 2 } // HP×1.6(순삭 완화, 밸런스 유지)
// 각 캐릭 슬롯별 "첫 사용까지 대기" 쿨 (perskill 모드). 스킬 실제 쿨과 유사, 장쿨(암습10/인캐15)은 완화.
const CDINIT = {
  전사: [3, 5], 광전사: [3, 5], 기사: [3, 5], 마법사: [3, 6], 도적: [6, 5],
  명사수: [4, 4], 마검사: [3, 5], 세이지: [3, 4], 한탕주의자: [3, 3]
}
function startCd (name) {
  if (TUNE.skillStart === 'perskill') return CDINIT[name].slice()
  if (typeof TUNE.skillStart === 'number') return [TUNE.skillStart, TUNE.skillStart]
  return [1, 1]
}

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
// 타이틀 효과 요약 (UI 표시용)
const TITLE_DESC = {
  튼튼한: '물/마방+10%p', 럭키: '행운굴림+10%p', 불주먹: '크리+5%p·물리+5%', 괴력의: '물리딜+12%',
  현자: '스탯90+ 특화보정', 심연의: '마방25%관통', 현혹의: '마법회피+15%p', 매의눈: '명중+12%p',
  암살자: '크리배율+0.6', 날렵한: '물리회피+10%p', 질풍의: '턴주기-15%', 거인: '최대HP+12%',
  살이돋아나는: '매턴 HP+3%', 뱀파이어: '딜 12% 흡혈', 광전사: 'HP50%↓ 딜+22%', 철벽: '받는딜-10%',
  가시돋힌: '받은딜 5% 반사', 전설의: '물/마공+20%·크리+15%p·턴-1·받는딜-15%',
  저주받은: '모든딜-15%', 허약한: '받는딜+15%', 둔한: '턴주기+15%', 무지한: '적응형 딜↓', 드러난: '마법회피-15%p'
}
const titleTag = (name) => `*${name}*${TITLE_DESC[name] ? `(${TITLE_DESC[name]})` : ''}`
const GALE = TITLES.find(t => t.name === '질풍의')
const COMMON = TITLES.filter(t => t.name !== '질풍의')
const pickTitle = () => { const r = rand()
  if (r < 0.001) return JACKPOT
  if (r < 0.006) return GALE
  if (r < 0.206) return DUDS[Math.floor(rand() * DUDS.length)]
  return COMMON[Math.floor(rand() * COMMON.length)] }

// HP 공식(단일 소스): 기본 500 + 스탯 보정. derive·preview 공용
function maxHp (c) { return Math.round((500 + c.체력 * 1.7 + c.힘 * 0.5 + c.지능 * 0.3 + c.민첩 * 0.3 + c.행운 * 0.5) * TUNE.hpScale) }
function derive (c) {
  const w = WEAPONS[c.무기] || {}
  return {
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    물방: (step(c.힘, 3) + step(c.체력, 1)) / 100, 마방: Math.min(Math.min(30 + step(c.지능, 3), 70) / 100 + (w.마방보너스 || 0), 0.85),
    maxhp: maxHp(c),
    명중: Math.min(28 + step(c.솜씨, 5), c.솜씨 === 100 ? 90 : 80) / 100, 물회: Math.min(10 + step(c.민첩, 2.5), 50) / 100 + (w.회피보너스 || 0), 마회: step(c.민첩, 3) / 100,
    sigPen: c.힘 === 100, sigDodge: c.행운 === 100, sigTank: c.체력 === 100, sigEcho: c.민첩 === 100, sigEye: c.지능 === 100, base: c,
    hybrid: (c.힘 === 60 && c.지능 === 65 && c.체력 === 55),
    fusion: (c.힘 === 65 && c.지능 === 60 && c.체력 === 55),
    크리: Math.min(10 + step(c.솜씨, 1) + step(c.행운, 3.5) + (w.크리보너스 || 0) * 100, 70) / 100, 리롤: Math.min(step(c.행운, 4), 50) / 100,
    근성: step(c.체력, 4) / 100,
    방패가격: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 0.5 + c.체력 * 1.8 + (step(c.힘, 3) + step(c.체력, 1)) * 2),
    힘절반: Math.round(c.힘 / 2), 돌진딜: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 1.5),
    파이어볼딜: Math.round(Math.round(c.지능 * (1 + step(c.지능, 10) / 100)) * 4.8), 메테오딜: Math.round(Math.round(c.지능 * (1 + step(c.지능, 10) / 100)) * 8.5), 회복: Math.min(10 + step(c.체력, 1), 30),
    물크기본: 1.5, 마크기본: 1.2, 크랜폭: step(c.행운, 0.15) * 2, 비껴무효: step(c.행운, 3) / 100,
    // 턴속도: 물리무기=민첩 / 마법무기(magicTempo)=지능 파생. 무기 tempoMul로 스태프↔완드 완속 차이.
    턴: Math.max((10 - step(w.magicTempo ? c.지능 : c.민첩, 0.7)) * (w.tempoMul || 1), 2),
    평타계수: w.평타계수 || 1, 마뎀너프: w.마뎀너프 || 1, 기본공: w.기본공 || 1, 무기: w,
    무기막기: c.힘 >= 50 ? (30 + Math.floor((c.힘 - 50) / 10) * 2) / 100 : 0,
    // 방패막기는 검/방(방패) 무기 전용. 무기막기는 스탯기반 유지(무기무관)
    방패막기: (w.방어 === '방패' && c.체력 >= 70) ? (30 + Math.floor((c.체력 - 70) / 10) * 3) / 100 : 0,
    방패고정: (w.방어 === '방패' && c.체력 >= 70) ? c.체력 / 3 : 0,
    마나경감: c.지능 >= 70 ? (10 + ((c.지능 - 70) / 10) * 2) / 100 : 0
  }
}
function luckRoll (s, ls, p) { if (s) return true; if (ls.used) return false; if (rand() < p) { ls.used = true; return true } return false }
function gutsMul (d, hp, df) { const p = hp / df.maxhp; if (p >= 0.5) return 1; return 1 - df.근성 * ((0.5 - p) / 0.5) }
function attack (A, D, dA, dD, defending, guaranteed) {
  const magic = dA.마공 > dA.물공
  const ls = { used: false }, lsD = { used: false }
  let dmg, 고정 = 0
  A.hitPh = null; A.hitMg = null; A.boltName = null; A.boltHits = null; A.boltNames = null; A._braw = null; A._bnames = null; A.lastDef = null; A.didAttack = true; A.brokeCast = false; A.lastElem = false; A.lastRefl = null   // 혼합 내역 + 볼트명 + 연쇄볼트 발당 + 방어판정 + 공격시도 + 시전중단 표식
  if (dD.sigDodge && !dA.hybrid && rand() < 0.30) { A.lastDef = '완전회피'; return 0 }
  if (dA.hybrid) {
    // 본 공격 회피 판정(천운/리롤) — 볼트는 별개로 무조건 명중
    const evaded = (dD.sigDodge && rand() < 0.30) || luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤))
    let bolt = 0, pendingAmp = 0
    if (A.autoSpell > 0 && rand() < 0.30) {   // 볼트: 마법이라 발동 시 회피 무관 명중
      const r = rand()
      if (r < 1 / 3) { bolt = dA.base.지능 * 0.5; pendingAmp = 1.1; A.boltName = '파이어볼트' } else if (r < 2 / 3) { bolt = dA.base.지능 * 0.35; A.boltName = '아이스볼트' } else { bolt = dA.base.지능 * 0.45; pendingAmp = 1.2; A.boltName = '라이트닝볼트' }
      bolt *= (1 - dD.마방 * (A.tMPen ? 0.75 : 1)) * magicGraze(); A.lastBolt = true
    }
    let ph = 0, mg = 0, crit = false; 고정 = 0
    if (!evaded) {
      let block = 0
      if (dD.방패막기 && rand() < dD.방패막기) { block = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' }
      const wBlk = (!block && dD.무기막기 && rand() < dD.무기막기) ? 0.50 : 1
      if (wBlk < 1) A.lastDef = '무기막기'
      crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
      if (A.echoReady) { crit = true; A.echoReady = 0 }
      const cP = crit ? ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1) : 1
      const cM = crit ? ((dA.무기.크리배율 || dA.마크기본) + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1) : 1
      ph = dA.물공 * 0.68 * (block ? block : wBlk) * (1 - dD.물방 * (dA.sigPen ? 0.7 : 1)) * cP
      mg = dA.마공 * 0.68 * (block ? block : 1) * (1 - dD.마방 * (A.tMPen ? 0.75 : 1)) * cM
    }
    if (evaded && bolt <= 0) { A.lastDef = '회피'; return 0 }   // 완전회피 + 볼트 미발동 → 무피해
    let d = ph + mg + bolt - 고정
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) d *= 0.70
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (D.cast > 0) d *= 0.6
    if (A.nextAmp) { d *= A.nextAmp; A.nextAmp = 0 }
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (A.powBuff > 0) d *= A.powMul
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (crit) A.lastCrit = true
    // 원소 스택(세이지 패시브): 공격마다 1스택, 3스택째 폭발(×1.5) + 리셋
    if (A.원소) { if (A.elemStack >= 2) { d *= 1.3; A.elemStack = 0; A.lastElem = true } else { A.elemStack++; A.lastElem = false } }
    const fin = Math.max(Math.round(d), 1)
    // 물리/마법 내역(내레이션용): ph=물리, mg+bolt=마법. 최종 fin에 비례 배분
    const raw = ph + mg + bolt
    if (raw > 0) { A.hitPh = Math.round(ph / raw * fin); A.hitMg = fin - A.hitPh }
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    if (pendingAmp) A.nextAmp = pendingAmp
    return fin
  }
  if (dA.fusion) {
    if (!guaranteed && luckRoll(rand() < dD.물회 + (D.dodgeUp > 0 ? 0.4 : 0), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 }
    let d = dA.물공 + dA.마공; 고정 = 0
    if (dD.방패막기 && rand() < dD.방패막기) { d *= (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' } else if (dD.무기막기 && rand() < dD.무기막기) { d *= 0.50; A.lastDef = '무기막기' }
    d *= (1 - Math.max(dD.물방 * (dA.sigPen ? 0.7 : 1), dD.마방))
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) d *= 0.70
    let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
    if (A.echoReady) { crit = true; A.echoReady = 0 }
    if (crit) { d *= ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
    d -= 고정
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (D.cast > 0) d *= 0.6
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (A.powBuff > 0) d *= A.powMul
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    const fin = Math.max(Math.round(d), 1)
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    return fin
  }
  if (!magic) {
    // 활(원거리): 근접 공격자가 나를 때리면 자기 다음 턴 지연(거리 비용, 공격자 턴 %)
    if (dD.무기.원거리페널티 && dA.무기.range === '근접') A.gauge += dA.턴 * dD.무기.원거리페널티
    if (!luckRoll(rand() < (dA.명중 - (A.missDown > 0 ? 0.2 : 0) - (A.blind > 0 ? 0.3 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))) return 0
    if (luckRoll(rand() < dD.물회 + (D.dodgeUp > 0 ? 0.4 : 0), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 }
    const hits = dA.무기.다단 || 1          // 쌍검: 2연타(기본공에 발당 배수 반영)
    let block = 0, wblk = 1
    if (dD.방패막기 && rand() < dD.방패막기) { block = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' } else if (dD.무기막기 && rand() < dD.무기막기) { wblk = 0.50; A.lastDef = '무기막기' }
    const penMul = (dA.sigPen ? 0.70 : 1) * (1 - (dA.무기.관통 || 0))   // 양도끼 관통 + 힘100 시그
    dmg = 0
    for (let i = 0; i < hits; i++) {
      let h = dA.물공 * physSwing(dA) * dA.기본공   // 기본공: 무기별 평타 배수
      h *= block ? block : wblk
      h *= (1 - dD.물방 * penMul)
      if (D.sunder > 0) h *= 1.15
      if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) h *= 0.70
      let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
      if (A.echoReady) { crit = true; A.echoReady = 0 }
      if (crit) { h *= ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }   // 무기 크리배율이 base 덮어씀(활2·단검1.8)
      dmg += h
    }
    if (dA.무기.스턴확률 && rand() < dA.무기.스턴확률) applyCC(D, 'stun', 1)   // 양둔: 확률 스턴
  } else {
    if (luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '천운'; return 0 }
    // 연쇄주문(완드): 볼트 2발, 발당 약하게(총합 소폭↑) + 발당 빗맞힘·크리 독립. chainBolt=0이면 기존과 동일.
    const bolts = A.chainBolt > 0 ? 2 : 1
    const per = A.chainBolt > 0 ? 0.55 : 1
    let mBlock = 1
    if (dD.방패막기 && rand() < dD.방패막기) { mBlock = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' }   // 방패는 마법도 막음(최종 마공10% 바닥 보장 → 0딜 방지)
    dmg = 0; const braw = []; const bnames = []
    for (let i = 0; i < bolts; i++) {
      let elem = 1; let bn = null
      if (bolts > 1) { const r = rand(); if (r < 1 / 3) { elem = 1.1; bn = '파이어볼트' } else if (r < 2 / 3) { elem = 1.05; bn = '라이트닝볼트' } else { elem = 1.0; bn = '아이스볼트' } }   // 네임드 볼트(계수 차등)
      let b = dA.마공 * dA.평타계수 * dA.마뎀너프 * per * elem
      b *= mBlock
      b *= (1 - dD.마방 * (A.tMPen ? 0.75 : 1))
      if (D.sunder > 0) b *= 1.15
      b *= magicGraze()   // 마법 빗맞힘 구간(발당 독립)
      if (rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0))) { b *= (dA.마크기본 + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true; if (dA.sigEye) A.shield = Math.min(Math.round(dA.maxhp * 0.22), A.shield + Math.round(dA.maxhp * 0.03)) }
      dmg += b; braw.push(b); bnames.push(bn)
    }
    if (bolts > 1) { A.lastBolt = true; A._braw = braw; A._bnames = bnames }   // 연쇄볼트 발당 내역+이름
    // 마법반사(스펠브레이커): 40% 완전반사(시전자가 다 맞음) / 30% 30%만 통과
    if (D.magReflect > 0 && dmg > 0) { const r = rand(); if (r < 0.40) { A.hp -= Math.max(Math.round(dmg), 1); A.lastRefl = 'full'; dmg = 0; A._braw = null } else if (r < 0.70) { A.hp -= Math.max(Math.round(dmg * 0.7), 1); dmg *= 0.30; A.lastRefl = 'part' } }
  }
  dmg -= 고정
  if (dD.마나경감) dmg *= (1 - dD.마나경감)
  if (defending) dmg *= 0.10
  dmg *= gutsMul(dD, D.hp, dD)
  if (D.vuln > 0) dmg *= 2.0
  if (D.instVuln > 0) dmg *= 1.5
  if (D.cast > 0) dmg *= 0.6   // 파이어볼 시전 중 받는뎀 40%↓
  if (A.tFury && A.hp < dA.maxhp * 0.5) dmg *= 1.22
  if (A.powBuff > 0) dmg *= A.powMul
  if (D.tWall) dmg *= 0.90
  if (D.tLegend) dmg *= 0.85
  if (D.tFrail) dmg *= 1.15
  // 마법은 막혀도 최종 마공10% 바닥 보장(방패고정에 0딜 방지) — 방어행동 시엔 제외
  const fin = Math.max(Math.round(dmg), 1)
  // 연쇄볼트: 최종 피해를 발당 raw 비율로 배분(마나경감·근성 등 후처리 반영)
  if (A._braw && A._braw.length > 1) { const s = A._braw.reduce((a, b) => a + b, 0) || 1; A.boltHits = A._braw.map(r => Math.round(r / s * fin)); A.boltNames = A._bnames }
  if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
  if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
  return fin
}
function guts (dmg, foe, df) { const p = foe.hp / df.maxhp; if (p < 0.5) dmg *= (1 - df.근성 * ((0.5 - p) / 0.5)); return dmg }
// 물리 딜 변수: 솜씨 기반 풀댐 확률, 빗맞으면 70~100% 유동 (예측성↓, 명중형=일관/난동형=도박)
function physSwing (d) { const pFull = 0.5 + Math.floor(d.base.솜씨 / 10) * 0.04; return rand() < pFull ? 1 : (0.70 + rand() * 0.30) }
// 마법 빗맞힘 구간(공유): 30% 풀댐 / 40% 80% / 30% 40% (평균 74%). 마법사 마법 + 볼트 공통
function magicGraze () { const gr = rand(); return gr < 0.30 ? 1 : (gr < 0.70 ? 0.80 : 0.40) }
function absorb (foe, dmg) { if (foe.shield > 0) { if (dmg <= foe.shield) { foe.shield -= dmg; return 0 } else { const r = dmg - foe.shield; foe.shield = 0; foe.vuln = 1; return r } } return dmg }
// 시전 마법(파이어볼/인캐) 피해: 일반 마법과 동일 — 천운 완전회피 / 마방 감소 / 빗맞힘 / 근성
function spellDmg (base, foe, df) { if (rand() < df.리롤) return 0; return Math.max(Math.round(guts(base * (1 - df.마방) * magicGraze(), foe, df)), 0) }
// 시전 중 피격 → 5% 시전 중단(취소). 피해가 실제로 들어갔을 때만("정말 운 없을 때")
function castHit (A, D, fin) { if (D.cast > 0 && fin > 0 && rand() < 0.05) { D.cast = 0; D.castCarry = 1; A.brokeCast = true } }   // 취소돼도 충전 일부 남아 다음 시전 -1턴
function applyCC (foe, field, dur) { foe[field] = Math.max(foe[field], foe.sigTank ? Math.max(dur - 1, 0) : dur) }
function applyAdaptiveCC (foe, df) {
  const b = df.base
  const cand = [['힘', b.힘], ['민첩', b.민첩], ['지능', b.지능], ['행운', b.행운], ['솜씨', b.솜씨], ['체력', b.체력]].filter(s => s[1] >= 70)
  // 순수 CC 스킬이라 지속 각 +1턴(앞선 스턴 상향과 통일)
  if (cand.length === 0) { applyCC(foe, 'slow', 4); foe.slowSec = Math.max(foe.slowSec, 1); applyCC(foe, 'noDefend', 4); return '둔화' }
  cand.sort((x, y) => y[1] - x[1]); const top = cand[0][0]
  if (top === '힘') { applyCC(foe, 'stun', 2); return '기절' }
  if (top === '민첩') { applyCC(foe, 'slow', 3); foe.slowSec = Math.max(foe.slowSec, 1); return '둔화' }
  if (top === '지능') { applyCC(foe, 'slow', 3); foe.slowSec = Math.max(foe.slowSec, 1); return '둔화' } // 지능=마법템포 → 민첩처럼 둔화
  if (top === '행운') { applyCC(foe, 'luckLock', 3); return '행운봉인' }
  if (top === '솜씨') { applyCC(foe, 'blind', 3); return '실명' }
  applyCC(foe, 'noDefend', 3); applyCC(foe, 'healBlock', 3); return '봉쇄'
}
function estAtk (a, d) {
  if (a.hybrid) return (a.물공 * 0.68 * (1 - d.물방) * Math.max(a.명중, 0.3)) + (a.마공 * 0.68 * (1 - d.마방))
  if (a.fusion) return (a.물공 + a.마공) * (1 - Math.max(d.물방, d.마방)) * Math.max(a.명중, 0.3)
  if (a.마공 > a.물공) return a.마공 * (1 - d.마방)
  return a.물공 * (1 - d.물방) * Math.max(a.명중, 0.3)
}
const SKILLS = {
  전사: [
    // 방어파괴: 딜 + 상대 2턴 받는뎀↑ + 상대 최대체력 6% 고정딜(HP스케일 관통)
    { name: '방어파괴', ready: (s, f, ds, df) => s.cd[0] === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.2 + df.maxhp * 0.09, exec: (s, f, ds, df) => { f.sunder = 2; const d = attack(s, f, ds, df, f.defending); f.hp -= d + ds.힘절반 + Math.round(df.maxhp * 0.09); s.cd[0] = 3 } },
    { name: '돌진', ready: (s, f, ds, df) => s.cd[1] === 0 && f.stun === 0 && s.hp > ds.maxhp * 0.2, score: (s, f, ds, df, x) => ds.돌진딜 * (1 - df.물방) + x.foeTurn, exec: (s, f, ds, df) => { let d = guts(ds.돌진딜 * physSwing(ds) * (1 - df.물방), f, df); d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; applyCC(f, 'stun', 2); s.hp -= Math.round(ds.maxhp * 0.1); s.cd[1] = 5; s.note = '기절' } },
    // 차단: 시전 중이면 취소+1턴 침묵 / 아니면 1턴 스턴 + 딜. 캐스터·물리 양쪽 대응(범용)
    { name: '차단', ready: (s, f, ds, df) => s.cd[2] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.est + (f.cast > 0 ? 150 : x.foeTurn * 0.6), exec: (s, f, ds, df) => { if (f.cast > 0) { f.cast = 0; f.castCarry = 1; applyCC(f, 'silence', 1); s.note = '시전차단' } else { applyCC(f, 'stun', 1); s.note = '기절' } let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[2] = 4 } }
  ],
  광전사: [
    { name: '광폭화', ready: (s, f, ds, df) => s.cd[0] === 0 && s.rage === 0 && s.hp > ds.maxhp * 0.4 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.5, exec: (s, f, ds, df) => { s.rage = 3; const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.note = '광폭' } },
    { name: '재생의광기', ready: (s, f, ds, df) => s.cd[1] === 0 && s.hp < ds.maxhp * 0.65, score: (s, f, ds, df, x) => x.est * 3, exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.07)); s.healRegen = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[1] = 5; s.note = '회복' } },
    // 피의각성: 체력 10% 소모 → 3턴간 공격력 ×1.35 (생명 태워 딜)
    { name: '피의각성', ready: (s, f, ds, df) => s.cd[2] === 0 && s.powBuff === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.4, exec: (s, f, ds, df) => { s.hp -= Math.round(ds.maxhp * 0.10); s.powBuff = 3; s.powMul = 1.35; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[2] = 5; s.note = '피의각성' } }
  ],
  기사: [
    // 방패가격: 물리딜 + 상대 최대체력 8% 고정딜(방어무시) — HP스케일 관통 탱버스터
    { name: '방패가격', ready: (s, f, ds, df) => s.cd[0] === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => ds.방패가격 * (1 - df.물방) + df.maxhp * 0.10, exec: (s, f, ds, df) => { let d = ds.방패가격 * physSwing(ds); if (f.defending) d *= 0.10; d *= (1 - df.물방); d = guts(d, f, df); d += df.maxhp * 0.10; f.hp -= Math.max(Math.round(d), 1); s.cd[0] = 3 } },
    // 방패들기: 3턴간 방패막기 경감 강화(30%→90%). + 패시브 가시방패(상시 20% 반사)
    { name: '방패들기', ready: (s, f, ds, df) => s.cd[1] === 0 && s.blockUp === 0 && ds.방패막기 > 0, score: (s, f, ds, df, x) => x.foeTurn * 1.3, exec: (s, f, ds, df) => { s.blockUp = 3; s.cd[1] = 4; s.note = '방패들기' } }
  ],
  마법사: [
    // 파이어볼: 인캐 걸려있으면 즉발, 아니면 시전(스태프 castMod로 -2턴). castCarry(취소 잔여)로 -1턴
    { name: '파이어볼', ready: (s, f, ds, df, x) => s.cast === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => ds.파이어볼딜 * (s.instCast ? 2.5 : 1), exec: (s, f, ds, df) => { if (s.instCast > 0) { s.instCast = 0; f.hp -= spellDmg(ds.파이어볼딜, f, df); s.note = '즉시 파이어볼' } else { s.cast = Math.max(1, 6 + (ds.무기.castMod || 0) - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = ds.파이어볼딜; s.castName = '파이어볼'; s.note = '파이어볼 시전' } } },
    // 메테오: 긴 시전(9+무기), 인캐 불가(무조건 하드캐스트), 초대형 한 방. 취소돼도 castCarry 유지
    { name: '메테오', ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[1] === 0 && x.safe, score: (s, f, ds, df, x) => ds.파이어볼딜 * 0.9, exec: (s, f, ds, df) => { s.cast = Math.max(2, 9 + (ds.무기.castMod || 0) - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = ds.메테오딜; s.castName = '메테오'; s.cd[1] = 5; s.note = '메테오 시전' } },
    // 인스턴트캐스팅: 다음 시전 마법을 즉시시전으로(버프·딜 없음). 메테오엔 안 걸림
    { name: '인스턴트캐스팅', ready: (s, f, ds, df) => s.cd[2] === 0 && s.cast === 0 && s.instCast === 0, score: (s, f, ds, df, x) => ds.파이어볼딜 * 1.3, exec: (s, f, ds, df) => { s.instCast = 3; s.cd[2] = 6; s.note = '인스턴트 캐스팅' } }
  ],
  원드마법사: [
    { name: '연쇄주문', ready: (s, f, ds, df) => s.cd[0] === 0 && s.chainBolt <= 1, score: (s, f, ds, df, x) => x.est * 1.1, exec: (s, f, ds, df) => { s.chainBolt = 4; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[0] = 4; s.note = '연쇄주문' } },
    { name: '마력충전', ready: (s, f, ds, df) => s.cd[1] === 0 && s.shield < ds.maxhp * 0.10, score: (s, f, ds, df, x) => x.foeTurn * 0.8, exec: (s, f, ds, df) => { s.shield = Math.max(s.shield, Math.round(ds.maxhp * 0.22)); s.cd[1] = 5; s.note = '마나실드 충전' } },
    { name: '볼트임팩트', ready: (s, f, ds, df) => s.cast === 0 && s.cd[2] === 0, score: (s, f, ds, df, x) => ds.마공 * 1.8, exec: (s, f, ds, df) => { s.cast = Math.max(2, 4 - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = Math.round(ds.마공 * 2.8); s.castName = '볼트 임팩트'; s.cd[2] = 6; s.note = '볼트 임팩트 시전' } }
  ],
  도적: [
    { name: '암습', ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.est + x.foeTurn * 2, exec: (s, f, ds, df) => { applyCC(f, 'stun', 3); const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.cd[0] = 10; s.note = '기절' } },
    { name: '처형', ready: (s, f, ds, df) => s.cd[1] === 0 && f.hp < df.maxhp * 0.25, score: (s, f, ds, df, x) => ds.물공 * 5 * (1 - df.물방), exec: (s, f, ds, df) => { const d = guts(ds.물공 * 5 * physSwing(ds) * (1 - df.물방), f, df); f.hp -= Math.max(Math.round(d), 1); s.cd[1] = 5; s.note = '처형' } },
    { name: '백스텝', ready: (s, f, ds, df) => s.cd[2] === 0 && s.dodgeUp === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.1, exec: (s, f, ds, df) => { s.dodgeUp = 2; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[2] = 4; s.note = '백스텝' } }
  ],
  명사수: [
    { name: '약점간파', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => ds.물공 * 1.4 * (ds.물크기본 + ds.크랜폭 * 0.5) * (1 - df.물방), exec: (s, f, ds, df) => { let d = ds.물공 * 1.4 * ((ds.무기.크리배율 || ds.물크기본) + rand() * ds.크랜폭) * (1 - df.물방); if (df.마나경감) d *= (1 - df.마나경감); if (f.instVuln > 0) d *= 1.5; d = guts(d, f, df); d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; s.cd[0] = 4; s.note = '크리' } },
    { name: '견제사격', ready: (s, f, ds, df) => s.cd[1] === 0 && f.missDown === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.1, exec: (s, f, ds, df) => { const d = attack(s, f, ds, df, f.defending); f.hp -= d; f.missDown = 2; s.cd[1] = 4; s.note = '명중↓' } },
    { name: '연발사격', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.est * 1.4, exec: (s, f, ds, df) => { for (let i = 0; i < 3; i++) { let d = Math.round(attack(s, f, ds, df, f.defending) * 0.5); d = absorb(f, d); f.hp -= d } s.cd[2] = 4; s.note = '연발' } }
  ],
  마검사: [
    // 약점봉인: 순수 CC(딜 없음) — 상대 최고 스탯에 맞는 군중제어만
    { name: '약점봉인', ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0 && f.slow === 0, score: (s, f, ds, df, x) => x.foeTurn * 2.5, exec: (s, f, ds, df) => { const cc = applyAdaptiveCC(f, df); s.cd[0] = 3; s.note = cc } },
    { name: '중력베기', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est * 1.5 + x.foeTurn, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending, true) * 1.5); d = absorb(f, d); f.hp -= d; f.slow = Math.max(f.slow, 3); f.slowSec = Math.max(f.slowSec, 2); s.cd[1] = 4; s.note = '둔화' } },
    // 인챈트: 3턴간 공격력 ×1.3 (마검사 딜 보강)
    { name: '인챈트', ready: (s, f, ds, df) => s.cd[2] === 0 && s.powBuff === 0, score: (s, f, ds, df, x) => x.est * 1.3, exec: (s, f, ds, df) => { s.powBuff = 3; s.powMul = 1.3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[2] = 5; s.note = '인챈트' } }
  ],
  스펠브레이커: [
    // 마나소각: 마나실드 파괴 + 마공 딜(실드 있었으면 ×1.5) — 마나실드 캐스터 카운터
    { name: '마나소각', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => x.est * (f.shield > 0 ? 2.2 : 1.2), exec: (s, f, ds, df) => { const had = f.shield > 0; f.shield = 0; let d = attack(s, f, ds, df, f.defending); if (had) d = Math.round(d * 1.5); f.hp -= d; s.cd[0] = 3; s.note = had ? '마나소각' : '마나번' } },
    // 시전파괴: 상대 시전 확정 취소 + 3턴 침묵 + 딜 — 마법사 하드카운터
    // 시전파괴: 캐스터(지능70+) 상대면 침묵락+시전취소+딜(대박) / 물딜러 상대면 자기 기절(리스크). AI는 캐스터에게만 사용
    { name: '시전파괴', ready: (s, f, ds, df) => s.cd[1] === 0 && df.base.지능 >= 70 && (f.silence <= 1 || f.cast > 0), score: (s, f, ds, df, x) => x.est + (f.cast > 0 ? 300 : 150), exec: (s, f, ds, df) => { s.cd[1] = 3; if (df.base.지능 >= 70) { const wc = f.cast > 0; if (wc) { f.cast = 0; f.castCarry = 1 } applyCC(f, 'silence', 4); let d = Math.round(attack(s, f, ds, df, f.defending) * 1.3); d = absorb(f, d); f.hp -= d; s.note = wc ? '시전파괴' : '침묵' } else { applyCC(s, 'stun', 1); s.note = '헛손질' } } },
    { name: '마법반사', ready: (s, f, ds, df) => s.cd[2] === 0 && s.magReflect === 0, score: (s, f, ds, df, x) => (df.마공 > df.물공 ? x.foeTurn * 1.6 : 0), exec: (s, f, ds, df) => { s.magReflect = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[2] = 5; s.note = '마법반사' } }
  ],
  세이지: [
    { name: '오토스펠', ready: (s, f, ds, df) => s.cd[0] === 0 && s.autoSpell <= 1, score: (s, f, ds, df, x) => x.est * 2.2, exec: (s, f, ds, df) => { s.autoSpell = 4; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[0] = 3; s.note = '주문각인' } },
    { name: '연환주문', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est * 2, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 2); d = absorb(f, d); f.hp -= d; s.cd[1] = 4 } }
  ],
  한탕주의자: [
    { name: '행운폭발', ready: (s, f, ds, df) => s.cd[0] === 0 && s.luckBuff === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.5, exec: (s, f, ds, df) => { s.luckBuff = 3; const d = attack(s, f, ds, df, f.defending); f.hp -= d; s.note = '폭발' } },
    { name: '동전던지기', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => ds.물공 * 4.25 * (1 - df.물방) * (s.hp < f.hp ? 1.3 : 1), exec: (s, f, ds, df) => { const m = rand() < 0.5 ? 8 : 0.5; const d = guts(ds.물공 * m * (1 - df.물방), f, df); f.hp -= Math.max(Math.round(d), 1); s.cd[1] = 2; s.note = m > 1 ? '대박' : '꽝' } },
    { name: '룰렛', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.est * 1.3, exec: (s, f, ds, df) => { const r = rand(); if (r < 0.30) { const d = guts(ds.물공 * 6 * (1 - df.물방), f, df); f.hp -= Math.max(Math.round(d), 1); s.note = '잭팟' } else if (r < 0.50) { s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.25)); s.note = '회복' } else if (r < 0.72) { applyCC(f, 'stun', 1); let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.note = '기절' } else if (r < 0.88) { s.luckBuff = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.note = '행운폭주' } else { s.hp -= Math.round(ds.maxhp * 0.12); s.note = '꽝(자해)' } s.cd[2] = 3 } }
  ]
}
// ===== 커스텀 전용 공통 스킬 풀 (설계 검증 완료·미구현) =====
// 커스텀 캐릭이 여기서 2개 선택. 스탯 상한85·예산320 규칙과 함께 밸런스 검증됨(docs 9절).
// 아직 CHARS/UI에 커스텀 미등록 → 라이브 봇엔 영향 없음. 시뮬은 docs/battle-sim/custom-balance-sim.js
// ci = 쿨다운 슬롯 인덱스(스킬이 슬롯0/1 어디에 놓여도 자기 cd 사용)
const CUSTOM_DEFS = {
  강타: (ci) => ({ name: '강타', ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => x.est * 1.6, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 1.6); d = absorb(f, d); f.hp -= d; s.cd[ci] = 3; s.note = '강타' } }),
  연격: (ci) => ({ name: '연격', ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => x.est * 1.2, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 0.6 + attack(s, f, ds, df, f.defending) * 0.6); d = absorb(f, d); f.hp -= d; s.cd[ci] = 3; s.note = '연격' } }),
  속박: (ci) => ({ name: '속박', ready: (s, f) => s.cd[ci] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.est + x.foeTurn * 1.5, exec: (s, f, ds, df) => { applyCC(f, 'stun', 1); let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[ci] = 4; s.note = '기절' } }),
  철벽: (ci) => ({ name: '철벽', ready: (s, f, ds) => s.cd[ci] === 0 && s.shield < ds.maxhp * 0.15, score: (s, f, ds, df, x) => x.foeTurn + df.물공 * 0.3, exec: (s, f, ds, df) => { s.shield = Math.max(s.shield, Math.round(ds.maxhp * 0.35)); s.cd[ci] = 4; s.note = '철벽' } }),
  재정비: (ci) => ({ name: '재정비', ready: (s, f, ds) => s.cd[ci] === 0 && s.hp < ds.maxhp * 0.7, score: (s, f, ds, df, x) => (ds.maxhp - s.hp) * 0.5, exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.18)); s.cd[ci] = 4; s.note = '회복' } }),
  반격태세: (ci) => ({ name: '반격태세', ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => df.물공 * 0.4, exec: (s, f, ds, df) => { s.defending = true; s.shield = Math.max(s.shield, Math.round(ds.maxhp * 0.12)); s.cd[ci] = 3; s.note = '반격' } })
}
const SKILL_STARTCD_CUSTOM = { 속박: 2 } // 오프닝 CC 봉인
// 스킬 표시용 쿨다운(버튼 라벨). 숫자=턴 쿨, 문자=특수
const SKILL_CD = { 방어파괴: 3, 돌진: 5, 광폭화: '버프', 재생의광기: 5, 방패가격: 3, 도발: 5, 파이어볼: '시전', 메테오: '시전', 인스턴트캐스팅: '버프', 암습: 10, 처형: 5, 약점간파: 4, 견제사격: 4, 약점봉인: 3, 중력베기: 5, 오토스펠: 3, 연환주문: 4, 행운폭발: '버프', 동전던지기: 2, 연쇄주문: '버프', 마력충전: 5, 마나소각: 3, 시전파괴: 4, 차단: 4, 방패들기: '버프', 인챈트: '버프', 피의각성: '버프', 메테오: '시전', 볼트임팩트: '시전', 백스텝: '버프', 연발사격: 4, 룰렛: 3, 마법반사: '버프' }
// 스킬 종류별 "시작 쿨"(오프닝 봉인). 공격기=0(즉시), CC=2, 인캐=3. 마법사=슬로우스타터
const SKILL_STARTCD = { 돌진: 2, 암습: 2, 약점봉인: 2, 도발: 2, 중력베기: 2, 인스턴트캐스팅: 3, 메테오: 4, 속박: 2 }
const skillStartCd = (name) => SKILLS[name].map(sk => SKILL_STARTCD[sk.name] || 0)
// 스킬 효과 요약(매치업 표시용)
const SKILL_DESC = {
  방어파괴: '상대 2턴 받는뎀+15% + 고정딜', 돌진: '딜+1턴 스턴 (나 반동)',
  광폭화: '3턴 공격력↑ + 턴 빨라짐', 재생의광기: '즉시 25% 회복+3턴 재생 (공격도 함)',
  방패가격: '방어 기반 강력한 한 방', 도발: '상대 2턴 방어행동 불가 + 딜',
  파이어볼: '시전 마법 — 마공 기반 딜(인캐로 즉발 가능)', 메테오: '긴 시전 → 초대형 한 방(인캐 불가)', 인스턴트캐스팅: '3턴간 다음 시전을 즉시시전(메테오 제외)',
  암습: '상대 3턴 기절 + 진입딜', 처형: '상대 HP25%↓면 물공×5 대박딜',
  약점간파: '확정 크리 + 방어 대부분 무시', 견제사격: '딜 + 상대 2턴 명중-20%',
  약점봉인: '상대 최고 스탯에 맞는 군중제어 (순수 CC·딜 없음)', 방패들기: '3턴간 방패막기 경감 대폭↑', 차단: '시전 취소+침묵 / 아니면 1턴 스턴 + 딜', 인챈트: '3턴간 공격력 ×1.3', 피의각성: '체력 10% 소모 → 3턴 공격력 ×1.35', 볼트임팩트: '긴 시전 → 볼트 압축 한방(마공×3.5)', 백스텝: '2턴 회피 대폭↑ + 딜', 연발사격: '3연사(발당 약)', 룰렛: 'All or Nothing — 잭팟/회복/기절/폭주/꽝 랜덤', 마법반사: '3턴간 받는 마법 반사(완전/부분 랜덤)', 중력베기: '완전명중 + 상대 3턴 둔화',
  오토스펠: '공격 시 30% 확률로 볼트 마법 자동시전(추가 마법딜)', 연환주문: '혼합 타격 ×2 한방기',
  행운폭발: '3턴 크리·리롤·비껴무효 대폭↑', 동전던지기: '50% 물공×8 / 50% ×0.5 도박',
  연쇄주문: '4턴 유지 — 볼트 평타가 2발 발사(발당 약하게, 총합 소폭↑)', 마력충전: '마나실드 즉시 재충전',
  마나소각: '상대 마나실드 파괴 + 마공 딜(실드 있으면 ×1.5)', 시전파괴: '상대 시전 확정 취소 + 3턴 침묵 + 딜'
}
function skillsBlock (name) {
  return SKILLS[name].map((sk, i) => {
    const cd = SKILL_CD[sk.name]
    return `${i + 1}) **${sk.name}** — ${SKILL_DESC[sk.name] || ''} (${typeof cd === 'number' ? `쿨${cd}` : cd})`
  }).join('\n')
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
    shield: d.마나경감 ? Math.round(d.maxhp * 0.22) : 0, vuln: 0, cd: skillStartCd(name), rage: 0, sunder: 0, luckBuff: 0,
    cast: 0, castCarry: 0, castDmg: 0, castName: null, instVuln: 0, instCast: 0, stun: 0, noDefend: 0, missDown: 0, autoSpell: 0, chainBolt: 0, nextAmp: 0, didAttack: false,
    powBuff: 0, powMul: 1, thorns: 0, thornsPct: 0, blockUp: 0, thornsBase: (CHARS[name] && CHARS[name].반사) || 0,   // 공격강화 / 반사버프 / 방패막기강화 / 패시브반사(가시방패)
    dodgeUp: 0, magReflect: 0, elemStack: 0, 원소: (CHARS[name] && CHARS[name].원소) || false,   // 백스텝 회피버프 / 마법반사 / 원소스택(세이지 패시브)
    slow: 0, slowSec: 0, silence: 0, luckLock: 0, blind: 0, healBlock: 0, healRegen: 0,
    sigDodge: d.sigDodge, sigEcho: d.sigEcho, sigTank: d.sigTank, echoReady: 0, revive: d.sigTank ? 1 : 0 }
}
function reviveCheck (f, d) { if (f.hp <= 0 && f.revive > 0) { f.hp = Math.round(d.maxhp * 0.20); f.revive--; f.stun = 0; f.noDefend = 0; return true } return false }

// ── 스텝형 전투 엔진 (자동 runBattle + 인터랙티브 공용) ──
function resetGauge (f, d) { return Math.max(d.턴 - (f.rage > 0 ? 2 : 0), 2) + (f.slow > 0 ? f.slowSec : 0) }
// 턴 시작 처리(쿨/상태 감소, 기절·시전). 턴이 소모되는 강제 이벤트면 그 이벤트, 아니면 null
function upkeep (self, foe, ds, df) {
  self.defending = false; self.note = null; self.lastCrit = false; self.lastBolt = false
  for (let i = 0; i < self.cd.length; i++) self.cd[i] = Math.max(0, self.cd[i] - 1)   // 전 스킬 슬롯 쿨 감소(3스킬 대응)
  if (self.tRegen && self.healBlock === 0) self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.base.체력 * 0.3))
  if (self.autoSpell > 0) self.autoSpell--
  if (self.chainBolt > 0) self.chainBolt--
  if (self.slow > 0) self.slow--; if (self.silence > 0) self.silence--; if (self.luckLock > 0) self.luckLock--; if (self.blind > 0) self.blind--; if (self.healBlock > 0) self.healBlock--
  if (self.healRegen > 0 && self.healBlock === 0) { self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.base.체력 / 2)); self.healRegen-- }
  if (self.stun > 0) { if (self.cast > 0) { self.cast = 0; self.castCarry = 1 } self.stun--; self.defCombo = 0; self.defendedLast = false; return { type: 'stun' } }   // 기절=행동불능 → 시전 즉시 취소(충전 일부 잔존)
  if (self.instVuln > 0) self.instVuln--
  if (self.instCast > 0 && self.cast === 0) self.instCast--   // 인캐 버프 3턴 지속(시전 중엔 유지)
  if (self.powBuff > 0) self.powBuff--
  if (self.thorns > 0) self.thorns--
  if (self.blockUp > 0) self.blockUp--
  if (self.dodgeUp > 0) self.dodgeUp--
  if (self.magReflect > 0) self.magReflect--
  if (self.noDefend > 0) self.noDefend--
  if (self.missDown > 0) self.missDown--
  if (self.rage > 0) { self.rage--; if (self.rage === 0) self.cd[0] = 2 }
  if (self.luckBuff > 0) { self.luckBuff--; if (self.luckBuff === 0) self.cd[0] = 2 }
  if (foe.sunder > 0) foe.sunder--
  // 시전 진행(캐스터 공통, 이름 무관): 카운트다운 후 발사. 지금은 파이어볼(ds.파이어볼딜)만
  if (self.cast > 0) { self.cast--; if (self.cast === 0) { const b = foe.hp; foe.hp -= spellDmg(self.castDmg || ds.파이어볼딜, foe, df); return { type: 'castfire', dmg: b - foe.hp, spell: self.castName || '파이어볼' } } return { type: 'cast', spell: self.castName || '파이어볼' } }
  return null
}
function ctxFor (self, foe, ds, df) {
  const fm = df.마공 > df.물공, fd = (fm ? df.마공 : df.물공) * 0.6, fh = Math.ceil(3 / Math.max(df.턴, 2) * ds.턴) + 2
  return { est: estAtk(ds, df), foeTurn: estAtk(df, ds), safe: self.hp > fd * fh * 0.6 }
}
function execSkill (self, foe, ds, df, sk) { const fb = foe.hp, sb = self.hp; self.didAttack = false; self.lastDef = null; sk.exec(self, foe, ds, df); self.defCombo = 0; self.defendedLast = false; { const dealt = Math.max(fb - foe.hp, 0); const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dealt > 0) self.hp -= Math.max(Math.round(dealt * tp), 1) } return { type: 'skill', name: sk.name, dmg: Math.max(fb - foe.hp, 0), note: self.note, crit: self.lastCrit, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, def: self.lastDef, attacked: self.didAttack, broke: self.brokeCast, selfDmg: Math.max(sb - self.hp, 0) } }
function execAttack (self, foe, ds, df) { const fb = foe.hp; let dmg = attack(self, foe, ds, df, foe.defending); if (foe.vuln > 0) foe.vuln--; dmg = absorb(foe, dmg); foe.hp -= dmg; self.defCombo = 0; self.defendedLast = false; { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dmg > 0) self.hp -= Math.max(Math.round(dmg * tp), 1) } return { type: 'attack', dmg: Math.max(fb - foe.hp, 0), crit: self.lastCrit, bolt: self.lastBolt, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, def: self.lastDef, broke: self.brokeCast } }
// 방어 회복: maxhp 5% + 체력/2 고정(장기전 복리 완화)
function execDefend (self, ds) { const before = self.hp; self.hp = Math.min(ds.maxhp, self.hp + ds.maxhp * 0.05 + ds.base.체력 / 2); self.defending = true; self.defCombo++; self.defendedLast = true; return { type: 'defend', heal: Math.round(self.hp - before) } }
function aiTurn (self, foe, ds, df) {
  const forced = upkeep(self, foe, ds, df); if (forced) return forced
  if (self.ai !== '방어적' && self.silence === 0) {
    const ctx = ctxFor(self, foe, ds, df); let best = null, bestScore = ctx.est
    for (const sk of SKILLS[self.name]) { if (!sk.ready(self, foe, ds, df, ctx)) continue; const sc = sk.score(self, foe, ds, df, ctx); if (sc > bestScore) { bestScore = sc; best = sk } }
    if (best) return execSkill(self, foe, ds, df, best)
  }
  if (decideDefend(self, foe, ds, df)) return execDefend(self, ds)
  return execAttack(self, foe, ds, df)
}
function initBattle (meName, oppName, oppAI) {
  const dA = derive(CHARS[meName]), dB = derive(CHARS[oppName])
  const tA = pickTitle(), tB = pickTitle()
  if (tA.d) tA.d(dA); if (tB.d) tB.d(dB)
  const A = mkFighter(dA, meName, null), B = mkFighter(dB, oppName, oppAI)
  if (tA.flag) A[tA.flag] = true; if (tB.flag) B[tB.flag] = true
  return { A, B, dA, dB, maxA: dA.maxhp, maxB: dB.maxhp, meName, oppName, oppAI, oppNick: pickArr(NICKS), meTitle: tA.name, oppTitle: tB.name, t: 0, log: [] }
}
function recEntry (state, who, ev) {
  const other = who === 'me' ? state.B : state.A, otherMax = who === 'me' ? state.maxB : state.maxA
  const self = who === 'me' ? state.A : state.B, selfMax = who === 'me' ? state.maxA : state.maxB
  state.log.push(Object.assign({ who, hp: Math.round(Math.max(other.hp, 0)), max: otherMax, selfHp: Math.round(Math.max(self.hp, 0)), selfMax }, ev))
}
function reviveRec (state, who) { const f = who === 'me' ? state.A : state.B, mx = who === 'me' ? state.maxA : state.maxB; state.log.push({ who, type: 'revive', hp: Math.max(f.hp, 0), max: mx }) }
function stateResult (state) { return { winner: state.winner, log: state.log, meTitle: state.meTitle, oppTitle: state.oppTitle, oppNick: state.oppNick, meMax: state.maxA, oppMax: state.maxB, meHp: Math.max(state.A.hp, 0), oppHp: Math.max(state.B.hp, 0) } }

// 자동 전투(밸런스 시뮬/관전용): 양쪽 AI
function runBattle (meName, oppName, meAI, oppAI) {
  const state = initBattle(meName, oppName, oppAI); state.A.ai = meAI
  const { A, B, dA, dB } = state; const DT = 0.1
  while (A.hp > 0 && B.hp > 0 && state.t < 600) {
    A.gauge -= DT; B.gauge -= DT; state.t += DT
    if (A.gauge <= 0) { A.gauge = resetGauge(A, dA); recEntry(state, 'me', aiTurn(A, B, dA, dB)); if (reviveCheck(B, dB)) reviveRec(state, 'opp') }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = resetGauge(B, dB); recEntry(state, 'opp', aiTurn(B, A, dB, dA)); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  }
  state.winner = state.t >= 600 ? 'draw' : (A.hp > 0 ? 'me' : 'opp')
  return stateResult(state)
}
// 인터랙티브: 플레이어 턴까지 진행. 'player'(선택 대기) | 'end'
function advance (state) {
  const { A, B, dA, dB } = state; const DT = 0.1
  while (A.hp > 0 && B.hp > 0 && state.t < 600) {
    A.gauge -= DT; B.gauge -= DT; state.t += DT
    if (A.gauge <= 0) {
      A.gauge = resetGauge(A, dA)
      const forced = upkeep(A, B, dA, dB)
      if (forced) { recEntry(state, 'me', forced); if (reviveCheck(B, dB)) reviveRec(state, 'opp'); if (B.hp <= 0) break; continue }
      return 'player' // 플레이어 upkeep 완료, 행동 선택 대기
    }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = resetGauge(B, dB); recEntry(state, 'opp', aiTurn(B, A, dB, dA)); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  }
  state.winner = state.t >= 600 ? 'draw' : (A.hp > 0 ? 'me' : 'opp')
  return 'end'
}
// 플레이어 행동 실행 후 다음 플레이어 턴까지 진행
const PASSIVES = { 기사: { name: '가시방패', desc: '받는 피해 12% 반사(상시)' }, 세이지: { name: '원소스택', desc: '3타마다 원소폭발 ×1.3' } }
function playerResolve (state, choice) {
  const { A, B, dA, dB } = state
  let ev
  if (choice === 'defend') ev = execDefend(A, dA)
  else if (/^s\d+$/.test(choice)) {
    const slot = parseInt(choice.slice(1), 10)
    ev = playerCanUse(state, slot).usable ? execSkill(A, B, dA, dB, SKILLS[state.meName][slot]) : execAttack(A, B, dA, dB)
  } else ev = execAttack(A, B, dA, dB)
  recEntry(state, 'me', ev); if (reviveCheck(B, dB)) reviveRec(state, 'opp')
  if (B.hp <= 0) { state.winner = 'me'; return 'end' }
  return advance(state)
}
// 플레이어 스킬 사용 가능 판정(AI 자제 휴리스틱 제외, 진짜 게이트만)
function playerCanUse (state, slot) {
  const { A, B, dB } = state; const name = SKILLS[state.meName][slot].name
  if (A.silence > 0) return { usable: false, reason: '침묵' }
  if (A.cd[slot] > 0) return { usable: false, reason: `${A.cd[slot]}턴 후` }
  if (name === '처형' && !(B.hp < dB.maxhp * 0.25)) return { usable: false, reason: '상대 HP 25%↓ 필요' }
  if ((name === '암습' || name === '돌진') && B.stun > 0) return { usable: false, reason: '상대 기절 중' }
  if ((name === '파이어볼' || name === '메테오' || name === '볼트임팩트') && A.cast > 0) return { usable: false, reason: '시전 중' }
  if (name === '인스턴트캐스팅' && A.instCast > 0) return { usable: false, reason: '즉시시전 중' }
  if (name === '방패들기' && A.blockUp > 0) return { usable: false, reason: '유지 중' }
  if ((name === '인챈트' || name === '피의각성') && A.powBuff > 0) return { usable: false, reason: '유지 중' }
  if (name === '백스텝' && A.dodgeUp > 0) return { usable: false, reason: '유지 중' }
  if (name === '마법반사' && A.magReflect > 0) return { usable: false, reason: '유지 중' }
  if (name === '오토스펠' && A.autoSpell > 1) return { usable: false, reason: '유지 중' }
  // 버프 유지 중엔 재사용 방지(직관적 비활성 + 낭비 방지)
  if (name === '광폭화' && A.rage > 0) return { usable: false, reason: '광폭 중' }
  if (name === '행운폭발' && A.luckBuff > 0) return { usable: false, reason: '폭발 중' }
  if (name === '연쇄주문' && A.chainBolt > 1) return { usable: false, reason: '유지 중' }
  return { usable: true }
}
function playerOptions (state) {
  const { A, meName } = state; const sks = SKILLS[meName]
  const one = (slot) => { const u = playerCanUse(state, slot); return { name: sks[slot].name, base: SKILL_CD[sks[slot].name], usable: u.usable, reason: u.reason } }
  return { canDefend: A.noDefend === 0, skills: sks.map((_, i) => one(i)), passive: PASSIVES[meName] || null }
}

// ── UI + 내레이션 ──
const BAR = 12
function hpBar (cur, max) {
  cur = Math.max(0, Math.round(cur))
  const pct = Math.max(0, Math.min(1, cur / max))
  const fill = Math.round(pct * BAR)
  return '█'.repeat(fill) + '░'.repeat(BAR - fill) + ` ${cur}/${max} (${Math.round(pct * 100)}%)`
}
// 한글 받침 판별 → 조사 자동 선택
function hasBatchim (w) { if (!w) return false; const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return false; return (c - 0xac00) % 28 !== 0 }
const iga = (w) => hasBatchim(w) ? '이' : '가'
const eun = (w) => hasBatchim(w) ? '은' : '는'
const eul = (w) => hasBatchim(w) ? '을' : '를'
function preview (name) {
  const c = CHARS[name]; const w = WEAPONS[c.무기] || {}
  return {
    hp: maxHp(c),
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    // 턴: 무기 반영(마법=지능파생, tempoMul) — derive와 동일 공식
    턴: Math.round(Math.max((10 - step(w.magicTempo ? c.지능 : c.민첩, 0.7)) * (w.tempoMul || 1), 2) * 10) / 10
  }
}
function randomMatch (me) { return { opp: pickArr(NAMES.filter(n => n !== me)), ai: pickArr(AIS) } }

function buildSelectEmbed () {
  return new EmbedBuilder()
    .setTitle('⚔️ 듀얼 — 캐릭터 선택')
    .setDescription('캐릭터를 골라줘! 상대와 상대 성향(AI)은 랜덤으로 정해져~')
    .setColor(0x5865f2)
    .addFields(NAMES.map(n => ({ name: `${CHARS[n].emoji} ${n}`, value: `${CHARS[n].id}\n${wpnLabel(CHARS[n].무기)}`, inline: true })))
}
function buildSelectRows (memberId) {
  const id = (char) => JSON.stringify({ action: 'duel', op: 'pick', char, memberId })
  const btn = (char) => new ButtonBuilder().setCustomId(id(char)).setLabel(`${CHARS[char].emoji} ${char}`).setStyle(ButtonStyle.Secondary)
  const rows = []
  for (let i = 0; i < NAMES.length; i += 5) rows.push(new ActionRowBuilder().addComponents(NAMES.slice(i, i + 5).map(btn)))
  return rows
}
function fighterBlock (name, tail) {
  const c = CHARS[name]; const p = preview(name)
  return `${c.emoji} **${name}** ${tail}\n${c.id} · ${wpnLabel(c.무기)}\n힘 ${c.힘}·지능 ${c.지능}·체력 ${c.체력}·민첩 ${c.민첩}·솜씨 ${c.솜씨}·행운 ${c.행운}\nHP ${p.hp} · 물공 ${p.물공} · 마공 ${p.마공} · 턴 ${p.턴}초`
}
function buildMatchupEmbed (me, opp, ai, memberId) {
  return new EmbedBuilder()
    .setTitle('⚔️ 매치업 성립!')
    .setColor(0xe67e22)
    .setDescription(
      `${fighterBlock(me, `<@${memberId}>`)}\n📜 **내 스킬**\n${skillsBlock(me)}\n\n` +
      `${fighterBlock(opp, `· ${ai} AI`)}\n🆚 **상대 스킬**\n${skillsBlock(opp)}`)
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

// 이벤트 → 자연스러운 RPG 로그 한 줄
function narrateLine (ev, meName, oppName) {
  const A = ev.who === 'me' ? meName : oppName
  const T = ev.who === 'me' ? oppName : meName
  const ae = CHARS[A].emoji, te = CHARS[T].emoji
  const hurt = (n) => `${te} **${T}**${eun(T)} **${Math.round(n)}**의 피해를 입었다.`
  // 피해 내역: 세이지 혼합(물/마) · 완드 연쇄볼트(발당) · 기본
  const hurtBd = () => {
    if (ev.ph != null) return `${te} **${T}**${eun(T)} 물리 **${ev.ph}** + 마법 **${ev.mg}** (총 **${ev.dmg}**)의 피해를 입었다.`
    if (ev.boltHits && ev.boltHits.length > 1) { const parts = ev.boltHits.map((h, i) => `${(ev.boltNames && ev.boltNames[i]) || '볼트'} **${h}**`).join(' + '); return `${te} **${T}**${eun(T)} ${parts} (총 **${ev.dmg}**)의 피해를 입었다.` }
    return hurt(ev.dmg)
  }
  const boltTag = ev.boltName ? `✨**${ev.boltName}** 발동! ` : ''
  // 방어 성공(피해는 일부 들어간 경우) 태그
  const defTag = (ev.def === '방패막기' || ev.def === '무기막기') ? ` 🛡️*${T} ${ev.def}!*` : ''
  const brokeTag = ev.broke ? ` ⚡**${T} 시전 중단!**` : ''   // 피격으로 상대 시전 취소
  // 완전 무피해: 회피/천운/빗나감 구분
  const evadeLine = () => {
    if (ev.def === '회피') return `💨 ${te} **${T}**${iga(T)} ${ae} **${A}**의 공격을 날렵하게 회피했다!`
    if (ev.def === '천운' || ev.def === '완전회피') return `🍀 ${te} **${T}**${iga(T)} 천운으로 ${ae} **${A}**의 일격을 흘려냈다!`
    return `💨 ${ae} **${A}**의 공격이 빗나갔다. ${te} **${T}**${eun(T)} 피해를 입지 않았다.`
  }
  switch (ev.type) {
    case 'attack':
      if (ev.dmg <= 0) return evadeLine()
      if (ev.crit) return `💥 ${ae} **${A}**의 ${ev.ph != null ? '혼합 ' : ''}공격이 치명타로 적중! ${boltTag}${hurtBd()}${defTag}${brokeTag}`
      return `${ev.ph != null ? '⚔️' : (ev.bolt ? '✨' : '⚔️')} ${ae} **${A}**의 ${ev.ph != null ? '혼합 공격' : '공격'}! ${boltTag}${hurtBd()}${defTag}${brokeTag}`
    case 'skill': {
      const head = `⚡ ${ae} **${A}**${iga(A)} '${ev.name}'${eul(ev.name)} 사용!${ev.note ? ` [${ev.note}]` : ''}`
      { const back = ev.selfDmg > 0 ? ` (**${A}**도 반동으로 **${ev.selfDmg}** 피해)` : ''
        if (ev.dmg > 0) return `${head} ${ev.crit ? '치명타! ' : ''}${boltTag}${hurtBd()}${defTag}${brokeTag}${back}`
        if (ev.name === '파이어볼') return head // 시전 시작(딜 없음)
        if (!ev.attacked) return `${head}${back}` // 공격 안 하는 버프/방어 스킬(마력충전 등) → 미스 문구 없이
        const miss = ev.def === '회피' ? `하지만 ${T}${iga(T)} 회피했다 💨` : (ev.def === '천운' || ev.def === '완전회피') ? `하지만 ${T}${iga(T)} 천운으로 흘렸다 🍀` : '하지만 공격은 빗나갔다 💨'
        return `${head} ${miss}${back}` }
    }
    case 'defend': return `🛡️ ${ae} **${A}**${eun(A)} 방어 태세!${ev.heal > 0 ? ` 체력을 **${ev.heal}** 회복` : ''} (HP ${ev.selfHp}/${ev.selfMax})`
    case 'stun': return `😵 ${ae} **${A}**${eun(A)} 기절해 움직이지 못한다.`
    case 'cast': return `🔮 ${ae} **${A}**${iga(A)} ${ev.spell || '파이어볼'}${eul(ev.spell || '파이어볼')} 시전하고 있다…`
    case 'castfire': { const sp = ev.spell || '파이어볼'; return ev.dmg > 0 ? `☄️ ${ae} **${A}**의 ${sp}${iga(sp)} 작렬! ${hurt(ev.dmg)}` : `🍀 ${te} **${T}**${iga(T)} ${ae} **${A}**의 ${sp}${eul(sp)} 천운으로 흘려냈다!` }
    case 'revive': return `✨ ${ae} **${A}**${eun(A)} 불굴의 의지로 다시 일어섰다!`
    default: return `${ae} **${A}**…`
  }
}
function buildResultEmbed (res, meName, oppName, memberId, oppAI) {
  const lines = res.log.map(ev => narrateLine(ev, meName, oppName, memberId, oppAI))
  let body
  if (lines.length > 26) body = lines.slice(0, 10).concat(['', `⋯ *(중략 ${lines.length - 22}턴)* ⋯`, ''], lines.slice(-12)).join('\n')
  else body = lines.join('\n')

  const meHead = `${CHARS[meName].emoji} **${meName}**: ${titleTag(res.meTitle)} <@${memberId}>`
  const oppHead = `${CHARS[oppName].emoji} **${oppName}**: ${titleTag(res.oppTitle)} **${res.oppNick}** · ${oppAI} AI`
  let banner
  if (res.winner === 'draw') banner = '⏳ **무승부!** 시간 초과로 승부가 나지 않았다…'
  else if (res.winner === 'me') banner = `🏆 **승리!** ${CHARS[meName].emoji} **${meName}** '*${res.meTitle}*' <@${memberId}> 님의 승리!`
  else banner = `💀 **패배…** ${CHARS[oppName].emoji} **${oppName}** '*${res.oppTitle}*' **${res.oppNick}**의 승리…`

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

// ── 인터랙티브 전투 UI + 세션 ──
const SESSIONS = new Map() // messageId -> { state, me, opp, ai, memberId, ts }
function sweepSessions () { const now = Date.now(); for (const [k, v] of SESSIONS) if (now - v.ts > 1800000) SESSIONS.delete(k) }
function statusTags (f) {
  const t = []
  // 디버프
  if (f.stun > 0) t.push(`😵기절${f.stun}`)
  if (f.slow > 0) t.push('🐢둔화')
  if (f.silence > 0) t.push('🔇침묵')
  if (f.luckLock > 0) t.push('🍀봉인')
  if (f.blind > 0) t.push('🌀실명')
  if (f.noDefend > 0) t.push('🚫방어불가')
  if (f.healBlock > 0) t.push('💔회복불가')
  if (f.missDown > 0) t.push('🎯명중↓')
  if (f.sunder > 0) t.push('💢방어약화')
  if (f.vuln > 0) t.push('💥취약')
  // 버프
  if (f.rage > 0) t.push('🔥광폭')
  if (f.powBuff > 0) t.push('💪공격강화')
  if (f.blockUp > 0) t.push('🛡️방패강화')
  if (f.thornsBase > 0) t.push('🌵가시')
  if (f.dodgeUp > 0) t.push('🌀회피')
  if (f.magReflect > 0) t.push('🔮마법반사')
  if (f.elemStack > 0) t.push('🔥원소'+f.elemStack)
  if (f.luckBuff > 0) t.push('✨행운폭발')
  if (f.chainBolt > 0) t.push('🔗연쇄주문')
  if (f.autoSpell > 0) t.push('📜주문각인')
  if (f.healRegen > 0) t.push('💚재생')
  if (f.cast > 0) t.push(`🔮${f.castName || '시전'}${f.cast}`)
  if (f.instCast > 0) t.push(`⚡즉시시전${f.instCast}`)
  if (f.shield > 0) t.push(`🔷실드${f.shield}`)
  return t.join(' ')
}
function buildBattleEmbed (state) {
  const { A, B, meName, oppName, memberId, meTitle, oppTitle, oppAI, oppNick } = state
  const recent = state.log.slice(-8).map(ev => narrateLine(ev, meName, oppName))
  const meS = statusTags(A), oppS = statusTags(B)
  const desc =
    `${CHARS[meName].emoji} **${meName}**: ${titleTag(meTitle)} <@${memberId}>${meS ? ' · ' + meS : ''}\n` +
    `\`${hpBar(A.hp, state.maxA)}\`\n` +
    `${CHARS[oppName].emoji} **${oppName}**: ${titleTag(oppTitle)} **${oppNick}**${oppS ? ' · ' + oppS : ''} · ${oppAI} AI\n` +
    `\`${hpBar(B.hp, state.maxB)}\`\n\n` +
    (recent.length ? recent.join('\n') + '\n\n' : '') +
    '🎯 **네 차례!** 행동을 골라줘'
  return new EmbedBuilder().setTitle('⚔️ 듀얼 — 전투 중').setColor(0x3498db)
    .setDescription(desc.length > 4090 ? '…' + desc.slice(-4089) : desc)
}
function buildBattleRow (state) {
  const o = playerOptions(state); const mid = state.memberId
  const cid = (c) => JSON.stringify({ action: 'duel', op: 'act', c, memberId: mid })
  const skLbl = (s) => s.usable
    ? `✨ ${s.name}${typeof s.base === 'number' ? ` (쿨${s.base})` : ''}`
    : `${s.name} · ${s.reason}`
  const btns = [
    new ButtonBuilder().setCustomId(cid('attack')).setLabel('⚔️ 공격').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(cid('defend')).setLabel(o.canDefend ? '🛡️ 방어' : '🛡️ 방어 · 봉쇄').setStyle(ButtonStyle.Secondary).setDisabled(!o.canDefend)
  ]
  o.skills.forEach((sk, i) => btns.push(new ButtonBuilder().setCustomId(cid('s' + i)).setLabel(skLbl(sk)).setStyle(ButtonStyle.Primary).setDisabled(!sk.usable)))
  if (o.passive && btns.length < 5) btns.push(new ButtonBuilder().setCustomId(cid('passive')).setLabel(`🔒 ${o.passive.name}(패시브)`).setStyle(ButtonStyle.Secondary).setDisabled(true))
  return new ActionRowBuilder().addComponents(btns.slice(0, 5))
}

async function handleButton (interaction, info) {
  if (interaction.user.id !== info.memberId) {
    await interaction.reply({ content: '이건 다른 사람의 듀얼이야~ `/듀얼`로 직접 시작해봐! ⚔️', ephemeral: true })
    return
  }
  const mid = info.memberId
  if (info.op === 'pick' || info.op === 'reroll') {
    const me = info.char; const { opp, ai } = randomMatch(me)
    await interaction.update({ embeds: [buildMatchupEmbed(me, opp, ai, mid)], components: [buildMatchupRow(me, opp, ai, mid)] })
  } else if (info.op === 'back') {
    SESSIONS.delete(interaction.message.id)
    await interaction.update({ embeds: [buildSelectEmbed()], components: buildSelectRows(mid) })
  } else if (info.op === 'go') {
    sweepSessions()
    const state = initBattle(info.me, info.opp, info.ai); state.memberId = mid
    const phase = advance(state)
    if (phase === 'end') {
      SESSIONS.delete(interaction.message.id)
      await interaction.update({ embeds: [buildResultEmbed(stateResult(state), info.me, info.opp, mid, info.ai)], components: [buildResultRow(info.me, info.opp, info.ai, mid)] })
    } else {
      SESSIONS.set(interaction.message.id, { state, me: info.me, opp: info.opp, ai: info.ai, memberId: mid, ts: Date.now() })
      await interaction.update({ embeds: [buildBattleEmbed(state)], components: [buildBattleRow(state)] })
    }
  } else if (info.op === 'act') {
    const sess = SESSIONS.get(interaction.message.id)
    if (!sess) { await interaction.reply({ content: '전투 정보가 만료됐어~ `/듀얼`로 다시 시작해줘! ⚔️', ephemeral: true }); return }
    sess.ts = Date.now()
    const phase = playerResolve(sess.state, info.c)
    if (phase === 'end') {
      SESSIONS.delete(interaction.message.id)
      await interaction.update({ embeds: [buildResultEmbed(stateResult(sess.state), sess.me, sess.opp, mid, sess.ai)], components: [buildResultRow(sess.me, sess.opp, sess.ai, mid)] })
    } else {
      await interaction.update({ embeds: [buildBattleEmbed(sess.state)], components: [buildBattleRow(sess.state)] })
    }
  }
}

function _tune (o) { Object.assign(TUNE, o) }
module.exports = { CHARS, NAMES, AIS, TITLES, TUNE, _tune, runBattle, buildSelectEmbed, buildSelectRows, handleButton, SKILLS, CUSTOM_DEFS }

