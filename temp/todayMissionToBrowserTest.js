const puppeteer = require("puppeteer")
const cheerio = require('cheerio')

const todayMissionToBrowser = async function () {
  const offset = new Date().getTimezoneOffset() * 60000
  const now = new Date(Date.now() - offset)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const url = 'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.toISOString()
  console.log(url);
  await page.goto(url)
  const body = await page.content();
  const $ = cheerio.load(body)
  const data = JSON.parse($("pre").text())
  console.log(data)
  browser.close()
}

todayMissionToBrowser()