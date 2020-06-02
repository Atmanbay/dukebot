export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.commandService = container.commandService;
    this.triggerService = container.triggerService;
  }

  handle(message) {
    if (message.author.bot) {
      return;
    }

    this.commandService.handle(message).then((result) => {
      if (!result) {
        this.triggerService.handle(message);
      }
    });
  }
}