const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { cookings } = require('../modules/cookings')
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('node:fs')

const filterCookings = cookings.filter(cooking => cooking.isCatering === true)

module.exports = {
  data: new SlashCommandBuilder()
    .setName('요리')
    .setDescription('[BETA] 재료를 입력하거나 능력치를 선택하면 포함되는 음식을 찾아줘~')
    .addSubcommand(subcommand =>
      subcommand.setName('재료').setDescription('해당 재료가 포함된 요리 목록')
        .addStringOption(option =>
          option.setName('material').setDescription('재료 명을 입력해줘~').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('능력치').setDescription('해당 능력치를 올려주는 요리 목록')
        .addStringOption(option =>
          option.setName('status').setDescription('능력치를 선택하면 해당 능력치가 포함된 요리를 찾아줘~').setRequired(true)
            .addChoices(
              { name: '생명력', value: '생명력' }
              , { name: '마나', value: '마나' }
              , { name: '스태미나', value: '스태미나' }
              , { name: '체력', value: '체력' }
              , { name: '지력', value: '지력' }
              , { name: '솜씨', value: '솜씨' }
              , { name: '의지', value: '의지' }
              , { name: '행운', value: '행운' }
              , { name: '최소대미지', value: '최소대미지' }
              , { name: '최대대미지', value: '최대대미지' }
              , { name: '마법공격력', value: '마법공격력' }
              , { name: '방어', value: '방어' }
              , { name: '보호', value: '보호' }
              , { name: '마법방어', value: '마법방어' }
              , { name: '마법보호', value: '마법보호' }
            )
        )
    ),
  run: async ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    const writer = { name: interaction.member.nickname == null ? interaction.member.user.globalName : interaction.member.nickname, iconURL: interaction.member.user.displayAvatarURL() }
    const guildId = interaction.member.guild.id
    const guildInfo = guildModule.getGuildInfo(guildId)
    const generalChannelId = guildInfo.generalChannelId

    const generalChannel = interaction.client.channels.cache.get(generalChannelId)
    const replyContent = { content: `입력한 요리정보는 <#${generalChannel.id}>에 작성중이야~` }
    if (interaction.channelId === generalChannel.id) {
      replyContent.ephemeral = true
    }
    interaction.reply(replyContent)

    const subcommand = interaction.options._subcommand
    let keyword
    let sortCookings
    const getCookings = []
    const embeds = []
    const files = []

    // 재료는 상위 10개 목록을 어떻게 가져올지 고민, cookingType 하고 같이 가져온다던지
    if (subcommand === '재료') {
      keyword = interaction.options._hoistedOptions.find(option => option.name === 'material').value
      for (const cooking of filterCookings) {
        if (cooking.localRecipe.trim().includes(keyword)) {
          getCookings.push(cooking)
        }
      }

      sortCookings = getCookings
    }
    if (subcommand === '능력치') {
      keyword = interaction.options._hoistedOptions.find(option => option.name === 'status').value
      for (const cooking of filterCookings) {
        if (cooking.status.find(subStatus => subStatus.name === keyword)) {
          getCookings.push(cooking)
        }
      }

      // 능력치별 상위 검색결과 노출
      sortCookings = getCookings.sort(function (a, b) {
        return b.status.find(subStatus => subStatus.name === keyword).value - a.status.find(subStatus => subStatus.name === keyword).value
      })
    }

    // 상위 검색결과중 10개만 사용
    const count = sortCookings.length < 10 ? sortCookings.length : 10
    for (let i = 0; i < count; i++) {
      const cooking = sortCookings[i]
      const obj = await getEmbed(writer, cooking)
      embeds.push(obj.subEmbed)
      files.push(obj.file)
    }

    generalChannel.send({ embeds, files })
  }
}

