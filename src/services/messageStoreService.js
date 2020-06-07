import { isEmpty } from 'lodash';

export default class MessageStoreService {
  constructor(container) {
    this.messageHistoryCount = container.configService.messageHistoryCount;
    this.db = container.databaseService.get('messages');
    this.loggerService = container.loggerService;
  }

  store(authorId, message) {
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