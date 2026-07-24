// 라바뉴 오검 페이지(__NEXT_DATA__)를 파싱해 modules/ogham.json 스냅샷을 생성한다.
// 데이터가 바뀌면(미공개→공개, 신규 아르카나 등) 이 스크립트를 다시 실행해 갱신한다.
//   node scripts/fetch_ogham.js
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const URL = 'https://mabi.labanyu.com/arcana/ogham'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
}

async function main () {
  const { data: html } = await axios.get(URL, { headers: HEADERS, timeout: 15000 })
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) throw new Error('__NEXT_DATA__ 를 찾지 못함')
  const pp = JSON.parse(m[1]).props.pageProps

  const arcanas = pp.arcanaNames.map(a => ({
    id: a.id,
    name: a.name,
    thumbnail: a.thumbnail || null
  }))

  // 아르카나 id별 조합 목록
  const combinations = {}
  for (const c of pp.oghamCombinations) {
    const arcanaId = c.arcana && c.arcana.id
    if (!arcanaId) continue
    const words = (c.oghamWords || []).map(w => ({ name: w.name, icon: w.icon || '' }))
    const disclosed = !!(c.skill && c.skill.name)
    if (!combinations[arcanaId]) combinations[arcanaId] = []
    combinations[arcanaId].push({
      skill: disclosed ? c.skill.name : null,
      words,
      image: c.inGameImg || null,
      disclosed
    })
  }

  const out = { arcanas, combinations }
  const outPath = path.join(__dirname, '..', 'modules', 'ogham.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
  console.log(`저장: modules/ogham.json | 아르카나 ${arcanas.length}종, 조합 ${pp.oghamCombinations.length}개`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
