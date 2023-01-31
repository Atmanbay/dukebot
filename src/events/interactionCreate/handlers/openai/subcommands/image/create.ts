import axios from "axios";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { CreateImageRequestSizeEnum } from "openai";
import { logError } from "../../../../../../utils/logger";
import { openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "create",
  description: "Create an image with OpenAI's DALL-E model",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "What you want the image to be",
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

const getBufferFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "utf-8");
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const prompt = interaction.options.getString("prompt");
    const count = interaction.options.getNumber("count") ?? 1;
    const size = interaction.options.getString("size") ?? "_256x256";

    const response = await openai.createImage({
      prompt: prompt,
      n: count,
      size: CreateImageRequestSizeEnum[size],
    });

    let attachmentPromises = response.data.data.map((i) =>
      getBufferFromUrl(i.url)
    );
    await interaction.editReply({
      content: prompt,
      files: await Promise.all(attachmentPromises),
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
