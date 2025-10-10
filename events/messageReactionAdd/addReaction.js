const guildModule = require('../../modules/getGuildInfo')
const { updateUserMessageCount } = require('../../modules/RankingUtil')

module.exports = async (reaction, user) => {
  // 메세지 작성자가 봇이거나 길드아이디가 없으면 작업하지 않음
  if (user.bot || !reaction.message.guildId) return

  const guildId = reaction.message.guildId
  const userId = user.id
  const guildInfo = guildModule.getGuildInfo(guildId)
  if (!guildInfo) return

  // 메시지가 캐시되지 않았을 수도 있으므로 fetch 보정
  if (reaction.partial) await reaction.fetch();

  // 자기가 쓴 글에 자기 반응인 경우 제외
  if (reaction.message.author.id === user.id) return;

  updateUserMessageCount(guildId, userId, true)
}
