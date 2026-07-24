// 국내(mabimemo = korean_recipes.json)를 정본으로 cookings.js를 재구성한다.
// - 국내 504개 레시피: localName/localRecipe/localCookingType는 국내 기준으로 세팅
//   status/thumbnail/origin* 는 기존 파일에서 매칭해 살린다(없으면 빈 값).
// - 기존 파일에만 있던 이벤트/콜라보/술 등(국내 목록에 없음)은 그대로 유지.
// - 해외명/국내명 중복은 하나로 합친다.
const fs = require('fs')
const path = require('path')

const { cookings: base } = require('../modules/cookings.js') // 병합 후 상태(=status/thumb 반영됨)
const kr = require('./korean_recipes.json')

// 파일명 -> 국내명 매핑(기존 fix_names.js 것 재사용)
const nameMapping = {
  '옥수수 수프': '옥수수 스프', '치즈버거': '치즈 버거', '치즈떡볶이': '치즈 떡볶이',
  '브리흐네 잉어 구이': '브리흐네 잉어구이', '갈치회 국수': '갈치회국수', '거대 별사탕': '거대한 별사탕',
  '버터구이 랍스터': '버터구이 랍스타', '셀러리 샐러드': '샐러리 샐러드', '초코 케이크': '초콜릿 케이크',
  '치즈 빵': '치즈빵', '빙어튀김': '빙어 튀김', '마늘 빵': '마늘빵', '새우 초밥': '새우초밥',
  '까맣게 구워진 드래곤의 심장': '까맣게 구워진 드래곤 심장', '소고기 스테이크': '비프 스테이크',
  '장어구이': '장어 구이', '뭉개진 두부': '뭉개진 구운 콩가루 두부', '버섯 카푸치노수프': '버섯 카푸치노스프',
  '베이컨 구이': '베이컨구이', '샥스핀 수프': '샥스핀 스프', '닭날개 구이': '닭날개구이',
  '김치 볶음밥': '김치볶음밥', '문어 숙회': '문어숙회', '가벼운 연어 샐러드': '다이어트 연어 샐러드',
  '새우 볶음밥': '새우볶음밥', '딸기 찹쌀떡': '딸기 찹살떡', '브리흐네 잉어 찜': '브리흐네 잉어찜',
  '따뜻한 온천 달걀': '따끈한 온천 달걀', '타라 소시지 샌드위치': '타라식 소시지 샌드위치',
  '배지터블 카나페': '베지터블 카나페', '딸기 쇼트ㅔ익': '딸기 쇼트케익', '모둠조개회': '모둠생선회',
  '계란샐러드': '계란 샐러드'
}

const domNameSet = new Set(kr.map(r => r.name))

function buildLocalRecipe (r) {
  const parts = []
  if (r.ing1 && (r.r1 || r.r1 === 0) && r.r1 !== '') parts.push(`${r.ing1}(${r.r1}%)`)
  if (r.ing2 && (r.r2 || r.r2 === 0) && r.r2 !== '') parts.push(`${r.ing2}(${r.r2}%)`)
  if (r.ing3 && (r.r3 || r.r3 === 0) && r.r3 !== '') parts.push(`${r.ing3}(${r.r3}%)`)
  return parts.join(' ')
}

function hasData (c) {
  return (c.thumbnail && c.thumbnail !== '') || (c.status && c.status.length > 0)
}

// base 인덱싱
const byName = {}
base.forEach(c => { (byName[c.localName] = byName[c.localName] || []).push(c) })
// 국내명 -> 해외명 후보
const rev = {}
for (const [f, d] of Object.entries(nameMapping)) { (rev[d] = rev[d] || []).push(f) }

// 인덱스 관리
let maxIndex = 0
base.forEach(c => { if (typeof c.index === 'number' && c.index > maxIndex) maxIndex = c.index })
let nextIndex = maxIndex + 1

const usedBaseRefs = new Set() // 정본에 소비된 base 엔트리(참조 동일성)
const result = []

let salvagedThumb = 0; let salvagedStatus = 0; let brandNew = 0

