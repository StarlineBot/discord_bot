const { DateTime } = require('luxon')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
// Asia/Seoul

const timeZoneTest = function () {
  console.log(now.toFormat('yyyy-MM-dd HH:mm cccc'))

  const startDate = DateTime.fromFormat('2024년 06월 05일 수요일 23시 00분', 'yyyy년 MM월 dd일 cccc HH시 mm분', {
    locale: 'ko'
  })

  const jsNow = now.toJSDate()
  const jsStartDate = startDate.toJSDate()
  console.log(jsNow.getTime(), jsStartDate.getTime())
  if (jsStartDate.getTime() > jsNow.getTime()) {
    let diff = jsStartDate - jsNow
    const diffDays = Math.floor((jsStartDate.getTime() - jsNow.getTime()) / (1000 * 60 * 60 * 24))
    diff -= diffDays * (1000 * 60 * 60 * 24)
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    diff -= diffHours * (1000 * 60 * 60)
    const diffMin = Math.floor(diff / (1000 * 60))
    diff -= diffMin * (1000 * 60)
    const diffSec = Math.floor(diff / 1000)
    /*
    // 1시간전 맨션
    if (diffDays === 0 && diffHours === 1 && diffMin === 0) {

    }
    // 10분시 맨션
    if (diffDays === 0 && diffHours === 0 && diffMin === 10) {

    }
    */
    console.log(`${diffDays}일 ${diffHours}시간 ${diffMin}분 ${diffSec}초 남음`)
  }
}

timeZoneTest()
