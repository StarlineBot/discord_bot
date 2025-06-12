const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

const USER_COUNT_PATH = './static/json/userMessageCount.json';

function getUserMessageCounts() {
  if (!fs.existsSync(USER_COUNT_PATH)) return null;
  return JSON.parse(fs.readFileSync(USER_COUNT_PATH));
}

function saveUserMessageCounts(data) {
  fs.writeFileSync(USER_COUNT_PATH, JSON.stringify(data, null, 2));
}

function getTopChatRanking(userCounts, limit = 3) {
  return Object.entries(userCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, limit);
}

function createRankingEmbed([userId, count], index) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[index] || '🥉';

  return new EmbedBuilder()
  .setTitle(`🌟 이주의 채팅 랭킹 TOP ${medal}`)
  .setColor('#FFD9EC')
  .setDescription(`<@${userId}> 님이 이 주에 ${count}번을 떠들었어요~.`)
  .setTimestamp();
}

module.exports = {
  getUserMessageCounts,
  saveUserMessageCounts,
  getTopChatRanking,
  createRankingEmbed,
};