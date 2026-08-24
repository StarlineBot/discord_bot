// 무리아스의 성수 '깡' 시뮬레이터
// 자료(2025.06.19 데이터마이닝) 기반: 102종 옵션 균등 1/102 등장 + 뜬 옵션은 유동폭 내 균등 수치.
// 성수 단가는 경매장(소모품>포션 '무리아스의 성수') 실시간 최저가를 명령어 실행 시 1회 조회해 사용.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { koreanGold } = require('./auction')

const LETTERS = 'ABCDEF'
// name + 티어별 [min,max] 목록 → {name,tier,min,max} 배열
const tiers = (name, ranges) => ranges.map((r, i) => ({ name, tier: LETTERS[i], min: r[0], max: r[1] }))
const setEffect = (n) => ({ name: `${n} 세트 효과`, tier: 'A', min: 1, max: 1 })

const OPTIONS = [
  ...tiers('최대 대미지', [[1, 6], [7, 12], [13, 18], [19, 24], [25, 30]]),
  ...tiers('마법 공격력', [[1, 6], [7, 12], [13, 18], [19, 24], [25, 30]]),
  ...tiers('4대 속성 연금 대미지', [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50]]),
  ...tiers('마리오네트 최대 대미지', [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50]]),
  ...tiers('힐링 효과', [[1, 5], [6, 10]]),
  ...tiers('크리티컬', [[1, 5]]),
  ...tiers('크리티컬 대미지', [[1, 2], [3, 4]]),
  ...tiers('생명력', [[1, 50], [51, 100], [101, 150], [151, 200], [201, 250], [251, 300]]),
  ...tiers('마나', [[1, 50], [51, 100], [101, 150], [151, 200], [201, 250], [251, 300]]),
  ...tiers('스태미나', [[1, 50], [51, 100], [101, 150], [151, 200], [201, 250], [251, 300]]),
  ...tiers('체력', [[1, 10], [11, 20], [21, 30]]),
  ...tiers('지력', [[1, 10], [11, 20], [21, 30]]),
  ...tiers('솜씨', [[1, 10], [11, 20], [21, 30]]),
  ...tiers('의지', [[1, 10], [11, 20], [21, 30]]),
  ...tiers('행운', [[1, 10], [11, 20], [21, 30]]),
  ...tiers('방어', [[1, 20], [21, 40], [41, 60], [61, 80], [81, 100]]),
  ...tiers('마법 방어', [[1, 20], [21, 40], [41, 60], [61, 80], [81, 100]]),
  ...tiers('보호', [[1, 3]]),
  ...tiers('마법 보호', [[1, 3]]),
  ...tiers('생명력 자연 회복량', [[1, 100], [101, 200], [201, 300], [301, 400], [401, 500]]),
  ...tiers('마나 자연 회복량', [[1, 100], [101, 200], [201, 300], [301, 400], [401, 500]]),
  ...tiers('스태미나 자연 회복량', [[1, 100], [101, 200], [201, 300], [301, 400], [401, 500]]),
  ...tiers('피어싱 저항', [[1, 1]]),
  ...tiers('음악 버프 효과', [[1, 1]]),
  ...['아이스볼트', '파이어볼트', '플레이머', '워터캐논', '라이프 드레인', '공격 속도', '매그넘 샷 강화',
    '배쉬 강화', '서포트 샷 강화', '충격 흡수 강화', '스매시 강화', '윈드밀 강화', '돌진 강화',
    '힐링 강화', '다운어택 강화'].map(setEffect)
]
// 자료상 총 102종 — 어긋나면 데이터 입력 실수이므로 로드 시 바로 드러나게 한다.
if (OPTIONS.length !== 102) console.warn(`[holyWater] 옵션 수 ${OPTIONS.length} (기대 102)`)

// 수치에 % 단위가 붙는 옵션들 (나머지는 정수 수치)
const PERCENT = new Set(['힐링 효과', '크리티컬', '크리티컬 대미지', '생명력 자연 회복량', '마나 자연 회복량', '스태미나 자연 회복량'])

const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 성수 1회: 102종 균등 → 유동폭 내 균등 수치
function roll () {
  const o = pick(OPTIONS)
  return { name: o.name, tier: o.tier, min: o.min, max: o.max, value: randInt(o.min, o.max) }
}

// 한 번 사용해서 이 옵션을 '이 수치 이상'으로 뽑을 확률 (= 1/102 × 유동폭 내 이 값 이상 비율)
// 좋고 나쁨은 판단하지 않고 객관적 확률만 제공 (유효 여부는 사용자가 판단)
function rollProbability (r) {
  const within = (r.max - r.value + 1) / (r.max - r.min + 1)
  return (1 / 102) * within
}

// 확률만으로 희귀도 이모지 (메타 판단 없음, 낮을수록 귀한 굴림). p 최대값은 1/102≈0.98%
function rarityEmoji (p) {
  if (p <= 0.002) return '🌈'
  if (p <= 0.005) return '✨'
  return '👍'
}

// 상태(state) = { memberId, n(누적횟수), unit(성수 단가|null) }
function buildEmbed (state, current) {
  const hasUnit = Number.isFinite(state.unit)
  const e = new EmbedBuilder().setTitle('💧 무리아스의 성수').setColor('#4FC3F7')
  e.addFields({ name: '​', value: `<@${state.memberId}>이 장비에 성수 바르는 중..`, inline: false })
  if (current) {
    const unit = PERCENT.has(current.name) ? '%' : ''
    const valStr = ` ${current.value}${unit}` // 1-1 옵션(음벞·세트효과·피어싱저항)도 값 표시
    const p = rollProbability(current)
    e.setDescription(`이번 효과: **${current.name}**${valStr}\n${rarityEmoji(p)} 이 수치 이상 뜰 확률 **${(p * 100).toFixed(2)}%**`)
  } else {
    e.setDescription('아직 효과가 없어~ 아래 **💧 성수 사용**을 눌러봐!')
  }
  e.addFields(
    { name: '사용 횟수', value: `${state.n}회`, inline: true },
    { name: '소모 금액', value: hasUnit ? `${koreanGold(state.unit * state.n)}G` : `${state.n}회분`, inline: true },
    { name: '성수 단가', value: hasUnit ? `${koreanGold(state.unit)}G` : '조회 실패', inline: true }
  )
  e.setFooter({ text: '102종 균등 추첨 · 재미로만! (단가=경매장 실시간 최저가)' })
  return e
}

function buildRow (state) {
  const id = (op) => JSON.stringify({ action: 'holyWater', op, memberId: state.memberId, n: state.n, unit: state.unit })
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(id('use')).setLabel('💧 성수 사용').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(id('reset')).setLabel('🔄 리셋').setStyle(ButtonStyle.Secondary)
  )
}

// 버튼 클릭 처리. 공개 메시지라 아무나 누를 수 있어 → 소유자만 조작 가능하게 가드.
async function handleButton (interaction, info) {
  if (interaction.user.id !== info.memberId) {
    await interaction.reply({ content: '이건 다른 사람의 성수야~ `/성수깡`으로 직접 굴려봐! 💧', ephemeral: true })
    return
  }
  const state = { memberId: info.memberId, n: info.n || 0, unit: info.unit }
  let current = null
  if (info.op === 'use') { current = roll(); state.n += 1 } else if (info.op === 'reset') { state.n = 0 }
  await interaction.update({ embeds: [buildEmbed(state, current)], components: [buildRow(state)] })
}

module.exports = { OPTIONS, roll, rollProbability, buildEmbed, buildRow, handleButton }
