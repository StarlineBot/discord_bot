const { DateTime } = require('luxon')

const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']
// 기준일 (2025년 10월 10일 → '마스' 시작)
const start = new Date('2025-10-10');
// 오늘 날짜 기준 며칠 지났는지 계산
const diffDays = Math.floor((Date.now() - start.getTime()) / 86400000);
// 기준일의 인덱스 ('마스'의 위치)
const startIndex = veteran.indexOf('마스');
// 오늘 인덱스 계산 (순환)
const index = (startIndex + diffDays) % veteran.length;
// 음수 방지용 (혹시 start보다 이전 날짜일 경우)
const todayVeteran = veteran[(index + veteran.length) % veteran.length];

console.log(`오늘의 던전은: ${todayVeteran}`)