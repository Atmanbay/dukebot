import { find } from 'lodash';

export default class HelpService {
  constructor(container) {
    // These commands are being populated in bot.buildGuildContainer
    // Cannot be passed in due to circular reference
    this.commands = [];
    this.configService = container.configService;
    this.loggerService = container.loggerService;
  }

  getBotHelpMessage() {
    let commandNames = this.commands.map(command => command.details.name).join(', ');

    let response = [];
    response.push('Here\'s a list of all of my commands:');
    response.push(commandNames);
    response.push(`To learn more about a command use ${this.configService.prefix}help --name {command name}`);

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
      response.push(`**Arguments:** (all arguments can be called with just their first letter as well)`);
      let keys = commandDetails.args.$_terms.keys;
      keys.forEach((key) => {
        try {
          let schema = key.schema;

        let argument = {
          name: key.key
        };

        if (schema._flags.presence && schema._flags.presence === 'required') {
          argument.required = true;
        }

        if (schema.$_terms.notes && schema.$_terms.notes.length) {
          argument.notes = schema.$_terms.notes[0];
        }

        let argumentString = `   - **${argument.name}:** ${argument.notes}`;
        if (argument.required) {
          argumentString += ' (required)';
        }
        response.push(argumentString);
        } catch (error) {
          this.loggerService.error(error);
        }
      });
    }

    return response;
  }
}