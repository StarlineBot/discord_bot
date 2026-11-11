const settings = require('./guildSettings')

// /섯다라인설정 기능 카탈로그(단일 출처).
// 하위 명령 설명(desc)·목록 한 줄 소개(oneLine)·설정 예시(example)·섹션·순서를 여기서만 정의한다.
// → 설정 명령·/섯다라인설정 목록·(추후) 설치 안내가 같은 이름·문구를 쓰게 된다.
//   새 설정 기능을 추가하면 여기에 한 줄 추가 = 어느 섹션 몇 번째로 표시될지까지 결정.
//
// sub: 하위 명령 이름(= 목록 표시 이름. 목록을 보고 그대로 /섯다라인설정 <sub> 로 칠 수 있게)
// section: admin(🛠️ 서버 관리) | ingame(🎮 인게임 연동)
// group: 같은 group끼리 헤더 아래 묶어 표시(예: 입장 관리)
// desc: 하위 명령 설명(Discord 제한 100자)
const SECTIONS = {
  admin: { title: '🛠️ 서버 관리', color: 0x5865F2 },
  ingame: { title: '🎮 인게임 연동', color: 0x00B894 }
}

const GROUPS = {
  entry: '🚪 입장 관리 (손님권한부여 → 감사로그 → 승인권한부여)'
}

const FEATURES = [
  {
    sub: '관리자역할',
    emoji: '👑',
    section: 'admin',
    desc: '봇 관리 명령어를 쓸 수 있는 역할 지정 (서버장·제작자만)',
    oneLine: '운영진에게 봇 설정 권한 넘기기 (서버장만 지정 가능)',
    example: '/섯다라인설정 관리자역할 역할:@운영진'
  },
  {
    sub: '기본채널',
    emoji: '#️⃣',
    section: 'admin',
    desc: '명령어 결과를 모아 올릴 채널 지정 (미설정 시 명령어 친 채널)',
    oneLine: '명령어 결과를 한 채널에 모아 올려 채팅 채널을 깔끔하게',
    example: '/섯다라인설정 기본채널 채널:#봇'
  },
  {
    sub: '손님권한부여',
    emoji: '🙋',
    section: 'admin',
    group: 'entry',
    desc: '입장한 사람에게 손님 역할을 자동으로 줄지 on/off (켤 때 역할 지정)',
    oneLine: '입장한 사람에게 손님 역할 자동 지급',
    example: '/섯다라인설정 손님권한부여 상태:켜기 역할:@손님'
  },
  {
    sub: '감사로그',
    emoji: '🛡️',
    section: 'admin',
    group: 'entry',
    desc: '입장·퇴장·역할변경 로그를 올릴지 on/off (켤 땐 채널 지정)',
    oneLine: '입장·퇴장·역할 변경 기록을 한 채널에',
    example: '/섯다라인설정 감사로그 상태:켜기 채널:#로그'
  },
  {
    sub: '승인권한부여',
    emoji: '✅',
    section: 'admin',
    group: 'entry',
    desc: '입장 로그에 역할 부여 버튼을 띄워, 운영진이 확인 후 정식 역할을 주게 할지 on/off',
    oneLine: '입장 로그 버튼으로 운영진이 확인 후 정식 역할 지급 (감사로그가 켜져 있어야 버튼이 보임)',
    example: '/섯다라인설정 승인권한부여 상태:켜기 역할:@길드원'
  },
  {
    sub: '주간랭킹',
    emoji: '🏆',
    section: 'admin',
    desc: '매주 디스코드 채팅·음성 활동 순위를 게시할지 on/off',
    oneLine: '매주 디스코드 채팅·음성 활동 순위 게시',
    example: '/섯다라인설정 주간랭킹 상태:켜기 채널:#랭킹'
  },
  {
    sub: '자동삭제',
    emoji: '🧹',
    section: 'admin',
    desc: '지정 채널의 메시지를 일정 시간 뒤 자동삭제 on/off (핀 제외)',
    oneLine: '지정 채널 메시지를 설정 시간 뒤 자동 삭제 (핀 제외)',
    example: '/섯다라인설정 자동삭제 상태:켜기 채널:#봇명령 분:10',
    caution: '메시지가 지워지니 채널을 확인하고 켜기'
  },
  {
    sub: '게임서버',
    emoji: '🌐',
    section: 'ingame',
    desc: '우리 길드의 게임 서버 지정 (인게임파티모집현황·/파티알림에 사용, 미설정 시 하프)',
    oneLine: '우리 길드의 게임 서버 (인게임파티모집현황·/파티알림 기준)',
    example: '/섯다라인설정 게임서버 서버:하프'
  },
  {
    sub: '오늘의미션',
    emoji: '📅',
    section: 'ingame',
    desc: '매일 아침 오늘·내일 미션과 베테랑 던전을 자동 게시할지 on/off',
    oneLine: '매일 아침 오늘·내일 미션과 베테랑 던전 자동 게시',
    example: '/섯다라인설정 오늘의미션 상태:켜기 채널:#공지'
  },
  {
    sub: '파티모집',
    emoji: '🧑‍🤝‍🧑',
    section: 'ingame',
    desc: '길드원이 /파티모집으로 올린 디스코드 모집글 관리(오래된 글 정리·출발 10분 전 DM) on/off',
    oneLine: '길드원이 /파티모집 으로 올린 **디스코드 모집글** 관리 (오래된 글 정리 + 출발 10분 전 참가자 DM)',
    example: '/섯다라인설정 파티모집 상태:켜기 채널:#파티모집'
  },
  {
    sub: '인게임파티모집현황',
    emoji: '📢',
    section: 'ingame',
    desc: '게임 안 거뿔의 파티모집 외침을 채널에 실시간 게시 on/off (켜면 /파티알림 DM도 동작)',
    oneLine: '**게임 안 거뿔**의 파티모집 외침을 채널에 실시간 게시 (켜면 /파티알림 키워드 DM도 동작)',
    example: '/섯다라인설정 인게임파티모집현황 상태:켜기 채널:#거뿔'
  }
]

// 섹션 끝에 붙는 안내 한 줄
const SECTION_NOTES = {
  ingame: '💡 **파티모집**과 **인게임파티모집현황**은 서로 다른 기능이에요 — 디스코드에 올린 모집글 vs 게임 안 거뿔 모집'
}

const bySub = new Map(FEATURES.map(f => [f.sub, f]))

// 하위 명령 설명(카탈로그에 없으면 fallback)
function desc (sub, fallback = '') {
  return (bySub.get(sub) || {}).desc || fallback
}

function get (sub) {
  return bySub.get(sub) || null
}

// 게임 서버: 넥슨 오픈 API server_name 값(마비노기 서버 한글명). 미설정 서버는 하프(기존 동작 유지).
const GAME_SERVERS = ['류트', '만돌린', '하프', '울프']
const DEFAULT_GAME_SERVER = '하프'

function gameServerOf (guildId) {
  const v = settings.get(guildId, 'gameServer', null)
  return GAME_SERVERS.includes(v) ? v : DEFAULT_GAME_SERVER
}

// 사용자에게 보여줄 서버 표기: 직접 지정했으면 '류트', 미지정이면 '하프 (기본값)'
function gameServerLabel (guildId) {
  const v = settings.get(guildId, 'gameServer', null)
  return GAME_SERVERS.includes(v) ? v : `${DEFAULT_GAME_SERVER} (기본값)`
}

module.exports = { SECTIONS, GROUPS, FEATURES, SECTION_NOTES, desc, get, GAME_SERVERS, DEFAULT_GAME_SERVER, gameServerOf, gameServerLabel }
