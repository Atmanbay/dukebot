import { ButtonInteraction } from "discord.js";
import { messageActions } from "../../../../../database/database.js";
import {
  TwitterQuoteTweetMessageAction,
  TwitterReplyMessageAction,
  TwitterRetweetMessageAction,
  TwitterTweetMessageAction,
} from "../../../../../database/models.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction:
    | TwitterTweetMessageAction
    | TwitterReplyMessageAction
    | TwitterRetweetMessageAction
    | TwitterQuoteTweetMessageAction
) => {
  if (interaction.member.user.id !== messageAction.data.callerUserId) {
    await interaction.reply({
      content: "You must be the original caller to cancel",
      ephemeral: true,
    });
    return;
  }

  await interaction.update({
    content: "This has been canceled",
    components: [],
  });
  await messageActions.delete(messageAction.id);
};
