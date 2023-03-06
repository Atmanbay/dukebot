import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ButtonInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Interaction,
  Message,
} from "discord.js";
import fs from "fs";
import { glob } from "glob";
import { messageActions } from "../../database/database.js";
import { MessageAction } from "../../database/models.js";
import config from "../../utils/config.js";
import { __dirname } from "../../utils/general.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";

const handlersFolder = `${__dirname(import.meta.url)}/handlers`;
export const commandData = await Promise.all(
  fs.readdirSync(handlersFolder).map(async (folder) => {
    const data = (await import(`${handlersFolder}/${folder}/index.ts`))
      .data as ChatInputApplicationCommandData;

    if (fs.existsSync(`${handlersFolder}/${folder}/subcommands`)) {
      const subcommandDataPromises = fs
        .readdirSync(`${handlersFolder}/${folder}/subcommands`)
        .map(async (subfolder) => {
          const subcommandData = (
            await import(
              `${handlersFolder}/${folder}/subcommands/${subfolder}/index.ts`
            )
          ).data as ApplicationCommandOptionData;

          if (
            subcommandData.type === ApplicationCommandOptionType.SubcommandGroup
          ) {
            const subcommandGroupPromises = fs
              .readdirSync(
                `${handlersFolder}/${folder}/subcommands/${subfolder}`
              )
              .filter((subcommandOption) => subcommandOption !== "index.ts")
              .map(async (subcommandOption) => {
                return (
                  await import(
                    `${handlersFolder}/${folder}/subcommands/${subfolder}/${subcommandOption}`
                  )
                ).data as ApplicationCommandSubCommandData;
              });

            const subcommandGroupSubcommands = await Promise.all(
              subcommandGroupPromises
            );

            if (!subcommandData.options) {
              subcommandData.options = [];
            }

            subcommandData.options = [
              ...subcommandData.options,
              ...subcommandGroupSubcommands,
            ];
          }

          if (!data.options) {
            data.options = [];
          }

          data.options = [...data.options, subcommandData];
        });

      await Promise.all(subcommandDataPromises);
    }

    return data;
  })
);

const handlerFiles = await glob(`${handlersFolder}/**/*.ts`);
const handlers = {};
const handlerPromises = handlerFiles.map(async (thf) => {
  let path = thf.replace(".ts", "").replace(`${handlersFolder}/`, "");
  let nodes = path.split("/");

  let commandName = nodes[0];
  if (!(commandName in handlers)) {
    handlers[commandName] = {};
  }

  if (nodes.length === 2) {
    let handler = (await import(thf)).handler as (
      interaction: ChatInputCommandInteraction
    ) => Promise<void>;

    if (handler) {
      handlers[commandName].handler = handler;
    }
  } else {
    let subfolder = nodes[1];

    if (subfolder === "buttons") {
      if (!("buttons" in handlers[commandName])) {
        handlers[commandName].buttons = {};
      }

      let buttonName = nodes[2];
      handlers[commandName].buttons[buttonName] = (await import(thf))
        .handler as (
        interaction: ButtonInteraction,
        messageAction: MessageAction
      ) => Promise<void>;
    } else if (subfolder === "subcommands") {
      let subcommandName = nodes[2];
      let subcommand = await import(thf);
      if (!subcommand.handler) {
        return;
      }

      if (!("subcommands" in handlers[commandName])) {
        handlers[commandName].subcommands = {};
      }

      let handler = subcommand.handler as (
        interaction: ChatInputCommandInteraction
      ) => Promise<void>;

      if (nodes[3] === "index") {
        handlers[commandName].subcommands[subcommandName] = handler;
      } else {
        handlers[commandName].subcommands[subcommandName] = {
          [nodes[3]]: handler,
        };
      }
    }
  }
});

await Promise.all(handlerPromises);

const InteractionCreateEventHandler: EventListener<
  "interactionCreate"
> = async (interaction: Interaction) => {
  try {
    if (config.serverId !== interaction.guild.id) {
      return;
    }

    if (interaction.isChatInputCommand()) {
      let commandName = interaction.commandName;
      let subcommandGroup = interaction.options.getSubcommandGroup(false);
      let subcommand = interaction.options.getSubcommand(false);

      let handler: (interaction: ChatInputCommandInteraction) => Promise<void>;
      let command = handlers[commandName];

      if (subcommandGroup) {
        handler = command.subcommands[subcommandGroup][subcommand];
      } else if (subcommand) {
        handler = command.subcommands[subcommand];
      } else {
        handler = command.handler;
      }

      await handler(interaction);
    } else if (interaction.isButton()) {
      let messageAction: MessageAction;
      if (interaction.message.interaction) {
        messageAction = messageActions.get(
          (ma) => ma.interactionId === interaction.message.interaction.id
        );
      } else if ((interaction.message as Message).reference) {
        messageAction = messageActions.get(
          (ma) => ma.messageId === interaction.message.id
        );
      }

      if (!messageAction) {
        await interaction.reply({
          content: "Something went wrong when handling this button",
          ephemeral: true,
        });
        return;
      }

      let button = messageAction.buttons.find(
        (b) => b.buttonId === interaction.customId
      );

      let command: (
        interaction: ButtonInteraction,
        messageAction: MessageAction
      ) => Promise<void> = handlers[messageAction.command].buttons[button.type];

      await command(interaction, messageAction);
    }
  } catch (error) {
    logError(error);
    if (
      (interaction.isButton() || interaction.isCommand()) &&
      !interaction.replied
    ) {
      await interaction.reply({
        content: "An error has occurred when trying to run your command",
        ephemeral: true,
      });
    }
  }
};

export default InteractionCreateEventHandler;
