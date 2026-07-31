const { Solar, Lunar } = require('lunar-javascript')

// 천간(天干) → 한글/오행
const GAN = {
  甲: ['갑', '목'],
  乙: ['을', '목'],
  丙: ['병', '화'],
  丁: ['정', '화'],
  戊: ['무', '토'],
  己: ['기', '토'],
  庚: ['경', '금'],
  辛: ['신', '금'],
  壬: ['임', '수'],
  癸: ['계', '수']
}
// 지지(地支) → 한글/오행/띠
const ZHI = {
  子: ['자', '수', '쥐'],
  丑: ['축', '토', '소'],
  寅: ['인', '목', '호랑이'],
  卯: ['묘', '목', '토끼'],
  辰: ['진', '토', '용'],
  巳: ['사', '화', '뱀'],
  午: ['오', '화', '말'],
  未: ['미', '토', '양'],
  申: ['신', '금', '원숭이'],
  酉: ['유', '금', '닭'],
  戌: ['술', '토', '개'],
  亥: ['해', '수', '돼지']
}
const WUXING_EMOJI = { 목: '🌳', 화: '🔥', 토: '⛰️', 금: '⚙️', 수: '💧' }

// 십신(十神)
const SHISHEN = {
  比肩: '비견',
  劫财: '겁재',
  食神: '식신',
  伤官: '상관',
  偏财: '편재',
  正财: '정재',
  七杀: '편관',
  偏官: '편관',
  正官: '정관',
  偏印: '편인',
  正印: '정인'
}
// 납음오행(納音) 30종
const NAYIN = {
  海中金: '해중금',
  炉中火: '노중화',
  大林木: '대림목',
  路旁土: '노방토',
  剑锋金: '검봉금',
  山头火: '산두화',
  涧下水: '간하수',
  城头土: '성두토',
  白蜡金: '백랍금',
  杨柳木: '양류목',
  泉中水: '천중수',
  屋上土: '옥상토',
  霹雳火: '벽력화',
  松柏木: '송백목',
  长流水: '장류수',
  沙中金: '사중금',
  山下火: '산하화',
  平地木: '평지목',
  壁上土: '벽상토',
  金箔金: '금박금',
  覆灯火: '복등화',
  天河水: '천하수',
  大驿土: '대역토',
  钗钏金: '차천금',
  桑柘木: '상자목',
  大溪水: '대계수',
  沙中土: '사중토',
  天上火: '천상화',
  石榴木: '석류목',
  大海水: '대해수'
}
// 서양 별자리
const XINGZUO = {
  白羊: '양자리',
  金牛: '황소자리',
  双子: '쌍둥이자리',
  巨蟹: '게자리',
  狮子: '사자자리',
  处女: '처녀자리',
  天秤: '천칭자리',
  天蝎: '전갈자리',
  射手: '사수자리',
  摩羯: '염소자리',
  水瓶: '물병자리',
  双鱼: '물고기자리'
}

// 십신 계산용: 천간 오행/음양
const GAN_WX = { 甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토', 己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수' }
const GAN_YY = { 甲: '양', 乙: '음', 丙: '양', 丁: '음', 戊: '양', 己: '음', 庚: '양', 辛: '음', 壬: '양', 癸: '음' }
const SHENG = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' } // A生B
const KE = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' } // A克B

// 일간 대비 대상 천간의 십신(한글)
function shiShenOf (dayGan, targetGan) {
  const dw = GAN_WX[dayGan]; const tw = GAN_WX[targetGan]
  const same = GAN_YY[dayGan] === GAN_YY[targetGan]
  if (dw === tw) return same ? '비견' : '겁재'
  if (SHENG[dw] === tw) return same ? '식신' : '상관' // 내가 생함
  if (KE[dw] === tw) return same ? '편재' : '정재' // 내가 극함
  if (KE[tw] === dw) return same ? '편관' : '정관' // 나를 극함
  if (SHENG[tw] === dw) return same ? '편인' : '정인' // 나를 생함
  return '?'
}
// 십신별 대운 시기 성격(한 줄)
const DAYUN_THEME = {
  비견: '자립·경쟁기',
  겁재: '승부·지출기',
  식신: '표현·여유기',
  상관: '재능·구설기',
  편재: '활동·재물기',
  정재: '안정·축적기',
  편관: '도전·시련기',
  정관: '명예·직위기',
  편인: '학문·직관기',
  정인: '귀인·성장기'
}

