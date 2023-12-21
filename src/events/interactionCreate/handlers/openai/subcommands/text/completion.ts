import { logError } from "@/helpers/logger.js";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { CreateCompletionRequest } from "openai";
import { openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "completion",
  description: "Create an image with OpenAI's DALL-E model",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "input",
      description: "The input to send to OpenAI",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "model",
      description: "The model to use (defaults to text-curie-001)",
      choices: [
        { name: "text-curie-001", value: "text-curie-001" },
        { name: "text-davinci-003", value: "text-davinci-003" },
      ],
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "temperature",
      description:
        "The randomness of the response, from 0.00 to 1.00 (default is 0.75)",
      minValue: 0.0,
      maxValue: 1.0,
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();
    const input = interaction.options.getString("input");
    const temperature = interaction.options.getNumber("temperature") ?? 0.75;
    const maxTokens = interaction.options.getNumber("maxTokens") ?? 300;
    const model = interaction.options.getString("model") ?? "text-curie-001";

    let request: CreateCompletionRequest = {
      model: model,
      prompt: input,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: 1,
      n: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };

    const response = await openai.createCompletion(request);

    await interaction.editReply({
      content: `${input}\`${response.data.choices[0].text}\``,
    });
  } catch (error) {
    logError(error);
    await interaction.reply({
      content: "An error occurred when running this command",
      ephemeral: true,
    });
  }
};
