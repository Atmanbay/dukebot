import { find } from 'lodash';
import minimist from 'minimist';
import EventHandler from '../structures/eventHandler';
import DatabaseService from '../services/databaseService';
import LoaderService from '../services/loaderService';
import ConversionService from '../services/conversionService';

export default class CommandManager extends EventHandler {
  constructor(options) {
    super();
    this.event = 'message';
    this.commands = LoaderService.load(`${__dirname}/../commands`);

    this.prefix = options.prefix || null;
    this.databaseService = options.databaseService || new DatabaseService();
    this.loggerService = options.loggerService || null;
  }

  handle(message) {
    if (!this.shouldHandle(message)) {
      return;
    }

    this.parseMessage(message)
      .then(this.executeCommand.bind(this))
  }

  shouldHandle(message) {
    return message.content.startsWith(this.prefix);
  }

  parseMessage(message) {
    let content = message.content.substring(this.prefix.length);
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

    return this.convertArguments(args, message.guild)
      .then((convertedArgs) => {
        return {
          originalMessage: message,
          commandName: commandName,
          args: convertedArgs
        }
      })
  }

  convertArguments(args, guild) {
    let conversionManager = new ConversionService(guild);
    let promises = Object.keys(args).map(key => {
      let argument = args[key];
      if (Array.isArray(argument)) {
        let arrayPromises = argument.map(argument => {
          return conversionManager.convert(argument);
        });

        return Promise.all(arrayPromises).then((newArrayValues) => {
          return [key, newArrayValues];
        })
      } else {
        return conversionManager.convert(argument).then((newValue) => {
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
    let database = this.databaseService.get(parsedMessage.originalMessage.guild.id);

    try {
      command.execute(parsedMessage.originalMessage, parsedMessage.args, database);
    } catch (error) {
      this.loggerService.error(parsedMessage.commandName, error)
    }
  }
}