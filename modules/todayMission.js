const axios = require('axios')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']
const start = new Date('2025-10-10')
const startIndex = veteran.indexOf('마스')

/* eslint-disable */
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
/* eslint-disable */

module.exports = (today, now) => {

  const getVeteran = function () {
    const diffDays = Math.floor((now - start.getTime()) / 86400000)
    const len = veteran.length
    // 음수(기준일 이전)에도 안전하도록 정규화
    const index = (((startIndex + diffDays) % len) + len) % len
    const today = veteran[index]
    const tomorrow = veteran[(index + 1) % len]
    return { today, tomorrow }
  }

  // today/tomorrow 미션을 브라우저 1개로 조회(브라우저 기동 1회, 에러 시에도 finally로 종료)
  const getMissions = async () => {
    const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
    const puppeteerArgs = process.env.NODE_ENV !== 'development' ? { executablePath: '/usr/bin/chromium-browser' } : {}
    const browser = await puppeteer.launch(puppeteerArgs)
    try {
      const page = await browser.newPage()
      await page.setUserAgent(customUA)
      const fetchAt = async (iso) => {
        const url = 'https://mabi.world/missions.php?server=korea&locale=korea&from=' + iso
        console.log(url)
        await page.goto(url)
        const body = await page.content()
        return JSON.parse(cheerio.load(body)('pre').text())
      }
      const today = await fetchAt(now.toISOString())
      const tomorrow = await fetchAt(now.addDays(1).toISOString())
      return { today, tomorrow }
    } finally {
      await browser.close()
    }
  }

  const getTodayMission = async () => {
    console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.toISOString())
    return await axios.get(
        'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.toISOString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://www.google.com",
            "Connection": "keep-alive"
          },
          withCredentials: true
        }).catch((e) => {
          console.log(e.response.data)
    })
  }

  const getTomorrowMission = async () => {
    console.log('https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.addDays(1).toISOString())
    return await axios.get(
        'https://mabi.world/missions.php?server=korea&locale=korea&from=' +
        now.addDays(1).toISOString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://www.google.com",
            "Connection": "keep-alive"
          },
          withCredentials: true
        }).catch((e) => {
      console.log(e.response.data)
    })
  }

  return {
    getVeteran, getMissions
  }
}
