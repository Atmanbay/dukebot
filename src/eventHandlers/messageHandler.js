export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.commandService = container.commandService;
    this.triggerService = container.triggerService;
  }

  handle(message) {
    this.commandService.handle(message);
    this.triggerService.handle(message);
  }
}