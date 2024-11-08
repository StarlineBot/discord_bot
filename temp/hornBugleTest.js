const axios = require('axios')
const nexonApiKey = 'test_10adcd4d2e0a6f843628b1777510b03167cd1222fda45f0d765fd38c29caebdfefe8d04e6d233bd35cf2fabdeb93fb0d'
const mainUrl = 'https://open.api.nexon.com'

const hornBugleTest = async function () {
  axios({
    method: 'GET',
    url: mainUrl + '/mabinogi/v1/horn-bugle-world/history?server_name=하프',
    headers: {
      'x-nxopen-api-key': nexonApiKey
    }
  })
    .then((result) => {
      const hornBugleList = result.data.horn_bugle_world_history
      for (let i = 0; i < 10; i++) {
        const hornBugle = hornBugleList[i]
        const date = new Date(hornBugle.date_send)

        console.log(`${getDate(date)} ${hornBugle.character_name}: ${hornBugle.message}`)
      }
    })
    .catch(console.error)
}
const getDate = function (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)
  const hours = String(date.getHours()).padStart(2, 0)
  const min = String(date.getMinutes()).padStart(2, 0)
  const sec = String(date.getSeconds()).padStart(2, 0)
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`
}
hornBugleTest()
