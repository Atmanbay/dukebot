import { InteractionCreateHandler } from "../index.js";

const AliveInteractionCreateHandler: InteractionCreateHandler = {
  name: "alive",
  description: "Returns a greeting",
  handle: async (interaction) => {
    const content = "I'm alive!";

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};

export default AliveInteractionCreateHandler;
