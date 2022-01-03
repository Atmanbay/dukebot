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
              .setRequired(true)
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
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("content")
              .setDescription("Content of the tweet you want to send")
              .setRequired(true)
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
              .setRequired(true)
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
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("content")
              .setDescription("Content of the tweet you want to send")
              .setRequired(true)
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
  }

  async run({ interaction, onSuccess, content, embedTitle }) {
    let role = this.guildService.getRole(this.configService.roles.twitter);
    let requiredApprovals = 4;

    let { buttons, messageContent } = this.buttonService.createApprovalButtons({
      role,
      requiredApprovals,
      onSuccess,
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
    }).buttons;

    let componentRow = this.buttonService.createMessageActionRow([
      ...buttons,
      ...cancelButton,
    ]);
    let embed = new MessageEmbed().setTitle(embedTitle).setDescription(content);

    await interaction.reply({
      content: messageContent,
      components: [componentRow],
      embeds: [embed],
    });
  }

  async tweet(interaction) {
    let content = interaction.options.getString("content");

    let onSuccess = (int) =>
      this.twitterService
        .tweet(content)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Send as tweet";

    this.run({ interaction, onSuccess, content, embedTitle });
  }

  async reply(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let name = match[1];
    let tweetId = match[2];

    let onSuccess = (int) =>
      this.twitterService
        .tweet(`@${name} ${content}`, tweetId)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Reply to tweet";

    this.run({ interaction, onSuccess, embedTitle });
  }

  async retweet(interaction) {
    return;
    let url = interaction.options.getString("URL");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let tweetId = match[2];

    let onSuccess = (int) =>
      this.twitterService
        .retweet(tweetId)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Retweet this tweet";

    this.run({ interaction, onSuccess, embedTitle });
  }

  async quotetweet(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    let onSuccess = (int) =>
      this.twitterService
        .tweet(`${content} ${url}`)
        .then((apiResponse) => this.postUrl(int, apiResponse));

    let embedTitle = "Quote Tweet this tweet";

    this.run({ interaction, onSuccess, embedTitle });
  }

  async postUrl(interaction, apiResponse) {
    let url = `https://twitter.com/${apiResponse.data.user.screen_name}/status/${apiResponse.data.id_str}`;
    interaction.followUp(url);
  }
};
