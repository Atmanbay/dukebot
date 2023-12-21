import { messageActions } from "@/@/helpers/database/index.js";
import { Button } from "@/@/helpers/database/models.js";
import config from "@/helpers/config.js";
import { buildMessageActionRow, generateId } from "@/helpers/general.js";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import download from "download";
import sanitize from "sanitize-filename";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "upload",
  description: "Upload an audio clip",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "Name to give clip",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "clip",
      description: "The .mp3 file to upload",
      required: true,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const name = interaction.options.getString("name");
  const clip = interaction.options.getAttachment("clip");

  let url = clip.url;
  let sanitizedName = sanitize(name);

  let options = {
    filename: `${sanitizedName}.mp3`,
  };

  await download(url, config.paths.audio, options);

  const buttons: Button[] = [
    {
      type: "set",
      label: "Set as Walkup",
      buttonId: generateId(),
      style: ButtonStyle.Primary,
    },
  ];

  const messageActionRow = buildMessageActionRow(buttons);

  await interaction.reply({
    content: `Successfully uploaded ${sanitizedName}`,
    components: [messageActionRow],
    ephemeral: true,
  });

  await messageActions.create({
    interactionId: interaction.id,
    command: "audio",
    subcommand: "upload",
    data: {
      clipName: sanitizedName,
    },
    buttons,
  });
};
