import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from "openai/resources/index.js";
import { logError } from "../../../../../../utils/logger.js";
import { moderate, openai } from "../../index.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "completion",
  description: "Interact with OpenAI's GPT model",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "The prompt to send to the model",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "instruction",
      description:
        "The instructions given to the model before it responds to your prompt",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "frequency_penalty",
      description:
        "(-2.0 to 2.0). Positive values decrease the likelihood of repeating the same line verbatim",
      minValue: -2.0,
      maxValue: 2.0,
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "presence_penalty",
      description:
        "(-2.0 to 2.0). Positive values increase the likelihood to talk about new topics",
      minValue: -2.0,
      maxValue: 2.0,
      required: false,
    },
  ],
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

    const instruction = interaction.options.getString("instruction");
    const frequency_penalty =
      interaction.options.getNumber("frequency_penalty");
    const presence_penalty = interaction.options.getNumber("presence_penalty");

    let messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    if (instruction) {
      messages.unshift({
        role: "system",
        content: instruction,
      });
    }

    let params: ChatCompletionCreateParamsNonStreaming = {
      model: "gpt-3.5-turbo",
      messages: messages,
    };

    if (frequency_penalty) {
      params.frequency_penalty = frequency_penalty;
    }

    if (presence_penalty) {
      params.presence_penalty = presence_penalty;
    }

    let response = await openai.chat.completions.create(params);
    let replyContent = response.choices[0].message.content;
    if (replyContent.length > 1900) {
      await interaction.editReply({
        content: `\`\`\`Instruction: ${instruction}\nPrompt: ${prompt}\`\`\``,
        files: [
          {
            attachment: Buffer.from(replyContent),
            name: "reply.txt",
            description: "The full reply to the prompt",
          },
        ],
      });
    } else {
      await interaction.editReply({
        content: `\`\`\`Instruction: ${instruction}\nPrompt: ${prompt}\n\n\n${replyContent}\`\`\``,
      });
    }
  } catch (error) {
    logError(error);
    await interaction.reply({
      content: "An error occurred when running this command",
      ephemeral: true,
    });
  }
};
