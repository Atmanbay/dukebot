import Trigger from '../structures/trigger';

export default class MessageStoreTrigger extends Trigger {
  constructor(services) {
    super();

    this.messageStoreService = services.messageStoreService;

    this.details = {
      description: 'Store all messages (to be used in markov etc.)'
    };
  }

  isMatch(message) {
    return true;
  }

  execute(message) {
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