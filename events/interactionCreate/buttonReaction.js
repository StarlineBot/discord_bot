const roleId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_GUILD_ROLE : process.env.GUILD_ROLE;
module.exports = (interaction, client) => {
  if(interaction.isButton()) {
    const buttonInfo = JSON.parse(interaction.customId);
    const memberId = buttonInfo.memberId;
    const action = buttonInfo.action;
    if(action === "doAddRole"){
      const clickMember = interaction.member;
      const guildRole = clickMember.guild.roles.cache.find(role => role.id === roleId);
      const guild = client.guilds.cache.find(guild => guild.id === clickMember.guild.id);
      const roles = guild.members.cache.find(member => member.id === memberId).roles;
      const existRole = !!roles.cache.find(role => role.id === guildRole.id);
      const targetMember = guild.members.cache.find(member => member.id === memberId);
      if(!existRole) {
        targetMember.roles.add(guildRole);
      }

      interaction.reply(existRole ? `이미 <@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한이 부여 되어 있습니다.` : `<@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한을 부여 했습니다. → 권한부여자: <@${clickMember.user.id}>`)
    }

  }
}