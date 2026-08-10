const fs = require('node:fs')

// 봇이 들어가 있는 길드의 신원 자동 스냅샷.
// { [guildId]: { guildId, ownerId, name } }
// config/guilds.js(엄선)에 없는 서버도 getGuildInfo가 여기서 찾아 최소 부트스트랩(오너)을 제공한다.
// gitignore(static/json) → 머신별. ready 백필로 Discord 상태에서 자기치유되므로 유실돼도 재구성됨.
const filePath = './static/json/guildRegistry.json'

function readAll () {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    return {}
  }
}

function writeAll (data) {
  fs.mkdirSync('./static/json', { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function get (guildId) {
  return readAll()[guildId] || null
}

function upsert (guildId, { ownerId, name }) {
  const all = readAll()
  all[guildId] = { guildId, ownerId, name }
  writeAll(all)
}

function remove (guildId) {
  const all = readAll()
  if (all[guildId]) {
    delete all[guildId]
    writeAll(all)
  }
}

module.exports = { readAll, get, upsert, remove }
