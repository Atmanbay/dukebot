import { triviaSessions } from "@/@/helpers/database/index.js";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "delete",
  description: "Deletes the current trivia session",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  if (triviaSessions.list().length > 0) {
    let triviaSession = triviaSessions.list()[0];
    await triviaSessions.delete(triviaSession.id);

    await interaction.reply({
      content: "Trivia session deleted",
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "No trivia session found",
      ephemeral: true,
    });
  }
};
