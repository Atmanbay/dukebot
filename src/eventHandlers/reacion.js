import { find } from "lodash";

export default class MessageHandler {
  constructor(container) {
    this.event = "messageReactionAdd";
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;

    this.reactionHandlers = container.reactions;
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
