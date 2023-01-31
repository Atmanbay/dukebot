import { ButtonInteraction } from "discord.js";
import { messageActions } from "../../../../../database/database";
import { AudioListMessageActionData } from "../../../../../database/messageActionData";
import { MessageAction } from "../../../../../database/models";
import { getPageOfClips } from "../index.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: MessageAction<AudioListMessageActionData>
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
