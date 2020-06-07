import Command from '../objects/command';

export default class HelpCommandf extends Command {
  constructor(container) {
    super();
    this.helpService = container.helpService;
    this.details = {
      name: 'help',
      description: 'Get help',
    };
  }

  execute(message, args) {
  }
}