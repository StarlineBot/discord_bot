const guildModule = require('../../modules/getGuildInfo')
const botId = process.env.BOT_ID

module.exports = async (message, client) => {
  // 봇이 작성하지 않은 글에만 반응, 길드에서 사용하기 때문에 길드 아이디가 없으면 작업하지 않음
  if (message.author.bot || !message.guildId) return;

  const guildId = message.guildId;
  const guildInfo = guildModule.getGuildInfo(guildId);
  // 마찬가지로 길드정보가 없으면 작업하지 않음
  if (!guildInfo) return;

  const partyChannel = client.channels.cache.get(guildInfo.partyChannelId);
  if (!partyChannel) return;

  for (const thread of partyChannel.threads.cache.values()) {
    try {
      const messages = await thread.messages.fetch();
      const originMessage = messages.get(message.channelId);

      // 원래 메세지가 없거나 봇이 작성한게 아니면 작업하지 않음
      if (!originMessage || !originMessage.author.bot) continue;

      // 맨션을 봇을 지칭해야함
      const mentionedBot = message.mentions.users.find(user => user.id === botId && user.bot);
      if (!mentionedBot) continue;

      const updatedContent = buildUpdatedContent(originMessage.content, message.author.id);
      if (!updatedContent) continue;

      await originMessage.edit({ content: updatedContent });
      console.log('updated', thread.id);

    } catch (err) {
      console.error('Error processing thread:', thread.id, err);
    }
  }
};

function buildUpdatedContent(originalContent, userIdToRemove) {
  const marker = '현재 참가인원';
  const findIndex = originalContent.lastIndexOf(marker);
  if (findIndex === -1) return null;

  let content = originalContent.substring(0, findIndex + marker.length);
  const memberListText = originalContent.substring(findIndex + marker.length);
  const participants = extractUserIds(memberListText).filter(id => id !== userIdToRemove);

  for (const participant of participants) {
    content += `\n - <@${participant}>`;
  }

  return content;
}

function extractUserIds(text) {
  return text
  .replaceAll(' ', '')
  .split('-')
  .map(segment => segment.replace(/\D/g, ''))
  .filter(id => id.length > 0);
}
