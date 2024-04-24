const roleId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_GUILD_ROLE : process.env.GUILD_ROLE;
const guildAdminRoleId = process.env.NODE_ENV === "development"
    ? process.env.OTHER_GUILD_ADMIN_ROLE_ID : process.env.GUILD_ADMIN_ROLE_ID;
const timeout = 3000;
module.exports = async (interaction, client) => {
  if (interaction.isButton()) {
    const buttonInfo = JSON.parse(interaction.customId);
    const action = buttonInfo.action;
    const memberId = buttonInfo.memberId;
    const clickMember = interaction.member;

    let message;
    switch (buttonInfo.action) {
      case "bulkDelete":
        const isAllowed = !!clickMember.roles.cache.find(
            role => role.id === guildAdminRoleId);
        if (!isAllowed) {
          message = `권한이 없는 사용자 입니다.\n\n이 메세지는 ${timeout / 1000}초 후 삭제됩니다.`;
          break;
        }
        await interaction.message.channel.bulkDelete(100, true);

        message = `과거 메세지 100건 삭제 완료. → 메세지삭제자: <@${clickMember.user.id}>\n\n이 메세지는 ${timeout
        / 1000}초 후 삭제됩니다.`;
        break;
      case "doAddRole":
      default:

        const guildRole = clickMember.guild.roles.cache.find(
            role => role.id === roleId);
        const guild = client.guilds.cache.find(
            guild => guild.id === clickMember.guild.id);
        const targetMember = guild.members.cache.find(
            member => member.id === memberId);
        const roles = targetMember.roles;
        const existRole = !!roles.cache.find(role => role.id === guildRole.id);
        if (!existRole) {
          targetMember.roles.add(guildRole);
        }

        message = existRole
            ? `이미 <@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한이 부여 되어 있습니다.`
            : `<@${targetMember.user.id}> 에게 \`${guildRole.name}\` 권한을 부여 했습니다. → 권한부여자: <@${clickMember.user.id}>`;
        break;
    }
    interaction.reply(message);

    if (action === "bulkDelete") {
      setTimeout(() => interaction.deleteReply(), timeout);
    }

  }
}