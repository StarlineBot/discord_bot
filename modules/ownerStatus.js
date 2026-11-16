const axios = require('axios')
const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const settings = require('./guildSettings')
const catalog = require('./featureCatalog')
const { stateOf, buildSettingsView } = require('./settingsView')
const { addonServerUrl } = require('../config/bot')

// 제작자 전용 '!현황' 명령의 화면 생성(봇 서버별 설정 / 애드온 사용자 현황).
// 메시지 처리·권한 확인은 events/messageCreate/ownerStatus.js.

const TEXT_LIMIT = 5500 // 디스코드: 한 메시지 임베드 글자 합 6000 제한
const INDENT = '　'

// 글자 합 제한 안에서 넣을 수 있는 줄만, 남은 개수와 함께
function fitLines (lines) {
  const shown = []
  let size = 0
  for (const line of lines) {
    if (size + line.length + 1 > TEXT_LIMIT) break
    shown.push(line)
    size += line.length + 1
  }
  return { shown, rest: lines.length - shown.length }
}

function kst (iso) {
  if (!iso) return '-'
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone('Asia/Seoul').toFormat('MM-dd HH:mm')
}

function ago (iso) {
  if (!iso) return ''
  return `(${DateTime.fromISO(iso, { zone: 'utc' }).toRelative({ locale: 'ko' })})`
}

// ── 봇 ──
function guildUsage (guild) {
  const on = catalog.FEATURES.filter(f => stateOf(f.sub, guild.id).on === true).map(f => f.sub)
  const set = []
  if (settings.get(guild.id, 'adminRole', null)) set.push('관리자역할')
  if (settings.get(guild.id, 'generalChannelId', null)) set.push('기본채널')
  return { on, set, server: catalog.gameServerLabel(guild.id) }
}

function botSummary (client) {
  const rows = [...client.guilds.cache.values()].map(g => ({ g, u: guildUsage(g) }))
    .sort((a, b) => (b.u.on.length - a.u.on.length) || ((b.g.memberCount || 0) - (a.g.memberCount || 0)))
  const lines = rows.map(({ g, u }) => {
    const parts = []
    if (u.on.length) parts.push(`🟢 ${u.on.join(' · ')}`)
    if (u.set.length) parts.push(`⚙️ ${u.set.join(' · ')}`)
    if (!parts.length) parts.push('켠 기능 없음')
    parts.push(`🌐 ${u.server}`)
    return `**${g.name}** · 멤버 ${g.memberCount ?? '?'}명 · 서버장 <@${g.ownerId}>\n${INDENT}${parts.join('  |  ')}`
  })
  const { shown, rest } = fitLines(lines)
  const used = rows.filter(r => r.u.on.length || r.u.set.length).length
  return {
    embeds: [new EmbedBuilder().setTitle('🤖 봇 사용 현황').setColor(0x5865F2)
      .setDescription(shown.join('\n') || '봇이 들어간 서버가 없어요')
      .setFooter({ text: `서버 ${rows.length}곳 · 설정을 하나라도 쓰는 서버 ${used}곳${rest ? ` · 외 ${rest}곳` : ''} · 자세히: !현황 봇 <서버 이름>` })]
  }
}

function findGuild (client, query) {
  const q = query.toLowerCase()
  const guilds = [...client.guilds.cache.values()]
  return guilds.find(g => g.id === query) || guilds.filter(g => g.name.toLowerCase().includes(q))
}

async function botStatus (client, query) {
  if (!query) return botSummary(client)
  const found = findGuild(client, query)
  if (Array.isArray(found)) {
    if (found.length === 0) return { content: `'${query}'에 맞는 서버가 없어요` }
    if (found.length > 1) return { content: `여러 서버가 맞아요 — 더 길게 적어주세요:\n${found.slice(0, 15).map(g => `· ${g.name}`).join('\n')}` }
  }
  const guild = Array.isArray(found) ? found[0] : found
  const view = buildSettingsView(guild)
  view.content += ` · 멤버 ${guild.memberCount ?? '?'}명 · 서버장 <@${guild.ownerId}>`
  return view
}

