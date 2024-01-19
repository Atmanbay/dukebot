import { Client, GatewayIntentBits } from "discord.js";
import { loadFeatures } from "./features/index.js";
import config from "./utils/config.js";
import { logError } from "./utils/logger.js";

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

client.on("ready", async (c) => {
  try {
    await loadFeatures(c);
  } catch (error) {
    logError(error);
  }
});

client.login(config.token);
