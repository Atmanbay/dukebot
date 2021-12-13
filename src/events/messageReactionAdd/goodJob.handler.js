module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.reactionService = services.reaction;
    this.jobsService = services.jobs;
  }

  shouldHandle(messageReaction) {
    return messageReaction.emoji.name === this.configService.emojis.goodJob;
  }

  async handle(messageReaction, user) {
    let authorId = messageReaction.message.author.id;
    let reactorId = user.id;
    if (authorId === reactorId) {
      return;
    }

    let reactionName = messageReaction.emoji.name;

    let messageId = messageReaction.message.id;
    this.reactionService.findOrCreate(messageId);

    if (this.reactionService.hasUser(messageId, reactionName, reactorId)) {
      return;
    }

    this.reactionService.addUser(messageId, reactionName, reactorId);
    this.jobsService.addJob(authorId, 1);
  }
};
