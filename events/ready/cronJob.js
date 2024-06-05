const { EmbedBuilder } = require('discord.js')
const cron = require('cron')
const { DateTime } = require('luxon')
const axios = require('axios')
const cheerio = require('cheerio')
const guildModule = require('../../modules/getGuildInfo')

const botId = process.env.BOT_ID
const channelId = process.env.NODE_ENV === 'development'
  ? process.env.DEV_CHANNEL_ID
  : process.env.CHANNEL_ID
const otherChannelId = process.env.DEV_CHANNEL_ID
const basicErrorMessage = '오늘은 섯다라인 휴업중 🫥'
module.exports = async (client) => {
  // 봇 살아있는지 헬스체크
  const otherChannel = client.channels.cache.get(otherChannelId)
  const eachHoursJob = new cron.CronJob('0 * * * *', function () {
    const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    try {
      otherChannel.send(`현재 ${now.toFormat('yyyy년 MM월 dd일 HH:mm:ss cccc')} 아직 살아있음...`)
    } catch (error) {
      otherChannel.send(basicErrorMessage)
    }
  })

  console.log('eachHoursJob start!')
  eachHoursJob.start()

  // 매일 아침 8시에 필요한 정보들을 가져와 채널로 전송
  const cronSchedule = process.env.NODE_ENV === 'development'
    ? '0 * * * *'
    : '0 08 * * *'
  const dailyJob = new cron.CronJob(cronSchedule, async function () {
    const offset = new Date().getTimezoneOffset() * 60000
    const nowDate = new Date(Date.now() - offset)
    const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    client.guilds.cache.forEach(guild => {
      const guildInfo = guildModule.getGuildInfo(guild.id)
      if (!guildInfo) {
        return
      }

      console.log(guildInfo)
      const partyChannel = guild.channels.cache.get(guildInfo.partyChannelId)
      partyChannel.threads.cache.forEach(thread => {
        // 지우지않는 태그가 있으면 지우지 않음
        if (thread.appliedTags.indexOf('1240604477875163146') > 0 || thread.appliedTags.indexOf('1240604372660912149') > 0) {
          return
        }

        // 마찬가지로 잠금되어 있는 글도 지우지 않음
        if (thread.locked) {
          return
        }

        const createdDate = new Date(thread.createdAt)
        const betweenTime = Math.floor((nowDate.getTime() - createdDate.getTime()) / 1000 / 60)
        const betweenTimeDay = Math.floor(betweenTime / 60 / 24)
        if (betweenTimeDay > 7) {
          thread.delete().then(deletedThread => {
            otherChannel.send(`포스트 삭제 됨, 제목: ${deletedThread.name}, 생성일: ${deletedThread.createdAt}`)
          }).catch(console.error)
        }
      })
    })

    const { todayVeteran, tomorrowVeteran, getTodayMission, getTomorrowMission } = require(
      '../../modules/todayMission')(now, nowDate)
    const channel = client.channels.cache.get(channelId)
    try {
      channel.send(
          `오늘은 ${now.toFormat('yyyy년 MM월 dd일 cccc')}, 오늘의 미션과 간추린뉴스 전달해줄게~!😎`)
      const todayMissionObject = await getTodayMission()
      const todayMission = todayMissionObject.data.missions[0]

      const tomorrowMissionObject = await getTomorrowMission()
      const tomorrowMission = tomorrowMissionObject.data.missions[0]

      const todayEmbed = new EmbedBuilder()
        .setTitle('오늘의 미션&베테랑')
        .setColor('#86E57F')
        .addFields(
          { name: '베테랑 던전', value: `- ${todayVeteran.dungeon}` }
          , {
            name: '탈틴',
            value: `- ${todayMission.Taillteann.Normal}\n* (PC방) ${todayMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${todayMission.Tara.Normal}\n* (PC방) ${todayMission.Tara.VIP}`
          }
        )
        .setTitle('오늘의 미션&베테랑')

      const tomorrowEmbed = new EmbedBuilder()
        .setTitle('내일의 미션&베테랑')
        .setColor('#FFBB00')
        .addFields(
          { name: '베테랑 던전', value: `- ${tomorrowVeteran.dungeon}` }
          , {
            name: '탈틴',
            value: `- ${tomorrowMission.Taillteann.Normal}\n* (PC방) ${tomorrowMission.Taillteann.VIP}`
          }
          , {
            name: '타라',
            value: `- ${tomorrowMission.Tara.Normal}\n* (PC방) ${tomorrowMission.Tara.VIP}`
          }
        )
        .setTimestamp()
      channel.send({ embeds: [todayEmbed, tomorrowEmbed] })

      channel.send(
        '\n\n=====================================\n아래는 https://quicknews.co.kr/ 에서 가져오는 간추린아침뉴스야!\n\n')

      const getBody = await axios.get('https://quicknews.co.kr/')
      const $ = cheerio.load(getBody.data)
      const content = $('#news_0').text()

      channel.send(content)
      channel.send('오늘도 화이팅!🤩')
    } catch (error) {
      channel.send(basicErrorMessage)
      channel.send(error)

      if (process.env.NODE_ENV === 'production') {
        otherChannel.send(basicErrorMessage + '\n' + error)
      }
    }
  })

  console.log('dailyJob start!')
  dailyJob.start()

  const partySchedule = process.env.NODE_ENV === 'development'
    ? '* * * * *'
    : '*/10 * * * *'
  const partyScheduleJob = new cron.CronJob(partySchedule, async function () {
    const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    client.guilds.cache.forEach(guild => {
      const guildInfo = guildModule.getGuildInfo(guild.id)
      if (typeof guildInfo === typeof undefined) {
        return
      }
      const partyChannel = client.channels.cache.get(guildInfo.partyChannelId)
      partyChannel.threads.cache.forEach(thread => {
        thread.messages.fetch().then(messages => {
          const originMessage = messages.find(message => message.author.id === botId && message.channelId === message.id)
          if (typeof originMessage === typeof undefined) {
            return
          }

          const dungeonNameMessage = messages.find(message => message.author.id === botId && message.content.includes('모집던전:'))
          if (typeof dungeonNameMessage === typeof undefined) {
            return
          }
          const dungeonName = dungeonNameMessage.content.split(':')[1].trim()

          const startDateMessage = messages.find(message => message.content.includes('출발시간:'))
          if (typeof startDateMessage === typeof undefined) {
            return
          }
          const startDate = DateTime.fromFormat(`${now.get('year')}년 ${startDateMessage.content.split(':')[1].trim()} 00분`, 'yyyy년 MM월 dd일 cccc HH시 mm분', {
            locale: 'ko'
          })

          const jsNow = now.toJSDate()
          const jsStartDate = startDate.toJSDate()
          if (jsStartDate.getTime() > jsNow.getTime()) {
            let diff = jsStartDate - jsNow
            const diffDays = Math.floor((jsStartDate.getTime() - jsNow.getTime()) / (1000 * 60 * 60 * 24))
            diff -= diffDays * (1000 * 60 * 60 * 24)
            const diffHours = Math.floor(diff / (1000 * 60 * 60))
            diff -= diffHours * (1000 * 60 * 60)
            const diffMin = Math.floor(diff / (1000 * 60))
            /*
            diff -= diffMin * (1000 * 60)
            const diffSec = Math.floor(diff / 1000)
            */
            if (diffDays === 0 && diffHours === 0 && diffMin === 10) {
              originMessage.mentions.users.forEach(member => {
                if (member.bot) {
                  return
                }
                if (member.id === botId) {
                  return
                }
                member.send(`시작 ${diffMin}분전 알림: ${guild.name}의 파티모집에서 참가신청한 [${dungeonName}] 파티가 곧 출발합니다.`)
              })
            }
          }
        })
      })
    })
  })

  console.log('partyScheduleJob start!')
  partyScheduleJob.start()
}
