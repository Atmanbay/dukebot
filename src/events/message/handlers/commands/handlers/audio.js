import fs from "fs";
import download from "download";
import sanitize from "sanitize-filename";
import joi from "joi";

export default class {
  constructor(services) {
    this.audioService = services.audio;
    this.configService = services.config;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Play specified audio clip",
      args: joi
        .object({
          name: joi.string().note("Name of the audio clip"),

          channel: joi
            .custom(this.validatorService.channel.bind(this.validatorService))
            .note("Name of the audio channel to play the clip in"),

          list: joi.boolean().note("Flag to return a list of audio clips"),

          upload: joi
            .boolean()
            .note("Flag to start the upload process for a new clip"),
        })
        .with("channel", "name")
        .xor("name", "list", "upload")
        .rename("n", "name")
        .rename("c", "channel")
        .rename("l", "list")
        .rename("u", "upload"),
    };
  }

  async execute({ message, args }) {
    if (args.list) {
      await this.list(message);
      return;
    }

    if (args.upload) {
      await this.upload(message);
      return;
    }

    await this.play(message, args);
  }

  async list(message) {
    let clips = this.audioService.getClips();
    clips.unshift("```");
    clips.push("```");
    message.channel.send(clips);
  }

  async upload(message) {
    await message.channel.send("Please upload your file!");
    let filter = (m) => message.author.id === m.author.id;
    await message.channel
      .awaitMessages(filter, { time: 60000, max: 1, errors: ["time"] })
      .then((messages) => {
        let message = messages.first();
        let attachments = message.attachments;
        if (attachments && attachments.size === 1) {
          let url = attachments.first().url;
          let options = {};
          if (message.content) {
            options.filename = `${sanitize(message.content)}.mp3`;
          }
          download(url, this.configService.paths.audio, options);
        }
      })
      .catch(() => {
        message.channel.send("You took too long!");
      });
  }

  async play(message, args) {
    let path = `${this.configService.paths.audio}/${args.name}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    this.audioService.play(path, channel);
  }
}
