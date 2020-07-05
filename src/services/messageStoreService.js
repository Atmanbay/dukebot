import { isEmpty } from 'lodash';

export default class MessageStoreService {
  constructor(container) {
    this.messageHistoryCount = 0;
    this.db = container.databaseService.get('messages');
    this.loggerService = container.loggerService;
  }

  store(authorId, message) {
    // Stores users messages for use in the markov command
    // TODO: Replace with a service that retrieves cached messages
    let dbUser = this.db.find({ id: authorId });
    let messages = [];

    if (isEmpty(dbUser.value())) {
      this.db
        .push({
          id: authorId,
          messages: []
        })
        .write();
    } else {
      messages = dbUser.value().messages;
    }

    while (messages.length >= this.messageHistoryCount) {
      messages.shift();
    }

    messages.push(message);

    this.db
      .find({ id: authorId })
      .assign({ messages: messages })
      .write();
  }
}