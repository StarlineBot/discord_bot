const { EmbedBuilder } = require('discord.js')
const cron = require('cron')
const { DateTime } = require('luxon')
const axios = require('axios')
const cheerio = require('cheerio')
const guildModule = require('../../modules/getGuildInfo')
const { getDate } = require('../../modules/common')
const nexonApiMainUrl = 'https://open.api.nexon.com'
const nexonApiKey = process.env.NEXON_API_KEY
const fs = require('fs')

const botId = process.env.BOT_ID
const todayMissionChannelId = process.env.NODE_ENV === 'development'
  ? process.env.DEV_TODAY_MISSION_CHANNEL_ID
  : process.env.TODAY_MISSION_CHANNEL_ID
const dailyNewsChannelId = process.env.NODE_ENV === 'development'
  ? process.env.DEV_DAILY_NEWS_CHANNEl_ID
  : process.env.DAILY_NEWS_CHANNEl_ID
const otherChannelId = process.env.DEV_CHANNEL_ID
const bugleHornChannelId = process.env.NODE_ENV === 'development' ? process.env.DEV_BUGLE_HORN_CHANNEL_ID : process.env.BUGLE_HORN_CHANNEL_ID
const generalChannelId = process.env.NODE_ENV === 'development' ? process.env.DEV_GENERAL_CHANNEL_ID : process.env.GUILD_GENERAL_CHANNEL_ID
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
    ? '* * * * *'
    : '0 07 * * *'
  const dailyThreadDeleteJob = new cron.CronJob(cronSchedule, async function () {
    const offset = new Date().getTimezoneOffset() * 60000
    const nowDate = new Date(Date.now() - offset)
    client.guilds.cache.forEach(guild => {
      const guildInfo = guildModule.getGuildInfo(guild.id)
      if (!guildInfo) {
        return
      }

      const partyChannel = guild.channels.cache.get(guildInfo.partyChannelId)
      if (!partyChannel) {
        return
      }
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
        if (betweenTimeDay > 10) {
          thread.delete().then(deletedThread => {
            otherChannel.send(`포스트 삭제 됨, 제목: ${deletedThread.name}, 생성일: ${deletedThread.createdAt}`)
          }).catch(console.error)
        }
      })
    })
  })

  console.log('dailyThreadDeleteJob start!')
  dailyThreadDeleteJob.start()

  const dailyJob = new cron.CronJob('0 08 * * *', async function () {
    const offset = new Date().getTimezoneOffset() * 60000
    const nowDate = new Date(Date.now() - offset)
    const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    const { todayVeteran, tomorrowVeteran, getTodayMission, getTomorrowMission } = require(
      '../../modules/todayMission')(now, nowDate)

    const todayMissionChannel = client.channels.cache.get(todayMissionChannelId)
    if (!todayMissionChannel) {
      return
    }

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
    todayMissionChannel.send({ embeds: [todayEmbed, tomorrowEmbed] })

    const dailyNewsChannel = client.channels.cache.get(dailyNewsChannelId)
    if (!dailyNewsChannel) {
      return
    }
    const getBody = await axios.get('https://quicknews.co.kr/')
    const $ = cheerio.load(getBody.data)
    const content = '간추린뉴스 출처: https://quicknews.co.kr\n\n' + $('#news_0').text()

    dailyNewsChannel.send(content)
  })

  console.log('dailyJob start!')
  dailyJob.start()

  const weeklyCronSchedule = process.env.NODE_ENV === 'development'
      ? '* * * * *'
      : '0 0 * * 0'
  const weeklyJob = new cron.CronJob(weeklyCronSchedule, async function () {
    let userMessageCounts = {};
    // 파일에서 데이터 불러오기
    if (!fs.existsSync('./static/json/userMessageCount.json')) {
      return
    }
    userMessageCounts = JSON.parse(fs.readFileSync('./static/json/userMessageCount.json'));
    client.guilds.cache.forEach(guild => {
      const guildInfo = guildModule.getGuildInfo(guild.id)
      if (!guildInfo) {
        return
      }
      if (typeof userMessageCounts[guildInfo.guildId] === typeof undefined) {
        return
      }
      let userTextRank = Object.entries(userMessageCounts[guildInfo.guildId]).sort((a,b) => b[1] - a[1])
      let generalChannelId = guildInfo.generalChannelId
      if (userTextRank.length === 0) {
        return
      }
      let embedList = []
      userTextRank.forEach(([key, value], index) => {
        if (index === 4) {
          return
        }
        let rank = index + 1
        let medal;
        switch(rank) {
          case 1:
            medal = '🥇'
            break;
          case 2:
            medal = '🥈'
            break;
          case 3:
          default:
            medal = '🥉'
            break;
        }
        embedList.push(
            new EmbedBuilder()
            .setTitle(`🌟이주의 채팅 랭킹 TOP ${medal}`)
            .setColor('#FFD9EC')
            .setDescription(
                `<@${key}> 님이 이 주에 ${value}번을 떠들었어요~.`)
            .setTimestamp()
        )
      })

      guild.channels.cache.find(channel => channel.id === guildInfo.generalChannelId).send(
          { embeds: [embedList] })

      // 매주 한번 채팅 수집내역 초기화
      userMessageCounts[guildInfo.guildId] = {};

      // 변경된 데이터 저장
      fs.writeFileSync('./static/json/userMessageCount.json', JSON.stringify(userMessageCounts, null, 2));
    })
  })

  console.log('weeklyJob start!')
  weeklyJob.start()

  const partyScheduleJob = new cron.CronJob('* * * * *', async function () {
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
          // const dungeonName = dungeonNameMessage.content.split(':')[1].trim()
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

                const writer = { name: originMessage.author.username, iconURL: originMessage.author.displayAvatarURL() }
                const embed = new EmbedBuilder()
                  .setAuthor(writer)
                  .setTitle(`시작 ${diffMin}분전 알림`)
                  .setColor('#EAEAEA')
                  .setDescription(`${guild.name}의 <#${partyChannel.id}>에서 참가신청한 <#${thread.id}> 파티가 곧 출발합니다.`)
                  .setTimestamp()
                member.send({ embeds: [embed] })
              })
            }
          }
        })
      })
    })
  })

  console.log('partyScheduleJob start!')
  partyScheduleJob.start()

  const bugleHornChannel = client.channels.cache.get(bugleHornChannelId)
  const bugleHornJob = new cron.CronJob('*/5 * * * * *', async function () {
    const getBody = await axios({
      method: 'GET',
      url: nexonApiMainUrl + '/mabinogi/v1/horn-bugle-world/history?server_name=하프',
      headers: {
        'x-nxopen-api-key': nexonApiKey
      }
    })
    const hornBugleList = getBody.data.horn_bugle_world_history

    let beforeHornBugle
    if (!fs.existsSync('./static/json/hornBugle.json')) {
      fs.writeFileSync('./static/json/hornBugle.json', JSON.stringify(hornBugleList[0]))
    } else {
      beforeHornBugle = JSON.parse(fs.readFileSync('./static/json/hornBugle.json'))
    }

    const newHornBugleList = []
    for (const hornBugle of hornBugleList) {
      if (hornBugle.message.startsWith(hornBugle.character_name + ' : #')) {
        continue
      }
      if (typeof beforeHornBugle !== typeof undefined &&
          beforeHornBugle.character_name === hornBugle.character_name &&
          beforeHornBugle.message === hornBugle.message &&
          beforeHornBugle.date_send === hornBugle.date_send) {
        break
      }
      newHornBugleList.push(hornBugle)
    }

    const embeds = new Map()
    let embedIndex = 0
    for (let i = newHornBugleList.length - 1; i >= 0; i--) {
      const hornBugle = newHornBugleList[i]
      if (i === 0) {
        fs.writeFileSync('./static/json/hornBugle.json', JSON.stringify(hornBugle))
      }
      const hornBugleEmbed = new EmbedBuilder()
        .setTitle('거대한 외침의 뿔피리')
        .setColor(`${getRandomColor()}`)
        .setThumbnail('attachment://horn.png')
        .addFields(
          { name: '작성일시', value: getDate(new Date(hornBugle.date_send)) },
          { name: '작성자', value: hornBugle.character_name },
          { name: '내용', value: hornBugle.message }
        )
        .setTimestamp()
      embeds.set(embedIndex, hornBugleEmbed)
      embedIndex++
    }

    if (embeds.size > 0) {
      const resultEmbedMap = new Map()
      let index = 0
      const embedList = [...embeds.values()]
      for (let i = 0; i < embedList.length; i += 10) {
        const tempList = embedList.slice(i, i + 10)
        resultEmbedMap.set(index, tempList)
        index++
      }

      const resultEmbedList = [...resultEmbedMap.values()]
      for (const resultEmbed of resultEmbedList) {
        await bugleHornChannel.send({ embeds: resultEmbed, files: [{ attachment: './static/img/horn.png', name: 'horn.png' }] })
      }
    }
  })

  if (process.env.NODE_ENV !== 'development') {
    console.log('bugleHornJob start!')
    bugleHornJob.start()
  }
}

const getRandomColor = function () {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
