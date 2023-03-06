import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { messageActions } from "../../../../../../database/database.js";
import { Button } from "../../../../../../database/models.js";
import config from "../../../../../../utils/config.js";
import {
  buildEmbed,
  buildMessageActionRow,
  generateId,
} from "../../../../../../utils/general.js";
import { buildTweetEmbed } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "retweet",
  description: "Retweet something",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "tweet",
      description: "The URL of the tweet to reply to",
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const tweet = interaction.options.getString("tweet");
  const tweetId = tweet.match(/status\/(.*?)(\?|$)/)[1];
  const image = interaction.options.getString("image");

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
  const embed = buildEmbed({ title: "Retweet", image });
  const tweetEmbed = await buildTweetEmbed(tweetId);
  await interaction.reply({
    content: `0 / ${config.approvals.twitter} approvals to trigger`,
    components: [messageActionRow],
    embeds: [embed, tweetEmbed],
  });

  await messageActions.create({
    interactionId: interaction.id,
    command: "twitter",
    subcommand: "retweet",
    data: {
      callerUserId: interaction.member.user.id,
      approvals: [],
      required: config.approvals.twitter,
      targetTweetId: tweetId,
      imageUrl: image,
    },
    buttons,
  });
};
