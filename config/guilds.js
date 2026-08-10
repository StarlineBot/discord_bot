// 길드(디스코드 서버)별 채널·역할 ID (엄선 서버용 기본값).
// Discord 스노우플레이크 ID는 비밀이 아니라 여기(git)에 둔다. 진짜 시크릿(TOKEN/NEXON_API_KEY)만 .env.
//
// ※ 이 값들은 이제 "기본값(폴백)"이다. 실제 기능은 /섯다라인설정 명령어로 서버마다 켜고 채널을 지정하며,
//    설정값(guildSettings.json)이 있으면 그게 우선한다. config에 없는 서버는 자동등록(guildRegistry) + 명령어로 동작.
//    봇 전역값(devGuildId·logChannelId·developerId)은 config/bot.js 참고.
const guilds = [
  {
    name: '향내나는실크',
    guildId: '1114121990408773712',
    ownerId: '386478163682918400',
    adminRole: '1114154979691855872',
    partyChannelId: '1167792216425627699',
    generalChannelId: '1234196678408536215',
    todayMissionChannelId: '1319831360549945455',
    bugleHornChannelId: '1530113048503779369',
    weeklyMemberChannelId: '1533728018902552586'
  },
  {
    name: '개발',
    guildId: '1126803872925634581',
    ownerId: '280290004926857216',
    adminRole: '1232591254244687886',
    partyChannelId: '1230356497704423426',
    generalChannelId: '1238382982922764358',
    todayMissionChannelId: '1319825743689154610',
    bugleHornChannelId: '1530114468393123991',
    weeklyMemberChannelId: '1533728404493438986'
  }
]

module.exports = guilds
