export default class MessageHandler {
  constructor(services) {
    this.event = 'message';
    this.commandService = services.resolve('commandService');
    this.triggerService = services.resolve('triggerService');
  }

  handle(message) {
    this.commandService.handle(message);
    this.triggerService.handle(message);
  }
}