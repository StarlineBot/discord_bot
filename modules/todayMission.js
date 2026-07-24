const axios = require('axios')
const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']
const start = new Date('2025-10-10')
const startIndex = veteran.indexOf('마스')

/* eslint-disable */
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
/* eslint-disable */

const MISSION_URL = 'https://mabi.world/missions.php?server=korea&locale=korea&from='
// mabi.world는 plain HTTP로 JSON을 반환하므로 headless 브라우저 없이 조회한다.
// (헤드리스 크로미움 의존 제거 → GCP 배치 환경의 실행 실패/좀비 프로세스 원인 제거)
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
  Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
}

module.exports = (today, now) => {
  const getVeteran = function () {
    const diffDays = Math.floor((now - start.getTime()) / 86400000)
    const len = veteran.length
    // 음수(기준일 이전)에도 안전하도록 정규화
    const index = (((startIndex + diffDays) % len) + len) % len
    return { today: veteran[index], tomorrow: veteran[(index + 1) % len] }
  }

  const fetchMission = async (iso) => {
    const url = MISSION_URL + iso
    console.log(url)
    const res = await axios.get(url, { headers: REQUEST_HEADERS, timeout: 10000 })
    return res.data
  }

  // today/tomorrow 미션을 병렬 조회
  const getMissions = async () => {
    const [today, tomorrow] = await Promise.all([
      fetchMission(now.toISOString()),
      fetchMission(now.addDays(1).toISOString())
    ])
    return { today, tomorrow }
  }

  return {
    getVeteran, getMissions
  }
}
