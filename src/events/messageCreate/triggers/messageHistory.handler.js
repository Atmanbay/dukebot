module.exports = class {
  constructor(services) {
    this.messageHistoryService = services.messageHistory;
  }

  get details() {
    return {
      description: "Trigger that handles custom responses",
    };
  }

  isMatch() {
    return true;
  }

  execute(message) {
    this.messageHistoryService.save(message.author.id, message.content, 3);
  }
};
