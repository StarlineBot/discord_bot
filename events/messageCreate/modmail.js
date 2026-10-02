const { ChannelType } = require('discord.js')
const modmail = require('../../modules/modmail')
const { inquiryForumChannelId } = require('../../config/bot')

// 1:1 문의(모드메일) 양방향 처리.
//  - 유저가 봇에 DM(inbound)   → 문의 포럼에 유저별 포스트 생성/이어붙임
//  - 운영자가 그 포스트에 답글(outbound) → 봇이 해당 유저에게 DM relay
// '//'로 시작하는 답글은 내부 메모로 간주해 유저에게 보내지 않는다.
module.exports = async (message, client) => {
  try {
    if (!inquiryForumChannelId) return
    // 부분(partial) DM 메시지면 본문 확보
    if (message.partial) { await message.fetch().catch(() => {}) }
    if (message.author?.bot) return

    // A) inbound: 유저 → 봇 DM
    if (!message.guildId) {
      await handleInbound(message, client)
      return
    }

    // B) outbound: 문의 포럼 스레드에 달린 운영자 답글
    const ch = message.channel
    if (ch && typeof ch.isThread === 'function' && ch.isThread() && ch.parentId === inquiryForumChannelId) {
      await handleOutbound(message, client)
    }
  } catch (err) {
    console.error('modmail 처리 에러:', err)
  }
}

function buildInboundContent (message) {
  let c = `**<@${message.author.id}>** (\`${message.author.id}\`)\n`
  if (message.content) c += message.content
  const files = [...message.attachments.values()].map(a => a.url)
  if (files.length) c += (message.content ? '\n' : '') + files.join('\n')
  return c.slice(0, 1900)
}

async function handleInbound (message, client) {
  const forum = await client.channels.fetch(inquiryForumChannelId).catch(() => null)
  if (!forum || forum.type !== ChannelType.GuildForum) return // 포럼 아님/없음 → 무시

  const userId = message.author.id
  const threadId = modmail.getThreadByUser(userId)
  let thread = threadId ? await forum.threads.fetch(threadId).catch(() => null) : null
  if (thread && thread.archived) thread = null // 보관된 문의는 새 포스트로

  const content = buildInboundContent(message)
  if (!thread) {
    const title = `문의 · ${message.author.username}`.slice(0, 90)
    thread = await forum.threads.create({ name: title, message: { content: content || '(내용 없음)' } })
    modmail.link(userId, thread.id)
  } else {
    await thread.send(content || '(내용 없음)')
  }

  await message.author.send('📨 문의가 접수됐어요~ 답변이 오면 여기로 전달해드릴게요!').catch(() => {})
}

async function handleOutbound (message, client) {
  const userId = modmail.getUserByThread(message.channel.id)
  if (!userId) return
  if (message.content.startsWith('//')) return // 내부 메모 → 전달 안 함

  const user = await client.users.fetch(userId).catch(() => null)
  if (!user) return

  let out = message.content || ''
  const files = [...message.attachments.values()].map(a => a.url)
  if (files.length) out += (out ? '\n' : '') + files.join('\n')
  if (!out) return

  try {
    await user.send(`📩 **답변**: ${out}`.slice(0, 1990))
    await message.react('📨').catch(() => {}) // 전달 완료 표시
  } catch (e) {
    await message.react('⚠️').catch(() => {}) // DM 실패(차단·DM막힘 등) 표시
  }
}
