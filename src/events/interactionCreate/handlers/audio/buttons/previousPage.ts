import { messageActions } from "@/helpers/database/index.js";
import { AudioListMessageAction } from "@/helpers/database/models.js";
import { ButtonInteraction } from "discord.js";
import { getPageOfClips } from "../index.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: AudioListMessageAction
) => {
  if (messageAction.data.currentPage === 0) {
    await interaction.deferUpdate();
    return;
  }

  messageAction.data.currentPage--;
  await interaction.update({
    content: getPageOfClips(messageAction.data.currentPage).join("\n"),
  });

  await messageActions.update(messageAction);
};
