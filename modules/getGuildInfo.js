const guildInfo = [
  {guildId: process.env.GUILD_ID, adminRole: process.env.GUILD_ADMIN_ROLE_ID, guestRole: process.env.GUILD_GUEST_ROLE_ID, guildMemberRole: process.env.GUILD_ROLE, roleAuditingChannelId: process.env.ROLE_AUDITING_CHANNEL_ID, channelId: process.env.CHANNEL_ID, partyChannelId: process.env.PARTY_RECRUITMENT}
  , {guildId: process.env.DEV_GUILD_ID, adminRole: process.env.DEV_GUILD_ADMIN_ROLE_ID, guestRole: process.env.DEV_GUILD_GUEST_ROLE_ID, guildMemberRole: process.env.DEV_GUILD_ROLE, roleAuditingChannelId: process.env.DEV_ROLE_AUDITING_CHANNEL_ID, channelId: process.env.DEV_CHANNEL_ID, partyChannelId: process.env.DEV_PARTY_RECRUITMENT}
];
module.exports.getGuildInfo = (guildId) => {
  return guildInfo.find(guild => guild.guildId === guildId)
}