import { Command } from "../../../types/discord/command.js";

const Vote: Command = {
  name: "vote",
  description: "Returns a greeting",
  run: async (interaction) => {
    const content = "I'm alive!";

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};

export default Vote;
