const {SlashCommandBuilder} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('섯다라인')
  .setDescription('안녕? 난 섯다라인 봇이야!')
  , run: ({interaction}) => {
    interaction.reply("안녕?😎 난 섯다라인 봇이야! 향내나는실크에서 편리한 기능을 제공하고 있어. 아래는 사용할수 있는 명령어야!\n\n/크롬계산기\n/매일뉴스");
  }
}