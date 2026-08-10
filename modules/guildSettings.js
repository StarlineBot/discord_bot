const fs = require('node:fs')

// 서버(길드)별 런타임 토글 설정. config/guilds.js(고정 ID)와 달리 여긴 명령어로 바뀌는 값.
// { [guildId]: { autoGuestRole: true, ... } }
const filePath = './static/json/guildSettings.json'

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

// 저장된 값이 있으면 그 값, 없으면 fallback(기본 동작)
function get (guildId, key, fallback) {
  const all = readAll()
  if (all[guildId] && Object.prototype.hasOwnProperty.call(all[guildId], key)) {
    return all[guildId][key]
  }
  return fallback
}

function set (guildId, key, value) {
  const all = readAll()
  if (!all[guildId]) all[guildId] = {}
  all[guildId][key] = value
  writeAll(all)
}

module.exports = { get, set, readAll }
