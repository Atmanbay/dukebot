import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.SubcommandGroup,
  name: "line",
  description: "Open a line with the provided description and choices",
};
