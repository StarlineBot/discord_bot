const axios = require('axios')
const cheerio = require('cheerio')
const mainlUrl = 'https://ktsmemo.cafe24.com/s/mabimemo/906'

const getHtml = async function () {
  console.log('==============================================================================================')
  const getBody = await axios.get(mainlUrl)
  const $ = cheerio.load(getBody.data)

  console.log(getBody)
  $(".content").find("#result").find("tbody tr").each(function(i){
    const isEven = i%2 === 0
    const td = $(this).find("td")
    if (isEven) {

    }
    console.log(isEven, td.eq(0).text())
  })
}

getHtml()