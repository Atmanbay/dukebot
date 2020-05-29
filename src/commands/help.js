import Command from '../objects/command';

export default class HelpCommand extends Command {
  constructor(services) {
    super();
    // this.commandService = services.commands;
    this.details = {
      name: 'help',
      description: 'Get help about bot or a specific command',
      args: [{
        name: 'n',
        description: 'Name of command',
        optional: true
      }]
    };
  }

  execute(message, args) {
    // if (args.n) {
    //   let command = this.commandService.getCommand(args.n);
    //   if (!command) {
    //     message.channel.send(`${args.n} could not be found`);
    //   } else {
    //     let commandDetails = command.details;
    //     let response = [];
    //     response.push(`**${Name}:** ${args.n}`);
    //     response.push(`**${Description}:** ${commandDetails.description}`);
    //     response.push(`**${Arguments}:**`);
    //     commandDetails.args.forEach((arg) => {
    //       let argString = ` **${arg.name}:** ${arg.description}`;
    //       if (arg.optional) {
    //         argString += ' (optional)';
    //       }
    //       response.push(argString);
    //     });

    //     message.channel.send(response, { split: true });
    //   }
    // } else {
    //   let commands = this.commandService.commands;
    //   let commandNames = commands.map(command => command.name).join(', ');

    //   let response = [];
    //   response.push('Here\'s a list of all of my commands:');
    //   response.push(commandNames);

    //   message.channel.send(response, { split: true });
    // }
  }
}