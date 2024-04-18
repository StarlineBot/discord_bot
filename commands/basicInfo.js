const {SlashCommandBuilder} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('섯다라인')
  .setDescription('안녕? 난 섯다라인 봇이야!')
  , run: ({interaction}) => {
    interaction.reply(
        "안녕?😎 난 섯다라인 봇이야! 향내나는실크에서 편리한 기능을 제공하고 있어. 아래는 사용할수 있는 명령어야!\n"
        + "\n/오미 (오늘 베테랑 던전과 오늘의 그림자 미션을 보여줘~)\n/파티모집 (폼에 맞게 입력하면 자동으로 파티모집에 글을 작성해줘!)\n/크롬계산기 (크롬 암호 계산기야~)\n/분배계산기 (금액과 인원수를 입력하면 분배금 뚝딱!)\n/교환인챈트 (오늘 복원의 가루로 교환할수 있는 인챈트를 알려줘~)\n/매일뉴스 (오늘 간추린 뉴스~)"
    );
  }
}