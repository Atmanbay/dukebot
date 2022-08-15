import { Command } from "../index.js";

const Alive: Command = {
  name: "alive",
  description: "Returns a greeting",
  run: async (interaction) => {
    const content = "I'm alive!";

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};

export default Alive;
