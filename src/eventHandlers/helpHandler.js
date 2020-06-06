export default class HelpHandler {
  constructor(container) {
    this.event = 'message';
    this.helpService = container.helpService;
  }

  handle(message) {
    this.helpService.handle(message);
  }
}