import {
  AnySelectMenuInteraction,
  ApplicationCommandData,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Message,
  VoiceState,
} from "discord.js";
import { readdirSync } from "fs";
import { isEqual } from "lodash-es";
import hash from "object-hash";
import { getSingletonTable } from "../database/database.js";
import { BotConfig, InteractionContext } from "../database/models.js";
import config from "../utils/config.js";
import { logInfo } from "../utils/logger.js";
// import acronym from "./acronym/index.js";
// import alive from "./alive/index.js";
// import audio from "./audio/index.js";
// import blaze from "./blazes/index.js";

const botConfigs = await getSingletonTable<BotConfig>("botConfigs");
const interactionContexts = await getSingletonTable<InteractionContext>(
  "interactionContexts"
);

class Loader<T extends any> {
  #items: T[] = [];
  #complete: (client: Client, items: T[]) => Promise<void>;

  load = (data: T) => {
    this.#items.push(data);
  };

  complete = async (client: Client) => {
    await this.#complete(client, this.#items);
  };

  hasItems = () => {
    return this.#items.length > 0;
  };

  constructor(complete: (client: Client, items: T[]) => Promise<void>) {
    this.#complete = complete;
  }
}

const loaders = {
  commands: new Loader<ApplicationCommandData>(async (client, items) => {
    let oldCommandHashObject = botConfigs.get((bc) => bc.key === "commandHash");
    let newCommandHash = hash(items);

    if (!oldCommandHashObject) {
      await botConfigs.create({
        key: "commandHash",
        value: newCommandHash,
      });

      await client.application.commands.set(items, config.serverId);
      logInfo("Bot started with new commands");
    } else if (oldCommandHashObject.value !== newCommandHash) {
      await client.application.commands.set(items, config.serverId);

      oldCommandHashObject.value = newCommandHash;
      await botConfigs.update(oldCommandHashObject);

      logInfo("Bot started with new commands");
    } else {
      logInfo("Bot started");
    }
  }),
  chatInput: new Loader<{
    commandTree: string[];
    handler: (interaction: ChatInputCommandInteraction) => Promise<void>;
  }>(async (client, items) => {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.guildId !== config.serverId) {
        return;
      }

      if (!interaction.isChatInputCommand()) {
        return;
      }

      let commandName = interaction.commandName;
      let subcommandGroup = interaction.options.getSubcommandGroup(false);
      let subcommand = interaction.options.getSubcommand(false);

      let commandTree = [commandName];
      if (subcommandGroup) {
        commandTree.push(subcommandGroup);
      }

      if (subcommand) {
        commandTree.push(subcommand);
      }

      let chatInputHandler = items.find((i) =>
        isEqual(commandTree, i.commandTree)
      );

      if (chatInputHandler) {
        await chatInputHandler.handler(interaction);
      } else {
        logInfo(`No handler found for command: ${commandTree.join("/")}`);
      }
    });
  }),
  messages: new Loader<(message: Message) => Promise<void>>(
    async (client, items) => {
      client.on("messageCreate", async (message) => {
        if (message.guildId !== config.serverId) {
          return;
        }

        let handlerPromises = items.map((handler) => handler(message));
        await Promise.all(handlerPromises);
      });
    }
  ),
  buttons: new Loader<{
    id: string;
    handler: (
      interaction: ButtonInteraction,
      context: InteractionContext
    ) => Promise<void>;
  }>(async (client, items) => {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.guildId !== config.serverId) {
        return;
      }

      if (!interaction.isButton()) {
        return;
      }

      let interactionId: string;
      if (interaction.message.interaction) {
        interactionId = interaction.message.interaction.id;
      } else {
        interactionId = interaction.message.id;
      }

      const context = interactionContexts.get(
        (ic) => ic.interactionId === interactionId
      );

      let buttonId = interaction.customId;
      const button = items.find((i) => i.id === buttonId);
      if (!button) {
        await interaction.reply({
          content: "Something went wrong while handling this button",
          ephemeral: true,
        });
        return;
      }

      await button.handler(interaction, context);
    });
  }),
  voice: new Loader<
    (oldState: VoiceState, newState: VoiceState) => Promise<void>
  >(async (client, items) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
      if (newState.guild.id !== config.serverId) {
        return;
      }

      let handlerPromises = items.map((handler) => handler(oldState, newState));
      await Promise.all(handlerPromises);
    });
  }),
  selectMenus: new Loader<{
    id: string;
    handler: (
      interaction: AnySelectMenuInteraction,
      context: InteractionContext
    ) => Promise<void>;
  }>(async (client, items) => {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.guildId !== config.serverId) {
        return;
      }

      if (!interaction.isAnySelectMenu()) {
        return;
      }

      let interactionId: string;
      if (interaction.message.interaction) {
        interactionId = interaction.message.interaction.id;
      } else {
        interactionId = interaction.message.id;
      }

      const context = interactionContexts.get(
        (ic) => ic.interactionId === interactionId
      );

      let selectMenuId = interaction.customId;
      const selectMenu = items.find((i) => i.id === selectMenuId);
      if (!selectMenu) {
        await interaction.reply({
          content: "Something went wrong while handling this select menu",
          ephemeral: true,
        });
        return;
      }

      await selectMenu.handler(interaction, context);
    });
  }),
} as const;

type Loaders = typeof loaders;

export type Feature = {
  load: (loaders: Loaders) => Promise<void>;
};

export const loadFeatures = async (client: Client) => {
  const folders = readdirSync("./src/features");
  const featurePromises = folders
    .filter((folder) => !folder.startsWith("index"))
    .map(async (folder) => {
      let feature = (await import(`./${folder}/index${config.fileExtension}`))
        .default as Feature;

      await feature.load(loaders);
    });

  await Promise.all(featurePromises);

  const loaderPromises = Object.values(loaders)
    .filter((loader) => loader.hasItems)
    .map(async (loader) => {
      await loader.complete(client);
    });

  await Promise.all(loaderPromises);
};
