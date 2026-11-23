require('dotenv').config()
const path = require('path')
const { CommandHandler } = require('djs-commander')

const { Client, GatewayIntentBits, Partials } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
})

const handler = new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events')
})

// 명령어 사용량 기록(docs/command-usage-stats-plan.md).
// djs-commander는 생성자에서 명령 목록을 동기로 채우고 run을 await하므로, 여기서 run을 감싸면
// 명령 파일을 고치지 않고 성공(ok)/예외(err)를 셀 수 있다. 예외는 기록 후 그대로 다시 던진다.
const commandUsage = require('./modules/commandUsage')
commandUsage.wrapCommands(handler.commands)
setInterval(() => commandUsage.flush(), 60 * 1000).unref()
// pm2 재시작·Ctrl+C 때 남은 기록 저장 후 종료(리스너를 달면 기본 종료가 사라지므로 직접 exit)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    commandUsage.flush()
    process.exit(0)
  })
}

// 안전망: 이벤트 핸들러 하나에서 던진 예외가 봇 프로세스 전체를 죽이지 않도록 최상위에서 흡수한다.
// (discord.js Client는 리스너 없는 'error' 방출 시 Node가 그대로 크래시함 → 반드시 리스너 등록)
client.on('error', (error) => console.error('[client error]', error))
client.on('shardError', (error) => console.error('[shard error]', error))
process.on('unhandledRejection', (error) => console.error('[unhandledRejection]', error))
process.on('uncaughtException', (error) => console.error('[uncaughtException]', error))

client.login(process.env.TOKEN)

/**
 * (old) 웹서버를 띄우고 html 을 만들어 이미지를 저장 후 사용했으나 프로세스 변경으로 사용하지 않음
const app = express();
app.use(express.static("static"))
app.listen(3000, function(){
  console.log("app is running on port 3000");
})

// 이미지를 비율에 따라 만들기 위해 html 적용
app.get("/", function(req, res){
  res.sendFile(__dirname + "/static/html/cookInfo.html")
})
*/
