const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("alive")
      .setDescription("Check if bot is currently running");
  }

  execute(interaction) {
    interaction.reply({ content: "I'm alive!", ephemeral: true });
  }
};
