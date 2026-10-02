const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')

// 커맨드 목록은 commands 폴더를 순회해 각 커맨드의 설명에서 자동 생성한다(하드코딩 X).
// → 새 커맨드를 추가하면 여기에 저절로 반영됨(목록 드리프트 방지).
// 커스터마이즈(모듈 export): `hidden:true` 숨김 / `help:'...'` 소개 전용 문구 / `category:'...'` 분류 override.

// 카테고리 분류·순서(이 순서대로 출력). 커맨드 이름을 그룹에 배치한다.
// 커맨드가 mod.category를 직접 선언하면 그게 우선. 어디에도 없으면 '기타'로.
const CATEGORIES = [
  { title: '🎮 미니게임 · 재미', names: ['듀얼', '주사위', '운세', '사주팔자', '타로점'] },
  { title: '🎲 도박 · 깡', names: ['브리레흐주화깡', '유물깡', '성수깡'] },
  { title: '👥 파티', names: ['파티모집', '파티알림', '주간일정', '분배계산기'] },
  { title: '📖 게임정보', names: ['오미', '날씨', '교환인챈트', '요리', '튼주'] },
  { title: '💰 경매장', names: ['경매장', '경매장알림'] },
  { title: '⚙️ 관리', names: ['섯다라인설정'] }
]
const ETC_TITLE = '📦 기타'

// 커맨드 이름 → 기본 카테고리 제목
const nameToCategory = {}
for (const cat of CATEGORIES) for (const n of cat.names) nameToCategory[n] = cat.title

function loadCommands () {
  const dir = __dirname
  const self = path.basename(__filename)
  const map = new Map() // name -> { name, desc, category }
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file === self) continue
    try {
      const mod = require(path.join(dir, file))
      if (!mod || !mod.data || !mod.data.name || mod.hidden) continue
      map.set(mod.data.name, {
        name: mod.data.name,
        desc: mod.help || mod.data.description || '',
        category: mod.category || nameToCategory[mod.data.name] || ETC_TITLE
      })
    } catch (e) { /* 로드 실패한 커맨드는 목록에서 제외 */ }
  }
  return map
}

// 카테고리별로 묶어 임베드 필드로 변환
function buildFields (map) {
  const byCat = new Map()
  for (const cmd of map.values()) {
    if (!byCat.has(cmd.category)) byCat.set(cmd.category, [])
    byCat.get(cmd.category).push(cmd)
  }

  // 출력 순서: CATEGORIES 순 → 그 외 override 카테고리(가나다) → 기타 마지막
  const ordered = CATEGORIES.map(c => c.title)
  for (const title of [...byCat.keys()].sort((a, b) => a.localeCompare(b, 'ko'))) {
    if (!ordered.includes(title) && title !== ETC_TITLE) ordered.push(title)
  }
  if (byCat.has(ETC_TITLE)) ordered.push(ETC_TITLE)

  const fields = []
  for (const title of ordered) {
    const cmds = byCat.get(title)
    if (!cmds || cmds.length === 0) continue
    // 그룹 내 순서: CATEGORIES에 정의된 순서 우선, 나머지는 가나다
    const def = CATEGORIES.find(c => c.title === title)
    if (def) cmds.sort((a, b) => def.names.indexOf(a.name) - def.names.indexOf(b.name))
    else cmds.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    const value = cmds.map(c => `**/${c.name}** — ${c.desc}`).join('\n').slice(0, 1024)
    fields.push({ name: title, value })
  }
  return fields.slice(0, 25) // 임베드 필드 최대 25개
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('섯다라인')
    .setDescription('안녕? 난 섯다라인 봇이야!'),
  run: ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setTitle('섯다라인 명령어 목록')
      .setColor('#3A0729')
      .addFields(buildFields(loadCommands()))

    interaction.reply(
      { content: '안녕?😎 난 섯다라인 봇이야! 지금 사용가능한 명령어를 알려줄게~', embeds: [embed] })
  }
}
