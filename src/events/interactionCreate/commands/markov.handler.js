const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  constructor(services) {
    this.markovService = services.markov;
    this.loggingService = services.logging;
    this.messageHistoryService = services.messageHistory;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("markov")
      .setDescription(
        "Generate a markov for the specified user/role (defaults to caller)"
      )
      .addMentionableOption((option) =>
        option
          .setName("target")
          .setDescription("The user/role to use as the basis for the markov")
          .setRequired(false)
      );
  }

  async execute(interaction) {
    let target = interaction.options.getMentionable("target");
    let userIds = [];
    if (!target) {
      userIds = [interaction.member.id];
    } else if (target.members) {
      userIds = target.members.mapValues((user) => user.id);
    } else {
      userIds = [target.user.id];
    }

    let promises = userIds.map(async (userId) => {
      return this.messageHistoryService.fetchMessages(userId);
    });

    let messages = await Promise.all(promises).then((arrays) => arrays.flat());

    let markov = this.markovService.buildMarkov({
      messages: messages,
      stateSize: 2,
      maxTries: 200,
      variance: 1,
    });

    interaction.reply(markov);
  }
};
