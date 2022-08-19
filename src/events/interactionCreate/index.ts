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
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import Acronym from "./commands/acronym.js";
import Alive from "./commands/alive.js";
import Audio from "./commands/audio.js";
import Blazes from "./commands/blazes.js";
import Define from "./commands/define.js";
import Emoji from "./commands/emoji.js";
import Jobs from "./commands/jobs.js";
import MarkovCommand from "./commands/markov.js";
import Response from "./commands/response.js";
import Tts from "./commands/tts.js";
import TwitterCommand from "./commands/twitter.js";
import Vote from "./commands/vote.js";

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

export const commands = {
  acronym: Acronym,
  alive: Alive,
  audio: Audio,
  blazes: Blazes,
  define: Define,
  emoji: Emoji,
  jobs: Jobs,
  markkov: MarkovCommand,
  response: Response,
  tts: Tts,
  twitter: TwitterCommand,
  vote: Vote,
};

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
