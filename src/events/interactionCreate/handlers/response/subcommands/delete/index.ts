import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { responses } from "../../../../../../database/database.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "delete",
  description: "Delete a trigger/response relationship based on the trigger",
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const trigger = interaction.options.getString("trigger");

  const response = responses.get((r) => r.trigger === trigger);
  if (response) {
    await responses.delete(response.id);
    interaction.reply({
      content: `Deleted response for trigger ${trigger}`,
      ephemeral: true,
    });
  } else {
    interaction.reply({
      content: `No response found for trigger ${trigger}`,
      ephemeral: true,
    });
  }
};
