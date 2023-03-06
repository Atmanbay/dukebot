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
  messageAction.data.approvals = messageAction.data.approvals.filter(
    (approver) => approver !== interaction.member.user.id
  );
  await interaction.update({
    content: `${messageAction.data.approvals.length} / ${messageAction.data.required} approvals to trigger`,
  });
  await messageActions.update(messageAction);
};
