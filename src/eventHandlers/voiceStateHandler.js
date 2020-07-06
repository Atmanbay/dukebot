import fs from 'fs';

export default class VoiceStateHandler {
  constructor(container) {
    this.event = 'voiceStateUpdate';
    this.loggerService = container.loggerService;
    this.configService = container.configService;
    this.guildService = container.guildService;
    this.walkupService = container.walkupService;
    this.audioService = container.audioService;
  }

  handle(oldState, newState) {
    try {
      // Keep in mind that this event is triggered on any voice status change
      // That includes entering or leaving a voice channel, muting self, etc.

      // Only respond to event if it occurred in the guild this handler is responsible for
      if (!this.guildService.isThisGuild(newState.member.guild)) {
        return;
      }

      // channelID will be blank if oldState->newState is leaving a voice channel
      if (!newState.channelID) {
        return;
      }

      // channelIDs will equal each other if user just deafened/muted self
      if (oldState.channelID === newState.channelID) {
        return;
      }

      let walkup = this.walkupService.getWalkup(newState.id);
      if (!walkup) {
        return;
      }

      let path = `${this.configService.paths.audio}/${walkup}.mp3`;
      if (!fs.existsSync(path)) {
        return;
      }

      this.guildService.getChannel(newState.channelID).then((channel) => {
        if (!channel) {
          return;
        }

        this.audioService.play(path, channel);
      });
    } catch (error) {
      this.loggerService(error, oldState, newState);
    }
  }
}