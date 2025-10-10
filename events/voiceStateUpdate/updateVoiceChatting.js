const {
  getUserVoiceCounts,
  saveUserVoiceCount
} = require('../../modules/RankingUtil')

module.exports = (oldState, newState) => {
  const voiceTracking = {}
  let userVoiceCounts = getUserVoiceCounts()
  // 봇은 추적 대상에서 제외
  if (newState.member?.user?.bot) return

  const userId = newState.id
  const guildId = newState.guild.id

  // 입장감지
  if (!oldState.channel && newState.channel) {
    voiceTracking[userId] = { joinedAt: Date.now(), channelId: newState.channel.id }
    return
  }

  // 퇴장감지
  if (oldState.channel && !newState.channel) {
    const session = voiceTracking[userId]
    if (!session) return

    const duration = Date.now() - session.joinedAt
    if (!userVoiceCounts) userVoiceCounts = {}
    if (!userVoiceCounts[guildId]) userVoiceCounts[guildId] = {}
    userVoiceCounts[guildId][userId] = (Number(userVoiceCounts[guildId][userId]) || 0) + duration

    delete voiceTracking[userId]
    saveUserVoiceCount(userVoiceCounts)
  }
}
