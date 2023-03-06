import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.SubcommandGroup,
  name: "walkup",
  description: "Set or clear your walkup",
};
