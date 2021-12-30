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

  async play(channel, path) {
    let connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      debug: true,
      selfDeaf: false,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      let resource = createAudioResource(path);
      this.player.play(resource);
      this.player.on(AudioPlayerStatus.Idle, () => this.disconnect(connection));
      this.player.on("error", () => this.disconnect(connection));
      connection.subscribe(this.player);
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  }

  async disconnect(connection) {
    if (
      connection &&
      connection.state.status !== VoiceConnectionStatus.Destroyed
    ) {
      connection.destroy();
    }
  }

  getClips() {
    let files = [];
    fs.readdirSync(this.configService.paths.audio).forEach((file) => {
      files.push(file.replace(".mp3", ""));
    });

    files.sort();
    return files;
  }
};
