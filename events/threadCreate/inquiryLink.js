// 애드온(데스크톱 앱)이 문의 포럼에 웹훅으로 올린 글 → 작성자(user_id)를 모드메일에 연결.
// 이후 운영자가 그 글에 답글을 달면 기존 모드메일(messageCreate/modmail.js handleOutbound)이
// 그 유저에게 DM으로 전달한다. (답변 경로는 기존 그대로, 여기선 '연결'만 담당)
//
// 주의: djs-commander는 핸들러를 (…네이티브인자, client)로 호출한다.
// threadCreate는 (thread, newlyCreated)를 넘기므로 client는 세 번째 인자다.
// 위치 의존을 피하려고 client 대신 thread.client 를 쓴다(threadDelete.js 와 동일 패턴).
const modmail = require('../../modules/modmail')
const { inquiryForumChannelId } = require('../../config/bot')

module.exports = async (thread) => {
  try {
    if (!inquiryForumChannelId) return
    if (thread.parentId !== inquiryForumChannelId) return
    if (modmail.getUserByThread(thread.id)) return // 이미 연결됨(중복 방지)

    const client = thread.client

    // 스타터 메시지(글 본문) 확보 — 웹훅 직후 살짝 늦을 수 있어 1회 재시도
    let starter = await thread.fetchStarterMessage().catch(() => null)
    if (!starter) {
      await new Promise(r => setTimeout(r, 1000))
      starter = await thread.fetchStarterMessage().catch(() => null)
    }
    if (!starter) return

    // 봇 자신이 만든 문의 스레드(유저가 봇에 직접 DM → handleInbound가 생성)는 건너뛴다.
    // (그쪽은 생성 시 이미 link + '접수' DM 처리됨 → 여기서 또 하면 중복)
    if (client.user && starter.author && starter.author.id === client.user.id) return

    const m = (starter.content || '').match(/<@!?(\d+)>/) // "문의자: <@id>"
    if (!m) return // 로그인 안 한 문의 → 연결 불가(단방향 접수)

    const userId = m[1]
    modmail.link(userId, thread.id)
    const user = await client.users.fetch(userId).catch(() => null)
    if (user) {
      await user.send('📨 문의가 접수됐어요~ 답변이 오면 여기로 전달해드릴게요!').catch(() => {})
    }
  } catch (e) {
    console.error('[inquiryLink] 처리 실패:', e)
  }
}
