export default class {
  constructor(services) {
    this.db = services.database.get("responses");
  }

  save(responder) {
    this.delete(responder.trigger);
    this.db.push(responder).write();
  }

  delete(trigger) {
    this.db.remove({ trigger: trigger }).write();
  }

  getResponder(messageContent) {
    let lowerContent = messageContent.toLowerCase();
    let responder = this.db.find((responder) => {
      try {
        let regex = new RegExp(`\\b${responder.trigger.toLowerCase()}\\b`);
        return lowerContent.match(regex);
      } catch (error) {
        return false;
      }
    });

    return responder.value();
  }
}
