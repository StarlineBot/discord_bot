const { cookings } = require('../modules/cookings')

const axios = require('axios')
const cheerio = require('cheerio')
const mainlUrl = 'https://wiki.mabinogiworld.com'

const getCookings = cookings
const cookingTest = async function () {
  // const getBody = await axios.get(mainlUrl + '/view/Category:Cooked_Items')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Halloween+Owl+Cookie#mw-pages')
  const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Shrimp+Tempura+Udon#mw-pages')
  const $ = cheerio.load(getBody.data)
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
}

cookingTest()
