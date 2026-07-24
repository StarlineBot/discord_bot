const fs = require('fs')
const path = require('path')
const { EmbedBuilder } = require('discord.js')

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

function createRankingEmbed ([userId, count], index) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[index] || '🥉'

  return new EmbedBuilder()
    .setTitle(`🌟 이주의 활동 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 이 주에 ${count}번 활동했어요~`)
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
    .setTitle(`🌟 이주의 보이스채팅 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 이 주에 ${minute}분을 참여했어요~`)
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
