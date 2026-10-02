const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')

// 커맨드 목록은 commands 폴더를 순회해 각 커맨드의 설명에서 자동 생성한다(하드코딩 X).
// → 새 커맨드를 추가하면 여기에 저절로 반영됨(목록 드리프트 방지).
// 커스터마이즈: 모듈에서 `hidden: true`로 숨기거나, `help: '...'`로 소개 문구를 따로 지정.
//              소개 순서는 `order`(작을수록 앞), 미지정은 뒤로 → 그다음 가나다순.
function loadCommandList () {
  const dir = __dirname
  const self = path.basename(__filename)
  const list = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file === self) continue
    try {
      const mod = require(path.join(dir, file))
      if (!mod || !mod.data || !mod.data.name || mod.hidden) continue
      list.push({
        name: mod.data.name,
        desc: mod.help || mod.data.description || '',
        order: typeof mod.order === 'number' ? mod.order : Number.MAX_SAFE_INTEGER
      })
    } catch (e) { /* 로드 실패한 커맨드는 목록에서 제외 */ }
  }
  list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'))
  return list
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('섯다라인')
    .setDescription('안녕? 난 섯다라인 봇이야!'),
  run: ({ interaction }) => {
    const commands = loadCommandList().slice(0, 25) // 임베드 필드 최대 25개
    const embed = new EmbedBuilder()
      .setTitle('섯다라인 명령어 목록')
      .setColor('#3A0729')
      .addFields(commands.map(c => ({ name: `/${c.name}`, value: c.desc || '​' })))

    interaction.reply(
      { content: '안녕?😎 난 섯다라인 봇이야! 지금 사용가능한 명령어를 알려줄게~', embeds: [embed] })
  }
}
