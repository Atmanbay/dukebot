const fs = require("fs");

module.exports = class {
  constructor(services) {
    this.audioService = services.audio;
    this.configService = services.config;
    this.guildService = services.guild;
    this.walkupService = services.walkup;
  }

  async handle({ newState }) {
    let walkup = this.walkupService.getWalkup(newState.id);
    if (!walkup) {
      return;
    }

    let path = `${this.configService.paths.audio}/${walkup}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    let channel = this.guildService.getChannelById(newState.channelId);
    if (!channel) {
      return;
    }

    await this.audioService.play(channel, path);
  }
};
