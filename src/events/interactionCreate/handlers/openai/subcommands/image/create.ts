import axios from "axios";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { ImageGenerateParams } from "openai/resources/images.js";
import { logError } from "../../../../../../utils/logger.js";
import { moderate, openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "create",
  description: "Create an image with OpenAI's DALL-E model",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "A text description of the desired image",
      maxLength: 1000,
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "size",
      description: "The size of the generated image (default is 1024x1024)",
      choices: [
        {
          name: "256x256",
          value: "256x256",
        },
        {
          name: "512x512",
          value: "512x512",
        },
        {
          name: "1024x1024",
          value: "1024x1024",
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

    let flaggedCategories = await moderate(prompt);
    if (flaggedCategories.length > 0) {
      await interaction.editReply({
        content: `\`\`\`Blocked for the following reasons:\n\n${flaggedCategories.join(
          "\n"
        )}\`\`\``,
      });
      return;
    }

    const size = interaction.options.getString("size") ?? "1024x1024";

    let params: ImageGenerateParams = {
      model: "dall-e-2",
      prompt: prompt,
    };

    switch (size) {
      case "1024x1024":
        params.size = "1024x1024";
        break;
      case "1792x1024":
        params.size = "1792x1024";
        break;
      case "1024x1792":
        params.size = "1024x1792";
        break;
    }

    const response = await openai.images.generate(params);
    const buffer = await getBufferFromUrl(response.data[0].url);

    await interaction.editReply({
      content: prompt,
      files: [buffer],
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
