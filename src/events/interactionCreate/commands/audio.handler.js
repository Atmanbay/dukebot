const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const download = require("download");
const sanitize = require("sanitize-filename");

module.exports = class {
  constructor(services) {
    this.audioService = services.audio;
    this.messageActionService = services.messageAction;
    this.configService = services.config;
    this.fileService = services.file;
    this.loggingService = services.logging;
    this.tableService = services.table;
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
  }

  async list(interaction) {
    let clips = this.audioService.getClips();

    let perChunk = 20;
    let chunkedClips = clips.reduce((all, one, i) => {
      const ch = Math.floor(i / perChunk);
      all[ch] = [].concat(all[ch] || [], one);
      return all;
    }, []);

    let onPageChange = async (buttonInteraction, newPage) => {
      let newPageTemp = [...newPage];
      let buffer = 5;
      let columnWidth = Math.max(...newPageTemp.map((c) => c.length)) + buffer;
      let halfway = Math.ceil(newPageTemp.length / 2);
      let leftColumn = newPageTemp.splice(0, halfway);

      let rows = [];
      for (let i = 0; i < halfway; i++) {
        let row = [leftColumn.shift(), newPageTemp.shift()];
        rows.push(row);
      }

      let columnWidths = [columnWidth, columnWidth];
      let response = this.tableService.build(columnWidths, rows);
      response.unshift("```");
      response.push("```");
      await buttonInteraction.update({
        content: response.join("\n"),
        ephemeral: true,
      });
    };

    let { buttons } = this.messageActionService.createPaginationButtons({
      pages: chunkedClips,
      onPageChange,
      dropdowns: [
        {
          label: "Play",
          onSelect: (int, selection) => {
            let channel = int.member.voice.channel;
            if (!channel) {
              return;
            }

            let path = this.fileService.getPath(
              this.configService.paths.audio,
              `${selection}.mp3`
            );

            if (!path || !fs.existsSync(path)) {
              return;
            }

            int.reply({ content: `Playing ${clipName}`, ephemeral: true });
            this.audioService.play(channel, path);
          },
        },
        {
          label: "Set as Walkup",
          onSelect: (int, selection) => {
            this.walkupService.saveWalkup({
              id: int.member.id,
              clip: selection,
            });

            int.reply({
              content: `Set ${clipName} as walkup`,
              ephemeral: true,
            });
          },
        },
      ],
    });
    let buttonRow = this.messageActionService.createMessageActionRow(buttons);

    let firstPage = [...chunkedClips[0]];
    let buffer = 5;
    let columnWidth = Math.max(...firstPage.map((c) => c.length)) + buffer;
    let halfway = Math.ceil(firstPage.length / 2);
    let leftColumn = firstPage.splice(0, halfway);

    let rows = [];
    for (let i = 0; i < halfway; i++) {
      let row = [leftColumn.shift(), firstPage.shift()];
      rows.push(row);
    }

    let columnWidths = [columnWidth, columnWidth];
    let response = this.tableService.build(columnWidths, rows);
    response.unshift("```");
    response.push("```");

    await interaction.reply({
      content: response.join("\n"),
      components: [buttonRow],
      ephemeral: true,
    });
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
        let rawFileName = interaction.options.getString("name");
        let options = {
          filename: `${sanitize(rawFileName)}.mp3`,
        };
        download(url, this.configService.paths.audio, options);

        let { buttons } = this.messageActionService.createGenericButton({
          label: "Set as Walkup",
          onClick: (int) => {
            console.log("here", rawFileName);
            this.walkupService.saveWalkup({
              id: int.member.id,
              clip: rawFileName,
            });

            int.reply({
              content: `Walkup set to ${rawFileName}`,
              ephemeral: true,
            });
          },
        });

        let buttonRow =
          this.messageActionService.createMessageActionRow(buttons);

        interaction.reply({
          content: `Successfully uploaded ${rawFileName}`,
          components: [buttonRow],
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
    await this.audioService.play(channel, path);
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
