module.exports = class {
  constructor(services) {
    this.db = services.database.get("jobs");
  }

  getJobs(userId) {
    if (!userId) {
      return this.db.value();
    }
    let dbUser = this.db.find({ userId: userId }).value();
    if (!dbUser) {
      return 0;
    }

    return dbUser.jobs;
  }

  addJob(userId, amount) {
    let jobCount = this.db.find({ userId: userId });
    if (!jobCount.value()) {
      this.db
        .push({
          userId: userId,
          jobs: 0,
        })
        .write();

      jobCount = this.db.find({ userId: userId });
    }

    let jobs = 0;
    jobCount
      .update("jobs", (oldJobs) => {
        let newJobs = Number(oldJobs) + Number(amount);
        if (newJobs < 0) {
          jobs = 0;
          return 0;
        }

        jobs = newJobs;
        return newJobs;
      })
      .write();

    return {
      userId,
      jobs,
    };
  }

  setJobs(userId, amount) {
    let dbUser = this.db.find({ userId: userId });
    if (!dbUser.value()) {
      return;
    }

    dbUser.update("jobs", () => amount).write();
  }
};
