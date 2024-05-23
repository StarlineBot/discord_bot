const uuid4 = require('uuid4')
/*
const { unlink } = require('node:fs/promises')
const puppeteer = require('puppeteer')
*/
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('node:fs')

/*
const htmlToImageTest = async function () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width: 265, height: 114 })
  await page.goto('http://localhost:3000/?value0=80&value1=10&value2=10&value3=')
  await page.waitForSelector('#domToImage')

  const id = uuid4()
  const data = await page.screenshot({
    path: './static/img/img-' + id + '.png'
  })
  console.log(data)
  await page.close()
  await browser.close()
  console.log('./static/img/img-' + id + '.png')
  await unlink('./static/img/img-' + id + '.png')
}
*/

const nodeHtmlToImageTest = function () {
  const image = fs.readFileSync('./static/img/mabi_cook2_ver2.png')
  /* eslint new-cap: ["error", { "newIsCap": false }] */
  const base64Image = new Buffer.from(image).toString('base64')
  const dataURI = 'data:image/jpeg;base64,' + base64Image

  let html = '<!DOCTYPE html>\n' +
      '<html lang="en">' +
      '<head>' +
      '<style>' +
      '    .cookInfo {' +
      '      position: relative; width: 265px; height: 110px;' +
      '    }' +
      '    .graph {' +
      '      position: absolute;' +
      '      border: 1px solid #000;' +
      '      top: 40px;' +
      '      background-color: #000;' +
      '      height: 7px;' +
      '      width: 241px;' +
      '      margin-left: 10px;' +
      '      display: flex;' +
      '    }' +
      '    .graph_box {' +
      '      position: relative;' +
      '      height: 8px;' +
      '      box-sizing: border-box;' +
      '    }' +
      '  </style>' +
      '</head>' +
      '<body style="margin: 0; height: 100%; background-color: rgb(14, 14, 14);">' +
      '  <div class="cookInfo">' +
      '    <div class="graph">'
  const colors = ['#F2CB61', '#F15F5F']
  const values = [65, 30, 5]
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const color = colors[i]
    if (value === null) {
      continue
    }
    html += `<div class="graph_box" style="width: ${value}%; background-color: ${color};"></div>`
  }
  html += ' </div>' +
      '    <img src="{{imageSource}}" alt="" style="padding: 10px; background-color: #406D8F;">' +
      '  </div>' +
      '</body>' +
      '</html>'

  console.log(html)
  const id = uuid4()
  nodeHtmlToImage({
    output: `./static/img/img-${id}.png`,
    html,
    selector: 'div.cookInfo',
    content: {
      imageSource: dataURI
    }
  }).then((result) => {
    console.log(result)
  })
}

// htmlToImageTest()
nodeHtmlToImageTest()
