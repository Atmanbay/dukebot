import { ButtonInteraction } from "discord.js";
import { messageActions } from "../../../../../database/database";
import { AudioListMessageActionData } from "../../../../../database/messageActionData";
import { MessageAction } from "../../../../../database/models";
import { getPageOfClips, getPages } from "../index.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: MessageAction<AudioListMessageActionData>
) => {
  messageAction.data.currentPage = getPages().length - 1;

  await interaction.update({
    content: getPageOfClips(messageAction.data.currentPage).join("\n"),
  });

  await messageActions.update(messageAction);
};
