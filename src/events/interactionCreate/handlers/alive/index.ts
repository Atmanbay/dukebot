import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";

export const data: ChatInputApplicationCommandData = {
  name: "alive",
  description: "Returns a greeting",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply({
    content: "I'm alive!",
    ephemeral: true,
  });
};
