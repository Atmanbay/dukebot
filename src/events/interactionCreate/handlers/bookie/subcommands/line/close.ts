import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "close",
  description: "Open a line with the provided description and choices",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply("line close");
};
