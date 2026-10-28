// 듀얼 — 턴제 전투 게임 (설계: docs/battle-game-design.md / 밸런스: docs/battle-sim/battle-sim-latest.js)
// /듀얼 → 캐릭 선택 → 랜덤 상대+AI 매치업 → 전투 시작 시 타이틀 부여 + 자동 전투 + 극적 내레이션.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const rand = () => Math.random()
const step = (s, per) => Math.floor(s / 10) * per
const pickArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

const CHARS = {
  검투사: { emoji: '⚔️', 힘: 85, 지능: 10, 체력: 75, 민첩: 45, 솜씨: 60, 행운: 30, 무기: '소형방패', 무기의달인: true, id: '무기막기 검투사' },
  광전사: { emoji: '🪓', 힘: 100, 지능: 10, 체력: 40, 민첩: 65, 솜씨: 60, 행운: 35, 무기: '양도끼', 피의굶주림: true, id: '물리 광전사' },
  기사: { emoji: '🛡', 힘: 60, 지능: 10, 체력: 100, 민첩: 35, 솜씨: 68, 행운: 30, 무기: '대형방패', 완벽방어: true, id: '순수 탱커' },
  마법사: { emoji: '🔮', 힘: 10, 지능: 100, 체력: 60, 민첩: 30, 솜씨: 50, 행운: 45, 무기: '스태프', id: '스태프 마법사' },
  볼트마법사: { emoji: '✨', 힘: 10, 지능: 90, 체력: 50, 민첩: 55, 솜씨: 50, 행운: 45, 무기: '완드', boltMaster: true, id: '볼트 마법사' },
  암살도적: { emoji: '🗡', 힘: 45, 지능: 15, 체력: 35, 민첩: 100, 솜씨: 55, 행운: 55, 무기: '단검', 암습의대가: true, id: '스피드/회피/암살' },
  절개도적: { emoji: '🩸', 힘: 60, 지능: 20, 체력: 60, 민첩: 45, 솜씨: 70, 행운: 25, 무기: '단검', 상처전문가: true, id: '출혈 지속딜러' }, // 단검이되 회피물몸(암살) 대비 질긴 근접. 상처전문가=평타로 출혈 스택+상대 출혈만큼 회피↑
  사냥꾼: { emoji: '🏹', 힘: 55, 지능: 15, 체력: 45, 민첩: 55, 솜씨: 100, 행운: 40, 무기: '활', id: '저격/덫/카이팅' },
  갬블러: { emoji: '🎲', 힘: 30, 지능: 30, 체력: 30, 민첩: 50, 솜씨: 70, 행운: 100, 무기: '주사위', id: '확률/도박' }, // D20 주사위. 저체급·고행운(주사위방어·천운·저점보장). 패시브 없음(5액티브)
  세이지: { emoji: '📖', 힘: 60, 지능: 70, 체력: 55, 민첩: 45, 솜씨: 50, 행운: 30, 무기: '마도서', 원소마스터: true, 현자균형: true, id: '혼합 하이브리드' },
  스펠블레이드: { emoji: '⚡', 힘: 65, 지능: 60, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30, 무기: '검오브', id: '혼합 관통 스펠블레이드' },
  스펠브레이커: { emoji: '🪄', 힘: 30, 지능: 80, 체력: 65, 민첩: 50, 솜씨: 45, 행운: 30, 무기: '마도검', 마도갑주: 0.12, id: '안티캐스터 마딜' },
  무도가: { emoji: '👊', 힘: 55, 지능: 10, 체력: 50, 민첩: 75, 솜씨: 75, 행운: 40, 무기: '너클', 육합권: true, 투경: true, id: '콤보 무투가' },
  프리스트: { emoji: '✝️', 힘: 55, 지능: 30, 체력: 80, 민첩: 40, 솜씨: 90, 행운: 10, 무기: '양둔', 신성의무: true, id: '신성 탱커' }, // 높은체력·솜씨로 버티는 신성 탱커. 신성의무=물리평타에 신성 스플래시(참회 시너지). 스킬 힐·축복·성역·가호 + 신성한의무 패시브(합 5)
  참회사제: { emoji: '📿', 힘: 10, 지능: 85, 체력: 60, 민첩: 35, 솜씨: 45, 행운: 25, 무기: '스태프', id: '참회 신성 마딜러' }, // 신성 캐스트 램프 딜러. 모든 신성딜이 참회 스택(상대 최대체력% 확정관통)을 쌓고, 쌓일수록 강해짐 → 단죄로 소모·폭발. 스태프(castMod -2)라 시전 base=실효+2. 5액티브(패시브 없음)
  암흑기사: { emoji: '⚰️', 힘: 85, 지능: 10, 체력: 55, 민첩: 45, 솜씨: 55, 행운: 30, 무기: '양검', id: '침식 암흑기사' }, // 자기침식(최대체력↓) 도박형 대검. 암흑딜=물공 계수 마법.일반(마방/실드 판정). 침식 쌓아 종말로 전이+폭발, 영혼포식으로 흡혈. 5액티브(패시브 없음)
  드루이드: { emoji: '🌿', 힘: 35, 지능: 65, 체력: 55, 민첩: 75, 솜씨: 65, 행운: 10, 무기: '장창', 드루이드: true, id: '형상변환 드루이드' } // 인간형(재생+형상 4종) → 전투곰(탱·분노)/표범(딜·기력)/치타(회피·기력)/마나부엉이(마법·실드). 형상마다 스킬 5개가 통째로 바뀜
}
// 무기 정의: 캐릭은 CHARS.무기로 참조, derive()가 속성 병합.
// 계열(물리/마법)=스킬풀·조직 / 평타(물리/마법/혼합/융합)=엔진 공격분기 / range=근접·원거리(태그)
// 물리·하이브리드 무기는 현재 스텁(수치 보정 기본값=불변) → 효과는 차차. 스태프·완드만 활성.
const WEAPONS = {
  // 한손 근접=기본배수·속도불변 / 양손(대검류)=평타↑·20%느림 / 쌍검=듀얼(속도불변, 다단) / 활=원거리(공격자 턴+30%)
  // 재설계(§13): 물공배율(기본공 대체)·크리배율·무기막기(무기base 확률)·회피배율·턴배율(tempoMul 대체). 크리확률은 무기 무관(스탯 전담)
  소형방패: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 물공배율: 1.2, 크리배율: 1.7, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 0.9, 받는뎀: 0.10, 방패경감: 0.50, 방어: '방패' }, // 검투사: 공격형 방패 — 물공배율1.2·크리배율1.7(한방 크리형)·빠름, 막기 경감 약함(×0.50)
  대형방패: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 물공배율: 1.1, 크리배율: 1.5, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 1.0, 받는뎀: 0.20, 방패경감: 0.20, 방어: '방패' }, // 기사: 방어형 방패 — 막기 경감 강함(×0.20), 받는뎀 20%(탱), 속도 중립(1.0)
  단검: { 계열: '물리', 평타: '물리', range: '근접', hands: 1, 물공배율: 0.8, 크리배율: 2.5, 무기막기: 0.10, 회피배율: 1.3, 턴배율: 1.0, 방어: '회피' },
  쌍검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.2, 크리배율: 1.8, 무기막기: 0.40, 회피배율: 1.1, 턴배율: 1.0, 다단: 2, 방어: '무기막기' },
  양검: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.8, 크리배율: 1.8, 무기막기: 0.30, 회피배율: 0.8, 턴배율: 1.1, 방어: '무기막기' },
  양둔: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.8, 크리배율: 1.8, 무기막기: 0.30, 회피배율: 0.8, 턴배율: 1.3, 스턴확률: 0.2, 방어: '무기막기' }, // 양손무기=느림(양도끼 1.3과 통일)
  양도끼: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.8, 크리배율: 1.8, 무기막기: 0.30, 회피배율: 0.8, 턴배율: 1.3, 관통: 0.3, 방어: '무기막기' },
  활: { 계열: '물리', 평타: '물리', range: '원거리', hands: 2, 물공배율: 1.5, 크리배율: 2.0, 무기막기: 0.10, 회피배율: 1.3, 턴배율: 1.0, 원거리페널티: 0.5, 방어: '회피' },
  너클: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.0, 크리배율: 1.2, 무기막기: 0, 회피배율: 1.5, 턴배율: 0.75, 다단: 2, 방어: '패링', 실드효율: 0.7 }, // 무투가: 극회피·최속·다단, 무기막기 없음. 방어=패링(피격 시 경감+즉시 반격턴). 실드효율0.7=주먹은 마나실드에 70%만 들어감(투경 히트는 1.0)
  스태프: { 계열: '마법', 평타: '마법', range: '원거리', hands: 2, tempoStat: '지능', 물공배율: 1.0, 크리배율: 1.2, 무기막기: 0.30, 회피배율: 0.8, 턴배율: 1.15, 평타계수: 0.55, castMod: -2, 원거리페널티: 0.35, 마나실드배율: 1.2, 방어: '마나실드' },
  완드: { 계열: '마법', 평타: '마법', range: '원거리', hands: 1, tempoStat: '지능', 물공배율: 1.0, 크리배율: 1.2, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 0.95, 평타계수: 0.9, 마뎀너프: 0.8, 원거리페널티: 0.15, 마나실드배율: 1.5, 방어: '마나실드' },
  마도서: { 계열: '마법', 평타: '혼합', range: '근접', hands: 2, tempoStat: '힘지능', 물공배율: 1.1, 크리배율: 1.8, 무기막기: 0.30, 회피배율: 0.8, 턴배율: 0.95, 관통: 0.3, 방어: '마나실드' }, // 세이지: 물리관통30%
  검오브: { 계열: '마법', 평타: '혼합', range: '근접', hands: 1, tempoStat: '힘지능', 물공배율: 0.87, 마타: 0.87, 크리배율: 1.5, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 1.08, 방어: '마나실드' }, // 스블: 물리+마법 혼합
  마도검: { 계열: '마법', 평타: '마법', range: '근접', hands: 1, tempoStat: '지능', 물공배율: 1.0, 크리배율: 1.2, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 0.95, 마방보너스: 0.15, 방어: '마나실드' },
  주사위: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.0, 크리배율: 1.2, 무기막기: 0, 회피배율: 0.8, 턴배율: 1.0, 주사위: true, 방어: '주사위' }, // 갬블러 d20
  장창: { 계열: '물리', 평타: '물리', range: '근접', hands: 2, 물공배율: 1.5, 크리배율: 1.8, 무기막기: 0.15, 회피배율: 1.0, 턴배율: 1.1, 방어: '무기막기' } // 드루이드: 형상변환 시 능력치가 형상별로 바뀜(평타 물리/마법도 형상이 결정)
}
// 무기 표시 라벨(이모지 + 이름)
const WEAPON_LABEL = {
  소형방패: '🗡️🛡소형방패',
  대형방패: '🛡🛡대형방패',
  단검: '🗡단검',
  쌍검: '🗡🗡쌍검',
  양검: '⚔️양손검',
  양둔: '🔨양손둔기',
  양도끼: '🪓양손도끼',
  활: '🏹활',
  스태프: '🔮스태프',
  완드: '✨완드',
  마도서: '📖마도서',
  검오브: '⚡검/오브',
  마도검: '🗡️✨마도검',
  주사위: '🎲주사위',
  장창: '🔱장창'
}
const wpnLabel = (key) => WEAPON_LABEL[key] || key || ''
const NAMES = Object.keys(CHARS).filter(n => !CHARS[n].hidden) // hidden 캐릭은 로스터(선택·전투·시뮬)에서 제외 — 코드는 유지
const AIS = ['공격적', '방어적', '판단형']
// AI 상대 NPC 이름 (플레이어 @멘션과 대칭용)
const NICKS = ['아르덴', '던컨', '리시타', '카록', '벨루가', '이멘', '루에리', '나오', '마리', '아이라', '퍼거스', '트리아나', '제이머스', '엘리자', '칼릭스', '란딜', '피오나', '에반', '제노', '아리아', '케이', '로란', '델리아', '무마']

// ── 전투 길이 튜닝 노브 (기본값 = 현재 동작) ──
const TUNE = { hpScale: 1, skillStart: 2 } // HP×1.6(순삭 완화, 밸런스 유지)
// ── 타이틀 (docs 시뮬 동일) ──
const clampT = (v, mx) => Math.min(v, mx)
const TITLES = [
  { name: '튼튼한', d: d => { d.물방 += 0.10; d.마방 = clampT(d.마방 + 0.10, 0.75) } },
  { name: '럭키', d: d => { d.리롤 = clampT(d.리롤 + 0.10, 0.60) } },
  { name: '불주먹', d: d => { d.크리 = clampT(d.크리 + 0.05, 0.80); d.물공 = Math.round(d.물공 * 1.05) } },
  { name: '괴력의', d: d => { d.물공 = Math.round(d.물공 * 1.12) } },
  {
    name: '현자',
    d: d => {
      const b = d.base; let hit = false
      if (b.힘 >= 90) { d.물공 = Math.round(d.물공 * 1.12); hit = true }
      if (b.체력 >= 90) { d.물방 += 0.10; d.마방 = clampT(d.마방 + 0.08, 0.80); hit = true }
      if (b.지능 >= 90) { d.마나경감 = clampT((d.마나경감 || 0) + 0.08, 0.45); hit = true }
      if (b.행운 >= 90) { d.리롤 = clampT(d.리롤 + 0.10, 0.60); hit = true }
      if (b.민첩 >= 90) { d.크리 = clampT(d.크리 + 0.08, 0.90); hit = true }
      if (b.솜씨 >= 90) { d.명중 = clampT(d.명중 + 0.12, 0.95); hit = true }
      if (!hit) { d.물공 = Math.round(d.물공 * 1.06); d.마공 = Math.round(d.마공 * 1.06) }
    }
  },
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
  {
    name: '무지한',
    d: d => {
      const 힘 = d.base.힘; const 지능 = d.base.지능; let hit = false
      if (지능 >= 50) { d.마공 = Math.round(d.마공 * 0.88); hit = true }
      if (힘 >= 50) { d.물공 = Math.round(d.물공 * 0.88); hit = true }
      if (!hit) { d.물공 = Math.round(d.물공 * 0.94); d.마공 = Math.round(d.마공 * 0.94) }
    }
  },
  { name: '드러난', d: d => { d.마회 = Math.max(d.마회 - 0.15, 0) } }
]
// 타이틀 효과 요약 (UI 표시용)
const TITLE_DESC = {
  튼튼한: '물/마방+10%p',
  럭키: '행운굴림+10%p',
  불주먹: '크리+5%p·물리+5%',
  괴력의: '물리딜+12%',
  현자: '스탯90+ 특화보정',
  심연의: '마방25%관통',
  현혹의: '마법회피+15%p',
  매의눈: '명중+12%p',
  은밀한: '크리배율+0.6',
  날렵한: '물리회피+10%p',
  질풍의: '턴주기-15%',
  거인: '최대HP+12%',
  살이돋아나는: '매턴 HP+3%',
  뱀파이어: '딜 12% 흡혈',
  광전사: 'HP50%↓ 딜+22%',
  철벽: '받는딜-10%',
  가시돋힌: '받은딜 5% 반사',
  전설의: '물/마공+20%·크리+15%p·턴-1·받는딜-15%',
  저주받은: '모든딜-15%',
  허약한: '받는딜+15%',
  둔한: '턴주기+15%',
  무지한: '적응형 딜↓',
  드러난: '마법회피-15%p'
}
const titleTag = (name) => `*${name}*${TITLE_DESC[name] ? `(${TITLE_DESC[name]})` : ''}`
const GALE = TITLES.find(t => t.name === '질풍의')
const COMMON = TITLES.filter(t => t.name !== '질풍의')
const pickTitle = () => {
  const r = rand()
  if (r < 0.001) return JACKPOT
  if (r < 0.006) return GALE
  if (r < 0.206) return DUDS[Math.floor(rand() * DUDS.length)]
  return COMMON[Math.floor(rand() * COMMON.length)]
}

