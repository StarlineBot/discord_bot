// cookingInfo.js의 getImage 로직과 동일하게 비율 막대 이미지를 미리 생성한다.
// 결과: static/img/cookings/cooking-{index}.png (있으면 재생성, 없으면 생성)
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const { cookings } = require(path.join(ROOT, 'modules', 'cookings.js'))

const bg = fs.readFileSync(path.join(ROOT, 'static', 'img', 'mabi_cook2_ver2.png'))
const dataURI = 'data:image/jpeg;base64,' + Buffer.from(bg).toString('base64')
const colors = ['#F2CB61', '#F15F5F']
const outDir = path.join(ROOT, 'static', 'img', 'cookings')
fs.mkdirSync(outDir, { recursive: true })

const regex = /[^0-9]/gi

// cookingInfo.js와 동일한 값 파싱
function parseValues (localRecipe) {
  const values = []
  const getRecipes = localRecipe.split('%')
  for (let i = 0; i < getRecipes.length; i++) {
    const getRecipe = getRecipes[i]
    if (getRecipe === '') continue
    values.push(getRecipe.replace(regex, ''))
  }
  return values
}

function buildBoxes (values) {
  let html = ''
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const color = colors[i]
    if (value === null) continue
    html += `<div class="graph_box" style="width: ${value}%; background-color: ${color};"></div>`
  }
  return html
}

const HTML = '<!DOCTYPE html><html lang="en"><head><style>' +
  '.cookInfo{position:relative;width:265px;height:110px;}' +
  '.graph{position:absolute;border:1px solid #000;top:40px;background-color:#000;height:7px;width:241px;margin-left:10px;display:flex;}' +
  '.graph_box{position:relative;height:8px;box-sizing:border-box;}' +
  '</style></head><body style="margin:0;height:100%;background-color:rgb(14,14,14);">' +
  '<div class="cookInfo"><div class="graph">{{{graphBoxes}}}</div>' +
  '<img src="{{imageSource}}" alt="" style="padding: 10px; background-color: #406D8F;"></div></body></html>'

const targets = cookings.filter(c => c.localRecipe && c.localRecipe.trim() !== '')

async function main () {
  const batchSize = 40
  let done = 0
  for (let i = 0; i < targets.length; i += batchSize) {
    const slice = targets.slice(i, i + batchSize)
    const content = slice.map(c => ({
      output: path.join(outDir, `cooking-${c.index}.png`),
      graphBoxes: buildBoxes(parseValues(c.localRecipe)),
      imageSource: dataURI
    }))
    await nodeHtmlToImage({ html: HTML, selector: 'div.cookInfo', content, puppeteerArgs: {} })
    done += slice.length
    process.stdout.write(`\r생성 ${done}/${targets.length}`)
  }
  console.log(`\n완료: ${targets.length}장`)
}

main().catch(e => { console.error(e); process.exit(1) })
