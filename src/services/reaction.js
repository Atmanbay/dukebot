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
          id: messageId,
        })
        .write();

      cachedMessage = this.db.find({ id: messageId });
      created = true;
    }

    return {
      cachedMessage: cachedMessage,
      created: created,
    };
  }
}
