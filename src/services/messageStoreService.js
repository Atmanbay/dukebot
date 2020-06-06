import { isEmpty } from 'lodash';

export default class MessageStoreService {
  constructor(container) {
    this.messageHistoryCount = container.configService.messageHistoryCount;
    this.db = container.databaseService.get('messages');
    // this.guildMembers = container.guild.members; TODO
    this.loggerService = container.loggerService;
  }

  shouldHandle(authorId) {
    return this.guildMembers.cache.some(guildMember => guildMember.id === authorId);
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