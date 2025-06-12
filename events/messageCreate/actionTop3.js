const { EmbedBuilder } = require('discord.js')
const guildModule = require('../../modules/getGuildInfo')
const fs = require('fs')
const {
  getUserMessageCounts,
  getTopChatRanking,
  createRankingEmbed,
} = require('../../modules/RankingUtil');
const prefix = '!'

module.exports = async (message, client) => {
  if (message.author.bot || !message.guildId || !message.content.startsWith(prefix + '채팅랭킹')) return;

  const guildId = message.guildId;
  const guildInfo = guildModule.getGuildInfo(guildId);
  if (!guildInfo) return;

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const adminRoleId = guildInfo.adminRole;
    const member = guild.members.cache.get(message.author.id);
    if (!member || !member.roles.cache.has(adminRoleId)) return;

    let userMessageCounts = getUserMessageCounts();
    if (!userMessageCounts) return;

    const userCounts = userMessageCounts[guildId];
    const topRanks = getTopChatRanking(userCounts);
    if (topRanks.length === 0) return;
    const embeds = topRanks.map(createRankingEmbed);

    message.reply({ embeds });
  } catch (error) {
    console.error(`Error while processing 채팅랭킹 for guild ${guildId}:`, error);
  }
}
