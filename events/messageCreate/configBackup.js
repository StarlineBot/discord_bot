const { configBackupChannelId } = require('../../config/bot')

// 애드온(앱) 설정 백업 릴레이.
// 앱이 릴레이 채널(configBackupChannelId)에 '[설정백업] <@userId>' + config.json 첨부를 올리면,
// 봇이 그 유저에게 백업 파일을 DM으로 전달하고 릴레이 메시지는 삭제(채널 정리).
//
// djs-commander는 messageCreate 핸들러를 (message, client)로 호출한다.
// 보안: 릴레이 채널은 앱(웹훅/봇)만 올릴 수 있게 권한을 잠가야 한다. 여기서도 사람 메시지는
// 무시(author.bot)해 아무나 남에게 임의 파일을 DM 보내지 못하게 한 겹 더 막는다.
module.exports = async (message, client) => {
  try {
    if (!configBackupChannelId) return
    if (message.channelId !== configBackupChannelId) return
    if (!message.author || !message.author.bot) return // 앱(웹훅/봇)이 올린 것만
    if (!message.content || !message.content.startsWith('[설정백업]')) return

    const m = message.content.match(/<@!?(\d+)>/)
    if (!m) return // 대상 유저 멘션 없음 → 전달 불가

    const file = [...message.attachments.values()].find(a => /\.json$/i.test(a.name || ''))
    if (!file) return // config.json 첨부 없음

    const userId = m[1]
    const user = await client.users.fetch(userId).catch(() => null)
    if (!user) return

    try {
      await user.send({
        content: '🗄️ 섯다라인 설정 백업 파일이야~ 앱에서 **설정 불러오기**로 적용하면 돼!',
        files: [{ attachment: file.url, name: file.name || 'config.json' }]
      })
      // 전달 성공 → 릴레이 메시지 정리(권한 없으면 조용히 무시)
      await message.delete().catch(() => {})
    } catch (e) {
      // DM 실패(차단·DM 막힘 등) → 릴레이 메시지는 남겨두고 표시만
      console.error('[configBackup] DM 전달 실패:', e.message)
      await message.react('⚠️').catch(() => {})
    }
  } catch (e) {
    console.error('[configBackup] 처리 실패:', e)
  }
}
