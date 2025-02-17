// const { cookings } = require('../modules/cookings')

const axios = require('axios')
const cheerio = require('cheerio')
// const mainlUrl = 'https://wiki.mabinogiworld.com'
const mainlUrl = 'https://mabi.labanyu.com/festival-food'

// const getCookings = cookings
const cookingTest = async function () {
  // https://biketago.com/cook/recipe/?n=%EB%A7%A4%EC%9A%B4+%EC%96%B4%EB%AC%B5%ED%83%95
  const getSearchBody = await axios.get('https://ktsmemo.cafe24.com/s/mabimemo/906')
  const sub = cheerio.load(getSearchBody.data)

  // const getBody = await axios.get(mainlUrl + '/view/Category:Cooked_Items')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Halloween+Owl+Cookie#mw-pages')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Shrimp+Tempura+Udon#mw-pages')
  const getBody = await axios.get(mainlUrl)
  const $ = cheerio.load(getBody.data)
  const getCookings = []
  $('.card-body').find('.sortable-table').find('tbody').find('tr').each(async function () {
    const thumbnail = $(this).find('td:eq(0)').find('img').attr('src')
    let localName = $(this).find('td:eq(0)').text()
    const index = localName.indexOf('(')
    localName = localName.substring(0, index < 0 ? localName.length : index)

    let localCookingType = ''
    let localRecipe = ''
    const localRecipes = []
    sub('#result').find('tr').each(function (i) {
      if ($(this).find('a:eq(0)').text() === localName) {
        localCookingType = $(this).find('td:eq(1)').text()
        localRecipes.push({
          name: $(this).find('td:eq(3)').text(),
          percent: ''
        })
        localRecipes.push({
          name: $(this).find('td:eq(4)').text(),
          percent: ''
        })
        localRecipes.push({
          name: $(this).find('td:eq(5)').text(),
          percent: ''
        })
        $(this).closest('tr').next('tr').find('td').each(function (i) {
          localRecipes[i].percent = $(this).text()
        })

        for (let i = 0; i < localRecipes.length; i++) {
          const getLocalRecipe = localRecipes[i]
          if (i > 0) {
            localRecipe += ' '
          }
          localRecipe += `${getLocalRecipe.name}(${getLocalRecipe.percent}%)`
        }
      }
    })

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
      thumbnail,
      localName,
      status,
      localRecipe,
      localCookingType
    })
  })

  console.log('[')
  for (let i = 20; i < getCookings.length; i++) {
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
