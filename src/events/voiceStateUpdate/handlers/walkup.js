import fs from "fs";

export default class {
  constructor(services) {
    this.audioService = services.audio;
    this.configService = services.config;
    this.guildService = services.guild;
    this.walkupService = services.walkup;
  }

  handle({ newState }) {
    let walkup = this.walkupService.getWalkup(newState.id);
    if (!walkup) {
      return;
    }

    let path = `${this.configService.paths.audio}/${walkup}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    let channel = this.guildService.getChannelById(newState.channelID);
    if (!channel) {
      return;
    }

    this.audioService.play(path, channel);
  }
}
