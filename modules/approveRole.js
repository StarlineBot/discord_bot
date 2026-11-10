const settings = require('./guildSettings')

// 승인권한부여(입장 로그의 '역할 부여' 버튼)에 쓸 역할 ID. 꺼져 있거나 역할 미지정이면 null.
// 하위호환: approveRoleEnabled 플래그가 생기기 전에 승인역할(guildMemberRole)을 지정해둔 서버는
// 플래그가 없으면 '켜짐'으로 간주한다(업데이트 후 버튼이 갑자기 사라지지 않게).
function approveRoleOf (guildId) {
  const roleId = settings.get(guildId, 'guildMemberRole', null)
  if (!roleId) return null
  return settings.get(guildId, 'approveRoleEnabled', true) ? roleId : null
}

module.exports = { approveRoleOf }
