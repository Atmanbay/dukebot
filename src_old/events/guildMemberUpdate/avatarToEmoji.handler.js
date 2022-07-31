module.exports = class {
  constructor(services) {
    this.guildService = services.guild;
  }

  handle({ oldMember, newMember }) {
    this.guildService.deleteEmoji(oldMember.nickname);
    this.guildService.addAviEmoji(
      newMember.user.id,
      newMember.user.avatar,
      newMember.nickname
    );
  }
};
