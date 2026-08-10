const guilds = require('../config/guilds')
const registry = require('./guildRegistry')
const bot = require('../config/bot')

// config/guilds.js(엄선) 우선 → 없으면 런타임 레지스트리(자동등록: guildId+ownerId+name)
// 자동등록 서버는 adminRole/채널이 없어 오너 부트스트랩만 되고, 나머진 /섯다라인설정으로 지정.
const getGuildInfo = (guildId) => {
  const base = guilds.find(guild => guild.guildId === guildId)
  if (base) return base
  return registry.get(guildId) || undefined
}

// 봇 헬스체크·에러 로그를 보내는 모니터 채널 = 개발 길드의 logChannelId (기존 DEV_CHANNEL_ID 동작 유지)
const getMonitorChannelId = () => {
  const dev = guilds.find(guild => guild.env === 'development')
  return dev ? dev.logChannelId : null
}

// 개발(테스트) 길드 ID — config/bot.js에서. dev모드 cron이 이 서버만 건드리게.
const getDevGuildId = () => bot.devGuildId || null

module.exports = { getGuildInfo, getMonitorChannelId, getDevGuildId }
