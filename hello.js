require("dotenv").config();
const path = require("path");
const { CommandHandler} = require("djs-commander");

const {Client, GatewayIntentBits, Partials} = require("discord.js");
const client = new Client({
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
  ],
});

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events")
});

client.login(process.env.TOKEN);