const fs = require('node:fs')

// 1:1 문의(모드메일) 매핑: 유저 ↔ 포럼 문의 스레드.
// { byUser: { [userId]: threadId }, byThread: { [threadId]: userId } }
const filePath = './static/json/modmail.json'

function read () {
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { byUser: d.byUser || {}, byThread: d.byThread || {} }
  } catch (e) {
    return { byUser: {}, byThread: {} }
  }
}

function write (data) {
  fs.mkdirSync('./static/json', { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function getThreadByUser (userId) {
  return read().byUser[userId] || null
}

function getUserByThread (threadId) {
  return read().byThread[threadId] || null
}

// 유저 ↔ 스레드 연결(기존 연결이 있으면 교체)
function link (userId, threadId) {
  const d = read()
  const old = d.byUser[userId]
  if (old) delete d.byThread[old]
  d.byUser[userId] = threadId
  d.byThread[threadId] = userId
  write(d)
}

function unlink (userId) {
  const d = read()
  const t = d.byUser[userId]
  if (t) delete d.byThread[t]
  delete d.byUser[userId]
  write(d)
}

module.exports = { read, write, getThreadByUser, getUserByThread, link, unlink }
