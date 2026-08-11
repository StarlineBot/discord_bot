const fs = require('node:fs')
const path = require('node:path')

// 로컬 commands 폴더에 없는(=파일을 지운) 슬래시커맨드를 Discord에서 정리한다.
// 전체 삭제·재등록이 아니라 "고아 커맨드만" 지우므로 빠르고 나머지 커맨드는 건드리지 않는다.
async function pruneOrphanCommands (client) {
  const dir = path.join(__dirname, '../../commands')
  const localNames = new Set()
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js')) continue
    try {
      const mod = require(path.join(dir, file))
      if (mod && mod.data && mod.data.name && !mod.deleted) localNames.add(mod.data.name)
    } catch (e) { /* 로드 실패한 커맨드는 무시 */ }
  }
  const registered = await client.application.commands.fetch()
  for (const cmd of registered.values()) {
    if (!localNames.has(cmd.name)) {
      await client.application.commands.delete(cmd.id).catch(() => {})
      console.log(`🧹 고아 슬래시커맨드 삭제: /${cmd.name}`)
    }
  }
}

module.exports = async (client) => {
  console.log(`server: ${process.env.NODE_ENV}, ${client.user.tag} is online!`)

  // 파일이 사라진 슬래시커맨드 자동 정리(재시작마다)
  try {
    await pruneOrphanCommands(client)
  } catch (e) {
    console.error('슬래시커맨드 정리 에러:', e.message)
  }

  client.guilds.cache.forEach(guild => {
    guild.members.fetch()
  })
}
