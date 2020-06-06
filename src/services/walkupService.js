export default class WalkupService {
  constructor(container) {
    this.db = container.databaseService.get('walkups');
    // this.guildMembers = container.guild.members; TODO
  }

  shouldHandle(user) {
    return this.guildMembers.cache.some(guildMember => guildMember.id === user.id);
  }

  getWalkup(userId) {
    let dbUser = this.db.find({ id: userId });
    if (!dbUser.value()) {
      return;
    }

    return dbUser.value().clip;
  }

  saveWalkup(walkup) {
    this.removeWalkup(walkup.id);
    this.db.push(walkup).write();
  }

  removeWalkup(userId) {
    this.db.remove({ id: userId }).write();
  }
}