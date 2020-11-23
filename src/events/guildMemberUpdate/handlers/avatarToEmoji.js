export default class {
  constructor(services) {
    this.guildService = services.guild;
  }

  handle({ newMember }) {
    this.guildService.addEmoji(
      newMember.user.id,
      newMember.user.avatar,
      newMember.nickname
    );
  }
}
