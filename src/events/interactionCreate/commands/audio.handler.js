const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const download = require("download");
const sanitize = require("sanitize-filename");

module.exports = class {
  constructor(services) {
    this.audioService = services.audio;
    this.configService = services.config;
    this.fileService = services.file;
    this.tableService = services.table;
    this.loggingService = services.logging;
    this.walkupService = services.walkup;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("audio")
      .setDescription("Execute audio-related commands")
      .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List all audio clips")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("upload")
          .setDescription("Upload a new audio clip")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("What to name the audio clip")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("play")
          .setDescription("Play a specified audio clip")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of audio clip to play")
              .setRequired(true)
          )
          .addChannelOption((option) =>
            option.setName("channel").setDescription("Channel to play clip in")
          )
      )
      .addSubcommandGroup((subcommandGroup) =>
        subcommandGroup
          .setName("walkup")
          .setDescription("Set an audio clip to be your walkup")
          .addSubcommand((subsubcommand) =>
            subsubcommand
              .setName("set")
              .setDescription("Set a walkup")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("Name of audio clip to set as walkup")
                  .setRequired(true)
              )
          )
          .addSubcommand((subsubcommand) =>
            subsubcommand.setName("delete").setDescription("Clear your walkup")
          )
      );
  }

  async execute(interaction) {
    console.log(interaction.options.getSubcommand());
    switch (interaction.options.getSubcommand()) {
      case "list":
        await this.list(interaction);
        break;
      case "upload":
        await this.upload(interaction);
        break;
      case "play":
        await this.play(interaction);
        break;
      case "set":
        await this.setWalkup(interaction);
        break;
      case "delete":
        await this.deleteWalkup(interaction);
        break;
    }
    // console.log(interaction);
    // if (args.list) {
    //   await this.list(message);
    //   return;
    // }
    // if (args.upload) {
    //   await this.upload(message);
    //   return;
    // }
    // await this.play(message, args);
  }

  async list(interaction) {
    interaction.reply({
      content: "Listing is not yet supported",
      ephemeral: true,
    });
    // let clips = this.audioService.getClips();

    // let buffer = 5;
    // let columnWidth = Math.max(...clips.map((c) => c.length)) + buffer;
    // let halfway = Math.ceil(clips.length / 2);
    // let leftColumn = clips.splice(0, halfway);

    // let rows = [];
    // for (let i = 0; i < halfway; i++) {
    //   let row = [leftColumn.shift(), clips.shift()];

    //   rows.push(row);
    // }

    // let columnWidths = [columnWidth, columnWidth];
    // let response = this.tableService.build(columnWidths, rows);

    // // response.unshift("```");
    // // response.push("```");
    // // interaction.reply({ content: response.join("\n"), ephemeral: true });

    // // console.log(response);

    // let cutoff = 10;
    // let chunkedResponses = [];
    // while (response.length) {
    //   chunkedResponses.push(response.splice(0, cutoff));
    // }

    // chunkedResponses.forEach((chunkedResponse) => {
    //   chunkedResponse.unshift("```");
    //   chunkedResponse.push("```");
    //   interaction.followUp({ content: chunkedResponse, ephemeral: true });
    // });
  }

  async upload(interaction) {
    interaction.channel.messages.fetch({ limit: 25 }).then((messages) => {
      let fromUser = messages.find(
        (message) =>
          message.author.id == interaction.member.id &&
          message.attachments &&
          message.attachments.size == 1
      );

      if (fromUser) {
        let url = fromUser.attachments.first().url;
        let options = {
          filename: `${sanitize(interaction.options.getString("name"))}.mp3`,
        };
        download(url, this.configService.paths.audio, options);
        interaction.reply({
          content: `Successfully uploaded ${options.filename}`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: "Please upload an audio file and then call this command",
          ephemeral: true,
        });
      }
    });
  }

  async play(interaction) {
    let clipName = interaction.options.getString("name");
    let audioChannel = interaction.options.getChannel("channel");

    let path = this.fileService.getPath(
      this.configService.paths.audio,
      `${clipName}.mp3`
    );

    if (!path || !fs.existsSync(path)) {
      return;
    }

    let channel = audioChannel ?? interaction.member.voice.channel;
    if (!channel) {
      return;
    }

    interaction.reply({ content: `Playing ${clipName}!`, ephemeral: true });
    await this.audioService.play(path);
    await this.audioService.connect(channel);
    await this.audioService.execute();
  }

  async setWalkup(interaction) {
    let clipName = interaction.options.getString("name");
    let path = this.fileService.getPath(
      this.configService.paths.audio,
      `${clipName}.mp3`
    );

    if (!path || !fs.existsSync(path)) {
      interaction.reply({
        content: "Could not find the specified audio clip",
        ephemeral: true,
      });
      return;
    }

    this.walkupService.saveWalkup({
      id: interaction.member.id,
      clip: clipName,
    });

    interaction.reply({
      content: `Walkup set to ${clipName}`,
      ephemeral: true,
    });
  }

  async deleteWalkup(interaction) {
    this.walkupService.removeWalkup(interaction.member.id);
    interaction.reply({
      content: "Walkup deleted!",
      ephemeral: true,
    });
  }
};
