import { isEmpty } from 'lodash';

export default class MessageHistoryService {
  constructor(container) {
    this.db = container.databaseService.get('messages');
    this.messageCount = container.configService.messageCount;
  }

  save( userId, message ) {
    try {
      let dbUser = this.db.find({ id: userId });
      if (isEmpty(dbUser.value())) {
        this.db
          .push({
            id: userId,
            messages: []
          })
          .write();
        
        dbUser = this.db.find({ id: userId });
      }

      dbUser
        .update(`messages`, (messages) => {
          messages.push(message);
          if (messages.length > this.messageCount) {
            messages.splice(0, (messages.length - this.messageCount));
          }

          return messages;
        })
        .write();
    } catch (error) {
      console.log(error);
    }
  }

  fetchMessages(userId) {
    let dbUser = this.db.find({ id: userId }).value();
    if (dbUser) {
      return dbUser.messages;
    } else {
      return [];
    }
  }
}