const gz2kr = (gz) => (gz && gz.length >= 2 && GAN[gz[0]] && ZHI[gz[1]]) ? GAN[gz[0]][0] + ZHI[gz[1]][0] : gz
const zhi2kr = (str) => String(str || '').split('').map(ch => (ZHI[ch] ? ZHI[ch][0] : ch)).join('')
const shishen = (s) => SHISHEN[s] || s

function decodePillar (ganZhi) {
  if (!ganZhi || ganZhi.length < 2) return null
  const gan = GAN[ganZhi[0]]; const zhi = ZHI[ganZhi[1]]
  if (!gan || !zhi) return null
  return { hanja: ganZhi, korean: gan[0] + zhi[0], ganWx: gan[1], zhiWx: zhi[1], animal: zhi[2] }
}

// gender: 1=남, 0=여, null=대운 미계산
function computeSaju ({ year, month, day, hour, calendar = 'solar', gender = null }) {
  const hasTime = hour != null
  const h = hasTime ? hour : 12
  const solar = calendar === 'lunar'
    ? Lunar.fromYmdHms(year, month, day, h, 0, 0).getSolar()
    : Solar.fromYmdHms(year, month, day, h, 0, 0)
  const lunar = solar.getLunar()
  const ec = lunar.getEightChar()

  const pillars = {
    year: decodePillar(ec.getYear()),
    month: decodePillar(ec.getMonth()),
    day: decodePillar(ec.getDay()),
    time: hasTime ? decodePillar(ec.getTime()) : null
  }

  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  for (const key of ['year', 'month', 'day', 'time']) {
    const p = pillars[key]
    if (!p) continue
    counts[p.ganWx]++; counts[p.zhiWx]++
  }

  const shiShen = {
    year: shishen(ec.getYearShiShenGan()),
    month: shishen(ec.getMonthShiShenGan()),
    time: hasTime ? shishen(ec.getTimeShiShenGan()) : null
  }
  const dayNaYin = NAYIN[ec.getDayNaYin()] || ec.getDayNaYin()
  const kongMang = zhi2kr(ec.getDayXunKong())
  const xingZuo = XINGZUO[solar.getXingZuo()] || solar.getXingZuo()

  let daYun = null
  if (gender != null) {
    const dayGan = pillars.day.hanja[0]
    const list = ec.getYun(gender).getDaYun()
    daYun = []
    for (let i = 1; i < list.length && daYun.length < 8; i++) {
      const d = list[i]
      const gz = d.getGanZhi()
      const sipsin = shiShenOf(dayGan, gz[0])
      daYun.push({ start: d.getStartAge(), end: d.getEndAge(), gz: gz2kr(gz), sipsin, theme: DAYUN_THEME[sipsin] || '' })
    }
  }

  return {
    pillars,
    counts,
    dayMaster: pillars.day.korean[0],
    dayMasterWx: pillars.day.ganWx,
    animal: pillars.year.animal,
    hasTime,
    shiShen,
    dayNaYin,
    kongMang,
    xingZuo,
    daYun,
    lunarDate: { year: lunar.getYear(), month: lunar.getMonth(), day: lunar.getDay() }
  }
}

function interpret (saju) {
  const { counts, dayMasterWx } = saju
  const entries = Object.entries(counts)
  const max = Math.max(...entries.map(e => e[1]))
  const strong = entries.filter(e => e[1] === max).map(e => e[0])
  const missing = entries.filter(e => e[1] === 0).map(e => e[0])
  const wxTrait = {
    목: '성장·추진력이 강하고 인정이 많은',
    화: '열정적이고 표현력이 뛰어난',
    토: '신중하고 신뢰감을 주는',
    금: '결단력 있고 원칙을 지키는',
    수: '지혜롭고 유연하게 흐르는'
  }
  const lines = []
  lines.push(`일간이 **${dayMasterWx}(${WUXING_EMOJI[dayMasterWx]})** — ${wxTrait[dayMasterWx]} 기질이 바탕이에요.`)
  if (strong.length <= 2) lines.push(`오행 중 **${strong.join('·')}** 기운이 강해요.`)
  if (missing.length) lines.push(`**${missing.join('·')}** 기운은 사주에 없어서, 그 부분을 채워주는 사람·환경과 잘 맞아요.`)
  else lines.push('오행이 두루 갖춰진 편이라 균형이 좋아요.')
  return lines.join('\n')
}

module.exports = { computeSaju, interpret, WUXING_EMOJI }
