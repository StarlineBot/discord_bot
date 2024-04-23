module.exports = (member) => {
  console.log(member);
  const role = member.guild.roles.cache.find(role => role.name === "손님");
  member.send(`============================================\n🌟어서오세요! ${member.user.globalName}님~🌟\n\n${member.guild.name}에 오신것을 환영합니다!\n'${role.name}'역할이 부여 되었으니 ${member.guild.name}서버에서 음성채팅에 참여해보세요~\n============================================`)
  member.roles.add(role.id).then(()=> {
    console.log(`${role.name} added by ${member.user.globalName}`)
  });
}