// HP 공식(단일 소스): 기본 500 + 스탯 보정. derive·preview 공용
function maxHp (c) { const w = WEAPONS[c.무기]; const mag = w && w.계열 === '마법'; return Math.round((1000 + c.체력 * 37 + c.힘 * 5) * (mag ? 0.55 : 1) * TUNE.hpScale) } // 기초1000+체력37+힘5. 마법무기=HP×0.55(실드로 버티는 캐스터). 기사~5000/암살~2500, 캐스터 총합~4000(실드60%)
// 턴 파생 스탯 = 무기 tempoStat (기본 민첩). 스태프/완드/마도검='지능', 검오브/마도서='힘지능'.
// 검오브·마도서는 힘+지능 몰빵 근접 하이브리드라 민첩-템포에선 구조적으로 느려짐 → max(힘,지능)로 파생
function tempoVal (w, c) { return w.tempoStat === '지능' ? c.지능 : w.tempoStat === '힘지능' ? Math.max(c.힘, c.지능) : c.민첩 }
function derive (c) {
  const w = WEAPONS[c.무기] || {}
  return {
    물공: 10 + c.힘 + step(c.힘, 3) + Math.floor(c.힘 / 20) * 8, // §13: 10+힘+⌊힘/10⌋3+⌊힘/20⌋8 (천180). 무기 물공배율은 attack에서 적용
    마공: Math.round((10 + c.지능 + step(c.지능, 2) + Math.floor(c.지능 / 20) * 5) * (c.신념 ? 1.5 : 1)), // §13: 낮은base·완만 (천155). 신념(프리스트): 마공 ×1.5 — 신성 스킬 화력 확보(지능 낮은 탱커빌드 보정)
    물방: Math.min((c.힘 * 0.26 + c.체력 * 0.34) / 100 + (w.물방보너스 || 0) + (c.마도갑주 || 0) + (c.체력 === 100 ? 0.05 : 0), 0.80), // §13: 힘0.26+체력0.34 (광전40·기사50). 체력100시그 +5%p
    마방: Math.min((20 + step(c.지능, 3)) / 100 + (w.마방보너스 || 0), 0.85), // §13: 바닥 30→20
    maxhp: maxHp(c),
    마나실드: (w.계열 === '마법') ? Math.round((c.지능 * 14 + c.체력 * 7) * (w.마나실드배율 || 1)) : 0, // 마법무기만, (지능14+체력7)×무기배율. 방어구 경감 없음(실드가 풀딜 흡수) + 공격 딜25% 회복
    명중: (35 + c.솜씨 * 0.4) / 100, // §13: 35~75
    물회: (10 + c.민첩 * 0.15) / 100 * (w.회피배율 || 1) + (c.체력 === 100 ? 0.05 : 0), // §13: (10+민첩0.15)×무기회피배율. 체력100시그 +5%p
    마회: 0, // §13: 死스탯 삭제(0 유지 — 트레이트 참조 안전용)
    sigPen: c.힘 === 100,
    sigDodge: c.행운 === 100,
    sigTank: c.체력 === 100,
    sigEcho: c.민첩 === 100,
    sigEye: c.지능 === 100,
    sigAim: c.솜씨 === 100,
    base: c,
    hybrid: (c.무기 === '마도서' || c.무기 === '검오브'), // 혼합 스윙(물리판정) — 세이지(마도서)·마검사(검오브)
    fusion: false, // 융합 폐기 → 마검사도 혼합(물리 vs 물방 + 마법 vs 마방)
    크리: Math.min(10 + c.행운 * 0.3 + c.솜씨 * 0.05, 70) / 100, // §13: 행운0.3(주력)+솜씨0.05, 무기 크리확률 없음
    리롤: Math.min(step(c.행운, 1.5), 50) / 100,
    천운: c.행운 * 0.05 / 100, // §13: 행운100=5% 마법 완전회피
    근성: step(c.체력, 4) / 100,
    현자균형: c.현자균형 ? Math.min(step(Math.min(c.힘, c.지능), 2.5), 16) / 100 : 0, // 현자의 균형(패시브): 힘·지능 듀얼스탯(min) 기반 피해감소. 하이브리드만 강함(세이지 min60=15%, 순수빌드 min≤15→0~2%). 커스텀 상정 안전
    방패밀쳐내기: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 0.5 + c.체력 * 1.8 + (step(c.힘, 3) + step(c.체력, 1)) * 2),
    힘절반: Math.round(c.힘 / 2),
    돌진딜: Math.round(Math.round(c.힘 * (1 + step(c.힘, 10) / 100)) * 1.5),
    회복: Math.min(10 + step(c.체력, 1), 30),
    물크기본: 1.5,
    마크기본: 1.2,
    크랜폭: step(c.행운, 0.15) * 2,
    // 턴속도(§13): 8 − tempoVal×0.04 (연속) × 무기턴배율. 민첩100 시그 −1초. tempoVal: 물리=민첩/마법무기=지능·힘지능
    턴: Math.max((8 - tempoVal(w, c) * 0.04) * (w.턴배율 || 1) - (c.민첩 === 100 ? 1 : 0), 2),
    평타계수: w.평타계수 || 1,
    마뎀너프: w.마뎀너프 || 1,
    기본공: w.기본공 || 1,
    무기: w,
    무기막기: (w.무기막기 || 0) + (c.무기의달인 ? 0.10 : 0), // §13: 무기 base 확률 + 무기의 달인 +10%p
    무기막기경감: 1 - (0.10 + c.힘 * 0.003 + (c.무기의달인 ? 0.05 : 0)), // §13: 막으면 ×(1−경감율), 경감율=10%+힘0.3%(달인+5%p). 힘100=40%→×0.6
    // 방패막기는 검/방(방패) 무기 전용. 체력100시그 +5%p
    방패막기: (w.방어 === '방패' && c.체력 >= 50) ? (30 + Math.floor((c.체력 - 50) / 10) * 3) / 100 + (c.체력 === 100 ? 0.05 : 0) : 0,
    방패고정: (w.방어 === '방패' && c.체력 >= 70) ? c.체력 / 3 : 0,
    마나경감: c.지능 >= 70 ? (10 + ((c.지능 - 70) / 10) * 2) / 100 : 0
  }
}
function luckRoll (s, ls, p) { if (s) return true; if (ls.used) return false; if (rand() < p) { ls.used = true; return true } return false }
function gutsMul (d, hp, df, foe) { const coat = 1 - (foe && foe.passiveLock ? 0 : (df.현자균형 || 0)); const p = hp / df.maxhp; if (p >= 0.5) return coat; return coat * (1 - df.근성 * ((0.5 - p) / 0.5)) }
// 방패막기 경감배율: 막으면 피해 ×이 값(낮을수록 강한 막기). 방패들기(blockUp)=×0.10 / 무기별 방패경감(대형0.20·소형0.50) / 기본 0.20
function blockMul (D, dD) { return D.blockUp > 0 ? 0.10 : ((dD && dD.무기 && dD.무기.방패경감) || 0.20) }
// 방어 적용(관통 통합): 방어 × (1 − 관통) 만큼만 감소. 관통 0=방어 전부, 1=방어무시(역장)
function defMul (def, pen) { return 1 - def * (1 - Math.min(pen || 0, 1)) }
// ── 패시브 토대 ──
// 패시브 레지스트리: 표시명 → fighter 플래그. 열거·디스펠 타겟·표시 공용. (마도갑주는 derive 물방 baked라 lock 미대응 — 스탯형)
const PASSIVE_FLAGS = { '완벽방어!': '완벽방어', 행운의여신: '행운의여신', 연속타격: '연속타격', '볼트마법의 이해': 'boltMaster', '원소의 이해': '원소마스터', 불굴: '불굴', 광란: '광란', '현자의 균형': '현자균형', 마도갑주: '마도갑주', 격노: '격노', '무기의 달인': '무기의달인', 투경: '투경', '암습의 대가': '암습의대가' }
// 패시브 활성 판정: 플래그 보유 && 잠기지 않음(디스펠). passiveLock=0이면 기존 동작과 동일.
function psv (f, flag) { return f && f[flag] && !f.passiveLock }
// 디스펠 대상 버프 필드(실드·시전은 자원/채널이라 제외). clearBuffs=즉시 제거, 개수 반환.
const BUFF_FIELDS = ['rage', 'powBuff', 'accBuff', 'blockUp', 'dodgeUp', 'magReflect', 'luckBuff', 'diceAdv', 'chainBolt', 'autoSpell', 'healRegen', 'instCast', 'graze100', 'blessTurns', 'aegisTurns', 'sanctuary', 'frenzy', 'haste', 'repentStack', 'castCut', 'druRegen', 'bearRegen', 'catRegen', 'crouch']
function clearBuffs (f, df) { let n = 0; const hadStat = f.blessTurns > 0 || f.aegisTurns > 0; for (const k of BUFF_FIELDS) { if (f[k] > 0) { f[k] = 0; n++ } } f.powMul = 1; f.frenzyWin = 0; f.repentWin = 0; if (hadStat) { f.aegisMul = 1; if (df) refreshDerived(f, df) } return n } // 축복·가호(스탯버프) 제거 시 파생스탯 원복(refreshDerived), 성역·광란가속·참회(윈도우 포함)도 즉시 해제
// 패링(너클): 패링 태세 중 나에게 닿는 모든 공격을 흘린다(×0.10 + 첫 피격에 반격턴·회복). 물리 타격은 attack()의 defending 경로가 처리하고,
// 비물리(마법·신성·역장·충격·확정·주사위)는 각 피해 함수가 parryMul로 같은 규칙을 적용. 지속 피해(출혈·성역·암흑지대 틱)는 공격이 아니라 제외(TICKING)
let TICKING = false
function parryMul (D, dD) {
  if (TICKING || !D.defending || !dD || !dD.무기 || dD.무기.방어 !== '패링') return 1
  if (D.parry && D.stun === 0 && D.cast === 0) { D.parryHit = true; D.parry = false; D.pendCC = null }
  return 0.10
}
// 시전 착탄처럼 execSkill/execAttack을 거치지 않는 공격의 패링 반격 처리(게이지 리셋 + 성공 회복)
function resolveParry (foe, df) { if (!foe.parryHit) return false; foe.gauge = 0; foe.parryHit = false; parryHeal(foe, df); return true }
function attack (A, D, dA, dD, defending, guaranteed, forceCrit, hitsOverride) {
  const magic = dA.평타마법 != null ? dA.평타마법 : dA.마공 > dA.물공 // 평타마법: 형상이 평타 종류를 직접 지정(드루이드 — 인간·곰은 마공>물공이어도 물리)
  const ls = { used: false }; const lsD = { used: false }
  let dmg; let 고정 = 0
  // 관통값 통합: 물리=힘100시그(0.30)+무기관통 / 마법=심연의(0.25). (기존 sigPen·tMPen·무기.관통과 동치)
  const 물관통 = 1 - (dA.sigPen ? 0.7 : 1) * (1 - (dA.무기.관통 || 0))
  const 마관통 = Math.max(A.tMPen ? 0.25 : 0, dA.sigEye ? 0.20 : 0) // §13: 지능100 시그 = 마방 20% 관통
  A._tkFrac = 0; A.hitPh = null; A.hitMg = null; A.boltName = null; A.boltHits = null; A.boltNames = null; A.boltShots = 0; A.boltCombo = 0; A._braw = null; A._bnames = null; A.lastDef = null; A.didAttack = true; A.brokeCast = false; A.lastElem = false; A.lastRefl = null; A.grazed = false; A.diceAtk = 0; A.diceDef = 0 // 혼합 내역 + 볼트명 + 연쇄볼트 발당 + 방어판정 + 공격시도 + 시전중단 표식 + 빗맞음 + 주사위
  // 기절 중엔 능동 방어(회피·천운·방패막기·무기막기·패링) 봉쇄. 빗맞힘(공격자 실수)·마나실드·반사·근성은 수동이라 유지
  const canDef = D.stun === 0 && D.cast === 0 // 기절 또는 시전 중엔 능동 방어(회피·천운·막기·주사위방어) 불가. 마나실드·반사·근성은 유지
  if (canDef && D.parry) { D.parryHit = true; D.parry = false; D.pendCC = null } // 패링 태세 중 피격 → 즉시 반격턴 예약 + 동반 CC(보류분) 폐기(흘림). 경감은 defending(×0.10)이 처리
  if (psv(D, '행운의여신') && rand() < D.행운의여신) { A.lastDef = '행운의여신'; return 1 } // 갬블러 패시브: 타입 무관 확률적 피해 1(운빨 방어)
  const aimCut = dA.sigAim ? 0.05 : 0 // §13: 솜씨100 정밀사격 = 상대 물회 −5%p(회피 판정에서 차감)
  if (canDef && dD.sigDodge && rand() < 0.10) { A.lastDef = '완전회피'; return 0 } // §13: 행운100 시그 = 물리·마법 10% 완전회피
  if (dA.hybrid) {
    // 본 공격 회피 판정(천운/리롤) — 볼트는 별개로 무조건 명중
    const evaded = canDef && luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.리롤)) // sigDodge는 상단에서 일괄 처리(물리·마법·혼합 10%)
    const diceB = (canDef && dD.무기.주사위) ? diceBlockMul(A, D) : 1 // 주사위 방어(갬블러): 혼합 공격도 경감(볼트·ph·mg 공통 1회)
    const bolt = 0 // 오토스펠은 execAttack에서 launchBolt로 별도 발사(볼트 전용 딜코드 제거)
    let ph = 0; let mg = 0; let crit = false; 고정 = 0
    if (!evaded) {
      let block = 0
      if (canDef && dD.방패막기 && rand() < dD.방패막기) { block = blockMul(D, dD); A.lastDef = '방패막기' }
      const wBlk = (canDef && !block && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) ? dD.무기막기경감 : 1
      if (wBlk < 1) A.lastDef = '무기막기'
      crit = forceCrit || luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
      if (A.echoReady) { crit = true; A.echoReady = 0 }
      const cP = crit ? ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1) : 1
      ph = dA.물공 * (dA.무기.물공배율 || 1.1) * (block || wBlk) * diceB * defMul(D.shield > 0 ? 0 : dD.물방, 물관통) * cP // 물리 스윙(물리판정, 크리 O) + 주사위 방어
      mg = dA.무기.마타 ? dA.마공 * dA.무기.마타 * (block || 1) * diceB * defMul(D.shield > 0 ? 0 : dD.마방, 마관통) : 0 // 혼합 마법몫(마법=크리 없음). 마도서(세이지)=0(볼트로 대체) + 주사위 방어
    }
    if (evaded && bolt <= 0) { A.lastDef = '회피'; return 0 } // 완전회피 + 볼트 미발동 → 무피해
    let d = ph + mg + bolt - 고정
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30) { d *= 0.70; A.grazed = true }
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD, D)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (D.cast > 0) d *= 0.6
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (A.powBuff > 0) d *= A.powMul
    if (A.weaponBroken > 0) d *= (1 / 3) // 무기파괴: 기초딜 1/3
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (dD.무기.받는뎀) d *= (1 - dD.무기.받는뎀)
    d *= wardMul(D)
    if (crit) A.lastCrit = true
    const fin = Math.max(Math.round(d), 1)
    // 내역(내레이션용, raw 비율 저장 → narration서 ev.dmg에 재배분): ph=물리 / mg=마법평타 / 볼트=오토스펠 다연타(별도)
    if (ph + mg + bolt > 0) { A.hitPh = ph; A.hitMg = mg }
    if (A._braw && A._braw.length) { A.boltHits = A._braw.slice(); A.boltNames = A._bnames }
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + hcut(A, Math.round(dA.base.체력 / 2)))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    return perfectGuard(A, D, dD, fin)
  }
  if (dA.fusion) {
    if (canDef && !guaranteed && luckRoll(rand() < Math.max(dD.물회 - aimCut, 0) * (A.accBuff > 0 ? 0.35 : 1) + (D.dodgeUp > 0 ? 0.4 : 0) + woundDodge(D, A), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 }
    let d = dA.물공 + dA.마공; 고정 = 0
    if (canDef && dD.방패막기 && rand() < dD.방패막기) { d *= blockMul(D, dD); A.lastDef = '방패막기' } else if (canDef && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) { d *= dD.무기막기경감; A.lastDef = '무기막기' }
    d *= (1 - Math.max(crushArmor(D, dD.물방) * (dA.sigPen ? 0.7 : 1), crushArmor(D, dD.마방)))
    if (D.sunder > 0) d *= 1.15
    if (rand() < 0.30) { d *= 0.70; A.grazed = true }
    let crit = luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))
    if (A.echoReady) { crit = true; A.echoReady = 0 }
    if (crit) { d *= ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true }
    d -= 고정
    if (dD.마나경감) d *= (1 - dD.마나경감)
    if (defending) d *= 0.10
    d *= gutsMul(dD, D.hp, dD, D)
    if (D.vuln > 0) d *= 2.0
    if (D.instVuln > 0) d *= 1.5
    if (D.cast > 0) d *= 0.6
    if (A.tFury && A.hp < dA.maxhp * 0.5) d *= 1.22
    if (A.powBuff > 0) d *= A.powMul
    if (A.weaponBroken > 0) d *= (1 / 3) // 무기파괴: 기초딜 1/3
    if (D.tWall) d *= 0.90
    if (D.tLegend) d *= 0.85
    if (D.tFrail) d *= 1.15
    if (dD.무기.받는뎀) d *= (1 - dD.무기.받는뎀)
    d *= wardMul(D)
    const fin = Math.max(Math.round(d), 1)
    castHit(A, D, fin)
    if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + hcut(A, Math.round(dA.base.체력 / 2)))
    if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
    return perfectGuard(A, D, dD, fin)
  }
  if (!magic) {
    // 활(원거리): 근접 공격자가 나를 때리면 자기 다음 턴 지연(거리 비용, 공격자 턴 %)
    if (dD.무기.원거리페널티 && dA.무기.range === '근접') A.gauge += dA.턴 * dD.무기.원거리페널티
    const baseHits = hitsOverride || dA.무기.다단 || 1; const hits = baseHits + (psv(A, '연속타격') && rand() < 0.20 ? 1 : 0) // 쌍검·너클 다단 / 암살자 연속타격 / hitsOverride: 콤보 스킬이 무기 다단 무시(연타 자체 정의)
    const perMul = (dA.무기.물공배율 || 1) / baseHits // 히트별 방어: 총배율을 히트수로 분할(총딜 보존, 각 히트 개별 명중·회피·막기)
    const atkD = dA.무기.주사위 ? d20adv(A.diceAdv > 0) : 0; if (atkD) A.diceAtk = atkD // 갬블러 공격 d20(단발): 1=대실패(0) / 20=대성공(×3) / 2~19=중앙10.5 피벗 선형(현재공격±)
    dmg = 0; let tkRaw = 0
    for (let i = 0; i < hits; i++) {
      if (!guaranteed && !luckRoll(rand() < (dA.명중 - (A.missDown > 0 ? 0.2 : 0) - (A.blind > 0 ? 0.3 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))) continue // 히트별 명중: 빗나간 히트 스킵
      if (canDef && !guaranteed && luckRoll(rand() < Math.max(dD.물회 - aimCut, 0) * (A.accBuff > 0 ? 0.35 : 1) + (D.dodgeUp > 0 ? 0.4 : 0) + woundDodge(D, A), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; continue } // 히트별 회피
      let block = 0; let wblk = 1
      if (canDef && dD.무기.주사위) { block = diceBlockMul(A, D) } else if (canDef && dD.방패막기 && rand() < dD.방패막기) { block = blockMul(D, dD); A.lastDef = '방패막기' } else if (canDef && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) { wblk = dD.무기막기경감; A.lastDef = '무기막기' } // 주사위방어: 중앙(10.5)=현재방어(block1.0×물방), 굴림↑=경감↑, 1=대실패(×2), 20=대성공(×0.02). 히트별 막기
      let h = dA.무기.주사위 ? (atkD === 1 ? 0 : dA.물공 * (atkD === 20 ? 3 : 1 + (atkD - 10.5) * 0.06)) : dA.물공 * physSwing(dA) * perMul // 주사위공격: 중앙(10.5)=현재공격, 굴림↑=딜↑, 1=대실패(0), 20=대성공(×3)
      h *= block || wblk
      const tk = psv(A, '투경') && rand() < TUKYUNG_PROC; if (tk) A.tukyungHits = (A.tukyungHits || 0) + 1 // 투경: 이 히트는 방어 무시
      h *= tk ? 1 : defMul(D.shield > 0 ? 0 : dD.물방, 물관통) // 물방 × (1-물관통)
      if (D.sunder > 0) h *= 1.15
      if (rand() < 0.30) { h *= 0.70; A.grazed = true }
      let crit = i < baseHits && (forceCrit || luckRoll(rand() < (dA.크리 + (A.luckBuff > 0 ? 0.2 : 0)), ls, (A.luckLock > 0 ? 0 : dA.리롤) + (A.luckBuff > 0 ? 0.2 : 0))) // 연속타격 추가타(i>=baseHits)는 크리 제외
      if (i === 0 && A.sigEcho) A.echoStack = (A.echoStack || 0) + 1 // 잔상: 공격마다 스택
      if (A.echoReady) { crit = true; A.echoReady = 0 } else if (i === 0 && A.sigEcho && A.echoStack >= 3) { crit = true; A.echoStack = 0 } // 잔상: 3타마다 확정 크리(회피 없어도 딜 기회)
      if (crit) { h *= ((dA.무기.크리배율 || dA.물크기본) + rand() * dA.크랜폭) * (A.luckBuff > 0 ? 2 : 1); A.lastCrit = true } // 무기 크리배율이 base 덮어씀(활2·단검1.8)
      dmg += h; if (tk) tkRaw += h
    }
    A._tkFrac = dmg > 0 ? tkRaw / dmg : 0 // 투경 히트가 차지한 피해 비율(실드 흡수 시 그 몫은 실드효율 1.0)
    if (dA.무기.스턴확률 && rand() < dA.무기.스턴확률) applyCC(D, 'stun', 1) // 양둔: 확률 스턴
  } else {
    if (canDef && luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.천운))) { A.lastDef = '천운'; return 0 } // 마법 완전회피 = 행운 10당 1%(리롤과 분리)
    // 마법 평타 = 매직미사일(단발). 볼트마법은 스킬(runDamage)로 별도 발사 — attack()엔 볼트 코드 없음
    let mBlock = 1
    if (canDef && dD.무기.주사위) { mBlock = diceBlockMul(A, D) } else if (canDef && dD.방패막기 && rand() < dD.방패막기) { mBlock = blockMul(D, dD); A.lastDef = '방패막기' } // 주사위 방어(갬블러)는 마법도 경감 / 방패는 마법도 막음(최종 마공10% 바닥 보장 → 0딜 방지)
    const mdef = defMul(D.shield > 0 ? 0 : dD.마방, 마관통)
    dmg = dA.마공 * dA.평타계수 * dA.마뎀너프 * mdef * magicGraze(A) * mBlock // 매직미사일: 마법=크리 없음(magicGraze 편차만)
    if (D.sunder > 0) dmg *= 1.15
    // 마법반사: 볼트만 반사 — 매직미사일 평타(lastBolt false)는 무시(반사 낭비 방지)
    if (D.magReflect > 0 && dmg > 0 && A.lastBolt) { const rr = (dD.무기.방어 === '방패') ? 1.0 : 0.7; A.hp -= Math.max(Math.round(dmg * rr), 1); A.lastRefl = rr >= 1 ? 'full' : 'part'; dmg *= (1 - rr); if (rr >= 1) A._braw = null; D.magReflect = 0 }
  }
  dmg -= 고정
  if (dD.마나경감) dmg *= (1 - dD.마나경감)
  if (defending) dmg *= 0.10
  dmg *= gutsMul(dD, D.hp, dD, D)
  if (D.vuln > 0) dmg *= 2.0
  if (D.instVuln > 0) dmg *= 1.5
  if (D.cast > 0) dmg *= 0.6 // 시전 중 받는뎀 40%↓(모든 시전 — 최초 화염구 시전에서 일반화)
  if (A.tFury && A.hp < dA.maxhp * 0.5) dmg *= 1.22
  if (psv(A, '격노') && dA.maxhp) dmg *= (1 + Math.pow(1 - Math.max(A.hp, 0) / dA.maxhp, 2) * FURY_ATK) // 격노: 체력 낮을수록 공격력↑(2차곡선, 빈사 ~+140%). 회복하면 다시 감소(자기조절)
  if (psv(A, '무기의달인') && !magic) dmg *= 1.1 // 무기의 달인: 무기(물리) 배율 소폭↑
  if (psv(A, '암습의대가') && CC_FIELDS.some(k => (D[k] || 0) > 0)) dmg *= ASSASSIN_CC // 암습의 대가: 상대가 기절·마비·침묵·둔화·도발 중이면 공격력↑
  if (A.powBuff > 0) dmg *= A.powMul
  if (A.weaponBroken > 0) dmg *= (1 / 3) // 무기파괴: 기초딜 1/3
  if (D.tWall) dmg *= 0.90
  if (D.tLegend) dmg *= 0.85
  if (D.tFrail) dmg *= 1.15
  if (dD.무기.받는뎀) dmg *= (1 - dD.무기.받는뎀)
  dmg *= wardMul(D)
  // 마법은 막혀도 최종 마공10% 바닥 보장(방패고정에 0딜 방지) — 방어행동 시엔 제외
  // dmg가 정확히 0이면 완전히 빗나간 것(히트별 회피/명중실패로 아무 히트도 커밋 안 됨) → 0(빗나감). 조금이라도 적중하면 최소 1 보장
  let fin = dmg > 0 ? Math.max(Math.round(dmg), 1) : 0
  // 연쇄볼트: 최종 피해를 발당 raw 비율로 배분(마나경감·근성 등 후처리 반영). 발당 최소 1(적중한 볼트가 0으로 안 뜨게) → 총합도 보정
  if (A._braw && A._braw.length > 1) { const s = A._braw.reduce((a, b) => a + b, 0) || 1; const hits = A._braw.map(r => Math.max(1, Math.round(r / s * fin))); A.boltHits = hits; A.boltNames = A._bnames; fin = hits.reduce((a, b) => a + b, 0) }
  if (A.tLeech) A.hp = Math.min(dA.maxhp, A.hp + Math.round(dA.base.체력 / 2))
  if (D.tThorns) A.hp -= Math.max(Math.round(fin * 0.05), 1)
  if (A.마나환류 && magic && fin > 0 && rand() < 0.30) A.shield = Math.min(Math.round(dA.maxhp * 0.22), A.shield + Math.round(fin * 0.4)) // 마나환류(마법사 패시브): 마법딜 30% 확률로 40% 실드복구
  return perfectGuard(A, D, dD, fin)
}
function guts (dmg, foe, df) { const p = foe.hp / df.maxhp; if (p < 0.5) dmg *= (1 - df.근성 * ((0.5 - p) / 0.5)); dmg *= (1 - (foe.passiveLock ? 0 : (df.현자균형 || 0))); return dmg }
// 완벽방어!(기사 패시브): 방패막기를 연속 PERFECT_N회 성공하면 그 순간 받는 피해의 0.7을 공격자에게 즉시 반사(실드 무시 직접딜). 스트릭은 방패막기 외 결과에 리셋. 방패들기(90% 막기)와 강시너지
const PERFECT_N = 2
function perfectGuard (A, D, dD, fin) {
  if (!psv(D, '완벽방어')) return fin
  if (A.lastDef === '방패막기') { D.blockStreak = (D.blockStreak || 0) + 1; if (D.blockStreak >= PERFECT_N) { D.blockStreak = 0; A.lastDef = '완벽방어'; const preBlock = fin / blockMul(D, dD); A.hp -= Math.max(Math.round(preBlock * 0.7), 1) } } else { D.blockStreak = 0 }
  return fin
}
// 물리 딜 변수: 솜씨 기반 풀댐 확률, 빗맞으면 70~100% 유동 (예측성↓, 명중형=일관/난동형=도박)
function physSwing (d) { const pFull = 0.5 + Math.floor(d.base.솜씨 / 10) * 0.04; return rand() < pFull ? 1 : (0.70 + rand() * 0.30) }
// 마법 빗맞힘 구간(공유): 30% 풀댐 / 40% 80% / 30% 40% (평균 74%). 마법사 마법 + 볼트 공통
function magicGraze (A) { if (A && A.graze100 > 0) return 1; const gr = rand(); return gr < 0.10 ? 1.2 : (gr < 0.70 ? 1.0 : 0.8) } // 마법의 완전이해(graze100): 편차 무시 상시 풀댐. A 미전달(시전마법)은 기존 랜덤 편차 유지
function healVar (amount) { return Math.round(Math.max(amount, 0) * magicGraze()) } // 회복 변동(예측 방지): 정해진 수치를 ×0.8~1.2 랜덤. 방어회복·회복스킬 공용
function hcut (s, amt) { let m = s.healCut > 0 ? 0.2 : 1; if (s.crush > 0) m *= (1 - s.crush * 0.15); if (s.undead) m *= UNDEAD_HEAL; return Math.round(Math.max(amt, 0) * m) } // 과다출혈(절개도적): 회복량 80%↓(20%만). + 분쇄(검투사) 스택당 회복 -15%(5스택 -75%) + 살아있는 시체 회복 ×2. 모든 자힐·흡혈 통과
function woundDodge (D, A) { return D.상처전문가 ? ((A.cutStk || 0) + (A.lacStk || 0)) * 0.02 : 0 } // 상처전문가: 상대(A)에 걸린 출혈 스택당 자신(D) 회피+2%(최대 5+5=+20%)
function crushArmor (D, armor) { return Math.max(armor - (D.crush || 0) * 0.05, 0) } // 분쇄(검투사): 스택당 물방·마방 -5%p(최대 5스택 -25%p)
// 침식(암흑기사): 스택당 최대체력 -5%(최대 10스택 -50%). 상한(ceiling) 감소 = 안티힐 + 유리몸. 살아있는시체(현재HP 1%로)와는 별개 메커닉
function emaxHp (f, d) { return Math.round(d.maxhp * (1 - Math.min(f.erosion || 0, 10) * 0.05)) } // 침식 반영 실효 최대체력
function addErosion (f, d, n) { f.erosion = Math.max(0, Math.min((f.erosion || 0) + n, 10)); if (f.hp > emaxHp(f, d)) f.hp = emaxHp(f, d) } // 침식 증감 + 현재HP를 새 상한으로 클램프(고HP서 얻으면 즉시 피해)
// 살아있는 시체(암흑기사): 내 턴 UNDEAD_TURNS 동안 무적(체력 1 미만으로 안 떨어짐). undead=무적 창 활성, deathMark=남은 내 턴, deathDoom=창이 끝날 때 사망 예정(영혼포식 회복 시 해제)
const UNDEAD_TURNS = 3
const UNDEAD_EROSION = 8 // 시체 진입 시 침식(종말 스택)
const UNDEAD_HEAL = 2 // 시체 상태 회복률 배수
const DARKZONE_SELF = 0.85 // 암흑지대 자해 배율(물공×1.0 중 자신이 받는 비율) — 비용은 HP보다 침식(+1/턴) 쪽에 비중
const JONG_SHIELD = 0.6 // 종말: 마나실드 보유 상대에게 위력 배율(침식은 육체를 좀먹는 힘 — 마나에는 덜 통함)
function jongShield (f) { return f.shield > 0 ? JONG_SHIELD : 1 }
const JONG_MIN = 6 // 종말 최소 침식 스택(쌓아서 터뜨리는 고스택 피니셔 — 저스택 난사 방지)
const ABYSS_TAKEN = 0.7 // 심연의 포옹: 받는 피해 배율(30%↓)
const SOUL_COEF = 1.0 // 영혼포식 물공 계수
function undeadFloor (f) { if (f.undead && f.hp < 1) { f.hp = 1; return true } return false } // 시체 무적: 체력 1 하한. 실제로 막았으면 true(나레이션용)
function wardMul (D) { return (D.darkWard > 0 ? ABYSS_TAKEN : 1) * (D.crouch > 0 ? CROUCH_TAKEN : 1) } // 심연의 포옹(암흑기사): 받는 피해 30%↓
function holyRamp (s, df, hits) { return df.maxhp * 0.007 * (s.repentStack || 0) * (hits || 1) } // 참회 램프 스코어 근사: 히트당 상대 최대체력×0.7%×현재스택
function jongMul (st) { return (st || 0) * 0.8 } // 종말 계수: 스택당 0.8 (6스택 4.8 ~ 만스택 8.0)
function gashHit (D) { if (D.cutStk > 0) { D.cutStk = Math.min(D.cutStk + 1, 5); D.cutDur = 2 } if (D.lacStk > 0) { D.lacStk = Math.min(D.lacStk + 1, 5); D.lacDur = 2 } } // 절개도적 타격 시: 이미 활성인 출혈 스택 각 +1(최대5)·지속2 갱신. 평타·타격스킬 공통
function gashAtkBonus (A, D, dD) { if (!A.상처전문가) return 0; let b = 0; if (D.cutStk > 0 && D.cutStk < 5) b += dD.maxhp * 0.015 * 2; if (D.lacStk > 0 && D.lacStk < 5) b += dD.maxhp * (D.cutStk > 0 ? 0.025 : 0.015) * 2; return b } // 절개도적 AI: 활성 출혈<5면 평타로 +1 쌓는 가치를 평타 점수에 가산
function d20adv (adv) { const a = 1 + Math.floor(rand() * 20); if (!adv) return a; return Math.max(a, 1 + Math.floor(rand() * 20)) } // 2d20 어드밴티지: adv면 2개 중 높은 값
// 행운 저점보장(갬블러): 낮은 굴림(thr 이하)이면 행운 비례 확률로 lo~hi 범위 리롤. 행운100=100% 리롤 → 바닥값 회피
function luckFloor (roll, thr, lo, hi, luck) { if (roll <= thr && rand() < (luck || 0) / 100) return lo + Math.floor(rand() * (hi - lo + 1)); return roll }
// 주사위 방어(갬블러): 피격 시 d20 경감 배율. 중앙10.5=현재방어(×1) / 굴림↑ 경감↑ / 1=대실패(×2) / 20=대성공(×0.02). 방어구·마방·실드 위에 곱해짐. 호출측서 방어자 무기 주사위·능동방어 가능 게이트. A=공격자(굴림 기록용)
function diceBlockMul (A, D) { const dd = d20adv(D.diceAdv > 0); if (A) { A.diceDef = dd; A.lastDef = '주사위방어' } return dd === 1 ? 2.0 : dd === 20 ? 0.02 : Math.min(Math.max(1 - (dd - 10.5) * 0.06, 0.1), 1.9) }
const SPELL_COEF = { 화염구: 4.8, 메테오: 12, 서리구: 3.1, 충격파: 1.0 } // 시전 마법 = 마공 × 계수 (파생 의존 제거, 마공 기반). 서리구=둔화+짧은시전만큼 낮음 / 메테오=화염구와 raw 딜/턴 1:1(8.4÷유효7 ≈ 4.8÷유효4)이되 시전 길어 착탄 리스크가 대가
function spellBase (ds, name) { return Math.round(ds.마공 * SPELL_COEF[name]) }
// 시전 마법 spec(마법사): 볼트와 동일하게 마법.일반 + 시전턴. 해소는 runDamage. uninterruptible=메테오(끊기·기절 면역), noInstant=인캐 불가.
const CAST_SPELLS = {
  화염구: { name: '화염구', type: '마법.일반', mult: SPELL_COEF.화염구, cast: 7 },
  메테오: { name: '메테오', type: '마법.일반', mult: SPELL_COEF.메테오, cast: 10, uninterruptible: true, noInstant: true },
  서리구: { name: '서리구', type: '마법.일반', mult: SPELL_COEF.서리구, cast: 6 }
}
// 시전 시작: 인캐면 즉발(runDamage), 아니면 예약(castSpec 저장). 반환 true=즉발.
function scheduleCast (s, f, ds, df, spec) {
  if (s.instCast > 0 && !spec.noInstant) { s.instCast = 0; runDamage(spec, s, f, ds, df); s.note = '즉시 ' + spec.name; return true }
  const cut = s.castCut > 0 ? 1 : 0; s.castCut = 0 // 시전 끊기·취소 버프 소비: 다음 시전 -1턴
  s.cast = Math.max(2, spec.cast + (ds.무기.castMod || 0) - cut); s.castUninterruptible = !!spec.uninterruptible; s.castSpec = spec; s.castTotal = s.cast; s.castName = spec.name; s.note = spec.name + ' 시전'; return false
}
const ELEM_MASTER = 1.7 // 원소 마스터(세이지 패시브): 마법.원소(볼트) 대미지 배율
const SHIELD_REGEN = 0.25 // 마나실드 회복률: 공격으로 넣은 딜의 이 비율만큼 자기 실드 복구(execAttack/execSkill)
// ── 마법 속성 분류(5속성) ──
// 화염/전격/냉기=원소(마방 적용) · 역장=마방무시 관통 · 무=비원소. 원소의 이해=원소 3종만 강화.
const MAGIC_ELEM = {
  파이어볼트: '화염',
  화염구: '화염',
  라이트닝볼트: '전격',
  아이스볼트: '냉기',
  콜드볼트: '냉기',
  서리구: '냉기',
  역장베기: '역장',
  역장폭발: '역장',
  마나소각: '역장',
  메테오: '무',
  충격파: '무',
  매직미사일: '무'
}
const ELEM_EMO = { 화염: '🔥', 전격: '⚡', 냉기: '❄️', 역장: '🟣', 무: '⚪', 신성: '🙏' }
const ELEMENTAL = new Set(['화염', '전격', '냉기']) // 원소의 이해 대상(역장·무 제외)
function magicElem (name) { return MAGIC_ELEM[name] || '무' }
function isElemental (name) { return ELEMENTAL.has(magicElem(name)) } // 원소 3종이면 true
function isPierce (name) { return magicElem(name) === '역장' } // 역장=마방무시 관통
// ── 볼트 = 순수 spec(마법.원소.* + 발수[1,5] + 시전). 볼트 전용 딜코드 없음: 발사는 runDamage로. ──
// 파이어=고배율/2시전 · 라이트닝=1시전 · 콜드=즉발+둔화(쿨1). 시전형(볼트마법사)·오토스펠(세이지)·조합 공유.
const BOLT_SPECS = {
  파이어볼트: { name: '파이어볼트', type: '마법.원소.화염', mult: 0.8, hits: [1, 5], cast: 2 },
  라이트닝볼트: { name: '라이트닝볼트', type: '마법.원소.전격', mult: 0.5, hits: [1, 5], cast: 1 },
  콜드볼트: { name: '콜드볼트', type: '마법.원소.얼음', mult: 0.3, hits: [1, 5], cast: 0, cc: { slow: 1 } }
}
const CHAIN_MULT = 1.5 // 볼트마법조합 중 볼트(본 볼트·짝 볼트) 계수 배율 — 볼트마법사 전용(세이지 오토스펠은 조합 없음)
const BOLT_PAIR = { 파이어볼트: '라이트닝볼트', 라이트닝볼트: '콜드볼트', 콜드볼트: '파이어볼트' } // 볼트마법조합 후속(파이어→라이트닝→콜드→파이어)
// 볼트 발사: runDamage(볼트 spec) + cc + (조합이면) 짝 볼트 즉시 후속. 시전해소·오토스펠·즉발 공유. 나레이션용 boltHits/boltNames 세팅.
function launchBolt (s, foe, ds, df, bn, chain) {
  const one = (nm) => { const sp = chain ? Object.assign({}, BOLT_SPECS[nm], { mult: BOLT_SPECS[nm].mult * CHAIN_MULT }) : BOLT_SPECS[nm]; const r = runDamage(sp, s, foe, ds, df); if (sp.cc && sp.cc.slow && r.landed) { applyCC(foe, 'slow', sp.cc.slow); foe.slowSec = Math.max(foe.slowSec, 1) } return r }
  const r = one(bn); let hits = r.hits.map(h => h.dealt); let names = r.hits.map(() => bn); let total = r.total
  if (chain) { const pn = BOLT_PAIR[bn]; const pr = one(pn); hits = hits.concat(pr.hits.map(h => h.dealt)); names = names.concat(pr.hits.map(() => pn)); total += pr.total } // 조합: 짝 볼트 즉시 후속발사
  s.boltHits = hits; s.boltNames = names; s.lastBolt = true; s.boltShots = hits.length
  return total
}
// 시전형 볼트 스킬 팩토리(창고). 파이어·라이트닝=s.cast 게이트(쿨 없음) / 콜드=즉발(쿨1)
function boltCastSkill (ci, bn) {
  const B = BOLT_SPECS[bn]
  const spec = { name: bn, tag: '공격', type: B.type, mult: B.mult, hits: B.hits, cast: B.cast, cc: B.cc, cd: B.cast > 0 ? null : 1 } // coef 자동생성(발당 마공×N · 1~5발 · 시전/즉발 + cc)
  return Object.assign({}, spec, {
    // 조합(chainBolt) 중엔 콜드도 1시전이 되므로, 콜드 ready도 시전가능(safe) 요구
    ready: (s, f, ds, df, x) => (B.cast + (s.chainBolt > 0 ? 1 : 0)) > 0 ? (s.cast === 0 && x.safe) : (s.cd[ci] === 0),
    score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), // 딜(boltMaster 발수·원소마스터·조합×2)·시전(+조합)·cc 전부 estDamage/autoScore가 처리
    exec: (s, f, ds, df) => {
      const castT = B.cast + (s.chainBolt > 0 ? 1 : 0) // 볼트마법조합: 모든 볼트류 시전 +1(콜드 0→1시전으로 리스크 발생)
      if (castT > 0) { const cut = s.castCut > 0 ? 1 : 0; s.castCut = 0; s.cast = Math.max(1, castT + (ds.무기.castMod || 0) - cut); s.castUninterruptible = false; s.castTotal = s.cast; s.castName = bn; s.castBolt = bn; s.castBoltChain = s.chainBolt > 0; s.cd[ci] = 1; s.note = bn + ' 시전' } else { launchBolt(s, f, ds, df, bn, s.chainBolt > 0); s.cd[ci] = 1; s.note = bn } // 콜드 즉발(비조합/조합)
    }
  })
}
// 볼트 다단 → 원소묶음 표시: total을 발당 비율로 배분 후 원소별 그룹핑(🔥파이어(a·b) ⚡라이트닝(c) …)
function boltGroupStr (hits, names, total) {
  const raw = hits.reduce((a, b) => a + b, 0) || 1
  const emo = { 파이어볼트: '🔥', 라이트닝볼트: '⚡', 콜드볼트: '❄️', 아이스볼트: '❄️' }
  const order = ['파이어볼트', '라이트닝볼트', '콜드볼트', '아이스볼트']
  const g = {}; let acc = 0; const n = hits.length
  hits.forEach((h, i) => { const v = i === n - 1 ? total - acc : Math.round(h / raw * total); acc += v; const nm = (names && names[i]) || '볼트'; (g[nm] = g[nm] || []).push(v) })
  return order.filter(nm => g[nm]).map(nm => `${emo[nm] || ''}**${nm}**(${g[nm].join('·')})`).join(' ')
}
const SANCTUARY_TAKEN = 0.15 // 성역: 받는 피해 85% 감소(15%만 받음)
// 주먹 흡수: 투경 히트 몫(A._tkFrac)은 실드효율 1.0, 나머지는 무기 실드효율. 실드 없거나 효율 1이면 일반 absorb
function fistAbsorb (A, foe, dmg, eff) { if (!eff || eff >= 1 || !(foe.shield > 0) || !(A._tkFrac > 0)) return absorb(foe, dmg, eff); const tk = Math.round(dmg * A._tkFrac); return absorb(foe, tk, 1) + absorb(foe, dmg - tk, eff) }
function absorb (foe, dmg, eff = 1) { if (foe.sanctuary > 0) return dmg > 0 ? Math.max(Math.round(dmg * SANCTUARY_TAKEN), 1) : 0; if (foe.shield > 0) { const sd = dmg * eff; if (sd <= foe.shield) { foe.shield -= Math.round(sd); return 0 } else { const r = Math.round(dmg - foe.shield / eff); foe.shield = 0; return r } } return dmg } // 성역(프리스트): 받는 피해 85%↓. 실드 파괴 시 취약 부여 제거 — 큰 실드에선 깨짐+취약 이중페널티라 과함. eff=공격자 무기 실드효율(너클 0.5: 주먹은 마나실드를 절반 효율로만 깎음, 실드를 넘긴 몫은 그대로 HP)
// 스블 마검 인챈트 AI 자동선택: 빠른 상대면 전격(마비=턴 뺏기) / 저마방이면 화염(raw) / 그 외 얼음(둔화)
function pickEnchant (foe, df) { if (df.마방 < 0.30) return '화염'; if (df.턴 > 5.0) return '얼음'; return '전격' }
const ENCHANT_EMO = { 화염: '🔥', 얼음: '❄️', 전격: '⚡' }
const PARALYZE_CHANCE = 0.20 // 마비(전격): 지속 중 매 턴 이 확률로 턴 상실
// 충격(impact) 대미지: 물방·마방·마나실드 전부 무시(방어구 관통, hp 직접). 단 능동방어(완전회피·천운·회피·무기막기·방패막기)로는 막힘. 반환값을 absorb 없이 foe.hp에 직접 적용할 것.
function impactDmg (A, D, dA, dD, base) {
  const lsD = { used: false }
  A.didAttack = true // 충격 스킬도 '공격'으로 표기 — 회피/천운 흘림 시 narration이 miss 문구를 띄우도록(발경·아수라패황권)
  const canDef = D.stun === 0 && D.cast === 0
  if (D.sanctuary > 0) { A.lastDef = '성역'; return Math.max(Math.round(base * SANCTUARY_TAKEN), 1) } // 성역: 충격딜도 85%↓(방어구무시 관통조차 완화)
  if (psv(D, '행운의여신') && rand() < D.행운의여신) { A.lastDef = '행운의여신'; return 1 } // 갬블러 운빨방어
  if (canDef && dD.sigDodge && rand() < 0.10) { A.lastDef = '완전회피'; return 0 } // 행운100 시그
  if (canDef && luckRoll(false, lsD, (D.luckLock > 0 ? 0 : dD.천운))) { A.lastDef = '천운'; return 0 } // 천운 완전회피
  if (canDef && luckRoll(rand() < Math.max(dD.물회 - (dA.sigAim ? 0.05 : 0), 0) * (A.accBuff > 0 ? 0.35 : 1) + (D.dodgeUp > 0 ? 0.4 : 0) + woundDodge(D, A), lsD, (D.luckLock > 0 ? 0 : dD.리롤))) { A.lastDef = '회피'; if (dD.sigEcho) D.echoReady = 1; return 0 } // 회피
  let blk = 1
  if (canDef && dD.무기.주사위) { blk = diceBlockMul(A, D) } else if (canDef && dD.방패막기 && rand() < dD.방패막기) { blk = blockMul(D, dD); A.lastDef = '방패막기' } else if (canDef && dD.무기막기 && D.weaponBroken === 0 && rand() < dD.무기막기) { blk = dD.무기막기경감; A.lastDef = '무기막기' } // 주사위 방어(갬블러)는 충격도 경감 / 막기
  let d = base * blk * parryMul(D, dD)
  if (rand() < 0.30) { d *= 0.70; A.grazed = true } // 빗맞음
  d *= gutsMul(dD, D.hp, dD, D) // 근성·현자균형(내재 강인함은 적용, 방어구만 관통)
  if (dD.무기.받는뎀) d *= (1 - dD.무기.받는뎀)
  d *= wardMul(D)
  return Math.max(Math.round(d), 1)
}
// 확정딜(갬블러 %딜): 체력비례(체력+마나실드 기준) · 방어구(물/마방) 무시 · 능동방어(회피·막기·천운·빗맞음) 불가(확정 명중) · 마나실드는 흡수(실드도 체력의 일부) · 성역 적용. 반환값을 f.hp에서 빼면 됨(absorb 내장)
function trueDmg (A, D, dD, base) {
  A.didAttack = true
  if (D.sanctuary > 0) { A.lastDef = '성역'; return absorb(D, Math.max(Math.round(base * SANCTUARY_TAKEN), 1)) } // 성역 85%↓ 후 실드 흡수
  if (psv(D, '행운의여신') && rand() < D.행운의여신) { A.lastDef = '행운의여신'; return absorb(D, 1) }
  return absorb(D, Math.max(Math.round(base * wardMul(D) * parryMul(D, dD)), 1)) // 실드 흡수, 방어구·능동방어는 무시(패링은 흘림)
}
// 시전 마법(화염구/인캐) 피해: 일반 마법과 동일 — 천운 완전회피 / 마방 감소 / 빗맞힘 / 근성
function spellDmg (base, foe, df, atk) { if (psv(foe, '행운의여신') && rand() < foe.행운의여신) return 1; if (rand() < df.리롤) return 0; let blk = 1; if (df.방패막기 && rand() < df.방패막기) { blk = blockMul(foe, df); foe.spellBlocked = true }; if (df.무기.주사위 && foe.stun === 0 && foe.cast === 0) blk *= diceBlockMul(atk, foe); blk *= parryMul(foe, df); let dmg = Math.max(Math.round(guts(base * blk * (1 - (foe.shield > 0 ? 0 : crushArmor(foe, df.마방))) * magicGraze() * wardMul(foe), foe, df)), 0); if (atk && foe.magReflect > 0 && dmg > 0) { const rr = (df.무기.방어 === '방패') ? 1.0 : 0.7; atk.hp -= Math.max(Math.round(dmg * rr), 1); atk.lastRefl = rr >= 1 ? 'full' : 'part'; dmg = Math.round(dmg * (1 - rr)); foe.magReflect = 0 }; return dmg } // §13: 실드 있으면 마방 경감 스킵. 마법반사: 시전마법도 반사(방패100%/그외70%) — 시전·즉시 모두 spellDmg 경유라 통일
// 시전 중 피격 → 5% 시전 중단(취소). 피해가 실제로 들어갔을 때만("정말 운 없을 때")
function castHit (A, D, fin) { if (D.cast > 0 && !D.castUninterruptible && fin > 0 && rand() < 0.05) { D.cast = 0; D.castCut = 2; A.brokeCast = true } } // 시전 중 피격 5% 시전 취소(끊기 불가 제외) → castCut 버프(다음 시전 -1턴)
// 신성(holy) 피해: 마방 적용 마법피해 + 참회 시너지. 참회 걸린 상대에 신성딜 → 최대체력5% 고정딜(관통) 추가. 매 신성타격마다 참회(1턴) 생성·갱신 → 신성 연타 자체시너지
function holyDmg (A, D, dA, dD, base) {
  A.holyHit = 0; A.repentHit = 0 // 신성/참회 분리 표기용(내레이션)
  if (D.sanctuary > 0) { D.hp -= 1; A.holyHit = 1; return 1 } // 상대 성역: 1
  if (psv(D, '행운의여신') && rand() < D.행운의여신) { D.hp -= 1; A.holyHit = 1; return 1 }
  let raw = base * (1 - (D.shield > 0 ? 0 : crushArmor(D, dD.마방))) * magicGraze() * wardMul(D) * parryMul(D, dD) // 마방 적용(실드 있으면 실드가 흡수하므로 마방 스킵) + 편차 + 심연의포옹 + 패링
  raw = guts(raw, D, dD) // 근성·현자균형
  let dmg = absorb(D, Math.max(Math.round(raw), 1)); if (dmg === 0) dmg = 1 // 실드 흡수 — 단 신성은 마법이라 실드/마방에도 최소 1 관통
  // 참회 스택(1~10): 프리스트 본인의 버프(A 기준). 2턴 내 신성 재명중 시 +1, 아니면 1부터. 내 턴 기준이라 느려도 다음 턴에 유지·사용 가능
  A.repentStack = (A.repentWin > 0) ? Math.min((A.repentStack || 0) + 1, 10) : 1
  A.repentWin = 2 // 윈도우 갱신(내 2턴 내 재명중 요구)
  const bonus = Math.max(Math.round(dD.maxhp * A.repentStack * 0.007), 1) // 스택 1당 상대 최대체력 0.7%(방어·실드 무시 관통) (최대 10스택=7%)
  D.hp -= (dmg + bonus)
  A.holyHit = dmg; A.repentHit = bonus
  return dmg + bonus
}
// 능력치 버프 재계산(프리스트 축복/가호, 갬블러 다이아): 타이틀 포함 base 스냅샷에서 활성 배율만 재적용 → 순서·중첩·복원 안전
function refreshDerived (self, ds) {
  if (!self.derBase) self.derBase = { 물공: ds.물공, 마공: ds.마공, 명중: ds.명중, 물회: ds.물회, 크리: ds.크리, 턴: ds.턴, 물방: ds.물방, 마방: ds.마방 } // 최초 버프 시점(타이틀 반영된 dA)에서 스냅샷
  const B = self.derBase
  const bl = self.blessTurns > 0 ? 1.30 : 1 // 축복: 공격분(공/명중/회피/크리) 30%↑ — 방어력은 제외(불사 방지)
  const ag = self.aegisTurns > 0 ? (self.aegisMul || 2) : 1 // 가호(×2)/다이아(×1.5): 방어력 배율
  ds.물공 = Math.round(B.물공 * bl); ds.마공 = Math.round(B.마공 * bl)
  ds.명중 = B.명중 * bl; ds.물회 = B.물회 * bl; ds.크리 = Math.min(B.크리 * bl, 0.9)
  ds.턴 = Math.max(B.턴 * (self.blessTurns > 0 ? 0.70 : 1), 2) // 속도 30%↑(공격·속도 통일)
  ds.물방 = Math.min(B.물방 * ag, 0.9); ds.마방 = Math.min(B.마방 * ag, 0.9) // 방어는 가호만(축복 제외)
}
function applyCC (foe, field, dur) {
  if (foe.undead && (field === 'stun' || field === 'paralyze')) return // 살아있는 시체: 기절·마비 면역(언데드)
  const d = foe.sigTank ? Math.max(dur - 1, 0) : dur
  // 광란 CC저항 제거: 광전도 CC를 온전히 받음(근접 카운터플레이 확보)
  if (foe.parry && foe.stun === 0 && foe.cast === 0) { (foe.pendCC = foe.pendCC || []).push([field, d]); return } // 패링 태세: CC 보류 — 동반 타격이 파리되면 폐기(흘림), 순수CC(딜 없음)면 스킬 종료 시 적용
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
  const w = a.무기 || {}
  if (a.hybrid) return (a.물공 * (w.물공배율 || 1) * (1 - d.물방) * Math.max(a.명중, 0.3)) + (a.마공 * (w.마타 || 0.68) * (1 - d.마방))
  if (a.평타마법 || (a.평타마법 == null && w.평타 === '마법')) return a.마공 * (a.평타계수 || 1) * (a.마뎀너프 || 1) * (1 - d.마방) // §13: 무기계열 판정(마공>물공 대신) — 스태프0.55·완드0.66 반영
  return a.물공 * (w.물공배율 || 1) * (1 - d.물방) * Math.max(a.명중, 0.3) // §13: 물공배율 반영
}
// 범용 디버프 레지스트리 — 룰렛(갬블러) 등 랜덤 디버프가 여기서 추출. 새 범용 디버프는 여기 한 줄만 추가하면 자동 포함
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
// 무도가 모핑 콤보: 슬롯 1개가 comboStep에 따라 육합권→연환전신장→맹룡과강으로 변신. 적중마다 다음 단계. AI·플레이어 모두 순서 강제(단독 사용 불가)
// 무도가 육합권: 패시브 프록(평타 히트당 확률) → 연환격 슬롯(연환전신장→맹룡) 개시. 스펙은 기존 육합권과 동일(×1.3 3타)
const MUDO_YUK = { name: '육합권', type: '물리.일반', mult: 1.1, hits: 3 }
const MUDO_MINJAB = 2 // 최소 이만큼 히트(대) 쌓여야 육합권 프록 시작
const MUDO_PROC = 0.30 // 평타 히트당 프록 확률(너클 다단2 → 턴당 ~51%)
const TUKYUNG_PROC = 0.10 // 투경(무도가 패시브): 타격 히트마다 이 확률로 방어(물방·마방) 무시
function mudoCombo () {
  // 육합권은 패시브 프록으로 이관 → 이 슬롯은 프록 후 연환전신장→맹룡과강 연계만. 너클 다단:2를 hits로 눌러 연타 자체정의.
  const st1 = { name: '연환전신장', type: '물리.일반', mult: 1.2, hits: 4 }
  const st2 = { name: '맹룡과강', type: '물리.일반', mult: 7.0, hits: 1 }
  const s1 = Object.assign({}, st1, { lvl: 1, exec: (s, f, ds, df) => { const r = runDamage(st1, s, f, ds, df); s.multiHits = r.hits.map(h => h.dealt); if (r.landed) { s.comboStep = 2; s.comboWin = 3 } else { s.comboStep = 0; s.comboWin = 0 } s.cd[0] = 0; s.note = r.landed ? '연환전신장·연계' : '연환전신장·빗나감' }, score: (s, f, ds, df, x) => dmgVal(ds.물공 * 4.8 * (1 - df.물방), 1, 0, f.hp, x.foeTurn) })
  const s2 = Object.assign({}, st2, { lvl: 2, exec: (s, f, ds, df) => { runDamage(st2, s, f, ds, df); s.comboStep = 0; s.comboWin = 0; s.cd[0] = 0; s.note = '맹룡과강·작렬' }, score: (s, f, ds, df, x) => dmgVal(ds.물공 * 7.0 * (1 - df.물방), 1, 0, f.hp, x.foeTurn) }) // 맹룡 후 쿨 없음: 재적중이 자연 쿨
  const stage = (s) => (s.comboStep >= 2 && s.comboWin > 0) ? s2 : s1
  return { name: '연환격', tag: '공격', combo: true, coef: '연계(육합권 발동 후): 연환전신장(×1.2 4연타)→맹룡과강(×7.0 피니셔)', stageName: (s) => stage(s).name, stageLevel: (s) => stage(s).lvl, ready: (s, f, ds, df) => s.cd[0] === 0 && s.comboStep >= 1 && s.comboWin > 0, score: (s, f, ds, df, x) => stage(s).score(s, f, ds, df, x) * 1.7, exec: (s, f, ds, df) => stage(s).exec(s, f, ds, df) } // 육합권 프록됐을 때만 사용 가능
}
// 육합권 프록 실행: 평타(너클 다단2) + 육합권(×1.3 3타)이 동시에 파바박 → 연계 개시(comboStep=1). 히트를 평타/육합권 분리 저장(나레이션)
const MUDO_AUTO = { type: '물리.일반', mult: 0.5, hits: 2 } // 너클 평타분(다단2): 히트당 물공×0.5 → 총 ×1.0(정상 평타와 동일)
function execMudoYukhap (self, foe, ds, df) {
  const fb = foe.hp; const sb = self.hp; const psh = foe.shield
  const rAuto = runDamage(MUDO_AUTO, self, foe, ds, df) // 평타 2타
  const rYuk = runDamage(MUDO_YUK, self, foe, ds, df) // 육합권 3타
  const dealt = Math.max(fb - foe.hp, 0)
  if (rAuto.landed || rYuk.landed) { self.comboStep = 1; self.comboWin = 3 } // 연타가 닿으면 연계 개시(마나실드에 흡수돼도 '닿음' — HP 감소 기준이면 실드 상대에게 콤보가 영영 안 열림)
  self.defCombo = 0; self.defendedLast = false
  { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dealt > 0) self.hp -= Math.max(Math.round(dealt * tp), 1) }
  if (foe.pendCC) { for (const _c of foe.pendCC) foe[_c[0]] = Math.max(foe[_c[0]], _c[1]); foe.pendCC = null }
  const didParry = foe.parryHit; if (didParry) { foe.gauge = 0; foe.parryHit = false; parryHeal(foe, df) }
  bigHitHeal(foe, df, dealt)
  return { parried: didParry, tukyung: self.tukyungHits, type: 'attack', name: '육합권', dmg: dealt, autoHits: rAuto.hits.map(h => h.dealt), yukHits: rYuk.hits.map(h => h.dealt), def: self.lastDef, grazed: self.grazed, shieldAbsorb: Math.max(psh - foe.shield, 0), selfDmg: Math.max(sb - self.hp, 0), selfHp: Math.round(Math.max(self.hp, 0)), selfMax: ds.maxhp }
}
const SKILLS = {
  검투사: [
    // 분쇄: 1쿨 타격 + 상대 물방·마방 감소 스택(스택당 -5%p, 최대5, 지속2). 스팸으로 방어를 깎아 후속딜 증폭
    (() => { const spec = { name: '분쇄', tag: '공격', type: '물리.일반', mult: 1.6, dmg: { foeHp: 0.03 }, stack: '물방·마방 -5%p·회복 -15% 스택(적중·최대5·지속2)', cd: 1 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + (f.crush < 5 ? df.maxhp * 0.03 : 0), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); if (r.landed) { f.crush = Math.min((f.crush || 0) + 1, 5); f.crushDur = 2 } s.cd[0] = 1; s.note = r.landed ? '분쇄' : '분쇄·빗나감' } }) })(), // autoScore 파일럿: 딜/라이더 자동 + 스택부여 가치 addon
    (() => { const spec = { name: '돌진', tag: '제어', type: '물리.일반', mult: 2, dmg: { foeHp: 0.08, selfStr: 0.5 }, recoil: 0.04, cc: { stun: 2 }, cd: 4 }; return Object.assign({}, spec, { ready: (s, f, ds, df) => s.cd[1] === 0 && f.stun === 0 && s.hp > ds.maxhp * 0.2, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); if (r.landed && !f.parryHit) applyCC(f, 'stun', 2); s.cd[1] = 4; s.note = f.parryHit ? '돌진(패링됨)' : '기절' } }) })(), // autoScore 파일럿: 딜+라이더+스턴CC+반동 자동
    // 방해: 시전 중이면 취소+1턴 침묵 / 아니면 1턴 스턴 + 딜. 캐스터·물리 양쪽 대응(범용)
    { name: '방해', tag: '제어', interrupt: true, cc: { stun: 1 }, cd: 3, ready: (s, f, ds, df) => s.cd[2] === 0 && f.stun === 0, score: (s, f, ds, df, x) => dmgVal(x.est, 1, f.cast > 0 ? x.foeTurn * 3 : (f.stun === 0 ? ctrlVal(x.foeTurn, 1, 'stun') * stunTiming(s, f) : 0), f.hp, x.foeTurn), exec: (s, f, ds, df) => { const wasCasting = f.cast > 0; const meteor = wasCasting && f.castUninterruptible; if (wasCasting) { if (!meteor) { f.cast = 0; f.castCut = 2 } applyCC(f, 'silence', 1); s.note = meteor ? '메테오 방해 실패' : '시전 차단'; if (meteor) s.meteorImmune = true } else { applyCC(f, 'stun', 1); s.note = '기절' } let d = attack(s, f, ds, df, f.defending, true); d = absorb(f, d); f.hp -= d; if (wasCasting && !meteor) s.brokeCast = true; s.cd[2] = 3 } }, // guaranteed=true: 확정 명중(딜×1.0). 시전 끊으면 brokeCast
    // 발차기: 순수 CC(딜 없음) — 자잘한 군중제어. 1턴 스턴, 쿨4
    mkSkill(3, { name: '발차기', tag: '제어', cc: { stun: 1 }, cd: 2, note: '기절', ready: (s, f) => s.cd[3] === 0 && f.stun === 0, score: (s, f, ds, df, x) => ctrlVal(x.foeTurn, 1, 'stun') * stunTiming(s, f) })
  ],
  광전사: [
    // 개편: 피 태우는 하이리스크(불굴 없음). 저체력→광란(회복↑·속도↑·제어면역) + 격노(피격 시 공격력↑)
    skBloodThirst(0), // 피의갈증: 회복(광란 증폭) + 딜, 쿨1
    skBloodRage(1), // 피의격노: 체력15%↓ → 공격력 버프
    skClash(2), // 격돌: 2턴 스턴 + 체력5%↓
    // 해방: 긴 쿨(13) 자가 속박 해제 + 5% 회복. 기절 중 사용 가능(stunnable) — 근접 CC 카운터의 오프너 탈출용
    { name: '해방', tag: '회복', cd: 15, stunnable: true, coef: '체력 15% 즉시회복 + 행동불능 즉시해제', ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => (s.hp > 0 && s.hp < ds.maxhp * 0.35) ? x.est * 0.6 : 0, exec: (s, f, ds, df) => { const broke = s.stun > 0 || s.stunned; s.stun = 0; s.stunned = false; s.hp = Math.min(s.hp + hcut(s, healVar(ds.maxhp * 0.15)), ds.maxhp); s.cd[3] = 15; s.note = broke ? '해방(속박 해제)' : '해방' } }
  ],
  기사: [
    // 방패밀쳐내기: 물리딜(배율×2) + 상대 최대체력 12% + 자기 최대체력 3%(버티는 체력이 곧 화력)를 배율로 추가 — 스윙 명중 시 합산(회피·막기·실드 모두 적용), HP스케일 탱버스터
    (() => { const spec = { name: '방패밀쳐내기', tag: '공격', type: '물리.일반', mult: 2, dmg: { foeHp: 0.12, selfHp: 0.03 }, cd: 3 }; return Object.assign({}, spec, { ready: (s, f, ds, df) => s.cd[0] === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[0] = 3; s.note = '방패밀쳐내기' } }) })(), // autoScore 파일럿: 딜+상대체력 라이더 자동
    // 방패들기: 3턴간 방패막기 경감 강화(30%→90%). + 패시브 가시방패(상시 20% 반사)
    mkSkill(1, { name: '방패들기', tag: '버프', buff: 5, cd: 6, selfBuff: { blockUp: 5 }, ready: (s, f, ds) => s.cd[1] === 0 && s.blockUp === 0 && ds.방패막기 > 0, score: (s, f, ds, df, x) => buffVal(x.foeTurn * 1.2, s, ds) }),
    // 방패가격: 시전 중이면 즉시 차단(취소)+공격력 소폭↑ / 아니면 1턴 스턴. 기사의 유일한 제어기(캐스터 견제·시전끊기)
    { name: '방패가격', tag: '제어', interrupt: true, cc: { stun: 1 }, cd: 3, ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => f.cast > 0 ? x.foeTurn * 3 : (f.stun === 0 ? ctrlVal(x.foeTurn, 1, 'stun') : 0), exec: (s, f, ds, df) => { const wc = f.cast > 0; const meteor = wc && f.castUninterruptible; if (wc && !meteor) { f.cast = 0; f.castCut = 2; s.brokeCast = true; s.powBuff = 3; s.powMul = 1.15; s.note = '시전 차단' } else if (meteor) { s.meteorImmune = true; s.note = '메테오 방해 실패' } else { applyCC(f, 'stun', 1); s.note = '기절' } s.cd[2] = 3 } },
    // 도발: 상대 3턴 강제평타(스킬·버프·방어 봉인) + 자신 2턴 공격 ×1.8. 상대를 강제로 때리게 묶고 강화된 반격으로 처벌(느린 기사도 자기 클럭 버프라 확실)
    mkSkill(3, { name: '도발', tag: '제어', cd: 4, debuff: { taunt: 3 }, selfBuff: { powBuff: 3, powMul: 1.8 }, note: '도발', ready: (s, f) => s.cd[3] === 0 && f.taunt === 0, score: (s, f, ds, df, x) => ctrlVal(x.foeTurn, 2, 'stun') + x.est * 0.5 })
  ],
  마법사: [
    // 화염구: 인캐 걸려있으면 즉발, 아니면 시전(스태프 castMod로 -2턴). 끊기면 잔존 없이 소멸
    (() => { const spec = { name: '화염구', tag: '시전', type: '마법.일반', mult: CAST_SPELLS.화염구.mult, cast: CAST_SPELLS.화염구.cast }; return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { scheduleCast(s, f, ds, df, CAST_SPELLS.화염구) } }) })(),
    // 메테오: 긴 시전(9+무기), 인캐 불가(무조건 하드캐스트), 초대형 한 방. uninterruptible=끊기·기절 면역
    (() => { const spec = { name: '메테오', tag: '시전', type: '마법.일반', mult: CAST_SPELLS.메테오.mult, cast: CAST_SPELLS.메테오.cast, uninterruptible: true }; return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[1] === 0 && x.safe, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { scheduleCast(s, f, ds, df, CAST_SPELLS.메테오); s.cd[1] = 5 } }) })(),
    // 인스턴트캐스팅: 다음 시전 마법을 즉시시전으로(버프·딜 없음). 메테오엔 안 걸림
    mkSkill(2, { name: '인스턴트캐스팅', tag: '버프', buff: 3, cd: 10, selfBuff: { instCast: 3 }, note: '인스턴트 캐스팅', ready: (s) => s.cd[2] === 0 && s.cast === 0 && s.instCast === 0, score: (s, f, ds, df, x) => buffVal(x.est * 3, s, ds) }), // 3턴 시전 리스크 회피 = 고가치
    // 서리구: 짧은 시전(인캐 가능), 딜은 파볼보다 약하나 상대 3턴 둔화. 인캐 심리전 2번째 선택지
    (() => { const spec = { name: '서리구', tag: '시전', type: '마법.일반', mult: CAST_SPELLS.서리구.mult, cast: CAST_SPELLS.서리구.cast, cc: { slow: 3 } }; return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[3] === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { applyCC(f, 'slow', 3); f.slowSec = Math.max(f.slowSec, 2); s.cd[3] = 3; scheduleCast(s, f, ds, df, CAST_SPELLS.서리구) } }) })(),
    // 충격파: 즉발 소량딜 + 상대 현재 턴 진행 초기화(게이지 풀 리셋) + 1턴 둔화 — 느린 캐스터의 템포/카이팅 도구(딜은 곁다리)
    { name: '충격파', tag: '공격', coef: '마공×1.0 + 상대 턴 게이지 초기화 + 1턴 둔화 (기절 중에도 사용)', cd: 8, ready: (s, f, ds, df) => s.cd[4] === 0, score: (s, f, ds, df, x) => dmgVal(spellBase(ds, '충격파') * (1 - df.마방), 1, x.incoming * (Math.max(df.턴 - f.gauge, 0) / df.턴) * 1.5, f.hp, x.foeTurn), exec: (s, f, ds, df) => { let d = spellDmg(spellBase(ds, '충격파'), f, df, s); d = absorb(f, d); f.hp -= d; f.gauge = Math.max(f.gauge, df.턴); applyCC(f, 'slow', 1); f.slowSec = Math.max(f.slowSec, 1); s.cd[4] = 8; s.note = '충격파' }, stunnable: true } // 슬롯4=cd[4] (플레이어 버튼 cd[slot] 정합)
  ],
  볼트마법사: [
    // 시전형 볼트 3종(화염구식 시전마법). 파이어=2시전 고배율 / 라이트닝=1시전 / 콜드=즉발+둔화(쿨1). 발수 1~5(볼트마법의 이해=5고정)
    boltCastSkill(0, '파이어볼트'),
    boltCastSkill(1, '라이트닝볼트'),
    boltCastSkill(2, '콜드볼트'),
    // 볼트마법조합: 4턴 버프 — 활성 중 볼트 착탄 시 다음 원소 볼트 자동 후속(파이어→라이트닝→콜드→파이어)
    mkSkill(3, { name: '볼트마법조합', tag: '버프', buff: 4, cd: 4, selfBuff: { chainBolt: 4 }, note: '볼트마법조합', ready: (s, f, ds, df, x) => s.cd[3] === 0 && s.chainBolt <= 1 && x.safe, score: (s, f, ds, df, x) => buffVal(x.est * 3, s, ds) })
  ],
  암살도적: [
    mkSkill(0, { name: '암습', tag: '제어', cc: { stun: 3 }, cd: 8, note: '기절', ready: (s, f) => s.cd[0] === 0 && f.stun === 0 }), // 순수 CC: 확정 3턴 스턴, 딜 없음(autoScore=봉쇄CC). 쿨은 기절이 풀린 뒤부터
    (() => { const spec = { name: '처형', tag: '공격', type: '물리.일반', mult: 6, coef: '물공×6 (상대 HP30%↓ 처형)', cd: 5 }; return Object.assign({}, spec, { ready: (s, f, ds, df) => s.cd[1] === 0 && f.hp < df.maxhp * 0.30, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[1] = 5; s.note = '처형' } }) })(), // 엔진 이관: attack() 경유(회피·막기·크리 작동). mult 재튜닝 대상
    (() => { const spec = { name: '백스텝', tag: '공격', type: '물리.일반', mult: 1.7, bonus: { when: 'foeStun', mult: 2.7 }, cd: 4 }; return Object.assign({}, spec, { ready: (s) => s.cd[2] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const combo = f.stun > 0; runDamage(spec, s, f, ds, df); s.cd[2] = 4; s.note = combo ? '백스텝·연계' : '백스텝' } }) })(), // 엔진 이관: bonus.when(스턴 시 ×2.7)
    // 입막음: 시전 차단 + 2턴 침묵 + 딜. 목을 노려 주문을 끊는다 — 캐스터 카운터(볼트마법사 봉쇄·마법사 서리구 대응)
    { name: '입막음', tag: '제어', interrupt: true, cc: { silence: 2 }, cd: 6, ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => dmgVal(x.est / Math.max(1 - df.물회, 0.3), 1, f.cast > 0 ? x.foeTurn * 3 : (f.silence === 0 ? ctrlVal(x.foeTurn, 2, 'silence') * magicShare(f.name) : 0), f.hp, x.foeTurn), exec: (s, f, ds, df) => { const wc = f.cast > 0; const meteor = wc && f.castUninterruptible; if (wc && !meteor) { f.cast = 0; f.castCut = 2 } applyCC(f, 'silence', 2); let d = attack(s, f, ds, df, f.defending, true); d = absorb(f, d); f.hp -= d; if (wc && !meteor) s.brokeCast = true; if (meteor) s.meteorImmune = true; s.cd[3] = 6; s.note = meteor ? '메테오 방해 실패' : (wc ? '시전 차단' : '침묵') } }
  ],
  절개도적: [
    // 절개/열상: 1.0× 기본공격 + 명중 시 해당 출혈 스택 +1(최대5, 지속2). 절개 있으면 열상 틱 1.5%→2.5%. 지속 만료 시 1스택씩 점감
    (() => { const spec = { name: '절개', tag: '공격', type: '물리.일반', mult: 1, stack: '절개 스택+1(적중·최대5, 턴당 1.5% 출혈·방어무시)', cd: 3 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + (f.cutStk < 5 ? df.maxhp * 0.05 : 0), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); if (r.landed) { f.cutStk = Math.min((f.cutStk || 0) + 1, 5); f.cutDur = 2 } s.cd[0] = 3; s.note = r.landed ? '절개' : '절개·빗나감' } }) })(), // 엔진 이관: 스택은 명중 게이팅
    (() => { const spec = { name: '열상', tag: '공격', type: '물리.일반', mult: 1, stack: '열상 스택+1(적중·최대5, 턴당 1.5%·절개 시 2.5%)', cd: 3 }; return Object.assign({}, spec, { ready: (s) => s.cd[1] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + (f.lacStk < 5 ? df.maxhp * 0.05 : 0), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); if (r.landed) { f.lacStk = Math.min((f.lacStk || 0) + 1, 5); f.lacDur = 2 } s.cd[1] = 3; s.note = r.landed ? '열상' : '열상·빗나감' } }) })(), // 엔진 이관: 스택은 명중 게이팅
    // 과다출혈: 즉시 절개·열상 각 2스택 + 3턴 상대 회복 80%↓ (딜 없음). 세팅+힐차단
    { name: '과다출혈', tag: '디버프', coef: '즉시 절개·열상 각 2스택 부여 + 3턴 상대 회복량 80%↓ (딜 없음)', cd: 6, ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => df.maxhp * 0.10 + (f.cutStk + f.lacStk < 4 ? df.maxhp * 0.05 : 0), exec: (s, f, ds, df) => { f.cutStk = Math.min((f.cutStk || 0) + 2, 5); f.cutDur = 2; f.lacStk = Math.min((f.lacStk || 0) + 2, 5); f.lacDur = 2; f.healCut = 3; s.cd[2] = 6; s.note = '과다출혈' } },
    // 파열: 절개+열상 스택 소모 → 합계×1.5 확정딜(방어·실드 무시) 후 초기화. 마무리/힐차단용 즉발
    (() => { const spec = { name: '파열', tag: '공격', type: '확정', baseFn: (s, f, ds, df) => (f.cutStk * 0.015 + (f.cutStk > 0 ? 0.025 : 0.015) * f.lacStk) * df.maxhp * 1.5, coefLabel: '절개+열상 스택 소모 → 확정딜(방어·실드 무시) 후 초기화', cd: 8 }; return Object.assign({}, spec, { ready: (s, f) => s.cd[3] === 0 && (f.cutStk > 0 || f.lacStk > 0), score: (s, f, ds, df, x) => dmgVal(spec.baseFn(s, f, ds, df), 1, 0, f.hp, x.foeTurn), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); f.cutStk = 0; f.cutDur = 0; f.lacStk = 0; f.lacDur = 0; s.cd[3] = 8; s.note = '파열' } }) })() // 엔진 이관: 확정 + baseFn(스택 소모식). 소모는 exec에서(runDamage가 스택 읽은 뒤)
  ],
  사냥꾼: [
    // 약점간파: 확정명중(회피 불가) + 확정크리. 단 방패막기·무기막기·방어중은 정식 적용(attack() 경로) — 못 피하지만 막을 순 있다
    (() => { const spec = { name: '약점간파', tag: '공격', type: '물리.일반', mult: 2.3, guaranteed: true, forceCrit: true, bonus: { when: 'foeInstVuln', mult: 3.45 }, coef: '타격×2.3 · 확정 크리 · 회피 무시(막기·방어구는 적용)', cd: 4 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[0] = 4; s.note = '약점간파' } }) })(), // 엔진 이관: guaranteed+forceCrit, bonus.when(약점노출 시 ×3.45). 치명타는 !! 표기로 대체
    mkSkill(1, { name: '견제사격', tag: '공격', type: '물리.일반', mult: 1, debuff: { missDown: 2 }, note: '명중↓', cd: 4, ready: (s, f, ds, df) => s.cd[1] === 0 && f.missDown === 0 && f.hp > df.maxhp * 0.3 }),
    (() => { const spec = { name: '연발사격', tag: '공격', type: '물리.일반', mult: 1.3, hits: 3, cd: 5 }; return Object.assign({}, spec, { ready: (s) => s.cd[2] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); s.multiHits = r.hits.map(h => h.dealt); s.cd[2] = 5; s.note = '연발' } }) })(), // 엔진 이관: coef 자동생성(타격×1.3×3타), 히트별 interleave
    // 사냥꾼덫: 예약형 — 설치 후 상대 2턴 뒤 발동(게이지 밀림 + 1턴 둔화 + 3턴 출혈). 딜은 출혈로. 카이팅/거리 유지
    { name: '사냥꾼덫', tag: '디버프', coef: '2턴 뒤 발동: 턴 게이지 밀림 + 둔화 + 3턴 출혈(물공×0.3/턴)', cd: 5, ready: (s, f, ds, df) => s.cd[3] === 0 && f.trap === 0 && f.bleed === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.8, exec: (s, f, ds, df) => { f.trap = 2; f.trapBleed = Math.round(ds.물공 * 0.3); s.cd[3] = 5; s.note = '덫 설치' } }
  ],
  스펠블레이드: [
    // 약점봉인: 순수 CC(딜 없음) — 상대 최고 스탯에 맞는 군중제어만
    { name: '약점봉인', tag: '제어', coef: '상대 최고 스탯 맞춤 CC (딜 없음)', cd: 3, ready: (s, f, ds, df) => s.cd[0] === 0 && f.stun === 0 && f.slow === 0, score: (s, f, ds, df, x) => ctrlVal(x.foeTurn, 2, 'stun'), exec: (s, f, ds, df) => { const cc = applyAdaptiveCC(f, df); s.cd[0] = 3; s.note = cc } },
    // 역장베기(스펠스트라이크): 타격(확정명중) + 역장 force(마공 flat, 마방 무시). 인챈트 시 성질 변화 — 화염=딜폭발 / 얼음=둔화 / 관통=마나실드 침투
    (() => { const spec = { name: '역장베기', tag: '공격', type: '마법.역장', coefFn: (ds, df, s) => s.enchant === '화염' ? 3.5 : (s.enchant === '얼음' || s.enchant === '전격') ? 3.0 : 2.4, ccFn: (s) => s.enchant === '얼음' ? { slow: 2 } : s.enchant === '전격' ? { paralyze: 3 } : null, coef: '역장 마공×2.4 (인챈트: 🔥×3.5 ❄️×3.0+둔화 ⚡×3.0+마비)', dmgType: '역장', cd: 2 }; return Object.assign({}, spec, { ready: (s) => s.cd[1] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); const e = s.enchant; if (e === '얼음') { applyCC(f, 'slow', 2); f.slowSec = Math.max(f.slowSec, 1) } if (e === '전격') applyCC(f, 'paralyze', 3); s.cd[1] = 2; s.note = e ? (ENCHANT_EMO[e] + ' 역장베기') : '역장베기' } }) })(), // 엔진 이관: 마법.역장 단일화(물리 타격분 제거) + coefFn(인챈트 배율). fmul 재튜닝 대상
    // 룬각인(마검 인챈트): 순수 버프 — 1턴 소모(딜 없음)가 리스크. 3턴 인챈트 속성 부여로 역장베기를 스펠스트라이크로 변화. AI는 인챈트의 미래 가치로 스코어링(상대 보고 자동선택)
    { name: '룬각인', tag: '버프', coef: '마검 인챈트(🔥화염/❄️얼음/⚡전격) 5턴', buff: 5, cd: 6, choose: 'enchant', ready: (s, f, ds, df) => s.cd[2] === 0 && !s.enchant, score: (s, f, ds, df, x) => { const e0 = s.enchantChoice || pickEnchant(f, df); const fmul = e0 === '화염' ? 2.5 : 2.0; const casts = 2.5; const extra = (fmul - 1.2) * ds.마공 * casts; const ctrl = e0 === '얼음' ? ctrlVal(x.foeTurn, 2, 'slow') : e0 === '전격' ? ctrlVal(x.foeTurn, 3, 'stun') * 0.3 * casts : 0; return dmgVal(extra, 1, ctrl, f.hp, x.foeTurn) + 30 }, exec: (s, f, ds, df) => { const e = s.enchantChoice || pickEnchant(f, df); s.enchantChoice = null; s.enchant = e; s.enchantTurns = 5; s.cd[2] = 6; s.note = ENCHANT_EMO[e] + ' ' + e + ' 인챈트' } },
    // 역장폭발: 큰 역장피해(방어 무시 관통) — 대신 이후 2턴 취약(받는뎀 +50%). 고위험 버스트
    (() => { const spec = { name: '역장폭발', tag: '관통', type: '마법.역장', mult: 4.5, dmgType: '역장', cd: 7 }; return Object.assign({}, spec, { ready: (s) => s.cd[3] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[3] = 7; s.note = '역장폭발' } }) })(), // 엔진 이관: 마법.역장(마나실드 흡수). 침투는 역장베기만
    // 마나대시: 상대 1턴 스턴(아그로 차단) + 본인 5턴 20% 가속. 스턴락 탈출 + 인챈트 셋업 보호
    mkSkill(4, { name: '마나대시', tag: '버프', buff: 5, cd: 3, cc: { stun: 1 }, selfBuff: { haste: 5 }, note: '마나대시', ready: (s) => s.cd[4] === 0 && s.haste === 0, score: (s, f, ds, df, x) => buffVal(x.est * 0.6, s, ds) + (f.stun === 0 ? ctrlVal(x.foeTurn, 1, 'stun') : 0) })
  ],
  스펠브레이커: [
    // 마나소각: 마나실드 파괴 + 마공 딜(실드 있었으면 ×1.5) — 마나실드 캐스터 카운터
    (() => { const spec = { name: '마나소각', tag: '공격', type: '마법.역장', mult: 1.2, bonus: { when: 'foeShield', mult: 3.5 }, ccFn: (s, f) => f.shield > 0 ? { slow: 3 } : null, coef: '마공×1.2 (마나실드 있으면 ×3.5 + 3턴 둔화)', dmgType: '역장', cd: 3 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const sh = f.shield > 0; runDamage(spec, s, f, ds, df); if (sh) { applyCC(f, 'slow', 3); f.slowSec = Math.max(f.slowSec, 1) } s.cd[0] = 3; s.note = sh ? '마나소각' : '마나번' } }) })(), // 마법.역장 + bonus.when(실드 시 ×3.5+둔화). 기본1.2(물리딜러엔 약)·실드3.5(캐스터 특화)·쿨3
    // 시전파괴: 상대 시전 확정 차단 + 3턴 침묵 + 딜 — 마법사 하드카운터
    // 시전파괴: 캐스터(지능70+) 상대면 침묵락+시전 차단+딜(대박) / 물딜러 상대면 자기 기절(리스크). AI는 캐스터에게만 사용
    { name: '시전파괴', tag: '제어', interrupt: true, cc: { silence: 2 }, cd: 3, ready: (s, f, ds, df) => s.cd[1] === 0 && df.base.지능 >= 70 && (f.silence <= 1 || f.cast > 0), score: (s, f, ds, df, x) => f.cast > 0 ? x.foeTurn * 3 : (f.silence === 0 ? ctrlVal(x.foeTurn, 2, 'silence') * magicShare(f.name) : 0), exec: (s, f, ds, df) => { s.cd[1] = 3; const wc = f.cast > 0; const meteor = wc && f.castUninterruptible; if (wc && !meteor) { f.cast = 0; f.castCut = 2; s.brokeCast = true } if (meteor) s.meteorImmune = true; applyCC(f, 'silence', 2); s.note = meteor ? '메테오 방해 실패' : (wc ? '시전 차단' : '침묵') } }, // 딜 없음: 침묵 2턴 + 시전 즉시차단(캐스터 전용)
    // 무기파괴: 3턴간 상대 딜 1/3(물리·마법 공통). 안티캐스터가 물리 상대에도 통하는 카운터 — 순수 디버프(즉발)
    mkSkill(2, { name: '무기파괴', tag: '디버프', cd: 6, debuff: { weaponBroken: 4 }, ready: (s, f) => s.cd[2] === 0 && f.weaponBroken === 0 }),
    // 파훼: 마공딜 + 상대 버프 즉시 전부 제거 — 버프·패시브 의존 캐스터(세이지 오토스펠·프리 성역·광전 격노 등) 카운터
    (() => { const spec = { name: '파훼', tag: '공격', type: '마법.일반', mult: 1.8, coef: '마공×1.8 + 상대 버프 즉시 제거', cd: 5 }; return Object.assign({}, spec, { ready: (s) => s.cd[3] === 0, score: (s, f, ds, df, x) => { const buffs = BUFF_FIELDS.filter(k => f[k] > 0).length; return autoScore(spec, s, f, ds, df, x) + buffs * 30 }, exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); const cleared = clearBuffs(f, df); s.cd[3] = 5; s.note = cleared ? `파훼(버프${cleared} 제거)` : '파훼' } }) })(), // 마법.일반 딜 + clearBuffs(버프 전부 제거)
    // 마법반사: 1턴 마법반사 태세 — 방패=100% 반사 / 그 외 무기=70% 반사+30% 피격. 마법 평타·볼트 대상(시전마법 제외)
    mkSkill(4, { name: '마법반사', tag: '버프', buff: 1, cd: 3, selfBuff: { magReflect: 1 }, note: '마법반사 태세', ready: (s) => s.cd[4] === 0 && s.magReflect === 0, score: (s, f, ds, df, x) => { const mg = magicShare(f.name); return mg > 0.3 ? df.마공 * 1.2 * mg + 40 : 0 } })
  ],
  무도가: [
    mudoCombo(), // 슬롯0(cd0): 모핑 콤보 — 육합권→연환전신장→맹룡과강(적중마다 변신). 연환/맹룡은 스킬창에서 제외(순서 강제)
    // 아수라패황권(슬롯1/cd1): 자기 체력→1, 상대 최대HP×0.8 충격, 3턴 자체둔화. 올인 피니셔(시작쿨7)
    mkSkill(1, { name: '아수라패황권', tag: '공격', type: '물리.충격', dmg: { foeHp: 0.8 }, recoilCur: 0.99, selfCC: { slow: 3 }, dmgType: '충격', note: '아수라패황권!', cd: 14, ready: (s, f, ds) => s.cd[1] === 0 && s.hp > 1 && s.hp <= ds.maxhp * 0.35, score: (s, f, ds, df, x) => { const nuke = df.maxhp * 0.8; return f.hp <= nuke * 0.7 ? dmgVal(nuke, 1, 0, f.hp, x.foeTurn) * 1.4 : dmgVal(nuke, 1, 0, f.hp, x.foeTurn) * 0.2 } }) // 저체력(35%↓) 반등용 게이트 — 유리할 땐 콤보로, 궁지에서만 올인(동전던지기 방지)
  ],
  프리스트: [
    // 힐: 즉시 체력 30% + 지능×1 회복(짧은 쿨 유지기). 회복불가 중엔 사용 불가
    mkSkill(0, { name: '힐', tag: '회복', heal: { pct: 0.15, stat: '지능' }, cd: 6, ready: (s, f, ds) => s.cd[0] === 0 && s.hp < ds.maxhp * 0.9 && s.healBlock === 0, score: (s, f, ds, df, x) => (ds.maxhp - s.hp) * 0.55 - repentResetCost(s, ds, df) }),
    // 축복: 5턴 전 능력치 20%↑(공격·명중·회피·크리·속도·방어). 근사 구현(refreshDerived)
    { name: '축복', tag: '버프', coef: '5턴 — 능력치 30%↑(공격·명중·회피·크리·속도, 방어 제외)', buff: 5, cd: 6, ready: (s, f, ds, df) => s.cd[1] === 0 && s.blessTurns === 0, score: (s, f, ds, df, x) => buffVal(x.est * 0.4 * 5, s, ds) - repentResetCost(s, ds, df), exec: (s, f, ds, df) => { s.blessTurns = 5; refreshDerived(s, ds); s.cd[1] = 6; s.note = '축복 · 공격·속도 30%↑(5턴)' } },
    // 성역: 3턴 무적급(받는 피해 모두 1) + 턴당 체력3%회복 + 턴당 상대 신성딜(마공×0.7). 강력 → 10쿨·시작쿨5
    { name: '성역', tag: '버프', coef: '3턴 — 받는 피해 85%↓ + 턴당 상대 신성딜(마공×0.7) · 시작쿨5', buff: 3, cd: 10, ready: (s, f, ds, df) => s.cd[2] === 0 && s.sanctuary === 0, score: (s, f, ds, df, x) => x.foeTurn * 3 * (s.hp < ds.maxhp * 0.5 ? 1.5 : 0.7) + ((s.repentStack || 0) >= 4 ? s.repentStack * df.maxhp * 0.007 * 3 * 0.5 : 0), exec: (s, f, ds, df) => { s.sanctuary = 3; s.cd[2] = 10; s.note = '성역 · 받는피해 85%↓+신성딜(3턴)' } },
    // 가호: 3턴 물리·마법 방어력 2배(refreshDerived)
    { name: '가호', tag: '버프', coef: '3턴 — 물리·마법 방어력 2배', buff: 3, cd: 10, ready: (s, f, ds, df) => s.cd[3] === 0 && s.aegisTurns === 0, score: (s, f, ds, df, x) => x.foeTurn * 2 * (s.hp < ds.maxhp * 0.6 ? 1.2 : 0.6) - repentResetCost(s, ds, df), exec: (s, f, ds, df) => { s.aegisTurns = 3; s.aegisMul = 2; refreshDerived(s, ds); s.cd[3] = 10; s.note = '가호 · 물/마 방어 2배(3턴)' } }
  ],
  세이지: [
    mkSkill(0, { name: '오토스펠', tag: '버프', buff: 5, cd: 6, selfBuff: { autoSpell: 5 }, note: '주문각인', ready: (s) => s.cd[0] === 0 && s.autoSpell <= 1, score: (s, f, ds, df, x) => buffVal(x.est * 1.6, s, ds) }), // 순수버프(공격 제거). 지속5=마법의완전이해(autoSpell>1) 낄 창 확보
    // 디스펠: 상대 패시브 N턴 봉인 + 현재 버프 즉시 전부 제거(딜 없음). 쿨=봉인+2. 안티버프/안티패시브 현자 도구
    { name: '디스펠', tag: '디버프', coef: '상대 패시브 3턴 봉인 + 버프 즉시 제거 (딜 없음)', cd: 5, ready: (s, f, ds, df) => s.cd[1] === 0, score: (s, f, ds, df, x) => { const RAMP = { repentStack: 5, frenzy: 4 }; const buffs = BUFF_FIELDS.filter(k => f[k] > 0 && (RAMP[k] ? f[k] >= RAMP[k] : true)).length; const bigPsv = f.passiveLock === 0 && (f.불굴 || f.완벽방어 || f.행운의여신); if (buffs === 0 && !bigPsv) return 0; return x.est * 0.4 + buffs * 45 + (bigPsv ? 30 : 0) }, exec: (s, f, ds, df) => { const L = 3; const cleared = clearBuffs(f, df); f.passiveLock = L; s.cd[1] = L + 2; s.note = '디스펠' + (cleared ? `(버프${cleared} 제거)` : '') } }, // 램프 스택(참회≥5·광란가속≥4)은 임계 이상일 때만 디스펠 발동 가치 인정(1스택 남발 방지). 제거 자체는 clearBuffs가 전부 수행
    // 마법의 완전이해: 2턴간 볼트·마법 편차 무시(상시 풀댐) — 세이지 볼트 딜 극대화 윈도우
    skFullUnderstanding(2)
  ],
  갬블러: [
    // 2D20: 주사위 2개(2~40)/10 + 솜씨×0.05 배율만큼 물공 도박딜. 행운 저점보장(낮은 굴림 리롤). 1쿨 주력
    { name: '2D20', tag: '공격', coef: '(2D20/10 + 솜씨×0.05) 배율 물공 도박딜 · 행운 저점보장', cd: 1, ready: (s, f, ds, df) => s.cd[0] === 0, score: (s, f, ds, df, x) => dmgVal(ds.물공 * 5.5 * (1 - df.물방), 1, 0, f.hp, x.foeTurn), exec: (s, f, ds, df) => { let roll = (1 + Math.floor(rand() * 20)) + (1 + Math.floor(rand() * 20)); roll = luckFloor(roll, 10, 11, 20, ds.base.행운); const mult = roll * 0.1 + ds.base.솜씨 * 0.05; let d = guts(ds.물공 * mult * (1 - df.물방), f, df) * parryMul(f, df); d = absorb(f, Math.max(Math.round(d), 1)); f.hp -= d; s.cd[0] = 1; s.note = `🎲2D20=${roll} ×${mult.toFixed(1)}` } },
    // 동전던지기: 앞면=상대 최대체력30% 충격 / 뒷면=자기 10% 자해(둘 다 충격 — 방어구·실드 무시)
    (() => { const spec = { name: '동전던지기', tag: '공격', coef: '동전 던지기 — 앞면: 상대에 큰 확정딜(방어·실드·회피 무시) / 뒷면: 체력 10%↓ (반반 도박)', cd: 2, finalDmg: (s, f, ds, df) => rand() < 0.5 ? { dmg: trueDmg(s, f, df, df.maxhp * 0.30), note: '앞면! 상대 최대체력30%' } : { dmg: 0, selfHp: -Math.round(ds.maxhp * 0.10), note: '뒷면… 자해10%' } }; return Object.assign({}, spec, { ready: (s, f, ds) => s.cd[1] === 0 && s.hp > ds.maxhp * 0.15, score: (s, f, ds, df, x) => dmgVal(df.maxhp * 0.15, 1, 0, f.hp, x.foeTurn), exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); s.note = r.note; s.cd[1] = 2 } }) })(), // 엔진 이관: finalDmg(반반 도박), coef 서술형(하드코딩 배율 없음)
    // 불행의룰렛: 상대 랜덤 디버프 + 5%(+행운) 확률 잭팟=모든 상태이상 한 번에
    { name: '불행의룰렛', tag: '디버프', coef: '상대 랜덤 디버프 · 5%(+행운) 잭팟=모든 상태이상', cd: 3, ready: (s, f, ds, df) => s.cd[2] === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.8, exec: (s, f, ds, df) => { if (rand() < 0.05 + ds.base.행운 / 100 * 0.05) { for (const db of DEBUFFS) db.apply(f); s.cd[2] = 3; s.note = '🎰잭팟! 모든 상태이상' } else { const db = DEBUFFS[Math.floor(rand() * DEBUFFS.length)]; db.apply(f); s.cd[2] = 3; s.note = '불행의룰렛: ' + db.name } } },
    // 운명의카드: 카드 1장(킹/퀸/하트/다이아/클로버/스페이드) 균등 뽑기, 5% 조커=전부 발동. 버프는 2턴
    { name: '운명의카드', tag: '버프', coef: '카드 1장 뽑기(킹딜/퀸양딜/하트힐/다이아방어/클로버행운/스페이드적힐) · 5% 조커=전부', buff: 2, cd: 5, ready: (s, f, ds, df) => s.cd[3] === 0, score: (s, f, ds, df, x) => dmgVal(df.maxhp * 0.06, 1, 0, f.hp, x.foeTurn) + x.foeTurn * 0.5, exec: (s, f, ds, df) => { const joker = rand() < 0.05; const cards = ['킹', '퀸', '하트', '다이아', '클로버', '스페이드']; const pick = joker ? cards : [cards[Math.floor(rand() * cards.length)]]; const labels = pick.map(c => drawCard(c, s, f, ds, df)); s.cd[3] = 5; s.note = joker ? '🃏조커! 전부 발동' : labels[0] } },
    // 올인!!: 현재체력 X% 걸고 (1D20·행운보정)×계수 확정딜. 계수는 열세일수록↑(동률이상 0.15 → 극열세 0.27) — 궁지에서 판을 키우는 역전 도박. 대성공(20)/대실패(1)는 체력반환. 시작쿨3
    (() => { const spec = { name: '올인!!', tag: '공격', coef: '현재 체력을 베팅해 딜에 올인 — 확정딜·방어무시, 지고 있을수록 역전 배율↑, 대성공·대실패 시 체력 반환 · 시작쿨3', cd: 3, choose: 'bet', finalDmg: (s, f, ds, df) => { const bet = (s.betChoice || 50) / 100; s.betChoice = null; const deficit = Math.min(Math.max(f.hp / df.maxhp - s.hp / ds.maxhp, 0), 1); const coef = 0.15 + deficit * 0.12; const staked = Math.round(s.hp * bet); let r = 1 + Math.floor(rand() * 20); r = luckFloor(r, 6, 7, 15, ds.base.행운); if (r === 1) return { dmg: 0, selfHp: 0, note: '💢올인 대실패! (체력반환)' }; const mult = r * coef; const dmg = trueDmg(s, f, df, staked * mult); return { dmg, selfHp: r >= 20 ? 0 : -staked, note: r >= 20 ? `🎰올인 대성공 ×${mult.toFixed(2)} (체력반환)` : `🎲올인 ×${mult.toFixed(2)}` } } }; return Object.assign({}, spec, { ready: (s, f, ds, df) => s.cd[4] === 0 && s.hp > ds.maxhp * 0.15, score: (s, f, ds, df, x) => s.hp > ds.maxhp * 0.5 ? dmgVal(s.hp * 0.5 * 1.4, 1, 0, f.hp, x.foeTurn) : 0, exec: (s, f, ds, df) => { const r = runDamage(spec, s, f, ds, df); s.note = r.note; s.cd[4] = 3 } }) })() // 엔진 이관: finalDmg(베팅·1D20·반환), coef 서술형(하드코딩 배율 없음)
  ],
  참회사제: [
    // 안식: 시전(스태프 castMod -2 → base4=실효2) 신성 마공×2.0 + 둔화2. 침묵 시 봉쇄(스브 카운터)
    (() => { const spec = { name: '안식', tag: '시전', type: '마법.신성', mult: 2.0, cast: 4, cc: { slow: 2 }, dmgType: '신성' }; return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && s.cd[0] === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + holyRamp(s, df, 1), exec: (s, f, ds, df) => { applyCC(f, 'slow', 2); f.slowSec = Math.max(f.slowSec, 1); s.cd[0] = 4; scheduleCast(s, f, ds, df, spec) } }) })(),
    // 힐(프리스트 공유): 즉발 회복(최대체력15%+지능). 참회 리셋 기회비용 반영. 침묵에도 사용 — 유리몸 생존줄
    mkSkill(1, { name: '힐', tag: '회복', heal: { pct: 0.15, stat: '지능' }, cd: 6, ready: (s, f, ds) => s.cd[1] === 0 && s.hp < ds.maxhp * 0.9 && s.healBlock === 0, score: (s, f, ds, df, x) => (ds.maxhp - s.hp) * 0.55 - repentResetCost(s, ds, df) }),
    // 성스러운 빛: 시전(base6=실효4) 신성 마공×1.35×3히트(총≈4.05) — 대누크, 참회 +3 가속
    (() => { const spec = { name: '성스러운빛', tag: '시전', type: '마법.신성', mult: 1.35, hits: 3, cast: 6, dmgType: '신성' }; return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && (s.instCast || x.safe), score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + holyRamp(s, df, 3), exec: (s, f, ds, df) => { scheduleCast(s, f, ds, df, spec) } }) })(),
    // 참회: 즉발 신성 마공×1.5 + 참회 스택 +2 + 회복감소3(빌더 · 침묵에도 사용)
    (() => { const spec = { name: '참회', tag: '공격', type: '마법.신성', mult: 1.5, dmgType: '신성', cd: 2 }; return Object.assign({}, spec, { ready: (s) => s.cd[3] === 0, score: (s, f, ds, df, x) => dmgVal(ds.마공 * 1.5 * (1 - df.마방) + holyRamp(s, df, 1), 1, 0, f.hp, x.foeTurn) + df.maxhp * 0.014 + (f.healCut === 0 ? df.maxhp * 0.03 * 3 : 0), exec: (s, f, ds, df) => { const prev = s.repentStack || 0; runDamage(spec, s, f, ds, df); s.repentStack = Math.min(prev + 2, 10); s.repentWin = 2; f.healCut = Math.max(f.healCut, 3); s.cd[3] = 2; s.note = '참회' } }) })(),
    // 단죄: 즉발 신성 마공×(3.0+참회스택×0.5) + 램프 → 사용 즉시 참회 전부 소모(폭발 피니셔)
    (() => { const spec = { name: '단죄', tag: '공격', type: '마법.신성', coefFn: (ds, df, s) => 3.0 + (s.repentStack || 0) * 0.5, coef: '신성 마공×(3.0+참회스택×0.5) — 사용 시 참회 초기화', dmgType: '신성', cd: 5 }; return Object.assign({}, spec, { ready: (s) => s.cd[4] === 0, score: (s, f, ds, df, x) => { const st = s.repentStack || 0; return dmgVal(ds.마공 * (3.0 + st * 0.5) * (1 - df.마방) + df.maxhp * 0.007 * st, 1, 0, f.hp, x.foeTurn) }, exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.repentStack = 0; s.repentWin = 0; s.cd[4] = 5; s.note = '단죄' } }) })()
  ],
  암흑기사: [
    // 암흑지대: 5턴 지대 — 매턴 상대에게 물공×1.0 암흑딜(마법.일반) + 자신도 물공×0.85 피해 + 자기 침식 +1/턴
    { name: '암흑지대', tag: '디버프', coef: `5턴 — 매턴 상대에게 물공×1.0 암흑딜 · 자신은 물공×${DARKZONE_SELF} 피해 + 침식+1/턴`, cd: 6, ready: (s, f, ds, df) => s.cd[0] === 0 && s.darkZone === 0, score: (s, f, ds, df, x) => dmgVal(ds.물공 * (ds.무기.물공배율 || 1) * (1 - df.마방) * 5, 5, 0, f.hp, x.foeTurn) + ds.물공 * (ds.무기.물공배율 || 1) * 1.2 * 5 * 0.4, exec: (s, f, ds, df) => { s.darkZone = 5; s.cd[0] = 6; s.note = '암흑지대' } },
    // 심연의 포옹: 침식 +3 + 2턴 받는 피해 30%↓ (빌드업 중 생존기)
    { name: '심연의포옹', tag: '버프', coef: `침식 +3 · 2턴 받는 피해 ${Math.round((1 - ABYSS_TAKEN) * 100)}%↓ (행동불능 중에도 사용)`, buff: 2, cd: 4, stunnable: true, ready: (s, f, ds, df) => s.cd[1] === 0 && s.darkWard === 0, score: (s, f, ds, df, x) => buffVal(x.foeTurn * 1.5 * (1 - ABYSS_TAKEN) / 0.5, s, ds) + ds.물공 * (ds.무기.물공배율 || 1) * 1.2 * 3 * 0.4, exec: (s, f, ds, df) => { addErosion(s, ds, 3); s.darkWard = 2; s.cd[1] = 4; s.note = '심연의 포옹' } },
    // 종말: 물공×(침식×1.2) 암흑딜(마법.일반) + 내 침식 전부 상대에게 전이 + 내 침식 정화. 0스택=0딜
    (() => { const spec = { name: '종말', tag: '공격', type: '마법.일반', baseFn: (s, f, ds, df) => ds.물공 * (ds.무기.물공배율 || 1) * jongMul(s.erosion || 0) * jongShield(f), coef: `침식 ${JONG_MIN}스택 이상 — 암흑딜 물공×(침식스택×${jongMul(1)}) + 침식 전이 + 내 침식 정화 · 마나실드 상대엔 ×${JONG_SHIELD}`, dmgType: '암흑', cd: 3 }; return Object.assign({}, spec, { ready: (s) => s.cd[2] === 0 && s.erosion >= JONG_MIN, score: (s, f, ds, df, x) => { const st = s.erosion || 0; const dmg = ds.물공 * (ds.무기.물공배율 || 1) * jongMul(st) * jongShield(f) * (f.shield > 0 ? 1 : 1 - df.마방); const transfer = df.maxhp * 0.05 * st * 0.5; return dmgVal(dmg, 1, transfer, f.hp, x.foeTurn) }, exec: (s, f, ds, df) => { const st = s.erosion || 0; runDamage(spec, s, f, ds, df); if (st > 0) addErosion(f, df, st); s.erosion = 0; s.cd[2] = 3; s.note = '종말' } }) })(),
    // 영혼포식: 물공×1.0 암흑딜 + 상대 침식 있으면 흡혈(상대 최대체력×1%×스택) + 회복 시 즉사 해제(살아있는시체 생존줄, 무적은 3턴 유지)
    (() => { const spec = { name: '영혼포식', tag: '공격', type: '마법.일반', baseFn: (s, f, ds, df) => ds.물공 * (ds.무기.물공배율 || 1) * SOUL_COEF, coef: `암흑딜 물공×${SOUL_COEF.toFixed(1)} + 상대 침식스택당 최대체력1% 흡혈(회복 시 즉사 해제)`, dmgType: '암흑', cd: 1 }; return Object.assign({}, spec, { ready: (s) => s.cd[3] === 0, score: (s, f, ds, df, x) => { const dmg = ds.물공 * (ds.무기.물공배율 || 1) * SOUL_COEF * (1 - df.마방); const heal = (f.erosion > 0) ? df.maxhp * 0.01 * f.erosion : 0; const survive = (s.deathDoom && f.erosion > 0) ? ds.maxhp * 2 : 0; return dmgVal(dmg, 1, 0, f.hp, x.foeTurn) + heal * 0.6 + survive }, exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); if (f.erosion > 0) { const heal = Math.round(df.maxhp * 0.01 * f.erosion); s.hp = Math.min(emaxHp(s, ds), s.hp + hcut(s, healVar(heal))); s.deathDoom = false } s.cd[3] = 1; s.note = '영혼포식' } }) })(),
    // 살아있는 시체: 현재HP 1%로 + 침식 8 + 내 3턴간 무적(체력 1 하한)·기절/마비 면역·회복 ×2 — 그 안에 회복(영혼포식) 못하면 3턴 종료 시 사망. 종말 준비 + 마무리각일 때만
    { name: '살아있는시체', tag: '버프', coef: `현재 체력 1%로 + 침식 ${UNDEAD_EROSION} + 내 ${UNDEAD_TURNS}턴간 무적(체력 1 미만으로 안 떨어짐)·기절 면역 · 회복량 ×${UNDEAD_HEAL} · 그 안에 회복 못하면 사망`, cd: 14, ready: (s, f, ds, df) => s.cd[4] === 0 && s.cd[2] === 0 && !s.undead && f.hp < df.maxhp * 0.6, score: (s, f, ds, df, x) => { const jong = ds.물공 * (ds.무기.물공배율 || 1) * jongMul(UNDEAD_EROSION) * jongShield(f) * (f.shield > 0 ? 1 : 1 - df.마방); return (s.cd[2] === 0 && f.hp + f.shield <= jong * 1.1) ? dmgVal(jong, 1, df.maxhp * 0.05 * UNDEAD_EROSION, f.hp, x.foeTurn) : 0 }, exec: (s, f, ds, df) => { s.erosion = UNDEAD_EROSION; s.hp = Math.max(1, Math.round(ds.maxhp * 0.01)); s.undead = true; s.deathMark = UNDEAD_TURNS; s.deathDoom = true; s.cd[4] = 14; s.note = '살아있는 시체!' } }
  ]
}
// 운명의카드 효과: 킹=상대 확정20% / 퀸=상대 확정10%+자해10% / 하트=자힐10% / 다이아=방어1.5배 2턴 / 클로버=행운폭주(크리·회피↑) 2턴 / 스페이드=상대 힐5%(꽝)
// ===== 드루이드: 형상변환 =====
// 인간형(재생 + 형상 4종)으로 시작. 형상을 고르면 스킬 5개가 통째로 바뀌고, 해제(다른 형상/인간) 전까지 유지. 변신 = 1턴 소모.
// 형상 능력치는 인간형 파생(druBase, 타이틀·무기 배율 포함) 위에 형상 배율을 곱함 → 해제 시 원래대로. 최대체력은 현재 체력 비율 유지.
// 물공 스탯: 인간·전투곰=힘 / 표범·치타=민첩. 마공(마나부엉이)=지능. 형상마다 쿨 배열이 따로 있고 비활성 형상 쿨도 흐른다.
const physOf = (v) => 10 + v + step(v, 3) + Math.floor(v / 20) * 8 // derive 물공식(스탯 하나로)
const DRUID_FORMS = {
  인간: { emoji: '🧝' },
  전투곰: { emoji: '🐻', phys: '힘', atk: 1.5, hp: 2, dodge: 1.5, def: 1.5, noWBlock: true, desc: '공격력×1.5 · 최대체력×2 · 회피×1.5 · 방어×1.5 · 무기막기 불가 · 분노(변신 시 25, 평타 적중 15/치명타 30, 턴당 -5)' },
  표범: { emoji: '🐆', phys: '민첩', atk: 1.5, dodge: 2.0, crit: 1.2, critMul: 1.5, turn: 0.8, desc: '공격력×1.5(민첩) · 회피×2 · 치명타 확률×1.2 · 치명타 배율×1.5 · 턴×0.8 · 기력' },
  치타: { emoji: '🐅', phys: '민첩', dodge: 2.5, hp: 0.8, desc: '회피×2.5 · 최대체력×0.8 · 물공=민첩 · 기력' },
  마나부엉이: { emoji: '🦉', hp: 0.6, shield: true, magicAuto: true, desc: '최대체력×0.6 · 마나실드 · 평타=마법(마공=지능)' }
}
const DRUID_ORDER = ['전투곰', '표범', '치타', '마나부엉이', '인간']
const RES_LABEL = { druRage: '분노', druEnergy: '기력' }
const RAGE_MAX = 100; const BEAR_RAGE_SHIFT = 25; const BEAR_RAGE_HIT = 15; const BEAR_RAGE_CRIT = 30; const RAGE_DECAY = 5 // 분노: 곰 상태에서 내 턴마다 5 자연감소
const ENERGY_MAX = 100; const ENERGY_REGEN = 20 // 기력: 표범·치타 공용 풀, 100으로 시작 · 내 턴마다 20 회복(형상 무관)
const DRU_REGEN = 0.03; const BEAR_REGEN = 0.07; const CAT_REGEN = 0.08 // 재생(인간·3턴, 형상 유지) / 광포한 재생력(곰·5턴) / 자연의 재생력(치타·5턴) — 턴당 현재 형상 최대체력 %
const CROUCH_DODGE = 1.2; const CROUCH_TAKEN = 0.8 // 웅크리기(치타): 회피×1.2 · 받는 피해×0.8
const STAR_DOT = 0.05; const METEOR_DOT = 0.07 // 별빛쇄도·별똥별: 턴당 상대 최대체력 %(마방 경감, 마나실드 흡수)
function initDruid (f, d) {
  f.form = '인간'
  f.druBase = { 물공: d.물공, 마공: d.마공, maxhp: d.maxhp, 물회: d.물회, 물방: d.물방, 마방: d.마방, 크리: d.크리, 무기막기: d.무기막기, 무기: d.무기, 턴: d.턴 }
  f.formCd = {}; f.formLock = {}
  for (const k of DRUID_ORDER) { f.formCd[k] = k === '인간' ? f.cd : DRUID_SKILLS[k].map(() => 0); f.formLock[k] = {} }
  f.ccLock = f.formLock.인간
  f.druRage = 0; f.druEnergy = ENERGY_MAX; f.owlCap = Math.round(d.base.지능 * 14 + d.base.체력 * 7); f.owlShield = f.owlCap // 마나부엉이 실드: 마법무기 공식(지능14+체력7). 해제 시 남은 실드 보관 → 재변신 시 복원(재충전 없음)
  f.druRegen = 0; f.bearRegen = 0; f.catRegen = 0; f.crouch = 0; f.stealth = 0; f.formChoice = null
  druidStats(f, d)
}
// 형상 능력치를 ds에 반영(체력 제외). form 지정 시 그 형상 기준(AI 추정용)
function druidStats (f, ds, form = f.form) {
  const B = f.druBase; const F = DRUID_FORMS[form]; const c = ds.base
  ds.물공 = Math.round(physOf(c[F.phys || '힘']) * (B.물공 / physOf(c.힘)) * (F.atk || 1)) // 형상별 물공 스탯 × 타이틀 배율 유지
  ds.마공 = Math.round(B.마공 * (F.matk || 1))
  ds.물회 = B.물회 * (F.dodge || 1) * (form === '치타' && f.crouch > 0 ? CROUCH_DODGE : 1)
  ds.물방 = Math.min(B.물방 * (F.def || 1), 0.80); ds.마방 = Math.min(B.마방 * (F.def || 1), 0.85)
  ds.크리 = Math.min(B.크리 * (F.crit || 1), 0.9)
  ds.무기 = F.critMul ? Object.assign({}, B.무기, { 크리배율: B.무기.크리배율 * F.critMul }) : B.무기
  ds.무기막기 = F.noWBlock ? 0 : B.무기막기
  ds.마나실드 = F.shield ? f.owlCap : 0
  ds.평타마법 = !!F.magicAuto
  ds.턴 = Math.max(B.턴 * (F.turn || 1), 2) // 턴배율: 무기 턴배율(장창 1.1) 위에 곱함
}
function druidShift (s, f, ds, df, to) {
  const from = s.form
  if (from === '전투곰') { s.bearRegen = 0; s.druRage = 0 } // 곰 해제: 광포한 재생력·분노 소멸
  if (from === '치타') { s.catRegen = 0; s.crouch = 0 } // 치타 해제: 자연의 재생력·웅크리기 소멸
  if (from === '표범') s.stealth = 0
  if (from === '마나부엉이') { s.owlShield = s.shield; s.shield = 0 }
  const ratio = Math.max(s.hp, 0) / ds.maxhp
  s.form = to; s.cd = s.formCd[to]; s.ccLock = s.formLock[to]
  druidStats(s, ds)
  ds.maxhp = Math.round(s.druBase.maxhp * (DRUID_FORMS[to].hp || 1)); s.maxhp = ds.maxhp
  s.hp = Math.max(1, Math.round(ds.maxhp * ratio))
  if (to === '전투곰') s.druRage = BEAR_RAGE_SHIFT
  if (to === '마나부엉이') s.shield = s.owlShield
  s.defCombo = 0; s.defendedLast = false
  return { type: 'shift', from, to, rage: to === '전투곰' ? s.druRage : 0 }
}
function druidUpkeep (self, foe, ds, df) {
  for (const k of DRUID_ORDER) { const cd = self.formCd[k]; if (cd === self.cd) continue; const lk = self.formLock[k]; for (let i = 0; i < cd.length; i++) { if (lk[i]) { if (lk[i].some(fl => (foe[fl] || 0) > 0)) continue; delete lk[i] } cd[i] = Math.max(0, cd[i] - 1) } } // 비활성 형상 쿨도 흐름(그 형상에서 건 CC가 남았으면 정지)
  self.druEnergy = Math.min(ENERGY_MAX, self.druEnergy + ENERGY_REGEN)
  if (self.form === '전투곰') self.druRage = Math.max(0, self.druRage - RAGE_DECAY)
  if (self.stealth > 0) self.stealth--
  if (self.crouch > 0) self.crouch--
  let heal = 0
  const tick = (k, pct) => { if (self[k] > 0) { self[k]--; if (self.healBlock === 0) heal += Math.round(ds.maxhp * pct) } }
  tick('druRegen', DRU_REGEN); tick('bearRegen', BEAR_REGEN); tick('catRegen', CAT_REGEN)
  if (heal > 0) { const b = self.hp; self.hp = Math.min(ds.maxhp, self.hp + hcut(self, heal)); self._tick.push({ type: 'druregen', heal: Math.round(self.hp - b) }) }
  druidStats(self, ds)
}
// 별빛쇄도·별똥별 틱: 피격자 upkeep에서 최대체력 % × (1−마방), 근성·받는뎀 감소 적용 후 마나실드 흡수. 지속 피해라 회피·막기·패링 없음
function starDotTick (self, ds) {
  let pct = 0
  if (self.starDot > 0) { self.starDot--; pct += STAR_DOT }
  if (self.meteorDot > 0) { self.meteorDot--; pct += METEOR_DOT }
  let d = ds.maxhp * pct * (1 - (self.shield > 0 ? 0 : crushArmor(self, ds.마방)))
  d = guts(d * wardMul(self), self, ds)
  const psh = self.shield; d = absorb(self, Math.max(Math.round(d), 1)); self.hp -= d
  self._tick.push({ type: 'stardot', dmg: d, absorbed: Math.max(psh - self.shield, 0), star: self.starDot, meteor: self.meteorDot })
}
const skillsOf = (f) => (f && f.form) ? DRUID_SKILLS[f.form] : (SKILLS[f.name] || [])
// 자원 소모 스킬 래퍼: ready에 자원 게이트, exec에서 차감. res='druRage'|'druEnergy'
function druCost (res, cost, sk) { return Object.assign({}, sk, { res, cost, ready: (s, f, ds, df, x) => s[res] >= cost && sk.ready(s, f, ds, df, x), exec: (s, f, ds, df) => { s[res] -= cost; sk.exec(s, f, ds, df) } }) }
// AI 자원 비축: 체력 50% 미만이고 재생기 쿨이 곧 돌아오면, 다른 스킬은 재생 비용을 남길 때만 사용(점수 0) — 플레이어 사용 가능 여부와는 무관
function druReserve (s, ds, res, cost, regenSlot, regenCost, regenKey) { return !(s.hp < ds.maxhp * 0.5 && !(s[regenKey] > 0) && s.cd[regenSlot] <= 1 && s[res] - cost < regenCost) }
const BEAR_RSV = (cost, sc) => (s, f, ds, df, x) => druReserve(s, ds, 'druRage', cost, 2, 40, 'bearRegen') ? sc(s, f, ds, df, x) : 0
const CAT_RSV = (cost, sc) => (s, f, ds, df, x) => druReserve(s, ds, 'druEnergy', cost, 1, 50, 'catRegen') ? sc(s, f, ds, df, x) : 0
const healScore = (s, ds, pct, turns) => Math.min(ds.maxhp - s.hp, ds.maxhp * pct * turns) * 0.55 // 회복기 점수(힐과 동일 계수): 잃은 체력 한도 내 총회복량
function shiftSkill (to) { return { name: `${to}형상`, tag: '버프', shift: to, coef: `${DRUID_FORMS[to].emoji} ${DRUID_FORMS[to].desc} (변신 1턴)`, ready: (s) => s.form !== to && s.cast === 0, score: () => 0, selfEvent: (s, f, ds, df) => druidShift(s, f, ds, df, to) } }
const FORM_SWAP = { name: '형상변환', tag: '버프', choose: 'form', coef: '전투곰·표범·치타·마나부엉이·인간 중 골라 변신 (변신 1턴)', ready: (s) => s.cast === 0, score: () => 0, selfEvent: (s, f, ds, df) => { let to = s.formChoice || druidPickForm(s, f, ds, df, true); s.formChoice = null; if (!DRUID_FORMS[to] || to === s.form) to = '인간'; return druidShift(s, f, ds, df, to) } }
function owlCast (ci, spec) { // 마나부엉이 시전 마법: 볼트식(최소 1시전), 착탄 시 runDamage(castSpec)
  return Object.assign({}, spec, { ready: (s, f, ds, df, x) => s.cast === 0 && (!x || x.safe), score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const cut = s.castCut > 0 ? 1 : 0; s.castCut = 0; s.cast = Math.max(1, spec.cast - cut); s.castUninterruptible = false; s.castSpec = spec; s.castTotal = s.cast; s.castName = spec.name; s.note = spec.name + ' 시전' } })
}
function owlDot (ci, name, key, pct, cd) { // 별빛쇄도·별똥별: 5턴 지속 피해 부여(재사용 시 지속 갱신). 군중제어처럼 상대에게서 효과가 끝나야 쿨이 돈다(ccLock). AI 점수=남은 지속 보충분의 기대 총딜
  const turns = 5
  return { name, tag: '디버프', cd, coef: `${turns}턴간 상대 턴마다 최대체력 ${Math.round(pct * 100)}% 피해(마방 경감·실드 흡수 · 효과가 끝나야 쿨 진행)`, ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => df.maxhp * pct * (turns - (f[key] || 0)) * (1 - (f.shield > 0 ? 0 : df.마방)), exec: (s, f, ds, df) => { f[key] = turns; s.cd[ci] = cd; s.ccLock = s.ccLock || {}; s.ccLock[ci] = [key]; s.note = name } }
}
const stunSc = (s, f, ds, df, x) => f.stun === 0 ? ctrlVal(x.foeTurn, 1, 'stun') * stunTiming(s, f) : 0
const DRUID_SKILLS = {
  인간: [
    shiftSkill('전투곰'), shiftSkill('표범'), shiftSkill('치타'), shiftSkill('마나부엉이'),
    // 재생: 3턴간 턴당 3% 회복 — 형상을 바꿔도 유지
    mkSkill(4, { name: '재생', tag: '회복', cd: 5, coef: `3턴간 턴당 체력 ${Math.round(DRU_REGEN * 100)}% 회복(총 ${Math.round(DRU_REGEN * 300)}% · 형상 변신 후에도 유지)`, selfBuff: { druRegen: 3 }, note: '재생', ready: (s, f, ds) => s.cd[4] === 0 && s.druRegen === 0 && s.hp < ds.maxhp, score: (s, f, ds) => healScore(s, ds, DRU_REGEN, 3) })
  ],
  전투곰: [
    druCost('druRage', 20, (() => { const spec = { name: '후려갈기기', tag: '공격', type: '물리.일반', mult: 1.5, cd: 1 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: BEAR_RSV(20, (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x)), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[0] = 1; s.note = '후려갈기기' } }) })()),
    // 포효: 상대 4턴 강제평타(자신 공격력 증가 없음 — 기사 도발과 별개)
    druCost('druRage', 10, mkSkill(1, { name: '포효', tag: '제어', cd: 4, debuff: { taunt: 4 }, note: '포효', ready: (s, f) => s.cd[1] === 0 && f.taunt === 0, score: BEAR_RSV(10, (s, f, ds, df, x) => ctrlVal(x.foeTurn, 2, 'stun')) })),
    druCost('druRage', 40, mkSkill(2, { name: '광포한 재생력', tag: '회복', cd: 3, coef: `5턴간 턴당 체력 ${Math.round(BEAR_REGEN * 100)}% 회복(총 ${Math.round(BEAR_REGEN * 500)}% · 곰 해제 시 소멸)`, selfBuff: { bearRegen: 5 }, note: '광포한 재생력', ready: (s, f, ds) => s.cd[2] === 0 && s.bearRegen === 0 && s.hp < ds.maxhp * 0.9, score: (s, f, ds) => healScore(s, ds, BEAR_REGEN, 5) })),
    druCost('druRage', 25, mkSkill(3, { name: '야생의돌진', tag: '제어', cc: { stun: 1 }, cd: 3, note: '기절', ready: (s, f) => s.cd[3] === 0 && f.stun === 0, score: BEAR_RSV(25, stunSc) })),
    FORM_SWAP
  ],
  표범: [
    druCost('druEnergy', 40, dmgSkill(0, { name: '찢어발기기', tag: '공격', type: '물리.일반', mult: 2.0, cd: 1 })),
    druCost('druEnergy', 40, dmgSkill(1, { name: '흉포한 이빨', tag: '공격', type: '물리.일반', mult: 1.5, bonus: { when: 'foeHp40', mult: 2.5 }, cd: 1 })),
    // 은신: 상대 1턴 기절 + 다음 턴 암습의 일격 강화(×3.0)
    druCost('druEnergy', 20, mkSkill(2, { name: '은신', tag: '제어', cc: { stun: 1 }, cd: 3, coef: '상대 1턴 기절 + 다음 턴 암습의 일격 물공×3.0', selfBuff: { stealth: 2 }, note: '은신 — 기절', ready: (s, f) => s.cd[2] === 0 && f.stun === 0, score: (s, f, ds, df, x) => stunSc(s, f, ds, df, x) + x.est * 1.0 })), // 점수: 기절 + 강화 일격(3.0)이 찢어발기기(2.0)보다 나은 몫(평타 1회분)
    druCost('druEnergy', 20, (() => { const spec = { name: '암습의 일격', tag: '공격', type: '물리.일반', mult: 0.5, bonus: { when: 'selfStealth', mult: 3.0 }, cd: 1 }; return Object.assign({}, spec, { ready: (s) => s.cd[3] === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { const st = s.stealth > 0; runDamage(spec, s, f, ds, df); s.stealth = 0; s.cd[3] = 1; s.note = st ? '암습의 일격·은신 연계' : '암습의 일격' } }) })()),
    FORM_SWAP
  ],
  치타: [
    druCost('druEnergy', 20, (() => { const spec = { name: '물기', tag: '공격', type: '물리.일반', mult: 1.0, cd: 1 }; return Object.assign({}, spec, { ready: (s) => s.cd[0] === 0, score: CAT_RSV(20, (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x)), exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[0] = 1; s.note = '물기' } }) })()),
    druCost('druEnergy', 50, mkSkill(1, { name: '자연의 재생력', tag: '회복', cd: 3, coef: `5턴간 턴당 체력 ${Math.round(CAT_REGEN * 100)}% 회복(총 ${Math.round(CAT_REGEN * 500)}% · 치타 해제 시 소멸)`, selfBuff: { catRegen: 5 }, note: '자연의 재생력', ready: (s, f, ds) => s.cd[1] === 0 && s.catRegen === 0 && s.hp < ds.maxhp * 0.9, score: (s, f, ds) => healScore(s, ds, CAT_REGEN, 5) })),
    druCost('druEnergy', 40, mkSkill(2, { name: '야생의돌진', tag: '제어', cc: { stun: 1 }, cd: 3, note: '기절', ready: (s, f) => s.cd[2] === 0 && f.stun === 0, score: CAT_RSV(40, stunSc) })),
    // 웅크리기: 2턴 회피×1.2 · 받는 피해×0.8. 점수=2턴간 줄어드는 기대 피격량
    druCost('druEnergy', 60, mkSkill(3, { name: '웅크리기', tag: '버프', cd: 3, coef: `2턴간 회피×${CROUCH_DODGE} · 받는 피해×${CROUCH_TAKEN}`, selfBuff: { crouch: 2 }, note: '웅크리기', ready: (s) => s.cd[3] === 0 && s.crouch === 0, score: CAT_RSV(60, (s, f, ds, df, x) => { const d = Math.min(ds.물회, 0.8); return buffVal(x.foeTurn * 2 * (1 - (1 - Math.min(d * CROUCH_DODGE, 0.95)) * CROUCH_TAKEN / (1 - d)), s, ds) }) })),
    FORM_SWAP
  ],
  마나부엉이: [
    owlCast(0, { name: '달빛섬광', tag: '시전', type: '마법.일반', mult: 1.7, cast: 1 }),
    owlCast(1, { name: '별빛섬광', tag: '시전', type: '마법.일반', mult: 1.5, hits: 2, cast: 2 }),
    owlDot(2, '별빛쇄도', 'starDot', STAR_DOT, 5),
    owlDot(3, '별똥별', 'meteorDot', METEOR_DOT, 7),
    FORM_SWAP
  ]
}
SKILLS.드루이드 = DRUID_SKILLS.인간
// ── 드루이드 AI: 형상 선택 ──
// 형상별 추정: 버팀 턴(현재 체력비율×형상 최대체력(+실드) ÷ 받을 턴당 피해) / 처치 턴(상대 체력 ÷ 내 턴당 딜)
// ratio = 버팀÷처치(>1이면 레이스 승). 이기는 형상(ratio≥1.2) 중 가장 빨리 잡는 형상, 없으면 ratio 최대(시간제한 무승부 방지: 안 죽기만 하는 형상 회피)
// 회피는 상대가 물리 평타일 때만, 재생기는 턴당 회복만큼 받는 피해에서 차감.
const FORM_SKILL_X = { 인간: 1, 전투곰: 1.25, 표범: 1.5, 치타: 1, 마나부엉이: 1 } // 스킬 평균 배율 근사(곰: 후려갈기기 1.5 격턴 / 표범: 찢어발기기 2.0 격턴 / 치타·부엉이: 평타급)
const FORM_HEAL = { 전투곰: BEAR_REGEN, 치타: CAT_REGEN }
function druidFormEst (s, f, ds, df, form) {
  const o = Object.assign({}, ds); druidStats(s, o, form); o.maxhp = Math.round(s.druBase.maxhp * (DRUID_FORMS[form].hp || 1))
  const critX = (a) => (a.평타마법 || (a.평타마법 == null && a.무기.평타 === '마법')) ? 1 : 1 + a.크리 * ((a.무기.크리배율 || 1.5) - 1) // 물리 기대 치명타 배율(estAtk엔 치명타 없음)
  let my = estAtk(o, df) * critX(o) * FORM_SKILL_X[form]
  if (form === '마나부엉이') my += df.maxhp * (STAR_DOT * 5 / 10 + METEOR_DOT * 5 / 12) * (1 - df.마방) // 별빛쇄도(5%×5턴, 끝난 뒤 쿨5)+별똥별(7%×5턴, 끝난 뒤 쿨7) 턴당 근사
  const osh = form === '마나부엉이' ? (s.form === form ? s.shield : s.owlShield) : 0; if (osh > 0) o.물방 = 0 // 실드가 있으면 물리 피격은 물방 무시(엔진 규칙)
  const foePhys = !(df.평타마법 || (df.평타마법 == null && df.무기.평타 === '마법'))
  const raw = estAtk(df, o) * critX(df) * (foePhys ? 1 - Math.min(o.물회, 0.9) : 1)
  const inc = Math.max(raw - o.maxhp * (FORM_HEAL[form] || 0), raw * 0.1, 1)
  const hp = Math.max(s.hp, 0) / ds.maxhp * o.maxhp + (form === '마나부엉이' ? (s.form === form ? s.shield : s.owlShield) : 0)
  const kill = Math.max(my, 1) / Math.max(f.hp + f.shield, 1)
  return { k: form, ratio: (hp / inc) * kill, kill }
}
// 형상 중엔 더 나은 형상이 30% 이상 앞설 때만 변경(잦은 변신 방지), 자기 재생기 지속 중엔 유지. forced=형상변환 메뉴(현재 형상 제외)
function druidPickForm (s, f, ds, df, forced) {
  const ev = DRUID_ORDER.filter(k => k !== '인간').map(k => druidFormEst(s, f, ds, df, k))
  const pool = forced ? ev.filter(e => e.k !== s.form) : ev
  const win = pool.filter(e => e.ratio >= 1.2)
  const best = win.length ? win.reduce((a, b) => b.kill > a.kill ? b : a) : pool.reduce((a, b) => b.ratio > a.ratio ? b : a)
  if (forced || s.form === '인간') return best.k
  if (s.bearRegen > 0 || s.catRegen > 0) return s.form
  const cur = ev.find(e => e.k === s.form)
  const better = win.length ? (cur.ratio < 1.2 || best.kill > cur.kill * 1.3) : best.ratio > cur.ratio * 1.3
  return better ? best.k : s.form
}
function drawCard (c, s, f, ds, df) {
  if (c === '킹') { const d = trueDmg(s, f, df, df.maxhp * 0.20); f.hp -= d; return '👑킹·상대 체력20% 확정딜' }
  if (c === '퀸') { const d = trueDmg(s, f, df, df.maxhp * 0.10); f.hp -= d; s.hp -= Math.round(ds.maxhp * 0.10); return '👸퀸·상대 체력10%+자해10%' }
  if (c === '하트') { s.hp = Math.min(ds.maxhp, s.hp + hcut(s, healVar(ds.maxhp * 0.10))); return '❤️하트·체력10% 회복' }
  if (c === '다이아') { s.aegisTurns = 2; s.aegisMul = 1.5; refreshDerived(s, ds); return '♦️다이아·방어 1.5배(2턴)' }
  if (c === '클로버') { s.luckBuff = 2; return '♣️클로버·행운폭주 크리·회피↑(2턴)' }
  if (c === '스페이드') { f.hp = Math.min(df.maxhp, f.hp + Math.round(df.maxhp * 0.05)); return '♠️스페이드·상대 체력5% 회복(꽝)' }
  return c
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
  재정비: (ci) => ({ name: '재정비', ready: (s, f, ds) => s.cd[ci] === 0 && s.hp < ds.maxhp * 0.7, score: (s, f, ds, df, x) => (ds.maxhp - s.hp) * 0.5, exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + hcut(s, Math.round(ds.maxhp * 0.18))); s.cd[ci] = 4; s.note = '회복' } }),
  반격태세: (ci) => ({ name: '반격태세', ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => df.물공 * 0.4, exec: (s, f, ds, df) => { s.defending = true; s.shield = Math.max(s.shield, Math.round(ds.maxhp * 0.12)); s.cd[ci] = 3; s.note = '반격' } })
}
// ===== 선언형 딜 스키마 =====
// 실제 딜은 runDamage(통합 엔진). estDamage=AI score용 추정(비파괴, attack 미호출).
const TAG_EMO = { 공격: '⚔️', 시전: '🔮', 버프: '🔺', 디버프: '🔻', 제어: '🌀', 회복: '💚', 관통: '⚡' }
// 타입별 기대딜(스펙 선언에서 파생): mult/bonus/coefFn·hits·라이더를 읽어 "상대에게 들어가는 기대 최종딜" 추정.
// 타입에 맞는 스탯(물공/마공)과 주 방어(물방/마방, 역장·충격·확정은 무시)를 반영 → autoScore의 딜 성분.
function estDamage (spec, ds, df, x, s, f) {
  const t = spec.type || '물리.일반'
  let M = spec.mult != null ? spec.mult : (t === '물리.일반' ? 1 : 0)
  if (spec.coefFn) M = spec.coefFn(ds, df, s, f) // 식-계수(발경 등)
  else if (spec.bonus && s && f && bonusCond(spec.bonus.when, s, f, ds, df)) M = spec.bonus.mult // 조건부(실드/무기파괴/스턴 시)
  const D = spec.dmg || {}; let e = 0
  let hits = spec.hits ? (Array.isArray(spec.hits) ? (spec.hits[0] + spec.hits[1]) / 2 : spec.hits) : 1
  let elemX = 1 // 볼트: 원소마스터 배율 × 조합(짝 볼트 ×2)
  if (t.startsWith('마법.원소')) { // 볼트 발수: boltMaster면 최대치 고정, 조합(chainBolt)이면 짝 볼트까지 ×2
    if (s && psv(s, 'boltMaster') && Array.isArray(spec.hits)) hits = spec.hits[1]
    elemX = (s && psv(s, '원소마스터') ? ELEM_MASTER : 1) * ((s && s.chainBolt > 0) ? 2 * CHAIN_MULT : 1)
  }
  if (M) {
    const base = t.startsWith('물리') ? ds.물공 * (ds.무기.물공배율 || 1) * M : ds.마공 * M
    let def = 1 // 역장(마방무시)·충격(방어무시)·확정(전부무시) → 1
    if (t === '물리.일반') def = (1 - df.물방) * (spec.guaranteed ? 1 : Math.max(ds.명중, 0.3)) // guaranteed=명중판정 생략
    else if (t === '마법.일반' || t === '마법.신성' || t.startsWith('마법.원소')) def = (1 - df.마방)
    let swing = base * def * hits * elemX
    if (spec.forceCrit) swing *= (ds.무기.크리배율 || ds.물크기본 || 1.5) // 확정크리: 무기 크리배율 반영
    e += swing
  }
  if (D.selfHp) e += ds.maxhp * D.selfHp
  if (D.foeHp) e += df.maxhp * D.foeHp
  if (D.force) e += ds.마공 * D.force
  if (D.selfStr) e += ds.base.힘 * D.selfStr
  return e
}
// 딜 타입별 신뢰도 가중(가산점): 방어 우회·저변동일수록↑. 1.0=중립(파일럿 시작값, 이후 튜닝).
const TYPE_W = { '물리.일반': 1.0, '마법.일반': 1.0, '마법.신성': 1.0, '마법.원소.화염': 1.0, '마법.원소.전격': 1.0, '마법.원소.얼음': 1.0, '마법.역장': 1.0, '물리.충격': 1.0, 확정: 1.0 }
// 통합 AI 스코어(선언 필드 파생): 딜(타입가중)/캐스트 + 봉쇄CC + 약화디버프 + 인터럽트 − 자해. 버프/힐/RNG은 제외(커스텀).
function autoScore (spec, s, f, ds, df, x) {
  const dmg = hasDamage(spec) ? estDamage(spec, ds, df, x, s, f) : 0 // 딜 없는 순수CC/디버프는 팬텀딜 방지
  // 시전턴(커밋 리스크 분모): 볼트=시전+조합(+1) / 인캐 시 1(메테오 등 uninterruptible 제외) / 아니면 시전+castMod
  let cast
  if (spec.type && spec.type.startsWith('마법.원소')) cast = Math.max(1, (spec.cast || 0) + (s.chainBolt > 0 ? 1 : 0) + (ds.무기.castMod || 0))
  else cast = spec.cast ? ((s.instCast > 0 && !spec.uninterruptible) ? 1 : Math.max(1, spec.cast + (ds.무기.castMod || 0))) : 1
  const tw = TYPE_W[spec.type] || 1
  let cc = 0 // 봉쇄형 CC(상대 행동 차단): CC_K 등록 종류만, 이미 걸린 상태면 0
  const addCC = (obj) => { for (const k in obj || {}) if (CC_K[k] != null && !(f[k] > 0)) cc += ctrlVal(x.foeTurn, obj[k], k) }
  addCC(spec.cc); addCC(spec.debuff)
  if (spec.ccFn) addCC(spec.ccFn(s, f, ds, df)) // 조건부 CC(인챈트·실드 등 상태 의존): 동적 cc 객체 반환
  let weaken = 0 // 약화형 디버프: 상대 산출 감소분(무기파괴=상대딜 2/3, 회복차단 근사)
  if (spec.debuff) {
    const foeEst = estAtk(df, ds)
    if (spec.debuff.weaponBroken && !(f.weaponBroken > 0)) weaken += foeEst * (2 / 3) * Math.min(spec.debuff.weaponBroken, df.턴 ? 4 : 4)
    if (spec.debuff.healCut && !(f.healCut > 0)) weaken += df.maxhp * 0.03 * spec.debuff.healCut
  }
  const intr = (spec.interrupt && f.cast > 0) ? x.foeTurn * 3 : 0 // 인터럽트: 상대 시전 중이면 큰 가치
  const selfHarm = (spec.recoil || 0) * ds.maxhp + (spec.recoilCur || 0) * s.hp + (spec.selfCost || 0) * ds.maxhp
  const base = (psv(s, '격노') || psv(s, '광란')) ? 0.15 : 0.5 // 자해 빌드(격노/광란)면 비용 할인 — HP를 파워로 환전
  const hpAfter = (s.hp - selfHarm) / ds.maxhp
  const deathRisk = (selfHarm > 0 && hpAfter < 0.25) ? (0.25 - Math.max(hpAfter, 0)) * 4 * ds.maxhp : 0 // 자해 스킬이 빈사로 몰 때만 급증(자살 방지)
  const cost = selfHarm * base + deathRisk
  return dmgVal(dmg * tw, cast, cc + weaken, f.hp, x.foeTurn) + intr - cost
}
// ===== 통합 딜 실행 엔진 =====
// spec.type(딜 전달)·mult·hits·dmg{}(라이더)·guaranteed·forceCrit 을 해석해 실제 딜 실행.
// 반환 { hits:[{raw,type,dealt}], total, landed }. 히트별 내역은 나레이션 공통화(Phase2)에서 소비.
// 라이더(foeHp/selfHp/selfStr/force)는 "명중 시만" 가산(빗나가면 딜 0) — 분쇄식 배율증가 규칙.
// 형-base 타입(충격/역장/확정)은 물공/마공×mult + 라이더를 base로 만들어 판정 파이프라인에 태움.
function deliverFormula (type, base, s, f, ds, df) {
  base = Math.max(Math.round(base), 1)
  if (type === '물리.충격') { const d = impactDmg(s, f, ds, df, base); f.hp -= d; return d } // 방어구·실드 무시
  if (type === '마법.일반' || type.startsWith('마법.원소')) { const d = absorb(f, spellDmg(base, f, df, s)); f.hp -= d; return d } // 천운·마방·마관통 + 마나실드 흡수(원소=볼트, 마커만 다름)
  if (type === '마법.신성') return holyDmg(s, f, ds, df, base) // 신성: 마방 적용 + 참회 스택/램프(holyDmg가 f.hp에 직접 적용)
  if (type === '확정') { const d = trueDmg(s, f, df, base); f.hp -= d; return d } // 전부 무시(실드 흡수만)
  const d = absorb(f, Math.max(Math.round(base * parryMul(f, df)), 1)); f.hp -= d; return d // 마법.역장: 마방 무시, 실드 흡수(패링은 흘림)
}
// 발수: 숫자면 고정, [min,max]면 랜덤 롤(볼트 1~5). 물리·마법 공통.
function rollHits (spec) { const h = spec.hits; if (Array.isArray(h)) return h[0] + Math.floor(rand() * (h[1] - h[0] + 1)); return h || 1 }
// 조건부 배율(bonus.when): 조건 충족 시 spec.bonus.mult로 배율 교체. 어휘 고정.
function bonusCond (when, s, f, ds, df) {
  if (when === 'foeStun') return f.stun > 0
  if (when === 'foeWeaponBroken') return f.weaponBroken > 0
  if (when === 'foeShield') return f.shield > 0
  if (when === 'foeInstVuln') return f.instVuln > 0
  if (when === 'foeHp40') return f.hp <= df.maxhp * 0.40
  if (when === 'selfStealth') return s.stealth > 0
  return false
}
function runDamage (spec, s, f, ds, df) {
  const type = spec.type || '물리.일반'
  if (spec.finalDmg) { const r = spec.finalDmg(s, f, ds, df); if (r.dmg) f.hp -= r.dmg; if (r.selfHp) s.hp += r.selfHp; return { hits: [{ raw: r.dmg, type, dealt: r.dmg }], total: r.dmg, landed: r.dmg > 0, note: r.note } } // 완전 커스텀(주사위·베팅): finalDmg가 딜 계산({dmg,selfHp?,note?}) 반환 → 엔진이 foe·self에 적용
  const D = spec.dmg || {}
  const M = spec.coefFn ? spec.coefFn(ds, df, s, f) : ((spec.bonus && bonusCond(spec.bonus.when, s, f, ds, df)) ? spec.bonus.mult : (spec.mult != null ? spec.mult : (type === '물리.일반' ? 1 : 0))) // coefFn=식-계수(발경 등), bonus=조건부, 아니면 상수
  const rider = () => df.maxhp * (D.foeHp || 0) + ds.maxhp * (D.selfHp || 0) + Math.round(ds.base.힘) * (D.selfStr || 0) + ds.마공 * (D.force || 0)
  const hits = []; let landed = false
  if (type === '물리.일반') {
    const n = spec.hits || 1
    for (let i = 0; i < n; i++) { // 히트별 즉시 처리(attack→absorb→차감): 실드 상대에게 히트마다 실드 상태 갱신 반영
      const swing = attack(s, f, ds, df, f.defending, spec.guaranteed, spec.forceCrit, spec.hits ? 1 : undefined) // hits 지정 시 무기 다단 무시(연타 자체 정의)
      if (swing > 0) landed = true
      let raw = swing * M
      if (i === 0 && swing > 0) raw += rider() // 라이더(상대HP%·힘 등) 명중 게이팅: 첫 히트 적중 시 합산
      const dealt = fistAbsorb(s, f, Math.round(raw), ds.무기.실드효율); f.hp -= dealt
      hits.push({ raw, type, dealt })
    }
  } else if (type.startsWith('마법.원소')) { // 볼트: 발당 마공×M을 랜덤 발수(1~5)만큼 spellDmg. 물리 연타와 동일 구조, 딜리버리만 마법
    const n = (psv(s, 'boltMaster') && Array.isArray(spec.hits)) ? spec.hits[1] : rollHits(spec) // boltMaster=최대 발수 고정
    const em = psv(s, '원소마스터') ? ELEM_MASTER : 1 // 원소의 이해: 마법.원소 딜 배율
    for (let i = 0; i < n; i++) { const base = ds.마공 * M * em; const dealt = deliverFormula(type, base, s, f, ds, df); if (dealt > 0) landed = true; hits.push({ raw: base, type, dealt }) }
  } else if (type === '마법.신성') { // 신성: 히트마다 holyDmg(참회 스택 +1·램프 보너스). 다단이면 히트수만큼 스택 가속 + 각 히트 램프 적용
    const n = spec.hits || 1
    for (let i = 0; i < n; i++) { if (f.hp <= 0) break; const base = Math.max(ds.마공 * M + (i === 0 ? rider() : 0), 1); const dealt = deliverFormula(type, base, s, f, ds, df); if (dealt > 0) landed = true; hits.push({ raw: base, type, dealt }) }
  } else if (type === '마법.일반' && spec.hits > 1) { // 마법 다단(별빛섬광 등): 히트마다 spellDmg·실드 흡수
    for (let i = 0; i < spec.hits; i++) { if (f.hp <= 0) break; const base = ds.마공 * M + (i === 0 ? rider() : 0); const dealt = deliverFormula(type, base, s, f, ds, df); if (dealt > 0) landed = true; hits.push({ raw: base, type, dealt }) }
  } else {
    const base = spec.baseFn ? spec.baseFn(s, f, ds, df) : ((type.startsWith('마법') ? ds.마공 : ds.물공) * M + rider()) // baseFn=식-base(파열 등 스택 소모)
    const dealt = deliverFormula(type, base, s, f, ds, df)
    hits.push({ raw: base, type, dealt }); landed = dealt > 0
  }
  if (spec.recoil) s.hp -= Math.round(ds.maxhp * spec.recoil) // 반동(최대체력 비율): 돌진 등
  if (spec.recoilCur) s.hp -= Math.round(s.hp * spec.recoilCur) // 반동(현재체력 비율): 아수라(올인 피니셔)
  return { hits, total: hits.reduce((a, h) => a + (h.dealt || 0), 0), landed }
}
// ── AI 스코어러(전부 "이번 턴 HP 가치"로 반환 → bestScore=ctx.est(평타 HP가치)와 직접 비교) ──
// 3분할: 딜점수(공격/관통/시전) · 제어점수(제어/디버프) · 방어점수(버프/회복). tag로 분류.
const CC_K = { stun: 0.9, silence: 0.6, slow: 0.4, sunder: 0.35, missDown: 0.25, luckLock: 0.3, blind: 0.3, paralyze: 0.27 } // 제어 종류별 봉쇄 효율. 마비=매턴 30% 턴상실(스턴×0.3≈0.27)
// 단발 기절 타이밍(검투사 방해·발차기 AI): 상대가 내 다음 턴보다 먼저 움직일 때 끊으면 그 공격을 막으니 가치 ×2, 아니면 ×0.5
// — 쿨1 분쇄 연타에 밀려 단발 CC를 전혀 안 쓰던 문제(발차기 판당 0회)
function stunTiming (s, f) { return f.gauge < s.gauge ? 2.0 : 0.5 }
function ctrlVal (foeTurn, turns, kind) { return foeTurn * (turns || 1) * (CC_K[kind] || 0.3) } // 제어점수: 상대 foeTurn×봉쇄턴×효율 = 막는 HP
function dmgVal (dmg, castTurns, ccVal, foeHp, foeTurn) { const ct = Math.max(1, castTurns || 1); const risk = foeTurn ? foeTurn * (ct - 1) * 0.2 : 0; const base = dmg / ct + (ccVal || 0) - risk; return (foeHp != null && dmg >= foeHp) ? Math.max(base, dmg + (ccVal || 0) - risk) : base } // 딜점수: 기대딜/커밋턴 + CC − 시전리스크(무방비 턴×foeTurn). 처치 가능하면 총딜 승격(파이어 버스트)
// 방어점수(버프): 총 이득 × 생존여유(저HP면 버프 대신 생존이 우선 → 감소). 미보유 시만 호출(ready 게이트)
function buffVal (benefit, s, ds) { const hp = (s && ds && ds.maxhp) ? Math.min(1, (Math.max(s.hp, 0) / ds.maxhp) / 0.5) : 1; return benefit * Math.max(0.2, hp) }
// 참회 리셋 기회비용(프리스트): 성역 없이 비신성 버프를 쓰면 쌓은 참회가 리셋됨. 성역 활성 중엔 매턴 holy로 유지되니 비용 0, 성역 임박이면 곧 급속 재적재라 비용↓, 성역이 먼 쿨이면 평타로만 느리게 복구라 비용↑. → 축복·가호·힐 스코어에서 차감해 AI가 "성역 없이 고참회 붕괴"를 피하게.
function repentResetCost (s, ds, df) { if (!df || s.sanctuary > 0 || (s.repentStack || 0) < 4) return 0; const lostPerTurn = df.maxhp * 0.007 * s.repentStack; const rebuildTurns = s.cd[2] <= 2 ? 2 : 5; return lostPerTurn * rebuildTurns * 0.5 } // W=0.5 가중치. cd[2]=성역슬롯
// 자동 설명: 선언 필드에서 딜 성분 문자열 생성(수동 문자열 없음)
const TYPE_TAG = { '물리.충격': '💥충격 ', '마법.역장': '🟣역장 ', 확정: '🎯확정 ' } // 딜 전달 타입 마커
const WHEN_LABEL = { foeStun: '스턴 중', foeWeaponBroken: '무기파괴 시', foeShield: '실드 시', foeInstVuln: '약점노출 시', foeHp40: '상대 체력 40%↓', selfStealth: '은신 직후' } // bonus.when 조건 라벨
function dmgDesc (spec) {
  const D = spec.dmg || {}; const p = []; const tag = TYPE_TAG[spec.type] || ''
  const mLbl = (spec.type && spec.type.startsWith('마법')) ? '마공' : '타격'
  if (spec.coefLabel) { // 식-계수(발경 등): 라벨 텍스트
    p.push(tag + spec.coefLabel)
  } else if (spec.type && spec.type.startsWith('마법.원소')) { // 볼트: 발당 + 랜덤발수 + 시전
    const h = spec.hits
    p.push(`발당 마공×${spec.mult} · ${Array.isArray(h) ? h[0] + '~' + h[1] + '발' : (h || 1) + '발'} · ${spec.cast > 0 ? '시전' + spec.cast : '즉발'}`)
  } else if (spec.mult > 0) { // 기본배율 + 조건부(bonus.when)
    let m = `${tag}${mLbl}×${spec.mult}${spec.hits ? `×${spec.hits}타` : ''}`
    if (spec.bonus) m += ` (${WHEN_LABEL[spec.bonus.when] || spec.bonus.when} ×${spec.bonus.mult})`
    p.push(m)
  }
  if (D.foeHp) p.push(`${p.length ? '' : tag}상대 최대체력 ${Math.round(D.foeHp * 100)}%`)
  if (D.selfHp) p.push(`자기 최대체력 ${Math.round(D.selfHp * 100)}%`)
  if (D.force) p.push(`역장 마공×${D.force}`)
  if (D.selfStr) p.push(`힘×${D.selfStr}`)
  if (spec.recoil) p.push(`자기체력 ${Math.round(spec.recoil * 100)}%↓`)
  if (spec.recoilCur) p.push(`자기체력 ${Math.round(spec.recoilCur * 100)}%↓`)
  if (typeof spec.cast === 'number' && !(spec.type && spec.type.startsWith('마법.원소'))) p.push(`시전${spec.cast}턴${spec.uninterruptible ? '(끊기불가)' : ''}`) // 화염구 등 시전 마법
  return p.join(' + ')
}
// 스킬 한 줄 자동설명: coef(수동 예외) 우선, 없으면 dmgDesc(딜)+effDesc(효과) 자동. cd/buff 자동.
function skillLine (spec) {
  const auto = [dmgDesc(spec), effDesc(spec)].filter(Boolean).join(' + ')
  const body = spec.coef || auto
  const cost = spec.cost ? ` · ${RES_LABEL[spec.res]} ${spec.cost}` : '' // 드루이드 자원(분노·기력) 소모량
  const cd = (spec.cast ? '' : (spec.cd != null ? ` (쿨${spec.cd}${cost})` : (spec.buff ? ` (${spec.buff}턴${cost})` : (cost ? ` (${cost.slice(3)})` : '')))) // 시전 스킬은 tag/coef가 '시전'을 이미 표기 → 접미사 생략
  return `${TAG_EMO[spec.tag] || ''} **${spec.name}** — ${spec.tag}${body ? ' ' + body : ''}${cd}`
}
// 스킬 버튼/표시용 쿨 라벨(필드 기반, SKILL_CD 테이블 대체): 시전=시전 / 버프=버프 / 그외=쿨숫자
function skillCd (sk) { return sk.cast ? '시전' : (sk.buff && sk.cd == null ? '버프' : (sk.cd != null ? sk.cd : '')) }
// ── 효과 어휘(vocab): heal/cc/selfBuff — 필드로 선언하면 적용+coef 자동 ──
const CC_LABEL = { stun: '스턴', slow: '둔화', silence: '침묵', vuln: '취약', sunder: '방어약화', missDown: '명중저하', blind: '실명', luckLock: '행운봉인', healBlock: '회복불가', paralyze: '마비', taunt: '강제평타', weaponBroken: '딜 1/3(무기막기 불가)', healCut: '회복↓' }
// 버프 필드 → 효과 라벨(selfBuff 자동설명). 동반 필드(powMul·aegisMul·slowSec)는 라벨 없어 자동 생략
const BUFF_LABEL = { blockUp: '방패막기 경감↑', instCast: '다음 시전 즉발(메테오 제외)', magReflect: '마법 1회 반사', autoSpell: '평타마다 볼트 발동+가속', chainBolt: `볼트 시전 시 짝 원소 자동 · 볼트 계수 ×${CHAIN_MULT}`, graze100: '마법 항상 최대치', haste: '턴 가속', powBuff: '공격력 강화', accBuff: '명중↑', blessTurns: '능력치↑', aegisTurns: '방어력↑', sanctuary: '무적' }
// 딜 성분 유무: mult>0 / dmg 라이더 / 마법·충격·확정 type / finalDmg·baseFn 중 하나라도 있으면 딜 있음
function hasDamage (spec) { return (spec.mult > 0) || spec.dmg || spec.finalDmg || spec.baseFn || (spec.type && spec.type !== '물리.일반') }
// 효과 적용(딜 이후): 회복·CC·자기버프. 스킬은 필드만 선언.
function applyEffects (spec, s, f, ds, df) {
  if (spec.heal) { const h = spec.heal; const pct = typeof h === 'number' ? h : (h.pct || 0); const flat = (typeof h === 'object' && h.stat && ds.base[h.stat]) || 0; s.hp = Math.min(ds.maxhp, s.hp + hcut(s, healVar(ds.maxhp * pct + flat))) }
  if (spec.cc) for (const k in spec.cc) { applyCC(f, k, spec.cc[k]); if (k === 'slow') f.slowSec = Math.max(f.slowSec, spec.slowSec || 1) }
  if (spec.debuff) for (const k in spec.debuff) f[k] = Math.max(f[k] || 0, spec.debuff[k]) // 직접 필드 디버프(weaponBroken·healCut 등, applyCC 아님)
  if (spec.selfBuff) for (const k in spec.selfBuff) s[k] = spec.selfBuff[k] // 자기 버프 필드 세팅(powMul 등 배율 포함)
  if (spec.selfCC) for (const k in spec.selfCC) { applyCC(s, k, spec.selfCC[k]); if (k === 'slow') s.slowSec = Math.max(s.slowSec, Math.round(ds.턴 * 0.5 * 10) / 10) } // 자체 CC(아수라 자체둔화)
  if (spec.selfCost) s.hp -= Math.round(ds.maxhp * spec.selfCost) // 자기 체력 대가(피의격노 등)
}
// 효과 설명 자동생성(coef의 효과분)
function effDesc (spec) {
  const p = []
  if (spec.heal) { const h = spec.heal; const pct = typeof h === 'number' ? h : (h.pct || 0); p.push(`체력 ${Math.round(pct * 100)}%${(typeof h === 'object' && h.stat) ? '+' + h.stat : ''} 회복`) }
  if (spec.cc) for (const k in spec.cc) p.push(`${spec.cc[k]}턴 ${CC_LABEL[k] || k}`)
  if (spec.debuff) for (const k in spec.debuff) p.push(`${spec.debuff[k]}턴 ${CC_LABEL[k] || k}`)
  if (spec.selfCC) for (const k in spec.selfCC) p.push(`자체 ${spec.selfCC[k]}턴 ${CC_LABEL[k] || k}`)
  if (spec.selfBuff) for (const k in spec.selfBuff) if (BUFF_LABEL[k]) p.push(`${spec.selfBuff[k]}턴 ${BUFF_LABEL[k]}`) // 라벨 있는 버프 필드만(powMul 등 동반필드 생략)
  if (spec.selfCost) p.push(`체력 ${Math.round(spec.selfCost * 100)}%↓`) // 자기 체력 대가
  if (spec.interrupt) p.unshift('시전차단') // 인터럽트: 맨 앞
  if (spec.stack) p.push(spec.stack) // 스택 디버프 설명(적중당 쌓임)
  return p.join(' + ')
}
// 순수 딜기 팩토리: ready/score/exec를 필드에서 자동 생성(부가효과 없는 스킬). 필드는 그대로 남아 skillLine이 읽음
function dmgSkill (ci, spec) {
  return Object.assign({}, spec, {
    ready: (s) => s.cd[ci] === 0,
    score: spec.score || ((s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x)),
    exec: (s, f, ds, df) => { runDamage(spec, s, f, ds, df); s.cd[ci] = spec.cd; s.note = spec.name }
  })
}
// 통합 스킬 팩토리: 딜(runDamage) + 효과(applyEffects) 자동 실행. ready/score는 spec 제공(또는 쿨 기본). coef 자동.
function mkSkill (ci, spec) {
  const dmgy = hasDamage(spec)
  const buffKeys = spec.selfBuff ? Object.keys(spec.selfBuff).filter(k => BUFF_FIELDS.includes(k)) : [] // 지속형 버프 필드(멀티플라이어 제외)
  return Object.assign({}, spec, {
    ready: spec.ready || ((s) => s.cd[ci] === 0 && buffKeys.every(k => !(s[k] > 0))), // 기본: 쿨 + 해당 버프 미보유 시만
    score: spec.score || ((s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x) + (spec.selfBuff ? buffVal(x.est * (spec.buff || 3) * 0.3, s, ds) : 0)), // 딜/CC=autoScore + 순수버프=buffVal 기본값(없으면 후보로 경쟁)
    exec: (s, f, ds, df) => { if (dmgy) runDamage(spec, s, f, ds, df); applyEffects(spec, s, f, ds, df); s.cd[ci] = spec.cd; s.note = spec.note || spec.name }
  })
}
// 광란(광전사 패시브): 저체력일수록 회복 계수 증폭(빈사 ~×3.5). 광란 없으면 1. [[격노]]와 함께 하이리스크 지속
const FURY_ATK = 1.4 // 격노(피의굶주림): 빈사 시 공격력 +N(2차곡선 1+(1-hp%)²×N)
function furyMul (f) { return (psv(f, '광란') && f.maxhp) ? 1 + Math.pow(1 - Math.max(f.hp, 0) / f.maxhp, 2) * 1.8 : 1 }
// 광전사 킷(창고+배치 공용, hoisted): 피의갈증=회복(광란 증폭)·피의격노=버프·격돌=제어
function skBloodThirst (ci) { const spec = { name: '피의갈증', tag: '공격', mult: 1.0, cd: 1, coef: '타격 + 체력회복(체력 낮을수록 증폭) + 광란가속 스택(유지 시 턴 가속, 최대 5스택 −15%)' }; return Object.assign({}, spec, { ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => dmgVal(estDamage(spec, ds, df, x), 1, 0, f.hp, x.foeTurn) + (ds.maxhp - s.hp) * 0.3 * furyMul(s), exec: (s, f, ds, df) => { s.hp = Math.min(ds.maxhp, s.hp + hcut(s, healVar(ds.maxhp * 0.02 * furyMul(s)))); runDamage(spec, s, f, ds, df); s.frenzy = (s.frenzyWin > 0) ? Math.min((s.frenzy || 0) + 1, 5) : 1; s.frenzyWin = 2; s.cd[ci] = spec.cd; s.note = '피의갈증' } }) }
function skBloodRage (ci) { return mkSkill(ci, { name: '피의격노', tag: '버프', buff: 3, cd: 5, selfBuff: { powBuff: 3, powMul: 1.35, accBuff: 3 }, selfCost: 0.15, note: '피의격노', ready: (s, f, ds) => s.cd[ci] === 0 && s.powBuff === 0 && s.hp > ds.maxhp * 0.3, score: (s, f, ds, df, x) => buffVal(x.est * 0.35 * 3, s, ds) }) }
function skClash (ci) { const spec = { name: '격돌', tag: '제어', mult: 1.0, cc: { stun: 2 }, selfCost: 0.05, cd: 3 }; return Object.assign({}, spec, { ready: (s, f) => s.cd[ci] === 0 && f.stun === 0, score: (s, f, ds, df, x) => autoScore(spec, s, f, ds, df, x), exec: (s, f, ds, df) => { applyCC(f, 'stun', 2); runDamage(spec, s, f, ds, df); s.hp -= Math.round(ds.maxhp * 0.05); s.cd[ci] = spec.cd; s.note = '기절' } }) }
// 마법의 완전이해(캐스터): 2턴간 마법 편차 무시(graze100=상시 풀댐) — 순수버프. 창고·세이지 공유(hoisted)
function skFullUnderstanding (ci) { return mkSkill(ci, { name: '마법의완전이해', tag: '버프', buff: 2, cd: 5, selfBuff: { graze100: 2 }, note: '완전이해', ready: (s) => s.cd[ci] === 0 && s.graze100 === 0 && s.autoSpell > 1, score: (s, f, ds, df, x) => buffVal(x.est * 0.7, s, ds) }) } // 볼트 프록 중(오토스펠)일 때만 = 편차무시가 실효
// ===== 재사용 스킬 창고(SKILL_POOL) =====
// 구현만 해두고 배치는 나중에(CHARS/SKILLS에서 참조). ci=쿨슬롯 인덱스. 숫자는 자리표시자(밸런스 차차).
// 미배치=라이브 무영향(CUSTOM_DEFS와 동일 원칙).
const SKILL_POOL = {
  // [순수 딜기 — dmgSkill 자동생성] 기본계수만
  강타: (ci) => dmgSkill(ci, { name: '강타', tag: '공격', mult: 1.6, cd: 3 }),
  // [순수 딜기 — 추가계수] 타격분 없이 자기/상대 체력비례(관통). "maxHP로" 확정
  방패밀쳐내기: (ci) => dmgSkill(ci, { name: '방패밀쳐내기', tag: '공격', mult: 0, dmg: { selfHp: 0.12, foeHp: 0.10 }, cd: 3 }),
  // [광전사 킷 — hoisted 함수 재사용] 피의갈증=회복(광란 증폭) / 피의격노=버프 / 격돌=제어
  피의갈증: skBloodThirst,
  피의격노: skBloodRage,
  격돌: skClash,
  // 마법 캐스터: 2턴간 마법 편차 무시(graze100) — 순수버프
  마법의완전이해: skFullUnderstanding,
  // [시전형 볼트 — 볼트마법사] 화염구식 시전마법. 파이어 2시전 / 라이트닝 1시전 / 콜드 즉발+둔화(쿨1). 발수 1~5(마스터5)
  파이어볼트: (ci) => boltCastSkill(ci, '파이어볼트'),
  라이트닝볼트: (ci) => boltCastSkill(ci, '라이트닝볼트'),
  콜드볼트: (ci) => boltCastSkill(ci, '콜드볼트'),
  // [갬블러 구버전 아카이브 — 미배치, 재사용 대비 보존] 라이브 무영향
  주사위합딜: (ci) => ({ name: '2d20', tag: '공격', coef: '주사위 2개 합(2~40) 비례 도박딜 (상대 HP 최대 60%)', cd: 3, ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => dmgVal(df.maxhp * 0.135, 1, 0, f.hp, x.foeTurn), exec: (s, f, ds, df) => { const sum = (1 + Math.floor(rand() * 20)) + (1 + Math.floor(rand() * 20)); let d = Math.round(df.maxhp * (sum / 40) * 0.6); d = absorb(f, d); f.hp -= d; s.cd[ci] = 3; s.note = sum >= 38 ? `🎯더블! 2d20=${sum}` : (sum <= 5 ? `💢뻥 2d20=${sum}` : `🎲2d20=${sum}`) } }),
  동전던지기HP: (ci) => ({ name: '동전던지기', tag: '공격', coef: '앞면 상대HP15% / 뒷면 체력 5%↓', cd: 2, ready: (s, f, ds) => s.cd[ci] === 0 && s.hp > ds.maxhp * 0.12, score: (s, f, ds, df, x) => dmgVal(df.maxhp * 0.075, 1, 0, f.hp, x.foeTurn), exec: (s, f, ds, df) => { if (rand() < 0.5) { const d = absorb(f, Math.round(df.maxhp * 0.15)); f.hp -= d; s.note = '앞면! 상대 최대체력 15%' } else { s.hp -= Math.round(ds.maxhp * 0.05); s.note = '뒷면… 자해 5%' } s.cd[ci] = 2 } }),
  랜덤디버프룰렛: (ci) => ({ name: '룰렛', tag: '디버프', coef: '상대에게 랜덤 디버프', cd: 3, ready: (s) => s.cd[ci] === 0, score: (s, f, ds, df, x) => x.foeTurn * 1.6, exec: (s, f, ds, df) => { const d = DEBUFFS[Math.floor(rand() * DEBUFFS.length)]; d.apply(f); s.cd[ci] = 3; s.note = '룰렛: ' + d.name } })
}
// 스킬 종류별 "시작 쿨"(오프닝 봉인). 공격기=0(즉시), CC=2, 인캐=3. 마법사=슬로우스타터
const SKILL_STARTCD = { 돌진: 2, 암습: 2, 약점봉인: 2, 도발: 2, 중력베기: 2, 인스턴트캐스팅: 3, 메테오: 13, 속박: 2, 아수라패황권: 7, 역장폭발: 3, 사냥꾼덫: 3, 성역: 5, '올인!!': 3, 과다출혈: 3, 파열: 4, 살아있는시체: 6, 단죄: 3 }
const skillStartCd = (name) => SKILLS[name].map(sk => SKILL_STARTCD[sk.name] || 0)
// 스킬블록: 선택 캐릭의 스킬슬롯을 필드에서 자동 렌더(번호 없음, 하드코딩 테이블 없음) + 패시브 나열
function skillsBlock (name) {
  const lines = SKILLS[name].map(sk => skillLine(sk))
  for (const p of PASSIVES[name] || []) lines.push(`🔒 **${p.name}** — 패시브 ${p.desc}`)
  if (CHARS[name].드루이드) for (const k of DRUID_ORDER.slice(0, 4)) lines.push(`└ ${DRUID_FORMS[k].emoji} **${k}**: ${DRUID_SKILLS[k].slice(0, 4).map(sk => sk.name).join(' · ')}`) // 형상별 스킬(이름만 — 매치업 화면 길이 제한)
  return lines.join('\n')
}
// 방어 결정 = AI 리스크 톨러런스. 예상딜은 추정치(실제는 변동) → 계수로 낙관/비관 표현
// 방어 = 예상딜 × 계수 ≥ 내HP. 공격적=0.6(적게 뜰거라 배짱) / 판단형=0.85 / 방어적=1.15(죽을수도→선제)
function decideDefend (self, foe, ds, df) {
  if (self.noDefend > 0 || self.undead) return false // 시체 무적 중엔 치명 방어 불필요
  const est = Math.max(0, estAtk(df, ds) - self.shield) // 예상 피격(기대값)
  const factor = self.ai === '공격적' ? 0.6 : self.ai === '방어적' ? 1.15 : 0.85
  if (est * factor >= self.hp) return true // 치명 방어(기존)
  // 패링 캐릭(너클): 다음 상대 턴이 내 다음 턴보다 먼저 오면(=이번 턴 넘기면 맞음) 반반 확률로 패링(흘리고 즉시 반격). 100%면 TAS라 50%
  if (ds.무기.방어 === '패링' && foe.stun === 0 && foe.cast === 0) { const incoming = foe.gauge < self.gauge; if (rand() < (incoming ? 0.4 : 0.2)) return true }
  // 패링 vs 시전: 시전은 상대 턴마다 1씩 줄고 0이 되는 턴에 착탄. 내 다음 턴 전에 상대가 움직일 횟수 안에 착탄하면 '맞을 타이밍'(같은 40%). 착탄 전이면 패링 안 함(헛패링 방지)
  if (ds.무기.방어 === '패링' && foe.stun === 0 && foe.cast > 0) { const before = foe.gauge < self.gauge ? 1 + Math.floor((self.gauge - foe.gauge) / df.턴) : 0; if (foe.cast <= before && rand() < 0.4) return true } // 패링: 맞을 타이밍(40%)엔 자주 / 아닐 때(20%)도 헛패링 → 취약3 리스크. 완벽하지 않게 + 스스로 리스크 감수
  return false
}
// 버프(턴 소모 투자) AI 게이트: 공격적=항상 / 판단형=여유 / 방어적=아주 안전할때만
function buffOk (ai, hp, est) {
  if (ai === '공격적') return true
  if (ai === '방어적') return hp > est * 2.5
  return hp > est * 1.5
}
function mkFighter (d, name, ai) {
  // 게이지에 랜덤 미세오프셋 → 속도 동률 시 선공을 공정하게(플레이어 선공 고정 방지)
  const f = {
    name,
    hp: d.maxhp,
    gauge: d.턴 + Math.random() * 0.3,
    ai,
    defending: false,
    parry: false, // 패링 태세(무도가)
    pendCC: null, // 패링 보류 CC(동반 타격이 파리되면 폐기)
    parryHit: false, // 패링 반격 예약(피격 시 게이지 리셋)
    comboStep: 0, // 무도가 콤보 진행도(0=없음, 1=육합권, 2=연환전신장까지)
    comboWin: 0, // 콤보 유효 창(턴 카운트다운, 0=만료)
    enchant: null, // 스블 마검 인챈트 속성(null/'화염'/'얼음'/'전격')
    enchantTurns: 0, // 인챈트 지속(턴 카운트다운)
    paralyze: 0, // 마비(전격 인챈트): 지속 중 매 턴 30% 확률로 턴 상실
    defCombo: 0,
    defHealCd: 0, // 방어 회복 쿨(2쿨 — 매 방어 무한회복 방지)
    defendedLast: false,
    shield: d.마나실드 || 0, // §13: 마법무기 착용 시 지능1.5+체력1 (공격 딜 25% 회복)
    vuln: 0,
    cd: skillStartCd(name),
    rage: 0,
    sunder: 0,
    crush: 0,
    crushDur: 0, // 분쇄(검투사): 스택형 방어감소(물방·마방 스택당 -5%p, 최대5), 지속2
    weaponBroken: 0,
    luckBuff: 0,
    cast: 0,
    castUninterruptible: false,
    castSpec: null,
    castCut: 0,
    castName: null,
    castBolt: null, // 시전형 볼트(볼트마법사): 착탄 시 launchBolt로 발사
    castBoltChain: false, // 볼트마법조합: 이 시전볼트가 착탄 시 다음 원소 후속 발동(시전 시작 시점에 확정)
    castTotal: 0,
    instVuln: 0,
    instCast: 0,
    stun: 0,
    stunned: false,
    taunt: 0, // 도발(기사): >0이면 강제 평타(스킬·버프·방어 봉인)
    noDefend: 0,
    missDown: 0,
    autoSpell: 0,
    haste: 0, // 마나대시(스블): 지속 중 턴 20% 가속
    chainBolt: 0,
    didAttack: false,
    powBuff: 0,
    powMul: 1,
    thorns: 0,
    thornsPct: 0,
    blockUp: 0,
    thornsBase: (CHARS[name] && CHARS[name].반사) || 0, // 공격강화 / 반사버프 / 방패막기강화 / 패시브반사(가시방패)
    dodgeUp: 0,
    magReflect: 0,
    erosion: 0, // 침식(암흑기사): 스택당 최대체력 -5%(최대10=-50%). 자기 빌드업 → 종말로 상대에 전이
    darkZone: 0, // 암흑지대 지속(턴): 매턴 양쪽 물공×1.0 + 자기 침식+1
    darkWard: 0, // 심연의 포옹 지속(턴): 받는 피해 30%↓
    undead: false, // 살아있는 시체 무적 창(체력 1 하한)
    deathMark: 0, // 살아있는 시체: 남은 내 턴(0이 된 다음 내 턴 시작에 창 종료)
    deathDoom: false, // 살아있는 시체: 창 종료 시 사망 예정(영혼포식 회복 시 해제)
    원소마스터: (CHARS[name] && CHARS[name].원소마스터) || false, // 세이지 패시브: 볼트마법 대미지 배율
    불굴: (CHARS[name] && CHARS[name].불굴) || false,
    undyingUsed: 0,
    reviveType: null,
    accBuff: 0, // 피의격노 명중보정(상대 회피↓) 등
    광란: (CHARS[name] && (CHARS[name].광란 || CHARS[name].피의굶주림)) || false, // 피의굶주림(광전사)=격노+광란 통합 패시브
    maxhp: d.maxhp, // 광전사 광란: 체력 낮을수록 제어감소+공격력↑(2차곡선)
    마나환류: (CHARS[name] && CHARS[name].마나환류) || false, // 마법사 패시브: 마법딜 시 확률적 실드복구
    연속타격: (CHARS[name] && CHARS[name].연속타격) || false, // (미배정 — 커스텀용 보존) 공격 시 확률적 추가타
    암습의대가: (CHARS[name] && CHARS[name].암습의대가) || false, // 암살도적 패시브: 군중제어 상태의 상대에게 공격력 ×ASSASSIN_CC
    육합권: (CHARS[name] && CHARS[name].육합권) || false, // 무도가 패시브: 평타 히트당 확률로 육합권 발동 → 연계 개시
    jabStk: 0, // 육합권 프록 전 누적 평타 히트(최소 MUDO_MINJAB 후 프록 시작)
    상처전문가: (CHARS[name] && CHARS[name].상처전문가) || false, // 절개도적 패시브: 평타 명중→활성 출혈 스택+1(지속갱신) + 상대 출혈 스택당 자신 회피+2%(최대+20%)
    cutStk: 0,
    cutDur: 0, // 절개 출혈: 스택(최대5, 턴당 2%) / 지속(평타 명중 시 3 갱신)
    lacStk: 0,
    lacDur: 0, // 열상 출혈: 스택(최대5, 턴당 2%·절개 있으면 3%) / 지속
    healCut: 0, // 과다출혈: >0이면 회복량 80%↓(20%만) — 남은 턴수
    완벽방어: (CHARS[name] && CHARS[name].완벽방어) || false,
    투경: (CHARS[name] && CHARS[name].투경) || false, // 무도가 패시브: 타격마다 확률 방어무시
    blockStreak: 0, // 기사 패시브: 연속 방패막기 3회 → 피해 무효
    격노: (CHARS[name] && (CHARS[name].격노 || CHARS[name].피의굶주림)) || false, // 패시브: 체력 낮을수록 공격력↑(회복하면 감소). 피의굶주림=격노+광란 통합
    무기의달인: (CHARS[name] && CHARS[name].무기의달인) || false, // 패시브: 무기막기 강화 + 무기 배율↑
    graze100: 0, // 마법의 완전이해(버프): 마법 편차 무시 상시 풀댐
    // 프리스트: 신념(마공↑)·신성의무(평타 신성 스플래시)=패시브 / 참회=신성 디버프 / 성역·축복·가호=버프
    신념: (CHARS[name] && CHARS[name].신념) || false,
    신성의무: (CHARS[name] && CHARS[name].신성의무) || false,
    repentStack: 0, // 참회 스택(1~10): 프리스트 본인 버프. 신성딜 시 스택×0.7%(상대 최대체력) 추가딜
    repentWin: 0, // 참회 윈도우(내 2턴 내 재명중 못하면 스택 리셋)
    sanctuary: 0, // 성역: 받는 피해 모두 1 + 턴당 회복/신성딜
    blessTurns: 0, // 축복: 능력치 20%↑
    aegisTurns: 0, // 가호/다이아: 방어력 배율
    aegisMul: 1,
    frenzy: 0, // 광란가속 스택(1~5): 광전사 본인 버프(BUFF_FIELDS 등록 → 디스펠 가능). 피의갈증 유지 시 턴시간 스택당 3%↓
    frenzyWin: 0, // 광란가속 윈도우(피의갈증 한 턴이라도 거르면 스택 리셋)
    derBase: null, // 능력치 버프 base 스냅샷(refreshDerived)

    boltMaster: (CHARS[name] && CHARS[name].boltMaster) || false, // 볼트마법사 패시브: 볼트마법 사용 시 원소당 확정 5발
    행운의여신: (CHARS[name] && CHARS[name].행운의여신) ? (CHARS[name].행운 / 1000) : 0, // 갬블러 패시브: 받는 피해마다 이 확률로 피해 1(전 타입)
    boltShots: 0,
    diceAdv: 0, // 갬블러 2d20: 주사위를 2개 굴려 높은 값(어드밴티지) 버프
    slow: 0,
    slowSec: 0,
    silence: 0,
    luckLock: 0,
    blind: 0,
    healBlock: 0,
    healRegen: 0,
    trap: 0,
    trapBleed: 0,
    bleed: 0,
    bleedDmg: 0, // 사냥꾼덫(예약 발동) + 출혈 DoT

    sigDodge: d.sigDodge,
    sigEcho: d.sigEcho,
    sigTank: d.sigTank,
    echoReady: 0,
    echoStack: 0,
    revive: 0 // §13: 체력100 시그 부활 삭제(CC-1·방어+5%p·HP+10%로 대체)
  }
  if (CHARS[name] && CHARS[name].드루이드) initDruid(f, d)
  return f
}
function reviveCheck (f, d) {
  undeadFloor(f) // 살아있는 시체 무적(부활 아님)
  // 불굴(광전사): 죽을 피해 → 회복하며 생존. 회복량 점감(15/10/5%) 후 소진 → 진짜 죽음. 직후 2턴 취약(instVuln)
  if (f.hp <= 0 && psv(f, '불굴')) { const heals = [0.08]; if (f.undyingUsed < heals.length) { f.hp = Math.round(d.maxhp * heals[f.undyingUsed]); f.undyingUsed++; f.instVuln = 2; f.stun = 0; f.noDefend = 0; f.reviveType = 'undying'; return true } }
  if (f.hp <= 0 && f.revive > 0) { f.hp = Math.round(d.maxhp * 0.20); f.revive--; f.stun = 0; f.noDefend = 0; f.reviveType = 'revive'; return true }
  return false
}

