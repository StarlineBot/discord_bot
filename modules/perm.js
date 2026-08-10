const { developerId } = require('../config/bot')
const guildModule = require('./getGuildInfo')
const settings = require('./guildSettings')

const uid = (member) => member && (member.id || (member.user && member.user.id))

// 최상위 권한: 제작자(developerId) 또는 서버 owner. (관리자역할 지정 같은 건 이 사람들만)
function isOwnerOrDev (member, guild) {
  if (!member || !guild) return false
  const id = uid(member)
  if (developerId && id === developerId) return true
  return guild.ownerId === id
}

// 봇 관리자 = 제작자 or 서버 owner or adminRole 보유(설정 우선 → config 폴백)
function isBotAdmin (member, guild) {
  if (!member || !guild) return false
  if (isOwnerOrDev(member, guild)) return true
  const gi = guildModule.getGuildInfo(guild.id)
  const adminRoleId = settings.get(guild.id, 'adminRole', null) || (gi && gi.adminRole)
  return !!(adminRoleId && member.roles && member.roles.cache.has(adminRoleId))
}

module.exports = { isBotAdmin, isOwnerOrDev }
