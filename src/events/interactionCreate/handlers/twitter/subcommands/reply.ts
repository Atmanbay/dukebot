import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { messageActions } from "../../../../../database/database";
import { Button } from "../../../../../database/models";
import config from "../../../../../utils/config";
import {
  buildEmbed,
  buildMessageActionRow,
  generateId,
} from "../../../../../utils/general";
import { buildTweetEmbed } from "../../twitter";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "reply",
  description: "Reply to a tweet",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "tweet",
      description: "The URL of the tweet to reply to",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "content",
      description: "The content of the reply",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "image",
      description: "The URL of the image you want to include in the tweet",
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
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
      style: ButtonStyle.Primary,
    },
    {
      type: "disapprove",
      buttonId: generateId(),
      style: ButtonStyle.Secondary,
    },
    {
      type: "cancel",
      buttonId: generateId(),
      style: ButtonStyle.Danger,
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
};
