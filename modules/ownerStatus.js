const axios = require('axios')
const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')
const settings = require('./guildSettings')
const catalog = require('./featureCatalog')
const { stateOf, buildSettingsView } = require('./settingsView')
const partyChannelMod = require('./partyChannel')
const { addonServerUrl } = require('../config/bot')
const commandUsage = require('./commandUsage')
const guildRegistry = require('./guildRegistry')

// 제작자 전용 '!현황' 명령의 화면 생성(봇 서버별 설정 / 애드온 사용자 현황).
// 메시지 처리·권한 확인은 events/messageCreate/ownerStatus.js.

const TEXT_LIMIT = 5500 // 디스코드: 한 메시지 임베드 글자 합 6000 제한
const INDENT = '　'

// 글자 합 제한 안에서 넣을 수 있는 줄만, 남은 개수와 함께
function fitLines (lines, limit = TEXT_LIMIT) {
  const shown = []
  let size = 0
  for (const line of lines) {
    if (size + line.length + 1 > limit) break
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
  const on = catalog.FEATURES.filter(f => stateOf(f.sub, guild.id).on === true)
    .map(f => f.sub === '파티모집' && partyChannelMod.isWrongType(guild) ? '파티모집⚠️텍스트채널' : f.sub)
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
  return { users: r.data.users || [], guests: r.data.guests || [] }
}

// 비로그인(명세 3.4.3): 최근 7일 안에 올린 설치만 보여 준다(같은 설치가 로그인하면 7일 뒤 자연히 빠짐)
const GUEST_DAYS = 7
const guestLabel = (g) => `guest-${g.install_id.slice(0, 8)}`
// ── 캐릭터 사용 현황(애드온 명세 3.4.4) ──
// 입력: settings/guest의 character {pack(빈 값=기본 목소리), pet, affinity} + features의 pet·character_voice(날짜)
const PACK_NAMES = {
  '조용한 여성': '다래',
  '부드러운 여성': '아리아',
  '화난 여성': '레나',
  '차분한 남성': '이안',
  '장난스러운 남성': 'Starline',
  '자연스러운 여성': '이름 미정'
}
const AFFINITY_BUCKETS = [['0~24', 0, 24], ['25~49', 25, 49], ['50~74', 50, 74], ['75~99', 75, 99], ['100', 100, 100]]
const hasChar = (s) => !!(s && s.character && typeof s.character.pack === 'string')
const charName = (pack) => pack === '' ? '기본' : (PACK_NAMES[pack] || pack) // 모르는 팩은 팩 이름 그대로
// featureUsage 날짜가 최근 7일(서버 받은 날 기준, featureView 규칙)인지
const usedRecently = (s, key) => featureView(s).on.some(f => f.key === key && f.date)
// 펫: featureUsage 'pet'이 날짜로 있으면 그걸로, 그 키가 없는 옛 앱은 character.pet === true로 대신
function petOn (s) {
  const v = s.features && s.features.pet
  if (typeof v === 'string') return usedRecently(s, 'pet')
  return !!(s.character && s.character.pet === true)
}
// 목소리 알림: featureUsage 'character_voice'가 최근 7일일 때만(옛 앱은 셈 안 함)
const voiceOn = (s) => usedRecently(s, 'character_voice')
const charLabel = (s) => hasChar(s) ? `캐릭터: ${charName(s.character.pack)}${s.character.pack !== '' && petOn(s) ? '(펫)' : ''}` : null
const withChar = (base, s) => { const c = charLabel(s); return c ? `${base} · ${c}` : base }

function affinityBucket (v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  const n = Math.floor(v)
  const b = AFFINITY_BUCKETS.find(([, lo, hi]) => n >= lo && n <= hi)
  return b ? b[0] : null
}

// 맨 위 요약 줄(최근 7일 접속한 로그인 + 비로그인). entries: [{ s, guest:bool }]
function characterSummary (entries) {
  const withData = entries.filter(e => hasChar(e.s))
  if (!withData.length) return ['🎭 캐릭터: 자료 없음']
  const byName = new Map()
  for (const { s, guest } of withData) {
    const name = charName(s.character.pack)
    const c = byName.get(name) || { login: 0, guest: 0 }
    c[guest ? 'guest' : 'login']++
    byName.set(name, c)
  }
  const chars = [...byName.entries()].sort((a, b) => (b[1].login + b[1].guest) - (a[1].login + a[1].guest) || a[0].localeCompare(b[0]))
    .map(([name, c]) => `${name} ${c.login + c.guest} (로그인 ${c.login} · 비로그인 ${c.guest})`)
  const pets = withData.filter(e => e.s.character.pack !== '' && petOn(e.s)).length
  const voices = withData.filter(e => voiceOn(e.s)).length
  const buckets = Object.fromEntries(AFFINITY_BUCKETS.map(([k]) => [k, 0]))
  for (const { s } of withData) {
    if (s.character.pack === '') continue // 기본 목소리는 호감도 제외
    const b = affinityBucket(s.character.affinity)
    if (b) buckets[b]++
  }
  return [
    `🎭 캐릭터: ${chars.join(' · ')}`,
    `🐾 펫 띄움 ${pets}명 · 🔔 캐릭터 목소리 알림 ${voices}명`,
    `💗 호감도: ${AFFINITY_BUCKETS.map(([k]) => `${k} ${buckets[k]}`).join(' · ')}`
  ]
}

const recentGuests = (guests) => {
  const since = DateTime.now().minus({ days: GUEST_DAYS })
  return guests.filter(g => g.updated && DateTime.fromISO(g.updated) >= since)
}

// 기능 사용 값(addon_server settings.features) 해석 — 값이 두 종류 섞여 올 수 있다.
//  - 날짜 'YYYY-MM-DD'(새 앱 featureUsage, 기능별 마지막 실제 동작일):
//      서버가 받은 시각(settings.updated, KST 날짜) 기준 최근 7일(받은 날 포함 = 0~6일 전)이면 🟢, 아니면 표시 안 함.
//      미래 날짜(앱 PC 시계·시차)는 받은 날로 본다.
//  - bool(옛 앱 enabled·...Enabled): true면 🟢, false면 🔴.
//  옛 키 autofindV2는 서버가 새로 받을 땐 빼지만, 그 전에 저장된 행에 남아 있을 수 있어 여기서도 뺀다.
const RECENT_DAYS = 7
const HIDDEN_KEYS = new Set(['autofindV2'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function featureView (s) {
  const view = { on: [], off: [] }
  if (!s) return view
  const ref = (s.updated ? DateTime.fromISO(s.updated) : DateTime.now()).setZone('Asia/Seoul').startOf('day')
  for (const [key, v] of Object.entries(s.features || {})) {
    if (HIDDEN_KEYS.has(key)) continue
    if (typeof v === 'boolean') {
      (v ? view.on : view.off).push({ key })
    } else if (typeof v === 'string' && DATE_RE.test(v)) {
      const day = DateTime.fromISO(v, { zone: 'Asia/Seoul' })
      if (!day.isValid) continue
      const daysAgo = Math.max(0, Math.round(ref.diff(day.startOf('day'), 'days').days)) // 미래 → 0(받은 날)
      if (daysAgo < RECENT_DAYS) view.on.push({ key, date: v, daysAgo })
    }
  }
  // 최근에 쓴 것부터(날짜 없는 옛 bool은 뒤, 같은 조건은 이름순)
  view.on.sort((a, b) => (a.daysAgo ?? 99) - (b.daysAgo ?? 99) || a.key.localeCompare(b.key))
  return view
}

const onFeatures = (s) => featureView(s).on.map(f => f.key)
const featureLabel = (f) => f.date ? `${f.key}(${f.date.slice(5)})` : f.key
// 앱 버전(sync.json "app"). 없으면 '?' — 버전 저장 전 업로드 또는 버전을 안 보내는 옛 앱
const appLabel = (s) => s && s.app ? `v${s.app}` : '앱 버전 ?'

function addonSummary (users, guests = []) {
  let total = 0
  const lines = users.map(u => {
    const s = u.settings
    let line = `**${u.name}** · ${u.tier}${u.status !== 'active' ? ` · ${u.status}` : ''}\n${INDENT}접속 ${kst(u.last_seen)} ${ago(u.last_seen)}`
    if (s) {
      total += s.rev
      const on = onFeatures(s)
      line += ` · 동기화 ${s.rev}회 · 마지막 ${kst(s.updated)} ${ago(s.updated)}`
      line += `\n${INDENT}${withChar(`${appLabel(s)} · ${s.device || '?'} · ${s.resolution || '?'} · 켠 기능 ${on.length}개`, s)}`
      line += `\n${INDENT}🟢 ${on.length ? on.join(', ') : '켠 기능 없음'}`
    } else {
      line += ' · 동기화 없음'
    }
    return line
  })
  // 로그인 사용자 아래에 비로그인 줄(로그인 줄과 같은 형식: 접속 시각·앱 버전·해상도·켠 기능)
  const recent = recentGuests(guests)
  for (const g of recent) {
    const on = onFeatures(g)
    lines.push(`**${guestLabel(g)}** · 비로그인\n${INDENT}접속 ${kst(g.updated)} ${ago(g.updated)}` +
      `\n${INDENT}${withChar(`${appLabel(g)} · ${g.resolution || '?'} · 켠 기능 ${on.length}개`, g)}` +
      `\n${INDENT}🟢 ${on.length ? on.join(', ') : '켠 기능 없음'}`)
  }
  const since = DateTime.now().minus({ days: GUEST_DAYS })
  const recentLogin = users.filter(u => u.settings && u.last_seen && DateTime.fromISO(u.last_seen) >= since)
  lines.unshift(`👤 비로그인 ${recent.length}명(최근 ${GUEST_DAYS}일)`,
    ...characterSummary([...recentLogin.map(u => ({ s: u.settings, guest: false })), ...recent.map(g => ({ s: g, guest: true }))]))
  const { shown, rest } = fitLines(lines)
  const synced = users.filter(u => u.settings).length
  return {
    embeds: [new EmbedBuilder().setTitle('📱 애드온 사용 현황').setColor(0x00B894)
      .setDescription(shown.join('\n'))
      .setFooter({ text: `로그인 ${users.length}명 · 동기화 ${synced}명 · 총 동기화 ${total}회 · 비로그인 ${recent.length}명${rest ? ` · 외 ${rest}줄` : ''} · 시각 KST · 자세히: !현황 애드온 <이름|guest-앞8자>` })]
  }
}

function addonDetail (u) {
  const s = u.settings
  const lines = [
    `**${u.name}** (\`${u.discord_id}\`) · ${u.tier} · ${u.status}`,
    `처음 로그인 ${kst(u.created)} · 마지막 접속 ${kst(u.last_seen)} ${ago(u.last_seen)} · 로그아웃 ${kst(u.logged_out)}`
  ]
  if (s) {
    const { on, off } = featureView(s)
    const isUsage = on.some(f => f.date)
    lines.push(`동기화 ${s.rev}회 · 마지막 ${kst(s.updated)} ${ago(s.updated)}`)
    lines.push(withChar(`${appLabel(s)} · PC ${s.device || '?'} · 해상도 ${s.resolution || '?'} · ${Math.round(s.size / 1024)}KB`, s))
    // 새 앱(날짜) = 최근 7일 안에 실제로 쓴 기능(괄호는 마지막 사용일) / 옛 앱(bool) = 켜 둔 기능
    lines.push(`🟢 ${isUsage ? '최근 7일 쓴 기능' : '켠 기능'}(${on.length}): ${on.map(featureLabel).join(', ') || '없음'}`)
    if (off.length) lines.push(`🔴 끈 기능(${off.length}): ${off.map(f => f.key).join(', ')}`)
  } else {
    lines.push('동기화한 설정 없음')
  }
  return { embeds: [new EmbedBuilder().setTitle('👤 애드온 사용자').setColor(0x00B894).setDescription(lines.join('\n'))] }
}

function guestDetail (g) {
  const { on } = featureView(g)
  const isUsage = on.some(f => f.date)
  const lines = [
    `**${guestLabel(g)}** · 비로그인 (설치 \`${g.install_id}\`)`,
    `마지막 올림 ${kst(g.updated)} ${ago(g.updated)}`,
    withChar(`${appLabel(g)} · 해상도 ${g.resolution || '?'} · ${Math.round((g.size || 0) / 1024)}KB`, g),
    `🟢 ${isUsage ? '최근 7일 쓴 기능' : '켠 기능'}(${on.length}): ${on.map(featureLabel).join(', ') || '없음'}`
  ]
  return { embeds: [new EmbedBuilder().setTitle('👤 애드온 비로그인 사용자').setColor(0x00B894).setDescription(lines.join('\n'))] }
}

async function addonStatus (query) {
  let users, guests
  try {
    ({ users, guests } = await fetchAddonUsers())
  } catch (e) {
    return { content: `애드온 서버에 연결할 수 없어요 (${e.code || e.message}). VM에서 \`systemctl status addon-server\`를 확인해 주세요.` }
  }
  if (!query) return addonSummary(users, guests)
  const q = query.toLowerCase()
  if (q.startsWith('guest-')) {
    const prefix = q.slice(6)
    const hits = prefix ? guests.filter(g => g.install_id.startsWith(prefix)) : []
    if (hits.length === 1) return guestDetail(hits[0])
    return { content: hits.length ? '여러 설치가 맞아요 — 더 길게 적어주세요' : `'${query}'에 맞는 비로그인 사용자가 없어요` }
  }
  const found = users.filter(u => u.discord_id === query || u.name.toLowerCase().includes(q))
  if (found.length === 0) return { content: `'${query}'에 맞는 애드온 사용자가 없어요` }
  if (found.length > 1) return { content: `여러 명이 맞아요 — 더 길게 적어주세요:\n${found.slice(0, 15).map(u => `· ${u.name}`).join('\n')}` }
  return addonDetail(found[0])
}

// ── 명령어 사용량 ──
const DEFAULT_DAYS = 7
const MAX_DAYS = 366
const MEDALS = ['🥇', '🥈', '🥉']
const ERR_MIN_CALLS = 3 // 에러율은 이 횟수 이상 쓴 명령만
const SLOW_MS = 2000 // 평균 이 시간 이상이면 '느림'
const LIST_TOP = 5

const sec = (ms) => `${(ms / 1000).toFixed(1)}초`

function parseDays (query) {
  if (!query) return DEFAULT_DAYS
  const n = parseInt(query, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return Math.min(n, MAX_DAYS)
}

function guildName (client, guildId) {
  if (guildId === 'DM') return 'DM'
  return client?.guilds?.cache?.get(guildId)?.name || guildRegistry.get(guildId)?.name || guildId
}

// summary(commandUsage.summary 결과) → 임베드. client는 서버 이름 표시용(없어도 됨)
function buildCommandView (s, client) {
  const users = (r) => s.userCounting && r.users ? ` · ${r.users}명` : ''
  const lines = []
  if (!s.rows.length) {
    lines.push('기록된 사용이 없어요')
  } else {
    s.rows.forEach((r, i) => {
      lines.push(`${MEDALS[i] || `${i + 1}.`} **${r.key}** ${r.total}회${users(r)}`)
    })
  }

  const extra = []
  const errs = s.rows.filter(r => r.err > 0 && r.total >= ERR_MIN_CALLS)
    .sort((a, b) => b.err / b.total - a.err / a.total || b.err - a.err).slice(0, LIST_TOP)
  if (errs.length) extra.push(`⚠️ 에러 많음: ${errs.map(r => `${r.key} err ${r.err}/${r.total} (${Math.round(r.err / r.total * 100)}%)`).join(' · ')}`)
  const slow = s.rows.filter(r => r.msAvg != null && r.msAvg >= SLOW_MS)
    .sort((a, b) => b.msAvg - a.msAvg).slice(0, LIST_TOP)
  if (slow.length) extra.push(`🐢 느림: ${slow.map(r => `${r.key} 평균 ${sec(r.msAvg)}(최대 ${sec(r.msMax)})`).join(' · ')}`)
  if (s.unused.length) extra.push(`💤 ${s.days}일간 0회: ${s.unused.join(', ')}`)
  if (s.byGuild.length) extra.push(`🏠 서버별: ${s.byGuild.map(g => `${guildName(client, g.guildId)} ${g.total}회`).join(' · ')}`)

  // 요약 줄(에러·느림·0회·서버별)은 꼭 보이게 남기고, 순위 목록을 남은 자리만큼만 넣는다
  const extraText = extra.join('\n')
  const { shown, rest } = fitLines(lines, Math.min(TEXT_LIMIT, 4000) - extraText.length - 20)
  const body = [shown.join('\n') + (rest ? `\n… 외 ${rest}개` : ''), extraText].filter(Boolean).join('\n\n')

  const total = s.rows.reduce((a, r) => a + r.total, 0)
  const notes = [`${s.from} ~ ${s.to} KST`, `총 ${total}회`]
  notes.push(s.userCounting ? '사람 수는 하루 단위 합(여러 날 쓴 사람은 중복)' : '사람 수 집계 꺼짐(USAGE_SALT 없음)')
  return {
    embeds: [new EmbedBuilder().setTitle(`📊 명령어 사용량 (최근 ${s.days}일, 제작자 제외)`).setColor(0xF39C12)
      .setDescription(body.slice(0, 4096) || '기록된 사용이 없어요')
      .setFooter({ text: `${notes.join(' · ')} · 다른 기간: !현황 명령어 <일수>` })]
  }
}

function commandStatus (client, query) {
  const days = parseDays(query)
  if (days == null) return { content: '일수는 숫자로 적어주세요 (예: `!현황 명령어 30`)' }
  return buildCommandView(commandUsage.summary(days), client)
}

const HELP = [
  '**!현황** — 제작자 전용 (결과는 DM으로)',
  '`!현황 봇` 봇이 들어간 서버와 서버별 켠 기능',
  '`!현황 봇 <서버 이름 일부>` 그 서버 설정 자세히',
  '`!현황 애드온` 애드온 사용자별 접속·동기화',
  '`!현황 애드온 <이름 일부>` 그 사용자 자세히',
  '`!현황 명령어 [일수]` 슬래시 명령 사용량(기본 최근 7일)'
].join('\n')

module.exports = { botStatus, addonStatus, commandStatus, buildCommandView, parseDays, HELP, featureView, characterSummary, charLabel, affinityBucket }
