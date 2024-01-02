import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { logError } from "../../../../../../utils/logger.js";
import { getBalance } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "check",
  description: "Check balance",
  options: [],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    let balance = getBalance(interaction.user.id);

    await interaction.editReply({
      content: `\`${balance}\``,
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
