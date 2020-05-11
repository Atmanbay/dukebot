import EventHandler from '../structures/eventHandler';
import CommandManager from '../managers/commandManager';
import MessageStore from '../managers/messageStore';
import Commands from '../commands';

export default class MessageHandler extends EventHandler {
  constructor(config) {
    super();
    this.event = 'message';
    let commandManager = new CommandManager(config);

    Commands.forEach((command) => {
      commandManager.addCommand(command.default);
    });

    this.commandManager = commandManager;
    this.messageStore = new MessageStore();
  }

  handle(message) {
    this.messageStore.store(message.author.id, message.content);

    if (message.author.bot)
      return;
      
    this.commandManager.resolveMessage(message);
  }
}