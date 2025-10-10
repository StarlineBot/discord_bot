const axios = require('axios')
const { DateTime } = require('luxon')
const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']
const start = new Date('2025-10-10');
const diffDays = Math.floor((Date.now() - start.getTime()) / 86400000);
const startIndex = veteran.indexOf('마스');
const index = (startIndex + diffDays) % veteran.length;

/* eslint-disable */
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
/* eslint-disable */

const todayVeteran = veteran[index]
const tomorrowVeteran = veteran[index+1]

module.exports = (today, now) => {
  const getTodayMission = async () => {
    console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.toISOString())
    return await axios.get(
        'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.toISOString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://www.google.com",
            "Connection": "keep-alive"
          },
          withCredentials: true
        }).catch((e) => {
          console.log(e.response.data)
    })
  }
  const getTomorrowMission = async () => {
    console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.addDays(1).toISOString())
    return await axios.get(
        'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.addDays(1).toISOString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://www.google.com",
            "Connection": "keep-alive"
          },
          withCredentials: true
        }).catch((e) => {
      console.log(e.response.data)
    })
  }

  return {
    todayVeteran, tomorrowVeteran, getTodayMission, getTomorrowMission
  }
}
