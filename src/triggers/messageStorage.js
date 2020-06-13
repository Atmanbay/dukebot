import Trigger from '../objects/trigger';

export default class MessageStoreTrigger extends Trigger {
  constructor(container) {
    super();
    this.messageStoreService = container.messageStoreService;
    this.details = {
      description: 'Store all messages (to be used in markov etc.)'
    };
  }

  isMatch() {
    return true;
  }

  // Stores every message for use by markov
  execute(message) {
    if (message.content.split(' ').length < 3) {
      return;
    }

    try {
      this.messageStoreService.store(message.author.id, message.content);  
    } catch (error) {
      this.loggerService.error('Error when trying to store message', message.author.id, message.content, error);
    }
  }
}