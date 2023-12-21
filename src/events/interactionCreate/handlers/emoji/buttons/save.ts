import { EmojiKitchenMessageAction } from "@/helpers/database/models.js";
import { ButtonInteraction } from "discord.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: EmojiKitchenMessageAction
) => {
  await interaction.guild.emojis.create({
    attachment: messageAction.data.path,
    name: messageAction.data.emojiName,
  });

  await interaction.reply({
    content: `Emoji saved as \`:${messageAction.data.emojiName}:\``,
    ephemeral: true,
  });
};
