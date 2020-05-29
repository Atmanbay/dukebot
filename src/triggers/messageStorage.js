import Trigger from '../objects/trigger';

export default class MessageStoreTrigger extends Trigger {
  constructor(services) {
    super();

    this.messageStoreService = services.messageStoreService;

    this.details = {
      description: 'Store all messages (to be used in markov etc.)'
    };
  }

  isMatch() {
    return true;
  }

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