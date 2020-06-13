import { find } from 'lodash';

export default class HelpService {
  constructor() {
    // These commands are being populated in bot.buildGuildContainer
    // Cannot be passed in due to circular reference
    this.commands = [];
  }

  getBotHelpMessage() {
    let commandNames = this.commands.map(command => command.details.name).join(', ');

    let response = [];
    response.push('Here\'s a list of all of my commands:');
    response.push(commandNames);
    response.push('To learn more about a command use $help -n {command name}');

    return response;
  }

  getCommandHelpMessage(commandName) {
    let command = find(this.commands, (command) => {
      return command.isMatch(commandName);
    });

    if (!command) {
      return [ `No command named ${commandName} could be found` ];
    }

    let commandDetails = command.details;
    let response = [];
    response.push(`**Name:** ${commandName}`);
    response.push(`**Description:** ${commandDetails.description}`);
    if (commandDetails.args) {
      response.push(`**Arguments:**`);
      commandDetails.args.forEach((arg) => {
        let argString = `   **${arg.name}:** ${arg.description}`;
        if (arg.optional) {
          argString += ' (optional)';
        }
        response.push(argString);
      });
    }

    return response;
  }
}