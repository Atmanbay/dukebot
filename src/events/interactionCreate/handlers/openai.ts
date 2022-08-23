import { Configuration, OpenAIApi } from "openai";
import config from "../../../utils/config.js";
import { logError } from "../../../utils/logger.js";
import { InteractionCreateHandler } from "../index.js";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: config.openAI.apiKey,
  })
);

const OpenAIInteractionCreateHandler: InteractionCreateHandler = {
  name: "openai",
  description: "Feeds a prompt to OpenAI's Completion engine",
  options: [
    {
      type: "STRING",
      name: "prompt",
      description: "The prompt to send to OpenAI",
      required: true,
    },
  ],
  handle: async (interaction) => {
    try {
      await interaction.deferReply();
      const prompt = interaction.options.getString("prompt");

      const response = await openai.createCompletion({
        model: "text-curie-001",
        prompt: prompt,
        temperature: 0,
        max_tokens: 255,
        top_p: 1,
        n: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });

      await interaction.editReply({
        content: `${prompt}${response.data.choices[0].text}`,
      });
    } catch (error) {
      logError(error);
      await interaction.reply({
        content: "An error occurred when running this command",
        ephemeral: true,
      });
    }
  },
};

export default OpenAIInteractionCreateHandler;
