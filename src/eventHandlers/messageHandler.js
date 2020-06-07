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

    if (!message.guild || message.guild.id !== this.guildService.guild.id) {
      return;
    }

    if (this.banService.isBanned(message.author.id)) {
      return;
    }

    this.commandService.handle(message).then((wasHandled) => {
      if (!wasHandled) {
        this.triggerService.handle(message);
      }
    });
  }
}