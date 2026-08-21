// 명령어 로딩 연출 공통 컴포넌트
// Discord 기본 "○○(이)가 생각 중이에요..." 대신, 즉시 ephemeral reply로 커스텀 로딩 문구를 띄운다.
// 이후 각 명령어는 interaction.editReply(...)로 실제 결과/에러 문구로 교체한다.
// (reply를 await 전에 먼저 호출하므로 3초 ack 규칙 통과, ephemeral도 그대로 유지)
//
// 연출을 바꾸고 싶으면 이 파일만 고치면 전 명령어에 일괄 반영된다.

// 로딩 중 랜덤으로 보여줄 마비노기 상황 문구들 (재미용)
const FLAVORS = [
  '브리레흐 3관 도는 중',
  '크롬바스에서 보상상자 까는 중',
  '볼트 마법 조합 준비 중',
  '비바체 연주 하는 중',
  '스노우 스톰 시전 중',
  '익스플로전 런지 시전 중',
  '80 헤일로 어떻게 한 번에 깰지 고민 중',
  '브리레흐 2관 줄넘기 중',
  '크롬바스 심연에서 회오리 피하는 중',
  '잔흔 부족으로 레이턴트 이그니션 사용 못하는 중',
  '잘못 나간 라이트닝 체인 줍는 중',
  '브리레흐 1관 도는 중',
  '크롬바스에서 100버스트 중',
  '스노우 스톰 아끼는 중',
  '레이턴트 이그니션 사용 중',
  '크롬바스 심연에서 레이저 맞는 중'
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 명령어가 넘긴 문구(text)는 무시하고, 랜덤 상황 문구로 로딩 연출을 렌더링한다.
// text는 하위호환/디버깅용으로만 받아둔다.
function render (_text) {
  return `⏳ ${pick(FLAVORS)}...`
}

// 로딩 문구로 인터랙션을 즉시 접수(ack). 기본 ephemeral(나만 보기).
async function startLoading (interaction, text, { ephemeral = true } = {}) {
  await interaction.reply({ content: render(text), ephemeral })
}

module.exports = { startLoading, render, FLAVORS }
