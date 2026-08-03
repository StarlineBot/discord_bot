const { EmbedBuilder } = require('discord.js')
const cron = require('cron')
const { DateTime } = require('luxon')
const guildModule = require('../../modules/getGuildInfo')
const {
  getUserMessageCounts,
  saveUserMessageCounts,
  getTopRanking,
  createRankingEmbed,
  getUserVoiceCounts,
  saveUserVoiceCount,
  createVoiceRankingEmbed
} = require('../../modules/RankingUtil')
const axios = require('axios')
const fs = require('node:fs')
const { getDate } = require('../../modules/common')
const auctionFav = require('../../modules/auctionFavorites')
const { getCategoryItems, filterItems, resolveLeafCategories } = require('../../modules/auction')
const { buildEquipEmbed, buildEchostoneEmbed } = require('../../modules/auctionEmbeds')
const partyAlerts = require('../../modules/partyAlerts')

const botId = process.env.BOT_ID
const todayMissionChannelId = process.env.NODE_ENV === 'development'
  ? process.env.DEV_TODAY_MISSION_CHANNEL_ID
  : process.env.TODAY_MISSION_CHANNEL_ID
const otherChannelId = process.env.DEV_CHANNEL_ID
const nexonApiKey = process.env.NEXON_API_KEY
const nexonApiMainUrl = 'https://open.api.nexon.com'
const bugleHornChannelId = process.env.NODE_ENV === 'development'
  ? process.env.DEV_BUGLE_HORN_CHANNEL_ID
  : process.env.BUGLE_HORN_CHANNEL_ID