// ── 스텝형 전투 엔진 (자동 runBattle + 인터랙티브 공용) ──
function resetGauge (f, d) { const fury = (psv(f, '광란') && f.maxhp) ? (1 - Math.pow(1 - Math.max(f.hp, 0) / f.maxhp, 2) * 0.3) : 1; const frenzy = f.frenzy > 0 ? (1 - f.frenzy * 0.03) : 1; return Math.max(d.턴 * (f.autoSpell > 0 ? 0.85 : 1) * (f.haste > 0 ? 0.8 : 1) * fury * frenzy - (f.rage > 0 ? 2 : 0), 2) + (f.slow > 0 ? f.slowSec : 0) } // 오토스펠: 턴시간 15%↓ / 마나대시 haste: 20%↓ / 광란: 저체력일수록 가속 / 광란가속: 피의갈증 스택당 3%↓(최대 −15%) · 하한 2초
// 턴 시작 처리(쿨/상태 감소, 기절·시전). 턴이 소모되는 강제 이벤트면 그 이벤트, 아니면 null
// 시전 1틱 진행: 카운트다운 후 착탄. upkeep 자동진행 + 플레이어 '시전 진행'(턴넘기기) 공용
function advanceCast (self, foe, ds, df) {
  self.cast--
  if (self.cast === 0) { const b = foe.hp; if (self.castBolt) { const bn = self.castBolt; const chain = self.castBoltChain; self.castBolt = null; self.castBoltChain = false; launchBolt(self, foe, ds, df, bn, chain); return { type: 'castfire', dmg: b - foe.hp, spell: bn, bolt: true, boltHits: self.boltHits, boltNames: self.boltNames, parried: resolveParry(foe, df) } } const sp = self.castSpec; self.castSpec = null; if (sp) runDamage(sp, self, foe, ds, df); return { type: 'castfire', dmg: b - foe.hp, spell: (sp && sp.name) || self.castName || '화염구', parried: resolveParry(foe, df) } }
  return { type: 'cast', spell: self.castName || '화염구', left: self.cast, total: self.castTotal }
}
function upkeep (self, foe, ds, df, interactive) {
  if (self.parry) applyCC(self, 'vuln', 3) // 패링 실패(피격 없이 태세 소진) → 취약 3턴(헛패링 리스크)
  if (self.defHealCd > 0) self.defHealCd-- // 방어 회복 2쿨
  self.pendCC = null; self.defending = false; self.parry = false; self.parryHit = false; self.note = null; self.lastCrit = false; self.lastBolt = false; self.stunned = false; self._tick = []
  if (self.comboWin > 0) { self.comboWin--; if (self.comboWin === 0) self.comboStep = 0 } // 무도가 콤보 창 만료(2턴 지나면 리셋)
  if (self.enchantTurns > 0) { self.enchantTurns--; if (self.enchantTurns === 0) self.enchant = null } // 스블 인챈트 만료
  for (let i = 0; i < self.cd.length; i++) { if (!ccLocked(self, foe, i)) self.cd[i] = Math.max(0, self.cd[i] - 1) } // 전 스킬 슬롯 쿨 감소(3스킬 대응). 상대에게 건 CC가 남아 있으면 그 스킬 쿨은 정지
  if (self.form) druidUpkeep(self, foe, ds, df) // 드루이드: 비활성 형상 쿨·기력 회복·재생 틱·형상 능력치 갱신
  if (self.starDot > 0 || self.meteorDot > 0) starDotTick(self, ds) // 별빛쇄도·별똥별(마나부엉이) 지속 피해
  if (self.tRegen && self.healBlock === 0) self.hp = Math.min(ds.maxhp, self.hp + hcut(self, Math.round(ds.base.체력 * 0.3)))
  if (self.autoSpell > 0) self.autoSpell--
  if (self.graze100 > 0) self.graze100--
  if (self.passiveLock > 0) self.passiveLock--
  if (self.chainBolt > 0) self.chainBolt--
  if (self.slow > 0) self.slow--; if (self.silence > 0) self.silence--; if (self.luckLock > 0) self.luckLock--; if (self.blind > 0) self.blind--; if (self.healBlock > 0) self.healBlock--
  if (self.weaponBroken > 0) self.weaponBroken-- // 무기파괴 디버프 감소
  if (self.healRegen > 0 && self.healBlock === 0) { self.hp = Math.min(ds.maxhp, self.hp + hcut(self, Math.round(ds.base.체력 / 2))); self.healRegen-- }
  if (self.bleed > 0) { let bd = Math.max(self.bleedDmg, 0); if (self.sanctuary > 0 && bd > 0) bd = Math.max(Math.round(bd * SANCTUARY_TAKEN), 1); self.hp -= bd; self.bleed--; self._tick.push({ type: 'bleed', dmg: bd, left: self.bleed }) } // 출혈 DoT(방어·실드 무시). 성역 중 85%↓
  if (self.cutStk > 0 || self.lacStk > 0) { const lacRate = self.cutStk > 0 ? 0.025 : 0.015; let bd = Math.round(ds.maxhp * (self.cutStk * 0.015 + self.lacStk * lacRate)); if (self.sanctuary > 0 && bd > 0) bd = Math.max(Math.round(bd * SANCTUARY_TAKEN), 1); if (bd > 0) self.hp -= bd; if (self.cutDur > 0) { self.cutDur--; if (self.cutDur === 0) { self.cutStk = Math.max(self.cutStk - 1, 0); if (self.cutStk > 0) self.cutDur = 2 } } if (self.lacDur > 0) { self.lacDur--; if (self.lacDur === 0) { self.lacStk = Math.max(self.lacStk - 1, 0); if (self.lacStk > 0) self.lacDur = 2 } } self._tick.push({ type: 'gash', dmg: bd, cut: self.cutStk, lac: self.lacStk }) } // 절개/열상 출혈 DoT(방어·실드 무시, 성역 85%↓). 지속 만료 시 1스택씩 점감(재부착 지속2)
  if (self.healCut > 0) self.healCut-- // 과다출혈 회복감소 지속
  if (self.darkWard > 0) self.darkWard-- // 심연의 포옹(받는뎀↓) 지속
  if (self.darkZone > 0) { self.darkZone--; const base = Math.round(ds.물공 * (ds.무기.물공배율 || 1) * 1.0); let hd = 0; TICKING = true; if (foe.hp > 0) hd = absorb(foe, spellDmg(base, foe, df, self)); TICKING = false; if (hd > 0) foe.hp -= hd; const sd = Math.max(Math.round(base * DARKZONE_SELF), 1); self.hp -= sd; addErosion(self, ds, 1); self._tick.push({ type: 'darkzone', dmg: hd, selfDmg: sd, zoneLeft: self.darkZone }) } // 암흑지대: 매턴 상대(마법.일반, 마나실드 흡수) 물공×1.0 + 자신(직격) 물공×0.85 + 자기 침식+1
  if (self.undead) { if (self.deathMark === 0) { self.undead = false; if (self.deathDoom) { self.deathDoom = false; self.hp = 0; self._tick.push({ type: 'deathmark' }) } } else { self.deathMark--; if (undeadFloor(self)) self._tick.push({ type: 'undeadHold', left: self.deathMark }) } } // 살아있는 시체: 내 턴 시작마다 1 소모 + 무적(출혈·암흑지대 틱 포함). 4턴 다 쓰면 창 종료 → 회복 못했으면 사망
  if (self.erosion > 0 && self.hp > emaxHp(self, ds)) self.hp = emaxHp(self, ds) // 침식 상한 클램프(안티힐: 회복해도 상한 초과 불가)
  if (self.trap > 0) { self.trap--; if (self.trap === 0) { self.gauge += ds.턴 * 0.8; applyCC(self, 'slow', 1); self.slowSec = Math.max(self.slowSec, Math.round(ds.턴 * 0.2 * 10) / 10); self.bleed = 3; self.bleedDmg = self.trapBleed || 0; self._tick.push({ type: 'trapspring', dmg: self.bleedDmg }) } } // 사냥꾼덫 발동: 게이지 밀림 + 1턴 둔화 + 출혈 3턴
  // 버프/디버프 지속은 기절·시전 중에도 흐른다 (기절 중 버프 동결 버그 A2 수정)
  if (self.instVuln > 0) self.instVuln--
  if (self.repentWin > 0) { self.repentWin--; if (self.repentWin === 0) self.repentStack = 0 } // 참회 윈도우 만료 → 스택 리셋(2턴 내 재명중 실패)
  if (self.frenzyWin > 0) { self.frenzyWin--; if (self.frenzyWin === 0) self.frenzy = 0 } // 광란가속 윈도우 만료 → 스택 리셋(피의갈증 걸렀음)
  // 능력치 버프(축복/가호/다이아) 지속·만료 → 만료 턴에 refreshDerived로 base 복원
  if (self.blessTurns > 0 || self.aegisTurns > 0) { if (self.blessTurns > 0) self.blessTurns--; if (self.aegisTurns > 0) self.aegisTurns--; refreshDerived(self, ds) }
  // 성역: 턴당 체력3% 회복 + 상대에게 신성딜(마공×0.7). 지속 감소
  if (self.sanctuary > 0) { self.sanctuary--; let hd = 0; TICKING = true; if (foe.hp > 0) hd = holyDmg(self, foe, ds, df, ds.마공 * 0.7); TICKING = false; self._tick.push({ type: 'sanctuary', dmg: hd, heal: 0, repent: self.repentHit || 0 }) } // 성역: 무적(받는피해85%↓) + 신성딜만(회복 제거)
  if (self.instCast > 0 && self.cast === 0) self.instCast-- // 인캐 버프 3턴 지속(시전 중엔 유지)
  if (self.powBuff > 0) self.powBuff--
  if (self.taunt > 0) self.taunt--
  if (self.thorns > 0) self.thorns--
  if (self.blockUp > 0) self.blockUp--
  if (self.dodgeUp > 0) self.dodgeUp--
  if (self.accBuff > 0) self.accBuff--
  if (self.diceAdv > 0) self.diceAdv--
  // 마법반사: 지속형 아님 — 다음 마법 1회 반사 후 소비(spellDmg·attack서 처리). upkeep 감소 없음
  if (self.noDefend > 0) self.noDefend--
  if (self.missDown > 0) self.missDown--
  if (self.haste > 0) self.haste--
  if (self.castCut > 0) self.castCut-- // 시전 끊기·취소 버프(다음 시전 -1턴) 2턴 지속
  if (self.rage > 0) { self.rage--; if (self.rage === 0) self.cd[0] = 2 }
  if (self.luckBuff > 0) { self.luckBuff--; if (self.luckBuff === 0) self.cd[0] = 2 }
  if (foe.sunder > 0) foe.sunder--
  if (self.crushDur > 0) { self.crushDur--; if (self.crushDur === 0) { self.crush = Math.max(self.crush - 1, 0); if (self.crush > 0) self.crushDur = 2 } } // 분쇄: 지속 만료 시 1스택씩 점감(재부착 지속2) — 출혈과 동일 패턴
  // §13: 마나실드 자가재생 삭제 → 공격 딜 25% 회복(execAttack/execSkill)으로 대체
  if (self.stun > 0) {
    // 끊기 불가 시전(메테오 등): 시작 후엔 돌이킬 수 없음 — 기절 중에도 그대로 진행
    if (self.cast > 0 && self.castUninterruptible) {
      self.cast--; self.stun--; self.defCombo = 0; self.defendedLast = false
      if (self.cast === 0) { const b = foe.hp; const sp = self.castSpec; self.castSpec = null; if (sp) runDamage(sp, self, foe, ds, df); return { type: 'castfire', dmg: b - foe.hp, spell: '메테오', parried: resolveParry(foe, df) } }
      return { type: 'stun', stunLeft: self.stun, castName: self.castName, castLeft: self.cast, castTotal: self.castTotal } // 기절 중에도 메테오 시전 진행 표시
    }
    if (self.cast > 0) { self.cast = 0; self.castCut = 2 } // 그 외 시전은 기절에 즉시 취소 → castCut 버프
    self.stun--; self.defCombo = 0; self.defendedLast = false; self.stunned = true
    // 행동불능 중 쓸 스킬(마법사 충격파 / 광전사 재생의광기)이 있으면 플레이어·AI가 선택, 없으면 자동 스킵
    if (!stunSkill(self, foe, ds, df)) return { type: 'stun', stunLeft: self.stun }
    return null // 제한된 턴 진행 — self.stunned=true 로 옵션 제한(공격/일반스킬 불가, 충격파/재생 or 턴넘기기)
  }
  if (self.paralyze > 0) { self.paralyze--; if (rand() < PARALYZE_CHANCE) { self.defCombo = 0; self.defendedLast = false; return { type: 'paralyze', paralyzeLeft: self.paralyze } } } // 마비: 확률로 이 턴 상실(스턴과 동일 처리)
  // 시전 진행(캐스터 공통): interactive(플레이어)면 메테오 외 시전은 자동진행 대신 멈춤 → '시전 진행/취소' 선택. AI·상대·메테오는 자동진행
  if (self.cast > 0) { if (interactive && !self.castUninterruptible) return null; return advanceCast(self, foe, ds, df) }
  return null
}
function ctxFor (self, foe, ds, df) {
  const inc = estAtk(df, ds) // 상대의 다음 피격 추정
  // safe = 시전 리스크 판단: 시전 중 무방비로 ~4턴 피격 견딜 수 있어야 안전(물리 즉발은 이 게이트 안 씀)
  return { est: estAtk(ds, df), foeTurn: inc, incoming: Math.max(0, inc * 1.3 - self.shield), safe: (self.hp + self.shield) > inc * 4 }
}
// 불굴 버스트 완충: 단일 피격이 최대HP 15%↑면 즉시 6% 회복(생존 시). df=피격자 파생. 딜 표기는 회복 전 값 사용
function bigHitHeal (foe, df, dealt) { if (foe.불굴 && foe.hp > 0 && dealt >= df.maxhp * 0.15) foe.hp = Math.min(df.maxhp, foe.hp + hcut(foe, Math.round(df.maxhp * 0.04))) }
// 군중제어 쿨 정지: 스킬이 상대에게 CC(기절·마비·침묵·도발, 둔화 제외)를 걸면, 그 스킬 쿨은 상대 CC가 모두 풀릴 때까지 돌지 않음(풀린 순간부터 카운트).
// 턴 시간 가치가 캐릭마다 달라 빠른 쪽이 쿨 중에도 상대를 계속 묶던 문제(암습 고정) 방지. 무기 확률 CC(양둔 스턴 등)는 스킬이 아니라 제외
const CC_FIELDS = ['stun', 'paralyze', 'silence', 'slow', 'taunt'] // 군중제어(암습의 대가 판정 등)
const CC_LOCK_FIELDS = ['stun', 'paralyze', 'silence', 'taunt'] // 쿨 정지 대상 — 둔화는 딜 스킬 부가효과가 많아 제외
const ASSASSIN_CC = 1.5 // 암습의 대가(암살도적): 군중제어 상태 상대에게 공격력 배율
function ccSnap (f) { return CC_LOCK_FIELDS.map(k => f[k] || 0) }
function ccLockAfter (self, foe, ccB, cdB) { // CC가 새로 걸리거나 늘어난 필드 + 이번에 쿨이 새로 잡힌 슬롯을 묶어 기록
  const fields = CC_LOCK_FIELDS.filter((k, i) => (foe[k] || 0) > ccB[i]); if (!fields.length) return
  self.cd.forEach((v, i) => { if (v > (cdB[i] || 0)) { self.ccLock = self.ccLock || {}; self.ccLock[i] = fields } })
}
function ccLocked (self, foe, i) { const fl = self.ccLock && self.ccLock[i]; if (!fl) return false; if (fl.some(k => (foe[k] || 0) > 0)) return true; delete self.ccLock[i]; return false }
function execSkill (self, foe, ds, df, sk) { if (sk.selfEvent) return sk.selfEvent(self, foe, ds, df); self.tukyungHits = 0; const ccB = ccSnap(foe); const cdB = self.cd.slice(); const fb = foe.hp; const sb = self.hp; const psh = foe.shield; self.didAttack = false; self.lastDef = null; self.meteorImmune = false; self.multiHits = null; sk.exec(self, foe, ds, df); self.defCombo = 0; self.defendedLast = false; const dealt = Math.max(fb - foe.hp, 0); if (ds.마나실드 && dealt > 0) self.shield = Math.min(ds.마나실드, self.shield + Math.round(dealt * SHIELD_REGEN)); { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dealt > 0) self.hp -= Math.max(Math.round(dealt * tp), 1) } if (foe.pendCC) { for (const _c of foe.pendCC) foe[_c[0]] = Math.max(foe[_c[0]], _c[1]); foe.pendCC = null } const didParry = foe.parryHit; if (didParry) { foe.gauge = 0; foe.parryHit = false; parryHeal(foe, df) } bigHitHeal(foe, df, dealt); ccLockAfter(self, foe, ccB, cdB); return { parried: didParry, tukyung: self.tukyungHits, type: 'skill', name: sk.name, dmg: dealt, note: self.note, crit: self.lastCrit, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, boltCombo: self.boltCombo, boltShots: self.boltShots, def: self.lastDef, attacked: self.didAttack, broke: self.brokeCast, grazed: self.grazed, shieldAbsorb: Math.max(psh - foe.shield, 0), selfDmg: Math.max(sb - self.hp, 0), selfHeal: Math.max(self.hp - sb, 0), diceAtk: self.diceAtk, diceDef: self.diceDef, meteorImmune: self.meteorImmune, multiHits: self.multiHits, dmgType: sk.dmgType } }
// 평타 실행 + 드루이드 전투곰 분노 획득(적중 15 · 치명타 30)
function execAttack (self, foe, ds, df) { const ev = execAttackCore(self, foe, ds, df); if (self.form === '전투곰' && (ev.dmg > 0 || ev.shieldAbsorb > 0)) self.druRage = Math.min(RAGE_MAX, self.druRage + (ev.crit ? BEAR_RAGE_CRIT : BEAR_RAGE_HIT)); return ev }
function execAttackCore (self, foe, ds, df) { self.tukyungHits = 0; if (self.육합권 && self.comboStep === 0 && foe.hp > 0) { let pr = false; for (let k = 0; k < 2; k++) { self.jabStk = (self.jabStk || 0) + 1; if (self.jabStk >= MUDO_MINJAB && rand() < MUDO_PROC) { pr = true; break } } if (pr) { self.jabStk = 0; return execMudoYukhap(self, foe, ds, df) } } const fb = foe.hp; const sb = self.hp; const psh = foe.shield; self.holyHit = 0; self.repentHit = 0; let dmg = attack(self, foe, ds, df, foe.defending); if (self.상처전문가 && dmg > 0) gashHit(foe); if (foe.vuln > 0) foe.vuln--; dmg = fistAbsorb(self, foe, dmg, ds.무기.실드효율); foe.hp -= dmg; if (self.autoSpell > 0 && foe.hp > 0 && rand() < 0.90) launchBolt(self, foe, ds, df, ['파이어볼트', '라이트닝볼트', '콜드볼트'][Math.floor(rand() * 3)], false); if (self.신성의무 && ds.마공 && foe.hp > 0) { self.holySplash = holyDmg(self, foe, ds, df, ds.마공 * 0.7) } const dealt = Math.max(fb - foe.hp, 0); if (ds.마나실드 && dealt > 0) self.shield = Math.min(ds.마나실드, self.shield + Math.round(dealt * SHIELD_REGEN)); self.defCombo = 0; self.defendedLast = false; { const tp = Math.max(foe.thornsBase || 0, foe.thorns > 0 ? foe.thornsPct : 0); if (tp > 0 && dmg > 0) self.hp -= Math.max(Math.round(dmg * tp), 1) } if (foe.pendCC) { for (const _c of foe.pendCC) foe[_c[0]] = Math.max(foe[_c[0]], _c[1]); foe.pendCC = null } const didParry = foe.parryHit; if (didParry) { foe.gauge = 0; foe.parryHit = false; parryHeal(foe, df) } bigHitHeal(foe, df, dealt); return { parried: didParry, tukyung: self.tukyungHits, type: 'attack', dmg: dealt, crit: self.lastCrit, bolt: self.lastBolt, ph: self.hitPh, mg: self.hitMg, boltName: self.boltName, boltHits: self.boltHits, boltNames: self.boltNames, boltCombo: self.boltCombo, boltShots: self.boltShots, def: self.lastDef, broke: self.brokeCast, grazed: self.grazed, shieldAbsorb: Math.max(psh - foe.shield, 0), selfDmg: Math.max(sb - self.hp, 0), diceAtk: self.diceAtk, diceDef: self.diceDef, holy: self.신성의무 ? (self.holyHit || 0) : 0, repent: self.신성의무 ? (self.repentHit || 0) : 0 } }
// 방어 회복: maxhp 5% + 체력/2 고정(장기전 복리 완화)
function parryHeal (foe, df) { if (foe.defHealCd === 0) { foe.hp = Math.min(df.maxhp, foe.hp + healVar(df.maxhp * 0.05 + df.base.체력 / 2)); foe.defHealCd = 2 } } // 패링 성공(피격 흘림) 시에만 회복 — 헛패링·비패링방어는 회복 없음
function execDefend (self, ds) { const before = self.hp; const parryWpn = ds.무기.방어 === '패링'; if (self.defHealCd === 0 && !parryWpn) { self.hp = Math.min(ds.maxhp, self.hp + healVar(ds.maxhp * 0.05 + ds.base.체력 / 2) * (self.undead ? UNDEAD_HEAL : 1)); self.defHealCd = 2 } self.defending = true; self.defCombo++; self.defendedLast = true; if (parryWpn) { self.parry = true; self.note = '패링 태세' } return { type: 'defend', heal: Math.round(self.hp - before), parry: !!self.parry } } // 방어=경감(defending)+회복(2쿨). 패링 캐릭은 여기서 회복 X → 패링 성공 시에만(parryHeal)
// 순수버프 스킬(턴만 소모, 공격/방어 없음) — AI 생존여유 게이트 대상. 재생의광기 등 '공격 겸용'은 제외
const BUFF_SKILLS = new Set(['인스턴트캐스팅', '볼트마법조합', '방패들기', '마법반사', '오토스펠'])
// 마법 스킬: 침묵 시 사용 불가(물리 스킬은 침묵 무시). 원소·역장·시전·마법 유틸·마법 버프가 대상 (물리 타격·물리 버프·물리 덫은 제외)
const MAGIC_SKILLS = new Set(['화염구', '메테오', '인스턴트캐스팅', '서리구', '충격파', '파이어볼트', '라이트닝볼트', '콜드볼트', '볼트마법조합', '오토스펠', '디스펠', '마법의완전이해', '룬각인', '역장폭발', '약점봉인', '마나소각', '시전파괴', '마법반사', '안식', '성스러운빛', '달빛섬광', '별빛섬광', '별빛쇄도', '별똥별'])
const silenced = (s, name) => s.silence > 0 && MAGIC_SKILLS.has(name)
// 침묵 AI 가치: 상대의 마법 스킬 비율(0~1). 순수 물리 상대에겐 침묵이 무의미하므로 0 → 침묵 점수 소멸(딜만 남음)
const _magicShare = {}
const magicShare = name => { if (_magicShare[name] != null) return _magicShare[name]; const s = SKILLS[name] || []; return (_magicShare[name] = s.length ? s.filter(sk => MAGIC_SKILLS.has(sk.name)).length / s.length : 0) }
// 행동불능(기절) 중 쓸 수 있는 스킬 — 스킬의 stunnable 플래그 + 기존 ready 조건 재사용(하드코딩 제거). 없으면 null
function stunUsableSkill (self, foe, ds, df) { return skillsOf(self).find(s => s.stunnable && s.ready(self, foe, ds, df)) || null }
function stunSkill (self, foe, ds, df) { const sk = stunUsableSkill(self, foe, ds, df); return sk ? sk.name : null }
// 기절 중 실행: 동작이 다르면 stunExec(예: 재생의광기=회복만), 아니면 일반 exec 재사용(충격파)
function execStunSkill (self, foe, ds, df) { const sk = stunUsableSkill(self, foe, ds, df); if (!sk) return { type: 'skip' }; return sk.stunExec ? sk.stunExec(self, foe, ds, df) : execSkill(self, foe, ds, df, sk) }
function execSkip (self) { self.defending = false; return { type: 'skip' } } // 턴넘기기(이점 미정 — 일단 순수 패스)
function aiTurn (self, foe, ds, df) {
  const forced = upkeep(self, foe, ds, df); if (forced) return forced
  if (self.hp <= 0) return { type: 'skip' } // 출혈 등으로 upkeep 중 사망 → 행동 없음(종료는 루프에서)
  if (self.stunned) return execStunSkill(self, foe, ds, df) // 기절 중: 쓸 스킬 있으면 사용(AI는 항상 사용 = 기존 자동발동과 동일)
  if (self.taunt > 0) return execAttack(self, foe, ds, df) // 도발 중: 강제 평타(스킬·버프·방어 불가)
  // 상대 시전 중이면 AI 유형 무관하게 '차단기'만 우선 사용(방어적도 시전은 끊음)
  if (foe.cast > 0) {
    const cx = ctxFor(self, foe, ds, df)
    const intr = skillsOf(self).find(sk => ['방해', '돌진', '암습', '약점봉인', '시전파괴', '입막음', '방패가격'].includes(sk.name) && !silenced(self, sk.name) && sk.ready(self, foe, ds, df, cx))
    if (intr) return execSkill(self, foe, ds, df, intr)
  }
  // 방어 판단(AI별): 공격적=치명일 때만 / 방어적=저HP 선제 / 판단형=치명 직전. (회복스킬은 아래 스킬선택서 HP게이트로 처리)
  if (decideDefend(self, foe, ds, df)) return execDefend(self, ds)
  if (self.form && self.cast === 0) { const want = druidPickForm(self, foe, ds, df); if (want !== self.form) return druidShift(self, foe, ds, df, want) } // 드루이드: 형상 판단(변신=1턴)
  // 스킬 선택: 점수 최고. 침묵 시 마법 스킬만 제외(물리 스킬은 사용 가능). 제어는 이미 고점수(우선), 버프는 AI 생존여유 게이트
  {
    const ctx = ctxFor(self, foe, ds, df); const cands = [{ sk: null, sc: ctx.est + gashAtkBonus(self, foe, df) }] // null=평타 (절개도적: 활성 출혈<5면 평타로 스택 빌드 가치 가산)
    for (const sk of skillsOf(self)) {
      if (silenced(self, sk.name)) continue
      if (!sk.ready(self, foe, ds, df, ctx)) continue
      if (BUFF_SKILLS.has(sk.name) && !buffOk(self.ai, self.hp, Math.max(0, ctx.foeTurn - self.shield))) continue // 버프는 여유 있을 때만(공격적은 항상)
      cands.push({ sk, sc: sk.score(self, foe, ds, df, ctx) })
    }
    // 정형화 방지: 최고점만 뽑지 말고 상위권(최고점 75%+) 중 점수비례 확률선택 → 매판 다른 전개
    const top = Math.max(...cands.map(c => c.sc))
    const pool = cands.filter(c => c.sc > 0 && c.sc >= top * 0.7)
    let pick = pool[0] || { sk: null }
    if (pool.length > 1) { const tot = pool.reduce((a, c) => a + c.sc, 0); let r = rand() * tot; for (const c of pool) { r -= c.sc; if (r <= 0) { pick = c; break } } }
    return pick.sk ? execSkill(self, foe, ds, df, pick.sk) : execAttack(self, foe, ds, df) // 평타(볼트마법사는 매직미사일)
  }
}
function initBattle (meName, oppName, oppAI) {
  const dA = derive(CHARS[meName]); const dB = derive(CHARS[oppName])
  const tA = pickTitle(); const tB = pickTitle()
  if (tA.d) tA.d(dA); if (tB.d) tB.d(dB)
  const A = mkFighter(dA, meName, null); const B = mkFighter(dB, oppName, oppAI)
  if (tA.flag) A[tA.flag] = true; if (tB.flag) B[tB.flag] = true
  return { A, B, dA, dB, get maxA () { return this.dA.maxhp }, get maxB () { return this.dB.maxhp }, meName, oppName, oppAI, oppNick: pickArr(NICKS), meTitle: tA.name, oppTitle: tB.name, t: 0, log: [] }
}
// 현재 시점 프레임: 양쪽 HP + 버프/디버프(위아래 분리용) 스냅샷
function snapFrame (state) {
  const ga = statusGroups(state.A); const gb = statusGroups(state.B)
  return { aHp: Math.round(Math.max(state.A.hp, 0)), bHp: Math.round(Math.max(state.B.hp, 0)), aBuf: ga.buffs.join(' '), aDeb: ga.debuffs.join(' '), bBuf: gb.buffs.join(' '), bDeb: gb.debuffs.join(' ') }
}
function recEntry (state, who, ev) {
  const other = who === 'me' ? state.B : state.A; const otherMax = who === 'me' ? state.maxB : state.maxA
  const self = who === 'me' ? state.A : state.B; const selfMax = who === 'me' ? state.maxA : state.maxB
  const base = { who, hp: Math.round(Math.max(other.hp, 0)), max: otherMax, selfHp: Math.round(Math.max(self.hp, 0)), selfMax }
  // 순차공개 동기화: 이벤트 시점 양쪽 HP·버프·디버프 스냅샷 — 인터랙티브(state.shown 설정)에서만(시뮬 성능 보호)
  if (state.shown != null) Object.assign(base, snapFrame(state))
  state.log.push(Object.assign(base, ev))
}
function floorBoth (state) { return [undeadFloor(state.A), undeadFloor(state.B)] } // 시체 무적 하한 적용(기록 전에 — HP 0 표기 방지)
function holdRec (state, held) { if (held[0]) recEntry(state, 'me', { type: 'undeadHold', left: state.A.deathMark }); if (held[1]) recEntry(state, 'opp', { type: 'undeadHold', left: state.B.deathMark }) } // 무적으로 버틴 경우 나레이션
function reviveRec (state, who) { const f = who === 'me' ? state.A : state.B; const mx = who === 'me' ? state.maxA : state.maxB; state.log.push({ who, type: 'revive', hp: Math.max(f.hp, 0), max: mx, rtype: f.reviveType }) }
// 턴 기록: upkeep이 남긴 tick 이벤트(출혈/덫 발동)를 먼저 로그에 풀고, 본 행동 이벤트를 기록
function recTurn (state, who, f, ev) { if (f._tick && f._tick.length) { for (const t of f._tick) recEntry(state, who, t); f._tick = [] } if (ev && ev.type === 'skip' && f.hp <= 0) return; recEntry(state, who, ev) } // 출혈로 죽은 턴의 빈 스킵은 기록 생략(koLog가 처리)
function koLog (state) { const dead = state.B.hp <= 0 ? 'opp' : (state.A.hp <= 0 ? 'me' : null); if (dead) { const mx = dead === 'me' ? state.maxA : state.maxB; state.log.push(Object.assign({ who: dead, type: 'ko', hp: 0, max: mx }, snapFrame(state))) } } // 전투 종료 시 쓰러진 쪽 로그
function stateResult (state) { return { winner: state.winner, log: state.log, meTitle: state.meTitle, oppTitle: state.oppTitle, oppNick: state.oppNick, meMax: state.maxA, oppMax: state.maxB, meHp: Math.max(state.A.hp, 0), oppHp: Math.max(state.B.hp, 0) } }

