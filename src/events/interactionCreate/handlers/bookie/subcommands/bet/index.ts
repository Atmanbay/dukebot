import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.SubcommandGroup,
  name: "bet",
  description: "Open a line with the provided description and choices",
};
