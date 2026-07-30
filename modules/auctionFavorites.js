const fs = require('node:fs')

const filePath = './static/json/auctionFavorites.json'
const MAX_PER_USER = 5

// { favorites: [ {id, guildId, userId, label, category, keyword, maxPrice, metalwares:[{name,minLevel}], createdAt} ],
//   seen: { [favId]: { [signature]: expireISO } } }
function read () {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { favorites: data.favorites || [], seen: data.seen || {} }
  } catch (e) {
    return { favorites: [], seen: {} }
  }
}

function write (data) {
  fs.mkdirSync('./static/json', { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function listByUser (guildId, userId) {
  return read().favorites.filter(f => f.guildId === guildId && f.userId === userId)
}

// 등록. label은 유저별 유니크, 인당 MAX_PER_USER개 제한
function add (fav) {
  const data = read()
  const mine = data.favorites.filter(f => f.guildId === fav.guildId && f.userId === fav.userId)
  if (mine.length >= MAX_PER_USER) {
    return { ok: false, error: `즐겨찾기는 최대 ${MAX_PER_USER}개까지야~ 먼저 삭제해줘` }
  }
  if (mine.some(f => f.label === fav.label)) {
    return { ok: false, error: `'${fav.label}' 라벨은 이미 있어~ 다른 이름을 써줘` }
  }
  const record = { id: `${fav.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...fav }
  data.favorites.push(record)
  write(data)
  return { ok: true, fav: record }
}

function removeByLabel (guildId, userId, label) {
  const data = read()
  const removed = data.favorites.find(f => f.guildId === guildId && f.userId === userId && f.label === label)
  if (!removed) return { ok: false }
  data.favorites = data.favorites.filter(f => f !== removed)
  delete data.seen[removed.id]
  write(data)
  return { ok: true, removed }
}

// 배치용: 아직 알리지 않은 매물만 반환 + seen 기록. 만료 지난 서명은 정리해서 재등록 매물이 다시 알림되게 함.
// data(read 결과)를 직접 변경만 하고 저장은 호출측에서 한 번에.
function pickNewMatches (data, favId, matches) {
  const nowMs = Date.now()
  const seen = data.seen[favId] || {}
  for (const sig of Object.keys(seen)) {
    if (new Date(seen[sig]).getTime() < nowMs) delete seen[sig]
  }
  const fresh = []
  for (const it of matches) {
    const sig = `${it.item_display_name}|${it.auction_price_per_unit}|${it.date_auction_expire}`
    if (seen[sig]) continue
    seen[sig] = it.date_auction_expire || new Date(nowMs + 3600000).toISOString()
    fresh.push(it)
  }
  data.seen[favId] = seen
  return fresh
}

module.exports = { read, write, listByUser, add, removeByLabel, pickNewMatches, MAX_PER_USER }
