// 오늘의 운세: userId+날짜 시드로 결정론적 생성(같은 사람·같은 날 = 같은 결과)
// 문자열 → 32bit 해시(cyrb53 축약)
function hashSeed (str) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0)
}
// 시드 PRNG(mulberry32) → 0~1
function mulberry32 (seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TOTAL = [
  '오늘은 흐름을 타면 술술 풀리는 날. 무리한 승부수보단 자연스러운 선택이 정답이야.',
  '작은 행운이 곳곳에 숨어있어. 놓치지 않게 주변을 잘 살펴봐~',
  '컨디션 난조가 올 수 있으니 욕심을 조금 내려놓으면 오히려 편해져.',
  '결정을 미뤄왔던 일이 있다면 오늘 매듭짓기 좋은 기운이야.',
  '남의 말보다 네 직감이 잘 맞는 하루. 스스로를 믿어봐.',
  '분주하지만 보람 있는 날. 하나씩 처리하다 보면 뿌듯해질 거야.',
  '예상치 못한 곳에서 도움의 손길이 와. 감사한 마음을 표현해봐.',
  '조급함이 실수를 부를 수 있어. 한 박자 천천히 가는 게 이득이야.'
]
const LOVE = [
  '마음이 통하는 순간이 찾아와. 솔직한 한마디가 관계를 데워줄 거야.',
  '작은 배려가 큰 호감으로 돌아오는 날. 상대의 입장에서 생각해봐.',
  '괜한 오해는 금물. 확인하지 않고 넘겨짚으면 삐끗할 수 있어.',
  '혼자만의 시간이 오히려 매력을 채워줘. 조급해하지 마.',
  '인연은 가까운 곳에 있어. 익숙한 사람을 새롭게 봐봐.'
]
const MONEY = [
  '지갑을 지키는 게 버는 것. 충동구매만 참으면 이득인 날.',
  '뜻밖의 부수입 기운이 살짝. 정보에 귀를 열어둬.',
  '큰돈 나갈 일은 신중히. 계약·결제는 한 번 더 확인해.',
  '아껴둔 게 빛을 발하는 날. 알뜰함이 곧 여유가 돼.',
  '금전 관계는 명확하게. 빌려주고 빌리는 건 오늘은 피해.'
]
const WORK = [
  '집중력이 살아있는 날. 미뤄둔 일부터 치우면 순항이야.',
  '협업에서 좋은 시너지가 나. 먼저 손 내밀면 일이 커져.',
  '디테일에서 승부가 갈려. 마무리를 꼼꼼히 챙겨봐.',
  '새 아이디어가 반짝이는 날. 메모해두면 나중에 쓸모 있어.',
  '무리한 일정은 화를 불러. 우선순위를 정리하고 움직여.'
]
const COLORS = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '흰색', '검정', '금색', '은색', '하늘색', '민트']
const DIRS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽']
const ADVICE = [
  '웃는 얼굴엔 복이 와. 오늘 한 번 더 웃어봐.',
  '물 한 잔의 여유가 하루를 바꿔.',
  '고맙다는 말, 아끼지 마.',
  '완벽보다 완료. 일단 끝내는 게 중요해.',
  '작은 친절이 큰 인연을 만들어.',
  '조급할수록 심호흡 한 번.',
  '오늘의 나에게도 칭찬 한마디~'
]

function pick (rng, arr) { return arr[Math.floor(rng() * arr.length)] }
function star (rng) { return 1 + Math.floor(rng() * 5) } // 1~5

// dateStr: 'YYYY-MM-DD'(KST) 권장 → 하루 단위 고정
function buildDailyFortune (userId, dateStr) {
  const rng = mulberry32(hashSeed(`${userId}:${dateStr}`))
  return {
    total: { star: star(rng), msg: pick(rng, TOTAL) },
    love: { star: star(rng), msg: pick(rng, LOVE) },
    money: { star: star(rng), msg: pick(rng, MONEY) },
    work: { star: star(rng), msg: pick(rng, WORK) },
    luckyNumber: 1 + Math.floor(rng() * 99),
    luckyColor: pick(rng, COLORS),
    luckyDirection: pick(rng, DIRS),
    advice: pick(rng, ADVICE)
  }
}

const starBar = (n) => '⭐'.repeat(n) + '·'.repeat(5 - n)

module.exports = { buildDailyFortune, starBar }