for (const r of kr) {
  const cands = []
  if (byName[r.name]) cands.push(...byName[r.name])
  if (rev[r.name]) for (const fn of rev[r.name]) if (byName[fn]) cands.push(...byName[fn])
  cands.forEach(c => usedBaseRefs.add(c))
  const best = cands.length ? cands.slice().sort((a, b) => (hasData(b) ? 1 : 0) - (hasData(a) ? 1 : 0))[0] : null

  const entry = {
    originName: best ? (best.originName || '') : '',
    localName: r.name,
    originCookingType: best ? (best.originCookingType || '') : '',
    localCookingType: r.type || (best ? best.localCookingType : '') || '',
    originRecipe: best ? (best.originRecipe || '') : '',
    localRecipe: buildLocalRecipe(r),
    thumbnail: best && best.thumbnail ? best.thumbnail : null,
    status: best && best.status ? best.status : [],
    index: best && typeof best.index === 'number' ? best.index : nextIndex++,
    isCatering: best && typeof best.isCatering === 'boolean' ? best.isCatering : true
  }
  if (entry.thumbnail) salvagedThumb++
  if (entry.status.length > 0) salvagedStatus++
  if (!best) brandNew++
  result.push(entry)
}

// 국내에 없는 기존 항목(이벤트/콜라보/술 등)은 그대로 유지
const extras = base.filter(c => !usedBaseRefs.has(c) && !domNameSet.has(c.localName))
for (const c of extras) {
  result.push({
    originName: c.originName || '',
    localName: c.localName,
    originCookingType: c.originCookingType || '',
    localCookingType: c.localCookingType || '',
    originRecipe: c.originRecipe || '',
    localRecipe: c.localRecipe || '',
    thumbnail: c.thumbnail || null,
    status: c.status || [],
    index: typeof c.index === 'number' ? c.index : nextIndex++,
    isCatering: typeof c.isCatering === 'boolean' ? c.isCatering : true
  })
}

// 인덱스 중복 방지(혹시 모를 충돌 정리)
const seenIdx = new Set()
for (const e of result) {
  if (seenIdx.has(e.index)) e.index = nextIndex++
  seenIdx.add(e.index)
}

// 직렬화
function serializeCooking (c, indent) {
  const lines = []
  lines.push(`${indent}{`)
  lines.push(`${indent}  originName: ${JSON.stringify(c.originName)},`)
  lines.push(`${indent}  localName: ${JSON.stringify(c.localName)},`)
  lines.push(`${indent}  originCookingType: ${JSON.stringify(c.originCookingType)},`)
  lines.push(`${indent}  localCookingType: ${JSON.stringify(c.localCookingType)},`)
  lines.push(`${indent}  originRecipe: ${JSON.stringify(c.originRecipe)},`)
  lines.push(`${indent}  localRecipe: ${JSON.stringify(c.localRecipe)},`)
  lines.push(`${indent}  thumbnail: ${JSON.stringify(c.thumbnail)},`)
  if (c.status.length === 0) {
    lines.push(`${indent}  status: [],`)
  } else {
    lines.push(`${indent}  status: [`)
    for (let i = 0; i < c.status.length; i++) {
      const s = c.status[i]
      const comma = i < c.status.length - 1 ? ',' : ''
      lines.push(`${indent}    {`)
      lines.push(`${indent}      name: ${JSON.stringify(s.name)},`)
      lines.push(`${indent}      value: ${s.value}`)
      lines.push(`${indent}    }${comma}`)
    }
    lines.push(`${indent}  ],`)
  }
  lines.push(`${indent}  index: ${c.index},`)
  lines.push(`${indent}  isCatering: ${c.isCatering}`)
  lines.push(`${indent}}`)
  return lines.join('\n')
}

const out = ['const cookings = [']
for (let i = 0; i < result.length; i++) {
  out.push(serializeCooking(result[i], '  ') + (i < result.length - 1 ? ',' : ''))
}
out.push(']')
out.push('')
out.push('module.exports = {')
out.push('  cookings')
out.push('}')
out.push('')

const filePath = path.join(__dirname, '..', 'modules', 'cookings.js')
fs.writeFileSync(filePath, out.join('\n'), 'utf-8')

console.log('국내 정본:', kr.length, '| 유지(extras):', extras.length, '| 최종:', result.length)
console.log('썸네일 살림:', salvagedThumb, '| status 살림:', salvagedStatus, '| 완전 신규:', brandNew)
