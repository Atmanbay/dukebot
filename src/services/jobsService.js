import { isEmpty } from 'lodash';

export default class JobsService {
  constructor(container) {
    this.db = container.databaseService.get('jobs');
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
  }

  async getJobs(user) {
    let jobCount = this.db.find({ id: user.id }).value();
    let guildUser = this.guildService.getUser(user.id);
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
  }

  resolveJobs(users, type, authorUserId) {
    let jobResults = {};
    if (!Array.isArray(users)) {
      users = [users];
    }
    users.forEach((user) => {
      try {
        if (authorUserId && user.user.id === authorUserId) {
          return;
        }
  
        if (!user.user || !user.user.id) {
          this.loggerService.error('No user or userId for the following user', user)
          return;
        }
  
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
      } catch (error) {
        this.loggerService.error(error, user);
        return;
      }
    });

    return jobResults;
  }
}