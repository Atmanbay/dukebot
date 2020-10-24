import Command from '../objects/command';
import joi from 'joi';

export default class HelpCommand extends Command {
  constructor(container) {
    super();
    this.helpService = container.helpService;
    this.details = {
      name: 'help',
      description: 'Get help',
      args: joi.object({
        name: joi
          .string()
          .note('Name of command to get help with')
      })
        .rename('n', 'name')
    };
  }

  execute(message, args) {
    let response = [];
    if (args.name) {
      response = this.helpService.getCommandHelpMessage(args.name);
    } else {
      response = this.helpService.getBotHelpMessage();
    }

    return {
      message: response,
      args: {
        text: response
      }
    }
  }
}