const partyRecruitStatePath = './static/json/partyRecruitBoard.json'
const weeklyMemberStatePath = './static/json/weeklyMemberBoard.json'
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
    const { getVeteran, getMissions } = require(
      '../../modules/todayMission')(now, nowDate)

    const todayMissionChannel = client.channels.cache.get(todayMissionChannelId)
    if (!todayMissionChannel) {
      return
    }

    let todayMissionObject, tomorrowMissionObject
    try {
      ({ today: todayMissionObject, tomorrow: tomorrowMissionObject } = await getMissions())
    } catch (error) {
      otherChannel.send('데일리 미션 조회 에러: ' + error)
      return
    }
    const todayMission = todayMissionObject.missions[0]
    const tomorrowMission = tomorrowMissionObject.missions[0]

    const todayEmbed = new EmbedBuilder()
      .setTitle('오늘의 미션&베테랑')
      .setColor('#86E57F')
      .addFields(
        { name: '베테랑 던전', value: `- ${getVeteran().today}` }
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
        { name: '베테랑 던전', value: `- ${getVeteran().tomorrow}` }
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
  })

  console.log('dailyJob start!')
  dailyJob.start()

  const weeklyCronSchedule = process.env.NODE_ENV === 'development'
    ? '* * * * *'
    : '0 0 * * 0'
  const weeklyJob = new cron.CronJob(weeklyCronSchedule, async function () {
    const userMessageCounts = getUserMessageCounts()
    const userVoiceCounts = getUserVoiceCounts()

    // 기존 메시지 수정(edit-in-place)용 상태 로드
    let weeklyState = {}
    if (fs.existsSync(weeklyMemberStatePath)) {
      try { weeklyState = JSON.parse(fs.readFileSync(weeklyMemberStatePath)) } catch (e) { weeklyState = {} }
    }

    for (const guild of client.guilds.cache.values()) {
      if (process.env.NODE_ENV === 'development' && guild.id !== '1126803872925634581') {
        continue
      }
      const guildInfo = guildModule.getGuildInfo(guild.id)
      if (!guildInfo) continue

      // 채팅 + 보이스 랭킹을 한 메시지에 모음
      const embeds = []
      if (userMessageCounts && userMessageCounts[guildInfo.guildId]) {
        embeds.push(...getTopRanking(userMessageCounts[guildInfo.guildId]).map(createRankingEmbed))
        userMessageCounts[guildInfo.guildId] = {} // 채팅 수 초기화
      }
      if (userVoiceCounts && userVoiceCounts[guildInfo.guildId]) {
        embeds.push(...getTopRanking(userVoiceCounts[guildInfo.guildId]).map(createVoiceRankingEmbed))
        userVoiceCounts[guildInfo.guildId] = {} // 음성채팅 수 초기화
      }
      if (embeds.length === 0) continue

      // WEEKLY_MEMBER_CHANNEL_ID 채널로 전송
      const memberChannel = guild.channels.cache.get(guildInfo.weeklyMemberChannelId)
      if (!memberChannel) continue

      // 파티보드처럼 기존 메시지 있으면 수정, 없으면 새로 전송
      try {
        const st = weeklyState[guild.id]
        let msg = null
        if (st && st.channelId === memberChannel.id) {
          msg = await memberChannel.messages.fetch(st.messageId).catch(() => null)
        }
        if (msg) {
          await msg.edit({ embeds })
        } else {
          msg = await memberChannel.send({ embeds })
        }
        weeklyState[guild.id] = { channelId: memberChannel.id, messageId: msg.id }
      } catch (error) {
        console.error('이주의 멤버 랭킹 갱신 에러:', error.message)
      }
    }

    if (userMessageCounts) saveUserMessageCounts(userMessageCounts)
    if (userVoiceCounts) saveUserVoiceCount(userVoiceCounts)
    fs.mkdirSync('./static/json', { recursive: true })
    fs.writeFileSync(weeklyMemberStatePath, JSON.stringify(weeklyState, null, 2))
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
          const startDate = DateTime.fromFormat(`${now.get('year')}년 ${startDateMessage.content.split(':')[1].trim()}`, 'yyyy년 MM월 dd일 cccc HH시 mm분', {
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

  // 파티모집 현황 보드: 거뿔(#) 최근 5개를 한 메시지에 계속 갱신(edit-in-place → 누적/노이즈 없음)
  const partyRecruitBoardJob = new cron.CronJob('*/10 * * * * *', async function () {
    const boardChannel = client.channels.cache.get(bugleHornChannelId)
    if (!boardChannel) return

    let hornBugleList
    try {
      const getBody = await axios.get(
        nexonApiMainUrl + '/mabinogi/v1/horn-bugle-world/history?server_name=하프',
        { headers: { 'x-nxopen-api-key': nexonApiKey } }
      )
      hornBugleList = getBody.data.horn_bugle_world_history || []
    } catch (error) {
      console.error('거뿔 조회 에러:', error.message)
      return
    }

    // 파티모집(#)만 → 중복 제거(캐릭명+내용) → 최신순 상위 5
    const recruit = hornBugleList
      .filter(b => b.message && b.message.startsWith(b.character_name + ' : #'))
      .sort((a, b) => new Date(b.date_send) - new Date(a.date_send))

    // 키워드 알림: 등록 키워드가 파티모집 제목에 뜨면 DM (사람+채널+내용 서명, 5분 슬라이딩 TTL → 파티당 1회)
    try {
      const alertData = partyAlerts.read()
      if (alertData.keywords.length) {
        const nowMs = Date.now()
        // 5분 넘은 외침은 스킵(시작 시 과거 히스토리 스팸 방지 + '5분=끝' 일관), 오래된→최신 순 처리
        const freshRecruit = recruit
          .filter(b => DateTime.now().diff(DateTime.fromISO(b.date_send), 'minutes').minutes <= 5)
          .sort((a, b) => new Date(a.date_send) - new Date(b.date_send))
        for (const b of freshRecruit) {
          const parsed = partyAlerts.parseRecruit(b)
          for (const kw of alertData.keywords) {
            if (!client.guilds.cache.has(kw.guildId)) continue
            if (!parsed.content.includes(kw.keyword)) continue
            if (!partyAlerts.shouldAlert(alertData, kw.userId, parsed.signature, nowMs)) continue
            const embed = new EmbedBuilder()
              .setTitle(`🔔 파티모집 알림 · '${kw.keyword}'`)
              .setColor('#00B894')
              .setDescription(parsed.content || '(내용 없음)')
              .addFields(
                { name: '모집자', value: parsed.characterName, inline: true },
                { name: '채널', value: `채널 ${parsed.channelNum}`, inline: true }
              )
              .setFooter({ text: `${getDate(new Date(b.date_send))} · 하프서버 거뿔` })
            client.users.fetch(kw.userId).then(user => user.send({ embeds: [embed] })).catch(() => {})
          }
        }
        partyAlerts.write(alertData)
      }
    } catch (error) {
      console.error('파티 키워드 알림 에러:', error.message)
    }

    // 사람당 최신 1건만(같은 사람이 인원 채우며 반복 외치는 것 제외) → 서로 다른 5명
    const seen = new Set()
    const top5 = []
    for (const b of recruit) {
      const key = b.character_name
      if (seen.has(key)) continue
      seen.add(key)
      top5.push(b)
      if (top5.length >= 5) break
    }

    // 카드형: 모집마다 임베드 1장(사람·채널 = 제목으로 크게, 내용 = 설명, 인원·시각 = 푸터)
    let embeds
    if (top5.length === 0) {
      embeds = [new EmbedBuilder().setTitle('📢 파티모집 현황').setColor('#B2BEC3').setDescription('현재 모집 중인 파티가 없어요~').setTimestamp()]
    } else {
      embeds = top5.map(b => {
        const raw = b.message.replace(b.character_name + ' : ', '') // "#[채널7] 내용 [1/4명]"
        const chMatch = raw.match(/#\[채널(\d+)\]/)
        const hcMatch = raw.match(/\[(\d+)\/(\d+)명\](완)?/)
        const channel = chMatch ? chMatch[1] : '?'
        const done = hcMatch ? (hcMatch[3] === '완' || hcMatch[1] === hcMatch[2]) : false
        const headcount = hcMatch ? `👥 ${hcMatch[1]}/${hcMatch[2]}명${done ? ' ✅완료' : ''}` : ''
        let body = raw
        if (chMatch) body = body.replace(chMatch[0], '')
        if (hcMatch) body = body.replace(hcMatch[0], '')
        body = body.trim() || '(내용 없음)'
        // 파티모집은 수동이라 5분 안 올라오면 끝난 것으로 봄. 10분+는 '오래됨' 강조. instant 비교라 서버 TZ 무관
        const ageMin = Math.floor(DateTime.now().diff(DateTime.fromISO(b.date_send), 'minutes').minutes)
        const isOld = ageMin >= 10
        let color = done ? '#B2BEC3' : '#00B894'
        if (isOld && !done) color = '#E67E22'
        let agePart = ''
        if (isOld) agePart = `  ·  ⏰ ${ageMin}분 전 (오래됨)` // 10분+ 강조
        else if (ageMin >= 5) agePart = `  ·  ${ageMin}분 전` // 5분+ 경과 표시
        return new EmbedBuilder()
          .setTitle(`${isOld ? '⏰ ' : ''}${b.character_name}  ·  📢 채널 ${channel}`)
          .setColor(color)
          .setDescription(body)
          .setFooter({ text: `${headcount}${headcount ? '  ·  ' : ''}${getDate(new Date(b.date_send))}${agePart}` })
      })
    }

    // 내용 서명: 변경 없으면 편집 스킵(불필요한 Discord 호출/rate limit 방지)
    const signature = top5.map(b => b.character_name + '|' + b.date_send + '|' + b.message).join('||')
    let state = {}
    if (fs.existsSync(partyRecruitStatePath)) {
      try { state = JSON.parse(fs.readFileSync(partyRecruitStatePath)) } catch (e) { state = {} }
    }
    const saveState = (messageId) => {
      fs.mkdirSync('./static/json', { recursive: true })
      fs.writeFileSync(partyRecruitStatePath, JSON.stringify({ messageId, channelId: boardChannel.id, signature }))
    }
    try {
      let msg = null
      if (state.messageId && state.channelId === boardChannel.id) {
        msg = await boardChannel.messages.fetch(state.messageId).catch(() => null)
      }
      if (msg && state.signature === signature) return // 메시지 존재 + 내용 동일 → 스킵
      if (msg) {
        await msg.edit({ embeds })
        saveState(msg.id)
      } else {
        const sent = await boardChannel.send({ embeds })
        saveState(sent.id)
      }
    } catch (error) {
      console.error('파티모집 보드 갱신 에러:', error.message)
    }
  })

  console.log('partyRecruitBoardJob start!')
  partyRecruitBoardJob.start()

  // 경매장 즐겨찾기: 5분마다 즐겨찾기 조건에 맞는 새 매물을 찾아 등록자에게 DM
  // dev: 30초마다 / prod: 5분마다
  const auctionFavoriteSchedule = process.env.NODE_ENV === 'development' ? '*/30 * * * * *' : '*/5 * * * *'
  const auctionFavoriteJob = new cron.CronJob(auctionFavoriteSchedule, async function () {
    const data = auctionFav.read()
    if (!data.favorites.length) return

    // 점검/장애 감지: 허브(채집물)는 상시 수백건 → 0이면 게임 점검 or API 장애로 보고 사이클 스킵.
    // 넥슨 API는 점검 때 에러코드가 아니라 200+빈배열을 주므로, 카나리가 유일한 신뢰 신호.
    let canary
    try {
      canary = await getCategoryItems('허브')
    } catch (error) {
      console.error('[경매장즐겨찾기] 카나리 조회 에러:', error.message)
      return
    }
    if (!canary.length) {
      console.warn('[경매장즐겨찾기] 허브 카나리 0건 → 점검·장애로 간주, 이번 사이클 스킵')
      return
    }

    // 즐겨찾기 대분류를 넥슨 API 소분류(leaf)로 펼쳐 중복 없이 한 번씩만 조회
    const leavesByCat = {}
    const leafSet = new Set()
    for (const cat of new Set(data.favorites.map(f => f.category))) {
      const leaves = resolveLeafCategories(cat)
      leavesByCat[cat] = leaves
      leaves.forEach(l => leafSet.add(l))
    }
    const itemsByLeaf = {}
    for (const leaf of leafSet) {
      try {
        itemsByLeaf[leaf] = await getCategoryItems(leaf)
      } catch (error) {
        console.error(`[경매장즐겨찾기] '${leaf}' 조회 에러:`, error.message)
      }
    }

    for (const fav of data.favorites) {
      // 이 클라이언트가 속한 길드의 즐겨찾기만 처리(dev/prod 자연 분리)
      if (!client.guilds.cache.has(fav.guildId)) continue
      let items = []
      for (const leaf of leavesByCat[fav.category] || []) {
        if (itemsByLeaf[leaf]) items = items.concat(itemsByLeaf[leaf])
      }
      if (!items.length) continue

      let matches = filterItems(items, { keyword: fav.keyword, metalwares: fav.metalwares || [] })
      if (fav.maxPrice) matches = matches.filter(it => it.auction_price_per_unit <= fav.maxPrice)
      if (!matches.length) continue

      const fresh = auctionFav.pickNewMatches(data, fav.id, matches)
      if (!fresh.length) continue

      let user
      try {
        user = await client.users.fetch(fav.userId)
      } catch (error) {
        continue
      }

      // 아이템 정보는 경매장 명령어와 동일한 임베드 사용
      const buildEmbed = fav.category === '에코스톤' ? buildEchostoneEmbed : buildEquipEmbed
      const embeds = fresh.slice(0, 5).map(buildEmbed)
      const header = `🔔 즐겨찾기 **${fav.label}** 조건에 맞는 새 매물 ${fresh.length}건!` +
        (fresh.length > 5 ? ' (가격순 5건)' : '') + '\n※ 데이터는 실제보다 ~10분 지연이라 접속하면 이미 팔렸을 수 있어~'
      user.send({ content: header, embeds }).catch(() => {})
    }

    auctionFav.write(data)
  })

  console.log('auctionFavoriteJob start!')
  auctionFavoriteJob.start()
}
