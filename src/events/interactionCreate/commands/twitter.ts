import { MessageEmbed } from "discord.js";
import moment from "moment-timezone";
import Twitter, { Params, PromiseResponse } from "twit";
import { messageActions } from "../../../database/database.js";
import config from "../../../utils/config.js";
import {
  buildEmbed,
  buildMessageActionRow,
  generateId,
} from "../../../utils/general.js";
import { Command } from "../index.js";

const client = new Twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessTokenKey,
  access_token_secret: config.twitter.accessTokenSecret,
});

const tweet = async (status: string) => {
  let options = {
    status: status,
  };

  return client.post("statuses/update", options);
};

const reply = async (status: string, targetTweetId: string) => {
  let options = {
    status: status,
    in_reply_to_status_id: targetTweetId,
  };

  return client.post("statuses/update", options);
};

const retweet = async (tweetId: string) => {
  return client.post(`statuses/retweet/${tweetId}`, {});
};

const quoteTweet = async (status: string, targetTweetUrl: string) => {
  let options = {
    status: `${status} ${targetTweetUrl}`,
  };

  return client.post("statuses/update", options);
};

export const buildTweetEmbed = async (tweetId: string) => {
  const params: Params = {
    tweet_mode: "extended",
  };
  const tweet = await client.get(`statuses/show/${tweetId}`, params);
  if (tweet.resp.statusCode !== 200) {
    return null;
  }

  const data = tweet.data as {
    user: {
      name: string;
      screen_name: string;
      profile_image_url: string;
    };
    full_text: string;
    favorite_count: number;
    retweet_count: number;
    created_at: string;
    entities: {
      media: {
        media_url: string;
      }[];
    };
  };

  let embed = {
    author: {
      name: `${data.user.name} (@${data.user.screen_name})`,
      iconURL: data.user.profile_image_url,
      url: `https://twitter.com/${data.user.screen_name}/status/${tweetId}`,
    },
    description: data.full_text,
    fields: [
      {
        name: "Likes",
        value: data.favorite_count.toString(),
        inline: true,
      },
      {
        name: "Retweets",
        value: data.retweet_count.toString(),
        inline: true,
      },
    ],
    footer: {
      text: moment(data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format(
        "MM/DD/YYYY HH:mma"
      ),
    },
  } as MessageEmbed;

  if (data.entities.media && data.entities.media.length > 0) {
    embed.image = { url: data.entities.media[0].media_url };
  }

  return embed;
};

const TwitterCommand: Command = {
  name: "twitter",
  description: "Returns a greeting",
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
          required: true,
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
          name: "content",
          description: "The content of the reply",
          required: true,
        },
        {
          type: "STRING",
          name: "tweet",
          description: "The URL of the tweet to reply to",
          required: true,
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
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "quotetweet",
      description: "Tweet something",
      options: [
        {
          type: "STRING",
          name: "content",
          description: "The content of the quote tweet",
          required: true,
        },
        {
          type: "STRING",
          name: "tweet",
          description: "The URL of the tweet to quote tweet",
          required: true,
        },
      ],
    },
  ],
  run: {
    tweet: async (interaction) => {
      const content = interaction.options.getString("content");

      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "tweet",
          approvals: [],
          required: config.approvals.twitter,
          content,
        },
        buttons: [
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
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Tweet", content });

      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed],
      });
    },
    reply: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "reply",
          approvals: [],
          required: config.approvals.twitter,
          content,
          targetTweetId: tweetId,
        },
        buttons: [
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
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({
        title: "Reply",
        content,
      });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });
    },
    retweet: async (interaction) => {
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "retweet",
          approvals: [],
          required: config.approvals.twitter,
          targetTweetId: tweetId,
        },
        buttons: [
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
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Retweet", content: "" });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });
    },
    quotetweet: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "twitter",
          subcommand: "quotetweet",
          approvals: [],
          required: config.approvals.twitter,
          content,
          targetTweetUrl: tweet,
        },
        buttons: [
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
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Quote Tweet", content });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `0 / ${config.approvals.twitter} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
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
        interaction.reply({
          content: "You already approved this action",
          ephemeral: true,
        });
        return;
      }

      messageAction.data.approvals.push(userId);
      if (messageAction.data.approvals.length === messageAction.data.required) {
        let apiResponse: PromiseResponse;
        switch (messageAction.data.subcommand) {
          case "tweet":
            apiResponse = await tweet(messageAction.data.content);
            break;
          case "reply":
            apiResponse = await reply(
              messageAction.data.content,
              messageAction.data.targetTweetId
            );
            break;
          case "retweet":
            apiResponse = await retweet(messageAction.data.targetTweetId);
            break;
          case "quotetweet":
            apiResponse = await quoteTweet(
              messageAction.data.content,
              messageAction.data.targetTweetUrl
            );
            break;
        }

        await interaction.update({
          content: "This has been approved",
          components: [],
        });

        const responseData = apiResponse.data as {
          id_str: string;
          user: {
            screen_name: string;
          };
        };
        await interaction.followUp(
          `https://twitter.com/${responseData.user.screen_name}/status/${responseData.id_str}`
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
      interaction.update({
        content: `${messageAction.data.approvals.length} / ${messageAction.data.required} approvals to trigger`,
      });
      await messageActions.update(messageAction);
    },
    cancel: async ({ interaction, messageAction }) => {
      interaction.update({
        content: "This has been canceled",
        components: [],
      });
      await messageActions.delete(messageAction.id);
    },
  },
};

export default TwitterCommand;