// 자동 전투(밸런스 시뮬/관전용): 양쪽 AI
function runBattle (meName, oppName, meAI, oppAI) {
  const state = initBattle(meName, oppName, oppAI); state.A.ai = meAI
  const { A, B, dA, dB } = state; const DT = 0.1
  const actA = () => { A.gauge = resetGauge(A, dA); const ev = aiTurn(A, B, dA, dB); const held = floorBoth(state); recTurn(state, 'me', A, ev); holdRec(state, held); if (reviveCheck(B, dB)) reviveRec(state, 'opp') }
  const actB = () => { B.gauge = resetGauge(B, dB); const ev = aiTurn(B, A, dB, dA); const held = floorBoth(state); recTurn(state, 'opp', B, ev); holdRec(state, held); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  while (A.hp > 0 && B.hp > 0 && state.t < 600) {
    A.gauge -= DT; B.gauge -= DT; state.t += DT
    const aR = A.gauge <= 0; const bR = B.gauge <= 0
    if (!aR && !bR) continue
    // 동시 준비 시: 더 밀린(게이지 작은) 쪽이 먼저, 동률이면 랜덤 — 첫 인자(me) 고정 선행 편향 제거
    const aFirst = (aR && bR) ? (A.gauge < B.gauge || (A.gauge === B.gauge && Math.random() < 0.5)) : aR
    if (aFirst) { if (aR) actA(); if (bR && A.hp > 0 && B.hp > 0) actB() } else { if (bR) actB(); if (aR && A.hp > 0 && B.hp > 0) actA() }
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
      const forced = upkeep(A, B, dA, dB, true) // interactive: 플레이어 시전 턴엔 자동진행 대신 멈춰 진행/취소 선택
      if (A._tick && A._tick.length) { for (const t of A._tick) recEntry(state, 'me', t); A._tick = [] } // 출혈/덫 발동 로그 먼저
      if (A.hp <= 0) { koLog(state); state.winner = 'opp'; return 'end' } // 출혈로 사망 시 종료
      if (forced) { const held = floorBoth(state); recEntry(state, 'me', forced); holdRec(state, held); if (reviveCheck(B, dB)) reviveRec(state, 'opp'); if (B.hp <= 0) break; continue }
      return 'player' // 플레이어 upkeep 완료, 행동 선택 대기
    }
    if (B.hp <= 0) break
    if (B.gauge <= 0) { B.gauge = resetGauge(B, dB); const ev = aiTurn(B, A, dB, dA); const held = floorBoth(state); recTurn(state, 'opp', B, ev); holdRec(state, held); if (reviveCheck(A, dA)) reviveRec(state, 'me') }
  }
  koLog(state)
  state.winner = state.t >= 600 ? 'draw' : (A.hp > 0 ? 'me' : 'opp')
  return 'end'
}
// 플레이어 행동 실행 후 다음 플레이어 턴까지 진행
// 캐릭당 패시브 배열(여러 개 가능). 버튼/설명에서 순회. 최대 5(스킬줄 총합).
const PASSIVES = { 검투사: [{ name: '무기의 달인', desc: '무기막기 강화(확률 힘10당 3% · 성공 시 40% 경감) + 무기 배율 소폭↑' }], 기사: [{ name: '완벽방어!', desc: '방패막기를 연속 2회 성공하면 받는 피해의 70%를 공격자에게 반사' }], 세이지: [{ name: '원소의 이해', desc: '원소(화염/전격/냉기) 마법 대미지 대폭 증가' }, { name: '현자의 균형', desc: '힘·지능 중 낮은 값 10당 받는 대미지 -2.5% (최대 -16%)' }], 광전사: [{ name: '피의굶주림', desc: `체력이 낮을수록 강해진다 — 공격력 급증(빈사 ~+${Math.round(FURY_ATK * 100)}%) + 받는 제어 감소 + 턴 가속 + 회복량 증폭. 회복하면 다시 약해진다(죽어갈수록 강한 버서커)` }], 스펠브레이커: [{ name: '마도갑주', desc: '마법 갑옷 오라 — 상시 물리 방어 +12%p' }], 암살도적: [{ name: '암습의 대가', desc: `군중제어(기절·마비·침묵·둔화·도발) 상태의 상대에게 공격력 ×${ASSASSIN_CC}` }], 절개도적: [{ name: '상처전문가', desc: '상대에게 걸린 출혈(절개·열상) 스택당 자신 회피 +2%(최대 +20%) — 상처가 깊을수록 날렵해진다' }], 볼트마법사: [{ name: '볼트마법의 이해', desc: '볼트마법 사용 시 원소당 확정 5발(없으면 원소당 1~5 랜덤)' }], 프리스트: [{ name: '신성한 의무', desc: '물리 평타에 신성 대미지(마공×0.7) 추가 — 참회 부여(신성딜 받으면 최대체력3% 추가)' }], 무도가: [{ name: '육합권', desc: '평타 히트당 30% 확률로 육합권 발동(최소 2히트 후) → 연환전신장·맹룡과강 연계 개시. 패링 반격 평타도 발동' }, { name: '투경', desc: `모든 타격(평타·육합권·연환격의 각 타)마다 ${Math.round(TUKYUNG_PROC * 100)}% 확률로 방어(물방·마방) 무시 + 마나실드에도 온전히 들어가는 피해` }] }
function playerResolve (state, choice) {
  const { A, B, dA, dB } = state
  let ev
  // 시전 중(메테오 제외): '시전 진행'(턴넘기기 그대로 시전 진행) / '시전 취소'(즉시 취소)
  if (A.cast > 0 && !A.castUninterruptible) {
    // 자가 취소 → 시전 스킬 쿨 환불(안 쓴 것으로 처리). 아니면 '시전 진행'
    if (choice === 'castcancel') { ev = { type: 'castcancel', spell: A.castName || '시전' }; const cslot = skillsOf(A).findIndex(sk => sk.name === A.castName); if (cslot >= 0) A.cd[cslot] = 0; A.cast = 0; A.castCut = 2; A.castBolt = null; A.castBoltChain = false; A.castSpec = null; A.castName = null } else { ev = advanceCast(A, B, dA, dB) }
    const held = floorBoth(state); recEntry(state, 'me', ev); holdRec(state, held); if (reviveCheck(B, dB)) reviveRec(state, 'opp')
    if (B.hp <= 0) { koLog(state); state.winner = 'me'; return 'end' }
    return advance(state)
  }
  if (A.stunned) ev = (choice === 'skip') ? execSkip(A) : execStunSkill(A, B, dA, dB) // 기절 중: 턴넘기기 or 기절스킬(충격파/재생)만
  else if (choice === 'skip') ev = execSkip(A)
  else if (choice === 'defend') ev = execDefend(A, dA)
  else if (/^s\d+$/.test(choice)) {
    const slot = parseInt(choice.slice(1), 10)
    ev = playerCanUse(state, slot).usable ? execSkill(A, B, dA, dB, skillsOf(A)[slot]) : execAttack(A, B, dA, dB)
  } else ev = execAttack(A, B, dA, dB)
  const held = floorBoth(state); recEntry(state, 'me', ev); holdRec(state, held); if (reviveCheck(B, dB)) reviveRec(state, 'opp')
  if (B.hp <= 0) { koLog(state); state.winner = 'me'; return 'end' }
  return advance(state)
}
// 플레이어 스킬 사용 가능 판정(AI 자제 휴리스틱 제외, 진짜 게이트만)
function playerCanUse (state, slot) {
  const { A, B, dB } = state; const sk = skillsOf(A)[slot]; const name = sk.name
  if (A.taunt > 0) return { usable: false, reason: '도발' }
  if (A.silence > 0 && MAGIC_SKILLS.has(name)) return { usable: false, reason: '침묵(마법)' }
  if (A.cd[slot] > 0) return { usable: false, reason: `${A.cd[slot]}턴 후` }
  if (A.form) { // 드루이드: 자원·형상·스킬 조건(ready)
    if (sk.res && A[sk.res] < sk.cost) return { usable: false, reason: `${RES_LABEL[sk.res]} ${A[sk.res]}/${sk.cost}` }
    if (sk.cast && A.cast > 0) return { usable: false, reason: '시전 중' }
    if (!sk.ready(A, B, state.dA, dB)) return { usable: false, reason: sk.shift ? '현재 형상' : sk.tag === '회복' ? (A[Object.keys(sk.selfBuff || {})[0]] > 0 ? '유지 중' : '체력 충분') : sk.name === '웅크리기' ? '유지 중' : sk.cc && sk.cc.stun ? '상대 기절 중' : sk.name === '포효' ? '상대 도발 중' : '사용 불가' }
  }
  if (name === '처형' && !(B.hp < dB.maxhp * 0.25)) return { usable: false, reason: '상대 HP 25%↓ 필요' }
  if ((name === '암습' || name === '돌진') && B.stun > 0) return { usable: false, reason: '상대 기절 중' }
  if ((name === '화염구' || name === '메테오' || name === '서리구') && A.cast > 0) return { usable: false, reason: '시전 중' }
  if (name === '인스턴트캐스팅' && A.instCast > 0) return { usable: false, reason: '즉시시전 중' }
  if (name === '방패들기' && A.blockUp > 0) return { usable: false, reason: '유지 중' }
  if ((name === '룬각인' || name === '피의격노') && A.powBuff > 0) return { usable: false, reason: '유지 중' }
  if (name === '백스텝' && A.dodgeUp > 0) return { usable: false, reason: '유지 중' }
  if (name === '마법반사' && A.magReflect > 0) return { usable: false, reason: '유지 중' }
  if (name === '오토스펠' && A.autoSpell > 1) return { usable: false, reason: '유지 중' }
  // 버프 유지 중엔 재사용 방지(직관적 비활성 + 낭비 방지)
  if (name === '볼트마법조합' && A.chainBolt > 1) return { usable: false, reason: '유지 중' }
  return { usable: true }
}
function playerOptions (state) {
  const { A, B, meName, dA, dB } = state; const sks = skillsOf(A)
  const stunned = A.stunned === true
  const casting = A.cast > 0 && !A.castUninterruptible // 끊기 가능 시전 중: 진행/취소만 노출(끊기불가는 자동진행)
  const stunSk = stunned ? stunSkill(A, B, dA, dB) : null // 기절 중 유일하게 쓸 수 있는 스킬 이름
  // 인캐(instCast) 중 즉발 여부 힌트: 화염구=즉시 / 메테오=즉발불가(인캐 낭비 방지 안내)
  const one = (slot) => { const skdef = sks[slot]; const nm = skdef.combo ? skdef.stageName(A) : skdef.name; let u = playerCanUse(state, slot); if (stunned) u = (skdef.name === stunSk) ? { usable: true } : { usable: false, reason: '기절' }; const inst = A.instCast > 0 ? ((nm === '화염구' || nm === '서리구') ? '즉시' : nm === '메테오' ? '즉발불가' : null) : null; let base = skillCd(skdef); if (A.chainBolt > 0 && BOLT_SPECS[nm]) base = '시전'; return { name: nm, base, usable: u.usable, reason: u.reason, inst, comboLvl: skdef.combo ? skdef.stageLevel(A) : -1, cost: skdef.cost ? `${RES_LABEL[skdef.res]}${skdef.cost}` : null } } // 볼트마법조합 중엔 콜드도 시전 / 모핑 콤보는 단계별 이름·레벨
  return { canDefend: !stunned && A.taunt === 0 && A.noDefend === 0, skills: sks.map((_, i) => one(i)), passives: PASSIVES[meName] || [], stunned, taunted: A.taunt > 0, casting, castName: casting ? (A.castName || '시전') : null, castLeft: A.cast, castTotal: A.castTotal }
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
    물공: Math.round(c.힘 * (1 + step(c.힘, 10) / 100) * (c.체력 === 100 && w.hands === 1 ? 1.3 : 1) * (c.솜씨 === 100 && c.무기 === '활' ? 1.05 : 1) * (c.행운 === 100 && c.무기 === '주사위' ? 1.2 : 1)),
    마공: Math.round(c.지능 * (1 + step(c.지능, 10) / 100)),
    // 턴: 무기 반영(tempoVal) — derive와 동일 공식
    턴: Math.round(Math.max((10 - step(tempoVal(w, c), 0.7)) * (w.tempoMul || 1), 2) * 10) / 10
  }
}
function randomMatch (me, exclude) { const pool = NAMES.filter(n => n !== me && n !== exclude); return { opp: pickArr(pool.length ? pool : NAMES.filter(n => n !== me)), ai: pickArr(AIS) } } // exclude: 상대 재선택 시 직전 상대 제외

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
  const btns = NAMES.map(btn)
  btns.push(new ButtonBuilder().setCustomId(id('__RAND__')).setLabel('🎲 랜덤').setStyle(ButtonStyle.Primary)) // 내 캐릭 랜덤 선택
  const rows = []
  for (let i = 0; i < btns.length; i += 5) rows.push(new ActionRowBuilder().addComponents(btns.slice(i, i + 5)))
  return rows
}
// 상대(고정) 선택 화면 — 내 캐릭 고른 뒤 상대를 직접 고름(🎲 랜덤 가능). 미러 매치 허용.
function buildOppSelectEmbed (me) {
  return new EmbedBuilder()
    .setTitle('⚔️ 듀얼 — 상대 선택')
    .setDescription(`${CHARS[me].emoji} **${me}**(으)로 맞설 상대를 골라줘! (🎲 랜덤 = 나 제외 무작위)`)
    .setColor(0x5865f2)
    .addFields(NAMES.map(n => ({ name: `${CHARS[n].emoji} ${n}`, value: `${CHARS[n].id}`, inline: true })))
}
function buildOppSelectRows (me, memberId) {
  const id = (opp) => JSON.stringify({ action: 'duel', op: 'pickopp', me, opp, memberId })
  const btn = (opp) => new ButtonBuilder().setCustomId(id(opp)).setLabel(`${CHARS[opp].emoji} ${opp}`).setStyle(ButtonStyle.Secondary)
  const btns = NAMES.map(btn)
  btns.push(new ButtonBuilder().setCustomId(id('__RAND__')).setLabel('🎲 랜덤 상대').setStyle(ButtonStyle.Primary))
  btns.push(new ButtonBuilder().setCustomId(JSON.stringify({ action: 'duel', op: 'back', memberId })).setLabel('🔙 내 캐릭').setStyle(ButtonStyle.Secondary))
  const rows = []
  for (let i = 0; i < btns.length; i += 5) rows.push(new ActionRowBuilder().addComponents(btns.slice(i, i + 5)))
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
    new ButtonBuilder().setCustomId(cid('reroll', { char: me, opp })).setLabel('🎲 상대 다시').setStyle(ButtonStyle.Secondary), // opp=직전 상대 → 제외 랜덤
    new ButtonBuilder().setCustomId(cid('reopp', { char: me })).setLabel('🔀 상대 변경').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(cid('back', {})).setLabel('🔙 캐릭 변경').setStyle(ButtonStyle.Secondary)
  )
}

