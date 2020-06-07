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

    this.commandService.handle(message).then((wasHandled) => {
      if (!wasHandled) {
        this.triggerService.handle(message);
      }
    });
  }
}