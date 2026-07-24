// 라바뉴(temp/status.html) 페스티벌 푸드 데이터를 기준으로 정리한다.
// - 라바뉴에 있는 요리만 남기고, 없는 것은 제거(사용자 지시)
// - status: 라바뉴 effects를 봇 드롭다운 능력치명으로 정규화
// - thumbnail: 라바뉴 값으로 세팅(동일 CDN, 정본)
// - localRecipe/localCookingType(비율/요리방법)은 국내(mabimemo) 값 유지
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const { cookings } = require(path.join(ROOT, 'modules', 'cookings.js'))

const html = fs.readFileSync(path.join(ROOT, 'temp', 'status.html'), 'utf-8')
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
if (!m) { console.error('__NEXT_DATA__ 없음'); process.exit(1) }
const pp = JSON.parse(m[1]).props.pageProps

const idToLaba = {}
for (const e of pp.effectList) idToLaba[e.id] = e.name

const statNameMap = {
  '체력': '체력', '솜씨': '솜씨', '의지': '의지', '지력': '지력', '행운': '행운',
  '스태미나': '스태미나', '생명력': '생명력', '마나': '마나', '방어': '방어', '보호': '보호',
  '마법 방어': '마법방어', '마법 보호': '마법보호', '마법 공격력': '마법공격력',
  '최대 공격력': '최대대미지', '최소 공격력': '최소대미지', '마나 회복': '마나회복'
}
const THUMB_PREFIX = 'https://tacask-cdn.com/'

const laba = {}
for (const it of pp.itemInfos) {
  laba[it.name] = {
    status: (it.effects || []).map(ef => ({ name: statNameMap[idToLaba[ef.id]] || idToLaba[ef.id], value: ef.value })),
    thumbnail: it.thumbnail ? THUMB_PREFIX + it.thumbnail : null
  }
}
const norm = s => s.replace(/\s+/g, '')
const labaByNorm = {}
Object.keys(laba).forEach(n => { labaByNorm[norm(n)] = n })

const kept = []
const removed = []
for (const c of cookings) {
  const key = laba[c.localName] ? c.localName : labaByNorm[norm(c.localName)]
  if (!key) { removed.push(c.localName); continue }
  const src = laba[key]
  c.status = src.status
  if (src.thumbnail) c.thumbnail = src.thumbnail
  kept.push(c)
}

function serializeCooking (c, indent) {
  const L = []
  L.push(`${indent}{`)
  L.push(`${indent}  originName: ${JSON.stringify(c.originName)},`)
  L.push(`${indent}  localName: ${JSON.stringify(c.localName)},`)
  L.push(`${indent}  originCookingType: ${JSON.stringify(c.originCookingType)},`)
  L.push(`${indent}  localCookingType: ${JSON.stringify(c.localCookingType)},`)
  L.push(`${indent}  originRecipe: ${JSON.stringify(c.originRecipe)},`)
  L.push(`${indent}  localRecipe: ${JSON.stringify(c.localRecipe)},`)
  L.push(`${indent}  thumbnail: ${JSON.stringify(c.thumbnail)},`)
  if (!c.status || c.status.length === 0) {
    L.push(`${indent}  status: [],`)
  } else {
    L.push(`${indent}  status: [`)
    for (let i = 0; i < c.status.length; i++) {
      const s = c.status[i]
      L.push(`${indent}    {`)
      L.push(`${indent}      name: ${JSON.stringify(s.name)},`)
      L.push(`${indent}      value: ${s.value}`)
      L.push(`${indent}    }${i < c.status.length - 1 ? ',' : ''}`)
    }
    L.push(`${indent}  ],`)
  }
  L.push(`${indent}  index: ${c.index},`)
  L.push(`${indent}  isCatering: ${c.isCatering}`)
  L.push(`${indent}}`)
  return L.join('\n')
}

const out = ['const cookings = [']
for (let i = 0; i < kept.length; i++) out.push(serializeCooking(kept[i], '  ') + (i < kept.length - 1 ? ',' : ''))
out.push(']', '', 'module.exports = {', '  cookings', '}', '')
fs.writeFileSync(path.join(ROOT, 'modules', 'cookings.js'), out.join('\n'), 'utf-8')

console.log('유지:', kept.length, '| 제거:', removed.length)
fs.writeFileSync('/Users/kerenice/.claude/jobs/da025e63/tmp/removed.txt', removed.join('\n'))