// 이벤트 → 자연스러운 RPG 로그 한 줄
function narrateLine (ev, meName, oppName) {
  const A = ev.who === 'me' ? meName : oppName
  const T = ev.who === 'me' ? oppName : meName
  const ae = CHARS[A].emoji; const te = CHARS[T].emoji
  const hurt = (n) => `${te} **${T}**${eun(T)} **${Math.round(n)}**${ev.crit ? '!!' : ''}의 피해를 입었다.` // 치명타=숫자 bold + !!
  // 피해 내역: 세이지 혼합(물/마) · 완드 연쇄볼트(발당) · 기본
  // 내역은 흡수(마나실드) 전 값이라, 실제 피해(ev.dmg)에 비례 재배분해 총합과 일치시킴
  const hurtBd = () => {
    if (ev.yukHits) { // 무도가 육합권 프록: 평타(다단2) + 육합권(3타) 동시 파바박 — 한 줄 분리 표기
      const fmt = (arr) => (arr || []).map(h => h > 0 ? `**${h}**` : '빗나감').join('·')
      return `${te} **${T}**${eun(T)} 👊연타(${fmt(ev.autoHits)}) + ⚡육합권 발동!(${fmt(ev.yukHits)}) 총 **${ev.dmg}**의 피해를 입었다.`
    }
    if (ev.ph != null) { // 세이지 혼합: 물리 + 마법평타 + 오토스펠 볼트(원소묶음)
      const boltRaw = (ev.boltHits || []).reduce((a, b) => a + b, 0)
      const raw = ev.ph + ev.mg + boltRaw
      if (raw <= 0) return hurt(ev.dmg)
      const ph = Math.round(ev.ph / raw * ev.dmg); const mg = Math.round(ev.mg / raw * ev.dmg); const boltTotal = ev.dmg - ph - mg
      let s = mg > 0 ? `물리 **${ph}** + 마법 **${mg}**` : (ph > 0 ? `물리 **${ph}**` : '')
      if (ev.boltHits && ev.boltHits.length && boltTotal > 0) s += (s ? ' + ' : '') + boltGroupStr(ev.boltHits, ev.boltNames, boltTotal)
      return `${te} **${T}**${eun(T)} ${s} (총 **${ev.dmg}**)의 피해를 입었다.`
    }
    if (ev.boltHits && ev.boltHits.length > 1) { const combo = ev.boltCombo ? '🔗**원소조합!** ' : ''; return `${te} **${T}**${eun(T)} ${combo}✨${boltGroupStr(ev.boltHits, ev.boltNames, ev.dmg)} 총 **${ev.dmg}**의 피해를 입었다.` }
    if (ev.multiHits && ev.multiHits.length > 1) { const mhl = ev.name === '연발사격' ? '🏹연사' : '👊연타'; return `${te} **${T}**${eun(T)} ${mhl} ${ev.multiHits.map(h => h > 0 ? `**${h}**` : '빗나감').join('·')} 총 **${ev.dmg}**의 피해를 입었다.` }
    if (ev.holy > 0 || ev.repent > 0) { const h = ev.holy || 0; const r = ev.repent || 0; const ph = Math.max(ev.dmg - h - r, 0); const parts = []; if (ph > 0) parts.push(`물리 **${ph}**`); parts.push(`🙏신성 **${h}**${r > 0 ? ` +참회 **${r}**` : ''}`); return `${te} **${T}**${eun(T)} ${parts.join(' + ')}${ph === 0 ? '(물리 회피)' : ''} (총 **${ev.dmg}**)의 피해를 입었다.` } // 프리스트 신성한의무: 물리 + 신성 스플래시(+참회) 분리 표기
    return hurt(ev.dmg)
  }
  const boltTag = ev.boltName ? `✨**${ev.boltName}** 발동! ` : ''
  // 방어 성공(피해는 일부 들어간 경우) 태그
  const defTag = ev.def === '완벽방어' ? ` 🛡️✨**${T} 완벽방어!**(반격 ${ev.selfDmg})` : (ev.def === '방패막기' || ev.def === '무기막기') ? ` 🛡️*${T} ${ev.def}!*` : (ev.def === '행운의여신' ? ' 🍀**행운의 여신!**(피해 1)' : '')
  const tkTag = ev.tukyung > 0 ? ` 💢**투경${ev.tukyung > 1 ? '×' + ev.tukyung : ''}!**(방어 무시)` : '' // 무도가 투경: 방어 무시 히트 수
  const parryTag = ev.parried ? ` 🥊**${T} 패링!**(경감·즉시 반격)` : '' // 무도가 패링 성공: 방어태세 중 피격을 흘리고 반격턴
  const brokeTag = ev.broke ? ` ⚡**${T} 시전 중단!**` : ''
  const meteorTag = ev.meteorImmune ? ` 🌠**하지만 ${T}의 메테오 시전은 막을 수 없다!**` : ''
  const forceTag = ev.dmgType === '역장' ? '🟣' : ev.dmgType === '신성' ? '🙏' : ev.dmgType === '암흑' ? '⚰️' : '' // 역장/신성/암흑피해 마커 — 스킬 dmgType 기반
  const shieldTag = ev.shieldAbsorb > 0 ? ` 🔷*마나실드 ${ev.shieldAbsorb} 흡수*` : '' // 피격으로 상대 시전 차단
  const grazeTag = (ev.grazed && !ev.crit) ? ' 🌫️*빗맞음*' : '' // 비껴맞음(×0.70) — 치명타와 공존 시 표기 생략
  const diceTag = (ev.diceAtk ? ` 🎲**공격 ${ev.diceAtk}**${ev.diceAtk === 20 ? '💥대성공!' : ev.diceAtk === 1 ? '💢대실패!' : ''}` : '') +
    (ev.diceDef ? ` 🎲**방어 ${ev.diceDef}**(${T})${ev.diceDef === 20 ? '🛡️완벽!' : ev.diceDef === 1 ? '💢실패!' : ''}` : '') // 갬블러 주사위 굴림 표시(공격=자기 평타 d20 / 방어=피격 시 d20)
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
      return `${ev.ph != null ? '⚔️' : (ev.bolt ? '✨' : '⚔️')} ${ae} **${A}**의 ${ev.ph != null ? '혼합 공격' : '공격'}!${diceTag} ${boltTag}${defTag}${parryTag}${tkTag}${grazeTag}${shieldTag}${hurtBd()}${brokeTag}`
    case 'skill': {
      const noteNorm = (s) => (s || '').replace(/[\s!·.,]/g, '') // 공백·느낌표·중점 등 무시하고 비교
      const head = `⚡ ${ae} **${A}**${iga(A)} '${ev.name}'${eul(ev.name)} 사용!${(ev.note && noteNorm(ev.note) !== noteNorm(ev.name)) ? ` [${ev.note}]` : ''}` // note가 스킬명과 (정규화 후)다를 때만 표시(중복 제거)
      const healTag = ev.selfHeal > 0 ? ` 💚**${A}** 체력 **${ev.selfHeal}** 회복 (HP ${ev.selfHp}/${ev.selfMax})` : '' // 힐·회복기 회복량+현재체력
      { const back = ev.selfDmg > 0 ? (ev.def === '완벽방어' ? '' : ` (**${A}** 반동 **${ev.selfDmg}**)`) : '' // 완벽방어 반사는 defTag(반격 X)로 표기 — 반동과 구분
        if (ev.dmg > 0) return `${head}${diceTag} ${boltTag}${forceTag}${defTag}${parryTag}${tkTag}${grazeTag}${shieldTag}${hurtBd()}${brokeTag}${meteorTag}${healTag}${back}`
        if (ev.shieldAbsorb > 0) return `${head} 🔷 ${te} **${T}**${iga(T)} 마나실드로 **${ev.shieldAbsorb}** 흡수!${healTag}${back}` // dmg는 0이지만 실드가 전부 흡수 — 흡수량 표시(마나소각 등)
        if (ev.name === '화염구') return head // 시전 시작(딜 없음)
        if (!ev.attacked) return `${head}${healTag}${back}` // 공격 안 하는 버프/방어 스킬(마력충전 등) → 미스 문구 없이
        const miss = ev.shieldAbsorb > 0 ? `하지만 ${T}${iga(T)} 마나실드로 **${ev.shieldAbsorb}** 모두 흡수 🔷` : ev.def === '회피' ? `하지만 ${T}${iga(T)} 회피했다 💨` : (ev.def === '천운' || ev.def === '완전회피') ? `하지만 ${T}${iga(T)} 천운으로 흘렸다 🍀` : '하지만 공격은 빗나갔다 💨'
        return `${head} ${miss}${brokeTag}${meteorTag}${back}` }
    }
    case 'defend': return `${ev.parry ? '🥊' : '🛡️'} ${ae} **${A}**${eun(A)} ${ev.parry ? '패링 태세! (피격 시 흘려내고 반격)' : '방어 태세!'}${ev.heal > 0 ? ` 체력을 **${ev.heal}** 회복` : ''} (HP ${ev.selfHp}/${ev.selfMax})`
    case 'sanctuary': { const bits = []; if (ev.heal > 0) bits.push(`체력 **${ev.heal}** 회복`); if (ev.dmg > 0) bits.push(`${te} **${T}**에게 🙏신성 **${ev.dmg}**${ev.repent > 0 ? ` +참회 **${ev.repent}**` : ''}`); return `🙏 ${ae} **${A}** 성역${bits.length ? ' — ' + bits.join(' · ') : ' 유지'} (HP ${ev.selfHp}/${ev.selfMax})` }
    case 'darkzone': return `⚰️ ${ae} **${A}**의 암흑지대 — ${te} **${T}**에게 암흑 **${ev.dmg}**${ev.selfDmg > 0 ? ` · 자신도 침식되며 **${ev.selfDmg}** 피해` : ''}`
    case 'undeadHold': return `⚰️ ${ae} **${A}**${eun(A)} 살아있는 시체 — 체력이 1 아래로 떨어지지 않는다! (${ev.left > 0 ? `무적 ${ev.left}턴 남음` : '무적 곧 종료'})`
    case 'deathmark': return `☠️ ${ae} **${A}**의 육신이 무너진다! 회복하지 못한 시체가 스러졌다…`
    case 'shift': { const F = DRUID_FORMS[ev.to]; return ev.to === '인간' ? `🧝 ${ae} **${A}**${iga(A)} 형상을 풀고 인간의 모습으로 돌아왔다. (HP ${ev.selfHp}/${ev.selfMax})` : `${F.emoji} ${ae} **${A}**${iga(A)} **${ev.to}** 형상으로 변신했다!${ev.rage ? ` 😤분노 ${ev.rage}` : ''} (HP ${ev.selfHp}/${ev.selfMax})` }
    case 'druregen': return `🌿 ${ae} **${A}**${eun(A)} 재생의 힘으로 체력 **${ev.heal}** 회복 (HP ${ev.selfHp}/${ev.selfMax})`
    case 'stardot': { const bits = []; if (ev.star > 0) bits.push(`별빛쇄도 ${ev.star}턴`); if (ev.meteor > 0) bits.push(`별똥별 ${ev.meteor}턴`); return `🌟 ${ae} **${A}**${iga(A)} 쏟아지는 별빛에 **${ev.dmg}** 피해!${ev.absorbed > 0 ? ` 🔷*마나실드 ${ev.absorbed} 흡수*` : ''}${bits.length ? ` (${bits.join(' · ')} 남음)` : ''}` }
    case 'trapspring': return `🪤 ${ae} **${A}**${iga(A)} 사냥꾼덫을 밟았다! 발이 묶이고(둔화) 🩸출혈 시작!`
    case 'bleed': return `🩸 ${ae} **${A}**${eun(A)} 출혈로 **${ev.dmg}** 피해!${ev.left > 0 ? ` (출혈 ${ev.left}턴 남음)` : ''}`
    case 'gash': { const gp = []; if (ev.cut > 0) gp.push(`절개${ev.cut}`); if (ev.lac > 0) gp.push(`열상${ev.lac}`); return `🩸 ${ae} **${A}**${eun(A)} 출혈로 **${ev.dmg}** 피해!${gp.length ? ` (${gp.join('·')})` : ''}` }
    case 'ko': return `💀 ${ae} **${A}**${iga(A)} 쓰러졌다! 체력이 바닥났다.`
    case 'skip': return `⏭️ ${ae} **${A}**${iga(A)} 턴을 넘겼다.`
    case 'surrender': return `🏳️ ${ae} **${A}**${iga(A)} 기권했다. 승부를 포기하고 물러난다…`
    case 'stun': { const base = `😵 ${ae} **${A}**${eun(A)} 기절해 움직이지 못한다.${ev.stunLeft > 0 ? ` (기절 ${ev.stunLeft}턴 남음)` : ' 💫 다음 턴 해제!'}`; return ev.castName ? `${base} 🔮 하지만 ${ev.castName} 시전은 멈추지 않는다… **[${ev.castTotal - ev.castLeft}/${ev.castTotal}]**` : base }
    case 'paralyze': return `⚡ ${ae} **${A}**${eun(A)} 몸이 저려 움직이지 못한다! (마비${ev.paralyzeLeft > 0 ? ` ${ev.paralyzeLeft}턴 남음` : ' 해제'})`
    case 'cast': return `🔮 ${ae} **${A}**${iga(A)} ${ev.spell || '화염구'}${eul(ev.spell || '화염구')} 시전하고 있다… ${ev.total ? `**[${ev.total - ev.left}/${ev.total}]**` : ''}`
    case 'castfire': {
      const sp = ev.spell || '화염구'
      if (ev.dmg <= 0) return `🍀 ${te} **${T}**${iga(T)} ${ae} **${A}**의 ${sp}${eul(sp)} 천운으로 흘려냈다!`
      if (ev.bolt && ev.boltHits && ev.boltHits.length) { const combo = ev.boltNames && new Set(ev.boltNames).size > 1 ? '🔗**원소조합!** ' : ''; return `☄️ ${ae} **${A}**의 ${sp} 작렬!${parryTag} ${combo}${te} **${T}**${eun(T)} ✨${boltGroupStr(ev.boltHits, ev.boltNames, ev.dmg)} 총 **${ev.dmg}**의 피해를 입었다.` } // 시전형 볼트: 발당 분해 표시(파이어볼트(1·3·2·1·4))
      return `☄️ ${ae} **${A}**의 ${sp}${iga(sp)} 작렬!${parryTag} ${hurt(ev.dmg)}`
    }
    case 'castcancel': return `✋ ${ae} **${A}**${iga(A)} ${ev.spell || '시전'}${eul(ev.spell || '시전')} 스스로 취소했다. (다음 시전 -1턴)`
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
  const deb = []; const buf = []
  // 디버프(남은턴 표기)
  if (f.stun > 0) deb.push(`😵기절${f.stun}`)
  if (f.taunt > 0) deb.push(`🗯️도발${f.taunt}(강제평타)`)
  if (f.paralyze > 0) deb.push(`⚡마비${f.paralyze}`)
  if (f.vuln > 0 || f.instVuln > 0) deb.push(`💥취약${Math.max(f.vuln, f.instVuln)}`)
  if (f.slow > 0) deb.push(`🐢둔화${f.slow}`)
  if (f.silence > 0) deb.push(`🔇침묵${f.silence}`)
  if (f.luckLock > 0) deb.push(`🍀봉인${f.luckLock}`)
  if (f.blind > 0) deb.push(`🌀실명${f.blind}`)
  if (f.noDefend > 0) deb.push(`🚫방어불가${f.noDefend}`)
  if (f.healBlock > 0) deb.push(`💔회복불가${f.healBlock}`)
  if (f.missDown > 0) deb.push(`🎯명중↓${f.missDown}`)
  if (f.sunder > 0) deb.push(`💢방어약화${f.sunder}`)
  if (f.passiveLock > 0) deb.push(`🔒패시브봉인${f.passiveLock}`)
  if (f.weaponBroken > 0) deb.push(`🔨무기파괴${f.weaponBroken}`)
  if (f.crush > 0) deb.push(`🪓분쇄${f.crush}(방어 -${f.crush * 5}%p)`)
  if (f.cutStk > 0) deb.push(`🩸절개${f.cutStk}(${(f.cutStk * 1.5)}%/턴)`)
  if (f.lacStk > 0) deb.push(`🩸열상${f.lacStk}(${(f.lacStk * (f.cutStk > 0 ? 2.5 : 1.5))}%/턴)`)
  if (f.healCut > 0) deb.push(`💔회복↓${f.healCut}`)
  if (f.erosion > 0) deb.push(`⚰️침식${f.erosion}(최대체력 -${f.erosion * 5}%)`)
  if (f.undead) deb.push(f.deathDoom ? `☠️시체 무적${f.deathMark}(회복 못하면 사망)` : `⚰️시체 무적${f.deathMark}(즉사 해제)`)
  if (f.trap > 0) deb.push(`🪤덫${f.trap}`)
  if (f.bleed > 0) deb.push(`🩸출혈${f.bleed}`)
  if (f.starDot > 0) deb.push(`🌟별빛쇄도${f.starDot}`)
  if (f.meteorDot > 0) deb.push(`☄️별똥별${f.meteorDot}`)
  if (f.form) { // 드루이드: 형상·자원·재생
    buf.push(`${DRUID_FORMS[f.form].emoji}${f.form}`)
    if (f.form === '전투곰') buf.push(`😤분노 ${f.druRage}/${RAGE_MAX}`)
    if (f.form === '표범' || f.form === '치타') buf.push(`⚡기력 ${f.druEnergy}/${ENERGY_MAX}`)
    if (f.druRegen > 0) buf.push(`🌿재생${f.druRegen}`)
    if (f.bearRegen > 0) buf.push(`🐻광포한재생력${f.bearRegen}`)
    if (f.catRegen > 0) buf.push(`🐅자연의재생력${f.catRegen}`)
    if (f.crouch > 0) buf.push(`🐾웅크리기${f.crouch}`)
    if (f.stealth > 0) buf.push('🌑은신')
  }
  // 버프(남은턴/스택 표기)
  if (f.rage > 0) buf.push(`🔥광폭${f.rage}`)
  if (f.powBuff > 0) buf.push(`💪공격강화${f.powBuff}`)
  if (f.blockUp > 0) buf.push(`🛡️방패강화${f.blockUp}`)
  if (f.dodgeUp > 0) buf.push(`🌀회피${f.dodgeUp}`)
  if (f.magReflect > 0) buf.push('🔮마법반사(다음 마법)')
  if (f.luckBuff > 0) buf.push(`🍀행운폭주${f.luckBuff}`)
  if (f.diceAdv > 0) buf.push(`🎲어드밴티지${f.diceAdv}`)
  if (f.chainBolt > 0) buf.push(`🔗볼트마법조합${f.chainBolt}`)
  if (f.autoSpell > 0) buf.push(`📜주문각인${f.autoSpell}`)
  if (f.healRegen > 0) buf.push(`💚재생${f.healRegen}`)
  if (f.instCast > 0) buf.push(`⚡즉시시전${f.instCast}`)
  if (f.graze100 > 0) buf.push(`🎯완전이해${f.graze100}`)
  if (f.haste > 0) buf.push(`💨가속${f.haste}`)
  if (f.sanctuary > 0) buf.push(`🙏성역${f.sanctuary}`)
  if (f.blessTurns > 0) buf.push(`✨축복${f.blessTurns}`)
  if (f.aegisTurns > 0) buf.push(`🛡️가호${f.aegisTurns}`)
  if (f.repentStack > 0) buf.push(`🙏참회 ${f.repentStack}스택(${(f.repentStack * 0.7).toFixed(1)}%)`) // 프리스트 본인 버프(다음 신성딜에 상대 최대체력 비례 추가딜)
  if (f.frenzy > 0) buf.push(`🩸광란가속 ${f.frenzy}스택(턴 −${f.frenzy * 3}%)`) // 광전사 본인 버프(피의갈증 유지 시 턴 가속, 디스펠 가능)
  if (f.enchant) buf.push(`${ENCHANT_EMO[f.enchant] || '✨'}${f.enchant}인챈트${f.enchantTurns}`) // 스블 마검 인챈트(역장베기 강화)
  if (f.darkZone > 0) buf.push(`⚰️암흑지대${f.darkZone}`)
  if (f.darkWard > 0) buf.push(`🌑심연의포옹${f.darkWard}(받는뎀↓)`)
  if (f.thornsBase > 0) buf.push('🌵가시') // 상시 패시브(턴 없음)
  if (f.shield > 0) buf.push(`🔷실드${f.shield}`)
  if (f.cast > 0) { const tot = f.castTotal || f.cast; buf.push(`🔮${f.castName || '시전'} ${tot - f.cast}/${tot}`) }
  return { buffs: buf, debuffs: deb }
}
// 공개된 마지막 로그 시점의 프레임(HP·버프·디버프) — 순차공개 동기화. 완전 공개면 라이브 상태
function frameAt (state, shown) {
  if (shown == null || shown >= state.log.length) return snapFrame(state)
  for (let i = shown - 1; i >= 0; i--) { const ev = state.log[i]; if (ev.aHp != null) return ev }
  return snapFrame(state)
}
function buildBattleEmbed (state) {
  const { meName, oppName, memberId, meTitle, oppTitle, oppAI, oppNick } = state
  const shown = state.shown == null ? state.log.length : state.shown // 순차 공개: 공개된 로그까지만
  const recent = state.log.slice(0, shown).slice(-8).map(ev => narrateLine(ev, meName, oppName))
  const footer = state.revealing ? '⏳ 진행 중…' : '🎯 **네 차례!** 행동을 골라줘'
  const fr = frameAt(state, shown) // 공개 시점 프레임(체력·버프·디버프 실시간 동기화)
  const buffLine = (s) => s ? `🟢 ${s}\n` : '' // 버프 = 캐릭명 위
  const debLine = (s) => s ? `🔴 ${s}\n` : '' // 디버프 = 캐릭명 아래
  const cdLine = (nm, f) => { const sks = skillsOf(f); if (!sks || !f.cd) return ''; return `⏳ ${f.form ? DRUID_FORMS[f.form].emoji + f.form + ' · ' : ''}${sks.map((sk, i) => `${sk.name} ${f.cd[i] > 0 ? f.cd[i] : '✅'}`).join(' · ')}\n` } // 상대 스킬 쿨 실시간(정보대칭)
  const eMax = (base, f) => Math.round(base * (1 - Math.min(f.erosion || 0, 10) * 0.05)) // 침식: 최대체력 표시에 반영(스택당 -5%). 침식이 "피해"가 아니라 "피통 감소"로 읽히게
  const desc =
    // 상단: 상대 (버프 위 · 이름 · 디버프 아래 · HP)
    buffLine(fr.bBuf) +
    `${CHARS[oppName].emoji} **${oppName}**: ${titleTag(oppTitle)} **${oppNick}** · ${oppAI} AI\n` +
    debLine(fr.bDeb) +
    `\`${hpBar(fr.bHp, eMax(state.maxB, state.B), 18)}\`\n` +
    cdLine(oppName, state.B) +
    '\n' +
    // 중앙: 로그
    (recent.length ? recent.join('\n') + '\n\n' : '') +
    // 하단: 나 (버프 위 · 이름 · 디버프 아래 · HP — 버튼 바로 위)
    buffLine(fr.aBuf) +
    `${CHARS[meName].emoji} **${meName}**: ${titleTag(meTitle)} <@${memberId}>\n` +
    debLine(fr.aDeb) +
    `\`${hpBar(fr.aHp, eMax(state.maxA, state.A), 18)}\`\n` +
    footer
  return new EmbedBuilder().setTitle('⚔️ 듀얼 — 전투 중').setColor(0x3498db)
    .setDescription(desc.length > 4090 ? '…' + desc.slice(-4089) : desc)
}
function buildBattleRow (state) {
  const o = playerOptions(state); const mid = state.memberId
  const cid = (c) => JSON.stringify({ action: 'duel', op: 'act', c, memberId: mid })
  // 시전 중(메테오 제외): 턴넘기기=시전 진행 + 시전 취소 두 버튼만
  if (o.casting) {
    const tot = o.castTotal || o.castLeft
    return [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(cid('skip')).setLabel(`🔮 시전 진행 · ${o.castName} ${tot - o.castLeft}/${tot}`).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(cid('castcancel')).setLabel('✋ 시전 취소').setStyle(ButtonStyle.Danger)
    )]
  }
  const skLbl = (s) => {
    if (!s.usable) return `${s.name} · ${s.reason}`
    const pre = s.inst === '즉시' ? '⚡' : '✨'
    const suf = s.inst ? ` · ${s.inst}` : ''
    return `${pre} ${s.name}${suf}${typeof s.base === 'number' ? ` (쿨${s.base})` : (s.base ? ` (${s.base})` : '')}${s.cost ? ` · ${s.cost}` : ''}`
  }
  // 1줄=행동(공격/방어), 2줄=스킬(+패시브) — 스킬 쿨타임 항상 노출. 스킬 4개까지 대비
  const actionBtns = [
    new ButtonBuilder().setCustomId(cid('attack')).setLabel(o.stunned ? '⚔️ 공격 · 기절' : '⚔️ 공격').setStyle(ButtonStyle.Danger).setDisabled(o.stunned),
    (() => { const isParry = WEAPONS[CHARS[state.meName].무기].방어 === '패링'; const emo = isParry ? '🥊' : '🛡️'; const dl = isParry ? '패링' : '방어'; return new ButtonBuilder().setCustomId(cid('defend')).setLabel(o.canDefend ? `${emo} ${dl}` : (o.stunned ? `${emo} ${dl} · 기절` : `${emo} ${dl} · 봉쇄`)).setStyle(ButtonStyle.Secondary).setDisabled(!o.canDefend) })(),
    new ButtonBuilder().setCustomId(cid('skip')).setLabel('⏭️ 턴넘기기').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(cid('surrender')).setLabel('🏳️ 기권').setStyle(ButtonStyle.Secondary)
  ]
  const skillBtns = []
  // 모핑 콤보 색상: 육합권=파랑(기본) → 연환전신장=녹색 → 맹룡과강=빨강(점차 강해짐). 콤보 진행(lvl≥1) 시 🔥
  o.skills.forEach((sk, i) => { const lvl = sk.comboLvl; const style = lvl === 2 ? ButtonStyle.Danger : lvl === 1 ? ButtonStyle.Success : ButtonStyle.Primary; const pre = (lvl >= 1) ? '🔥' : ''; skillBtns.push(new ButtonBuilder().setCustomId(cid('s' + i)).setLabel(pre + skLbl(sk)).setStyle(style).setDisabled(!sk.usable)) })
  const passiveBtns = o.passives.map((p, i) => new ButtonBuilder().setCustomId(cid('passive' + i)).setLabel(`🔒 ${p.name}(패시브)`).setStyle(ButtonStyle.Secondary).setDisabled(true))
  const rows = [new ActionRowBuilder().addComponents(actionBtns)] // 1줄: 공격·방어·턴넘기기·기권
  if (skillBtns.length) rows.push(new ActionRowBuilder().addComponents(skillBtns.slice(0, 5))) // 2줄: 액티브 스킬
  if (passiveBtns.length) rows.push(new ActionRowBuilder().addComponents(passiveBtns.slice(0, 5))) // 3줄: 패시브 스킬(별도 행)
  return rows
}
// 선택형 스킬 서브메뉴(스블 마검 인챈트): 룬각인 누르면 이 3버튼 표시 → op 'enchant'로 선택
function buildEnchantRow (mid, slot) {
  const cid = (e) => JSON.stringify({ action: 'duel', op: 'enchant', e, slot, memberId: mid })
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(cid('화염')).setLabel('🔥 화염 · 딜↑').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(cid('얼음')).setLabel('❄️ 얼음 · 둔화').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(cid('전격')).setLabel('⚡ 전격 · 마비').setStyle(ButtonStyle.Secondary)
  )
}
// 드루이드 형상변환 선택: 5형상 버튼(현재 형상 자리는 ↩️ 취소 — 원래 행동 선택으로)
function buildFormRow (mid, slot, cur) {
  const cid = (f) => JSON.stringify({ action: 'duel', op: 'form', f, slot, memberId: mid })
  return new ActionRowBuilder().addComponents(DRUID_ORDER.map(k => k === cur
    ? new ButtonBuilder().setCustomId(JSON.stringify({ action: 'duel', op: 'formback', memberId: mid })).setLabel(`↩️ 취소(${DRUID_FORMS[k].emoji}${k})`).setStyle(ButtonStyle.Secondary)
    : new ButtonBuilder().setCustomId(cid(k)).setLabel(`${DRUID_FORMS[k].emoji} ${k}`).setStyle(k === '인간' ? ButtonStyle.Secondary : ButtonStyle.Primary)))
}
// 올인!! 베팅 선택(체력 몇 %를 걸지) — 룬각인 인챈트와 동일한 choose 서브메뉴 패턴
function buildBetRow (mid, slot) {
  const cid = (pct) => JSON.stringify({ action: 'duel', op: 'bet', pct, slot, memberId: mid })
  return new ActionRowBuilder().addComponents(
    [99, 70, 50, 30, 10].map(p => new ButtonBuilder().setCustomId(cid(p)).setLabel(`체력배팅(${p}%)`).setStyle(p >= 70 ? ButtonStyle.Danger : p >= 30 ? ButtonStyle.Primary : ButtonStyle.Secondary))
  )
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
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
  } catch (e) { state.revealing = false; state.shown = target } // 편집 실패 시 상태 정리(다음 클릭에서 복구)
}
async function handleButton (interaction, info) {
  if (interaction.user.id !== info.memberId) {
    await interaction.reply({ content: '이건 다른 사람의 듀얼이야~ `/듀얼`로 직접 시작해봐! ⚔️', ephemeral: true })
    return
  }
  const mid = info.memberId
  if (info.op === 'pick') {
    const me = info.char === '__RAND__' ? pickArr(NAMES) : info.char // 내 캐릭 랜덤/고정 → 상대 선택 화면
    await interaction.update({ embeds: [buildOppSelectEmbed(me)], components: buildOppSelectRows(me, mid) })
  } else if (info.op === 'reopp') {
    await interaction.update({ embeds: [buildOppSelectEmbed(info.char)], components: buildOppSelectRows(info.char, mid) })
  } else if (info.op === 'pickopp' || info.op === 'reroll') {
    const me = info.me || info.char
    let opp
    if (info.op === 'reroll') opp = randomMatch(me, info.opp).opp // 상대 다시: 직전 상대 제외 랜덤
    else if (info.opp === '__RAND__') opp = randomMatch(me).opp // 랜덤 상대(나 제외)
    else opp = info.opp // 고정 상대
    const ai = pickArr(AIS)
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
    // 기권: 즉시 패배 처리(내 체력 0 + winner=opp) 후 결과 화면
    if (info.c === 'surrender') {
      sess.state.A.hp = 0; sess.state.winner = 'opp'
      sess.state.log.push({ who: 'me', type: 'surrender' })
      await revealTurns(interaction, sess.state, 'end', { me: sess.me, opp: sess.opp, ai: sess.ai, mid, msgId: interaction.message.id })
      return
    }
    // 선택형 스킬(룬각인 인챈트 / 올인!! 베팅): 실행 전 서브메뉴 표시
    const m = /^s(\d+)$/.exec(info.c)
    if (m) { const slot = +m[1]; const sk = skillsOf(sess.state.A)[slot]; if (sk && sk.choose && playerCanUse(sess.state, slot).usable) { const row = sk.choose === 'bet' ? buildBetRow(mid, slot) : sk.choose === 'form' ? buildFormRow(mid, slot, sess.state.A.form) : buildEnchantRow(mid, slot); await interaction.update({ embeds: [buildBattleEmbed(sess.state)], components: [row] }); return } }
    const phase = playerResolve(sess.state, info.c)
    await revealTurns(interaction, sess.state, phase, { me: sess.me, opp: sess.opp, ai: sess.ai, mid, msgId: interaction.message.id })
  } else if (info.op === 'formback') { // 형상변환 메뉴 취소 → 원래 행동 버튼
    const sess = SESSIONS.get(interaction.message.id)
    if (!sess) { await interaction.reply({ content: '전투 정보가 만료됐어~ `/듀얼`로 다시 시작해줘! ⚔️', ephemeral: true }); return }
    sess.ts = Date.now()
    await interaction.update({ embeds: [buildBattleEmbed(sess.state)], components: buildBattleRow(sess.state) })
  } else if (info.op === 'enchant' || info.op === 'bet' || info.op === 'form') {
    const sess = SESSIONS.get(interaction.message.id)
    if (!sess) { await interaction.reply({ content: '전투 정보가 만료됐어~ `/듀얼`로 다시 시작해줘! ⚔️', ephemeral: true }); return }
    sess.ts = Date.now()
    if (info.op === 'enchant') sess.state.A.enchantChoice = info.e // 플레이어가 고른 인챈트 → 룬각인 exec가 사용
    else if (info.op === 'form') sess.state.A.formChoice = info.f // 플레이어가 고른 형상 → 형상변환이 사용
    else sess.state.A.betChoice = info.pct // 플레이어가 고른 베팅% → 올인!! exec가 사용
    const phase = playerResolve(sess.state, 's' + info.slot)
    await revealTurns(interaction, sess.state, phase, { me: sess.me, opp: sess.opp, ai: sess.ai, mid, msgId: interaction.message.id })
  }
}

function _tune (o) { Object.assign(TUNE, o) }
module.exports = { CHARS, NAMES, AIS, TITLES, TUNE, _tune, runBattle, buildSelectEmbed, buildSelectRows, handleButton, SKILLS, CUSTOM_DEFS, SKILL_POOL, PASSIVE_FLAGS, skillLine, skillsBlock, narrateLine, MAGIC_ELEM, ELEM_EMO, magicElem, isElemental, isPierce, derive, estAtk }
