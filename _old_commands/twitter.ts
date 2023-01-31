// import request from "request-promise-native";
// import Twitter, { Params, PromiseResponse } from "twit";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import moment from "moment-timezone";
import { SendTweetV1Params, TweetV1, TwitterApi } from "twitter-api-v2";
import { messageActions } from "../../../database/database.js";
import { Button } from "../../../database/models.js";
import config from "../../../utils/config.js";
import {
  buildEmbed,
  buildMessageActionRow,
  generateId,
} from "../../../utils/general.js";
import { InteractionCreateHandler } from "../index.js";

const client = new TwitterApi({
  appKey: config.twitter.consumerKey,
  appSecret: config.twitter.consumerSecret,
  accessToken: config.twitter.accessTokenKey,
  accessSecret: config.twitter.accessTokenSecret,
}).v1;

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

export const buildTweetEmbed = async (tweetId: string) => {
  const tweet = await client.singleTweet(tweetId, { tweet_mode: "extended" });

  let embed = {
    author: {
      name: `${tweet.user.name} (@${tweet.user.screen_name})`,
      iconURL: tweet.user.profile_image_url_https,
      url: `https://twitter.com/${tweet.user.screen_name}/status/${tweetId}`,
    },
    description: tweet.full_text,
    fields: [
      {
        name: "Likes",
        value: tweet.favorite_count.toString(),
        inline: true,
      },
      {
        name: "Retweets",
        value: tweet.retweet_count.toString(),
        inline: true,
      },
    ],
    footer: {
      text: moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format(
        "MM/DD/YYYY HH:mma"
      ),
    },
  } as MessageEmbed;

  if (tweet.entities.media && tweet.entities.media.length > 0) {
    embed.image = { url: tweet.entities.media[0].media_url };
  }

  return embed;
};

