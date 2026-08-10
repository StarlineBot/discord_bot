const guildModule = require('./getGuildInfo')
const settings = require('./guildSettings')

// 명령어 결과를 올릴 기본 채널.
// 우선순위: /섯다라인설정 기본채널(설정) → getGuildInfo 폴백 → 명령어를 실행한 채널.
// 항상 채널을 반환한다(최소한 실행 채널) → 미설정이어도 명령어가 깨지지 않음.
function resolveGeneralChannel (interaction) {
  const guildId = (interaction.member && interaction.member.guild && interaction.member.guild.id) || interaction.guildId
  const gi = guildId && guildModule.getGuildInfo(guildId)
  const id = (guildId && settings.get(guildId, 'generalChannelId', null)) || (gi && gi.generalChannelId)
  return (id && interaction.client.channels.cache.get(id)) || interaction.channel
}

module.exports = { resolveGeneralChannel }
