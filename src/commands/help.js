import Command from '../objects/command';

export default class HelpCommand extends Command {
  constructor(container) {
    super();
    this.helpService = container.helpService;
    this.details = {
      name: 'help',
      description: 'Get help',
    };
  }

  execute(message, args) {
    let response = [];
    if (args.n) {
      response = this.helpService.getCommandHelpMessage(args.n);
    } else {
      response = this.helpService.getBotHelpMessage();
    }

    message.channel.send(response);
  }
}