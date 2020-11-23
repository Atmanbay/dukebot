export default class {
  constructor(services) {
    this.loggerService = services.logger;
    this.guildService = services.guild;

    let handlers = services.file.getClasses("handlers/*.js", __dirname);

    this.reactionHandlers = Object.values(handlers);
  }

  async handle(messageReaction, user) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (!this.guildService.isThisGuild(messageReaction.message.channel.guild)) {
      return;
    }

    this.reactionHandlers.forEach(async (rh) => {
      if (await rh.shouldHandle(messageReaction, user)) {
        try {
          await rh.handle(messageReaction, user);
        } catch (error) {
          this.loggerService.error(error);
        }
      }
    });
  }
}
