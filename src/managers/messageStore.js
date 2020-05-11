import Database from '../database';
import { isEmpty } from 'lodash';

export default class MessageStore {
  constructor() {
    this.db = Database.get('messageHistory');
    this.messageHistoryCount = Database.get('config').find({ key: "messageHistoryCount" }).value().value;
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