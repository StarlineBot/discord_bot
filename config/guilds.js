// 길드(디스코드 서버)별 채널·역할 ID.
// Discord 스노우플레이크 ID는 비밀이 아니라 여기(git)에 둔다. 진짜 시크릿(TOKEN/NEXON_API_KEY)만 .env.
//
// ▶ 서버를 추가하려면: 아래 배열에 객체 하나만 추가하면 된다.
//   - env: cron 싱글턴 잡(오늘의미션/거뿔보드)이 NODE_ENV로 대상 길드를 고를 때 매칭 키.
//           'production' / 'development' 두 가지.
//   - 길드별 순회 기능(랭킹/스레드정리/파티알림/경매장즐겨찾기)은 guildId로 자동 매칭돼 새 서버도 바로 동작.
//
// ※ 손님권한·감사로그(손님역할/길드원역할/감사채널)는 여기 없다.
//    기본 OFF이고 서버마다 `/섯다라인설정` 명령어로 켜고 역할·채널을 지정한다(guildSettings.json 저장).
const guilds = [
  {
    name: '향내나는실크',
    env: 'production',
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
    env: 'development',
    guildId: '1126803872925634581',
    ownerId: '280290004926857216',
    adminRole: '1232591254244687886',
    // 봇 로그·헬스체크·에러 모니터 채널. getMonitorChannelId()가 '개발' 길드의 이 값만 읽는다.
    // → 개발 길드엔 반드시 필요, 다른 서버엔 없어도 됨.
    logChannelId: '1126803873458303039',
    partyChannelId: '1230356497704423426',
    generalChannelId: '1238382982922764358',
    todayMissionChannelId: '1319825743689154610',
    bugleHornChannelId: '1530114468393123991',
    weeklyMemberChannelId: '1533728404493438986'
  }
]

module.exports = guilds
