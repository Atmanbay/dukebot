const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.buttonService = services.button;
    this.guildService = services.guild;
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

  async tweet(interaction) {
    return;
    let content = interaction.options.getString("content");

    let role = this.guildService.getRole(this.configService.roles.twitter);
    let requiredApprovals = 2;
    // let onApproval = () =>
    //   await this.twitterService
    //     .tweet(content)
    //     .then((apiResponse) => this.postUrl(interaction, apiResponse));

    let onApproval = () => console.log(content);

    let { button, messageContent } = this.buttonService.register({
      author: interaction.member,
      role,
      requiredApprovals,
      onApproval,
    });

    let componentRow = this.buttonService.createMessageActionRow(button);
    let embed = new MessageEmbed().setDescription(content);

    await interaction.reply({
      content: messageContent,
      components: [componentRow],
      embeds: [embed],
    });
  }

  async reply(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let name = match[1];
    let tweetId = match[2];

    await this.twitterService
      .tweet(`@${name} ${content}`, tweetId)
      .then((apiResponse) => this.postUrl(interaction, apiResponse));
  }

  async retweet(interaction) {
    return;
    let url = interaction.options.getString("URL");

    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = url.match(regex);

    let tweetId = match[2];

    await this.twitterService
      .retweet(tweetId)
      .then((apiResponse) => this.postUrl(interaction, apiResponse));
  }

  async quotetweet(interaction) {
    return;
    let url = interaction.options.getString("URL");
    let content = interaction.options.getString("content");

    await this.twitterService
      .tweet(`${content} ${url}`)
      .then((apiResponse) => this.postUrl(interaction, apiResponse));
  }

  async postUrl(interaction, apiResponse) {
    return;
    console.log(apiResponse);
  }
};
