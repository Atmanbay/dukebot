import { ChatInputApplicationCommandData } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import config from "../../../../utils/config.js";

export const data: ChatInputApplicationCommandData = {
  name: "openai",
  description: "Interact with OpenAI's text or DALL-E engines",
};

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: config.openAI.apiKey,
  })
);

export const moderate = async (input: string) => {
  const moderationResponse = await openai.createModeration({ input: input });

  let categories = moderationResponse.data.results[0].categories;
  let failedCategories = [];
  Object.keys(categories).forEach((key) => {
    let value: boolean = categories[key];
    if (value) {
      failedCategories.push(key);
    }
  });

  return failedCategories;
};
