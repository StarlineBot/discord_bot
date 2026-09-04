// 듀얼 — 턴제 전투 게임 (설계: docs/battle-game-design.md / 밸런스: docs/battle-sim/battle-sim-latest.js)
// /듀얼 → 캐릭 선택 → 랜덤 상대+AI 매치업 → 전투 시작 시 타이틀 부여 + 자동 전투 + 극적 내레이션.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const rand = () => Math.random()
const step = (s, per) => Math.floor(s / 10) * per
const pickArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

const CHARS = {
  전사: { emoji: '⚔️', 힘: 85, 지능: 10, 체력: 75, 민첩: 45, 솜씨: 60, 행운: 30, 무기: '검방', id: '물리 딜탱' },
  광전사: { emoji: '🪓', 힘: 100, 지능: 10, 체력: 45, 민첩: 55, 솜씨: 60, 행운: 45, 무기: '양도끼', 불굴: true, 광란: true, id: '물리 유리대포' },
  기사: { emoji: '🛡', 힘: 60, 지능: 10, 체력: 100, 민첩: 35, 솜씨: 68, 행운: 30, 무기: '검방', 완벽방어: true, id: '순수 탱커' },
  마법사: { emoji: '🔮', 힘: 10, 지능: 100, 체력: 60, 민첩: 30, 솜씨: 50, 행운: 45, 무기: '스태프', id: '스태프 마법사' },
  볼트마법사: { emoji: '✨', 힘: 10, 지능: 90, 체력: 50, 민첩: 55, 솜씨: 50, 행운: 45, 무기: '완드', boltMaster: true, id: '볼트 마법사' },
  암살자: { emoji: '🗡', 힘: 45, 지능: 15, 체력: 40, 민첩: 100, 솜씨: 55, 행운: 55, 무기: '단검', 연속타격: true, id: '스피드/회피/암살' },
  사냥꾼: { emoji: '🏹', 힘: 55, 지능: 15, 체력: 45, 민첩: 55, 솜씨: 100, 행운: 40, 무기: '활', id: '저격/덫/카이팅' },
  한탕주의자: { emoji: '🃏', 힘: 25, 지능: 20, 체력: 40, 민첩: 85, 솜씨: 35, 행운: 100, 무기: '주사위', 행운의여신: true, id: '고속 도박' },
  세이지: { emoji: '📖', 힘: 60, 지능: 65, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, 무기: '마도서', 원소: true, 현자균형: true, id: '혼합 하이브리드' },
  스펠블레이드: { emoji: '⚡', 힘: 65, 지능: 60, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, 무기: '검오브', id: '혼합 관통 스펠블레이드' },
  스펠브레이커: { emoji: '🪄', 힘: 30, 지능: 80, 체력: 65, 민첩: 50, 솜씨: 45, 행운: 30, 무기: '마도검', 마도갑주: 0.12, id: '안티캐스터 마딜' }
}
// 무기 정의: 캐릭은 CHARS.무기로 참조, derive()가 속성 병합.
// 계열(물리/마법)=스킬풀·조직 / 평타(물리/마법/혼합/융합)=엔진 공격분기 / range=근접·원거리(태그)
// 물리·하이브리드 무기는 현재 스텁(수치 보정 기본값=불변) → 효과는 차차. 스태프·완드만 활성.
const WEAPONS = {
  // 한손 근접=기본배수·속도불변 / 양손(대검류)=평타↑·20%느림 / 쌍검=듀얼(속도불변, 다단) / 활=원거리(공격자 턴+30%)
  검방: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 기본공: 1.0, tempoMul: 1.0, 받는뎀: 0.10, 방어: '방패' },
  단검: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 기본공: 0.68, tempoMul: 1.0, 크리보너스: 0.15, 크리배율: 1.9, 회피보너스: 0.10, 방어: '패링' },
  쌍검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 0.6, tempoMul: 1.0, 다단: 2, 방어: '패링' },
  양검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.25, tempoMul: 1.25, 방어: '무기막기' },
  양둔: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.2, tempoMul: 1.25, 스턴확률: 0.2, 방어: '무기막기' },
  양도끼: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.4, tempoMul: 1.25, 관통: 0.3, 방어: '무기막기' },
  활: { 계열: '물리', 평타: '물리', range: '원거리', hands: 2, 기본공: 1.05, tempoMul: 1.0, 크리배율: 2.5, 회피보너스: 0.05, 원거리페널티: 0.4, 방어: '회피' },
  스태프: { 계열: '마법', 평타: '마법', range: '원거리', hands: 2, tempoStat: '지능', tempoMul: 1.65, 평타계수: 0.55, castMod: -2, 원거리페널티: 0.35, 방어: '마나실드' },
  완드: { 계열: '마법', 평타: '마법', range: '원거리', hands: 1, tempoStat: '지능', tempoMul: 0.75, 평타계수: 0.9, 마뎀너프: 0.66, 원거리페널티: 0.15, 방어: '마나실드' },
  마도서: { 계열: '마법', 평타: '혼합', range: '근접', hands: 2, tempoStat: '힘지능', tempoMul: 1.08, 물타: 1.1, 크리배율: 1.9, 방어: '무기막기' },
  검오브: { 계열: '마법', 평타: '혼합', range: '근접', hands: 1, tempoStat: '힘지능', tempoMul: 1.08, 물타: 0.87, 마타: 0.87, 크리배율: 1.9, 방어: '무기막기' },   // 스펠블레이드: 물리스윙 + 마법 혼합(각자 방어 상대)
  마도검: { 계열: '마법', 평타: '마법', range: '근접', hands: 1, tempoStat: '지능', tempoMul: 0.95, 마방보너스: 0.15, 방어: '무기막기' },
  주사위: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 기본공: 1.0, tempoMul: 1.0, 주사위: true, 방어: '주사위' }   // 한탕 전용 d20: 공격/방어에 주사위 굴림(1=대실패, 20=대성공). 크리는 기본 시스템
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
  전사: [3, 5], 광전사: [3, 5], 기사: [3, 5], 마법사: [3, 6], 암살자: [6, 5],
  사냥꾼: [4, 4], 스펠블레이드: [3, 5], 세이지: [3, 4], 한탕주의자: [3, 3]
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
  { name: '은밀한', d: d => { d.물크기본 += 0.6; d.마크기본 += 0.6 } },
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
  은밀한: '크리배율+0.6', 날렵한: '물리회피+10%p', 질풍의: '턴주기-15%', 거인: '최대HP+12%',
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
// 턴 파생 스탯 = 무기 tempoStat (기본 민첩). 스태프/완드/마도검='지능', 검오브/마도서='힘지능'.
// 검오브·마도서는 힘+지능 몰빵 근접 하이브리드라 민첩-템포에선 구조적으로 느려짐 → max(힘,지능)로 파생
function tempoVal (w, c) { return w.tempoStat === '지능' ? c.지능 : w.tempoStat === '힘지능' ? Math.max(c.힘, c.지능) : c.민첩 }
function derive (c) {
  const w = WEAPONS[c.무기] || {}
  return {
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100) * (c.체력 === 100 && w.hands === 1 ? 1.3 : 1) * (c.솜씨 === 100 && c.무기 === '활' ? 1.05 : 1) * (c.행운 === 100 && c.무기 === '주사위' ? 1.2 : 1)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    물방: Math.min((step(c.힘, 3) + step(c.체력, 1)) / 100 + (w.물방보너스 || 0) + (c.마도갑주 || 0), 0.80), 마방: Math.min(Math.min(30 + step(c.지능, 3), 70) / 100 + (w.마방보너스 || 0), 0.85),
    maxhp: maxHp(c),
    명중: Math.min(35 + step(c.솜씨, 5), c.솜씨 === 100 ? 90 : 80) / 100, 물회: Math.min(10 + step(c.민첩, 1.8), 50) / 100 + (w.회피보너스 || 0), 마회: step(c.민첩, 2) / 100,
    sigPen: c.힘 === 100, sigDodge: c.행운 === 100, sigTank: c.체력 === 100, sigEcho: c.민첩 === 100, sigEye: c.지능 === 100, sigAim: c.솜씨 === 100, base: c,
    hybrid: (c.무기 === '마도서' || c.무기 === '검오브'),   // 혼합 스윙(물리판정) — 세이지(마도서)·마검사(검오브)
    fusion: false,   // 융합 폐기 → 마검사도 혼합(물리 vs 물방 + 마법 vs 마방)
    크리: Math.min(10 + step(c.솜씨, 1) + step(c.행운, 3.5) + (w.크리보너스 || 0) * 100, 70) / 100, 리롤: Math.min(step(c.행운, 1.5), 50) / 100, 천운: step(c.행운, 1.5) / 100,
    근성: step(c.체력, 4) / 100,
    현자균형: c.현자균형 ? Math.min(step(Math.min(c.힘, c.지능), 2.5), 16) / 100 : 0,   // 현자의 균형(패시브): 힘·지능 듀얼스탯(min) 기반 피해감소. 하이브리드만 강함(세이지 min60=15%, 순수빌드 min≤15→0~2%). 커스텀 상정 안전
    방패밀쳐내기: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 0.5 + c.체력 * 1.8 + (step(c.힘, 3) + step(c.체력, 1)) * 2),
    힘절반: Math.round(c.힘 / 2), 돌진딜: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 1.5),
    회복: Math.min(10 + step(c.체력, 1), 30),
    물크기본: 1.5, 마크기본: 1.2, 크랜폭: step(c.행운, 0.15) * 2, 비껴무효: step(c.행운, 3) / 100,
    // 턴속도: tempoVal(민첩/지능/max(힘,지능)) 파생. 무기 tempoMul로 스태프↔완드 완속 차이.
    턴: Math.max((10 - step(tempoVal(w, c), 0.7)) * (w.tempoMul || 1), 2),
    평타계수: w.평타계수 || 1, 마뎀너프: w.마뎀너프 || 1, 기본공: w.기본공 || 1, 무기: w,
    무기막기: c.힘 >= 50 ? (30 + Math.floor((c.힘 - 50) / 10) * 2) / 100 : 0,
    // 방패막기는 검/방(방패) 무기 전용. 무기막기는 스탯기반 유지(무기무관)
    방패막기: (w.방어 === '방패' && c.체력 >= 50) ? (30 + Math.floor((c.체력 - 50) / 10) * 3) / 100 : 0,
    방패고정: (w.방어 === '방패' && c.체력 >= 70) ? c.체력 / 3 : 0,
    마나경감: c.지능 >= 70 ? (10 + ((c.지능 - 70) / 10) * 2) / 100 : 0
  }
}
function luckRoll (s, ls, p) { if (s) return true; if (ls.used) return false; if (rand() < p) { ls.used = true; return true } return false }
function gutsMul (d, hp, df) { const coat = 1 - (df.현자균형 || 0); const p = hp / df.maxhp; if (p >= 0.5) return coat; return coat * (1 - df.근성 * ((0.5 - p) / 0.5)) }
// 방어 적용(관통 통합): 방어 × (1 − 관통) 만큼만 감소. 관통 0=방어 전부, 1=방어무시(역장)
function defMul (def, pen) { return 1 - def * (1 - Math.min(pen || 0, 1)) }
function attack (A, D, dA, dD, defending, guaranteed, forceCrit) {
  const magic = dA.마공 > dA.물공
  const ls = { used: false }, lsD = { used: false }
  let dmg, 고정 = 0
  // 관통값 통합: 물리=힘100시그(0.30)+무기관통 / 마법=심연의(0.25). (기존 sigPen·tMPen·무기.관통과 동치)
  const 물관통 = 1 - (dA.sigPen ? 0.7 : 1) * (1 - (dA.무기.관통 || 0))
  const 마관통 = A.tMPen ? 0.25 : 0
  A.hitPh = null; A.hitMg = null; A.boltName = null; A.boltHits = null; A.boltNames = null; A.boltShots = 0; A.boltCombo = 0; A._braw = null; A._bnames = null; A.lastDef = null; A.didAttack = true; A.brokeCast = false; A.lastElem = false; A.lastRefl = null; A.grazed = false; A.diceAtk = 0; A.diceDef = 0   // 혼합 내역 + 볼트명 + 연쇄볼트 발당 + 방어판정 + 공격시도 + 시전중단 표식 + 빗맞음 + 주사위
  // 기절 중엔 능동 방어(회피·천운·방패막기·무기막기·패링) 봉쇄. 빗맞힘(공격자 실수)·마나실드·반사·근성은 수동이라 유지
  const canDef = D.stun === 0 && D.cast === 0   // 기절 또는 시전 중엔 능동 방어(회피·천운·막기·주사위방어) 불가. 마나실드·반사·근성은 유지
  if (D.행운의여신 && rand() < D.행운의여신) { A.lastDef = '행운의여신'; return 1 }   // 한탕 패시브: 타입 무관 확률적 피해 1(운빨 방어)
  const aimPierce = dA.sigAim && rand() < 0.15   // 솜씨100 시그(정밀사격): 30% 확률로 상대 회피 무효
  if (canDef && !aimPierce && dD.sigDodge && !dA.hybrid && rand() < 0.15) { A.lastDef = '완전회피'; return 0 }
  if (dA.hybrid) {
    // 본 공격 회피 판정(천운/리롤) — 볼트는 별개로 무조건 명중
    const evaded = canDef && ((dD.sigDodge && rand() < 0.15) || luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤)))
    let bolt = 0, pendingAmp = 0
    if (A.autoSpell > 0 && rand() < 0.90) {   // 볼트: 마법이라 발동 시 회피 무관 명중. 오토스펠 켜면 거의 확정 발동(0.90), 1~5연타 랜덤(5=10%), 발당 감쇠(0.5)
      const n = rollBoltCount(); const mdef = defMul(dD.마방, 마관통); const braw = []; const bnames = []
      const types = ['파이어볼트', '아이스볼트', '라이트닝볼트']
      const bn = types[Math.floor(rand() * 3)]                      // 프록당 원소 1종(원소당) — 원소 조합은 볼트마법조합 스킬 전용
      pendingAmp = BOLT_AMP[bn]
      for (let i = 0; i < n; i++) {
        const bb = boltDmg(dA, A, bn, mdef, SAGE_BOLT)              // 공통 볼트 공식 + 세이지 전용 배율
        bolt += bb; braw.push(bb); bnames.push(bn)
      }
      A.lastBolt = true; A.boltShots = n; A._braw = braw; A._bnames = bnames
    }
    let ph = 0, mg = 0, crit = false; 고정 = 0
    if (!evaded) {
      let block = 0
      if (canDef && dD.방패막기 && rand() < dD.방패막기) { block = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' }
      const wBlk = (canDef && !block && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) ? 0.50 : 1
      if (wBlk < 1) A.lastDef = '무기막기'
      crit = forceCrit || luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
      if (A.echoReady) { crit = true; A.echoReady = 0 }
      const cP = crit ? ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1) : 1
      const cM = crit ? ((dA.무기.크리배율 || dA.마크기본) + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1) : 1
      ph = dA.물공 * (dA.무기.물타 || 1.1) * (block ? block : wBlk) * defMul(dD.물방, 물관통) * cP   // 물리 스윙(물리판정)
      mg = dA.무기.마타 ? dA.마공 * dA.무기.마타 * (block ? block : 1) * defMul(dD.마방, 마관통) * cM : 0   // 검오브(마검사)=마법 혼합 / 마도서(세이지)=0(볼트로 대체)
    }
    if (evaded && bolt <= 0) { A.lastDef = '회피'; return 0 }   // 완전회피 + 볼트 미발동 → 무피해
    let d = ph + mg + bolt - 고정
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) { d *= 0.70; A.grazed = true }
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (D.cast > 0) d *= 0.6
    if (A.nextAmp) { d *= A.nextAmp; A.nextAmp = 0 }
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (A.powBuff > 0) d *= A.powMul
    if (A.weaponBroken > 0) d *= (1 / 3)   // 무기파괴: 기초딜 1/3
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (dD.무기.받는뎀) d *= (1 - dD.무기.받는뎀)
    if (crit) A.lastCrit = true
    // 원소 스택(세이지 패시브): 공격마다 1스택, 3스택째 폭발(×1.5) + 리셋
    if (A.원소) { if (A.elemStack >= 2) { d *= 1.3; A.elemStack = 0; A.lastElem = true } else { A.elemStack++; A.lastElem = false } }
    const fin = Math.max(Math.round(d), 1)
    // 내역(내레이션용, raw 비율 저장 → narration서 ev.dmg에 재배분): ph=물리 / mg=마법평타 / 볼트=오토스펠 다연타(별도)
    if (ph + mg + bolt > 0) { A.hitPh = ph; A.hitMg = mg }
    if (A._braw && A._braw.length) { A.boltHits = A._braw.slice(); A.boltNames = A._bnames }
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    if (pendingAmp) A.nextAmp = pendingAmp
    return perfectGuard(A, D, fin)
  }
  if (dA.fusion) {
    if (canDef && !aimPierce && !guaranteed && luckRoll(rand() < dD.물회 * (A.accBuff > 0 ? 0.35 : 1) + (D.dodgeUp > 0 ? 0.4 : 0), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 }
    let d = dA.물공 + dA.마공; 고정 = 0
    if (canDef && dD.방패막기 && rand() < dD.방패막기) { d *= (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' } else if (canDef && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) { d *= 0.50; A.lastDef = '무기막기' }
    d *= (1 - Math.max(dD.물방 * (dA.sigPen ? 0.7 : 1), dD.마방))
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) { d *= 0.70; A.grazed = true }
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
    if (A.weaponBroken > 0) d *= (1 / 3)   // 무기파괴: 기초딜 1/3
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (dD.무기.받는뎀) d *= (1 - dD.무기.받는뎀)
    const fin = Math.max(Math.round(d), 1)
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    return perfectGuard(A, D, fin)
  }
  if (!magic) {
    // 활(원거리): 근접 공격자가 나를 때리면 자기 다음 턴 지연(거리 비용, 공격자 턴 %)
    if (dD.무기.원거리페널티 && dA.무기.range === '근접') A.gauge += dA.턴 * dD.무기.원거리페널티
    if (!guaranteed && !luckRoll(rand() < (dA.명중 - (A.missDown > 0 ? 0.2 : 0) - (A.blind > 0 ? 0.3 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))) return 0
    if (canDef && !aimPierce && !guaranteed && luckRoll(rand() < dD.물회 * (A.accBuff > 0 ? 0.35 : 1) + (D.dodgeUp > 0 ? 0.4 : 0), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 }
    const baseHits = dA.무기.다단 || 1; const hits = baseHits + (A.연속타격 && rand() < 0.20 ? 1 : 0)   // 쌍검 2연타 / 암살자 연속타격 패시브: 20% 확률 추가타(크리 안 터짐)
    const atkD = dA.무기.주사위 ? d20adv(A.diceAdv > 0) : 0; if (atkD) A.diceAtk = atkD   // 한탕 공격 d20(1=대실패 1딜 / 20=대성공 ×3 / 2~19=굴림/13), 2d20 버프면 어드밴티지
    let block = 0, wblk = 1
    if (canDef && dD.무기.주사위) {   // 한탕 방어 d20(검방 방패막기처럼 무기 방어기제) — 기본 회피/완전회피는 그대로, 여기에 추가
      const dd = d20adv(D.diceAdv > 0); A.diceDef = dd
      block = dd === 1 ? 2.0 : dd === 20 ? 0.001 : Math.max(1.0 - (dd - 2) * 0.06, 0.05); A.lastDef = '주사위방어'
    } else if (canDef && dD.방패막기 && rand() < dD.방패막기) { block = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' } else if (canDef && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) { wblk = 0.50; A.lastDef = '무기막기' }
    dmg = 0
    for (let i = 0; i < hits; i++) {
      let h = dA.무기.주사위 ? (atkD === 1 ? 0 : dA.물공 * (atkD === 20 ? 3 : atkD / 13)) : dA.물공 * physSwing(dA) * dA.기본공   // 주사위=d20 배율 / 그 외 기본공×physSwing
      h *= block ? block : wblk
      h *= defMul(dD.물방, 물관통)   // 물방 × (1-물관통)
      if (D.sunder > 0) h *= 1.15
      if (rand() < 0.30 && rand() >= (dA.비껴무효 + (A.luckBuff > 0 ? 0.2 : 0))) { h *= 0.70; A.grazed = true }
      let crit = i < baseHits && (forceCrit || luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0)))   // 연속타격 추가타(i>=baseHits)는 크리 제외
      if (i === 0 && A.sigEcho) A.echoStack = (A.echoStack || 0) + 1   // 잔상: 공격마다 스택
      if (A.echoReady) { crit = true; A.echoReady = 0 }
      else if (i === 0 && A.sigEcho && A.echoStack >= 3) { crit = true; A.echoStack = 0 }   // 잔상: 3타마다 확정 크리(회피 없어도 딜 기회)
      if (crit) { h *= ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }   // 무기 크리배율이 base 덮어씀(활2·단검1.8)
      dmg += h
    }
    if (dA.무기.스턴확률 && rand() < dA.무기.스턴확률) applyCC(D, 'stun', 1)   // 양둔: 확률 스턴
  } else {
    if (canDef && luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.천운))) { A.lastDef = '천운'; return 0 }   // 마법 완전회피 = 행운 10당 1%(리롤과 분리)
    // 볼트마법(스킬)을 쓸 때만 볼트 발사(_boltFire). 평타는 매직미사일(단발). 마스터=원소당 확정5발 / 없으면 1~5랜덤
    const boltTypes = [{ elem: 1.5, bn: '파이어볼트' }, { elem: 1.3, bn: '라이트닝볼트' }, { elem: 1.0, bn: '아이스볼트' }]
    let boltPlan = null
    if (A._boltFire) {
      if (A.boltMaster) {
        if (A.chainBolt > 0) { const s = [...boltTypes].sort(() => rand() - 0.5); boltPlan = [...Array(5).fill(s[0]), ...Array(5).fill(s[1])] }   // 볼트마법조합: 두 원소 5+5=10발
        else { const t = boltTypes[Math.floor(rand() * 3)]; boltPlan = Array(5).fill(t) }   // 마스터: 단일 원소 5발
      } else { const n = rollBoltCount(); boltPlan = Array.from({ length: n }, () => boltTypes[Math.floor(rand() * 3)]) }   // 마스터 없음: 1~5 랜덤
    }
    const bolts = boltPlan ? boltPlan.length : 1
    let mBlock = 1
    if (canDef && dD.방패막기 && rand() < dD.방패막기) { mBlock = (D.blockUp > 0 ? 0.10 : 0.20); A.lastDef = '방패막기' }   // 방패는 마법도 막음(최종 마공10% 바닥 보장 → 0딜 방지)
    dmg = 0; const braw = []; const bnames = []
    const mdef = defMul(dD.마방, 마관통)
    for (let i = 0; i < bolts; i++) {
      let b, bn = null
      if (boltPlan) { bn = boltPlan[i].bn; b = boltDmg(dA, A, bn, mdef) }   // 볼트마법(공통 공식)
      else {   // 매직미사일(완드 평타): 평타계수·마뎀너프 적용, 단발
        b = dA.마공 * dA.평타계수 * dA.마뎀너프 * mdef * magicGraze()
        if (rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0))) { b *= (dA.마크기본 + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
      }
      b *= mBlock
      if (D.sunder > 0) b *= 1.15
      dmg += b; braw.push(b); bnames.push(bn)
    }
    if (boltPlan && bolts > 1) {   // 볼트마법 다단 표시 기록
      A.lastBolt = true; A._braw = braw; A._bnames = bnames
      if (A.chainBolt > 0) {   // 볼트마법조합(10발): 총딜 감쇠 → 10발이 5발의 2배 안 되게
        dmg *= BOLT_COMBO_DAMP; for (let k = 0; k < braw.length; k++) braw[k] *= BOLT_COMBO_DAMP; A.boltCombo = true
      }
    }
    // 마법반사(스펠브레이커): 40% 완전반사(시전자가 다 맞음) / 30% 30%만 통과
    if (D.magReflect > 0 && dmg > 0) { const r = rand(); if (r < 0.40) { A.hp -= Math.max(Math.round(dmg), 1); A.lastRefl = 'full'; dmg = 0; A._braw = null } else if (r < 0.70) { A.hp -= Math.max(Math.round(dmg * 0.7), 1); dmg *= 0.30; A.lastRefl = 'part' } }
  }
  dmg -= 고정
  if (dD.마나경감) dmg *= (1 - dD.마나경감)
  if (defending) dmg *= 0.10
  dmg *= gutsMul(dD, D.hp, dD)
  if (D.vuln > 0) dmg *= 2.0
  if (D.instVuln > 0) dmg *= 1.5
  if (D.cast > 0) dmg *= 0.6   // 화염구 시전 중 받는뎀 40%↓
  if (A.tFury && A.hp < dA.maxhp * 0.5) dmg *= 1.22
  if (A.광란) dmg *= (1 + Math.pow(1 - Math.max(A.hp, 0) / dA.maxhp, 2) * 0.8)   // 광란: 체력 낮을수록 공격력 급증(2차곡선, 빈사 ~+80%)
  if (A.powBuff > 0) dmg *= A.powMul
  if (A.weaponBroken > 0) dmg *= (1 / 3)   // 무기파괴: 기초딜 1/3
  if (D.tWall) dmg *= 0.90
  if (D.tLegend) dmg *= 0.85
  if (D.tFrail) dmg *= 1.15
  if (dD.무기.받는뎀) dmg *= (1 - dD.무기.받는뎀)
  // 마법은 막혀도 최종 마공10% 바닥 보장(방패고정에 0딜 방지) — 방어행동 시엔 제외
  let fin = Math.max(Math.round(dmg), 1)
  // 연쇄볼트: 최종 피해를 발당 raw 비율로 배분(마나경감·근성 등 후처리 반영). 발당 최소 1(적중한 볼트가 0으로 안 뜨게) → 총합도 보정
  if (A._braw && A._braw.length > 1) { const s = A._braw.reduce((a, b) => a + b, 0) || 1; const hits = A._braw.map(r => Math.max(1, Math.round(r / s * fin))); A.boltHits = hits; A.boltNames = A._bnames; fin = hits.reduce((a, b) => a + b, 0) }
  if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
  if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
  if (A.마나환류 && magic && fin > 0 && rand() < 0.30) A.shield = Math.min(Math.round(dA.maxhp * 0.22), A.shield + Math.round(fin * 0.4))   // 마나환류(마법사 패시브): 마법딜 30% 확률로 40% 실드복구
  return perfectGuard(A, D, fin)
}
function guts (dmg, foe, df) { const p = foe.hp / df.maxhp; if (p < 0.5) dmg *= (1 - df.근성 * ((0.5 - p) / 0.5)); dmg *= (1 - (df.현자균형 || 0)); return dmg }
// 완벽방어!(기사 패시브): 방패막기를 연속 PERFECT_N회 성공하면 그 순간 받는 피해의 0.7을 공격자에게 즉시 반사(실드 무시 직접딜). 스트릭은 방패막기 외 결과에 리셋. 방패들기(90% 막기)와 강시너지
const PERFECT_N = 2
function perfectGuard (A, D, fin) {
  if (!D.완벽방어) return fin
  if (A.lastDef === '방패막기') { D.blockStreak = (D.blockStreak || 0) + 1; if (D.blockStreak >= PERFECT_N) { D.blockStreak = 0; A.lastDef = '완벽방어'; const preBlock = fin / (D.blockUp > 0 ? 0.10 : 0.20); A.hp -= Math.max(Math.round(preBlock * 0.7), 1) } } else { D.blockStreak = 0 }
  return fin
}
// 물리 딜 변수: 솜씨 기반 풀댐 확률, 빗맞으면 70~100% 유동 (예측성↓, 명중형=일관/난동형=도박)
function physSwing (d) { const pFull = 0.5 + Math.floor(d.base.솜씨 / 10) * 0.04; return rand() < pFull ? 1 : (0.70 + rand() * 0.30) }
// 마법 빗맞힘 구간(공유): 30% 풀댐 / 40% 80% / 30% 40% (평균 74%). 마법사 마법 + 볼트 공통
function magicGraze () { const gr = rand(); return gr < 0.30 ? 1 : (gr < 0.70 ? 0.80 : 0.40) }
function d20adv (adv) { const a = 1 + Math.floor(rand() * 20); if (!adv) return a; return Math.max(a, 1 + Math.floor(rand() * 20)) }   // 2d20 어드밴티지: adv면 2개 중 높은 값
function rollBoltCount () { return rand() < 0.10 ? 5 : 1 + Math.floor(rand() * 4) }   // 세이지 오토스펠 연타수: 5=10%, 1~4 각 22.5%
// 공통 볼트마법: 마공 기반 단일 볼트 피해(평타계수·마뎀너프 미적용 — 볼트는 주문이지 무기평타 아님). 세이지·볼트마법사 공유
const BOLT_ELEM = { 파이어볼트: 1.5, 라이트닝볼트: 1.3, 아이스볼트: 1.0 }
const BOLT_DAMP = 0.16   // 발당 감쇠(sim 튜닝: 볼트마법사·세이지 공통)
const SPELL_COEF = { 화염구: 4.8, 메테오: 8.4, 서리구: 3.1, 충격파: 1.0 }   // 시전 마법 = 마공 × 계수 (파생 의존 제거, 마공 기반). 서리구=둔화+짧은시전만큼 낮음 / 메테오=화염구와 raw 딜/턴 1:1(8.4÷유효7 ≈ 4.8÷유효4)이되 시전 길어 착탄 리스크가 대가
function spellBase (ds, name) { return Math.round(ds.마공 * SPELL_COEF[name]) }
const SIG_SHIELD_CAP = 0.40, SIG_SHIELD_REGEN = 0.04   // 지능100 시그(마법사): 마나실드 최대 maxHP 40%로 확대 + 매턴 4% 자동 회복(시전 중에도)
const BOLT_COMBO_DAMP = 0.7   // 볼트마법조합(10발)일 때 총딜 감쇠 — 10발이 5발의 2배 안 되게(sim 튜닝)
const BOLT_AMP = { 파이어볼트: 1.1, 라이트닝볼트: 1.2, 아이스볼트: 0 }   // 세이지 후속딜 증폭(nextAmp)
const SAGE_BOLT = 1.7   // 세이지 볼트 전용 배율 — 물리:마법 균형용(sim 튜닝)
function boltDmg (dA, A, bn, mdef, scale) {
  let b = dA.마공 * BOLT_ELEM[bn] * BOLT_DAMP * (scale || 1) * mdef * magicGraze()   // scale: 세이지 볼트 전용 배율(볼트가 주 마법딜이라 스케일업)
  if (rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0))) { b *= (dA.마크기본 + rand() * dA.크랜폭 * 0.6) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
  return b
}
// 볼트 다단 → 원소묶음 표시: total을 발당 비율로 배분 후 원소별 그룹핑(🔥파이어(a·b) ⚡라이트닝(c) …)
function boltGroupStr (hits, names, total) {
  const raw = hits.reduce((a, b) => a + b, 0) || 1
  const emo = { 파이어볼트: '🔥', 라이트닝볼트: '⚡', 아이스볼트: '❄️' }
  const order = ['파이어볼트', '라이트닝볼트', '아이스볼트']
  const g = {}; let acc = 0; const n = hits.length
  hits.forEach((h, i) => { const v = i === n - 1 ? total - acc : Math.round(h / raw * total); acc += v; const nm = (names && names[i]) || '볼트'; (g[nm] = g[nm] || []).push(v) })
  return order.filter(nm => g[nm]).map(nm => `${emo[nm] || ''}**${nm}**(${g[nm].join('·')})`).join(' ')
}
function absorb (foe, dmg) { if (foe.shield > 0) { if (dmg <= foe.shield) { foe.shield -= dmg; return 0 } else { const r = dmg - foe.shield; foe.shield = 0; foe.vuln = 1; return r } } return dmg }
// 시전 마법(화염구/인캐) 피해: 일반 마법과 동일 — 천운 완전회피 / 마방 감소 / 빗맞힘 / 근성
function spellDmg (base, foe, df) { if (foe.행운의여신 && rand() < foe.행운의여신) return 1; if (rand() < df.리롤) return 0; let blk = 1; if (df.방패막기 && rand() < df.방패막기) { blk = (foe.blockUp > 0 ? 0.10 : 0.20); foe.spellBlocked = true }; return Math.max(Math.round(guts(base * blk * (1 - df.마방) * magicGraze(), foe, df)), 0) }   // 방패는 시전 마법(화염구/메테오/서리구)도 막음 — 확률 발동, 성공 시 20%(방패들기 중 10%)로 경감
// 시전 중 피격 → 5% 시전 중단(취소). 피해가 실제로 들어갔을 때만("정말 운 없을 때")
function castHit (A, D, fin) { if (D.cast > 0 && fin > 0 && rand() < 0.05) { D.cast = 0; D.castCarry = 1; A.brokeCast = true } }   // 취소돼도 충전 일부 남아 다음 시전 -1턴
function applyCC (foe, field, dur) {
  let d = foe.sigTank ? Math.max(dur - 1, 0) : dur
  if (foe.광란 && foe.maxhp) { const e = Math.pow(1 - Math.max(foe.hp, 0) / foe.maxhp, 2); d = Math.round(d * (1 - e * 0.7)) }   // 광란: 체력 낮을수록 제어 지속 감소(빈사=거의 무효)
  foe[field] = Math.max(foe[field], d)
}
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
// 범용 디버프 레지스트리 — 룰렛(한탕) 등 랜덤 디버프가 여기서 추출. 새 범용 디버프는 여기 한 줄만 추가하면 자동 포함
const DEBUFFS = [
  { name: '기절', apply: f => applyCC(f, 'stun', 1) },
  { name: '둔화', apply: f => { applyCC(f, 'slow', 3); f.slowSec = Math.max(f.slowSec, 2) } },
  { name: '침묵', apply: f => applyCC(f, 'silence', 2) },
  { name: '취약', apply: f => applyCC(f, 'vuln', 1) },
  { name: '방어약화', apply: f => applyCC(f, 'sunder', 3) },
  { name: '실명', apply: f => applyCC(f, 'blind', 3) },
  { name: '명중저하', apply: f => applyCC(f, 'missDown', 3) },
  { name: '행운봉인', apply: f => applyCC(f, 'luckLock', 3) },
  { name: '회복불가', apply: f => applyCC(f, 'healBlock', 3) }
]
const SKILLS = {
  전사: [
    // 방어파괴: 딜 + 상대 2턴 받는뎀↑ + 상대 최대체력 6% 고정딜(HP스케일 관통)
    { name: '방어파괴', ready: (s, f, ds, df) => s.cd[0] === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.2 + df.maxhp * 0.09, exec: (s, f, ds, df) => { f.sunder = 2; let d = attack(s, f, ds, df, f.defending) + ds.힘절반 + Math.round(df.maxhp * 0.09); d = absorb(f, d); f.hp -= d; s.cd[0] = 3 } },
    { name: '돌진', ready: (s, f, ds, df) => s.cd[1] === 0 && f.stun === 0 && s.hp > ds.maxhp * 0.2, score: (s, f, ds, df, x) => ds.돌진딜 * (1 - df.물방) + x.foeTurn, exec: (s, f, ds, df) => { let d = guts(ds.돌진딜 * physSwing(ds) * (1 - df.물방), f, df); d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; applyCC(f, 'stun', 2); s.hp -= Math.round(ds.maxhp * 0.1); s.cd[1] = 6; s.note = '기절' } },
    // 방해: 시전 중이면 취소+1턴 침묵 / 아니면 1턴 스턴 + 딜. 캐스터·물리 양쪽 대응(범용)
    { name: '방해', ready: (s, f, ds, df) => s.cd[2] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.est + (f.cast > 0 ? 150 : x.foeTurn * 0.6), exec: (s, f, ds, df) => { const wasCasting = f.cast > 0; const meteor = wasCasting && f.castName === '메테오'; if (wasCasting) { if (!meteor) { f.cast = 0; f.castCarry = 1 } applyCC(f, 'silence', 1); s.note = meteor ? '메테오 방해 실패' : '시전 차단'; if (meteor) s.meteorImmune = true } else { applyCC(f, 'stun', 1); s.note = '기절' } let d = attack(s, f, ds, df, f.defending, true); d = absorb(f, d); f.hp -= d; if (wasCasting && !meteor) s.brokeCast = true; s.cd[2] = 5 } }   // guaranteed=true: 회피/빗나감 무시(확정 명중). 시전 끊으면 brokeCast 표식
  ],
  광전사: [
    { name: '재생의광기', ready: (s, f, ds, df) => s.cd[0] === 0 && s.hp < ds.maxhp * 0.65, score: (s, f, ds, df, x) => x.est * 3, exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.07)); s.healRegen = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[0] = 5; s.note = '회복' }, stunnable: true, stunExec: (s, f, ds, df) => { const before = s.hp; s.hp = Math.min(ds.maxhp, s.hp + Math.round(ds.maxhp * 0.07)); s.healRegen = 3; s.cd[0] = 5; return { type: 'skill', name: '재생의광기', dmg: 0, note: '기절 중 회복', attacked: false, heal: Math.round(s.hp - before), selfDmg: 0 } } },
    // 피의각성: 체력 10% 소모 → 3턴간 공격력 ×1.35 + 명중보정(상대 회피↓)
    { name: '피의각성', ready: (s, f, ds, df) => s.cd[1] === 0 && s.powBuff === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.4, exec: (s, f, ds, df) => { s.hp -= Math.round(ds.maxhp * 0.15); s.powBuff = 3; s.powMul = 1.35; s.accBuff = 3; let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; s.cd[1] = 5; s.note = '피의각성' } }
  ],
  기사: [
    // 방패밀쳐내기: 물리딜 + 상대 최대체력 10% 고정딜(방어무시) — HP스케일 관통 탱버스터
    { name: '방패밀쳐내기', ready: (s, f, ds, df) => s.cd[0] === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => ds.방패밀쳐내기 * (1 - df.물방) + df.maxhp * 0.10, exec: (s, f, ds, df) => { let d = ds.방패밀쳐내기 * physSwing(ds); if (f.defending) d *= 0.10; d *= (1 - df.물방); d = guts(d, f, df); d += df.maxhp * 0.10; let dd = absorb(f, Math.max(Math.round(d), 1)); f.hp -= dd; s.cd[0] = 3 } },
    // 방패들기: 3턴간 방패막기 경감 강화(30%→90%). + 패시브 가시방패(상시 20% 반사)
    { name: '방패들기', ready: (s, f, ds, df) => s.cd[1] === 0 && s.blockUp === 0 && ds.방패막기 > 0, score: (s, f, ds, df, x) => x.foeTurn * 1.3, exec: (s, f, ds, df) => { s.blockUp = 3; s.cd[1] = 4; s.note = '방패들기' } },
    // 방패가격: 시전 중이면 즉시 차단(취소)+공격력 소폭↑ / 아니면 1턴 스턴. 기사의 유일한 제어기(캐스터 견제·시전끊기)
    { name: '방패가격', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => f.cast > 0 ? 300 : (f.stun === 0 ? x.foeTurn * 1.3 : 0), exec: (s, f, ds, df) => { const wc = f.cast > 0; const meteor = wc && f.castName === '메테오'; if (wc && !meteor) { f.cast = 0; f.castCarry = 1; s.brokeCast = true; s.powBuff = 3; s.powMul = 1.15; s.note = '시전 차단'; } else if (meteor) { s.meteorImmune = true; s.note = '메테오 방해 실패'; } else { applyCC(f, 'stun', 1); s.note = '기절'; } s.cd[2] = 4 } }
  ],
  마법사: [
    // 화염구: 인캐 걸려있으면 즉발, 아니면 시전(스태프 castMod로 -2턴). castCarry(취소 잔여)로 -1턴
    { name: '화염구', ready: (s, f, ds, df, x) => s.cast === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => spellBase(ds, '화염구') * (s.instCast ? 2.5 : 1), exec: (s, f, ds, df) => { if (s.instCast > 0) { s.instCast = 0; f.hp -= absorb(f, spellDmg(spellBase(ds, '화염구'), f, df)); s.note = '즉시 화염구' } else { s.cast = Math.max(1, 6 + (ds.무기.castMod || 0) - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = spellBase(ds, '화염구'); s.castTotal = s.cast; s.castName = '화염구'; s.note = '화염구 시전' } } },
    // 메테오: 긴 시전(9+무기), 인캐 불가(무조건 하드캐스트), 초대형 한 방. 취소돼도 castCarry 유지
    { name: '메테오', ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[1] === 0 && x.safe, score: (s, f, ds, df, x) => spellBase(ds, '메테오') * 0.9, exec: (s, f, ds, df) => { s.cast = Math.max(2, 9 + (ds.무기.castMod || 0) - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = spellBase(ds, '메테오'); s.castTotal = s.cast; s.castName = '메테오'; s.cd[1] = 5; s.note = '메테오 시전' } },
    // 인스턴트캐스팅: 다음 시전 마법을 즉시시전으로(버프·딜 없음). 메테오엔 안 걸림
    { name: '인스턴트캐스팅', ready: (s, f, ds, df) => s.cd[2] === 0 && s.cast === 0 && s.instCast === 0, score: (s, f, ds, df, x) => spellBase(ds, '화염구') * 1.3, exec: (s, f, ds, df) => { s.instCast = 3; s.cd[2] = 6; s.note = '인스턴트 캐스팅' } },
    // 서리구: 짧은 시전(인캐 가능), 딜은 파볼보다 약하나 상대 3턴 둔화. 인캐 심리전 2번째 선택지
    { name: '서리구', ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[3] === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => s.instCast ? spellBase(ds, '서리구') * 2.2 : (f.slow === 0 ? spellBase(ds, '서리구') + Math.max(10 - df.턴, 0) * 65 : spellBase(ds, '서리구') * 0.45), exec: (s, f, ds, df) => { applyCC(f, 'slow', 3); f.slowSec = Math.max(f.slowSec, 2); s.cd[3] = 3; const dmg = spellBase(ds, '서리구'); if (s.instCast > 0) { s.instCast = 0; f.hp -= absorb(f, spellDmg(dmg, f, df)); s.note = '즉시 서리구' } else { s.cast = Math.max(1, 5 + (ds.무기.castMod || 0) - (s.castCarry || 0)); s.castCarry = 0; s.castDmg = dmg; s.castTotal = s.cast; s.castName = '서리구'; s.note = '서리구 시전' } } },
    // 충격파: 즉발 소량딜 + 상대 현재 턴 진행 초기화(게이지 풀 리셋) + 1턴 둔화 — 느린 캐스터의 템포/카이팅 도구(딜은 곁다리)
    { name: '충격파', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => spellBase(ds, '충격파') + x.incoming * (Math.max(df.턴 - f.gauge, 0) / df.턴) * 2.5, exec: (s, f, ds, df) => { let d = spellDmg(spellBase(ds, '충격파'), f, df); d = absorb(f, d); f.hp -= d; f.gauge = Math.max(f.gauge, df.턴); applyCC(f, 'slow', 1); f.slowSec = Math.max(f.slowSec, 1); s.cd[0] = 5; s.note = '충격파' }, stunnable: true }
  ],
  볼트마법사: [
    // 볼트마법: 볼트 발사 주력기(시전 없음, 쿨1=매턴). 마스터라 원소당 5발(볼트마법조합 켜면 5+5=10). 스킬이라 침묵에 막힘
    { name: '볼트마법', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => x.est * 2.5, exec: (s, f, ds, df) => { s._boltFire = true; let dmg = attack(s, f, ds, df, f.defending); s._boltFire = false; if (f.vuln > 0) f.vuln--; dmg = absorb(f, dmg); f.hp -= dmg; s.cd[0] = 1 } },
    { name: '볼트마법조합', ready: (s, f, ds, df) => s.cd[1] === 0 && s.chainBolt <= 1, score: (s, f, ds, df, x) => x.est * 3, exec: (s, f, ds, df) => { s.chainBolt = 4; s.cd[1] = 4; s.note = '볼트마법조합' } },   // 순수버프(공격 제거): 볼트마법을 10발로. 다운 시 볼트마법보다 우선 재시전
    { name: '마력충전', ready: (s, f, ds, df) => s.cd[2] === 0 && s.shield < ds.maxhp * 0.10, score: (s, f, ds, df, x) => x.foeTurn * 0.8, exec: (s, f, ds, df) => { s.shield = Math.max(s.shield, Math.round(ds.maxhp * 0.22)); s.cd[2] = 5; s.note = '마나실드 충전' } }
  ],
  암살자: [
    { name: '암습', ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0, score: (s, f, ds, df, x) => x.foeTurn * 2.5, exec: (s, f, ds, df) => { applyCC(f, 'stun', 3); s.cd[0] = 10; s.note = '기절' } },   // 순수 CC: 확정 3턴 스턴, 딜 없음(후속타로 딜)
    { name: '처형', ready: (s, f, ds, df) => s.cd[1] === 0 && f.hp < df.maxhp * 0.25, score: (s, f, ds, df, x) => ds.물공 * 5 * (1 - df.물방), exec: (s, f, ds, df) => { let d = guts(ds.물공 * 5 * physSwing(ds) * (1 - df.물방), f, df); d = absorb(f, Math.max(Math.round(d), 1)); f.hp -= d; s.cd[1] = 5; s.note = '처형' } },
    { name: '백스텝', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.est * 1.5, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 1.5); d = absorb(f, d); f.hp -= d; s.cd[2] = 4; s.note = '백스텝' } },   // 회피버프 제거 → 후측 강타 ×1.5
    // 입막음: 시전 차단 + 2턴 침묵 + 딜. 목을 노려 주문을 끊는다 — 캐스터 카운터(볼트마법사 봉쇄·마법사 서리구 대응)
    { name: '입막음', ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => x.est + (f.cast > 0 ? 200 : (df.마공 > df.물공 && f.silence === 0 ? x.foeTurn * 1.2 : 0)), exec: (s, f, ds, df) => { const wc = f.cast > 0; const meteor = wc && f.castName === '메테오'; if (wc && !meteor) { f.cast = 0; f.castCarry = 1 } applyCC(f, 'silence', 2); let d = attack(s, f, ds, df, f.defending, true); d = absorb(f, d); f.hp -= d; if (wc && !meteor) s.brokeCast = true; if (meteor) s.meteorImmune = true; s.cd[3] = 5; s.note = meteor ? '메테오 방해 실패' : (wc ? '시전 차단' : '침묵') } }
  ],
  사냥꾼: [
    // 약점간파: 확정명중(회피 불가) + 확정크리. 단 방패막기·무기막기·방어중은 정식 적용(attack() 경로) — 못 피하지만 막을 순 있다
    { name: '약점간파', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => ds.물공 * 1.4 * (ds.물크기본 + ds.크랜폭 * 0.5) * (1 - df.물방), exec: (s, f, ds, df) => { let d = attack(s, f, ds, df, f.defending, true, true) * 2.0; if (f.instVuln > 0) d *= 1.5; d = Math.max(Math.round(d), 1); d = absorb(f, d); f.hp -= d; s.cd[0] = 4; s.note = '치명타' } },
    { name: '견제사격', ready: (s, f, ds, df) => s.cd[1] === 0 && f.missDown === 0 && f.hp > df.maxhp * 0.3, score: (s, f, ds, df, x) => x.est * 1.1, exec: (s, f, ds, df) => { let d = attack(s, f, ds, df, f.defending); d = absorb(f, d); f.hp -= d; f.missDown = 2; s.cd[1] = 4; s.note = '명중↓' } },
    { name: '연발사격', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.est * 1.4, exec: (s, f, ds, df) => { const hits = []; for (let i = 0; i < 3; i++) { let d = Math.round(attack(s, f, ds, df, f.defending) * 0.5); d = absorb(f, d); f.hp -= d; hits.push(d) } s.multiHits = hits; s.cd[2] = 4; s.note = '연발' } },
    // 사냥꾼덫: 예약형 — 설치 후 상대 2턴 뒤 발동(게이지 밀림 + 1턴 둔화 + 3턴 출혈). 딜은 출혈로. 카이팅/거리 유지
    { name: '사냥꾼덫', ready: (s, f, ds, df) => s.cd[3] === 0 && f.trap === 0 && f.bleed === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.8, exec: (s, f, ds, df) => { f.trap = 2; f.trapBleed = Math.round(ds.물공 * 0.3); s.cd[3] = 5; s.note = '덫 설치' } }
  ],
  스펠블레이드: [
    // 약점봉인: 순수 CC(딜 없음) — 상대 최고 스탯에 맞는 군중제어만
    { name: '약점봉인', ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0 && f.slow === 0, score: (s, f, ds, df, x) => x.foeTurn * 2.5, exec: (s, f, ds, df) => { const cc = applyAdaptiveCC(f, df); s.cd[0] = 5; s.note = cc } },
    // 역장베기: 혼합 평타딜(확정명중, 방어로 깎임) + 역장피해(마공×1.5 flat, 물방·마방 무시 관통딜 — D&D force). 순수 딜기
    { name: '역장베기', dmgType: '역장', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est * 1.8, exec: (s, f, ds, df) => { let d = attack(s, f, ds, df, f.defending, true); const force = Math.round(ds.마공 * 1.5); d = absorb(f, d + force); f.hp -= d; s.cd[1] = 4; s.note = '역장베기' } },
    // 인챈트: 3턴간 공격력 ×1.3 (마검사 딜 보강)
    { name: '룬각인', ready: (s, f, ds, df) => s.cd[2] === 0 && s.powBuff === 0, score: (s, f, ds, df, x) => x.est * 1.3, exec: (s, f, ds, df) => { s.powBuff = 4; s.powMul = 1.8; s.cd[2] = 4; s.note = '룬각인' } },   // 순수버프(공격 제거), 지속4=쿨4(사용성↑)
    // 역장폭발: 큰 역장피해(방어 무시 관통) — 대신 이후 2턴 취약(받는뎀 +50%). 고위험 버스트
    { name: '역장폭발', dmgType: '역장', ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => x.est * 2, exec: (s, f, ds, df) => { const force = Math.round(ds.마공 * 2.5); const d = absorb(f, force); f.hp -= d; s.instVuln = 2; s.cd[3] = 5; s.note = '역장폭발' } }
  ],
  스펠브레이커: [
    // 마나소각: 마나실드 파괴 + 마공 딜(실드 있었으면 ×1.5) — 마나실드 캐스터 카운터
    { name: '마나소각', dmgType: '역장', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => ds.마공 * (f.shield > 0 ? 0.95 : 0.42), exec: (s, f, ds, df) => { const had = f.shield > 0; f.shield = 0; let d = Math.round(ds.마공 * (had ? 0.95 : 0.42)); f.hp -= d; if (had) { applyCC(f, 'slow', 2); f.slowSec = Math.max(f.slowSec, Math.round(df.턴 * 0.2 * 10) / 10) } s.cd[0] = 5; s.note = had ? '마나소각' : '마나번' } },   // 역장피해(마방 무시 flat): 실드 즉시파괴 + 실드있었으면 마공×3 & 2턴 20% 턴지연 / 없으면 마공×1.5
    // 시전파괴: 상대 시전 확정 차단 + 3턴 침묵 + 딜 — 마법사 하드카운터
    // 시전파괴: 캐스터(지능70+) 상대면 침묵락+시전 차단+딜(대박) / 물딜러 상대면 자기 기절(리스크). AI는 캐스터에게만 사용
    { name: '시전파괴', ready: (s, f, ds, df) => s.cd[1] === 0 && df.base.지능 >= 70 && (f.silence <= 1 || f.cast > 0), score: (s, f, ds, df, x) => x.est + (f.cast > 0 ? 300 : 150), exec: (s, f, ds, df) => { s.cd[1] = 5; const wc = f.cast > 0; const meteor = wc && f.castName === '메테오'; if (wc && !meteor) { f.cast = 0; f.castCarry = 1; s.brokeCast = true } if (meteor) s.meteorImmune = true; applyCC(f, 'silence', 2); s.note = meteor ? '메테오 방해 실패' : (wc ? '시전 차단' : '침묵') } },   // 딜 없음: 침묵 2턴 + 시전 즉시차단(캐스터 전용)
    // 무기파괴: 3턴간 상대 딜 1/3(물리·마법 공통). 안티캐스터가 물리 상대에도 통하는 카운터 — 순수 디버프(즉발)
    { name: '무기파괴', ready: (s, f, ds, df) => s.cd[2] === 0 && f.weaponBroken === 0, score: (s, f, ds, df, x) => x.foeTurn * 2, exec: (s, f, ds, df) => { f.weaponBroken = 3; s.cd[2] = 5; s.note = '무기파괴' } },
    // 파훼: 평소엔 약딜, 무기파괴(약점노출)된 적엔 치명딜. "무기파괴 → 파훼" 처치 콤보
    { name: '파훼', ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => f.weaponBroken > 0 ? x.est * 3.3 : x.est * 1.2, exec: (s, f, ds, df) => { const mult = f.weaponBroken > 0 ? 3.3 : 1.2; let d = Math.round(attack(s, f, ds, df, f.defending) * mult); d = absorb(f, d); f.hp -= d; s.cd[3] = 4; s.note = f.weaponBroken > 0 ? '파훼 작렬' : '파훼' } },
  ],
  세이지: [
    { name: '오토스펠', ready: (s, f, ds, df) => s.cd[0] === 0 && s.autoSpell <= 1, score: (s, f, ds, df, x) => x.est * 2.2, exec: (s, f, ds, df) => { s.autoSpell = 4; s.cd[0] = 3; s.note = '주문각인' } },   // 순수버프(공격 제거)
    { name: '연환주문', ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => x.est * 2 + df.maxhp * 0.06, exec: (s, f, ds, df) => { let d = Math.round(attack(s, f, ds, df, f.defending) * 2) + Math.round(df.maxhp * 0.06); d = absorb(f, d); f.hp -= d; s.cd[1] = 4 } }   // +상대 최대HP 6% 고정딜(탱버스터)
  ],
  한탕주의자: [
    // 2d20: 주사위 2개(2~40) 합 비례 도박 딜 — 더블20=대박 / 뻥=꽝. HP% 기반(방어감소는 받되 실드 흡수)
    { name: '2d20', ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => df.maxhp * 0.135, exec: (s, f, ds, df) => { const sum = (1 + Math.floor(rand() * 20)) + (1 + Math.floor(rand() * 20)); let d = Math.round(df.maxhp * (sum / 40) * 0.6); d = absorb(f, d); f.hp -= d; s.cd[0] = 3; s.note = sum >= 38 ? `🎯더블! 2d20=${sum}` : (sum <= 5 ? `💢뻥 2d20=${sum}` : `🎲2d20=${sum}`) } },
    // 동전던지기: All or Nothing — 앞면=상대 최대체력 10% / 뒷면=자기 5%, 둘 다 방어·실드 무시(HP비례 확정딜)
    { name: '동전던지기', ready: (s, f, ds, df) => s.cd[1] === 0 && s.hp > ds.maxhp * 0.12, score: (s, f, ds, df, x) => df.maxhp * 0.075, exec: (s, f, ds, df) => { if (rand() < 0.5) { let d = absorb(f, Math.round(df.maxhp * 0.15)); f.hp -= d; s.note = '앞면! 상대 최대체력 15%' } else { s.hp -= Math.round(ds.maxhp * 0.05); s.note = '뒷면… 자해 5%' } s.cd[1] = 2 } },   // HP비례딜(물방/마방 무관), 마나실드엔 흡수됨
    // 룰렛: 상대에게 랜덤 디버프(레지스트리에서 추출, 칩딜 없음) — 무슨 재앙이 걸릴지 모르는 도박
    { name: '룰렛', ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.6, exec: (s, f, ds, df) => { const d = DEBUFFS[Math.floor(rand() * DEBUFFS.length)]; d.apply(f); s.cd[2] = 3; s.note = '룰렛: ' + d.name } }
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
const SKILL_CD = { 방어파괴: 3, 돌진: 6, 광폭화: '버프', 재생의광기: 5, 방패밀쳐내기: 3, 방패가격: 4, 도발: 5, 화염구: '시전', 메테오: '시전', 서리구: '시전', 충격파: 5, 인스턴트캐스팅: '버프', 암습: 10, 처형: 5, 약점간파: 4, 견제사격: 4, 사냥꾼덫: 5, 약점봉인: 5, 역장베기: 5, 오토스펠: 3, 연환주문: 4, '2d20': 3, 동전던지기: 2, 볼트마법: 1, '볼트마법조합': '버프', 마력충전: 5, 마나소각: 5, 시전파괴: 5, 무기파괴: 5, 파훼: 4, 방해: 5, 방패들기: '버프', 룬각인: '버프', 역장폭발: 5, 피의각성: '버프', 메테오: '시전', 백스텝: '버프', 입막음: 5, 연발사격: 4, 룰렛: 3, 마법반사: '버프' }
// 스킬 종류별 "시작 쿨"(오프닝 봉인). 공격기=0(즉시), CC=2, 인캐=3. 마법사=슬로우스타터
const SKILL_STARTCD = { 돌진: 2, 암습: 2, 약점봉인: 2, 도발: 2, 중력베기: 2, 인스턴트캐스팅: 3, 메테오: 13, 속박: 2 }
const skillStartCd = (name) => SKILLS[name].map(sk => SKILL_STARTCD[sk.name] || 0)
// 스킬 효과 요약(매치업 표시용)
const SKILL_DESC = {
  방어파괴: '상대 2턴 받는뎀+15% + 고정딜', 돌진: '딜+1턴 스턴 (나 반동)',
  광폭화: '3턴 공격력↑ + 턴 빨라짐', 재생의광기: '즉시 25% 회복+3턴 재생 (공격도 함)',
  방패밀쳐내기: '방어 기반 강력한 한 방 + 상대 최대체력 10% 관통딜', 방패가격: '시전 중이면 즉시 차단(취소)+공격력 소폭↑ / 아니면 1턴 스턴', 도발: '상대 2턴 방어행동 불가 + 딜',
  화염구: '시전 마법 — 마공 기반 딜(인캐로 즉발 가능)', 메테오: '긴 시전 → 초대형 한 방(인캐 불가)', 서리구: '짧은 시전 → 딜(약) + 상대 3턴 둔화(인캐로 즉발)', 충격파: '즉발 소량딜 + 상대 현재 턴 진행 초기화 + 1턴 둔화(카이팅)', 인스턴트캐스팅: '3턴간 다음 시전을 즉시시전(메테오 제외)',
  암습: '상대 3턴 기절 + 진입딜', 처형: '상대 HP25%↓면 물공×5 대박딜',
  약점간파: '확정 크리 + 방어 대부분 무시', 견제사격: '딜 + 상대 2턴 명중-20%',
  약점봉인: '상대 최고 스탯에 맞는 군중제어 (순수 CC·딜 없음)', 방패들기: '3턴간 방패막기 경감 대폭↑', 방해: '시전 차단+침묵 / 아니면 1턴 스턴 + 딜', 룬각인: '4턴간 공격력 ×1.8 (순수버프, 지속4=쿨4)', 역장베기: '혼합 딜 + 역장피해(방어무시 추가딜)', 역장폭발: '큰 역장피해(방어무시) — 이후 2턴 취약(받는뎀+50%)', 피의각성: '체력 10% 소모 → 3턴 공격력 ×1.35', 백스텝: '2턴 회피 대폭↑ + 딜', 입막음: '시전 차단 + 2턴 침묵 + 딜 (캐스터 카운터)', 연발사격: '3연사(발당 약)', 사냥꾼덫: '덫 설치 → 상대 2턴 뒤 발동(게이지 밀림 + 1턴 둔화 + 3턴 출혈)', 룰렛: '상대에게 랜덤 디버프(기절·둔화·침묵·취약 등에서 무작위)', 마법반사: '3턴간 받는 마법 반사(완전/부분 랜덤)', 
  오토스펠: '켜면 평타마다 90% 볼트 1~5발 자동발동(발당 원소 랜덤) + 턴가속', 연환주문: '혼합 타격 ×2 한방기',
  '2d20': '주사위 2개 합(2~40) 비례 도박 딜 — 더블20 대박/뻥 꽝', 동전던지기: 'All or Nothing — 앞면 상대 최대체력 15%% / 뒷면 자기 5%% (HP비례·실드엔 흡수)',
  볼트마법: '볼트 발사 주력기(시전없음·매턴). 마스터라 원소당 5발, 조합 시 5+5=10발. 침묵에 막힘', 볼트마법조합: '4턴 유지 — 볼트마법이 두 원소 5+5=10발 혼합발사 + 조합배율(순수버프)', 마력충전: '마나실드 즉시 재충전',
  마나소각: '마나실드 즉시 파괴 + 역장피해(마방무시) — 실드 파괴 시 대미지↑ & 2턴 둔화', 시전파괴: '시전 확정 차단 + 2턴 침묵 (딜 없음·캐스터 전용)', 무기파괴: '3턴간 상대 딜 1/3(물리·마법) + 무기막기 불가', 파훼: '약딜(×1.2) — 무기파괴된 적에겐 치명딜(×3.3)'
}
function skillsBlock (name) {
  const lines = SKILLS[name].map((sk, i) => {
    const cd = SKILL_CD[sk.name]
    return `${i + 1}) **${sk.name}** — ${SKILL_DESC[sk.name] || ''} (${typeof cd === 'number' ? `쿨${cd}` : cd})`
  })
  for (const p of PASSIVES[name] || []) lines.push(`🔒 **${p.name}**(패시브) — ${p.desc}`)   // 패시브도 표시(스킬 수 불리해 보이지 않게)
  return lines.join('\n')
}
// 방어 결정 = AI 리스크 톨러런스. 예상딜은 추정치(실제는 변동) → 계수로 낙관/비관 표현
// 방어 = 예상딜 × 계수 ≥ 내HP. 공격적=0.6(적게 뜰거라 배짱) / 판단형=0.85 / 방어적=1.15(죽을수도→선제)
function decideDefend (self, foe, ds, df) {
  if (self.noDefend > 0) return false
  const est = Math.max(0, estAtk(df, ds) - self.shield)   // 예상 피격(기대값)
  const factor = self.ai === '공격적' ? 0.6 : self.ai === '방어적' ? 1.15 : 0.85
  return est * factor >= self.hp
}
// 버프(턴 소모 투자) AI 게이트: 공격적=항상 / 판단형=여유 / 방어적=아주 안전할때만
function buffOk (ai, hp, est) {
  if (ai === '공격적') return true
  if (ai === '방어적') return hp > est * 2.5
  return hp > est * 1.5
}
function mkFighter (d, name, ai) {
  // 게이지에 랜덤 미세오프셋 → 속도 동률 시 선공을 공정하게(플레이어 선공 고정 방지)
  return { name, hp: d.maxhp, gauge: d.턴 + Math.random() * 0.3, ai, defending: false, defCombo: 0, defendedLast: false,
    shield: d.sigEye ? Math.round(d.maxhp * SIG_SHIELD_CAP) : (d.마나경감 ? Math.round(d.maxhp * 0.22) : 0), vuln: 0, cd: skillStartCd(name), rage: 0, sunder: 0, weaponBroken: 0, luckBuff: 0,
    cast: 0, castCarry: 0, castDmg: 0, castName: null, castTotal: 0, instVuln: 0, instCast: 0, stun: 0, stunned: false, noDefend: 0, missDown: 0, autoSpell: 0, chainBolt: 0, nextAmp: 0, didAttack: false,
    powBuff: 0, powMul: 1, thorns: 0, thornsPct: 0, blockUp: 0, thornsBase: (CHARS[name] && CHARS[name].반사) || 0,   // 공격강화 / 반사버프 / 방패막기강화 / 패시브반사(가시방패)
    dodgeUp: 0, magReflect: 0, elemStack: 0, 원소: (CHARS[name] && CHARS[name].원소) || false,   // 백스텝 회피버프 / 마법반사 / 원소스택(세이지 패시브)
    불굴: (CHARS[name] && CHARS[name].불굴) || false, undyingUsed: 0, reviveType: null, accBuff: 0,   // 광전사 불굴(죽을 피해→회복 생존) / 피의각성 명중보정(상대 회피↓)
    광란: (CHARS[name] && CHARS[name].광란) || false, maxhp: d.maxhp,   // 광전사 광란: 체력 낮을수록 제어감소+공격력↑(2차곡선)
    마나환류: (CHARS[name] && CHARS[name].마나환류) || false,   // 마법사 패시브: 마법딜 시 확률적 실드복구
    연속타격: (CHARS[name] && CHARS[name].연속타격) || false,   // 암살자 패시브: 공격 시 확률적 추가타
    완벽방어: (CHARS[name] && CHARS[name].완벽방어) || false, blockStreak: 0,   // 기사 패시브: 연속 방패막기 3회 → 피해 무효

    boltMaster: (CHARS[name] && CHARS[name].boltMaster) || false,   // 볼트마법사 패시브: 볼트마법 사용 시 원소당 확정 5발
    행운의여신: (CHARS[name] && CHARS[name].행운의여신) ? (CHARS[name].행운 / 1000) : 0,   // 한탕 패시브: 받는 피해마다 이 확률로 피해 1(전 타입)
    boltShots: 0, _boltFire: false,
    diceAdv: 0,   // 한탕 2d20: 주사위를 2개 굴려 높은 값(어드밴티지) 버프
    slow: 0, slowSec: 0, silence: 0, luckLock: 0, blind: 0, healBlock: 0, healRegen: 0,
    trap: 0, trapBleed: 0, bleed: 0, bleedDmg: 0,   // 사냥꾼덫(예약 발동) + 출혈 DoT

    sigDodge: d.sigDodge, sigEcho: d.sigEcho, sigTank: d.sigTank, echoReady: 0, echoStack: 0, revive: d.sigTank ? 1 : 0 }
}
function reviveCheck (f, d) {
  // 불굴(광전사): 죽을 피해 → 회복하며 생존. 회복량 점감(15/10/5%) 후 소진 → 진짜 죽음. 직후 2턴 취약(instVuln)
  if (f.hp <= 0 && f.불굴) { const heals = [0.08]; if (f.undyingUsed < heals.length) { f.hp = Math.round(d.maxhp * heals[f.undyingUsed]); f.undyingUsed++; f.instVuln = 2; f.stun = 0; f.noDefend = 0; f.reviveType = 'undying'; return true } }
  if (f.hp <= 0 && f.revive > 0) { f.hp = Math.round(d.maxhp * 0.20); f.revive--; f.stun = 0; f.noDefend = 0; f.reviveType = 'revive'; return true }
  return false
}

// ── 스텝형 전투 엔진 (자동 runBattle + 인터랙티브 공용) ──
function resetGauge (f, d) { return Math.max(d.턴 * (f.autoSpell > 0 ? 0.85 : 1) - (f.rage > 0 ? 2 : 0), 2) + (f.slow > 0 ? f.slowSec : 0) }   // 오토스펠: 턴시간 15%↓(가속)
// 턴 시작 처리(쿨/상태 감소, 기절·시전). 턴이 소모되는 강제 이벤트면 그 이벤트, 아니면 null
function upkeep (self, foe, ds, df) {
  self.defending = false; self.note = null; self.lastCrit = false; self.lastBolt = false; self.stunned = false; self._tick = []
  for (let i = 0; i < self.cd.length; i++) self.cd[i] = Math.max(0, self.cd[i] - 1)   // 전 스킬 슬롯 쿨 감소(3스킬 대응)
  if (self.tRegen && self.healBlock === 0) self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.base.체력 * 0.3))
  if (self.autoSpell > 0) self.autoSpell--
  if (self.chainBolt > 0) self.chainBolt--
  if (self.slow > 0) self.slow--; if (self.silence > 0) self.silence--; if (self.luckLock > 0) self.luckLock--; if (self.blind > 0) self.blind--; if (self.healBlock > 0) self.healBlock--
  if (self.weaponBroken > 0) self.weaponBroken--   // 무기파괴 디버프 감소
  if (self.healRegen > 0 && self.healBlock === 0) { self.hp = Math.min(ds.maxhp, self.hp + Math.round(ds.base.체력 / 2)); self.healRegen-- }
  if (self.bleed > 0) { const bd = Math.max(self.bleedDmg, 0); self.hp -= bd; self.bleed--; self._tick.push({ type: 'bleed', dmg: bd, left: self.bleed }) }   // 출혈 DoT(방어·실드 무시)
  if (self.trap > 0) { self.trap--; if (self.trap === 0) { self.gauge += ds.턴 * 0.8; applyCC(self, 'slow', 1); self.slowSec = Math.max(self.slowSec, Math.round(ds.턴 * 0.2 * 10) / 10); self.bleed = 3; self.bleedDmg = self.trapBleed || 0; self._tick.push({ type: 'trapspring', dmg: self.bleedDmg }) } }   // 사냥꾼덫 발동: 게이지 밀림 + 1턴 둔화 + 출혈 3턴
  // 버프/디버프 지속은 기절·시전 중에도 흐른다 (기절 중 버프 동결 버그 A2 수정)
  if (self.instVuln > 0) self.instVuln--
  if (self.instCast > 0 && self.cast === 0) self.instCast--   // 인캐 버프 3턴 지속(시전 중엔 유지)
  if (self.powBuff > 0) self.powBuff--
  if (self.thorns > 0) self.thorns--
  if (self.blockUp > 0) self.blockUp--
  if (self.dodgeUp > 0) self.dodgeUp--
  if (self.accBuff > 0) self.accBuff--
  if (self.diceAdv > 0) self.diceAdv--
  if (self.magReflect > 0) self.magReflect--
  if (self.noDefend > 0) self.noDefend--
  if (self.missDown > 0) self.missDown--
  if (self.rage > 0) { self.rage--; if (self.rage === 0) self.cd[0] = 2 }
  if (self.luckBuff > 0) { self.luckBuff--; if (self.luckBuff === 0) self.cd[0] = 2 }
  if (foe.sunder > 0) foe.sunder--
  if (self.sigEye) self.shield = Math.min(Math.round(ds.maxhp * SIG_SHIELD_CAP), self.shield + Math.round(ds.maxhp * SIG_SHIELD_REGEN))   // 지능100 시그: 매턴 마나실드 회복(시전 중에도)
  if (self.stun > 0) {
    // 메테오: 시전 시작 후엔 돌이킬 수 없음 — 기절 중에도 그대로 진행(끊기 불가)
    if (self.cast > 0 && self.castName === '메테오') {
      self.cast--; self.stun--; self.defCombo = 0; self.defendedLast = false
      if (self.cast === 0) { const b = foe.hp; foe.hp -= absorb(foe, spellDmg(self.castDmg || spellBase(ds, '메테오'), foe, df)); return { type: 'castfire', dmg: b - foe.hp, spell: '메테오' } }
      return { type: 'stun', stunLeft: self.stun }
    }
    if (self.cast > 0) { self.cast = 0; self.castCarry = 1 }   // 그 외 시전은 기절에 즉시 취소(충전 일부 잔존)
    self.stun--; self.defCombo = 0; self.defendedLast = false; self.stunned = true
    // 행동불능 중 쓸 스킬(마법사 충격파 / 광전사 재생의광기)이 있으면 플레이어·AI가 선택, 없으면 자동 스킵
    if (!stunSkill(self, foe, ds, df)) return { type: 'stun', stunLeft: self.stun }
    return null   // 제한된 턴 진행 — self.stunned=true 로 옵션 제한(공격/일반스킬 불가, 충격파/재생 or 턴넘기기)
  }
  // 시전 진행(캐스터 공통): 카운트다운 후 발사
  if (self.cast > 0) { self.cast--; if (self.cast === 0) { const b = foe.hp; foe.hp -= absorb(foe, spellDmg(self.castDmg || spellBase(ds, '화염구'), foe, df)); return { type: 'castfire', dmg: b - foe.hp, spell: self.castName || '화염구' } } return { type: 'cast', spell: self.castName || '화염구', left: self.cast, total: self.castTotal } }
  return null
}
function ctxFor (self, foe, ds, df) {
  const inc = estAtk(df, ds)   // 상대의 다음 피격 추정
  // safe = 시전 리스크 판단: 시전 중 무방비로 ~4턴 피격 견딜 수 있어야 안전(물리 즉발은 이 게이트 안 씀)
  return { est: estAtk(ds, df), foeTurn: inc, incoming: Math.max(0, inc * 1.3 - self.shield), safe: (self.hp + self.shield) > inc * 4 }
}
// 불굴 버스트 완충: 단일 피격이 최대HP 15%↑면 즉시 6% 회복(생존 시). df=피격자 파생. 딜 표기는 회복 전 값 사용
function bigHitHeal (foe, df, dealt) { if (foe.불굴 && foe.hp > 0 && dealt >= df.maxhp * 0.15) foe.hp = Math.min(df.maxhp, foe.hp + Math.round(df.maxhp * 0.04)) }
function execSkill (self, foe, ds, df, sk) { const fb = foe.hp, sb = self.hp, psh = foe.shield; self.didAttack = false; self.lastDef = null; self.meteorImmune = false; self.multiHits = null; sk.exec(self, foe, ds, df); self.defCombo = 0; self.defendedLast = false; const dealt = Math.max(fb - foe.hp, 0); { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dealt > 0) self.hp -= Math.max(Math.round(dealt * tp), 1) } bigHitHeal(foe, df, dealt); return { type: 'skill', name: sk.name, dmg: dealt, note: self.note, crit: self.lastCrit, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, boltCombo: self.boltCombo, boltShots: self.boltShots, def: self.lastDef, attacked: self.didAttack, broke: self.brokeCast, grazed: self.grazed, shieldAbsorb: Math.max(psh - foe.shield, 0), selfDmg: Math.max(sb - self.hp, 0), diceAtk: self.diceAtk, diceDef: self.diceDef, meteorImmune: self.meteorImmune, multiHits: self.multiHits, dmgType: sk.dmgType } }
function execAttack (self, foe, ds, df) { const fb = foe.hp, psh = foe.shield; let dmg = attack(self, foe, ds, df, foe.defending); if (foe.vuln > 0) foe.vuln--; dmg = absorb(foe, dmg); foe.hp -= dmg; const dealt = Math.max(fb - foe.hp, 0); self.defCombo = 0; self.defendedLast = false; { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dmg > 0) self.hp -= Math.max(Math.round(dmg * tp), 1) } bigHitHeal(foe, df, dealt); return { type: 'attack', dmg: dealt, crit: self.lastCrit, bolt: self.lastBolt, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, boltCombo: self.boltCombo, boltShots: self.boltShots, def: self.lastDef, broke: self.brokeCast, grazed: self.grazed, shieldAbsorb: Math.max(psh - foe.shield, 0), diceAtk: self.diceAtk, diceDef: self.diceDef } }
// 방어 회복: maxhp 5% + 체력/2 고정(장기전 복리 완화)
function execDefend (self, ds) { const before = self.hp; self.hp = Math.min(ds.maxhp, self.hp + ds.maxhp * 0.05 + ds.base.체력 / 2); self.defending = true; self.defCombo++; self.defendedLast = true; return { type: 'defend', heal: Math.round(self.hp - before) } }
// 순수버프 스킬(턴만 소모, 공격/방어 없음) — AI 생존여유 게이트 대상. 재생의광기 등 '공격 겸용'은 제외
const BUFF_SKILLS = new Set(['광폭화', '인스턴트캐스팅', '2d20', '볼트마법조합', '방패들기', '룬각인', '피의각성', '마법반사', '오토스펠'])
// 행동불능(기절) 중 쓸 수 있는 스킬 — 스킬의 stunnable 플래그 + 기존 ready 조건 재사용(하드코딩 제거). 없으면 null
function stunUsableSkill (self, foe, ds, df) { return (SKILLS[self.name] || []).find(s => s.stunnable && s.ready(self, foe, ds, df)) || null }
function stunSkill (self, foe, ds, df) { const sk = stunUsableSkill(self, foe, ds, df); return sk ? sk.name : null }
// 기절 중 실행: 동작이 다르면 stunExec(예: 재생의광기=회복만), 아니면 일반 exec 재사용(충격파)
function execStunSkill (self, foe, ds, df) { const sk = stunUsableSkill(self, foe, ds, df); if (!sk) return { type: 'skip' }; return sk.stunExec ? sk.stunExec(self, foe, ds, df) : execSkill(self, foe, ds, df, sk) }
function execSkip (self) { self.defending = false; return { type: 'skip' } }   // 턴넘기기(이점 미정 — 일단 순수 패스)
function aiTurn (self, foe, ds, df) {
  const forced = upkeep(self, foe, ds, df); if (forced) return forced
  if (self.hp <= 0) return { type: 'skip' }   // 출혈 등으로 upkeep 중 사망 → 행동 없음(종료는 루프에서)
  if (self.stunned) return execStunSkill(self, foe, ds, df)   // 기절 중: 쓸 스킬 있으면 사용(AI는 항상 사용 = 기존 자동발동과 동일)
  // 상대 시전 중이면 AI 유형 무관하게 '차단기'만 우선 사용(방어적도 시전은 끊음)
  if (foe.cast > 0 && self.silence === 0) {
    const cx = ctxFor(self, foe, ds, df)
    const intr = SKILLS[self.name].find(sk => ['방해', '돌진', '암습', '약점봉인', '시전파괴', '입막음', '방패가격'].includes(sk.name) && sk.ready(self, foe, ds, df, cx))
    if (intr) return execSkill(self, foe, ds, df, intr)
  }
  // 방어 판단(AI별): 공격적=치명일 때만 / 방어적=저HP 선제 / 판단형=치명 직전. (회복스킬은 아래 스킬선택서 HP게이트로 처리)
  if (decideDefend(self, foe, ds, df)) return execDefend(self, ds)
  // 스킬 선택: 침묵 아니면 점수 최고. 제어는 이미 고점수(우선), 버프는 AI 생존여유 게이트
  if (self.silence === 0) {
    const ctx = ctxFor(self, foe, ds, df); let best = null, bestScore = ctx.est
    for (const sk of SKILLS[self.name]) {
      if (!sk.ready(self, foe, ds, df, ctx)) continue
      if (BUFF_SKILLS.has(sk.name) && !buffOk(self.ai, self.hp, Math.max(0, ctx.foeTurn - self.shield))) continue   // 버프는 여유 있을 때만(공격적은 항상)
      const sc = sk.score(self, foe, ds, df, ctx); if (sc > bestScore) { bestScore = sc; best = sk }
    }
    if (best) return execSkill(self, foe, ds, df, best)
  }
  return execAttack(self, foe, ds, df)   // 스킬 없음(침묵 등) → 평타(볼트마법사는 매직미사일)
}
function initBattle (meName, oppName, oppAI) {
  const dA = derive(CHARS[meName]), dB = derive(CHARS[oppName])
  const tA = pickTitle(), tB = pickTitle()
  if (tA.d) tA.d(dA); if (tB.d) tB.d(dB)
  const A = mkFighter(dA, meName, null), B = mkFighter(dB, oppName, oppAI)
  if (tA.flag) A[tA.flag] = true; if (tB.flag) B[tB.flag] = true
  return { A, B, dA, dB, maxA: dA.maxhp, maxB: dB.maxhp, meName, oppName, oppAI, oppNick: pickArr(NICKS), meTitle: tA.name, oppTitle: tB.name, t: 0, log: [] }
}
// 현재 시점 프레임: 양쪽 HP + 버프/디버프(위아래 분리용) 스냅샷
function snapFrame (state) {
  const ga = statusGroups(state.A), gb = statusGroups(state.B)
  return { aHp: Math.round(Math.max(state.A.hp, 0)), bHp: Math.round(Math.max(state.B.hp, 0)), aBuf: ga.buffs.join(' '), aDeb: ga.debuffs.join(' '), bBuf: gb.buffs.join(' '), bDeb: gb.debuffs.join(' ') }
}
function recEntry (state, who, ev) {
  const other = who === 'me' ? state.B : state.A, otherMax = who === 'me' ? state.maxB : state.maxA
  const self = who === 'me' ? state.A : state.B, selfMax = who === 'me' ? state.maxA : state.maxB
  const base = { who, hp: Math.round(Math.max(other.hp, 0)), max: otherMax, selfHp: Math.round(Math.max(self.hp, 0)), selfMax }
  // 순차공개 동기화: 이벤트 시점 양쪽 HP·버프·디버프 스냅샷 — 인터랙티브(state.shown 설정)에서만(시뮬 성능 보호)
  if (state.shown != null) Object.assign(base, snapFrame(state))
  state.log.push(Object.assign(base, ev))
}
function reviveRec (state, who) { const f = who === 'me' ? state.A : state.B, mx = who === 'me' ? state.maxA : state.maxB; state.log.push({ who, type: 'revive', hp: Math.max(f.hp, 0), max: mx, rtype: f.reviveType }) }
// 턴 기록: upkeep이 남긴 tick 이벤트(출혈/덫 발동)를 먼저 로그에 풀고, 본 행동 이벤트를 기록
function recTurn (state, who, f, ev) { if (f._tick && f._tick.length) { for (const t of f._tick) recEntry(state, who, t); f._tick = [] } if (ev && ev.type === 'skip' && f.hp <= 0) return; recEntry(state, who, ev) }   // 출혈로 죽은 턴의 빈 스킵은 기록 생략(koLog가 처리)
function koLog (state) { const dead = state.B.hp <= 0 ? 'opp' : (state.A.hp <= 0 ? 'me' : null); if (dead) { const mx = dead === 'me' ? state.maxA : state.maxB; state.log.push(Object.assign({ who: dead, type: 'ko', hp: 0, max: mx }, snapFrame(state))) } }   // 전투 종료 시 쓰러진 쪽 로그
function stateResult (state) { return { winner: state.winner, log: state.log, meTitle: state.meTitle, oppTitle: state.oppTitle, oppNick: state.oppNick, meMax: state.maxA, oppMax: state.maxB, meHp: Math.max(state.A.hp, 0), oppHp: Math.max(state.B.hp, 0) } }

