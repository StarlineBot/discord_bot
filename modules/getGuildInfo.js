const guilds = require('../config/guilds')

// guildId로 해당 길드의 채널·역할 설정을 가져옴 (없으면 undefined)
const getGuildInfo = (guildId) => guilds.find(guild => guild.guildId === guildId)

// NODE_ENV(development/production)에 해당하는 길드.
// cron 싱글턴 잡(오늘의미션 게시·거뿔보드)이 "어느 길드 채널에 올릴지" 고를 때 사용.
const getActiveGuild = () => {
  const env = process.env.NODE_ENV === 'development' ? 'development' : 'production'
  return guilds.find(guild => guild.env === env) || guilds[0]
}

// 봇 헬스체크·에러 로그를 보내는 모니터 채널 = 개발 길드의 logChannelId (기존 DEV_CHANNEL_ID 동작 유지)
const getMonitorChannelId = () => {
  const dev = guilds.find(guild => guild.env === 'development')
  return dev ? dev.logChannelId : null
}

// 개발용 길드 ID (cron dev 게이팅에서 사용)
const getDevGuildId = () => {
  const dev = guilds.find(guild => guild.env === 'development')
  return dev ? dev.guildId : null
}

module.exports = { getGuildInfo, getActiveGuild, getMonitorChannelId, getDevGuildId }
