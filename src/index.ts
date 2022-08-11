import { Client, Intents } from "discord.js";
import { getTypeDict } from "./utils/index.js";
import { EventListener } from "./types/discord/eventListener.js";
import { setup } from "./services/twitter.js";
import config from "./utils/config.js";

const main = async () => {
  setup();
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MEMBERS,
    ],
  });

  const eventListeners = await getTypeDict<EventListener<any>>(
    `${process.cwd()}/src/events/**/index.ts`
  );

  Object.entries(eventListeners).forEach(([event, listener]) => {
    client.on(event, listener);
  });

  client.login(config.token);
};

main();
