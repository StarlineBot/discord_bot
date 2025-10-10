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
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

/* eslint-disable */
new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events')
})
/* eslint-disable */

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