export default class {
  constructor(services) {
    this.db = services.database.get("walkups");
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
