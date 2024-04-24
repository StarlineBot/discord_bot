const {EmbedBuilder} = require("discord.js");
const {DateTime} = require("luxon");
const channelId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_ROLE_AUDITING_CHANNEL_ID
    : process.env.ROLE_AUDITING_CHANNEL_ID;
const now = DateTime.now().setLocale("ko");
module.exports = (member) => {
  const embed = new EmbedBuilder()
  .setColor("#FF0000")
  .setAuthor({
    name: `${member.user.globalName}`,
    iconURL: member.user.displayAvatarURL()
  })
  .setTitle(`${member.user.username}`)
  .setDescription(`<@${member.user.id}> 님이 서버에서 퇴장 함`)
  .setFooter(
      {text: `ID: ${member.user.id} ${now.toFormat("yyyy-MM-dd HH:mm cccc")}`});

  member.guild.channels.cache.find(channel => channel.id === channelId).send(
      {embeds: [embed]});
}