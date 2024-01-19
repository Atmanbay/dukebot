import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from "discord.js";
import { Feature } from "..";

const handler = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply({
    content: "I'm alive!",
    ephemeral: true,
  });
};

const alive: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "alive",
      description: "Returns a greeting",
    });

    loaders.chatInput.load({ commandTree: ["alive"], handler });
  },
};

export default alive;
