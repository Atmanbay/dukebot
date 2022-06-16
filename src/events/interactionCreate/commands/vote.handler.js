const { SlashCommandBuilder } = require("@discordjs/builders");
const isEmpty = require("lodash/isEmpty");

const EMOJIS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

module.exports = class {
  constructor(services) {
    this.emojiKitchenService = services.emojiKitchen;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("vote")
      .setDescription("Start a vote")
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("Description of vote")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("choices")
          .setDescription("Choices to vote for, separated by |")
          .setRequired(true)
      );
  }

  async execute(interaction) {
    let description = interaction.options.getString("description");
    let choices = interaction.options.getString("choices").split("|");

    if (choices.length > EMOJIS.length) {
      interaction.reply({
        content: "Too many choices were provided",
        ephemeral: true,
      });
      return;
    }

    let content = [];
    content.push(`**${description}**`);
    content.push("");
    choices.forEach((choice, index) =>
      content.push(`:${EMOJIS[index]}:  ${choice}`)
    );

    await interaction.reply(content.join("\n"));
    let message = await interaction.fetchReply();
    EMOJIS.slice(0, choices.length).forEach((emojiName) => {
      let emoji = this.emojiKitchenService.getEmoji(emojiName);
      message.react(`${emoji.emoji}`);
    });
  }
};
