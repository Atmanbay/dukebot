import {
  ButtonInteraction,
  ChatInputApplicationCommandData,
  CommandInteraction,
  Interaction,
  Message,
} from "discord.js";
import fs from "fs";
import { messageActions } from "../../database/database.js";
import { MessageAction } from "../../database/models.js";
import config from "../../utils/config.js";
import { __dirname } from "../../utils/general.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";

type RunExecutor = (interaction: CommandInteraction) => Promise<void>;
type ButtonExecutor = ({
  interaction,
  messageAction,
}: {
  interaction: ButtonInteraction;
  messageAction: MessageAction;
}) => Promise<void>;

export interface InteractionCreateHandler
  extends ChatInputApplicationCommandData {
  handle: RunExecutor | Record<string, RunExecutor>;
  handleButton?: Record<string, ButtonExecutor>;
}

const handlerFolder = `${__dirname(import.meta.url)}/handlers`;
export const handlers = Object.fromEntries(
  await Promise.all(
    fs.readdirSync(handlerFolder).map(async (file) => {
      const handler = (await import(`${handlerFolder}/${file}`))
        .default as InteractionCreateHandler;
      return [handler.name, handler] as const;
    })
  )
);

const InteractionCreateEventHandler: EventListener<
  "interactionCreate"
> = async (interaction: Interaction) => {
  try {
    if (config.serverId !== interaction.guild.id) {
      return;
    }

    if (interaction.isButton()) {
      let messageAction: MessageAction;
      if (interaction.message.interaction) {
        messageAction = messageActions.get(
          (ma) => ma.interactionId === interaction.message.interaction.id
        );
      } else if ((interaction.message as Message).reference) {
        messageAction = messageActions.get(
          (ma) => ma.messageId === interaction.message.id // this might not look correct but it is!
        );
      }

      if (!messageAction) {
        await interaction.reply({
          content: "Something went wrong when handling this button",
          ephemeral: true,
        });
        return;
      }

      const button = messageAction.buttons.find(
        (b) => b.buttonId === interaction.customId
      );

      const command = handlers[messageAction.data.command];
      if (command.handleButton) {
        await command.handleButton[button.type]({
          interaction,
          messageAction,
        });
      }
    } else if (interaction.isCommand()) {
      const commandName = interaction.commandName;
      const command = handlers[commandName];
      if (typeof command.handle !== "function") {
        await command.handle[interaction.options.getSubcommand()](interaction);
      } else {
        await command.handle(interaction);
      }

      if (!interaction.replied) {
        await interaction.reply({
          content: "Command ran but no response given. Yell at Andrew",
          ephemeral: true,
        });
      }
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
