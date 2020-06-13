export default class MessageHandler {
  constructor(container) {
    this.event = 'messageReactionAdd';
    this.guildService = container.guildService;
  }

  handle(messageReaction, user) {
    if (!this.guildService.isThisGuild(messageReaction.message.channel.guild)) {
      return;
    }

    // code goes here
  }
}