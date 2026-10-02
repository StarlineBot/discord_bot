const settings = require('../../modules/guildSettings')

// 파티모집 포럼의 파티(스레드)가 삭제되면(수동 삭제 + 10일 정리 크론) 주간일정 달력을 자동 새로고침.
module.exports = async (thread) => {
  try {
    const guild = thread && thread.guild
    if (!guild) return
    const forumId = settings.get(guild.id, 'partyChannelId', null)
    if (!forumId || thread.parentId !== forumId) return
    const ws = require('../../modules/weeklySchedule')
    ws.invalidatePartyCache(guild.id)
    await ws.refreshGuildBoards(guild)
  } catch (e) {
    console.error('threadDelete 주간일정 새로고침 에러:', e.message)
  }
}
