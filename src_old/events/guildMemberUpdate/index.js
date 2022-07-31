module.exports = class {
  constructor(services) {
    this.loggingService = services.logging;
    this.guildService = services.guild;

    let handlers = services.file.getClasses("./*.handler.js", __dirname);

    this.handlers = Object.values(handlers);
  }

  async handle(oldMember, newMember) {
    if (!this.guildService.isThisGuild(oldMember.guild.id)) {
      return;
    }

    try {
      this.handlers.forEach((handler) =>
        handler.handle({ oldMember, newMember })
      );
    } catch (error) {
      this.loggingService.error(error);
    }
  }
};
