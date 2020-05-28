import { isEmpty } from 'lodash';

export default class MessageStoreService {
  constructor(services) {
    this.messageHistoryCount = services.configService.messageHistoryCount;
    this.db = services.databaseService.get('messages');
    this.loggerService = services.loggerService;
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