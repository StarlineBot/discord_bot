const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const guildModule = require('../modules/getGuildInfo')
const { cookings } = require('../modules/cookings')
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
    replyContent.ephemeral = true
    interaction.reply(replyContent)

    const subcommand = interaction.options._subcommand
    let keyword
    let sortCookings
    const getCookings = []

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

    // Discord 제한: 한 메시지당 임베드/첨부 최대 10개.
    // 이미지가 사전 생성되어 빠르므로 10개씩 나눠 여러 메시지로 보낸다.
    const MAX_RESULTS = 20
    const EMBEDS_PER_MESSAGE = 10
    const count = Math.min(sortCookings.length, MAX_RESULTS)
    const items = []
    for (let i = 0; i < count; i++) {
      items.push(getEmbed(writer, sortCookings[i]))
    }
    for (let i = 0; i < items.length; i += EMBEDS_PER_MESSAGE) {
      const chunk = items.slice(i, i + EMBEDS_PER_MESSAGE)
      const embeds = chunk.map(obj => obj.subEmbed)
      const files = chunk.filter(obj => typeof obj.file !== typeof undefined).map(obj => obj.file)
      await generalChannel.send({ embeds, files })
    }
  }
}

const getEmbed = function (writer, cooking) {
  const subEmbed = new EmbedBuilder()
    .setAuthor(writer)
    .setTitle(`${cooking.localName}`)
    .setColor('#FFE400')
    .setThumbnail(cooking.thumbnail)
    .setTimestamp()
  for (const subStatus of cooking.status) {
    subStatus.inline = true
    subStatus.value = subStatus.value + ''
    subEmbed.addFields(subStatus)
  }

  if (typeof cooking.localRecipe !== typeof undefined && cooking.localRecipe !== '') {
    subEmbed.addFields(
      { name: '요리방법', value: cooking.localCookingType }
    )
    subEmbed.addFields(
      { name: '레시피', value: `${cooking.localRecipe}` }
    )
    // 비율 이미지는 사전 생성된 파일(static/img/cookings/cooking-{index}.png)을 사용한다.
    // (런타임 puppeteer 생성 제거 → 클라우드에 크로미움 설치 불필요)
    const fileName = `cooking-${cooking.index}.png`
    const filePath = `static/img/cookings/${fileName}`
    if (fs.existsSync(filePath)) {
      subEmbed.setImage(`attachment://${fileName}`)
      return { subEmbed, file: new AttachmentBuilder(filePath) }
    }
  }
  return { subEmbed }
}
