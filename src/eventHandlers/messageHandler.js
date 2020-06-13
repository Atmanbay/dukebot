export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.commandService = container.commandService;
    this.triggerService = container.triggerService;
    this.guildService = container.guildService;
    this.banService = container.banService;
  }

  handle(message) {
    if (message.author.bot) {
      return;
    }

    // Only respond to event if it occurred in the guild this handler is responsible for
    if (!this.guildService.isThisGuild(message.guild)) {
      return;
    }

    // Other side of the $ban command
    if (this.banService.isBanned(message.author.id)) {
      return;
    }

    // Handles commands before triggers
    this.commandService.handle(message).then((wasHandled) => {
      if (!wasHandled) {
        this.triggerService.handle(message);
      }
    });
  }
}