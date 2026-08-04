const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const alertStore = require('../modules/partyAlerts')

function windowLabel (start, end) {
  if (start === end) return '24시간 (항상)'
  return start > end ? `${start}시 ~ 다음날 ${end}시` : `${start}시 ~ ${end}시`
}

const data = new SlashCommandBuilder()
  .setName('파티알림')
  .setDescription('키워드를 등록하면 거뿔 파티모집 제목에 그 단어가 뜰 때 DM으로 알려줘~')

data.addSubcommand(sub => {
  sub.setName('등록').setDescription('알림 키워드를 추가해~ (인당 최대 5개)')
  sub.addStringOption(o => o.setName('키워드').setDescription('모집 제목에 포함될 단어 (예: 글렌, 글라스)').setRequired(true))
  return sub
})

data.addSubcommand(sub =>
  sub.setName('목록').setDescription('내 파티 알림 키워드를 봐~'))

data.addSubcommand(sub => {
  sub.setName('삭제').setDescription('키워드를 삭제해~')
  sub.addStringOption(o => o.setName('키워드').setDescription('삭제할 키워드 (자동완성)').setRequired(true).setAutocomplete(true))
  return sub
})

data.addSubcommand(sub => {
  sub.setName('시간설정').setDescription('알림 받을 시간대를 정해~ (범위 밖 시간엔 알림 안 옴)')
  sub.addIntegerOption(o => o.setName('시작').setDescription('시작 시각 0~23 (예: 19)').setRequired(true).setMinValue(0).setMaxValue(23))
  sub.addIntegerOption(o => o.setName('끝').setDescription('끝 시각 0~23, 이 시각부터 안 옴 (예: 1 → 다음날 1시까지)').setRequired(true).setMinValue(0).setMaxValue(23))
  return sub
})

data.addSubcommand(sub =>
  sub.setName('시간해제').setDescription('시간대 제한을 풀어 24시간 받기로~'))

module.exports = {
  data,
  autocomplete: async (interaction) => {
    const focused = interaction.options.getFocused(true)
    if (focused.name !== '키워드' || interaction.options.getSubcommand() !== '삭제') return
    const q = focused.value || ''
    const mine = alertStore.listByUser(interaction.member.guild.id, interaction.user.id).map(k => k.keyword)
    const hits = (q ? mine.filter(n => n.includes(q)) : mine).slice(0, 25)
    await interaction.respond(hits.map(n => ({ name: n, value: n })))
  },
  run: async ({ interaction }) => {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.member.guild.id
    const userId = interaction.user.id

    if (sub === '등록') {
      const keyword = interaction.options.getString('키워드').trim()
      if (!keyword) {
        await interaction.reply({ content: '키워드를 입력해줘~', ephemeral: true })
        return
      }
      const res = alertStore.add({ guildId, userId, keyword })
      if (!res.ok) {
        await interaction.reply({ content: `❌ ${res.error}`, ephemeral: true })
        return
      }
      const embed = new EmbedBuilder()
        .setTitle(`🔔 파티 알림 등록: ${keyword}`)
        .setColor('#00B894')
        .setDescription(`거뿔 파티모집 제목에 **'${keyword}'** 가 포함되면 DM으로 알려줄게~`)
        .setFooter({ text: '같은 파티는 1회만 · 5분 이상 조용했다 다시 모집하면 새로 알림' })
      await interaction.reply({ embeds: [embed], ephemeral: true })
      return
    }

    if (sub === '목록') {
      const mine = alertStore.listByUser(guildId, userId)
      if (!mine.length) {
        await interaction.reply({ content: '아직 등록한 키워드가 없어~ `/파티알림 등록` 으로 추가해줘', ephemeral: true })
        return
      }
      const w = alertStore.getWindow(userId)
      const embed = new EmbedBuilder()
        .setTitle(`🔔 내 파티 알림 키워드 (${mine.length}/${alertStore.MAX_PER_USER})`)
        .setColor('#00B894')
        .setDescription(mine.map(k => `• **${k.keyword}**`).join('\n'))
        .setFooter({ text: `⏰ 알림 시간대: ${w ? windowLabel(w.start, w.end) : '24시간 (제한 없음)'}` })
      await interaction.reply({ embeds: [embed], ephemeral: true })
      return
    }

    if (sub === '삭제') {
      const keyword = interaction.options.getString('키워드')
      const res = alertStore.removeByKeyword(guildId, userId, keyword)
      if (!res.ok) {
        await interaction.reply({ content: `'${keyword}' 키워드를 못 찾았어~`, ephemeral: true })
        return
      }
      await interaction.reply({ content: `🗑️ '${keyword}' 키워드를 삭제했어~`, ephemeral: true })
      return
    }

    if (sub === '시간설정') {
      const start = interaction.options.getInteger('시작')
      const end = interaction.options.getInteger('끝')
      alertStore.setWindow(userId, start, end)
      const extra = start === end ? ' (시작=끝이라 24시간 받기)' : ' 범위 밖 시간엔 파티 알림이 안 와.'
      await interaction.reply({ content: `⏰ 알림 시간대를 **${windowLabel(start, end)}** 로 설정했어~${extra}`, ephemeral: true })
      return
    }

    if (sub === '시간해제') {
      alertStore.clearWindow(userId)
      await interaction.reply({ content: '⏰ 시간대 제한을 풀었어~ 이제 24시간 알림 받아.', ephemeral: true })
    }
  }
}
