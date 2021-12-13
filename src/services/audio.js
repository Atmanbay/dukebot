const fs = require("fs");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.loggingService = services.logging;
    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });
    this.connection = null;
  }

  async connect(channel) {
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      debug: true,
      selfDeaf: false,
    });

    await entersState(this.connection, VoiceConnectionStatus.Ready, 30e3);
  }

  async disconnect() {
    if (
      this.connection &&
      this.connection.state.status !== VoiceConnectionStatus.Destroyed
    ) {
      this.connection.destroy();
    }
  }

  async play(path) {
    let resource = createAudioResource(path);
    this.player.play(resource);

    await entersState(this.player, AudioPlayerStatus.Playing, 5e3);
  }

  async execute() {
    this.player.on(AudioPlayerStatus.Idle, () => this.disconnect());
    this.player.on("error", () => this.disconnect());

    this.connection.subscribe(this.player);
  }

  // // Path can be a file path or a URL
  // async play(path, channel) {
  //   if (!channel) {
  //     return;
  //   }

  //   let logging = this.loggingService;
  //   let connection = await channel.join();
  //   let dispatcher = connection.play(path);
  //   dispatcher.on("finish", () => {
  //     connection.disconnect();
  //   });

  //   dispatcher.on("error", logging.error);
  // }

  getClips() {
    let files = [];
    fs.readdirSync(this.configService.paths.audio).forEach((file) => {
      files.push(file.replace(".mp3", ""));
    });

    return files;
  }
};
