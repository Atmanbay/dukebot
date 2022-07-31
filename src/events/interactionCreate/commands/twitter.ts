import { Command, ButtonExecutor } from "../../../types/discord/command";
import { buildMessageActionRow } from "../../../services/button";
import {
  buildEmbed,
  buildTweetEmbed,
  tweet,
  reply,
  retweet,
  quoteTweet,
} from "../../../services/twitter";
import { messageActions } from "../../../services/messageAction";
import { ButtonInteraction } from "discord.js";
import Twit from "twit";
import { generateId } from "../../../utils";
import {
  TwitterQuoteTweetMessageAction,
  TwitterReplyMessageAction,
  TwitterRetweetMessageAction,
  TwitterTweetMessageAction,
} from "../../../types/database";

const postUrl = async (
  interaction: ButtonInteraction,
  apiResponse: Twit.PromiseResponse
) => {
  const data = apiResponse.data as {
    id_str: string;
    user: {
      screen_name: string;
    };
  };
  interaction.reply(
    `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`
  );
};

const Twitter: Command = {
  name: "twitter",
  description: "Returns a greeting",
  type: "CHAT_INPUT",
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

      const messageAction = (await messageActions.create({
        command: "twitter",
        subcommand: "tweet",
        interactionId: interaction.id,
        approvals: [],
        required: 4,
        content,
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
      })) as TwitterTweetMessageAction;

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Tweet", content });

      await interaction.reply({
        content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed],
      });
    },
    reply: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = (await messageActions.create({
        command: "twitter",
        subcommand: "reply",
        interactionId: interaction.id,
        approvals: [],
        required: 4,
        content,
        targetTweetId: tweetId,
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
      })) as TwitterReplyMessageAction;

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({
        title: "Reply",
        content,
      });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });
    },
    retweet: async (interaction) => {
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = (await messageActions.create({
        command: "twitter",
        subcommand: "retweet",
        interactionId: interaction.id,
        approvals: [],
        required: 4,
        targetTweetId: tweetId,
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
      })) as TwitterRetweetMessageAction;

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Retweet", content: "" });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });
    },
    quotetweet: async (interaction) => {
      const content = interaction.options.getString("content");
      const tweet = interaction.options.getString("tweet");
      const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];

      const messageAction = (await messageActions.create({
        command: "twitter",
        subcommand: "quotetweet",
        interactionId: interaction.id,
        approvals: [],
        required: 4,
        content,
        targetTweetUrl: tweet,
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
      })) as TwitterQuoteTweetMessageAction;

      const messageActionRow = buildMessageActionRow(messageAction.buttons);
      const embed = buildEmbed({ title: "Quote Tweet", content });
      const tweetEmbed = await buildTweetEmbed(tweetId);
      await interaction.reply({
        content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
        components: [messageActionRow],
        embeds: [embed, tweetEmbed],
      });
    },
  },
  handleButton: {
    approve: async ({ interaction, messageAction }) => {
      if (messageAction.command !== "twitter") {
        return;
      }

      let userId = interaction.member.user.id;
      if (messageAction.approvals.includes(userId)) {
        interaction.reply({
          content: "You already approved this action",
          ephemeral: true,
        });
        return;
      }

      messageAction.approvals.push(userId);
      if (messageAction.approvals.length === messageAction.required) {
        let apiResponse: Twit.PromiseResponse;
        switch (messageAction.subcommand) {
          case "tweet":
            apiResponse = await tweet(messageAction.content);
            break;
          case "reply":
            apiResponse = await reply(
              messageAction.content,
              messageAction.targetTweetId
            );
            break;
          case "retweet":
            apiResponse = await retweet(messageAction.targetTweetId);
            break;
          case "quotetweet":
            apiResponse = await quoteTweet(
              messageAction.content,
              messageAction.targetTweetUrl
            );
            break;
        }

        interaction.update({
          content: "This has been approved",
          components: [],
        });

        const responseData = apiResponse.data as {
          id_str: string;
          user: {
            screen_name: string;
          };
        };
        interaction.followUp(
          `https://twitter.com/${responseData.user.screen_name}/status/${responseData.id_str}`
        );

        await messageActions.delete(messageAction.id);
      } else {
        interaction.update({
          content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
        });
        await messageActions.update(messageAction);
      }
    },
    disapprove: async ({ interaction, messageAction }) => {
      if (messageAction.command !== "twitter") {
        return;
      }

      messageAction.approvals = messageAction.approvals.filter(
        (approver) => approver !== interaction.member.user.id
      );
      interaction.update({
        content: `${messageAction.approvals.length} / ${messageAction.required} approvals to trigger`,
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

export default Twitter;