// ── 애드온 ──
async function fetchAddonUsers () {
  const r = await axios.get(`${addonServerUrl}/internal/users`, { timeout: 5000 })
  return r.data.users || []
}

function onFeatures (s) {
  return s ? Object.entries(s.features || {}).filter(([, v]) => v).map(([k]) => k) : []
}

function addonSummary (users) {
  let total = 0
  const lines = users.map(u => {
    const s = u.settings
    let line = `**${u.name}** · ${u.tier}${u.status !== 'active' ? ` · ${u.status}` : ''}\n${INDENT}접속 ${kst(u.last_seen)} ${ago(u.last_seen)}`
    if (s) {
      total += s.rev
      const on = onFeatures(s)
      line += ` · 동기화 ${s.rev}회 · 마지막 ${kst(s.updated)} ${ago(s.updated)}`
      line += `\n${INDENT}${s.device || '?'} · ${s.resolution || '?'} · 켠 기능 ${on.length}개`
    } else {
      line += ' · 동기화 없음'
    }
    return line
  })
  const { shown, rest } = fitLines(lines)
  const synced = users.filter(u => u.settings).length
  return {
    embeds: [new EmbedBuilder().setTitle('📱 애드온 사용 현황').setColor(0x00B894)
      .setDescription(shown.join('\n') || '아직 로그인한 사용자가 없어요')
      .setFooter({ text: `로그인 ${users.length}명 · 동기화 ${synced}명 · 총 동기화 ${total}회${rest ? ` · 외 ${rest}명` : ''} · 시각 KST · 자세히: !현황 애드온 <이름>` })]
  }
}

function addonDetail (u) {
  const s = u.settings
  const lines = [
    `**${u.name}** (\`${u.discord_id}\`) · ${u.tier} · ${u.status}`,
    `처음 로그인 ${kst(u.created)} · 마지막 접속 ${kst(u.last_seen)} ${ago(u.last_seen)} · 로그아웃 ${kst(u.logged_out)}`
  ]
  if (s) {
    const feats = Object.entries(s.features || {})
    const on = feats.filter(([, v]) => v).map(([k]) => k)
    const off = feats.filter(([, v]) => !v).map(([k]) => k)
    lines.push(`동기화 ${s.rev}회 · 마지막 ${kst(s.updated)} ${ago(s.updated)}`)
    lines.push(`PC ${s.device || '?'} · 해상도 ${s.resolution || '?'} · ${Math.round(s.size / 1024)}KB`)
    lines.push(`🟢 켠 기능(${on.length}): ${on.join(', ') || '없음'}`)
    lines.push(`🔴 끈 기능(${off.length}): ${off.join(', ') || '없음'}`)
  } else {
    lines.push('동기화한 설정 없음')
  }
  return { embeds: [new EmbedBuilder().setTitle('👤 애드온 사용자').setColor(0x00B894).setDescription(lines.join('\n'))] }
}

async function addonStatus (query) {
  let users
  try {
    users = await fetchAddonUsers()
  } catch (e) {
    return { content: `애드온 서버에 연결할 수 없어요 (${e.code || e.message}). VM에서 \`systemctl status addon-server\`를 확인해 주세요.` }
  }
  if (!query) return addonSummary(users)
  const q = query.toLowerCase()
  const found = users.filter(u => u.discord_id === query || u.name.toLowerCase().includes(q))
  if (found.length === 0) return { content: `'${query}'에 맞는 애드온 사용자가 없어요` }
  if (found.length > 1) return { content: `여러 명이 맞아요 — 더 길게 적어주세요:\n${found.slice(0, 15).map(u => `· ${u.name}`).join('\n')}` }
  return addonDetail(found[0])
}

const HELP = [
  '**!현황** — 제작자 전용 (결과는 DM으로)',
  '`!현황 봇` 봇이 들어간 서버와 서버별 켠 기능',
  '`!현황 봇 <서버 이름 일부>` 그 서버 설정 자세히',
  '`!현황 애드온` 애드온 사용자별 접속·동기화',
  '`!현황 애드온 <이름 일부>` 그 사용자 자세히'
].join('\n')

module.exports = { botStatus, addonStatus, HELP }
