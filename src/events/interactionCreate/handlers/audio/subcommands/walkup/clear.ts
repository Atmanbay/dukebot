import { walkups } from "@/@/helpers/database/index.js";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "clear",
  description: "Clear your walkup",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  let walkup = walkups.get(
    (walkup) => walkup.userId === interaction.member.user.id
  );

  if (walkup) {
    await walkups.delete(walkup.id);
  }

  await interaction.reply({
    content: `Walkup cleared!`,
    ephemeral: true,
  });
};
