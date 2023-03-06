import axios from "axios";
import { ButtonInteraction } from "discord.js";
import { SendTweetV1Params, TweetV1 } from "twitter-api-v2";
import { messageActions } from "../../../../../database/database.js";
import {
  TwitterQuoteTweetMessageAction,
  TwitterReplyMessageAction,
  TwitterRetweetMessageAction,
  TwitterTweetMessageAction,
} from "../../../../../database/models.js";
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
  messageAction:
    | TwitterTweetMessageAction
    | TwitterReplyMessageAction
    | TwitterRetweetMessageAction
    | TwitterQuoteTweetMessageAction
) => {
  let userId = interaction.member.user.id;
  if (messageAction.data.approvals.includes(userId)) {
    await interaction.reply({
      content: "You already approved this action",
      ephemeral: true,
    });
    return;
  }

  messageAction.data.approvals.push(userId);
  if (messageAction.data.approvals.length === messageAction.data.required) {
    let payload: Partial<SendTweetV1Params> = {};
    if (messageAction.data.imageUrl) {
      await interaction.deferReply();
      let imageId = await getImageId(messageAction.data.imageUrl);
      payload.media_ids = [imageId];
    }

    let apiResponse: TweetV1;
    switch (messageAction.subcommand) {
      case "tweet":
        apiResponse = await tweet(messageAction.data.content ?? "", payload);
        break;
      case "reply":
        apiResponse = await reply(
          messageAction.data.content ?? "",
          messageAction.data.targetTweetId,
          payload
        );
        break;
      case "retweet":
        apiResponse = await retweet(messageAction.data.targetTweetId, payload);
        break;
      case "quotetweet":
        apiResponse = await quoteTweet(
          messageAction.data.content ?? "",
          messageAction.data.targetTweetId,
          payload
        );
        break;
    }

    if (payload.media_ids) {
      await interaction.editReply({
        content: "This has been approved",
        components: [],
      });
    } else {
      await interaction.update({
        content: "This has been approved",
        components: [],
      });
    }

    await interaction.followUp(
      `https://twitter.com/${apiResponse.user.screen_name}/status/${apiResponse.id_str}`
    );

    await messageActions.delete(messageAction.id);
  } else {
    interaction.update({
      content: `${messageAction.data.approvals.length} / ${messageAction.data.required} approvals to trigger`,
    });
    await messageActions.update(messageAction);
  }
};
