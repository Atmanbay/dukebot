import { ButtonInteraction } from "discord.js";
import { messageActions } from "../../../../../database/database.js";
import { AudioListMessageAction } from "../../../../../database/models.js";
import { getPageOfClips, getPages } from "../index.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: AudioListMessageAction
) => {
  if (messageAction.data.currentPage === getPages().length - 1) {
    await interaction.deferUpdate();
    return;
  }

  messageAction.data.currentPage++;

  await interaction.update({
    content: getPageOfClips(messageAction.data.currentPage).join("\n"),
  });

  await messageActions.update(messageAction);
};
