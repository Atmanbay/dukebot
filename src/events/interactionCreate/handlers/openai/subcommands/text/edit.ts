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
  name: "edit",
  description: "Edit the given text with the given instructions",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "input",
      description: "The input to send to OpenAI",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "instruction",
      description: "OpenAI will apply this instruction to the given input",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "temperature",
      description: "The randomness of the response, from 0.00 to 1.00",
      minValue: 0.0,
      maxValue: 1.0,
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const image = interaction.options.getAttachment("image");
    const mask = interaction.options.getAttachment("mask");
    const prompt = interaction.options.getString("prompt");
    const count = interaction.options.getNumber("count") ?? 1;
    const size = interaction.options.getString("size") ?? "_256x256";

    const imageStream = await axios.get(image.url, {
      responseType: "stream",
    });
    const maskStream = await axios.get(mask.url, {
      responseType: "stream",
    });

    const response = await openai.createImageEdit(
      imageStream.data,
      maskStream.data,
      prompt,
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
