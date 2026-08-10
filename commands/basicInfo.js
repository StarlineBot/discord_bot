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
        { name: '/요리', value: '재료를 입력하거나 능력치를 선택하면 포함되는 음식을 찾아줘~' }
        , { name: '/오미', value: '오늘 베테랑 던전과 오늘의 그림자 미션을 보여줘~' }
        , { name: '/오검', value: '아르카나별 오검 조합을 확인해~' }
        , { name: '/브리레흐주화깡', value: '주화도박을 해보자~' }
        , {
          name: '/날씨',
          value: '리얼타임 기준 날씨 정보를 알려주고 발화석은 언제 캘수 있는지 쌍검전사는 언제 스케치 가능한지 알려줘~'
        }
        , { name: '/파티모집', value: '폼에 맞게 입력하면 자동으로 파티모집에 글을 작성해줘!' }
        , { name: '/분배계산기', value: '금액과 인원수를 입력하면 분배금 뚝딱!' }
        , { name: '/교환인챈트', value: '오늘 복원의 가루로 교환할수 있는 인챈트를 알려줘~' }
        , { name: '/주사위', value: '1~99의 주사위를 굴려~' }
        , { name: '/튼주', value: '하프서버의 튼튼한 주머니를 상인별로 불러와~' }
        , { name: '/경매장', value: '장비·액세서리·에코스톤을 세공 등 조건으로 검색해줘~ (데이터는 실제보다 ~10분 지연)' }
        , { name: '/경매장즐겨찾기', value: '매물을 즐겨찾기하면 새 매물이 뜰 때 DM으로 알려줘~ (5분 주기)' }
        , { name: '/운세', value: '오늘의 운세를 봐줄게~ (하루 한 번 고정, 재미로만!)' }
        , { name: '/사주팔자', value: '생년월일시로 사주팔자·오행·띠를 뽑아줘~ (재미로만!)' }
        , { name: '/파티알림', value: '키워드를 등록하면 거뿔 파티모집 제목에 뜰 때 DM으로 알려줘~' }
        , { name: '/타로점', value: '카드를 셔플해서 과거·현재·미래 3장을 뽑아줘~ (재미로만!) 🔮' }
        , { name: '/섯다라인설정', value: '서버별 봇 설정 on/off (관리자 전용) ⚙️' }
      )

    interaction.reply(
      { content: '안녕?😎 난 섯다라인 봇이야! 지금 사용가능한 명령어를 알려줄게~', embeds: [embed] })
  }
}
