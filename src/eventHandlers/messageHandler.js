import EventHandler from '../structures/eventHandler';
import DatabaseService from '../services/databaseService';
import MessageStoreService from '../services/messageStoreService';

export default class MessageHandler extends EventHandler {
  constructor(options) {
    super();
    this.event = 'message';
    this.databaseService = options.databaseService || new DatabaseService();
    this.loggerService = options.loggerService || null;
    this.messageStoreService = new MessageStoreService();
  }

  handle(message) {
    if (message.content.split(' ').length < 3) {
      return;
    }

    let database = this.databaseService.get(message.guild.id);

    try {
      this.messageStoreService.store(message.author.id, message.content, database);  
    } catch (error) {
      this.loggerService.error('Error when trying to store message', message.author.id, message.content, error);
    }
    
  }
}