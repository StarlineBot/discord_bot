const puppeteer = require("puppeteer")
const cheerio = require('cheerio')

const todayMissionToBrowser = async function () {
  const offset = new Date().getTimezoneOffset() * 60000
  const now = new Date(Date.now() - offset)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
  await page.setUserAgent(customUA);
  const url = 'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
      now.toISOString()
  console.log(url);
  await page.goto(url)
  const body = await page.content();
  console.log(body)
  const $ = cheerio.load(body)
  const data = JSON.parse($("pre").text())
  console.log(data)
  console.log(data.missions[0])
  browser.close()
}

todayMissionToBrowser()