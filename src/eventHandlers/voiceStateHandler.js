export default class VoiceStateHandler {
  constructor(container) {
    this.event = 'voiceStateUpdate';
    this.walkupService = container.walkupService;
    this.conversionService = container.conversionService;
    this.audioService = container.audioService;
  }

  handle(oldState, newState) {
    return;
    if (!newState.channelID) {
      return;
    }

    let walkup = this.walkupService.getWalkup(newState.id);
    if (!walkup) {
      return;
    }

    this.conversionService.getChannel(newState.channelID).then((channel) => {
      if (!channel) {
        console.log('y');
        return;
      }
      this.audioService.play(walkup, channel);
    });
  }
}