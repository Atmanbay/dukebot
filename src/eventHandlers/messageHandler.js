export default class MessageHandler {
  constructor(services) {
    this.event = 'message';
    this.commandService = services.commandService;
    this.triggerService = services.triggerService;
  }

  handle(message) {
    this.commandService.handle(message);
    this.triggerService.handle(message);
  }
}