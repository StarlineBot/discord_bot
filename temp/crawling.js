const axios = require('axios')
const cheerio = require('cheerio')
const mainlUrl = 'https://wiki.mabinogiworld.com'
const translate = require('@iamtraction/google-translate')

const getHtml = async function () {
  console.log('==============================================================================================')
  // const getBody = await axios.get(mainlUrl + '/view/Category:Cooked_Items')
  // const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Halloween+Owl+Cookie#mw-pages')
  const getBody = await axios.get(mainlUrl + '/index.php?title=Category:Cooked_Items&curid=31034&pagefrom=Shrimp+Tempura+Udon#mw-pages')
  const $ = cheerio.load(getBody.data)

  $('#mw-pages').find('.mw-category-group').find('ul li').each(async function () {
    const originName = $(this).find('a').text()
    const nameResult = await translate(originName, { from: 'en', to: 'ko' })
    const localName = nameResult.text
    const subUrl = $(this).find('a').attr('href')
    const getSubBody = await axios.get(mainlUrl + subUrl)
    const sub = cheerio.load(getSubBody.data)
    const originRecipe = sub('#content').find('.prettytable').find('tr:eq(0)').siblings().eq(1).text().replace(/\n/g, ',').replaceAll(',', '').trim()
    if (originRecipe === '') {
      return
    }
    let localRecipe
    try {
      const recipeResult = await translate(originRecipe, { from: 'en', to: 'ko' })
      localRecipe = recipeResult.text
    } catch (error) {
      console.log(error, `originName: ${originName}, originRecipe: ${originRecipe}`)
    }

    const originCookingType = sub('#content').find('.prettytable').find('table:eq(0)').find('tr:eq(2)').find('td:eq(1)').text().replace(/\n/g, ',').replaceAll(',', '').trim()
    let localCookingType
    try {
      const cookingTypeResult = await translate(originCookingType, { from: 'en', to: 'ko' })
      localCookingType = cookingTypeResult.text
    } catch (error) {
      console.log(error, `originName: ${originName}, originCookingType: ${originCookingType}`)
    }

    const thumbnail = mainlUrl + sub('#content').find('.prettytable').find('img:eq(0)').attr('src')

    sub('#content').find('.prettytable').find('tr:eq(0)').siblings().each(function (i) {
      if ($(this).is(':last-child') && $(this).find('td').length > 14) {
        const statuses = []

        $(this).find('td').each(function (index) {
          const status = {}
          const text = $(this).text().trim()
          if (text === '-' || text === '?') {
            return
          }
          const prefix = text.includes('+') ? '+' : '-'
          let value = text.replaceAll('+', '').replaceAll('-', '')
          if (value.includes('~')) {
            value = value.split('~')[1]
          }
          switch (index) {
            case 0:
              status.name = '생명력'
              break
            case 1:
              status.name = '마나'
              break
            case 2:
              status.name = '스태미나'
              break
            case 3:
              status.name = '체력'
              break
            case 4:
              status.name = '지력'
              break
            case 5:
              status.name = '솜씨'
              break
            case 6:
              status.name = '의지'
              break
            case 7:
              status.name = '행운'
              break
            case 8:
              status.name = '최소대미지'
              break
            case 9:
              status.name = '최대대미지'
              break
            case 10:
              status.name = '마법공격력'
              break
            case 11:
              status.name = '방어'
              break
            case 12:
              status.name = '보호'
              break
            case 13:
              status.name = '마법방어'
              break
            case 14:
              status.name = '마법보호'
              break
          }
          status.value = prefix === '-' ? value * -1 : parseInt(value)

          statuses.push(status)
        })
        if (statuses.length > 0) {
          const cooking = {
            originName,
            localName,
            originCookingType,
            localCookingType,
            originRecipe,
            localRecipe,
            thumbnail,
            status: statuses
          }
          console.log(cooking, i > 0 ? ',' : '')
        }
      }
    })
  })
}

getHtml()
