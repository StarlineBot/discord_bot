const fs = require('fs')
const { EmbedBuilder } = require('discord.js')

const USER_COUNT_PATH = './static/json/userMessageCount.json'
const VOICE_COUNT_PATH = './static/json/voiceTimeCount.json'

function getUserMessageCounts () {
  if (!fs.existsSync(USER_COUNT_PATH)) return null
  return JSON.parse(fs.readFileSync(USER_COUNT_PATH))
}

function saveUserMessageCounts (data) {
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
    .setTitle(`🌟 이주의 채팅 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 이 주에 ${count}번을 떠들었어요~.`)
    .setTimestamp()
}

function getUserVoiceCounts () {
  if (!fs.existsSync(VOICE_COUNT_PATH)) return null
  return JSON.parse(fs.readFileSync(VOICE_COUNT_PATH))
}

function saveUserVoiceCount (data) {
  fs.writeFileSync(VOICE_COUNT_PATH, JSON.stringify(data, null, 2))
}

function createVoiceRankingEmbed ([userId, durationMs], index) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[index] || '🥉'
  const minute = (durationMs / 1000 / 60).toFixed(1)
  return new EmbedBuilder()
    .setTitle(`🌟 이주의 보이스채팅 랭킹 TOP ${medal}`)
    .setColor(`${getRandomColor()}`)
    .setDescription(`<@${userId}> 님이 이 주에 ${minute}분을 참여했어요~.`)
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

module.exports = {
  getUserMessageCounts,
  saveUserMessageCounts,
  getTopRanking,
  createRankingEmbed,

  getUserVoiceCounts,
  saveUserVoiceCount,
  createVoiceRankingEmbed
}