// 자동 전투(밸런스 시뮬/관전용): 양쪽 AI
function runBattle (meName, oppName, meAI, oppAI) {
  const state = initBattle(meName, oppName, oppAI); state.A.ai = meAI
  const { A, B, dA, dB } = state; const DT = 0.1
  while (A.hp > 0 && B.hp > 0 && state.t < 600) {
    A.gauge -= DT; B.gauge -= DT; state.t += DT
    if (A.gauge <= 0) { A.gauge = resetGauge(A, dA); recTurn(state, 'me', A, aiTurn(A, B, dA, dB)); if (reviveCheck(B, dB)) reviveRec(state, 'opp') }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = resetGauge(B, dB); recTurn(state, 'opp', B, aiTurn(B, A, dB, dA)); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  }
  koLog(state)
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
      if (A._tick && A._tick.length) { for (const t of A._tick) recEntry(state, 'me', t); A._tick = [] }   // 출혈/덫 발동 로그 먼저
      if (A.hp <= 0) { koLog(state); state.winner = 'opp'; return 'end' }   // 출혈로 사망 시 종료
      if (forced) { recEntry(state, 'me', forced); if (reviveCheck(B, dB)) reviveRec(state, 'opp'); if (B.hp <= 0) break; continue }
      return 'player' // 플레이어 upkeep 완료, 행동 선택 대기
    }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = resetGauge(B, dB); recTurn(state, 'opp', B, aiTurn(B, A, dB, dA)); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  }
  koLog(state)
  state.winner = state.t >= 600 ? 'draw' : (A.hp > 0 ? 'me' : 'opp')
  return 'end'
}
// 플레이어 행동 실행 후 다음 플레이어 턴까지 진행
// 캐릭당 패시브 배열(여러 개 가능). 버튼/설명에서 순회. 최대 5(스킬줄 총합).
const PASSIVES = { 기사: [{ name: '완벽방어!', desc: '방패막기를 연속 2회 성공하면 받는 피해의 70%를 공격자에게 즉시 반사 — 방패들기(막기 90%)와 강시너지' }], 세이지: [{ name: '원소스택', desc: '3타마다 원소폭발 ×1.3' }, { name: '현자의 균형', desc: '힘·지능 둘 다 숙련할수록 상시 피해감소(둘 중 낮은 값 기준, 세이지 15%). 하이브리드 전용' }], 광전사: [{ name: '불굴', desc: '전투당 1회, 죽을 피해를 받으면 최대HP 10% 회복해 생존(직후 2턴 취약)' }, { name: '광란', desc: '체력이 낮을수록 받는 제어 감소 + 공격력 급증(2차곡선, 빈사에서 폭발)' }], 스펠브레이커: [{ name: '마도갑주', desc: '마법 갑옷 오라 — 상시 물리 방어 +12%p' }], 한탕주의자: [{ name: '행운의여신', desc: '받는 피해마다 행운 비례 확률(행운100=10%)로 그 피해를 1로 — 전 타입(마법·볼트도)' }], 암살자: [{ name: '연속타격', desc: '공격 시 20% 확률로 한 번 더 타격(추가타는 크리 안 터짐)' }], 볼트마법사: [{ name: '볼트마법마스터', desc: '볼트마법 사용 시 원소당 확정 5발(조합 시 5+5=10발). 마스터 없으면 1~5 랜덤' }] }
function playerResolve (state, choice) {
  const { A, B, dA, dB } = state
  let ev
  if (A.stunned) ev = (choice === 'skip') ? execSkip(A) : execStunSkill(A, B, dA, dB)   // 기절 중: 턴넘기기 or 기절스킬(충격파/재생)만
  else if (choice === 'skip') ev = execSkip(A)
  else if (choice === 'defend') ev = execDefend(A, dA)
  else if (/^s\d+$/.test(choice)) {
    const slot = parseInt(choice.slice(1), 10)
    ev = playerCanUse(state, slot).usable ? execSkill(A, B, dA, dB, SKILLS[state.meName][slot]) : execAttack(A, B, dA, dB)
  } else ev = execAttack(A, B, dA, dB)
  recEntry(state, 'me', ev); if (reviveCheck(B, dB)) reviveRec(state, 'opp')
  if (B.hp <= 0) { koLog(state); state.winner = 'me'; return 'end' }
  return advance(state)
}
// 플레이어 스킬 사용 가능 판정(AI 자제 휴리스틱 제외, 진짜 게이트만)
function playerCanUse (state, slot) {
  const { A, B, dB } = state; const name = SKILLS[state.meName][slot].name
  if (A.silence > 0) return { usable: false, reason: '침묵' }
  if (A.cd[slot] > 0) return { usable: false, reason: `${A.cd[slot]}턴 후` }
  if (name === '처형' && !(B.hp < dB.maxhp * 0.25)) return { usable: false, reason: '상대 HP 25%↓ 필요' }
  if ((name === '암습' || name === '돌진') && B.stun > 0) return { usable: false, reason: '상대 기절 중' }
  if ((name === '화염구' || name === '메테오' || name === '서리구') && A.cast > 0) return { usable: false, reason: '시전 중' }
  if (name === '인스턴트캐스팅' && A.instCast > 0) return { usable: false, reason: '즉시시전 중' }
  if (name === '방패들기' && A.blockUp > 0) return { usable: false, reason: '유지 중' }
  if ((name === '룬각인' || name === '피의각성') && A.powBuff > 0) return { usable: false, reason: '유지 중' }
  if (name === '백스텝' && A.dodgeUp > 0) return { usable: false, reason: '유지 중' }
  if (name === '마법반사' && A.magReflect > 0) return { usable: false, reason: '유지 중' }
  if (name === '오토스펠' && A.autoSpell > 1) return { usable: false, reason: '유지 중' }
  // 버프 유지 중엔 재사용 방지(직관적 비활성 + 낭비 방지)
  if (name === '광폭화' && A.rage > 0) return { usable: false, reason: '광폭 중' }
  if (name === '2d20' && A.diceAdv > 0) return { usable: false, reason: '폭발 중' }
  if (name === '볼트마법조합' && A.chainBolt > 1) return { usable: false, reason: '유지 중' }
  return { usable: true }
}
function playerOptions (state) {
  const { A, B, meName, dA, dB } = state; const sks = SKILLS[meName]
  const stunned = A.stunned === true
  const stunSk = stunned ? stunSkill(A, B, dA, dB) : null   // 기절 중 유일하게 쓸 수 있는 스킬 이름
  // 인캐(instCast) 중 즉발 여부 힌트: 화염구=즉시 / 메테오=즉발불가(인캐 낭비 방지 안내)
  const one = (slot) => { const nm = sks[slot].name; let u = playerCanUse(state, slot); if (stunned) u = (nm === stunSk) ? { usable: true } : { usable: false, reason: '기절' }; const inst = A.instCast > 0 ? ((nm === '화염구' || nm === '서리구') ? '즉시' : nm === '메테오' ? '즉발불가' : null) : null; return { name: nm, base: SKILL_CD[nm], usable: u.usable, reason: u.reason, inst } }
  return { canDefend: !stunned && A.noDefend === 0, skills: sks.map((_, i) => one(i)), passives: PASSIVES[meName] || [], stunned }
}

