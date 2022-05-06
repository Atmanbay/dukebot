const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageAttachment } = require("discord.js");

module.exports = class {
  constructor(services) {
    this.emojiKitchenService = services.emojiKitchen;
    this.guildService = services.guild;
    this.messageActionService = services.messageAction;
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

    let path = await this.emojiKitchenService.fetchEmoji(a, b);
    if (path) {
      let { buttons } = this.messageActionService.createGenericButton({
        label: "Save",
        onClick: (int) => {
          let emojiName = this.emojiKitchenService.getCombinedEmojiName(a, b);
          this.guildService.addEmoji(path, emojiName);

          int.reply({
            content: `Emoji saved as \`:${emojiName}:\``,
            ephemeral: true,
          });
        },
      });

      let buttonRow = this.messageActionService.createMessageActionRow(buttons);

      let attachment = new MessageAttachment(path);
      interaction.reply({
        content: `${a} + ${b}`,
        files: [attachment],
        components: [buttonRow],
      });
    } else {
      interaction.reply({
        content: "That emoji combo does not exist",
        ephemeral: true,
      });
    }
  }
};
