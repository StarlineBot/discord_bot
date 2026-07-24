const fs = require('fs')
const path = require('path')

// Manual name mapping: file name -> korean site name
const nameMapping = {
  '옥수수 수프': '옥수수 스프',
  '치즈버거': '치즈 버거',
  '치즈떡볶이': '치즈 떡볶이',
  '브리흐네 잉어 구이': '브리흐네 잉어구이',
  '갈치회 국수': '갈치회국수',
  '거대 별사탕': '거대한 별사탕',
  '버터구이 랍스터': '버터구이 랍스타',
  '셀러리 샐러드': '샐러리 샐러드',
  '초코 케이크': '초콜릿 케이크',
  '치즈 빵': '치즈빵',
  '빙어튀김': '빙어 튀김',
  '마늘 빵': '마늘빵',
  '새우 초밥': '새우초밥',
  '까맣게 구워진 드래곤의 심장': '까맣게 구워진 드래곤 심장',
  '소고기 스테이크': '비프 스테이크',
  '장어구이': '장어 구이',
  '뭉개진 두부': '뭉개진 구운 콩가루 두부',
  '버섯 카푸치노수프': '버섯 카푸치노스프',
  '베이컨 구이': '베이컨구이',
  '샥스핀 수프': '샥스핀 스프',
  '닭날개 구이': '닭날개구이',
  '김치 볶음밥': '김치볶음밥',
  '문어 숙회': '문어숙회',
  '가벼운 연어 샐러드': '다이어트 연어 샐러드',
  '새우 볶음밥': '새우볶음밥',
  '딸기 찹쌀떡': '딸기 찹살떡',
  '브리흐네 잉어 찜': '브리흐네 잉어찜',
  '따뜻한 온천 달걀': '따끈한 온천 달걀',
  '타라 소시지 샌드위치': '타라식 소시지 샌드위치',
  '배지터블 카나페': '베지터블 카나페',
  '딸기 쇼트ㅔ익': '딸기 쇼트케익',
  '모둠조개회': '모둠생선회',
  '계란샐러드': '계란 샐러드'
}

const koreanRecipes = require('./korean_recipes.json')
const koreanStats = require('./korean_stats.json')

const recipeMap = {}
for (const r of koreanRecipes) {
  recipeMap[r.name] = r
}

const filePath = path.join(__dirname, '..', 'modules', 'cookings.js')
const { cookings } = require(filePath)

function buildLocalRecipe(r) {
  const parts = []
  if (r.ing1 && r.r1) parts.push(`${r.ing1}(${r.r1}%)`)
  if (r.ing2 && r.r2) parts.push(`${r.ing2}(${r.r2}%)`)
  if (r.ing3 && r.r3) parts.push(`${r.ing3}(${r.r3}%)`)
  return parts.join(' ')
}

let updated = 0

for (const cooking of cookings) {
  const mappedName = nameMapping[cooking.localName]
  if (!mappedName) continue

  const recipe = recipeMap[mappedName]
  if (recipe) {
    const newLocalRecipe = buildLocalRecipe(recipe)
    if (newLocalRecipe) {
      cooking.localRecipe = newLocalRecipe
      cooking.localCookingType = recipe.type
      updated++
      console.log(`Updated recipe: ${cooking.localName} -> ${mappedName}`)
    }
  }

  const stats = koreanStats[mappedName]
  if (stats && Object.keys(stats).length > 0) {
    cooking.status = Object.entries(stats).map(([name, value]) => ({ name, value }))
    console.log(`Updated stats: ${cooking.localName}`)
  }
}

// Serialize
function serializeCooking(c, indent) {
  const lines = []
  lines.push(`${indent}{`)
  lines.push(`${indent}  originName: ${JSON.stringify(c.originName)},`)
  lines.push(`${indent}  localName: ${JSON.stringify(c.localName)},`)
  lines.push(`${indent}  originCookingType: ${JSON.stringify(c.originCookingType)},`)
  lines.push(`${indent}  localCookingType: ${JSON.stringify(c.localCookingType)},`)
  lines.push(`${indent}  originRecipe: ${JSON.stringify(c.originRecipe)},`)
  lines.push(`${indent}  localRecipe: ${JSON.stringify(c.localRecipe)},`)
  lines.push(`${indent}  thumbnail: ${JSON.stringify(c.thumbnail)},`)
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
  lines.push(`${indent}  index: ${c.index},`)
  lines.push(`${indent}  isCatering: ${c.isCatering}`)
  lines.push(`${indent}}`)
  return lines.join('\n')
}

let content = fs.readFileSync(filePath, 'utf-8')
const checkCookingsIndex = content.indexOf('\nconst checkCookings')
const cookingsStart = content.indexOf('const cookings = [')
let bracketCount = 0
let cookingsEnd = -1
for (let i = cookingsStart + 'const cookings = ['.length; i < checkCookingsIndex; i++) {
  if (content[i] === '[') bracketCount++
  if (content[i] === ']') {
    if (bracketCount === 0) {
      cookingsEnd = i + 1
      break
    }
    bracketCount--
  }
}

const cookingsLines = ['const cookings = [']
for (let i = 0; i < cookings.length; i++) {
  const comma = i < cookings.length - 1 ? ',' : ''
  cookingsLines.push(serializeCooking(cookings[i], '  ') + comma)
}
cookingsLines.push(']')

const newContent = cookingsLines.join('\n') + '\n' + content.slice(cookingsEnd + 1)
fs.writeFileSync(filePath, newContent, 'utf-8')

console.log(`\nTotal additionally updated: ${updated}`)
