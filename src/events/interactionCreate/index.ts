import {
  ButtonInteraction,
  ChatInputApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Button } from "../../database/button.js";
import { messageActions } from "../../database/database.js";
import { MessageAction } from "../../database/models.js";
import config from "../../utils/config.js";
import { getTypeDict } from "../../utils/general.js";
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

export interface Command extends ChatInputApplicationCommandData {
  run: RunExecutor | Record<string, RunExecutor>;
  handleButton?: {
    [Key in Button["type"]]?: ButtonExecutor;
  };
}

const commands = await getTypeDict<Command>(
  `${process.cwd()}/src/events/interactionCreate/commands/*`
);

const InteractionCreateHandler: EventListener<"interactionCreate"> = async (
  interaction: Interaction
) => {
  try {
    if (config.serverId !== interaction.guild.id) {
      return;
    }

    if (interaction.isButton()) {
      let interactionId = interaction.message.interaction.id;
      const messageAction = messageActions.get(
        (ma) => ma.interactionId === interactionId
      );

      const button = messageAction.buttons.find(
        (b) => b.buttonId === interaction.customId
      );
      const command = commands[messageAction.data.command];
      if (command.handleButton) {
        await command.handleButton[button.type]({
          interaction,
          messageAction,
        });
      }
    } else if (interaction.isCommand()) {
      const commandName = interaction.commandName;
      const command = commands[commandName];
      if (typeof command.run !== "function") {
        await command.run[interaction.options.getSubcommand()](interaction);
      } else {
        await command.run(interaction);
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

export default InteractionCreateHandler;
