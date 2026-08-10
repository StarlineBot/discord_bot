const registry = require('./guildRegistry')
const bot = require('../config/bot')

// 길드 신원은 자동등록 레지스트리에서 가져온다 (config/guilds.js 제거됨). → { guildId, ownerId, name }
// 채널·역할·기능 on/off 등 서버별 설정은 /섯다라인설정(guildSettings.json)에서 관리한다.
const getGuildInfo = (guildId) => registry.get(guildId) || undefined

// 봇 헬스체크·에러 로그를 보내는 모니터 채널 (config/bot.js, 서버 무관 봇 전역)
const getMonitorChannelId = () => bot.logChannelId || null

// 개발(테스트) 길드 ID — config/bot.js. dev모드 cron이 이 서버만 건드리게.
const getDevGuildId = () => bot.devGuildId || null

module.exports = { getGuildInfo, getMonitorChannelId, getDevGuildId }
