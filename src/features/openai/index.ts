import axios from "axios";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
} from "discord.js";
import OpenAI from "openai";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ImageGenerateParams,
} from "openai/resources/index.js";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { BaseDatabaseObject } from "../../database/models";
import config from "../../utils/config.js";

type PaywallBalance = BaseDatabaseObject & {
  userId: string;
  balance: number; // balance in cents
};

const paywallBalances = await getSingletonTable<PaywallBalance>(
  "paywallBalances"
);

const client = new OpenAI();

const getBufferFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "utf-8");
};

const moderate = async (input: string): Promise<string[]> => {
  const response = await client.moderations.create({
    input: input,
  });

  let categories = response.results[0].categories;
  let failedCategories = [];
  Object.keys(categories).forEach((key) => {
    let value: boolean = categories[key];
    if (value) {
      failedCategories.push(key);
    }
  });

  return failedCategories;
};

const getBalance = (userId: string) => {
  let balance = paywallBalances.get((pb) => pb.userId === userId);
  if (balance) {
    return balance.balance;
  }

  return 0;
};

const addBalance = async (userId: string, amount: number) => {
  let balance = paywallBalances.get((pb) => pb.userId === userId);
  balance.balance = balance.balance + amount;
  await paywallBalances.update(balance);
};

const dalle2Handler = async (interaction: ChatInputCommandInteraction) => {
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
    case "256x256":
      params.size = "256x256";
      break;
    case "512x512":
      params.size = "512x512";
      break;
    case "1024x1024":
      params.size = "1024x1024";
      break;
  }

  const response = await client.images.generate(params);
  const buffer = await getBufferFromUrl(response.data[0].url);

  await interaction.editReply({
    content: prompt,
    files: [buffer],
  });
};

const dalle3Handler = async (interaction: ChatInputCommandInteraction) => {
  let balance = getBalance(interaction.user.id);
  if (balance <= 0) {
    await interaction.reply({
      content: "You have no balance!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

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

  const response = await client.images.generate(params);
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
};

const chatGptHandler = async (interaction: ChatInputCommandInteraction) => {
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
  const frequency_penalty = interaction.options.getNumber("frequency_penalty");
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

  let response = await client.chat.completions.create(params);
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
};

const balanceAddHandler = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  if (
    !(interaction.member as GuildMember).roles.cache.has(config.roles.botOwner)
  ) {
    await interaction.editReply({
      content: "You must be the bot owner",
    });
    return;
  }

  const amount = interaction.options.getNumber("amount");
  let user = interaction.options.getMentionable("user");
  let guildMembers: GuildMember[] = [];
  if (!user) {
    guildMembers = [interaction.member as GuildMember];
  } else if ((user as Role).members) {
    guildMembers = Array.from((user as Role).members.values());
  } else {
    guildMembers = [user as GuildMember];
  }

  let promises = guildMembers.map(async (gm) => {
    let balance = paywallBalances.get((pb) => pb.userId == gm.user.id);
    if (balance) {
      balance.balance += amount;
      return [gm.nickname ?? gm.user.username, balance.balance] as const;
    } else {
      await paywallBalances.create({
        userId: gm.user.id,
        balance: amount,
      });
      return [gm.nickname ?? gm.user.username, amount] as const;
    }
  });

  let results = await Promise.all(promises);
  let response = "```";
  response += results
    .map((r) => {
      return `${r[0]}: ${r[1]}`;
    })
    .join("\n");
  response += "```";

  await interaction.editReply({
    content: response,
  });
};

const balanceCheckHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  let balance = getBalance(interaction.user.id);

  await interaction.reply({
    content: `\`${balance}\``,
  });
};

const openai: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "openai",
      description: "Interact with OpenAI's text or DALL-E engines",
      options: [
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "image",
          description: "Interact with OpenAI's DALL-E model",
          options: [
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "dall-e-2",
              description: "Create an image with OpenAI's DALL-E 2 model",
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
                  description:
                    "The size of the generated image (default is 1024x1024)",
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
            },
            {
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
                  description: "Quality of the result (default is standard)",
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
                    "Style of the image. Vivid leans hyper-real and dramatic, natural is open-ended (default is vivid)",
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
                  description:
                    "Size of the generated image (default is 1024x1024)",
                  choices: [
                    {
                      name: "1024x1024",
                      value: "1024x1024",
                    },
                    {
                      name: "1792x1024",
                      value: "1792x1024",
                    },
                    {
                      name: "1024x1792",
                      value: "1024x1792",
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
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "balance",
          description: "Interact with OpenAI balance",
          options: [
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "add",
              description: "Add to balance (bot owner only)",
              options: [
                {
                  type: ApplicationCommandOptionType.Mentionable,
                  name: "user",
                  description: "The user/role to add the balance to",
                  required: true,
                },
                {
                  type: ApplicationCommandOptionType.Number,
                  name: "amount",
                  description: "The amount to add",
                  required: true,
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "check",
              description: "Check balance",
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "text",
          description: "Interact with OpenAI's text model",
          options: [
            {
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
            },
          ],
        },
      ],
    });

    loaders.chatInput.load({
      commandTree: ["openai", "image", "dall-e-2"],
      handler: dalle2Handler,
    });
    loaders.chatInput.load({
      commandTree: ["openai", "image", "dall-e-3"],
      handler: dalle3Handler,
    });
    loaders.chatInput.load({
      commandTree: ["openai", "text", "completion"],
      handler: chatGptHandler,
    });
    loaders.chatInput.load({
      commandTree: ["openai", "balance", "add"],
      handler: balanceAddHandler,
    });
    loaders.chatInput.load({
      commandTree: ["openai", "balance", "check"],
      handler: balanceCheckHandler,
    });
  },
};

export default openai;
