import {
  Configuration,
  CreateCompletionRequest,
  CreateEditRequest,
  OpenAIApi,
} from "openai";
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
      type: "SUB_COMMAND",
      name: "completion",
      description: "Complete the given text",
      options: [
        {
          type: "STRING",
          name: "input",
          description: "The input to send to OpenAI",
          required: true,
        },
        {
          type: "NUMBER",
          name: "temperature",
          description: "The randomness of the response, from 0.00 to 1.00",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "edit",
      description: "Edit the given text with the given instructions",
      options: [
        {
          type: "STRING",
          name: "input",
          description: "The input to send to OpenAI",
          required: true,
        },
        {
          type: "STRING",
          name: "instruction",
          description: "OpenAI will apply this instruction to the given input",
          required: true,
        },
        {
          type: "NUMBER",
          name: "temperature",
          description: "The randomness of the response, from 0.00 to 1.00",
          required: false,
        },
      ],
    },
  ],
  handle: {
    completion: async (interaction) => {
      try {
        await interaction.deferReply();
        const input = interaction.options.getString("input");
        const temperature = interaction.options.getNumber("temperature");

        let request: CreateCompletionRequest = {
          model: "text-curie-001",
          prompt: input,
          temperature: 0.75,
          max_tokens: 255,
          top_p: 1,
          n: 1,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        };

        if (temperature) {
          request.temperature = temperature;
        }

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
    },
    edit: async (interaction) => {
      try {
        await interaction.deferReply();
        const input = interaction.options.getString("input");
        const instruction = interaction.options.getString("instruction");
        const temperature = interaction.options.getNumber("temperature");

        let request: CreateEditRequest = {
          model: "text-davinci-edit-001",
          input: input,
          instruction: instruction,
          temperature: 0.75,
          top_p: 1,
          n: 1,
        };

        if (temperature) {
          request.temperature = temperature;
        }

        const response = await openai.createEdit(request);

        await interaction.editReply({
          content: `\`\`\`INPUT: ${input}\nINSTR: ${instruction}\`\`\`\n\`\`\`${response.data.choices[0].text}\`\`\``,
        });
      } catch (error) {
        logError(error);
        await interaction.reply({
          content: "An error occurred when running this command",
          ephemeral: true,
        });
      }
    },
  },
};

export default OpenAIInteractionCreateHandler;
