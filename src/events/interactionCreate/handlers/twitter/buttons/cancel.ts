import axios from "axios";
import { ButtonInteraction } from "discord.js";
import { SendTweetV1Params } from "twitter-api-v2";
import { messageActions } from "../../../../../database/database.js";
import {
  TwitterQuoteTweetMessageActionData,
  TwitterReplyMessageActionData,
  TwitterRetweetMessageActionData,
  TwitterTweetMessageActionData,
} from "../../../../../database/messageActionData";
import { MessageAction } from "../../../../../database/models";
import { client } from "../index.js";

const getImageId = async (imageUrl: string) => {
  const response = await axios({
    method: "get",
    url: imageUrl,
    responseType: "arraybuffer",
  });
  const contentType = response.headers["content-type"];
  const mediaId = await client.uploadMedia(Buffer.from(response.data), {
    mimeType: contentType,
  });

  return mediaId;
};

const tweet = async (status: string, payload?: Partial<SendTweetV1Params>) => {
  return client.tweet(status, payload);
};

const reply = async (
  status: string,
  targetTweetId: string,
  payload?: Partial<SendTweetV1Params>
) => {
  return client.reply(status, targetTweetId, payload);
};

const retweet = async (
  tweetId: string,
  payload?: Partial<SendTweetV1Params>
) => {
  return client.post(`statuses/retweet/${tweetId}.json`, payload);
};

const quoteTweet = async (
  status: string,
  targetTweetId: string,
  payload?: Partial<SendTweetV1Params>
) => {
  return client.quote(status, targetTweetId, payload);
};

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: MessageAction<
    | TwitterTweetMessageActionData
    | TwitterReplyMessageActionData
    | TwitterRetweetMessageActionData
    | TwitterQuoteTweetMessageActionData
  >
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
