export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.commandService = container.commandService;
    this.triggerService = container.triggerService;
    this.guildService = container.guildService;
  }

  handle(message) {
    if (message.author.bot) {
      return;
    }

    if (!message.guild || message.guild.id !== this.guildService.guild.id) {
      return;
    }

    this.commandService.handle(message).then((wasHandled) => {
      if (!wasHandled) {
        this.triggerService.handle(message);
      }
    });
  }
}