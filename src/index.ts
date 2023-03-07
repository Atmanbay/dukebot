import { Client, GatewayIntentBits } from "discord.js";
import { eventListeners } from "./events/index.js";
import config from "./utils/config.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

Object.entries(eventListeners).forEach(([event, listener]) => {
  client.on(event, listener);
});

client.login(config.token);
