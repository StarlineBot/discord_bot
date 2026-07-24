const fs = require('fs')
const path = require('path')

const koreanRecipes = require('./korean_recipes.json')
const koreanStats = require('./korean_stats.json')

// Build lookup by name
const recipeMap = {}
for (const r of koreanRecipes) {
  recipeMap[r.name] = r
}

// Read the original file
const filePath = path.join(__dirname, '..', 'modules', 'cookings.js')
let content = fs.readFileSync(filePath, 'utf-8')

// Load the module to get current data
const { cookings } = require(filePath)

// Stats name mapping (Korean stat names used in the file)
const statNameMap = {
  '생명력': '생명력',
  '마나': '마나',
  '스태미나': '스태미나',
  '체력': '체력',
  '지력': '지력',
  '솜씨': '솜씨',
  '의지': '의지',
  '행운': '행운',
  '최대공격력': '최대공격력',
  '마법공격력': '마법공격력',
  '보호': '보호',
  '마법보호': '마법보호',
  '방어': '방어',
  '마법방어': '마법방어'
}

function buildLocalRecipe(r) {
  const parts = []
  if (r.ing1 && r.r1) parts.push(`${r.ing1}(${r.r1}%)`)
  if (r.ing2 && r.r2) parts.push(`${r.ing2}(${r.r2}%)`)
  if (r.ing3 && r.r3) parts.push(`${r.ing3}(${r.r3}%)`)
  return parts.join(' ')
}

function buildStatus(stats) {
  const result = []
  for (const [name, value] of Object.entries(stats)) {
    result.push({ name, value })
  }
  return result
}

let recipeUpdated = 0
let statsUpdated = 0
let notFound = []

for (const cooking of cookings) {
  const name = cooking.localName

  // Update recipe
  const recipe = recipeMap[name]
  if (recipe) {
    const newLocalRecipe = buildLocalRecipe(recipe)
    if (newLocalRecipe && cooking.localRecipe !== newLocalRecipe) {
      cooking.localRecipe = newLocalRecipe
      cooking.localCookingType = recipe.type
      recipeUpdated++
    }
  } else {
    notFound.push(name)
  }

  // Update stats
  const stats = koreanStats[name]
  if (stats && Object.keys(stats).length > 0) {
    cooking.status = buildStatus(stats)
    statsUpdated++
  }
}

// Serialize back to JS
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

// Find where cookings array ends and checkCookings starts
const checkCookingsMatch = content.match(/\nconst checkCookings/)
if (!checkCookingsMatch) {
  console.error('Could not find checkCookings in file')
  process.exit(1)
}
const checkCookingsIndex = content.indexOf('\nconst checkCookings')

// Find where cookings array closes before checkCookings
// We need to rebuild from "const cookings = [" to the closing "]"
const cookingsStart = content.indexOf('const cookings = [')
// Find the matching closing bracket
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

// Build new cookings array string
const cookingsLines = ['const cookings = [']
for (let i = 0; i < cookings.length; i++) {
  const comma = i < cookings.length - 1 ? ',' : ''
  cookingsLines.push(serializeCooking(cookings[i], '  ') + comma)
}
cookingsLines.push(']')

const newContent = cookingsLines.join('\n') + '\n' + content.slice(cookingsEnd + 1)
fs.writeFileSync(filePath, newContent, 'utf-8')

console.log(`Recipe updated: ${recipeUpdated}`)
console.log(`Stats updated: ${statsUpdated}`)
console.log(`Not found in Korean data (${notFound.length}):`)
notFound.forEach(n => console.log(`  - ${n}`))
