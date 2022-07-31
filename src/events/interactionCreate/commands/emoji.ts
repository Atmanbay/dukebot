import { Command } from "../../../types/discord/command";

const Emoji: Command = {
  name: "emoji",
  description: "Returns a greeting",
  type: "CHAT_INPUT",
  run: async (interaction) => {
    const content = "I'm alive!";

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};

export default Emoji;
