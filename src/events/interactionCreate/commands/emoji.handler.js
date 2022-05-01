const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  constructor(services) {
    this.emojiKitchenService = services.emojiKitchen;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("emoji")
      .setDescription("Combine two emojis using Google's Emoji Kitchen")
      .addStringOption((option) =>
        option
          .setName("a")
          .setDescription("The first emoji to combine")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("b")
          .setDescription("The second emoji to combine")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    let a = interaction.options.getString("a");
    let b = interaction.options.getString("b");

    let combinedEmoji = this.emojiKitchenService.getCombinedEmoji(a, b);
    interaction.reply(combinedEmoji);
  }
};
