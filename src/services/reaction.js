import { some } from "lodash";

export default class {
  constructor(services) {
    this.db = services.database.get("reactedMessages");
  }

  findOrCreate(messageId) {
    let cachedMessage = this.db.find({ id: messageId });
    let created = false;

    if (!cachedMessage.value()) {
      this.db
        .push({
          messageId: messageId,
          reactions: {},
        })
        .write();

      cachedMessage = this.db.find({ id: messageId });
      created = true;
    }

    return {
      cachedMessage,
      created,
    };
  }

  addUser(messageId, reactionName, userId) {
    let cachedMessage = this.db.find({ messageId: messageId });
    if (!cachedMessage.value()) {
      return;
    }

    cachedMessage
      .update("reactions", (reactions) => {
        if (!(reactionName in reactions)) {
          reactions[reactionName] = [];
        }

        reactions[reactionName].push(userId);
        return reactions;
      })
      .write();
  }

  hasUser(messageId, reactionName, userId) {
    let ele = some(
      this.db.value(),
      (entry) =>
        entry.messageId === messageId &&
        reactionName in entry.reactions &&
        entry.reactions[reactionName].includes(userId)
    );

    return ele;
  }
}
