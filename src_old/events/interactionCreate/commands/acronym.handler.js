const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  constructor(services) {
    this.acronymService = services.acronym;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("acronym")
      .setDescription("Create an acronym for a given word/phrase")
      .addStringOption((option) =>
        option
          .setName("text")
          .setDescription("Text to acronymize")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    let text = interaction.options.getString("text");
    let acronymizedText = await this.acronymService.acronymize(text);

    acronymizedText.unshift("```");
    acronymizedText.push("```");

    interaction.reply({ content: acronymizedText.join("\n") });
  }
};
