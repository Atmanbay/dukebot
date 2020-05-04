import EventHandler from '../structures/eventHandler';
import CommandManager from '../managers/commandManager';
import Commands from '../commands';

export default class MessageHandler extends EventHandler {
  constructor(config) {
    super();
    this.event = 'message';
    let commandManager = new CommandManager(config);

    Commands.forEach((command) => {
      commandManager.addCommand(new command.default());
    });

    this.commandManager = commandManager;
  }

  handle(message) {
    if (message.author.bot)
      return;
      
    this.commandManager.resolveMessage(message);
  }
}