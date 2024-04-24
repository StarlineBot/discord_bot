const {SlashCommandBuilder} = require("discord.js");

const week = ["일", "월", "화", "수", "목", "금", "토"];
const oddMonth = [
  {weekDay: "일", enchants: ["동키헌터", "하이에나테이머", "스네이크테이머", "폭스테이머"]},
  {weekDay: "월", enchants: ["금이간", "녹슨", "낡은", "폴리쉬드"]},
  {weekDay: "화", enchants: ["스완 슬레이어", "레이븐 슬레이어", "레이븐 서머너", "제이드"]},
  {weekDay: "수", enchants: ["토파즈", "솔져", "망각의", "언더스탠딩"]},
  {weekDay: "목", enchants: ["컨시더레이션", "기쁨의", "위크니스", "헬스"]},
  {weekDay: "금", enchants: ["파운테인", "활석", "석고", "단단한"]},
  {weekDay: "토", enchants: ["양치기의", "방해석", "형석", "몽구스"]},
];
const evenMonth = [
  {weekDay: "일", enchants: ["괴상한", "냉혹한", "인회석", "정장석"]},
  {weekDay: "월", enchants: ["스트라이더", "벼려진", "스파크", "영리한"]},
  {weekDay: "화", enchants: ["강인한", "승리의", "석영", "사막여우"]},
  {weekDay: "수", enchants: ["별난", "각진", "간편한", "금강석"]},
  {weekDay: "목", enchants: ["발굴자", "폭발의", "바람빛", "멧돼지"]},
  {weekDay: "금", enchants: ["혼합된", "미명의", "새싹", "대지의"]},
  {weekDay: "토", enchants: ["조각", "통찰력의", "자이언트", "장미"]},
];

module.exports = {
  data: new SlashCommandBuilder()
  .setName('교환인챈트')
  .setDescription('현재 날짜에 맞게 스튜어트에게서 복원의 가루로 교환 가능한 인챈트를 알려줄게!')
  , run: ({interaction}) => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let getWeekDay = week[now.getDay()];
    let isOdd = month % 2;
    let getObj = isOdd ? oddMonth.find(({weekDay}) => weekDay === getWeekDay)
        : evenMonth.find(({weekDay}) => weekDay === getWeekDay);
    interaction.reply(
        "오늘 " + year + "년 " + month + "월 " + day + "일 " + getWeekDay
        + "요일, 스튜어트에게 교환할 수 있는 있챈트는 다음과 같아!\n\n" + getObj.enchants.join(", ")
        + "\n인챈트 버리지 말고 복원의 가루로 꼭 교환해!😎");
  }
}