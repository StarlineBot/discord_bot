const {EmbedBuilder} = require("discord.js");
const {DateTime} = require("luxon");
const channelId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_ROLE_AUDITING_CHANNEL_ID
    : process.env.ROLE_AUDITING_CHANNEL_ID;
const roleId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_GUILD_ROLE : process.env.GUILD_ROLE;
const now = DateTime.now().setLocale("ko");
module.exports = (member) => {
  const role = member.guild.roles.cache.find(role => role.name === "손님");
  const guildRole = member.guild.roles.cache.find(role => role.id === roleId);
  member.send(
      `============================================\n🌟어서오세요! ${member.user.globalName}님~🌟\n\n${member.guild.name}에 오신것을 환영합니다!\n'${role.name}'역할이 부여 되었으니 ${member.guild.name}서버에서 음성채팅에 참여해보세요~\n============================================`)
  member.roles.add(role.id).then(() => {
    console.log(`${role.name} added by ${member.user.globalName}`)
  });

  const embed = new EmbedBuilder()
  .setColor("#86E57F")
  .setAuthor({
    name: `${member.user.globalName}`,
    iconURL: member.user.displayAvatarURL()
  })
  .setTitle(`${member.user.username}`)
  .setDescription(
      `<@${member.user.id}> 님이 서버에 입장 했어요.\n\n\`${member.guild}\`의 길드원이 맞다면 아래 버튼을 눌러 \`${guildRole.name}\` 권한을 부여하세요.`)
  .setFooter(
      {text: `ID: ${member.user.id} ${now.toFormat("yyyy-MM-dd HH:mm cccc")}`});

  let components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: `\`${guildRole.name}\` 부여하기`,
          customId: JSON.stringify(
              {memberId: `${member.user.id}`, action: "doAddRole"})
        }
      ]
    }
  ];
  member.guild.channels.cache.find(channel => channel.id === channelId).send(
      {embeds: [embed], components: components});
}