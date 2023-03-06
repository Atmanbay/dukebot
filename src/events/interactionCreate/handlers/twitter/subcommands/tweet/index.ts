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

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "tweet",
  description: "Tweet something",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "content",
      description: "The content of the tweet",
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
  const embed = buildEmbed({ title: "Tweet", content, image });

  await interaction.reply({
    content: `0 / ${config.approvals.twitter} approvals to trigger`,
    components: [messageActionRow],
    embeds: [embed],
  });

  await messageActions.create({
    interactionId: interaction.id,
    command: "twitter",
    subcommand: "tweet",
    data: {
      callerUserId: interaction.member.user.id,
      approvals: [],
      required: config.approvals.twitter,
      content,
      imageUrl: image,
    },
    buttons,
  });
};
