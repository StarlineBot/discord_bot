const fs = require('node:fs')

const filePath = './static/json/partyAlerts.json'
const MAX_PER_USER = 5
const TTL_MS = 5 * 60 * 1000 // 5분 무외침 → 모집 끝으로 간주(재알림 허용)

// { keywords: [{guildId, userId, keyword, createdAt}], seen: { [userId]: { [signature]: lastSeenMs } } }
function read () {
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { keywords: d.keywords || [], seen: d.seen || {}, windows: d.windows || {} }
  } catch (e) {
    return { keywords: [], seen: {}, windows: {} }
  }
}

function write (data) {
  fs.mkdirSync('./static/json', { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function listByUser (guildId, userId) {
  return read().keywords.filter(k => k.guildId === guildId && k.userId === userId)
}

function add ({ guildId, userId, keyword }) {
  const data = read()
  const mine = data.keywords.filter(k => k.guildId === guildId && k.userId === userId)
  if (mine.length >= MAX_PER_USER) return { ok: false, error: `키워드는 최대 ${MAX_PER_USER}개까지야~ 먼저 삭제해줘` }
  if (mine.some(k => k.keyword === keyword)) return { ok: false, error: `'${keyword}'는 이미 등록돼 있어~` }
  data.keywords.push({ guildId, userId, keyword, createdAt: new Date().toISOString() })
  write(data)
  return { ok: true }
}

function removeByKeyword (guildId, userId, keyword) {
  const data = read()
  const before = data.keywords.length
  data.keywords = data.keywords.filter(k => !(k.guildId === guildId && k.userId === userId && k.keyword === keyword))
  if (data.keywords.length === before) return { ok: false }
  write(data)
  return { ok: true }
}

// 거뿔 파티모집 메시지 파싱: "캐릭명 : #[채널7] 내용 [2/4명]완"
// content=화면표시용 제목(채널·인원·완 제거)
// signature=채널+정규화내용. 중복 알림을 줄이려고 아래 두 가지를 서명에서 뺀다:
//  - 모든 숫자: 남은 인원이 줄며 "딜러2모집"→"딜러1모집"처럼 텍스트가 바뀌어도 같은 파티로 인식
//  - 캐릭터명: 같은 파티를 여러 모집자가 동시에 올려도(공동모집) 한 번만 알림
// 트레이드오프: 채널·문구가 완전히 같고 숫자만 다른 '별개' 파티가 5분 내 올라오면 하나는 억제될 수 있음(드묾).
function parseRecruit (b) {
  let body = b.message
  const prefix = b.character_name + ' : '
  if (body.startsWith(prefix)) body = body.slice(prefix.length)
  const chMatch = body.match(/#\[채널(\d+)\]/)
  const channelToken = chMatch ? chMatch[0] : ''
  const channelNum = chMatch ? chMatch[1] : '?'
  const content = body
    .replace(/#\[채널\d+\]/, '')
    .replace(/\[\d+\/\d+명\]완?/g, '')
    .trim()
  const sigContent = content.replace(/\d+/g, '').replace(/\s+/g, '')
  const signature = channelToken + '|' + sigContent
  return { characterName: b.character_name, channelNum, content, signature }
}

// 알림 여부(슬라이딩 TTL): 만료된 서명 정리 후, 없으면 알림. 매 호출마다 시각 갱신.
// data는 read()결과, 저장은 호출측에서.
function shouldAlert (data, userId, signature, nowMs) {
  const seen = data.seen[userId] || (data.seen[userId] = {})
  for (const sig of Object.keys(seen)) {
    if (nowMs - seen[sig] > TTL_MS) delete seen[sig]
  }
  const isNew = seen[signature] == null
  seen[signature] = nowMs // 계속 외치면 갱신돼서 재알림 안 됨(파티당 1회)
  return isNew
}

// 알림 시간대: hour(0~23)가 [start, end) 범위 안인지. start>end면 자정 넘김(wrap), start===end면 24시간.
function inWindow (hour, start, end) {
  if (start < end) return hour >= start && hour < end
  if (start > end) return hour >= start || hour < end
  return true
}

function getWindow (userId) {
  return read().windows[userId] || null
}

function setWindow (userId, start, end) {
  const data = read()
  data.windows[userId] = { start, end }
  write(data)
}

function clearWindow (userId) {
  const data = read()
  if (data.windows[userId]) { delete data.windows[userId]; write(data) }
}

// 현재 시각(hour, KST)에 이 유저가 알림 받을 수 있나. 미설정=항상.
function isAlertableNow (data, userId, hour) {
  const w = data.windows[userId]
  if (!w) return true
  return inWindow(hour, w.start, w.end)
}

module.exports = { read, write, listByUser, add, removeByKeyword, parseRecruit, shouldAlert, inWindow, getWindow, setWindow, clearWindow, isAlertableNow, MAX_PER_USER, TTL_MS }
