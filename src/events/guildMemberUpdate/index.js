export default class {
  constructor(services) {
    this.loggerService = services.logger;
    this.guildService = services.guild;

    let handlers = services.file.getClasses("handlers/*.js", __dirname);

    this.handlers = Object.values(handlers);
  }

  async handle(oldMember, newMember) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (
      !this.guildService.isThisGuild(oldMember.guild) ||
      this.guildService.isDm()
    ) {
      return;
    }

    try {
      this.handlers.forEach((handler) =>
        handler.handle({ oldMember, newMember })
      );
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}