export default class {
  constructor(services) {
    this.guildService = services.guild;
    this.loggingService = services.logging;

    let handlers = services.file.getClasses("./*.handler.js", __dirname);

    this.stateHandlers = Object.values(handlers);
  }

  async handle(oldState, newState) {
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

      this.stateHandlers.forEach((stateHandler) =>
        stateHandler.handle({ oldState, newState })
      );
    } catch (error) {
      this.loggingService.error(error, oldState, newState);
    }
  }
}
