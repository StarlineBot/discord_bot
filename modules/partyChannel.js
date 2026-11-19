const { ChannelType } = require('discord.js')
const settings = require('./guildSettings')
const guildModule = require('./getGuildInfo')

// 파티모집 채널 해석·검사(단일 출처).
// 파티모집은 포럼 전용이다 — 글=포럼 스레드(시작 메시지에 모집 정보), 던전=포럼 태그, 보존=태그.
// 예전 /섯다라인설정 파티모집이 텍스트 채널도 받아서, 그렇게 설정된 서버는 글 올리기부터 실패한다(11-19 확인).
// → 설정은 이제 포럼만 받고, 이미 텍스트 채널로 저장된 서버는 목록 경고·/파티모집 안내·제작자 기동 보고로 알린다.

const NOT_FORUM_HINT = '파티모집은 **포럼 채널**에서만 동작해요. 관리자가 `/섯다라인설정 파티모집 상태:켜기 채널:#포럼채널` 로 다시 지정해 주세요.'

function partyChannelIdOf (guildId) {
  const gi = guildModule.getGuildInfo(guildId)
  return settings.get(guildId, 'partyChannelId', null) || (gi && gi.partyChannelId) || null
}

const isForum = (channel) => !!channel && channel.type === ChannelType.GuildForum

// 저장된 채널이 있는데 포럼이 아니면 true (채널이 지워졌거나 못 찾으면 false — 그건 '채널 없음' 문제)
function isWrongType (guild) {
  const id = guild && partyChannelIdOf(guild.id)
  const channel = id && guild.channels.cache.get(id)
  return !!channel && !isForum(channel)
}

module.exports = { partyChannelIdOf, isForum, isWrongType, NOT_FORUM_HINT }
