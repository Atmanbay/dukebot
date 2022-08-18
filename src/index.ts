import { Client, Intents } from "discord.js";
import { eventListeners } from "./events/index.js";
import config from "./utils/config.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
});

Object.entries(eventListeners).forEach(([event, listener]) => {
  client.on(event, listener);
});

client.login(config.token);
