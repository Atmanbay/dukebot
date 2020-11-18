export default class GuildMemberUpdateHandler {
  constructor(container) {
    this.event = "guildMemberUpdate";
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
  }

  async handle(oldMember, newMember) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (
      !this.guildService.isThisGuild(oldMember.guild) ||
      this.guildService.isDm()
    ) {
      return;
    }

    this.guildService.addEmoji(
      newMember.user.id,
      newMember.user.avatar,
      newMember.nickname
    );
  }
}
