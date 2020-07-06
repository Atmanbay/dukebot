export default class MessageHandler {
  constructor(container) {
    this.event = 'messageReactionAdd';
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
  }

  handle(messageReaction, user) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (!this.guildService.isThisGuild(messageReaction.message.channel.guild)) {
      return;
    }

    // Haven't thought of a use case yet
  }
}