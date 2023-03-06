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
