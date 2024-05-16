const { DateTime } = require('luxon')
const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
// Asia/Seoul

const timeZoneTest = function () {
  console.log(now.toFormat('yyyy-MM-dd HH:mm cccc'))
}

timeZoneTest()
