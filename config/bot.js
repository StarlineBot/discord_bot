// 봇 전역 설정 (서버와 무관).
// developerId: 섯다라인봇 제작자 Discord 유저 ID. 설정 변경 등 관리 알림을 이 사람에게 DM.
//   - 비어 있으면('') 알림을 보내지 않는다.
//   - Discord 유저 ID는 비밀이 아니라 git으로 관리(로컬·VM 공통).
//   - 내 ID 확인: Discord 설정 > 고급 > 개발자 모드 ON → 내 프로필 우클릭 > 사용자 ID 복사
module.exports = {
  developerId: '280290004926857216',
  // devGuildId: 개발(테스트) 서버 길드 ID.
  //   NODE_ENV=development(로컬)로 돌 때, cron이 이 서버만 건드리게 하는 기준.
  //   (길드마다 env 라벨 다는 대신 "테스트 서버는 이거다" 단일 값으로 dev/prod 구분)
  devGuildId: '1126803872925634581'
}
