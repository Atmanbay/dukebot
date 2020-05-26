export default class JobsService {
  constructor(services) {
    this.db = services.databaseService.get('jobs');
    this.guildMembers = services.guild.members;
    this.loggerService = services.loggerService;
  }

  getJobs(user) {
    let jobCount = this.db.find({ id: user.id }).value();
    return this.guildMembers.fetch(user.id).then((guildUser) => {
      let nickname = guildUser.nickname || guildUser.user.username;
      let goodJobs = 0;
      let badJobs = 0;
      if (jobCount) {
        goodJobs = jobCount.counts.good;
        badJobs = jobCount.counts.bad;
      }
      
      return Promise.resolve({
        nickname: nickname,
        goodJobs: goodJobs,
        badJobs: badJobs
      });
    });
  }

  resolveJobs(jobs, type) {
    let users = this.convertToArray(jobs);
    let jobResults = {};
    if (users.length === 0)
      return jobResults;
    
    users.forEach((user) => {
      let dbUser = this.db.find({ id: user.user.id });
      if (isEmpty(dbUser.value())) {
        this.db
          .push({
            id: user.user.id,
            counts: {
              good: 0,
              bad: 0
            }
          })
          .write();
      }

      dbUser
        .update(`counts.${type}`, count => count + 1)
        .write();        

      let nickname = user.nickname || user.user.username;
      jobResults[nickname] = this.db.find({ id: user.user.id }).value().counts[type];
    });

    return jobResults;
  }

  convertToArray(users) {
    if (!users) {
      return [];
    } else if (Array.isArray(users)) {
      return users;
    } else {
      return [ users ];
    }
  }
}