const fs = require('node:fs')
const path = require('node:path')

// 커맨드명 → 모듈 매핑(autocomplete 함수 보유 커맨드로 라우팅). 최초 1회 로드 후 캐시.
let commandMap = null
function loadCommands () {
  if (commandMap) return commandMap
  commandMap = {}
  const dir = path.join(__dirname, '../../commands')
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js')) continue
    try {
      const mod = require(path.join(dir, file))
      if (mod && mod.data && mod.data.name) commandMap[mod.data.name] = mod
    } catch (e) { /* 개별 커맨드 로드 실패는 무시 */ }
  }
  return commandMap
}

module.exports = async (interaction) => {
  if (!interaction.isAutocomplete || !interaction.isAutocomplete()) return
  const cmd = loadCommands()[interaction.commandName]
  if (!cmd || typeof cmd.autocomplete !== 'function') return
  try {
    await cmd.autocomplete(interaction)
  } catch (e) {
    console.error('autocomplete 에러:', e.message)
  }
}
