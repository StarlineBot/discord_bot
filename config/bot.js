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
  devGuildId: '1126803872925634581',
  // logChannelId: 봇 헬스체크·에러 로그를 보내는 모니터 채널(서버 무관 봇 전역).
  //   비어 있으면 로그 전송을 건너뛴다.
  logChannelId: '1126803873458303039',
  // inquiryForumChannelId: 1:1 DM 문의가 모이는 포럼 채널(서버 무관 봇 전역, 모드메일).
  //   유저가 봇에 DM → 이 포럼에 유저별 문의 포스트 생성. 포스트에 답글 쓰면 봇이 그 유저에게 DM relay.
  //   비어 있으면 문의 기능 off.
  inquiryForumChannelId: '1555444707192995880',
  // configBackupChannelId: 애드온(앱)이 '설정 백업'을 올리는 릴레이 채널(서버 무관 봇 전역).
  //   앱이 '[설정백업] <@userId>' + config.json 첨부를 이 채널에 올리면,
  //   봇이 그 유저에게 백업 파일을 DM으로 전달하고 릴레이 메시지는 삭제(채널 정리).
  //   비어 있으면 설정백업 전달 기능 off.
  configBackupChannelId: '1557380857373663242'
}
