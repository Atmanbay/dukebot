export default class MessageHandler {
  constructor(container) {
    this.event = 'message';
    this.loggerService = container.loggerService;
    this.commandService = container.commandService;
    this.triggerService = container.triggerService;
    this.guildService = container.guildService;
    this.banService = container.banService;
  }

  async handle(message) {
    try {
      if (message.author.bot) {
        return;
      }
  
      // Only respond to event if it occurred in the guild this handler is responsible for
      if (!this.guildService.isThisGuild(message.guild)) {
        return;
      }
  
      // Other side of the $ban command
      if (this.banService.isBanned(message.author.id)) {
        return;
      }
  
      // Handles commands before triggers
      let wasHandled = await this.commandService.handle(message);
      if (!wasHandled) {
        this.triggerService.handle(message);
      }
      
    } catch (error) {
      this.loggerService.error(error, message);
    }
  }
}