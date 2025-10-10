const axios = require('axios')
const puppeteer = require("puppeteer")
const cheerio = require('cheerio')
const { DateTime } = require('luxon')
const veteran = ['알비', '키아', '라비', '마스', '피오드', '바리', '코일', '룬다', '페카']
const start = new Date('2025-10-10');
const diffDays = Math.floor((Date.now() - start.getTime()) / 86400000);
const startIndex = veteran.indexOf('마스');
const index = (startIndex + diffDays) % veteran.length;

/* eslint-disable */
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
/* eslint-disable */

const todayVeteran = veteran[index]
const tomorrowVeteran = veteran[index+1]

module.exports = (today, now) => {
  const getTodayMissionToBrowser = async () => {
    const url = 'https://mabi.world/missions.php?server=korea&locale=korea&from=' + now.toISOString()
    console.log(url)
    try {
      const browser = await puppeteer.launch({
        // 옵션으로 브라우저 엔진을 어디서 가져오는지 설정
        executablePath: '/usr/bin/chromium-browser'
      })
      const page = await browser.newPage()
      const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
      await page.setUserAgent(customUA);
      await page.goto(url)
      const body = await page.content();
      console.log(body)
      const $ = cheerio.load(body)
      const data = JSON.parse($("pre").text());
      console.log(data)
      browser.close()
      return data
    } catch (e) {
      console.log(e)
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

  const getTomorrowMissionToBrowser = async () => {
    const url = 'https://mabi.world/missions.php?server=korea&locale=korea&from=' + now.addDays(1).toISOString()
    try {
      const browser = await puppeteer.launch({
        // 옵션으로 브라우저 엔진을 어디서 가져오는지 설정
        executablePath: '/usr/bin/chromium-browser'
      })
      const page = await browser.newPage()
      const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
      await page.setUserAgent(customUA);
      await page.goto(url)
      const body = await page.content();
      console.log(body)
      const $ = cheerio.load(body)
      const data = JSON.parse($("pre").text());
      console.log(data)
      browser.close()
      return data
    } catch (e) {
      console.log(e)
    }
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
    todayVeteran, tomorrowVeteran, getTodayMissionToBrowser, getTomorrowMissionToBrowser
  }
}