const regex = /[^0-9]/gi
const getEmbed = async function (writer, cooking) {
  const values = []
  const getRecipes = cooking.localRecipe.split('%')
  for (let i = 0; i < getRecipes.length; i++) {
    const getRecipe = getRecipes[i]
    if (getRecipe === '') {
      continue
    }
    values.push(getRecipe.replace(regex, ''))
  }

  const fileName = `cooking-${cooking.index}.png`
  await getImage(fileName, values)
  const file = new AttachmentBuilder(`static/img/cookings/${fileName}`)
  const subEmbed = new EmbedBuilder()
    .setAuthor(writer)
    .setTitle(`${cooking.localName}`)
    .setColor('#FFE400')
    .setThumbnail(cooking.thumbnail)
    .addFields(
      { name: '요리방법', value: cooking.localCookingType }
    )
    .addFields(
      { name: '레시피', value: `${cooking.localRecipe}` }
    )
    .setImage(`attachment://${fileName}`)
    .setTimestamp()
  for (const subStatus of cooking.status) {
    subStatus.inline = true
    subStatus.value = subStatus.value + ''
    subEmbed.addFields(subStatus)
  }
  return { subEmbed, file }
}

const getImage = async function (fileName, values) {
  const image = fs.readFileSync('./static/img/mabi_cook2_ver2.png')
  /* eslint new-cap: ["error", { "newIsCap": false }] */
  const base64Image = new Buffer.from(image).toString('base64')
  const dataURI = 'data:image/jpeg;base64,' + base64Image

  let html = '<!DOCTYPE html>\n' +
      '<html lang="en">' +
      '<head>' +
      '<style>' +
      '    .cookInfo {' +
      '      position: relative; width: 265px; height: 110px;' +
      '    }' +
      '    .graph {' +
      '      position: absolute;' +
      '      border: 1px solid #000;' +
      '      top: 40px;' +
      '      background-color: #000;' +
      '      height: 7px;' +
      '      width: 241px;' +
      '      margin-left: 10px;' +
      '      display: flex;' +
      '    }' +
      '    .graph_box {' +
      '      position: relative;' +
      '      height: 8px;' +
      '      box-sizing: border-box;' +
      '    }' +
      '  </style>' +
      '</head>' +
      '<body style="margin: 0; height: 100%; background-color: rgb(14, 14, 14);">' +
      '  <div class="cookInfo">' +
      '    <div class="graph">'
  const colors = ['#F2CB61', '#F15F5F']
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const color = colors[i]
    if (value === null) {
      continue
    }
    html += `<div class="graph_box" style="width: ${value}%; background-color: ${color};"></div>`
  }
  html += ' </div>' +
      '    <img src="{{imageSource}}" alt="" style="padding: 10px; background-color: #406D8F;">' +
      '  </div>' +
      '</body>' +
      '</html>'

  // 요리비율 이미지가 존재하는지 확인, 없으면 생성, 있으면 그대로 가져다 사용
  if (!fs.existsSync(`./static/img/cookings/${fileName}`)) {
    let puppeteerArgs = process.env.NODE_ENV !== 'development' ? { executablePath: '/usr/bin/chromium-browser' } : {};
    await nodeHtmlToImage({
      output: `./static/img/cookings/${fileName}`,
      html,
      selector: 'div.cookInfo',
      content: {
        imageSource: dataURI
      },
      puppeteerArgs
    })
  }
}

/**
 * (old) 가상 브라우저를 띄워서 html로 모양을 만들고 이미지로 만들어 사용
 const getImage = async function (url) {
 const browser = await puppeteer.launch({
 executablePath: '/usr/bin/chromium-browser'
 })
 const page = await browser.newPage()
 await page.setViewport({ width: 265, height: 114 })
 await page.goto(url)
 await page.waitForSelector('#domToImage')

 const id = uuid4()
 const fileName = `img-${id}.png`
 await page.screenshot({
 path: './static/img/' + fileName
 })
 await page.close()
 await browser.close()
 return fileName
 }
 */
