import fs from 'fs';

export default class VoiceStateHandler {
  constructor(container) {
    this.event = 'voiceStateUpdate';
    this.configService = container.configService;
    this.guildService = container.guildService;
    this.walkupService = container.walkupService;
    this.audioService = container.audioService;
  }

  handle(oldState, newState) {
    if (!newState.channelID) {
      return;
    }

    if (oldState.channelID === newState.channelID) {
      return;
    }

    if (!this.guildService.isThisGuild(newState.member.guild)) {
      return;
    }

    let walkup = this.walkupService.getWalkup(newState.id);
    if (!walkup) {
      return;
    }

    let path = `${this.configService.directories.audio}/${walkup}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    this.guildService.getChannel(newState.channelID).then((channel) => {
      if (!channel) {
        return;
      }

      this.audioService.play(path, channel);
    });
  }
}