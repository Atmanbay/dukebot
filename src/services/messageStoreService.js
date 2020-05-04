import config from '../../config.json';
import { isEmpty } from 'lodash';

export default class MessageStoreService {
  constructor() {
    this.messageHistoryCount = config.messageHistoryCount;
  }

  store(authorId, message, database) {
    let messagesDb = database.get('messages');
    let dbUser = messagesDb.find({ id: authorId });
    let messages = [];

    if (isEmpty(dbUser.value())) {
      messagesDb
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

    messagesDb
      .find({ id: authorId })
      .assign({ messages: messages })
      .write();
  }
}