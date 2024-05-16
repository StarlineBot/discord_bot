const axios = require('axios')
const { DateTime } = require('luxon')
const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']

const startDate = DateTime.local(2024, 4, 20, 0, 0)

/* eslint-disable */
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
/* eslint-disable */

let veteranStartIndex = 5
let veteranIndex = 0
const dungeonList = [{ date: startDate, dungeon: veteran[veteranStartIndex++] }]
for (let i = 1; i < 731; i++) {
  if (i === 1) {
    veteranIndex = veteranStartIndex
  }
  if (i > 1) {
    veteranIndex = veteranIndex > 8 ? 0 : veteranIndex
  }
  const date = startDate.plus({ days: i })
  dungeonList.push({
    date, dungeon: veteran[veteranIndex]
  })
  veteranIndex++
}

const today = DateTime.now().setZone("Asia/Seoul").setLocale('ko')
const todayVeteran = dungeonList.find(
  ({ date }) => date.hasSame(today, 'day') && date.hasSame(today, 'year') &&
        date.hasSame(today, 'month'))
const tomorrow = today.plus({ days: 1 })
const tomorrowVeteran = dungeonList.find(
  ({ date }) => date.hasSame(tomorrow, 'day') && date.hasSame(tomorrow,
    'year') && date.hasSame(tomorrow, 'month'))

const offset = new Date().getTimezoneOffset() * 60000
const now = new Date(Date.now() - offset)

const getTodayMission = async () => {
  console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.toISOString())
  return await axios.get(
    'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.toISOString())
}
const getTomorrowMission = async () => {
  console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.addDays(1).toISOString())
  return await axios.get(
    'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.addDays(1).toISOString())
}

module.exports = {
  todayVeteran, tomorrowVeteran, getTodayMission, getTomorrowMission
}
