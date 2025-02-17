// const { cookings } = require('../modules/cookings')

const axios = require('axios')
const cheerio = require('cheerio')
// const mainlUrl = 'https://wiki.mabinogiworld.com'
const mainlUrl = 'https://mabi.labanyu.com/festival-food'

// const getCookings = cookings
const cookingTest = async function () {
  // const getBody = await axios.get(mainlUrl + '/view/Category:Cooked_Items')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Halloween+Owl+Cookie#mw-pages')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Shrimp+Tempura+Udon#mw-pages')
  const getBody = await axios.get(mainlUrl)
  const $ = cheerio.load(getBody.data)
  const getCookings = []
  $('.card-body').find('.sortable-table').find('tbody').find('tr').each(function () {
    let localName = $(this).find('td:eq(0)').text()
    const index = localName.indexOf('(')
    localName = localName.substring(0, index < 0 ? localName.length : index)
    const statusHtml = $(this).find('td:eq(1)')
    const status = []
    statusHtml.find('span').each(function () {
      const originStatus = $(this).html().split('<!-- --> <!-- -->')
      const name = originStatus[0]
      const getStatus = originStatus[1].replace('<br>', '')
      const isPlus = getStatus.substring(0, 1) === '+'
      const value = parseInt(getStatus.substring(1, originStatus[1].length))
      status.push({
        name,
        value: isPlus ? value : value * -1
      })
    })
    getCookings.push({
      localName, status
    })
  })

  console.log('[')
  for (let i = 0; i < getCookings.length; i++) {
    const cooking = getCookings[i]
    if (i > 0) {
      console.log(',')
    }
    console.log(cooking)
  }
  console.log(']')

  /*
  $('#mw-pages').find('.mw-category-group').find('ul li').each(async function () {
    const originName = $(this).find('a').text()

    const subUrl = $(this).find('a').attr('href')
    const getSubBody = await axios.get(mainlUrl + subUrl)
    const sub = cheerio.load(getSubBody.data)

    const cooking = cookings.find(cooking => cooking.originName === originName)
    let isCatering = true
    if (sub('#General_Information').length > 0 && typeof cooking !== typeof undefined) {
      isCatering = !sub('#General_Information').closest('h2').next('ul').find('li:eq(0)').text() === 'Cannot be used in Catering Dishes.'
      const index = getCookings.findIndex(getCooking => getCooking.originName === originName)
      console.log(index, originName, isCatering)
    }
  })
  */
}

cookingTest()
