import {
  BaseApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
} from "discord.js";
import { readdirSync } from "fs";
// import { eventListeners } from "./events/index.js";
import config from "./helpers/config.js";
import { __dirname } from "./helpers/general.js";

export type DukebotCommand = {
  type: "command";
  data: BaseApplicationCommandData;
  add: (client: DukebotClient) => Promise<void>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export type DukebotFeature = DukebotCommand;

export type DukebotClient = Client & {
  commands?: DukebotCommand[];
};

const client: DukebotClient = new Client({
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

client.on("ready", (c) => {
  let featuresDirectoryPath = `${__dirname(import.meta.url)}/features`;
  readdirSync(featuresDirectoryPath).map(async (folder) => {
    const feature = (await import(
      `${featuresDirectoryPath}/${folder}/index${config.fileExtension}`
    )) as DukebotFeature;

    if (feature.type == "command") {
      client.commands.push(feature);
    }

    // if ((feature as DukebotCommand).execute !== undefined) {
    //   client.commands.push(feature);
    // }
  });
});

// Object.entries(eventListeners).forEach(([event, listener]) => {
//   client.on(event, listener);
// });

client.login(config.token);
