import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.SubcommandGroup,
  name: "balance",
  description: "Interact with OpenAI balance",
  options: [],
};