const TwitterInteractionCreateHandler: InteractionCreateHandler = {
  name: "twitter",
  description: "Tweet, reply, retweet, or quote tweet",
  options: [
    {
      type: "SUB_COMMAND",
      name: "tweet",
      description: "Tweet something",
      options: [
        {
          type: "STRING",
          name: "content",
          description: "The content of the tweet",
          required: false,
        },
        {
          type: "STRING",
          name: "image",
          description: "The URL of the image you want to include in the tweet",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "reply",
      description: "Reply to a tweet",
      options: [
        {
          type: "STRING",
          name: "tweet",
          description: "The URL of the tweet to reply to",
          required: true,
        },
        {
          type: "STRING",
          name: "content",
          description: "The content of the reply",
          required: false,
        },
        {
          type: "STRING",
          name: "image",
          description: "The URL of the image you want to include in the tweet",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "retweet",
      description: "Retweet a tweet",
      options: [
        {
          type: "STRING",
          name: "tweet",
          description: "The URL of the tweet to reply to",
          required: true,
        },
        {
          type: "STRING",
          name: "image",
          description: "The URL of the image you want to include in the tweet",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "quotetweet",
      description: "Tweet something",
      options: [
        {
          type: "STRING",
          name: "tweet",
          description: "The URL of the tweet to quote tweet",
          required: true,
        },
        {
          type: "STRING",
          name: "content",
          description: "The content of the quote tweet",
          required: false,
        },
        {
          type: "STRING",
          name: "image",
          description: "The URL of the image you want to include in the tweet",
          required: false,
        },
      ],
    },
  ],
  handle: {
    tweet: async (interaction) => {
      const content = interaction.options.getString("content");
      const image = interaction.options.getString("image");

      if (!content && !image) {
        await interaction.reply({
          content: "Must supply either content or an image",
          ephemeral: true,
        });

        return;
      }

      const buttons: Button[] = [
        {
          type: "approve",
          buttonId: generateId(),
          style: "PRIMARY",
        },
        {
          type: "disapprove",
          buttonId: generateId(),
          style: "SECONDARY",
        },
        {
          type: "cancel",
          buttonId: generateId(),
          style: "DANGER",
        },
      ];

      const messageActionRow = buildMessageActionRow(buttons);
      const embed = buildEmbed({ title: "Tweet", content, image });

      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed],
      });

      await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "tweet",
          callerUserId: interaction.member.user.id,
          approvals: [],
          required: config.approvals.twitter,
          content,
          imageUrl: image,
        },
        buttons,
      });
    },
    reply: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];
      const image = interaction.options.getString("image");

      if (!content && !image) {
        await interaction.reply({
          content: "Must supply either content or an image",
          ephemeral: true,
        });

        return;
      }

      const buttons: Button[] = [
        {
          type: "approve",
          buttonId: generateId(),
          style: "PRIMARY",
        },
        {
          type: "disapprove",
          buttonId: generateId(),
          style: "SECONDARY",
        },
        {
          type: "cancel",
          buttonId: generateId(),
          style: "DANGER",
        },
      ];

      const messageActionRow = buildMessageActionRow(buttons);
      const embed = buildEmbed({
        title: "Reply",
        content,
        image,
      });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });

      await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "reply",
          callerUserId: interaction.member.user.id,
          approvals: [],
          required: config.approvals.twitter,
          content,
          targetTweetId: tweetId,
          imageUrl: image,
        },
        buttons,
      });
    },
    retweet: async (interaction) => {
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];
      const image = interaction.options.getString("image");

      const buttons: Button[] = [
        {
          type: "approve",
          buttonId: generateId(),
          style: "PRIMARY",
        },
        {
          type: "disapprove",
          buttonId: generateId(),
          style: "SECONDARY",
        },
        {
          type: "cancel",
          buttonId: generateId(),
          style: "DANGER",
        },
      ];

      const messageActionRow = buildMessageActionRow(buttons);
      const embed = buildEmbed({ title: "Retweet", image });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });

      await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "retweet",
          callerUserId: interaction.member.user.id,
          approvals: [],
          required: config.approvals.twitter,
          targetTweetId: tweetId,
          imageUrl: image,
        },
        buttons,
      });
    },
    quotetweet: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];
      const image = interaction.options.getString("image");

      if (!content && !image) {
        await interaction.reply({
          content: "Must supply either content or an image",
          ephemeral: true,
        });

        return;
      }

      const buttons: Button[] = [
        {
          type: "approve",
          buttonId: generateId(),
          style: "PRIMARY",
        },
        {
          type: "disapprove",
          buttonId: generateId(),
          style: "SECONDARY",
        },
        {
          type: "cancel",
          buttonId: generateId(),
          style: "DANGER",
        },
      ];

      const messageActionRow = buildMessageActionRow(buttons);
      const embed = buildEmbed({ title: "Quote Tweet", content, image });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });

      await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "quotetweet",
          callerUserId: interaction.member.user.id,
          approvals: [],
          required: config.approvals.twitter,
          content,
          targetTweetId: tweetId,
          imageUrl: image,
        },
        buttons,
      });
    },
  },
  handleButton: {
    approve: async ({ interaction, messageAction }) => {
      if (messageAction.data.command !== "twitter") {
        return;
      }

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
        switch (messageAction.data.subcommand) {
          case "tweet":
            apiResponse = await tweet(
              messageAction.data.content ?? "",
              payload
            );
            break;
          case "reply":
            apiResponse = await reply(
              messageAction.data.content ?? "",
              messageAction.data.targetTweetId,
              payload
            );
            break;
          case "retweet":
            apiResponse = await retweet(
              messageAction.data.targetTweetId,
              payload
            );
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
    },
    disapprove: async ({ interaction, messageAction }) => {
      if (messageAction.data.command !== "twitter") {
        return;
      }

      messageAction.data.approvals = messageAction.data.approvals.filter(
        (approver) => approver !== interaction.member.user.id
      );
      await interaction.update({
        content: `${messageAction.data.approvals.length} / ${messageAction.data.required} approvals to trigger`,
      });
      await messageActions.update(messageAction);
    },
    cancel: async ({ interaction, messageAction }) => {
      if (messageAction.data.command !== "twitter") {
        return;
      }

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
    },
  },
};

export default TwitterInteractionCreateHandler;
