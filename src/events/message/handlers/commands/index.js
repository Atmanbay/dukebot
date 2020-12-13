import { find } from "lodash";
import minimist from "minimist";

export default class {
  constructor(services) {
    this.banService = services.ban;
    this.configService = services.config;
    this.helpService = services.help;
    this.loggingService = services.logging;
    this.messageHistoryService = services.messageHistory;
    this.usageService = services.usage;
    this.fileService = services.file;

    let classes = services.file.getClasses("handlers/*.js", __dirname);
    let commands = [];

    Object.keys(classes).forEach((commandName) => {
      let names = [commandName];
      let command = classes[commandName];
      if (command.details.aliases) {
        names.push(...command.details.aliases);
      }

      commands.push({
        names: names,
        command: command,
      });
    });

    this.commands = commands;
  }

  async handle(message) {
    if (!this.shouldHandle(message)) {
      this.messageHistoryService.save(message.author.id, message.content, 3);
      return false;
    }

    // Other side of the $ban command
    if (this.banService.isBanned(message.author.id)) {
      return;
    }

    let content = message.content.substring(this.configService.prefix.length);
    let matches = [...content.matchAll(/\s?(.*?)\s?(\||$)/g)];
    let commands = matches.map((m) => m[1]).filter((m) => m);

    let result = await commands
      .reduce(
        (p, c) => p.then((context) => this.handleCommand(message, c, context)),
        Promise.resolve()
      )
      .then((context) => {
        if (context && context.message) {
          message.channel.send(context.message);
        }

        return true;
      })
      .catch((error) => {
        this.loggingService.error(error);
        return false;
      });

    return result;
  }

  shouldHandle(message) {
    return message.content.startsWith(this.configService.prefix);
  }

  async handleCommand(message, content, context) {
    let parsedMessage = this.parseMessage(content);
    let command = this.getCommand(parsedMessage.commandName);

    if (!command) {
      return false;
    }

    if (context) {
      Object.assign(parsedMessage.args, context.args);
    }

    return this.executeCommand(command, message, parsedMessage);
  }

  parseMessage(content) {
    // split on spaces (but keep quoted text together)
    let regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let matches = [...content.matchAll(regex)];

    let argArray = [];
    for (let i = 0; i < matches.length; i++) {
      let match = matches[i];
      if (!match) {
        continue;
      }

      // If this match was quoted then retrieve the first group which will not include the quotes
      if (match[1]) {
        argArray.push(match[1]);
      } else {
        // otherwise retrieve the entire match
        argArray.push(match[0]);
      }
    }

    // pass args into minimist which will convert it to an object
    // e.g. -a test -b "hello there" -> { a: test, b: "hello there" }
    // this arg object is what is passed into the commands
    let args = minimist(argArray);
    let commandName = args._[0];
    delete args._;

    return {
      commandName,
      args,
    };
  }

  getCommand(commandName) {
    let command = find(this.commands, (command) => {
      return command.names.includes(commandName);
    });

    if (command) {
      return command.command;
    } else {
      return null;
    }
  }

  async executeCommand(command, message, parsedMessage) {
    let args = parsedMessage.args;
    if (args.help === true) {
      return this.helpService.commandHelp(parsedMessage.commandName, command);
    }

    if (command.details.args) {
      try {
        let validation = await command.details.args.validateAsync(args);
        args = validation;
      } catch (error) {
        await message.channel.send(error.toString());
        return null;
      }
    }

    try {
      let context = await command.execute({ message, args });
      this.usageService.logCommandUse(parsedMessage.commandName);
      return context;
    } catch (error) {
      this.loggingService.error(error);
    }
  }
}
