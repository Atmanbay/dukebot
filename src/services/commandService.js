import { find } from 'lodash';
import minimist from 'minimist';

export default class CommandService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.conversionService = container.conversionService;
    this.configService = container.configService;
    this.databaseService = container.databaseService;
    this.commands = container.commands;
  }

  handle(message) {
    if (!this.shouldHandle(message)) {
      return Promise.resolve(false);
    }

    return this.parseMessage(message)
      .then(this.executeCommand.bind(this))
  }

  shouldHandle(message) {
    return message.content.startsWith(this.configService.prefix);
  }

  parseMessage(message) {
    // Trim command prefix from beginning and then split on spaces (but keep quoted text together)
    let content = message.content.substring(this.configService.prefix.length);
    let regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let matches = [...content.matchAll(regex)];

    let argArray = [];
    for(let i = 0; i < matches.length; i++) {
      let match = matches[i];
      if (!match)
        continue;
      
      // If this match was quoted then retrieve the first group which will not include the quotes
      if (match[1])
        argArray.push(match[1]);
      else // otherwise retrieve the entire match
        argArray.push(match[0]);
    }

    // pass args into minimist which will convert it to an object
    // e.g. -a test -b "hello there" -> { a: test, b: hello there }
    // this arg object is what is passed into the commands
    let args = minimist(argArray);
    let commandName = args._[0];
    delete args._;

    return this.convertArguments(args)
      .then((convertedArgs) => {
        return [
          commandName,
          message,
          convertedArgs
        ];
      })
  }

  // converts any mentioned user or channel from the ID to the actual object itself
  async convertArguments(args) {
    let conversionService = this.conversionService;
    let promises = Object.keys(args).map(async function(key) {
      let oldValue = args[key];
      if (Array.isArray(oldValue)) {
        let arrayPromises = oldValue.map(async function(value) {
          return await conversionService.convert(value);
        });

        return await Promise.all(arrayPromises).then((newValues) => {
          return [key, newValues];
        })
      } else {
        let newValue = await conversionService.convert(oldValue);
        return [key, newValue];
      }
    });

    return await Promise.all(promises).then((newArgs) => {
      return Object.fromEntries(newArgs);
    });;
  }

  getCommand(commandName) {
    return find(this.commands, (command) => {
      return command.isMatch(commandName);
    });
  }

  executeCommand([commandName, message, args]) {
    let command = this.getCommand(commandName);
    if (!command) {
      return false;
    }

    try {
      command.execute(message, args);
    } catch (error) {
      this.loggerService.error(`Error when executing command ${commandName}`, args, error);
    }

    return true;
  }
}