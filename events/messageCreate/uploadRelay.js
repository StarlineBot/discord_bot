const { DateTime } = require('luxon')
const { developerId, uploadRelayChannelId } = require('../../config/bot')

// 유저 제출함: uploadRelayChannelId 채널에 올라온 글·파일을 제작자(developerId)에게 DM으로 전달하고
// 원본 메시지는 삭제한다. 다른 유저에겐 남의 제출물이 남지 않아 '본인+관리자만 보는' 채널처럼 동작.
// DM 전달에 실패하면(용량 초과·DM 막힘 등) 원본을 지우지 않고 ⚠️만 달아 제출물이 사라지지 않게 한다.
module.exports = async (message, client) => {
  try {
    if (!uploadRelayChannelId || !developerId) return
    if (message.channelId !== uploadRelayChannelId) return
    if (!message.author || message.author.id === client.user?.id) return // 봇 자신의 메시지는 무시
    if (message.system) return // 핀 고정 알림 등 시스템 메시지

    const files = [...message.attachments.values()].map(a => ({ attachment: a.url, name: a.name || 'file' }))
    if (!message.content && !files.length) return // 스티커만 등 전달할 게 없음

    const dev = await client.users.fetch(developerId).catch(() => null)
    if (!dev) return

    const now = DateTime.now().setZone('Asia/Seoul').setLocale('ko')
    const a = message.author
    let content = `📥 **제출함** · <@${a.id}> (${a.username} / \`${a.id}\`)\n`
    content += `🏠 ${message.guild?.name || '?'} · 🕒 ${now.toFormat('yyyy-MM-dd HH:mm')}`
    if (message.content) content += `\n\n${message.content}`

    try {
      // 파일은 한 메시지에 최대 10개
      await dev.send({ content: content.slice(0, 2000), files: files.slice(0, 10) })
      await message.delete().catch(() => {})
    } catch (e) {
      console.error('[uploadRelay] DM 전달 실패:', e.message)
      await message.react('⚠️').catch(() => {})
    }
  } catch (e) {
    console.error('[uploadRelay] 처리 실패:', e)
  }
}
