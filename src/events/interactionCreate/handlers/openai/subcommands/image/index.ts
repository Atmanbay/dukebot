import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.SubcommandGroup,
  name: "image",
  description: "Interact with OpenAI's DALL-E model",
};
