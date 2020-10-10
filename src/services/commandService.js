import { find } from 'lodash';
import minimist from 'minimist';

export default class CommandService {
  constructor(container) {
    this.configService = container.configService;
    this.loggerService = container.loggerService;
    this.usageService = container.usageService;
    this.commands = container.commands;
  }

  async handle(message) {
    if (!this.shouldHandle(message)) {
      return false;
    }

    try {
      let parsedMessage = this.parseMessage(message);
      let command = this.getCommand(parsedMessage.commandName);
      if (!command) {
        return false;
      }

      return this.executeCommand(command, message, parsedMessage.args);
    } catch (error) {
      this.loggerService.error(error);
      return true;
    }
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

    return {
      commandName,
      args
    };
  }

  getCommand(commandName) {
    return find(this.commands, (command) => {
      return command.isMatch(commandName);
    });
  }

  async executeCommand(command, message, args) {
    if (command.details.args) {
      let validation = command.details.args.validate(args);
      if (validation.error) {
        await message.channel.send(validation.error.toString());
        return true;
      } else {
        args = validation.value;
      }
    }

    try {
      await command.execute(message, args);
      this.usageService.logCommandUse(command.details.name);
    } catch (error) {
      console.log(error);
      this.loggerService.error(`Error when executing command ${commandName}`, args, error);
    }

    return true;
  }
}