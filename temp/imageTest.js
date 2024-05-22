const uuid4 = require('uuid4')
const { unlink } = require('node:fs/promises')
const puppeteer = require('puppeteer')

const imageTest = async function () {
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

imageTest()
