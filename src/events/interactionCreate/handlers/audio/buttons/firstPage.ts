import { ButtonInteraction } from "discord.js";
import { messageActions } from "../../../../../database/database.js";
import { AudioListMessageAction } from "../../../../../database/models.js";
import { getPageOfClips } from "../index.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: AudioListMessageAction
) => {
  messageAction.data.currentPage = 0;

  await interaction.update({
    content: getPageOfClips(messageAction.data.currentPage).join("\n"),
  });

  await messageActions.update(messageAction);
};
