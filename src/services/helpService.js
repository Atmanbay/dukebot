export default class HelpService {
  constructor(container) {
    this.commands = [];
  }

  shouldHandle(message) {
    return this.commandService.shouldHandle(message);
  }

  handle(message) {
    if (!this.shouldHandle(message)) {
      return;
    }

    this.commandService
      .parseMessage(message)
      .then((parsedMessage) => {
        if (parsedMessage.commandName !== 'help') {
          return;
        }

        let args = parsedMessage.args;

        if (args.n) {
          let command = this.commandService.getCommand(args.n);
          if (!command) {
            message.channel.send(`${args.n} could not be found`);
          } else {
            let commandDetails = command.details;
            let response = [];
            response.push(`**Name:** ${args.n}`);
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
    
            message.channel.send(response, { split: true });
          }
        } else {
          let commands = this.commandService.commands;
          let commandNames = commands.map(command => command.details.name).join(', ');
    
          let response = [];
          response.push('Here\'s a list of all of my commands:');
          response.push(commandNames);
          response.push('To learn more about a command use $help -n {command name}');
    
          message.channel.send(response, { split: true });
        }
      });
  }
}