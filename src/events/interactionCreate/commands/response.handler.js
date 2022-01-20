const { SlashCommandBuilder } = require("@discordjs/builders");
const emojiRegex = require("emoji-regex");

module.exports = class {
  constructor(services) {
    this.responseService = services.response;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("response")
      .setDescription("Add, modify, or delete a trigger")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set")
          .setDescription("Add or modify a trigger/response pair")
          .addStringOption((option) =>
            option
              .setName("trigger")
              .setDescription("Word/phrase that will trigger the response")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("response")
              .setDescription(
                "Phrase or emoji that the bot will respond with (separate multiple responses with |)"
              )
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("delete")
          .setDescription("Delete a given trigger")
          .addStringOption((option) =>
            option
              .setName("trigger")
              .setDescription("Word/phrase trigger to delete")
              .setRequired(true)
          )
      );
  }

  execute(interaction) {
    let subcommand = this[interaction.options.getSubcommand()];
    if (subcommand) {
      subcommand.bind(this)(interaction);
    }
  }

  set(interaction) {
    let trigger = interaction.options.getString("trigger");
    let response = interaction.options.getString("response");

    let responses = response
      .split("|")
      .map((r) => this.parseResponse(r.trim()));

    this.responseService.save({
      trigger,
      responses,
    });

    interaction.reply({
      content: `Response set for ${trigger}`,
      ephemeral: true,
    });
  }

  parseResponse(value) {
    let response = {};

    let isEmoji = emojiRegex();
    let emojiMatch = isEmoji.exec(value);
    if (emojiMatch) {
      let emoji = emojiMatch[0];
      response.value = emoji;
      response.type = "emoji";
      return response;
    }

    let isCustomEmoji = RegExp("<:(.*?):(.*?)>");
    let customEmojiMatch = value.match(isCustomEmoji);
    if (customEmojiMatch) {
      let customEmojiId = customEmojiMatch[2];
      response.value = customEmojiId;
      response.type = "customEmoji";
      return response;
    }

    if (typeof value === "string") {
      response.value = value;
      response.type = "string";
      return response;
    }

    return {};
  }

  delete(interaction) {
    let trigger = interaction.options.getString("trigger");
    this.responseService.delete(trigger);

    interaction.reply({
      content: `Response deleted for ${trigger}`,
      ephemeral: true,
    });
  }
};
