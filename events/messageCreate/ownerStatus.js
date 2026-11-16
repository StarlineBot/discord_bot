const { developerId } = require('../../config/bot')
const { botStatus, addonStatus, HELP } = require('../../modules/ownerStatus')

// 제작자 전용 텍스트 명령 '!현황'. 슬래시 명령으로 등록하지 않아 누구에게도 목록에 안 보인다.
// 제작자가 아니면 아무 반응도 하지 않는다(명령 존재 자체를 드러내지 않음).
// 결과는 항상 제작자 DM으로 보내고, 서버 채널에서 쳤으면 그 메시지는 지운다.
// (봇 DM에서 쳐도 됨 — modmail.js가 이 명령은 문의로 넘기지 않는다)
const COMMAND = '!현황'

module.exports = async (message) => {
  try {
    if (!developerId || message.author?.id !== developerId) return
    const text = (message.content || '').trim()
    if (text !== COMMAND && !text.startsWith(COMMAND + ' ')) return

    if (message.guildId) message.delete().catch(() => {}) // 채널에 흔적 남기지 않기(권한 없으면 무시)
    const [, target = '', ...rest] = text.split(/\s+/)
    const query = rest.join(' ').trim()

    let payload
    if (target === '봇') payload = await botStatus(message.client, query)
    else if (target === '애드온') payload = await addonStatus(query)
    else payload = { content: HELP }

    try {
      await message.author.send({ ...payload, allowedMentions: { parse: [] } })
    } catch (e) {
      console.error('[!현황] DM 전송 실패:', e.message)
    }
  } catch (e) {
    console.error('[!현황] 처리 실패:', e)
  }
}

module.exports.COMMAND = COMMAND
