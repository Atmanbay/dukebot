import { find } from 'lodash';
import minimist from 'minimist';

export default class CommandService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.conversionService = container.conversionService;
    this.configService = container.configService;
    this.commands = container.commands;
  }

  handle(message) {
    if (!this.shouldHandle(message)) {
      return;
    }

    this.parseMessage(message)
      .then(this.executeCommand.bind(this))
  }

  shouldHandle(message) {
    return message.content.startsWith(this.configService.commands.prefix);
  }

  parseMessage(message) {
    let content = message.content.substring(this.configService.commands.prefix.length);
    let regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let matches = [...content.matchAll(regex)];

    let argArray = [];
    for(let i = 0; i < matches.length; i++) {
      let match = matches[i];
      if (!match)
        continue;
      
      if (match[1])
        argArray.push(match[1]);
      else
        argArray.push(match[0]);
    }

    let args = minimist(argArray);
    let commandName = args._[0];
    delete args._;

    return this.convertArguments(args)
      .then((convertedArgs) => {
        return {
          originalMessage: message,
          commandName: commandName,
          args: convertedArgs
        }
      })
  }

  convertArguments(args) {
    let conversionService = this.conversionService;
    let promises = Object.keys(args).map(key => {
      let argument = args[key];
      if (Array.isArray(argument)) {
        let arrayPromises = argument.map(argument => {
          return conversionService.convert(argument);
        });

        return Promise.all(arrayPromises).then((newArrayValues) => {
          return [key, newArrayValues];
        })
      } else {
        return conversionService.convert(argument).then((newValue) => {
          return [key, newValue];
        });
      }
    });

    return Promise.all(promises).then((newArgs) => {     
      return Object.fromEntries(newArgs);
    });
  }

  getCommand(commandName) {
    return find(this.commands, (command) => {
      return command.isMatch(commandName);
    });
  }

  executeCommand(parsedMessage) {
    let command = this.getCommand(parsedMessage.commandName);
    if (!command) {
      return;
    }

    try {
      command.execute(parsedMessage.originalMessage, parsedMessage.args);
    } catch (error) {
      this.loggerService.error(parsedMessage.commandName, error);
    }
  }
}