// ── UI + 내레이션 ──
const BAR = 12
function hpBar (cur, max, len = BAR) {
  cur = Math.max(0, Math.round(cur))
  const pct = Math.max(0, Math.min(1, cur / max))
  const fill = Math.round(pct * len)
  return '█'.repeat(fill) + '░'.repeat(len - fill) + ` ${cur}/${max} (${Math.round(pct * 100)}%)`
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
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100) * (c.체력 === 100 && w.hands === 1 ? 1.3 : 1) * (c.솜씨 === 100 && c.무기 === '활' ? 1.05 : 1) * (c.행운 === 100 && c.무기 === '주사위' ? 1.2 : 1)), 마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    // 턴: 무기 반영(tempoVal) — derive와 동일 공식
    턴: Math.round(Math.max((10 - step(tempoVal(w, c), 0.7)) * (w.tempoMul || 1), 2) * 10) / 10
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
  // 내역은 흡수(마나실드) 전 값이라, 실제 피해(ev.dmg)에 비례 재배분해 총합과 일치시킴
  const hurtBd = () => {
    if (ev.ph != null) {   // 세이지 혼합: 물리 + 마법평타 + 오토스펠 볼트(원소묶음)
      const boltRaw = (ev.boltHits || []).reduce((a, b) => a + b, 0)
      const raw = ev.ph + ev.mg + boltRaw
      if (raw <= 0) return hurt(ev.dmg)
      const ph = Math.round(ev.ph / raw * ev.dmg); const mg = Math.round(ev.mg / raw * ev.dmg); const boltTotal = ev.dmg - ph - mg
      let s = mg > 0 ? `물리 **${ph}** + 마법 **${mg}**` : (ph > 0 ? `물리 **${ph}**` : '')
      if (ev.boltHits && ev.boltHits.length && boltTotal > 0) s += (s ? ' + ' : '') + boltGroupStr(ev.boltHits, ev.boltNames, boltTotal)
      return `${te} **${T}**${eun(T)} ${s} (총 **${ev.dmg}**)의 피해를 입었다.`
    }
    if (ev.boltHits && ev.boltHits.length > 1) { const combo = ev.boltCombo ? '🔗**원소조합!** ' : ''; return `${te} **${T}**${eun(T)} ${combo}✨${boltGroupStr(ev.boltHits, ev.boltNames, ev.dmg)} 총 **${ev.dmg}**의 피해를 입었다.` }
    if (ev.multiHits && ev.multiHits.length > 1) return `${te} **${T}**${eun(T)} 🏹연사 ${ev.multiHits.map(h => h > 0 ? `**${h}**` : '빗나감').join('·')} 총 **${ev.dmg}**의 피해를 입었다.`
    return hurt(ev.dmg)
  }
  const boltTag = ev.boltName ? `✨**${ev.boltName}** 발동! ` : ''
  // 방어 성공(피해는 일부 들어간 경우) 태그
  const defTag = ev.def === '완벽방어' ? ` 🛡️✨**${T} 완벽방어!**(반격)` : (ev.def === '방패막기' || ev.def === '무기막기') ? ` 🛡️*${T} ${ev.def}!*` : (ev.def === '행운의여신' ? ` 🍀**행운의 여신!**(피해 1)` : '')
  const brokeTag = ev.broke ? ` ⚡**${T} 시전 중단!**` : ''
  const meteorTag = ev.meteorImmune ? ` 🌠**하지만 ${T}의 메테오 시전은 막을 수 없다!**` : ''
  const forceTag = ev.dmgType === '역장' ? '🟣' : ''   // 역장피해 마커(방어무시) — 스킬 dmgType 기반(하드코딩 제거)
  const shieldTag = ev.shieldAbsorb > 0 ? ` 🔷*마나실드 ${ev.shieldAbsorb} 흡수*` : ''   // 피격으로 상대 시전 차단
  const grazeTag = (ev.grazed && !ev.crit) ? ` 🌫️*빗맞음*` : ''   // 비껴맞음(×0.70) — 치명타와 공존 시 표기 생략
  const diceTag = (ev.diceAtk ? ` 🎲**공격 ${ev.diceAtk}**${ev.diceAtk === 20 ? '💥대성공!' : ev.diceAtk === 1 ? '💢대실패!' : ''}` : '') +
    (ev.diceDef ? ` 🎲**방어 ${ev.diceDef}**(${T})${ev.diceDef === 20 ? '🛡️완벽!' : ev.diceDef === 1 ? '💢실패!' : ''}` : '')   // 한탕 주사위 굴림 표시(공격=자기 평타 d20 / 방어=피격 시 d20)
  // 완전 무피해: 회피/천운/빗나감 구분
  const evadeLine = () => {
    if (ev.shieldAbsorb > 0) return `🔷 ${te} **${T}**${iga(T)} 마나실드로 ${ae} **${A}**의 공격 **${ev.shieldAbsorb}**를 모두 흡수했다!`
    if (ev.def === '회피') return `💨 ${te} **${T}**${iga(T)} ${ae} **${A}**의 공격을 날렵하게 회피했다!`
    if (ev.def === '천운' || ev.def === '완전회피') return `🍀 ${te} **${T}**${iga(T)} 천운으로 ${ae} **${A}**의 일격을 흘려냈다!`
    return `💨 ${ae} **${A}**의 공격이 빗나갔다. ${te} **${T}**${eun(T)} 피해를 입지 않았다.`
  }
  switch (ev.type) {
    case 'attack':
      if (ev.dmg <= 0) return evadeLine()
      if (ev.crit) return `💥 ${ae} **${A}**의 ${ev.ph != null ? '혼합 ' : ''}공격이 치명타로 적중!${diceTag} ${boltTag}${hurtBd()}${defTag}${shieldTag}${brokeTag}`
      return `${ev.ph != null ? '⚔️' : (ev.bolt ? '✨' : '⚔️')} ${ae} **${A}**의 ${ev.ph != null ? '혼합 공격' : '공격'}!${diceTag} ${boltTag}${hurtBd()}${defTag}${grazeTag}${shieldTag}${brokeTag}`
    case 'skill': {
      const head = `⚡ ${ae} **${A}**${iga(A)} '${ev.name}'${eul(ev.name)} 사용!${ev.note ? ` [${ev.note}]` : ''}`
      { const back = ev.selfDmg > 0 ? ` (**${A}**도 반동으로 **${ev.selfDmg}** 피해)` : ''
        if (ev.dmg > 0) return `${head}${diceTag} ${ev.crit ? '치명타! ' : ''}${boltTag}${forceTag}${hurtBd()}${defTag}${grazeTag}${shieldTag}${brokeTag}${meteorTag}${back}`
        if (ev.name === '화염구') return head // 시전 시작(딜 없음)
        if (!ev.attacked) return `${head}${back}` // 공격 안 하는 버프/방어 스킬(마력충전 등) → 미스 문구 없이
        const miss = ev.shieldAbsorb > 0 ? `하지만 ${T}${iga(T)} 마나실드로 **${ev.shieldAbsorb}** 모두 흡수 🔷` : ev.def === '회피' ? `하지만 ${T}${iga(T)} 회피했다 💨` : (ev.def === '천운' || ev.def === '완전회피') ? `하지만 ${T}${iga(T)} 천운으로 흘렸다 🍀` : '하지만 공격은 빗나갔다 💨'
        return `${head} ${miss}${brokeTag}${meteorTag}${back}` }
    }
    case 'defend': return `🛡️ ${ae} **${A}**${eun(A)} 방어 태세!${ev.heal > 0 ? ` 체력을 **${ev.heal}** 회복` : ''} (HP ${ev.selfHp}/${ev.selfMax})`
    case 'trapspring': return `🪤 ${ae} **${A}**${iga(A)} 사냥꾼덫을 밟았다! 발이 묶이고(둔화) 🩸출혈 시작!`
    case 'bleed': return `🩸 ${ae} **${A}**${eun(A)} 출혈로 **${ev.dmg}** 피해!${ev.left > 0 ? ` (출혈 ${ev.left}턴 남음)` : ''}`
    case 'ko': return `💀 ${ae} **${A}**${iga(A)} 쓰러졌다! 체력이 바닥났다.`
    case 'skip': return `⏭️ ${ae} **${A}**${iga(A)} 턴을 넘겼다.`
    case 'stun': return `😵 ${ae} **${A}**${eun(A)} 기절해 움직이지 못한다.${ev.stunLeft > 0 ? ` (기절 ${ev.stunLeft}턴 남음)` : ' 💫 다음 턴 해제!'}`
    case 'cast': return `🔮 ${ae} **${A}**${iga(A)} ${ev.spell || '화염구'}${eul(ev.spell || '화염구')} 시전하고 있다… ${ev.total ? `**[${ev.total - ev.left}/${ev.total}]**` : ''}`
    case 'castfire': { const sp = ev.spell || '화염구'; return ev.dmg > 0 ? `☄️ ${ae} **${A}**의 ${sp}${iga(sp)} 작렬! ${hurt(ev.dmg)}` : `🍀 ${te} **${T}**${iga(T)} ${ae} **${A}**의 ${sp}${eul(sp)} 천운으로 흘려냈다!` }
    case 'revive': return ev.rtype === 'undying'
      ? `🩸 ${ae} **${A}**${eun(A)} 불굴로 치명상을 버텨내며 일어섰다! (잠시 취약)`
      : `✨ ${ae} **${A}**${eun(A)} 죽음을 딛고 다시 일어섰다!`
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
// 상태태그: {buffs, debuffs} 두 그룹(위아래 분리용). 각 지속효과에 남은턴 표기.
function statusGroups (f) {
  const deb = [], buf = []
  // 디버프(남은턴 표기)
  if (f.stun > 0) deb.push(`😵기절${f.stun}`)
  if (f.vuln > 0 || f.instVuln > 0) deb.push(`💥취약${Math.max(f.vuln, f.instVuln)}`)
  if (f.slow > 0) deb.push(`🐢둔화${f.slow}`)
  if (f.silence > 0) deb.push(`🔇침묵${f.silence}`)
  if (f.luckLock > 0) deb.push(`🍀봉인${f.luckLock}`)
  if (f.blind > 0) deb.push(`🌀실명${f.blind}`)
  if (f.noDefend > 0) deb.push(`🚫방어불가${f.noDefend}`)
  if (f.healBlock > 0) deb.push(`💔회복불가${f.healBlock}`)
  if (f.missDown > 0) deb.push(`🎯명중↓${f.missDown}`)
  if (f.sunder > 0) deb.push(`💢방어약화${f.sunder}`)
  if (f.weaponBroken > 0) deb.push(`🔨무기파괴${f.weaponBroken}`)
  if (f.trap > 0) deb.push(`🪤덫${f.trap}`)
  if (f.bleed > 0) deb.push(`🩸출혈${f.bleed}`)
  // 버프(남은턴/스택 표기)
  if (f.rage > 0) buf.push(`🔥광폭${f.rage}`)
  if (f.powBuff > 0) buf.push(`💪공격강화${f.powBuff}`)
  if (f.blockUp > 0) buf.push(`🛡️방패강화${f.blockUp}`)
  if (f.dodgeUp > 0) buf.push(`🌀회피${f.dodgeUp}`)
  if (f.magReflect > 0) buf.push(`🔮마법반사${f.magReflect}`)
  if (f.elemStack > 0) buf.push(`🔥원소${f.elemStack}`)
  if (f.luckBuff > 0) buf.push(`🍀행운폭주${f.luckBuff}`)
  if (f.diceAdv > 0) buf.push(`🎲어드밴티지${f.diceAdv}`)
  if (f.chainBolt > 0) buf.push(`🔗볼트마법조합${f.chainBolt}`)
  if (f.autoSpell > 0) buf.push(`📜주문각인${f.autoSpell}`)
  if (f.healRegen > 0) buf.push(`💚재생${f.healRegen}`)
  if (f.instCast > 0) buf.push(`⚡즉시시전${f.instCast}`)
  if (f.thornsBase > 0) buf.push('🌵가시')   // 상시 패시브(턴 없음)
  if (f.shield > 0) buf.push(`🔷실드${f.shield}`)
  if (f.cast > 0) { const tot = f.castTotal || f.cast; buf.push(`🔮${f.castName || '시전'} ${tot - f.cast}/${tot}`) }
  return { buffs: buf, debuffs: deb }
}
function statusTags (f) { const g = statusGroups(f); return [...g.debuffs, ...g.buffs].join(' ') }   // 하위호환(단일 문자열)
// 공개된 마지막 로그 시점의 프레임(HP·버프·디버프) — 순차공개 동기화. 완전 공개면 라이브 상태
function frameAt (state, shown) {
  if (shown == null || shown >= state.log.length) return snapFrame(state)
  for (let i = shown - 1; i >= 0; i--) { const ev = state.log[i]; if (ev.aHp != null) return ev }
  return snapFrame(state)
}
function buildBattleEmbed (state) {
  const { meName, oppName, memberId, meTitle, oppTitle, oppAI, oppNick } = state
  const shown = state.shown == null ? state.log.length : state.shown   // 순차 공개: 공개된 로그까지만
  const recent = state.log.slice(0, shown).slice(-8).map(ev => narrateLine(ev, meName, oppName))
  const footer = state.revealing ? '⏳ 진행 중…' : '🎯 **네 차례!** 행동을 골라줘'
  const fr = frameAt(state, shown)   // 공개 시점 프레임(체력·버프·디버프 실시간 동기화)
  const buffLine = (s) => s ? `🟢 ${s}\n` : ''      // 버프 = 캐릭명 위
  const debLine = (s) => s ? `🔴 ${s}\n` : ''       // 디버프 = 캐릭명 아래
  const desc =
    // 상단: 상대 (버프 위 · 이름 · 디버프 아래 · HP)
    buffLine(fr.bBuf) +
    `${CHARS[oppName].emoji} **${oppName}**: ${titleTag(oppTitle)} **${oppNick}** · ${oppAI} AI\n` +
    debLine(fr.bDeb) +
    `\`${hpBar(fr.bHp, state.maxB, 18)}\`\n\n` +
    // 중앙: 로그
    (recent.length ? recent.join('\n') + '\n\n' : '') +
    // 하단: 나 (버프 위 · 이름 · 디버프 아래 · HP — 버튼 바로 위)
    buffLine(fr.aBuf) +
    `${CHARS[meName].emoji} **${meName}**: ${titleTag(meTitle)} <@${memberId}>\n` +
    debLine(fr.aDeb) +
    `\`${hpBar(fr.aHp, state.maxA, 18)}\`\n` +
    footer
  return new EmbedBuilder().setTitle('⚔️ 듀얼 — 전투 중').setColor(0x3498db)
    .setDescription(desc.length > 4090 ? '…' + desc.slice(-4089) : desc)
}
function buildBattleRow (state) {
  const o = playerOptions(state); const mid = state.memberId
  const cid = (c) => JSON.stringify({ action: 'duel', op: 'act', c, memberId: mid })
  const skLbl = (s) => {
    if (!s.usable) return `${s.name} · ${s.reason}`
    const pre = s.inst === '즉시' ? '⚡' : '✨'
    const suf = s.inst ? ` · ${s.inst}` : ''
    return `${pre} ${s.name}${suf}${typeof s.base === 'number' ? ` (쿨${s.base})` : ''}`
  }
  // 1줄=행동(공격/방어), 2줄=스킬(+패시브) — 스킬 쿨타임 항상 노출. 스킬 4개까지 대비
  const actionBtns = [
    new ButtonBuilder().setCustomId(cid('attack')).setLabel(o.stunned ? '⚔️ 공격 · 기절' : '⚔️ 공격').setStyle(ButtonStyle.Danger).setDisabled(o.stunned),
    new ButtonBuilder().setCustomId(cid('defend')).setLabel(o.canDefend ? '🛡️ 방어' : (o.stunned ? '🛡️ 방어 · 기절' : '🛡️ 방어 · 봉쇄')).setStyle(ButtonStyle.Secondary).setDisabled(!o.canDefend),
    new ButtonBuilder().setCustomId(cid('skip')).setLabel('⏭️ 턴넘기기').setStyle(ButtonStyle.Secondary)
  ]
  const skillBtns = []
  o.skills.forEach((sk, i) => skillBtns.push(new ButtonBuilder().setCustomId(cid('s' + i)).setLabel(skLbl(sk)).setStyle(ButtonStyle.Primary).setDisabled(!sk.usable)))
  o.passives.forEach((p, i) => { if (skillBtns.length < 5) skillBtns.push(new ButtonBuilder().setCustomId(cid('passive' + i)).setLabel(`🔒 ${p.name}(패시브)`).setStyle(ButtonStyle.Secondary).setDisabled(true)) })
  const rows = [new ActionRowBuilder().addComponents(actionBtns)]
  if (skillBtns.length) rows.push(new ActionRowBuilder().addComponents(skillBtns.slice(0, 5)))
  return rows
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
// 순차 공개: 새 로그 엔트리를 1개씩(턴 종료마다) 편집 공개. 마지막에 버튼/결과 표시
async function revealTurns (interaction, state, phase, ctx) {
  const REVEAL_MS = 1000
  const target = state.log.length
  const start = state.shown || 0
  const renderFinal = () => {
    state.revealing = false; state.shown = target
    if (phase === 'end') return { embeds: [buildResultEmbed(stateResult(state), ctx.me, ctx.opp, ctx.mid, ctx.ai)], components: [buildResultRow(ctx.me, ctx.opp, ctx.ai, ctx.mid)] }
    return { embeds: [buildBattleEmbed(state)], components: buildBattleRow(state) }
  }
  try {
    if (target <= start) { await interaction.update(renderFinal()); if (phase === 'end') SESSIONS.delete(ctx.msgId); return }
    let acked = false
    for (let s = start + 1; s <= target; s++) {
      const last = (s === target)
      state.shown = s
      let payload
      if (last) payload = renderFinal()
      else { state.revealing = true; payload = { embeds: [buildBattleEmbed(state)], components: [] } }
      if (!acked) { await interaction.update(payload); acked = true } else { await interaction.editReply(payload) }
      if (!last) await sleep(REVEAL_MS)
    }
    if (phase === 'end') SESSIONS.delete(ctx.msgId)
  } catch (e) { state.revealing = false; state.shown = target }   // 편집 실패 시 상태 정리(다음 클릭에서 복구)
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
    const state = initBattle(info.me, info.opp, info.ai); state.memberId = mid; state.shown = 0
    const phase = advance(state)
    if (phase !== 'end') SESSIONS.set(interaction.message.id, { state, me: info.me, opp: info.opp, ai: info.ai, memberId: mid, ts: Date.now() })
    await revealTurns(interaction, state, phase, { me: info.me, opp: info.opp, ai: info.ai, mid, msgId: interaction.message.id })
  } else if (info.op === 'act') {
    const sess = SESSIONS.get(interaction.message.id)
    if (!sess) { await interaction.reply({ content: '전투 정보가 만료됐어~ `/듀얼`로 다시 시작해줘! ⚔️', ephemeral: true }); return }
    sess.ts = Date.now()
    const phase = playerResolve(sess.state, info.c)
    await revealTurns(interaction, sess.state, phase, { me: sess.me, opp: sess.opp, ai: sess.ai, mid, msgId: interaction.message.id })
  }
}

function _tune (o) { Object.assign(TUNE, o) }
module.exports = { CHARS, NAMES, AIS, TITLES, TUNE, _tune, runBattle, buildSelectEmbed, buildSelectRows, handleButton, SKILLS, CUSTOM_DEFS }

