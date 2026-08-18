const fs = require('fs')
const path = require('path')
const { EmbedBuilder } = require('discord.js')
const { DateTime } = require('luxon')

const USER_COUNT_PATH = './static/json/userMessageCount.json'
const VOICE_COUNT_PATH = './static/json/voiceTimeCount.json'

// 쓰기 전에 상위 디렉토리를 보장한다(static/json 미존재 시 ENOENT 크래시 방지)
function ensureDir (filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function getUserMessageCounts () {
  if (!fs.existsSync(USER_COUNT_PATH)) return null
  return JSON.parse(fs.readFileSync(USER_COUNT_PATH))
}

function saveUserMessageCounts (data) {
  ensureDir(USER_COUNT_PATH)
  fs.writeFileSync(USER_COUNT_PATH, JSON.stringify(data, null, 2))
}

function getTopRanking (userCounts, limit = 3) {
  return Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
}

// 집계 대상은 '직전 한 주'라, 게시 시점(일요일 0시)에서 하루 빼 그 주에 들어가게 한 뒤 몇째 주인지 계산
function getWeekLabel () {
  const d = DateTime.now().setZone('Asia/Seoul').minus({ days: 1 })
  const weekOfMonth = Math.ceil(d.day / 7)
  return `${d.month}월 ${weekOfMonth}번째 주`
}

function createRankingEmbed ([userId, count], index) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[index] || '🥉'

  return new EmbedBuilder()
    .setTitle(`🌟 ${getWeekLabel()} 활동 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 한 주간 ${count}번 활동했어요~`)
    .setTimestamp()
}

function getUserVoiceCounts () {
  if (!fs.existsSync(VOICE_COUNT_PATH)) return null
  return JSON.parse(fs.readFileSync(VOICE_COUNT_PATH))
}

function saveUserVoiceCount (data) {
  ensureDir(VOICE_COUNT_PATH)
  fs.writeFileSync(VOICE_COUNT_PATH, JSON.stringify(data, null, 2))
}

function createVoiceRankingEmbed ([userId, durationMs], index) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[index] || '🥉'
  const minute = (durationMs / 1000 / 60).toFixed(1)
  return new EmbedBuilder()
    .setTitle(`🌟 ${getWeekLabel()} 보이스채팅 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 한 주간 ${minute}분을 참여했어요~`)
    .setTimestamp()
}

const getRandomColor = function () {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const updateUserMessageCount = function (guildId, userId, isAdd) {
  const delta = isAdd ? 1 : -1
  let userMessageCounts = {}

  if (fs.existsSync(USER_COUNT_PATH)) {
    userMessageCounts = JSON.parse(fs.readFileSync(USER_COUNT_PATH))
  }

  if (!userMessageCounts[guildId]) {
    userMessageCounts[guildId] = {}
  }

  userMessageCounts[guildId][userId] = Math.max((userMessageCounts[guildId][userId] || 0) + delta, 0)
  ensureDir(USER_COUNT_PATH)
  fs.writeFileSync(USER_COUNT_PATH, JSON.stringify(userMessageCounts, null, 2))
}

module.exports = {
  getUserMessageCounts,
  saveUserMessageCounts,
  getTopRanking,
  createRankingEmbed,

  getUserVoiceCounts,
  saveUserVoiceCount,
  createVoiceRankingEmbed,
  updateUserMessageCount
}
