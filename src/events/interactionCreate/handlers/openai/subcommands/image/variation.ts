import { logError } from "@/helpers/logger.js";
import axios from "axios";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { CreateImageRequestSizeEnum } from "openai";
import { openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "variation",
  description:
    "Generate a random variation of a given image with OpenAI's DALL-E model",
  options: [
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "image",
      description: "The image to edit",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "count",
      description:
        "How many images to generate (1-10 inclusive, defaults to 1)",
      minValue: 1,
      maxValue: 10,
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "size",
      description: "The size of the generated image (default is 1024x1024)",
      choices: [
        {
          name: "256x256",
          value: "_256x256",
        },
        {
          name: "512x512",
          value: "_512x512",
        },
        {
          name: "1024x1024",
          value: "_1024x1024",
        },
      ],
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const image = interaction.options.getAttachment("image");
    const count = interaction.options.getNumber("count") ?? 1;
    const size = interaction.options.getString("size") ?? "_256x256";

    const imageStream = await axios.get(image.url, {
      responseType: "stream",
    });

    const response = await openai.createImageVariation(
      imageStream.data,
      count,
      CreateImageRequestSizeEnum[size]
    );

    let attachmentPromises = response.data.data.map(async (i) => {
      const response = await axios.get(i.url, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "utf-8");
      return buffer;
    });

    await interaction.editReply({
      files: await Promise.all(attachmentPromises),
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
