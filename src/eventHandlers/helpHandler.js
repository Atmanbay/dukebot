export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.helpService = container.helpService;
  }

  handle(message) {
    this.helpService.handle(message);
  }
}