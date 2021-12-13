module.exports = class {
  constructor(services) {
    this.loggingService = services.logging;
    this.guildService = services.guild;

    let handlers = services.file.getClasses("./*.handler.js", __dirname);

    this.reactionHandlers = Object.values(handlers);
  }

  async handle(messageReaction, user) {
    if (
      !this.guildService.isThisGuild(messageReaction.message.channel.guild.id)
    ) {
      return;
    }

    this.reactionHandlers.forEach(async (rh) => {
      if (await rh.shouldHandle(messageReaction, user)) {
        try {
          await rh.handle(messageReaction, user);
        } catch (error) {
          this.loggingService.error(error);
        }
      }
    });
  }
};
