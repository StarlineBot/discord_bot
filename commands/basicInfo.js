const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('섯다라인')
    .setDescription('안녕? 난 섯다라인 봇이야!'),
  run: ({ interaction }) => {
    // 길드별로 해야할일이 있을때
    // console.log(interaction.member.guild.id)

    const embed = new EmbedBuilder()
      .setTitle('섯다라인 명령어 목록')
      .setColor('#3A0729')
      .addFields(
        { name: '/요리', value: '[BETA] 재료를 입력하거나 능력치를 선택하면 포함되는 음식을 찾아줘~' }
        , { name: '/오미', value: '오늘 베테랑 던전과 오늘의 그림자 미션을 보여줘~' }
        , {
          name: '/날씨',
          value: '리얼타임 기준 날씨 정보를 알려주고 발화석은 언제 캘수 있는지 쌍검전사는 언제 스케치 가능한지 알려줘~'
        }
        , { name: '/파티모집', value: '폼에 맞게 입력하면 자동으로 파티모집에 글을 작성해줘!' }
        , { name: '/크롬계산기', value: '크롬 암호 계산기야~' }
        , { name: '/분배계산기', value: '금액과 인원수를 입력하면 분배금 뚝딱!' }
        , { name: '/교환인챈트', value: '오늘 복원의 가루로 교환할수 있는 인챈트를 알려줘~' }
        , { name: '/매일뉴스', value: '오늘 간추린 뉴스~' }
        , { name: '/주사위', value: '1~99의 주사위를 굴려~' }
      )

    interaction.reply(
      { content: '안녕?😎 난 섯다라인 봇이야! 지금 사용가능한 명령어를 알려줄게~', embeds: [embed] })
  }
}
