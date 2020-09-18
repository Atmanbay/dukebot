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

  async handle(oldState, newState) {
    try {
      // Keep in mind that this event is triggered on any voice status change
      // That includes entering or leaving a voice channel, muting self, etc.

      console.log('aaa');

      // Only respond to event if it occurred in the guild this handler is responsible for
      if (!this.guildService.isThisGuild(newState.member.guild)) {
        return;
      }

      console.log('bbb');

      // channelID will be blank if oldState->newState is leaving a voice channel
      if (!newState.channelID) {
        return;
      }

      console.log('ccc');

      // channelIDs will equal each other if user just deafened/muted self
      if (oldState.channelID === newState.channelID) {
        return;
      }

      console.log('ddd');

      let walkup = this.walkupService.getWalkup(newState.id);
      if (!walkup) {
        return;
      }

      console.log('eee');

      let path = `${this.configService.paths.audio}/${walkup}.mp3`;
      if (!fs.existsSync(path)) {
        return;
      }

      console.log('fff');

      let channel = await this.guildService.getChannelById(newState.channelID);
      if (!channel) {
        return;
      }

      console.log('ggg');

      this.audioService.play(path, channel);
    } catch (error) {
      console.log(error);
      this.loggerService.error(error, oldState, newState);
    }
  }
}