const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.buttonService = services.button;
    this.guildService = services.guild;
    this.twitterService = services.twitter;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("twitter")
      .setDescription("Tweet, reply, retweet, or quote tweet on Twitter.com")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("tweet")
          .setDescription("Tweet something")
          .addStringOption((option) =>
            option
              .setName("content")
              .setDescription("Content of the tweet you want to send")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("reply")
          .setDescription("Reply to a given tweet")
          .addStringOption((option) =>
            option
              .setName("url")
              .setDescription("URL of the tweet you want to reply to")
          )
          .addStringOption((option) =>
            option
              .setName("content")
              .setDescription("Content of the tweet you want to send")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("retweet")
          .setDescription("Retweet a given tweet")
          .addStringOption((option) =>
            option
              .setName("url")
              .setDescription("URL of the tweet you want to reply to")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("quotetweet")
          .setDescription("Quote tweet a given tweet")
          .addStringOption((option) =>
            option
              .setName("url")
              .setDescription("URL of the tweet you want to quote tweet")
          )
          .addStringOption((option) =>
            option
              .setName("content")
              .setDescription("Content of the tweet you want to send")
          )
      );
  }

  async execute(interaction) {
    if (!this.configService.useTwitter) {
      interaction.reply({
        content: "Twitter functionality is disabled",
        ephemeral: true,
      });
      return;
    }

    let subcommand = this[interaction.options.getSubcommand()];
    if (subcommand) {
      await subcommand.bind(this)(interaction);
    }

    // switch (interaction.options.getSubcommand()) {
    //   case "tweet":
    //     await this.tweet(interaction);
    //     break;
    //   case "reply":
    //     await this.reply(interaction);
    //     break;
    //   case "retweet":
    //     await this.retweet(interaction);
    //     break;
    //   case "quotetweet":
    //     await this.quotetweet(interaction);
    //     break;
    // }
  }

  async yes({ interaction, onApproval, embedTitle }) {
    let role = this.guildService.getRole(this.configService.roles.twitter);
    let requiredApprovals = 4;

    let { button, messageContent } = this.buttonService.createRoleButton({
      role,
      requiredApprovals,
      onApproval,
    });
    let cancelButton = this.buttonService.createAuthorButton({
      author: interaction.member.id,
      onClick: (int) =>
        int.update({
          content: "This action has been cancelled by the caller",
          components: [],
        }),
      label: "Cancel",
      style: "DANGER",
    }).button;

    let componentRow = this.buttonService.createMessageActionRow(
      button,
      cancelButton
    );
    let embed = new MessageEmbed().setTitle(embedTitle).setDescription(content);

    await interaction.reply({
      content: messageContent,
      components: [componentRow],
      embeds: [embed],
    });
  }

  async tweet(interaction) {
    let content = interaction.options.getString("content");

    let onApproval = (int) =>
      this.twitterService
        .tweet(content)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Send as tweet";

    this.yes({ interaction, onApproval, embedTitle });
  }

  async reply(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let name = match[1];
    let tweetId = match[2];

    let onApproval = (int) =>
      this.twitterService
        .tweet(`@${name} ${content}`, tweetId)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Reply to tweet";

    this.yes({ interaction, onApproval, embedTitle });
  }

  async retweet(interaction) {
    return;
    let url = interaction.options.getString("URL");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let tweetId = match[2];

    let onApproval = (int) =>
      this.twitterService
        .retweet(tweetId)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Retweet this tweet";

    this.yes({ interaction, onApproval, embedTitle });
  }

  async quotetweet(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    let onApproval = (int) =>
      this.twitterService
        .tweet(`${content} ${url}`)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Quote Tweet this tweet";

    this.yes({ interaction, onApproval, embedTitle });
  }

  async postUrl(interaction, apiResponse) {
    let url = `https://twitter.com/${apiResponse.data.user.screen_name}/status/${apiResponse.data.id_str}`;
    interaction.followUp(url);
  }
};
