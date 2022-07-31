import { Client, Intents } from "discord.js";
import { getTypeDict } from "./utils";
import { EventListener } from "./types/discord/eventListener";
import { setup } from "./services/twitter";

const main = async () => {
  // const services = createContainer();
  // services.register({
  //   audio: asClass(AudioService),
  //   button: asClass(ButtonService),
  //   twitter: asClass(TwitterService),
  //   job: asClass(DatabaseService)
  // })

  // const test = services.cradle.audio;
  // services.loadModules([`${__dirname}/services/*.ts`], {
  //   formatName: (name: string) => {
  //     return `${name[0].toLowerCase()}${name.substring(1)}`;
  //   },
  //   resolverOptions: {
  //     lifetime: Lifetime.SINGLETON,
  //     register: asClass,
  //   },
  // });

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

  const eventListeners = getTypeDict<EventListener<any>>(
    `${__dirname}/events/**/index.ts`
  );

  Object.entries(eventListeners).forEach(([event, listener]) => {
    client.on(event, listener);
  });

  client.login(process.env.DISCORD_TOKEN);
};

main();
