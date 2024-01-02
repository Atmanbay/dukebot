import axios from "axios";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { ImageGenerateParams } from "openai/resources/images.js";
import { logError } from "../../../../../../utils/logger.js";
import { addBalance, getBalance, openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "dall-e-3",
  description: "Create an image with OpenAI's DALL-E 3 model",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "A text description of the desired image",
      maxLength: 4000,
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "quality",
      description: "The quality of the result (default is standard)",
      choices: [
        {
          name: "standard",
          value: "standard",
        },
        {
          name: "hd",
          value: "hd",
        },
      ],
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "style",
      description:
        "The style of the image. Default is vivid, which leans hyper-real and dramatic.",
      choices: [
        {
          name: "vivid",
          value: "vivid",
        },
        {
          name: "natural",
          value: "natural",
        },
      ],
      required: false,
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
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "revise",
      description:
        "Allow OpenAI to rewrite your prompt for safety reasons and to add more detail (default is false)",
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

    let balance = getBalance(interaction.user.id);
    if (balance <= 0) {
      await interaction.editReply({
        content: "You have no balance!",
      });
      return;
    }

    const prompt = interaction.options.getString("prompt");

    const size = interaction.options.getString("size") ?? "1024x1024";
    const quality = interaction.options.getString("quality") ?? "standard";
    const style = interaction.options.getString("style") ?? "vivid";
    const revise = interaction.options.getBoolean("revise") ?? false;

    let completePrompt = "";
    if (!revise) {
      completePrompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: ${prompt}`;
    } else {
      completePrompt = prompt;
    }

    let params: ImageGenerateParams = {
      model: "dall-e-3",
      prompt: completePrompt,
      quality: quality == "standard" ? "standard" : "hd",
      style: style == "vivid" ? "vivid" : "natural",
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
    let finalPrompt = response.data[0].revised_prompt;
    if (!finalPrompt) {
      finalPrompt = prompt;
    }

    const buffer = await getBufferFromUrl(response.data[0].url);

    await addBalance(interaction.user.id, -6);

    await interaction.editReply({
      content: finalPrompt,
      files: [buffer],
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
