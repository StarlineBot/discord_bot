const guildModule = require('../../modules/getGuildInfo')
const {
  getUserMessageCounts,
  getTopRanking,
  createRankingEmbed,
  getUserVoiceCounts,
  createVoiceRankingEmbed
} = require('../../modules/RankingUtil')
const prefix = '!'

module.exports = async (message, client) => {
  if (message.author.bot || !message.guildId || (!message.content.startsWith(prefix + '채팅랭킹') && !message.content.startsWith(prefix + '보이스랭킹'))) return

  const guildId = message.guildId
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return

  try {
    const guild = client.guilds.cache.get(guildId)
    if (!guild) return

    const adminRoleId = guildInfo.adminRole
    const member = guild.members.cache.get(message.author.id)
    if (!member || !member.roles.cache.has(adminRoleId)) return

    let embeds = []
    const isChatRank = message.content.startsWith(prefix + '채팅랭킹')
    const isVoiceRank = message.content.startsWith(prefix + '보이스랭킹')
    if (isChatRank) {
      const userMessageCounts = getUserMessageCounts()
      if (!userMessageCounts) return

      const userCounts = userMessageCounts[guildId]
      const topRanks = getTopRanking(userCounts)
      if (topRanks.length === 0) return
      embeds = topRanks.map(createRankingEmbed)
    }

    if (isVoiceRank) {
      const userVoiceCounts = getUserVoiceCounts()
      if (!userVoiceCounts) return

      const userCounts = userVoiceCounts[guildId]
      const topRanks = getTopRanking(userCounts)
      if (topRanks.length === 0) return
      embeds = topRanks.map(createVoiceRankingEmbed)
    }

    if (embeds.length > 0) {
      message.reply({ embeds })
    }
  } catch (error) {
    console.error(`Error while processing 채팅랭킹 for guild ${guildId}:`, error)
  }
}
