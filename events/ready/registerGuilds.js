const registry = require('../../modules/guildRegistry')

// 봇 시작 시 현재 들어가 있는 모든 길드를 레지스트리에 백필한다.
// guildCreate는 "새로 합류"할 때만 뜨므로, 기존 서버(재시작 시)는 여기서 커버.
module.exports = (client) => {
  let count = 0
  for (const guild of client.guilds.cache.values()) {
    registry.upsert(guild.id, { ownerId: guild.ownerId, name: guild.name })
    count++
  }
  console.log(`guildRegistry 백필 완료: ${count}개 길드`)
}
