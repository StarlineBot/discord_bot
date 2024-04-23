const {EmbedBuilder} = require("discord.js");

const channelId = process.env.NODE_ENV === "development" ? process.env.OTHER_ROLE_AUDITING_CHANNEL_ID : process.env.ROLE_AUDITING_CHANNEL_ID;
module.exports = (oldMember, newMember) => {
  console.log(newMember.user);
  console.log(oldMember.roles.cache.size, newMember.roles.cache.size);

  const embed = new EmbedBuilder()
  .setColor("#86E57F")
  .setAuthor({name: `${newMember.user.globalName}`, iconURL: newMember.user.displayAvatarURL()})
  .setTitle(`${newMember.user.username}`)

  if(oldMember.roles.cache.size < newMember.roles.cache.size) {
    newMember.roles.cache.forEach(role => {
      if (!oldMember.roles.cache.has(role.id)) {
        embed.setDescription(`<@${newMember.user.id}> \`${role.name}\` 권한이 부여 됨`);
      }
    });
  }
  if(oldMember.roles.cache.size > newMember.roles.cache.size) {
    oldMember.roles.cache.forEach(role => {
      if (!newMember.roles.cache.has(role.id)) {
        embed.setDescription(`<@${newMember.user.id}> \`${role.name}\` 권한이 삭제 됨`);
      }
    });
  }
  embed.setFooter({text: `ID: ${newMember.user.id} ${new Date().toISOString()}`});

  newMember.guild.channels.cache.find(channel => channel.id === channelId).send({ embeds: [embed]});
}