import axios from "axios";
import { ApplicationCommandNumericOptionData } from "discord.js";
import {
  Configuration,
  CreateCompletionRequest,
  CreateEditRequest,
  CreateImageRequestSizeEnum,
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
          description:
            "The randomness of the response, from 0.00 to 1.00 (default is 0.75)",
          minValue: 0.0,
          maxValue: 1.0,
          required: false,
        } as ApplicationCommandNumericOptionData,
        // {
        //   type: "NUMBER",
        //   name: "maxTokens",
        //   description:
        //     "The maximum tokens to use, where 1 token is roughly 4 characters (defaults to 300)",
        //   minValue: 1,
        //   maxValue: 1000,
        //   required: false,
        // } as ApplicationCommandNumericOptionData,
        // {
        //   type: "STRING",
        //   name: "model",
        //   description: "The model to use (default is Curie)",
        //   choices: [
        //     {
        //       name: "Curie",
        //       value: "text-curie-001",
        //     },
        //     {
        //       name: "Davinci",
        //       value: "text-davinci-002",
        //     },
        //   ],
        //   required: false,
        // },
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
    {
      type: "SUB_COMMAND_GROUP",
      name: "image",
      description: "Interact with OpenAI's DALL-E model",
      options: [
        {
          type: "SUB_COMMAND",
          name: "create",
          description: "Create an image with OpenAI's DALL-E model",
          options: [
            {
              type: "STRING",
              name: "prompt",
              description: "What you want the image to be",
              required: true,
            },
            {
              type: "NUMBER",
              name: "count",
              description:
                "How many images to generate (1-10 inclusive, defaults to 1)",
              minValue: 1,
              maxValue: 10,
              required: false,
            } as ApplicationCommandNumericOptionData,
            {
              type: "STRING",
              name: "size",
              description:
                "The size of the generated image (default is 1024x1024)",
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
        },
      ],
    },
  ],
  handle: {
    completion: async (interaction) => {
      try {
        await interaction.deferReply();
        const input = interaction.options.getString("input");
        const temperature =
          interaction.options.getNumber("temperature") ?? 0.75;
        const maxTokens = interaction.options.getNumber("maxTokens") ?? 300;
        const model =
          interaction.options.getString("model") ?? "text-curie-001";

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
    },
    instruction: async (interaction) => {
      try {
        await interaction.deferReply();
        const input = interaction.options.getString("input");
        const instruction = interaction.options.getString("instruction");
        const temperature =
          interaction.options.getNumber("temperature") ?? 0.75;

        let request: CreateEditRequest = {
          model: "text-davinci-edit-001",
          input: input,
          instruction: instruction,
          temperature: temperature,
          top_p: 1,
          n: 1,
        };

        const response = await openai.createEdit(request);

        await interaction.editReply({
          content: `\`\`\`INPUT: ${input}\nINSTR: ${instruction}\`\`\`\n\`\`\`${response.data.choices[0].text}\`\`\``,
        });
      } catch (error) {
        logError(error);
        await interaction.editReply({
          content: "An error occurred when running this command",
        });
      }
    },
    create: async (interaction) => {
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
    },
    // edit: async (interaction) => {},
    // variation: async (interaction) => {},
  },
};

export default OpenAIInteractionCreateHandler;
