const express = require("express")
require('dotenv').config()
const path = require('path')
const { CommandHandler } = require('djs-commander')

const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
})

/* eslint-disable */
new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events')
})
/* eslint-disable */

client.login(process.env.TOKEN)

const app = express();
app.use(express.static("static"))
app.listen(3000, function(){
  console.log("app is running on port 3000");
})

// 이미지를 비율에 따라 만들기 위해 html 적용
app.get("/", function(req, res){
  res.sendFile(__dirname + "/static/html/cookInfo.html")
})