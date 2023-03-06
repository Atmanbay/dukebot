import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { walkups } from "../../../../../../database/database.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "set",
  description: "Clear your walkup",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  let clipName = interaction.options.getString("name");

  let walkup = walkups.get(
    (walkup) => walkup.userId === interaction.member.user.id
  );
  if (walkup) {
    walkup.clip = clipName;
    await walkups.update(walkup);
  } else {
    await walkups.create({
      userId: interaction.member.user.id,
      clip: clipName,
    });
  }

  await interaction.reply({
    content: `Walkup set to \`${clipName}\`!`,
    ephemeral: true,
  });
};
