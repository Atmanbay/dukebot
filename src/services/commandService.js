import { find } from "lodash";
import minimist from "minimist";

export default class CommandService {
  constructor(container) {
    this.configService = container.configService;
    this.loggerService = container.loggerService;
    this.messageHistoryService = container.messageHistoryService;
    this.usageService = container.usageService;
    this.commands = container.commands;
  }

  async handle(message) {
    if (!this.shouldHandle(message)) {
      this.messageHistoryService.save(message.author.id, message.content);
      return false;
    }

    let content = message.content.substring(this.configService.prefix.length);
    let matches = [...content.matchAll(/\s?(.*?)\s?(\||$)/g)];
    let commands = matches.map((m) => m[1]).filter((m) => m);

    commands
      .reduce(
        (p, c) => p.then((context) => this.handleCommand(message, c, context)),
        Promise.resolve()
      )
      .then((context) => {
        if (context && context.message) {
          message.channel.send(context.message);
        }
      });
  }

  shouldHandle(message) {
    return message.content.startsWith(this.configService.prefix);
  }

  async handleCommand(message, content, context) {
    console.log({
      content,
      context,
    });
    let parsedMessage = this.parseMessage(content);
    let command = this.getCommand(parsedMessage.commandName);

    if (!command) {
      return false;
    }

    if (context) {
      Object.assign(parsedMessage.args, context.args);
    }

    return this.executeCommand(command, message, parsedMessage.args);
  }

  parseMessage(content) {
    // split on spaces (but keep quoted text together)
    let regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let matches = [...content.matchAll(regex)];

    let argArray = [];
    for (let i = 0; i < matches.length; i++) {
      let match = matches[i];
      if (!match) continue;

      // If this match was quoted then retrieve the first group which will not include the quotes
      if (match[1]) argArray.push(match[1]);
      // otherwise retrieve the entire match
      else argArray.push(match[0]);
    }

    // pass args into minimist which will convert it to an object
    // e.g. -a test -b "hello there" -> { a: test, b: hello there }
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
    return find(this.commands, (command) => {
      return command.isMatch(commandName);
    });
  }

  async executeCommand(command, message, args) {
    if (command.details.args) {
      let validation = command.details.args.validate(args);
      if (validation.error) {
        await message.channel.send(validation.error.toString());
        return null;
      } else {
        args = validation.value;
      }
    }

    try {
      let context = await command.execute(message, args);
      this.usageService.logCommandUse(command.details.name);
      return context;
    } catch (error) {
      this.loggerService.error(
        `Error when executing command ${commandName}`,
        args,
        error
      );
    }
  }
}
