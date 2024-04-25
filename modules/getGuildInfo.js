const guildInfo = [
  // 향내나는실크
  {
    guildId: process.env.GUILD_ID,
    adminRole: process.env.GUILD_ADMIN_ROLE_ID,
    guestRole: process.env.GUILD_GUEST_ROLE_ID,
    guildMemberRole: process.env.GUILD_ROLE,
    roleAuditingChannelId: process.env.ROLE_AUDITING_CHANNEL_ID,
    channelId: process.env.CHANNEL_ID,
    partyChannelId: process.env.PARTY_RECRUITMENT
  }
  // 개발
  , {
    guildId: process.env.DEV_GUILD_ID,
    adminRole: process.env.DEV_GUILD_ADMIN_ROLE_ID,
    guestRole: process.env.DEV_GUILD_GUEST_ROLE_ID,
    guildMemberRole: process.env.DEV_GUILD_ROLE,
    roleAuditingChannelId: process.env.DEV_ROLE_AUDITING_CHANNEL_ID,
    channelId: process.env.DEV_CHANNEL_ID,
    partyChannelId: process.env.DEV_PARTY_RECRUITMENT
  }
];
// guildId 별로 길드 권한이나 채널등의 아이디를 가져옴
module.exports.getGuildInfo = (guildId) => {
  return guildInfo.find(guild => guild.guildId === guildId)
}