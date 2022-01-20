const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  constructor(services) {
    this.defineService = services.define;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("define")
      .setDescription("Use Urban Dictionary to define a given word")
      .addStringOption((option) =>
        option
          .setName("text")
          .setDescription("Word/phrase to define")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    let text = interaction.options.getString("text");
    let definition = await this.defineService.define(text);

    let response = [
      `**${text}**`,
      "",
      definition.definition,
      "",
      `_${definition.example}_`,
    ];

    interaction.reply({ content: response.join("\n") });
  }
};
